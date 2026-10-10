import Link from "next/link";
import { cn } from "@/components/shared/cn";
import type { TemplateCategory } from "@/lib/dash/types";
import { FilterSelect } from "./client";
import { SearchBox } from "./search";

/** Baris filter daftar template: sumber (opsional), kategori, cari. Parameter URL dipertahankan. */
export function TemplateFilters({
  base,
  sp,
  categories,
  sources,
}: {
  base: string;
  sp: Record<string, string | undefined>;
  categories: TemplateCategory[];
  sources?: { key: string; label: string }[];
}) {
  const current = sp.source ?? "all";
  const href = (source: string) => {
    const q = new URLSearchParams();
    if (source !== "all") q.set("source", source);
    if (sp.category) q.set("category", sp.category);
    if (sp.q) q.set("q", sp.q);
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };
  return (
    <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {sources && (
          <nav className="inline-flex rounded-lg bg-surface p-0.5 ring-1 ring-inset ring-edge" aria-label="Sumber template">
            {sources.map((s) => (
              <Link
                key={s.key}
                href={href(s.key)}
                aria-current={current === s.key ? "page" : undefined}
                className={cn("inline-flex h-7 items-center rounded-md px-3 text-xs font-medium", current === s.key ? "bg-primary-soft text-primary" : "text-subtle hover:text-fg")}
              >
                {s.label}
              </Link>
            ))}
          </nav>
        )}
        <FilterSelect
          name="category"
          value={sp.category ?? ""}
          label="Kategori"
          options={[{ value: "", label: "Semua kategori" }, ...categories.map((c) => ({ value: c.slug, label: `${c.name} (${c.templates})` }))]}
        />
      </div>
      <SearchBox q={sp.q} placeholder="Cari nama template…" keep={{ source: sp.source, category: sp.category }} />
    </div>
  );
}
