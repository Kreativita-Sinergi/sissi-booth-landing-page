import { offline } from "@/constants/content";
import { cn } from "../shared/cn";
import { Section } from "../shared/Section";
import { StickerBox } from "../shared/StickerBox";

export function Offline() {
  return (
    <Section tone="ink" kicker={offline.kicker} kickerAccent="green" title={offline.title}>
      <ul className="grid gap-6 md:grid-cols-3">
        {offline.items.map((o) => (
          <StickerBox as="li" key={o.title} shadow="none" className={cn("flex flex-col gap-3 p-6 text-ink", o.highlight && "bg-booth-yellow")}>
            <h3 className={o.highlight ? "font-display text-3xl" : "font-label text-xl"}>{o.title}</h3>
            <p className="font-bold">{o.body}</p>
          </StickerBox>
        ))}
      </ul>
    </Section>
  );
}
