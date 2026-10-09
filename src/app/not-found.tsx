import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/shared/Button";
import { Chip } from "@/components/shared/Chip";
import { Container } from "@/components/shared/Container";
import { PhotoStrip } from "@/components/shared/PhotoStrip";
import { BurstSticker, Highlight } from "@/components/shared/Stickers";
import { notFoundPage } from "@/constants/content";

export const metadata: Metadata = { title: notFoundPage.meta, robots: { index: false } };

/** 404 untuk semua alamat yang tidak ada (menggantikan halaman bawaan Next). */
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="py-16 md:py-24">
        <Container className="grid items-center gap-12 md:grid-cols-[1.4fr_0.6fr]">
          <div className="flex min-w-0 flex-col items-start gap-6">
            <Chip accent="white">{notFoundPage.kicker}</Chip>
            <h1 className="font-display text-[clamp(34px,10vw,44px)] leading-none md:text-7xl">
              {notFoundPage.title}
              <br />
              <Highlight rotate={-2} className="mt-3">{notFoundPage.highlight}</Highlight>
            </h1>
            <p className="max-w-[560px] text-lg font-bold">{notFoundPage.body}</p>
            <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <Button href={notFoundPage.home.href} size="lg" arrow>
                {notFoundPage.home.label}
              </Button>
              <Button href={notFoundPage.guide.href} variant="secondary" size="lg">
                {notFoundPage.guide.label}
              </Button>
            </div>
          </div>
          <div aria-hidden className="relative mx-auto w-28 md:w-52">
            <PhotoStrip className="-rotate-6" colors={["pink", "blue", "green", "orange"]} />
            {/* Pembungkus: StarSticker sudah `relative`, jadi posisi absolut diletakkan di luar. */}
            <div className="absolute -right-12 -top-8 size-24 md:-right-14 md:size-32">
              <BurstSticker accent="pink" rotate={12} className="size-full">
                {notFoundPage.sticker}
              </BurstSticker>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
