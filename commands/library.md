# /design library — browse and pick

Find the right reference without loading images.

---

## Reading the library

Entries are `library/entries/<slug>.md`. **Read the frontmatter first** — slug, tags, palette,
type, density. That is usually enough to shortlist. Only read the body of entries you're actually
considering, and only look at the `.png` if the user asks you to compare visually.

Never load every image. The library is text-first by design.

## Responding to a request

**"What do I have?"** — list slugs grouped by tag, one line each. Point at the viewer for browsing:
`library/viewer/index.html`, opened with `file://`.

**"Something restrained and editorial"** — filter on tags and character, return 2–4 candidates with
a one-line reason each, and say which you'd pick. Don't return everything and make the user choose
blind.

**"Use stripe-2026-hero"** — read that entry's full body and carry it into the design flow. If the
slug doesn't exist, list the near matches rather than guessing.

**Library is empty** — say so, point at `library/inbox/`, and offer to proceed without a reference.
An empty library is not a blocker; it just means greenfield variants diverge on your judgement
instead of on saved references.

## Picking variant seeds

When `commands/variants.md` needs three contrasting entries for greenfield mode, choose for
**genuine contrast** — different character tags, different density, different hierarchy technique.
Three restrained editorial entries will produce three variants that look identical, which defeats
the point. State your picks and the contrast axis.

## Maintenance

If the user asks to prune: surface entries that are near-duplicates of each other, or that have
never been referenced in any project. Recommend, never delete without confirmation.
