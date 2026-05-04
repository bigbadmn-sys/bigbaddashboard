import { useEffect, useState } from "react";

interface OutputPanelProps {
  output: string;
  errorMessage?: string | null;
}

export default function OutputPanel({ output, errorMessage }: OutputPanelProps) {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTimeStr(time);
  }, [output]); // Update timestamp when output changes

  return (
    <div className="flex-1 flex flex-col border-r border-bbos-border min-w-0">
      <div className="bg-bbos-surface px-4 py-1.5 border-b border-bbos-border flex justify-between items-center shrink-0">
        <span className="font-mono text-[10px] text-bbos-subtext uppercase tracking-widest">TERMINAL_FEED</span>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-bbos-border block"></span>
          <span className="w-2 h-2 bg-bbos-border block"></span>
        </div>
      </div>
      <div className="flex-1 p-3 font-mono text-[12px] text-primary/80 overflow-y-auto bg-bbos-bg/80 space-y-1">
        <div className="flex gap-3">
          <span className="text-bbos-dim shrink-0">[{timeStr || "00:00:00"}]</span>
          {errorMessage ? (
            <span className="whitespace-pre-wrap break-all text-[#ff4444]">ERROR: {errorMessage}</span>
          ) : (
            <span className="text-primary whitespace-pre-wrap break-all">{output}</span>
          )}
        </div>
        <div className="flex items-center gap-0 mt-2">
          <span className="text-bbos-dim">$&nbsp;</span>
          <span className="inline-block w-2 h-3.5 bg-amber cursor-blink"></span>
        </div>
      </div>
    </div>
  );
}
