import type { Slot, SlotShape, TemplateFormat } from "./types";

/** Logika template bingkai yang dipakai editor & pratinjau (aman di server maupun browser). */

/** Format cetak → rasio & ukuran (docs/api.md §8.1). */
export const FORMATS: Record<TemplateFormat, { label: string; hint: string; ratio: number; minShort: number; size: string; px: [number, number] }> = {
  strip_2x6: { label: "Strip 2×6", hint: "Dua strip kembar per lembar 4×6", ratio: 1 / 3, minShort: 600, size: "600 × 1800 px", px: [600, 1800] },
  "4r_portrait": { label: "4R tegak", hint: "Satu lembar 4×6 tegak", ratio: 2 / 3, minShort: 1200, size: "1200 × 1800 px", px: [1200, 1800] },
  "4r_landscape": { label: "4R mendatar", hint: "Satu lembar 4×6 mendatar", ratio: 3 / 2, minShort: 1200, size: "1800 × 1200 px", px: [1800, 1200] },
};

export const FORMAT_KEYS = Object.keys(FORMATS) as TemplateFormat[];

/** Format yang cocok dengan ukuran gambar (toleransi rasio 2%, sama dengan server); null bila tidak ada. */
export function formatFor(width: number, height: number): TemplateFormat | null {
  const r = width / height;
  return FORMAT_KEYS.find((f) => Math.abs(r - FORMATS[f].ratio) / FORMATS[f].ratio <= 0.02) ?? null;
}

/** Format dengan rasio paling dekat (untuk saran saat gambar tidak pas). */
export function closestFormat(width: number, height: number): TemplateFormat {
  const r = width / height;
  return FORMAT_KEYS.reduce((a, b) => (Math.abs(Math.log(r / FORMATS[b].ratio)) < Math.abs(Math.log(r / FORMATS[a].ratio)) ? b : a));
}

/** Pesan bila gambar tidak memenuhi syarat format; null = boleh dipakai. */
export function frameProblem(width: number, height: number): string | null {
  const f = formatFor(width, height);
  if (!f) {
    return `Ukuran ${width}×${height} px tidak cocok dengan format mana pun. Pakai ${FORMAT_KEYS.map((k) => `${FORMATS[k].label} (${FORMATS[k].size})`).join(", ")}.`;
  }
  if (Math.min(width, height) < FORMATS[f].minShort) return `Gambar terlalu kecil untuk ${FORMATS[f].label}: minimal ${FORMATS[f].size}.`;
  if (Math.max(width, height) > 6000) return "Gambar terlalu besar: maksimal 6000 px per sisi.";
  return null;
}

export const SHAPES: { key: SlotShape; label: string }[] = [
  { key: "frame", label: "Ikuti lubang" },
  { key: "rect", label: "Kotak" },
  { key: "rounded", label: "Sudut bulat" },
  { key: "circle", label: "Bulat" },
  { key: "heart", label: "Hati" },
  { key: "star", label: "Bintang" },
];

const HEART =
  "M0.5,0.94 C0.22,0.74 0,0.55 0,0.31 C0,0.14 0.13,0.02 0.28,0.02 C0.38,0.02 0.46,0.07 0.5,0.15 C0.54,0.07 0.62,0.02 0.72,0.02 C0.87,0.02 1,0.14 1,0.31 C1,0.55 0.78,0.74 0.5,0.94 Z";

function starPath(): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.5 : 0.21;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(0.5 + r * Math.cos(a)).toFixed(4)},${(0.52 + r * Math.sin(a)).toFixed(4)}`);
  }
  return `M${pts.join(" L")} Z`;
}
const STAR = starPath();

/**
 * Bentuk slot sebagai path SVG dalam kotak satuan 0–1 (`clipPathUnits="objectBoundingBox"`).
 * `aspect` = lebar/tinggi slot dalam piksel (agar sudut bulat tetap bulat, tidak gepeng).
 */
export function shapePath(slot: Slot, aspect: number): string {
  switch (slot.shape) {
    case "circle":
      return "M0.5,0 A0.5,0.5 0 1,1 0.5,1 A0.5,0.5 0 1,1 0.5,0 Z";
    case "heart":
      return HEART;
    case "star":
      return STAR;
    case "rounded": {
      const r = Math.min(0.5, Math.max(0, slot.radius ?? 0.1));
      const rx = aspect >= 1 ? r / aspect : r;
      const ry = aspect >= 1 ? r : r * aspect;
      return `M${rx},0 H${1 - rx} A${rx},${ry} 0 0,1 1,${ry} V${1 - ry} A${rx},${ry} 0 0,1 ${1 - rx},1 H${rx} A${rx},${ry} 0 0,1 0,${1 - ry} V${ry} A${rx},${ry} 0 0,1 ${rx},0 Z`;
    }
    default:
      return "M0,0 H1 V1 H0 Z";
  }
}

const round = (n: number) => Math.round(n * 10000) / 10000;

/** Susunan slot awal bila bingkai tidak punya lubang transparan. */
export function defaultSlots(format: TemplateFormat): Slot[] {
  const base = { rotation: 0, shape: "rect" as const };
  if (format === "strip_2x6") {
    return [0, 1, 2].map((i) => ({ ...base, x: 0.08, y: round(0.04 + i * 0.27), w: 0.84, h: 0.24 }));
  }
  if (format === "4r_landscape") {
    return [0, 1].map((i) => ({ ...base, x: round(0.05 + i * 0.46), y: 0.08, w: 0.44, h: 0.72 }));
  }
  return [0, 1, 2, 3].map((i) => ({ ...base, x: round(0.06 + (i % 2) * 0.46), y: round(0.05 + Math.floor(i / 2) * 0.4), w: 0.42, h: 0.37 }));
}

/**
 * Deteksi lubang transparan di bingkai PNG → slot (bentuk "frame": foto di bawah bingkai, terlihat
 * lewat lubang). `data` = piksel RGBA yang sudah diperkecil (sisi terpanjang ±400 px) agar cepat.
 * Wilayah transparan bersambung (4 arah) dihitung sebagai satu lubang; yang terlalu kecil (< 0,4% luas)
 * atau hampir seluas gambar (latar transparan) diabaikan. Slot diurutkan baris demi baris.
 */
export function detectSlots(data: Uint8ClampedArray, width: number, height: number): { slots: Slot[]; transparent: boolean } {
  const n = width * height;
  const clear = new Uint8Array(n);
  let anyClear = false;
  for (let i = 0; i < n; i++) {
    if (data[i * 4 + 3] < 40) {
      clear[i] = 1;
      anyClear = true;
    }
  }
  if (!anyClear) return { slots: [], transparent: false };

  const seen = new Uint8Array(n);
  const stack = new Int32Array(n);
  const found: { x0: number; y0: number; x1: number; y1: number; count: number }[] = [];
  for (let start = 0; start < n; start++) {
    if (!clear[start] || seen[start]) continue;
    let top = 0;
    stack[top++] = start;
    seen[start] = 1;
    let x0 = width, y0 = height, x1 = 0, y1 = 0, count = 0;
    while (top > 0) {
      const p = stack[--top];
      const x = p % width, y = (p - x) / width;
      count++;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      const near = [x > 0 ? p - 1 : -1, x < width - 1 ? p + 1 : -1, y > 0 ? p - width : -1, y < height - 1 ? p + width : -1];
      for (const q of near) {
        if (q >= 0 && clear[q] && !seen[q]) {
          seen[q] = 1;
          stack[top++] = q;
        }
      }
    }
    found.push({ x0, y0, x1: x1 + 1, y1: y1 + 1, count });
  }

  const bleed = 0.004; // sedikit melebihi tepi lubang agar tidak ada celah putih
  const holes = found
    .filter((c) => c.count >= n * 0.004 && (c.x1 - c.x0) * (c.y1 - c.y0) < n * 0.9)
    .map((c) => {
      const x = Math.max(-bleed, c.x0 / width - bleed);
      const y = Math.max(-bleed, c.y0 / height - bleed);
      return { x: round(x), y: round(y), w: round(c.x1 / width + bleed - x), h: round(c.y1 / height + bleed - y), rotation: 0, shape: "frame" as const };
    });
  return { slots: sortSlots(holes), transparent: true };
}

/** Urutan jepret: atas ke bawah, lalu kiri ke kanan untuk slot sebaris (pusat vertikal berdekatan). */
export function sortSlots(slots: Slot[]): Slot[] {
  return [...slots].sort((a, b) => {
    const ay = a.y + a.h / 2, by = b.y + b.h / 2;
    if (Math.abs(ay - by) > Math.min(a.h, b.h) / 2) return ay - by;
    return a.x + a.w / 2 - (b.x + b.w / 2);
  });
}

/** Warna contoh foto per slot (pratinjau tanpa foto asli). */
export const SAMPLE_TONES = ["#93c5fd", "#fca5a5", "#86efac", "#fcd34d", "#c4b5fd", "#f9a8d4", "#5eead4", "#fdba74"];
