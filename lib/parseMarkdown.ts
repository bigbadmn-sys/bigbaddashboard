import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { ProjectData } from "@/lib/types";

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

  for (const project of projects) {
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
