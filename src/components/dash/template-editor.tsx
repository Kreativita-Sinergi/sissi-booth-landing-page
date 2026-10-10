"use client";

/* eslint-disable @next/next/no-img-element -- gambar bingkai lokal (object URL) / server file. */
import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crop,
  Eye,
  ImageUp,
  Info,
  Keyboard,
  Lightbulb,
  Loader2,
  Minus,
  PenLine,
  Pencil,
  PenTool,
  Plus,
  Redo2,
  Scaling,
  ScanSearch,
  Shapes,
  SortAsc,
  Spline,
  StretchHorizontal,
  StretchVertical,
  Tag,
  Trash2,
  Triangle,
  Undo2,
  Waves,
} from "lucide-react";
import { cn } from "@/components/shared/cn";
import type { ActionState } from "@/lib/dash/action-state";
import {
  closestFormat,
  curvePath,
  defaultSlots,
  detectSlots,
  distribute,
  flatHandle,
  FORMATS,
  formatFor,
  isSmooth,
  refitPoints,
  SAFE,
  SHAPES,
  shapePath,
  simplify,
  slotFromPoints,
  slotLayer,
  smoothHandles,
  snapMove,
  snapResize,
  sortSlots,
  tidyCurve,
  type Guides,
} from "@/lib/dash/template";
import type { FrameTemplate, Handle, Slot, SlotLayer, SlotShape, TemplateCategory, TemplateFormat } from "@/lib/dash/types";
import { Button, Dialog, Switch } from "./client";
import {
  ACCEPT,
  AdjustPanel,
  AdjustStage,
  clamp,
  coverScale,
  FormatPicker,
  FrameTips,
  holeMask,
  IconBtn,
  loadImage,
  MAX_FILE,
  MAX_SLOTS,
  mb,
  NoticeBox,
  Num,
  pixels,
  r4,
  type Adjust,
  type Ask,
  type Frame,
  type Source,
} from "./template-editor-parts";
import { TemplatePreview } from "./template-preview";

type SideTab = "elemen" | "latar" | "info";
type Notice = { tone: "ok" | "warn" | "err"; text: string };
type Pt = [number, number];
/** Seret di kanvas: geser (banyak slot), ubah ukuran, putar, kotak pilih, atau titik bentuk bebas. */
type Drag =
  | { kind: "move"; idx: number[]; starts: Slot[]; x: number; y: number; pushed: boolean; before: Slot[] }
  | { kind: "resize"; i: number; start: Slot; corner: [number, number]; x: number; y: number; pushed: boolean; before: Slot[] }
  | { kind: "rotate"; i: number; start: Slot; pushed: boolean; before: Slot[] }
  /** Titik bentuk bebas: anchor = geser titik (+kendalinya), in/out = tarik kendali (brk = patahkan), pull = tarik lengkung baru dari titik (Alt). */
  | { kind: "vertex"; i: number; k: number; part: "anchor" | "in" | "out" | "pull"; brk: boolean; start: Slot; x: number; y: number; pushed: boolean; before: Slot[] }
  | { kind: "marquee"; x0: number; y0: number; add: boolean };
/** Menggambar: pen = klik (titik sudut) / klik-seret (titik lengkung) seperti Photoshop; lasso = seret bebas. */
type Draw = { kind: "pen" | "lasso"; pts: Pt[]; hs: Handle[]; hover?: Pt; down?: boolean; closing?: boolean };

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? "⌘" : "Ctrl";
const zoomStep = (z: number, d: number) => clamp(Math.round((z + d) * 100) / 100, 0.5, 3);

const SHORTCUTS: [string, string][] = [
  [`${MOD} Z`, "Urungkan"],
  [`${MOD} ⇧ Z / ${MOD} Y`, "Ulangi"],
  [`${MOD} C / ${MOD} V`, "Salin / tempel foto"],
  [`${MOD} D`, "Duplikat foto"],
  ["Delete / Backspace", "Hapus foto (saat menggambar: hapus titik terakhir)"],
  [`${MOD} A`, "Pilih semua foto"],
  ["Shift + klik", "Pilih beberapa foto"],
  ["Seret di area kosong", "Pilih beberapa foto sekaligus"],
  ["Panah (Shift = jauh)", "Geser foto"],
  [`${MOD} [ / ${MOD} ]`, "Urutan foto lebih awal / lebih akhir"],
  ["Pen: klik / klik + seret", "Titik sudut / titik lengkung"],
  ["Pen: klik titik pertama", "Tutup bentuk (Enter juga bisa)"],
  ["Klik dua kali bentuk bebas", "Edit titik bentuk"],
  ["Edit titik: seret kendali", "Ubah lengkung (Alt = patahkan sudut)"],
  ["Edit titik: Alt + seret titik", "Tarik lengkung baru · Alt + klik = jadikan sudut"],
  ["Enter", "Selesai menggambar / edit titik"],
  ["Esc", "Batal menggambar / lepas pilihan"],
  ["Shift saat tarik sudut", "Ubah ukuran proporsional"],
  ["Alt saat menyeret", "Matikan magnet"],
  ["P", "Pratinjau / kembali mengatur"],
  [`${MOD} + / ${MOD} − / ${MOD} 0`, "Perbesar / perkecil / pas layar (atau Ctrl + roda mouse)"],
  [`${MOD} S`, "Simpan template"],
  ["?", "Tampilkan pintasan"],
];

/** Ikon kecil bentuk slot (untuk tombol pilih bentuk). */
function ShapeIcon({ shape, points, className }: { shape: SlotShape; points?: Pt[]; className?: string }) {
  const s: Slot = { x: 0, y: 0, w: 1, h: 1, rotation: 0, shape, radius: 0.25, points };
  return (
    <svg viewBox="-0.1 -0.1 1.2 1.2" className={cn("size-4", className)} aria-hidden>
      <path
        d={shapePath(s, 1)}
        fill="currentColor"
        fillOpacity={shape === "frame" ? 0 : 0.25}
        stroke="currentColor"
        strokeWidth={0.09}
        strokeDasharray={shape === "frame" ? "0.15 0.1" : undefined}
      />
    </svg>
  );
}

/**
 * Editor template bingkai bergaya Canva (dashboard pemilik & admin Sissi): kanvas besar + toolbar kontekstual,
 * sidebar Elemen/Latar/Info/Pintasan, pilih banyak, urungkan/ulangi, salin-tempel, pintasan keyboard, zoom,
 * magnet, dan bentuk foto bebas buatan sendiri (klik titik demi titik atau seret bebas).
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
  const [hist, setHist] = useState<{ past: Slot[][]; future: Slot[][] }>({ past: [], future: [] });
  const [sel, setSel] = useState<number[]>([]);
  const [name, setName] = useState(template?.name ?? "");
  const [cats, setCats] = useState<Set<string>>(new Set(template?.categories.map((c) => c.id) ?? []));
  const [active, setActive] = useState(template?.active ?? true);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [side, setSide] = useState<SideTab>(template ? "elemen" : "latar");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [guides, setGuides] = useState<Guides>({ v: [], h: [] });
  const [showSafe, setShowSafe] = useState(true);
  const [tips, setTips] = useState(false);
  const [keys, setKeys] = useState(false);
  const [source, setSource] = useState<Source | null>(null);
  const [ask, setAsk] = useState<Ask | null>(null);
  const [adjust, setAdjust] = useState<Adjust | null>(null);
  const [zoom, setZoom] = useState(1);
  const [draw, setDraw] = useState<Draw | null>(null);
  const [editPts, setEditPts] = useState<number | null>(null);
  const [clip, setClip] = useState<Slot[]>([]);
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [showTodo, setShowTodo] = useState(false);
  const [shapeMenu, setShapeMenu] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  // Titik coretan "seret bebas" dikumpulkan di ref: gerakan mouse cepat tidak boleh tertimpa render yang tertunda.
  const lasso = useRef<Pt[] | null>(null);
  const [areaW, setAreaW] = useState(0);
  // Tinggi area kanvas hanya dipakai di desktop, saat editor mengisi layar penuh (tingginya tetap).
  const [areaH, setAreaH] = useState(0);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const wide = window.matchMedia("(min-width: 1024px)");
    const ro = new ResizeObserver(([e]) => {
      setAreaW(e.contentRect.width);
      setAreaH(wide.matches ? e.contentRect.height : 0);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Lepas object URL lama (gambar asli & bingkai) saat diganti / editor ditutup.
  useEffect(() => {
    const url = source?.url;
    return () => {
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  }, [source?.url]);
  useEffect(() => {
    const src = frame?.src;
    return () => {
      if (src?.startsWith("blob:")) URL.revokeObjectURL(src);
    };
  }, [frame?.src]);

  const format = frame ? formatFor(frame.width, frame.height) : null;
  const maxH = areaH > 0 ? Math.max(240, areaH - 8) : typeof window === "undefined" ? 640 : Math.max(380, window.innerHeight * 0.62);
  const fitW = frame ? Math.max(120, Math.min((areaW || 600) - 8, (maxH * frame.width) / frame.height)) : 0;
  const stageW = fitW * zoom;
  const stageH = frame ? (stageW * frame.height) / frame.width : 0;
  const one = sel.length === 1 ? sel[0] : null;
  const slot = one !== null ? slots[one] : undefined;

  // --- riwayat (urungkan/ulangi) ---

  function change(next: Slot[]) {
    setHist({ past: [...hist.past.slice(-99), slots], future: [] });
    setSlots(next);
  }
  function update(i: number, patch: Partial<Slot>) {
    change(slots.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  }
  function replace(i: number, next: Slot) {
    change(slots.map((s, j) => (j === i ? next : s)));
  }
  function undo() {
    const prev = hist.past[hist.past.length - 1];
    if (!prev) return;
    setHist({ past: hist.past.slice(0, -1), future: [slots, ...hist.future] });
    setSlots(prev);
    setSel((cur) => cur.filter((i) => i < prev.length));
    setEditPts(null);
  }
  function redo() {
    const next = hist.future[0];
    if (!next) return;
    setHist({ past: [...hist.past, slots], future: hist.future.slice(1) });
    setSlots(next);
    setSel((cur) => cur.filter((i) => i < next.length));
  }

  // --- gambar latar / bingkai ---

  function applyDetection(img: HTMLImageElement, f: Frame, replace: boolean) {
    const fmt = formatFor(f.width, f.height);
    let found: ReturnType<typeof detectSlots>;
    try {
      const px = pixels(img);
      found = detectSlots(px.data, px.w, px.h);
    } catch {
      setNotice({ tone: "warn", text: "Gambar tidak bisa dibaca untuk deteksi otomatis. Unggah ulang gambarnya untuk mendeteksi lubang." });
      return;
    }
    if (found.slots.length > 0) {
      setOverlay(true);
      change(found.slots.slice(0, MAX_SLOTS));
      setSel([0]);
      setSide("elemen");
      setNotice({ tone: "ok", text: `${found.slots.length} lubang foto terdeteksi dan sudah jadi slot. Klik slot untuk mengubahnya.` });
    } else if (replace || slots.length === 0) {
      setOverlay(found.transparent);
      change(fmt ? defaultSlots(fmt) : []);
      setSel([]);
      setSide("elemen");
      setNotice({
        tone: "warn",
        text: found.transparent
          ? "Tidak ada lubang foto yang cukup besar. Slot contoh dipasang — geser, ubah, atau gambar bentuk sendiri."
          : "Gambar dipakai sebagai latar (tidak ada bagian transparan). Slot contoh dipasang — atur sendiri atau gambar bentuk bebas.",
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
    if (!src.png) reasons.push("File ini bukan PNG, jadi tidak punya bagian transparan. Gambar dipakai sebagai latar dan slot foto kamu atur sendiri di atasnya.");
    if (!fmt) reasons.push(`Ukurannya ${w} × ${h} px — bentuknya tidak sama dengan format cetak mana pun, jadi perlu dipotong atau diberi latar.`);
    else if (Math.min(w, h) < FORMATS[fmt].minShort) {
      reasons.push(`Gambar lebih kecil dari ukuran cetak ${FORMATS[fmt].label} (${FORMATS[fmt].size}). Masih bisa dipakai, tapi hasil cetak bisa sedikit buram.`);
    }
    if (Math.max(w, h) > 6000) reasons.push("Gambar sangat besar (lebih dari 6000 px). Akan diperkecil otomatis ke ukuran cetak.");
    if (file.size > MAX_FILE) {
      reasons.push(`Ukuran file ${mb(file.size)} MB melebihi batas 4 MB. Gambar akan disimpan ulang di ukuran cetak — biasanya jadi lebih kecil. Kalau masih terlalu besar, kecilkan dulu dengan TinyPNG.`);
    }
    if (reasons.length > 0) {
      setAsk({ src, reasons, format: fmt ?? closestFormat(w, h) });
      return;
    }
    setSource(src);
    const f = { src: URL.createObjectURL(file), width: w, height: h, file };
    setFrame(f);
    setZoom(1);
    applyDetection(img, f, !template || slots.length === 0);
  }

  function startAdjust(src: Source, fmt: TemplateFormat) {
    setSource(src);
    setAsk(null);
    setMode("edit");
    setNotice(null);
    setSide("latar");
    // Latar putih bawaan: bagian kosong transparan bisa terbaca sebagai lubang foto.
    setAdjust({ src, format: fmt, zoom: 1, ox: 0, oy: 0, bg: "#ffffff" });
  }

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
    setZoom(1);
    applyDetection(out, f, slots.length === 0);
  }

  async function redetect() {
    if (!frame) return;
    setBusy(true);
    try {
      applyDetection(await loadImage(frame.src, !frame.src.startsWith("blob:")), frame, true);
    } catch {
      setNotice({ tone: "warn", text: "Gambar tidak bisa dibaca untuk deteksi otomatis. Unggah ulang gambarnya untuk mendeteksi lubang." });
    } finally {
      setBusy(false);
    }
  }

  // --- slot ---

  /** Slot baru di tengah, kira-kira persegi di layar; di atas bingkai agar langsung terlihat. */
  function addShape(shape: SlotShape) {
    if (!frame || slots.length >= MAX_SLOTS) return;
    const w = format === "strip_2x6" ? 0.6 : 0.36;
    const h = r4(Math.min(0.8, (w * frame.width) / frame.height));
    const s: Slot = { x: r4(0.5 - w / 2), y: r4(0.5 - h / 2), w, h, rotation: 0, shape, layer: "above", radius: shape === "rounded" ? 0.15 : undefined };
    change([...slots, s]);
    setSel([slots.length]);
    setDraw(null);
    setEditPts(null);
    setMode("edit");
  }

  function setShape(i: number, shape: SlotShape) {
    const cur = slots[i];
    update(i, {
      shape,
      radius: shape === "rounded" ? (cur.radius ?? 0.12) : undefined,
      layer: shape === "frame" ? "below" : cur.layer,
      points: shape === "custom" ? cur.points : undefined,
    });
  }

  function setLayer(idx: number[], layer: SlotLayer) {
    change(slots.map((s, j) => (idx.includes(j) ? { ...s, layer, shape: layer === "above" && s.shape === "frame" ? "rect" : s.shape } : s)));
  }

  function duplicate(idx: number[]) {
    if (!idx.length || slots.length + idx.length > MAX_SLOTS) return;
    const copies = idx.map((i) => ({ ...slots[i], x: r4(slots[i].x + 0.03), y: r4(slots[i].y + 0.03) }));
    change([...slots, ...copies]);
    setSel(copies.map((_, k) => slots.length + k));
  }

  function remove(idx: number[]) {
    if (!idx.length) return;
    change(slots.filter((_, j) => !idx.includes(j)));
    setSel([]);
    setEditPts(null);
  }

  function paste() {
    if (!clip.length || slots.length + clip.length > MAX_SLOTS) return;
    const copies = clip.map((s) => ({ ...s, x: r4(s.x + 0.03), y: r4(s.y + 0.03) }));
    change([...slots, ...copies]);
    setSel(copies.map((_, k) => slots.length + k));
    setClip(copies);
  }

  /** Urutan foto (= urutan jepret & tumpukan antar foto): pindahkan lebih awal/akhir. */
  function reorder(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= slots.length) return;
    const next = [...slots];
    [next[i], next[j]] = [next[j], next[i]];
    change(next);
    setSel([j]);
  }

  /** Rata: beberapa foto → patokan kotak gabungan pilihan; satu foto → patokan halaman. */
  function align(kind: "l" | "c" | "r" | "t" | "m" | "b") {
    const ss = sel.map((i) => slots[i]);
    const [lx, rx, ty, by] =
      sel.length === 1
        ? [0, 1, 0, 1]
        : [Math.min(...ss.map((s) => s.x)), Math.max(...ss.map((s) => s.x + s.w)), Math.min(...ss.map((s) => s.y)), Math.max(...ss.map((s) => s.y + s.h))];
    change(
      slots.map((s, j) => {
        if (!sel.includes(j)) return s;
        if (kind === "l") return { ...s, x: r4(lx) };
        if (kind === "c") return { ...s, x: r4((lx + rx) / 2 - s.w / 2) };
        if (kind === "r") return { ...s, x: r4(rx - s.w) };
        if (kind === "t") return { ...s, y: r4(ty) };
        if (kind === "m") return { ...s, y: r4((ty + by) / 2 - s.h / 2) };
        return { ...s, y: r4(by - s.h) };
      }),
    );
  }

  function spread(axis: "x" | "y") {
    const picked = distribute(sel.map((i) => slots[i]), axis);
    change(slots.map((s, j) => (sel.includes(j) ? picked[sel.indexOf(j)] : s)));
  }

  function sameSize() {
    const ref = slots[sel[sel.length - 1]];
    change(slots.map((s, j) => (sel.includes(j) ? { ...s, w: ref.w, h: ref.h } : s)));
  }

  // --- bentuk bebas ---

  function finishDraw(pts: Pt[], hs?: Handle[]) {
    setDraw(null);
    // Klik dua kali untuk selesai menambah titik kembar → buang.
    const keep = pts.map((p, k) => k === 0 || Math.hypot((p[0] - pts[k - 1][0]) * stageW, (p[1] - pts[k - 1][1]) * stageH) > 2);
    pts = pts.filter((_, k) => keep[k]);
    hs = hs?.filter((_, k) => keep[k]);
    const s = slotFromPoints(pts, "above", hs);
    if (!s) return setNotice({ tone: "warn", text: "Bentuk terlalu kecil atau kurang dari 3 titik. Coba gambar lagi." });
    if (slots.length >= MAX_SLOTS) return setNotice({ tone: "warn", text: `Maksimal ${MAX_SLOTS} foto.` });
    change([...slots, s]);
    setSel([slots.length]);
    setNotice({ tone: "ok", text: "Bentuk bebas jadi slot foto. Klik dua kali bentuknya untuk mengedit titik." });
  }

  function startDraw(kind: Draw["kind"]) {
    setMode("edit");
    setSel([]);
    setEditPts(null);
    setDraw(draw?.kind === kind ? null : { kind, pts: [], hs: [] });
  }

  // --- interaksi kanvas ---

  const toLocal = (e: { clientX: number; clientY: number }): Pt => {
    const r = stageRef.current!.getBoundingClientRect();
    return [(e.clientX - r.left) / stageW, (e.clientY - r.top) / stageH];
  };

  function beginSlot(e: React.PointerEvent, i: number) {
    if (draw) return;
    e.stopPropagation();
    if (e.shiftKey) {
      setSel(sel.includes(i) ? sel.filter((j) => j !== i) : [...sel, i]);
      return;
    }
    const idx = sel.includes(i) ? sel : [i];
    if (!sel.includes(i)) setSel([i]);
    if (editPts !== null && editPts !== i) setEditPts(null);
    drag.current = { kind: "move", idx, starts: idx.map((j) => slots[j]), x: e.clientX, y: e.clientY, pushed: false, before: slots };
    stageRef.current?.setPointerCapture(e.pointerId);
    stageRef.current?.focus({ preventScroll: true });
  }

  function beginHandle(e: React.PointerEvent, i: number, kind: "resize" | "rotate", corner: [number, number] = [0, 0]) {
    e.stopPropagation();
    e.preventDefault();
    drag.current =
      kind === "rotate"
        ? { kind, i, start: slots[i], pushed: false, before: slots }
        : { kind, i, start: slots[i], corner, x: e.clientX, y: e.clientY, pushed: false, before: slots };
    stageRef.current?.setPointerCapture(e.pointerId);
  }

  function beginVertex(e: React.PointerEvent, i: number, k: number, part: "anchor" | "in" | "out") {
    e.stopPropagation();
    e.preventDefault();
    const s = slots[i];
    // Kendali selalu lengkap selama diedit (titik sudut = kendali menempel ke titiknya).
    const start = { ...s, handles: s.handles?.length === s.points?.length ? s.handles : (s.points ?? []).map(flatHandle) };
    const pull = part === "anchor" && e.altKey;
    drag.current = { kind: "vertex", i, k, part: pull ? "pull" : part, brk: e.altKey, start, x: e.clientX, y: e.clientY, pushed: false, before: slots };
    stageRef.current?.setPointerCapture(e.pointerId);
  }

  function stageDown(e: React.PointerEvent) {
    stageRef.current?.focus({ preventScroll: true });
    setShapeMenu(false);
    if (draw) {
      const p = toLocal(e);
      if (draw.kind === "lasso") {
        stageRef.current?.setPointerCapture(e.pointerId);
        lasso.current = [p];
        setDraw({ kind: "lasso", pts: [p], hs: [], down: true });
        return;
      }
      // Pen: tekan = titik baru; seret sebelum lepas = tarik lengkungnya. Tekan titik pertama = tutup bentuk.
      stageRef.current?.setPointerCapture(e.pointerId);
      const first = draw.pts[0];
      if (first && draw.pts.length >= 2 && Math.hypot((p[0] - first[0]) * stageW, (p[1] - first[1]) * stageH) < 10) {
        setDraw({ ...draw, hover: undefined, down: true, closing: true });
        return;
      }
      setDraw({ ...draw, pts: [...draw.pts, p], hs: [...draw.hs, flatHandle(p)], hover: undefined, down: true });
      return;
    }
    if (editPts !== null) setEditPts(null);
    const [x, y] = toLocal(e);
    drag.current = { kind: "marquee", x0: x, y0: y, add: e.shiftKey };
    stageRef.current?.setPointerCapture(e.pointerId);
    if (!e.shiftKey) setSel([]);
  }

  /** Simpan riwayat sekali di awal seretan (satu seretan = satu langkah urungkan). */
  function pushOnce(d: { pushed: boolean; before: Slot[] }) {
    if (d.pushed) return;
    d.pushed = true;
    setHist({ past: [...hist.past.slice(-99), d.before], future: [] });
  }

  function stageMove(e: React.PointerEvent) {
    if (draw) {
      const p = toLocal(e);
      if (draw.kind === "lasso") {
        const pts = lasso.current;
        if (!pts) return;
        const last = pts[pts.length - 1];
        if (Math.hypot((p[0] - last[0]) * stageW, (p[1] - last[1]) * stageH) >= 3) {
          pts.push(p);
          setDraw({ kind: "lasso", pts: [...pts], hs: [], down: true });
        }
        return;
      }
      setDraw((d) => {
        if (!d) return d;
        if (!d.down) return { ...d, hover: p };
        // Sedang ditekan: kendali keluar = kursor, kendali masuk = cerminannya (titik lengkung halus).
        const k = d.closing ? 0 : d.pts.length - 1;
        const [ax, ay] = d.pts[k];
        if (Math.hypot((p[0] - ax) * stageW, (p[1] - ay) * stageH) < 3) return d;
        const hs = d.hs.slice();
        hs[k] = [2 * ax - p[0], 2 * ay - p[1], p[0], p[1]];
        return { ...d, hs };
      });
      return;
    }
    const d = drag.current;
    if (!d || !stageW) return;
    const thrX = 6 / stageW, thrY = 6 / stageH;
    if (d.kind === "marquee") {
      const [x, y] = toLocal(e);
      setMarquee({ x: Math.min(d.x0, x), y: Math.min(d.y0, y), w: Math.abs(x - d.x0), h: Math.abs(y - d.y0) });
      return;
    }
    if (d.kind === "move") {
      const dx = (e.clientX - d.x) / stageW, dy = (e.clientY - d.y) / stageH;
      if (!d.pushed && Math.abs(dx * stageW) < 2 && Math.abs(dy * stageH) < 2) return; // klik biasa, bukan seret
      pushOnce(d);
      // Magnet untuk kotak gabungan foto yang diseret.
      const gx = Math.min(...d.starts.map((s) => s.x)), gy = Math.min(...d.starts.map((s) => s.y));
      const g: Slot = { x: gx, y: gy, w: Math.max(...d.starts.map((s) => s.x + s.w)) - gx, h: Math.max(...d.starts.map((s) => s.y + s.h)) - gy, rotation: 0, shape: "rect" };
      const moved = { ...g, x: g.x + dx, y: g.y + dy };
      const snapped = e.altKey ? { x: moved.x, y: moved.y, guides: { v: [], h: [] } } : snapMove(moved, slots.filter((_, j) => !d.idx.includes(j)), thrX, thrY);
      setGuides(snapped.guides);
      const ox = snapped.x - g.x, oy = snapped.y - g.y;
      setSlots(
        slots.map((s, j) => {
          const k = d.idx.indexOf(j);
          return k < 0 ? s : { ...s, x: r4(clamp(d.starts[k].x + ox, -0.5, 1.5 - s.w)), y: r4(clamp(d.starts[k].y + oy, -0.5, 1.5 - s.h)) };
        }),
      );
      return;
    }
    pushOnce(d);
    const s = d.start;
    const t = (s.rotation * Math.PI) / 180, cos = Math.cos(t), sin = Math.sin(t);
    const w0 = s.w * stageW, h0 = s.h * stageH;
    const cx0 = s.x * stageW + w0 / 2, cy0 = s.y * stageH + h0 / 2;
    const set = (patch: Partial<Slot>) => setSlots(slots.map((o, j) => (j === d.i ? { ...o, ...patch } : o)));
    if (d.kind === "rotate") {
      const r = stageRef.current!.getBoundingClientRect();
      let deg = (Math.atan2(e.clientY - (r.top + cy0), e.clientX - (r.left + cx0)) * 180) / Math.PI + 90;
      if (deg > 180) deg -= 360;
      const snap = Math.round(deg / 15) * 15;
      if (!e.altKey && Math.abs(deg - snap) < 4) deg = snap; // menempel ke kelipatan 15°
      set({ rotation: Math.round(deg * 10) / 10 });
      return;
    }
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    // Selisih pointer di sumbu foto (sebelum rotasi).
    const lx = dx * cos + dy * sin, ly = -dx * sin + dy * cos;
    if (d.kind === "vertex") {
      if (!d.pushed && Math.abs(dx) < 2 && Math.abs(dy) < 2) return; // klik biasa (Alt + klik = jadikan sudut)
      const ux = lx / w0, uy = ly / h0;
      const pts = s.points ?? [];
      const hs = (s.handles ?? []).slice();
      const [ax, ay] = pts[d.k];
      const h = hs[d.k];
      if (d.part === "anchor") {
        set({
          points: pts.map((p, k) => (k === d.k ? ([r4(ax + ux), r4(ay + uy)] as Pt) : p)),
          handles: hs.map((c, k) => (k === d.k ? ([r4(c[0] + ux), r4(c[1] + uy), r4(c[2] + ux), r4(c[3] + uy)] as Handle) : c)),
        });
        return;
      }
      if (d.part === "pull") {
        hs[d.k] = [r4(ax - ux), r4(ay - uy), r4(ax + ux), r4(ay + uy)];
        set({ handles: hs });
        return;
      }
      // Tarik satu kendali; tanpa Alt, kendali seberang ikut berputar segaris (panjangnya tetap) agar lengkung mulus.
      const out = d.part === "out";
      const nx = (out ? h[2] : h[0]) + ux, ny = (out ? h[3] : h[1]) + uy;
      const ox = out ? h[0] : h[2], oy = out ? h[1] : h[3];
      let next: Handle = out ? [ox, oy, r4(nx), r4(ny)] : [r4(nx), r4(ny), ox, oy];
      const oLen = Math.hypot((ox - ax) * w0, (oy - ay) * h0), nLen = Math.hypot((nx - ax) * w0, (ny - ay) * h0);
      if (!d.brk && oLen > 0.5 && nLen > 0.5) {
        const mx = r4(ax - (((nx - ax) * w0) / nLen) * (oLen / w0)), my = r4(ay - (((ny - ay) * h0) / nLen) * (oLen / h0));
        next = out ? [mx, my, r4(nx), r4(ny)] : [r4(nx), r4(ny), mx, my];
      }
      hs[d.k] = next;
      set({ handles: hs });
      return;
    }
    const [sx, sy] = d.corner;
    let w = Math.max(12, w0 + sx * lx), h = Math.max(12, h0 + sy * ly);
    if (e.shiftKey && sx !== 0 && sy !== 0) {
      const k = Math.max(w / w0, h / h0);
      w = w0 * k;
      h = h0 * k;
    }
    const ox = (sx * (w - w0)) / 2, oy = (sy * (h - h0)) / 2;
    const cx = cx0 + ox * cos - oy * sin, cy = cy0 + ox * sin + oy * cos;
    const resized = { ...s, x: (cx - w / 2) / stageW, y: (cy - h / 2) / stageH, w: w / stageW, h: h / stageH };
    if (s.rotation === 0 && !e.shiftKey && !e.altKey) {
      const snapped = snapResize(resized, [sx, sy], slots.filter((_, j) => j !== d.i), thrX, thrY);
      setGuides(snapped.guides);
      const o = snapped.slot;
      set({ x: r4(o.x), y: r4(o.y), w: r4(Math.max(0.02, o.w)), h: r4(Math.max(0.02, o.h)) });
      return;
    }
    setGuides({ v: [], h: [] });
    set({ x: r4(resized.x), y: r4(resized.y), w: r4(resized.w), h: r4(resized.h) });
  }

  function stageUp() {
    if (draw?.kind === "pen" && draw.down) {
      if (draw.closing) finishDraw(draw.pts, draw.hs);
      else setDraw({ ...draw, down: false });
      return;
    }
    if (draw?.kind === "lasso" && lasso.current) {
      const raw = lasso.current;
      lasso.current = null;
      // Sederhanakan coretan (dalam piksel layar) agar titiknya ringkas (≤ 200), lalu haluskan jadi kurva rapi.
      let tol = 3;
      let px = simplify(raw.map(([x, y]) => [x * stageW, y * stageH] as Pt), tol);
      while (px.length > 200) px = simplify(px, (tol *= 1.6));
      // Titik terakhir ≈ titik awal (coretan tertutup) → buang agar tidak ada sudut kembar.
      if (px.length > 3 && Math.hypot(px[0][0] - px[px.length - 1][0], px[0][1] - px[px.length - 1][1]) < 8) px = px.slice(0, -1);
      const pts = px.map(([x, y]) => [x / stageW, y / stageH] as Pt);
      finishDraw(pts, pts.length >= 3 ? smoothHandles(pts) : undefined);
      return;
    }
    const d = drag.current;
    drag.current = null;
    setGuides({ v: [], h: [] });
    if (!d) return;
    if (d.kind === "marquee") {
      const m = marquee;
      setMarquee(null);
      if (!m || (m.w * stageW < 4 && m.h * stageH < 4)) return;
      const hit = slots.flatMap((s, j) => (s.x < m.x + m.w && s.x + s.w > m.x && s.y < m.y + m.h && s.y + s.h > m.y ? [j] : []));
      setSel(d.add ? [...new Set([...sel, ...hit])] : hit);
      return;
    }
    if (d.kind === "vertex" && frame) {
      if (!d.pushed) {
        // Alt + klik titik (tanpa seret) = jadikan titik sudut.
        if (d.part === "pull" && isSmooth(d.start.points![d.k], d.start.handles![d.k])) {
          const hs = d.start.handles!.slice();
          hs[d.k] = flatHandle(d.start.points![d.k]);
          change(slots.map((s, j) => (j === d.i ? tidyCurve(refitPoints({ ...s, handles: hs }, frame.width, frame.height)) : s)));
        }
        return;
      }
      // Titik boleh keluar kotak saat diseret; setelah dilepas, kotak foto disesuaikan.
      setSlots((cur) => cur.map((s, j) => (j === d.i ? tidyCurve(refitPoints(s, frame.width, frame.height)) : s)));
    }
  }

  // --- pintasan keyboard ---

  function onKey(e: KeyboardEvent) {
    const t = e.target as HTMLElement | null;
    if (t && (t.closest("input, textarea, [contenteditable=true]") || t.closest("[role=dialog]"))) return;
    if (ask || tips || keys) return;
    const mod = e.metaKey || e.ctrlKey;
    const k = e.key.toLowerCase();
    if (mod && k === "s") {
      e.preventDefault();
      return submit();
    }
    if (e.key === "?") return setKeys(true);
    if (adjust) return;
    if (mod && (k === "=" || k === "+")) {
      e.preventDefault();
      return setZoom((z) => zoomStep(z, 0.25));
    }
    if (mod && k === "-") {
      e.preventDefault();
      return setZoom((z) => zoomStep(z, -0.25));
    }
    if (mod && k === "0") {
      e.preventDefault();
      return setZoom(1);
    }
    if (!mod && k === "p" && frame) return setMode((m) => (m === "edit" ? "preview" : "edit"));
    if (mode !== "edit") return;
    if (draw) {
      if (e.key === "Escape") setDraw(null);
      else if (e.key === "Enter") finishDraw(draw.pts, draw.hs);
      else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        setDraw({ ...draw, pts: draw.pts.slice(0, -1), hs: draw.hs.slice(0, -1) });
      }
      return;
    }
    if (e.key === "Escape" || (e.key === "Enter" && editPts !== null)) {
      if (editPts !== null) return setEditPts(null);
      return setSel([]);
    }
    if (mod && k === "z") {
      e.preventDefault();
      return e.shiftKey ? redo() : undo();
    }
    if (mod && k === "y") {
      e.preventDefault();
      return redo();
    }
    if (mod && k === "a") {
      e.preventDefault();
      return setSel(slots.map((_, i) => i));
    }
    if (mod && k === "v") {
      e.preventDefault();
      return paste();
    }
    if (!sel.length) return;
    if (mod && k === "c") {
      e.preventDefault();
      return setClip(sel.map((i) => slots[i]));
    }
    if (mod && k === "d") {
      e.preventDefault();
      return duplicate(sel);
    }
    if (mod && (e.key === "[" || e.key === "]") && one !== null) {
      e.preventDefault();
      return reorder(one, e.key === "[" ? -1 : 1);
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      return remove(sel);
    }
    const step = e.shiftKey ? 0.01 : 0.002;
    const moves: Record<string, Pt> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      const [dx, dy] = moves[e.key];
      change(slots.map((s, j) => (sel.includes(j) ? { ...s, x: r4(s.x + dx), y: r4(s.y + dy) } : s)));
    }
  }
  const keyRef = useRef(onKey);
  useEffect(() => {
    keyRef.current = onKey;
  });
  useEffect(() => {
    const f = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);

  // Ctrl/⌘ + roda mouse = zoom kanvas (tanpa ikut menggulir halaman).
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => clamp(z * (e.deltaY < 0 ? 1.08 : 1 / 1.08), 0.5, 3));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);

  // --- simpan ---

  const todo: { text: string; tab?: SideTab }[] = [];
  if (!frame) todo.push({ text: "Unggah gambar latar / bingkai.", tab: "latar" });
  else if (!format) todo.push({ text: "Ukuran gambar tidak cocok dengan format cetak — atur posisi gambar.", tab: "latar" });
  if (!name.trim()) todo.push({ text: "Isi nama template (kolom di atas)." });
  if (slots.length === 0) todo.push({ text: "Tambahkan minimal satu foto.", tab: "elemen" });

  function submit() {
    if (todo.length || !frame || !format) {
      setShowTodo(true);
      return;
    }
    const f = new FormData();
    if (template) f.set("id", template.id);
    f.set(
      "meta",
      JSON.stringify({
        name: name.trim(),
        format,
        frame_overlay: overlay,
        slots: slots.map((s) => {
          const shape = !overlay && s.shape === "frame" ? "rect" : s.shape;
          return { ...s, shape, layer: slotLayer({ ...s, shape }, overlay), x: r4(s.x), y: r4(s.y), w: r4(s.w), h: r4(s.h) };
        }),
        category_ids: [...cats],
        active,
      }),
    );
    if (frame.file) f.set("frame", frame.file);
    startTransition(() => run(f));
  }

  const serverFields = Object.entries(state.fields ?? {});
  const color = (s: Slot) => (slotLayer(s, overlay) === "above" ? "var(--color-info)" : "var(--color-primary)");

  return (
    // Desktop: ruang kerja layar penuh seperti Canva — halaman tidak bergulir, hanya panel & kanvas di dalamnya.
    <div className="flex flex-col gap-3 lg:fixed lg:inset-0 lg:z-40 lg:bg-canvas lg:p-3">
      {/* Bar atas */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-edge bg-surface px-3 py-2 shadow-card">
        <Link href={backHref} className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-sm text-subtle hover:bg-canvas hover:text-fg" title="Kembali ke daftar template">
          <ArrowLeft className="size-4" strokeWidth={2} /> <span className="hidden sm:inline">Template</span>
        </Link>
        <span className="hidden h-6 w-px bg-edge sm:block" />
        <input
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder={builtin ? "Nama template bawaan…" : "Nama template…"}
          aria-label="Nama template"
          className={cn(
            "order-last h-9 min-w-0 basis-full rounded-lg border border-edge bg-transparent px-2 text-base font-semibold outline-none placeholder:font-normal placeholder:text-subtle hover:border-edge focus:border-primary focus:ring-3 focus:ring-primary/15 sm:order-none sm:max-w-xs sm:flex-1 sm:basis-auto sm:border-transparent",
            showTodo && !name.trim() && "border-danger",
          )}
        />
        <div className="flex items-center gap-0.5">
          <IconBtn label={`Urungkan (${MOD} Z)`} onClick={undo} disabled={!hist.past.length}>
            <Undo2 className="size-4" strokeWidth={2} />
          </IconBtn>
          <IconBtn label={`Ulangi (${MOD} ⇧ Z)`} onClick={redo} disabled={!hist.future.length}>
            <Redo2 className="size-4" strokeWidth={2} />
          </IconBtn>
        </div>
        <span className="hidden h-6 w-px bg-edge md:block" />
        <div className="hidden items-center gap-0.5 md:flex">
          <IconBtn label={`Perkecil (${MOD} −)`} onClick={() => setZoom((z) => zoomStep(z, -0.25))} disabled={!frame}>
            <Minus className="size-4" strokeWidth={2} />
          </IconBtn>
          <button type="button" onClick={() => setZoom(1)} disabled={!frame} title={`Pas layar (${MOD} 0)`} className="h-8 min-w-12 rounded-lg px-1 text-xs tabular-nums text-subtle hover:bg-canvas disabled:opacity-40">
            {Math.round(zoom * 100)}%
          </button>
          <IconBtn label={`Perbesar (${MOD} +)`} onClick={() => setZoom((z) => zoomStep(z, 0.25))} disabled={!frame}>
            <Plus className="size-4" strokeWidth={2} />
          </IconBtn>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <IconBtn label="Pintasan keyboard (?)" onClick={() => setKeys(true)}>
            <Keyboard className="size-[18px]" strokeWidth={2} />
          </IconBtn>
          <Button small onClick={() => setMode(mode === "edit" ? "preview" : "edit")} disabled={!frame || !!adjust} title="Pratinjau (P)">
            {mode === "edit" ? <Eye className="size-4" strokeWidth={2} /> : <Pencil className="size-4" strokeWidth={2} />}
            {mode === "edit" ? "Pratinjau" : "Kembali atur"}
          </Button>
          <div className="relative">
            <Button tone="blue" small onClick={submit} disabled={saving} title={`Simpan (${MOD} S)`}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Simpan
            </Button>
            {todo.length > 0 && <span aria-hidden className="absolute -right-1 -top-1 size-2.5 rounded-full bg-danger ring-2 ring-surface" />}
            {showTodo && todo.length > 0 && (
              <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-edge bg-surface p-3 text-xs shadow-pop">
                <p className="mb-1.5 font-medium text-fg">Lengkapi dulu sebelum menyimpan:</p>
                <ul className="flex flex-col gap-1 text-subtle">
                  {todo.map((t) => (
                    <li key={t.text}>
                      <button
                        type="button"
                        className="text-left hover:text-primary hover:underline"
                        onClick={() => {
                          if (t.tab) setSide(t.tab);
                          setShowTodo(false);
                        }}
                      >
                        • {t.text}
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => setShowTodo(false)} className="mt-2 text-subtle hover:text-fg">
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {state.message && !state.ok && (
        <div role="alert" className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
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

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void pickFile(f);
        }}
      />

      <div className="grid items-start gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch">
        {/* Sidebar */}
        <aside className="order-2 flex min-w-0 overflow-hidden rounded-xl border border-edge bg-surface shadow-card lg:order-none lg:h-full">
          <nav className="flex w-16 shrink-0 flex-col gap-1 border-r border-edge bg-canvas/50 p-1.5" aria-label="Panel editor">
            {(
              [
                ["elemen", "Elemen", Shapes],
                ["latar", "Latar", ImageUp],
                ["info", "Info", Tag],
              ] as [SideTab, string, typeof Shapes][]
            ).map(([k, label, Icon]) => {
              const on = adjust ? k === "latar" : side === k;
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSide(k)}
                  className={cn("relative flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium", on ? "bg-surface text-primary shadow-card" : "text-subtle hover:bg-surface hover:text-fg")}
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                  {label}
                  {todo.some((t) => t.tab === k) && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-danger" />}
                </button>
              );
            })}
          </nav>
          <div className="min-w-0 flex-1 overflow-y-auto p-3">
            {adjust ? (
              <AdjustPanel adjust={adjust} onChange={setAdjust} onCancel={() => setAdjust(null)} onApply={applyAdjust} busy={busy} notice={notice} />
            ) : side === "elemen" ? (
              <div className="flex flex-col gap-4 text-sm">
                {notice && <NoticeBox notice={notice} />}
                <section className="flex flex-col gap-2">
                  <h3 className="font-semibold">Tambah foto</h3>
                  {!frame && <p className="text-xs text-subtle">Unggah gambar latar dulu di panel Latar.</p>}
                  <div className="grid grid-cols-3 gap-1.5">
                    {SHAPES.filter((s) => s.key !== "frame").map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        disabled={!frame || slots.length >= MAX_SLOTS}
                        onClick={() => addShape(s.key)}
                        className="flex flex-col items-center gap-1 rounded-lg bg-canvas py-2.5 text-xs text-subtle ring-1 ring-inset ring-edge hover:text-primary hover:ring-primary/40 disabled:opacity-40"
                      >
                        <ShapeIcon shape={s.key} className="size-7 text-primary" />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </section>
                <section className="flex flex-col gap-2">
                  <h3 className="font-semibold">Bentuk sendiri</h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        ["pen", "Pen (lengkung)", PenTool],
                        ["lasso", "Seret bebas", Spline],
                      ] as const
                    ).map(([k, label, Icon]) => (
                      <button
                        key={k}
                        type="button"
                        disabled={!frame || slots.length >= MAX_SLOTS}
                        aria-pressed={draw?.kind === k}
                        onClick={() => startDraw(k)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg py-2.5 text-xs ring-1 ring-inset disabled:opacity-40",
                          draw?.kind === k ? "bg-primary-soft text-primary ring-primary/40" : "bg-canvas text-subtle ring-edge hover:text-primary",
                        )}
                      >
                        <Icon className="size-6" strokeWidth={1.75} />
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-subtle">
                    Gambar bentuk foto apa pun (awan, siluet, huruf…). Pen seperti di Photoshop: klik = titik sudut, klik + seret = lengkung
                    halus; klik titik pertama untuk menutup. Seret bebas: tahan & seret seperti spidol. Klik dua kali bentuknya untuk mengedit
                    titik & lengkung.
                  </p>
                </section>
                <section className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Urutan foto <span className="font-normal text-subtle">({slots.length}/{MAX_SLOTS})</span>
                    </h3>
                    <IconBtn label="Urutkan otomatis (atas → bawah, kiri → kanan)" onClick={() => change(sortSlots(slots))} disabled={slots.length < 2}>
                      <SortAsc className="size-4" strokeWidth={2} />
                    </IconBtn>
                  </div>
                  {slots.length === 0 ? (
                    <p className="text-xs text-subtle">Belum ada foto.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {slots.map((o, i) => {
                        const above = slotLayer(o, overlay) === "above";
                        const on = sel.includes(i);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={(e) => setSel(e.shiftKey ? (on ? sel.filter((j) => j !== i) : [...sel, i]) : [i])}
                            aria-pressed={on}
                            title={`Foto ke-${i + 1} · ${above ? "di atas bingkai" : "di bawah bingkai"}`}
                            className={cn(
                              "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-lg px-1.5 text-sm font-medium ring-1 ring-inset",
                              on ? (above ? "bg-info text-white ring-info" : "bg-primary text-white ring-primary") : above ? "bg-info-soft text-info ring-info/30" : "bg-surface ring-edge-strong hover:bg-canvas",
                            )}
                          >
                            <ShapeIcon shape={o.shape} points={o.points} className="size-3.5" />
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-xs text-subtle">
                    Nomor = urutan foto diambil. <span className="text-primary">Biru</span>: di bawah bingkai (lewat lubang) · <span className="text-info">ungu</span>: di atas
                    bingkai.
                  </p>
                </section>
              </div>
            ) : side === "latar" ? (
              <div className="flex flex-col gap-3 text-sm">
                <h3 className="font-semibold">Gambar latar / bingkai</h3>
                <div className="flex flex-col gap-1.5">
                  <Button small onClick={() => fileRef.current?.click()} disabled={busy}>
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" strokeWidth={2} />}
                    {frame ? "Ganti gambar" : "Unggah gambar"}
                  </Button>
                  {frame && (
                    <Button small onClick={adjustCurrent} disabled={busy}>
                      <Crop className="size-4" strokeWidth={2} /> Atur posisi & ukuran gambar
                    </Button>
                  )}
                  {frame && (
                    <Button small onClick={redetect} disabled={busy}>
                      <ScanSearch className="size-4" strokeWidth={2} /> Deteksi lubang transparan
                    </Button>
                  )}
                </div>
                {notice && <NoticeBox notice={notice} />}
                {frame && (
                  <label className="flex items-start justify-between gap-3">
                    <span>
                      <span className="font-medium">Bingkai di atas foto</span>
                      <span className="block text-xs text-subtle">Aktif: foto bisa terlihat lewat bagian transparan. Mati: gambar jadi latar, semua foto di atasnya.</span>
                    </span>
                    <Switch checked={overlay} onChange={setOverlay} label="Bingkai di atas foto" />
                  </label>
                )}
                {frame && (
                  <label className="flex items-center justify-between gap-3">
                    <span className="font-medium">Garis aman cetak</span>
                    <Switch checked={showSafe} onChange={setShowSafe} label="Garis aman cetak" />
                  </label>
                )}
                {frame ? (
                  <button type="button" onClick={() => setTips(true)} className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                    <Lightbulb className="size-3.5" strokeWidth={2} /> Saran gambar bingkai & panduan ukuran
                  </button>
                ) : (
                  <>
                    <h3 className="mt-1 font-semibold">Saran gambar</h3>
                    <FrameTips />
                  </>
                )}
              </div>
            ) : side === "info" ? (
              <div className="flex flex-col gap-3 text-sm">
                <h3 className="font-semibold">Info template</h3>
                {frame && format && (
                  <p className="text-xs text-subtle">
                    {FORMATS[format].label} · {frame.width}×{frame.height} px · {FORMATS[format].hint}
                  </p>
                )}
                <div className="flex flex-col gap-1.5">
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
                  <span className="text-xs text-subtle">Dipakai untuk memilih template sesuai tema acara.</span>
                </div>
                <label className="flex items-center justify-between gap-3">
                  <span className="font-medium">{builtin ? "Aktif untuk semua pemilik" : "Tampil di booth"}</span>
                  <Switch checked={active} onChange={setActive} label="Aktif" />
                </label>
              </div>
            ) : null}
          </div>
        </aside>

        {/* Kanvas */}
        <section className="relative order-1 min-w-0 overflow-hidden rounded-xl border border-edge bg-surface shadow-card lg:order-none lg:flex lg:h-full lg:flex-col">
          {/* Toolbar kontekstual */}
          <div className="flex min-h-12 shrink-0 flex-wrap items-center gap-1 border-b border-edge px-3 py-1.5 text-xs">
            {adjust ? (
              <span className="text-subtle">Atur gambar · {FORMATS[adjust.format].label} · seret gambar untuk menggeser, roda mouse untuk zoom.</span>
            ) : !frame ? (
              <span className="text-subtle">Mulai dengan mengunggah gambar latar atau bingkai.</span>
            ) : mode === "preview" ? (
              <span className="text-subtle">Pratinjau dengan foto contoh · tekan P untuk kembali mengatur.</span>
            ) : draw ? (
              <>
                <span className="font-medium text-primary">{draw.kind === "pen" ? "Pen" : "Seret bebas"}</span>
                <span className="text-subtle">
                  {draw.kind === "pen"
                    ? `· ${draw.pts.length} titik — klik = sudut, klik + seret = lengkung · klik titik pertama / Enter untuk menutup · Backspace hapus titik terakhir`
                    : "· tahan & seret di kanvas, hasilnya dihaluskan otomatis"}
                </span>
                <span className="ml-auto flex gap-1">
                  {draw.kind === "pen" && (
                    <Button small tone="blue" onClick={() => finishDraw(draw.pts, draw.hs)} disabled={draw.pts.length < 2}>
                      Selesai
                    </Button>
                  )}
                  <Button small onClick={() => setDraw(null)}>
                    Batal (Esc)
                  </Button>
                </span>
              </>
            ) : slot && one !== null ? (
              <>
                <span className="mr-1 font-semibold">Foto {one + 1}</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShapeMenu(!shapeMenu)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 ring-1 ring-inset ring-edge-strong hover:bg-canvas"
                    aria-expanded={shapeMenu}
                  >
                    <ShapeIcon shape={slot.shape} points={slot.points} />
                    {slot.shape === "custom" ? "Bentuk bebas" : (SHAPES.find((s) => s.key === slot.shape)?.label ?? slot.shape)}
                  </button>
                  {shapeMenu && (
                    <div className="absolute left-0 top-full z-40 mt-1 grid w-60 grid-cols-3 gap-1 rounded-xl border border-edge bg-surface p-2 shadow-pop">
                      {SHAPES.map((sh) => {
                        const off = sh.key === "frame" && (!overlay || slotLayer(slot, overlay) === "above");
                        return (
                          <button
                            key={sh.key}
                            type="button"
                            disabled={off}
                            title={off ? "Hanya untuk foto di bawah bingkai yang punya lubang" : sh.label}
                            onClick={() => {
                              setShape(one, sh.key);
                              setShapeMenu(false);
                            }}
                            className={cn("flex flex-col items-center gap-1 rounded-lg p-1.5 text-[11px] disabled:opacity-30", slot.shape === sh.key ? "bg-primary-soft text-primary" : "hover:bg-canvas")}
                          >
                            <ShapeIcon shape={sh.key} className="size-5" />
                            {sh.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {slot.shape === "custom" && (
                  <>
                    <Button small onClick={() => setEditPts(editPts === one ? null : one)} title="Edit titik (atau klik dua kali bentuknya)">
                      <PenLine className="size-4" strokeWidth={2} /> {editPts === one ? "Selesai edit titik" : "Edit titik"}
                    </Button>
                    <IconBtn label="Haluskan semua titik (jadi lengkung)" onClick={() => frame && replace(one, refitPoints({ ...slot, handles: smoothHandles(slot.points ?? []) }, frame.width, frame.height))}>
                      <Waves className="size-4" strokeWidth={2} />
                    </IconBtn>
                    <IconBtn
                      label="Jadikan semua titik sudut tajam"
                      disabled={!slot.handles}
                      onClick={() => frame && replace(one, tidyCurve(refitPoints({ ...slot, handles: (slot.points ?? []).map(flatHandle) }, frame.width, frame.height)))}
                    >
                      <Triangle className="size-4" strokeWidth={2} />
                    </IconBtn>
                  </>
                )}
                {slot.shape === "rounded" && (
                  <label className="inline-flex items-center gap-1.5 px-1 text-subtle" title="Lengkung sudut">
                    Lengkung
                    <input
                      type="range"
                      min={0}
                      max={0.5}
                      step={0.01}
                      value={slot.radius ?? 0.12}
                      onChange={(e) => update(one, { radius: Number(e.target.value) })}
                      className="w-20 accent-primary"
                      aria-label="Lengkung sudut"
                    />
                  </label>
                )}
                {overlay && (
                  <span className="inline-flex rounded-lg p-0.5 ring-1 ring-inset ring-edge-strong" title="Lapisan foto terhadap bingkai">
                    {(
                      [
                        ["below", "Bawah bingkai"],
                        ["above", "Atas bingkai"],
                      ] as const
                    ).map(([k, label]) => (
                      <button
                        key={k}
                        type="button"
                        aria-pressed={slotLayer(slot, overlay) === k}
                        onClick={() => setLayer([one], k)}
                        className={cn(
                          "h-7 rounded-md px-2 font-medium",
                          slotLayer(slot, overlay) === k ? (k === "above" ? "bg-info-soft text-info" : "bg-primary-soft text-primary") : "text-subtle hover:text-fg",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </span>
                )}
                <label className="inline-flex items-center gap-1 px-1 text-subtle" title="Kemiringan (derajat)">
                  Miring
                  <input
                    type="number"
                    min={-180}
                    max={180}
                    value={Math.round(slot.rotation)}
                    onChange={(e) => update(one, { rotation: clamp(Number(e.target.value) || 0, -180, 180) })}
                    className="h-7 w-14 rounded-md border border-edge-strong px-1.5 text-xs tabular-nums text-fg outline-none focus:border-primary"
                  />
                  °
                </label>
                <span className="mx-0.5 h-5 w-px bg-edge" />
                <IconBtn label="Tengah mendatar di halaman" onClick={() => align("c")}>
                  <AlignCenterVertical className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label="Tengah tegak di halaman" onClick={() => align("m")}>
                  <AlignCenterHorizontal className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label={`Urutan foto lebih awal (${MOD} [)`} onClick={() => reorder(one, -1)} disabled={one === 0}>
                  <ChevronLeft className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label={`Urutan foto lebih akhir (${MOD} ])`} onClick={() => reorder(one, 1)} disabled={one === slots.length - 1}>
                  <ChevronRight className="size-4" strokeWidth={2} />
                </IconBtn>
                <span className="mx-0.5 h-5 w-px bg-edge" />
                <IconBtn label={`Duplikat (${MOD} D)`} onClick={() => duplicate([one])} disabled={slots.length >= MAX_SLOTS}>
                  <Copy className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label="Hapus (Delete)" onClick={() => remove([one])}>
                  <Trash2 className="size-4 text-danger" strokeWidth={2} />
                </IconBtn>
              </>
            ) : sel.length > 1 ? (
              <>
                <span className="mr-1 font-semibold">{sel.length} foto dipilih</span>
                <IconBtn label="Rata kiri" onClick={() => align("l")}>
                  <AlignStartVertical className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label="Rata tengah mendatar" onClick={() => align("c")}>
                  <AlignCenterVertical className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label="Rata kanan" onClick={() => align("r")}>
                  <AlignEndVertical className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label="Rata atas" onClick={() => align("t")}>
                  <AlignStartHorizontal className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label="Rata tengah tegak" onClick={() => align("m")}>
                  <AlignCenterHorizontal className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label="Rata bawah" onClick={() => align("b")}>
                  <AlignEndHorizontal className="size-4" strokeWidth={2} />
                </IconBtn>
                <span className="mx-0.5 h-5 w-px bg-edge" />
                <IconBtn label="Jarak atas-bawah sama (min. 3 foto)" onClick={() => spread("y")} disabled={sel.length < 3}>
                  <StretchVertical className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label="Jarak kiri-kanan sama (min. 3 foto)" onClick={() => spread("x")} disabled={sel.length < 3}>
                  <StretchHorizontal className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label="Samakan ukuran (seperti foto terakhir dipilih)" onClick={sameSize}>
                  <Scaling className="size-4" strokeWidth={2} />
                </IconBtn>
                {overlay && (
                  <>
                    <span className="mx-0.5 h-5 w-px bg-edge" />
                    <Button small onClick={() => setLayer(sel, "below")}>
                      Bawah bingkai
                    </Button>
                    <Button small onClick={() => setLayer(sel, "above")}>
                      Atas bingkai
                    </Button>
                  </>
                )}
                <span className="mx-0.5 h-5 w-px bg-edge" />
                <IconBtn label={`Duplikat (${MOD} D)`} onClick={() => duplicate(sel)} disabled={slots.length + sel.length > MAX_SLOTS}>
                  <Copy className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label="Hapus (Delete)" onClick={() => remove(sel)}>
                  <Trash2 className="size-4 text-danger" strokeWidth={2} />
                </IconBtn>
              </>
            ) : (
              <span className="flex flex-wrap items-center gap-1.5 text-subtle">
                <Info className="size-3.5" strokeWidth={2} />
                Klik foto untuk mengubah · Shift + klik / seret area kosong untuk memilih beberapa · tekan{" "}
                <kbd className="rounded bg-canvas px-1 font-mono ring-1 ring-inset ring-edge">?</kbd> untuk pintasan
              </span>
            )}
          </div>

          <div
            ref={areaRef}
            className={cn("flex max-h-[78dvh] min-h-[420px] bg-canvas/60 p-10 lg:max-h-none lg:min-h-0 lg:flex-1", zoom > 1 ? "overflow-auto" : "overflow-hidden")}
          >
            {adjust ? (
              <div className="m-auto">
                <AdjustStage adjust={adjust} boxW={areaW - 8} maxH={maxH} onChange={setAdjust} />
              </div>
            ) : !frame ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="m-auto flex aspect-[2/3] w-full max-w-sm flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-edge-strong bg-surface p-6 text-center text-sm text-subtle hover:border-primary hover:bg-primary-soft/40"
              >
                <ImageUp className="size-10 text-primary" strokeWidth={1.5} />
                <span className="font-medium text-fg">Unggah gambar latar / bingkai</span>
                <span>PNG dengan bagian foto transparan → posisi foto terdeteksi otomatis.</span>
                <span className="text-xs">Gambar biasa (JPG) juga bisa: foto kamu atur atau gambar bentuknya sendiri.</span>
              </button>
            ) : mode === "preview" ? (
              <div className="m-auto shrink-0" style={{ width: stageW }}>
                <TemplatePreview uid="editor" src={frame.src} width={frame.width} height={frame.height} overlay={overlay} slots={slots} className="rounded-md shadow-card" />
              </div>
            ) : (
              <div
                ref={stageRef}
                tabIndex={0}
                aria-label="Kanvas template: klik foto untuk memilih, seret untuk memindahkan"
                onPointerDown={stageDown}
                onPointerMove={stageMove}
                onPointerUp={stageUp}
                onPointerCancel={stageUp}
                onDoubleClick={() => {
                  if (draw?.kind === "pen") return finishDraw(draw.pts, draw.hs);
                  // Pointer ditangkap kanvas saat slot ditekan → klik dua kali sampai di sini: edit titik bentuk bebas terpilih.
                  if (one !== null && slots[one]?.shape === "custom") setEditPts(one);
                }}
                className={cn("checker relative m-auto shrink-0 touch-none select-none shadow-card outline-none", draw && "cursor-crosshair")}
                style={{ width: stageW, height: stageH }}
              >
                <img src={frame.src} alt="" draggable={false} className="pointer-events-none absolute inset-0 size-full" />
                {/* Lubang foto asli (bentuk apa pun) diwarnai biru muda. */}
                {overlay && <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] bg-primary/25" style={holeMask(frame.src)} />}
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
                {slots.map((s, i) => {
                  const on = sel.includes(i);
                  const c = color(s);
                  const hole = s.shape === "frame";
                  const pointEdit = editPts === i && s.shape === "custom";
                  return (
                    <div
                      key={i}
                      onPointerDown={(e) => beginSlot(e, i)}
                      className={cn("absolute", draw ? "pointer-events-none" : "cursor-move", on ? "z-20" : "z-10")}
                      style={{ left: s.x * stageW, top: s.y * stageH, width: s.w * stageW, height: s.h * stageH, transform: `rotate(${s.rotation}deg)` }}
                    >
                      <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden>
                        <path
                          d={shapePath(s, (s.w * stageW) / (s.h * stageH))}
                          fill={hole ? "transparent" : c}
                          fillOpacity={on ? 0.28 : 0.16}
                          stroke={c}
                          strokeOpacity={hole && !on ? 0.6 : 1}
                          strokeWidth={on ? 2 : 1.5}
                          strokeDasharray={on ? undefined : "4 3"}
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                      {on && one === i && !hole && s.shape !== "rect" && !pointEdit && (
                        <span aria-hidden className="pointer-events-none absolute inset-0 border border-dashed" style={{ borderColor: c, opacity: 0.45 }} />
                      )}
                      <span
                        className="pointer-events-none absolute left-1 top-1 inline-flex h-5 min-w-5 items-center justify-center gap-0.5 rounded px-1 text-[11px] font-semibold text-white"
                        style={{ background: c }}
                      >
                        {i + 1}
                        {slotLayer(s, overlay) === "above" && <span className="text-[9px] font-medium">atas</span>}
                      </span>
                      {pointEdit && (
                        <>
                          {/* Garis kendali lengkung (seperti Photoshop): titik = kotak, kendali = bulatan. */}
                          <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden>
                            {(s.points ?? []).map((p, k) => {
                              const h = s.handles?.[k];
                              if (!isSmooth(p, h)) return null;
                              return <path key={k} d={`M${h![0]},${h![1]} L${p[0]},${p[1]} L${h![2]},${h![3]}`} fill="none" stroke={c} strokeWidth={1} vectorEffect="non-scaling-stroke" />;
                            })}
                          </svg>
                          {(s.points ?? []).map((p, k) => {
                            const h = s.handles?.[k];
                            const knobs: ["in" | "out", number, number][] = isSmooth(p, h)
                              ? [
                                  ["in", h![0], h![1]],
                                  ["out", h![2], h![3]],
                                ]
                              : [];
                            return (
                              <span key={k} className="contents">
                                {knobs.map(([part, hx, hy]) => (
                                  <span
                                    key={part}
                                    onPointerDown={(e) => beginVertex(e, i, k, part)}
                                    title="Seret untuk mengubah lengkung · Alt = patahkan"
                                    className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full"
                                    style={{ left: `${hx * 100}%`, top: `${hy * 100}%`, background: c }}
                                  />
                                ))}
                                <span
                                  onPointerDown={(e) => beginVertex(e, i, k, "anchor")}
                                  title="Seret = geser titik · Alt + seret = tarik lengkung · Alt + klik = sudut tajam"
                                  className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 cursor-move border-[1.5px] bg-white"
                                  style={{ left: `${p[0] * 100}%`, top: `${p[1] * 100}%`, borderColor: c }}
                                />
                              </span>
                            );
                          })}
                        </>
                      )}
                      {on && one === i && !pointEdit && (
                        <>
                          {(
                            [
                              [-1, -1],
                              [0, -1],
                              [1, -1],
                              [1, 0],
                              [1, 1],
                              [0, 1],
                              [-1, 1],
                              [-1, 0],
                            ] as [number, number][]
                          ).map(([cx, cy]) => (
                            <span
                              key={`${cx}${cy}`}
                              onPointerDown={(e) => beginHandle(e, i, "resize", [cx, cy])}
                              className={cn("absolute border-2 bg-white", cx !== 0 && cy !== 0 ? "size-3 rounded-sm" : cx === 0 ? "h-2 w-4 rounded-full" : "h-4 w-2 rounded-full")}
                              style={{
                                borderColor: c,
                                left: cx < 0 ? -7 : cx === 0 ? "50%" : undefined,
                                right: cx > 0 ? -7 : undefined,
                                top: cy < 0 ? -7 : cy === 0 ? "50%" : undefined,
                                bottom: cy > 0 ? -7 : undefined,
                                translate: cx === 0 ? "-50% 0" : cy === 0 ? "0 -50%" : undefined,
                                cursor: cx === 0 ? "ns-resize" : cy === 0 ? "ew-resize" : cx === cy ? "nwse-resize" : "nesw-resize",
                              }}
                            />
                          ))}
                          <span className="pointer-events-none absolute -top-6 left-1/2 h-5 w-px -translate-x-1/2" style={{ background: c }} />
                          <span
                            onPointerDown={(e) => beginHandle(e, i, "rotate")}
                            title="Putar (Alt = tanpa tempel 15°)"
                            className="absolute -top-8 left-1/2 size-3.5 -translate-x-1/2 cursor-grab rounded-full border-2 bg-white"
                            style={{ borderColor: c }}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
                {marquee && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute z-40 border border-primary bg-primary/10"
                    style={{ left: `${marquee.x * 100}%`, top: `${marquee.y * 100}%`, width: `${marquee.w * 100}%`, height: `${marquee.h * 100}%` }}
                  />
                )}
                {draw && draw.pts.length > 0 && (
                  <div aria-hidden className="pointer-events-none absolute inset-0 z-40">
                    <svg className="absolute inset-0 size-full overflow-visible" viewBox="0 0 1 1" preserveAspectRatio="none">
                      {draw.kind === "lasso" ? (
                        <polyline points={draw.pts.map(([x, y]) => `${x},${y}`).join(" ")} fill="var(--color-primary)" fillOpacity={0.12} stroke="var(--color-primary)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
                      ) : (
                        (() => {
                          const n = draw.pts.length, last = draw.hs[n - 1];
                          // Ruas pratinjau ke kursor (atau ke titik pertama saat menutup).
                          const to = draw.closing ? draw.pts[0] : !draw.down ? draw.hover : undefined;
                          const tail = to ? ` C${last[2]},${last[3]} ${draw.closing ? `${draw.hs[0][0]},${draw.hs[0][1]}` : `${to[0]},${to[1]}`} ${to[0]},${to[1]}` : "";
                          const k = draw.closing ? 0 : n - 1;
                          const h = draw.hs[k], a = draw.pts[k];
                          return (
                            <>
                              <path d={curvePath(draw.pts, draw.hs, false) + tail} fill="var(--color-primary)" fillOpacity={0.1} stroke="var(--color-primary)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
                              {isSmooth(a, h) && <path d={`M${h[0]},${h[1]} L${a[0]},${a[1]} L${h[2]},${h[3]}`} fill="none" stroke="var(--color-primary)" strokeWidth={1} vectorEffect="non-scaling-stroke" />}
                            </>
                          );
                        })()
                      )}
                    </svg>
                    {draw.kind === "pen" && (
                      <>
                        {draw.pts.map(([x, y], k) => (
                          <span
                            key={k}
                            className={cn("absolute -translate-x-1/2 -translate-y-1/2 border-2 border-primary bg-white", k === 0 ? "size-3.5 rounded-full" : "size-2.5")}
                            style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
                          />
                        ))}
                        {(() => {
                          const k = draw.closing ? 0 : draw.pts.length - 1;
                          const h = draw.hs[k];
                          if (!isSmooth(draw.pts[k], h)) return null;
                          return [
                            [h[0], h[1]],
                            [h[2], h[3]],
                          ].map(([x, y], j) => <span key={j} className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" style={{ left: `${x * 100}%`, top: `${y * 100}%` }} />);
                        })()}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {frame && !adjust && mode === "edit" && slot && one !== null && (
            <details className="shrink-0 border-t border-edge bg-surface px-3 py-2 text-xs lg:absolute lg:inset-x-0 lg:bottom-0 lg:z-10 lg:max-h-[40%] lg:overflow-y-auto">
              <summary className="cursor-pointer text-subtle hover:text-fg">Posisi & ukuran tepat (%)</summary>
              <div className="mt-2 grid max-w-md grid-cols-4 gap-2">
                <Num label="X" value={slot.x * 100} onChange={(v) => update(one, { x: r4(v / 100) })} />
                <Num label="Y" value={slot.y * 100} onChange={(v) => update(one, { y: r4(v / 100) })} />
                <Num label="Lebar" value={slot.w * 100} min={2} onChange={(v) => update(one, { w: r4(clamp(v, 2, 150) / 100) })} />
                <Num label="Tinggi" value={slot.h * 100} min={2} onChange={(v) => update(one, { h: r4(clamp(v, 2, 150) / 100) })} />
              </div>
            </details>
          )}
        </section>
      </div>

      <Dialog open={tips} onClose={() => setTips(false)} title="Saran gambar bingkai" wide>
        <FrameTips />
      </Dialog>

      <Dialog open={keys} onClose={() => setKeys(false)} title="Pintasan keyboard" wide>
        <ShortcutList />
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

function ShortcutList() {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
      {SHORTCUTS.map(([k, v]) => (
        <div key={k} className="contents">
          <dt>
            <kbd className="whitespace-nowrap rounded-md bg-canvas px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-inset ring-edge">{k}</kbd>
          </dt>
          <dd className="text-subtle">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
