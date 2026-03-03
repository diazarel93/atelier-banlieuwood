import { z } from "zod";

// ── Episode ─────────────────────────────────────────────────────

export const EpisodeSchema = z.object({
  id: z.string(),
  projectSlug: z.string(),
  title: z.string(),
  number: z.number().default(1),
  synopsis: z.string().default(""),
  sceneIds: z.array(z.string()).default([]),
  status: z
    .enum(["draft", "outline", "writing", "revision", "final"])
    .default("draft"),
  notes: z.string().default(""),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Episode = z.infer<typeof EpisodeSchema>;

export const CreateEpisodeSchema = z.object({
  title: z.string().min(1),
  number: z.number().optional(),
  synopsis: z.string().optional(),
});

export type CreateEpisode = z.infer<typeof CreateEpisodeSchema>;

// ── Production Note ─────────────────────────────────────────────

export const ProductionNoteSchema = z.object({
  id: z.string(),
  projectSlug: z.string(),
  title: z.string(),
  content: z.string().default(""),
  category: z
    .enum(["todo", "in-progress", "done", "note"])
    .default("todo"),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ProductionNote = z.infer<typeof ProductionNoteSchema>;

export const CreateProductionNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  category: z.enum(["todo", "in-progress", "done", "note"]).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
});

export type CreateProductionNote = z.infer<typeof CreateProductionNoteSchema>;
