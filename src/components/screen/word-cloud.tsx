"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

// French stop words to filter out
const STOP_WORDS = new Set([
  "le",
  "la",
  "les",
  "un",
  "une",
  "des",
  "de",
  "du",
  "au",
  "aux",
  "ce",
  "cette",
  "ces",
  "mon",
  "ma",
  "mes",
  "ton",
  "ta",
  "tes",
  "son",
  "sa",
  "ses",
  "notre",
  "nos",
  "votre",
  "vos",
  "leur",
  "leurs",
  "je",
  "tu",
  "il",
  "elle",
  "on",
  "nous",
  "vous",
  "ils",
  "elles",
  "me",
  "te",
  "se",
  "en",
  "y",
  "qui",
  "que",
  "quoi",
  "dont",
  "ou",
  "et",
  "ou",
  "mais",
  "donc",
  "car",
  "ni",
  "ne",
  "pas",
  "plus",
  "dans",
  "sur",
  "sous",
  "avec",
  "sans",
  "pour",
  "par",
  "vers",
  "chez",
  "est",
  "sont",
  "a",
  "ont",
  "fait",
  "été",
  "être",
  "avoir",
  "comme",
  "aussi",
  "très",
  "bien",
  "tout",
  "tous",
  "toute",
  "toutes",
  "peut",
  "faire",
  "dit",
  "va",
  "vont",
  "cest",
  "c'est",
  "qu'il",
  "qu'elle",
  "qu'on",
  "il y",
  "ya",
]);

interface WordCloudProps {
  /** Array of response texts to extract words from */
  texts: string[];
  /** Max number of words to display */
  maxWords?: number;
  /** Accent color for top words */
  accentColor?: string;
}

interface WordEntry {
  word: string;
  count: number;
  size: number;
}

export function WordCloud({ texts, maxWords = 30, accentColor = "var(--color-bw-primary)" }: WordCloudProps) {
  const words = useMemo(() => {
    const freq = new Map<string, number>();

    for (const text of texts) {
      const cleaned = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents for matching
        .replace(/[^a-z\s'-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

      for (const word of cleaned) {
        freq.set(word, (freq.get(word) || 0) + 1);
      }
    }

    const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, maxWords);

    if (sorted.length === 0) return [];

    const maxCount = sorted[0][1];
    const minCount = sorted[sorted.length - 1][1];
    const range = maxCount - minCount || 1;

    return sorted.map(
      ([word, count]): WordEntry => ({
        word,
        count,
        // Scale from 14px to 48px based on frequency
        size: 14 + ((count - minCount) / range) * 34,
      }),
    );
  }, [texts, maxWords]);

  if (words.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 max-w-3xl mx-auto px-4">
      <AnimatePresence mode="popLayout">
        {words.map((entry, i) => {
          const isTop = i < 3;
          const opacity = 0.4 + (entry.count / (words[0]?.count || 1)) * 0.6;

          return (
            <motion.span
              key={entry.word}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ delay: i * 0.03, type: "spring", stiffness: 200, damping: 20 }}
              className="inline-block font-cinema tracking-wider select-none"
              style={{
                fontSize: `${entry.size}px`,
                color: isTop ? accentColor : `rgba(255,255,255,${opacity})`,
              }}
            >
              {entry.word}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
