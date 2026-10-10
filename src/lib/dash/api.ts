import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Klien API fotobox-service untuk dashboard. HANYA dipanggil di server (Server Component,
 * Server Action, Route Handler): token login disimpan di cookie httpOnly dan tidak pernah
 * sampai ke browser. Alamat server: env `API_BASE_URL` (mis. https://apibooth.sissi.id/api/v1).
 */
export const API_BASE_URL = (process.env.API_BASE_URL ?? "http://localhost:8090/api/v1").replace(/\/+$/, "");

export type Role = "admin" | "owner";

export const COOKIE: Record<Role, string> = { admin: "sb_admin", owner: "sb_owner" };
export const LOGIN_PATH: Record<Role, string> = { admin: "/admin/masuk", owner: "/dashboard/masuk" };

export type PageMeta = { page: number; per_page: number; total: number };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

type Envelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Partial<PageMeta>;
  error?: { code: string; details?: { field: string; message: string }[] };
};

export async function tokenFor(role: Role): Promise<string | undefined> {
  return (await cookies()).get(COOKIE[role])?.value;
}

/** Panggil API mentah (tanpa login) — dipakai login & halaman publik. */
export async function call<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<{ data: T; meta: PageMeta }> {
  const { token, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(API_BASE_URL + path, {
      ...rest,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        // FormData (unggah file) → biarkan fetch mengisi Content-Type multipart beserta boundary.
        ...(typeof rest.body === "string" ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError("Server tidak bisa dihubungi. Coba lagi sebentar lagi.", 0, "NETWORK");
  }
  const body = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!res.ok || !body?.success) {
    const fields: Record<string, string> = {};
    for (const d of body?.error?.details ?? []) fields[d.field] = d.message;
    throw new ApiError(body?.message ?? "Terjadi kesalahan pada server.", res.status, body?.error?.code ?? "UNKNOWN", fields);
  }
  const m = body.meta ?? {};
  return { data: body.data, meta: { page: m.page ?? 1, per_page: m.per_page ?? 20, total: m.total ?? 0 } };
}

/**
 * Panggil API sebagai admin/pemilik yang login. Belum login atau sesi habis → arahkan ke
 * halaman masuk (cookie lama dibersihkan di sana).
 */
export async function api<T>(role: Role, path: string, init: RequestInit = {}): Promise<{ data: T; meta: PageMeta }> {
  const token = await tokenFor(role);
  if (!token) redirect(LOGIN_PATH[role]);
  try {
    return await call<T>(path, { ...init, token });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect(`${LOGIN_PATH[role]}?habis=1`);
    throw e;
  }
}

/** Query string dari objek (nilai kosong dilewati). */
export function qs(params: Record<string, string | number | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}
