# Q-sound — the engine follows RPM

Status: done
Hangs from: S0
Harness: grok-cli
Touches:
- `src/components/flight-sim.tsx` (synthesized audio block)
- `docs/03-where-we-are.md` (current product description)
- `docs/quests/q-sound.md`

## Why this, and not the next spine chapter

The trainer already creates engine noise and a stall tone. This quest makes the
sound follow the engine state and adds feedback for flap changes without
changing the flight model or introducing downloaded assets.

## Given up

A recorded Lycoming; those recordings are somebody's, and a sample pack would
dominate the download of a trainer that is currently a page. Also given up:
sound before the first click. Browsers block that. The briefing button is the
click. Do not "fix" autoplay with a hack.

## The other option

Downloaded engine samples might sound more realistic, but they add licensing,
bandwidth, and asset-management work. A custom aircraft audio model is also
unnecessary because the existing `Ship.rpm` and `Ship.stalled` already provide
the signals this small synthesized cue needs.

## Acceptance

- [x] Before start, the engine remains silent; after the user's first click,
      RPM changes both engine pitch and loudness.
- [x] The synthesized flap click occurs only when the flap setting changes.
- [x] The stall tone follows `Ship.stalled`.
- [x] S1 tick test, typecheck, and lint still pass.
- [x] No downloaded audio or new network request is added.

## Commit

Q-sound: RPM drives a synthesized engine

## Merge note

Merged 2026-10-25. Browser interaction verified silence before the first
gesture, RPM-linked pitch and gain, and flap clicks only at actual setting
changes. The stall gain is directly driven by `Ship.stalled`. A full-pull
headless check reached 0.293 rad with flaps 30 but did not cross the model's
0.30 rad stall threshold; stall entry remains a flight-model follow-up, not an
audio substitute or threshold workaround.
