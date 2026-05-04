# BBOS Dashboard — Phase 1 Specification
**Version:** 1.0 | **Date:** 2026-05-04 | **Status:** Ready for Agent Execution

---

## 1. What We're Building

A local-first, command-driven dashboard that serves as the central nervous system for BigBadOperatingSystem (BBOS). It surfaces project status, executes commands, and syncs with the `bbos-context` git repo — all from a single browser tab running locally.

**Not in Phase 1:** Multi-agent orchestration logic, Mastra integration, OpenHarness backend, AI inference calls from the UI.

---

## 2. Technical Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | File-based routing, fast local dev, Cursor-native |
| Language | TypeScript | Type safety for agent consumption |
| Styling | Tailwind CSS | Utility-first, agent-legible |
| Data Layer | Local Markdown/JSON files | Agent-friendly, no database required |
| Sync | Git (`bbos-context` repo) | Existing protocol, all agents already use it |
| Runtime | Node.js 20+ | Local only — no cloud deployment in Phase 1 |

---

## 3. File Structure

```
/Users/robertburmaster/BigBadOperatingSystem/BigBadDashboard/
├── app/
│   ├── page.tsx              # Main dashboard view
│   ├── layout.tsx            # Root layout + sidebar
│   └── api/
│       ├── status/route.ts   # GET — reads project status files
│       ├── next/route.ts     # GET — returns prioritized next actions
│       └── sync/route.ts     # POST — runs git pull on bbos-context
├── components/
│   ├── CommandBar.tsx         # Input bar for slash commands
│   ├── ProjectCard.tsx        # Status card per project
│   ├── AgentPanel.tsx         # Agent roster + active assignments
│   └── OutputPanel.tsx        # Command output display
├── data/                      # Symlinked to ~/bbos-context
│   ├── projects/              # One .md file per project
│   ├── agents.md              # Mirrors ~/BigBadOperatingSystem/agents.md
│   └── status.md              # Current BBOS status
├── lib/
│   ├── parseMarkdown.ts       # Reads/writes .md files
│   └── gitSync.ts             # Wraps git pull/push
├── public/
└── package.json
```

---

## 4. Command Implementation (Phase 1)

These commands are parsed from the CommandBar and routed to the appropriate API or UI function:

| Command | Trigger | Action |
|---|---|---|
| `/status` | Type or click | Reads `data/projects/*.md`, renders ProjectCards |
| `/next` | Type or click | Parses "Next Steps" sections from all project files |
| `/priority` | Type or click | Returns first unchecked item across all projects |
| `/capture [text]` | Type | Appends to `data/inbox.md` with timestamp |
| `/sync` | Type or click | Calls `api/sync` → runs `git pull` on bbos-context |
| `/update` | Type or click | Triggers git commit + push with timestamp message |

**Not in Phase 1:** `/deploy`, `/analyze`, `/research`, `/fix`, `/kill` — these require agent integration (Phase 2).

---

## 5. Data Schema

### Project File (`data/projects/[project-name].md`)
```markdown
# [Project Name]
**Phase:** Execute | Plan | Iterate | Operate
**Status:** Active | Blocked | Paused
**Last Updated:** YYYY-MM-DD

## Summary
One paragraph description.

## Next Steps
- [ ] Action item 1
- [ ] Action item 2
- [x] Completed item

## Blockers
- None | Description of blocker

## Notes
Freeform notes.
```

### Status File (`data/status.md`)
```markdown
# BBOS Status
**Updated:** YYYY-MM-DD HH:MM CDT

## Active Projects
- [Project Name] — Phase — Status

## Top Priority
Single #1 next action across all projects.

## Blockers
List of current blockers.
```

---

## 6. UI Layout

```
┌─────────────────────────────────────────────────────┐
│  BBOS DASHBOARD          [Sync]  [Update]  Mon 05/04 │
├──────────────┬──────────────────────────────────────┤
│              │                                        │
│  AGENTS      │  PROJECT CARDS (grid)                 │
│  ─────────   │  ┌──────────┐ ┌──────────┐           │
│  Claude ●    │  │ Project A│ │ Project B│           │
│  Cursor ●    │  │ Execute  │ │ Blocked  │           │
│  Gemini ○    │  │ Next: .. │ │ Next: .. │           │
│  Antigravity │  └──────────┘ └──────────┘           │
│              │                                        │
├──────────────┴──────────────────────────────────────┤
│  OUTPUT PANEL                                         │
│  > /status output appears here                        │
├─────────────────────────────────────────────────────┤
│  > [CommandBar — type /command here]        [Run]    │
└─────────────────────────────────────────────────────┘
```

---

## 7. Agent Assignments

### Cursor — Core Build
Cursor owns the primary codebase. All file creation, routing, and component work.

**Deliverables:**
1. Next.js project scaffold with TypeScript + Tailwind
2. File system API routes (`/status`, `/next`, `/priority`, `/sync`, `/update`)
3. All components: CommandBar, ProjectCard, AgentPanel, OutputPanel
4. Markdown parser (`lib/parseMarkdown.ts`)
5. Git sync wrapper (`lib/gitSync.ts`)
6. Symlink or path config pointing `data/` → `~/bbos-context`
7. `.env.local` with `BBOS_CONTEXT_PATH` variable

**Cursor receives:** `CURSOR_PROMPT.md` (see Section 9A)

---

### Antigravity — UI Theme & Design System
Antigravity owns visual execution only — no logic, no routing.

**Deliverables:**
1. Custom Tailwind theme config (BigBad aesthetic: dark, high-density, monospace accents)
2. Styled versions of all 4 components (receives unstyled versions from Cursor via shared repo)
3. CSS variables and design tokens file
4. Responsive layout for CommandBar + OutputPanel

**Antigravity receives:** `ANTIGRAVITY_PROMPT.md` (see Section 9B)

**Dependency note:** Antigravity can start on the design system immediately — it does not need to wait for Cursor to finish. They work concurrently on separate files.

---

## 8. Sync Protocol

Both agents commit to `~/bbos-context` using the standard BBOS session protocol:

```bash
cd ~/bbos-context && git pull
# ... work ...
git add -A && git commit -m "bbos: [agent] dashboard phase1 $(date +%Y-%m-%d)" && git push
```

Conflict resolution: `git pull --rebase` before pushing.

---

## 9A. Cursor Prompt

```
You are Cursor, the Lead Development Agent for BBOS (BigBadOperatingSystem).

Your task: Build the BBOS Dashboard Phase 1 from scratch.

SPEC FILE: /Users/robertburmaster/BigBadOperatingSystem/BigBadDashboard/BBOS_Dashboard_Spec_Phase1.md
Read the full spec before writing any code.

RULES:
- Stack: Next.js 14, TypeScript, Tailwind CSS
- Data lives in ~/bbos-context — create a symlink or use BBOS_CONTEXT_PATH env var
- Do NOT implement commands marked "Not in Phase 1"
- Do NOT add external APIs, databases, or cloud services
- Each component goes in /components — leave styling minimal (Antigravity will style)
- Commit to ~/bbos-context when complete using BBOS session protocol

START HERE:
1. Scaffold Next.js project: `cd /Users/robertburmaster/BigBadOperatingSystem && npx create-next-app@latest BigBadDashboard --typescript --tailwind --app`
2. Build API routes first (data layer)
3. Build components second (logic only, minimal styling)
4. Wire CommandBar to routes
5. Test locally: `npm run dev` — confirm /status, /next, /priority work
6. Commit

Report back with: what's working, what's blocked, what Antigravity needs from you.
```

---

## 9B. Antigravity Prompt

```
You are Antigravity, an autonomous build agent for BBOS (BigBadOperatingSystem).

Your task: Build the BBOS Dashboard Design System — visual layer only.

SPEC FILE: /Users/robertburmaster/BigBadOperatingSystem/BigBadDashboard/BBOS_Dashboard_Spec_Phase1.md
Read Section 6 (UI Layout) and Section 7 (Agent Assignments) carefully.

AESTHETIC DIRECTION — "BigBad Operator":
- Dark theme: near-black background (#0a0a0a), not pure black
- Accent: electric amber (#F5A623) for active states and priority indicators
- Secondary: steel blue (#4A9EFF) for agent status and sync indicators
- Typography: monospace for commands and data (JetBrains Mono), sans-serif for labels (Inter)
- Density: high — compact cards, tight spacing, no wasted whitespace
- Feel: mission control, not consumer app

DELIVERABLES:
1. `tailwind.config.ts` — extended with BigBad color palette and font config
2. `styles/tokens.css` — CSS custom properties for all design tokens
3. Styled component files — apply classes to the component shells Cursor creates:
   - CommandBar.tsx — terminal-style input, amber cursor blink
   - ProjectCard.tsx — compact card with phase badge + status dot
   - AgentPanel.tsx — vertical list with online/offline indicators
   - OutputPanel.tsx — monospace output area, dark inset, scrollable
4. Layout polish for app/layout.tsx — sidebar + main panel

RULES:
- Tailwind utility classes only — no CSS modules, no styled-components
- Do NOT touch API routes or lib/ files — that's Cursor's territory
- Do NOT add npm packages without flagging it first
- Commit to ~/bbos-context when complete using BBOS session protocol

START HERE:
1. Pull latest from ~/bbos-context
2. Build tailwind.config.ts and tokens.css first
3. Style components in order: ProjectCard → AgentPanel → CommandBar → OutputPanel
4. Commit with message: "bbos: antigravity design system $(date +%Y-%m-%d)"

Report back with: components styled, any conflicts with Cursor's markup structure.
```

---

## 10. Definition of Done (Phase 1)

- [ ] `npm run dev` runs without errors
- [ ] `/status` displays at least one project card read from a `.md` file
- [ ] `/next` returns a prioritized list of next actions
- [ ] `/priority` returns a single #1 action
- [ ] `/capture [text]` appends to `data/inbox.md`
- [ ] `/sync` triggers git pull successfully
- [ ] UI matches BigBad Operator aesthetic
- [ ] Both agents have committed to `bbos-context`

---

*This spec is optimized for consumption by Cursor and Antigravity. Do not modify Section 9 prompts before feeding to agents.*
