"use client";

import { useState } from "react";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";

// ═══════════════════════════════════════════════════════════════
// FESTIVAL V2 — Film gallery warm cinema
// ═══════════════════════════════════════════════════════════════

const FILMS = [
  {
    title: "Enquête au collège",
    class: "4e B — Collège Jean Moulin",
    formula: "F2",
    date: "Mars 2026",
    emoji: "🔍",
    gradient: "from-[#2a1810] to-[#3a1e10]",
  },
  {
    title: "Le cinéma du futur",
    class: "3e A — Collège Jean Moulin",
    formula: "F2",
    date: "Fév 2026",
    emoji: "🚀",
    gradient: "from-[#0f2020] to-[#102828]",
  },
  {
    title: "La danse des ombres",
    class: "5e D — Lycée Victor Hugo",
    formula: "F1",
    date: "Jan 2026",
    emoji: "💃",
    gradient: "from-[#201810] to-[#2e1e10]",
  },
  {
    title: "Seuls dans la forêt",
    class: "4e C — Collège Rosa Parks",
    formula: "F2",
    date: "Déc 2025",
    emoji: "🌲",
    gradient: "from-[#0a1e14] to-[#0e2818]",
  },
  {
    title: "Masques",
    class: "6e A — Collège Pablo Neruda",
    formula: "F1",
    date: "Nov 2025",
    emoji: "🎭",
    gradient: "from-[#1e1210] to-[#281810]",
  },
  {
    title: "L'étoile du quartier",
    class: "3e B — Collège Césaire",
    formula: "F2",
    date: "Oct 2025",
    emoji: "✨",
    gradient: "from-[#1a1008] to-[#220e08]",
  },
];

const FORMULA_COLORS: Record<string, string> = {
  F0: "#FF6B35",
  F1: "#D4A843",
  F2: "#4ECDC4",
};

const FILTERS = ["Tous", "2026", "2025", "Collège", "Lycée"];

export default function FestivalPage() {
  const [activeFilter, setActiveFilter] = useState("Tous");

  return (
    <div className="min-h-dvh bg-[#0d0b09] text-white">
      <ScrollProgressBar />
      <SiteNavbar />
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "#FF6B35" }}>
              FESTIVAL BANLIEUWOOD 2026
            </div>
            <h1 className="font-cinema text-[clamp(40px,6vw,72px)] leading-[1.05] uppercase mb-4">
              Les films{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(90deg, #FF6B35 0%, #D4A843 55%, #4ECDC4 100%)",
                }}
              >
                de nos élèves
              </span>
            </h1>
            <p className="text-[clamp(15px,2vw,18px)] text-white/55 max-w-[500px] mx-auto mb-8">
              Découvrez les courts-métrages créés collectivement par les classes participantes.
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                    activeFilter === f
                      ? "border text-white"
                      : "bg-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent"
                  }`}
                  style={
                    activeFilter === f
                      ? { background: "rgba(255,107,53,0.12)", borderColor: "rgba(255,107,53,0.4)", color: "#FF6B35" }
                      : undefined
                  }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Film grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FILMS.map((film) => (
              <div
                key={film.title}
                className="rounded-2xl overflow-hidden border border-[#2a2420] bg-[#141210] hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(255,107,53,0.12)] hover:border-[#FF6B35]/20 transition-all"
              >
                <div
                  className={`w-full h-[200px] bg-gradient-to-br ${film.gradient} flex items-center justify-center text-[48px] relative overflow-hidden`}
                >
                  {film.emoji}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b09]/70 via-transparent to-transparent" />
                </div>
                <div className="p-4">
                  <h4 className="text-[14px] font-bold mb-1">{film.title}</h4>
                  <div className="text-[11px] text-white/40 mb-2">{film.class}</div>
                  <div className="flex gap-1">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: `${FORMULA_COLORS[film.formula] || "#FF6B35"}15`,
                        color: FORMULA_COLORS[film.formula] || "#FF6B35",
                      }}
                    >
                      {film.formula}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D4A843]/15 text-[#D4A843]">
                      {film.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[640px] mx-auto mt-14 text-center border border-[#2a2420] rounded-2xl overflow-hidden bg-black/20">
            {[
              { value: "87", label: "Films", color: "#FF6B35" },
              { value: "32", label: "Établissements", color: "#D4A843" },
              { value: "1 247", label: "Élèves", color: "#4ECDC4" },
              { value: "48h", label: "De création", color: "#FF8C5A" },
            ].map((s, i) => (
              <div key={s.label} className={`py-6 ${i < 3 ? "border-r border-[#2a2420]" : ""}`}>
                <div className="font-cinema text-[clamp(32px,4vw,52px)] leading-none" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-3 text-[10px] text-white/20 tracking-wide">
            Données mars 2026 · Île-de-France
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
