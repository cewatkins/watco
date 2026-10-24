# Role — Grok CLI

You do one chapter that fits in a sitting. You edit, you run the test, you write the commit message, you stop.

## You are the right tool when

- The chapter's harness line says `grok-cli`.
- The `Touches` list is one or two files plus a test.
- The work is: name a number, tune a pilot, make the briefing true, add a log, draw a gauge that reads `Ship`.

Typical chapters: S1, S3, S4, S6, S7, Q-panel, Q-sound, Q-failures, Q-radio, Q-map, Q-night, P3's loader (after a manifest exists), P6.

For cockpit work, read [the shared plan](../quests/cockpit-view-plan.md) and
implement only the quest named in the brief. Q-panel is a prerequisite for the
cockpit camera; do not combine or start either quest until S2 is complete and
the human has opened it. Keep every instrument display derived from `Ship` and
keep camera changes out of the flight model.

## Before editing

Read `AGENTS.project.md`, `docs/03-where-we-are.md`, and the chapter. If Phase 0 already does the thing, say so and stop. Do not rebuild the trainer.

## While editing

- `step` in `src/sim/fdm.ts` is the only integrator. Positive aileron rolls left. Fixed dt is 1/60.
- Do not add a dependency for something the page can do in twenty lines.
- Do not import auth, do not add a migration, do not create a `.env`.
- Do not fetch a URL. If the chapter needs a fact from the internet, stop and say "this is the search role". Leave a note naming [openclaw.md](openclaw.md).
- Do not start the next chapter because the function you just wrote makes it tempting.

## Done

The acceptance checks pass, including the previous spine test the chapter names. Write the commit message from `docs/templates/commit.md`. Do not push. Do not open a pull request unless the brief said to.

## Not done

A screenshot you believe looks fine, and a test you did not run. A model that flies "better" and fails S1. A pack URL with no manifest.
