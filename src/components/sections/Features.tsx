import { features } from "@/constants/content";
import { NumberMark } from "../shared/Marks";
import { Section } from "../shared/Section";
import { StickerBox } from "../shared/StickerBox";

export function Features() {
  return (
    <Section id="fitur" kicker={features.kicker} title={features.title}>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.items.map((f, i) => (
          <StickerBox as="li" key={f.title} className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-4">
              <NumberMark n={String(i + 1).padStart(2, "0")} accent={f.accent} className="size-14 text-lg" />
              <h3 className="font-label text-xl md:text-2xl">{f.title}</h3>
            </div>
            <p className="text-muted">{f.body}</p>
          </StickerBox>
        ))}
      </ul>
    </Section>
  );
}
