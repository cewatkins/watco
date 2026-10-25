import { strict as assert } from "node:assert";
import { test } from "node:test";
import { mapPoint } from "./map.ts";
test("Q-map: north up, east right, moving dots and explicit off-map state", () => {
  const a = mapPoint({ x: -1000, z: 0 });
  assert.ok(mapPoint({ x: -1000, z: -100 }).y < a.y);
  assert.ok(mapPoint({ x: -900, z: 0 }).x > a.x);
  assert.equal(a.offMap, false);
  assert.deepEqual(mapPoint({ x: 1e6, z: -1e6 }), { x: 196, y: 4, offMap: true });
});
