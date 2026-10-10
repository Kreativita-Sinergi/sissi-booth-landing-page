import type { NextConfig } from "next";

/**
 * Server file galeri Sissi Booth (fotobox-service). Halaman `booth.sissi.id/s/KODE` kini dirender
 * Next.js (src/app/s/[code]); gambar biasanya diambil langsung dari server file (`FILES_BASE_URL`).
 * Rewrite di bawah hanya untuk jalur file bila server memakai alamat file relatif.
 * Atur `GALLERY_ORIGIN` (server file) & `API_BASE_URL` (…/api/v1) di Vercel.
 */
const galleryOrigin = (process.env.GALLERY_ORIGIN ?? "https://apibooth.sissi.id").replace(/\/+$/, "");

const dev = process.env.NODE_ENV !== "production";

/**
 * Header keamanan semua halaman. CSP tanpa nonce (nonce membuat semua halaman dinamis →
 * landing tidak lagi statis), jadi skrip inline Next tetap diizinkan; yang dibatasi: asal skrip,
 * bingkai (hanya YouTube nocookie), form/base, dan halaman ini tidak boleh dibingkai situs lain.
 * Gambar/video galeri berasal dari server file (domain dinamis) → https: diizinkan.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https:${dev ? " http:" : ""}`,
  `media-src 'self' blob: https:${dev ? " http:" : ""}`,
  "font-src 'self'",
  `connect-src 'self'${dev ? " ws: http://localhost:*" : ""}`,
  "frame-src https://www.youtube-nocookie.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    return [{ source: "/s/:code/files/:path*", destination: `${galleryOrigin}/s/:code/files/:path*` }];
  },
  experimental: {
    // Unggah PNG bingkai template lewat Server Action (bawaan 1 MB). Catatan: Vercel membatasi body ±4,5 MB.
    serverActions: { bodySizeLimit: "5mb" },
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
