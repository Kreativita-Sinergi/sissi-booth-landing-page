import type { Accent } from "@/constants/content";
import { accentBg, accentText } from "./accent";
import { cn } from "./cn";

/** Label pil kecil (status, kicker, lencana). */
export function Chip({
  accent = "white",
  dot,
  className,
  children,
}: {
  accent?: Accent;
  dot?: Accent;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-[3px] border-ink px-4 py-1.5 font-label text-xs uppercase md:text-sm",
        accentBg[accent],
        accentText[accent],
        className,
      )}
    >
      {dot && <span aria-hidden className={cn("size-2.5 rounded-full", accentBg[dot])} />}
      {children}
    </span>
  );
}
