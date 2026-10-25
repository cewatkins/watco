import { forwardRef, useImperativeHandle, useRef, type ReactNode, type RefObject } from "react";
import { instrumentReadings } from "@/sim/instruments";
import type { Ship } from "@/sim/fdm";

export type InstrumentPanelHandle = {
  update: (ship: Ship) => void;
};

type GaugeProps = {
  label: string;
  valueRef: RefObject<HTMLSpanElement | null>;
  gaugeRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
};

function pointAt(angle: number, radius: number): [number, number] {
  const radians = (angle * Math.PI) / 180;
  // Rounded SVG coordinates serialize identically during server and client rendering.
  return [
    Number((50 + Math.sin(radians) * radius).toFixed(3)),
    Number((50 - Math.cos(radians) * radius).toFixed(3)),
  ];
}

function Gauge({ label, valueRef, gaugeRef, children }: GaugeProps) {
  return (
    <div
      ref={gaugeRef}
      role="img"
      aria-label={label}
      className="flex min-w-0 flex-col items-center rounded-sm border border-border bg-surface/80 p-1 sm:p-2"
    >
      <span className="font-mono text-instrument tracking-widest text-muted">{label}</span>
      <svg viewBox="0 0 100 100" aria-hidden="true" className="aspect-square w-full max-w-20 sm:max-w-24">
        <circle cx="50" cy="50" r="47" fill="var(--color-bg)" stroke="var(--color-border)" strokeWidth="3" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="1" />
        {children}
      </svg>
      <span ref={valueRef} className="font-mono text-instrument tabular-nums text-fg">
        --
      </span>
    </div>
  );
}

function tick(angle: number, radius: number, length: number): [number, number, number, number] {
  const [x1, y1] = pointAt(angle, radius);
  const [x2, y2] = pointAt(angle, radius - length);
  return [x1, y1, x2, y2];
}

export const InstrumentPanel = forwardRef<InstrumentPanelHandle>(function InstrumentPanel(_props, ref) {
  const airspeedGauge = useRef<HTMLDivElement>(null);
  const airspeedValue = useRef<HTMLSpanElement>(null);
  const airspeedNeedle = useRef<SVGLineElement>(null);
  const attitudeGauge = useRef<HTMLDivElement>(null);
  const attitudeValue = useRef<HTMLSpanElement>(null);
  const attitudeHorizon = useRef<SVGGElement>(null);
  const altimeterGauge = useRef<HTMLDivElement>(null);
  const altitudeValue = useRef<HTMLSpanElement>(null);
  const altimeterNeedle = useRef<SVGLineElement>(null);
  const turnGauge = useRef<HTMLDivElement>(null);
  const turnValue = useRef<HTMLSpanElement>(null);
  const turnAircraft = useRef<SVGGElement>(null);
  const headingGauge = useRef<HTMLDivElement>(null);
  const headingValue = useRef<HTMLSpanElement>(null);
  const headingCard = useRef<SVGGElement>(null);
  const verticalSpeedGauge = useRef<HTMLDivElement>(null);
  const verticalSpeedValue = useRef<HTMLSpanElement>(null);
  const verticalSpeedNeedle = useRef<SVGLineElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      update(ship) {
        const reading = instrumentReadings(ship);
        const setTransform = (element: SVGElement | null, value: string) => {
          if (element?.getAttribute("transform") !== value) element?.setAttribute("transform", value);
        };
        const setText = (element: HTMLSpanElement | null, value: string) => {
          if (element && element.textContent !== value) element.textContent = value;
        };
        const setLabel = (element: HTMLDivElement | null, value: string) => {
          if (element?.getAttribute("aria-label") !== value) element?.setAttribute("aria-label", value);
        };

        setTransform(airspeedNeedle.current, `rotate(${reading.airspeedAngle} 50 50)`);
        setText(airspeedValue.current, reading.airspeedLabel);
        setLabel(airspeedGauge.current, `Airspeed ${reading.airspeedLabel}`);

        setTransform(
          attitudeHorizon.current,
          `translate(0 ${reading.attitudePitchPx}) rotate(${reading.attitudeRollDeg} 50 50)`,
        );
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
      },
    }),
    [],
  );

  return (
    <section
      aria-label="Flight instruments"
      className="pointer-events-none absolute bottom-52 left-1/2 z-10 w-52 -translate-x-1/2 rounded-md border border-border bg-bg/90 p-2 shadow-lg backdrop-blur-sm sm:bottom-28 sm:w-96 sm:p-3"
    >
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Gauge label="Airspeed" gaugeRef={airspeedGauge} valueRef={airspeedValue}>
          {Array.from({ length: 17 }, (_, index) => {
            const angle = -135 + (index * 270) / 16;
            const [x1, y1, x2, y2] = tick(angle, 44, index % 4 === 0 ? 7 : 3);
            const [labelX, labelY] = pointAt(angle, 31);
            return (
              <g key={index}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-muted)" strokeWidth={index % 4 === 0 ? 1.5 : 0.8} />
                {index % 4 === 0 && (
                  <text x={labelX} y={labelY + 3} textAnchor="middle" fill="var(--color-fg)" fontSize="8">
                    {index * 10}
                  </text>
                )}
              </g>
            );
          })}
          <line ref={airspeedNeedle} x1="50" y1="54" x2="50" y2="19" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="50" r="3.5" fill="var(--color-fg)" />
        </Gauge>

        <Gauge label="Attitude" gaugeRef={attitudeGauge} valueRef={attitudeValue}>
          <defs>
            <clipPath id="instrument-attitude-clip">
              <circle cx="50" cy="50" r="41" />
            </clipPath>
          </defs>
          <g clipPath="url(#instrument-attitude-clip)">
            <rect x="8" y="8" width="84" height="84" fill="var(--color-sky)" />
            <g ref={attitudeHorizon} transform="translate(0 0) rotate(0 50 50)">
              <rect x="8" y="50" width="84" height="42" fill="var(--color-earth)" />
              <line x1="8" y1="50" x2="92" y2="50" stroke="var(--color-fg)" strokeWidth="1.5" />
              {[-20, -10, 10, 20].map((pitch) => (
                <line
                  key={pitch}
                  x1={pitch < 0 ? 40 : 44}
                  y1={50 + pitch * 0.75}
                  x2={pitch < 0 ? 60 : 56}
                  y2={50 + pitch * 0.75}
                  stroke="var(--color-fg)"
                  strokeWidth="1"
                />
              ))}
            </g>
          </g>
          <path d="M28 49H42L47 46H53L58 49H72V53H54L51 57H49L46 53H28Z" fill="var(--color-primary)" />
        </Gauge>

        <Gauge label="Altimeter" gaugeRef={altimeterGauge} valueRef={altitudeValue}>
          {Array.from({ length: 10 }, (_, index) => {
            const angle = index * 36;
            const [x1, y1, x2, y2] = tick(angle, 44, 6);
            const [labelX, labelY] = pointAt(angle, 31);
            return (
              <g key={index}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-muted)" strokeWidth="1.2" />
                <text x={labelX} y={labelY + 3} textAnchor="middle" fill="var(--color-fg)" fontSize="8">
                  {index}
                </text>
              </g>
            );
          })}
          <line ref={altimeterNeedle} x1="50" y1="54" x2="50" y2="19" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="50" r="3.5" fill="var(--color-fg)" />
        </Gauge>

        <Gauge label="Turn trend" gaugeRef={turnGauge} valueRef={turnValue}>
          {[-45, 0, 45].map((angle) => {
            const [x1, y1, x2, y2] = tick(angle, 44, 7);
            return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-muted)" strokeWidth="1.5" />;
          })}
          <g ref={turnAircraft} transform="rotate(0 50 50)" fill="var(--color-primary)">
            <path d="M20 47H43L48 39H52L57 47H80V53H56L52 62H48L44 53H20Z" />
          </g>
        </Gauge>

        <Gauge label="Heading" gaugeRef={headingGauge} valueRef={headingValue}>
          <g ref={headingCard} transform="rotate(0 50 50)">
            {Array.from({ length: 12 }, (_, index) => {
              const angle = index * 30;
              const [x1, y1, x2, y2] = tick(angle, 44, 5);
              const [labelX, labelY] = pointAt(angle, 31);
              return (
                <g key={index}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-muted)" strokeWidth="1.2" />
                  <text x={labelX} y={labelY + 3} textAnchor="middle" fill="var(--color-fg)" fontSize="7">
                    {String(index * 3).padStart(2, "0")}
                  </text>
                </g>
              );
            })}
          </g>
          <path d="M46 8L50 15L54 8Z" fill="var(--color-primary)" />
        </Gauge>

        <Gauge label="Vertical speed" gaugeRef={verticalSpeedGauge} valueRef={verticalSpeedValue}>
          {[-2000, -1000, 0, 1000, 2000].map((speed) => {
            const angle = (speed / 2000) * 135;
            const [x1, y1, x2, y2] = tick(angle, 44, 6);
            const [labelX, labelY] = pointAt(angle, 31);
            return (
              <g key={speed}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-muted)" strokeWidth="1.2" />
                <text x={labelX} y={labelY + 3} textAnchor="middle" fill="var(--color-fg)" fontSize="7">
                  {speed === 0 ? "0" : String(speed / 1000)}
                </text>
              </g>
            );
          })}
          <line ref={verticalSpeedNeedle} x1="50" y1="54" x2="50" y2="19" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="50" r="3.5" fill="var(--color-fg)" />
        </Gauge>
      </div>
    </section>
  );
});
