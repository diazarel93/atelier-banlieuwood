"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { SOCLE_LABELS, type ModuleGuide } from "@/lib/guide-data";
import type { ModuleDef, PhaseDef } from "@/lib/modules-data";
import { ModuleIcon } from "./module-icon";

// ─── Activity type mapping per module ───
// Tells the teacher what the students will actually DO

interface ActivityInfo {
  type: string;
  emoji: string;
  label: string;
  detail: string;
  tags: string[];
}

const MODULE_ACTIVITIES: Record<string, ActivityInfo> = {
  m1a: { type: "quiz", emoji: "🎯", label: "Quiz de positionnement", detail: "8 questions à choix. Les élèves découvrent leur profil créatif sur 4 axes : observation, narration, émotion, audace. Stats en temps réel sur l'écran.", tags: ["QCM", "Profil", "Stats live"] },
  m1b: { type: "image", emoji: "👁️", label: "Lecture d'image", detail: "Une photo projetée → chaque élève écrit ce qu'il voit, ressent et imagine. Vous choisissez 2 réponses contrastées pour le débat.", tags: ["Image", "Texte libre", "Confrontation"] },
  m1c: { type: "image", emoji: "👁️", label: "Lecture d'image", detail: "Même principe avec une photo d'intérieur. Observer, décrire, imaginer la suite. Projeter 2 regards opposés.", tags: ["Image", "Texte libre", "Confrontation"] },
  m1d: { type: "image", emoji: "👁️", label: "Lecture d'image", detail: "Dernière image. Peut être rapide ou sautée si le temps manque. Clôture la phase d'observation.", tags: ["Image", "Optionnel"] },
  m1e: { type: "notebook", emoji: "📝", label: "Écriture libre", detail: "Page blanche numérique. Les élèves notent leurs idées, images, fragments d'histoire. Pas de bonne ou mauvaise réponse.", tags: ["Carnet", "Créativité", "Calme"] },
  u2a: { type: "checklist", emoji: "✅", label: "Checklist + récit", detail: "Étape 1 : checklist de 20 références culturelles (Squid Game, Naruto, Spider-Verse...). Étape 2 : raconter une scène marquante. Étape 3 : décrypter l'émotion cachée.", tags: ["Checklist", "Récit", "Analyse"] },
  u2b: { type: "game", emoji: "🎮", label: "Jeu de construction", detail: "Les élèves choisissent une émotion (peur, colère, honte, jalousie, joie) puis construisent une scène avec des jetons : 5 slots, 8 tokens max. L'IA donne un feedback.", tags: ["Scene Builder", "Jetons", "IA feedback"] },
  u2c: { type: "debate", emoji: "💬", label: "Débat collectif", detail: "Vous projetez 2 scènes anonymes d'élèves. La classe débat : laquelle communique mieux son émotion ? Pourquoi ?", tags: ["Projection", "Débat", "Collectif"] },
  u2d: { type: "choice", emoji: "🏁", label: "Choix thématique", detail: "Les élèves nomment le thème de leur histoire (amitié, injustice, secret...) et l'arc de leur personnage (gagne, perd, change...). Bilan.", tags: ["QCM", "Synthèse", "Bilan"] },
  m2a: { type: "qa", emoji: "🎬", label: "Questions-réponses", detail: "8 questions sur les métiers du cinéma, les coûts, les contraintes. Comprendre ce que veut dire « produire un film » à leur échelle.", tags: ["Culture ciné", "Q&R", "Métiers"] },
  m2b: { type: "game", emoji: "💰", label: "Jeu de budget", detail: "100 crédits d'énergie créative à répartir sur 5 postes : casting, décors, image, son, montage. Chaque choix a un coût. Résultat projeté en moyennes.", tags: ["Budget", "Contraintes", "Stratégie"] },
  m2c: { type: "qa", emoji: "⚡", label: "Résolution de problèmes", detail: "8 imprévus de tournage (acteur absent, pluie, batterie vide...). Les élèves proposent des solutions créatives sous pression.", tags: ["Problèmes", "Créativité", "Pression"] },
  m2d: { type: "qa", emoji: "📋", label: "Plan de production", detail: "8 questions pour organiser leur tournage : planning, rôles, scènes clés, plan B. Passer de l'idée au concret.", tags: ["Organisation", "Planning", "Pitch"] },
  "m2-perso": { type: "qa", emoji: "🪞", label: "Portrait créatif", detail: "8 questions pour explorer leur univers : films préférés, héros, méchants, émotions. Trouver le fil rouge vers LEUR histoire.", tags: ["Personnel", "Univers", "Inspiration"] },
  m3: { type: "qa", emoji: "🦸", label: "Création de personnage", detail: "8 questions pour construire le héros : qui il est, ce qu'il veut, sa faille, son secret, son meilleur ami, son rival, son lieu, l'ambiance. Fondations du film.", tags: ["Personnage", "Écriture", "Worldbuilding"] },
  m4: { type: "qa", emoji: "⚔️", label: "Construction du conflit", detail: "8 questions : l'événement déclencheur, l'obstacle, l'adversaire, le premier essai, le dilemme, le choix impossible, le moment de vérité, l'après. Le cœur du récit.", tags: ["Conflit", "Tension", "Arc narratif"] },
  m5: { type: "qa", emoji: "💎", label: "Sens et thème", detail: "5 questions pour prendre du recul : le pitch en une phrase, l'émotion du spectateur, le vrai message, la scène clé, le titre du film.", tags: ["Thème", "Pitch", "Titre"] },
};

// ─── Cover images per module (Unsplash free, cinema/education themed) ───
const MODULE_COVERS: Record<string, { url: string; credit: string }> = {
  m1a: { url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=300&fit=crop", credit: "Jakob Owens" },
  m1b: { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=300&fit=crop", credit: "Federico Respini" },
  m1c: { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=300&fit=crop", credit: "Patrick Perkins" },
  m1d: { url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=300&fit=crop", credit: "Jason Blackeye" },
  m1e: { url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=300&fit=crop", credit: "Aaron Burden" },
  u2a: { url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=300&fit=crop", credit: "Felix Mooneeram" },
  u2b: { url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=300&fit=crop", credit: "Jeremy Yap" },
  u2c: { url: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=600&h=300&fit=crop", credit: "Mon Esprit" },
  u2d: { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop", credit: "Joseph Frank" },
  m2a: { url: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&h=300&fit=crop", credit: "Denise Jans" },
  m2b: { url: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&h=300&fit=crop", credit: "Markus Winkler" },
  m2c: { url: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=600&h=300&fit=crop", credit: "Jacob Rank" },
  m2d: { url: "https://images.unsplash.com/photo-1504711434969-e33886168d9c?w=600&h=300&fit=crop", credit: "Brands People" },
  "m2-perso": { url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=300&fit=crop", credit: "Myke Simon" },
  m3: { url: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&h=300&fit=crop", credit: "Aiony Haust" },
  m4: { url: "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=600&h=300&fit=crop", credit: "Jakob Owens" },
  m5: { url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=300&fit=crop", credit: "Krists Luhaers" },
};

// ─── Ambient video loops per module (Mixkit free, cinema themed, 360p for perf) ───
const MODULE_VIDEOS: Record<string, string> = {
  m1a: "https://assets.mixkit.co/active_storage/video_items/100283/1722631957/100283-video-360.mp4", // cinema audience
  m1b: "https://assets.mixkit.co/videos/48529/48529-360.mp4", // camera lens rotating
  m1e: "https://assets.mixkit.co/videos/10396/10396-360.mp4", // typewriter close-up
  u2a: "https://assets.mixkit.co/videos/2860/2860-360.mp4",   // movie tape reels
  u2b: "https://assets.mixkit.co/videos/49326/49326-360.mp4", // clapperboard
  u2d: "https://assets.mixkit.co/videos/22522/22522-360.mp4", // large stage light
  m2a: "https://assets.mixkit.co/videos/35669/35669-360.mp4", // spotlights blinking
  m2c: "https://assets.mixkit.co/videos/2374/2374-360.mp4",   // camera shutter dramatic
  m3:  "https://assets.mixkit.co/videos/1038/1038-360.mp4",   // dancer in spotlight
  m4:  "https://assets.mixkit.co/videos/35669/35669-360.mp4", // spotlights (tension)
  m5:  "https://assets.mixkit.co/videos/22522/22522-360.mp4", // stage light (sens)
};

interface ModuleBriefingProps {
  module: ModuleDef;
  phase: PhaseDef | undefined;
  moduleGuide: ModuleGuide | undefined;
  isInProgress: boolean;
  isCompleted: boolean;
  onLaunch: () => void;
  onResume: () => void;
}

export function ModuleBriefing({
  module,
  phase,
  moduleGuide,
  isInProgress,
  isCompleted,
  onLaunch,
  onResume,
}: ModuleBriefingProps) {
  const [showDeroule, setShowDeroule] = useState(false);
  const [showConseils, setShowConseils] = useState(false);
  const activity = MODULE_ACTIVITIES[module.id];
  const cover = MODULE_COVERS[module.id];
  const video = MODULE_VIDEOS[module.id];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 pb-28">

        {/* ── HERO HEADER — bold, colorful, with cover image ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-2xl -mx-4 mt-2"
        >
          {/* Cover media — video (ambient loop) or animated image (Ken Burns) */}
          {(video || cover) && (
            <div className="relative h-44 overflow-hidden">
              {/* Video background */}
              {video && (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  loop
                  playsInline
                  onCanPlay={() => setVideoLoaded(true)}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
                >
                  <source src={video} type="video/mp4" />
                </video>
              )}
              {/* Fallback / image with Ken Burns animation */}
              {cover && (
                <motion.img
                  src={cover.url}
                  alt={module.title}
                  animate={{ scale: [1, 1.12], x: [0, 15], y: [0, -5] }}
                  transition={{ duration: 25, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  className={`absolute inset-0 w-full h-full object-cover ${video && videoLoaded ? "opacity-0" : "opacity-100"} transition-opacity duration-1000`}
                />
              )}
              {/* Animated light leak overlay */}
              <motion.div
                animate={{ opacity: [0.1, 0.3, 0.1], x: [-40, 40, -40] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 mix-blend-overlay pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 30% 50%, ${module.color}80, transparent 55%)` }}
              />
              {/* Second light leak — opposite side */}
              <motion.div
                animate={{ opacity: [0.05, 0.2, 0.05], x: [30, -30, 30] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                className="absolute inset-0 mix-blend-overlay pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 70% 60%, ${module.color}60, transparent 50%)` }}
              />
              {/* Gradient overlay — color-tinted fade to dark */}
              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${module.color}20 0%, ${module.color}50 50%, #08090E 100%)` }} />
              {/* Scanlines effect */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)" }} />
              {/* Film grain texture */}
              <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E\")" }} />
              {/* Credit */}
              {cover && !videoLoaded && <span className="absolute bottom-1 right-2 text-[8px] text-white/30">📷 {cover.credit}</span>}
            </div>
          )}

          {/* Content area with gradient bg if no cover */}
          <div style={!cover ? { background: `linear-gradient(145deg, ${module.color}35 0%, ${module.color}18 40%, #08090E 100%)` } : { background: `linear-gradient(180deg, #08090E 0%, ${module.color}10 100%)` }}>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ background: `radial-gradient(circle, ${module.color}20, transparent 70%)` }} />

          {/* Large icon watermark */}
          {!cover && (
            <div className="absolute top-4 right-6 opacity-[0.12]" style={{ color: module.color }}>
              <ModuleIcon iconKey={module.iconKey} size={140} />
            </div>
          )}

          <div className="relative px-6 pt-6 pb-5 space-y-4">
            {/* Phase + status badges */}
            <div className="flex items-center gap-2">
              {phase && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${module.color}30`, color: module.color, border: `1px solid ${module.color}40` }}>
                  {phase.emoji} {phase.label}
                </span>
              )}
              {isCompleted && (
                <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-bw-teal/25 text-bw-teal border border-bw-teal/30">
                  Terminé
                </span>
              )}
              {isInProgress && !isCompleted && (
                <motion.span
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-bw-primary/25 text-bw-primary border border-bw-primary/30"
                >
                  En cours
                </motion.span>
              )}
            </div>

            {/* Title + icon */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${module.color}, ${module.color}AA)`, boxShadow: `0 8px 24px ${module.color}50` }}
              >
                <div className="text-white">
                  <ModuleIcon iconKey={module.iconKey} size={30} />
                </div>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold font-cinema tracking-wide">{module.title}</h1>
                <p className="text-sm text-white/60">{module.subtitle}</p>
              </div>
            </div>

            {/* Meta pills — colorful */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full text-white/90" style={{ background: `${module.color}25`, border: `1px solid ${module.color}35` }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                {module.duration}
              </span>
              <span className="text-[11px] font-medium px-3 py-1.5 rounded-full text-white/90" style={{ background: `${module.color}25`, border: `1px solid ${module.color}35` }}>
                {module.questions} question{module.questions !== 1 ? "s" : ""}
              </span>
              {activity && (
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-full text-white" style={{ background: `linear-gradient(135deg, ${module.color}60, ${module.color}40)`, border: `1px solid ${module.color}50` }}>
                  {activity.emoji} {activity.type === "quiz" ? "Quiz" : activity.type === "image" ? "Image" : activity.type === "game" ? "Jeu" : activity.type === "debate" ? "Débat" : activity.type === "checklist" ? "Checklist" : activity.type === "notebook" ? "Carnet" : "Q&R"}
                </span>
              )}
            </div>
          </div>

          </div>
          {/* Bottom color bar */}
          <div className="h-1" style={{ background: `linear-gradient(90deg, ${module.color}, ${module.color}60, transparent)` }} />
        </motion.div>

        <div className="space-y-4 mt-5">

          {/* ── WHAT STUDENTS WILL DO — big colorful card ── */}
          {activity && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl p-5 space-y-3 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${module.color}20, ${module.color}08)`, border: `2px solid ${module.color}35` }}
            >
              {/* Animated floating emoji background */}
              <motion.div
                animate={{ y: [-5, 5, -5], rotate: [-3, 3, -3], opacity: [0.08, 0.14, 0.08] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-2 -right-2 text-[80px] leading-none pointer-events-none"
              >
                {activity.emoji}
              </motion.div>
              <div className="relative">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-2xl">{activity.emoji}</span>
                  <h3 className="text-base font-bold" style={{ color: module.color }}>{activity.label}</h3>
                </div>
                <p className="text-sm text-bw-heading leading-relaxed">{activity.detail}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {activity.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ background: `${module.color}20`, color: module.color, border: `1px solid ${module.color}30` }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── 2-COLUMN GRID: Note prof + Objectif ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {/* Teacher note */}
            {module.teacherNote && (
              <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,107,53,0.04))", border: "1px solid rgba(255,107,53,0.2)" }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">🎬</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-bw-primary">Note prof</p>
                </div>
                <p className="text-xs text-bw-heading leading-relaxed">{module.teacherNote}</p>
              </div>
            )}

            {/* Objectif pédagogique */}
            {moduleGuide && (
              <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.04))", border: "1px solid rgba(139,92,246,0.2)" }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">🎯</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-bw-violet">Objectif</p>
                </div>
                <p className="text-xs text-bw-heading leading-relaxed line-clamp-4">{moduleGuide.objectifPedagogique}</p>
                {moduleGuide.socleCommun?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {moduleGuide.socleCommun.map((d) => (
                      <span key={d} className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-bw-violet/20 text-bw-violet border border-bw-violet/25" title={SOCLE_LABELS[d]}>{d}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* ── À DIRE AUX ÉLÈVES — prominent colorful card ── */}
          {moduleGuide && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(78,205,196,0.15), rgba(78,205,196,0.05))", border: "2px solid rgba(78,205,196,0.3)" }}
            >
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🗣️</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-bw-teal">
                      À dire aux élèves
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(moduleGuide.introADire);
                      toast.success("Copié !");
                    }}
                    className="text-[10px] font-bold text-bw-teal cursor-pointer transition-all px-3 py-1 rounded-full bg-bw-teal/15 hover:bg-bw-teal/25 border border-bw-teal/25"
                  >
                    Copier
                  </button>
                </div>
                <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative pl-4" style={{ borderLeft: "3px solid rgba(78,205,196,0.4)" }}
              >
                  <p className="text-sm text-bw-heading leading-relaxed italic">
                    &ldquo;{moduleGuide.introADire}&rdquo;
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ── DÉROULÉ — collapsible ── */}
          {moduleGuide && moduleGuide.phases?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={() => setShowDeroule(!showDeroule)}
                className="w-full flex items-center gap-2 py-2 cursor-pointer group"
              >
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7D828A" strokeWidth="2" strokeLinecap="round"
                  className={`transition-transform ${showDeroule ? "rotate-90" : ""}`}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-bw-muted group-hover:text-white transition-colors">
                  Déroulé ({moduleGuide.duration})
                </span>
                <span className="text-[10px] text-bw-muted">{moduleGuide.phases.length} étapes</span>
              </button>
              {showDeroule && (
                <div className="ml-1 space-y-0 mt-1">
                  {moduleGuide.phases.map((p, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ backgroundColor: module.color + "20", color: module.color }}>
                          {i + 1}
                        </div>
                        {i < moduleGuide.phases.length - 1 && <div className="w-px flex-1 bg-white/[0.06] my-0.5" />}
                      </div>
                      <div className="pb-3 flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-semibold">{p.name}</span>
                          <span className="text-[10px] text-bw-muted">{p.timing}</span>
                        </div>
                        <p className="text-[11px] text-bw-muted leading-relaxed">{p.instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── CONSEILS — collapsible ── */}
          {moduleGuide && moduleGuide.conseils?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <button
                onClick={() => setShowConseils(!showConseils)}
                className="w-full flex items-center gap-2 py-2 cursor-pointer group"
              >
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7D828A" strokeWidth="2" strokeLinecap="round"
                  className={`transition-transform ${showConseils ? "rotate-90" : ""}`}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-bw-green group-hover:text-white transition-colors">
                  Conseils
                </span>
                <span className="text-[10px] text-bw-muted">{moduleGuide.conseils.length} tips</span>
              </button>
              {showConseils && (
                <ul className="ml-5 mt-1 space-y-1">
                  {moduleGuide.conseils.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-bw-text leading-relaxed">
                      <span className="text-bw-green flex-shrink-0">&#x2713;</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}

          {/* ── Fallback — no guide ── */}
          {!moduleGuide && !activity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-bw-surface rounded-xl border border-dashed border-white/10 p-4 text-center"
            >
              <p className="text-xs text-bw-muted">Guide pédagogique à venir</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── CTA — sticky bottom ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {isCompleted && (
            <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-bw-teal/15 text-bw-teal flex-shrink-0">
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
              style={{ background: "linear-gradient(135deg, #4ECDC4, #2BA69F)", boxShadow: "0 4px 15px rgba(78,205,196,0.3)" }}
            >
              Reprendre le module
            </motion.button>
          ) : isCompleted ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={onLaunch}
              className="px-6 py-3 rounded-2xl font-bold text-sm cursor-pointer transition-all bg-bw-elevated border border-white/[0.1] text-bw-text hover:border-white/20"
            >
              Relancer
            </motion.button>
          ) : (
            <div className="relative">
              {/* Animated glow ring behind button */}
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-1 rounded-2xl blur-md"
                style={{ background: `linear-gradient(135deg, ${module.color}60, ${module.color}30)` }}
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={onLaunch}
                className="btn-glow relative px-8 py-4 rounded-2xl font-bold text-base cursor-pointer transition-all text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${module.color}, ${module.color}CC)`, boxShadow: `0 4px 20px ${module.color}40` }}
              >
                Lancer le module
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
