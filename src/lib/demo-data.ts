// Demo mode — virtual students and sample responses for facilitator testing

export interface DemoStudent {
  displayName: string;
  avatar: string;
}

export const DEMO_STUDENTS: DemoStudent[] = [
  { displayName: "Léa", avatar: "🎭" },
  { displayName: "Karim", avatar: "🎬" },
  { displayName: "Emma", avatar: "⭐" },
  { displayName: "Malik", avatar: "🎪" },
  { displayName: "Chloé", avatar: "🌟" },
];

/** Display names used to identify demo students for cleanup */
export const DEMO_STUDENT_NAMES = DEMO_STUDENTS.map((s) => s.displayName);

/**
 * Sample responses per category — realistic kid-level answers in French.
 * Each category has 4-5 responses so multiple virtual students get different ones.
 */
const DEMO_RESPONSES: Record<string, string[]> = {
  // Module 3 — L'Histoire
  personnage: [
    "Un ado qui cache un secret depuis des années",
    "Une prof qui était une espionne avant d'enseigner",
    "Un chat qui parle mais personne le croit",
    "Une fille timide qui a un super pouvoir qu'elle contrôle pas",
    "Un grand-père qui retrouve une lettre mystérieuse de sa jeunesse",
  ],
  conflit: [
    "Il doit choisir entre ses amis et sa famille",
    "Elle découvre que son meilleur ami lui ment depuis le début",
    "Deux bandes du quartier veulent le même terrain pour jouer",
    "Le héros doit sauver quelqu'un mais il a peur du noir",
    "Elle doit dénoncer son frère pour protéger un innocent",
  ],
  environnement: [
    "Un collège la nuit, quand tout le monde est parti",
    "Le toit d'un immeuble avec vue sur toute la ville",
    "Une cité abandonnée où la nature a tout repris",
    "Un marché couvert plein de couleurs et de bruit",
    "La cave d'un immeuble avec des graffitis partout",
  ],
  liens: [
    "Ils se connaissent depuis la maternelle et partagent tout",
    "Elle est jalouse de sa sœur qui réussit tout",
    "Le héros et son rival deviennent amis grâce à un événement",
    "C'est son voisin, ils se parlent que par la fenêtre",
    "Ils sont inséparables mais un déménagement va tout changer",
  ],
  trajectoire: [
    "Au début il est timide, à la fin il ose parler devant tout le monde",
    "Elle part confiante et revient blessée mais plus forte",
    "Il commence égoïste et apprend à penser aux autres",
    "Au début elle fait semblant d'être forte, à la fin elle accepte d'être fragile",
    "Il passe de suiveur à leader de son groupe",
  ],
  intention: [
    "Je veux montrer que la vérité fait mal mais libère",
    "Mon film parle du courage de dire non aux copains",
    "C'est une histoire sur le pouvoir de l'imagination",
    "Je veux que les gens réfléchissent au harcèlement",
    "Mon message c'est que la différence est une force",
  ],
  renforcement: [
    "La musique change quand le personnage comprend la vérité",
    "On revoit la même scène mais du point de vue de l'autre",
    "Un objet (un bracelet) revient à chaque moment important",
    "Le silence remplace la musique pour montrer le choc",
    "Les couleurs passent du gris au coloré quand il retrouve espoir",
  ],

  // Module 1 — Confiance + Diagnostic
  positionnement: [
    "Je me sens plutôt confiant pour créer un film",
    "J'ai un peu peur mais ça m'excite en même temps",
    "Je suis motivé, j'ai plein d'idées dans la tête",
    "C'est nouveau pour moi, mais je veux essayer",
    "Je suis prêt à tout donner pour cette aventure",
  ],
  image: [
    "Je vois une personne seule dans une grande ville",
    "Ça me fait penser à un rêve où tout est possible",
    "Cette image me rend un peu triste mais aussi curieux",
    "On dirait un moment juste avant que quelque chose se passe",
    "Ça raconte une histoire de liberté et de solitude",
  ],
  carnet: [
    "Je retiens que chaque image raconte une histoire différente selon qui la regarde",
    "J'ai appris que mes émotions peuvent guider mes choix artistiques",
    "Le plus important c'est d'oser voir les choses autrement",
    "Mon regard est unique et c'est ça qui compte",
    "Les images parlent même sans mots, c'est puissant",
  ],

  // Module 9 — Cinéma / Production
  metiers: [
    "Le réalisateur c'est celui qui décide de tout comme un chef d'orchestre",
    "Le cadreur choisit ce qu'on voit et ce qu'on cache",
    "Le monteur assemble les morceaux comme un puzzle",
    "Le décorateur crée l'ambiance et le lieu de l'histoire",
    "Le producteur gère l'argent et organise tout le tournage",
  ],
  budget: [
    "On devrait dépenser plus pour les décors, c'est ce qui rend le film réel",
    "Les acteurs c'est le plus important, sans eux pas d'émotion",
    "Il faut garder de l'argent pour les imprévus",
    "La technique c'est ce qui fait la différence entre amateur et pro",
    "Le son compte autant que l'image pour faire ressentir les choses",
  ],
  contrainte: [
    "On peut tourner dans la cour du collège, c'est gratuit et ça fait vrai",
    "Avec un seul téléphone on peut faire un plan-séquence incroyable",
    "Le manque de moyens nous force à être plus créatifs",
    "On peut utiliser la lumière naturelle au lieu d'acheter des lampes",
    "Les contraintes c'est ce qui rend le film unique et original",
  ],
  resolution: [
    "On s'adapte et on change le scénario pour que ça marche",
    "On demande de l'aide aux autres groupes pour résoudre le problème",
    "On fait avec ce qu'on a et on transforme le problème en idée",
    "On prend du recul et on réfléchit ensemble avant d'agir",
    "Le plan B est parfois meilleur que le plan A",
  ],
  organisation: [
    "Chacun a un rôle précis et on se fait confiance",
    "On fait un planning avec les étapes importantes",
    "On se réunit chaque matin pour faire le point",
    "Le chef d'équipe coordonne mais tout le monde a son mot à dire",
    "On note tout dans un carnet pour pas oublier les idées",
  ],

  // Module 2 — Émotion Cachée
  emotion_cachee: [
    "Je ressens de la joie mélangée avec de la nostalgie",
    "C'est comme de la colère mais en dessous il y a de la peur",
    "L'émotion cachée c'est la honte, il ose pas le montrer",
    "Derrière son sourire il y a une tristesse profonde",
    "Elle fait la forte mais en vrai elle est terrifiée",
  ],

  // Module 10 — Et si / Pitch
  imagination: [
    "Et si les rêves devenaient réalité pendant une journée ?",
    "Et si on pouvait entendre les pensées des autres ?",
    "Et si le collège se transformait en labyrinthe la nuit ?",
    "Et si un graffiti prenait vie et guidait les élèves ?",
    "Et si on avait le pouvoir de remonter le temps de 5 minutes ?",
  ],
  pitch: [
    "C'est l'histoire d'un ado qui découvre un passage secret dans son collège qui mène à un monde parallèle",
    "Une bande de potes doit résoudre un mystère avant la fin de l'année scolaire",
    "Une fille trouve un vieux téléphone qui envoie des messages du futur",
    "Trois élèves se retrouvent enfermés dans le collège et découvrent ses secrets",
    "Un garçon timide découvre qu'il peut influencer les gens en dessinant",
  ],

  // Ciné-Débat (Module 11)
  analyse: [
    "Le réalisateur utilise des gros plans pour montrer l'émotion",
    "La musique change complètement l'ambiance de la scène",
    "Le silence est plus fort que n'importe quel dialogue ici",
    "Le cadrage montre que le personnage se sent piégé",
    "Les couleurs froides renforcent la solitude du héros",
  ],
};

/**
 * Get a random demo response for a given category.
 * Falls back to a generic response if the category has no specific entries.
 */
export function getDemoResponse(category: string): string {
  const responses = DEMO_RESPONSES[category];
  if (responses && responses.length > 0) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
  // Fallback for unknown categories
  return "C'est une super question, j'ai plein d'idées !";
}

/**
 * Get a unique demo response for each student (no duplicates within one batch).
 * Falls back to getDemoResponse if not enough unique responses.
 */
export function getDemoResponsesForStudents(
  category: string,
  count: number
): string[] {
  const responses = DEMO_RESPONSES[category];
  if (!responses || responses.length === 0) {
    return Array.from({ length: count }, () => getDemoResponse(category));
  }

  // Shuffle and take `count` responses
  const shuffled = [...responses].sort(() => Math.random() - 0.5);
  return Array.from({ length: count }, (_, i) => shuffled[i % shuffled.length]);
}
