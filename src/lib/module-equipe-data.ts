// ============================================================
// MODULE 8 — L'Équipe
// Quiz métiers, points invisibles, choix de rôle par mérite,
// cartes talents style Pokémon.
// ============================================================

export interface FicheMetier {
  key: string;
  label: string;
  description: string;
  skills: string[];
  emoji: string;
  color: string;
}

// 6 métiers principaux (conformes à Adrian)
export const FICHES_METIER: FicheMetier[] = [
  {
    key: "realisateur",
    label: "Réalisateur·rice",
    description: "Dirige les acteurs et décide de la mise en scène. C'est le chef d'orchestre du tournage.",
    skills: ["Leadership", "Vision artistique", "Communication"],
    emoji: "🎬",
    color: "#EF4444",
  },
  {
    key: "cadreur",
    label: "Cadreur·se",
    description: "Tient la caméra et choisit les plans. C'est l'œil du film.",
    skills: ["Stabilité", "Sens du cadre", "Patience"],
    emoji: "📷",
    color: "#3B82F6",
  },
  {
    key: "son",
    label: "Ingénieur·e son",
    description: "Gère le son : voix, bruitages, ambiance. Sans lui, pas de dialogue !",
    skills: ["Oreille musicale", "Discrétion", "Technique"],
    emoji: "🎧",
    color: "#10B981",
  },
  {
    key: "assistant-real",
    label: "Assistant·e réalisateur",
    description: "Organise le tournage : planning, accessoires, répétitions. Le bras droit du réal.",
    skills: ["Organisation", "Gestion du temps", "Anticipation"],
    emoji: "📋",
    color: "#F59E0B",
  },
  {
    key: "script",
    label: "Scripte",
    description: "Vérifie la continuité : costumes, positions, dialogues. Rien ne doit changer entre deux prises.",
    skills: ["Observation", "Mémoire", "Précision"],
    emoji: "📝",
    color: "#8B5CF6",
  },
  {
    key: "acteur",
    label: "Acteur·rice",
    description: "Interprète un personnage devant la caméra. Donne vie à l'histoire.",
    skills: ["Expression", "Mémorisation", "Émotion"],
    emoji: "🎭",
    color: "#EC4899",
  },
];

// Quiz des métiers — Adrian: les élèves cliquent sur les postes qu'ils pensent connaître
// Puis le débrief révèle la réalité de chaque rôle et corrige les idées reçues
export interface QuizMetier {
  metierKey: string;
  metierLabel: string;
  metierEmoji: string;
  commonBelief: string; // Ce que la plupart des élèves pensent
  reality: string; // Ce que le rôle fait vraiment
}

export const QUIZ_METIERS: QuizMetier[] = [
  {
    metierKey: "realisateur",
    metierLabel: "Réalisateur·rice",
    metierEmoji: "🎬",
    commonBelief: "C'est celui qui tient la caméra",
    reality:
      "Le réalisateur dirige les acteurs et choisit les plans. Il ne touche pas la caméra — c'est le cadreur qui filme.",
  },
  {
    metierKey: "cadreur",
    metierLabel: "Cadreur·se",
    metierEmoji: "📷",
    commonBelief: "Il filme ce qu'il veut",
    reality:
      "Le cadreur suit les indications du réalisateur. Il choisit les angles et la composition, mais c'est un travail d'équipe.",
  },
  {
    metierKey: "son",
    metierLabel: "Ingénieur·e son",
    metierEmoji: "🎧",
    commonBelief: "Il appuie sur 'enregistrer'",
    reality:
      "L'ingénieur son gère le son en direct : micro, niveaux, bruits parasites. Sans lui, pas de dialogue utilisable.",
  },
  {
    metierKey: "assistant-real",
    metierLabel: "Assistant·e réalisateur",
    metierEmoji: "📋",
    commonBelief: "C'est un stagiaire",
    reality: "C'est un rôle clé : il organise tout le planning, coordonne l'équipe et s'assure que le tournage avance.",
  },
  {
    metierKey: "script",
    metierLabel: "Scripte",
    metierEmoji: "📝",
    commonBelief: "Il écrit le scénario sur le plateau",
    reality:
      "Le scripte vérifie la continuité entre les prises : costumes, positions, dialogues. Rien ne doit changer.",
  },
  {
    metierKey: "acteur",
    metierLabel: "Acteur·rice",
    metierEmoji: "🎭",
    commonBelief: "Il apprend son texte par cœur",
    reality:
      "Un acteur donne vie au personnage. Il mémorise le texte mais surtout il ressent et interprète les émotions.",
  },
];

// 3 catégories de talents
export const TALENT_CATEGORIES = [
  {
    key: "jeu",
    label: "Jeu / Interprétation",
    color: "#EC4899",
    strengths: ["Expressivité", "Empathie", "Créativité émotionnelle", "Charisme"],
  },
  {
    key: "image",
    label: "Mise en scène / Image",
    color: "#3B82F6",
    strengths: ["Sens visuel", "Composition", "Narration visuelle", "Imagination"],
  },
  {
    key: "technique",
    label: "Technique / Organisation",
    color: "#10B981",
    strengths: ["Rigueur", "Anticipation", "Coordination", "Précision"],
  },
] as const;

// Role → talent category mapping
const ROLE_TO_CATEGORY: Record<string, string> = {
  realisateur: "image",
  cadreur: "image",
  son: "technique",
  "assistant-real": "technique",
  script: "technique",
  acteur: "jeu",
};

/**
 * Calcule les points pour chaque élève à partir de leur participation globale.
 * Retourne un tableau de { studentId, participation, creativity, engagement, total }
 */
export async function computePoints(
  sessionId: string,
  admin: { from: (table: string) => { select: (cols: string) => { eq: (col: string, val: string) => unknown } } },
): Promise<
  {
    studentId: string;
    participationScore: number;
    creativityScore: number;
    engagementScore: number;
  }[]
> {
  // Get all active students
  const { data: students } = await (
    admin.from("students").select("id").eq("session_id", sessionId) as unknown as {
      eq: (col: string, val: boolean) => Promise<{ data: { id: string }[] | null }>;
    }
  ).eq("is_active", true);

  if (!students || students.length === 0) return [];

  // Count responses per student (participation)
  const { data: responses } = await (admin
    .from("responses")
    .select("student_id")
    .eq("session_id", sessionId) as unknown as Promise<{ data: { student_id: string }[] | null }>);

  const responseCounts: Record<string, number> = {};
  for (const r of responses || []) {
    responseCounts[r.student_id] = (responseCounts[r.student_id] || 0) + 1;
  }

  // Count creative contributions (module10 etsi texts + personnages + pitchs + idea bank)
  const { data: etsi } = await (admin
    .from("module10_etsi")
    .select("student_id")
    .eq("session_id", sessionId) as unknown as Promise<{ data: { student_id: string }[] | null }>);

  const { data: personnages } = await (admin
    .from("module10_personnages")
    .select("student_id")
    .eq("session_id", sessionId) as unknown as Promise<{ data: { student_id: string }[] | null }>);

  const { data: pitchs } = await (admin
    .from("module10_pitchs")
    .select("student_id")
    .eq("session_id", sessionId) as unknown as Promise<{ data: { student_id: string }[] | null }>);

  // Adrian: "le carnet d'idées a un poids important"
  const { data: ideaBank } = await (admin
    .from("module10_idea_bank")
    .select("student_id")
    .eq("session_id", sessionId) as unknown as Promise<{ data: { student_id: string }[] | null }>);

  const creativityCounts: Record<string, number> = {};
  for (const item of [...(etsi || []), ...(personnages || []), ...(pitchs || [])]) {
    creativityCounts[item.student_id] = (creativityCounts[item.student_id] || 0) + 1;
  }
  // Idea bank contributions count double (Adrian: "poids important")
  for (const item of ideaBank || []) {
    creativityCounts[item.student_id] = (creativityCounts[item.student_id] || 0) + 2;
  }

  // Count M6 missions done (engagement)
  const { data: missions } = await (admin
    .from("module6_missions")
    .select("student_id, status")
    .eq("session_id", sessionId) as unknown as Promise<{ data: { student_id: string; status: string }[] | null }>);

  const engagementCounts: Record<string, number> = {};
  for (const m of missions || []) {
    if (m.status === "done") {
      engagementCounts[m.student_id] = (engagementCounts[m.student_id] || 0) + 1;
    }
  }

  // Adrian: "observations de l'intervenant" — facilitator tags feed into engagement
  const { data: tags } = await (admin
    .from("facilitator_tags")
    .select("student_id, tag")
    .eq("session_id", sessionId) as unknown as Promise<{ data: { student_id: string; tag: string }[] | null }>);

  const POSITIVE_TAGS = new Set([
    "tres_creatif",
    "force_de_proposition",
    "bonne_ecoute",
    "tres_investi",
    "bonne_cooperation",
    "leadership",
  ]);
  for (const t of tags || []) {
    if (POSITIVE_TAGS.has(t.tag)) {
      engagementCounts[t.student_id] = (engagementCounts[t.student_id] || 0) + 2;
    }
  }

  // Normalize scores (max 10 per category)
  const maxResponses = Math.max(1, ...Object.values(responseCounts));
  const maxCreativity = Math.max(1, ...Object.values(creativityCounts));
  const maxEngagement = Math.max(1, ...Object.values(engagementCounts));

  return students.map((s: { id: string }) => ({
    studentId: s.id,
    participationScore: Math.round(((responseCounts[s.id] || 0) / maxResponses) * 10),
    creativityScore: Math.round(((creativityCounts[s.id] || 0) / maxCreativity) * 10),
    engagementScore: Math.round(((engagementCounts[s.id] || 0) / maxEngagement) * 10),
  }));
}

/**
 * Trie les élèves par total décroissant et assigne les rangs
 */
export function rankStudents(
  points: { studentId: string; participationScore: number; creativityScore: number; engagementScore: number }[],
): ((typeof points)[number] & { total: number; rank: number })[] {
  const withTotal = points.map((p) => ({
    ...p,
    total: p.participationScore + p.creativityScore + p.engagementScore,
    rank: 0,
  }));
  withTotal.sort((a, b) => b.total - a.total);
  withTotal.forEach((p, i) => {
    p.rank = i + 1;
  });
  return withTotal;
}

/**
 * Génère la carte talent d'un élève
 */
export function generateTalentCard(
  student: { id: string; displayName?: string },
  scores: { participationScore: number; creativityScore: number; engagementScore: number },
  roleKey: string,
): {
  talentCategory: string;
  strengths: string[];
  roleKey: string;
} {
  // Determine category from role
  const category = ROLE_TO_CATEGORY[roleKey] || "technique";
  const catDef = TALENT_CATEGORIES.find((c) => c.key === category)!;

  // Pick 2 strengths from category based on highest scores
  const strengths: string[] = [];
  if (scores.creativityScore >= 7) strengths.push(catDef.strengths[0]);
  if (scores.participationScore >= 7) strengths.push(catDef.strengths[1]);
  if (strengths.length < 2) {
    // Fill with remaining strengths
    for (const s of catDef.strengths) {
      if (!strengths.includes(s)) {
        strengths.push(s);
        if (strengths.length >= 2) break;
      }
    }
  }

  return {
    talentCategory: category,
    strengths,
    roleKey,
  };
}
