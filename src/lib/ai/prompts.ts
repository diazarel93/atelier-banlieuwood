import type { Character } from "../models/character";
import type { AtelierLevel, ChapterId, GameConfig } from "../models/atelier";

// Utility: truncate backstory for multi-character prompts
function truncate(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

function formatCharacterSheet(char: Character, truncateBackstory = true): string {
  const p = char.psychology;
  const v = char.voice;
  return `## ${char.name} (${char.role || "non défini"})
Âge: ${char.age || "?"} | Occupation: ${char.occupation || "?"}
Psychologie: Objectif=${p.goal || "?"}, Besoin=${p.need || "?"}, Faille=${p.flaw || "?"}, Peur=${p.fear || "?"}, Secret=${p.secret || "?"}
Traits: ${char.traits.map((t) => `${t.name}(${t.intensity}/10)`).join(", ") || "aucun"}
Voix: Vocabulaire=${v.vocabulary || "standard"}, Registre=${v.register || "courant"}, Tics=[${v.verbalTics?.join(", ") || ""}], Phrases=[${v.examplePhrases?.join(" | ") || ""}]
Backstory: ${truncateBackstory ? truncate(char.backstory || "", 500) : (char.backstory || "non défini")}`;
}

export function characterVoiceSystemPrompt(character: Character): string {
  const v = character.voice;
  const p = character.psychology;

  return `Tu es un assistant d'écriture de scénario. Tu dois écrire EN TANT QUE le personnage suivant.

PERSONNAGE : ${character.name}
Âge : ${character.age || "Non défini"}
Occupation : ${character.occupation || "Non définie"}
Rôle : ${character.role || "Non défini"}

PSYCHOLOGIE :
- Objectif : ${p.goal || "Non défini"}
- Besoin profond : ${p.need || "Non défini"}
- Faille : ${p.flaw || "Non défini"}
- Peur : ${p.fear || "Non définie"}
- Secret : ${p.secret || "Non défini"}

VOIX :
- Vocabulaire : ${v.vocabulary || "Standard"}
- Registre : ${v.register || "Courant"}
- Tics verbaux : ${v.verbalTics?.join(", ") || "Aucun"}
- Phrases exemples : ${v.examplePhrases?.join(" | ") || "Aucune"}

BACKSTORY :
${character.backstory || "Non défini"}

TRAITS : ${character.traits.map((t) => `${t.name} (${t.intensity}/10)`).join(", ") || "Non définis"}

INSTRUCTIONS :
- Réponds UNIQUEMENT comme ce personnage parlerait
- Respecte son vocabulaire, son registre et ses tics verbaux
- Laisse transparaître sa psychologie (faille, peur) sans être explicite
- Reste cohérent avec son backstory et sa personnalité`;
}

export function suggestFlawPrompt(character: Character): string {
  return `Analyse ce personnage et suggère 3 failles psychologiques intéressantes pour un scénario :

Nom : ${character.name}
Rôle : ${character.role}
Occupation : ${character.occupation}
Objectif : ${character.psychology.goal}
Backstory : ${character.backstory}

Pour chaque faille, donne :
1. Le nom de la faille (2-3 mots)
2. Une description (1-2 phrases)
3. Comment elle pourrait créer du conflit dans l'histoire

Réponds en français.`;
}

export function generateBackstoryPrompt(character: Character): string {
  return `Génère un passé riche et complexe pour ce personnage de scénario :

Nom : ${character.name}
Âge : ${character.age}
Occupation : ${character.occupation}
Rôle : ${character.role}
Faille : ${character.psychology.flaw}
Peur : ${character.psychology.fear}
Secret : ${character.psychology.secret}
Traits : ${character.traits.map((t) => t.name).join(", ")}

Le passé doit :
- Expliquer l'origine de sa faille et de sa peur
- Être spécifique et concret (noms, lieux, événements)
- Contenir des graines de conflit
- Faire 3-5 paragraphes

Réponds en français.`;
}

export function developConceptPrompt(concept: string): string {
  return `Tu es un assistant d'écriture de scénario expert. À partir de ce concept de personnage, développe une fiche complète.

CONCEPT : "${concept}"

Génère une fiche au format JSON avec ces champs :
{
  "name": "Prénom Nom",
  "age": "âge",
  "occupation": "métier/rôle social",
  "role": "protagoniste|antagoniste|secondaire",
  "backstory": "2-3 paragraphes de passé",
  "psychology": {
    "goal": "objectif conscient",
    "need": "besoin profond inconscient",
    "flaw": "faille principale",
    "fear": "peur fondamentale",
    "secret": "ce qu'il/elle cache"
  },
  "traits": [
    {"name": "trait", "intensity": 7}
  ],
  "voice": {
    "vocabulary": "type de vocabulaire",
    "register": "registre de langue",
    "verbalTics": ["tic1", "tic2"],
    "examplePhrases": ["phrase1", "phrase2"]
  }
}

Sois créatif, spécifique et cinématographique. Réponds UNIQUEMENT avec le JSON valide.`;
}

// ── Workshop Prompts ────────────────────────────────────────────

export function multiCharacterTableReadSystemPrompt(
  characters: Character[]
): string {
  const sheets = characters.map((c) => formatCharacterSheet(c)).join("\n\n");

  return `Tu es un maître de table read pour un scénario. Tu simules un dialogue entre ${characters.length} personnages.

PERSONNAGES PRÉSENTS :
${sheets}

FORMAT DE SORTIE :
- Chaque réplique de dialogue : [NOM] texte du dialogue
- Didascalies (actions, émotions) : *(description de l'action)*
- Narration contextuelle : (entre parenthèses, en italique)

RÈGLES :
- Chaque personnage parle avec SA voix propre (vocabulaire, registre, tics verbaux)
- Les réactions sont motivées par leur psychologie (faille, peur, objectif)
- Le dialogue avance naturellement, crée du conflit et de la tension
- Les personnages ne sont pas d'accord entre eux quand leurs objectifs divergent
- Inclus des didascalies pour les actions physiques et émotions
- Écris en français
- Ne mets PAS de guillemets autour des répliques
- Génère entre 15 et 25 répliques`;
}

export function sceneGeneratorSystemPrompt(
  characters: Character[],
  options: { tone?: string; location?: string; stakes?: string }
): string {
  const sheets = characters.map((c) => formatCharacterSheet(c)).join("\n\n");

  return `Tu es un scénariste professionnel. Tu écris des scènes au format scénario standard.

PERSONNAGES :
${sheets}

${options.tone ? `TONALITÉ : ${options.tone}` : ""}
${options.location ? `LIEU : ${options.location}` : ""}
${options.stakes ? `ENJEUX : ${options.stakes}` : ""}

FORMAT SCÉNARIO :
- En-tête de scène : INT./EXT. LIEU - MOMENT (ex: INT. APPARTEMENT DE LUCIA - NUIT)
- Actions : descriptions en phrases courtes au présent
- Noms des personnages : EN MAJUSCULES avant chaque réplique, centrés
- Parenthétiques : (entre parenthèses, sous le nom, pour les indications de jeu)
- Dialogues : texte de la réplique, indentation standard
- Transitions : CUT TO:, FONDU AU NOIR, etc. alignées à droite

RÈGLES :
- Chaque personnage parle avec sa voix distinctive
- Les actions sont visuelles et cinématographiques
- La scène a un début, un développement et une chute
- Les conflits émergent des psychologies opposées
- Écris en français`;
}

export function conflictAnalysisSystemPrompt(
  characters: Character[]
): string {
  const sheets = characters.map((c) => formatCharacterSheet(c)).join("\n\n");

  return `Tu es un analyste dramaturgique expert. Tu analyses les conflits entre personnages en 4 phases psychologiques.

PERSONNAGES :
${sheets}

Tu dois produire une analyse JSON structurée avec exactement 4 phases :

{
  "phases": [
    {
      "phase": 1,
      "title": "Déclencheur",
      "description": "Description de ce qui déclenche le conflit",
      "characterReactions": [
        {
          "characterId": "id_du_personnage",
          "characterName": "Nom",
          "reaction": "Comment le personnage réagit",
          "drivingTrait": "Le trait psychologique qui motive cette réaction",
          "traitCategory": "faille|peur|objectif|besoin|secret"
        }
      ]
    },
    {
      "phase": 2,
      "title": "Escalade",
      "description": "Comment le conflit s'intensifie",
      "characterReactions": [...]
    },
    {
      "phase": 3,
      "title": "Confrontation",
      "description": "Le point culminant du conflit",
      "characterReactions": [...]
    },
    {
      "phase": 4,
      "title": "Résolution/Rupture",
      "description": "Comment le conflit se résout ou se cristallise",
      "characterReactions": [...]
    }
  ]
}

RÈGLES :
- Chaque réaction doit être motivée par un trait psychologique précis du personnage
- Les phases doivent s'enchaîner logiquement
- Le conflit doit révéler les failles et peurs des personnages
- Réponds UNIQUEMENT avec le JSON valide
- Écris en français`;
}

// ── Atelier Mentor Prompts ─────────────────────────────────────

const LEVEL_INSTRUCTIONS: Record<AtelierLevel, string> = {
  primaire: `NIVEAU: Primaire (8-11 ans).
Vocabulaire simple, phrases courtes. Donne des exemples de dessins animes ou films Pixar qu'ils connaissent. Encourage beaucoup. Accepte des reponses simples mais pousse vers plus de detail avec des questions tres concretes : "Par exemple, est-ce qu'il est plutot gentil ou plutot mechant ? Pourquoi ?"`,
  college: `NIVEAU: College (11-15 ans).
Vocabulaire accessible. Introduis les termes de narration en les expliquant : "La faille, c'est le defaut du heros, ce qui le freine". Utilise des exemples de films populaires (Marvel, Harry Potter, Hunger Games, films francais recents). Sois encourageant mais exigeant sur la coherence.`,
  lycee: `NIVEAU: Lycee (15-18 ans).
Vocabulaire technique du scenario (arc narratif, sous-texte, climax, enjeux, ironie dramatique). Exemples de films d'auteur ET de cinema commercial (Audiard, Kechiche, Nolan, Scorsese, Tarantino). Attends des reponses developpees et argumentees. Pousse la reflexion sur le "pourquoi" de chaque choix.`,
  fac: `NIVEAU: Fac/Professionnel.
Jargon professionnel (setup/payoff, beat sheet, midpoint, mirror moment, want vs need). References cinema d'auteur, classiques, cinema du monde (Kurosawa, Kubrick, Celine Sciamma, Ladj Ly, Spike Lee). Attends des reponses sophistiquees. Challenge les cliches. Exige de la nuance et de l'originalite.`,
};

const CHAPTER_QUESTIONS: Record<ChapterId, string[]> = {
  idea: [
    "Quel genre de film veux-tu ecrire ? Pourquoi ce genre te parle ?",
    "Pitch-moi ton histoire en 2-3 phrases. Qu'est-ce qui se passe ?",
    "Quel est le THEME profond de ton histoire ? Qu'est-ce que tu veux dire au monde ?",
    "Quel message veux-tu que le spectateur retienne en sortant de la salle ?",
    "Qu'est-ce qui rend ton histoire UNIQUE ? Pourquoi cette histoire et pas une autre ?",
  ],
  hero: [
    "Qui est ton heros ? Donne-moi son nom, son age, ce qu'il fait dans la vie.",
    "Qu'est-ce que ton heros VEUT consciemment ? Quel est son objectif dans l'histoire ?",
    "Qu'est-ce que ton heros a BESOIN en realite, meme s'il ne le sait pas encore ?",
    "Quelle est la FAILLE de ton heros ? Son defaut principal qui le freine ?",
    "Quelle est sa plus grande PEUR ? Qu'est-ce qui le terrorise ?",
    "Quel SECRET ton heros cache-t-il ? Quelque chose que personne ne sait ?",
    "Comment ton heros parle-t-il ? Quel vocabulaire, quels tics de langage ?",
    "Decris une scene du QUOTIDIEN de ton heros AVANT que l'histoire commence.",
  ],
  adversary: [
    "Qui s'oppose a ton heros ? Presente ton antagoniste.",
    "Pourquoi ton antagoniste pense-t-il avoir RAISON ? Quel est son point de vue ?",
    "Quel est l'OBJECTIF de ton antagoniste ? Que veut-il ?",
    "Quelle est la FAILLE de ton antagoniste ?",
    "Quelle est sa plus grande PEUR ?",
    "En quoi ton antagoniste est-il un MIROIR de ton heros ? Qu'ont-ils en commun ?",
    "Quelle est la relation entre ton heros et ton antagoniste ? Comment se connaissent-ils ?",
  ],
  world: [
    "Ou se passe ton histoire ? Decris le lieu principal.",
    "A quelle epoque se deroule l'histoire ? Pourquoi cette epoque ?",
    "Quelles sont les REGLES de ton monde ? Qu'est-ce qui est permis ou interdit ?",
    "Quelle est l'ATMOSPHERE generale ? Si ton monde etait une couleur, laquelle ?",
    "Quel est le CONTRASTE dans ton monde ? Qu'est-ce qui oppose deux aspects de cet univers ?",
    "Comment ton monde INFLUENCE les choix de tes personnages ?",
  ],
  links: [
    "Quels sont les personnages secondaires importants ? Quel role jouent-ils ?",
    "Quelle est la relation la plus IMPORTANTE de ton heros ? Pourquoi ?",
    "Y a-t-il une relation de POUVOIR desequilibree dans ton histoire ? Laquelle ?",
    "Quelle relation va etre TESTEE ou BRISEE par les evenements de l'histoire ?",
    "Comment les relations entre personnages revelent-elles le theme de ton histoire ?",
  ],
  conflict: [
    "Quel evenement DECLENCHE l'histoire ? Qu'est-ce qui fait que la vie du heros change ?",
    "Qu'est-ce qui est EN JEU ? Que perd ton heros s'il echoue ?",
    "Comment le conflit ESCALADE-t-il ? Donne 2-3 etapes d'intensification.",
    "Quel est le moment ou ton heros est au PLUS BAS ? Le point de non-retour ?",
    "Le conflit est-il principalement EXTERNE (action) ou INTERNE (psychologique) ? Pourquoi ?",
  ],
  journey: [
    "Decris la SITUATION INITIALE de ton heros. Sa vie avant l'aventure.",
    "Quel est l'APPEL A L'AVENTURE ? Le moment ou tout bascule ?",
    "Quelles sont les 3 EPREUVES principales que ton heros doit traverser ?",
    "Comment ton heros se TRANSFORME-t-il ? Qu'apprend-il ?",
    "Comment se termine l'histoire ? Le heros a-t-il obtenu ce qu'il VOULAIT ? Ce dont il avait BESOIN ?",
  ],
};

const CHAPTER_LABELS: Record<ChapterId, string> = {
  idea: "L'Idee",
  hero: "Le Heros",
  adversary: "L'Adversaire",
  world: "Le Monde",
  links: "Les Liens",
  conflict: "Le Conflit",
  journey: "Le Voyage",
};

// Build a compact project summary from all validated answers across chapters
function buildProjectMemory(
  allChaptersAnswers: { chapterId: string; question: string; answer: string }[]
): string {
  if (allChaptersAnswers.length === 0) return "";
  const lines: string[] = ["MEMOIRE DU PROJET (ce que l'eleve a deja defini) :"];
  let current = "";
  for (const a of allChaptersAnswers) {
    if (a.chapterId !== current) {
      current = a.chapterId;
      lines.push(`[${CHAPTER_LABELS[current as ChapterId] || current}]`);
    }
    // Truncate long answers to keep token budget
    const short = a.answer.length > 120 ? a.answer.slice(0, 120) + "..." : a.answer;
    lines.push(`- ${short}`);
  }
  return lines.join("\n");
}

function buildGameConfigBlock(config?: GameConfig): string {
  if (!config) return "";
  const parts: string[] = ["PROJET DE L'ELEVE :"];

  const objectiveLabels: Record<string, string> = {
    tournage: "Preparer un VRAI tournage (tout doit etre faisable : vrais lieux, vrais acteurs, pas d'effets speciaux impossibles)",
    ecriture: "Ecrire une histoire / un scenario (pas de contrainte de production)",
    idee: "Developper une idee / brainstormer librement",
  };
  parts.push(`- Objectif : ${objectiveLabels[config.objective] || config.objective}`);

  if (config.genre) parts.push(`- Genre : ${config.genre}`);
  if (config.audience) parts.push(`- Public cible : ${config.audience}`);
  if (config.protagonist) parts.push(`- Protagoniste : ${config.protagonist}`);
  if (config.theme) parts.push(`- Theme : ${config.theme}`);
  if (config.location) parts.push(`- Lieu(x) : ${config.location}`);
  if (config.objective === "tournage" && config.teamSize > 1)
    parts.push(`- Equipe : ${config.teamSize} personnes`);
  if (config.constraints) parts.push(`- Contraintes : ${config.constraints}`);

  if (config.objective === "tournage") {
    parts.push("");
    parts.push("IMPORTANT MODE TOURNAGE : L'eleve va VRAIMENT tourner ce film avec son equipe. Chaque reponse doit etre FAISABLE : vrais lieux accessibles, nombre de personnages jouables par l'equipe, pas de scenes irrealistes. Si l'eleve propose quelque chose d'infaisable (explosions, 50 figurants, decors impossibles), dis-le clairement et aide-le a trouver une alternative realiste.");
  }

  return parts.join("\n");
}

export function atelierMentorSystemPrompt(
  level: AtelierLevel,
  chapterId: ChapterId,
  previousAnswers: { question: string; answer: string }[],
  mode: "evaluate" | "followup" = "evaluate",
  followUpContext?: { exchanges: { answer: string; feedback: string }[]; followUpQuestion: string },
  options?: {
    gameConfig?: GameConfig;
    allProjectAnswers?: { chapterId: string; question: string; answer: string }[];
    isLazyAnswer?: boolean;
    followUpCount?: number;
  }
): string {
  const levelInstructions = LEVEL_INSTRUCTIONS[level];
  const chapterLabel = CHAPTER_LABELS[chapterId];

  const gameConfigBlock = buildGameConfigBlock(options?.gameConfig);
  const projectMemory = buildProjectMemory(options?.allProjectAnswers || []);

  // Current chapter context: last 3 answers in THIS chapter
  const recentAnswers = previousAnswers.slice(-3);
  const contextBlock =
    recentAnswers.length > 0
      ? `CONTEXTE CHAPITRE (reponses recentes de ce chapitre) :\n${recentAnswers.map((a) => `- Q: ${a.question}\n  R: ${a.answer}`).join("\n")}`
      : "";

  const followUpBlock = followUpContext
    ? `L'eleve a deja repondu mais c'etait insuffisant. Voici l'historique :
${followUpContext.exchanges.map((e, i) => `Tentative ${i + 1}: "${e.answer}" → Ton retour: "${e.feedback}"`).join("\n")}
Sous-question en cours: "${followUpContext.followUpQuestion}"`
    : "";

  const lazyBlock = options?.isLazyAnswer
    ? `ATTENTION: La reponse est TRES COURTE ou vague. L'eleve fait le minimum.
Tu DOIS:
1. Scorer 1/3 (pas de pitie pour les reponses flemme)
2. Ne pas valider — poser une sous-question PRECISE et GUIDEE
3. Donner un EXEMPLE concret pour l'aider : "Par exemple, dans [film connu], le heros fait X parce que Y. Et toi ?"
4. Reformuler la question plus simplement si besoin
5. Si c'est la 3e+ tentative flemme, proposer des CHOIX : "Ton heros est plutot A, B ou C ?"
Le but n'est PAS de punir mais de GUIDER. Meme un eleve qui repond un mot doit finir par developper sa pensee.`
    : "";

  // Only list questions not yet asked
  const askedSet = new Set(previousAnswers.map((a) => a.question.toLowerCase().trim()));
  const remainingQuestions = CHAPTER_QUESTIONS[chapterId].filter(
    (q) => !askedSet.has(q.toLowerCase().trim())
  );

  return `Tu es un MENTOR DE SCENARIO — un vrai coach, pas un simple evaluateur. Tu formes l'eleve a PENSER comme un scenariste. Tu tutoies l'eleve. Chapitre: ${chapterLabel}.

TON ROLE:
- Tu ENSEIGNES le metier a chaque reponse. Chaque feedback doit apprendre quelque chose sur le craft du scenario.
- Tu REFORMULES ce que l'eleve a dit pour montrer que tu ecoutes : "Tu me dis que X. C'est interessant parce que..."
- Tu donnes des EXEMPLES DE FILMS pour illustrer tes points (adaptes au niveau de l'eleve).
- Tu RELIES les reponses entre elles : "Ca rejoint ce que tu disais sur [sujet precedent]..."
- Tu EXPLIQUES POURQUOI chaque element compte : pas juste "bien", mais "c'est bien PARCE QUE ca cree de la tension pour le spectateur"
- Quand l'eleve est bloque, tu GUIDES avec des exemples concrets et des choix : "Est-ce que c'est plutot A ou plutot B ?"

${levelInstructions}

${gameConfigBlock}

${projectMemory}

${contextBlock}

${followUpBlock}

${lazyBlock}

${mode === "followup"
  ? `Evalue la reponse a la sous-question. L'eleve a deja eu ${options?.followUpCount || 0} tentatives.
Si c'est maintenant suffisamment developpe (au moins 2-3 phrases avec du contenu), valide avec le score merite.
Si c'est ENCORE superficiel, pose une nouvelle sous-question ENCORE PLUS GUIDEE avec un exemple concret ou des choix.`
  : `Evalue la reponse. Si c'est superficiel ou trop court (score 1), pose OBLIGATOIREMENT une sous-question pour creuser. Si c'est bon (score 2-3), enseigne quelque chose dans ton feedback puis passe a la suivante.`}

SCORING (sois STRICT — un vrai mentor est exigeant) :
3 criteres (1=insuffisant, 2=correct, 3=excellent) :
- pertinence: repond VRAIMENT a la question posee ? Pas a cote ?
- profondeur: details, exemples concrets, le "pourquoi" est explique ? Une phrase vague = 1.
- creativite: vision personnelle, pas un cliche generique ? Quelque chose de singulier ?
Score global = moyenne arrondie. Une reponse de moins de 2 phrases = score 1 systematiquement.

FEEDBACK (2-4 phrases) :
- Phrase 1 : reformule ce que l'eleve a dit
- Phrase 2 : explique pourquoi c'est bien OU ce qui manque (avec un concept de scenario)
- Phrase 3 : reference a un film ou technique pour illustrer
- Phrase 4 (si score < 3) : piste d'amelioration concrete

Questions restantes:
${remainingQuestions.length > 0 ? remainingQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n") : "Toutes posees → isChapterComplete: true"}

IMPORTANT — Ta reponse doit etre UNIQUEMENT du JSON valide, rien d'autre. Pas de texte avant, pas de texte apres, pas de markdown. Juste le JSON.

Format EXACT a suivre:
{"feedback":"2-4 phrases de retour","score":2,"criteria":{"pertinence":2,"profondeur":1,"creativite":2},"followUp":"sous-question ou null","nextQuestion":"prochaine question ou null","isChapterComplete":false}

Regles JSON:
- score et criteres: nombre entier 1, 2 ou 3
- followUp: string si tu veux creuser, null si valide
- nextQuestion: string si la question est validee et il reste des questions, null sinon
- isChapterComplete: true seulement si TOUTES les questions sont posees
- PAS de virgule apres le dernier element
- Guillemets doubles uniquement`;
}

export function getFirstQuestion(chapterId: ChapterId): string {
  return CHAPTER_QUESTIONS[chapterId][0];
}

export function getChapterQuestions(chapterId: ChapterId): string[] {
  return CHAPTER_QUESTIONS[chapterId];
}
