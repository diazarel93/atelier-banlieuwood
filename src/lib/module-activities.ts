// ═══════════════════════════════════════════════════════
// MODULE ACTIVITIES — Static activity metadata per module/seance
// Extracted from module-briefing.tsx for reusability
// ═══════════════════════════════════════════════════════

export interface ActivityInfo {
  type: string;
  emoji: string;
  label: string;
  detail: string;
  tags: string[];
}

export const MODULE_ACTIVITIES: Record<string, ActivityInfo> = {
  m1a: {
    type: "quiz",
    emoji: "🎯",
    label: "Quiz de positionnement",
    detail:
      "8 questions à choix. Les élèves découvrent leur profil créatif sur 4 axes : observation, narration, émotion, audace. Stats en temps réel sur l'écran.",
    tags: ["QCM", "Profil", "Stats live"],
  },
  m1b: {
    type: "image",
    emoji: "👁️",
    label: "Lecture d'image",
    detail:
      "Une photo projetée → chaque élève écrit ce qu'il voit, ressent et imagine. Vous choisissez 2 réponses contrastées pour le débat.",
    tags: ["Image", "Texte libre", "Confrontation"],
  },
  m1c: {
    type: "image",
    emoji: "👁️",
    label: "Lecture d'image",
    detail:
      "Même principe avec une photo d'intérieur. Observer, décrire, imaginer la suite. Projeter 2 regards opposés.",
    tags: ["Image", "Texte libre", "Confrontation"],
  },
  m1d: {
    type: "image",
    emoji: "👁️",
    label: "Lecture d'image",
    detail: "Dernière image. Peut être rapide ou sautée si le temps manque. Clôture la phase d'observation.",
    tags: ["Image", "Optionnel"],
  },
  m1e: {
    type: "notebook",
    emoji: "📝",
    label: "Écriture libre",
    detail:
      "Page blanche numérique. Les élèves notent leurs idées, images, fragments d'histoire. Pas de bonne ou mauvaise réponse.",
    tags: ["Carnet", "Créativité", "Calme"],
  },
  u2a: {
    type: "checklist",
    emoji: "✅",
    label: "Checklist + récit",
    detail:
      "Étape 1 : checklist de 20 références culturelles (Squid Game, Naruto, Spider-Verse...). Étape 2 : raconter une scène marquante. Étape 3 : décrypter l'émotion cachée.",
    tags: ["Checklist", "Récit", "Analyse"],
  },
  u2b: {
    type: "game",
    emoji: "🎮",
    label: "Jeu de construction",
    detail:
      "Les élèves choisissent une émotion (peur, colère, honte, jalousie, joie) puis construisent une scène avec des jetons : 5 slots, 8 tokens max. L'IA donne un feedback.",
    tags: ["Scene Builder", "Jetons", "IA feedback"],
  },
  u2c: {
    type: "debate",
    emoji: "💬",
    label: "Débat collectif",
    detail:
      "Vous projetez 2 scènes anonymes d'élèves. La classe débat : laquelle communique mieux son émotion ? Pourquoi ?",
    tags: ["Projection", "Débat", "Collectif"],
  },
  u2d: {
    type: "choice",
    emoji: "🏁",
    label: "Choix thématique",
    detail:
      "Les élèves nomment le thème de leur histoire (amitié, injustice, secret...) et l'arc de leur personnage (gagne, perd, change...). Bilan.",
    tags: ["QCM", "Synthèse", "Bilan"],
  },
  m2a: {
    type: "qa",
    emoji: "🎬",
    label: "Questions-réponses",
    detail:
      "8 questions sur les métiers du cinéma, les coûts, les contraintes. Comprendre ce que veut dire « produire un film » à leur échelle.",
    tags: ["Culture ciné", "Q&R", "Métiers"],
  },
  m2b: {
    type: "game",
    emoji: "💰",
    label: "Jeu de budget",
    detail:
      "100 crédits d'énergie créative à répartir sur 5 postes : casting, décors, image, son, montage. Chaque choix a un coût. Résultat projeté en moyennes.",
    tags: ["Budget", "Contraintes", "Stratégie"],
  },
  m2c: {
    type: "qa",
    emoji: "⚡",
    label: "Résolution de problèmes",
    detail:
      "8 imprévus de tournage (acteur absent, pluie, batterie vide...). Les élèves proposent des solutions créatives sous pression.",
    tags: ["Problèmes", "Créativité", "Pression"],
  },
  m2d: {
    type: "qa",
    emoji: "📋",
    label: "Plan de production",
    detail:
      "8 questions pour organiser leur tournage : planning, rôles, scènes clés, plan B. Passer de l'idée au concret.",
    tags: ["Organisation", "Planning", "Pitch"],
  },
  "m2-perso": {
    type: "qa",
    emoji: "🪞",
    label: "Portrait créatif",
    detail:
      "8 questions pour explorer leur univers : films préférés, héros, méchants, émotions. Trouver le fil rouge vers LEUR histoire.",
    tags: ["Personnel", "Univers", "Inspiration"],
  },
  m3: {
    type: "qa",
    emoji: "🦸",
    label: "Création de personnage",
    detail:
      "8 questions pour construire le héros : qui il est, ce qu'il veut, sa faille, son secret, son meilleur ami, son rival, son lieu, l'ambiance. Fondations du film.",
    tags: ["Personnage", "Écriture", "Worldbuilding"],
  },
  m4: {
    type: "qa",
    emoji: "⚔️",
    label: "Construction du conflit",
    detail:
      "8 questions : l'événement déclencheur, l'obstacle, l'adversaire, le premier essai, le dilemme, le choix impossible, le moment de vérité, l'après. Le cœur du récit.",
    tags: ["Conflit", "Tension", "Arc narratif"],
  },
  m5: {
    type: "qa",
    emoji: "💎",
    label: "Sens et thème",
    detail:
      "5 questions pour prendre du recul : le pitch en une phrase, l'émotion du spectateur, le vrai message, la scène clé, le titre du film.",
    tags: ["Thème", "Pitch", "Titre"],
  },
  m10a: {
    type: "image",
    emoji: "✨",
    label: "Et si...",
    detail:
      "À partir d'une image, les élèves imaginent un scénario « Et si... ? ». Écriture libre, banque d'idées, QCM créatif.",
    tags: ["Image", "Écriture", "Imagination"],
  },
  m10b: {
    type: "game",
    emoji: "🎤",
    label: "Pitch en 30s",
    detail:
      "Créer un personnage, définir son objectif et obstacle, puis pitcher l'histoire chrono en main. Confrontation des pitchs.",
    tags: ["Personnage", "Pitch", "Chrono"],
  },
  m12a: {
    type: "game",
    emoji: "🗳️",
    label: "Vote collectif",
    detail:
      "8 manches de vote pour construire le film de la classe : ton, situation, personnages, objectif, obstacle, scène, relation, moment fort. Chaque manche propose 3 cartes.",
    tags: ["Vote", "Collectif", "8 manches"],
  },
  m6: {
    type: "notebook",
    emoji: "✏️",
    label: "Écriture collaborative",
    detail:
      "Frise narrative, scènes IA, missions d'écriture par rôle (dialoguiste, descripteur, chorégraphe, émotionnel), assemblage du scénario final.",
    tags: ["Scénario", "IA", "Missions"],
  },
  m7: {
    type: "image",
    emoji: "🎥",
    label: "Langage visuel",
    detail:
      "4 plans fondamentaux (large, moyen, gros plan, réaction). Quiz de comparaison visuelle, mini-découpage des scènes clés, storyboard.",
    tags: ["Plans", "Cadrage", "Storyboard"],
  },
  m8: {
    type: "game",
    emoji: "🎭",
    label: "Formation d'équipe",
    detail:
      "Quiz des métiers du cinéma, débrief collectif, choix des rôles par ordre de mérite (classement invisible), carte talent personnalisée.",
    tags: ["Métiers", "Rôles", "Talent"],
  },
  m11a: {
    type: "debate",
    emoji: "🎬",
    label: "L'Art de Raconter",
    detail: "Citations, affiches, scènes : découvrez comment les grands réalisateurs racontent. Analyse et débat.",
    tags: ["Citations", "Affiches", "Débat"],
  },
  m11b: {
    type: "debate",
    emoji: "😢",
    label: "Émotions à l'Écran",
    detail: "Pourquoi cette scène fait pleurer ? Décryptage des outils du cinéma : musique, silence, jeu d'acteur.",
    tags: ["Émotion", "Analyse", "Débat"],
  },
  m11c: {
    type: "debate",
    emoji: "🦸",
    label: "Héros & Anti-Héros",
    detail:
      "Sacrifice, pardon, trahison. Qu'est-ce qui fait un vrai héros ? Et un bon méchant ? Argumentation et confrontation.",
    tags: ["Héros", "Morale", "Débat"],
  },
  m11d: {
    type: "debate",
    emoji: "🎥",
    label: "Les Coulisses",
    detail:
      "Budget, cascades, IA, montage. Les secrets de fabrication du cinéma. L'IA et l'avenir du cinéma en débat final.",
    tags: ["Production", "IA", "Débat"],
  },
};
