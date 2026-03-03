import { z } from "zod";

export const RelationshipSchema = z.object({
  id: z.string(),
  characterA: z.string(), // character ID
  characterB: z.string(), // character ID
  type: z.string().default("neutre"), // allié, rival, amour, famille, mentor, neutre
  label: z.string().default(""),
  power: z.number().min(-10).max(10).default(0), // A domine (+) ou B domine (-)
  trust: z.number().min(0).max(10).default(5),
  tension: z.number().min(0).max(10).default(0),
  notes: z.string().default(""),
});

export type Relationship = z.infer<typeof RelationshipSchema>;

export const CreateRelationshipSchema = z.object({
  characterA: z.string(),
  characterB: z.string(),
  type: z.string().optional(),
  label: z.string().optional(),
  power: z.number().optional(),
  trust: z.number().optional(),
  tension: z.number().optional(),
  notes: z.string().optional(),
});

export type CreateRelationship = z.infer<typeof CreateRelationshipSchema>;
