"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "./api";
import type { ActionState } from "./action-state";
import { failed, money, str } from "./errors";

/** Aksi server dashboard pemilik booth (token pemilik dari cookie). */

const send = (method: string, body?: unknown): RequestInit => ({ method, body: body === undefined ? undefined : JSON.stringify(body) });
const refresh = () => revalidatePath("/dashboard", "layout");

function eventBody(f: FormData) {
  const device = str(f, "device_id");
  return {
    name: str(f, "name"),
    client_name: str(f, "client_name"),
    starts_on: str(f, "starts_on"),
    ends_on: str(f, "ends_on") || str(f, "starts_on"),
    contract_amount: money(f, "contract_amount"),
    other_cost: money(f, "other_cost"),
    note: str(f, "note"),
    device_id: device || null,
  };
}

export async function createEvent(_: ActionState, f: FormData): Promise<ActionState> {
  let id: string;
  try {
    id = (await api<{ id: string }>("owner", "/owner/events", send("POST", eventBody(f)))).data.id;
  } catch (e) {
    return failed(e);
  }
  refresh();
  redirect(`/dashboard/acara/${id}`);
}

export async function updateEvent(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("owner", `/owner/events/${str(f, "id")}`, send("PATCH", eventBody(f)));
  } catch (e) {
    return failed(e);
  }
  refresh();
  return { ok: true, message: "Acara disimpan." };
}

export async function deleteEvent(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("owner", `/owner/events/${str(f, "id")}`, send("DELETE"));
  } catch (e) {
    return failed(e);
  }
  refresh();
  redirect("/dashboard/acara");
}

export async function updateProfile(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("owner", "/owner/me", send("PATCH", { name: str(f, "name"), phone: str(f, "phone"), paper_cost: money(f, "paper_cost") }));
  } catch (e) {
    return failed(e);
  }
  refresh();
  return { ok: true, message: "Pengaturan disimpan." };
}

export async function changeOwnerPassword(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("owner", "/owner/me/password", send("POST", {
      current_password: String(f.get("current_password") ?? ""), new_password: String(f.get("new_password") ?? ""),
    }));
  } catch (e) {
    return failed(e);
  }
  return { ok: true, message: "Kata sandi diganti." };
}

export async function releaseBooth(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("owner", `/owner/devices/${str(f, "id")}`, send("DELETE"));
  } catch (e) {
    return failed(e);
  }
  refresh();
  return { ok: true };
}

export async function deleteGallery(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    await api("owner", `/owner/gallery/${str(f, "code")}`, send("DELETE"));
  } catch (e) {
    return failed(e);
  }
  refresh();
  return { ok: true };
}
