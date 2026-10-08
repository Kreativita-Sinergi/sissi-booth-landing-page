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

- **2026-10-08** · Claude Opus 5.5 · Bagian masalah diganti jadi **"Pernah dapet chat kayak gini?"**: 4 bubble chat
  (tamu, EO, venue, operator) + balasan hijau "Pakai Sissi Booth". Balasan QRIS tidak menyebut rekap pembayaran karena
  panel admin aplikasi belum punya rekap. `CrossMark` dihapus (tak terpakai). Figma belum diperbarui.

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

## Berikutnya

1. Reviu pemilik atas teks (terutama jawaban FAQ) & tampilan.
2. Deploy (Vercel / hosting statis) + domain — tergantung keputusan hosting (`../fotobox-service/docs/PEKERJAAN.md`).
3. Gambar OG khusus 1200×630 (sekarang memakai `tunggu-l.png`).

## Backlog

- [ ] Bila admin aplikasi punya rekap pembayaran, tambahkan "rekap ada di admin" ke balasan chat QRIS.

- [ ] Favicon/ikon aplikasi Sissi Booth (sekarang belum ada).
- [ ] Analitik (opsional, butuh keputusan pemilik soal privasi).
- [ ] Halaman kebijakan privasi (galeri QR menyimpan foto 30 hari).
- [ ] Tangkapan layar di `public/screens/` dari Figma — perbarui bila desain aplikasi berubah.

## Keputusan terbuka

- Rekomendasi paket per segmen di "Cocok buat siapa aja?" masih usulan Claude — konfirmasi pemilik.

- Retensi galeri 30 hari disebut di FAQ & bagian Tanpa internet — konfirmasi (sama dengan keputusan terbuka di fotobox-service).
- FAQ menawarkan demo (versi demo bertanda "DEMO") — pastikan alur pemberian demo ke calon klien.

- Domain landing page (sementara `https://booth.sissi.id` di metadata).
- Harga paket — tidak ditampilkan sampai diputuskan.
