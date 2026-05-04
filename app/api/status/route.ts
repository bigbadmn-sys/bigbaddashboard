import { NextResponse } from "next/server";
import { loadProjects } from "@/lib/parseMarkdown";
import type { CommandResult, ProjectData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await loadProjects();
    const payload: CommandResult<ProjectData[]> = {
      command: "/status",
      success: true,
      message: `Loaded ${projects.length} project(s).`,
      data: projects
    };

    return NextResponse.json(payload);
  } catch (error) {
    const payload: CommandResult = {
      command: "/status",
      success: false,
      message: `Failed to load project status: ${String(error)}`
    };
    return NextResponse.json(payload, { status: 500 });
  }
}
