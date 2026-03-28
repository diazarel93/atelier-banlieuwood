/**
 * Cinema tips & lessons — rotating educational tidbits displayed
 * on the projector screen during waiting, paused, and reviewing states.
 *
 * Categories: technique, quote, fact, rule, reflection, anecdote,
 *             métier, réalisateur, acteur, rappel (session recap)
 */

export interface CinemaTip {
  module: number;
  seance?: number;
  text: string;
  source?: string;
  type:
    | "technique"
    | "quote"
    | "fact"
    | "rule"
    | "reflection"
    | "anecdote"
    | "métier"
    | "réalisateur"
    | "acteur"
    | "rappel"
    | "motivation";
}

export const CINEMA_TIPS: CinemaTip[] = [
  // ══════════════════════════════════════════════
  // MODULE 1 — L'IDÉE
  // ══════════════════════════════════════════════
  { module: 1, text: "Un bon film commence par une question, pas une réponse.", type: "technique" },
  { module: 1, text: "Pixar commence chaque film par « Et si... » — Et si les jouets étaient vivants ?", type: "fact" },
  {
    module: 1,
    text: "Pour faire un bon film, il faut 3 choses : un bon scénario, un bon scénario, un bon scénario.",
    source: "Alfred Hitchcock",
    type: "quote",
  },
  { module: 1, text: "Le premier film de l'histoire dure 46 secondes — les frères Lumière, 1895.", type: "fact" },
  {
    module: 1,
    text: "Une bonne idée tient en une phrase. Si tu ne peux pas la résumer, elle n'est pas assez claire.",
    type: "rule",
  },
  {
    module: 1,
    text: "Miyazaki commence ses films sans scénario fini — il dessine d'abord les images qui le touchent.",
    type: "anecdote",
  },
  { module: 1, text: "Le mot « scénario » vient de l'italien « scenario » qui signifie décor.", type: "fact" },
  {
    module: 1,
    text: "Toute grande histoire naît d'une observation du quotidien transformée par l'imagination.",
    type: "reflection",
  },
  {
    module: 1,
    text: "Le créateur de Naruto, Masashi Kishimoto, s'est inspiré de ses propres galères au collège pour écrire l'histoire.",
    type: "anecdote",
  },
  {
    module: 1,
    text: "L'idée de Matrix est venue d'une simple question : « Et si notre réalité était un programme ? »",
    type: "anecdote",
  },
  {
    module: 1,
    text: "Eiichiro Oda a eu l'idée de One Piece à 17 ans. 25 ans plus tard, c'est le manga le plus vendu au monde.",
    type: "fact",
  },
  { module: 1, text: "Le scénariste est celui qui invente l'histoire. Sans lui, pas de film.", type: "métier" },
  {
    module: 1,
    text: "Christopher Nolan écrit ses scénarios tout seul, à la main, sur du papier. Pas d'ordinateur.",
    type: "réalisateur",
  },
  {
    module: 1,
    text: "Zendaya a été repérée sur une vidéo de danse amateur. Une idée peut venir de n'importe où.",
    type: "acteur",
  },
  // Séance-specific rappels
  {
    module: 1,
    seance: 2,
    text: "Rappel séance 1 : Tu as découvert ton profil créatif. Garde ça en tête pour observer cette image.",
    type: "rappel",
  },
  {
    module: 1,
    seance: 3,
    text: "Rappel : La dernière image a montré la rue. Maintenant on passe à l'intérieur — change de regard.",
    type: "rappel",
  },
  {
    module: 1,
    seance: 4,
    text: "Rappel : Tu as déjà écrit sur 2 images. Cette fois, lâche-toi complètement.",
    type: "rappel",
  },
  {
    module: 1,
    seance: 5,
    text: "Rappel : Tu as observé 3 images et écrit tes réactions. Maintenant, transforme tout ça en idées de film.",
    type: "rappel",
  },

  // ══════════════════════════════════════════════
  // MODULE 2 — ÉMOTION CACHÉE
  // ══════════════════════════════════════════════
  { module: 2, text: "Au cinéma, on ne dit jamais « je suis triste ». On le montre.", type: "rule" },
  { module: 2, text: "Dans Vice-Versa, la tristesse est plus importante que la joie.", type: "fact" },
  { module: 2, text: "Un bon acteur ne joue pas l'émotion — il joue la situation.", type: "technique" },
  { module: 2, text: "Le silence est parfois plus puissant que n'importe quel dialogue.", type: "technique" },
  {
    module: 2,
    text: "Le cinéma, c'est écrire avec des images, parler avec du silence, et crier avec un regard.",
    type: "reflection",
  },
  { module: 2, text: "Le gros plan a été inventé pour montrer l'invisible : l'émotion d'un visage.", type: "fact" },
  {
    module: 2,
    text: "Kubrick faisait refaire la même scène 70 fois — jusqu'à ce que l'émotion soit « vraie ».",
    type: "anecdote",
  },
  {
    module: 2,
    text: "Dans Demon Slayer, la scène où Tanjiro sent les fleurs sur le corps de Rengoku... Aucun mot. Juste l'émotion.",
    type: "anecdote",
  },
  {
    module: 2,
    text: "La scène la plus triste de Dragon Ball Z ? La mort de Vegeta face à Freezer. Même les durs ont pleuré.",
    type: "anecdote",
  },
  {
    module: 2,
    text: "Le directeur de la photographie crée l'ambiance avec la lumière. Lumière chaude = sécurité. Lumière froide = danger.",
    type: "métier",
  },
  {
    module: 2,
    text: "Greta Gerwig (Barbie, Lady Bird) dit : « Le cinéma, c'est donner une émotion à quelqu'un qui ne la connaissait pas. »",
    type: "réalisateur",
  },
  {
    module: 2,
    text: "Timothée Chalamet se prépare pendant des mois pour chaque rôle. Il a appris le piano pour un film.",
    type: "acteur",
  },
  {
    module: 2,
    text: "Dans Spider-Man: No Way Home, la scène finale entre les 3 Spider-Man a fait pleurer des salles entières.",
    type: "anecdote",
  },
  {
    module: 2,
    seance: 1,
    text: "Vos films préférés révèlent les émotions qui vous touchent le plus. C'est votre ADN de cinéaste.",
    type: "reflection",
  },
  {
    module: 2,
    seance: 2,
    text: "Construire une scène, c'est comme un puzzle : chaque élément doit servir l'émotion.",
    type: "technique",
  },
  {
    module: 2,
    seance: 2,
    text: "Le ralenti ne sert pas à « montrer cool » — il sert à étirer une émotion pour qu'on la ressente.",
    type: "rule",
  },
  {
    module: 2,
    seance: 2,
    text: "Rappel séance 1 : Tu as partagé tes contenus préférés. Maintenant, utilise cette émotion pour construire ta scène.",
    type: "rappel",
  },
  {
    module: 2,
    seance: 3,
    text: "Rappel : Vous avez chacun construit une scène. Maintenant, deux d'entre elles s'affrontent !",
    type: "rappel",
  },
  {
    module: 2,
    seance: 4,
    text: "Rappel : Vous avez vu des confrontations de scènes. Qu'avez-vous appris sur les émotions ?",
    type: "rappel",
  },

  // ══════════════════════════════════════════════
  // MODULE 3 — LE HÉROS
  // ══════════════════════════════════════════════
  {
    module: 3,
    text: "Tout héros a une faille. Superman a la kryptonite. Quel est ton défaut préféré ?",
    type: "reflection",
  },
  { module: 3, text: "Luke Skywalker refuse d'abord l'aventure — c'est le « Refus de l'appel ».", type: "fact" },
  { module: 3, text: "Un personnage sans objectif = une histoire sans moteur.", type: "rule" },
  {
    module: 3,
    text: "Ce n'est pas le héros le plus fort qui gagne — c'est celui qui change le plus.",
    type: "technique",
  },
  {
    module: 3,
    text: "Shrek est un anti-héros : il ne veut PAS d'aventure. C'est ça qui le rend attachant.",
    type: "anecdote",
  },
  {
    module: 3,
    text: "Le voyage du héros a 12 étapes. Hollywood les utilise depuis 1949.",
    source: "Joseph Campbell",
    type: "fact",
  },
  { module: 3, text: "Un bon méchant croit sincèrement qu'il a raison. C'est ce qui le rend effrayant.", type: "rule" },
  {
    module: 3,
    text: "Dans Coco, le vrai méchant n'est révélé qu'à la fin — parce qu'il sourit tout le temps.",
    type: "anecdote",
  },
  {
    module: 3,
    text: "Luffy (One Piece) veut juste être libre. Son objectif est simple, mais il porte tout le manga.",
    type: "anecdote",
  },
  {
    module: 3,
    text: "Eren Jäger (L'Attaque des Titans) passe de héros à antagoniste. L'arc de personnage le plus fou du manga.",
    type: "anecdote",
  },
  {
    module: 3,
    text: "Deku (My Hero Academia) prouve qu'un héros n'a pas besoin de pouvoir pour avoir du courage.",
    type: "anecdote",
  },
  {
    module: 3,
    text: "Le directeur de casting choisit les acteurs. C'est lui qui décide qui sera le héros.",
    type: "métier",
  },
  {
    module: 3,
    text: "Ryan Coogler (Black Panther, Creed) avait 27 ans quand il a réalisé son premier film.",
    type: "réalisateur",
  },
  {
    module: 3,
    text: "Chadwick Boseman a tourné Black Panther en cachant sa maladie. Un vrai héros, à l'écran et dans la vie.",
    type: "acteur",
  },
  {
    module: 3,
    text: "Omar Sy est devenu l'acteur français le plus connu au monde grâce à Intouchables.",
    type: "acteur",
  },
  {
    module: 3,
    seance: 2,
    text: "Rappel séance 1 : Tu as réfléchi à ce qui fait un héros. Maintenant, qu'est-ce qui le met en mouvement ?",
    type: "rappel",
  },
  {
    module: 3,
    seance: 3,
    text: "Rappel : Tu connais ton héros et son conflit. Maintenant, cherche le message caché de l'histoire.",
    type: "rappel",
  },

  // ══════════════════════════════════════════════
  // MODULE 4 — VIS MA VIE
  // ══════════════════════════════════════════════
  {
    module: 4,
    text: "L'empathie, c'est voir le monde avec les yeux d'un autre — pas juger avec les tiens.",
    type: "reflection",
  },
  {
    module: 4,
    text: "Dans À la recherche du bonheur, on ne pleure pas parce que c'est triste — on pleure parce qu'on comprend.",
    type: "fact",
  },
  {
    module: 4,
    text: "Un bon film te fait ressentir ce que ressent le personnage, même s'il est très différent de toi.",
    type: "technique",
  },
  {
    module: 4,
    text: "Quand un personnage fait un mauvais choix, le spectateur comprend POURQUOI — c'est la clé.",
    type: "rule",
  },
  {
    module: 4,
    text: "Le réalisateur de Parasite a dit : « Je ne divise pas les gens en bons et méchants. »",
    source: "Bong Joon-ho",
    type: "quote",
  },
  {
    module: 4,
    text: "Joker (2019) nous fait ressentir de l'empathie pour un méchant. C'est la puissance du cinéma.",
    type: "anecdote",
  },
  {
    module: 4,
    text: "Dans Naruto, même Gaara — le « monstre » — finit par devenir attachant quand on comprend son passé.",
    type: "anecdote",
  },
  {
    module: 4,
    text: "Joaquin Phoenix a perdu 24 kg pour jouer le Joker. Se mettre dans la peau d'un autre, c'est tout un art.",
    type: "acteur",
  },
  { module: 4, text: "Le costumier habille les personnages pour raconter leur histoire sans un mot.", type: "métier" },
  {
    module: 4,
    text: "Ladj Ly (Les Misérables) a grandi en banlieue et a filmé ce qu'il voyait chaque jour. Authenticité = puissance.",
    type: "réalisateur",
  },

  // ══════════════════════════════════════════════
  // MODULE 9 — CINÉMA & PRODUCTION
  // ══════════════════════════════════════════════
  { module: 9, text: "Le film Paranormal Activity a coûté 15 000 $. Il a rapporté 193 millions.", type: "fact" },
  {
    module: 9,
    text: "Un plan-séquence = une seule prise sans coupure. Hitchcock l'a fait pour La Corde (1948).",
    type: "technique",
  },
  { module: 9, text: "Le son représente 50% de l'expérience cinéma.", source: "Stanley Kubrick", type: "quote" },
  {
    module: 9,
    text: "Le monteur est le « dernier auteur » du film — il choisit le rythme de l'émotion.",
    type: "métier",
  },
  { module: 9, text: "Sur un plateau, le clap sert à synchroniser le son et l'image. Action !", type: "fact" },
  {
    module: 9,
    text: "Un film utilise en moyenne 1 500 plans montés. Un seul plan raté peut casser une scène.",
    type: "fact",
  },
  {
    module: 9,
    text: "Le producteur est le chef d'orchestre : il gère l'argent, les équipes et les délais.",
    type: "métier",
  },
  {
    module: 9,
    text: "L'ingénieur du son capte tout : dialogues, ambiance, bruitages. Sans lui, le film serait muet.",
    type: "métier",
  },
  {
    module: 9,
    text: "Le chef opérateur (ou directeur photo) décide de chaque lumière, chaque ombre, chaque couleur.",
    type: "métier",
  },
  {
    module: 9,
    text: "Le régisseur organise tout sur le plateau : repas, transports, lieux de tournage.",
    type: "métier",
  },
  {
    module: 9,
    text: "Le cadreur est celui qui tient la caméra. C'est ses mains qui créent l'image que tu vois.",
    type: "métier",
  },
  {
    module: 9,
    text: "Le superviseur VFX crée les effets spéciaux : explosions, créatures, mondes imaginaires.",
    type: "métier",
  },
  {
    module: 9,
    text: "Le maquilleur transforme les acteurs. Dans Le Seigneur des Anneaux, le maquillage prenait 4h par hobbit.",
    type: "métier",
  },
  {
    module: 9,
    text: "Le compositeur écrit la musique. Hans Zimmer a composé la bande-son d'Inception en 2 semaines.",
    type: "métier",
  },
  {
    module: 9,
    text: "Denis Villeneuve (Dune) prépare chaque plan comme un tableau. Chaque image est pensée pendant des mois.",
    type: "réalisateur",
  },
  {
    module: 9,
    text: "Jordan Peele est passé de la comédie à l'horreur. Get Out est devenu culte en un week-end.",
    type: "réalisateur",
  },
  {
    module: 9,
    text: "Le tournage de Avengers: Endgame a duré 3 mois. La post-production a duré 10 mois.",
    type: "fact",
  },
  {
    module: 9,
    text: "Tom Holland a décroché le rôle de Spider-Man grâce à ses acrobaties. Il est gymnaste de formation.",
    type: "acteur",
  },
  {
    module: 9,
    text: "Florence Pugh (Black Widow, Oppenheimer) a commencé à jouer dans des films faits maison à 6 ans.",
    type: "acteur",
  },
  {
    module: 9,
    seance: 2,
    text: "Le budget d'un film se répartit : 40% salaires, 30% technique, 20% post-prod, 10% imprévu.",
    type: "fact",
  },
  {
    module: 9,
    seance: 2,
    text: "Mad Max: Fury Road a été tourné dans le désert de Namibie — avec 150 véhicules modifiés.",
    type: "anecdote",
  },
  {
    module: 9,
    seance: 2,
    text: "Rappel séance 1 : Tu as découvert les métiers du cinéma. Maintenant, c'est toi le producteur !",
    type: "rappel",
  },
  {
    module: 9,
    seance: 3,
    text: "Pendant le tournage de Titanic, la piscine n'avait que 1m de profondeur. Tout est illusion.",
    type: "anecdote",
  },
  {
    module: 9,
    seance: 3,
    text: "Le mot « rushes » désigne les premières prises brutes — souvent filmées dans l'urgence.",
    type: "fact",
  },
  {
    module: 9,
    seance: 3,
    text: "Rappel séance 2 : Tu as géré un budget. Mais le tournage ne se passe jamais comme prévu...",
    type: "rappel",
  },
  {
    module: 9,
    seance: 4,
    text: "Rappel : Métiers, budget, imprévus — tu connais les coulisses. Place au plan de bataille.",
    type: "rappel",
  },

  // ══════════════════════════════════════════════
  // MODULE 10 — IMAGINATION
  // ══════════════════════════════════════════════
  {
    module: 10,
    text: "Le pitch parfait tient en une phrase : « Un [personnage] veut [objectif] mais [obstacle]. »",
    type: "rule",
  },
  {
    module: 10,
    text: "Spielberg a pitché Les Dents de la mer en 1 phrase : « Un requin terrorise une plage. »",
    type: "fact",
  },
  {
    module: 10,
    text: "L'imagination, c'est voir ce qui n'existe pas encore — et y croire assez fort pour le créer.",
    type: "reflection",
  },
  {
    module: 10,
    text: "Avant de filmer, les studios Pixar racontent l'histoire entière avec des dessins simples : le storyboard.",
    type: "technique",
  },
  {
    module: 10,
    text: "Akira Toriyama (Dragon Ball) improvisait son manga semaine après semaine. Pas de plan, juste l'instinct.",
    type: "anecdote",
  },
  {
    module: 10,
    text: "L'idée de Stranger Things est venue de l'amour des créateurs pour les films des années 80 qu'ils regardaient ados.",
    type: "anecdote",
  },
  {
    module: 10,
    text: "Le storyboarder dessine le film avant qu'il soit tourné. C'est la BD du cinéma.",
    type: "métier",
  },
  {
    module: 10,
    text: "Taika Waititi (Thor: Ragnarok) improvise la moitié de ses films. Il laisse les acteurs s'amuser.",
    type: "réalisateur",
  },
  {
    module: 10,
    text: "Jenna Ortega (Mercredi) a elle-même chorégraphié sa danse virale. L'imagination d'une actrice de 20 ans.",
    type: "acteur",
  },
  {
    module: 10,
    text: "Hayao Miyazaki (Le Voyage de Chihiro) dessine encore chaque image à la main. 0 ordinateur.",
    type: "réalisateur",
  },
  {
    module: 10,
    seance: 1,
    text: "« Et si... » sont les deux mots les plus puissants du cinéma. Tout commence là.",
    type: "rule",
  },
  {
    module: 10,
    seance: 1,
    text: "Matrix est né de la question : « Et si le monde réel était une simulation ? »",
    type: "anecdote",
  },
  {
    module: 10,
    seance: 1,
    text: "Attack on Titan : « Et si l'humanité vivait enfermée derrière des murs ? » Une idée simple, un chef-d'œuvre.",
    type: "anecdote",
  },
  {
    module: 10,
    seance: 2,
    text: "Un pitch de 30 secondes doit donner envie d'en savoir plus — pas tout raconter.",
    type: "technique",
  },
  {
    module: 10,
    seance: 2,
    text: "Walt Disney a pitché Blanche-Neige en jouant tous les personnages devant ses employés.",
    type: "anecdote",
  },
  {
    module: 10,
    seance: 2,
    text: "Rappel séance 1 : Tu as imaginé des « Et si... ». Maintenant, transforme tes idées en pitch.",
    type: "rappel",
  },

  // ══════════════════════════════════════════════
  // MODULE 11 — CINÉ-DÉBAT
  // ══════════════════════════════════════════════
  { module: 11, text: "Le cinéma est un art du débat : chaque film propose une vision du monde.", type: "reflection" },
  {
    module: 11,
    text: "Alfred Hitchcock pouvait faire peur avec une simple porte fermée. Le génie, c'est la simplicité.",
    type: "anecdote",
  },
  {
    module: 11,
    text: "Les frères Dardenne filment la réalité brute. Pas d'effets spéciaux, juste la vérité.",
    type: "réalisateur",
  },
  { module: 11, text: "Un bon débat, c'est écouter l'autre AVANT de répondre.", type: "rule" },
  { module: 11, text: "Au cinéma, il n'y a pas de bonne réponse. Il y a des points de vue.", type: "reflection" },
  {
    module: 11,
    text: "Miyazaki refuse de mettre des « méchants » dans ses films. Il préfère montrer la complexité humaine.",
    type: "réalisateur",
  },
  {
    module: 11,
    text: "Le cinéma d'animation japonais a influencé tout Hollywood. Spider-Verse s'inspire directement du manga.",
    type: "fact",
  },
  {
    module: 11,
    text: "Denis Villeneuve (Dune, Blade Runner 2049) prépare chaque plan pendant des mois. Rien n'est laissé au hasard.",
    type: "réalisateur",
  },
  {
    module: 11,
    seance: 1,
    text: "Les plus grands cinéastes ont tous un point commun : ils savent raconter une histoire en une phrase.",
    type: "rule",
  },
  {
    module: 11,
    seance: 2,
    text: "L'émotion au cinéma n'est jamais un accident. C'est un mécanisme précis : musique, cadrage, silence.",
    type: "technique",
  },
  {
    module: 11,
    seance: 3,
    text: "Un bon méchant est convaincu d'avoir raison. C'est ce qui le rend fascinant.",
    type: "technique",
  },
  {
    module: 11,
    seance: 4,
    text: "Un film comme Avatar mobilise plus de 3 000 personnes. C'est une petite ville.",
    type: "fact",
  },
  {
    module: 11,
    text: "Ton avis compte autant que celui des critiques. Le cinéma appartient à tout le monde.",
    type: "motivation",
  },
  {
    module: 11,
    text: "Défendre son point de vue, c'est une compétence de cinéaste. Chaque choix de mise en scène est un argument.",
    type: "motivation",
  },

  // ══════════════════════════════════════════════
  // BONUS — UNIVERSAL (module 0 = any module)
  // ══════════════════════════════════════════════
  // --- Faits & technique ---
  {
    module: 0,
    text: "Le cinéma a été inventé en France par les frères Lumière — la première séance a lieu le 28 décembre 1895.",
    type: "fact",
  },
  { module: 0, text: "Le mot « cinéma » vient du grec « kinema » : le mouvement.", type: "fact" },
  { module: 0, text: "En moyenne, il faut 4 ans pour faire un film d'animation Pixar.", type: "fact" },
  { module: 0, text: "Le premier film en couleur date de 1935 : Becky Sharp.", type: "fact" },
  {
    module: 0,
    text: "Au cinéma, chaque détail compte : le costume, la lumière, la musique — tout raconte.",
    type: "technique",
  },
  {
    module: 0,
    text: "Les films ne sont pas filmés dans l'ordre de l'histoire. Le monteur reconstitue le puzzle.",
    type: "fact",
  },
  { module: 0, text: "Réaliser, c'est faire des choix. Chaque plan est une décision.", type: "reflection" },
  { module: 0, text: "Un épisode de One Piece prend environ 1 mois de production pour 20 minutes.", type: "fact" },
  {
    module: 0,
    text: "Le studio Ghibli interdit les réunions de plus de 15 minutes. Efficacité japonaise.",
    type: "anecdote",
  },
  { module: 0, text: "Le premier anime de l'histoire date de 1917 et dure 2 minutes.", type: "fact" },

  // --- Citations ---
  { module: 0, text: "Un film, c'est un rêve qu'on fait les yeux ouverts.", source: "Jean Cocteau", type: "quote" },
  { module: 0, text: "La créativité, c'est l'intelligence qui s'amuse.", source: "Albert Einstein", type: "quote" },
  { module: 0, text: "Si tu peux le rêver, tu peux le filmer.", source: "Walt Disney", type: "quote" },
  {
    module: 0,
    text: "Le cinéma, c'est l'art de montrer ce qu'on ne peut pas dire.",
    source: "Jean-Luc Godard",
    type: "quote",
  },

  // --- Anecdotes manga/film que les ados connaissent ---
  {
    module: 0,
    text: "Le mangaka de One Piece, Oda, dort 3h par nuit. Il dessine 18h par jour depuis 25 ans.",
    type: "anecdote",
  },
  {
    module: 0,
    text: "La scène de la pluie dans Naruto quand Jiraiya meurt — dessinée sous la pluie réelle par Kishimoto.",
    type: "anecdote",
  },
  {
    module: 0,
    text: "Le film Your Name (Kimi no Na wa) a rapporté 380 millions $ — un record pour un anime.",
    type: "fact",
  },
  {
    module: 0,
    text: "Le Voyage de Chihiro a gagné l'Oscar du meilleur film d'animation en 2003. Premier anime à le faire.",
    type: "fact",
  },
  {
    module: 0,
    text: "Marvel planifie ses films 10 ans à l'avance. Thanos a été teasé en 2012 pour un film sorti en 2018.",
    type: "anecdote",
  },
  {
    module: 0,
    text: "Spider-Man: Into the Spider-Verse a inventé un nouveau style d'animation — mélange BD + 3D + 2D.",
    type: "fact",
  },
  {
    module: 0,
    text: "Squid Game a été refusé pendant 10 ans avant que Netflix ne dise oui. Persévérance.",
    type: "anecdote",
  },
  {
    module: 0,
    text: "Solo Leveling a battu des records d'audience dès son premier épisode en anime. Le webtoon avait déjà des millions de fans.",
    type: "fact",
  },

  // --- Métiers du cinéma ---
  {
    module: 0,
    text: "Le scripte note tout pendant le tournage : costumes, positions, dialogues. Sans lui, chaos garanti.",
    type: "métier",
  },
  {
    module: 0,
    text: "Le bruiteur crée les sons à la main : pas dans la neige, porte qui grince, coup de poing.",
    type: "métier",
  },
  {
    module: 0,
    text: "Le décorateur construit les mondes du film. Le bureau de Dumbledore ? Construit pièce par pièce.",
    type: "métier",
  },
  {
    module: 0,
    text: "L'étalonneur ajuste les couleurs du film. C'est lui qui donne le « look » final — chaud, froid, vintage.",
    type: "métier",
  },
  {
    module: 0,
    text: "Le cascadeur prend les risques à la place de l'acteur. Dans Mission Impossible, Tom Cruise fait ses propres cascades.",
    type: "métier",
  },
  {
    module: 0,
    text: "Le doubleur donne sa voix aux personnages animés. Au Japon, les seiyū (doubleurs) sont des stars.",
    type: "métier",
  },

  // --- Messages de motivation ---
  {
    module: 0,
    text: "Y'a pas de mauvaise idée. Y'a juste des idées qu'on n'a pas encore explorées.",
    type: "motivation",
  },
  { module: 0, text: "Tout le monde peut raconter une histoire. Toi aussi.", type: "motivation" },
  { module: 0, text: "Le plus dur, c'est de commencer. Après, ça vient tout seul.", type: "motivation" },
  {
    module: 0,
    text: "Chaque grand réalisateur a été un jour un débutant. Aujourd'hui, c'est ton tour.",
    type: "motivation",
  },
  {
    module: 1,
    text: "Ton regard est unique. Personne d'autre ne voit le monde exactement comme toi.",
    type: "motivation",
  },
  { module: 1, text: "Les meilleures idées viennent quand on ose écrire sans réfléchir.", type: "motivation" },
  { module: 2, text: "Faire ressentir une émotion à quelqu'un, c'est un super-pouvoir. Tu l'as.", type: "motivation" },
  { module: 2, text: "Aucune émotion n'est « trop » ou « pas assez ». Suis ton instinct.", type: "motivation" },
  { module: 3, text: "Ton héros n'a pas besoin d'être parfait. Il a juste besoin d'être vrai.", type: "motivation" },
  { module: 3, text: "Les meilleurs héros doutent. C'est ce qui les rend humains.", type: "motivation" },
  {
    module: 4,
    text: "Se mettre à la place de quelqu'un d'autre, c'est le premier pas vers une bonne histoire.",
    type: "motivation",
  },
  { module: 9, text: "Derrière chaque film, y'a une équipe. Et aujourd'hui, l'équipe c'est vous.", type: "motivation" },
  { module: 9, text: "Même avec peu de moyens, on peut faire quelque chose de grand.", type: "motivation" },
  { module: 10, text: "Ton imagination n'a aucune limite. Laisse-la exploser.", type: "motivation" },
  {
    module: 10,
    text: "30 secondes pour convaincre. C'est court mais c'est largement suffisant si ton idée est forte.",
    type: "motivation",
  },

  // --- Réalisateurs ---
  {
    module: 0,
    text: "Spike Lee a financé son premier film avec sa carte de crédit. Il avait 29 ans.",
    type: "réalisateur",
  },
  {
    module: 0,
    text: "James Cameron (Avatar, Titanic) est aussi explorateur sous-marin. Il est descendu au fond de l'océan.",
    type: "réalisateur",
  },
  {
    module: 0,
    text: "Céline Sciamma (Portrait de la jeune fille en feu) prouve que le cinéma français peut conquérir le monde.",
    type: "réalisateur",
  },
  {
    module: 0,
    text: "Makoto Shinkai (Your Name, Suzume) faisait ses premiers films tout seul dans sa chambre.",
    type: "réalisateur",
  },
  {
    module: 0,
    text: "Bong Joon-ho (Parasite) est le premier réalisateur coréen à gagner l'Oscar du meilleur film.",
    type: "réalisateur",
  },

  // --- Acteurs ---
  {
    module: 0,
    text: "Will Smith a refusé le rôle de Neo dans Matrix. Keanu Reeves l'a pris. L'histoire du cinéma a changé.",
    type: "acteur",
  },
  {
    module: 0,
    text: "Lupita Nyong'o a grandi au Kenya et a gagné un Oscar à 31 ans pour 12 Years a Slave.",
    type: "acteur",
  },
  {
    module: 0,
    text: "Millie Bobby Brown (Stranger Things) avait 12 ans quand la série l'a rendue mondialement célèbre.",
    type: "acteur",
  },
  {
    module: 0,
    text: "Robert Downey Jr. a failli ne jamais jouer Iron Man — personne ne voulait l'embaucher. Deuxième chance.",
    type: "acteur",
  },
  {
    module: 0,
    text: "Adèle Exarchopoulos a gagné la Palme d'Or à Cannes à 19 ans. La plus jeune de l'histoire.",
    type: "acteur",
  },
  {
    module: 0,
    text: "Keanu Reeves fait toutes ses cascades dans John Wick. Il s'entraîne pendant 6 mois avant chaque film.",
    type: "acteur",
  },

  // ══════════════════════════════════════════════
  // CITATIONS PÉDAGOGIQUES BANLIEUWOOD (Adrian)
  // ══════════════════════════════════════════════

  // --- Universelles ---
  { module: 0, text: "Une histoire commence toujours par une question.", source: "Banlieuwood", type: "quote" },
  { module: 0, text: "Une idée devient intéressante quand on la partage.", source: "Banlieuwood", type: "quote" },
  {
    module: 0,
    text: "Une image ne raconte rien… jusqu'à ce que quelqu'un l'imagine.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 0,
    text: "Les histoires les plus simples sont souvent les plus fortes.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 0,
    text: "Une bonne idée n'est pas forcément parfaite. Elle est simplement vivante.",
    source: "Banlieuwood",
    type: "quote",
  },
  { module: 0, text: "L'imagination commence là où les réponses s'arrêtent.", source: "Banlieuwood", type: "quote" },
  { module: 0, text: "On n'a pas besoin de tout savoir pour commencer à créer.", source: "Banlieuwood", type: "quote" },
  {
    module: 0,
    text: "Une histoire avance toujours quand quelque chose résiste.",
    source: "Banlieuwood",
    type: "quote",
  },
  { module: 0, text: "Les films sont faits d'idées… mais aussi de discussions.", source: "Banlieuwood", type: "quote" },
  {
    module: 0,
    text: "Une idée seule est fragile. Une idée partagée devient une histoire.",
    source: "Banlieuwood",
    type: "quote",
  },
  { module: 0, text: "Dans une équipe, chaque regard peut changer l'histoire.", source: "Banlieuwood", type: "quote" },
  { module: 0, text: "Un film n'est jamais le résultat d'une seule personne.", source: "Banlieuwood", type: "quote" },
  { module: 0, text: "Les erreurs font souvent partie des meilleures idées.", source: "Banlieuwood", type: "quote" },
  {
    module: 0,
    text: "La créativité n'est pas un talent magique. C'est une façon de regarder le monde.",
    source: "Banlieuwood",
    type: "quote",
  },

  // --- Module 1 — Le Regard (observer, imaginer) ---
  { module: 1, text: "Une image ne montre jamais tout.", source: "Banlieuwood", type: "quote" },
  { module: 1, text: "Ce que tu vois dépend aussi de ce que tu imagines.", source: "Banlieuwood", type: "quote" },
  {
    module: 1,
    text: "Deux personnes peuvent regarder la même image et voir deux histoires différentes.",
    source: "Banlieuwood",
    type: "quote",
  },
  { module: 1, text: "Regarder attentivement, c'est déjà commencer à raconter.", source: "Banlieuwood", type: "quote" },
  {
    module: 1,
    text: "Une image devient une histoire quand quelqu'un se pose une question.",
    source: "Banlieuwood",
    type: "quote",
  },
  { module: 1, text: "Chaque détail peut être le début d'un récit.", source: "Banlieuwood", type: "quote" },
  { module: 1, text: "Une histoire peut commencer par un simple regard.", source: "Banlieuwood", type: "quote" },

  // --- Module 2 — La Scène (comprendre) ---
  { module: 2, text: "Une scène existe parce que quelqu'un veut quelque chose.", source: "Banlieuwood", type: "quote" },
  { module: 2, text: "Une histoire commence quand quelque chose bloque.", source: "Banlieuwood", type: "quote" },
  { module: 2, text: "Sans obstacle, il n'y a pas d'histoire.", source: "Banlieuwood", type: "quote" },
  {
    module: 2,
    text: "Les personnages deviennent intéressants quand ils doivent choisir.",
    source: "Banlieuwood",
    type: "quote",
  },
  { module: 2, text: "Une scène avance quand un personnage agit.", source: "Banlieuwood", type: "quote" },
  {
    module: 2,
    text: "Une bonne scène pose toujours une question au spectateur.",
    source: "Banlieuwood",
    type: "quote",
  },

  // --- Module 10 séance 1 — Et si… (imaginer) ---
  { module: 10, seance: 1, text: "Une idée commence souvent par : Et si…", source: "Banlieuwood", type: "quote" },
  { module: 10, seance: 1, text: "L'imagination adore les questions.", source: "Banlieuwood", type: "quote" },
  {
    module: 10,
    seance: 1,
    text: "Les histoires naissent quand on ose imaginer l'impossible.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 10,
    seance: 1,
    text: "Une idée étrange peut devenir une grande histoire.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 10,
    seance: 1,
    text: "Les meilleures idées arrivent souvent quand on ne les cherche pas trop.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 10,
    seance: 1,
    text: "Une idée peut venir d'un détail que personne n'avait remarqué.",
    source: "Banlieuwood",
    type: "quote",
  },

  // --- Module 10 séance 2 — Le Pitch (structurer) ---
  {
    module: 10,
    seance: 2,
    text: "Une histoire devient claire quand on comprend ce que veut le personnage.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 10,
    seance: 2,
    text: "Un personnage devient intéressant quand quelque chose l'empêche de réussir.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 10,
    seance: 2,
    text: "Une histoire avance quand le personnage prend une décision.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 10,
    seance: 2,
    text: "Une bonne histoire est souvent une lutte entre un désir et un obstacle.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 10,
    seance: 2,
    text: "Plus l'obstacle est fort, plus l'histoire devient passionnante.",
    source: "Banlieuwood",
    type: "quote",
  },

  // --- Module 12 — Construction Collective ---
  {
    module: 12,
    text: "Une idée peut changer quand elle rencontre celles des autres.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 12,
    text: "Les histoires collectives sont souvent plus riches que les histoires solitaires.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 12,
    text: "Écouter une idée peut parfois être aussi important que la proposer.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 12,
    text: "Construire une histoire ensemble demande de l'imagination… et de l'écoute.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 12,
    text: "Dans une équipe, chaque idée peut transformer l'histoire.",
    source: "Banlieuwood",
    type: "quote",
  },

  // --- Module 5 — Le Scénario (écriture) ---
  { module: 5, text: "Une première version n'est jamais la dernière.", source: "Banlieuwood", type: "quote" },
  {
    module: 5,
    text: "Les histoires deviennent plus fortes quand on les retravaille.",
    source: "Banlieuwood",
    type: "quote",
  },
  { module: 5, text: "Une bonne scène peut naître d'une simple discussion.", source: "Banlieuwood", type: "quote" },
  {
    module: 5,
    text: "Les dialogues servent à révéler ce que les personnages pensent… ou cachent.",
    source: "Banlieuwood",
    type: "quote",
  },
  { module: 5, text: "Réécrire, c'est donner plus de force à une idée.", source: "Banlieuwood", type: "quote" },

  // --- Module 7 — La Mise en Scène ---
  {
    module: 7,
    text: "La caméra ne montre pas seulement ce qui se passe. Elle montre comment le regarder.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 7,
    text: "Un plan peut changer complètement la manière dont on ressent une scène.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 7,
    text: "Le cinéma raconte aussi avec des images, pas seulement avec des mots.",
    source: "Banlieuwood",
    type: "quote",
  },
  { module: 7, text: "Un regard peut parfois dire plus qu'un dialogue.", source: "Banlieuwood", type: "quote" },
  { module: 7, text: "Le choix du cadre est aussi un choix d'émotion.", source: "Banlieuwood", type: "quote" },

  // --- Module 8 — L'Équipe (tournage) ---
  { module: 8, text: "Un film est toujours une aventure collective.", source: "Banlieuwood", type: "quote" },
  { module: 8, text: "Chaque rôle compte dans la fabrication d'un film.", source: "Banlieuwood", type: "quote" },
  { module: 8, text: "Derrière chaque image, il y a une équipe.", source: "Banlieuwood", type: "quote" },
  {
    module: 8,
    text: "Un tournage est un moment où les idées deviennent réelles.",
    source: "Banlieuwood",
    type: "quote",
  },
  {
    module: 8,
    text: "Faire un film, c'est transformer l'imagination en action.",
    source: "Banlieuwood",
    type: "quote",
  },
];

/**
 * Get tips filtered by module (and optionally seance).
 * Falls back to module 0 (universal) tips to always have content.
 */
export function getTipsForModule(module: number, seance?: number): CinemaTip[] {
  const specific = CINEMA_TIPS.filter(
    (t) => t.module === module && (seance == null || t.seance == null || t.seance === seance),
  );
  const universal = CINEMA_TIPS.filter((t) => t.module === 0);
  return specific.length > 0 ? [...specific, ...universal] : universal;
}

/** Type emoji mapping */
export const TIP_TYPE_ICONS: Record<CinemaTip["type"], string> = {
  technique: "💡",
  quote: "📝",
  fact: "🎬",
  rule: "📏",
  reflection: "🤔",
  anecdote: "🎭",
  métier: "🎬",
  réalisateur: "🎥",
  acteur: "⭐",
  rappel: "🔄",
  motivation: "💪",
};
