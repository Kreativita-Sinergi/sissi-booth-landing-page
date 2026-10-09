import { proxyDownload } from "@/lib/dash/download";

/** Unduh semua foto galeri online satu acara (zip) — dialirkan langsung dari API. */
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const id = (await ctx.params).id;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Tidak ditemukan", { status: 404 });
  return proxyDownload("owner", `/owner/events/${id}/photos.zip`, request);
}
