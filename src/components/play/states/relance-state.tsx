"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useTypewriter } from "@/hooks/use-typewriter";

export interface RelanceStateProps {
  relanceText: string;
  onSubmit: (text: string) => void;
  onSkip: () => void;
}

export function RelanceState({
  relanceText,
  onSubmit,
  onSkip,
}: RelanceStateProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { displayed, done, skip } = useTypewriter(relanceText, 40);
  const relanceTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus when typewriter finishes
  useEffect(() => {
    if (done && relanceTextareaRef.current) {
      relanceTextareaRef.current.focus({ preventScroll: true });
    }
  }, [done]);

  function handleRelanceChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  function handleSubmit() {
    if (!text.trim() || sending) return;
    setSending(true);
    onSubmit(text.trim());
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-5 w-full"
    >
      {/* Mentor avatar + label */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-bw-teal/20 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 13c0-3.87-3.13-7-7-7s-7 3.13-7 7c0 2.06.89 3.92 2.3 5.2L5 21h14l-2.3-2.8A6.97 6.97 0 0 0 19 13Z" />
          </svg>
        </div>
        <span className="text-sm font-medium text-bw-teal">Le mentor rebondit...</span>
      </div>

      {/* Relance with typewriter */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Cliquer pour accelerer le texte du mentor"
        className="glass-card border-bw-teal/20 p-3 sm:p-5 min-h-[60px] sm:min-h-[80px] text-base sm:text-lg leading-relaxed cursor-pointer"
        onClick={() => !done && skip()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); !done && skip(); } }}
      >
        <p className="text-bw-heading">{displayed}</p>
        {!done && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="inline-block w-0.5 h-5 bg-bw-teal ml-0.5 align-text-bottom"
          />
        )}
      </div>

      {/* Response area (optional) */}
      {done && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <textarea
            ref={relanceTextareaRef}
            value={text}
            onChange={handleRelanceChange}
            placeholder="Ta reponse (optionnel)..."
            aria-label="Reponse au rebond (optionnel)"
            rows={2}
            maxLength={500}
            className="w-full bw-script bg-bw-elevated border border-white/[0.06] rounded-xl p-4 text-bw-heading placeholder:text-bw-muted focus:border-bw-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-teal/40 transition-colors resize-none overflow-hidden"
          />

          <div className="flex justify-between items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onSkip}
              className="px-6 py-3 rounded-xl font-medium text-bw-muted hover:text-white transition-colors cursor-pointer"
            >
              Passer
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!text.trim() || sending}
              className={`btn-glow px-8 py-3 rounded-xl font-semibold transition-all ${
                text.trim() && !sending
                  ? "bg-bw-teal text-bw-bg cursor-pointer"
                  : "bg-bw-elevated text-bw-muted cursor-not-allowed"
              }`}
            >
              {sending ? "Envoi..." : "Repondre"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
