import { Suspense } from "react";
import { Plus } from "lucide-react";
import { TemplateFilters } from "@/components/dash/template-filters";
import { TemplateGrid } from "@/components/dash/template-list";
import { ErrorBox, LinkButton, Loading, PageHeader, Pagination } from "@/components/dash/ui";
import { api, ApiError, qs } from "@/lib/dash/api";
import type { SP } from "@/lib/dash/period";
import { deleteOwnerTemplate, setOwnerTemplateActive } from "@/lib/dash/template-actions";
import type { FrameTemplate, TemplateCategory } from "@/lib/dash/types";

async function Content({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  let res, categories: TemplateCategory[];
  try {
    const [tr, cr] = await Promise.all([
      api<{ templates: FrameTemplate[] }>("owner", `/owner/templates${qs({ source: sp.source, category: sp.category, q: sp.q, page: sp.page, per_page: 24 })}`),
      api<{ categories: TemplateCategory[] }>("owner", "/owner/template-categories"),
    ]);
    res = tr;
    categories = cr.data.categories;
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  const filtered = Boolean(sp.q || sp.category || (sp.source && sp.source !== "all"));
  return (
    <>
      <PageHeader
        title="Template"
        subtitle="Bingkai foto yang tampil di booth. Matikan yang tidak dipakai; buat sendiri dari PNG."
        actions={
          <LinkButton href="/dashboard/template/baru" tone="blue" icon={Plus}>
            Buat template
          </LinkButton>
        }
      />
      <TemplateFilters
        base="/dashboard/template"
        sp={sp}
        categories={categories}
        sources={[
          { key: "all", label: "Semua" },
          { key: "mine", label: "Buatan saya" },
          { key: "builtin", label: "Bawaan Sissi" },
        ]}
      />
      <TemplateGrid
        templates={res.data.templates}
        editBase="/dashboard/template"
        setActive={setOwnerTemplateActive}
        remove={deleteOwnerTemplate}
        canEdit={(t) => t.source === "mine"}
        emptyText={filtered ? "Tidak ada template yang cocok dengan filter." : "Belum ada template. Buat dari bingkai PNG milikmu."}
      />
      <Pagination page={res.meta.page} perPage={res.meta.per_page} total={res.meta.total} base="/dashboard/template" params={sp} inCard={false} />
    </>
  );
}

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<Loading />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
