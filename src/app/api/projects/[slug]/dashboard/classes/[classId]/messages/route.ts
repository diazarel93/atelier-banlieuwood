import { NextResponse } from "next/server";
import { listMessages, createMessage } from "@/lib/storage/dashboard-store";
import { CreateMessageSchema } from "@/lib/models/dashboard";

type Params = { params: Promise<{ slug: string; classId: string }> };

export async function GET(request: Request, { params }: Params) {
  const { slug, classId } = await params;
  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId") || undefined;
  const messages = await listMessages(slug, classId, studentId);
  return NextResponse.json(messages);
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { slug, classId } = await params;
    const body = await request.json();
    const data = CreateMessageSchema.parse(body);
    const msg = await createMessage(slug, classId, data);
    return NextResponse.json(msg, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid data" },
      { status: 400 }
    );
  }
}
