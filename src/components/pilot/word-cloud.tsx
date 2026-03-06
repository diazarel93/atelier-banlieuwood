"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

// French stop words — common words to exclude from analysis
const STOP_WORDS = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "au", "aux", "ce", "ces", "cette",
  "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses", "notre", "nos", "votre", "vos", "leur", "leurs",
  "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "me", "te", "se", "lui",
  "et", "ou", "mais", "donc", "car", "ni", "que", "qui", "quoi", "dont", "où",
  "ne", "pas", "plus", "jamais", "rien", "personne",
  "est", "sont", "suis", "es", "sommes", "êtes", "a", "ai", "as", "ont", "avons", "avez",
  "fait", "faire", "peut", "être", "avoir", "dit", "va", "vont",
  "en", "dans", "sur", "sous", "avec", "pour", "par", "sans", "chez",
  "si", "bien", "très", "aussi", "tout", "tous", "toute", "toutes",
  "c", "j", "l", "m", "n", "s", "t", "y", "d", "qu",
  "ça", "cela", "ceci", "quand", "comme", "alors", "même", "encore", "trop", "peu",
  "là", "ici", "oui", "non", "entre", "depuis", "avant", "après", "pendant",
]);

const COLORS = [
  "#F5A45B", "#6B8CFF", "#4CAF50", "#EB5757", "#8B5CF6",
  "#F59E0B", "#EC4899", "#14B8A6", "#F97316", "#3B82F6",
];

interface WordCloudProps {
  open: boolean;
  onClose: () => void;
  responses: { text: string }[];
}

interface WordEntry {
  word: string;
  count: number;
  size: number;
  color: string;
}

function extractWords(responses: { text: string }[]): WordEntry[] {
  const freq = new Map<string, number>();

  for (const r of responses) {
    const words = r.text
      .toLowerCase()
      .replace(/[^a-zà-ÿ\s'-]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));

    for (const word of words) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }
  }

  const sorted = [...freq.entries()]
    .filter(([, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40);

  if (sorted.length === 0) return [];

  const maxCount = sorted[0][1];
  const minCount = sorted[sorted.length - 1][1];
  const range = maxCount - minCount || 1;

  return sorted.map(([word, count], i) => ({
    word,
    count,
    size: 14 + ((count - minCount) / range) * 28, // 14px to 42px
    color: COLORS[i % COLORS.length],
  }));
}

export function WordCloud({ open, onClose, responses }: WordCloudProps) {
  const words = useMemo(() => extractWords(responses), [responses]);

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
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] max-w-[90vw] glass-card rounded-2xl border border-black/[0.06] overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-black/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">☁️</span>
                <h3 className="text-sm font-semibold">Nuage de mots</h3>
                <span className="text-xs text-bw-muted">{responses.length} reponse{responses.length > 1 ? "s" : ""} analysee{responses.length > 1 ? "s" : ""}</span>
              </div>
              <button onClick={onClose} className="text-bw-muted hover:text-bw-heading text-sm cursor-pointer">✕</button>
            </div>

            {/* Cloud */}
            <div className="px-5 py-6">
              {words.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-bw-muted text-sm">Pas assez de mots pour generer un nuage.</p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 min-h-[200px]">
                  {words.map((entry, i) => (
                    <motion.span
                      key={entry.word}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.02, type: "spring", stiffness: 300, damping: 20 }}
                      className="font-bold cursor-default select-none hover:opacity-80 transition-opacity"
                      style={{
                        fontSize: `${entry.size}px`,
                        color: entry.color,
                        lineHeight: 1.2,
                      }}
                      title={`"${entry.word}" — ${entry.count} fois`}
                    >
                      {entry.word}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>

            {/* Top words list */}
            {words.length > 0 && (
              <div className="px-5 pb-4 border-t border-black/[0.04] pt-3">
                <p className="text-xs text-bw-muted font-semibold uppercase tracking-wider mb-2">Top 10</p>
                <div className="flex flex-wrap gap-1.5">
                  {words.slice(0, 10).map(entry => (
                    <span key={entry.word} className="text-xs px-2.5 py-1 rounded-full border border-black/[0.06]" style={{ color: entry.color }}>
                      <strong>{entry.word}</strong> <span className="text-bw-muted">×{entry.count}</span>
                    </span>
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
