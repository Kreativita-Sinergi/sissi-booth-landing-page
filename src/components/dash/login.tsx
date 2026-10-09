"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import type { ActionState } from "@/lib/dash/action-state";

/** Formulir masuk (admin Sissi / pemilik booth) bergaya stiker. */
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
    <main className="flex min-h-dvh items-center justify-center bg-booth-yellow px-4 py-10">
      <div className="w-full max-w-md">
        <p className="mb-5 inline-flex rounded-full border-[3px] border-ink bg-booth-pink px-5 py-2 font-display text-2xl shadow-hard-sm">sissi booth</p>
        <form action={run} className="flex flex-col gap-4 rounded-3xl border-[3px] border-ink bg-white p-6 shadow-hard md:p-8">
          <div>
            <h1 className="font-label text-2xl">{title}</h1>
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          </div>
          {expired && !state.message && (
            <p className="rounded-xl border-2 border-ink bg-booth-yellow px-3 py-2 text-sm font-bold">Sesi kamu sudah berakhir. Silakan masuk lagi.</p>
          )}
          {state.message && (
            <p role="alert" className="rounded-xl border-2 border-ink bg-booth-pink/30 px-3 py-2 text-sm font-bold">
              {state.message}
            </p>
          )}
          <input type="hidden" name="next" value={next ?? ""} />
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Email
            <input name="email" type="email" autoComplete="email" required className="h-12 rounded-xl border-2 border-ink px-3 text-base outline-none focus:ring-3 focus:ring-booth-blue/30" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Kata sandi
            <input name="password" type="password" autoComplete="current-password" required className="h-12 rounded-xl border-2 border-ink px-3 text-base outline-none focus:ring-3 focus:ring-booth-blue/30" />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex h-13 items-center justify-center gap-2 rounded-2xl border-[3px] border-ink bg-booth-blue font-label text-base uppercase text-white shadow-hard-sm transition-all hover:-translate-y-px active:translate-y-0.5 active:shadow-none disabled:opacity-60"
          >
            {pending && <Loader2 className="size-5 animate-spin" />}
            Masuk
          </button>
        </form>
      </div>
    </main>
  );
}
