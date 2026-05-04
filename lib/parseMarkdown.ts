import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { ProjectData } from "@/lib/types";

/** Lower = earlier in queue. Active work before paused/blocked. */
const STATUS_RANK: Record<string, number> = {
  Active: 0,
  Paused: 1,
  Blocked: 2,
  Unknown: 3
};

/** Lower = earlier. Execute beats planning/ops for “what do I do now”. */
const PHASE_RANK: Record<string, number> = {
  Execute: 0,
  Plan: 1,
  Iterate: 2,
  Operate: 3,
  Unknown: 4
};

function statusRank(status: string): number {
  return STATUS_RANK[status] ?? STATUS_RANK.Unknown;
}

function phaseRank(phase: string): number {
  return PHASE_RANK[phase] ?? PHASE_RANK.Unknown;
}

/** Parse YYYY-MM-DD from Last Updated line; 0 if missing/invalid. */
function lastUpdatedSortKey(lastUpdated: string): number {
  const match = lastUpdated.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return 0;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/**
 * Stable ordering for `/next` and `/priority`:
 * 1. Status: Active → Paused → Blocked → (other)
 * 2. Phase: Execute → Plan → Iterate → Operate → (other)
 * 3. Last Updated: newer first (ties broken by path)
 * 4. sourceFile: ascending (deterministic across machines)
 */
export function sortProjectsForNextQueue(projects: ProjectData[]): ProjectData[] {
  return [...projects].sort((a, b) => {
    const byStatus = statusRank(a.status) - statusRank(b.status);
    if (byStatus !== 0) return byStatus;

    const byPhase = phaseRank(a.phase) - phaseRank(b.phase);
    if (byPhase !== 0) return byPhase;

    const aTime = lastUpdatedSortKey(a.lastUpdated);
    const bTime = lastUpdatedSortKey(b.lastUpdated);
    if (bTime !== aTime) return bTime - aTime;

    return a.sourceFile.localeCompare(b.sourceFile, "en");
  });
}

function normalizePath(inputPath: string): string {
  if (inputPath.startsWith("~/")) {
    return path.join(os.homedir(), inputPath.slice(2));
  }

  return inputPath;
}

export function getContextPath(): string {
  return normalizePath(process.env.BBOS_CONTEXT_PATH || "~/bbos-context");
}

function extractSection(markdown: string, sectionTitle: string): string {
  const escaped = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`##\\s+${escaped}\\n([\\s\\S]*?)(\\n##\\s+|$)`, "i");
  const match = markdown.match(regex);
  return match?.[1]?.trim() || "";
}

function extractMetadata(markdown: string, key: string): string {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\*\\*${escaped}:\\*\\*\\s*(.+)`, "i");
  return markdown.match(regex)?.[1]?.trim() || "Unknown";
}

function parseActionItems(sectionBody: string): ProjectData["nextSteps"] {
  return sectionBody
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- ["))
    .map((line) => ({
      completed: line.startsWith("- [x]"),
      text: line.replace(/^- \[[x ]\]\s*/i, "").trim()
    }))
    .filter((item) => item.text.length > 0);
}

function parseListItems(sectionBody: string): string[] {
  const items = sectionBody
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^- /, "").trim())
    .filter(Boolean);

  return items.length === 0 ? ["None"] : items;
}

export function parseProjectMarkdown(markdown: string, sourceFile: string): ProjectData {
  const headingMatch = markdown.match(/^#\s+(.+)$/m);
  const summary = extractSection(markdown, "Summary");
  const nextSteps = parseActionItems(extractSection(markdown, "Next Steps"));
  const blockers = parseListItems(extractSection(markdown, "Blockers"));
  const notes = extractSection(markdown, "Notes");

  return {
    name: headingMatch?.[1]?.trim() || path.basename(sourceFile, ".md"),
    phase: extractMetadata(markdown, "Phase") as ProjectData["phase"],
    status: extractMetadata(markdown, "Status") as ProjectData["status"],
    lastUpdated: extractMetadata(markdown, "Last Updated"),
    summary,
    nextSteps,
    blockers,
    notes,
    sourceFile
  };
}

export async function loadProjects(): Promise<ProjectData[]> {
  const contextPath = getContextPath();
  const projectsPath = path.join(contextPath, "projects");
  const entries = await fs.readdir(projectsPath, { withFileTypes: true });
  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .filter((file) => !/template/i.test(file));

  const projects = await Promise.all(
    markdownFiles.map(async (fileName) => {
      const filePath = path.join(projectsPath, fileName);
      const markdown = await fs.readFile(filePath, "utf8");
      return parseProjectMarkdown(markdown, filePath);
    })
  );

  return projects;
}

export function getNextActions(projects: ProjectData[]): { project: string; action: string }[] {
  const actions: { project: string; action: string }[] = [];
  const ordered = sortProjectsForNextQueue(projects);

  for (const project of ordered) {
    for (const item of project.nextSteps) {
      if (!item.completed) {
        actions.push({ project: project.name, action: item.text });
      }
    }
  }

  return actions;
}

export function getPriorityAction(projects: ProjectData[]): { project: string; action: string } | null;
export function getPriorityAction(projects: ProjectData[]): { project: string; action: string } | null {
  const nextActions = getNextActions(projects);
  return nextActions.length > 0 ? nextActions[0] : null;
}

export async function appendInboxCapture(text: string): Promise<string> {
  const contextPath = getContextPath();
  const inboxPath = path.join(contextPath, "inbox.md");
  const timestamp = new Date().toISOString();
  const line = `- ${timestamp} ${text.trim()}\n`;
  await fs.appendFile(inboxPath, line, "utf8");
  return inboxPath;
}
