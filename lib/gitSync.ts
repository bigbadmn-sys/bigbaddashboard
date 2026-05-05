import { execFile } from "child_process";
import { promisify } from "util";
import { getContextPath } from "@/lib/parseMarkdown";

const execFileAsync = promisify(execFile);

async function runGit(args: string[]): Promise<{ stdout: string; stderr: string }> {
  const contextPath = getContextPath();
  return execFileAsync("git", args, { cwd: contextPath });
}

export async function syncContext(): Promise<string> {
  // `/capture` commonly changes `inbox.md`, which can make a plain `git pull`
  // fail with "local changes would be overwritten". Autostash keeps `/sync`
  // usable without forcing users to run `/update` first.
  // Be explicit about remote/branch to avoid edge cases where git thinks the
  // branch has multiple upstreams ("Cannot rebase onto multiple branches.").
  const result = await runGit(["pull", "--rebase", "--autostash", "origin", "main"]);
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
