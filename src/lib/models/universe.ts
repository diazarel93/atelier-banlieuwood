import { z } from "zod";

export const LocationSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().default(""),
  type: z.string().default(""), // intérieur, extérieur, etc.
  atmosphere: z.string().default(""),
  notes: z.string().default(""),
});

export type Location = z.infer<typeof LocationSchema>;

export const WorldRuleSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().default(""),
  category: z.string().default(""), // social, physique, magique, technologique
});

export type WorldRule = z.infer<typeof WorldRuleSchema>;

export const TimelineEventSchema = z.object({
  id: z.string(),
  date: z.string().default(""),
  title: z.string().min(1),
  description: z.string().default(""),
  characters: z.array(z.string()).default([]), // character IDs involved
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const UniverseDataSchema = z.object({
  locations: z.array(LocationSchema).default([]),
  rules: z.array(WorldRuleSchema).default([]),
  timeline: z.array(TimelineEventSchema).default([]),
});

export type UniverseData = z.infer<typeof UniverseDataSchema>;
