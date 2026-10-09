import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/components/dash/shell";
import { api, ApiError } from "@/lib/dash/api";
import { logoutOwner } from "@/lib/dash/auth-actions";

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
      {children}
    </Shell>
  );
}
