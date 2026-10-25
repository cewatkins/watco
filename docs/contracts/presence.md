# S8 — live presence, mailbox only

Chosen path: **live WebRTC presence**. Ghost replay remains a possible later
quest, not a second implementation in this chapter.

## Pilot workflow

Start a flight, expand **Radio & local map**, create a room code, consent to
the direct connection, and join. Share that code privately; the second pilot
enters it, consents, and joins. Leave returns to solo. Both pilots keep N344TG.
No room is joined, STUN queried, or signaling requested in default solo mode.

## Ownership and limits

Each browser calls `step()` for its own aircraft and N344TG. Ten times a second
it sends its last controls plus current model state over an unreliable WebRTC
channel. Receiving clients validate the packet, discard older sequence numbers,
and render the remote state. They **do not step remote physics**. No referee,
anti-cheat, cross-client scoring, shared weather, or collision arbitration.

Rooms are intended for invited friends, up to eight peers. ICE reveals network
addresses to the participants. No TURN relay is included; strict NAT/firewalls
may prevent connecting. Connection state and signaling errors are visible.
Stale remote ships disappear after five seconds without an update; departing
peers are removed when the roster changes.

## Backend/deployment

`/api/rtc` is only a roster/SDP/ICE mailbox. No aircraft state, inputs, flight
logs, scores, or account information goes through it. PostgreSQL stores the
mailbox so separate serverless instances share rendezvous state. The migration
is `migrations/0002_rtc_mailbox.sql`; `.grok/app-env.json` opts into database
provisioning. Auth remains **off**; no auth helpers or owned application data.

The random 128-bit invitation code stays in participating browsers. The public
room identifier is its SHA-256 digest; the database hashes that identifier
again. AES-GCM encrypts handshake payloads with the invitation code before
uploading them. Storage contains ciphertext, random peer IDs, and generic
pilot names, not cleartext SDP/IP addresses or invitation secrets. Anybody with
the invite can participate; this is not an authenticated identity guarantee.

Roster rows expire logically after 30 seconds; signals after 60 seconds.
Subsequent mailbox polls physically prune expired rows. Leaving removes that
peer's signals. An idle database may retain expired ciphertext until the next
poll. The route rejects malformed/oversized payloads and excessive signals.

Local preview uses the existing process-local PGLite fallback. A deployed
Vercel app without a real database returns an explicit 503 instead of claiming
live presence works on isolated temporary stores. Solo flight still works.
The Nitro build traces the whole PGLite package so its WASM/data assets stay
beside the externalized module; otherwise the built local preview can exit
during database bootstrap even while dev works.

## Verification

Two independent Chromium contexts connected through the real mailbox and
WebRTC channel. The receiving browser saw a non-autopilot aircraft climb and
bank from the sending browser's controls; departure removed it. Blocking
network after hydration did not prevent solo throttle/movement. Packet guards,
wrong-room encryption rejection, S1/S4/S5 and weather regressions pass.
`npm run test:flight-browser -- http://127.0.0.1:8081/ --live` repeats this on
the built output, including typed room-code entry without flight shortcuts.
Malformed query/JSON/message requests return 400; oversized requests return
413 on both the dev and built mailbox routes.
