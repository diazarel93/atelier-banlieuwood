"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SpotlightModalProps {
  open: boolean;
  onClose: () => void;
  studentName: string;
  studentAvatar: string;
  responseText: string;
  teacherScore?: number | null;
  isHighlighted?: boolean;
}

export function SpotlightModal({
  open,
  onClose,
  studentName,
  studentAvatar,
  responseText,
  teacherScore,
  isHighlighted,
}: SpotlightModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed z-50 inset-6 sm:inset-12 lg:inset-20 flex flex-col items-center justify-center"
            onClick={onClose}
          >
            <div
              className="w-full max-w-2xl rounded-[24px] overflow-hidden"
              style={{
                background: isHighlighted
                  ? "linear-gradient(135deg, #FFF8F0, #FFFAF5)"
                  : "linear-gradient(135deg, #FFFFFF, #FAF8F5)",
                border: `2px solid ${isHighlighted ? "#F5A45B" : "#E8DFD2"}`,
                boxShadow: "0 24px 80px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.15)",
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-4 px-8 pt-8 pb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={{
                    background: "#FAF6EE",
                    border: "3px solid #E8DFD2",
                  }}
                >
                  {studentAvatar}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[#2C2C2C]">{studentName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {isHighlighted && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FFF0E0", color: "#F5A45B" }}>
                        Mis en avant
                      </span>
                    )}
                    {teacherScore && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FFF8E6", color: "#D4A017" }}>
                        {"★".repeat(teacherScore)}{"☆".repeat(5 - teacherScore)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#B0A99E] hover:text-[#2C2C2C] hover:bg-[#F3ECE3] cursor-pointer transition-colors"
                  aria-label="Fermer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Separator */}
              <div className="mx-8 h-px" style={{ background: "linear-gradient(to right, transparent, #E8DFD2, transparent)" }} />

              {/* Response text — large and readable */}
              <div className="px-8 py-8">
                <p className="text-xl sm:text-2xl leading-relaxed text-[#2C2C2C] font-medium whitespace-pre-wrap">
                  {responseText}
                </p>
              </div>

              {/* Footer hint */}
              <div className="px-8 pb-5 flex items-center justify-between">
                <span className="text-[11px] text-[#B0A99E]">Appuyez Echap ou cliquez pour fermer</span>
                <span className="text-[11px] text-[#B0A99E]">Spotlight</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
