import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "A propos",
  description:
    "Decouvrez Banlieuwood, l'association qui utilise le cinema comme outil educatif depuis 2015. 500+ jeunes formes, 30+ films produits.",
};

/* ── Data ── */

const IMPACT_STATS = [
  { value: "500+", label: "Jeunes formes", detail: "depuis 2015" },
  { value: "30+", label: "Films produits", detail: "courts-metrages & docs" },
  { value: "15+", label: "Selections festivals", detail: "dont Amazon Prime" },
  { value: "85%", label: "Continuent", detail: "dans l'audiovisuel" },
];

const METHOD_STEPS = [
  {
    step: "01",
    title: "Masterclass & Ecriture",
    desc: "Les jeunes decouvrent les fondamentaux du cinema, ecrivent le scenario, creent les personnages et distribuent les roles.",
  },
  {
    step: "02",
    title: "Tournage",
    desc: "Chaque participant tourne a tous les postes : camera, son, lumiere, mise en scene, jeu d'acteur.",
  },
  {
    step: "03",
    title: "Post-production",
    desc: "Montage, mixage audio, etalonnage couleur. Les jeunes finalisent leur film avec des outils professionnels.",
  },
  {
    step: "04",
    title: "Diffusion",
    desc: "Projection en salle, soumission en festivals, mise en ligne. Le film appartient a ses createurs.",
  },
];

const VALUES = [
  {
    title: "Ancrage local",
    desc: "Nos ateliers se deroulent a Saint-Denis et en Ile-de-France, au plus pres des quartiers.",
  },
  {
    title: "Equipe professionnelle",
    desc: "Realisateurs, monteurs, producteurs : nos intervenants sont des professionnels en activite.",
  },
  {
    title: "Inclusion totale",
    desc: "Gratuit, sans prerequis, ouvert a tous les 12-25 ans. Le materiel est fourni.",
  },
  {
    title: "Impact mesurable",
    desc: "Suivi des parcours, insertion professionnelle, reconnaissance en festivals.",
  },
];

const MILESTONES = [
  { year: "2015", event: "Creation de l'association a Saint-Denis" },
  { year: "2017", event: "Premiers ateliers et courts-metrages" },
  { year: "2019", event: "Selections en festivals nationaux" },
  { year: "2021", event: "Premier film distribue sur Amazon Prime" },
  { year: "2023", event: "500 jeunes formes, partenariats institutionnels" },
  { year: "2025", event: "Lancement de l'application Banlieuwood" },
];

const LABELS = [
  {
    name: "Jeunesse & Education Populaire",
    detail: "Agrement JEP delivre par l'Etat",
  },
  {
    name: "Education Nationale",
    detail: "Partenariat en cours avec le Rectorat de Creteil",
  },
  {
    name: "Ville de Saint-Denis",
    detail: "Convention culturelle 2023-2025",
  },
];

/* ── Page ── */

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bw-bg">
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
          A propos
        </p>
        <h1
          className="text-bw-heading font-bold leading-tight"
          style={{ fontSize: "clamp(28px, 5vw, 44px)" }}
        >
          Le cinema comme outil d&apos;education
        </h1>
        <p className="text-bw-text text-lg leading-relaxed mt-4 max-w-2xl">
          Banlieuwood est une association qui forme les jeunes au cinema depuis
          2015. Des ateliers gratuits, encadres par des professionnels, ou les
          participants creent leurs propres films de A a Z.
        </p>
      </header>

      {/* ── Impact Stats ── */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {IMPACT_STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-bw-surface border border-bw-border rounded-2xl p-5 text-center"
            >
              <p className="text-3xl sm:text-4xl font-bold text-bw-heading">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-bw-text mt-1">
                {stat.label}
              </p>
              <p className="text-xs text-bw-muted mt-0.5">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-bw-border" />
      </div>

      {/* ── La Methode ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-bw-heading mb-2">
          La methode
        </h2>
        <p className="text-bw-muted mb-10">
          De l&apos;ecriture a la diffusion : un parcours complet en 4 etapes.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {METHOD_STEPS.map((step) => (
            <div
              key={step.step}
              className="flex gap-4"
            >
              <span className="shrink-0 w-10 h-10 rounded-xl bg-bw-primary/10 text-bw-primary text-sm font-bold flex items-center justify-center">
                {step.step}
              </span>
              <div>
                <h3 className="font-semibold text-bw-heading">
                  {step.title}
                </h3>
                <p className="text-sm text-bw-text leading-relaxed mt-1">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-bw-border" />
      </div>

      {/* ── Valeurs ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-bw-heading mb-2">
          Nos valeurs
        </h2>
        <p className="text-bw-muted mb-10">
          Ce qui guide chaque atelier, chaque film, chaque rencontre.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="bg-bw-surface border border-bw-border rounded-2xl p-6"
            >
              <h3 className="font-semibold text-bw-heading mb-2">
                {v.title}
              </h3>
              <p className="text-sm text-bw-text leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-bw-border" />
      </div>

      {/* ── Timeline ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-bw-heading mb-2">
          Notre parcours
        </h2>
        <p className="text-bw-muted mb-10">
          10 ans de cinema en banlieue.
        </p>

        <div className="space-y-0">
          {MILESTONES.map((m, i) => (
            <div key={m.year} className="flex gap-6 items-start">
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-bw-primary shrink-0 mt-1" />
                {i < MILESTONES.length - 1 && (
                  <div className="w-px h-12 bg-bw-border" />
                )}
              </div>
              {/* Content */}
              <div className="pb-6">
                <span className="text-sm font-bold text-bw-primary">
                  {m.year}
                </span>
                <p className="text-bw-text mt-0.5">{m.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-bw-border" />
      </div>

      {/* ── Labels & Agrements ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-bw-heading mb-2">
          Labels &amp; agrements
        </h2>
        <p className="text-bw-muted mb-10">
          Reconnaissance institutionnelle de notre action.
        </p>

        <div className="space-y-4">
          {LABELS.map((l) => (
            <div
              key={l.name}
              className="flex items-start gap-3 bg-bw-surface border border-bw-border rounded-xl p-4"
            >
              <div className="w-2 h-2 rounded-full bg-bw-primary shrink-0 mt-2" />
              <div>
                <p className="font-medium text-bw-heading">{l.name}</p>
                <p className="text-sm text-bw-muted">{l.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-bw-surface border border-bw-border rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-bw-heading mb-3">
            Envie de participer ?
          </h2>
          <p className="text-bw-text mb-8 max-w-md mx-auto">
            Rejoignez une partie, proposez un partenariat ou contactez-nous pour
            en savoir plus.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/join"
              className="h-11 px-6 inline-flex items-center text-sm font-semibold rounded-xl bg-bw-primary text-white hover:bg-bw-primary-500 transition-colors duration-200 shadow-bw-glow-primary"
            >
              Rejoindre une partie
            </Link>
            <Link
              href="/contact"
              className="h-11 px-6 inline-flex items-center text-sm font-medium rounded-xl text-bw-heading border border-bw-border hover:bg-bw-surface-dim transition-colors duration-200"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-bw-border px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-xs text-bw-muted">&copy; 2026 Banlieuwood</p>
          <div className="flex gap-4">
            <Link href="/legal/privacy" className="text-xs text-bw-muted hover:text-bw-heading transition-colors">Confidentialite</Link>
            <Link href="/legal/cgu" className="text-xs text-bw-muted hover:text-bw-heading transition-colors">CGU</Link>
            <Link href="/contact" className="text-xs text-bw-muted hover:text-bw-heading transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
