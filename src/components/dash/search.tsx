import { Search } from "lucide-react";

/** Kotak cari (form GET biasa — mempertahankan filter lain lewat input tersembunyi). */
export function SearchBox({ q, placeholder, keep }: { q?: string; placeholder: string; keep?: Record<string, string | undefined> }) {
  return (
    <form method="get" className="relative w-full sm:w-72" role="search">
      {Object.entries(keep ?? {}).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" strokeWidth={2.5} />
      <input
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 w-full rounded-full border-2 border-ink bg-white pl-9 pr-3 text-sm outline-none focus:ring-3 focus:ring-booth-blue/30"
      />
    </form>
  );
}
