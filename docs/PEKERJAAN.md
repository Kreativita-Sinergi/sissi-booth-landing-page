# Catatan pekerjaan — fotobox-landing

> Dokumen hidup: baca di awal sesi, perbarui di akhir sesi (AGENTS.md §0.2). Hanya lokal.

Terakhir diperbarui: **2026-10-10** · oleh: Claude Opus 5.5

## Menunggu reviu sebelum merge

| Cabang | Ringkasan | Cara verifikasi | Risiko / catatan | Dibuat |
|---|---|---|---|---|
| _(kosong)_ | | | | |

## Sedang dikerjakan

_Tidak ada._

## Selesai

- **2026-10-10** · Claude Opus 5.5 · Editor template lebih rapi & jelas: panel **Saran gambar bingkai** (ukuran tiap format,
  tips PNG transparan/area aman/4 MB/Canva, tombol unduh **PNG panduan** per format); **magnet** saat geser & ubah
  ukuran slot (tepi/tengah kanvas, garis aman, tepi/tengah & ukuran slot lain; garis bantu merah; Alt = bebas); alat
  **Rapikan** (tengah datar/tegak, samakan ukuran, semua di tengah, jarak rata ↕/↔); sakelar **garis aman** cetak;
  tombol Batal di header dihapus (sudah ada ← Template); **Atur posisi gambar** juga untuk template tersimpan (muat
  gambar dengan CORS + `?cors=1` agar tidak memakai cache non-CORS); warna latar Atur gambar hanya mengisi ruang di luar
  gambar (lubang foto tetap transparan). Catatan: server dev Turbopack sempat menyajikan `globals.css` lama — perubahan
  isi berkas memicu kompilasi ulang.

- **2026-10-10** · Claude Opus 5.5 · Editor template: **gambar tidak pas → dialog konfirmasi** (alasan dalam bahasa sederhana +
  pilih format, "Paling pas" disarankan) → **mode Atur gambar** (seret, zoom slider/roda mouse, Penuhi kotak / Tampilkan
  utuh / Ke tengah, warna bagian kosong, ganti format; bagian terpotong tampil pudar) → Terapkan = dirender ke PNG ukuran
  cetak di browser lalu lubang dideteksi. JPG/WEBP & ukuran Canva bisa dipakai; tombol "Atur posisi gambar" untuk mengatur
  ulang. Teks bantuan kosong & daftar "Sebelum menyimpan". Diuji e2e (Story Canva 1080×1920, JPG persegi, PNG 8 MB, HP).
  **Catatan:** bingkai berupa foto penuh warna bisa tetap > 4 MB sebagai PNG → usul backlog: API menerima JPEG untuk
  bingkai tanpa transparansi.

- **2026-10-10** · Claude Opus 5.5 · **Template bingkai W2b+W2c**: editor template web (unggah PNG, deteksi lubang
  transparan otomatis termasuk bentuk hati/bulat/miring, slot geser/ubah ukuran/putar/bentuk 6 jenis, pratinjau foto
  contoh, validasi format strip 2×6 / 4R tegak / 4R mendatar), daftar template pemilik (Semua/Buatan saya/Bawaan Sissi,
  kategori, cari, sakelar tampil, ubah, hapus) dan admin (template bawaan + kelola kategori). Uji e2e Chrome headless
  (pemilik buat & ubah, admin buat bawaan, bawaan tampil di pemilik, seret/ukuran/putar), `check:dev` bersih, build hijau.

- **2026-10-10** · Claude Opus 5.5 · Logo dashboard diganti **SVG resmi Sissi** dari pemilik; favicon dashboard ikon Sissi
  (kotak putih); tombol Batal/Simpan di dialog kembali ikut bergulir (judul & X tetap). Hijau + `check:dev` bersih.

- **2026-10-10** · Claude Opus 5.5 · Revisi dashboard (masukan pemilik): logo Sissi dari POS (sidebar, header HP,
  halaman masuk); tabel menempel ke tepi kartu (kepala abu, sorot baris, tombol tidak mepet); pagination bernomor
  `‹ 1 2 3 4 5 … 12 13 ›` + "Menampilkan 1–30 dari 376" (HP: "6 / 13"); dialog dengan judul/X & tombol bawah tetap
  (`DialogFooter`); konfirmasi sebelum keluar. Lint + tsc + build hijau, `check:dev` bersih, dicek visual.

- **2026-10-10** · Claude Opus 5.5 · **Dashboard `/admin` & `/dashboard` jadi netral** (update besar v2, tahap W1 —
  `../docs/rencana.md` §7): token netral di `globals.css`, fon Inter khusus dashboard (`src/lib/dash/font.ts`), komponen
  `ui/client/pickers/shell/login/search` + semua halaman panel ditulis ulang gayanya (API komponen tidak berubah). Tombol
  pemicu aksi berbahaya bergaris merah; merah penuh hanya di dialog konfirmasi. Lint + tsc + build hijau; `check:dev`
  36 halaman (1440 & 390) bersih; dicek visual. Data uji lokal: admin `uji-dashboard@sissi.id` dibuat & sandi pemilik
  uji `rani14328@booth.id` diganti (DB dev lokal saja).

- **2026-10-09** · Claude Opus 5.5 · Panduan cara foto: cara stiker dengan mouse (scroll / Shift+scroll).
- **2026-10-09** · Claude Opus 5.5 · Panduan softcopy-harga: langkah harga → "Harga & pembayaran QRIS (segera hadir)"
  (gambar `qris-segera.jpg`; `harga-*.jpg` dihapus), FAQ harga diperbarui. Gambar galeri-sesi & aktifkan-lisensi diperbarui
  (status "Belum selesai", QR menunggu unggah, form aktivasi dilipat, tanpa kolom server); teks langkah lisensi disesuaikan.
- **2026-10-09** · Claude Opus 5.5 · Gambar `cara-foto/terima-kasih.jpg` diperbarui (layar terima kasih kini satu tombol).
- **2026-10-09** · Claude Opus 5.5 · Panduan disesuaikan perubahan aplikasi: hias (tab STIKER, LANJUT CETAK; gambar
  `cara-foto/hias-filter.jpg` & `stiker-cubit.jpg` baru), mode kiosk "segera hadir" (sesi-mode & harga), petunjuk masuk admin.
- **2026-10-09** · Claude Opus 5.5 · Panduan `/panduan/desain-template`: gambar ditangkap ulang (kartu teks bawah kini
  terlipat → "ketuk UBAH", kotak "Impor dari Canva / PNG"), poin teks bawah hanya untuk bingkai bawaan.
- **2026-10-09** · Claude Opus 5.5 · **Panduan baru `/panduan/desain-template`** (#11 "Buat template di aplikasi", tanpa video):
  teks di bawah foto (Enter, rata, font, warna), BUAT DESAIN, latar (bingkai/warna/gambar, geser & perbesar), tulisan & logo
  (aman dari kotak foto), label di layar tamu, simpan, tampil di booth; gambar asli dari aplikasi (capture `11` di
  `fotobox-app/tool/guide_capture_test.dart`) + sampul. Panduan 05 jadi "Impor bingkai dari Canva/Photoshop" (video lama
  tetap) + label & FAQ ke panduan baru; FAQ beranda "bingkai sendiri" diperbarui + tautan panduan.
- **2026-10-09** · Claude Opus 5.5 · **Video YouTube berhenti saat halaman ditinggalkan**: Next 16 menyimpan halaman lama
  tersembunyi (back instan) sehingga iframe tetap memutar suara; `shared/YouTube.tsx` kini mengosongkan iframe saat
  disembunyikan/dilepas lalu kembali ke sampul. Diuji: putar → pindah ke /panduan → back = tanpa iframe, sampul tampil.
  (Pause otomatis saat di-scroll: tidak dikerjakan, keputusan pemilik.)
- **2026-10-09** · Claude Opus 5.5 · **Cek dashboard otomatis** `npm run check:dev` (`scripts/dev-check.mjs`: Chrome headless,
  semua halaman /admin & /dashboard di 1440 & 390 — issue Next, error konsol, luapan, log dev; kredensial dari env).
  **Keamanan web**: header global di `next.config.ts` (CSP tanpa nonce agar halaman tetap statis, frame-ancestors none,
  nosniff, Referrer/Permissions-Policy, HSTS di produksi, tanpa `x-powered-by`); cookie `sb_admin`/`sb_owner` kini berjalur
  `/admin` / `/dashboard` (+`priority: high`; cookie lama jalur `/` dihapus saat masuk/keluar). `/panduan/[slug]` membaca
  `params` di dalam `<Suspense>` (peringatan navigasi instan Next 16). **Panduan admin** `/admin/panduan` (menu baru).
- **2026-10-09** · Claude Opus 5.5 · Ringkasan pemilik: **Jam ramai** (`HourChart`, batang HTML 24 jam, jam tersibuk pink),
  **Bingkai terlaris** & **Filter terlaris** (`FRAME_LABEL`/`FILTER_LABEL` di `format.ts` = teks aplikasi). Galeri online:
  **Unduh semua (zip)** per periode (`/dashboard/unduh/foto` → `/owner/photos.zip`). Dicek 1440/390 + `next dev` 0 issue.
- **2026-10-09** · Claude Opus 5.5 · Dashboard pemilik: **sisa kertas per booth** (`PaperLevel`, kuning ≤30%, pink ≤10%),
  kolom Kertas di admin › Booth; **banner langganan** (tanpa lisensi aktif / habis ≤7 hari, tautan WA) di layout panel.
  Diperiksa juga di `next dev` (0 issue). AGENTS.md: blok aturan agen bawaan `next dev` ikut di-commit.
- **2026-10-09** · Claude Opus 5.5 · **Panduan setelan kamera pro** `/panduan/kamera` (entri baru di `guides.ts`, grup
  Persiapan; sampul buatan sendiri): sambungkan (PC Remote, JPEG), cara paling tajam flash + f/8 + MF (Setting Effect OFF),
  tanpa flash AF-C wajah + setengah shutter otomatis, tes sebelum acara. `video` panduan kini opsional (halaman, kartu,
  JSON-LD menyesuaikan; langkah tanpa gambar tidak menampilkan figure). FAQ beranda: "Bisa pakai kamera mirrorless/DSLR?"
  + tautan ke panduan (`faq.links`). QR di aplikasi (admin Kamera) menuju halaman ini.

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
