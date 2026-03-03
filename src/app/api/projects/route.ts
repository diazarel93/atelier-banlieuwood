import { NextResponse } from "next/server";
import { listProjects, createProject } from "@/lib/storage/project-store";
import { CreateProjectSchema } from "@/lib/models/project";

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = CreateProjectSchema.parse(body);
    const project = await createProject(data);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid data" },
      { status: 400 }
    );
  }
}
