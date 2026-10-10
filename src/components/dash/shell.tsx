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
import { dashRoot } from "@/lib/dash/font";

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
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active(n.href) ? "bg-primary-soft text-primary" : "text-subtle hover:bg-canvas hover:text-fg",
      )}
    >
      <n.icon aria-hidden className="size-[18px] shrink-0" strokeWidth={2} />
      {n.label}
    </Link>
  ));
}

function ActiveNav({ nav, onPick }: { nav: NavItem[]; onPick: () => void }) {
  return <NavLinks nav={nav} path={usePathname()} onPick={onPick} />;
}

/**
 * Kerangka dashboard netral: sidebar putih (desktop) / menu geser (HP). Nama pengguna dikirim
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
    <nav className="flex h-full flex-col gap-0.5 p-4">
      <Link href={home} className="mb-6 flex items-center gap-2.5 px-2 pt-1">
        <span aria-hidden className="inline-flex size-8 items-center justify-center rounded-lg bg-fg text-sm font-semibold text-white">S</span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-xs text-subtle">{badge}</span>
        </span>
      </Link>
      {links}
      <div className="mt-auto flex flex-col gap-2 border-t border-edge pt-4">
        <div className="min-w-0 px-2 text-xs">{user}</div>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-subtle hover:bg-canvas hover:text-fg">
            <LogOut aria-hidden className="size-[18px]" strokeWidth={2} />
            Keluar
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <div className={cn(dashRoot, "min-h-dvh bg-canvas")}>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 overflow-y-auto border-r border-edge bg-surface lg:block">{sidebar}</aside>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-edge bg-surface px-4 py-3 lg:hidden">
        <Link href={home} className="flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden className="inline-flex size-7 items-center justify-center rounded-md bg-fg text-xs text-white">S</span>
          {title}
        </Link>
        <button type="button" aria-label="Buka menu" onClick={() => setOpen(true)} className="rounded-lg border border-edge-strong bg-surface p-1.5 hover:bg-canvas">
          <Menu className="size-5" strokeWidth={2} />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 bg-fg/40 lg:hidden" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <aside className="relative h-full w-72 max-w-[85vw] overflow-y-auto bg-surface shadow-pop">
            <button type="button" aria-label="Tutup menu" onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-lg p-1 text-subtle hover:bg-canvas">
              <X className="size-4" strokeWidth={2} />
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
