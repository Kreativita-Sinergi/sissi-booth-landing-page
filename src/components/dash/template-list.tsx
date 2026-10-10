import Link from "next/link";
import { LayoutTemplate, Pencil } from "lucide-react";
import { cn } from "@/components/shared/cn";
import type { ActionState } from "@/lib/dash/action-state";
import { FORMATS } from "@/lib/dash/template";
import type { FrameTemplate } from "@/lib/dash/types";
import { ActionSwitch, ConfirmAction } from "./client";
import { Empty } from "./ui";
import { TemplatePreview } from "./template-preview";

type Action = (s: ActionState, f: FormData) => Promise<ActionState>;

/** Kisi kartu template (pratinjau + nama + kategori + sakelar tampil + ubah/hapus). Server-safe. */
export function TemplateGrid({
  templates,
  editBase,
  setActive,
  remove,
  canEdit,
  emptyText,
}: {
  templates: FrameTemplate[];
  /** Mis. "/dashboard/template" → tautan ubah `${editBase}/${id}`. */
  editBase: string;
  setActive: Action;
  remove: Action;
  /** Template mana yang boleh diubah/dihapus (pemilik: hanya miliknya). */
  canEdit: (t: FrameTemplate) => boolean;
  emptyText: string;
}) {
  if (templates.length === 0) {
    return (
      <div className="rounded-xl border border-edge bg-surface shadow-card">
        <Empty text={emptyText} icon={LayoutTemplate} />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {templates.map((t) => {
        const edit = canEdit(t);
        return (
          <article key={t.id} className={cn("flex min-w-0 flex-col overflow-hidden rounded-xl border border-edge bg-surface shadow-card", !t.active && "opacity-75")}>
            <Link href={edit ? `${editBase}/${t.id}` : "#"} aria-disabled={!edit} tabIndex={edit ? undefined : -1} className={cn("flex h-60 items-center justify-center border-b border-edge bg-canvas p-4", !edit && "pointer-events-none")}>
              <TemplatePreview uid={t.id} src={t.frame_url} width={t.width} height={t.height} overlay={t.frame_overlay} slots={t.slots} images={t.images} numbers={false} className="h-full max-w-full rounded-sm shadow-card" />
            </Link>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="min-w-0 truncate font-semibold">{t.name}</h3>
                {t.source === "builtin" && !edit && (
                  <span className="shrink-0 rounded-full bg-info-soft px-2 py-0.5 text-xs font-medium text-info ring-1 ring-inset ring-info/20">Bawaan Sissi</span>
                )}
              </div>
              <p className="text-xs text-subtle">
                {FORMATS[t.format]?.label ?? t.format} · {t.slots.length} foto
                {t.categories.length > 0 && ` · ${t.categories.map((c) => c.name).join(", ")}`}
              </p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                <ActionSwitch action={setActive} id={t.id} active={t.active} label={`Tampilkan ${t.name}`} />
                {edit && (
                  <div className="flex gap-2">
                    <Link href={`${editBase}/${t.id}`} className="inline-flex h-8 items-center gap-1 rounded-lg border border-edge-strong bg-surface px-3 text-xs font-medium shadow-card hover:bg-canvas">
                      <Pencil className="size-3.5" strokeWidth={2} /> Ubah
                    </Link>
                    <ConfirmAction
                      label="Hapus"
                      title={`Hapus template ${t.name}?`}
                      message="Template hilang dari dashboard dan booth (setelah booth sinkron). Tidak bisa dibatalkan."
                      confirm="Hapus"
                      action={remove}
                      hidden={{ id: t.id }}
                    />
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
