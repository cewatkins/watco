# Q-second-airframe — a second table, the same step()

Status: done
Hangs from: S2 and S1
Harness: opencode
Touches: `src/sim/fdm.ts`, `src/sim/airframe.test.ts`,
`src/sim/fdm.tick.test.ts`, `src/sim/presence.ts`,
`src/components/flight-sim.tsx`, `docs/03-where-we-are.md`

## Why this, and not Public World

Finish the approved table-driven airframe quest; Public World is excluded.

## Given up

Pick a **generic light tailwheel-class trainer**, not the heavier twin. No
warbird, jet, licensed model, or second integrator. Existing procedural geometry
and ground steering are reused: this is not a tailwheel-handling simulation.
The standard trainer's exact S1 numeric outcomes must remain unchanged.

## The other option

A heavier twin would need asymmetric-engine lessons the model does not have.
The lighter trainer can demonstrate wing loading and thrust-to-weight using
the same force equations. Aerodynamic coefficients remain labeled tuning.

## Reference numbers

[AOPA light-trainer reference](https://www.aopa.org/go-fly/aircraft-and-ownership/aircraft-guide/aircraft/piper-j-3-cub)
lists 680 lb empty plus 540 lb useful load, and 178.5 ft² wing area.
Those yield roughly 553 kg gross mass and 16.58 m². Only those public numeric
facts inform the generic record. No text, artwork, aircraft branding, or model
is copied. Static thrust 1,600 N and rotate threshold 22 m/s are **tuning
choices**, not measured performance. All coefficient choices are identified
in the table.

## Acceptance

- [x] One `step()` reads `ship.aero` for both records.
- [x] Standard trainer's S1 physical outcomes remain byte-exact at test precision.
- [x] Light trainer has a shorter model takeoff roll as lower wing loading
      and greater thrust-to-weight predict.
- [x] Briefing selector/reset and presence carry the selected record.
- [x] All simulation tests, typecheck, lint, build and browser checks pass.

## Commit

Q-second-airframe: a second table, the same step()

## Merge note

Completed 2026-10-25. The light trainer's headless takeoff roll is less than
80% of the standard trainer's with identical controls. S1's original
physical-state hash remains unchanged; only the new aero metadata is omitted
from that legacy hash. Standard and traffic default to the original record.
