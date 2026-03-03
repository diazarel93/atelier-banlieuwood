import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getClass,
  updateClass,
  deleteClass,
} from "@/lib/storage/dashboard-store";

type Params = { params: Promise<{ slug: string; classId: string }> };

const UpdateClassSchema = z.object({
  name: z.string().min(1).optional(),
  teacherName: z.string().min(1).optional(),
});

export async function GET(_request: Request, { params }: Params) {
  const { slug, classId } = await params;
  const item = await getClass(slug, classId);
  if (!item) {
    return NextResponse.json({ error: "Classe introuvable" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { slug, classId } = await params;
    const body = await request.json();
    const data = UpdateClassSchema.parse(body);
    const item = await updateClass(slug, classId, data);
    if (!item) {
      return NextResponse.json(
        { error: "Classe introuvable" },
        { status: 404 }
      );
    }
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Donnees invalides" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { slug, classId } = await params;
  const deleted = await deleteClass(slug, classId);
  if (!deleted) {
    return NextResponse.json(
      { error: "Classe introuvable" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
