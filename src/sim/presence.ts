import { z } from "zod";
import { createShip, type Ship, type PilotInput } from "./fdm.ts";

const finite = z.number().finite();
const packetSchema = z.object({
  version: z.literal(1), sequence: z.number().int().nonnegative(),
  ship: z.object({
    x: finite.min(-20000).max(20000), y: finite.min(0).max(10000), z: finite.min(-20000).max(20000),
    vx: finite.min(-500).max(500), vy: finite.min(-500).max(500), vz: finite.min(-500).max(500),
    yaw: finite, pitch: finite.min(-Math.PI).max(Math.PI), roll: finite.min(-Math.PI).max(Math.PI),
    rollRate: finite, pitchRate: finite, throttle: finite.min(0).max(1), rpm: finite.min(0).max(10000),
    onGround: z.boolean(), crashed: z.boolean(), crashReason: z.string().max(80),
    tas: finite, iasKt: finite, tasKt: finite, altFt: finite, aglFt: finite, vsiFpm: finite,
    heading: finite, alphaDeg: finite, stalled: z.boolean(),
  }),
  input: z.object({
    aileron: finite.min(-1).max(1), elevator: finite.min(-1).max(1), rudder: finite.min(-1).max(1),
    throttle: finite.min(0).max(1), brake: finite.min(0).max(1), flaps: z.union([z.literal(0), z.literal(10), z.literal(20), z.literal(30)]),
    failure: z.enum(["none", "partial-power", "heavy-wing"]).optional(),
  }),
});
export function presencePacket(ship: Ship, input: PilotInput, sequence: number) {
  return { version: 1, sequence, ship, input };
}
export function readPresence(value: unknown, peerId: string) {
  const parsed = packetSchema.safeParse(value);
  if (!parsed.success) throw new Error("Invalid aircraft presence packet");
  return { sequence: parsed.data.sequence, input: parsed.data.input, ship: createShip({ ...parsed.data.ship, id: peerId, callsign: `Guest ${peerId.slice(0, 4)}` }) };
}

const toHex = (data: Uint8Array) => [...data].map(x => x.toString(16).padStart(2, "0")).join("");
function fromHex(value: string) {
  if (!/^(?:[a-f0-9]{2})+$/.test(value)) throw new Error("Invalid encrypted signal encoding");
  const bytes = new Uint8Array(value.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}
export function newRoomCode() { return toHex(crypto.getRandomValues(new Uint8Array(16))); }
export async function roomCodec(code: string) {
  if (!/^[a-f0-9]{32}$/.test(code)) throw new Error("Room code must be 32 lowercase hex characters");
  const key = await crypto.subtle.importKey("raw", fromHex(code), "AES-GCM", false, ["encrypt", "decrypt"]);
  const room = toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code))));
  return {
    room,
    encode: async (value: unknown) => {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(value)));
      return { iv: toHex(iv), data: toHex(new Uint8Array(data)) };
    },
    decode: async (value: unknown) => {
      const sealed = z.object({ iv: z.string().length(24), data: z.string().max(65536) }).parse(value);
      const data = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromHex(sealed.iv) }, key, fromHex(sealed.data));
      return JSON.parse(new TextDecoder().decode(data)) as unknown;
    },
  };
}
