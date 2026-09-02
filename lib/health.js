// BookForge — web-research connectivity health check.
// Verifies the whole path BookForge depends on for live research:
//   monid CLI present -> authenticated -> TinyFish /search reachable -> TinyFish /fetch reachable
// Run manually with `bookforge health`; `bookforge research` also fails loudly
// (requireGrounding in research.js) whenever a run cannot ground itself on the web.
"use strict";

const { execFileSync } = require("node:child_process");
const { c } = require("./util");
const { monidRun } = require("./util");

// --- individual checks (network-free ones first)

function checkMonidCli(timeoutMs = 15000) {
  try {
    const out = execFileSync("monid", ["--version"], {
      encoding: "utf8",
      timeout: timeoutMs,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NO_COLOR: "1" },
    });
    const first = (out || "").trim().split("\n")[0] || "monid on PATH";
    return { check: "monid CLI present", ok: true, detail: first };
  } catch (e) {
    const msg = (e.message || "").split("\n")[0] || "monid not on PATH";
    return { check: "monid CLI present", ok: false, detail: msg };
  }
}

function checkAuth(timeoutMs = 15000) {
  try {
    const out = execFileSync("monid", ["whoami"], {
      encoding: "utf8",
      timeout: timeoutMs,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NO_COLOR: "1" },
    });
    const authed = /authenticated/i.test(out) || /username:/i.test(out);
    const user = (out.match(/username:\s*([^\s]+)/i) || [])[1] || "";
    return {
      check: "monid authenticated",
      ok: !!authed,
      detail: authed ? (user ? `user ${user}` : "ok") : "whoami looked unauthenticated",
    };
  } catch (e) {
    const msg = (e.message || "").split("\n")[0] || "whoami failed";
    return { check: "monid authenticated", ok: false, detail: msg };
  }
}

// Live probe: TinyFish /search. Ok when the endpoint completes and returns a results array.
function probeSearch(timeoutMs = 60000) {
  try {
    const raw = monidRun({
      endpoint: "/search",
      params: {
        query: "BookForge connectivity health check",
        purpose: "Verify live web search reachability for the BookForge research harness",
        language: "en",
      },
      timeoutMs,
    });
    const data = JSON.parse(raw);
    const out = (data.output && typeof data.output === "object") ? data.output : data;
    const status = data.status || "?";
    const n = Array.isArray(out.results)
      ? out.results.length
      : (Array.isArray(data.results) ? data.results.length : -1);
    const completed = /^(completed|ok|success)$/i.test(String(status));
    const good = n >= 0 && completed;
    return {
      check: "TinyFish /search",
      ok: good,
      detail: good ? `live search ok (${n} results, ${status})` : `endpoint reached but odd response (${status})`,
    };
  } catch (e) {
    const msg = (e.message || "search probe failed").split("\n")[0];
    return { check: "TinyFish /search", ok: false, detail: msg };
  }
}

// Live probe: TinyFish /fetch. Ok when a real page comes back as Markdown.
function probeFetch(timeoutMs = 60000) {
  try {
    const raw = monidRun({
      endpoint: "/fetch",
      params: null,
      file: JSON.stringify({
        urls: ["https://example.com/"],
        format: "markdown",
        purpose: "Verify live web fetch reachability for the BookForge research harness",
      }),
      timeoutMs,
    });
    const data = JSON.parse(raw);
    const out = (data.output && typeof data.output === "object") ? data.output : data;
    const results = Array.isArray(out.results) ? out.results : [];
    const gotText = results.some((r) => r && (r.text || "").trim().length > 0);
    return {
      check: "TinyFish /fetch",
      ok: !!gotText,
      detail: gotText ? `live fetch ok (${results.length} page(s) as markdown)` : `endpoint reached but no text (${data.status || "?"})`,
    };
  } catch (e) {
    const msg = (e.message || "fetch probe failed").split("\n")[0];
    return { check: "TinyFish /fetch", ok: false, detail: msg };
  }
}

// Run all checks in order; skip live probes if CLI/auth already failed.
function runHealth(opts = {}) {
  const cli = checkMonidCli();
  const auth = checkAuth();
  const results = [cli, auth];
  if (cli.ok && auth.ok) {
    results.push(probeSearch(opts.searchTimeoutMs));
    results.push(probeFetch(opts.fetchTimeoutMs));
  } else {
    results.push({ check: "TinyFish /search", ok: false, detail: "skipped — CLI/auth failed" });
    results.push({ check: "TinyFish /fetch", ok: false, detail: "skipped — CLI/auth failed" });
  }
  return results;
}

// Pure report builder (offline-testable). Returns { text, exit } where exit is 0 iff all ok.
function healthReport(results) {
  const lines = ["", "  🌐 BookForge web-research health check", ""];
  let allOk = true;
  for (const r of results) {
    const mark = r.ok ? c("green", "✔") : c("red", "✘");
    const status = r.ok ? "ok" : "FAIL";
    lines.push(`   ${mark}  ${String(r.check).padEnd(24)} ${r.detail || status}`);
    if (!r.ok) allOk = false;
  }
  lines.push("");
  lines.push(
    allOk
      ? "  Web-research path is healthy — BookForge can research live topics right now."
      : "  Web-research path is NOT healthy. Fix the FAILs above (install monid, log in," +
        " check network), then re-run `bookforge health` before `bookforge research`."
  );
  lines.push("");
  return { text: lines.join("\n"), exit: allOk ? 0 : 1 };
}

module.exports = { checkMonidCli, checkAuth, probeSearch, probeFetch, runHealth, healthReport };
