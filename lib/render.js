// BookForge — a tiny, safe Markdown renderer for chapter authoring.
// Intentional scope: headings, paragraphs, lists, blockquotes (with callout
// special-cases), inline code/bold/italic/links, fenced code, hr, and the
// workflow-diagram directive. Chapters are authored in Markdown; this turns
// them into design-system HTML.
"use strict";

const { workflowFigure } = require("./workflows");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(s) {
  let out = esc(s);
  // code spans first (protect from further transforms)
  const codes = [];
  out = out.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code);
    return `\u0000CODE${codes.length - 1}\u0000`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/_([^_\n]+)_/g, "<em>$1</em>");
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    const safeUrl = /^(https?:|\/|#)/.test(url) ? url : "#";
    return `<a href="${esc(safeUrl)}">${text}</a>`;
  });
  out = out.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => `<code>${esc(codes[Number(i)])}</code>`);
  return out;
}

function callout(kind, body) {
  const label = { try: "Try it", fact: "Fun fact", rule: "Rule of thumb", note: "Heads up" }[kind] || "Heads up";
  return `<aside class="callout ${kind}"><p class="callout-label">${label}</p>${body}</aside>`;
}

function render(md) {
  const lines = String(md || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  const flushCode = () => { /* handled inline below */ };

  while (i < lines.length) {
    const line = lines[i];

    // workflow diagram directive: ```workflow <name> ```
    const wf = line.match(/^```workflow\s+([\w-]+)\s*/);
    if (wf) {
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) i++;
      i++; // skip closing fence
      const fig = workflowFigure(wf[1]);
      blocks.push(fig || `<p><em>(workflow diagram unavailable: ${esc(wf[1])})</em></p>`);
      continue;
    }

    // fenced code
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
      continue;
    }

    // blank
    if (!line.trim()) { i++; continue; }

    // headings (chapter title via '#', sections via '##'/'###')
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = Math.min(6, h[1].length + 1);
      const tag = level <= 6 ? `h${level}` : "p";
      blocks.push(`<${tag}>${inline(h[2])}</${tag}>`);
      i++;
      continue;
    }

    // blockquote
    if (line.startsWith(">")) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      const text = buf.join(" ");
      const m = text.match(/^\*\*(Try it|Fun fact|Rule of thumb|Heads up|Note):?\*\*:?\s?(.*)$/i);
      if (m) {
        const map = { "Try it": "try", "Fun fact": "fact", "Rule of thumb": "rule", "Heads up": "note", "Note": "note" };
        blocks.push(callout(map[m[1]], m[2] ? `<p>${inline(m[2])}</p>` : ""));
      } else {
        blocks.push(`<blockquote>${inline(text)}</blockquote>`);
      }
      continue;
    }

    // hr
    if (/^\s*---+\s*$/.test(line)) { blocks.push("<hr>"); i++; continue; }

    // unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        buf.push(`<li>${inline(lines[i].replace(/^\s*[-*+]\s+/, ""))}</li>`);
        i++;
      }
      blocks.push(`<ul>${buf.join("")}</ul>`);
      continue;
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        buf.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ""))}</li>`);
        i++;
      }
      blocks.push(`<ol>${buf.join("")}</ol>`);
      continue;
    }

    // paragraph (may contain soft-wrapped lines)
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|>|```|-{3,}$|[-*+]\s|\d+\.\s)/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push(`<p>${inline(buf.join(" "))}</p>`);
  }

  return blocks.join("\n");
}

module.exports = { render, inline, esc };
