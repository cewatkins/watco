# Q-night — a coat of paint, not a new sky model

Status: done
Hangs from: S0
Harness: grok-cli
Touches: `src/sim/scene.ts`, `src/components/flight-sim.tsx`

## Why this, and not the next spine chapter

Finish the independent visual quests before changing the briefing and pattern.

## Given up

No clock, stars, weather simulation, or photometric lighting. Day remains the
default. The toggle must never change aircraft state; S1 stays unchanged.

## The other option

A real time-of-day model adds unrelated state and makes comparison harder.
Use a boolean palette and procedural runway lights instead.

## Acceptance

- [x] Day/night toggle leaves the player snapshot unchanged.
- [x] Night runway edges and flashing beacon are visible; phone panel readable.
- [x] Typecheck, build, lint, S1 and desktop/mobile browser checks pass.

## Commit

Q-night: a coat of paint, not a new sky model

## Merge note

Completed 2026-10-25. Lights spaced 60 m along both runway edges.
The existing beacon animation and instrument contrast are preserved.
