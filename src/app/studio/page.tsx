"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { getLevel, LEVEL_NAMES } from "@/lib/xp";
import {
  ACHIEVEMENTS,
  CATEGORIES,
  ACHIEVEMENT_MAP,
  getCurrentTier,
  TIER_COLORS,
  type UnlockedAchievement,
} from "@/lib/achievements-v2";

// ═══════════════════════════════════════════════════════════════
// LE STUDIO — Student Personal Hub
// Light mode · Warm · Playful · Cinema-inspired
// ═══════════════════════════════════════════════════════════════

interface StudentProfile {
  id: string;
  display_name: string;
  avatar: string;
  avatar_frame?: string;
  custom_title?: string;
  level: number;
  total_xp: number;
  current_streak: number;
  best_streak: number;
  sessions_played: number;
  total_responses: number;
  total_votes: number;
  retained_count: number;
}

type Tab = "overview" | "badges" | "missions" | "portfolio";

export default function StudioPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [achievements, setAchievements] = useState<UnlockedAchievement[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await fetch("/api/student-profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        // Load achievements
        const achRes = await fetch(`/api/achievements?profileId=${data.id}`);
        if (achRes.ok) {
          const achData = await achRes.json();
          setAchievements(achData.unlocked || []);
        }
      }
    } catch {
      // Not logged in — show guest state
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full"
        />
      </div>
    );
  }

  if (!profile) {
    return <GuestStudio />;
  }

  const levelInfo = getLevel(profile.total_xp);
  const unlockedCount = achievements.length;

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      {/* ── Nav Bar ── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">🎬</span>
            <span style={{ color: "#1A1A2E" }}>Le Studio</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.join}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#FF6B35" }}
            >
              Rejoindre une session
            </Link>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-xl bg-orange-50 border border-orange-200">
              {profile.avatar}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="max-w-5xl mx-auto px-4 pt-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-6"
        >
          {/* Avatar */}
          <div className="relative">
            <motion.div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl bg-white border-2 border-orange-200"
              style={{ boxShadow: "0 4px 16px rgba(255,107,53,0.12)" }}
              whileHover={{ scale: 1.05, rotate: 3 }}
            >
              {profile.avatar}
            </motion.div>
            {/* Level badge */}
            <div
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
              style={{ background: "linear-gradient(135deg, #FF6B35, #D4A843)" }}
            >
              {levelInfo.level}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold" style={{ color: "#1A1A2E" }}>
              {profile.display_name}
            </h1>
            <p className="text-sm font-medium" style={{ color: "#FF6B35" }}>
              {profile.custom_title || levelInfo.name}
            </p>

            {/* XP Bar */}
            <div className="mt-3 max-w-sm">
              <div className="flex justify-between text-xs mb-1" style={{ color: "#6B7280" }}>
                <span className="font-semibold">{profile.total_xp} XP</span>
                <span>
                  {levelInfo.level < LEVEL_NAMES.length - 1
                    ? `${levelInfo.nextThreshold} XP pour ${LEVEL_NAMES[levelInfo.level + 1]}`
                    : "Niveau max !"}
                </span>
              </div>
              <div className="xp-bar">
                <motion.div
                  className="xp-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progress * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Streak */}
          {profile.current_streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-orange-50 border border-orange-200"
            >
              <span className="streak-flame text-2xl">🔥</span>
              <span className="text-lg font-black" style={{ color: "#FF6B35" }}>
                {profile.current_streak}
              </span>
              <span className="text-xs font-medium" style={{ color: "#6B7280" }}>
                jours
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 gap-3 mt-6"
        >
          <StatCard icon="🎬" value={profile.sessions_played} label="Sessions" color="#FF6B35" />
          <StatCard icon="✍️" value={profile.total_responses} label="Reponses" color="#4ECDC4" />
          <StatCard icon="🗳️" value={profile.total_votes} label="Votes" color="#8B5CF6" />
          <StatCard icon="🏆" value={unlockedCount} label="Badges" color="#D4A843" />
        </motion.div>
      </section>

      {/* ── Tabs ── */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex gap-1 p-1 bg-black/[0.04] rounded-xl">
          {(
            [
              { id: "overview", label: "Accueil", icon: "🏠" },
              { id: "badges", label: "Badges", icon: "🏅" },
              { id: "missions", label: "Missions", icon: "🎯" },
              { id: "portfolio", label: "Portfolio", icon: "📁" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <OverviewTab key="overview" profile={profile} achievements={achievements} />
          )}
          {activeTab === "badges" && (
            <BadgesTab key="badges" achievements={achievements} />
          )}
          {activeTab === "missions" && (
            <MissionsTab key="missions" profileId={profile.id} />
          )}
          {activeTab === "portfolio" && (
            <PortfolioTab key="portfolio" profileId={profile.id} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Stat Card ──
function StatCard({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl p-4 border border-black/[0.06] text-center"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <span className="text-xl">{icon}</span>
      <p className="text-2xl font-black mt-1" style={{ color }}>
        {value}
      </p>
      <p className="text-xs font-medium" style={{ color: "#6B7280" }}>
        {label}
      </p>
    </motion.div>
  );
}

// ── Overview Tab ──
function OverviewTab({ profile, achievements }: { profile: StudentProfile; achievements: UnlockedAchievement[] }) {
  const recentBadges = achievements.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <QuickAction href={ROUTES.join} icon="🎮" title="Rejoindre" subtitle="Une session en cours" color="#FF6B35" />
        <QuickAction href="/studio/missions" icon="🎯" title="Mission Solo" subtitle="Gagne du XP" color="#8B5CF6" />
        <QuickAction href="/festival" icon="🏆" title="Festival" subtitle="Galerie & votes" color="#D4A843" />
      </div>

      {/* Recent Badges */}
      {recentBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "#6B7280" }}>
            Derniers Badges
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {recentBadges.map((ach) => {
              const def = ACHIEVEMENT_MAP.get(ach.achievementId);
              if (!def) return null;
              return (
                <motion.div
                  key={`${ach.achievementId}-${ach.tier}`}
                  whileHover={{ scale: 1.08 }}
                  className="bg-white rounded-2xl p-3 border border-black/[0.06] text-center"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                >
                  <span className="text-2xl">{def.icon}</span>
                  <p className="text-xs font-semibold mt-1 truncate" style={{ color: "#1A1A2E" }}>
                    {def.name}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${TIER_COLORS[ach.tier].bg} ${TIER_COLORS[ach.tier].text}`}
                  >
                    {ach.tier === "bronze" ? "🥉" : ach.tier === "silver" ? "🥈" : "🥇"}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity Summary */}
      <div className="bg-white rounded-2xl p-5 border border-black/[0.06]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "#6B7280" }}>
          Ta Carriere Cinema
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-lg">✍️</div>
            <div>
              <p className="text-lg font-black" style={{ color: "#4ECDC4" }}>{profile.total_responses}</p>
              <p className="text-xs" style={{ color: "#6B7280" }}>Reponses ecrites</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-lg">🗳️</div>
            <div>
              <p className="text-lg font-black" style={{ color: "#8B5CF6" }}>{profile.total_votes}</p>
              <p className="text-xs" style={{ color: "#6B7280" }}>Votes donnes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg">🏆</div>
            <div>
              <p className="text-lg font-black" style={{ color: "#D4A843" }}>{profile.retained_count}</p>
              <p className="text-xs" style={{ color: "#6B7280" }}>Reponses retenues</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg">🔥</div>
            <div>
              <p className="text-lg font-black" style={{ color: "#FF6B35" }}>{profile.best_streak}</p>
              <p className="text-xs" style={{ color: "#6B7280" }}>Meilleure serie</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Badges Tab ──
function BadgesTab({ achievements }: { achievements: UnlockedAchievement[] }) {
  const unlockedMap = new Map<string, UnlockedAchievement[]>();
  for (const ach of achievements) {
    const list = unlockedMap.get(ach.achievementId) || [];
    list.push(ach);
    unlockedMap.set(ach.achievementId, list);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-8"
    >
      {CATEGORIES.map((cat) => {
        const catAchievements = ACHIEVEMENTS.filter((a) => a.category === cat.id);
        return (
          <div key={cat.id}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "#6B7280" }}>
              <span>{cat.icon}</span>
              {cat.label}
              <span className="text-xs font-normal">
                ({catAchievements.filter((a) => unlockedMap.has(a.id)).length}/{catAchievements.length})
              </span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {catAchievements.map((def) => {
                const unlocked = unlockedMap.get(def.id);
                const bestTier = unlocked
                  ? unlocked.reduce((best, u) => {
                      const order = { bronze: 0, silver: 1, gold: 2 } as const;
                      return order[u.tier as keyof typeof order] > order[best.tier as keyof typeof order] ? u : best;
                    }, unlocked[0])
                  : null;

                return (
                  <motion.div
                    key={def.id}
                    whileHover={{ scale: 1.05 }}
                    className={`rounded-2xl p-4 text-center border transition-all ${
                      bestTier
                        ? "bg-white border-black/[0.08]"
                        : "bg-black/[0.02] border-black/[0.04] opacity-50"
                    }`}
                    style={{
                      boxShadow: bestTier ? "0 2px 8px rgba(0,0,0,0.06)" : undefined,
                    }}
                  >
                    <span className={`text-3xl ${bestTier ? "" : "grayscale"}`}>{def.icon}</span>
                    <p className="text-sm font-bold mt-2" style={{ color: bestTier ? "#1A1A2E" : "#9CA3AF" }}>
                      {def.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                      {def.description}
                    </p>
                    {bestTier && (
                      <span
                        className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-bold ${TIER_COLORS[bestTier.tier].bg} ${TIER_COLORS[bestTier.tier].text}`}
                      >
                        {bestTier.tier === "bronze" ? "🥉" : bestTier.tier === "silver" ? "🥈" : "🥇"}
                      </span>
                    )}
                    {!bestTier && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                        🔒
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

// ── Missions Tab ──
function MissionsTab({ profileId }: { profileId: string }) {
  const [missions, setMissions] = useState<Array<{ id: string; title: string; description: string; mission_type: string; difficulty: string; xp_reward: number; time_limit_minutes: number }>>([]);
  const [submissions, setSubmissions] = useState<Array<{ mission_id: string; score?: number; xp_earned: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/missions?profileId=${profileId}`)
      .then((r) => r.json())
      .then((data) => {
        setMissions(data.missions || []);
        setSubmissions(data.submissions || []);
      })
      .finally(() => setLoading(false));
  }, [profileId]);

  const completedIds = new Set(submissions.map((s) => s.mission_id));

  const DIFFICULTY_COLORS: Record<string, string> = {
    easy: "#10B981",
    medium: "#F59E0B",
    hard: "#EF4444",
  };

  const TYPE_ICONS: Record<string, string> = {
    writing_prompt: "✍️",
    character_analysis: "🧑‍🎤",
    scene_critique: "🎬",
    dialogue_challenge: "💬",
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <div className="inline-block w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-4"
    >
      {missions.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl">🎯</span>
          <p className="text-lg font-bold mt-4" style={{ color: "#1A1A2E" }}>
            Pas de missions pour le moment
          </p>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            Reviens bientot, de nouvelles missions arrivent chaque semaine !
          </p>
        </div>
      ) : (
        missions.map((mission, i) => {
          const completed = completedIds.has(mission.id);
          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl p-5 border border-black/[0.06] flex items-center gap-4 ${
                completed ? "opacity-60" : ""
              }`}
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-2xl flex-shrink-0">
                {TYPE_ICONS[mission.mission_type] || "🎯"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold" style={{ color: "#1A1A2E" }}>
                    {mission.title}
                  </h4>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ background: DIFFICULTY_COLORS[mission.difficulty] || "#6B7280" }}
                  >
                    {mission.difficulty}
                  </span>
                </div>
                <p className="text-sm truncate" style={{ color: "#6B7280" }}>
                  {mission.description}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs font-semibold" style={{ color: "#6B7280" }}>
                  ⏱ {mission.time_limit_minutes} min
                </span>
                <span className="text-sm font-bold" style={{ color: "#FF6B35" }}>
                  +{Math.round(mission.xp_reward * 0.5)} XP
                </span>
                {completed ? (
                  <span className="text-lg">✅</span>
                ) : (
                  <button
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer"
                    style={{ background: "#8B5CF6" }}
                  >
                    Jouer
                  </button>
                )}
              </div>
            </motion.div>
          );
        })
      )}
    </motion.div>
  );
}

// ── Portfolio Tab ──
function PortfolioTab({ profileId }: { profileId: string }) {
  const [entries, setEntries] = useState<Array<{ id: string; title: string; content: string; entry_type: string; vote_count: number; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/festival?profileId=${profileId}`)
      .then((r) => r.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <div className="inline-block w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    >
      {entries.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl">📁</span>
          <p className="text-lg font-bold mt-4" style={{ color: "#1A1A2E" }}>
            Ton portfolio est vide
          </p>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            Joue des sessions et publie tes meilleures creations au Festival !
          </p>
          <Link
            href={ROUTES.join}
            className="inline-block mt-4 px-6 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: "#FF6B35" }}
          >
            Rejoindre une session
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-5 border border-black/[0.06]"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-600">
                  {entry.entry_type}
                </span>
                <span className="text-xs" style={{ color: "#9CA3AF" }}>
                  {new Date(entry.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <h4 className="font-bold" style={{ color: "#1A1A2E" }}>
                {entry.title}
              </h4>
              <p className="text-sm mt-1 line-clamp-3" style={{ color: "#6B7280" }}>
                {entry.content}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm">❤️</span>
                <span className="text-sm font-bold" style={{ color: "#EF4444" }}>
                  {entry.vote_count}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Quick Action Card ──
function QuickAction({
  href,
  icon,
  title,
  subtitle,
  color,
}: {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-2xl p-4 border border-black/[0.06] cursor-pointer"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        <span className="text-2xl">{icon}</span>
        <p className="font-bold mt-2" style={{ color }}>{title}</p>
        <p className="text-xs" style={{ color: "#9CA3AF" }}>{subtitle}</p>
      </motion.div>
    </Link>
  );
}

// ── Guest State ──
function GuestStudio() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName }),
      });
      if (res.ok) setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#FAFAF8" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.span
            className="text-6xl inline-block"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            🎬
          </motion.span>
          <h1 className="text-3xl font-black mt-4" style={{ color: "#1A1A2E" }}>
            Le Studio
          </h1>
          <p className="text-sm mt-2" style={{ color: "#6B7280" }}>
            Ton espace personnel de creation cinematographique.
            <br />
            Connecte-toi pour sauvegarder ta progression.
          </p>
        </div>

        {sent ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center"
          >
            <span className="text-4xl">📧</span>
            <p className="font-bold mt-3" style={{ color: "#1A1A2E" }}>
              Lien magique envoye !
            </p>
            <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
              Verifie ta boite mail et clique sur le lien pour te connecter.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block" style={{ color: "#1A1A2E" }}>
                Ton prenom
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex: Kylian"
                className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                style={{ color: "#1A1A2E" }}
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block" style={{ color: "#1A1A2E" }}>
                Ton email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton.email@ecole.fr"
                required
                className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                style={{ color: "#1A1A2E" }}
              />
            </div>
            <button
              type="submit"
              disabled={sending || !email}
              className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#FF6B35" }}
            >
              {sending ? "Envoi..." : "Recevoir mon lien magique ✨"}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link href={ROUTES.join} className="text-sm font-semibold" style={{ color: "#FF6B35" }}>
            Ou rejoins directement une session →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
