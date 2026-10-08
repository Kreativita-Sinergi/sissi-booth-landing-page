import { plans, site } from "@/constants/content";
import { accentBg, accentText } from "../shared/accent";
import { Button } from "../shared/Button";
import { cn } from "../shared/cn";
import { Section } from "../shared/Section";
import { StickerBox } from "../shared/StickerBox";
import { PillSticker } from "../shared/Stickers";

export function Plans() {
  return (
    <Section id="paket" kicker={plans.kicker} title={plans.title}>
      <p className="-mt-6 mb-12 text-lg font-bold md:text-center md:text-xl">{plans.subtitle}</p>
      <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
        {plans.items.map((p) => (
          <StickerBox as="li" key={p.name} shadow="lg" className="relative flex flex-col gap-6 p-5">
            {p.badge && (
              <PillSticker rotate={5} className="absolute -top-5 right-4 text-xs md:text-xs">
                {p.badge}
              </PillSticker>
            )}
            <h3 className={cn("rounded-2xl border-[3px] border-ink py-8 text-center font-display text-5xl", accentBg[p.accent], accentText[p.accent])}>
              {p.name}
            </h3>
            <p className="flex-1 px-2 text-lg font-bold">{p.body}</p>
            <Button href={site.whatsapp} external variant="soft" className="mx-2">
              {plans.cta}
            </Button>
          </StickerBox>
        ))}
      </ul>
    </Section>
  );
}
