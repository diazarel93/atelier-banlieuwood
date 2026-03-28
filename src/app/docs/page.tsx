import type { Metadata } from "next";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Ressources — Banlieuwood",
  description: "Guides, fiches pedagogiques, alignement programmes et ressources techniques Banlieuwood.",
};

const RESOURCES = [
  {
    icon: "📖",
    title: "Guide complet du cockpit",
    desc: "Toutes les fonctionnalites du cockpit intervenant, etape par etape.",
    badge: "PDF — 24 pages",
    color: "#8b5cf6",
  },
  {
    icon: "🎬",
    title: "Protocole de tournage",
    desc: "Organisation, materiel, roles et planning pour les seances de tournage.",
    badge: "PDF — 12 pages",
    color: "#f472b6",
  },
  {
    icon: "📋",
    title: "Fiche pedagogique PEAC",
    desc: "Objectifs, competences visees et alignement aux 3 piliers du PEAC et au Socle Commun.",
    badge: "PDF — 8 pages",
    color: "#fbbf24",
  },
  {
    icon: "🏫",
    title: "Alignement programmes officiels",
    desc: "Correspondance complete avec les programmes d'Arts Plastiques (Cycles 3-4), Francais, et EMC.",
    badge: "PDF — 16 pages",
    color: "#22d3ee",
  },
  {
    icon: "❓",
    title: "FAQ intervenant",
    desc: "Reponses aux questions les plus frequentes sur l'utilisation du cockpit.",
    badge: "Web",
    color: "#8b5cf6",
  },
  {
    icon: "📝",
    title: "Formulaire consentement image",
    desc: "Formulaire droits d'image a distribuer aux parents avant le tournage.",
    badge: "PDF — 2 pages",
    color: "#fbbf24",
  },
];

const TABS = ["Intervenants", "Enseignants", "Parents", "Programmes officiels", "Technique"];

export default function DocsPage() {
  return (
    <div
      className="min-h-dvh bg-[#0a0a16] text-[#f0f0f8]"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}
    >
      <SiteNavbar />
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-[clamp(28px,4vw,48px)] font-extrabold mb-3">Ressources pedagogiques</h1>
            <p className="text-[clamp(15px,2vw,18px)] text-[#94a3b8]">
              Guides, fiches pedagogiques, alignement programmes et ressources techniques.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-[#252550] mb-6 overflow-x-auto">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                className={`px-5 py-2.5 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  i === 0 ? "text-[#c4b5fd] border-[#8b5cf6]" : "text-[#64748b] border-transparent hover:text-[#94a3b8]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Resource grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RESOURCES.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl bg-[#141430] border border-[#252550] p-6 cursor-pointer hover:border-[#8b5cf6]/30 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-[32px] mb-3">{r.icon}</div>
                <h4 className="text-[16px] font-bold mb-2">{r.title}</h4>
                <p className="text-[12px] text-[#94a3b8] leading-relaxed mb-3">{r.desc}</p>
                <span
                  className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: `${r.color}15`, color: r.color }}
                >
                  {r.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
