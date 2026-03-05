"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BrandMark, BrandLogo, BrandStyles } from "@/components/brand-logo";
import {
  ClapperboardIllustration,
  FilmReelIllustration,
  CameraIllustration,
} from "@/components/cinema-illustrations";

/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER
   ═══════════════════════════════════════════════════════════════ */

const SCREENPLAY_LINES = [
  "INT. SALLE DE CLASSE \u2014 JOUR",
  "",
  "30 eleves. Une tablette chacun.",
  "En 45 minutes, ils ecrivent",
  "un court-metrage.",
];

function useTypewriter(lines: string[], charDelay = 30, lineDelay = 350) {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let lineIdx = 0;
    let charIdx = 0;
    let cancelled = false;

    function tick() {
      if (cancelled) return;
      if (lineIdx >= lines.length) {
        setDone(true);
        return;
      }
      const line = lines[lineIdx];
      if (line === "") {
        setDisplayed((p) => {
          const n = [...p];
          n[lineIdx] = "";
          return n;
        });
        lineIdx++;
        charIdx = 0;
        setTimeout(tick, lineDelay / 2);
        return;
      }
      if (charIdx <= line.length) {
        setDisplayed((p) => {
          const n = [...p];
          n[lineIdx] = line.slice(0, charIdx);
          return n;
        });
        charIdx++;
        setTimeout(tick, charIdx === 1 ? lineDelay : charDelay);
      } else {
        lineIdx++;
        charIdx = 0;
        setTimeout(tick, lineDelay);
      }
    }
    const id = setTimeout(tick, 600);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [lines, charDelay, lineDelay]);

  return { displayed, done };
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════════════════════════════════ */

function Reveal({
  children,
  className = "",
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BROWSER MOCKUP — reusable mini "app window" frame
   ═══════════════════════════════════════════════════════════════ */

function AppWindow({
  url,
  children,
  className = "",
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-white/[0.08] overflow-hidden ${className}`}
      style={{ background: "#0a0c12" }}
    >
      <div
        className="h-6 flex items-center gap-1.5 px-2.5 border-b border-white/[0.04]"
        style={{ background: "#080a10" }}
      >
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white/[0.1]" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/[0.1]" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/[0.1]" />
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-[8px] text-[#5c5c60]">{url}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function Home() {
  const { displayed, done } = useTypewriter(SCREENPLAY_LINES);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-dvh bg-bw-bg text-bw-text antialiased">
      <BrandStyles />

      {/* ──────────── FIXED NAV ──────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 transition-all duration-200"
        style={{
          background: scrolled ? "rgba(15,17,24,0.75)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid transparent",
        }}
      >
        <div className="max-w-[1080px] mx-auto w-full flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark size="sm" color="cinema" animated={false} />
            <span className="text-sm font-semibold text-bw-heading tracking-wide hidden sm:block">
              BANLIEUWOOD
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/join"
              className="text-[13px] text-[#8b8b8e] hover:text-bw-heading px-3 py-1.5 rounded-md hover:bg-white/[0.04] transition-all duration-150"
            >
              Rejoindre
            </Link>
            <Link
              href="/free"
              className="text-[13px] text-[#8b8b8e] hover:text-bw-heading px-3 py-1.5 rounded-md hover:bg-white/[0.04] transition-all duration-150 hidden sm:block"
            >
              Jouer seul
            </Link>
            <Link
              href="/login"
              className="ml-2 h-8 px-3.5 inline-flex items-center text-[13px] font-medium rounded-lg bg-[#ededef] text-[#0F1118] hover:bg-white transition-all duration-150"
            >
              Creer une partie
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════
         1. HERO
         ════════════════════════════════════════════════════════ */}
      <section className="relative min-h-svh flex flex-col items-center justify-center px-6 pt-28 pb-8">
        {/* Ambient glow */}
        <div
          className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,107,53,0.08) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        <div className="relative max-w-[800px] mx-auto text-center space-y-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <BrandMark size="lg" color="cinema" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-bw-heading"
            style={{
              fontFamily: "var(--font-cinema), 'Bebas Neue', sans-serif",
              fontSize: "clamp(48px, 8vw, 88px)",
              lineHeight: 1.0,
              letterSpacing: "0.02em",
            }}
          >
            Ecrivez un court-metrage.{" "}
            <span className="text-gradient-cinema">Ensemble.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[#8b8b8e] max-w-[480px] mx-auto leading-relaxed"
            style={{ fontSize: "clamp(16px, 2vw, 19px)" }}
          >
            5 a 30 eleves sur tablette ou ordinateur. 45 minutes. Aucun compte
            requis. Le jeu collaboratif de creation cinematographique.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-3 pt-2"
          >
            <Link
              href="/join"
              className="h-11 px-5 inline-flex items-center gap-2 text-sm font-medium rounded-lg bg-[#ededef] text-[#0F1118] hover:bg-white transition-all duration-150 hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
            >
              Rejoindre une partie
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="h-11 px-5 inline-flex items-center text-sm font-medium rounded-lg text-bw-heading border border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-150"
            >
              Creer une partie
            </Link>
          </motion.div>
        </div>

        {/* Screenplay block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative mt-12 w-full max-w-[580px] mx-auto"
        >
          <div
            className="rounded-xl border border-white/[0.06] overflow-hidden"
            style={{ background: "#111318" }}
          >
            <div
              className="h-9 flex items-center gap-2 px-4 border-b border-white/[0.06]"
              style={{ background: "#0d0f14" }}
            >
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="text-[10px] text-[#5c5c60] bg-white/[0.04] rounded px-3 py-0.5">
                  banlieuwood.fr/play
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <pre className="font-[var(--font-courier-prime)] text-[13px] sm:text-[14px] leading-[1.8] whitespace-pre-wrap min-h-[7rem]">
                {displayed.map((line, i) => (
                  <span key={i}>
                    {i === 0 ? (
                      <span className="text-bw-heading font-bold">{line}</span>
                    ) : (
                      <span className="text-[#8b8b8e]">{line}</span>
                    )}
                    {i === displayed.length - 1 && !done && line !== "" && (
                      <span className="typewriter-cursor">&thinsp;</span>
                    )}
                    {"\n"}
                  </span>
                ))}
              </pre>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-bw-bg to-transparent pointer-events-none" />
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════
         STATS BAR
         ════════════════════════════════════════════════════════ */}
      <div className="border-y border-white/[0.06] px-6">
        <div className="max-w-[1080px] mx-auto py-5 flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-3">
          {[
            { value: "13", label: "modules", color: "#FF6B35" },
            { value: "45 min", label: "par session", color: "#4ECDC4" },
            { value: "5\u201330", label: "eleves", color: "#8B5CF6" },
            { value: "0", label: "compte requis", color: "#D4A843" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2.5">
              <span
                className="text-lg font-bold tabular-nums"
                style={{ color: stat.color }}
              >
                {stat.value}
              </span>
              <span className="text-xs text-[#5c5c60]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
         2. HOW IT WORKS — with product mockups
         ════════════════════════════════════════════════════════ */}
      <section className="px-6 py-20">
        <div className="max-w-[1080px] mx-auto">
          <Reveal>
            <p className="label-caps mb-4">Comment ca marche</p>
            <h2 className="text-display-md text-bw-heading max-w-[500px]">
              Trois etapes. Un court-metrage.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            {/* Step 1 — Cree ta partie */}
            <Reveal
              className="rounded-xl border border-white/[0.06] p-6 flex flex-col"
              style={{ background: "#111318" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[13px] font-mono text-[#5c5c60]">
                  01
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-bw-primary/30 to-transparent" />
              </div>
              <h3 className="text-lg font-semibold text-bw-heading mb-2">
                Cree ta partie
              </h3>
              <p className="text-sm text-[#8b8b8e] leading-relaxed">
                Choisis un module, lance la session. Un code unique est genere.
                Projette-le au tableau.
              </p>

              {/* Dashboard mockup */}
              <AppWindow url="banlieuwood.fr/dashboard" className="mt-6">
                <div className="px-3 py-2 border-b border-white/[0.04] flex items-center justify-between">
                  <span className="text-[9px] font-medium text-[#5c5c60] uppercase tracking-wider">
                    Session active
                  </span>
                  <span className="flex items-center gap-1 text-[9px] text-bw-teal">
                    <span className="w-1.5 h-1.5 rounded-full bg-bw-teal" />
                    En attente
                  </span>
                </div>
                <div className="p-4 text-center">
                  <div className="font-mono text-2xl font-bold text-bw-heading tracking-[0.12em]">
                    BW-4821
                  </div>
                  <div className="text-[10px] text-[#5c5c60] mt-1">
                    Module 1 &mdash; L&apos;Oeil
                  </div>
                </div>
                <div className="px-3 py-2 border-t border-white/[0.04] flex items-center justify-between">
                  <div className="flex -space-x-1.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border-2 border-[#0a0c12]"
                        style={{
                          background: [
                            "#FF6B35",
                            "#4ECDC4",
                            "#8B5CF6",
                            "#D4A843",
                            "#EC4899",
                          ][i],
                          opacity: 0.7,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-[#5c5c60]">
                    12 eleves connectes
                  </span>
                </div>
              </AppWindow>
            </Reveal>

            {/* Step 2 — Ils rejoignent */}
            <Reveal
              delay={0.08}
              className="rounded-xl border border-white/[0.06] p-6 flex flex-col"
              style={{ background: "#111318" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[13px] font-mono text-[#5c5c60]">
                  02
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-bw-teal/30 to-transparent" />
              </div>
              <h3 className="text-lg font-semibold text-bw-heading mb-2">
                Ils rejoignent
              </h3>
              <p className="text-sm text-[#8b8b8e] leading-relaxed">
                Code ou QR code. Pas de compte, pas d&apos;app. Sur tablette ou
                ordinateur en 5 secondes.
              </p>

              {/* Join screen mockup */}
              <AppWindow url="banlieuwood.fr/join" className="mt-6">
                <div className="p-4 space-y-3">
                  <div className="text-center">
                    <div className="text-xs font-semibold text-bw-heading">
                      Rejoindre la partie
                    </div>
                    <div className="text-[9px] text-[#5c5c60] mt-0.5">
                      Aucun compte requis
                    </div>
                  </div>
                  <div className="h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center px-3 justify-center">
                    <span className="font-mono text-sm text-bw-heading tracking-wider">
                      BW-4821
                    </span>
                  </div>
                  <div className="h-9 rounded-lg bg-bw-primary flex items-center justify-center gap-1.5">
                    <span className="text-xs font-medium text-white">
                      Rejoindre
                    </span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-[#5c5c60]">
                      ou scanner le QR code au tableau
                    </span>
                  </div>
                </div>
              </AppWindow>
            </Reveal>

            {/* Step 3 — Jouez ensemble */}
            <Reveal
              delay={0.16}
              className="rounded-xl border border-white/[0.06] p-6 flex flex-col"
              style={{ background: "#111318" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[13px] font-mono text-[#5c5c60]">
                  03
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-bw-violet/30 to-transparent" />
              </div>
              <h3 className="text-lg font-semibold text-bw-heading mb-2">
                Jouez ensemble
              </h3>
              <p className="text-sm text-[#8b8b8e] leading-relaxed">
                Repondez, votez, debattez. L&apos;histoire prend forme
                collectivement.
              </p>

              {/* Gameplay mockup */}
              <AppWindow url="banlieuwood.fr/play" className="mt-6">
                <div className="p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#5c5c60]">
                      Question 3 / 8
                    </span>
                    <span className="text-[9px] font-mono text-bw-primary tabular-nums">
                      2:34
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-bw-heading leading-snug">
                    Quel personnage incarne le conflit central ?
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-7 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center px-2.5 text-[10px] text-[#8b8b8e]">
                      Le pere
                    </div>
                    <div className="h-7 rounded-md bg-bw-primary/10 border border-bw-primary/30 flex items-center justify-between px-2.5">
                      <span className="text-[10px] font-medium text-bw-heading">
                        La fille
                      </span>
                      <span className="text-[10px] font-bold text-bw-primary tabular-nums">
                        72%
                      </span>
                    </div>
                    <div className="h-7 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center px-2.5 text-[10px] text-[#8b8b8e]">
                      Le voisin
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full w-[38%] rounded-full bg-gradient-to-r from-bw-primary to-bw-gold" />
                  </div>
                </div>
              </AppWindow>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         3. FEATURES — large illustrations, colored glows
         ════════════════════════════════════════════════════════ */}
      <section
        className="px-6 py-20 relative"
        style={{ background: "#111318" }}
      >
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
        <div className="relative max-w-[1080px] mx-auto">
          <Reveal>
            <p className="label-caps mb-4">Pourquoi Banlieuwood</p>
            <h2 className="text-display-md text-bw-heading max-w-[560px]">
              Un outil de creation, pas juste un quiz.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            {/* Collaboratif */}
            <Reveal
              className="group rounded-xl border border-white/[0.06] p-8 relative overflow-hidden hover:border-white/[0.12] transition-all duration-300"
              style={{ background: "#0F1118" }}
            >
              <div
                className="absolute top-0 right-0 w-[250px] h-[250px] pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 100% 0%, rgba(255,107,53,0.07) 0%, transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="mb-6 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  <ClapperboardIllustration size={140} />
                </div>
                <h3 className="text-xl font-semibold text-bw-heading mb-3">
                  Collaboratif
                </h3>
                <p className="text-sm text-[#8b8b8e] leading-relaxed">
                  5 a 30 eleves construisent une histoire ensemble. Le prof
                  projette le dashboard, la classe joue sur tablette ou
                  ordinateur.
                </p>
              </div>
            </Reveal>

            {/* Guide par l'IA */}
            <Reveal
              delay={0.08}
              className="group rounded-xl border border-white/[0.06] p-8 relative overflow-hidden hover:border-white/[0.12] transition-all duration-300"
              style={{ background: "#0F1118" }}
            >
              <div
                className="absolute top-0 right-0 w-[250px] h-[250px] pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 100% 0%, rgba(139,92,246,0.07) 0%, transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="mb-6 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  <CameraIllustration size={140} />
                </div>
                <h3 className="text-xl font-semibold text-bw-heading mb-3">
                  Guide par l&apos;IA
                </h3>
                <p className="text-sm text-[#8b8b8e] leading-relaxed">
                  L&apos;IA adapte les questions au niveau du groupe. Le
                  facilitateur pilote, la technologie s&apos;efface.
                </p>
              </div>
            </Reveal>

            {/* Programme complet */}
            <Reveal
              delay={0.16}
              className="group rounded-xl border border-white/[0.06] p-8 relative overflow-hidden hover:border-white/[0.12] transition-all duration-300"
              style={{ background: "#0F1118" }}
            >
              <div
                className="absolute top-0 right-0 w-[250px] h-[250px] pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 100% 0%, rgba(78,205,196,0.07) 0%, transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="mb-6 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  <FilmReelIllustration size={140} />
                </div>
                <h3 className="text-xl font-semibold text-bw-heading mb-3">
                  Programme complet
                </h3>
                <p className="text-sm text-[#8b8b8e] leading-relaxed">
                  De l&apos;observation au scenario. Personnages, conflits,
                  denouement &mdash; un vrai parcours de creation.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         4. PROGRAMME — timeline phases
         ════════════════════════════════════════════════════════ */}
      <section className="px-6 py-20">
        <div className="max-w-[1080px] mx-auto">
          <Reveal>
            <p className="label-caps mb-4">Le parcours</p>
            <h2 className="text-display-md text-bw-heading max-w-[400px]">
              Trois phases vers le film.
            </h2>
            <p className="text-sm text-[#8b8b8e] mt-4 max-w-md leading-relaxed">
              Chaque phase est une etape pedagogique autonome. Un trimestre, un
              film.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {[
              {
                num: "01",
                title: "L\u2019Oeil",
                sub: "Observation & analyse",
                modules: 5,
                color: "#8B5CF6",
                desc: "Regarder, decoder, comprendre. Les eleves apprennent a lire l\u2019image avant de la creer.",
              },
              {
                num: "02",
                title: "Le Cinema",
                sub: "Production & contraintes",
                modules: 4,
                color: "#F59E0B",
                desc: "Cadrage, son, montage. Les contraintes techniques deviennent un terrain de jeu creatif.",
              },
              {
                num: "03",
                title: "L\u2019Histoire",
                sub: "Creation & scenario",
                modules: 4,
                color: "#4ECDC4",
                desc: "Personnages, conflits, denouement. Ecrire a plusieurs, c\u2019est ecrire mieux.",
              },
            ].map((phase, i) => (
              <Reveal
                key={phase.title}
                delay={i * 0.08}
                className="rounded-xl overflow-hidden group hover:translate-y-[-2px] transition-all duration-300"
                style={{ borderLeft: `3px solid ${phase.color}` }}
              >
                <div className="bg-[#111318] p-6 h-full border border-white/[0.06] border-l-0 rounded-r-xl">
                  <div
                    className="text-[40px] font-bold leading-none mb-4"
                    style={{ color: phase.color, opacity: 0.12 }}
                  >
                    {phase.num}
                  </div>
                  <h3 className="text-lg font-semibold text-bw-heading mb-1">
                    {phase.title}
                  </h3>
                  <p className="text-sm text-[#8b8b8e] mb-3">{phase.sub}</p>
                  <p className="text-xs text-[#5c5c60] leading-relaxed">
                    {phase.desc}
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/[0.04]">
                    <span className="text-xs tabular-nums text-[#5c5c60]">
                      {phase.modules} modules
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         5. SOCIAL PROOF — quote + numbers + trust
         ════════════════════════════════════════════════════════ */}
      <section className="px-6 py-16" style={{ background: "#111318" }}>
        <div className="max-w-[900px] mx-auto">
          <Reveal>
            <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">
              {/* Quote */}
              <div className="flex-1 space-y-6">
                <div className="cinema-accent">
                  <p
                    className="text-bw-heading font-medium leading-snug"
                    style={{
                      fontSize: "clamp(20px, 2.5vw, 26px)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    &ldquo;Un vrai outil de formation artistique deguise en jeu.
                    Mes eleves n&apos;ont pas leve la tete pendant 45
                    minutes.&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bw-gold to-bw-gold-500 flex items-center justify-center text-sm font-bold text-white">
                    P
                  </div>
                  <div>
                    <p className="text-sm font-medium text-bw-heading">
                      Professeur de francais
                    </p>
                    <p className="text-xs text-[#5c5c60]">
                      College &mdash; Ile-de-France
                    </p>
                  </div>
                </div>
              </div>

              {/* Numbers */}
              <div className="grid grid-cols-3 md:grid-cols-1 gap-6 md:gap-8 md:pl-8 md:border-l md:border-white/[0.06]">
                {[
                  { value: "13", unit: "modules", desc: "pedagogiques" },
                  { value: "3", unit: "phases", desc: "progressives" },
                  { value: "0\u20AC", unit: "", desc: "pour les eleves" },
                ].map((n) => (
                  <div key={n.desc}>
                    <div className="text-2xl font-bold text-bw-heading tabular-nums">
                      {n.value}{" "}
                      <span className="text-sm font-normal text-[#5c5c60]">
                        {n.unit}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5c5c60]">{n.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Trust badges */}
          <Reveal delay={0.1}>
            <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {[
                "Concu avec des enseignants",
                "Teste en college",
                "Conforme RGPD",
              ].map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-2 text-xs text-[#5c5c60]"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4ECDC4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {badge}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         6. CTA — warm gradient, distinct from hero
         ════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-24 overflow-hidden">
        {/* Warm gradient bg */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,107,53,0.07) 0%, transparent 40%, rgba(212,168,67,0.05) 70%, rgba(139,92,246,0.04) 100%)",
          }}
        />
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

        <div className="relative max-w-[680px] mx-auto text-center">
          <Reveal>
            <div className="flex justify-center mb-6 opacity-60">
              <ClapperboardIllustration size={72} />
            </div>
            <h2
              className="text-bw-heading font-semibold"
              style={{
                fontSize: "clamp(32px, 5vw, 52px)",
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
              }}
            >
              Le prochain film se tourne dans ta classe.
            </h2>
            <p className="text-sm text-[#8b8b8e] mt-5 max-w-sm mx-auto leading-relaxed">
              Gratuit. Pas de compte pour les eleves. Lancez une partie en 30
              secondes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <Link
                href="/join"
                className="h-12 px-6 inline-flex items-center gap-2 text-sm font-semibold rounded-xl bg-bw-primary text-white hover:bg-bw-primary-500 transition-all duration-200 hover:-translate-y-px shadow-bw-glow-primary"
              >
                Rejoindre une partie
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="h-12 px-6 inline-flex items-center text-sm font-medium rounded-xl text-bw-heading border border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-150"
              >
                Creer une partie
              </Link>
            </div>
            <p className="text-xs text-[#5c5c60] mt-4">
              <Link
                href="/free"
                className="hover:text-bw-heading transition-colors"
              >
                Ou jouer seul pour decouvrir &rarr;
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         FOOTER
         ════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] px-6 py-16">
        <div className="max-w-[1080px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
            <div className="col-span-2 sm:col-span-1 space-y-3">
              <BrandLogo size="sm" />
              <p className="text-xs text-[#5c5c60] leading-relaxed max-w-[200px]">
                Le jeu collaboratif de creation cinematographique.
              </p>
            </div>
            {[
              {
                title: "Produit",
                links: [
                  { l: "Rejoindre", h: "/join" },
                  { l: "Jouer seul", h: "/free" },
                  { l: "Creer une partie", h: "/login" },
                  { l: "Dashboard", h: "/dashboard" },
                ],
              },
              {
                title: "Ressources",
                links: [
                  { l: "Fiche cours", h: "/fiche-cours" },
                  { l: "A propos", h: "/about" },
                  { l: "Contact", h: "/contact" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { l: "CGU", h: "/legal/cgu" },
                  { l: "Confidentialite", h: "/legal/privacy" },
                  { l: "Accessibilite", h: "/legal/accessibility" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-medium text-[#5c5c60] uppercase tracking-wider mb-4">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.l}>
                      <Link
                        href={link.h}
                        className="text-sm text-[#8b8b8e] hover:text-bw-heading transition-colors duration-150"
                      >
                        {link.l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 pt-6 border-t border-white/[0.06] flex items-center justify-between">
            <p className="text-xs text-[#5c5c60]">&copy; 2026 Banlieuwood</p>
            <p className="text-xs text-[#5c5c60]">Fait a Paris</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
