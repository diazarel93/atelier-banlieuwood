"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import { useTypewriter } from "@/hooks/use-typewriter";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import type { SessionState } from "@/hooks/use-session-polling";

export interface SituationStateProps {
  situation: NonNullable<SessionState["situation"]>;
  onSubmit: (text: string) => void;
  submitting: boolean;
}

export function SituationState({
  situation,
  onSubmit,
  submitting,
}: SituationStateProps) {
  const [text, setText] = useState("");
  const { displayed, done, skip } = useTypewriter(situation.prompt);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Word count
  const wordCount = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [text]);

  // Category color
  const catColor = CATEGORY_COLORS[situation.category] || "#FF6B35";
  const catLabel = CATEGORY_LABELS[situation.category] || situation.category;

  // Auto-focus when typewriter finishes
  useEffect(() => {
    if (done && textareaRef.current) {
      textareaRef.current.focus({ preventScroll: true });
    }
  }, [done]);

  // Auto-resize textarea
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  function handleSubmit() {
    if (!text.trim() || submitting) return;
    onSubmit(text.trim());
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-5 w-full"
    >
      {/* Category badge + restitution label */}
      {(situation.category || situation.restitutionLabel) && (
        <div className="flex items-center gap-2 flex-wrap">
          {situation.category && (
            <span
              className="text-xs font-bold uppercase px-2.5 py-1 rounded-full tracking-wider"
              style={{ background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}30` }}
            >
              {catLabel}
            </span>
          )}
          {situation.restitutionLabel && (
            <span className="text-xs text-bw-muted italic">{situation.restitutionLabel}</span>
          )}
        </div>
      )}

      {/* Prompt with typewriter */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Cliquer pour accelerer le texte"
        className="rounded-xl p-3 sm:p-5 min-h-[80px] sm:min-h-[120px] text-base sm:text-lg leading-relaxed cursor-pointer border border-white/[0.06]"
        style={{ background: `linear-gradient(135deg, ${catColor}08, rgba(26,26,26,0.8))` }}
        onClick={() => !done && skip()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); !done && skip(); } }}
      >
        <p>{displayed}</p>
        {!done && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="inline-block w-0.5 h-5 bg-bw-primary ml-0.5 align-text-bottom"
          />
        )}
      </div>

      {/* Text input area */}
      <div className="space-y-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="Ecris ta reponse ici..."
          aria-label="Reponse a la situation"
          rows={2}
          maxLength={500}
          className="w-full bw-script bg-bw-elevated border border-white/[0.06] rounded-xl p-4 text-bw-heading placeholder:text-bw-muted focus:border-bw-primary focus:outline-none transition-colors resize-none overflow-hidden"
        />

        {/* Character progress bar */}
        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            animate={{
              width: `${(text.length / 500) * 100}%`,
              backgroundColor: text.length >= 480 ? "#EF4444" : text.length >= 400 ? "#F59E0B" : catColor,
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className={`text-xs transition-colors ${
              text.length >= 480 ? "text-bw-danger" : text.length >= 400 ? "text-bw-amber" : "text-bw-muted"
            }`}>
              {text.length}/500
            </span>
            <span className="text-xs text-bw-muted tabular-nums">
              {wordCount} mot{wordCount > 1 ? "s" : ""}
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={text.trim() && !submitting ? { scale: 1.03 } : undefined}
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
            className={`btn-glow px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl font-bold transition-all ${
              text.trim() && !submitting
                ? "text-white cursor-pointer shadow-lg"
                : "bg-bw-elevated text-bw-muted cursor-not-allowed"
            }`}
            style={text.trim() && !submitting ? { background: "linear-gradient(135deg, #FF6B35, #D4A843)", boxShadow: "0 4px 15px rgba(255,107,53,0.3)" } : undefined}
          >
            {submitting ? "Envoi..." : "Envoyer"}
          </motion.button>
        </div>
      </div>

      {/* Nudge */}
      {situation.nudgeText && done && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="glass-card border-bw-teal/20 px-4 py-3 flex items-start gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" className="mt-0.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          <p className="text-sm text-bw-teal italic">{situation.nudgeText}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
