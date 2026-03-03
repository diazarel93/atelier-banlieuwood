import { NextResponse } from "next/server";
import { getClassByJoinCode, joinClass } from "@/lib/storage/dashboard-store";
import { JoinClassSchema } from "@/lib/models/dashboard";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const data = JoinClassSchema.parse(body);

    const cls = await getClassByJoinCode(slug, data.joinCode);
    if (!cls) {
      return NextResponse.json(
        { error: "Code de classe invalide" },
        { status: 404 }
      );
    }

    const { student, session } = await joinClass(slug, cls.id, {
      displayName: data.displayName,
      avatar: data.avatar,
      level: data.level,
    });

    return NextResponse.json(
      {
        classId: cls.id,
        className: cls.name,
        studentId: student.id,
        sessionId: session.id,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid data" },
      { status: 400 }
    );
  }
}
