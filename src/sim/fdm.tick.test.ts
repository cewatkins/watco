/**
 * S1 tick test — the headless check that locks the reduced model.
 * Runs with no browser and no renderer:
 *
 *   node --experimental-strip-types --test src/sim/fdm.tick.test.ts
 *
 * The four checks are the chapter items in docs/04-spine.md S1.
 * The wind stays the constant pair 280/08 until S6 makes weather an
 * argument, so check 4 poses "wind from the left" by rolling on heading
 * 010, which points the fixed wind across the airplane's left side.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  FIXED_DT,
  IDLE_INPUT,
  RWY_LENGTH,
  basis,
  createPlayer,
  createShip,
  createTraffic,
  headingToYaw,
  patternPilot,
  placeAirborne,
  runwayForward,
  step,
  type PilotInput,
  type Ship,
} from "./fdm.ts";

const HOLD = (p: Partial<PilotInput>): PilotInput => ({ ...IDLE_INPUT, failure: "none", ...p });

/** One input for a number of seconds, in FIXED_DT slices. Nothing else. */
function run(ship: Ship, input: PilotInput, seconds: number): void {
  const n = Math.round(seconds / FIXED_DT);
  for (let i = 0; i < n; i++) step(ship, input, FIXED_DT);
}

describe("S1 tick test — N172FD through step()", () => {
  it("1 · full throttle from the threshold: airborne inside the strip, climbing through 400 ft AGL without reversing the vertical speed", () => {
    const ship = createPlayer();
    const f = runwayForward();
    const sx = ship.x;
    const sz = ship.z;
    const runDist = () => (ship.x - sx) * f.x + (ship.z - sz) * f.z;
    let liftDist = -1;
    let phugoid: string | null = null;
    const rotateKIAS = 62; // kias: hold pull past the unstick speed, then trim it
    let t = 0;
    while (t < 180 && !ship.crashed && (liftDist < 0 || ship.aglFt < 400)) {
      const pull = ship.iasKt < rotateKIAS ? 0.45 : 0.3;
      step(ship, HOLD({ throttle: 1, elevator: pull }), FIXED_DT);
      t += FIXED_DT;
      if (liftDist < 0 && !ship.onGround) liftDist = runDist();
      if (liftDist >= 0 && ship.aglFt > 50 && ship.aglFt < 400 && ship.vy <= 0) {
        phugoid = `vertical speed went ${ship.vy.toFixed(2)} m/s at ${ship.aglFt.toFixed(0)} ft AGL, t=${t.toFixed(1)} s`;
      }
    }
    assert.ok(!ship.crashed, `crashed: ${ship.crashReason}`);
    assert.ok(liftDist > 0 && liftDist < RWY_LENGTH, `airborne at ${liftDist.toFixed(0)} m of a ${RWY_LENGTH} m strip`);
    assert.ok(ship.aglFt >= 400, `only reached ${ship.aglFt.toFixed(0)} ft AGL`);
    assert.ok(phugoid === null, phugoid ?? "");
  });

  it("2 · airborne, wings level, aileron +1 for half a second: roll increases, left wing down", () => {
    const ship = createShip({ id: "t2", callsign: "TEST2" });
    placeAirborne(ship);
    run(ship, HOLD({ elevator: 0.2, throttle: 0.75 }), 0.5);
    const roll0 = ship.roll;
    run(ship, HOLD({ aileron: 1, elevator: 0.2, throttle: 0.75 }), 0.5);
    assert.ok(!ship.crashed, ship.crashReason);
    assert.equal(roll0, 0, "did not start wings level");
    assert.ok(ship.roll > 0, `roll ${ship.roll.toFixed(3)} after 0.5 s of aileron +1 — not left wing down`);
  });

  it("3 · hands off after a bank: the wings come back toward level", () => {
    const ship = createShip({ id: "t3", callsign: "TEST3" });
    placeAirborne(ship);
    run(ship, HOLD({ aileron: 1, elevator: 0.2, throttle: 1 }), 0.7);
    const banked = ship.roll;
    assert.ok(banked > 0.1, `only banked ${banked.toFixed(3)} before the check`);
    run(ship, HOLD({ elevator: 0.2, throttle: 1 }), 3);
    assert.ok(!ship.crashed, ship.crashReason);
    assert.ok(Math.abs(ship.roll) < Math.abs(banked), `roll stayed at ${ship.roll.toFixed(3)} after 3 s hands-off from ${banked.toFixed(3)}`);
  });

  it("4 · wind from the left on the takeoff roll: the ground track drifts downwind, and a headwind roll does not", () => {
    const drifting = createShip({ id: "t4", callsign: "TEST4", yaw: headingToYaw(10) });
    const straight = createShip({ id: "t5", callsign: "TEST5" });
    const { x: ax, z: az } = drifting;
    const { x: hx, z: hz } = straight;
    run(drifting, HOLD({ throttle: 1 }), 14);
    run(straight, HOLD({ throttle: 1 }), 14);
    assert.ok(!drifting.crashed && !straight.crashed, "takeoff roll wrecked");

    // lateral offset from the roll axis: positive is to the airplane's right
    const offset = (dx: number, dz: number, yaw: number) => {
      const { f, r } = basis(yaw, 0, 0);
      assert.ok((dx * f.x + dz * f.z) > 0, "the airplane never moved");
      return dx * r.x + dz * r.z;
    };
    // heading 010 puts the fixed 280/08 wind on the left: drift right, downwind
    const cross = offset(drifting.x - ax, drifting.z - az, headingToYaw(10));
    // heading 280 takes the same wind dead ahead: no drift off the roll line
    const head = offset(straight.x - hx, straight.z - hz, headingToYaw(280));
    assert.ok(cross > 0.5, `crosswind roll drifted only ${cross.toFixed(3)} m right in 14 s`);
    assert.ok(Math.abs(head) < 0.05, `headwind roll drifted ${head.toFixed(3)} m — wind leaking sideways`);
  });
});

describe("Q-failures — optional deterministic faults", () => {
  it("none preserves the byte-exact S1 baseline outcome", () => {
    const first = createPlayer();
    const f = runwayForward();
    const sx = first.x;
    const sz = first.z;
    const runDist = () => (first.x - sx) * f.x + (first.z - sz) * f.z;
    let liftDist = -1;
    let t = 0;
    while (t < 180 && !first.crashed && (liftDist < 0 || first.aglFt < 400)) {
      step(first, HOLD({ throttle: 1, elevator: first.iasKt < 62 ? 0.45 : 0.3 }), FIXED_DT);
      t += FIXED_DT;
      if (liftDist < 0 && !first.onGround) liftDist = runDist();
    }

    const second = createShip({ id: "t2", callsign: "TEST2" });
    placeAirborne(second);
    run(second, HOLD({ elevator: 0.2, throttle: 0.75 }), 0.5);
    run(second, HOLD({ aileron: 1, elevator: 0.2, throttle: 0.75 }), 0.5);

    const third = createShip({ id: "t3", callsign: "TEST3" });
    placeAirborne(third);
    run(third, HOLD({ aileron: 1, elevator: 0.2, throttle: 1 }), 0.7);
    run(third, HOLD({ elevator: 0.2, throttle: 1 }), 3);

    const drift = createShip({ id: "t4", callsign: "TEST4", yaw: headingToYaw(10) });
    const straight = createShip({ id: "t5", callsign: "TEST5" });
    run(drift, HOLD({ throttle: 1 }), 14);
    run(straight, HOLD({ throttle: 1 }), 14);

    const outcome = [first, second, third, drift, straight].map((ship) =>
      Object.fromEntries(
        Object.entries(ship).map(([key, value]) => [key, typeof value === "number" ? Number(value.toFixed(9)) : value]),
      ),
    );
    const baseline = createHash("sha256").update(JSON.stringify(outcome)).digest("hex");
    assert.equal(baseline, "3decda84dfd8456059d1d8aa67652d8417810a2457d3b8473c4a7d074799faf1");
  });

  it("partial power caps thrust and leaves the pattern aircraft healthy", () => {
    const healthy = createPlayer();
    const partial = createPlayer();
    const input = HOLD({ throttle: 1 });
    run(healthy, input, 8);
    run(partial, { ...input, failure: "partial-power" }, 8);
    assert.ok(Math.hypot(healthy.vx, healthy.vz) > Math.hypot(partial.vx, partial.vz));

    const traffic = createTraffic();
    assert.equal(patternPilot(traffic).failure, undefined);
  });

  it("heavy wing develops a small left-roll tendency that the healthy aircraft does not", () => {
    const healthy = createShip({ id: "healthy", callsign: "HEALTHY" });
    const heavyWing = createShip({ id: "heavy", callsign: "HEAVY" });
    placeAirborne(healthy);
    placeAirborne(heavyWing);
    const input = HOLD({ elevator: 0.2, throttle: 0.75 });
    run(healthy, input, 4);
    run(heavyWing, { ...input, failure: "heavy-wing" }, 4);
    assert.ok(heavyWing.roll > healthy.roll + 0.01, `heavy wing roll ${heavyWing.roll.toFixed(3)} vs healthy ${healthy.roll.toFixed(3)}`);
    assert.ok(heavyWing.roll < 0.2, `heavy-wing bias is too strong: ${heavyWing.roll.toFixed(3)}`);
  });
});
