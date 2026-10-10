"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Check, Copy, Loader2, X } from "lucide-react";
import { cn } from "@/components/shared/cn";
import type { ActionState } from "@/lib/dash/action-state";
import { DateInput, RangePicker, Select, todayYmd, ymdLabel, type Option } from "./pickers";

const btnBase =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium shadow-card transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
/** blue = aksi utama, pink = berbahaya, green = konfirmasi positif; sisanya tombol sekunder. */
const btnTone = {
  blue: "bg-primary text-white hover:bg-primary-hover",
  green: "bg-success text-white hover:brightness-95",
  pink: "bg-danger text-white hover:bg-danger-hover",
  yellow: "border border-edge-strong bg-surface text-fg hover:bg-canvas",
  white: "border border-edge-strong bg-surface text-fg hover:bg-canvas",
  /** Pemicu aksi berbahaya di daftar/kartu; merah penuh hanya di dialog konfirmasi. */
  pinkSoft: "border border-danger/30 bg-surface text-danger hover:bg-danger-soft",
} as const;

export function Button({
  children,
  tone = "white",
  small,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: keyof typeof btnTone; small?: boolean }) {
  return (
    <button {...rest} className={cn(btnBase, small ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm", btnTone[tone], className)}>
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

/** Dialog kustom (bukan dialog bawaan browser). Esc / klik latar = tutup. */
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-fg/40 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={cn(
          "flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-surface shadow-pop sm:rounded-xl",
          wide ? "sm:max-w-2xl" : "sm:max-w-md",
        )}
      >
        {/* Judul & tombol tutup tetap di atas; isi (termasuk tombol bawah) yang bergulir. */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-edge px-5 py-4 sm:px-6">
          <h2 id={id} className="text-lg font-semibold leading-tight">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="-mr-1 rounded-lg p-1 text-subtle hover:bg-canvas hover:text-fg">
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-5 sm:px-6">
          {children}
          <div aria-hidden className="h-5 sm:h-6" />
        </div>
      </div>
    </div>
  );
}

/** Baris tombol di bawah isi dialog (ikut bergulir bersama isi; judul & X tetap di atas). */
export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">{children}</div>;
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
        <p role="alert" className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          {state.message}
        </p>
      )}
      {children(state)}
    </form>
  );
}

const fieldCls =
  "h-10 w-full rounded-lg border border-edge-strong bg-surface px-3 text-sm font-normal shadow-card outline-none placeholder:text-subtle focus:border-primary focus:ring-3 focus:ring-primary/15";

export function Field({
  label,
  name,
  error,
  hint,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string; hint?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
      {label}
      <input id={id} name={name} {...rest} className={cn(fieldCls, error && "border-danger")} aria-invalid={!!error} />
      {error ? <span className="text-xs font-normal text-danger">{error}</span> : hint && <span className="text-xs font-normal text-subtle">{hint}</span>}
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
    <div className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
      <span>{label}</span>
      <Select name={name} label={label} options={options} defaultValue={defaultValue} invalid={!!error} />
      {error && <span className="text-xs font-normal text-danger">{error}</span>}
    </div>
  );
}

/** Kolom tanggal dengan kalender kustom. */
export function DateField({ label, name, error, defaultValue }: { label: string; name: string; error?: string; defaultValue?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
      <span>{label}</span>
      <DateInput name={name} label={label} defaultValue={defaultValue} invalid={!!error} />
      {error && <span className="text-xs font-normal text-danger">{error}</span>}
    </div>
  );
}

export function TextArea({ label, name, error, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; name: string; error?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
      {label}
      <textarea id={id} name={name} rows={3} {...rest} className={cn(fieldCls, "h-auto py-2", error && "border-danger")} />
      {error && <span className="text-xs font-normal text-danger">{error}</span>}
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
      <Button type="button" tone={tone === "pink" ? "pinkSoft" : tone} small={small} onClick={() => setOpen(true)}>
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
              <DialogFooter>
                <Button type="button" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <SubmitButton tone={tone}>{confirm}</SubmitButton>
              </DialogFooter>
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
      {done ? <Check className="size-4" strokeWidth={2} /> : <Copy className="size-4" strokeWidth={2} />}
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
        <button key={p.key} type="button" onClick={() => preset(p.key)} className="h-8 rounded-lg border border-edge-strong bg-surface px-3 text-xs font-medium shadow-card hover:bg-canvas">
          {p.label}
        </button>
      ))}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium shadow-card", open ? "border-primary bg-primary-soft text-primary" : "border-edge-strong bg-surface hover:bg-canvas")}
      >
        <CalendarDays aria-hidden className="size-4" strokeWidth={2} />
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

/** Sakelar hidup/mati (role="switch"). */
export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50",
        checked ? "bg-primary" : "bg-edge-strong",
      )}
    >
      <span className={cn("inline-block size-4 rounded-full bg-white shadow-card transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
    </button>
  );
}

/**
 * Sakelar yang langsung menjalankan aksi server (mis. aktif/nonaktif template). Tampilan berubah
 * seketika; bila aksi gagal, kembali ke nilai awal & pesan galat tampil sebagai `title`.
 */
export function ActionSwitch({ action, id, active, label }: { action: Action; id: string; active: boolean; label: string }) {
  const [state, run, pending] = useActionState(action, {} as ActionState);
  const [value, setValue] = useState(active);
  const failedNow = state.ok === false;
  const shown = failedNow && !pending ? active : value;
  return (
    <span className="inline-flex items-center gap-2" title={failedNow ? state.message : undefined}>
      <Switch
        checked={shown}
        label={label}
        disabled={pending}
        onChange={(v) => {
          setValue(v);
          const f = new FormData();
          f.set("id", id);
          f.set("active", v ? "1" : "0");
          startTransition(() => run(f));
        }}
      />
      <span className={cn("text-xs", shown ? "text-fg" : "text-subtle")}>{shown ? "Tampil" : "Disembunyikan"}</span>
    </span>
  );
}
