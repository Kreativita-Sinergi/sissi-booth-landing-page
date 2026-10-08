import { hero } from "@/constants/content";
import { Button } from "../shared/Button";
import { Chip } from "../shared/Chip";
import { Container } from "../shared/Container";
import { KioskMockup, LaptopMockup } from "../shared/Devices";
import { BurstSticker, Highlight, PillSticker, StarSticker } from "../shared/Stickers";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute -top-32 right-[-120px] size-[480px] rounded-full border-4 border-ink/15" />
      <Container className="relative grid items-center gap-14 py-14 md:py-20 lg:grid-cols-[1fr_1.05fr]">
        <div className="flex flex-col items-start gap-7">
          <Chip accent="green">{hero.kicker}</Chip>
          <h1 className="font-display text-[clamp(44px,6.4vw,84px)] leading-[0.95] whitespace-nowrap">
            {hero.title}
            <br />
            <Highlight className="mt-3">{hero.highlight}</Highlight>
          </h1>
          <p className="max-w-[560px] text-lg font-bold leading-relaxed md:text-[22px]">{hero.body}</p>
          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Button href={hero.primary.href} size="lg" arrow>
              {hero.primary.label}
            </Button>
            <Button href={hero.secondary.href} size="lg" variant="secondary">
              {hero.secondary.label}
            </Button>
          </div>
          <ul className="flex flex-wrap gap-3">
            {hero.badges.map((b) => (
              <li key={b.label}>
                <Chip dot={b.dot} className="normal-case">{b.label}</Chip>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[640px] pb-10">
          <LaptopMockup src="/screens/tunggu-l.png" alt="Layar tunggu Sissi Booth di laptop" preload className="w-[88%]" />
          <KioskMockup src="/screens/tunggu-p.png" alt="Layar tunggu Sissi Booth di kiosk portrait" className="absolute bottom-0 right-0 w-[28%]" />
          <BurstSticker accent="orange" rotate={12} className="absolute -top-8 right-[8%] size-28 md:size-36">
            QRIS otomatis
          </BurstSticker>
          <StarSticker accent="pink" className="absolute -left-4 bottom-[28%] size-16 md:size-20" />
          <PillSticker rotate={-5} className="absolute bottom-2 left-[18%]">
            Cetak + QR + GIF
          </PillSticker>
        </div>
      </Container>
    </section>
  );
}
