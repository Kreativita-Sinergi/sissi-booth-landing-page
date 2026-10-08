import { Chip } from "./Chip";
import { Container } from "./Container";
import { cn } from "./cn";

type Tone = "yellow" | "white" | "ink";
const tones: Record<Tone, string> = {
  yellow: "bg-booth-yellow",
  white: "bg-white",
  ink: "bg-ink text-booth-yellow",
};

/** Bagian halaman: latar, garis atas, jarak baku, judul + kicker opsional. */
export function Section({
  id,
  tone = "yellow",
  kicker,
  kickerAccent = "white",
  title,
  align = "center",
  className,
  children,
}: {
  id?: string;
  tone?: Tone;
  kicker?: string;
  kickerAccent?: React.ComponentProps<typeof Chip>["accent"];
  title?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 border-t-[3px] border-ink py-16 md:py-24", tones[tone], className)}>
      <Container>
        {(kicker || title) && (
          <header className={cn("mb-10 flex flex-col gap-4 md:mb-14", align === "center" && "md:items-center md:text-center")}>
            {kicker && (
              <Chip accent={kickerAccent} className={cn("self-start", align === "center" && "md:self-auto")}>
                {kicker}
              </Chip>
            )}
            {title && <h2 className="font-display text-4xl leading-none md:text-6xl">{title}</h2>}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
