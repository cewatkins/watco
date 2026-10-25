# Agent brief

Paste this to a harness. Fill the brackets. Delete nothing else.

```
You are working in the Field 28 repo. Read these, in order, before you edit:

1. AGENTS.project.md
2. docs/agents/<role>.md
3. docs/03-where-we-are.md
4. The chapter: <path to S- or Q- or P- section, or a quest file>

You are the <grok-cli | opencode | search> role.

Do only chapter <id>. Do not start the next chapter.
Do not edit files outside that chapter's Touches list.
If you believe the Touches list is wrong, stop and say why. Do not expand it.

The flight model is src/sim/fdm.ts. Aileron positive rolls left.
Do not add a second integrator. Do not add accounts. Do not fetch a pack
unless this chapter's harness line says search-then-code.

When the acceptance test passes, write the commit message from
docs/templates/commit.md and stop. Do not push.
If you cannot pass it, leave the tree at the last passing state and
write a Stopped at note. Do not commit a broken model.
```

Role files:

- Grok CLI → `docs/agents/grok-cli.md`
- OpenCode → `docs/agents/opencode.md`
- Search harness → `docs/agents/openclaw.md`

---

# Run log — ab1

## Run 1 · chapter S1 · harness: OpenCode

### Pasted (as it arrived)

```
You are working in the Field 28 repo. Read these, in order, before you edit:

1. AGENTS.project.md
2. docs/agents/opencode.md
3. docs/03-where-we-are.md
4. The chapter: docs/04-spine.md S1

You are the opencode  role.

Do only chapter S1. Do not start the next chapter.
Do not edit files outside that chapter's Touches list.
If you believe the Touches list is wrong, stop and say why. Do not expand it.

The flight model is src/sim/fdm.ts. Aileron positive rolls left.
Do not add a second integrator. Do not add accounts. Do not fetch a pack
unless this chapter's harness line says search-then-code.

When the acceptance test passes, write the commit message from
docs/templates/commit.md and stop. Do not push.
If you cannot pass it, leave the tree at the last passing state and
write a Stopped at note. Do not commit a broken model.
```

("Do only chapter <id>" arrived unfilled; the chapter was named in reading item 4.)

### Note for the course

- S1's own harness line says **Grok CLI**; the run was performed by the
  OpenCode role as the brief named. The commit records `Harness: opencode`.
- Result: commit `3911077` on local main, **consciously not pushed** (lead
  pilot's call: origin stays as-is for everyone who pulls).
- Acceptance evidence: tick test 4/4
  (`node --experimental-strip-types --test src/sim/fdm.tick.test.ts`),
  + headless-browser flight check with clean console.

