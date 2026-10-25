import { strict as assert } from "node:assert";
import { test } from "node:test";
import { appendFlight, readFlightLog, forgetFlights, LOG_KEY, type LogStorage } from "./log.ts";
function storage(): LogStorage {
  const data = new Map<string, string>();
  return { getItem: k => data.get(k) ?? null, setItem: (k, v) => { data.set(k, v); }, removeItem: k => { data.delete(k); } };
}
test("S7: reload retains local records, separate store empty, forget removes", () => {
  const local = storage();
  const record = { startedAt: "2026-10-25T00:00:00Z", airborneSeconds: 40, landingKind: "full stop" as const, maxAltitudeFt: 3500 };
  appendFlight(local, record);
  assert.deepEqual(readFlightLog(local), [record]);
  assert.deepEqual(readFlightLog(storage()), []);
  forgetFlights(local);
  assert.deepEqual(readFlightLog(local), []);
});
test("S7: bounded log and explicit corruption/storage errors", () => {
  const local = storage();
  for (let i = 0; i < 60; i++) appendFlight(local, { startedAt: new Date().toISOString(), airborneSeconds: i, landingKind: "reset", maxAltitudeFt: 3000 });
  assert.equal(readFlightLog(local).length, 50);
  local.setItem(LOG_KEY, '{"bad": true}');
  assert.throws(() => readFlightLog(local), /invalid/);
  assert.throws(() => appendFlight({ ...local, setItem: () => { throw new Error("Quota exceeded"); } }, { startedAt: new Date().toISOString(), airborneSeconds: 0, landingKind: "reset", maxAltitudeFt: 3000 }), /invalid/);
  forgetFlights(local);
  assert.throws(() => appendFlight({ ...local, setItem: () => { throw new Error("Quota exceeded"); } }, { startedAt: new Date().toISOString(), airborneSeconds: 0, landingKind: "reset", maxAltitudeFt: 3000 }), /Quota/);
});
