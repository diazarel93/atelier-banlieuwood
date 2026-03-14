"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { CommandPalette } from "./command-palette";
import { useAuthUser } from "@/hooks/use-auth-user";
import {
  IconDashboard,
  IconSeances,
  IconEleves,
  IconStatistiques,
  IconModules,
  IconFicheCours,
  IconAdmin,
  IconPlus,
  IconSearch,
  IconHamburger,
  IconClose,
} from "./icons";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: <IconDashboard /> },
  { href: ROUTES.seances, label: "Séances", icon: <IconSeances /> },
  { href: ROUTES.eleves, label: "Élèves", icon: <IconEleves /> },
  { href: ROUTES.statistiques, label: "Statistiques", icon: <IconStatistiques /> },
  { href: ROUTES.bibliotheque, label: "Modules", icon: <IconModules /> },
  { href: ROUTES.ficheCours, label: "Fiche de cours", icon: <IconFicheCours /> },
];

const BOTTOM_NAV_ITEMS = NAV_ITEMS.slice(0, 4); // Dashboard, Séances, Élèves, Statistiques

export function AppShellV2({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { data: authUser } = useAuthUser();
  const isAdmin = authUser?.role === "admin";

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      <header className="sticky top-0 z-40 w-full bg-card/80 backdrop-blur-xl border-b border-[var(--color-bw-border)]">
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

          {/* Search button — desktop only */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden lg:flex items-center gap-2 rounded-lg border border-[var(--color-bw-border)] bg-[var(--color-bw-surface-dim)]/50 px-3 py-1.5 text-sm text-bw-muted hover:bg-[var(--color-bw-surface-dim)] transition-colors"
          >
            <IconSearch size={14} className="shrink-0" />
            Rechercher...
            <kbd className="ml-4 text-xs bg-[var(--color-bw-surface-dim)] rounded px-1.5 py-0.5 border border-[var(--color-bw-border)]">
              &#8984;K
            </kbd>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            {isAdmin && (
              <Link
                href={ROUTES.admin}
                aria-label="Administration"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith("/v2/admin")
                    ? "bg-bw-primary/10 text-bw-primary"
                    : "text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)]"
                )}
              >
                <IconAdmin size={16} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <Link
              href={ROUTES.seanceNew}
              aria-label="Créer une nouvelle séance"
              className="inline-flex items-center gap-1.5 rounded-xl bg-bw-primary px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-bw-primary-500 hover:shadow-md active:scale-[0.97] transition-all duration-150"
            >
              <IconPlus />
              <span className="hidden sm:inline">Nouvelle séance</span>
            </Link>

            {/* Hamburger button — mobile only (hidden when bottom nav present) */}
            <button
              type="button"
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)] active:scale-95 transition-all duration-150"
            >
              {mobileOpen ? <IconClose /> : <IconHamburger />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-200 ease-out",
            mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          )}
          aria-hidden={!mobileOpen}
          // @ts-expect-error -- inert is valid HTML but not yet in React's types
          inert={mobileOpen ? undefined : ""}
        >
          <nav aria-label="Navigation mobile" className="border-t border-[var(--color-bw-border)] bg-card px-4 pb-3 pt-2">
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
      <main id="main-content" className="flex-1 pb-16 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Navigation rapide"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-xl border-t border-[var(--color-bw-border)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-14">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === ROUTES.dashboard
                ? pathname === ROUTES.dashboard
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors",
                  isActive
                    ? "text-bw-primary"
                    : "text-bw-muted hover:text-bw-heading"
                )}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Command palette */}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </div>
  );
}
