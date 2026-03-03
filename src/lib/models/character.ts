import { z } from "zod";

export const CharacterTraitSchema = z.object({
  name: z.string(),
  intensity: z.number().min(1).max(10),
});

export const CharacterVoiceSchema = z.object({
  vocabulary: z.string().default(""),
  register: z.string().default(""),
  verbalTics: z.array(z.string()).default([]),
  examplePhrases: z.array(z.string()).default([]),
});

export const CharacterArcSchema = z.object({
  act: z.number(),
  description: z.string(),
  state: z.string().default(""),
});

export const CharacterPsychologySchema = z.object({
  goal: z.string().default(""),
  need: z.string().default(""),
  flaw: z.string().default(""),
  fear: z.string().default(""),
  secret: z.string().default(""),
});

export const CharacterSchema = z.object({
  id: z.string(),
  projectSlug: z.string(),
  // Identity
  name: z.string().min(1),
  age: z.string().default(""),
  occupation: z.string().default(""),
  role: z.string().default(""), // protagoniste, antagoniste, secondaire, figurant
  color: z.string().default("#6366f1"), // color tag for UI
  avatar: z.string().default(""),
  backstory: z.string().default(""),
  // Psychology
  psychology: CharacterPsychologySchema.default({
    goal: "",
    need: "",
    flaw: "",
    fear: "",
    secret: "",
  }),
  traits: z.array(CharacterTraitSchema).default([]),
  // Voice
  voice: CharacterVoiceSchema.default({
    vocabulary: "",
    register: "",
    verbalTics: [],
    examplePhrases: [],
  }),
  // Narrative arc
  arc: z.array(CharacterArcSchema).default([]),
  // Meta
  notes: z.string().default(""),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Character = z.infer<typeof CharacterSchema>;
export type CharacterTrait = z.infer<typeof CharacterTraitSchema>;
export type CharacterVoice = z.infer<typeof CharacterVoiceSchema>;
export type CharacterArc = z.infer<typeof CharacterArcSchema>;
export type CharacterPsychology = z.infer<typeof CharacterPsychologySchema>;

export const CreateCharacterSchema = z.object({
  name: z.string().min(1),
  age: z.string().optional(),
  occupation: z.string().optional(),
  role: z.string().optional(),
  color: z.string().optional(),
  backstory: z.string().optional(),
  psychology: CharacterPsychologySchema.partial().optional(),
  traits: z.array(CharacterTraitSchema).optional(),
  voice: CharacterVoiceSchema.partial().optional(),
  arc: z.array(CharacterArcSchema).optional(),
  notes: z.string().optional(),
});

export type CreateCharacter = z.infer<typeof CreateCharacterSchema>;
