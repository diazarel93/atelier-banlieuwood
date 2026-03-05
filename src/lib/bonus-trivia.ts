// ——— Bonus trivia mini-quiz for fast students waiting for others ———

export interface BonusQuestion {
  question: string;
  options: string[];
  correct: number; // index of correct option
  explanation: string;
  category: "histoire" | "technique" | "metier" | "culture";
}

export const BONUS_TRIVIA: BonusQuestion[] = [
  // — Histoire du cinéma —
  {
    question: "Quel est le premier film de fiction de l'histoire ?",
    options: ["La Sortie de l'usine", "Le Voyage dans la Lune", "L'Arroseur arrosé", "Nosferatu"],
    correct: 2,
    explanation: "L'Arroseur arrosé (1895) des frères Lumière est le premier film comique et narratif.",
    category: "histoire",
  },
  {
    question: "En quelle année le cinéma parlant est-il apparu ?",
    options: ["1917", "1927", "1937", "1907"],
    correct: 1,
    explanation: "Le Chanteur de jazz (1927) est considéré comme le premier film parlant.",
    category: "histoire",
  },
  {
    question: "Qui a réalisé 'Le Voyage dans la Lune' (1902) ?",
    options: ["Auguste Lumière", "Georges Méliès", "Charlie Chaplin", "D.W. Griffith"],
    correct: 1,
    explanation: "Georges Méliès, magicien devenu cinéaste, est le père des effets spéciaux.",
    category: "histoire",
  },
  {
    question: "Quel film Disney est le premier long-métrage d'animation ?",
    options: ["Pinocchio", "Fantasia", "Blanche-Neige", "Bambi"],
    correct: 2,
    explanation: "Blanche-Neige et les Sept Nains (1937) fut un pari risqué qui a révolutionné l'animation.",
    category: "histoire",
  },
  {
    question: "Le Néoréalisme italien est né après...",
    options: ["La Première Guerre", "La Seconde Guerre", "Mai 68", "La guerre froide"],
    correct: 1,
    explanation: "Le néoréalisme (Rossellini, De Sica) filmait la réalité brute de l'Italie d'après-guerre.",
    category: "histoire",
  },

  // — Technique —
  {
    question: "Que signifie un plan en 'plongée' ?",
    options: ["La caméra est sous l'eau", "La caméra filme de haut en bas", "La caméra fait un zoom", "La caméra tourne sur elle-même"],
    correct: 1,
    explanation: "La plongée écrase le sujet, suggérant la vulnérabilité ou la domination.",
    category: "technique",
  },
  {
    question: "Qu'est-ce qu'un 'travelling' au cinéma ?",
    options: ["Un plan fixe", "Un déplacement de la caméra", "Un effet sonore", "Un type de montage"],
    correct: 1,
    explanation: "Le travelling déplace la caméra pour suivre un sujet ou révéler un espace.",
    category: "technique",
  },
  {
    question: "La 'profondeur de champ' fait référence à...",
    options: ["La longueur d'un plan", "La zone de netteté de l'image", "L'éclairage de la scène", "Le nombre de personnages"],
    correct: 1,
    explanation: "Une grande profondeur de champ garde tout net, une faible isole le sujet.",
    category: "technique",
  },
  {
    question: "Qu'est-ce que le 'champ / contre-champ' ?",
    options: ["Filmer un paysage", "Alterner entre deux personnages qui se parlent", "Un plan large suivi d'un gros plan", "Filmer dehors puis dedans"],
    correct: 1,
    explanation: "Le champ/contre-champ est la base du dialogue filmé : on voit tour à tour chaque interlocuteur.",
    category: "technique",
  },
  {
    question: "Le 'plan-séquence' est un plan...",
    options: ["Très court (< 2s)", "Sans coupure de montage", "Tourné de nuit", "Filmé au ralenti"],
    correct: 1,
    explanation: "Un plan-séquence filme une scène entière en continu, sans montage.",
    category: "technique",
  },
  {
    question: "Que fait un 'jump cut' ?",
    options: ["Il zoome brusquement", "Il coupe un plan pour créer un saut temporel", "Il change la couleur", "Il inverse l'image"],
    correct: 1,
    explanation: "Le jump cut crée une ellipse brutale, popularisé par Godard dans À bout de souffle.",
    category: "technique",
  },

  // — Métiers du cinéma —
  {
    question: "Que fait le/la 'scripte' sur un tournage ?",
    options: ["Écrit le scénario", "Vérifie la continuité entre les plans", "Dirige les acteurs", "Gère le budget"],
    correct: 1,
    explanation: "Le/la scripte veille à ce que les raccords (vêtements, gestes, lumière) soient cohérents entre les prises.",
    category: "metier",
  },
  {
    question: "Le directeur de la photographie est responsable de...",
    options: ["Les photos de promotion", "L'image, la lumière et le cadrage", "Le montage final", "Le casting"],
    correct: 1,
    explanation: "Le DP (ou chef opérateur) crée l'atmosphère visuelle du film avec la lumière et les objectifs.",
    category: "metier",
  },
  {
    question: "Quel rôle joue le 'perchiste' ?",
    options: ["Il porte la caméra", "Il tient le micro-perche au-dessus des acteurs", "Il construit les décors", "Il gère les cascades"],
    correct: 1,
    explanation: "Le perchiste capture le son en direct en suivant les acteurs sans entrer dans le cadre.",
    category: "metier",
  },
  {
    question: "Que fait un 'color grader' (étalonneur) ?",
    options: ["Il peint les décors", "Il ajuste les couleurs du film en post-production", "Il choisit les costumes", "Il écrit la musique"],
    correct: 1,
    explanation: "L'étalonnage donne au film son identité visuelle finale (tons chauds, froids, contrastés...).",
    category: "metier",
  },

  // — Culture pop —
  {
    question: "Quel film détient le record du plus gros budget ?",
    options: ["Avatar 2", "Avengers: Endgame", "Pirates des Caraïbes 4", "Star Wars IX"],
    correct: 0,
    explanation: "Avatar : La Voie de l'eau (2022) a coûté environ 460 millions de dollars.",
    category: "culture",
  },
  {
    question: "La Nouvelle Vague est un mouvement cinématographique...",
    options: ["Américain des années 80", "Français des années 60", "Japonais des années 50", "Coréen des années 2000"],
    correct: 1,
    explanation: "La Nouvelle Vague (Godard, Truffaut, Varda) a révolutionné le cinéma français dans les années 60.",
    category: "culture",
  },
  {
    question: "Combien d'images par seconde pour un film standard ?",
    options: ["12 images", "24 images", "48 images", "60 images"],
    correct: 1,
    explanation: "24 images/seconde est le standard depuis les années 1920. Le cerveau les perçoit comme du mouvement fluide.",
    category: "culture",
  },
  {
    question: "Le Festival de Cannes récompense avec...",
    options: ["L'Oscar d'or", "Le Lion d'or", "La Palme d'or", "L'Ours d'or"],
    correct: 2,
    explanation: "La Palme d'or est le prix suprême de Cannes. Le Lion d'or est à Venise, l'Ours d'or à Berlin.",
    category: "culture",
  },
  {
    question: "Qui est considéré comme le 'Maître du suspense' ?",
    options: ["Martin Scorsese", "Steven Spielberg", "Alfred Hitchcock", "David Lynch"],
    correct: 2,
    explanation: "Hitchcock a défini le suspense au cinéma avec Psychose, Vertigo, Les Oiseaux...",
    category: "culture",
  },
];

/** Pick N random bonus questions, ensuring no repeats */
export function pickBonusQuestions(count: number, exclude: number[] = []): number[] {
  const available = BONUS_TRIVIA.map((_, i) => i).filter((i) => !exclude.includes(i));
  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
