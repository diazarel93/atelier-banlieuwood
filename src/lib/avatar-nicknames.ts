/**
 * Cinema-themed avatar nicknames.
 * Each emoji maps to a fun French nickname displayed during the game.
 */
export const AVATAR_NICKNAMES: Record<string, string> = {
  // Cinéma
  "🎬": "Le Réalisateur",
  "🎭": "Double Jeu",
  "🎥": "L'Oeil du Cinéma",
  "🎤": "Voix d'Or",
  "🎞️": "Pellicule Magique",
  "🎦": "Projection Totale",
  "🎪": "Le Grand Spectacle",
  "🎶": "Bande Originale",
  "🎼": "Le Compositeur",
  "🎹": "Touche Finale",
  // Énergie
  "🌟": "L'Étoile Montante",
  "💫": "Flash Cosmique",
  "🔥": "Le Flamboyant",
  "⚡": "Éclair de Génie",
  "🎯": "Dans le Mille",
  "🚀": "Décollage Immédiat",
  "💎": "Diamant Brut",
  "✨": "Pluie d'Étoiles",
  "🌈": "Arc-en-Ciel",
  "🦋": "L'Envol",
  // Fun
  "🎨": "L'Artiste",
  "🎵": "Rythme et Cinéma",
  "🧙‍♂️": "Le Magicien",
  "🦊": "Rusé du Plateau",
  "🐱": "Chat de Gouttière",
  "🦁": "Le Lion du Studio",
  "🎃": "Citrouille Star",
  "👻": "L'Effet Spécial",
  "🤖": "IA du Plateau",
  "🦄": "Créature Mythique",
};

/** All available avatars in display order */
export const EXTENDED_AVATARS = Object.keys(AVATAR_NICKNAMES);

/** Get nickname for an avatar, with fallback */
export function getAvatarNickname(avatar: string): string | null {
  return AVATAR_NICKNAMES[avatar] || null;
}
