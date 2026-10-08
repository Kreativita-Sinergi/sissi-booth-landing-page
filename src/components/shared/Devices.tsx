import Image from "next/image";
import { cn } from "./cn";

/** Laptop berisi cuplikan layar aplikasi (landscape 16:10). */
export function LaptopMockup({ src, alt, preload = false, className }: { src: string; alt: string; preload?: boolean; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="rounded-[18px] border-4 border-ink bg-ink p-2.5 shadow-hard md:p-3.5">
        <Image src={src} alt={alt} width={1440} height={900} preload={preload} sizes="(min-width: 768px) 560px, 90vw" className="h-auto w-full rounded-md" />
      </div>
      <div className="mx-[-4%] h-4 rounded-full border-[3px] border-ink bg-[#3a3a3a] shadow-hard-sm md:h-5" />
    </div>
  );
}

/** Kiosk berdiri berisi layar portrait (9:16). */
export function KioskMockup({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="w-full rounded-[18px] border-4 border-ink bg-ink p-2 shadow-hard">
        <Image src={src} alt={alt} width={1080} height={1920} sizes="200px" className="h-auto w-full rounded-md" />
      </div>
      <div className="h-8 w-4 border-x-[3px] border-ink bg-[#3a3a3a]" />
      <div className="h-3 w-24 rounded-full border-[3px] border-ink bg-[#3a3a3a] shadow-hard-sm" />
    </div>
  );
}

/** Cuplikan layar berbingkai stiker. */
export function ScreenShot({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1440}
      height={900}
      sizes="(min-width: 768px) 220px, 80vw"
      className={cn("h-auto w-full rounded-xl border-[3px] border-ink shadow-hard", className)}
    />
  );
}
