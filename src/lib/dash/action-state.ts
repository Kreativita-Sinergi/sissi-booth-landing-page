/** Hasil aksi server untuk formulir dashboard (dipakai server & klien). */
export type ActionState = {
  ok?: boolean;
  message?: string;
  /** Galat per kolom: kunci = atribut `name` input. */
  fields?: Record<string, string>;
  /** Data tambahan untuk ditampilkan setelah sukses (mis. kunci lisensi baru). */
  data?: Record<string, string>;
};
