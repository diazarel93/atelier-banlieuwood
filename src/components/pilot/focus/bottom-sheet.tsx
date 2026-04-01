"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[20px] bg-bw-cockpit-canvas border-t border-[var(--color-bw-cockpit-border)] shadow-[0_-8px_40px_rgba(0,0,0,0.4)]"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
          >
            {/* Drag handle */}
            <div className="sticky top-0 z-10 flex justify-center pt-3 pb-1 bg-bw-cockpit-canvas rounded-t-[20px]">
              <div className="w-10 h-1 rounded-full bg-bw-cockpit-elevated" />
            </div>

            {title && (
              <div className="px-5 pt-1 pb-3">
                <h3 className="text-[15px] font-bold text-[#f0f0f8]">{title}</h3>
              </div>
            )}

            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
