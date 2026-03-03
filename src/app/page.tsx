"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { BrandMark, BrandLogo } from "@/components/brand-logo";
import { gradients } from "@/lib/theme";

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const STEPS = [
  {
    num: "01",
    title: "Cree ta partie",
    desc: "Choisis un module, lance la session. Un code unique est genere instantanement.",
    color: "#FF6B35",
    gradient: "from-[#FF6B35] to-[#E85D26]",
  },
  {
    num: "02",
    title: "Les joueurs rejoignent",
    desc: "Code ou QR code — pas de compte, pas de telechargement. Sur telephone, en 5 secondes.",
    color: "#4ECDC4",
    gradient: "from-[#4ECDC4] to-[#2B9A93]",
  },
  {
    num: "03",
    title: "Jouez ensemble",
    desc: "Repondez, votez, debattez. L'histoire prend forme collectivement. Le facilitateur pilote.",
    color: "#8B5CF6",
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
  },
];

const FEATURES = [
  {
    title: "Collaboratif",
    desc: "5 a 30 joueurs construisent une histoire ensemble, chacun sur son telephone. Chaque voix compte.",
    color: "#FF6B35",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: "Guide par l'IA",
    desc: "Un facilitateur pilote, l'IA accompagne. Questions, votes, choix collectifs — tout est fluide et adaptatif.",
    color: "#8B5CF6",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: "Cinematique",
    desc: "Contraintes de production, personnages, conflits, denouement — un vrai court-metrage nait en une heure.",
    color: "#4ECDC4",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" />
        <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
      </svg>
    ),
  },
];

const MODULES = [
  {
    title: "Confiance + Diagnostic",
    desc: "3 images, 4 questions. Observer, interpreter, imaginer — on diagnostique le groupe.",
    badge: "Bientot",
    badgeStyle: "glass text-bw-muted",
    color: "#7D828A",
    bgGradient: "from-white/[0.04] to-transparent",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    title: "Contrainte + Responsabilite",
    desc: "Tu es producteur. 100 credits pour faire ton film. Choisir c'est renoncer.",
    badge: "~45 min",
    badgeStyle: "bg-bw-amber/10 text-bw-amber border border-bw-amber/20 font-semibold",
    color: "#F59E0B",
    bgGradient: "from-[rgba(245,158,11,0.1)] to-[rgba(245,158,11,0.02)]",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Construction de l'histoire",
    desc: "Personnages, conflits, denouement — les joueurs vivent des situations, votent, et le film prend forme.",
    badge: "3 seances",
    badgeStyle: "bg-bw-primary/10 text-bw-primary border border-bw-primary/20 font-semibold",
    color: "#FF6B35",
    bgGradient: "from-[rgba(255,107,53,0.1)] to-[rgba(255,107,53,0.02)]",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        <path d="M8 7h8M8 11h6" />
      </svg>
    ),
  },
];

const AVATAR_COLORS = ["#FF6B35", "#4ECDC4", "#8B5CF6", "#D4A843", "#EC4899", "#10B981"];

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER HOOK
   ═══════════════════════════════════════════════════════════════ */

function useCountUp(target: number, duration = 2000, startOnView = false) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    }
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return { count, ref };
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms for floating orbs
  const orbY1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const orbY3 = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const orbX1 = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const orbX2 = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const orbX3 = useTransform(scrollYProgress, [0, 1], [0, 40]);

  const { count: gamesCount, ref: counterRef } = useCountUp(500, 2200, true);

  return (
    <div className="min-h-dvh bg-studio flex flex-col overflow-hidden">

      {/* ──────────────── NAV ──────────────── */}
      <nav className="px-6 py-5 flex-shrink-0 relative z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BrandLogo size="sm" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <Link
              href="/join"
              className="text-sm text-bw-muted hover:text-bw-heading transition-colors duration-300 hidden sm:inline-flex items-center gap-1.5"
            >
              Rejoindre
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_4px_24px_rgba(255,107,53,0.35)]"
              style={{ background: gradients.cinema }}
            >
              Creer une partie
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
         1. HERO — "Opening Shot"
         ══════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 py-24 sm:py-32 text-center overflow-hidden"
      >
        {/* ── Parallax floating glass orbs ── */}
        <motion.div
          style={{ y: orbY1, x: orbX1, willChange: "transform" }}
          className="absolute top-[15%] left-[10%] w-64 h-64 sm:w-80 sm:h-80 rounded-full pointer-events-none"
        >
          <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(255,107,53,0.08)_0%,transparent_70%)] blur-xl" />
        </motion.div>
        <motion.div
          style={{ y: orbY2, x: orbX2, willChange: "transform" }}
          className="absolute top-[55%] right-[8%] w-56 h-56 sm:w-72 sm:h-72 rounded-full pointer-events-none"
        >
          <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(78,205,196,0.07)_0%,transparent_70%)] blur-xl" />
        </motion.div>
        <motion.div
          style={{ y: orbY3, x: orbX3, willChange: "transform" }}
          className="absolute top-[30%] right-[25%] w-48 h-48 sm:w-64 sm:h-64 rounded-full pointer-events-none"
        >
          <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_70%)] blur-xl" />
        </motion.div>

        {/* ── Ambient glow layers ── */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,107,53,0.06),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(78,205,196,0.04),transparent_50%)]" />

        {/* ── Film strip decorations ── */}
        <motion.div
          animate={{ y: [0, -16, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
          className="absolute left-2 lg:left-8 top-[20%] bottom-[20%] w-6 opacity-[0.04] hidden md:flex flex-col items-center justify-center gap-3"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-3 h-5 rounded-sm bg-bw-heading" />
          ))}
        </motion.div>
        <motion.div
          animate={{ y: [0, 16, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
          className="absolute right-2 lg:right-8 top-[20%] bottom-[20%] w-6 opacity-[0.04] hidden md:flex flex-col items-center justify-center gap-3"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-3 h-5 rounded-sm bg-bw-heading" />
          ))}
        </motion.div>

        <div className="relative max-w-3xl mx-auto space-y-10 z-10">
          {/* ── Animated logo mark ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex items-center justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 8, repeatDelay: 4, ease: "easeInOut" }}
              >
                <BrandMark size="xl" color="cinema" />
              </motion.div>
              {/* Glow ring */}
              <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-bw-primary/15 via-bw-gold/10 to-bw-primary/15 blur-2xl opacity-60" />
            </div>
          </motion.div>

          {/* ── Main title ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="bw-display text-7xl sm:text-8xl lg:text-9xl tracking-wider">
              <span className="text-bw-heading">BANLIEU</span>
              <span className="text-gradient-cinema">WOOD</span>
            </h1>
          </motion.div>

          {/* ── Tagline ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <p className="text-xl sm:text-2xl lg:text-3xl text-bw-text leading-relaxed max-w-xl mx-auto font-light">
              Le jeu ou vous ecrivez un{" "}
              <span className="text-gradient-cinema font-semibold">court-metrage</span>{" "}
              ensemble.
            </p>
          </motion.div>

          {/* ── Stats bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="flex items-center justify-center"
          >
            <div className="glass-card inline-flex items-center gap-4 sm:gap-6 px-6 sm:px-8 py-3 sm:py-3.5">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                <span className="text-sm sm:text-base font-semibold text-bw-heading">5-30 joueurs</span>
              </div>
              <div className="w-px h-4 bg-bw-border" />
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                <span className="text-sm sm:text-base font-semibold text-bw-heading">45 min</span>
              </div>
              <div className="w-px h-4 bg-bw-border" />
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span className="text-sm sm:text-base font-semibold text-bw-heading">0 compte requis</span>
              </div>
            </div>
          </motion.div>

          {/* ── CTA buttons ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 pt-2 max-w-lg mx-auto"
          >
            <Link
              href="/join"
              className="btn-glow flex-1 inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-white text-base transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(255,107,53,0.4)] active:scale-[0.98]"
              style={{
                background: gradients.cinema,
                boxShadow: "0 4px 24px rgba(255,107,53,0.3)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Rejoindre une partie
            </Link>
            <Link
              href="/free"
              className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-bw-heading text-base glass-card transition-all duration-300 hover:bg-white/[0.08] hover:border-white/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              Jouer seul
            </Link>
            <Link
              href="/login"
              className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium text-bw-muted text-base border border-bw-border transition-all duration-300 hover:text-bw-heading hover:border-white/10 hover:bg-white/[0.03] active:scale-[0.98]"
            >
              Creer une partie
            </Link>
          </motion.div>
        </div>

        {/* ── Scroll hint ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-8 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-bw-muted font-medium">Decouvrir</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-bw-muted">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         2. HOW IT WORKS — "Le Tournage"
         ══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(78,205,196,0.04),transparent_60%)]" />

        <div className="max-w-5xl mx-auto relative">
          {/* Section badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block text-[11px] font-semibold tracking-[0.25em] uppercase text-bw-teal mb-4 px-5 py-2 rounded-full border border-bw-teal/20 bg-bw-teal/5">
              Comment ca marche
            </span>
            <h2 className="bw-display text-4xl sm:text-5xl lg:text-6xl tracking-wider text-bw-heading mt-6">
              LE{" "}
              <span className="text-gradient-teal">TOURNAGE</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* ── Horizontal timeline (desktop) ── */}
            <div className="hidden md:block absolute top-[3.5rem] left-[16%] right-[16%] h-px">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full origin-left"
                style={{
                  background: "linear-gradient(90deg, #FF6B35, #4ECDC4, #8B5CF6)",
                  opacity: 0.3,
                }}
              />
            </div>

            {/* ── Vertical timeline (mobile) ── */}
            <div className="md:hidden absolute left-[2.25rem] top-[5rem] bottom-[5rem] w-px">
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full origin-top"
                style={{
                  background: "linear-gradient(180deg, #FF6B35, #4ECDC4, #8B5CF6)",
                  opacity: 0.3,
                }}
              />
            </div>

            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative"
              >
                <div className="glass-card p-7 sm:p-8 text-center md:text-center space-y-5 group transition-all duration-300 hover:border-white/10 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                  {/* Number badge */}
                  <div className="relative z-10 mx-auto md:mx-auto">
                    <div
                      className={`w-16 h-16 rounded-2xl font-cinema text-2xl tracking-wider flex items-center justify-center text-white mx-auto relative transition-all duration-300 group-hover:scale-110 bg-gradient-to-br ${step.gradient}`}
                      style={{ boxShadow: `0 8px 28px ${step.color}30` }}
                    >
                      {step.num}
                      {/* LED indicator */}
                      <div
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-bw-bg"
                        style={{ background: step.color, boxShadow: `0 0 10px ${step.color}80` }}
                      />
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-bw-heading">{step.title}</h3>
                  <p className="text-sm text-bw-muted leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </div>

                {/* Connection dot between cards (desktop) */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden md:block absolute top-[3.35rem] -right-[1.75rem] w-3 h-3 rounded-full border-2 border-bw-bg z-10"
                    style={{ background: step.color, boxShadow: `0 0 12px ${step.color}60` }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         3. FEATURES — "L'Experience"
         ══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(139,92,246,0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,107,53,0.03),transparent_50%)]" />

        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block text-[11px] font-semibold tracking-[0.25em] uppercase text-bw-gold mb-4 px-5 py-2 rounded-full border border-bw-gold/20 bg-bw-gold/5">
              L&apos;experience
            </span>
            <h2 className="bw-display text-4xl sm:text-5xl lg:text-6xl tracking-wider text-bw-heading mt-6">
              POURQUOI{" "}
              <span className="text-gradient-cinema">BANLIEUWOOD</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="poster-card glass-card rounded-2xl overflow-hidden group"
              >
                {/* Gradient header bar */}
                <div
                  className="h-[3px] transition-all duration-500 group-hover:h-1.5"
                  style={{ background: `linear-gradient(90deg, ${feat.color}, ${feat.color}60)` }}
                />

                <div className="p-7 sm:p-8 space-y-5">
                  {/* Icon container */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      background: `linear-gradient(135deg, ${feat.color}18, ${feat.color}08)`,
                      color: feat.color,
                      boxShadow: `0 0 0 1px ${feat.color}15`,
                    }}
                  >
                    {feat.icon}
                  </div>
                  <h3 className="font-bold text-xl text-bw-heading">{feat.title}</h3>
                  <p className="text-sm text-bw-muted leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         4. MODULES — "3 Modules, 3 Experiences"
         ══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_30%,rgba(255,107,53,0.04),transparent_55%)]" />

        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <span className="inline-block text-[11px] font-semibold tracking-[0.25em] uppercase text-bw-primary mb-4 px-5 py-2 rounded-full border border-bw-primary/20 bg-bw-primary/5">
              3 Modules, 3 Experiences
            </span>
            <h2 className="bw-display text-4xl sm:text-5xl lg:text-6xl tracking-wider text-bw-heading mt-6">
              LE{" "}
              <span className="text-gradient-cinema">PROGRAMME</span>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-bw-muted text-base mb-16 max-w-md mx-auto leading-relaxed"
          >
            Chaque module est une etape vers le court-metrage final.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {MODULES.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="poster-card glass-card rounded-2xl overflow-hidden group"
                style={mod.color !== "#7D828A" ? { borderColor: `${mod.color}15` } : undefined}
              >
                <div
                  className={`h-28 bg-gradient-to-br ${mod.bgGradient} flex items-center justify-center relative`}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: mod.color === "#7D828A"
                        ? `linear-gradient(135deg, ${mod.color}99, ${mod.color}50)`
                        : `linear-gradient(135deg, ${mod.color}, ${mod.color}CC)`,
                      boxShadow: `0 8px 24px ${mod.color}30`,
                      color: mod.color === "#7D828A" ? "rgba(255,255,255,0.7)" : "white",
                    }}
                  >
                    {mod.icon}
                  </div>
                  <span className={`absolute top-3 right-3 text-[10px] px-3 py-1 rounded-full ${mod.badgeStyle}`}>
                    {mod.badge}
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="font-bold text-lg text-bw-heading">{mod.title}</h3>
                  <p className="text-sm text-bw-muted leading-relaxed">{mod.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         5. SOCIAL PROOF — "Ils jouent deja"
         ══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,168,67,0.05),transparent_60%)]" />

        <div className="max-w-3xl mx-auto text-center space-y-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[11px] font-semibold tracking-[0.25em] uppercase text-bw-gold mb-4 px-5 py-2 rounded-full border border-bw-gold/20 bg-bw-gold/5">
              Ils jouent deja
            </span>
          </motion.div>

          {/* Animated counter */}
          <motion.div
            ref={counterRef}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-2"
          >
            <div className="bw-display text-6xl sm:text-7xl lg:text-8xl tracking-wider text-gradient-cinema">
              +{gamesCount}
            </div>
            <p className="text-lg text-bw-muted font-medium">parties jouees</p>
          </motion.div>

          {/* Avatar stack */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-5"
          >
            <div className="flex -space-x-3">
              {AVATAR_COLORS.map((color, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 280, damping: 20 }}
                  className="w-10 h-10 rounded-full border-2 border-bw-bg flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}BB)`,
                    boxShadow: `0 0 14px ${color}35`,
                  }}
                >
                  {["A", "M", "S", "L", "K", "J"][i]}
                </motion.div>
              ))}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, type: "spring", stiffness: 280, damping: 20 }}
                className="w-10 h-10 rounded-full border-2 border-bw-bg flex items-center justify-center text-xs font-semibold text-bw-muted bg-bw-elevated"
              >
                +494
              </motion.div>
            </div>
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <div className="relative glass-card p-8 sm:p-10 mx-auto max-w-lg">
              {/* Gold accent line top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[2px] rounded-full bg-gradient-to-r from-transparent via-bw-gold to-transparent" />

              {/* Label */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bw-bg px-4 py-0.5 text-[10px] uppercase tracking-[0.2em] text-bw-gold font-semibold border border-bw-gold/20 rounded-full">
                Temoignage
              </div>

              <p className="text-xl sm:text-2xl font-medium leading-relaxed text-bw-heading pt-2">
                &ldquo;Un vrai outil de{" "}
                <span className="text-gradient-cinema font-bold">formation artistique</span>{" "}
                deguise en jeu.&rdquo;
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bw-gold to-bw-gold-500 flex items-center justify-center text-white text-xs font-bold">
                  P
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-bw-heading">Prof. de francais</p>
                  <p className="text-xs text-bw-muted">College, Paris</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         6. CINEMA QUOTE
         ══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-20 relative">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative glass-card p-8 sm:p-12 overflow-hidden">
              {/* Gold accent bar left */}
              <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-bw-gold via-bw-primary to-bw-gold/40" />

              {/* Corner marks */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-bw-gold/25 rounded-tl-sm" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-bw-gold/25 rounded-tr-sm" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-bw-gold/25 rounded-bl-sm" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-bw-gold/25 rounded-br-sm" />

              {/* Ambient glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-bw-primary/[0.04] via-bw-gold/[0.03] to-bw-violet/[0.04]" />

              <div className="relative flex items-start gap-4 pl-4">
                <span className="text-6xl text-bw-gold font-serif leading-none select-none mt-[-0.15em]">&ldquo;</span>
                <div className="pt-1">
                  <p className="text-lg sm:text-xl italic text-bw-text leading-relaxed font-light">
                    Le cinema, c&apos;est l&apos;ecriture moderne dont l&apos;encre est la lumiere.
                  </p>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-bw-gold/30 to-transparent" />
                    <p className="text-xs text-bw-gold font-semibold tracking-[0.15em] uppercase">Jean Cocteau</p>
                    <div className="h-px flex-1 bg-gradient-to-l from-bw-gold/30 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         7. BOTTOM CTA — "Pret a Jouer ?"
         ══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-32 relative overflow-hidden">
        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 bg-gradient-to-t from-bw-surface via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_70%,rgba(255,107,53,0.1),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(78,205,196,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(139,92,246,0.05),transparent_50%)]" />

        <div className="max-w-lg mx-auto text-center space-y-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            <h2 className="bw-display text-5xl sm:text-6xl lg:text-7xl tracking-wider text-bw-heading">
              PRET A{" "}
              <span className="text-gradient-cinema">JOUER</span>
              {" "}?
            </h2>
            <p className="text-base sm:text-lg text-bw-muted max-w-sm mx-auto leading-relaxed">
              Gratuit. Pas de compte pour les joueurs. Lancez une partie en 30 secondes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/join"
              className="btn-glow flex-1 inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-white text-base transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(255,107,53,0.4)] active:scale-[0.98]"
              style={{
                background: gradients.cinema,
                boxShadow: "0 4px 24px rgba(255,107,53,0.3)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Rejoindre une partie
            </Link>
            <Link
              href="/free"
              className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-bw-heading text-base glass-card transition-all duration-300 hover:bg-white/[0.08] hover:border-white/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              Jouer seul
            </Link>
            <Link
              href="/login"
              className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium text-bw-muted text-base border border-bw-border transition-all duration-300 hover:text-bw-heading hover:border-white/10 hover:bg-white/[0.03] active:scale-[0.98]"
            >
              Creer une partie
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         8. FOOTER (rich)
         ══════════════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-bw-border bg-bw-surface/50">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,107,53,0.03),transparent_50%)]" />

        <div className="max-w-6xl mx-auto px-6 py-16 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-span-1 space-y-4">
              <BrandLogo size="sm" />
              <p className="text-sm text-bw-muted leading-relaxed max-w-xs">
                Le jeu collaboratif de creation cinematographique. En classe, en famille, entre amis.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3 pt-2">
                {[
                  { label: "Twitter", path: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" },
                  { label: "Instagram", path: "M16 4H8a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4V8a4 4 0 00-4-4zM12 15a3 3 0 110-6 3 3 0 010 6zM17.5 7.5a.5.5 0 110-1 .5.5 0 010 1z" },
                  { label: "YouTube", path: "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" },
                ].map(({ label, path }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-bw-muted hover:text-bw-heading hover:bg-white/[0.04] transition-all duration-200"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Produit */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-bw-heading">Produit</h4>
              <ul className="space-y-3">
                {["Rejoindre une partie", "Jouer seul", "Creer une partie", "Comment ca marche"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-bw-muted hover:text-bw-heading transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ressources */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-bw-heading">Ressources</h4>
              <ul className="space-y-3">
                {["Guide du facilitateur", "Fiches pedagogiques", "FAQ", "Contact"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-bw-muted hover:text-bw-heading transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-bw-heading">Legal</h4>
              <ul className="space-y-3">
                {["Mentions legales", "Politique de confidentialite", "CGU", "Accessibilite"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-bw-muted hover:text-bw-heading transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-14 pt-6 border-t border-bw-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-bw-placeholder">
              &copy; {new Date().getFullYear()} Banlieuwood. Tous droits reserves.
            </p>
            <div className="flex items-center gap-2 text-xs text-bw-placeholder">
              <span>Fait avec</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF6B35" stroke="none">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              <span>pour le cinema</span>
              <div className="w-1 h-1 rounded-full bg-bw-gold/40 mx-1" />
              <span className="text-bw-gold/60">v1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
