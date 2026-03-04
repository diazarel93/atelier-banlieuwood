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
}

export function BroadcastModal({ open, onClose, onSend, isPending }: BroadcastModalProps) {
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
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[90vw] glass-card rounded-2xl border border-white/[0.08] overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📢</span>
                <h3 className="text-sm font-semibold">Message à toute la classe</h3>
              </div>
              <button onClick={onClose} className="text-bw-muted hover:text-white text-sm cursor-pointer">✕</button>
            </div>

            {/* Presets */}
            <div className="px-5 py-3 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-bw-muted font-semibold">Messages rapides</p>
              <div className="grid grid-cols-3 gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleSend(preset.text)}
                    disabled={isPending}
                    className="text-left p-2 rounded-lg border border-white/[0.06] hover:border-bw-primary/30 hover:bg-bw-primary/5 cursor-pointer transition-colors duration-200 disabled:opacity-40"
                  >
                    <span className="text-sm block">{preset.emoji}</span>
                    <span className="text-[10px] text-bw-muted">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom message */}
            <div className="px-5 pb-4 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-bw-muted font-semibold">Message personnalisé</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSend(message); }}
                  placeholder="Votre message..."
                  maxLength={200}
                  className="flex-1 px-3 py-2 rounded-xl bg-bw-surface border border-white/[0.06] text-sm text-white placeholder:text-bw-muted outline-none focus:border-bw-primary/40"
                />
                <button
                  onClick={() => handleSend(message)}
                  disabled={isPending || !message.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#FF6B35", color: "white" }}
                >
                  {isPending ? "..." : "Envoyer"}
                </button>
              </div>
              <p className="text-[10px] text-bw-muted text-right">{message.length}/200</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
