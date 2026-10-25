import { patternPosition, runwayPosition, RWY_LENGTH, RWY_WIDTH, RWY_YAW, wrapPi, type Ship } from "./fdm.ts";

export const CIRCUIT_TASKS = ["Takeoff", "Crosswind", "Downwind", "Base", "Final", "Full stop"] as const;
export type CircuitProgress = { completed: number; airborne: boolean; failed: boolean };
export const newCircuit = (): CircuitProgress => ({ completed: 0, airborne: false, failed: false });

export function scoreCircuit(progress: CircuitProgress, ship: Ship): CircuitProgress {
  if (progress.failed || progress.completed === CIRCUIT_TASKS.length) return progress;
  if (ship.crashed) return { ...progress, failed: true };
  const p = patternPosition(ship);
  const airborne = progress.airborne || !ship.onGround;
  const course = [RWY_YAW, RWY_YAW + Math.PI / 2, RWY_YAW + Math.PI, RWY_YAW + Math.PI * 1.5, RWY_YAW];
  const aligned = Math.abs(wrapPi(ship.yaw - course[Math.min(progress.completed, 4)]!)) < Math.PI / 3;
  let achieved = false;
  if (progress.completed === 0) achieved = !ship.onGround && ship.y > 20 && p.along > 0 && p.along < RWY_LENGTH && Math.abs(p.across) < 250;
  else if (progress.completed < 5) {
    const leg = ["", "crosswind", "downwind", "base", "final"][progress.completed];
    achieved = !ship.onGround && ship.y > 10 && p.distance < 650 && p.leg === leg && aligned;
  } else {
    const runway = runwayPosition(ship);
    achieved = airborne && ship.onGround && Math.hypot(ship.vx, ship.vz) < 1
      && runway.along >= 0 && runway.along <= RWY_LENGTH && Math.abs(runway.across) <= RWY_WIDTH / 2;
  }
  return { completed: progress.completed + (achieved ? 1 : 0), airborne, failed: false };
}
