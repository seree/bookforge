// BookForge — research step.
// Uses Monid TinyFish (free endpoints) to search the live web and fetch clean
// Markdown from the best sources, then writes a research digest and sources table.
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { step, ok, warn, err, ensureDir, writeJSON, readJSON, monidRun, monidOutput } = require("./util");

const SEARCH_ENDPOINT = "/search";
const FETCH_ENDPOINT = "/fetch";
const BATCH = 10;

// Default research brief: a spread of queries for a general topic.
function defaultBrief(topic) {
  return {
    topic,
    purpose: `Research for a casual, fun, easy-to-follow book about: ${topic}. Ground facts in real sources; no invented statistics.`,
    queries: [
      { query: `${topic} overview`, purpose: "Get a broad, trusted overview of the topic." },
      { query: `${topic} history and key ideas`, purpose: "Find the origin story and core concepts." },
      { query: `${topic} practical tips for beginners`, purpose: "Find friendly, actionable guidance to make the book easy to follow." },
      { query: `${topic} common myths and mistakes`, purpose: "Find pitfalls and misconceptions to make the book fun and useful." },
    ],
  };
}

function loadBrief(file) {
  const raw = readJSON(file);
  if (!Array.isArray(raw.queries) || raw.queries.length === 0) {
    throw new Error("research brief must be JSON like { topic, purpose, queries: [{ query, purpose?, domain_type? }] }");
  }
  return raw;
}

// Pick the strongest unique sources: prefer domains seen across multiple queries.
function pickSources(results, limit) {
  const byUrl = new Map();
  for (const r of results) {
    if (!r.url) continue;
    const prev = byUrl.get(r.url);
    if (prev) {
      prev.count += 1;
      prev.positions.push(r.position);
      prev.snippets.push(r.snippet || "");
    } else {
      byUrl.set(r.url, {
        title: r.title || "",
        url: r.url,
        site_name: r.site_name || "",
        count: 1,
        positions: [r.position],
        snippets: [r.snippet || ""],
      });
    }
  }
  const entries = Array.from(byUrl.values());
  // Score: appearance count dominates, then best rank; penalize dupe domains a bit.
  const domainSeen = new Map();
  entries.sort((a, b) => {
    const score = (e) => e.count * 100 - Math.min(...e.positions);
    const dom = (e) => { try { return new URL(e.url).hostname.replace(/^www\./, ""); } catch { return e.url; } };
    const dA = dom(a), dB = dom(b);
    const paid = domainSeen.has(dA) ? 1 : 0;
    const paidB = domainSeen.has(dB) ? 1 : 0;
    if (!paid && paidB) return -1;
    if (paid && !paidB) return 1;
    return score(b) - score(a);
  })
  for (const e of entries) {
    try { domainSeen.set(new URL(e.url).hostname.replace(/^www\./, ""), true); } catch { /* ignore */ }
  }
  return entries.slice(0, limit);
}

async function runSearches(brief, researchDir, usedBriefFile) {
  const rawDir = path.join(researchDir, "raw");
  ensureDir(rawDir);
  writeJSON(path.join(researchDir, "brief.json"), brief);

  const allResults = [];
  for (let i = 0; i < brief.queries.length; i++) {
    const q = brief.queries[i];
    const params = { query: q.query, language: q.language || brief.language || "en" };
    if (q.purpose) params.purpose = q.purpose;
    if (q.domain_type) params.domain_type = q.domain_type;
    step(`Searching web — "${q.query}"`);
    const outFile = path.join(rawDir, `search-${String(i + 1).padStart(2, "0")}.json`);
    let parsed = null;
    try {
      const raw = monidRun({ endpoint: SEARCH_ENDPOINT, params });
      fs.writeFileSync(outFile, raw);
      const data = JSON.parse(raw);
      const output = data.output || data;
      parsed = Array.isArray(output.results) ? output.results : [];
    } catch (e) {
      warn(`Search ${i + 1} failed: ${e.message}`);
    }
    if (parsed && parsed.length) {
      ok(`${parsed.length} results`);
      allResults.push(...parsed);
    } else {
      warn(`No results for "${q.query}"`);
    }
  }
  return allResults;
}

async function fetchSources(sources, purpose, researchDir) {
  const rawDir = path.join(researchDir, "raw");
  const notesDir = path.join(researchDir, "notes");
  ensureDir(notesDir);
  const fetched = [];
  // Dedupe URLs modulo query strings (e.g. ?srsltid=... tracking params).
  const seenCanonical = new Set();
  const canonical = (u) => {
    try {
      const url = new URL(u);
      return url.origin + url.pathname;
    } catch {
      return u;
    }
  };
  const uniq = [];
  for (const s of sources) {
    const key = canonical(s.url);
    if (seenCanonical.has(key)) continue;
    seenCanonical.add(key);
    uniq.push(s);
  }
  for (let i = 0; i < uniq.length; i += BATCH) {
    const batch = uniq.slice(i, i + BATCH).map((s) => s.url);
    step(`Fetching ${batch.length} source(s) as Markdown`);
    const outFile = path.join(rawDir, `fetch-${String(i / BATCH + 1).padStart(2, "0")}.json`);
    let results = [];
    try {
      const raw = monidRun({ endpoint: FETCH_ENDPOINT, params: null, file: JSON.stringify({ urls: batch, format: "markdown", purpose }) });
      fs.writeFileSync(outFile, raw);
      const data = JSON.parse(raw);
      results = (data.output && Array.isArray(data.output.results)) ? data.output.results : [];
      const errors = (data.output && data.output.errors) || [];
      if (errors.length) warn(`${errors.length} fetch error(s): ${errors.map((e) => e.code || "error").join(", ")}`);
    } catch (e) {
      warn(`Fetch batch failed: ${e.message}`);
    }
    for (const r of results) {
      const note = path.join(notesDir, `source-${String(fetched.length + 1).padStart(2, "0")}.md`);
      const safeUrl = r.url || "unknown";
      const header =
        `# ${r.title || safeUrl}\n\n` +
        `> Source: ${safeUrl}\n` +
        `> Language: ${r.language || "?"}\n\n`;
      fs.writeFileSync(note, header + (r.text || "(no content returned)"));
      fetched.push({
        title: r.title || safeUrl,
        url: safeUrl,
        language: r.language || null,
        file: path.basename(note),
        words: (r.text || "").split(/\s+/).filter(Boolean).length,
      });
    }
  }
  return fetched;
}

function writeDigest(researchDir, topic, searches, fetched) {
  // sources.md: table of every TinyFish search result (deduped) with "Used for" blank for later.
  const seen = new Set();
  const uniqueResults = [];
  for (const r of searches) {
    if (!r.url || seen.has(r.url)) continue;
    seen.add(r.url);
    uniqueResults.push(r);
  }
  const rows = uniqueResults
    .map((r) => `| ${r.title || ""} | ${r.url} | ${(r.snippet || "").replace(/\|/g, "\\|").slice(0, 140)} |`)
    .join("\n");
  const sourceMarkdown = `# Sources — ${topic}\n\n` +
    `Research method: BookForge ran TinyFish web searches (Monid, free endpoints), fetched ` +
    `top results as Markdown, and grounded the text in these pages. No statistics, quotes, ` +
    `or citations are invented — when facts are used they come from the fetched notes in ` + "`research/notes/`" + `.\n\n` +
    `| # | Source | URL | Used for |\n` +
    `|---|--------|-----|----------|\n` +
    uniqueResults.map((r, i) => `| ${i + 1} | ${(r.title || r.url).replace(/\|/g, "\\|")} | ${r.url} | ${fetched.some((f) => f.url === r.url) ? "Fetched" : "Snippet only"} |`).join("\n") +
    `\n`;
  fs.writeFileSync(path.join(researchDir, "sources.md"), sourceMarkdown);

  // summary.md: human/agent-readable digest.
  const lines = [`# Research Summary — ${topic}`, ""];
  if (fetched.length) {
    lines.push(`**${fetched.length} source(s) fetched** (notes in \`research/notes/\`):`);
    for (const f of fetched) {
      lines.push(`- **${f.title}** — ${f.url} → ${f.file}`);
    }
  } else {
    lines.push("No sources were fetched. Check raw search output.");
  }
  lines.push("", "_Generated by BookForge using TinyFish (Monid) — free endpoints._");
  fs.writeFileSync(path.join(researchDir, "summary.md"), lines.join("\n") + "\n");
}

// Fail loudly unless a research run actually grounded itself on the live web.
// This is BookForge's guarantee that "researched" always means real internet research:
// zero search results (web unreachable/endpoint down) or zero fetched notes (fetch path
// broken) both abort the run instead of letting the book limp forward unsourced.
// Note: `fetched` has NO default so callers can check search results alone (the first
// guard in runResearch) without the empty-fetched rule firing prematurely.
function requireGrounding({ searchResults = [], fetched } = {}) {
  if (!Array.isArray(searchResults) || searchResults.length === 0) {
    throw new Error(
      "TinyFish searches returned no results — BookForge could not reach the live web. " +
      "Run `bookforge health` to diagnose, fix connectivity, then re-run `bookforge research`."
    );
  }
  if (fetched !== undefined && (!Array.isArray(fetched) || fetched.length === 0)) {
    throw new Error(
      "TinyFish searches ran, but 0 sources were fetched as notes — the web path is broken. " +
      "Run `bookforge health` to diagnose, fix connectivity, then re-run `bookforge research`."
    );
  }
}

// Enumerate the fetched research notes on disk for a project's research dir.
// Each note carries the URL it was fetched from (parsed from its header).
function listNotes(researchDir) {
  const notesDir = path.join(researchDir, "notes");
  if (!fs.existsSync(notesDir)) return [];
  return fs
    .readdirSync(notesDir)
    .filter((f) => /^source-\d{2}\.md$/.test(f))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
    .map((file) => {
      try {
        const text = fs.readFileSync(path.join(notesDir, file), "utf8");
        const url = (text.match(/^> Source: (.+)$/m) || [])[1] || "";
        const title = (text.match(/^# (.+)$/m) || [])[1] || file;
        return { file, title, url };
      } catch (e) {
        return { file, title: file, url: "" };
      }
    });
}

// Fail loudly unless a book project carries real internet research on disk.
// This is BookForge's end-to-end guarantee: the TOC (outline) stage AND the
// content (assemble) stage both refuse to proceed for a book that has no
// fetched web sources — a book can never be "researched" without the web, and
// nothing downstream (TOC, chapters, HTML) is produced from an empty research/
// folder. Returns the note list so callers can also validate against it.
function requireResearch(project, { forStage = "proceed" } = {}) {
  const notes = listNotes(path.join(project.dir, "research"));
  if (!notes.length) {
    throw new Error(
      `BookForge refuses to ${forStage} — this book has no internet research behind it. ` +
      "The table of contents and every chapter must be grounded in live web sources, and " +
      "none were found (no fetched notes in research/notes/). Run `bookforge health`, then " +
      `\`bookforge research --book ${project.manifest.slug}\` so real internet research feeds this book.`
    );
  }
  return notes;
}

async function runResearch(project, opts = {}) {
  const { dir, manifest } = project;
  const researchDir = path.join(dir, "research");
  ensureDir(researchDir);

  const brief = opts.brief ? loadBrief(opts.brief) : defaultBrief(manifest.topic || manifest.title);
  const sourceLimit = opts.top || 8;

  step(`Researching "${brief.topic}" with TinyFish (${brief.queries.length} search queries)`);
  const searchResults = await runSearches(brief, researchDir, path.join(researchDir, "brief.json"));
  requireGrounding({ searchResults });
  ok(`${searchResults.length} raw results across queries`);

  const sources = pickSources(searchResults, sourceLimit);
  ok(`${sources.length} best sources selected`);
  const fetched = await fetchSources(sources, brief.purpose, researchDir);
  requireGrounding({ searchResults, fetched });
  ok(`${fetched.length} source(s) fetched as Markdown`);

  writeDigest(researchDir, brief.topic, searchResults, fetched);
  ok(`Digest written to ${path.join(researchDir, "summary.md")} and ${path.join(researchDir, "sources.md")}`);

  manifest.research = {
    queries: brief.queries.length,
    sources: searchResults.length,
    fetched: fetched.length,
  };
  manifest.sources = fetched.map((f) => ({ title: f.title, url: f.url }));
  manifest.status = "researched";
  writeJSON(path.join(dir, "bookforge.json"), manifest);
  return { searchResults, fetched };
}

module.exports = { defaultBrief, loadBrief, runResearch, pickSources, requireGrounding, listNotes, requireResearch };
