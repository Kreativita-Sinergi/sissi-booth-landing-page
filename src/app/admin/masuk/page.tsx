import type { Metadata } from "next";
import { dashIcons } from "@/lib/dash/font";
import { Suspense } from "react";
import { LoginForm } from "@/components/dash/login";
import { loginAdmin } from "@/lib/dash/auth-actions";

export const metadata: Metadata = { title: "Masuk admin · Sissi Booth", robots: { index: false }, icons: dashIcons };

async function Form({ searchParams }: { searchParams: Promise<{ habis?: string; next?: string }> }) {
  const sp = await searchParams;
  return <LoginForm action={loginAdmin} title="Dashboard admin" subtitle="Khusus tim Sissi." expired={sp.habis === "1"} next={sp.next} />;
}

export default function Page(props: { searchParams: Promise<{ habis?: string; next?: string }> }) {
  return (
    <Suspense>
      <Form searchParams={props.searchParams} />
    </Suspense>
  );
}
