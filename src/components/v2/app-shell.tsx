"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { NotificationBell } from "./notification-bell";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: ROUTES.dashboard,
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
    href: ROUTES.seances,
    label: "Séances",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 4h14M2 9h14M2 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: ROUTES.eleves,
    label: "Élèves",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M12 13v-1a3 3 0 00-3-3H5a3 3 0 00-3 3v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 13v-1a3 3 0 00-2-2.83M11 1.17a3 3 0 010 5.66" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: ROUTES.statistiques,
    label: "Statistiques",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 15V8M7 15V5M11 15V9M15 15V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: ROUTES.bibliotheque,
    label: "Modules",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 3h5l2 2h7v10H2V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: ROUTES.ficheCours,
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:rounded-lg focus:bg-bw-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Aller au contenu principal
      </a>

      {/* Top navigation bar */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-[var(--color-bw-border)]">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-4 sm:px-6">
          {/* Logo */}
          <Link href={ROUTES.dashboard} className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bw-primary text-white text-xs font-bold shadow-sm group-hover:shadow-md transition-shadow">
              BW
            </div>
            <span className="text-heading-xs text-bw-heading hidden sm:inline">
              Banlieuwood
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-0.5 h-14">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === ROUTES.dashboard
                  ? pathname === ROUTES.dashboard
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 h-14 text-sm font-medium transition-colors",
                    isActive
                      ? "text-bw-heading"
                      : "text-bw-muted hover:text-bw-heading"
                  )}
                >
                  <span className={cn(
                    "transition-colors",
                    isActive ? "text-bw-primary" : "text-bw-muted group-hover:text-bw-heading"
                  )} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {/* Active indicator — bottom bar */}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-bw-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link
              href={ROUTES.seanceNew}
              aria-label="Créer une nouvelle séance"
              className="inline-flex items-center gap-1.5 rounded-xl bg-bw-primary px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-bw-primary-500 hover:shadow-md active:scale-[0.97] transition-all duration-150"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">Nouvelle séance</span>
            </Link>

            {/* Hamburger button — mobile only */}
            <button
              type="button"
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)] active:scale-95 transition-all duration-150"
            >
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-200 ease-out",
            mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav aria-label="Navigation mobile" className="border-t border-[var(--color-bw-border)] bg-white px-4 pb-3 pt-2">
            <div className="flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === ROUTES.dashboard
                    ? pathname === ROUTES.dashboard
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-bw-primary/5 text-bw-heading"
                        : "text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)]"
                    )}
                  >
                    <span className={cn(isActive ? "text-bw-primary" : "text-bw-muted")} aria-hidden="true">
                      {item.icon}
                    </span>
                    {item.label}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-bw-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main id="main-content" className="flex-1">{children}</main>
    </div>
  );
}
