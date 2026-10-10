import Link from "next/link";
import { Suspense } from "react";
import { Banknote, Printer, ReceiptText, TrendingUp } from "lucide-react";
import { FilterSelect, PeriodPicker } from "@/components/dash/client";
import { Bars, BarChart, Card, HourChart, ErrorBox, Loading, PageHeader, Stat } from "@/components/dash/ui";
import { cn } from "@/components/shared/cn";
import { api, ApiError, qs } from "@/lib/dash/api";
import { delta, FILTER_LABEL, FRAME_LABEL, LAYOUT_LABEL, number, rupiah, rupiahShort } from "@/lib/dash/format";
import { periodFrom, type SP } from "@/lib/dash/period";
import type { Booth, OwnerOverview } from "@/lib/dash/types";

function Line({ label, value, sign, strong, sub }: { label: string; value: number; sign?: "+" | "−"; strong?: boolean; sub?: string }) {
  return (
    <li className={cn("flex items-baseline justify-between gap-3 py-2.5", strong && "border-t border-edge pt-3")}>
      <span className={cn("min-w-0", strong ? "font-semibold" : "text-sm")}>
        {label}
        {sub && <span className="block text-xs font-normal text-subtle">{sub}</span>}
      </span>
      <span className={cn("shrink-0 font-medium tabular-nums", strong ? "text-lg font-semibold" : "text-sm", sign === "−" && "text-danger")}>
        {sign === "−" && value > 0 ? "−" : ""}
        {rupiah(value)}
      </span>
    </li>
  );
}

async function Content({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const per = await periodFrom(sp);
  let o: OwnerOverview, booths: Booth[];
  try {
    const [or, br] = await Promise.all([
      api<OwnerOverview>("owner", `/owner/overview${qs({ ...per, device_id: sp.device_id })}`),
      api<{ booths: Booth[] }>("owner", "/owner/booths?per_page=100"),
    ]);
    o = or.data;
    booths = br.data.booths;
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  const c = o.current, p = o.previous;
  const empty = c.transactions === 0 && c.events === 0;
  return (
    <>
      <PageHeader title="Ringkasan" subtitle="Pendapatan & keuntungan booth-mu." />
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <PeriodPicker from={per.from} to={per.to} />
        {booths.length > 1 && (
          <FilterSelect name="device_id" value={sp.device_id ?? ""} label="Booth" options={[{ value: "", label: "Semua booth" }, ...booths.map((b) => ({ value: b.id, label: b.name }))]} />
        )}
      </div>
      {empty && (
        <p className="mb-6 rounded-lg border border-edge bg-surface px-4 py-3 text-sm text-subtle">
          Belum ada transaksi pada periode ini. Data muncul otomatis begitu booth tersambung internet (aplikasi mengirim catatan tiap sesi, tanpa foto).
          Untuk mode event, catat nilai kontraknya di <Link href="/dashboard/acara" className="font-medium text-primary hover:underline">Acara</Link>.
        </p>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Pendapatan" value={rupiah(c.total_revenue)} change={delta(c.total_revenue, p.total_revenue)} hint="vs periode lalu" icon={Banknote} tone="green" />
        <Stat label="Keuntungan" value={rupiah(c.profit)} change={delta(c.profit, p.profit)} icon={TrendingUp} tone="yellow" />
        <Stat label="Transaksi" value={number(c.transactions)} change={delta(c.transactions, p.transactions)} hint={c.abandoned ? `${c.abandoned} batal` : undefined} icon={ReceiptText} />
        <Stat label="Lembar tercetak" value={number(c.sheets)} change={delta(c.sheets, p.sheets)} icon={Printer} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Pendapatan harian" className="lg:col-span-2">
          <BarChart points={o.daily} tone="blue" />
        </Card>
        <Card title="Rincian keuntungan">
          <ul className="flex flex-col">
            <Line label="Sesi kiosk (QRIS)" value={c.revenue} sign="+" sub={`${number(c.transactions)} sesi`} />
            <Line label="Kontrak acara" value={c.event_revenue} sign="+" sub={`${c.events} acara`} />
            <Line label="Biaya kertas" value={c.paper_cost} sign="−" sub={o.paper_cost_per_sheet ? `${number(c.sheets)} lembar × ${rupiah(o.paper_cost_per_sheet)}` : undefined} />
            <Line label="Biaya lain acara" value={c.other_cost} sign="−" />
            {!sp.device_id && <Line label="Langganan Sissi" value={c.subscription_cost} sign="−" />}
            <Line label="Keuntungan" value={c.profit} strong />
          </ul>
          {!o.paper_cost_per_sheet && (
            <p className="mt-3 rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
              Biaya kertas belum diisi. <Link href="/dashboard/pengaturan" className="font-medium underline">Isi di Pengaturan</Link> agar keuntungan akurat.
            </p>
          )}
        </Card>
      </div>

      <Card title="Jam ramai" className="mt-6">
        <HourChart hours={o.by_hour ?? []} />
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Bingkai terlaris">
          <Bars rows={(o.by_frame ?? []).slice(0, 6).map((g) => ({ label: FRAME_LABEL[g.key] ?? g.label, value: g.transactions }))} format={(n) => `${number(n)} sesi`} />
        </Card>
        <Card title="Filter terlaris">
          <Bars
            rows={(o.by_filter ?? []).slice(0, 6).map((g) => ({ label: FILTER_LABEL[g.key] ?? g.label, value: g.transactions }))}
            format={(n) => `${number(n)} sesi`}
            empty="Belum ada data filter. Tercatat otomatis sejak aplikasi booth versi terbaru."
          />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Layout terlaris">
          <Bars rows={o.by_layout.map((g) => ({ label: LAYOUT_LABEL[g.key] ?? g.label, value: g.transactions, sub: rupiah(g.revenue) }))} format={(n) => `${number(n)} sesi`} />
        </Card>
        <Card title="Per booth">
          <Bars rows={o.by_device.map((g) => ({ label: g.label, value: g.revenue, sub: `${number(g.transactions)} sesi` }))} format={rupiahShort} />
        </Card>
      </div>
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
