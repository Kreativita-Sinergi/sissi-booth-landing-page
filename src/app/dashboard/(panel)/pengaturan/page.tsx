import { Suspense } from "react";
import { OwnerPasswordForm, ProfileForm } from "@/components/dash/owner-forms";
import { Card, ErrorBox, Loading, PageHeader } from "@/components/dash/ui";
import { api, ApiError } from "@/lib/dash/api";
import type { OwnerProfile } from "@/lib/dash/types";

async function Content() {
  let me: OwnerProfile;
  try {
    me = (await api<OwnerProfile>("owner", "/owner/me")).data;
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  return (
    <>
      <PageHeader title="Pengaturan" subtitle={`Masuk sebagai ${me.email}. Ganti email lewat tim Sissi.`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Profil & biaya">
          <ProfileForm me={me} />
        </Card>
        <Card title="Ganti kata sandi">
          <OwnerPasswordForm />
        </Card>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Content />
    </Suspense>
  );
}
