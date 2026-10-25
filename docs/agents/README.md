# Agents

You are a harness, not an author. A human aimed you at one chapter. Read your role file, then the chapter, then stop when its test passes.

| If you are | Read |
|---|---|
| Grok CLI, or any in-repo coding agent on a single chapter | [grok-cli.md](grok-cli.md) |
| OpenCode, or any agent whose job is a refactor across the seams | [opencode.md](opencode.md) |
| Copilot working in this repo | [copilot.md](copilot.md) |
| OpenClaw, or any browser that can search and download | [openclaw.md](openclaw.md) |
| The human holding the harness | [human.md](human.md) |

Shared laws live in `AGENTS.project.md` at the repo root. They win over a role file. The chapter you were assigned wins over both, and only for its own `Touches` list.

The paste target a human should hand you is [templates/agent-brief.md](../templates/agent-brief.md). If they did not name a chapter, ask for one. Do not pick the chapter yourself.

Copilot is a supported coding harness, not a new project role: use the Grok CLI
discipline for a contained chapter and the OpenCode discipline for work that
crosses seams. Pick one writer for a chapter; do not run coding harnesses in
parallel against the same files.

For the cockpit work, all roles share
[the cockpit view record](../quests/cockpit-view-plan.md). S2, Q-panel, and
Q-views are complete locally. Do not reopen or rebuild them from an old plan.
Current status and reproducible checks are in
[Where we are](../03-where-we-are.md). The approved AI-student run covered S2–S8
and the eight written quests sequentially; it did not authorize Public World
or future unwritten quests.
