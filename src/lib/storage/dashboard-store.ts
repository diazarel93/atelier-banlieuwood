import { nanoid } from "nanoid";
import path from "path";
import {
  readJson,
  writeJson,
  deleteFile,
  deleteDir,
  listJsonFiles,
  classesDir,
  classPath,
  studentsDir,
  studentPath,
  messagesDir,
  messagePath,
  annotationsDir,
  annotationPath,
  atelierPath,
  atelierDir,
} from "./fs-adapter";
import {
  getAtelierSession,
  createAtelierSession,
  deleteAtelierSession,
} from "./atelier-store";
import {
  ClassSchema,
  StudentSchema,
  TeacherMessageSchema,
  AnnotationSchema,
  type DashboardClass,
  type Student,
  type TeacherMessage,
  type Annotation,
  type CreateClass,
  type CreateMessage,
  type CreateAnnotation,
} from "../models/dashboard";
import type { AtelierSession } from "../models/atelier";

// ── Constants ───────────────────────────────────────────────────

const IDLE_MINUTES = 5;
const STRUGGLING_SCORE_THRESHOLD = 1.5;
const STRUGGLING_MIN_ANSWERS = 2;
const MAX_JOIN_CODE_RETRIES = 10;

// ── Classes ─────────────────────────────────────────────────────

export async function listClasses(slug: string): Promise<DashboardClass[]> {
  const dir = classesDir(slug);
  const files = await listJsonFiles(dir);
  const items: DashboardClass[] = [];
  for (const file of files) {
    const raw = await readJson<Record<string, unknown>>(path.join(dir, file));
    if (!raw) continue;
    try {
      items.push(ClassSchema.parse(raw));
    } catch {
      continue;
    }
  }
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getClass(
  slug: string,
  classId: string
): Promise<DashboardClass | null> {
  const raw = await readJson<Record<string, unknown>>(classPath(slug, classId));
  if (!raw) return null;
  try {
    return ClassSchema.parse(raw);
  } catch {
    return null;
  }
}

async function generateUniqueJoinCode(slug: string): Promise<string> {
  const existing = await listClasses(slug);
  const usedCodes = new Set(existing.map((c) => c.joinCode));
  for (let i = 0; i < MAX_JOIN_CODE_RETRIES; i++) {
    const code = nanoid(6).toUpperCase();
    if (!usedCodes.has(code)) return code;
  }
  // Fallback: 8-char code for near-zero collision
  return nanoid(8).toUpperCase();
}

export async function createClass(
  slug: string,
  data: CreateClass
): Promise<DashboardClass> {
  const id = nanoid(10);
  const joinCode = await generateUniqueJoinCode(slug);
  const now = new Date().toISOString();
  const cls = ClassSchema.parse({
    id,
    projectSlug: slug,
    name: data.name,
    joinCode,
    teacherName: data.teacherName,
    createdAt: now,
    updatedAt: now,
  });
  await writeJson(classPath(slug, id), cls);
  return cls;
}

export async function updateClass(
  slug: string,
  classId: string,
  data: Partial<Pick<DashboardClass, "name" | "teacherName">>
): Promise<DashboardClass | null> {
  const existing = await getClass(slug, classId);
  if (!existing) return null;
  // Only pick allowed fields
  const patch: Record<string, unknown> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.teacherName !== undefined) patch.teacherName = data.teacherName;
  const updated = ClassSchema.parse({
    ...existing,
    ...patch,
    id: existing.id,
    projectSlug: existing.projectSlug,
    joinCode: existing.joinCode,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await writeJson(classPath(slug, classId), updated);
  return updated;
}

export async function deleteClass(
  slug: string,
  classId: string
): Promise<boolean> {
  // Cascade: delete all students' sessions, then the class directory
  const students = await listStudents(slug, classId);
  for (const student of students) {
    if (student.atelierSessionId) {
      await deleteAtelierSession(slug, student.atelierSessionId);
    }
  }
  // Delete the class subdirectory (students, messages, annotations)
  const classSubDir = path.join(classesDir(slug), classId);
  await deleteDir(classSubDir);
  // Delete the class JSON file
  return deleteFile(classPath(slug, classId));
}

export async function getClassByJoinCode(
  slug: string,
  code: string
): Promise<DashboardClass | null> {
  const classes = await listClasses(slug);
  return classes.find((c) => c.joinCode === code.toUpperCase()) || null;
}

// ── Students ────────────────────────────────────────────────────

export async function listStudents(
  slug: string,
  classId: string
): Promise<Student[]> {
  const dir = studentsDir(slug, classId);
  const files = await listJsonFiles(dir);
  const items: Student[] = [];
  for (const file of files) {
    const raw = await readJson<Record<string, unknown>>(path.join(dir, file));
    if (!raw) continue;
    try {
      items.push(StudentSchema.parse(raw));
    } catch {
      continue;
    }
  }
  return items.sort(
    (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
  );
}

export async function getStudent(
  slug: string,
  classId: string,
  studentId: string
): Promise<Student | null> {
  const raw = await readJson<Record<string, unknown>>(
    studentPath(slug, classId, studentId)
  );
  if (!raw) return null;
  try {
    return StudentSchema.parse(raw);
  } catch {
    return null;
  }
}

export async function createStudent(
  slug: string,
  classId: string,
  data: { displayName: string; avatar: string }
): Promise<Student> {
  const id = nanoid(10);
  const now = new Date().toISOString();
  const student = StudentSchema.parse({
    id,
    classId,
    displayName: data.displayName,
    avatar: data.avatar,
    atelierSessionId: null,
    joinedAt: now,
  });
  await writeJson(studentPath(slug, classId, id), student);
  return student;
}

export async function updateStudent(
  slug: string,
  classId: string,
  studentId: string,
  data: Partial<Student>
): Promise<Student | null> {
  const existing = await getStudent(slug, classId, studentId);
  if (!existing) return null;
  const updated = StudentSchema.parse({
    ...existing,
    ...data,
    id: existing.id,
    classId: existing.classId,
    joinedAt: existing.joinedAt,
  });
  await writeJson(studentPath(slug, classId, studentId), updated);
  return updated;
}

export async function deleteStudent(
  slug: string,
  classId: string,
  studentId: string
): Promise<boolean> {
  // Cascade: also delete the linked atelier session
  const student = await getStudent(slug, classId, studentId);
  if (student?.atelierSessionId) {
    await deleteAtelierSession(slug, student.atelierSessionId);
  }
  return deleteFile(studentPath(slug, classId, studentId));
}

// ── Join class (student-side) ───────────────────────────────────

export async function joinClass(
  slug: string,
  classId: string,
  data: { displayName: string; avatar: string; level: string }
): Promise<{ student: Student; session: AtelierSession }> {
  // Step 1: Create atelier session first (most important resource)
  const session = await createAtelierSession(slug, {
    level: data.level as "primaire" | "college" | "lycee" | "fac",
  });

  // Step 2: Link session to class
  const linkedSession = await getAtelierSession(slug, session.id);
  if (linkedSession) {
    const updated = {
      ...linkedSession,
      classId,
      updatedAt: new Date().toISOString(),
    };
    await writeJson(atelierPath(slug, session.id), updated);
  }

  // Step 3: Create student linked to session
  const student = await createStudent(slug, classId, {
    displayName: data.displayName,
    avatar: data.avatar,
  });

  // Step 4: Link student to session + session to student
  await updateStudent(slug, classId, student.id, {
    atelierSessionId: session.id,
  });

  // Step 5: Update session with studentId
  const finalSession = await getAtelierSession(slug, session.id);
  if (finalSession) {
    const updated = {
      ...finalSession,
      studentId: student.id,
      updatedAt: new Date().toISOString(),
    };
    await writeJson(atelierPath(slug, session.id), updated);
  }

  return { student: { ...student, atelierSessionId: session.id }, session };
}

// ── Students with hydrated sessions (batch read) ────────────────

export type StudentWithSession = Student & {
  session: AtelierSession | null;
};

export async function getClassStudentsWithSessions(
  slug: string,
  classId: string
): Promise<StudentWithSession[]> {
  const students = await listStudents(slug, classId);
  // Batch: read all sessions in parallel to avoid N+1
  const sessionPromises = students.map((s) =>
    s.atelierSessionId
      ? getAtelierSession(slug, s.atelierSessionId)
      : Promise.resolve(null)
  );
  const sessions = await Promise.all(sessionPromises);
  return students.map((student, i) => ({
    ...student,
    session: sessions[i],
  }));
}

export async function getStudentWithSession(
  slug: string,
  classId: string,
  studentId: string
): Promise<StudentWithSession | null> {
  const student = await getStudent(slug, classId, studentId);
  if (!student) return null;
  let session: AtelierSession | null = null;
  if (student.atelierSessionId) {
    session = await getAtelierSession(slug, student.atelierSessionId);
  }
  return { ...student, session };
}

// ── Messages ────────────────────────────────────────────────────

export async function listMessages(
  slug: string,
  classId: string,
  studentId?: string
): Promise<TeacherMessage[]> {
  const dir = messagesDir(slug, classId);
  const files = await listJsonFiles(dir);
  const items: TeacherMessage[] = [];
  for (const file of files) {
    const raw = await readJson<Record<string, unknown>>(path.join(dir, file));
    if (!raw) continue;
    try {
      const msg = TeacherMessageSchema.parse(raw);
      if (studentId) {
        if (msg.targetStudentId === null || msg.targetStudentId === studentId) {
          items.push(msg);
        }
      } else {
        items.push(msg);
      }
    } catch {
      continue;
    }
  }
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createMessage(
  slug: string,
  classId: string,
  data: CreateMessage,
  validateRefs = true
): Promise<TeacherMessage> {
  // Validate targetStudentId exists if provided
  if (validateRefs && data.targetStudentId) {
    const student = await getStudent(slug, classId, data.targetStudentId);
    if (!student) {
      throw new Error("L'eleve cible n'existe pas");
    }
  }
  const id = nanoid(10);
  const now = new Date().toISOString();
  const msg = TeacherMessageSchema.parse({
    id,
    classId,
    targetStudentId: data.targetStudentId,
    content: data.content,
    chapterId: data.chapterId,
    stepId: data.stepId,
    createdAt: now,
  });
  await writeJson(messagePath(slug, classId, id), msg);
  return msg;
}

// ── Annotations ─────────────────────────────────────────────────

export async function listAnnotations(
  slug: string,
  classId: string,
  filters?: { studentId?: string; chapterId?: string }
): Promise<Annotation[]> {
  const dir = annotationsDir(slug, classId);
  const files = await listJsonFiles(dir);
  const items: Annotation[] = [];
  for (const file of files) {
    const raw = await readJson<Record<string, unknown>>(path.join(dir, file));
    if (!raw) continue;
    try {
      const ann = AnnotationSchema.parse(raw);
      if (filters?.studentId && ann.studentId !== filters.studentId) continue;
      if (filters?.chapterId && ann.chapterId !== filters.chapterId) continue;
      items.push(ann);
    } catch {
      continue;
    }
  }
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createAnnotation(
  slug: string,
  classId: string,
  data: CreateAnnotation,
  validateRefs = true
): Promise<Annotation> {
  // Validate student exists
  if (validateRefs) {
    const student = await getStudent(slug, classId, data.studentId);
    if (!student) {
      throw new Error("L'eleve n'existe pas");
    }
  }
  const id = nanoid(10);
  const now = new Date().toISOString();
  const ann = AnnotationSchema.parse({
    id,
    classId,
    studentId: data.studentId,
    sessionId: data.sessionId,
    chapterId: data.chapterId,
    stepId: data.stepId,
    content: data.content,
    type: data.type,
    createdAt: now,
  });
  await writeJson(annotationPath(slug, classId, id), ann);
  return ann;
}

// ── Live snapshot helpers (extract constants) ───────────────────

export { IDLE_MINUTES, STRUGGLING_SCORE_THRESHOLD, STRUGGLING_MIN_ANSWERS };
