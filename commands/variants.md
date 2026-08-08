# /design-agent variants — explore, then converge

Produce N low-fidelity directions, let the user choose in a browser, then deepen the winner —
**all in one Lavish session, on one file path.**

Default N = 3. `--variants N` overrides.

---

## First: which mode?

This is the most important decision in the command. Getting it wrong is how a product ends up with
a purple-gradient landing page and a blackboard settings screen.

### Greenfield — nothing designed yet

Split this by whether the user named a reference.

**No reference named** — identity is genuinely open. Seed **each variant from a different library
entry** so they diverge by construction rather than by hope. Say which you picked and on what axis
they contrast.

**A reference named** (`use stoicism-101-2026-landing`) — the user has already chosen an identity.
Do **not** seed the other variants from unrelated entries; pulling a bright travel palette into a
philosophy course produces two variants nobody will pick. Hold the named reference's identity
across all three and vary **composition** instead: hero treatment, how the supporting content is
arranged, what carries the section rhythm.

The test is whether a rejected variant would still have been an acceptable answer to the brief.
If two of them are obviously wrong on arrival, the divergence axis was chosen badly.

### In-project — the project already has UI

Project style is a **constraint, not a variable.**

| Locked (inherited from shipped code) | Varies |
|---|---|
| palette | layout & composition |
| type scale & families | hierarchy & emphasis |
| spacing rhythm | density |
| radii, borders, shadows | content structure |
| motion character | states & affordances |

All three variants must be recognisably the same product. The user is choosing between **layouts,
never between identities.**

If the user supplies a **new reference screenshot** in this mode, it informs **composition and
feel only — not palette.** A single reference must never silently re-skin an app.

If they clearly want the new reference to override the existing style, that is a **re-style**.
Say so plainly, confirm, and only then treat it as greenfield.

---

## Phase A — Diverge

Write **one** HTML file: `design/round-1.html` (create the directory if needed).

- **One key screen only.** Not the whole app.
- **Low fidelity.** Real layout, real hierarchy, real type and colour — no polish, no micro-interactions.
- **Placeholder assets.** Labelled SVG rectangles at correct dimensions. Never generate real imagery here; it's throwaway.
- Three variants side by side, each labelled `1` `2` `3` with a one-line description of its direction.
- Self-contained: inline CSS, no build step. It must render correctly opened directly in a browser.

> **Layout — settled.** A 3-up gallery in **one file** works. Element annotation reaches into the
> stacked variants; the user can click any element in any variant and annotate it directly.
> Verified on Windows, Lavish 1.x, Claude Code 2.1.
>
> Do not split variants across separate files. If annotation ever does fail, the fallback is
> `design/round-1-{a,b,c}.html` plus a thin index, with Phase A feedback by chat only — but treat
> that as a bug report, not the default.

Then hand it over:

```bash
lavish-axi design/round-1.html     # opens the browser, session keyed to this path
lavish-axi poll                    # BLOCK here until the user speaks
```

Do not proceed, summarise, or ask questions in chat while polling. The browser is the channel.

## Phase B — Converge

The user says something like *"2, but 1's typography, kill 3."*

**Rewrite the same file** — `design/round-1.html` — as the single chosen design at full fidelity.
Do not create a new file. Lavish watches this path and live-reloads: same window, same session,
no interruption.

Then keep the loop going:

```bash
lavish-axi poll --agent-reply "Merged 2's layout with 1's type scale. Dropped 3."
```

Now element annotation matters and works — the document is flat and single. The user clicks a
headline and says "too tight"; you fix it, the browser reloads, you poll again.

**Capture the rules, not just the fixes.** "Too tight" on one heading is a fix. "Too tight" is
usually a *preference* — apply it everywhere it's relevant and record it as a standing rule in
`.design/notes.md`.

Loop until the user stops annotating or explicitly approves.

## Then

Return to `commands/design.md` step 5. Phase B output is still a mockup — the real build comes next.

---

### Don't let the scaffolding eat the design

Lavish adds its own chrome and a layout-issue banner on top of your artifact. Sticky variant
labels and a sticky index bar will collide with it and with the artifact's own header.

Keep Phase A labels **non-sticky**, or inset the variant content enough to clear them. The user
should be judging the design, not the scaffolding.

## Why this shape

- **One session, one file path.** Lavish keys sessions by canonical path and live-reloads on change, so the artifact can transform from comparison to finished design without ever breaking the session.
- **Not lavish-on-lavish.** There is only ever one session.
- **Not pick-first-then-open-lavish.** Lavish is already open; severing it gains nothing.
- **Not lavish-then-variants.** That polishes before choosing a direction, then throws the polish away.
- **Never build 3 finished designs.** That is 3× the cost for 2 discards. Diverge cheap, converge once.
