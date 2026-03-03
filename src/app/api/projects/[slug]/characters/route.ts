import { NextResponse } from "next/server";
import {
  listCharacters,
  createCharacter,
} from "@/lib/storage/character-store";
import { CreateCharacterSchema } from "@/lib/models/character";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const characters = await listCharacters(slug);
  return NextResponse.json(characters);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const data = CreateCharacterSchema.parse(body);
    const character = await createCharacter(slug, data);
    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid data" },
      { status: 400 }
    );
  }
}
