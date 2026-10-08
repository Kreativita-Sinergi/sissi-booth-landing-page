import { Mail, MessageCircle } from "lucide-react";
import { contact, site } from "@/constants/content";
import { Button } from "../shared/Button";
import { Container } from "../shared/Container";
import { BurstSticker, Highlight } from "../shared/Stickers";
import { PhotoStrip } from "../shared/PhotoStrip";

export function Contact() {
  return (
    <section id="kontak" className="scroll-mt-20 border-t-[3px] border-ink bg-white py-16 md:py-24">
      <Container>
        <div className="relative grid gap-10 overflow-hidden rounded-[28px] border-[5px] border-ink bg-booth-pink p-6 shadow-hard-lg md:grid-cols-[1.3fr_0.7fr] md:p-14">
          <div className="flex flex-col items-start gap-6">
            <h2 className="font-display text-4xl leading-none md:text-6xl">
              {contact.title}
              <br />
              <Highlight rotate={-2} className="mt-3">{contact.highlight}</Highlight>
            </h2>
            <p className="max-w-[560px] text-lg font-bold">{contact.body}</p>
            <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <Button href={`mailto:${site.email}`} variant="secondary" size="lg">
                <Mail aria-hidden className="size-5" strokeWidth={3} />
                {contact.email}
              </Button>
              <Button href={site.whatsapp} external variant="success" size="lg">
                <MessageCircle aria-hidden className="size-5" strokeWidth={3} />
                {contact.whatsapp}
              </Button>
            </div>
            <p className="flex flex-col gap-1 font-mono text-sm font-bold sm:flex-row sm:gap-8">
              <a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a>
              <a href={site.whatsapp} className="hover:underline">{site.phone}</a>
            </p>
          </div>
          <div aria-hidden className="relative hidden h-full min-h-[360px] md:block">
            <PhotoStrip className="absolute left-[8%] top-0 w-[38%] -rotate-6" colors={["yellow", "blue", "green", "orange"]} />
            <PhotoStrip className="absolute right-[8%] top-2 w-[38%] rotate-6" colors={["orange", "green", "blue", "yellow"]} />
            <BurstSticker accent="orange" rotate={-12} className="absolute bottom-0 left-[34%] size-32">
              See you!
            </BurstSticker>
          </div>
        </div>
      </Container>
    </section>
  );
}
