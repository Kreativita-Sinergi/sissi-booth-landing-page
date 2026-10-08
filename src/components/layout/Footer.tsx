import { footer, nav, site } from "@/constants/content";
import { Container } from "../shared/Container";
import { Logo } from "../shared/Logo";

export function Footer() {
  return (
    <footer className="border-t-[3px] border-ink bg-ink text-white">
      <Container className="flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <Logo />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="font-label text-sm hover:underline">
              {n.label}
            </a>
          ))}
        </nav>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-white/20 py-6 text-sm text-white/70 md:flex-row md:justify-between">
        <p>
          © {footer.year} {site.company} · {footer.tagline}
        </p>
        <p>
          <a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a> ·{" "}
          <a href={site.whatsapp} className="hover:underline">{site.phone}</a>
        </p>
      </Container>
    </footer>
  );
}
