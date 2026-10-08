import { Camera, Frame, LayoutGrid, Printer, Repeat, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { features, type FeatureIcon } from "@/constants/content";
import { accentBg, accentText } from "../shared/accent";
import { cn } from "../shared/cn";
import { Section } from "../shared/Section";
import { StickerBox } from "../shared/StickerBox";

const icons: Record<FeatureIcon, LucideIcon> = {
  camera: Camera,
  layout: LayoutGrid,
  printer: Printer,
  gif: Repeat,
  frame: Frame,
};

/** Susunan bento: satu kartu besar (layar Hias) + kartu kecil berwarna. */
export function Features() {
  const { hero, items } = features;
  return (
    <Section id="fitur" kicker={features.kicker} title={features.title}>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StickerBox as="li" shadow="lg" fill="bg-booth-orange" className="flex flex-col gap-5 p-6 md:col-span-2 lg:row-span-2 md:p-8">
          <div>
            <h3 className="font-display text-3xl md:text-4xl">{hero.title}</h3>
            <p className="mt-2 max-w-[520px] text-lg font-bold">{hero.body}</p>
          </div>
          <Image
            src={hero.image}
            alt={hero.alt}
            width={1440}
            height={900}
            sizes="(min-width: 1024px) 720px, 90vw"
            className="mt-auto h-auto w-full -rotate-1 rounded-2xl border-4 border-ink shadow-hard"
          />
        </StickerBox>
        {items.map((f, i) => {
          const Icon = icons[f.icon];
          return (
            <StickerBox as="li" key={f.title} fill={accentBg[f.accent]} className={cn("flex flex-col gap-3 p-6", accentText[f.accent])}>
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl border-[3px] border-ink bg-white shadow-hard-sm",
                  i % 2 === 0 ? "-rotate-6" : "rotate-6",
                )}
              >
                <Icon aria-hidden className="size-6 text-ink" strokeWidth={2.5} />
              </span>
              <h3 className="font-label text-xl md:text-2xl">{f.title}</h3>
              <p className="font-bold leading-snug">{f.body}</p>
            </StickerBox>
          );
        })}
      </ul>
    </Section>
  );
}
