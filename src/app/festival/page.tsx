"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

// ═══════════════════════════════════════════════════════════════
// LE FESTIVAL — Community Gallery & Voting
// ═══════════════════════════════════════════════════════════════

interface FestivalEntry {
  id: string;
  title: string;
  content: string;
  entry_type: string;
  category: string | null;
  vote_count: number;
  created_at: string;
  featured: boolean;
  profile?: {
    id: string;
    display_name: string;
    avatar: string;
    avatar_frame?: string;
    level: number;
    custom_title?: string;
  };
}

type SortMode = "recent" | "popular";

const ENTRY_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  response: { label: "Reponse", icon: "✍️", color: "#4ECDC4" },
  pitch: { label: "Pitch", icon: "🎤", color: "#8B5CF6" },
  scene: { label: "Scene", icon: "🎬", color: "#FF6B35" },
  collective: { label: "Collectif", icon: "🤝", color: "#D4A843" },
};

export default function FestivalPage() {
  const [entries, setEntries] = useState<FestivalEntry[]>([]);
  const [sort, setSort] = useState<SortMode>("popular");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, [sort, category]);

  async function loadEntries() {
    setLoading(true);
    const params = new URLSearchParams({ sort });
    if (category) params.set("category", category);
    try {
      const res = await fetch(`/api/festival?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  }

  const featured = entries.filter((e) => e.featured);
  const regular = entries.filter((e) => !e.featured);

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/studio" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">🏆</span>
            <span style={{ color: "#1A1A2E" }}>Le Festival</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/studio"
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-black/[0.08]"
              style={{ color: "#6B7280" }}
            >
              ← Mon Studio
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black" style={{ color: "#1A1A2E" }}>
            Le Festival Banlieuwood 🏆
          </h1>
          <p className="text-lg mt-2" style={{ color: "#6B7280" }}>
            Les meilleures creations de la communaute. Vote pour tes preferees !
          </p>
        </motion.div>
      </section>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {Object.entries(ENTRY_TYPE_LABELS).map(([key, { label, icon }]) => (
              <button
                key={key}
                onClick={() => setCategory(category === key ? null : key)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                  category === key
                    ? "bg-orange-50 border-orange-300 text-orange-700"
                    : "bg-white border-black/[0.06] text-gray-600 hover:border-black/[0.15]"
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 p-1 bg-black/[0.04] rounded-lg">
            <button
              onClick={() => setSort("popular")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                sort === "popular" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
              }`}
            >
              🔥 Populaires
            </button>
            <button
              onClick={() => setSort("recent")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                sort === "recent" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
              }`}
            >
              🕐 Recents
            </button>
          </div>
        </div>
      </div>

      {/* Featured entries */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "#D4A843" }}>
            ⭐ Selections du Festival
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((entry, i) => (
              <FestivalCard key={entry.id} entry={entry} index={i} featured />
            ))}
          </div>
        </section>
      )}

      {/* Regular entries */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-black/[0.04]" />
            ))}
          </div>
        ) : regular.length === 0 && featured.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl">🎬</span>
            <p className="text-xl font-bold mt-4" style={{ color: "#1A1A2E" }}>
              Le Festival attend ses premieres creations !
            </p>
            <p className="text-sm mt-2" style={{ color: "#6B7280" }}>
              Joue des sessions et publie tes meilleures reponses ici.
            </p>
            <Link
              href={ROUTES.join}
              className="inline-block mt-6 px-6 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: "#FF6B35" }}
            >
              Rejoindre une session
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {regular.map((entry, i) => (
                <FestivalCard key={entry.id} entry={entry} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}

function FestivalCard({ entry, index, featured }: { entry: FestivalEntry; index: number; featured?: boolean }) {
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(entry.vote_count);
  const typeInfo = ENTRY_TYPE_LABELS[entry.entry_type] || { label: entry.entry_type, icon: "📝", color: "#6B7280" };

  async function handleVote() {
    if (voted) return;
    setVoted(true);
    setVoteCount((c) => c + 1);
    try {
      await fetch("/api/festival/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: entry.id, voterProfileId: "anonymous" }),
      });
    } catch {
      setVoted(false);
      setVoteCount((c) => c - 1);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`bg-white rounded-2xl border overflow-hidden ${
        featured ? "border-yellow-300 ring-2 ring-yellow-100" : "border-black/[0.06]"
      }`}
      style={{ boxShadow: featured ? "0 4px 20px rgba(212,168,67,0.15)" : "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
            style={{ background: typeInfo.color }}
          >
            {typeInfo.icon} {typeInfo.label}
          </span>
          {featured && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
              ⭐ Selection
            </span>
          )}
        </div>

        {/* Content */}
        <h3 className="font-bold text-lg" style={{ color: "#1A1A2E" }}>
          {entry.title}
        </h3>
        <p className="text-sm mt-2 line-clamp-4" style={{ color: "#6B7280" }}>
          {entry.content}
        </p>

        {/* Author */}
        {entry.profile && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-black/[0.04]">
            <span className="text-lg">{entry.profile.avatar}</span>
            <div>
              <span className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>
                {entry.profile.display_name}
              </span>
              {entry.profile.custom_title && (
                <span className="text-xs ml-1.5" style={{ color: "#FF6B35" }}>
                  {entry.profile.custom_title}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: "#9CA3AF" }}>
            {new Date(entry.created_at).toLocaleDateString("fr-FR")}
          </span>
          <motion.button
            onClick={handleVote}
            disabled={voted}
            whileTap={{ scale: 0.9 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              voted
                ? "bg-red-50 text-red-500 border border-red-200"
                : "bg-white border border-black/[0.08] text-gray-700 hover:border-red-300 hover:text-red-500"
            }`}
          >
            <motion.span
              animate={voted ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {voted ? "❤️" : "🤍"}
            </motion.span>
            {voteCount}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
