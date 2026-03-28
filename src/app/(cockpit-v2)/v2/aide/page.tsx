"use client";

import { useState } from "react";
import { GlassCardV2 } from "@/components/v2/glass-card";

// ── FAQ Data ──

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Comment créer une nouvelle séance ?",
    answer:
      "Cliquez sur le bouton « Nouvelle séance » en haut à droite, ou utilisez le raccourci ⌘K puis tapez « nouvelle séance ». Remplissez le titre, la classe, le niveau et les options, puis confirmez.",
  },
  {
    question: "Comment les élèves rejoignent une séance ?",
    answer:
      "Partagez le code de connexion affiché dans la page de préparation de la séance. Les élèves vont sur la page de jeu et saisissent le code pour rejoindre. Ils choisissent un pseudo et un avatar.",
  },
  {
    question: "Puis-je modifier les réponses des élèves ?",
    answer:
      "Vous ne pouvez pas modifier les réponses directement, mais vous pouvez les noter, les mettre en avant (highlight) ou ajouter un tag pédagogique depuis le cockpit de pilotage. Les annotations sont visibles dans le profil de l'élève.",
  },
  {
    question: "Comment archiver une séance terminée ?",
    answer:
      "Dans la liste des séances, cochez les séances souhaitées puis cliquez sur « Archiver » dans la barre d'actions. Les séances archivées restent accessibles dans l'onglet « Archives ».",
  },
  {
    question: "Les données sont-elles sauvegardées automatiquement ?",
    answer:
      "Oui, toutes les réponses et scores sont sauvegardés en temps réel. Les notes enseignant, les annotations et les paramètres de séance sont également persistés automatiquement.",
  },
];

// ── Quick Guide Data ──

interface GuideItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const GUIDE_ITEMS: GuideItem[] = [
  {
    title: "Tableau de bord",
    description:
      "Vue d'ensemble de vos séances actives, à venir et récentes. Les KPIs affichent le nombre total d'élèves, de séances et les scores moyens de la classe.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Cockpit de pilotage",
    description:
      "Interface en temps réel pour piloter une séance. Vous contrôlez l'avancée des questions, visualisez les réponses, envoyez des messages et gérez le chronomètre.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    title: "Profils élèves",
    description:
      "Chaque élève a un profil avec son historique de scores, ses réponses récentes, ses badges et son portfolio créatif. Vous pouvez y ajouter des notes pédagogiques.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M12 13v-1a3 3 0 00-3-3H5a3 3 0 00-3 3v1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Statistiques",
    description:
      "Analysez les performances par classe, par séance ou par module. Les graphiques montrent l'évolution des scores et la répartition des compétences.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M3 15V8M7 15V5M11 15V9M15 15V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Bibliothèque de modules",
    description:
      "Parcourez les modules pédagogiques disponibles : Le Regard, Générer l'idée, Le Pitch, Le Récit, Le Scénario, La Mise en scène, L'Équipe. Lancez une séance directement depuis un module.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M2 3h5l2 2h7v10H2V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

// ── Keyboard Shortcuts ──

interface ShortcutItem {
  keys: string[];
  description: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ["Espace"], description: "Pause / Reprendre la séance" },
  { keys: ["N"], description: "Action suivante (question suivante)" },
  { keys: ["B"], description: "Envoyer un message broadcast" },
  { keys: ["E"], description: "Exporter les résultats" },
  { keys: ["C"], description: "Comparer les réponses" },
  { keys: ["F"], description: "Mode focus (masquer les panneaux)" },
  { keys: ["H"], description: "Mode intervention" },
  { keys: ["T"], description: "Ouvrir le chronomètre" },
  { keys: ["1-5"], description: "Présélections chrono (en mode timer)" },
  { keys: ["?"], description: "Afficher les raccourcis" },
  { keys: ["Échap"], description: "Fermer les panneaux ouverts" },
  { keys: ["⌘", "K"], description: "Recherche rapide (toutes les pages)" },
  { keys: ["⌘", "Z"], description: "Annuler la dernière action" },
];

// ── Components ──

function FaqAccordion({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--color-bw-border-subtle)] last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-medium text-bw-heading pr-4">{item.question}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`shrink-0 text-bw-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? "max-h-40 pb-4" : "max-h-0"}`}>
        <p className="text-sm text-bw-muted leading-relaxed">{item.answer}</p>
      </div>
    </div>
  );
}

export default function AidePage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 pt-16 lg:pt-6 pb-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-heading-lg text-bw-heading">Aide</h1>
        <p className="text-sm text-bw-muted mt-0.5">Guides, FAQ et raccourcis pour utiliser Banlieuwood</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Quick Guide */}
        <GlassCardV2 className="p-5">
          <h2 className="label-caps mb-4">Guide rapide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GUIDE_ITEMS.map((item) => (
              <div key={item.title} className="flex gap-3 rounded-xl border border-[var(--color-bw-border-subtle)] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bw-surface-dim)] text-bw-muted">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-heading-xs text-bw-heading mb-0.5">{item.title}</h3>
                  <p className="text-body-xs text-bw-muted leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCardV2>

        {/* FAQ */}
        <GlassCardV2 className="p-5">
          <h2 className="label-caps mb-2">Questions fréquentes</h2>
          <div>
            {FAQ_ITEMS.map((item) => (
              <FaqAccordion key={item.question} item={item} />
            ))}
          </div>
        </GlassCardV2>

        {/* Keyboard Shortcuts */}
        <GlassCardV2 className="p-5">
          <h2 className="label-caps mb-4">
            Raccourcis clavier
            <span className="ml-2 text-body-xs text-bw-muted font-normal normal-case">(cockpit de pilotage)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {SHORTCUTS.map((s) => (
              <div
                key={s.description}
                className="flex items-center justify-between py-1.5 border-b border-[var(--color-bw-border-subtle)] last:border-0"
              >
                <span className="text-sm text-bw-muted">{s.description}</span>
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  {s.keys.map((key, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-[10px] text-bw-muted mx-0.5">+</span>}
                      <kbd className="inline-flex items-center justify-center rounded-md border border-[var(--color-bw-border)] bg-[var(--color-bw-surface-dim)] px-1.5 py-0.5 text-xs font-medium text-bw-heading min-w-[24px] text-center">
                        {key}
                      </kbd>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCardV2>

        {/* Contact */}
        <GlassCardV2 className="p-5">
          <h2 className="label-caps mb-3">Contact et support</h2>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-bw-muted leading-relaxed">
              Besoin d'aide supplementaire ? Contactez l'equipe Banlieuwood :
            </p>
            <a
              href="mailto:support@banlieuwood.fr"
              className="inline-flex items-center gap-2 text-sm font-medium text-bw-primary hover:underline"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
              support@banlieuwood.fr
            </a>
            <p className="text-xs text-bw-muted mt-1">Nous répondons généralement sous 24 heures en jours ouvrables.</p>
          </div>
        </GlassCardV2>
      </div>
    </div>
  );
}
