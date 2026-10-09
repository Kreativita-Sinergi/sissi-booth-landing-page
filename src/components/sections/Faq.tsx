"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { faq } from "@/constants/content";
import { cn } from "../shared/cn";
import { Section } from "../shared/Section";

/**
 * Akordeon FAQ (satu terbuka). Buka/tutup dianimasikan lewat transisi
 * `grid-template-rows` 0fr → 1fr agar tinggi jawaban tak perlu diukur.
 */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section id="faq" kicker={faq.kicker} title={faq.title}>
      <div className="mx-auto flex max-w-[960px] flex-col gap-4">
        {faq.items.map(([q, a], i) => {
          const isOpen = open === i;
          return (
            <div
              key={q}
              className={cn(
                "rounded-3xl border-[3px] border-ink bg-white transition-[box-shadow,translate] duration-300",
                isOpen ? "-translate-y-0.5 shadow-hard" : "shadow-hard-sm",
              )}
            >
              <h3>
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-label text-lg md:p-6 md:text-xl"
                >
                  {q}
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full border-[3px] border-ink transition duration-300",
                      isOpen ? "rotate-45 bg-ink text-white" : "bg-booth-yellow",
                    )}
                  >
                    <Plus aria-hidden className="size-5" strokeWidth={3} />
                  </span>
                </button>
              </h3>
              <div
                id={`faq-a-${i}`}
                role="region"
                aria-labelledby={`faq-q-${i}`}
                inert={!isOpen}
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-6 text-muted md:px-6">
                    {a}
                    {faq.links[q] && (
                      <>
                        {" "}
                        <a href={faq.links[q].href} className="font-bold text-ink underline underline-offset-4">
                          {faq.links[q].label} →
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
