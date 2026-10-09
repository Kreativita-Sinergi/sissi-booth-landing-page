import { cookies } from "next/headers";
import { API_BASE_URL, COOKIE, LOGIN_PATH, type Role } from "./api";

/**
 * Teruskan unduhan (CSV / zip) dari API ke browser tanpa membuka token: Route Handler membaca
 * cookie httpOnly, memanggil API, lalu mengalirkan isinya apa adanya.
 */
export async function proxyDownload(role: Role, path: string, request: Request): Promise<Response> {
  const token = (await cookies()).get(COOKIE[role])?.value;
  if (!token) return Response.redirect(new URL(LOGIN_PATH[role], request.url), 303);
  const res = await fetch(API_BASE_URL + path, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }).catch(() => null);
  if (!res) return new Response("Server tidak bisa dihubungi.", { status: 502 });
  if (res.status === 401) return Response.redirect(new URL(`${LOGIN_PATH[role]}?habis=1`, request.url), 303);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    return new Response(body?.message ?? "Unduhan gagal.", { status: res.status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const headers = new Headers();
  for (const h of ["Content-Type", "Content-Disposition"]) {
    const v = res.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set("Cache-Control", "no-store");
  return new Response(res.body, { status: 200, headers });
}

/** Salin parameter filter yang diizinkan dari URL permintaan + format=csv. */
export function csvQuery(request: Request, keys: string[]): string {
  const src = new URL(request.url).searchParams;
  const out = new URLSearchParams({ format: "csv" });
  for (const k of keys) {
    const v = src.get(k);
    if (v) out.set(k, v);
  }
  return `?${out}`;
}
