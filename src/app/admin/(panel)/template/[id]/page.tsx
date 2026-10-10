import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TemplateEditor } from "@/components/dash/template-editor";
import { ErrorBox, Loading } from "@/components/dash/ui";
import { api, ApiError } from "@/lib/dash/api";
import { saveAdminTemplate } from "@/lib/dash/template-actions";
import type { FrameTemplate, TemplateCategory } from "@/lib/dash/types";

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let template: FrameTemplate, categories: TemplateCategory[];
  try {
    const [tr, cr] = await Promise.all([
      api<FrameTemplate>("admin", `/admin/templates/${encodeURIComponent(id)}`),
      api<{ categories: TemplateCategory[] }>("admin", "/admin/template-categories"),
    ]);
    template = tr.data;
    categories = cr.data.categories;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  return <TemplateEditor key={`${template.id}-${template.version}`} template={template} categories={categories} action={saveAdminTemplate} backHref="/admin/template" builtin />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Loading />}>
      <Content params={params} />
    </Suspense>
  );
}
