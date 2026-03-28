// ──────────────────────────────────────────────────────────
// MODULE 13 — La Post-prod
// 8 situations : montage → musique → titre → affiche →
//   bande-annonce → crédits → critique → projection
// ──────────────────────────────────────────────────────────

export interface PostprodStep {
  key: string;
  label: string;
  emoji: string;
  description: string;
}

export const POSTPROD_STEPS: PostprodStep[] = [
  { key: "montage", label: "Ordre des scènes", emoji: "🎬", description: "Organiser les scènes dans le bon ordre" },
  { key: "musique", label: "Ambiance sonore", emoji: "🎵", description: "Choisir le style musical du film" },
  { key: "titre", label: "Le Titre", emoji: "✨", description: "Trouver le titre parfait" },
  { key: "affiche", label: "L'Affiche", emoji: "🖼️", description: "Imaginer l'affiche du film" },
  { key: "trailer", label: "La Bande-annonce", emoji: "📽️", description: "Sélectionner les moments clés" },
  { key: "credits", label: "Les Crédits", emoji: "🎭", description: "Attribuer les mérites" },
  { key: "critique", label: "La Critique", emoji: "📝", description: "Donner son avis sur le film" },
  { key: "projection", label: "La Projection", emoji: "🍿", description: "Le grand moment final" },
];

export function getStepConfig(position: number): PostprodStep | undefined {
  return POSTPROD_STEPS[position - 1];
}

// ── Music genres for position 2 ──────────────────────────
export const MUSIC_GENRES = [
  { key: "hiphop", label: "Hip-Hop / Rap", emoji: "🎤" },
  { key: "pop", label: "Pop", emoji: "🎶" },
  { key: "classique", label: "Classique / Piano", emoji: "🎹" },
  { key: "electronique", label: "Électronique / Beats", emoji: "🎧" },
  { key: "acoustique", label: "Acoustique / Guitare", emoji: "🎸" },
  { key: "ambiance", label: "Ambiance / Atmosphère", emoji: "🌙" },
] as const;

export const MUSIC_MOODS = [
  { key: "tendu", label: "Tendu / Suspense", color: "#EF4444" },
  { key: "joyeux", label: "Joyeux / Léger", color: "#F59E0B" },
  { key: "triste", label: "Triste / Mélancolique", color: "#6366F1" },
  { key: "epique", label: "Épique / Puissant", color: "#FF6B35" },
  { key: "mystere", label: "Mystérieux / Calme", color: "#8B5CF6" },
  { key: "energie", label: "Énergie / Dynamique", color: "#10B981" },
] as const;

// ── Poster styles for position 4 ────────────────────────
export const POSTER_STYLES = [
  { key: "minimaliste", label: "Minimaliste", description: "Un seul élément fort, fond uni" },
  { key: "collage", label: "Collage", description: "Plusieurs images assemblées" },
  { key: "portrait", label: "Portrait", description: "Gros plan sur un visage ou personnage" },
  { key: "scene", label: "Scène clé", description: "Un moment du film capturé" },
  { key: "typographie", label: "Typographie", description: "Le titre en grand, très graphique" },
  { key: "mystere", label: "Mystère", description: "Image floue ou cachée, intrigue" },
] as const;
