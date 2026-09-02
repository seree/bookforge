// BookForge — interactive readline prompts for the harness stage-gates.
// Set BOOKFORGE_NONINTERACTIVE=1 to fail/fall through prompts with defaults.
"use strict";

const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

const NONINTERACTIVE = process.env.BOOKFORGE_NONINTERACTIVE === "1";

function rl() {
  return readline.createInterface({ input: stdin, output: stdout });
}

// ask(question, { default, allowEmpty })
async function ask(question, opts = {}) {
  const def = opts.default;
  if (NONINTERACTIVE) return def ?? "";
  const r = rl();
  try {
    const suffix = def !== undefined ? ` [${def}]` : "";
    const answer = await r.question(`${question}${suffix} `);
    if (!answer.trim() && def !== undefined) return def;
    return answer.trim();
  } finally {
    r.close();
  }
}

// confirm(question, defaultYes = true)
async function confirm(question, defaultYes = true) {
  if (NONINTERACTIVE) return defaultYes;
  const r = rl();
  try {
    const hint = defaultYes ? "(Y/n)" : "(y/N)";
    const answer = await r.question(`${question} ${hint} `);
    const a = answer.trim().toLowerCase();
    if (!a) return defaultYes;
    return a === "y" || a === "yes";
  } finally {
    r.close();
  }
}

// pick(question, options) — numbered single choice; returns chosen string.
async function pick(question, options) {
  if (NONINTERACTIVE) return options[0];
  const r = rl();
  try {
    console.log(`  ${question}`);
    options.forEach((opt, i) => console.log(`    ${i + 1}. ${opt}`));
    const answer = await r.question("  Pick a number: ");
    const n = parseInt(answer, 10);
    if (n >= 1 && n <= options.length) return options[n - 1];
    return options[0];
  } finally {
    r.close();
  }
}

module.exports = { ask, confirm, pick, NONINTERACTIVE };
