import { Plus } from "lucide-react";
import { faq } from "@/constants/content";
import { Section } from "../shared/Section";

/** Akordeon FAQ memakai <details> (aksesibel, tanpa JavaScript). */
export function Faq() {
  return (
    <Section id="faq" kicker={faq.kicker} title={faq.title}>
      <div className="mx-auto flex max-w-[960px] flex-col gap-4">
        {faq.items.map(([q, a], i) => (
          <details
            key={q}
            open={i === 0}
            className="group rounded-3xl border-[3px] border-ink bg-white shadow-hard-sm open:border-4 open:shadow-hard"
          >
            <summary className="flex list-none items-center justify-between gap-4 p-5 font-label text-lg md:p-6 md:text-xl [&::-webkit-details-marker]:hidden">
              {q}
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-booth-yellow transition-transform group-open:rotate-45 group-open:bg-ink group-open:text-white">
                <Plus aria-hidden className="size-5" strokeWidth={3} />
              </span>
            </summary>
            <p className="px-5 pb-6 text-muted md:px-6">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
