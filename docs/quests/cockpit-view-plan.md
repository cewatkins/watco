# Cockpit view — cross-harness implementation plan

Status: **Implemented through Q-panel and Q-views (2026-10-25).**

This document is the shared handoff for the human lead pilot, Grok CLI,
OpenCode, and Copilot. It does not override `AGENTS.project.md`, a quest's
`Touches` list, or the chapter acceptance test.

## Current state and gate

- `docs/04-spine.md` has S2 complete; Q-panel and Q-views have merged.
- `docs/03-where-we-are.md` now describes the six-pack and five camera modes.
- `src/sim/fdm.ts` already puts the basic instrument values on `Ship`, including
  IAS, altitude, vertical speed, heading, pitch, roll, and roll rate.
- Q-views explicitly depends on Q-panel for its cockpit camera.

Q-panel and Q-views are complete. Keep this document as the design and
verification record for those two quests.

## Product goal

Add an optional pilot-seat view to Field 28's existing 172-class trainer. The
runway and scenery remain visible through the windscreen. A dark, curved
glareshield and instrument panel occupy the lower part of the view; the six
primary analog instruments sit in front of the pilot, with a modest radio
stack to the right and a yoke low in the foreground. Existing exterior views
remain available.

The visual target is the composition of the supplied screenshot, not a pixel
copy: outside horizon above, dense analog panel below, radio equipment on the
right. The product remains Field 28's generic trainer. Do not put manufacturer
names, logos, or aircraft marks in app copy or art.

## Reference research

The web search surfaced general instrument-layout guides and cockpit
photographs. Use them to confirm familiar equipment placement only:

- [Six-instrument and panel-layout overview](https://www.flightnerdairforce.com/blog/cessna-172-instrument-panel-full-cockpit-layout-guide)
- [Cockpit instruments and controls overview](https://www.pilotmall.com/blogs/news/breaking-down-everything-in-the-cessna-172-cockpit)
- [Public image-category search on Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Cockpit_of_Cessna_172)

These are research references, not app assets. Do not download, embed, trace,
or vendor a photograph, simulator model, bezel, or radio graphic. Draw the
panel, labels, gauges, and bezels procedurally. The Commons category is not a
blanket license; every individual file would need its own license review before
any future use.

## Scope and data contract

### Q-panel — instruments first

1. Draw a conventional six-pack in the instrument panel:
   - Top row: airspeed, attitude, altimeter.
   - Bottom row: turn coordinator with optional slip/skid ball, heading,
     vertical speed.
2. Drive displays only from the current `Ship` passed to the renderer:
   - Airspeed from `iasKt`.
   - Attitude from `pitch` and `roll`.
   - Altitude from `altFt`.
   - Turn trend from the existing angular state, and optionally slip from
     velocity expressed through the existing body basis.
   - Heading from `heading`.
   - Vertical speed from `vsiFpm`.
3. Keep the existing text readouts as a backup. Do not add a second instrument
   simulation, hidden energy state, new forces, or a field to `fdm.ts` merely
   to make a needle look smoother. A display filter, if needed, must stay below
   0.2 seconds and never become a source of truth.
4. Update the panel from the existing render loop at display rate without
   adding React state updates at 60 Hz or any network dependency.
5. Use explicit display-agreement tolerances: airspeed ±2 kt, altitude ±50 ft,
   vertical speed ±50 fpm, heading ±1 degree, and attitude ±1 degree.
   Deterministic checks should verify target needle angles from representative
   `Ship` values rather than judging a screenshot by eye. These are display
   tolerances only; they do not permit smoothing or inventing state.

### Q-views — put the pilot in the same airplane

1. Add the static spot camera and pilot-seat cockpit camera described by
   `docs/05-side-quests.md`; keep chase, tower, and wing views.
2. Add both new views to the existing `C` and camera-button cycle, with clear
   labels.
3. Place and orient the cockpit camera from the player's existing position and
   `basis()` attitude. Camera movement is presentation only: it must not write
   position, velocity, attitude, throttle, or any other `Ship` field.
4. The cockpit camera must show the same Q-panel widgets produced by Q-panel.
   Do not build a separate DOM panel with different values.

## Proposed implementation sequence

1. **Prerequisite:** verify S2 and its regression test are complete on the
   working branch. If not, stop without touching flight or cockpit files.
2. **Open Q-panel:** the human copies the side-quest template, records the
   scope and "Given up" costs, and assigns one writer.
3. **Implement Q-panel:** prefer a small procedural cockpit/panel module and
   integrate it through the existing scene/component seam. Do not edit
   `fdm.ts` unless a required value is genuinely missing; if so, stop and
   request a new scope instead of adding physics.
4. **Verify Q-panel:** confirm all six needles follow the named `Ship` values
   at 60 Hz within a documented display/readout tolerance; verify that the
   panel still updates with the network unavailable; run S1 and type/build
   checks.
5. **Open Q-views:** only after Q-panel passes, create the Q-views quest file
   and assign one writer. Keep its file list to the scene and camera-cycle
   component unless the human explicitly opens a wider scope.
6. **Implement Q-views:** add spot/cockpit camera behavior and expose it in the
   existing camera cycle. Preserve the shared `basis()` convention and do not
   alter the flight loop or input signs.
7. **Verify Q-views:** compare `Ship` position and attitude before/after camera
   changes; verify `C` reaches every view; verify A still banks left in the
   chase view; check desktop and phone-sized rendering and a clean browser
   console.
8. **Close the work:** update `docs/03-where-we-are.md` and the quest merge
   notes only after acceptance passes. Commit each quest at its acceptance
   point with the message specified by `docs/05-side-quests.md`; do not push
   unless the human asks.

## Cross-harness handoff

- **Human lead pilot:** owns the S2 gate, opens one quest at a time, chooses the
  writer, reviews visual references/licenses, and approves commits.
- **OpenCode:** use for a brief whose accepted `Touches` cross the renderer,
  camera, and panel seam. State the exact files first; do not broaden the
  quest or split simultaneous writers.
- **Grok CLI:** use for one bounded quest with a known interface and acceptance
  test. It may own Q-panel or Q-views in sequence, never both at once.
- **Copilot:** choose one of those two coding disciplines in the brief and
  follow its file scope, test, and handoff rules. Copilot is a tool choice,
  not an additional project role.
- **Search harness / browser:** research only if a new external asset or pack
  becomes necessary. It must return a source and license manifest before a
  coding harness uses that asset. This plan currently calls for no downloaded
  assets and no new network request at runtime.

## Explicitly out of scope

- Photoreal or licensed cockpit imagery, aircraft branding, downloaded
  simulator models, and a G1000.
- New flight dynamics, instrument failures, a second flight model, or changes
  to `step()`.
- New accounts, database work, multiplayer, real airport scenery, or live
  weather.
- Altering the existing keyboard/gamepad/touch control mappings.
