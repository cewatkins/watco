import { createHash } from "node:crypto";
import { z } from "zod";
import { getSql, dbSource } from "@/lib/db";

const roomId = z.string().regex(/^[a-f0-9]{64}$/);
const peerId = z.string().uuid();
const sealed = z.object({
  iv: z.string().regex(/^[a-f0-9]{24}$/),
  data: z.string().regex(/^[a-f0-9]+$/).max(65536),
}).strict();
const postSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("signal"), room: roomId, from: peerId, to: peerId, kind: z.enum(["offer", "answer", "ice"]), payload: sealed }).strict(),
  z.object({ op: z.literal("leave"), room: roomId, peer: peerId }).strict(),
]);
const querySchema = z.object({
  room: roomId, peer: peerId, since: z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER).default(0),
});
function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "cache-control": "no-store", "referrer-policy": "no-referrer" } });
}
const hashRoom = (room: string) => createHash("sha256").update(room).digest("hex");

/** Mailbox only: no positions, inputs, flight logs, or authoritative physics. */
export async function handleSignaling(request: Request): Promise<Response> {
  if (process.env.VERCEL && dbSource !== "neon") return json({ error: "Live presence needs the deployed signaling database. Solo flight is available." }, 503);
  try {
    if (request.method === "GET") {
      const url = new URL(request.url);
      const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
      if (!parsed.success) return json({ error: "Invalid mailbox query" }, 400);
      const { peer, since } = parsed.data;
      const room = hashRoom(parsed.data.room);
      const sql = await getSql();
      await sql.query("DELETE FROM webrtc_signals WHERE created_at < now() - interval '60 seconds'");
      await sql.query("DELETE FROM webrtc_peers WHERE last_seen < now() - interval '30 seconds'");
      const peers = await sql.query<{ peer_id: string }>("SELECT peer_id FROM webrtc_peers WHERE room = $1", [room]);
      if (peers.length >= 8 && !peers.some(p => p.peer_id === peer)) return json({ error: "Room is full (8 pilots)" }, 409);
      await sql.query(`INSERT INTO webrtc_peers (room, peer_id) VALUES ($1, $2)
        ON CONFLICT (room, peer_id) DO UPDATE SET last_seen = now()`, [room, peer]);
      const roster = await sql.query<{ peer_id: string }>("SELECT peer_id FROM webrtc_peers WHERE room = $1 ORDER BY peer_id LIMIT 8", [room]);
      const signals = await sql.query<{ id: number; from_peer: string; kind: string; payload: unknown }>(
        `SELECT id, from_peer, kind, payload FROM webrtc_signals
         WHERE room = $1 AND to_peer = $2 AND id > $3 AND created_at > now() - interval '60 seconds'
         ORDER BY id LIMIT 200`, [room, peer, since],
      );
      return json({ peers: roster.map(p => ({ id: p.peer_id, name: "Guest pilot" })), signals: signals.map(s => ({ id: s.id, from: s.from_peer, kind: s.kind, payload: s.payload })) });
    }
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    if (Number(request.headers.get("content-length") ?? 0) > 70000) return json({ error: "Signal too large" }, 413);
    const text = await request.text();
    if (text.length > 70000) return json({ error: "Signal too large" }, 413);
    let body: unknown;
    try { body = JSON.parse(text); }
    catch { return json({ error: "Invalid JSON" }, 400); }
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) return json({ error: "Invalid mailbox message" }, 400);
    const msg = parsed.data;
    const room = hashRoom(msg.room);
    const sql = await getSql();
    if (msg.op === "leave") {
      await sql.query("DELETE FROM webrtc_peers WHERE room = $1 AND peer_id = $2", [room, msg.peer]);
      await sql.query("DELETE FROM webrtc_signals WHERE room = $1 AND (from_peer = $2 OR to_peer = $2)", [room, msg.peer]);
    } else {
      const peers = await sql.query<{ peer_id: string }>(
        "SELECT peer_id FROM webrtc_peers WHERE room = $1 AND last_seen > now() - interval '30 seconds'", [room],
      );
      if (!peers.some(p => p.peer_id === msg.from) || !peers.some(p => p.peer_id === msg.to)) return json({ error: "Peer has left the room" }, 409);
      const count = await sql.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM webrtc_signals WHERE room = $1 AND from_peer = $2 AND created_at > now() - interval '60 seconds'", [room, msg.from],
      );
      if ((count[0]?.count ?? 0) >= 300) return json({ error: "Signaling rate exceeded; retry later" }, 429);
      await sql.query("INSERT INTO webrtc_signals (room,to_peer,from_peer,kind,payload) VALUES ($1,$2,$3,$4,$5)", [room, msg.to, msg.from, msg.kind, JSON.stringify(msg.payload)]);
    }
    return json({ ok: true });
  } catch (error) {
    console.error("[rtc] mailbox failed", error);
    return json({ error: "Signaling unavailable; solo flight remains available" }, 503);
  }
}
