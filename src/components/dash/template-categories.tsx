"use client";

import { Plus } from "lucide-react";
import { createCategory, updateCategory } from "@/lib/dash/template-actions";
import type { TemplateCategory } from "@/lib/dash/types";
import { ActionForm, Button, DialogAction, DialogFooter, Field, SubmitButton } from "./client";

/** Dialog tambah kategori template (admin Sissi). */
export function NewCategoryButton() {
  return (
    <DialogAction label="Tambah kategori" title="Tambah kategori template" small icon={<Plus className="size-4" strokeWidth={2} />}>
      {(close) => (
        <ActionForm action={createCategory} onDone={close}>
          {(s) => (
            <>
              <Field label="Nama" name="name" placeholder="mis. Wisuda" required maxLength={40} error={s.fields?.name} />
              <Field
                label="Slug"
                name="slug"
                placeholder="mis. wisuda"
                required
                pattern="[a-z0-9-]{2,40}"
                error={s.fields?.slug}
                hint="Huruf kecil, angka, tanda minus. Tidak bisa diubah setelah dibuat."
              />
              <Field label="Urutan" name="sort" type="number" inputMode="numeric" defaultValue="100" error={s.fields?.sort} hint="Angka kecil tampil lebih dulu." />
              <DialogFooter>
                <Button type="button" onClick={close}>Batal</Button>
                <SubmitButton>Simpan</SubmitButton>
              </DialogFooter>
            </>
          )}
        </ActionForm>
      )}
    </DialogAction>
  );
}

/** Dialog ubah nama/urutan kategori. */
export function EditCategoryButton({ category }: { category: TemplateCategory }) {
  return (
    <DialogAction label="Ubah" title={`Ubah kategori ${category.name}`} small>
      {(close) => (
        <ActionForm action={updateCategory} onDone={close}>
          {(s) => (
            <>
              <input type="hidden" name="id" value={category.id} />
              <Field label="Nama" name="name" defaultValue={category.name} required maxLength={40} error={s.fields?.name} />
              <Field label="Urutan" name="sort" type="number" inputMode="numeric" defaultValue={String(category.sort)} error={s.fields?.sort} />
              <p className="text-xs text-subtle">Slug: <span className="font-mono">{category.slug}</span></p>
              <DialogFooter>
                <Button type="button" onClick={close}>Batal</Button>
                <SubmitButton>Simpan</SubmitButton>
              </DialogFooter>
            </>
          )}
        </ActionForm>
      )}
    </DialogAction>
  );
}
