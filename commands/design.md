# /design — full flow

The default command. Takes the user from "design me X" to shipped UI.

---

## Step 1 — Read the project before anything else

Never ask the user to describe what you can read.

**Is there existing UI?** Look for components, pages, styles, `tailwind.config.*`, tokens,
`package.json`. Check whether `DESIGN.md` already exists at the project root.

| Finding | Do |
|---|---|
| Has UI, no `DESIGN.md` | Run `/impeccable document` to derive it |
| Has UI, has `DESIGN.md` | Read it, then **spot-check 2–3 real components**. If they disagree, the code wins — regenerate |
| No UI at all | **Greenfield.** Skip to step 2 |

Also read `.design/notes.md` if present. It holds what the code cannot express: intent, rejected
directions, standing rules from past sessions.

Record the mode you're in — **greenfield** or **in-project** — it changes step 4 completely.

## Step 2 — Establish the brief

You need, at minimum: what this surface is, who it's for, brand or product, and one word for
how it should feel.

- If the user gave these, proceed.
- If they named library slugs (`use stripe-2026-hero`), read those entries now.
- If something essential is missing and you cannot derive it, **ask** — one question, batched.
- If they want the full form, read `commands/brief.md`.

In **in-project** mode, most of this is already answered by the code and notes. Do not re-interview
the user about a style they already established. Ask only about this specific surface.

## Step 3 — Shape

Run `/impeccable shape` for anything non-trivial. Plan hierarchy, content, and states before
writing markup. Skip only for a single small component.

## Step 4 — Variants

Read `commands/variants.md` and follow it. Pass the mode from step 1 — it determines what varies
and what is locked.

This step ends when the user has chosen a direction and stopped annotating.

## Step 5 — Build for real

Now, and only now, write production code.

**Match the host project.** Read 2–3 existing components first and follow their conventions —
naming, file layout, styling approach, prop patterns. Do not introduce a new way of doing things
in a codebase that already has one. If there is no host stack, use standalone HTML with Tailwind
v4 via CDN (`lavish-axi design` prints a known-good snippet).

Replace placeholder assets with real ones, or leave clearly-labelled placeholders and tell the user
which ones remain.

## Step 6 — Gate

Run all three. Do not report the work as finished until they pass:

```
npx impeccable detect --json <path>     # deterministic, no LLM
/impeccable audit <surface>             # a11y, responsive, performance
/impeccable polish <surface>            # final pass
```

Fix what they find. If you disagree with a finding, say why rather than silently ignoring it.

## Step 7 — Write down only what the code cannot say

Append to `.design/notes.md` in the user's project (create from `templates/notes.template.md` if
absent).

**The rule: if it is visible in the code, it does not go in notes.**

Write down:

- **Intent** — the feeling words, first time they're stated
- **Rejected** — directions tried and turned down, with the reason. This is the highest-value content in the file; rejections leave zero trace in code.
- **Standing rules** — preferences that emerged from review. "Too tight" in a Lavish session becomes "generous vertical spacing".
- **References used** — which library slug drove which surface

Do not write: palette hexes, font names, spacing values, component structure. All of that is in the
code and will go stale here.

Keep the file under ~40 lines for the life of the project. If it is growing past that, you are
recording things the code already says. Prune.
