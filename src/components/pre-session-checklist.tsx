"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ═══════════════════════════════════════════════════════════════
   Pre-Session Checklist — "Check-list de tournage"
   A cinema-themed floating clipboard for the facilitator to verify
   setup before launching a session. Appears when status is "waiting".
   ═══════════════════════════════════════════════════════════════ */

interface PreSessionChecklistProps {
  connectedCount: number;
  moduleSelected: boolean;
  moduleName?: string;
  joinCode: string;
  onDismiss: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  tip?: string;
  autoChecked: boolean;
  statusText: string;
}

export function PreSessionChecklist({
  connectedCount,
  moduleSelected,
  moduleName,
  joinCode,
  onDismiss,
}: PreSessionChecklistProps) {
  const [projectorChecked, setProjectorChecked] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const items: ChecklistItem[] = useMemo(
    () => [
      {
        id: "projector",
        label: "Projecteur branche",
        tip: "Ouvre l'ecran projecteur dans un 2e onglet",
        autoChecked: projectorChecked,
        statusText: projectorChecked ? "Pret" : "A verifier",
      },
      {
        id: "students",
        label: "Eleves connectes",
        autoChecked: connectedCount >= 3,
        statusText: connectedCount >= 3 ? `${connectedCount} eleves en ligne` : `${connectedCount}/3 minimum`,
      },
      {
        id: "code",
        label: "Code partage",
        autoChecked: true,
        statusText: joinCode,
      },
      {
        id: "module",
        label: "Module choisi",
        autoChecked: moduleSelected,
        statusText: moduleSelected ? moduleName || "Module selectionne" : "Aucun module selectionne",
      },
    ],
    [projectorChecked, connectedCount, joinCode, moduleSelected, moduleName],
  );

  const checkedCount = items.filter((i) => i.autoChecked).length;
  const allChecked = checkedCount === items.length;

  function handleDismiss() {
    setDismissed(true);
    onDismiss();
  }

  if (dismissed) return null;

  /* ── Minimized badge ── */
  if (minimized) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer shadow-lg"
        style={{
          background: allChecked
            ? "linear-gradient(135deg, #10B981, #059669)"
            : "linear-gradient(135deg, rgba(24,24,27,0.95), rgba(15,15,18,0.95))",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 16px rgba(255,107,53,0.08)",
        }}
      >
        <span className="text-sm">{allChecked ? "\u2705" : "\uD83C\uDFAC"}</span>
        <span className="text-xs font-bold text-white tabular-nums">
          {checkedCount}/{items.length}
        </span>
      </motion.button>
    );
  }

  /* ── Full checklist panel ── */
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="fixed bottom-6 right-6 z-50 w-[340px]"
      >
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(24,24,27,0.97), rgba(12,12,15,0.98))",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(255,107,53,0.06)",
          }}
        >
          {/* Clipboard clip — decorative top element */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[1px] w-16 h-3 rounded-b-lg bg-bw-muted/60 border border-t-0 border-bw-muted/30" />

          {/* Orange accent bar */}
          <div
            className="absolute top-0 inset-x-0 h-[2px]"
            style={{
              background: "linear-gradient(90deg, transparent, #FF6B35, transparent)",
            }}
          />

          {/* Header */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{"\uD83C\uDFAC"}</span>
              <h3 className="text-[14px] font-bold text-white tracking-tight" style={{ fontVariantLigatures: "none" }}>
                Check-list de tournage
              </h3>
            </div>
            <div className="flex items-center gap-1">
              {/* Minimize button */}
              <button
                onClick={() => setMinimized(true)}
                className="p-1.5 rounded-lg text-bw-muted hover:text-bw-text hover:bg-white/[0.06] transition-all cursor-pointer"
                aria-label="Minimiser"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-bw-muted hover:text-bw-text hover:bg-white/[0.06] transition-all cursor-pointer"
                aria-label="Fermer"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-5 pb-3">
            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(checkedCount / items.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  background: allChecked
                    ? "linear-gradient(90deg, #10B981, #34D399)"
                    : "linear-gradient(90deg, #FF6B35, #FF8C5A)",
                }}
              />
            </div>
          </div>

          {/* Checklist items */}
          <div className="px-4 pb-2 space-y-1">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.06 }}
                className="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 hover:bg-white/[0.03]"
              >
                {/* Checkbox */}
                {item.id === "projector" ? (
                  <button onClick={() => setProjectorChecked((v) => !v)} className="mt-0.5 shrink-0 cursor-pointer">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
                      style={{
                        background: projectorChecked ? "linear-gradient(135deg, #10B981, #059669)" : "transparent",
                        border: projectorChecked ? "none" : "2px solid rgba(255,255,255,0.15)",
                        boxShadow: projectorChecked ? "0 0 8px rgba(16,185,129,0.3)" : "none",
                      }}
                    >
                      {projectorChecked && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 15,
                          }}
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </motion.svg>
                      )}
                    </div>
                  </button>
                ) : (
                  <div className="mt-0.5 shrink-0">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
                      style={{
                        background: item.autoChecked ? "linear-gradient(135deg, #10B981, #059669)" : "transparent",
                        border: item.autoChecked ? "none" : "2px solid rgba(255,255,255,0.15)",
                        boxShadow: item.autoChecked ? "0 0 8px rgba(16,185,129,0.3)" : "none",
                      }}
                    >
                      {item.autoChecked && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 15,
                          }}
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </motion.svg>
                      )}
                    </div>
                  </div>
                )}

                {/* Label + status */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] font-medium leading-tight ${
                      item.autoChecked ? "text-white" : "text-bw-muted"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`text-xs mt-0.5 leading-snug ${
                      item.autoChecked ? "text-bw-green/80" : "text-bw-amber/70"
                    }`}
                  >
                    {item.statusText}
                  </p>
                  {item.tip && !item.autoChecked && (
                    <p className="text-xs text-bw-muted/60 mt-0.5 italic">{item.tip}</p>
                  )}
                </div>

                {/* Status dot */}
                <div className="mt-1.5 shrink-0">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: item.autoChecked ? "#10B981" : "#F59E0B",
                      boxShadow: item.autoChecked ? "0 0 6px rgba(16,185,129,0.4)" : "0 0 6px rgba(245,158,11,0.3)",
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Launch button */}
          <div className="px-5 pb-5 pt-2">
            <motion.button
              whileHover={allChecked ? { scale: 1.02 } : {}}
              whileTap={allChecked ? { scale: 0.98 } : {}}
              onClick={allChecked ? handleDismiss : undefined}
              disabled={!allChecked}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
              style={{
                background: allChecked ? "linear-gradient(135deg, #FF6B35, #E85D26)" : "rgba(255,255,255,0.04)",
                color: allChecked ? "white" : "rgba(255,255,255,0.25)",
                border: allChecked ? "none" : "1px solid rgba(255,255,255,0.06)",
                boxShadow: allChecked ? "0 0 20px rgba(255,107,53,0.25), inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
              }}
            >
              <span>{allChecked ? "\uD83C\uDF1F" : "\u23F3"}</span>
              <span>{allChecked ? "C'est parti !" : `${checkedCount}/${items.length} — Encore un effort`}</span>
            </motion.button>
          </div>

          {/* Subtle film-strip decoration at the bottom */}
          <div className="flex h-2 overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 mx-[1px] rounded-t-[1px]"
                style={{
                  backgroundColor: i % 2 === 0 ? "rgba(255,107,53,0.08)" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
