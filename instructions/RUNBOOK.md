# BookForge RUNBOOK — for agents operating BookForge

You are running the BookForge harness. Execute the stages in order, and stop at every
**user gate** to get explicit confirmation — this is a collaborative pipeline, not a fire
and forget.

## Invariants

- **Never invent facts.** Every specific claim, number, or quote in the book must trace back
  to `research/notes/`. General, widely-known claims may be framed as such. If evidence is
  missing or mixed, say so.
- **Tone contract.** The book is casual, fun, easy to follow. If a draft sounds like a
  textbook, rewrite it.
- **One artifact per gate.** The user approves the TOC before a single chapter is written, and
  each chapter lands in `chapters/chapter-NN.md` before the next is started.

## Stage 1 — Topic (user gate)

Run `bookforge new` and let it ask the topic interactively (or pass a topic on the CLI).
Confirm the resulting title/subtitle/target chapter count with the user when they look odd.

## Stage 2 — Research

Run `bookforge research --book <slug>`. Optionally craft a `research-brief.json`
(`{ topic, purpose, queries: [{ query, purpose }] }`) to sharpen ranking.
When done, read `research/summary.md`, and skim the fetched notes. You must understand the
material before drafting the outline.

## Stage 3 — Table of contents (user gate)

1. `bookforge outline-prompt --book <slug>` — get the outline instructions.
2. Read the research notes (they are your evidence base).
3. Write `drafts/toc.json` per the instructions.
4. **Show the TOC to the user and ask: approve / adjust.** Loop until they say yes.
5. `bookforge outline --file drafts/toc.json --book <slug>` then `bookforge outline --accept --book <slug>`.

## Stage 4 — Chapters, one by one

For each confirmed chapter `n = 1..N`:

1. `bookforge chapter-prompt <n> --book <slug>` — prints the writing playbook + this chapter's
   confirmed title/summary/targets.
2. Write `chapters/chapter-NN.md` following the playbook (structure: hook → big idea → meat →
   try it → takeaway; sprinkle `> **Fun fact:**` / `> **Try it:**` callout boxes).
3. For a long book, delegate chapters to subagents: one agent per chapter gets the full
   playbook (`bookforge chapter-prompt <n>`) plus the research notes and is told to write the
   chapter to the exact `chapters/chapter-NN.md` path.

Run `bookforge chapters --book <slug>` to check word counts as you go. Aim for
`target.wordsPerChapter`; substance over padding.

## Stage 5 — Export & verify

1. `bookforge assemble --book <slug>` — produces `books/<slug>/<slug>.html`.
2. Verify: open the HTML (or `head`/grep it) and confirm cover, TOC anchors (`#ch-01`...),
   chapter bodies, callout boxes, and the Sources section are present.
3. Report the path and word/chapter stats to the user; flag how much TinyFish research cost
   (both endpoints used here are `$0`).

## Status

`bookforge status --book <slug>` shows each gate and whether it is done.
