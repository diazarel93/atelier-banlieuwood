"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { fireConfetti } from "@/components/play/utils";
import { CountUp } from "@/components/play/count-up";
import { CharacterCard } from "@/components/module10/character-card";
import { StoryboardViewer } from "@/components/module10/storyboard-viewer";
import type { AvatarOptions } from "@/components/avatar-dicebear";
import { getLevel } from "@/lib/xp";

interface LeaderboardData {
  entries: { id: string; displayName: string; avatar: string; responses: number; votes: number; retained: number; xp?: number }[];
  badges: { id: string; label: string; description: string }[];
  totals: { responses: number; votes: number; retained: number; participants: number };
}

export interface DoneStateProps {
  sessionId: string;
  stats?: { responses: number; retained: number; bestStreak: number };
  xp?: number;
  characterCard?: {
    personnage: { prenom: string; trait: string; avatar: AvatarOptions };
    objectif?: string;
    obstacle?: string;
    pitchText?: string;
    chronoSeconds?: number;
    revealLevel: 0 | 1 | 2 | 3;
  } | null;
}

export function DoneState({ sessionId, stats, xp, characterCard }: DoneStateProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    // Fire confetti on mount
    const t = setTimeout(() => fireConfetti(), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/leaderboard`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setLeaderboard(d); })
      .catch(() => {});
  }, [sessionId]);

  const hasStats = stats && stats.responses > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-6 text-center"
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-bw-gold to-bw-primary mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(212,168,67,0.3)]"
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="2.18" />
          <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
        </svg>
      </motion.div>
      <div className="space-y-2">
        <h2
          className="text-2xl sm:text-3xl tracking-wider font-cinema"
        >
          C&apos;EST DANS LA <span className="text-bw-gold">BOITE</span> !
        </h2>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="h-px bg-gradient-to-r from-transparent via-bw-gold/50 to-transparent mx-auto max-w-[200px]"
        />
        <p className="text-bw-muted">La partie est termin&eacute;e. Merci !</p>
      </div>

      {/* Personal stats */}
      {hasStats && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-[300px] sm:max-w-xs"
        >
          <div className="glass-card p-3">
            <p className="text-xl sm:text-2xl font-bold text-bw-primary">
              <CountUp target={stats.responses} />
            </p>
            <p className="text-xs text-bw-muted mt-0.5">R&eacute;ponses</p>
          </div>
          <div className="glass-card p-3">
            <p className="text-xl sm:text-2xl font-bold text-bw-gold">
              <CountUp target={stats.retained} />
            </p>
            <p className="text-xs text-bw-muted mt-0.5">Idées retenues</p>
          </div>
          <div className="glass-card p-3">
            <p className="text-xl sm:text-2xl font-bold text-bw-teal">
              <CountUp target={stats.bestStreak} />
            </p>
            <p className="text-xs text-bw-muted mt-0.5">Meilleur streak</p>
          </div>
        </motion.div>
      )}

      {/* XP summary */}
      {(xp ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasStats ? 0.6 : 0.4 }}
          className="w-full max-w-xs glass-card p-4 text-center"
        >
          <p className="text-2xl font-bold text-bw-gold font-cinema">
            <CountUp target={xp!} /> XP
          </p>
          <p className="text-xs text-bw-muted mt-1">
            Niveau {getLevel(xp!).level} — {getLevel(xp!).name}
          </p>
        </motion.div>
      )}

      {/* Character card (Module 10) */}
      {characterCard && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasStats ? 1.2 : 0.6 }}
          className="flex justify-center"
        >
          <CharacterCard
            {...characterCard}
            objectif={characterCard.objectif ?? undefined}
            obstacle={characterCard.obstacle ?? undefined}
            pitchText={characterCard.pitchText ?? undefined}
            chronoSeconds={characterCard.chronoSeconds ?? undefined}
            revealLevel={3}
            showDownload
          />
        </motion.div>
      )}

      {/* Storyboard IA (Module 10) */}
      {characterCard && characterCard.pitchText && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasStats ? 1.8 : 1.0 }}
          className="w-full max-w-md"
        >
          <StoryboardViewer
            prenom={characterCard.personnage.prenom}
            trait={characterCard.personnage.trait}
            objectif={characterCard.objectif}
            obstacle={characterCard.obstacle}
            pitchText={characterCard.pitchText}
          />
        </motion.div>
      )}

      {/* Collective Leaderboard */}
      {leaderboard && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasStats ? 1.8 : 1.0 }}
          className="w-full max-w-xs space-y-3"
        >
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            aria-expanded={showLeaderboard}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-bw-elevated border border-white/[0.06] cursor-pointer hover:border-white/10 transition-colors"
          >
            <span className="text-sm font-medium text-bw-text">Tableau de la classe</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className={`text-bw-muted transition-transform ${showLeaderboard ? "rotate-180" : ""}`}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          <AnimatePresence>
            {showLeaderboard && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-3"
              >
                {/* Collective badges */}
                {leaderboard.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {leaderboard.badges.map((b) => (
                      <span key={b.id} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-bw-gold/15 text-bw-gold border border-bw-gold/20" title={b.description}>
                        {b.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Class totals */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="glass-card p-2">
                    <p className="text-lg font-bold text-bw-primary">{leaderboard.totals.responses}</p>
                    <p className="text-xs text-bw-muted">R&eacute;ponses</p>
                  </div>
                  <div className="glass-card p-2">
                    <p className="text-lg font-bold text-bw-violet">{leaderboard.totals.votes}</p>
                    <p className="text-xs text-bw-muted">Votes</p>
                  </div>
                  <div className="glass-card p-2">
                    <p className="text-lg font-bold text-bw-gold">{leaderboard.totals.retained}</p>
                    <p className="text-xs text-bw-muted">Choix collectifs</p>
                  </div>
                </div>

                {/* Top contributors (retained ideas) */}
                {leaderboard.entries.slice(0, 5).map((e, i) => (
                  <div key={e.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-bw-elevated/60">
                    <span className="text-xs font-bold text-bw-muted w-4 text-center">{i + 1}</span>
                    <span className="text-base">{e.avatar}</span>
                    <span className="text-sm text-bw-text flex-1 truncate">{e.displayName}</span>
                    {(e.xp ?? 0) > 0 && (
                      <span className="text-xs font-bold text-bw-gold tabular-nums">{e.xp} XP</span>
                    )}
                    {i === 0 && <span className="text-xs">&#9733;</span>}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Film Vivant + Recap links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: hasStats ? 1.5 : 0.8 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <a
          href={`/play/${sessionId}/recap`}
          className="btn-glow block w-full py-3.5 rounded-xl bg-gradient-to-r from-bw-gold to-bw-primary text-white font-semibold text-center text-sm cursor-pointer shadow-[0_4px_20px_rgba(212,168,67,0.25)]"
        >
          Voir le film de la classe
        </a>
        <a
          href={`/play/${sessionId}/recap`}
          className="block w-full py-3 rounded-xl bg-bw-elevated border border-bw-gold/20 text-bw-gold font-medium text-center text-sm cursor-pointer hover:border-bw-gold/40 transition-colors"
        >
          Mes contributions
        </a>
        <a
          href={`/play/${sessionId}/bibliotheque`}
          className="flex items-center justify-center gap-2 w-full py-2.5 text-bw-muted text-xs hover:text-white/60 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          Ma biblioth&egrave;que compl&egrave;te
        </a>
      </motion.div>
    </motion.div>
  );
}
