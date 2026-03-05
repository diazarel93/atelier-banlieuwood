"use client";

import { motion } from "motion/react";
import type { SessionState } from "@/hooks/use-session-polling";

export interface WaitingStateProps {
  session: SessionState["session"];
  connectedCount: number;
}

export function WaitingState({ session, connectedCount }: WaitingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center gap-6 text-center"
    >
      {/* Animated film reel */}
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.2), rgba(212,168,67,0.15))" }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="5" r="1" fill="#D4A843" stroke="none" />
              <circle cx="17.5" cy="9" r="1" fill="#D4A843" stroke="none" />
              <circle cx="17.5" cy="15" r="1" fill="#D4A843" stroke="none" />
              <circle cx="12" cy="19" r="1" fill="#D4A843" stroke="none" />
              <circle cx="6.5" cy="15" r="1" fill="#D4A843" stroke="none" />
              <circle cx="6.5" cy="9" r="1" fill="#D4A843" stroke="none" />
            </svg>
          </motion.div>
        </motion.div>
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: "2px solid rgba(255,107,53,0.2)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        />
      </div>

      <div className="space-y-2">
        <h2
          className="text-2xl sm:text-3xl tracking-wider font-cinema"
        >
          EN ATTENTE
        </h2>
        <div className="h-0.5 w-12 mx-auto rounded-full bg-gradient-to-r from-bw-primary to-bw-gold" />
        <p className="text-bw-muted text-sm">
          Le facilitateur va bientot lancer la question...
        </p>
      </div>

      <div className="rounded-xl px-4 py-2 sm:px-6 sm:py-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg, rgba(78,205,196,0.08), rgba(78,205,196,0.03))", border: "1px solid rgba(78,205,196,0.15)" }}>
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-2.5 h-2.5 rounded-full bg-bw-teal"
        />
        <span className="text-sm text-bw-teal font-medium">
          {connectedCount} connect&eacute;{connectedCount > 1 ? "s" : ""}
        </span>
      </div>

      {session.title && (
        <p className="text-xs text-bw-gold tracking-[0.2em] uppercase font-medium">{session.title}</p>
      )}

      {/* Library link */}
      <a
        href={`/play/${session.id}/bibliotheque`}
        className="flex items-center gap-2 text-xs text-bw-muted hover:text-white/60 transition-colors mt-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
        Ma biblioth&egrave;que
      </a>
    </motion.div>
  );
}
