import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createTraffic, step, patternPilot, patternPosition, FIXED_DT, PATTERN_HEIGHT } from "./fdm.ts";

test("S4: traffic completes a bounded circuit in three minutes through step", () => {
  const ship = createTraffic();
  const legs = new Set<string>();
  const transitions: string[] = [];
  let minHeight = ship.y;
  for (let tick = 0; tick < 180 * 60; tick++) {
    const before = JSON.stringify(ship);
    const input = patternPilot(ship);
    assert.equal(JSON.stringify(ship), before, "pilot must not mutate the aircraft");
    step(ship, input, FIXED_DT);
    const p = patternPosition(ship);
    legs.add(p.leg);
    if (transitions.at(-1) !== p.leg) transitions.push(p.leg);
    minHeight = Math.min(minHeight, ship.y);
    assert.ok(!ship.crashed);
    assert.ok(p.along > -700 && p.along < 3100 && p.across > -1600 && p.across < 600, JSON.stringify(p));
  }
  assert.equal(legs.size, 5, `legs reached: ${[...legs]}`);
  assert.deepEqual(transitions.slice(0, 6), ["upwind", "crosswind", "downwind", "base", "final", "upwind"]);
  assert.ok(minHeight > PATTERN_HEIGHT - 152.4, `minimum altitude ${minHeight}`);
  assert.ok(Math.hypot(ship.x - createTraffic().x, ship.z - createTraffic().z) < 1500, "circuit returns near start");
});
