#!/usr/bin/env node
// BookForge — harness CLI.
// Pipeline: new (ask topic) → research (TinyFish) → outline (+ user confirm)
//           → chapters (agent writes per CHAPTER.md) → assemble (Anthropic-style HTML)
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { c, banner, step, ok, warn, err, readJSON } = require("../lib/util");
const { createProject, resolveProject, defaultBooksRoot } = require("../lib/project");
const { runResearch, requireResearch, listNotes } = require("../lib/research");
const { runHealth, healthReport } = require("../lib/health");
const { applyOutline, confirmOutline, printOutline, validateOutline, validateOutlineGrounding } = require("../lib/outline");
const { assemble } = require("../lib/assemble");
const { wordCount, stripMarkdown, listChapters } = require("../lib/util");
const pkg = require("../package.json");

const INST_DIR = path.resolve(__dirname, "..", "instructions");

function version() {
  console.log(`bookforge ${pkg.version}`);
}

function help() {
  banner([
    "BookForge — a harness that turns a topic into a casual, readable ebook.",
    "",
    "  bookforge new [topic]               Ask (or accept) a topic and scaffold a project.",
    "  bookforge health                    Check web-research connectivity (monid + TinyFish).",
    "  bookforge research [--book slug]    Research the topic with TinyFish (Monid).",
    "  bookforge outline-prompt [--book]    Print outline-drafting instructions.",
    "  bookforge outline --file toc.json [--accept] [--check] [--book]  Store / dry-check / confirm TOC.",
    "  bookforge chapter-prompt <n> [--book]  Print writing instructions for ch. n.",
    "  bookforge chapters [--book]         List chapter files & word counts.",
    "  bookforge workflows                 List top-down workflow diagrams chapters can embed.",
    "  bookforge assemble [--book]         Build the Anthropic-styled HTML ebook.",
    "  bookforge status [--book]           Show pipeline state.",
    "",
    "  --book <slug>   pick a project (default: detect from cwd; books live in",
    "                  BOOKFORGE_BOOKS_ROOT, default ../books next to this package).",
    "  -h, help        this help.   --version   version.",
  ]);
}

// crude flag/arg parser
function parseArgs(argv) {
  const opts = { positionals: [] };
  const flags = { "--book": "book", "--file": "file", "--top": "top", "--brief": "brief" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (flags[a]) {
      opts[flags[a]] = argv[++i];
    } else if (a === "--accept") {
      opts.accept = true;
    } else if (a === "--check") {
      opts.check = true;
    } else if (a.startsWith("--")) {
      warn(`Unknown flag ${a} — ignoring.`);
    } else {
      opts.positionals.push(a);
    }
  }
  return opts;
}

async function main(argv) {
  if (argv[0] === "--version" || argv[0] === "version") return version();
  const args = parseArgs(argv);
  const cmd = args.positionals.shift();

  if (!cmd || cmd === "-h" || cmd === "help" || cmd === "--help") return help();

  switch (cmd) {
    case "new": {
      const topic = args.positionals.join(" ") || undefined;
      await createProject(topic);
      step("Next: run `bookforge research --book <slug>` to hit the web.");
      return;
    }

    case "research": {
      const project = resolveProject(args.book);
      if (!project) return err("No BookForge project found. Run `bookforge new` first.");
      await runResearch(project, { brief: args.brief, top: args.top ? Number(args.top) : undefined });
      step("Next: draft a TOC — `bookforge outline-prompt`.");
      return;
    }

    case "health": {
      const { text, exit } = healthReport(runHealth());
      console.log(text);
      if (exit !== 0) process.exitCode = 1;
      return;
    }

    case "outline-prompt": {
      const project = resolveProject(args.book);
      if (!project) return err("No BookForge project found. Run `bookforge new` first.");
      // TOC drafting is grounded in web research — refuse to print instructions
      // for a book that hasn't been researched from the internet yet.
      requireResearch(project, { forStage: "draft an outline (TOC)" });
      let inst = fs.readFileSync(path.join(INST_DIR, "OUTLINE.md"), "utf8");
      inst = inst.replaceAll("<book>/", `${project.dir}/`);
      console.log(inst);
      return;
    }

    case "outline": {
      const project = resolveProject(args.book);
      if (!project) return err("No BookForge project found. Run `bookforge new` first.");
      if (args.accept) return confirmOutline(project);
      if (!args.file) return err("Pass --file drafts/toc.json (or --accept to confirm the stored outline).");
      const tocPath = path.resolve(args.file);
      const notes = requireResearch(project, { forStage: "validate an outline (TOC)" });
      const data = readJSON(tocPath);
      const outline = validateOutline(data);
      const checked = validateOutlineGrounding(outline, notes);
      if (args.check) {
        ok(`TOC is grounded — ${checked.length} chapters, every one naming research notes it draws on.`);
        return;
      }
      applyOutline(project, data);
      printOutline(project.manifest);
      step("User review time: show this TOC and, on approval, run `bookforge outline --accept`.");
      return;
    }

    case "chapter-prompt": {
      const project = resolveProject(args.book);
      if (!project) return err("No BookForge project found. Run `bookforge new` first.");
      const n = parseInt(args.positionals.shift(), 10);
      if (!n || n < 1) return err("Usage: bookforge chapter-prompt <n>");
      const entry = project.manifest.outline.find((o) => o.num === n);
      if (!entry) return err(`No outline entry for chapter ${n}. Has the outline been confirmed?`);
      let inst = fs.readFileSync(path.join(INST_DIR, "CHAPTER.md"), "utf8");
      inst = inst.replaceAll("<book>/", `${project.dir}/`);
      console.log(`\n━━━ BookForge chapter prompt · Chapter ${n} of ${project.manifest.outline.length} ━━━\n`);
      console.log(`Topic: ${project.manifest.title}\nTitle: ${entry.title}\nSummary: ${entry.summary ? " " + entry.summary : "(none)"}\nTone: ${project.manifest.tone}\nTarget words: ${project.manifest.target.wordsPerChapter}\n`);
      console.log(inst);
      return;
    }

    case "chapters": {
      const project = resolveProject(args.book);
      if (!project) return err("No BookForge project found.");
      const files = listChapters(path.join(project.dir, "chapters"));
      if (!files.length) return warn("No chapters yet in chapters/.");
      for (const f of files) {
        const md = fs.readFileSync(path.join(project.dir, "chapters", f), "utf8");
        console.log(`  ${f}  ·  ${wordCount(stripMarkdown(md))} words`);
      }
      return;
    }

    case "workflows": {
      const { listWorkflows } = require("../lib/workflows");
      const rows = listWorkflows();
      if (!rows.length) return warn("No workflow diagrams registered yet.");
      console.log(`\n  Top-down workflow diagrams (embed with ` + "```workflow <name> ```" + `):\n`);
      for (const r of rows) console.log(`   ${r.name.padEnd(16)} ${r.title}`);
      console.log("");
      return;
    }

    case "assemble": {
      const project = resolveProject(args.book);
      if (!project) return err("No BookForge project found.");
      console.log(`Assembling "${project.manifest.title}"…`);
      assemble(project);
      const html = path.join(project.dir, `${project.manifest.slug}.html`);
      step(`Open it: file://${html}`);
      return;
    }

    case "status": {
      const project = resolveProject(args.book);
      if (!project) return err("No BookForge project found. Run `bookforge new` first.");
      const { manifest } = project;
      const steps = [
        ["new", "Topic asked & project scaffolded", true],
        ["research", "TinyFish research done", ["researched", "outlined", "confirmed", "complete"].includes(manifest.status)],
        ["outline", "TOC stored", ["outlined", "confirmed", "complete"].includes(manifest.status)],
        ["outline --accept", "TOC user-confirmed", ["confirmed", "complete"].includes(manifest.status)],
        ["chapters", `Chapters written (${listChapters(path.join(project.dir, "chapters")).length}/${manifest.target.chapters})`, (manifest.status === "complete") || listChapters(path.join(project.dir, "chapters")).length === manifest.target.chapters],
        ["assemble", "HTML exported", manifest.status === "complete"],
      ];
      console.log(`\n  📚 ${manifest.title}  (${manifest.slug})`);
      for (const [name, label, done] of steps) {
        console.log(`   ${done ? c("green", "✔") : c("dim", "·")}  ${name.padEnd(16)} ${label}`);
      }
      if (manifest.outline.length) printOutline(manifest);
      return;
    }

    default:
      return help();
  }
}

main(process.argv.slice(2)).catch((e) => {
  err(e.message);
  process.exit(1);
});
