import { NextResponse } from "next/server";
import { getOverview } from "@/lib/storage/overview-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const overview = await getOverview(slug);
  return NextResponse.json(overview);
}
