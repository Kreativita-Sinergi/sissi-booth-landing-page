import type { Metadata } from "next";
import { CirclePlay } from "lucide-react";
import { GuideCard } from "@/components/guide/GuideCard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Contact } from "@/components/sections/Contact";
import { accentBg } from "@/components/shared/accent";
import { Button } from "@/components/shared/Button";
import { Chip } from "@/components/shared/Chip";
import { cn } from "@/components/shared/cn";
import { Container } from "@/components/shared/Container";
import { Highlight } from "@/components/shared/Stickers";
import { guideBySlug, guideGroups, guideUi } from "@/constants/guides";

export const metadata: Metadata = {
  title: guideUi.meta.title,
  description: guideUi.meta.description,
  alternates: { canonical: "/panduan" },
  openGraph: { url: "/panduan", title: guideUi.meta.title, description: guideUi.meta.description },
  twitter: { title: guideUi.meta.title, description: guideUi.meta.description },
};

/** Pusat panduan: kartu panduan dikelompokkan per kebutuhan (tamu → persiapan → acara → setelah acara). */
export default function Panduan() {
  return (
    <>
      <Navbar />
      <main>
        <section className="py-14 md:py-20">
          <Container className="flex flex-col items-start gap-6">
            <Chip accent="white">{guideUi.kicker}</Chip>
            <h1 className="font-display text-[clamp(34px,10vw,44px)] leading-none md:text-7xl">
              {guideUi.title}
              <br />
              <Highlight rotate={-2} className="mt-3">{guideUi.highlight}</Highlight>
            </h1>
            <p className="max-w-[680px] text-lg font-bold">{guideUi.body}</p>
            <Button href={guideUi.playlist.href} external variant="secondary">
              <CirclePlay aria-hidden className="size-5 shrink-0" strokeWidth={3} />
              {guideUi.playlist.label}
            </Button>
            <nav aria-label={guideUi.jumpLabel} className="flex flex-wrap items-center gap-3 pt-2">
              <span className="font-label text-sm">{guideUi.jumpLabel}:</span>
              {guideGroups.map((g) => (
                <a key={g.id} href={`#${g.id}`} className="transition-transform hover:-translate-y-0.5">
                  <Chip accent={g.accent}>{g.title}</Chip>
                </a>
              ))}
            </nav>
          </Container>
        </section>

        {guideGroups.map((g, gi) => (
          <section key={g.id} id={g.id} className={cn("scroll-mt-20 border-t-[3px] border-ink py-14 md:py-20", gi % 2 === 0 ? "bg-white" : "bg-paper")}>
            <Container>
              <header className="mb-8 flex flex-col gap-2 md:mb-10">
                <h2 className="flex items-center gap-3 font-display text-3xl leading-none md:text-5xl">
                  <span aria-hidden className={cn("size-5 shrink-0 rounded-full border-[3px] border-ink md:size-7", accentBg[g.accent])} />
                  {g.title}
                </h2>
                <p className="text-lg font-bold text-muted">{g.body}</p>
              </header>
              <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {g.slugs.map((slug) => {
                  const guide = guideBySlug(slug);
                  return guide ? (
                    <li key={slug}>
                      <GuideCard guide={guide} accent={g.accent} />
                    </li>
                  ) : null;
                })}
              </ul>
            </Container>
          </section>
        ))}

        <Contact />
      </main>
      <Footer />
    </>
  );
}
