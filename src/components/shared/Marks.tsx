import { Check, X } from "lucide-react";
import type { Accent } from "@/constants/content";
import { accentBg } from "./accent";
import { cn } from "./cn";

/** Lingkaran centang hijau. */
export function CheckMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-booth-green shadow-hard-sm", className)}>
      <Check aria-hidden className="size-5" strokeWidth={3.5} />
    </span>
  );
}

/** Lingkaran silang merah muda. */
export function CrossMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-booth-pink shadow-hard-sm", className)}>
      <X aria-hidden className="size-5" strokeWidth={3.5} />
    </span>
  );
}

/** Lingkaran bernomor. */
export function NumberMark({ n, accent = "yellow", className }: { n: number | string; accent?: Accent; className?: string }) {
  return (
    <span className={cn("inline-flex size-12 shrink-0 items-center justify-center rounded-full border-[3px] border-ink font-label shadow-hard-sm", accentBg[accent], className)}>
      {n}
    </span>
  );
}
