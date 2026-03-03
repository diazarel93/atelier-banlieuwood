import { NextResponse } from "next/server";
import {
  getCharacter,
  updateCharacter,
  deleteCharacter,
} from "@/lib/storage/character-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const character = await getCharacter(slug, id);
  if (!character) {
    return NextResponse.json(
      { error: "Character not found" },
      { status: 404 }
    );
  }
  return NextResponse.json(character);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const body = await request.json();
  const updated = await updateCharacter(slug, id, body);
  if (!updated) {
    return NextResponse.json(
      { error: "Character not found" },
      { status: 404 }
    );
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const deleted = await deleteCharacter(slug, id);
  if (!deleted) {
    return NextResponse.json(
      { error: "Character not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true });
}
