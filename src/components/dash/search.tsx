import { Search } from "lucide-react";

/** Kotak cari (form GET biasa — mempertahankan filter lain lewat input tersembunyi). */
export function SearchBox({ q, placeholder, keep }: { q?: string; placeholder: string; keep?: Record<string, string | undefined> }) {
  return (
    <form method="get" className="relative w-full sm:w-72" role="search">
      {Object.entries(keep ?? {}).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" strokeWidth={2} />
      <input
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-8 w-full rounded-lg border border-edge-strong bg-surface pl-9 pr-3 text-sm shadow-card outline-none placeholder:text-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
      />
    </form>
  );
}
