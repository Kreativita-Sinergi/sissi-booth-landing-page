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
            <Link key={e.id} href={`/dashboard/acara/${e.id}`} className="group flex flex-col gap-3 rounded-xl border border-edge bg-surface p-5 shadow-card transition-colors hover:border-edge-strong">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-lg group-hover:underline">{e.name}</h2>
                  <p className="truncate text-sm text-subtle">{e.client_name || "—"}</p>
                </div>
                <span className="shrink-0 rounded-full bg-canvas px-2 py-0.5 text-xs font-medium text-subtle ring-1 ring-inset ring-edge">
                  {dayLabel(e.starts_on)}
                  {e.ends_on !== e.starts_on && ` – ${dayLabel(e.ends_on)}`}
                </span>
              </div>
              <dl className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-canvas p-2">
                  <dt className="text-subtle">Kontrak</dt>
                  <dd className="font-semibold text-sm">{rupiah(e.contract_amount)}</dd>
                </div>
                <div className="rounded-xl bg-canvas p-2">
                  <dt className="text-subtle">Sesi</dt>
                  <dd className="font-semibold text-sm">{number(e.transactions)}</dd>
                </div>
                <div className="rounded-xl bg-canvas p-2">
                  <dt className="text-subtle">Lembar</dt>
                  <dd className="font-semibold text-sm">{number(e.sheets)}</dd>
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
