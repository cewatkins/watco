# `step()` state ownership contract

## State and units

`Ship` stores world position in meters (`x`, `y`, `z`), velocity in meters per
second (`vx`, `vy`, `vz`), attitude in radians (`yaw`, `pitch`, `roll`), and
angular rates in radians per second. Instrument fields deliberately use pilot
units: indicated and true airspeed in knots, altitude and AGL in feet, vertical
speed in feet per minute, and heading in degrees.

The world uses three.js axes with Y up. Yaw zero faces world −Z; positive yaw
turns left. Positive pitch raises the nose. Positive roll lowers the left
wing. Positive aileron rolls left, positive elevator pulls, and positive
rudder yaws left.

## Ownership

`step(ship, input, dt)` in `src/sim/fdm.ts` is the sole flight-state
integrator. It is the only function that continuously advances position,
velocity, attitude, rates, engine state, and derived instrument fields.
`patternPilot(ship)` returns inputs only; the player loop and traffic loop both
pass those inputs through `step`.

The constructors (`createShip`, `createPlayer`, and `createTraffic`) and
`placeAirborne` can initialize or reset a ship to a starting state. They do not
integrate forces or advance time. The scene may read `Ship` and place its own
Three.js objects and camera, but it must not write aircraft state.

## Time step

The simulation step is `FIXED_DT = 1 / 60` seconds. The browser loop accumulates
render time and calls `step` only in fixed-size slices. A caller must pass
`FIXED_DT`; frame delta, elapsed wall time, and variable-size slices are not
valid substitutes.

## Rendering boundary

`src/sim/scene.ts` derives aircraft orientation from the shared `basis()`
function and reads ship values to draw the aircraft, instruments, and cameras.
`src/components/flight-sim.tsx` owns input collection, the fixed-step
accumulator, and the calls to `step`; it does not compute lift, drag, thrust,
acceleration, or a second altitude/energy model. There is no force-shaped
flight math outside `src/sim/fdm.ts`.

If a display needs a value not already on `Ship`, add and derive it in the
flight model only when it is genuinely part of the model contract. Do not
integrate or smooth a second aircraft state in a gauge or camera.
