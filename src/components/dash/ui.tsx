import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { cn } from "@/components/shared/cn";
import { dayLabel, number, rupiahShort } from "@/lib/dash/format";

/** Komponen dashboard (server-safe) — gaya dashboard umum yang netral (tidak mengikuti tema booth). */

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold leading-tight tracking-tight md:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-subtle">{subtitle}</p>}
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
    <section className={cn("min-w-0 rounded-xl border border-edge bg-surface shadow-card", className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-edge px-5 py-3.5">
          <h2 className="text-sm font-semibold">{title}</h2>
          {action}
        </header>
      )}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

/** Nada warna: dipakai untuk ikon kartu angka & tombol tautan (bukan latar penuh). */
const tones = {
  yellow: "bg-warning-soft text-warning",
  pink: "bg-danger-soft text-danger",
  blue: "bg-primary-soft text-primary",
  green: "bg-success-soft text-success",
  orange: "bg-warning-soft text-warning",
  lilac: "bg-info-soft text-info",
  white: "bg-canvas text-subtle",
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
    <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-edge bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-subtle">{label}</span>
        {Icon && (
          <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
            <Icon aria-hidden className="size-4" strokeWidth={2} />
          </span>
        )}
      </div>
      <span className="break-words text-lg font-semibold leading-tight tracking-tight sm:text-2xl">{value}</span>
      <div className="flex min-h-5 flex-wrap items-center gap-2 text-xs text-subtle">
        {change != null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-px font-medium",
              good ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
            )}
          >
            {change >= 0 ? <ArrowUpRight className="size-3" strokeWidth={2} /> : <ArrowDownRight className="size-3" strokeWidth={2} />}
            {Math.abs(change)}%
          </span>
        )}
        {hint && <span className="truncate">{hint}</span>}
      </div>
    </div>
  );
}

const badgeTones: Record<string, string> = {
  active: "bg-success-soft text-success ring-success/20",
  valid: "bg-success-soft text-success ring-success/20",
  completed: "bg-success-soft text-success ring-success/20",
  expiring: "bg-warning-soft text-warning ring-warning/20",
  scheduled: "bg-info-soft text-info ring-info/20",
  expired: "bg-canvas text-subtle ring-edge-strong",
  none: "bg-canvas text-subtle ring-edge-strong",
  abandoned: "bg-canvas text-subtle ring-edge-strong",
  suspended: "bg-danger-soft text-danger ring-danger/20",
  void: "bg-danger-soft text-danger ring-danger/20",
  kiosk: "bg-primary-soft text-primary ring-primary/20",
  event: "bg-warning-soft text-warning ring-warning/20",
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
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium leading-4 ring-1 ring-inset",
        badgeTones[status] ?? "bg-canvas text-subtle ring-edge-strong",
      )}
    >
      {label ?? badgeLabels[status] ?? status}
    </span>
  );
}

/**
 * Tabel data: menempel ke tepi kartu (kepala abu-abu, baris bergaris tipis, sorot saat diarahkan).
 * Gulir horizontal di layar sempit, bukan meluber. Dipakai di dalam `Card` (padding 20px).
 */
export function Table({ head, children, empty }: { head: React.ReactNode[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="-mx-5 overflow-x-auto border-t border-edge first:-mt-5 first:rounded-t-xl first:border-t-0 last:-mb-5">
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={i}
                className="whitespace-nowrap border-b border-edge bg-canvas px-4 py-2.5 text-xs font-medium text-subtle first:pl-5 last:pr-5"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:border-b [&_td]:border-edge [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle [&_td:first-child]:pl-5 [&_td:last-child]:pr-5 [&_tr:hover_td]:bg-canvas/60 [&_tr:last-child_td]:border-0">
          {children}
        </tbody>
      </table>
      {empty && <Empty />}
    </div>
  );
}

export function Empty({ text = "Belum ada data untuk ditampilkan.", icon: Icon = Inbox }: { text?: string; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-subtle">
      <Icon aria-hidden className="size-8 text-edge-strong" strokeWidth={1.75} />
      <p>{text}</p>
    </div>
  );
}

const linkTones: Record<Tone, string> = {
  blue: "bg-primary text-white hover:bg-primary-hover",
  pink: "bg-danger text-white hover:bg-danger-hover",
  green: "border border-edge-strong bg-surface text-fg hover:bg-canvas",
  yellow: "border border-edge-strong bg-surface text-fg hover:bg-canvas",
  orange: "border border-edge-strong bg-surface text-fg hover:bg-canvas",
  lilac: "border border-edge-strong bg-surface text-fg hover:bg-canvas",
  white: "border border-edge-strong bg-surface text-fg hover:bg-canvas",
};

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
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium shadow-card transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    small ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
    linkTones[tone],
  );
  const inner = (
    <>
      {Icon && <Icon aria-hidden className="size-4 shrink-0" strokeWidth={2} />}
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

/** Nomor halaman yang ditampilkan: 1 … (sekitar halaman aktif) … terakhir. "gap" = elipsis. */
function pageItems(page: number, pages: number): (number | "gap")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const keep = new Set([1, 2, pages - 1, pages, page - 1, page, page + 1]);
  // Di dekat ujung, tampilkan cukup banyak agar jumlah tombol tetap stabil.
  if (page <= 4) [3, 4, 5].forEach((n) => keep.add(n));
  if (page >= pages - 3) [pages - 4, pages - 3, pages - 2].forEach((n) => keep.add(n));
  const nums = [...keep].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push(n - nums[i - 1] === 2 ? n - 1 : "gap");
    out.push(n);
  });
  return out;
}

/**
 * Navigasi halaman (?page=) mempertahankan parameter lain: ‹ 1 2 … 6 7 ›.
 * Di dalam `Card` (bawaan) menempel ke tepi bawah kartu; `inCard={false}` untuk daftar kartu/galeri.
 */
export function Pagination({
  page,
  perPage,
  total,
  base,
  params,
  inCard = true,
}: {
  page: number;
  perPage: number;
  total: number;
  base: string;
  params: Record<string, string | undefined>;
  inCard?: boolean;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") sp.set(k, v);
    sp.set("page", String(p));
    return `${base}?${sp}`;
  };
  const first = (page - 1) * perPage + 1;
  const last = Math.min(total, page * perPage);
  const cell = "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm tabular-nums";
  const arrow = (to: number, label: string, icon: React.ReactNode, ok: boolean) =>
    ok ? (
      <Link href={href(to)} aria-label={label} className={cn(cell, "border border-edge-strong bg-surface shadow-card hover:bg-canvas")}>
        {icon}
      </Link>
    ) : (
      <span aria-hidden className={cn(cell, "border border-edge text-edge-strong")}>
        {icon}
      </span>
    );
  return (
    <nav
      aria-label="Halaman"
      className={cn(
        "flex flex-col items-center gap-3 text-sm sm:flex-row sm:justify-between",
        inCard ? "-mx-5 -mb-5 mt-0 border-t border-edge px-5 py-3" : "mt-6",
      )}
    >
      <span className="text-subtle">
        Menampilkan <b className="font-medium text-fg">{first}–{last}</b> dari <b className="font-medium text-fg">{total}</b>
      </span>
      <div className="flex items-center gap-1">
        {arrow(page - 1, "Halaman sebelumnya", <ChevronLeft className="size-4" strokeWidth={2} />, page > 1)}
        {/* HP: cukup "6 / 13" agar tidak meluber; layar lebar: nomor halaman. */}
        <span className="px-2 text-subtle sm:hidden">
          {page} / {pages}
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          {pageItems(page, pages).map((it, i) =>
            it === "gap" ? (
              <span key={`g${i}`} aria-hidden className={cn(cell, "text-subtle")}>
                …
              </span>
            ) : it === page ? (
              <span key={it} aria-current="page" className={cn(cell, "bg-primary font-medium text-white")}>
                {it}
              </span>
            ) : (
              <Link key={it} href={href(it)} aria-label={`Halaman ${it}`} className={cn(cell, "text-fg hover:bg-canvas")}>
                {it}
              </Link>
            ),
          )}
        </span>
        {arrow(page + 1, "Halaman berikutnya", <ChevronRight className="size-4" strokeWidth={2} />, page < pages)}
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
  const fill = { blue: "var(--color-primary)", pink: "var(--color-danger)", green: "var(--color-success)", orange: "var(--color-warning)" }[tone];
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
            <line x1={padL} x2={W - 8} y1={y} y2={y} stroke="var(--color-edge)" strokeWidth={1} />
            <text x={padL - 8} y={y + 4} textAnchor="end" fontSize={11} fill="var(--color-subtle)">
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
            <rect x={x} y={padT + ih - h} width={Math.max(2, bw * 0.7)} height={Math.max(v > 0 ? 2 : 0, h)} rx={Math.min(3, bw * 0.2)} fill={fill}>
              <title>{`${dayLabel(p.date)}: ${value === "revenue" ? format(v) : `${v} transaksi`}`}</title>
            </rect>
            {i % every === 0 && (
              <text x={padL + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--color-subtle)">
                {dayLabel(p.date)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Jam ramai: 24 batang jam WIB; jam tersibuk diberi warna utama + keterangan. */
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
      <div className="flex h-36 items-end gap-0.5 border-b border-edge sm:gap-1" role="img" aria-label="Grafik jam ramai">
        {hours.map((h) => (
          <div
            key={h.hour}
            title={`${jam(h.hour)}: ${h.transactions} sesi`}
            className={cn(
              "flex-1 rounded-t",
              h.hour === peak.hour ? "bg-primary" : "bg-primary-muted",
            )}
            style={{ height: h.transactions > 0 ? `${Math.max(3, (h.transactions / max) * 100)}%` : 0 }}
          />
        ))}
      </div>
      <div className="mt-1 flex gap-0.5 text-[11px] text-subtle sm:gap-1">
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
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r, i) => (
        <li key={r.label + i} className="min-w-0">
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium">{r.label}</span>
            <span className="shrink-0 font-semibold tabular-nums">{format(r.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-canvas">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
          </div>
          {r.sub && <p className="mt-0.5 text-xs text-subtle">{r.sub}</p>}
        </li>
      ))}
    </ul>
  );
}

/** Pesan galat API di dalam halaman (server tidak bisa dihubungi, dll.). */
export function ErrorBox({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-xl border border-danger/20 bg-danger-soft p-4 text-sm font-medium text-danger">
      {message}
    </div>
  );
}

/** Kerangka saat data dimuat (fallback Suspense). */
export function Loading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Memuat">
      <div className="mb-6 h-8 w-56 rounded-lg bg-edge" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl border border-edge bg-surface" />
        ))}
      </div>
      <div className="mt-6 h-72 rounded-xl border border-edge bg-surface" />
    </div>
  );
}

/** Sisa kertas printer booth (bar + angka); kuning ≤ 30%, merah ≤ 10%. */
export function PaperLevel({ left, capacity }: { left: number | null; capacity: number | null }) {
  if (left == null || !capacity) return <span className="text-xs text-subtle">belum dilaporkan</span>;
  const pct = Math.round((left / capacity) * 100);
  const low = pct <= 10;
  return (
    <div className="flex min-w-28 flex-col gap-1">
      <div className="h-2 overflow-hidden rounded-full bg-canvas">
        <div className={cn("h-full rounded-full", low ? "bg-danger" : pct <= 30 ? "bg-warning-solid" : "bg-success-solid")} style={{ width: `${Math.max(3, pct)}%` }} />
      </div>
      <span className={cn("text-xs", low ? "font-medium text-danger" : "text-subtle")}>
        {left}/{capacity} lembar{low && " · segera isi"}
      </span>
    </div>
  );
}
