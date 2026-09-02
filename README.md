# BookForge

A **harness** that turns any topic into a **casual, fun, easy-to-follow ebook** exported as a
single, self-contained HTML file styled like the Anthropic website.

```
 topic ──▶ [ask user] ──▶ [TinyFish research] ──▶ [TOC, user confirms]
        ──▶ [chapters, written one by one] ──▶ [Anthropic-styled HTML]
```

BookForge is built for agents *and* humans. The heavy lifting (research) uses **Monid's
TinyFish** — live web search + clean-Markdown page fetches, both **free** endpoints. The
"smarts" (drafting a TOC, writing chapters in a casual voice) live in agent playbooks under
[`instructions/`](instructions/), so any agent — or a patient human — can run the pipeline.

BookForge makes **real books, not articles**: the default target is **10 chapters**
(8–12 recommended), every chapter gets procedural **line-art spot illustrations**
(generative SVG — no stock photos, no licensing), and the export opens with a
hand-drawn **book cover**.

## Quick start

```bash
# 0. one-time: make the CLI available (it has zero dependencies)
npm link            # or: node bin/bookforge.js ...

# 1. Ask for a topic (prompts interactively; 8-12 chapters = a real book)
bookforge new "Espresso for beginners"

# 2. Research the topic with TinyFish
bookforge research --book espresso-for-beginners

# 3. Draft a TOC (agent step — see below), then show the user and confirm:
bookforge outline-prompt --book espresso-for-beginners
#   ... agent writes drafts/toc.json ... then:
bookforge outline --file drafts/toc.json --book espresso-for-beginners
bookforge outline --accept --book espresso-for-beginners   # user approved

# 4. Write chapters one by one (agent step — see below)
bookforge chapter-prompt 1 --book espresso-for-beginners
#   ... agent writes chapters/chapter-01.md, chapter-02.md, ...

# 5. Export the book as Anthropic-styled HTML (cover + chapter illustrations)
bookforge assemble --book espresso-for-beginners
# → books/espresso-for-beginners/espresso-for-beginners.html
```

## Pipeline stages

| Stage | Command | Who does it | Output |
|---|---|---|---|
| Ask topic | `new` | CLI (interactive) | project scaffold + `bookforge.json` |
| Research | `research` | CLI + TinyFish | `research/summary.md`, `research/notes/*.md`, `research/sources.md` |
| TOC | `outline-prompt` → `outline --file` → `outline --accept` | agent drafts, **user confirms** | manifest outline |
| Write | `chapter-prompt <n>` | agent writes `chapters/chapter-NN.md` | chapters |
| Export | `assemble` | CLI | single-file HTML + `design.css` |

Agent playbooks:
- [`instructions/OUTLINE.md`](instructions/OUTLINE.md) — how to draft the TOC from research.
- [`instructions/CHAPTER.md`](instructions/CHAPTER.md) — the casual/fun chapter-writing playbook
  (includes the honesty rule: facts grounded in research notes; never invent quotes/stats).

Run `bookforge status --book <slug>` any time to see where the pipeline stands.

## Where books live

Book projects are created under `books/<slug>/` (next to this package, or point
`BOOKFORGE_BOOKS_ROOT` elsewhere). Each project keeps its research, the confirmed outline,
chapter sources, and the final HTML — so a book can be regenerated or extended later.

## Design system

`lib/design.js` exports the Anthropic-inspired system: warm cream paper, near-black warm ink,
terracotta accent (`#D97757`), serif display headlines, clean sans body, hairline rules, pill
badges, and "Try it / Fun fact / Rule of thumb" callout cards.

**Cover & illustrations (BookForge v2):**
- The export opens with a **book-cover panel**: framed, with generated line-art (for the
  urban-gardening demo: a little city that grows — apartment blocks, balcony plants, a sun),
  kicker, large serif title, italic subtitle, author/date/genre, and pill badges.
- Every chapter gets a **spot illustration** drawn in-palette by `lib/illustrations.js`
  (10 curated scenes per theme, plus a neutral fallback for unnumbered chapters).
- Illustrations come from **themes** — pick one per book with
  `"options": { "illustrationTheme": "agent" }` in `bookforge.json`.
  Available themes: `garden` (default), `ollama`, `copywriting`, `people`, `cache`,
  `spark`, `studio`, `vllm`, `agent`, `video`, `harness`, `omp`.
- To disable illustrations/cover for a book, set `"options": { "illustrations": false, "cover": false }`
  in `bookforge.json`.

`assemble` bakes the whole system into a single self-contained HTML file (print-ready,
responsive) and also writes `design.css`.

## Research notes

- TinyFish endpoints used: `tinyfish /search` (live web, ranked results) and `tinyfish /fetch`
  (1–10 URLs → clean Markdown). Both `$0/call` (Monid).
- To steer research, pass a custom brief: `bookforge research --brief research-brief.json` where
  the file looks like `{ "topic": "...", "purpose": "...", "queries": [{ "query": "...", "purpose": "..." }] }`.
- Honesty rule: chapters never invent facts; every specific claim traces back to
  `research/notes/`, and the final book prints its Sources section.

## Examples

`examples/loop-engineering-for-newbies/` contains a complete finished book produced by
this pipeline: 10 QA-gated chapters, the `agent` illustration theme, five workflow
diagrams, and the assembled single-file HTML. Open
`examples/loop-engineering-for-newbies/loop-engineering-for-newbies.html` in a browser
to see the output quality.

## DeepSeek Harness (DSH) integration

DSH is built on the "everything is a plugin" model: the harness itself is a stack of
`cordis.patch.yml` patch layers, and every capability (agent, tools, UI, skills…) is a
row in that stack that loads a plugin package. BookForge plugs into it the same way the
built-ins do, at two levels:

**1. The `bookforge` skill (works today, no install).**
DSH skills are discovered from filesystem roots (`<project>/.dsh/skills`,
`<project>/.agents/skills`, `~/.dsh/skills`, `~/.agents/skills`). Ship
[`skills/bookforge/SKILL.md`](skills/bookforge/SKILL.md) into any of those roots — e.g.

```bash
mkdir -p ~/.dsh/skills && cp -r <clone>/skills/bookforge ~/.dsh/skills/
```

— and every DSH agent in that scope gets a `bookforge` skill: the full pipeline runbook
(stages, commands, user gates, invariants) that the agent loads and drives with this
zero-dependency CLI. The agent does the agent work (TOC, chapters, subagent delegation);
BookForge does the deterministic work (research fetch, QA gates, HTML assembly).

**2. A DSH bundle (the full "plugin" citizen).**
This repo declares `dsh.bundle.patch` in `package.json`, pointing at
[`cordis.patch.yml`](cordis.patch.yml), which re-addresses the profile's
`skill-filesystem` row (last write wins) to also scan this repo's `skills/` directory.
So it can be layered into any DSH profile like any other bundle:

```bash
dsh plugin --profile web add bookforge@<path-or-git-url>
```

and the profile's layer stack reconciles it automatically. Note the bundled path is
relative to the process cwd at boot — run DSH from inside the clone to pick up the skill.
Treat the bundle path as preview-grade on the current rc release; the skill path (1) is
fully supported and does not depend on it.

## Development

```bash
npm test            # zero-dependency test suite (26 tests)
```
