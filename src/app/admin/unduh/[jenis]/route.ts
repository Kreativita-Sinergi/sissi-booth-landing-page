import { csvQuery, proxyDownload } from "@/lib/dash/download";

const PATHS: Record<string, [string, string[]]> = {
  transaksi: ["/admin/transactions", ["from", "to", "owner_id", "device_id", "status", "mode"]],
  pembayaran: ["/admin/subscription-payments", ["from", "to", "owner_id", "status"]],
};

/** Unduh CSV admin: /admin/unduh/transaksi · /admin/unduh/pembayaran. */
export async function GET(request: Request, ctx: { params: Promise<{ jenis: string }> }) {
  const target = PATHS[(await ctx.params).jenis];
  if (!target) return new Response("Tidak ditemukan", { status: 404 });
  return proxyDownload("admin", target[0] + csvQuery(request, target[1]), request);
}
