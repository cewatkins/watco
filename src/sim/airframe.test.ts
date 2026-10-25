import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createPlayer, STANDARD_AERO, LIGHT_AERO, runwayForward, FIXED_DT, step, IDLE_INPUT } from "./fdm.ts";

test("Q-second-airframe: one step, different loading and thrust-to-weight", () => {
  const takeoff = (aero: typeof STANDARD_AERO) => {
    const ship = createPlayer(aero), start = { x: ship.x, z: ship.z }, f = runwayForward();
    for (let i = 0; i < 7200 && ship.onGround; i++) step(ship, { ...IDLE_INPUT, throttle: 1, elevator: 0.45 }, FIXED_DT);
    assert.ok(!ship.onGround && !ship.crashed);
    return (ship.x - start.x) * f.x + (ship.z - start.z) * f.z;
  };
  assert.ok(LIGHT_AERO.mass / LIGHT_AERO.wingArea < STANDARD_AERO.mass / STANDARD_AERO.wingArea);
  assert.ok(LIGHT_AERO.thrustMax / LIGHT_AERO.mass > STANDARD_AERO.thrustMax / STANDARD_AERO.mass);
  const normal = takeoff(STANDARD_AERO), light = takeoff(LIGHT_AERO);
  assert.ok(light < normal * 0.8, `${light} m vs ${normal} m`);
  assert.equal(createPlayer().aero, STANDARD_AERO);
});
