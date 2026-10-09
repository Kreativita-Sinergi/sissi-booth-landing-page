"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, call, COOKIE, LOGIN_PATH, type Role } from "./api";
import type { ActionState } from "./action-state";
import { str } from "./errors";

const HOME: Record<Role, string> = { admin: "/admin", owner: "/dashboard" };

async function login(role: Role, form: FormData): Promise<ActionState> {
  const email = str(form, "email");
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { ok: false, message: "Isi email dan kata sandi." };
  let token: string, expires: string;
  try {
    const { data } = await call<{ access_token: string; expires_at: string }>(role === "admin" ? "/auth/admin/login" : "/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    token = data.access_token;
    expires = data.expires_at;
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.status === 429 ? "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi." : e.message };
    throw e;
  }
  (await cookies()).set(COOKIE[role], token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
  const next = str(form, "next");
  redirect(next.startsWith(HOME[role]) ? next : HOME[role]);
}

export async function loginAdmin(_: ActionState, form: FormData) {
  return login("admin", form);
}

export async function loginOwner(_: ActionState, form: FormData) {
  return login("owner", form);
}

export async function logout(role: Role) {
  (await cookies()).delete(COOKIE[role]);
  redirect(LOGIN_PATH[role]);
}

export async function logoutAdmin() {
  await logout("admin");
}

export async function logoutOwner() {
  await logout("owner");
}
