import { Suspense } from "react";
import { Download } from "lucide-react";
import { FilterSelect, PeriodPicker } from "@/components/dash/client";
import { Badge, Card, ErrorBox, LinkButton, Loading, PageHeader, Pagination, Stat, Table } from "@/components/dash/ui";
import { api, ApiError, qs } from "@/lib/dash/api";
import { dateTime, LAYOUT_LABEL, number, rupiah } from "@/lib/dash/format";
import { periodFrom, type SP } from "@/lib/dash/period";
import type { Booth, Totals, Transaction } from "@/lib/dash/types";

async function Content({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const per = await periodFrom(sp);
  const filter = { ...per, device_id: sp.device_id, status: sp.status, mode: sp.mode };
  let res, booths: Booth[];
  try {
    const [tr, br] = await Promise.all([
      api<{ transactions: Transaction[]; totals: Totals }>("owner", `/owner/transactions${qs({ ...filter, page: sp.page, per_page: 30 })}`),
      api<{ booths: Booth[] }>("owner", "/owner/booths?per_page=100"),
    ]);
    res = tr;
    booths = br.data.booths;
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  const t = res.data.totals;
  return (
    <>
      <PageHeader title="Transaksi" subtitle="Setiap sesi foto di booth-mu." actions={<LinkButton href={`/dashboard/unduh/transaksi${qs(filter)}`} icon={Download} small download>Unduh CSV</LinkButton>} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <PeriodPicker from={per.from} to={per.to} />
        {booths.length > 1 && (
          <FilterSelect name="device_id" value={sp.device_id ?? ""} label="Booth" options={[{ value: "", label: "Semua booth" }, ...booths.map((b) => ({ value: b.id, label: b.name }))]} />
        )}
        <FilterSelect name="mode" value={sp.mode ?? ""} label="Mode" options={[{ value: "", label: "Semua mode" }, { value: "kiosk", label: "Kiosk (bayar)" }, { value: "event", label: "Event (gratis)" }]} />
        <FilterSelect name="status" value={sp.status ?? ""} label="Status" options={[{ value: "", label: "Semua status" }, { value: "completed", label: "Selesai" }, { value: "abandoned", label: "Batal" }]} />
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Sesi selesai" value={number(t.transactions)} tone="yellow" />
        <Stat label="Pendapatan kiosk" value={rupiah(t.revenue)} tone="green" />
        <Stat label="Lembar tercetak" value={number(t.sheets)} />
        <Stat label="Dengan GIF" value={number(t.gifs)} hint={t.abandoned ? `${t.abandoned} sesi batal` : undefined} />
      </div>
      <Card>
        <Table head={["Waktu", "Booth", "Kode", "Mode", "Layout", "Nominal", "Lembar", "Status"]} empty={res.data.transactions.length === 0}>
          {res.data.transactions.map((x) => (
            <tr key={x.id}>
              <td className="whitespace-nowrap">{dateTime(x.occurred_at)}</td>
              <td>{x.device_name}</td>
              <td className="font-mono text-xs">{x.session_code || "—"}</td>
              <td><Badge status={x.mode} /></td>
              <td className="whitespace-nowrap">{LAYOUT_LABEL[x.layout] ?? x.layout}{x.gif && " + GIF"}</td>
              <td className="whitespace-nowrap font-semibold">{x.amount ? rupiah(x.amount) : "—"}</td>
              <td>{x.sheets}</td>
              <td><Badge status={x.status} /></td>
            </tr>
          ))}
        </Table>
        <Pagination page={res.meta.page} perPage={res.meta.per_page} total={res.meta.total} base="/dashboard/transaksi" params={sp} />
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
