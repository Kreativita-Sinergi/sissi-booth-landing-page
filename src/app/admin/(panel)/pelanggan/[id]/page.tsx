import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import {
  EditOwnerButton,
  ExtendLicenseButton,
  LicenseSettingsButton,
  NewLicenseButton,
  RecordPaymentButton,
  ResetPasswordButton,
  RotateKeyButton,
} from "@/components/dash/admin-forms";
import { ConfirmAction } from "@/components/dash/client";
import { Badge, Card, Empty, ErrorBox, LinkButton, Loading, PageHeader, Stat, Table } from "@/components/dash/ui";
import { deactivateDevice, voidPayment } from "@/lib/dash/admin-actions";
import { requestTime } from "@/lib/dash/period";
import { api, ApiError, qs } from "@/lib/dash/api";
import { ago, date, dateTime, METHOD_LABEL, number, PLAN_LABEL, rupiah, waLink } from "@/lib/dash/format";
import type { Booth, Customer, License, OwnerProfile, Payment } from "@/lib/dash/types";

async function Content({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ baru?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  let c: Customer, licenses: License[], booths: Booth[], payments: Payment[];
  try {
    const [cr, lr, br, pr] = await Promise.all([
      api<Customer>("admin", `/admin/customers/${id}`),
      api<{ licenses: License[] }>("admin", `/admin/licenses${qs({ owner_id: id })}`),
      api<{ booths: Booth[] }>("admin", `/admin/booths${qs({ owner_id: id, per_page: 100 })}`),
      api<{ payments: Payment[] }>("admin", `/admin/subscription-payments${qs({ owner_id: id, all: 1, per_page: 50 })}`),
    ]);
    c = cr.data;
    licenses = lr.data.licenses;
    booths = br.data.booths;
    payments = pr.data.payments;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  const owner: OwnerProfile = { id: c.id, name: c.name, email: c.email, phone: c.phone, paper_cost: 0, created_at: c.created_at };
  const wa = waLink(c.phone, `Halo ${c.name}, ini tim Sissi Booth.`);
  const now = await requestTime();
  return (
    <>
      <Link href="/admin/pelanggan" className="mb-3 inline-flex items-center gap-1 text-sm font-bold hover:underline">
        <ArrowLeft className="size-4" strokeWidth={3} /> Pelanggan
      </Link>
      <PageHeader
        title={c.name}
        subtitle={`${c.email}${c.phone ? ` · ${c.phone}` : ""} · terdaftar ${date(c.created_at)}`}
        actions={
          <>
            <Badge status={c.status} />
            {wa && <LinkButton href={wa} icon={MessageCircle} small tone="green">WhatsApp</LinkButton>}
            <EditOwnerButton owner={owner} />
            <ResetPasswordButton ownerId={c.id} />
          </>
        }
      />
      {sp.baru === "1" && (
        <p className="mb-6 rounded-2xl border-2 border-ink bg-booth-green px-4 py-3 text-sm font-bold">
          Pemilik dibuat. Langkah berikutnya: buat lisensi, lalu kirim kuncinya lewat WA.
        </p>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Aktif sampai" value={date(c.active_until)} tone={c.status === "active" ? "green" : "white"} />
        <Stat label="Total bayar" value={rupiah(c.paid_total)} hint={c.last_paid_at ? `terakhir ${date(c.last_paid_at)}` : undefined} />
        <Stat label="Sesi 30 hari" value={number(c.transactions_30d)} hint={rupiah(c.revenue_30d)} />
        <Stat label="Booth" value={String(c.devices)} hint={`online ${ago(c.last_seen_at, now)}`} />
      </div>

      <Card title="Lisensi" className="mt-6" action={<NewLicenseButton owner={owner} />}>
        {licenses.length === 0 ? (
          <Empty text="Belum ada lisensi. Buat lisensi lalu kirim kuncinya ke pemilik." />
        ) : (
          <Table head={["Kunci", "Paket", "Status", "Berlaku", "Booth", ""]}>
            {licenses.map((l) => (
              <tr key={l.id}>
                <td className="font-mono font-bold">…{l.key_hint.slice(-4)}</td>
                <td>{PLAN_LABEL[l.plan]}</td>
                <td><Badge status={l.status} /></td>
                <td className="whitespace-nowrap">{date(l.starts_at)} – {date(l.ends_at)}</td>
                <td>{l.active_devices}/{l.max_devices}</td>
                <td>
                  <div className="flex flex-wrap justify-end gap-2">
                    <ExtendLicenseButton license={l} />
                    <LicenseSettingsButton license={l} />
                    <RotateKeyButton license={l} owner={owner} />
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card title="Booth terdaftar" className="mt-6">
        <Table head={["Booth", "Platform", "Versi", "Terakhir online", "Sesi 30 hari", ""]} empty={booths.length === 0}>
          {booths.map((b) => (
            <tr key={b.id}>
              <td className="font-bold">{b.name}</td>
              <td className="capitalize">{b.platform}</td>
              <td>{b.app_version || "—"}</td>
              <td className="whitespace-nowrap">{ago(b.last_seen_at, now)}</td>
              <td className="whitespace-nowrap">{number(b.transactions_30d)} · {rupiah(b.revenue_30d)}</td>
              <td className="text-right">
                <ConfirmAction
                  label="Lepas"
                  title={`Lepas booth "${b.name}"?`}
                  message="Booth ini berhenti memakai lisensi dan slotnya kosong lagi (mis. untuk pindah laptop)."
                  confirm="Lepas booth"
                  action={deactivateDevice}
                  hidden={{ id: b.id }}
                />
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card title="Pembayaran langganan" className="mt-6" action={<RecordPaymentButton ownerId={c.id} licenses={licenses} small />}>
        <Table head={["Tanggal", "Nominal", "Metode", "Perpanjangan", "Catatan", "Status", ""]} empty={payments.length === 0}>
          {payments.map((p) => (
            <tr key={p.id} className={p.status === "void" ? "opacity-50" : ""}>
              <td className="whitespace-nowrap">{dateTime(p.paid_at)}</td>
              <td className="whitespace-nowrap font-bold">{rupiah(p.amount)}</td>
              <td>{METHOD_LABEL[p.method] ?? p.method}</td>
              <td className="whitespace-nowrap">{p.periods > 0 ? `+${p.periods} ${PLAN_LABEL[p.plan]?.toLowerCase() ?? p.plan}` : "—"}</td>
              <td className="max-w-56 truncate text-muted">{p.note || "—"}</td>
              <td><Badge status={p.status} /></td>
              <td className="text-right">
                {p.status === "valid" && (
                  <ConfirmAction
                    label="Batalkan"
                    title="Batalkan catatan pembayaran?"
                    message="Pembayaran tidak dihitung di laporan. Perpanjangan lisensi tidak ditarik otomatis."
                    confirm="Batalkan"
                    action={voidPayment}
                    hidden={{ id: p.id, reason: "dibatalkan admin" }}
                  />
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

export default function Page(props: { params: Promise<{ id: string }>; searchParams: Promise<{ baru?: string }> }) {
  return (
    <Suspense fallback={<Loading />}>
      <Content params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
