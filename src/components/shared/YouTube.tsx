"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "./cn";

/**
 * Video YouTube ringan: tampilkan sampul lokal dulu, iframe (youtube-nocookie) baru dimuat
 * saat diklik — halaman tetap cepat dan tidak memuat skrip YouTube sebelum dibutuhkan.
 */
export function YouTube({
  id,
  title,
  poster,
  playLabel,
  className,
}: {
  id: string;
  title: string;
  /** Sampul 16:9 di /public. */
  poster: string;
  playLabel: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className={cn("relative aspect-video overflow-hidden bg-ink", className)}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`${playLabel}: ${title}`} className="group absolute inset-0 size-full">
          <Image src={poster} alt="" fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
          <span className="absolute bottom-4 right-4 flex size-16 items-center justify-center rounded-full border-4 border-ink bg-booth-yellow shadow-hard-sm transition-transform group-hover:scale-110 group-focus-visible:scale-110 md:size-20">
            <Play aria-hidden className="ml-1 size-7 fill-ink md:size-9" strokeWidth={3} />
          </span>
        </button>
      )}
    </div>
  );
}
