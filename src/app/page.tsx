"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { BrandStyles } from "@/components/brand-logo";
import { ROUTES } from "@/lib/routes";
import { PublicLayout } from "@/components/public-layout";

// ═══════════════════════════════════════════════════════════════
// LANDING PAGE V3 — Cinema premium
// Brand palette orange #FF6B35 / amber #D4A843 / teal #4ECDC4
// Warm dark cinema — purge lavande
// ═══════════════════════════════════════════════════════════════

const SNAP = [0.19, 1, 0.22, 1] as [number, number, number, number];

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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, delay, ease: SNAP }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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

const MODULES = [
  { id: "M1", name: "Le Regard", icon: "👁️", desc: "Analyse d'images & cinéma", color: "#FF6B35" },
  { id: "M2", name: "Les Émotions", icon: "🎭", desc: "Identifier & exprimer", color: "#D4A843" },
  { id: "M3", name: "Et si...", icon: "💡", desc: "Brainstorm collectif", color: "#4ECDC4" },
  { id: "M4", name: "Le Pitch", icon: "🎤", desc: "Présenter son idée", color: "#FF8C5A" },
  { id: "M5", name: "Le Vote", icon: "🏆", desc: "Choix démocratique", color: "#E8B84B" },
  { id: "M6", name: "Le Scénario", icon: "📝", desc: "Écriture collaborative", color: "#5DD6CF" },
  { id: "M7", name: "Storyboard", icon: "🎞️", desc: "Plans & cadrage", color: "#FF6B35" },
  { id: "M8", name: "L'Équipe", icon: "⭐", desc: "Rôles & talents", color: "#D4A843" },
];

const TESTIMONIALS = [
  {
    text: "Les élèves qui ne participent jamais se sont révélés. Le vote démocratique les a rendus fiers de leur contribution. C'est du jamais vu en 15 ans de carrière.",
    author: "Sophie Martin",
    role: "Professeure de français, Collège Jean Moulin, Bondy",
  },
  {
    text: "L'interface est parfaite pour les ateliers. Je pilote tout depuis le cockpit, et les gamins sont à fond sur les tablettes. Le pitch timer crée une énergie dingue.",
    author: "Karim Benziani",
    role: "Intervenant cinéma, Association Écran Libre",
  },
  {
    text: "Enfin un outil pédagogique qui respecte les élèves. Pas de notes, pas de classement, juste de la création collective. Les données sont anonymisées, c'est exemplaire.",
    author: "Claire Dubois",
    role: "Coordinatrice PEAC, Académie de Créteil",
  },
];

const PARTNERS = [
  "Académie de Créteil",
  "Académie de Versailles",
  "Académie de Paris",
  "CNC — Éducation à l'image",
  "Éducation Nationale — PEAC",
  "DRAC Île-de-France",
  "Mairie de Bondy",
  "Mairie de Saint-Denis",
];

export default function Home() {
  const [_scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <PublicLayout>
      <BrandStyles />

      {/* Film grain overlay */}
      <div className="fixed inset-0 z-[200] pointer-events-none" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" className="opacity-[0.022]">
          <filter id="bw-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#bw-grain)" />
        </svg>
      </div>

      {/* ══════════ HERO — Video Background ══════════ */}
      <section className="relative overflow-hidden min-h-svh flex items-center bg-[#0d0b09]">
        {/* Ambient gradient mesh blobs */}
        <div
          className="absolute top-[-250px] left-[-200px] w-[750px] h-[750px] rounded-full pointer-events-none"
          style={{ background: "#FF6B35", opacity: 0.13, filter: "blur(160px)" }}
        />
        <div
          className="absolute bottom-[-150px] right-[-150px] w-[550px] h-[550px] rounded-full pointer-events-none"
          style={{ background: "#D4A843", opacity: 0.09, filter: "blur(130px)" }}
        />
        <div
          className="absolute top-[45%] right-[22%] w-[320px] h-[320px] rounded-full pointer-events-none"
          style={{ background: "#4ECDC4", opacity: 0.07, filter: "blur(100px)" }}
        />

        {/* Video bg */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-25"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect fill='%230d0b09' width='1920' height='1080'/%3E%3C/svg%3E"
          >
            <source
              src="https://cdn.coverr.co/videos/coverr-a-man-filming-with-a-camera-on-a-tripod-1584/1080p.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,11,9,0.55) 0%, rgba(13,11,9,0.15) 30%, rgba(13,11,9,0.45) 65%, rgba(13,11,9,0.97) 100%)",
          }}
        />

        <div className="relative z-[3] w-full px-6 pt-36 pb-28">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-center gap-10 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, ease: SNAP }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-bold tracking-[0.12em] uppercase mb-6"
                  style={{
                    background: "rgba(255,107,53,0.08)",
                    borderColor: "rgba(255,107,53,0.25)",
                    color: "#FF6B35",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ECDC4] animate-pulse" />
                  ATELIER DE CINEMA COLLABORATIF
                </motion.div>

                {/* H1 — Bebas Neue cinema */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.85, ease: SNAP }}
                  className="font-cinema text-[clamp(52px,7.5vw,96px)] leading-[1.05] uppercase mb-6"
                >
                  Transformez la classe
                  <br />
                  en{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: "linear-gradient(90deg, #FF6B35 0%, #D4A843 55%, #4ECDC4 100%)",
                    }}
                  >
                    plateau de cinema
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7, ease: SNAP }}
                  className="text-[clamp(15px,2vw,18px)] text-white/72 leading-[1.52] tracking-[-0.01em] max-w-[520px] mb-10"
                >
                  Les élèves imaginent, écrivent, pitchent, votent et produisent un court-métrage — ensemble. De
                  l&apos;idée au festival, tout est collaboratif.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.7, ease: SNAP }}
                  className="flex items-center gap-4 flex-wrap mb-7"
                >
                  <Link
                    href={ROUTES.requestAccess}
                    className="px-9 py-4 rounded-xl text-base font-bold text-white shadow-[0_4px_24px_rgba(255,107,53,0.4)] hover:shadow-[0_10px_40px_rgba(255,107,53,0.58)] hover:-translate-y-1 active:translate-y-0 transition-[transform,box-shadow] duration-200 ease-out"
                    style={{ background: "#FF6B35" }}
                  >
                    Commencer gratuitement
                  </Link>
                  <Link
                    href="/projet"
                    className="px-9 py-4 rounded-xl text-base font-bold text-white/85 bg-white/[0.05] border border-white/10 hover:border-[#FF6B35]/40 hover:text-white hover:shadow-[0_4px_20px_rgba(255,107,53,0.18)] transition-all duration-200"
                  >
                    Découvrir le parcours
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.85, ease: SNAP }}
                  className="flex items-center gap-6 text-[12px] text-white/38"
                >
                  <span>✓ Gratuit pour les écoles</span>
                  <span>✓ Conforme RGPD & PEAC</span>
                  <span>✓ iPad optimisé</span>
                </motion.div>
              </div>

              {/* Play button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.85, ease: SNAP }}
                className="flex-shrink-0 text-center hidden lg:block"
              >
                <Link
                  href="/projet"
                  className="w-[80px] h-[80px] rounded-full border border-white/18 bg-white/[0.04] backdrop-blur-sm text-white text-2xl flex items-center justify-center mx-auto hover:bg-[#FF6B35]/15 hover:border-[#FF6B35]/55 hover:scale-110 transition-all relative group"
                >
                  <span className="absolute inset-[-8px] rounded-full border border-[#FF6B35]/18 group-hover:border-[#FF6B35]/38 transition-colors" />
                  <span className="absolute inset-[-18px] rounded-full border border-[#FF6B35]/08 group-hover:border-[#FF6B35]/18 transition-colors" />
                  ▶
                </Link>
                <div className="text-[12px] text-white/32 mt-3">Voir le parcours</div>
              </motion.div>
            </div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.85, ease: SNAP }}
              className="flex gap-4 flex-wrap justify-center mt-16"
            >
              {[
                { icon: "🎬", value: 87, label: "Films produits", color: "#FF6B35" },
                { icon: "👥", value: 1247, label: "Élèves participants", color: "#D4A843" },
                { icon: "🏫", value: 32, label: "Établissements", color: "#4ECDC4" },
                { icon: "⭐", value: 94, label: "Engagement", suffix: "%", color: "#ffffff" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 px-7 py-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl ring-1 ring-white/[0.07] hover:ring-[#FF6B35]/22 transition-all"
                >
                  <span className="text-[28px]">{stat.icon}</span>
                  <div>
                    <div className="text-[22px] font-black" style={{ color: stat.color }}>
                      <CountUp target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-[11px] text-white/35">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ MARQUEE PARTENAIRES ══════════ */}
      <div className="overflow-hidden py-5 border-y border-white/[0.06] bg-[#110e0b]">
        <div className="flex animate-[marquee_40s_linear_infinite] w-max">
          {[...PARTNERS, ...PARTNERS].map((p, i) => (
            <span key={i} className="flex-shrink-0 flex items-center gap-6 px-8 text-[13px] font-medium text-white/28">
              {p}
              <span
                className="w-1 h-1 rounded-full flex-shrink-0"
                style={{ background: "rgba(255,107,53,0.4)" }}
              />
            </span>
          ))}
        </div>
      </div>

      {/* ══════════ VALUE PROPS ══════════ */}
      <section className="py-20 bg-[#0d0b09]">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="inline-block w-6 h-[1.5px] rounded-full" style={{ background: "#D4A843" }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "#D4A843" }}>POUR CHAQUE ROLE</span>
              <span className="inline-block w-6 h-[1.5px] rounded-full" style={{ background: "#D4A843" }} />
            </div>
            <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold leading-tight">Un outil pour chaque acteur</h2>
            <p className="text-[clamp(15px,2vw,18px)] text-white/48 max-w-[500px] mx-auto mt-3">
              Banlieuwood s&apos;adapte à chaque utilisateur avec une interface dédiée.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: "🎬",
                title: "Pour les Intervenants",
                desc: "Cockpit temps réel avec modules M1-M8, orchestration de séance, projection multi-vues, command palette, et pilotage complet.",
                color: "#FF6B35",
              },
              {
                icon: "✏️",
                title: "Pour les Élèves",
                desc: "Interface tablette intuitive, vote démocratique, création collaborative, rôles attribués naturellement — pas de notes, pas de jugement.",
                color: "#D4A843",
              },
              {
                icon: "📊",
                title: "Pour les Enseignants",
                desc: "Données pédagogiques anonymisées, historique par classe, statistiques collectives, suivi sans jugement individuel. Aligné PEAC.",
                color: "#4ECDC4",
              },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 0.1}>
                <div className="relative overflow-hidden rounded-2xl p-8 text-center hover:-translate-y-1 transition-all group ring-1 ring-white/[0.07] hover:ring-white/14 bg-white/[0.025]">
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out"
                    style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }}
                  />
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-[32px] mx-auto mb-5"
                    style={{ background: `${card.color}14` }}
                  >
                    {card.icon}
                  </div>
                  <h3 className="text-base font-bold mb-2.5">{card.title}</h3>
                  <p className="text-[13px] text-white/48 leading-relaxed">{card.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TIMELINE ══════════ */}
      <section className="py-28 bg-[#110e0b]">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal className="mb-14">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: "#4ECDC4" }}>
              COMMENT CA MARCHE
            </div>
            <h2 className="font-cinema text-[clamp(32px,5vw,64px)] uppercase leading-[1.0]">4 etapes pour creer un film</h2>
          </Reveal>
          <div className="max-w-[680px] mx-auto">
            {[
              {
                n: "1",
                title: "Créez la session",
                desc: "L'intervenant choisit la classe, la formule (F0/F1/F2) et génère un QR code. En un clic, l'atelier est prêt.",
                color: "#FF6B35",
                next: "#D4A843",
              },
              {
                n: "2",
                title: "Les élèves rejoignent",
                desc: "Scan du QR code sur tablette. Pas de compte, pas de mot de passe. En 10 secondes, toute la classe est connectée.",
                color: "#D4A843",
                next: "#4ECDC4",
              },
              {
                n: "3",
                title: "Créez ensemble",
                desc: "8 modules progressifs : analyser des images, explorer les émotions, brainstormer, pitcher, voter, écrire le scénario, dessiner le storyboard, former l'équipe.",
                color: "#4ECDC4",
                next: "#FF6B35",
              },
              {
                n: "4",
                title: "Festival !",
                desc: "Projection du film, célébration collective, rôles attribués. Chaque élève est un créateur reconnu.",
                color: "#FF6B35",
                next: "",
              },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 0.12} className="flex gap-5 pb-10 relative">
                <div className="flex-shrink-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-black border"
                    style={{ background: `${step.color}14`, borderColor: `${step.color}48`, color: step.color }}
                  >
                    {step.n}
                  </div>
                  {step.next && (
                    <div
                      className="absolute left-[17px] top-[48px] bottom-0 w-[2px] opacity-35"
                      style={{ background: `linear-gradient(${step.color}, ${step.next})` }}
                    />
                  )}
                </div>
                <div className="pt-1.5">
                  <h4 className="text-[16px] font-bold mb-1.5">{step.title}</h4>
                  <p className="text-[13px] text-white/48 leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ MODULES M1-M8 ══════════ */}
      <section className="py-24 bg-[#0d0b09]">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: "#FF6B35" }}>
              PARCOURS PEDAGOGIQUE
            </div>
            <h2 className="font-cinema text-[clamp(32px,5vw,64px)] uppercase leading-[1.0]">8 modules, un parcours complet</h2>
            <p className="text-[clamp(15px,2vw,18px)] text-white/48 max-w-[560px] mx-auto mt-3">
              Chaque module développe des compétences du Parcours d&apos;Éducation Artistique et Culturelle (PEAC) et du
              Socle Commun.
            </p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {MODULES.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.05}>
                <div className="rounded-2xl bg-white/[0.025] ring-1 ring-white/[0.07] p-5 text-center cursor-pointer hover:ring-white/16 hover:-translate-y-1 transition-all relative overflow-hidden group">
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-55 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: m.color }}
                  />
                  <div className="text-[30px] mb-2.5 mt-1">{m.icon}</div>
                  <div className="text-[13px] font-bold mb-1">
                    <span style={{ color: m.color }}>{m.id}</span> — {m.name}
                  </div>
                  <div className="text-[11px] text-white/38">{m.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FORMULES ══════════ */}
      <section className="py-28 bg-[#110e0b]">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: "#D4A843" }}>
              FORMULES
            </div>
            <h2 className="font-cinema text-[clamp(32px,5vw,64px)] uppercase leading-[1.0]">
              3 formules adaptées à votre temps
            </h2>
            <p className="text-[clamp(15px,2vw,18px)] text-white/48 max-w-[500px] mx-auto mt-3">
              De la découverte d&apos;1 heure au cycle complet de 8 heures.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                badge: "F0 — DÉCOUVERTE",
                badgeColor: "#4ECDC4",
                time: "1 heure",
                title: "Découverte",
                desc: "Introduction à l'analyse d'images et au langage cinématographique. Idéal pour une première immersion.",
                modules: ["M1 Le Regard"],
                peac: "Rencontrer",
                popular: false,
              },
              {
                badge: "F1 — LÉGÈRE",
                badgeColor: "#D4A843",
                time: "3 heures",
                title: "Légère",
                desc: "Analyse, émotions et brainstorm. Les élèves découvrent le processus créatif collectif.",
                modules: ["M1", "M2", "M3"],
                peac: "Rencontrer + Pratiquer",
                popular: false,
              },
              {
                badge: "F2 — COMPLÈTE",
                badgeColor: "#FF6B35",
                time: "8 heures",
                title: "Complète",
                desc: "Cycle intégral — de l'analyse au festival. Les élèves vivent tout le processus de création d'un film.",
                modules: ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"],
                peac: "Rencontrer + Pratiquer + S'approprier",
                popular: true,
              },
            ].map((f, i) => (
              <Reveal key={f.badge} delay={i * 0.1}>
                <div
                  className="rounded-2xl bg-white/[0.025] ring-1 ring-white/[0.07] p-7 relative overflow-hidden hover:ring-white/14 hover:-translate-y-1 transition-all"
                  style={{ borderTop: `2px solid ${f.badgeColor}` }}
                >
                  {f.popular && (
                    <div
                      className="absolute top-3 right-3 px-3 py-0.5 rounded-full text-white text-[10px] font-bold"
                      style={{ background: "#FF6B35" }}
                    >
                      POPULAIRE
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold"
                      style={{ background: `${f.badgeColor}14`, color: f.badgeColor }}
                    >
                      {f.badge}
                    </span>
                    <span className="text-[12px] text-white/32">{f.time}</span>
                  </div>
                  <h3 className="text-base font-bold mb-2">{f.title}</h3>
                  <p className="text-[13px] text-white/48 leading-relaxed mb-4">{f.desc}</p>
                  <div className="text-[11px] text-white/28 mb-2">Modules inclus :</div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {f.modules.map((m) => (
                      <span
                        key={m}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                        style={{ background: `${f.badgeColor}14`, color: f.badgeColor }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-white/28">Competences PEAC : {f.peac}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TEMOIGNAGES ══════════ */}
      <section className="py-20 bg-[#0d0b09]">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: "#FF6B35" }}>
              TEMOIGNAGES
            </div>
            <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold leading-tight mb-3">Ils en parlent mieux que nous</h2>
            <div className="mx-auto w-16 h-[2px] rounded-full" style={{ background: "linear-gradient(90deg, transparent, #FF6B35, transparent)" }} />
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.author} delay={i * 0.1}>
                <div className="rounded-2xl bg-white/[0.025] ring-1 ring-white/[0.07] p-7 relative hover:ring-white/14 hover:-translate-y-0.5 transition-all">
                  <div
                    className="absolute top-2 left-5 text-[56px] font-black leading-none select-none"
                    style={{ color: "rgba(255,107,53,0.12)" }}
                  >
                    &ldquo;
                  </div>
                  <p className="text-[14px] text-white/52 leading-relaxed italic mb-5 pt-3 relative z-[1]">{t.text}</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #FF6B35, #D4A843)" }}
                    >
                      {t.author[0]}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold">{t.author}</div>
                      <div className="text-[11px] text-white/32">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA FINAL ══════════ */}
      <section className="py-28 bg-[#110e0b] relative overflow-hidden">
        {/* Ambient orange glow */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ height: 400, background: "#FF6B35", opacity: 0.04, filter: "blur(130px)" }}
        />
        <div className="max-w-[600px] mx-auto px-6 text-center relative z-[1]">
          <Reveal>
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] mb-4" style={{ color: "#FF6B35" }}>
              PRET A TOURNER ?
            </div>
            <h2 className="text-[clamp(32px,5vw,60px)] font-extrabold leading-tight mb-4">Lancez votre atelier</h2>
            <p className="text-[clamp(15px,2vw,18px)] text-white/48 leading-relaxed mb-10">
              Lancez votre premier atelier en quelques minutes. Gratuit pour tous les établissements scolaires publics.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href={ROUTES.requestAccess}
                className="px-10 py-4 rounded-xl text-base font-bold text-white shadow-[0_4px_28px_rgba(255,107,53,0.45)] hover:shadow-[0_10px_40px_rgba(255,107,53,0.58)] hover:-translate-y-1 active:translate-y-0 transition-[transform,box-shadow] duration-200 ease-out"
                style={{ background: "#FF6B35" }}
              >
                Créer un compte
              </Link>
              <Link
                href="/contact"
                className="px-10 py-4 rounded-xl text-base font-bold text-white/65 bg-white/[0.04] border border-white/10 hover:border-[#FF6B35]/35 hover:text-white hover:shadow-[0_4px_20px_rgba(255,107,53,0.18)] transition-all duration-200"
              >
                Nous contacter
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicLayout>
  );
}
