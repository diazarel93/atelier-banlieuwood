import { NextResponse } from "next/server";
import {
  listAtelierSessions,
  createAtelierSession,
} from "@/lib/storage/atelier-store";
import { CreateAtelierSchema } from "@/lib/models/atelier";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const items = await listAtelierSessions(slug);
  return NextResponse.json(items);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const data = CreateAtelierSchema.parse(body);
    const item = await createAtelierSession(slug, data);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid data" },
      { status: 400 }
    );
  }
}
