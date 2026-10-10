import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Download, FileDown } from "lucide-react";
import { ConfirmAction } from "@/components/dash/client";
import { EditEventButton } from "@/components/dash/owner-forms";
import { Badge, Card, ErrorBox, LinkButton, Loading, PageHeader, Stat, Table } from "@/components/dash/ui";
import { api, ApiError, qs } from "@/lib/dash/api";
import { dateTime, dayLabel, LAYOUT_LABEL, number, rupiah } from "@/lib/dash/format";
import { deleteEvent } from "@/lib/dash/owner-actions";
import type { Booth, BoothEvent, OwnerProfile, Transaction } from "@/lib/dash/types";

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let e: BoothEvent, booths: Booth[], me: OwnerProfile, txs: Transaction[];
  try {
    const [er, br, mr, tr] = await Promise.all([
      api<BoothEvent>("owner", `/owner/events/${id}`),
      api<{ booths: Booth[] }>("owner", "/owner/booths?per_page=100"),
      api<OwnerProfile>("owner", "/owner/me"),
      api<{ transactions: Transaction[] }>("owner", `/owner/transactions${qs({ event_id: id, per_page: 100 })}`),
    ]);
    e = er.data;
    booths = br.data.booths;
    me = mr.data;
    txs = tr.data.transactions;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    if (err instanceof ApiError) return <ErrorBox message={err.message} />;
    throw err;
  }
  const paper = e.sheets * me.paper_cost;
  const profit = e.contract_amount + e.revenue - paper - e.other_cost;
  const booth = booths.find((b) => b.id === e.device_id);
  const range = `${dayLabel(e.starts_on)}${e.ends_on !== e.starts_on ? ` – ${dayLabel(e.ends_on)}` : ""}`;
  return (
    <>
      <Link href="/dashboard/acara" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ArrowLeft className="size-4" strokeWidth={2} /> Acara
      </Link>
      <PageHeader
        title={e.name}
        subtitle={`${e.client_name ? `${e.client_name} · ` : ""}${range} · ${booth ? booth.name : "semua booth"}`}
        actions={
          <>
            <LinkButton href={`/dashboard/acara-foto/${e.id}`} icon={Download} tone="green" small download>
              Unduh semua foto
            </LinkButton>
            <LinkButton href={`/dashboard/unduh/transaksi${qs({ event_id: e.id })}`} icon={FileDown} small download>
              CSV
            </LinkButton>
            <EditEventButton event={e} booths={booths.map((b) => ({ id: b.id, name: b.name }))} />
            <ConfirmAction label="Hapus" title="Hapus acara?" message="Catatan acara dihapus. Transaksi & foto tidak ikut terhapus." confirm="Hapus" action={deleteEvent} hidden={{ id: e.id }} />
          </>
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Nilai kontrak" value={rupiah(e.contract_amount)} tone="green" />
        <Stat label="Keuntungan acara" value={rupiah(profit)} tone="yellow" hint={`kertas ${rupiah(paper)} · lain ${rupiah(e.other_cost)}`} />
        <Stat label="Sesi foto" value={number(e.transactions)} hint={e.revenue ? `+ kiosk ${rupiah(e.revenue)}` : undefined} />
        <Stat label="Lembar tercetak" value={number(e.sheets)} />
      </div>
      {e.note && <p className="mt-6 rounded-lg border border-edge bg-surface px-4 py-3 text-sm">{e.note}</p>}
      <Card title="Sesi pada acara ini" className="mt-6">
        <p className="mb-3 text-xs text-subtle">“Unduh semua foto” berisi foto yang tersimpan di galeri online (bila booth memakai pengiriman Cloud/Otomatis dan sedang online).</p>
        <Table head={["Waktu", "Booth", "Kode", "Layout", "Lembar", "Status"]} empty={txs.length === 0}>
          {txs.map((x) => (
            <tr key={x.id}>
              <td className="whitespace-nowrap">{dateTime(x.occurred_at)}</td>
              <td>{x.device_name}</td>
              <td className="font-mono text-xs">{x.session_code || "—"}</td>
              <td className="whitespace-nowrap">
                {LAYOUT_LABEL[x.layout] ?? x.layout}
                {x.gif && " + GIF"}
              </td>
              <td>{x.sheets}</td>
              <td>
                <Badge status={x.status} />
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Loading />}>
      <Content params={params} />
    </Suspense>
  );
}
