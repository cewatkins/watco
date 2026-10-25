# Q-views — cameras are not physics

Status: done
Hangs from: S0; cockpit view also depends on Q-panel
Harness: grok-cli
Touches:
- `src/sim/scene.ts`
- `src/components/flight-sim.tsx`
- `docs/03-where-we-are.md`
- `docs/quests/q-views.md`
- `docs/quests/cockpit-view-plan.md`

## Why this, and not the next spine chapter

The six-pack now works, so the pilot can use it from a cockpit camera. A
separate spot view makes the airplane easier to inspect without changing
flight state. Both are presentation-only additions to the existing camera
cycle.

## Given up

The cockpit is a camera seat and the existing procedural panel overlay, not a
fully modeled cabin with switches. The spot camera is a simple offset view,
not a cinematic orbit or a new aircraft model. Chase, tower, and left-wing
views stay available; S1's `step()` behavior and control signs must not change.

## The other option

A dedicated cockpit mesh and an orbit controller would add geometry and
interaction that are not needed to teach camera perspective. A static camera
at another airport point would duplicate the tower view. Keep both views
simple, deriving their position and aim from the existing aircraft basis.

## Acceptance

- [x] `C` and the camera button reach Chase, Tower, Left wing, Spot, and
      Cockpit; the original three stay in their original order.
- [x] Cockpit view looks forward from the aircraft seat, banks with the
      airplane, and retains the Q-panel instruments.
- [x] Spot view frames the airplane from outside; existing views remain usable.
- [x] A camera cycle leaves the complete player state unchanged.
- [x] A still banks left in Chase; S1 and Q-failures tests, typecheck, lint,
      production build, and desktop/mobile browser checks pass.
- [x] No new network request or external visual asset is introduced.

## Commit

Q-views: cameras are not physics

## Merge note

Completed 2026-10-25. Added `spot` and `cockpit` modes to the existing camera
cycle while preserving the original chase/tower/left-wing order. Cockpit view
uses the aircraft basis and keeps the existing six-pack overlay; spot view
frames the aircraft from outside. Camera-cycle checks confirm no `Ship` fields
change when switching views, and chase still banks left with `A`.

Integration polish adds a procedural windscreen rim and curved glareshield
behind that same panel, not a second instrument set or licensed cabin model.
