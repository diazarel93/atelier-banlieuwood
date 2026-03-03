import { NextResponse } from "next/server";
import {
  getStudentWithSession,
  deleteStudent,
} from "@/lib/storage/dashboard-store";

type Params = {
  params: Promise<{ slug: string; classId: string; studentId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { slug, classId, studentId } = await params;
  const student = await getStudentWithSession(slug, classId, studentId);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }
  return NextResponse.json(student);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { slug, classId, studentId } = await params;
  const deleted = await deleteStudent(slug, classId, studentId);
  if (!deleted) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
