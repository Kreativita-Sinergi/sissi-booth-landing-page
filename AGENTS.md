# AGENTS.md — fotobox-landing (landing page Sissi Booth)

> **Baca seluruh berkas ini SEBELUM mengubah kode.** Aturan kerja umum (git, estimasi, catatan, sumber daya)
> sama dengan semua proyek pemilik: `../../pos/sissi-app/docs/aturan-lengkap.md`. Jangan mengubah `../../pos/`.

Landing page pemasaran **Sissi Booth** (aplikasi photobooth, `../fotobox-app`). Desain: Figma "Loka Kasir" ›
page **Sissi Booth Landing Page** (gaya Sticker Bomb; Figma = referensi). Bahasa kerja & teks: **Bahasa Indonesia**.

## 0. Aturan paling penting

1. **Git:** agent **selain Claude DILARANG commit/push ke `main`** — cabang `agent/<model>/<tugas>`, daftarkan di
   `docs/PEKERJAAN.md` → "Menunggu reviu". Semua agent: jangan push / tambah remote tanpa diminta; jangan
   `--no-verify`; jangan commit `.env*`/rahasia.
2. **Catatan pekerjaan:** awal sesi baca `docs/PEKERJAAN.md`; akhir sesi perbarui dalam commit yang sama.
3. **Estimasi sebelum kerja:** ukuran XS–XL; **M ke atas → minta persetujuan pemilik**.
4. **Perintah berat lewat `scripts/exclusive.sh`** (build, lint penuh). Server dev/preview **bukan port 8080**
   (milik sissi-service); hentikan setelah dipakai.
5. **Semua teks di `src/constants/content.ts`** — komponen tidak berisi copy. **Jangan menulis harga paket**
   (CTA "Tanya harga" → WhatsApp) sampai pemilik menentukan.
6. **Token desain di `src/app/globals.css` (`@theme`)** — jangan hex mentah di komponen (kecuali detail mockup).
7. **Halaman statis:** `cacheComponents` aktif → jangan `new Date()`/data dinamis saat prerender.
8. Catatan/artefak proyek **hanya lokal** — jangan dikirim ke layanan eksternal.

## 1. Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript · lucide-react · `next/font/google`
(Bagel Fat One, Archivo Black, Space Grotesk, Space Mono). Jangan tambah pustaka UI tanpa alasan kuat.

## 2. Struktur

- `src/app/` — `layout.tsx` (fon, metadata), `page.tsx` (urutan section), `globals.css` (token).
- `src/constants/content.ts` — semua teks & data section (sumber tunggal copy).
- `src/components/shared/` — komponen bersama: `Button`, `Chip`, `StickerBox`, `Section`, `Container`,
  `Stickers` (Star/Burst/Pill/Highlight), `Marks`, `Devices` (mockup laptop/kiosk/layar), `Logo`, `PhotoStrip`,
  `accent.ts` (peta warna aksen), `cn.ts`.
- `src/components/layout/` — `Navbar`, `Footer`. Client component hanya `Navbar` & `sections/Faq` (akordeon).
- `src/components/sections/` — satu berkas per section; section baru = berkas baru + data di `content.ts` +
  pasang di `page.tsx`.
- `public/screens/` — tangkapan layar aplikasi dari Figma.
- `src/app/icon.tsx`, `apple-icon.tsx`, `opengraph-image.tsx` — favicon, ikon iOS, pratinjau tautan (1200×630),
  dirender saat build lewat `next/og` (`"use cache"` → statis). Bahan bersama di `src/lib/` (`og.ts`, `BrandMark.tsx`);
  warna di `src/lib/brand.ts` **harus sama** dengan `@theme` globals.css. Font OFL di `src/assets/fonts/`.

## 3. Selesai = hijau

`scripts/exclusive.sh bash -c 'npx eslint src && npx tsc --noEmit && npx next build'` lolos, lalu cek visual
desktop (1440) & mobile (390, tanpa luapan horizontal).
