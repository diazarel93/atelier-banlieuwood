/**
 * Séance intro slides — displayed on the projector when a module is selected
 * but before the first question is opened. Gives students context about what
 * they're about to do.
 */

export interface SeanceIntro {
  /** dbModule + seance key, e.g. "1-1", "10-2" */
  key: string;
  title: string;
  subtitle: string;
  /** Activity type badge */
  activityType: string;
  /** Short description visible to students */
  description: string;
  /** Steps of the game */
  steps: string[];
  /** Color (hex) */
  color: string;
  /** Emoji icon */
  icon: string;
  /** Duration label */
  duration: string;
}

export const SEANCE_INTROS: SeanceIntro[] = [
  // ── MODULE 1 — L'IDÉE ──
  {
    key: "1-1",
    title: "Positionnement",
    subtitle: "L'Idée",
    activityType: "QCM · Choix rapides",
    description: "8 questions pour découvrir votre profil créatif. Il n'y a pas de bonne réponse !",
    steps: ["Lire la question", "Choisir votre réponse", "Voir les résultats de la classe", "Discuter"],
    color: "#8B5CF6",
    icon: "📊",
    duration: "10 min",
  },
  {
    key: "1-2",
    title: "Image 1 — La rue",
    subtitle: "L'Idée",
    activityType: "Observation · Rédaction",
    description: "Une image va apparaître. Observez-la bien, puis écrivez ce qu'elle vous inspire.",
    steps: ["Observer l'image en silence", "Écrire votre interprétation", "2 textes seront projetés", "Débat oral"],
    color: "#8B5CF6",
    icon: "🖼️",
    duration: "15 min",
  },
  {
    key: "1-3",
    title: "Image 2 — L'intérieur",
    subtitle: "L'Idée",
    activityType: "Observation · Rédaction",
    description: "Deuxième image, nouveau regard. Qu'est-ce que cette scène vous raconte ?",
    steps: ["Observer l'image", "Écrire votre vision", "Confrontation de 2 réponses", "Discussion"],
    color: "#8B5CF6",
    icon: "🖼️",
    duration: "15 min",
  },
  {
    key: "1-4",
    title: "Image 3 — Le banc",
    subtitle: "L'Idée",
    activityType: "Observation · Rédaction",
    description: "Dernière image. Laissez parler votre imagination.",
    steps: ["Observer", "Écrire", "Confrontation", "Transition vers le carnet"],
    color: "#8B5CF6",
    icon: "🖼️",
    duration: "10 min",
  },
  {
    key: "1-5",
    title: "Carnet d'idées",
    subtitle: "L'Idée",
    activityType: "Écriture libre",
    description: "Notez toutes vos idées de film : personnages, lieux, situations, émotions. Pas de limite !",
    steps: ["Repensez à tout ce qu'on a vu", "Écrivez librement", "Pas besoin d'une idée parfaite", "Soumettez votre carnet"],
    color: "#8B5CF6",
    icon: "📓",
    duration: "10 min",
  },

  // ── MODULE 2 — ÉMOTION CACHÉE ──
  {
    key: "2-1",
    title: "Mise en bain",
    subtitle: "Émotion Cachée",
    activityType: "Sélection · Réflexion",
    description: "Vos films, séries et anime préférés. On découvre les goûts de la classe !",
    steps: ["Sélectionner vos contenus favoris", "Décrire une scène marquante", "Identifier l'émotion cachée"],
    color: "#EC4899",
    icon: "🎬",
    duration: "20 min",
  },
  {
    key: "2-2",
    title: "Émotion Cachée",
    subtitle: "Émotion Cachée",
    activityType: "Création · Jeu de construction",
    description: "Choisissez une émotion et construisez une scène de film avec des jetons et des contraintes.",
    steps: ["Choisir une émotion", "Construire votre scène avec des jetons", "L'IA vous donne un retour", "Soumettez votre scène"],
    color: "#EC4899",
    icon: "🎭",
    duration: "25 min",
  },
  {
    key: "2-3",
    title: "Phase Collective",
    subtitle: "Émotion Cachée",
    activityType: "Débat · Confrontation",
    description: "Deux scènes anonymes face à face. Laquelle transmet le mieux son émotion ?",
    steps: ["Observer les 2 scènes projetées", "Analyser les différences", "Débat oral", "Vote collectif"],
    color: "#EC4899",
    icon: "⚔️",
    duration: "20 min",
  },
  {
    key: "2-4",
    title: "Clôture",
    subtitle: "Émotion Cachée",
    activityType: "Réflexion · Bilan",
    description: "Nommer le thème et l'arc du personnage. Qu'avez-vous appris sur les émotions au cinéma ?",
    steps: ["Identifier le thème principal", "Définir l'arc du personnage", "Bilan collectif"],
    color: "#EC4899",
    icon: "⭐",
    duration: "15 min",
  },

  // ── MODULE 10 — IMAGINATION ──
  {
    key: "10-1",
    title: "Et si...",
    subtitle: "Imagination",
    activityType: "Imagination · Rédaction",
    description: "Une image, une question : « Et si cette scène était le début d'un film ? ». Libérez votre imagination !",
    steps: ["Observer l'image projetée", "Écrire votre « Et si... »", "Répondre au QCM narratif", "Partager dans la banque d'idées"],
    color: "#06B6D4",
    icon: "✨",
    duration: "25 min",
  },
  {
    key: "10-2",
    title: "Pitch",
    subtitle: "Imagination",
    activityType: "Création · Oral",
    description: "Créez votre personnage, définissez son objectif, et pitchez l'histoire en 30 secondes !",
    steps: ["Créer un personnage (avatar)", "Choisir objectif + obstacle", "Assembler le pitch", "Test chrono 30 secondes", "Confrontation + vote"],
    color: "#06B6D4",
    icon: "🎤",
    duration: "30 min",
  },

  // ── MODULE 9 — CINÉMA (old M2) ──
  {
    key: "9-1",
    title: "Le Cinéma",
    subtitle: "Cinéma & Production",
    activityType: "QCM · Culture ciné",
    description: "Comment on fait un film ? Les métiers, les coûts, les contraintes.",
    steps: ["Répondre aux questions", "Découvrir les métiers du cinéma", "Comprendre la production", "Discussion"],
    color: "#FF6B35",
    icon: "🎥",
    duration: "20 min",
  },
  {
    key: "9-2",
    title: "Les Choix",
    subtitle: "Cinéma & Production",
    activityType: "Simulation · Budget",
    description: "Vous avez un budget limité. Comment le répartir pour produire votre film ?",
    steps: ["Découvrir les postes de production", "Répartir votre budget", "Voir la moyenne de la classe", "Débattre des choix"],
    color: "#FF6B35",
    icon: "💰",
    duration: "20 min",
  },
  {
    key: "9-3",
    title: "Les Imprévus",
    subtitle: "Cinéma & Production",
    activityType: "QCM · Réflexion",
    description: "Le tournage ne se passe jamais comme prévu. Comment réagir face aux imprévus ?",
    steps: ["Lire le scénario d'imprévu", "Choisir votre réaction", "Voir les résultats", "Analyser les conséquences"],
    color: "#FF6B35",
    icon: "⚡",
    duration: "20 min",
  },
  {
    key: "9-4",
    title: "Le Plan",
    subtitle: "Cinéma & Production",
    activityType: "QCM · Stratégie",
    description: "Du story-board au montage final. Les étapes clés de la production.",
    steps: ["Répondre aux questions de production", "Comprendre le processus créatif", "Faire les bons choix", "Bilan"],
    color: "#FF6B35",
    icon: "📋",
    duration: "20 min",
  },

  // ── MODULE 11 — CINÉ-DÉBAT ──
  {
    key: "11-1",
    title: "L'Art de Raconter",
    subtitle: "Ciné-Débat",
    activityType: "Débat · Analyse filmique",
    description: "Citations, affiches, scènes : découvrez comment les grands réalisateurs racontent une histoire.",
    steps: ["Observer le stimulus (citation, affiche ou scène)", "Lire la question d'analyse", "Répondre ou débattre", "Confronter les réponses de la classe"],
    color: "#E11D48",
    icon: "📽️",
    duration: "25 min",
  },
  {
    key: "11-2",
    title: "Émotions à l'Écran",
    subtitle: "Ciné-Débat",
    activityType: "Débat · Émotion",
    description: "Pourquoi cette scène fait pleurer ? Les mécanismes de l'émotion au cinéma.",
    steps: ["Regarder la scène ou lire la citation", "Décrypter les mécanismes émotionnels", "Répondre ou voter", "Débattre en classe"],
    color: "#E11D48",
    icon: "🎭",
    duration: "25 min",
  },
  {
    key: "11-3",
    title: "Héros & Anti-Héros",
    subtitle: "Ciné-Débat",
    activityType: "Débat · Personnages",
    description: "Sacrifice, pardon, trahison. Qu'est-ce qui fait un vrai héros ? Et un bon méchant ?",
    steps: ["Analyser le personnage présenté", "Prendre position (héros ou anti-héros ?)", "Argumenter votre choix", "Débat collectif + vote"],
    color: "#E11D48",
    icon: "🦸",
    duration: "25 min",
  },
  {
    key: "11-4",
    title: "Les Coulisses",
    subtitle: "Ciné-Débat",
    activityType: "Débat · Production",
    description: "Budget, cascades, IA, montage. Les secrets de fabrication du cinéma.",
    steps: ["Découvrir les coulisses présentées", "Réfléchir à la question posée", "Répondre ou voter", "Discussion finale"],
    color: "#E11D48",
    icon: "🎬",
    duration: "25 min",
  },

  // ── MODULE 3 — LE HÉROS ──
  {
    key: "3-1",
    title: "C'est l'histoire de qui ?",
    subtitle: "Le Héros",
    activityType: "QCM · Réflexion",
    description: "Qui est le héros ? Quelles sont ses qualités, ses défauts, ses motivations ?",
    steps: ["Répondre aux questions", "Discuter en classe", "Voter pour les meilleures réponses", "Construire le portrait du héros"],
    color: "#FF6B35",
    icon: "🦸",
    duration: "25 min",
  },
  {
    key: "3-2",
    title: "Il se passe quoi ?",
    subtitle: "Le Héros",
    activityType: "QCM · Analyse narrative",
    description: "Le conflit, les rebondissements, les enjeux. Qu'est-ce qui fait avancer l'histoire ?",
    steps: ["Analyser les situations", "Identifier les conflits", "Proposer des solutions", "Débattre des choix narratifs"],
    color: "#FF6B35",
    icon: "💥",
    duration: "25 min",
  },
  {
    key: "3-3",
    title: "Ça raconte quoi en vrai ?",
    subtitle: "Le Héros",
    activityType: "QCM · Sens profond",
    description: "Au-delà de l'histoire, quel est le message ? Le thème ? La morale ?",
    steps: ["Chercher le sens caché", "Formuler le thème", "Voter pour la meilleure formulation", "Synthèse collective"],
    color: "#FF6B35",
    icon: "🔍",
    duration: "20 min",
  },

  // ── MODULE 4 — VIS MA VIE ──
  {
    key: "4-1",
    title: "Vis ma vie",
    subtitle: "Empathie",
    activityType: "QCM · Mise en situation",
    description: "Se mettre à la place de quelqu'un d'autre. Comprendre un autre point de vue.",
    steps: ["Lire la situation", "Se mettre dans la peau du personnage", "Choisir une réaction", "Expliquer son choix"],
    color: "#D4A843",
    icon: "🎭",
    duration: "25 min",
  },
];

/**
 * Get the intro slide for a given module + séance
 */
export function getSeanceIntro(dbModule: number, seance: number): SeanceIntro | undefined {
  return SEANCE_INTROS.find((s) => s.key === `${dbModule}-${seance}`);
}
