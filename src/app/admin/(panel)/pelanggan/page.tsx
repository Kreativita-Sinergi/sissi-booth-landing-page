import Link from "next/link";
import { Suspense } from "react";
import { NewOwnerButton } from "@/components/dash/admin-forms";
import { FilterSelect } from "@/components/dash/client";
import { SearchBox } from "@/components/dash/search";
import { Badge, Card, ErrorBox, Loading, PageHeader, Pagination, Table } from "@/components/dash/ui";
import { api, ApiError, qs } from "@/lib/dash/api";
import { ago, date, number, rupiah } from "@/lib/dash/format";
import { requestTime, type SP } from "@/lib/dash/period";
import type { Customer } from "@/lib/dash/types";

const STATUS = [
  { value: "", label: "Semua status" },
  { value: "active", label: "Aktif" },
  { value: "expired", label: "Habis" },
  { value: "suspended", label: "Ditangguhkan" },
  { value: "none", label: "Belum langganan" },
];

async function Content({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  let res;
  try {
    res = await api<{ customers: Customer[] }>("admin", `/admin/customers${qs({ q: sp.q, status: sp.status, page, per_page: 25 })}`);
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  const now = await requestTime();
  return (
    <>
      <PageHeader title="Pelanggan" subtitle="Pemilik booth & status langganannya." actions={<NewOwnerButton />} />
      <Card>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchBox q={sp.q} placeholder="Cari nama, email, WA…" keep={{ status: sp.status }} />
          <FilterSelect name="status" value={sp.status ?? ""} options={STATUS} label="Status" />
        </div>
        <Table head={["Pemilik", "Status", "Aktif s/d", "Booth", "Total bayar", "Sesi 30 hari", "Terakhir online"]} empty={res.data.customers.length === 0}>
          {res.data.customers.map((c) => (
            <tr key={c.id} className="hover:bg-canvas">
              <td>
                <Link href={`/admin/pelanggan/${c.id}`} className="font-semibold hover:underline">{c.name}</Link>
                <p className="text-xs text-subtle">{c.email}{c.phone && ` · ${c.phone}`}</p>
              </td>
              <td><Badge status={c.status} /></td>
              <td className="whitespace-nowrap">{date(c.active_until)}</td>
              <td>{c.devices}</td>
              <td className="whitespace-nowrap">{rupiah(c.paid_total)}</td>
              <td className="whitespace-nowrap">{number(c.transactions_30d)} · {rupiah(c.revenue_30d)}</td>
              <td className="whitespace-nowrap text-subtle">{ago(c.last_seen_at, now)}</td>
            </tr>
          ))}
        </Table>
        <Pagination page={res.meta.page} perPage={res.meta.per_page} total={res.meta.total} base="/admin/pelanggan" params={sp} />
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
