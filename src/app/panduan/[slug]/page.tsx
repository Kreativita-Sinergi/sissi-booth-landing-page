import type { Metadata } from "next";
import { ArrowLeft, ChevronRight, CirclePlay, Clock, HelpCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { GuideCard, guideAccent } from "@/components/guide/GuideCard";
import { GuideStep } from "@/components/guide/GuideStep";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { accentBg, accentText } from "@/components/shared/accent";
import { Button } from "@/components/shared/Button";
import { Chip } from "@/components/shared/Chip";
import { cn } from "@/components/shared/cn";
import { Container } from "@/components/shared/Container";
import { StickerBox } from "@/components/shared/StickerBox";
import { YouTube } from "@/components/shared/YouTube";
import { site } from "@/constants/content";
import { guideBySlug, guideGroups, guides, guideUi } from "@/constants/guides";
import { guideJsonLd, JsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = guideBySlug((await params).slug);
  if (!guide) return {};
  const title = `${guide.title} · ${guideUi.meta.title}`;
  const url = `/panduan/${guide.slug}`;
  return {
    title,
    description: guide.summary,
    alternates: { canonical: url },
    openGraph: { url, title, description: guide.summary, images: [{ url: `/panduan/${guide.slug}/sampul.jpg`, width: 1280, height: 720 }] },
    twitter: { title, description: guide.summary, images: [`/panduan/${guide.slug}/sampul.jpg`] },
  };
}

/** Satu panduan: langkah bergambar, video YouTube yang cocok, tanya jawab, panduan terkait. */
/** `params` dibaca di dalam `<Suspense>` (Next 16: data URL di luar Suspense menghambat navigasi instan). */
export default function PanduanDetail({ params }: Props) {
  return (
    <Suspense fallback={<Navbar />}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: Props) {
  const guide = guideBySlug((await params).slug);
  if (!guide) notFound();
  const accent = guideAccent(guideGroups, guide.slug);
  const related = guide.related.map(guideBySlug).filter((g) => g !== undefined);

  return (
    <>
      <JsonLd data={guideJsonLd(guide)} />
      <Navbar />
      <main>
        <section className="py-10 md:py-16">
          <Container className="flex flex-col items-start gap-6">
            <nav aria-label={guideUi.breadcrumbLabel} className="flex flex-wrap items-center gap-1.5 font-label text-sm">
              <Link href="/" className="hover:underline">{guideUi.breadcrumbHome}</Link>
              <ChevronRight aria-hidden className="size-4" strokeWidth={3} />
              <Link href="/panduan" className="hover:underline">{guideUi.breadcrumbGuide}</Link>
              <ChevronRight aria-hidden className="size-4" strokeWidth={3} />
              <span aria-current="page" className="text-muted">{guide.title}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <Chip accent={accent}>{guide.audience}</Chip>
              <span className="flex items-center gap-1.5 font-mono text-sm">
                <Clock aria-hidden className="size-4" strokeWidth={2.5} />
                {guide.readTime}
              </span>
              {guide.video && (
                <span className="flex items-center gap-1.5 font-mono text-sm">
                  <CirclePlay aria-hidden className="size-4" strokeWidth={2.5} />
                  {guide.video.duration}
                </span>
              )}
              <span className="font-mono text-sm text-muted">{guideUi.updated}</span>
            </div>
            <h1 className="font-display text-[clamp(34px,10vw,44px)] leading-none md:text-7xl">{guide.title}</h1>
            <p className="max-w-[760px] text-lg font-bold">{guide.overview}</p>
            {guide.prerequisites.length > 0 && (
              <StickerBox shadow="sm" className="w-full max-w-[760px] p-5">
                <p className="mb-3 font-label text-sm uppercase">{guideUi.prerequisites}</p>
                <ul className="flex flex-col gap-2">
                  {guide.prerequisites.map((p) => (
                    <li key={p} className="flex items-start gap-3">
                      <span aria-hidden className={cn("mt-1.5 size-3 shrink-0 rounded-full border-2 border-ink", accentBg[accent])} />
                      {p}
                    </li>
                  ))}
                </ul>
              </StickerBox>
            )}
          </Container>
        </section>

        <section className="border-t-[3px] border-ink bg-paper py-12 md:py-16">
          <Container className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="flex min-w-0 flex-col gap-8">
              {guide.video && (
              <StickerBox className="overflow-hidden">
                <YouTube
                  id={guide.video.id}
                  title={`${guideUi.video.prefix}${guide.no}: ${guide.title}`}
                  poster={`/panduan/${guide.slug}/sampul.jpg`}
                  playLabel={guideUi.video.play}
                />
                <p className="flex items-center gap-2 border-t-4 border-ink px-5 py-3 font-label text-sm uppercase">
                  <CirclePlay aria-hidden className="size-4" strokeWidth={3} />
                  {guideUi.video.title} · {guide.video.duration}
                </p>
              </StickerBox>
              )}

              <ol className="flex flex-col gap-8">
                {guide.steps.map((s, i) => (
                  <li key={s.id}>
                    <GuideStep step={s} n={i + 1} accent={accent} />
                  </li>
                ))}
              </ol>

              {guide.faqs.length > 0 && (
                <StickerBox as="section" className="p-5 md:p-8">
                  <h2 id="tanya-jawab" className="mb-5 flex scroll-mt-32 items-center gap-3 font-display text-2xl md:text-4xl">
                    <HelpCircle aria-hidden className="size-7 shrink-0" strokeWidth={2.75} />
                    {guideUi.faqTitle}
                  </h2>
                  <dl className="flex flex-col gap-4">
                    {guide.faqs.map(([q, a]) => (
                      <div key={q} className="rounded-2xl border-[3px] border-ink bg-paper p-4 md:p-5">
                        <dt className="font-label">{q}</dt>
                        <dd className="mt-1.5 text-muted">{a}</dd>
                      </div>
                    ))}
                  </dl>
                </StickerBox>
              )}

              <Link href="/panduan" className="flex items-center gap-2 self-start font-label text-sm uppercase hover:underline">
                <ArrowLeft aria-hidden className="size-4" strokeWidth={3} />
                {guideUi.allGuides}
              </Link>
            </div>

            <aside className="flex flex-col gap-6 lg:sticky lg:top-32">
              <StickerBox shadow="sm" className="hidden p-5 lg:block">
                <p className="mb-3 font-label text-sm uppercase">{guideUi.stepsNav}</p>
                <ol className="flex flex-col gap-1">
                  {guide.steps.map((s, i) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="flex items-start gap-3 rounded-xl p-2 hover:bg-paper">
                        <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-ink font-mono text-xs", accentBg[accent], accentText[accent])}>
                          {i + 1}
                        </span>
                        <span className="text-sm font-bold leading-snug">{s.title}</span>
                      </a>
                    </li>
                  ))}
                  {guide.faqs.length > 0 && (
                    <li>
                      <a href="#tanya-jawab" className="flex items-start gap-3 rounded-xl p-2 hover:bg-paper">
                        <HelpCircle aria-hidden className="size-6 shrink-0" strokeWidth={2.5} />
                        <span className="text-sm font-bold leading-snug">{guideUi.faqTitle}</span>
                      </a>
                    </li>
                  )}
                </ol>
              </StickerBox>
              <StickerBox shadow="sm" fill="bg-booth-pink" className="flex flex-col items-start gap-3 p-5">
                <p className="font-display text-2xl leading-none">{guideUi.help.title}</p>
                <p className="font-medium">{guideUi.help.body}</p>
                <Button href={site.whatsapp} external variant="success" className="w-full">
                  <MessageCircle aria-hidden className="size-5 shrink-0" strokeWidth={3} />
                  {guideUi.help.cta}
                </Button>
              </StickerBox>
            </aside>
          </Container>
        </section>

        {related.length > 0 && (
          <section className="border-t-[3px] border-ink bg-white py-14 md:py-20">
            <Container>
              <header className="mb-8 flex flex-col items-start gap-3 md:mb-10">
                <Chip accent="yellow">{guideUi.relatedKicker}</Chip>
                <h2 className="font-display text-3xl leading-none md:text-5xl">{guideUi.relatedTitle}</h2>
              </header>
              <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {related.map((g) => (
                  <li key={g.slug}>
                    <GuideCard guide={g} accent={guideAccent(guideGroups, g.slug)} />
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
