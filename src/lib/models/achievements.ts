export interface AchievementDef {
  id: string;
  label: string;
  description: string;
  emoji: string;
  secret: boolean;
}

export interface AchievementRecord {
  id: string;
  unlockedAt: string;
}

export interface AchievementsData {
  achievements: AchievementRecord[];
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-gold",
    label: "Premier Or",
    description: "Obtenir un badge Or sur un chapitre",
    emoji: "🥇",
    secret: false,
  },
  {
    id: "perfect-chapter",
    label: "Chapitre Parfait",
    description: "Toutes les questions d'un chapitre a 3 etoiles",
    emoji: "💎",
    secret: false,
  },
  {
    id: "parcours-complet",
    label: "Parcours Complet",
    description: "Completer les 7 chapitres",
    emoji: "🏆",
    secret: false,
  },
  {
    id: "streak-5",
    label: "Serie de 5",
    description: "Enchainer 5 reponses parfaites d'affilee",
    emoji: "🔥",
    secret: false,
  },
  {
    id: "streak-10",
    label: "Serie de 10",
    description: "Enchainer 10 reponses parfaites d'affilee",
    emoji: "🌟",
    secret: false,
  },
  {
    id: "penseur-profond",
    label: "Penseur Profond",
    description: "Obtenir 10 fois un score de 3 en profondeur",
    emoji: "🧠",
    secret: false,
  },
  {
    id: "ame-creative",
    label: "Ame Creative",
    description: "Obtenir 10 fois un score de 3 en creativite",
    emoji: "🎨",
    secret: false,
  },
  {
    id: "completiste",
    label: "Completiste",
    description: "Repondre aux 41 questions",
    emoji: "📚",
    secret: false,
  },
  {
    id: "remontada",
    label: "La Remontada",
    description: "Obtenir 3 etoiles apres un 1 etoile sur la meme question",
    emoji: "🚀",
    secret: false,
  },
  {
    id: "secret-night-owl",
    label: "???",
    description: "???",
    emoji: "❓",
    secret: true,
  },
  {
    id: "secret-speed-demon",
    label: "???",
    description: "???",
    emoji: "❓",
    secret: true,
  },
];

export const ACHIEVEMENT_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
