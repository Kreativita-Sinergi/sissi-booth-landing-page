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

## 2a. SEO

- `src/lib/seo.tsx` — `siteUrl` (env `NEXT_PUBLIC_SITE_URL`), `contentUpdated` (tanggal di sitemap — **ubah saat isi
  berubah**), JSON-LD: beranda (Organization, WebSite, SoftwareApplication, FAQPage dari `faq`), tiap panduan
  (HowTo + VideoObject, BreadcrumbList, FAQPage). Halaman publik baru → tambahkan ke `src/app/sitemap.ts`.
- `src/app/robots.ts` melarang `/admin`, `/dashboard`, `/s/`; halaman privat juga `robots: { index: false }`.
- Tiap halaman publik punya `alternates.canonical` sendiri (jangan pasang canonical di root layout).

## 2b. Dashboard & galeri (2026-10-09)

- `/admin/*` (admin Sissi) & `/dashboard/*` (pemilik booth): Server Component memanggil fotobox-service lewat
  `src/lib/dash/api.ts` (`API_BASE_URL`, mis. `https://apibooth.sissi.id/api/v1`). Token login di **cookie
  httpOnly** (`sb_admin`/`sb_owner`), tidak pernah ke browser; mutasi = Server Action (`admin-actions.ts`,
  `owner-actions.ts`); unduhan CSV/zip lewat Route Handler proxy (`download.ts`). Halaman masuk: `…/masuk`.
- `cacheComponents` aktif → bagian yang membaca cookie/searchParams **wajib** di dalam `<Suspense>` (pola
  `Page → <Suspense><Content/></Suspense>`). Jangan `catch` tanpa meneruskan error non-`ApiError` (redirect Next).
- **Gaya dashboard NETRAL** (keputusan pemilik 2026-10-10): dashboard umum — latar abu muda, kartu putih bergaris
  tipis, sidebar putih, aksen biru, fon Inter (`src/lib/dash/font.ts` → `dashRoot` di `Shell` & `LoginForm`). **Jangan**
  memakai token Sticker Bomb (`booth-*`, `ink`, `shadow-hard*`, `font-label/display`) di `/admin` & `/dashboard`; pakai
  token netral di `@theme`: `canvas`, `surface`, `edge(-strong)`, `fg`, `subtle`, `primary(-hover/-soft/-muted)`,
  `success/warning/danger/info(-soft/-solid)`, `shadow-card`, `shadow-pop`. Prop `tone` komponen tetap (blue = utama,
  pink = berbahaya, lainnya sekunder). Landing & galeri `/s/` tetap Sticker Bomb.
- Logo dashboard = **logo Sissi resmi** dari pemilik (`components/dash/logo.tsx` → `public/brand/sissi-logo.svg`);
  favicon dashboard `public/brand/sissi-favicon.svg` (`dashIcons` di `lib/dash/font.ts`, dipasang di layout panel &
  halaman masuk; landing tetap ikon Sissi Booth). Dialog: judul & X tetap, isi bergulir; tombol bawah `DialogFooter`
  ikut bergulir bersama isi. `Table` menempel ke tepi `Card`; `Pagination` bernomor (‹ 1 2 … 6 7 ›),
  `inCard={false}` bila di luar kartu. Keluar = dialog konfirmasi.
- **Template bingkai** (W2, api.md §8): `/dashboard/template` (pemilik: buatan sendiri + bawaan Sissi, sakelar tampil) &
  `/admin/template` (bawaan + kategori). Editor **gaya Canva** `components/dash/template-editor.tsx` (+ bagian pendukung
  `template-editor-parts.tsx`): bar atas (nama, urungkan/ulangi, zoom, pratinjau, simpan), sidebar Elemen/Latar/Info/Pintasan,
  toolbar kontekstual, pilih banyak, pintasan keyboard (daftar `SHORTCUTS`), bentuk bebas (`custom` + `points`: klik titik /
  seret bebas, edit titik); simpan multipart lewat `lib/dash/template-actions.ts`;
  logika slot & deteksi di `lib/dash/template.ts`; pratinjau `template-preview.tsx` (server-safe). Body Server Action
  5 MB (`next.config.ts`); di Vercel batasnya ±4,5 MB → editor menolak PNG > 4 MB.
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
pastikan panel issue Next = 0 dan `.next/dev/logs/next-development.log` tanpa ERROR. Otomatis:
`DEV_CHECK_ADMIN="email:sandi" DEV_CHECK_OWNER="email:sandi" npm run check:dev -- http://localhost:PORT` (semua halaman
`/admin` & `/dashboard` di 1440 & 390: issue Next, error konsol, luapan, log dev; keluar 1 bila ada masalah).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
