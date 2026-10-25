import { strict as assert } from "node:assert";
import { test } from "node:test";
import { DEFAULT_WEATHER, createPlayer, step, FIXED_DT, IDLE_INPUT, runwayRight, windAt, rhoAt, weatherLabel } from "./fdm.ts";

test("S6: explicit default/zero gust exactly matches implicit baseline", () => {
  assert.equal(weatherLabel(DEFAULT_WEATHER), "280/08 kt");
  assert.equal(weatherLabel({ ...DEFAULT_WEATHER, windX: 0, windZ: 0 }), "calm");
  const a = createPlayer(), b = createPlayer();
  for (let i = 0; i < 3600; i++) {
    const input = { ...IDLE_INPUT, throttle: 1, elevator: 0.3 };
    step(a, input, FIXED_DT);
    step(b, input, FIXED_DT, { ...DEFAULT_WEATHER, gustAmplitude: 0 });
  }
  assert.deepEqual(a, b);
});
test("S6: same weather vector drives crosswind drift and windsock input", () => {
  const r = runwayRight();
  const weather = { ...DEFAULT_WEATHER, windX: r.x * 5, windZ: r.z * 5 };
  assert.deepEqual(windAt(weather, 0, 0), { x: weather.windX, z: weather.windZ });
  const drift = createPlayer(), calm = createPlayer();
  const start = { x: drift.x, z: drift.z };
  for (let i = 0; i < 840; i++) {
    step(drift, { ...IDLE_INPUT, throttle: 1 }, FIXED_DT, weather);
    step(calm, { ...IDLE_INPUT, throttle: 1 }, FIXED_DT, { ...weather, windX: 0, windZ: 0 });
  }
  const lateral = (s: typeof drift) => (s.x - start.x) * r.x + (s.z - start.z) * r.z;
  assert.ok(lateral(drift) > 0.5);
  assert.ok(Math.abs(lateral(calm)) < 0.01);
  assert.ok(rhoAt(100, { ...weather, densityAltitudeOffsetM: 1000 }) < rhoAt(100, weather));
  assert.notDeepEqual(windAt({ ...weather, gustAmplitude: 2 }, 100, 100), windAt(weather, 100, 100));
});
