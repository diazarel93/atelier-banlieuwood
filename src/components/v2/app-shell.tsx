"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { FullscreenToggle } from "./fullscreen-toggle";
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
  IconSettings,
  IconHelp,
} from "./icons";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** Hide from intervenants (post-session only views) */
  professeurOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: <IconDashboard /> },
  { href: ROUTES.seances, label: "Séances", icon: <IconSeances /> },
  { href: ROUTES.eleves, label: "Élèves", icon: <IconEleves />, professeurOnly: true },
  { href: ROUTES.statistiques, label: "Statistiques", icon: <IconStatistiques />, professeurOnly: true },
  { href: ROUTES.bibliotheque, label: "Modules", icon: <IconModules /> },
  { href: ROUTES.ficheCours, label: "Fiche de cours", icon: <IconFicheCours /> },
];

export function AppShellV2({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { data: authUser } = useAuthUser();
  const isAdmin = authUser?.role === "admin";
  const isIntervenant = authUser?.role === "intervenant";

  // R4(2b): filter nav items based on role
  const visibleNavItems = NAV_ITEMS.filter((item) => !item.professeurOnly || !isIntervenant);
  const bottomNavItems = visibleNavItems.slice(0, 4);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

      {/* Top navigation bar — V6 dark */}
      <header className="sticky top-0 z-40 w-full bg-[var(--color-bw-bg)]/85 backdrop-blur-2xl border-b border-[var(--color-bw-border)] relative">
        {/* V6 cinema accent — violet gradient top-line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-bw-violet)]/30 to-transparent"
          aria-hidden="true"
        />
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-4 sm:px-6">
          {/* Logo — V6 violet accent */}
          <Link href={ROUTES.dashboard} className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-bw-violet)] text-white text-xs font-bold shadow-[0_0_12px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.45)] transition-shadow">
              BW
            </div>
            <span className="text-heading-xs text-bw-heading hidden sm:inline">Banlieuwood</span>
          </Link>

          {/* Desktop nav links — V6 */}
          <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-0.5 h-14">
            {visibleNavItems.map((item) => {
              const isActive =
                item.href === ROUTES.dashboard ? pathname === ROUTES.dashboard : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 h-14 text-sm font-medium transition-colors",
                    isActive ? "text-[var(--color-bw-violet-200)]" : "text-bw-muted hover:text-bw-heading",
                  )}
                >
                  <span
                    className={cn("transition-colors", isActive ? "text-[var(--color-bw-violet)]" : "text-bw-muted")}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {/* Active indicator — V6 violet glow bar */}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[var(--color-bw-violet)] shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search button — V6 dark */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden lg:flex items-center gap-2 rounded-lg border border-[var(--color-bw-border)] bg-[var(--color-bw-surface-dim)]/40 px-3 py-1.5 text-sm text-bw-muted hover:bg-[var(--color-bw-surface-dim)] hover:border-[var(--color-bw-violet)]/20 transition-colors"
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
            <FullscreenToggle />
            <ThemeToggle />
            <NotificationBell />
            {isAdmin && (
              <Link
                href={ROUTES.admin}
                aria-label="Administration"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith("/v2/admin")
                    ? "bg-[var(--color-bw-violet)]/10 text-[var(--color-bw-violet)]"
                    : "text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)]",
                )}
              >
                <IconAdmin size={16} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <Link
              href={ROUTES.aide}
              aria-label="Aide"
              className={cn(
                "inline-flex items-center justify-center rounded-xl p-2 transition-colors",
                pathname.startsWith("/v2/aide")
                  ? "bg-[var(--color-bw-violet)]/10 text-[var(--color-bw-violet)]"
                  : "text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)]",
              )}
            >
              <IconHelp size={18} />
            </Link>
            <Link
              href={ROUTES.settings}
              aria-label="Reglages"
              className={cn(
                "inline-flex items-center justify-center rounded-xl p-2 transition-colors",
                pathname.startsWith("/v2/settings")
                  ? "bg-[var(--color-bw-violet)]/10 text-[var(--color-bw-violet)]"
                  : "text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)]",
              )}
            >
              <IconSettings size={18} />
            </Link>
            <Link
              href={ROUTES.seanceNew}
              aria-label="Créer une nouvelle séance"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-bw-violet)] px-3.5 py-2 text-sm font-semibold text-white shadow-[0_0_12px_rgba(139,92,246,0.25)] hover:bg-[var(--color-bw-violet-500)] hover:shadow-[0_0_20px_rgba(139,92,246,0.35)] active:scale-[0.97] transition-all duration-150"
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
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer — V6 dark */}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-[var(--color-bw-bg)] shadow-2xl border-r border-[var(--color-bw-border)] flex flex-col transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!mobileOpen}
        // @ts-expect-error -- inert is valid HTML but not yet in React's types
        inert={mobileOpen ? undefined : ""}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--color-bw-border)] shrink-0">
          <Link href={ROUTES.dashboard} onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-bw-violet)] text-white text-xs font-bold shadow-[0_0_12px_rgba(139,92,246,0.3)]">
              BW
            </div>
            <span className="text-base font-bold text-bw-heading">Banlieuwood</span>
          </Link>
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)] active:scale-95 transition-all"
          >
            <IconClose />
          </button>
        </div>

        {/* Drawer nav */}
        <nav aria-label="Navigation mobile" className="flex-1 overflow-y-auto px-3 py-4">
          {/* Primary nav */}
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-bw-muted/60">Navigation</p>
          <div className="flex flex-col gap-1">
            {visibleNavItems.map((item) => {
              const isActive =
                item.href === ROUTES.dashboard ? pathname === ROUTES.dashboard : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition-all",
                    isActive
                      ? "bg-[var(--color-bw-violet)]/10 text-bw-heading shadow-sm"
                      : "text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                      isActive
                        ? "bg-[var(--color-bw-violet)] text-white shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                        : "bg-[var(--color-bw-surface-dim)] text-bw-muted",
                    )}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && <span className="ml-auto h-2 w-2 rounded-full bg-[var(--color-bw-violet)]" />}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-4 mx-3 h-px bg-[var(--color-bw-border)]" />

          {/* Secondary nav */}
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-bw-muted/60">Support</p>
          <div className="flex flex-col gap-1">
            {[
              { href: ROUTES.aide, label: "Aide", icon: <IconHelp />, match: "/v2/aide" },
              { href: ROUTES.settings, label: "Réglages", icon: <IconSettings />, match: "/v2/settings" },
            ].map((item) => {
              const isActive = pathname.startsWith(item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition-all",
                    isActive
                      ? "bg-[var(--color-bw-violet)]/10 text-bw-heading shadow-sm"
                      : "text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                      isActive
                        ? "bg-[var(--color-bw-violet)] text-white shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                        : "bg-[var(--color-bw-surface-dim)] text-bw-muted",
                    )}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Drawer footer — CTA V6 */}
        <div className="shrink-0 px-3 pb-5 pt-3 border-t border-[var(--color-bw-border)]">
          <Link
            href={ROUTES.seanceNew}
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[var(--color-bw-violet)] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_12px_rgba(139,92,246,0.25)] hover:bg-[var(--color-bw-violet-500)] active:scale-[0.97] transition-all"
          >
            <IconPlus />
            Nouvelle séance
          </Link>
        </div>
      </div>

      {/* Content */}
      <main id="main-content" className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Navigation rapide"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bw-bg)]/90 backdrop-blur-2xl border-t border-[var(--color-bw-border)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Subtle film-strip perforation line above nav */}
        <div className="film-strip-line absolute top-0 left-4 right-4 -translate-y-px" aria-hidden="true" />
        <div className="flex items-center justify-around h-14">
          {bottomNavItems.map((item) => {
            const isActive =
              item.href === ROUTES.dashboard ? pathname === ROUTES.dashboard : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors",
                  isActive ? "text-[var(--color-bw-violet)]" : "text-bw-muted hover:text-bw-heading",
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
