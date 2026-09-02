// BookForge — tiny zero-dependency test runner. Run with: npm test (or node test/run.js)
"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert");
const { slugify, titleCase, wordCount, stripMarkdown } = require("../lib/util");
const { render } = require("../lib/render");
const { defaultBrief, pickSources, requireGrounding, listNotes, requireResearch } = require("../lib/research");
const { healthReport } = require("../lib/health");
const { assemble } = require("../lib/assemble");
const { chapterIllustration, coverArt, THEMES, PALETTE } = require("../lib/illustrations");
const { workflowFigure, listWorkflows, WORKFLOWS } = require("../lib/workflows");
const { emptyManifest, MANIFEST } = require("../lib/project");
const { validateOutline, validateOutlineGrounding, applyOutline, confirmOutline } = require("../lib/outline");

let passed = 0;
function t(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}\n    ${e.message}`);
    process.exitCode = 1;
  }
}

// --- util
t("slugify", () => {
  assert.strictEqual(slugify("Urban Gardening for Apartment Dwellers!"), "urban-gardening-for-apartment-dwellers");
  assert.strictEqual(slugify("99 bottles of coffee"), "99-bottles-of-coffee");
  assert.strictEqual(slugify(""), "");
});
t("titleCase", () => {
  assert.strictEqual(titleCase("green roofs"), "Green Roofs");
});
t("wordCount/stripMarkdown", () => {
  assert.strictEqual(wordCount("a b c"), 3);
  assert.strictEqual(wordCount(stripMarkdown("## Head **bold** [link](x) `code`")), 4);
});

// --- renderer
t("render headings", () => {
  const out = render("# Ch\n\n## Sec\n\n### Sub");
  assert.ok(out.includes("<h2>Ch</h2>"));
  assert.ok(out.includes("<h3>Sec</h3>"));
  assert.ok(out.includes("<h4>Sub</h4>"));
});
t("render callouts", () => {
  const out = render("> **Fun fact:** x\n\n> **Try it:** y\n\n> **Rule of thumb:** z");
  assert.ok(out.includes('class="callout fact"'));
  assert.ok(out.includes('class="callout try"'));
  assert.ok(out.includes('class="callout rule"'));
});
t("render escapes html", () => {
  const out = render("a <script>alert(1)</script>");
  assert.ok(!out.includes("<script>"));
  assert.ok(out.includes("&lt;script&gt;"));
});
t("render lists + code", () => {
  const out = render("- a\n- b\n\n1. one\n2. two\n\n```\nx\n```");
  assert.ok(out.includes("<ul>"));
  assert.ok(out.includes("<ol>"));
  assert.ok(out.includes("<pre><code>"));
});

// --- outline
t("validateOutline", () => {
  const okArr = validateOutline([{ title: "One", summary: "s" }, { title: "Two" }]);
  assert.strictEqual(okArr.length, 2);
  assert.strictEqual(okArr[last(okArr)].num, 2);
  assert.throws(() => validateOutline([{ summary: "no title" }]), /missing a 'title'/);
  assert.throws(() => validateOutline([]), /empty/);
});
function last(a) { return a.length - 1; }

// --- research
t("defaultBrief", () => {
  const brief = defaultBrief("spaghetti");
  assert.ok(brief.queries.length >= 3);
  assert.ok(brief.queries.every((q) => typeof q.query === "string" && q.query.length));
});
t("pickSources dedupes + ranks", () => {
  const results = [
    { title: "A", url: "https://x.com/a", position: 1 },
    { title: "A", url: "https://x.com/a", position: 2 },
    { title: "B", url: "https://y.com/b", position: 1 },
  ];
  const picked = pickSources(results, 2);
  assert.strictEqual(picked.length, 2);
  assert.strictEqual(picked[0].url, "https://x.com/a"); // appears twice → ranked first
});
t("requireGrounding fails loud on no web grounding", () => {
  // A research run must never be marked "researched" without real web grounding.
  assert.throws(() => requireGrounding({ searchResults: [], fetched: [] }), /no results/i);
  assert.throws(() => requireGrounding({ searchResults: [{ url: "u" }], fetched: [] }), /0 sources/i);
  assert.throws(() => requireGrounding({}), /no results/i);
  assert.doesNotThrow(() =>
    requireGrounding({ searchResults: [{ url: "u" }], fetched: [{ url: "u", title: "t" }] })
  );
  // Regression guard: checking search results ALONE (no `fetched` arg) must NOT
  // trigger the empty-fetched rule — this was the initial requireGrounding bug.
  assert.doesNotThrow(() => requireGrounding({ searchResults: [{ url: "u" }] }));
});

// --- research artifacts on disk (the "both TOC and content" grounding guarantee)
t("listNotes parses fetched notes on disk", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bf-notes-"));
  fs.mkdirSync(path.join(dir, "notes"), { recursive: true });
  assert.deepStrictEqual(listNotes(dir), []);
  fs.writeFileSync(
    path.join(dir, "notes", "source-01.md"),
    "# Fetched Title\n\n> Source: https://example.com/thing\n\nBody text here."
  );
  const notes = listNotes(dir);
  assert.strictEqual(notes.length, 1);
  assert.strictEqual(notes[0].file, "source-01.md");
  assert.strictEqual(notes[0].title, "Fetched Title");
  assert.strictEqual(notes[0].url, "https://example.com/thing");
});

t("requireResearch fails loud without web research, passes with", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bf-rr-"));
  const project = { dir, manifest: { slug: "x" } };
  assert.throws(() => requireResearch(project), /no internet research/i);
  assert.throws(() => requireResearch(project, { forStage: "store an outline (TOC)" }), /store an outline \(TOC\)/);
  fs.mkdirSync(path.join(dir, "research", "notes"), { recursive: true });
  fs.writeFileSync(path.join(dir, "research", "notes", "source-01.md"), "# n\n\n> Source: https://x.com\n\nbody");
  const notes = requireResearch(project);
  assert.strictEqual(notes.length, 1, "notes list returned for downstream validation");
});

// --- outline (TOC) grounding
t("validateOutlineGrounding requires named real notes", () => {
  const notes = [{ file: "source-01.md" }, { file: "source-02.md" }];
  const good = [{ num: 1, title: "A", summary: "s", grounding: ["source-01.md"] }];
  assert.doesNotThrow(() => validateOutlineGrounding(good, notes));
  assert.throws(() => validateOutlineGrounding([{ num: 1, title: "B", summary: "s" }], notes), /no research notes/i);
  assert.throws(
    () => validateOutlineGrounding([{ num: 1, title: "C", summary: "s", grounding: ["source-99.md"] }], notes),
    /unknown note "source-99.md"/i
  );
});

t("outline applyOutline gates on internet research + grounded TOC", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bf-otl-"));
  const dir = path.join(root, "proj");
  fs.mkdirSync(path.join(dir, "research", "notes"), { recursive: true });
  fs.mkdirSync(path.join(dir, "drafts"));
  const manifest = emptyManifest("t", { title: "T", slug: "proj", chapters: 1 });
  fs.writeFileSync(path.join(dir, MANIFEST), JSON.stringify(manifest));
  fs.writeFileSync(path.join(dir, "research", "notes", "source-01.md"), "# A\n\n> Source: https://x.com/a\n\nbody");

  const toc = { title: "T", outline: [{ title: "A", summary: "s", grounding: ["source-01.md"] }] };
  const out = applyOutline({ dir, manifest }, toc);
  assert.strictEqual(out.length, 1);
  assert.strictEqual(out[0].grounding[0], "source-01.md");
  assert.strictEqual(manifest.status, "outlined");

  // grounding reference to a note that doesn't exist → reject
  const tocBad = { title: "T", outline: [{ title: "A", summary: "s", grounding: ["source-09.md"] }] };
  assert.throws(() => applyOutline({ dir, manifest }, tocBad), /unknown note/i);

  // no research at all → reject before even looking at the TOC
  const dir2 = path.join(root, "proj2");
  fs.mkdirSync(dir2, { recursive: true });
  const m2 = emptyManifest("t2", { title: "T2", slug: "proj2", chapters: 1 });
  fs.writeFileSync(path.join(dir2, MANIFEST), JSON.stringify(m2));
  assert.throws(() => applyOutline({ dir: dir2, manifest: m2 }, toc), /no internet research/i);
});

t("outline confirmOutline refuses ungrounded stored TOC", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bf-con-"));
  const dir = path.join(root, "proj");
  fs.mkdirSync(path.join(dir, "research", "notes"), { recursive: true });
  fs.writeFileSync(path.join(dir, "research", "notes", "source-01.md"), "# A\n\n> Source: https://x.com/a\n\nbody");
  const manifest = emptyManifest("t", { title: "T", slug: "proj", chapters: 1 });
  manifest.outline = [{ num: 1, title: "A", summary: "s" }]; // no grounding refs
  fs.writeFileSync(path.join(dir, MANIFEST), JSON.stringify(manifest));
  const kept = confirmOutline({ dir, manifest });
  assert.strictEqual(kept, false); // confirm refused — TOC isn't grounded
  assert.notStrictEqual(manifest.status, "confirmed");
  manifest.outline = [{ num: 1, title: "A", summary: "s", grounding: ["source-01.md"] }];
  assert.strictEqual(confirmOutline({ dir, manifest }), true);
  assert.strictEqual(manifest.status, "confirmed");
});

// --- health (offline, pure parts)
t("healthReport all healthy", () => {
  const { text, exit } = healthReport([
    { check: "monid CLI present", ok: true, detail: "v0.1.6" },
    { check: "monid authenticated", ok: true, detail: "user seree" },
    { check: "TinyFish /search", ok: true, detail: "live search ok (5 results)" },
    { check: "TinyFish /fetch", ok: true, detail: "live fetch ok (1 page)" },
  ]);
  assert.strictEqual(exit, 0);
  assert.ok(text.includes("monid CLI present"));
  assert.ok(text.includes("healthy"));
});
t("healthReport flags failures + exit code", () => {
  const { text, exit } = healthReport([
    { check: "monid CLI present", ok: false, detail: "monid not on PATH" },
    { check: "monid authenticated", ok: false, detail: "whoami failed" },
    { check: "TinyFish /search", ok: false, detail: "skipped — CLI/auth failed" },
    { check: "TinyFish /fetch", ok: false, detail: "skipped — CLI/auth failed" },
  ]);
  assert.notStrictEqual(exit, 0);
  assert.ok(text.includes("FAIL"));
  assert.ok(text.includes("NOT healthy"));
});

// --- illustrations
t("illustrations: 10 chapters + fallback + cover", () => {
  for (let i = 1; i <= 10; i++) {
    const s = chapterIllustration(i);
    assert.ok(s.startsWith("<svg"), `ch${i} starts with <svg`);
    assert.ok(s.includes(`viewBox="0 0 320`), `ch${i} has viewBox`);
    assert.ok(s.includes("stroke=\"#"), `ch${i} uses palette strokes`);
  }
  const fb = chapterIllustration(42); // beyond the curated set
  assert.ok(fb.includes("sprout") || fb.includes("path"), "fallback illustration renders");
  const cover = coverArt();
  assert.ok(cover.includes('viewBox="0 0 720 250"'), "cover art viewBox");
  assert.ok(cover.includes("class=\"illo\""), "cover art has illo class");
  assert.ok(Object.keys(PALETTE).length >= 6, "palette defined");
});
t("illustrations: per-theme sets differ", () => {
  const g1 = chapterIllustration(1, "garden");
  const o1 = chapterIllustration(1, "ollama");
  assert.ok(g1 !== o1, "same chapter in different themes differs");
  const o2 = chapterIllustration(2, "ollama");
  assert.ok(o1 !== o2, "ollama chapters 1 and 2 differ");
  assert.ok(coverArt("ollama") !== coverArt("garden"), "themed cover art differs");
  assert.ok(Object.keys(THEMES).length >= 2, "at least garden + ollama themes");
  const unknown = chapterIllustration(3, "nonexistent-theme");
  assert.ok(unknown.startsWith("<svg"), "unknown theme falls back gracefully");
});

// --- workflow diagrams
t("workflows: registry has all named diagrams", () => {
  const rows = listWorkflows();
  assert.ok(rows.length >= 8, "at least 8 workflow diagrams registered");
  assert.ok(rows.every((r) => /^[\w-]+$/.test(r.name) && r.title.length));
  assert.ok(Object.keys(WORKFLOWS).length === rows.length);
});
t("workflows: every figure is well-formed top-down SVG", () => {
  const rows = listWorkflows();
  const seen = new Set();
  for (const r of rows) {
    const fig = workflowFigure(r.name);
    assert.ok(fig && fig.startsWith('<figure class="workflow-fig"><svg class="workflow-svg"'), `${r.name} wraps in workflow figure`);
    assert.ok(fig.includes(`viewBox="0 0 560 `), `${r.name} is a 560-wide top-down diagram`);
    assert.ok(fig.includes("<path "), `${r.name} draws arrows/boxes`);
    assert.ok(fig.includes("<text "), `${r.name} carries readable labels`);
    assert.ok(fig.includes("</svg></figure>"), `${r.name} closes cleanly`);
    assert.ok(!/viewBox="0 0 (?!560)/.test(fig), `${r.name} uses the standard width`);
    assert.ok(!seen.has(fig), `${r.name} is unique`);
    seen.add(fig);
  }
});
t("workflows: unknown name falls back gracefully", () => {
  assert.strictEqual(workflowFigure("no-such-diagram"), null);
  const out = render("```workflow no-such-diagram\n```");
  assert.ok(out.includes("workflow diagram unavailable"), "renders a note instead of throwing");
});
t("render workflow directive emits figure", () => {
  const md = "## Step through it\n\n```workflow cache-hit\n```\n\nDone.";
  const out = render(md);
  assert.ok(out.includes('class="workflow-fig"'), "directive becomes a workflow figure");
  assert.ok(out.includes("Longest prefix already"), "diagram content from the registry");
  assert.ok(!out.includes("```"), "fence markers are consumed, not shown");
});

// --- end-to-end assemble from a fixture project
t("assemble refuses a book with no internet research", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bf-test-"));
  const dir = path.join(root, "fixture");
  fs.mkdirSync(path.join(dir, "chapters"), { recursive: true });
  const manifest = emptyManifest("fixture topic", { title: "Fixture Book", slug: "fixture", chapters: 2 });
  fs.writeFileSync(path.join(dir, MANIFEST), JSON.stringify(manifest));
  fs.writeFileSync(path.join(dir, "chapters", "chapter-01.md"), "# First\n\nIntro lines here.");
  assert.throws(() => assemble({ dir, manifest }), /no internet research/i);
});

t("assemble produces valid html", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bf-test-"));
  const dir = path.join(root, "fixture");
  fs.mkdirSync(path.join(dir, "chapters"), { recursive: true });
  fs.mkdirSync(path.join(dir, "research", "notes"), { recursive: true });
  fs.writeFileSync(path.join(dir, "research", "notes", "source-01.md"), "# Src\n\n> Source: https://example.com\n\nFetched research body.");
  const manifest = emptyManifest("fixture topic", { title: "Fixture Book", slug: "fixture", chapters: 2 });
  manifest.status = "confirmed"; // research done + TOC accepted
  manifest.outline = [
    { num: 1, title: "First", summary: "one", grounding: ["source-01.md"] },
    { num: 2, title: "Second", summary: "two", grounding: ["source-01.md"] },
  ];
  manifest.sources = [{ title: "Src", url: "https://example.com" }];
  fs.writeFileSync(path.join(dir, MANIFEST), JSON.stringify(manifest));
  fs.writeFileSync(
    path.join(dir, "chapters", "chapter-01.md"),
    "# First\n\nIntro lines here.\n\n## Section\n\n> **Try it:** poke it"
  );
  fs.writeFileSync(path.join(dir, "chapters", "chapter-02.md"), "# Second\n\nMore words to count.\n\n```workflow two-phases\n```\n");
  const out = assemble({ dir, manifest });
  assert.ok(out);
  const html = fs.readFileSync(out, "utf8");
  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("class=\"callout try\""));
  assert.ok(html.includes("id=\"ch-01\""));
  assert.ok(html.includes("Sources"));
  assert.ok(html.includes("--accent:#D97757")); // design tokens present
  assert.ok(html.includes("class=\"cover-art\""), "cover art block present");
  assert.ok(html.includes('id="cover"'), "cover present");
  assert.ok(html.includes("class=\"chapter-illo\""), "chapter illustration present");
  assert.ok(html.includes("chapter-illo\"><svg"), "chapter svg inside figure");
  assert.ok(html.includes("class=\"workflow-fig\""), "workflow diagram figure present");
  assert.ok(html.includes("workflow-svg"), "workflow svg present");
  assert.ok(html.includes("KV cache — the notebook it keeps"), "diagram labels survive assemble");
});

console.log(`\n  ${passed} test(s) passed.`);
