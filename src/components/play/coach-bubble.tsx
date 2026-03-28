"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface CoachBubbleProps {
  tip: string;
  onDismiss?: () => void;
}

/**
 * Small animated coach bubble that appears briefly at the top of the screen.
 * Shows a tip from the coach character, then auto-dismisses after 5 seconds.
 * Can be dismissed early by tapping.
 */
export function CoachBubble({ tip, onDismiss }: CoachBubbleProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  function handleDismiss() {
    setVisible(false);
  }

  return (
    <AnimatePresence onExitComplete={onDismiss}>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          role="button"
          tabIndex={0}
          aria-label="Conseil du coach, cliquer pour fermer"
          onClick={handleDismiss}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleDismiss();
            }
          }}
          className="w-full max-w-md mx-auto cursor-pointer"
        >
          <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border border-bw-primary/20 bg-bw-primary/[0.08] backdrop-blur-sm">
            {/* Coach avatar */}
            <span className="text-lg flex-shrink-0 leading-none mt-0.5" aria-hidden="true">
              🎬
            </span>
            {/* Tip text */}
            <p className="text-xs leading-snug text-bw-text/90 line-clamp-2">{tip}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
