# 02 — Harnesses

A harness is the program that carries the model: it can edit files, run commands, and sometimes browse. Field 28 uses three roles. You rarely need three products. You always need to know which role is speaking.

| Role | Default tool | Writes flight code? | Browses and downloads? |
|---|---|---|---|
| In-repo chapter | **Grok CLI**; Copilot may follow this discipline | Yes, inside one chapter | No |
| Multi-file refactor | **OpenCode**; Copilot may follow this discipline | Yes, still inside one chapter | No |
| Search and fetch | **OpenClaw**, or the human's browser | No | Yes |

If you only have one of these, use it for its role and do the other role yourself. Do not pretend a coding agent verified a license by guessing.

Copilot is a supported harness, not a fourth role. Before it edits, the brief
must say whether it is acting as the in-repo chapter writer or the multi-file
writer. It follows that role's file limits and handoff rules. Do not assign
Copilot and another coding harness to write the same chapter at the same time.

## Grok CLI — the daily tool

Use it for a spine chapter or a small quest: one behavior, a headless check, a commit.

It is the right tool when the work fits in a sitting and the files are already named in the chapter. S1, S3, S4, S7, and most quests are Grok CLI work.

Point it at:

- `docs/agents/grok-cli.md`
- the chapter
- `AGENTS.project.md`

Tell it not to push, and not to open the next chapter.

## OpenCode — when the change crosses the seams

Use it when one chapter must touch the model, the scene, and the panel together without letting them drift. S2 (enforcing the contract), S5 (task card wired through the existing loop), S8 (a second ship that is not the autopilot), and Q-second-airframe are that kind of work.

OpenCode is not a license to start a second design. The brief still names one chapter and one acceptance test. If the session starts editing files outside `Touches`, stop it.

## OpenClaw — search and download only

Some later chapters cannot be finished from memory. The URL of a public airport file, the license on a DEM, whether a METAR endpoint sends CORS headers, and how to compile JSBSim to WASM are facts about the outside world. They go stale.

Those chapters are marked `Harness: search, then code`.

**OpenClaw** (or any harness that can browse and save files — a documented alternative is fine) does only this:

1. Find the upstream.
2. Read the license.
3. Save a small fixture and a filled-in [pack manifest](templates/pack.md) under `docs/packs/`.
4. Stop. Do not refactor the trainer.

Then Grok CLI or OpenCode writes the loader that consumes the fixture.

If OpenClaw is not installed, the human does steps 1–3 in a browser and pastes the manifest. That is slower and it is correct. Do not skip the manifest because the coding agent "already knows" OurAirports.

Chapters that need this role:

| Chapter | What must be looked up |
|---|---|
| P1 | OurAirports dump URL and the public-domain statement |
| P3 | A METAR source and its CORS behavior |
| P4 | A US public-domain DEM (USGS 3DEP). OSM only if you accept ODbL in writing |
| P5 | JSBSim source, LGPL text, and a machine that can actually compile WASM |

No spine chapter needs this role. If a spine chapter seems to, it is secretly a Public World chapter and it is early.

## Other harnesses

You may substitute a tool that plays the same role. Write the substitution at the top of the commit message (`Harness: human browser for search`). Do not add a fourth role.

Not a role, and not welcome as one:

- An image generator, for this project. The airplane and the field are drawn in code. A generated "Cessna" texture is a trademark problem and a style break.
- A chat that cannot run the tick test. It may explain. It may not claim the chapter is done.
- A second coding agent in parallel on `fdm.ts`. One writer for that file per chapter.

## Handoff

When the search role finishes, it leaves a pack manifest and a fixture. It does not leave a drive-by edit in `src/`. When the code role finishes, it leaves a passing test and a commit message. It does not leave a browse log in place of the license.

For the cockpit proposal, use
[the shared implementation plan](quests/cockpit-view-plan.md) across all
harnesses. It names the visual target, data contract, sequence, test gates, and
the current S2 blocker. The lead pilot opens each quest before implementation.
