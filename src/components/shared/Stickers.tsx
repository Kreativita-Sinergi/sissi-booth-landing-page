import type { Accent } from "@/constants/content";
import { accentBg } from "./accent";
import { cn } from "./cn";

const fills: Record<Accent, string> = {
  pink: "#ff5fa2",
  blue: "#3d7bff",
  green: "#3ddc84",
  orange: "#ff8a3d",
  lilac: "#b69cff",
  yellow: "#ffe24a",
  white: "#ffffff",
};

/** Titik-titik poligon bintang/ledakan dalam kotak 100×100. */
function starPoints(points: number, inner: number) {
  return Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 === 0 ? 46 : 46 * inner;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    return `${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`;
  }).join(" ");
}

/** Bintang/ledakan bergaris tebal dengan bayangan keras (hiasan). */
export function StarSticker({
  accent = "pink",
  points = 5,
  inner = 0.45,
  rotate = 12,
  className,
  children,
}: {
  accent?: Accent;
  points?: number;
  inner?: number;
  rotate?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const shape = starPoints(points, inner);
  return (
    <div aria-hidden={!children} className={cn("relative", className)} style={{ transform: `rotate(${rotate}deg)` }}>
      <svg viewBox="0 0 100 100" className="size-full overflow-visible">
        <polygon points={shape} fill="#111" transform="translate(4 4)" />
        <polygon points={shape} fill={fills[accent]} stroke="#111" strokeWidth={4} strokeLinejoin="round" />
      </svg>
      {children && (
        <span className="absolute inset-[22%] flex items-center justify-center text-center font-label text-[clamp(10px,1.2vw,18px)] leading-tight uppercase">
          {children}
        </span>
      )}
    </div>
  );
}

/** Ledakan bergerigi berisi teks pendek. */
export function BurstSticker(props: Omit<React.ComponentProps<typeof StarSticker>, "points" | "inner">) {
  return <StarSticker points={14} inner={0.78} {...props} />;
}

/** Pil miring seperti stiker tempel. */
export function PillSticker({
  accent = "white",
  rotate = 6,
  className,
  children,
}: {
  accent?: Accent;
  rotate?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border-4 border-ink px-5 py-2 font-label text-sm uppercase shadow-hard-sm md:text-base",
        accentBg[accent],
        accent === "blue" ? "text-white" : "text-ink",
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

/** Teks judul dalam "stiker" hijau miring (mis. "makin cuan!"). */
export function Highlight({ rotate = 2, className, children }: { rotate?: number; className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-[22px] border-[5px] border-ink bg-booth-green px-5 pb-2 shadow-hard-lg md:px-8",
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
