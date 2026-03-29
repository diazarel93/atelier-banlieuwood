"use client";

import { motion } from "motion/react";
import { CATEGORY_COLORS } from "@/lib/constants";

interface CollectiveChoice {
  id: string;
  category: string;
  restitution_label?: string | null;
  chosen_text: string;
}

interface ScreenDonePausedProps {
  status: string;
  donePhase: "clap" | "title" | "credits";
  sessionTitle: string;
  templateInfo: string | null;
  moduleColor: string;
  connectedCount: number;
  responsesCount: number;
  allChoices: CollectiveChoice[] | null | undefined;
}

export function ScreenPaused() {
  return (
    <motion.div
      key="paused"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center space-y-6"
    >
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-bw-amber to-bw-amber/40 mx-auto flex items-center justify-center">
        <div className="flex gap-2">
          <div className="w-3 h-10 bg-white rounded-sm" />
          <div className="w-3 h-10 bg-white rounded-sm" />
        </div>
      </div>
      <p className="text-3xl text-bw-muted">Pause</p>
    </motion.div>
  );
}

export function ScreenDone({
  donePhase,
  sessionTitle,
  templateInfo,
  moduleColor,
  connectedCount,
  responsesCount,
  allChoices,
}: Omit<ScreenDonePausedProps, "status">) {
  return (
    <motion.div
      key="done"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center space-y-5 max-w-3xl w-full"
    >
      {/* Phase 1: Clap */}
      {donePhase === "clap" && (
        <motion.div
          initial={{ scale: 1.5, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="space-y-6"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-32 h-32 rounded-full mx-auto flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(255,107,53,0.2), rgba(139,92,246,0.15))",
              border: "2px solid rgba(255,107,53,0.4)",
              boxShadow: "0 0 80px rgba(255,107,53,0.3)",
            }}
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="2.18" />
              <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
            </svg>
          </motion.div>
          <h2 className="text-5xl font-bold">
            C&apos;est dans la <span className="text-bw-primary">boite</span> !
          </h2>
        </motion.div>
      )}

      {/* Phase 2: Title card */}
      {donePhase === "title" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="space-y-6"
        >
          <p className="text-sm uppercase tracking-[0.5em] text-bw-muted font-medium">Un film de</p>
          <h2 className="text-6xl font-bold font-cinema tracking-wider text-white">{sessionTitle || "Notre Film"}</h2>
          {templateInfo && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl px-6 py-2 rounded-full inline-block"
              style={{
                backgroundColor: `${moduleColor}20`,
                color: moduleColor,
                border: `1px solid ${moduleColor}40`,
              }}
            >
              {templateInfo}
            </motion.span>
          )}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-8"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-bw-teal">{connectedCount}</p>
              <p className="text-xs text-bw-muted uppercase tracking-wider mt-1">
                cin&#233;aste{connectedCount > 1 ? "s" : ""}
              </p>
            </div>
            {responsesCount > 0 && (
              <div className="text-center">
                <p className="text-3xl font-bold text-bw-primary">{responsesCount}</p>
                <p className="text-xs text-bw-muted uppercase tracking-wider mt-1">
                  r&#233;ponse{responsesCount > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Phase 3: Credits */}
      {donePhase === "credits" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <p className="text-sm uppercase tracking-[0.5em] text-bw-muted font-medium">Les choix de la classe</p>
          <div className="max-h-[50vh] overflow-y-auto space-y-3 px-4 scrollbar-thin">
            {allChoices && allChoices.length > 0 ? (
              allChoices.map((choice, i) => (
                <motion.div
                  key={choice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.3 }}
                  className="rounded-xl p-4 backdrop-blur-md text-left"
                  style={{
                    background: "rgba(34,37,43,0.6)",
                    borderLeft: `3px solid ${CATEGORY_COLORS[choice.category] || moduleColor}`,
                  }}
                >
                  <span
                    className="text-xs uppercase tracking-wider font-medium"
                    style={{ color: CATEGORY_COLORS[choice.category] || moduleColor }}
                  >
                    {choice.restitution_label || choice.category}
                  </span>
                  <p className="text-lg text-white mt-1">{choice.chosen_text}</p>
                </motion.div>
              ))
            ) : (
              <p className="text-bw-muted text-lg">Bravo &#224; toute la classe !</p>
            )}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (allChoices ?? []).length * 0.3 + 0.5 }}
            className="text-xl text-bw-muted mt-8"
          >
            Merci &#224; tous !
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}
