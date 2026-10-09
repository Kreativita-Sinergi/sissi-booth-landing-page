import { Suspense } from "react";
import { MonitorSmartphone } from "lucide-react";
import { ConfirmAction } from "@/components/dash/client";
import { Card, Empty, ErrorBox, Loading, PageHeader, PaperLevel } from "@/components/dash/ui";
import { requestTime } from "@/lib/dash/period";
import { api, ApiError } from "@/lib/dash/api";
import { ago, date, number, rupiah } from "@/lib/dash/format";
import { releaseBooth } from "@/lib/dash/owner-actions";
import type { Booth } from "@/lib/dash/types";

async function Content() {
  let booths: Booth[];
  try {
    booths = (await api<{ booths: Booth[] }>("owner", "/owner/booths?per_page=100")).data.booths;
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  const now = await requestTime();
  return (
    <>
      <PageHeader title="Booth saya" subtitle="Laptop/tablet yang memakai lisensimu." />
      {booths.length === 0 ? (
        <Card>
          <Empty icon={MonitorSmartphone} text="Belum ada booth aktif. Aktifkan lisensi di aplikasi: Admin › Lisensi › tempel kunci › AKTIFKAN." />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {booths.map((b) => {
            const online = b.last_seen_at && now - new Date(b.last_seen_at).getTime() < 24 * 3600_000;
            return (
              <Card key={b.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="flex items-center gap-2 font-label text-lg">
                      <span className={`size-3 shrink-0 rounded-full border-2 border-ink ${online ? "bg-booth-green" : "bg-line"}`} />
                      <span className="truncate">{b.name}</span>
                    </h2>
                    <p className="text-sm text-muted">
                      <span className="capitalize">{b.platform}</span>
                      {b.app_version && ` · versi ${b.app_version}`} · aktif sejak {date(b.created_at)}
                    </p>
                  </div>
                  <ConfirmAction
                    label="Lepas"
                    title={`Lepas booth "${b.name}"?`}
                    message="Booth ini berhenti memakai lisensi dan slotnya kosong lagi, misalnya untuk pindah ke laptop baru."
                    confirm="Lepas booth"
                    action={releaseBooth}
                    hidden={{ id: b.id }}
                  />
                </div>
                <div className="mt-4">
                  <p className="mb-1 text-xs font-bold uppercase text-muted">Sisa kertas</p>
                  <PaperLevel left={b.paper_left} capacity={b.paper_capacity} />
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-paper p-2">
                    <dt className="text-muted">Online</dt>
                    <dd className="font-bold">{ago(b.last_seen_at, now)}</dd>
                  </div>
                  <div className="rounded-xl bg-paper p-2">
                    <dt className="text-muted">Sesi 30 hari</dt>
                    <dd className="font-label">{number(b.transactions_30d)}</dd>
                  </div>
                  <div className="rounded-xl bg-paper p-2">
                    <dt className="text-muted">Pendapatan</dt>
                    <dd className="font-label">{rupiah(b.revenue_30d)}</dd>
                  </div>
                </dl>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Content />
    </Suspense>
  );
}
