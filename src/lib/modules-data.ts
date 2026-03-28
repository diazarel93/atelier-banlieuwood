import { SEANCE_SITUATIONS } from "@/lib/constants";
import type { SpecModuleId } from "@/lib/spec-modules";

// ——————————————————————————————————————————————————————
// MODULE & PHASE DEFINITIONS
// Extracted from pilot/page.tsx for reuse across sidebar, top bar, etc.
// ——————————————————————————————————————————————————————

export interface ModuleDef {
  id: string;
  dbModule: number;
  dbSeance: number;
  title: string;
  subtitle: string;
  description: string;
  teacherNote: string;
  color: string;
  gradient: string;
  iconKey: string;
  duration: string;
  questions: number;
  disabled?: boolean;
  comingSoon?: boolean;
  /** Official Banlieuwood spec module ID (M1-M8). Undefined for bonus modules. */
  specModule?: SpecModuleId;
  /** Module is outside the M1-M8 spec (legacy/bonus content) */
  bonus?: boolean;
}

export interface PhaseDef {
  id: string;
  label: string;
  description: string;
  color: string;
  emoji: string;
  moduleIds: string[];
}

export const MODULES: ModuleDef[] = [
  // ── M1 : LE REGARD — observer, interpréter, imaginer ──
  {
    id: "m1a",
    dbModule: 1,
    specModule: "M1",
    dbSeance: 1,
    title: "Positionnement",
    subtitle: "Le Regard · 1",
    description: "8 questions pour découvrir ton profil créatif : observation, narration, émotion, audace.",
    teacherNote: "Brise-glace rapide. Prépare le terrain pour les images.",
    color: "#8B5CF6",
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    iconKey: "positioning",
    duration: "10 min",
    questions: 8,
  },
  {
    id: "m1b",
    dbModule: 1,
    dbSeance: 2,
    specModule: "M1",
    title: "Image 1 — La rue",
    subtitle: "Le Regard · 2",
    description: "Une image, une question ouverte. Observer, interpréter, imaginer.",
    teacherNote: "Après les réponses, choisir 2 textes contrastés pour la confrontation.",
    color: "#8B5CF6",
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    iconKey: "image",
    duration: "15 min",
    questions: 1,
  },
  {
    id: "m1c",
    dbModule: 1,
    dbSeance: 3,
    specModule: "M1",
    title: "Image 2 — L'intérieur",
    subtitle: "Le Regard · 3",
    description: "Deuxième image, une question ouverte. Confrontation des regards.",
    teacherNote: "Même principe : récolter puis projeter 2 réponses contrastées.",
    color: "#8B5CF6",
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    iconKey: "image",
    duration: "15 min",
    questions: 1,
  },
  {
    id: "m1d",
    dbModule: 1,
    dbSeance: 4,
    specModule: "M1",
    title: "Image 3 — Le banc",
    subtitle: "Le Regard · 4",
    description: "Troisième image, question optionnelle. Fin de la phase images.",
    teacherNote: "Peut être fait rapidement ou sauté si le temps manque.",
    color: "#8B5CF6",
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    iconKey: "image",
    duration: "10 min",
    questions: 1,
  },
  {
    id: "m1e",
    dbModule: 1,
    dbSeance: 5,
    specModule: "M1",
    title: "Carnet d'idées",
    subtitle: "Le Regard · 5",
    description: "Page libre pour noter ses idées, images et fragments d'histoires.",
    teacherNote: "Moment calme. Les élèves écrivent librement.",
    color: "#8B5CF6",
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    iconKey: "notebook",
    duration: "10 min",
    questions: 1,
  },
  // ── M2 : LA SCÈNE — émotion cachée, construction de scène ──
  {
    id: "u2a",
    dbModule: 2,
    dbSeance: 1,
    specModule: "M2",
    title: "Mise en bain",
    subtitle: "Émotion · 1",
    description: "Checklist culturelle, scène marquante, décryptage de l'émotion cachée.",
    teacherNote: "Briser la glace avec leurs références, puis les emmener vers l'émotion.",
    color: "#EC4899",
    gradient: "from-[#EC4899] to-[#DB2777]",
    iconKey: "heart",
    duration: "20 min",
    questions: 3,
  },
  {
    id: "u2b",
    dbModule: 2,
    dbSeance: 2,
    specModule: "M2",
    title: "Émotion Cachée",
    subtitle: "Émotion · 2",
    description: "Choisir une émotion et construire une scène avec jetons et contraintes.",
    teacherNote: "Le jeu de construction de scène. L'IA donne un feedback bienveillant.",
    color: "#EC4899",
    gradient: "from-[#EC4899] to-[#DB2777]",
    iconKey: "film",
    duration: "25 min",
    questions: 2,
  },
  {
    id: "u2c",
    dbModule: 2,
    dbSeance: 3,
    specModule: "M2",
    title: "Phase Collective",
    subtitle: "Émotion · 3",
    description: "Projection de 2 scènes anonymes. Débat : laquelle communique le mieux ?",
    teacherNote: "Choisir 2 scènes contrastées pour alimenter le débat.",
    color: "#EC4899",
    gradient: "from-[#EC4899] to-[#DB2777]",
    iconKey: "users",
    duration: "20 min",
    questions: 2,
  },
  {
    id: "u2d",
    dbModule: 2,
    dbSeance: 4,
    specModule: "M2",
    title: "Clôture",
    subtitle: "Émotion · 4",
    description: "Nommer le thème et l'arc du personnage. Bilan du module.",
    teacherNote: "Prise de recul. Les élèves formalisent ce qu'ils ont appris.",
    color: "#EC4899",
    gradient: "from-[#EC4899] to-[#DB2777]",
    iconKey: "star",
    duration: "15 min",
    questions: 2,
  },
  // ── M3 : ET SI... — la naissance de l'idée ──
  {
    id: "m10a",
    dbModule: 10,
    dbSeance: 1,
    specModule: "M3",
    title: "Et si...",
    subtitle: "Et si...",
    description: "Une image, une question : « Et si... ? ». Libérer l'imagination narrative.",
    teacherNote: "Les élèves partent d'une image pour écrire leur première idée de scénario.",
    color: "#06B6D4",
    gradient: "from-[#06B6D4] to-[#0891B2]",
    iconKey: "sparkle",
    duration: "25 min",
    questions: 3,
  },
  // ── M4 : LE PITCH — transformer l'idée en proposition claire ──
  {
    id: "m10b",
    dbModule: 10,
    dbSeance: 2,
    specModule: "M4",
    title: "Pitch",
    subtitle: "Le Pitch",
    description: "Créer un personnage, définir son objectif, pitcher l'histoire en 30 secondes.",
    teacherNote: "Le pitch structure la pensée. Le chrono force la concision.",
    color: "#06B6D4",
    gradient: "from-[#06B6D4] to-[#0891B2]",
    iconKey: "mic",
    duration: "30 min",
    questions: 5,
  },
  // ── M5 : CONSTRUCTION COLLECTIVE — 1 séance, 8 manches ──
  {
    id: "m12a",
    dbModule: 12,
    dbSeance: 1,
    specModule: "M5",
    title: "Construction Collective",
    subtitle: "Collectif · 1",
    description: "8 votes pour construire le film de la classe : ton, situation, personnages, objectif, obstacle, scène, relation, moment fort.",
    teacherNote: "Préparer les cartes en inter-séance (bouton « Préparer les cartes »). Pendant la séance, les élèves votent manche par manche.",
    color: "#14B8A6",
    gradient: "from-[#14B8A6] to-[#0D9488]",
    iconKey: "users",
    duration: "30 min",
    questions: 8,
  },
  // ── BONUS : LE CINÉMA — comprendre la production ──
  {
    id: "m2a",
    dbModule: 9,
    dbSeance: 1,
    bonus: true,
    title: "Le Cinéma",
    subtitle: "Le Cinéma · 1",
    description: "Comment on fait un film ? Les métiers, les coûts, les contraintes. Comprendre la prod.",
    teacherNote: "Objectif : comprendre ce que veut dire \"produire un film\" à leur échelle.",
    color: "#F59E0B",
    gradient: "from-[#F59E0B] to-[#D97706]",
    iconKey: "clapperboard",
    duration: "20 min",
    questions: 8,
  },
  {
    id: "m2b",
    dbModule: 9,
    dbSeance: 2,
    bonus: true,
    title: "Les Choix",
    subtitle: "Le Cinéma · 2",
    description: "100 crédits d'énergie créative. Casting, lieux, image, son, montage — chaque choix compte.",
    teacherNote: "Le jeu de contraintes. Les élèves adorent négocier leurs choix.",
    color: "#F59E0B",
    gradient: "from-[#F59E0B] to-[#D97706]",
    iconKey: "clock",
    duration: "15 min",
    questions: 5,
  },
  {
    id: "m2c",
    dbModule: 9,
    dbSeance: 3,
    bonus: true,
    title: "Les Imprévus",
    subtitle: "Le Cinéma · 3",
    description: "Problèmes de tournage — acteur absent, pluie, batterie vide. S'adapter comme un vrai prod.",
    teacherNote: "Objectif : apprendre à résoudre des problèmes créatifs sous pression.",
    color: "#F59E0B",
    gradient: "from-[#F59E0B] to-[#D97706]",
    iconKey: "alert",
    duration: "20 min",
    questions: 8,
  },
  {
    id: "m2d",
    dbModule: 9,
    dbSeance: 4,
    bonus: true,
    title: "Le Plan",
    subtitle: "Le Cinéma · 4",
    description: "Organiser le tournage — planning, rôles, scènes clés, plan B. Devenir producteur.",
    teacherNote: "Objectif : synthétiser tout ce qu'ils ont appris et présenter leur plan.",
    color: "#F59E0B",
    gradient: "from-[#F59E0B] to-[#D97706]",
    iconKey: "document",
    duration: "20 min",
    questions: 8,
  },
  // ── BONUS : L'HISTOIRE — personnages, conflits, structure narrative ──
  {
    id: "m2-perso",
    dbModule: 4,
    dbSeance: 1,
    bonus: true,
    title: "Vis ma vie",
    subtitle: "L'Histoire · 1",
    description: "Mon univers — films, anime, jeux, héros, méchants, émotions. Trouver l'idée de SON film.",
    teacherNote: "On part de ce qu'ils aiment pour les amener vers leur propre histoire.",
    color: "#EC4899",
    gradient: "from-[#EC4899] to-[#DB2777]",
    iconKey: "person",
    duration: "40 min",
    questions: 8,
  },
  {
    id: "m3",
    dbModule: 3,
    dbSeance: 1,
    bonus: true,
    title: "Le Héros",
    subtitle: "L'Histoire · 2",
    description: "Création du personnage principal — qui il est, son monde, ses liens, ce qu'il veut.",
    teacherNote: "Début de l'écriture. On construit les fondations du film.",
    color: "#4ECDC4",
    gradient: "from-[#4ECDC4] to-[#3BB5AD]",
    iconKey: "globe",
    duration: "45 min",
    questions: SEANCE_SITUATIONS[1] || 8,
  },
  {
    id: "m4",
    dbModule: 3,
    dbSeance: 2,
    bonus: true,
    title: "Le Conflit",
    subtitle: "L'Histoire · 3",
    description: "L'histoire se complique — obstacles, dilemmes, le personnage face à l'adversité.",
    teacherNote: "Le coeur du récit. Les élèves découvrent la tension narrative.",
    color: "#FF6B35",
    gradient: "from-[#FF6B35] to-[#E85D26]",
    iconKey: "bolt",
    duration: "45 min",
    questions: SEANCE_SITUATIONS[2] || 8,
  },
  {
    id: "m5",
    dbModule: 3,
    dbSeance: 3,
    bonus: true,
    title: "Le Sens",
    subtitle: "L'Histoire · 4",
    description: "Qu'est-ce que ce film raconte vraiment ? Le thème profond et le titre final.",
    teacherNote: "La prise de recul. L'élève découvre le vrai sujet de son film.",
    color: "#8B5CF6",
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    iconKey: "star",
    duration: "45 min",
    questions: SEANCE_SITUATIONS[3] || 5,
  },
  // ── BONUS : CINÉ-DÉBAT — 4 séances ──
  {
    id: "m11a",
    dbModule: 11,
    dbSeance: 1,
    bonus: true,
    title: "L'Art de Raconter",
    subtitle: "Ciné-Débat · 1",
    description: "Citations, affiches, scènes : découvrez comment les grands réalisateurs racontent une histoire.",
    teacherNote: "Séance de découverte. Les élèves réagissent à des stimuli variés (citation, poster, vidéo, débat).",
    color: "#E11D48",
    gradient: "from-[#E11D48] to-[#BE123C]",
    iconKey: "film",
    duration: "25 min",
    questions: 6,
  },
  {
    id: "m11b",
    dbModule: 11,
    dbSeance: 2,
    bonus: true,
    title: "Émotions à l'Écran",
    subtitle: "Ciné-Débat · 2",
    description: "Pourquoi cette scène fait pleurer ? Les mécanismes de l'émotion au cinéma.",
    teacherNote: "On décrypte les outils du cinéma pour provoquer l'émotion : musique, silence, jeu d'acteur.",
    color: "#E11D48",
    gradient: "from-[#E11D48] to-[#BE123C]",
    iconKey: "heart",
    duration: "25 min",
    questions: 6,
  },
  {
    id: "m11c",
    dbModule: 11,
    dbSeance: 3,
    bonus: true,
    title: "Héros & Anti-Héros",
    subtitle: "Ciné-Débat · 3",
    description: "Sacrifice, pardon, trahison. Qu'est-ce qui fait un vrai héros ? Et un bon méchant ?",
    teacherNote: "Réflexion sur l'héroïsme et l'antagonisme. Les élèves argumentent et confrontent.",
    color: "#E11D48",
    gradient: "from-[#E11D48] to-[#BE123C]",
    iconKey: "star",
    duration: "25 min",
    questions: 6,
  },
  {
    id: "m11d",
    dbModule: 11,
    dbSeance: 4,
    bonus: true,
    title: "Les Coulisses",
    subtitle: "Ciné-Débat · 4",
    description: "Budget, cascades, IA, montage. Les secrets de fabrication du cinéma.",
    teacherNote: "Séance sur les métiers et la production. L'IA et l'avenir du cinéma en débat final.",
    color: "#E11D48",
    gradient: "from-[#E11D48] to-[#BE123C]",
    iconKey: "clapperboard",
    duration: "25 min",
    questions: 6,
  },
  // ── M6 : LE SCÉNARIO ──
  {
    id: "m6",
    dbModule: 5,
    dbSeance: 1,
    specModule: "M6",
    title: "Le Scénario",
    subtitle: "Scénario",
    description: "Transformer les choix collectifs en scénario : frise narrative, scènes IA, missions d'écriture, assemblage.",
    teacherNote: "Préparer les scènes en inter-séance (bouton « Générer les scènes »). Les élèves reçoivent chacun une mission d'écriture.",
    color: "#10B981",
    gradient: "from-[#10B981] to-[#059669]",
    iconKey: "document",
    duration: "45 min",
    questions: 5,
  },
  // ── M7 : LA MISE EN SCÈNE ──
  {
    id: "m7",
    dbModule: 7,
    dbSeance: 1,
    specModule: "M7",
    title: "La Mise en scène",
    subtitle: "Mise en scène",
    description: "Apprendre les 4 plans fondamentaux, comparer les cadrages, créer un mini-découpage et un storyboard.",
    teacherNote: "Quiz visuel puis découpage technique. Les élèves apprennent à raconter en images.",
    color: "#F59E0B",
    gradient: "from-[#F59E0B] to-[#D97706]",
    iconKey: "camera",
    duration: "40 min",
    questions: 4,
  },
  // ── M8 : L'ÉQUIPE ──
  {
    id: "m8",
    dbModule: 8,
    dbSeance: 1,
    specModule: "M8",
    title: "L'Équipe",
    subtitle: "Équipe",
    description: "Quiz des métiers du cinéma, choix des rôles par mérite (points invisibles), carte talent personnalisée.",
    teacherNote: "Calculer les points en inter-séance. Les élèves choisissent leur rôle dans l'ordre du classement (invisible).",
    color: "#EF4444",
    gradient: "from-[#EF4444] to-[#DC2626]",
    iconKey: "users",
    duration: "35 min",
    questions: 5,
  },
  // ── BONUS : POST-PRODUCTION ──
  {
    id: "m9",
    dbModule: 13,
    dbSeance: 1,
    bonus: true,
    title: "La Post-prod",
    subtitle: "Finalisation",
    description: "Montage, musique, affiche, bande-annonce. Le film prend sa forme finale.",
    teacherNote: "L'aboutissement. Les élèves finalisent et présentent leur œuvre.",
    color: "#06B6D4",
    gradient: "from-[#06B6D4] to-[#0891B2]",
    iconKey: "clapperboard",
    duration: "50 min",
    questions: 8,
  },
];

/** IDs of the 8 core programme phases (M1–M8) */
export const MAIN_PHASE_IDS = [
  "regard", "scene", "etsi", "pitch",
  "collectif", "scenario", "mise-en-scene", "equipe",
] as const;

export const PHASES: PhaseDef[] = [
  // ── Parcours principal M1–M8 (conforme au programme pédagogique) ──
  { id: "regard", label: "Le Regard", description: "Observer, interpréter, imaginer. Les élèves découvrent leur profil créatif à travers des images et des questions ouvertes.", color: "#8B5CF6", emoji: "👁️", moduleIds: ["m1a", "m1b", "m1c", "m1d", "m1e"] },
  { id: "scene", label: "La Scène", description: "Explorer les émotions cachées derrière les images et les situations. Construire une scène avec le jeu Émotion Cachée.", color: "#EC4899", emoji: "🎬", moduleIds: ["u2a", "u2b", "u2c", "u2d"] },
  { id: "etsi", label: "Et si...", description: "Libérer la créativité avec des scénarios « Et si... » à partir d'images. La naissance de l'idée.", color: "#06B6D4", emoji: "✨", moduleIds: ["m10a"] },
  { id: "pitch", label: "Le Pitch", description: "Créer un personnage, définir son objectif, et pitcher son histoire en 30 secondes.", color: "#06B6D4", emoji: "🎤", moduleIds: ["m10b"] },
  { id: "collectif", label: "Construction Collective", description: "Voter en 8 manches pour construire le film de la classe à partir des idées de chacun.", color: "#14B8A6", emoji: "🗳️", moduleIds: ["m12a"] },
  { id: "scenario", label: "Le Scénario", description: "Transformer les choix collectifs en scénario structuré : frise narrative, scènes IA, missions d'écriture collaborative.", color: "#10B981", emoji: "✏️", moduleIds: ["m6"] },
  { id: "mise-en-scene", label: "La Mise en scène", description: "Apprendre le langage visuel : les 4 plans fondamentaux, comparer les cadrages, créer un mini-storyboard.", color: "#F59E0B", emoji: "🎥", moduleIds: ["m7"] },
  { id: "equipe", label: "L'Équipe", description: "Former l'équipe de tournage : quiz des métiers, choix des rôles par mérite, cartes talents.", color: "#EF4444", emoji: "🎭", moduleIds: ["m8"] },
  // ── Modules bonus (hors programme de base) ──
  { id: "postprod", label: "La Post-prod", description: "Monter le film, ajouter la musique et les effets, finaliser le projet pour la projection.", color: "#06B6D4", emoji: "🎞️", moduleIds: ["m9"] },
  { id: "cinema", label: "Le Cinéma", description: "Comprendre le langage cinématographique : plans, angles, montage, son. Les outils pour raconter en images.", color: "#F59E0B", emoji: "🎬", moduleIds: ["m2a", "m2b", "m2c", "m2d"] },
  { id: "story", label: "L'Histoire", description: "Construire une histoire complète : personnages, conflits, structure narrative et parcours émotionnel.", color: "#4ECDC4", emoji: "📖", moduleIds: ["m2-perso", "m3", "m4", "m5"] },
  { id: "cinedebat", label: "Ciné-Débat", description: "Analyser des extraits de films, débattre des choix artistiques et développer l'esprit critique cinématographique.", color: "#E11D48", emoji: "📽️", moduleIds: ["m11a", "m11b", "m11c", "m11d"] },
];

/** Find module by its ID */
export function getModuleById(id: string): ModuleDef | undefined {
  return MODULES.find((m) => m.id === id);
}

/** Find module by dbModule + dbSeance */
export function getModuleByDb(dbModule: number, dbSeance: number): ModuleDef | undefined {
  return MODULES.find((m) => m.dbModule === dbModule && m.dbSeance === dbSeance);
}

/** Find the phase a module belongs to */
export function getPhaseForModule(moduleId: string): PhaseDef | undefined {
  return PHASES.find((p) => p.moduleIds.includes(moduleId));
}
