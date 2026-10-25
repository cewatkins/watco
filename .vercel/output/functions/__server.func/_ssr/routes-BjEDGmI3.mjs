import { o as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Camera, n as RotateCcw, r as Plane } from "../_libs/lucide-react.mjs";
import { a as literal, c as string, l as union, n as _enum, o as number, r as boolean, s as object } from "../_libs/zod.mjs";
import { C as Scene, E as Vector3, S as SRGBColorSpace, T as Timer, _ as MeshStandardMaterial, a as CircleGeometry, b as PlaneGeometry, c as CylinderGeometry, d as Group, f as HemisphereLight, g as MeshBasicMaterial, h as Mesh, i as CanvasTexture, l as DirectionalLight, m as Matrix4, n as AmbientLight, o as Color, p as InstancedMesh, r as BoxGeometry, s as ConeGeometry, t as WebGLRenderer, u as Fog, v as Object3D, w as SphereGeometry, x as RepeatWrapping, y as PerspectiveCamera } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BjEDGmI3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RAD_TO_DEG = 180 / Math.PI;
var AIRSPEED_MAX_KT = 160;
var VSI_MAX_FPM = 2e3;
var ALTITUDE_CYCLE_FT = 1e4;
function clamp$2(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
function signed(value) {
	return `${value > 0 ? "+" : ""}${value}`;
}
function headingText(heading) {
	return String((Math.round(heading) % 360 + 360) % 360).padStart(3, "0");
}
function instrumentReadings(ship) {
	const pitchDeg = ship.pitch * RAD_TO_DEG;
	const rollDeg = ship.roll * RAD_TO_DEG;
	const verticalSpeed = Math.round(ship.vsiFpm / 50) * 50;
	const rollRate = ship.rollRate * RAD_TO_DEG;
	const altitudeCycle = (ship.altFt % ALTITUDE_CYCLE_FT + ALTITUDE_CYCLE_FT) % ALTITUDE_CYCLE_FT;
	return {
		airspeedAngle: -135 + clamp$2(ship.iasKt / AIRSPEED_MAX_KT, 0, 1) * 270,
		airspeedLabel: `${Math.round(ship.iasKt)} kt`,
		attitudePitchPx: clamp$2(pitchDeg * .7, -24, 24),
		attitudeRollDeg: -rollDeg,
		attitudeLabel: `P${signed(Math.round(pitchDeg))}°  B${signed(Math.round(rollDeg))}°`,
		altimeterAngle: altitudeCycle / ALTITUDE_CYCLE_FT * 360,
		altitudeLabel: `${Math.round(ship.altFt).toLocaleString("en-US")} ft`,
		turnAngle: clamp$2(-rollRate * 1.5, -45, 45),
		turnLabel: `${signed(Math.round(rollRate))}°/s`,
		headingCardAngle: -ship.heading,
		headingLabel: headingText(ship.heading),
		verticalSpeedAngle: clamp$2(ship.vsiFpm, -2e3, VSI_MAX_FPM) / VSI_MAX_FPM * 135,
		verticalSpeedLabel: `${verticalSpeed > 0 ? "+" : ""}${verticalSpeed} fpm`
	};
}
function pointAt(angle, radius) {
	const radians = angle * Math.PI / 180;
	return [Number((50 + Math.sin(radians) * radius).toFixed(3)), Number((50 - Math.cos(radians) * radius).toFixed(3))];
}
function Gauge({ label, valueRef, gaugeRef, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: gaugeRef,
		role: "img",
		"aria-label": label,
		className: "flex min-w-0 flex-col items-center rounded-sm border border-border bg-surface/80 p-1 sm:p-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-instrument tracking-widest text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 100 100",
				"aria-hidden": "true",
				className: "aspect-square w-full max-w-20 sm:max-w-24",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "50",
						cy: "50",
						r: "47",
						fill: "var(--color-bg)",
						stroke: "var(--color-border)",
						strokeWidth: "3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "50",
						cy: "50",
						r: "42",
						fill: "none",
						stroke: "var(--color-border)",
						strokeWidth: "1"
					}),
					children
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				ref: valueRef,
				className: "font-mono text-instrument tabular-nums text-fg",
				children: "--"
			})
		]
	});
}
function tick(angle, radius, length) {
	const [x1, y1] = pointAt(angle, radius);
	const [x2, y2] = pointAt(angle, radius - length);
	return [
		x1,
		y1,
		x2,
		y2
	];
}
var InstrumentPanel = (0, import_react.forwardRef)(function InstrumentPanel(_props, ref) {
	const airspeedGauge = (0, import_react.useRef)(null);
	const airspeedValue = (0, import_react.useRef)(null);
	const airspeedNeedle = (0, import_react.useRef)(null);
	const attitudeGauge = (0, import_react.useRef)(null);
	const attitudeValue = (0, import_react.useRef)(null);
	const attitudeHorizon = (0, import_react.useRef)(null);
	const altimeterGauge = (0, import_react.useRef)(null);
	const altitudeValue = (0, import_react.useRef)(null);
	const altimeterNeedle = (0, import_react.useRef)(null);
	const turnGauge = (0, import_react.useRef)(null);
	const turnValue = (0, import_react.useRef)(null);
	const turnAircraft = (0, import_react.useRef)(null);
	const headingGauge = (0, import_react.useRef)(null);
	const headingValue = (0, import_react.useRef)(null);
	const headingCard = (0, import_react.useRef)(null);
	const verticalSpeedGauge = (0, import_react.useRef)(null);
	const verticalSpeedValue = (0, import_react.useRef)(null);
	const verticalSpeedNeedle = (0, import_react.useRef)(null);
	(0, import_react.useImperativeHandle)(ref, () => ({ update(ship) {
		const reading = instrumentReadings(ship);
		const setTransform = (element, value) => {
			if (element?.getAttribute("transform") !== value) element?.setAttribute("transform", value);
		};
		const setText = (element, value) => {
			if (element && element.textContent !== value) element.textContent = value;
		};
		const setLabel = (element, value) => {
			if (element?.getAttribute("aria-label") !== value) element?.setAttribute("aria-label", value);
		};
		setTransform(airspeedNeedle.current, `rotate(${reading.airspeedAngle} 50 50)`);
		setText(airspeedValue.current, reading.airspeedLabel);
		setLabel(airspeedGauge.current, `Airspeed ${reading.airspeedLabel}`);
		setTransform(attitudeHorizon.current, `translate(0 ${reading.attitudePitchPx}) rotate(${reading.attitudeRollDeg} 50 50)`);
		setText(attitudeValue.current, reading.attitudeLabel);
		setLabel(attitudeGauge.current, `Attitude ${reading.attitudeLabel}`);
		setTransform(altimeterNeedle.current, `rotate(${reading.altimeterAngle} 50 50)`);
		setText(altitudeValue.current, reading.altitudeLabel);
		setLabel(altimeterGauge.current, `Altimeter ${reading.altitudeLabel}`);
		setTransform(turnAircraft.current, `rotate(${reading.turnAngle} 50 50)`);
		setText(turnValue.current, reading.turnLabel);
		setLabel(turnGauge.current, `Turn trend ${reading.turnLabel}`);
		setTransform(headingCard.current, `rotate(${reading.headingCardAngle} 50 50)`);
		setText(headingValue.current, reading.headingLabel);
		setLabel(headingGauge.current, `Heading ${reading.headingLabel}`);
		setTransform(verticalSpeedNeedle.current, `rotate(${reading.verticalSpeedAngle} 50 50)`);
		setText(verticalSpeedValue.current, reading.verticalSpeedLabel);
		setLabel(verticalSpeedGauge.current, `Vertical speed ${reading.verticalSpeedLabel}`);
	} }), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		"aria-label": "Flight instruments",
		className: "pointer-events-none absolute bottom-52 left-1/2 z-10 w-52 -translate-x-1/2 rounded-md border border-border bg-bg/90 p-2 shadow-lg backdrop-blur-sm sm:bottom-28 sm:w-96 sm:p-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-3 gap-2 sm:gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Gauge, {
					label: "Airspeed",
					gaugeRef: airspeedGauge,
					valueRef: airspeedValue,
					children: [
						Array.from({ length: 17 }, (_, index) => {
							const angle = -135 + index * 270 / 16;
							const [x1, y1, x2, y2] = tick(angle, 44, index % 4 === 0 ? 7 : 3);
							const [labelX, labelY] = pointAt(angle, 31);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1,
								y1,
								x2,
								y2,
								stroke: "var(--color-muted)",
								strokeWidth: index % 4 === 0 ? 1.5 : .8
							}), index % 4 === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: labelX,
								y: labelY + 3,
								textAnchor: "middle",
								fill: "var(--color-fg)",
								fontSize: "8",
								children: index * 10
							})] }, index);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							ref: airspeedNeedle,
							x1: "50",
							y1: "54",
							x2: "50",
							y2: "19",
							stroke: "var(--color-primary)",
							strokeWidth: "2.5",
							strokeLinecap: "round"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "50",
							cy: "50",
							r: "3.5",
							fill: "var(--color-fg)"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Gauge, {
					label: "Attitude",
					gaugeRef: attitudeGauge,
					valueRef: attitudeValue,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("clipPath", {
							id: "instrument-attitude-clip",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "50",
								cy: "50",
								r: "41"
							})
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							clipPath: "url(#instrument-attitude-clip)",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: "8",
								y: "8",
								width: "84",
								height: "84",
								fill: "var(--color-sky)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
								ref: attitudeHorizon,
								transform: "translate(0 0) rotate(0 50 50)",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
										x: "8",
										y: "50",
										width: "84",
										height: "42",
										fill: "var(--color-earth)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
										x1: "8",
										y1: "50",
										x2: "92",
										y2: "50",
										stroke: "var(--color-fg)",
										strokeWidth: "1.5"
									}),
									[
										-20,
										-10,
										10,
										20
									].map((pitch) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
										x1: pitch < 0 ? 40 : 44,
										y1: 50 + pitch * .75,
										x2: pitch < 0 ? 60 : 56,
										y2: 50 + pitch * .75,
										stroke: "var(--color-fg)",
										strokeWidth: "1"
									}, pitch))
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M28 49H42L47 46H53L58 49H72V53H54L51 57H49L46 53H28Z",
							fill: "var(--color-primary)"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Gauge, {
					label: "Altimeter",
					gaugeRef: altimeterGauge,
					valueRef: altitudeValue,
					children: [
						Array.from({ length: 10 }, (_, index) => {
							const angle = index * 36;
							const [x1, y1, x2, y2] = tick(angle, 44, 6);
							const [labelX, labelY] = pointAt(angle, 31);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1,
								y1,
								x2,
								y2,
								stroke: "var(--color-muted)",
								strokeWidth: "1.2"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: labelX,
								y: labelY + 3,
								textAnchor: "middle",
								fill: "var(--color-fg)",
								fontSize: "8",
								children: index
							})] }, index);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							ref: altimeterNeedle,
							x1: "50",
							y1: "54",
							x2: "50",
							y2: "19",
							stroke: "var(--color-primary)",
							strokeWidth: "2.5",
							strokeLinecap: "round"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "50",
							cy: "50",
							r: "3.5",
							fill: "var(--color-fg)"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Gauge, {
					label: "Turn trend",
					gaugeRef: turnGauge,
					valueRef: turnValue,
					children: [[
						-45,
						0,
						45
					].map((angle) => {
						const [x1, y1, x2, y2] = tick(angle, 44, 7);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1,
							y1,
							x2,
							y2,
							stroke: "var(--color-muted)",
							strokeWidth: "1.5"
						}, angle);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
						ref: turnAircraft,
						transform: "rotate(0 50 50)",
						fill: "var(--color-primary)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M20 47H43L48 39H52L57 47H80V53H56L52 62H48L44 53H20Z" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Gauge, {
					label: "Heading",
					gaugeRef: headingGauge,
					valueRef: headingValue,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
						ref: headingCard,
						transform: "rotate(0 50 50)",
						children: Array.from({ length: 12 }, (_, index) => {
							const angle = index * 30;
							const [x1, y1, x2, y2] = tick(angle, 44, 5);
							const [labelX, labelY] = pointAt(angle, 31);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1,
								y1,
								x2,
								y2,
								stroke: "var(--color-muted)",
								strokeWidth: "1.2"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: labelX,
								y: labelY + 3,
								textAnchor: "middle",
								fill: "var(--color-fg)",
								fontSize: "7",
								children: String(index * 3).padStart(2, "0")
							})] }, index);
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M46 8L50 15L54 8Z",
						fill: "var(--color-primary)"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Gauge, {
					label: "Vertical speed",
					gaugeRef: verticalSpeedGauge,
					valueRef: verticalSpeedValue,
					children: [
						[
							-2e3,
							-1e3,
							0,
							1e3,
							2e3
						].map((speed) => {
							const angle = speed / 2e3 * 135;
							const [x1, y1, x2, y2] = tick(angle, 44, 6);
							const [labelX, labelY] = pointAt(angle, 31);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1,
								y1,
								x2,
								y2,
								stroke: "var(--color-muted)",
								strokeWidth: "1.2"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: labelX,
								y: labelY + 3,
								textAnchor: "middle",
								fill: "var(--color-fg)",
								fontSize: "7",
								children: speed === 0 ? "0" : String(speed / 1e3)
							})] }, speed);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							ref: verticalSpeedNeedle,
							x1: "50",
							y1: "54",
							x2: "50",
							y2: "19",
							stroke: "var(--color-primary)",
							strokeWidth: "2.5",
							strokeLinecap: "round"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "50",
							cy: "50",
							r: "3.5",
							fill: "var(--color-fg)"
						})
					]
				})
			]
		})
	});
});
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
var FIXED_DT = 1 / 60;
/**
* Field elevation, MSL. 2,871 ft is the published number a Boise pilot already
* knows; the meter figure is converted once, here, and the placard on the page
* reads the same height. (S0 used 870 m — about 2,854 ft — which disagreed
* with the placard. S1 reconciles them at the feet number.)
*/
var FIELD_ELEV_FT = 2871;
var FIELD_ELEV_M = FIELD_ELEV_FT * .3048;
var G = 9.80665;
var GEAR_HEIGHT = 1.55;
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
var MASS = 1043;
var WING_AREA = 16.2;
var CL0 = .2;
var PARTIAL_POWER_MAX_THROTTLE = .55;
var HEAVY_WING_ROLL_ACCEL = .04;
var STANDARD_AERO = {
	id: "standard",
	mass: MASS,
	wingArea: WING_AREA,
	liftSlope: 5,
	cl0: CL0,
	stallAlphaClean: .26,
	stallAlphaFlaps: .3,
	flapCL: {
		10: .22,
		20: .4,
		30: .55
	},
	flapCD: {
		10: .015,
		20: .03,
		30: .05
	},
	cd0: .03,
	inducedK: .055,
	thrustMax: 2500,
	thrustLapse: .4,
	stallBreak: .62,
	rotateTas: 26
};
var AIRFRAMES = {
	standard: STANDARD_AERO,
	light: {
		...STANDARD_AERO,
		id: "light",
		mass: 553,
		wingArea: 16.58,
		thrustMax: 1600,
		rotateTas: 22
	}
};
var RWY_LENGTH = 2400;
function clamp$1(v, a, b) {
	return Math.max(a, Math.min(b, v));
}
function wrapPi(a) {
	let x = a;
	while (x > Math.PI) x -= Math.PI * 2;
	while (x < -Math.PI) x += Math.PI * 2;
	return x;
}
function headingToYaw(hdgDeg) {
	return -hdgDeg * Math.PI / 180;
}
function yawToHeading(yaw) {
	return (-yaw * 180 / Math.PI + 360) % 360;
}
var RWY_YAW = headingToYaw(280);
var _windSpeed = 4.115552;
var _windYaw = headingToYaw(280);
/** Air-mass velocity. Wind FROM 280 blows opposite the runway heading. */
var WIND_X = Math.sin(_windYaw) * _windSpeed;
var WIND_Z = Math.cos(_windYaw) * _windSpeed;
var DEFAULT_WEATHER = {
	windX: WIND_X,
	windZ: WIND_Z,
	fieldElevationM: FIELD_ELEV_M,
	densityAltitudeOffsetM: 0,
	gustAmplitude: 0
};
function windAt(weather, x, z) {
	const gust = weather.gustAmplitude * Math.sin(x / 180 + z / 230);
	return {
		x: weather.windX + gust,
		z: weather.windZ + gust * .5
	};
}
function weatherLabel(weather) {
	const knots = Math.hypot(weather.windX, weather.windZ) / .514444;
	if (knots < .05) return "calm";
	const from = (Math.atan2(-weather.windX, weather.windZ) * 180 / Math.PI + 360) % 360;
	return `${String(Math.round(from) || 360).padStart(3, "0")}/${String(Math.round(knots)).padStart(2, "0")} kt`;
}
function rodrigues(v, axis, ang) {
	const c = Math.cos(ang);
	const s = Math.sin(ang);
	const dot = v.x * axis.x + v.y * axis.y + v.z * axis.z;
	const cx = axis.y * v.z - axis.z * v.y;
	const cy = axis.z * v.x - axis.x * v.z;
	const cz = axis.x * v.y - axis.y * v.x;
	return {
		x: v.x * c + cx * s + axis.x * dot * (1 - c),
		y: v.y * c + cy * s + axis.y * dot * (1 - c),
		z: v.z * c + cz * s + axis.z * dot * (1 - c)
	};
}
/** Body basis. f is the nose (+Z of the mesh), r is the right wing, u is cabin-up. */
function basis(yaw, pitch, roll) {
	let f = {
		x: -Math.sin(yaw),
		y: 0,
		z: -Math.cos(yaw)
	};
	let r = {
		x: Math.cos(yaw),
		y: 0,
		z: -Math.sin(yaw)
	};
	let u = {
		x: 0,
		y: 1,
		z: 0
	};
	f = rodrigues(f, r, pitch);
	u = rodrigues(u, r, pitch);
	r = rodrigues(r, f, -roll);
	u = rodrigues(u, f, -roll);
	return {
		f,
		r,
		u
	};
}
function runwayForward() {
	const { f } = basis(RWY_YAW, 0, 0);
	return f;
}
function runwayRight() {
	const { r } = basis(RWY_YAW, 0, 0);
	return r;
}
function runwayCenter() {
	const f = runwayForward();
	return {
		x: 0 + f.x * (RWY_LENGTH * .5),
		y: 0,
		z: 0 + f.z * (RWY_LENGTH * .5)
	};
}
function rhoAt(agl, weather = DEFAULT_WEATHER) {
	return 1.225 * Math.exp(-(weather.fieldElevationM + weather.densityAltitudeOffsetM + Math.max(0, agl)) / 8500);
}
function flapCL(flaps, aero) {
	return aero.flapCL[flaps] ?? 0;
}
function flapCD(flaps, aero) {
	return aero.flapCD[flaps] ?? 0;
}
function createShip(init) {
	return {
		aero: STANDARD_AERO,
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
		heading: 280,
		alphaDeg: 0,
		stalled: false,
		...init
	};
}
function createPlayer(aero = STANDARD_AERO) {
	const f = runwayForward();
	const back = 90;
	return createShip({
		id: "self",
		aero,
		callsign: "N172FD",
		x: 0 + f.x * back,
		y: GEAR_HEIGHT,
		z: 0 + f.z * back,
		yaw: RWY_YAW
	});
}
var PATTERN_NEAR = -100;
var PATTERN_FAR = 2500;
var PATTERN_WIDTH = 1e3;
function runwayPosition(ship) {
	const f = runwayForward();
	const r = runwayRight();
	const dx = ship.x - 0;
	const dz = ship.z - 0;
	return {
		along: dx * f.x + dz * f.z,
		across: dx * r.x + dz * r.z
	};
}
/** Nearest segment on the left circuit; all coordinates are runway-local meters. */
function patternPosition(ship) {
	const { along, across } = runwayPosition(ship);
	const corners = [
		[PATTERN_NEAR, 0],
		[PATTERN_FAR, 0],
		[PATTERN_FAR, -1e3],
		[PATTERN_NEAR, -1e3]
	];
	let closest = {
		segment: 0,
		fraction: 0,
		distance: Infinity
	};
	for (let segment = 0; segment < corners.length; segment++) {
		const [ax, ay] = corners[segment];
		const [bx, by] = corners[(segment + 1) % corners.length];
		const dx = bx - ax;
		const dy = by - ay;
		const fraction = clamp$1(((along - ax) * dx + (across - ay) * dy) / (dx * dx + dy * dy), 0, 1);
		const distance = Math.hypot(along - ax - dx * fraction, across - ay - dy * fraction);
		if (distance < closest.distance - 1e-6) closest = {
			segment,
			fraction,
			distance
		};
	}
	const leg = closest.segment === 0 ? along < 500 ? "final" : "upwind" : closest.segment === 1 ? "crosswind" : closest.segment === 2 ? "downwind" : "base";
	return {
		...closest,
		leg,
		along,
		across
	};
}
/** Already established upwind; the pilot flies an altitude-hold practice circuit. */
function createTraffic() {
	const f = runwayForward();
	const speed = 46;
	return createShip({
		id: "tg",
		callsign: "N344TG",
		x: 0 + f.x * 800,
		y: 305,
		z: 0 + f.z * 800,
		yaw: RWY_YAW,
		pitch: .05,
		roll: 0,
		vx: f.x * speed + WIND_X,
		vy: .2,
		vz: f.z * speed + WIND_Z,
		throttle: .68,
		onGround: false,
		rpm: 2200
	});
}
var IDLE_INPUT = {
	aileron: 0,
	elevator: 0,
	rudder: 0,
	throttle: 0,
	brake: 0,
	flaps: 0
};
function refreshInstruments(ship, tas, rho, alpha, stalled, weather) {
	const ias = tas * Math.sqrt(rho / 1.225);
	ship.tas = tas;
	ship.tasKt = tas * 1.943844;
	ship.iasKt = ias * 1.943844;
	ship.altFt = (weather.fieldElevationM + ship.y) * 3.28084;
	ship.aglFt = ship.y * 3.28084;
	ship.vsiFpm = ship.vy * 196.8504;
	ship.heading = yawToHeading(ship.yaw);
	ship.alphaDeg = alpha * 180 / Math.PI;
	ship.stalled = stalled;
}
/**
* One fixed step. `dt` must be FIXED_DT (the loop accumulates).
* Returns nothing; mutates the ship. Deterministic for a given input stream.
*/
function step(ship, input, dt, weather = DEFAULT_WEATHER) {
	if (ship.crashed) return;
	const aero = ship.aero;
	const lever = clamp$1(input.throttle, 0, 1);
	ship.throttle += (lever - ship.throttle) * Math.min(1, dt * 3.2);
	const rho = rhoAt(ship.y, weather);
	const wind = windAt(weather, ship.x, ship.z);
	const ax = ship.vx - wind.x;
	const ay = ship.vy;
	const az = ship.vz - wind.z;
	const tas = Math.hypot(ax, ay, az);
	const { f, u } = basis(ship.yaw, ship.pitch, ship.roll);
	const vFwd = ax * f.x + ay * f.y + az * f.z;
	const vUp = ax * u.x + ay * u.y + az * u.z;
	const alpha = Math.atan2(-vUp, Math.max(vFwd, .75));
	const stallA = input.flaps > 0 ? aero.stallAlphaFlaps : aero.stallAlphaClean;
	let cl = aero.cl0 + aero.liftSlope * alpha + flapCL(input.flaps, aero);
	const stalled = alpha > stallA && !ship.onGround && tas > 20;
	if (alpha > stallA) cl *= aero.stallBreak;
	cl = clamp$1(cl, -.35, input.flaps > 0 ? 2.05 : 1.62);
	const cd = aero.cd0 + aero.inducedK * cl * cl + flapCD(input.flaps, aero);
	const q = .5 * rho * tas * tas;
	const lift = q * aero.wingArea * cl;
	const drag = q * aero.wingArea * cd;
	const thrustLapse = 1 - aero.thrustLapse * Math.min(tas, 85) / 85;
	const thrustBase = ship.throttle * aero.thrustMax * thrustLapse;
	const thrust = input.failure === "partial-power" ? Math.min(thrustBase, PARTIAL_POWER_MAX_THROTTLE * aero.thrustMax * thrustLapse) : thrustBase;
	let lx = u.x;
	let ly = u.y;
	let lz = u.z;
	const airMag = Math.max(tas, .001);
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
	const fy = thrust * f.y + lift * ly + drag * -hy - aero.mass * G;
	const fz = thrust * f.z + lift * lz + drag * -hz;
	const ail = clamp$1(input.aileron, -1, 1);
	const ele = clamp$1(input.elevator, -1, 1);
	const rud = clamp$1(input.rudder, -1, 1);
	const rotate = ship.onGround && ele > .2 && tas > aero.rotateTas;
	if (ship.onGround && !rotate) {
		ship.y = GEAR_HEIGHT;
		ship.vy = 0;
	}
	if (!(ship.onGround && !rotate)) {
		ship.vx += fx / aero.mass * dt;
		ship.vy += fy / aero.mass * dt;
		ship.vz += fz / aero.mass * dt;
	} else {
		const brake = clamp$1(input.brake, 0, 1);
		const mu = .02 + brake * .45;
		const hspeed = Math.hypot(ship.vx, ship.vz);
		ship.vx += fx / aero.mass * dt;
		ship.vz += fz / aero.mass * dt;
		if (hspeed > .08) {
			const nx = ship.vx / Math.max(hspeed, .001);
			const nz = ship.vz / Math.max(hspeed, .001);
			const decel = Math.min(mu * G, hspeed / dt);
			ship.vx -= nx * decel * dt;
			ship.vz -= nz * decel * dt;
		} else if (brake > .15 && thrust < 400) {
			ship.vx = 0;
			ship.vz = 0;
		}
		ship.vy = 0;
	}
	ship.x += ship.vx * dt;
	ship.y += ship.vy * dt;
	ship.z += ship.vz * dt;
	if (ship.y <= 1.55 && ship.vy <= .15) {
		const impact = ship.onGround ? 0 : -ship.vy;
		const bad = !ship.onGround && (ship.vy < -6.2 || Math.abs(ship.roll) > .62 || ship.pitch < -.22 && tas > 18);
		ship.y = GEAR_HEIGHT;
		ship.vy = 0;
		if (bad || impact > 6.2) {
			ship.crashed = true;
			ship.crashReason = Math.abs(ship.roll) > .62 ? "Wing strike" : ship.pitch < -.22 ? "Prop strike" : "Hard landing";
			ship.onGround = true;
			refreshInstruments(ship, tas, rho, alpha, false, weather);
			return;
		}
		ship.onGround = true;
	} else ship.onGround = false;
	const authority = clamp$1((tas - 6) / 24, .08, 1);
	if (ship.onGround) {
		const targetPitch = rotate ? clamp$1(.04 + ele * .16, 0, .2) : 0;
		ship.pitch += (targetPitch - ship.pitch) * Math.min(1, dt * 3.5);
		ship.roll += (0 - ship.roll) * Math.min(1, dt * 6);
		const steer = clamp$1(rud + ail * .9, -1, 1);
		const sf = clamp$1(Math.hypot(ship.vx, ship.vz) / 14, .4, 1);
		ship.yaw += steer * 1.45 * sf * dt;
		ship.rollRate = 0;
		ship.pitchRate = 0;
	} else {
		const handsOff = Math.abs(ail) < .08 ? .4 : 0;
		const rollTarget = ail * 1.05 * (.45 + .55 * authority) - ship.roll * handsOff;
		ship.rollRate += (rollTarget - ship.rollRate) * Math.min(1, dt * 4);
		if (input.failure === "heavy-wing") ship.rollRate += HEAVY_WING_ROLL_ACCEL * dt;
		ship.roll += ship.rollRate * dt;
		ship.roll = clamp$1(ship.roll, -1.05, 1.05);
		const qCmd = clamp$1((clamp$1(Math.atan2(ay, Math.max(Math.hypot(ax, az), 2)) + (.05 + ele * .13 + (input.flaps > 0 ? .025 : 0) - clamp$1(ship.vy, -10, 10) * .006), -.3, .34) - ship.pitch) * 1.8, -.45, .45);
		ship.pitchRate += (qCmd - ship.pitchRate) * Math.min(1, dt * 4);
		ship.pitch += ship.pitchRate * dt;
		ship.pitch = clamp$1(ship.pitch, -.42, .4);
		const yawErr = wrapPi(Math.atan2(-(ship.vx - wind.x), -(ship.vz - wind.z)) - ship.yaw);
		ship.yaw += (yawErr * 1.7 + rud * .5 * authority) * dt;
		if (stalled) ship.roll += .25 * dt * (ship.roll >= 0 ? 1 : -1);
	}
	const rpmTarget = 620 + ship.throttle * 1780;
	ship.rpm += (rpmTarget - ship.rpm) * Math.min(1, dt * 1.6);
	refreshInstruments(ship, Math.hypot(ship.vx - wind.x, ship.vy, ship.vz - wind.z), rho, alpha, stalled, weather);
}
/** Look ahead along the rectangle; only controls, never aircraft position. */
function patternPilot(ship) {
	const corners = [
		[PATTERN_NEAR, 0],
		[PATTERN_FAR, 0],
		[PATTERN_FAR, -1e3],
		[PATTERN_NEAR, -1e3]
	];
	const position = patternPosition(ship);
	let segment = position.segment;
	let distance = position.fraction * (segment % 2 === 0 ? 2600 : PATTERN_WIDTH) + 300;
	while (distance > (segment % 2 === 0 ? 2600 : PATTERN_WIDTH)) {
		distance -= segment % 2 === 0 ? 2600 : PATTERN_WIDTH;
		segment = (segment + 1) % 4;
	}
	const [as, at] = corners[segment];
	const [bs, bt] = corners[(segment + 1) % 4];
	const fraction = distance / (segment % 2 === 0 ? 2600 : PATTERN_WIDTH);
	const f = runwayForward();
	const r = runwayRight();
	const s = as + (bs - as) * fraction;
	const t = at + (bt - at) * fraction;
	const yawErr = wrapPi(Math.atan2(-(0 + f.x * s + r.x * t - ship.x), -(0 + f.z * s + r.z * t - ship.z)) - ship.yaw);
	const altErr = 305 - ship.y;
	const spdErr = 46 - ship.tas;
	const bankTarget = clamp$1(yawErr * .85, -.42, .42);
	const climb = clamp$1(altErr * .0035, -.1, .14);
	return {
		aileron: clamp$1((bankTarget - ship.roll) * 2.4 - ship.rollRate * .3, -1, 1),
		elevator: clamp$1((.045 + climb - ship.pitch) * 1.6 - ship.vy * .045, -1, 1),
		rudder: clamp$1(yawErr * .25, -.35, .35),
		throttle: clamp$1(.7 + spdErr * .03 + altErr * 8e-4, .4, 1),
		brake: 0,
		flaps: 0
	};
}
function placeAirborne(ship) {
	const f = runwayForward();
	const r = runwayRight();
	ship.x = 0 + f.x * 1400 - r.x * 40;
	ship.y = 220;
	ship.z = 0 + f.z * 1400 - r.z * 40;
	ship.yaw = RWY_YAW;
	ship.pitch = .06;
	ship.roll = 0;
	ship.rollRate = 0;
	ship.pitchRate = 0;
	const sp = 48;
	ship.vx = f.x * sp + WIND_X;
	ship.vy = 1;
	ship.vz = f.z * sp + WIND_Z;
	ship.throttle = .75;
	ship.onGround = false;
	ship.crashed = false;
	ship.crashReason = "";
}
var _m = new Matrix4();
var _x = new Vector3();
var _y = new Vector3();
var _z = new Vector3();
var _desired = new Vector3();
var _look = new Vector3();
var _fwd = new Vector3();
function applyAttitude(obj, ship) {
	const b = basis(ship.yaw, ship.pitch, ship.roll);
	_x.set(b.r.x, b.r.y, b.r.z);
	_y.set(b.u.x, b.u.y, b.u.z);
	_z.set(b.f.x, b.f.y, b.f.z);
	_m.makeBasis(_x, _y, _z);
	obj.quaternion.setFromRotationMatrix(_m);
	obj.position.set(ship.x, ship.y, ship.z);
}
function paintRunway() {
	const c = document.createElement("canvas");
	c.width = 128;
	c.height = 1024;
	const g = c.getContext("2d");
	if (!g) throw new Error("no 2d context");
	g.fillStyle = "#3c4148";
	g.fillRect(0, 0, 128, 1024);
	for (let i = 0; i < 400; i++) {
		g.fillStyle = Math.random() > .5 ? "#343940" : "#454b54";
		g.fillRect(Math.random() * 128, Math.random() * 1024, 3, 2);
	}
	g.fillStyle = "#f3f1ea";
	g.fillRect(5, 0, 3, 1024);
	g.fillRect(120, 0, 3, 1024);
	for (let y = 24; y < 1e3; y += 40) g.fillRect(61, y, 6, 20);
	g.fillRect(16, 36, 96, 10);
	g.fillRect(16, 978, 96, 10);
	g.font = "700 72px 'IBM Plex Sans', sans-serif";
	g.textAlign = "center";
	g.textBaseline = "middle";
	g.save();
	g.translate(64, 150);
	g.rotate(Math.PI);
	g.fillText("28", 0, 0);
	g.restore();
	g.save();
	g.translate(64, 874);
	g.fillText("10", 0, 0);
	g.restore();
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	tex.anisotropy = 8;
	return tex;
}
function paintGround() {
	const c = document.createElement("canvas");
	c.width = 512;
	c.height = 512;
	const g = c.getContext("2d");
	if (!g) throw new Error("no 2d context");
	g.fillStyle = "#c2b07a";
	g.fillRect(0, 0, 512, 512);
	for (let i = 0; i < 70; i++) {
		g.fillStyle = i % 2 ? "#8e9960" : "#d2c08a";
		g.globalAlpha = .4;
		g.beginPath();
		g.ellipse(Math.random() * 512, Math.random() * 512, 18 + Math.random() * 60, 10 + Math.random() * 24, Math.random() * 3, 0, Math.PI * 2);
		g.fill();
	}
	g.globalAlpha = .22;
	for (let i = 0; i < 1800; i++) {
		g.fillStyle = Math.random() > .5 ? "#6e6246" : "#efe0a8";
		g.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
	}
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	tex.wrapS = RepeatWrapping;
	tex.wrapT = RepeatWrapping;
	tex.repeat.set(48, 48);
	tex.anisotropy = 8;
	return tex;
}
function buildTrainer(stripe) {
	const g = new Group();
	const white = new MeshStandardMaterial({
		color: 16052714,
		roughness: .48,
		metalness: .04
	});
	const accent = new MeshStandardMaterial({
		color: stripe,
		roughness: .45,
		metalness: .08
	});
	const dark = new MeshStandardMaterial({
		color: 2303531,
		roughness: .62,
		metalness: .2
	});
	const glass = new MeshStandardMaterial({
		color: 12047582,
		roughness: .08,
		metalness: .45,
		transparent: true,
		opacity: .55
	});
	const rubber = new MeshStandardMaterial({
		color: 1710618,
		roughness: .9
	});
	const fuse = new Mesh(new SphereGeometry(.62, 22, 16), white);
	fuse.scale.set(.92, .78, 5.15);
	fuse.position.set(0, .02, -.15);
	g.add(fuse);
	const belly = new Mesh(new BoxGeometry(.16, .08, 4.4), accent);
	belly.position.set(0, .42, -.05);
	g.add(belly);
	const cabin = new Mesh(new SphereGeometry(.46, 16, 12), glass);
	cabin.scale.set(.92, .72, 1.35);
	cabin.position.set(0, .38, .72);
	g.add(cabin);
	const cowl = new Mesh(new CylinderGeometry(.42, .48, .85, 16), white);
	cowl.rotation.x = Math.PI / 2;
	cowl.position.set(0, -.02, 1.85);
	g.add(cowl);
	const wingGeo = new BoxGeometry(5.15, .08, 1.42);
	const left = new Mesh(wingGeo, white);
	left.position.set(-2.7, .78, .15);
	left.rotation.z = -.045;
	const right = new Mesh(wingGeo, white);
	right.position.set(2.7, .78, .15);
	right.rotation.z = .045;
	g.add(left, right);
	const tipGeo = new BoxGeometry(.18, .1, 1.5);
	const tipL = new Mesh(tipGeo, accent);
	tipL.position.set(-5.2, .9, .15);
	const tipR = new Mesh(tipGeo, accent);
	tipR.position.set(5.2, .66, .15);
	g.add(tipL, tipR);
	const strutGeo = new CylinderGeometry(.025, .025, 1.05, 6);
	for (const side of [-1, 1]) {
		const strut = new Mesh(strutGeo, dark);
		strut.position.set(side * 1.7, .22, .05);
		strut.rotation.z = side * .18;
		g.add(strut);
	}
	const hstab = new Mesh(new BoxGeometry(3.15, .06, .72), white);
	hstab.position.set(0, .28, -3.15);
	const vstab = new Mesh(new BoxGeometry(.07, 1.25, .9), white);
	vstab.position.set(0, .95, -3.2);
	const rudder = new Mesh(new BoxGeometry(.05, .95, .28), accent);
	rudder.position.set(0, .95, -3.55);
	g.add(hstab, vstab, rudder);
	const legGeo = new CylinderGeometry(.035, .035, 1.15, 6);
	const wheelGeo = new CylinderGeometry(.26, .26, .14, 12);
	for (const [x, z] of [[-1.15, -.15], [1.15, -.15]]) {
		const leg = new Mesh(legGeo, dark);
		leg.position.set(x, -.55, z);
		const wheel = new Mesh(wheelGeo, rubber);
		wheel.rotation.z = Math.PI / 2;
		wheel.position.set(x, -1.22, z);
		g.add(leg, wheel);
	}
	const noseLeg = new Mesh(new CylinderGeometry(.03, .03, 1.05, 6), dark);
	noseLeg.position.set(0, -.55, 1.45);
	const noseWheel = new Mesh(new CylinderGeometry(.2, .2, .1, 12), rubber);
	noseWheel.rotation.z = Math.PI / 2;
	noseWheel.position.set(0, -1.18, 1.45);
	g.add(noseLeg, noseWheel);
	const prop = new Group();
	prop.position.set(0, -.02, 2.32);
	const bladeGeo = new BoxGeometry(.1, 1.7, .035);
	const b1 = new Mesh(bladeGeo, dark);
	const b2 = new Mesh(bladeGeo, dark);
	b2.rotation.z = Math.PI / 2;
	prop.add(b1, b2);
	g.add(prop);
	const spinner = new Mesh(new ConeGeometry(.1, .28, 12), dark);
	spinner.rotation.x = Math.PI / 2;
	spinner.position.set(0, -.02, 2.5);
	g.add(spinner);
	const lampMat = (color) => new MeshStandardMaterial({
		color,
		emissive: color,
		emissiveIntensity: .9,
		roughness: .4
	});
	const navL = new Mesh(new SphereGeometry(.07, 8, 8), lampMat(12863788));
	navL.position.set(-5.25, .9, .15);
	const navR = new Mesh(new SphereGeometry(.07, 8, 8), lampMat(4037204));
	navR.position.set(5.25, .66, .15);
	const beaconMat = lampMat(12863788);
	const beacon = new Mesh(new SphereGeometry(.07, 8, 8), beaconMat);
	beacon.position.set(0, 1.62, -3.15);
	g.add(navL, navR, beacon);
	g.traverse((obj) => {
		const mesh = obj;
		if (mesh.isMesh) {
			mesh.castShadow = true;
			mesh.receiveShadow = true;
		}
	});
	return {
		group: g,
		prop,
		beacon
	};
}
function distToCenterline(x, z) {
	const f = runwayForward();
	const dx = x - 0;
	const dz = z - 0;
	const t = Math.max(0, Math.min(RWY_LENGTH, dx * f.x + dz * f.z));
	const px = 0 + f.x * t;
	const pz = 0 + f.z * t;
	return Math.hypot(x - px, z - pz);
}
function mountWorld(canvas) {
	const renderer = new WebGLRenderer({
		canvas,
		antialias: true,
		alpha: false,
		powerPreference: "high-performance"
	});
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.toneMapping = 4;
	renderer.toneMappingExposure = 1.25;
	renderer.shadowMap.enabled = false;
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
	const scene = new Scene();
	scene.background = new Color("#9ec4d6");
	scene.fog = new Fog("#d5ddd6", 1400, 9e3);
	const camera = new PerspectiveCamera(52, 1, .25, 14e3);
	const skyLight = new HemisphereLight("#e7f1f8", "#c2a36a", 1.05);
	const ambient = new AmbientLight("#fff6e8", .38);
	scene.add(skyLight, ambient);
	const sun = new DirectionalLight("#fff0d0", 2.6);
	sun.position.set(-420, 640, 280);
	scene.add(sun);
	const ground = new Mesh(new PlaneGeometry(14e3, 14e3), new MeshStandardMaterial({
		map: paintGround(),
		roughness: 1,
		metalness: 0
	}));
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	scene.add(ground);
	const f = runwayForward();
	const r = runwayRight();
	const center = runwayCenter();
	const shoulder = new Mesh(new BoxGeometry(74, .12, RWY_LENGTH + 40), new MeshStandardMaterial({
		color: "#a89878",
		roughness: 1
	}));
	{
		const b = basis(RWY_YAW, 0, 0);
		_x.set(b.r.x, b.r.y, b.r.z);
		_y.set(b.u.x, b.u.y, b.u.z);
		_z.set(b.f.x, b.f.y, b.f.z);
		_m.makeBasis(_x, _y, _z);
		shoulder.quaternion.setFromRotationMatrix(_m);
		shoulder.position.set(center.x, .06, center.z);
		shoulder.receiveShadow = true;
		scene.add(shoulder);
	}
	const rwyGeo = new PlaneGeometry(46, RWY_LENGTH);
	rwyGeo.rotateX(Math.PI / 2);
	rwyGeo.translate(0, .2, RWY_LENGTH / 2);
	const rwy = new Mesh(rwyGeo, new MeshStandardMaterial({
		map: paintRunway(),
		roughness: .92,
		metalness: .02,
		side: 2
	}));
	{
		const b = basis(RWY_YAW, 0, 0);
		_x.set(b.r.x, b.r.y, b.r.z);
		_y.set(b.u.x, b.u.y, b.u.z);
		_z.set(b.f.x, b.f.y, b.f.z);
		_m.makeBasis(_x, _y, _z);
		rwy.quaternion.setFromRotationMatrix(_m);
	}
	rwy.position.set(0, 0, 0);
	rwy.receiveShadow = true;
	scene.add(rwy);
	const edgeLights = new Group();
	const lampGeometry = new SphereGeometry(.6, 6, 4);
	const lampMaterial = new MeshBasicMaterial({ color: "#fff0c0" });
	for (let distance = 0; distance <= RWY_LENGTH; distance += 60) for (const side of [-1, 1]) {
		const lamp = new Mesh(lampGeometry, lampMaterial);
		lamp.position.set(0 + f.x * distance + r.x * side * 25, .65, 0 + f.z * distance + r.z * side * 25);
		edgeLights.add(lamp);
	}
	edgeLights.visible = false;
	scene.add(edgeLights);
	function setNight(night) {
		scene.background = new Color(night ? "#0b1528" : "#9ec4d6");
		scene.fog = new Fog(night ? "#142239" : "#d5ddd6", 1400, 9e3);
		skyLight.intensity = night ? .35 : 1.05;
		ambient.intensity = night ? .18 : .38;
		sun.intensity = night ? .15 : 2.6;
		edgeLights.visible = night;
	}
	const taxi = new Mesh(new BoxGeometry(18, .16, 220), new MeshStandardMaterial({
		color: "#4a5058",
		roughness: .95
	}));
	{
		const b = basis(RWY_YAW, 0, 0);
		_x.set(b.r.x, b.r.y, b.r.z);
		_y.set(b.u.x, b.u.y, b.u.z);
		_z.set(b.f.x, b.f.y, b.f.z);
		_m.makeBasis(_x, _y, _z);
		taxi.quaternion.setFromRotationMatrix(_m);
		taxi.position.set(center.x + r.x * 93, .1, center.z + r.z * 93);
		scene.add(taxi);
	}
	const bldgMat = new MeshStandardMaterial({
		color: "#d9d3c6",
		roughness: .8
	});
	const roofMat = new MeshStandardMaterial({
		color: "#8d4d3a",
		roughness: .7
	});
	const glassMat = new MeshStandardMaterial({
		color: "#9ec4d4",
		roughness: .15,
		metalness: .3,
		emissive: "#1a3038",
		emissiveIntensity: .3
	});
	const terminal = new Group();
	const block = new Mesh(new BoxGeometry(34, 8, 70), bldgMat);
	block.position.y = 4;
	const roof = new Mesh(new BoxGeometry(36, .6, 72), roofMat);
	roof.position.y = 8.2;
	const tower = new Mesh(new BoxGeometry(6, 16, 6), bldgMat);
	tower.position.set(14, 8, -28);
	const cab = new Mesh(new BoxGeometry(8, 3.2, 8), glassMat);
	cab.position.set(14, 17.2, -28);
	terminal.add(block, roof, tower, cab);
	terminal.position.set(center.x + r.x * 210 + f.x * 80, 0, center.z + r.z * 210 + f.z * 80);
	{
		const b = basis(RWY_YAW, 0, 0);
		_x.set(b.r.x, b.r.y, b.r.z);
		_y.set(b.u.x, b.u.y, b.u.z);
		_z.set(b.f.x, b.f.y, b.f.z);
		_m.makeBasis(_x, _y, _z);
		terminal.quaternion.setFromRotationMatrix(_m);
	}
	terminal.traverse((o) => {
		const mesh = o;
		if (mesh.isMesh) {
			mesh.castShadow = true;
			mesh.receiveShadow = true;
		}
	});
	scene.add(terminal);
	const hangar = new Mesh(new BoxGeometry(28, 7, 22), new MeshStandardMaterial({
		color: "#c5bfb2",
		roughness: .85
	}));
	hangar.position.set(center.x + r.x * 200 - f.x * 140, 3.5, center.z + r.z * 200 - f.z * 140);
	hangar.castShadow = true;
	hangar.receiveShadow = true;
	scene.add(hangar);
	const butteMat = new MeshStandardMaterial({
		color: "#8a7352",
		roughness: 1
	});
	const butteGeo = new ConeGeometry(1, 1, 6);
	for (const [x, z, radius, height] of [
		[
			-2200,
			-2600,
			520,
			340
		],
		[
			-900,
			-3400,
			380,
			210
		],
		[
			1600,
			-2800,
			640,
			260
		],
		[
			2800,
			-600,
			420,
			180
		],
		[
			-3e3,
			400,
			700,
			300
		]
	]) {
		const mesh = new Mesh(butteGeo, butteMat);
		mesh.scale.set(radius, height, radius);
		mesh.position.set(x, height * .5, z);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		scene.add(mesh);
	}
	const bushGeo = new ConeGeometry(1.1, 2.4, 5);
	const bushMat = new MeshStandardMaterial({
		color: "#6f7a48",
		roughness: 1
	});
	const bushes = new InstancedMesh(bushGeo, bushMat, 220);
	const dummy = new Object3D();
	let n = 0;
	let seed = 7;
	const rnd = () => {
		seed = seed * 16807 % 2147483647;
		return (seed - 1) / 2147483646;
	};
	while (n < 220) {
		const x = (rnd() - .5) * 7e3;
		const z = (rnd() - .5) * 7e3;
		if (distToCenterline(x, z) < 80) continue;
		if (Math.hypot(x - center.x - r.x * 210, z - center.z - r.z * 210) < 80) continue;
		dummy.position.set(x, 0, z);
		const s = .5 + rnd() * 1.1;
		dummy.scale.set(s, .6 + rnd() * 1.2, s);
		dummy.rotation.y = rnd() * 6;
		dummy.updateMatrix();
		bushes.setMatrixAt(n, dummy.matrix);
		n++;
	}
	bushes.instanceMatrix.needsUpdate = true;
	scene.add(bushes);
	const sockPole = new Mesh(new CylinderGeometry(.08, .1, 8, 6), new MeshStandardMaterial({
		color: "#d9d3c6",
		roughness: .6
	}));
	const sockBase = 0 - r.x * 42 + f.x * 50;
	const sockBaseZ = 0 - r.z * 42 + f.z * 50;
	sockPole.position.set(sockBase, 4, sockBaseZ);
	scene.add(sockPole);
	const sock = new Mesh(new ConeGeometry(.45, 2.4, 8), new MeshStandardMaterial({
		color: "#e24b3a",
		roughness: .7
	}));
	sock.rotation.x = Math.PI / 2;
	const windLen = Math.hypot(WIND_X, WIND_Z) || 1;
	sock.position.set(sockBase + WIND_X / windLen * 1.3, 7.6, sockBaseZ + WIND_Z / windLen * 1.3);
	sock.lookAt(sock.position.x + WIND_X, sock.position.y, sock.position.z + WIND_Z);
	scene.add(sock);
	const playerCraft = buildTrainer(1914199);
	const trafficCraft = buildTrainer(14721834);
	scene.add(playerCraft.group, trafficCraft.group);
	const guestCraft = Array.from({ length: 7 }, () => buildTrainer(4426636));
	for (const craft of guestCraft) {
		craft.group.visible = false;
		scene.add(craft.group);
	}
	const blobGeo = new CircleGeometry(6, 20);
	blobGeo.rotateX(-Math.PI / 2);
	const blobMat = new MeshBasicMaterial({
		color: 1709068,
		transparent: true,
		opacity: .28,
		depthWrite: false
	});
	const blobA = new Mesh(blobGeo, blobMat);
	const blobB = new Mesh(blobGeo, blobMat.clone());
	scene.add(blobA, blobB);
	let camReady = false;
	let lastCam = null;
	let elapsed = 0;
	function resize() {
		const w = canvas.clientWidth || 1;
		const h = canvas.clientHeight || 1;
		renderer.setSize(w, h, false);
		camera.aspect = w / Math.max(h, 1);
		camera.updateProjectionMatrix();
	}
	function placeBlob(blob, ship) {
		blob.position.set(ship.x, .35, ship.z);
		const s = Math.max(.35, 1.15 - ship.y / 90);
		blob.scale.setScalar(s);
		blob.material.opacity = Math.max(0, .32 - ship.y / 240);
	}
	function render(player, traffic, dt, cam, weather = DEFAULT_WEATHER, guests = []) {
		elapsed += dt;
		guestCraft.forEach((craft, index) => {
			const guest = guests[index];
			craft.group.visible = guest !== void 0;
			if (guest) {
				applyAttitude(craft.group, guest);
				craft.prop.rotation.z += guest.rpm / 60 * Math.PI * 2 * dt;
			}
		});
		const wind = windAt(weather, sockBase, sockBaseZ);
		const windSpeed = Math.hypot(wind.x, wind.z);
		sock.position.set(sockBase + wind.x / Math.max(windSpeed, 1) * 1.3, 7.6, sockBaseZ + wind.z / Math.max(windSpeed, 1) * 1.3);
		if (windSpeed > .05) sock.lookAt(sock.position.x + wind.x, sock.position.y, sock.position.z + wind.z);
		else sock.lookAt(sock.position.x, sock.position.y - 1, sock.position.z);
		if (cam !== lastCam) {
			camReady = false;
			lastCam = cam;
		}
		playerCraft.group.visible = cam !== "cockpit";
		blobA.visible = cam !== "cockpit";
		applyAttitude(playerCraft.group, player);
		applyAttitude(trafficCraft.group, traffic);
		playerCraft.prop.rotation.z += player.rpm / 60 * Math.PI * 2 * dt;
		trafficCraft.prop.rotation.z += traffic.rpm / 60 * Math.PI * 2 * dt;
		const blink = Math.sin(elapsed * 5.2) > .55 ? 1.6 : .05;
		playerCraft.beacon.material.emissiveIntensity = blink;
		trafficCraft.beacon.material.emissiveIntensity = blink;
		placeBlob(blobA, player);
		placeBlob(blobB, traffic);
		const b = basis(player.yaw, player.pitch, player.roll);
		_fwd.set(b.f.x, 0, b.f.z);
		if (_fwd.lengthSq() < 1e-4) _fwd.set(0, 0, -1);
		_fwd.normalize();
		if (cam === "cockpit") {
			camera.position.set(player.x + b.f.x * .55 + b.u.x * 1.05, player.y + b.f.y * .55 + b.u.y * 1.05, player.z + b.f.z * .55 + b.u.z * 1.05);
			camera.up.set(b.u.x, b.u.y, b.u.z);
			_look.set(camera.position.x + b.f.x * 100, camera.position.y + b.f.y * 100, camera.position.z + b.f.z * 100);
			camReady = true;
		} else if (cam === "tower") {
			camera.up.set(0, 1, 0);
			_desired.set(center.x + r.x * 260, 28, center.z + r.z * 260);
			_look.set(player.x, player.y + 2, player.z);
			if (!camReady) camera.position.copy(_desired);
			else camera.position.lerp(_desired, 1 - Math.exp(-2 * dt));
			camReady = true;
		} else if (cam === "wing") {
			camera.up.set(0, 1, 0);
			_desired.set(player.x - b.r.x * 7 + b.u.x * 1.4 - _fwd.x * 1.5, player.y - b.r.y * 7 + b.u.y * 1.4 + 1.4, player.z - b.r.z * 7 + b.u.z * 1.4 - _fwd.z * 1.5);
			_look.set(player.x + _fwd.x * 40, player.y + 1, player.z + _fwd.z * 40);
			camera.position.copy(_desired);
			camReady = true;
		} else if (cam === "spot") {
			camera.up.set(0, 1, 0);
			_desired.set(player.x - b.f.x * 20 + b.r.x * 15 + b.u.x * 8, player.y - b.f.y * 20 + b.r.y * 15 + b.u.y * 8, player.z - b.f.z * 20 + b.r.z * 15 + b.u.z * 8);
			_look.set(player.x - b.u.x * 5, player.y - b.u.y * 5, player.z - b.u.z * 5);
			if (!camReady) camera.position.copy(_desired);
			else camera.position.lerp(_desired, 1 - Math.exp(-3.2 * dt));
			camReady = true;
		} else {
			camera.up.set(0, 1, 0);
			_desired.set(player.x - _fwd.x * 18, player.y + 6.4, player.z - _fwd.z * 18);
			_look.set(player.x, player.y + 1.1, player.z);
			if (!camReady) camera.position.copy(_desired);
			else camera.position.lerp(_desired, 1 - Math.exp(-3.2 * dt));
			camReady = true;
		}
		if (cam !== "cockpit" && camera.position.y < 1.6) camera.position.y = 1.6;
		camera.lookAt(_look);
		renderer.render(scene, camera);
	}
	function dispose() {
		renderer.dispose();
		scene.traverse((obj) => {
			const mesh = obj;
			if (!mesh.isMesh) return;
			mesh.geometry?.dispose();
			const mat = mesh.material;
			if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
			else mat?.dispose();
		});
	}
	resize();
	return {
		render,
		resize,
		dispose,
		setNight
	};
}
function radioCall(ship) {
	const p = patternPosition(ship);
	const location = ship.onGround ? "on the ground" : p.distance > 1e3 ? "outside the practice circuit" : `left ${p.leg}`;
	return `Field 28 traffic, ${ship.callsign}, ${location}, runway 28.`;
}
var f = runwayForward();
var r = runwayRight();
var mapWorldPoint = (along, across) => ({
	x: 0 + f.x * along + r.x * across,
	z: 0 + f.z * along + r.z * across
});
var MAP_CORNERS = [
	mapWorldPoint(PATTERN_NEAR, 0),
	mapWorldPoint(PATTERN_FAR, 0),
	mapWorldPoint(PATTERN_FAR, -PATTERN_WIDTH),
	mapWorldPoint(PATTERN_NEAR, -PATTERN_WIDTH)
];
var minX = Math.min(...MAP_CORNERS.map((p) => p.x)) - 700;
var minZ = Math.min(...MAP_CORNERS.map((p) => p.z)) - 700;
var extent = Math.max(Math.max(...MAP_CORNERS.map((p) => p.x)) - minX + 700, Math.max(...MAP_CORNERS.map((p) => p.z)) - minZ + 700);
function mapPoint(p) {
	const x = (p.x - minX) / extent * 200;
	const y = (p.z - minZ) / extent * 200;
	return {
		x: clamp$1(x, 4, 196),
		y: clamp$1(y, 4, 196),
		offMap: x < 4 || x > 196 || y < 4 || y > 196
	};
}
var runwayStart = mapPoint(mapWorldPoint(0, 0));
var runwayEnd = mapPoint(mapWorldPoint(RWY_LENGTH, 0));
var box = MAP_CORNERS.map((p) => {
	const v = mapPoint(p);
	return `${v.x.toFixed(3)},${v.y.toFixed(3)}`;
}).join(" ");
var FieldMap = (0, import_react.forwardRef)(function FieldMap(_props, ref) {
	const playerDot = (0, import_react.useRef)(null);
	const trafficDot = (0, import_react.useRef)(null);
	const status = (0, import_react.useRef)(null);
	(0, import_react.useImperativeHandle)(ref, () => ({ update(player, traffic) {
		for (const [ship, dot] of [[player, playerDot.current], [traffic, trafficDot.current]]) {
			const p = mapPoint(ship);
			dot?.setAttribute("cx", String(p.x));
			dot?.setAttribute("cy", String(p.y));
		}
		if (status.current) status.current.textContent = [mapPoint(player).offMap ? "You: off map" : "You: amber", mapPoint(traffic).offMap ? "Traffic: off map" : "Traffic: light"].join(" · ");
	} }), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mt-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
				className: "text-muted",
				children: "Field 28 · fictional local schematic · N ↑"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 200 200",
				className: "mx-auto h-40 w-40",
				role: "img",
				"aria-label": "North-up local map showing runway, left pattern, player and traffic",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
						points: box,
						fill: "none",
						stroke: "var(--color-muted)",
						strokeDasharray: "3 3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: runwayStart.x.toFixed(3),
						y1: runwayStart.y.toFixed(3),
						x2: runwayEnd.x.toFixed(3),
						y2: runwayEnd.y.toFixed(3),
						stroke: "var(--color-fg)",
						strokeWidth: "3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						ref: playerDot,
						cx: "100",
						cy: "100",
						r: "4",
						fill: "var(--color-primary)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						ref: trafficDot,
						cx: "100",
						cy: "100",
						r: "3",
						fill: "var(--color-fg)"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				ref: status,
				className: "text-muted",
				children: "You: amber · Traffic: light"
			})
		]
	});
});
var CIRCUIT_TASKS = [
	"Takeoff",
	"Crosswind",
	"Downwind",
	"Base",
	"Final",
	"Full stop"
];
var newCircuit = () => ({
	completed: 0,
	airborne: false,
	failed: false
});
function scoreCircuit(progress, ship) {
	if (progress.failed || progress.completed === CIRCUIT_TASKS.length) return progress;
	if (ship.crashed) return {
		...progress,
		failed: true
	};
	const p = patternPosition(ship);
	const airborne = progress.airborne || !ship.onGround;
	const course = [
		RWY_YAW,
		RWY_YAW + Math.PI / 2,
		RWY_YAW + Math.PI,
		RWY_YAW + Math.PI * 1.5,
		RWY_YAW
	];
	const aligned = Math.abs(wrapPi(ship.yaw - course[Math.min(progress.completed, 4)])) < Math.PI / 3;
	let achieved = false;
	if (progress.completed === 0) achieved = !ship.onGround && ship.y > 20 && p.along > 0 && p.along < 2400 && Math.abs(p.across) < 250;
	else if (progress.completed < 5) {
		const leg = [
			"",
			"crosswind",
			"downwind",
			"base",
			"final"
		][progress.completed];
		achieved = !ship.onGround && ship.y > 10 && p.distance < 650 && p.leg === leg && aligned;
	} else {
		const runway = runwayPosition(ship);
		achieved = airborne && ship.onGround && Math.hypot(ship.vx, ship.vz) < 1 && runway.along >= 0 && runway.along <= 2400 && Math.abs(runway.across) <= 23;
	}
	return {
		completed: progress.completed + (achieved ? 1 : 0),
		airborne,
		failed: false
	};
}
var LOG_KEY = "field28-flight-log-v1";
function readFlightLog(storage) {
	const raw = storage.getItem(LOG_KEY);
	if (raw === null) return [];
	const data = JSON.parse(raw);
	if (!Array.isArray(data) || !data.every(isFlightRecord)) throw new Error("Flight log is invalid. Forget the local log to start fresh.");
	return data.slice(-50);
}
function isFlightRecord(value) {
	if (typeof value !== "object" || value === null) return false;
	const p = value;
	return typeof p.startedAt === "string" && Number.isFinite(Date.parse(p.startedAt)) && typeof p.airborneSeconds === "number" && Number.isFinite(p.airborneSeconds) && p.airborneSeconds >= 0 && typeof p.maxAltitudeFt === "number" && Number.isFinite(p.maxAltitudeFt) && [
		"full stop",
		"crash",
		"reset"
	].includes(String(p.landingKind));
}
function appendFlight(storage, record) {
	if (!isFlightRecord(record)) throw new Error("Cannot save invalid flight record.");
	const log = [...readFlightLog(storage), record].slice(-50);
	storage.setItem(LOG_KEY, JSON.stringify(log));
	return log;
}
function forgetFlights(storage) {
	storage.removeItem(LOG_KEY);
}
var FAST_POLL_MS = 400;
var IDLE_POLL_MS = 2e3;
var PING_INTERVAL_MS = 2e3;
var STALL_MS = 1e4;
var MAX_RECOVERY_ATTEMPTS = 3;
var SIGNAL_RETRY_DELAYS_MS = [250, 750];
function defaultIceServers() {
	return [{ urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] }];
}
var P2PRoom = class {
	opts;
	peers = /* @__PURE__ */ new Map();
	/** Per-remote-peer signal delivery chains (order-preserving). */
	signalQueues = /* @__PURE__ */ new Map();
	cursor = 0;
	pollTimer = null;
	pingTimer = null;
	closed = false;
	everPolled = false;
	lastPeersFingerprint = "";
	constructor(opts) {
		this.opts = opts;
	}
	/**
	* The first poll IS the join: it registers this peer and returns the
	* roster. A failed first poll (cold DB, offline tab) must not strand the
	* room: the loop and timers start regardless and the next poll retries.
	*/
	async join() {
		try {
			await this.pollOnce();
		} catch (error) {
			this.opts.onSignalingStatus?.(error instanceof Error ? error.message : String(error));
		}
		if (this.closed) return;
		this.schedulePoll(this.anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS);
		this.pingTimer = setInterval(() => {
			this.pingAll();
			this.watchdog();
		}, PING_INTERVAL_MS);
	}
	close() {
		this.closed = true;
		if (this.pollTimer) clearTimeout(this.pollTimer);
		if (this.pingTimer) clearInterval(this.pingTimer);
		for (const slot of this.peers.values()) slot.pc.close();
		this.peers.clear();
		fetch("/api/rtc", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				op: "leave",
				room: this.opts.room,
				peer: this.opts.selfId
			}),
			keepalive: true
		}).catch((error) => console.warn("[p2p] leave failed", error));
	}
	/** Send on the unreliable game-state channel (drops stale packets). */
	broadcast(data) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		for (const slot of this.peers.values()) if (slot.state?.readyState === "open") slot.state.send(wire);
	}
	/** Send reliably (ordered) to one peer, or to all when peerId is omitted. */
	send(data, peerId) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		const targets = peerId ? [this.peers.get(peerId)] : [...this.peers.values()];
		for (const slot of targets) if (slot?.reliable?.readyState === "open") slot.reliable.send(wire);
	}
	peerList() {
		return [...this.peers.values()].map((s) => ({ ...s.info }));
	}
	schedulePoll(delay) {
		if (this.closed) return;
		if (this.pollTimer) clearTimeout(this.pollTimer);
		this.pollTimer = setTimeout(() => void this.poll(), delay);
	}
	anyPairConnecting() {
		for (const s of this.peers.values()) {
			if (s.terminal) continue;
			if (s.info.connectionState !== "connected") return true;
		}
		return false;
	}
	async pollOnce() {
		const params = new URLSearchParams({
			room: this.opts.room,
			peer: this.opts.selfId,
			name: this.opts.name ?? "",
			since: String(this.cursor)
		});
		const res = await fetch(`/api/rtc?${params}`);
		if (this.closed) return;
		if (!res.ok) throw new Error(`signaling poll failed: ${res.status}`);
		this.opts.onSignalingStatus?.(null);
		const body = await res.json();
		if (this.closed) return;
		if (!this.everPolled) {
			this.everPolled = true;
			this.opts.onConnected?.();
		}
		this.reconcileRoster(body.peers);
		const roster = new Set(body.peers.map((p) => p.id));
		for (const sig of body.signals) {
			this.cursor = Math.max(this.cursor, sig.id);
			await this.onSignal(sig.from, sig.kind, sig.payload, roster);
			if (this.closed) return;
		}
	}
	async poll() {
		if (this.closed) return;
		try {
			await this.pollOnce();
		} catch (error) {
			this.opts.onSignalingStatus?.(error instanceof Error ? error.message : String(error));
		}
		this.schedulePoll(this.anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS);
	}
	reconcileRoster(peers) {
		const alive = new Set(peers.map((p) => p.id));
		for (const p of peers) {
			if (p.id === this.opts.selfId) continue;
			const existing = this.peers.get(p.id);
			if (existing) existing.info.name = p.name;
			else this.connectTo(p.id, p.name, this.opts.selfId > p.id);
		}
		for (const [id, slot] of this.peers) if (!alive.has(id)) {
			slot.pc.close();
			this.peers.delete(id);
		}
		this.emitPeers();
	}
	connectTo(peerId, name, initiator) {
		if (this.closed) return null;
		const pc = new RTCPeerConnection({ iceServers: this.opts.iceServers ?? defaultIceServers() });
		const slot = {
			pc,
			makingOffer: false,
			ignoreOffer: false,
			pendingCandidates: [],
			lastProgressAt: Date.now(),
			recoveryAttempts: 0,
			info: {
				id: peerId,
				name,
				connectionState: pc.connectionState,
				candidateType: null,
				rttMs: null
			}
		};
		this.peers.set(peerId, slot);
		pc.onicecandidate = (e) => {
			if (e.candidate) this.sendSignal(peerId, "ice", e.candidate.toJSON());
		};
		pc.onconnectionstatechange = () => {
			slot.info.connectionState = pc.connectionState;
			if (pc.connectionState === "connecting" || pc.connectionState === "connected") slot.lastProgressAt = Date.now();
			if (pc.connectionState === "connected") {
				slot.recoveryAttempts = 0;
				slot.terminal = false;
				this.readCandidateType(slot);
			}
			this.emitPeers();
			if (pc.connectionState === "failed") pc.restartIce();
			if (pc.connectionState === "failed" || pc.connectionState === "disconnected") this.schedulePoll(FAST_POLL_MS);
		};
		pc.onnegotiationneeded = async () => {
			try {
				slot.makingOffer = true;
				await pc.setLocalDescription();
				await this.sendSignal(peerId, "offer", pc.localDescription.toJSON());
			} catch {} finally {
				slot.makingOffer = false;
			}
		};
		pc.ondatachannel = (e) => this.attachChannel(slot, e.channel);
		if (initiator) {
			this.attachChannel(slot, pc.createDataChannel("state", {
				ordered: false,
				maxRetransmits: 0
			}));
			this.attachChannel(slot, pc.createDataChannel("reliable", { ordered: true }));
		}
		return slot;
	}
	attachChannel(slot, channel) {
		if (channel.label === "state") slot.state = channel;
		else slot.reliable = channel;
		channel.onopen = () => {
			slot.lastProgressAt = Date.now();
		};
		channel.onmessage = (e) => {
			let msg;
			try {
				msg = JSON.parse(e.data);
			} catch {
				return;
			}
			if (msg.t === "ping") {
				if (slot.state?.readyState === "open") slot.state.send(JSON.stringify({ t: "pong" }));
			} else if (msg.t === "pong") {
				if (slot.pingSentAt) {
					slot.info.rttMs = Math.round(performance.now() - slot.pingSentAt);
					slot.pingSentAt = void 0;
					this.emitPeers();
				}
			} else this.opts.onMessage?.(slot.info.id, msg.d, channel.label === "state" ? "state" : "reliable");
		};
	}
	/** Apply buffered ICE candidates once a remote description is in place. */
	async flushPendingCandidates(slot) {
		while (slot.pendingCandidates.length > 0) {
			const candidate = slot.pendingCandidates.shift();
			try {
				await slot.pc.addIceCandidate(candidate);
			} catch (err) {
				if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
			}
			if (this.closed) return;
		}
	}
	async onSignal(from, kind, payload, roster) {
		if (this.closed) return;
		if (this.opts.signalCodec) try {
			payload = await this.opts.signalCodec.decode(payload);
		} catch (error) {
			this.opts.onSignalingStatus?.(`Invalid encrypted signal: ${error instanceof Error ? error.message : String(error)}`);
			return;
		}
		let slot = this.peers.get(from);
		if (!slot) {
			if (!roster.has(from)) return;
			const created = this.connectTo(from, "", false);
			if (!created) return;
			slot = created;
		}
		const polite = this.opts.selfId < from;
		try {
			if (kind === "offer" || kind === "answer") {
				const description = payload;
				const collision = kind === "offer" && (slot.makingOffer || slot.pc.signalingState !== "stable");
				slot.ignoreOffer = !polite && collision;
				if (slot.ignoreOffer) return;
				try {
					await slot.pc.setRemoteDescription(description);
				} catch (err) {
					if (kind !== "offer" || slot.recreatedForOffer) throw err;
					const attempts = slot.recoveryAttempts;
					const name = slot.info.name;
					slot.pc.close();
					this.peers.delete(from);
					const fresh = this.connectTo(from, name, false);
					if (!fresh) return;
					fresh.recoveryAttempts = attempts;
					fresh.recreatedForOffer = true;
					slot = fresh;
					await slot.pc.setRemoteDescription(description);
				}
				if (this.closed) return;
				await this.flushPendingCandidates(slot);
				if (this.closed) return;
				if (kind === "offer") {
					await slot.pc.setLocalDescription();
					if (this.closed) return;
					await this.sendSignal(from, "answer", slot.pc.localDescription.toJSON());
				}
			} else if (kind === "ice") {
				const candidate = payload;
				if (!slot.pc.remoteDescription) {
					slot.pendingCandidates.push(candidate);
					return;
				}
				try {
					await slot.pc.addIceCandidate(candidate);
				} catch (err) {
					if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
				}
			}
		} catch {}
	}
	/**
	* Signals are serialized per remote peer (a candidate must never overtake
	* its SDP into the DB) and retried on failure with short backoff.
	*/
	sendSignal(to, kind, payload) {
		const next = (this.signalQueues.get(to) ?? Promise.resolve()).then(() => this.postSignal(to, kind, payload));
		this.signalQueues.set(to, next.catch(() => {}));
		return next;
	}
	async postSignal(to, kind, payload) {
		const encodedPayload = this.opts.signalCodec ? await this.opts.signalCodec.encode(payload) : payload;
		for (let attempt = 0;; attempt++) {
			if (this.closed) return;
			try {
				const res = await fetch("/api/rtc", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						op: "signal",
						room: this.opts.room,
						from: this.opts.selfId,
						to,
						kind,
						payload: encodedPayload
					})
				});
				if (res.ok) return;
				throw new Error(`signal POST failed: ${res.status}`);
			} catch (err) {
				if (attempt >= SIGNAL_RETRY_DELAYS_MS.length) {
					console.warn(`[p2p] signal ${kind} to ${to} failed after retries`, err);
					this.opts.onSignalingStatus?.(`Signal delivery failed: ${err instanceof Error ? err.message : String(err)}`);
					return;
				}
				await new Promise((r) => setTimeout(r, SIGNAL_RETRY_DELAYS_MS[attempt]));
			}
		}
	}
	pingAll() {
		const wire = JSON.stringify({ t: "ping" });
		for (const slot of this.peers.values()) {
			if (slot.state?.readyState !== "open") continue;
			const stale = slot.pingSentAt !== void 0 && performance.now() - slot.pingSentAt > 2 * PING_INTERVAL_MS;
			if (slot.pingSentAt === void 0 || stale) {
				slot.pingSentAt = performance.now();
				slot.state.send(wire);
			}
		}
	}
	/**
	* Stuck-pair recovery, piggybacked on the ping interval. A pair that has
	* made no progress for STALL_MS gets rebuilt by the dialer with a FRESH
	* RTCPeerConnection (new DTLS identity — fixes the suspend/resume
	* fingerprint wedge). After MAX_RECOVERY_ATTEMPTS the pair is terminal:
	* visible to the app as its last connectionState, ignored by fast-poll.
	*/
	watchdog() {
		if (this.closed) return;
		const now = Date.now();
		for (const [peerId, slot] of this.peers) {
			const live = slot.pc.connectionState;
			if (live !== slot.info.connectionState) {
				slot.info.connectionState = live;
				if (live === "connecting" || live === "connected") slot.lastProgressAt = now;
				this.emitPeers();
			}
			if (slot.terminal || live === "connected") continue;
			if (now - slot.lastProgressAt <= STALL_MS) continue;
			if (slot.recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
				slot.terminal = true;
				this.emitPeers();
				continue;
			}
			slot.recoveryAttempts += 1;
			slot.lastProgressAt = now;
			if (this.opts.selfId > peerId) {
				const { name } = slot.info;
				const attempts = slot.recoveryAttempts;
				slot.pc.close();
				this.peers.delete(peerId);
				const fresh = this.connectTo(peerId, name, true);
				if (fresh) fresh.recoveryAttempts = attempts;
				this.schedulePoll(FAST_POLL_MS);
			}
		}
	}
	async readCandidateType(slot) {
		try {
			const stats = await slot.pc.getStats();
			let selected;
			stats.forEach((s) => {
				if (s.type === "candidate-pair" && s.nominated) selected = s;
			});
			const localId = selected?.localCandidateId;
			if (localId) {
				const local = stats.get(localId);
				slot.info.candidateType = local?.candidateType ?? null;
				this.emitPeers();
			}
		} catch {}
	}
	emitPeers() {
		const list = this.peerList();
		const fingerprint = JSON.stringify(list.map((p) => [
			p.id,
			p.name,
			p.connectionState,
			p.candidateType,
			p.rttMs
		]));
		if (fingerprint === this.lastPeersFingerprint) return;
		this.lastPeersFingerprint = fingerprint;
		this.opts.onPeersChanged?.(list);
	}
};
var finite = number().finite();
var packetSchema = object({
	version: literal(1),
	sequence: number().int().nonnegative(),
	ship: object({
		aero: object({ id: _enum(["standard", "light"]) }),
		x: finite.min(-2e4).max(2e4),
		y: finite.min(0).max(1e4),
		z: finite.min(-2e4).max(2e4),
		vx: finite.min(-500).max(500),
		vy: finite.min(-500).max(500),
		vz: finite.min(-500).max(500),
		yaw: finite,
		pitch: finite.min(-Math.PI).max(Math.PI),
		roll: finite.min(-Math.PI).max(Math.PI),
		rollRate: finite,
		pitchRate: finite,
		throttle: finite.min(0).max(1),
		rpm: finite.min(0).max(1e4),
		onGround: boolean(),
		crashed: boolean(),
		crashReason: string().max(80),
		tas: finite,
		iasKt: finite,
		tasKt: finite,
		altFt: finite,
		aglFt: finite,
		vsiFpm: finite,
		heading: finite,
		alphaDeg: finite,
		stalled: boolean()
	}),
	input: object({
		aileron: finite.min(-1).max(1),
		elevator: finite.min(-1).max(1),
		rudder: finite.min(-1).max(1),
		throttle: finite.min(0).max(1),
		brake: finite.min(0).max(1),
		flaps: union([
			literal(0),
			literal(10),
			literal(20),
			literal(30)
		]),
		failure: _enum([
			"none",
			"partial-power",
			"heavy-wing"
		]).optional()
	})
});
function presencePacket(ship, input, sequence) {
	return {
		version: 1,
		sequence,
		ship,
		input
	};
}
function readPresence(value, peerId) {
	const parsed = packetSchema.safeParse(value);
	if (!parsed.success) throw new Error("Invalid aircraft presence packet");
	return {
		sequence: parsed.data.sequence,
		input: parsed.data.input,
		ship: createShip({
			...parsed.data.ship,
			aero: AIRFRAMES[parsed.data.ship.aero.id],
			id: peerId,
			callsign: `Guest ${peerId.slice(0, 4)}`
		})
	};
}
var toHex = (data) => [...data].map((x) => x.toString(16).padStart(2, "0")).join("");
function fromHex(value) {
	if (!/^(?:[a-f0-9]{2})+$/.test(value)) throw new Error("Invalid encrypted signal encoding");
	const bytes = new Uint8Array(value.length / 2);
	for (let i = 0; i < bytes.length; i++) bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16);
	return bytes;
}
function newRoomCode() {
	return toHex(crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(16)));
}
async function roomCodec(code) {
	if (!/^[a-f0-9]{32}$/.test(code)) throw new Error("Room code must be 32 lowercase hex characters");
	const key = await crypto.subtle.importKey("raw", fromHex(code), "AES-GCM", false, ["encrypt", "decrypt"]);
	return {
		room: toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code)))),
		encode: async (value) => {
			const iv = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(12));
			const data = await crypto.subtle.encrypt({
				name: "AES-GCM",
				iv
			}, key, new TextEncoder().encode(JSON.stringify(value)));
			return {
				iv: toHex(iv),
				data: toHex(new Uint8Array(data))
			};
		},
		decode: async (value) => {
			const sealed = object({
				iv: string().length(24),
				data: string().max(65536)
			}).parse(value);
			const data = await crypto.subtle.decrypt({
				name: "AES-GCM",
				iv: fromHex(sealed.iv)
			}, key, fromHex(sealed.data));
			return JSON.parse(new TextDecoder().decode(data));
		}
	};
}
var LivePresence = (0, import_react.forwardRef)(function LivePresence(_props, ref) {
	const roomRef = (0, import_react.useRef)(null);
	const guests = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const [code, setCode] = (0, import_react.useState)("");
	const [consent, setConsent] = (0, import_react.useState)(false);
	const [status, setStatus] = (0, import_react.useState)("Solo · no connection");
	const [error, setError] = (0, import_react.useState)("");
	const [peers, setPeers] = (0, import_react.useState)([]);
	const [joined, setJoined] = (0, import_react.useState)(false);
	const connecting = (0, import_react.useRef)(false);
	const generation = (0, import_react.useRef)(0);
	const sendAt = (0, import_react.useRef)(0);
	const sequence = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => () => {
		generation.current++;
		roomRef.current?.close();
		roomRef.current = null;
	}, []);
	(0, import_react.useImperativeHandle)(ref, () => ({
		publish(ship, input) {
			const now = performance.now();
			if (now - sendAt.current < 100 || !roomRef.current) return;
			sendAt.current = now;
			roomRef.current.broadcast(presencePacket(ship, input, sequence.current++));
		},
		ships() {
			const now = performance.now();
			return [...guests.current.values()].filter((g) => now - g.receivedAt < 5e3).map((g) => g.ship);
		}
	}), []);
	async function join() {
		if (connecting.current || roomRef.current) return;
		if (!consent) {
			setError("Choose to share a direct connection with your invited pilot first.");
			return;
		}
		connecting.current = true;
		const current = ++generation.current;
		try {
			const codec = await roomCodec(code.trim());
			if (current !== generation.current) return;
			const room = new P2PRoom({
				room: codec.room,
				selfId: crypto.randomUUID(),
				name: "Guest pilot",
				signalCodec: codec,
				onConnected: () => setStatus("Mailbox ready · waiting for invited pilots"),
				onSignalingStatus: (message) => setError(message ? `${message}. Solo flight continues; retrying signaling.` : ""),
				onPeersChanged: (list) => {
					setPeers(list);
					const alive = new Set(list.filter((p) => p.connectionState === "connected").map((p) => p.id));
					for (const id of guests.current.keys()) if (!alive.has(id)) guests.current.delete(id);
					setStatus(list.some((p) => p.connectionState === "connected") ? "Live direct connection" : "Waiting / connecting · NAT may block direct connections");
				},
				onMessage: (from, value) => {
					try {
						const packet = readPresence(value, from);
						const previous = guests.current.get(from);
						if (previous && packet.sequence <= previous.sequence) return;
						guests.current.set(from, {
							ship: packet.ship,
							sequence: packet.sequence,
							receivedAt: performance.now()
						});
					} catch (problem) {
						setError(problem instanceof Error ? problem.message : String(problem));
					}
				}
			});
			roomRef.current = room;
			setJoined(true);
			setStatus("Connecting to signaling mailbox…");
			await room.join();
		} catch (problem) {
			setError(problem instanceof Error ? problem.message : String(problem));
		} finally {
			connecting.current = false;
		}
	}
	function leave() {
		generation.current++;
		roomRef.current?.close();
		roomRef.current = null;
		guests.current.clear();
		setPeers([]);
		setJoined(false);
		setStatus("Solo · disconnected");
		setError("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-3 border-t border-border pt-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-mono text-primary",
				children: "Invite a pilot · optional live presence"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-muted",
				children: "Friends only. No referee, anti-cheat, or shared weather. Direct connections reveal network addresses to each other. Strict NAT may prevent joining; solo remains available."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-2 block text-muted",
				children: ["Private room code", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					"aria-label": "Private room code",
					autoComplete: "off",
					spellCheck: false,
					value: code,
					disabled: joined,
					onChange: (e) => setCode(e.target.value),
					className: "mt-1 min-h-11 w-full rounded border border-border bg-bg px-2 text-fg"
				})]
			}),
			!joined && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "min-h-11 text-primary",
				onClick: () => setCode(newRoomCode()),
				children: "Create room code"
			}),
			code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "ml-3 min-h-11 text-primary",
				onClick: () => {
					navigator.clipboard.writeText(code).then(() => setStatus("Room code copied · share only with invited pilots")).catch((problem) => setError(`Could not copy room code: ${problem instanceof Error ? problem.message : String(problem)}`));
				},
				children: "Copy room code"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-1 flex min-h-11 items-center gap-2 text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: consent,
					disabled: joined,
					onChange: (e) => setConsent(e.target.checked)
				}), "I agree to a direct connection with invited pilots."]
			}),
			joined ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "min-h-11 text-primary",
				onClick: leave,
				children: "Leave room"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "min-h-11 text-primary",
				onClick: () => void join(),
				children: "Join room"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "text-muted",
				children: status
			}),
			peers.map((peer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-muted",
				children: [
					"Guest ",
					peer.id.slice(0, 4),
					" · ",
					peer.connectionState,
					" · ",
					peer.rttMs ?? "—",
					" ms"
				]
			}, peer.id)),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-danger",
				children: error
			})
		]
	});
});
var FLAP_STEPS = [
	0,
	10,
	20,
	30
];
var CAMS = [
	"chase",
	"tower",
	"wing",
	"spot",
	"cockpit"
];
var CAM_LABEL = {
	chase: "Chase",
	tower: "Tower",
	wing: "Left wing",
	spot: "Spot",
	cockpit: "Cockpit"
};
var FAILURE_OPTIONS = [
	{
		value: "none",
		label: "None",
		detail: "Standard trainer; no failures."
	},
	{
		value: "partial-power",
		label: "Partial power",
		detail: "Maximum thrust capped at 55%."
	},
	{
		value: "heavy-wing",
		label: "Heavy wing",
		detail: "Small left-roll tendency; counter with aileron."
	}
];
var crosswind = runwayRight();
var WEATHER_OPTIONS = [
	{
		label: "Default · 280/08",
		weather: DEFAULT_WEATHER
	},
	{
		label: "Calm",
		weather: {
			...DEFAULT_WEATHER,
			windX: 0,
			windZ: 0
		}
	},
	{
		label: "Crosswind · from left, 8 kt",
		weather: {
			...DEFAULT_WEATHER,
			windX: crosswind.x * 4.115552,
			windZ: crosswind.z * 4.115552
		}
	}
];
function clamp(v, a, b) {
	return Math.max(a, Math.min(b, v));
}
function pad3(n) {
	return String(Math.round((n % 360 + 360) % 360)).padStart(3, "0");
}
function FlightSim() {
	const canvasRef = (0, import_react.useRef)(null);
	const playerRef = (0, import_react.useRef)(null);
	const trafficRef = (0, import_react.useRef)(null);
	if (playerRef.current === null) playerRef.current = createPlayer();
	if (trafficRef.current === null) trafficRef.current = createTraffic();
	const [phase, setPhase] = (0, import_react.useState)("brief");
	const phaseRef = (0, import_react.useRef)("brief");
	const [failure, setFailure] = (0, import_react.useState)("none");
	const failureRef = (0, import_react.useRef)("none");
	const [crashReason, setCrashReason] = (0, import_react.useState)("");
	const [camLabel, setCamLabel] = (0, import_react.useState)(CAM_LABEL.chase);
	const [night, setNight] = (0, import_react.useState)(false);
	const worldRef = (0, import_react.useRef)(null);
	const [weatherIndex, setWeatherIndex] = (0, import_react.useState)(0);
	const weatherRef = (0, import_react.useRef)(DEFAULT_WEATHER);
	const [airframeId, setAirframeId] = (0, import_react.useState)("standard");
	const airframeRef = (0, import_react.useRef)("standard");
	const iasRef = (0, import_react.useRef)(null);
	const altRef = (0, import_react.useRef)(null);
	const vsiRef = (0, import_react.useRef)(null);
	const hdgRef = (0, import_react.useRef)(null);
	const rpmRef = (0, import_react.useRef)(null);
	const thrRef = (0, import_react.useRef)(null);
	const flapRef = (0, import_react.useRef)(null);
	const hintRef = (0, import_react.useRef)(null);
	const ballRef = (0, import_react.useRef)(null);
	const trafficRefEl = (0, import_react.useRef)(null);
	const stallRef = (0, import_react.useRef)(null);
	const radioRef = (0, import_react.useRef)(null);
	const trafficRadioRef = (0, import_react.useRef)(null);
	const keysRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const throttleRef = (0, import_react.useRef)(0);
	const flapsRef = (0, import_react.useRef)(0);
	const brakeTouch = (0, import_react.useRef)(false);
	const touch = (0, import_react.useRef)({
		ail: 0,
		ele: 0,
		owned: false,
		lever: 0
	});
	const camRef = (0, import_react.useRef)("chase");
	const stickId = (0, import_react.useRef)(null);
	const flapClickRef = (0, import_react.useRef)(null);
	const instrumentPanelRef = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const circuitRef = (0, import_react.useRef)(newCircuit());
	const taskRef = (0, import_react.useRef)(null);
	const [flightLog, setFlightLog] = (0, import_react.useState)([]);
	const [logError, setLogError] = (0, import_react.useState)("");
	const sessionRef = (0, import_react.useRef)(null);
	const presenceRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		try {
			setFlightLog(readFlightLog(localStorage));
		} catch (error) {
			setLogError(`Local log unavailable: ${error instanceof Error ? error.message : String(error)}`);
		}
	}, []);
	function finishFlight(kind) {
		const session = sessionRef.current;
		if (!session || session.ended) return;
		session.ended = true;
		try {
			setFlightLog(appendFlight(localStorage, {
				startedAt: session.startedAt,
				airborneSeconds: session.airborneSeconds,
				maxAltitudeFt: session.maxAltitudeFt,
				landingKind: kind
			}));
			setLogError("");
		} catch (error) {
			setLogError(`Flight was not saved: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
	(0, import_react.useEffect)(() => {
		phaseRef.current = phase;
	}, [phase]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const world = mountWorld(canvas);
		worldRef.current = world;
		const timer = new Timer();
		let acc = 0;
		let stopped = false;
		let radioElapsed = 1;
		let latestInput = IDLE_INPUT;
		const audio = {
			ctx: null,
			gain: null,
			filter: null,
			stall: null
		};
		function ensureAudio() {
			if (audio.ctx) {
				if (audio.ctx.state === "suspended") audio.ctx.resume();
				return;
			}
			const ctx = new AudioContext();
			const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
			const data = buffer.getChannelData(0);
			for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
			const src = ctx.createBufferSource();
			src.buffer = buffer;
			src.loop = true;
			const filter = ctx.createBiquadFilter();
			filter.type = "lowpass";
			filter.frequency.value = 400;
			const gain = ctx.createGain();
			gain.gain.value = 1e-4;
			src.connect(filter);
			filter.connect(gain);
			gain.connect(ctx.destination);
			src.start();
			const osc = ctx.createOscillator();
			osc.type = "square";
			osc.frequency.value = 1400;
			const stall = ctx.createGain();
			stall.gain.value = 0;
			osc.connect(stall);
			stall.connect(ctx.destination);
			osc.start();
			audio.ctx = ctx;
			audio.gain = gain;
			audio.filter = filter;
			audio.stall = stall;
		}
		flapClickRef.current = () => {
			if (!audio.ctx || audio.ctx.state !== "running") return;
			const now = audio.ctx.currentTime;
			const click = audio.ctx.createOscillator();
			const envelope = audio.ctx.createGain();
			click.type = "triangle";
			click.frequency.setValueAtTime(1200, now);
			click.frequency.exponentialRampToValueAtTime(350, now + .04);
			envelope.gain.setValueAtTime(.04, now);
			envelope.gain.exponentialRampToValueAtTime(1e-4, now + .045);
			click.connect(envelope);
			envelope.connect(audio.ctx.destination);
			click.start(now);
			click.stop(now + .05);
		};
		const onKeyDown = (e) => {
			if (e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable='true']")) return;
			if (e.repeat) return;
			keysRef.current.add(e.code);
			if ([
				"Space",
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight"
			].includes(e.code)) e.preventDefault();
			if (phaseRef.current !== "fly") return;
			if (e.code === "KeyF") moreFlaps(1);
			if (e.code === "KeyG") moreFlaps(-1);
			if (e.code === "KeyC") {
				const i = CAMS.indexOf(camRef.current);
				camRef.current = CAMS[(i + 1) % CAMS.length] ?? "chase";
				setCamLabel(CAM_LABEL[camRef.current]);
			}
			if (e.code === "KeyR") resetShip();
		};
		const onKeyUp = (e) => {
			keysRef.current.delete(e.code);
		};
		const onBlur = () => keysRef.current.clear();
		function resetShip() {
			finishFlight("reset");
			sessionRef.current = {
				startedAt: (/* @__PURE__ */ new Date()).toISOString(),
				airborneSeconds: 0,
				maxAltitudeFt: FIELD_ELEV_FT,
				wasAirborne: false,
				ended: false
			};
			circuitRef.current = newCircuit();
			playerRef.current = createPlayer(AIRFRAMES[airframeRef.current]);
			trafficRef.current = createTraffic();
			throttleRef.current = 0;
			flapsRef.current = 0;
			touch.current = {
				ail: 0,
				ele: 0,
				owned: false,
				lever: 0
			};
			brakeTouch.current = false;
			keysRef.current.clear();
			if (phaseRef.current === "crash") {
				phaseRef.current = "fly";
				setPhase("fly");
			}
		}
		window.__controlsTest = {
			getYaw: () => playerRef.current?.yaw ?? 0,
			getSpeed: () => {
				const p = playerRef.current;
				return p ? Math.hypot(p.vx, p.vz) : 0;
			},
			getRoll: () => playerRef.current?.roll ?? 0,
			getCameraMode: () => camRef.current,
			getShipSnapshot: () => {
				const player = playerRef.current;
				return player ? { ...player } : null;
			},
			getRemoteShips: () => presenceRef.current?.ships() ?? [],
			getTrafficSnapshot: () => trafficRef.current ? { ...trafficRef.current } : null,
			setKeys: (codes) => {
				keysRef.current = new Set(codes);
			},
			prepRollTest: () => {
				if (!playerRef.current) return;
				placeAirborne(playerRef.current);
				throttleRef.current = .75;
				phaseRef.current = "fly";
				setPhase("fly");
			}
		};
		const loop = () => {
			if (stopped) return;
			timer.update();
			const delta = Math.min(timer.getDelta(), .25);
			radioElapsed += delta;
			acc += delta;
			let steps = 0;
			const player = playerRef.current;
			const traffic = trafficRef.current;
			if (player && traffic) {
				while (acc >= .016666666666666666 && steps < 20) {
					acc -= FIXED_DT;
					steps++;
					const flying = phaseRef.current === "fly" && !player.crashed;
					const keys = keysRef.current;
					if (flying) {
						if (keys.has("KeyW")) {
							touch.current.owned = false;
							throttleRef.current = Math.min(1, throttleRef.current + FIXED_DT * 1.6);
						}
						if (keys.has("KeyS")) {
							touch.current.owned = false;
							throttleRef.current = Math.max(0, throttleRef.current - FIXED_DT * .9);
						}
						if (touch.current.owned) throttleRef.current = touch.current.lever;
						let ail = 0;
						let ele = 0;
						let rud = 0;
						if (keys.has("KeyA") || keys.has("ArrowLeft")) ail += 1;
						if (keys.has("KeyD") || keys.has("ArrowRight")) ail -= 1;
						if (keys.has("ArrowDown")) ele += 1;
						if (keys.has("ArrowUp")) ele -= 1;
						if (keys.has("KeyQ")) rud += 1;
						if (keys.has("KeyE")) rud -= 1;
						ail = clamp(ail + touch.current.ail, -1, 1);
						ele = clamp(ele + touch.current.ele, -1, 1);
						const pads = navigator.getGamepads?.();
						if (pads) for (const pad of pads) {
							if (!pad) continue;
							if (Math.abs(pad.axes[0] ?? 0) > .12) ail = clamp(-(pad.axes[0] ?? 0), -1, 1);
							if (Math.abs(pad.axes[1] ?? 0) > .12) ele = clamp(pad.axes[1] ?? 0, -1, 1);
							if (Math.abs(pad.axes[2] ?? 0) > .18) rud = clamp(-(pad.axes[2] ?? 0), -1, 1);
							if (pad.buttons[7]?.pressed) throttleRef.current = Math.min(1, throttleRef.current + FIXED_DT);
							if (pad.buttons[6]?.pressed) throttleRef.current = Math.max(0, throttleRef.current - FIXED_DT);
						}
						const brake = keys.has("Space") || keys.has("KeyB") || brakeTouch.current ? 1 : 0;
						latestInput = {
							aileron: ail,
							elevator: ele,
							rudder: rud,
							throttle: throttleRef.current,
							brake,
							flaps: flapsRef.current,
							failure: failureRef.current
						};
						step(player, latestInput, FIXED_DT, weatherRef.current);
						circuitRef.current = scoreCircuit(circuitRef.current, player);
						const session = sessionRef.current;
						if (session && !session.ended) {
							session.maxAltitudeFt = Math.max(session.maxAltitudeFt, player.altFt);
							if (!player.onGround) {
								session.wasAirborne = true;
								session.airborneSeconds += FIXED_DT;
							}
							if (player.crashed) finishFlight("crash");
							else if (session.wasAirborne && player.onGround && Math.hypot(player.vx, player.vz) < 1) finishFlight("full stop");
						}
						if (player.crashed) {
							phaseRef.current = "crash";
							setCrashReason(player.crashReason || "Wreck");
							setPhase("crash");
						}
					}
					step(traffic, patternPilot(traffic), FIXED_DT, weatherRef.current);
					if (traffic.crashed || traffic.y > 2500 || Math.hypot(traffic.x, traffic.z) > 8e3) trafficRef.current = createTraffic();
				}
				const ias = Math.round(player.iasKt);
				const alt = Math.round(player.altFt);
				const vsi = Math.round(player.vsiFpm / 50) * 50;
				if (iasRef.current) iasRef.current.textContent = String(ias);
				if (altRef.current) altRef.current.textContent = alt.toLocaleString("en-US");
				if (vsiRef.current) vsiRef.current.textContent = `${vsi > 0 ? "+" : ""}${vsi}`;
				if (hdgRef.current) hdgRef.current.textContent = pad3(player.heading);
				if (rpmRef.current) rpmRef.current.textContent = String(Math.round(player.rpm / 10) * 10);
				if (thrRef.current) thrRef.current.textContent = `${Math.round(throttleRef.current * 100)}%`;
				if (flapRef.current) flapRef.current.textContent = flapsRef.current === 0 ? "UP" : String(flapsRef.current);
				if (ballRef.current) {
					const pitchPx = player.pitch * (180 / Math.PI) * 1.7;
					const rollDeg = -player.roll * 180 / Math.PI;
					ballRef.current.style.transform = `translateY(${pitchPx}px) rotate(${rollDeg}deg)`;
				}
				instrumentPanelRef.current?.update(player);
				mapRef.current?.update(player, traffic);
				if (taskRef.current) {
					const progress = circuitRef.current;
					taskRef.current.textContent = progress.failed ? "Circuit ended · reset to retry" : progress.completed === CIRCUIT_TASKS.length ? "Circuit complete · full stop on runway" : `${progress.completed}/${CIRCUIT_TASKS.length} · Next: ${CIRCUIT_TASKS[progress.completed]}`;
				}
				if (radioElapsed >= 1) {
					radioElapsed = 0;
					if (radioRef.current) radioRef.current.textContent = radioCall(player);
					if (trafficRadioRef.current) trafficRadioRef.current.textContent = radioCall(traffic);
				}
				if (stallRef.current) stallRef.current.hidden = !player.stalled;
				if (hintRef.current) {
					let hint = "";
					if (phaseRef.current === "fly" && player.onGround && player.iasKt < 50) hint = "Throttle with W. Steer with A and D.";
					else if (phaseRef.current === "fly" && player.onGround && player.iasKt >= 50) hint = "Rotate. Pull the nose up with the down arrow.";
					else if (player.stalled) hint = "Stall. Relax the back pressure. Wings level.";
					else if (phaseRef.current === "fly" && !player.onGround) hint = "Left circuit is yours. N344TG flies the practice pattern.";
					hintRef.current.textContent = hint;
				}
				if (trafficRefEl.current) {
					const dx = traffic.x - player.x;
					const dz = traffic.z - player.z;
					const nm = Math.hypot(dx, dz) / 1852;
					const dAlt = Math.round((traffic.altFt - player.altFt) / 100) * 100;
					trafficRefEl.current.textContent = `N344TG  ${nm.toFixed(1)} nm  ${dAlt > 0 ? "+" : ""}${dAlt} ft`;
				}
				if (audio.gain && audio.filter && audio.stall && audio.ctx) {
					const rpmPower = clamp((player.rpm - 620) / 1780, 0, 1);
					const hz = 110 + player.rpm * .34;
					audio.filter.frequency.setTargetAtTime(hz, audio.ctx.currentTime, .05);
					const vol = phaseRef.current === "brief" ? 1e-4 : .008 + rpmPower * .072;
					audio.gain.gain.setTargetAtTime(vol, audio.ctx.currentTime, .08);
					audio.stall.gain.setTargetAtTime(phaseRef.current === "fly" && player.stalled ? .03 : 0, audio.ctx.currentTime, .05);
				}
				presenceRef.current?.publish(player, latestInput);
				world.render(player, traffic, delta, camRef.current, weatherRef.current, presenceRef.current?.ships());
			}
		};
		const id = { current: 0 };
		const frame = () => {
			loop();
			if (!stopped) id.current = requestAnimationFrame(frame);
		};
		id.current = requestAnimationFrame(frame);
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		window.addEventListener("blur", onBlur);
		const onResize = () => world.resize();
		window.addEventListener("resize", onResize);
		const ro = new ResizeObserver(() => world.resize());
		ro.observe(canvas);
		const startAudio = () => ensureAudio();
		canvas.parentElement?.addEventListener("pointerdown", startAudio);
		return () => {
			stopped = true;
			cancelAnimationFrame(id.current);
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
			window.removeEventListener("blur", onBlur);
			window.removeEventListener("resize", onResize);
			ro.disconnect();
			canvas.parentElement?.removeEventListener("pointerdown", startAudio);
			if (window.__controlsTest) delete window.__controlsTest;
			flapClickRef.current = null;
			world.dispose();
			worldRef.current = null;
			audio.ctx?.close();
		};
	}, []);
	function start() {
		circuitRef.current = newCircuit();
		playerRef.current = createPlayer(AIRFRAMES[airframeRef.current]);
		trafficRef.current = createTraffic();
		throttleRef.current = 0;
		flapsRef.current = 0;
		keysRef.current.clear();
		touch.current = {
			ail: 0,
			ele: 0,
			owned: false,
			lever: 0
		};
		brakeTouch.current = false;
		sessionRef.current = {
			startedAt: (/* @__PURE__ */ new Date()).toISOString(),
			airborneSeconds: 0,
			maxAltitudeFt: FIELD_ELEV_FT,
			wasAirborne: false,
			ended: false
		};
		phaseRef.current = "fly";
		setPhase("fly");
	}
	function resetFromCrash() {
		finishFlight("reset");
		sessionRef.current = {
			startedAt: (/* @__PURE__ */ new Date()).toISOString(),
			airborneSeconds: 0,
			maxAltitudeFt: FIELD_ELEV_FT,
			wasAirborne: false,
			ended: false
		};
		circuitRef.current = newCircuit();
		playerRef.current = createPlayer(AIRFRAMES[airframeRef.current]);
		trafficRef.current = createTraffic();
		throttleRef.current = 0;
		flapsRef.current = 0;
		touch.current = {
			ail: 0,
			ele: 0,
			owned: false,
			lever: 0
		};
		brakeTouch.current = false;
		keysRef.current.clear();
		phaseRef.current = "fly";
		setPhase("fly");
	}
	function cycleCam() {
		const i = CAMS.indexOf(camRef.current);
		camRef.current = CAMS[(i + 1) % CAMS.length] ?? "chase";
		setCamLabel(CAM_LABEL[camRef.current]);
	}
	function moreFlaps(dir) {
		const next = FLAP_STEPS[clamp(FLAP_STEPS.indexOf(flapsRef.current) + dir, 0, FLAP_STEPS.length - 1)] ?? 0;
		if (next === flapsRef.current) return;
		flapsRef.current = next;
		flapClickRef.current?.();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		"data-cockpit": camLabel === "Cockpit" ? "true" : "false",
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 h-full w-full touch-none"
			}),
			camLabel === "Cockpit" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": "true",
				className: "cockpit-trim",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cockpit-deck" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstrumentPanel, { ref: instrumentPanelRef }),
			phase === "fly" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "absolute top-44 left-3 z-10 max-h-56 max-w-72 overflow-y-auto rounded-md border border-border bg-bg/90 p-2 text-xs text-fg sm:top-4 sm:left-60 sm:max-h-80",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "sticky top-0 min-h-11 cursor-pointer bg-bg font-mono text-primary",
						children: "Radio & local map"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-muted",
						children: "Takeoff → crosswind → downwind → base → final → full stop on strip."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: "Practice radio · text only, not transmitted"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						ref: radioRef,
						className: "mt-2",
						children: radioCall(playerRef.current)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						ref: trafficRadioRef,
						className: "mt-2 text-muted",
						children: radioCall(trafficRef.current)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldMap, { ref: mapRef }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivePresence, { ref: presenceRef }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-2 min-h-11 text-primary",
						onClick: () => {
							finishFlight("reset");
							keysRef.current.clear();
							phaseRef.current = "brief";
							setPhase("brief");
						},
						children: "End flight / briefing"
					}),
					logError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "text-danger",
						children: logError
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto rounded-md border border-border bg-bg/80 px-3 py-2 backdrop-blur-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-primary",
							children: "FIELD 28"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-sm text-fg",
							children: "N172FD"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								"RWY ",
								28,
								" · wind ",
								weatherLabel(WEATHER_OPTIONS[weatherIndex].weather),
								" · ",
								FIELD_ELEV_FT.toLocaleString("en-US"),
								" ft"
							]
						}),
						phase === "fly" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							ref: taskRef,
							className: "mt-1 font-mono text-xs text-primary",
							children: "0/6 · Next: Takeoff"
						}),
						phase !== "brief" && failure !== "none" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-[10px] tracking-widest text-primary",
							children: ["FAULT · ", FAILURE_OPTIONS.find((option) => option.value === failure)?.label]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto rounded-md border border-border bg-bg/80 px-3 py-2 text-right backdrop-blur-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": night,
							onClick: () => {
								worldRef.current?.setNight(!night);
								setNight(!night);
							},
							className: "min-h-11 px-2 text-xs text-primary",
							children: [night ? "Night" : "Day", " lighting"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-muted",
							children: "TRAFFIC"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							ref: trafficRefEl,
							className: "font-mono text-sm text-fg",
							children: "N344TG"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: cycleCam,
							className: "mt-1 inline-flex min-h-11 items-center gap-1 text-xs text-primary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
								className: "size-3.5",
								"aria-hidden": true
							}), camLabel]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: stallRef,
				hidden: true,
				className: "pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 rounded-sm bg-danger px-4 py-1 font-mono text-sm tracking-widest text-fg",
				children: "STALL"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				ref: hintRef,
				className: "pointer-events-none absolute right-4 bottom-36 left-4 hidden text-center font-mono text-xs text-fg sm:block"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2 sm:justify-center sm:p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex max-w-full items-end gap-2 overflow-x-auto rounded-md border border-border bg-bg/85 px-2 py-2 backdrop-blur-sm sm:gap-4 sm:px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
							k: "KIAS",
							vRef: iasRef,
							value: "0"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ai",
							"aria-hidden": true,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									ref: ballRef,
									className: "ai-ball"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ai-wings" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ai-dot" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
							k: "ALT",
							vRef: altRef,
							value: "2,871"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
							k: "VSI",
							vRef: vsiRef,
							value: "0"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
							k: "HDG",
							vRef: hdgRef,
							value: "280"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
							k: "RPM",
							vRef: rpmRef,
							value: "620"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
							k: "THR",
							vRef: thrRef,
							value: "0%"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
							k: "FLAP",
							vRef: flapRef,
							value: "UP"
						})
					]
				})
			}),
			phase === "fly" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute bottom-24 left-3 flex touch-none flex-col items-center gap-2 sm:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative size-28 rounded-full border border-border bg-bg/50",
					onPointerDown: (e) => {
						e.currentTarget.setPointerCapture(e.pointerId);
						stickId.current = e.pointerId;
					},
					onPointerMove: (e) => {
						if (e.pointerId !== stickId.current) return;
						const rect = e.currentTarget.getBoundingClientRect();
						const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width * .34);
						const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height * .34);
						touch.current.ail = clamp(-dx, -1, 1);
						touch.current.ele = clamp(dy, -1, 1);
					},
					onPointerUp: (e) => {
						if (e.pointerId !== stickId.current) return;
						stickId.current = null;
						touch.current.ail = 0;
						touch.current.ele = 0;
					},
					role: "slider",
					"aria-label": "Yoke",
					"aria-valuemin": -1,
					"aria-valuemax": 1,
					"aria-valuenow": 0,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[10px] tracking-widest text-muted",
					children: "YOKE"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-3 bottom-24 flex touch-none flex-col items-center gap-2 sm:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative h-28 w-12 rounded-full border border-border bg-bg/50",
					onPointerDown: (e) => {
						e.currentTarget.setPointerCapture(e.pointerId);
						const rect = e.currentTarget.getBoundingClientRect();
						const t = 1 - (e.clientY - rect.top) / rect.height;
						touch.current.owned = true;
						touch.current.lever = clamp(t, 0, 1);
					},
					onPointerMove: (e) => {
						if (!touch.current.owned) return;
						const rect = e.currentTarget.getBoundingClientRect();
						const t = 1 - (e.clientY - rect.top) / rect.height;
						touch.current.lever = clamp(t, 0, 1);
					},
					role: "slider",
					"aria-label": "Throttle",
					"aria-valuemin": 0,
					"aria-valuemax": 100,
					"aria-valuenow": 0,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "size-11 rounded-md border border-border bg-bg/80 text-xs",
							onClick: () => moreFlaps(-1),
							children: "Flap−"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "size-11 rounded-md border border-border bg-bg/80 text-xs",
							onClick: () => moreFlaps(1),
							children: "Flap+"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "size-11 rounded-md border border-border bg-bg/80 text-xs",
							onPointerDown: () => {
								brakeTouch.current = true;
							},
							onPointerUp: () => {
								brakeTouch.current = false;
							},
							onPointerLeave: () => {
								brakeTouch.current = false;
							},
							children: "Brk"
						})
					]
				})]
			})] }),
			phase === "brief" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-20 flex flex-col items-center overflow-y-auto bg-bg/40 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "my-auto w-full max-w-md shrink-0 rounded-lg border border-border bg-surface p-5 shadow-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-primary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plane, {
								className: "size-4",
								"aria-hidden": true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs tracking-widest",
								children: "PATTERN TRAINER"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-sans text-3xl font-semibold tracking-tight text-fg",
							children: "Field 28"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: [airframeId === "standard" ? "Generic 172-class trainer" : "Generic light tailwheel-class trainer", ", N172FD. One flight model steps both airplanes. You send it inputs. It owns the state. Fictional field, not a real airport."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-3 space-y-1 text-xs leading-relaxed text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									"Runway ",
									28,
									": ",
									2400 .toLocaleString("en-US"),
									" × ",
									46,
									" m; field elevation ",
									2871 .toLocaleString("en-US"),
									" ft."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									"Wind: ",
									weatherLabel(WEATHER_OPTIONS[weatherIndex].weather),
									". Full throttle, then pull to rotate once speed builds."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Flaps add lift and drag; extend for slower approaches, retract for a clean climb." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "N344TG flies an altitude-hold left practice circuit, not a landing approach." })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 block text-xs text-muted",
							children: ["Airframe", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								"aria-label": "Airframe",
								value: airframeId,
								className: "mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-2 text-fg",
								onChange: (event) => {
									const id = event.target.value;
									if (id === "standard" || id === "light") {
										airframeRef.current = id;
										setAirframeId(id);
									}
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: "standard",
									children: [
										"Standard trainer · ",
										AIRFRAMES.standard.mass.toLocaleString("en-US"),
										" kg"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: "light",
									children: [
										"Light trainer · ",
										AIRFRAMES.light.mass.toLocaleString("en-US"),
										" kg"
									]
								})]
							})]
						}),
						airframeId === "light" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Generic tuning, not a specific aircraft. Shared procedural appearance and ground steering, not tailwheel handling."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 block text-xs text-muted",
							children: ["Weather", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-2 text-fg",
								value: weatherIndex,
								onChange: (event) => {
									const index = Number(event.target.value);
									weatherRef.current = WEATHER_OPTIONS[index].weather;
									setWeatherIndex(index);
								},
								children: WEATHER_OPTIONS.map((option, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: index,
									children: option.label
								}, option.label))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
							className: "mt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "font-mono text-xs tracking-widest text-muted",
								children: "AIRCRAFT CONDITION"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 grid gap-2",
								children: FAILURE_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									htmlFor: `failure-${option.value}`,
									className: "flex cursor-pointer items-start gap-2 rounded-md border border-border px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: `failure-${option.value}`,
										type: "radio",
										name: "flight-failure",
										value: option.value,
										checked: failure === option.value,
										onChange: () => {
											failureRef.current = option.value;
											setFailure(option.value);
										},
										className: "mt-1 accent-primary"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm text-fg",
										children: option.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted",
										children: option.detail
									})] })]
								}, option.value))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-4 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs text-fg",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "W / S"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: "Throttle up / down" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "A / D"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: "Bank left / right" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "↓ / ↑"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: "Pull / push" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Q / E"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: "Rudder left / right" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "F / G"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: "Flaps down / up" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Space · C · R"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: "Brake · camera · reset" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-3 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
									className: "min-h-8 cursor-pointer text-primary",
									children: [
										"Local flight log · ",
										flightLog.length,
										" flights"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted",
									children: "This browser only; no accounts or sync. Last five:"
								}),
								flightLog.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-muted",
									children: "No saved flights."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
									className: "mt-2 space-y-2",
									children: flightLog.slice(-5).reverse().map((record, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "text-fg",
										children: [
											record.startedAt.slice(0, 16).replace("T", " "),
											" UTC · ",
											record.landingKind,
											" · ",
											Math.round(record.airborneSeconds),
											" s airborne · max ",
											Math.round(record.maxAltitudeFt),
											" ft MSL"
										]
									}, `${record.startedAt}-${index}`))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mt-2 min-h-11 text-danger",
									onClick: () => {
										try {
											forgetFlights(localStorage);
											setFlightLog([]);
											setLogError("");
										} catch (error) {
											setLogError(`Could not forget log: ${error instanceof Error ? error.message : String(error)}`);
										}
									},
									children: "Forget local flight log"
								})
							]
						}),
						logError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "alert",
							className: "mt-2 text-xs text-danger",
							children: logError
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: start,
							className: "mt-5 w-full rounded-md bg-primary px-4 py-3 font-medium text-bg",
							children: "Start engines"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-xs leading-relaxed text-muted",
							children: "Reduced-order training demo, not certified flight instruction. Synthesized audio starts with your first click. No mixture, carb heat, or navigation radio."
						})
					]
				})
			}),
			phase === "crash" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-20 flex items-center justify-center bg-bg/70 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-sm rounded-lg border border-danger bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-danger",
							children: "OFF THE RUNWAY"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 text-2xl font-semibold text-fg",
							children: crashReason
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "The airplane is done. The pattern ship is not."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: resetFromCrash,
							className: "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-medium text-bg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
								className: "size-4",
								"aria-hidden": true
							}), "Reset on 28"]
						})
					]
				})
			})
		]
	});
}
function Readout({ k, value, vRef }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-12 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-[10px] tracking-widest text-muted",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			ref: vRef,
			className: "font-mono text-sm text-fg sm:text-base",
			children: value
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlightSim, {});
}
//#endregion
export { Home as component };
