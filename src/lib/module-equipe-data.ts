// ============================================================
// MODULE 8 — L'Équipe du Film (stub)
// Fiches métier, quiz, points, choix de rôle, veto Banlieuwood.
// ============================================================

export interface FicheMetier {
  key: string;
  label: string;
  description: string;
  skills: string[];
}

export const FICHES_METIER: FicheMetier[] = [
  {
    key: "realisateur",
    label: "Réalisateur·rice",
    description: "Dirige les acteurs et décide de la mise en scène",
    skills: ["Leadership", "Vision artistique", "Communication"],
  },
  {
    key: "scenariste",
    label: "Scénariste",
    description: "Écrit l'histoire, les dialogues et les didascalies",
    skills: ["Écriture", "Créativité", "Structure narrative"],
  },
  {
    key: "cameraman",
    label: "Cadreur·se",
    description: "Filme les scènes selon les indications du réalisateur",
    skills: ["Technique", "Stabilité", "Sens du cadre"],
  },
  {
    key: "acteur",
    label: "Acteur·rice",
    description: "Interprète un personnage devant la caméra",
    skills: ["Expression", "Mémorisation", "Émotion"],
  },
  {
    key: "monteur",
    label: "Monteur·se",
    description: "Assemble les plans pour raconter l'histoire",
    skills: ["Rythme", "Technique", "Patience"],
  },
  {
    key: "son",
    label: "Ingénieur·e son",
    description: "Gère le son : voix, musique, bruitages",
    skills: ["Oreille musicale", "Technique", "Discrétion"],
  },
  {
    key: "decorateur",
    label: "Décorateur·rice",
    description: "Crée et aménage les décors et accessoires",
    skills: ["Créativité manuelle", "Organisation", "Sens du détail"],
  },
  {
    key: "producteur",
    label: "Producteur·rice",
    description: "Organise, planifie et s'assure que tout avance",
    skills: ["Organisation", "Gestion du temps", "Résolution de problèmes"],
  },
];

// Placeholder — full implementation pending Adrian's detailed specs
