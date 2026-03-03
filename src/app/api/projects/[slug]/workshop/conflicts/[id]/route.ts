import { NextResponse } from "next/server";
import {
  getConflict,
  updateConflict,
  deleteConflict,
} from "@/lib/storage/workshop-store";

type Params = { params: Promise<{ slug: string; id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug, id } = await params;
  const item = await getConflict(slug, id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PATCH(request: Request, { params }: Params) {
  const { slug, id } = await params;
  const body = await request.json();
  const updated = await updateConflict(slug, id, body);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { slug, id } = await params;
  const deleted = await deleteConflict(slug, id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
