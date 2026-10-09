/**
 * Panduan pengguna Sissi Booth (/panduan & /panduan/[slug]). Teks diturunkan dari naskah video panduan
 * (`~/Dev/remotion/src/projects/sissi/panduan/specs`) & deskripsi YouTube (`../promosi/video-panduan`);
 * gambar = tangkapan layar aplikasi asli (`../fotobox-app/build/guide`) di `public/panduan/<slug>/`.
 * Bila aplikasi berubah, perbarui ketiganya bersamaan.
 */
import type { Accent } from "./content";

/** `screen` = layar booth 16:10, `phone` = halaman di HP, `print` = file desain strip 1:3. */
export type GuideShot = { src: string; alt: string; device?: "screen" | "phone" | "print" };

export type GuideCallout = { type: "tip" | "info" | "warning"; title: string; text: string };

export type GuideStep = {
  id: string;
  title: string;
  body: string;
  shots: GuideShot[];
  caption?: string;
  points?: string[];
  callout?: GuideCallout;
};

export type Guide = {
  slug: string;
  /** Nomor video di playlist YouTube. */
  no: string;
  audience: "Tamu" | "Pemilik booth";
  title: string;
  summary: string;
  overview: string;
  readTime: string;
  /** `uploaded` = tanggal tayang di YouTube (untuk data terstruktur VideoObject). Panduan tanpa video: kosong. */
  video?: { id: string; duration: string; uploaded: string };
  prerequisites: string[];
  steps: GuideStep[];
  faqs: [question: string, answer: string][];
  related: string[];
};

export const guideUi = {
  meta: {
    title: "Panduan Pengguna · Sissi Booth",
    description:
      "Panduan lengkap Sissi Booth langkah demi langkah: cara foto, unduh foto ke HP, aktifkan lisensi, kamera & printer, mode kiosk/event, bingkai sendiri, softcopy, harga, dan galeri sesi.",
  },
  kicker: "PANDUAN PENGGUNA",
  title: "Panduan pakai",
  highlight: "Sissi Booth",
  body: "Langkah demi langkah, lengkap dengan gambar layar aplikasi dan video singkat. Mulai dari tamu yang baru pertama foto sampai pemilik yang menyiapkan booth.",
  playlist: { label: "Tonton semua di YouTube", href: "https://www.youtube.com/playlist?list=PLcUJ1JGO-o4I" },
  jumpLabel: "Langsung ke",
  readMore: "Baca panduan",
  updated: "Diperbarui Oktober 2026",
  breadcrumbLabel: "Lokasi halaman",
  breadcrumbHome: "Beranda",
  breadcrumbGuide: "Panduan",
  allGuides: "Semua panduan",
  prerequisites: "Siapkan dulu",
  stepsNav: "Daftar langkah",
  stepLabel: "Langkah",
  video: { title: "Tonton videonya", play: "Putar video", prefix: "Panduan Sissi Booth #" },
  faqTitle: "Tanya jawab",
  relatedKicker: "LANJUT BACA",
  relatedTitle: "Panduan terkait",
  calloutLabels: { tip: "Tips", info: "Info", warning: "Perhatian" },
  help: {
    title: "Masih bingung?",
    body: "Tim Sissi siap bantu lewat WhatsApp sampai booth-mu jalan.",
    cta: "Chat WhatsApp",
  },
};

/** Kelompok di halaman daftar, urut sesuai kapan dibutuhkan. */
export const guideGroups = [
  { id: "tamu", title: "Buat tamu", body: "Tunjukkan ke tamu, atau putar di layar dekat booth.", accent: "pink", slugs: ["cara-foto", "unduh-foto"] },
  {
    id: "persiapan",
    title: "Persiapan awal",
    body: "Sekali di awal, sebelum booth dipakai tamu.",
    accent: "blue",
    slugs: ["aktifkan-lisensi", "masuk-admin", "kamera-printer", "kamera"],
  },
  {
    id: "acara",
    title: "Atur acara & jualan",
    body: "Sesuaikan booth untuk tiap acara atau lokasi.",
    accent: "green",
    slugs: ["sesi-mode", "desain-template", "template-bingkai", "softcopy-harga"],
  },
  { id: "setelah-acara", title: "Setelah acara", body: "Urus foto-foto yang sudah diambil.", accent: "orange", slugs: ["galeri-sesi"] },
] satisfies { id: string; title: string; body: string; accent: Accent; slugs: string[] }[];

const img = (slug: string, name: string, alt: string, device: GuideShot["device"] = "screen"): GuideShot => ({
  src: `/panduan/${slug}/${name}`,
  alt,
  device,
});

export const guides: Guide[] = [
  {
    slug: "cara-foto",
    no: "01",
    audience: "Tamu",
    title: "Cara foto di booth",
    summary: "Dari layar awal, pilih gaya & bingkai, jepret, hias, sampai strip keluar dari printer.",
    overview:
      "Semua langkah di booth dilakukan sendiri lewat layar sentuh. Ikuti urutan di bawah, dalam beberapa menit strip fotomu sudah tercetak dan softcopy-nya bisa diunduh ke HP.",
    readTime: "4 menit baca",
    video: { id: "d6_SFKFSWqA", duration: "1:23", uploaded: "2026-10-08T19:27:52-07:00" },
    prerequisites: ["HP dengan kamera untuk scan QR di akhir", "E-wallet atau m-banking untuk bayar QRIS (hanya di booth mode kiosk)"],
    steps: [
      {
        id: "mulai",
        title: "Ketuk MULAI FOTO",
        body: "Layar ini muncul saat booth siap dipakai. Ketuk tombol MULAI FOTO untuk memulai sesi.",
        shots: [img("cara-foto", "tunggu.jpg", "Layar tunggu Sissi Booth dengan tombol MULAI FOTO")],
      },
      {
        id: "pilih-gaya",
        title: "Pilih gaya fotomu",
        body: "Pilih bentuk hasil foto yang kamu mau, lalu ketuk LANJUT.",
        shots: [img("cara-foto", "layout-gif.jpg", "Layar pilih gaya foto dengan sakelar GIF Boomerang")],
        points: ["Strip 4 pose, strip 3 pose, grid, atau 1 foto besar", "Nyalakan GIF Boomerang kalau mau animasi lucu dari pose-posemu"],
      },
      {
        id: "pilih-bingkai",
        title: "Pilih bingkai",
        body: "Ketuk bingkai favoritmu. Contoh strip di kiri langsung berubah sesuai pilihan, jadi kamu bisa lihat hasilnya dulu. Cocok? Ketuk LANJUT.",
        shots: [img("cara-foto", "bingkai-geser.jpg", "Layar pilih bingkai dengan pratinjau strip di kiri")],
        points: ["Geser daftar untuk melihat bingkai lain, atau ketuk panah ◀ ▶ di bawah"],
      },
      {
        id: "bayar",
        title: "Bayar pakai QRIS",
        body: "Di booth mode kiosk, scan QRIS di layar pakai e-wallet atau m-banking. Layar lanjut sendiri setelah pembayaran lunas, kamu nggak perlu menunjukkan bukti bayar.",
        shots: [img("cara-foto", "bayar.jpg", "Layar pembayaran QRIS")],
        callout: { type: "info", title: "Booth acara gratis", text: "Di booth mode event (misalnya nikahan), langkah bayar dilewati. Kamu langsung lanjut ke jepret." },
      },
      {
        id: "jepret",
        title: "Pasang gaya, cekrek!",
        body: "Posisikan wajah di tengah layar, lalu ketuk MULAI JEPRET!. Hitung mundur 3… 2… 1… berjalan, lalu foto diambil otomatis.",
        shots: [img("cara-foto", "jepret-3.jpg", "Hitung mundur sebelum foto diambil")],
        points: ["Lihat ke kamera saat hitung mundur", "Ganti gaya tiap foto; kotak di bawah menunjukkan foto ke berapa"],
      },
      {
        id: "tinjau",
        title: "Tinjau, ulang kalau perlu",
        body: "Semua foto ditampilkan. Ada yang merem? Ketuk ULANG pada foto itu, hitung mundur jalan sekali lagi. Sudah cakep? Ketuk LANJUT HIAS.",
        shots: [img("cara-foto", "tinjau.jpg", "Layar tinjau foto dengan tombol ULANG")],
        caption: "Jatah ulang per foto diatur pemilik booth.",
      },
      {
        id: "hias",
        title: "Hias dengan filter & stiker",
        body: "Pilih filter, semua foto langsung berubah warna. Mau stiker? Ketuk tab STIKER di atas dan tempel sesukamu. Beres? Ketuk LANJUT CETAK.",
        shots: [
          img("cara-foto", "hias-filter.jpg", "Layar hias: pilihan filter"),
          img("cara-foto", "stiker-cubit.jpg", "Layar hias: stiker diperbesar dengan dua jari"),
        ],
        points: [
          "Ketuk stiker untuk menempel, muncul di tengah foto",
          "Tahan lalu seret untuk memindahkan",
          "Cubit dengan dua jari untuk memperbesar atau memutar",
          "Salah tempel? Ketuk × pada stiker",
        ],
      },
      {
        id: "ambil-hasil",
        title: "Scan QR & ambil strip",
        body: "Tunggu sebentar selagi strip, GIF, dan lembar cetak disiapkan. Setelah itu scan QR di layar pakai kamera HP untuk mengunduh softcopy, ketuk SELESAI, lalu ambil strip-mu di printer.",
        shots: [img("cara-foto", "hasil.jpg", "Layar hasil dengan QR untuk unduh foto"), img("cara-foto", "terima-kasih.jpg", "Layar terima kasih dengan tombol FOTO LAGI")],
        callout: { type: "tip", title: "Mau foto lagi?", text: "Ketuk FOTO LAGI. Kalau dibiarkan, booth juga kembali ke awal sendiri." },
      },
    ],
    faqs: [
      ["Fotonya bisa diunduh sampai kapan?", "Galeri online bisa dibuka sampai 30 hari. Kalau booth memakai Wi-Fi booth (tanpa internet), unduh langsung di tempat karena galerinya hanya bisa dibuka di dekat booth."],
      ["Kalau kelamaan diam di satu layar?", "Booth lanjut sendiri atau menanyakan \"Masih di situ?\" supaya antrean tetap lancar."],
    ],
    related: ["unduh-foto", "sesi-mode", "template-bingkai"],
  },
  {
    slug: "unduh-foto",
    no: "02",
    audience: "Tamu",
    title: "Unduh foto ke HP",
    summary: "Scan QR, lalu simpan strip, GIF, dan foto satu-satu. Bisa online atau lewat Wi-Fi booth.",
    overview:
      "Softcopy fotomu nggak perlu dikirim operator. Cukup scan QR di layar hasil pakai kamera HP biasa, tanpa aplikasi tambahan. Caranya sedikit berbeda kalau booth sedang tanpa internet.",
    readTime: "3 menit baca",
    video: { id: "t9EQI55_rZs", duration: "0:47", uploaded: "2026-10-08T19:36:25-07:00" },
    prerequisites: ["HP dengan kamera (aplikasi kamera bawaan sudah bisa scan QR)"],
    steps: [
      {
        id: "scan-qr",
        title: "Scan QR di layar hasil",
        body: "Arahkan kamera HP ke QR di layar hasil, lalu ketuk tautan yang muncul. Nggak perlu aplikasi khusus.",
        shots: [img("unduh-foto", "hasil.jpg", "Layar hasil dengan satu QR untuk galeri online")],
        caption: "Satu QR = booth sedang online.",
      },
      {
        id: "unduh",
        title: "Ketuk UNDUH",
        body: "Galeri fotomu terbuka di HP. Ketuk UNDUH di bawah strip untuk menyimpannya ke galeri HP.",
        shots: [img("unduh-foto", "hp-galeri.jpg", "Halaman galeri di HP berisi strip foto dan tombol UNDUH", "phone")],
        points: ["GIF Boomerang juga punya tombol UNDUH sendiri", "Mau foto satu-satu? Gulir ke bawah, tiap foto bisa diunduh terpisah", "Galeri online bisa dibuka sampai 30 hari"],
        callout: { type: "tip", title: "Tombol unduh nggak jalan?", text: "Tekan lama fotonya, lalu pilih \"Simpan ke Foto\"." },
      },
      {
        id: "qr-wifi",
        title: "Ada 2 QR? Scan QR nomor 1",
        body: "Kalau booth sedang tanpa internet, layar hasil menampilkan 2 QR. Scan QR nomor 1, lalu ketuk Sambung untuk tersambung ke Wi-Fi booth. Tanpa internet pun bisa, Wi-Fi-nya dari booth.",
        shots: [img("unduh-foto", "hasil-hotspot.jpg", "Layar hasil dengan dua QR: Wi-Fi booth dan galeri")],
      },
      {
        id: "qr-galeri",
        title: "Lalu scan QR nomor 2",
        body: "Setelah tersambung, scan QR nomor 2. Halaman galeri terbuka di HP, caranya sama: ketuk UNDUH.",
        shots: [img("unduh-foto", "hasil-hotspot-galeri.jpg", "QR nomor 2 untuk membuka galeri lewat Wi-Fi booth")],
        callout: { type: "warning", title: "Unduh sekarang juga", text: "Galeri lewat Wi-Fi booth hanya bisa dibuka di dekat booth. Simpan fotomu sebelum pergi." },
      },
    ],
    faqs: [
      ["Kenapa ada 1 QR kadang 2 QR?", "Satu QR berarti booth online: fotomu ada di galeri online. Dua QR berarti booth sedang tanpa internet: sambung Wi-Fi booth dulu (QR 1), lalu buka galeri (QR 2)."],
      ["Belum sempat scan QR, gimana?", "Minta operator membuka sesi kamu di Galeri sesi. QR-nya bisa ditampilkan lagi dari sana."],
    ],
    related: ["cara-foto", "galeri-sesi", "softcopy-harga"],
  },
  {
    slug: "aktifkan-lisensi",
    no: "09",
    audience: "Pemilik booth",
    title: "Aktifkan lisensi",
    summary: "Keluar dari MODE DEMO dengan kunci lisensi, plus arti status AKTIF dan AKTIF · OFFLINE.",
    overview:
      "Sebelum diaktifkan, Sissi Booth berjalan dalam MODE DEMO: bisa dicoba penuh, tapi hasil cetak bertanda DEMO dan foto tidak diunggah. Aktivasi cukup sekali dengan kunci lisensi dari tim Sissi.",
    readTime: "2 menit baca",
    video: { id: "JKX6ZMRAhqI", duration: "0:36", uploaded: "2026-10-08T19:51:25-07:00" },
    prerequisites: ["Kunci lisensi dari tim Sissi (diberikan saat berlangganan)", "Koneksi internet saat aktivasi", "Akses menu admin (lihat panduan Masuk menu admin)"],
    steps: [
      {
        id: "mode-demo",
        title: "Buka menu Lisensi",
        body: "Di menu admin, buka Lisensi. Selama belum aktif, statusnya MODE DEMO.",
        shots: [img("aktifkan-lisensi", "demo.jpg", "Menu Lisensi dengan status MODE DEMO")],
        points: ["Hasil cetak diberi tanda DEMO", "Foto tidak diunggah ke galeri online"],
      },
      {
        id: "isi-kunci",
        title: "Isi kunci lisensi & nama booth",
        body: "Ketik kunci lisensi, lalu beri nama booth supaya gampang dikenali, misalnya \"Booth Mall A\". Alamat server sudah terisi otomatis.",
        shots: [img("aktifkan-lisensi", "nama.jpg", "Isian kunci lisensi dan nama booth")],
      },
      {
        id: "aktifkan",
        title: "Ketuk AKTIFKAN",
        body: "Ketuk AKTIFKAN. Setelah berhasil, status berubah jadi AKTIF dan terlihat paket, tanggal berlaku sampai, serta batas boleh offline. Kartu aktivasi otomatis dilipat; buka lewat UBAH hanya bila ingin mengganti kunci atau nama booth.",
        shots: [img("aktifkan-lisensi", "aktif.jpg", "Status lisensi AKTIF dengan paket dan masa berlaku")],
        callout: { type: "info", title: "Butuh internet sekali", text: "Internet hanya diperlukan saat aktivasi. Setelah itu booth tetap bisa jalan tanpa internet." },
      },
      {
        id: "offline",
        title: "Arti AKTIF · OFFLINE",
        body: "Kalau booth sedang tanpa internet, statusnya AKTIF · OFFLINE. Ini aman: booth tetap jalan seperti biasa sampai tanggal \"Boleh offline sampai\".",
        shots: [img("aktifkan-lisensi", "offline.jpg", "Status lisensi AKTIF · OFFLINE dengan tanggal boleh offline sampai")],
        callout: { type: "warning", title: "Sambungkan sebelum batasnya", text: "Sambungkan laptop booth ke internet sebelum tanggal \"Boleh offline sampai\" lewat supaya lisensi tetap aktif." },
      },
    ],
    faqs: [
      ["Bisa coba dulu sebelum berlangganan?", "Bisa. Di MODE DEMO kamu bisa foto, hias, dan cetak seperti biasa; hasilnya diberi tanda \"DEMO\". Hubungi tim Sissi untuk demo."],
      ["Lupa kunci lisensi?", "Hubungi tim Sissi lewat WhatsApp."],
    ],
    related: ["masuk-admin", "kamera-printer", "softcopy-harga"],
  },
  {
    slug: "masuk-admin",
    no: "03",
    audience: "Pemilik booth",
    title: "Masuk menu admin",
    summary: "Buka menu admin lewat tombol tersembunyi + PIN, lalu baca halaman Ringkasan.",
    overview:
      "Semua pengaturan booth ada di menu admin. Pintunya sengaja disembunyikan dan dikunci PIN supaya tamu nggak bisa iseng. Halaman pertamanya, Ringkasan, menunjukkan kondisi booth dalam satu layar.",
    readTime: "3 menit baca",
    video: { id: "68q4QZrZT7k", duration: "0:54", uploaded: "2026-10-08T19:38:55-07:00" },
    prerequisites: ["PIN admin 6 angka milik pemilik booth"],
    steps: [
      {
        id: "pojok",
        title: "Ketuk pojok kanan atas 5×",
        body: "Di layar booth, ketuk pojok kanan atas 5 kali berturut-turut dengan cepat. Tombolnya memang tidak terlihat, supaya tamu tidak masuk. Selama booth belum diaktifkan, petunjuk kecil ini juga tampil di pojok kanan bawah layar tunggu.",
        shots: [img("masuk-admin", "pojok.jpg", "Pojok kanan atas layar booth tempat tombol admin tersembunyi")],
      },
      {
        id: "pin",
        title: "Masukkan PIN 6 angka",
        body: "Ketuk angkanya satu per satu. Setelah 6 angka, menu admin langsung terbuka. Salah ketik? Ketuk HAPUS.",
        shots: [img("masuk-admin", "pin.jpg", "Layar PIN admin")],
      },
      {
        id: "ringkasan",
        title: "Baca halaman Ringkasan",
        body: "Bagian atas menampilkan angka hari ini: sesi selesai, perkiraan pendapatan (mode kiosk), dan sisa kertas.",
        shots: [img("masuk-admin", "ringkasan-angka.jpg", "Halaman Ringkasan: sesi, perkiraan pendapatan, sisa kertas")],
      },
      {
        id: "status",
        title: "Cek status perangkat",
        body: "Hijau AKTIF berarti aman, oranye CEK berarti belum siap. Ketuk barisnya untuk langsung membuka pengaturannya.",
        shots: [img("masuk-admin", "status-kamera.jpg", "Daftar status perangkat di halaman Ringkasan")],
        points: [
          "Kamera: kamera yang dipakai",
          "Printer: nama printer & sisa kertas",
          "Lisensi & galeri online: MODE DEMO berarti hasil bertanda DEMO dan foto tidak diunggah",
          "Wi-Fi & halaman unduh: BELUM berarti laptop belum tersambung jaringan, tamu belum bisa unduh lewat Wi-Fi",
          "Penyimpanan: jumlah sesi di laptop & kapan dihapus otomatis",
        ],
        callout: { type: "tip", title: "Sebelum acara", text: "Pastikan semua status di Ringkasan sudah hijau." },
      },
      {
        id: "menu",
        title: "Menu pengaturan & KE BOOTH",
        body: "Menu pengaturan ada di kiri: Sesi & mode, Template, Kamera & printer, Pengiriman & bayar, Galeri sesi, dan Lisensi. Selesai? Ketuk KE BOOTH, booth siap dipakai tamu lagi.",
        shots: [img("masuk-admin", "menu.jpg", "Menu pengaturan di sisi kiri dan tombol KE BOOTH")],
        callout: { type: "info", title: "Terkunci sendiri", text: "Kalau ditinggal, menu admin terkunci otomatis. Lamanya bisa diatur di Sesi & mode." },
      },
    ],
    faqs: [["Lupa PIN admin?", "Hubungi tim Sissi lewat WhatsApp untuk bantuan."]],
    related: ["sesi-mode", "kamera-printer", "aktifkan-lisensi"],
  },
  {
    slug: "kamera-printer",
    no: "06",
    audience: "Pemilik booth",
    title: "Kamera & printer",
    summary: "Pilih kamera (webcam sampai kamera pro Sony), putar & cermin tampilan, pasang printer, isi ulang kertas.",
    overview:
      "Sambungkan kamera dan printer, lalu atur semuanya dari menu Kamera & printer. Selalu coba TES JEPRET dan TES CETAK sebelum acara mulai.",
    readTime: "4 menit baca",
    video: { id: "negXnauPTeg", duration: "1:10", uploaded: "2026-10-08T19:44:57-07:00" },
    prerequisites: ["Kamera (webcam, capture card, HP, atau kamera pro) & printer foto yang sudah dicolok", "Driver printer sudah terpasang di komputer", "Akses menu admin"],
    steps: [
      {
        id: "buka-menu",
        title: "Buka menu Kamera & printer",
        body: "Colok kamera dan printer dulu, lalu buka menu Kamera & printer. Perangkat belum muncul? Ketuk PINDAI ULANG.",
        shots: [img("kamera-printer", "perangkat.jpg", "Menu Kamera & printer")],
      },
      {
        id: "pilih-kamera",
        title: "Pilih kamera",
        body: "Ketuk kamera yang mau dipakai: webcam, capture card, HP, atau kamera pro. Live view langsung tampil, cek posisi dan cahayanya.",
        shots: [img("kamera-printer", "kamera-webcam.jpg", "Daftar kamera dengan live view"), img("kamera-printer", "kamera-pro.jpg", "Pilihan kamera pro Sony lewat USB")],
        callout: {
          type: "info",
          title: "Kamera pro Sony",
          text: "Di kamera buka MENU › Jaringan › PC Remote: On, lalu colok USB. Hasilnya foto resolusi tinggi (JPEG), dengan jeda ±1 detik per foto.",
        },
      },
      {
        id: "rotasi",
        title: "Putar & cermin tampilan",
        body: "Kamera dipasang tegak? Pilih rotasi 90° atau 270° sampai tampilan lurus; live view dan hasil ikut berputar. Cermin preview membuat tamu melihat dirinya seperti di kaca, hasil foto tetap normal.",
        shots: [img("kamera-printer", "rotasi-90.jpg", "Pengaturan rotasi kamera 90°")],
      },
      {
        id: "tes-jepret",
        title: "Ketuk TES JEPRET",
        body: "Hasil dan resolusinya tampil. Kalau gagal, cek kabel lalu coba lagi.",
        shots: [img("kamera-printer", "tes-jepret-hasil.jpg", "Hasil TES JEPRET dengan resolusi foto")],
      },
      {
        id: "printer",
        title: "Pilih printer foto",
        body: "Pilih printer yang sudah terpasang di komputer. Belum terpasang? Ketuk CARA PASANG dan ikuti 4 langkahnya.",
        shots: [img("kamera-printer", "cara-pasang-dialog.jpg", "Dialog CARA PASANG printer")],
        points: ["Pasang driver printer", "Tambahkan printer di komputer", "Atur kertas 4×6", "Kembali ke Sissi Booth, ketuk PINDAI ULANG"],
      },
      {
        id: "tes-cetak",
        title: "Atur cetak & ketuk TES CETAK",
        body: "Nyalakan cetak otomatis supaya hasil langsung dicetak begitu jadi. Isi jumlah kertas per pak (misal DNP 4×6 = 700 lembar) untuk menghitung sisa kertas. Lalu ketuk TES CETAK dan cek tepi serta garis potongnya.",
        shots: [img("kamera-printer", "kertas-pak.jpg", "Pengaturan cetak otomatis dan isi kertas per pak")],
      },
      {
        id: "isi-ulang",
        title: "Ganti kertas: ISI ULANG KERTAS",
        body: "Setiap memasang kertas baru, ketuk ISI ULANG KERTAS supaya penghitung sisa kertas kembali penuh.",
        shots: [img("kamera-printer", "isi-ulang.jpg", "Tombol ISI ULANG KERTAS")],
        callout: { type: "tip", title: "Pantau sisa kertas", text: "Sisa kertas juga tampil di halaman Ringkasan menu admin." },
      },
    ],
    faqs: [
      ["Kamera apa saja yang bisa dipakai?", "Webcam, capture card, HP, sampai kamera pro Sony lewat USB (PC Remote)."],
      ["Printer apa yang bisa dipakai?", "Printer foto yang terpasang di komputer, termasuk printer dye-sub untuk strip 2×6 dan kartu 4×6."],
    ],
    related: ["masuk-admin", "sesi-mode", "template-bingkai"],
  },
  {
    slug: "sesi-mode",
    no: "04",
    audience: "Pemilik booth",
    title: "Atur sesi & mode",
    summary: "Mode kiosk atau event, nama acara, hitung mundur, jatah ulang foto, jumlah cetak, dan waktu otomatis.",
    overview:
      "Menu Sesi & mode menentukan cara kerja booth: tamu bayar sendiri atau foto gratis, berapa lama hitung mundur, berapa strip yang dicetak, dan kapan booth lanjut sendiri. Perubahan langsung dipakai di sesi berikutnya.",
    readTime: "4 menit baca",
    video: { id: "INZb4ObhGKY", duration: "1:02", uploaded: "2026-10-08T19:42:20-07:00" },
    prerequisites: ["Akses menu admin"],
    steps: [
      {
        id: "mode",
        title: "Pilih mode: KIOSK atau EVENT",
        body: "EVENT: tamu foto gratis, cocok untuk nikahan, ulang tahun, dan acara kantor. KIOSK: tamu bayar QRIS sebelum foto, cocok untuk booth di mal atau kafe.",
        callout: { type: "info", title: "Mode kiosk segera hadir", text: "Pembayaran QRIS sedang disiapkan. Sementara itu booth memakai mode event; pilihan KIOSK aktif begitu QRIS siap." },
        shots: [img("sesi-mode", "event.jpg", "Pilihan mode KIOSK dan EVENT")],
      },
      {
        id: "nama-acara",
        title: "Isi nama acara (mode event)",
        body: "Nama acara muncul di layar tunggu booth.",
        shots: [img("sesi-mode", "nama-event-isi.jpg", "Isian nama acara")],
      },
      {
        id: "hitung-mundur",
        title: "Hitung mundur, ulang foto & jumlah cetak",
        body: "Ketuk + atau − untuk mengubah angkanya.",
        shots: [img("sesi-mode", "hitung-mundur-5.jpg", "Pengaturan hitung mundur 5 detik")],
        points: [
          "Hitung mundur tiap foto: misal 5 detik biar tamu sempat bergaya",
          "Jatah ulang foto: berapa kali tiap foto boleh diulang tamu",
          "Jumlah cetak per sesi: misal 3 strip untuk rombongan bertiga",
        ],
      },
      {
        id: "layar-penuh",
        title: "Layar penuh & GIF Boomerang",
        body: "Nyalakan layar penuh saat acara: tanpa bingkai jendela, jadi tamu tidak bisa menutup aplikasi. Matikan GIF Boomerang kalau tidak mau menawarkan GIF ke tamu.",
        shots: [img("sesi-mode", "layar-penuh.jpg", "Sakelar layar penuh dan GIF Boomerang")],
      },
      {
        id: "waktu",
        title: "Waktu otomatis",
        body: "Booth lanjut sendiri kalau tamu diam, jadi antrean tetap lancar.",
        shots: [img("sesi-mode", "batas-diam.jpg", "Pengaturan waktu otomatis dan batas diam")],
        points: ["Batas diam: tidak ada sentuhan selama ini, muncul pop-up \"Masih di situ?\"", "Kunci admin: menu admin terkunci sendiri kalau ditinggal"],
      },
      {
        id: "ke-booth",
        title: "Ketuk KE BOOTH",
        body: "Mode dan nama acara langsung tampil di booth. Di mode event, tamu langsung tahu fotonya gratis.",
        shots: [img("sesi-mode", "booth-event.jpg", "Layar booth menampilkan mode event dan nama acara")],
      },
    ],
    faqs: [
      ["Harga di mode kiosk diatur di mana?", "Di menu Pengiriman & bayar, begitu pembayaran QRIS siap. Sementara itu booth memakai mode event (tamu foto gratis)."],
      ["Perlu mulai ulang aplikasi setelah mengubah?", "Tidak. Perubahan langsung dipakai di sesi berikutnya."],
    ],
    related: ["softcopy-harga", "template-bingkai", "masuk-admin"],
  },
  {
    slug: "template-bingkai",
    no: "05",
    audience: "Pemilik booth",
    title: "Impor bingkai dari Canva/Photoshop",
    summary: "Unduh panduan layout, desain di Canva atau Photoshop, lalu impor sampai muncul di layar tamu.",
    overview:
      "Untuk desain yang benar-benar bebas, Sissi Booth menyediakan file panduan untuk tiap layout. Desain di atasnya pakai Canva atau Photoshop, lalu impor. Ukurannya dicek otomatis. Cukup ganti tulisan, latar, atau tambah logo? Lebih cepat lewat panduan \"Buat template di aplikasi\", tanpa aplikasi lain.",
    readTime: "5 menit baca",
    video: { id: "zhZWEo1rwRE", duration: "1:02", uploaded: "2026-10-08T19:43:38-07:00" },
    prerequisites: ["Aplikasi desain (misalnya Canva atau Photoshop), atau desainer langganan", "Akses menu admin"],
    steps: [
      {
        id: "unduh-panduan",
        title: "Unduh PANDUAN sesuai layout",
        body: "Buka menu Template, ketuk LIHAT di \"Panduan & cara bikin template\", lalu ketuk PANDUAN pada layout yang mau dibuat. Panduan tersimpan sebagai file zip, di dalamnya sudah ada cara bikinnya.",
        shots: [img("template-bingkai", "cara-bikin.jpg", "Daftar layout dengan tombol PANDUAN dan IMPOR")],
        points: [
          "Strip Klasik: 600×1800 px, kertas 2×6\", 4 foto",
          "Strip Trio: 600×1800 px, kertas 2×6\", 3 foto",
          "Grid Bestie: 1200×1800 px, kertas 4×6\", 4 foto",
          "Solo Besar: 1200×1800 px, kertas 4×6\", 1 foto",
        ],
        callout: { type: "tip", title: "Pakai desainer?", text: "File zip panduan bisa langsung dikirim ke desainer lewat WA, kamu tinggal terima hasilnya." },
      },
      {
        id: "desain",
        title: "Desain di atas panduan",
        body: "Di aplikasi desain, buat kanvas dengan ukuran yang sama (misal 600 × 1800 px) dan taruh panduan di lapisan paling bawah. Desain bebas di atasnya, pas-kan bingkai dengan kotak-kotak biru. Terakhir sembunyikan panduan, lalu ekspor sebagai PNG atau JPG.",
        shots: [
          img("template-bingkai", "contoh-panduan.png", "File panduan Strip Klasik: kotak biru area foto", "print"),
          img("template-bingkai", "contoh-desain.png", "Contoh desain bingkai Strip Klasik", "print"),
        ],
        caption: "Kiri: panduan. Kanan: contoh desain di atasnya.",
        points: ["Kotak biru = area foto, biarkan kosong karena nanti tertutup foto tamu", "Garis oranye = batas aman, isi penting jangan melewatinya", "300 dpi; resolusi lain boleh asal rasionya sama (strip 1:3, kartu 2:3)"],
      },
      {
        id: "impor",
        title: "Ketuk IMPOR",
        body: "Kembali ke Sissi Booth, ketuk IMPOR pada layout yang sama dan pilih file desainmu. Ukurannya dicek otomatis.",
        shots: [img("template-bingkai", "impor.jpg", "Tombol IMPOR pada layout")],
      },
      {
        id: "posisi-foto",
        title: "Cek posisi foto, lalu SIMPAN",
        body: "Kotak bernomor adalah tempat foto. Geser kotaknya, atau tarik sudut kanan bawah untuk mengubah ukuran. Sudah pas? Ketuk SIMPAN.",
        shots: [img("template-bingkai", "editor.jpg", "Editor template dengan kotak foto bernomor")],
        points: ["Foto di atas desain: untuk template tanpa transparan", "Foto di balik PNG: untuk bingkai transparan"],
      },
      {
        id: "atur-tampil",
        title: "Atur bingkai yang ditawarkan",
        body: "Template baru langsung aktif (sakelar hijau = muncul di layar tamu). Matikan sakelar bingkai bawaan yang tidak mau ditawarkan. Ketuk ikon pensil untuk mengubah template, termasuk memberi label di layar tamu (EVENT, BARU, SPESIAL, FAVORIT, atau tanpa label).",
        shots: [img("template-bingkai", "sembunyikan.jpg", "Daftar template dengan sakelar tampil/sembunyi")],
      },
      {
        id: "di-booth",
        title: "Muncul di layar tamu",
        body: "Template-mu kini ada di pilihan bingkai. Tamu tinggal memilihnya.",
        shots: [img("template-bingkai", "di-booth.jpg", "Template baru di layar pilih bingkai tamu")],
      },
    ],
    faqs: [
      ["Format file apa yang diterima?", "PNG atau JPG. Pakai PNG transparan kalau foto mau tampil di balik bingkai."],
      ["Bisa beda bingkai untuk tiap acara?", "Bisa. Impor bingkai baru, lalu matikan sakelar bingkai acara sebelumnya."],
      ["Tidak punya aplikasi desain?", "Pakai BUAT DESAIN di menu Template: pilih latar, tulis nama acara, tambah logo, langsung jadi. Lihat panduan \"Buat template di aplikasi\"."],
    ],
    related: ["desain-template", "sesi-mode", "cara-foto"],
  },
  {
    slug: "desain-template",
    no: "11",
    audience: "Pemilik booth",
    title: "Buat template di aplikasi",
    summary: "Ganti tulisan di bawah foto, atau buat bingkai sendiri: pilih latar, tulis nama acara, tambah logo. Tanpa Canva.",
    overview:
      "Bingkai dengan nama pengantin, tanggal acara, atau logo brand bisa dibuat langsung di Sissi Booth. Pilih latar dari bingkai bawaan, warna polos, atau gambar apa pun. Tambah tulisan dengan 12 pilihan font, lalu logo. Kotak foto selalu aman: tulisan dan logo tidak bisa menutupinya.",
    readTime: "4 menit baca",
    prerequisites: ["Akses menu admin", "Logo atau gambar latar dalam PNG/JPG (opsional, ukuran bebas)"],
    steps: [
      {
        id: "teks-bawah",
        title: "Cara cepat: ganti tulisan di bawah foto",
        body: "Buka menu Template, lalu ketuk UBAH di kartu \"Teks di bawah foto\". Ketik tulisanmu, misalnya nama pengantin. Tekan Enter untuk baris kedua seperti tanggal acara. Pilih rata kiri, tengah, atau kanan, lalu font dan warnanya. Pratinjau di kanan langsung berubah.",
        shots: [img("desain-template", "teks-bawah.jpg", "Kartu Teks di bawah foto dengan pilihan rata, font, dan warna")],
        points: ["Hanya untuk bingkai bawaan; template buatan sendiri & impor memakai tulisannya sendiri", "Maksimal 2 baris", "Kosongkan untuk kembali ke tulisan bawaan"],
      },
      {
        id: "buat-desain",
        title: "Ketuk BUAT DESAIN",
        body: "Mau bingkai yang benar-benar milikmu? Ketuk BUAT DESAIN di kanan atas menu Template. Pilih layout: Strip Klasik, Strip Trio, Grid Bestie, atau Solo Besar. Kotak bertuliskan FOTO adalah tempat foto tamu nanti.",
        shots: [img("desain-template", "buat-desain.jpg", "Editor Buat template sendiri dengan pilihan layout dan latar")],
      },
      {
        id: "latar",
        title: "Pilih latar",
        body: "Di kartu Latar, pilih BINGKAI (warna dan motif bawaan), WARNA (warna polos), atau GAMBAR (foto atau desain apa pun, ukuran bebas). Gambar otomatis memenuhi kertas. Seret area kosong di desain untuk memilih bagian gambar yang tampil, dan perbesar dengan tombol + kalau perlu.",
        shots: [img("desain-template", "latar.jpg", "Latar gambar dengan tombol PILIH GAMBAR dan Perbesar latar")],
        points: ["POSISI AWAL mengembalikan gambar ke tengah", "Garis tepi hitam bisa dimatikan"],
      },
      {
        id: "tulisan-logo",
        title: "Tambah tulisan & logo",
        body: "Ketuk TULISAN untuk menambah teks, atau LOGO / GAMBAR untuk memasang logo PNG. Ketuk elemen di desain untuk memilihnya, lalu geser untuk memindah. Tulisan bisa diatur isinya (sampai 3 baris), rata, font, warna, dan ukuran.",
        shots: [img("desain-template", "tulisan.jpg", "Tulisan terpilih dengan pilihan rata, font, warna, dan ukuran")],
        callout: {
          type: "info",
          title: "Foto tamu selalu aman",
          text: "Tulisan atau logo yang digeser ke kotak foto otomatis didorong keluar ke tempat kosong terdekat. Kalau tidak muat, ukurannya diperkecil.",
        },
      },
      {
        id: "label-simpan",
        title: "Pilih label, lalu SIMPAN",
        body: "Beri nama template, lalu pilih \"Label di layar tamu\": tanpa label, EVENT, BARU, SPESIAL, atau FAVORIT. Ketuk SIMPAN. Template tersimpan dengan tanda DESAIN dan bisa diubah lagi kapan saja lewat ikon pensil.",
        shots: [
          img("desain-template", "label.jpg", "Pilihan Label di layar tamu"),
          img("desain-template", "tersimpan.jpg", "Template DESAIN di daftar template"),
        ],
      },
      {
        id: "di-booth",
        title: "Muncul di layar tamu",
        body: "Template aktif langsung ada di pilihan bingkai tamu, lengkap dengan label pilihanmu. Matikan sakelarnya kalau acara sudah selesai.",
        shots: [img("desain-template", "di-booth.jpg", "Template buatan sendiri berlabel SPESIAL di layar pilih bingkai")],
      },
    ],
    faqs: [
      ["Gambar latar harus ukuran berapa?", "Bebas. Gambar otomatis memenuhi kertas; geser dan perbesar untuk memilih bagian yang tampil. Gambar sangat besar diperkecil otomatis supaya aplikasi tetap ringan."],
      ["Fontnya bisa dipakai tanpa internet?", "Bisa. Ke-12 font sudah tertanam di aplikasi."],
      ["Bisa mengubah posisi kotak foto?", "Di template buatan aplikasi, posisi foto mengikuti layout. Untuk posisi foto bebas, pakai impor dari Canva/Photoshop."],
      ["Template lama saya masih ada?", "Masih. Template impor tetap bisa dipakai dan diberi label."],
    ],
    related: ["template-bingkai", "sesi-mode", "cara-foto"],
  },
  {
    slug: "softcopy-harga",
    no: "07",
    audience: "Pemilik booth",
    title: "Kirim softcopy & atur harga",
    summary: "Pilih cara softcopy sampai ke HP tamu, atur Wi-Fi dan lama simpan file. Harga mode kiosk segera hadir.",
    overview:
      "Menu Pengiriman & bayar mengatur bagaimana softcopy sampai ke HP tamu: lewat internet atau Wi-Fi booth. Pembayaran QRIS (mode kiosk) sedang disiapkan.",
    readTime: "3 menit baca",
    video: { id: "s3GxQdAnV08", duration: "0:48", uploaded: "2026-10-08T19:46:47-07:00" },
    prerequisites: ["Nama & sandi Wi-Fi yang dipakai laptop booth (Wi-Fi venue atau hotspot HP)", "Akses menu admin"],
    steps: [
      {
        id: "cara-kirim",
        title: "Pilih cara kirim softcopy",
        body: "Ada tiga pilihan. Disarankan Otomatis supaya booth tetap jalan saat internet putus.",
        shots: [img("softcopy-harga", "pengiriman.jpg", "Pilihan cara kirim softcopy: Otomatis, Cloud, Hotspot")],
        points: [
          "Otomatis: pakai galeri online kalau ada internet, Wi-Fi booth kalau tidak",
          "Cloud saja: butuh internet, tamu bisa unduh sampai 30 hari",
          "Hotspot lokal saja: tanpa internet, tamu unduh lewat Wi-Fi, hanya di dekat booth",
        ],
      },
      {
        id: "wifi",
        title: "Isi nama & sandi Wi-Fi",
        body: "Isi nama Wi-Fi yang sedang dipakai laptop booth, lalu sandinya (kosongkan kalau Wi-Fi tanpa sandi). Tersimpan otomatis. Tamu tinggal scan QR untuk tersambung ke Wi-Fi ini.",
        shots: [img("softcopy-harga", "wifi-isi.jpg", "Isian nama dan sandi Wi-Fi")],
      },
      {
        id: "lama-simpan",
        title: "Atur lama simpan file",
        body: "Tentukan berapa lama foto disimpan di laptop. Setelah itu foto dihapus otomatis supaya laptop tidak penuh.",
        shots: [img("softcopy-harga", "simpan-file.jpg", "Pengaturan lama simpan file di laptop")],
      },
      {
        id: "harga",
        title: "Harga & pembayaran QRIS (segera hadir)",
        body: "Mode kiosk, tempat tamu bayar sendiri lewat QRIS, sedang disiapkan. Sementara itu booth memakai mode event (tamu foto gratis), dan pengaturan harga per sesi muncul di kartu Pembayaran QRIS begitu fitur ini siap.",
        shots: [img("softcopy-harga", "qris-segera.jpg", "Kartu Pembayaran QRIS bertanda segera hadir")],
        callout: { type: "info", title: "Acara berbayar sekarang?", text: "Untuk sementara, catat nilai kontrak acaramu di dashboard pemilik (menu Acara) supaya keuntungan tetap terhitung." },
      },
    ],
    faqs: [
      ["Internet venue putus di tengah acara?", "Dengan pilihan Otomatis, booth pindah ke Wi-Fi booth sendiri. Tamu scan 2 QR: sambung Wi-Fi, lalu buka galeri."],
      ["Foto yang gagal diunggah hilang?", "Tidak. Fotonya tetap ada di Galeri sesi dan bisa diunggah ulang saat internet kembali."],
    ],
    related: ["unduh-foto", "sesi-mode", "galeri-sesi"],
  },
  {
    slug: "galeri-sesi",
    no: "08",
    audience: "Pemilik booth",
    title: "Galeri sesi",
    summary: "Cari sesi foto, tampilkan QR lagi, CETAK ULANG, UNGGAH ULANG, atau hapus sesi.",
    overview:
      "Tamu minta cetak lagi atau belum sempat scan QR? Semua sesi foto di laptop ini tersimpan di Galeri sesi, terbaru dulu.",
    readTime: "3 menit baca",
    video: { id: "Oq8GensNUow", duration: "1:11", uploaded: "2026-10-08T19:47:52-07:00" },
    prerequisites: ["Akses menu admin", "Kode sesi tamu (ada di bawah QR) kalau mau mencari cepat"],
    steps: [
      {
        id: "cari",
        title: "Cari pakai kode atau jam",
        body: "Buka menu Galeri sesi, lalu ketik kode sesi atau jamnya. Kode ada di bawah QR tamu.",
        shots: [img("galeri-sesi", "cari-hasil.jpg", "Galeri sesi dengan hasil pencarian kode")],
      },
      {
        id: "saring",
        title: "Saring per hari atau rentang tanggal",
        body: "Pilih Hari ini, Kemarin, atau Semua. Atau ketuk Pilih tanggal, ketuk tanggal awal lalu tanggal akhir, dan ketuk PAKAI.",
        shots: [img("galeri-sesi", "kalender-akhir.jpg", "Kalender pilih rentang tanggal")],
        points: ["Tanggal bertitik = ada sesinya", "Satu ketukan saja = satu hari"],
      },
      {
        id: "detail",
        title: "Buka detail: QR lagi & CETAK ULANG",
        body: "Ketuk sesi untuk membuka detailnya. Tunjukkan QR lagi untuk tamu yang belum sempat scan, atau ketuk CETAK ULANG untuk mengirim strip lagi ke printer.",
        shots: [img("galeri-sesi", "detail-qr.jpg", "Detail sesi dengan QR dan tombol CETAK ULANG")],
      },
      {
        id: "unggah-ulang",
        title: "Gagal unggah? UNGGAH ULANG",
        body: "Tombol UNGGAH ULANG muncul kalau unggahan ke galeri online gagal, misalnya karena internet putus. Ketuk setelah internet kembali.",
        shots: [img("galeri-sesi", "unggah-ulang.jpg", "Tombol UNGGAH ULANG di detail sesi")],
        caption: "Ketuk GALERI untuk kembali ke daftar.",
      },
      {
        id: "hapus",
        title: "Hapus sesi",
        body: "Ketuk PILIH, ketuk sesi yang mau dihapus, ketuk HAPUS, lalu HAPUS sekali lagi untuk konfirmasi.",
        shots: [img("galeri-sesi", "hapus-konfirmasi.jpg", "Konfirmasi hapus sesi")],
        callout: {
          type: "warning",
          title: "Terhapus permanen dari laptop",
          text: "Sesi yang dihapus tidak bisa dikembalikan. Salinan di galeri online tetap ada sampai masa simpannya habis.",
        },
      },
    ],
    faqs: [["Sesi lama terhapus sendiri?", "Ya, sesuai lama simpan file di menu Pengiriman & bayar. Lihat panduan Kirim softcopy & atur harga."]],
    related: ["unduh-foto", "softcopy-harga", "kamera-printer"],
  },
  {
    slug: "kamera",
    no: "10",
    audience: "Pemilik booth",
    title: "Setelan kamera pro",
    summary: "Setelan mirrorless/DSLR supaya foto selalu tajam: flash + f/8 + fokus manual, atau tanpa flash dengan autofokus wajah.",
    overview:
      "Kamera pro menghasilkan foto paling bagus, asal setelannya pas untuk photobooth. Kamera mirrorless baru mencari fokus saat tombol shutter ditekan setengah — karena itu ada dua cara: kunci fokus manual dengan flash (paling disarankan), atau biarkan Sissi Booth menahan setengah shutter selama hitung mundur.",
    readTime: "5 menit baca",
    prerequisites: [
      "Kamera mirrorless/DSLR + kabel USB data (bukan kabel cas saja), atau capture card HDMI",
      "Flash/strobe di hot shoe (disarankan)",
      "Sissi Booth sudah aktif & bisa masuk menu admin",
    ],
    steps: [
      {
        id: "sambungkan",
        title: "Sambungkan kamera",
        body: "Lewat USB: di kamera Sony buka MENU › Jaringan › Sambungan USB (atau USB Connection) › PC Remote, lalu colok ke laptop. Kamera muncul sebagai “kamera pro” di menu Kamera & printer. Lewat HDMI: colok ke capture card, pilih capture card sebagai kamera.",
        shots: [img("kamera-printer", "kamera-pro.jpg", "Kamera pro Sony terdeteksi lewat USB di menu Kamera & printer")],
        points: [
          "Mode USB harus PC Remote — bukan Mass Storage/MTP (seperti flashdisk)",
          "Format file JPEG (atau RAW+JPEG). RAW saja tidak bisa dipakai",
          "Sudah diuji: Sony A7C. Canon & Nikon: segera diuji",
        ],
      },
      {
        id: "flash-f8",
        title: "Cara paling tajam: flash + f/8 + fokus manual",
        body: "Di bukaan f/8, area tajam sangat dalam: dari jarak ±2 meter (lensa 28–35 mm), tamu tetap tajam walau maju-mundur. Kunci fokus manual ke posisi tamu berdiri, maka kamera tidak perlu mencari fokus sama sekali — cepat dan selalu konsisten.",
        shots: [],
        points: [
          "Mode M · bukaan f/8 · rana 1/125 detik · ISO 100–400",
          "Fokus: AF sekali ke wajah orang di posisi berdiri, lalu pindah ke MF (jangan diubah lagi)",
          "Flash TTL atau manual ±1/8 daya, arahkan memantul ke langit-langit bila bisa",
        ],
        callout: {
          type: "warning",
          title: "Live view gelap?",
          text: "Matikan Live View Display › Setting Effect (OFF). Tanpa ini, layar booth menampilkan pencahayaan f/8 tanpa flash sehingga terlihat gelap, padahal hasil fotonya terang.",
        },
      },
      {
        id: "tanpa-flash",
        title: "Tanpa flash (latar bokeh): autofokus wajah",
        body: "Bukaan besar (f/1.8–f/2.8) membuat latar blur cantik, tapi area tajamnya tipis sehingga fokus harus tepat di wajah. Sissi Booth otomatis menahan setengah shutter selama hitung mundur, jadi kamera terus mengikuti wajah tamu dan memotret begitu fokus terkunci.",
        shots: [],
        points: [
          "Focus Mode: AF-C",
          "Focus Area: Wide",
          "Face/Eye Prior. in AF: On",
          "Priority Set in AF-C: AF (kamera tidak memotret sebelum fokus — mencegah foto blur)",
          "Cahaya ruangan harus cukup; ruangan gelap membuat autofokus lambat",
        ],
        callout: {
          type: "info",
          title: "Kenapa harus setengah shutter?",
          text: "Kamera mirrorless menghemat baterai: autofokus hanya berjalan saat tombol shutter ditekan setengah. Tanpa itu, live view diam di fokus terakhir — ini normal, bukan rusak.",
        },
      },
      {
        id: "tes",
        title: "Tes sebelum acara",
        body: "Buka admin › Kamera & printer, ketuk TES JEPRET beberapa kali sambil berdiri di posisi tamu. Perbesar hasilnya dan cek ketajaman mata. Di menu itu juga ada kartu “Setelan kamera yang disarankan” sebagai pengingat.",
        shots: [img("kamera-printer", "tes-jepret-hasil.jpg", "Hasil TES JEPRET dengan resolusi foto")],
        callout: { type: "tip", title: "Baterai & kartu", text: "Pakai dummy battery/adaptor listrik untuk acara panjang, dan pastikan kartu memori tidak penuh — foto juga tersimpan di kartu sebagai cadangan." },
      },
    ],
    faqs: [
      ["Foto kadang blur, kenapa?", "Biasanya fokus belum terkunci saat memotret. Pakai flash + f/8 + fokus manual, atau setel Priority Set in AF-C ke AF supaya kamera menunggu fokus."],
      ["Kamera terdeteksi tapi tidak bisa dipilih?", "Mode USB masih Mass Storage/MTP. Ubah ke PC Remote di menu kamera, lalu colok ulang."],
      ["Live view lambat atau patah-patah?", "Normal untuk USB (±15–25 fps). Untuk live view lebih mulus, pakai HDMI capture card."],
    ],
    related: ["kamera-printer", "cara-foto", "sesi-mode"],
  },
];

export const guideBySlug = (slug: string) => guides.find((g) => g.slug === slug);
