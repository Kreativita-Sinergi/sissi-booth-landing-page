import { csvQuery, proxyDownload } from "@/lib/dash/download";

const PATHS: Record<string, [string, string[]]> = {
  transaksi: ["/owner/transactions", ["from", "to", "device_id", "event_id", "status", "mode"]],
  foto: ["/owner/photos.zip", ["from", "to", "device_id"]],
};

/** Unduhan pemilik: /dashboard/unduh/transaksi (CSV), /dashboard/unduh/foto (zip foto galeri per rentang). */
export async function GET(request: Request, ctx: { params: Promise<{ jenis: string }> }) {
  const target = PATHS[(await ctx.params).jenis];
  if (!target) return new Response("Tidak ditemukan", { status: 404 });
  // csvQuery menambah format=csv; endpoint zip mengabaikannya.
  return proxyDownload("owner", target[0] + csvQuery(request, target[1]), request);
}
