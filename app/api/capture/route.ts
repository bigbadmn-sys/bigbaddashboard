import { NextResponse } from "next/server";
import { appendInboxCapture } from "@/lib/parseMarkdown";
import type { CommandResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string };
    const text = body?.text?.trim();

    if (!text) {
      return NextResponse.json(
        {
          command: "/capture",
          success: false,
          message: "Capture text is required."
        } satisfies CommandResult,
        { status: 400 }
      );
    }

    const filePath = await appendInboxCapture(text);
    const payload: CommandResult<{ filePath: string }> = {
      command: "/capture",
      success: true,
      message: "Captured to inbox.",
      data: { filePath }
    };
    return NextResponse.json(payload);
  } catch (error) {
    const payload: CommandResult = {
      command: "/capture",
      success: false,
      message: `Capture failed: ${String(error)}`
    };
    return NextResponse.json(payload, { status: 500 });
  }
}
