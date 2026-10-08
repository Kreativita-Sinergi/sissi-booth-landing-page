# Catatan pekerjaan — fotobox-landing

> Dokumen hidup: baca di awal sesi, perbarui di akhir sesi (AGENTS.md §0.2). Hanya lokal.

Terakhir diperbarui: **2026-10-08** · oleh: Claude Opus 5.5

## Menunggu reviu sebelum merge

| Cabang | Ringkasan | Cara verifikasi | Risiko / catatan | Dibuat |
|---|---|---|---|---|
| _(kosong)_ | | | | |

## Sedang dikerjakan

_Tidak ada._

## Selesai

- **2026-10-08** · Claude Opus 5.5 · **Landing page v1** sesuai Figma "Sissi Booth Landing Page": navbar (menu
  mobile), hero (mockup laptop + kiosk), pita berjalan, masalah→solusi, cara kerja 5 langkah, fitur, dua mode,
  anti-offline, panel admin, perbandingan, paket Harian/Bulanan/Tahunan ("Tanya harga" → WhatsApp), cocok untuk,
  FAQ (`<details>`), kontak (email & WhatsApp), footer. Statis, lint + typecheck + build hijau; dicek visual
  desktop 1440 & mobile 390 (tanpa luapan horizontal).

- **2026-10-08** · Claude Opus 5.5 · FAQ jadi akordeon beranimasi (grid-rows 0fr→1fr, satu terbuka, aria +
  `inert`, hormati reduced-motion); teks "Windows & Android" dihapus dari hero, pita, FAQ, footer, metadata.

- **2026-10-08** · Claude Opus 5.5 · Perbandingan diganti jadi **"Sissi Booth vs booth manual"**: lawan konkret,
  sel berisi teks (centang hanya bila memang bisa, titik abu-abu bila tidak), satu baris seri (cetak strip), baris
  "Bahasa Indonesia & tim lokal" dibuang; mobile jadi kartu per baris. Figma belum diperbarui.

## Berikutnya

1. Reviu pemilik atas teks (terutama jawaban FAQ) & tampilan.
2. Deploy (Vercel / hosting statis) + domain — tergantung keputusan hosting (`../fotobox-service/docs/PEKERJAAN.md`).
3. Gambar OG khusus 1200×630 (sekarang memakai `tunggu-l.png`).

## Backlog

- [ ] Favicon/ikon aplikasi Sissi Booth (sekarang belum ada).
- [ ] Analitik (opsional, butuh keputusan pemilik soal privasi).
- [ ] Halaman kebijakan privasi (galeri QR menyimpan foto 30 hari).
- [ ] Tangkapan layar di `public/screens/` dari Figma — perbarui bila desain aplikasi berubah.

## Keputusan terbuka

- Domain landing page (sementara `https://booth.sissi.id` di metadata).
- Harga paket — tidak ditampilkan sampai diputuskan.
