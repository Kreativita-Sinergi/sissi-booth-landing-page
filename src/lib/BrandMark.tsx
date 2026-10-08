import { brand } from "./brand";

/**
 * Monogram "sb" untuk favicon & ikon apple (dirender ImageResponse, jadi hanya
 * gaya inline + flex). `size` = sisi kanvas dalam piksel.
 */
export function BrandMark({ size, padded = false }: { size: number; padded?: boolean }) {
  const box = padded ? Math.round(size * 0.72) : size;
  const border = Math.max(3, Math.round(box * 0.08));
  const shadow = padded ? Math.round(size * 0.04) : 0;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: padded ? brand.yellow : "transparent",
      }}
    >
      <div
        style={{
          width: box,
          height: box,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brand.pink,
          border: `${border}px solid ${brand.ink}`,
          borderRadius: Math.round(box * 0.28),
          boxShadow: shadow ? `${shadow}px ${shadow}px 0 0 ${brand.ink}` : "none",
          fontFamily: "Bagel",
          fontSize: Math.round(box * 0.52),
          color: brand.ink,
          paddingBottom: Math.round(box * 0.06),
        }}
      >
        sb
      </div>
    </div>
  );
}
