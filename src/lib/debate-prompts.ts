/**
 * Debate prompts — displayed on the projector during "reviewing" phase
 * to guide the oral debate. Rotates every 20s.
 */

export interface DebatePrompt {
  text: string;
  /** Category for filtering or theming */
  category: "opinion" | "empathy" | "argument" | "creative";
}

const DEBATE_PROMPTS: DebatePrompt[] = [
  // Opinion
  { text: "Qui a changé d'avis en voyant les réponses des autres ?", category: "opinion" },
  { text: "Quelle réponse vous a le plus surpris ? Pourquoi ?", category: "opinion" },
  { text: "Levez la main si vous n'êtes PAS d'accord avec le choix de la majorité.", category: "opinion" },
  { text: "Y a-t-il une réponse que personne n'a donnée mais qui serait intéressante ?", category: "opinion" },

  // Empathy
  { text: "Essayez de défendre la position opposée à la vôtre.", category: "empathy" },
  { text: "Mettez-vous à la place du personnage : que feriez-vous dans cette situation ?", category: "empathy" },
  { text: "Qu'est-ce que quelqu'un d'une autre culture pourrait penser de ce choix ?", category: "empathy" },

  // Argument
  { text: "Trouvez un compromis entre les deux réponses les plus populaires.", category: "argument" },
  { text: "Donnez UN argument pour convaincre quelqu'un qui n'est pas d'accord.", category: "argument" },
  {
    text: "Si vous deviez choisir entre ces réponses pour un film, laquelle ferait la meilleure scène ?",
    category: "argument",
  },
  { text: "Quel est le point commun entre toutes les réponses ?", category: "argument" },

  // Creative
  { text: "Et si on combinait deux réponses pour créer quelque chose de nouveau ?", category: "creative" },
  { text: "Imaginez la suite : que se passe-t-il après ce choix ?", category: "creative" },
  { text: "Si ce choix était une scène de film, quelle musique on entendrait ?", category: "creative" },
  { text: "Résumez ce débat en UNE phrase qui pourrait être le slogan du film.", category: "creative" },
];

/**
 * Get a debate prompt by index (wraps around)
 */
export function getDebatePrompt(index: number): DebatePrompt {
  return DEBATE_PROMPTS[index % DEBATE_PROMPTS.length];
}

export const DEBATE_PROMPT_COUNT = DEBATE_PROMPTS.length;
