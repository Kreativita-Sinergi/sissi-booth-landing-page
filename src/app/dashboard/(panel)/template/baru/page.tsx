import { Suspense } from "react";
import { TemplateEditor } from "@/components/dash/template-editor";
import { ErrorBox, Loading } from "@/components/dash/ui";
import { api, ApiError } from "@/lib/dash/api";
import { saveOwnerTemplate, uploadOwnerAsset } from "@/lib/dash/template-actions";
import type { TemplateCategory } from "@/lib/dash/types";

async function Content() {
  let categories: TemplateCategory[];
  try {
    categories = (await api<{ categories: TemplateCategory[] }>("owner", "/owner/template-categories")).data.categories;
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  return <TemplateEditor categories={categories} action={saveOwnerTemplate} uploadAsset={uploadOwnerAsset} backHref="/dashboard/template" />;
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Content />
    </Suspense>
  );
}
