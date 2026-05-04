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

export interface CommandResult<T = unknown> {
  command: string;
  success: boolean;
  message: string;
  data?: T;
}
