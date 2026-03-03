import { z } from "zod";

export const ProjectMetaSchema = z.object({
  slug: z.string(),
  title: z.string().min(1),
  genre: z.string().default(""),
  logline: z.string().default(""),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ProjectMeta = z.infer<typeof ProjectMetaSchema>;

export const CreateProjectSchema = z.object({
  title: z.string().min(1),
  genre: z.string().optional(),
  logline: z.string().optional(),
});

export type CreateProject = z.infer<typeof CreateProjectSchema>;
