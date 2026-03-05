// ============================================================
// MODULE 7 — Filmer une Scène (stub)
// Tutoriel plans caméra, découpage technique.
// ============================================================

export interface PlanCamera {
  key: string;
  label: string;
  description: string;
  example: string;
}

export const PLANS_CAMERA: PlanCamera[] = [
  { key: "plan-large", label: "Plan large", description: "Montre tout le décor, situe l'action", example: "La cour de l'école vue de loin" },
  { key: "plan-moyen", label: "Plan moyen", description: "Personnage en pied ou à mi-corps", example: "Deux élèves qui discutent dans un couloir" },
  { key: "plan-rapproche", label: "Plan rapproché", description: "Visage et épaules, montre les émotions", example: "Le visage surpris d'un personnage" },
  { key: "gros-plan", label: "Gros plan", description: "Un détail important, un objet, une main", example: "Un téléphone qui affiche un message" },
  { key: "plongee", label: "Plongée", description: "Caméra au-dessus, le personnage paraît petit", example: "Vu d'en haut, le personnage est seul dans la cour" },
  { key: "contre-plongee", label: "Contre-plongée", description: "Caméra en-dessous, le personnage paraît grand", example: "Le prof vu d'en bas, imposant" },
];

export const VOCABULAIRE_TECHNIQUE = [
  { key: "sequence", label: "Séquence", definition: "Un ensemble de plans qui racontent une action complète" },
  { key: "raccord", label: "Raccord", definition: "Le lien visuel entre deux plans pour que ça reste fluide" },
  { key: "champ-contrechamp", label: "Champ/Contre-champ", definition: "Alterner entre deux personnages qui se parlent" },
  { key: "travelling", label: "Travelling", definition: "La caméra se déplace pour suivre un personnage" },
  { key: "panoramique", label: "Panoramique", definition: "La caméra tourne sur place pour balayer le décor" },
] as const;

// Placeholder — full implementation pending Adrian's detailed specs
