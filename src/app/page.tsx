"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { BrandStyles } from "@/components/brand-logo";
import { ROUTES } from "@/lib/routes";
import { PublicLayout } from "@/components/public-layout";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";

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
  return (
    <PublicLayout>
      <BrandStyles />
      <ScrollProgressBar />

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

        {/* Fond cinéma CSS animé — en attente vidéo terrain */}
        <div
          className="absolute inset-0 z-0 gradient-animate"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(255,107,53,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 75% 60%, rgba(212,168,67,0.09) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 50% 20%, rgba(78,205,196,0.06) 0%, transparent 50%), #0d0b09",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,11,9,0.55) 0%, rgba(13,11,9,0.15) 30%, rgba(13,11,9,0.45) 65%, rgba(13,11,9,0.97) 100%)",
          }}
        />

        <div className="relative z-[3] w-full px-6 pt-28 md:pt-36 pb-28">
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
                  ATELIER DE CINÉMA COLLABORATIF
                </motion.div>

                {/* H1 — Bebas Neue cinema */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.85, ease: SNAP }}
                  className="font-cinema text-[clamp(52px,7.5vw,96px)] leading-[1.05] uppercase mb-6"
                >
                  Spectateurs hier.
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: "linear-gradient(90deg, #FF6B35 0%, #D4A843 55%, #4ECDC4 100%)",
                    }}
                  >
                    Réalisateurs aujourd&apos;hui.
                  </span>
                </motion.h1>

                {/* Tagline officiel */}
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42, duration: 0.6, ease: SNAP }}
                  className="font-cinema text-[clamp(15px,1.6vw,18px)] tracking-[0.08em] uppercase mb-4"
                  style={{ color: "#D4A843" }}
                >
                  Nous sommes là où le cinéma ne nous attend pas.
                </motion.p>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7, ease: SNAP }}
                  className="text-[clamp(15px,2vw,18px)] text-white/60 leading-[1.52] tracking-[-0.01em] max-w-[520px] mb-8"
                >
                  Sans notes, sans classement, sans jugement. 8 modules pour qu&apos;une classe entière crée son premier
                  film — du brainstorm au festival.
                </motion.p>

                {/* Social proof hero — avant CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.58, duration: 0.6, ease: SNAP }}
                  className="flex items-center gap-3 mb-8"
                >
                  <span
                    className="text-[11px] leading-snug text-white/50 italic max-w-[340px] border-l-2 pl-3"
                    style={{ borderColor: "#FF6B35" }}
                  >
                    &ldquo;Les élèves qui ne participaient jamais se sont révélés — 15 ans de carrière, jamais vu
                    ça.&rdquo;
                    <span className="not-italic text-white/30 block mt-0.5">
                      — Sophie Martin, Collège Jean Moulin, Bondy
                    </span>
                  </span>
                </motion.div>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.7, ease: SNAP }}
                  className="flex items-center gap-4 flex-wrap mb-7"
                >
                  <Link
                    href={ROUTES.requestAccess}
                    className="px-9 py-4 rounded-xl text-base font-bold text-white shadow-[0_4px_24px_rgba(255,107,53,0.4)] hover:shadow-[0_10px_40px_rgba(255,107,53,0.58)] hover:-translate-y-1 active:translate-y-0 transition-[transform,box-shadow] duration-200 ease-out"
                    style={{ background: "#FF6B35" }}
                  >
                    Lancer mon premier atelier
                  </Link>
                  <Link
                    href="/projet"
                    className="px-9 py-4 rounded-xl text-base font-bold text-white/85 bg-white/[0.05] border border-white/10 hover:border-[#FF6B35]/40 hover:text-white hover:shadow-[0_4px_20px_rgba(255,107,53,0.18)] transition-all duration-200"
                  >
                    Voir la méthode
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, ease: SNAP }}
                  className="flex items-center gap-6 text-[13px] text-white/55"
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

            {/* Stats panel cinéma */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.85, ease: SNAP }}
              className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.07] mt-16 rounded-2xl overflow-hidden border border-white/[0.08] bg-black/20 backdrop-blur-md"
            >
              {[
                { value: 87, label: "Films produits", color: "#FF6B35", suffix: "" },
                { value: 1247, label: "Élèves participants", color: "#D4A843", suffix: "" },
                { value: 32, label: "Établissements", color: "#4ECDC4", suffix: "" },
                { value: 94, label: "Taux d&apos;engagement", color: "#ffffff", suffix: "%" },
              ].map((stat) => (
                <div key={stat.label} className="px-6 md:px-8 py-6 text-center">
                  <div
                    className="font-cinema text-[clamp(40px,5vw,72px)] leading-none mb-1"
                    style={{ color: stat.color }}
                  >
                    <CountUp target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">{stat.label}</div>
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
              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "rgba(255,107,53,0.4)" }} />
            </span>
          ))}
        </div>
      </div>

      {/* ══════════ VALUE PROPS ══════════ */}
      <section className="py-16 bg-[#0d0b09]">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="inline-block w-6 h-[1.5px] rounded-full" style={{ background: "#D4A843" }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "#D4A843" }}>
                POUR CHAQUE RÔLE
              </span>
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
                <div className="relative overflow-hidden rounded-2xl p-5 md:p-8 text-center hover:-translate-y-1 transition-all group ring-1 ring-white/[0.07] hover:ring-white/14 bg-white/[0.025]">
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
                  <h3 className="text-[18px] font-bold tracking-tight mb-2.5">{card.title}</h3>
                  <p className="text-[13px] text-white/48 leading-relaxed">{card.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          {/* CTA intermédiaire */}
          <Reveal className="text-center mt-10">
            <Link
              href={ROUTES.requestAccess}
              className="inline-flex items-center gap-2 text-[13px] font-bold text-white/60 hover:text-[#FF6B35] transition-colors group"
            >
              Rejoignez 32 établissements qui créent autrement
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══════════ TIMELINE ══════════ */}
      <section className="py-28 bg-[#110e0b]">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal className="mb-14">
            <div className="font-cinema text-[13px] tracking-[0.25em] mb-3" style={{ color: "#4ECDC4" }}>
              COMMENT ÇA MARCHE
            </div>
            <h2 className="font-cinema text-[clamp(32px,5vw,64px)] uppercase leading-[1.0]">
              4 étapes pour créer un film
            </h2>
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
            <div className="font-cinema text-[13px] tracking-[0.25em] mb-3" style={{ color: "#FF6B35" }}>
              PARCOURS PÉDAGOGIQUE
            </div>
            <h2 className="font-cinema text-[clamp(32px,5vw,64px)] uppercase leading-[1.0]">
              8 modules, un parcours complet
            </h2>
            <p className="text-[clamp(15px,2vw,18px)] text-white/48 max-w-[560px] mx-auto mt-3">
              Chaque module développe des compétences du Parcours d&apos;Éducation Artistique et Culturelle (PEAC) et du
              Socle Commun.
            </p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {MODULES.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.05}>
                <motion.div
                  className="rounded-2xl p-5 text-center cursor-pointer relative overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.07)",
                  }}
                  whileHover={{
                    y: -4,
                    background: `${m.color}0d`,
                    boxShadow: `0 0 0 1px ${m.color}40, 0 8px 32px ${m.color}1a`,
                  }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: m.color, opacity: 0.55 }}
                  />
                  <motion.div
                    className="text-[30px] mb-2.5 mt-1"
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.15 }}
                  >
                    {m.icon}
                  </motion.div>
                  <div className="text-[13px] font-bold mb-1">
                    <span style={{ color: m.color }}>{m.id}</span> — {m.name}
                  </div>
                  <div className="text-[11px] text-white/38">{m.desc}</div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ BREAK CINÉMA — 87 FILMS ══════════ */}
      <section className="py-20 bg-[#0d0b09] overflow-hidden relative flex items-center justify-center min-h-[200px]">
        <Reveal>
          <div className="text-center relative z-[1] px-6">
            {/* Chiffre fantôme derrière */}
            <div
              className="font-cinema absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none select-none pointer-events-none"
              style={{ fontSize: "clamp(120px,22vw,280px)", color: "rgba(255,107,53,0.04)" }}
              aria-hidden="true"
            >
              87
            </div>
            <div
              className="font-cinema uppercase leading-none relative"
              style={{ fontSize: "clamp(48px,8vw,110px)", color: "#FF6B35" }}
            >
              87 films
            </div>
            <div className="text-[13px] text-white/35 mt-3 tracking-[0.08em]">
              produits depuis le premier atelier à Bondy
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══════════ FORMULES ══════════ */}
      <section className="py-28 bg-[#110e0b]">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal className="text-center mb-12">
            <div className="font-cinema text-[13px] tracking-[0.25em] mb-3" style={{ color: "#D4A843" }}>
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
                  className="rounded-2xl bg-white/[0.025] ring-1 ring-white/[0.07] p-4 md:p-7 relative overflow-hidden hover:ring-white/14 hover:-translate-y-1 transition-all"
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
                  <h3 className="text-[18px] font-bold tracking-tight mb-2">{f.title}</h3>
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
                  <div className="text-[11px] text-white/40">Compétences PEAC : {f.peac}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ VOIX D'ÉLÈVE ══════════ */}
      <section className="py-12 bg-[#110e0b] border-y border-white/[0.04]">
        <Reveal>
          <div className="max-w-[820px] mx-auto px-6 text-center">
            <p className="font-cinema uppercase leading-[1.12] mb-6" style={{ fontSize: "clamp(26px,4.5vw,56px)" }}>
              <span className="text-white/35">&ldquo;J&apos;avais jamais tenu une caméra.</span>
              <br />
              <span style={{ color: "#FF6B35" }}>J&apos;ai filmé ma première scène.&rdquo;</span>
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-[#FF6B35]/30" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
                Yanis, 13 ans · Cadreur · Collège Jean Moulin, Bondy
              </span>
              <span className="w-8 h-px bg-[#FF6B35]/30" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══════════ TEMOIGNAGES ══════════ */}
      <section className="py-24 bg-[#0d0b09]">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal className="text-center mb-12">
            <div className="font-cinema text-[13px] tracking-[0.25em] mb-3" style={{ color: "#FF6B35" }}>
              TÉMOIGNAGES
            </div>
            <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold leading-tight mb-3">
              Ils en parlent mieux que nous
            </h2>
            <div
              className="mx-auto w-16 h-[2px] rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, #FF6B35, transparent)" }}
            />
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.author} delay={i * 0.1}>
                <div className="rounded-2xl bg-white/[0.025] ring-1 ring-white/[0.07] p-4 md:p-7 relative hover:ring-white/14 hover:-translate-y-0.5 transition-all">
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
            <div className="font-cinema text-[13px] tracking-[0.25em] mb-4" style={{ color: "#FF6B35" }}>
              PRÊT À TOURNER ?
            </div>
            <h2 className="text-[clamp(32px,5vw,60px)] font-extrabold leading-tight mb-4">
              Prêt à créer votre premier film ?
            </h2>
            <p className="text-[clamp(15px,2vw,18px)] text-white/55 leading-relaxed mb-10">
              Lancez votre atelier en quelques minutes. Gratuit pour tous les établissements scolaires publics.
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
