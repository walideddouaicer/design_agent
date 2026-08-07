# design-agent

A reusable Claude Code skill for designing UI that stays visually consistent across a project.

Carries taste, commands, and a curated reference library. Installs into **nothing** —
your projects stay clean.

```
you: "landing page. use stripe-2026-hero. expensive and quiet."
     → 3 variants → browser → you pick and annotate → built

    …two days later, same project…

you: "settings page"
     → reads the landing page you shipped → 3 variants that MATCH it → built
```

---

## How it stays consistent

**Your shipped code is the design spec.** Before designing anything, the agent reads what's already
in the repo — components, tokens, config — and derives the operating palette, type scale, spacing
rhythm and motion. There is no design document to maintain, because your UI already is one.

The only thing persisted is `.design/notes.md` in your project: intent, **rejected directions**, and
standing rules that came out of review sessions. Code records what you chose; it can never record
what you turned down or why. That file holds nothing else, and stays under ~40 lines.

## Install

**Prerequisites** — both global, both one-time:

```bash
npx impeccable install --scope=global   # design vocabulary + 59-rule detector
npm install -g lavish-axi               # browser review channel
lavish-axi setup hooks                  # optional: agent reaches for it unprompted
```

**This skill** — the folder must live in your skills directory:

```bash
# macOS / Linux
git clone https://github.com/walideddouaicer/design_agent.git ~/.claude/skills/design-agent

# Windows (PowerShell)
git clone https://github.com/walideddouaicer/design_agent.git "$env:USERPROFILE\.claude\skills\design-agent"
```

Restart Claude Code afterwards.

The library lives inside the skill, so relative paths always resolve and references travel with it.

> **On linking instead of copying.** A symlink or junction pointing into `~/.claude/skills/` is
> tempting — one working copy, editable from anywhere. Whether Claude Code's skill scanner follows
> reparse points on Windows is **unverified**. If you try it and the skill doesn't activate, that's
> the likely cause; put the real folder there instead.

**Invoking it.** This skill is model-invoked, not a registered slash command. Natural language works:
*"design me a landing page with 3 variants"*, *"ingest the screenshots in my inbox"*. The
`/design-agent <command>` forms below are a shorthand convention, not menu entries — don't expect
them to autocomplete.

> `/design` is deliberately avoided: Claude Code ships a built-in command by that name.

**Per project, once:** append `templates/gitignore.fragment` to that project's `.gitignore`.

## Commands

| Command | What it does |
|---|---|
| `/design-agent <what>` | Full flow — read project, shape, 3 variants, review, build, audit |
| `/design-agent variants <what>` | Variant exploration only |
| `/design-agent ingest` | Turn inbox screenshots into library entries |
| `/design-agent library` | Browse and pick references |
| `/design-agent brief` | The brief form |

## Building the library

Drop a PNG into `library/inbox/` — optionally a `.url` file beside it. That is your entire job.

`/design-agent ingest` does one vision pass at collection time and writes
`library/entries/<slug>.md`: YAML frontmatter (tags, palette, type, density) plus an
impeccable-format body. Later builds read cheap text; they never re-analyse the image.

```bash
node scripts/build-viewer.mjs   # regenerates library/viewer/index.html
```

Open that file with `file://`. Data is inlined — no server, no dependencies, no build step.
Click any card to copy its slug.

Keep it curated. This is a library of designs you genuinely love, not a scrape.

## The variant loop

Three low-fidelity variants of one key screen, in a single HTML file. Lavish opens it in your
browser and blocks until you respond. You say *"2, but 1's typography, kill 3"* — the agent
**rewrites the same file** as the winner at full fidelity, Lavish live-reloads, and you keep
annotating in the same window. One session throughout.

**Two modes, and the difference matters:**

- **Greenfield** — each variant seeded from a different library entry. Everything varies.
- **In-project** — palette, type, spacing, radii and motion are locked constants inherited from your shipped code. Only layout, hierarchy and density vary.

In-project mode is what prevents a purple-gradient landing page next to a blackboard settings
screen. You are choosing between layouts, never between identities. A new reference screenshot
informs composition and feel — never palette — unless you explicitly ask for a re-style.

## Layout

```
SKILL.md            router
commands/           design · variants · ingest · library · brief
library/
  inbox/            you drop PNGs here
  entries/          <slug>.md + <slug>.png
  viewer/           generated gallery, file://
scripts/            build-viewer.mjs
templates/          brief · notes · entry · gitignore fragment
docs/PLAN.md        the reasoning, including what was cut and why
```

## Design rules this follows

- Never reimplement impeccable — if it has a command, call it
- Never invent a design schema — everything is impeccable-format `DESIGN.md`
- Never let an unstated preference silently become a design decision
- Never build three finished designs — diverge cheap, converge once
