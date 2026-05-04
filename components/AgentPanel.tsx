interface AgentEntry {
  name: string;
  online: boolean;
}

interface AgentPanelProps {
  agents: AgentEntry[];
}

export default function AgentPanel({ agents }: AgentPanelProps) {
  return (
    <nav className="w-44 shrink-0 flex flex-col bg-bbos-surface border-r border-bbos-border font-mono text-[10px] uppercase tracking-widest z-40">
      <div className="px-4 py-3 border-b border-bbos-border">
        <div className="text-primary font-bold mb-0.5">AGENT ROSTER</div>
        <div className="text-bbos-dim text-[9px]">OPERATIONAL STATUS</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {agents.map((agent) => {
          const isActive = agent.name === "Claude";
          const wrapperClass = agent.online
            ? `border-l-2 border-primary px-3 py-2.5 flex items-center justify-between cursor-pointer ${isActive ? 'bg-primary/10' : 'hover:bg-bbos-panel transition-colors'}`
            : "border-l-2 border-transparent px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-bbos-panel transition-colors";
            
          const dotClass = agent.online ? "bg-green" : "bg-bbos-muted";
          const textClass = agent.online ? "text-primary" : "text-bbos-dim";
          const statusClass = agent.online ? "text-green" : "text-bbos-dim";

          return (
            <div key={agent.name} className={wrapperClass}>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${dotClass}`}></span>
                <span className={textClass}>{agent.name}</span>
              </div>
              <span className={`text-[8px] ${statusClass}`}>
                {agent.online ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-bbos-border bg-bbos-bg/60">
        <div className="flex justify-between mb-1 font-mono text-[9px]">
          <span className="text-bbos-dim">SYS LOAD</span>
          <span className="text-primary">42%</span>
        </div>
        <div className="w-full bg-bbos-border h-px">
          <div className="bg-primary h-full w-[42%]"></div>
        </div>
      </div>
    </nav>
  );
}
