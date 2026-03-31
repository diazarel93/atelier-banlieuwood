"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
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
  IconSettings,
} from "./icons";

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
  shortcut?: string;
  section?: "nav" | "session" | "student";
}

const NAV_COMMANDS: Command[] = [
  { id: "dashboard", label: "Dashboard", href: ROUTES.dashboard, icon: <IconDashboard size={16} />, section: "nav" },
  { id: "seances", label: "Séances", href: ROUTES.seances, icon: <IconSeances size={16} />, section: "nav" },
  { id: "new-seance", label: "Nouvelle séance", href: ROUTES.seanceNew, icon: <IconPlus size={16} />, section: "nav" },
  { id: "eleves", label: "Élèves", href: ROUTES.eleves, icon: <IconEleves size={16} />, section: "nav" },
  {
    id: "statistiques",
    label: "Statistiques",
    href: ROUTES.statistiques,
    icon: <IconStatistiques size={16} />,
    section: "nav",
  },
  { id: "modules", label: "Modules", href: ROUTES.bibliotheque, icon: <IconModules size={16} />, section: "nav" },
  {
    id: "fiche-cours",
    label: "Fiche de cours",
    href: ROUTES.ficheCours,
    icon: <IconFicheCours size={16} />,
    section: "nav",
  },
  { id: "admin", label: "Administration", href: ROUTES.admin, icon: <IconAdmin size={16} />, section: "nav" },
  { id: "settings", label: "Reglages", href: ROUTES.settings, icon: <IconSettings size={16} />, section: "nav" },
];

interface SearchResult {
  sessions: { id: string; title: string; status: string; classLabel: string | null }[];
  students: { id: string; displayName: string; avatar: string | null }[];
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dynamicResults, setDynamicResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const router = useRouter();

  // Static command filtering
  const filteredNav = query
    ? NAV_COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : NAV_COMMANDS;

  // Build dynamic commands from search results
  const dynamicCommands: Command[] = [];
  if (dynamicResults && query.length >= 2) {
    for (const s of dynamicResults.sessions) {
      dynamicCommands.push({
        id: `session-${s.id}`,
        label: s.title,
        href: `${ROUTES.seances}/${s.id}`,
        icon: <IconSeances size={16} />,
        section: "session",
      });
    }
    for (const st of dynamicResults.students) {
      dynamicCommands.push({
        id: `student-${st.id}`,
        label: st.displayName,
        href: `${ROUTES.eleves}?q=${encodeURIComponent(st.displayName)}`,
        icon: <IconEleves size={16} />,
        section: "student",
      });
    }
  }

  const allResults = [...filteredNav, ...dynamicCommands];

  const activeDescendant = allResults.length > 0 ? `cmd-option-${allResults[selectedIndex]?.id}` : undefined;

  const execute = useCallback(
    (cmd: Command) => {
      onOpenChange(false);
      setQuery("");
      setDynamicResults(null);
      if (cmd.href) router.push(cmd.href);
      else if (cmd.action) cmd.action();
    },
    [onOpenChange, router],
  );

  // Debounced dynamic search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setDynamicResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v2/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data: SearchResult = await res.json();
          setDynamicResults(data);
        }
      } catch {
        // Silently fail — static results still work
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Reset selection on filter change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, dynamicResults]);

  // Focus input + lock body scroll when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setDynamicResults(null);
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Keyboard navigation inside the palette
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (allResults.length > 0) setSelectedIndex((i) => (i + 1) % allResults.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (allResults.length > 0) setSelectedIndex((i) => (i - 1 + allResults.length) % allResults.length);
      } else if (e.key === "Enter" && allResults.length > 0) {
        e.preventDefault();
        execute(allResults[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, allResults, selectedIndex, execute, onOpenChange]);

  // Focus trap — keep Tab within the palette
  useEffect(() => {
    if (!open) return;

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab" || !paletteRef.current) return;
      const focusable = paletteRef.current.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [open]);

  if (!open) return null;

  // Group results by section for display
  const navResults = allResults.filter((c) => c.section === "nav" || !c.section);
  const sessionResults = allResults.filter((c) => c.section === "session");
  const studentResults = allResults.filter((c) => c.section === "student");

  function renderItem(cmd: Command, globalIndex: number) {
    return (
      <button
        key={cmd.id}
        id={`cmd-option-${cmd.id}`}
        type="button"
        role="option"
        aria-selected={globalIndex === selectedIndex}
        onClick={() => execute(cmd)}
        className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
          globalIndex === selectedIndex
            ? "bg-bw-primary/10 text-bw-heading"
            : "text-bw-muted hover:bg-[var(--color-bw-surface-dim)] hover:text-bw-heading"
        }`}
      >
        <span className={globalIndex === selectedIndex ? "text-bw-primary" : ""}>{cmd.icon}</span>
        <span className="flex-1 text-left font-medium">{cmd.label}</span>
        {cmd.shortcut && (
          <kbd className="text-[10px] text-bw-muted bg-[var(--color-bw-surface-dim)] rounded px-1.5 py-0.5 border border-[var(--color-bw-border)]">
            {cmd.shortcut}
          </kbd>
        )}
      </button>
    );
  }

  // Compute global index offset for each section
  let offset = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Palette de commandes"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Palette */}
      <div
        ref={paletteRef}
        className="relative w-full max-w-lg mx-4 rounded-2xl bg-card glass-shadow-elevated border border-[var(--color-bw-border)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input — ARIA combobox */}
        <div className="flex items-center gap-3 px-4 border-b border-[var(--color-bw-border)]">
          <IconSearch size={16} className="text-bw-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher pages, séances, élèves..."
            className="flex-1 h-12 text-sm bg-transparent outline-none placeholder:text-bw-muted text-bw-heading"
            role="combobox"
            aria-expanded="true"
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-controls="cmd-listbox"
            aria-activedescendant={activeDescendant}
            aria-label="Rechercher"
          />
          {isSearching && (
            <div className="h-4 w-4 rounded-full border-2 border-bw-muted/30 border-t-bw-primary animate-spin" />
          )}
          <kbd className="text-[10px] font-medium text-bw-muted bg-[var(--color-bw-surface-dim)] rounded px-1.5 py-0.5 border border-[var(--color-bw-border)]">
            ESC
          </kbd>
        </div>

        {/* Results list — ARIA listbox */}
        <div id="cmd-listbox" role="listbox" aria-label="Résultats" className="max-h-80 overflow-y-auto py-2">
          {allResults.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-bw-muted" role="status">
              Aucun résultat
            </p>
          ) : (
            <>
              {/* Navigation section */}
              {navResults.length > 0 && (
                <>
                  {query && (
                    <p className="px-4 pt-1 pb-1 label-caps text-bw-muted">
                      Navigation
                    </p>
                  )}
                  {navResults.map((cmd) => {
                    const idx = offset++;
                    return renderItem(cmd, idx);
                  })}
                </>
              )}

              {/* Sessions section */}
              {sessionResults.length > 0 && (
                <>
                  <p className="px-4 pt-3 pb-1 label-caps text-bw-muted">
                    Séances
                  </p>
                  {sessionResults.map((cmd) => {
                    const idx = offset++;
                    return renderItem(cmd, idx);
                  })}
                </>
              )}

              {/* Students section */}
              {studentResults.length > 0 && (
                <>
                  <p className="px-4 pt-3 pb-1 label-caps text-bw-muted">
                    Élèves
                  </p>
                  {studentResults.map((cmd) => {
                    const idx = offset++;
                    return renderItem(cmd, idx);
                  })}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
