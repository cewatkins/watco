# 04 — The spine

Eight chapters after the one you can already fly. Do them in order. A side quest may open after the chapter it hangs from, and must merge before the next spine chapter touches the same files.

Each chapter lists the harness, the files it may touch, what it gives up, and the test that ends it. Copy [templates/chapter.md](templates/chapter.md) into the commit body when you close one.

Status: **S0–S2 done on local main — not pushed to origin.** Next: **S3.**

---

## S0 — The published trainer

**Status:** done. The site flies. This book is the S0 paperwork.

**Given up:** a certified airplane, real scenery, and any claim that the orbit is a traffic pattern. Also given up: waiting for the perfect model before anyone could fly.

**Do not redo.**

---

## S1 — Name the numbers, lock the tick

**Harness:** Grok CLI.

**Touches:** `src/sim/fdm.ts` (names and comments only, unless a number was wrong), a new headless test under `src/sim/`, the placard string in `src/components/flight-sim.tsx` if the elevation stamp changes.

**Work:**

- Put the aero numbers in one table at the top of the model: mass, wing area, lift slope, zero-lift coefficient, stall angle, flap increments, parasite drag, induced factor, max thrust, thrust lapse. Each row gets a source of one line: "172-class public handbook figure, rounded" or "tuning choice, named". No pasted handbook pages.
- Make the placard elevation and `FIELD_ELEV_M` the same physical height. Prefer 2,871 ft, because that is the number a Boise pilot already knows, and convert it once.
- Add a headless tick test that does not open a browser:
  1. Full throttle from the threshold. Airborne before the far end of the 2400 m strip. Climbing through 400 ft AGL without a phugoid that reverses the vertical speed.
  2. Airborne, wings level, stick to the left (aileron +1) for half a second: roll increases, and the sign is left wing down.
  3. Hands off after a bank: roll moves back toward level.
  4. Wind from the left on the takeoff roll: the ground track drifts. This asserts wind is in the model, which S6 will depend on.

**Given up:** a prettier panel, a real pattern, and any new force. If the test fails, you tune a named number. You do not add a second integrator.

**Acceptance:** the headless test passes. The page still starts, and the placard matches the model. Commit `S1: name the aero numbers and lock the tick test`.

---

## S2 — The contract is the type, not the comment

**Status:** done. `docs/contracts/step.md` records state ownership, axes,
units, fixed-step timing, and the rendering boundary.

**Harness:** OpenCode. This one crosses files.

**Touches:** `src/sim/fdm.ts`, `src/sim/scene.ts`, `src/components/flight-sim.tsx`. A short `docs/contracts/step.md` written from the code, not ahead of it.

**Work:**

- Confirm there is one function that changes `x, y, z, yaw, pitch, roll` of a ship. Callers are the player loop and `patternPilot` via `step`. The scene only reads.
- `docs/contracts/step.md` states the axes, the units (meters, seconds, radians in the state; knots and feet only on the instrument fields), and the rule "dt is FIXED_DT".
- Delete any force-shaped math that has leaked into the scene or the component. If there is none, say so in the contract. That sentence is a lock, not a disappointment.

**Given up:** the freedom to "just add a little lift in the camera code" when a picture looks wrong. Picture bugs get fixed in the picture. Energy bugs get fixed in `step`.

**Acceptance:** a search for velocity assignments outside `fdm.ts` is empty, the new contract doc matches the code, S1's test still passes. Commit `S2: one step() owns the state`.

---

## S3 — The briefing tells the truth

**Harness:** Grok CLI.

**Touches:** `src/components/flight-sim.tsx` and, only if a number on the card is computed, a pure helper in `fdm.ts`.

**Work:**

- The card a pilot sees before start must match the model: elevation, wind, runway, rotate behavior, what the flaps are for, who N344TG is (an orbit, until S4).
- Add nothing that the model does not do. No VOR, no mixture, no carb heat, until a chapter builds them.

**Given up:** a romantic checklist copied from a real 172. Those items would be lies. A short true card beats a long false one.

**Acceptance:** every number on the card is either a constant from `fdm.ts` or a sentence the tick test already believes. Commit `S3: briefing matches the model`.

---

## S4 — A pattern, not an orbit

**Harness:** Grok CLI.

**Touches:** `patternPilot` and `createTraffic` in `src/sim/fdm.ts`. The scene may gain a few pattern-altitude markers if you can draw them from the same numbers. No new physics.

**Work:**

- Replace the circle with a left pattern: upwind, crosswind, downwind, base, final, at about 1,000 ft AGL, about half a mile to a mile from the strip.
- Still return a `PilotInput`. Still call `step`. The autopilot is not allowed to set `ship.x` directly.
- Keep it stable. The Phase 0 orbit was tuned because a naive pilot diverges. Expect to tune gains. Do it in the pilot, not by damping the airplane until it cannot be flown by a human.

**Given up:** the orbit's simplicity. A circle is one error term. A rectangle is four legs and a reason to exist. Also given up: right traffic, and any wind correction fancier than "aim a little into the wind". S6 will make that look incomplete, on purpose.

**Acceptance:** over a simulated three minutes the traffic ship completes a circuit, stays within a stated box of the field, and does not lose 500 ft. S1's human-airplane tests still pass (the pilot change must not retune the airplane). Commit `S4: rectangular pattern through the same step()`.

---

## S5 — You fly the circuit

**Harness:** OpenCode.

**Touches:** `src/components/flight-sim.tsx`, a small pure scorer next to the model. Not the renderer, except a marker you already have numbers for.

**Work:**

- After start, a task card: takeoff, crosswind, downwind, base, final, full stop on the strip.
- The card advances from **state the model already has** (position, height, heading, on-ground). It does not keep a private flight model.
- Score lives in memory, then in `localStorage` only if S7 has landed. If S7 has not, memory is enough. Do not add accounts to save a score.

**Given up:** a multiplayer scoreboard, a certificate, and any grading of style. You either flew the geometry or you did not. Pretty flying is a human judgment and this chapter does not fake it.

**Acceptance:** a scripted input tape (or the browser probe) can finish the card, and a tape that flies away cannot. Commit `S5: the circuit is a task, scored from Ship`.

---

## S6 — Weather is an argument

**Harness:** Grok CLI. This is the gate. Public World does not start before this commit is on main.

**Touches:** `src/sim/fdm.ts`, the call site in the component, the S1 tests.

**Work:**

- `step(ship, input, dt, weather)` where `weather` carries wind vector, a density-altitude offset or a field elevation, and a simple gust amplitude. Defaults reproduce today's 280/08 and today's density, so old call sites keep meaning.
- The windsock reads that same object. Not a second wind.
- Tests: a direct crosswind changes the takeoff track; zero wind does not; a gust of zero matches the S1 climb.

**Given up:** a full atmosphere (fronts, clouds that hold rain, turbulence spectra). You get one honest pipe. A METAR can fill that pipe later. A METAR cannot invent a second pipe.

**Acceptance:** S1 and S4 still pass. A one-line weather change moves the airplane and the sock together. Commit `S6: weather is an argument to step()`.

**Stop here** if you are tempted to fetch a live METAR in the same commit. That is P3. The pipe has to exist before the water.

---

## S7 — A log on this machine

**Harness:** Grok CLI.

**Touches:** a small module under `src/sim/` or `src/lib/log.ts`, and the component. No database, no auth route.

**Work:**

- When a flight ends (full stop after airborne, or a crash), append a record: start time, airborne seconds, landing kind (`full stop`, `crash`, `reset`), max altitude.
- Persist in `localStorage`. Show the last few on the briefing card.
- Offer a way to forget the log. Forgetting is local and obvious.

**Given up:** the same log on your phone and your laptop. Sync needs an account, and an account is a different product. Also given up: storing position traces. A trace is a replay, which is S8's cheaper path, and it does not belong in a log of five numbers.

**Acceptance:** refresh the page, the last flight is still there. A private window starts empty. No network call was added. Commit `S7: local flight log`.

---

## S8 — Another human, no referee

**Harness:** OpenCode.

**Touches:** the component, and either a replay buffer or the existing P2P client. A signaling route only if you picked live presence, and only as a mailbox.

**Pick one. Write the pick in the commit. The other stays a paragraph.**

1. **Ghost** — record your `PilotInput` tape and play it back as a second ship through `step`. No server. A friend mails you a tape, or you race yourself.
2. **Live presence** — two browsers exchange inputs over the WebRTC client that already exists. You must add the mailbox it expects (`/api/rtc`), or the client does nothing. Each browser steps **its own** airplane. You see their state. You do not step their physics for them.

**Given up, either way:**

- A referee. If their client says they landed and the picture says they sank into the sagebrush, the sagebrush does not get a vote that both of you share.
- Anti-cheat. This is a trainer. A race would need the room server we are not building.
- Shared weather, unless both clients happen to load the same `weather` object. Live METAR later can still disagree by a minute. That is acceptable. Paper over it and you have started a server.

Also given up if you pick the ghost: a friend in the pattern **now**. Also given up if you pick live presence: the published page working with zero backend. Say which loss you took.

**Acceptance:** with the network blocked, solo flight still works, including N344TG. With the feature on, a second ship that is not the autopilot is visible and is the result of `step` on inputs, not a hand-placed model. S1 still passes. Commit `S8: a second human ship without a referee`.

---

## After the spine

You have a trainer that tells the truth, flies a pattern, scores a circuit, takes weather as data, remembers a flight, and can show another person. The field is still fictional. The airplane is still one function.

That is the moment Public World is allowed. Not before.
