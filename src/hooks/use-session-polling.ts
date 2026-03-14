"use client";

import { useQuery } from "@tanstack/react-query";

export interface Module1Data {
  type: "positioning" | "image" | "notebook";
  // Positioning (séance 1)
  questions?: {
    index: number;
    situationId: string | null;
    text: string;
    measure: string;
    options?: { key: string; label: string }[];
  }[];
  answeredQuestions?: Record<number, boolean>;
  answeredOptions?: Record<number, string>;
  responseCounts?: Record<number, number>;
  optionDistribution?: Record<string, number> | null;
  // Image (séances 2-4)
  image?: { position: number; title: string; description: string; url: string } | null;
  question?: { situationId: string; text: string; relance: string; measure: string };
  hasResponded?: boolean;
  responsesCount?: number;
  confrontation?: { responseA: string; responseB: string } | null;
  // Notebook (séance 5)
  existingText?: string;
  suggestions?: string[];
  encouragement?: string;
  // Common
  totalSeances: number;
  currentSeance: number;
}

export interface Module5Data {
  type: "checklist" | "scene-builder" | "comparison";
  // Checklist (séance 1 index 0)
  checklist?: { selected_items: string[]; chosen_item: string | null; scene_marquante?: string | null; deeper_reflection?: string | null } | null;
  topItems?: { key: string; count: number }[];
  submitted?: boolean;
  submittedCount?: number;
  // Scene builder (séance 2 index 1)
  scene?: {
    id: string;
    emotion: string;
    intention: string;
    obstacle: string;
    changement: string;
    elements: { key: string; label: string; tier: number; cost: number }[];
    tokens_used: number;
    slots_used: number;
    ai_feedback: { strengths: string[]; suggestions: string[]; summary: string } | null;
  } | null;
  chosenEmotion?: string | null;
  emotionDistribution?: Record<string, number>;
  // Comparison (séance 3)
  comparison?: {
    sceneA: {
      id: string;
      emotion: string;
      intention: string;
      obstacle: string;
      changement: string;
      elements: { key: string; label: string; tier: number; cost: number }[];
    };
    sceneB: {
      id: string;
      emotion: string;
      intention: string;
      obstacle: string;
      changement: string;
      elements: { key: string; label: string; tier: number; cost: number }[];
    };
  } | null;
}

export interface Module10Data {
  type: "etsi" | "idea-bank" | "avatar" | "objectif" | "pitch" | "chrono" | "confrontation";
  // Et si (seance 1)
  image?: { id: string; url: string; title: string; description: string } | null;
  etsiText?: string;
  helpUsed?: boolean;
  submitted?: boolean;
  qcmAnswers?: Record<string, string>;
  ideaBankCount?: number;
  ideaBankItems?: { id: string; text: string; votes: number }[];
  // Pitch (seance 2)
  personnage?: { prenom: string; trait: string; avatar: Record<string, string> } | null;
  objectif?: string | null;
  objectifReason?: string | null;
  obstacle?: string | null;
  pitchText?: string | null;
  pitchMiroir?: string;
  chronoSeconds?: number | null;
  // Confrontation
  confrontation?: { pitchA: { text: string; prenom: string }; pitchB: { text: string; prenom: string } } | null;
  // Shared
  submittedCount?: number;
  // Help gating — Adrian: "L'aide doit être activée par l'intervenant"
  helpEnabled?: boolean;
  // Facilitator view: all student submissions for M10 special positions
  allSubmissions?: { studentName: string; text: string; studentId: string; avatar?: Record<string, unknown> }[];
}

export interface Module11Data {
  type: "citation" | "scene" | "poster" | "debat";
  theme: "raconter" | "émotion" | "héros" | "coulisses";
  /** The stimulus text (quote for citation, instruction for poster/scene, statement for debat) */
  text: string;
  author: string | null;
  authorRole: string | null;
  authorBio: string | null;
  authorImageUrl: string | null;
  filmography: { title: string; year: number; posterPath: string }[] | null;
  imageUrl: string | null;
  videoId: string | null;
  videoStart: number | null;
  videoEnd: number | null;
  sourceTitle: string | null;
  sourceYear: number | null;
  debatOptions: { key: string; label: string }[] | null;
}

export interface Module6Data {
  type: "frise" | "scenes-v0" | "mission" | "ecriture" | "assemblage";
  position: number;
  // Frise
  friseSteps?: { key: string; label: string; description: string; winnerManche: number; winnerText: string | null }[];
  winners?: Record<number, string>;
  // Scenes V0
  scenes?: { id: string; sceneNumber: number; title: string; description: string; act: string; status: string; content: string }[];
  scenesReady?: boolean;
  lectureCollective?: boolean;
  // Mission
  mission?: {
    id: string;
    role: string;
    roleLabel: string;
    roleEmoji: string;
    task: string;
    sceneTitle: string;
    sceneDescription?: string;
    sceneContent?: string;
    content?: string;
    status: string;
    isScribe?: boolean;
  } | null;
  missionTypes?: { key: string; label: string; description: string; emoji: string }[];
  // Assemblage
  missions?: { id: string; studentId: string; role: string; content: string; status: string; sceneTitle: string }[];
  scenario?: { fullText: string; validated: boolean } | null;
}

export interface Module7Data {
  type: "plans" | "comparaison" | "decoupage" | "storyboard";
  position: number;
  // Plans
  plans?: { key: string; label: string; description: string; question: string; example: string; color: string; imageUrl?: string }[];
  // Comparaison
  comparisons?: {
    key: string;
    sceneDescription: string;
    planA: { type: string; description: string };
    planB: { type: string; description: string };
    imageA?: string;
    imageB?: string;
    question: string;
    explanation: string;
  }[];
  studentComparisons?: { comparisonKey: string; chosenPlan: string; reasoning: string }[];
  comparisonResults?: Record<string, Record<string, number>> | null;
  // Découpage
  keyScenes?: { id: string; sceneNumber: number; title: string; description: string; template: unknown }[];
  studentDecoupages?: { sceneId: string; plans: unknown }[];
  planTypes?: { key: string; label: string }[];
  // Storyboard
  storyboard?: {
    scenes: { sceneId: string; title: string; plans: { position: number; planType: string; description: string; intention?: string; imageUrl?: string }[] }[];
    validated: boolean;
  } | null;
  allDecoupages?: { sceneId: string; studentId: string; plans: unknown }[];
  scenes?: { id: string; sceneNumber: number; title: string }[];
}

export interface Module8Data {
  type: "quiz" | "debrief" | "role-choice" | "team-recap" | "talent-card";
  position: number;
  // Quiz — Adrian format: click roles you think you know, then reveal
  quiz?: { metierKey: string; metierLabel: string; metierEmoji: string; commonBelief: string; reality: string }[];
  studentAnswers?: { metierKey: string; correct: boolean }[];
  hasAnswered?: boolean;
  // Débrief
  corrections?: { metierKey: string; metierLabel: string; metierEmoji: string; commonBelief: string; reality: string }[];
  classResults?: Record<string, { correct: number; wrong: number }> | null;
  fiches?: { key: string; label: string; description: string; skills: string[]; emoji: string; color: string }[];
  studentList?: { studentId: string; displayName: string }[];
  // Role choice
  studentRank?: number | null;
  isMyTurn?: boolean;
  availableRoles?: { key: string; label: string; description: string; emoji: string; color: string; count: number }[];
  takenRoles?: { roleKey: string; studentId: string; isVeto: boolean; roleLabel: string }[];
  ranking?: { studentId: string; displayName: string; participation: number; creativity: number; engagement: number; total: number; rank: number; hasChosen: boolean }[] | null;
  pointsComputed?: boolean;
  // Team recap
  team?: { studentId: string; displayName: string; avatarSeed: string; roleKey: string; roleLabel: string; roleEmoji: string; roleColor: string; isVeto: boolean }[];
  formula?: "F2" | "F3";
  // Talent card
  talentCard?: {
    displayName: string;
    avatarSeed: string;
    roleKey: string;
    roleLabel: string;
    roleEmoji: string;
    talentCategory: string;
    talentCategoryLabel: string;
    talentCategoryColor: string;
    strengths: string[];
    isVeto?: boolean;
    creativeProfile?: {
      key: string;
      label: string;
      emoji: string;
      color: string;
    } | null;
  } | null;
}

export interface Module12Data {
  type: "manche-vote";
  manche: number;
  mancheLabel: string;
  cards: { cardId: string; text: string; isBanlieuwood: boolean }[];
  studentVote: string | null;
  voteCounts: Record<string, number> | null;
  winner: { cardId: string; text: string } | null;
  allWinners: { manche: number; text: string }[];
  poolReady: boolean;
}

export interface Module13Data {
  position: number;
  stepKey: string;
  stepLabel: string;
  stepEmoji: string;
  stepDescription: string;
  hasSubmitted: boolean;
  submittedCount: number;
  allResults: { position: number; type: string; data: unknown }[];
  // Position 1 — Montage
  scenes?: { manche: number; text: string }[];
  studentOrder?: number[] | null;
  // Position 2 — Musique
  studentChoice?: { genre: string; mood: string; justification: string } | null;
  allChoices?: { genre: string; mood: string; student_id: string }[];
  // Position 3 — Titre
  studentTitre?: string | null;
  allTitres?: { titre: string; student_id: string }[];
  // Position 4 — Affiche
  studentAffiche?: { style: string; description: string; tagline: string } | null;
  allAffiches?: { style: string; description: string; tagline: string; student_id: string }[];
  // Position 5 — Trailer
  availableMoments?: { manche: number; text: string }[];
  studentTrailer?: { moments: unknown; voix_off: string } | null;
  // Position 6-8 — Standard Q&A
  useStandardQA?: boolean;
}

export interface SessionState {
  session: {
    id: string;
    status: "waiting" | "responding" | "reviewing" | "voting" | "paused" | "done";
    currentModule: number;
    currentSeance: number;
    currentSituationIndex: number;
    level: string;
    title: string;
    joinCode?: string;
    template?: string | null;
    timerEndsAt?: string | null;
    mode: "guided" | "free";
    sharingEnabled?: boolean;
    broadcastMessage?: string | null;
    broadcastAt?: string | null;
    muteSounds?: boolean;
    revealPhase?: number | null;
  };
  situation: {
    id: string;
    position: number;
    category: string;
    restitutionLabel: string;
    prompt: string;
    nudgeText: string | null;
  } | null;
  module1?: Module1Data;
  module5?: Module5Data;
  module6?: Module6Data;
  module7?: Module7Data;
  module8?: Module8Data;
  module10?: Module10Data;
  module11?: Module11Data;
  module12?: Module12Data;
  module13?: Module13Data;
  hasResponded: boolean;
  hasVoted: boolean;
  voteOptions: { id: string; text: string }[];
  collectiveChoice: {
    id: string;
    chosen_text: string;
    category: string;
    restitution_label: string;
  } | null;
  connectedCount: number;
  responsesCount: number;
  budgetStats: {
    averages: Record<string, number>;
    submittedCount: number;
  } | null;
  isMyResponseChosen: boolean;
  teacherNudge: string | null;
  studentWarnings: number;
  studentKicked: boolean;
  team?: { id: string; teamName: string; teamColor: string; teamNumber: number } | null;
  topStudents?: { id: string; displayName: string; avatar: string; xp: number }[];
  currentRank?: number | null;
}

export function useSessionPolling(
  sessionId: string,
  studentId: string | null,
  opts?: { skipStudentCheck?: boolean; realtimeStatus?: import("./use-realtime-invalidation").ConnectionStatus }
) {
  const interval = opts?.realtimeStatus === "connected" ? 30_000 : 5_000;
  return useQuery<SessionState>({
    queryKey: ["session-state", sessionId, studentId],
    queryFn: async () => {
      const params = studentId ? `?studentId=${studentId}` : "";
      const res = await fetch(`/api/sessions/${sessionId}/situation${params}`);
      if (!res.ok) throw new Error("Session introuvable");
      return res.json();
    },
    refetchInterval: interval,
    staleTime: 2_000,
    // Wait for studentId to be loaded unless explicitly skipped (e.g. screen page)
    enabled: !!sessionId && (opts?.skipStudentCheck || studentId !== null),
  });
}
