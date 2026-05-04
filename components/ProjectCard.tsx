import { ProjectData } from "@/lib/types";

interface ProjectCardProps {
  project: ProjectData;
}

const NEXT_PREVIEW_MAX = 90;

function truncateWithEllipsis(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

/** Strip optional leading `- ` from parsed blocker lines. */
function normalizeBlockerEntry(raw: string): string {
  return raw.replace(/^-\s*/, "").trim();
}

/**
 * "No blockers" = empty list, or exactly one entry that is case-insensitive `none`
 * (after trim / optional `- ` strip).
 */
function isEffectivelyNoBlockers(blockers: string[]): boolean {
  if (blockers.length === 0) return true;
  if (blockers.length !== 1) return false;
  return normalizeBlockerEntry(blockers[0]).toLowerCase() === "none";
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const pending = project.nextSteps.find((item) => !item.completed);
  const hasPendingNext = Boolean(pending?.text);
  const nextFull = pending?.text ?? "";
  const nextDisplay = hasPendingNext ? truncateWithEllipsis(nextFull, NEXT_PREVIEW_MAX) : "NO_PENDING_NEXT";

  const blockerCount = isEffectivelyNoBlockers(project.blockers) ? 0 : project.blockers.length;

  const isBlocked = project.status.toLowerCase() === "blocked";
  const isPaused = project.status.toLowerCase() === "paused";
  const isActive = !isBlocked && !isPaused;

  const dotColorClass = isActive ? "bg-primary" : isBlocked ? "bg-danger" : "bg-bbos-muted";
  const textColorClass = isActive ? "text-primary" : isBlocked ? "text-danger" : "text-bbos-dim";

  let wrapperClass = "border bg-bbos-panel transition-colors group flex flex-col";
  if (isActive) wrapperClass += " border-bbos-border border-l-2 border-l-primary hover:border-primary/40";
  else if (isBlocked) wrapperClass += " border-danger/30 hover:border-danger/60";
  else wrapperClass += " border-bbos-border hover:border-bbos-muted/60";

  return (
    <div className={wrapperClass}>
      <div
        className={`bg-bbos-raised px-3 py-1.5 flex justify-between items-center border-b ${isBlocked ? "border-danger/20" : "border-bbos-border"}`}
      >
        <span className="font-mono text-[9px] text-bbos-subtext uppercase tracking-widest">COMMAND_MODULE</span>
        <div className="flex items-center gap-2">
          {blockerCount > 0 ? (
            <span
              role="status"
              className="font-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-danger/50 bg-danger/15 text-danger"
              aria-label={`${blockerCount} blocker${blockerCount === 1 ? "" : "s"} listed in project file`}
            >
              {blockerCount}_BLOCKERS
            </span>
          ) : null}
          <span
            className={`material-symbols-outlined text-[14px] cursor-pointer transition-colors ${isActive ? "text-bbos-dim hover:text-primary" : isBlocked ? "text-bbos-dim hover:text-danger" : "text-bbos-dim hover:text-bbos-subtext"}`}
          >
            more_vert
          </span>
        </div>
      </div>
      <div className="p-3 space-y-3">
        <div>
          <h3 className={`font-mono font-bold text-sm mb-1 ${textColorClass}`}>{project.name.toUpperCase()}</h3>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${dotColorClass}`}></span>
            <span className={`font-mono text-[10px] uppercase ${textColorClass}`}>STATUS: {project.status}</span>
          </div>
        </div>
        <div className="space-y-1.5 border-t border-bbos-border/60 pt-2.5">
          <div className="flex justify-between font-mono text-[10px]">
            <span className="text-bbos-subtext">PHASE</span>
            <span className="text-bbos-text font-medium uppercase">{project.phase}</span>
          </div>
          <div className="flex justify-between font-mono text-[10px] gap-2 min-w-0">
            <span className="text-bbos-subtext shrink-0">NEXT</span>
            {hasPendingNext ? (
              <span className="text-bbos-text text-right min-w-0 break-words" title={nextFull}>
                {nextDisplay}
              </span>
            ) : (
              <span className="text-bbos-dim text-right uppercase tracking-wide" aria-label="No unchecked next steps">
                {nextDisplay}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
