// BookForge — outline (TOC) stage.
// The harness agent drafts a table of contents into drafts/toc.json following
// instructions/OUTLINE.md; `outline --file` validates it into the manifest,
// and `outline --accept` marks it user-confirmed (the stage-gate).
// Grounding is enforced here too: a TOC can only be stored when the book has
// real internet research (fetched notes), and every chapter must declare which
// researched source(s) it draws on (`grounding: ["source-NN.md", ...]`).
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { writeJSON, readJSON, ok, err, warn } = require("./util");
const { requireResearch } = require("./research");

function validateOutline(data) {
  if (!Array.isArray(data) && (!data || !Array.isArray(data.outline))) {
    throw new Error("Outline must be a JSON array of { title, summary? } — or { title, subtitle?, outline: [...] }");
  }
  const list = Array.isArray(data) ? data : data.outline;
  if (!list.length) throw new Error("Outline is empty — nothing to confirm.");
  return list.map((c, i) => {
    if (!c || typeof c.title !== "string" || !c.title.trim()) {
      throw new Error(`Outline item ${i + 1} is missing a 'title'.`);
    }
    return {
      num: i + 1,
      title: c.title.trim(),
      summary: (c.summary || "").trim(),
      grounding: Array.isArray(c.grounding)
        ? c.grounding.map((g) => String(g).trim()).filter(Boolean)
        : [],
    };
  });
}

// Every TOC chapter must name at least one fetched research note it draws on,
// and every named note must actually exist in research/notes/. This is what
// makes the TOC itself internet-researched, not just the prose later on.
function validateOutlineGrounding(outline, notes) {
  const names = new Set(notes.map((n) => n.file));
  const problems = [];
  for (const ch of outline) {
    if (!Array.isArray(ch.grounding) || ch.grounding.length === 0) {
      problems.push(`Chapter "${ch.title}" lists no research notes — add grounding: ["source-NN.md", ...].`);
      continue;
    }
    for (const g of ch.grounding) {
      if (!names.has(g)) {
        problems.push(`Chapter "${ch.title}" references unknown note "${g}" — available notes: ${[...names].join(", ") || "(none)"}.`);
      }
    }
  }
  if (problems.length) {
    throw new Error("Outline is not fully grounded in the internet research:\n  - " + problems.join("\n  - "));
  }
  return outline;
}

function applyOutline(project, fileOrData) {
  const { dir, manifest } = project;
  const notes = requireResearch(project, { forStage: "store an outline (TOC)" });
  const data = typeof fileOrData === "string" ? readJSON(fileOrData) : fileOrData;
  const outline = validateOutline(data);
  validateOutlineGrounding(outline, notes);
  const subtitle = data && data.subtitle ? data.subtitle : manifest.subtitle;

  manifest.outline = outline;
  if (subtitle && subtitle !== manifest.subtitle) manifest.subtitle = subtitle;
  manifest.status = "outlined";
  writeJSON(path.join(dir, "bookforge.json"), manifest);
  ok(`Outline stored (${outline.length} chapters, each grounded in research notes) — status: outlined`);
  return outline;
}

function confirmOutline(project) {
  const { dir, manifest } = project;
  if (!manifest.outline.length) {
    err("No outline yet — run `bookforge outline --file drafts/toc.json` first.");
    return false;
  }
  let notes;
  try {
    notes = requireResearch(project, { forStage: "confirm an outline (TOC)" });
    validateOutlineGrounding(manifest.outline, notes);
  } catch (e) {
    err(e.message);
    return false;
  }
  manifest.status = "confirmed";
  writeJSON(path.join(dir, "bookforge.json"), manifest);
  ok("Outline confirmed — go ahead and write the chapters.");
  return true;
}

function printOutline(manifest) {
  console.log("\n  📑 Table of contents");
  manifest.outline.forEach((c) => {
    console.log(`    ${String(c.num).padStart(2, "0")}. ${c.title}`);
    if (c.summary) console.log(`        ${c.summary}`);
    if (Array.isArray(c.grounding) && c.grounding.length) {
      console.log(`        ↳ grounds on: ${c.grounding.join(", ")}`);
    }
  });
  console.log("");
}

module.exports = { validateOutline, validateOutlineGrounding, applyOutline, confirmOutline, printOutline };
