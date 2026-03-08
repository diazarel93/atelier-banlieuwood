"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/v2",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/v2/seances",
    label: "Séances",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 4h14M2 9h14M2 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/v2/statistiques",
    label: "Statistiques",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 15V8M7 15V5M11 15V9M15 15V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/v2/bibliotheque",
    label: "Modules",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 3h5l2 2h7v10H2V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/v2/fiche-cours",
    label: "Fiche de cours",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M4 2h7l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M11 2v4h4M6 10h6M6 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function AppShellV2({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--color-bw-border)] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/v2" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bw-primary text-white text-xs font-bold">
              BW
            </div>
            <span className="text-sm font-bold text-bw-heading hidden sm:inline">
              Banlieuwood
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/v2"
                  ? pathname === "/v2"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--color-bw-surface-dim)] text-bw-heading"
                      : "text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)]"
                  )}
                >
                  <span className={cn(isActive ? "text-bw-primary" : "text-bw-muted")}>
                    {item.icon}
                  </span>
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href="/v2/seances/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-bw-primary px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-bw-primary-500 btn-glow"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">Nouvelle séance</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
