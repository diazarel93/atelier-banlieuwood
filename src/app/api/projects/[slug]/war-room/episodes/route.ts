import { NextResponse } from "next/server";
import {
  listEpisodes,
  createEpisode,
} from "@/lib/storage/war-room-store";
import { CreateEpisodeSchema } from "@/lib/models/war-room";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const items = await listEpisodes(slug);
  return NextResponse.json(items);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const data = CreateEpisodeSchema.parse(body);
    const item = await createEpisode(slug, data);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid data" },
      { status: 400 }
    );
  }
}
