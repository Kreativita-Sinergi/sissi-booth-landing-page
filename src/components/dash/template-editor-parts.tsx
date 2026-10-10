"use client";

/* eslint-disable @next/next/no-img-element -- gambar bingkai lokal (object URL) / server file. */
import { useEffect, useRef, useState } from "react";
import { Download, Info, Loader2 } from "lucide-react";
import { cn } from "@/components/shared/cn";
import { closestFormat, defaultSlots, findGreen, FORMAT_KEYS, FORMATS, SAFE } from "@/lib/dash/template";
import type { TemplateFormat } from "@/lib/dash/types";
import { Button } from "./client";

/** Bagian pendukung editor template: unggah & atur gambar, saran bingkai, pemilih format, komponen kecil. */

export type Frame = { src: string; width: number; height: number; file?: File };
/** Gambar asli yang diunggah (disimpan agar posisinya bisa diatur ulang). */
export type Source = { img: HTMLImageElement; url: string; name: string; png: boolean };
/** Pengaturan "Atur gambar": gambar diletakkan di kanvas ukuran cetak (piksel kanvas), zoom 1 = memenuhi kanvas. */
export type Adjust = { src: Source; format: TemplateFormat; zoom: number; ox: number; oy: number; bg: string | null };
export type Ask = { src: Source; reasons: string[]; format: TemplateFormat };

export const ACCEPT = ["image/png", "image/jpeg", "image/webp"];

/**
 * Masker CSS: hanya bagian TRANSPARAN bingkai yang terlihat (untuk mewarnai lubang foto sesuai bentuk aslinya,
 * termasuk bentuk tidak beraturan).
 */
export const holeMask = (src: string): React.CSSProperties => {
  const img = `linear-gradient(#000, #000), url("${src}")`;
  return { maskImage: img, WebkitMaskImage: img, maskSize: "100% 100%", WebkitMaskSize: "100% 100%", maskComposite: "exclude", WebkitMaskComposite: "xor" };
};
const BG_CHOICES: { label: string; value: string | null }[] = [
  { label: "Transparan", value: null },
  { label: "Putih", value: "#ffffff" },
  { label: "Hitam", value: "#000000" },
];
export const mb = (n: number) => (n / 1024 / 1024).toLocaleString("id-ID", { maximumFractionDigits: 1 });
/** Skala agar gambar memenuhi (cover) atau muat utuh (contain) di kanvas W×H. */
export const coverScale = (W: number, H: number, w: number, h: number) => Math.max(W / w, H / h);
export const containScale = (W: number, H: number, w: number, h: number) => Math.min(W / w, H / h);

export const MAX_FILE = 4 * 1024 * 1024; // batas body Server Action di Vercel ±4,5 MB
export const MAX_SLOTS = 12;
export const r4 = (n: number) => Math.round(n * 10000) / 10000;
export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function loadImage(src: string, cors = false): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    // Jangan pakai salinan cache dari <img> biasa (tanpa CORS) → kanvas akan "tercemar" & tidak bisa dibaca.
    img.src = cors ? `${src}${src.includes("?") ? "&" : "?"}cors=1` : src;
  });
}

/** Piksel bingkai yang diperkecil (sisi terpanjang 400 px) untuk deteksi lubang. */
export function pixels(img: HTMLImageElement) {
  const scale = Math.min(1, 400 / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  return { data: ctx.getImageData(0, 0, w, h).data, w, h };
}

/**
 * Ubah area hijau penanda jadi transparan → PNG. Gambar sangat besar diperkecil dulu (sisi ≤ 3000 px) agar cepat;
 * nanti tetap disesuaikan ke ukuran cetak.
 */
export async function keyGreen(img: HTMLImageElement): Promise<{ blob: Blob; regions: number } | null> {
  const scale = Math.min(1, 3000 / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const id = ctx.getImageData(0, 0, w, h);
  const { mask, regions } = findGreen(id.data, w, h);
  if (!regions) return null;
  for (let p = 0; p < mask.length; p++) if (mask[p]) id.data[p * 4 + 3] = 0;
  ctx.putImageData(id, 0, 0);
  const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/png"));
  return blob && { blob, regions };
}

/** PNG panduan ukuran: kanvas ukuran cetak, garis aman, dan contoh tempat foto (hijau penanda) bernomor. */
export async function downloadGuide(format: TemplateFormat) {
  const [W, H] = FORMATS[format].px;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#eef2ff";
  ctx.fillRect(0, 0, W, H);
  ctx.setLineDash([18, 12]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#ef4444";
  ctx.strokeRect(W * SAFE, H * SAFE, W * (1 - 2 * SAFE), H * (1 - 2 * SAFE));
  const u = Math.min(W, H) / 600;
  defaultSlots(format).forEach((sl, i) => {
    const x = sl.x * W, y = sl.y * H, w = sl.w * W, h = sl.h * H;
    // Hijau penanda polos (tanpa tulisan di dalamnya, agar terdeteksi utuh); label di atas kotak.
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#166534";
    ctx.font = `600 ${20 * u}px sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText(`FOTO ${i + 1} — hijau / transparan`, x, y - 8 * u);
  });
  ctx.fillStyle = "#64748b";
  ctx.font = `${18 * u}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(`Panduan Sissi Booth · ${FORMATS[format].label} · ${FORMATS[format].size}`, W / 2, H - H * SAFE - 14 * u);
  ctx.fillStyle = "#ef4444";
  ctx.fillText("Garis merah = batas aman (jangan taruh teks penting di luar)", W / 2, H * SAFE + 30 * u);
  const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/png"));
  if (!blob) return;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `panduan-sissi-booth-${format}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Saran membuat gambar bingkai + tombol unduh PNG panduan per format. */
export function FrameTips() {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-col divide-y divide-edge rounded-lg ring-1 ring-inset ring-edge">
        {FORMAT_KEYS.map((f) => {
          const [w, h] = FORMATS[f].px;
          return (
            <div key={f} className="flex items-center gap-3 px-3 py-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center" aria-hidden>
                <span className="block rounded-[2px] border-2 border-edge-strong" style={{ height: w > h ? 16 : 26, width: ((w > h ? 16 : 26) * w) / h }} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium">{FORMATS[f].label}</span>
                <span className="text-xs tabular-nums text-subtle">
                  {w} × {h} px
                </span>
              </span>
              <button
                type="button"
                onClick={() => void downloadGuide(f)}
                title={`Unduh PNG panduan ${FORMATS[f].label} — ${FORMATS[f].hint}`}
                aria-label={`Unduh panduan ${FORMATS[f].label}`}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-primary ring-1 ring-inset ring-edge hover:bg-primary-soft"
              >
                <Download className="size-4" strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </div>
      <ul className="flex list-disc flex-col gap-1 pl-4 text-xs text-subtle">
        <li>
          Tandai tempat foto dengan <b className="font-medium text-fg">warna hijau terang (#00FF00)</b> — boleh JPG atau PNG. Atau, kalau terbiasa, buat
          bagian foto <b className="font-medium text-fg">transparan</b> di PNG. Posisinya terdeteksi otomatis, bentuk apa pun: kotak, bulat, hati.
        </li>
        <li>Pakai ukuran piksel persis seperti di atas. Ukuran lain tetap bisa, nanti diatur posisinya.</li>
        <li>Jauhkan teks & logo penting dari tepi (±3%, garis merah di panduan) — tepi bisa sedikit terpotong saat cetak.</li>
        <li>Ukuran file maksimal 4 MB. Desain dengan warna rata lebih kecil daripada foto penuh.</li>
        <li>Saat menyimpan dari aplikasi desain, pilih PNG dengan latar belakang transparan dan ukuran khusus (px) seperti di atas.</li>
      </ul>
    </div>
  );
}

/** Pilihan format cetak (kartu kecil dengan bentuk kertas). */
export function FormatPicker({
  value,
  onChange,
  suggested,
  list,
}: {
  value: TemplateFormat;
  onChange: (f: TemplateFormat) => void;
  suggested?: TemplateFormat;
  /** Daftar bersusun (untuk panel sempit): ikon kiri, nama & ukuran di kanan. */
  list?: boolean;
}) {
  if (list) {
    return (
      <div className="flex flex-col gap-1.5">
        {FORMAT_KEYS.map((f) => {
          const [w, h] = FORMATS[f].px;
          const on = f === value;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(f)}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-left ring-1 ring-inset", on ? "bg-primary-soft ring-primary" : "bg-surface ring-edge-strong hover:bg-canvas")}
            >
              <span className="flex size-7 shrink-0 items-center justify-center">
                <span className={cn("block rounded-[2px] border-2", on ? "border-primary bg-surface" : "border-edge-strong")} style={{ height: w > h ? 16 : 26, width: ((w > h ? 16 : 26) * w) / h }} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className={cn("whitespace-nowrap text-sm font-medium", on && "text-primary")}>{FORMATS[f].label}</span>
                  {f === suggested && <span className="whitespace-nowrap rounded-full bg-success-soft px-1.5 text-[10px] font-medium leading-4 text-success">Paling pas</span>}
                </span>
                <span className="whitespace-nowrap text-xs tabular-nums text-subtle">{FORMATS[f].size}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      {FORMAT_KEYS.map((f) => {
        const [w, h] = FORMATS[f].px;
        const on = f === value;
        return (
          <button
            key={f}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(f)}
            className={cn("flex flex-col items-center gap-1.5 rounded-lg p-2.5 text-center ring-1 ring-inset", on ? "bg-primary-soft ring-primary" : "bg-surface ring-edge-strong hover:bg-canvas")}
          >
            <span className="flex h-10 items-center">
              <span className={cn("block rounded-[2px] border-2", on ? "border-primary bg-surface" : "border-edge-strong")} style={{ height: w > h ? 24 : 40, width: ((w > h ? 24 : 40) * w) / h }} />
            </span>
            <span className={cn("text-xs font-medium", on && "text-primary")}>{FORMATS[f].label}</span>
            <span className="text-[11px] leading-tight text-subtle">{FORMATS[f].size}</span>
            {f === suggested && <span className="rounded-full bg-success-soft px-1.5 text-[10px] font-medium text-success">Paling pas</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Panggung "Atur gambar": kanvas ukuran cetak + gambar yang bisa diseret; bagian di luar kanvas tampil pudar. */
export function AdjustStage({
  adjust,
  boxW,
  maxH,
  onChange,
}: {
  adjust: Adjust;
  boxW: number;
  maxH: number;
  onChange: (a: Adjust) => void;
}) {
  const pan = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const el = useRef<HTMLDivElement>(null);
  // Garis bantu magnet yang sedang aktif (posisi relatif kanvas 0–1).
  const [guide, setGuide] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] });
  const latest = useRef({ adjust, onChange });
  useEffect(() => {
    latest.current = { adjust, onChange };
  });
  // Zoom dengan roda mouse tanpa ikut menggulir halaman (listener non-pasif).
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const { adjust: a, onChange: set } = latest.current;
      set({ ...a, zoom: clamp(a.zoom * (e.deltaY < 0 ? 1.06 : 1 / 1.06), 0.1, 4) });
    };
    node.addEventListener("wheel", wheel, { passive: false });
    return () => node.removeEventListener("wheel", wheel);
  }, []);
  const [W, H] = FORMATS[adjust.format].px;
  // Sisakan ruang di sekitar kanvas agar bagian gambar yang terpotong tetap terlihat (pudar).
  const k = Math.min(((boxW || 1) * 0.8) / W, (maxH * 0.9) / H);
  const cw = W * k, ch = H * k;
  const { img } = adjust.src;
  const s = coverScale(W, H, img.naturalWidth, img.naturalHeight) * adjust.zoom * k;
  const iw = img.naturalWidth * s, ih = img.naturalHeight * s;
  const left = cw / 2 + adjust.ox * k - iw / 2, top = ch / 2 + adjust.oy * k - ih / 2;
  const pic = (cls: string) => (
    <img src={adjust.src.url} alt="" draggable={false} className={cn("pointer-events-none absolute max-w-none select-none", cls)} style={{ left, top, width: iw, height: ih }} />
  );
  return (
    <div
      ref={el}
      className="relative my-6 cursor-grab touch-none select-none active:cursor-grabbing"
      style={{ width: cw, height: ch }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        pan.current = { x: e.clientX, y: e.clientY, ox: adjust.ox, oy: adjust.oy };
      }}
      onPointerMove={(e) => {
        const p = pan.current;
        if (!p) return;
        let ox = p.ox + (e.clientX - p.x) / k, oy = p.oy + (e.clientY - p.y) / k;
        const v: number[] = [], h: number[] = [];
        if (!e.altKey) {
          // Magnet: tengah gambar ke tengah kanvas, atau tepi gambar ke tepi kanvas (ambang 8 px layar). Alt = mati.
          const IW = iw / k, IH = ih / k, thr = 8 / k;
          const snap = (val: number, opts: [number, number][], out: number[]) => {
            let best: [number, number] | null = null;
            for (const o of opts) if (Math.abs(val - o[0]) <= thr && (!best || Math.abs(val - o[0]) < Math.abs(val - best[0]))) best = o;
            if (!best) return val;
            out.push(best[1]);
            return best[0];
          };
          ox = snap(ox, [[0, 0.5], [IW / 2 - W / 2, 0], [W / 2 - IW / 2, 1]], v);
          oy = snap(oy, [[0, 0.5], [IH / 2 - H / 2, 0], [H / 2 - IH / 2, 1]], h);
        }
        setGuide({ v, h });
        onChange({ ...adjust, ox: Math.round(ox), oy: Math.round(oy) });
      }}
      onPointerUp={() => {
        pan.current = null;
        setGuide({ v: [], h: [] });
      }}
      onPointerCancel={() => {
        pan.current = null;
        setGuide({ v: [], h: [] });
      }}
    >
      {pic("opacity-25")}
      <div className="checker absolute inset-0 overflow-hidden outline-2 outline-offset-0 outline-primary">
        {/* Warna latar hanya di luar gambar (bayangan raksasa di sekeliling area gambar). */}
        {adjust.bg && <div aria-hidden className="pointer-events-none absolute" style={{ left, top, width: iw, height: ih, boxShadow: `0 0 0 100000px ${adjust.bg}` }} />}
        {pic("")}
      </div>
      {guide.v.map((x) => (
        <div key={`v${x}`} aria-hidden className="pointer-events-none absolute inset-y-0 z-10 w-px -translate-x-1/2 bg-danger" style={{ left: `${x * 100}%` }} />
      ))}
      {guide.h.map((y) => (
        <div key={`h${y}`} aria-hidden className="pointer-events-none absolute inset-x-0 z-10 h-px -translate-y-1/2 bg-danger" style={{ top: `${y * 100}%` }} />
      ))}
    </div>
  );
}

/** Panel "Atur gambar": format, ukuran (zoom), posisi cepat, warna latar, terapkan. */
export function AdjustPanel({
  adjust,
  onChange,
  onCancel,
  onApply,
  busy,
  notice,
}: {
  adjust: Adjust;
  onChange: (a: Adjust) => void;
  onCancel: () => void;
  onApply: () => void;
  busy: boolean;
  notice: { tone: "ok" | "warn" | "err"; text: string } | null;
}) {
  const [W, H] = FORMATS[adjust.format].px;
  const { img } = adjust.src;
  const fit = containScale(W, H, img.naturalWidth, img.naturalHeight) / coverScale(W, H, img.naturalWidth, img.naturalHeight);
  const custom = adjust.bg !== null && !BG_CHOICES.some((b) => b.value === adjust.bg);
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Panel title="Atur gambar">
        <p className="flex gap-2 rounded-lg bg-primary-soft px-3 py-2 text-xs text-primary">
          <Info className="mt-px size-3.5 shrink-0" strokeWidth={2} />
          Seret untuk menggeser (menempel ke tengah & tepi, Alt = bebas). Gulir untuk memperbesar. Yang tercetak hanya isi kotak biru.
        </p>
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Format cetak</span>
          <FormatPicker list value={adjust.format} onChange={(f) => onChange({ ...adjust, format: f, ox: 0, oy: 0, zoom: 1 })} suggested={closestFormat(img.naturalWidth, img.naturalHeight)} />
        </div>
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="flex items-center justify-between font-medium">
            Ukuran gambar <span className="font-normal tabular-nums text-subtle">{Math.round(adjust.zoom * 100)}%</span>
          </span>
          <input
            type="range"
            min={0.1}
            max={4}
            step={0.01}
            value={adjust.zoom}
            onChange={(e) => onChange({ ...adjust, zoom: Number(e.target.value) })}
            className="accent-primary"
            aria-label="Ukuran gambar"
          />
          <div className="flex flex-wrap gap-1.5">
            <Button small onClick={() => onChange({ ...adjust, zoom: 1, ox: 0, oy: 0 })}>Penuhi kotak</Button>
            <Button small onClick={() => onChange({ ...adjust, zoom: fit, ox: 0, oy: 0 })}>Tampilkan utuh</Button>
            <Button small onClick={() => onChange({ ...adjust, ox: 0, oy: 0 })}>Ke tengah</Button>
          </div>
          <p className="text-xs text-subtle">
            <b className="font-medium">Penuhi kotak</b>: tanpa ruang kosong, sebagian gambar terpotong. <b className="font-medium">Tampilkan utuh</b>: seluruh gambar terlihat, sisa
            ruang diisi warna latar.
          </p>
        </div>
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Warna ruang kosong di luar gambar</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {BG_CHOICES.map((b) => (
              <button
                key={b.label}
                type="button"
                aria-pressed={adjust.bg === b.value}
                onClick={() => onChange({ ...adjust, bg: b.value })}
                className={cn("h-8 rounded-lg px-3 text-xs font-medium ring-1 ring-inset", adjust.bg === b.value ? "bg-primary-soft text-primary ring-primary/30" : "bg-surface ring-edge-strong hover:bg-canvas")}
              >
                {b.label}
              </button>
            ))}
            <label className={cn("inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-xs font-medium ring-1 ring-inset", custom ? "bg-primary-soft text-primary ring-primary/30" : "bg-surface ring-edge-strong hover:bg-canvas")}>
              <input type="color" value={adjust.bg ?? "#ffffff"} onChange={(e) => onChange({ ...adjust, bg: e.target.value })} className="size-5 cursor-pointer rounded border-0 bg-transparent p-0" aria-label="Warna lain" />
              Warna lain
            </label>
          </div>
          <p className="text-xs text-subtle">Lubang foto (bagian transparan) di dalam gambar tetap transparan.</p>
          {adjust.bg === null && <p className="text-xs text-warning">Ruang kosong di luar gambar juga dibiarkan transparan — bisa terdeteksi sebagai lubang foto.</p>}
        </div>
        {notice?.tone === "err" && <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">{notice.text}</p>}
        <div className="flex gap-2 border-t border-edge pt-3">
          <Button onClick={onCancel} className="flex-1">Batal</Button>
          <Button tone="blue" onClick={onApply} disabled={busy} className="flex-1">
            {busy && <Loader2 className="size-4 animate-spin" />} Terapkan
          </Button>
        </div>
      </Panel>
    </div>
  );
}

export function NoticeBox({ notice }: { notice: { tone: "ok" | "warn" | "err"; text: string } }) {
  return (
    <p
      className={cn(
        "rounded-lg px-3 py-2 text-xs",
        notice.tone === "ok" ? "bg-success-soft text-success" : notice.tone === "warn" ? "bg-warning-soft text-warning" : "bg-danger-soft text-danger",
      )}
    >
      {notice.text}
    </p>
  );
}

export function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-edge bg-surface shadow-card">
      <header className="flex items-center justify-between gap-2 border-b border-edge px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </header>
      <div className="flex flex-col gap-3 p-4">{children}</div>
    </section>
  );
}

export function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="inline-flex size-8 items-center justify-center rounded-lg text-subtle hover:bg-canvas hover:text-fg disabled:opacity-40">
      {children}
    </button>
  );
}

/** Isian angka 1 desimal; nilai diterapkan saat diketik (bila sah). */
export function Num({ label, value, onChange, min }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  const shown = Math.round(value * 10) / 10;
  const [text, setText] = useState(String(shown));
  const [last, setLast] = useState(shown);
  if (shown !== last) {
    // Nilai berubah dari luar (seret di panggung) → tampilkan nilai terbaru.
    setLast(shown);
    setText(String(shown));
  }
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-subtle">
      {label}
      <input
        inputMode="decimal"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const v = Number(e.target.value.replace(",", "."));
          if (e.target.value.trim() !== "" && Number.isFinite(v) && (min === undefined || v >= min)) {
            setLast(Math.round(v * 10) / 10);
            onChange(v);
          }
        }}
        className="h-9 rounded-lg border border-edge-strong bg-surface px-2.5 text-sm font-normal tabular-nums text-fg shadow-card outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
      />
    </label>
  );
}
