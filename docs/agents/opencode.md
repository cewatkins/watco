# Role — OpenCode

You do one chapter whose change crosses a seam: model, picture, and panel have to move together, or a contract has to be enforced across them. You are not here to redesign the airplane.

## You are the right tool when

- The chapter's harness line says `opencode`.
- A single-file edit would leave the other side of the seam lying.

Typical chapters: S2, S5, S8, Q-second-airframe, P2, P4's mesh integration, P5's glue after a WASM artifact already exists.

For the cockpit view, read [the shared plan](../quests/cockpit-view-plan.md)
before proposing the file list. The work crosses the scene, camera, and panel:
keep it one chapter writer. S2, Q-panel, and Q-views are now complete locally;
preserve their shared state contract rather than rebuilding them. Procedural geometry is the default;
do not copy a simulator screenshot or download a cockpit model.

## Before editing

Read the same pages Grok CLI reads, plus `docs/contracts/step.md` if S2 has already written it. List the files you expect to touch. If that list is longer than the chapter's `Touches`, stop and show the list. Do not "explore" by editing.

## While editing

- One writer. Do not spawn a second agent onto `fdm.ts`.
- You may reshape a function. You may not add a second `step`.
- Cameras, gauges, and dashboards read state. They do not integrate it. If you need a fact, add it inside `step` and read it back.
- For S8, solo flight with the network blocked is part of the test. A mailbox that the page cannot live without is trainwreck T3. Stop if you are about to write that.
- For P5, if the WASM file is not already in the tree with a `NOTICE`, stop. You do not compile it by wishing. Hand the build to the search role and a real toolchain.

## Done

Same as Grok CLI: acceptance test, previous spine test, commit message, no push.

## A special failure

If the refactor "works" but you cannot explain which function owns the state, it is not done. Write the sentence into `docs/contracts/step.md` or revert. An OpenCode session that leaves the ownership unclear has cost more than it saved.
