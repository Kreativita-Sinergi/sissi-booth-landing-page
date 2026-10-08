import { Star } from "lucide-react";
import { marquee } from "@/constants/content";

/** Pita teks berjalan (berhenti bila pengguna memilih gerakan dikurangi). */
export function Marquee() {
  const items = [...marquee, ...marquee];
  return (
    <div className="overflow-hidden border-y-[3px] border-ink bg-ink py-4 text-booth-yellow" aria-label={marquee.join(", ")}>
      <div aria-hidden className="flex w-max animate-marquee gap-8">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-8">
            {items.map((t, i) => (
              <span key={`${copy}-${i}`} className="flex items-center gap-8 font-label text-lg uppercase md:text-2xl">
                {t}
                <Star className="size-5 fill-booth-yellow" strokeWidth={0} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
