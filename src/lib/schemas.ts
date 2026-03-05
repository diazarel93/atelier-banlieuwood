import { z } from "zod";

// ──── Sessions ────

const VALID_TEMPLATES = [
  "horreur",
  "comedie",
  "action",
  "romance",
  "drame",
  "sci-fi",
  "policier",
  "fantastique",
] as const;

export const createSessionSchema = z.object({
  title: z.string().trim().min(1, "Titre requis"),
  level: z.enum(["primaire", "college", "lycee"], {
    message: "Niveau invalide",
  }),
  template: z.string().optional().nullable().transform((v) =>
    v && (VALID_TEMPLATES as readonly string[]).includes(v) ? v : null
  ),
  thematique: z.string().optional().nullable(),
  description: z.string().max(200).optional().nullable(),
  question_timer: z
    .number()
    .int()
    .min(1)
    .max(600)
    .optional()
    .nullable(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

// ──── Join ────

export const joinSessionSchema = z.object({
  joinCode: z.string().min(1, "Code requis").max(6),
  displayName: z.string().trim().min(1, "Prénom trop court").max(30),
  avatar: z.string().min(1, "Avatar requis"),
});

export type JoinSessionInput = z.infer<typeof joinSessionSchema>;

// ──── Respond ────

const uuidSchema = z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  "UUID invalide"
);

export const respondSchema = z.object({
  studentId: uuidSchema,
  situationId: uuidSchema,
  text: z.string().min(1, "Réponse vide"),
});

export type RespondInput = z.infer<typeof respondSchema>;

// ──── Vote ────

export const voteSchema = z.object({
  studentId: uuidSchema,
  situationId: uuidSchema,
  chosenResponseId: uuidSchema,
});

export type VoteInput = z.infer<typeof voteSchema>;

// ──── Patch session ────

const VALID_STATUSES = [
  "waiting",
  "responding",
  "reviewing",
  "voting",
  "results",
  "paused",
  "done",
] as const;

const VALID_MODULE_IDS = [
  "m1", "m1a", "m1b", "m1c", "m1d", "m1e",
  "m2a", "m2b", "m2c", "m2d", "m2-perso", "m2",
  "m3", "m4", "m5",
  "u2a", "u2b", "u2c", "u2d",
  "m10a", "m10b",
  "cd1", "cd2", "cd3", "cd4",
  "m12a",
] as const;

export const patchSessionSchema = z
  .object({
    status: z.enum(VALID_STATUSES).optional(),
    current_module: z.number().int().min(1).max(12).optional(),
    current_seance: z.number().int().min(1).max(5).optional(),
    current_situation_index: z.number().int().min(0).optional(),
    title: z.string().min(1).max(60).optional(),
    timer_ends_at: z.string().nullable().optional(),
    completed_modules: z
      .array(z.enum(VALID_MODULE_IDS))
      .optional(),
    sharing_enabled: z.boolean().optional(),
    broadcast_message: z.string().max(200).nullable().optional(),
    broadcast_at: z.string().nullable().optional(),
    mute_sounds: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Rien a mettre a jour",
  });

export type PatchSessionInput = z.infer<typeof patchSessionSchema>;

// ──── Reactions ────

const VALID_EMOJIS = ["👍", "❤️", "😂", "🎯", "💡"] as const;
export { VALID_EMOJIS };

export const reactionSchema = z.object({
  responseId: uuidSchema,
  studentId: uuidSchema,
  emoji: z.enum(VALID_EMOJIS, { message: "Emoji invalide" }),
});

export type ReactionInput = z.infer<typeof reactionSchema>;

// ──── Helper: format Zod error ────

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join(", ");
}
