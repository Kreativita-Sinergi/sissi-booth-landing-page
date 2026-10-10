"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import type { ActionState } from "@/lib/dash/action-state";
import { dashRoot } from "@/lib/dash/font";
import { SissiLogo } from "./logo";

/** Formulir masuk (admin Sissi / pemilik booth) — gaya dashboard netral. */
export function LoginForm({
  action,
  title,
  subtitle,
  expired,
  next,
}: {
  action: (s: ActionState, f: FormData) => Promise<ActionState>;
  title: string;
  subtitle: string;
  expired?: boolean;
  next?: string;
}) {
  const [state, run, pending] = useActionState(action, {} as ActionState);
  return (
    <main className={`${dashRoot} flex min-h-dvh items-center justify-center bg-canvas px-4 py-10`}>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <SissiLogo size="lg" />
          <span className="text-sm font-medium text-subtle">Sissi Booth</span>
        </div>
        <form action={run} className="flex flex-col gap-4 rounded-xl border border-edge bg-surface p-6 shadow-card md:p-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-subtle">{subtitle}</p>
          </div>
          {expired && !state.message && (
            <p className="rounded-lg border border-warning/20 bg-warning-soft px-3 py-2 text-sm font-medium text-warning">Sesi kamu sudah berakhir. Silakan masuk lagi.</p>
          )}
          {state.message && (
            <p role="alert" className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
              {state.message}
            </p>
          )}
          <input type="hidden" name="next" value={next ?? ""} />
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Email
            <input name="email" placeholder="nama@email.com" type="email" autoComplete="email" required className="h-10 rounded-lg border border-edge-strong px-3 text-sm font-normal shadow-card outline-none placeholder:text-subtle focus:border-primary focus:ring-3 focus:ring-primary/15" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Kata sandi
            <input name="password" placeholder="Kata sandi" type="password" autoComplete="current-password" required className="h-10 rounded-lg border border-edge-strong px-3 text-sm font-normal shadow-card outline-none placeholder:text-subtle focus:border-primary focus:ring-3 focus:ring-primary/15" />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-white shadow-card transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Masuk
          </button>
        </form>
      </div>
    </main>
  );
}
