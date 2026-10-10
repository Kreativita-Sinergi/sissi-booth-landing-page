"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, ImagePlus, ImageUp, Layers, MousePointer2, PenTool, ScanSearch } from "lucide-react";
import { cn } from "@/components/shared/cn";
import { Button, Dialog } from "./client";
import { FrameTips } from "./template-editor-parts";

const SEEN_KEY = "sb-template-guide-v1";
const MOD = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";

type Step = { icon: typeof Eye; title: string; body: React.ReactNode };

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="whitespace-nowrap rounded-md bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-fg ring-1 ring-inset ring-edge">{children}</kbd>;
}

function Points({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2 text-sm text-subtle">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

const B = ({ children }: { children: React.ReactNode }) => <b className="font-medium text-fg">{children}</b>;

const STEPS: Step[] = [
  {
    icon: ImageUp,
    title: "Siapkan gambar desainmu",
    body: (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-subtle">
          Template = <B>gambar desain</B> (latar / bingkai) + <B>posisi foto</B>. Buat desainmu dengan ukuran di bawah. Unduh <B>panduan</B>{" "}
          (PNG berisi ukuran & garis aman) untuk memudahkanmu membuat atau mengedit template.
        </p>
        <FrameTips />
      </div>
    ),
  },
  {
    icon: ScanSearch,
    title: "Unggah — posisi foto terdeteksi otomatis",
    body: (
      <Points
        items={[
          <>
            Klik <B>Pilih gambar</B> atau seret file ke kanvas. Area <B>hijau terang (#00FF00)</B> atau bagian <B>transparan</B> pada PNG langsung jadi
            tempat foto, apa pun bentuknya.
          </>,
          <>Ukuran tidak pas? Editor menawarkan <B>Atur gambar</B>: geser & zoom gambarmu ke ukuran cetak, ruang kosong diberi warna.</>,
          <>JPG / gambar tanpa lubang tetap bisa: gambar dipakai sebagai latar dan foto kamu taruh sendiri di atasnya.</>,
          <>Salah unggah? Tekan urungkan ({MOD} Z) — gambar sebelumnya kembali.</>,
        ]}
      />
    ),
  },
  {
    icon: MousePointer2,
    title: "Atur posisi foto",
    body: (
      <Points
        items={[
          <>
            <B>Elemen → Tambah foto</B>: kotak, sudut bulat, bulat, hati, bintang. Klik foto untuk memilih; seret untuk memindah, tarik sudut untuk
            ubah ukuran, bulatan atas untuk memutar.
          </>,
          <>
            <B>Magnet</B> menempelkan foto ke tepi, tengah & foto lain (garis merah). Tahan <Kbd>Alt</Kbd> untuk mematikannya.
          </>,
          <>
            Pilih beberapa: <Kbd>Shift</Kbd> + klik atau seret area kosong → rata kiri/tengah/kanan, jarak sama, samakan ukuran.
          </>,
          <>
            <B>Bawah bingkai</B> = foto terlihat lewat lubang. <B>Atas bingkai</B> = foto menempel di atas desain seperti stiker.
          </>,
          <>
            Tab <B>Lapisan</B> menampilkan semua elemen dari depan ke belakang. Nomor foto = <B>urutan jepret</B>; ubah dengan panah di sana
            atau tombol urutkan otomatis.
          </>,
        ]}
      />
    ),
  },
  {
    icon: PenTool,
    title: "Bentuk foto sendiri",
    body: (
      <Points
        items={[
          <>
            <B>Pen (lengkung)</B> seperti Photoshop: klik = titik sudut, klik + seret = lengkung halus, klik titik pertama untuk menutup.
          </>,
          <>
            <B>Seret bebas</B>: tahan & seret seperti spidol — hasilnya dihaluskan otomatis.
          </>,
          <>
            Klik dua kali bentuknya untuk mengedit titik & lengkung. <Kbd>Alt</Kbd> + seret kendali = patahkan sudut; tombol <B>Haluskan</B> /{" "}
            <B>Sudut tajam</B> untuk semua titik sekaligus.
          </>,
        ]}
      />
    ),
  },
  {
    icon: ImagePlus,
    title: "Gambar hiasan di atas foto",
    body: (
      <Points
        items={[
          <>
            <B>Elemen → Gambar hiasan</B>: tambahkan bunga, logo, stiker, atau tulisan (PNG transparan) yang tampil <B>di atas foto & bingkai</B>.
          </>,
          <>Tarik sudut = ubah ukuran proporsional (Shift = bebas). Susunan antar gambar diatur di tab Lapisan.</>,
          <>Hiasan yang menyatu dengan desain (mis. bunga yang menutupi tepi foto) juga bisa langsung digambar di PNG bingkai.</>,
        ]}
      />
    ),
  },
  {
    icon: Eye,
    title: "Cek & simpan",
    body: (
      <Points
        items={[
          <>
            <B>Pratinjau</B> (<Kbd>P</Kbd>) menampilkan template dengan foto contoh, persis urutan lapisan di booth.
          </>,
          <>
            Isi <B>nama</B> di bar atas & <B>kategori</B> di panel Info, lalu <B>Simpan</B> (<Kbd>{MOD} S</Kbd>). Titik merah = masih ada yang perlu
            dilengkapi.
          </>,
          <>
            Semua pintasan: ikon keyboard di bar atas atau tekan <Kbd>?</Kbd>. Panduan ini bisa dibuka lagi lewat tombol <B>Panduan</B>.
          </>,
        ]}
      />
    ),
  },
];

/**
 * Panduan editor template: dialog langkah demi langkah. Terbuka otomatis saat pertama kali (disimpan di localStorage),
 * bisa dibuka lagi lewat `open`.
 */
export function TemplateGuide({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) onOpenChange(true);
    } catch {
      /* penyimpanan diblokir: jangan paksa tampil */
    }
    // Sekali saat editor dibuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* abaikan */
    }
    onOpenChange(false);
    setStep(0);
  }

  const s = STEPS[step];
  const last = step === STEPS.length - 1;
  return (
    <Dialog open={open} onClose={close} title="Panduan membuat template" wide>
      <div className="flex flex-col gap-4">
        <ol className="flex gap-1.5" aria-label="Langkah">
          {STEPS.map((x, i) => (
            <li key={x.title} className="flex-1">
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={i === step ? "step" : undefined}
                title={x.title}
                className={cn("block h-1.5 w-full rounded-full", i <= step ? "bg-primary" : "bg-edge hover:bg-edge-strong")}
              />
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <s.icon className="size-5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-xs font-medium text-subtle">
              Langkah {step + 1} dari {STEPS.length}
            </p>
            <h3 className="text-base font-semibold">{s.title}</h3>
          </div>
        </div>
        {/* Tinggi tetap (desktop) agar dialog & tombol tidak melompat antar langkah; isi panjang bergulir di dalam. */}
        <div className="min-h-56 sm:h-[23rem] sm:overflow-y-auto sm:pr-1">{s.body}</div>
        <div className="flex items-center justify-between gap-2 border-t border-edge pt-4">
          <Button small onClick={close}>
            {last ? "Tutup" : "Lewati"}
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button small onClick={() => setStep(step - 1)}>
                <ArrowLeft className="size-4" strokeWidth={2} /> Sebelumnya
              </Button>
            )}
            <Button small tone="blue" onClick={() => (last ? close() : setStep(step + 1))}>
              {last ? (
                <>
                  <Layers className="size-4" strokeWidth={2} /> Mulai membuat
                </>
              ) : (
                <>
                  Berikutnya <ArrowRight className="size-4" strokeWidth={2} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
