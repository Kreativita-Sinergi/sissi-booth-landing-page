import { ImageResponse } from "next/og";
import { hero, og, site } from "@/constants/content";
import { brand, ogFonts, publicImage } from "@/lib/og";

export const alt = og.alt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const border = `5px solid ${brand.ink}`;
const shadow = (n: number) => `${n}px ${n}px 0 0 ${brand.ink}`;

/** Pratinjau tautan (WhatsApp, Instagram, Google): gaya Sticker Bomb 1200×630. */
async function render() {
  "use cache"; // render sekali saat build (cacheComponents)
  const screen = await publicImage("/screens/tunggu-p.png");
  const res = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: brand.yellow, fontFamily: "Archivo", color: brand.ink, position: "relative" }}>
        {/* Lingkaran dekoratif */}
        <div style={{ position: "absolute", right: -140, top: -160, width: 560, height: 560, borderRadius: 999, border: `4px solid rgba(17,17,17,0.12)` }} />

        {/* Kiri: logo, judul, poin */}
        <div style={{ display: "flex", flexDirection: "column", padding: "60px 0 64px 72px", width: 800, flexShrink: 0 }}>
          <div style={{ display: "flex", alignSelf: "flex-start", background: brand.pink, border, borderRadius: 999, padding: "6px 28px 12px", fontFamily: "Bagel", fontSize: 38, boxShadow: shadow(5) }}>
            {site.name}
          </div>
          <div style={{ display: "flex", marginTop: 40, fontFamily: "Bagel", fontSize: 96, lineHeight: 1, whiteSpace: "nowrap" }}>{hero.title}</div>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginTop: 14,
              background: brand.green,
              border: `6px solid ${brand.ink}`,
              borderRadius: 28,
              padding: "0 30px 14px",
              fontFamily: "Bagel",
              fontSize: 92,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              boxShadow: shadow(10),
              transform: "rotate(-2deg)",
            }}
          >
            {hero.highlight}
          </div>
          <div style={{ display: "flex", marginTop: "auto", gap: 16 }}>
            {og.chips.map((c, i) => (
              <div key={c} style={{ display: "flex", background: brand.white, border: `4px solid ${brand.ink}`, borderRadius: 999, padding: "9px 18px", fontSize: 19, whiteSpace: "nowrap", flexShrink: 0, boxShadow: shadow(4), transform: `rotate(${i % 2 ? 2 : -2}deg)` }}>
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* Kanan: layar kiosk */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ display: "flex", padding: 14, background: brand.ink, borderRadius: 30, boxShadow: shadow(10), transform: "rotate(5deg)" }}>
            <img src={screen} width={250} height={444} alt="" style={{ borderRadius: 18 }} />
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
  return new Uint8Array(await res.arrayBuffer());
}

export default async function OpengraphImage() {
  return new Response(await render(), { headers: { "Content-Type": contentType } });
}
