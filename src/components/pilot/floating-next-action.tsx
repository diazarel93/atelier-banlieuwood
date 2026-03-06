"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { type NextAction } from "@/components/pilot/get-next-action";

interface FloatingNextActionProps {
  nextAction: NextAction | null;
  onExecute: () => void;
  isPending: boolean;
  allResponded: boolean;
  /** Ref to the footer CTA element — hides floating button when footer is visible */
  footerRef?: React.RefObject<HTMLDivElement | null>;
}

export function FloatingNextAction({
  nextAction,
  onExecute,
  isPending,
  allResponded,
  footerRef,
}: FloatingNextActionProps) {
  const [footerVisible, setFooterVisible] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // IntersectionObserver: hide floating CTA when footer CTA is visible
  useEffect(() => {
    const el = footerRef?.current;
    if (!el) {
      setFooterVisible(false);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
    observerRef.current.observe(el);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [footerRef]);

  if (!nextAction || !nextAction.action || nextAction.disabled) return null;
  if (footerVisible) return null;

  return (
    <AnimatePresence>
      <motion.button
        key={nextAction.label}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={onExecute}
        disabled={isPending}
        data-onboarding="next-action"
        className="fixed bottom-6 right-6 z-30 px-6 py-3 rounded-2xl font-bold text-sm cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-2"
        style={{
          backgroundColor: nextAction.color,
          color: nextAction.color === "#F59E0B" || nextAction.color === "#888" ? "#000" : "#fff",
          boxShadow: `0 4px 24px ${nextAction.color}50, 0 2px 8px rgba(0,0,0,0.3)`,
          animation: allResponded ? "pulse-glow 2s ease-in-out infinite" : undefined,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={nextAction.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {nextAction.label}
          </motion.span>
        </AnimatePresence>
        {nextAction.shortcut && (
          <kbd className="w-5 h-5 rounded bg-white/[0.15] text-[10px] font-mono flex items-center justify-center">
            {nextAction.shortcut}
          </kbd>
        )}
      </motion.button>
    </AnimatePresence>
  );
}
