import { Suspense } from "react";
import { Download, ExternalLink, Images } from "lucide-react";
import { ConfirmAction, PeriodPicker } from "@/components/dash/client";
import { SearchBox } from "@/components/dash/search";
import { Card, Empty, ErrorBox, LinkButton, Loading, PageHeader, Pagination } from "@/components/dash/ui";
import { api, ApiError, qs } from "@/lib/dash/api";
import { date, dateTime } from "@/lib/dash/format";
import { deleteGallery } from "@/lib/dash/owner-actions";
import { periodFrom, type SP } from "@/lib/dash/period";
import type { GallerySession } from "@/lib/dash/types";

async function Content({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const per = await periodFrom(sp);
  let res;
  try {
    res = await api<{ sessions: GallerySession[] }>("owner", `/owner/gallery${qs({ ...per, q: sp.q, page: sp.page, per_page: 24 })}`);
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  return (
    <>
      <PageHeader
        title="Galeri online"
        subtitle="Foto tamu yang terunggah ke galeri QR. Terhapus otomatis setelah masa simpan habis."
        actions={
          res.data.sessions.length > 0 && (
            <LinkButton href={`/dashboard/unduh/foto${qs(per)}`} icon={Download} small download>
              Unduh semua (zip)
            </LinkButton>
          )
        }
      />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <PeriodPicker from={per.from} to={per.to} />
        <SearchBox q={sp.q} placeholder="Cari kode sesi…" keep={{ from: sp.from, to: sp.to }} />
      </div>
      {res.data.sessions.length === 0 ? (
        <Card>
          <Empty icon={Images} text="Belum ada foto di galeri online pada periode ini. Galeri terisi bila booth memakai pengiriman Cloud/Otomatis dan sedang online." />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {res.data.sessions.map((s) => (
            <div key={s.code} className="flex flex-col overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-hard-sm">
              <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-paper">
                {s.preview_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- gambar dari server galeri (domain dinamis)
                  <img src={s.preview_url} alt={`Hasil sesi ${s.code}`} loading="lazy" className="absolute inset-0 size-full object-contain p-3" />
                ) : (
                  <Images className="size-8 text-muted" />
                )}
              </div>
              <div className="flex flex-col gap-2 p-3">
                <p className="font-mono text-xs font-bold">{s.code}</p>
                <p className="text-xs text-muted">
                  {dateTime(s.created_at)} · {s.device_name}
                </p>
                <p className="text-xs text-muted">
                  {s.files} file · hapus otomatis {date(s.expires_at)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1 rounded-xl border-2 border-ink bg-white px-3 font-label text-xs uppercase shadow-hard-sm">
                    <ExternalLink className="size-3.5" strokeWidth={2.5} /> Buka
                  </a>
                  <ConfirmAction label="Hapus" title={`Hapus galeri ${s.code}?`} message="Foto di galeri online dihapus permanen. Tamu tidak bisa membuka QR-nya lagi." confirm="Hapus" action={deleteGallery} hidden={{ code: s.code }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={res.meta.page} perPage={res.meta.per_page} total={res.meta.total} base="/dashboard/galeri" params={sp} />
    </>
  );
}

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<Loading />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
