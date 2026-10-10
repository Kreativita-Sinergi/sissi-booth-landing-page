"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, type Role } from "./api";
import type { ActionState } from "./action-state";
import { failed, str } from "./errors";
import type { TemplateAsset } from "./types";

/**
 * Aksi server template bingkai (docs/api.md §8): pemilik (`/owner/templates`) & admin Sissi untuk
 * template bawaan (`/admin/templates`). Simpan = multipart `meta` (JSON) + `frame` (PNG, opsional saat ubah).
 */

const BASE: Record<Role, { api: string; page: string }> = {
  owner: { api: "/owner/templates", page: "/dashboard/template" },
  admin: { api: "/admin/templates", page: "/admin/template" },
};

const json = (method: string, body?: unknown): RequestInit => ({ method, body: body === undefined ? undefined : JSON.stringify(body) });

async function save(role: Role, f: FormData): Promise<ActionState> {
  const id = str(f, "id");
  const body = new FormData();
  body.set("meta", str(f, "meta"));
  const frame = f.get("frame");
  if (frame instanceof File && frame.size > 0) body.set("frame", frame, "frame.png");
  try {
    await api(role, id ? `${BASE[role].api}/${id}` : BASE[role].api, { method: id ? "PUT" : "POST", body });
  } catch (e) {
    return failed(e);
  }
  revalidatePath(BASE[role].page, "layout");
  redirect(BASE[role].page);
}

async function setActive(role: Role, f: FormData): Promise<ActionState> {
  try {
    await api(role, `${BASE[role].api}/${str(f, "id")}/active`, json("PATCH", { active: str(f, "active") === "1" }));
  } catch (e) {
    return failed(e);
  }
  revalidatePath(BASE[role].page, "layout");
  return { ok: true };
}

async function remove(role: Role, f: FormData): Promise<ActionState> {
  try {
    await api(role, `${BASE[role].api}/${str(f, "id")}`, json("DELETE"));
  } catch (e) {
    return failed(e);
  }
  revalidatePath(BASE[role].page, "layout");
  return { ok: true, message: "Template dihapus." };
}

/** Hasil unggah gambar lapisan (dipanggil langsung dari editor, bukan lewat form). */
export type UploadAssetResult = { ok: true; asset: TemplateAsset } | { ok: false; message: string };

async function uploadAsset(role: Role, f: FormData): Promise<UploadAssetResult> {
  const file = f.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Pilih gambar dulu." };
  const body = new FormData();
  body.set("file", file, file.name || "gambar.png");
  try {
    const r = await api<TemplateAsset>(role, role === "owner" ? "/owner/template-assets" : "/admin/template-assets", { method: "POST", body });
    return { ok: true, asset: r.data };
  } catch (e) {
    return { ok: false, message: failed(e).message ?? "Gambar gagal diunggah." };
  }
}

export async function uploadOwnerAsset(f: FormData) {
  return uploadAsset("owner", f);
}
export async function uploadAdminAsset(f: FormData) {
  return uploadAsset("admin", f);
}

export async function saveOwnerTemplate(_: ActionState, f: FormData) {
  return save("owner", f);
}
export async function saveAdminTemplate(_: ActionState, f: FormData) {
  return save("admin", f);
}
export async function setOwnerTemplateActive(_: ActionState, f: FormData) {
  return setActive("owner", f);
}
export async function setAdminTemplateActive(_: ActionState, f: FormData) {
  return setActive("admin", f);
}
export async function deleteOwnerTemplate(_: ActionState, f: FormData) {
  return remove("owner", f);
}
export async function deleteAdminTemplate(_: ActionState, f: FormData) {
  return remove("admin", f);
}

// --- Kategori (admin) ---

export async function createCategory(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("admin", "/admin/template-categories", json("POST", { slug: str(f, "slug").toLowerCase(), name: str(f, "name"), sort: Number(str(f, "sort") || 0) }));
  } catch (e) {
    return failed(e);
  }
  revalidatePath("/admin/template", "layout");
  return { ok: true, message: "Kategori ditambahkan." };
}

export async function updateCategory(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("admin", `/admin/template-categories/${str(f, "id")}`, json("PATCH", { name: str(f, "name"), sort: Number(str(f, "sort") || 0) }));
  } catch (e) {
    return failed(e);
  }
  revalidatePath("/admin/template", "layout");
  return { ok: true, message: "Kategori disimpan." };
}

export async function deleteCategory(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("admin", `/admin/template-categories/${str(f, "id")}`, json("DELETE"));
  } catch (e) {
    return failed(e);
  }
  revalidatePath("/admin/template", "layout");
  return { ok: true, message: "Kategori dihapus." };
}
