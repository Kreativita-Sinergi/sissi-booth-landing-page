/**
 * Semua teks & data landing page Sissi Booth. Ubah isi di sini — komponen hanya
 * menampilkan. Warna memakai nama token di globals.css (tanpa awalan `bg-`).
 */

export type Accent = "pink" | "blue" | "green" | "orange" | "lilac" | "yellow" | "white";

export const site = {
  name: "sissi booth",
  company: "Sissi Kreatif Teknologi",
  title: "Sissi Booth · Aplikasi Photobooth untuk Bisnis",
  description:
    "Aplikasi photobooth untuk usaha photobox & vendor event. Tamu foto, hias, dan bayar QRIS sendiri; softcopy lewat QR, tetap jalan walau internet putus.",
  email: "sissikreatifteknologi@gmail.com",
  phone: "085161462806",
  whatsapp: "https://wa.me/6285161462806",
} as const;

/** Gambar pratinjau tautan (src/app/opengraph-image.tsx). */
export const og = {
  alt: "Sissi Booth: aplikasi photobooth untuk usaha photobox & vendor event",
  chips: ["QRIS OTOMATIS", "TANPA INTERNET", "CETAK + QR + GIF"],
};

/** Diawali `/` agar tetap jalan dari halaman lain (mis. /panduan). */
export const nav = [
  { label: "Fitur", href: "/#fitur" },
  { label: "Cara kerja", href: "/#cara-kerja" },
  { label: "Paket", href: "/#paket" },
  { label: "Panduan", href: "/panduan" },
  { label: "FAQ", href: "/#faq" },
  { label: "Kontak", href: "/#kontak" },
] as const;

export const navCta = { label: "Hubungi kami", href: "/#kontak" };

export const hero = {
  kicker: "APLIKASI PHOTOBOOTH UNTUK BISNIS",
  title: "Photobox-mu,",
  highlight: "makin cuan!",
  body: "Aplikasi photobooth untuk usaha photobox & vendor event. Tamu bisa foto, hias, sampai bayar sendiri. Kamu tinggal isi ulang kertas printer.",
  primary: { label: "Minta demo", href: "#kontak" },
  secondary: { label: "Lihat fitur", href: "#fitur" },
  badges: [
    { label: "QRIS otomatis", dot: "green" },
    { label: "Tanpa internet", dot: "orange" },
  ] satisfies { label: string; dot: Accent }[],
};

export const marquee = ["QRIS otomatis", "Tanpa internet", "Cetak + QR + GIF", "Bingkai acara", "Softcopy lewat QR"];

export const problems = {
  kicker: "KENAL MASALAH INI?",
  title: "Pernah dapet chat kayak gini?",
  replyLabel: "Pakai Sissi Booth",
  chats: [
    {
      from: "Tamu",
      time: "23.41",
      accent: "pink",
      text: "Kak, softcopy aku belum masuk ya? 🥲",
      reply: "Tamu scan QR dan unduh sendiri, nggak perlu nunggu operator.",
    },
    {
      from: "EO acara",
      time: "19.05",
      accent: "blue",
      text: "Antrean booth udah panjang banget, bisa dipercepat?",
      reply: "Hitung mundur otomatis di tiap langkah, tamu nggak kelamaan.",
    },
    {
      from: "Tim venue",
      time: "14.20",
      accent: "orange",
      text: "Wi-Fi gedung lagi down ya kak, maaf 🙏",
      reply: "Booth tetap jalan. Softcopy dikirim lewat Wi-Fi booth sendiri.",
    },
    {
      from: "Operator",
      time: "22.10",
      accent: "lilac",
      text: "Kak, uang tunai kurang 20rb pas tutup...",
      reply: "Tamu bayar QRIS sendiri, lunas terdeteksi otomatis. Nggak ada uang tunai yang dihitung.",
    },
  ] satisfies { from: string; time: string; accent: Accent; text: string; reply: string }[],
};

export const steps = {
  kicker: "CARA KERJA",
  title: "Lima langkah, tamu jalan sendiri",
  items: [
    { label: "Mulai", image: "/screens/tunggu-l.png" },
    { label: "Pilih layout", image: "/screens/layout.png" },
    { label: "Cekrek!", image: "/screens/hitung.png" },
    { label: "Hias", image: "/screens/hias.png" },
    { label: "Ambil hasil", image: "/screens/hasil.png" },
  ],
};

/** Ikon kartu fitur (dipetakan ke lucide di komponen). */
export type FeatureIcon = "camera" | "layout" | "printer" | "gif" | "frame";

export const features = {
  kicker: "FITUR",
  title: "Bukan cuma jepret",
  hero: {
    title: "Hias sepuasnya",
    body: "Sembilan filter, dari B&W sampai Dreamy yang lembut berkilau, plus stiker lucu. Tamu bebas gaya sebelum fotonya dicetak.",
    image: "/screens/hias.png",
    alt: "Layar Hias Sissi Booth: pilihan filter dan stiker",
  },
  items: [
    { title: "Kamera bebas", body: "Webcam, capture card, sampai kamera DSLR.", icon: "camera", accent: "pink" },
    { title: "Pilih layout", body: "Strip Klasik, Strip Trio, Grid Bestie, atau Solo Besar.", icon: "layout", accent: "blue" },
    { title: "Cetak kilat", body: "Strip 2×6 dan kartu 4×6 langsung dari printer foto.", icon: "printer", accent: "white" },
    { title: "GIF boomerang", body: "Animasi lucu dari pose-pose tamu, ikut terkirim ke HP.", icon: "gif", accent: "lilac" },
    { title: "Bingkai acara", body: "Nama & logo acara tercetak di setiap strip.", icon: "frame", accent: "green" },
  ] satisfies { title: string; body: string; icon: FeatureIcon; accent: Accent }[],
};

export const modes = {
  kicker: "DUA MODE",
  title: "Disewa per acara, atau jalan sendiri?",
  items: [
    {
      title: "MODE KIOSK",
      subtitle: "Tamu bayar sendiri, langsung foto.",
      points: ["Pembayaran QRIS otomatis", "Booth jalan tanpa operator", "Harga per layout bisa diatur"],
      accent: "pink",
    },
    {
      title: "MODE EVENT",
      subtitle: "Disewa untuk acara, tamu foto gratis.",
      points: ["Bingkai & nama acara", "Batas cetak per acara", "Operator pegang kendali"],
      accent: "blue",
    },
  ] satisfies { title: string; subtitle: string; points: string[]; accent: Accent }[],
};

export const offline = {
  kicker: "TANPA INTERNET",
  title: "Internet putus? Tetap jalan.",
  items: [
    { title: "Ada sinyal", body: "Foto dikirim ke cloud. Tamu scan 1 QR dan bisa unduh kapan aja, sampai 30 hari.", highlight: false },
    { title: "Sissi Booth", body: "Ada sinyal atau nggak, aplikasi pilih sendiri cara kirimnya. Cetak nggak butuh internet.", highlight: true },
    { title: "Tanpa sinyal", body: "Booth bikin Wi-Fi sendiri. Tamu sambung lalu unduh langsung di tempat.", highlight: false },
  ],
};

export const admin = {
  kicker: "PANEL ADMIN",
  title: "Ganti acara? Atur dari satu layar.",
  image: "/screens/admin.png",
  points: [
    "Ganti bingkai & logo untuk tiap acara",
    "Atur harga, mode, dan waktu tiap langkah",
    "Lihat galeri sesi, cetak ulang, tampilkan QR lagi",
    "Terkunci PIN, tamu nggak bisa masuk",
  ],
};

/** Sel perbandingan: `ok` = memang bisa (diberi centang). */
export type CompareCell = { text: string; ok?: boolean };

export const comparison = {
  kicker: "BANDINGKAN",
  title: "Sissi Booth vs booth manual",
  columns: { manual: "Booth manual", ours: "Sissi Booth" },
  rows: [
    { label: "Cetak strip", manual: { text: "Bisa", ok: true }, ours: { text: "Bisa", ok: true } },
    {
      label: "Tamu bayar",
      manual: { text: "Operator terima tunai/transfer, cek manual" },
      ours: { text: "QRIS, lunas terdeteksi otomatis", ok: true },
    },
    {
      label: "Kirim softcopy",
      manual: { text: "Operator kirim satu per satu (AirDrop/WA)" },
      ours: { text: "Tamu scan QR sendiri", ok: true },
    },
    {
      label: "Internet venue putus",
      manual: { text: "Softcopy tertunda" },
      ours: { text: "Tetap jalan lewat Wi-Fi booth", ok: true },
    },
    {
      label: "Tamu kelamaan",
      manual: { text: "Operator harus menegur" },
      ours: { text: "Hitung mundur otomatis tiap langkah", ok: true },
    },
    { label: "Butuh operator", manual: { text: "Selalu" }, ours: { text: "Opsional (mode kiosk)", ok: true } },
    {
      label: "Ganti bingkai per acara",
      manual: { text: "Edit manual di software" },
      ours: { text: "Unggah PNG dari panel admin", ok: true },
    },
  ] satisfies { label: string; manual: CompareCell; ours: CompareCell }[],
  note: "Booth manual = operator + laptop + aplikasi kamera biasa.",
};

export const plans = {
  kicker: "PAKET LANGGANAN",
  title: "Bayar sesuai ramainya booth",
  subtitle: "Harian buat sekali acara. Bulanan atau tahunan buat booth yang jalan terus.",
  cta: "Tanya harga",
  items: [
    { name: "HARIAN", body: "Pas untuk satu acara atau coba-coba dulu.", accent: "pink", badge: "COCOK BUAT EVENT" },
    { name: "BULANAN", body: "Untuk booth yang rutin jalan tiap minggu.", accent: "blue", badge: null },
    { name: "TAHUNAN", body: "Untuk bisnis photobox jangka panjang.", accent: "green", badge: "SETAHUN TENANG" },
  ] satisfies { name: string; body: string; accent: Accent; badge: string | null }[],
};

export const audience = {
  kicker: "COCOK UNTUK",
  title: "Cocok buat siapa aja?",
  items: [
    { label: "Usaha photobox", accent: "pink", tilt: -4, use: "Bawa satu booth ke banyak acara, ganti bingkai tiap klien.", mode: "Event", plan: "Bulanan/Tahunan" },
    { label: "Vendor wedding & event", accent: "yellow", tilt: 3, use: "Nama pengantin dan tanggal tercetak di setiap strip.", mode: "Event", plan: "Harian/Bulanan" },
    { label: "Kafe & restoran", accent: "green", tilt: -2, use: "Booth di pojok kafe, tamu bayar QRIS sendiri, jadi pemasukan tambahan.", mode: "Kiosk", plan: "Bulanan" },
    { label: "Mal & tempat wisata", accent: "blue", tilt: 4, use: "Jalan seharian tanpa operator yang jaga.", mode: "Kiosk", plan: "Tahunan" },
    { label: "Brand activation", accent: "orange", tilt: -3, use: "Logo brand di strip, softcopy-nya ikut dibagikan tamu.", mode: "Event", plan: "Harian" },
    { label: "Sekolah & kampus", accent: "lilac", tilt: 2, use: "Pensi, wisuda, sampai dies natalis.", mode: "Event", plan: "Harian" },
  ] satisfies { label: string; accent: Accent; tilt: number; use: string; mode: string; plan: string }[],
  modeLabel: "Mode",
  planLabel: "Paket",
};

export const faq = {
  kicker: "FAQ",
  title: "Yang sering ditanya",
  items: [
    ["Perangkat apa yang dibutuhkan?", "Laptop/PC atau tablet, kamera, dan printer foto. Kameranya bebas: webcam, capture card, sampai DSLR."],
    [
      "Bisa pakai kamera mirrorless/DSLR?",
      "Bisa, lewat kabel USB (mode PC Remote, foto resolusi penuh) atau HDMI capture card. Untuk hasil paling tajam, pakai flash dengan bukaan f/8 dan fokus manual yang dikunci — tanpa repot urusan autofokus.",
    ],
    ["Bisa coba dulu sebelum langganan?", "Bisa. Hubungi tim Sissi untuk demo. Di versi demo kamu bisa foto, hias, dan cetak seperti biasa; hasilnya diberi tanda \"DEMO\"."],
    ["Foto tamu disimpan berapa lama?", "Softcopy di galeri online bisa diunduh selama 30 hari, lalu dihapus permanen. Salinannya juga tersimpan di galeri sesi pada perangkat booth."],
    ["Printer apa yang bisa dipakai?", "Printer foto yang terpasang di perangkatmu, termasuk printer dye-sub untuk strip 2×6 dan kartu 4×6."],
    ["Bisa pakai bingkai sendiri?", "Bisa. Unggah bingkai PNG berisi nama & logo acaramu dari panel admin, lalu atur posisi fotonya."],
    ["Ada paket apa saja?", "Harian, bulanan, dan tahunan. Hubungi tim Sissi untuk info harga."],
  ] as const,
  /** Tautan lanjutan di bawah jawaban tertentu (kunci = pertanyaan). */
  links: {
    "Bisa pakai kamera mirrorless/DSLR?": { label: "Lihat panduan setelan kamera", href: "/panduan/kamera" },
  } as Record<string, { label: string; href: string }>,
};

export const contact = {
  title: "Penasaran?",
  highlight: "Coba demonya!",
  body: "Tim Sissi tunjukkan cara kerjanya langsung, sekalian kasih info harga paket harian, bulanan, dan tahunan.",
  email: "Email kami",
  whatsapp: "Chat WhatsApp",
};

/** Halaman 404 (src/app/not-found.tsx). */
export const notFoundPage = {
  meta: "Halaman tidak ditemukan · Sissi Booth",
  kicker: "ERROR 404",
  title: "Yah, fotonya",
  highlight: "nggak ketemu!",
  body: "Halaman yang kamu cari nggak ada atau sudah dipindah. Coba balik ke beranda atau buka panduan.",
  home: { label: "Ke beranda", href: "/" },
  guide: { label: "Buka panduan", href: "/panduan" },
  sticker: "404",
};

export const footer = {
  tagline: "Aplikasi photobooth untuk usaha photobox & vendor event",
  // Konstan (bukan new Date()): halaman diprerender statis.
  year: 2026,
};
