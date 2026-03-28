"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { BrandMark, BrandStyles } from "@/components/brand-logo";
import { ROUTES } from "@/lib/routes";

// ═══════════════════════════════════════════════════════════════
// LANDING PAGE V2 — Banlieuwood Site
// Dark cinema theme matching BanlieuWood_Site_V2.html maquette
// ═══════════════════════════════════════════════════════════════

// ── Scroll Reveal ──
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Count Up ──
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let current = 0;
          const increment = Math.ceil(target / 60);
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            setCount(current);
          }, 30);
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

// ── Module data ──
const MODULES = [
  { id: "M1", name: "Le Regard", icon: "👁️", desc: "Analyse d'images & cinema", color: "#8b5cf6" },
  { id: "M2", name: "Les Emotions", icon: "🎭", desc: "Identifier & exprimer", color: "#f472b6" },
  { id: "M3", name: "Et si...", icon: "💡", desc: "Brainstorm collectif", color: "#fbbf24" },
  { id: "M4", name: "Le Pitch", icon: "🎤", desc: "Presenter son idee", color: "#34d399" },
  { id: "M5", name: "Le Vote", icon: "🏆", desc: "Choix democratique", color: "#22d3ee" },
  { id: "M6", name: "Le Scenario", icon: "📝", desc: "Ecriture collaborative", color: "#fb923c" },
  { id: "M7", name: "Storyboard", icon: "🎞️", desc: "Plans & cadrage", color: "#f87171" },
  { id: "M8", name: "L'Equipe", icon: "⭐", desc: "Roles & talents", color: "#fbbf24" },
];

const TESTIMONIALS = [
  {
    text: "Les eleves qui ne participent jamais se sont reveles. Le vote democratique les a rendus fiers de leur contribution. C'est du jamais vu en 15 ans de carriere.",
    author: "Sophie Martin",
    role: "Professeure de francais, College Jean Moulin, Bondy",
  },
  {
    text: "L'interface est parfaite pour les ateliers. Je pilote tout depuis le cockpit, et les gamins sont a fond sur les tablettes. Le pitch timer cree une energie dingue.",
    author: "Karim Benziani",
    role: "Intervenant cinema, Association Ecran Libre",
  },
  {
    text: "Enfin un outil pedagogique qui respecte les eleves. Pas de notes, pas de classement, juste de la creation collective. Les donnees sont anonymisees, c'est exemplaire.",
    author: "Claire Dubois",
    role: "Coordinatrice PEAC, Academie de Creteil",
  },
];

const PARTNERS = [
  "🏫 Academie de Creteil",
  "🏫 Academie de Versailles",
  "🏫 Academie de Paris",
  "🎬 CNC — Education a l'image",
  "📚 Education Nationale — PEAC",
  "🎭 DRAC Ile-de-France",
  "🏛️ Mairie de Bondy",
  "🏛️ Mairie de Saint-Denis",
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="min-h-dvh bg-[#0a0a16] text-[#f0f0f8] antialiased"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}
    >
      <BrandStyles />

      {/* ══════════ NAVBAR ══════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 transition-all duration-300"
        style={{
          padding: scrolled ? "8px 24px" : "12px 24px",
          background: scrolled ? "rgba(10,10,22,0.95)" : "rgba(10,10,22,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #252550",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-2xl">🎬</span>
          <span className="text-base font-extrabold bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] bg-clip-text text-transparent">
            BANLIEUWOOD
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1.5">
          {[
            { label: "Accueil", href: "/" },
            { label: "A Propos", href: "/projet" },
            { label: "Festival", href: "/festival" },
            { label: "Ressources", href: "/docs" },
            { label: "Contact", href: "/contact" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#94a3b8] hover:text-[#f0f0f8] transition-colors relative"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.login}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#f0f0f8] bg-[#181838] border border-[#252550] hover:border-[#8b5cf6] transition-all"
          >
            Connexion
          </Link>
          <Link
            href={ROUTES.requestAccess}
            className="px-5 py-2 rounded-lg text-[13px] font-bold text-white bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] shadow-[0_4px_16px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_24px_rgba(139,92,246,0.4)] hover:scale-[1.03] transition-all"
          >
            S&apos;inscrire
          </Link>
        </div>
      </nav>

      {/* ══════════ HERO — Video Background ══════════ */}
      <section className="relative overflow-hidden min-h-svh flex items-center">
        {/* Video bg */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect fill='%230a0a16' width='1920' height='1080'/%3E%3C/svg%3E"
          >
            <source
              src="https://cdn.coverr.co/videos/coverr-a-man-filming-with-a-camera-on-a-tripod-1584/1080p.mp4"
              type="video/mp4"
            />
          </video>
        </div>
        {/* Overlay gradient */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,22,0.6) 0%, rgba(10,10,22,0.4) 30%, rgba(10,10,22,0.5) 60%, rgba(10,10,22,0.95) 100%)",
          }}
        />

        <div className="relative z-[3] w-full px-6 pt-36 pb-28">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-center gap-8 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8b5cf6]/12 border border-[#8b5cf6]/25 text-[12px] font-semibold text-[#c4b5fd] mb-5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
                  ATELIER DE CINEMA COLLABORATIF
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-[clamp(36px,5.5vw,64px)] font-black leading-[1.05] tracking-tight mb-6"
                >
                  Transformez la classe
                  <br />
                  en{" "}
                  <span className="bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] bg-clip-text text-transparent bg-[length:200%_200%] animate-[gradientShift_4s_ease_infinite]">
                    plateau de cinema
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-[clamp(15px,2vw,18px)] text-[#94a3b8] leading-relaxed max-w-[520px] mb-8"
                >
                  Les eleves imaginent, ecrivent, pitchent, votent et produisent un court-metrage — ensemble. De
                  l&apos;idee au festival, tout est collaboratif.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="flex items-center gap-4 flex-wrap mb-5"
                >
                  <Link
                    href={ROUTES.requestAccess}
                    className="px-9 py-4 rounded-[14px] text-base font-bold text-white bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 transition-all"
                  >
                    Commencer gratuitement
                  </Link>
                  <Link
                    href="/projet"
                    className="px-9 py-4 rounded-[14px] text-base font-bold text-[#f0f0f8] bg-[#181838] border border-[#252550] hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/6 transition-all"
                  >
                    Decouvrir le parcours
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-center gap-6 text-[12px] text-[#94a3b8]"
                >
                  <span>✓ Gratuit pour les ecoles</span>
                  <span>✓ Conforme RGPD & PEAC</span>
                  <span>✓ iPad optimise</span>
                </motion.div>
              </div>

              {/* Play button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="flex-shrink-0 text-center hidden lg:block"
              >
                <Link
                  href="/projet"
                  className="w-[72px] h-[72px] rounded-full border-2 border-white/30 bg-[#8b5cf6]/20 backdrop-blur-sm text-white text-2xl flex items-center justify-center mx-auto hover:bg-[#8b5cf6]/40 hover:border-[#8b5cf6] hover:scale-110 transition-all relative"
                >
                  <span className="absolute inset-[-6px] rounded-full border border-[#8b5cf6]/30 animate-[breathe_2s_ease_infinite]" />
                  ▶
                </Link>
                <div className="text-[12px] text-[#94a3b8] mt-3">Voir le parcours</div>
              </motion.div>
            </div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex gap-8 flex-wrap justify-center mt-16"
            >
              {[
                { icon: "🎬", value: 87, label: "Films produits", color: "" },
                { icon: "👥", value: 1247, label: "Eleves participants", color: "text-[#fbbf24]" },
                { icon: "🏫", value: 32, label: "Etablissements", color: "text-[#34d399]" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 px-7 py-4 rounded-2xl bg-[#141430]/60 backdrop-blur-xl border border-[#8b5cf6]/15 hover:border-[#8b5cf6]/40 transition-all"
                >
                  <span className="text-[28px]">{stat.icon}</span>
                  <div>
                    <div
                      className={`text-[22px] font-black ${stat.color || "bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] bg-clip-text text-transparent"}`}
                    >
                      <CountUp target={stat.value} />
                    </div>
                    <div className="text-[11px] text-[#64748b]">{stat.label}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 px-7 py-4 rounded-2xl bg-[#141430]/60 backdrop-blur-xl border border-[#8b5cf6]/15">
                <span className="text-[28px]">⭐</span>
                <div>
                  <div className="text-[22px] font-black text-[#f472b6]">94%</div>
                  <div className="text-[11px] text-[#64748b]">Engagement</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ MARQUEE PARTENAIRES ══════════ */}
      <div className="overflow-hidden py-6 border-y border-[#252550] bg-[#111127]">
        <div className="flex animate-[marquee_40s_linear_infinite] w-max">
          {[...PARTNERS, ...PARTNERS].map((p, i) => (
            <span key={i} className="flex-shrink-0 px-10 text-[14px] font-semibold text-[#64748b]/60">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════ VALUE PROPS ══════════ */}
      <section className="py-24 bg-[#111127]">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#fbbf24] mb-2">
              POUR CHAQUE ROLE
            </div>
            <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold leading-tight">Un outil pour chaque acteur</h2>
            <p className="text-[clamp(15px,2vw,18px)] text-[#94a3b8] max-w-[500px] mx-auto mt-3">
              Banlieuwood s&apos;adapte a chaque utilisateur avec une interface dediee.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: "🎬",
                title: "Pour les Intervenants",
                desc: "Cockpit temps reel avec modules M1-M8, orchestration de seance, projection multi-vues, command palette, et pilotage complet.",
                color: "#8b5cf6",
              },
              {
                icon: "✏️",
                title: "Pour les Eleves",
                desc: "Interface tablette intuitive, vote democratique, creation collaborative, roles attribues naturellement — pas de notes, pas de jugement.",
                color: "#f472b6",
              },
              {
                icon: "📊",
                title: "Pour les Enseignants",
                desc: "Donnees pedagogiques anonymisees, historique par classe, statistiques collectives, suivi sans jugement individuel. Aligne PEAC.",
                color: "#34d399",
              },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 0.1}>
                <div className="relative overflow-hidden rounded-2xl bg-[#141430] border border-[#252550] p-8 text-center hover:border-[#8b5cf6]/30 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all group">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-[32px] mx-auto mb-4"
                    style={{ background: `${card.color}15` }}
                  >
                    {card.icon}
                  </div>
                  <h3 className="text-base font-bold mb-2">{card.title}</h3>
                  <p className="text-[13px] text-[#94a3b8] leading-relaxed">{card.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TIMELINE — 4 etapes ══════════ */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#34d399] mb-2">
              COMMENT CA MARCHE
            </div>
            <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold leading-tight">4 etapes pour creer un film</h2>
          </Reveal>
          <div className="max-w-[700px] mx-auto">
            {[
              {
                n: "1",
                title: "Creez la session",
                desc: "L'intervenant choisit la classe, la formule (F0/F1/F2) et genere un QR code. En un clic, l'atelier est pret.",
                color: "#8b5cf6",
                next: "#f472b6",
              },
              {
                n: "2",
                title: "Les eleves rejoignent",
                desc: "Scan du QR code sur tablette. Pas de compte, pas de mot de passe. En 10 secondes, toute la classe est connectee.",
                color: "#f472b6",
                next: "#fbbf24",
              },
              {
                n: "3",
                title: "Creez ensemble",
                desc: "8 modules progressifs : analyser des images, explorer les emotions, brainstormer, pitcher, voter, ecrire le scenario, dessiner le storyboard, former l'equipe.",
                color: "#fbbf24",
                next: "#34d399",
              },
              {
                n: "4",
                title: "Festival !",
                desc: "Projection du film, celebration collective, roles attribues. Chaque eleve est un createur reconnu.",
                color: "#34d399",
                next: "",
              },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 0.1} className="flex gap-4 pb-8 relative">
                <div className="flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-extrabold border-2"
                    style={{ background: `${step.color}15`, borderColor: step.color, color: step.color }}
                  >
                    {step.n}
                  </div>
                  {step.next && (
                    <div
                      className="absolute left-[15px] top-[44px] bottom-0 w-[2px]"
                      style={{ background: `linear-gradient(${step.color}, ${step.next})` }}
                    />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-bold mb-2">{step.title}</h4>
                  <p className="text-[13px] text-[#94a3b8] leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ MODULES M1-M8 ══════════ */}
      <section className="py-24 bg-[#111127]">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#22d3ee] mb-2">
              PARCOURS PEDAGOGIQUE
            </div>
            <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold leading-tight">8 modules, un parcours complet</h2>
            <p className="text-[clamp(15px,2vw,18px)] text-[#94a3b8] max-w-[560px] mx-auto mt-3">
              Chaque module developpe des competences du Parcours d&apos;Education Artistique et Culturelle (PEAC) et du
              Socle Commun.
            </p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {MODULES.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.05}>
                <div
                  className="rounded-2xl bg-[#141430] border border-[#252550] p-5 text-center cursor-pointer hover:border-[#8b5cf6]/30 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all relative overflow-hidden"
                  style={{ borderTopWidth: 3, borderTopColor: m.color }}
                >
                  <div className="text-[32px] mb-2.5">{m.icon}</div>
                  <div className="text-[13px] font-bold mb-1">
                    {m.id} — {m.name}
                  </div>
                  <div className="text-[11px] text-[#64748b]">{m.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FORMULES ══════════ */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#f472b6] mb-2">FORMULES</div>
            <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold leading-tight">
              3 formules adaptees a votre temps
            </h2>
            <p className="text-[clamp(15px,2vw,18px)] text-[#94a3b8] max-w-[500px] mx-auto mt-3">
              De la decouverte d&apos;1 heure au cycle complet de 8 heures.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                badge: "F0 — DECOUVERTE",
                badgeColor: "#f472b6",
                time: "1 heure",
                title: "Decouverte",
                desc: "Introduction a l'analyse d'images et au langage cinematographique. Ideal pour une premiere immersion.",
                modules: ["M1 Le Regard"],
                peac: "Rencontrer",
              },
              {
                badge: "F1 — LEGERE",
                badgeColor: "#fbbf24",
                time: "3 heures",
                title: "Legere",
                desc: "Analyse, emotions et brainstorm. Les eleves decouvrent le processus creatif collectif.",
                modules: ["M1", "M2", "M3"],
                peac: "Rencontrer + Pratiquer",
              },
              {
                badge: "F2 — COMPLETE",
                badgeColor: "#8b5cf6",
                time: "8 heures",
                title: "Complete",
                desc: "Cycle integral — de l'analyse au festival. Les eleves vivent tout le processus de creation d'un film.",
                modules: ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"],
                peac: "Rencontrer + Pratiquer + S'approprier",
                popular: true,
              },
            ].map((f, i) => (
              <Reveal key={f.badge} delay={i * 0.1}>
                <div
                  className="rounded-2xl bg-[#141430] border border-[#252550] p-7 relative overflow-hidden hover:border-[#8b5cf6]/30 hover:-translate-y-1 transition-all"
                  style={{ borderTopWidth: 3, borderTopColor: f.badgeColor }}
                >
                  {f.popular && (
                    <div className="absolute top-3 right-3 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] text-white text-[10px] font-bold">
                      POPULAIRE
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold"
                      style={{ background: `${f.badgeColor}15`, color: f.badgeColor }}
                    >
                      {f.badge}
                    </span>
                    <span className="text-[12px] text-[#64748b]">{f.time}</span>
                  </div>
                  <h3 className="text-base font-bold mb-2">{f.title}</h3>
                  <p className="text-[13px] text-[#94a3b8] leading-relaxed mb-4">{f.desc}</p>
                  <div className="text-[11px] text-[#64748b] mb-2">Modules inclus :</div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {f.modules.map((m) => (
                      <span
                        key={m}
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#8b5cf6]/15 text-[#c4b5fd]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-[#64748b]">Competences PEAC : {f.peac}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TEMOIGNAGES ══════════ */}
      <section className="py-24 bg-[#111127]">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#c4b5fd] mb-2">TEMOIGNAGES</div>
            <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold leading-tight">Ils en parlent mieux que nous</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.author} delay={i * 0.1}>
                <div className="rounded-2xl bg-[#141430] border border-[#252550] p-7 relative hover:border-[#8b5cf6]/30 transition-all">
                  <div className="absolute top-3 left-5 text-[48px] font-black text-[#8b5cf6]/15 leading-none">
                    &ldquo;
                  </div>
                  <p className="text-[14px] text-[#94a3b8] leading-relaxed italic mb-4 pt-2">{t.text}</p>
                  <div className="text-[12px] font-semibold">{t.author}</div>
                  <div className="text-[11px] text-[#64748b]">{t.role}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA FINAL ══════════ */}
      <section className="py-24">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold leading-tight mb-4">Pret a tourner ?</h2>
            <p className="text-[clamp(15px,2vw,18px)] text-[#94a3b8] leading-relaxed mb-8">
              Lancez votre premier atelier en quelques minutes. Gratuit pour tous les etablissements scolaires publics.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href={ROUTES.requestAccess}
                className="px-9 py-4 rounded-[14px] text-base font-bold text-white bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 transition-all"
              >
                Creer un compte
              </Link>
              <Link
                href="/contact"
                className="px-9 py-4 rounded-[14px] text-base font-bold text-[#f0f0f8] bg-[#181838] border border-[#252550] hover:border-[#8b5cf6] transition-all"
              >
                Nous contacter
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-[#111127] border-t border-[#252550] pt-16 pb-6">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎬</span>
                <span className="text-base font-extrabold bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] bg-clip-text text-transparent">
                  BANLIEUWOOD
                </span>
              </div>
              <p className="text-[13px] text-[#64748b] leading-relaxed mb-4">
                Atelier de cinema collaboratif pour les ecoles. Chaque eleve est un createur.
              </p>
              <p className="text-[11px] text-[#64748b]">
                Aligne sur le PEAC, le Socle Commun et les programmes d&apos;Arts Plastiques Cycles 3-4.
              </p>
            </div>
            {[
              {
                title: "Produit",
                links: [
                  { label: "A Propos", href: "/projet" },
                  { label: "Festival", href: "/festival" },
                  { label: "Ressources", href: "/docs" },
                  { label: "Contact", href: "/contact" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Mentions legales", href: "/legal/mentions" },
                  { label: "Confidentialite", href: "/legal/privacy" },
                  { label: "CGU", href: "/legal/mentions" },
                ],
              },
              {
                title: "Communaute",
                links: [
                  { label: "Twitter", href: "#" },
                  { label: "Instagram", href: "#" },
                  { label: "GitHub", href: "#" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[13px] font-bold mb-4">{col.title}</h4>
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-[13px] text-[#64748b] mb-2 hover:text-[#c4b5fd] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-[#252550] text-[12px] text-[#64748b]">
            <span>&copy; 2026 Banlieuwood. Tous droits reserves.</span>
            <span>Fait avec 💜 pour les ecoles de France</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
