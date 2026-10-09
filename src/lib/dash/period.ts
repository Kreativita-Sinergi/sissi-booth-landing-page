/** Periode laporan dari searchParams (bawaan 30 hari terakhir, tanggal WIB). Dipanggil saat request. */
export function periodFrom(sp: { from?: string; to?: string }): { from: string; to: string } {
  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  const valid = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);
  const to = valid(sp.to) ?? today;
  const [y, m, d] = to.split("-").map(Number);
  const from = valid(sp.from) ?? new Date(Date.UTC(y, m - 1, d - 29)).toISOString().slice(0, 10);
  return from <= to ? { from, to } : { from: to, to: from };
}

export type SP = Promise<Record<string, string | undefined>>;

/** Waktu permintaan (ms) untuk "x hari lalu" dsb. — dipanggil di Server Component dinamis. */
export async function requestTime(): Promise<number> {
  return Date.now();
}
