import type { Accent } from "@/constants/content";
import { accentBg } from "./accent";
import { cn } from "./cn";

/** Strip foto hiasan (siluet), rasio 1:3. */
export function PhotoStrip({ colors, className }: { colors: Accent[]; className?: string }) {
  return (
    <div className={cn("flex aspect-[1/3] flex-col gap-[4%] rounded-xl border-4 border-ink bg-white p-[6%] shadow-hard", className)}>
      {colors.map((c, i) => (
        <div key={i} className={cn("relative flex-1 overflow-hidden rounded-md border-[3px] border-ink", accentBg[c])}>
          <span className="absolute left-1/2 top-[22%] aspect-square w-[28%] -translate-x-1/2 rounded-full bg-ink" />
          <span className="absolute left-1/2 top-[56%] h-full w-[60%] -translate-x-1/2 rounded-[50%] bg-ink" />
        </div>
      ))}
      <span className="pt-[2%] text-center font-label text-[9px] uppercase">sissi booth</span>
    </div>
  );
}
