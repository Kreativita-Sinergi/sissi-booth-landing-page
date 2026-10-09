"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  CalendarHeart,
  CreditCard,
  Images,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorSmartphone,
  ReceiptText,
  Settings,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { cn } from "@/components/shared/cn";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: Record<"admin" | "owner", NavItem[]> = {
  admin: [
    { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
    { href: "/admin/pelanggan", label: "Pelanggan", icon: Users },
    { href: "/admin/lisensi", label: "Lisensi", icon: KeyRound },
    { href: "/admin/pembayaran", label: "Pembayaran langganan", icon: WalletCards },
    { href: "/admin/transaksi", label: "Transaksi booth", icon: ReceiptText },
    { href: "/admin/booth", label: "Booth", icon: MonitorSmartphone },
    { href: "/admin/aktivitas", label: "Log aktivitas", icon: Activity },
    { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
    { href: "/admin/panduan", label: "Panduan admin", icon: BookOpen },
  ],
  owner: [
    { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
    { href: "/dashboard/transaksi", label: "Transaksi", icon: ReceiptText },
    { href: "/dashboard/acara", label: "Acara", icon: CalendarHeart },
    { href: "/dashboard/galeri", label: "Galeri online", icon: Images },
    { href: "/dashboard/booth", label: "Booth saya", icon: MonitorSmartphone },
    { href: "/dashboard/langganan", label: "Langganan", icon: CreditCard },
    { href: "/dashboard/pengaturan", label: "Pengaturan", icon: Settings },
  ],
};

function NavLinks({ nav, path, onPick }: { nav: NavItem[]; path: string; onPick: () => void }) {
  const home = nav[0].href;
  const active = (href: string) => (href === home ? path === href : path === href || path.startsWith(href + "/"));
  return nav.map((n) => (
    <Link
      key={n.href}
      href={n.href}
      onClick={onPick}
      aria-current={active(n.href) ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition-colors",
        active(n.href) ? "border-ink bg-white shadow-hard-sm" : "border-transparent hover:border-ink/30 hover:bg-white/50",
      )}
    >
      <n.icon aria-hidden className="size-[18px] shrink-0" strokeWidth={2.5} />
      {n.label}
    </Link>
  ));
}

function ActiveNav({ nav, onPick }: { nav: NavItem[]; onPick: () => void }) {
  return <NavLinks nav={nav} path={usePathname()} onPick={onPick} />;
}

/**
 * Kerangka dashboard: sidebar kuning (desktop) / menu geser (HP). Nama pengguna dikirim
 * sebagai elemen (di-stream di balik Suspense), tombol keluar = aksi server.
 */
export function Shell({
  variant,
  title,
  badge,
  user,
  logout,
  children,
}: {
  variant: "admin" | "owner";
  title: string;
  badge: string;
  user: React.ReactNode;
  logout: () => Promise<void>;
  children: React.ReactNode;
}) {
  const nav = NAV[variant];
  const [open, setOpen] = useState(false);
  const home = nav[0].href;
  const links = (
    // usePathname butuh Suspense (cacheComponents); cadangannya menu tanpa penanda aktif.
    <Suspense fallback={<NavLinks nav={nav} path="" onPick={() => setOpen(false)} />}>
      <ActiveNav nav={nav} onPick={() => setOpen(false)} />
    </Suspense>
  );

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <Link href={home} className="mb-1 inline-flex w-fit items-center rounded-full border-[3px] border-ink bg-booth-pink px-4 py-1.5 font-display text-xl shadow-hard-sm">
        {title}
      </Link>
      <span className="mb-5 w-fit rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">{badge}</span>
      {links}
      <div className="mt-auto flex flex-col gap-3 pt-6">
        <div className="min-w-0 rounded-xl border-2 border-ink/20 bg-white/60 px-3 py-2 text-xs">{user}</div>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-white py-2.5 font-label text-xs uppercase shadow-hard-sm hover:bg-paper">
            <LogOut aria-hidden className="size-4" strokeWidth={2.5} />
            Keluar
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh bg-paper">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 overflow-y-auto border-r-[3px] border-ink bg-booth-yellow lg:block">{sidebar}</aside>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b-[3px] border-ink bg-booth-yellow px-4 py-3 lg:hidden">
        <Link href={home} className="font-display text-lg">
          {title}
        </Link>
        <button type="button" aria-label="Buka menu" onClick={() => setOpen(true)} className="rounded-lg border-2 border-ink bg-white p-1.5">
          <Menu className="size-5" strokeWidth={2.5} />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 bg-ink/50 lg:hidden" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <aside className="relative h-full w-72 max-w-[85vw] overflow-y-auto border-r-[3px] border-ink bg-booth-yellow">
            <button type="button" aria-label="Tutup menu" onClick={() => setOpen(false)} className="absolute right-3 top-3 rounded-lg border-2 border-ink bg-white p-1">
              <X className="size-4" strokeWidth={3} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <main className="px-4 py-6 md:px-8 md:py-8 lg:ml-64">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
