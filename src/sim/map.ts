import { PATTERN_FAR, PATTERN_NEAR, PATTERN_WIDTH, THRESH_X, THRESH_Z, runwayForward, runwayRight, clamp } from "./fdm.ts";

const f = runwayForward();
const r = runwayRight();
export const mapWorldPoint = (along: number, across: number) => ({
  x: THRESH_X + f.x * along + r.x * across,
  z: THRESH_Z + f.z * along + r.z * across,
});
export const MAP_CORNERS = [
  mapWorldPoint(PATTERN_NEAR, 0), mapWorldPoint(PATTERN_FAR, 0),
  mapWorldPoint(PATTERN_FAR, -PATTERN_WIDTH), mapWorldPoint(PATTERN_NEAR, -PATTERN_WIDTH),
];
const minX = Math.min(...MAP_CORNERS.map(p => p.x)) - 700;
const minZ = Math.min(...MAP_CORNERS.map(p => p.z)) - 700;
const extent = Math.max(
  Math.max(...MAP_CORNERS.map(p => p.x)) - minX + 700,
  Math.max(...MAP_CORNERS.map(p => p.z)) - minZ + 700,
);

export function mapPoint(p: { x: number; z: number }) {
  const x = (p.x - minX) / extent * 200;
  const y = (p.z - minZ) / extent * 200;
  return { x: clamp(x, 4, 196), y: clamp(y, 4, 196), offMap: x < 4 || x > 196 || y < 4 || y > 196 };
}
