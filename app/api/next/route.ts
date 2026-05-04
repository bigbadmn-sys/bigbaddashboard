import { NextResponse } from "next/server";
import { getNextActions, loadProjects } from "@/lib/parseMarkdown";
import { NEXT_ORDERING_KEYS, NEXT_ORDERING_RULES_VERSION, type CommandResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await loadProjects();
    const nextActions = getNextActions(projects);
    const payload: CommandResult<typeof nextActions> = {
      command: "/next",
      success: true,
      message: `Found ${nextActions.length} pending next action(s). Sort: status (Active→Paused→Blocked) → phase (Execute→…→Operate) → Last Updated (newer first) → path; checklist order within each file unchanged.`,
      data: nextActions,
      meta: {
        orderingRulesVersion: NEXT_ORDERING_RULES_VERSION,
        orderingKeys: NEXT_ORDERING_KEYS
      }
    };

    return NextResponse.json(payload);
  } catch (error) {
    const payload: CommandResult = {
      command: "/next",
      success: false,
      message: `Failed to load next actions: ${String(error)}`,
      meta: { orderingRulesVersion: NEXT_ORDERING_RULES_VERSION }
    };
    return NextResponse.json(payload, { status: 500 });
  }
}
