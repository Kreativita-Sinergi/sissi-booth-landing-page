import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Accent } from "@/constants/content";
import { type Guide, guideUi } from "@/constants/guides";
import { accentBg, accentText } from "../shared/accent";
import { cn } from "../shared/cn";

/** Kartu panduan (halaman daftar & "Panduan terkait"). */
export function GuideCard({ guide, accent }: { guide: Guide; accent: Accent }) {
  return (
    <Link
      href={`/panduan/${guide.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border-4 border-ink bg-white shadow-hard transition-transform duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-booth-blue"
    >
      <Image
        src={`/panduan/${guide.slug}/sampul.jpg`}
        alt=""
        width={1280}
        height={720}
        sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
        className="aspect-video h-auto w-full border-b-4 border-ink object-cover"
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className={cn("rounded-full border-[3px] border-ink px-3 py-0.5 font-label text-xs uppercase", accentBg[accent], accentText[accent])}>
            {guide.audience}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-sm text-muted">
            <Clock aria-hidden className="size-4" strokeWidth={2.5} />
            {guide.readTime}
          </span>
        </div>
        <h3 className="font-label text-xl">{guide.title}</h3>
        <p className="flex-1 text-muted">{guide.summary}</p>
        <span className="flex items-center gap-2 pt-1 font-label text-sm uppercase">
          {guideUi.readMore}
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={3} />
        </span>
      </div>
    </Link>
  );
}

/** Aksen kelompok tempat panduan berada. */
export function guideAccent(groups: { accent: Accent; slugs: string[] }[], slug: string): Accent {
  return groups.find((g) => g.slugs.includes(slug))?.accent ?? "yellow";
}
