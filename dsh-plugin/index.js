// BookForge — native DeepSeek Harness tool service.
//
// This module is the plugin entrypoint that the BookForge DSH bundle registers
// in a profile (see ../cordis.patch.yml, row id `tool-bookforge`). It exposes a
// single `bookforge` tool that shells out to the zero-dependency BookForge CLI
// shipped in this same package, so an agent can drive the ebook pipeline with a
// native tool call instead of raw bash.
//
// The tool definition is hand-built (not via dsh-tools' defineTool) on purpose:
// it keeps this plugin free of any third-party import, so it resolves cleanly
// when installed as a pnpm link:/path dependency of a profile.
"use strict";

const { spawn } = require("node:child_process");
const path = require("node:path");

const name = "tool-bookforge";
const inject = ["tools"];

const CLI_PATH = path.resolve(__dirname, "..", "bin", "bookforge.js");
const STAGES = ["new", "research", "outline-prompt", "outline", "chapter-prompt", "chapters", "status", "assemble"];
const MAX_OUTPUT = 12000;
const TIMEOUT_MS = 15 * 60 * 1000;

const DESCRIPTION = [
  "Run one stage of the BookForge ebook pipeline (zero-dependency Node CLI).",
  `Stages: ${STAGES.join(", ")}.`,
  "Books live under <bookforge-repo-parent>/books/<slug> (override with BOOKFORGE_BOOKS_ROOT).",
  "'status' checks progress; 'chapter-prompt <n>' prints the writing brief for chapter n;",
  "'assemble' exports the final HTML. The agent authors drafts/toc.json and",
  "chapters/chapter-NN.md itself; this tool only runs the deterministic CLI stages.",
].join(" ");

function runCli(argv) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [CLI_PATH, ...argv], {
      env: { ...process.env, BOOKFORGE_NONINTERACTIVE: "1", NO_COLOR: "1" },
    });
    let out = "";
    const append = (chunk) => {
      out += chunk.toString();
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`BookForge stage '${argv[0]}' timed out after ${Math.round(TIMEOUT_MS / 1000)}s`));
    }, TIMEOUT_MS);
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      const text = out.trim();
      if (code === 0) resolve(text || "(no output)");
      else reject(new Error(`BookForge stage '${argv[0]}' failed (exit ${code}):\n${text.slice(0, 4000)}`));
    });
  });
}

function truncate(text, max) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n... [truncated, ${text.length - max} more chars]`;
}

function fail(msg) {
  const err = new Error(msg);
  err.name = "ToolArgsError";
  return err;
}

function apply(ctx) {
  ctx.tools.register({
    name: "bookforge",
    description: DESCRIPTION,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        command: {
          type: "string",
          enum: STAGES,
          description: "BookForge pipeline stage to run."
        },
        book: {
          type: "string",
          description: "Book slug (e.g. 'loop-engineering-for-newbies'). Omit for 'new'."
        },
        extra: {
          type: "array",
          items: { type: "string" },
          description: "Extra CLI tokens, e.g. [\"5\"] for chapter-prompt 5, [\"--file\",\"drafts/toc.json\"] for outline, [\"Topic title\"] for new."
        }
      },
      required: ["command"]
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          command: { type: "string" },
          output: { type: "string" }
        },
        required: ["command", "output"]
      },
      render: (_args, value) => [{ type: "text", text: `bookforge ${value.command}\n${value.output}` }]
    },
    timeoutMs: TIMEOUT_MS,
    async execute(args) {
      const command = args && typeof args.command === "string" ? args.command : "";
      if (!STAGES.includes(command)) throw fail(`bookforge: unknown stage '${command}' (one of: ${STAGES.join(", ")})`);
      const argv = [command];
      const book = args && typeof args.book === "string" ? args.book.trim() : "";
      if (book) argv.push("--book", book);
      if (args && Array.isArray(args.extra)) {
        for (const token of args.extra) {
          if (typeof token !== "string") throw fail("bookforge: 'extra' must be an array of strings");
          argv.push(token);
        }
      }
      const output = await runCli(argv);
      return { command, output: truncate(output, MAX_OUTPUT) };
    }
  });
}

module.exports = { name, inject, apply };
