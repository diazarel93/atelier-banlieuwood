import { z } from "zod";

// ── Annotation types ────────────────────────────────────────────

export const AnnotationTypeSchema = z.enum([
  "encouragement",
  "correction",
  "question",
  "highlight",
]);

export type AnnotationType = z.infer<typeof AnnotationTypeSchema>;

export const ANNOTATION_STYLES: Record<
  AnnotationType,
  { bg: string; label: string; icon: string }
> = {
  encouragement: {
    bg: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    label: "Encouragement",
    icon: "💪",
  },
  correction: {
    bg: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    label: "Correction",
    icon: "✏️",
  },
  question: {
    bg: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    label: "Question",
    icon: "❓",
  },
  highlight: {
    bg: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    label: "A retenir",
    icon: "⭐",
  },
};

// ── Schemas ──────────────────────────────────────────────────────

export const ClassSchema = z.object({
  id: z.string(),
  projectSlug: z.string(),
  name: z.string().min(1),
  joinCode: z.string(),
  teacherName: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DashboardClass = z.infer<typeof ClassSchema>;

export const StudentSchema = z.object({
  id: z.string(),
  classId: z.string(),
  displayName: z.string().min(1),
  avatar: z.string().default("🎬"),
  atelierSessionId: z.string().nullable().default(null),
  joinedAt: z.string().datetime(),
});

export type Student = z.infer<typeof StudentSchema>;

export const TeacherMessageSchema = z.object({
  id: z.string(),
  classId: z.string(),
  targetStudentId: z.string().nullable().default(null),
  content: z.string().min(1),
  chapterId: z.string().nullable().default(null),
  stepId: z.string().nullable().default(null),
  createdAt: z.string().datetime(),
});

export type TeacherMessage = z.infer<typeof TeacherMessageSchema>;

export const AnnotationSchema = z.object({
  id: z.string(),
  classId: z.string(),
  studentId: z.string(),
  sessionId: z.string(),
  chapterId: z.string(),
  stepId: z.string(),
  content: z.string().min(1),
  type: AnnotationTypeSchema,
  createdAt: z.string().datetime(),
});

export type Annotation = z.infer<typeof AnnotationSchema>;

// ── Create schemas (API input) ──────────────────────────────────

export const CreateClassSchema = z.object({
  name: z.string().min(1),
  teacherName: z.string().min(1),
});

export type CreateClass = z.infer<typeof CreateClassSchema>;

export const JoinClassSchema = z.object({
  joinCode: z.string().min(1),
  displayName: z.string().min(1),
  avatar: z.string().default("🎬"),
  level: z.enum(["primaire", "college", "lycee", "fac"]).default("college"),
});

export type JoinClass = z.infer<typeof JoinClassSchema>;

export const CreateMessageSchema = z.object({
  content: z.string().min(1),
  targetStudentId: z.string().nullable().default(null),
  chapterId: z.string().nullable().default(null),
  stepId: z.string().nullable().default(null),
});

export type CreateMessage = z.infer<typeof CreateMessageSchema>;

export const CreateAnnotationSchema = z.object({
  studentId: z.string(),
  sessionId: z.string(),
  chapterId: z.string(),
  stepId: z.string(),
  content: z.string().min(1),
  type: AnnotationTypeSchema,
});

export type CreateAnnotation = z.infer<typeof CreateAnnotationSchema>;

// ── Avatar options ──────────────────────────────────────────────

export const AVATAR_OPTIONS = [
  "🎬", "🎭", "🎥", "🎤", "🎨", "🎵",
  "🌟", "💫", "🔥", "⚡", "🎯", "🚀",
] as const;
