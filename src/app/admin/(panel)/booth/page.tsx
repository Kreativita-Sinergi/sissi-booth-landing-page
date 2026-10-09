import Link from "next/link";
import { Suspense } from "react";
import { SearchBox } from "@/components/dash/search";
import { Card, ErrorBox, Loading, PageHeader, Pagination, PaperLevel, Table } from "@/components/dash/ui";
import { api, ApiError, qs } from "@/lib/dash/api";
import { ago, date, number, rupiah } from "@/lib/dash/format";
import { requestTime, type SP } from "@/lib/dash/period";
import type { Booth } from "@/lib/dash/types";

async function Content({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  let res;
  try {
    res = await api<{ booths: Booth[] }>("admin", `/admin/booths${qs({ q: sp.q, page: sp.page, per_page: 30 })}`);
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  const now = await requestTime();
  return (
    <>
      <PageHeader title="Booth" subtitle="Semua perangkat aktif, urut dari yang terakhir online." />
      <Card>
        <div className="mb-4">
          <SearchBox q={sp.q} placeholder="Cari booth / pemilik…" />
        </div>
        <Table head={["Booth", "Pemilik", "Platform", "Versi app", "Kertas", "Terakhir online", "Sesi 30 hari", "Aktif sejak"]} empty={res.data.booths.length === 0}>
          {res.data.booths.map((b) => {
            const online = b.last_seen_at && now - new Date(b.last_seen_at).getTime() < 24 * 3600_000;
            return (
              <tr key={b.id}>
                <td>
                  <span className="inline-flex items-center gap-2 font-bold">
                    <span className={`size-2.5 rounded-full border border-ink ${online ? "bg-booth-green" : "bg-line"}`} />
                    {b.name}
                  </span>
                </td>
                <td><Link href={`/admin/pelanggan/${b.owner_id}`} className="hover:underline">{b.owner_name}</Link></td>
                <td className="capitalize">{b.platform}</td>
                <td>{b.app_version || "—"}</td>
                <td><PaperLevel left={b.paper_left} capacity={b.paper_capacity} /></td>
                <td className="whitespace-nowrap">{ago(b.last_seen_at, now)}</td>
                <td className="whitespace-nowrap">{number(b.transactions_30d)} · {rupiah(b.revenue_30d)}</td>
                <td className="whitespace-nowrap text-muted">{date(b.created_at)}</td>
              </tr>
            );
          })}
        </Table>
        <Pagination page={res.meta.page} perPage={res.meta.per_page} total={res.meta.total} base="/admin/booth" params={sp} />
      </Card>
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
