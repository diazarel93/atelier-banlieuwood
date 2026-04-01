"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { toast } from "sonner";
import { SOCLE_LABELS, type ModuleGuide } from "@/lib/guide-data";
import type { ModuleDef, PhaseDef } from "@/lib/modules-data";
import { CATEGORY_COLORS } from "@/lib/constants";
import { MODULE_ACTIVITIES } from "@/lib/module-activities";
import { ModuleIcon } from "./module-icon";

// ─── Visual identity per activity TYPE ───
// CSS patterns make each type visually distinct without external images

function getTypePattern(type: string, color: string): React.CSSProperties {
  switch (type) {
    case "quiz":
      return {
        backgroundImage: `
          radial-gradient(circle at 50% 50%, ${color}18 2px, transparent 2px),
          radial-gradient(circle at 50% 50%, ${color}06 45%, transparent 70%)
        `,
        backgroundSize: "28px 28px, 100% 100%",
      };
    case "image":
      return {
        backgroundImage: `
          repeating-linear-gradient(90deg, transparent 0px, transparent 14px, ${color}12 14px, ${color}12 16px, transparent 16px, transparent 22px),
          repeating-linear-gradient(0deg, transparent 0px, transparent 90%, ${color}08 100%)
        `,
        backgroundSize: "22px 100%, 100% 100%",
      };
    case "game":
      return {
        backgroundImage: `
          linear-gradient(60deg, ${color}08 25%, transparent 25.5%),
          linear-gradient(-60deg, ${color}08 25%, transparent 25.5%),
          linear-gradient(60deg, transparent 74.5%, ${color}08 75%),
          linear-gradient(-60deg, transparent 74.5%, ${color}08 75%)
        `,
        backgroundSize: "48px 84px",
      };
    case "debate":
      return {
        backgroundImage: `
          linear-gradient(135deg, ${color}18 48%, transparent 48%, transparent 52%, ${color}10 52%),
          repeating-linear-gradient(135deg, transparent 0px, transparent 30px, ${color}05 30px, ${color}05 31px)
        `,
      };
    case "checklist":
      return {
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent 0px, transparent 22px, ${color}08 22px, ${color}08 23px),
          linear-gradient(90deg, ${color}10 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 36px 100%",
        backgroundPosition: "0 8px, 28px 0",
      };
    case "notebook":
      return {
        backgroundImage: `radial-gradient(${color}14 1.2px, transparent 1.2px)`,
        backgroundSize: "18px 18px",
        backgroundPosition: "9px 9px",
      };
    case "choice":
      return {
        backgroundImage: `
          linear-gradient(45deg, ${color}08 25%, transparent 25%),
          linear-gradient(-45deg, ${color}08 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${color}08 75%),
          linear-gradient(-45deg, transparent 75%, ${color}08 75%)
        `,
        backgroundSize: "36px 36px",
        backgroundPosition: "0 0, 0 18px, 18px -18px, -18px 0px",
      };
    default: // "qa"
      return {
        backgroundImage: `
          radial-gradient(${color}10 1.5px, transparent 1.5px),
          radial-gradient(${color}06 1.5px, transparent 1.5px)
        `,
        backgroundSize: "32px 32px, 32px 32px",
        backgroundPosition: "0 0, 16px 16px",
      };
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "quiz":
      return "QUIZ";
    case "image":
      return "IMAGE";
    case "game":
      return "JEU";
    case "debate":
      return "DÉBAT";
    case "checklist":
      return "CHECKLIST";
    case "notebook":
      return "CARNET";
    case "choice":
      return "CHOIX";
    default:
      return "Q & R";
  }
}

function getQuestionLayout(type: string): "grid" | "featured" | "list" {
  switch (type) {
    case "quiz":
      return "grid";
    case "image":
    case "notebook":
      return "featured";
    default:
      return "list";
  }
}

// ─── Cover images per module (fallback only, CSS patterns are primary) ───
const MODULE_COVERS: Record<string, { url: string; credit: string }> = {
  m1a: {
    url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=300&fit=crop",
    credit: "Jakob Owens",
  },
  m1b: {
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=300&fit=crop",
    credit: "Federico Respini",
  },
  m1c: {
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=300&fit=crop",
    credit: "Patrick Perkins",
  },
  m1d: {
    url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=300&fit=crop",
    credit: "Jason Blackeye",
  },
  m1e: {
    url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=300&fit=crop",
    credit: "Aaron Burden",
  },
  u2a: {
    url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=300&fit=crop",
    credit: "Felix Mooneeram",
  },
  u2b: {
    url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=300&fit=crop",
    credit: "Jeremy Yap",
  },
  u2c: {
    url: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=600&h=300&fit=crop",
    credit: "Mon Esprit",
  },
  u2d: {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop",
    credit: "Joseph Frank",
  },
  m2a: {
    url: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&h=300&fit=crop",
    credit: "Denise Jans",
  },
  m2b: {
    url: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&h=300&fit=crop",
    credit: "Markus Winkler",
  },
  m2c: {
    url: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=600&h=300&fit=crop",
    credit: "Jacob Rank",
  },
  m2d: {
    url: "https://images.unsplash.com/photo-1504711434969-e33886168d9c?w=600&h=300&fit=crop",
    credit: "Brands People",
  },
  "m2-perso": {
    url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=300&fit=crop",
    credit: "Myke Simon",
  },
  m3: {
    url: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&h=300&fit=crop",
    credit: "Aiony Haust",
  },
  m4: {
    url: "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=600&h=300&fit=crop",
    credit: "Jakob Owens",
  },
  m5: {
    url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=300&fit=crop",
    credit: "Krists Luhaers",
  },
  m12a: {
    url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=300&fit=crop",
    credit: "Chang Duong",
  },
  m6: {
    url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=300&fit=crop",
    credit: "Aaron Burden",
  },
  m7: {
    url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=300&fit=crop",
    credit: "Jakob Owens",
  },
  m8: {
    url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=300&fit=crop",
    credit: "Jason Goodman",
  },
};

// ────────────────────────────────────────────

interface SituationPreview {
  position: number;
  category: string;
  restitutionLabel: string;
  prompt: string;
  nudgeText: string | null;
}

interface ModuleBriefingProps {
  module: ModuleDef;
  phase: PhaseDef | undefined;
  moduleGuide: ModuleGuide | undefined;
  isInProgress: boolean;
  isCompleted: boolean;
  sessionId: string;
  onLaunch: () => void;
  onResume: () => void;
}

export function ModuleBriefing({
  module,
  phase,
  moduleGuide,
  isInProgress,
  isCompleted,
  sessionId,
  onLaunch,
  onResume,
}: ModuleBriefingProps) {
  const [showDeroule, setShowDeroule] = useState(false);
  const [showConseils, setShowConseils] = useState(false);
  const [questions, setQuestions] = useState<SituationPreview[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const activity = MODULE_ACTIVITIES[module.id];
  const cover = MODULE_COVERS[module.id];
  const actType = activity?.type ?? "qa";
  const typePattern = getTypePattern(actType, module.color);
  const typeLabel = getTypeLabel(actType);
  const questionLayout = getQuestionLayout(actType);

  // Auto-fetch questions on mount
  useEffect(() => {
    setQuestions([]);
    setQuestionsLoading(true);
    fetch(`/api/sessions/${sessionId}/situations-preview?module=${module.dbModule}&seance=${module.dbSeance}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.situations) setQuestions(d.situations);
      })
      .catch(() => {})
      .finally(() => setQuestionsLoading(false));
  }, [sessionId, module.dbModule, module.dbSeance]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 pb-28">
        {/* ══════════════════════════════════════════════
            HERO — type-driven visual identity
            ══════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-2xl -mx-4 mt-2"
        >
          {/* Layer 1: Cover image (subtle, dimmed) */}
          {cover && (
            <div className="absolute inset-0 h-full">
              <Image src={cover.url} alt="" fill className="object-cover opacity-25" sizes="100vw" />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to bottom, ${module.color}40 0%, #08090E 100%)` }}
              />
            </div>
          )}

          {/* Layer 2: CSS pattern overlay (type identity) */}
          <div className="absolute inset-0 pointer-events-none" style={typePattern} />

          {/* Layer 3: Gradient base (used alone if no cover) */}
          {!cover && (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(145deg, ${module.color}30 0%, ${module.color}12 40%, #08090E 100%)`,
              }}
            />
          )}

          {/* Animated light leak */}
          <motion.div
            animate={{ opacity: [0.08, 0.2, 0.08], x: [-30, 30, -30] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 mix-blend-overlay pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 30% 50%, ${module.color}60, transparent 50%)` }}
          />

          {/* Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)",
            }}
          />

          {/* ── Content ── */}
          <div className="relative px-6 pt-5 pb-5 space-y-4 min-h-[200px] flex flex-col justify-end">
            {/* TYPE BADGE — dominant visual element */}
            <div className="flex items-center gap-3">
              <div
                className="px-4 py-1.5 rounded-lg text-xs font-black tracking-[0.2em] uppercase"
                style={{
                  background: `linear-gradient(135deg, ${module.color}50, ${module.color}25)`,
                  color: "white",
                  border: `1.5px solid ${module.color}60`,
                  boxShadow: `0 0 20px ${module.color}20`,
                }}
              >
                {typeLabel}
              </div>
              {phase && (
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  {phase.emoji} {phase.label}
                </span>
              )}
              <div className="flex-1" />
              {isCompleted && (
                <span className="text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-bw-teal/25 text-bw-teal border border-bw-teal/30">
                  Terminé
                </span>
              )}
              {isInProgress && !isCompleted && (
                <motion.span
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-bw-primary/25 text-bw-primary border border-bw-primary/30"
                >
                  En cours
                </motion.span>
              )}
            </div>

            {/* Title + icon */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${module.color}, ${module.color}AA)`,
                  boxShadow: `0 8px 24px ${module.color}40`,
                }}
              >
                <div className="text-white">
                  <ModuleIcon iconKey={module.iconKey} size={26} />
                </div>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold font-sans tracking-wide">{module.title}</h1>
                <p className="text-sm text-white/50">{module.subtitle}</p>
              </div>
            </div>

            {/* Meta pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full text-white/80 bg-black/[0.04] border border-black/[0.06]">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {module.duration}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full text-white/80 bg-black/[0.04] border border-black/[0.06]">
                {module.questions} question{module.questions !== 1 ? "s" : ""}
              </span>
              {activity &&
                activity.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: `${module.color}18`,
                      color: module.color,
                      border: `1px solid ${module.color}25`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>

          {/* Bottom color bar */}
          <div
            className="h-1"
            style={{ background: `linear-gradient(90deg, ${module.color}, ${module.color}60, transparent)` }}
          />
        </motion.div>

        <div className="space-y-4 mt-5">
          {/* ══════════════════════════════════════════════
              ACTIVITY CARD — what students will DO
              Type-specific visual treatment
              ══════════════════════════════════════════════ */}
          {activity && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl overflow-hidden"
              style={{ border: `2px solid ${module.color}30` }}
            >
              {/* Activity header with type color bar */}
              <div
                className="px-5 py-3 flex items-center gap-3"
                style={{ background: `linear-gradient(135deg, ${module.color}25, ${module.color}10)` }}
              >
                <span className="text-2xl">{activity.emoji}</span>
                <div className="flex-1">
                  <h3 className="text-sm font-bold" style={{ color: module.color }}>
                    {activity.label}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {activity.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium px-2 py-0.5 rounded-full bg-black/[0.04] text-white/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Large type icon watermark */}
                <div className="text-4xl opacity-15 leading-none">{activity.emoji}</div>
              </div>
              {/* Description */}
              <div
                className="px-5 py-3"
                style={{ background: `linear-gradient(180deg, ${module.color}08, transparent)` }}
              >
                <p className="text-[13px] text-bw-heading leading-relaxed">{activity.detail}</p>
              </div>

              {/* Type-specific visual preview */}
              {actType === "quiz" && (
                <div className="px-5 pb-3 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-black/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full w-[65%]"
                      style={{ background: `linear-gradient(90deg, ${module.color}, ${module.color}60)` }}
                    />
                  </div>
                  <span className="text-xs text-bw-muted">Stats en temps réel</span>
                </div>
              )}
              {actType === "image" && (
                <div className="px-5 pb-3 flex items-center gap-2 text-xs text-bw-muted">
                  <div className="w-10 h-7 rounded bg-black/[0.04] flex items-center justify-center text-lg">🖼️</div>
                  <span>Image projetée → Écriture → Confrontation de 2 textes</span>
                </div>
              )}
              {actType === "game" && (
                <div className="px-5 pb-3 flex items-center gap-2">
                  {["🎭", "📍", "🔊", "⏰", "💬"].map((token, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-lg bg-black/[0.03] border border-black/[0.06] flex items-center justify-center text-sm"
                    >
                      {token}
                    </div>
                  ))}
                  <span className="text-xs text-bw-muted ml-1">Jetons à placer</span>
                </div>
              )}
              {actType === "debate" && (
                <div className="px-5 pb-3 flex items-center gap-2">
                  <div className="flex-1 rounded-lg bg-black/[0.03] border border-black/[0.04] px-3 py-1.5 text-center">
                    <span className="text-xs text-white/40">Vue A</span>
                  </div>
                  <span className="text-xs font-bold text-white/20">VS</span>
                  <div className="flex-1 rounded-lg bg-black/[0.03] border border-black/[0.04] px-3 py-1.5 text-center">
                    <span className="text-xs text-white/40">Vue B</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════
              QUESTIONS PREVIEW — layout varies by type
              ══════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${module.color}20` }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ background: `linear-gradient(135deg, ${module.color}12, ${module.color}05)` }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={module.color}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: module.color }}>
                Aperçu des questions
              </span>
              <span className="text-xs text-bw-muted ml-auto">{questions.length || module.questions} questions</span>
            </div>
            <div className="px-3 pb-3">
              {questionsLoading ? (
                <div className="space-y-2 pt-2">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="h-14 rounded-xl bg-black/[0.03] animate-pulse" />
                  ))}
                </div>
              ) : questions.length === 0 ? (
                <p className="text-xs text-bw-muted py-4 text-center">Aucune question trouvée pour ce module</p>
              ) : (
                <>
                  {/* ── GRID layout (quiz) — 2 columns, compact ── */}
                  {questionLayout === "grid" && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {questions.map((q, i) => {
                        const color = CATEGORY_COLORS[q.category] || module.color;
                        return (
                          <motion.div
                            key={q.position}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.08 + i * 0.03 }}
                            className="rounded-xl p-2.5 space-y-1"
                            style={{ background: `${color}08`, border: `1px solid ${color}12` }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className="text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: `${color}20`, color }}
                              >
                                {q.position}
                              </span>
                              <span className="text-xs font-medium uppercase tracking-wider truncate" style={{ color }}>
                                {q.restitutionLabel || q.category}
                              </span>
                            </div>
                            <p className="text-xs text-bw-heading leading-snug line-clamp-2">{q.prompt}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── FEATURED layout (image/notebook) — large cards ── */}
                  {questionLayout === "featured" && (
                    <div className="space-y-3 pt-2">
                      {questions.map((q, i) => {
                        const color = CATEGORY_COLORS[q.category] || module.color;
                        return (
                          <motion.div
                            key={q.position}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="rounded-2xl overflow-hidden"
                            style={{ border: `1.5px solid ${color}20` }}
                          >
                            {/* Image placeholder bar */}
                            <div
                              className="h-3"
                              style={{ background: `linear-gradient(90deg, ${color}30, ${color}10, transparent)` }}
                            />
                            <div className="p-4 space-y-2" style={{ background: `${color}05` }}>
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center"
                                  style={{ background: `${color}20`, color }}
                                >
                                  {q.position}
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
                                  {q.restitutionLabel || q.category}
                                </span>
                              </div>
                              <p className="text-[15px] text-bw-heading leading-relaxed font-medium">{q.prompt}</p>
                              {q.nudgeText && (
                                <p
                                  className="text-xs text-bw-muted italic border-l-2 pl-3 ml-1"
                                  style={{ borderColor: `${color}30` }}
                                >
                                  Relance : {q.nudgeText}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── LIST layout (qa, debate, game, etc.) — conversation style ── */}
                  {questionLayout === "list" && (
                    <div className="pt-2 relative">
                      {/* Vertical line */}
                      <div
                        className="absolute left-[14px] top-4 bottom-2 w-px"
                        style={{ background: `linear-gradient(180deg, ${module.color}20, transparent)` }}
                      />
                      <div className="space-y-1">
                        {questions.map((q, i) => {
                          const color = CATEGORY_COLORS[q.category] || module.color;
                          return (
                            <motion.div
                              key={q.position}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + i * 0.03 }}
                              className="relative pl-8 py-2"
                            >
                              {/* Circle on the line */}
                              <div
                                className="absolute left-[8px] top-[12px] w-[14px] h-[14px] rounded-full flex items-center justify-center z-10"
                                style={{ background: `${color}20`, border: `1.5px solid ${color}40` }}
                              >
                                <span className="text-xs font-bold" style={{ color }}>
                                  {q.position}
                                </span>
                              </div>
                              <div
                                className="rounded-xl p-3"
                                style={{
                                  background: `linear-gradient(135deg, ${color}06, rgba(26,29,34,0.3))`,
                                  border: `1px solid ${color}12`,
                                }}
                              >
                                <span className="text-xs font-medium uppercase tracking-wider" style={{ color }}>
                                  {q.restitutionLabel || q.category}
                                </span>
                                <p className="text-[13px] text-bw-heading leading-relaxed mt-1">{q.prompt}</p>
                                {q.nudgeText && <p className="text-xs text-bw-muted italic mt-1.5">💡 {q.nudgeText}</p>}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════
              2-COLUMN GRID: Note prof + Objectif
              ══════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {module.teacherNote && (
              <div
                className="rounded-xl p-4"
                style={{
                  background: "linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,107,53,0.04))",
                  border: "1px solid rgba(255,107,53,0.2)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">🎬</span>
                  <p className="text-xs font-bold uppercase tracking-wider text-bw-primary">Note prof</p>
                </div>
                <p className="text-xs text-bw-heading leading-relaxed">{module.teacherNote}</p>
              </div>
            )}
            {moduleGuide && (
              <div
                className="rounded-xl p-4"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.04))",
                  border: "1px solid rgba(139,92,246,0.2)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">🎯</span>
                  <p className="text-xs font-bold uppercase tracking-wider text-bw-violet">Objectif</p>
                </div>
                <p className="text-xs text-bw-heading leading-relaxed line-clamp-4">
                  {moduleGuide.objectifPedagogique}
                </p>
                {moduleGuide.socleCommun?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {moduleGuide.socleCommun.map((d) => (
                      <span
                        key={d}
                        className="text-xs font-medium px-2 py-0.5 rounded-full bg-bw-violet/20 text-bw-violet border border-bw-violet/25"
                        title={SOCLE_LABELS[d]}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* ══════════════════════════════════════════════
              À DIRE AUX ÉLÈVES
              ══════════════════════════════════════════════ */}
          {moduleGuide && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(78,205,196,0.15), rgba(78,205,196,0.05))",
                border: "2px solid rgba(78,205,196,0.3)",
              }}
            >
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🗣️</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-bw-teal">À dire aux élèves</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(moduleGuide.introADire);
                      toast.success("Copié !");
                    }}
                    className="text-xs font-bold text-bw-teal cursor-pointer transition-all px-3 py-1 rounded-full bg-bw-teal/15 hover:bg-bw-teal/25 border border-bw-teal/25"
                  >
                    Copier
                  </button>
                </div>
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="relative pl-4"
                  style={{ borderLeft: "3px solid rgba(78,205,196,0.4)" }}
                >
                  <p className="text-sm text-bw-heading leading-relaxed italic">
                    &ldquo;{moduleGuide.introADire}&rdquo;
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════
              DÉROULÉ — collapsible
              ══════════════════════════════════════════════ */}
          {moduleGuide && moduleGuide.phases?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <button
                onClick={() => setShowDeroule(!showDeroule)}
                className="w-full flex items-center gap-2 py-2 cursor-pointer group"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7D828A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={`transition-transform ${showDeroule ? "rotate-90" : ""}`}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted group-hover:text-bw-heading transition-colors">
                  Déroulé ({moduleGuide.duration})
                </span>
                <span className="text-xs text-bw-muted">{moduleGuide.phases.length} étapes</span>
              </button>
              {showDeroule && (
                <div className="ml-1 space-y-0 mt-1">
                  {moduleGuide.phases.map((p, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: module.color + "20", color: module.color }}
                        >
                          {i + 1}
                        </div>
                        {i < moduleGuide.phases.length - 1 && <div className="w-px flex-1 bg-black/[0.04] my-0.5" />}
                      </div>
                      <div className="pb-3 flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-semibold">{p.name}</span>
                          <span className="text-xs text-bw-muted">{p.timing}</span>
                        </div>
                        <p className="text-xs text-bw-muted leading-relaxed">{p.instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════
              CONSEILS — collapsible
              ══════════════════════════════════════════════ */}
          {moduleGuide && moduleGuide.conseils?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <button
                onClick={() => setShowConseils(!showConseils)}
                className="w-full flex items-center gap-2 py-2 cursor-pointer group"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7D828A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={`transition-transform ${showConseils ? "rotate-90" : ""}`}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wider text-bw-green group-hover:text-bw-heading transition-colors">
                  Conseils
                </span>
                <span className="text-xs text-bw-muted">{moduleGuide.conseils.length} tips</span>
              </button>
              {showConseils && (
                <ul className="ml-5 mt-1 space-y-1">
                  {moduleGuide.conseils.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-bw-text leading-relaxed">
                      <span className="text-bw-green flex-shrink-0">&#x2713;</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}

          {/* Fallback — no guide */}
          {!moduleGuide && !activity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-bw-surface rounded-xl border border-dashed border-bw-border p-4 text-center"
            >
              <p className="text-xs text-bw-muted">Guide pédagogique à venir</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── CTA — sticky bottom ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-black/[0.04]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {isCompleted && (
            <span className="text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-bw-teal/15 text-bw-teal flex-shrink-0">
              Terminé
            </span>
          )}
          <div className="flex-1" />
          {isInProgress ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={onResume}
              className="btn-glow px-6 py-3 rounded-2xl font-bold text-sm cursor-pointer transition-all text-white shadow-lg"
              style={{
                background: "linear-gradient(135deg, #4ECDC4, #2BA69F)",
                boxShadow: "0 4px 15px rgba(78,205,196,0.3)",
              }}
            >
              Reprendre le module
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={onLaunch}
              className="btn-glow px-6 py-3 rounded-2xl font-bold text-sm cursor-pointer transition-all text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${module.color}, ${module.color}CC)`,
                boxShadow: `0 4px 20px ${module.color}40`,
              }}
            >
              <span className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
                {isCompleted ? "Relancer le module" : "Lancer pour les élèves"}
              </span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
