import Link from "next/link";
import { Suspense } from "react";
import { Download } from "lucide-react";
import { RecordPaymentButton } from "@/components/dash/admin-forms";
import { ConfirmAction, FilterSelect, PeriodPicker } from "@/components/dash/client";
import { Badge, Card, ErrorBox, LinkButton, Loading, PageHeader, Pagination, Stat, Table } from "@/components/dash/ui";
import { voidPayment } from "@/lib/dash/admin-actions";
import { api, ApiError, qs } from "@/lib/dash/api";
import { dateTime, METHOD_LABEL, number, PLAN_LABEL, rupiah } from "@/lib/dash/format";
import { periodFrom, type SP } from "@/lib/dash/period";
import type { Customer, Payment } from "@/lib/dash/types";

async function Content({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const per = periodFrom(sp);
  let res, owners: Customer[];
  try {
    const [pr, or] = await Promise.all([
      api<{ payments: Payment[]; total_amount: number }>("admin", `/admin/subscription-payments${qs({ ...per, status: sp.status, page: sp.page, per_page: 25 })}`),
      api<{ customers: Customer[] }>("admin", `/admin/customers${qs({ per_page: 100 })}`),
    ]);
    res = pr;
    owners = or.data.customers;
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  return (
    <>
      <PageHeader
        title="Pembayaran langganan"
        subtitle="Transfer/tunai dari pemilik booth yang dicatat tim Sissi."
        actions={
          <>
            <LinkButton href={`/admin/unduh/pembayaran${qs({ ...per, status: sp.status })}`} icon={Download} small download>CSV</LinkButton>
            <RecordPaymentButton owners={owners.map((o) => ({ id: o.id, name: `${o.name} (${o.email})` }))} small />
          </>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <PeriodPicker from={per.from} to={per.to} />
        <FilterSelect name="status" value={sp.status ?? ""} label="Status" options={[{ value: "", label: "Semua" }, { value: "valid", label: "Sah" }, { value: "void", label: "Dibatalkan" }]} />
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total sah" value={rupiah(res.data.total_amount)} tone="green" />
        <Stat label="Jumlah catatan" value={number(res.meta.total)} />
      </div>
      <Card>
        <p className="mb-3 text-xs text-muted">Perpanjang lisensi saat mencatat pembayaran dari halaman detail pelanggan agar bisa memilih lisensinya.</p>
        <Table head={["Tanggal", "Pemilik", "Nominal", "Metode", "Perpanjangan", "Dicatat", "Status", ""]} empty={res.data.payments.length === 0}>
          {res.data.payments.map((p) => (
            <tr key={p.id} className={p.status === "void" ? "opacity-50" : ""}>
              <td className="whitespace-nowrap">{dateTime(p.paid_at)}</td>
              <td>
                <Link href={`/admin/pelanggan/${p.owner_id}`} className="font-bold hover:underline">{p.owner_name}</Link>
                {p.note && <p className="max-w-56 truncate text-xs text-muted">{p.note}</p>}
              </td>
              <td className="whitespace-nowrap font-bold">{rupiah(p.amount)}</td>
              <td>{METHOD_LABEL[p.method] ?? p.method}</td>
              <td className="whitespace-nowrap">{p.periods > 0 ? `+${p.periods} ${PLAN_LABEL[p.plan]?.toLowerCase() ?? p.plan}` : "—"}</td>
              <td className="text-muted">{p.recorded_by || "—"}</td>
              <td><Badge status={p.status} /></td>
              <td className="text-right">
                {p.status === "valid" && (
                  <ConfirmAction label="Batalkan" title="Batalkan catatan pembayaran?" message="Tidak dihitung lagi di laporan. Perpanjangan lisensi tidak ditarik otomatis." confirm="Batalkan" action={voidPayment} hidden={{ id: p.id, reason: "dibatalkan admin" }} />
                )}
              </td>
            </tr>
          ))}
        </Table>
        <Pagination page={res.meta.page} perPage={res.meta.per_page} total={res.meta.total} base="/admin/pembayaran" params={sp} />
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
