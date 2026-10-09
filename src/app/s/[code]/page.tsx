import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ApiError, call } from "@/lib/dash/api";
import { Footer, Frame } from "./frame";
import "./galeri.css";

/**
 * Galeri unduh QR `booth.sissi.id/s/KODE` (dulu dirender server Go). Data dari API publik
 * `/public/sessions/{code}`; gambar diambil langsung dari server file (apibooth) agar kuota
 * Vercel hanya untuk HTML.
 */

type FileView = { id: string; kind: "strip" | "gif" | "photo"; size_bytes: number; url: string; download_url: string };
type View = { code: string; expires_at: string; files: FileView[] };

export const metadata: Metadata = { title: "Fotomu dari Sissi Booth", robots: { index: false, follow: false } };

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function tanggal(iso: string) {
  const d = new Date(new Date(iso).getTime() + 7 * 3600_000);
  return `${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function size(n: number) {
  return n >= 1 << 20 ? `${(n / (1 << 20)).toFixed(1).replace(".", ",")} MB` : `${Math.ceil(n / 1024)} KB`;
}

/* eslint-disable @next/next/no-img-element -- gambar galeri dari server file (domain dinamis, ukuran asli) */
async function Gallery({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[0-9A-Za-z]{6,32}$/.test(code)) notFound();
  let v: View;
  try {
    v = (await call<View>(`/public/sessions/${encodeURIComponent(code)}`)).data;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  const strips = v.files.filter((f) => f.kind === "strip");
  const gifs = v.files.filter((f) => f.kind === "gif");
  const photos = v.files.filter((f) => f.kind === "photo");
  return (
    <main>
      <div className="top">
        <a className="logo" href="https://booth.sissi.id">sissi booth</a>
      </div>
      <h1>Hore, fotomu</h1>
      <div className="hl">udah jadi!</div>
      <div>
        <span className="chip"><span className="dot o" />Tersimpan sampai {tanggal(v.expires_at)}</span>
      </div>
      {strips.map((f) => (
        <section key={f.id} className="card">
          <span className="kind">Strip foto</span>
          <a className="prev strip" href={f.url}><img src={f.url} alt="Strip foto" /></a>
          <div className="row"><span className="size">{size(f.size_bytes)}</span><a className="btn" href={f.download_url} download>Unduh</a></div>
        </section>
      ))}
      {gifs.map((f) => (
        <section key={f.id} className="card">
          <span className="kind gif">GIF boomerang</span>
          <a className="prev" href={f.url}><img src={f.url} alt="GIF boomerang" loading="lazy" /></a>
          <div className="row"><span className="size">{size(f.size_bytes)}</span><a className="btn" href={f.download_url} download>Unduh</a></div>
        </section>
      ))}
      {photos.length > 0 && (
        <>
          <h2>Foto satu-satu</h2>
          <div className="grid">
            {photos.map((f, i) => (
              <section key={f.id} className="card">
                <a href={f.url}><img src={f.url} alt={`Foto ${i + 1}`} loading="lazy" /></a>
                <b>Foto {i + 1}</b>
                <a className="btn" href={f.download_url} download>Unduh</a>
              </section>
            ))}
          </div>
        </>
      )}
      {v.files.length === 0 ? (
        <section className="card empty"><p>Fotonya masih dikirim dari booth. Coba muat ulang sebentar lagi, ya!</p></section>
      ) : (
        <p className="tip">Tips: kalau tombol unduh nggak jalan, tekan lama fotonya lalu pilih &quot;Simpan ke Foto&quot;.</p>
      )}
    </main>
  );
}

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Frame>
      <Suspense fallback={<main><div className="top"><span className="logo">sissi booth</span></div><h1>Sebentar…</h1></main>}>
        <Gallery params={params} />
      </Suspense>
      <Footer />
    </Frame>
  );
}
