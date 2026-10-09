import { ApiError } from "./api";
import type { ActionState } from "./action-state";

/** Ubah galat API menjadi state formulir (galat per kolom bila ada). */
export function failed(e: unknown): ActionState {
  if (e instanceof ApiError) {
    return { ok: false, message: Object.keys(e.fields).length ? "Periksa lagi isian yang ditandai." : e.message, fields: e.fields };
  }
  // redirect()/notFound() dari Next harus diteruskan, bukan ditelan.
  throw e;
}

/** Nilai teks formulir (spasi dipangkas). */
export const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

/** Angka rupiah dari isian (titik/koma ribuan diabaikan); kosong → 0. */
export function money(f: FormData, k: string): number {
  const v = str(f, k).replace(/[^\d]/g, "");
  return v ? Number(v) : 0;
}
