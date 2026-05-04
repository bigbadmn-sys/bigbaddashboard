export type ProjectPhase = "Execute" | "Plan" | "Iterate" | "Operate" | "Unknown";
export type ProjectStatus = "Active" | "Blocked" | "Paused" | "Unknown";

export interface ProjectActionItem {
  text: string;
  completed: boolean;
}

export interface ProjectData {
  name: string;
  phase: ProjectPhase;
  status: ProjectStatus;
  lastUpdated: string;
  summary: string;
  nextSteps: ProjectActionItem[];
  blockers: string[];
  notes: string;
  sourceFile: string;
}

/**
 * Bump when `/next` and `/priority` shared sort rules
 * (`sortProjectsForNextQueue` in `lib/parseMarkdown.ts`) change.
 */
export const NEXT_ORDERING_RULES_VERSION = 1;

/** Keys applied in order for the next-action queue (see `sortProjectsForNextQueue`). */
export const NEXT_ORDERING_KEYS = [
  "status",
  "phase",
  "lastUpdatedDesc",
  "sourceFilePath"
] as const;

export interface CommandResult<T = unknown> {
  command: string;
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}
