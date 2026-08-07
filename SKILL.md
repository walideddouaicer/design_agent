---
name: design-agent
description: Design UI that stays visually consistent across a project, using a curated reference library, 3-variant exploration, and browser-based review. Use when the user asks to design, redesign, or restyle any UI surface — a landing page, dashboard, settings screen, component, or full app — especially when they reference a saved design by slug, ask for variants or options to choose from, ask for something matching the existing look, or ask to add a screenshot to the library. Triggers on "design me a…", "make a landing page", "redesign this", "use <slug>", "give me options", "match the existing style", "ingest these screenshots", "/design".
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
| `/design <what>` | Full flow. Read `commands/design.md`. |
| `/design variants <what>` | Variant exploration only. Read `commands/variants.md`. |
| `/design ingest` | Add screenshots from the inbox to the library. Read `commands/ingest.md`. |
| `/design library` | Browse/search the library. Read `commands/library.md`. |
| `/design brief` | Fill the brief form. Read `commands/brief.md`. |

Bare `/design` with a description means the full flow. `/design` alone: list these commands.

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

**Never let an unstated preference become a design decision.** If the brief is silent on something
that matters, either derive it from the project or ask. Do not default silently.

**Never re-skin an existing project by accident.** In a project that already has UI, palette, type
scale, spacing rhythm, radii and motion are inherited constants. Changing them is a re-style, and a
re-style requires the user to say so explicitly.

## Paths

All paths are relative to this skill directory.

- `library/inbox/` — user drops PNGs here
- `library/entries/<slug>.md` + `<slug>.png` — one file per reference
- `library/viewer/index.html` — generated gallery, opened with `file://`
- `scripts/build-viewer.mjs` — regenerates the viewer, deterministically
- `templates/` — brief, notes, entry, gitignore fragment

Project state lives in the **user's project**, not here:

- `DESIGN.md` — derived by impeccable from their code, regenerable
- `.design/notes.md` — intent, rejections, standing rules. Agent-written. See `commands/design.md`.
