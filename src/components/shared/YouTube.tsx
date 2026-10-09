"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { cn } from "./cn";

/**
 * Video YouTube ringan: tampilkan gambar sampul dulu, iframe (youtube-nocookie) baru dimuat
 * saat diklik — halaman berisi banyak video tetap cepat.
 */
export function YouTube({ id, title, playLabel, className }: { id: string; title: string; playLabel: string; className?: string }) {
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
          {/* eslint-disable-next-line @next/next/no-img-element -- sampul dari i.ytimg.com, tanpa optimasi Next */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="size-full object-cover" />
          <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-ink bg-booth-yellow shadow-hard-sm transition-transform group-hover:scale-110 group-focus-visible:scale-110">
            <Play aria-hidden className="ml-1 size-7 fill-ink" strokeWidth={3} />
          </span>
        </button>
      )}
    </div>
  );
}
