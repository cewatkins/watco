import { strict as assert } from "node:assert";
import { test } from "node:test";
import { newCircuit, scoreCircuit } from "./circuit.ts";
import { createPlayer, createShip, runwayForward, runwayRight, RWY_YAW, step, patternPilot, patternPosition, FIXED_DT, clamp, type PilotInput } from "./fdm.ts";

test("S5: ordered state observations finish only with a full stop on the strip", () => {
  const f = runwayForward(), r = runwayRight();
  let progress = newCircuit();
  for (const [along, across, yaw, y] of [
    [500, 0, RWY_YAW, 30], [2500, -500, RWY_YAW + Math.PI / 2, 305],
    [1500, -1000, RWY_YAW + Math.PI, 305], [-100, -500, RWY_YAW + Math.PI * 1.5, 100],
    [200, 0, RWY_YAW, 30], [800, 0, RWY_YAW, 1.55],
  ]) {
    const ship = createShip({ id: "test", callsign: "T", x: f.x * along! + r.x * across!, z: f.z * along! + r.z * across!, y: y!, yaw: yaw!, onGround: y === 1.55 });
    progress = scoreCircuit(progress, ship);
  }
  assert.equal(progress.completed, 6);
  assert.equal(progress.failed, false);
});

test("S5: a recorded control tape flies the whole circuit and stops on the runway", () => {
  const ship = createPlayer();
  let progress = newCircuit();
  const tape: PilotInput[] = [];
  for (let tick = 0; tick < 420 * 60 && progress.completed < 6 && !ship.crashed; tick++) {
    let input = patternPilot(ship);
    if (progress.completed === 0) input = { ...input, aileron: 0, rudder: 0, elevator: 0.65, throttle: 1 };
    if (progress.completed >= 4) {
      const targetHeight = Math.max(0, (700 - patternPosition(ship).along) * 0.08);
      input = {
        ...input,
        throttle: ship.onGround ? 0 : 0.2,
        elevator: clamp((targetHeight - ship.y) * 0.015 - ship.vy * 0.18, -1, 1),
        brake: ship.onGround ? 1 : 0,
      };
    }
    tape.push(input);
    step(ship, input, FIXED_DT);
    progress = scoreCircuit(progress, ship);
  }
  assert.equal(progress.completed, 6, JSON.stringify({ progress, ship }));
  const replay = createPlayer();
  let replayScore = newCircuit();
  for (const input of tape) {
    step(replay, input, FIXED_DT);
    replayScore = scoreCircuit(replayScore, replay);
  }
  assert.deepEqual(replayScore, progress);
  assert.deepEqual(replay, ship);
});

test("S5: flying away, skipped legs, crash, or off-strip stop cannot complete", () => {
  const ship = createPlayer();
  ship.x = 20000; ship.onGround = false; ship.y = 500;
  let progress = newCircuit();
  for (let i = 0; i < 1000; i++) progress = scoreCircuit(progress, ship);
  assert.equal(progress.completed, 0);
  ship.onGround = true;
  assert.equal(scoreCircuit({ completed: 5, airborne: true, failed: false }, ship).completed, 5);
  ship.crashed = true;
  assert.equal(scoreCircuit(progress, ship).failed, true);
});
