"use client";

import { useState, useEffect } from "react";
import AgentPanel from "@/components/AgentPanel";
import CommandBar from "@/components/CommandBar";
import OutputPanel from "@/components/OutputPanel";
import ProjectCard from "@/components/ProjectCard";
import { ProjectData } from "@/lib/types";

type CommandApiResponse = {
  command: string;
  success: boolean;
  message: string;
  data?: unknown;
  meta?: unknown;
};

const KNOWN_COMMANDS = new Set(["/status", "/next", "/priority", "/capture", "/sync", "/update"]);

const AGENTS = [
  { name: "Claude", online: true },
  { name: "Cursor", online: true },
  { name: "Gemini", online: false },
  { name: "Antigravity", online: false },
  { name: "Qwen Local", online: false }
];

function commandToEndpoint(command: string): { endpoint: string; method: "GET" | "POST"; body?: unknown } {
  const [name, ...args] = command.trim().split(" ");
  const normalized = name.toLowerCase();

  if (normalized === "/capture") {
    return {
      endpoint: "/api/capture",
      method: "POST",
      body: { text: args.join(" ").trim() }
    };
  }

  const endpoint = normalized.replace(/^\//, "");
  const method = normalized === "/sync" || normalized === "/update" ? "POST" : "GET";
  return { endpoint: `/api/${endpoint}`, method };
}

function formatChicagoWallClock(now: Date): string {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const parts = Object.fromEntries(dtf.formatToParts(now).map((p) => [p.type, p.value]));

  // Infer whether Chicago is currently observing DST (CDT) vs standard time (CST)
  const year = Number(parts.year);
  const jan = new Date(Date.UTC(year, 0, 15, 12, 0, 0));
  const jul = new Date(Date.UTC(year, 6, 15, 12, 0, 0));
  const stdOffsetMinutes = Math.min(offsetMinutesForChicago(jan), offsetMinutesForChicago(jul));
  const nowOffsetMinutes = offsetMinutesForChicago(now);
  const isDst = nowOffsetMinutes !== stdOffsetMinutes;
  const tzLabel = isDst ? "CDT" : "CST";

  return `${parts.year}.${parts.month}.${parts.day} // ${parts.hour}:${parts.minute}:${parts.second} ${tzLabel}`;
}

function offsetMinutesForChicago(date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const p = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  const asUTC = new Date(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`);

  return (date.getTime() - asUTC.getTime()) / 60000;
}

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [output, setOutput] = useState("Run /status to load project data.");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateClock = () => {
      setTimeStr(formatChicagoWallClock(new Date()));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  async function runCommand(command: string) {
    const trimmed = command.trim();
    const cmdName = trimmed.split(/\s+/)[0]?.toLowerCase() ?? "";

    if (!KNOWN_COMMANDS.has(cmdName)) {
      const payload: CommandApiResponse = {
        command: cmdName || "(empty)",
        success: false,
        message: cmdName ? `Unknown command: ${cmdName}` : "No command provided."
      };
      setErrorMessage(payload.message);
      setOutput(JSON.stringify(payload, null, 2));
      return;
    }

    if (/^\/update(\s|$)/i.test(trimmed)) {
      const ok = window.confirm(
        "Run /update? This will git add, commit, and push in BBOS_CONTEXT_PATH (bbos-context)."
      );
      if (!ok) return;
    }

    setIsRunning(true);
    try {
      setErrorMessage(null);
      const { endpoint, method, body } = commandToEndpoint(command);
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });

      const result = (await response.json()) as CommandApiResponse;

      if (/^\/status(\s|$)/i.test(trimmed) && result.success && Array.isArray(result.data)) {
        setProjects(result.data as ProjectData[]);
      }

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || "Unknown error");
      }
      setOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      setErrorMessage(String(error));
      setOutput(JSON.stringify({ command, success: false, message: String(error) }, null, 2));
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="bg-bbos-bg text-bbos-text font-sans overflow-hidden h-screen flex flex-col select-none relative">
      <div className="scanline-sweep"></div>
      
      {/* ZONE 1: Top Bar */}
      <header className="bg-bbos-surface border-b border-bbos-border flex items-center justify-between px-4 h-11 z-50 shrink-0">
        <div className="flex items-center gap-6">
          <span className="font-mono font-black text-primary tracking-widest text-base">BBOS</span>
          <div className="hidden md:flex items-center gap-1 text-bbos-subtext font-mono text-[10px] tracking-wider">
            <span className="material-symbols-outlined text-[12px]">schedule</span>
            <span>{timeStr || "----.--.-- // --:--:-- --"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isRunning}
            onClick={() => void runCommand("/sync")}
            className="px-3 py-1 border border-primary text-primary font-mono text-xs font-bold hover:bg-primary/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          >
            SYNC
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => void runCommand("/update")}
            className="px-3 py-1 bg-amber text-bbos-bg font-mono text-xs font-bold hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
          >
            UPDATE
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ZONE 2: Agent Sidebar */}
        <AgentPanel agents={AGENTS} />

        {/* ZONE 3 + 4: Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-bbos-bg relative z-40">
          
          {/* Zone 3: Project Cards */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {projects.length === 0 ? (
                <div className="border border-bbos-border bg-bbos-panel p-4 text-sm text-bbos-subtext font-mono uppercase col-span-full">
                  No projects loaded. Run /status.
                </div>
              ) : (
                projects.map((project) => <ProjectCard key={project.sourceFile} project={project} />)
              )}
            </div>
          </div>

          {/* Zone 4: Bottom Split Panel */}
          <div className="h-44 border-t border-bbos-border flex shrink-0 flex-col sm:flex-row">
            <OutputPanel output={output} errorMessage={errorMessage} />
            <CommandBar onRun={runCommand} isRunning={isRunning} />
          </div>

        </main>
      </div>

      {/* Footer / Command Bar */}
      <footer className="h-9 flex items-center justify-between px-4 bg-bbos-surface border-t border-bbos-border font-mono text-[10px] uppercase tracking-widest shrink-0 z-50">
        <div className="text-bbos-dim">BBOS TERMINAL V1.0.4</div>
        <div className="flex gap-5 items-center">
          <button onClick={() => void runCommand("/status")} className="cmd-link text-bbos-subtext hover:text-primary transition-colors">/STATUS</button>
          <button onClick={() => void runCommand("/next")} className="cmd-link text-bbos-subtext hover:text-primary transition-colors">/NEXT</button>
          <button onClick={() => void runCommand("/priority")} className="cmd-link text-bbos-subtext hover:text-primary transition-colors">/PRIORITY</button>
          <button
            onClick={() => void runCommand("/capture Quick capture from footer")}
            className="cmd-link text-bbos-subtext hover:text-primary transition-colors"
          >
            /CAPTURE
          </button>
          <button onClick={() => void runCommand("/sync")} className="cmd-link text-bbos-subtext hover:text-primary transition-colors">/SYNC</button>
          <button onClick={() => void runCommand("/update")} className="cmd-link active text-amber transition-colors">/UPDATE</button>
        </div>
      </footer>
    </div>
  );
}
