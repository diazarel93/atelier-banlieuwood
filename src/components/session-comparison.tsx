"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";

interface CompareChoice {
  id: string;
  situation_id: string;
  category: string;
  chosen_text: string;
  restitution_label: string | null;
}

interface CompareSession {
  session: {
    id: string;
    title: string;
    level: string;
    template: string | null;
    status: string;
    createdAt: string;
    studentCount: number;
  };
  choices: CompareChoice[];
}

interface CompareData {
  current: { id: string; title: string; level: string; template: string | null; module: number };
  currentChoices: CompareChoice[];
  similar: CompareSession[];
}

export function SessionComparison({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<CompareData>({
    queryKey: ["session-compare", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/compare`);
      if (!res.ok) return { current: null, currentChoices: [], similar: [] };
      return res.json();
    },
    enabled: open,
  });

  const hasSimilar = data && data.similar.length > 0;
  const selected = selectedId ? data?.similar.find((s) => s.session.id === selectedId) : data?.similar[0];

  // Group choices by category for side-by-side
  const categories = new Set<string>();
  (data?.currentChoices || []).forEach((c) => categories.add(c.category));
  (selected?.choices || []).forEach((c) => categories.add(c.category));

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen((p) => !p)}
        className="group flex items-center gap-2.5 cursor-pointer transition-colors"
      >
        <div className="w-[3px] h-5 rounded-full bg-gradient-to-b from-bw-primary to-bw-violet" />
        <h2
          className="bw-display text-lg uppercase text-bw-heading group-hover:text-white transition-colors"
          style={{ letterSpacing: "-0.01em" }}
        >
          Comparer avec d&apos;autres sessions
        </h2>
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-bw-muted"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            {isLoading ? (
              <div className="pt-4 space-y-3 animate-pulse">
                <div className="h-10 rounded-xl bg-white/[0.03]" />
                <div className="h-32 rounded-xl bg-white/[0.03]" />
              </div>
            ) : !hasSimilar ? (
              <p className="pt-4 text-[12px] text-bw-muted">
                Aucune autre session avec le m&ecirc;me module trouv&eacute;e. Cr&eacute;ez plus de sessions pour
                comparer.
              </p>
            ) : (
              <div className="pt-4 space-y-4">
                {/* Session selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-bw-muted">
                    Comparer avec :
                  </span>
                  {data!.similar.map((s) => (
                    <button
                      key={s.session.id}
                      onClick={() => setSelectedId(s.session.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        (selectedId || data!.similar[0].session.id) === s.session.id
                          ? "bg-bw-primary/20 border border-bw-primary/40 text-white"
                          : "bg-white/[0.04] border border-white/[0.06] text-bw-muted hover:text-bw-text"
                      }`}
                    >
                      {s.session.title}
                      <span className="ml-1.5 text-xs text-bw-muted">
                        ({s.session.studentCount} &eacute;l&egrave;ves)
                      </span>
                    </button>
                  ))}
                </div>

                {/* Side-by-side comparison */}
                {selected && (
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.14em] text-bw-primary font-semibold">
                          Cette session
                        </p>
                        <p className="text-[12px] text-white truncate">{data!.current.title}</p>
                      </div>
                      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.14em] text-bw-violet font-semibold">
                          {selected.session.title}
                        </p>
                        <p className="text-[12px] text-bw-muted">
                          {new Date(selected.session.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })}
                          {" · "}
                          {selected.session.studentCount} &eacute;l&egrave;ves
                        </p>
                      </div>
                    </div>

                    {/* Choices comparison by category */}
                    {Array.from(categories).map((cat) => {
                      const currentChoice = (data?.currentChoices || []).find((c) => c.category === cat);
                      const otherChoice = selected.choices.find((c) => c.category === cat);
                      const color = CATEGORY_COLORS[cat] || "#888";
                      const label = CATEGORY_LABELS[cat] || cat;
                      const same =
                        currentChoice && otherChoice && currentChoice.chosen_text === otherChoice.chosen_text;

                      return (
                        <motion.div
                          key={cat}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-bw-muted">
                              {label}
                            </span>
                            {same && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-bw-teal/20 text-bw-teal">
                                Identique
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-xs text-white">
                              {currentChoice?.restitution_label || currentChoice?.chosen_text || (
                                <span className="text-bw-muted italic">Pas de choix</span>
                              )}
                            </div>
                            <div className="text-xs text-bw-text">
                              {otherChoice?.restitution_label || otherChoice?.chosen_text || (
                                <span className="text-bw-muted italic">Pas de choix</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {categories.size === 0 && (
                      <p className="text-[12px] text-bw-muted">
                        Aucun choix collectif &agrave; comparer pour le moment.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
