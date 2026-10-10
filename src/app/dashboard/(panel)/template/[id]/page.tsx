import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TemplateEditor } from "@/components/dash/template-editor";
import { ErrorBox, Loading } from "@/components/dash/ui";
import { api, ApiError } from "@/lib/dash/api";
import { saveOwnerTemplate } from "@/lib/dash/template-actions";
import type { FrameTemplate, TemplateCategory } from "@/lib/dash/types";

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let template: FrameTemplate, categories: TemplateCategory[];
  try {
    const [tr, cr] = await Promise.all([
      api<FrameTemplate>("owner", `/owner/templates/${encodeURIComponent(id)}`),
      api<{ categories: TemplateCategory[] }>("owner", "/owner/template-categories"),
    ]);
    template = tr.data;
    categories = cr.data.categories;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  // Template bawaan Sissi hanya bisa ditampilkan/disembunyikan, tidak diubah.
  if (template.source !== "mine") notFound();
  return <TemplateEditor key={`${template.id}-${template.version}`} template={template} categories={categories} action={saveOwnerTemplate} backHref="/dashboard/template" />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Loading />}>
      <Content params={params} />
    </Suspense>
  );
}
