/**
 * Phase 0 flight model for a 172-class trainer.
 *
 * Reduced-order and coordinated on purpose: coefficient build-up lives in
 * JSBSim later, compiled once and run on both sides. This file is the
 * contract the renderer and (later) the room server both step.
 * Pure numbers — no rendering, no DOM — so a headless tick can audit it.
 *
 * Axes (three.js world, Y up):
 *   yaw 0 faces −Z. +yaw is a left turn (CCW about +Y).
 *   +pitch is nose up. +roll is left wing down.
 *   Aileron +1 rolls left. Elevator +1 is pull (nose up). Rudder +1 yaws left.
 */

export const FIXED_DT = 1 / 60;

/**
 * Field elevation, MSL. 2,871 ft is the published number a Boise pilot already
 * knows; the meter figure is converted once, here, and the placard on the page
 * reads the same height. (S0 used 870 m — about 2,854 ft — which disagreed
 * with the placard. S1 reconciles them at the feet number.)
 */
export const FIELD_ELEV_FT = 2871;
export const FIELD_ELEV_M = FIELD_ELEV_FT * 0.3048; // 875.08 m

export const G = 9.80665;
export const GEAR_HEIGHT = 1.55; // m, CG above the wheels

/**
 * The aero table — every number the model integrates with, one row each,
 * each with a one-line source.
 *
 *   "Handbook, rounded" = a 172-class public handbook figure, converted and
 *   rounded — not a claim of certification.
 *   "Tuning" = a named choice made to keep this reduced model honest at
 *   trainer speeds. If a tick test fails, tune one of these rows and update
 *   its name; do not grow the model.
 */
export const MASS = 1043; // kg — handbook, rounded: 172-class gross weight
export const WING_AREA = 16.2; // m² — handbook, rounded: 174 ft² on the sheet
export const LIFT_SLOPE = 5.0; // per rad — tuning: linear slope held to trim the stall
export const CL0 = 0.2; // tuning: zero-lift lift at the model's level trim attitude
export const STALL_ALPHA_CLEAN = 0.26; // rad — tuning: stall angle of attack, clean
export const STALL_ALPHA_FLAPS = 0.3; // rad — tuning: stall angle with flaps, at the same slope
export const FLAP_CL: Partial<Record<Flaps, number>> = { 10: 0.22, 20: 0.4, 30: 0.55 }; // tuning: lift increment per flap notch
export const FLAP_CD: Partial<Record<Flaps, number>> = { 10: 0.015, 20: 0.03, 30: 0.05 }; // tuning: drag price per flap notch
export const CD0 = 0.03; // parasite drag — tuning: hands-off 172-class cruise speeds
export const INDUCED_K = 0.055; // drag rises with CL² — tuning: glide a trainer can live with
export const THRUST_MAX = 2500; // N static — tuning: thrust-to-weight ~1:4 so W owns the run
export const THRUST_LAPSE = 0.4; // tuning: share of thrust lost by 85 m/s
export const STALL_BREAK = 0.62; // tuning: CL kept past the break, so the stall bites then quits

export const RWY_HDG = 280;
export const RWY_LENGTH = 2400;
export const RWY_WIDTH = 46;
export const THRESH_X = 0;
export const THRESH_Z = 0;

export const WIND_FROM_DEG = 280;
export const WIND_KT = 8;

export type Flaps = 0 | 10 | 20 | 30;

export type PilotInput = {
  aileron: number;
  elevator: number;
  rudder: number;
  throttle: number;
  brake: number;
  flaps: Flaps;
};

export type Ship = {
  id: string;
  callsign: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  pitch: number;
  roll: number;
  rollRate: number;
  pitchRate: number;
  throttle: number;
  rpm: number;
  onGround: boolean;
  crashed: boolean;
  crashReason: string;
  tas: number;
  iasKt: number;
  tasKt: number;
  altFt: number;
  aglFt: number;
  vsiFpm: number;
  heading: number;
  alphaDeg: number;
  stalled: boolean;
};

export type V3 = { x: number; y: number; z: number };

export function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

export function wrapPi(a: number): number {
  let x = a;
  while (x > Math.PI) x -= Math.PI * 2;
  while (x < -Math.PI) x += Math.PI * 2;
  return x;
}

export function headingToYaw(hdgDeg: number): number {
  return (-hdgDeg * Math.PI) / 180;
}

export function yawToHeading(yaw: number): number {
  return ((-yaw * 180) / Math.PI + 360) % 360;
}

export const RWY_YAW = headingToYaw(RWY_HDG);

const _windSpeed = WIND_KT * 0.514444;
const _windYaw = headingToYaw(WIND_FROM_DEG);
/** Air-mass velocity. Wind FROM 280 blows opposite the runway heading. */
export const WIND_X = Math.sin(_windYaw) * _windSpeed;
export const WIND_Z = Math.cos(_windYaw) * _windSpeed;

function rodrigues(v: V3, axis: V3, ang: number): V3 {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const dot = v.x * axis.x + v.y * axis.y + v.z * axis.z;
  const cx = axis.y * v.z - axis.z * v.y;
  const cy = axis.z * v.x - axis.x * v.z;
  const cz = axis.x * v.y - axis.y * v.x;
  return {
    x: v.x * c + cx * s + axis.x * dot * (1 - c),
    y: v.y * c + cy * s + axis.y * dot * (1 - c),
    z: v.z * c + cz * s + axis.z * dot * (1 - c),
  };
}

/** Body basis. f is the nose (+Z of the mesh), r is the right wing, u is cabin-up. */
export function basis(yaw: number, pitch: number, roll: number): { f: V3; r: V3; u: V3 } {
  let f: V3 = { x: -Math.sin(yaw), y: 0, z: -Math.cos(yaw) };
  let r: V3 = { x: Math.cos(yaw), y: 0, z: -Math.sin(yaw) };
  let u: V3 = { x: 0, y: 1, z: 0 };
  f = rodrigues(f, r, pitch);
  u = rodrigues(u, r, pitch);
  // +roll is left wing down. Positive rotation about the nose (which points −Z
  // at yaw 0, not +Z) drops the right wing, so the angle is negated here.
  r = rodrigues(r, f, -roll);
  u = rodrigues(u, f, -roll);
  return { f, r, u };
}

export function runwayForward(): V3 {
  const { f } = basis(RWY_YAW, 0, 0);
  return f;
}

export function runwayRight(): V3 {
  const { r } = basis(RWY_YAW, 0, 0);
  return r;
}

export function runwayCenter(): V3 {
  const f = runwayForward();
  return {
    x: THRESH_X + f.x * (RWY_LENGTH * 0.5),
    y: 0,
    z: THRESH_Z + f.z * (RWY_LENGTH * 0.5),
  };
}

export function rhoAt(agl: number): number {
  return 1.225 * Math.exp(-(FIELD_ELEV_M + Math.max(0, agl)) / 8500);
}

function flapCL(flaps: Flaps): number {
  return FLAP_CL[flaps] ?? 0;
}

function flapCD(flaps: Flaps): number {
  return FLAP_CD[flaps] ?? 0;
}

export function createShip(init: Partial<Ship> & Pick<Ship, "id" | "callsign">): Ship {
  return {
    x: 0,
    y: GEAR_HEIGHT,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    yaw: RWY_YAW,
    pitch: 0,
    roll: 0,
    rollRate: 0,
    pitchRate: 0,
    throttle: 0,
    rpm: 650,
    onGround: true,
    crashed: false,
    crashReason: "",
    tas: 0,
    iasKt: 0,
    tasKt: 0,
    altFt: FIELD_ELEV_M * 3.28084,
    aglFt: 0,
    vsiFpm: 0,
    heading: RWY_HDG,
    alphaDeg: 0,
    stalled: false,
    ...init,
  };
}

export function createPlayer(): Ship {
  const f = runwayForward();
  const back = 90;
  return createShip({
    id: "self",
    callsign: "N172FD",
    x: THRESH_X + f.x * back,
    y: GEAR_HEIGHT,
    z: THRESH_Z + f.z * back,
    yaw: RWY_YAW,
  });
}

/** Left pattern, already established on a 1,000 ft orbit so the field is never empty. */
export function createTraffic(): Ship {
  const c = runwayCenter();
  const R = 1200;
  const ang = 0.9;
  const x = c.x + Math.sin(ang) * R;
  const z = c.z + Math.cos(ang) * R;
  const dx = x - c.x;
  const dz = z - c.z;
  const outwardYaw = Math.atan2(-dx / R, -dz / R);
  const yaw = outwardYaw + Math.PI / 2;
  const { f } = basis(yaw, 0.04, 0.22);
  const speed = 46;
  return createShip({
    id: "tg",
    callsign: "N344TG",
    x,
    y: 305,
    z,
    yaw,
    pitch: 0.05,
    roll: 0.22,
    vx: f.x * speed,
    vy: 0.2,
    vz: f.z * speed,
    throttle: 0.68,
    onGround: false,
    rpm: 2200,
  });
}

export const IDLE_INPUT: PilotInput = {
  aileron: 0,
  elevator: 0,
  rudder: 0,
  throttle: 0,
  brake: 0,
  flaps: 0,
};

function refreshInstruments(ship: Ship, tas: number, rho: number, alpha: number, stalled: boolean) {
  const ias = tas * Math.sqrt(rho / 1.225);
  ship.tas = tas;
  ship.tasKt = tas * 1.943844;
  ship.iasKt = ias * 1.943844;
  ship.altFt = (FIELD_ELEV_M + ship.y) * 3.28084;
  ship.aglFt = ship.y * 3.28084;
  ship.vsiFpm = ship.vy * 196.8504;
  ship.heading = yawToHeading(ship.yaw);
  ship.alphaDeg = (alpha * 180) / Math.PI;
  ship.stalled = stalled;
}

/**
 * One fixed step. `dt` must be FIXED_DT (the loop accumulates).
 * Returns nothing; mutates the ship. Deterministic for a given input stream.
 */
export function step(ship: Ship, input: PilotInput, dt: number): void {
  if (ship.crashed) return;

  const lever = clamp(input.throttle, 0, 1);
  ship.throttle += (lever - ship.throttle) * Math.min(1, dt * 3.2);

  const rho = rhoAt(ship.y);
  const ax = ship.vx - WIND_X;
  const ay = ship.vy;
  const az = ship.vz - WIND_Z;
  const tas = Math.hypot(ax, ay, az);
  const { f, u } = basis(ship.yaw, ship.pitch, ship.roll);

  const vFwd = ax * f.x + ay * f.y + az * f.z;
  const vUp = ax * u.x + ay * u.y + az * u.z;
  const alpha = Math.atan2(-vUp, Math.max(vFwd, 0.75));

  const stallA = input.flaps > 0 ? STALL_ALPHA_FLAPS : STALL_ALPHA_CLEAN;
  let cl = CL0 + LIFT_SLOPE * alpha + flapCL(input.flaps);
  const stalled = alpha > stallA && !ship.onGround && tas > 20;
  if (alpha > stallA) cl *= STALL_BREAK;
  cl = clamp(cl, -0.35, input.flaps > 0 ? 2.05 : 1.62);
  const cd = CD0 + INDUCED_K * cl * cl + flapCD(input.flaps);
  const q = 0.5 * rho * tas * tas;
  const lift = q * WING_AREA * cl;
  const drag = q * WING_AREA * cd;
  const thrust = ship.throttle * THRUST_MAX * (1 - THRUST_LAPSE * Math.min(tas, 85) / 85);

  let lx = u.x;
  let ly = u.y;
  let lz = u.z;
  const airMag = Math.max(tas, 0.001);
  const hx = ax / airMag;
  const hy = ay / airMag;
  const hz = az / airMag;
  const along = lx * hx + ly * hy + lz * hz;
  lx -= hx * along;
  ly -= hy * along;
  lz -= hz * along;
  let lm = Math.hypot(lx, ly, lz);
  if (lm < 1e-4) {
    lx = 0;
    ly = 1;
    lz = 0;
    lm = 1;
  }
  lx /= lm;
  ly /= lm;
  lz /= lm;

  const fx = thrust * f.x + lift * lx + drag * -hx;
  const fy = thrust * f.y + lift * ly + drag * -hy - MASS * G;
  const fz = thrust * f.z + lift * lz + drag * -hz;

  const ail = clamp(input.aileron, -1, 1);
  const ele = clamp(input.elevator, -1, 1);
  const rud = clamp(input.rudder, -1, 1);
  const rotate = ship.onGround && ele > 0.2 && tas > 26;

  if (ship.onGround && !rotate) {
    ship.y = GEAR_HEIGHT;
    ship.vy = 0;
  }

  const pinning = ship.onGround && !rotate;
  if (!pinning) {
    ship.vx += (fx / MASS) * dt;
    ship.vy += (fy / MASS) * dt;
    ship.vz += (fz / MASS) * dt;
  } else {
    const brake = clamp(input.brake, 0, 1);
    const mu = 0.02 + brake * 0.45;
    const hspeed = Math.hypot(ship.vx, ship.vz);
    ship.vx += (fx / MASS) * dt;
    ship.vz += (fz / MASS) * dt;
    if (hspeed > 0.08) {
      const nx = ship.vx / Math.max(hspeed, 0.001);
      const nz = ship.vz / Math.max(hspeed, 0.001);
      const decel = Math.min(mu * G, hspeed / dt);
      ship.vx -= nx * decel * dt;
      ship.vz -= nz * decel * dt;
    } else if (brake > 0.15 && thrust < 400) {
      ship.vx = 0;
      ship.vz = 0;
    }
    ship.vy = 0;
  }

  ship.x += ship.vx * dt;
  ship.y += ship.vy * dt;
  ship.z += ship.vz * dt;

  if (ship.y <= GEAR_HEIGHT && ship.vy <= 0.15) {
    const impact = ship.onGround ? 0 : -ship.vy;
    const bad =
      !ship.onGround &&
      (ship.vy < -6.2 || Math.abs(ship.roll) > 0.62 || (ship.pitch < -0.22 && tas > 18));
    ship.y = GEAR_HEIGHT;
    ship.vy = 0;
    if (bad || impact > 6.2) {
      ship.crashed = true;
      ship.crashReason =
        Math.abs(ship.roll) > 0.62
          ? "Wing strike"
          : ship.pitch < -0.22
            ? "Prop strike"
            : "Hard landing";
      ship.onGround = true;
      refreshInstruments(ship, tas, rho, alpha, false);
      return;
    }
    ship.onGround = true;
  } else {
    ship.onGround = false;
  }

  const authority = clamp((tas - 6) / 24, 0.08, 1);

  if (ship.onGround) {
    const targetPitch = rotate ? clamp(0.04 + ele * 0.16, 0, 0.2) : 0;
    ship.pitch += (targetPitch - ship.pitch) * Math.min(1, dt * 3.5);
    ship.roll += (0 - ship.roll) * Math.min(1, dt * 6);
    const steer = clamp(rud + ail * 0.9, -1, 1);
    const sf = clamp(Math.hypot(ship.vx, ship.vz) / 14, 0.4, 1);
    ship.yaw += steer * 1.45 * sf * dt;
    ship.rollRate = 0;
    ship.pitchRate = 0;
  } else {
    // Stick-free spiral stability: a keyboard has no force feedback, so hands-off
    // wings level gently. Holding A or D overrides it.
    const handsOff = Math.abs(ail) < 0.08 ? 0.4 : 0;
    const rollTarget = ail * 1.05 * (0.45 + 0.55 * authority) - ship.roll * handsOff;
    ship.rollRate += (rollTarget - ship.rollRate) * Math.min(1, dt * 4);
    ship.roll += ship.rollRate * dt;
    ship.roll = clamp(ship.roll, -1.05, 1.05);

    // Target AoA above the flight path. Vertical-speed damping keeps a held
    // pull from porpoising into the pitch stop.
    const gamma = Math.atan2(ay, Math.max(Math.hypot(ax, az), 2));
    const targetAlpha =
      0.05 + ele * 0.13 + (input.flaps > 0 ? 0.025 : 0) - clamp(ship.vy, -10, 10) * 0.006;
    const desiredPitch = clamp(gamma + targetAlpha, -0.3, 0.34);
    const qCmd = clamp((desiredPitch - ship.pitch) * 1.8, -0.45, 0.45);
    ship.pitchRate += (qCmd - ship.pitchRate) * Math.min(1, dt * 4);
    ship.pitch += ship.pitchRate * dt;
    ship.pitch = clamp(ship.pitch, -0.42, 0.4);

    const velYaw = Math.atan2(-(ship.vx - WIND_X), -(ship.vz - WIND_Z));
    const yawErr = wrapPi(velYaw - ship.yaw);
    ship.yaw += (yawErr * 1.7 + rud * 0.5 * authority) * dt;

    if (stalled) ship.roll += 0.25 * dt * (ship.roll >= 0 ? 1 : -1);
  }

  const rpmTarget = 620 + ship.throttle * 1780;
  ship.rpm += (rpmTarget - ship.rpm) * Math.min(1, dt * 1.6);
  refreshInstruments(ship, Math.hypot(ship.vx - WIND_X, ship.vy, ship.vz - WIND_Z), rho, alpha, stalled);
}

/** Holds a left orbit at pattern altitude. Inputs only — same step() as the player. */
export function patternPilot(ship: Ship): PilotInput {
  const c = runwayCenter();
  const R = 1200;
  const dx = ship.x - c.x;
  const dz = ship.z - c.z;
  const dist = Math.hypot(dx, dz) || 1;
  const outwardYaw = Math.atan2(-dx / dist, -dz / dist);
  const radial = clamp((dist - R) / R, -0.45, 0.45);
  const desiredYaw = outwardYaw + Math.PI / 2 + radial * 0.8;
  const yawErr = wrapPi(desiredYaw - ship.yaw);
  const altErr = 305 - ship.y;
  const spdErr = 46 - ship.tas;
  const bankTarget = clamp(yawErr * 0.85, -0.42, 0.42);
  const climb = clamp(altErr * 0.0035, -0.1, 0.14);
  return {
    aileron: clamp((bankTarget - ship.roll) * 2.4 - ship.rollRate * 0.3, -1, 1),
    elevator: clamp((0.045 + climb - ship.pitch) * 1.6 - ship.vy * 0.045, -1, 1),
    rudder: clamp(yawErr * 0.25, -0.35, 0.35),
    throttle: clamp(0.7 + spdErr * 0.03 + altErr * 0.0008, 0.4, 1),
    brake: 0,
    flaps: 0,
  };
}

export function placeAirborne(ship: Ship): void {
  const f = runwayForward();
  const r = runwayRight();
  ship.x = THRESH_X + f.x * 1400 - r.x * 40;
  ship.y = 220;
  ship.z = THRESH_Z + f.z * 1400 - r.z * 40;
  ship.yaw = RWY_YAW;
  ship.pitch = 0.06;
  ship.roll = 0;
  ship.rollRate = 0;
  ship.pitchRate = 0;
  const sp = 48;
  ship.vx = f.x * sp + WIND_X;
  ship.vy = 1;
  ship.vz = f.z * sp + WIND_Z;
  ship.throttle = 0.75;
  ship.onGround = false;
  ship.crashed = false;
  ship.crashReason = "";
}
