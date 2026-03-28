// ============================================================
// Module 10 "Et si..." + "Pitch" — Catalogues statiques
// ============================================================

// ── Et si... Images (shown to students for writing prompts) ──

export interface EtsiImage {
  id: string;
  url: string;
  title: string;
  description: string;
}

export const ETSI_IMAGES: EtsiImage[] = [
  {
    id: "etsi-banc",
    url: "/images/etsi/banc.svg",
    title: "Le banc vide",
    description: "Un banc vide dans la cour de l'école, un sac oublié dessus.",
  },
  {
    id: "etsi-fenetre",
    url: "/images/etsi/fenetre.svg",
    title: "La fenêtre",
    description: "Une fenêtre de salle de classe, un avion en papier sur le rebord. Dehors, la cour est vide.",
  },
  {
    id: "etsi-escalier",
    url: "/images/etsi/escalier.svg",
    title: "L'escalier",
    description: "L'escalier du collège, une lumière blafarde. Un cahier tombé sur une marche.",
  },
  {
    id: "etsi-terrain",
    url: "/images/etsi/terrain.svg",
    title: "Le terrain de sport",
    description: "Le terrain de sport du collège au crépuscule. Un ballon abandonné sur le gazon.",
  },
  {
    id: "etsi-bus",
    url: "/images/etsi/bus.svg",
    title: "L'arrêt de bus",
    description: "L'arrêt du bus scolaire le matin. Un sac par terre, mais pas d'élève.",
  },
  {
    id: "etsi-miroir",
    url: "/images/etsi/miroir.svg",
    title: "Le miroir",
    description: "Le miroir des toilettes du collège. Un message écrit dans la buée, à moitié lisible.",
  },
  {
    id: "etsi-cafe",
    url: "/images/etsi/cafe.svg",
    title: "La cantine",
    description: "La cantine vide. Un plateau encore posé sur une table, les chaises repoussées.",
  },
  {
    id: "etsi-graffiti",
    url: "/images/etsi/graffiti.svg",
    title: "Le couloir",
    description: "Un couloir du collège avec un message à moitié effacé sur le mur. Des casiers fermés.",
  },
  {
    id: "etsi-parking",
    url: "/images/etsi/parking.svg",
    title: "La salle vide",
    description: "Un bureau dans une salle de classe vide. Un téléphone oublié, écran allumé.",
  },
  {
    id: "etsi-toit",
    url: "/images/etsi/toit.svg",
    title: "Le toit",
    description: "Le haut de l'escalier du collège, une porte entrouverte. Le coucher de soleil visible.",
  },
];

const ETSI_IMAGE_IDS = new Set(ETSI_IMAGES.map((i) => i.id));
export function isValidEtsiImageId(id: string): boolean {
  return ETSI_IMAGE_IDS.has(id);
}

export function getEtsiImage(id: string): EtsiImage | undefined {
  return ETSI_IMAGES.find((i) => i.id === id);
}

// ── Avatar Builder Options (DiceBear Avataaars — buste, diversité peau/cheveux/vêtements) ──

export interface AvatarOption {
  key: string;
  label: string;
  color?: string; // hex color for swatches
}

// ── Skin tones (7) ──
export const AVATAR_SKIN_COLOR: AvatarOption[] = [
  { key: "ffdbb4", label: "Clair", color: "#ffdbb4" },
  { key: "edb98a", label: "Pêche", color: "#edb98a" },
  { key: "f8d25c", label: "Doré", color: "#f8d25c" },
  { key: "d08b5b", label: "Hâlé", color: "#d08b5b" },
  { key: "fd9841", label: "Ambre", color: "#fd9841" },
  { key: "ae5d29", label: "Brun", color: "#ae5d29" },
  { key: "614335", label: "Foncé", color: "#614335" },
];

// ── Coiffures / Top (34 + chauve) ──
// "__bald__" = special key → topProbability: 0 (pas de cheveux)
// Labels = noms originaux DiceBear (fiables visuellement)
export const AVATAR_TOP: AvatarOption[] = [
  { key: "__bald__", label: "Chauve" },
  { key: "shortFlat", label: "Short Flat" },
  { key: "shortRound", label: "Short Round" },
  { key: "shortWaved", label: "Short Waved" },
  { key: "shortCurly", label: "Short Curly" },
  { key: "shavedSides", label: "Shaved Sides" },
  { key: "theCaesar", label: "Caesar" },
  { key: "theCaesarAndSidePart", label: "Caesar + raie" },
  { key: "sides", label: "Sides" },
  { key: "curly", label: "Curly" },
  { key: "curvy", label: "Curvy" },
  { key: "dreads", label: "Dreads" },
  { key: "dreads01", label: "Dreads 2" },
  { key: "dreads02", label: "Dreads 3" },
  { key: "fro", label: "Afro" },
  { key: "froBand", label: "Afro + bandeau" },
  { key: "bob", label: "Bob" },
  { key: "bun", label: "Bun (chignon)" },
  { key: "bigHair", label: "Big Hair" },
  { key: "longButNotTooLong", label: "Mi-long" },
  { key: "straight01", label: "Straight 1" },
  { key: "straight02", label: "Straight 2" },
  { key: "straightAndStrand", label: "Straight + mèche" },
  { key: "miaWallace", label: "Mia Wallace" },
  { key: "frizzle", label: "Frizzle" },
  { key: "shaggy", label: "Shaggy" },
  { key: "shaggyMullet", label: "Mullet" },
  { key: "frida", label: "Frida" },
];

// ── Couvre-chefs (séparé des coiffures) ──
export const AVATAR_HEADWEAR: AvatarOption[] = [
  { key: "none", label: "Aucun" },
  { key: "hat", label: "Casquette" },
  { key: "winterHat1", label: "Bonnet 1" },
  { key: "winterHat02", label: "Bonnet 2" },
  { key: "winterHat03", label: "Bonnet 3" },
  { key: "winterHat04", label: "Bonnet 4" },
];

// ── Hair colors (10) ──
export const AVATAR_HAIR_COLOR: AvatarOption[] = [
  { key: "2c1b18", label: "Noir", color: "#2c1b18" },
  { key: "4a312c", label: "Brun foncé", color: "#4a312c" },
  { key: "724133", label: "Brun", color: "#724133" },
  { key: "a55728", label: "Châtain", color: "#a55728" },
  { key: "b58143", label: "Châtain clair", color: "#b58143" },
  { key: "d6b370", label: "Blond", color: "#d6b370" },
  { key: "ecdcbf", label: "Blond platine", color: "#ecdcbf" },
  { key: "c93305", label: "Roux", color: "#c93305" },
  { key: "f59797", label: "Rose", color: "#f59797" },
  { key: "e8e1e1", label: "Gris", color: "#e8e1e1" },
];

// ── Eyes (12) ──
export const AVATAR_EYES: AvatarOption[] = [
  { key: "default", label: "Normal" },
  { key: "happy", label: "Joyeux" },
  { key: "wink", label: "Clin d'oeil" },
  { key: "hearts", label: "Amoureux" },
  { key: "surprised", label: "Surpris" },
  { key: "side", label: "De côté" },
  { key: "squint", label: "Plissés" },
  { key: "closed", label: "Fermés" },
  { key: "cry", label: "Larmes" },
  { key: "eyeRoll", label: "Yeux au ciel" },
  { key: "winkWacky", label: "Clin fou" },
  { key: "xDizzy", label: "Étourdi" },
];

// ── Eyebrows (13) ──
export const AVATAR_EYEBROWS: AvatarOption[] = [
  { key: "default", label: "Normal" },
  { key: "defaultNatural", label: "Naturel" },
  { key: "raisedExcited", label: "Surpris" },
  { key: "raisedExcitedNatural", label: "Surpris naturel" },
  { key: "sadConcerned", label: "Triste" },
  { key: "sadConcernedNatural", label: "Triste naturel" },
  { key: "angry", label: "En colère" },
  { key: "angryNatural", label: "Colère naturel" },
  { key: "flatNatural", label: "Plats" },
  { key: "frownNatural", label: "Froncés" },
  { key: "unibrowNatural", label: "Monosourcil" },
  { key: "upDown", label: "Asymétriques" },
  { key: "upDownNatural", label: "Asymétrique naturel" },
];

// ── Mouth (12) ──
export const AVATAR_MOUTH: AvatarOption[] = [
  { key: "smile", label: "Sourire" },
  { key: "default", label: "Normal" },
  { key: "twinkle", label: "Malicieux" },
  { key: "serious", label: "Sérieux" },
  { key: "tongue", label: "Langue" },
  { key: "eating", label: "Manger" },
  { key: "grimace", label: "Grimace" },
  { key: "sad", label: "Triste" },
  { key: "concerned", label: "Inquiet" },
  { key: "disbelief", label: "Perplexe" },
  { key: "screamOpen", label: "Cri" },
  { key: "vomit", label: "Malade" },
];

// ── Clothing (9) ──
export const AVATAR_CLOTHING: AvatarOption[] = [
  { key: "hoodie", label: "Hoodie" },
  { key: "shirtCrewNeck", label: "T-shirt col rond" },
  { key: "shirtVNeck", label: "T-shirt col V" },
  { key: "shirtScoopNeck", label: "T-shirt décolleté" },
  { key: "blazerAndShirt", label: "Blazer + chemise" },
  { key: "blazerAndSweater", label: "Blazer + pull" },
  { key: "collarAndSweater", label: "Col roulé" },
  { key: "graphicShirt", label: "T-shirt imprimé" },
  { key: "overall", label: "Salopette" },
];

// ── Clothes colors (12) ──
export const AVATAR_CLOTHES_COLOR: AvatarOption[] = [
  { key: "262e33", label: "Noir", color: "#262e33" },
  { key: "3c4f5c", label: "Gris foncé", color: "#3c4f5c" },
  { key: "929598", label: "Gris", color: "#929598" },
  { key: "e6e6e6", label: "Gris clair", color: "#e6e6e6" },
  { key: "ffffff", label: "Blanc", color: "#ffffff" },
  { key: "65c9ff", label: "Bleu ciel", color: "#65c9ff" },
  { key: "5199e4", label: "Bleu", color: "#5199e4" },
  { key: "25557c", label: "Marine", color: "#25557c" },
  { key: "ff5c5c", label: "Rouge", color: "#ff5c5c" },
  { key: "ff488e", label: "Rose", color: "#ff488e" },
  { key: "a7ffc4", label: "Vert menthe", color: "#a7ffc4" },
  { key: "ffdeb5", label: "Beige", color: "#ffdeb5" },
];

// ── Accessories (none + 7) ──
export const AVATAR_ACCESSORIES: AvatarOption[] = [
  { key: "none", label: "Aucun" },
  { key: "prescription01", label: "Lunettes rondes" },
  { key: "prescription02", label: "Lunettes carrées" },
  { key: "round", label: "Lunettes vintage" },
  { key: "sunglasses", label: "Solaires" },
  { key: "wayfarers", label: "Wayfarers" },
  { key: "kurt", label: "Kurt" },
  { key: "eyepatch", label: "Cache-oeil" },
];

// ── Facial hair (none + 5) ──
export const AVATAR_FACIAL_HAIR: AvatarOption[] = [
  { key: "none", label: "Aucune" },
  { key: "beardLight", label: "Barbe légère" },
  { key: "beardMedium", label: "Barbe moyenne" },
  { key: "beardMajestic", label: "Grande barbe" },
  { key: "moustacheFancy", label: "Moustache chic" },
  { key: "moustacheMagnum", label: "Moustache Magnum" },
];

// ── Graphic prints (for graphicShirt) ──
export const AVATAR_GRAPHIC: AvatarOption[] = [
  { key: "bat", label: "Chauve-souris" },
  { key: "bear", label: "Ours" },
  { key: "diamond", label: "Diamant" },
  { key: "deer", label: "Cerf" },
  { key: "skull", label: "Crâne" },
  { key: "skullOutline", label: "Crâne contour" },
  { key: "pizza", label: "Pizza" },
  { key: "resist", label: "Resist" },
  { key: "hola", label: "Hola" },
  { key: "cumbia", label: "Cumbia" },
];

// ── Background colors (10 — Banlieuwood palette) ──
export const AVATAR_BACKGROUND: AvatarOption[] = [
  { key: "06b6d4", label: "Cyan", color: "#06b6d4" },
  { key: "8b5cf6", label: "Violet", color: "#8b5cf6" },
  { key: "f59e0b", label: "Ambre", color: "#f59e0b" },
  { key: "ef4444", label: "Rouge", color: "#ef4444" },
  { key: "22c55e", label: "Vert", color: "#22c55e" },
  { key: "ec4899", label: "Rose", color: "#ec4899" },
  { key: "3b82f6", label: "Bleu", color: "#3b82f6" },
  { key: "d4a843", label: "Or", color: "#d4a843" },
  { key: "1e293b", label: "Nuit", color: "#1e293b" },
  { key: "6366f1", label: "Indigo", color: "#6366f1" },
];

// ── Scene options (8 diverse scenes — Banlieuwood = partout) ──
export interface SceneOption {
  key: string;
  label: string;
}

export const SCENES: SceneOption[] = [
  { key: "cite", label: "La Cité" },
  { key: "ecole", label: "L'École" },
  { key: "cinema", label: "Le Cinéma" },
  { key: "plage", label: "La Plage" },
  { key: "concert", label: "Le Concert" },
  { key: "marche", label: "Le Marché" },
  { key: "montagne", label: "La Montagne" },
  { key: "studio", label: "Le Studio" },
];

// ── Traits de caractère ──

export interface TraitOption {
  key: string;
  label: string;
  description: string;
}

export const TRAITS: TraitOption[] = [
  { key: "courageux", label: "Courageux", description: "N'a peur de rien, fonce toujours" },
  { key: "timide", label: "Timide", description: "Observe beaucoup, parle peu" },
  { key: "drole", label: "Drôle", description: "Fait rire tout le monde, même dans les moments durs" },
  { key: "rebelle", label: "Rebelle", description: "N'accepte pas les règles, veut tout changer" },
  { key: "reveur", label: "Rêveur", description: "Toujours dans sa tête, imagine des mondes" },
  { key: "loyal", label: "Loyal", description: "Ferait n'importe quoi pour ses amis" },
  { key: "malin", label: "Malin", description: "Toujours un plan, toujours une idée" },
  { key: "sensible", label: "Sensible", description: "Ressent tout plus fort que les autres" },
];

const TRAIT_KEYS = new Set(TRAITS.map((t) => t.key));
export function isValidTrait(key: string): boolean {
  return TRAIT_KEYS.has(key);
}

// ── Objectifs (pitch séance 2) ──

export interface ObjectifOption {
  key: string;
  label: string;
  example: string;
}

export const OBJECTIFS: ObjectifOption[] = [
  { key: "sauver", label: "Sauver quelqu'un", example: "Mon personnage veut sauver son meilleur ami" },
  { key: "prouver", label: "Prouver quelque chose", example: "Mon personnage veut prouver qu'il a raison" },
  { key: "fuir", label: "S'échapper", example: "Mon personnage veut fuir un endroit dangereux" },
  { key: "trouver", label: "Trouver la vérité", example: "Mon personnage veut découvrir un secret" },
  { key: "gagner", label: "Gagner un défi", example: "Mon personnage veut remporter la compétition" },
  { key: "proteger", label: "Protéger un secret", example: "Mon personnage veut cacher quelque chose" },
  { key: "changer", label: "Changer sa vie", example: "Mon personnage veut tout recommencer" },
  { key: "venger", label: "Réparer une injustice", example: "Mon personnage veut que justice soit faite" },
];

const OBJECTIF_KEYS = new Set(OBJECTIFS.map((o) => o.key));
export function isValidObjectif(key: string): boolean {
  // Accept standard keys or custom free text prefixed with "custom:"
  return OBJECTIF_KEYS.has(key) || key.startsWith("custom:");
}

// ── Obstacles (pitch séance 2) ──

export interface ObstacleOption {
  key: string;
  label: string;
  example: string;
}

export const OBSTACLES: ObstacleOption[] = [
  { key: "rival", label: "Un rival puissant", example: "Quelqu'un d'autre veut la même chose" },
  { key: "mensonge", label: "Un mensonge", example: "Tout repose sur un mensonge qui pourrait éclater" },
  { key: "temps", label: "Le temps qui presse", example: "Il n'a que 24 heures pour agir" },
  { key: "trahison", label: "Une trahison", example: "Quelqu'un de proche l'a trahi" },
  { key: "peur", label: "Sa propre peur", example: "Il doit affronter ce qui le terrifie" },
  { key: "regles", label: "Les règles", example: "Le système est contre lui" },
  { key: "solitude", label: "La solitude", example: "Personne ne le croit, il est seul" },
  { key: "secret", label: "Un secret du passé", example: "Le passé revient le hanter" },
];

const OBSTACLE_KEYS = new Set(OBSTACLES.map((o) => o.key));
export function isValidObstacle(key: string): boolean {
  return OBSTACLE_KEYS.has(key);
}

// ── Chrono config ──

export const CHRONO_DURATION = 30; // seconds

// ── Et si... QCMs (integrated in the writing workspace) ──

export interface EtsiQcm {
  key: string;
  question: string;
  options: { key: string; label: string }[];
}

export const ETSI_QCMS: EtsiQcm[] = [
  {
    key: "tone",
    question: "Quel ton pour ton histoire ?",
    options: [
      { key: "action", label: "De l'action et du suspense" },
      { key: "emotion", label: "De l'émotion et des sentiments" },
      { key: "mystere", label: "Du mystère et des secrets" },
      { key: "humour", label: "De l'humour et de la surprise" },
    ],
  },
  {
    key: "character",
    question: "Quel type de personnage ?",
    options: [
      { key: "solitaire", label: "Un solitaire" },
      { key: "leader", label: "Un leader" },
      { key: "outsider", label: "Un outsider" },
      { key: "ordinaire", label: "Quelqu'un d'ordinaire" },
    ],
  },
  {
    key: "trigger",
    question: "Ce qui change tout ?",
    options: [
      { key: "decouverte", label: "Une découverte inattendue" },
      { key: "disparition", label: "Une disparition" },
      { key: "rencontre", label: "Une rencontre" },
      { key: "trahison", label: "Une trahison" },
    ],
  },
  {
    key: "ending",
    question: "Comment ça finit ?",
    options: [
      { key: "victoire", label: "Une victoire" },
      { key: "sacrifice", label: "Un sacrifice" },
      { key: "surprise", label: "Un retournement" },
      { key: "ouvert", label: "Une fin ouverte" },
    ],
  },
];

// ── Pitch miroir (deterministic template, intentionally imperfect) ──

const TONE_LABELS: Record<string, string> = {
  action: "pleine d'action",
  emotion: "émouvante",
  mystere: "mystérieuse",
  humour: "drôle",
};
const TRIGGER_LABELS: Record<string, string> = {
  decouverte: "une découverte inattendue",
  disparition: "une disparition",
  rencontre: "une rencontre",
  trahison: "une trahison",
};
const ENDING_LABELS: Record<string, string> = {
  victoire: "une victoire",
  sacrifice: "un sacrifice",
  surprise: "un retournement",
  ouvert: "une question sans réponse",
};

export function generatePitchMiroir(etsiText: string, qcmAnswers: Record<string, string>): string {
  const tone = TONE_LABELS[qcmAnswers.tone] || "";
  const trigger = TRIGGER_LABELS[qcmAnswers.trigger] || "quelque chose d'inattendu";
  const ending = ENDING_LABELS[qcmAnswers.ending] || "une fin inattendue";

  const parts: string[] = [etsiText.replace(/\.+$/, "") + "..."];
  if (tone) parts.push(`C'est une histoire ${tone}.`);
  parts.push(`Tout bascule à cause de ${trigger}.`);
  parts.push(`À la fin, il y a ${ending}.`);

  return parts.join(" ");
}

// ── Help types ──

export const HELP_TYPES = ["example", "reformulate", "starter"] as const;
export type HelpType = (typeof HELP_TYPES)[number];

export const MAX_HELP_PER_STEP = 3;

// ── Label lookup helpers ──

export function getTraitLabel(key: string): string {
  return TRAITS.find((t) => t.key === key)?.label ?? key;
}

export function getObjectifLabel(key: string): string {
  return OBJECTIFS.find((o) => o.key === key)?.label ?? key;
}

export function getObstacleLabel(key: string): string {
  return OBSTACLES.find((o) => o.key === key)?.label ?? key;
}

export function isValidHelpType(type: string): type is HelpType {
  return (HELP_TYPES as readonly string[]).includes(type);
}

export const HELP_STEPS = ["etsi", "pitch"] as const;
export type HelpStep = (typeof HELP_STEPS)[number];

export function isValidHelpStep(step: string): step is HelpStep {
  return (HELP_STEPS as readonly string[]).includes(step);
}

export function getSceneLabel(key: string): string {
  return SCENES.find((s) => s.key === key)?.label ?? key;
}
