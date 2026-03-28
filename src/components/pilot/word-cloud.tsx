"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// French stop words — common words to exclude from analysis
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
  "ces",
  "cette",
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
  "lui",
  "et",
  "ou",
  "mais",
  "donc",
  "car",
  "ni",
  "que",
  "qui",
  "quoi",
  "dont",
  "où",
  "ne",
  "pas",
  "plus",
  "jamais",
  "rien",
  "personne",
  "est",
  "sont",
  "suis",
  "es",
  "sommes",
  "êtes",
  "a",
  "ai",
  "as",
  "ont",
  "avons",
  "avez",
  "fait",
  "faire",
  "peut",
  "être",
  "avoir",
  "dit",
  "va",
  "vont",
  "en",
  "dans",
  "sur",
  "sous",
  "avec",
  "pour",
  "par",
  "sans",
  "chez",
  "si",
  "bien",
  "très",
  "aussi",
  "tout",
  "tous",
  "toute",
  "toutes",
  "c",
  "j",
  "l",
  "m",
  "n",
  "s",
  "t",
  "y",
  "d",
  "qu",
  "ça",
  "cela",
  "ceci",
  "quand",
  "comme",
  "alors",
  "même",
  "encore",
  "trop",
  "peu",
  "là",
  "ici",
  "oui",
  "non",
  "entre",
  "depuis",
  "avant",
  "après",
  "pendant",
]);

const COLORS = [
  "#F5A45B",
  "#6B8CFF",
  "#4CAF50",
  "#EB5757",
  "#8B5CF6",
  "#F59E0B",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#3B82F6",
];

interface WordCloudResponse {
  text: string;
  students?: { display_name: string; avatar: string };
  student_id?: string;
}

interface WordCloudProps {
  open: boolean;
  onClose: () => void;
  responses: WordCloudResponse[];
}

// ── Word frequency analysis ──
interface WordEntry {
  word: string;
  count: number;
  size: number;
  color: string;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zà-ÿ\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function extractWords(responses: WordCloudResponse[]): WordEntry[] {
  const freq = new Map<string, number>();
  for (const r of responses) {
    for (const word of tokenize(r.text)) {
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
    size: 14 + ((count - minCount) / range) * 28,
    color: COLORS[i % COLORS.length],
  }));
}

// ── Response clustering by shared keywords (Jaccard-like) ──
interface ResponseCluster {
  id: number;
  label: string; // Most representative keyword(s)
  responses: WordCloudResponse[];
  keywords: string[]; // Top keywords for this cluster
  color: string;
}

function clusterResponses(responses: WordCloudResponse[]): ResponseCluster[] {
  if (responses.length === 0) return [];

  // Tokenize each response
  const tokenized = responses.map((r) => ({
    response: r,
    words: new Set(tokenize(r.text)),
  }));

  // Simple greedy clustering: for each unassigned response, find the most similar assigned cluster
  const clusters: { responses: WordCloudResponse[]; wordSets: Set<string>[] }[] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < tokenized.length; i++) {
    if (assigned.has(i)) continue;
    const words = tokenized[i].words;
    if (words.size === 0) continue;

    // Start new cluster
    const cluster: { responses: WordCloudResponse[]; wordSets: Set<string>[] } = {
      responses: [tokenized[i].response],
      wordSets: [words],
    };
    assigned.add(i);

    // Find similar responses (Jaccard similarity >= 0.15)
    for (let j = i + 1; j < tokenized.length; j++) {
      if (assigned.has(j)) continue;
      const other = tokenized[j].words;
      if (other.size === 0) continue;

      // Jaccard similarity against cluster centroid (union of all cluster words)
      const clusterWords = new Set<string>();
      for (const ws of cluster.wordSets) ws.forEach((w) => clusterWords.add(w));

      let intersection = 0;
      for (const w of other) if (clusterWords.has(w)) intersection++;
      const union = new Set([...clusterWords, ...other]).size;
      const similarity = union > 0 ? intersection / union : 0;

      if (similarity >= 0.12 || intersection >= 2) {
        cluster.responses.push(tokenized[j].response);
        cluster.wordSets.push(other);
        assigned.add(j);
      }
    }

    clusters.push(cluster);
  }

  // Handle unassigned (empty text) responses
  const unclustered = tokenized.filter((_, i) => !assigned.has(i)).map((t) => t.response);
  if (unclustered.length > 0) {
    clusters.push({ responses: unclustered, wordSets: [] });
  }

  // Sort clusters by size (biggest first)
  clusters.sort((a, b) => b.responses.length - a.responses.length);

  // Compute labels from top keywords per cluster
  return clusters.slice(0, 8).map((cluster, idx) => {
    const freq = new Map<string, number>();
    for (const ws of cluster.wordSets) {
      ws.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
    }
    const topWords = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([w]) => w);

    return {
      id: idx,
      label: topWords.length > 0 ? topWords.slice(0, 2).join(" + ") : "Divers",
      responses: cluster.responses,
      keywords: topWords,
      color: COLORS[idx % COLORS.length],
    };
  });
}

type ViewMode = "ideas" | "words";

export function WordCloud({ open, onClose, responses }: WordCloudProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("ideas");
  const [expandedCluster, setExpandedCluster] = useState<number | null>(null);
  const words = useMemo(() => extractWords(responses), [responses]);
  const clusters = useMemo(() => clusterResponses(responses), [responses]);

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
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-w-[90vw] max-h-[80vh] overflow-hidden flex flex-col"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.5)",
              borderRadius: 20,
              boxShadow: "0 20px 60px rgba(61,43,16,0.15), 0 4px 16px rgba(61,43,16,0.08)",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-3.5 flex items-center justify-between flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(232,223,210,0.5)" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">💡</span>
                <h3 className="text-[14px] font-bold text-[#2C2C2C]">Nuage d&apos;idees de la classe</h3>
                <span className="text-[11px] text-[#B0A99E] font-medium">
                  {responses.length} reponse{responses.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid #2a2a50" }}>
                  <button
                    onClick={() => setViewMode("ideas")}
                    className="px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition-colors"
                    style={{
                      background: viewMode === "ideas" ? "#3B5998" : "transparent",
                      color: viewMode === "ideas" ? "#fff" : "#7A7A7A",
                    }}
                  >
                    Idees
                  </button>
                  <button
                    onClick={() => setViewMode("words")}
                    className="px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition-colors"
                    style={{
                      background: viewMode === "words" ? "#3B5998" : "transparent",
                      color: viewMode === "words" ? "#fff" : "#7A7A7A",
                    }}
                  >
                    Mots
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="text-[#B0A99E] hover:text-[#2C2C2C] text-sm cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {viewMode === "ideas" ? (
                  <motion.div
                    key="ideas"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-5 py-4 space-y-2.5"
                  >
                    {clusters.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-[13px] text-[#B0A99E]">Pas assez de reponses pour regrouper.</p>
                      </div>
                    ) : (
                      clusters.map((cluster, i) => (
                        <motion.div
                          key={cluster.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <button
                            onClick={() => setExpandedCluster(expandedCluster === cluster.id ? null : cluster.id)}
                            className="w-full text-left rounded-[12px] px-4 py-3 cursor-pointer transition-all hover:shadow-sm"
                            style={{
                              background:
                                expandedCluster === cluster.id ? `${cluster.color}10` : "rgba(255,255,255,0.7)",
                              border: `1px solid ${expandedCluster === cluster.id ? `${cluster.color}30` : "#2a2a50"}`,
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ background: cluster.color }}
                                />
                                <span className="text-[13px] font-bold" style={{ color: cluster.color }}>
                                  {cluster.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full"
                                  style={{ background: `${cluster.color}12`, color: cluster.color }}
                                >
                                  {cluster.responses.length} eleve{cluster.responses.length > 1 ? "s" : ""}
                                </span>
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke={cluster.color}
                                  strokeWidth="2"
                                  className={`transition-transform duration-200 ${expandedCluster === cluster.id ? "rotate-180" : ""}`}
                                >
                                  <path d="M6 9l6 6 6-6" />
                                </svg>
                              </div>
                            </div>

                            {/* Keywords */}
                            {cluster.keywords.length > 0 && (
                              <div className="flex items-center gap-1 mt-1.5">
                                {cluster.keywords.map((kw) => (
                                  <span
                                    key={kw}
                                    className="text-[10px] px-1.5 py-0.5 rounded"
                                    style={{ background: `${cluster.color}08`, color: "#7A7A7A" }}
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </button>

                          {/* Expanded: show individual responses */}
                          <AnimatePresence>
                            {expandedCluster === cluster.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-7 pr-2 py-2 space-y-1.5">
                                  {cluster.responses.map((r, ri) => (
                                    <div
                                      key={ri}
                                      className="flex items-start gap-2 px-3 py-2 rounded-[8px]"
                                      style={{
                                        background: "rgba(255,255,255,0.6)",
                                        border: "1px solid rgba(232,223,210,0.4)",
                                      }}
                                    >
                                      {r.students && (
                                        <span className="text-sm flex-shrink-0 mt-0.5">{r.students.avatar}</span>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        {r.students && (
                                          <span className="text-[11px] font-semibold text-[#2C2C2C]">
                                            {r.students.display_name}
                                          </span>
                                        )}
                                        <p className="text-[12px] text-[#5B5B5B] leading-snug mt-0.5 line-clamp-3">
                                          {r.text}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))
                    )}

                    {/* Summary bar */}
                    {clusters.length > 0 && (
                      <div
                        className="flex items-center gap-3 pt-2"
                        style={{ borderTop: "1px solid rgba(232,223,210,0.4)" }}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B0A99E]">
                          Repartition
                        </span>
                        <div className="flex-1 flex h-3 rounded-full overflow-hidden">
                          {clusters.map((c) => (
                            <div
                              key={c.id}
                              style={{
                                width: `${(c.responses.length / responses.length) * 100}%`,
                                background: c.color,
                                minWidth: 4,
                              }}
                              title={`${c.label} — ${c.responses.length}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* Classic word cloud view */
                  <motion.div
                    key="words"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-5 py-6"
                  >
                    {words.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-[13px] text-[#B0A99E]">Pas assez de mots pour generer un nuage.</p>
                      </div>
                    ) : (
                      <>
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

                        {/* Top words list */}
                        <div className="pt-4 mt-4" style={{ borderTop: "1px solid rgba(232,223,210,0.4)" }}>
                          <p className="text-[10px] text-[#B0A99E] font-bold uppercase tracking-wider mb-2">Top 10</p>
                          <div className="flex flex-wrap gap-1.5">
                            {words.slice(0, 10).map((entry) => (
                              <span
                                key={entry.word}
                                className="text-[11px] px-2.5 py-1 rounded-full"
                                style={{
                                  background: `${entry.color}10`,
                                  border: `1px solid ${entry.color}20`,
                                  color: entry.color,
                                }}
                              >
                                <strong>{entry.word}</strong> <span style={{ color: "#B0A99E" }}>×{entry.count}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
