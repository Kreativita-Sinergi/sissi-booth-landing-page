import { audience } from "@/constants/content";
import { Section } from "../shared/Section";
import { StickerBox } from "../shared/StickerBox";
import { PillSticker } from "../shared/Stickers";

/** Kartu skenario per segmen: pil miring + cara pakai + mode & paket yang pas. */
export function Audience() {
  return (
    <Section tone="lilac" kicker={audience.kicker} kickerAccent="yellow" title={audience.title}>
      <ul className="grid gap-x-6 gap-y-12 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {audience.items.map((a) => (
          <StickerBox as="li" key={a.label} shadow="sm" className="relative flex flex-col gap-4 px-6 pb-6 pt-10">
            <PillSticker accent={a.accent} rotate={a.tilt} className="absolute -top-5 left-5 px-5 py-2 md:text-base">
              {a.label}
            </PillSticker>
            <p className="text-lg font-bold leading-snug">{a.use}</p>
            <dl className="mt-auto flex flex-wrap gap-2 font-label text-xs uppercase">
              {[
                [audience.modeLabel, a.mode],
                [audience.planLabel, a.plan],
              ].map(([k, v]) => (
                <div key={k} className="flex rounded-full border-2 border-ink">
                  <dt className="rounded-l-full bg-ink px-3 py-1 text-white">{k}</dt>
                  <dd className="px-3 py-1">{v}</dd>
                </div>
              ))}
            </dl>
          </StickerBox>
        ))}
      </ul>
    </Section>
  );
}
