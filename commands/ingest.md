# /design ingest — inbox → library

Turn dropped screenshots into library entries the agent can read as text.

**The whole point:** pay the vision cost **once**, at collection. Every later build reads cheap
text instead of re-analysing an image. A screenshots-only library would mean a vision call on every
reference on every build.

---

## Process

### 1. Find the work

List `library/inbox/`. Every image file is a candidate. A matching `.url` or `.txt` file beside it
holds the source URL. A matching `snippet.css` holds optional captured CSS.

Nothing there? Tell the user where to drop files and stop.

### 2. Look at each screenshot — once

Read the image properly. You are extracting a design system, not describing a picture.

Pull out:

- **Palette** — actual hex values. Sample them; don't approximate from memory. Note the role of each (surface, ink, accent, muted).
- **Typography** — families if identifiable, the size/leading pairs that matter, weight contrast, letter-spacing character.
- **Layout system** — grid, max width, column behaviour, section rhythm.
- **Spacing & density** — tight/comfortable/airy, and the actual rhythm if inferable.
- **Shape language** — radii, borders, shadows, dividers.
- **Hierarchy technique** — how attention is directed: scale, weight, colour, whitespace, position.
- **Motion cues** — only if visible or strongly implied.
- **What makes it work** — the honest part. One or two sentences on the specific decision that gives this design its quality. This is what a future build actually needs.

### 3. Choose a slug

`<source>-<year>-<surface>` — `stripe-2026-hero`, `linear-2026-settings`, `arc-2026-onboarding`.
Lowercase, hyphens. Must be unique in `library/entries/`.

### 4. Write the entry

One file: `library/entries/<slug>.md`, using `templates/entry.template.md`.
Move the image to `library/entries/<slug>.png`.

The frontmatter is machine-read by the viewer. The body is impeccable-format `DESIGN.md` —
read directly by design commands. **One file, both jobs.**

Tags are **mandatory** — a library without tags becomes an unsearchable dump. Use 3–6 covering:
domain (`saas`, `editorial`, `commerce`), character (`restrained`, `bold`, `playful`, `brutalist`),
and surface (`landing`, `dashboard`, `settings`).

If a `snippet.css` was supplied, fold the meaningful declarations into the body under
`## Captured CSS`. Don't paste it wholesale.

### 5. Clear and rebuild

Remove the processed files from `library/inbox/`. Then:

```bash
node scripts/build-viewer.mjs
```

This regenerates `library/viewer/index.html` with all entry data **inlined**, so it opens with
`file://` — no server, no dependencies.

### 6. Report

List what was added with slugs and tags, and give the user the viewer path to open.

---

## Judgement

- **Be specific.** "Blue accent" is useless. `#635BFF used only for primary action and inline links, never for surfaces` is usable.
- **Be honest about quality.** If a screenshot is low-resolution, cropped, or you can't determine something, say so in the entry rather than inventing it. A confident wrong palette is worse than a noted gap.
- **Describe rules, not pixels.** "64px hero heading" is one data point. "Hero heading at ~4× body size with tight leading; everything else stays close to body scale" is a rule a build can apply.
- **One entry per design**, not per page. Three screenshots of the same site are one entry with multiple images unless the surfaces genuinely differ in system.
