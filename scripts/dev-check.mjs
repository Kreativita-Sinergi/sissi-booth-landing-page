#!/usr/bin/env node
// Cek otomatis dashboard /admin & /dashboard di server `next dev` (AGENTS.md §3):
// tiap halaman dibuka di Chrome headless (desktop 1440 & ponsel 390), lalu dikumpulkan
// jumlah issue panel Next, error/peringatan konsol, exception, teks galat, dan luapan horizontal.
// Di akhir, `.next/dev/logs/next-development.log` diperiksa (baris ERROR baru sejak cek dimulai).
//
// Pakai (server dev & API lokal sudah menyala):
//   DEV_CHECK_ADMIN="email:sandi" DEV_CHECK_OWNER="email:sandi" node scripts/dev-check.mjs [http://localhost:3000]
// Kredensial hanya dari env (jangan ditulis di repo). Peran tanpa kredensial dilewati (dicatat).
// Env lain: CHROME_PATH (default Chrome macOS), DEV_CHECK_WAIT (ms tunggu per halaman, default 6000).
// Keluar 1 bila ada masalah.

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const wait = Number(process.env.DEV_CHECK_WAIT ?? 6000);
const chromePath = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- daftar halaman dari src/app (grup "(panel)" dibuang; [id] diisi dari tautan di halaman induk) ---
function pages(area) {
  const out = [];
  const walk = (dir, url) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const seg = /^\(.*\)$/.test(e.name) ? url : `${url}/${e.name}`;
      const full = path.join(dir, e.name);
      if (fs.existsSync(path.join(full, "page.tsx"))) out.push(seg);
      walk(full, seg);
    }
  };
  walk(path.join(root, "src/app", area), `/${area}`);
  return out.filter((p) => !p.endsWith("/masuk")).sort();
}

// --- Chrome headless lewat DevTools Protocol ---
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "dev-check-"));
const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(chromePath, [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--headless=new", "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: "ignore" });
// Tutup Chrome lalu hapus profil sementara (tunggu proses keluar agar folder tidak sedang ditulisi).
const finish = async (code) => {
  const exited = new Promise((r) => (chrome.exitCode !== null ? r() : chrome.once("exit", r)));
  chrome.kill();
  await Promise.race([exited, sleep(5000)]);
  try {
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {
    // profil sementara di folder tmp sistem; aman bila tertinggal
  }
  process.exit(code);
};

let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json()).catch(() => null);
}
if (!target) {
  console.error(`Chrome tidak bisa dijalankan (${chromePath}). Atur CHROME_PATH.`);
  await finish(1);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
let seq = 0;
const pending = {};
let logs = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (pending[m.id]) {
    pending[m.id](m.result ?? m.error);
    delete pending[m.id];
  }
  if (m.method === "Runtime.consoleAPICalled" && (m.params.type === "error" || m.params.type === "warning"))
    logs.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 300)}`);
  if (m.method === "Runtime.exceptionThrown") logs.push(`exception: ${(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text).slice(0, 300)}`);
};
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++seq;
    pending[i] = r;
    ws.send(JSON.stringify({ id: i, method, params }));
  });
await new Promise((r) => (ws.onopen = r));
await send("Page.enable");
await send("Runtime.enable");
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.value;
const viewport = (w) => send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 600 });
const go = async (url) => {
  await send("Page.navigate", { url: base + url });
  await sleep(wait);
};

const ISSUES = `(()=>{const h=document.querySelector('nextjs-portal');if(!h||!h.shadowRoot)return 0;const m=h.shadowRoot.textContent.replace(/\\s+/g,' ').match(/(\\d+)\\s*Issues?/i);return m?Number(m[1]):0;})()`;
const ERRTEXT = `(document.body.innerText.match(/Unhandled Runtime Error|Application error|Server Error|Internal Server Error/)||[''])[0]`;
const setValue = (sel, v) =>
  `(()=>{const el=document.querySelector(${JSON.stringify(sel)});const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(el,${JSON.stringify(v)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`;

async function login(area, cred) {
  const i = cred.indexOf(":");
  await viewport(1440);
  await go(`/${area}/masuk`);
  await ev(setValue("input[name=email]", cred.slice(0, i)));
  await ev(setValue("input[name=password]", cred.slice(i + 1)));
  await ev(`document.querySelector('form button[type=submit]').click()`);
  await sleep(wait);
  return (await ev("location.pathname")) === `/${area}`;
}

const logFile = path.join(root, ".next/dev/logs/next-development.log");
const logStart = fs.existsSync(logFile) ? fs.statSync(logFile).size : 0;
const problems = [];

for (const [area, env] of [
  ["admin", "DEV_CHECK_ADMIN"],
  ["dashboard", "DEV_CHECK_OWNER"],
]) {
  const cred = process.env[env];
  if (!cred) {
    console.log(`(lewati /${area}: ${env} belum diisi)`);
    continue;
  }
  if (!(await login(area, cred))) {
    problems.push(`/${area}: gagal masuk (cek ${env} & API lokal)`);
    continue;
  }
  const filled = {};
  for (const p of pages(area)) {
    let url = p;
    if (p.includes("[")) {
      const parent = p.slice(0, p.indexOf("/["));
      url = filled[parent];
      if (!url) {
        console.log(`${p.padEnd(34)} (lewati: belum ada data untuk dibuka)`);
        continue;
      }
    }
    for (const w of [1440, 390]) {
      logs = [];
      await viewport(w);
      await go(url);
      const issues = await ev(ISSUES);
      const err = await ev(ERRTEXT);
      const overflow = await ev(`document.documentElement.scrollWidth - ${w}`);
      const bad = [issues ? `${issues} issue Next` : "", err, overflow > 0 ? `luapan ${overflow}px` : "", ...logs].filter(Boolean);
      console.log(`${url.padEnd(34)} ${String(w).padStart(4)}  ${bad.length ? "✗ " + bad.join(" | ") : "ok"}`);
      if (bad.length) problems.push(`${url} @${w}: ${bad.join(" | ")}`);
    }
    // Tautan detail pertama untuk halaman dinamis anak (mis. /admin/pelanggan/[id]).
    filled[url] = await ev(`(()=>{const a=[...document.querySelectorAll('a[href^="${url}/"]')].map(a=>a.getAttribute('href')).find(h=>/^${url.replace(/\//g, "\\/")}\\/[^/?#]+$/.test(h));return a||null;})()`);
  }
}

if (fs.existsSync(logFile)) {
  const fresh = fs.readFileSync(logFile, "utf8").slice(logStart);
  const errors = fresh.split("\n").filter((l) => l.includes("ERROR"));
  for (const l of errors.slice(0, 10)) problems.push(`log dev: ${l.slice(0, 300)}`);
  console.log(`log dev: ${errors.length} ERROR baru`);
}

ws.close();
console.log(problems.length ? `\n${problems.length} masalah:\n- ${problems.join("\n- ")}` : "\nSemua halaman bersih.");
await finish(problems.length ? 1 : 0);
