# Design Agent Blueprint — Plan v2

Status: **plan only, nothing built**
Date: 2026-08-07
Runtime: Claude Code (terminal). Cowork secondary.

v2 removes ~a third of v1 as overengineering, and replaces the state model after
the "how do I design page 5 consistently" walkthrough.

---

## 1. The mental model

You open a session in your project and say what you want. The agent designs it.
Nothing is installed into your project, nothing is filled in by hand.

```
you: "landing page. reference stripe-2026-hero. feel expensive and quiet."
     → 3 variants → lavish → you pick and annotate → built

    …two days later, same project…

you: "settings page"
     → agent reads the landing page you already shipped
     → 3 variants that MATCH it → lavish → you pick → built
```

The agent is 100% reusable. It carries taste, commands, and your reference library.
It carries nothing about any specific project.

---

## 2. How consistency actually works

This is the core of the design, and it is **read the code first**.

### Primary: derive from the project

Before designing anything in a project that already has UI, the agent reads what's there —
existing components, tokens, tailwind config, shipped pages — and extracts the operating palette,
type scale, spacing rhythm, radii, density, motion. `/impeccable document` does exactly this and
writes `DESIGN.md`. It's **derived and regenerable**, not authored. If it ever disagrees with the
code, the code wins and you regenerate.

This is why you don't maintain a design spec: your shipped UI *is* the spec.

### Supplement: the small thing code can't tell you

Code records what you chose. It cannot record what you **rejected**, or **why**.

Looking at a component you can see `#7C3AED`. You cannot see that teal was tried and felt
clinical, that bounce easing is banned, that "expensive and quiet" was the brief, or that
"too tight" during a lavish session became a standing rule about generous spacing.

So the agent keeps **one small append-only file**, `.design/notes.md`, written by the agent,
never by you:

```markdown
## Intent
expensive, quiet, unhurried

## Rejected
- teal palette — felt clinical (session 1)
- bounce easing — dated (session 1)

## Standing rules
- generous vertical spacing; you called v1 "too tight" (session 2)

## References used
- landing  → stripe-2026-hero
- settings → linear-2026-settings
```

**The rule that keeps it from becoming a second spec: if it is visible in the code, it does not
go in notes.** Notes hold intent, rejections, and verbal decisions from lavish sessions. Nothing else.
It should stay under ~40 lines for the life of a project.

### Result

Session 2 starts with: derived facts from your code + the short list of things you rejected +
whatever new reference you hand it. That's what makes the settings page look like it came from
the same app.

---

## 3. Components

### impeccable — the spine

Defines the contract everything speaks: `DESIGN.md` as the design-context format, 23 commands as
the shared vocabulary, 59 deterministic detector rules as the quality gate. Key commands we lean on:
`document` (derive DESIGN.md from code), `shape`, `audit`, `polish`, `live`.

Rule: **if impeccable has a command for it, we call it. We never reimplement it.**

Install: `npx impeccable install --scope=global`. No submodule, no vendoring, no pinning —
that was reproducibility machinery for a team, and you are one person on one machine.

Library entries compile to impeccable-format `DESIGN.md`. No custom schema anywhere.

### lavish-axi — the review channel

Not a design tool. The human-in-the-loop channel: agent writes HTML, `lavish-axi <file>` opens it
locally, you annotate elements or text, `lavish-axi poll` blocks until you speak. Session identity
is the **file path**, and it **live-reloads on change** — the two facts §5 is built on.

Install: `npm i -g lavish-axi` && `lavish-axi setup hooks`.

### Asset generation — deferred, no abstraction

Placeholder SVGs at correct dimensions, ~20 lines, that's it. No provider interface, no config.

On **higgsfield specifically**: it's video-first, credits don't roll over, top-ups expire in 90 days,
annual billing is the signup default. ~90% of what a design agent needs is stills, which are
commodity. **Verdict: skip it for now.** Revisit only after a real project shows you reaching for
motion repeatedly — at which point you'll know what you need, which is more than either of us knows today.

---

## 4. The library

Curated, in-repo, git-committed. Only designs you genuinely love.

### One entry, one file

```
library/inbox/whatever.png          ← you drop a PNG (+ optional .url). That's your whole job.
        │
        ▼  /design-agent ingest — ONE vision pass, at collection time
library/entries/stripe-2026-hero.md
```

```markdown
---
slug: stripe-2026-hero
tags: [saas, restrained, editorial]
palette: ["#0A2540", "#635BFF", "#F6F9FC"]
type: [Söhne, 64/1.05, 17/1.6]
density: airy
source: https://stripe.com
captured: 2026-08-07
shot: stripe-2026-hero.png
---
[impeccable-format DESIGN.md body: layout system, hierarchy, motion, what makes it work]
```

**One file, YAML frontmatter + body.** v1 had a separate `meta.yaml` and `DESIGN.md` — pure
redundancy. The viewer reads the frontmatter; the agent reads the body.

Why this isn't overengineering: **the expensive vision pass is paid once, at collection.** Every
later build reads cheap text. Screenshots-only would mean a vision call on every reference on
every build.

Optional: drop a `snippet.css` beside the PNG for entries you love; ingest folds it in. Never required.

### The viewer

`/design-agent ingest` regenerates `library/viewer/index.html` with the index **inlined**. You open it
with `file://`. No server, no dependencies, no build step — it will still work in three years.
Grid of shots, filter by tag, click to copy a slug.

---

## 5. Variants + lavish

**3 variants** (`--variants N`, default 3).

### Two modes — this is what prevents the drift you described

| | **Greenfield** (first design in a project) | **In-project** (page 2+) |
|---|---|---|
| Varies | everything | layout, hierarchy, density, composition |
| Locked | nothing | palette, type scale, spacing rhythm, radii, motion — **inherited from shipped code** |
| Seeded by | a different library entry per variant | project style (constraint) + optionally one new reference (flavour) |
| Goal | find a direction | find the best expression **of an existing** direction |

In-project mode is the answer to "purple gradient landing page, blackboard settings page."
Naive variant generation re-diverges on palette every time, which *manufactures* that failure.
Here project style is a **constraint, not a variable** — all 3 variants are already consistent
with your app, and you're choosing between layouts, not between identities.

A new reference screenshot in in-project mode informs **composition and feel**, not palette —
unless you explicitly say it should, in which case you're deliberately re-styling and that's
a greenfield decision.

### The mechanism: one session, one file path, two phases

Lavish keys sessions by canonical file path and live-reloads on change. So the file **starts as a
3-up comparison and becomes the winning design in place.** Browser never closes, session never breaks:

```
PHASE A — DIVERGE (coarse, chat feedback)
  agent writes design/round-1.html   ← 3 variants, ONE key screen, low fidelity, placeholders
  $ lavish-axi design/round-1.html   → browser opens, stays open
  $ lavish-axi poll                  → agent blocks
  you: "2, but 1's typography. kill 3."
        │  agent rewrites THE SAME FILE → full-fidelity single design
        │  lavish live-reloads → same window, same session
        ▼
PHASE B — CONVERGE (precise, element annotation)
  $ lavish-axi poll --agent-reply "..."
  you: [click hero headline] "too tight"     ← also lands in .design/notes.md as a standing rule
  … loop …
        ▼
  build into the project → /impeccable audit → npx impeccable detect → /impeccable polish
```

Not lavish-on-lavish (one session only). Not pick-then-start-lavish (lavish is already open).
Not lavish-then-variants (that polishes before choosing a direction, then discards the polish).

Phase A is where variety is cheap. Phase B is where quality is expensive.

### Known unknown

Lavish already runs the artifact in an iframe. A 3-up gallery nests a second level, and the SDK
may not reach inner documents — element annotation might not work in Phase A. **Untested; first
task of build step 4.** Low risk: Phase A only needs chat-level feedback. Fallback: 3 sibling files
+ thin index.

---

## 6. Structure

One skill, one symlink, no install script. Sub-commands mirror impeccable's pattern.

```
design_agent/
├── SKILL.md                       # /design-agent <command> — router
├── README.md
│
├── commands/
│   ├── ingest.md                  # inbox PNG → entry .md + regenerate viewer
│   ├── variants.md                # detect mode → 3 variants → lavish loop
│   └── brief.md                   # optional: the fill-in form (§7)
│
├── library/
│   ├── inbox/
│   ├── entries/<slug>.md + <slug>.png
│   └── viewer/index.html          # generated, data inlined, open with file://
│
├── templates/
│   ├── BRIEF.template.md
│   ├── notes.template.md
│   └── gitignore.fragment         # impeccable + lavish ignore blocks
│
└── docs/PLAN.md                   # this file
```

Install: `git clone <repo> ~/.claude/skills/design-agent`

Relative paths inside the skill always resolve, so the library travels with it. No install script.

**Revised from v2:** the plan called for a symlink/junction so one working copy could be edited from
anywhere. Two things came out of trying it — Cowork refuses to mount any path under
`~/.claude/skills` (protected location), and whether Claude Code's skill scanner follows reparse
points on Windows is unverified. The real folder goes in the skills directory; iterate elsewhere and
move it when stable.

**Command namespace is `/design-agent`, not `/design`** — Claude Code ships a built-in `/design`
that shadows it. The skill is model-invoked regardless, so natural language is the primary path in.

**Cut from v1:** `vendor/` (submodule pinning), `install.sh`, `blueprint.config.json`,
`design-assets/` (provider abstraction), `design-build/` (stack detection — Claude Code already
reads your repo and matches conventions; reimplementing that is reimplementing the agent),
`serve.mjs`, per-entry `meta.yaml`, the harvest stage, the 7-stage pipeline table.

---

## 7. The brief template — demoted

Still useful as a **checklist so you don't forget to state things** (anti-references and intent are
the ones people skip). But v1 called it a "compiler" producing two documents, which was machinery.

It's a form. Fill the top, ignore the rest:

```markdown
## Core        what · who · brand|product · one-word feeling · references: [slugs]
## Standard    voice · anti-references · density · motion · a11y floor · devices
## Deep        free prose, passed through verbatim
```

Blank sections are **omitted, never defaulted** — an unfilled field must not quietly become a
design decision. Core alone must produce a usable build.

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| `.design/notes.md` grows into a second spec | Hard rule: if it's in the code, it's not in notes. Cap ~40 lines. |
| DESIGN.md drifts from actual code | It's derived, not authored — regenerate with `/impeccable document`. Code always wins. |
| Lavish can't annotate nested iframes | Phase A needs only chat feedback; test first; fallback = sibling files |
| 3 variants look identical in greenfield | Each seeded from a **different** library entry — divergence forced by input |
| 3 variants drift apart in-project | Project style is a locked constraint; only layout varies |
| impeccable + lavish hooks both inject context every session | Both opt-in; measure token cost after project 1 |
| Library becomes an unsearchable dump | Tags mandatory at ingest; you already said curated-only |

---

## 9. Build order

1. **`library/` + `ingest` + viewer** — build first, start collecting immediately. The only piece whose value depends on elapsed time.
2. `SKILL.md` router + symlink + gitignore fragment
3. Notes-file convention + wire `/impeccable document` into the read-the-project step
4. `variants` — **first task: test nested-iframe annotation**, then both modes
5. `BRIEF.template.md`
6. End-to-end run on one real project → revisit higgsfield with evidence instead of speculation

---

## 10. Settled

- Library: in-repo, curated, one `.md` + `.png` per entry
- Variants: 3, two modes (greenfield / in-project)
- State: derived from code, plus ≤40 lines of non-derivable notes
- Assets: placeholders only; higgsfield skipped pending evidence
- Install: one symlink; impeccable + lavish global via npm
- Final artifact: whatever the host project already uses

## Open

**Which project do we shake this down on?** Step 6 is what converts the remaining guesses into decisions.
