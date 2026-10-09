"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "./api";
import type { ActionState } from "./action-state";
import { failed, money, str } from "./errors";

/** Aksi server dashboard admin. Semua memanggil API dengan token admin dari cookie. */

const send = (method: string, body?: unknown): RequestInit => ({ method, body: body === undefined ? undefined : JSON.stringify(body) });
const refresh = () => revalidatePath("/admin", "layout");
const int = (f: FormData, k: string, def = 0) => {
  const n = Number.parseInt(str(f, k), 10);
  return Number.isFinite(n) ? n : def;
};

export async function createOwner(_: ActionState, f: FormData): Promise<ActionState> {
  let id: string;
  try {
    const { data } = await api<{ id: string }>("admin", "/admin/owners", send("POST", {
      name: str(f, "name"), email: str(f, "email"), phone: str(f, "phone"), password: String(f.get("password") ?? ""),
    }));
    id = data.id;
  } catch (e) {
    return failed(e);
  }
  refresh();
  redirect(`/admin/pelanggan/${id}?baru=1`);
}

export async function updateOwner(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("admin", `/admin/owners/${str(f, "id")}`, send("PATCH", { name: str(f, "name"), email: str(f, "email"), phone: str(f, "phone") }));
  } catch (e) {
    return failed(e);
  }
  refresh();
  return { ok: true, message: "Profil disimpan." };
}

export async function resetOwnerPassword(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("admin", `/admin/owners/${str(f, "id")}/password`, send("POST", { password: String(f.get("password") ?? "") }));
  } catch (e) {
    return failed(e);
  }
  return { ok: true, message: "Kata sandi pemilik diganti." };
}

export async function createLicense(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { data } = await api<{ license_key: string; license: { ends_at: string } }>("admin", "/admin/licenses", send("POST", {
      owner_id: str(f, "owner_id"), plan: str(f, "plan"), periods: int(f, "periods", 1), max_devices: int(f, "max_devices", 1),
    }));
    refresh();
    return { ok: true, message: "Lisensi dibuat.", data: { key: data.license_key, ends_at: data.license.ends_at } };
  } catch (e) {
    return failed(e);
  }
}

export async function extendLicense(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("admin", `/admin/licenses/${str(f, "id")}/extend`, send("POST", { periods: int(f, "periods", 1), ...(str(f, "plan") ? { plan: str(f, "plan") } : {}) }));
  } catch (e) {
    return failed(e);
  }
  refresh();
  return { ok: true };
}

export async function updateLicense(_: ActionState, f: FormData): Promise<ActionState> {
  const body: Record<string, unknown> = {};
  if (str(f, "status")) body.status = str(f, "status");
  if (str(f, "max_devices")) body.max_devices = int(f, "max_devices", 1);
  try {
    await api("admin", `/admin/licenses/${str(f, "id")}`, send("PATCH", body));
  } catch (e) {
    return failed(e);
  }
  refresh();
  return { ok: true };
}

export async function rotateKey(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { data } = await api<{ license_key: string }>("admin", `/admin/licenses/${str(f, "id")}/rotate-key`, send("POST"));
    refresh();
    return { ok: true, message: "Kunci baru dibuat. Kunci lama tidak berlaku lagi.", data: { key: data.license_key } };
  } catch (e) {
    return failed(e);
  }
}

export async function deactivateDevice(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("admin", `/admin/devices/${str(f, "id")}`, send("DELETE"));
  } catch (e) {
    return failed(e);
  }
  refresh();
  return { ok: true };
}

export async function recordPayment(_: ActionState, f: FormData): Promise<ActionState> {
  const paidOn = str(f, "paid_on");
  const periods = int(f, "periods", 0);
  const body: Record<string, unknown> = {
    owner_id: str(f, "owner_id"),
    amount: money(f, "amount"),
    method: str(f, "method"),
    note: str(f, "note"),
    periods,
  };
  if (str(f, "license_id")) body.license_id = str(f, "license_id");
  // Tanggal bayar (WIB) → jam 12.00 WIB agar tidak bergeser hari.
  if (paidOn) body.paid_at = `${paidOn}T05:00:00Z`;
  try {
    await api("admin", "/admin/subscription-payments", send("POST", body));
  } catch (e) {
    return failed(e);
  }
  refresh();
  return { ok: true, message: periods > 0 ? "Pembayaran dicatat & lisensi diperpanjang." : "Pembayaran dicatat." };
}

export async function voidPayment(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("admin", `/admin/subscription-payments/${str(f, "id")}/void`, send("POST", { reason: str(f, "reason") }));
  } catch (e) {
    return failed(e);
  }
  refresh();
  return { ok: true };
}

export async function createAdmin(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("admin", "/admin/admins", send("POST", { name: str(f, "name"), email: str(f, "email"), password: String(f.get("password") ?? "") }));
  } catch (e) {
    return failed(e);
  }
  refresh();
  return { ok: true, message: "Admin ditambahkan." };
}

export async function deleteAdmin(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("admin", `/admin/admins/${str(f, "id")}`, send("DELETE"));
  } catch (e) {
    return failed(e);
  }
  refresh();
  return { ok: true };
}

export async function changeAdminPassword(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("admin", "/admin/me/password", send("POST", {
      current_password: String(f.get("current_password") ?? ""), new_password: String(f.get("new_password") ?? ""),
    }));
  } catch (e) {
    return failed(e);
  }
  return { ok: true, message: "Kata sandi diganti." };
}
