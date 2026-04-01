import type { Metadata } from "next";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";

export const metadata: Metadata = {
  title: "Ressources — Banlieuwood",
  description: "Guides, fiches pédagogiques, alignement programmes et ressources techniques Banlieuwood.",
};

const RESOURCES = [
  {
    icon: "📖",
    title: "Guide complet du cockpit",
    desc: "Toutes les fonctionnalités du cockpit intervenant, étape par étape.",
    badge: "PDF — 24 pages",
    color: "#FF6B35",
    id: "guide-intervenant",
  },
  {
    icon: "🎬",
    title: "Protocole de tournage",
    desc: "Organisation, matériel, rôles et planning pour les séances de tournage.",
    badge: "PDF — 12 pages",
    color: "#D4A843",
    id: "protocole-tournage",
  },
  {
    icon: "📋",
    title: "Fiche pédagogique PEAC",
    desc: "Objectifs, compétences visées et alignement aux 3 piliers du PEAC et au Socle Commun.",
    badge: "PDF — 8 pages",
    color: "#4ECDC4",
    id: "fiche-peac",
  },
  {
    icon: "🏫",
    title: "Alignement programmes officiels",
    desc: "Correspondance complète avec les programmes d'Arts Plastiques (Cycles 3-4), Français, et EMC.",
    badge: "PDF — 16 pages",
    color: "#FF8C5A",
    id: "alignement-programmes",
  },
  {
    icon: "❓",
    title: "FAQ intervenant",
    desc: "Réponses aux questions les plus fréquentes sur l'utilisation du cockpit.",
    badge: "Web",
    color: "#E8B84B",
    id: "faq",
  },
  {
    icon: "📝",
    title: "Formulaire consentement image",
    desc: "Formulaire droits d'image à distribuer aux parents avant le tournage.",
    badge: "PDF — 2 pages",
    color: "#5DD6CF",
    id: "formulaire-consentement",
  },
];

const TABS = ["Intervenants", "Enseignants", "Parents", "Programmes officiels", "Technique"];

export default function DocsPage() {
  return (
    <div className="min-h-dvh bg-[#0d0b09] text-white">
      <ScrollProgressBar />
      <SiteNavbar />
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "#FF6B35" }}>
              RESSOURCES
            </div>
            <h1 className="font-cinema text-[clamp(36px,5vw,64px)] uppercase leading-[1.05] mb-4">
              Ressources pédagogiques
            </h1>
            <p className="text-[clamp(15px,2vw,18px)] text-white/55 max-w-[440px] mx-auto">
              Guides, fiches pédagogiques, alignement programmes et ressources techniques.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-[#2a2420] mb-8 overflow-x-auto">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                className={`px-5 py-2.5 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  i === 0 ? "border-b-2 border-[#FF6B35]" : "text-white/35 border-transparent hover:text-white/60"
                }`}
                style={i === 0 ? { color: "#FF6B35" } : undefined}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Resource grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RESOURCES.map((r) => (
              <a
                key={r.title}
                id={r.id}
                href={`/contact#contact-form`}
                className="rounded-2xl bg-[#141210] border border-[#2a2420] p-6 hover:border-[#FF6B35]/25 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all relative overflow-hidden group block"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, ${r.color}, ${r.color}80)` }}
                />
                <div className="text-[32px] mb-3">{r.icon}</div>
                <h4 className="text-[16px] font-bold mb-2">{r.title}</h4>
                <p className="text-[12px] text-white/45 leading-relaxed mb-3">{r.desc}</p>
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold"
                    style={{ background: `${r.color}15`, color: r.color }}
                  >
                    {r.badge}
                  </span>
                  <span className="text-[11px] text-white/25 group-hover:text-[#FF6B35]/60 transition-colors">
                    Demander →
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* CTA bas */}
          <div className="mt-12 text-center rounded-2xl border border-[#2a2420] bg-[#141210] px-8 py-10">
            <div className="font-cinema text-[13px] tracking-[0.2em] mb-3" style={{ color: "#FF6B35" }}>
              ACCÈS SUR DEMANDE
            </div>
            <p className="text-white/55 text-[14px] mb-6 max-w-[380px] mx-auto leading-relaxed">
              Les ressources PDF sont disponibles sur demande pour les établissements partenaires.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-[14px] font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: "#FF6B35", boxShadow: "0 4px 20px rgba(255,107,53,0.35)" }}
            >
              Contacter l&apos;équipe
            </a>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
