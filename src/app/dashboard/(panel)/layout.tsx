import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/components/dash/shell";
import { api, ApiError } from "@/lib/dash/api";
import { logoutOwner } from "@/lib/dash/auth-actions";
import { waLink } from "@/lib/dash/format";
import { requestTime } from "@/lib/dash/period";
import type { License } from "@/lib/dash/types";

export const metadata: Metadata = { title: "Dashboard · Sissi Booth", robots: { index: false } };

async function Who() {
  let me: { name: string; email: string } | null = null;
  try {
    me = (await api<{ name: string; email: string }>("owner", "/owner/me")).data;
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
  }
  if (!me) return <p className="text-muted">Pemilik booth</p>;
  return (
    <>
      <p className="truncate font-bold">{me.name}</p>
      <p className="truncate text-muted">{me.email}</p>
    </>
  );
}

/** Pengingat langganan: habis ≤ 7 hari / sudah habis → banner di atas semua halaman. */
async function LicenseBanner() {
  let licenses: License[];
  try {
    licenses = (await api<{ licenses: License[] }>("owner", "/owner/licenses")).data.licenses;
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
    return null;
  }
  const now = await requestTime();
  const active = licenses.filter((l) => l.status === "active");
  const latest = Math.max(0, ...active.map((l) => new Date(l.ends_at).getTime()));
  const days = Math.ceil((latest - now) / 86400_000);
  if (active.length > 0 && days > 7) return null;
  const expired = active.length === 0;
  const wa = waLink("085161462806", "Halo tim Sissi, saya mau perpanjang langganan Sissi Booth.");
  return (
    <div className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink px-4 py-3 text-sm font-bold ${expired ? "bg-booth-pink" : "bg-booth-yellow"}`}>
      <span>
        {expired
          ? "Langganan Sissi Booth-mu sudah habis — booth berjalan dalam mode terbatas."
          : days <= 0
            ? "Langganan Sissi Booth-mu berakhir hari ini."
            : `Langganan Sissi Booth-mu berakhir ${days} hari lagi.`}
      </span>
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-xl border-2 border-ink bg-white px-3 py-1.5 font-label text-xs uppercase shadow-hard-sm">
          Perpanjang via WA
        </a>
      )}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Shell
      variant="owner"
      title="sissi booth"
      badge="Pemilik booth"
      logout={logoutOwner}
      user={
        <Suspense fallback={<p className="text-muted">…</p>}>
          <Who />
        </Suspense>
      }
    >
      <Suspense>
        <LicenseBanner />
      </Suspense>
      {children}
    </Shell>
  );
}
