"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface OnboardingSlidesProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round">
        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      </svg>
    ),
    title: "RÉPONDS",
    text: "Le prof pose une question.\nÉcris ta meilleure idée !",
    accent: "#FF6B35",
    xp: "+10 points par réponse",
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round">
        <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
      </svg>
    ),
    title: "VOTE",
    text: "Choisis la meilleure idée\nparmi celles de la classe.",
    accent: "#8B5CF6",
    xp: "+5 points par vote",
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C5.71 4 7 5.71 7 8v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8c0-2.29 1.29-4 2.5-4a2.5 2.5 0 0 1 0 5H18" />
        <path d="M12 4v4" /><path d="M8 4h8" />
      </svg>
    ),
    title: "GAGNE",
    text: "Si le groupe choisit ton idée : +25 points !\nFais une série pour gagner plus 🔥",
    accent: "#D4A843",
    xp: "Passe au niveau suivant !",
  },
];

export function OnboardingSlides({ onComplete }: OnboardingSlidesProps) {
  const [current, setCurrent] = useState(0);

  function next() {
    if (current < SLIDES.length - 1) {
      setCurrent(current + 1);
    } else {
      onComplete();
    }
  }

  const slide = SLIDES[current];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-bw-bg flex flex-col items-center justify-center px-6"
      onClick={next}
    >
      {/* Skip button */}
      <button
        onClick={(e) => { e.stopPropagation(); onComplete(); }}
        className="absolute top-6 right-6 text-xs text-bw-muted hover:text-bw-text transition-colors cursor-pointer"
      >
        Passer →
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-6 text-center max-w-xs"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: `${slide.accent}15` }}
          >
            {slide.icon}
          </motion.div>

          {/* Title */}
          <h2 className="text-3xl font-cinema tracking-[0.2em]" style={{ color: slide.accent }}>
            {slide.title}
          </h2>

          {/* Text */}
          <p className="text-sm text-bw-text leading-relaxed whitespace-pre-line">
            {slide.text}
          </p>

          {/* XP badge */}
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: `${slide.accent}15`, color: slide.accent }}
          >
            {slide.xp}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-12 flex gap-2">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === current ? slide.accent : "rgba(0,0,0,0.1)",
              transform: i === current ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* CTA on last slide */}
      {current === SLIDES.length - 1 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={(e) => { e.stopPropagation(); onComplete(); }}
          className="absolute bottom-24 px-8 py-3 rounded-xl font-bold text-white cursor-pointer"
          style={{ background: `linear-gradient(135deg, #FF6B35, #D4A843)`, boxShadow: "0 4px 15px rgba(255,107,53,0.3)" }}
        >
          C&apos;est parti !
        </motion.button>
      )}
    </motion.div>
  );
}
