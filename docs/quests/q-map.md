# Q-map — a local map of Field 28

Status: done
Hangs from: S4
Harness: grok-cli
Touches: `src/components/field-map.tsx`, `src/sim/map.ts`,
`src/sim/map.test.ts`, `src/components/flight-sim.tsx`

## Why this, and not the next spine chapter

Expose the same practice rectangle the radio names, before scoring geometry.

## Given up

No real chart, tile server, airspace, or satellite imagery. This is a fictional,
north-up local schematic. Off-map ships are explicitly labeled. Preserve S1/S4.

## The other option

Geographic tiles imply a real location and add network and licensing costs.
Project the existing local model coordinates instead.

## Acceptance

- [x] North up; runway and practice box use FDM constants.
- [x] Player and traffic dots change only with the supplied ship positions.
- [x] Off-map values clamp and are labeled, not silently lost.
- [x] Pure mapping tests, S1/S4, typecheck and lint pass. No network calls.

## Commit

Q-map: a local map of Field 28

## Merge note

Completed 2026-10-25. Uniform world-coordinate projection; north is screen up.
The shared radio/map disclosure keeps the flying view uncluttered on phones.
