import { NextResponse } from "next/server";
import {
  listTableReads,
  createTableRead,
} from "@/lib/storage/workshop-store";
import { CreateTableReadSchema } from "@/lib/models/workshop";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const items = await listTableReads(slug);
  return NextResponse.json(items);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const data = CreateTableReadSchema.parse(body);
    const item = await createTableRead(slug, data);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid data" },
      { status: 400 }
    );
  }
}
