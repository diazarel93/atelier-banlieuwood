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
          Carnet d&apos;idées
        </span>
        {module1.question && (
          <p className="text-sm text-bw-muted">{module1.question.text}</p>
        )}
      </div>

      {/* Large textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Note tes idées ici... Tout ce qui te vient en tête."
        rows={8}
        maxLength={2000}
        className="w-full bw-script bg-bw-elevated border border-white/[0.06] rounded-xl p-4 text-bw-heading placeholder:text-bw-muted focus:border-bw-violet focus:outline-none transition-colors resize-none flex-1"
        autoFocus
      />

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
