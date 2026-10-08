import { audience } from "@/constants/content";
import { Section } from "../shared/Section";
import { PillSticker } from "../shared/Stickers";

export function Audience() {
  return (
    <Section tone="white" kicker={audience.kicker} kickerAccent="yellow" title={audience.title}>
      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-8 py-4">
        {audience.items.map((a) => (
          <li key={a.label}>
            <PillSticker accent={a.accent} rotate={a.tilt} className="px-7 py-3 text-lg md:text-2xl">
              {a.label}
            </PillSticker>
          </li>
        ))}
      </ul>
    </Section>
  );
}
