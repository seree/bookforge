// BookForge — small shared helpers. No external dependencies.
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

// ---------------------------------------------------------------- text utils

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function titleCase(text) {
  return String(text || "")
    .replace(/(^|[\s-])(\p{L})/gu, (_, pre, ch) => pre + ch.toUpperCase());
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function wordCount(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
}

function stripMarkdown(md) {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------- console ui

const COL = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

function c(col, text) {
  if (process.env.NO_COLOR) return text;
  return `${COL[col] || ""}${text}${COL.reset}`;
}

function step(msg) {
  console.log(c("cyan", `\n  ❱ ${msg}`));
}

function ok(msg) {
  console.log(c("green", `  ✓ ${msg}`));
}

function warn(msg) {
  console.log(c("yellow", `  ⚠ ${msg}`));
}

function err(msg) {
  console.error(c("red", `  ✗ ${msg}`));
}

function banner(lines) {
  console.log(c("magenta", "  " + lines.join("\n  ")));
}

// ---------------------------------------------------------------- fs helpers

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJSON(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function listChapters(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^chapter-\d{2}\.(md|html)$/.test(f))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
}

// ---------------------------------------------------------------- monid glue

// Runs `monid run` against a TinyFish endpoint and saves output JSON.
// Returns parsed JSON (or null on failure).
function monidRun({ provider = "tinyfish", endpoint, params, pathParams, file, label, timeoutMs = 180000 }) {
  const args = ["run", "-p", provider, "-e", endpoint];
  if (params) args.push("--query", JSON.stringify(params));
  if (pathParams) args.push("--path", JSON.stringify(pathParams));
  if (file) args.push("-i", file);
  args.push("-w");
  args.push("-j");
  return execFileSync("monid", args, {
    encoding: "utf8",
    timeout: timeoutMs,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NO_COLOR: "1" },
  });
}

// Parses a monid JSON run response; returns the `output` object when present.
function monidOutput(raw) {
  try {
    const data = JSON.parse(raw);
    if (data && data.output && typeof data.output === "object") return data.output;
    return data;
  } catch {
    return null;
  }
}

module.exports = {
  slugify,
  titleCase,
  todayISO,
  wordCount,
  stripMarkdown,
  c,
  step,
  ok,
  warn,
  err,
  banner,
  readJSON,
  writeJSON,
  ensureDir,
  listChapters,
  monidRun,
  monidOutput,
};
