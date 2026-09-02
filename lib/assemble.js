// BookForge — assembler.
// Turns confirmed chapters (Markdown in chapters/) + manifest into a single,
// self-contained, Anthropic-styled HTML ebook using the design system.
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { render } = require("./render");
const { CSS, coverHtml, tocHtml, chapterHtml, sourcesHtml } = require("./design");
const { chapterIllustration } = require("./illustrations");
const { requireResearch } = require("./research");
const { wordCount, stripMarkdown, listChapters, ok, step, err } = require("./util");

function parseChapterFile(file) {
  const md = fs.readFileSync(file, "utf8");
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let title = "";
  let bodyStart = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^#\s+(.*)$/);
    if (m) {
      title = m[1].trim();
      bodyStart = i + 1;
      break;
    }
  }
  const bodyMd = lines.slice(bodyStart).join("\n").trim();
  if (!title) title = path.basename(file);
  return { title, bodyMd };
}

// Pull the first <p> out of rendered HTML to use as a styled chapter lead.
function splitLead(rendered) {
  const m = rendered.match(/^<p>([\s\S]*?)<\/p>/);
  if (!m) return { lead: "", rest: rendered };
  const lead = m[1];
  const rest = rendered.slice(m.index + m[0].length);
  return { lead, rest };
}

function assemble({ dir, manifest }) {
  // Content-side grounding gate: never build a book that wasn't researched from the web.
  requireResearch({ dir, manifest }, { forStage: "assemble a book" });
  const theme = (manifest.options && manifest.options.illustrationTheme) || "garden";
  const chapterFiles = listChapters(path.join(dir, "chapters"));
  if (!chapterFiles.length) {
    err("No chapters found in chapters/ — nothing to assemble.");
    return null;
  }

  const chapters = [];
  for (const file of chapterFiles) {
    const { title, bodyMd } = parseChapterFile(path.join(dir, "chapters", file));
    const rendered = render(bodyMd);
    const { lead, rest } = splitLead(rendered);
    const index = chapters.length;

    const head = `<div class="chapter-head">
  <p class="chapter-kicker">Chapter ${String(index + 1).padStart(2, "0")}</p>
  <h2>${title}</h2>
  ${lead ? `<p class="chapter-lead">${lead}</p>` : ""}
</div>`;

    chapters.push({
      num: index + 1,
      title,
      head,
      rest,
      illo: chapterIllustration(index + 1, theme),
      words: wordCount(stripMarkdown(bodyMd)),
    });
  }

  if (manifest.outline.length === 0) {
    // Fall back to titles found in chapter files.
    manifest.outline = chapters.map((c) => ({ num: c.num, title: c.title, summary: "" }));
  }

  const totalWords = chapters.reduce((s, c) => s + c.words, 0);
  const sources = (manifest.sources || []).map((s) => ({ title: s.title || s.url, url: s.url }));

  const body = chapters
    .map((c, i) => chapterHtml({ index: i, total: chapters.length, head: c.head, rest: c.rest, illo: c.illo, title: c.title }))
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="${manifest.language || "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="author" content="${manifest.author}">
<meta name="description" content="${manifest.subtitle || manifest.title}">
<title>${manifest.title}</title>
<style>${CSS}</style>
</head>
<body>
<div class="topbar">
  <span class="brand"><span class="brand-mark"></span>${manifest.title} <small>&middot; BookForge</small></span>
  <span class="chip">${chapters.length} chapters &middot; ~${totalWords} words</span>
</div>
<div class="wrap">
${coverHtml(manifest, { theme })}
${tocHtml(manifest)}
<main id="book-body">
${body}
</main>
${sourcesHtml(sources)}
<footer class="site-foot">${manifest.title} — produced with BookForge. Grounded in TinyFish research (Monid).</footer>
</div>
</body>
</html>
`;

  const outFile = path.join(dir, `${manifest.slug}.html`);
  fs.writeFileSync(outFile, html);
  fs.writeFileSync(path.join(dir, "design.css"), CSS);
  manifest.status = "complete";
  manifest.finished = manifest.finished || new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(dir, "bookforge.json"), JSON.stringify(manifest, null, 2) + "\n");
  ok(`Assembled ${outFile}`);
  ok(`${chapters.length} chapters · ~${totalWords} words · ${(fs.statSync(outFile).size / 1024).toFixed(1)} KB`);
  return outFile;
}

module.exports = { assemble, parseChapterFile };
