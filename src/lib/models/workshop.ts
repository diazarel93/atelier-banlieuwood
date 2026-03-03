import { z } from "zod";

// ── Table Read Session ──────────────────────────────────────────

export const TableReadLineSchema = z.object({
  characterId: z.string(),
  characterName: z.string(),
  characterColor: z.string(),
  text: z.string(),
  type: z.enum(["dialogue", "didascalie", "narration"]),
});

export const TableReadSessionSchema = z.object({
  id: z.string(),
  projectSlug: z.string(),
  title: z.string(),
  characterIds: z.array(z.string()),
  situation: z.string(),
  lines: z.array(TableReadLineSchema).default([]),
  redirections: z.array(z.string()).default([]),
  rawText: z.string().default(""),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TableReadLine = z.infer<typeof TableReadLineSchema>;
export type TableReadSession = z.infer<typeof TableReadSessionSchema>;

export const CreateTableReadSchema = z.object({
  title: z.string().min(1),
  characterIds: z.array(z.string()).min(2).max(5),
  situation: z.string().min(1),
});

export type CreateTableRead = z.infer<typeof CreateTableReadSchema>;

// ── Scene ───────────────────────────────────────────────────────

export const SceneBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("scene-header"),
    id: z.string(),
    text: z.string(),
  }),
  z.object({
    type: z.literal("action"),
    id: z.string(),
    text: z.string(),
  }),
  z.object({
    type: z.literal("dialogue"),
    id: z.string(),
    characterName: z.string(),
    parenthetical: z.string().default(""),
    text: z.string(),
  }),
  z.object({
    type: z.literal("transition"),
    id: z.string(),
    text: z.string(),
  }),
]);

export const SceneSchema = z.object({
  id: z.string(),
  projectSlug: z.string(),
  title: z.string(),
  characterIds: z.array(z.string()),
  context: z.string().default(""),
  tone: z.string().default(""),
  location: z.string().default(""),
  stakes: z.string().default(""),
  blocks: z.array(SceneBlockSchema).default([]),
  rawText: z.string().default(""),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SceneBlock = z.infer<typeof SceneBlockSchema>;
export type Scene = z.infer<typeof SceneSchema>;

export const CreateSceneSchema = z.object({
  title: z.string().min(1),
  characterIds: z.array(z.string()).min(1),
  context: z.string().min(1),
  tone: z.string().optional(),
  location: z.string().optional(),
  stakes: z.string().optional(),
});

export type CreateScene = z.infer<typeof CreateSceneSchema>;

// ── Conflict Analysis ───────────────────────────────────────────

export const CharacterReactionSchema = z.object({
  characterId: z.string(),
  characterName: z.string(),
  reaction: z.string(),
  drivingTrait: z.string(),
  traitCategory: z.string(),
});

export const ConflictPhaseSchema = z.object({
  phase: z.number().min(1).max(4),
  title: z.string(),
  description: z.string(),
  characterReactions: z.array(CharacterReactionSchema).default([]),
});

export const ConflictAnalysisSchema = z.object({
  id: z.string(),
  projectSlug: z.string(),
  title: z.string(),
  characterIds: z.array(z.string()),
  tensionPoint: z.string(),
  phases: z.array(ConflictPhaseSchema).default([]),
  rawText: z.string().default(""),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CharacterReaction = z.infer<typeof CharacterReactionSchema>;
export type ConflictPhase = z.infer<typeof ConflictPhaseSchema>;
export type ConflictAnalysis = z.infer<typeof ConflictAnalysisSchema>;

export const CreateConflictSchema = z.object({
  title: z.string().min(1),
  characterIds: z.array(z.string()).min(2).max(3),
  tensionPoint: z.string().min(1),
});

export type CreateConflict = z.infer<typeof CreateConflictSchema>;

// ── Script ──────────────────────────────────────────────────────

export const ScriptBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("scene-header"),
    id: z.string(),
    text: z.string(),
  }),
  z.object({
    type: z.literal("action"),
    id: z.string(),
    text: z.string(),
  }),
  z.object({
    type: z.literal("dialogue"),
    id: z.string(),
    characterName: z.string(),
    parenthetical: z.string().default(""),
    text: z.string(),
  }),
  z.object({
    type: z.literal("transition"),
    id: z.string(),
    text: z.string(),
  }),
]);

export const ScriptSchema = z.object({
  id: z.string(),
  projectSlug: z.string(),
  title: z.string(),
  blocks: z.array(ScriptBlockSchema).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ScriptBlock = z.infer<typeof ScriptBlockSchema>;
export type Script = z.infer<typeof ScriptSchema>;

export const CreateScriptSchema = z.object({
  title: z.string().min(1),
});

export type CreateScript = z.infer<typeof CreateScriptSchema>;
