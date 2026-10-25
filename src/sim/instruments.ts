import type { Ship } from "./fdm";

const RAD_TO_DEG = 180 / Math.PI;
const AIRSPEED_MAX_KT = 160;
const VSI_MAX_FPM = 2000;
const ALTITUDE_CYCLE_FT = 10_000;

export type InstrumentReadings = {
  airspeedAngle: number;
  airspeedLabel: string;
  attitudePitchPx: number;
  attitudeRollDeg: number;
  attitudeLabel: string;
  altimeterAngle: number;
  altitudeLabel: string;
  turnAngle: number;
  turnLabel: string;
  headingCardAngle: number;
  headingLabel: string;
  verticalSpeedAngle: number;
  verticalSpeedLabel: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function signed(value: number): string {
  return `${value > 0 ? "+" : ""}${value}`;
}

function headingText(heading: number): string {
  const rounded = Math.round(heading);
  return String(((rounded % 360) + 360) % 360).padStart(3, "0");
}

export function instrumentReadings(ship: Ship): InstrumentReadings {
  const pitchDeg = ship.pitch * RAD_TO_DEG;
  const rollDeg = ship.roll * RAD_TO_DEG;
  const verticalSpeed = Math.round(ship.vsiFpm / 50) * 50;
  const rollRate = ship.rollRate * RAD_TO_DEG;
  const altitudeCycle = ((ship.altFt % ALTITUDE_CYCLE_FT) + ALTITUDE_CYCLE_FT) % ALTITUDE_CYCLE_FT;

  return {
    airspeedAngle: -135 + clamp(ship.iasKt / AIRSPEED_MAX_KT, 0, 1) * 270,
    airspeedLabel: `${Math.round(ship.iasKt)} kt`,
    attitudePitchPx: clamp(pitchDeg * 0.7, -24, 24),
    attitudeRollDeg: -rollDeg,
    attitudeLabel: `P${signed(Math.round(pitchDeg))}°  B${signed(Math.round(rollDeg))}°`,
    altimeterAngle: (altitudeCycle / ALTITUDE_CYCLE_FT) * 360,
    altitudeLabel: `${Math.round(ship.altFt).toLocaleString("en-US")} ft`,
    turnAngle: clamp(-rollRate * 1.5, -45, 45),
    turnLabel: `${signed(Math.round(rollRate))}°/s`,
    headingCardAngle: -ship.heading,
    headingLabel: headingText(ship.heading),
    verticalSpeedAngle: (clamp(ship.vsiFpm, -VSI_MAX_FPM, VSI_MAX_FPM) / VSI_MAX_FPM) * 135,
    verticalSpeedLabel: `${verticalSpeed > 0 ? "+" : ""}${verticalSpeed} fpm`,
  };
}
