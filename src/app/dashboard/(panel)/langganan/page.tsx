import { Suspense } from "react";
import { MessageCircle } from "lucide-react";
import { Badge, Card, Empty, ErrorBox, LinkButton, Loading, PageHeader, Table } from "@/components/dash/ui";
import { requestTime } from "@/lib/dash/period";
import { api, ApiError, qs } from "@/lib/dash/api";
import { date, dateTime, METHOD_LABEL, PLAN_LABEL, rupiah, waLink } from "@/lib/dash/format";
import type { License, Payment } from "@/lib/dash/types";

// Kontak tim Sissi (sama dengan landing page).
const SISSI_WA = "085161462806";

async function Content() {
  let licenses: License[], payments: Payment[];
  try {
    const [lr, pr] = await Promise.all([
      api<{ licenses: License[] }>("owner", "/owner/licenses"),
      api<{ payments: Payment[] }>("owner", `/owner/subscription-payments${qs({ all: 1, per_page: 50 })}`),
    ]);
    licenses = lr.data.licenses;
    payments = pr.data.payments;
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  const renew = waLink(SISSI_WA, "Halo tim Sissi, saya mau perpanjang langganan Sissi Booth.");
  const now = await requestTime();
  return (
    <>
      <PageHeader
        title="Langganan"
        subtitle="Status lisensi & riwayat pembayaran."
        actions={
          renew && (
            <LinkButton href={renew} icon={MessageCircle} tone="green">
              Perpanjang via WA
            </LinkButton>
          )
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {licenses.length === 0 && (
          <Card>
            <Empty text="Belum ada lisensi. Hubungi tim Sissi untuk berlangganan." />
          </Card>
        )}
        {licenses.map((l) => {
          const left = Math.ceil((new Date(l.ends_at).getTime() - now) / 86400_000);
          return (
            <Card key={l.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-muted">Paket {PLAN_LABEL[l.plan]}</p>
                  <p className="font-label text-2xl">{l.status === "active" ? (left > 0 ? `${left} hari lagi` : "Berakhir hari ini") : date(l.ends_at)}</p>
                </div>
                <Badge status={l.status === "active" && left <= 7 ? "expiring" : l.status} />
              </div>
              <p className="mt-3 text-sm text-muted">
                {date(l.starts_at)} – {date(l.ends_at)} · kunci …{l.key_hint.slice(-4)} · booth {l.active_devices}/{l.max_devices}
              </p>
            </Card>
          );
        })}
      </div>
      <Card title="Riwayat pembayaran" className="mt-6">
        <Table head={["Tanggal", "Nominal", "Metode", "Perpanjangan", "Catatan"]} empty={payments.length === 0}>
          {payments.map((p) => (
            <tr key={p.id}>
              <td className="whitespace-nowrap">{dateTime(p.paid_at)}</td>
              <td className="whitespace-nowrap font-bold">{rupiah(p.amount)}</td>
              <td>{METHOD_LABEL[p.method] ?? p.method}</td>
              <td className="whitespace-nowrap">{p.periods > 0 ? `+${p.periods} ${PLAN_LABEL[p.plan]?.toLowerCase() ?? p.plan}` : "—"}</td>
              <td className="text-muted">{p.note || "—"}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Content />
    </Suspense>
  );
}
