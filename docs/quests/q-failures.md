# Q-failures — the airplane can be unhealthy

Status: done
Hangs from: S1
Harness: grok-cli
Touches:
- `src/sim/fdm.ts`
- `src/sim/fdm.tick.test.ts`
- `src/components/flight-sim.tsx`
- `docs/03-where-we-are.md`
- `docs/quests/q-failures.md`

## Why this, and not the next spine chapter

Selectable faults make the airplane less predictable without making the
standard lesson unreliable. Keep the healthy aircraft as the default, and
make each fault a data choice passed through the existing `step()` contract.

## Given up

There are only two faults: a 55% maximum-thrust cap and a small left-wing roll
tendency. They are chosen before start, never random, and do not affect traffic.
The S1 flight model remains byte-for-byte equivalent in outcome when the
failure is `none`.

## The other option

Random faults would make the pattern and tick checks nondeterministic. A new
failure simulator or a second integration path would violate the single-step
contract and cost more than these two teaching cues.

## Acceptance

- [x] `none` is the default and leaves S1's baseline outcomes unchanged.
- [x] A headless tick with partial power has less thrust than the healthy case.
- [x] A headless tick with a heavy wing develops the named roll tendency.
- [x] The briefing lets the student choose one fault before flight and explains it.
- [x] S1 tick test, typecheck, and lint pass.
- [x] Failures are deterministic, not applied to traffic, and add no network call.

## Commit

Q-failures: optional, default off

## Merge note

Merged 2026-10-25. The S1 baseline snapshot is unchanged with `none`; the
partial-power cap and heavy-wing tendency are separately headless-tested.
