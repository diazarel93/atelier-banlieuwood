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
      { threshold: 0.1 }
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
        className="fixed bottom-6 right-6 z-30 h-12 px-6 rounded-[14px] font-bold text-[14px] cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-2.5"
        style={{
          backgroundColor: "#2C2C2C",
          color: "#fff",
          boxShadow: "0 8px 32px rgba(44,44,44,0.25), 0 2px 8px rgba(0,0,0,0.15)",
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
          <kbd className="w-5 h-5 rounded bg-black/[0.08] text-[10px] font-mono flex items-center justify-center">
            {nextAction.shortcut}
          </kbd>
        )}
      </motion.button>
    </AnimatePresence>
  );
}
