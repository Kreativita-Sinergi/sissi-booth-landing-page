import { cn } from "./cn";

/** Lebar konten baku: 1200px, tepi 20px (mobile) / 32px. */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-5 md:px-8", className)}>{children}</div>;
}
