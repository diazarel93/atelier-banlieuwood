"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import type { Module1Data } from "@/hooks/use-session-polling";

export interface NotebookStateProps {
  module1: Module1Data;
  sessionId: string;
  studentId: string;
  onAnswered: () => void;
}

export function NotebookState({
  module1,
  sessionId,
  studentId,
  onAnswered,
}: NotebookStateProps) {
  const [text, setText] = useState(module1.existingText || "");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(module1.existingText ? "Chargé" : null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save with debounce
  useEffect(() => {
    if (!module1.question?.situationId || !text.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const res = await fetch(`/api/sessions/${sessionId}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            situationId: module1.question!.situationId,
            text: text.trim(),
          }),
        });
        if (res.ok) {
          setLastSaved(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
          onAnswered();
        }
      } catch {
        // Silent fail for auto-save
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col gap-4 w-full h-full">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-bw-violet/20 text-bw-violet">
          Carnet d&apos;observation
        </span>
        <div className="flex items-center gap-2 text-bw-violet">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <span className="text-sm font-medium">Mission d&apos;observation</span>
        </div>
        {module1.question && (
          <p className="text-sm text-bw-muted">{module1.question.text}</p>
        )}
      </div>

      {/* Large textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Observe le monde autour de toi. Note un détail, une scène, un son qui pourrait devenir le début d'un film."
        rows={8}
        maxLength={2000}
        className="w-full bw-script bg-bw-elevated border border-white/[0.06] rounded-xl p-4 text-bw-heading placeholder:text-bw-muted focus:border-bw-violet focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-violet/40 transition-colors resize-none flex-1"
        autoFocus
      />

      {/* Adrian's suggestions: things to observe */}
      <div className="space-y-2">
        <p className="text-xs text-bw-muted">Tu peux noter par exemple :</p>
        <div className="flex flex-wrap gap-2">
          {(module1.suggestions || ["une dispute", "un moment gênant", "un moment drôle", "une injustice"]).map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-bw-violet/10 text-bw-violet/70 border border-bw-violet/20">
              {s}
            </span>
          ))}
        </div>
        {module1.encouragement && (
          <p className="text-xs text-bw-violet/80 italic mt-1">{module1.encouragement}</p>
        )}
      </div>

      {/* Footer with char count and save status */}
      <div className="flex justify-between items-center text-xs">
        <span className="text-bw-muted">{text.length}/2000 caractères</span>
        <span className={saving ? "text-bw-amber" : lastSaved ? "text-bw-teal" : "text-bw-muted"}>
          {saving ? "Sauvegarde..." : lastSaved ? `Sauvegardé à ${lastSaved}` : ""}
        </span>
      </div>
    </motion.div>
  );
}
