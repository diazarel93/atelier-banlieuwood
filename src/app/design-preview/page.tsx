// ═══════════════════════════════════════════════════════════════════════════
// DESIGN COCKPIT — Banlieuwood · Cockpit Intervenant
// Onglets : Rapports (phases 0-3) | Directions (visuels) | Comparative
// http://localhost:3011/design-preview
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import { notFound } from "next/navigation";

// ─── Types ─────────────────────────────────────────────────────────────────

interface DirectionConfig {
  name: string;
  concept: string;
  origin: string;
  logique: string;
  references: string[];
  layoutAscii: string;
  hierarchie: { p1: string; p2: string; p3: string; p4: string };
  actionPrincipale: string;
  navigation: string;
  canvas: string;
  surface: string;
  elevated: string;
  text: string;
  muted: string;
  border: string;
  accent1: string;
  accent1Bg: string;
  accent1Border: string;
  accent2: string;
  accent2Bg: string;
  accent2Border: string;
  accent3: string;
  accent3Bg: string;
  accent3Border: string;
  typo: { titres: string; body: string; labels: string; kpi: string };
  motion: { entrees: string; transitions: string; micro: string };
  scores: {
    lisibilite: string;
    coherence: string;
    effort: string;
    modernite: string;
    emotion: string;
    unicite: string;
  };
}

// ─── 3 Directions (architectures DIFFERENTES) ─────────────────────────────

const DIRECTIONS: DirectionConfig[] = [
  // ═══ DIRECTION A — Salle de Montage ═══
  {
    name: "Salle de Montage",
    concept:
      "Le cockpit comme suite de montage cinema (DaVinci Resolve, Avid). " +
      "Timeline horizontale : le temps de la seance avance de gauche a droite. " +
      "L'intervenant VOIT le deroulement de sa seance comme un monteur voit son film.",
    origin:
      "La salle de montage est le lieu ou le film prend forme. Pas le plateau " +
      "(trop chaotique), pas la projection (trop passive). Le montage est l'endroit " +
      "ou un professionnel CONTROLE le rythme, coupe, assemble, decide du tempo. " +
      "Reference : la media composer room de Walter Murch (Apocalypse Now). " +
      "Un ecran large, une timeline, des outils a portee de main.",
    logique:
      "L'intervenant Banlieuwood pilote un RYTHME. Il lance un module, attend " +
      "les reponses, revele, passe au suivant. C'est un monteur de seance. " +
      "La timeline horizontale rend ce rythme VISIBLE et navigable. " +
      "Aucun EdTech ne presente l'interface prof comme une timeline — c'est " +
      "un differenciant fort et coherent avec l'identite cinema.",
    references: ["Walter Murch / salle montage Apocalypse Now", "DaVinci Resolve timeline UI", "Linear roadmap view"],
    layoutAscii: `
┌──────────────────────────────────────────────────────┐
│ HEADER  [Live] Session M2   24 eleves   ⏱ 42:18     │
├───────────┬──────────────────────────────────────────┤
│           │  ┌─────────────────────────────────┐     │
│  CLASSE   │  │    ZONE FOCUS (question active)  │     │
│  sidebar  │  │    + reponses en flux            │     │
│  240px    │  └─────────────────────────────────┘     │
│           │                                          │
│  pastilles├──────────────────────────────────────────┤
│  + stats  │  TIMELINE SEANCE (barre horizontale)     │
│  collectif│  [M1 ✓] [M2 ●] [M3 ○] [M4 ○] [M5 ○]   │
│           │   Q1 Q2 Q3▼ Q4  Q5  Q6  Q7  Q8          │
│           ├──────────────────────────────────────────┤
│           │  FOOTER ACTIONS  [← Prec] [Reveler] [→] │
└───────────┴──────────────────────────────────────────┘`,
    hierarchie: {
      p1: "Question active + barre de progression reponses (centre, 60% de l'ecran)",
      p2: "Timeline horizontale des modules/questions (bas, toujours visible)",
      p3: "Sidebar classe : pastilles statut + compteur collectif (gauche, 1 tap pour detail)",
      p4: "Notes de session, notifications, command palette (menu +, 2+ taps)",
    },
    actionPrincipale: "Bouton 'Suivant' fixe en bas-droite de la timeline — toujours visible, 0 tap",
    navigation:
      "Timeline horizontale scrollable. Tap sur un module = jump. " +
      "Le flux temporel est le fil conducteur : on avance, on recule, on saute.",
    canvas: "#1c1917",
    surface: "#292524",
    elevated: "#3d3530",
    text: "#f5f5f4",
    muted: "#a8a29e",
    border: "rgba(245, 245, 244, 0.08)",
    accent1: "#FF6B35",
    accent1Bg: "rgba(255,107,53,0.10)",
    accent1Border: "rgba(255,107,53,0.25)",
    accent2: "#D4A843",
    accent2Bg: "rgba(212,168,67,0.08)",
    accent2Border: "rgba(212,168,67,0.25)",
    accent3: "#4ECDC4",
    accent3Bg: "rgba(78,205,196,0.10)",
    accent3Border: "rgba(78,205,196,0.25)",
    typo: {
      titres: "Bebas Neue, 28-48px, weight 400, letter-spacing 0.04em",
      body: "Plus Jakarta Sans, 14-16px, weight 500, line-height 1.5",
      labels: "Plus Jakarta Sans, 11px, weight 700, uppercase, tracking 0.2em",
      kpi: "Plus Jakarta Sans, 32px, weight 900, tabular-nums",
    },
    motion: {
      entrees: "fade-up 200ms ease-out, stagger 40ms par element",
      transitions: "slide-x 300ms ease-out (timeline avance lateralement)",
      micro: "scale 0.97 → 1.0 sur tap, 120ms ease-out",
    },
    scores: {
      lisibilite: "9/10",
      coherence: "10/10",
      effort: "S",
      modernite: "8/10",
      emotion: "9/10",
      unicite: "7/10",
    },
  },

  // ═══ DIRECTION B — Regie Broadcast ═══
  {
    name: "Regie Broadcast",
    concept:
      "Le cockpit comme regie TV en direct. Haute densite, zero decoration. " +
      "Chaque zone a UNE responsabilite. L'intervenant voit TOUT en meme temps " +
      "sans rien cacher derriere un menu — comme un realisateur TV qui a " +
      "12 ecrans devant lui et doit reagir en temps reel.",
    origin:
      "Les regies de television live (TF1, France TV, BBC). L'operateur a un " +
      "mur d'ecrans : camera 1, camera 2, programme, preview, teleprompter, " +
      "countdown, talkback. Chaque ecran = une fonction. Zero ambiguite. " +
      "Reference : la regie du Journal de 20h — pression temps reel, " +
      "information maximale, decision instantanee.",
    logique:
      "L'intervenant en seance LIVE doit voir simultanement : la question, " +
      "les reponses qui arrivent, l'etat de la classe, le timer. Les EdTech " +
      "classiques cachent 50% de l'info derriere des tabs. La regie broadcast " +
      "dit : tout est visible, organise en zones claires. Dense mais pas " +
      "chaotique — comme Linear le fait pour le project management.",
    references: ["Regie JT 20h France 2 (multi-ecrans)", "NASA Mission Control Houston", "Linear app dark mode"],
    layoutAscii: `
┌──────────────────────────────────────────────────────┐
│ HEADER  [Live●] M2 Budget   24/28   ⏱ 42:18  [⌘K]  │
├───────────┬───────────────────────┬──────────────────┤
│           │                       │                  │
│  CLASSE   │   QUESTION ACTIVE     │   FLUX REPONSES  │
│  sidebar  │                       │                  │
│  220px    │   titre + type        │   stream temps   │
│           │   + progression       │   reel des       │
│  pastilles│                       │   reponses       │
│  statut   │   ┌───────────────┐   │   (dernieres 10) │
│  collectif│   │  KPI ROW      │   │                  │
│           │   │  18  6  75%   │   │   filtres rapides│
│           │   └───────────────┘   │   [Tous][Recents]│
│           │                       │                  │
├───────────┼───────────────────────┼──────────────────┤
│  MODULE   │ ACTIONS CONTEXTUELLES │   ASSISTANT      │
│  RAIL     │ [Reveler] [Projeter]  │   timeline +     │
│  vertical │ [Suivant ▸]           │   notes           │
└───────────┴───────────────────────┴──────────────────┘`,
    hierarchie: {
      p1: "Question active (centre-gauche) + flux reponses en temps reel (droite) — vus simultanement",
      p2: "KPIs (repondu / en attente / taux) — sous la question, toujours visibles",
      p3: "Sidebar classe (gauche) + rail modules (bas-gauche) — navigation laterale",
      p4: "Assistant sidebar : timeline, notes, notifications (bas-droite, panneau depliable)",
    },
    actionPrincipale: "Boutons d'action contextuels fixes entre question et reponses — toujours visibles, 0 tap",
    navigation:
      "3 zones fixes. Navigation par zones : gauche = classe, centre = action, " +
      "droite = feedback. Zero scrolling dans le viewport principal. " +
      "Rail modules en vertical a gauche sous la sidebar classe.",
    canvas: "#1c1917",
    surface: "#292524",
    elevated: "#3d3530",
    text: "#f5f5f4",
    muted: "#a8a29e",
    border: "rgba(245, 245, 244, 0.08)",
    accent1: "#FF6B35",
    accent1Bg: "rgba(255,107,53,0.10)",
    accent1Border: "rgba(255,107,53,0.25)",
    accent2: "#4ECDC4",
    accent2Bg: "rgba(78,205,196,0.08)",
    accent2Border: "rgba(78,205,196,0.25)",
    accent3: "#D4A843",
    accent3Bg: "rgba(212,168,67,0.08)",
    accent3Border: "rgba(212,168,67,0.25)",
    typo: {
      titres: "Bebas Neue, 24-36px, weight 400, letter-spacing 0.03em",
      body: "Plus Jakarta Sans, 13-14px, weight 500, line-height 1.4",
      labels: "Plus Jakarta Sans, 10px, weight 700, uppercase, tracking 0.15em",
      kpi: "Plus Jakarta Sans, 28px, weight 900, tabular-nums, monospace feel",
    },
    motion: {
      entrees: "fade 150ms ease-out, minimal — la vitesse prime",
      transitions: "crossfade 200ms ease-out (changement de question)",
      micro: "border-color flash 300ms sur nouvelle reponse, pas de scale",
    },
    scores: {
      lisibilite: "10/10",
      coherence: "9/10",
      effort: "M",
      modernite: "10/10",
      emotion: "7/10",
      unicite: "8/10",
    },
  },

  // ═══ DIRECTION C — Cabine de Projection ═══
  {
    name: "Cabine de Projection",
    concept:
      "Le cockpit comme cabine de projection privee. Un SEUL element occupe " +
      "toute l'attention au centre — la question active, comme l'ecran de " +
      "cinema. Tout le reste est peripherique, accessible mais discret. " +
      "L'intervenant est le projectionniste : il lance, il observe, il controle.",
    origin:
      "La cabine de projection du Cinema Paradiso. Un lieu intime, chaud, " +
      "ou le projectionniste est seul maitre de ce qui se passe sur l'ecran. " +
      "Un halo de lumiere doree eclaire le film. Le reste de la cabine est dans " +
      "la penombre — present mais pas distrayant. Reference aussi : Roger " +
      "Deakins (Blade Runner 2049) — un point de lumiere dans l'obscurite.",
    logique:
      "Banlieuwood n'est pas un outil de monitoring (regie). C'est un outil " +
      "de CONDUITE de seance. L'intervenant fait UNE chose a la fois : il pose " +
      "la question, il attend, il revele, il passe au suivant. Le focus central " +
      "impose ce rythme cinematographique : une scene apres l'autre, pas tout " +
      "en meme temps. C'est la direction la plus emotionnelle et la plus " +
      "fidele a l'identite cinema de Banlieuwood.",
    references: [
      "Cinema Paradiso / cabine de projection",
      "Roger Deakins / Blade Runner 2049",
      "Apple Keynote presenter view",
    ],
    layoutAscii: `
┌──────────────────────────────────────────────────────┐
│ HEADER MINIMAL  [●] M2    24 eleves    42:18         │
├──────────────────────────────────────────────────────┤
│                                                      │
│          ┌────────────────────────────┐               │
│          │                            │               │
│          │    FOCUS CENTRAL           │               │
│          │    Question active         │               │
│          │    plein ecran             │               │
│          │    + barre progression     │               │
│          │                            │               │
│          │    [18/24 ont repondu]     │               │
│          │                            │               │
│          └────────────────────────────┘               │
│                                                      │
│   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐            │
│   │ KPI  │  │ KPI  │  │ KPI  │  │ KPI  │            │
│   │Repond│  │Attent│  │ Taux │  │Timer │            │
│   └──────┘  └──────┘  └──────┘  └──────┘            │
│                                                      │
│  [← Prec]          [REVELER]           [Suivant →]   │
├────────────────────┬─────────────────────────────────┤
│ DRAWER GAUCHE ←    │    → DRAWER DROITE              │
│ Classe (swipe)     │    Reponses (swipe)             │
└────────────────────┴─────────────────────────────────┘`,
    hierarchie: {
      p1: "Question active — centre absolu, 70% de l'ecran, focus total",
      p2: "Barre de progression + KPIs (sous la question, visibles sans action)",
      p3: "Actions : Reveler / Suivant (bas, toujours visibles mais secondaires)",
      p4: "Drawers lateraux : classe (swipe gauche) et reponses (swipe droite) — 1 geste",
    },
    actionPrincipale: "Bouton 'Reveler' centre en bas — le geste du projectionniste qui lance le film",
    navigation:
      "Focus stack : l'ecran montre UN element. Les drawers lateraux " +
      "glissent par swipe (gauche = classe, droite = reponses). " +
      "Pas de sidebar permanente — tout l'espace est au contenu. " +
      "Gestes tactiles iPad natifs : swipe, tap, hold.",
    canvas: "#1a1714",
    surface: "#252119",
    elevated: "#3d3529",
    text: "#f5f0e8",
    muted: "#a89e8e",
    border: "rgba(245,240,232,0.08)",
    accent1: "#FF6B35",
    accent1Bg: "rgba(255,107,53,0.10)",
    accent1Border: "rgba(255,107,53,0.25)",
    accent2: "#D4A843",
    accent2Bg: "rgba(212,168,67,0.08)",
    accent2Border: "rgba(212,168,67,0.25)",
    accent3: "#4ECDC4",
    accent3Bg: "rgba(78,205,196,0.10)",
    accent3Border: "rgba(78,205,196,0.25)",
    typo: {
      titres: "Bebas Neue, 32-56px, weight 400, letter-spacing 0.05em",
      body: "Plus Jakarta Sans, 16-18px, weight 500, line-height 1.6",
      labels: "Plus Jakarta Sans, 11px, weight 600, uppercase, tracking 0.2em",
      kpi: "Plus Jakarta Sans, 36px, weight 900, tabular-nums",
    },
    motion: {
      entrees: "fade-up 400ms ease-out avec blur depart 4px (effet projecteur)",
      transitions: "crossfade 500ms ease-in-out (changement de scene cinematique)",
      micro: "glow pulse subtil sur le bouton Reveler (respiration 2s), hover scale 1.02",
    },
    scores: {
      lisibilite: "8/10",
      coherence: "10/10",
      effort: "M",
      modernite: "7/10",
      emotion: "10/10",
      unicite: "9/10",
    },
  },
];

// ─── Micro-helpers ─────────────────────────────────────────────────────────

function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.2em] mb-4 font-semibold" style={{ color }}>
      {children}
    </p>
  );
}

function Divider({ color }: { color: string }) {
  return <div className="h-px w-full my-10" style={{ background: color }} />;
}

// ─── MODULE PICKER PANEL (partagé entre toutes les directions) ───────────

function ModulePickerPanel({ d }: { d: DirectionConfig }) {
  const modules = [
    { num: "M1", title: "Vocabulaire cinema", questions: 3, status: "done" },
    { num: "M2", title: "Budget & Financement", questions: 8, status: "active" },
    { num: "M3", title: "Tournage & Plateau", questions: 5, status: "next" },
    { num: "M4", title: "Montage & Post-prod", questions: 6, status: "pending" },
    { num: "M5", title: "Distribution", questions: 4, status: "pending" },
  ];
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: d.border, background: d.canvas }}>
      <div
        className="flex items-center gap-2 px-3 py-2.5 border-b"
        style={{ borderColor: d.border, background: d.surface }}
      >
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: d.accent2 }}>
          Navigation modules
        </span>
        <div className="flex-1" />
        <span className="text-[9px]" style={{ color: d.muted }}>
          5 modules · M2 actif
        </span>
      </div>
      <div className="p-3 space-y-1.5">
        {modules.map((m) => {
          const isDone = m.status === "done";
          const isActive = m.status === "active";
          const isNext = m.status === "next";
          return (
            <button
              key={m.num}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left"
              style={{
                borderColor: isActive ? d.accent1Border : isDone ? d.accent3Border : "transparent",
                background: isActive ? d.accent1Bg : isDone ? `${d.accent3}08` : `${d.surface}60`,
              }}
            >
              {/* Indicateur statut */}
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: isActive ? d.accent1 : isDone ? d.accent3 : isNext ? d.accent2 : `${d.muted}30`,
                }}
              />
              {/* Numero */}
              <span
                className="text-[10px] font-black w-6 shrink-0"
                style={{ color: isActive ? d.accent1 : isDone ? d.accent3 : d.muted }}
              >
                {m.num}
              </span>
              {/* Titre */}
              <span
                className="text-[12px] font-medium flex-1"
                style={{ color: isActive ? d.text : isDone ? d.muted : isNext ? `${d.text}80` : `${d.muted}50` }}
              >
                {m.title}
              </span>
              {/* Question count */}
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  color: isActive ? d.accent1 : isDone ? d.accent3 : `${d.muted}50`,
                  background: isActive ? d.accent1Bg : "transparent",
                }}
              >
                {m.questions}Q
              </span>
              {/* Badge statut */}
              <span
                className="text-[9px] font-semibold"
                style={{ color: isActive ? d.accent1 : isDone ? d.accent3 : isNext ? d.accent2 : `${d.muted}30` }}
              >
                {isActive ? "● En cours" : isDone ? "✓ Fait" : isNext ? "Suivant" : "—"}
              </span>
            </button>
          );
        })}
      </div>
      <div className="px-3 pb-3">
        <p className="text-[9px] text-center" style={{ color: `${d.muted}40` }}>
          Tap sur un module pour naviguer · Modules futurs accessibles en lecture seule
        </p>
      </div>
    </div>
  );
}

// ─── MINI COCKPIT A : Timeline horizontale (Salle de Montage) ─────────────

function MiniCockpitA({ d }: { d: DirectionConfig }) {
  return (
    <div className="space-y-3">
      {/* ── ÉTAT 1 : Vue principale ── */}
      <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: `${d.muted}80` }}>
        État 1 — Vue principale (question active + réponses en flux)
      </p>
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: d.border, background: d.canvas }}>
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: d.border, background: d.surface }}
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: d.accent1, boxShadow: `0 0 8px ${d.accent1}` }}
          />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: d.accent1 }}>
            Live
          </span>
          <span className="text-[11px]" style={{ color: d.border }}>
            |
          </span>
          <span className="text-[13px] font-medium" style={{ color: d.text }}>
            M2 — Budget & Financement
          </span>
          <div className="flex-1" />
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
            style={{ color: d.accent3, background: d.accent3Bg, borderColor: d.accent3Border }}
          >
            24 eleves
          </span>
          <span className="text-[13px] font-mono tabular-nums" style={{ color: d.muted }}>
            42:18
          </span>
        </div>
        <div className="flex">
          <div
            className="w-[100px] border-r p-3 space-y-2"
            style={{ borderColor: d.border, background: `${d.surface}80` }}
          >
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: d.muted }}>
              Classe
            </p>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: i < 18 ? d.accent3 : i < 22 ? d.accent2 : `${d.muted}40` }}
                />
              ))}
            </div>
            <p className="text-[10px] tabular-nums" style={{ color: d.accent3 }}>
              18/24
            </p>
          </div>
          <div className="flex-1 p-4 space-y-2">
            <div className="rounded-xl border p-4" style={{ borderColor: d.accent1Border, background: d.surface }}>
              <div className="h-0.5 rounded-full mb-3" style={{ background: d.accent1 }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: d.accent1 }}>
                Question 3/8
              </span>
              <p className="text-[15px] font-bold leading-snug mt-2 mb-3" style={{ color: d.text }}>
                Quel est le role principal du cadreur dans une mise en scene ?
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: d.elevated }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: "75%", background: `linear-gradient(90deg, ${d.accent1}, ${d.accent2})` }}
                  />
                </div>
                <span className="text-[11px] font-mono" style={{ color: d.muted }}>
                  75%
                </span>
              </div>
            </div>
            <div
              className="rounded-xl border p-3 space-y-1.5"
              style={{ borderColor: d.border, background: `${d.surface}60` }}
            >
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: d.muted }}>
                Reponses en flux
              </p>
              {[
                { text: "Le cadrage definit le regard du spectateur...", new: true },
                { text: "C'est lui qui compose l'image avec le realisateur", new: false },
                { text: "Il gere la mise au point et les mouvements camera", new: false },
              ].map((r, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 px-2 py-1.5 rounded-lg"
                  style={{
                    background: r.new ? d.accent1Bg : "transparent",
                    border: `1px solid ${r.new ? d.accent1Border : "transparent"}`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                    style={{ background: r.new ? d.accent1 : `${d.muted}50` }}
                  />
                  <p className="text-[11px] leading-snug" style={{ color: r.new ? d.text : d.muted }}>
                    {r.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t px-4 py-3" style={{ borderColor: d.border, background: d.surface }}>
          <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: d.muted }}>
            Timeline seance
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { label: "M1", done: true },
              { label: "Q1", done: true },
              { label: "Q2", done: true },
              { label: "Q3", active: true },
              { label: "Q4", done: false },
              { label: "Q5", done: false },
              { label: "M3", done: false },
              { label: "Q6", done: false },
              { label: "Q7", done: false },
              { label: "M4", done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <button
                  className="px-2 py-1 rounded text-[10px] font-semibold border whitespace-nowrap"
                  style={
                    item.active
                      ? { background: d.accent1Bg, color: d.accent1, borderColor: d.accent1Border }
                      : item.done
                        ? { background: "transparent", color: d.accent3, borderColor: d.accent3Border, opacity: 0.7 }
                        : { background: "transparent", color: d.muted, borderColor: "transparent", opacity: 0.4 }
                  }
                >
                  {item.done && !item.active ? "✓ " : ""}
                  {item.label}
                </button>
                {i < 9 && (
                  <span className="text-[8px]" style={{ color: `${d.muted}30` }}>
                    &mdash;
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div
          className="flex items-center justify-between px-4 py-2.5 border-t"
          style={{ borderColor: d.border, background: d.elevated }}
        >
          <button className="px-3 py-1.5 rounded-lg text-[11px] font-semibold" style={{ color: d.muted }}>
            &larr; Prec
          </button>
          <button
            className="px-4 py-1.5 rounded-lg text-[11px] font-bold border"
            style={{ color: d.accent2, background: d.accent2Bg, borderColor: d.accent2Border }}
          >
            Reveler
          </button>
          <button
            className="px-4 py-1.5 rounded-lg text-[11px] font-bold"
            style={{ color: d.canvas, background: d.accent1 }}
          >
            Suivant &rarr;
          </button>
        </div>
      </div>

      {/* ── ÉTATS SECONDAIRES ── */}
      <p className="text-[10px] uppercase tracking-wider font-semibold pt-2" style={{ color: `${d.muted}80` }}>
        États interactifs
      </p>
      <div className="grid grid-cols-2 gap-3">
        {/* État 2 : Résultats révélés (après clic "Reveler") */}
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: d.border, background: d.canvas }}>
          <div
            className="flex items-center gap-2 px-3 py-2.5 border-b"
            style={{ borderColor: d.border, background: d.surface }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: d.accent2 }}>
              Résultats révélés
            </span>
            <div className="flex-1" />
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: d.accent2, background: d.accent2Bg }}>
              18 réponses
            </span>
          </div>
          <div className="p-3">
            <p className="text-[11px] font-bold mb-3" style={{ color: d.text }}>
              Quel est le role principal du cadreur ?
            </p>
            {[
              { label: "Le cadrage definit le regard...", count: 8, pct: 44, c: d.accent1 },
              { label: "Il compose avec le realisateur", count: 6, pct: 33, c: d.accent2 },
              { label: "Gestion focus et mouvements", count: 3, pct: 17, c: d.accent3 },
              { label: "Autre / sans reponse", count: 1, pct: 6, c: d.muted },
            ].map((r) => (
              <div key={r.label} className="mb-2">
                <div className="flex justify-between mb-0.5">
                  <span className="text-[10px]" style={{ color: d.muted }}>
                    {r.label}
                  </span>
                  <span className="text-[10px] font-bold tabular-nums" style={{ color: r.c }}>
                    {r.count}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: d.elevated }}>
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.c }} />
                </div>
              </div>
            ))}
            <p className="text-[9px] mt-2 text-center" style={{ color: `${d.muted}50` }}>
              Pas de nom affiché — données agrégées
            </p>
          </div>
        </div>

        {/* État 3 : Timeline — retour sur question passée (tap Q2) */}
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: d.border, background: d.canvas }}>
          <div
            className="flex items-center gap-2 px-3 py-2.5 border-b"
            style={{ borderColor: d.border, background: d.surface }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: d.accent3 }}>
              Timeline — Q2 sélectionnée
            </span>
          </div>
          {/* Timeline avec Q2 highlighted */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-3">
              {[
                { label: "Q1", past: true },
                { label: "Q2", selected: true },
                { label: "Q3", current: true },
                { label: "Q4" },
                { label: "Q5" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1">
                  <button
                    className="px-2 py-0.5 rounded text-[9px] font-semibold border"
                    style={
                      item.selected
                        ? { background: d.accent3Bg, color: d.accent3, borderColor: d.accent3Border }
                        : item.current
                          ? { background: d.accent1Bg, color: d.accent1, borderColor: d.accent1Border }
                          : item.past
                            ? { color: `${d.muted}60`, borderColor: "transparent" }
                            : { color: `${d.muted}30`, borderColor: "transparent" }
                    }
                  >
                    {item.label}
                  </button>
                  {i < 4 && (
                    <span className="text-[7px]" style={{ color: `${d.muted}20` }}>
                      —
                    </span>
                  )}
                </div>
              ))}
            </div>
            {/* Question passée avec résultats déjà révélés — */}
            <div
              className="rounded-xl border p-3"
              style={{ borderColor: d.accent3Border, background: `${d.surface}80` }}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: d.accent3 }}>
                Q2 — Passé · Résultats
              </span>
              <p className="text-[12px] font-bold mb-2" style={{ color: d.text }}>
                Qu&apos;est-ce qu&apos;un champ-contrechamp ?
              </p>
              {[
                { label: "Alternance deux points de vue", pct: 72, c: d.accent3 },
                { label: "Un mouvement de camera", pct: 17, c: d.accent2 },
                { label: "Autre", pct: 11, c: d.muted },
              ].map((r) => (
                <div key={r.label} className="mb-1.5">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[9px]" style={{ color: d.muted }}>
                      {r.label}
                    </span>
                    <span className="text-[9px] font-bold" style={{ color: r.c }}>
                      {r.pct}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: d.elevated }}>
                    <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.c }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="text-[10px] uppercase tracking-wider font-semibold pt-2" style={{ color: `${d.muted}80` }}>
        Navigation modules (tap sur un module pour sauter)
      </p>
      <ModulePickerPanel d={d} />
    </div>
  );
}

// ─── MINI COCKPIT B : 3 zones simultanees (Regie Broadcast) ──────────────

function MiniCockpitB({ d }: { d: DirectionConfig }) {
  return (
    <div className="space-y-3">
      {/* ── ÉTAT 1 : Vue principale 3 colonnes ── */}
      <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: `${d.muted}80` }}>
        État 1 — Vue principale (3 zones simultanées)
      </p>
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: d.border, background: d.canvas }}>
        <div
          className="flex items-center gap-2 px-3 py-2 border-b"
          style={{ borderColor: d.border, background: d.surface }}
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: d.accent1, boxShadow: `0 0 6px ${d.accent1}` }}
          />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: d.accent1 }}>
            Live
          </span>
          <span className="text-[12px] font-medium" style={{ color: d.text }}>
            M2 Budget
          </span>
          <div className="flex-1" />
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded border"
            style={{ color: d.accent2, background: d.accent2Bg, borderColor: d.accent2Border }}
          >
            24/28
          </span>
          <span className="text-[12px] font-mono tabular-nums" style={{ color: d.muted }}>
            42:18
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: d.muted, background: d.elevated }}>
            ⌘K
          </span>
        </div>
        <div className="flex" style={{ minHeight: 180 }}>
          <div
            className="w-[90px] border-r p-2 flex flex-col gap-2"
            style={{ borderColor: d.border, background: `${d.surface}60` }}
          >
            <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: d.muted }}>
              Classe
            </p>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: i < 18 ? d.accent2 : i < 22 ? d.accent3 : `${d.muted}30` }}
                />
              ))}
            </div>
            <div className="h-px my-1" style={{ background: d.border }} />
            <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: d.muted }}>
              Modules
            </p>
            {["M1 ✓", "M2 ●", "M3", "M4"].map((m, i) => (
              <span
                key={m}
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                style={
                  i === 1
                    ? { color: d.accent1, background: d.accent1Bg }
                    : { color: `${d.muted}${i === 0 ? "80" : "50"}` }
                }
              >
                {m}
              </span>
            ))}
          </div>
          <div className="flex-1 p-3 flex flex-col gap-2 border-r" style={{ borderColor: d.border }}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: d.accent1 }}>
                Q3/8
              </span>
              <span className="text-[10px] ml-2" style={{ color: d.muted }}>
                Choix multiple
              </span>
            </div>
            <p className="text-[13px] font-bold leading-snug" style={{ color: d.text }}>
              Quel est le role principal du cadreur ?
            </p>
            <div className="grid grid-cols-3 gap-1.5 mt-1">
              {[
                { v: "18", l: "Repondu", c: d.accent1 },
                { v: "6", l: "Attente", c: d.accent3 },
                { v: "75%", l: "Taux", c: d.accent2 },
              ].map((k) => (
                <div
                  key={k.l}
                  className="text-center py-1.5 rounded-lg border"
                  style={{ background: `${k.c}08`, borderColor: `${k.c}20` }}
                >
                  <span className="text-lg font-black block" style={{ color: k.c }}>
                    {k.v}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider" style={{ color: d.muted }}>
                    {k.l}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mt-auto">
              <button
                className="flex-1 py-1.5 rounded-lg text-[10px] font-bold border"
                style={{ color: d.accent2, borderColor: d.accent2Border }}
              >
                Reveler
              </button>
              <button
                className="flex-1 py-1.5 rounded-lg text-[10px] font-bold border"
                style={{ color: d.muted, borderColor: d.border }}
              >
                Projeter
              </button>
              <button
                className="flex-1 py-1.5 rounded-lg text-[10px] font-bold"
                style={{ color: d.canvas, background: d.accent1 }}
              >
                Suivant
              </button>
            </div>
          </div>
          <div className="w-[130px] p-2 flex flex-col gap-1.5" style={{ background: `${d.surface}40` }}>
            <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: d.muted }}>
              Reponses live
            </p>
            {[
              { text: "Le cadrage definit le regard...", time: "8s" },
              { text: "C'est lui qui choisit l'angle...", time: "23s" },
              { text: "Il travaille avec le real...", time: "41s" },
              { text: "Le cadreur compose l'image...", time: "1m" },
            ].map((r, i) => (
              <div
                key={i}
                className="px-2 py-1.5 rounded-lg border"
                style={{ borderColor: d.border, background: i === 0 ? d.accent1Bg : "transparent" }}
              >
                <p className="text-[10px] leading-tight" style={{ color: i === 0 ? d.text : d.muted }}>
                  {r.text}
                </p>
                <span className="text-[8px]" style={{ color: `${d.muted}60` }}>
                  il y a {r.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ÉTATS SECONDAIRES ── */}
      <p className="text-[10px] uppercase tracking-wider font-semibold pt-2" style={{ color: `${d.muted}80` }}>
        États interactifs
      </p>
      <div className="grid grid-cols-2 gap-3">
        {/* État 2 : Panel Assistant ouvert (col 3 étendue — notes + timeline) */}
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: d.border, background: d.canvas }}>
          <div
            className="flex items-center gap-2 px-3 py-2.5 border-b"
            style={{ borderColor: d.border, background: d.surface }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: d.accent3 }}>
              Panel Assistant
            </span>
            <div className="flex-1" />
            <span className="text-[9px]" style={{ color: d.muted }}>
              Col. droite étendue
            </span>
          </div>
          <div className="p-3 space-y-3">
            {/* Notes de session */}
            <div>
              <p className="text-[9px] uppercase tracking-wider font-bold mb-1.5" style={{ color: d.muted }}>
                Notes de séance
              </p>
              <div className="rounded-lg border px-2.5 py-2" style={{ borderColor: d.border, background: d.surface }}>
                <p className="text-[11px]" style={{ color: d.muted }}>
                  Groupe très actif sur les questions de cadrage. Revoir la notion de profondeur de champ au prochain
                  cours...
                </p>
                <span className="text-[9px] mt-1 block" style={{ color: `${d.muted}50` }}>
                  Dernière modif : 09:12
                </span>
              </div>
            </div>
            {/* Mini timeline de séance */}
            <div>
              <p className="text-[9px] uppercase tracking-wider font-bold mb-1.5" style={{ color: d.muted }}>
                Progression séance
              </p>
              <div className="space-y-1">
                {[
                  { label: "Module 1 — Intro", done: true, time: "08h35" },
                  { label: "Q1 Vocabulaire", done: true, time: "08h42" },
                  { label: "Q2 Champ-contrechamp", done: true, time: "08h51" },
                  { label: "Q3 Rôle cadreur ←", active: true, time: "09h04" },
                  { label: "Q4 Plan séquence", done: false, time: "—" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 px-2 py-1 rounded"
                    style={{ background: item.active ? d.accent1Bg : "transparent" }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: item.active ? d.accent1 : item.done ? d.accent3 : `${d.muted}30` }}
                    />
                    <span
                      className="text-[10px] flex-1"
                      style={{ color: item.active ? d.text : item.done ? d.muted : `${d.muted}40` }}
                    >
                      {item.label}
                    </span>
                    <span className="text-[9px] font-mono" style={{ color: `${d.muted}50` }}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* État 3 : Vue Projection (ce que les élèves voient sur le mur) */}
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: d.border, background: d.canvas }}>
          <div
            className="flex items-center gap-2 px-3 py-2.5 border-b"
            style={{ borderColor: d.border, background: d.surface }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: d.accent2 }}>
              Vue Projection
            </span>
            <div className="flex-1" />
            <span className="text-[9px]" style={{ color: d.muted }}>
              Écran projeté → élèves
            </span>
          </div>
          {/* Simulation de l'écran projeté : minimaliste, lisible à 5m — textes 24px min (Phase 0) */}
          <div
            className="flex flex-col items-center justify-center px-6 py-8"
            style={{ background: "#0a0a0a", minHeight: 200 }}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] mb-3 block" style={{ color: d.accent1 }}>
              Question 3 / 8
            </span>
            <p
              className="text-[24px] font-black leading-snug text-center mb-6"
              style={{ color: "#ffffff", letterSpacing: "-0.01em" }}
            >
              Quel est le role
              <br />
              principal du cadreur ?
            </p>
            {/* Options de réponse — 18px min pour lecture à 3-8m */}
            <div className="w-full space-y-2">
              {[
                "A. Le cadrage et le regard",
                "B. La gestion du son",
                "C. L'éclairage scène",
                "D. Le montage final",
              ].map((opt, i) => (
                <div
                  key={opt}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{
                    borderColor: i === 0 ? `${d.accent1}40` : "rgba(255,255,255,0.08)",
                    background: i === 0 ? `${d.accent1}10` : "transparent",
                  }}
                >
                  <span
                    className="text-[14px] font-black w-5"
                    style={{ color: i === 0 ? d.accent1 : "rgba(255,255,255,0.3)" }}
                  >
                    {["A", "B", "C", "D"][i]}
                  </span>
                  <span className="text-[16px]" style={{ color: i === 0 ? "#ffffff" : "rgba(255,255,255,0.4)" }}>
                    {opt.slice(3)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] mt-4" style={{ color: "rgba(255,255,255,0.2)" }}>
              Répondez sur votre appareil
            </p>
          </div>
        </div>
      </div>
      <p className="text-[10px] uppercase tracking-wider font-semibold pt-2" style={{ color: `${d.muted}80` }}>
        Navigation modules (tap sur un module pour sauter)
      </p>
      <ModulePickerPanel d={d} />
    </div>
  );
}

// ─── MINI COCKPIT C : Focus central + drawers (Cabine de Projection) ─────

function MiniCockpitC({ d }: { d: DirectionConfig }) {
  return (
    <div className="space-y-3">
      {/* ── ETAT 1 : Focus central (vue par defaut) ── */}
      <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: `${d.muted}80` }}>
        État 1 — Vue par défaut (focus central)
      </p>
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: d.border, background: d.canvas }}>
        {/* Header minimal */}
        <div className="flex items-center justify-center gap-4 px-4 py-2 border-b" style={{ borderColor: d.border }}>
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: d.accent1, boxShadow: `0 0 8px ${d.accent1}` }}
          />
          <span className="text-[12px] font-medium" style={{ color: d.muted }}>
            M2
          </span>
          <span className="text-[11px]" style={{ color: d.border }}>
            |
          </span>
          <span className="text-[12px]" style={{ color: d.muted }}>
            24 eleves
          </span>
          <span className="text-[11px]" style={{ color: d.border }}>
            |
          </span>
          <span className="text-[12px] font-mono tabular-nums" style={{ color: d.muted }}>
            42:18
          </span>
        </div>

        {/* FOCUS CENTRAL — boite centree avec espace autour */}
        <div
          className="flex flex-col items-center px-10 py-6"
          style={{ background: `radial-gradient(ellipse at center, ${d.accent1}08, transparent 65%)` }}
        >
          <div
            className="w-full max-w-[78%] rounded-2xl border p-5"
            style={{ borderColor: d.accent1Border, background: d.surface, boxShadow: `0 0 24px ${d.accent1}12` }}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] block mb-3" style={{ color: d.accent1 }}>
              Question 3 / 8
            </span>
            <p className="text-[16px] font-bold leading-snug text-center mb-4" style={{ color: d.text }}>
              Quel est le role principal du cadreur dans une mise en scene ?
            </p>
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: d.elevated }}>
              <div
                className="h-full rounded-full"
                style={{ width: "75%", background: `linear-gradient(90deg, ${d.accent1}, ${d.accent2})` }}
              />
            </div>
            <p className="text-[11px] text-center" style={{ color: d.muted }}>
              <span style={{ color: d.accent1 }}>18</span> reponses sur 24
            </p>
          </div>
          <p className="text-[9px] mt-3 tracking-wider uppercase" style={{ color: `${d.muted}40` }}>
            plein ecran · focus total
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-2 px-6 pb-4">
          {[
            { v: "18", l: "Repondu", c: d.accent1 },
            { v: "6", l: "Attente", c: d.accent2 },
            { v: "75%", l: "Taux", c: d.accent3 },
            { v: "42:18", l: "Temps", c: d.muted },
          ].map((k) => (
            <div key={k.l} className="flex flex-col items-center py-2 rounded-xl" style={{ background: `${k.c}08` }}>
              <span className="text-xl font-black tabular-nums" style={{ color: k.c }}>
                {k.v}
              </span>
              <span className="text-[9px] uppercase tracking-wider" style={{ color: d.muted }}>
                {k.l}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 pb-4">
          <button className="px-3 py-2 rounded-xl text-[11px] font-semibold" style={{ color: d.muted }}>
            &larr; Prec
          </button>
          <button
            className="px-8 py-3 rounded-2xl text-[13px] font-black uppercase tracking-wider"
            style={{
              color: d.canvas,
              background: `linear-gradient(135deg, ${d.accent1}, ${d.accent2})`,
              boxShadow: `0 4px 20px ${d.accent1}40`,
            }}
          >
            Reveler
          </button>
          <button className="px-3 py-2 rounded-xl text-[11px] font-semibold" style={{ color: d.muted }}>
            Suivant &rarr;
          </button>
        </div>

        {/* Drawer handles */}
        <div className="flex border-t" style={{ borderColor: d.border }}>
          <div className="flex-1 py-2 text-center border-r" style={{ borderColor: d.border }}>
            <span className="text-[10px]" style={{ color: `${d.muted}60` }}>
              &larr; Swipe : Classe
            </span>
          </div>
          <div className="flex-1 py-2 text-center">
            <span className="text-[10px]" style={{ color: `${d.muted}60` }}>
              Reponses : Swipe &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* ── ETATS 2 + 3 : Drawers ouverts ── */}
      <p className="text-[10px] uppercase tracking-wider font-semibold pt-2" style={{ color: `${d.muted}80` }}>
        États drawers — contenus à l&apos;ouverture
      </p>
      <div className="grid grid-cols-2 gap-3">
        {/* Drawer Classe (swipe gauche) */}
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: d.border, background: d.canvas }}>
          <div
            className="flex items-center gap-2 px-3 py-2.5 border-b"
            style={{ borderColor: d.border, background: d.surface }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: d.accent3 }}>
              ← Classe
            </span>
            <div className="flex-1" />
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: d.accent3, background: d.accent3Bg }}
            >
              24
            </span>
          </div>
          {/* Barre de statut global */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: d.elevated }}>
                <div className="h-full rounded-full" style={{ width: "75%", background: d.accent3 }} />
              </div>
              <span className="text-[10px] font-mono" style={{ color: d.accent3 }}>
                18/24
              </span>
            </div>
            <div className="flex gap-2 text-[9px]" style={{ color: d.muted }}>
              <span style={{ color: d.accent3 }}>● 18 ont repondu</span>
              <span style={{ color: d.accent2 }}>● 4 en attente</span>
              <span>● 2 absents</span>
            </div>
          </div>
          {/* Liste eleves */}
          <div className="px-3 pb-3 space-y-1">
            {[
              { nom: "Inaya B.", statut: "repondu", couleur: d.accent3 },
              { nom: "Karim D.", statut: "repondu", couleur: d.accent3 },
              { nom: "Sofia M.", statut: "en attente", couleur: d.accent2 },
              { nom: "Lucas T.", statut: "repondu", couleur: d.accent3 },
              { nom: "Amira K.", statut: "en attente", couleur: d.accent2 },
              { nom: "Noah R.", statut: "absent", couleur: d.muted },
            ].map((e) => (
              <div
                key={e.nom}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                style={{ background: `${d.surface}80` }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: e.couleur }} />
                <span
                  className="text-[11px] font-medium flex-1"
                  style={{ color: e.statut === "repondu" ? d.text : d.muted }}
                >
                  {e.nom}
                </span>
                <span className="text-[9px]" style={{ color: e.couleur }}>
                  {e.statut}
                </span>
              </div>
            ))}
            <p className="text-[9px] text-center pt-1" style={{ color: `${d.muted}50` }}>
              + 18 autres élèves
            </p>
          </div>
        </div>

        {/* Drawer Reponses (swipe droite) */}
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: d.border, background: d.canvas }}>
          <div
            className="flex items-center gap-2 px-3 py-2.5 border-b"
            style={{ borderColor: d.border, background: d.surface }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: d.accent1 }}>
              Réponses →
            </span>
            <div className="flex-1" />
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: d.accent1, background: d.accent1Bg }}
            >
              18
            </span>
          </div>
          {/* Filtres rapides */}
          <div className="flex gap-1.5 px-3 pt-3 pb-2">
            {["Tous", "Recents", "Similaires"].map((f, i) => (
              <button
                key={f}
                className="px-2 py-1 rounded-lg text-[9px] font-semibold border"
                style={
                  i === 0
                    ? { color: d.accent1, background: d.accent1Bg, borderColor: d.accent1Border }
                    : { color: d.muted, borderColor: "transparent", background: "transparent" }
                }
              >
                {f}
              </button>
            ))}
          </div>
          {/* Stream de reponses */}
          <div className="px-3 pb-3 space-y-1.5">
            {[
              { text: "Le cadrage definit le regard du spectateur et guide son attention.", new: true, time: "8s" },
              {
                text: "C'est lui qui compose l'image avec le realisateur, angle et profondeur.",
                new: true,
                time: "23s",
              },
              { text: "Il gere la mise au point, les mouvements camera et la stabilite.", new: false, time: "41s" },
              { text: "Le cadreur traduit la vision du realisateur en image concrete.", new: false, time: "1m" },
              { text: "Son role c'est de trouver le meilleur angle pour chaque scene.", new: false, time: "1m12s" },
            ].map((r, i) => (
              <div
                key={i}
                className="rounded-lg border px-2.5 py-2"
                style={{
                  borderColor: r.new ? d.accent1Border : d.border,
                  background: r.new ? d.accent1Bg : `${d.surface}60`,
                }}
              >
                <p className="text-[11px] leading-snug" style={{ color: r.new ? d.text : d.muted }}>
                  {r.text}
                </p>
                <span className="text-[8px] mt-0.5 block" style={{ color: `${d.muted}50` }}>
                  il y a {r.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Navigation modules ── */}
      <p className="text-[10px] uppercase tracking-wider font-semibold pt-2" style={{ color: `${d.muted}80` }}>
        Navigation modules (tap sur un module pour sauter)
      </p>
      <ModulePickerPanel d={d} />
    </div>
  );
}

// ─── DIRECTION CARD (complete avec layout ASCII, specs, preview) ──────────

function DirectionCard({ d, index }: { d: DirectionConfig; index: number }) {
  const letter = ["A", "B", "C"][index];
  const PreviewComponent = [MiniCockpitA, MiniCockpitB, MiniCockpitC][index];

  return (
    <section className="space-y-6">
      {/* ── Titre + concept ── */}
      <div className="rounded-2xl border p-6" style={{ background: d.surface, borderColor: d.border }}>
        <div className="flex items-start gap-4 mb-4">
          <span
            className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl font-black shrink-0"
            style={{ background: d.accent1Bg, color: d.accent1, border: `1px solid ${d.accent1Border}` }}
          >
            {letter}
          </span>
          <div className="flex-1">
            <h2 className="text-2xl font-black mb-1" style={{ color: d.text }}>
              Direction {letter} &mdash; &ldquo;{d.name}&rdquo;
            </h2>
            <p className="text-[14px] leading-relaxed" style={{ color: d.muted }}>
              {d.concept}
            </p>
          </div>
        </div>

        {/* References culturelles */}
        <div className="flex flex-wrap gap-2">
          {d.references.map((ref) => (
            <span
              key={ref}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-semibold border"
              style={{ color: d.accent2, background: d.accent2Bg, borderColor: d.accent2Border }}
            >
              {ref}
            </span>
          ))}
        </div>
      </div>

      {/* ── Origine + Logique strategique ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5" style={{ background: d.surface, borderColor: d.border }}>
          <SectionLabel color={d.accent2}>Origine culturelle</SectionLabel>
          <p className="text-[13px] leading-relaxed" style={{ color: d.muted }}>
            {d.origin}
          </p>
        </div>
        <div className="rounded-2xl border p-5" style={{ background: d.surface, borderColor: d.border }}>
          <SectionLabel color={d.accent1}>Logique strategique</SectionLabel>
          <p className="text-[13px] leading-relaxed" style={{ color: d.muted }}>
            {d.logique}
          </p>
        </div>
      </div>

      {/* ── Layout ASCII ── */}
      <div className="rounded-2xl border p-5" style={{ background: d.canvas, borderColor: d.border }}>
        <SectionLabel color={d.accent3}>Architecture UI/UX &mdash; Layout iPad landscape</SectionLabel>
        <pre
          className="text-[11px] leading-relaxed font-mono whitespace-pre overflow-x-auto"
          style={{ color: d.accent3 }}
        >
          {d.layoutAscii}
        </pre>
      </div>

      {/* ── Mini cockpit preview — EN PREMIER pour valider visuellement ── */}
      <PreviewComponent d={d} />

      {/* ── Hierarchie P1-P4 ── */}
      <div className="rounded-2xl border p-5" style={{ background: d.surface, borderColor: d.border }}>
        <SectionLabel color={d.muted}>Hierarchie d&apos;information</SectionLabel>
        <div className="space-y-2">
          {[
            { label: "P1 (vu en 0s)", value: d.hierarchie.p1, color: d.accent1 },
            { label: "P2 (vu en 2s)", value: d.hierarchie.p2, color: d.accent2 },
            { label: "P3 (1 tap)", value: d.hierarchie.p3, color: d.accent3 },
            { label: "P4 (2+ taps)", value: d.hierarchie.p4, color: d.muted },
          ].map((h) => (
            <div key={h.label} className="flex gap-3 items-baseline">
              <span className="text-[10px] font-bold uppercase tracking-wider shrink-0 w-24" style={{ color: h.color }}>
                {h.label}
              </span>
              <span className="text-[12px]" style={{ color: d.muted }}>
                {h.value}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t" style={{ borderColor: d.border }}>
          <p className="text-[11px]" style={{ color: d.muted }}>
            <strong style={{ color: d.accent1 }}>Action principale :</strong> {d.actionPrincipale}
          </p>
          <p className="text-[11px] mt-1" style={{ color: d.muted }}>
            <strong style={{ color: d.accent3 }}>Navigation :</strong> {d.navigation}
          </p>
        </div>
      </div>

      {/* ── Palette ── */}
      <div className="rounded-2xl border p-6" style={{ background: d.surface, borderColor: d.border }}>
        <SectionLabel color={d.muted}>Palette &mdash; Surfaces + Accents</SectionLabel>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { hex: d.canvas, label: "Canvas" },
            { hex: d.surface, label: "Surface" },
            { hex: d.elevated, label: "Elevated" },
          ].map((s) => (
            <div key={s.label}>
              <div
                className="h-14 rounded-lg mb-1.5 border flex items-end px-2 py-1.5"
                style={{ background: s.hex, borderColor: d.border }}
              >
                <span className="text-[9px] font-mono" style={{ color: `${d.text}40` }}>
                  {s.hex}
                </span>
              </div>
              <p className="text-[12px] font-medium" style={{ color: d.text }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { color: d.accent1, label: "Orange cinema", bg: d.accent1Bg },
            { color: d.accent2, label: "Or prestige", bg: d.accent2Bg },
            { color: d.accent3, label: "Teal feedback", bg: d.accent3Bg },
          ].map((a) => (
            <div key={a.label}>
              <div className="h-14 rounded-lg mb-1.5 flex items-center justify-center" style={{ background: a.bg }}>
                <div className="w-6 h-6 rounded-full" style={{ background: a.color }} />
              </div>
              <p className="text-[12px] font-medium" style={{ color: d.text }}>
                {a.label}
              </p>
              <p className="text-[10px] font-mono" style={{ color: d.muted }}>
                {a.color}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Typographie + Motion ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5" style={{ background: d.surface, borderColor: d.border }}>
          <SectionLabel color={d.muted}>Typographie</SectionLabel>
          <div className="space-y-2">
            {[
              { label: "Titres", value: d.typo.titres },
              { label: "Body", value: d.typo.body },
              { label: "Labels", value: d.typo.labels },
              { label: "KPIs", value: d.typo.kpi },
            ].map((t) => (
              <div key={t.label}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: d.accent1 }}>
                  {t.label}
                </span>
                <p className="text-[11px]" style={{ color: d.muted }}>
                  {t.value}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border p-5" style={{ background: d.surface, borderColor: d.border }}>
          <SectionLabel color={d.muted}>Motion</SectionLabel>
          <div className="space-y-2">
            {[
              { label: "Entrees", value: d.motion.entrees },
              { label: "Transitions", value: d.motion.transitions },
              { label: "Micro-interactions", value: d.motion.micro },
            ].map((m) => (
              <div key={m.label}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: d.accent3 }}>
                  {m.label}
                </span>
                <p className="text-[11px]" style={{ color: d.muted }}>
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scores ── */}
      <div className="rounded-2xl border p-6" style={{ background: d.surface, borderColor: d.border }}>
        <SectionLabel color={d.muted}>Scores</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Lisibilite iPad a 2m", value: d.scores.lisibilite },
            { label: "Coherence brand", value: d.scores.coherence },
            { label: "Effort implementation", value: d.scores.effort },
            { label: "Modernite 2026", value: d.scores.modernite },
            { label: "Emotion cible", value: d.scores.emotion },
            { label: "Unicite / differenciation", value: d.scores.unicite },
          ].map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider mb-1" style={{ color: d.muted }}>
                {s.label}
              </span>
              <span className="text-lg font-black" style={{ color: d.accent1 }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── DONNÉES RAPPORT PHASE 0 ───────────────────────────────────────────────

const PHASE0 = {
  date: "2026-03-30",
  patternsDominants: [
    {
      titre: "Card-based progressive disclosure",
      source: "adamfard.com/blog/edtech-design-trends + Muzli Dashboard 2026",
      principe:
        "L'enseignant voit les données actives sans surcharge. Les cartes permettent de n'afficher que ce qui est pertinent maintenant. Zones modulaires indépendantes — si une zone est vide, elle disparaît sans casser le layout.",
      applicable:
        "Valide le pattern Direction A (question centrale + stream séparé) et Direction C (drawers indépendants).",
    },
    {
      titre: "Dark mode premium avec accents haute saturation",
      source: "Muzli 2026 — Orbix Studio, Felix/Mirhayot",
      principe:
        "Fonds très sombres (#0A0A16) + accents néon/saturés. Particulièrement adapté aux environnements de projection : salle sombre = dark mode lisible, light mode = lavé par le projecteur.",
      applicable:
        "Valide fonctionnellement la Direction B (premium dark). Suggère que Direction A devrait proposer un mode sombre optionnel.",
    },
    {
      titre: "Badges de statut temps réel sans tableaux",
      source: "Multiple sources EdTech dashboard 2025-2026",
      principe:
        "Statut élèves = badge coloré (vert/orange/gris), jamais un tableau à colonnes. Reconnaissance visuelle < 200ms. Un tableau requiert de lire. Un badge se lit d'un coup d'oeil.",
      applicable:
        "Drawer Classe Direction C — les badges par élève sont le pattern validé. Les tableaux de données sont l'anti-pattern.",
    },
  ],
  patternsMorts: [
    {
      pattern: "Navigation à dropdowns pendant une session live",
      preuve: "Anti-pattern explicite — retours Mentimeter ('trop d'étapes pour changer d'activité')",
      risque:
        "L'enseignant cherche une action pendant que les élèves attendent. Chaque dropdown = silence inconfortable devant la classe.",
    },
    {
      pattern: "Dense tabular layouts (tableaux classiques)",
      preuve: "Anti-pattern dans tous les dashboards EdTech 2026 analysés",
      risque:
        "Lisible sur desktop assis, illisible sur iPad debout à 60cm. Contrastes insuffisants en salle lumineuse.",
    },
    {
      pattern: "Modals emboîtées pour actions urgentes",
      preuve: "Cité explicitement — adamfard.com analyse EdTech",
      risque:
        "Modal → autre modal = 3+ taps pour une action fréquente. Sur un cockpit live : toute action > 1 tap est un bug d'architecture.",
    },
  ],
  plaintes: [
    {
      plainte: '"Tracking individual student progress is tedious"',
      source: "Common Sense Education — reviews Kahoot enseignants",
      implication:
        "La vue classe doit montrer le statut en un coup d'oeil. Drawer Classe = scanning-first, pas navigation-first.",
    },
    {
      plainte: '"Hard to read questions and answers on a projected screen"',
      source: "Reviews Kahoot — Common Sense Education, GetApp",
      implication:
        "Mode projection ≠ juste un autre écran. Textes minimum 24px en mode projection (lu à 3-8m par 24 élèves).",
    },
    {
      plainte: '"Template changes broke our workflow" (Mentimeter 2024)',
      source: "Reviews Capterra Mentimeter",
      implication:
        "Les enseignants ont des rituels. Tout redesign en cours d'année = trahison. Design system stable obligatoire.",
    },
    {
      plainte: "Interface gamifiée inadaptée au secondaire/professionnel",
      source: "Mission.io blog + comparatifs 2025-2026",
      implication: "Valide la doctrine Banlieuwood 'pas de gamification agressive, cinema premium'.",
    },
  ],
  lacune:
    "Aucun outil existant n'est conçu pour la posture physique réelle : debout, en mouvement, iPad posé sur pupitre, en train de parler, interrompu toutes les 30 secondes. Tous les concurrents (Kahoot, Nearpod, Mentimeter, Wooclap) sont conçus pour un utilisateur assis devant un ordinateur de bureau.",
  implication:
    "La Phase 2 doit tester chaque direction contre cette contrainte physique. Toute direction qui requiert de 'chercher' une action échoue dès le départ. La révélation des résultats est un moment absent chez tous les concurrents — c'est l'opportunité de différenciation la plus forte.",
};

// ─── ONGLET RAPPORTS ────────────────────────────────────────────────────────

function Phase0Report() {
  return (
    <div className="space-y-8">
      {/* Patterns dominants */}
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold mb-4" style={{ color: "#ff6b35" }}>
          Patterns dominants en 2026
        </p>
        <div className="space-y-3">
          {PHASE0.patternsDominants.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border p-4"
              style={{ borderColor: "rgba(255,107,53,0.1)", background: "rgba(255,107,53,0.02)" }}
            >
              <p className="text-[13px] font-bold mb-1" style={{ color: "#f5f0e8" }}>
                {p.titre}
              </p>
              <p className="text-[10px] font-mono mb-2" style={{ color: "rgba(255,107,53,0.5)" }}>
                SOURCE : {p.source}
              </p>
              <p className="text-[12px] leading-relaxed mb-2" style={{ color: "#a89e8e" }}>
                {p.principe}
              </p>
              <p className="text-[12px] leading-relaxed" style={{ color: "#ff6b35" }}>
                → {p.applicable}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Patterns morts */}
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold mb-4" style={{ color: "#c0392b" }}>
          Patterns morts — À éviter
        </p>
        <div className="space-y-2">
          {PHASE0.patternsMorts.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border p-3"
              style={{ borderColor: "rgba(192,57,43,0.1)", background: "rgba(192,57,43,0.02)" }}
            >
              <p className="text-[12px] font-bold mb-1 line-through" style={{ color: "#c0392b" }}>
                {p.pattern}
              </p>
              <p className="text-[11px] mb-1" style={{ color: "#5a3a35" }}>
                Preuve : {p.preuve}
              </p>
              <p className="text-[11px]" style={{ color: "#a89e8e" }}>
                Risque : {p.risque}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Plaintes */}
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold mb-4" style={{ color: "#D4A843" }}>
          Ce que les utilisateurs détestent (gold mine pour l&apos;anti-brief)
        </p>
        <div className="space-y-2">
          {PHASE0.plaintes.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border p-3"
              style={{ borderColor: "rgba(212,168,67,0.1)", background: "rgba(212,168,67,0.02)" }}
            >
              <p className="text-[12px] font-bold mb-1 italic" style={{ color: "#D4A843" }}>
                {p.plainte}
              </p>
              <p className="text-[10px] font-mono mb-1" style={{ color: "rgba(212,168,67,0.4)" }}>
                SOURCE : {p.source}
              </p>
              <p className="text-[11px]" style={{ color: "#a89e8e" }}>
                → {p.implication}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Lacune + Implication */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: "rgba(78,205,196,0.15)", background: "rgba(78,205,196,0.03)" }}
        >
          <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "#4ECDC4" }}>
            Lacune de l&apos;état de l&apos;art EdTech
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: "#a89e8e" }}>
            {PHASE0.lacune}
          </p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: "rgba(255,107,53,0.15)", background: "rgba(255,107,53,0.03)" }}
        >
          <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "#ff6b35" }}>
            Implication directe pour ce projet
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: "#a89e8e" }}>
            {PHASE0.implication}
          </p>
        </div>
      </div>
    </div>
  );
}

function Phase2TextReport() {
  return (
    <div className="space-y-4">
      <p className="text-[12px]" style={{ color: "#6b5a50" }}>
        3 directions générées le 2026-03-30 — ancres dans des références culturelles non-digitales du cinéma.
      </p>
      {DIRECTIONS.map((d, i) => {
        const letter = ["A", "B", "C"][i];
        return (
          <div
            key={d.name}
            className="rounded-xl border p-5"
            style={{ borderColor: `${d.accent1}20`, background: `${d.accent1}04` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0"
                style={{ background: `${d.accent1}15`, color: d.accent1, border: `1px solid ${d.accent1}25` }}
              >
                {letter}
              </span>
              <p className="text-[14px] font-bold" style={{ color: "#f5f0e8" }}>
                {d.name}
              </p>
            </div>
            <p className="text-[12px] leading-relaxed mb-4" style={{ color: "#a89e8e" }}>
              {d.concept}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: d.accent1 }}>
                  Origine
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: "#6b5a50" }}>
                  {d.origin.split(".")[0]}.
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: d.accent2 }}>
                  Logique stratégique
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: "#6b5a50" }}>
                  {d.logique.split(".")[0]}.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {d.references.map((ref) => (
                <span
                  key={ref}
                  className="text-[10px] px-2 py-1 rounded-md border"
                  style={{ color: d.accent3, borderColor: `${d.accent3}20`, background: `${d.accent3}08` }}
                >
                  {ref}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PhasePending({ instruction }: { instruction: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div
        className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center"
        style={{ background: "rgba(245,240,232,0.03)", border: "1px dashed rgba(245,240,232,0.1)" }}
      >
        <span className="text-[20px]" style={{ color: "#3a3a3a" }}>
          ○
        </span>
      </div>
      <p className="text-[12px] max-w-sm leading-relaxed" style={{ color: "#3a3a3a" }}>
        {instruction}
      </p>
    </div>
  );
}

function RapportsTab() {
  const [open, setOpen] = useState<string>("phase0");
  const phases = [
    { id: "phase0", num: "00", label: "Phase 0", title: "Rapport de Veille", status: "done", date: "2026-03-30" },
    { id: "phase1", num: "01", label: "Phase 1", title: "Brief Créatif", status: "pending", date: null },
    {
      id: "phase2",
      num: "02",
      label: "Phase 2",
      title: "Directions — Specs & Argumentaire",
      status: "done",
      date: "2026-03-30",
    },
    {
      id: "verdict",
      num: "03",
      label: "Verdict",
      title: "Creative Director — Décision finale",
      status: "pending",
      date: null,
    },
  ];

  return (
    <div className="space-y-3 max-w-4xl">
      {phases.map((phase) => {
        const isDone = phase.status === "done";
        const isOpen = open === phase.id;
        return (
          <div
            key={phase.id}
            className="rounded-2xl border overflow-hidden transition-colors"
            style={{
              borderColor: isDone ? "rgba(255,107,53,0.15)" : "rgba(245,240,232,0.05)",
              background: isOpen ? "rgba(255,107,53,0.02)" : "rgba(245,240,232,0.01)",
            }}
          >
            <button
              className="w-full flex items-center gap-4 px-5 py-4 text-left"
              onClick={() => setOpen(isOpen ? "" : phase.id)}
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0"
                style={{
                  background: isDone ? "rgba(255,107,53,0.12)" : "rgba(245,240,232,0.04)",
                  color: isDone ? "#ff6b35" : "#3a3a3a",
                  border: `1px solid ${isDone ? "rgba(255,107,53,0.2)" : "rgba(245,240,232,0.06)"}`,
                }}
              >
                {phase.num}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] uppercase tracking-wider mb-0.5"
                  style={{ color: isDone ? "#ff6b35" : "#3a3a3a" }}
                >
                  {phase.label}
                </p>
                <p className="text-[14px] font-bold truncate" style={{ color: isDone ? "#f5f0e8" : "#3a3a3a" }}>
                  {phase.title}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {phase.date && (
                  <span className="text-[10px]" style={{ color: "#3a3a3a" }}>
                    {phase.date}
                  </span>
                )}
                <span
                  className="text-[10px] px-2 py-1 rounded-md font-semibold"
                  style={{
                    background: isDone ? "rgba(255,107,53,0.1)" : "rgba(245,240,232,0.04)",
                    color: isDone ? "#ff6b35" : "#3a3a3a",
                  }}
                >
                  {isDone ? "Complété" : "En attente"}
                </span>
                <span className="text-[12px] w-4 text-center" style={{ color: "#3a3a3a" }}>
                  {isOpen ? "↑" : "↓"}
                </span>
              </div>
            </button>
            {isOpen && (
              <div className="px-5 pb-6 pt-2 border-t" style={{ borderColor: "rgba(245,240,232,0.05)" }}>
                {phase.id === "phase0" && <Phase0Report />}
                {phase.id === "phase1" && (
                  <PhasePending instruction="Lancez l'agent design-director : 'phase 1 — brief cockpit intervenant'. Le brief créatif sera généré après lecture des docs produit." />
                )}
                {phase.id === "phase2" && <Phase2TextReport />}
                {phase.id === "verdict" && (
                  <PhasePending instruction="Après avoir choisi une direction, lancez l'agent creative-director pour le verdict final et la décision." />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── ONGLET DIRECTIONS ─────────────────────────────────────────────────────

function DirectionsTab() {
  return (
    <div className="max-w-5xl">
      {/* Cadre : pourquoi ces 3 directions */}
      <section
        className="rounded-2xl border p-6 mb-10"
        style={{ background: "rgba(255,107,53,0.03)", borderColor: "rgba(255,107,53,0.12)" }}
      >
        <p className="text-[11px] uppercase tracking-[0.2em] mb-4" style={{ color: "#ff6b35" }}>
          Pourquoi ces 3 directions et pas d&apos;autres
        </p>
        <p className="text-[14px] leading-relaxed mb-4" style={{ color: "#d4c5b0" }}>
          J&apos;ai exploré 10 territoires visuels : salle de montage film, régie TV broadcast, cabine de projection
          cinéma, salle de classe futuriste, cockpit d&apos;avion, galerie d&apos;art contemporain, terminal sci-fi,
          studio photo, théâtre/coulisses, table de mixage.
        </p>
        <p className="text-[14px] leading-relaxed mb-3" style={{ color: "#a89e8e" }}>
          7 éliminés :
        </p>
        <ul className="space-y-1.5 text-[13px] mb-5" style={{ color: "#a89e8e" }}>
          <li>
            <strong style={{ color: "#d4c5b0" }}>Salle de classe futuriste</strong> — viole la doctrine : pas de design
            scolaire
          </li>
          <li>
            <strong style={{ color: "#d4c5b0" }}>Cockpit d&apos;avion</strong> — trop technique, émotion froide, pas
            cinéma
          </li>
          <li>
            <strong style={{ color: "#d4c5b0" }}>Galerie d&apos;art contemporain</strong> — trop neutre, manque la
            chaleur Banlieuwood
          </li>
          <li>
            <strong style={{ color: "#d4c5b0" }}>Terminal sci-fi</strong> — retrofuturisme niche, pas l&apos;identité
            pro recherchée
          </li>
          <li>
            <strong style={{ color: "#d4c5b0" }}>Studio photo</strong> — trop similaire à la salle de montage
          </li>
          <li>
            <strong style={{ color: "#d4c5b0" }}>Théâtre/coulisses</strong> — orienté spectacle, pas outil de maîtrise
          </li>
          <li>
            <strong style={{ color: "#d4c5b0" }}>Table de mixage audio</strong> — pertinent pour musique, pas le cockpit
            général
          </li>
        </ul>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              letter: "A",
              name: "Salle de Montage",
              color: "#FF6B35",
              desc: "Timeline horizontale. Le temps de la séance avance de gauche à droite. L'intervenant est un monteur.",
            },
            {
              letter: "B",
              name: "Régie Broadcast",
              color: "#D4A843",
              desc: "Zones de contrôle simultanées. Tout visible en même temps, zero tabs. L'intervenant est un réalisateur TV.",
            },
            {
              letter: "C",
              name: "Cabine de Projection",
              color: "#4ECDC4",
              desc: "Focus central exclusif. Un seul élément domine, le reste en drawers. L'intervenant est un projectionniste.",
            },
          ].map((d) => (
            <div
              key={d.letter}
              className="rounded-xl border p-4"
              style={{ borderColor: `${d.color}20`, background: `${d.color}05` }}
            >
              <p className="text-[12px] font-bold mb-1" style={{ color: d.color }}>
                {d.letter} — {d.name}
              </p>
              <p className="text-[11px]" style={{ color: "#a89e8e" }}>
                {d.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3 Direction Cards */}
      <div className="space-y-16">
        {DIRECTIONS.map((d, i) => (
          <div key={d.name}>
            <DirectionCard d={d} index={i} />
            {i < DIRECTIONS.length - 1 && (
              <div className="mt-16">
                <Divider color="rgba(245,240,232,0.06)" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Prochaine étape */}
      <div className="mt-16">
        <Divider color="rgba(255,107,53,0.15)" />
        <section
          className="rounded-2xl border p-6 mt-8"
          style={{ background: "rgba(255,107,53,0.03)", borderColor: "rgba(255,107,53,0.12)" }}
        >
          <p className="text-[11px] uppercase tracking-[0.2em] mb-4" style={{ color: "#ff6b35" }}>
            Prochaine étape — Choix du client
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                label: "Direction A",
                value: "Salle de Montage",
                note: "La plus proche du code existant (effort S). Timeline horizontale = métaphore forte. Le choix le plus rapide à implémenter.",
              },
              {
                label: "Direction B",
                value: "Régie Broadcast",
                note: "La plus dense et moderne. Tout visible sans tabs. Layout 3 colonnes conforme à la SPEC V3. Le choix performance/densité.",
              },
              {
                label: "Direction C",
                value: "Cabine de Projection",
                note: "La plus émotionnelle et unique. Focus total, gestes iPad natifs (swipe drawers). Le choix identité cinéma maximale.",
              },
            ].map(({ label, value, note }) => (
              <div key={label}>
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "#a89e8e" }}>
                  {label}
                </p>
                <p className="text-[14px] font-bold mb-1" style={{ color: "#f5f0e8" }}>
                  {value}
                </p>
                <p className="text-[12px] leading-relaxed" style={{ color: "#a89e8e" }}>
                  {note}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── ONGLET COMPARATIVE ────────────────────────────────────────────────────

function ComparativeTab() {
  return (
    <div className="max-w-5xl">
      <p className="text-[11px] uppercase tracking-[0.2em] mb-8" style={{ color: "#a89e8e" }}>
        Comparaison visuelle — 3 architectures côte à côte
      </p>
      <div className="grid grid-cols-3 gap-4 mb-10">
        {DIRECTIONS.map((d, i) => {
          const letter = ["A", "B", "C"][i];
          const PreviewComp = [MiniCockpitA, MiniCockpitB, MiniCockpitC][i];
          const accentColors = ["#FF6B35", "#D4A843", "#4ECDC4"];
          return (
            <div key={d.name} className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black"
                  style={{
                    background: `${accentColors[i]}15`,
                    color: accentColors[i],
                    border: `1px solid ${accentColors[i]}30`,
                  }}
                >
                  {letter}
                </span>
                <span className="text-[12px] font-bold" style={{ color: "#f5f0e8" }}>
                  {d.name}
                </span>
              </div>
              <div style={{ fontSize: "0.72em" }}>
                <PreviewComp d={d} />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { l: "Lisibilité", v: d.scores.lisibilite },
                  { l: "Émotion", v: d.scores.emotion },
                  { l: "Modernité", v: d.scores.modernite },
                  { l: "Effort", v: d.scores.effort },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-lg px-2 py-1.5 border"
                    style={{ borderColor: "rgba(245,240,232,0.06)", background: "rgba(245,240,232,0.02)" }}
                  >
                    <p className="text-[9px] uppercase tracking-wider" style={{ color: "#a89e8e" }}>
                      {s.l}
                    </p>
                    <p className="text-[13px] font-black" style={{ color: accentColors[i] }}>
                      {s.v}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tableau comparatif */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-[13px]" style={{ color: "#d4c5b0" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(245,240,232,0.08)" }}>
              <th
                className="text-left py-3 pr-4 text-[11px] uppercase tracking-wider font-semibold"
                style={{ color: "#a89e8e" }}
              >
                Critère
              </th>
              <th
                className="text-center py-3 px-4 text-[11px] uppercase tracking-wider font-semibold"
                style={{ color: "#FF6B35" }}
              >
                A — Montage
              </th>
              <th
                className="text-center py-3 px-4 text-[11px] uppercase tracking-wider font-semibold"
                style={{ color: "#D4A843" }}
              >
                B — Régie
              </th>
              <th
                className="text-center py-3 px-4 text-[11px] uppercase tracking-wider font-semibold"
                style={{ color: "#4ECDC4" }}
              >
                C — Cabine
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Lisibilité iPad à 2m", a: "9/10", b: "10/10", c: "8/10" },
              { label: "Cohérence brand existant", a: "10/10", b: "9/10", c: "10/10" },
              { label: "Effort implementation", a: "S", b: "M", c: "M" },
              { label: "Modernité 2026", a: "8/10", b: "10/10", c: "7/10" },
              { label: "Émotion cible atteinte", a: "9/10", b: "7/10", c: "10/10" },
              { label: "Unicité / différenciation", a: "7/10", b: "8/10", c: "9/10" },
            ].map((row) => (
              <tr key={row.label} style={{ borderBottom: "1px solid rgba(245,240,232,0.04)" }}>
                <td className="py-2.5 pr-4" style={{ color: "#a89e8e" }}>
                  {row.label}
                </td>
                <td className="text-center py-2.5 px-4 font-bold">{row.a}</td>
                <td className="text-center py-2.5 px-4 font-bold">{row.b}</td>
                <td className="text-center py-2.5 px-4 font-bold">{row.c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ────────────────────────────────────────────────────────

export default function DesignPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const [tab, setTab] = useState<"rapports" | "directions" | "comparative">("rapports");

  return (
    <main
      className="min-h-screen"
      style={{ background: "#0a0a0a", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="px-6 sm:px-10 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "#ff6b35" }}>
            Banlieuwood
          </span>
          <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#a89e8e" }}>
            Design Cockpit
          </span>
          <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
          <span className="text-[10px] font-mono" style={{ color: "#3a3a3a" }}>
            2026-03-30
          </span>
        </div>
        <h1
          className="text-5xl sm:text-6xl font-black uppercase mb-2"
          style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em", color: "#f5f5f4" }}
        >
          Cockpit Intervenant
        </h1>
        <p className="text-[13px]" style={{ color: "#a89e8e" }}>
          Phase 2 — Direction artistique &nbsp;·&nbsp; 3 directions &nbsp;·&nbsp; Rapport de veille généré
        </p>
      </div>

      {/* ── Navigation onglets (sticky) ── */}
      <div
        className="sticky top-0 z-50 px-6 sm:px-10 border-b"
        style={{
          background: "rgba(10,10,10,0.96)",
          borderColor: "rgba(245,240,232,0.06)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex gap-0">
          {[
            { id: "rapports", label: "Rapports", badge: "4" },
            { id: "directions", label: "Directions", badge: "3" },
            { id: "comparative", label: "Comparative", badge: null },
          ].map(({ id, label, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id as typeof tab)}
              className="relative px-5 py-4 text-[11px] font-semibold uppercase tracking-wider transition-colors"
              style={{
                color: tab === id ? "#ff6b35" : "#a89e8e",
                borderBottom: tab === id ? "2px solid #ff6b35" : "2px solid transparent",
                marginBottom: "-1px",
                background: "transparent",
              }}
            >
              {label}
              {badge && (
                <span
                  className="ml-2 px-1.5 py-0.5 rounded text-[9px]"
                  style={{
                    background: tab === id ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.05)",
                    color: tab === id ? "#ff6b35" : "#5a5a5a",
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenu onglet ── */}
      <div className="px-6 sm:px-10 py-10">
        {tab === "rapports" && <RapportsTab />}
        {tab === "directions" && <DirectionsTab />}
        {tab === "comparative" && <ComparativeTab />}
      </div>
    </main>
  );
}
