"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface DebateResponse {
  id: string;
  text: string;
  student_id: string;
  studentName: string;
  studentAvatar: string;
  is_highlighted: boolean;
}

interface DebatePanelProps {
  open: boolean;
  onClose: () => void;
  responses: DebateResponse[];
  onBroadcast: (message: string) => void;
  onSpotlight?: (r: DebateResponse) => void;
}

const CAMP_COLORS = [
  { bg: "#EEF2FF", border: "#6B8CFF", text: "#4A6AE8", label: "Camp A" },
  { bg: "#FFF0E0", border: "#F5A45B", text: "#D4842F", label: "Camp B" },
  { bg: "#F0FAF4", border: "#4CAF50", text: "#2E7D32", label: "Camp C" },
  { bg: "#FFF5F5", border: "#EB5757", text: "#C62828", label: "Camp D" },
];

function normalizeText(t: string): string {
  return t
    .toLowerCase()
    .replace(/[^a-zà-ÿ0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Group responses into camps by similar text content.
 * For QCM-like responses (short, identical texts) → exact match grouping.
 * For longer free-text → groups by first 20 normalized chars (rough clustering).
 */
function groupIntoCamps(responses: DebateResponse[]): { key: string; label: string; responses: DebateResponse[] }[] {
  const groups = new Map<string, DebateResponse[]>();

  for (const r of responses) {
    const norm = normalizeText(r.text);
    // Short responses (< 40 chars) → exact match
    // Longer → first 20 chars as a rough cluster key
    const key = norm.length < 40 ? norm : norm.slice(0, 20);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  // Sort by group size descending, take top groups
  const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);

  return sorted.map(([key, resps], i) => ({
    key,
    label: resps[0].text.length > 50 ? resps[0].text.slice(0, 50) + "..." : resps[0].text,
    responses: resps,
  }));
}

export function DebatePanel({ open, onClose, responses, onBroadcast, onSpotlight }: DebatePanelProps) {
  const [selectedCamps, setSelectedCamps] = useState<[number, number]>([0, 1]);

  const camps = useMemo(() => groupIntoCamps(responses), [responses]);

  const toggleCamp = (campIdx: number, slot: 0 | 1) => {
    setSelectedCamps((prev) => {
      const next = [...prev] as [number, number];
      next[slot] = campIdx;
      return next;
    });
  };

  if (!open) return null;

  const notEnoughCamps = camps.length < 2;
  const campA = notEnoughCamps ? null : camps[selectedCamps[0]];
  const campB = notEnoughCamps ? null : camps[selectedCamps[1]];
  const totalInDebate = (campA?.responses.length || 0) + (campB?.responses.length || 0);

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
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] max-w-[95vw] max-h-[85vh] glass-card rounded-2xl border border-black/[0.06] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-black/[0.04] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎭</span>
                <h3 className="text-sm font-semibold">Mode Debat</h3>
                <span className="text-xs text-bw-muted">
                  {camps.length} positions, {responses.length} reponses
                </span>
              </div>
              <button onClick={onClose} className="text-bw-muted hover:text-bw-heading text-sm cursor-pointer">
                ✕
              </button>
            </div>

            {/* Not enough distinct positions */}
            {notEnoughCamps && (
              <div className="px-5 py-10 text-center space-y-3">
                <span className="text-4xl">🤝</span>
                <p className="text-sm font-semibold text-bw-heading">Pas assez de positions differentes</p>
                <p className="text-xs text-bw-muted max-w-xs mx-auto">
                  {responses.length === 0
                    ? "Aucune reponse visible pour creer un debat."
                    : camps.length === 1
                      ? `Tous les eleves ont repondu la meme chose : "${camps[0].label}"`
                      : "Il faut au moins 2 reponses visibles pour lancer un debat."}
                </p>
                <button
                  onClick={() => {
                    onBroadcast("Pour ce debat : quels arguments pour et contre ?");
                    onClose();
                  }}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:brightness-110 active:scale-95 border border-black/[0.06] text-bw-text hover:bg-black/[0.03]"
                >
                  📢 Envoyer un message a la place
                </button>
              </div>
            )}

            {/* Camp selector pills */}
            {!notEnoughCamps && camps.length > 2 && (
              <div className="px-5 py-2 border-b border-black/[0.04] flex flex-wrap gap-1.5">
                <span className="text-xs text-bw-muted mr-1 self-center">Positions :</span>
                {camps.map((camp, i) => (
                  <button
                    key={camp.key}
                    onClick={() => {
                      if (selectedCamps[0] !== i && selectedCamps[1] !== i) {
                        toggleCamp(i, 1);
                      }
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                      selectedCamps.includes(i)
                        ? "bg-bw-primary/10 border-bw-primary/30 text-bw-primary font-semibold"
                        : "border-black/[0.06] text-bw-muted hover:border-black/10"
                    }`}
                  >
                    {camp.label} ({camp.responses.length})
                  </button>
                ))}
              </div>
            )}

            {/* Split view */}
            {!notEnoughCamps && (
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="grid grid-cols-2 gap-4 h-full">
                  {[campA, campB].map((camp, idx) => {
                    if (!camp) return null;
                    const color = CAMP_COLORS[idx];
                    return (
                      <div key={camp.key} className="flex flex-col">
                        {/* Camp header */}
                        <div
                          className="flex items-center gap-2 mb-3 pb-2 border-b"
                          style={{ borderColor: color.border + "40" }}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ background: color.border }} />
                          <span className="text-sm font-bold" style={{ color: color.text }}>
                            {color.label}
                          </span>
                          <span className="text-xs text-bw-muted ml-auto">
                            {camp.responses.length} eleve{camp.responses.length > 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Representative text */}
                        <div
                          className="rounded-xl p-3 mb-3 text-sm leading-relaxed"
                          style={{ background: color.bg, border: `1px solid ${color.border}30`, color: color.text }}
                        >
                          &ldquo;{camp.label}&rdquo;
                        </div>

                        {/* Students */}
                        <div className="space-y-1.5 overflow-y-auto max-h-[300px]">
                          {camp.responses.map((r) => (
                            <div
                              key={r.id}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-black/[0.04] hover:border-black/[0.08] transition-colors group"
                            >
                              <span className="text-sm">{r.studentAvatar}</span>
                              <span className="text-xs text-bw-text flex-1 truncate">{r.studentName}</span>
                              {r.is_highlighted && (
                                <span className="text-[10px]" title="Mis en avant">
                                  ⭐
                                </span>
                              )}
                              {onSpotlight && (
                                <button
                                  onClick={() => onSpotlight(r)}
                                  className="text-[10px] text-bw-muted hover:text-[#F5A45B] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Projeter"
                                >
                                  🔦
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions footer */}
            {!notEnoughCamps && (
              <div className="px-5 py-3 border-t border-black/[0.04] flex items-center justify-between flex-shrink-0">
                <span className="text-xs text-bw-muted">{totalInDebate} eleves dans le debat</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const msg = `Debat ! ${CAMP_COLORS[0].label} : "${campA?.label}" vs ${CAMP_COLORS[1].label} : "${campB?.label}" — Defendez votre position !`;
                      onBroadcast(msg);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:brightness-110 active:scale-95"
                    style={{ backgroundColor: "#F5A45B", color: "white" }}
                  >
                    📢 Lancer le debat
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
