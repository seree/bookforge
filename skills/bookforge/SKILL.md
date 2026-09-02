---
name: bookforge
version: 0.2.0
description: >
  Build a complete casual ebook (research → grounded table of contents → 10
  chapters → single-file Anthropic-styled HTML) with the zero-dependency
  BookForge Node CLI. Use when the user asks for a "book", "ebook", or a
  multi-chapter written guide on a topic, or names BookForge. Triggers:
  "write me a book", "one-shot book", "ebook", "bookforge", "make a book on X",
  "research and write chapters". Requires Node >= 18 and no npm install — the
  CLI is dependency-free. Both research endpoints (Monid TinyFish) are $0/call.
---

# BookForge — agent runbook

You are operating the BookForge harness: a pipeline that turns a topic into a
casual, grounded, illustrated HTML ebook. Run stages in order and stop at
every **user gate**.

## Locating the CLI

If a native **`bookforge` tool** is available (registered by the BookForge DSH
bundle), prefer it: `bookforge(command, book, extra)` shells out to the CLI for
you. Otherwise fall back to bash:

```sh
node <repo>/bin/bookforge.js <stage> --book <slug>
```

or `bookforge <stage> --book <slug>` after `npm link`. Long-running runs: set
`BOOKFORGE_NONINTERACTIVE=1` (or pass explicit args) so prompts never block.
Books live under `<repo-parent>/books/<slug>` (override with `BOOKFORGE_BOOKS_ROOT`).

## Invariants

- **Never invent facts.** Every specific claim, number, or quote must trace to
  `research/notes/`. Missing or mixed evidence → say so in the book.
- **Tone contract:** casual, fun, easy to follow. Textbook-voiced prose gets rewritten.
- **One artifact per gate.** The user approves the TOC before any chapter;
  each chapter lands at `chapters/chapter-NN.md` before the next starts.

## Stages

1. **Topic (user gate).** `bookforge new "Topic"` → confirms title, subtitle,
   chapter count (default 10; 8–12 recommended). Odd outputs → re-confirm with the user.
2. **Research.** `bookforge research --book <slug>` (optionally
   `--brief research-brief.json` to steer queries). Then READ `research/summary.md`
   and skim the notes — you must understand the material before outlining.
3. **Table of contents (user gate).**
   1. `bookforge outline-prompt --book <slug>`
   2. Read the research notes (they are your evidence base).
   3. Write `drafts/toc.json` per the printed instructions.
   4. Show the TOC to the user; loop until they approve.
   5. `bookforge outline --file drafts/toc.json --book <slug>` then
      `bookforge outline --accept --book <slug>`.
4. **Chapters.** For each `n = 1..N`:
   1. `bookforge chapter-prompt <n> --book <slug>` (prints the writing playbook
      + confirmed title/summary/targets).
   2. Write `chapters/chapter-NN.md` per the playbook (hook → big idea → meat
      sections → try it → takeaway; include `> **Fun fact:**` and
      `> **Try it:**` callouts).
   3. Delegate for long books: one subagent per chapter, each receiving the
      full `chapter-prompt <n>` output + research notes, writing the exact path.
      Keep concurrency modest (5 is a proven ceiling).
   4. `bookforge chapters --book <slug>` tracks word counts; aim for
      `target.wordsPerChapter`.
5. **Export & verify.**
   1. `bookforge assemble --book <slug>` → `books/<slug>/<slug>.html`
      (single self-contained file: cover, chapter illustrations, Sources).
   2. Verify the HTML has the cover, TOC anchors, all chapter bodies, callout
      boxes, and the Sources section.
   3. Report the file path and word/chapter stats to the user.

`bookforge status --book <slug>` shows every gate and whether it is done.
