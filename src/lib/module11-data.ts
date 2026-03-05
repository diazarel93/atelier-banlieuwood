// ============================================================
// Module 11 "Ciné-Débat" — Stimuli statiques
// 4 séances × 6 situations = 24 stimuli
// ============================================================

export interface CineStimulus {
  id: string;
  seance: number;
  position: number;
  type: "citation" | "scene" | "poster" | "debat";
  // Contenu principal
  text: string;
  author?: string;
  authorRole?: string; // "Réalisateur" | "Acteur" | "Personnage" | "Créateur"
  authorBio?: string;  // Mini bio pour les élèves ("Maître du suspense...")
  authorImageUrl?: string; // Portrait (Wikimedia Commons / libre de droit)
  filmography?: { title: string; year: number; posterPath: string }[]; // Films connus (TMDB poster path)
  sourceTitle?: string;
  sourceYear?: number;
  // Média
  imageUrl?: string;     // URL poster TMDB ou Wikimedia
  videoId?: string;      // YouTube video ID (pour embed)
  videoStart?: number;   // Timestamp début (secondes)
  videoEnd?: number;     // Timestamp fin (secondes)
  // Thème
  theme: "raconter" | "émotion" | "héros" | "coulisses";
}

export const CINE_STIMULI: CineStimulus[] = [
  // ══════════════════════════════════════════════
  // SÉANCE 1 — L'Art de Raconter
  // ══════════════════════════════════════════════
  {
    id: "cd-1-1",
    seance: 1,
    position: 1,
    type: "citation",
    text: "Pour faire un bon film, il faut 3 choses : un bon scénario, un bon scénario, un bon scénario.",
    author: "Alfred Hitchcock",
    authorRole: "Réalisateur",
    authorBio: "Le maître du suspense. Il a inventé le thriller au cinéma.",
    authorImageUrl: "https://image.tmdb.org/t/p/w342/108fiNM6poRieMg7RIqLJRxdAwG.jpg",
    filmography: [
      { title: "Psychose", year: 1960, posterPath: "/lzF8b44dAvXFagQnB1UZa2AF87q.jpg" },
      { title: "Les Oiseaux", year: 1963, posterPath: "/pIc5nX1neiJ38R7b4e8PKqvxbkD.jpg" },
      { title: "Vertigo", year: 1958, posterPath: "/hkhbbSQdsV3U0HtuPugHfx2wOi9.jpg" },
    ],
    theme: "raconter",
  },
  {
    id: "cd-1-2",
    seance: 1,
    position: 2,
    type: "poster",
    text: "Invente le pitch de ce film en une phrase, juste avec cette image.",
    sourceTitle: "Inception",
    sourceYear: 2010,
    imageUrl: "https://image.tmdb.org/t/p/w780/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
    theme: "raconter",
  },
  {
    id: "cd-1-3",
    seance: 1,
    position: 3,
    type: "citation",
    text: "Je commence mes films sans savoir comment ils vont finir.",
    author: "Hayao Miyazaki",
    authorRole: "Réalisateur",
    authorBio: "Génie de l'animation japonaise. Créateur du Studio Ghibli.",
    authorImageUrl: "https://image.tmdb.org/t/p/w342/ouhjt9KugzhWtdEyBPipihB3ic8.jpg",
    filmography: [
      { title: "Le Voyage de Chihiro", year: 2001, posterPath: "/12TAqK0AUgdcYE9ZYZ9r7ASbH5Q.jpg" },
      { title: "Totoro", year: 1988, posterPath: "/eEpy8IiR8N0S6mgkdAjDCMlMYQO.jpg" },
      { title: "Princesse Mononoké", year: 1997, posterPath: "/1AfSDxBTYYtQRVY2V1ISgxXNPVx.jpg" },
    ],
    sourceTitle: "Studio Ghibli",
    theme: "raconter",
  },
  {
    id: "cd-1-4",
    seance: 1,
    position: 4,
    type: "scene",
    text: "Ce film a inventé un nouveau style. Qu'est-ce qui le rend unique visuellement ?",
    sourceTitle: "Spider-Man: Into the Spider-Verse",
    sourceYear: 2018,
    videoId: "g4Hbz2jLxvQ",
    theme: "raconter",
  },
  {
    id: "cd-1-5",
    seance: 1,
    position: 5,
    type: "debat",
    text: "Un bon film n'a PAS besoin de dialogue. Les images suffisent.",
    theme: "raconter",
  },
  {
    id: "cd-1-6",
    seance: 1,
    position: 6,
    type: "citation",
    text: "Et si les jouets étaient vivants ?",
    author: "Pixar",
    authorRole: "Créateur",
    authorBio: "Le studio qui a révolutionné l'animation. Chaque film commence par un « Et si... »",
    filmography: [
      { title: "Toy Story", year: 1995, posterPath: "/4cWLRhub0yY9VJpdw0nqoTPYyiN.jpg" },
      { title: "Nemo", year: 2003, posterPath: "/8zR2vXoXfdlknEYjfHvCbb1rJbI.jpg" },
      { title: "Ratatouille", year: 2007, posterPath: "/iFcWBdTPeHQDS3OQxBcH3QaYXYv.jpg" },
    ],
    sourceTitle: "Toy Story",
    sourceYear: 1995,
    theme: "raconter",
  },

  // ══════════════════════════════════════════════
  // SÉANCE 2 — Émotions à l'Écran
  // ══════════════════════════════════════════════
  {
    id: "cd-2-1",
    seance: 2,
    position: 1,
    type: "scene",
    text: "Pourquoi cette scène fait pleurer tout le monde ? Quels sont les ingrédients ?",
    sourceTitle: "Le Roi Lion",
    sourceYear: 1994,
    videoId: "UmPmpUTr22c",
    theme: "émotion",
  },
  {
    id: "cd-2-2",
    seance: 2,
    position: 2,
    type: "citation",
    text: "Je ne joue pas la tristesse. Je joue quelqu'un qui essaie de ne PAS être triste.",
    author: "Joaquin Phoenix",
    authorRole: "Acteur",
    authorBio: "Oscar du meilleur acteur pour Joker. Un des plus grands de sa génération.",
    authorImageUrl: "https://image.tmdb.org/t/p/w342/u38k3hQBDwNX0VA22aQceDp9Iyv.jpg",
    filmography: [
      { title: "Joker", year: 2019, posterPath: "/tWjJ3ILjsbTwKgXxEv48QAbYZ19.jpg" },
      { title: "Gladiator", year: 2000, posterPath: "/5gJOu3t2QrznuJqjCG7FQDMI76t.jpg" },
      { title: "Her", year: 2013, posterPath: "/nkWXW5blXGmOEoDejRgy83sSb6T.jpg" },
    ],
    theme: "émotion",
  },
  {
    id: "cd-2-3",
    seance: 2,
    position: 3,
    type: "poster",
    text: "Si tu devais ajouter une 6e émotion dans le film, ce serait laquelle ?",
    sourceTitle: "Vice-Versa",
    sourceYear: 2015,
    imageUrl: "https://image.tmdb.org/t/p/w780/lRHE0vzf3oYJrhbsHXjIkF4Tl5A.jpg",
    theme: "émotion",
  },
  {
    id: "cd-2-4",
    seance: 2,
    position: 4,
    type: "scene",
    text: "Naruto choisit le pardon au lieu de la vengeance. C'est fort ou c'est naïf ?",
    sourceTitle: "Naruto Shippuden",
    sourceYear: 2010,
    videoId: "MNL_DAI19Ok",
    theme: "émotion",
  },
  {
    id: "cd-2-5",
    seance: 2,
    position: 5,
    type: "debat",
    text: "Les films d'horreur, c'est pas du vrai cinéma.",
    theme: "émotion",
  },
  {
    id: "cd-2-6",
    seance: 2,
    position: 6,
    type: "citation",
    text: "Le silence est parfois plus puissant que n'importe quel dialogue.",
    author: "Stanley Kubrick",
    authorRole: "Réalisateur",
    authorBio: "Perfectionniste légendaire. Chaque plan est un tableau.",
    authorImageUrl: "https://image.tmdb.org/t/p/w342/yFT0VyIelI9aegZrsAwOG5iVP4v.jpg",
    filmography: [
      { title: "2001, l'Odyssée", year: 1968, posterPath: "/uwd79G32FPIL5B9UkRgSZvS0gbe.jpg" },
      { title: "Shining", year: 1980, posterPath: "/cnniZQGtjK8kh2tsjih4GtkX6bl.jpg" },
      { title: "Orange Mécanique", year: 1971, posterPath: "/n2oKNiEq9DZljqs6xsxs8hnsW9p.jpg" },
    ],
    theme: "émotion",
  },

  // ══════════════════════════════════════════════
  // SÉANCE 3 — Héros & Anti-Héros
  // ══════════════════════════════════════════════
  {
    id: "cd-3-1",
    seance: 3,
    position: 1,
    type: "scene",
    text: "Iron Man se sacrifie. Un héros DOIT-il se sacrifier pour être un vrai héros ?",
    sourceTitle: "Avengers: Endgame",
    sourceYear: 2019,
    videoId: "TcMBFSGVi1c",
    theme: "héros",
  },
  {
    id: "cd-3-2",
    seance: 3,
    position: 2,
    type: "citation",
    text: "Je ne reviens jamais sur ma parole, c'est mon nindo.",
    author: "Naruto Uzumaki",
    authorRole: "Personnage",
    authorBio: "Orphelin devenu le ninja le plus puissant. Créé par Masashi Kishimoto.",
    filmography: [
      { title: "Naruto", year: 2002, posterPath: "/xppeysfvDKVx775MFuH8Z9BlpMk.jpg" },
      { title: "Naruto Shippuden", year: 2007, posterPath: "/zAYRe2bJxpWTVrwwmBc00VFkAf4.jpg" },
    ],
    sourceTitle: "Naruto",
    theme: "héros",
  },
  {
    id: "cd-3-3",
    seance: 3,
    position: 3,
    type: "poster",
    text: "Le Joker est-il un méchant ou une victime ? Justifie.",
    sourceTitle: "Joker",
    sourceYear: 2019,
    imageUrl: "https://image.tmdb.org/t/p/w780/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    theme: "héros",
  },
  {
    id: "cd-3-4",
    seance: 3,
    position: 4,
    type: "debat",
    text: "Le meilleur méchant de tous les temps, c'est Thanos.",
    theme: "héros",
  },
  {
    id: "cd-3-5",
    seance: 3,
    position: 5,
    type: "scene",
    text: "Un héros qui devient méchant : trahison ou évolution logique ?",
    sourceTitle: "L'Attaque des Titans",
    sourceYear: 2022,
    videoId: "SlSa_pSYqKE",
    theme: "héros",
  },
  {
    id: "cd-3-6",
    seance: 3,
    position: 6,
    type: "citation",
    text: "Tout le monde porte un masque. Spider-Man n'est que plus honnête.",
    author: "Stan Lee",
    authorRole: "Créateur",
    authorBio: "L'homme qui a inventé Marvel. Spider-Man, X-Men, Avengers... c'est lui.",
    authorImageUrl: "https://image.tmdb.org/t/p/w342/kKeyWoFtTqOPsbmwylNHmuB3En9.jpg",
    filmography: [
      { title: "Spider-Man", year: 2002, posterPath: "/pNz1NREgddPdlzytlR8mW4B26fW.jpg" },
      { title: "Avengers", year: 2012, posterPath: "/ylsAO88v2tF0iXRFojPa0UaAJf1.jpg" },
      { title: "X-Men", year: 2000, posterPath: "/3zgG4m8ZCaR61O6OOZNAsSDn0rv.jpg" },
    ],
    sourceTitle: "Spider-Man",
    theme: "héros",
  },

  // ══════════════════════════════════════════════
  // SÉANCE 4 — Les Coulisses
  // ══════════════════════════════════════════════
  {
    id: "cd-4-1",
    seance: 4,
    position: 1,
    type: "scene",
    text: "Pour ou contre : tourner en décor réel vs tout en numérique ?",
    sourceTitle: "Dune",
    sourceYear: 2021,
    videoId: "GoAA0sYkLI0",
    theme: "coulisses",
  },
  {
    id: "cd-4-2",
    seance: 4,
    position: 2,
    type: "citation",
    text: "Le film Paranormal Activity a coûté 15 000 $. Il a rapporté 193 millions.",
    author: "Oren Peli",
    authorRole: "Réalisateur",
    authorBio: "Il a tourné un film d'horreur chez lui avec une caméra à 200 $. Record de rentabilité.",
    authorImageUrl: "https://image.tmdb.org/t/p/w342/mNj3nStQ55K5M1woWo6F5dpDpb9.jpg",
    filmography: [
      { title: "Paranormal Activity", year: 2007, posterPath: "/1Kxhdm6up44BzZoVGAGuD5zYxYY.jpg" },
    ],
    sourceTitle: "Paranormal Activity",
    sourceYear: 2007,
    theme: "coulisses",
  },
  {
    id: "cd-4-3",
    seance: 4,
    position: 3,
    type: "debat",
    text: "L'IA va remplacer les acteurs dans 10 ans.",
    theme: "coulisses",
  },
  {
    id: "cd-4-4",
    seance: 4,
    position: 4,
    type: "citation",
    text: "Le monteur est le dernier auteur du film.",
    author: "Walter Murch",
    authorRole: "Monteur",
    authorBio: "Monteur légendaire. Il a monté Apocalypse Now et inventé le sound design.",
    authorImageUrl: "https://image.tmdb.org/t/p/w342/kQh7U7kRLF9NKEMpxiGjZEIu0o3.jpg",
    filmography: [
      { title: "Apocalypse Now", year: 1979, posterPath: "/scaiAT7I2KZ2GAeMvoU6Ro1515J.jpg" },
      { title: "Le Parrain II", year: 1974, posterPath: "/fATmEcLwO3tTiisa8gYxhV3x4sS.jpg" },
    ],
    theme: "coulisses",
  },
  {
    id: "cd-4-5",
    seance: 4,
    position: 5,
    type: "poster",
    text: "Combien de personnes faut-il pour faire un film ? Devine.",
    sourceTitle: "Black Panther",
    sourceYear: 2018,
    imageUrl: "https://image.tmdb.org/t/p/w780/uxzzxijgPIY7slzFvMotPv8wjKA.jpg",
    theme: "coulisses",
  },
  {
    id: "cd-4-6",
    seance: 4,
    position: 6,
    type: "scene",
    text: "Cascadeur : métier de rêve ou métier de fou ?",
    sourceTitle: "Mission: Impossible — Rogue Nation",
    sourceYear: 2015,
    videoId: "aJKg_3hfBGQ",
    theme: "coulisses",
  },
];

/** Find stimulus by séance + position */
export function getCineStimulus(seance: number, position: number): CineStimulus | undefined {
  return CINE_STIMULI.find((s) => s.seance === seance && s.position === position);
}

/** Get all stimuli for a séance */
export function getStimuliForSeance(seance: number): CineStimulus[] {
  return CINE_STIMULI.filter((s) => s.seance === seance);
}
