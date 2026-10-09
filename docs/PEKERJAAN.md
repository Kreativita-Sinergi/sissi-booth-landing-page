# Catatan pekerjaan — fotobox-landing

> Dokumen hidup: baca di awal sesi, perbarui di akhir sesi (AGENTS.md §0.2). Hanya lokal.

Terakhir diperbarui: **2026-10-09** · oleh: Claude Opus 5.5

## Menunggu reviu sebelum merge

| Cabang | Ringkasan | Cara verifikasi | Risiko / catatan | Dibuat |
|---|---|---|---|---|
| _(kosong)_ | | | | |

## Sedang dikerjakan

_Tidak ada._

## Selesai

- **2026-10-09** · Claude Opus 5.5 · **Dashboard admin Sissi (`/admin`) & pemilik booth (`/dashboard`)** + galeri QR
  `/s/[code]` dipindah dari server Go. Login email+sandi (cookie httpOnly), Server Actions, proxy unduhan CSV/zip,
  grafik SVG tanpa pustaka, dropdown & kalender kustom. Admin: ringkasan, pelanggan (+detail: lisensi, kunci tampil
  sekali + kirim WA, perpanjang/tangguhkan/kunci baru, lepas booth, catat/batal pembayaran), lisensi, pembayaran,
  transaksi, booth, log aktivitas, pengaturan admin. Pemilik: ringkasan (pendapatan, keuntungan & rinciannya, vs periode
  lalu, harian, layout, booth), transaksi, acara (+zip foto), galeri, booth, langganan, pengaturan. Lint + tsc + build
  hijau; uji menyeluruh lokal (API :8090 + data contoh, login form, buat pemilik → lisensi, kalender, CSV/zip) dan cek
  visual 1440 & 390 tanpa luapan. Env Vercel baru: `API_BASE_URL` (…/api/v1).

- **2026-10-08** · Claude Opus 5.5 · **Landing page v1** sesuai Figma "Sissi Booth Landing Page": navbar (menu
  mobile), hero (mockup laptop + kiosk), pita berjalan, masalah→solusi, cara kerja 5 langkah, fitur, dua mode,
  anti-offline, panel admin, perbandingan, paket Harian/Bulanan/Tahunan ("Tanya harga" → WhatsApp), cocok untuk,
  FAQ (`<details>`), kontak (email & WhatsApp), footer. Statis, lint + typecheck + build hijau; dicek visual
  desktop 1440 & mobile 390 (tanpa luapan horizontal).

- **2026-10-08** · Claude Opus 5.5 · FAQ jadi akordeon beranimasi (grid-rows 0fr→1fr, satu terbuka, aria +
  `inert`, hormati reduced-motion); teks "Windows & Android" dihapus dari hero, pita, FAQ, footer, metadata.

- **2026-10-08** · Claude Opus 5.5 · Perbandingan diganti jadi **"Sissi Booth vs booth manual"**: lawan konkret,
  sel berisi teks (centang hanya bila memang bisa, titik abu-abu bila tidak), satu baris seri (cetak strip), baris
  "Bahasa Indonesia & tim lokal" dibuang; mobile jadi kartu per baris. 

- **2026-10-08** · Claude Opus 5.5 · Bagian masalah diganti jadi **"Pernah dapet chat kayak gini?"**: 4 bubble chat
  (tamu, EO, venue, operator) + balasan hijau "Pakai Sissi Booth". Balasan QRIS tidak menyebut rekap pembayaran karena
  panel admin aplikasi belum punya rekap. `CrossMark` dihapus (tak terpakai). 

- **2026-10-08** · Claude Opus 5.5 · **Kurangi pengulangan ("satu topik satu rumah")**: Dua mode dipindah sebelum
  Fitur; Fitur jadi bento (kartu besar layar Hias + 5 kartu berwarna: kamera, layout, cetak, GIF boomerang, bingkai);
  "Softcopy via QR" & "Galeri sesi" keluar dari Fitur; Panel admin 4 aksi konkret; "Anti-offline" → "Tanpa internet";
  FAQ internet & bayar diganti "Bisa coba dulu?" (demo bertanda DEMO) & "Foto disimpan berapa lama?" (30 hari).
  **Bug diperbaiki:** `StickerBox` selalu `bg-white` sehingga warna latar via className kalah → prop `fill`
  (kartu kuning "Sissi Booth" di bagian Tanpa internet kini tampil sesuai Figma).

- **2026-10-08** · Claude Opus 5.5 · **Gaya tulisan**: judul/teks yang terdengar template ditulis ulang (hero,
  Fitur "Bukan cuma jepret", Dua mode, Panel admin, Paket, Kontak "Penasaran? Coba demonya!", metadata); bahasa santai
  konsisten ("nggak"). Kontak & tombol dirapikan untuk layar 360 px (judul fluid, tombol tidak patah baris).

- **2026-10-08** · Claude Opus 5.5 · "Cocok buat siapa aja?" jadi 6 kartu skenario (pil miring + cara pakai + chip
  Mode & Paket). Baris segmen di kartu Dua mode dibuang (rumahnya kini di sini). Rekomendasi paket per segmen =
  usulan, belum data.

- **2026-10-08** · Claude Opus 5.5 · Kartu "Cocok untuk" berwarna (pink/kuning/hijau/biru/oranye/lilac) dengan pil putih; latar section tetap putih. `Section` kini punya tone `lilac/pink/blue` (belum dipakai).

- **2026-10-08** · Claude Opus 5.5 · (ukuran S) **Favicon** monogram "sb", **ikon iOS** 180, **pratinjau tautan**
  1200×630 bergaya Sticker Bomb (judul hero + chip + layar kiosk) lewat `next/og`, statis; meta `twitter:card`.

- **2026-10-08** · Claude Opus 5.5 · Figma "Sissi Booth Landing Page" disinkronkan dengan kode (skrip
  `../desain/figma/landing.js`). Bila mengubah tampilan/teks di kode, perbarui skrip itu juga lalu `./run.sh landing.js`.

- **2026-10-08** · Claude Opus 5.5 · Teks Hias tanpa klaim "kulit halus" (mempercantik dihapus di aplikasi); nomor
  telepon ditulis `085161462806` (kode, Figma landing & slide promosi).

- **2026-10-09** · Claude Opus 5.5 · **Galeri QR di `booth.sissi.id/s/KODE`** (keputusan pemilik): `next.config.ts`
  meneruskan `/s/*` ke server galeri (`GALLERY_ORIGIN`, bawaan `https://apibooth.sissi.id`). Diuji lokal dengan server
  tiruan. Atur `GALLERY_ORIGIN` di Vercel saat server online. Catatan: Vercel Hobby = non-komersial → Pro untuk bisnis.

- **2026-10-09** · Claude Opus 5.5 · (ukuran M, disetujui) **Panduan pengguna `/panduan`** bergaya pusat panduan Loka
  Kasir: 9 panduan tertulis (`/panduan/<slug>`), tiap panduan berisi prasyarat, langkah bernomor dengan tangkapan
  layar aplikasi asli, poin & catatan (tips/info/perhatian), tanya jawab, panduan terkait, daftar langkah lengket
  (desktop), dan video YouTube yang cocok (sampul lokal, iframe youtube-nocookie saat diklik). Teks dari naskah video
  Remotion + deskripsi YouTube. Nav dapat menu "Panduan"; tautan nav kini `/#…`. Lint + tsc + build hijau (semua
  panduan statis); cek visual 1440 & 390. Catatan: slug asing menampilkan halaman 404 tapi status HTTP 200
  (`dynamicParams` tidak boleh dengan `cacheComponents`). Figma landing belum disinkronkan.

- **2026-10-09** · Claude Opus 5.5 · (ukuran XS) **Halaman 404 kustom** `src/app/not-found.tsx` (gaya Sticker Bomb:
  "Yah, fotonya nggak ketemu!", tombol Ke beranda & Buka panduan, strip foto + stiker 404); teks di `notFoundPage`
  (`content.ts`). Menggantikan 404 bawaan Next untuk semua alamat & slug panduan yang tidak ada. Build hijau; cek 1440 & 390.

- **2026-10-09** · Claude Opus 5.5 · (ukuran S) **SEO**: `sitemap.xml` (beranda, /panduan, 9 panduan), `robots.txt`
  (larang /admin, /dashboard, /s/ + tautan sitemap), canonical beranda, JSON-LD (beranda: Organization, WebSite,
  SoftwareApplication, FAQPage; panduan: HowTo + VideoObject dengan tanggal tayang YouTube, BreadcrumbList, FAQPage).
  Build hijau; output diverifikasi (JSON-LD ter-parse). **Pemilik:** verifikasi domain di Google Search Console lalu
  kirim `https://booth.sissi.id/sitemap.xml`.

## Berikutnya

1. Reviu pemilik atas teks (terutama jawaban FAQ) & tampilan.
2. Deploy ke **Vercel** dengan domain **booth.sissi.id** (diputuskan pemilik 2026-10-08; pemilik yang mengonlinekan).

## Backlog

- [ ] Bila admin aplikasi punya rekap pembayaran, tambahkan "rekap ada di admin" ke balasan chat QRIS.

- [ ] Analitik (opsional, butuh keputusan pemilik soal privasi).
- [ ] Halaman kebijakan privasi (galeri QR menyimpan foto 30 hari).
- [ ] Tangkapan layar di `public/screens/` dari Figma — perbarui bila desain aplikasi berubah.

## Keputusan terbuka

- Rekomendasi paket per segmen di "Cocok buat siapa aja?" masih usulan Claude — konfirmasi pemilik.

- Retensi galeri 30 hari disebut di FAQ & bagian Tanpa internet — konfirmasi (sama dengan keputusan terbuka di fotobox-service).
- FAQ menawarkan demo (versi demo bertanda "DEMO") — pastikan alur pemberian demo ke calon klien.

- Harga paket — tidak ditampilkan sampai diputuskan.
