import { NextResponse } from "next/server";
import { getAchievements } from "@/lib/storage/atelier-store";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const data = await getAchievements(slug);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[atelier] Get achievements error:", error);
    return NextResponse.json(
      { error: "Failed to get achievements" },
      { status: 500 }
    );
  }
}
