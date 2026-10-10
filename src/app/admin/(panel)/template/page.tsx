import { Suspense } from "react";
import { Plus } from "lucide-react";
import { ConfirmAction } from "@/components/dash/client";
import { EditCategoryButton, NewCategoryButton } from "@/components/dash/template-categories";
import { TemplateFilters } from "@/components/dash/template-filters";
import { TemplateGrid } from "@/components/dash/template-list";
import { Card, ErrorBox, LinkButton, Loading, PageHeader, Pagination, Table } from "@/components/dash/ui";
import { api, ApiError, qs } from "@/lib/dash/api";
import type { SP } from "@/lib/dash/period";
import { deleteAdminTemplate, deleteCategory, setAdminTemplateActive } from "@/lib/dash/template-actions";
import type { FrameTemplate, TemplateCategory } from "@/lib/dash/types";

async function Content({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  let res, categories: TemplateCategory[];
  try {
    const [tr, cr] = await Promise.all([
      api<{ templates: FrameTemplate[] }>("admin", `/admin/templates${qs({ category: sp.category, q: sp.q, page: sp.page, per_page: 24 })}`),
      api<{ categories: TemplateCategory[] }>("admin", "/admin/template-categories"),
    ]);
    res = tr;
    categories = cr.data.categories;
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  return (
    <>
      <PageHeader
        title="Template bawaan"
        subtitle="Bingkai dari tim Sissi yang tersedia untuk semua pemilik booth. Nonaktif = hilang dari semua pemilik."
        actions={
          <LinkButton href="/admin/template/baru" tone="blue" icon={Plus}>
            Buat template
          </LinkButton>
        }
      />
      <TemplateFilters base="/admin/template" sp={sp} categories={categories} />
      <TemplateGrid
        templates={res.data.templates}
        editBase="/admin/template"
        setActive={setAdminTemplateActive}
        remove={deleteAdminTemplate}
        canEdit={() => true}
        emptyText={sp.q || sp.category ? "Tidak ada template yang cocok dengan filter." : "Belum ada template bawaan."}
      />
      <Pagination page={res.meta.page} perPage={res.meta.per_page} total={res.meta.total} base="/admin/template" params={sp} inCard={false} />

      <Card title="Kategori template" className="mt-8" action={<NewCategoryButton />}>
        <Table head={["Nama", "Slug", "Urutan", "Template bawaan", ""]} empty={categories.length === 0}>
          {categories.map((c) => (
            <tr key={c.id}>
              <td className="font-medium">{c.name}</td>
              <td className="font-mono text-xs text-subtle">{c.slug}</td>
              <td className="tabular-nums">{c.sort}</td>
              <td className="tabular-nums">{c.templates}</td>
              <td>
                <div className="flex justify-end gap-2">
                  <EditCategoryButton category={c} />
                  <ConfirmAction
                    label="Hapus"
                    title={`Hapus kategori ${c.name}?`}
                    message="Template yang memakai kategori ini tidak ikut terhapus, hanya label kategorinya yang lepas."
                    confirm="Hapus"
                    action={deleteCategory}
                    hidden={{ id: c.id }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
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
