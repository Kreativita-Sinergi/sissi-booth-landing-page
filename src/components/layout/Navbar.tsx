"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { nav, navCta, site } from "@/constants/content";
import { Button } from "../shared/Button";
import { Container } from "../shared/Container";
import { Logo } from "../shared/Logo";

/** Navigasi atas (lengket); menu lipat di mobile. */
export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-booth-yellow">
      <Container className="flex h-[72px] items-center justify-between gap-6 md:h-24">
        <Link href="/" aria-label={site.name}>
          <Logo />
        </Link>
        <nav aria-label="Utama" className="hidden items-center gap-9 lg:flex">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="font-label text-[15px] hover:underline hover:decoration-[3px] hover:underline-offset-4">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Button href={navCta.href}>{navCta.label}</Button>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex size-12 items-center justify-center rounded-xl border-[3px] border-ink bg-white shadow-hard-sm lg:hidden"
        >
          {open ? <X aria-hidden strokeWidth={3} /> : <Menu aria-hidden strokeWidth={3} />}
        </button>
      </Container>
      {open && (
        <nav id="menu-mobile" aria-label="Menu mobile" className="border-t-[3px] border-ink bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {nav.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-xl px-2 py-3 font-label text-lg hover:bg-paper">
                {n.label}
              </a>
            ))}
            <Button href={navCta.href} className="mt-2">
              {navCta.label}
            </Button>
          </Container>
        </nav>
      )}
    </header>
  );
}
