import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";

export const metadata: Metadata = {
  title: "Le Projet — Banlieuwood",
  description:
    "Banlieuwood : ateliers pédagogiques de création cinématographique. Découvrez notre manifeste, notre méthode et notre vision.",
};

/* ── Data ── */

const CONVICTIONS = [
  {
    title: "De spectateur à créateur",
    text: "Les jeunes ne doivent pas être seulement des consommateurs d\u2019images. Ils peuvent aussi devenir des créateurs. Créer une image, raconter une histoire, construire un film\u2026 ce sont des expériences qui changent la manière dont on regarde le monde.",
  },
  {
    title: "Le cinéma comme outil",
    text: "Le cinéma est un langage universel. Il mélange images, émotions, personnages et situations. À travers le cinéma, les jeunes découvrent que raconter une histoire demande de réfléchir, d\u2019imaginer et de collaborer.",
  },
  {
    title: "Une aventure collective",
    text: "Faire un film n\u2019est jamais une aventure solitaire. C\u2019est un travail collectif. Certains inventent l\u2019histoire, d\u2019autres jouent devant la caméra, d\u2019autres encore organisent ou filment. Chaque rôle compte.",
  },
  {
    title: "Redonner confiance",
    text: "Beaucoup de jeunes pensent qu\u2019ils ne sont pas créatifs. L\u2019expérience montre souvent l\u2019inverse. Quand on leur donne un cadre, un espace et une occasion d\u2019imaginer, les idées apparaissent.",
  },
];

const PEDAGOGIE_POINTS = [
  {
    num: "01",
    title: "Vivre l\u2019expérience complète",
    text: "Plutôt que de commencer directement par un tournage, les élèves passent par toutes les étapes : observer, imaginer, structurer, écrire, mettre en scène, préparer le tournage.",
    color: "#FF6B35",
  },
  {
    num: "02",
    title: "Apprendre en expérimentant",
    text: "Banlieuwood ne se présente pas comme un cours. Chaque module propose une situation concrète : interpréter une image, inventer une idée, transformer une idée en pitch, construire une histoire collective.",
    color: "#4ECDC4",
  },
  {
    num: "03",
    title: "Le collectif avant tout",
    text: "Les idées individuelles deviennent progressivement les éléments d\u2019une création commune. Les élèves apprennent à écouter, à défendre une idée, à accepter des compromis et à construire ensemble.",
    color: "#D4A843",
  },
  {
    num: "04",
    title: "Un outil qui accompagne sans remplacer",
    text: "L\u2019outil numérique structure les activités, collecte les idées et facilite les votes collectifs. Mais il ne remplace jamais l\u2019intervenant. Les discussions, les débats et les décisions restent humaines.",
    color: "#D4A843",
  },
];

const MODULES = [
  { id: "M1", name: "Le Regard", icon: "👁️", desc: "Analyse d'images", color: "#FF6B35" },
  { id: "M2", name: "Les Émotions", icon: "🎭", desc: "Identifier et nommer", color: "#D4A843" },
  { id: "M3", name: "Et si...", icon: "💡", desc: "Brainstorm collectif", color: "#4ECDC4" },
  { id: "M4", name: "Le Pitch", icon: "🎙️", desc: "Présenter son idée", color: "#FF8C5A" },
  { id: "M5", name: "Le Vote", icon: "🏆", desc: "Choix démocratique", color: "#E8B84B" },
  { id: "M6", name: "Le Scénario", icon: "📝", desc: "Écriture collaborative", color: "#5DD6CF" },
  { id: "M7", name: "Storyboard", icon: "🎞️", desc: "Plans et cadrage", color: "#FF6B35" },
  { id: "M8", name: "L'Équipe", icon: "⭐", desc: "Rôles et talents", color: "#D4A843" },
];

export default function ProjetPage() {
  return (
    <div
      className="min-h-dvh bg-[#0d0b09] text-white"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}
    >
      <SiteNavbar />
      <ScrollProgressBar />
      {/* ══ Hero ══ */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Ambient blobs */}
        <div
          className="absolute top-[-180px] left-[-120px] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "#FF6B35", opacity: 0.08, filter: "blur(140px)" }}
        />
        <div
          className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "#D4A843", opacity: 0.07, filter: "blur(120px)" }}
        />
        {/* Film grain */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.022]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="grain-projet">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-projet)" />
        </svg>
        <div className="relative max-w-[800px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#FF6B35]">NOTRE MISSION</span>
          </div>
          <h1 className="font-cinema text-[clamp(42px,6vw,76px)] leading-[1.0] uppercase tracking-wide mb-6">
            Démocratiser la création
            <br />
            <span className="bg-gradient-to-r from-[#FF6B35] via-[#D4A843] to-[#4ECDC4] bg-clip-text text-transparent">
              cinématographique en classe
            </span>
          </h1>
          <p className="text-[clamp(15px,2vw,18px)] text-white/60 leading-[1.52] tracking-[-0.01em] max-w-[580px] mx-auto">
            Banlieuwood croit que chaque élève est un créateur. Pas de notes, pas de classement — juste la joie de créer
            ensemble, avec les outils du cinéma professionnel.
          </p>
        </div>
      </section>

      {/* ══ Doctrine ══ */}
      <section className="py-20 bg-[#110e0b]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#D4A843] mb-2">PÉDAGOGIE</div>
              <h2 className="font-cinema text-[clamp(22px,3vw,36px)] uppercase leading-tight mb-4">
                La donnée au service de la création, pas du jugement
              </h2>
              <p className="text-[14px] text-white/60 leading-relaxed mb-4">
                Chez Banlieuwood, les données des élèves sont pédagogiques, pas performatives. L&apos;intervenant pilote
                la séance — il ne juge pas les élèves.
              </p>
              <p className="text-[14px] text-white/60 leading-relaxed mb-4">
                Pas de scores individuels visibles. Pas de classement. Pas de profilage comportemental. Juste des taux
                de participation collectifs et des créations à célébrer.
              </p>
              <div className="flex gap-2 flex-wrap">
                {["Anonymisation des métriques", "Pas de XP visible", "Conforme RGPD"].map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#4ECDC4]/15 text-[#4ECDC4]"
                  >
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-[#141210] border border-[#2a2420] p-8 text-center">
              <div className="text-[64px] mb-4">🎭</div>
              <blockquote className="text-[16px] italic text-white/60 leading-relaxed">
                &ldquo;Si une fonctionnalité permet à un adulte d&apos;identifier un élève et de l&apos;évaluer à partir
                de ses données, cette fonctionnalité ne doit pas exister.&rdquo;
              </blockquote>
              <div className="text-[12px] text-white/40 mt-3">— Doctrine Banlieuwood</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Convictions ══ */}
      <section className="py-20 bg-[#0d0b09]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#FF6B35] mb-2">NOS CONVICTIONS</div>
            <h2 className="font-cinema text-[clamp(28px,4vw,48px)] uppercase leading-tight">
              Ce que nous croyons vraiment
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CONVICTIONS.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-[#141210] border border-[#2a2420] p-7 ring-1 ring-white/[0.04] hover:ring-[#FF6B35]/20 hover:border-[#FF6B35]/30 transition-all duration-200"
              >
                <h3 className="text-[16px] font-bold mb-2">{c.title}</h3>
                <p className="text-[13px] text-white/60 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PEAC Alignment ══ */}
      <section className="py-20 bg-[#110e0b]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#4ECDC4] mb-2">
              ALIGNEMENT ÉDUCATION NATIONALE
            </div>
            <h2 className="font-cinema text-[clamp(28px,4vw,48px)] uppercase leading-tight">
              Ancré dans les programmes officiels
            </h2>
            <p className="text-[clamp(15px,2vw,18px)] text-white/60 max-w-[560px] mx-auto mt-3">
              Chaque module est conçu en référence aux textes officiels de l&apos;Éducation Nationale.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: "🔍",
                title: "Rencontrer",
                color: "#FF6B35",
                text: "Fréquenter les œuvres, développer une culture artistique personnelle. Modules M1 (Le Regard) et M2 (Les Émotions) — analyse filmique, lecture d'image, vocabulaire cinématographique.",
              },
              {
                icon: "🎨",
                title: "Pratiquer",
                color: "#4ECDC4",
                text: "S'engager dans un processus de création. Modules M3 à M7 — brainstorm, pitch oral, écriture scénariste, storyboard. Les élèves pratiquent tous les métiers du cinéma.",
              },
              {
                icon: "💡",
                title: "S'approprier",
                color: "#D4A843",
                text: "Construire un jugement esthétique. Module M5 (Le Vote) et M8 (L'Équipe) — argumenter ses choix, s'exprimer devant un groupe, assumer un rôle créatif.",
              },
            ].map((p) => (
              <div
                key={p.title}
                className="rounded-2xl bg-[#141210] border border-[#2a2420] p-7"
                style={{ borderLeftWidth: 4, borderLeftColor: p.color }}
              >
                <div className="text-[28px] mb-3">{p.icon}</div>
                <h4 className="text-[16px] font-bold mb-2" style={{ color: p.color }}>
                  {p.title}
                </h4>
                <p className="text-[13px] text-white/60 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-8">
            {["Socle Commun D1.1", "Socle Commun D1.4", "Socle Commun D2", "Socle Commun D3", "Socle Commun D5"].map(
              (b) => (
                <span key={b} className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#FF6B35]/15 text-[#FF8C5A]">
                  {b}
                </span>
              ),
            )}
            {["Arts Plastiques Cycle 3", "Arts Plastiques Cycle 4"].map((b) => (
              <span key={b} className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#4ECDC4]/15 text-[#4ECDC4]">
                {b}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#D4A843]/15 text-[#D4A843]">PEAC</span>
            {["École et cinéma", "Collège au cinéma"].map((b) => (
              <span key={b} className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#4ECDC4]/15 text-[#4ECDC4]">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Pedagogie 4 points ══ */}
      <section className="py-20 bg-[#0d0b09]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#4ECDC4] mb-2">NOTRE MÉTHODE</div>
            <h2 className="font-cinema text-[clamp(28px,4vw,48px)] uppercase leading-tight">
              4 principes pédagogiques
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PEDAGOGIE_POINTS.map((p) => (
              <div
                key={p.num}
                className="rounded-2xl bg-[#141210] border border-[#2a2420] p-7 ring-1 ring-white/[0.04] hover:ring-[#FF6B35]/20 hover:border-[#FF6B35]/30 transition-all duration-200"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-black"
                    style={{ background: `${p.color}15`, color: p.color }}
                  >
                    {p.num}
                  </div>
                  <h3 className="text-[16px] font-bold">{p.title}</h3>
                </div>
                <p className="text-[13px] text-white/60 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Modules clickables ══ */}
      <section className="py-16 bg-[#110e0b]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-8">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#4ECDC4] mb-2">
              MODULES DÉTAILLÉS
            </div>
            <h2 className="font-cinema text-[clamp(22px,3vw,32px)] uppercase leading-tight">
              8 modules, un parcours complet
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MODULES.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-[#141210] border border-[#2a2420] p-4 text-center ring-1 ring-white/[0.05] hover:ring-[#FF6B35]/25 hover:border-[#FF6B35]/30 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 group"
                style={{ borderTopWidth: 3, borderTopColor: m.color }}
              >
                <div className="text-[28px] mb-2">{m.icon}</div>
                <div className="text-[12px] font-bold">
                  {m.id} — {m.name}
                </div>
                <div className="text-[11px] text-white/40 mt-1">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Comparatif formules ══ */}
      <section className="py-16 bg-[#0d0b09]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-8">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#D4A843] mb-2">DURÉE & MODULES</div>
            <h2 className="font-cinema text-[clamp(22px,3vw,32px)] uppercase leading-tight">Comparatif des formules</h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[#2a2420]">
            <table className="w-full text-[13px]" style={{ borderCollapse: "collapse", minWidth: "480px" }}>
              <thead>
                <tr>
                  <th className="p-3 text-left text-[11px] uppercase tracking-wider text-white/40 bg-[#141210] border-b border-[#2a2420]">
                    Module
                  </th>
                  <th className="p-3 text-center text-[11px] uppercase tracking-wider text-white/40 bg-[#141210] border-b border-[#2a2420]">
                    F0 (1h)
                  </th>
                  <th className="p-3 text-center text-[11px] uppercase tracking-wider text-white/40 bg-[#141210] border-b border-[#2a2420]">
                    F1 (3h)
                  </th>
                  <th className="p-3 text-center text-[11px] uppercase tracking-wider text-white/40 bg-[#141210] border-b border-[#2a2420]">
                    F2 (8h)
                  </th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((m, i) => (
                  <tr key={m.id} className="border-b border-[#2a2420] last:border-b-0 hover:bg-[#FF6B35]/[0.03]">
                    <td className="p-3">
                      {m.id} — {m.name}
                    </td>
                    <td className="p-3 text-center">
                      {i === 0 ? <span className="text-[#4ECDC4]">✓</span> : <span className="text-white/40">—</span>}
                    </td>
                    <td className="p-3 text-center">
                      {i < 3 ? <span className="text-[#4ECDC4]">✓</span> : <span className="text-white/40">—</span>}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-[#4ECDC4]">✓</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-20 bg-[#110e0b]">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <h2 className="font-cinema text-[clamp(36px,5vw,64px)] uppercase leading-[1.0] mb-4">Prêt à tourner ?</h2>
          <p className="text-[clamp(15px,2vw,18px)] text-white/60 mb-8">
            Lancez votre premier atelier en quelques minutes.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href={ROUTES.requestAccess}
              className="px-9 py-4 rounded-xl text-base font-bold text-white shadow-[0_4px_20px_rgba(255,107,53,0.35)] hover:shadow-[0_10px_40px_rgba(255,107,53,0.55)] hover:-translate-y-1 active:translate-y-0 transition-[transform,box-shadow] duration-200 ease-out"
              style={{ background: "#FF6B35" }}
            >
              Créer un compte
            </Link>
            <Link
              href="/contact"
              className="px-9 py-4 rounded-xl text-base font-bold text-white bg-[#141210] border border-[#2a2420] hover:border-[#FF6B35] hover:shadow-[0_4px_16px_rgba(255,107,53,0.18)] transition-all duration-200"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
