// ============================================================
// MODULE 6 — Le Scénario (stub)
// L'IA génère 4-6 scènes incomplètes à partir des gagnants M5.
// Missions par profil, travail en groupe.
// ============================================================

export interface ScenarioScene {
  id: string;
  sessionId: string;
  sceneNumber: number;
  title: string;
  description: string;
  status: "incomplete" | "in_progress" | "complete";
  assignedTeamId: string | null;
  content: string;
}

export interface ScenarioMission {
  id: string;
  sessionId: string;
  sceneId: string;
  studentId: string;
  role: string;
  task: string;
  status: "pending" | "done";
}

export const MISSION_TYPES = [
  { key: "dialogue", label: "Dialoguiste", description: "Écris les répliques de la scène" },
  { key: "description", label: "Descripteur", description: "Décris les lieux et l'ambiance" },
  { key: "action", label: "Chorégraphe", description: "Décris les actions et mouvements" },
  { key: "emotion", label: "Émotionnel", description: "Ajoute les émotions et pensées des personnages" },
] as const;

// Placeholder — full implementation pending Adrian's detailed specs
