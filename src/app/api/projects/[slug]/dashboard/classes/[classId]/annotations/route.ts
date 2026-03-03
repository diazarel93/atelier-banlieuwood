import { NextResponse } from "next/server";
import {
  listAnnotations,
  createAnnotation,
} from "@/lib/storage/dashboard-store";
import { CreateAnnotationSchema } from "@/lib/models/dashboard";

type Params = { params: Promise<{ slug: string; classId: string }> };

export async function GET(request: Request, { params }: Params) {
  const { slug, classId } = await params;
  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId") || undefined;
  const chapterId = url.searchParams.get("chapterId") || undefined;
  const annotations = await listAnnotations(slug, classId, {
    studentId,
    chapterId,
  });
  return NextResponse.json(annotations);
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { slug, classId } = await params;
    const body = await request.json();
    const data = CreateAnnotationSchema.parse(body);
    const ann = await createAnnotation(slug, classId, data);
    return NextResponse.json(ann, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid data" },
      { status: 400 }
    );
  }
}
