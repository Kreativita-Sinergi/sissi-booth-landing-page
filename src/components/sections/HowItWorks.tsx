import { steps } from "@/constants/content";
import { ScreenShot } from "../shared/Devices";
import { NumberMark } from "../shared/Marks";
import { Section } from "../shared/Section";

export function HowItWorks() {
  return (
    <Section id="cara-kerja" tone="white" kicker={steps.kicker} kickerAccent="yellow" title={steps.title}>
      <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
        {steps.items.map((s, i) => (
          <li key={s.label} className="relative flex flex-col gap-4">
            <NumberMark n={i + 1} className="absolute -left-3 -top-5 z-10" />
            <ScreenShot src={s.image} alt={`Langkah ${i + 1}: ${s.label}`} />
            <p className="text-center font-label text-lg">{s.label}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
