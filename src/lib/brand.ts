/**
 * Warna merek untuk gambar yang dibuat saat build (ikon & pratinjau tautan).
 * ImageResponse tidak membaca CSS/Tailwind, jadi warna merek diulang di sini
 * (harus sama dengan `@theme` di globals.css).
 */
export const brand = {
  yellow: "#ffe24a",
  ink: "#111111",
  pink: "#ff5fa2",
  blue: "#3d7bff",
  green: "#3ddc84",
  orange: "#ff8a3d",
  lilac: "#b69cff",
  white: "#ffffff",
} as const;

