---
name: design-agent
description: Design UI that stays visually consistent across a project, using a curated reference library, 3-variant exploration, and browser-based review. Use when the user asks to design, redesign, or restyle any UI surface — a landing page, dashboard, settings screen, component, or full app — especially when they reference a saved design by slug, ask for variants or options to choose from, ask for something matching the existing look, or ask to add a screenshot to the library. Triggers on "design me a…", "make a landing page", "redesign this", "use <slug>", "give me options", "match the existing style", "ingest these screenshots", "/design-agent".
---

# Design Agent

Design surfaces that look like they belong to the same product.

Three ideas carry this skill:

1. **The shipped code is the design spec.** Never ask the user to describe a style that already exists in their repo — read it.
2. **Divergence is cheap, quality is expensive.** Explore with 3 throwaway low-fidelity variants; build once, properly.
3. **The user has the final say, in a browser.** Review happens in Lavish, not in chat.

## Commands

| Command | Do this |
|---|---|
| `/design-agent <what>` | Full flow. Read `commands/design.md`. |
| `/design-agent variants <what>` | Variant exploration only. Read `commands/variants.md`. |
| `/design-agent ingest` | Add screenshots from the inbox to the library. Read `commands/ingest.md`. |
| `/design-agent library` | Browse/search the library. Read `commands/library.md`. |
| `/design-agent brief` | Fill the brief form. Read `commands/brief.md`. |

Bare `/design-agent` with a description means the full flow. `/design-agent` alone: list these commands.

These are conventions, not registered slash commands. This skill is model-invoked — it activates
from natural language ("design me a landing page", "ingest these screenshots") as readily as from
the explicit form. Do not tell the user a command "doesn't exist" because it isn't in a menu.

`/design` is deliberately **not** used: Claude Code ships a built-in command by that name.

## Hard rules

**Never reimplement impeccable.** It is installed and it owns design vocabulary, quality gates, and
`DESIGN.md`. If a job matches one of its commands, call it:

- `/impeccable document` — derive `DESIGN.md` from existing project code
- `/impeccable shape` — plan UX before code
- `/impeccable audit` — a11y, performance, responsive
- `/impeccable polish` — final pass
- `/impeccable live` — element-level browser iteration
- `npx impeccable detect --json <path>` — deterministic anti-pattern scan, no LLM, no API key

**Never invent a design schema.** Library entries and project design context are both
impeccable-format `DESIGN.md`. One format everywhere.

**Never fake a gate.** impeccable and lavish-axi are external tools and may not be installed.
Check before depending on either:

```bash
npx impeccable --version
lavish-axi --version
```

If one is missing: say so in one line, print the install command, and use the documented fallback
for that step. **Never skip silently. Never describe work as gated, audited, or reviewed when the
tool that would have done it did not run.** An ungated build honestly labelled is useful. An
ungated build reported as gated is worse than no skill at all.

**Never let an unstated preference become a design decision.** If the brief is silent on something
that matters, either derive it from the project or ask. Do not default silently.

**Never re-skin an existing project by accident.** In a project that already has UI, palette, type
scale, spacing rhythm, radii and motion are inherited constants. Changing them is a re-style, and a
re-style requires the user to say so explicitly.

## Paths

All paths are relative to this skill directory.

- `library/inbox/` — user drops screenshots here
- `library/entries/<slug>.md` + the image beside it — one entry per reference.
  The image keeps its original extension; the entry's `shot:` field holds the full
  filename. The viewer only guesses `.png` when `shot:` is missing, so always set it.
- `library/viewer/index.html` — generated gallery, opened with `file://`
- `scripts/build-viewer.mjs` — regenerates the viewer, deterministically
- `templates/` — brief, notes, entry, gitignore fragment

Project state lives in the **user's project**, not here:

- `DESIGN.md` — derived by impeccable from their code, regenerable
- `.design/notes.md` — intent, rejections, standing rules. Agent-written. See `commands/design.md`.
