// BookForge — project scaffolding and manifest handling.
// A "book project" is a directory under <booksRoot>/<slug>/ containing:
//   bookforge.json     — manifest (title, subtitle, outline, target, status...)
//   chapters/           — chapter-NN.md (authored) or chapter-NN.html (hand-written)
//   research/          — TinyFish search/fetch raw output + notes + sources.md
//   drafts/             — scratch space for the harness host
//   README.md           — per-book readme
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { slugify, titleCase, todayISO, writeJSON, readJSON, ensureDir, ok, step, warn } = require("./util");
const { ask, confirm, pick } = require("./io");

const MANIFEST = "bookforge.json";

function defaultBooksRoot() {
  // The bookforge package lives at <labRoot>/bookforge; books live at <labRoot>/books.
  // Allow override via env BOOKFORGE_BOOKS_ROOT.
  if (process.env.BOOKFORGE_BOOKS_ROOT) return path.resolve(process.env.BOOKFORGE_BOOKS_ROOT);
  return path.resolve(__dirname, "..", "..", "books");
}

// Locate a project by slug (or detect from cwd when it is a project dir).
function resolveProject(slug) {
  const root = defaultBooksRoot();
  const candidates = [];
  if (slug) {
    candidates.push(path.join(root, slug));
  }
  // cwd might already be a book project dir
  candidates.push(process.cwd());
  for (const dir of candidates) {
    const mf = path.join(dir, MANIFEST);
    if (fs.existsSync(mf)) return { dir, manifest: readJSON(mf) };
  }
  return null;
}

function emptyManifest(topic, opts = {}) {
  const now = todayISO();
  return {
    schemas: "bookforge/v1",
    title: opts.title || titleCase(topic || "Untitled"),
    subtitle: opts.subtitle || "",
    slug: opts.slug || slugify(opts.title || topic || "untitled-book"),
    author: opts.author || "BookForge",
    date: now,
    genre: opts.genre || "Nonfiction",
    audience: opts.audience || "Curious general readers",
    tone: opts.tone || "Casual, fun, easy to follow",
    language: opts.language || "en",
    topic: topic || "",
    target: {
      chapters: opts.chapters || 10,
      wordsPerChapter: opts.wordsPerChapter || "1000-1400",
    },
    options: {
      illustrations: opts.illustrations !== false, // procedural SVG spot art + cover
      cover: opts.cover !== false,
    },
    outline: [],
    research: { queries: 0, sources: 0, fetched: 0 },
    status: "scaffold",
    finished: null,
  };
}

// Create a new book project in <booksRoot>/<slug>.
// Interactive when topic/title are missing.
async function createProject(rawTopic) {
  let topic = (rawTopic || "").trim();
  if (!topic) {
    warn("No topic given — asking you (that's BookForge's first job).");
    topic = await ask("📖 What should we write a book about?");
    if (!topic) throw new Error("No topic provided — aborting.");
  }

  const chaptersDefault = 10;
  const toneDefault = "Casual, fun, easy to follow";
  const chaptersRaw = await ask(`How many chapters? (8-12 makes a full book; default ${chaptersDefault})`, { default: String(chaptersDefault) });
  const chapters = Math.max(1, Math.min(30, parseInt(chaptersRaw, 10) || chaptersDefault));
  const tone = await ask("Writing tone?", { default: toneDefault });
  const titleRaw = await ask("Book title (Enter to auto-title)", { default: "" });
  const title = titleRaw.trim() || titleCase(topic);
  const subtitle = await ask("One-line subtitle (optional)");

  const slug = slugify(title);
  const dir = path.join(defaultBooksRoot(), slug);
  if (fs.existsSync(path.join(dir, MANIFEST))) {
    throw new Error(`A BookForge project already exists at ${dir}`);
  }

  ensureDir(path.join(dir, "chapters"));
  ensureDir(path.join(dir, "research", "raw"));
  ensureDir(path.join(dir, "drafts"));

  const manifest = emptyManifest(topic, { title, subtitle, slug, chapters, tone });
  writeJSON(path.join(dir, MANIFEST), manifest);
  fs.writeFileSync(path.join(dir, "README.md"), `# ${manifest.title}\n\nBookForge project for **${topic}**.\n\nStatus: ${manifest.status}\n`);

  step("BookForge project created");
  ok(`Book:   ${manifest.title}`);
  ok(`Slug:   ${slug}`);
  ok(`Target: ${chapters} chapters × ${manifest.target.wordsPerChapter} words`);
  ok(`Location: ${dir}`);
  return { dir, manifest };
}

module.exports = {
  MANIFEST,
  defaultBooksRoot,
  resolveProject,
  emptyManifest,
  createProject,
};
