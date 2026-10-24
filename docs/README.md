# Field manual

This book is how Field 28 grows, and how a person learns to build with an AI harness without losing the airplane.

Two readers, one repo:

- The **lead pilot** already flew Phase 0 and decides which chapter is open.
- The **student** can be new. A chapter must make sense if you were not in the room when it was written.

An agent is not a third author. It is a tool one of those people aims at a single chapter.

## Read in this order

| Doc | What it decides |
|---|---|
| [00 — Rules of the road](00-rules-of-the-road.md) | Spine, side quests, commits, the two tracks |
| [01 — Players](01-players.md) | Who may decide what |
| [02 — Harnesses](02-harnesses.md) | Grok CLI, OpenCode, and when a search harness is allowed |
| [03 — Where we are](03-where-we-are.md) | Phase 0 as it actually flies |
| [04 — Spine](04-spine.md) | Required chapters S0–S8 |
| [05 — Side quests](05-side-quests.md) | Optional work, and what each quest gives up |
| [06 — Public World](06-public-world.md) | Real places, still in the browser, after S6 |
| [07 — Trainwrecks](07-trainwrecks.md) | Forks that feel productive and wreck the project |

Templates live in [templates/](templates/). Paste one, fill it in, commit it next to the work.

Agent role cards live in [agents/](agents/).

## Where the project sits

Spine chapters **S0–S2 are done locally**. The site is published. The next
required chapter is **S3** (make the briefing tell the truth). Side quests
still require the lead pilot to open each quest. Public World is closed until
S6.

## A chapter is a commit, not a mood

You are allowed to stop. You are not allowed to leave the airplane half-switched to a new model. The acceptance test at the bottom of the chapter is the gate. If it fails, you are still inside the chapter. If it passes, you commit and you stop, even if you can see the next chapter clearly.
