"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCockpitActions } from "@/components/pilot/cockpit-context";

interface CommandAction {
  id: string;
  label: string;
  icon: string;
  category: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  sessionOn: boolean;
  onToggleSession: () => void;
  onEndSession: () => void;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
  onOpenStudents: () => void;
  onOpenModules: () => void;
  onSelectModule?: (moduleIndex: number) => void;
}

export function CommandPalette({
  open,
  onClose,
  sessionOn,
  onToggleSession,
  onEndSession,
  onToggleDarkMode,
  isDarkMode,
  onOpenStudents,
  onOpenModules,
  onSelectModule,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateSession } = useCockpitActions();

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
      }
      if (e.key === "Escape" && open) onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const actions = useMemo<CommandAction[]>(() => {
    const list: CommandAction[] = [
      {
        id: "pause",
        label: sessionOn ? "Pause session" : "Reprendre session",
        icon: sessionOn ? "⏸️" : "▶️",
        category: "Session",
        action: onToggleSession,
      },
      { id: "end", label: "Terminer la seance", icon: "🏁", category: "Session", action: onEndSession },
      {
        id: "vote-open",
        label: "Lancer le vote",
        icon: "🗳️",
        category: "Session",
        action: () => updateSession.mutate({ status: "voting", timer_ends_at: null }),
      },
      {
        id: "review",
        label: "Voir les resultats",
        icon: "📊",
        category: "Session",
        action: () => updateSession.mutate({ status: "reviewing", timer_ends_at: null }),
      },
      { id: "students", label: "Voir les eleves", icon: "👥", category: "Navigation", action: onOpenStudents },
      { id: "modules", label: "Changer de module", icon: "📚", category: "Navigation", action: onOpenModules },
      {
        id: "theme",
        label: isDarkMode ? "Mode clair" : "Mode sombre",
        icon: isDarkMode ? "☀️" : "🌙",
        category: "Interface",
        action: onToggleDarkMode,
      },
    ];

    if (onSelectModule) {
      const moduleActions: CommandAction[] = [
        { id: "m1", label: "M1 — Le Regard", icon: "👁️", category: "Module", action: () => onSelectModule(0) },
        { id: "m2", label: "M3 — Generer l'idee", icon: "✨", category: "Module", action: () => onSelectModule(2) },
        { id: "m3", label: "M4 — Le Pitch", icon: "🎤", category: "Module", action: () => onSelectModule(3) },
        { id: "m4", label: "M5 — Le Recit", icon: "🗳️", category: "Module", action: () => onSelectModule(4) },
        { id: "m5", label: "M6 — Le Scenario", icon: "✏️", category: "Module", action: () => onSelectModule(5) },
        { id: "m6", label: "M7 — La Mise en scene", icon: "🎥", category: "Module", action: () => onSelectModule(6) },
        { id: "m7", label: "M8 — L'Equipe", icon: "🎭", category: "Module", action: () => onSelectModule(7) },
      ];
      list.push(...moduleActions);
    }

    return list;
  }, [
    sessionOn,
    isDarkMode,
    onToggleSession,
    onEndSession,
    onToggleDarkMode,
    onOpenStudents,
    onOpenModules,
    onSelectModule,
    updateSession,
  ]);

  const filtered = useMemo(() => {
    if (!query.trim()) return actions;
    const q = query.toLowerCase();
    return actions.filter((a) => a.label.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
  }, [query, actions]);

  const handleSelect = useCallback(
    (action: CommandAction) => {
      action.action();
      onClose();
    },
    [onClose],
  );

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9996] flex items-start justify-center pt-[100px] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-[540px] bg-bw-bg border border-[var(--color-bw-border)] rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-bw-border)]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-bw-muted shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Commande..."
              className="flex-1 bg-transparent border-none text-bw-heading text-[15px] font-medium placeholder:text-bw-muted/50 outline-none"
            />
            <kbd className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-[var(--color-bw-surface-dim)] text-bw-muted border border-[var(--color-bw-border)]">
              ESC
            </kbd>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-1.5">
            {filtered.length === 0 && (
              <div className="py-8 text-center text-sm text-bw-muted">Aucune commande trouvee</div>
            )}
            {filtered.map((action, i) => (
              <button
                key={action.id}
                onClick={() => handleSelect(action)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  i === 0 ? "bg-bw-primary/5" : "hover:bg-[var(--color-bw-surface-dim)]"
                }`}
              >
                <span className="text-lg w-7 text-center shrink-0">{action.icon}</span>
                <span className="flex-1 text-sm font-medium text-bw-heading">{action.label}</span>
                <span className="text-[10px] text-bw-muted font-medium">{action.category}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
