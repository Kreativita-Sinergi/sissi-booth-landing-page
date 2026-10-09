import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { cn } from "@/components/shared/cn";
import { dayLabel, number, rupiahShort } from "@/lib/dash/format";

/** Komponen dashboard (server-safe) — gaya Sticker Bomb versi tenang untuk data. */

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="font-label text-2xl leading-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted md:text-base">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  action,
  className,
  children,
  pad = true,
}: {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  pad?: boolean;
}) {
  return (
    <section className={cn("min-w-0 rounded-2xl border-2 border-ink bg-white shadow-hard-sm", className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b-2 border-ink/10 px-5 py-3.5">
          <h2 className="font-label text-sm uppercase tracking-wide">{title}</h2>
          {action}
        </header>
      )}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

const tones = {
  yellow: "bg-booth-yellow",
  pink: "bg-booth-pink",
  blue: "bg-booth-blue text-white",
  green: "bg-booth-green",
  orange: "bg-booth-orange",
  lilac: "bg-booth-lilac",
  white: "bg-white",
} as const;
export type Tone = keyof typeof tones;

/** Angka utama + perubahan terhadap periode sebelumnya. */
export function Stat({
  label,
  value,
  hint,
  change,
  icon: Icon,
  tone = "white",
  invert = false,
}: {
  label: string;
  value: string;
  hint?: string;
  change?: number | null;
  icon?: LucideIcon;
  tone?: Tone;
  /** true = naik itu buruk (mis. biaya). */
  invert?: boolean;
}) {
  const good = change == null ? null : invert ? change <= 0 : change >= 0;
  return (
    <div className={cn("flex min-w-0 flex-col gap-2 rounded-2xl border-2 border-ink p-4 shadow-hard-sm", tones[tone])}>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-bold uppercase tracking-wide opacity-80">{label}</span>
        {Icon && <Icon aria-hidden className="size-5 shrink-0" strokeWidth={2.5} />}
      </div>
      <span className="break-words font-label text-lg leading-tight sm:text-2xl md:text-[28px] md:leading-none">{value}</span>
      <div className="flex min-h-5 flex-wrap items-center gap-2 text-xs">
        {change != null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full border-2 border-ink px-1.5 py-px font-bold",
              good ? "bg-booth-green text-ink" : "bg-booth-pink text-ink",
            )}
          >
            {change >= 0 ? <ArrowUpRight className="size-3" strokeWidth={3} /> : <ArrowDownRight className="size-3" strokeWidth={3} />}
            {Math.abs(change)}%
          </span>
        )}
        {hint && <span className="truncate opacity-75">{hint}</span>}
      </div>
    </div>
  );
}

const badgeTones: Record<string, string> = {
  active: "bg-booth-green",
  valid: "bg-booth-green",
  completed: "bg-booth-green",
  expiring: "bg-booth-yellow",
  scheduled: "bg-booth-lilac",
  expired: "bg-line",
  none: "bg-white",
  abandoned: "bg-line",
  suspended: "bg-booth-pink",
  void: "bg-booth-pink",
  kiosk: "bg-booth-blue text-white",
  event: "bg-booth-orange",
};

const badgeLabels: Record<string, string> = {
  active: "Aktif",
  valid: "Sah",
  completed: "Selesai",
  expiring: "Segera habis",
  scheduled: "Terjadwal",
  expired: "Habis",
  none: "Belum langganan",
  abandoned: "Batal",
  suspended: "Ditangguhkan",
  void: "Dibatalkan",
  kiosk: "Kiosk",
  event: "Event",
};

export function Badge({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border-2 border-ink px-2 py-0.5 text-[11px] font-bold uppercase leading-4",
        badgeTones[status] ?? "bg-white",
      )}
    >
      {label ?? badgeLabels[status] ?? status}
    </span>
  );
}

/** Tabel data responsif: gulir horizontal di layar sempit, bukan meluber. */
export function Table({ head, children, empty }: { head: React.ReactNode[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} className="whitespace-nowrap border-b-2 border-ink px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted first:pl-0 last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:border-b [&_td]:border-line [&_td]:px-3 [&_td]:py-3 [&_td:first-child]:pl-0 [&_td:last-child]:pr-0 [&_tr:last-child_td]:border-0">
          {children}
        </tbody>
      </table>
      {empty && <Empty />}
    </div>
  );
}

export function Empty({ text = "Belum ada data untuk ditampilkan.", icon: Icon = Inbox }: { text?: string; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted">
      <Icon aria-hidden className="size-8" strokeWidth={2} />
      <p>{text}</p>
    </div>
  );
}

/** Tautan bergaya tombol (navigasi). */
export function LinkButton({
  href,
  children,
  tone = "white",
  icon: Icon,
  small,
  download,
}: {
  href: string;
  children: React.ReactNode;
  tone?: Tone;
  icon?: LucideIcon;
  small?: boolean;
  download?: boolean;
}) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border-2 border-ink font-label uppercase shadow-hard-sm transition-all",
    "hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
    "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-booth-blue",
    small ? "h-9 px-3 text-xs" : "h-11 px-4 text-sm",
    tones[tone],
  );
  const inner = (
    <>
      {Icon && <Icon aria-hidden className="size-4 shrink-0" strokeWidth={2.5} />}
      {children}
    </>
  );
  // Unduhan lewat <a> biasa agar browser menyimpan file (bukan navigasi klien).
  return download ? (
    <a href={href} className={cls} download>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

/** Navigasi halaman (?page=) mempertahankan parameter lain. */
export function Pagination({
  page,
  perPage,
  total,
  base,
  params,
}: {
  page: number;
  perPage: number;
  total: number;
  base: string;
  params: Record<string, string | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") sp.set(k, v);
    sp.set("page", String(p));
    return `${base}?${sp}`;
  };
  const btn = "inline-flex size-9 items-center justify-center rounded-lg border-2 border-ink bg-white shadow-hard-sm";
  return (
    <nav className="mt-4 flex items-center justify-between gap-3 text-sm" aria-label="Halaman">
      <span className="text-muted">
        {total} data · halaman {page}/{pages}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link className={btn} href={href(page - 1)} aria-label="Sebelumnya">
            <ChevronLeft className="size-4" strokeWidth={3} />
          </Link>
        ) : (
          <span className={cn(btn, "opacity-30 shadow-none")}><ChevronLeft className="size-4" strokeWidth={3} /></span>
        )}
        {page < pages ? (
          <Link className={btn} href={href(page + 1)} aria-label="Berikutnya">
            <ChevronRight className="size-4" strokeWidth={3} />
          </Link>
        ) : (
          <span className={cn(btn, "opacity-30 shadow-none")}><ChevronRight className="size-4" strokeWidth={3} /></span>
        )}
      </div>
    </nav>
  );
}

export type Point = { date: string; revenue: number; transactions: number };
type Hour = { hour: number; transactions: number; revenue: number };

/**
 * Grafik batang harian (SVG murni, tanpa pustaka). Label sumbu-x dijarangkan agar terbaca;
 * <title> tiap batang = nilai tepatnya (tooltip bawaan browser).
 */
export function BarChart({
  points,
  value = "revenue",
  tone = "blue",
  format = rupiahShort,
  height = 200,
}: {
  points: Point[];
  value?: "revenue" | "transactions";
  tone?: "blue" | "pink" | "green" | "orange";
  format?: (n: number) => string;
  height?: number;
}) {
  const fill = { blue: "var(--color-booth-blue)", pink: "var(--color-booth-pink)", green: "var(--color-booth-green)", orange: "var(--color-booth-orange)" }[tone];
  const vals = points.map((p) => p[value]);
  const max = Math.max(1, ...vals);
  const W = 720, H = height, padL = 52, padB = 26, padT = 10;
  const iw = W - padL - 8, ih = H - padB - padT;
  const bw = iw / Math.max(1, points.length);
  const every = Math.ceil(points.length / 8);
  const ticks = [0, 0.5, 1].map((f) => Math.round(max * f));
  if (points.length === 0 || vals.every((v) => v === 0)) {
    return <Empty text="Belum ada transaksi pada periode ini." />;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Grafik harian">
      {ticks.map((t) => {
        const y = padT + ih - (t / max) * ih;
        return (
          <g key={t}>
            <line x1={padL} x2={W - 8} y1={y} y2={y} stroke="var(--color-line)" strokeWidth={1.5} />
            <text x={padL - 8} y={y + 4} textAnchor="end" fontSize={11} fill="var(--color-muted)">
              {format(t)}
            </text>
          </g>
        );
      })}
      {points.map((p, i) => {
        const v = p[value];
        const h = (v / max) * ih;
        const x = padL + i * bw + bw * 0.15;
        return (
          <g key={p.date}>
            <rect x={x} y={padT + ih - h} width={Math.max(2, bw * 0.7)} height={Math.max(v > 0 ? 2 : 0, h)} rx={Math.min(4, bw * 0.2)} fill={fill} stroke="var(--color-ink)" strokeWidth={v > 0 ? 1.5 : 0}>
              <title>{`${dayLabel(p.date)}: ${value === "revenue" ? format(v) : `${v} transaksi`}`}</title>
            </rect>
            {i % every === 0 && (
              <text x={padL + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--color-muted)">
                {dayLabel(p.date)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Jam ramai: 24 batang jam WIB; jam tersibuk diberi warna pink + keterangan. */
export function HourChart({ hours }: { hours: Hour[] }) {
  const max = Math.max(0, ...hours.map((h) => h.transactions));
  if (hours.length === 0 || max === 0) return <Empty text="Belum ada transaksi pada periode ini." />;
  const peak = hours.reduce((a, b) => (b.transactions > a.transactions ? b : a));
  const jam = (h: number) => `${String(h).padStart(2, "0")}.00`;
  return (
    <div>
      <p className="mb-4 text-sm">
        Paling ramai <b>{jam(peak.hour)}–{jam((peak.hour + 1) % 24)}</b> ({number(peak.transactions)} sesi). Pastikan kertas & operator siap di jam ini.
      </p>
      <div className="flex h-36 items-end gap-0.5 border-b-2 border-line sm:gap-1" role="img" aria-label="Grafik jam ramai">
        {hours.map((h) => (
          <div
            key={h.hour}
            title={`${jam(h.hour)}: ${h.transactions} sesi`}
            className={cn(
              "flex-1 rounded-t-md",
              h.transactions > 0 && "border-2 border-b-0 border-ink",
              h.hour === peak.hour ? "bg-booth-pink" : "bg-booth-yellow",
            )}
            style={{ height: h.transactions > 0 ? `${Math.max(3, (h.transactions / max) * 100)}%` : 0 }}
          />
        ))}
      </div>
      <div className="mt-1 flex gap-0.5 text-[11px] text-muted sm:gap-1">
        {hours.map((h) => (
          <span key={h.hour} className="flex-1 text-center">
            {h.hour % 3 === 0 ? String(h.hour).padStart(2, "0") : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Daftar batang horizontal untuk rekap (layout, booth, paket, pemilik). */
export function Bars({ rows, format, empty }: { rows: { label: string; value: number; sub?: string }[]; format: (n: number) => string; empty?: string }) {
  if (rows.length === 0) return <Empty text={empty} />;
  const max = Math.max(1, ...rows.map((r) => r.value));
  const colors = ["bg-booth-blue", "bg-booth-pink", "bg-booth-green", "bg-booth-orange", "bg-booth-lilac", "bg-booth-yellow"];
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r, i) => (
        <li key={r.label + i} className="min-w-0">
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-bold">{r.label}</span>
            <span className="shrink-0 font-label">{format(r.value)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border-2 border-ink bg-paper">
            <div className={cn("h-full", colors[i % colors.length])} style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
          </div>
          {r.sub && <p className="mt-0.5 text-xs text-muted">{r.sub}</p>}
        </li>
      ))}
    </ul>
  );
}

/** Pesan galat API di dalam halaman (server tidak bisa dihubungi, dll.). */
export function ErrorBox({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-2xl border-2 border-ink bg-booth-pink/30 p-4 text-sm font-bold">
      {message}
    </div>
  );
}

/** Kerangka saat data dimuat (fallback Suspense). */
export function Loading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Memuat">
      <div className="mb-6 h-9 w-56 rounded-lg bg-ink/10" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl border-2 border-ink/10 bg-white" />
        ))}
      </div>
      <div className="mt-6 h-72 rounded-2xl border-2 border-ink/10 bg-white" />
    </div>
  );
}

/** Sisa kertas printer booth (bar + angka); merah bila ≤ 10%. */
export function PaperLevel({ left, capacity }: { left: number | null; capacity: number | null }) {
  if (left == null || !capacity) return <span className="text-xs text-muted">belum dilaporkan</span>;
  const pct = Math.round((left / capacity) * 100);
  const low = pct <= 10;
  return (
    <div className="flex min-w-28 flex-col gap-1">
      <div className="h-2.5 overflow-hidden rounded-full border-2 border-ink bg-paper">
        <div className={cn("h-full", low ? "bg-booth-pink" : pct <= 30 ? "bg-booth-yellow" : "bg-booth-green")} style={{ width: `${Math.max(3, pct)}%` }} />
      </div>
      <span className={cn("text-xs", low ? "font-bold text-[#c2185b]" : "text-muted")}>
        {left}/{capacity} lembar{low && " · segera isi"}
      </span>
    </div>
  );
}
