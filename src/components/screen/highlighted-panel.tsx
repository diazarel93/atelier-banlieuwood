"use client";

import { motion, AnimatePresence } from "motion/react";

export interface HighlightedResponse {
  id: string;
  text: string;
  student_id: string;
  is_highlighted: boolean;
  teacher_comment: string | null;
  students: { display_name: string; avatar: string };
}

export interface HighlightedResponsesPanelProps {
  highlightedResponses: HighlightedResponse[];
}

export function HighlightedResponsesPanel({ highlightedResponses }: HighlightedResponsesPanelProps) {
  return (
    <AnimatePresence>
      {highlightedResponses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-[76px] left-0 right-0 z-30 px-6 pointer-events-none"
        >
          <div className={`max-w-5xl mx-auto pointer-events-auto ${
              highlightedResponses.length <= 2 ? "flex flex-col gap-3" : "grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2"
            }`}>
            {highlightedResponses.map((hr) => (
              <motion.div
                key={hr.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-xl p-3 backdrop-blur-xl"
                style={{ background: "rgba(34,37,43,0.85)", border: "1px solid rgba(255,107,53,0.25)", boxShadow: "0 0 24px rgba(255,107,53,0.1), 0 4px 20px rgba(0,0,0,0.4)" }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{hr.students?.avatar}</span>
                  <span className="text-sm font-medium">{hr.students?.display_name}</span>
                  <span className="ml-auto text-xs text-bw-primary bg-bw-primary/10 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                    Projeté
                  </span>
                </div>
                <p className="text-base leading-relaxed text-bw-heading">{hr.text}</p>
                {hr.teacher_comment && (
                  <div className="mt-2 flex items-start gap-2 bg-bw-teal/5 rounded-lg px-2.5 py-1.5 border border-bw-teal/10">
                    <span className="text-xs text-bw-teal flex-shrink-0 mt-0.5 font-medium">Prof :</span>
                    <span className="text-xs text-bw-teal/80 leading-snug">{hr.teacher_comment}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
