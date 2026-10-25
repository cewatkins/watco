import { patternPosition, RWY_HDG, type Ship } from "./fdm.ts";

export function radioCall(ship: Ship): string {
  const p = patternPosition(ship);
  const location = ship.onGround ? "on the ground"
    : p.distance > 1000 ? "outside the practice circuit"
    : `left ${p.leg}`;
  return `Field 28 traffic, ${ship.callsign}, ${location}, runway ${RWY_HDG / 10}.`;
}
