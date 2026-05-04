import { NextResponse } from "next/server";
import { getNextActions, loadProjects } from "@/lib/parseMarkdown";
import type { CommandResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await loadProjects();
    const nextActions = getNextActions(projects);
    const payload: CommandResult<typeof nextActions> = {
      command: "/next",
      success: true,
      message: `Found ${nextActions.length} pending next action(s).`,
      data: nextActions
    };

    return NextResponse.json(payload);
  } catch (error) {
    const payload: CommandResult = {
      command: "/next",
      success: false,
      message: `Failed to load next actions: ${String(error)}`
    };
    return NextResponse.json(payload, { status: 500 });
  }
}
