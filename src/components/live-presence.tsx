import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { P2PRoom, type PeerInfo } from "@/lib/multiplayer";
import { newRoomCode, roomCodec, presencePacket, readPresence } from "@/sim/presence";
import type { PilotInput, Ship } from "@/sim/fdm";

export type PresenceHandle = { publish: (ship: Ship, input: PilotInput) => void; ships: () => Ship[] };
export const LivePresence = forwardRef<PresenceHandle>(function LivePresence(_props, ref) {
  const roomRef = useRef<P2PRoom | null>(null);
  const guests = useRef(new Map<string, { ship: Ship; receivedAt: number; sequence: number }>());
  const [code, setCode] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("Solo · no connection");
  const [error, setError] = useState("");
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [joined, setJoined] = useState(false);
  const connecting = useRef(false);
  const generation = useRef(0);
  const sendAt = useRef(0);
  const sequence = useRef(0);
  useEffect(() => () => {
    generation.current++;
    roomRef.current?.close();
    roomRef.current = null;
  }, []);
  useImperativeHandle(ref, () => ({
    publish(ship, input) {
      const now = performance.now();
      if (now - sendAt.current < 100 || !roomRef.current) return;
      sendAt.current = now;
      roomRef.current.broadcast(presencePacket(ship, input, sequence.current++));
    },
    ships() {
      const now = performance.now();
      return [...guests.current.values()].filter(g => now - g.receivedAt < 5000).map(g => g.ship);
    },
  }), []);

  async function join() {
    if (connecting.current || roomRef.current) return;
    if (!consent) { setError("Choose to share a direct connection with your invited pilot first."); return; }
    connecting.current = true;
    const current = ++generation.current;
    try {
      const codec = await roomCodec(code.trim());
      if (current !== generation.current) return;
      const room = new P2PRoom({
        room: codec.room, selfId: crypto.randomUUID(), name: "Guest pilot",
        signalCodec: codec,
        onConnected: () => setStatus("Mailbox ready · waiting for invited pilots"),
        onSignalingStatus: message => setError(message ? `${message}. Solo flight continues; retrying signaling.` : ""),
        onPeersChanged: list => {
          setPeers(list);
          const alive = new Set(list.filter(p => p.connectionState === "connected").map(p => p.id));
          for (const id of guests.current.keys()) if (!alive.has(id)) guests.current.delete(id);
          setStatus(list.some(p => p.connectionState === "connected") ? "Live direct connection" : "Waiting / connecting · NAT may block direct connections");
        },
        onMessage: (from, value) => {
          try {
            const packet = readPresence(value, from);
            const previous = guests.current.get(from);
            if (previous && packet.sequence <= previous.sequence) return;
            guests.current.set(from, { ship: packet.ship, sequence: packet.sequence, receivedAt: performance.now() });
          } catch (problem) {
            setError(problem instanceof Error ? problem.message : String(problem));
          }
        },
      });
      roomRef.current = room;
      setJoined(true);
      setStatus("Connecting to signaling mailbox…");
      await room.join();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : String(problem));
    } finally { connecting.current = false; }
  }
  function leave() {
    generation.current++;
    roomRef.current?.close(); roomRef.current = null;
    guests.current.clear(); setPeers([]); setJoined(false); setStatus("Solo · disconnected"); setError("");
  }
  return (
    <section className="mt-3 border-t border-border pt-3">
      <h2 className="font-mono text-primary">Invite a pilot · optional live presence</h2>
      <p className="mt-1 text-muted">Friends only. No referee, anti-cheat, or shared weather. Direct connections reveal network addresses to each other. Strict NAT may prevent joining; solo remains available.</p>
      <label className="mt-2 block text-muted">Private room code
        <input aria-label="Private room code" autoComplete="off" spellCheck={false} value={code} disabled={joined}
          onChange={e => setCode(e.target.value)} className="mt-1 min-h-11 w-full rounded border border-border bg-bg px-2 text-fg" />
      </label>
      {!joined && <button type="button" className="min-h-11 text-primary" onClick={() => setCode(newRoomCode())}>Create room code</button>}
      {code && <button type="button" className="ml-3 min-h-11 text-primary" onClick={() => {
        void navigator.clipboard.writeText(code).then(() => setStatus("Room code copied · share only with invited pilots"))
          .catch((problem: unknown) => setError(`Could not copy room code: ${problem instanceof Error ? problem.message : String(problem)}`));
      }}>Copy room code</button>}
      <label className="mt-1 flex min-h-11 items-center gap-2 text-muted">
        <input type="checkbox" checked={consent} disabled={joined} onChange={e => setConsent(e.target.checked)} />
        I agree to a direct connection with invited pilots.
      </label>
      {joined
        ? <button type="button" className="min-h-11 text-primary" onClick={leave}>Leave room</button>
        : <button type="button" className="min-h-11 text-primary" onClick={() => void join()}>Join room</button>}
      <p role="status" className="text-muted">{status}</p>
      {peers.map(peer => <p key={peer.id} className="text-muted">Guest {peer.id.slice(0, 4)} · {peer.connectionState} · {peer.rttMs ?? "—"} ms</p>)}
      {error && <p role="alert" className="text-danger">{error}</p>}
    </section>
  );
});
