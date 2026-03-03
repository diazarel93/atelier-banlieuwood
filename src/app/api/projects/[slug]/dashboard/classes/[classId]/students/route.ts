import { NextResponse } from "next/server";
import { getClassStudentsWithSessions } from "@/lib/storage/dashboard-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; classId: string }> }
) {
  const { slug, classId } = await params;
  const students = await getClassStudentsWithSessions(slug, classId);
  return NextResponse.json(students);
}
