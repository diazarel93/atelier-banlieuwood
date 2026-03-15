"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface HelpTip {
  title: string;
  description: string;
}

interface HelpButtonProps {
  pageKey: string; // unique key per page (e.g. "pilot", "play", "screen")
  tips: HelpTip[];
}

/**
 * Floating help button (?) in bottom-right corner.
 * Shows contextual tips for the current page.
 * Dismisses automatically after the user views all tips once.
 */
export function HelpButton({ pageKey, tips }: HelpButtonProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const storageKey = `bw-help-seen-${pageKey}`;

  // Show badge on first visit
  const [showBadge, setShowBadge] = useState(false);
  useEffect(() => {
    try {
      const seen = localStorage.getItem(storageKey);
      if (!seen) setShowBadge(true);
    } catch {}
  }, [storageKey]);

  function handleOpen() {
    setOpen(true);
    setShowBadge(false);
    try { localStorage.setItem(storageKey, "true"); } catch {}
  }

  function handleNext() {
    if (step < tips.length - 1) {
      setStep(step + 1);
    } else {
      setOpen(false);
      setStep(0);
    }
  }

  if (tips.length === 0) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleOpen}
        aria-label="Ouvrir l'aide"
        className="no-print fixed bottom-5 right-5 z-40 w-10 h-10 rounded-full bg-bw-elevated border border-white/10 flex items-center justify-center text-bw-muted hover:text-white hover:border-white/20 transition-all cursor-pointer shadow-lg"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        {showBadge && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-bw-primary animate-pulse" />
        )}
      </button>

      {/* Tip panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-18 right-5 z-50 w-72 rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, rgba(24,24,27,0.98), rgba(15,15,18,0.98))",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #FF6B35, transparent)" }} />
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-bw-muted font-mono">{step + 1}/{tips.length}</span>
                <button onClick={() => { setOpen(false); setStep(0); }} aria-label="Fermer l'aide" className="p-1 rounded-lg text-bw-muted hover:text-white cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <h3 className="text-sm font-bold text-white">{tips[step].title}</h3>
              <p className="text-xs text-bw-muted leading-relaxed">{tips[step].description}</p>
              <div className="flex items-center gap-1.5">
                {tips.map((_, i) => (
                  <div key={i} className="h-1 rounded-full transition-all" style={{ width: i === step ? 16 : 6, backgroundColor: i === step ? "#FF6B35" : i < step ? "rgba(255,107,53,0.4)" : "rgba(255,255,255,0.1)" }} />
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={handleNext}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #FF6B35, #E85D26)" }}>
                  {step < tips.length - 1 ? "Suivant" : "Compris !"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
