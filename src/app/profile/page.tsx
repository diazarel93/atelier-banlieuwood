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

interface NextSessionData {
  title: string;
  scheduledAt: string;
  classLabel: string;
}

interface PlayerProfileResponse {
  profile: ProfileData;
  achievements: UnlockedAchievement[];
  sessionHistory: SessionEntry[];
  nextSession: NextSessionData | null;
}

// ── Tier colors ──

const TIER_HEX: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
};

const TIER_BG: Record<string, string> = {
  bronze: "bg-amber-900/40 text-amber-300",
  silver: "bg-slate-700/40 text-slate-300",
  gold: "bg-yellow-900/40 text-yellow-300",
};

// ── Hidden achievements (impossible to unlock — no progress metric exists) ──

const HIDDEN_ACHIEVEMENT_IDS = [
  "tribun",
  "pitcheur",
  "mentor",
  "festival_star",
  "perfectionniste",
  "noctambule",
  "speed_runner",
  "mission_hero",
  "critique",
] as const;

const VISIBLE_ACHIEVEMENTS = ACHIEVEMENTS.filter((a) => !(HIDDEN_ACHIEVEMENT_IDS as readonly string[]).includes(a.id));

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
      <main
        className="min-h-dvh flex items-center justify-center px-4"
        style={{
          backgroundColor: "#08090E",
          background: "linear-gradient(145deg, #08090E 0%, #0A0C12 35%, #08090E 100%)",
        }}
      >
        <div className="text-center space-y-4">
          <p className="text-4xl">😕</p>
          <p className="text-[#9898aa]">{error || "Impossible de charger le profil"}</p>
          <Link href="/join" className="text-bw-primary font-medium hover:underline">
            Rejoindre une session
          </Link>
        </div>
      </main>
    );
  }

  const { profile, achievements, sessionHistory, nextSession } = data;
  const level = getLevel(profile.totalXp);
  const xpToNext = level.nextThreshold - level.currentXp;

  // Build achievement lookup for unlocked ones
  const unlockedMap = new Map<string, UnlockedAchievement>();
  for (const a of achievements) {
    const existing = unlockedMap.get(a.id);
    // Keep the highest tier
    if (!existing || tierRank(a.tier) > tierRank(existing.tier)) {
      unlockedMap.set(a.id, a);
    }
  }

  // Filter achievements by category (already excludes hidden/impossible ones)
  const filteredAchievements =
    badgeFilter === "all" ? VISIBLE_ACHIEVEMENTS : VISIBLE_ACHIEVEMENTS.filter((a) => a.category === badgeFilter);

  // Check if any visible achievement is unlocked (for empty state)
  const hasAnyUnlocked = filteredAchievements.some((a) => unlockedMap.has(a.id));

  return (
    <main
      className="min-h-dvh pb-12 text-[#f0f0f5]"
      style={{
        backgroundColor: "#08090E",
        background: "linear-gradient(145deg, #08090E 0%, #0A0C12 35%, #08090E 100%)",
      }}
    >
      {/* Cinematic ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,107,53,0.045) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(78,205,196,0.03) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
          style={{ background: "radial-gradient(ellipse at center, rgba(139,92,246,0.02) 0%, transparent 60%)" }}
        />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Back link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
          <Link href="/" className="text-sm text-[#9898aa] hover:text-[#D4A843] transition-colors">
            ← Retour
          </Link>
        </motion.div>

        {/* ── Hero Section ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/[0.08] p-6 text-center space-y-4"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)" }}
        >
          {/* Avatar */}
          <div className="relative inline-block">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto"
              style={{
                background: "linear-gradient(135deg, #1a1a2e, #2a2a44)",
                border: profile.avatarFrame
                  ? `3px solid ${TIER_HEX[profile.avatarFrame] || "#D4A843"}`
                  : "3px solid rgba(255,255,255,0.12)",
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
            <h1 className="font-cinema text-2xl tracking-wider text-[#D4A843] uppercase">{profile.displayName}</h1>
            {profile.customTitle && <p className="text-sm text-[#9898aa] mt-0.5">{profile.customTitle}</p>}
          </div>

          {/* Level badge */}
          <div className="inline-flex items-center gap-2 bg-[#D4A843]/15 px-3 py-1.5 rounded-full border border-[#D4A843]/20">
            <span className="text-xs font-bold text-[#D4A843]">Nv.{level.level}</span>
            <span className="text-sm font-cinema tracking-wider text-[#D4A843] uppercase">{level.name}</span>
          </div>

          {/* XP Bar */}
          <div className="w-full max-w-[260px] mx-auto space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9898aa]">{profile.totalXp} XP</span>
              <span className="text-[#9898aa] tabular-nums">
                {xpToNext > 0 ? `${xpToNext} XP avant niveau ${level.level + 1}` : "Niveau max !"}
              </span>
            </div>
            <div
              className="h-3 rounded-full bg-white/[0.08] overflow-hidden relative"
              role="progressbar"
              aria-valuenow={Math.round(level.progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progression vers le prochain niveau : ${Math.round(level.progress * 100)}%`}
            >
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
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
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
            <p className="text-sm text-orange-400 font-medium">
              🔥 {profile.currentStreak} session{profile.currentStreak > 1 ? "s" : ""} d&apos;affilee
            </p>
          ) : (
            <p className="text-xs text-[#9898aa]">Pas de streak actif</p>
          )}

          {/* Profile code */}
          {profile.profileCode && (
            <div className="flex items-center gap-2 bg-white/[0.06] rounded-lg px-3 py-1.5 border border-white/[0.08]">
              <span className="text-xs text-[#9898aa]">Code joueur :</span>
              <span className="font-mono font-bold text-[#f0f0f5] tracking-widest text-sm">{profile.profileCode}</span>
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
          <StatCard icon="🎬" label="Sessions" value={profile.sessionsPlayed} delay={0.15} />
          <StatCard icon="✍️" label="Reponses" value={profile.totalResponses} delay={0.2} />
          <StatCard icon="🏆" label="Retenues" value={profile.retainedCount} delay={0.25} />
          <StatCard icon="🔥" label="Meilleur Streak" value={profile.bestStreak} delay={0.3} />
        </motion.section>

        {/* ── Badges Gallery ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="font-cinema text-xl tracking-wider text-[#D4A843] uppercase">Mes Badges</h2>

          {/* Category tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <FilterTab label="Tous" active={badgeFilter === "all"} onClick={() => setBadgeFilter("all")} />
            {CATEGORIES.map((cat) => (
              <FilterTab
                key={cat.id}
                label={`${cat.icon} ${cat.label}`}
                active={badgeFilter === cat.id}
                onClick={() => setBadgeFilter(cat.id)}
              />
            ))}
          </div>

          {/* Empty state — no badges unlocked yet */}
          {!hasAnyUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/[0.08] p-6 text-center space-y-2"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p className="text-3xl">{"\uD83C\uDFAF"}</p>
              <p className="text-sm text-[#9898aa] leading-relaxed">
                Continue a jouer pour debloquer ton premier badge !
              </p>
            </motion.div>
          )}

          {/* Achievement cards */}
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredAchievements.map((def, i) => {
                const unlocked = unlockedMap.get(def.id);
                return <AchievementCard key={def.id} def={def} unlocked={unlocked ?? null} index={i} />;
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
            <div
              className="rounded-2xl border border-white/[0.08] p-4 border-l-4 border-l-[#4ECDC4]"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p className="text-xs text-[#4ECDC4] font-cinema tracking-wider uppercase">Prochaine session</p>
              <p className="font-semibold text-[#f0f0f5] mt-1">{nextSession.title}</p>
              <p className="text-sm text-[#9898aa]">
                {new Date(nextSession.scheduledAt).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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
            <h2 className="font-cinema text-xl tracking-wider text-[#D4A843] uppercase">Mes Sessions</h2>
            <div className="space-y-2">
              {sessionHistory.map((s, i) => (
                <motion.div
                  key={s.sessionId + i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="rounded-2xl border border-white/[0.08] p-4 flex items-center gap-3"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#D4A843]/15 flex items-center justify-center text-lg shrink-0">
                    🎬
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#D4A843] truncate">{s.title}</p>
                    <div className="flex items-center gap-2 text-xs text-[#9898aa]">
                      <span>{formatDate(s.date)}</span>
                      {s.classLabel && (
                        <>
                          <span className="text-white/20">|</span>
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
      </div>
    </main>
  );
}

// ── Sub-components ──

function StatCard({ icon, label, value, delay }: { icon: string; label: string; value: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-white/[0.08] p-4 text-center space-y-1"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-bold text-[#D4A843] tabular-nums">{value}</p>
      <p className="text-xs text-[#9898aa]">{label}</p>
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
  const currentTier = unlocked ? getCurrentTier(def, unlocked.progress) : null;
  const nextTier = unlocked ? getNextTier(def, unlocked.progress) : def.tiers[0]; // first tier for locked achievements

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
      className={`rounded-2xl border border-white/[0.08] p-3 space-y-2 ${!isUnlocked ? "opacity-40" : ""}`}
      style={{ background: "rgba(255,255,255,0.04)" }}
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
      <p className="text-sm font-semibold text-[#D4A843] leading-tight">{def.name}</p>

      {/* Description */}
      <p className="text-[11px] text-[#9898aa] leading-snug">{def.description}</p>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(progressPct, 0)}%`,
              background: isUnlocked
                ? `linear-gradient(90deg, ${TIER_HEX[currentTier?.tier || "bronze"]}, ${TIER_HEX[currentTier?.tier || "bronze"]}cc)`
                : "rgba(255,255,255,0.15)",
            }}
          />
        </div>
        <p className="text-[10px] text-[#9898aa] tabular-nums">
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

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
        active
          ? "bg-[#D4A843]/15 text-[#D4A843] border border-[#D4A843]/30"
          : "bg-white/[0.06] text-[#9898aa] border border-white/[0.08] hover:border-[#D4A843]/20"
      }`}
    >
      {label}
    </button>
  );
}

function NoProfile() {
  return (
    <main
      className="min-h-dvh flex items-center justify-center px-4 text-[#f0f0f5]"
      style={{
        backgroundColor: "#08090E",
        background: "linear-gradient(145deg, #08090E 0%, #0A0C12 35%, #08090E 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-xs"
      >
        <div className="text-6xl">🎬</div>
        <div className="space-y-2">
          <h1 className="font-cinema text-2xl tracking-wider text-[#D4A843] uppercase">Profil Joueur</h1>
          <p className="text-sm text-[#9898aa] leading-relaxed">
            Joue ta premiere session pour creer ton profil et debloquer des badges !
          </p>
        </div>
        <Link
          href="/join"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4A843] to-[#FF6B35] text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          Rejoindre une session
        </Link>
      </motion.div>
    </main>
  );
}

function ProfileSkeleton() {
  return (
    <main
      className="min-h-dvh"
      style={{
        backgroundColor: "#08090E",
        background: "linear-gradient(145deg, #08090E 0%, #0A0C12 35%, #08090E 100%)",
      }}
    >
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Hero skeleton */}
        <div
          className="rounded-2xl border border-white/[0.08] p-6 space-y-4 animate-pulse"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div className="w-24 h-24 rounded-full bg-white/[0.08] mx-auto" />
          <div className="h-6 w-32 bg-white/[0.08] rounded mx-auto" />
          <div className="h-4 w-24 bg-white/[0.08] rounded mx-auto" />
          <div className="h-3 w-48 bg-white/[0.08] rounded-full mx-auto" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.08] p-4 space-y-2 animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <div className="w-8 h-8 bg-white/[0.08] rounded mx-auto" />
              <div className="h-6 w-12 bg-white/[0.08] rounded mx-auto" />
              <div className="h-3 w-16 bg-white/[0.08] rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* Badges skeleton */}
        <div className="space-y-3 animate-pulse">
          <div className="h-6 w-28 bg-white/[0.08] rounded" />
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-16 bg-white/[0.08] rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.08] p-3 space-y-2"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div className="h-8 w-8 bg-white/[0.08] rounded" />
                <div className="h-4 w-20 bg-white/[0.08] rounded" />
                <div className="h-3 w-full bg-white/[0.08] rounded" />
                <div className="h-1.5 w-full bg-white/[0.08] rounded-full" />
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
