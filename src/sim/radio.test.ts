import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createPlayer, createTraffic, runwayForward, runwayRight } from "./fdm.ts";
import { radioCall } from "./radio.ts";

test("Q-radio: stationary calls stay fixed; actual position changes the leg", () => {
  const player = createPlayer();
  const call = radioCall(player);
  for (let i = 0; i < 100; i++) assert.equal(radioCall(player), call);
  assert.match(call, /on the ground/);
  const traffic = createTraffic();
  assert.match(radioCall(traffic), /left upwind/);
  const f = runwayForward();
  const r = runwayRight();
  traffic.x = f.x * 1200 - r.x * 1000;
  traffic.z = f.z * 1200 - r.z * 1000;
  assert.match(radioCall(traffic), /left downwind/);
  traffic.x = 9000;
  assert.match(radioCall(traffic), /outside the practice circuit/);
});
