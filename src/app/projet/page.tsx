import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Le Projet — Banlieuwood",
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
    color: "#8b5cf6",
  },
  {
    num: "02",
    title: "Apprendre en experimentant",
    text: "Banlieuwood ne se presente pas comme un cours. Chaque module propose une situation concrete : interpreter une image, inventer une idee, transformer une idee en pitch, construire une histoire collective.",
    color: "#f472b6",
  },
  {
    num: "03",
    title: "Le collectif avant tout",
    text: "Les idees individuelles deviennent progressivement les elements d\u2019une creation commune. Les eleves apprennent a ecouter, a defendre une idee, a accepter des compromis et a construire ensemble.",
    color: "#22d3ee",
  },
  {
    num: "04",
    title: "Un outil qui accompagne sans remplacer",
    text: "L\u2019outil numerique structure les activites, collecte les idees et facilite les votes collectifs. Mais il ne remplace jamais l\u2019intervenant. Les discussions, les debats et les decisions restent humaines.",
    color: "#fbbf24",
  },
];

const MODULES = [
  { id: "M1", name: "Le Regard", icon: "\ud83d\udc41\ufe0f", desc: "Analyse d'images", color: "#8b5cf6" },
  { id: "M2", name: "Les Emotions", icon: "\ud83c\udfad", desc: "Identifier et nommer", color: "#f472b6" },
  { id: "M3", name: "Et si...", icon: "\ud83d\udca1", desc: "Brainstorm collectif", color: "#fbbf24" },
  { id: "M4", name: "Le Pitch", icon: "\ud83c\udf99\ufe0f", desc: "Presenter son idee", color: "#34d399" },
  { id: "M5", name: "Le Vote", icon: "\ud83c\udfc6", desc: "Choix democratique", color: "#22d3ee" },
  { id: "M6", name: "Le Scenario", icon: "\ud83d\udcdd", desc: "Ecriture collaborative", color: "#fb923c" },
  { id: "M7", name: "Storyboard", icon: "\ud83c\udf9e\ufe0f", desc: "Plans et cadrage", color: "#f87171" },
  { id: "M8", name: "L'Equipe", icon: "\u2b50", desc: "Roles et talents", color: "#fbbf24" },
];

export default function ProjetPage() {
  return (
    <div
      className="min-h-dvh bg-[#0a0a16] text-[#f0f0f8]"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}
    >
      {/* ══ Hero ══ */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#c4b5fd] mb-2">NOTRE MISSION</div>
          <h1 className="text-[clamp(36px,5.5vw,64px)] font-black leading-[1.05] tracking-tight mb-6">
            Democratiser la creation
            <br />
            <span className="bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] bg-clip-text text-transparent">
              cinematographique en classe
            </span>
          </h1>
          <p className="text-[clamp(15px,2vw,18px)] text-[#94a3b8] leading-relaxed max-w-[600px] mx-auto">
            Banlieuwood croit que chaque eleve est un createur. Pas de notes, pas de classement — juste la joie de creer
            ensemble, avec les outils du cinema professionnel.
          </p>
        </div>
      </section>

      {/* ══ Doctrine ══ */}
      <section className="py-20 bg-[#111127]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#fbbf24] mb-2">PEDAGOGIE</div>
              <h2 className="text-[22px] font-bold mb-4">La donnee au service de la creation, pas du jugement</h2>
              <p className="text-[14px] text-[#94a3b8] leading-relaxed mb-4">
                Chez Banlieuwood, les donnees des eleves sont pedagogiques, pas performatives. L&apos;intervenant pilote
                la seance — il ne juge pas les eleves.
              </p>
              <p className="text-[14px] text-[#94a3b8] leading-relaxed mb-4">
                Pas de scores individuels visibles. Pas de classement. Pas de profilage comportemental. Juste des taux
                de participation collectifs et des creations a celebrer.
              </p>
              <div className="flex gap-2 flex-wrap">
                {["Anonymisation des metriques", "Pas de XP visible", "Conforme RGPD"].map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#34d399]/15 text-[#34d399]"
                  >
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-[#141430] border border-[#252550] p-8 text-center">
              <div className="text-[64px] mb-4">🎭</div>
              <blockquote className="text-[16px] italic text-[#94a3b8] leading-relaxed">
                &ldquo;Si une fonctionnalite permet a un adulte d&apos;identifier un eleve et de l&apos;evaluer a partir
                de ses donnees, cette fonctionnalite ne doit pas exister.&rdquo;
              </blockquote>
              <div className="text-[12px] text-[#64748b] mt-3">— Doctrine Banlieuwood</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Convictions ══ */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b5cf6] mb-2">NOS CONVICTIONS</div>
            <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold">Ce que nous croyons</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CONVICTIONS.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-[#141430] border border-[#252550] p-7 hover:border-[#8b5cf6]/30 transition-all"
              >
                <h3 className="text-[16px] font-bold mb-2">{c.title}</h3>
                <p className="text-[13px] text-[#94a3b8] leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PEAC Alignment ══ */}
      <section className="py-20 bg-[#111127]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#34d399] mb-2">
              ALIGNEMENT EDUCATION NATIONALE
            </div>
            <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold">Ancre dans les programmes officiels</h2>
            <p className="text-[clamp(15px,2vw,18px)] text-[#94a3b8] max-w-[560px] mx-auto mt-3">
              Chaque module est concu en reference aux textes officiels de l&apos;Education Nationale.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: "🔍",
                title: "Rencontrer",
                color: "#8b5cf6",
                text: "Frequenter les oeuvres, developper une culture artistique personnelle. Modules M1 (Le Regard) et M2 (Les Emotions) — analyse filmique, lecture d'image, vocabulaire cinematographique.",
              },
              {
                icon: "🎨",
                title: "Pratiquer",
                color: "#f472b6",
                text: "S'engager dans un processus de creation. Modules M3 a M7 — brainstorm, pitch oral, ecriture scenariste, storyboard. Les eleves pratiquent tous les metiers du cinema.",
              },
              {
                icon: "💡",
                title: "S'approprier",
                color: "#fbbf24",
                text: "Construire un jugement esthetique. Module M5 (Le Vote) et M8 (L'Equipe) — argumenter ses choix, s'exprimer devant un groupe, assumer un role creatif.",
              },
            ].map((p) => (
              <div
                key={p.title}
                className="rounded-2xl bg-[#141430] border border-[#252550] p-7"
                style={{ borderLeftWidth: 4, borderLeftColor: p.color }}
              >
                <div className="text-[28px] mb-3">{p.icon}</div>
                <h4 className="text-[16px] font-bold mb-2" style={{ color: p.color }}>
                  {p.title}
                </h4>
                <p className="text-[13px] text-[#94a3b8] leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-8">
            {["Socle Commun D1.1", "Socle Commun D1.4", "Socle Commun D2", "Socle Commun D3", "Socle Commun D5"].map(
              (b) => (
                <span key={b} className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#8b5cf6]/15 text-[#c4b5fd]">
                  {b}
                </span>
              ),
            )}
            {["Arts Plastiques Cycle 3", "Arts Plastiques Cycle 4"].map((b) => (
              <span key={b} className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#f472b6]/15 text-[#f472b6]">
                {b}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#fbbf24]/15 text-[#fbbf24]">PEAC</span>
            {["Ecole et cinema", "College au cinema"].map((b) => (
              <span key={b} className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#34d399]/15 text-[#34d399]">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Pedagogie 4 points ══ */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#f472b6] mb-2">NOTRE METHODE</div>
            <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold">4 principes pedagogiques</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PEDAGOGIE_POINTS.map((p) => (
              <div
                key={p.num}
                className="rounded-2xl bg-[#141430] border border-[#252550] p-7 hover:border-[#8b5cf6]/30 transition-all"
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
                <p className="text-[13px] text-[#94a3b8] leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Modules clickables ══ */}
      <section className="py-16 bg-[#111127]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-8">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#22d3ee] mb-2">
              MODULES DETAILLES
            </div>
            <h2 className="text-[22px] font-bold">8 modules, un parcours complet</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MODULES.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-[#141430] border border-[#252550] p-4 text-center hover:border-[#8b5cf6]/30 hover:-translate-y-1 transition-all"
                style={{ borderTopWidth: 3, borderTopColor: m.color }}
              >
                <div className="text-[28px] mb-2">{m.icon}</div>
                <div className="text-[12px] font-bold">
                  {m.id} — {m.name}
                </div>
                <div className="text-[10px] text-[#64748b] mt-1">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Comparatif formules ══ */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-[22px] font-bold">Comparatif des Formules</h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[#252550]">
            <table className="w-full text-[13px]" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th className="p-3 text-left text-[11px] uppercase tracking-wider text-[#64748b] bg-[#181838] border-b border-[#252550]">
                    Module
                  </th>
                  <th className="p-3 text-center text-[11px] uppercase tracking-wider text-[#64748b] bg-[#181838] border-b border-[#252550]">
                    F0 (1h)
                  </th>
                  <th className="p-3 text-center text-[11px] uppercase tracking-wider text-[#64748b] bg-[#181838] border-b border-[#252550]">
                    F1 (3h)
                  </th>
                  <th className="p-3 text-center text-[11px] uppercase tracking-wider text-[#64748b] bg-[#181838] border-b border-[#252550]">
                    F2 (8h)
                  </th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((m, i) => (
                  <tr key={m.id} className="border-b border-[#252550] last:border-b-0 hover:bg-[#8b5cf6]/[0.03]">
                    <td className="p-3">
                      {m.id} — {m.name}
                    </td>
                    <td className="p-3 text-center">
                      {i === 0 ? <span className="text-[#34d399]">✓</span> : <span className="text-[#64748b]">—</span>}
                    </td>
                    <td className="p-3 text-center">
                      {i < 3 ? <span className="text-[#34d399]">✓</span> : <span className="text-[#64748b]">—</span>}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-[#34d399]">✓</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-20 bg-[#111127]">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold mb-4">Pret a tourner ?</h2>
          <p className="text-[clamp(15px,2vw,18px)] text-[#94a3b8] mb-8">
            Lancez votre premier atelier en quelques minutes.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href={ROUTES.requestAccess}
              className="px-9 py-4 rounded-[14px] text-base font-bold text-white bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.5)] transition-all"
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
        </div>
      </section>
    </div>
  );
}
