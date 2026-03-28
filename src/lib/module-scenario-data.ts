// ============================================================
// MODULE 6 — Le Scénario
// L'IA génère 4-6 scènes incomplètes à partir des choix collectifs M12.
// Missions par profil créatif, écriture collaborative.
// ============================================================

export interface ScenarioScene {
  id: string;
  sessionId: string;
  sceneNumber: number;
  title: string;
  description: string;
  act: "setup" | "confrontation" | "resolution";
  status: "incomplete" | "in_progress" | "complete";
  content: string;
}

export interface ScenarioMission {
  id: string;
  sessionId: string;
  sceneId: string;
  studentId: string;
  role: string;
  task: string;
  content: string;
  status: "pending" | "done";
}

// 3 actes narratifs
export const ACTS = [
  { key: "setup", label: "Situation initiale", description: "Le monde normal du héros, avant que tout bascule." },
  {
    key: "confrontation",
    label: "Confrontation",
    description: "Les obstacles s'accumulent, le héros est mis à l'épreuve.",
  },
  {
    key: "resolution",
    label: "Résolution",
    description: "Le climax et le dénouement — comment l'histoire se termine.",
  },
] as const;

// 5 profils créatifs (Adrian) → missions d'écriture
// Acteur = comment parlent les personnages ? → dialogue
// Créatif = comment enrichir la scène ? → description
// Détective = qu'est-ce qui ne marche pas ? → cohérence
// Provocateur = comment mettre plus de tension ? → tension
// Stratège = comment ça se termine ? → structure
export const MISSION_TYPES = [
  {
    key: "dialogue",
    label: "Acteur",
    description: "Écris les répliques : comment parlent les personnages ?",
    emoji: "🎭",
  },
  {
    key: "description",
    label: "Créatif",
    description: "Enrichis la scène : lieux, ambiance, détails visuels",
    emoji: "🎨",
  },
  {
    key: "coherence",
    label: "Détective",
    description: "Vérifie que tout colle : incohérences, détails manquants",
    emoji: "🔍",
  },
  {
    key: "tension",
    label: "Provocateur",
    description: "Renforce la tension : conflits, obstacles, surprises",
    emoji: "⚡",
  },
  { key: "structure", label: "Stratège", description: "Structure la scène : début, progression, fin", emoji: "🧩" },
] as const;

// 8 ingrédients collectifs (1 par manche M12) — représentation minimale
// Adrian : chaque choix collectif doit être visible sur la frise
export const FRISE_STEPS = [
  { key: "ton", label: "Le Ton", description: "L'ambiance et le genre du film.", winnerManche: 1 },
  {
    key: "situation-initiale",
    label: "Situation initiale",
    description: "Le quotidien du héros, son monde.",
    winnerManche: 2,
  },
  {
    key: "personnages",
    label: "Les Personnages",
    description: "Qui sont les personnages de l'histoire ?",
    winnerManche: 3,
  },
  { key: "objectif", label: "L'Objectif", description: "Ce que le héros veut accomplir.", winnerManche: 4 },
  {
    key: "obstacle",
    label: "L'Obstacle",
    description: "Ce qui empêche le héros d'atteindre son objectif.",
    winnerManche: 5,
  },
  { key: "premiere-scene", label: "La Première Scène", description: "Comment le film commence.", winnerManche: 6 },
  { key: "relation", label: "La Relation", description: "La relation au cœur de l'histoire.", winnerManche: 7 },
  { key: "moment-fort", label: "Le Moment Fort", description: "Le moment le plus intense du film.", winnerManche: 8 },
] as const;

/**
 * Génère le prompt pour l'IA qui crée les scènes V0
 * @param winners - Choix collectifs de chaque manche M12 { 1: "texte", 2: "texte", ... }
 * @param level - Niveau scolaire (primaire/college/lycee)
 */
export function generateScenesPrompt(winners: Record<number, string>, level: string): string {
  const tone = winners[1] || "non défini";
  const situation = winners[2] || "non définie";
  const personnages = winners[3] || "non définis";
  const objectif = winners[4] || "non défini";
  const obstacle = winners[5] || "non défini";
  const scene1 = winners[6] || "non définie";
  const relation = winners[7] || "";
  const momentFort = winners[8] || "";

  const complexity =
    level === "primaire"
      ? "Utilise un vocabulaire simple et des phrases courtes. 4 scènes maximum."
      : level === "lycee"
        ? "Tu peux utiliser un vocabulaire riche et des situations complexes. 5-6 scènes."
        : "Utilise un vocabulaire accessible mais précis. 5 scènes.";

  const optionalElements = [
    relation && `- **Relation clé** : ${relation}`,
    momentFort && `- **Moment fort** : ${momentFort}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `Tu es un scénariste expérimenté qui aide des élèves à écrire leur premier scénario.

À partir des éléments votés par la classe, génère des scènes INCOMPLÈTES (à compléter par les élèves).

## Éléments collectifs :
- **Ton/genre** : ${tone}
- **Situation de départ** : ${situation}
- **Personnages** : ${personnages}
- **Objectif du héros** : ${objectif}
- **Obstacle principal** : ${obstacle}
- **Première scène** : ${scene1}${optionalElements ? "\n" + optionalElements : ""}

## Instructions :
${complexity}

Chaque scène doit avoir :
- Un titre court
- Une description de 2-3 phrases (le contexte, pas le contenu complet)
- Un acte : "setup", "confrontation" ou "resolution"

La structure doit suivre : situation initiale → élément perturbateur → péripéties → climax → dénouement.

Les scènes doivent être INCOMPLÈTES — elles sont des points de départ que les élèves compléteront.

Réponds en JSON :
{
  "scenes": [
    { "sceneNumber": 1, "title": "...", "description": "...", "act": "setup" },
    ...
  ]
}`;
}

/**
 * Assigne les missions aux élèves (round-robin sur les rôles)
 * Adrian: minimum 2 élèves par scène, 1 scribe par scène.
 * Priorise le profil créatif si disponible.
 */
export function assignMissions(
  students: { id: string; creativeProfile?: string }[],
  scenes: { id: string; sceneNumber: number; title: string }[],
): { studentId: string; sceneId: string; role: string; task: string; isScribe: boolean }[] {
  const roles: string[] = MISSION_TYPES.map((m) => m.key);
  const missions: { studentId: string; sceneId: string; role: string; task: string; isScribe: boolean }[] = [];

  // Profile → preferred role mapping
  // Supports both legacy 5-profile keys and new 6 talent profile keys
  const profileToRole: Record<string, string> = {
    // Legacy 5 profiles (M6)
    acteur: "dialogue",
    creatif: "description",
    detective: "coherence",
    provocateur: "tension",
    stratege: "structure",
    // New 6 talent profiles (Cartographie des Talents)
    imaginatif: "description",
    observateur: "coherence",
    narrateur: "dialogue",
    metteur_en_scene: "structure",
    // "acteur" already mapped above
    organisateur: "structure",
    // Legacy OIE fallbacks
    emotif: "tension",
    audacieux: "coherence",
  };

  // Sort students: those with known profiles first
  const sorted = [...students].sort((a, b) => {
    const aHas = a.creativeProfile && profileToRole[a.creativeProfile] ? 0 : 1;
    const bHas = b.creativeProfile && profileToRole[b.creativeProfile] ? 0 : 1;
    return aHas - bHas;
  });

  // Adrian: ensure min 2 students per scene
  // Strategy: distribute students across scenes ensuring at least 2 per scene
  const minPerScene = 2;
  const sceneCount = scenes.length;
  const sceneAssignments: Map<string, string[]> = new Map();
  for (const s of scenes) sceneAssignments.set(s.id, []);

  // First pass: ensure minimum 2 per scene (round-robin)
  let sceneIdx = 0;
  for (const student of sorted) {
    const scene = scenes[sceneIdx % sceneCount];
    sceneAssignments.get(scene.id)!.push(student.id);

    // Only advance to next scene once current has minPerScene
    if (sceneAssignments.get(scene.id)!.length >= minPerScene) {
      sceneIdx++;
    }
    // If we've ensured all scenes have min, keep distributing round-robin
    if (sceneIdx >= sceneCount) {
      sceneIdx = sorted.indexOf(student) % sceneCount;
      // Fallback: just keep going round-robin
      break;
    }
  }

  // Remaining students distributed round-robin
  const assigned = new Set(Array.from(sceneAssignments.values()).flat());
  const remaining = sorted.filter((s) => !assigned.has(s.id));
  for (let i = 0; i < remaining.length; i++) {
    const scene = scenes[i % sceneCount];
    sceneAssignments.get(scene.id)!.push(remaining[i].id);
  }

  // Build missions with roles
  let globalRoleIdx = 0;
  for (const scene of scenes) {
    const studentsForScene = sceneAssignments.get(scene.id) || [];
    let scribeAssigned = false;

    for (const studentId of studentsForScene) {
      const student = sorted.find((s) => s.id === studentId);

      // Try to assign preferred role, fallback to round-robin
      let role = roles[globalRoleIdx % roles.length];
      if (student?.creativeProfile && profileToRole[student.creativeProfile]) {
        role = profileToRole[student.creativeProfile];
      }
      globalRoleIdx++;

      const missionType = MISSION_TYPES.find((m) => m.key === role)!;
      const task = `${missionType.description} pour la scène "${scene.title}"`;

      // Adrian: first student per scene is scribe
      const isScribe = !scribeAssigned;
      scribeAssigned = true;

      missions.push({
        studentId,
        sceneId: scene.id,
        role,
        task,
        isScribe,
      });
    }
  }

  return missions;
}
