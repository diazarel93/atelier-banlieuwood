"use client";

import { motion, AnimatePresence } from "motion/react";

interface KeyboardShortcutsModalProps {
  showShortcuts: boolean;
  setShowShortcuts: (v: boolean) => void;
}

const SHORTCUTS = [
  { key: "Espace", action: "Pause / Reprendre" },
  { key: "N", action: "Action suivante" },
  { key: "F", action: "Mode focus" },
  { key: "B", action: "Message broadcast" },
  { key: "E", action: "Export de séance" },
  { key: "C", action: "Comparer 2 réponses" },
  { key: "T", action: "Timer (puis 1-5 pour presets)" },
  { key: "?", action: "Raccourcis clavier" },
  { key: "Échap", action: "Fermer la fiche élève / modal" },
];

export function KeyboardShortcutsModal({
  showShortcuts,
  setShowShortcuts,
}: KeyboardShortcutsModalProps) {
  return (
    <AnimatePresence>
      {showShortcuts && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowShortcuts(false)} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] max-w-[90vw] glass-card rounded-2xl border border-white/[0.08] p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 id="shortcuts-title" className="text-sm font-semibold">Raccourcis clavier</h3>
              <button onClick={() => setShowShortcuts(false)} aria-label="Fermer" className="text-bw-muted hover:text-white text-sm cursor-pointer">✕</button>
            </div>
            <div className="space-y-1.5">
              {SHORTCUTS.map(({ key, action }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-bw-text">{action}</span>
                  <kbd className="text-xs px-2 py-0.5 rounded bg-bw-elevated border border-white/[0.06] text-bw-muted font-mono">{key}</kbd>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
