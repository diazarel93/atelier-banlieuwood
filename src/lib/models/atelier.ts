import { z } from "zod";

// ── Enums ────────────────────────────────────────────────────────

export const AtelierLevelSchema = z.enum([
  "primaire",
  "college",
  "lycee",
  "fac",
]);

export type AtelierLevel = z.infer<typeof AtelierLevelSchema>;

export const AtelierChapterStatusSchema = z.enum([
  "locked",
  "unlocked",
  "in-progress",
  "completed",
]);

export type AtelierChapterStatus = z.infer<typeof AtelierChapterStatusSchema>;

export const CHAPTER_IDS = [
  "idea",
  "hero",
  "adversary",
  "world",
  "links",
  "conflict",
  "journey",
] as const;

export type ChapterId = (typeof CHAPTER_IDS)[number];

export const CHAPTER_META: Record<
  ChapterId,
  {
    label: string;
    questionCount: number;
    icon: string;
    description: string;
  }
> = {
  idea: {
    label: "L'Idee",
    questionCount: 5,
    icon: "💡",
    description: "Le point de depart : genre, pitch, theme et message de ton film.",
  },
  hero: {
    label: "Le Heros",
    questionCount: 8,
    icon: "🦸",
    description: "Ton protagoniste en profondeur : identite, psychologie, voix, quotidien.",
  },
  adversary: {
    label: "L'Adversaire",
    questionCount: 7,
    icon: "🎭",
    description: "L'antagoniste : aussi profond que le heros, avec ses propres raisons.",
  },
  world: {
    label: "Le Monde",
    questionCount: 6,
    icon: "🌍",
    description: "L'univers de ton histoire : lieux, epoque, regles, atmosphere.",
  },
  links: {
    label: "Les Liens",
    questionCount: 5,
    icon: "🔗",
    description: "Les relations entre personnages : pouvoir, confiance, tension.",
  },
  conflict: {
    label: "Le Conflit",
    questionCount: 5,
    icon: "⚡",
    description: "Le moteur de l'histoire : declencheur, enjeux, escalade.",
  },
  journey: {
    label: "Le Voyage",
    questionCount: 5,
    icon: "🗺️",
    description: "L'arc narratif complet : situation initiale, epreuves, transformation.",
  },
};

export const LEVEL_LABELS: Record<AtelierLevel, string> = {
  primaire: "Primaire",
  college: "College",
  lycee: "Lycee",
  fac: "Fac+",
};

export const LEVEL_DESCRIPTIONS: Record<AtelierLevel, string> = {
  primaire: "Vocabulaire simple, questions concretes avec des exemples. Ideal pour decouvrir le scenario.",
  college: "Introduction aux termes de narration. Questions qui demandent de la reflexion.",
  lycee: "Vocabulaire technique du scenario. Questions profondes sur la psychologie et la structure.",
  fac: "Jargon professionnel du cinema. Niveau expert avec sous-textes et arcs complexes.",
};

// ── Shared UI constants ──────────────────────────────────────────

export const BADGE_STYLES: Record<string, { bg: string; label: string }> = {
  bronze: { bg: "bg-orange-700/20 text-orange-700 dark:text-orange-400", label: "Bronze" },
  silver: { bg: "bg-gray-400/20 text-gray-600 dark:text-gray-300", label: "Argent" },
  gold: { bg: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400", label: "Or" },
};

export function scoreColor(score: number) {
  if (score >= 3) return "text-green-600 dark:text-green-400";
  if (score >= 2) return "text-blue-600 dark:text-blue-400";
  return "text-orange-600 dark:text-orange-400";
}

export function scoreBg(score: number) {
  if (score >= 3) return "bg-green-500/10 border-green-500/20";
  if (score >= 2) return "bg-blue-500/10 border-blue-500/20";
  return "bg-orange-500/10 border-orange-500/20";
}

export function getScoreLabel(score: number): string {
  if (score >= 3) return "Excellent";
  if (score >= 2) return "Bien";
  if (score >= 1) return "A approfondir";
  return "";
}

// ── Question hints ───────────────────────────────────────────────

export const QUESTION_HINTS: Record<ChapterId, string[]> = {
  idea: [
    "Pense aux films que tu adores. Qu'est-ce qu'ils ont en commun ? Drame, comedie, thriller, horreur, SF, romance...",
    "Le pitch c'est l'histoire en version ultra-courte. Qui fait quoi et pourquoi ? Ex: 'Un jeune cuisinier decouvre que son pere dirige un cartel.'",
    "Le theme c'est l'idee universelle derriere ton histoire : la vengeance, l'amour, la liberte, le pouvoir... Pas l'intrigue, le SENS.",
    "Le message c'est ce que tu veux que les gens pensent apres. Ex: 'L'argent ne fait pas le bonheur' ou 'Se battre pour ses reves vaut toujours le coup'.",
    "Qu'est-ce que TOI tu apportes que personne d'autre ne peut ? Ton vecu, ta culture, ton angle de vue unique.",
  ],
  hero: [
    "Sois precis : pas juste 'un jeune homme', mais 'Karim, 24 ans, livreur Uber Eats qui reve d'etre rappeur'.",
    "L'OBJECTIF c'est ce que le heros dit vouloir : gagner le concours, retrouver sa mere, quitter la cite...",
    "Le BESOIN c'est ce qu'il lui manque vraiment. Souvent l'inverse de sa faille. S'il est egoiste, il a besoin d'apprendre l'empathie.",
    "La faille rend ton personnage HUMAIN. Personne n'est parfait. Ex: orgueil, naivete, peur de l'engagement, colere...",
    "La peur profonde, pas la peur des araignees. La peur d'etre abandonne, de ne pas etre a la hauteur, d'echouer devant sa famille...",
    "Le secret cree du suspense et de la tension. Qu'est-ce qui eclaterait s'il etait revele ?",
    "Comment il parle te dit QUI il est. Argot, soutenu, timide, grande gueule ? Des expressions qu'il repete ?",
    "Montre sa vie AVANT le chaos. Ca cree le contraste avec ce qui va arriver.",
  ],
  adversary: [
    "Le meilleur mechant pense etre le heros de sa propre histoire. Il a des raisons, des blessures.",
    "Comprends SON point de vue. Pourquoi fait-il ce qu'il fait ? Quel est son parcours ?",
    "Son objectif s'oppose directement a celui du heros. Ils veulent souvent la meme chose, ou l'inverse exact.",
    "Un antagoniste sans faille est ennuyeux. Qu'est-ce qui le rend fragile ?",
    "Sa peur explique souvent ses actions les plus extremes.",
    "Le meilleur duo heros-antagoniste partage quelque chose : un passe, un defaut, un objectif. Ca rend le conflit plus fort.",
    "L'antagoniste peut etre un ex-ami, un membre de la famille, un collegue. La proximite rend le conflit plus douloureux.",
  ],
  world: [
    "Sois cinematographique : pas juste 'Paris' mais 'le 93, barres d'immeubles, terrains vagues, kebabs ouverts jusqu'a 3h du mat'.",
    "L'epoque change tout. Les annees 90 sans telephone, 2025 avec les reseaux sociaux, le futur...",
    "Chaque monde a des codes. Qu'est-ce qu'on fait et qu'on ne fait pas ici ? La regle de la rue, de l'entreprise, de la famille...",
    "Ferme les yeux et imagine : quelle lumiere ? Quels bruits ? Quelle temperature ? Quelle couleur domine ?",
    "Les contrastes rendent le monde riche : quartier pauvre vs quartier riche, jour vs nuit, bruit vs silence...",
    "Le monde n'est pas un decor passif. Il force des choix : si tu vis en cite, le regard des autres pese sur chaque decision.",
  ],
  links: [
    "Les personnages secondaires ne sont pas la pour meubler. Chacun a une FONCTION : mentor, allie, rival, miroir...",
    "La relation cle de ton heros revele qui il est vraiment. Avec qui il baisse la garde ?",
    "Le desequilibre de pouvoir cree de la tension : patron/employe, parent/enfant, leader/suiveur...",
    "Une relation brisee par l'histoire, c'est du drame en or. Qui va le trahir ? Qui va-t-il devoir quitter ?",
    "Les relations sont un echo du theme. Si ton theme c'est la confiance, montre des relations ou la confiance est testee.",
  ],
  conflict: [
    "Le declencheur est l'evenement qui OBLIGE le heros a bouger. Sans ca, il resterait dans sa routine.",
    "Les enjeux doivent etre personnels ET eleves. Pas juste de l'argent : sa dignite, sa famille, son ame.",
    "L'escalade : probleme → plus gros probleme → situation impossible. Chaque etape met plus de pression.",
    "Le point le plus bas : le heros a tout perdu, plus rien ne marche. C'est la que se revele qui il est vraiment.",
    "Les meilleurs films melangent les deux. L'action dehors reflete la bataille interieure.",
  ],
  journey: [
    "Le quotidien du heros AVANT. C'est le calme avant la tempete. Le spectateur doit se dire 'je connais cette vie'.",
    "Le moment ou tout bascule. Ca peut etre brutal ou subtil, mais apres ca, rien ne sera comme avant.",
    "Chaque epreuve doit tester un aspect different du heros : sa force, son intelligence, ses valeurs, ses liens.",
    "La transformation c'est la vraie histoire. Le heros de la fin n'est plus celui du debut. Qu'a-t-il compris ?",
    "La fin parfaite repond a la question du theme. Le heros obtient ce dont il avait BESOIN, pas forcement ce qu'il VOULAIT.",
  ],
};

export const TOTAL_QUESTIONS = CHAPTER_IDS.reduce(
  (sum, id) => sum + CHAPTER_META[id].questionCount,
  0
);

// ── Max follow-ups per question ──────────────────────────────────

export const MAX_FOLLOWUPS = 5; // generous: lazy answers get pushed harder
export const MIN_ANSWER_LENGTH = 30; // below this = auto score 1 (a real sentence is 30+ chars)

// ── Zod schemas ──────────────────────────────────────────────────

export const ExchangeSchema = z.object({
  answer: z.string(),
  feedback: z.string(),
  score: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  criteria: z.object({
    pertinence: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    profondeur: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    creativite: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  }).optional(),
  followUp: z.string().nullable().default(null),
  answeredAt: z.string(),
});

export type Exchange = z.infer<typeof ExchangeSchema>;

export const StepProgressSchema = z.object({
  stepId: z.string(),
  question: z.string(),
  answer: z.string().default(""),
  feedback: z.string().default(""),
  score: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  status: z.enum(["pending", "answered", "validated"]),
  answeredAt: z.string().nullable().default(null),
  exchanges: z.array(ExchangeSchema).default([]),
  currentFollowUp: z.string().nullable().default(null),
});

export type StepProgress = z.infer<typeof StepProgressSchema>;

export const ChapterProgressSchema = z.object({
  chapterId: z.string(),
  status: AtelierChapterStatusSchema,
  steps: z.array(StepProgressSchema).default([]),
  totalScore: z.number().default(0),
  maxScore: z.number().default(0),
  badge: z.enum(["bronze", "silver", "gold"]).nullable().default(null),
});

export type ChapterProgress = z.infer<typeof ChapterProgressSchema>;

export const OBJECTIVE_OPTIONS = [
  { id: "tournage", label: "Preparer un tournage", desc: "On va vraiment filmer apres — tout doit etre faisable", icon: "🎥" },
  { id: "ecriture", label: "Ecrire une histoire", desc: "Focus sur le scenario, pas de contraintes de production", icon: "✍️" },
  { id: "idee", label: "Developper une idee", desc: "Explorer un concept, brainstormer librement", icon: "💡" },
] as const;

export type AtelierObjective = (typeof OBJECTIVE_OPTIONS)[number]["id"];

export const GameConfigSchema = z.object({
  objective: z.string().default("tournage"),
  genre: z.string().default(""),
  audience: z.string().default(""),
  protagonist: z.string().default(""),
  theme: z.string().default(""),
  location: z.string().default(""),
  teamSize: z.number().default(1),
  constraints: z.string().default(""),
});

export type GameConfig = z.infer<typeof GameConfigSchema>;

export const GENRE_OPTIONS = [
  "Drame", "Comedie", "Thriller", "Policier", "Romance",
  "Comedie dramatique", "Film social", "Horreur", "Documentaire fiction",
] as const;

export const AUDIENCE_OPTIONS = [
  "Enfants (6-10 ans)",
  "Ados (11-15 ans)",
  "Jeunes adultes (16-25 ans)",
  "Tous publics",
] as const;

export const AtelierSessionSchema = z.object({
  id: z.string(),
  projectSlug: z.string(),
  module: z.literal(1),
  level: AtelierLevelSchema,
  chapters: z.array(ChapterProgressSchema),
  totalScore: z.number().default(0),
  maxScore: z.number().default(0),
  currentChapter: z.string().default("idea"),
  streak: z.number().default(0),
  bestStreak: z.number().default(0),
  gameConfig: GameConfigSchema.optional(),
  studentId: z.string().optional(),
  classId: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AtelierSession = z.infer<typeof AtelierSessionSchema>;

export const CreateAtelierSchema = z.object({
  level: AtelierLevelSchema,
});

export type CreateAtelier = z.infer<typeof CreateAtelierSchema>;

export const EvaluateRequestSchema = z.object({
  chapterId: z.string(),
  stepId: z.string(),
  answer: z.string().min(1).max(5000),
});

export type EvaluateRequest = z.infer<typeof EvaluateRequestSchema>;

export const AiEvalResultSchema = z.object({
  feedback: z.string(),
  score: z.number(),
  criteria: z.object({
    pertinence: z.number(),
    profondeur: z.number(),
    creativite: z.number(),
  }).optional(),
  followUp: z.string().nullable().optional(),
  nextQuestion: z.string().nullable().optional(),
  isChapterComplete: z.boolean().optional(),
});

export const EvaluateResponseSchema = z.object({
  feedback: z.string(),
  score: z.number(),
  criteria: z.object({
    pertinence: z.number(),
    profondeur: z.number(),
    creativite: z.number(),
  }).optional(),
  needsFollowUp: z.boolean(),
  followUp: z.string().nullable(),
  nextQuestion: z.string().nullable(),
  isChapterComplete: z.boolean(),
  streak: z.number().optional(),
  previousStreak: z.number().optional(),
  newAchievements: z.array(z.string()).optional(),
});

export type EvaluateResponse = z.infer<typeof EvaluateResponseSchema>;

// ── Helpers ──────────────────────────────────────────────────────

export function computeBadge(
  totalScore: number,
  maxScore: number
): "bronze" | "silver" | "gold" | null {
  if (maxScore === 0) return null;
  const pct = (totalScore / maxScore) * 100;
  if (pct >= 90) return "gold";
  if (pct >= 60) return "silver";
  return "bronze";
}

export function initChapters(): ChapterProgress[] {
  return CHAPTER_IDS.map((id, index) => ({
    chapterId: id,
    status: index === 0 ? "unlocked" : "locked",
    steps: [],
    totalScore: 0,
    maxScore: CHAPTER_META[id].questionCount * 3,
    badge: null,
  }));
}

// ── Level system ──────────────────────────────────────────────────

export const LEVEL_THRESHOLDS = [
  { xp: 0, label: "Apprenti" },
  { xp: 15, label: "Novice" },
  { xp: 35, label: "Scenariste" },
  { xp: 60, label: "Auteur" },
  { xp: 90, label: "Maitre" },
  { xp: 115, label: "Legende" },
] as const;

export function getLevel(totalXp: number) {
  let levelIdx = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xp) {
      levelIdx = i;
      break;
    }
  }
  const current = LEVEL_THRESHOLDS[levelIdx];
  const next = LEVEL_THRESHOLDS[levelIdx + 1] || null;
  const currentXp = totalXp - current.xp;
  const nextXp = next ? next.xp - current.xp : 0;
  const progress = nextXp > 0 ? Math.round((currentXp / nextXp) * 100) : 100;

  return {
    level: levelIdx + 1,
    label: current.label,
    currentXp,
    nextXp,
    progress,
  };
}
