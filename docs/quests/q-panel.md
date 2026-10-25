# Q-panel — a six-pack that cannot lie

Status: done
Hangs from: S2
Harness: grok-cli
Touches:
- `src/components/flight-sim.tsx`
- `src/components/instrument-panel.tsx`
- `src/sim/instruments.ts`
- `src/sim/instruments.test.ts`
- `src/styles.css`
- `docs/03-where-we-are.md`
- `docs/quests/q-panel.md`

## Why this, and not the next spine chapter

Six procedural instruments make the trainer legible from a pilot's point of
view and give Q-views a real panel to frame. They read the existing `Ship`;
they do not become a second flight model.

## Given up

The panel is a procedural analog six-pack, not a photoreal bezel, G1000, or
radio stack. Turn indication is a roll-rate trend, not a calculated turn-rate
or slip/skid model. The existing text row remains the exact-value backup. No
gauge integrates or smooths its own state, and no external asset or network
request is added.

## The other option

A 3D-only gauge implementation would tie instrumentation to a camera and make
the data harder to test. A separate React state update at 60 Hz would make the
page do unnecessary work. The procedural SVG overlay reuses the existing
render loop and stays readable on a phone.

## Acceptance

- [x] Airspeed, attitude, altitude, turn trend, heading, and vertical speed read
      the current `Ship` values only.
- [x] Deterministic target-angle tests cover the scale and display tolerances:
      airspeed ±2 kt, altitude ±50 ft, vertical speed ±50 fpm, heading ±1°,
      attitude ±1°.
- [x] The panel and existing text readouts update from the same frame; there
      are no 60 Hz React state updates or hidden instrument state.
- [x] S1 and Q-failures tests, typecheck, and lint pass.
- [x] Desktop and mobile render with no overflow or console/page errors.

## Commit

Q-panel: six-pack reads Ship only

## Merge note

Completed 2026-10-25. The six gauges update from `Ship` in the existing render
loop. Airspeed spans 0–160 kt, altitude makes one turn per 10,000 ft, and
vertical speed spans ±2,000 fpm; digital labels remain tied to the backup
readouts. Mapping tests, desktop/mobile interaction checks, typecheck, lint,
production build, and desktop/mobile production smoke passed.
