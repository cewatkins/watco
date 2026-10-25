import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createShip } from "./fdm.ts";
import { instrumentReadings } from "./instruments.ts";

describe("Q-panel — Ship-derived instrument targets", () => {
  it("maps the six instruments to the current aircraft values", () => {
    const ship = createShip({
      id: "panel",
      callsign: "PANEL",
      iasKt: 80,
      pitch: Math.PI / 12,
      roll: Math.PI / 6,
      altFt: 5280,
      rollRate: 0.2,
      heading: 90,
      vsiFpm: 1000,
    });
    const readings = instrumentReadings(ship);

    assert.equal(readings.airspeedLabel, "80 kt");
    assert.equal(readings.airspeedAngle, 0);
    assert.equal(readings.attitudeLabel, "P+15°  B+30°");
    assert.ok(Math.abs(readings.attitudePitchPx - 10.5) < 1e-9);
    assert.ok(Math.abs(readings.attitudeRollDeg + 30) < 1e-9);
    assert.equal(readings.altitudeLabel, "5,280 ft");
    assert.ok(Math.abs(readings.altimeterAngle - 190.08) <= 1.8, "altitude needle must stay within 50 ft");
    assert.equal(readings.turnLabel, "+11°/s");
    assert.ok(Math.abs(readings.turnAngle - -17.1887338539) < 1e-8);
    assert.equal(readings.headingLabel, "090");
    assert.equal(readings.headingCardAngle, -90);
    assert.equal(readings.verticalSpeedLabel, "+1000 fpm");
    assert.ok(Math.abs(readings.verticalSpeedAngle - 67.5) <= 3.375, "vertical-speed needle must stay within 50 fpm");
  });

  it("clamps needles to their printed limits and wraps rounded heading", () => {
    const ship = createShip({
      id: "limits",
      callsign: "LIMITS",
      iasKt: 200,
      altFt: 12_000,
      heading: 359.7,
      vsiFpm: -3000,
    });
    const readings = instrumentReadings(ship);

    assert.equal(readings.airspeedAngle, 135);
    assert.equal(readings.altimeterAngle, 72);
    assert.equal(readings.headingLabel, "000");
    assert.equal(readings.verticalSpeedAngle, -135);
  });
});
