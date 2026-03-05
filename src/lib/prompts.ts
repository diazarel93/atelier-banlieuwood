/**
 * AI prompt templates for bilan de session and fiche de cours.
 * Also contains algorithmic fallbacks when no AI is available.
 */

import type { SessionFullData } from "@/lib/session-data";
import { CATEGORY_LABELS } from "@/lib/constants";

// ——— TYPES ———

export interface BilanResult {
  narrativeSummary: string;
  groupDynamics: {
    summary: string;
    influencers: string[];
    collaborationLevel: "faible" | "moyen" | "bon" | "excellent";
  };
  keyMoments: { category: string; description: string }[];
  engagement: {
    summary: string;
    participationTrend: "croissant" | "stable" | "décroissant";
    depth: "superficiel" | "correct" | "approfondi";
  };
  pedagogicalRecommendations: string[];
}

export interface FicheCoursResult {
  title: string;
  duration: string;
  objectives: { objective: string; socleCommun: string }[];
  competencies: {
    domaine1: { title: string; skills: string[] };
    domaine3: { title: string; skills: string[] };
    domaine5: { title: string; skills: string[] };
  };
  animationTips: { phase: string; tip: string; timing: string }[];
  relaunchTips: string[];
  adaptationByLevel: { primaire: string; college: string; lycee: string };
  evaluation: string[];
  sessionRecap: string | null;
}

// ——— SYSTEM PROMPTS ———

export const BILAN_SYSTEM_PROMPT = `Tu es un expert en pédagogie du cinéma et de l'écriture collaborative.
Analyse les données de cette session Banlieuwood et produis un bilan pédagogique.
Réponds UNIQUEMENT en JSON valide avec cette structure :
{
  "narrativeSummary": "Résumé de l'histoire collective (3-5 phrases)",
  "groupDynamics": {
    "summary": "Dynamique de groupe (2-3 phrases)",
    "influencers": ["Prénoms influents + pourquoi"],
    "collaborationLevel": "faible|moyen|bon|excellent"
  },
  "keyMoments": [{ "category": "tournant|créatif|collectif|tension", "description": "..." }],
  "engagement": {
    "summary": "Analyse de l'engagement (2-3 phrases)",
    "participationTrend": "croissant|stable|décroissant",
    "depth": "superficiel|correct|approfondi"
  },
  "pedagogicalRecommendations": ["Recommandation concrète pour la prochaine session"]
}
Ne mets AUCUN texte avant ou après le JSON.`;

export const FICHE_COURS_SYSTEM_PROMPT = `Tu es un conseiller pédagogique spécialisé en éducation artistique et culturelle (France).
Crée une fiche de cours pour l'atelier Banlieuwood, un outil d'écriture collaborative de scénario.
Réponds UNIQUEMENT en JSON valide avec cette structure :
{
  "title": "Titre de la séquence pédagogique",
  "duration": "ex: 3 séances de 45min",
  "objectives": [{ "objective": "Objectif pédagogique", "socleCommun": "D1|D3|D5" }],
  "competencies": {
    "domaine1": { "title": "Les langages pour penser et communiquer", "skills": ["Compétence précise"] },
    "domaine3": { "title": "La formation de la personne et du citoyen", "skills": ["Compétence précise"] },
    "domaine5": { "title": "Les représentations du monde et l'activité humaine", "skills": ["Compétence précise"] }
  },
  "animationTips": [{ "phase": "Nom de la phase", "tip": "Conseil concret", "timing": "ex: 10 min" }],
  "relaunchTips": ["Comment relancer un groupe silencieux ou en difficulté"],
  "adaptationByLevel": { "primaire": "Adaptations cycle 3", "college": "Adaptations cycle 4", "lycee": "Adaptations lycée" },
  "evaluation": ["Critère d'évaluation observable"],
  "sessionRecap": "Résumé de la session si des données sont fournies, sinon null"
}
Ne mets AUCUN texte avant ou après le JSON.`;

// ——— USER PROMPT BUILDERS ———

export function buildBilanUserPrompt(data: SessionFullData): string {
  const { session, students, responses, votes, collectiveChoices, stats } = data;
  const visibleResponses = responses.filter((r) => !r.is_hidden);

  // Student participation map
  const studentResponseCounts = new Map<string, number>();
  const studentChosenCounts = new Map<string, number>();
  for (const r of visibleResponses) {
    studentResponseCounts.set(r.student_id, (studentResponseCounts.get(r.student_id) || 0) + 1);
  }
  for (const c of collectiveChoices) {
    if (c.source_response_id) {
      const resp = responses.find((r) => r.id === c.source_response_id);
      if (resp) {
        studentChosenCounts.set(resp.student_id, (studentChosenCounts.get(resp.student_id) || 0) + 1);
      }
    }
  }

  // Build student profiles
  const studentProfiles = students.map((s) => {
    const count = studentResponseCounts.get(s.id) || 0;
    const chosen = studentChosenCounts.get(s.id) || 0;
    return `- ${s.display_name}: ${count} réponses, ${chosen} choisie(s)`;
  }).join("\n");

  // Build collective story
  const story = collectiveChoices
    .map((c) => `- [${CATEGORY_LABELS[c.category] || c.category}] ${c.restitution_label}: ${c.chosen_text}`)
    .join("\n");

  // Sample notable responses (longest ones)
  const notable = [...visibleResponses]
    .sort((a, b) => b.text.length - a.text.length)
    .slice(0, 5)
    .map((r) => {
      const student = students.find((s) => s.id === r.student_id);
      return `- ${student?.display_name || "?"}: "${r.text}"`;
    })
    .join("\n");

  return `Session: "${session.title}"
Niveau: ${session.level}
Genre: ${session.template || "libre"}
Élèves: ${stats.totalStudents} (participation: ${stats.participationRate}%)
Réponses visibles: ${stats.visibleResponses} (longueur moyenne: ${stats.avgResponseLength} car.)
Votes: ${stats.totalVotes}
Choix collectifs: ${stats.totalChoices}

PARTICIPATION PAR ÉLÈVE:
${studentProfiles}

HISTOIRE COLLECTIVE:
${story || "Pas encore d'histoire collective"}

RÉPONSES REMARQUABLES (les plus développées):
${notable || "Aucune"}

Produis le bilan pédagogique en JSON.`;
}

export function buildFicheCoursUserPrompt(opts: {
  level: string;
  template?: string | null;
  sessionRecap?: string | null;
}): string {
  const levelLabels: Record<string, string> = {
    primaire: "Cycle 3 (CM1-CM2, 9-11 ans)",
    college: "Cycle 4 (5e-3e, 12-15 ans)",
    lycee: "Lycée (2nde-Terminale, 15-18 ans)",
  };

  let prompt = `Niveau cible: ${levelLabels[opts.level] || opts.level}
Outil: Banlieuwood — atelier d'écriture collaborative de scénario de film
Format: Les élèves répondent à des questions narratives (personnage, liens, environnement, conflit, trajectoire), votent, et construisent une histoire collective.
Modules: Module 1 (Confiance — description d'images), Module 2 (Budget — choix de production), Module 3 (Histoire — écriture narrative collaborative)`;

  if (opts.template) {
    prompt += `\nGenre choisi: ${opts.template}`;
  }

  if (opts.sessionRecap) {
    prompt += `\n\nRÉSUMÉ DE SESSION:\n${opts.sessionRecap}`;
  }

  prompt += `\n\nCrée une fiche de cours complète rattachée au socle commun de l'Éducation Nationale en JSON.`;
  return prompt;
}

// ——— ALGORITHMIC FALLBACKS ———

export function buildFallbackBilan(data: SessionFullData): BilanResult {
  const { students, responses, collectiveChoices, stats } = data;
  const visibleResponses = responses.filter((r) => !r.is_hidden);

  // Narrative summary from collective choices
  const storyParts = collectiveChoices.map(
    (c) => `${c.restitution_label}: ${c.chosen_text}`
  );
  const narrativeSummary = storyParts.length > 0
    ? `L'histoire collective comprend ${storyParts.length} éléments narratifs. ${storyParts.slice(0, 3).join(". ")}.`
    : "La session n'a pas encore produit d'histoire collective.";

  // Find most active students
  const studentCounts = new Map<string, number>();
  for (const r of visibleResponses) {
    studentCounts.set(r.student_id, (studentCounts.get(r.student_id) || 0) + 1);
  }
  const sorted = [...studentCounts.entries()].sort((a, b) => b[1] - a[1]);
  const influencers = sorted.slice(0, 3).map(([id, count]) => {
    const s = students.find((st) => st.id === id);
    return `${s?.display_name || "?"} (${count} réponses)`;
  });

  // Collaboration level
  let collaborationLevel: BilanResult["groupDynamics"]["collaborationLevel"];
  if (stats.participationRate >= 80) collaborationLevel = "excellent";
  else if (stats.participationRate >= 60) collaborationLevel = "bon";
  else if (stats.participationRate >= 40) collaborationLevel = "moyen";
  else collaborationLevel = "faible";

  // Engagement depth
  let depth: BilanResult["engagement"]["depth"];
  if (stats.avgResponseLength >= 80) depth = "approfondi";
  else if (stats.avgResponseLength >= 30) depth = "correct";
  else depth = "superficiel";

  // Key moments from choices
  const keyMoments = collectiveChoices.slice(0, 4).map((c) => ({
    category: "collectif" as const,
    description: `Le groupe a choisi "${c.chosen_text}" pour ${c.restitution_label}`,
  }));

  // Recommendations
  const recommendations: string[] = [];
  if (stats.participationRate < 60)
    recommendations.push("Encourager les élèves les plus discrets à proposer leurs idées, par exemple en faisant un tour de table.");
  if (stats.avgResponseLength < 30)
    recommendations.push("Inciter les élèves à développer davantage leurs réponses en posant des questions de relance.");
  if (collectiveChoices.length < 5)
    recommendations.push("Poursuivre l'exploration narrative pour enrichir l'histoire collective.");
  if (recommendations.length === 0)
    recommendations.push("Excellent travail ! Continuer sur cette dynamique pour la prochaine séance.");

  return {
    narrativeSummary,
    groupDynamics: {
      summary: `Le groupe compte ${stats.totalStudents} élèves avec un taux de participation de ${stats.participationRate}%.`,
      influencers,
      collaborationLevel,
    },
    keyMoments,
    engagement: {
      summary: `${stats.visibleResponses} réponses avec une longueur moyenne de ${stats.avgResponseLength} caractères.`,
      participationTrend: "stable",
      depth,
    },
    pedagogicalRecommendations: recommendations,
  };
}

// Generic fiche templates by level
const GENERIC_FICHE_TEMPLATES: Record<string, FicheCoursResult> = {
  primaire: {
    title: "Écriture collaborative de scénario - Cycle 3",
    duration: "3 séances de 45 minutes",
    objectives: [
      { objective: "S'exprimer à l'oral et à l'écrit de manière claire et organisée", socleCommun: "D1" },
      { objective: "Coopérer et réaliser des projets collectifs", socleCommun: "D3" },
      { objective: "Développer son imagination et sa créativité par l'écriture narrative", socleCommun: "D5" },
    ],
    competencies: {
      domaine1: {
        title: "Les langages pour penser et communiquer",
        skills: [
          "Produire des écrits variés en s'appropriant les différentes dimensions de l'activité d'écriture",
          "Écouter pour comprendre un message oral et réagir de façon pertinente",
          "Participer à des échanges dans des situations diversifiées",
        ],
      },
      domaine3: {
        title: "La formation de la personne et du citoyen",
        skills: [
          "Exprimer ses sentiments et ses émotions en utilisant un vocabulaire précis",
          "Coopérer et mutualiser : travailler en équipe, partager des tâches",
          "Exercer son esprit critique : distinguer son intérêt personnel de l'intérêt collectif",
        ],
      },
      domaine5: {
        title: "Les représentations du monde et l'activité humaine",
        skills: [
          "Se repérer dans un récit : identifier les personnages, les lieux, les événements",
          "Imaginer et créer un univers fictionnel cohérent",
          "Mobiliser des références culturelles pour enrichir son récit",
        ],
      },
    },
    animationTips: [
      { phase: "Lancement", tip: "Présenter Banlieuwood comme un jeu : chaque élève est scénariste. Montrer le QR code pour rejoindre.", timing: "5 min" },
      { phase: "Module 1 — Confiance", tip: "Commencer par les images pour libérer la parole sans enjeu d'écriture longue.", timing: "15 min" },
      { phase: "Module 3 — Histoire", tip: "Lire à voix haute les meilleures réponses avant le vote pour créer de l'émulation.", timing: "20 min" },
      { phase: "Restitution", tip: "Relire l'histoire collective à la fin. Demander aux élèves ce qu'ils changeraient.", timing: "5 min" },
    ],
    relaunchTips: [
      "Si le groupe est silencieux : proposer un choix binaire (\"Votre héros est plutôt courageux ou malin ?\")",
      "Si les réponses sont courtes : demander \"Et si tu devais filmer cette scène, qu'est-ce qu'on verrait à l'écran ?\"",
      "Si un élève domine : valoriser les réponses des autres et encourager le vote démocratique",
    ],
    adaptationByLevel: {
      primaire: "Privilégier les questions visuelles et concrètes. Lire les questions à voix haute. Accepter les réponses courtes en début de séance.",
      college: "Encourager les descriptions détaillées et les motivations des personnages. Introduire la notion de conflit dramatique.",
      lycee: "Travailler sur les thèmes, le sous-texte et les références cinématographiques. Demander de justifier les choix narratifs.",
    },
    evaluation: [
      "L'élève propose au moins une réponse par séance",
      "L'élève développe ses idées au-delà d'une phrase simple",
      "L'élève participe au vote et respecte les choix du groupe",
      "L'élève fait des liens entre les éléments narratifs (personnage ↔ conflit ↔ lieu)",
    ],
    sessionRecap: null,
  },
  college: {
    title: "Écriture collaborative de scénario - Cycle 4",
    duration: "3 séances de 55 minutes",
    objectives: [
      { objective: "Exploiter les ressources expressives et créatives de la parole et de l'écriture", socleCommun: "D1" },
      { objective: "Développer le jugement critique et l'argumentation dans un projet collectif", socleCommun: "D3" },
      { objective: "Comprendre et interpréter des récits en mobilisant sa culture personnelle", socleCommun: "D5" },
    ],
    competencies: {
      domaine1: {
        title: "Les langages pour penser et communiquer",
        skills: [
          "Adopter des stratégies et des procédures d'écriture efficaces",
          "Exploiter les principales fonctions de l'écrit (raconter, décrire, argumenter)",
          "Participer à un débat de manière constructive et argumentée",
        ],
      },
      domaine3: {
        title: "La formation de la personne et du citoyen",
        skills: [
          "Exprimer ses sentiments, ses opinions et exercer son esprit critique",
          "Comprendre le bien-fondé des normes et des règles du travail collaboratif",
          "S'engager dans un projet et le mener à terme avec les autres",
        ],
      },
      domaine5: {
        title: "Les représentations du monde et l'activité humaine",
        skills: [
          "Situer et interpréter des oeuvres cinématographiques dans leur contexte",
          "Créer des personnages complexes avec des motivations et des contradictions",
          "Comprendre les mécanismes narratifs du cinéma (arc dramatique, mise en scène)",
        ],
      },
    },
    animationTips: [
      { phase: "Accroche", tip: "Montrer un extrait de film du genre choisi (2 min). Demander : qu'est-ce qui vous a accroché ?", timing: "7 min" },
      { phase: "Module 1 — Diagnostic", tip: "Utiliser les images comme diagnostic de créativité. Noter les élèves les plus descriptifs.", timing: "15 min" },
      { phase: "Module 3 — Narration", tip: "Insister sur la cohérence : chaque choix doit s'accorder avec les précédents. Faire le lien explicitement.", timing: "25 min" },
      { phase: "Bilan collectif", tip: "Projeter l'histoire finale. Demander à chaque élève de choisir son moment préféré et d'expliquer pourquoi.", timing: "8 min" },
    ],
    relaunchTips: [
      "Si les réponses sont superficielles : \"Imagine que tu es le réalisateur. Comment tu filmes cette scène ?\"",
      "Si le groupe n'arrive pas à se décider : limiter le temps de vote et rappeler qu'il n'y a pas de mauvais choix",
      "Si un conflit émerge entre élèves : le transformer en conflit narratif (\"Et si vos deux idées coexistaient dans l'histoire ?\")",
    ],
    adaptationByLevel: {
      primaire: "Simplifier le vocabulaire cinématographique. Proposer des choix guidés plutôt que des questions ouvertes.",
      college: "Travailler la psychologie des personnages et les retournements de situation. Introduire le vocabulaire du scénario.",
      lycee: "Approfondir l'analyse thématique et les références culturelles. Encourager l'originalité et la prise de risque narrative.",
    },
    evaluation: [
      "L'élève produit des réponses développées et cohérentes avec l'univers narratif",
      "L'élève justifie ses choix lors du vote avec des arguments narratifs",
      "L'élève contribue à la cohérence de l'histoire collective",
      "L'élève intègre les contraintes du genre choisi dans ses propositions",
    ],
    sessionRecap: null,
  },
  lycee: {
    title: "Écriture collaborative de scénario - Lycée",
    duration: "3 séances de 55 minutes",
    objectives: [
      { objective: "Maîtriser l'expression écrite et orale pour structurer un récit complexe", socleCommun: "D1" },
      { objective: "Développer l'autonomie et la responsabilité dans un projet collaboratif", socleCommun: "D3" },
      { objective: "Mobiliser des références artistiques et culturelles pour nourrir la création", socleCommun: "D5" },
    ],
    competencies: {
      domaine1: {
        title: "Les langages pour penser et communiquer",
        skills: [
          "Construire un récit structuré avec une progression dramatique maîtrisée",
          "Utiliser les codes du scénario (dialogues, didascalies, découpage)",
          "Argumenter ses choix narratifs à l'oral devant le groupe",
        ],
      },
      domaine3: {
        title: "La formation de la personne et du citoyen",
        skills: [
          "Porter un regard critique et distancié sur les productions du groupe",
          "Respecter la diversité des points de vue et intégrer les propositions d'autrui",
          "S'investir dans un processus créatif collectif avec rigueur et ouverture",
        ],
      },
      domaine5: {
        title: "Les représentations du monde et l'activité humaine",
        skills: [
          "Analyser les mécanismes narratifs et dramaturgiques d'un scénario",
          "Mobiliser des références cinématographiques, littéraires et artistiques",
          "Interroger les représentations du monde véhiculées par la fiction",
        ],
      },
    },
    animationTips: [
      { phase: "Introduction", tip: "Présenter un pitch de film raté vs réussi. Analyser pourquoi. Introduire les contraintes de genre.", timing: "10 min" },
      { phase: "Module 1 — Confiance", tip: "Phase rapide, pas de jugement. Valoriser la prise de risque dans les interprétations.", timing: "10 min" },
      { phase: "Module 3 — Écriture", tip: "Exiger de la cohérence et de la profondeur. Relancer avec des questions de dramaturgie (enjeux, obstacles, climax).", timing: "30 min" },
      { phase: "Analyse finale", tip: "Faire un retour critique collectif : qu'est-ce qui fonctionne ? Quelles faiblesses ? Comment améliorer ?", timing: "10 min" },
    ],
    relaunchTips: [
      "Si le groupe manque d'inspiration : proposer une contrainte créative (\"Et si votre héros ne pouvait pas parler ?\")",
      "Si les réponses sont convenues : demander l'opposé de ce qui est attendu dans le genre",
      "Si la dynamique s'essouffle : changer de modalité (travail en binôme, puis mise en commun)",
    ],
    adaptationByLevel: {
      primaire: "Réduire la complexité narrative. Proposer des amorces de phrases. Se concentrer sur le plaisir de raconter.",
      college: "Accompagner la construction des personnages. Travailler le vocabulaire des émotions et des motivations.",
      lycee: "Laisser une grande autonomie. Encourager les récits non-linéaires, les points de vue multiples, les thèmes ambitieux.",
    },
    evaluation: [
      "L'élève produit des propositions narratives originales et cohérentes",
      "L'élève analyse et argumente ses choix avec des références culturelles",
      "L'élève contribue positivement à la dynamique de groupe et au projet collectif",
      "L'élève identifie les forces et faiblesses du récit final",
    ],
    sessionRecap: null,
  },
};

export function buildFallbackFicheCours(level: string, sessionRecap?: string | null): FicheCoursResult {
  const template = GENERIC_FICHE_TEMPLATES[level] || GENERIC_FICHE_TEMPLATES.college;
  return { ...template, sessionRecap: sessionRecap || null };
}

// ——— BIBLE DU FILM ———

export interface BibleResult {
  logline: string;
  synopsis: string;
  characters: {
    name: string;
    role: string;
    description: string;
    arc: string;
  }[];
  world: {
    setting: string;
    atmosphere: string;
    rules: string;
  };
  conflict: {
    central: string;
    stakes: string;
    antagonist: string;
  };
  structure: {
    act1: string;
    act2: string;
    act3: string;
  };
  style: {
    genre: string;
    tone: string;
    influences: string[];
    visualIdentity: string;
  };
  themes: string[];
}

export const BIBLE_SYSTEM_PROMPT = `Tu es un scénariste expert et un story developer de cinéma.
À partir des choix collectifs d'un groupe d'élèves, crée une "Bible du Film" professionnelle.
Réponds UNIQUEMENT en JSON valide avec cette structure :
{
  "logline": "Une phrase qui résume le film (pitch d'une ligne)",
  "synopsis": "Résumé de l'histoire en 5-8 phrases, avec début, milieu et fin",
  "characters": [
    { "name": "Nom", "role": "héros|antagoniste|allié|mentor", "description": "2-3 phrases", "arc": "Comment il/elle évolue" }
  ],
  "world": {
    "setting": "Lieu et époque (2 phrases)",
    "atmosphere": "Ambiance générale du film (1-2 phrases)",
    "rules": "Règles particulières du monde (1-2 phrases)"
  },
  "conflict": {
    "central": "Le conflit principal (2 phrases)",
    "stakes": "Ce qui est en jeu (1-2 phrases)",
    "antagonist": "La force antagoniste (1-2 phrases)"
  },
  "structure": {
    "act1": "Exposition et déclencheur (2-3 phrases)",
    "act2": "Complications et climax (3-4 phrases)",
    "act3": "Résolution (2-3 phrases)"
  },
  "style": {
    "genre": "Genre principal + sous-genre",
    "tone": "Ton narratif (dramatique, comique, etc.)",
    "influences": ["2-3 films qui pourraient inspirer"],
    "visualIdentity": "Identité visuelle et atmosphérique (2 phrases)"
  },
  "themes": ["3-5 thèmes majeurs du film"]
}
Sois créatif mais fidèle aux choix des élèves. Rends la Bible vivante et inspirante.
Ne mets AUCUN texte avant ou après le JSON.`;

export function buildBibleUserPrompt(data: SessionFullData): string {
  const { session, students, collectiveChoices } = data;

  const story = collectiveChoices
    .map((c) => `- [${CATEGORY_LABELS[c.category] || c.category}] ${c.restitution_label}: ${c.chosen_text}`)
    .join("\n");

  const studentList = students.map((s) => `${s.avatar} ${s.display_name}`).join(", ");

  return `Session: "${session.title}"
Niveau: ${session.level}
Genre: ${session.template || "libre"}
Élèves: ${studentList}

CHOIX COLLECTIFS DE L'HISTOIRE:
${story || "Aucun choix collectif"}

Génère la Bible du Film en JSON à partir de ces éléments narratifs.`;
}

export function buildFallbackBible(data: SessionFullData): BibleResult {
  const choices = data.collectiveChoices;
  const personnage = choices.filter((c) => c.category === "personnage");
  const environnement = choices.filter((c) => c.category === "environnement");
  const conflit = choices.filter((c) => c.category === "conflit");
  const trajectoire = choices.filter((c) => c.category === "trajectoire");

  return {
    logline: personnage.length > 0 && conflit.length > 0
      ? `${personnage[0]?.chosen_text || "Un protagoniste"} doit faire face à ${conflit[0]?.chosen_text || "un défi"}.`
      : "Un groupe d'élèves a imaginé ensemble une histoire unique.",
    synopsis: choices.map((c) => c.chosen_text).join(". ") || "L'histoire reste à écrire...",
    characters: personnage.map((c) => ({
      name: c.restitution_label || "Personnage",
      role: "héros",
      description: c.chosen_text,
      arc: "Évolution à définir",
    })),
    world: {
      setting: environnement.map((c) => c.chosen_text).join(". ") || "Un monde à imaginer",
      atmosphere: "Atmosphère à définir",
      rules: "Pas de règles particulières",
    },
    conflict: {
      central: conflit.map((c) => c.chosen_text).join(". ") || "Conflit à développer",
      stakes: "Les enjeux restent à définir",
      antagonist: "L'antagoniste reste à définir",
    },
    structure: {
      act1: trajectoire[0]?.chosen_text || "Le début de l'aventure",
      act2: trajectoire[1]?.chosen_text || "Les complications s'accumulent",
      act3: trajectoire[2]?.chosen_text || "Le dénouement",
    },
    style: {
      genre: data.session.template || "Drame",
      tone: "À définir",
      influences: [],
      visualIdentity: "À définir",
    },
    themes: choices.length > 0
      ? [...new Set(choices.map((c) => CATEGORY_LABELS[c.category] || c.category))].slice(0, 5)
      : ["Créativité", "Collaboration"],
  };
}
