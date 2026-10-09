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
5. **Semua teks landing di `src/constants/content.ts`** — komponen landing tidak berisi copy. (Dashboard
   `/admin` & `/dashboard` dan galeri `/s/KODE` = UI aplikasi: teksnya di halaman masing-masing.) **Jangan menulis harga paket**
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
- `src/components/layout/` — `Navbar`, `Footer`. Client component hanya `Navbar`, `sections/Faq` (akordeon) & `shared/YouTube` (sampul → iframe saat diklik).
- `src/components/sections/` — satu berkas per section; section baru = berkas baru + data di `content.ts` +
  pasang di `page.tsx`.
- `src/app/panduan/` — **Panduan pengguna**: daftar (`page.tsx`) + detail `[slug]` (langkah bergambar, video YouTube
  yang cocok, tanya jawab, panduan terkait). Data & teks di **`src/constants/guides.ts`** (pengecualian dari
  `content.ts` karena panjang); komponen di `src/components/guide/`; gambar di `public/panduan/<slug>/` (tangkapan layar
  asli dari `../fotobox-app/build/guide`, `sampul.jpg` = thumbnail YouTube). Tautan nav diawali `/`.
- `public/screens/` — tangkapan layar aplikasi dari Figma.
- `src/app/icon.tsx`, `apple-icon.tsx`, `opengraph-image.tsx` — favicon, ikon iOS, pratinjau tautan (1200×630),
  dirender saat build lewat `next/og` (`"use cache"` → statis). Bahan bersama di `src/lib/` (`og.ts`, `BrandMark.tsx`);
  warna di `src/lib/brand.ts` **harus sama** dengan `@theme` globals.css. Font OFL di `src/assets/fonts/`.

## 2b. Dashboard & galeri (2026-10-09)

- `/admin/*` (admin Sissi) & `/dashboard/*` (pemilik booth): Server Component memanggil fotobox-service lewat
  `src/lib/dash/api.ts` (`API_BASE_URL`, mis. `https://apibooth.sissi.id/api/v1`). Token login di **cookie
  httpOnly** (`sb_admin`/`sb_owner`), tidak pernah ke browser; mutasi = Server Action (`admin-actions.ts`,
  `owner-actions.ts`); unduhan CSV/zip lewat Route Handler proxy (`download.ts`). Halaman masuk: `…/masuk`.
- `cacheComponents` aktif → bagian yang membaca cookie/searchParams **wajib** di dalam `<Suspense>` (pola
  `Page → <Suspense><Content/></Suspense>`). Jangan `catch` tanpa meneruskan error non-`ApiError` (redirect Next).
- Komponen: `src/components/dash/` — `ui.tsx` (server-safe: Card, Stat, Table, BarChart SVG, Bars, Badge…),
  `client.tsx` (dialog kustom, ActionForm, Field, ConfirmAction, PeriodPicker, FilterSelect), `pickers.tsx`
  (**dropdown & kalender kustom — dilarang `<select>`/`<input type=date>` bawaan**), `shell.tsx` (sidebar),
  `admin-forms.tsx`, `owner-forms.tsx`. Tipe API: `src/lib/dash/types.ts`.
- Galeri QR `/s/[code]` dirender Next (data `GET /public/sessions/{code}`, gambar langsung dari server file);
  CSS `src/app/s/[code]/galeri.css` turunan `fotobox-service/internal/gallery/web/gallery.css` (dibatasi `.g`).

## 3. Selesai = hijau

`scripts/exclusive.sh bash -c 'npx eslint src && npx tsc --noEmit && npx next build'` lolos, lalu cek visual
desktop (1440) & mobile (390, tanpa luapan horizontal). **Halaman dinamis (dashboard): buka juga di `next dev`** —
mode dev memeriksa aturan cacheComponents lebih ketat (mis. `Date.now()` tanpa `await connection()`) daripada build;
pastikan panel issue Next = 0 dan `.next/dev/logs/next-development.log` tanpa ERROR.
