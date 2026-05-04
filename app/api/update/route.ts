import { NextResponse } from "next/server";
import { updateContext } from "@/lib/gitSync";
import type { CommandResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { message?: string };
    const output = await updateContext(body.message);
    const payload: CommandResult<{ output: string }> = {
      command: "/update",
      success: true,
      message: "Update completed.",
      data: { output }
    };

    return NextResponse.json(payload);
  } catch (error) {
    const payload: CommandResult = {
      command: "/update",
      success: false,
      message: `Update failed: ${String(error)}`
    };
    return NextResponse.json(payload, { status: 500 });
  }
}
