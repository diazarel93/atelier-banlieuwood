import { NextResponse } from "next/server";
import {
  listRelationships,
  createRelationship,
  updateRelationship,
  deleteRelationship,
} from "@/lib/storage/relationship-store";
import { CreateRelationshipSchema } from "@/lib/models/relationship";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const relationships = await listRelationships(slug);
  return NextResponse.json(relationships);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const data = CreateRelationshipSchema.parse(body);
    const relationship = await createRelationship(slug, data);
    return NextResponse.json(relationship, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid data" },
      { status: 400 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }
    const updated = await updateRelationship(slug, id, data);
    if (!updated) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid data" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const deleted = await deleteRelationship(slug, id);
  if (!deleted) {
    return NextResponse.json(
      { error: "Relationship not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true });
}
