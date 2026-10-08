import { Check } from "lucide-react";
import { problems } from "@/constants/content";
import { accentBg } from "../shared/accent";
import { cn } from "../shared/cn";
import { Section } from "../shared/Section";

/** Masalah ditampilkan sebagai potongan chat yang familier, dibalas satu baris solusi. */
export function ProblemSolution() {
  return (
    <Section kicker={problems.kicker} kickerAccent="pink" title={problems.title}>
      <ul className="grid gap-x-12 gap-y-10 md:grid-cols-2">
        {problems.chats.map((c, i) => (
          <li key={c.from} className={cn("flex flex-col gap-3", i % 2 === 1 && "md:mt-14")}>
            {/* Bubble chat masuk */}
            <div className={cn("flex items-end gap-3", i % 2 === 0 ? "-rotate-1" : "rotate-1")}>
              <span
                aria-hidden
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-full border-[3px] border-ink font-label text-lg",
                  accentBg[c.accent],
                )}
              >
                {c.from[0]}
              </span>
              <div className="max-w-[440px] rounded-3xl rounded-bl-md border-[3px] border-ink bg-white px-5 py-4 shadow-hard-sm">
                <p className="mb-1 flex items-baseline justify-between gap-4 font-label text-sm">
                  {c.from}
                  <span className="font-mono text-xs text-muted">{c.time}</span>
                </p>
                <p className="text-lg font-bold leading-snug">{c.text}</p>
              </div>
            </div>
            {/* Balasan solusi */}
            <div
              className={cn(
                "ml-8 max-w-[420px] self-end rounded-2xl rounded-br-md border-[3px] border-ink bg-booth-green px-5 py-3 shadow-hard-sm md:ml-14",
                i % 2 === 0 ? "rotate-1" : "-rotate-1",
              )}
            >
              <p className="mb-1 flex items-center gap-1.5 font-label text-xs uppercase">
                <Check aria-hidden className="size-4" strokeWidth={4} />
                {problems.replyLabel}
              </p>
              <p className="font-bold leading-snug">{c.reply}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
