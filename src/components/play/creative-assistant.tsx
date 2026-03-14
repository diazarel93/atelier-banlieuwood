"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ── Types ── */

type CreativeMode = "dialogue" | "scene" | "critique";

interface CreativeAssistantProps {
  sessionId: string;
  studentId: string;
  /** Optional context from the student's current work */
  context?: string;
}

interface AIResult {
  text: string;
  mode: CreativeMode;
}

const MODES: { id: CreativeMode; emoji: string; label: string; description: string }[] = [
  {
    id: "dialogue",
    emoji: "\uD83D\uDCAC",
    label: "Dialogue",
    description: "Aide-moi à écrire un dialogue entre mes personnages",
  },
  {
    id: "scene",
    emoji: "\uD83C\uDFAC",
    label: "Scène",
    description: "Décris une scène comme dans un vrai scénario",
  },
  {
    id: "critique",
    emoji: "\uD83C\uDFAF",
    label: "Retour",
    description: "Donne-moi un retour constructif sur mon idée",
  },
];

/* ── Component ── */

export function CreativeAssistant({ sessionId, studentId, context }: CreativeAssistantProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CreativeMode | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [usesLeft, setUsesLeft] = useState(5);

  const handleSubmit = useCallback(async () => {
    if (!mode || !input.trim() || loading || usesLeft <= 0) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/creative`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          mode,
          input: input.trim(),
          context: context || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur");
      }

      const data = await res.json();
      setResult({ text: data.text, mode });
      setUsesLeft(data.remaining ?? usesLeft - 1);
    } catch {
      setResult({ text: "Oups, le mentor est occupé. Réessaie dans un instant !", mode });
    } finally {
      setLoading(false);
    }
  }, [mode, input, loading, usesLeft, sessionId, studentId, context]);

  const handleReset = useCallback(() => {
    setMode(null);
    setInput("");
    setResult(null);
  }, []);

  return (
    <div className="w-full max-w-[340px]">
      {/* Toggle button */}
      {!open ? (
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(78,205,196,0.08))",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <span>{"\u2728"}</span>
          <span className="text-bw-violet">Assistant Cr&eacute;atif IA</span>
          <span className="text-xs text-bw-muted ml-1">({usesLeft} restants)</span>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(78,205,196,0.04))",
            border: "1px solid rgba(139,92,246,0.15)",
          }}
        >
          {/* Header */}
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "rgba(139,92,246,0.08)" }}>
            <div className="flex items-center gap-2">
              <span>{"\u2728"}</span>
              <span className="text-xs uppercase tracking-widest text-bw-violet font-bold">
                Assistant Cr&eacute;atif
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-bw-muted">{usesLeft} restants</span>
              <button
                onClick={() => { setOpen(false); handleReset(); }}
                aria-label="Fermer l'assistant creatif"
                className="w-5 h-5 rounded-full flex items-center justify-center text-bw-muted hover:text-white cursor-pointer transition-colors"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-4 py-3 space-y-3">
            <AnimatePresence mode="wait">
              {/* Step 1: Choose mode */}
              {!mode && (
                <motion.div key="modes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  <p className="text-xs text-bw-text font-medium">Que veux-tu cr&eacute;er ?</p>
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left cursor-pointer transition-all hover:bg-white/[0.06]"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <span className="text-lg">{m.emoji}</span>
                      <div>
                        <p className="text-xs font-semibold text-white">{m.label}</p>
                        <p className="text-xs text-bw-muted">{m.description}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Step 2: Input + result */}
              {mode && (
                <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {/* Mode badge + back */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      aria-label="Retour au choix du mode"
                      className="text-xs text-bw-muted hover:text-white cursor-pointer transition-colors"
                    >
                      &larr;
                    </button>
                    <span className="text-sm">{MODES.find((m) => m.id === mode)?.emoji}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-bw-violet">
                      {MODES.find((m) => m.id === mode)?.label}
                    </span>
                  </div>

                  {/* Input prompt */}
                  <div>
                    <p className="text-xs text-bw-muted mb-1.5">
                      {mode === "dialogue"
                        ? "Décris tes personnages et la situation :"
                        : mode === "scene"
                        ? "Décris le moment que tu veux mettre en scène :"
                        : "Partage ton idée pour avoir un retour :"}
                    </p>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      aria-label="Decris ce que tu veux creer"
                      placeholder={
                        mode === "dialogue"
                          ? "Ex: Léa confronte son ami Thomas qui a menti..."
                          : mode === "scene"
                          ? "Ex: Le héros entre dans l'entrepôt abandonné..."
                          : "Ex: Mon film parle d'un ado qui découvre un secret..."
                      }
                      maxLength={500}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg text-xs text-bw-text placeholder:text-bw-muted/50 resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-violet/40"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                      disabled={loading}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-bw-muted">{input.length}/500</span>
                      <button
                        onClick={handleSubmit}
                        disabled={!input.trim() || loading || usesLeft <= 0}
                        className="px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                          background: input.trim() && !loading ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                          color: input.trim() && !loading ? "#A78BFA" : undefined,
                          border: "1px solid rgba(139,92,246,0.2)",
                        }}
                      >
                        {loading ? "..." : usesLeft <= 0 ? "Limite atteinte" : "Envoyer \u2728"}
                      </button>
                    </div>
                  </div>

                  {/* Loading */}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 py-2"
                    >
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-bw-violet border-t-transparent rounded-full" />
                      <span className="text-xs text-bw-violet">Le mentor r&eacute;fl&eacute;chit...</span>
                    </motion.div>
                  )}

                  {/* Result */}
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg p-3 space-y-2"
                      style={{ background: "rgba(78,205,196,0.06)", border: "1px solid rgba(78,205,196,0.15)" }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{"\uD83C\uDFAC"}</span>
                        <span className="text-xs uppercase tracking-widest text-bw-teal font-bold">Mentor</span>
                      </div>
                      <p className="text-xs text-bw-text leading-relaxed whitespace-pre-wrap">{result.text}</p>
                      <button
                        onClick={() => { setInput(""); setResult(null); }}
                        className="text-xs text-bw-violet hover:text-bw-violet/80 cursor-pointer transition-colors"
                      >
                        Nouvelle demande &rarr;
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
