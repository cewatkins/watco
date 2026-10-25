# Q-radio — text calls from position

Status: done
Hangs from: S4
Harness: grok-cli
Touches: `src/sim/radio.ts`, `src/sim/radio.test.ts`,
`src/components/flight-sim.tsx`

## Why this, and not the next spine chapter

The traffic now flies named legs; make those legs legible before scoring them.

## Given up

No voice, microphone, real frequency, or transmitted call. Local practice text
only, derived from position. No new network calls. Preserve S1 and S4.

## The other option

Speech and a live frequency introduce services and safety implications. A local
CTAF-style text strip teaches phrasing without pretending anyone is listening.

## Acceptance

- [x] Calls change with actual legs; stationary aircraft produces stable text.
- [x] Player and traffic use the same pure mapper, at a slow display cadence.
- [x] S1, S4, mapper tests, typecheck and lint pass.

## Commit

Q-radio: text calls from position

## Merge note

Completed 2026-10-25. Local text refreshed once per second; no speech or network.
