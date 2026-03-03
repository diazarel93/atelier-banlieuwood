"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  DashboardClass,
  CreateClass,
  TeacherMessage,
  Annotation,
  CreateMessage,
  CreateAnnotation,
} from "@/lib/models/dashboard";
import type { StudentWithSession } from "@/lib/storage/dashboard-store";

const BASE = (slug: string) => `/api/projects/${slug}/dashboard`;

// ── Classes ─────────────────────────────────────────────────────

export function useClasses(slug: string) {
  return useQuery<DashboardClass[]>({
    queryKey: ["dashboard", slug, "classes"],
    queryFn: async () => {
      const res = await fetch(`${BASE(slug)}/classes`);
      if (!res.ok) throw new Error("Impossible de charger les classes");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useClass(slug: string, classId: string) {
  return useQuery<DashboardClass>({
    queryKey: ["dashboard", slug, "classes", classId],
    queryFn: async () => {
      const res = await fetch(`${BASE(slug)}/classes/${classId}`);
      if (!res.ok) throw new Error("Impossible de charger la classe");
      return res.json();
    },
    enabled: !!slug && !!classId,
  });
}

export function useCreateClass(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateClass) => {
      const res = await fetch(`${BASE(slug)}/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Impossible de creer la classe");
      return res.json() as Promise<DashboardClass>;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["dashboard", slug, "classes"] }),
  });
}

export function useUpdateClass(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      classId,
      data,
    }: {
      classId: string;
      data: Partial<Pick<DashboardClass, "name" | "teacherName">>;
    }) => {
      const res = await fetch(`${BASE(slug)}/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Impossible de modifier la classe");
      return res.json() as Promise<DashboardClass>;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["dashboard", slug, "classes"] });
      qc.invalidateQueries({
        queryKey: ["dashboard", slug, "classes", vars.classId],
      });
    },
  });
}

export function useDeleteClass(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (classId: string) => {
      const res = await fetch(`${BASE(slug)}/classes/${classId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Impossible de supprimer la classe");
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["dashboard", slug, "classes"] }),
  });
}

// ── Students ────────────────────────────────────────────────────

export function useDeleteStudent(slug: string, classId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch(
        `${BASE(slug)}/classes/${classId}/students/${studentId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Impossible de supprimer l'\u00e9l\u00e8ve");
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["dashboard", slug, "classes", classId, "students"],
      });
      qc.invalidateQueries({
        queryKey: ["dashboard", slug, "classes", classId, "live"],
      });
    },
  });
}

export function useClassStudents(slug: string, classId: string) {
  return useQuery<StudentWithSession[]>({
    queryKey: ["dashboard", slug, "classes", classId, "students"],
    queryFn: async () => {
      const res = await fetch(`${BASE(slug)}/classes/${classId}/students`);
      if (!res.ok) throw new Error("Impossible de charger les eleves");
      return res.json();
    },
    enabled: !!slug && !!classId,
    refetchInterval: 3000,
    refetchIntervalInBackground: false,
  });
}

export function useStudentDetail(
  slug: string,
  classId: string,
  studentId: string
) {
  return useQuery<StudentWithSession>({
    queryKey: [
      "dashboard",
      slug,
      "classes",
      classId,
      "students",
      studentId,
    ],
    queryFn: async () => {
      const res = await fetch(
        `${BASE(slug)}/classes/${classId}/students/${studentId}`
      );
      if (!res.ok) throw new Error("Impossible de charger l'eleve");
      return res.json();
    },
    enabled: !!slug && !!classId && !!studentId,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });
}

// ── Live snapshot ───────────────────────────────────────────────

export type LiveSnapshot = {
  students: Array<{
    studentId: string;
    displayName: string;
    avatar: string;
    status: "active" | "struggling" | "idle" | "not-started";
    currentChapter: string | null;
    currentChapterLabel?: string | null;
    currentQuestion: number | null;
    totalAnswered: number;
    totalQuestions: number;
    totalScore: number;
    avgScore?: number;
    lastActivity: string;
    streak: number;
    bestStreak?: number;
    badges?: Array<{ chapter: string; badge: string | null }>;
  }>;
  stats: {
    totalStudents: number;
    activeCount: number;
    avgProgress: number;
    totalAnswered: number;
  };
};

export function useLiveSnapshot(slug: string, classId: string) {
  return useQuery<LiveSnapshot>({
    queryKey: ["dashboard", slug, "classes", classId, "live"],
    queryFn: async () => {
      const res = await fetch(`${BASE(slug)}/classes/${classId}/live`);
      if (!res.ok) throw new Error("Impossible de charger les donnees live");
      return res.json();
    },
    enabled: !!slug && !!classId,
    refetchInterval: 3000,
    refetchIntervalInBackground: false,
  });
}

// ── Messages (teacher-side) ─────────────────────────────────────

export function useMessages(
  slug: string,
  classId: string,
  studentId?: string
) {
  const qs = studentId ? `?studentId=${studentId}` : "";
  return useQuery<TeacherMessage[]>({
    queryKey: ["dashboard", slug, "classes", classId, "messages", "teacher", studentId],
    queryFn: async () => {
      const res = await fetch(
        `${BASE(slug)}/classes/${classId}/messages${qs}`
      );
      if (!res.ok) throw new Error("Impossible de charger les messages");
      return res.json();
    },
    enabled: !!slug && !!classId,
  });
}

export function useSendMessage(slug: string, classId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMessage) => {
      const res = await fetch(`${BASE(slug)}/classes/${classId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Impossible d'envoyer le message");
      }
      return res.json() as Promise<TeacherMessage>;
    },
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["dashboard", slug, "classes", classId, "messages"],
      }),
  });
}

// ── Student messages (student-side polling — distinct query key) ─

export function useStudentMessages(
  slug: string,
  classId: string | undefined,
  studentId: string | undefined
) {
  return useQuery<TeacherMessage[]>({
    queryKey: ["dashboard", slug, "classes", classId, "messages", "student", studentId],
    queryFn: async () => {
      const res = await fetch(
        `${BASE(slug)}/classes/${classId}/messages?studentId=${studentId}`
      );
      if (!res.ok) throw new Error("Impossible de charger les messages");
      return res.json();
    },
    enabled: !!slug && !!classId && !!studentId,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });
}

// ── Annotations ─────────────────────────────────────────────────

export function useAnnotations(
  slug: string,
  classId: string,
  studentId?: string,
  chapterId?: string
) {
  const qs = new URLSearchParams();
  if (studentId) qs.set("studentId", studentId);
  if (chapterId) qs.set("chapterId", chapterId);
  const qsStr = qs.toString() ? `?${qs.toString()}` : "";
  return useQuery<Annotation[]>({
    queryKey: [
      "dashboard",
      slug,
      "classes",
      classId,
      "annotations",
      studentId,
      chapterId,
    ],
    queryFn: async () => {
      const res = await fetch(
        `${BASE(slug)}/classes/${classId}/annotations${qsStr}`
      );
      if (!res.ok) throw new Error("Impossible de charger les annotations");
      return res.json();
    },
    enabled: !!slug && !!classId,
  });
}

export function useCreateAnnotation(slug: string, classId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAnnotation) => {
      const res = await fetch(
        `${BASE(slug)}/classes/${classId}/annotations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Impossible de creer l'annotation");
      }
      return res.json() as Promise<Annotation>;
    },
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["dashboard", slug, "classes", classId, "annotations"],
      }),
  });
}

// ── Join class (student side) ───────────────────────────────────

export type JoinResult = {
  classId: string;
  className: string;
  studentId: string;
  sessionId: string;
};

export function useJoinClass(slug: string) {
  return useMutation({
    mutationFn: async (data: {
      joinCode: string;
      displayName: string;
      avatar: string;
      level: string;
    }) => {
      const res = await fetch(`${BASE(slug)}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Impossible de rejoindre la classe");
      }
      return res.json() as Promise<JoinResult>;
    },
  });
}
