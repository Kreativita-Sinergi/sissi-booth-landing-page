/* eslint-disable @next/next/no-img-element -- SVG kecil statis; next/image tidak menambah apa-apa. */
import { cn } from "@/components/shared/cn";

/** Logo Sissi (ikon + wordmark, berkas resmi dari pemilik) — `public/brand/sissi-logo.svg`, rasio 99:32. */
export function SissiLogo({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const h = { sm: "h-6", md: "h-7", lg: "h-9" }[size];
  return <img src="/brand/sissi-logo.svg" alt="Sissi" width={99} height={32} className={cn("w-auto", h, className)} />;
}
