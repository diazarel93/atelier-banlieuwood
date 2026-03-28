"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { NotificationBell } from "./notification-bell";
import { FullscreenToggle } from "./fullscreen-toggle";
import { CommandPalette } from "./command-palette";
import { useAuthUser } from "@/hooks/use-auth-user";
import { createClient } from "@/lib/supabase/client";
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

// ═══════════════════════════════════════════════════════════════
// APP SHELL V2 — Sidebar layout matching maquette HTML V2
// Layout: sidebar gauche dark (240px) + main content
// ═══════════════════════════════════════════════════════════════

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  emoji?: string;
  professeurOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.dashboard, label: "Tableau de bord", icon: <IconDashboard />, emoji: "📊" },
  { href: ROUTES.seances, label: "Séances", icon: <IconSeances />, emoji: "📋" },
  { href: ROUTES.eleves, label: "Élèves", icon: <IconEleves />, emoji: "👥", professeurOnly: true },
  { href: ROUTES.statistiques, label: "Statistiques", icon: <IconStatistiques />, emoji: "📈", professeurOnly: true },
  { href: ROUTES.bibliotheque, label: "Modules", icon: <IconModules />, emoji: "🎬" },
  { href: ROUTES.ficheCours, label: "Fiche de cours", icon: <IconFicheCours />, emoji: "📄" },
];

export function AppShellV2({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { data: authUser } = useAuthUser();
  const isAdmin = authUser?.role === "admin";
  const isIntervenant = authUser?.role === "intervenant";

  const visibleNavItems = NAV_ITEMS.filter((item) => !item.professeurOnly || !isIntervenant);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Cmd+K global shortcut
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

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(ROUTES.login);
  }

  const firstName = authUser?.name?.split(" ")[0] || "";
  const role = authUser?.role === "intervenant" ? "Intervenant" : authUser?.role === "admin" ? "Admin" : "Professeur";

  return (
    <div className="min-h-dvh flex">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:rounded-lg focus:bg-[var(--color-bw-violet)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Aller au contenu principal
      </a>

      {/* ══ SIDEBAR — Desktop ══ */}
      <aside className="hidden lg:flex w-[220px] flex-col bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] sticky top-0 h-dvh overflow-y-auto flex-shrink-0">
        {/* User info */}
        <div className="px-4 py-5 border-b border-[var(--sidebar-border)]">
          <div className="text-body-sm font-bold text-[var(--color-bw-heading)]">{firstName || "Utilisateur"}</div>
          <div className="text-body-xs text-[var(--color-bw-muted)]">{role}</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {visibleNavItems.map((item) => {
            const isActive =
              item.href === ROUTES.dashboard ? pathname === ROUTES.dashboard : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-sm,10px)] text-body-sm font-medium transition-all duration-200 w-full focus-visible:ring-2 focus-visible:ring-bw-primary/50 focus-visible:outline-none",
                  isActive
                    ? "bg-[var(--sidebar-accent)] text-[var(--color-bw-violet)] font-semibold"
                    : "text-[var(--color-bw-muted)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--color-bw-heading)]",
                )}
              >
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}

          {/* Create session CTA */}
          <Link
            href={ROUTES.seanceNew}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-sm,10px)] text-body-sm font-bold text-white bg-[var(--color-bw-violet)] hover:bg-[var(--color-bw-violet-500)] transition-all mt-3 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
          >
            <IconPlus />
            Nouvelle séance
          </Link>
        </nav>

        {/* Bottom nav */}
        <div className="px-3 pb-4 space-y-0.5 border-t border-[var(--sidebar-border)] pt-3">
          {isAdmin && (
            <Link
              href={ROUTES.admin}
              className={cn(
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-sm,10px)] text-body-sm font-medium transition-all duration-200 w-full focus-visible:ring-2 focus-visible:ring-bw-primary/50 focus-visible:outline-none",
                pathname.startsWith("/v2/admin")
                  ? "bg-[var(--sidebar-accent)] text-[var(--color-bw-violet)]"
                  : "text-[var(--color-bw-muted)] hover:text-[var(--color-bw-heading)] hover:bg-[var(--sidebar-accent)]",
              )}
            >
              <span className="text-base">🛡️</span>
              Admin
            </Link>
          )}
          <Link
            href={ROUTES.settings}
            className={cn(
              "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-sm,10px)] text-body-sm font-medium transition-all duration-200 w-full focus-visible:ring-2 focus-visible:ring-bw-primary/50 focus-visible:outline-none",
              pathname.startsWith("/v2/settings")
                ? "bg-[var(--sidebar-accent)] text-[var(--color-bw-violet)]"
                : "text-[var(--color-bw-muted)] hover:text-[var(--color-bw-heading)] hover:bg-[var(--sidebar-accent)]",
            )}
          >
            <span className="text-base">⚙️</span>
            Paramètres
          </Link>
          <Link
            href={ROUTES.aide}
            className={cn(
              "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-sm,10px)] text-body-sm font-medium transition-all duration-200 w-full focus-visible:ring-2 focus-visible:ring-bw-primary/50 focus-visible:outline-none",
              pathname.startsWith("/v2/aide")
                ? "bg-[var(--sidebar-accent)] text-[var(--color-bw-violet)]"
                : "text-[var(--color-bw-muted)] hover:text-[var(--color-bw-heading)] hover:bg-[var(--sidebar-accent)]",
            )}
          >
            <span className="text-base">❓</span>
            Aide
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-sm,10px)] text-body-sm font-medium text-[var(--color-bw-danger)] hover:bg-[var(--color-bw-danger)]/10 transition-all w-full cursor-pointer"
          >
            <span className="text-base">🚪</span>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ══ MOBILE TOP BAR ══ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-[var(--sidebar)]/95 backdrop-blur-xl border-b border-[var(--sidebar-border)]">
        <Link href={ROUTES.dashboard} className="flex items-center gap-2">
          <span className="text-lg">🎬</span>
          <span className="text-sm font-bold text-[var(--color-bw-heading)]">Banlieuwood</span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-[var(--color-bw-muted)] hover:text-[var(--color-bw-heading)] hover:bg-[var(--sidebar-accent)]"
          >
            {mobileOpen ? <IconClose /> : <IconHamburger />}
          </button>
        </div>
      </div>

      {/* ══ MOBILE DRAWER ══ */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[280px] max-w-[85vw] bg-[var(--sidebar)] shadow-2xl flex flex-col transition-transform duration-300 ease-out border-r border-[var(--sidebar-border)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--sidebar-border)]">
          <Link href={ROUTES.dashboard} className="flex items-center gap-2">
            <span className="text-lg">🎬</span>
            <span className="text-sm font-bold text-[var(--color-bw-heading)]">Banlieuwood</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-[var(--color-bw-muted)]">
            <IconClose />
          </button>
        </div>
        <div className="px-4 py-3 border-b border-[var(--sidebar-border)]">
          <div className="text-body-sm font-bold text-[var(--color-bw-heading)]">{firstName || "Utilisateur"}</div>
          <div className="text-body-xs text-[var(--color-bw-muted)]">{role}</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive =
              item.href === ROUTES.dashboard ? pathname === ROUTES.dashboard : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full focus-visible:ring-2 focus-visible:ring-bw-primary/50 focus-visible:outline-none",
                  isActive
                    ? "bg-[var(--sidebar-accent)] text-[var(--color-bw-violet)]"
                    : "text-[var(--color-bw-muted)] hover:text-[var(--color-bw-heading)]",
                )}
              >
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-5 pt-3 border-t border-[var(--sidebar-border)]">
          <Link
            href={ROUTES.seanceNew}
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[var(--color-bw-violet)] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_12px_rgba(139,92,246,0.25)]"
          >
            <IconPlus />
            Nouvelle séance
          </Link>
        </div>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop top bar */}
        <header className="hidden lg:flex items-center justify-between h-14 px-6 border-b border-[var(--color-bw-border)] bg-[var(--color-bw-bg)]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Link href={ROUTES.dashboard} className="flex items-center gap-2">
              <span className="text-lg">🎬</span>
              <span className="text-sm font-bold text-[var(--color-bw-heading)]">Banlieuwood</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-[var(--color-bw-border)] bg-[var(--color-bw-surface-dim)]/40 px-3 py-1.5 text-sm text-[var(--color-bw-muted)] hover:bg-[var(--color-bw-surface-dim)] transition-colors"
            >
              <IconSearch size={14} />
              Rechercher...
              <kbd className="ml-4 text-xs bg-[var(--color-bw-surface-dim)] rounded px-1.5 py-0.5 border border-[var(--color-bw-border)]">
                ⌘K
              </kbd>
            </button>
            <FullscreenToggle />
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--sidebar)]/90 backdrop-blur-xl border-t border-[var(--sidebar-border)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-14">
          {visibleNavItems.slice(0, 4).map((item) => {
            const isActive =
              item.href === ROUTES.dashboard ? pathname === ROUTES.dashboard : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-bw-primary/50 focus-visible:outline-none",
                  isActive
                    ? "text-[var(--color-bw-violet)]"
                    : "text-[var(--color-bw-muted)] hover:text-[var(--color-bw-heading)]",
                )}
              >
                <span>{item.emoji}</span>
                <span className="text-body-xs font-medium">{item.label}</span>
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
