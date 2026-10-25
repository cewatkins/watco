import { forwardRef, useImperativeHandle, useRef } from "react";
import { MAP_CORNERS, mapPoint, mapWorldPoint } from "@/sim/map";
import { RWY_LENGTH, type Ship } from "@/sim/fdm";

export type FieldMapHandle = { update: (player: Ship, traffic: Ship) => void };
const runwayStart = mapPoint(mapWorldPoint(0, 0));
const runwayEnd = mapPoint(mapWorldPoint(RWY_LENGTH, 0));
const box = MAP_CORNERS.map(p => { const v = mapPoint(p); return `${v.x.toFixed(3)},${v.y.toFixed(3)}`; }).join(" ");

export const FieldMap = forwardRef<FieldMapHandle>(function FieldMap(_props, ref) {
  const playerDot = useRef<SVGCircleElement>(null);
  const trafficDot = useRef<SVGCircleElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  useImperativeHandle(ref, () => ({
    update(player, traffic) {
      for (const [ship, dot] of [[player, playerDot.current], [traffic, trafficDot.current]] as const) {
        const p = mapPoint(ship);
        dot?.setAttribute("cx", String(p.x));
        dot?.setAttribute("cy", String(p.y));
      }
      if (status.current) {
        status.current.textContent = [
          mapPoint(player).offMap ? "You: off map" : "You: amber",
          mapPoint(traffic).offMap ? "Traffic: off map" : "Traffic: light",
        ].join(" · ");
      }
    },
  }), []);
  return (
    <figure className="mt-3">
      <figcaption className="text-muted">Field 28 · fictional local schematic · N ↑</figcaption>
      <svg viewBox="0 0 200 200" className="mx-auto h-40 w-40" role="img" aria-label="North-up local map showing runway, left pattern, player and traffic">
        <polygon points={box} fill="none" stroke="var(--color-muted)" strokeDasharray="3 3" />
        <line x1={runwayStart.x.toFixed(3)} y1={runwayStart.y.toFixed(3)} x2={runwayEnd.x.toFixed(3)} y2={runwayEnd.y.toFixed(3)} stroke="var(--color-fg)" strokeWidth="3" />
        <circle ref={playerDot} cx="100" cy="100" r="4" fill="var(--color-primary)" />
        <circle ref={trafficDot} cx="100" cy="100" r="3" fill="var(--color-fg)" />
      </svg>
      <p ref={status} className="text-muted">You: amber · Traffic: light</p>
    </figure>
  );
});
