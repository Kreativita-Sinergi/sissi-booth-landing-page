import { Suspense } from "react";
import { Card, ErrorBox, Loading, PageHeader, Pagination, Table } from "@/components/dash/ui";
import { api, ApiError, qs } from "@/lib/dash/api";
import { dateTime } from "@/lib/dash/format";
import type { SP } from "@/lib/dash/period";
import type { AuditEntry } from "@/lib/dash/types";

const ACTION: Record<string, string> = {
  "admin.create": "Menambah admin",
  "admin.delete": "Menghapus admin",
  "admin.password": "Mengganti sandi admin",
  "owner.create": "Menambah pemilik",
  "owner.update": "Mengubah profil pemilik",
  "owner.password": "Mereset sandi pemilik",
  "license.create": "Membuat lisensi",
  "license.extend": "Memperpanjang lisensi",
  "license.update": "Mengubah lisensi",
  "license.rotate_key": "Membuat kunci baru",
  "payment.create": "Mencatat pembayaran",
  "payment.void": "Membatalkan pembayaran",
};

async function Content({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  let res;
  try {
    res = await api<{ entries: AuditEntry[] }>("admin", `/admin/audit-logs${qs({ page: sp.page, per_page: 40 })}`);
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  return (
    <>
      <PageHeader title="Log aktivitas" subtitle="Siapa mengubah apa dan kapan." />
      <Card>
        <Table head={["Waktu", "Oleh", "Aksi", "Target", "Detail"]} empty={res.data.entries.length === 0}>
          {res.data.entries.map((e) => (
            <tr key={e.id}>
              <td className="whitespace-nowrap">{dateTime(e.created_at)}</td>
              <td className="font-bold">{e.actor_name}</td>
              <td>{ACTION[e.action] ?? e.action}</td>
              <td>{e.target}</td>
              <td className="text-muted">{e.detail || "—"}</td>
            </tr>
          ))}
        </Table>
        <Pagination page={res.meta.page} perPage={res.meta.per_page} total={res.meta.total} base="/admin/aktivitas" params={sp} />
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
