"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const PRESETS = [
  { emoji: "⏰", label: "Temps", text: "Il reste 30 secondes !" },
  { emoji: "📝", label: "Justifier", text: "Pensez à justifier votre réponse" },
  { emoji: "👀", label: "Relire", text: "Relisez bien avant de valider" },
  { emoji: "🤫", label: "Silence", text: "Silence s'il vous plaît" },
  { emoji: "💪", label: "Courage", text: "N'hésitez pas, il n'y a pas de mauvaise réponse !" },
  { emoji: "🔔", label: "Répondez", text: "N'oubliez pas de répondre à la question !" },
];

interface BroadcastModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  isPending?: boolean;
  history?: { text: string; sentAt: Date }[];
}

export function BroadcastModal({ open, onClose, onSend, isPending, history }: BroadcastModalProps) {
  const [message, setMessage] = useState("");

  function handleSend(text: string) {
    if (!text.trim()) return;
    onSend(text.trim());
    setMessage("");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="broadcast-title"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[90vw] glass-card rounded-2xl border border-black/[0.06] overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-black/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">📢</span>
                <h3 id="broadcast-title" className="text-sm font-semibold">Message à toute la classe</h3>
              </div>
              <button onClick={onClose} aria-label="Fermer" className="text-bw-muted hover:text-bw-heading text-sm cursor-pointer">✕</button>
            </div>

            {/* Presets */}
            <div className="px-5 py-3 space-y-2">
              <p className="text-xs uppercase tracking-wider text-bw-muted font-semibold">Messages rapides</p>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleSend(preset.text)}
                    disabled={isPending}
                    className="text-left p-2 rounded-lg border border-black/[0.06] hover:border-bw-primary/30 hover:bg-bw-primary/5 cursor-pointer transition-colors duration-200 disabled:opacity-40"
                  >
                    <span className="text-sm block">{preset.emoji}</span>
                    <span className="text-xs text-bw-muted">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="mx-5 h-px bg-black/[0.04]" />

            {/* Custom message */}
            <div className="px-5 py-3 space-y-2">
              <p className="text-xs uppercase tracking-wider text-bw-muted font-semibold">Message personnalisé</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSend(message); }}
                  placeholder="Votre message..."
                  aria-label="Message personnalise"
                  maxLength={200}
                  className="flex-1 px-3 py-2 rounded-xl bg-bw-surface border border-black/[0.06] text-sm text-white placeholder:text-bw-muted outline-none focus:border-bw-primary/40"
                />
                <button
                  onClick={() => handleSend(message)}
                  disabled={isPending || !message.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 bg-bw-primary text-white"
                >
                  {isPending ? "..." : "Envoyer"}
                </button>
              </div>
              <p className="text-xs text-bw-muted text-right">{message.length}/200</p>
            </div>

            {/* History */}
            {history && history.length > 0 && (
              <div className="px-5 pb-4 space-y-2">
                <p className="text-xs uppercase tracking-wider text-bw-muted font-semibold">Historique</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {history.slice(0, 10).map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(item.text)}
                      disabled={isPending}
                      className="w-full text-left px-3 py-2 rounded-lg border border-black/[0.06] hover:border-bw-primary/30 hover:bg-bw-primary/5 cursor-pointer transition-colors duration-200 disabled:opacity-40 flex items-center gap-2"
                    >
                      <span className="text-xs text-bw-text truncate flex-1">{item.text}</span>
                      <span className="text-xs text-bw-muted flex-shrink-0">
                        {item.sentAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
