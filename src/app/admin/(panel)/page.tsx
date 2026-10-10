import Link from "next/link";
import { Suspense } from "react";
import { BadgeCheck, CalendarClock, MonitorSmartphone, UserPlus, Users, WalletCards } from "lucide-react";
import { PeriodPicker } from "@/components/dash/client";
import { Bars, BarChart, Card, Empty, ErrorBox, Loading, PageHeader, Stat } from "@/components/dash/ui";
import { api, ApiError, qs } from "@/lib/dash/api";
import { date, delta, number, PLAN_LABEL, rupiah, rupiahShort, waLink } from "@/lib/dash/format";
import { periodFrom, type SP } from "@/lib/dash/period";
import type { AdminOverview } from "@/lib/dash/types";

async function Content({ searchParams }: { searchParams: SP }) {
  const per = await periodFrom(await searchParams);
  let o: AdminOverview;
  try {
    o = (await api<AdminOverview>("admin", `/admin/overview${qs(per)}`)).data;
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  const c = o.counts;
  return (
    <>
      <PageHeader title="Ringkasan" subtitle="Langganan, pelanggan, dan aktivitas semua booth." actions={<PeriodPicker from={per.from} to={per.to} />} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Pelanggan aktif" value={number(c.subscribers)} hint={`dari ${number(c.owners)} pemilik`} icon={Users} tone="yellow" />
        <Stat label="Pendapatan langganan" value={rupiah(o.subscription_revenue)} change={delta(o.subscription_revenue, o.previous_subscription_revenue)} hint={`${o.subscription_payments} pembayaran`} icon={WalletCards} tone="green" />
        <Stat label="Pelanggan baru" value={number(c.owners_new)} hint="pada periode ini" icon={UserPlus} />
        <Stat label="Booth aktif 24 jam" value={`${c.devices_active_24h}/${c.devices}`} hint="terhubung ke server" icon={MonitorSmartphone} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Pendapatan langganan harian" className="lg:col-span-2">
          <BarChart points={o.subscription_daily} tone="green" />
        </Card>
        <Card title="Status lisensi">
          <ul className="flex flex-col gap-3 text-sm">
            {[
              ["Aktif", c.licenses_active, "active"],
              ["Habis ≤ 7 hari", c.licenses_expiring_7d, "expiring"],
              ["Sudah habis", c.licenses_expired, "expired"],
              ["Ditangguhkan", c.licenses_suspended, "suspended"],
            ].map(([label, n, s]) => (
              <li key={String(s)}>
                <Link href={`/admin/lisensi?status=${s}`} className="flex items-center justify-between rounded-lg border border-edge px-3 py-2.5 hover:bg-canvas">
                  <span className="font-semibold">{label}</span>
                  <span className="text-lg font-semibold tabular-nums">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Lisensi segera habis" className="lg:col-span-2" action={<Link href="/admin/lisensi?status=expiring" className="text-xs font-medium text-primary hover:underline">Semua</Link>}>
          {o.expiring.length === 0 ? (
            <Empty text="Tidak ada lisensi yang habis dalam 7 hari." icon={BadgeCheck} />
          ) : (
            <ul className="flex flex-col divide-y divide-edge">
              {o.expiring.map((x) => {
                const wa = waLink(x.owner_phone, `Halo ${x.owner_name}, langganan Sissi Booth kamu (${PLAN_LABEL[x.plan] ?? x.plan}) akan berakhir ${date(x.ends_at)}. Mau diperpanjang?`);
                return (
                  <li key={x.license_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link href={`/admin/pelanggan/${x.owner_id}`} className="font-semibold hover:underline">{x.owner_name}</Link>
                      <p className="flex items-center gap-1 text-xs text-subtle">
                        <CalendarClock className="size-3.5" /> {PLAN_LABEL[x.plan] ?? x.plan} · berakhir {date(x.ends_at)}
                      </p>
                    </div>
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-edge-strong bg-surface px-3 text-xs font-medium shadow-card hover:bg-canvas">
                        Ingatkan via WA
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card title="Pendapatan per paket">
          <Bars rows={o.by_plan.map((g) => ({ label: PLAN_LABEL[g.key] ?? g.label, value: g.revenue, sub: `${g.transactions} pembayaran` }))} format={rupiahShort} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title={`Transaksi semua booth · ${number(o.booth.transactions)} sesi · ${rupiah(o.booth.revenue)}`} className="lg:col-span-2">
          <BarChart points={o.booth_daily} value="transactions" tone="blue" format={(n) => String(n)} />
        </Card>
        <Card title="Pemilik teratas" action={<Link href="/admin/transaksi" className="text-xs font-medium text-primary hover:underline">Transaksi</Link>}>
          <Bars rows={o.top_owners.map((g) => ({ label: g.label, value: g.revenue, sub: `${g.transactions} sesi` }))} format={rupiahShort} />
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
