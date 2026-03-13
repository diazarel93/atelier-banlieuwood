import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Le Projet",
  description:
    "Banlieuwood : ateliers pedagogiques de creation cinematographique. Decouvrez notre manifeste, notre methode et notre vision.",
};

/* ── Data ── */

const CONVICTIONS = [
  {
    title: "De spectateur a createur",
    text: "Les jeunes ne doivent pas etre seulement des consommateurs d\u2019images. Ils peuvent aussi devenir des createurs. Creer une image, raconter une histoire, construire un film\u2026 ce sont des experiences qui changent la maniere dont on regarde le monde.",
  },
  {
    title: "Le cinema comme outil",
    text: "Le cinema est un langage universel. Il melange images, emotions, personnages et situations. A travers le cinema, les jeunes decouvrent que raconter une histoire demande de reflechir, d\u2019imaginer et de collaborer.",
  },
  {
    title: "Une aventure collective",
    text: "Faire un film n\u2019est jamais une aventure solitaire. C\u2019est un travail collectif. Certains inventent l\u2019histoire, d\u2019autres jouent devant la camera, d\u2019autres encore organisent ou filment. Chaque role compte.",
  },
  {
    title: "Redonner confiance",
    text: "Beaucoup de jeunes pensent qu\u2019ils ne sont pas creatifs. L\u2019experience montre souvent l\u2019inverse. Quand on leur donne un cadre, un espace et une occasion d\u2019imaginer, les idees apparaissent.",
  },
];

const PEDAGOGIE_POINTS = [
  {
    num: "01",
    title: "Vivre l\u2019experience complete",
    text: "Plutot que de commencer directement par un tournage, les eleves passent par toutes les etapes : observer, imaginer, structurer, ecrire, mettre en scene, preparer le tournage.",
    color: "#FF6B35",
  },
  {
    num: "02",
    title: "Apprendre en experimentant",
    text: "Banlieuwood ne se presente pas comme un cours. Chaque module propose une situation concrete : interpreter une image, inventer une idee, transformer une idee en pitch, construire une histoire collective.",
    color: "#8B5CF6",
  },
  {
    num: "03",
    title: "Le collectif avant tout",
    text: "Les idees individuelles deviennent progressivement les elements d\u2019une creation commune. Les eleves apprennent a ecouter, a defendre une idee, a accepter des compromis et a construire ensemble.",
    color: "#4ECDC4",
  },
  {
    num: "04",
    title: "Un outil qui accompagne sans remplacer",
    text: "L\u2019outil numerique structure les activites, collecte les idees et facilite les votes collectifs. Mais il ne remplace jamais l\u2019intervenant. Les discussions, les debats et les decisions restent humaines.",
    color: "#D4A843",
  },
];

const DIFFERENCES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "Pas seulement technique",
    text: "Les ateliers classiques se concentrent sur filmer ou monter. Banlieuwood permet de comprendre comment une idee devient une histoire, puis un film.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Tous les eleves participent",
    text: "Grace au systeme de participation individuelle via tablette, chaque eleve propose des idees, repond aux questions et participe aux votes. Les idees peuvent etre selectionnees de maniere anonyme.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
        <polyline points="17 2 12 7 7 2" />
      </svg>
    ),
    title: "Ludique, pas scolaire",
    text: "Choix interactifs, cartes narratives, jeux de construction de scenes, missions creatives. L\u2019experience ressemble a un jeu de creation, pas a un exercice.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Structure progressive",
    text: "Huit modules qui suivent une progression logique. Les eleves passent de l\u2019observation a la creation, de l\u2019idee individuelle a l\u2019histoire collective.",
  },
];

const COMPETENCES = [
  { label: "Creativite", color: "#FF6B35" },
  { label: "Expression", color: "#8B5CF6" },
  { label: "Ecoute", color: "#4ECDC4" },
  { label: "Argumentation", color: "#D4A843" },
  { label: "Cooperation", color: "#EC4899" },
  { label: "Organisation", color: "#10B981" },
];

const VISION_ETAPES = [
  {
    title: "Deployer les ateliers",
    text: "Tester la methode pedagogique, ameliorer l\u2019outil numerique, former des intervenants, developper un reseau d\u2019etablissements partenaires.",
    status: "En cours",
  },
  {
    title: "Plateforme pedagogique",
    text: "Gerer les ateliers, accompagner les intervenants, conserver les creations des eleves, generer des contenus pedagogiques et analyser les dynamiques creatives.",
    status: "En developpement",
  },
  {
    title: "Reseau d\u2019intervenants",
    text: "Formation specifique pour transmettre la philosophie pedagogique, le fonctionnement des modules et l\u2019utilisation de l\u2019outil numerique.",
    status: "A venir",
  },
  {
    title: "Communaute de createurs",
    text: "Espace de partage des films realises, rencontres entre participants, projets collaboratifs au-dela des ateliers scolaires.",
    status: "A venir",
  },
  {
    title: "Parcours avances",
    text: "Ateliers approfondis, residences de creation, collaborations avec des professionnels du cinema pour les eleves les plus passionnes.",
    status: "Vision",
  },
  {
    title: "Autres disciplines",
    text: "Adapter la methode a l\u2019ecriture, le theatre, l\u2019animation, la creation sonore. Le principe reste le meme : progression ludique et collaborative.",
    status: "Vision",
  },
];

const STATUS_COLORS: Record<string, string> = {
  "En cours": "#4ECDC4",
  "En developpement": "#8B5CF6",
  "A venir": "#D4A843",
  Vision: "#FF6B35",
};

const IMPACT_OBJECTIFS = [
  "Developper la creativite des jeunes",
  "Encourager l\u2019expression personnelle",
  "Favoriser le travail collectif",
  "Apprendre a structurer une idee",
  "Decouvrir le langage du cinema",
  "Rendre la creation artistique accessible",
];

const CONTEXTES = [
  "Ecoles primaires",
  "Colleges",
  "Lycees",
  "Centres culturels",
  "Structures associatives",
];

/* ── Page ── */

export default function ProjetPage() {
  return (
    <div className="min-h-screen bg-bw-bg text-bw-text antialiased">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 h-14 flex items-center px-6 border-b border-bw-border bg-bw-bg/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-bw-muted hover:text-bw-heading transition-colors duration-150"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 12L6 8L10 4" />
            </svg>
            Accueil
          </Link>
          <Link href="/">
            <BrandLogo size="sm" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="max-w-4xl mx-auto px-6 pt-16 pb-12 sm:pt-20 sm:pb-16">
        <p className="text-sm font-medium text-bw-primary mb-3 tracking-wide uppercase">
          Le Projet
        </p>
        <h1
          className="text-bw-heading font-bold leading-tight"
          style={{ fontSize: "clamp(28px, 5vw, 44px)" }}
        >
          Le cinema comme outil d&apos;education
        </h1>
        <p className="text-bw-text text-lg leading-relaxed mt-4 max-w-2xl">
          Banlieuwood propose des ateliers pedagogiques de creation audiovisuelle
          destines aux jeunes. A travers un parcours progressif, les participants
          decouvrent comment imaginer une histoire et la transformer en film
          collectif.
        </p>
      </header>

      {/* ════════════════════════════════════════════
         1. MANIFESTE — Nos convictions
         ════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-bw-heading mb-2">
          Notre manifeste
        </h2>
        <p className="text-bw-muted mb-10">
          Les convictions qui guident chaque atelier.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {CONVICTIONS.map((c) => (
            <div
              key={c.title}
              className="bg-bw-surface border border-bw-border rounded-2xl p-6"
            >
              <h3 className="font-semibold text-bw-heading mb-2">{c.title}</h3>
              <p className="text-sm text-bw-text leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-bw-surface border border-bw-border rounded-2xl p-6 sm:p-8">
          <blockquote className="text-bw-heading font-medium text-lg leading-relaxed border-l-3 border-bw-primary pl-5">
            &laquo;&thinsp;Tout le monde peut apprendre a raconter une histoire.
            Il suffit parfois d&apos;un moment, d&apos;un groupe et d&apos;un
            cadre pour que les idees apparaissent. Banlieuwood existe pour offrir
            ce moment.&thinsp;&raquo;
          </blockquote>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-bw-border" />
      </div>

      {/* ════════════════════════════════════════════
         2. PEDAGOGIE — Notre intention
         ════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-bw-heading mb-2">
          Notre pedagogie
        </h2>
        <p className="text-bw-muted mb-10">
          Une methode basee sur l&apos;experience, pas sur le cours magistral.
        </p>

        <div className="space-y-4">
          {PEDAGOGIE_POINTS.map((p) => (
            <div key={p.num} className="flex gap-4">
              <span
                className="shrink-0 w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center"
                style={{
                  background: `${p.color}15`,
                  color: p.color,
                }}
              >
                {p.num}
              </span>
              <div>
                <h3 className="font-semibold text-bw-heading">{p.title}</h3>
                <p className="text-sm text-bw-text leading-relaxed mt-1">
                  {p.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-bw-border" />
      </div>

      {/* ════════════════════════════════════════════
         3. CE QUI NOUS REND UNIQUES
         ════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-bw-heading mb-2">
          Ce qui nous rend uniques
        </h2>
        <p className="text-bw-muted mb-10">
          Face aux ateliers cinema existants, Banlieuwood se distingue.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {DIFFERENCES.map((d) => (
            <div
              key={d.title}
              className="bg-bw-surface border border-bw-border rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-bw-primary/10 text-bw-primary flex items-center justify-center">
                  {d.icon}
                </div>
                <h3 className="font-semibold text-bw-heading">{d.title}</h3>
              </div>
              <p className="text-sm text-bw-text leading-relaxed">{d.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-bw-border" />
      </div>

      {/* ════════════════════════════════════════════
         4. COMPETENCES & IMPACT
         ════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-bw-heading mb-2">
          Impact educatif
        </h2>
        <p className="text-bw-muted mb-10">
          Les competences que le programme developpe chez les jeunes.
        </p>

        <div className="grid sm:grid-cols-2 gap-8">
          {/* Competences */}
          <div>
            <h3 className="text-sm font-semibold text-bw-heading uppercase tracking-wide mb-4">
              Competences mobilisees
            </h3>
            <div className="flex flex-wrap gap-2">
              {COMPETENCES.map((c) => (
                <span
                  key={c.label}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                  style={{
                    background: `${c.color}12`,
                    color: c.color,
                    border: `1px solid ${c.color}25`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: c.color }}
                  />
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          {/* Objectifs */}
          <div>
            <h3 className="text-sm font-semibold text-bw-heading uppercase tracking-wide mb-4">
              Objectifs pedagogiques
            </h3>
            <ul className="space-y-2.5">
              {IMPACT_OBJECTIFS.map((o) => (
                <li key={o} className="flex items-start gap-2.5 text-sm text-bw-text">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4ECDC4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="shrink-0 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contextes */}
        <div className="mt-10 bg-bw-surface border border-bw-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-bw-heading uppercase tracking-wide mb-4">
            Contextes d&apos;intervention
          </h3>
          <div className="flex flex-wrap gap-2">
            {CONTEXTES.map((c) => (
              <span
                key={c}
                className="rounded-lg bg-bw-bg border border-bw-border px-3 py-1.5 text-sm text-bw-text"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-bw-border" />
      </div>

      {/* ════════════════════════════════════════════
         5. VISION A LONG TERME
         ════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-bw-heading mb-2">
          Vision a long terme
        </h2>
        <p className="text-bw-muted mb-10">
          Comment le dispositif pourrait evoluer dans les annees a venir.
        </p>

        <div className="space-y-0">
          {VISION_ETAPES.map((v, i) => (
            <div key={v.title} className="flex gap-6 items-start">
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className="w-3 h-3 rounded-full shrink-0 mt-1.5"
                  style={{ background: STATUS_COLORS[v.status] || "#FF6B35" }}
                />
                {i < VISION_ETAPES.length - 1 && (
                  <div className="w-px h-full min-h-16 bg-bw-border" />
                )}
              </div>
              {/* Content */}
              <div className="pb-6 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-bw-heading">{v.title}</h3>
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: `${STATUS_COLORS[v.status]}15`,
                      color: STATUS_COLORS[v.status],
                    }}
                  >
                    {v.status}
                  </span>
                </div>
                <p className="text-sm text-bw-text leading-relaxed">{v.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-bw-border" />
      </div>

      {/* ════════════════════════════════════════════
         6. POSITIONNEMENT
         ════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-bw-heading mb-2">
          Notre positionnement
        </h2>
        <p className="text-bw-muted mb-10">
          Banlieuwood n&apos;est pas un simple atelier cinema parmi d&apos;autres.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              title: "Atelier technique",
              desc: "Camera, tournage, montage. Decouverte technique mais peu de construction narrative.",
              label: "Les autres",
              color: "#5c5c60",
            },
            {
              title: "Atelier d\u2019analyse",
              desc: "Langage cinematographique, mise en scene, references. Enrichissant mais principalement theorique.",
              label: "Les autres",
              color: "#5c5c60",
            },
            {
              title: "Banlieuwood",
              desc: "L\u2019ensemble du processus : de l\u2019idee a l\u2019histoire, de l\u2019histoire au scenario, du scenario au film. Creation collective et progressive.",
              label: "Notre approche",
              color: "#FF6B35",
            },
          ].map((p) => (
            <div
              key={p.title}
              className="rounded-2xl p-6 border"
              style={{
                background:
                  p.color === "#FF6B35"
                    ? "rgba(255,107,53,0.06)"
                    : "var(--color-bw-surface)",
                borderColor:
                  p.color === "#FF6B35"
                    ? "rgba(255,107,53,0.2)"
                    : "var(--color-bw-border)",
              }}
            >
              <span
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: p.color }}
              >
                {p.label}
              </span>
              <h3 className="font-semibold text-bw-heading mt-2 mb-2">
                {p.title}
              </h3>
              <p className="text-sm text-bw-text leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-bw-surface border border-bw-border rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-bw-heading mb-3">
            Envie de collaborer ?
          </h2>
          <p className="text-bw-text mb-8 max-w-md mx-auto">
            Vous etes un etablissement scolaire, une structure culturelle ou un
            partenaire institutionnel ? Parlons de votre projet.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={ROUTES.contact}
              className="h-11 px-6 inline-flex items-center text-sm font-semibold rounded-xl bg-bw-primary text-white hover:bg-bw-primary-500 transition-colors duration-200 shadow-bw-glow-primary"
            >
              Nous contacter
            </Link>
            <Link
              href={ROUTES.about}
              className="h-11 px-6 inline-flex items-center text-sm font-medium rounded-xl text-bw-heading border border-bw-border hover:bg-bw-surface-dim transition-colors duration-200"
            >
              A propos de l&apos;association
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-bw-border px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-xs text-bw-muted">&copy; 2026 Banlieuwood</p>
          <div className="flex gap-4">
            <Link
              href="/legal/privacy"
              className="text-xs text-bw-muted hover:text-bw-heading transition-colors"
            >
              Confidentialite
            </Link>
            <Link
              href="/legal/cgu"
              className="text-xs text-bw-muted hover:text-bw-heading transition-colors"
            >
              CGU
            </Link>
            <Link
              href={ROUTES.contact}
              className="text-xs text-bw-muted hover:text-bw-heading transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
