import { Inter } from "next/font/google";

/** Fon dashboard (netral); hanya dimuat oleh halaman /admin & /dashboard. */
const inter = Inter({ subsets: ["latin"] });

/**
 * Kelas akar dashboard: fon Inter (kelas langsung, bukan token `@theme` — variabel fon yang dipasang di
 * elemen ini tidak terbaca dari `:root`) + warna netral (lihat `body:has(.dash)` di globals.css).
 */
export const dashRoot = `dash ${inter.className} text-fg antialiased`;

/** Favicon dashboard = ikon Sissi (landing tetap memakai ikon Sissi Booth dari `app/icon.tsx`). */
export const dashIcons = { icon: "/brand/sissi-favicon.svg" };
