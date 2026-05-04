import { ProjectData } from "@/lib/types";

interface ProjectCardProps {
  project: ProjectData;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const firstPendingAction = project.nextSteps.find((item) => !item.completed)?.text || "No pending actions";

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
      <div className={`bg-bbos-raised px-3 py-1.5 flex justify-between items-center border-b ${isBlocked ? 'border-danger/20' : 'border-bbos-border'}`}>
        <span className="font-mono text-[9px] text-bbos-subtext uppercase tracking-widest">COMMAND_MODULE</span>
        <span className={`material-symbols-outlined text-[14px] cursor-pointer transition-colors ${isActive ? 'text-bbos-dim hover:text-primary' : isBlocked ? 'text-bbos-dim hover:text-danger' : 'text-bbos-dim hover:text-bbos-subtext'}`}>more_vert</span>
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
          <div className="flex justify-between font-mono text-[10px] gap-2">
            <span className="text-bbos-subtext shrink-0">NEXT</span>
            <span className="text-bbos-text text-right truncate" title={firstPendingAction}>{firstPendingAction}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
