import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/BrandMark";
import { ogFonts } from "@/lib/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon: monogram "sb" pink bergaris tebal. */
async function render() {
  "use cache"; // render sekali saat build (cacheComponents)
  const res = new ImageResponse(<BrandMark size={64} />, { ...size, fonts: await ogFonts() });
  return new Uint8Array(await res.arrayBuffer());
}

export default async function Icon() {
  return new Response(await render(), { headers: { "Content-Type": contentType } });
}
