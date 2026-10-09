import type { NextConfig } from "next";

/**
 * Server file galeri Sissi Booth (fotobox-service). Halaman `booth.sissi.id/s/KODE` kini dirender
 * Next.js (src/app/s/[code]); gambar biasanya diambil langsung dari server file (`FILES_BASE_URL`).
 * Rewrite di bawah hanya untuk jalur file bila server memakai alamat file relatif.
 * Atur `GALLERY_ORIGIN` (server file) & `API_BASE_URL` (…/api/v1) di Vercel.
 */
const galleryOrigin = (process.env.GALLERY_ORIGIN ?? "https://apibooth.sissi.id").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  cacheComponents: true,
  async rewrites() {
    return [{ source: "/s/:code/files/:path*", destination: `${galleryOrigin}/s/:code/files/:path*` }];
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
