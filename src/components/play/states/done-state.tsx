"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { fireConfetti } from "@/components/play/utils";
import { CountUp } from "@/components/play/count-up";
import { CharacterCard } from "@/components/module10/character-card";
import { StoryboardViewer } from "@/components/module10/storyboard-viewer";
import type { AvatarOptions } from "@/components/avatar-dicebear";
import { ROUTES } from "@/lib/routes";
import { getLevel } from "@/lib/xp";
import { SessionBadge } from "@/components/play/session-badge";
import { useSound } from "@/hooks/use-sound";

export interface DoneStateProps {
  sessionId: string;
  sessionTitle?: string;
  studentName?: string;
  studentAvatar?: string;
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
  newAchievements?: { achievementId: string; name: string; icon: string; tier: string }[];
  profileId?: string | null;
}

const TIER_COLORS: Record<string, string> = {
  bronze: "bg-amber-700/20 text-amber-600 border-amber-700/30",
  silver: "bg-gray-400/20 text-gray-500 border-gray-400/30",
  gold: "bg-bw-gold/20 text-bw-gold border-bw-gold/30",
};

export function DoneState({
  sessionId,
  sessionTitle,
  studentName,
  studentAvatar,
  stats,
  xp,
  characterCard,
  newAchievements,
  profileId,
}: DoneStateProps) {
  const { play } = useSound();
  const fanfarePlayed = useRef(false);

  useEffect(() => {
    // Fire confetti on mount
    const t = setTimeout(() => fireConfetti(), 500);
    return () => clearTimeout(t);
  }, []);

  // Play fanfare for gold achievements
  useEffect(() => {
    if (fanfarePlayed.current) return;
    if (newAchievements && newAchievements.some((a) => a.tier === "gold")) {
      fanfarePlayed.current = true;
      play("fanfare");
    }
  }, [newAchievements, play]);

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
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="2.18" />
          <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
        </svg>
      </motion.div>
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl tracking-wider font-cinema">
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
            <p className="text-xs text-bw-muted mt-0.5">Idées choisies</p>
          </div>
          <div className="glass-card p-3">
            <p className="text-xl sm:text-2xl font-bold text-bw-teal">
              <CountUp target={stats.bestStreak} />
            </p>
            <p className="text-xs text-bw-muted mt-0.5">Meilleure série</p>
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
            <CountUp target={xp!} /> points
          </p>
          <p className="text-xs text-bw-muted mt-1">
            Niveau {getLevel(xp!).level} — {getLevel(xp!).name}
          </p>
        </motion.div>
      )}

      {/* Newly unlocked achievements */}
      {newAchievements && newAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasStats ? 1.0 : 0.6 }}
          className="w-full max-w-xs space-y-3"
        >
          <h3 className="text-sm font-cinema tracking-wider text-bw-gold">BADGES D&Eacute;BLOQU&Eacute;S !</h3>
          <div className="flex gap-2.5 overflow-x-auto pb-1 justify-center flex-wrap">
            {newAchievements.map((a, i) => (
              <motion.div
                key={a.achievementId}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: (hasStats ? 1.2 : 0.8) + i * 0.15 }}
                className="glass-card flex flex-col items-center gap-1.5 p-3 min-w-[80px]"
              >
                <span className="text-3xl">{a.icon}</span>
                <span className="text-xs font-semibold text-bw-text leading-tight text-center">{a.name}</span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${TIER_COLORS[a.tier] || TIER_COLORS.bronze}`}
                >
                  {a.tier}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Shareable badge */}
      {hasStats && studentName && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="w-full max-w-xs"
        >
          <SessionBadge
            sessionTitle={sessionTitle || "Session Banlieuwood"}
            studentName={studentName}
            studentAvatar={studentAvatar || "🎬"}
            xp={xp || 0}
            responses={stats.responses}
            retained={stats.retained}
            bestStreak={stats.bestStreak}
          />
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

      {/* Film Vivant + Recap links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: hasStats ? 1.5 : 0.8 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <a
          href={ROUTES.playRecap(sessionId)}
          className="btn-glow block w-full py-3.5 rounded-xl bg-gradient-to-r from-bw-gold to-bw-primary text-white font-semibold text-center text-sm cursor-pointer shadow-[0_4px_20px_rgba(212,168,67,0.25)]"
        >
          Voir le film de la classe
        </a>
        <a
          href={ROUTES.playRecap(sessionId)}
          className="block w-full py-3 rounded-xl bg-bw-elevated border border-bw-gold/20 text-bw-gold font-medium text-center text-sm cursor-pointer hover:border-bw-gold/40 transition-colors"
        >
          Mes contributions
        </a>
        <a
          href={ROUTES.playBibliotheque(sessionId)}
          className="flex items-center justify-center gap-2 w-full py-2.5 text-bw-muted text-xs hover:text-white/60 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          Toutes mes créations
        </a>
      </motion.div>

      {/* Profile CTA */}
      {profileId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasStats ? 2.0 : 1.2 }}
          className="w-full max-w-xs"
        >
          <a
            href="/profile"
            className="btn-glow flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-bw-gold via-amber-500 to-bw-gold text-white font-bold text-sm text-center shadow-[0_4px_24px_rgba(212,168,67,0.35)] hover:shadow-[0_4px_32px_rgba(212,168,67,0.5)] transition-shadow font-cinema tracking-wide"
          >
            <span className="text-base">&#127968;</span>
            MON PROFIL
          </a>
        </motion.div>
      )}
    </motion.div>
  );
}
