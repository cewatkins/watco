# 03 — Where we are

Phase 0 is real. It is published. Do not rebuild it. Extend it.

This is the current handoff after S0–S8 and the eight written side quests,
implemented and committed locally, not pushed. Public World is not opened.
The platform shell (router, auth helpers, PWA) remains outside flight chapters.

## What you can do in the page

- Sit on runway 28 at a high-elevation field. The placard reads **2,871 ft**, wind **280 at 8**.
- Fly N172FD, a 172-class trainer. Chase, tower, left-wing, spot, and cockpit
  cameras (`C`).
- Hear a synthesized engine whose pitch and volume follow RPM, a flap click on
  flap changes, and a stall tone when the wing quits. Sound starts after the
  first click.
- Read a procedural six-pack driven by the same airplane state as the text
  backup row.
- Toggle day/night lighting, with procedural runway edge lights at night.
- Watch N344TG fly a left practice rectangle at about 1,000 ft above the field.
- Crash on a wing strike, a prop strike, or a hard landing, then reset (`R`).
- Fly with keys, a gamepad, or the phone yoke.
- Choose a healthy trainer, partial power capped at 55% thrust, or a small
  left-roll tendency before start. Failures are off by default and affect only
  the player aircraft.
- Choose the standard trainer or a generic light trainer, both using the same
  integrator. The latter is a loading/thrust comparison, not tailwheel handling.
- Choose default, calm, or left-crosswind weather before start.
- Follow six ordered circuit tasks through a full stop on the fictional strip.
- Open **Radio & local map** for practice text calls, a north-up moving
  schematic, optional invited live pilots, or returning to the briefing.
- Keep a bounded flight log in this browser; refresh preserves it, another
  browser does not share it, and **Forget local flight log** removes it.

The briefing on the page already says the important sentence: you send inputs, the flight model owns the state, and the same model steps both airplanes.

## Controls, as implemented

| Input | Effect |
|---|---|
| W / S | Throttle up / down. Keyboard slew, not a direct set |
| A / D, or Left / Right | Bank left / right. A is left. This is not optional |
| Down / Up arrows | Pull / push. Down is nose up, the way a stick moves |
| Q / E | Rudder left / right |
| F / G | Flaps 0 → 10 → 20 → 30, and back |
| Space or B | Brakes |
| C | Next camera |
| R | Reset the airplane. Traffic resets with you |
| Gamepad stick | Bank and pitch. Right stick (axis 2) is rudder. Triggers are throttle |
| Phone | Yoke on the left, throttle slider on the right. They override the keys while you hold them |

## The three files that matter

### `src/sim/fdm.ts` — the airplane

Pure TypeScript. No rendering, no DOM. A headless script can import it.

Fixed step `FIXED_DT = 1/60`. The standard record has mass 1043 kg, wing area
16.2 m², and max thrust 2500 N. The light record has mass 553 kg, wing area
16.58 m², and tuned max thrust 1600 N. Gear height is 1.55 m. These are
generic training records, not certified models; sources and tuning are in
`docs/quests/q-second-airframe.md`.

`step(ship, input, FIXED_DT, weather = DEFAULT_WEATHER)`:

- Lags the throttle so the lever is not the engine.
- Computes density with an exponential drop from field elevation.
- Builds an orthonormal body basis (yaw, then pitch, then roll). Positive roll is left wing down.
- Lift from a linear lift slope plus flap increments, with a stall break. Drag from a parasite term plus lift-squared.
- Thrust falls off as speed rises.
- On the ground: friction, brakes, steering from rudder and aileron, a rotate pitch once you are fast enough and pulling.
- In the air: a pitch target of flight-path angle plus a target angle of attack, so a held pull does not porpoise forever. Hands-off, the wings level gently, because a keyboard has no force feedback.
- Writes instrument fields onto the ship: IAS, TAS, altitude, AGL, vertical speed, heading, angle of attack, stall flag.
- Sets `crashed` and a short reason. A crashed ship stops stepping.

`patternPilot(ship)` returns a `PilotInput`. It does not move the airplane itself.
Traffic goes through the same `step` you do. S4 uses a 2,600 × 1,000 m left
rectangle with rounded turns from a 300 m lookahead, near y = 305 m.
The traffic flies an altitude-hold practice circuit, not a landing.

`Ship` is the whole state a picture needs. If a gauge needs a fact that is not on `Ship`, add the fact in `step`, then read it. Do not recompute aerodynamics in the panel.

The ownership, axes, units, and fixed-step rules are recorded in the
[`step()` state contract](contracts/step.md). Constructors and `placeAirborne`
may set initial state; only `step()` integrates the aircraft forward.

### `src/sim/scene.ts` — the picture

Three.js. Builds procedural trainers (high wing, prop, beacon, stripe color per
ship), a runway with 28 and 10 painted on it, sagebrush, a windsock driven by
the same weather as the flight model, fog, and hills that are scenery, not
collision. Night mode changes lighting and adds procedural runway edge lights.

`mountWorld(canvas)` returns a world whose `render(player, traffic, dt, cam,
weather, guests)` reads aircraft state. Attitude comes from `basis()` in the
flight model, the same function the forces use. If the picture and the forces
ever disagree about "left", this shared basis is why. Keep it that way.

Cameras: `chase`, `tower`, `wing`, `spot`, `cockpit`.

Nothing in this file may add a force, a new velocity, or a second notion of altitude.

### `src/components/flight-sim.tsx` — the loop and the panel

React owns the frame clock and the DOM. It accumulates time and calls `step` in fixed slices (at most 20 per frame, so a stalled tab cannot explode the integrator).

Phases: `brief`, `fly`, `crash`.

The six-pack is a procedural SVG presentation of `Ship`: airspeed, attitude,
altitude, turn trend, heading, and vertical speed. The text row remains the
exact-value backup, with RPM, throttle, and flaps. Refs, not React state, on
purpose: the instruments update in the existing render loop without a 60 Hz
page re-render.

`window.__controlsTest` exposes `getYaw`, `getSpeed`, `getRoll`,
`getCameraMode`, `getShipSnapshot`, `getTrafficSnapshot`, `getRemoteShips`,
`setKeys`, and `prepRollTest` for repeatable acceptance. The latter initializes
a test state; it is not an alternative integrator. Leave the check or replace
it with an equivalent one.

### Supporting seams

- `src/components/instrument-panel.tsx`: six-pack, updated from the frame loop.
- `src/components/field-map.tsx`: north-up SVG dots from model coordinates.
- `src/sim/circuit.ts`, `radio.ts`, `log.ts`: ordered observations, practice
  call text, bounded local persistence; none integrates forces.
- `src/components/live-presence.tsx` and `src/sim/presence.ts`: explicit
  consent, validated state/control packets, and encrypted handshakes.
- `src/lib/multiplayer/p2p.ts`, `signaling.server.ts`, and
  `src/routes/api/rtc.ts`: WebRTC transport and database-backed mailbox.
  Solo never joins or requests signaling/STUN.
- `migrations/0002_rtc_mailbox.sql`: expiring roster and encrypted signaling
  only. Accounts stay off. Production signaling needs the provisioned database;
  a missing database produces an explicit error while solo still flies.
  Read [the presence contract](contracts/presence.md) before changing this seam.

## What is deliberately absent

| You might expect | Where it actually stands |
|---|---|
| A landing autopilot | N344TG flies the S4 altitude-hold rectangle; it does not land |
| Live METAR / synchronized weather | S6 supplies local explicit presets and deterministic spatial gusts; no weather network |
| Detailed second-airframe systems | A second data record, not a second `step`, cockpit model, or tailwheel ground dynamics |
| An authoritative multiplayer world | Invited live state/control presence only; no referee, shared collisions/scoring/weather, anti-cheat, or TURN. NAT can block it |
| Accounts or a cloud logbook | Accounts off; log local only. Database is solely the signaling mailbox |
| Real terrain, real airports | Public World remains excluded even though S6 is complete |
| JSBSim | A future comparison, not currently loaded or promised by the briefing |
| Downloaded sounds or textures | Engine and stall are oscillators and noise. Keep it that way unless a quest says otherwise |
| A fully modeled cabin / radio stack | Q-views has a seat camera, procedural windshield rim/glareshield, and shared six-pack. No navigation radio or simulated switches |

## A known stamp, not a mystery

S1 reconciled the stamp: `FIELD_ELEV_M` is exactly `2871 * 0.3048`.
The placard and briefing read the same **2,871 ft** constant; density uses its
metric conversion. The instrument altitude additionally includes the
aircraft's height above the field (including gear height at rest).

The runway in the model is 2400 m long and 46 m wide. That is a generous fictional strip so a takeoff roll has room to teach. It is not a claim about any real Boise runway. Public World keeps this strip as the school field.

## How to know Phase 0 is still alive

From a checkout, with the app running:

- The briefing names Field 28, N172FD, and N344TG.
- Hold W. The airplane rolls, rotates, and climbs. It does not need a network.
- In the air, A drops the left wing and the nose yaws left. D does the opposite.
- Pull to a stall and the tone sounds. The wing drops. You can recover, or you can hit.
- Traffic stays near the field. If it flies to the horizon, the pattern pilot has regressed and that is a spine bug, not a feature.

## Repeatable acceptance in every harness

```sh
npm run test:sim
npm run typecheck
npm run build
sh startup.sh
npm run test:flight-browser -- http://127.0.0.1:8080/ --live
npm run preview:restart
npm run test:flight-browser -- http://127.0.0.1:8081/ --live
npm run preview:stop
```

`test:sim` covers all 22 simulation/quest checks, including an actual
input-tape circuit and deterministic replay, the unchanged standard-aircraft
physical hash, three-minute traffic bounds, weather, log, and packet/encryption
validation. `test:flight-browser` uses the installed Playwright browser,
desktop and 390×844 viewports, five camera modes without state changes,
left/right controls, night, moving map, persistent/isolated/forgotten logs,
offline player and traffic, zero solo signaling requests, and (with `--live`)
two independent real WebRTC pilots plus departure cleanup. Editing room-code
inputs does not trigger flight shortcuts. Its screenshots are evidence, not app assets.
The platform smoke script adds a separate desktop/mobile render audit.

These tests do not certify flight realism, strict-NAT connectivity, or a
production database that has not been provisioned. The platform-wide
`npm test` is separate from `test:sim`; its previously observed PWA/identity
baseline failures are not simulation acceptance.
