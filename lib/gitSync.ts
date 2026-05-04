import { execFile } from "child_process";
import { promisify } from "util";
import { getContextPath } from "@/lib/parseMarkdown";

const execFileAsync = promisify(execFile);

async function runGit(args: string[]): Promise<{ stdout: string; stderr: string }> {
  const contextPath = getContextPath();
  return execFileAsync("git", args, { cwd: contextPath });
}

export async function syncContext(): Promise<string> {
  const result = await runGit(["pull"]);
  return (result.stdout || result.stderr || "git pull completed").trim();
}

export async function updateContext(message?: string): Promise<string> {
  const now = new Date();
  const fallbackMessage = `bbos: dashboard update ${now.toISOString()}`;
  const commitMessage = message?.trim() || fallbackMessage;

  await runGit(["add", "-A"]);

  let commitOutput = "";
  try {
    await runGit(["commit", "-m", commitMessage]);
    commitOutput = "Committed changes.";
  } catch (error: unknown) {
    const stderr =
      typeof error === "object" && error !== null && "stderr" in error
        ? String((error as { stderr?: string }).stderr || "")
        : "";
    const combined = `${String(error)} ${stderr}`.toLowerCase();

    if (!combined.includes("nothing to commit") && !combined.includes("no changes added to commit")) {
      throw error;
    }
    commitOutput = "No changes to commit.";
  }

  const pushResult = await runGit(["push"]);
  const pushOutput = (pushResult.stdout || pushResult.stderr || "git push completed").trim();
  return `${commitOutput} ${pushOutput}`.trim();
}
