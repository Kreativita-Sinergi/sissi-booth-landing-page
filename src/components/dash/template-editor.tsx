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
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpToLine,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  CircleDashed,
  Copy,
  Crop,
  Download,
  Eye,
  ImagePlus,
  ImageUp,
  Info,
  Layers,
  Keyboard,
  Lightbulb,
  Loader2,
  Minus,
  PenLine,
  Pencil,
  PenTool,
  Plus,
  Redo2,
  Save,
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
import type { UploadAssetResult } from "@/lib/dash/template-actions";
import {
  closestFormat,
  curvePath,
  defaultSlots,
  detectSlots,
  distribute,
  flatHandle,
  FORMAT_KEYS,
  FORMATS,
  findGreen,
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
  downloadGuide,
  FormatPicker,
  FrameTips,
  holeMask,
  IconBtn,
  keyGreen,
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
import { TemplateGuide } from "./template-guide";
import { TemplatePreview } from "./template-preview";

type SideTab = "elemen" | "lapisan" | "latar" | "info";
type Notice = { tone: "ok" | "warn" | "err"; text: string };
/** Gambar lapisan di editor; `ratio` = lebar/tinggi asli (piksel) untuk ubah ukuran proporsional. */
type Img = { asset_id: string; url: string; ratio: number };
/** Elemen kanvas: slot foto, atau gambar lapisan (`img` terisi, selalu kotak). Urutan daftar: semua foto dulu, lalu gambar. */
type El = Slot & { img?: Img };
/** Satu langkah riwayat urungkan: elemen + gambar latar + posisi bingkai. */
type Snap = { items: El[]; frame: Frame | null; overlay: boolean };
type Pt = [number, number];
/** Seret di kanvas: geser (banyak elemen), ubah ukuran, putar, kotak pilih, atau titik bentuk bebas. */
type Drag =
  | { kind: "move"; idx: number[]; starts: El[]; x: number; y: number; pushed: boolean; before: El[] }
  | { kind: "resize"; i: number; start: El; corner: [number, number]; x: number; y: number; pushed: boolean; before: El[] }
  | { kind: "rotate"; i: number; start: El; pushed: boolean; before: El[] }
  /** Titik bentuk bebas: anchor = geser titik (+kendalinya), in/out = tarik kendali (brk = patahkan), pull = tarik lengkung baru dari titik (Alt). */
  | { kind: "vertex"; i: number; k: number; part: "anchor" | "in" | "out" | "pull"; brk: boolean; start: El; x: number; y: number; pushed: boolean; before: El[] }
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
  uploadAsset,
  backHref,
  builtin,
}: {
  template?: FrameTemplate;
  categories: TemplateCategory[];
  action: (s: ActionState, f: FormData) => Promise<ActionState>;
  /** Unggah satu gambar lapisan (aksi server) → asset. */
  uploadAsset: (f: FormData) => Promise<UploadAssetResult>;
  backHref: string;
  /** Admin: template bawaan Sissi (teks bantuan berbeda). */
  builtin?: boolean;
}) {
  const [state, run, saving] = useActionState(action, {} as ActionState);
  const [frame, setFrame] = useState<Frame | null>(template ? { src: template.frame_url, width: template.width, height: template.height } : null);
  const [overlay, setOverlay] = useState(template?.frame_overlay ?? true);
  const [items, setItems] = useState<El[]>(() => [
    ...(template?.slots ?? []),
    ...(template?.images ?? []).map((im) => ({
      x: im.x,
      y: im.y,
      w: im.w,
      h: im.h,
      rotation: im.rotation,
      shape: "rect" as const,
      img: { asset_id: im.asset_id, url: im.url, ratio: (im.w * template!.width) / (im.h * template!.height) },
    })),
  ]);
  const [hist, setHist] = useState<{ past: Snap[]; future: Snap[] }>({ past: [], future: [] });
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
  const [guide, setGuide] = useState(false);
  const [source, setSource] = useState<Source | null>(null);
  const [ask, setAsk] = useState<Ask | null>(null);
  const [adjust, setAdjust] = useState<Adjust | null>(null);
  const [zoom, setZoom] = useState(1);
  const [draw, setDraw] = useState<Draw | null>(null);
  const [editPts, setEditPts] = useState<number | null>(null);
  const [clip, setClip] = useState<El[]>([]);
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [showTodo, setShowTodo] = useState(false);
  const [greenAsk, setGreenAsk] = useState<{ file: File; img: HTMLImageElement; regions: number } | null>(null);
  /** Notifikasi singkat "lengkapi data" (hilang sendiri). */
  const [toast, setToast] = useState<{ id: number; items: string[] } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);
  const [shapeMenu, setShapeMenu] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const imgFileRef = useRef<HTMLInputElement>(null);
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
  // Gambar latar lama masih bisa kembali lewat urungkan → URL-nya baru dilepas saat editor ditutup.
  const frameUrls = useRef<string[]>([]);
  useEffect(() => {
    if (frame?.src.startsWith("blob:") && !frameUrls.current.includes(frame.src)) frameUrls.current.push(frame.src);
  }, [frame?.src]);
  useEffect(() => {
    const urls = frameUrls.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const format = frame ? formatFor(frame.width, frame.height) : null;
  const maxH = areaH > 0 ? Math.max(240, areaH - 8) : typeof window === "undefined" ? 640 : Math.max(380, window.innerHeight * 0.62);
  const fitW = frame ? Math.max(120, Math.min((areaW || 600) - 8, (maxH * frame.width) / frame.height)) : 0;
  const stageW = fitW * zoom;
  const stageH = frame ? (stageW * frame.height) / frame.width : 0;
  const one = sel.length === 1 ? sel[0] : null;
  // Elemen & Lapisan baru bisa dipakai setelah ada gambar latar (mis. setelah urungkan unggahan → kembali ke Latar).
  const needsFrame = (k: SideTab) => k === "elemen" || k === "lapisan";
  const panel: SideTab = !frame && needsFrame(side) ? "latar" : side;
  const item = one !== null ? items[one] : undefined;
  const nPhotos = items.filter((e) => !e.img).length;
  const photos = items.slice(0, nPhotos);
  const imgs = items.slice(nPhotos);

  // --- riwayat (urungkan/ulangi) ---

  const snap = (): Snap => ({ items, frame, overlay });
  function restore(s: Snap) {
    setItems(s.items);
    setFrame(s.frame);
    setOverlay(s.overlay);
  }
  /** Ubah isi editor sebagai satu langkah urungkan. */
  function commit(patch: Partial<Snap>) {
    setHist({ past: [...hist.past.slice(-99), snap()], future: [] });
    if (patch.items) setItems(patch.items);
    if (patch.frame !== undefined) setFrame(patch.frame);
    if (patch.overlay !== undefined) setOverlay(patch.overlay);
  }
  function change(next: El[]) {
    commit({ items: next });
  }
  /** Tambah elemen baru (foto ke kelompok foto, gambar ke paling depan) → daftar baru + indeks pilihannya. */
  function inserted(add: El[]): { next: El[]; sel: number[] } {
    const ph = add.filter((e) => !e.img), im = add.filter((e) => e.img);
    const next = [...photos, ...ph, ...imgs, ...im];
    return { next, sel: [...ph.map((_, k) => nPhotos + k), ...im.map((_, k) => nPhotos + ph.length + imgs.length + k)] };
  }
  function update(i: number, patch: Partial<El>) {
    change(items.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  }
  function replace(i: number, next: El) {
    change(items.map((s, j) => (j === i ? next : s)));
  }
  function undo() {
    const prev = hist.past[hist.past.length - 1];
    if (!prev) return;
    setHist({ past: hist.past.slice(0, -1), future: [snap(), ...hist.future] });
    restore(prev);
    setSel((cur) => cur.filter((i) => i < prev.items.length));
    setEditPts(null);
  }
  function redo() {
    const next = hist.future[0];
    if (!next) return;
    setHist({ past: [...hist.past, snap()], future: hist.future.slice(1) });
    restore(next);
    setSel((cur) => cur.filter((i) => i < next.items.length));
  }

  // --- gambar latar / bingkai ---

  /** Pasang gambar latar `f` + hasil deteksi lubang sebagai SATU langkah urungkan. */
  function applyDetection(img: HTMLImageElement, f: Frame, replace: boolean) {
    const fmt = formatFor(f.width, f.height);
    let found: ReturnType<typeof detectSlots>;
    try {
      const px = pixels(img);
      found = detectSlots(px.data, px.w, px.h);
    } catch {
      if (f !== frame) commit({ frame: f });
      setNotice({ tone: "warn", text: "Gambar tidak bisa dibaca untuk deteksi otomatis. Unggah ulang gambarnya untuk mendeteksi lubang." });
      return;
    }
    if (found.slots.length > 0) {
      commit({ frame: f, overlay: true, items: [...found.slots.slice(0, MAX_SLOTS), ...imgs] });
      setSel([0]);
      setSide("elemen");
      setNotice({ tone: "ok", text: `${found.slots.length} lubang foto terdeteksi dan sudah jadi slot. Klik slot untuk mengubahnya.` });
    } else if (replace || nPhotos === 0) {
      commit({ frame: f, overlay: found.transparent, items: [...(fmt ? defaultSlots(fmt) : []), ...imgs] });
      setSel([]);
      setSide("elemen");
      setNotice({
        tone: "warn",
        text: found.transparent
          ? "Tidak ada lubang foto yang cukup besar. Slot contoh dipasang — geser, ubah, atau gambar bentuk sendiri."
          : "Gambar dipakai sebagai latar (tidak ada bagian transparan). Slot contoh dipasang — atur sendiri atau gambar bentuk bebas.",
      });
    } else {
      if (f !== frame) commit({ frame: f });
      setNotice({ tone: "warn", text: "Tidak ada lubang foto yang terdeteksi; slot yang ada tidak diubah." });
    }
  }

  /** `keyed` = sudah lewat cek hijau penanda (hasil ubah ke transparan, atau pengguna menolak). */
  async function pickFile(file: File, keyed = false) {
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
    if (!keyed) {
      // Hijau penanda tempat foto (untuk yang belum paham PNG transparan) → tawarkan jadikan lubang.
      const px = pixels(img);
      const { regions } = findGreen(px.data, px.w, px.h);
      if (regions > 0) {
        URL.revokeObjectURL(url);
        setGreenAsk({ file, img, regions });
        return;
      }
    }
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
    setZoom(1);
    applyDetection(img, f, !template || nPhotos === 0);
  }

  /** Ya: area hijau → transparan (PNG baru), lalu lanjut unggah biasa (deteksi lubang). */
  async function applyGreen() {
    if (!greenAsk) return;
    const { file, img } = greenAsk;
    setGreenAsk(null);
    setBusy(true);
    const out = await keyGreen(img);
    setBusy(false);
    if (!out) return void pickFile(file, true);
    await pickFile(new File([out.blob], file.name.replace(/\.[^.]+$/, "") + ".png", { type: "image/png" }), true);
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
    setAdjust(null);
    setZoom(1);
    applyDetection(out, f, nPhotos === 0);
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

  // --- elemen (foto & gambar) ---

  /** Slot baru di tengah, kira-kira persegi di layar; di atas bingkai agar langsung terlihat. */
  function addShape(shape: SlotShape) {
    if (!frame || nPhotos >= MAX_SLOTS) return;
    const w = format === "strip_2x6" ? 0.6 : 0.36;
    const h = r4(Math.min(0.8, (w * frame.width) / frame.height));
    const s: Slot = { x: r4(0.5 - w / 2), y: r4(0.5 - h / 2), w, h, rotation: 0, shape, layer: "above", radius: shape === "rounded" ? 0.15 : undefined };
    change([...photos, s, ...imgs]);
    setSel([nPhotos]);
    setDraw(null);
    setEditPts(null);
    setMode("edit");
  }

  /** Gambar lapisan baru (hiasan): diunggah dulu ke server, lalu ditaruh di tengah paling depan dengan rasio aslinya. */
  async function addImage(file: File) {
    if (!frame) return setNotice({ tone: "warn", text: "Unggah gambar latar dulu, baru tambahkan gambar hiasan." });
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      return setNotice({ tone: "err", text: "Gambar hiasan harus PNG (disarankan, agar bisa transparan) atau JPG." });
    }
    if (file.size > MAX_FILE) return setNotice({ tone: "err", text: `Ukuran file ${mb(file.size)} MB melebihi batas 4 MB. Kecilkan dulu (mis. TinyPNG).` });
    setBusy(true);
    setNotice({ tone: "ok", text: "Mengunggah gambar…" });
    const fd = new FormData();
    fd.set("file", file);
    const res = await uploadAsset(fd);
    setBusy(false);
    if (!res.ok) return setNotice({ tone: "err", text: res.message });
    const { asset } = res;
    const ratio = asset.width / asset.height;
    // Lebar awal ±40% halaman, tinggi mengikuti rasio; batasi agar muat.
    let w = 0.4, h = (w * frame.width) / ratio / frame.height;
    if (h > 0.6) {
      w = (w * 0.6) / h;
      h = 0.6;
    }
    const el: El = { x: r4(0.5 - w / 2), y: r4(0.5 - h / 2), w: r4(w), h: r4(h), rotation: 0, shape: "rect", img: { asset_id: asset.id, url: asset.url, ratio } };
    change([...items, el]);
    setSel([items.length]);
    setDraw(null);
    setEditPts(null);
    setMode("edit");
    setNotice({ tone: "ok", text: "Gambar ditambahkan di paling depan. Geser, ubah ukuran (sudut = proporsional), atau putar." });
  }

  function setShape(i: number, shape: SlotShape) {
    const cur = items[i];
    update(i, {
      shape,
      radius: shape === "rounded" ? (cur.radius ?? 0.12) : undefined,
      layer: shape === "frame" ? "below" : cur.layer,
      points: shape === "custom" ? cur.points : undefined,
    });
  }

  function setLayer(idx: number[], layer: SlotLayer) {
    change(items.map((s, j) => (idx.includes(j) && !s.img ? { ...s, layer, shape: layer === "above" && s.shape === "frame" ? "rect" : s.shape } : s)));
  }

  function duplicate(idx: number[]) {
    if (!idx.length || nPhotos + idx.filter((i) => !items[i].img).length > MAX_SLOTS) return;
    const r = inserted(idx.map((i) => ({ ...items[i], x: r4(items[i].x + 0.03), y: r4(items[i].y + 0.03) })));
    change(r.next);
    setSel(r.sel);
  }

  function remove(idx: number[]) {
    if (!idx.length) return;
    change(items.filter((_, j) => !idx.includes(j)));
    setSel([]);
    setEditPts(null);
  }

  function paste() {
    if (!clip.length || nPhotos + clip.filter((e) => !e.img).length > MAX_SLOTS) return;
    const copies = clip.map((s) => ({ ...s, x: r4(s.x + 0.03), y: r4(s.y + 0.03) }));
    const r = inserted(copies);
    change(r.next);
    setSel(r.sel);
    setClip(copies);
  }

  /** Urutan foto (= urutan jepret & tumpukan antar foto) / tumpukan gambar: pindah dalam kelompoknya sendiri. */
  function reorder(i: number, dir: -1 | 1) {
    const j = i + dir;
    const [lo, hi] = i < nPhotos ? [0, nPhotos] : [nPhotos, items.length];
    if (j < lo || j >= hi) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    change(next);
    setSel([j]);
  }

  /** Rata: beberapa foto → patokan kotak gabungan pilihan; satu foto → patokan halaman. */
  function align(kind: "l" | "c" | "r" | "t" | "m" | "b") {
    const ss = sel.map((i) => items[i]);
    const [lx, rx, ty, by] =
      sel.length === 1
        ? [0, 1, 0, 1]
        : [Math.min(...ss.map((s) => s.x)), Math.max(...ss.map((s) => s.x + s.w)), Math.min(...ss.map((s) => s.y)), Math.max(...ss.map((s) => s.y + s.h))];
    change(
      items.map((s, j) => {
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
    const picked = distribute(sel.map((i) => items[i]), axis);
    change(items.map((s, j) => (sel.includes(j) ? picked[sel.indexOf(j)] : s)));
  }

  function sameSize() {
    const ref = items[sel[sel.length - 1]];
    change(items.map((s, j) => (sel.includes(j) ? { ...s, w: ref.w, h: ref.h } : s)));
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
    if (nPhotos >= MAX_SLOTS) return setNotice({ tone: "warn", text: `Maksimal ${MAX_SLOTS} foto.` });
    change([...photos, s, ...imgs]);
    setSel([nPhotos]);
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
    drag.current = { kind: "move", idx, starts: idx.map((j) => items[j]), x: e.clientX, y: e.clientY, pushed: false, before: items };
    stageRef.current?.setPointerCapture(e.pointerId);
    stageRef.current?.focus({ preventScroll: true });
  }

  function beginHandle(e: React.PointerEvent, i: number, kind: "resize" | "rotate", corner: [number, number] = [0, 0]) {
    e.stopPropagation();
    e.preventDefault();
    drag.current =
      kind === "rotate"
        ? { kind, i, start: items[i], pushed: false, before: items }
        : { kind, i, start: items[i], corner, x: e.clientX, y: e.clientY, pushed: false, before: items };
    stageRef.current?.setPointerCapture(e.pointerId);
  }

  function beginVertex(e: React.PointerEvent, i: number, k: number, part: "anchor" | "in" | "out") {
    e.stopPropagation();
    e.preventDefault();
    const s = items[i];
    // Kendali selalu lengkap selama diedit (titik sudut = kendali menempel ke titiknya).
    const start = { ...s, handles: s.handles?.length === s.points?.length ? s.handles : (s.points ?? []).map(flatHandle) };
    const pull = part === "anchor" && e.altKey;
    drag.current = { kind: "vertex", i, k, part: pull ? "pull" : part, brk: e.altKey, start, x: e.clientX, y: e.clientY, pushed: false, before: items };
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
  function pushOnce(d: { pushed: boolean; before: El[] }) {
    if (d.pushed) return;
    d.pushed = true;
    setHist({ past: [...hist.past.slice(-99), { ...snap(), items: d.before }], future: [] });
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
      const snapped = e.altKey ? { x: moved.x, y: moved.y, guides: { v: [], h: [] } } : snapMove(moved, items.filter((_, j) => !d.idx.includes(j)), thrX, thrY);
      setGuides(snapped.guides);
      const ox = snapped.x - g.x, oy = snapped.y - g.y;
      setItems(
        items.map((s, j) => {
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
    const set = (patch: Partial<Slot>) => setItems(items.map((o, j) => (j === d.i ? { ...o, ...patch } : o)));
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
    // Sudut: foto proporsional dengan Shift; gambar proporsional bawaan (Shift = bebas).
    const keep = s.img ? !e.shiftKey : e.shiftKey;
    if (keep && sx !== 0 && sy !== 0) {
      const k = Math.max(w / w0, h / h0);
      w = w0 * k;
      h = h0 * k;
    }
    const ox = (sx * (w - w0)) / 2, oy = (sy * (h - h0)) / 2;
    const cx = cx0 + ox * cos - oy * sin, cy = cy0 + ox * sin + oy * cos;
    const resized = { ...s, x: (cx - w / 2) / stageW, y: (cy - h / 2) / stageH, w: w / stageW, h: h / stageH };
    if (s.rotation === 0 && !keep && !e.altKey) {
      const snapped = snapResize(resized, [sx, sy], items.filter((_, j) => j !== d.i), thrX, thrY);
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
      const hit = items.flatMap((s, j) => (s.x < m.x + m.w && s.x + s.w > m.x && s.y < m.y + m.h && s.y + s.h > m.y ? [j] : []));
      setSel(d.add ? [...new Set([...sel, ...hit])] : hit);
      return;
    }
    if (d.kind === "vertex" && frame) {
      if (!d.pushed) {
        // Alt + klik titik (tanpa seret) = jadikan titik sudut.
        if (d.part === "pull" && isSmooth(d.start.points![d.k], d.start.handles![d.k])) {
          const hs = d.start.handles!.slice();
          hs[d.k] = flatHandle(d.start.points![d.k]);
          change(items.map((s, j) => (j === d.i ? tidyCurve(refitPoints({ ...s, handles: hs }, frame.width, frame.height)) : s)));
        }
        return;
      }
      // Titik boleh keluar kotak saat diseret; setelah dilepas, kotak foto disesuaikan.
      setItems((cur) => cur.map((s, j) => (j === d.i ? tidyCurve(refitPoints(s, frame.width, frame.height)) : s)));
    }
  }

  // --- simpan ---

  // name = diisi langsung di pop-up simpan (bukan dibuka lewat panel).
  const todo: { text: string; tab?: SideTab; name?: true }[] = [];
  if (!frame) todo.push({ text: "Unggah gambar latar / bingkai.", tab: "latar" });
  else if (!format) todo.push({ text: "Ukuran gambar tidak cocok dengan format cetak — atur posisi gambar.", tab: "latar" });
  if (!name.trim()) todo.push({ text: "Isi nama template.", name: true });
  if (frame && nPhotos === 0) todo.push({ text: "Tambahkan minimal satu foto.", tab: "elemen" });

  /**
   * Simpan: gambar latar / foto belum ada → notifikasi singkat saja. Selain itu selalu dialog konfirmasi
   * (nama, kategori, tampil di booth) dulu; `confirmed` = dari tombol di dialog itu.
   */
  function submit(confirmed = false) {
    const blocking = todo.filter((t) => !t.name);
    if (blocking.length) {
      setShowTodo(false);
      // id baru tiap klik → animasi masuk diulang & timer diperpanjang.
      setToast((cur) => ({ id: (cur?.id ?? 0) + 1, items: blocking.map((t) => t.text) }));
      return;
    }
    if (!confirmed || todo.length || !frame || !format) {
      setShowTodo(true);
      return;
    }
    setShowTodo(false);
    const f = new FormData();
    if (template) f.set("id", template.id);
    f.set(
      "meta",
      JSON.stringify({
        name: name.trim(),
        format,
        frame_overlay: overlay,
        slots: photos.map((s) => {
          const shape = !overlay && s.shape === "frame" ? "rect" : s.shape;
          return { ...s, shape, layer: slotLayer({ ...s, shape }, overlay), x: r4(s.x), y: r4(s.y), w: r4(s.w), h: r4(s.h) };
        }),
        images: imgs.map((e) => ({ asset_id: e.img!.asset_id, x: r4(e.x), y: r4(e.y), w: r4(e.w), h: r4(e.h), rotation: e.rotation })),
        category_ids: [...cats],
        active,
      }),
    );
    if (frame.file) f.set("frame", frame.file);
    startTransition(() => run(f));
  }

  // --- pintasan keyboard ---

  function onKey(e: KeyboardEvent) {
    const t = e.target as HTMLElement | null;
    if (t && (t.closest("input, textarea, [contenteditable=true]") || t.closest("[role=dialog]"))) return;
    if (ask || tips || keys || guide || showTodo || greenAsk) return;
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
      return setSel(items.map((_, i) => i));
    }
    if (mod && k === "v") {
      e.preventDefault();
      return paste();
    }
    if (!sel.length) return;
    if (mod && k === "c") {
      e.preventDefault();
      return setClip(sel.map((i) => items[i]));
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
      change(items.map((s, j) => (sel.includes(j) ? { ...s, x: r4(s.x + dx), y: r4(s.y + dy) } : s)));
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


  /** Satu baris di panel Lapisan: pilih (Shift = tambah), majukan/mundurkan dalam kelompoknya, hapus. */
  function layerRow(i: number) {
    const e = items[i];
    const on = sel.includes(i);
    const isImg = !!e.img;
    const above = !isImg && slotLayer(e, overlay) === "above";
    const [lo, hi] = isImg ? [nPhotos, items.length - 1] : [0, nPhotos - 1];
    return (
      <li key={i} className={cn("group flex items-center gap-2 rounded-lg px-1.5 py-1", on ? "bg-primary-soft" : "hover:bg-canvas")}>
        <button
          type="button"
          onClick={(ev) => {
            setMode("edit");
            setSel(ev.shiftKey ? (on ? sel.filter((j) => j !== i) : [...sel, i]) : [i]);
          }}
          aria-pressed={on}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          {isImg ? (
            <span className="checker size-9 shrink-0 overflow-hidden rounded-md ring-1 ring-inset ring-edge">
              <img src={e.img!.url} alt="" className="size-full object-contain" />
            </span>
          ) : (
            <span className={cn("relative flex size-9 shrink-0 items-center justify-center rounded-md", above ? "bg-info-soft text-info" : "bg-primary-soft text-primary")}>
              <ShapeIcon shape={e.shape} points={e.points} className="size-5" />
              <span className={cn("absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded px-0.5 text-[10px] font-semibold text-white", above ? "bg-info" : "bg-primary")}>
                {i + 1}
              </span>
            </span>
          )}
          <span className="min-w-0">
            <span className={cn("block truncate font-medium", on && "text-primary")}>{isImg ? `Gambar ${i - nPhotos + 1}` : `Foto ${i + 1}`}</span>
            <span className="block truncate text-xs text-subtle">
              {isImg ? "Hiasan" : e.shape === "custom" ? "Bentuk bebas" : (SHAPES.find((x) => x.key === e.shape)?.label ?? "Foto")}
            </span>
          </span>
        </button>
        <span className={cn("flex shrink-0 flex-col", !on && "opacity-0 group-hover:opacity-100 focus-within:opacity-100")}>
          {(
            [
              [1, isImg ? "Majukan" : "Majukan (urutan foto lebih akhir)", ChevronUp, i >= hi],
              [-1, isImg ? "Mundurkan" : "Mundurkan (urutan foto lebih awal)", ChevronDown, i <= lo],
            ] as const
          ).map(([dir, label, Icon, off]) => (
            <button
              key={dir}
              type="button"
              aria-label={label}
              title={label}
              disabled={off}
              onClick={() => reorder(i, dir)}
              className="flex h-4 w-6 items-center justify-center rounded text-subtle hover:bg-surface hover:text-fg disabled:opacity-30"
            >
              <Icon className="size-3.5" strokeWidth={2.25} />
            </button>
          ))}
        </span>
      </li>
    );
  }

  /** Panel Lapisan: semua elemen dari paling depan ke paling belakang, persis urutan gambar di booth. */
  function layerPanel() {
    const idx = items.map((_, i) => i);
    const imgRows = idx.filter((i) => i >= nPhotos).reverse();
    const aboveRows = idx.filter((i) => i < nPhotos && slotLayer(items[i], overlay) === "above").reverse();
    const belowRows = idx.filter((i) => i < nPhotos && slotLayer(items[i], overlay) === "below").reverse();
    const frameRow = frame && (
      <li key="frame" className="flex items-center gap-2.5 rounded-lg px-1.5 py-1">
        <span className="checker size-9 shrink-0 overflow-hidden rounded-md ring-1 ring-inset ring-edge">
          <img src={frame.src} alt="" className="size-full object-contain" />
        </span>
        <button type="button" onClick={() => setSide("latar")} className="min-w-0 text-left">
          <span className="block font-medium">{overlay ? "Bingkai" : "Latar"}</span>
          <span className="block text-xs text-subtle">{overlay ? "Foto di bawahnya terlihat lewat lubang" : "Paling belakang"}</span>
        </button>
      </li>
    );
    const group = (title: string, rows: number[]) =>
      rows.length > 0 && (
        <div key={title} className="flex flex-col gap-0.5">
          <p className="px-1.5 text-[11px] font-medium uppercase tracking-wide text-subtle">{title}</p>
          <ul className="flex flex-col gap-0.5">{rows.map(layerRow)}</ul>
        </div>
      );
    return (
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Lapisan</h3>
          <IconBtn label="Urutkan foto otomatis (atas → bawah, kiri → kanan)" onClick={() => change([...sortSlots(photos), ...imgs])} disabled={nPhotos < 2}>
            <SortAsc className="size-4" strokeWidth={2} />
          </IconBtn>
        </div>
        {items.length === 0 && !frame ? (
          <p className="text-xs text-subtle">Belum ada apa pun. Unggah gambar latar & tambahkan foto di tab Elemen.</p>
        ) : (
          <>
            {group("Hiasan", imgRows)}
            {group(overlay ? "Foto di atas bingkai" : "Foto", aboveRows)}
            {overlay && frameRow && <ul className="border-y border-edge py-1">{frameRow}</ul>}
            {group("Foto di bawah bingkai", belowRows)}
            {!overlay && frameRow && <ul className="border-t border-edge pt-1">{frameRow}</ul>}
          </>
        )}
        <p className="text-xs text-subtle">
          Atas = paling depan. Nomor foto = urutan jepret ({nPhotos}/{MAX_SLOTS}); mengubah urutan foto juga mengubah nomornya.
        </p>
      </div>
    );
  }

  /** Pegangan ubah ukuran (8) & putar untuk elemen terpilih — dipakai foto & gambar. */
  function toggleCat(id: string) {
    const next = new Set(cats);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCats(next);
  }

  function catChips() {
    return (
      <div className="flex flex-wrap gap-1.5">
        {categories.map((c) => {
          const on = cats.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggleCat(c.id)}
              className={cn("h-7 rounded-full px-3 text-xs font-medium ring-1 ring-inset", on ? "bg-primary-soft text-primary ring-primary/30" : "bg-surface text-subtle ring-edge-strong hover:text-fg")}
            >
              {c.name}
            </button>
          );
        })}
        {categories.length === 0 && <span className="text-xs text-subtle">Belum ada kategori.</span>}
      </div>
    );
  }

  function selHandles(i: number, c: string) {
    return (
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
    );
  }

  const serverFields = Object.entries(state.fields ?? {});
  const blockers = todo.filter((t) => !t.name);
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
          id="tpl-name"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder={builtin ? "Nama template bawaan…" : "Nama template…"}
          aria-label="Nama template"
          className={cn(
            "order-last h-9 min-w-0 basis-full rounded-lg border border-edge bg-transparent px-2 text-base font-semibold outline-none placeholder:font-normal placeholder:text-subtle hover:border-edge focus:border-primary focus:ring-3 focus:ring-primary/15 sm:order-none sm:max-w-xs sm:flex-1 sm:basis-auto sm:border-transparent",
            todo.some((t) => t.name) && state.message && "border-danger",
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
          <Button small onClick={() => setGuide(true)} title="Cara membuat template">
            <BookOpen className="size-4" strokeWidth={2} /> <span className="hidden sm:inline">Panduan</span>
          </Button>
          <IconBtn label="Pintasan keyboard (?)" onClick={() => setKeys(true)}>
            <Keyboard className="size-[18px]" strokeWidth={2} />
          </IconBtn>
          <Button small onClick={() => setMode(mode === "edit" ? "preview" : "edit")} disabled={!frame || !!adjust} title="Pratinjau (P)">
            {mode === "edit" ? <Eye className="size-4" strokeWidth={2} /> : <Pencil className="size-4" strokeWidth={2} />}
            {mode === "edit" ? "Pratinjau" : "Kembali atur"}
          </Button>
          <div className="relative">
            <Button tone="blue" small onClick={() => submit()} disabled={saving} title={`Simpan (${MOD} S)`}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Simpan
            </Button>
            {toast && (
              <div
                key={toast.id}
                role="status"
                className="absolute right-0 top-full z-40 mt-3 flex w-[min(22rem,calc(100vw-2rem))] animate-toast items-start gap-3 rounded-xl border border-warning/30 bg-surface px-4 py-3 shadow-pop"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning">
                  <CircleDashed className="size-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold">Lengkapi data dulu</p>
                  <ul className="mt-0.5 text-subtle">
                    {toast.items.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
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
      <input
        ref={imgFileRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void addImage(f);
        }}
      />

      <div className="grid items-start gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch">
        {/* Sidebar */}
        <aside className="order-2 flex min-w-0 overflow-hidden rounded-xl border border-edge bg-surface shadow-card lg:order-none lg:h-full">
          <nav className="flex w-16 shrink-0 flex-col gap-1 border-r border-edge bg-canvas/50 p-1.5" aria-label="Panel editor">
            {(
              [
                ["elemen", "Elemen", Shapes],
                ["lapisan", "Lapisan", Layers],
                ["latar", "Latar", ImageUp],
                ["info", "Info", Tag],
              ] as [SideTab, string, typeof Shapes][]
            ).map(([k, label, Icon]) => {
              const on = adjust ? k === "latar" : panel === k;
              const off = !frame && needsFrame(k);
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  disabled={off}
                  title={off ? "Unggah gambar latar dulu di tab Latar" : undefined}
                  onClick={() => setSide(k)}
                  className={cn(
                    "relative flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium disabled:cursor-not-allowed disabled:opacity-40",
                    on ? "bg-surface text-primary shadow-card" : "text-subtle enabled:hover:bg-surface enabled:hover:text-fg",
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                  {label}
                </button>
              );
            })}
          </nav>
          <div className="min-w-0 flex-1 overflow-y-auto p-3">
            {adjust ? (
              <AdjustPanel adjust={adjust} onChange={setAdjust} onCancel={() => setAdjust(null)} onApply={applyAdjust} busy={busy} notice={notice} />
            ) : panel === "elemen" ? (
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
                        disabled={!frame || nPhotos >= MAX_SLOTS}
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
                        ["pen", "Pen (lengkung)", PenTool, "Klik = titik sudut · klik + seret = lengkung · klik titik pertama untuk menutup"],
                        ["lasso", "Seret bebas", Spline, "Tahan & seret seperti spidol — hasilnya dihaluskan otomatis"],
                      ] as const
                    ).map(([k, label, Icon, hint]) => (
                      <button
                        key={k}
                        type="button"
                        title={hint}
                        disabled={!frame || nPhotos >= MAX_SLOTS}
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
                </section>
                <section className="flex flex-col gap-2">
                  <h3 className="font-semibold">
                    Gambar hiasan <span className="font-normal text-subtle">({imgs.length}/20)</span>
                  </h3>
                  <Button onClick={() => imgFileRef.current?.click()} disabled={!frame || busy || imgs.length >= 20}>
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" strokeWidth={2} />} Tambah gambar
                  </Button>
                  <p className="text-xs text-subtle">PNG transparan, tampil di atas foto & bingkai. Atur susunannya di tab Lapisan.</p>
                </section>
              </div>
            ) : panel === "lapisan" ? (
              layerPanel()
            ) : panel === "latar" ? (
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
                    <Switch checked={overlay} onChange={(v) => commit({ overlay: v })} label="Bingkai di atas foto" />
                  </label>
                )}
                {frame && (
                  <label className="flex items-center justify-between gap-3">
                    <span className="font-medium">Garis aman cetak</span>
                    <Switch checked={showSafe} onChange={setShowSafe} label="Garis aman cetak" />
                  </label>
                )}
                {/* Saran lengkap di pop-up agar panel sempit tetap ringkas. */}
                <button
                  type="button"
                  onClick={() => setTips(true)}
                  className="flex flex-col gap-1 rounded-lg p-3 text-left ring-1 ring-inset ring-edge hover:bg-canvas hover:ring-primary/40"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Lightbulb className="size-4 shrink-0 text-warning" strokeWidth={2} />
                    <span className="flex-1">Saran gambar</span>
                    <ChevronRight className="size-4 shrink-0 text-subtle" strokeWidth={2} />
                  </span>
                  <span className="text-xs text-subtle">Ukuran tiap format, unduh panduan, dan cara menandai tempat foto.</span>
                </button>
              </div>
            ) : panel === "info" ? (
              <div className="flex flex-col gap-3 text-sm">
                <h3 className="font-semibold">Info template</h3>
                {frame && format && (
                  <p className="text-xs text-subtle">
                    {FORMATS[format].label} · {frame.width}×{frame.height} px · {FORMATS[format].hint}
                  </p>
                )}
                <div className="flex flex-col gap-1.5">
                  <span className="font-medium">Kategori</span>
                  {catChips()}
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
            ) : item?.img && one !== null ? (
              <>
                <span className="mr-1 font-semibold">Gambar {one - nPhotos + 1}</span>
                <label className="inline-flex items-center gap-1 px-1 text-subtle" title="Kemiringan (derajat)">
                  Miring
                  <input
                    type="number"
                    min={-180}
                    max={180}
                    value={Math.round(item.rotation)}
                    onChange={(e) => update(one, { rotation: clamp(Number(e.target.value) || 0, -180, 180) })}
                    className="h-7 w-14 rounded-md border border-edge-strong px-1.5 text-xs tabular-nums text-fg outline-none focus:border-primary"
                  />
                  °
                </label>
                <Button
                  small
                  title="Kembalikan ke rasio asli gambar (lebar tetap)"
                  onClick={() => frame && update(one, { h: r4((item.w * frame.width) / item.img!.ratio / frame.height) })}
                >
                  Rasio asli
                </Button>
                <span className="mx-0.5 h-5 w-px bg-edge" />
                <IconBtn label="Tengah mendatar di halaman" onClick={() => align("c")}>
                  <AlignCenterVertical className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label="Tengah tegak di halaman" onClick={() => align("m")}>
                  <AlignCenterHorizontal className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label={`Mundurkan (${MOD} [)`} onClick={() => reorder(one, -1)} disabled={one === nPhotos}>
                  <ArrowDownToLine className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label={`Majukan (${MOD} ])`} onClick={() => reorder(one, 1)} disabled={one === items.length - 1}>
                  <ArrowUpToLine className="size-4" strokeWidth={2} />
                </IconBtn>
                <span className="mx-0.5 h-5 w-px bg-edge" />
                <IconBtn label={`Duplikat (${MOD} D)`} onClick={() => duplicate([one])} disabled={imgs.length >= 20}>
                  <Copy className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label="Hapus (Delete)" onClick={() => remove([one])}>
                  <Trash2 className="size-4 text-danger" strokeWidth={2} />
                </IconBtn>
              </>
            ) : item && one !== null ? (
              <>
                <span className="mr-1 font-semibold">Foto {one + 1}</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShapeMenu(!shapeMenu)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 ring-1 ring-inset ring-edge-strong hover:bg-canvas"
                    aria-expanded={shapeMenu}
                  >
                    <ShapeIcon shape={item.shape} points={item.points} />
                    {item.shape === "custom" ? "Bentuk bebas" : (SHAPES.find((s) => s.key === item.shape)?.label ?? item.shape)}
                  </button>
                  {shapeMenu && (
                    <div className="absolute left-0 top-full z-40 mt-1 grid w-60 grid-cols-3 gap-1 rounded-xl border border-edge bg-surface p-2 shadow-pop">
                      {SHAPES.map((sh) => {
                        const off = sh.key === "frame" && (!overlay || slotLayer(item, overlay) === "above");
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
                            className={cn("flex flex-col items-center gap-1 rounded-lg p-1.5 text-[11px] disabled:opacity-30", item.shape === sh.key ? "bg-primary-soft text-primary" : "hover:bg-canvas")}
                          >
                            <ShapeIcon shape={sh.key} className="size-5" />
                            {sh.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {item.shape === "custom" && (
                  <>
                    <Button small onClick={() => setEditPts(editPts === one ? null : one)} title="Edit titik (atau klik dua kali bentuknya)">
                      <PenLine className="size-4" strokeWidth={2} /> {editPts === one ? "Selesai edit titik" : "Edit titik"}
                    </Button>
                    <IconBtn label="Haluskan semua titik (jadi lengkung)" onClick={() => frame && replace(one, refitPoints({ ...item, handles: smoothHandles(item.points ?? []) }, frame.width, frame.height))}>
                      <Waves className="size-4" strokeWidth={2} />
                    </IconBtn>
                    <IconBtn
                      label="Jadikan semua titik sudut tajam"
                      disabled={!item.handles}
                      onClick={() => frame && replace(one, tidyCurve(refitPoints({ ...item, handles: (item.points ?? []).map(flatHandle) }, frame.width, frame.height)))}
                    >
                      <Triangle className="size-4" strokeWidth={2} />
                    </IconBtn>
                  </>
                )}
                {item.shape === "rounded" && (
                  <label className="inline-flex items-center gap-1.5 px-1 text-subtle" title="Lengkung sudut">
                    Lengkung
                    <input
                      type="range"
                      min={0}
                      max={0.5}
                      step={0.01}
                      value={item.radius ?? 0.12}
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
                        aria-pressed={slotLayer(item, overlay) === k}
                        onClick={() => setLayer([one], k)}
                        className={cn(
                          "h-7 rounded-md px-2 font-medium",
                          slotLayer(item, overlay) === k ? (k === "above" ? "bg-info-soft text-info" : "bg-primary-soft text-primary") : "text-subtle hover:text-fg",
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
                    value={Math.round(item.rotation)}
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
                <IconBtn label={`Urutan foto lebih akhir (${MOD} ])`} onClick={() => reorder(one, 1)} disabled={one === items.length - 1}>
                  <ChevronRight className="size-4" strokeWidth={2} />
                </IconBtn>
                <span className="mx-0.5 h-5 w-px bg-edge" />
                <IconBtn label={`Duplikat (${MOD} D)`} onClick={() => duplicate([one])} disabled={nPhotos >= MAX_SLOTS}>
                  <Copy className="size-4" strokeWidth={2} />
                </IconBtn>
                <IconBtn label="Hapus (Delete)" onClick={() => remove([one])}>
                  <Trash2 className="size-4 text-danger" strokeWidth={2} />
                </IconBtn>
              </>
            ) : sel.length > 1 ? (
              <>
                <span className="mr-1 font-semibold">{sel.length} dipilih</span>
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
                <IconBtn label={`Duplikat (${MOD} D)`} onClick={() => duplicate(sel)} disabled={nPhotos + sel.filter((i) => i < nPhotos).length > MAX_SLOTS}>
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
              // Kartu unggah ringkas (bukan berbentuk kertas, agar tidak disangka bingkai); bisa seret-lepas file.
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) void pickFile(f);
                }}
                className="m-auto flex w-full max-w-md flex-col items-center gap-3 rounded-xl border-2 border-dashed border-edge-strong bg-surface px-6 py-8 text-center text-sm text-subtle"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <ImageUp className="size-6" strokeWidth={1.75} />
                </span>
                <span className="text-base font-semibold text-fg">Mulai dari gambar desainmu</span>
                <span>Seret file ke sini, atau</span>
                <Button tone="blue" onClick={() => fileRef.current?.click()} disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" strokeWidth={2} />} Pilih gambar
                </Button>
                <span className="text-xs">
                  PNG dengan bagian foto transparan → posisi foto terdeteksi otomatis. JPG juga bisa: posisi foto kamu atur sendiri. Maks. 4 MB.
                </span>
                <div className="mt-1 flex w-full flex-col items-center gap-2 border-t border-edge pt-4 text-xs">
                  <span>Belum punya desain? Unduh panduan ukuran untuk memandumu membuat template:</span>
                  <div className="grid w-full grid-cols-3 gap-2">
                    {FORMAT_KEYS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => void downloadGuide(f)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 font-medium text-primary ring-1 ring-inset ring-edge hover:bg-primary-soft"
                      >
                        <Download className="size-3.5 shrink-0" strokeWidth={2} />
                        <span className="truncate">{FORMATS[f].label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : mode === "preview" ? (
              <div className="m-auto shrink-0" style={{ width: stageW }}>
                <TemplatePreview uid="editor" src={frame.src} width={frame.width} height={frame.height} overlay={overlay} slots={photos} images={imgs.map((e) => ({ ...e, url: e.img!.url }))} className="rounded-md shadow-card" />
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
                  // Pointer ditangkap kanvas saat item ditekan → klik dua kali sampai di sini: edit titik bentuk bebas terpilih.
                  if (one !== null && items[one]?.shape === "custom") setEditPts(one);
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
                {items.map((s, i) => {
                  const on = sel.includes(i);
                  if (s.img) {
                    // Gambar lapisan: tampil apa adanya (paling depan), garis tipis saat terpilih.
                    const c = "var(--color-success)";
                    return (
                      <div
                        key={i}
                        onPointerDown={(e) => beginSlot(e, i)}
                        className={cn("group absolute", draw ? "pointer-events-none" : "cursor-move", on ? "z-30" : "z-[25]")}
                        style={{ left: s.x * stageW, top: s.y * stageH, width: s.w * stageW, height: s.h * stageH, transform: `rotate(${s.rotation}deg)` }}
                      >
                        <img src={s.img.url} alt="" draggable={false} className="pointer-events-none absolute inset-0 size-full max-w-none select-none" />
                        <span aria-hidden className={cn("pointer-events-none absolute inset-0 border", on ? "border-[1.5px]" : "border-dashed opacity-0 group-hover:opacity-100")} style={{ borderColor: c }} />
                        {on && one === i && selHandles(i, c)}
                      </div>
                    );
                  }
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
                      {on && one === i && !pointEdit && selHandles(i, c)}
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
          {frame && !adjust && mode === "edit" && item && one !== null && (
            <details className="shrink-0 border-t border-edge bg-surface px-3 py-2 text-xs lg:absolute lg:inset-x-0 lg:bottom-0 lg:z-10 lg:max-h-[40%] lg:overflow-y-auto">
              <summary className="cursor-pointer text-subtle hover:text-fg">Posisi & ukuran tepat (%)</summary>
              <div className="mt-2 grid max-w-md grid-cols-4 gap-2">
                <Num label="X" value={item.x * 100} onChange={(v) => update(one, { x: r4(v / 100) })} />
                <Num label="Y" value={item.y * 100} onChange={(v) => update(one, { y: r4(v / 100) })} />
                <Num label="Lebar" value={item.w * 100} min={2} onChange={(v) => update(one, { w: r4(clamp(v, 2, 150) / 100) })} />
                <Num label="Tinggi" value={item.h * 100} min={2} onChange={(v) => update(one, { h: r4(clamp(v, 2, 150) / 100) })} />
              </div>
            </details>
          )}
        </section>
      </div>

      <Dialog open={tips} onClose={() => setTips(false)} title="Saran gambar bingkai" wide>
        <FrameTips />
      </Dialog>

      <TemplateGuide open={guide} onOpenChange={setGuide} />
      <Dialog open={!!greenAsk} onClose={() => setGreenAsk(null)} title="Area hijau terdeteksi">
        {greenAsk && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="size-10 shrink-0 rounded-lg ring-1 ring-inset ring-edge" style={{ background: "#00ff00" }} aria-hidden />
              <p className="text-sm text-subtle">
                Ada <b className="font-medium text-fg">{greenAsk.regions} area hijau</b> di gambarmu. Jadikan tempat foto? Area hijau akan dihapus
                (jadi transparan) dan posisi fotonya dipasang otomatis.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                onClick={() => {
                  const f = greenAsk.file;
                  setGreenAsk(null);
                  void pickFile(f, true);
                }}
              >
                Tidak, pakai apa adanya
              </Button>
              <Button tone="blue" onClick={() => void applyGreen()} disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />} Ya, jadikan tempat foto
              </Button>
            </div>
          </div>
        )}
      </Dialog>
      <Dialog open={showTodo} onClose={() => setShowTodo(false)} title={template ? "Simpan perubahan" : "Simpan template"} wide>
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit(true);
          }}
        >
          <div className="grid gap-5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
            {/* Pratinjau mini */}
            <div className="flex flex-col items-center gap-2 rounded-xl bg-canvas p-3">
              {frame ? (
                <TemplatePreview
                  uid="simpan"
                  src={frame.src}
                  width={frame.width}
                  height={frame.height}
                  overlay={overlay}
                  slots={photos}
                  images={imgs.map((e) => ({ ...e, url: e.img!.url }))}
                  numbers={false}
                  className="max-h-60 w-full rounded-md shadow-card"
                />
              ) : (
                <div className="flex aspect-[2/3] w-full items-center justify-center rounded-md border-2 border-dashed border-edge-strong text-subtle">
                  <ImageUp className="size-6" strokeWidth={1.75} />
                </div>
              )}
              <p className="text-center text-xs text-subtle">
                {!frame ? "Belum ada gambar" : `${format ? FORMATS[format].label : "Ukuran belum cocok"} · ${nPhotos} foto${imgs.length ? ` · ${imgs.length} hiasan` : ""}`}
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              {/* Persiapan */}
              <ul className="flex flex-col gap-1.5 text-sm">
                {(
                  [
                    [!!frame && !!format, frame && !format ? "Ukuran gambar cocok dengan format cetak" : "Gambar latar / bingkai", "latar", frame && !format ? "Atur" : "Unggah"],
                    [!!frame && nPhotos > 0, nPhotos > 0 ? `${nPhotos} posisi foto` : "Minimal satu posisi foto", "elemen", "Tambah"],
                  ] as const
                ).map(([ok, text, tab, act]) => (
                  <li key={tab} className="flex items-center gap-2">
                    {ok ? (
                      <CircleCheck className="size-[18px] shrink-0 text-success" strokeWidth={2} />
                    ) : (
                      <CircleDashed className="size-[18px] shrink-0 text-warning" strokeWidth={2} />
                    )}
                    <span className={cn("flex-1", ok ? "text-fg" : "text-subtle")}>{text}</span>
                    {!ok && (frame || tab === "latar") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSide(tab);
                          setShowTodo(false);
                          if (tab === "latar" && !frame) fileRef.current?.click();
                        }}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {act}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Nama template</span>
                <input
                  autoFocus
                  value={name}
                  maxLength={60}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="mis. Wedding Tiara & Latif"
                  className="h-10 rounded-lg border border-edge-strong bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
                />
              </label>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">
                  Kategori <span className="font-normal text-subtle">(opsional, untuk mencari sesuai tema acara)</span>
                </span>
                {catChips()}
              </div>
              <label className="flex items-center justify-between gap-3 rounded-lg bg-canvas px-3 py-2.5">
                <span className="text-sm">
                  <span className="font-medium">{builtin ? "Aktif untuk semua pemilik" : "Tampil di booth"}</span>
                  <span className="block text-xs text-subtle">{builtin ? "Bisa dimatikan kapan saja." : "Bisa dipilih tamu setelah booth sinkron."}</span>
                </span>
                <Switch checked={active} onChange={setActive} label="Aktif" />
              </label>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-edge pt-4 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" onClick={() => setShowTodo(false)}>
              Kembali mengedit
            </Button>
            <Button type="submit" tone="blue" disabled={saving || todo.length > 0}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" strokeWidth={2} />}
              {blockers.length ? "Lengkapi persiapan dulu" : !name.trim() ? "Isi nama dulu" : "Simpan template"}
            </Button>
          </div>
        </form>
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
    <dl className="grid grid-cols-[auto_1fr] items-center gap-x-8 text-xs">
      {SHORTCUTS.map(([k, v]) => (
        <div key={k} className="col-span-2 grid grid-cols-subgrid items-center border-b border-edge py-2 last:border-b-0">
          <dt>
            <kbd className="whitespace-nowrap rounded-md bg-canvas px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-inset ring-edge">{k}</kbd>
          </dt>
          <dd className="text-subtle">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
