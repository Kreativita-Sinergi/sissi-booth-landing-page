import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/BrandMark";
import { ogFonts } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Ikon layar utama iOS: monogram di atas latar kuning (iOS membulatkan sudutnya sendiri). */
async function render() {
  "use cache"; // render sekali saat build (cacheComponents)
  const res = new ImageResponse(<BrandMark size={180} padded />, { ...size, fonts: await ogFonts() });
  return new Uint8Array(await res.arrayBuffer());
}

export default async function AppleIcon() {
  return new Response(await render(), { headers: { "Content-Type": contentType } });
}
