import { Suspense } from "react";
import { ChangePasswordForm, NewAdminButton } from "@/components/dash/admin-forms";
import { ConfirmAction } from "@/components/dash/client";
import { Card, ErrorBox, Loading, PageHeader, Table } from "@/components/dash/ui";
import { deleteAdmin } from "@/lib/dash/admin-actions";
import { api, ApiError } from "@/lib/dash/api";
import { date } from "@/lib/dash/format";
import type { AdminAccount } from "@/lib/dash/types";

async function Content() {
  let admins: AdminAccount[], me: AdminAccount;
  try {
    const [ar, mr] = await Promise.all([api<{ admins: AdminAccount[] }>("admin", "/admin/admins"), api<AdminAccount>("admin", "/admin/me")]);
    admins = ar.data.admins;
    me = mr.data;
  } catch (e) {
    if (e instanceof ApiError) return <ErrorBox message={e.message} />;
    throw e;
  }
  return (
    <>
      <PageHeader title="Pengaturan" subtitle="Akun admin dashboard." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Admin" className="lg:col-span-3" action={<NewAdminButton />}>
          <Table head={["Nama", "Email", "Sejak", ""]}>
            {admins.map((a) => (
              <tr key={a.id}>
                <td className="font-semibold">{a.name}{a.id === me.id && " (kamu)"}</td>
                <td>{a.email}</td>
                <td className="whitespace-nowrap">{date(a.created_at)}</td>
                <td className="text-right">
                  {a.id !== me.id && (
                    <ConfirmAction label="Hapus" title={`Hapus admin ${a.name}?`} message="Admin ini tidak bisa masuk dashboard lagi." confirm="Hapus" action={deleteAdmin} hidden={{ id: a.id }} />
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card title="Ganti kata sandi" className="lg:col-span-2">
          <ChangePasswordForm />
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
