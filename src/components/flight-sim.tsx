import { useEffect, useRef, useState, type RefObject } from "react";
import { Camera, Plane, RotateCcw } from "lucide-react";
import * as THREE from "three";
import { InstrumentPanel, type InstrumentPanelHandle } from "./instrument-panel";
import {
  FIXED_DT,
  IDLE_INPUT,
  FIELD_ELEV_FT,
  RWY_HDG,
  RWY_LENGTH,
  RWY_WIDTH,
  DEFAULT_WEATHER,
  weatherLabel,
  runwayRight,
  type Weather,
  createPlayer,
  createTraffic,
  patternPilot,
  placeAirborne,
  step,
  type Flaps,
  type FlightFailure,
  type Ship,
  type PilotInput,
  AIRFRAMES,
  type AirframeId,
} from "@/sim/fdm";
import { mountWorld, type CamMode, type FlightWorld } from "@/sim/scene";
import { radioCall } from "@/sim/radio";
import { FieldMap, type FieldMapHandle } from "./field-map";
import { CIRCUIT_TASKS, newCircuit, scoreCircuit } from "@/sim/circuit";
import { readFlightLog, appendFlight, forgetFlights, type FlightRecord, type LandingKind } from "@/sim/log";
import { LivePresence, type PresenceHandle } from "./live-presence";

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      getRoll: () => number;
      getCameraMode: () => CamMode;
      getShipSnapshot: () => Ship | null;
      getRemoteShips: () => Ship[];
      getTrafficSnapshot: () => Ship | null;
      setKeys: (codes: string[]) => void;
      prepRollTest: () => void;
    };
  }
}

const FLAP_STEPS: Flaps[] = [0, 10, 20, 30];
const CAMS: CamMode[] = ["chase", "tower", "wing", "spot", "cockpit"];
const CAM_LABEL: Record<CamMode, string> = {
  chase: "Chase",
  tower: "Tower",
  wing: "Left wing",
  spot: "Spot",
  cockpit: "Cockpit",
};
const FAILURE_OPTIONS: { value: FlightFailure; label: string; detail: string }[] = [
  { value: "none", label: "None", detail: "Standard trainer; no failures." },
  { value: "partial-power", label: "Partial power", detail: "Maximum thrust capped at 55%." },
  { value: "heavy-wing", label: "Heavy wing", detail: "Small left-roll tendency; counter with aileron." },
];
const crosswind = runwayRight();
const WEATHER_OPTIONS: { label: string; weather: Readonly<Weather> }[] = [
  { label: "Default · 280/08", weather: DEFAULT_WEATHER },
  { label: "Calm", weather: { ...DEFAULT_WEATHER, windX: 0, windZ: 0 } },
  { label: "Crosswind · from left, 8 kt", weather: { ...DEFAULT_WEATHER, windX: crosswind.x * 4.115552, windZ: crosswind.z * 4.115552 } },
];

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function pad3(n: number) {
  return String(Math.round(((n % 360) + 360) % 360)).padStart(3, "0");
}

type Phase = "brief" | "fly" | "crash";

export function FlightSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Ship | null>(null);
  const trafficRef = useRef<Ship | null>(null);
  if (playerRef.current === null) playerRef.current = createPlayer();
  if (trafficRef.current === null) trafficRef.current = createTraffic();

  const [phase, setPhase] = useState<Phase>("brief");
  const phaseRef = useRef<Phase>("brief");
  const [failure, setFailure] = useState<FlightFailure>("none");
  const failureRef = useRef<FlightFailure>("none");
  const [crashReason, setCrashReason] = useState("");
  const [camLabel, setCamLabel] = useState<string>(CAM_LABEL.chase);
  const [night, setNight] = useState(false);
  const worldRef = useRef<FlightWorld | null>(null);
  const [weatherIndex, setWeatherIndex] = useState(0);
  const weatherRef = useRef<Readonly<Weather>>(DEFAULT_WEATHER);
  const [airframeId, setAirframeId] = useState<AirframeId>("standard");
  const airframeRef = useRef<AirframeId>("standard");

  const iasRef = useRef<HTMLSpanElement>(null);
  const altRef = useRef<HTMLSpanElement>(null);
  const vsiRef = useRef<HTMLSpanElement>(null);
  const hdgRef = useRef<HTMLSpanElement>(null);
  const rpmRef = useRef<HTMLSpanElement>(null);
  const thrRef = useRef<HTMLSpanElement>(null);
  const flapRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const trafficRefEl = useRef<HTMLParagraphElement>(null);
  const stallRef = useRef<HTMLDivElement>(null);
  const radioRef = useRef<HTMLParagraphElement>(null);
  const trafficRadioRef = useRef<HTMLParagraphElement>(null);

  const keysRef = useRef(new Set<string>());
  const throttleRef = useRef(0);
  const flapsRef = useRef<Flaps>(0);
  const brakeTouch = useRef(false);
  const touch = useRef({ ail: 0, ele: 0, owned: false, lever: 0 });
  const camRef = useRef<CamMode>("chase");
  const stickId = useRef<number | null>(null);
  const flapClickRef = useRef<(() => void) | null>(null);
  const instrumentPanelRef = useRef<InstrumentPanelHandle>(null);
  const mapRef = useRef<FieldMapHandle>(null);
  const circuitRef = useRef(newCircuit());
  const taskRef = useRef<HTMLParagraphElement>(null);
  const [flightLog, setFlightLog] = useState<FlightRecord[]>([]);
  const [logError, setLogError] = useState("");
  const sessionRef = useRef<{
    startedAt: string; airborneSeconds: number; maxAltitudeFt: number;
    wasAirborne: boolean; ended: boolean;
  } | null>(null);
  const presenceRef = useRef<PresenceHandle>(null);

  useEffect(() => {
    try { setFlightLog(readFlightLog(localStorage)); }
    catch (error) { setLogError(`Local log unavailable: ${error instanceof Error ? error.message : String(error)}`); }
  }, []);

  function finishFlight(kind: LandingKind) {
    const session = sessionRef.current;
    if (!session || session.ended) return;
    session.ended = true;
    try {
      setFlightLog(appendFlight(localStorage, {
        startedAt: session.startedAt, airborneSeconds: session.airborneSeconds,
        maxAltitudeFt: session.maxAltitudeFt, landingKind: kind,
      }));
      setLogError("");
    } catch (error) {
      setLogError(`Flight was not saved: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const world: FlightWorld = mountWorld(canvas);
    worldRef.current = world;
    const timer = new THREE.Timer();
    let acc = 0;
    let stopped = false;
    let radioElapsed = 1;
    let latestInput: PilotInput = IDLE_INPUT;

    const audio = { ctx: null as AudioContext | null, gain: null as GainNode | null, filter: null as BiquadFilterNode | null, stall: null as GainNode | null };

    function ensureAudio() {
      if (audio.ctx) {
        if (audio.ctx.state === "suspended") void audio.ctx.resume();
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
      gain.gain.value = 0.0001;
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
      click.frequency.exponentialRampToValueAtTime(350, now + 0.04);
      envelope.gain.setValueAtTime(0.04, now);
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      click.connect(envelope);
      envelope.connect(audio.ctx.destination);
      click.start(now);
      click.stop(now + 0.05);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable='true']")) return;
      if (e.repeat) return;
      keysRef.current.add(e.code);
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
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
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };
    const onBlur = () => keysRef.current.clear();

    function resetShip() {
      finishFlight("reset");
      sessionRef.current = { startedAt: new Date().toISOString(), airborneSeconds: 0, maxAltitudeFt: FIELD_ELEV_FT, wasAirborne: false, ended: false };
      circuitRef.current = newCircuit();
      playerRef.current = createPlayer(AIRFRAMES[airframeRef.current]);
      trafficRef.current = createTraffic();
      throttleRef.current = 0;
      flapsRef.current = 0;
      touch.current = { ail: 0, ele: 0, owned: false, lever: 0 };
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
        throttleRef.current = 0.75;
        phaseRef.current = "fly";
        setPhase("fly");
      },
    };

    const loop = () => {
      if (stopped) return;
      timer.update();
      const delta = Math.min(timer.getDelta(), 0.25);
      radioElapsed += delta;
      acc += delta;
      let steps = 0;
      const player = playerRef.current;
      const traffic = trafficRef.current;
      if (player && traffic) {
        while (acc >= FIXED_DT && steps < 20) {
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
              throttleRef.current = Math.max(0, throttleRef.current - FIXED_DT * 0.9);
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
            if (pads) {
              for (const pad of pads) {
                if (!pad) continue;
                if (Math.abs(pad.axes[0] ?? 0) > 0.12) ail = clamp(-(pad.axes[0] ?? 0), -1, 1);
                if (Math.abs(pad.axes[1] ?? 0) > 0.12) ele = clamp(pad.axes[1] ?? 0, -1, 1);
                if (Math.abs(pad.axes[2] ?? 0) > 0.18) rud = clamp(-(pad.axes[2] ?? 0), -1, 1);
                if (pad.buttons[7]?.pressed) throttleRef.current = Math.min(1, throttleRef.current + FIXED_DT);
                if (pad.buttons[6]?.pressed) throttleRef.current = Math.max(0, throttleRef.current - FIXED_DT);
              }
            }
            const brake = keys.has("Space") || keys.has("KeyB") || brakeTouch.current ? 1 : 0;
            latestInput = {
              aileron: ail,
              elevator: ele,
              rudder: rud,
              throttle: throttleRef.current,
              brake,
              flaps: flapsRef.current,
              failure: failureRef.current,
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
          if (traffic.crashed || traffic.y > 2500 || Math.hypot(traffic.x, traffic.z) > 8000) {
            trafficRef.current = createTraffic();
          }
        }

        const ias = Math.round(player.iasKt);
        const alt = Math.round(player.altFt);
        const vsi = Math.round(player.vsiFpm / 50) * 50;
        if (iasRef.current) iasRef.current.textContent = String(ias);
        if (altRef.current) altRef.current.textContent = alt.toLocaleString("en-US");
        if (vsiRef.current) {
          vsiRef.current.textContent = `${vsi > 0 ? "+" : ""}${vsi}`;
        }
        if (hdgRef.current) hdgRef.current.textContent = pad3(player.heading);
        if (rpmRef.current) rpmRef.current.textContent = String(Math.round(player.rpm / 10) * 10);
        if (thrRef.current) thrRef.current.textContent = `${Math.round(throttleRef.current * 100)}%`;
        if (flapRef.current) flapRef.current.textContent = flapsRef.current === 0 ? "UP" : String(flapsRef.current);
        if (ballRef.current) {
          const pitchPx = player.pitch * (180 / Math.PI) * 1.7;
          const rollDeg = (-player.roll * 180) / Math.PI;
          ballRef.current.style.transform = `translateY(${pitchPx}px) rotate(${rollDeg}deg)`;
        }
        instrumentPanelRef.current?.update(player);
        mapRef.current?.update(player, traffic);
        if (taskRef.current) {
          const progress = circuitRef.current;
          taskRef.current.textContent = progress.failed ? "Circuit ended · reset to retry"
            : progress.completed === CIRCUIT_TASKS.length ? "Circuit complete · full stop on runway"
            : `${progress.completed}/${CIRCUIT_TASKS.length} · Next: ${CIRCUIT_TASKS[progress.completed]}`;
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
          const hz = 110 + player.rpm * 0.34;
          audio.filter.frequency.setTargetAtTime(hz, audio.ctx.currentTime, 0.05);
          const vol = phaseRef.current === "brief" ? 0.0001 : 0.008 + rpmPower * 0.072;
          audio.gain.gain.setTargetAtTime(vol, audio.ctx.currentTime, 0.08);
          audio.stall.gain.setTargetAtTime(phaseRef.current === "fly" && player.stalled ? 0.03 : 0, audio.ctx.currentTime, 0.05);
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
      void audio.ctx?.close();
    };
    // mount once
  }, []);

  function start() {
    circuitRef.current = newCircuit();
    playerRef.current = createPlayer(AIRFRAMES[airframeRef.current]);
    trafficRef.current = createTraffic();
    throttleRef.current = 0;
    flapsRef.current = 0;
    keysRef.current.clear();
    touch.current = { ail: 0, ele: 0, owned: false, lever: 0 };
    brakeTouch.current = false;
    sessionRef.current = { startedAt: new Date().toISOString(), airborneSeconds: 0, maxAltitudeFt: FIELD_ELEV_FT, wasAirborne: false, ended: false };
    phaseRef.current = "fly";
    setPhase("fly");
  }

  function resetFromCrash() {
    finishFlight("reset");
    sessionRef.current = { startedAt: new Date().toISOString(), airborneSeconds: 0, maxAltitudeFt: FIELD_ELEV_FT, wasAirborne: false, ended: false };
    circuitRef.current = newCircuit();
    playerRef.current = createPlayer(AIRFRAMES[airframeRef.current]);
    trafficRef.current = createTraffic();
    throttleRef.current = 0;
    flapsRef.current = 0;
    touch.current = { ail: 0, ele: 0, owned: false, lever: 0 };
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

  function moreFlaps(dir: number) {
    const i = FLAP_STEPS.indexOf(flapsRef.current);
    const next = FLAP_STEPS[clamp(i + dir, 0, FLAP_STEPS.length - 1)] ?? 0;
    if (next === flapsRef.current) return;
    flapsRef.current = next;
    flapClickRef.current?.();
  }

  return (
    <main data-cockpit={camLabel === "Cockpit" ? "true" : "false"} className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" />
      {camLabel === "Cockpit" && <div aria-hidden="true" className="cockpit-trim"><div className="cockpit-deck" /></div>}
      <InstrumentPanel ref={instrumentPanelRef} />
      {phase === "fly" && (
        <details className="absolute top-44 left-3 z-10 max-h-56 max-w-72 overflow-y-auto rounded-md border border-border bg-bg/90 p-2 text-xs text-fg sm:top-4 sm:left-60 sm:max-h-80">
          <summary className="sticky top-0 min-h-11 cursor-pointer bg-bg font-mono text-primary">Radio & local map</summary>
          <p className="mb-2 text-muted">Takeoff → crosswind → downwind → base → final → full stop on strip.</p>
          <p className="text-muted">Practice radio · text only, not transmitted</p>
          <p ref={radioRef} className="mt-2">{radioCall(playerRef.current)}</p>
          <p ref={trafficRadioRef} className="mt-2 text-muted">{radioCall(trafficRef.current)}</p>
          <FieldMap ref={mapRef} />
          <LivePresence ref={presenceRef} />
          <button
            type="button"
            className="mt-2 min-h-11 text-primary"
            onClick={() => {
              finishFlight("reset");
              keysRef.current.clear();
              phaseRef.current = "brief";
              setPhase("brief");
            }}
          >End flight / briefing</button>
          {logError && <p role="alert" className="text-danger">{logError}</p>}
        </details>
      )}

      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto rounded-md border border-border bg-bg/80 px-3 py-2 backdrop-blur-sm">
          <p className="font-mono text-xs tracking-widest text-primary">FIELD 28</p>
          <p className="font-mono text-sm text-fg">N172FD</p>
          <p className="text-xs text-muted">
            RWY {RWY_HDG / 10} · wind {weatherLabel(WEATHER_OPTIONS[weatherIndex]!.weather)} · {FIELD_ELEV_FT.toLocaleString("en-US")} ft
          </p>
          {phase === "fly" && <p ref={taskRef} className="mt-1 font-mono text-xs text-primary">0/6 · Next: Takeoff</p>}
          {phase !== "brief" && failure !== "none" && (
            <p className="mt-1 font-mono text-[10px] tracking-widest text-primary">
              FAULT · {FAILURE_OPTIONS.find((option) => option.value === failure)?.label}
            </p>
          )}
        </div>
        <div className="pointer-events-auto rounded-md border border-border bg-bg/80 px-3 py-2 text-right backdrop-blur-sm">
          <button
            type="button"
            aria-pressed={night}
            onClick={() => {
              worldRef.current?.setNight(!night);
              setNight(!night);
            }}
            className="min-h-11 px-2 text-xs text-primary"
          >
            {night ? "Night" : "Day"} lighting
          </button>
          <p className="text-xs tracking-wide text-muted">TRAFFIC</p>
          <p ref={trafficRefEl} className="font-mono text-sm text-fg">
            N344TG
          </p>
          <button
            type="button"
            onClick={cycleCam}
            className="mt-1 inline-flex min-h-11 items-center gap-1 text-xs text-primary"
          >
            <Camera className="size-3.5" aria-hidden />
            {camLabel}
          </button>
        </div>
      </header>

      <div
        ref={stallRef}
        hidden
        className="pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 rounded-sm bg-danger px-4 py-1 font-mono text-sm tracking-widest text-fg"
      >
        STALL
      </div>

      <p
        ref={hintRef}
        className="pointer-events-none absolute right-4 bottom-36 left-4 hidden text-center font-mono text-xs text-fg sm:block"
      />

      <section className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2 sm:justify-center sm:p-4">
        <div className="flex max-w-full items-end gap-2 overflow-x-auto rounded-md border border-border bg-bg/85 px-2 py-2 backdrop-blur-sm sm:gap-4 sm:px-4">
          <Readout k="KIAS" vRef={iasRef} value="0" />
          <div className="ai" aria-hidden>
            <div ref={ballRef} className="ai-ball" />
            <div className="ai-wings" />
            <div className="ai-dot" />
          </div>
          <Readout k="ALT" vRef={altRef} value="2,871" />
          <Readout k="VSI" vRef={vsiRef} value="0" />
          <Readout k="HDG" vRef={hdgRef} value="280" />
          <Readout k="RPM" vRef={rpmRef} value="620" />
          <Readout k="THR" vRef={thrRef} value="0%" />
          <Readout k="FLAP" vRef={flapRef} value="UP" />
        </div>
      </section>

      {phase === "fly" && (
      <>
      <div className="absolute bottom-24 left-3 flex touch-none flex-col items-center gap-2 sm:hidden">
        <div
          className="relative size-28 rounded-full border border-border bg-bg/50"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            stickId.current = e.pointerId;
          }}
          onPointerMove={(e) => {
            if (e.pointerId !== stickId.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width * 0.34);
            const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height * 0.34);
            touch.current.ail = clamp(-dx, -1, 1);
            touch.current.ele = clamp(dy, -1, 1);
          }}
          onPointerUp={(e) => {
            if (e.pointerId !== stickId.current) return;
            stickId.current = null;
            touch.current.ail = 0;
            touch.current.ele = 0;
          }}
          role="slider"
          aria-label="Yoke"
          aria-valuemin={-1}
          aria-valuemax={1}
          aria-valuenow={0}
        >
          <div className="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
        </div>
        <span className="font-mono text-[10px] tracking-widest text-muted">YOKE</span>
      </div>

      <div className="absolute right-3 bottom-24 flex touch-none flex-col items-center gap-2 sm:hidden">
        <div
          className="relative h-28 w-12 rounded-full border border-border bg-bg/50"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            const rect = e.currentTarget.getBoundingClientRect();
            const t = 1 - (e.clientY - rect.top) / rect.height;
            touch.current.owned = true;
            touch.current.lever = clamp(t, 0, 1);
          }}
          onPointerMove={(e) => {
            if (!touch.current.owned) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const t = 1 - (e.clientY - rect.top) / rect.height;
            touch.current.lever = clamp(t, 0, 1);
          }}
          role="slider"
          aria-label="Throttle"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
        >
          <div className="absolute inset-x-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary" />
        </div>
        <div className="flex gap-1">
          <button type="button" className="size-11 rounded-md border border-border bg-bg/80 text-xs" onClick={() => moreFlaps(-1)}>
            Flap−
          </button>
          <button type="button" className="size-11 rounded-md border border-border bg-bg/80 text-xs" onClick={() => moreFlaps(1)}>
            Flap+
          </button>
          <button
            type="button"
            className="size-11 rounded-md border border-border bg-bg/80 text-xs"
            onPointerDown={() => {
              brakeTouch.current = true;
            }}
            onPointerUp={() => {
              brakeTouch.current = false;
            }}
            onPointerLeave={() => {
              brakeTouch.current = false;
            }}
          >
            Brk
          </button>
        </div>
      </div>
      </>
      )}

      {phase === "brief" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center overflow-y-auto bg-bg/40 p-4">
          <div className="my-auto w-full max-w-md shrink-0 rounded-lg border border-border bg-surface p-5 shadow-lg">
            <div className="flex items-center gap-2 text-primary">
              <Plane className="size-4" aria-hidden />
              <p className="font-mono text-xs tracking-widest">PATTERN TRAINER</p>
            </div>
            <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-fg">Field 28</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {airframeId === "standard" ? "Generic 172-class trainer" : "Generic light tailwheel-class trainer"}, N172FD. One flight model steps both airplanes.
              You send it inputs. It owns the state. Fictional field, not a real airport.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-muted">
              <li>Runway {RWY_HDG / 10}: {RWY_LENGTH.toLocaleString("en-US")} × {RWY_WIDTH} m; field elevation {FIELD_ELEV_FT.toLocaleString("en-US")} ft.</li>
              <li>Wind: {weatherLabel(WEATHER_OPTIONS[weatherIndex]!.weather)}. Full throttle, then pull to rotate once speed builds.</li>
              <li>Flaps add lift and drag; extend for slower approaches, retract for a clean climb.</li>
              <li>N344TG flies an altitude-hold left practice circuit, not a landing approach.</li>
            </ul>
            <label className="mt-3 block text-xs text-muted">
              Airframe
              <select aria-label="Airframe" value={airframeId} className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-2 text-fg" onChange={event => {
                const id = event.target.value;
                if (id === "standard" || id === "light") { airframeRef.current = id; setAirframeId(id); }
              }}>
                <option value="standard">Standard trainer · {AIRFRAMES.standard.mass.toLocaleString("en-US")} kg</option>
                <option value="light">Light trainer · {AIRFRAMES.light.mass.toLocaleString("en-US")} kg</option>
              </select>
            </label>
            {airframeId === "light" && <p className="mt-1 text-xs text-muted">Generic tuning, not a specific aircraft. Shared procedural appearance and ground steering, not tailwheel handling.</p>}
            <label className="mt-3 block text-xs text-muted">
              Weather
              <select
                className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-2 text-fg"
                value={weatherIndex}
                onChange={event => {
                  const index = Number(event.target.value);
                  weatherRef.current = WEATHER_OPTIONS[index]!.weather;
                  setWeatherIndex(index);
                }}
              >
                {WEATHER_OPTIONS.map((option, index) => <option key={option.label} value={index}>{option.label}</option>)}
              </select>
            </label>
            <fieldset className="mt-4">
              <legend className="font-mono text-xs tracking-widest text-muted">AIRCRAFT CONDITION</legend>
              <div className="mt-2 grid gap-2">
                {FAILURE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`failure-${option.value}`}
                    className="flex cursor-pointer items-start gap-2 rounded-md border border-border px-3 py-2"
                  >
                    <input
                      id={`failure-${option.value}`}
                      type="radio"
                      name="flight-failure"
                      value={option.value}
                      checked={failure === option.value}
                      onChange={() => {
                        failureRef.current = option.value;
                        setFailure(option.value);
                      }}
                      className="mt-1 accent-primary"
                    />
                    <span>
                      <span className="block text-sm text-fg">{option.label}</span>
                      <span className="block text-xs text-muted">{option.detail}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs text-fg">
              <dt className="text-muted">W / S</dt>
              <dd>Throttle up / down</dd>
              <dt className="text-muted">A / D</dt>
              <dd>Bank left / right</dd>
              <dt className="text-muted">↓ / ↑</dt>
              <dd>Pull / push</dd>
              <dt className="text-muted">Q / E</dt>
              <dd>Rudder left / right</dd>
              <dt className="text-muted">F / G</dt>
              <dd>Flaps down / up</dd>
              <dt className="text-muted">Space · C · R</dt>
              <dd>Brake · camera · reset</dd>
            </dl>
            <details className="mt-3 text-xs">
              <summary className="min-h-8 cursor-pointer text-primary">Local flight log · {flightLog.length} flights</summary>
              <p className="text-muted">This browser only; no accounts or sync. Last five:</p>
              {flightLog.length === 0 && <p className="mt-2 text-muted">No saved flights.</p>}
              <ol className="mt-2 space-y-2">
                {flightLog.slice(-5).reverse().map((record, index) => (
                  <li key={`${record.startedAt}-${index}`} className="text-fg">
                    {record.startedAt.slice(0, 16).replace("T", " ")} UTC · {record.landingKind} · {Math.round(record.airborneSeconds)} s airborne · max {Math.round(record.maxAltitudeFt)} ft MSL
                  </li>
                ))}
              </ol>
              <button type="button" className="mt-2 min-h-11 text-danger" onClick={() => {
                try { forgetFlights(localStorage); setFlightLog([]); setLogError(""); }
                catch (error) { setLogError(`Could not forget log: ${error instanceof Error ? error.message : String(error)}`); }
              }}>Forget local flight log</button>
            </details>
            {logError && <p role="alert" className="mt-2 text-xs text-danger">{logError}</p>}
            <button
              type="button"
              onClick={start}
              className="mt-5 w-full rounded-md bg-primary px-4 py-3 font-medium text-bg"
            >
              Start engines
            </button>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Reduced-order training demo, not certified flight instruction. Synthesized
              audio starts with your first click. No mixture, carb heat, or navigation radio.
            </p>
          </div>
        </div>
      )}

      {phase === "crash" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/70 p-4">
          <div className="w-full max-w-sm rounded-lg border border-danger bg-surface p-5">
            <p className="font-mono text-xs tracking-widest text-danger">OFF THE RUNWAY</p>
            <h2 className="mt-1 text-2xl font-semibold text-fg">{crashReason}</h2>
            <p className="mt-2 text-sm text-muted">The airplane is done. The pattern ship is not.</p>
            <button
              type="button"
              onClick={resetFromCrash}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-medium text-bg"
            >
              <RotateCcw className="size-4" aria-hidden />
              Reset on 28
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Readout({
  k,
  value,
  vRef,
}: {
  k: string;
  value: string;
  vRef: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <div className="min-w-12 text-center">
      <p className="font-mono text-[10px] tracking-widest text-muted">{k}</p>
      <span ref={vRef} className="font-mono text-sm text-fg sm:text-base">
        {value}
      </span>
    </div>
  );
}
