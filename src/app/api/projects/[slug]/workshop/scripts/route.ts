import { NextResponse } from "next/server";
import { listScripts, createScript } from "@/lib/storage/workshop-store";
import { CreateScriptSchema } from "@/lib/models/workshop";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const items = await listScripts(slug);
  return NextResponse.json(items);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const data = CreateScriptSchema.parse(body);
    const item = await createScript(slug, data);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid data" },
      { status: 400 }
    );
  }
}
