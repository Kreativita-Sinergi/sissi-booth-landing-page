import { site } from "@/constants/content";
import { cn } from "./cn";

/** Logo pil merah muda "sissi booth". */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-12 shrink-0 items-center whitespace-nowrap rounded-full border-4 border-ink bg-booth-pink px-5 font-display text-xl leading-none shadow-hard-sm md:h-14 md:px-6 md:text-2xl",
        className,
      )}
    >
      {site.name}
    </span>
  );
}
