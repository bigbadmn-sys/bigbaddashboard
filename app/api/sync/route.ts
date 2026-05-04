import { NextResponse } from "next/server";
import { syncContext } from "@/lib/gitSync";
import type { CommandResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const output = await syncContext();
    const payload: CommandResult<{ output: string }> = {
      command: "/sync",
      success: true,
      message: "Sync completed.",
      data: { output }
    };

    return NextResponse.json(payload);
  } catch (error) {
    const payload: CommandResult = {
      command: "/sync",
      success: false,
      message: `Sync failed: ${String(error)}`
    };
    return NextResponse.json(payload, { status: 500 });
  }
}
