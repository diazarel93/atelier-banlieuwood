"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface LateralDrawerProps {
  side: "left" | "right";
  open: boolean;
  onClose: () => void;
  title: string;
  badge?: number;
  children: React.ReactNode;
}

export function LateralDrawer({ side, open, onClose, title, badge, children }: LateralDrawerProps) {
  const width = side === "left" ? 280 : 320;
  const xOffset = side === "left" ? -width : width;

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* ── Desktop : colonne fixe (toujours visible) ── */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 border-[#E8DFD2] bg-[#F7F3EA] overflow-y-auto"
        style={{
          width,
          borderRightWidth: side === "left" ? 1 : 0,
          borderLeftWidth: side === "right" ? 1 : 0,
        }}
      >
        <DrawerHeader title={title} badge={badge} />
        <div className="flex-1 overflow-y-auto p-3">{children}</div>
      </aside>

      {/* ── Tablet/Mobile : overlay avec backdrop ── */}
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
              className="lg:hidden fixed inset-0 z-40 bg-black/40"
              onClick={onClose}
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              initial={{ x: xOffset }}
              animate={{ x: 0 }}
              exit={{ x: xOffset }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="lg:hidden fixed top-0 bottom-0 z-50 flex flex-col bg-[#F7F3EA] shadow-xl overflow-hidden"
              style={{
                width,
                left: side === "left" ? 0 : "auto",
                right: side === "right" ? 0 : "auto",
                borderRightWidth: side === "left" ? 1 : 0,
                borderLeftWidth: side === "right" ? 1 : 0,
                borderColor: "#E8DFD2",
              }}
            >
              <DrawerHeader title={title} badge={badge} onClose={onClose} />
              <div className="flex-1 overflow-y-auto p-3">{children}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function DrawerHeader({
  title,
  badge,
  onClose,
}: {
  title: string;
  badge?: number;
  onClose?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8DFD2] flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-[#2C2C2C] uppercase tracking-wider">{title}</span>
        {badge !== undefined && badge > 0 && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#FF6B35] text-white text-[11px] font-bold">
            {badge}
          </span>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#4A4A4A] hover:bg-[#E8DFD2] transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
