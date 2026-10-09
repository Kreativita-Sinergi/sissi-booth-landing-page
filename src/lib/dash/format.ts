/** Format angka & tanggal untuk dashboard (Bahasa Indonesia, WIB). */

const rupiahFmt = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const numberFmt = new Intl.NumberFormat("id-ID");
const TZ = "Asia/Jakarta";

export const rupiah = (n: number) => rupiahFmt.format(n).replace(/\s/g, "");

/** Rupiah ringkas untuk grafik: 1,2 jt · 850 rb. */
export function rupiahShort(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e9) return `${(n / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  if (a >= 1e6) return `${(n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (a >= 1e3) return `${Math.round(n / 1e3)} rb`;
  return String(n);
}

export const number = (n: number) => numberFmt.format(n);

export function date(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
}

export function dateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: TZ,
  });
}

/** "YYYY-MM-DD" → "9 Okt". */
export function dayLabel(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });
}

/** Waktu relatif singkat: "5 mnt lalu", "kemarin", "3 hari lalu". */
export function ago(iso: string | null | undefined, now: number): string {
  if (!iso) return "belum pernah";
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (s < 90) return "baru saja";
  if (s < 3600) return `${Math.round(s / 60)} mnt lalu`;
  if (s < 86400) return `${Math.round(s / 3600)} jam lalu`;
  if (s < 2 * 86400) return "kemarin";
  return `${Math.round(s / 86400)} hari lalu`;
}

/** Perubahan persen terhadap periode sebelumnya (null bila tidak bisa dibandingkan). */
export function delta(cur: number, prev: number): number | null {
  if (prev === 0) return cur === 0 ? 0 : null;
  return Math.round(((cur - prev) / Math.abs(prev)) * 100);
}

export const PLAN_LABEL: Record<string, string> = { daily: "Harian", monthly: "Bulanan", yearly: "Tahunan", lainnya: "Lainnya" };
export const METHOD_LABEL: Record<string, string> = { transfer: "Transfer", cash: "Tunai", qris: "QRIS", other: "Lainnya", free: "Gratis" };
export const LAYOUT_LABEL: Record<string, string> = { classic: "Strip Klasik", trio: "Strip Trio", grid: "Grid Bestie", solo: "Solo Besar" };

/** Nomor WA Indonesia → tautan wa.me (08… → 628…). */
export function waLink(phone: string, text: string): string | null {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "62");
  if (digits.length < 9) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
