import Link from "next/link";
import { Suspense } from "react";
import { FilterSelect } from "@/components/dash/client";
import { SearchBox } from "@/components/dash/search";
import { Badge, Card, ErrorBox, Loading, PageHeader, Pagination, Table } from "@/components/dash/ui";
import { api, ApiError, qs } from "@/lib/dash/api";
import { date, PLAN_LABEL } from "@/lib/dash/format";
import type { SP } from "@/lib/dash/period";
import type { License } from "@/lib/dash/types";

const STATUS = [
  { value: "", label: "Semua status" },
  { value: "active", label: "Aktif" },
  { value: "expiring", label: "Habis ≤ 7 hari" },
  { value: "expired", label: "Habis" },
  { value: "suspended", label: "Ditangguhkan" },
  { value: "scheduled", label: "Terjadwal" },
];

async function Content({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  let res;
  try {
    res = await api<{ licenses: License[] }>("admin", `/admin/licenses${qs({ q: sp.q, status: sp.status, page: sp.page, per_page: 25 })}`);
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  return (
    <>
      <PageHeader title="Lisensi" subtitle="Semua lisensi, urut dari yang paling cepat habis. Buat lisensi baru dari halaman pelanggan." />
      <Card>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchBox q={sp.q} placeholder="Cari pemilik / kunci…" keep={{ status: sp.status }} />
          <FilterSelect name="status" value={sp.status ?? ""} options={STATUS} label="Status" />
        </div>
        <Table head={["Pemilik", "Kunci", "Paket", "Status", "Mulai", "Berakhir", "Booth"]} empty={res.data.licenses.length === 0}>
          {res.data.licenses.map((l) => (
            <tr key={l.id}>
              <td>
                <Link href={`/admin/pelanggan/${l.owner_id}`} className="font-semibold hover:underline">{l.owner_name}</Link>
                <p className="text-xs text-subtle">{l.owner_email}</p>
              </td>
              <td className="font-mono font-semibold">…{l.key_hint.slice(-4)}</td>
              <td>{PLAN_LABEL[l.plan]}</td>
              <td><Badge status={l.status} /></td>
              <td className="whitespace-nowrap">{date(l.starts_at)}</td>
              <td className="whitespace-nowrap font-semibold">{date(l.ends_at)}</td>
              <td>{l.active_devices}/{l.max_devices}</td>
            </tr>
          ))}
        </Table>
        <Pagination page={res.meta.page} perPage={res.meta.per_page} total={res.meta.total} base="/admin/lisensi" params={sp} />
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
