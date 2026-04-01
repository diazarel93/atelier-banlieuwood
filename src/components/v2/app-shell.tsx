"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { BreadcrumbV2 } from "./breadcrumb";
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
  IconPlus,
  IconSearch,
  IconHamburger,
  IconClose,
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

const PAGE_LABELS: Array<{ prefix: string; label: string }> = [
  { prefix: "/v2/seances/new", label: "Nouvelle séance" },
  { prefix: "/v2/seances", label: "Séances" },
  { prefix: "/v2/bibliotheque", label: "Bibliothèque" },
  { prefix: "/v2/settings", label: "Réglages" },
  { prefix: "/v2/aide", label: "Aide" },
  { prefix: "/v2/eleves", label: "Élèves" },
  { prefix: "/v2/statistiques", label: "Statistiques" },
  { prefix: "/v2/fiche-cours", label: "Fiche de cours" },
];

function getPageBreadcrumb(pathname: string) {
  const pageLabel =
    pathname === ROUTES.dashboard
      ? "Tableau de bord"
      : (PAGE_LABELS.find((p) => pathname.startsWith(p.prefix))?.label ?? "");
  return [{ label: "🎬 Banlieuwood", href: ROUTES.dashboard }, { label: pageLabel }];
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
  const isProfesseur = authUser?.role === "professeur";

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
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:rounded-lg focus:bg-[var(--color-bw-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Aller au contenu principal
      </a>

      {/* ══ SIDEBAR — Desktop ══ */}
      <aside className="hidden lg:flex w-[220px] flex-col bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] sticky top-0 h-dvh overflow-y-auto flex-shrink-0">
        {/* Logo + User info */}
        <div className="px-4 py-4 border-b border-[var(--sidebar-border)]">
          <Link href={ROUTES.dashboard} className="flex items-center gap-2.5 mb-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-bw-primary)] to-[var(--color-bw-gold)] flex items-center justify-center text-white text-body-xs font-bold shadow-[0_0_12px_rgba(255,107,53,0.4)] group-hover:shadow-[0_0_20px_rgba(255,107,53,0.6)] transition-shadow duration-200">
              BW
            </div>
            <span className="text-body-sm font-extrabold text-[var(--sidebar-foreground)]">Banlieuwood</span>
          </Link>
          <div className="text-body-sm font-medium text-[var(--sidebar-foreground)]">{firstName || "Utilisateur"}</div>
          <div className="text-body-xs text-[var(--sidebar-muted-foreground)]">{role}</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {visibleNavItems.map((item) => {
            const isActive =
              item.href === ROUTES.dashboard ? pathname === ROUTES.dashboard : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-sm,10px)] text-body-sm font-medium transition-all duration-200 w-full focus-visible:ring-2 focus-visible:ring-[var(--sidebar-primary)]/50 focus-visible:outline-none",
                  isActive
                    ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-semibold"
                    : "text-[var(--sidebar-muted-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)]",
                )}
              >
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}

          {/* Create session CTA — intervenants only */}
          {!isProfesseur && (
            <Link
              href={ROUTES.seanceNew}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-sm,10px)] text-body-sm font-bold text-white bg-gradient-to-r from-[var(--color-bw-primary)] to-[var(--color-bw-gold)] shadow-[0_0_16px_rgba(255,107,53,0.3)] hover:shadow-[0_0_24px_rgba(255,107,53,0.5)] transition-all duration-200 mt-3"
            >
              <IconPlus />
              Nouvelle séance
            </Link>
          )}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 pb-4 space-y-1.5 border-t border-[var(--sidebar-border)] pt-3">
          {isAdmin && (
            <Link
              href={ROUTES.admin}
              className={cn(
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-sm,10px)] text-body-sm font-medium transition-all duration-200 w-full focus-visible:ring-2 focus-visible:ring-[var(--sidebar-primary)]/50 focus-visible:outline-none",
                pathname.startsWith("/v2/admin")
                  ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)]"
                  : "text-[var(--sidebar-muted-foreground)] hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
              )}
            >
              <span className="text-base">🛡️</span>
              Admin
            </Link>
          )}
          <Link
            href={ROUTES.settings}
            className={cn(
              "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-sm,10px)] text-body-sm font-medium transition-all duration-200 w-full focus-visible:ring-2 focus-visible:ring-[var(--sidebar-primary)]/50 focus-visible:outline-none",
              pathname.startsWith("/v2/settings")
                ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)]"
                : "text-[var(--sidebar-muted-foreground)] hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
            )}
          >
            <span className="text-base">⚙️</span>
            Paramètres
          </Link>
          <Link
            href={ROUTES.aide}
            className={cn(
              "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-sm,10px)] text-body-sm font-medium transition-all duration-200 w-full focus-visible:ring-2 focus-visible:ring-[var(--sidebar-primary)]/50 focus-visible:outline-none",
              pathname.startsWith("/v2/aide")
                ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)]"
                : "text-[var(--sidebar-muted-foreground)] hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
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
          <span className="text-sm font-bold text-[var(--sidebar-foreground)]">Banlieuwood</span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--sidebar-muted-foreground)] hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
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
          "lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[280px] max-w-[85vw] bg-[var(--sidebar)] glass-shadow-elevated flex flex-col transition-transform duration-300 ease-out border-r border-[var(--sidebar-border)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--sidebar-border)]">
          <Link href={ROUTES.dashboard} className="flex items-center gap-2">
            <span className="text-lg">🎬</span>
            <span className="text-sm font-bold text-[var(--sidebar-foreground)]">Banlieuwood</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--sidebar-muted-foreground)]"
          >
            <IconClose />
          </button>
        </div>
        <div className="px-4 py-3 border-b border-[var(--sidebar-border)]">
          <div className="text-body-sm font-bold text-[var(--sidebar-foreground)]">{firstName || "Utilisateur"}</div>
          <div className="text-body-xs text-[var(--sidebar-muted-foreground)]">{role}</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive =
              item.href === ROUTES.dashboard ? pathname === ROUTES.dashboard : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full focus-visible:ring-2 focus-visible:ring-[var(--sidebar-primary)]/50 focus-visible:outline-none",
                  isActive
                    ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)]"
                    : "text-[var(--sidebar-muted-foreground)] hover:text-[var(--sidebar-foreground)]",
                )}
              >
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        {!isProfesseur && (
          <div className="px-3 pb-5 pt-3 border-t border-[var(--sidebar-border)]">
            <Link
              href={ROUTES.seanceNew}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-[var(--color-bw-primary)] to-[var(--color-bw-gold)] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_16px_rgba(255,107,53,0.3)]"
            >
              <IconPlus />
              Nouvelle séance
            </Link>
          </div>
        )}
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop top bar */}
        <header className="hidden lg:flex items-center justify-between h-14 px-6 border-b border-[var(--color-bw-border)] bg-[var(--color-bw-surface-dim)]/60 backdrop-blur-xl sticky top-0 z-30">
          {/* Left: Breadcrumb */}
          <BreadcrumbV2 items={getPageBreadcrumb(pathname)} />
          {/* Right: Search + Actions + Avatar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-[var(--color-bw-border)] bg-[var(--color-bw-surface-dim)]/40 px-3 py-1.5 text-body-sm text-[var(--color-bw-muted)] hover:bg-[var(--color-bw-surface-dim)] hover:border-[var(--color-bw-border-accent)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-bw-primary/50 focus-visible:outline-none"
            >
              <IconSearch size={14} />
              Rechercher...
              <kbd className="ml-4 text-body-xs bg-[var(--color-bw-surface-dim)] rounded px-1.5 py-0.5 border border-[var(--color-bw-border)]">
                ⌘K
              </kbd>
            </button>
            <FullscreenToggle />
            <NotificationBell />
            {/* Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--color-bw-border)]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-bw-primary)] to-[var(--color-bw-gold)] flex items-center justify-center text-white text-body-xs font-bold shadow-[0_0_10px_rgba(255,107,53,0.3)]">
                {firstName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="text-body-sm font-medium text-[var(--color-bw-heading)] hidden xl:inline">
                {firstName}
              </span>
            </div>
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
                  "flex flex-col items-center justify-center gap-0.5 px-3 min-h-[44px] rounded-lg transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-bw-primary/50 focus-visible:outline-none",
                  isActive
                    ? "text-[var(--sidebar-primary)]"
                    : "text-[var(--sidebar-muted-foreground)] hover:text-[var(--sidebar-foreground)]",
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
