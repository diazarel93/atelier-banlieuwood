import { NextResponse } from "next/server";
import {
  getUniverse,
  addLocation,
  updateLocation,
  deleteLocation,
  addRule,
  deleteRule,
  addTimelineEvent,
  deleteTimelineEvent,
} from "@/lib/storage/universe-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const universe = await getUniverse(slug);
  return NextResponse.json(universe);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case "location": {
        const loc = await addLocation(slug, data);
        return NextResponse.json(loc, { status: 201 });
      }
      case "rule": {
        const rule = await addRule(slug, data);
        return NextResponse.json(rule, { status: 201 });
      }
      case "timeline": {
        const event = await addTimelineEvent(slug, data);
        return NextResponse.json(event, { status: 201 });
      }
      default:
        return NextResponse.json(
          { error: `Unknown type: ${type}` },
          { status: 400 }
        );
    }
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
    const { type, id, ...data } = body;

    if (type === "location") {
      const updated = await updateLocation(slug, id, data);
      if (!updated) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
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
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json(
      { error: "type and id are required" },
      { status: 400 }
    );
  }

  let deleted = false;
  switch (type) {
    case "location":
      deleted = await deleteLocation(slug, id);
      break;
    case "rule":
      deleted = await deleteRule(slug, id);
      break;
    case "timeline":
      deleted = await deleteTimelineEvent(slug, id);
      break;
  }

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
