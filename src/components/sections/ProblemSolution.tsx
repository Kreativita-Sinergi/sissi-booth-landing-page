import { ArrowRight } from "lucide-react";
import { problems } from "@/constants/content";
import { CheckMark, CrossMark } from "../shared/Marks";
import { Section } from "../shared/Section";
import { StickerBox } from "../shared/StickerBox";

export function ProblemSolution() {
  return (
    <Section kicker={problems.kicker} kickerAccent="pink" title={problems.title}>
      <div className="hidden grid-cols-[1fr_48px_1fr] gap-4 pb-3 font-label md:grid">
        <p className="text-muted">Masalahnya</p>
        <span />
        <p>Sama Sissi Booth</p>
      </div>
      <ul className="flex flex-col gap-5">
        {problems.pairs.map(([problem, solution]) => (
          <li key={problem} className="grid items-center gap-3 md:grid-cols-[1fr_48px_1fr] md:gap-4">
            <StickerBox shadow="sm" className="flex items-center gap-4 rounded-2xl border-[3px] p-4 md:p-5">
              <CrossMark />
              <p className="font-bold">{problem}</p>
            </StickerBox>
            <ArrowRight aria-hidden className="hidden size-8 justify-self-center md:block" strokeWidth={3} />
            <StickerBox shadow="sm" className="flex items-center gap-4 rounded-2xl border-[3px] bg-booth-green p-4 md:p-5">
              <CheckMark className="bg-white" />
              <p className="font-bold">{solution}</p>
            </StickerBox>
          </li>
        ))}
      </ul>
    </Section>
  );
}
