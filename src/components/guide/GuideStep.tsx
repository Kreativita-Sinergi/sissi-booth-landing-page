import { AlertTriangle, Check, Info, Lightbulb } from "lucide-react";
import Image from "next/image";
import type { Accent } from "@/constants/content";
import { type GuideCallout, type GuideShot, type GuideStep as Step, guideUi } from "@/constants/guides";
import { accentBg, accentText } from "../shared/accent";
import { cn } from "../shared/cn";
import { StickerBox } from "../shared/StickerBox";

const shotSize: Record<NonNullable<GuideShot["device"]>, { w: number; h: number; cls: string }> = {
  screen: { w: 1440, h: 900, cls: "w-full" },
  phone: { w: 780, h: 2440, cls: "mx-auto w-full max-w-[280px]" },
  print: { w: 600, h: 1800, cls: "mx-auto w-full max-w-[200px]" },
};

function Shots({ shots, priority }: { shots: GuideShot[]; priority: boolean }) {
  return (
    <div className={cn("grid gap-4", shots.length > 1 && "sm:grid-cols-2")}>
      {shots.map((s, i) => {
        const size = shotSize[s.device ?? "screen"];
        return (
          <Image
            key={s.src}
            src={s.src}
            alt={s.alt}
            width={size.w}
            height={size.h}
            preload={priority && i === 0}
            sizes={shots.length > 1 ? "(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw" : "(min-width: 1024px) 760px, 90vw"}
            className={cn("h-auto rounded-xl border-[3px] border-ink shadow-hard-sm", size.cls)}
          />
        );
      })}
    </div>
  );
}

const calloutStyle: Record<GuideCallout["type"], { bg: string; Icon: typeof Info }> = {
  tip: { bg: "bg-booth-green", Icon: Lightbulb },
  info: { bg: "bg-booth-lilac", Icon: Info },
  warning: { bg: "bg-booth-orange", Icon: AlertTriangle },
};

export function Callout({ callout }: { callout: GuideCallout }) {
  const { bg, Icon } = calloutStyle[callout.type];
  return (
    <aside className={cn("flex items-start gap-3 rounded-2xl border-[3px] border-ink p-4 md:p-5", bg)}>
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0" strokeWidth={2.75} />
      <div>
        <p className="font-label text-sm uppercase">
          <span className="sr-only">{guideUi.calloutLabels[callout.type]}: </span>
          {callout.title}
        </p>
        <p className="mt-1 font-medium">{callout.text}</p>
      </div>
    </aside>
  );
}

/** Satu langkah panduan: nomor, judul, teks, gambar layar, poin, dan catatan. */
export function GuideStep({ step, n, accent }: { step: Step; n: number; accent: Accent }) {
  return (
    <StickerBox as="article" className="p-5 md:p-8">
      <div id={step.id} className="flex scroll-mt-32 flex-col gap-5">
        <div className="flex flex-col items-start gap-3">
          <span className={cn("rounded-full border-[3px] border-ink px-3 py-0.5 font-mono text-sm", accentBg[accent], accentText[accent])}>
            {guideUi.stepLabel} {String(n).padStart(2, "0")}
          </span>
          <h2 className="font-display text-2xl leading-tight md:text-4xl">{step.title}</h2>
          <p className="text-lg">{step.body}</p>
        </div>

        {step.shots.length > 0 && (
          <figure className="flex flex-col gap-3">
            <Shots shots={step.shots} priority={n === 1} />
            {step.caption && <figcaption className="font-mono text-sm text-muted">{step.caption}</figcaption>}
          </figure>
        )}

        {step.points && (
          <ul className="flex flex-col gap-2.5 rounded-2xl border-[3px] border-ink bg-paper p-4 md:p-5">
            {step.points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-booth-green">
                  <Check aria-hidden className="size-3.5" strokeWidth={4} />
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}

        {step.callout && <Callout callout={step.callout} />}
      </div>
    </StickerBox>
  );
}
