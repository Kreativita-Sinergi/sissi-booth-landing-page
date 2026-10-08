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
    "Aplikasi photobooth siap pakai untuk usaha photobox & vendor event: tampilan Gen Z, pembayaran QRIS otomatis, cetak strip, softcopy lewat QR, dan tetap jalan tanpa internet. Untuk Windows & Android.",
  email: "sissikreatifteknologi@gmail.com",
  phone: "0851-6146-2806",
  whatsapp: "https://wa.me/6285161462806",
} as const;

export const nav = [
  { label: "Fitur", href: "#fitur" },
  { label: "Cara kerja", href: "#cara-kerja" },
  { label: "Paket", href: "#paket" },
  { label: "FAQ", href: "#faq" },
  { label: "Kontak", href: "#kontak" },
] as const;

export const hero = {
  kicker: "APLIKASI PHOTOBOOTH UNTUK BISNIS",
  title: "Photobox-mu,",
  highlight: "makin cuan!",
  body: "Aplikasi photobooth siap pakai untuk usaha photobox & vendor event. Tampilan ceria yang bikin tamu betah, pembayaran QRIS otomatis, dan tetap jalan tanpa internet.",
  primary: { label: "Minta demo", href: "#kontak" },
  secondary: { label: "Lihat fitur", href: "#fitur" },
  badges: [
    { label: "Windows & Android", dot: "blue" },
    { label: "QRIS otomatis", dot: "green" },
    { label: "Anti-offline", dot: "orange" },
  ] satisfies { label: string; dot: Accent }[],
};

export const marquee = ["Windows & Android", "QRIS otomatis", "Anti-offline", "Cetak + QR + GIF", "Bingkai acara"];

export const problems = {
  kicker: "KENAL MASALAH INI?",
  title: "Booth ramai itu seru — kalau semuanya lancar.",
  pairs: [
    ["Internet venue lemot, softcopy nggak kekirim.", "Softcopy tetap sampai — lewat cloud atau Wi-Fi booth."],
    ["Tampilan software kaku & jadul.", "Desain Gen Z yang bikin tamu pengin foto lagi."],
    ["Operator harus jaga terus.", "Mode kiosk + QRIS otomatis, booth jalan sendiri."],
    ["Tamu kelamaan, antrean macet.", "Hitung mundur otomatis di tiap langkah."],
  ] as const,
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

export const features = {
  kicker: "FITUR",
  title: "Fitur yang bikin tamu ketagihan",
  items: [
    { title: "Kamera bebas", body: "Webcam, capture card, sampai kamera DSLR.", accent: "pink" },
    { title: "Cetak strip kilat", body: "Strip 2×6 & kartu 4×6 langsung dari printer foto.", accent: "blue" },
    { title: "Softcopy via QR", body: "Foto, strip & GIF boomerang langsung ke HP tamu.", accent: "green" },
    { title: "Hias sepuasnya", body: "Filter, mempercantik kulit halus & stiker lucu.", accent: "orange" },
    { title: "Bingkai acara", body: "Nama & logo acara tercetak di setiap strip.", accent: "lilac" },
    { title: "Galeri sesi", body: "Semua sesi tersimpan — cetak ulang & QR lagi.", accent: "white" },
  ] satisfies { title: string; body: string; accent: Accent }[],
};

export const modes = {
  kicker: "DUA MODE",
  title: "Satu aplikasi, dua cara cuan",
  items: [
    {
      title: "MODE KIOSK",
      subtitle: "Tamu bayar sendiri, langsung foto.",
      points: ["Pembayaran QRIS otomatis", "Booth jalan tanpa operator", "Harga per layout bisa diatur"],
      fit: "Kafe · mal · tempat wisata",
      accent: "pink",
    },
    {
      title: "MODE EVENT",
      subtitle: "Disewa untuk acara, tamu foto gratis.",
      points: ["Bingkai & nama acara", "Batas cetak per acara", "Operator pegang kendali"],
      fit: "Nikahan · ulang tahun · gathering",
      accent: "blue",
    },
  ] satisfies { title: string; subtitle: string; points: string[]; fit: string; accent: Accent }[],
};

export const offline = {
  kicker: "ANTI-OFFLINE",
  title: "Internet putus? Tetap jalan.",
  items: [
    { title: "Ada sinyal", body: "Foto dikirim ke cloud. Tamu scan 1 QR dan bisa unduh kapan aja — sampai 30 hari.", highlight: false },
    { title: "Sissi Booth", body: "Otomatis memilih jalur terbaik. Cetak tetap jalan 100% offline.", highlight: true },
    { title: "Tanpa sinyal", body: "Booth bikin Wi-Fi sendiri. Tamu sambung lalu unduh langsung di tempat.", highlight: false },
  ],
};

export const admin = {
  kicker: "PANEL ADMIN",
  title: "Semua bisa kamu atur",
  image: "/screens/admin.png",
  points: [
    "Mode kiosk atau event",
    "Waktu otomatis tiap langkah",
    "Template bingkai & logo acara",
    "Kamera & printer",
    "Pengiriman & harga paket foto",
    "Galeri sesi & cetak ulang",
    "Panel admin dikunci PIN",
  ],
};

export const comparison = {
  kicker: "BANDINGKAN",
  title: "Sissi Booth vs cara lama",
  columns: ["Yang kamu dapat", "Cara lama", "Sissi Booth"],
  rows: [
    "Tampilan kekinian & lucu",
    "Tetap jalan tanpa internet",
    "Softcopy otomatis lewat QR",
    "Bayar QRIS otomatis",
    "Booth jalan tanpa operator",
    "Waktu otomatis tiap langkah",
    "Bahasa Indonesia & tim lokal",
  ],
  note: "“Cara lama” = operator manual + software photobooth umum.",
};

export const plans = {
  kicker: "PAKET LANGGANAN",
  title: "Pilih paket sesukamu",
  subtitle: "Langganan fleksibel — sesuaikan dengan ramainya usahamu.",
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
    { label: "Usaha photobox", accent: "pink", tilt: -4 },
    { label: "Vendor wedding & event", accent: "white", tilt: 3 },
    { label: "Kafe & restoran", accent: "green", tilt: -2 },
    { label: "Mal & tempat wisata", accent: "blue", tilt: 4 },
    { label: "Brand activation", accent: "orange", tilt: -3 },
    { label: "Sekolah & kampus", accent: "lilac", tilt: 2 },
  ] satisfies { label: string; accent: Accent; tilt: number }[],
};

export const faq = {
  kicker: "FAQ",
  title: "Yang sering ditanya",
  items: [
    ["Perangkat apa yang dibutuhkan?", "Laptop/PC Windows atau tablet Android, kamera, dan printer foto. Kameranya bebas: webcam, capture card, sampai DSLR."],
    ["Perlu internet nggak?", "Nggak wajib. Foto, cetak, dan softcopy lewat Wi-Fi booth tetap jalan tanpa internet. Kalau ada internet, softcopy dikirim lewat cloud dan bisa diunduh sampai 30 hari."],
    ["Printer apa yang bisa dipakai?", "Printer foto yang terpasang di perangkatmu, termasuk printer dye-sub untuk strip 2×6 dan kartu 4×6."],
    ["Bisa pakai bingkai sendiri?", "Bisa. Unggah bingkai PNG berisi nama & logo acaramu dari panel admin, lalu atur posisi fotonya."],
    ["Gimana tamu bayar?", "Di mode kiosk, tamu bayar sendiri lewat QRIS — status lunas otomatis dan sesi langsung mulai."],
    ["Ada paket apa saja?", "Harian, bulanan, dan tahunan. Hubungi tim Sissi untuk info harga."],
  ] as const,
};

export const contact = {
  title: "Yuk, bikin booth-mu",
  highlight: "makin seru!",
  body: "Mau demo, tanya fitur, atau info harga paket harian, bulanan & tahunan? Hubungi tim Sissi.",
  email: "Email kami",
  whatsapp: "Chat WhatsApp",
};

export const footer = {
  tagline: "Aplikasi photobooth untuk Windows & Android",
  // Konstan (bukan new Date()): halaman diprerender statis.
  year: 2026,
};
