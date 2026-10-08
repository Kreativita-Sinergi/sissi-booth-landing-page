import { modes } from "@/constants/content";
import { Chip } from "../shared/Chip";
import { accentBg, accentText } from "../shared/accent";
import { cn } from "../shared/cn";
import { CheckMark } from "../shared/Marks";
import { Section } from "../shared/Section";
import { StickerBox } from "../shared/StickerBox";

export function Modes() {
  return (
    <Section tone="white" kicker={modes.kicker} kickerAccent="yellow" title={modes.title}>
      <div className="grid gap-8 md:grid-cols-2">
        {modes.items.map((m) => (
          <StickerBox as="article" key={m.title} shadow="lg" className="flex flex-col gap-6 p-5 md:p-6">
            <h3 className={cn("rounded-2xl border-[3px] border-ink px-6 py-5 font-display text-4xl md:text-5xl", accentBg[m.accent], accentText[m.accent])}>
              {m.title}
            </h3>
            <p className="px-2 text-lg font-bold md:text-xl">{m.subtitle}</p>
            <ul className="flex flex-col gap-4 px-2">
              {m.points.map((p) => (
                <li key={p} className="flex items-center gap-4 font-bold">
                  <CheckMark />
                  {p}
                </li>
              ))}
            </ul>
            <Chip accent="yellow" className="mx-2 self-start normal-case">{m.fit}</Chip>
          </StickerBox>
        ))}
      </div>
    </Section>
  );
}
