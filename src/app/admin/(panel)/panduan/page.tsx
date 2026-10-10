import type { LucideIcon } from "lucide-react";
import { Activity, KeyRound, MessageCircle, MonitorSmartphone, UserPlus, WalletCards } from "lucide-react";
import { Card, LinkButton, PageHeader } from "@/components/dash/ui";
import { cn } from "@/components/shared/cn";

/** Panduan singkat admin Sissi: alur pelanggan baru dari daftar sampai bayar + pemantauan. */

type Step = { icon: LucideIcon; tone: string; title: string; where: string; points: string[]; link?: [string, string] };

const STEPS: Step[] = [
  {
    icon: UserPlus,
    tone: "bg-warning-soft text-warning",
    title: "Daftarkan pemilik booth",
    where: "Pelanggan › Tambah pemilik",
    points: [
      "Isi nama usaha, email (dipakai masuk dashboard), no. WhatsApp, dan kata sandi awal.",
      "Kirim email + kata sandi awal ke pemilik lewat WA. Pemilik bisa menggantinya di dashboard › Pengaturan.",
    ],
    link: ["/admin/pelanggan", "Buka pelanggan"],
  },
  {
    icon: KeyRound,
    tone: "bg-primary-soft text-primary",
    title: "Buat lisensi",
    where: "Pelanggan › (pilih pemilik) › Lisensi › Buat lisensi",
    points: [
      "Pilih paket, jumlah periode, dan maks. booth (jumlah laptop/tablet yang boleh aktif bersamaan).",
      "Kunci lisensi hanya tampil SEKALI. Salin sebelum dialog ditutup.",
    ],
  },
  {
    icon: MessageCircle,
    tone: "bg-success-soft text-success",
    title: "Kirim kunci ke pemilik",
    where: "Dialog kunci lisensi › Kirim via WA",
    points: [
      "Pesan WA sudah berisi kunci, cara aktivasi, dan tautan dashboard. Tinggal kirim.",
      "Di booth: aplikasi Sissi Booth › Admin › Lisensi › tempel kunci › AKTIFKAN (butuh internet sekali; setelah itu boleh offline hingga 7 hari).",
    ],
  },
  {
    icon: WalletCards,
    tone: "bg-danger-soft text-danger",
    title: "Catat pembayaran",
    where: "Pelanggan › (pemilik) › Catat pembayaran — atau menu Pembayaran langganan",
    points: [
      "Catat setelah transfer benar-benar masuk: nominal, metode, tanggal, catatan (mis. bank & nama pengirim).",
      "Pilih lisensi + jumlah periode untuk memperpanjang sekaligus. Periode 0 = hanya mencatat bayar.",
    ],
    link: ["/admin/pembayaran", "Buka pembayaran"],
  },
];

const WATCH: Step[] = [
  {
    icon: Activity,
    tone: "bg-warning-soft text-warning",
    title: "Pantau tiap minggu",
    where: "Ringkasan & Booth",
    points: [
      "Ringkasan: daftar lisensi yang segera habis. Hubungi pemiliknya lewat tombol WA sebelum habis.",
      "Booth: versi aplikasi, terakhir online, dan sisa kertas. Booth yang lama tidak online mungkin perlu dibantu.",
    ],
    link: ["/admin", "Buka ringkasan"],
  },
  {
    icon: MonitorSmartphone,
    tone: "bg-info-soft text-info",
    title: "Masalah yang sering muncul",
    where: "Pelanggan › (pemilik)",
    points: [
      "Pemilik lupa sandi → Reset sandi, lalu kirim sandi baru lewat WA.",
      "Kunci hilang / bocor → Buat kunci baru (kunci lama langsung tidak berlaku), kirim ulang ke pemilik.",
      "Tambah booth → Atur lisensi › Maks. booth. Hentikan sementara → Atur › Status.",
      "Perpanjang gratis (kompensasi) → Perpanjang (tanpa catat bayar).",
    ],
  },
];

function StepCard({ step, n }: { step: Step; n?: number }) {
  const Icon = step.icon;
  return (
    <Card className="h-full">
      <div className="flex items-start gap-4">
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", step.tone)}>
          <Icon className="size-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-lg">
            {n !== undefined && <span className="mr-2 text-subtle">{n}.</span>}
            {step.title}
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-subtle">{step.where}</p>
          <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm">
            {step.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          {step.link && (
            <div className="mt-4">
              <LinkButton href={step.link[0]} small>
                {step.link[1]}
              </LinkButton>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Page() {
  return (
    <>
      <PageHeader title="Panduan admin" subtitle="Alur pelanggan baru: daftar → lisensi → kirim kunci → catat bayar." />
      <div className="grid gap-4 lg:grid-cols-2">
        {STEPS.map((s, i) => (
          <StepCard key={s.title} step={s} n={i + 1} />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {WATCH.map((s) => (
          <StepCard key={s.title} step={s} />
        ))}
      </div>
    </>
  );
}
