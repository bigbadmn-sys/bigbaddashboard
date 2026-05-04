import { NextResponse } from "next/server";
import { getPriorityAction, loadProjects } from "@/lib/parseMarkdown";
import type { CommandResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await loadProjects();
    const priority = getPriorityAction(projects);

    const payload: CommandResult<typeof priority> = {
      command: "/priority",
      success: true,
      message: priority
        ? `Top priority: ${priority.project} — ${priority.action}`
        : "No pending priority action found.",
      data: priority
    };

    return NextResponse.json(payload);
  } catch (error) {
    const payload: CommandResult = {
      command: "/priority",
      success: false,
      message: `Failed to load priority: ${String(error)}`
    };
    return NextResponse.json(payload, { status: 500 });
  }
}
