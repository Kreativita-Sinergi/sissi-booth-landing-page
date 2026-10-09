import { connection } from "next/server";

/**
 * Periode laporan dari searchParams (bawaan 30 hari terakhir, tanggal WIB). `connection()` menandai
 * bahwa "hari ini" baru dihitung saat ada permintaan (cacheComponents melarang Date.now() saat prerender).
 */
export async function periodFrom(sp: { from?: string; to?: string }): Promise<{ from: string; to: string }> {
  await connection();
  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  const valid = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);
  const to = valid(sp.to) ?? today;
  const [y, m, d] = to.split("-").map(Number);
  const from = valid(sp.from) ?? new Date(Date.UTC(y, m - 1, d - 29)).toISOString().slice(0, 10);
  return from <= to ? { from, to } : { from: to, to: from };
}

export type SP = Promise<Record<string, string | undefined>>;

/** Waktu permintaan (ms) untuk "x hari lalu" dsb. — hanya di Server Component dinamis. */
export async function requestTime(): Promise<number> {
  await connection();
  return Date.now();
}
