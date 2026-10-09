"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Check, Copy, Loader2, X } from "lucide-react";
import { cn } from "@/components/shared/cn";
import type { ActionState } from "@/lib/dash/action-state";
import { DateInput, RangePicker, Select, todayYmd, ymdLabel, type Option } from "./pickers";

const btnBase =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border-2 border-ink font-label uppercase shadow-hard-sm transition-all hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-booth-blue";
const btnTone = {
  blue: "bg-booth-blue text-white",
  green: "bg-booth-green",
  pink: "bg-booth-pink",
  yellow: "bg-booth-yellow",
  white: "bg-white",
} as const;

export function Button({
  children,
  tone = "white",
  small,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: keyof typeof btnTone; small?: boolean }) {
  return (
    <button {...rest} className={cn(btnBase, small ? "h-9 px-3 text-xs" : "h-11 px-4 text-sm", btnTone[tone], className)}>
      {children}
    </button>
  );
}

/** Tombol kirim formulir: menampilkan putaran saat aksi server berjalan. */
export function SubmitButton({ children, tone = "blue", small }: { children: React.ReactNode; tone?: keyof typeof btnTone; small?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" tone={tone} small={small} disabled={pending}>
      {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
      {children}
    </Button>
  );
}

/** Dialog kustom bergaya stiker (bukan dialog bawaan browser). Esc / klik latar = tutup. */
export function Dialog({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={cn(
          "max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border-[3px] border-ink bg-white p-5 shadow-hard sm:rounded-3xl sm:p-6",
          wide ? "sm:max-w-2xl" : "sm:max-w-md",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={id} className="font-label text-lg leading-tight">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-lg border-2 border-ink p-1 hover:bg-paper">
            <X className="size-4" strokeWidth={3} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

type Action = (prev: ActionState, form: FormData) => Promise<ActionState>;

/**
 * Formulir yang memanggil aksi server dan menampilkan galat per kolom (`name` input = kunci
 * `fields`). onDone dipanggil sekali saat aksi sukses (mis. menutup dialog).
 */
export function ActionForm({
  action,
  children,
  onDone,
  className,
}: {
  action: Action;
  children: (s: ActionState) => React.ReactNode;
  onDone?: (s: ActionState) => void;
  className?: string;
}) {
  const [state, run] = useActionState(action, {} as ActionState);
  const last = useRef<ActionState | null>(null);
  useEffect(() => {
    if (state.ok && state !== last.current) {
      last.current = state;
      onDone?.(state);
    }
  }, [state, onDone]);
  return (
    <form action={run} className={cn("flex flex-col gap-4", className)}>
      {state.message && !state.ok && (
        <p role="alert" className="rounded-xl border-2 border-ink bg-booth-pink/30 px-3 py-2 text-sm font-bold">
          {state.message}
        </p>
      )}
      {children(state)}
    </form>
  );
}

const fieldCls =
  "h-11 w-full rounded-xl border-2 border-ink bg-white px-3 text-base outline-none focus:border-booth-blue focus:ring-3 focus:ring-booth-blue/30";

export function Field({
  label,
  name,
  error,
  hint,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string; hint?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-1.5 text-sm font-bold">
      {label}
      <input id={id} name={name} {...rest} className={cn(fieldCls, error && "border-booth-pink")} aria-invalid={!!error} />
      {error ? <span className="text-xs text-[#c2185b]">{error}</span> : hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  error,
  defaultValue,
}: {
  label: string;
  name: string;
  options: Option[];
  error?: string;
  defaultValue?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 text-sm font-bold">
      <span>{label}</span>
      <Select name={name} label={label} options={options} defaultValue={defaultValue} invalid={!!error} />
      {error && <span className="text-xs text-[#c2185b]">{error}</span>}
    </div>
  );
}

/** Kolom tanggal dengan kalender kustom. */
export function DateField({ label, name, error, defaultValue }: { label: string; name: string; error?: string; defaultValue?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 text-sm font-bold">
      <span>{label}</span>
      <DateInput name={name} label={label} defaultValue={defaultValue} invalid={!!error} />
      {error && <span className="text-xs text-[#c2185b]">{error}</span>}
    </div>
  );
}

export function TextArea({ label, name, error, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; name: string; error?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-1.5 text-sm font-bold">
      {label}
      <textarea id={id} name={name} rows={3} {...rest} className={cn(fieldCls, "h-auto py-2", error && "border-booth-pink")} />
      {error && <span className="text-xs text-[#c2185b]">{error}</span>}
    </label>
  );
}

/** Tombol yang membuka dialog berisi formulir aksi (tutup otomatis setelah sukses). */
export function DialogAction({
  label,
  title,
  tone = "white",
  small,
  icon,
  wide,
  children,
}: {
  label: string;
  title: string;
  tone?: keyof typeof btnTone;
  small?: boolean;
  icon?: React.ReactNode;
  wide?: boolean;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button type="button" tone={tone} small={small} onClick={() => setOpen(true)}>
        {icon}
        {label}
      </Button>
      <Dialog open={open} onClose={close} title={title} wide={wide}>
        {open && children(close)}
      </Dialog>
    </>
  );
}

/** Aksi berisiko (hapus, tangguhkan): konfirmasi lewat dialog kustom, lalu jalankan aksi server. */
export function ConfirmAction({
  label,
  title,
  message,
  confirm,
  action,
  hidden,
  tone = "pink",
  small = true,
}: {
  label: string;
  title: string;
  message: string;
  confirm: string;
  action: Action;
  hidden?: Record<string, string>;
  tone?: keyof typeof btnTone;
  small?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" tone={tone} small={small} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title}>
        <ActionForm action={action} onDone={() => setOpen(false)}>
          {() => (
            <>
              <p className="text-sm">{message}</p>
              {Object.entries(hidden ?? {}).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <SubmitButton tone={tone}>{confirm}</SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      </Dialog>
    </>
  );
}

export function CopyButton({ text, label = "Salin" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      small
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check className="size-4" strokeWidth={3} /> : <Copy className="size-4" strokeWidth={2.5} />}
      {done ? "Tersalin" : label}
    </Button>
  );
}

const PRESETS = [
  { key: "7", label: "7 hari" },
  { key: "30", label: "30 hari" },
  { key: "90", label: "90 hari" },
  { key: "bulan", label: "Bulan ini" },
];

/** Pilih periode laporan: preset atau rentang tanggal (kalender kustom) → ?from=&to= di URL. */
export function PeriodPicker({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const go = (f: string, t: string) => {
    const next = new URLSearchParams(sp.toString());
    next.set("from", f);
    next.set("to", t);
    next.delete("page");
    router.push(`${path}?${next}`);
  };
  const preset = (k: string) => {
    const t = todayYmd();
    if (k === "bulan") return go(`${t.slice(0, 8)}01`, t);
    const [y, m, d] = t.split("-").map(Number);
    const f = new Date(Date.UTC(y, m - 1, d - (Number(k) - 1))).toISOString().slice(0, 10);
    go(f, t);
  };
  return (
    <div className="relative flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button key={p.key} type="button" onClick={() => preset(p.key)} className="h-9 rounded-full border-2 border-ink bg-white px-3 text-xs font-bold hover:bg-booth-yellow">
          {p.label}
        </button>
      ))}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn("inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-ink px-3 text-xs font-bold", open ? "bg-ink text-white" : "bg-booth-yellow")}
      >
        <CalendarDays aria-hidden className="size-4" strokeWidth={2.5} />
        {ymdLabel(from)} – {ymdLabel(to)}
      </button>
      {open && (
        <RangePicker
          from={from}
          to={to}
          onClose={() => setOpen(false)}
          onApply={(f, t) => {
            setOpen(false);
            go(f, t);
          }}
        />
      )}
    </div>
  );
}

/** Filter pilihan yang langsung mengganti parameter URL (status, booth, dll.). */
export function FilterSelect({ name, value, options, label }: { name: string; value: string; options: Option[]; label: string }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  return (
    <Select
      pill
      label={label}
      value={value}
      options={options}
      onChange={(v) => {
        const next = new URLSearchParams(sp.toString());
        if (v) next.set(name, v);
        else next.delete(name);
        next.delete("page");
        router.push(`${path}?${next}`);
      }}
    />
  );
}
