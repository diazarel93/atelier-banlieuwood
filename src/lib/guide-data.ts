// ——————————————————————————————————————————————————————
// GUIDE ANIMATEUR — Contenu pédagogique expert
// Rattaché au socle commun de l'Éducation Nationale
// ——————————————————————————————————————————————————————

export interface ModuleGuide {
  moduleId: string;
  title: string;
  objectifPedagogique: string;
  socleCommun: string[];
  competences: string[];
  introADire: string;
  aQuoiEtreAttentif: string[];
  commentRelancer: string[];
  commentChallenger: string[];
  conseils: string[];
  duration: string;
  phases: { name: string; timing: string; instruction: string }[];
}

export interface QuestionGuide {
  position: number;
  category: string;
  label: string;
  whatToExpect: string;
  commonPitfalls: string;
  relancePhrase: string;
  challengePhrase: string;
}

// ——————————————————————————————————————————————————————
// MODULE GUIDES
// ——————————————————————————————————————————————————————

const MODULE_GUIDES: ModuleGuide[] = [
  {
    moduleId: "m1a",
    title: "Positionnement",
    objectifPedagogique:
      "Découvrir le profil créatif de chaque élève à travers 8 questions fermées. Identifier les axes dominants (observation, narration, émotion, audace) pour adapter la suite.",
    socleCommun: ["D1", "D5"],
    competences: [
      "Se positionner et exprimer des préférences argumentées",
      "Prendre conscience de son rapport à la création",
      "Découvrir différentes façons d'appréhender une œuvre",
    ],
    introADire:
      "On va commencer par un petit questionnaire rapide. 8 questions, pas de bonne ou mauvaise réponse — c'est pour découvrir quel genre de créatif tu es. Tu choisis la réponse qui te correspond le plus.",
    aQuoiEtreAttentif: [
      "Élèves qui hésitent longtemps — les rassurer : il n'y a pas de piège",
      "Élèves qui cherchent la 'bonne' réponse — rappeler qu'on cherche LEUR préférence",
      "Le rythme : avancer question par question, pas trop vite",
    ],
    commentRelancer: [
      "Pas de bonne réponse — choisis celle qui te parle le plus",
      "Imagine-toi dans la situation, qu'est-ce que tu ferais vraiment ?",
    ],
    commentChallenger: ["Tu hésites entre deux ? Choisis celle qui te ressemble LE PLUS, même un peu"],
    conseils: [
      "Avancer question par question pour garder l'attention",
      "Montrer les stats en temps réel sur l'écran (bar chart) pour créer de l'émulation",
      "Commenter les résultats : 'Tiens, beaucoup d'entre vous ont choisi...'",
      "Garder un rythme dynamique — 1 minute max par question",
    ],
    duration: "~10 min",
    phases: [
      {
        name: "Intro",
        timing: "2 min",
        instruction: "Expliquer le principe : 8 questions, on choisit ce qui nous correspond.",
      },
      {
        name: "Questions",
        timing: "6 min",
        instruction: "Avancer question par question. Commenter brièvement les stats affichées à l'écran.",
      },
      {
        name: "Débrief",
        timing: "2 min",
        instruction: "Résumer les tendances de la classe. Transition vers les images.",
      },
    ],
  },
  {
    moduleId: "m1b",
    title: "Image 1 — La rue",
    objectifPedagogique:
      "Libérer la parole à partir d'une image ambiguë. Observer, interpréter, imaginer — en une seule réponse libre. Confronter deux visions contrastées.",
    socleCommun: ["D1", "D5"],
    competences: [
      "Décrire une image avec précision",
      "Formuler des hypothèses et les justifier",
      "Écouter et comparer des interprétations différentes",
    ],
    introADire:
      "Regardez bien cette image. Prenez votre temps. Ensuite je vous pose UNE question — vous écrivez ce que vous voyez, ce que vous ressentez, ce que vous imaginez. Après, on confrontera deux réponses.",
    aQuoiEtreAttentif: [
      "Réponses trop courtes (1-2 mots) — encourager à développer",
      "Élèves qui copient — rappeler qu'il n'y a pas de bonne réponse",
      "Pour la confrontation : choisir deux réponses CONTRASTÉES, pas les meilleures",
    ],
    commentRelancer: [
      "Regarde les couleurs, la lumière. Ça te fait penser à quoi ?",
      "Si tu étais DANS cette image, tu ferais quoi ?",
      "Qu'est-ce qui t'a sauté aux yeux en premier ?",
    ],
    commentChallenger: [
      "Tu penses que c'est quoi l'histoire derrière cette image ?",
      "Si c'était l'ouverture d'un film, qu'est-ce qui se passerait après ?",
    ],
    conseils: [
      "Laisser 2-3 min de réflexion silencieuse avant d'ouvrir les réponses",
      "Pour la confrontation, choisir deux visions DIFFÉRENTES, pas 'la meilleure' — c'est le contraste qui fait débat",
      "Projeter les deux réponses anonymement et laisser la classe réagir à l'oral",
      "Ne pas trancher — le but est de montrer qu'il y a plusieurs lectures possibles",
    ],
    duration: "~15 min",
    phases: [
      { name: "Observation", timing: "3 min", instruction: "Projeter l'image. Silence. Les élèves observent." },
      { name: "Écriture", timing: "4 min", instruction: "Ouvrir la question. Les élèves écrivent leur réponse." },
      {
        name: "Confrontation",
        timing: "8 min",
        instruction: "Choisir 2 réponses contrastées. Les projeter. Débat oral en classe.",
      },
    ],
  },
  {
    moduleId: "m1c",
    title: "Image 2 — L'intérieur",
    objectifPedagogique:
      "Approfondir la lecture d'image avec une scène d'intérieur. Développer l'attention aux détails et la capacité à reconstruire une histoire à partir d'indices visuels.",
    socleCommun: ["D1", "D5"],
    competences: [
      "Décrire une image avec précision",
      "Formuler des hypothèses et les justifier",
      "Écouter et comparer des interprétations différentes",
    ],
    introADire:
      "Deuxième image. Même principe : observez, écrivez, puis on confronte. Cette fois c'est un intérieur — regardez les objets, la lumière, ce qui traîne...",
    aQuoiEtreAttentif: [
      "Élèves qui répètent la même structure que pour l'image 1 — pousser vers de nouvelles pistes",
      "Réponses plus détaillées attendues — ils ont compris le principe maintenant",
      "Pour la confrontation : varier les critères de sélection par rapport à l'image 1",
    ],
    commentRelancer: [
      "Qui était assis là ? Qu'est-ce qu'il faisait avant de partir ?",
      "Si quelqu'un ouvrait la porte maintenant, ce serait qui ?",
      "Quel objet te semble le plus important dans cette image ?",
    ],
    commentChallenger: [
      "Cette pièce raconte une histoire. Laquelle ?",
      "Qu'est-ce qui s'est passé ici il y a 5 minutes ?",
    ],
    conseils: [
      "Comparer les réactions avec l'image 1 — est-ce que les élèves sont plus à l'aise ?",
      "Encourager les élèves qui n'ont pas parlé lors de la première confrontation",
      "Varier le type de confrontation : cette fois, peut-être deux visions du MÊME détail",
    ],
    duration: "~15 min",
    phases: [
      { name: "Observation", timing: "3 min", instruction: "Projeter l'image. Silence." },
      { name: "Écriture", timing: "4 min", instruction: "Ouvrir la question. Les élèves écrivent." },
      { name: "Confrontation", timing: "8 min", instruction: "Choisir 2 réponses contrastées. Projeter. Débat." },
    ],
  },
  {
    moduleId: "m1d",
    title: "Image 3 — Le banc",
    objectifPedagogique:
      "Dernière image, la plus complexe (deux personnages, relation à deviner). Travailler l'interprétation des postures et des relations non-dites.",
    socleCommun: ["D1", "D5"],
    competences: [
      "Interpréter des indices visuels subtils (postures, distance)",
      "Imaginer un dialogue ou une dynamique relationnelle",
      "Argumenter son interprétation face au groupe",
    ],
    introADire:
      "Dernière image. Celle-ci est un peu différente — il y a deux personnes. Regardez leur posture, l'espace entre elles, ce qu'elles regardent...",
    aQuoiEtreAttentif: [
      "Image optionnelle — si le temps manque, peut être sautée",
      "Les élèves projettent souvent leurs propres relations sur l'image — c'est normal et riche",
      "Attention aux interprétations romantiques qui peuvent gêner certains élèves",
    ],
    commentRelancer: [
      "Ils se connaissent ou pas ces deux-là ?",
      "Qu'est-ce qu'ils se disent ? Ou est-ce qu'ils se taisent ?",
      "Lequel des deux va se lever en premier ? Pourquoi ?",
    ],
    commentChallenger: [
      "Si tu devais écrire leur dialogue, ça donnerait quoi ?",
      "Quelle est la relation entre ces deux personnes ? Prouve-le avec un détail de l'image.",
    ],
    conseils: [
      "Si le temps est court, cette image peut être optionnelle",
      "Bonne image pour introduire la notion de 'relation entre personnages'",
      "La confrontation ici peut porter sur la NATURE de la relation (amis ? famille ? inconnus ?)",
    ],
    duration: "~10 min",
    phases: [
      { name: "Observation", timing: "2 min", instruction: "Projeter l'image. Silence." },
      { name: "Écriture", timing: "3 min", instruction: "Ouvrir la question. Les élèves écrivent." },
      { name: "Confrontation", timing: "5 min", instruction: "Confrontation rapide ou discussion orale directe." },
    ],
  },
  {
    moduleId: "m1e",
    title: "Carnet d'idées",
    objectifPedagogique:
      "Temps d'écriture libre pour que chaque élève note ses idées, images mentales et fragments d'histoires inspirés par les images. Premier geste d'écriture personnelle.",
    socleCommun: ["D1", "D2"],
    competences: [
      "Écrire librement sans contrainte formelle",
      "Organiser ses idées et impressions",
      "Faire le lien entre stimuli visuels et création personnelle",
    ],
    introADire:
      "Maintenant c'est votre moment. Prenez votre carnet — écrivez tout ce qui vous est passé par la tête pendant les images. Des mots, des phrases, des bouts d'histoires, des noms de personnages, des lieux... Tout est bon. C'est VOTRE carnet.",
    aQuoiEtreAttentif: [
      "Élèves bloqués devant la page blanche — les rassurer, suggérer de commencer par un mot",
      "Élèves qui écrivent très peu — c'est normal, l'important c'est qu'ils commencent",
      "Élèves qui écrivent beaucoup — les laisser faire, ne pas interrompre",
      "Ambiance calme — pas de discussion pendant l'écriture",
    ],
    commentRelancer: [
      "Repense aux images. Y'a un truc qui t'a marqué ?",
      "Écris juste un mot. Un seul. Puis un deuxième.",
      "Si tu devais faire un film avec ce que tu as vu, ça parlerait de quoi ?",
    ],
    commentChallenger: [],
    conseils: [
      "Mettre de la musique douce en fond (optionnel)",
      "Ne pas lire les carnets à voix haute — c'est privé",
      "Ce carnet servira de base pour les modules suivants",
      "5-10 minutes suffisent, pas besoin de forcer",
    ],
    duration: "~10 min",
    phases: [
      {
        name: "Lancement",
        timing: "1 min",
        instruction: "Expliquer la consigne. Insister : pas de règle, pas de jugement.",
      },
      {
        name: "Écriture",
        timing: "7 min",
        instruction: "Silence. Les élèves écrivent. Passer dans les rangs discrètement.",
      },
      { name: "Clôture", timing: "2 min", instruction: "Remercier. Annoncer que ce carnet sera utile pour la suite." },
    ],
  },
  {
    moduleId: "m2-perso",
    title: "Vis ma vie",
    objectifPedagogique:
      "Apprendre à construire un personnage complexe (désir, faille, secret, arc) sans le formuler explicitement. Développer l'empathie narrative et la capacité à se mettre dans la peau d'un autre. Ancrer dans le réel : des personnages qu'on pourrait croiser dans la vraie vie.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Inventer un personnage avec des motivations, des obstacles et un secret",
      "Se mettre dans la peau d'un autre et imaginer ses réactions",
      "Réécrire et reconsidérer ses idées face à un retournement",
      "Synthétiser une histoire complexe en une phrase (pitch)",
    ],
    introADire:
      "Je vais vous montrer quelqu'un. Vous ne le connaissez pas. Personne ne le connaît. C'est à vous de décider qui c'est, ce qu'il veut, ce qu'il cache. Attention : c'est quelqu'un de VRAI, pas un super-héros, pas un personnage de jeu vidéo. Quelqu'un qu'on pourrait croiser dans la rue. Et attention — il y aura des surprises.",
    aQuoiEtreAttentif: [
      "SUPER-HÉROS / PERSONNAGES DE FICTION — Si un élève propose Spider-Man ou un perso de manga, recadrer immédiatement : 'On invente quelqu'un de VRAI, quelqu'un qu'on pourrait croiser en bas de chez toi'",
      "Pouvoirs magiques ou surnaturels — rappeler qu'on va TOURNER ce film, il faut que ce soit faisable",
      "Personnages stéréotypés (princesse, ninja) — pousser vers l'originalité et le réalisme",
      "Réponses trop courtes ou superficielles — relancer avec 'Mais encore ?'",
      "Élèves qui copient — valoriser l'originalité sans stigmatiser",
      "Le twist (Q5) peut déstabiliser — c'est normal et pédagogique",
      "La confrontation (Q6) peut devenir violente — cadrer vers l'émotion, pas l'action",
    ],
    commentRelancer: [
      "C'est quelqu'un qu'on pourrait croiser dans la rue. Pas un super-héros. Quelqu'un de VRAI.",
      "Imagine que tu ES cette personne. Tu fais quoi là maintenant ?",
      "Qu'est-ce qui la rend différente de tous les gens que tu connais ?",
      "Si on devait tourner ce film avec des vrais acteurs, dans un vrai quartier — ça donne quoi ?",
    ],
    commentChallenger: [
      "C'est trop facile. Un VRAI personnage a des zones d'ombre. Où sont les siennes ?",
      "Les meilleurs films parlent de gens normaux dans des situations extraordinaires. Pas de super-pouvoirs.",
      "La personne au téléphone, est-ce qu'elle a raison d'appeler ? De SON point de vue ?",
      "Le twist devrait tout changer. Est-ce que ça change vraiment ta vision du personnage ?",
    ],
    conseils: [
      "CADRER DÈS LE DÉBUT : 'On invente quelqu'un de vrai, qu'on pourrait filmer avec un téléphone dans le quartier'",
      "Les élèves ne savent pas qu'ils construisent un personnage de film — ne pas le révéler trop tôt",
      "Si ça part en super-héros, pas de jugement : 'C'est cool mais nous on fait du VRAI cinéma, comme les films qu'on voit au ciné'",
      "Après le vote de chaque question, résumer : 'OK, donc notre personnage, c'est quelqu'un qui...'",
      "Le twist (Q5) est le moment clé — laisser un temps de surprise avant de relancer",
      "À la fin, récapituler : ils ont créé un personnage complet sans s'en rendre compte",
      "Faire le lien avec l'écriture qui viendra après : 'Voilà comment naît un personnage de film'",
    ],
    duration: "~40 min",
    phases: [
      {
        name: "Présentation",
        timing: "3 min",
        instruction:
          "Afficher l'image du personnage sur l'écran de projection. Lire l'intro. Ne PAS dire que c'est un exercice de création de personnage — juste 'on va jouer'.",
      },
      {
        name: "Construction (Q1-Q4)",
        timing: "20 min",
        instruction:
          "Questions 1 à 4. Pour chaque : ouvrir les réponses → lire à voix haute les plus intéressantes → vote → valider. Résumer à chaque fois ce qu'on sait du personnage.",
      },
      {
        name: "Twist (Q5)",
        timing: "5 min",
        instruction:
          "Le retournement. Marquer une pause dramatique avant de lancer la question. Laisser les élèves réagir. Ce moment doit surprendre — c'est la leçon : un bon scénariste remet tout en question.",
      },
      {
        name: "Confrontation + Fin (Q6-Q8)",
        timing: "12 min",
        instruction:
          "Finir l'arc du personnage. Q6 = relation, Q7 = dénouement visuel, Q8 = pitch en une phrase. À la fin : 'Vous venez de créer un personnage de film complet. Bravo.'",
      },
    ],
  },
  {
    moduleId: "m2a",
    title: "Le Cinéma",
    objectifPedagogique:
      "Comprendre les fondamentaux de la production cinématographique : métiers, coûts, contraintes. Découvrir que faire un film est un travail d'équipe avec des choix à chaque étape.",
    socleCommun: ["D3", "D4", "D5"],
    competences: [
      "Identifier les métiers du cinéma et leurs responsabilités",
      "Comprendre les notions de coût et de contrainte de production",
      "Réfléchir aux compromis nécessaires dans un projet créatif",
    ],
    introADire:
      "Aujourd'hui on va découvrir comment on FABRIQUE un film. Pas l'histoire — la fabrication. Qui fait quoi, combien ça coûte, quelles sont les galères. Vous allez voir : produire un film, c'est un vrai défi.",
    aQuoiEtreAttentif: [
      "Élèves qui pensent que le réalisateur fait tout seul — rappeler le travail d'équipe",
      "Confusion entre acteur et réalisateur — clarifier les rôles",
      "Élèves qui pensent que c'est facile/rapide — c'est l'occasion d'ouvrir les yeux",
    ],
    commentRelancer: [
      "Pense à un film que tu aimes. Il a fallu combien de personnes pour le faire ?",
      "Si tu devais tourner un film demain, de quoi tu aurais besoin ?",
    ],
    commentChallenger: [
      "Et si on devait tourner avec ZÉRO budget — c'est possible ?",
      "Le réalisateur est-il vraiment le plus important ? Sans cadreur, pas d'image...",
    ],
    conseils: [
      "Faire le lien avec des films que les élèves connaissent",
      "Montrer des exemples concrets : 'un téléphone = une caméra'",
      "Garder le rythme : ces questions préparent le terrain pour le quiz budget",
    ],
    duration: "~20 min",
    phases: [
      {
        name: "Découverte",
        timing: "5 min",
        instruction: "Présenter le sujet : on va parler de la FABRICATION d'un film. Pas l'histoire — le making-of.",
      },
      {
        name: "Questions collaboratives",
        timing: "12 min",
        instruction:
          "8 questions en rythme soutenu. Pour chaque : réponse libre → discussion rapide → synthèse collective.",
      },
      {
        name: "Synthèse",
        timing: "3 min",
        instruction:
          "Résumer : produire un film = équipe + budget + contraintes + créativité. Transition vers le quiz budget.",
      },
    ],
  },
  {
    moduleId: "m2b",
    title: "Contrainte + Responsabilité",
    objectifPedagogique:
      "Comprendre que créer c'est choisir et renoncer. Découvrir les contraintes de production cinématographique. Développer l'esprit critique face aux choix budgétaires.",
    socleCommun: ["D3", "D4"],
    competences: [
      "Exercer son esprit critique, faire des choix raisonnés",
      "Comprendre les notions de coût, de priorité et de compromis",
      "Argumenter et justifier ses décisions",
      "Travailler en autonomie et prendre des initiatives",
    ],
    introADire:
      "Vous êtes producteurs de film. Vous avez 100 crédits — c'est votre budget total. Impossible de tout avoir : des stars ET des décors incroyables ET des effets spéciaux. Chaque choix a un coût. À vous de décider où mettre votre argent.",
    aQuoiEtreAttentif: [
      "Élèves qui mettent tout dans une seule catégorie — manque de compréhension du compromis",
      "Ceux qui ne comprennent pas le concept de budget — expliquer avec des exemples concrets",
      "Comparaisons avec de vrais films — c'est excellent, encourager",
      "Frustration de ne pas pouvoir tout avoir — c'est normal et pédagogique !",
    ],
    commentRelancer: [
      "Pourquoi Stars plutôt que Amateurs ? Ça change quoi pour ton film ?",
      "Tu as mis beaucoup en effets spéciaux. C'est quoi ton film, un Marvel ?",
      "Il te reste combien ? Tu peux encore changer d'avis !",
      "Regarde le budget de ton voisin. C'est différent du tien — pourquoi ?",
    ],
    commentChallenger: [
      "Certains grands films n'ont pas d'effets spéciaux — comment ils font pour captiver ?",
      "Un film avec 0 en musique, c'est possible ? Ça donne quoi ?",
      "Si tu devais couper encore 20 crédits, tu sacrifies quoi ?",
      "Le film le plus cher de l'histoire a fait un flop. L'argent fait-il un bon film ?",
    ],
    conseils: [
      "Laisser les élèves découvrir par eux-mêmes que 100 crédits c'est peu",
      "Ne pas donner la 'bonne' réponse — il n'y en a pas, c'est l'exercice",
      "Comparer les budgets en groupe est le moment le plus riche pédagogiquement",
      "Faire le lien avec la vraie industrie : Paranormal Activity = $15K, Avatar = $237M",
      "La réserve minimum de 10 crédits simule les imprévus de production",
    ],
    duration: "~45 min",
    phases: [
      {
        name: "Explication",
        timing: "10 min",
        instruction:
          "Présenter le concept de budget. Montrer les 5 catégories et les 3 options de chaque. Insister : 100 crédits MAX, réserve minimum 10.",
      },
      {
        name: "Choix individuels",
        timing: "15 min",
        instruction:
          "Chaque élève fait ses choix sur son écran. Circuler dans la salle, poser des questions sur leurs stratégies. Ne pas influencer.",
      },
      {
        name: "Comparaison en groupe",
        timing: "15 min",
        instruction:
          "Afficher les résultats. Comparer les choix. Demander à 2-3 élèves d'expliquer leur stratégie. Débattre : c'est quoi un 'bon' budget ?",
      },
    ],
  },
  {
    moduleId: "m2c",
    title: "Les Imprévus",
    objectifPedagogique:
      "Résoudre des problèmes créatifs sous pression. Développer l'adaptabilité et l'esprit de solution face aux aléas d'un tournage.",
    socleCommun: ["D2", "D3", "D4"],
    competences: [
      "Analyser un problème et proposer des solutions créatives",
      "Travailler sous contrainte de temps et de moyens",
      "Coopérer pour surmonter un obstacle imprévu",
    ],
    introADire:
      "Sur un tournage, RIEN ne se passe comme prévu. Jamais. L'acteur est malade, il pleut, la batterie meurt. Les meilleurs réalisateurs sont ceux qui trouvent des solutions. Aujourd'hui, c'est vous les réalisateurs — et on va voir comment vous gérez les galères.",
    aQuoiEtreAttentif: [
      "Élèves qui répondent 'on annule tout' — pousser vers la solution créative",
      "Réponses trop faciles ('on attend') — rappeler que le temps c'est de l'argent",
      "Élèves qui paniquent face au scénario — les rassurer, c'est un exercice",
    ],
    commentRelancer: [
      "OK c'est la galère. Mais tu es le réalisateur, tout le monde te regarde. Tu fais quoi ?",
      "Et si cet imprévu devenait une CHANCE pour ton film ?",
    ],
    commentChallenger: [
      "Les plus grands films ont eu des imprévus qui les ont rendus meilleurs. Trouve le côté positif.",
      "Tu n'as pas le droit d'annuler. Le spectacle continue. C'est quoi ton plan ?",
    ],
    conseils: [
      "Jouer sur l'urgence — ces scénarios sont faits pour mettre la pression",
      "Encourager les solutions originales, pas les solutions 'scolaires'",
      "Faire voter la meilleure solution pour créer de l'émulation",
      "Relier chaque imprévu à un vrai cas de l'industrie du cinéma",
    ],
    duration: "~20 min",
    phases: [
      {
        name: "Mise en situation",
        timing: "3 min",
        instruction:
          "Expliquer le principe : 8 scénarios catastrophe, vous êtes le réalisateur, vous devez trouver une solution.",
      },
      {
        name: "Scénarios",
        timing: "14 min",
        instruction:
          "Enchaîner les 8 scénarios. Pour chaque : lire le problème → réponses → vote de la meilleure solution → commentaire rapide.",
      },
      {
        name: "Bilan",
        timing: "3 min",
        instruction:
          "Résumer les leçons : adaptabilité, créativité sous pression, toujours un plan B. Transition vers le plan de tournage.",
      },
    ],
  },
  {
    moduleId: "m2d",
    title: "Le Plan",
    objectifPedagogique:
      "Synthétiser tout le module 2 en construisant un plan de tournage concret. Passer de l'idée à l'action : équipe, planning, repérage, premier et dernier plan.",
    socleCommun: ["D2", "D3", "D4"],
    competences: [
      "Planifier et organiser un projet concret",
      "Synthétiser des apprentissages en un plan d'action",
      "Présenter et pitcher un projet de façon claire",
    ],
    introADire:
      "On a appris les métiers, géré le budget, survécu aux imprévus. Maintenant on passe aux choses sérieuses : vous allez construire VOTRE plan de tournage. Qui fait quoi, où on tourne, dans quel ordre, et surtout — quelle est la première et la dernière image de votre film.",
    aQuoiEtreAttentif: [
      "Plans trop ambitieux ('on tourne dans 10 lieux') — rappeler les contraintes vues avant",
      "Pas assez de détails concrets — pousser vers le praticable",
      "Élèves qui oublient le repérage — insister sur la préparation",
    ],
    commentRelancer: [
      "Si tu devais tourner demain, tu serais prêt ? Qu'est-ce qu'il te manque ?",
      "C'est concret ce que tu proposes ? On pourrait vraiment le faire ?",
    ],
    commentChallenger: [
      "Ton plan tient en une après-midi ? Prouve-le.",
      "Le premier plan de ton film, c'est ce qui accroche le spectateur. Il est assez fort ?",
    ],
    conseils: [
      "Faire le lien avec toutes les séances précédentes du module",
      "Le pitch final est l'aboutissement — chaque élève doit pouvoir résumer en une phrase",
      "Encourager les plans réalistes et faisables, pas les rêves de Hollywood",
      "Le premier et dernier plan sont les moments les plus importants du film",
    ],
    duration: "~20 min",
    phases: [
      {
        name: "Rappel",
        timing: "3 min",
        instruction: "Récapituler les apprentissages : métiers, budget, imprévus. On passe à l'action.",
      },
      {
        name: "Construction du plan",
        timing: "14 min",
        instruction: "8 questions pour construire le plan. Chaque réponse est une brique concrète du tournage.",
      },
      {
        name: "Présentation",
        timing: "3 min",
        instruction: "Pitch final : chaque groupe/élève résume son plan en une phrase. Applaudir les meilleurs pitchs.",
      },
    ],
  },
  {
    moduleId: "m3",
    title: "C'est l'histoire de qui ?",
    objectifPedagogique:
      "Créer collectivement un personnage riche et nuancé, ses relations et son univers. Construire un protagoniste RÉALISTE avec désir, faille et secret — quelqu'un qu'on pourrait filmer.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Écrire de façon claire et structurée",
      "Coopérer et contribuer à un projet collectif",
      "Mobiliser son imagination au service d'un récit",
      "Comprendre la notion de personnage complexe (désir, faille, secret)",
    ],
    introADire:
      "On va construire le héros de notre film ensemble. Attention : c'est un VRAI film qu'on va écrire, pas un dessin animé, pas un jeu vidéo. Notre personnage, c'est quelqu'un qu'on pourrait croiser dans la rue, dans le quartier, au collège. Quelqu'un de VRAI, avec ses qualités, ses défauts, ses secrets. C'est VOTRE personnage.",
    aQuoiEtreAttentif: [
      "SUPER-HÉROS ET PERSOS DE FICTION — Recadrer tout de suite : 'On fait un VRAI film, pas Marvel. Un personnage qu'un acteur peut jouer, dans un lieu qu'on peut filmer'",
      "Personnage trop parfait (pas de faille) — rappeler que les héros intéressants ont des défauts",
      "Pouvoirs magiques, fantasy, SF — 'C'est cool mais nous on fait du cinéma réaliste. Les meilleurs films parlent de gens normaux.'",
      "Élèves qui veulent imposer LEUR idée — rappeler que c'est collectif",
      "Confusion entre désir (ce qu'il veut) et besoin (ce qu'il lui faut vraiment)",
      "Descriptions trop vagues — demander des détails concrets",
    ],
    commentRelancer: [
      "C'est quelqu'un qu'on peut croiser dans la vraie vie. Pas un super-héros. Qui c'est ?",
      "Imagine que tu rencontres ce personnage dans la rue. Tu le reconnais à quoi ?",
      "Qu'est-ce qui le distingue de TOUS les gens que tu connais ?",
      "Ferme les yeux. Tu es dans son quartier. Décris ce que tu vois, ce que tu entends.",
    ],
    commentChallenger: [
      "Les meilleurs films parlent de gens ordinaires dans des situations extraordinaires. Pas besoin de super-pouvoirs.",
      "Son secret, est-ce que ça pourrait détruire sa vie si quelqu'un l'apprenait ?",
      "L'allié, est-ce qu'il est vraiment fiable à 100% ?",
      "Le lieu, est-ce qu'on pourrait y aller demain avec une caméra et tourner ?",
    ],
    conseils: [
      "RÈGLE D'OR : si on ne peut pas le filmer avec un téléphone et des acteurs du collège, c'est pas réaliste",
      "Chaque réponse votée construit le personnage collectif — montrer comment les pièces s'assemblent",
      "Afficher les choix validés au fur et à mesure pour que le groupe voit le personnage prendre forme",
      "Reformuler les choix collectifs pour les rendre cohérents entre eux",
      "Faire le lien entre chaque question : le lieu influence le personnage, le secret influence les relations...",
      "Le vote n'est pas une compétition — c'est un outil de choix collectif",
    ],
    duration: "~45 min",
    phases: [
      {
        name: "Introduction",
        timing: "5 min",
        instruction:
          "Rappeler les choix de production du Module 2. Expliquer qu'on va maintenant créer l'histoire. Lire l'intro aux élèves.",
      },
      {
        name: "Questions collaboratives",
        timing: "5 min par question",
        instruction:
          "Pour chaque question : ouvrir les réponses → lire à voix haute → sélectionner les meilleures → vote → valider le choix collectif. Reformuler si besoin.",
      },
      {
        name: "Synthèse du personnage",
        timing: "5 min",
        instruction:
          "Relire tous les choix validés. Le personnage existe maintenant. Demander au groupe : 'Vous l'aimez, votre héros ?'",
      },
    ],
  },
  {
    moduleId: "m4",
    title: "Il se passe quoi ?",
    objectifPedagogique:
      "Construire le conflit central, la tension dramatique et les obstacles. Comprendre la structure narrative : déclencheur, obstacles, dilemme, point bas, résolution.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Structurer un récit avec une progression dramatique",
      "Comprendre les notions de conflit, obstacle et dilemme",
      "Écrire des scènes de tension et de confrontation",
      "Articuler cause et conséquence dans un récit",
    ],
    introADire:
      "Notre héros existe, son monde aussi. Maintenant, il faut qu'il se passe quelque chose. Un problème arrive — un gros problème. Quelque chose qui va tout changer. Et notre héros va devoir se battre.",
    aQuoiEtreAttentif: [
      "Conflit trop simple ou résolu trop vite — un bon conflit prend du temps",
      "Pas d'enjeux réels — demander 'qu'est-ce qu'il perd si ça rate ?'",
      "Adversaire unidimensionnel (juste 'méchant') — lui donner des motivations",
      "Dilemme trop facile — un vrai dilemme n'a pas de bonne réponse évidente",
      "Point bas pas assez bas — tout doit sembler perdu, vraiment",
    ],
    commentRelancer: [
      "Qu'est-ce que le héros a à PERDRE si ça tourne mal ?",
      "L'adversaire, est-ce qu'il pense être le méchant ? Ou il pense avoir raison ?",
      "C'est quoi le pire qui pourrait arriver au héros à ce moment ?",
      "Si tu étais à sa place, tu ferais quoi ? Et pourquoi c'est dur ?",
    ],
    commentChallenger: [
      "Et si l'obstacle venait de l'intérieur du héros, pas de l'extérieur ?",
      "Le premier essai échoue. Mais est-ce que cet échec lui apprend quelque chose ?",
      "Un bon dilemme, c'est quand les deux options sont mauvaises. Trouve-moi ça.",
      "Le sursaut — est-ce que c'est sa faille du début qui devient sa force ?",
    ],
    conseils: [
      "Rappeler les choix du Module 3 (personnage, faille, secret) — tout est connecté",
      "Le conflit naît souvent de la faille du personnage — faire le lien",
      "L'adversaire doit avoir des raisons valables — pas juste 'il est méchant'",
      "Le dilemme est le cœur de l'histoire — prendre le temps sur cette question",
      "Le point bas doit toucher à la faille intime du héros pour être puissant",
    ],
    duration: "~45 min",
    phases: [
      {
        name: "Rappel",
        timing: "5 min",
        instruction:
          "Récapituler le personnage créé en Séance 1. Rappeler sa faille et son secret — ça va servir. Lire l'intro.",
      },
      {
        name: "Construction du conflit",
        timing: "5 min par question",
        instruction:
          "Même mécanique : réponses → vote → choix collectif. Mais cette fois, insister sur les LIENS entre les réponses. Le déclencheur cause l'obstacle, l'obstacle mène au dilemme...",
      },
      {
        name: "Fil rouge",
        timing: "5 min",
        instruction:
          "Relire la séquence complète : déclencheur → obstacle → premier essai → dilemme → point bas → sursaut → confrontation. Est-ce que ça tient ?",
      },
    ],
  },
  {
    moduleId: "m5",
    title: "Ça raconte quoi en vrai ?",
    objectifPedagogique:
      "Donner du sens à l'histoire, trouver le thème profond et le message. Boucler le récit avec une résolution cohérente et un titre.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Identifier le thème et le message d'un récit",
      "Formuler une interprétation personnelle et la justifier",
      "Synthétiser un récit complexe en une phrase claire",
      "Comprendre la transformation du personnage (arc narratif)",
    ],
    introADire:
      "On a une histoire. Un héros, un monde, un conflit, une confrontation. Mais de quoi parle VRAIMENT notre film ? Pas l'histoire — le SUJET. C'est quoi le message ? C'est quoi la leçon ? Et comment ça finit ?",
    aQuoiEtreAttentif: [
      "Message trop explicite ou moralisateur — un film montre, il ne dit pas",
      "Fin trop facile (tout s'arrange comme par magie) — exiger de la cohérence",
      "Pas de transformation du héros — le héros DOIT avoir changé",
      "Titre trop long ou trop générique — pousser vers quelque chose de marquant",
      "Déconnexion entre le message et l'histoire racontée — vérifier la cohérence",
    ],
    commentRelancer: [
      "Si quelqu'un te demande 'c'est quoi ton film ?', tu réponds quoi en UNE phrase ?",
      "Le héros au début et le héros à la fin — c'est la même personne ?",
      "Qu'est-ce que le spectateur doit retenir en sortant de la salle ?",
      "La scène clé, c'est celle que tu racontes à tes potes. C'est laquelle ?",
    ],
    commentChallenger: [
      "Happy end ou pas ? Les deux se défendent — mais il faut choisir. Pourquoi ?",
      "Est-ce que le message de votre film existe déjà dans un autre film ? Qu'est-ce qui rend le vôtre unique ?",
      "Le titre, est-ce qu'il contient déjà l'histoire ? Les meilleurs titres racontent quelque chose.",
      "Si on changeait la fin, est-ce que le message change aussi ?",
    ],
    conseils: [
      "C'est la séance la plus 'intellectuelle' — adapter le vocabulaire au niveau du groupe",
      "Faire le lien avec des films que les élèves connaissent pour illustrer la notion de message",
      "Le titre est le dernier choix — il résume tout. Ne pas le bâcler.",
      "Relire l'intégralité de l'histoire à la fin — moment solennel, le film existe",
      "Féliciter le groupe : ils ont créé une histoire complète ensemble",
    ],
    duration: "~45 min",
    phases: [
      {
        name: "Récapitulatif complet",
        timing: "10 min",
        instruction:
          "Relire TOUTE l'histoire depuis le début : personnage, monde, déclencheur, conflit, confrontation. Tout doit être frais dans les esprits.",
      },
      {
        name: "Sens et résolution",
        timing: "5 min par question",
        instruction:
          "Les questions sont plus philosophiques ici. Laisser plus de temps de réflexion. Accepter les débats — c'est le but.",
      },
      {
        name: "Clôture",
        timing: "5 min",
        instruction:
          "Lire le film complet à voix haute. Applaudir. C'est LEUR film. Transition vers les résultats ou la fiche de cours.",
      },
    ],
  },
  // ——— MODULE 2 : Émotion Cachée (u2a / u2b / u2c / u2d) ———
  {
    moduleId: "u2a",
    title: "Mise en bain",
    objectifPedagogique:
      "Activer la culture audiovisuelle des élèves pour créer un socle commun. Passer de la consommation passive à l'observation active d'une scène. Commencer à identifier les émotions sous-jacentes.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Mobiliser ses références culturelles et les partager",
      "Décrire une scène avec précision (ce qu'on voit, ce qu'on ressent)",
      "Formuler des hypothèses sur les motivations d'un personnage",
      "Écouter et comparer des interprétations différentes",
    ],
    introADire:
      "Aujourd'hui on va parler de vos contenus préférés — séries, films, anime. On va chercher ce qui vous touche VRAIMENT dans une scène. Pas juste ce qui est cool — ce qui vous fait ressentir quelque chose.",
    aQuoiEtreAttentif: [
      "Élèves qui ne connaissent rien de la liste — les rassurer, tout choix est valable",
      "Réponses 'scène marquante' trop résumées — insister sur les DÉTAILS et les ÉMOTIONS",
      "Difficulté à passer du 'c'est cool' au 'je ressens...' — c'est normal, guider",
      "Certains élèves peuvent être timides sur leurs goûts — valoriser tous les choix",
    ],
    commentRelancer: [
      "Ferme les yeux. Tu revois ta scène préférée. Qu'est-ce que tu vois en premier ?",
      "C'est quoi l'émotion que tu as ressentie à ce moment-là ?",
      "Si tu devais montrer cette scène à quelqu'un qui ne connaît pas, tu dirais quoi ?",
    ],
    commentChallenger: [
      "Tu dis que le personnage veut gagner. Mais est-ce qu'il veut vraiment ça, ou autre chose au fond ?",
      "L'émotion cachée, c'est souvent celle qu'on ne dit pas tout de suite. Creuse.",
    ],
    conseils: [
      "La checklist culturelle sert de brise-glace — garder un rythme rapide",
      "La scène marquante est le vrai exercice — prendre le temps",
      "Projeter les top contenus à l'écran pour créer du lien dans la classe",
      "Valoriser les choix originaux autant que les choix populaires",
    ],
    duration: "~30 min",
    phases: [
      {
        name: "Checklist",
        timing: "5 min",
        instruction:
          "Chaque élève sélectionne les contenus qu'il connaît (≥3), puis choisit son préféré. Commenter les tendances à l'écran.",
      },
      {
        name: "Scène marquante",
        timing: "15 min",
        instruction:
          "Écriture libre : décrire UNE scène qui les a marqués. Insister sur les détails sensoriels et émotionnels, pas le résumé.",
      },
      {
        name: "Entre les lignes",
        timing: "10 min",
        instruction:
          "Question ouverte : qu'est-ce que le personnage veut VRAIMENT ? Confronter 2 réponses. Transition vers l'émotion cachée.",
      },
    ],
  },
  {
    moduleId: "u2b",
    title: "Émotion Cachée",
    objectifPedagogique:
      "Nommer une émotion complexe et la transformer en matériau narratif. Construire une scène sous contraintes (jetons/emplacements) pour comprendre que créer c'est choisir.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Identifier et nommer des émotions complexes",
      "Transformer une émotion en intention narrative (personnage + conflit)",
      "Faire des choix créatifs sous contraintes budgétaires",
      "Articuler intention, obstacle et résolution dans une scène",
    ],
    introADire:
      "La dernière fois, on a trouvé ce qui nous touche. Aujourd'hui, on va transformer ça en scène. Vous allez choisir une émotion, inventer un personnage qui la vit, et construire votre scène avec un budget limité de jetons. Chaque choix compte.",
    aQuoiEtreAttentif: [
      "Élèves qui choisissent l'émotion 'au hasard' — les ramener à leur scène marquante",
      "Scènes sans vrai obstacle — 'Mon personnage veut X mais...' le MAIS est essentiel",
      "Abus de jetons sur le spectaculaire sans lien narratif — questionner la pertinence",
      "Élèves bloqués sur l'intention — proposer 'Mon personnage veut être accepté/compris/libre...'",
    ],
    commentRelancer: [
      "Ton personnage veut quelque chose. Qu'est-ce qui l'en EMPÊCHE ?",
      "Tu as 8 jetons. Chaque élément doit servir l'émotion. L'explosion, elle sert à quoi ?",
      "Le changement à la fin — ton personnage est différent comment ?",
    ],
    commentChallenger: [
      "Un dialogue + un silence coûtent 0 jeton et peuvent être plus puissants qu'une explosion. Essaie.",
      "Ta scène a beaucoup d'action mais pas d'émotion visible. Et si tu enlevais un élément pour ajouter un gros plan ?",
      "Les meilleurs films font beaucoup avec peu. Montre-moi.",
    ],
    conseils: [
      "Le choix d'émotion est un moment clé — laisser le temps de la réflexion",
      "Le scene builder est ludique mais pédagogique — les contraintes de jetons enseignent le compromis",
      "L'AI feedback est bienveillant et non-bloquant — les rassurer",
      "Faire le lien avec le Module 2 (budget) : ici aussi, créer c'est choisir",
      "Les éléments Tier 0 (gratuits) sont souvent les plus narratifs — le faire remarquer",
    ],
    duration: "~40 min",
    phases: [
      {
        name: "L'émotion",
        timing: "5 min",
        instruction:
          "Question fermée : choisir parmi 5 émotions. Montrer la distribution à l'écran. Commenter les choix de la classe.",
      },
      {
        name: "Construction",
        timing: "25 min",
        instruction:
          "Chaque élève construit sa scène : intention + obstacle + changement, puis éléments visuels/narratifs avec budget jetons. L'IA donne un feedback bienveillant.",
      },
      {
        name: "Débrief",
        timing: "10 min",
        instruction:
          "Partager quelques scènes à l'oral. Montrer la distribution des émotions. Transition vers la phase collective.",
      },
    ],
  },
  {
    moduleId: "u2c",
    title: "Phase Collective",
    objectifPedagogique:
      "Comparer deux visions pour développer l'esprit critique et la capacité d'argumentation. Comprendre que la même émotion peut être racontée de manières très différentes.",
    socleCommun: ["D1", "D3"],
    competences: [
      "Comparer deux propositions créatives avec des critères précis",
      "Argumenter un choix esthétique et narratif",
      "Accepter la divergence de points de vue",
      "Formuler une critique constructive",
    ],
    introADire:
      "On va projeter deux scènes créées par des élèves de la classe — anonymes. Votre mission : laquelle communique le mieux l'émotion ? Pas laquelle est 'la meilleure' — laquelle FAIT RESSENTIR quelque chose. Et on va débattre.",
    aQuoiEtreAttentif: [
      "Votes 'pour mon pote' — rappeler que c'est anonyme et qu'on juge la scène, pas la personne",
      "Critiques méchantes — recadrer : on cherche ce qui FONCTIONNE, pas ce qui est nul",
      "Consensus mou ('les deux sont bien') — pousser à choisir et argumenter",
      "Élèves qui ne participent pas au débat — les solliciter directement",
    ],
    commentRelancer: [
      "Dans la scène A, l'émotion arrive comment ? Et dans la B ?",
      "Laquelle t'a fait ressentir quelque chose ? Pas 'comprendre' — RESSENTIR.",
      "Tu n'es pas d'accord avec la majorité. Explique-nous ce que tu vois.",
    ],
    commentChallenger: [
      "La scène la plus spectaculaire n'est pas toujours la plus touchante. Pourquoi ?",
      "Si les deux scènes parlent de la même émotion, pourquoi elles sont si différentes ?",
      "Un bon débat au cinéma, c'est normal. Les meilleurs films divisent.",
    ],
    conseils: [
      "Choisir 2 scènes CONTRASTÉES pour la projection (pas les 'meilleures')",
      "L'anonymat est crucial — ne jamais révéler les auteurs pendant la phase",
      "Le débat est le cœur pédagogique — ne pas le couper trop tôt",
      "Valoriser les désaccords : c'est la preuve que les élèves analysent vraiment",
    ],
    duration: "~30 min",
    phases: [
      {
        name: "Projection",
        timing: "5 min",
        instruction: "Projeter les 2 scènes anonymes côte à côte. Laisser les élèves lire en silence.",
      },
      {
        name: "La plus claire",
        timing: "15 min",
        instruction:
          "Question : laquelle communique le mieux l'émotion ? Réponses → vote → discussion. Projeter les arguments.",
      },
      {
        name: "Les désaccords",
        timing: "10 min",
        instruction:
          "Pourquoi pas tous d'accord ? Explorer les divergences. C'est le moment le plus riche — ne pas presser.",
      },
    ],
  },
  {
    moduleId: "u2d",
    title: "Clôture",
    objectifPedagogique:
      "Prendre du recul sur le travail accompli. Identifier les thèmes et les arcs narratifs qui ont émergé. Comprendre que chaque choix créatif raconte quelque chose de soi.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Synthétiser un parcours créatif et en tirer des enseignements",
      "Identifier le thème profond d'un récit",
      "Comprendre la notion d'arc de personnage",
      "Réfléchir sur sa propre démarche créative",
    ],
    introADire:
      "On arrive à la fin du parcours Émotion Cachée. On va voir ensemble ce qui ressort : quels grands thèmes vous avez explorés, et comment vos personnages ont évolué. Chaque choix que vous avez fait raconte quelque chose.",
    aQuoiEtreAttentif: [
      "Élèves désengagés sur la clôture — c'est normal, garder un rythme vif",
      "Choix de thème 'autre' par facilité — les pousser à trouver le mot juste",
      "Confusion entre thème et genre (pas 'action' mais 'courage', pas 'drame' mais 'injustice')",
      "L'arc du personnage : la plupart choisiront 'gagne' — ouvrir le débat sur les autres options",
    ],
    commentRelancer: [
      "Si tu devais résumer ton parcours en UN mot, ce serait lequel ?",
      "Ton personnage au début et à la fin — qu'est-ce qui a changé ?",
    ],
    commentChallenger: [
      "Est-ce que 'gagner' c'est toujours la meilleure fin ? Pense à des films où le héros perd mais qu'on adore.",
      "Le thème que tu as choisi, est-ce que c'est aussi TON thème, pas juste celui du personnage ?",
    ],
    conseils: [
      "Montrer les tendances de la classe à l'écran — c'est satisfaisant pour les élèves",
      "Faire le lien entre le contenu choisi en séance 1 et les thèmes qui émergent",
      "La clôture doit être valorisante — chaque parcours est unique et valable",
      "Si possible, revenir sur la checklist initiale : 'Vous avez choisi X, et vous avez exploré Y'",
    ],
    duration: "~20 min",
    phases: [
      {
        name: "Le thème",
        timing: "10 min",
        instruction:
          "Question fermée : quel grand thème ressort ? Montrer la distribution. Commenter les tendances de la classe.",
      },
      {
        name: "L'arc",
        timing: "10 min",
        instruction:
          "Question fermée : comment évolue le personnage ? Débattre sur les choix. Conclure le module avec une synthèse valorisante.",
      },
    ],
  },
  // ——— MODULE 10 : Et si... + Pitch (m10a / m10b) ———
  {
    moduleId: "m10a",
    title: "Et si...",
    objectifPedagogique:
      "Libérer l'imagination narrative à partir d'une image. Passer de l'observation à la projection fictionnelle. Construire une première idée de scénario.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Observer une image et en extraire un potentiel narratif",
      "Formuler une hypothèse fictionnelle (« Et si... »)",
      "Partager ses idées et les confronter à celles des autres",
      "Voter et argumenter un choix collectif",
    ],
    introADire:
      "Aujourd'hui, on part d'une image. Pas besoin de bien dessiner ou d'écrire un roman. Juste une question : « Et si... ? ». Et si cette scène était le début d'un film ? Et si ce personnage avait un secret ? Laissez votre imagination parler.",
    aQuoiEtreAttentif: [
      "Blocage devant la page blanche — proposer le bouton aide pour débloquer",
      "Réponses trop descriptives (ce que je vois) au lieu d'imaginatives (ce qui pourrait se passer)",
      "Certains élèves copient les idées des voisins — rappeler que chaque « Et si... » est unique",
      "La banque d'idées peut créer de l'émulation — utiliser cette énergie collective",
    ],
    commentRelancer: [
      "Regarde bien l'image. Il y a un détail que personne n'a vu. Trouve-le.",
      "« Et si... » c'est une porte. Qu'est-ce qu'il y a de l'autre côté ?",
      "Pense à un film que tu adores. Le début ressemblait à quoi ?",
    ],
    commentChallenger: [
      "C'est intéressant, mais c'est prévisible. Et si on prenait le chemin inverse ?",
      "Et si le personnage n'était pas celui qu'on croit ?",
    ],
    conseils: [
      "L'image est un déclencheur — ne pas trop l'analyser, laisser l'imaginaire prendre le relais",
      "Valoriser les idées les plus originales, pas les plus réalistes",
      "La banque d'idées fonctionne mieux quand il y a au moins 5-6 propositions — encourager la quantité",
      "Le QCM permet de structurer sans contraindre — laisser le choix être guidé par l'instinct",
    ],
    duration: "~25 min",
    phases: [
      {
        name: "Image + Et si...",
        timing: "10 min",
        instruction: "Projeter l'image. Laisser 2 minutes d'observation silencieuse. Puis écriture individuelle.",
      },
      {
        name: "QCM direction",
        timing: "5 min",
        instruction: "4 directions narratives tirées des réponses. Vote rapide, commenter les tendances.",
      },
      {
        name: "Banque d'idées",
        timing: "10 min",
        instruction: "Partage collectif + vote. Commenter les idées les plus populaires. Conclure avec la meilleure.",
      },
    ],
  },
  {
    moduleId: "m10b",
    title: "Pitch",
    objectifPedagogique:
      "Structurer une idée narrative en pitch : personnage + objectif + obstacle. Développer l'expression orale à travers le chrono. Confronter les pitchs pour affiner.",
    socleCommun: ["D1", "D2", "D3"],
    competences: [
      "Créer un personnage avec des caractéristiques précises",
      "Définir un objectif narratif clair et un obstacle crédible",
      "Synthétiser une histoire en un pitch concis",
      "Présenter à l'oral avec assurance et dans un temps limité",
    ],
    introADire:
      "Vous avez une idée. Maintenant il faut la vendre. Dans le cinéma, on appelle ça un PITCH. En 30 secondes, tu dois donner envie à quelqu'un de financer ton film. Personnage, objectif, obstacle — c'est tout ce qu'il faut.",
    aQuoiEtreAttentif: [
      "Personnages trop stéréotypés — pousser vers l'originalité et les nuances",
      "Objectif trop vague ('être heureux') — exiger de la précision ('retrouver son frère')",
      "Obstacle trop facile — l'obstacle doit être à la hauteur de l'enjeu",
      "Stress du chrono — rassurer que c'est un entraînement, pas une évaluation",
      "Confrontation : éviter que ça devienne un concours de popularité",
    ],
    commentRelancer: [
      "Ton personnage, il ressemble à qui ? Pas physiquement — dans sa manière d'être.",
      "L'obstacle, c'est ce qui rend l'histoire intéressante. Sans obstacle, pas de film.",
      "30 secondes c'est court. Mais c'est suffisant si tu vas droit au but.",
    ],
    commentChallenger: [
      "Si je suis producteur et que j'entends 100 pitchs par jour, pourquoi je retiens le tien ?",
      "Ton personnage est parfait ? Les personnages parfaits sont ennuyeux.",
    ],
    conseils: [
      "L'avatar est ludique mais ne pas y passer trop de temps — 5 min max",
      "L'assemblage du pitch est le moment clé — s'assurer que tout s'emboîte",
      "Le chrono crée de l'adrénaline — utiliser cette énergie positive",
      "Pour la confrontation, choisir 2 pitchs complémentaires (pas similaires)",
      "Clore avec un rappel : tout le monde a créé un personnage et une histoire — féliciter",
    ],
    duration: "~30 min",
    phases: [
      {
        name: "Avatar + personnage",
        timing: "5 min",
        instruction: "Création rapide. Prénom, trait dominant, avatar visuel. Ne pas trop s'attarder.",
      },
      {
        name: "Objectif + obstacle",
        timing: "5 min",
        instruction: "Choix guidé. L'objectif donne la direction, l'obstacle donne le conflit.",
      },
      {
        name: "Assemblage du pitch",
        timing: "10 min",
        instruction: "Combiner tous les éléments. Le pitch doit tenir en 2-3 phrases.",
      },
      {
        name: "Chrono 30s",
        timing: "5 min",
        instruction: "Chaque élève teste en privé. Le chrono force la concision.",
      },
      {
        name: "Confrontation",
        timing: "5 min",
        instruction: "Projeter 2 pitchs. Vote de la classe. Commenter les qualités de chacun.",
      },
    ],
  },

  // ── Module 11 — Ciné-Débat (4 séances) ──

  {
    moduleId: "cd1",
    title: "L'Art de Raconter",
    objectifPedagogique:
      "Découvrir les techniques narratives du cinéma à travers des citations, affiches et extraits. Comprendre comment les réalisateurs construisent une histoire visuelle.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Analyser les intentions narratives d'un réalisateur",
      "Argumenter son point de vue face au groupe",
      "Identifier les choix stylistiques qui servent le récit",
    ],
    introADire:
      "Aujourd'hui, on entre dans l'art de raconter. Le cinéma, ce n'est pas juste une caméra qui filme — c'est quelqu'un qui RACONTE quelque chose. On va découvrir comment les plus grands réalisateurs s'y prennent, et vous allez donner votre avis.",
    aQuoiEtreAttentif: [
      "Les élèves qui n'osent pas parler — les relancer avec des questions simples",
      "Ceux qui critiquent sans argumenter — demander toujours « pourquoi ? »",
      "L'énergie de la classe : alterner stimuli courts et moments de réflexion",
    ],
    commentRelancer: [
      "Imagine que tu es le réalisateur. Pourquoi tu aurais fait ce choix ?",
      "Si tu devais résumer cette idée en une phrase, ce serait quoi ?",
      "Qui n'est pas d'accord ? Expliquez-nous pourquoi.",
    ],
    commentChallenger: [
      "Et si cette citation était complètement fausse — qu'est-ce que ça changerait au cinéma ?",
      "Hitchcock dit que le cinéma c'est 'la vie sans les parties ennuyeuses'. Tu es d'accord ?",
    ],
    conseils: [
      "Chaque stimulus dure ~5 min : 1 min découverte, 2 min réflexion individuelle, 2 min débat",
      "Projeter l'image/citation en grand sur l'écran — impact visuel important",
      "Varier les formats : citation → affiche → citation → débat → poster → extrait",
      "En fin de séance, faire voter la citation/idée préférée de la classe",
    ],
    duration: "~30 min",
    phases: [
      {
        name: "Ouverture",
        timing: "3 min",
        instruction:
          "Présenter le principe : on va explorer comment les grands du cinéma racontent leurs histoires. Chacun aura le droit de réagir.",
      },
      {
        name: "Exploration",
        timing: "20 min",
        instruction:
          "6 stimuli en rotation (~3 min chacun). Pour chaque : découverte → écriture/réflexion → débat oral rapide.",
      },
      {
        name: "Synthèse",
        timing: "5 min",
        instruction: "Vote collectif : quelle citation/idée a le plus marqué la classe ? Discussion libre.",
      },
    ],
  },
  {
    moduleId: "cd2",
    title: "Émotions à l'Écran",
    objectifPedagogique:
      "Explorer comment le cinéma transmet des émotions : jeu d'acteur, silence, mise en scène. Développer la capacité à identifier et nommer les émotions dans une œuvre.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Identifier les techniques cinématographiques qui créent l'émotion",
      "Nommer et distinguer des émotions complexes",
      "Exprimer un ressenti personnel de manière structurée",
    ],
    introADire:
      "Le cinéma, c'est l'art de faire ressentir. Aujourd'hui on va chercher COMMENT un film nous touche. Pas juste « c'est triste » ou « c'est drôle » — mais comment le réalisateur s'y prend pour nous faire ressentir ça.",
    aQuoiEtreAttentif: [
      "Respecter les émotions exprimées — pas de moqueries",
      "Certains élèves seront mal à l'aise avec les émotions — proposer des alternatives (écrire plutôt que parler)",
      "Guider vers la précision : « triste » → « nostalgique », « en deuil », « abandonné »",
    ],
    commentRelancer: [
      "Qu'est-ce que tu as ressenti en voyant cette scène ? Pas ce que tu penses — ce que tu RESSENS.",
      "Si on coupait la musique, est-ce que l'émotion serait la même ?",
      "Un acteur qui ne dit rien peut être plus émouvant qu'un long discours. Pourquoi ?",
    ],
    commentChallenger: [
      "Est-ce que le cinéma CRÉE des émotions ou est-ce qu'il RÉVÈLE celles qu'on a déjà ?",
      "Un film qui ne fait rien ressentir, c'est un mauvais film ? Toujours ?",
    ],
    conseils: [
      "Créer un espace bienveillant — les émotions sont personnelles",
      "Utiliser les extraits vidéo si disponibles — plus impactant que les descriptions",
      "Alterner entre réflexion écrite (intimité) et débat oral (confrontation)",
      "Terminer sur une note positive : chaque émotion ressentie est valide",
    ],
    duration: "~30 min",
    phases: [
      {
        name: "Mise en condition",
        timing: "3 min",
        instruction:
          "Poser le cadre : on parle d'émotions, on respecte ce que chacun ressent. Pas de bonne ou mauvaise réponse.",
      },
      {
        name: "Exploration",
        timing: "22 min",
        instruction:
          "6 stimuli émotionnels. Alterner écriture individuelle et partage en classe. Encourager la précision du vocabulaire.",
      },
      {
        name: "Bilan émotionnel",
        timing: "5 min",
        instruction: "Tour rapide : chaque élève dit UN mot-émotion qui résume la séance. Pas d'explication requise.",
      },
    ],
  },
  {
    moduleId: "cd3",
    title: "Héros & Anti-Héros",
    objectifPedagogique:
      "Questionner la notion de héros au cinéma : sacrifice, morale, évolution. Comprendre que le héros n'est pas toujours celui qu'on croit.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Distinguer héros classique, anti-héros et antagoniste",
      "Analyser l'évolution d'un personnage au fil du récit",
      "Confronter des points de vue divergents avec respect",
    ],
    introADire:
      "C'est quoi un héros ? Quelqu'un de courageux ? Quelqu'un de gentil ? Aujourd'hui, on va secouer tout ça. Au cinéma, les héros les plus intéressants sont souvent ceux qui ne sont PAS parfaits.",
    aQuoiEtreAttentif: [
      "Les élèves qui confondent « héros = bon » — montrer les nuances",
      "Ceux qui défendent l'anti-héros par provocation — recentrer sur l'argumentation",
      "Le débat peut s'enflammer — garder le cap sur le respect mutuel",
    ],
    commentRelancer: [
      "Si ce personnage existait en vrai, tu voudrais être ami avec lui ? Pourquoi ?",
      "Est-ce qu'un méchant peut devenir un héros ? Donne un exemple.",
      "Pourquoi on s'attache parfois plus à l'anti-héros qu'au héros ?",
    ],
    commentChallenger: [
      "Les super-héros avec des super-pouvoirs, c'est de la triche narrative ?",
      "Est-ce qu'un héros qui ne change jamais est vraiment un héros ?",
    ],
    conseils: [
      "Apporter des exemples concrets que les élèves connaissent (MCU, anime, séries)",
      "Le débat « héros vs anti-héros » peut être très riche — laisser s'exprimer",
      "Utiliser les affiches pour analyser comment le visuel code le héros",
      "Finir par la question : et toi, quel type de héros tu écrirais ?",
    ],
    duration: "~30 min",
    phases: [
      {
        name: "Accroche",
        timing: "3 min",
        instruction:
          "Question flash : c'est quoi un héros ? Laisser 3-4 réponses spontanées. Puis annoncer qu'on va challenger cette définition.",
      },
      {
        name: "Exploration",
        timing: "22 min",
        instruction:
          "6 stimuli sur le héros et l'anti-héros. Mélanger citations, portraits et débats. Pousser les élèves à argumenter.",
      },
      {
        name: "Verdict",
        timing: "5 min",
        instruction: "Vote : héros classique ou anti-héros — lequel fait le meilleur film ? Discussion ouverte.",
      },
    ],
  },
  {
    moduleId: "cd4",
    title: "Les Coulisses",
    objectifPedagogique:
      "Découvrir l'envers du décor : décors réels vs numériques, budgets, montage, impact de l'IA. Comprendre que le cinéma est un artisanat technique autant qu'un art.",
    socleCommun: ["D3", "D4", "D5"],
    competences: [
      "Comprendre les contraintes techniques et budgétaires d'un film",
      "Distinguer les apports du numérique et de l'artisanat traditionnel",
      "Former un avis argumenté sur l'impact de la technologie dans la création",
    ],
    introADire:
      "On a parlé d'histoires, d'émotions, de héros. Maintenant on passe de l'autre côté de la caméra. Comment c'est FABRIQUÉ, un film ? Qu'est-ce qui est vrai, qu'est-ce qui est truqué ? Et l'IA dans tout ça ?",
    aQuoiEtreAttentif: [
      "Les élèves fascinés par le budget — recadrer vers le processus créatif",
      "Le débat sur l'IA peut devenir passionnel — garder un ton nuancé",
      "Ceux qui pensent que « tout est fait par ordinateur » — montrer le travail humain",
    ],
    commentRelancer: [
      "Si tu avais 1 million de budget, tu le dépenses comment pour ton film ?",
      "Le montage, c'est couper des scènes. Mais c'est aussi CHOISIR ce qu'on garde. Pourquoi c'est si important ?",
      "Un film tourné avec un téléphone, ça peut être aussi bien qu'un film à 200 millions ?",
    ],
    commentChallenger: [
      "L'IA pourra-t-elle un jour remplacer un réalisateur ? Pourquoi ?",
      "Les effets spéciaux rendent les films meilleurs ou moins authentiques ?",
    ],
    conseils: [
      "Montrer des comparaisons avant/après effets spéciaux si possible",
      "Le sujet IA est très actuel — laisser les élèves exprimer leurs craintes/espoirs",
      "Relier au Module 9 (production) pour ceux qui l'ont fait — c'est le même monde",
      "Terminer en rappelant : derrière chaque film, des centaines de personnes travaillent",
    ],
    duration: "~30 min",
    phases: [
      {
        name: "Immersion",
        timing: "3 min",
        instruction:
          "Montrer un plan spectaculaire et demander : c'est réel ou numérique ? Lancer le sujet des coulisses.",
      },
      {
        name: "Exploration",
        timing: "22 min",
        instruction: "6 stimuli techniques. Budget, décors, IA, montage. Alterner information et débat.",
      },
      {
        name: "Clôture",
        timing: "5 min",
        instruction:
          "La grande question : le cinéma de demain, il ressemblera à quoi ? Chacun donne sa vision en une phrase.",
      },
    ],
  },
  // ── MODULE 12 : Construction Collective ──
  {
    moduleId: "m12a",
    title: "Construction Collective",
    objectifPedagogique:
      "Construire collectivement le film de la classe en 8 manches de vote anonyme. Les cartes sont generees a partir des idees individuelles du Module 10.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Argumenter et faire des choix collectifs",
      "Respecter les idees des autres dans un processus democratique",
      "Construire un projet narratif a partir de contributions individuelles",
    ],
    introADire:
      "On va construire VOTRE film ensemble. Vos idees du module precedent ont ete melangees et anonymisees. A chaque manche, vous votez pour la carte qui vous inspire le plus. Le prof valide le choix collectif. 8 manches = 8 briques du film.",
    aQuoiEtreAttentif: [
      "Les eleves qui cherchent a identifier les auteurs des cartes",
      "Les votes strategiques (voter contre plutot que pour)",
      "L'equilibre entre cartes eleves et cartes Banlieuwood",
    ],
    commentRelancer: [
      "Pourquoi cette carte et pas l'autre ? Qu'est-ce qui vous a parle ?",
      "Imaginez le film avec cette carte. Ca donne quoi ?",
    ],
    commentChallenger: ["Et si on prenait la carte la moins populaire, ca changerait quoi au film ?"],
    conseils: [
      "Lire les cartes a voix haute avant le vote",
      "Commenter brievement le resultat de chaque manche",
      "Construire la coherence au fil des manches",
      "A la fin, relire toutes les cartes retenues pour voir le film prendre forme",
    ],
    duration: "~30 min",
    phases: [
      {
        name: "Intro",
        timing: "3 min",
        instruction: "Expliquer le principe : 8 manches, vote anonyme, le prof valide.",
      },
      {
        name: "Manches 1-4",
        timing: "12 min",
        instruction: "Ton, Situation, Personnages, Objectif. Rythme soutenu, ~3 min/manche.",
      },
      {
        name: "Manches 5-8",
        timing: "12 min",
        instruction: "Obstacle, Scene, Relation, Moment fort. Montrer comment le film se construit.",
      },
      { name: "Synthese", timing: "3 min", instruction: "Relire les 8 cartes retenues. Le film de la classe est ne !" },
    ],
  },
  // ── MODULE 6 — LE SCÉNARIO ──
  {
    moduleId: "m6",
    title: "Le Scénario",
    objectifPedagogique:
      "Transformer les choix collectifs du module précédent en scénario structuré. Lecture collective, attribution de missions d'écriture, assemblage final.",
    socleCommun: ["D1", "D2", "D3"],
    competences: [
      "Structurer un récit en actes narratifs (situation initiale, confrontation, résolution)",
      "Écrire de manière collaborative en respectant la cohérence narrative",
      "Développer des dialogues, descriptions, actions ou émotions selon son rôle",
    ],
    introADire:
      "On a les ingrédients du film. Maintenant on va écrire le scénario ! L'IA va générer les scènes à compléter. Chacun aura une mission selon son profil créatif. À vous de donner vie aux scènes.",
    aQuoiEtreAttentif: [
      "Lire les scènes V0 à voix haute — les élèves doivent entendre le film",
      "Les missions doivent être claires — chaque élève sait exactement quoi écrire",
      "Éviter que les scribes monopolisent — tout le groupe discute, le scribe saisit",
    ],
    commentRelancer: [
      "Qu'est-ce que ton personnage dirait à ce moment-là ?",
      "Ferme les yeux. Décris ce que tu vois dans cette scène.",
    ],
    commentChallenger: ["C'est trop facile pour le héros. Ajoute un obstacle imprévu."],
    conseils: [
      "Lire chaque scène V0 à voix haute avant d'assigner les missions",
      "Donner 8-10 min d'écriture, pas plus — la pression temporelle aide",
      "Assembler les contributions à voix haute pour vérifier la cohérence",
    ],
    duration: "~30 min",
    phases: [
      {
        name: "Frise narrative",
        timing: "3 min",
        instruction: "Montrer les 8 ingrédients et comment ils s'enchaînent.",
      },
      { name: "Scènes V0", timing: "5 min", instruction: "Lire les scènes générées. Les élèves écoutent." },
      { name: "Missions", timing: "2 min", instruction: "Chaque élève reçoit sa mission. Expliquer les rôles." },
      { name: "Écriture", timing: "10 min", instruction: "Les élèves écrivent. Circuler pour aider." },
      { name: "Assemblage", timing: "10 min", instruction: "Lire toutes les contributions et assembler le scénario." },
    ],
  },

  // ── MODULE 7 — LA MISE EN SCÈNE ──
  {
    moduleId: "m7",
    title: "La Mise en scène",
    objectifPedagogique:
      "Apprendre le langage visuel du cinéma : les 4 types de plans fondamentaux. Comparer les cadrages et créer un mini-storyboard pour les scènes clés.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Distinguer et nommer les 4 types de plans fondamentaux",
      "Analyser l'effet narratif d'un cadrage sur le spectateur",
      "Concevoir un découpage technique simple pour une scène",
    ],
    introADire:
      "Au cinéma, la caméra raconte autant que les mots. Un gros plan, c'est pas un plan large — ça dit pas la même chose. Aujourd'hui on apprend à VOIR comme un réalisateur, puis on découpe nos scènes.",
    aQuoiEtreAttentif: [
      "Ne pas noyer les élèves de vocabulaire technique — 4 plans suffisent",
      "La comparaison est l'exercice clé — s'assurer que chacun argumente son choix",
      "Le découpage peut intimider — rassurer que c'est un brouillon, pas un storyboard pro",
    ],
    commentRelancer: [
      "Regarde la même scène en plan large, puis en gros plan. Qu'est-ce qui change ?",
      "Quel plan utiliserais-tu pour montrer que le personnage a peur ?",
    ],
    commentChallenger: ["Et si tu filmais toute la scène en un seul plan, sans couper ?"],
    conseils: [
      "Montrer les 4 plans sur un exemple concret avant le quiz",
      "Pour la comparaison, projeter les images si possible",
      "Le découpage est l'exercice principal — y consacrer le plus de temps",
    ],
    duration: "~25 min",
    phases: [
      {
        name: "Les 4 plans",
        timing: "5 min",
        instruction: "Présenter plan large, plan moyen, gros plan, plan réaction.",
      },
      { name: "Comparaison", timing: "8 min", instruction: "3 paires d'images. Chacun choisit et explique." },
      { name: "Découpage", timing: "10 min", instruction: "Les élèves découpent 2-3 scènes clés du scénario." },
      { name: "Storyboard", timing: "2 min", instruction: "Vue d'ensemble des plans choisis." },
    ],
  },

  // ── MODULE 8 — L'ÉQUIPE ──
  {
    moduleId: "m8",
    title: "L'Équipe",
    objectifPedagogique:
      "Former l'équipe de tournage. Quiz des métiers du cinéma, système de points invisible basé sur l'implication, choix des rôles dans l'ordre du classement.",
    socleCommun: ["D2", "D3"],
    competences: [
      "Identifier les métiers du cinéma et leurs responsabilités",
      "Comprendre le fonctionnement d'une équipe de production",
      "Accepter un rôle et s'y investir dans l'intérêt du projet collectif",
    ],
    introADire:
      "Un film, c'est pas un réalisateur tout seul. C'est une ÉQUIPE. Chacun a un rôle précis. Aujourd'hui, on forme l'équipe du film de la classe. D'abord un quiz pour découvrir les vrais métiers, puis chacun choisit son poste.",
    aQuoiEtreAttentif: [
      "Le classement est INVISIBLE — ne jamais révéler les scores aux élèves",
      "Certains élèves voudront tous être réalisateur — rappeler que chaque rôle est essentiel",
      "Le quiz sert à déconstruire les idées reçues, pas à évaluer",
    ],
    commentRelancer: [
      "Tu connais un film où l'ingénieur du son a tout changé ?",
      "Le script, c'est le gardien de la continuité. Sans lui, on se perd.",
    ],
    commentChallenger: ["Et si on supprimait le rôle de réalisateur ? Le film serait fait comment ?"],
    conseils: [
      "Le quiz doit être ludique — pas un examen",
      "Laisser le temps au débrief — c'est là que les élèves apprennent vraiment",
      "Pour le choix de rôle : expliquer que l'ordre est basé sur l'implication tout au long de l'atelier",
      "La carte talent est un cadeau — la présenter comme tel",
    ],
    duration: "~25 min",
    phases: [
      { name: "Quiz métiers", timing: "5 min", instruction: "Les élèves répondent au quiz. Pas de stress." },
      { name: "Débrief", timing: "5 min", instruction: "Corriger les idées reçues. Montrer les fiches métier." },
      {
        name: "Choix de rôle",
        timing: "10 min",
        instruction: "Chacun choisit dans l'ordre. Tous les rôles sont importants.",
      },
      {
        name: "Récap + Carte talent",
        timing: "5 min",
        instruction: "Vue d'équipe complète. Distribuer les cartes talent.",
      },
    ],
  },

  // ── CINÉ-DÉBAT ──
  {
    moduleId: "m11a",
    title: "L'Art de Raconter",
    objectifPedagogique:
      "Comprendre les fondamentaux de la narration cinématographique : comment un film raconte une histoire par l'image, le son, le montage et la mise en scène. Développer l'esprit critique face aux choix artistiques.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Identifier les éléments narratifs d'un extrait de film (personnages, conflit, enjeu)",
      "Analyser les choix de mise en scène et leur impact sur le spectateur",
      "Argumenter ses préférences esthétiques en s'appuyant sur des exemples concrets",
      "Comparer différentes approches narratives (linéaire, flashback, ellipse)",
    ],
    introADire:
      "Aujourd'hui on va regarder des extraits de films et comprendre COMMENT ils racontent une histoire. Pas juste ce qui se passe, mais comment le réalisateur nous fait ressentir les choses. On va débattre ensemble — il n'y a pas de bonne réponse, juste des regards différents.",
    aQuoiEtreAttentif: [
      "Élèves qui résument l'histoire au lieu d'analyser la forme — recentrer sur le 'comment'",
      "Élèves intimidés par le cinéma 'classique' — valoriser tous les goûts, du blockbuster au film d'auteur",
      "Le débat peut devenir émotionnel — cadrer sans censurer les réactions",
    ],
    commentRelancer: [
      "Tu as vu comment la caméra bouge dans cette scène ? Ça te fait ressentir quoi ?",
      "Si tu devais refaire cette scène autrement, tu changerais quoi ?",
      "Ferme les yeux et réécoute — qu'est-ce que le son raconte tout seul ?",
    ],
    commentChallenger: [
      "Ce choix de mise en scène, c'est un coup de génie ou une facilité ? Argumente.",
      "Si on enlevait la musique, est-ce que la scène fonctionnerait toujours ?",
    ],
    conseils: [
      "Projeter les extraits en grand avec un bon son — l'immersion compte",
      "Faire un premier visionnage 'brut' puis un second où on décortique",
      "Noter les réactions spontanées au tableau avant de structurer le débat",
      "Varier les genres : pas que du drame, aussi de la comédie et de l'animation",
    ],
    duration: "~25 min",
    phases: [
      {
        name: "Visionnage",
        timing: "5 min",
        instruction: "Projeter l'extrait sans consigne. Laisser les élèves réagir.",
      },
      {
        name: "Premières impressions",
        timing: "5 min",
        instruction: "Tour de table rapide : une émotion, un mot, une image qui reste.",
      },
      {
        name: "Analyse guidée",
        timing: "8 min",
        instruction:
          "Questions ciblées sur la mise en scène, le son, le cadrage. Les élèves répondent sur leurs écrans.",
      },
      {
        name: "Débat",
        timing: "7 min",
        instruction: "Confronter les analyses. Le prof projette des réponses contrastées.",
      },
    ],
  },
  {
    moduleId: "m11b",
    title: "La Conscience",
    objectifPedagogique:
      "Explorer les mécanismes de l'émotion au cinéma : pourquoi une scène fait rire, pleurer, frissonner. Développer la conscience des techniques de manipulation émotionnelle dans les médias.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Identifier les techniques de construction émotionnelle (musique, silence, rythme, jeu d'acteur)",
      "Exprimer et analyser ses propres réactions émotionnelles face à un extrait",
      "Distinguer émotion authentique et manipulation émotionnelle",
      "Développer un regard critique sur les médias audiovisuels",
    ],
    introADire:
      "Est-ce que vous avez déjà pleuré devant un film ? Ou eu super peur ? Aujourd'hui on va comprendre POURQUOI. Les réalisateurs ont des outils très précis pour nous faire ressentir des choses. On va les décrypter ensemble.",
    aQuoiEtreAttentif: [
      "Élèves qui ont honte de montrer leurs émotions — normaliser : les pros du cinéma VEULENT vous faire réagir",
      "Risque de moquerie si quelqu'un dit avoir pleuré — poser le cadre de bienveillance au départ",
      "Ne pas réduire l'émotion à de la 'manipulation' — c'est aussi de l'art",
    ],
    commentRelancer: [
      "À quel moment exactement tu as senti quelque chose ? Qu'est-ce qui se passait à l'écran ?",
      "La musique, elle raconte quoi dans cette scène ?",
      "Si le personnage ne disait rien, tu comprendrais quand même ce qu'il ressent ?",
    ],
    commentChallenger: [
      "C'est de l'émotion sincère ou de la manipulation ? Où est la limite ?",
      "Est-ce qu'une publicité utilise les mêmes techniques qu'un film ? C'est pareil ou pas ?",
    ],
    conseils: [
      "Choisir des extraits avec des émotions variées (joie, peur, tristesse, colère)",
      "Faire un 'avant/après' : montrer la scène avec et sans musique",
      "Relier aux réseaux sociaux : les mêmes techniques sont utilisées dans les vidéos courtes",
      "Terminer sur une note positive — l'émotion au cinéma c'est un super-pouvoir, pas un piège",
    ],
    duration: "~25 min",
    phases: [
      {
        name: "Extrait émotionnel",
        timing: "5 min",
        instruction: "Projeter un extrait à forte charge émotionnelle. Observer les réactions.",
      },
      {
        name: "Réactions à chaud",
        timing: "5 min",
        instruction: "Les élèves écrivent ce qu'ils ont ressenti. Pas d'analyse, juste l'émotion brute.",
      },
      {
        name: "Décryptage",
        timing: "8 min",
        instruction: "Revisionner en décortiquant : musique, cadrage, rythme, jeu d'acteur.",
      },
      {
        name: "Débat éthique",
        timing: "7 min",
        instruction: "Émotion vs manipulation : où est la frontière ? Lien avec les médias du quotidien.",
      },
    ],
  },
  {
    moduleId: "m11c",
    title: "Héros & Anti-Héros",
    objectifPedagogique:
      "Questionner les figures de héros et d'antagonistes dans le cinéma. Développer la nuance morale et la capacité à comprendre des points de vue différents du sien.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Distinguer héros classique, anti-héros et antagoniste complexe",
      "Analyser les motivations d'un personnage au-delà du bien/mal",
      "Argumenter pour ou contre un personnage en s'appuyant sur le film",
      "Développer l'empathie en comprenant des perspectives opposées",
    ],
    introADire:
      "C'est quoi un héros ? Quelqu'un de courageux ? Quelqu'un de parfait ? Et un méchant, c'est toujours vraiment méchant ? Aujourd'hui on va voir que c'est beaucoup plus compliqué que ça. Préparez-vous à changer d'avis.",
    aQuoiEtreAttentif: [
      "Vision manichéenne (gentil/méchant) — pousser vers la nuance sans imposer",
      "Identification trop forte à un personnage — rappeler que c'est de la fiction",
      "Débats passionnés possibles — canaliser l'énergie vers l'argumentation",
    ],
    commentRelancer: [
      "Pourquoi ce personnage fait ce qu'il fait ? C'est quoi sa raison profonde ?",
      "Tu te mettrais à sa place, tu ferais pareil ? Pourquoi ?",
      "Est-ce qu'il y a un moment où le 'méchant' avait raison ?",
    ],
    commentChallenger: [
      "Le sacrifice du héros, c'est du courage ou de la folie ? Défends ta position.",
      "Si le film était raconté du point de vue du 'méchant', ça changerait quoi ?",
    ],
    conseils: [
      "Choisir des films avec des antagonistes complexes (pas des méchants caricaturaux)",
      "Proposer un exercice de 'retournement' : défendre le personnage qu'on déteste",
      "Relier aux histoires réelles : les 'héros' du quotidien, ça ressemble à quoi ?",
      "Insister sur l'écoute : on peut ne pas être d'accord ET respecter l'argument de l'autre",
    ],
    duration: "~25 min",
    phases: [
      {
        name: "Extraits contrastés",
        timing: "6 min",
        instruction: "Montrer un héros classique puis un anti-héros. Laisser réagir.",
      },
      {
        name: "Positionnement",
        timing: "5 min",
        instruction: "Les élèves votent : héros ou anti-héros, lequel est le plus intéressant ? Justifier.",
      },
      {
        name: "L'antagoniste",
        timing: "7 min",
        instruction: "Montrer un méchant complexe. Les élèves analysent ses motivations.",
      },
      {
        name: "Débat final",
        timing: "7 min",
        instruction: "Le méchant avait-il raison ? Confronter les points de vue, forcer la nuance.",
      },
    ],
  },
  {
    moduleId: "m11d",
    title: "Les Coulisses",
    objectifPedagogique:
      "Découvrir les métiers et les étapes de fabrication d'un film. Comprendre les contraintes techniques, budgétaires et humaines. Réfléchir à l'impact de l'IA et des nouvelles technologies sur le cinéma.",
    socleCommun: ["D1", "D3", "D5"],
    competences: [
      "Identifier les principaux métiers du cinéma et leurs rôles",
      "Comprendre les étapes de production d'un film (pré-prod, tournage, post-prod)",
      "Analyser l'impact des contraintes (budget, temps, technologie) sur le résultat final",
      "Débattre de manière argumentée sur l'IA et l'avenir de la création",
    ],
    introADire:
      "Derrière chaque film il y a des dizaines, des centaines de personnes. Aujourd'hui on va ouvrir le capot et regarder comment ça marche vraiment. Et on va parler d'un truc qui change tout : l'intelligence artificielle. Est-ce que demain, une IA pourrait faire un film ?",
    aQuoiEtreAttentif: [
      "Élèves qui pensent que 'tout est fait par ordinateur' — montrer le travail humain",
      "Fascination ou peur de l'IA — garder un débat nuancé, pas techno-enthousiaste ni technophobe",
      "Le budget peut sembler abstrait — utiliser des comparaisons concrètes",
    ],
    commentRelancer: [
      "D'après toi, le métier le plus important sur un tournage c'est lequel ? Pourquoi ?",
      "Si tu avais un budget illimité, qu'est-ce que tu ajouterais à ton film ?",
      "L'IA peut écrire un scénario — mais est-ce que ce serait un BON scénario ?",
    ],
    commentChallenger: [
      "Un film tourné au téléphone, ça peut être aussi bien qu'un film à 100 millions ?",
      "Si l'IA fait tout le travail technique, le réalisateur, il sert encore à quoi ?",
    ],
    conseils: [
      "Montrer des making-of courts et percutants (pas trop techniques)",
      "Comparer un film à gros budget et un film indépendant — le budget fait-il la qualité ?",
      "Faire un mini-quiz interactif sur les métiers du cinéma",
      "Le débat IA est le point culminant — bien le cadrer avec des exemples concrets (deepfakes, films IA)",
    ],
    duration: "~25 min",
    phases: [
      {
        name: "Making-of",
        timing: "5 min",
        instruction: "Montrer un extrait de making-of. Les élèves identifient les métiers visibles.",
      },
      {
        name: "Quiz métiers",
        timing: "5 min",
        instruction: "Questions interactives sur les métiers du cinéma. Réponses sur écran.",
      },
      {
        name: "Budget challenge",
        timing: "7 min",
        instruction: "Comparer deux films (gros/petit budget). Lequel est le meilleur ? Pourquoi ?",
      },
      {
        name: "Débat IA",
        timing: "8 min",
        instruction: "L'IA va-t-elle remplacer les créateurs ? Les élèves argumentent et votent.",
      },
    ],
  },
];

// ——————————————————————————————————————————————————————
// QUESTION GUIDES — Module 3 (Séances 1, 2, 3)
// ——————————————————————————————————————————————————————

const SEANCE_1_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "personnage",
    label: "Le héros",
    whatToExpect:
      "Un nom, un âge, un trait principal. Les élèves s'identifient souvent à des personnages proches d'eux (ado, quartier, école). C'est ce qu'on veut — du réaliste.",
    commonPitfalls:
      "SUPER-HÉROS, personnage de manga/Marvel — recadrer : 'On fait un vrai film, avec de vrais acteurs. Quelqu'un qu'on pourrait croiser dans la rue.' Pas assez de détails concrets. Copie d'un personnage existant.",
    relancePhrase:
      "C'est quelqu'un de VRAI. Qu'on peut croiser au collège, dans le quartier. Qu'est-ce qui le rend unique ?",
    challengePhrase:
      "Pas besoin de super-pouvoirs pour être intéressant. Les meilleurs persos de cinéma sont des gens normaux avec un truc PAS normal.",
  },
  {
    position: 2,
    category: "personnage",
    label: "Son désir",
    whatToExpect:
      "Ce que le héros veut CONSCIEMMENT : gagner un match, retrouver quelqu'un, prouver quelque chose. Pas ce dont il a besoin.",
    commonPitfalls:
      "Confusion désir/besoin. Désir trop vague ('être heureux'). Désir trop petit (pas d'enjeu) ou trop grand (sauver le monde).",
    relancePhrase: "Si le héros pouvait avoir UNE seule chose au monde, ce serait quoi ?",
    challengePhrase: "Et si ce qu'il VEUT n'est pas ce dont il a BESOIN ? C'est souvent ça qui fait un bon film.",
  },
  {
    position: 3,
    category: "personnage",
    label: "Sa faille",
    whatToExpect:
      "Un défaut profond : orgueil, peur, colère, mensonge, méfiance. Pas un défaut superficiel ('il est maladroit').",
    commonPitfalls:
      "Faille trop légère ou 'mignonne'. Confusion faille/handicap. Refus de donner un défaut au héros qu'ils aiment.",
    relancePhrase: "C'est quoi le truc que le héros fait et qui lui cause TOUJOURS des problèmes ?",
    challengePhrase:
      "Est-ce que cette faille pourrait lui faire PERDRE ce qu'il désire le plus ? Si oui, c'est la bonne.",
  },
  {
    position: 4,
    category: "personnage",
    label: "Son secret",
    whatToExpect:
      "Quelque chose que personne ne sait. Peut être lié à la faille. Ajoute de la profondeur et du mystère au personnage.",
    commonPitfalls:
      "Secret trop anodin ('il aime les chats'). Secret déconnecté du personnage. Confusion secret/anecdote.",
    relancePhrase: "Si quelqu'un découvrait ce secret, qu'est-ce qui se passerait ? Ça changerait quoi ?",
    challengePhrase:
      "Le meilleur secret, c'est celui qui pourrait tout faire s'effondrer s'il était révélé. On en est là ?",
  },
  {
    position: 5,
    category: "liens",
    label: "Le meilleur allié",
    whatToExpect:
      "Un personnage secondaire qui aide le héros. Avec une relation spécifique (ami d'enfance, mentor, famille).",
    commonPitfalls:
      "Allié trop parfait (pas de personnalité propre). Allié qui n'a aucune raison d'aider. Simple copie du sidekick classique.",
    relancePhrase: "Pourquoi CETTE personne aide le héros ? Qu'est-ce qui les lie ?",
    challengePhrase:
      "Est-ce que l'allié a ses propres problèmes ? Ses propres raisons d'être là ? Un bon allié n'est pas juste un faire-valoir.",
  },
  {
    position: 6,
    category: "liens",
    label: "Le rival",
    whatToExpect:
      "Pas forcément un méchant — quelqu'un qui complique la vie du héros. Peut être un ami, un membre de la famille.",
    commonPitfalls:
      "Rival = méchant caricatural. Pas de motivation propre. Trop éloigné du héros pour créer de la tension.",
    relancePhrase: "Le rival, est-ce qu'il pense avoir raison ? De SON point de vue, qu'est-ce qu'il veut ?",
    challengePhrase:
      "Et si le rival et le héros se ressemblaient plus qu'on ne le pense ? C'est ça qui crée les meilleures histoires.",
  },
  {
    position: 7,
    category: "environnement",
    label: "Le lieu",
    whatToExpect:
      "Un endroit concret décrit avec les 5 sens. Quartier, ville, école, forêt... Le lieu raconte quelque chose du personnage.",
    commonPitfalls:
      "Lieu trop vague ('une ville'). Aucun détail sensoriel. Lieu déconnecté du personnage et de l'histoire.",
    relancePhrase: "Ferme les yeux. Tu es là-bas. Tu vois quoi ? Tu entends quoi ? Ça sent quoi ?",
    challengePhrase: "Ce lieu, est-ce qu'il reflète le personnage ? Un lieu peut être un personnage à part entière.",
  },
  {
    position: 8,
    category: "environnement",
    label: "L'ambiance",
    whatToExpect:
      "Des choix visuels et sonores : couleurs dominantes, lumière, sons, musique. L'atmosphère générale du film.",
    commonPitfalls:
      "Trop générique ('c'est sombre'). Aucune référence visuelle concrète. Incohérence avec le lieu et le personnage.",
    relancePhrase: "Si ce film était une couleur, ce serait laquelle ? Pourquoi ?",
    challengePhrase: "L'ambiance doit servir l'histoire. Est-ce que l'atmosphère renforce le conflit qui va arriver ?",
  },
];

const SEANCE_2_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "conflit",
    label: "Le déclencheur",
    whatToExpect:
      "L'événement qui brise l'équilibre initial. Un avant/après clair. Peut être violent, subtil, ou inattendu.",
    commonPitfalls:
      "Déclencheur trop mou (pas de vraie rupture). Déclencheur sans conséquence. Confusion avec l'obstacle.",
    relancePhrase: "Avant cet événement, la vie du héros était comment ? Et après, qu'est-ce qui change ?",
    challengePhrase: "Le meilleur déclencheur, c'est celui qui touche directement la faille du héros. Est-ce le cas ?",
  },
  {
    position: 2,
    category: "conflit",
    label: "L'obstacle",
    whatToExpect:
      "Ce qui empêche le héros d'atteindre son but. Peut être externe (quelqu'un, quelque chose) ou interne (sa propre faille).",
    commonPitfalls:
      "Obstacle trop facile à surmonter. Pas de lien avec le désir du héros. Obstacle unique alors qu'il en faut plusieurs.",
    relancePhrase: "Pourquoi le héros ne peut pas simplement résoudre le problème tout de suite ?",
    challengePhrase: "Et si le plus gros obstacle, c'était le héros lui-même ? Sa faille qui l'empêche d'avancer ?",
  },
  {
    position: 3,
    category: "conflit",
    label: "L'adversaire",
    whatToExpect:
      "Qui ou quoi s'oppose au héros. Ses motivations, ses raisons. L'adversaire est souvent le miroir inversé du héros.",
    commonPitfalls:
      "Adversaire sans motivation ('il est méchant'). Pas assez menaçant. Déconnecté de l'enjeu principal.",
    relancePhrase: "L'adversaire, de SON point de vue, pourquoi il fait ça ? Il pense avoir raison ?",
    challengePhrase: "Un grand adversaire croit être le héros de sa propre histoire. Raconte-moi la sienne.",
  },
  {
    position: 4,
    category: "trajectoire",
    label: "Le premier essai",
    whatToExpect:
      "Le héros tente quelque chose pour la première fois — et échoue. Cet échec doit lui apprendre quelque chose.",
    commonPitfalls:
      "Le héros réussit du premier coup (pas d'histoire). L'échec est sans conséquence. Pas d'apprentissage.",
    relancePhrase: "Le héros essaie et rate. Qu'est-ce que cet échec lui apprend sur lui-même ?",
    challengePhrase: "Est-ce que c'est sa faille qui cause l'échec ? Si oui, c'est narrativement parfait.",
  },
  {
    position: 5,
    category: "trajectoire",
    label: "Le dilemme",
    whatToExpect:
      "Un choix impossible entre deux choses importantes. Pas de bonne réponse. Le héros doit sacrifier quelque chose.",
    commonPitfalls:
      "Dilemme trop facile (une option clairement meilleure). Pas de vrai sacrifice. Enjeux trop faibles.",
    relancePhrase: "Les deux options sont mauvaises. Laquelle fait le plus mal ? Pourquoi ?",
    challengePhrase:
      "Le dilemme parfait : le héros doit choisir entre ce qu'il VEUT et ce dont il a BESOIN. On y est ?",
  },
  {
    position: 6,
    category: "trajectoire",
    label: "Le point bas",
    whatToExpect:
      "Le moment le plus dur. Tout semble perdu. Le héros est au fond du trou. C'est le moment où le spectateur doute.",
    commonPitfalls:
      "Pas assez bas (on sent que ça va s'arranger). Déconnecté du conflit principal. Le héros ne souffre pas vraiment.",
    relancePhrase: "Imagine que tu es le héros à ce moment. Tu as envie de tout abandonner. Pourquoi ?",
    challengePhrase:
      "Le point bas touche à ce que le héros a de plus intime. Sa faille, son secret. Tout remonte à la surface.",
  },
  {
    position: 7,
    category: "trajectoire",
    label: "Le sursaut",
    whatToExpect:
      "Ce qui fait que le héros se relève. Une personne, un souvenir, une prise de conscience. Le tournant.",
    commonPitfalls:
      "Sursaut trop facile ou magique. Aide extérieure sans effort du héros. Pas de lien avec l'arc du personnage.",
    relancePhrase: "Qu'est-ce qui fait que le héros décide de se relever MAINTENANT ? Qu'est-ce qui a changé en lui ?",
    challengePhrase:
      "Le sursaut, c'est quand le héros comprend enfin ce dont il a VRAIMENT besoin. Sa faille devient sa force ?",
  },
  {
    position: 8,
    category: "conflit",
    label: "La confrontation",
    whatToExpect:
      "Le face-à-face final avec l'adversaire. Pas forcément physique — peut être verbale, émotionnelle, symbolique.",
    commonPitfalls:
      "Confrontation trop simple (il gagne facilement). Pas de lien avec le parcours du héros. Violence gratuite.",
    relancePhrase: "Comment le héros utilise ce qu'il a appris pendant tout le film pour gagner ce face-à-face ?",
    challengePhrase: "La confrontation finale, c'est le moment où le héros prouve qu'il a changé. Comment ?",
  },
];

const SEANCE_3_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "intention",
    label: "La résolution",
    whatToExpect:
      "Comment ça finit. Happy end, fin ouverte, ou tragédie. Doit être cohérent avec le parcours du héros.",
    commonPitfalls:
      "Fin magique (tout s'arrange sans raison). Fin déconnectée du conflit. Pas de conséquences aux choix du héros.",
    relancePhrase: "Après la confrontation, qu'est-ce qui a changé dans la vie du héros ? Concrètement ?",
    challengePhrase: "Happy end ou pas, la fin doit être MÉRITÉE. Le héros a-t-il payé le prix de sa victoire ?",
  },
  {
    position: 2,
    category: "intention",
    label: "La transformation",
    whatToExpect:
      "En quoi le héros a changé entre le début et la fin. La faille initiale a-t-elle été surmontée, acceptée, ou aggravée ?",
    commonPitfalls:
      "Pas de transformation (le héros est pareil). Transformation superficielle. Déconnexion avec la faille du début.",
    relancePhrase:
      "Le héros au début du film et le héros à la fin — si on les mettait face à face, ils se diraient quoi ?",
    challengePhrase:
      "La transformation la plus puissante : le héros accepte sa faille au lieu de la combattre. C'est possible ici ?",
  },
  {
    position: 3,
    category: "intention",
    label: "Le message",
    whatToExpect:
      "Le thème profond du film en une phrase. Pas une morale ('le bien triomphe') mais un sujet universel (l'identité, la famille, la confiance).",
    commonPitfalls: "Trop moralisateur. Trop vague ('c'est sur la vie'). Message plaqué, pas organique à l'histoire.",
    relancePhrase: "Si quelqu'un te demande 'c'est quoi ton film ?', tu réponds quoi en UNE phrase ?",
    challengePhrase:
      "Le message n'est pas ce que le film DIT — c'est ce que le spectateur RESSENT. Quelle émotion reste ?",
  },
  {
    position: 4,
    category: "renforcement",
    label: "La scène clé",
    whatToExpect: "LA scène emblématique du film. Celle qu'on montre dans la bande-annonce. Le moment qui résume tout.",
    commonPitfalls:
      "Scène d'action par défaut. Scène déconnectée du thème. Pas de lien émotionnel avec le parcours du héros.",
    relancePhrase: "La scène que tu racontes à tes potes le lendemain — c'est laquelle et pourquoi ?",
    challengePhrase: "La scène clé devrait contenir le message du film en miniature. C'est le cas ?",
  },
  {
    position: 5,
    category: "renforcement",
    label: "Le titre",
    whatToExpect:
      "Court, marquant, mémorable. Peut être littéral, métaphorique ou mystérieux. Doit donner envie de voir le film.",
    commonPitfalls: "Trop long. Trop générique ('Le Film'). Sans rapport avec l'histoire. Copie d'un film existant.",
    relancePhrase: "Imagine l'affiche du film. Le titre est en GRAND. C'est quoi ?",
    challengePhrase:
      "Les meilleurs titres contiennent déjà l'histoire ou le thème. 'Les Intouchables', 'Inception', 'Parasite' — qu'est-ce que le vôtre raconte ?",
  },
];

// ——————————————————————————————————————————————————————
// QUESTION GUIDES — Module 4 "Vis ma vie"
// ——————————————————————————————————————————————————————

const MODULE4_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "personnage",
    label: "Le personnage",
    whatToExpect:
      "Un prénom, une situation, un détail physique ou comportemental. Les élèves projettent souvent des gens qu'ils connaissent. ATTENTION : si ça part en super-héros/manga, recadrer tout de suite.",
    commonPitfalls:
      "Super-héros, personnage de manga/jeu vidéo — rappeler qu'on fait un VRAI film. Description trop vague ('c'est un mec'). Copie d'un personnage connu.",
    relancePhrase:
      "C'est quelqu'un de VRAI, qu'on pourrait croiser en bas de chez toi. Si on le croise dans la rue, on le reconnaît à quoi ?",
    challengePhrase: "Pas de super-pouvoirs. Quelqu'un de normal avec un truc PAS normal. C'est quoi ce truc ?",
  },
  {
    position: 2,
    category: "personnage",
    label: "Son désir",
    whatToExpect:
      "Ce que le personnage ferait avec de l'argent ou un vœu révèle ses priorités profondes : famille, pouvoir, liberté, vengeance...",
    commonPitfalls: "Réponse matérialiste sans profondeur ('acheter une Lambo'). Pas de justification émotionnelle.",
    relancePhrase: "OK il fait ça avec l'argent. Mais POURQUOI ? Qu'est-ce que ça lui apporte vraiment ?",
    challengePhrase: "Et si ce qu'il achète en premier révélait son plus gros manque ? C'est quoi ce manque ?",
  },
  {
    position: 3,
    category: "conflit",
    label: "Son problème",
    whatToExpect:
      "Une relation conflictuelle avec quelqu'un de précis. Le 'pourquoi ça tombe mal' révèle l'enjeu dramatique.",
    commonPitfalls: "Appel anodin (juste un pote). Pas de tension. Pas de raison pour laquelle c'est un problème.",
    relancePhrase: "Pourquoi cette personne précisément ? Qu'est-ce qui s'est passé entre eux ?",
    challengePhrase: "La personne au téléphone, elle appelle pour une bonne raison DE SON point de vue. C'est quoi ?",
  },
  {
    position: 4,
    category: "personnage",
    label: "Son secret",
    whatToExpect:
      "Quelque chose d'inavouable, de dangereux ou de vulnérable. Le secret ajoute une couche de complexité au personnage.",
    commonPitfalls:
      "Secret trop léger ('elle mange des bonbons en cachette'). Secret déconnecté du personnage construit.",
    relancePhrase: "Si quelqu'un découvrait ce secret, qu'est-ce qui se passerait ? Ça changerait quoi ?",
    challengePhrase: "Un bon secret, c'est celui qui pourrait tout détruire. On en est là ?",
  },
  {
    position: 5,
    category: "trajectoire",
    label: "Le twist",
    whatToExpect:
      "Remise en question de tout ce qui a été construit. Les élèves doivent réécrire leur vision du personnage. C'est le vrai exercice de scénariste.",
    commonPitfalls:
      "Twist trop petit (ne change rien). Twist incohérent avec ce qui précède. Refus de remettre en question.",
    relancePhrase: "Maintenant qu'on sait ça, est-ce que son secret de tout à l'heure prend un autre sens ?",
    challengePhrase: "Un bon twist change TOUT ce qu'on croyait savoir. Est-ce que le vôtre fait ça ?",
  },
  {
    position: 6,
    category: "liens",
    label: "La confrontation",
    whatToExpect:
      "Une scène de tension entre deux personnes. Les élèves doivent imaginer le dialogue, les émotions, les non-dits.",
    commonPitfalls:
      "Scène qui tourne à la bagarre sans profondeur. Pas de dialogue, juste de l'action. Pas de tension émotionnelle.",
    relancePhrase: "Ils se parlent ou pas ? Et le silence, il dit quoi ?",
    challengePhrase: "Dans cette scène, qui a le plus à perdre ? Et est-ce que l'autre le sait ?",
  },
  {
    position: 7,
    category: "trajectoire",
    label: "La fin",
    whatToExpect:
      "Une image finale cinématographique. Les meilleurs réponses utilisent les sens : on VOIT quelque chose, on ENTEND quelque chose.",
    commonPitfalls:
      "Fin bâclée ('il meurt' ou 'il est content'). Pas d'image concrète. Déconnexion avec l'arc du personnage.",
    relancePhrase: "Ferme les yeux. Tu es dans la salle de ciné. L'écran va s'éteindre. Tu vois quoi en dernier ?",
    challengePhrase: "La dernière image doit résumer TOUT le film en un plan. Est-ce le cas ?",
  },
  {
    position: 8,
    category: "intention",
    label: "Le pitch",
    whatToExpect:
      "Une phrase d'accroche qui donne envie. Les meilleures sont courtes, mystérieuses, avec un paradoxe ou une question.",
    commonPitfalls: "Phrase trop longue (résumé au lieu de pitch). Pas accrocheuse. Révèle trop de l'histoire.",
    relancePhrase: "C'est cette phrase qu'on met sur l'affiche en GRAND. Elle donne envie ou pas ?",
    challengePhrase:
      "Les meilleurs pitchs créent un mystère. 'Dans sa vie, tout est un mensonge. Sauf un truc.' — Tu peux faire mieux ?",
  },
];

// ——————————————————————————————————————————————————————
// QUESTION GUIDES — Module 2 (Séances 1, 2, 3, 4)
// ——————————————————————————————————————————————————————

const MODULE9_S1_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "metiers",
    label: "Le réalisateur",
    whatToExpect:
      "Réponses autour du 'chef' ou du 'patron'. Les élèves confondent souvent réalisateur et acteur. C'est l'occasion de clarifier.",
    commonPitfalls:
      "Confusion réalisateur/acteur. Réponse vague ('il fait le film'). Pas de mention des décisions créatives.",
    relancePhrase:
      "Le réalisateur ne joue pas dans le film (en général). Alors il fait quoi exactement sur le plateau ?",
    challengePhrase: "Si le réalisateur disparaît, est-ce que le film se fait quand même ? Qu'est-ce qui manquerait ?",
  },
  {
    position: 2,
    category: "metiers",
    label: "L'équipe",
    whatToExpect:
      "Les élèves citent souvent acteurs et caméramans. Pousser vers les métiers moins visibles : son, lumière, montage, costumes.",
    commonPitfalls:
      "Ne cite que les acteurs. Oublie les métiers techniques. Ne comprend pas que chaque métier est indispensable.",
    relancePhrase: "OK y'a des acteurs et un cadreur. Mais qui s'occupe du son ? De la lumière ? Des costumes ?",
    challengePhrase: "Si tu enlèves UN métier de la liste, le film s'écroule. Lequel fait le plus de dégâts ?",
  },
  {
    position: 3,
    category: "budget",
    label: "Le coût",
    whatToExpect:
      "Réponses centrées sur les acteurs et les effets spéciaux. Ouvrir vers les coûts cachés : transport, nourriture, locations.",
    commonPitfalls:
      "Pense que seuls les acteurs coûtent cher. Ne comprend pas les coûts logistiques. Chiffres irréalistes.",
    relancePhrase: "Les acteurs, OK. Mais qui paye la nourriture de l'équipe pendant 3 mois de tournage ?",
    challengePhrase: "Certains films coûtent 15 000 €, d'autres 200 millions. C'est quoi la différence fondamentale ?",
  },
  {
    position: 4,
    category: "contrainte",
    label: "Le temps",
    whatToExpect:
      "Les élèves découvrent la pression du temps. Lien avec leur propre expérience (devoirs, projets de classe).",
    commonPitfalls: "Réponse passive ('on fait vite'). Pas de réflexion sur les choix qu'impose le manque de temps.",
    relancePhrase: "Tu as 2 heures pour tourner 5 scènes. Tu commences par laquelle ? Pourquoi ?",
    challengePhrase: "Et si le manque de temps t'obligeait à faire MIEUX ? Moins de temps = plus de créativité ?",
  },
  {
    position: 5,
    category: "contrainte",
    label: "L'espace",
    whatToExpect:
      "Réponses sur les autorisations, le bruit, les passants. Les élèves comprennent que l'espace public n'est pas libre.",
    commonPitfalls: "Pense qu'on peut filmer partout. Ne comprend pas les contraintes légales et pratiques.",
    relancePhrase: "Tu veux filmer dans la cour du collège. Tu dois demander à qui ? Et si on te dit non ?",
    challengePhrase: "Les meilleurs films utilisent un seul lieu. Comment faire tout un film dans cette salle ?",
  },
  {
    position: 6,
    category: "metiers",
    label: "Le cadreur",
    whatToExpect:
      "Les élèves comprennent que la caméra n'est pas neutre — elle CHOISIT ce qu'on voit. C'est un métier créatif.",
    commonPitfalls: "Pense que le cadreur 'filme tout'. Ne comprend pas que cadrer = choisir et exclure.",
    relancePhrase: "Fais un cadre avec tes mains. Tu vois quoi ? Maintenant bouge un peu. Ça change tout, non ?",
    challengePhrase: "Si le cadreur décide de ne montrer QUE les mains du personnage, ça raconte quoi ?",
  },
  {
    position: 7,
    category: "budget",
    label: "Le low-budget",
    whatToExpect:
      "Les élèves sont surpris qu'on puisse faire des films sans argent. Exemples : Blair Witch, Tangerine (filmé à l'iPhone).",
    commonPitfalls: "Pense que low-budget = mauvais film. Ne comprend pas que la contrainte stimule la créativité.",
    relancePhrase: "Blair Witch a coûté 60 000 $ et a rapporté 250 millions. Comment c'est possible ?",
    challengePhrase: "Tu as 0 €, un téléphone et 3 amis. C'est assez pour un bon film ?",
  },
  {
    position: 8,
    category: "contrainte",
    label: "Produire un film",
    whatToExpect:
      "Synthèse personnelle. Les meilleures réponses combinent équipe, argent, temps et créativité en une phrase.",
    commonPitfalls: "Synthèse trop vague. Oublie une dimension (technique, humaine, financière, créative).",
    relancePhrase: "En une phrase : c'est quoi le plus dur quand on produit un film ?",
    challengePhrase: "Produire un film, c'est l'art de faire des CHOIX. Tu es d'accord ou pas ?",
  },
];

const MODULE9_S2_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "budget",
    label: "Le casting",
    whatToExpect:
      "L'élève réfléchit à l'impact du casting sur le film. Stars vs amis vs solo — chaque option a des conséquences.",
    commonPitfalls: "Veut toujours des stars. Ne comprend pas qu'un bon acteur amateur peut être plus authentique.",
    relancePhrase: "Des stars, c'est cool. Mais ça coûte cher. Et si tes potes jouaient mieux parce qu'ils y croient ?",
    challengePhrase:
      "Le film Tangerine a été tourné avec des inconnus et un iPhone. Il est meilleur que beaucoup de blockbusters. Pourquoi ?",
  },
  {
    position: 2,
    category: "budget",
    label: "Le décor",
    whatToExpect: "Choix entre simplicité et ambition. Le lieu raconte une histoire — le budget détermine laquelle.",
    commonPitfalls: "Veut filmer partout sans penser au coût. Ne comprend pas qu'un seul lieu bien choisi suffit.",
    relancePhrase: "Un seul lieu, mais lequel ? L'endroit idéal pour TON histoire, c'est quoi ?",
    challengePhrase: "12 Angry Men se passe dans UNE seule pièce. Et c'est un chef-d'œuvre. Comment c'est possible ?",
  },
  {
    position: 3,
    category: "budget",
    label: "L'image",
    whatToExpect:
      "L'élève découvre que le rendu visuel est un choix, pas un hasard. Brut peut être aussi puissant que léché.",
    commonPitfalls: "Pense que brut = nul. Ne comprend pas que le style visuel sert l'histoire.",
    relancePhrase: "Un film d'horreur filmé à la main, c'est plus flippant qu'en 4K. Pourquoi ?",
    challengePhrase: "L'image parfaite n'existe pas. L'image JUSTE, oui. C'est quoi la différence ?",
  },
  {
    position: 4,
    category: "budget",
    label: "Le son",
    whatToExpect:
      "Les élèves sous-estiment le son. C'est l'occasion de montrer que le son fait 50% de l'émotion d'un film.",
    commonPitfalls:
      "Néglige le son ('c'est pas important'). Ne comprend pas la différence entre son direct et post-production.",
    relancePhrase: "Regarde une scène de film en coupant le son. Ça change tout, non ?",
    challengePhrase: "Un film muet avec des sous-titres, ça peut être PLUS puissant que des dialogues. Comment ?",
  },
  {
    position: 5,
    category: "budget",
    label: "Le montage",
    whatToExpect:
      "L'élève choisit entre plan-séquence et montage coupé. Chaque option a un impact sur le rythme et l'émotion.",
    commonPitfalls: "Veut plein d'effets sans comprendre pourquoi. Confond montage = effets spéciaux.",
    relancePhrase:
      "Un plan-séquence, c'est pas de coupure. Comme si on était DANS la scène. Ça te plaît ou ça te fait peur ?",
    challengePhrase: "Le montage est invisible quand il est bon. Le spectateur ne le voit pas mais le SENT. Comment ?",
  },
];

const MODULE9_S3_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "resolution",
    label: "L'acteur absent",
    whatToExpect:
      "Solutions créatives : réécrire la scène, utiliser un doublure, tourner de dos, changer le plan de tournage.",
    commonPitfalls:
      "Réponse passive ('on attend qu'il revienne'). Pas de solution créative. Annulation pure et simple.",
    relancePhrase: "Tu ne peux PAS attendre. Le lieu est réservé pour aujourd'hui seulement. Tu fais quoi MAINTENANT ?",
    challengePhrase:
      "Et si l'absence de l'acteur rendait la scène MEILLEURE ? On le montre jamais mais on sent sa présence...",
  },
  {
    position: 2,
    category: "resolution",
    label: "La météo",
    whatToExpect: "Adaptation : tourner sous la pluie, aller en intérieur, réécrire la scène avec la météo.",
    commonPitfalls: "Attend que ça passe. Ne pense pas à intégrer la météo dans l'histoire.",
    relancePhrase: "La pluie peut rendre une scène magnifique. Comment tu l'utilises ?",
    challengePhrase: "Blade Runner, c'est sous la pluie. Et c'est mythique. Ta scène sous la pluie, elle donne quoi ?",
  },
  {
    position: 3,
    category: "resolution",
    label: "La panne",
    whatToExpect:
      "Solutions : téléphone de secours, changer de plan, tourner en audio seul, improviser avec ce qu'on a.",
    commonPitfalls: "Panique. Pas de réflexe de backup. Ne pense pas à utiliser d'autres appareils.",
    relancePhrase: "Combien de téléphones il y a dans cette salle ? La solution est peut-être là.",
    challengePhrase:
      "Et si tu tournais le reste du film SANS image ? Juste du son, du noir, des voix... Ça marcherait ?",
  },
  {
    position: 4,
    category: "resolution",
    label: "Le bruit",
    whatToExpect: "Solutions : post-synchronisation, sous-titres, réécriture en scène muette, changement de lieu.",
    commonPitfalls: "Attend que le bruit s'arrête. Ne pense pas aux alternatives créatives.",
    relancePhrase: "Et si le bruit FAISAIT PARTIE du film ? Les travaux deviennent le décor sonore...",
    challengePhrase:
      "Certains cinéastes utilisent le bruit ambiant comme musique. Comment tu transformes cette nuisance en art ?",
  },
  {
    position: 5,
    category: "resolution",
    label: "Le conflit d'équipe",
    whatToExpect:
      "Gestion de conflit : écouter les deux côtés, voter, essayer les deux versions, trancher en tant que réalisateur.",
    commonPitfalls: "Prend un côté sans écouter l'autre. Résout par la force ('c'est moi le chef'). Ignore le conflit.",
    relancePhrase: "Les deux ont peut-être raison. Comment tu fais pour que tout le monde se sente écouté ?",
    challengePhrase: "Et si tu tournais les DEUX versions et que tu choisissais au montage ? Ça coûte quoi ?",
  },
  {
    position: 6,
    category: "resolution",
    label: "L'accès refusé",
    whatToExpect:
      "Alternatives : trouver un lieu similaire, filmer devant le lieu fermé, réécrire pour un autre décor.",
    commonPitfalls: "Abandon. Ne cherche pas de lieu alternatif. Pas de créativité dans la substitution.",
    relancePhrase: "Le lieu est fermé mais la rue devant est ouverte. Tu peux raconter quoi avec ça ?",
    challengePhrase:
      "Le lieu prévu était parfait. Mais peut-être que le lieu de remplacement raconte une histoire DIFFÉRENTE et meilleure ?",
  },
  {
    position: 7,
    category: "resolution",
    label: "Le temps qui file",
    whatToExpect: "Priorisation : quelle scène est essentielle, que peut-on simplifier, que peut-on couper.",
    commonPitfalls: "Essaie de tout faire en bâclant. Ne sait pas prioriser. Sacrifie la scène clé.",
    relancePhrase:
      "UNE seule scène est vraiment indispensable. Laquelle ? Les deux autres, tu les simplifies comment ?",
    challengePhrase: "30 minutes, 3 scènes. Et si tu les fusionnais en UNE seule scène qui raconte tout ?",
  },
  {
    position: 8,
    category: "resolution",
    label: "Le rush raté",
    whatToExpect:
      "Solutions créatives : effet artistique, retourner différemment, utiliser le flou comme parti pris, re-shooter.",
    commonPitfalls:
      "Pense que c'est foutu. Ne voit pas le potentiel créatif d'un 'accident'. Veut tout refaire à l'identique.",
    relancePhrase:
      "Le flou, c'est un style. Des cinéastes le font EXPRÈS. Comment tu transformes ce raté en choix artistique ?",
    challengePhrase:
      "Les plus beaux accidents du cinéma sont devenus des scènes cultes. C'est quoi ton accident culte ?",
  },
];

const MODULE9_S4_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "organisation",
    label: "L'équipe idéale",
    whatToExpect:
      "Répartition des rôles : réalisateur, cadreur, acteurs, son, lumière. L'élève pense à qui fait quoi concrètement.",
    commonPitfalls: "Tout le monde est acteur, personne derrière la caméra. Oublie les rôles techniques.",
    relancePhrase: "OK t'as des acteurs. Mais qui tient la caméra ? Qui surveille le son ? Qui dit 'Action' ?",
    challengePhrase: "Et si tu n'avais que 3 personnes ? Qui fait quoi ? Certains cumulent les rôles — lesquels ?",
  },
  {
    position: 2,
    category: "organisation",
    label: "La scène clé",
    whatToExpect: "L'élève identifie LE moment fort de son film. C'est la scène autour de laquelle tout s'organise.",
    commonPitfalls:
      "Choisit une scène d'action plutôt que la scène la plus IMPORTANTE narrativement. Pas de justification.",
    relancePhrase: "Si le spectateur ne retient qu'UNE scène, c'est laquelle ? Pourquoi celle-là ?",
    challengePhrase:
      "Ta scène clé, est-ce qu'elle montre la transformation du personnage ? Si non, c'est la bonne scène ?",
  },
  {
    position: 3,
    category: "organisation",
    label: "Le planning",
    whatToExpect: "Un début d'organisation concrète : quoi d'abord, quoi ensuite, gestion du temps et des pauses.",
    commonPitfalls: "Planning irréaliste (10 scènes en 2h). Pas de marge pour les imprévus. Pas d'ordre logique.",
    relancePhrase: "On commence par la scène la plus technique ou la plus simple ? Pourquoi ?",
    challengePhrase: "Les pros tournent rarement dans l'ordre du film. Pourquoi ? Et toi, tu tournes dans quel ordre ?",
  },
  {
    position: 4,
    category: "organisation",
    label: "Le repérage",
    whatToExpect: "L'élève pense à la lumière, au bruit, aux autorisations, à la logistique (prises, espace, accès).",
    commonPitfalls: "Pense que repérage = juste 'regarder l'endroit'. Oublie le son, la lumière, les autorisations.",
    relancePhrase: "Quand tu arrives sur le lieu, tu vérifies quoi en PREMIER ? Le son ? La lumière ? L'espace ?",
    challengePhrase:
      "Un bon repérage évite 80% des problèmes. Qu'est-ce qui pourrait mal tourner si tu sautes cette étape ?",
  },
  {
    position: 5,
    category: "contrainte",
    label: "Le plan B",
    whatToExpect:
      "L'élève anticipe l'échec et propose une alternative réaliste. Lien direct avec la séance 3 (imprévus).",
    commonPitfalls: "Pas de plan B ('ça va marcher'). Plan B identique au plan A. Pas de réflexion sur l'alternative.",
    relancePhrase: "Tu mises tout sur une scène. Elle rate. Tu fais quoi ? Tu avais prévu cette situation ?",
    challengePhrase:
      "Et si ton plan B était MEILLEUR que ton plan A ? Comment tu le sauras si tu ne l'as pas préparé ?",
  },
  {
    position: 6,
    category: "organisation",
    label: "Le premier plan",
    whatToExpect: "Une image d'ouverture concrète et visuelle. Le premier plan donne le ton du film entier.",
    commonPitfalls: "Image trop vague ('on voit la ville'). Pas de lien avec l'histoire. Premier plan sans intention.",
    relancePhrase: "Ferme les yeux. L'écran s'allume. C'est quoi la PREMIÈRE image ? Décris-la comme si j'y étais.",
    challengePhrase:
      "Le premier plan de ton film, c'est ta carte de visite. Le spectateur décide en 3 secondes s'il reste. Il reste ?",
  },
  {
    position: 7,
    category: "organisation",
    label: "Le dernier plan",
    whatToExpect: "L'image finale, celle qui reste. Doit résonner avec le premier plan et résumer l'arc du personnage.",
    commonPitfalls: "Fin bâclée ('c'est fini'). Pas de lien avec le premier plan. Image sans émotion.",
    relancePhrase: "La dernière image, c'est celle que le spectateur emporte chez lui. C'est quoi ?",
    challengePhrase:
      "Compare ton premier et ton dernier plan. Qu'est-ce qui a changé ? C'est ça, l'histoire de ton film.",
  },
  {
    position: 8,
    category: "organisation",
    label: "Le pitch de prod",
    whatToExpect:
      "Une phrase de synthèse qui résume le quoi, où, qui et comment du tournage. L'exercice ultime de production.",
    commonPitfalls: "Phrase trop longue (résumé au lieu de pitch). Oublie un élément clé. Pas percutant.",
    relancePhrase: "En UNE phrase : c'est quoi ton film, on le tourne où, avec qui, et comment ?",
    challengePhrase: "Si tu dois convaincre un producteur en 10 secondes, c'est cette phrase. Elle convainc ?",
  },
];

// ——————————————————————————————————————————————————————
// MODULE 2 — ÉMOTION CACHÉE (u2a/u2b/u2c/u2d)
// ——————————————————————————————————————————————————————

const MODULE2EC_S1_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "emotion_cachee",
    label: "Checklist culturelle",
    whatToExpect:
      "Les élèves sélectionnent ≥3 contenus qu'ils connaissent (séries, films, anime). Puis choisissent leur préféré. Pas de réponse à évaluer — c'est un déclencheur.",
    commonPitfalls:
      "Élèves qui ne connaissent rien de la liste — les rassurer, ils peuvent choisir ce qu'ils veulent. Élèves qui sélectionnent TOUT sans réfléchir.",
    relancePhrase: "C'est lequel qui t'a le plus marqué ? Celui dont tu pourrais parler pendant 10 minutes ?",
    challengePhrase:
      "Tu en as choisi beaucoup — si tu devais n'en garder qu'UN pour en faire un film, ce serait lequel ?",
  },
  {
    position: 2,
    category: "emotion_cachee",
    label: "La scène marquante",
    whatToExpect:
      "Un texte libre décrivant une scène qui les a marqués dans un contenu qu'ils aiment. Détails visuels, émotions, contexte.",
    commonPitfalls:
      "Résumé de tout le film au lieu d'UNE scène. Description trop vague ('c'était bien'). Spoiler sans contexte émotionnel.",
    relancePhrase: "Ferme les yeux. Tu revois la scène. Qu'est-ce que tu vois ? Qu'est-ce que tu ressens à ce moment ?",
    challengePhrase: "Pourquoi CETTE scène et pas une autre ? Qu'est-ce qu'elle a de spécial pour toi ?",
  },
  {
    position: 3,
    category: "emotion_cachee",
    label: "Entre les lignes",
    whatToExpect:
      "Une réponse qui creuse : qu'est-ce que le personnage veut VRAIMENT dans cette scène ? Au-delà de l'action visible.",
    commonPitfalls:
      "Réponse superficielle ('il veut gagner'). Confusion entre action et motivation profonde. Réponse trop courte.",
    relancePhrase: "OK, il fait ça. Mais POURQUOI ? Qu'est-ce qu'il cherche vraiment au fond ?",
    challengePhrase: "Et si le personnage lui-même ne savait pas ce qu'il veut vraiment ? C'est ça l'émotion cachée.",
  },
];

const MODULE2EC_S2_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "emotion_cachee",
    label: "L'émotion cachée",
    whatToExpect:
      "Choix fermé parmi 5 émotions (exclusion, injustice, honte, jalousie, joie fragile). Chaque élève associe une émotion à son contenu préféré.",
    commonPitfalls:
      "Élèves qui choisissent 'par défaut' sans réfléchir. Difficulté à nommer une émotion — c'est normal et attendu.",
    relancePhrase: "Repense à ta scène marquante. Le personnage, qu'est-ce qu'il ressent VRAIMENT à ce moment ?",
    challengePhrase:
      "Parfois une émotion en cache une autre. La colère cache souvent la peur. La joie cache parfois la tristesse.",
  },
  {
    position: 2,
    category: "emotion_cachee",
    label: "Construction de scène",
    whatToExpect:
      "Chaque élève construit une scène avec contraintes : intention + obstacle + changement, puis choisit des éléments visuels/narratifs dans un budget de jetons.",
    commonPitfalls:
      "Scènes sans vrai conflit (tout se passe bien). Trop d'éléments spectaculaires sans lien narratif. Oubli de l'émotion choisie.",
    relancePhrase: "Ton personnage veut quelque chose, mais quelque chose l'empêche. C'est quoi l'empêchement ?",
    challengePhrase:
      "Tu as choisi une explosion ET une cascade — est-ce que ça sert vraiment l'émotion de ta scène, ou c'est juste cool ?",
  },
];

const MODULE2EC_S3_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "emotion_cachee",
    label: "La plus claire",
    whatToExpect:
      "Après projection de 2 scènes anonymes, les élèves disent laquelle communique le mieux l'émotion. Argumentation sur la clarté narrative.",
    commonPitfalls:
      "Vote 'pour mon pote' plutôt que sur le fond. Critiques méchantes — recadrer vers le constructif. Difficulté à expliquer pourquoi.",
    relancePhrase: "Laquelle des deux, tu COMPRENDS mieux ce que le personnage ressent ? Pourquoi ?",
    challengePhrase: "La scène la plus spectaculaire est-elle forcément la plus émouvante ? Pourquoi ?",
  },
  {
    position: 2,
    category: "emotion_cachee",
    label: "Les désaccords",
    whatToExpect:
      "Exploration des divergences : pourquoi la classe n'est pas unanime ? Qu'est-ce qui fait qu'on ne lit pas tous la même émotion ?",
    commonPitfalls:
      "Débat qui tourne au conflit personnel. Élèves qui ne s'expriment pas. Réponses trop consensuelles ('les deux sont bien').",
    relancePhrase:
      "Tu n'es pas d'accord avec la majorité — c'est intéressant ! Qu'est-ce que tu as vu que les autres n'ont pas vu ?",
    challengePhrase:
      "Au cinéma, un bon film divise. Si tout le monde est d'accord, c'est peut-être que la scène n'est pas assez forte.",
  },
];

const MODULE2EC_S4_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "emotion_cachee",
    label: "Le thème",
    whatToExpect:
      "Choix fermé parmi 7 thèmes (amitié, injustice, secret, défi, rivalité, courage, autre). Synthèse collective des thèmes qui émergent.",
    commonPitfalls:
      "Choix sans lien avec le travail fait. Élèves qui choisissent 'autre' par facilité. Difficulté à faire le lien entre émotion et thème.",
    relancePhrase: "Repense à l'émotion que tu as explorée. C'est quoi le GRAND sujet derrière ?",
    challengePhrase: "L'amitié et la rivalité, c'est parfois la même chose. Tu es sûr de ton choix ?",
  },
  {
    position: 2,
    category: "emotion_cachee",
    label: "L'arc du personnage",
    whatToExpect:
      "Choix fermé : le personnage gagne/perd/change/se rebelle/cache. Réflexion sur la trajectoire émotionnelle.",
    commonPitfalls:
      "Tout le monde choisit 'gagne' — discuter : gagner quoi ? Confusion entre fin heureuse et arc intéressant.",
    relancePhrase: "Le personnage au début et à la fin — c'est la même personne ? Qu'est-ce qui a changé ?",
    challengePhrase: "Les personnages les plus mémorables ne gagnent pas toujours. Pensez à des exemples.",
  },
];

// ——————————————————————————————————————————————————————
// MODULE 1 — L'IDÉE (Positionnement, Images, Carnet)
// ——————————————————————————————————————————————————————
const MODULE1_S1_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "positionnement",
    label: "Positionnement 1",
    whatToExpect: "Première question d'opinion. Les élèves découvrent le format et hésitent souvent.",
    commonPitfalls: "Certains élèves ne répondent pas, ils observent. C'est normal au début.",
    relancePhrase: "Il n'y a pas de bonne ou mauvaise réponse. On veut juste savoir ce que VOUS pensez.",
    challengePhrase: "Qui pense le contraire ? Levez la main — on va en discuter.",
  },
  {
    position: 2,
    category: "positionnement",
    label: "Positionnement 2",
    whatToExpect: "Les élèves commencent à comprendre le rythme. Les réponses sont plus rapides.",
    commonPitfalls: "Conformisme — les élèves regardent les barres en temps réel et copient la majorité.",
    relancePhrase: "Regardez les résultats : la classe est divisée. Pourquoi d'après vous ?",
    challengePhrase: "Si tout le monde choisit la même chose, c'est peut-être trop facile comme question...",
  },
  {
    position: 3,
    category: "positionnement",
    label: "Positionnement 3",
    whatToExpect: "Le groupe se réchauffe. Les premiers désaccords émergent.",
    commonPitfalls: "Certains changent d'avis en voyant la majorité — rappelez que c'est anonyme.",
    relancePhrase: "Intéressant comme résultat. Quelqu'un veut expliquer son choix ?",
    challengePhrase: "C'est le genre de question qui divise les réalisateurs aussi. Il n'y a pas de consensus.",
  },
  {
    position: 4,
    category: "positionnement",
    label: "Positionnement 4",
    whatToExpect: "Les opinions sont plus tranchées. Le groupe commence à débattre naturellement.",
    commonPitfalls: "Discussions trop longues — gardez le rythme, 2-3 réactions max.",
    relancePhrase: "On va voter et on en reparle après. Votre premier instinct est souvent le bon.",
    challengePhrase: "Essayez de défendre le choix que vous n'avez PAS fait. Ça change la perspective.",
  },
  {
    position: 5,
    category: "positionnement",
    label: "Positionnement 5",
    whatToExpect: "Les élèves sont à l'aise avec le format. Réponses fluides.",
    commonPitfalls: "Attention à la fatigue — restez dynamique dans les transitions.",
    relancePhrase: "Vos réponses montrent quelque chose sur ce qui vous touche dans les histoires.",
    challengePhrase: "Un réalisateur ferait quoi avec cette info ? Comment ça influence un film ?",
  },
  {
    position: 6,
    category: "positionnement",
    label: "Positionnement 6",
    whatToExpect: "Deuxième moitié — les profils commencent à se dessiner.",
    commonPitfalls: "Baisse d'attention — variez le ton, ajoutez une anecdote liée au cinéma.",
    relancePhrase: "Regardez comment la classe se positionne. Il y a des tendances fortes ?",
    challengePhrase: "Les meilleurs films surprennent. Choisissez la réponse qui vous surprend le plus.",
  },
  {
    position: 7,
    category: "positionnement",
    label: "Positionnement 7",
    whatToExpect: "Avant-dernière question. Les réponses reflètent les vrais goûts.",
    commonPitfalls: "Les élèves anticipent la fin — maintenez l'énergie.",
    relancePhrase: "Plus que 2 questions. Celle-ci est importante pour la suite du parcours.",
    challengePhrase: "Votre choix dit beaucoup sur le type de films que vous aimeriez créer.",
  },
  {
    position: 8,
    category: "positionnement",
    label: "Positionnement 8",
    whatToExpect: "Dernière question. Transition vers les images — profitez-en pour résumer les tendances.",
    commonPitfalls: "Certains veulent continuer le débat — canalisez l'énergie vers la suite.",
    relancePhrase: "Dernière question ! Répondez vite et bien, on passe à quelque chose de visuel ensuite.",
    challengePhrase: "Gardez vos réponses en tête — on va voir si vos instincts changent avec les images.",
  },
];

const MODULE1_S2_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "image",
    label: "Image — Observation + Écriture",
    whatToExpect: "Les élèves observent une image et écrivent une réponse libre. C'est le premier exercice d'écriture.",
    commonPitfalls: "Descriptions littérales au lieu d'interprétation. Réponses trop courtes.",
    relancePhrase: "Ne décrivez pas ce que vous voyez. Imaginez ce qui s'est passé AVANT ou APRÈS cette image.",
    challengePhrase: "Si c'était l'affiche d'un film, quel serait le titre ? Pourquoi ?",
  },
];

const MODULE1_S3_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "image",
    label: "Image — Observation + Écriture",
    whatToExpect: "Deuxième image. Les élèves sont plus à l'aise, les réponses s'allongent.",
    commonPitfalls: "Répétition des mêmes idées que l'image précédente.",
    relancePhrase: "Cette image est différente de la première. Qu'est-ce qu'elle vous fait ressentir de nouveau ?",
    challengePhrase: "Connectez cette image à la précédente. Et si c'était le même film ?",
  },
];

const MODULE1_S4_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "image",
    label: "Image — Observation + Écriture",
    whatToExpect: "Troisième image. Les élèves développent leur style d'écriture.",
    commonPitfalls: "Fatigue d'écriture — certains font court pour finir vite.",
    relancePhrase: "Cette image cache un secret. Lequel ? Écrivez ce que personne d'autre ne verra.",
    challengePhrase: "Quel personnage pourrait vivre dans ce décor ? Donnez-lui un nom et un problème.",
  },
];

const MODULE1_S5_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "carnet",
    label: "Carnet d'idées",
    whatToExpect:
      "Écriture libre. Les élèves compilent leurs premières idées de film. Certains auront beaucoup, d'autres peu.",
    commonPitfalls: "Blocage de la page blanche. Les élèves ne savent pas par où commencer.",
    relancePhrase:
      "Repensez à tout ce qu'on a vu aujourd'hui : les images, les questions. Qu'est-ce qui vous a le plus marqué ?",
    challengePhrase: "Ne cherchez pas l'idée parfaite. Écrivez 3 idées nulles, la 4e sera bonne.",
  },
];

// ——————————————————————————————————————————————————————
// MODULE 10 — ET SI... + PITCH
// ——————————————————————————————————————————————————————
const MODULE10_S1_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "imagination",
    label: "Image + « Et si... »",
    whatToExpect:
      "Les élèves observent une image et écrivent une phrase commençant par « Et si... ». Certains bloqueront.",
    commonPitfalls: "Réponses trop courtes ou littérales (description de l'image au lieu d'imagination).",
    relancePhrase: "Regardez bien les détails de l'image. Qu'est-ce qui pourrait se passer juste après cette scène ?",
    challengePhrase: "C'est un bon début, mais poussez plus loin — que se passe-t-il si on inverse la situation ?",
  },
  {
    position: 2,
    category: "imagination",
    label: "QCM — Direction narrative",
    whatToExpect: "Choix entre 4 directions narratives. Permet de voir les tendances de la classe.",
    commonPitfalls: "Vote par conformisme — les élèves choisissent ce que leurs amis choisissent.",
    relancePhrase: "Il n'y a pas de mauvaise réponse. Choisissez ce qui vous parle, pas ce que les autres choisissent.",
    challengePhrase: "Pourquoi ce choix ? Essayez de justifier en une phrase.",
  },
  {
    position: 3,
    category: "imagination",
    label: "Banque d'idées collective",
    whatToExpect: "Les élèves partagent leurs « Et si... » dans un espace collectif et votent pour les meilleures.",
    commonPitfalls: "Certains n'osent pas partager — encouragez-les, c'est anonyme dans la banque.",
    relancePhrase: "Lisez les idées des autres. Laquelle vous donne le plus envie de voir le film ?",
    challengePhrase: "Combinez deux idées de la banque — ça donne quoi ?",
  },
];

const MODULE10_S2_QUESTIONS: QuestionGuide[] = [
  {
    position: 1,
    category: "pitch",
    label: "Création du personnage",
    whatToExpect:
      "ÉTAPE IDENTITÉ — Les élèves construisent un avatar visuel, choisissent prénom + trait de caractère. Résultat attendu : un personnage reconnaissable en une phrase (« Lina, 15 ans, rebelle »). C'est la fondation, pas encore l'histoire.",
    commonPitfalls:
      "Personnages copiés d'animes/films (Naruto, Spiderman). Trait trop générique (« gentil »). Pas de lien avec une vraie personnalité.",
    relancePhrase:
      "Pense à quelqu'un de ton entourage ou de ton quartier. Qu'est-ce qui le rend unique ? Son look, sa façon de parler, un détail ?",
    challengePhrase: "Si je croise ton personnage dans la rue, comment je le reconnais ? Un seul détail suffit.",
  },
  {
    position: 2,
    category: "pitch",
    label: "Objectif + Obstacle",
    whatToExpect:
      "ÉTAPE CONFLIT — Les élèves choisissent ce que leur personnage VEUT (objectif) et ce qui l'en EMPÊCHE (obstacle). C'est le moteur dramatique. Ici on NE RÉDIGE PAS le pitch — on sélectionne les ingrédients. Le pitch viendra à l'étape suivante.",
    commonPitfalls:
      "Obstacle trop facile (« il a un peu peur » → pas assez de tension). Objectif trop abstrait (« être heureux » → pas filmable). Confusion avec l'étape pitch — rappeler que l'écriture, c'est après.",
    relancePhrase:
      "L'obstacle doit faire VRAIMENT peur au personnage. Si c'est facile à surmonter, personne n'a envie de regarder le film.",
    challengePhrase: "Rendez l'obstacle plus fort. Et si l'obstacle touchait aussi quelqu'un que le personnage aime ?",
  },
  {
    position: 3,
    category: "pitch",
    label: "Écriture du pitch",
    whatToExpect:
      "ÉTAPE NARRATION — C'est ici que l'élève écrit vraiment. Le textarea est VIDE (pas de template). L'élève voit son personnage, objectif et obstacle en rappel, puis raconte l'histoire en 3-5 phrases. Minimum 80 caractères imposé. Le résultat doit être un RÉCIT, pas une liste (« Un jour, Lina décide de... mais... alors... »).",
    commonPitfalls:
      "Pitch-liste (« il veut X mais Y ») au lieu d'un récit. Copier-coller de l'étape précédente. Trop court ou trop descriptif sans action. Rappeler : on raconte ce qui SE PASSE, pas ce que le personnage EST.",
    relancePhrase:
      "Commence par « Un jour, [prénom] décide de... ». Qu'est-ce qui se passe quand l'obstacle arrive ? Qu'est-ce qui est en jeu ?",
    challengePhrase:
      "Ferme les yeux. Imagine la bande-annonce de ton film. Qu'est-ce qu'on voit ? Maintenant écris ça.",
  },
  {
    position: 4,
    category: "pitch",
    label: "Test chrono — 30 secondes",
    whatToExpect:
      "ÉTAPE ORAL — L'élève lit son pitch à voix haute en 30 secondes chrono. Force la concision et l'expression. Ce n'est PAS une réécriture — c'est un exercice de présentation. Le chrono tourne vraiment.",
    commonPitfalls:
      "Stress paralysant — certains vont bloquer ou bâcler. Pitch trop long qui ne rentre pas en 30s (signe qu'il faut couper). Lecture monotone sans conviction.",
    relancePhrase:
      "C'est un entraînement, pas un examen. Si tu dépasses 30s, c'est normal — ça veut dire qu'il faut couper un bout.",
    challengePhrase:
      "Imagine que tu croises un producteur dans un ascenseur. Tu as 30 secondes pour le convaincre. Go.",
  },
  {
    position: 5,
    category: "pitch",
    label: "Confrontation + Vote",
    whatToExpect:
      "ÉTAPE COLLECTIVE — Deux pitchs sont projetés anonymement. La classe écoute les deux et vote pour celui qui donne le plus envie de voir le film. L'objectif est d'analyser ce qui rend un pitch efficace, pas de juger les personnes.",
    commonPitfalls:
      "Votes par popularité (« c'est mon pote »). Pas d'argumentation du choix. Moqueries — cadrer le respect.",
    relancePhrase: "Oubliez qui a écrit quoi. Lequel de ces deux films vous iriez voir au cinéma ? Pourquoi celui-là ?",
    challengePhrase: "Le pitch perdant a quand même un point fort. Lequel ? Et que manque-t-il pour qu'il gagne ?",
  },
];

// ——————————————————————————————————————————————————————
// ACCESSEURS
// ——————————————————————————————————————————————————————

const QUESTION_GUIDES: Record<string, QuestionGuide[]> = {
  "1-1": MODULE1_S1_QUESTIONS,
  "1-2": MODULE1_S2_QUESTIONS,
  "1-3": MODULE1_S3_QUESTIONS,
  "1-4": MODULE1_S4_QUESTIONS,
  "1-5": MODULE1_S5_QUESTIONS,
  "2-1": MODULE2EC_S1_QUESTIONS,
  "2-2": MODULE2EC_S2_QUESTIONS,
  "2-3": MODULE2EC_S3_QUESTIONS,
  "2-4": MODULE2EC_S4_QUESTIONS,
  "3-1": SEANCE_1_QUESTIONS,
  "3-2": SEANCE_2_QUESTIONS,
  "3-3": SEANCE_3_QUESTIONS,
  "4-1": MODULE4_QUESTIONS,
  "9-1": MODULE9_S1_QUESTIONS,
  "9-2": MODULE9_S2_QUESTIONS,
  "9-3": MODULE9_S3_QUESTIONS,
  "9-4": MODULE9_S4_QUESTIONS,
  "10-1": MODULE10_S1_QUESTIONS,
  "10-2": MODULE10_S2_QUESTIONS,
  "12-1": [
    {
      position: 1,
      category: "collectif",
      label: "Le Ton",
      whatToExpect: "Les eleves choisissent l'ambiance du film.",
      commonPitfalls: "Vote trop rapide sans lire les cartes.",
      relancePhrase: "Lisez bien chaque carte avant de voter.",
      challengePhrase: "Et si le ton etait completement different ?",
    },
    {
      position: 2,
      category: "collectif",
      label: "La Situation",
      whatToExpect: "Choix de la situation de depart.",
      commonPitfalls: "Les eleves choisissent le plus drole plutot que le plus riche.",
      relancePhrase: "Imaginez le debut du film avec chaque carte.",
      challengePhrase: "Cette situation, elle permet d'aller ou ?",
    },
    {
      position: 3,
      category: "collectif",
      label: "Les Personnages",
      whatToExpect: "Selection des personnages du film.",
      commonPitfalls: "Tendance a choisir des personnages stereotypes.",
      relancePhrase: "Quel personnage vous intrigue le plus ?",
      challengePhrase: "Est-ce que ce personnage va surprendre le spectateur ?",
    },
    {
      position: 4,
      category: "collectif",
      label: "L'Objectif",
      whatToExpect: "L'enjeu moteur de l'histoire.",
      commonPitfalls: "Objectif trop vague ou trop simple.",
      relancePhrase: "Quel objectif donne le plus envie de voir la suite ?",
      challengePhrase: "Est-ce que cet objectif va tenir 90 minutes ?",
    },
    {
      position: 5,
      category: "collectif",
      label: "L'Obstacle",
      whatToExpect: "Le conflit central prend forme.",
      commonPitfalls: "Obstacle deconnecte de l'objectif.",
      relancePhrase: "Quel obstacle rend l'histoire la plus intense ?",
      challengePhrase: "Cet obstacle, il fait peur au heros ou au spectateur ?",
    },
    {
      position: 6,
      category: "collectif",
      label: "La Premiere Scene",
      whatToExpect: "L'ouverture du film.",
      commonPitfalls: "Scene trop explicative, pas assez cinematographique.",
      relancePhrase: "Quelle scene vous donnerait envie de rester ?",
      challengePhrase: "En une image, qu'est-ce qu'on voit ?",
    },
    {
      position: 7,
      category: "collectif",
      label: "La Relation",
      whatToExpect: "Le lien emotionnel cle.",
      commonPitfalls: "Relation trop classique.",
      relancePhrase: "Quelle relation rend l'histoire plus humaine ?",
      challengePhrase: "Cette relation, elle va evoluer comment ?",
    },
    {
      position: 8,
      category: "collectif",
      label: "Le Moment Fort",
      whatToExpect: "Le climax du film.",
      commonPitfalls: "Moment trop previsible.",
      relancePhrase: "Quel moment vous donnerait des frissons ?",
      challengePhrase: "Si le spectateur devait retenir une seule scene, ce serait celle-la ?",
    },
  ] satisfies QuestionGuide[],
};

export function getModuleGuide(moduleId: string): ModuleGuide | undefined {
  return MODULE_GUIDES.find((g) => g.moduleId === moduleId);
}

export function getQuestionGuide(seance: number, position: number, module?: number): QuestionGuide | undefined {
  const key = `${module || 3}-${seance}`;
  const questions = QUESTION_GUIDES[key];
  if (!questions) return undefined;
  return questions.find((q) => q.position === position);
}

export function getQuestionGuides(seance: number, module?: number): QuestionGuide[] {
  const key = `${module || 3}-${seance}`;
  return QUESTION_GUIDES[key] || [];
}

// Socle Commun labels
export const SOCLE_LABELS: Record<string, string> = {
  D1: "Langages pour penser et communiquer",
  D2: "Méthodes et outils pour apprendre",
  D3: "Formation de la personne et du citoyen",
  D4: "Systèmes naturels et techniques",
  D5: "Représentations du monde et activité humaine",
};
