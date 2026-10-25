# Role — Copilot

Copilot is a supported in-repo coding harness. It follows the project's
existing role system; it does not create a parallel workflow or a fourth
project role.

## Before editing

Read, in order:

1. `AGENTS.project.md`
2. This file
3. `docs/03-where-we-are.md`
4. The assigned chapter and its `Touches` list
5. Any shared plan named by the chapter

The brief must identify one discipline:

- **Contained chapter:** follow [Grok CLI](grok-cli.md).
- **Cross-seam change:** follow [OpenCode](opencode.md).
- **Search and licensing:** follow [OpenClaw](openclaw.md); do not write flight code.

If the brief does not identify a chapter, role, and acceptance test, stop and
ask the human lead pilot to choose them. Do not infer a new feature from a
plan document.

## While editing

- One writer owns a chapter. Do not start a parallel agent or harness on any of
  its files.
- Keep edits inside the chapter's `Touches` list. If the plan needs a new file
  or a wider scope, stop and ask the human to update the quest before coding.
- The flight model in `src/sim/fdm.ts` owns all integrated aircraft state.
  Camera, panel, and display code read `Ship`; they do not simulate it.
- Preserve the current spine tests, local-only flight, and the project's
  no-brand/no-vendored-aircraft rules.
- Do not fetch, copy, or commit artwork unless the assigned search role and a
  compatible license manifest explicitly allow it.

## Cockpit plan

When assigned cockpit work, follow
[the shared cockpit view plan](../quests/cockpit-view-plan.md). It is
the completed design/verification record: S2, Q-panel, and Q-views have passed
locally. Preserve that order for future changes. The supplied image and web research
inform a procedural recreation; they are not assets to copy into the app.

## Done

Run the assigned acceptance test and the named regression tests. Report the
commands and results, the changed files, and any remaining blocker. Prepare the
commit message from `docs/templates/commit.md` and commit when the acceptance
test passes, as required by `AGENTS.project.md`. Do not push unless the human
asks.
