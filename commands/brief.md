# /design-agent brief — the form

A checklist so nothing important goes unstated. Not a gate, not a compiler.

Copy `templates/BRIEF.template.md` into the project as `BRIEF.md`, or just walk the user through
Core in chat — both are fine.

---

## The rule that matters

**Blank sections are omitted, never defaulted.**

An unfilled field must not quietly become a design decision. If the brief says nothing about motion,
the answer is "derive it from the project, or ask" — not "assume subtle fades." Silent defaults are
how an agent produces something the user never asked for and can't point at the moment it went wrong.

**Core alone must produce a usable build.** If it can't, the template is wrong, not the user.

## Tiers

**Core** — always. Five things:
what this surface is · who it's for · brand or product · one word for how it should feel ·
references (library slugs)

**Standard** — optional, and mostly worth prompting for two of them: *anti-references* and *voice*.
Those are the ones people skip and then regret. The rest — density, motion, a11y floor, devices —
are usually better derived than declared.

**Deep** — free prose, passed through verbatim. This is the extension point: adding detail should
never require changing the schema.

## In an existing project

Don't run the form. Most of it is already answered by the shipped code and `.design/notes.md`.
Re-interviewing a user about a style they already established is the fastest way to make a tool
feel bureaucratic.

Ask only what is specific to **this surface** — what it is, what it must do, anything unusual.
