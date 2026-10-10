/* eslint-disable @next/next/no-img-element -- SVG kecil statis; next/image tidak menambah apa-apa. */
import { cn } from "@/components/shared/cn";

/**
 * Logo Sissi (sama dengan aplikasi POS `pos/sissi-app` › SissiLogo): tile oranye berisi ikon putih + wordmark.
 * Berkas SVG di `public/brand/` (disalin dari `pos/sissi-app/assets/images/`, warna diganti).
 */
export function SissiLogo({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const tile = { sm: "size-7 rounded-[8px] p-1.5", md: "size-8 rounded-[9px] p-[6px]", lg: "size-10 rounded-[11px] p-2" }[size];
  const word = { sm: "h-[17px]", md: "h-5", lg: "h-6" }[size];
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("inline-flex shrink-0 items-center justify-center bg-sissi", tile)}>
        <img src="/brand/sissi-icon-white.svg" alt="" className="size-full" />
      </span>
      <img src="/brand/sissi-wordmark-ink.svg" alt="Sissi" className={cn("w-auto", word)} />
    </span>
  );
}
