// ============================================================
// MODULE 7 — La Mise en scène
// 4 plans fondamentaux (Adrian réduit à l'essentiel),
// quiz de comparaison visuelle, découpage technique.
// ============================================================

export interface PlanFondamental {
  key: string;
  label: string;
  description: string;
  question: string;
  example: string;
  color: string;
  imageUrl: string;
}

// 4 plans fondamentaux uniquement (pas de plongée/contre-plongée — trop technique selon Adrian)
export const PLANS_FONDAMENTAUX: PlanFondamental[] = [
  {
    key: "plan-large",
    label: "Plan large",
    description: "Où sommes-nous ? Montre tout le décor et situe l'action.",
    question: "Ça se passe où ?",
    example: "La cour de l'école vue de loin, avec les élèves qui jouent.",
    color: "#3B82F6",
    imageUrl: "/images/plans/plan-large.svg",
  },
  {
    key: "plan-moyen",
    label: "Plan moyen",
    description: "Le personnage en situation. On voit ce qu'il fait.",
    question: "Que fait le personnage ?",
    example: "Deux élèves assis sur un banc, en train de discuter.",
    color: "#10B981",
    imageUrl: "/images/plans/plan-moyen.svg",
  },
  {
    key: "gros-plan",
    label: "Gros plan",
    description: "Une émotion ou un détail important. On ressent ce que le personnage ressent.",
    question: "Qu'est-ce qu'on ressent ?",
    example: "Le visage en larmes d'un personnage, en gros plan.",
    color: "#EF4444",
    imageUrl: "/images/plans/gros-plan.svg",
  },
  {
    key: "plan-reaction",
    label: "Plan réaction",
    description: "Comment un personnage réagit à ce qui vient de se passer.",
    question: "Comment réagit l'autre ?",
    example: "Le visage surpris de l'ami qui vient d'apprendre la nouvelle.",
    color: "#F59E0B",
    imageUrl: "/images/plans/plan-reaction.svg",
  },
];

// Keep old export name for backward compat
export const PLANS_CAMERA = PLANS_FONDAMENTAUX;

// 3 paires de comparaison : même scène, deux cadrages → "qu'est-ce que ça change ?"
export interface Comparison {
  key: string;
  sceneDescription: string;
  planA: { type: string; description: string };
  planB: { type: string; description: string };
  imageA: string;
  imageB: string;
  question: string;
  explanation: string;
}

export const COMPARISONS: Comparison[] = [
  {
    key: "comp1",
    sceneDescription: "Un élève découvre un message sur son casier.",
    planA: {
      type: "plan-large",
      description: "On voit le couloir entier, l'élève est petit au fond. D'autres élèves passent sans remarquer.",
    },
    planB: {
      type: "gros-plan",
      description: "On voit juste le visage de l'élève qui lit le message. Ses yeux s'écarquillent.",
    },
    imageA: "/images/plans/comparisons/comp1-large.svg",
    imageB: "/images/plans/comparisons/comp1-gros.svg",
    question: "Quel cadrage rend la scène plus émouvante ?",
    explanation:
      "Le gros plan montre l'émotion. Le plan large montre la solitude. Les deux racontent une histoire différente !",
  },
  {
    key: "comp2",
    sceneDescription: "Deux amis se disputent dans la cour.",
    planA: {
      type: "plan-moyen",
      description: "On voit les deux personnages face à face, leurs gestes, leur posture.",
    },
    planB: {
      type: "plan-reaction",
      description: "On voit uniquement le visage de celui qui écoute. Il serre les poings.",
    },
    imageA: "/images/plans/comparisons/comp2-moyen.svg",
    imageB: "/images/plans/comparisons/comp2-reaction.svg",
    question: "Quel cadrage montre le mieux la tension ?",
    explanation: "Le plan moyen montre le conflit entre les deux. Le plan réaction montre l'impact sur un personnage.",
  },
  {
    key: "comp3",
    sceneDescription: "Un professeur annonce les résultats d'un concours.",
    planA: {
      type: "plan-large",
      description: "On voit toute la classe, certains stressés, d'autres confiants.",
    },
    planB: {
      type: "plan-reaction",
      description: "On voit le visage du gagnant qui réalise qu'il a gagné. Un sourire apparaît lentement.",
    },
    imageA: "/images/plans/comparisons/comp3-large.svg",
    imageB: "/images/plans/comparisons/comp3-reaction.svg",
    question: "Quel cadrage crée le plus de suspense ?",
    explanation: "Le plan large montre l'attente collective. Le plan réaction capte l'instant précis de la réaction.",
  },
];

// Vocabulaire simplifié (pas de jargon)
export const VOCABULAIRE_TECHNIQUE = [
  { key: "sequence", label: "Séquence", definition: "Un ensemble de plans qui racontent une action complète" },
  { key: "raccord", label: "Raccord", definition: "Le lien visuel entre deux plans pour que ça reste fluide" },
  {
    key: "champ-contrechamp",
    label: "Champ/Contre-champ",
    definition: "Alterner entre deux personnages qui se parlent",
  },
] as const;

/**
 * Génère un template de découpage vide pour une scène
 * @param scene - Scène du M6
 * @returns Template avec 3-4 slots de plans à remplir
 */
export function buildDecoupageTemplate(scene: { title: string; description: string }) {
  return {
    sceneTitle: scene.title,
    sceneDescription: scene.description,
    slots: [
      { position: 1, planType: "", description: "", intention: "" },
      { position: 2, planType: "", description: "", intention: "" },
      { position: 3, planType: "", description: "", intention: "" },
    ],
  };
}

// ── Fiches de tournage (inter-séance M7→M8) ──

export interface FicheSection {
  heading: string;
  content: string;
}

export interface FicheTournage {
  title: string;
  emoji: string;
  sections: FicheSection[];
}

interface SceneInput {
  title: string;
  description: string;
  act: string;
  content?: string;
  sceneNumber?: number;
}

interface StoryboardScene {
  sceneId: string;
  title: string;
  plans: { position: number; planType: string; description: string; intention?: string; imageUrl?: string }[];
}

interface ScenarioInput {
  fullText?: string;
}

const PLAN_LABELS: Record<string, string> = {
  "plan-large": "Plan large",
  "plan-moyen": "Plan moyen",
  "gros-plan": "Gros plan",
  "plan-reaction": "Plan réaction",
};

export const ROLE_KEYS = ["realisateur", "cadreur", "scripte", "assistant", "son", "acteur"] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export function buildFicheTournage(
  role: RoleKey,
  scenes: SceneInput[],
  storyboardScenes: StoryboardScene[],
  scenario: ScenarioInput | null,
): FicheTournage {
  switch (role) {
    case "realisateur":
      return buildRealisateur(scenes, storyboardScenes, scenario);
    case "cadreur":
      return buildCadreur(storyboardScenes);
    case "scripte":
      return buildScripte(scenes);
    case "assistant":
      return buildAssistant(scenes);
    case "son":
      return buildSon(scenes, scenario);
    case "acteur":
      return buildActeur(scenes, scenario);
  }
}

function buildRealisateur(
  scenes: SceneInput[],
  storyboard: StoryboardScene[],
  scenario: ScenarioInput | null,
): FicheTournage {
  const sections: FicheSection[] = [];
  if (scenario?.fullText) {
    sections.push({
      heading: "Résumé du scénario",
      content: scenario.fullText.slice(0, 500) + (scenario.fullText.length > 500 ? "…" : ""),
    });
  }
  for (const scene of scenes) {
    const sb = storyboard.find((s) => s.title === scene.title);
    const plans =
      sb?.plans.map((p) => `  • ${PLAN_LABELS[p.planType] || p.planType} — ${p.description}`).join("\n") ||
      "  (pas encore découpé)";
    sections.push({
      heading: `Scène ${scene.sceneNumber || ""} : ${scene.title}`,
      content: `${scene.description}\n\nPlans prévus :\n${plans}`,
    });
  }
  return { title: "Fiche Réalisateur", emoji: "🎬", sections };
}

function buildCadreur(storyboard: StoryboardScene[]): FicheTournage {
  const sections: FicheSection[] = [];
  for (const scene of storyboard) {
    const lines = scene.plans
      .map(
        (p) =>
          `  ${p.position}. ${PLAN_LABELS[p.planType] || p.planType} — ${p.description}${p.intention ? ` (${p.intention})` : ""}`,
      )
      .join("\n");
    sections.push({ heading: scene.title, content: lines || "(aucun plan)" });
  }
  return { title: "Fiche Cadreur", emoji: "📷", sections };
}

function buildScripte(scenes: SceneInput[]): FicheTournage {
  const sections: FicheSection[] = scenes.map((s) => ({
    heading: `Scène ${s.sceneNumber || ""} : ${s.title}`,
    content: `Lieu : (à compléter)\nPersonnages : (à compléter)\nAccessoires : (à compléter)\nDescription : ${s.description}`,
  }));
  return { title: "Fiche Scripte", emoji: "📋", sections };
}

function buildAssistant(scenes: SceneInput[]): FicheTournage {
  const sections: FicheSection[] = scenes.map((s, i) => ({
    heading: `${i + 1}. Scène ${s.sceneNumber || ""} : ${s.title}`,
    content: `Acte : ${s.act}\nDurée estimée : (à compléter)\nNotes : ${s.description}`,
  }));
  return { title: "Fiche Assistant réal", emoji: "📝", sections };
}

function buildSon(scenes: SceneInput[], _scenario: ScenarioInput | null): FicheTournage {
  const sections: FicheSection[] = [];
  for (const scene of scenes) {
    // Extract dialogue lines (lines starting with character names in CAPS or with —)
    const content = scene.content || "";
    const dialogueLines = content
      .split("\n")
      .filter((l) => /^[A-ZÉÈÊÀÂÔÎÙ].*:/.test(l.trim()) || l.trim().startsWith("—"))
      .join("\n");
    sections.push({
      heading: `Scène ${scene.sceneNumber || ""} : ${scene.title}`,
      content: dialogueLines || "(pas de dialogues écrits)\nAmbiance : (à compléter)",
    });
  }
  return { title: "Fiche Son", emoji: "🎙️", sections };
}

function buildActeur(scenes: SceneInput[], _scenario: ScenarioInput | null): FicheTournage {
  const sections: FicheSection[] = scenes.map((s) => ({
    heading: `Scène ${s.sceneNumber || ""} : ${s.title}`,
    content: `${s.description}\n\nTexte :\n${s.content || "(pas encore écrit)"}\n\nNotes d'interprétation : (à compléter)`,
  }));
  return { title: "Fiche Acteur", emoji: "🎭", sections };
}
