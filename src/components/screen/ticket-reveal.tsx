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

interface TicketRevealProps {
  responses: HighlightedResponse[];
  maxVisible?: number;
}

export function TicketReveal({
  responses,
  maxVisible = 3,
}: TicketRevealProps) {
  const visible = responses.slice(0, maxVisible);

  return (
    <div className="relative flex flex-col-reverse gap-4 w-full max-w-2xl mx-auto py-6">
      <AnimatePresence mode="popLayout" initial={false}>
        {visible.map((response, index) => (
          <motion.div
            key={response.id}
            layout
            initial={{ y: 120, opacity: 0, scale: 0.92 }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 340,
                damping: 28,
                mass: 0.9,
              },
            }}
            exit={{
              y: -60,
              opacity: 0,
              scale: 0.9,
              transition: { duration: 0.35, ease: "easeIn" },
            }}
            style={{ zIndex: maxVisible - index }}
            className="relative"
          >
            {/* Ticket container */}
            <div className="flex overflow-hidden rounded-xl border border-bw-gold/40 bg-black/60 backdrop-blur-md shadow-[0_4px_32px_rgba(212,168,67,0.12)]">
              {/* Left stub — avatar strip with perforated edge */}
              <div className="relative flex flex-col items-center justify-center gap-2 px-4 py-5 min-w-[90px] bg-gradient-to-b from-bw-gold/10 to-bw-gold/5 border-r-0">
                {/* Perforated right edge */}
                <div
                  className="absolute top-0 right-0 h-full w-0"
                  style={{
                    borderRight: "3px dashed rgba(212,168,67,0.45)",
                  }}
                />

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-bw-gold/20 border-2 border-bw-gold/50 flex items-center justify-center text-2xl select-none">
                  {response.students.avatar}
                </div>

                {/* Student name */}
                <span className="text-bw-heading text-xs font-cinema text-center leading-tight max-w-[80px] truncate">
                  {response.students.display_name}
                </span>
              </div>

              {/* Right area — response content */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Response text */}
                <div className="px-5 py-4 flex-1">
                  <p className="text-bw-text text-sm leading-relaxed line-clamp-4">
                    {response.text}
                  </p>
                </div>

                {/* Teacher comment banner */}
                {response.teacher_comment && (
                  <div className="px-5 py-2.5 bg-bw-teal/10 border-t border-bw-teal/20">
                    <p className="text-bw-teal text-xs italic leading-snug flex items-start gap-1.5">
                      <span className="shrink-0 mt-0.5 opacity-70">
                        &#9733;
                      </span>
                      <span className="line-clamp-2">
                        {response.teacher_comment}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Top-right decorative ticket notch */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-bw-gold/20 rounded-full" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-bw-gold/20 rounded-full" />
            </div>

            {/* Subtle golden glow for the newest ticket */}
            {index === 0 && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                initial={{ boxShadow: "0 0 0 0 rgba(212,168,67,0)" }}
                animate={{
                  boxShadow: [
                    "0 0 20px 2px rgba(212,168,67,0.15)",
                    "0 0 30px 4px rgba(212,168,67,0.08)",
                    "0 0 20px 2px rgba(212,168,67,0.15)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
