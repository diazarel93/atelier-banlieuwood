"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { getLevel } from "@/lib/xp";
import {
  ACHIEVEMENTS,
  CATEGORIES,
  getCurrentTier,
  getNextTier,
  type AchievementCategory,
  type AchievementDef,
} from "@/lib/achievements-v2";

// ── Types ──

interface ProfileData {
  id: string;
  displayName: string;
  avatar: string;
  avatarFrame: string | null;
  customTitle: string | null;
  totalXp: number;
  currentStreak: number;
  bestStreak: number;
  sessionsPlayed: number;
  totalResponses: number;
  retainedCount: number;
  level: number;
  lastActiveAt: string | null;
  streakUpdatedDate: string | null;
  creativeProfile: string | null;
  profileCode: string | null;
}

interface UnlockedAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  progress: number;
  threshold: number;
  unlockedAt: string;
  reward: { type: string; value: string } | null;
}

interface SessionEntry {
  sessionId: string;
  title: string;
  classLabel: string | null;
  date: string;
}

interface LeaderboardEntry {
  profileId: string;
  displayName: string;
  avatar: string;
  totalXp: number;
  rank: number;
}

interface NextSessionData {
  title: string;
  scheduledAt: string;
  classLabel: string;
}

interface PlayerProfileResponse {
  profile: ProfileData;
  achievements: UnlockedAchievement[];
  sessionHistory: SessionEntry[];
  classLeaderboard: LeaderboardEntry[];
  nextSession: NextSessionData | null;
}

// ── Tier colors ──

const TIER_HEX: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
};

const TIER_BG: Record<string, string> = {
  bronze: "bg-amber-100 text-amber-800",
  silver: "bg-slate-100 text-slate-700",
  gold: "bg-yellow-100 text-yellow-800",
};

// ── Category filter ──

type FilterCategory = "all" | AchievementCategory;

// ── Component ──

export default function ProfilePage() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [data, setData] = useState<PlayerProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [badgeFilter, setBadgeFilter] = useState<FilterCategory>("all");

  useEffect(() => {
    const id = localStorage.getItem("bw-profile-id");
    setProfileId(id);
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/player-profile?profileId=${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Profil introuvable");
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ProfileSkeleton />;

  if (!profileId) return <NoProfile />;

  if (error || !data) {
    return (
      <main className="min-h-dvh bg-gradient-to-b from-[#F7F3EA] to-[#EFE8D8] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-4xl">😕</p>
          <p className="text-bw-muted">{error || "Impossible de charger le profil"}</p>
          <Link href="/join" className="text-bw-primary font-medium hover:underline">
            Rejoindre une session
          </Link>
        </div>
      </main>
    );
  }

  const { profile, achievements, sessionHistory, classLeaderboard, nextSession } = data;
  const level = getLevel(profile.totalXp);
  const xpToNext = level.nextThreshold - level.currentXp;

  // Build achievement lookup for unlocked ones
  const unlockedMap = new Map<string, UnlockedAchievement>();
  for (const a of achievements) {
    const existing = unlockedMap.get(a.id);
    // Keep the highest tier
    if (
      !existing ||
      tierRank(a.tier) > tierRank(existing.tier)
    ) {
      unlockedMap.set(a.id, a);
    }
  }

  // Filter achievements by category
  const filteredAchievements =
    badgeFilter === "all"
      ? ACHIEVEMENTS
      : ACHIEVEMENTS.filter((a) => a.category === badgeFilter);

  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#F7F3EA] to-[#EFE8D8] pb-12">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
        >
          <Link
            href="/"
            className="text-sm text-bw-muted hover:text-bw-gold transition-colors"
          >
            ← Retour
          </Link>
        </motion.div>

        {/* ── Hero Section ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-6 text-center space-y-4"
        >
          {/* Avatar */}
          <div className="relative inline-block">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto"
              style={{
                background: "linear-gradient(135deg, #F7F3EA, #EFE8D8)",
                border: profile.avatarFrame
                  ? `3px solid ${TIER_HEX[profile.avatarFrame] || "#D4A843"}`
                  : "3px solid #E8DFD2",
              }}
            >
              {profile.avatar || "🎬"}
            </div>
            {profile.currentStreak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md"
              >
                🔥 {profile.currentStreak}
              </motion.div>
            )}
          </div>

          {/* Name + Title */}
          <div>
            <h1 className="font-cinema text-2xl tracking-wider text-bw-gold-text uppercase">
              {profile.displayName}
            </h1>
            {profile.customTitle && (
              <p className="text-sm text-bw-muted mt-0.5">
                {profile.customTitle}
              </p>
            )}
          </div>

          {/* Level badge */}
          <div className="inline-flex items-center gap-2 bg-bw-gold/10 px-3 py-1.5 rounded-full">
            <span className="text-xs font-bold text-bw-gold">
              Nv.{level.level}
            </span>
            <span className="text-sm font-cinema tracking-wider text-bw-gold-text uppercase">
              {level.name}
            </span>
          </div>

          {/* XP Bar */}
          <div className="w-full max-w-[260px] mx-auto space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-bw-muted">{profile.totalXp} XP</span>
              <span className="text-bw-muted tabular-nums">
                {xpToNext > 0
                  ? `${xpToNext} XP avant niveau ${level.level + 1}`
                  : "Niveau max !"}
              </span>
            </div>
            <div className="h-3 rounded-full bg-[#E8DFD2] overflow-hidden relative">
              <motion.div
                className="h-full rounded-full relative"
                style={{
                  background: "linear-gradient(90deg, #D4A843, #FF6B35)",
                }}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.max(level.progress * 100, 2)}%`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: 0.4,
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                }}
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  duration: 1.5,
                  delay: 0.8,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>

          {/* Streak info */}
          {profile.currentStreak > 0 ? (
            <p className="text-sm text-orange-600 font-medium">
              🔥 {profile.currentStreak} session{profile.currentStreak > 1 ? "s" : ""} d&apos;affilee
            </p>
          ) : (
            <p className="text-xs text-bw-muted">
              Pas de streak actif
            </p>
          )}

          {/* Profile code */}
          {profile.profileCode && (
            <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-1.5">
              <span className="text-xs text-bw-muted">Code joueur :</span>
              <span className="font-mono font-bold text-bw-heading tracking-widest text-sm">{profile.profileCode}</span>
            </div>
          )}
        </motion.section>

        {/* ── Stats Grid ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <StatCard
            icon="🎬"
            label="Sessions"
            value={profile.sessionsPlayed}
            delay={0.15}
          />
          <StatCard
            icon="✍️"
            label="Reponses"
            value={profile.totalResponses}
            delay={0.2}
          />
          <StatCard
            icon="🏆"
            label="Retenues"
            value={profile.retainedCount}
            delay={0.25}
          />
          <StatCard
            icon="🔥"
            label="Meilleur Streak"
            value={profile.bestStreak}
            delay={0.3}
          />
        </motion.section>

        {/* ── Badges Gallery ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="font-cinema text-xl tracking-wider text-bw-gold-text uppercase">
            Mes Badges
          </h2>

          {/* Category tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <FilterTab
              label="Tous"
              active={badgeFilter === "all"}
              onClick={() => setBadgeFilter("all")}
            />
            {CATEGORIES.map((cat) => (
              <FilterTab
                key={cat.id}
                label={`${cat.icon} ${cat.label}`}
                active={badgeFilter === cat.id}
                onClick={() => setBadgeFilter(cat.id)}
              />
            ))}
          </div>

          {/* Achievement cards */}
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredAchievements.map((def, i) => {
                const unlocked = unlockedMap.get(def.id);
                return (
                  <AchievementCard
                    key={def.id}
                    def={def}
                    unlocked={unlocked ?? null}
                    index={i}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ── Next Session Notification ── */}
        {nextSession && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="glass-card p-4 border-l-4 border-bw-teal">
              <p className="text-xs text-bw-teal font-cinema tracking-wider uppercase">Prochaine session</p>
              <p className="font-semibold text-bw-heading mt-1">{nextSession.title}</p>
              <p className="text-sm text-bw-muted">
                {new Date(nextSession.scheduledAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </motion.section>
        )}

        {/* ── Session History ── */}
        {sessionHistory.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-3"
          >
            <h2 className="font-cinema text-xl tracking-wider text-bw-gold-text uppercase">
              Mes Sessions
            </h2>
            <div className="space-y-2">
              {sessionHistory.map((s, i) => (
                <motion.div
                  key={s.sessionId + i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="glass-card p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-bw-gold/10 flex items-center justify-center text-lg shrink-0">
                    🎬
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-bw-gold-text truncate">
                      {s.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-bw-muted">
                      <span>{formatDate(s.date)}</span>
                      {s.classLabel && (
                        <>
                          <span className="text-[#D3CAB8]">|</span>
                          <span>{s.classLabel}</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Class Leaderboard ── */}
        {classLeaderboard.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-3"
          >
            <h2 className="font-cinema text-xl tracking-wider text-bw-gold-text uppercase">
              Classement
            </h2>
            <div className="glass-card divide-y divide-[#E8DFD2]">
              {classLeaderboard.map((entry, i) => {
                const isMe = entry.profileId === profileId;
                return (
                  <motion.div
                    key={entry.profileId}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.04 }}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      isMe
                        ? "bg-bw-gold/[0.08] border-l-[3px] border-bw-gold"
                        : ""
                    }`}
                  >
                    {/* Rank */}
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        entry.rank === 1
                          ? "bg-yellow-100 text-yellow-700"
                          : entry.rank === 2
                            ? "bg-slate-100 text-slate-600"
                            : entry.rank === 3
                              ? "bg-amber-100 text-amber-700"
                              : "bg-[#F7F3EA] text-bw-muted"
                      }`}
                    >
                      {entry.rank <= 3
                        ? ["🥇", "🥈", "🥉"][entry.rank - 1]
                        : entry.rank}
                    </span>

                    {/* Avatar */}
                    <span className="text-xl shrink-0">{entry.avatar}</span>

                    {/* Name + XP */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate ${
                          isMe
                            ? "font-bold text-bw-gold-text"
                            : "font-medium text-bw-gold-text"
                        }`}
                      >
                        {entry.displayName}
                        {isMe && " (toi)"}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-bw-gold tabular-nums">
                      {entry.totalXp} XP
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}

// ── Sub-components ──

function StatCard({
  icon,
  label,
  value,
  delay,
}: {
  icon: string;
  label: string;
  value: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-4 text-center space-y-1"
    >
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-bold text-bw-gold-text tabular-nums">
        {value}
      </p>
      <p className="text-xs text-bw-muted">{label}</p>
    </motion.div>
  );
}

function AchievementCard({
  def,
  unlocked,
  index,
}: {
  def: AchievementDef;
  unlocked: UnlockedAchievement | null;
  index: number;
}) {
  const isUnlocked = !!unlocked;
  const currentTier = unlocked
    ? getCurrentTier(def, unlocked.progress)
    : null;
  const nextTier = unlocked
    ? getNextTier(def, unlocked.progress)
    : def.tiers[0]; // first tier for locked achievements

  const progress = unlocked?.progress ?? 0;
  const targetThreshold = nextTier?.threshold ?? def.tiers[0]?.threshold ?? 1;
  const progressPct = Math.min((progress / targetThreshold) * 100, 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className={`glass-card p-3 space-y-2 ${
        !isUnlocked ? "opacity-40" : ""
      }`}
    >
      {/* Icon + tier badge */}
      <div className="flex items-start justify-between">
        <span className="text-2xl">{def.icon}</span>
        {currentTier && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              TIER_BG[currentTier.tier] || TIER_BG.bronze
            }`}
          >
            {currentTier.label}
          </span>
        )}
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-bw-gold-text leading-tight">
        {def.name}
      </p>

      {/* Description */}
      <p className="text-[11px] text-bw-muted leading-snug">
        {def.description}
      </p>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-1.5 rounded-full bg-[#E8DFD2] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(progressPct, 0)}%`,
              background: isUnlocked
                ? `linear-gradient(90deg, ${TIER_HEX[currentTier?.tier || "bronze"]}, ${TIER_HEX[currentTier?.tier || "bronze"]}cc)`
                : "#D3CAB8",
            }}
          />
        </div>
        <p className="text-[10px] text-bw-muted tabular-nums">
          {isUnlocked
            ? nextTier
              ? `${progress} / ${nextTier.threshold}`
              : `${progress} / ${targetThreshold} (max)`
            : `? / ${targetThreshold} pour debloquer`}
        </p>
      </div>
    </motion.div>
  );
}

function FilterTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
        active
          ? "bg-bw-gold/15 text-bw-gold-text border border-bw-gold/30"
          : "bg-white/60 text-bw-muted border border-[#E8DFD2] hover:border-bw-gold/20"
      }`}
    >
      {label}
    </button>
  );
}

function NoProfile() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#F7F3EA] to-[#EFE8D8] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-xs"
      >
        <div className="text-6xl">🎬</div>
        <div className="space-y-2">
          <h1 className="font-cinema text-2xl tracking-wider text-bw-gold-text uppercase">
            Profil Joueur
          </h1>
          <p className="text-sm text-bw-muted leading-relaxed">
            Joue ta premiere session pour creer ton profil et debloquer des badges !
          </p>
        </div>
        <Link
          href="/join"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-bw-gold to-bw-primary text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          Rejoindre une session
        </Link>
      </motion.div>
    </main>
  );
}

function ProfileSkeleton() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#F7F3EA] to-[#EFE8D8]">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Hero skeleton */}
        <div className="glass-card p-6 space-y-4 animate-pulse">
          <div className="w-24 h-24 rounded-full bg-[#E8DFD2] mx-auto" />
          <div className="h-6 w-32 bg-[#E8DFD2] rounded mx-auto" />
          <div className="h-4 w-24 bg-[#E8DFD2] rounded mx-auto" />
          <div className="h-3 w-48 bg-[#E8DFD2] rounded-full mx-auto" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 space-y-2 animate-pulse">
              <div className="w-8 h-8 bg-[#E8DFD2] rounded mx-auto" />
              <div className="h-6 w-12 bg-[#E8DFD2] rounded mx-auto" />
              <div className="h-3 w-16 bg-[#E8DFD2] rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* Badges skeleton */}
        <div className="space-y-3 animate-pulse">
          <div className="h-6 w-28 bg-[#E8DFD2] rounded" />
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-16 bg-[#E8DFD2] rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-3 space-y-2">
                <div className="h-8 w-8 bg-[#E8DFD2] rounded" />
                <div className="h-4 w-20 bg-[#E8DFD2] rounded" />
                <div className="h-3 w-full bg-[#E8DFD2] rounded" />
                <div className="h-1.5 w-full bg-[#E8DFD2] rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Helpers ──

function tierRank(tier: string): number {
  const ranks: Record<string, number> = { bronze: 1, silver: 2, gold: 3 };
  return ranks[tier] ?? 0;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
