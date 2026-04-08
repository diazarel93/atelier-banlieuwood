"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ═══════════════════════════════════════════════════════════════
   Tour Steps Configuration
   ═══════════════════════════════════════════════════════════════ */

interface TourStep {
  target: string; // data-tour attribute value
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "step-1",
    title: "Cree ta premiere partie",
    description:
      "Clique ici pour lancer une nouvelle seance. Choisis le niveau, le genre cinematographique, et c'est parti !",
    position: "bottom",
  },
  {
    target: "step-2",
    title: "Partage le code avec tes eleves",
    description:
      "Chaque partie a un code unique. Les eleves le saisissent sur leur tablette ou ordinateur pour rejoindre la seance.",
    position: "bottom",
  },
  {
    target: "step-3",
    title: "Pilote en temps reel",
    description:
      "Le cockpit te permet de voir les reponses en direct, relancer les eleves bloques et avancer dans la seance.",
    position: "bottom",
  },
  {
    target: "step-4",
    title: "Projette sur grand ecran",
    description: "Affiche le code et le QR en grand pour que toute la classe puisse rejoindre facilement.",
    position: "bottom",
  },
];

const STORAGE_KEY = "bw-onboarding-done";

/* ═══════════════════════════════════════════════════════════════
   Tooltip Position Calculator
   ═══════════════════════════════════════════════════════════════ */

interface TooltipPos {
  top: number;
  left: number;
  arrowSide: "top" | "bottom" | "left" | "right";
}

function computeTooltipPos(
  rect: DOMRect,
  position: TourStep["position"],
  tooltipW: number,
  tooltipH: number,
): TooltipPos {
  const gap = 14;
  const pad = 16;

  let top = 0;
  let left = 0;
  const arrowSide =
    position === "top" ? "bottom" : position === "bottom" ? "top" : position === "left" ? "right" : "left";

  switch (position) {
    case "bottom":
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      break;
    case "top":
      top = rect.top - tooltipH - gap;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      break;
    case "right":
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.right + gap;
      break;
    case "left":
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.left - tooltipW - gap;
      break;
  }

  // Clamp to viewport
  left = Math.max(pad, Math.min(left, window.innerWidth - tooltipW - pad));
  top = Math.max(pad, Math.min(top, window.innerHeight - tooltipH - pad));

  return { top, left, arrowSide };
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        // Small delay to let the dashboard render its elements
        const timer = setTimeout(() => setActive(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      /* iPad Private Browsing */
    }
  }, []);

  // Locate the target element for the current step
  const locateTarget = useCallback(() => {
    if (!active) return;
    const selector = `[data-tour="${TOUR_STEPS[step].target}"]`;
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Wait for scroll to settle then measure
      requestAnimationFrame(() => {
        setTargetRect(el.getBoundingClientRect());
      });
    } else {
      setTargetRect(null);
    }
  }, [active, step]);

  useEffect(() => {
    locateTarget();
    // Recalculate on resize / scroll
    window.addEventListener("resize", locateTarget);
    window.addEventListener("scroll", locateTarget, true);
    return () => {
      window.removeEventListener("resize", locateTarget);
      window.removeEventListener("scroll", locateTarget, true);
    };
  }, [locateTarget]);

  function finish() {
    setActive(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
  }

  function next() {
    if (step < TOUR_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }

  function skip() {
    finish();
  }

  if (!active) return null;

  const current = TOUR_STEPS[step];
  const tooltipW = 340;
  const tooltipH = 200; // approximate; actual may vary
  const pos = targetRect ? computeTooltipPos(targetRect, current.position, tooltipW, tooltipH) : null;

  // Spotlight cutout dimensions (with padding around target)
  const spotPad = 8;
  const spotRadius = 12;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="tour-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999]"
          style={{ pointerEvents: "auto" }}
        >
          {/* ── Dark backdrop with spotlight cutout ── */}
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
            <defs>
              <mask id="tour-spotlight-mask">
                {/* White = visible (dark backdrop shows) */}
                <rect width="100%" height="100%" fill="white" />
                {/* Black = transparent hole (target shows through) */}
                {targetRect && (
                  <rect
                    x={targetRect.left - spotPad}
                    y={targetRect.top - spotPad}
                    width={targetRect.width + spotPad * 2}
                    height={targetRect.height + spotPad * 2}
                    rx={spotRadius}
                    ry={spotRadius}
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#tour-spotlight-mask)" />
          </svg>

          {/* ── Spotlight ring glow ── */}
          {targetRect && (
            <motion.div
              key={`ring-${step}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute pointer-events-none"
              style={{
                top: targetRect.top - spotPad - 2,
                left: targetRect.left - spotPad - 2,
                width: targetRect.width + (spotPad + 2) * 2,
                height: targetRect.height + (spotPad + 2) * 2,
                borderRadius: spotRadius + 2,
                border: "2px solid rgba(255,107,53,0.5)",
                boxShadow: "0 0 24px rgba(255,107,53,0.25), inset 0 0 12px rgba(255,107,53,0.08)",
              }}
            />
          )}

          {/* ── Clickable backdrop area (to dismiss) ── */}
          <div className="absolute inset-0" style={{ pointerEvents: "auto" }} onClick={skip} />

          {/* ── Tooltip Card ── */}
          {pos && (
            <motion.div
              ref={tooltipRef}
              key={`tooltip-${step}`}
              initial={{
                opacity: 0,
                y: pos.arrowSide === "top" ? -12 : pos.arrowSide === "bottom" ? 12 : 0,
                x: pos.arrowSide === "left" ? -12 : pos.arrowSide === "right" ? 12 : 0,
              }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="absolute"
              style={{
                top: pos.top,
                left: pos.left,
                width: tooltipW,
                pointerEvents: "auto",
                zIndex: 10000,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, rgba(24,24,27,0.98), rgba(15,15,18,0.98))",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(255,107,53,0.08)",
                }}
              >
                {/* Orange accent top bar */}
                <div
                  className="absolute top-0 inset-x-0 h-[2px]"
                  style={{
                    background: "linear-gradient(90deg, transparent, var(--color-bw-primary), transparent)",
                  }}
                />

                <div className="p-5 space-y-3">
                  {/* Step indicator + Close */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor: "rgba(255,107,53,0.15)",
                          color: "var(--color-bw-primary)",
                        }}
                      >
                        {step + 1}
                      </span>
                      <span className="text-xs text-bw-muted font-mono">
                        {step + 1}/{TOUR_STEPS.length}
                      </span>
                    </div>
                    <button
                      onClick={skip}
                      className="p-1 rounded-lg text-bw-muted hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                      aria-label="Fermer le guide"
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

                  {/* Title */}
                  <h3 className="text-[15px] font-bold text-white" style={{ letterSpacing: "-0.01em" }}>
                    {current.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[13px] text-bw-muted leading-relaxed">{current.description}</p>

                  {/* Progress dots */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {TOUR_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className="h-1 rounded-full transition-all duration-300"
                        style={{
                          width: i === step ? 20 : 8,
                          backgroundColor:
                            i === step
                              ? "var(--color-bw-primary)"
                              : i < step
                                ? "rgba(255,107,53,0.4)"
                                : "rgba(255,255,255,0.1)",
                        }}
                      />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={skip}
                      className="text-[12px] text-bw-muted hover:text-bw-text transition-colors cursor-pointer"
                    >
                      Passer
                    </button>
                    <button
                      onClick={next}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white cursor-pointer transition-all duration-200"
                      style={{
                        background: "linear-gradient(135deg, var(--color-bw-primary), #E85D26)",
                        boxShadow: "0 0 16px rgba(255,107,53,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 0 28px rgba(255,107,53,0.35), inset 0 1px 0 rgba(255,255,255,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 0 16px rgba(255,107,53,0.2), inset 0 1px 0 rgba(255,255,255,0.1)";
                      }}
                    >
                      {step < TOUR_STEPS.length - 1 ? (
                        <>
                          Suivant
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </>
                      ) : (
                        <>
                          C&apos;est parti !
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Fallback: no target found ── */}
          {!targetRect && (
            <motion.div
              key={`fallback-${step}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
              style={{ width: tooltipW, pointerEvents: "auto", zIndex: 10000 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative rounded-2xl overflow-hidden p-5 space-y-3"
                style={{
                  background: "linear-gradient(145deg, rgba(24,24,27,0.98), rgba(15,15,18,0.98))",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(255,107,53,0.08)",
                }}
              >
                <div
                  className="absolute top-0 inset-x-0 h-[2px]"
                  style={{
                    background: "linear-gradient(90deg, transparent, var(--color-bw-primary), transparent)",
                  }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-bw-muted font-mono">
                    {step + 1}/{TOUR_STEPS.length}
                  </span>
                  <button
                    onClick={skip}
                    className="p-1 rounded-lg text-bw-muted hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
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
                <h3 className="text-[15px] font-bold text-white">{current.title}</h3>
                <p className="text-[13px] text-bw-muted leading-relaxed">{current.description}</p>
                <p className="text-xs text-bw-muted/60 italic">Cet element apparaitra apres avoir cree une partie.</p>
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={skip}
                    className="text-[12px] text-bw-muted hover:text-bw-text transition-colors cursor-pointer"
                  >
                    Passer
                  </button>
                  <button
                    onClick={next}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white cursor-pointer transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, var(--color-bw-primary), #E85D26)",
                      boxShadow: "0 0 16px rgba(255,107,53,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                    }}
                  >
                    {step < TOUR_STEPS.length - 1 ? "Suivant" : "Compris !"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
