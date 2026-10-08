import type { NextConfig } from "next";

/**
 * Server galeri & API Sissi Booth (fotobox-service). QR softcopy tercetak
 * `booth.sissi.id/s/KODE` → diteruskan ke server ini (tamu tetap melihat
 * booth.sissi.id). Atur `GALLERY_ORIGIN` di Vercel bila alamat server berbeda.
 */
const galleryOrigin = (process.env.GALLERY_ORIGIN ?? "https://api.sissi.id").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  cacheComponents: true,
  async rewrites() {
    return [{ source: "/s/:path*", destination: `${galleryOrigin}/s/:path*` }];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
