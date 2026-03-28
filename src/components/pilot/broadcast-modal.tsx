"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DEFAULT_BROADCAST_PRESETS, BROADCAST_MAX_CHARS } from "./pilot-settings";

const LS_KEY = "bw-broadcast-presets";

type Preset = { emoji: string; label: string; text: string };

function loadPresets(): Preset[] {
  if (typeof window === "undefined") return [...DEFAULT_BROADCAST_PRESETS];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...DEFAULT_BROADCAST_PRESETS];
}

function savePresets(presets: Preset[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(presets));
  } catch {}
}

interface BroadcastModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  isPending?: boolean;
  history?: { text: string; sentAt: Date }[];
  /** Pre-fill the message input with this text */
  prefill?: string;
  /** Custom title for the modal header */
  title?: string;
  /** Custom icon for the modal header */
  icon?: string;
}

export function BroadcastModal({
  open,
  onClose,
  onSend,
  isPending,
  history,
  prefill,
  title,
  icon,
}: BroadcastModalProps) {
  const [message, setMessage] = useState("");
  const [presets, setPresets] = useState<Preset[]>(loadPresets);
  const [editMode, setEditMode] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editEmoji, setEditEmoji] = useState("");

  // Sync on open + apply prefill
  useEffect(() => {
    if (open) {
      setPresets(loadPresets());
      setEditMode(false);
      setMessage(prefill || "");
    }
  }, [open, prefill]);

  const startEdit = useCallback(
    (idx: number) => {
      const p = presets[idx];
      setEditIdx(idx);
      setEditEmoji(p.emoji);
      setEditLabel(p.label);
      setEditText(p.text);
    },
    [presets],
  );

  const saveEdit = useCallback(() => {
    if (editIdx === null || !editText.trim()) return;
    const updated = [...presets];
    updated[editIdx] = { emoji: editEmoji || "💬", label: editLabel || "Custom", text: editText.trim() };
    setPresets(updated);
    savePresets(updated);
    setEditIdx(null);
  }, [editIdx, editEmoji, editLabel, editText, presets]);

  const resetPresets = useCallback(() => {
    const defaults = [...DEFAULT_BROADCAST_PRESETS] as unknown as Preset[];
    setPresets(defaults);
    savePresets(defaults);
    setEditMode(false);
  }, []);

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                <span className="text-lg" aria-hidden="true">
                  {icon || "📢"}
                </span>
                <h3 id="broadcast-title" className="text-sm font-semibold">
                  {title || "Message à toute la classe"}
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="text-bw-muted hover:text-bw-heading text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Presets */}
            <div className="px-5 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-bw-muted font-semibold">Messages rapides</p>
                <div className="flex gap-1.5">
                  {editMode && (
                    <button
                      onClick={resetPresets}
                      className="text-[10px] text-bw-muted hover:text-red-400 cursor-pointer transition-colors"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditMode(!editMode);
                      setEditIdx(null);
                    }}
                    className="text-[10px] text-bw-muted hover:text-bw-heading cursor-pointer transition-colors"
                  >
                    {editMode ? "OK" : "Editer"}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {presets.map((preset, idx) =>
                  editMode && editIdx === idx ? (
                    <div key={idx} className="p-2 rounded-lg border border-bw-primary/30 bg-bw-primary/5 space-y-1">
                      <div className="flex gap-1">
                        <input
                          value={editEmoji}
                          onChange={(e) => setEditEmoji(e.target.value.slice(0, 2))}
                          className="w-8 text-sm bg-transparent border-b border-bw-muted/30 outline-none text-center"
                        />
                        <input
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value.slice(0, 12))}
                          className="flex-1 text-xs bg-transparent border-b border-bw-muted/30 outline-none text-bw-muted"
                          placeholder="Label"
                        />
                      </div>
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value.slice(0, BROADCAST_MAX_CHARS))}
                        className="w-full text-[10px] bg-transparent border-b border-bw-muted/30 outline-none text-bw-text"
                        placeholder="Message..."
                      />
                      <button onClick={saveEdit} className="text-[10px] font-semibold text-bw-primary cursor-pointer">
                        Sauver
                      </button>
                    </div>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => (editMode ? startEdit(idx) : handleSend(preset.text))}
                      disabled={!editMode && isPending}
                      className={`text-left p-2 rounded-lg border border-black/[0.06] hover:border-bw-primary/30 hover:bg-bw-primary/5 cursor-pointer transition-colors duration-200 disabled:opacity-40 ${editMode ? "ring-1 ring-dashed ring-bw-muted/20" : ""}`}
                    >
                      <span className="text-sm block">{preset.emoji}</span>
                      <span className="text-xs text-bw-muted">{preset.label}</span>
                      {editMode && (
                        <span className="text-[9px] text-bw-muted/50 block mt-0.5">cliquer pour editer</span>
                      )}
                    </button>
                  ),
                )}
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
                  onChange={(e) => setMessage(e.target.value.slice(0, BROADCAST_MAX_CHARS))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend(message);
                  }}
                  placeholder="Votre message..."
                  aria-label="Message personnalise"
                  maxLength={BROADCAST_MAX_CHARS}
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
              <p className="text-xs text-bw-muted text-right">
                {message.length}/{BROADCAST_MAX_CHARS}
              </p>
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
