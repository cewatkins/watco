# Agent brief — S2, chapter 2 of the spine

Fill/copy-paste from this block when ready. The harness line in the chapter
itself says **OpenCode. This one crosses files.** — this matches the OpenCode
role file (`docs/agents/opencode.md`), so the role next time is opencode again.

```
You are working in the Field 28 repo. Read these, in order, before you edit:

1. AGENTS.project.md
2. docs/agents/opencode.md
3. docs/03-where-we-are.md
4. The chapter: docs/04-spine.md S2

You are the opencode role.

Do only chapter S2. Do not start the next chapter.
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

# Run log — ab2

## Run 2 · chapter S2 · harness: OpenCode

- Status: not pasted yet.

### Note for the course

- S2's acceptance says "*S1's test still passes*" — so wherever S2 runs, the
  S1 commit (`3911077`) must be in that tree first. On the sandbox local main
  it already is. On any other clone (e.g. ~/src/watco on the user's machine)
  it is not, until one push to origin happens — that push is the lead
  pilot's call, not the harness's.
