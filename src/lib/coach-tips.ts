/**
 * Coach tips — short encouraging tips shown before each question type.
 * Written in French for kids (10-16 years old).
 * Multiple variants per category so it doesn't repeat.
 */

const COACH_TIPS: Record<string, string[]> = {
  default: [
    "Il n'y a pas de mauvaise reponse !",
    "Pense a un film que tu aimes...",
    "Ecris ce qui te vient, tu pourras changer apres.",
    "Fais-toi confiance, t'as des idees en or !",
  ],
  personnage: [
    "Imagine quelqu'un que tu connais...",
    "Donne-lui un defaut, ca le rend reel !",
    "Un bon personnage, on a envie de le suivre.",
    "Pense a ce qui le fait rire ou pleurer.",
  ],
  conflit: [
    "Le conflit, c'est le moteur de l'histoire !",
    "Qu'est-ce qui pourrait mal tourner ?",
    "Sans probleme, pas d'histoire. Ose !",
    "Plus c'est complique, plus c'est interessant.",
  ],
  environnement: [
    "Ferme les yeux, imagine le lieu...",
    "Les details rendent l'histoire vivante !",
    "Quel bruit on entend dans cet endroit ?",
    "Un bon decor, c'est un personnage en plus.",
  ],
  liens: [
    "Les liens entre personnages creent l'emotion.",
    "Ami ou ennemi ? Parfois les deux...",
    "Qu'est-ce qui les relie ? Qu'est-ce qui les separe ?",
    "Pense aux gens autour de toi.",
  ],
  trajectoire: [
    "Comment ton personnage va changer ?",
    "Au debut il est comme ca... a la fin ?",
    "Le voyage compte autant que la destination.",
    "Qu'est-ce qu'il va apprendre en chemin ?",
  ],
  vote: [
    "Vote pour celle qui te fait le plus reagir !",
    "Pas la plus jolie, la plus forte.",
    "Laquelle t'a donne des frissons ?",
    "Choisis l'idee que tu voudrais voir au cinema.",
  ],
  relance: [
    "Le prof te challenge -- montre ce que tu sais faire !",
    "Creuse plus profond, t'es presque au tresor.",
    "Va plus loin, tu peux le faire !",
    "C'est le moment de surprendre tout le monde.",
  ],
  budget: [
    "Chaque credit compte !",
    "Un bon film n'a pas besoin d'etre cher.",
    "Fais des choix malins, comme un vrai producteur.",
    "Parfois le moins cher est le plus creatif !",
  ],
  emotion_cachee: [
    "Quelle emotion se cache derriere ?",
    "Les emotions, c'est la magie du cinema.",
    "Ecoute ce que tu ressens...",
    "Chaque scene a une emotion secrete.",
  ],
  pitch: [
    "En une phrase : qui veut quoi, mais...",
    "Si tu devais convaincre en 10 secondes ?",
    "Un bon pitch donne envie d'en savoir plus.",
    "Court, percutant, inoubliable !",
  ],
  // Extra categories from constants
  intention: [
    "Qu'est-ce que ton personnage veut vraiment ?",
    "Derriere chaque action, il y a une intention.",
    "Pourquoi il fait ca ? C'est la cle !",
  ],
  renforcement: [
    "Renforce ton idee, pousse-la au max !",
    "Comment rendre ca encore plus fort ?",
    "Ajoute un detail qui change tout.",
  ],
  imagination: [
    "Laisse ton imagination s'envoler !",
    "Et si tout etait possible ?",
    "Les meilleures idees sont les plus folles.",
    "Ose inventer, c'est ton histoire !",
  ],
};

/**
 * Returns a random coach tip for the given category.
 * Falls back to "default" if category not found.
 */
export function getCoachTip(category: string): string {
  const tips = COACH_TIPS[category] ?? COACH_TIPS.default;
  return tips[Math.floor(Math.random() * tips.length)];
}
