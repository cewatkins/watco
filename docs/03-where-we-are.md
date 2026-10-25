# 03 — Where we are

Phase 0 is real. It is published. Do not rebuild it. Extend it.

This chapter is the map of the code a stranger needs before S1. If a file is not listed here, it is platform shell (router, auth helpers, PWA) and a flight chapter should not edit it.

## What you can do in the page

- Sit on runway 28 at a high-elevation field. The placard reads **2,871 ft**, wind **280 at 8**.
- Fly N172FD, a 172-class trainer. Chase, tower, and left-wing cameras (`C`).
- Hear a synthesized engine whose pitch and volume follow RPM, a flap click on
  flap changes, and a stall tone when the wing quits. Sound starts after the
  first click.
- Read a procedural six-pack driven by the same airplane state as the text
  backup row.
- Watch N344TG hold a left orbit at about 1,000 ft above the field.
- Crash on a wing strike, a prop strike, or a hard landing, then reset (`R`).
- Fly with keys, a gamepad, or the phone yoke.
- Choose a healthy trainer, partial power capped at 55% thrust, or a small
  left-roll tendency before start. Failures are off by default and affect only
  the player aircraft.

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

Fixed step `FIXED_DT = 1/60`. Mass 1043 kg. Wing area 16.2 m². Max thrust 2500 N. Gear height 1.55 m. Those are 172-class round numbers, not a certified model.

`step(ship, input, dt)`:

- Lags the throttle so the lever is not the engine.
- Computes density with an exponential drop from field elevation.
- Builds an orthonormal body basis (yaw, then pitch, then roll). Positive roll is left wing down.
- Lift from a linear lift slope plus flap increments, with a stall break. Drag from a parasite term plus lift-squared.
- Thrust falls off as speed rises.
- On the ground: friction, brakes, steering from rudder and aileron, a rotate pitch once you are fast enough and pulling.
- In the air: a pitch target of flight-path angle plus a target angle of attack, so a held pull does not porpoise forever. Hands-off, the wings level gently, because a keyboard has no force feedback.
- Writes instrument fields onto the ship: IAS, TAS, altitude, AGL, vertical speed, heading, angle of attack, stall flag.
- Sets `crashed` and a short reason. A crashed ship stops stepping.

`patternPilot(ship)` returns a `PilotInput`. It does not move the airplane itself. Traffic goes through the same `step` you do. Today that pilot holds a **circle** of radius 1200 m around the runway center, near y = 305 m. It is not yet a rectangular traffic pattern. That is S4, not a bug you silently "fix" inside another chapter.

`Ship` is the whole state a picture needs. If a gauge needs a fact that is not on `Ship`, add the fact in `step`, then read it. Do not recompute aerodynamics in the panel.

The ownership, axes, units, and fixed-step rules are recorded in the
[`step()` state contract](contracts/step.md). Constructors and `placeAirborne`
may set initial state; only `step()` integrates the aircraft forward.

### `src/sim/scene.ts` — the picture

Three.js. Builds a procedural trainer (high wing, prop, beacon, stripe color per ship), a runway with 28 and 10 painted on it, sagebrush, a windsock aimed by the constant wind, fog, and hills that are scenery, not collision.

`mountWorld(canvas)` returns `render(player, traffic, dt, cam)`. Attitude comes from `basis()` in the flight model, the same function the forces use. If the picture and the forces ever disagree about "left", this shared basis is why. Keep it that way.

Cameras: `chase`, `tower`, `wing`.

Nothing in this file may add a force, a new velocity, or a second notion of altitude.

### `src/components/flight-sim.tsx` — the loop and the panel

React owns the frame clock and the DOM. It accumulates time and calls `step` in fixed slices (at most 20 per frame, so a stalled tab cannot explode the integrator).

Phases: `brief`, `fly`, `crash`.

The six-pack is a procedural SVG presentation of `Ship`: airspeed, attitude,
altitude, turn trend, heading, and vertical speed. The text row remains the
exact-value backup, with RPM, throttle, and flaps. Refs, not React state, on
purpose: the instruments update in the existing render loop without a 60 Hz
page re-render.

`window.__controlsTest` exposes `getYaw`, `getSpeed`, `getRoll`, `setKeys`, and `prepRollTest` so a browser check can fly the airplane without a human. Leave it. A chapter that removes it has to replace the check, not just the window object.

## What is deliberately absent

| You might expect | Where it actually stands |
|---|---|
| A rectangular traffic pattern | Orbit. S4 |
| Live wind you can change | Two constants, `WIND_FROM_DEG` and `WIND_KT`. S6 turns them into an argument |
| A second airplane type | One mass, one wing, one thrust. A later quest may add a **table**, not a second `step` |
| Multiplayer | `src/lib/multiplayer/p2p.ts` is a WebRTC client looking for `POST /api/rtc`. That route does not exist. Nothing in the sim imports it. S8 decides what "another human" means, and it is not "call this class and hope" |
| Accounts, a logbook, a database | Off. The platform has auth helpers. Flight chapters do not import them |
| Real terrain, real airports, METAR | Public World, after S6 |
| JSBSim | Named in the briefing as later. The reduced model stays the one that flies until P5 **compares** against it. It is not deleted |
| Downloaded sounds or textures | Engine and stall are oscillators and noise. Keep it that way unless a quest says otherwise |
| A cockpit you can sit in | Cameras are outside the cabin. Q-views, and only after the panel quest, or the cockpit is an empty box |

## A known stamp, not a mystery

The placard and the altitude readout at rest say **2,871 ft** (Boise's published field elevation). The density model uses `FIELD_ELEV_M = 870`, which is about **2,854 ft**. Both are "Boise-high". They are not the same number. S1 reconciles them. Do not "correct" one of them inside an unrelated chapter.

The runway in the model is 2400 m long and 46 m wide. That is a generous fictional strip so a takeoff roll has room to teach. It is not a claim about any real Boise runway. Public World keeps this strip as the school field.

## How to know Phase 0 is still alive

From a checkout, with the app running:

- The briefing names Field 28, N172FD, and N344TG.
- Hold W. The airplane rolls, rotates, and climbs. It does not need a network.
- In the air, A drops the left wing and the nose yaws left. D does the opposite.
- Pull to a stall and the tone sounds. The wing drops. You can recover, or you can hit.
- Traffic stays near the field. If it flies to the horizon, the pattern pilot has regressed and that is a spine bug, not a feature.

A headless version of those checks is the entire point of S1. Until S1 lands, a human still has to fly the check.
