"use client";

import { FormEvent, useState } from "react";

interface CommandBarProps {
  onRun: (command: string) => Promise<void> | void;
  isRunning?: boolean;
}

export default function CommandBar({ onRun, isRunning = false }: CommandBarProps) {
  const [command, setCommand] = useState("/status");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!command.trim()) return;
    await onRun(command.trim());
  };

  return (
    <div className="w-72 shrink-0 flex flex-col">
      <div className="bg-bbos-surface px-4 py-1.5 border-b border-bbos-border shrink-0">
        <span className="font-mono text-[10px] text-bbos-subtext uppercase tracking-widest">COMMAND_INPUT</span>
      </div>
      <form onSubmit={handleSubmit} className="flex-1 p-3 flex flex-col gap-3 bg-bbos-bg/80">
        <div className="relative flex-1 flex items-center">
          <span className="absolute left-3 text-amber font-mono text-sm">&gt;</span>
          <input
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            placeholder="enter command..."
            disabled={isRunning}
            className="w-full h-10 bg-bbos-surface border border-bbos-border pl-8 pr-3 font-mono text-xs text-amber focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isRunning}
          className="bg-amber text-bbos-bg h-9 font-mono text-xs font-bold hover:brightness-110 active:brightness-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed w-full"
        >
          <span className="material-symbols-outlined text-[15px]">terminal</span>
          {isRunning ? "PROCESSING..." : "RUN_COMMAND"}
        </button>
      </form>
    </div>
  );
}
