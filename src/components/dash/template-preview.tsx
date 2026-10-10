/* eslint-disable @next/next/no-img-element -- gambar bingkai dari server file (domain dinamis, ukuran asli). */
import { cn } from "@/components/shared/cn";
import { SAMPLE_TONES, shapePath } from "@/lib/dash/template";
import type { Slot } from "@/lib/dash/types";

/**
 * Pratinjau template (server-safe): foto contoh berwarna di tiap slot (dipotong sesuai bentuk & diputar),
 * bingkai di atas (`overlay`) atau di bawah foto. `uid` harus unik per halaman (id clipPath SVG).
 */
export function TemplatePreview({
  uid,
  src,
  width,
  height,
  overlay,
  slots,
  numbers = true,
  className,
}: {
  uid: string;
  src: string;
  width: number;
  height: number;
  overlay: boolean;
  slots: Slot[];
  numbers?: boolean;
  className?: string;
}) {
  const frame = <img src={src} alt="" draggable={false} className={cn("pointer-events-none absolute inset-0 size-full select-none", overlay ? "z-10" : "z-0")} />;
  return (
    <div className={cn("checker relative overflow-hidden", className)} style={{ aspectRatio: `${width} / ${height}` }}>
      {!overlay && frame}
      {slots.map((s, i) => {
        const id = `tp-${uid}-${i}`;
        const tone = SAMPLE_TONES[i % SAMPLE_TONES.length];
        return (
          <div
            key={i}
            className="absolute z-[5]"
            style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, width: `${s.w * 100}%`, height: `${s.h * 100}%`, transform: `rotate(${s.rotation}deg)` }}
          >
            <svg className="absolute inset-0 size-full" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden>
              <defs>
                <clipPath id={id} clipPathUnits="objectBoundingBox">
                  <path d={shapePath(s, (s.w * width) / (s.h * height))} />
                </clipPath>
                <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor={tone} />
                  <stop offset="1" stopColor={tone} stopOpacity="0.55" />
                </linearGradient>
              </defs>
              <g clipPath={`url(#${id})`}>
                <rect width="1" height="1" fill="white" />
                <rect width="1" height="1" fill={`url(#${id}-g)`} />
              </g>
            </svg>
            {numbers && (
              <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-fg/60" style={{ transform: `rotate(${-s.rotation}deg)` }}>
                {i + 1}
              </span>
            )}
          </div>
        );
      })}
      {overlay && frame}
    </div>
  );
}
