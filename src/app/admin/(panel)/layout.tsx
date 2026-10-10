import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/components/dash/shell";
import { api, ApiError } from "@/lib/dash/api";
import { logoutAdmin } from "@/lib/dash/auth-actions";

export const metadata: Metadata = { title: "Admin · Sissi Booth", robots: { index: false } };

async function Who() {
  let me: { name: string; email: string } | null = null;
  try {
    me = (await api<{ name: string; email: string }>("admin", "/admin/me")).data;
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
  }
  if (!me) return <p className="text-subtle">Admin</p>;
  return (
    <>
      <p className="truncate font-semibold">{me.name}</p>
      <p className="truncate text-subtle">{me.email}</p>
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Shell
      variant="admin"
      title="Sissi Booth"
      badge="Admin"
      logout={logoutAdmin}
      user={
        <Suspense fallback={<p className="text-subtle">…</p>}>
          <Who />
        </Suspense>
      }
    >
      {children}
    </Shell>
  );
}
