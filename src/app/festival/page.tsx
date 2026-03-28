"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";

// ═══════════════════════════════════════════════════════════════
// FESTIVAL V2 — Film gallery dark theme
// ═══════════════════════════════════════════════════════════════

const FILMS = [
  {
    title: "Enquete au college",
    class: "4e B — College Jean Moulin",
    formula: "F2",
    date: "Mars 2026",
    emoji: "🔍",
    gradient: "from-[#1a1040] to-[#2a1050]",
  },
  {
    title: "Le cinema du futur",
    class: "3e A — College Jean Moulin",
    formula: "F2",
    date: "Fev 2026",
    emoji: "🚀",
    gradient: "from-[#102030] to-[#103040]",
  },
  {
    title: "La danse des ombres",
    class: "5e D — Lycee Victor Hugo",
    formula: "F1",
    date: "Jan 2026",
    emoji: "💃",
    gradient: "from-[#201010] to-[#301520]",
  },
  {
    title: "Seuls dans la foret",
    class: "4e C — College Rosa Parks",
    formula: "F2",
    date: "Dec 2025",
    emoji: "🌲",
    gradient: "from-[#0a2010] to-[#103020]",
  },
  {
    title: "Masques",
    class: "6e A — College Pablo Neruda",
    formula: "F1",
    date: "Nov 2025",
    emoji: "🎭",
    gradient: "from-[#201520] to-[#302030]",
  },
  {
    title: "L'etoile du quartier",
    class: "3e B — College Cesaire",
    formula: "F2",
    date: "Oct 2025",
    emoji: "✨",
    gradient: "from-[#151025] to-[#201535]",
  },
];

const FORMULA_COLORS: Record<string, string> = { F0: "#f472b6", F1: "#f472b6", F2: "#8b5cf6" };

export default function FestivalPage() {
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
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#fbbf24] mb-2">
              FESTIVAL BANLIEUWOOD 2026
            </div>
            <h1 className="text-[clamp(36px,5.5vw,64px)] font-black leading-[1.05] tracking-tight mb-4">
              Les films{" "}
              <span className="bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] bg-clip-text text-transparent">
                de nos eleves
              </span>
            </h1>
            <p className="text-[clamp(15px,2vw,18px)] text-[#94a3b8] max-w-[500px] mx-auto mb-6">
              Decouvrez les courts-metrages crees collectivement par les classes participantes.
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {["Tous", "2026", "2025", "College", "Lycee"].map((f, i) => (
                <button
                  key={f}
                  className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                    i === 0
                      ? "bg-[#181838] border border-[#8b5cf6] text-[#f0f0f8]"
                      : "bg-transparent text-[#94a3b8] hover:text-[#f0f0f8] hover:bg-[#181838]"
                  }`}
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
                className="rounded-2xl overflow-hidden border border-[#252550] bg-[#141430] hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(139,92,246,0.15)] transition-all"
              >
                <div
                  className={`w-full h-[200px] bg-gradient-to-br ${film.gradient} flex items-center justify-center text-[48px] relative overflow-hidden`}
                >
                  {film.emoji}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a16]/70 via-transparent to-transparent" />
                </div>
                <div className="p-4">
                  <h4 className="text-[14px] font-bold mb-1">{film.title}</h4>
                  <div className="text-[11px] text-[#94a3b8] mb-2">{film.class}</div>
                  <div className="flex gap-1">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: `${FORMULA_COLORS[film.formula] || "#8b5cf6"}15`,
                        color: FORMULA_COLORS[film.formula] || "#8b5cf6",
                      }}
                    >
                      {film.formula}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fbbf24]/15 text-[#fbbf24]">
                      {film.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[600px] mx-auto mt-10 text-center">
            {[
              { value: "87", label: "Films", color: "#fbbf24" },
              { value: "32", label: "Etablissements", color: "#8b5cf6" },
              { value: "1 200+", label: "Eleves", color: "#34d399" },
              { value: "48h", label: "De creation", color: "#f472b6" },
            ].map((s) => (
              <div key={s.label} className="py-5">
                <div className="text-[36px] font-black" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-[11px] text-[#64748b]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
