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
  // fail with "local changes would be overwritten". We do our own minimal
  // stash/unstash and use `--ff-only` to avoid flaky rebase edge cases.
  const status = await runGit(["status", "--porcelain"]);
  const hasLocalChanges = Boolean((status.stdout || "").trim());

  let stashed = false;
  let pullOut = "";
  let popOut = "";

  try {
    if (hasLocalChanges) {
      const stashResult = await runGit(["stash", "push", "-u", "-m", "bbos-dashboard: /sync autostash"]);
      stashed = !/no local changes/i.test(`${stashResult.stdout} ${stashResult.stderr}`);
    }

    const pullResult = await runGit(["pull", "--ff-only", "origin", "main"]);
    pullOut = (pullResult.stdout || pullResult.stderr || "git pull completed").trim();
  } finally {
    if (stashed) {
      try {
        const popResult = await runGit(["stash", "pop"]);
        popOut = (popResult.stdout || popResult.stderr || "").trim();
      } catch (error) {
        popOut = `stash pop failed: ${String(error)}`;
      }
    }
  }

  return [pullOut, popOut].filter(Boolean).join("\n").trim();
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
