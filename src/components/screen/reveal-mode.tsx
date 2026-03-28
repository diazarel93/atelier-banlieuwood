"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WordCloud } from "./word-cloud";

interface RevealResponse {
  id: string;
  text: string;
  studentName: string;
  avatar: string;
}

interface RevealModeProps {
  phase: number; // 0-4
  responsesCount: number;
  responses: RevealResponse[];
  categoryColor: string;
  situationPrompt: string;
}

const PHASE_LABELS = ["Compteur", "Aperçu", "Familles", "Révélation", "Discussion"];

// Simple Jaccard-based clustering for phase 2
function computeClusters(responses: RevealResponse[]): { label: string; responses: RevealResponse[] }[] {
  if (responses.length === 0) return [];

  // Tokenize each response
  const tokenized = responses.map((r) => {
    const words = new Set(
      r.text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z\s'-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2),
    );
    return { response: r, words };
  });

  // Simple greedy clustering with Jaccard similarity
  const used = new Set<number>();
  const clusters: { label: string; responses: RevealResponse[] }[] = [];

  for (let i = 0; i < tokenized.length; i++) {
    if (used.has(i)) continue;
    used.add(i);
    const cluster = [tokenized[i]];

    for (let j = i + 1; j < tokenized.length; j++) {
      if (used.has(j)) continue;
      // Jaccard similarity between cluster seed and candidate
      const a = tokenized[i].words;
      const b = tokenized[j].words;
      const intersection = new Set([...a].filter((w) => b.has(w)));
      const union = new Set([...a, ...b]);
      const jaccard = union.size > 0 ? intersection.size / union.size : 0;
      if (jaccard > 0.15) {
        used.add(j);
        cluster.push(tokenized[j]);
      }
    }

    // Find most common word as cluster label
    const wordFreq = new Map<string, number>();
    for (const item of cluster) {
      for (const w of item.words) {
        wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
      }
    }
    const topWord = [...wordFreq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "Groupe";
    clusters.push({
      label: topWord.charAt(0).toUpperCase() + topWord.slice(1),
      responses: cluster.map((c) => c.response),
    });
  }

  return clusters;
}

// Phase 0: Counter with suspense
function PhaseCounter({ count, color }: { count: number; color: string }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (count === 0) return;
    const duration = 1500;
    const steps = 30;
    const increment = count / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= count) {
        setDisplayed(count);
        clearInterval(interval);
      } else {
        setDisplayed(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [count]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="w-32 h-32 rounded-full mx-auto flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)`, border: `3px solid ${color}50` }}
      >
        <motion.span key={displayed} className="text-6xl font-bold tabular-nums" style={{ color }}>
          {displayed}
        </motion.span>
      </motion.div>
      <div className="space-y-2">
        <p className="text-2xl font-cinema tracking-wider text-white">
          {count === 1 ? "réponse reçue" : "réponses reçues"}
        </p>
        <motion.p
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-bw-muted text-lg"
        >
          Préparez-vous...
        </motion.p>
      </div>
    </motion.div>
  );
}

// Phase 1: Blurred word cloud that deblurs
function PhasePreview({ responses, color }: { responses: RevealResponse[]; color: string }) {
  const texts = useMemo(() => responses.map((r) => r.text), [responses]);
  const [blurred, setBlurred] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBlurred(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
      <p className="text-xl font-cinema tracking-wider text-bw-muted">Aperçu des réponses</p>
      <motion.div
        animate={{ filter: blurred ? "blur(8px)" : "blur(0px)" }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <WordCloud texts={texts} accentColor={color} maxWords={25} />
      </motion.div>
    </motion.div>
  );
}

// Phase 2: Thematic clusters
function PhaseFamilies({ responses, color }: { responses: RevealResponse[]; color: string }) {
  const clusters = useMemo(() => computeClusters(responses), [responses]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl mx-auto space-y-6">
      <p className="text-xl font-cinema tracking-wider text-bw-muted text-center">Familles de réponses</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {clusters.map((cluster, i) => (
            <motion.div
              key={cluster.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 200, damping: 20 }}
              className="rounded-2xl p-5 text-center space-y-2"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}
            >
              <p className="text-lg font-bold" style={{ color }}>
                {cluster.label}
              </p>
              <p className="text-3xl font-bold text-white tabular-nums">{cluster.responses.length}</p>
              <p className="text-sm text-bw-muted">{cluster.responses.length === 1 ? "élève" : "élèves"}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Phase 3: Cards revealed one by one
function PhaseRevelation({ responses, color }: { responses: RevealResponse[]; color: string }) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (revealedCount >= responses.length) return;
    const timer = setTimeout(() => setRevealedCount((c) => c + 1), 1500);
    return () => clearTimeout(timer);
  }, [revealedCount, responses.length]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between px-2">
        <p className="text-xl font-cinema tracking-wider text-bw-muted">Révélation</p>
        <p className="text-sm text-bw-muted tabular-nums">
          {revealedCount}/{responses.length}
        </p>
      </div>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {responses.slice(0, revealedCount).map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="rounded-xl p-4 flex items-start gap-3"
              style={{
                background: "rgba(34,37,43,0.7)",
                border: `1px solid ${i === revealedCount - 1 ? color + "60" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <span className="text-2xl flex-shrink-0">{r.avatar}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-bw-muted mb-1">{r.studentName}</p>
                <p className="text-base text-white leading-relaxed">{r.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Phase 4: Full discussion view
function PhaseDiscussion({ responses, color, prompt }: { responses: RevealResponse[]; color: string; prompt: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
          style={{ background: `${color}20`, border: `2px solid ${color}50` }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Discutons !</h2>
        <p className="text-bw-muted text-base max-w-lg mx-auto">{prompt}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {responses.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: "rgba(34,37,43,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-xl flex-shrink-0">{r.avatar}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-bw-muted mb-1">{r.studentName}</p>
              <p className="text-sm text-white leading-relaxed">{r.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-center text-sm text-bw-muted">
        {responses.length} {responses.length === 1 ? "réponse" : "réponses"} au total
      </p>
    </motion.div>
  );
}

export function RevealMode({ phase, responsesCount, responses, categoryColor, situationPrompt }: RevealModeProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Phase indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-2"
      >
        {PHASE_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full transition-all duration-500"
              style={{
                backgroundColor: i <= phase ? categoryColor : "rgba(255,255,255,0.15)",
                boxShadow: i === phase ? `0 0 8px ${categoryColor}60` : "none",
              }}
            />
            {i < PHASE_LABELS.length - 1 && (
              <div
                className="w-6 h-px"
                style={{ backgroundColor: i < phase ? categoryColor + "40" : "rgba(255,255,255,0.08)" }}
              />
            )}
          </div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {phase === 0 && (
          <motion.div key="p0" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
            <PhaseCounter count={responsesCount} color={categoryColor} />
          </motion.div>
        )}
        {phase === 1 && (
          <motion.div key="p1" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
            <PhasePreview responses={responses} color={categoryColor} />
          </motion.div>
        )}
        {phase === 2 && (
          <motion.div key="p2" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
            <PhaseFamilies responses={responses} color={categoryColor} />
          </motion.div>
        )}
        {phase === 3 && (
          <motion.div key="p3" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
            <PhaseRevelation responses={responses} color={categoryColor} />
          </motion.div>
        )}
        {phase === 4 && (
          <motion.div key="p4" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
            <PhaseDiscussion responses={responses} color={categoryColor} prompt={situationPrompt} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
