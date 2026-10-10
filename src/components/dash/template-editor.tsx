"use client";

/* eslint-disable @next/next/no-img-element -- gambar bingkai lokal (object URL) / server file. */
import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, Eye, ImageUp, Loader2, Pencil, Plus, ScanSearch, SortAsc, Trash2 } from "lucide-react";
import { cn } from "@/components/shared/cn";
import type { ActionState } from "@/lib/dash/action-state";
import { defaultSlots, detectSlots, FORMATS, formatFor, frameProblem, SHAPES, sortSlots } from "@/lib/dash/template";
import type { FrameTemplate, Slot, SlotShape, TemplateCategory } from "@/lib/dash/types";
import { Button, Switch } from "./client";
import { TemplatePreview } from "./template-preview";

type Frame = { src: string; width: number; height: number; file?: File };
type Drag = { kind: "move" | "resize" | "rotate"; i: number; x: number; y: number; start: Slot; corner?: [number, number] };

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
    img.src = src;
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
    if (file.type !== "image/png") return setNotice({ tone: "err", text: "Bingkai harus berupa file PNG (agar bagian transparan terbaca)." });
    if (file.size > MAX_FILE) return setNotice({ tone: "err", text: "File terlalu besar (maks 4 MB). Kecilkan dengan TinyPNG atau ekspor ulang dari Canva/Photoshop." });
    setBusy(true);
    const src = URL.createObjectURL(file);
    try {
      const img = await loadImage(src);
      const problem = frameProblem(img.naturalWidth, img.naturalHeight);
      if (problem) {
        URL.revokeObjectURL(src);
        return setNotice({ tone: "err", text: problem });
      }
      const f = { src, width: img.naturalWidth, height: img.naturalHeight, file };
      setFrame(f);
      applyDetection(img, f, !template);
    } catch {
      URL.revokeObjectURL(src);
      setNotice({ tone: "err", text: "Gambar tidak bisa dibuka. Pastikan file PNG tidak rusak." });
    } finally {
      setBusy(false);
    }
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
    if (d.kind === "move") {
      update(d.i, { x: r4(clamp(s.x + dx / stageW, -0.5, 1.5 - s.w)), y: r4(clamp(s.y + dy / stageH, -0.5, 1.5 - s.h)) });
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
    update(d.i, { x: r4((cx - w / 2) / stageW), y: r4((cy - h / 2) / stageH), w: r4(w / stageW), h: r4(h / stageH) });
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
          <Link href={backHref} className="inline-flex h-10 items-center rounded-lg border border-edge-strong bg-surface px-4 text-sm font-medium shadow-card hover:bg-canvas">
            Batal
          </Link>
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
            <div className="inline-flex rounded-lg bg-canvas p-0.5" role="tablist" aria-label="Tampilan">
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
            <span className="text-xs text-subtle">
              {frame && format ? `${FORMATS[format].label} · ${frame.width}×${frame.height} px` : "Belum ada gambar"}
            </span>
          </header>
          <div ref={boxRef} className="flex justify-center p-4 sm:p-6">
            {!frame ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex aspect-[2/3] w-full max-w-sm flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-edge-strong p-6 text-center text-sm text-subtle hover:border-primary hover:bg-primary-soft/40"
              >
                <ImageUp className="size-10 text-primary" strokeWidth={1.5} />
                <span className="font-medium text-fg">Unggah bingkai PNG</span>
                <span>Strip 600×1800 · 4R 1200×1800 / 1800×1200 px. Bagian foto dibuat transparan.</span>
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
                onPointerUp={() => (drag.current = null)}
                onPointerCancel={() => (drag.current = null)}
                onPointerDown={() => setSel(null)}
                onKeyDown={onKey}
                className="checker relative touch-none select-none rounded-md shadow-card outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
                style={{ width: stageW, height: stageH }}
              >
                <img src={frame.src} alt="" draggable={false} className="pointer-events-none absolute inset-0 size-full" />
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
          {frame && mode === "edit" && (
            <p className="border-t border-edge px-4 py-2.5 text-xs text-subtle">
              Seret slot untuk memindahkan · tarik sudut untuk ubah ukuran (Shift = proporsional) · bulatan atas untuk memutar · panah untuk menggeser halus.
            </p>
          )}
        </section>

        {/* Panel */}
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
            <label className="flex items-start justify-between gap-3 text-sm">
              <span>
                <span className="font-medium">Bingkai di atas foto</span>
                <span className="block text-xs text-subtle">Aktif: foto terlihat lewat bagian transparan. Mati: gambar jadi latar, foto di atasnya.</span>
              </span>
              <Switch checked={overlay} onChange={setOverlay} label="Bingkai di atas foto" />
            </label>
          </Panel>

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
            <ul className="list-disc rounded-lg bg-canvas px-4 py-3 pl-8 text-xs text-subtle">
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
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
