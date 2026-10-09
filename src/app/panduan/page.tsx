import type { Metadata } from "next";
import { CirclePlay, Clock } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Contact } from "@/components/sections/Contact";
import { accentBg, accentText } from "@/components/shared/accent";
import { Button } from "@/components/shared/Button";
import { Chip } from "@/components/shared/Chip";
import { cn } from "@/components/shared/cn";
import { Container } from "@/components/shared/Container";
import { StickerBox } from "@/components/shared/StickerBox";
import { Highlight } from "@/components/shared/Stickers";
import { YouTube } from "@/components/shared/YouTube";
import { guide } from "@/constants/content";

export const metadata: Metadata = {
  title: guide.meta.title,
  description: guide.meta.description,
  alternates: { canonical: "/panduan" },
  openGraph: { url: "/panduan", title: guide.meta.title, description: guide.meta.description },
  twitter: { title: guide.meta.title, description: guide.meta.description },
};

/** Panduan pengguna: video YouTube dikelompokkan per kebutuhan (tamu → persiapan → acara → setelah acara). */
export default function Panduan() {
  return (
    <>
      <Navbar />
      <main>
        <section className="py-14 md:py-20">
          <Container className="flex flex-col items-start gap-6">
            <Chip accent="white">{guide.kicker}</Chip>
            <h1 className="font-display text-[clamp(34px,10vw,44px)] leading-none md:text-7xl">
              {guide.title}
              <br />
              <Highlight rotate={-2} className="mt-3">{guide.highlight}</Highlight>
            </h1>
            <p className="max-w-[640px] text-lg font-bold">{guide.body}</p>
            <Button href={guide.playlist.href} external variant="secondary">
              <CirclePlay aria-hidden className="size-5 shrink-0" strokeWidth={3} />
              {guide.playlist.label}
            </Button>
            <nav aria-label={guide.jumpLabel} className="flex flex-wrap items-center gap-3 pt-2">
              <span className="font-label text-sm">{guide.jumpLabel}:</span>
              {guide.groups.map((g) => (
                <a key={g.id} href={`#${g.id}`} className="transition-transform hover:-translate-y-0.5">
                  <Chip accent={g.accent}>{g.title}</Chip>
                </a>
              ))}
            </nav>
          </Container>
        </section>

        {guide.groups.map((g, gi) => (
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
                {g.videos.map((v) => (
                  <StickerBox as="li" key={v.id} className="flex flex-col overflow-hidden">
                    <YouTube id={v.id} title={`${guide.videoPrefix}${v.no}: ${v.title}`} playLabel={guide.playLabel} className="border-b-4 border-ink" />
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className={cn("rounded-full border-[3px] border-ink px-3 py-0.5 font-mono text-sm", accentBg[g.accent], accentText[g.accent])}>
                          #{v.no}
                        </span>
                        <span className="flex items-center gap-1.5 font-mono text-sm text-muted">
                          <Clock aria-hidden className="size-4" strokeWidth={2.5} />
                          {v.duration}
                        </span>
                      </div>
                      <h3 className="font-label text-xl">{v.title}</h3>
                      <p className="text-muted">{v.body}</p>
                    </div>
                  </StickerBox>
                ))}
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
