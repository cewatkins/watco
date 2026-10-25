import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createPlayer, step, IDLE_INPUT, FIXED_DT } from "./fdm.ts";
import { roomCodec, presencePacket, readPresence } from "./presence.ts";

test("S8: stepped aircraft and controls survive validation; malicious packets rejected", () => {
  const ship = createPlayer();
  const input = { ...IDLE_INPUT, throttle: 1 };
  for (let i = 0; i < 100; i++) step(ship, input, FIXED_DT);
  const packet = readPresence(presencePacket(ship, input, 2), "remote");
  assert.equal(packet.ship.x, ship.x);
  assert.equal(packet.ship.id, "remote");
  assert.deepEqual(packet.input, input);
  assert.throws(() => readPresence({ version: 1, sequence: 0, ship: { ...ship, x: Infinity }, input }, "remote"), /Invalid/);
  assert.throws(() => readPresence({ version: 1, sequence: 0, ship, input: { ...input, throttle: 10 } }, "remote"), /Invalid/);
});
test("S8: signaling encrypted at rest; only invited room can decode", async () => {
  const a = await roomCodec("a".repeat(32)), b = await roomCodec("b".repeat(32));
  const signal = { type: "offer", sdp: "private handshake" };
  const sealed = await a.encode(signal);
  assert.ok(!JSON.stringify(sealed).includes("private"));
  assert.deepEqual(await a.decode(sealed), signal);
  await assert.rejects(() => b.decode(sealed));
  await assert.rejects(() => roomCodec("public"));
});
