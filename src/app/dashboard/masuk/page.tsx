import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/dash/login";
import { loginOwner } from "@/lib/dash/auth-actions";

export const metadata: Metadata = { title: "Masuk · Dashboard Sissi Booth", robots: { index: false } };

async function Form({ searchParams }: { searchParams: Promise<{ habis?: string; next?: string }> }) {
  const sp = await searchParams;
  return (
    <LoginForm
      action={loginOwner}
      title="Dashboard pemilik booth"
      subtitle="Pantau pendapatan, transaksi, dan galeri booth-mu. Akun dibuat oleh tim Sissi."
      expired={sp.habis === "1"}
      next={sp.next}
    />
  );
}

export default function Page(props: { searchParams: Promise<{ habis?: string; next?: string }> }) {
  return (
    <Suspense>
      <Form searchParams={props.searchParams} />
    </Suspense>
  );
}
