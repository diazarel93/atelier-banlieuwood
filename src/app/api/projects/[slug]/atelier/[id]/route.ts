import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getAtelierSession,
  updateAtelierSession,
  deleteAtelierSession,
} from "@/lib/storage/atelier-store";
import { ChapterProgressSchema, AtelierLevelSchema, GameConfigSchema } from "@/lib/models/atelier";

type Params = { params: Promise<{ slug: string; id: string }> };

const PatchAtelierSchema = z.object({
  chapters: z.array(ChapterProgressSchema).optional(),
  currentChapter: z.string().optional(),
  level: AtelierLevelSchema.optional(),
  totalScore: z.number().optional(),
  maxScore: z.number().optional(),
  gameConfig: GameConfigSchema.optional(),
}).strict();

export async function GET(_request: Request, { params }: Params) {
  const { slug, id } = await params;
  const item = await getAtelierSession(slug, id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { slug, id } = await params;
    const raw = await request.json().catch(() => null);
    if (!raw) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const body = PatchAtelierSchema.parse(raw);
    const updated = await updateAtelierSession(slug, id, body);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Donnees invalides", details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { slug, id } = await params;
  const deleted = await deleteAtelierSession(slug, id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
