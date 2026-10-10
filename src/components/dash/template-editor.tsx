"use client";

/* eslint-disable @next/next/no-img-element -- gambar bingkai lokal (object URL) / server file. */
import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { AlignCenterHorizontal, AlignCenterVertical, ArrowLeft, Copy, Crop, Download, Eye, ImageUp, Info, Lightbulb, Loader2, Pencil, Plus, ScanSearch, SortAsc, StretchHorizontal, StretchVertical, Trash2, Scaling } from "lucide-react";
import { cn } from "@/components/shared/cn";
import type { ActionState } from "@/lib/dash/action-state";
import { closestFormat, defaultSlots, detectSlots, distribute, FORMAT_KEYS, FORMATS, formatFor, SAFE, SHAPES, snapMove, snapResize, sortSlots, type Guides } from "@/lib/dash/template";
import type { FrameTemplate, Slot, SlotShape, TemplateCategory, TemplateFormat } from "@/lib/dash/types";
import { Button, Dialog, Switch } from "./client";
import { TemplatePreview } from "./template-preview";

type Frame = { src: string; width: number; height: number; file?: File };
type Drag = { kind: "move" | "resize" | "rotate"; i: number; x: number; y: number; start: Slot; corner?: [number, number] };
/** Gambar asli yang diunggah (disimpan agar posisinya bisa diatur ulang). */
type Source = { img: HTMLImageElement; url: string; name: string; png: boolean };
/** Pengaturan "Atur gambar": gambar diletakkan di kanvas ukuran cetak (piksel kanvas), zoom 1 = memenuhi kanvas. */
type Adjust = { src: Source; format: TemplateFormat; zoom: number; ox: number; oy: number; bg: string | null };
type Ask = { src: Source; reasons: string[]; format: TemplateFormat };

const ACCEPT = ["image/png", "image/jpeg", "image/webp"];
const BG_CHOICES: { label: string; value: string | null }[] = [
  { label: "Transparan", value: null },
  { label: "Putih", value: "#ffffff" },
  { label: "Hitam", value: "#000000" },
];
const mb = (n: number) => (n / 1024 / 1024).toLocaleString("id-ID", { maximumFractionDigits: 1 });
/** Skala agar gambar memenuhi (cover) atau muat utuh (contain) di kanvas W×H. */
const coverScale = (W: number, H: number, w: number, h: number) => Math.max(W / w, H / h);
const containScale = (W: number, H: number, w: number, h: number) => Math.min(W / w, H / h);

const MAX_FILE = 4 * 1024 * 1024; // batas body Server Action di Vercel ±4,5 MB
const MAX_SLOTS = 12;
const r4 = (n: number) => Math.round(n * 10000) / 10000;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function loadImage(src: string, cors = false): Promise<HTMLImageElement> {
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
function pixels(img: HTMLImageElement) {
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
 * Editor template bingkai (dashboard pemilik & admin Sissi): unggah PNG → lubang transparan dideteksi
 * otomatis jadi slot → atur posisi/ukuran/rotasi/bentuk tiap slot → simpan (multipart lewat aksi server).
 */
export function TemplateEditor({
  template,
  categories,
  action,
  backHref,
  builtin,
}: {
  template?: FrameTemplate;
  categories: TemplateCategory[];
  action: (s: ActionState, f: FormData) => Promise<ActionState>;
  backHref: string;
  /** Admin: template bawaan Sissi (teks bantuan berbeda). */
  builtin?: boolean;
}) {
  const [state, run, saving] = useActionState(action, {} as ActionState);
  const [frame, setFrame] = useState<Frame | null>(template ? { src: template.frame_url, width: template.width, height: template.height } : null);
  const [overlay, setOverlay] = useState(template?.frame_overlay ?? true);
  const [slots, setSlots] = useState<Slot[]>(template?.slots ?? []);
  const [sel, setSel] = useState<number | null>(template?.slots.length ? 0 : null);
  const [name, setName] = useState(template?.name ?? "");
  const [cats, setCats] = useState<Set<string>>(new Set(template?.categories.map((c) => c.id) ?? []));
  const [active, setActive] = useState(template?.active ?? true);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [notice, setNotice] = useState<{ tone: "ok" | "warn" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [guides, setGuides] = useState<Guides>({ v: [], h: [] });
  const [showSafe, setShowSafe] = useState(true);
  const [tips, setTips] = useState(false);
  const [source, setSource] = useState<Source | null>(null);
  const [ask, setAsk] = useState<Ask | null>(null);
  const [adjust, setAdjust] = useState<Adjust | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [boxW, setBoxW] = useState(0);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBoxW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Lepas object URL gambar asli lama saat diganti / editor ditutup.
  useEffect(() => {
    const url = source?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [source?.url]);

  // Lepas object URL lama saat gambar diganti / editor ditutup.
  useEffect(() => {
    const src = frame?.src;
    return () => {
      if (src?.startsWith("blob:")) URL.revokeObjectURL(src);
    };
  }, [frame?.src]);

  const format = frame ? formatFor(frame.width, frame.height) : null;
  // Ukuran panggung: muat di lebar kolom & tinggi ±70% layar.
  const maxH = typeof window === "undefined" ? 640 : Math.max(360, window.innerHeight * 0.7);
  const stageW = frame ? Math.min(boxW || 1, (maxH * frame.width) / frame.height) : 0;
  const stageH = frame ? (stageW * frame.height) / frame.width : 0;
  const slot = sel !== null ? slots[sel] : undefined;

  const update = (i: number, patch: Partial<Slot>) => setSlots((all) => all.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  function applyDetection(img: HTMLImageElement, f: Frame, replace: boolean) {
    const fmt = formatFor(f.width, f.height);
    let found: ReturnType<typeof detectSlots>;
    try {
      const px = pixels(img);
      found = detectSlots(px.data, px.w, px.h);
    } catch {
      setNotice({ tone: "warn", text: "Gambar tidak bisa dibaca untuk deteksi otomatis. Unggah ulang PNG-nya untuk mendeteksi lubang." });
      return;
    }
    if (found.slots.length > 0) {
      const list = found.slots.slice(0, MAX_SLOTS);
      setOverlay(true);
      setSlots(list);
      setSel(0);
      setNotice({
        tone: "ok",
        text: `${found.slots.length} lubang foto terdeteksi${found.slots.length > MAX_SLOTS ? ` (dipakai ${MAX_SLOTS} pertama)` : ""}. Geser, ubah ukuran, atau putar bila perlu.`,
      });
    } else if (replace || slots.length === 0) {
      setOverlay(found.transparent);
      const list = fmt ? defaultSlots(fmt) : [];
      setSlots(list);
      setSel(list.length ? 0 : null);
      setNotice({
        tone: "warn",
        text: found.transparent
          ? "Tidak ada lubang foto yang cukup besar. Slot contoh dipasang — atur posisinya sendiri."
          : "Gambar tidak punya bagian transparan, jadi dipakai sebagai latar (foto di atas gambar). Slot contoh dipasang — atur posisinya.",
      });
    } else {
      setNotice({ tone: "warn", text: "Tidak ada lubang foto yang terdeteksi; slot yang ada tidak diubah." });
    }
  }

  async function pickFile(file: File) {
    setNotice(null);
    if (!ACCEPT.includes(file.type)) {
      return setNotice({ tone: "err", text: "Jenis file belum didukung. Pakai PNG (disarankan, agar bagian foto bisa transparan), JPG, atau WEBP." });
    }
    setBusy(true);
    const url = URL.createObjectURL(file);
    let img: HTMLImageElement;
    try {
      img = await loadImage(url);
    } catch {
      URL.revokeObjectURL(url);
      setBusy(false);
      return setNotice({ tone: "err", text: "Gambar tidak bisa dibuka. Pastikan file tidak rusak, lalu coba lagi." });
    }
    setBusy(false);
    const src: Source = { img, url, name: file.name, png: file.type === "image/png" };
    const w = img.naturalWidth, h = img.naturalHeight;
    const fmt = formatFor(w, h);
    const reasons: string[] = [];
    if (!src.png) reasons.push("File ini bukan PNG, jadi tidak punya bagian transparan. Gambar akan dipakai sebagai latar dan foto diletakkan di atasnya.");
    if (!fmt) reasons.push(`Ukurannya ${w} × ${h} px — bentuknya tidak sama dengan format cetak mana pun, jadi perlu dipotong atau diberi latar.`);
    else if (Math.min(w, h) < FORMATS[fmt].minShort) reasons.push(`Gambar lebih kecil dari ukuran cetak ${FORMATS[fmt].label} (${FORMATS[fmt].size}). Masih bisa dipakai, tapi hasil cetak bisa sedikit buram.`);
    if (Math.max(w, h) > 6000) reasons.push("Gambar sangat besar (lebih dari 6000 px). Akan diperkecil otomatis ke ukuran cetak.");
    if (file.size > MAX_FILE) reasons.push(`Ukuran file ${mb(file.size)} MB melebihi batas 4 MB. Gambar akan disimpan ulang di ukuran cetak — biasanya jadi lebih kecil. Kalau masih terlalu besar, kecilkan dulu dengan TinyPNG.`);
    if (reasons.length > 0) {
      setAsk({ src, reasons, format: fmt ?? closestFormat(w, h) });
      return;
    }
    // Pas: langsung dipakai apa adanya.
    setSource(src);
    const f = { src: URL.createObjectURL(file), width: w, height: h, file };
    setFrame(f);
    applyDetection(img, f, !template || slots.length === 0);
  }

  function startAdjust(src: Source, format: TemplateFormat) {
    setSource(src);
    setAsk(null);
    setMode("edit");
    setNotice(null);
    // Latar putih bawaan: bagian kosong transparan bisa terbaca sebagai lubang foto.
    setAdjust({ src, format, zoom: 1, ox: 0, oy: 0, bg: "#ffffff" });
  }

  /** Atur posisi gambar yang sedang dipakai (unggahan baru atau gambar template tersimpan). */
  async function adjustCurrent() {
    if (source) return startAdjust(source, format ?? closestFormat(source.img.naturalWidth, source.img.naturalHeight));
    if (!frame) return;
    setBusy(true);
    try {
      const img = await loadImage(frame.src, !frame.src.startsWith("blob:"));
      startAdjust({ img, url: frame.src, name: "bingkai", png: true }, format ?? closestFormat(img.naturalWidth, img.naturalHeight));
    } catch {
      setNotice({ tone: "warn", text: "Gambar bingkai tidak bisa dibuka untuk diatur. Unggah ulang gambarnya, lalu atur posisinya." });
    } finally {
      setBusy(false);
    }
  }

  async function applyAdjust() {
    if (!adjust) return;
    const [W, H] = FORMATS[adjust.format].px;
    const { img } = adjust.src;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const k = coverScale(W, H, iw, ih) * adjust.zoom;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;
    const dx = W / 2 + adjust.ox - (iw * k) / 2, dy = H / 2 + adjust.oy - (ih * k) / 2;
    if (adjust.bg) {
      // Warna hanya untuk ruang kosong DI LUAR gambar; bagian transparan di dalam gambar (lubang foto) tetap transparan.
      ctx.fillStyle = adjust.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.clearRect(dx, dy, iw * k, ih * k);
    }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, dx, dy, iw * k, ih * k);
    setBusy(true);
    const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/png"));
    setBusy(false);
    if (!blob) return setNotice({ tone: "err", text: "Gambar gagal diproses. Coba lagi." });
    if (blob.size > MAX_FILE) {
      return setNotice({
        tone: "err",
        text: `Hasilnya ${mb(blob.size)} MB, masih di atas batas 4 MB (biasanya karena foto penuh warna). Coba pakai gambar dengan warna lebih sederhana, atau kecilkan dulu di TinyPNG.`,
      });
    }
    const url = URL.createObjectURL(blob);
    const out = await loadImage(url);
    const f = { src: url, width: W, height: H, file: new File([blob], "frame.png", { type: "image/png" }) };
    setFrame(f);
    setAdjust(null);
    applyDetection(out, f, slots.length === 0);
  }

  async function redetect() {
    if (!frame) return;
    setBusy(true);
    try {
      applyDetection(await loadImage(frame.src, !frame.src.startsWith("blob:")), frame, true);
    } catch {
      setNotice({ tone: "warn", text: "Gambar tidak bisa dibaca untuk deteksi otomatis. Unggah ulang PNG-nya untuk mendeteksi lubang." });
    } finally {
      setBusy(false);
    }
  }

  function addSlot() {
    if (slots.length >= MAX_SLOTS) return;
    const s: Slot = { x: 0.3, y: 0.35, w: 0.4, h: format === "strip_2x6" ? 0.15 : 0.3, rotation: 0, shape: "rect" };
    setSlots([...slots, s]);
    setSel(slots.length);
  }

  // --- interaksi panggung (geser / ubah ukuran / putar) ---

  function begin(e: React.PointerEvent, i: number, kind: Drag["kind"], corner?: [number, number]) {
    e.stopPropagation();
    e.preventDefault();
    setSel(i);
    drag.current = { kind, i, x: e.clientX, y: e.clientY, start: slots[i], corner };
    stageRef.current?.setPointerCapture(e.pointerId);
    stageRef.current?.focus({ preventScroll: true });
  }

  function onMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || !stageW) return;
    const s = d.start;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    const others = slots.filter((_, j) => j !== d.i);
    const thrX = 6 / stageW, thrY = 6 / stageH; // ambang magnet ±6 px layar
    if (d.kind === "move") {
      const moved = { ...s, x: clamp(s.x + dx / stageW, -0.5, 1.5 - s.w), y: clamp(s.y + dy / stageH, -0.5, 1.5 - s.h) };
      // Magnet ke tepi/tengah kanvas & slot lain (tahan Alt untuk bebas).
      const snapped = e.altKey ? { x: moved.x, y: moved.y, guides: { v: [], h: [] } } : snapMove(moved, others, thrX, thrY);
      setGuides(snapped.guides);
      update(d.i, { x: r4(snapped.x), y: r4(snapped.y) });
      return;
    }
    const t = (s.rotation * Math.PI) / 180;
    const cos = Math.cos(t), sin = Math.sin(t);
    const w0 = s.w * stageW, h0 = s.h * stageH;
    const cx0 = s.x * stageW + w0 / 2, cy0 = s.y * stageH + h0 / 2;
    if (d.kind === "rotate") {
      const rect = stageRef.current!.getBoundingClientRect();
      let deg = (Math.atan2(e.clientY - (rect.top + cy0), e.clientX - (rect.left + cx0)) * 180) / Math.PI + 90;
      if (deg > 180) deg -= 360;
      const snap = Math.round(deg / 15) * 15;
      if (!e.altKey && Math.abs(deg - snap) < 4) deg = snap; // menempel ke kelipatan 15° (tahan Alt untuk bebas)
      update(d.i, { rotation: Math.round(deg * 10) / 10 });
      return;
    }
    const [sx, sy] = d.corner!;
    // Selisih pointer di sumbu slot (sebelum rotasi), lalu sudut seberang tetap di tempat.
    const lx = dx * cos + dy * sin, ly = -dx * sin + dy * cos;
    let w = Math.max(12, w0 + sx * lx), h = Math.max(12, h0 + sy * ly);
    if (e.shiftKey) {
      const k = Math.max(w / w0, h / h0);
      w = w0 * k;
      h = h0 * k;
    }
    const ox = (sx * (w - w0)) / 2, oy = (sy * (h - h0)) / 2;
    const cx = cx0 + ox * cos - oy * sin, cy = cy0 + ox * sin + oy * cos;
    const resized = { ...s, x: (cx - w / 2) / stageW, y: (cy - h / 2) / stageH, w: w / stageW, h: h / stageH };
    // Magnet ukuran hanya untuk slot tegak lurus (tanpa rotasi) & tanpa Shift/Alt.
    if (s.rotation === 0 && !e.shiftKey && !e.altKey) {
      const snapped = snapResize(resized, [sx, sy], others, thrX, thrY);
      setGuides(snapped.guides);
      const o = snapped.slot;
      update(d.i, { x: r4(o.x), y: r4(o.y), w: r4(Math.max(0.02, o.w)), h: r4(Math.max(0.02, o.h)) });
      return;
    }
    setGuides({ v: [], h: [] });
    update(d.i, { x: r4(resized.x), y: r4(resized.y), w: r4(resized.w), h: r4(resized.h) });
  }

  function onKey(e: React.KeyboardEvent) {
    if (sel === null || mode !== "edit") return;
    const step = e.shiftKey ? 0.01 : 0.002;
    const s = slots[sel];
    const moves: Record<string, Partial<Slot>> = {
      ArrowLeft: { x: r4(s.x - step) },
      ArrowRight: { x: r4(s.x + step) },
      ArrowUp: { y: r4(s.y - step) },
      ArrowDown: { y: r4(s.y + step) },
    };
    if (moves[e.key]) {
      e.preventDefault();
      update(sel, moves[e.key]);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      removeSlot(sel);
    }
  }

  function removeSlot(i: number) {
    const next = slots.filter((_, j) => j !== i);
    setSlots(next);
    setSel(next.length ? Math.min(i, next.length - 1) : null);
  }

  // --- simpan ---

  const problems: string[] = [];
  if (!frame) problems.push("Unggah gambar bingkai (PNG).");
  else if (!format) problems.push("Ukuran gambar tidak cocok dengan format cetak.");
  if (!name.trim()) problems.push("Isi nama template.");
  if (slots.length === 0) problems.push("Tambahkan minimal satu slot foto.");

  function submit() {
    if (problems.length || !frame || !format) return;
    const f = new FormData();
    if (template) f.set("id", template.id);
    f.set(
      "meta",
      JSON.stringify({
        name: name.trim(),
        format,
        frame_overlay: overlay,
        // "Ikuti lubang" hanya sah bila bingkai di atas foto.
        slots: slots.map((s) => ({ ...s, shape: !overlay && s.shape === "frame" ? "rect" : s.shape, x: r4(s.x), y: r4(s.y), w: r4(s.w), h: r4(s.h) })),
        category_ids: [...cats],
        active,
      }),
    );
    if (frame.file) f.set("frame", frame.file);
    startTransition(() => run(f));
  }

  const serverFields = Object.entries(state.fields ?? {});

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <Link href={backHref} className="mb-2 inline-flex items-center gap-1 text-sm text-subtle hover:text-fg">
            <ArrowLeft className="size-4" strokeWidth={2} /> Template
          </Link>
          <h1 className="text-xl font-semibold leading-tight tracking-tight md:text-2xl">{template ? "Ubah template" : builtin ? "Template bawaan baru" : "Template baru"}</h1>
          <p className="mt-1 text-sm text-subtle">
            Unggah bingkai PNG dengan lubang transparan — posisi foto terdeteksi otomatis.{builtin && " Tampil untuk semua pemilik booth."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button tone="blue" onClick={submit} disabled={saving || problems.length > 0} title={problems.join(" ")}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Simpan template
          </Button>
        </div>
      </div>

      {state.message && !state.ok && (
        <div role="alert" className="mb-4 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
          <p className="font-medium">{state.message}</p>
          {serverFields.length > 0 && (
            <ul className="mt-1 list-disc pl-5">
              {serverFields.map(([k, v]) => (
                <li key={k}>
                  <span className="font-mono text-xs">{k}</span>: {v}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Panggung */}
        <section className="min-w-0 rounded-xl border border-edge bg-surface shadow-card">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-edge px-4 py-3">
            <div className={cn("inline-flex rounded-lg bg-canvas p-0.5", adjust && "invisible")} role="tablist" aria-label="Tampilan">
              {(
                [
                  ["edit", "Atur slot", Pencil],
                  ["preview", "Pratinjau", Eye],
                ] as const
              ).map(([k, label, Icon]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={mode === k}
                  onClick={() => setMode(k)}
                  className={cn("inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium", mode === k ? "bg-surface text-fg shadow-card" : "text-subtle hover:text-fg")}
                >
                  <Icon className="size-3.5" strokeWidth={2} /> {label}
                </button>
              ))}
            </div>
            {frame && !adjust && mode === "edit" && (
              <label className="flex items-center gap-2 text-xs text-subtle">
                <Switch checked={showSafe} onChange={setShowSafe} label="Garis aman cetak" /> Garis aman
              </label>
            )}
            <span className="text-xs text-subtle">
              {adjust
                ? `Atur gambar · ${FORMATS[adjust.format].label} · ${FORMATS[adjust.format].size}`
                : frame && format
                  ? `${FORMATS[format].label} · ${frame.width}×${frame.height} px`
                  : "Belum ada gambar"}
            </span>
          </header>
          <div ref={boxRef} className="flex justify-center overflow-hidden p-4 sm:p-6">
            {adjust ? (
              <AdjustStage adjust={adjust} boxW={boxW} maxH={maxH} onChange={setAdjust} />
            ) : !frame ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex aspect-[2/3] w-full max-w-sm flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-edge-strong p-6 text-center text-sm text-subtle hover:border-primary hover:bg-primary-soft/40"
              >
                <ImageUp className="size-10 text-primary" strokeWidth={1.5} />
                <span className="font-medium text-fg">Unggah gambar bingkai</span>
                <span>PNG dengan bagian foto transparan paling mudah — posisi foto langsung terdeteksi.</span>
                <span className="text-xs">Ukuran lain atau JPG juga bisa: nanti kamu atur posisinya sendiri.</span>
              </button>
            ) : mode === "preview" ? (
              <div style={{ width: stageW }}>
                <TemplatePreview uid="editor" src={frame.src} width={frame.width} height={frame.height} overlay={overlay} slots={slots} className="rounded-md shadow-card" />
              </div>
            ) : (
              <div
                ref={stageRef}
                tabIndex={0}
                aria-label="Panggung template: klik slot untuk memilih, seret untuk memindahkan, panah untuk menggeser"
                onPointerMove={onMove}
                onPointerUp={() => {
                  drag.current = null;
                  setGuides({ v: [], h: [] });
                }}
                onPointerCancel={() => {
                  drag.current = null;
                  setGuides({ v: [], h: [] });
                }}
                onPointerDown={() => setSel(null)}
                onKeyDown={onKey}
                className="checker relative touch-none select-none rounded-md shadow-card outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
                style={{ width: stageW, height: stageH }}
              >
                <img src={frame.src} alt="" draggable={false} className="pointer-events-none absolute inset-0 size-full" />
                {showSafe && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute z-[15] border border-dashed border-danger/60"
                    style={{ left: `${SAFE * 100}%`, top: `${SAFE * 100}%`, right: `${SAFE * 100}%`, bottom: `${SAFE * 100}%` }}
                  />
                )}
                {guides.v.map((x) => (
                  <div key={`v${x}`} aria-hidden className="pointer-events-none absolute inset-y-0 z-30 w-px bg-danger" style={{ left: `${x * 100}%` }} />
                ))}
                {guides.h.map((y) => (
                  <div key={`h${y}`} aria-hidden className="pointer-events-none absolute inset-x-0 z-30 h-px bg-danger" style={{ top: `${y * 100}%` }} />
                ))}
                {slots.map((s, i) => (
                  <div
                    key={i}
                    onPointerDown={(e) => begin(e, i, "move")}
                    className={cn(
                      "absolute cursor-move border-2",
                      i === sel ? "z-20 border-primary bg-primary/20" : "z-10 border-dashed border-primary/70 bg-primary/10 hover:bg-primary/15",
                    )}
                    style={{ left: s.x * stageW, top: s.y * stageH, width: s.w * stageW, height: s.h * stageH, transform: `rotate(${s.rotation}deg)` }}
                  >
                    <span className="pointer-events-none absolute left-1 top-1 inline-flex size-5 items-center justify-center rounded bg-primary text-[11px] font-semibold text-white">{i + 1}</span>
                    {i === sel && (
                      <>
                        {(
                          [
                            [-1, -1],
                            [1, -1],
                            [1, 1],
                            [-1, 1],
                          ] as [number, number][]
                        ).map(([cx, cy]) => (
                          <span
                            key={`${cx}${cy}`}
                            onPointerDown={(e) => begin(e, i, "resize", [cx, cy])}
                            className="absolute size-3 rounded-sm border-2 border-primary bg-white"
                            style={{ left: cx < 0 ? -7 : undefined, right: cx > 0 ? -7 : undefined, top: cy < 0 ? -7 : undefined, bottom: cy > 0 ? -7 : undefined, cursor: cx === cy ? "nwse-resize" : "nesw-resize" }}
                          />
                        ))}
                        <span className="pointer-events-none absolute -top-6 left-1/2 h-5 w-px -translate-x-1/2 bg-primary" />
                        <span
                          onPointerDown={(e) => begin(e, i, "rotate")}
                          title="Putar (tahan Alt untuk tanpa tempel 15°)"
                          className="absolute -top-8 left-1/2 size-3.5 -translate-x-1/2 cursor-grab rounded-full border-2 border-primary bg-white"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {adjust ? (
            <p className="border-t border-edge px-4 py-2.5 text-xs text-subtle">
              Seret gambar untuk menggeser. Kotak bergaris = area cetak; bagian gambar di luar kotak (pudar) akan terpotong.
            </p>
          ) : frame && mode === "edit" && (
            <p className="border-t border-edge px-4 py-2.5 text-xs text-subtle">
              Seret slot untuk memindahkan — menempel otomatis ke tengah, tepi, dan slot lain (garis merah). Tarik sudut untuk ubah ukuran (Shift =
              proporsional) · bulatan atas untuk memutar · panah untuk menggeser halus · tahan Alt untuk mematikan magnet. Garis putus-putus = batas
              aman cetak.
            </p>
          )}
        </section>

        {/* Panel */}
        {adjust ? (
          <AdjustPanel adjust={adjust} onChange={setAdjust} onCancel={() => setAdjust(null)} onApply={applyAdjust} busy={busy} notice={notice} />
        ) : (
        <div className="flex min-w-0 flex-col gap-4">
          <Panel title="Gambar bingkai">
            <input
              ref={fileRef}
              type="file"
              accept="image/png"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void pickFile(f);
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button small onClick={() => fileRef.current?.click()} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" strokeWidth={2} />}
                {frame ? "Ganti PNG" : "Unggah PNG"}
              </Button>
              {frame && (
                <Button small onClick={redetect} disabled={busy}>
                  <ScanSearch className="size-4" strokeWidth={2} /> Deteksi ulang lubang
                </Button>
              )}
              {frame && (
                <Button small onClick={adjustCurrent} disabled={busy}>
                  <Crop className="size-4" strokeWidth={2} /> Atur posisi gambar
                </Button>
              )}
            </div>
            {notice && (
              <p
                className={cn(
                  "rounded-lg px-3 py-2 text-xs",
                  notice.tone === "ok" ? "bg-success-soft text-success" : notice.tone === "warn" ? "bg-warning-soft text-warning" : "bg-danger-soft text-danger",
                )}
              >
                {notice.text}
              </p>
            )}
            <button type="button" onClick={() => setTips(true)} className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-primary hover:underline">
              <Lightbulb className="size-3.5" strokeWidth={2} /> Saran gambar bingkai & unduh panduan ukuran
            </button>
            <label className="flex items-start justify-between gap-3 text-sm">
              <span>
                <span className="font-medium">Bingkai di atas foto</span>
                <span className="block text-xs text-subtle">Aktif: foto terlihat lewat bagian transparan. Mati: gambar jadi latar, foto di atasnya.</span>
              </span>
              <Switch checked={overlay} onChange={setOverlay} label="Bingkai di atas foto" />
            </label>
          </Panel>

          {!frame && (
            <Panel title="Saran gambar bingkai">
              <FrameTips />
            </Panel>
          )}

          <Panel title="Template">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Nama
              <input
                value={name}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
                placeholder="mis. Pink Wedding"
                className="h-10 rounded-lg border border-edge-strong bg-surface px-3 text-sm font-normal shadow-card outline-none placeholder:text-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
              />
            </label>
            <div className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Kategori</span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => {
                  const on = cats.has(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        const next = new Set(cats);
                        if (on) next.delete(c.id);
                        else next.add(c.id);
                        setCats(next);
                      }}
                      className={cn("h-7 rounded-full px-3 text-xs font-medium ring-1 ring-inset", on ? "bg-primary-soft text-primary ring-primary/30" : "bg-surface text-subtle ring-edge-strong hover:text-fg")}
                    >
                      {c.name}
                    </button>
                  );
                })}
                {categories.length === 0 && <span className="text-xs text-subtle">Belum ada kategori.</span>}
              </div>
            </div>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>
                <span className="font-medium">{builtin ? "Aktif untuk semua pemilik" : "Tampil di booth"}</span>
              </span>
              <Switch checked={active} onChange={setActive} label="Aktif" />
            </label>
          </Panel>

          <Panel
            title={`Slot foto (${slots.length}/${MAX_SLOTS})`}
            action={
              <div className="flex gap-1">
                <IconBtn label="Urutkan otomatis (atas → bawah, kiri → kanan)" onClick={() => setSlots(sortSlots(slots))} disabled={slots.length < 2}>
                  <SortAsc className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label="Tambah slot" onClick={addSlot} disabled={!frame || slots.length >= MAX_SLOTS}>
                  <Plus className="size-4" strokeWidth={2} />
                </IconBtn>
              </div>
            }
          >
            {slots.length === 0 ? (
              <p className="text-sm text-subtle">{frame ? "Belum ada slot. Tambah slot atau deteksi ulang lubang." : "Unggah gambar bingkai dulu."}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {slots.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSel(i)}
                    aria-pressed={i === sel}
                    className={cn("inline-flex size-8 items-center justify-center rounded-lg text-sm font-medium ring-1 ring-inset", i === sel ? "bg-primary text-white ring-primary" : "bg-surface ring-edge-strong hover:bg-canvas")}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
            {slot && sel !== null && (
              <div className="flex flex-col gap-3 border-t border-edge pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <Num label="X (%)" value={slot.x * 100} onChange={(v) => update(sel, { x: r4(v / 100) })} />
                  <Num label="Y (%)" value={slot.y * 100} onChange={(v) => update(sel, { y: r4(v / 100) })} />
                  <Num label="Lebar (%)" value={slot.w * 100} min={2} onChange={(v) => update(sel, { w: r4(clamp(v, 2, 150) / 100) })} />
                  <Num label="Tinggi (%)" value={slot.h * 100} min={2} onChange={(v) => update(sel, { h: r4(clamp(v, 2, 150) / 100) })} />
                </div>
                <div className="flex flex-col gap-1.5 text-sm">
                  <span className="flex items-center justify-between font-medium">
                    Kemiringan <span className="font-normal tabular-nums text-subtle">{slot.rotation}°</span>
                  </span>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={slot.rotation}
                    onChange={(e) => update(sel, { rotation: Number(e.target.value) })}
                    className="accent-primary"
                    aria-label="Kemiringan"
                  />
                </div>
                <div className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">Bentuk</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {SHAPES.map((sh) => {
                      const off = sh.key === "frame" && !overlay;
                      return (
                        <button
                          key={sh.key}
                          type="button"
                          disabled={off}
                          title={off ? "Hanya bila bingkai di atas foto" : undefined}
                          aria-pressed={slot.shape === sh.key}
                          onClick={() => update(sel, { shape: sh.key as SlotShape, radius: sh.key === "rounded" ? (slot.radius ?? 0.12) : undefined })}
                          className={cn(
                            "h-8 rounded-lg px-2 text-xs font-medium ring-1 ring-inset disabled:opacity-40",
                            slot.shape === sh.key ? "bg-primary-soft text-primary ring-primary/30" : "bg-surface ring-edge-strong hover:bg-canvas",
                          )}
                        >
                          {sh.label}
                        </button>
                      );
                    })}
                  </div>
                  {slot.shape === "frame" && <p className="text-xs text-subtle">Foto mengikuti bentuk lubang di bingkai (hati, bulat, dll.).</p>}
                </div>
                {slot.shape === "rounded" && (
                  <div className="flex flex-col gap-1.5 text-sm">
                    <span className="flex items-center justify-between font-medium">
                      Lengkung sudut <span className="font-normal tabular-nums text-subtle">{Math.round((slot.radius ?? 0) * 200)}%</span>
                    </span>
                    <input type="range" min={0} max={0.5} step={0.01} value={slot.radius ?? 0.12} onChange={(e) => update(sel, { radius: Number(e.target.value) })} className="accent-primary" aria-label="Lengkung sudut" />
                  </div>
                )}
                <div className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">Rapikan</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <Button small onClick={() => update(sel, { x: r4(0.5 - slot.w / 2) })}>
                      <AlignCenterVertical className="size-4" strokeWidth={2} /> Tengah datar
                    </Button>
                    <Button small onClick={() => update(sel, { y: r4(0.5 - slot.h / 2) })}>
                      <AlignCenterHorizontal className="size-4" strokeWidth={2} /> Tengah tegak
                    </Button>
                    <Button small disabled={slots.length < 2} onClick={() => setSlots(slots.map((o) => ({ ...o, w: slot.w, h: slot.h })))} title="Semua slot dibuat seukuran slot ini">
                      <Scaling className="size-4" strokeWidth={2} /> Samakan ukuran
                    </Button>
                    <Button small disabled={slots.length < 2} onClick={() => setSlots(slots.map((o) => ({ ...o, x: r4(0.5 - o.w / 2) })))} title="Semua slot ditengahkan mendatar">
                      <AlignCenterVertical className="size-4" strokeWidth={2} /> Semua di tengah
                    </Button>
                    <Button small disabled={slots.length < 3} onClick={() => setSlots(distribute(slots, "y"))} title="Jarak atas-bawah antar slot dibuat sama">
                      <StretchVertical className="size-4" strokeWidth={2} /> Jarak rata ↕
                    </Button>
                    <Button small disabled={slots.length < 3} onClick={() => setSlots(distribute(slots, "x"))} title="Jarak kiri-kanan antar slot dibuat sama">
                      <StretchHorizontal className="size-4" strokeWidth={2} /> Jarak rata ↔
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    small
                    onClick={() => {
                      if (slots.length >= MAX_SLOTS) return;
                      setSlots([...slots, { ...slot, x: r4(slot.x + 0.03), y: r4(slot.y + 0.03) }]);
                      setSel(slots.length);
                    }}
                    disabled={slots.length >= MAX_SLOTS}
                  >
                    <Copy className="size-4" strokeWidth={2} /> Duplikat
                  </Button>
                  <Button small tone="yellow" className="text-danger" onClick={() => removeSlot(sel)}>
                    <Trash2 className="size-4" strokeWidth={2} /> Hapus slot
                  </Button>
                </div>
              </div>
            )}
          </Panel>

          {problems.length > 0 && (
            <div className="rounded-lg bg-canvas px-4 py-3 text-xs text-subtle">
              <p className="mb-1 font-medium text-fg">Sebelum menyimpan:</p>
              <ul className="list-disc pl-4">
                {problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        )}
      </div>

      <Dialog open={tips} onClose={() => setTips(false)} title="Saran gambar bingkai" wide>
        <FrameTips />
      </Dialog>

      <Dialog open={ask !== null} onClose={() => setAsk(null)} title="Gambar perlu disesuaikan" wide>
        {ask && (
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex gap-3 rounded-lg border border-warning/20 bg-warning-soft px-3 py-2.5 text-warning">
              <Info className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
              <div>
                <p className="font-medium">
                  {ask.src.name} · {ask.src.img.naturalWidth} × {ask.src.img.naturalHeight} px
                </p>
                <ul className="mt-1 list-disc pl-4">
                  {ask.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <p className="mb-2 font-medium">Mau dicetak dengan format apa?</p>
              <FormatPicker value={ask.format} onChange={(f) => setAsk({ ...ask, format: f })} suggested={closestFormat(ask.src.img.naturalWidth, ask.src.img.naturalHeight)} />
            </div>
            <p className="text-subtle">
              Kalau lanjut, gambar diletakkan di kanvas {FORMATS[ask.format].label} ({FORMATS[ask.format].size}). Kamu bisa menggeser, memperbesar, dan memilih warna untuk
              bagian yang kosong — lalu tekan <b className="font-medium text-fg">Terapkan</b>.
            </p>
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <Button
                onClick={() => {
                  URL.revokeObjectURL(ask.src.url);
                  setAsk(null);
                  fileRef.current?.click();
                }}
              >
                Pilih gambar lain
              </Button>
              <Button tone="blue" onClick={() => startAdjust(ask.src, ask.format)}>
                <Crop className="size-4" strokeWidth={2} /> Lanjut atur gambar
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

/** PNG panduan ukuran: kanvas ukuran cetak, garis aman, dan contoh lubang foto transparan bernomor. */
async function downloadGuide(format: TemplateFormat) {
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
    ctx.clearRect(x, y, w, h);
    ctx.strokeStyle = "#2563eb";
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = "#2563eb";
    ctx.font = `600 ${28 * u}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`FOTO ${i + 1} (transparan)`, x + w / 2, y + h / 2);
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
function FrameTips() {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-col divide-y divide-edge rounded-lg ring-1 ring-inset ring-edge">
        {FORMAT_KEYS.map((f) => (
          <div key={f} className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="min-w-0">
              <span className="block font-medium">{FORMATS[f].label}</span>
              <span className="block text-xs text-subtle">
                {FORMATS[f].size} · {FORMATS[f].hint}
              </span>
            </span>
            <button
              type="button"
              onClick={() => void downloadGuide(f)}
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-medium text-primary hover:bg-primary-soft"
            >
              <Download className="size-3.5" strokeWidth={2} /> Panduan
            </button>
          </div>
        ))}
      </div>
      <ul className="flex list-disc flex-col gap-1 pl-4 text-xs text-subtle">
        <li>
          Simpan sebagai <b className="font-medium text-fg">PNG</b> dan buat <b className="font-medium text-fg">bagian foto transparan</b> (dihapus) — posisinya terdeteksi
          otomatis, bentuk apa pun: kotak, bulat, hati.
        </li>
        <li>Pakai ukuran piksel persis seperti di atas. Ukuran lain tetap bisa, nanti diatur posisinya.</li>
        <li>Jauhkan teks & logo penting dari tepi (±3%, garis merah di panduan) — tepi bisa sedikit terpotong saat cetak.</li>
        <li>Ukuran file maksimal 4 MB. Desain dengan warna rata lebih kecil daripada foto penuh.</li>
        <li>Di Canva: Buat desain → Ukuran khusus (px) → unduh PNG dengan &quot;Latar belakang transparan&quot;.</li>
      </ul>
    </div>
  );
}

/** Pilihan format cetak (kartu kecil dengan bentuk kertas). */
function FormatPicker({ value, onChange, suggested }: { value: TemplateFormat; onChange: (f: TemplateFormat) => void; suggested?: TemplateFormat }) {
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
function AdjustStage({
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
        onChange({ ...adjust, ox: Math.round(p.ox + (e.clientX - p.x) / k), oy: Math.round(p.oy + (e.clientY - p.y) / k) });
      }}
      onPointerUp={() => (pan.current = null)}
      onPointerCancel={() => (pan.current = null)}
    >
      {pic("opacity-25")}
      <div className="checker absolute inset-0 overflow-hidden outline-2 outline-offset-0 outline-primary">
        {/* Warna latar hanya di luar gambar (bayangan raksasa di sekeliling area gambar). */}
        {adjust.bg && <div aria-hidden className="pointer-events-none absolute" style={{ left, top, width: iw, height: ih, boxShadow: `0 0 0 100000px ${adjust.bg}` }} />}
        {pic("")}
      </div>
    </div>
  );
}

/** Panel "Atur gambar": format, ukuran (zoom), posisi cepat, warna latar, terapkan. */
function AdjustPanel({
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
          Seret gambar di panggung untuk menggeser, gulir mouse atau pakai slider untuk memperbesar. Yang tercetak hanya isi kotak bergaris.
        </p>
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Format cetak</span>
          <FormatPicker value={adjust.format} onChange={(f) => onChange({ ...adjust, format: f, ox: 0, oy: 0, zoom: 1 })} suggested={closestFormat(img.naturalWidth, img.naturalHeight)} />
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

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
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

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="inline-flex size-8 items-center justify-center rounded-lg text-subtle hover:bg-canvas hover:text-fg disabled:opacity-40">
      {children}
    </button>
  );
}

/** Isian angka 1 desimal; nilai diterapkan saat diketik (bila sah). */
function Num({ label, value, onChange, min }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
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
