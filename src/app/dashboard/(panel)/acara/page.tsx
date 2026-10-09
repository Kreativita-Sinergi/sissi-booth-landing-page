import Link from "next/link";
import { Suspense } from "react";
import { CalendarHeart } from "lucide-react";
import { NewEventButton } from "@/components/dash/owner-forms";
import { Card, Empty, ErrorBox, Loading, PageHeader, Pagination } from "@/components/dash/ui";
import { api, ApiError, qs } from "@/lib/dash/api";
import { dayLabel, number, rupiah } from "@/lib/dash/format";
import type { SP } from "@/lib/dash/period";
import type { Booth, BoothEvent } from "@/lib/dash/types";

async function Content({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  let res, booths: Booth[];
  try {
    const [er, br] = await Promise.all([
      api<{ events: BoothEvent[] }>("owner", `/owner/events${qs({ page: sp.page, per_page: 24 })}`),
      api<{ booths: Booth[] }>("owner", "/owner/booths?per_page=100"),
    ]);
    res = er;
    booths = br.data.booths;
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  const list = booths.map((b) => ({ id: b.id, name: b.name }));
  return (
    <>
      <PageHeader title="Acara" subtitle="Catat acara mode event (nikahan, ulang tahun, gathering) beserta nilai kontraknya." actions={<NewEventButton booths={list} />} />
      {res.data.events.length === 0 ? (
        <Card>
          <Empty icon={CalendarHeart} text="Belum ada acara. Tambahkan acara supaya nilai kontrak masuk ke laporan keuntungan dan foto acara bisa diunduh sekaligus." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {res.data.events.map((e) => (
            <Link key={e.id} href={`/dashboard/acara/${e.id}`} className="group flex flex-col gap-3 rounded-2xl border-2 border-ink bg-white p-5 shadow-hard-sm transition-transform hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-label text-lg group-hover:underline">{e.name}</h2>
                  <p className="truncate text-sm text-muted">{e.client_name || "—"}</p>
                </div>
                <span className="shrink-0 rounded-full border-2 border-ink bg-booth-yellow px-2 py-0.5 text-xs font-bold">
                  {dayLabel(e.starts_on)}
                  {e.ends_on !== e.starts_on && ` – ${dayLabel(e.ends_on)}`}
                </span>
              </div>
              <dl className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-paper p-2">
                  <dt className="text-muted">Kontrak</dt>
                  <dd className="font-label text-sm">{rupiah(e.contract_amount)}</dd>
                </div>
                <div className="rounded-xl bg-paper p-2">
                  <dt className="text-muted">Sesi</dt>
                  <dd className="font-label text-sm">{number(e.transactions)}</dd>
                </div>
                <div className="rounded-xl bg-paper p-2">
                  <dt className="text-muted">Lembar</dt>
                  <dd className="font-label text-sm">{number(e.sheets)}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      )}
      <Pagination page={res.meta.page} perPage={res.meta.per_page} total={res.meta.total} base="/dashboard/acara" params={sp} />
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
