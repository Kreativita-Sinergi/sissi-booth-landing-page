import Link from "next/link";
import { Suspense } from "react";
import { Download } from "lucide-react";
import { FilterSelect, PeriodPicker } from "@/components/dash/client";
import { Badge, Card, ErrorBox, LinkButton, Loading, PageHeader, Pagination, Stat, Table } from "@/components/dash/ui";
import { api, ApiError, qs } from "@/lib/dash/api";
import { dateTime, LAYOUT_LABEL, number, rupiah } from "@/lib/dash/format";
import { periodFrom, type SP } from "@/lib/dash/period";
import type { Customer, Totals, Transaction } from "@/lib/dash/types";

async function Content({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const per = await periodFrom(sp);
  const filter = { ...per, owner_id: sp.owner_id, status: sp.status, mode: sp.mode };
  let res, owners: Customer[];
  try {
    const [tr, or] = await Promise.all([
      api<{ transactions: Transaction[]; totals: Totals }>("admin", `/admin/transactions${qs({ ...filter, page: sp.page, per_page: 30 })}`),
      api<{ customers: Customer[] }>("admin", `/admin/customers${qs({ per_page: 100 })}`),
    ]);
    res = tr;
    owners = or.data.customers;
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  const t = res.data.totals;
  return (
    <>
      <PageHeader title="Transaksi booth" subtitle="Semua sesi foto dari semua booth (tanpa foto)." actions={<LinkButton href={`/admin/unduh/transaksi${qs(filter)}`} icon={Download} small download>CSV</LinkButton>} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <PeriodPicker from={per.from} to={per.to} />
        <FilterSelect name="owner_id" value={sp.owner_id ?? ""} label="Pemilik" options={[{ value: "", label: "Semua pemilik" }, ...owners.map((o) => ({ value: o.id, label: o.name }))]} />
        <FilterSelect name="mode" value={sp.mode ?? ""} label="Mode" options={[{ value: "", label: "Semua mode" }, { value: "kiosk", label: "Kiosk" }, { value: "event", label: "Event" }]} />
        <FilterSelect name="status" value={sp.status ?? ""} label="Status" options={[{ value: "", label: "Semua status" }, { value: "completed", label: "Selesai" }, { value: "abandoned", label: "Batal" }]} />
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Sesi selesai" value={number(t.transactions)} tone="yellow" />
        <Stat label="Pendapatan kiosk" value={rupiah(t.revenue)} tone="green" />
        <Stat label="Lembar tercetak" value={number(t.sheets)} />
        <Stat label="Sesi batal" value={number(t.abandoned)} />
      </div>
      <Card>
        <Table head={["Waktu", "Pemilik", "Booth", "Kode", "Mode", "Layout", "Nominal", "Lembar", "Status"]} empty={res.data.transactions.length === 0}>
          {res.data.transactions.map((x) => (
            <tr key={x.id}>
              <td className="whitespace-nowrap">{dateTime(x.occurred_at)}</td>
              <td><Link href={`/admin/pelanggan/${x.owner_id}`} className="font-bold hover:underline">{x.owner_name}</Link></td>
              <td>{x.device_name}</td>
              <td className="font-mono text-xs">{x.session_code || "—"}</td>
              <td><Badge status={x.mode} /></td>
              <td className="whitespace-nowrap">{LAYOUT_LABEL[x.layout] ?? x.layout}{x.gif && " + GIF"}</td>
              <td className="whitespace-nowrap font-bold">{x.amount ? rupiah(x.amount) : "—"}</td>
              <td>{x.sheets}</td>
              <td><Badge status={x.status} /></td>
            </tr>
          ))}
        </Table>
        <Pagination page={res.meta.page} perPage={res.meta.per_page} total={res.meta.total} base="/admin/transaksi" params={sp} />
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
