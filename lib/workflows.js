// BookForge — top-down workflow diagrams.
// Turns named, hand-crafted flowcharts into inline inline SVG figures so a
// chapter can visually explain a step-by-step process exactly where prose
// describes it. Chapters opt in from Markdown with a fenced directive:
//
//     ```workflow <name>
//     ```
//
// See render.js for the directive handling. The palette mirrors
// illustrations.js so diagrams sit naturally next to the per-book art.
"use strict";

// ---------------------------------------------------------------- palette

const P = {
  ink: "#191917",
  terra: "#B9593D",
  soft: "#D97757",
  muted: "#6E6C62",
  sand: "#E6E1D5",
  cream: "#FBF1EC",
  leaf: "#7E7434",
};

// ---------------------------------------------------------------- primitives

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function path(d, o = {}) {
  const c = o.c || P.ink;
  const w = o.w != null ? o.w : 2;
  const fill = o.fill != null ? o.fill : "none";
  return `<path d="${d}" fill="${fill}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function svgRect(x, y, w, h, o = {}) {
  const c = o.c || P.ink;
  const fill = o.fill != null ? o.fill : P.cream;
  const lw = o.lw != null ? o.lw : 2;
  const r = o.r != null ? o.r : 8;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${fill}" stroke="${c}" stroke-width="${lw}"/>`;
}

// Centered multi-line <text>. `cy` is the vertical centre of the text block.
function centerText(cx, cy, lines, o = {}) {
  const size = o.size != null ? o.size : 12;
  const lead = size + 2;
  const n = lines.length;
  const firstBaseline = cy - ((n - 1) * lead) / 2 + size * 0.38;
  const fill = o.fill || P.ink;
  const weight = o.weight != null ? o.weight : 520;
  const ts = lines
    .map((ln, i) => `<tspan x="${cx}" dy="${i === 0 ? 0 : lead}">${esc(ln)}</tspan>`)
    .join("");
  return `<text x="${cx}" y="${firstBaseline.toFixed(1)}" text-anchor="middle" font-size="${size}" font-weight="${weight}" fill="${fill}">${ts}</text>`;
}

// Rounded box with a centred label; `cx` is the horizontal centre.
function box(cx, y, w, h, lines, o = {}) {
  return (
    svgRect(cx - w / 2, y, w, h, o) +
    centerText(cx, y + h / 2, lines, o)
  );
}

// Decision diamond. `cx` horizontal centre, `yTop` top vertex.
function diamond(cx, yTop, w, h, lines, o = {}) {
  const d = `M${cx} ${yTop} L${cx + w / 2} ${yTop + h / 2} L${cx} ${yTop + h} L${cx - w / 2} ${yTop + h / 2} Z`;
  const fill = o.fill != null ? o.fill : "none";
  const c = o.c || P.terra;
  return (
    path(d, { c, w: o.lw != null ? o.lw : 2, fill }) +
    centerText(cx, yTop + h / 2, lines, { fill: o.text || P.ink, size: o.size, weight: o.weight })
  );
}

// Vertical arrow pointing down from (cx, y1) to (cx, y2).
function arrowDown(cx, y1, y2, o = {}) {
  const c = o.c || P.terra;
  const lw = o.lw != null ? o.lw : 2;
  const head = o.head != null ? o.head : 7;
  const tipY = y2 - head;
  let out = path(`M${cx} ${y1} L${cx} ${tipY}`, { c, w: lw });
  out += path(`M${cx - head} ${tipY - head} L${cx} ${tipY} L${cx + head} ${tipY - head}`, { c, w: lw });
  return out;
}

// Orthogonal line through `points` [[x,y],...] with an arrowhead on the last
// segment (direction derived from the last two points).
function elbow(points, o = {}) {
  const c = o.c || P.terra;
  const lw = o.lw != null ? o.lw : 2;
  const head = o.head != null ? o.head : 7;
  const d = "M" + points.map((p) => `${p[0]} ${p[1]}`).join(" L");
  const [x2, y2] = points[points.length - 1];
  const [x1, y1] = points[points.length - 2];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const bx = x2 - ux * head;
  const by = y2 - uy * head;
  const hx = -uy * head * 0.62;
  const hy = ux * head * 0.62;
  let out = path(d, { c, w: lw });
  out += path(`M${(bx - hx).toFixed(1)} ${(by - hy).toFixed(1)} L${x2} ${y2} L${(bx + hx).toFixed(1)} ${(by + hy).toFixed(1)}`, { c, w: lw });
  return out;
}

// Small "yes"/"no" running tag next to a branch.
function tag(x, y, s, o = {}) {
  const fill = o.fill || P.muted;
  const size = o.size != null ? o.size : 10.5;
  return `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="600" fill="${fill}">${esc(s)}</text>`;
}

function wfSvg(inner, o = {}) {
  const w = o.w != null ? o.w : 560;
  const h = o.h;
  return `<svg class="workflow-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(o.label || "workflow")}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
}

// ---------------------------------------------------------------- diagrams
// Every diagram flows top-down. Widths stay inside a 560-wide viewBox so the
// figure scales cleanly at any column width.

// ch1 — asking the same question twice, with and without a warm cache.
function wfFiveMinute() {
  const inner = `
  ${box(280, 22, 340, 46, ["Your same request, sent again"])}
  ${arrowDown(280, 68, 92)}
  ${diamond(280, 92, 300, 74, ["Seen this prefix", "before?"])}
  ${tag(96, 146, "yes")}
  ${tag(464, 146, "no")}
  ${elbow([[192, 130], [120, 130], [120, 180]])}
  ${elbow([[368, 130], [440, 130], [440, 180]])}
  ${box(120, 182, 220, 66, ["Cache hit", "reuse saved KV blocks", "instant-ish answer"])}
  ${box(440, 182, 220, 66, ["Cache miss", "fresh prefill + decode", "slower, then saved"])}
  ${elbow([[120, 248], [168, 248], [168, 302]])}
  ${elbow([[440, 248], [392, 248], [392, 302]])}
  ${box(280, 304, 340, 44, ["Same answer — only the speed differs"])}`;
  return wfSvg(inner, { h: 372, label: "same request twice: cache hit vs miss" });
}

// ch2 — prefill builds the KV cache, decode reads it.
function wfTwoPhases() {
  const inner = `
  ${box(280, 22, 260, 40, ["Your prompt arrives"])}
  ${arrowDown(280, 62, 84)}
  ${box(280, 84, 430, 58, ["1 · Prefill — reads the whole prompt", "and builds the KV cache (your notes)"])}
  ${arrowDown(280, 142, 164)}
  ${box(280, 164, 330, 50, ["KV cache — the notebook it keeps"])}
  ${arrowDown(280, 214, 236)}
  ${box(280, 236, 430, 58, ["2 · Decode — writes tokens one at a time,", "reading the notes, not the whole prompt"])}
  ${arrowDown(280, 294, 316)}
  ${box(280, 316, 230, 40, ["Your answer"])}`;
  return wfSvg(inner, { h: 372, label: "prefill builds the KV cache, decode reuses it" });
}

// ch3 — the three steps of a cache hit.
function wfCacheHit() {
  const inner = `
  ${box(280, 22, 340, 44, ["New request arrives"])}
  ${arrowDown(280, 66, 88)}
  ${box(280, 88, 340, 44, ["Engine hashes your prompt's prefix"])}
  ${arrowDown(280, 132, 154)}
  ${diamond(280, 154, 310, 74, ["Longest prefix already", "in the KV cache?"])}
  ${tag(100, 206, "yes")}
  ${tag(458, 206, "no")}
  ${elbow([[190, 180], [118, 180], [118, 228]])}
  ${elbow([[370, 180], [442, 180], [442, 228]])}
  ${box(118, 230, 224, 66, ["Match — reuse the saved", "KV blocks and compute", "only the new tail"])}
  ${box(442, 230, 224, 66, ["Miss — recompute the", "whole prefix, then", "store it for next time"])}
  ${elbow([[118, 296], [166, 296], [166, 318]])}
  ${elbow([[442, 296], [394, 296], [394, 318]])}
  ${box(280, 320, 300, 40, ["Answer arrives — quietly faster"])}`;
  return wfSvg(inner, { h: 380, label: "the path of a cache hit" });
}

// ch4 — vLLM lights up whole blocks from the pool.
function wfAutopilot() {
  const inner = `
  ${box(280, 22, 340, 42, ["Request arrives at the engine"])}
  ${arrowDown(280, 64, 86)}
  ${box(280, 86, 370, 44, ["Engine hashes blocks of your prefix"])}
  ${arrowDown(280, 130, 152)}
  ${diamond(280, 152, 300, 72, ["Blocks already", "in the pool?"])}
  ${tag(98, 204, "yes")}
  ${tag(462, 204, "no")}
  ${elbow([[192, 178], [120, 178], [120, 224]])}
  ${elbow([[368, 178], [440, 178], [440, 224]])}
  ${box(120, 226, 220, 62, ["Reuse the blocks —", "skip straight to decode"])}
  ${box(440, 226, 220, 62, ["Compute the blocks,", "store them in the pool"])}
  ${elbow([[120, 288], [166, 288], [166, 312]])}
  ${elbow([[440, 288], [394, 288], [394, 312]])}
  ${box(280, 314, 430, 44, ["Decode the answer — engine manages the pool & LRU"])}`;
  return wfSvg(inner, { h: 378, label: "vLLM block reuse versus compute" });
}

// ch5 — a request's journey through the SGLang radix tree.
function wfRadixLife() {
  const inner = `
  ${box(280, 22, 340, 42, ["“What is the capital of…” arrives"])}
  ${arrowDown(280, 64, 86)}
  ${box(280, 86, 420, 44, ["Tree lookup — longest shared prefix"])}
  ${arrowDown(280, 130, 152)}
  ${diamond(280, 152, 310, 72, ["Prefix in the", "radix tree?"])}
  ${tag(94, 204, "yes")}
  ${tag(466, 204, "no")}
  ${elbow([[188, 178], [116, 178], [116, 224]])}
  ${elbow([[372, 178], [444, 178], [444, 224]])}
  ${box(116, 226, 224, 62, ["Reuse the subtree —", "attend only new tokens"])}
  ${box(444, 226, 220, 62, ["Allocate fresh nodes,", "then share them too"])}
  ${elbow([[116, 288], [164, 288], [164, 312]])}
  ${elbow([[444, 288], [396, 288], [396, 312]])}
  ${box(280, 314, 360, 44, ["Next request starts from the shared prefix"])}`;
  return wfSvg(inner, { h: 378, label: "request lifecycle in a radix tree" });
}

// ch6 — what the KV monster does to memory.
function wfMemoryPressure() {
  const inner = `
  ${box(280, 22, 420, 44, ["KV cache grows with every token you send"])}
  ${arrowDown(280, 66, 88)}
  ${diamond(280, 88, 310, 72, ["GPU memory", "running low?"])}
  ${tag(94, 140, "no")}
  ${tag(466, 140, "yes")}
  ${elbow([[188, 114], [116, 114], [116, 160]])}
  ${elbow([[372, 114], [444, 114], [444, 160]])}
  ${box(116, 162, 220, 62, ["Keep allocating —", "more tokens build", "more notes"])}
  ${box(444, 162, 220, 62, ["Evict cold blocks", "(LRU purges the", "lonely ones)"])}
  ${elbow([[116, 224], [164, 224], [164, 252]])}
  ${elbow([[444, 224], [396, 224], [396, 252]])}
  ${box(280, 252, 440, 52, ["Or shrink each block — quantize K/V (q8_0, q4_0)"])}
  ${arrowDown(280, 304, 326)}
  ${box(280, 326, 340, 42, ["More requests fit in the good memory"])}`;
  return wfSvg(inner, { h: 384, label: "what KV growth does to memory" });
}

// ch7 — Ollama keeps the model warm for a while.
function wfKeepAlive() {
  const inner = `
  ${box(280, 22, 320, 40, ["Your prompt arrives"])}
  ${arrowDown(280, 62, 84)}
  ${diamond(280, 84, 330, 72, ["Model still", "in VRAM?"])}
  ${tag(100, 136, "yes")}
  ${tag(460, 136, "no")}
  ${elbow([[194, 110], [122, 110], [122, 156]])}
  ${elbow([[366, 110], [438, 110], [438, 156]])}
  ${box(122, 158, 220, 60, ["Warm cache", "fast first token"])}
  ${box(438, 158, 220, 60, ["Cold start", "model must load again"])}
  ${elbow([[122, 218], [168, 218], [168, 246]])}
  ${elbow([[438, 218], [392, 218], [392, 246]])}
  ${box(280, 248, 400, 46, ["Answer — model stays loaded for a while"])}
  ${arrowDown(280, 294, 316)}
  ${box(280, 316, 360, 42, ["Unloaded after keep_alive — default ~5 min"])}`;
  return wfSvg(inner, { h: 376, label: "keep_alive keeps the model warm" });
}

// ch8 — building a prompt with a stable, cache-friendly prefix.
function wfPromptFlow() {
  const inner = `
  ${box(280, 22, 240, 40, ["Build your request"])}
  ${arrowDown(280, 62, 84)}
  ${box(280, 84, 390, 42, ["Static system prompt first (unchanging)"])}
  ${arrowDown(280, 126, 148)}
  ${box(280, 148, 360, 42, ["Append turns in conversation order"])}
  ${arrowDown(280, 190, 212)}
  ${box(280, 212, 430, 42, ["Serialize data deterministically (sort_keys)"])}
  ${arrowDown(280, 254, 276)}
  ${diamond(280, 276, 310, 72, ["Dynamic junk", "in the prefix?"])}
  ${tag(94, 328, "no")}
  ${tag(466, 328, "yes")}
  ${elbow([[188, 302], [116, 302], [116, 348]])}
  ${elbow([[372, 302], [444, 302], [444, 348]])}
  ${box(116, 350, 224, 46, ["Stable prefix —", "cache hits"])}
  ${box(444, 350, 222, 46, ["Move it late or", "cache_control it"])}`;
  return wfSvg(inner, { h: 418, label: "building a cache-friendly prompt" });
}

// ch9 — cache-aware routing across a serving cluster.
function wfScheduling() {
  const inner = `
  ${box(280, 22, 300, 40, ["Request arrives at the cluster"])}
  ${arrowDown(280, 62, 84)}
  ${box(280, 84, 480, 42, ["Global index: a hash map over the KV pool"])}
  ${arrowDown(280, 126, 148)}
  ${diamond(280, 148, 320, 72, ["Your prefix cached", "anywhere?"])}
  ${tag(92, 200, "yes")}
  ${tag(468, 200, "no")}
  ${elbow([[186, 174], [114, 174], [114, 220]])}
  ${elbow([[374, 174], [446, 174], [446, 220]])}
  ${box(114, 222, 230, 60, ["Route to that replica", "p90 TTFT 0.54 s"])}
  ${box(446, 222, 222, 60, ["Cache-blind routing", "57×–170× slower"])}
  ${elbow([[114, 282], [160, 282], [160, 306]])}
  ${elbow([[446, 282], [400, 282], [400, 306]])}
  ${box(280, 308, 320, 40, ["Hit rate is the fuel gauge"])}`;
  return wfSvg(inner, { h: 368, label: "cache-aware request routing" });
}

// ch10 — your thirty-day prefix-cache plan.
function wfThirtyDays() {
  const inner = `
  ${box(280, 22, 280, 40, ["Day 1 — measure your hit rate"])}
  ${arrowDown(280, 62, 84)}
  ${box(280, 84, 280, 42, ["Week 1 · meet your meter"])}
  ${arrowDown(280, 126, 148)}
  ${box(280, 148, 360, 42, ["Week 2 · one prompt surgery at a time"])}
  ${arrowDown(280, 190, 212)}
  ${box(280, 212, 320, 42, ["Week 3 · keep the cache warm"])}
  ${arrowDown(280, 254, 276)}
  ${box(280, 276, 380, 42, ["Day 30 — check stable prefix + warm cache"])}
  ${arrowDown(280, 318, 340)}
  ${box(280, 340, 320, 40, ["It becomes a reflex, not a number"])}`;
  return wfSvg(inner, { h: 396, label: "a thirty-day prefix-cache plan" });
}

// ---------------------------------------------------------------- DGX Spark diagrams
// Top-down flows for the desktop petaFLOP machine — the GB10 superchip, the
// dual-Spark cluster link, a first local model serve, and the private agent.

// gb10-flow — one prompt's journey through the Grace CPU, the unified pool,
// and the Blackwell GPU.
function wfGB10Flow() {
  const inner = `
  ${box(280, 22, 460, 46, ["Your prompt lands on the Grace CPU", "(20 Arm cores handle setup and routing)"])}
  ${arrowDown(280, 68, 90)}
  ${box(280, 90, 480, 44, ["CPU loads the model + input into the shared 128 GB pool"])}
  ${arrowDown(280, 134, 156)}
  ${box(280, 156, 480, 44, ["Blackwell GPU reads straight from that same memory"])}
  ${arrowDown(280, 200, 222)}
  ${box(280, 222, 480, 58, ["GPU computes — huge FP4 bursts — and writes", "token-by-token answers back to the pool"])}
  ${arrowDown(280, 280, 302)}
  ${box(280, 302, 340, 40, ["CPU hands you the finished answer"])}`;
  return wfSvg(inner, { h: 358, label: "one prompt's trip through the GB10 superchip" });
}

// two-sparks — when one Spark isn't enough, link a second over ConnectX-7.
function wfTwoSparks() {
  const inner = `
  ${box(280, 22, 440, 44, ["Your model runs on one Spark (up to ~200B)"])}
  ${arrowDown(280, 66, 88)}
  ${diamond(280, 88, 330, 72, ["Model needs", "more room?"])}
  ${tag(94, 140, "no")}
  ${tag(466, 140, "yes")}
  ${elbow([[194, 114], [124, 114], [124, 160]])}
  ${elbow([[366, 114], [436, 114], [436, 160]])}
  ${box(124, 162, 196, 62, ["Stay single —", "it's already a", "desk supercomputer"])}
  ${box(436, 162, 198, 62, ["Link a second Spark", "over ConnectX-7", "(200 Gbps NIC)"])}
  ${elbow([[124, 224], [172, 224], [172, 254]])}
  ${elbow([[436, 224], [388, 224], [388, 254]])}
  ${box(280, 254, 480, 46, ["NCCL / RDMA coordinate — both GPUs compute as one"])}
  ${arrowDown(280, 300, 322)}
  ${box(280, 322, 460, 44, ["Two Sparks: ~405B · four Sparks: ~700B parameters"])}`;
  return wfSvg(inner, { h: 384, label: "scaling up from one Spark to a linked pair" });
}

// serve-model — Docker one-liner to a ready OpenAI-compatible API.
function wfServeModel() {
  const inner = `
  ${box(280, 22, 420, 42, ["Docker comes preinstalled on DGX OS"])}
  ${arrowDown(280, 64, 86)}
  ${box(280, 86, 480, 44, ["One command: docker run lmsysorg/sglang:spark …"])}
  ${arrowDown(280, 130, 152)}
  ${box(280, 152, 460, 44, ["Model drops into the 128 GB unified memory"])}
  ${arrowDown(280, 196, 218)}
  ${box(280, 218, 460, 46, ["OpenAI-compatible API answers on port 30000"])}
  ${arrowDown(280, 264, 286)}
  ${box(280, 286, 460, 44, ["Curl the API — or chat via Ollama / Open WebUI"])}`;
  return wfSvg(inner, { h: 348, label: "from one command to your first local chat" });
}

// local-agent — the always-on agent's private loop: data never leaves.
function wfLocalAgent() {
  const inner = `
  ${box(280, 22, 400, 42, ["Always-on agent starts (data lives locally)"])}
  ${arrowDown(280, 64, 86)}
  ${box(280, 86, 480, 44, ["RAG: indexes your private docs & code on the Spark"])}
  ${arrowDown(280, 130, 152)}
  ${box(280, 152, 480, 46, ["Agent thinks with a local LLM + local tools"])}
  ${arrowDown(280, 198, 220)}
  ${diamond(280, 220, 320, 70, ["Need more", "context?"])}
  ${tag(94, 272, "yes")}
  ${tag(466, 272, "no")}
  ${elbow([[190, 255], [124, 255], [124, 108]])}
  ${elbow([[370, 272], [430, 272], [430, 334]])}
  ${box(430, 336, 200, 46, ["Answer — your data", "never left the room"])}`;
  return wfSvg(inner, { h: 400, label: "an always-on local agent's private loop" });
}

// ---------------------------------------------------------------- Unsloth Studio diagrams
// Top-down flows for fine-tuning on the desk cube: the whole journey at a
// glance, one Studio training run's lifecycle, and the two serve doors for
// your exported LoRA adapter.

// studio-pipeline — the big picture, from data to a served fine-tune.
function wfStudioPipeline() {
  const inner = `
  ${box(280, 22, 440, 44, ["Your training data (QA pairs, or a data recipe)"])}
  ${arrowDown(280, 66, 88)}
  ${box(280, 88, 490, 44, ["Unsloth Studio: pick a model, QLoRA 4-bit", "(only ~1% of weights get trained)"])}
  ${arrowDown(280, 132, 154)}
  ${box(280, 154, 400, 44, ["Train — checkpoints save automatically as you go"])}
  ${arrowDown(280, 198, 220)}
  ${box(280, 220, 420, 44, ["Pick the checkpoint with the lowest loss"])}
  ${arrowDown(280, 264, 286)}
  ${box(280, 286, 430, 44, ["Export the tiny LoRA adapter (~100 MB)"])}
  ${arrowDown(280, 330, 352)}
  ${box(280, 352, 420, 44, ["Serve it: vLLM · llama.cpp · Ollama"])}`;
  return wfSvg(inner, { h: 414, label: "the whole fine-tune journey at a glance" });
}

// studio-run — the lifecycle of one training run inside the Studio.
function wfStudioRun() {
  const inner = `
  ${box(280, 22, 440, 44, ["Upload your data — or run a recipe to refine it first"])}
  ${arrowDown(280, 66, 88)}
  ${box(280, 88, 380, 44, ["Pick the model + QLoRA (4-bit) training"])}
  ${arrowDown(280, 132, 154)}
  ${box(280, 154, 500, 44, ["Set a few dials: lr 2e-4 · batch 2 · gradient accum 4"])}
  ${arrowDown(280, 198, 220)}
  ${box(280, 220, 420, 48, ["Press train — watch the loss fall over hours", "(a 3,114-pair LoRA ran ~7 hours first try)"])}
  ${arrowDown(280, 268, 290)}
  ${box(280, 290, 420, 44, ["Checkpoints save along the way"])}
  ${arrowDown(280, 334, 356)}
  ${box(280, 356, 390, 42, ["Lowest loss wins — export that checkpoint"])}`;
  return wfSvg(inner, { h: 416, label: "lifecycle of one Studio training run" });
}

// deploy-lora — the two serve doors after you export your LoRA adapter.
function wfDeployLora() {
  const inner = `
  ${box(280, 22, 360, 42, ["Export the LoRA adapter (~100 MB)"])}
  ${arrowDown(280, 64, 86)}
  ${diamond(280, 86, 320, 72, ["Many users", "at once?"])}
  ${tag(92, 138, "yes")}
  ${tag(468, 138, "no")}
  ${elbow([[190, 112], [118, 112], [118, 156]])}
  ${elbow([[370, 112], [442, 112], [442, 156]])}
  ${box(118, 158, 224, 62, ["vLLM — serve with --enable-lora,", "swap adapters by name per request"])}
  ${box(442, 158, 222, 62, ["llama.cpp — convert LoRA to GGUF,", "best for one request at a time"])}
  ${elbow([[118, 220], [164, 220], [164, 246]])}
  ${elbow([[442, 220], [396, 220], [396, 246]])}
  ${box(280, 248, 420, 44, ["Chat with your fine-tune — Ollama · Open WebUI"])}`;
  return wfSvg(inner, { h: 310, label: "from a trained adapter to your own model" });
}

// ---------------------------------------------------------------- vLLM for Newbies diagrams
// Top-down flows for the vLLM beginner path: a prompt's token life, the
// continuous-batching superpower, standing up the server, going production,
// and the warmup-benchmark-tune loop.

// vllm-prompt — the life of one prompt, token by token (chapter 2).
function wfVllmPrompt() {
  const inner = `
  ${box(280, 22, 340, 42, ["Your prompt arrives — the whole text at once"])}
  ${arrowDown(280, 64, 86)}
  ${box(280, 86, 500, 58, ["Prefill — the engine reads every token in parallel", "and builds the KV cache (K and V notes)"])}
  ${arrowDown(280, 144, 166)}
  ${box(280, 166, 330, 46, ["KV cache — the model's short-term memory"])}
  ${arrowDown(280, 212, 234)}
  ${box(280, 234, 470, 58, ["Decode — one new token at a time; sampling", "picks each with temperature & top_p"])}
  ${arrowDown(280, 292, 314)}
  ${box(280, 314, 250, 40, ["Answer streams back to you"])}`;
  return wfSvg(inner, { h: 372, label: "the life of one prompt, token by token" });
}

// vllm-batching — how continuous batching fills every slot (chapter 4).
function wfVllmBatching() {
  const inner = `
  ${box(280, 22, 330, 42, ["Many users ask at the same moment"])}
  ${arrowDown(280, 64, 86)}
  ${box(280, 86, 460, 44, ["Scheduler packs them into one running batch"])}
  ${arrowDown(280, 130, 152)}
  ${box(280, 152, 530, 58, ["Batch members sit at different stages — one still", "prefilling, two decoding, one already done"])}
  ${arrowDown(280, 210, 232)}
  ${box(280, 232, 510, 58, ["Finished tokens leave and their slot is refilled by", "the next queued request — nobody idles"])}
  ${arrowDown(280, 290, 312)}
  ${box(280, 312, 360, 42, ["Result: thousands of tokens per second"])}`;
  return wfSvg(inner, { h: 372, label: "continuous batching keeps every slot busy" });
}

// vllm-serve — from install to a live OpenAI-compatible endpoint (chapter 5).
function wfVllmServe() {
  const inner = `
  ${box(280, 22, 340, 42, ["Install: uv pip install vllm"])}
  ${arrowDown(280, 64, 86)}
  ${box(280, 86, 500, 44, ["One command: vllm serve Qwen/Qwen2.5-1.5B-Instruct"])}
  ${arrowDown(280, 130, 152)}
  ${box(280, 152, 400, 44, ["OpenAI-compatible API on http://localhost:8000"])}
  ${arrowDown(280, 196, 218)}
  ${box(280, 218, 480, 58, ["Curl it — or use the OpenAI Python SDK", "(same client, just point base_url at :8000)"])}
  ${arrowDown(280, 276, 298)}
  ${box(280, 298, 330, 42, ["Your own private chat & completions"])}`;
  return wfSvg(inner, { h: 358, label: "standing up vLLM with one command" });
}

// vllm-prod — the toy server grows up: auth, metrics, privacy (chapter 9).
function wfVllmProd() {
  const inner = `
  ${box(280, 22, 330, 42, ["Local server answers on localhost:8000"])}
  ${arrowDown(280, 64, 86)}
  ${box(280, 86, 430, 44, ["Protect it — --api-key or VLLM_API_KEY"])}
  ${arrowDown(280, 130, 152)}
  ${box(280, 152, 470, 44, ["Watch it — metrics & monitoring keep it healthy"])}
  ${arrowDown(280, 196, 218)}
  ${box(280, 218, 470, 44, ["Any app calls it — requests in, JSON answers out"])}
  ${arrowDown(280, 262, 284)}
  ${box(280, 284, 430, 44, ["Your data and keys never leave your machine"])}`;
  return wfSvg(inner, { h: 346, label: "from toy server to production app" });
}

// vllm-bench — warmup, measure, tune: the throughput loop (chapter 10).
function wfVllmBench() {
  const inner = `
  ${box(280, 29, 460, 48, ["First start — engine loads the model", "and builds CUDA graphs / warms workers"])}
  ${arrowDown(280, 77, 99)}
  ${box(280, 99, 400, 44, ["Warm-up — a few demo prompts wake the GPU"])}
  ${arrowDown(280, 143, 165)}
  ${box(280, 165, 440, 44, ["Benchmark — send N prompts, read tokens/sec"])}
  ${arrowDown(280, 209, 231)}
  ${diamond(280, 231, 320, 72, ["Throughput what", "you hoped?"])}
  ${tag(98, 283, "yes")}
  ${tag(462, 283, "no")}
  ${elbow([[192, 259], [118, 259], [118, 304]])}
  ${elbow([[368, 259], [442, 259], [442, 304]])}
  ${box(118, 306, 214, 58, ["Ship it — tune batch", "size and move on"])}
  ${box(442, 306, 212, 58, ["Tune — batch size,", "quantization, GPUs"])}`;
  return wfSvg(inner, { h: 384, label: "warm up, benchmark, then tune" });
}

// ---------------------------------------------------------------- AI coding agents diagrams
// Top-down flows for the token-mastery book: the quadratic rebill trap,
// context-window budgeting, five loop constraints, compounding guardrails,
// and the measure-compare-tune meter loop.

// agent-quadratic — naive full-context loop vs a constrained loop (chapter 3).
function wfAgentQuadratic() {
  const inner = `
  ${box(132, 20, 216, 44, ["Naive loop", "history re-billed every step"])}
  ${box(404, 20, 212, 44, ["Constrained loop", "narrow context per step"])}
  ${arrowDown(132, 64, 86)}
  ${arrowDown(404, 64, 86)}
  ${box(132, 86, 220, 40, ["Step 1 + full history"])}
  ${box(404, 86, 220, 40, ["Step 1 only — scoped input"])}
  ${arrowDown(132, 126, 148)}
  ${arrowDown(404, 126, 148)}
  ${box(132, 148, 220, 48, ["Step 2 re-sends it all", "3,400 tokens"])}
  ${box(404, 148, 220, 48, ["Step 2 stays lean", "~1,000 tokens"])}
  ${arrowDown(132, 196, 218)}
  ${arrowDown(404, 196, 218)}
  ${box(132, 218, 220, 48, ["Step 3 — everything again", "8,900 tokens and climbing"])}
  ${box(404, 214, 224, 52, ["Step 3 keeps the same", "lean footprint"])}
  ${arrowDown(132, 266, 288)}
  ${arrowDown(404, 260, 280)}
  ${box(132, 288, 214, 52, ["Quadratic growth", "10 steps cost ~40x"])}
  ${box(404, 280, 238, 46, ["Linear growth", "10 steps cost ~10x"])}`;
  return wfSvg(inner, { h: 348, label: "naive loops re-bill history; constrained loops stay narrow" });
}

// agent-context — keep the window under 60-70% and start fresh per task (chapter 4).
function wfAgentContext() {
  const inner = `
  ${box(280, 20, 460, 44, ["A long session fills the context window"])}
  ${arrowDown(280, 64, 86)}
  ${box(280, 86, 480, 44, ["Over ~60-70% full: middle content fades,", "recency bias wins, guardrails slip"])}
  ${arrowDown(280, 130, 152)}
  ${diamond(280, 152, 380, 74, ["Task still", "in progress?"])}
  ${tag(118, 206, "just started")}
  ${tag(442, 206, "long past")}
  ${elbow([[184, 176], [114, 172], [114, 244]])}
  ${elbow([[376, 176], [446, 172], [446, 244]])}
  ${box(114, 246, 210, 44, ["Fresh window", "/clear + start again"])}
  ${box(446, 246, 214, 46, ["Compact once at a phase", "boundary — then reset"])}
  ${arrowDown(114, 258, 288)}
  ${arrowDown(446, 292, 314)}
  ${box(280, 320, 430, 40, ["Clean context \u2192 better answers, fewer tokens"])}`;
  return wfSvg(inner, { h: 378, label: "keep context lean and start fresh per task" });
}

// agent-constrain — five patterns that break quadratic cost curves (chapter 8).
function wfAgentConstrain() {
  const inner = `
  ${box(260, 20, 426, 44, ["Agent loop growing context", "and cost every step"])}
  ${arrowDown(260, 64, 104)}
  ${diamond(260, 104, 470, 60, ["Constrain the context before it compounds"])}
  ${arrowDown(132, 132, 162)}
  ${arrowDown(388, 134, 162)}
  ${box(132, 164, 202, 44, ["Trim tool outputs", "cuts up to ~22%"])}
  ${box(388, 164, 222, 44, ["Split into scoped subagents", "each with its own window"])}
  ${arrowDown(132, 208, 230)}
  ${box(132, 230, 212, 40, ["State reset at phase", "boundaries — fresh context"])}
  ${arrowDown(238, 270, 290)}
  ${box(238, 290, 208, 42, ["Summarize only at", "clear phase splits"])}
  ${arrowDown(388, 208, 230)}
  ${box(388, 230, 216, 102, ["Combine patterns for", "compounding savings on", "long multi-domain loops"])}
  ${arrowDown(342, 332, 352)}
  ${box(342, 354, 252, 40, ["Result: flat cost curve,", "better answers on hard tasks"])}`;
  return wfSvg(inner, { h: 404, label: "five patterns that constrain an agent loop" });
}

// agent-guard — deterministic controls reset the compounding error rate (chapter 9).
function wfAgentGuard() {
  const inner = `
  ${box(280, 22, 420, 42, ["Agent ships a change"])}
  ${arrowDown(280, 64, 86)}
  ${box(280, 86, 390, 40, ["Tests, linters, type checks", "run deterministically"])}
  ${arrowDown(280, 126, 148)}
  ${diamond(280, 148, 280, 68, ["All", "pass?"])}
  ${tag(128, 198, "no")}
  ${tag(432, 198, "yes")}
  ${elbow([[200, 176], [124, 176], [124, 248]])}
  ${box(124, 248, 120, 46, ["Fix the bug,", "re-run"])}
  ${elbow([[346, 148], [446, 150], [446, 270]])}
  ${box(446, 206, 90, 34, ["Merge", "now"])}
  ${arrowDown(124, 240, 232)}
  ${arrowDown(446, 258, 290)}
  ${box(446, 292, 186, 40, ["Error rate reset", "to zero"])}
  ${arrowDown(132, 240, 228)}
  ${box(132, 294, 104, 48, ["Loops", "compound"])}`;
  return wfSvg(inner, { h: 360, label: "tests and checks reset the compounding error rate" });
}

// agent-meter — measure, compare, tune: the monitoring loop (chapter 10).
function wfAgentMeter() {
  const inner = `
  ${box(280, 24, 420, 44, ["Turn the meter on — status line", "shows context %, tokens in/out"])}
  ${arrowDown(280, 68, 90)}
  ${box(280, 90, 400, 40, ["Track tokens per task, cost per", "completion, loop iterations"])}
  ${arrowDown(280, 130, 152)}
  ${diamond(280, 152, 300, 66, ["Usage at 2x", "baseline?"])}
  ${tag(116, 292, "normal")}
  ${tag(444, 200, "spike")}
  ${elbow([[196, 176], [112, 172], [112, 232]])}
  ${box(112, 232, 156, 40, ["Watch & log —", "share with the team"])}
  ${elbow([[364, 176], [448, 176], [448, 238]])}
  ${box(448, 238, 176, 44, ["Find the loop — trim", "context, scope tools"])}
  ${arrowDown(112, 272, 296)}
  ${arrowDown(448, 282, 304)}
  ${box(112, 296, 176, 36, ["Keep measuring —", "habit beats budget"])}
  ${box(448, 302, 180, 36, ["A spike caught early", "pays for the hour"])}`;
  return wfSvg(inner, { h: 356, label: "measure, compare, tune: the monitoring loop" });
}

// video book — HyperFrames pipeline diagrams (Automated Video Editing book).

// hf-render — the four-step render pipeline from HTML to MP4 (chapter 2).
function wfHfRender() {
  const inner = `
  ${box(280, 20, 420, 48, ["Agent-generated HTML, CSS and JS", "— a scene, not a timeline"])}
  ${arrowDown(280, 68, 90)}
  ${box(280, 90, 460, 50, ["A headless browser loads the scene", "and steps the clock frame by frame"])}
  ${arrowDown(280, 140, 162)}
  ${box(280, 162, 460, 44, ["Each frame is captured in sequence:", "10 s at 30 fps = exactly 300 frames"])}
  ${arrowDown(280, 206, 228)}
  ${box(280, 228, 400, 44, ["FFmpeg compiles the frames", "into MP4, MOV or WebM"])}
  ${arrowDown(280, 272, 294)}
  ${box(280, 294, 320, 38, ["Same code, same video — every time"])}`;
  return wfSvg(inner, { h: 342, label: "the four-step render pipeline from HTML to MP4" });
}

// hf-scene — a scene is a webpage: one DOM, many frames (chapter 5).
function wfHfScene() {
  const inner = `
  ${box(280, 20, 440, 48, ["One scene: DOM elements with timing attributes,", "styled with CSS, animated with GSAP"])}
  ${arrowDown(280, 68, 90)}
  ${box(280, 90, 380, 40, ["The clock steps: frame 0, 1, 2, ... 300"])}
  ${arrowDown(112, 130, 152)}
  ${arrowDown(280, 130, 152)}
  ${arrowDown(448, 130, 152)}
  ${box(112, 152, 152, 44, ["Frame 000", "title starts to slide in"])}
  ${box(280, 152, 152, 44, ["Frame 150", "mid-animation"])}
  ${box(448, 152, 152, 44, ["Frame 300", "the final hold"])}
  ${arrowDown(112, 196, 218)}
  ${arrowDown(280, 196, 218)}
  ${arrowDown(448, 196, 218)}
  ${box(280, 218, 470, 44, ["No wall clock, no dropped frames —", "the same frames, on every render"])}
  ${arrowDown(280, 262, 284)}
  ${box(280, 284, 380, 38, ["A scene you can read, tweak and diff like code"])}`;
  return wfSvg(inner, { h: 332, label: "a scene is a webpage: one DOM, many frames" });
}

// hf-motion — from plain-language brief to rendered clip (chapter 6).
function wfHfMotion() {
  const inner = `
  ${box(280, 20, 440, 48, ["\u201CFade the company name in from the left,", "set the tagline beneath it, four seconds\u201D"])}
  ${arrowDown(280, 68, 90)}
  ${box(280, 90, 460, 44, ["The agent translates the brief into structured calls:", "element type, timing, style, position"])}
  ${arrowDown(280, 134, 156)}
  ${box(280, 156, 400, 40, ["Builds the composition, then triggers a render"])}
  ${arrowDown(280, 196, 218)}
  ${box(280, 218, 380, 40, ["A real .mp4 clip — ready to drop on a timeline"])}`;
  return wfSvg(inner, { h: 266, label: "from plain-language brief to rendered clip" });
}

// hf-pipeline — one prompt, whole video: the chained skills (chapter 8).
function wfHfPipeline() {
  const inner = `
  ${box(280, 20, 400, 44, ["One prompt: \u201Cpost-produce this video\u201D"])}
  ${arrowDown(280, 64, 86)}
  ${box(180, 86, 240, 44, ["Skill 1 · motion graphic", "the branded intro clip"])}
  ${arrowDown(180, 130, 152)}
  ${box(180, 152, 240, 44, ["Skill 2 · overlays", "time-coded lower thirds"])}
  ${arrowDown(180, 196, 218)}
  ${box(180, 218, 240, 44, ["Skill 3 · captions", "synced from the transcript"])}
  ${arrowDown(180, 262, 284)}
  ${box(180, 284, 250, 48, ["Composite: source footage +", "intro + overlays + captions"])}
  ${arrowDown(180, 332, 354)}
  ${box(180, 354, 300, 38, ["One finished MP4 — or a whole batch of them"])}
  ${box(452, 152, 190, 44, ["Source video, transcript", "and the brand style file"])}
  ${elbow([[452, 196], [452, 308], [336, 308]])}`;
  return wfSvg(inner, { h: 402, label: "one prompt, whole video: the chained pipeline" });
}

// hf-review — keep a human at the review gate (chapter 10).
function wfHfReview() {
  const inner = `
  ${box(280, 20, 380, 44, ["A render comes back —", "an MP4, not a promise"])}
  ${arrowDown(280, 64, 86)}
  ${diamond(280, 86, 340, 74, ["A human previews it:", "does it look right?"])}
  ${tag(118, 148, "approve")}
  ${tag(442, 148, "revise")}
  ${elbow([[172, 118], [112, 118], [112, 190]])}
  ${elbow([[388, 118], [448, 118], [448, 190]])}
  ${box(112, 192, 190, 44, ["Ship it — post to Slack,", "the channel, the client"])}
  ${box(448, 192, 210, 44, ["The feedback becomes the next", "instruction — render again"])}
  ${elbow([[448, 236], [532, 236], [532, 42], [462, 42]])}
  ${arrowDown(112, 236, 258)}
  ${box(112, 258, 190, 38, ["Versioned, approved, done"])}`;
  return wfSvg(inner, { h: 312, label: "keep a human at the review gate" });
}

// ---------------------------------------------------------------- harness book diagrams

function wfDshSetup() {
  let out = "";
  out += box(280, 18, 440, 46, ["Install Node.js 22+ and create your DeepSeek API key"]);
  out += arrowDown(280, 64, 86);
  out += box(280, 88, 440, 46, ["Launch with one command: npx @deepseek-ai/dsh web"]);
  out += arrowDown(280, 134, 156);
  out += box(280, 158, 440, 52, ["The Web UI opens at 127.0.0.1:3080", "create a workspace and pick a model"]);
  out += arrowDown(280, 210, 232);
  out += box(280, 234, 440, 46, ["Start your first session with a small coding task"]);
  return wfSvg(out, { h: 300, label: "first run: from an empty terminal to the Web UI" });
}

function wfDshPlugin() {
  let out = "";
  out += box(280, 18, 440, 46, ["You don't rewrite the harness — you swap its capabilities"]);
  out += arrowDown(280, 64, 86);
  out += box(280, 88, 380, 54, ["The Cordis kernel", "mounts, unmounts, and wires the plugins"], { fill: P.terra });
  out += elbow([[280, 142], [280, 164], [112, 164], [112, 186]]);
  out += arrowDown(280, 142, 186);
  out += elbow([[280, 142], [280, 164], [448, 164], [448, 186]]);
  out += box(112, 188, 184, 52, ["Swap the model", "DeepSeek, OpenAI, Anthropic, or local"], { size: 11.5 });
  out += box(280, 188, 184, 52, ["Swap the tools", "shell, files, web search, vision"], { size: 11.5 });
  out += box(448, 188, 184, 52, ["Swap the UI", "Web UI, TUI plugin, headless"], { size: 11.5 });
  out += elbow([[112, 240], [112, 262], [280, 262]]);
  out += arrowDown(280, 240, 262);
  out += elbow([[448, 240], [448, 262], [280, 262]]);
  out += box(280, 264, 420, 48, ["Same source code, different behavior —", "changed entirely through configuration"]);
  return wfSvg(out, { h: 330, label: "plugin swap: configuration over source code" });
}

function wfDshModes() {
  let out = "";
  out += box(280, 18, 380, 40, ["Pick a runtime mode"]);
  out += arrowDown(280, 58, 96);
  out += path("M88 96 H496", { c: P.sand, w: 2 });
  const cs = [88, 224, 360, 496];
  for (const cx of cs) out += arrowDown(cx, 96, 128);
  out += box(88, 130, 120, 64, ["Standard", "the full toolset"], { size: 11.5 });
  out += box(224, 130, 120, 64, ["Code", "tools as one program"], { size: 11.5 });
  out += box(360, 130, 120, 64, ["Minimal", "two tools, benchmarks"], { size: 11.5 });
  out += box(496, 130, 120, 64, ["Creator", "build your own preset"], { size: 11.5 });
  out += elbow([[88, 194], [88, 224], [280, 224]]);
  out += arrowDown(224, 194, 224);
  out += arrowDown(360, 194, 224);
  out += elbow([[496, 194], [496, 224], [280, 224]]);
  out += box(280, 226, 440, 46, ["Same core, different toolsets —", "swapped by configuration, not by code"]);
  return wfSvg(out, { h: 292, label: "four runtime modes over one core" });
}

function wfDshTrajectory() {
  let out = "";
  out += box(280, 18, 460, 46, ["Every run writes an append-only log:", "prompts, reasoning, tool calls, context"]);
  out += arrowDown(280, 64, 86);
  out += box(280, 88, 400, 52, ["The Trajectory view", "inspect any event by source, with timing and tokens"]);
  out += arrowDown(280, 140, 162);
  out += path("M120 162 H440", { c: P.sand, w: 2 });
  out += arrowDown(120, 162, 194);
  out += arrowDown(280, 162, 194);
  out += arrowDown(440, 162, 194);
  out += box(120, 196, 168, 52, ["Resume", "jump back into the same stream"], { size: 11.5 });
  out += box(280, 196, 168, 52, ["Fork", "branch a new session off it"], { size: 11.5 });
  out += box(440, 196, 168, 52, ["Search and replay", "step through any run again"], { size: 11.5 });
  out += elbow([[120, 248], [120, 270], [280, 270]]);
  out += arrowDown(280, 248, 270);
  out += elbow([[440, 248], [440, 270], [280, 270]]);
  out += box(280, 272, 420, 44, ["All four operate on the same event stream"]);
  return wfSvg(out, { h: 336, label: "the append-only session log and its operations" });
}

function wfDshShip() {
  let out = "";
  out += box(280, 18, 420, 46, ["A session that ships: scope it down first"]);
  out += arrowDown(280, 64, 86);
  out += box(280, 88, 420, 46, ["Set permissions: read-only up to full access"]);
  out += arrowDown(280, 134, 156);
  out += diamond(280, 158, 340, 66, ["A shell or file action?", "an explicit approval gate"]);
  out += tag(150, 200, "approved");
  out += tag(410, 200, "denied");
  out += elbow([[110, 191], [110, 240]]);
  out += elbow([[450, 191], [450, 240]]);
  out += box(110, 242, 220, 50, ["Run it — inside the sandbox,", "in Docker, or hosted remotely"]);
  out += box(450, 242, 200, 50, ["Stop and re-plan — the log", "shows exactly where it went wrong"]);
  out += arrowDown(110, 292, 322);
  out += box(110, 324, 220, 44, ["Ship it, or schedule the next run"]);
  out += arrowDown(450, 292, 322);
  out += box(450, 324, 200, 44, ["Feed the fix back into a new turn"]);
  return wfSvg(out, { h: 386, label: "approval gate, sandboxed runs, and the feedback loop" });
}

// ---------------------------------------------------------------- OMP (Oh My Pi) diagrams
// ch3 — the five install doors into one binary.
function wfOmpInstall() {
  let out = "";
  out += box(60, 18, 92, 46, ["curl | sh"], { size: 11.5 });
  out += box(160, 18, 92, 46, ["brew install"], { size: 11.5 });
  out += box(280, 18, 104, 46, ["bun install -g", "recommended"], { size: 11.5 });
  out += box(400, 18, 92, 46, ["nix run"], { size: 11.5 });
  out += box(500, 18, 92, 46, ["irm | iex"], { size: 11.5 });
  out += path("M60 96 H500", { c: P.sand, w: 2 });
  out += elbow([[60, 64], [60, 96]]);
  out += elbow([[160, 64], [160, 96]]);
  out += elbow([[280, 64], [280, 96]]);
  out += elbow([[400, 64], [400, 96]]);
  out += elbow([[500, 64], [500, 96]]);
  out += arrowDown(280, 96, 114);
  out += box(280, 116, 420, 46, ["One native omp binary — Rust core,", "macOS, Linux, and Windows without WSL"]);
  out += arrowDown(280, 162, 184);
  out += box(280, 186, 420, 46, ["First launch: the TUI opens, completions already work"]);
  return wfSvg(out, { h: 256, label: "five install doors into one native binary" });
}

// ch4 — one turn in the TUI.
function wfOmpFirstSession() {
  let out = "";
  out += box(280, 18, 440, 46, ["You describe the task in plain English"]);
  out += arrowDown(280, 64, 86);
  out += box(280, 88, 440, 46, ["The agent plans, then calls tools", "read / grep / edit render as live cards"]);
  out += arrowDown(280, 134, 156);
  out += box(110, 158, 164, 52, ["Reads and searches", "return summarized snippets"], { size: 11.5 });
  out += box(280, 158, 164, 52, ["Edits preview with a", "one-line reason before landing"], { size: 11.5 });
  out += box(450, 158, 164, 52, ["Shell actions ask first", "in an approval gate"], { size: 11.5 });
  out += arrowDown(280, 210, 232);
  out += box(280, 234, 420, 46, ["You accept — the change applies atomically"]);
  out += arrowDown(280, 280, 302);
  out += box(280, 304, 420, 44, ["Session stats track the whole turn"]);
  return wfSvg(out, { h: 364, label: "one turn: prompt, tool cards, preview, accept" });
}

// ch5 — model roles and fallbacks.
function wfOmpRoles() {
  let out = "";
  out += box(280, 18, 300, 44, ["A turn arrives"]);
  out += arrowDown(280, 62, 84);
  out += box(280, 86, 340, 44, ["Model router: pick the role"]);
  out += arrowDown(280, 130, 152);
  out += path("M110 152 H450", { c: P.sand, w: 2 });
  out += arrowDown(110, 152, 174);
  out += arrowDown(280, 152, 174);
  out += arrowDown(450, 152, 174);
  out += box(110, 176, 164, 54, ["default", "everyday work"], { size: 11.5 });
  out += box(280, 176, 164, 54, ["plan / slow", "deep reasoning"], { size: 11.5 });
  out += box(450, 176, 164, 54, ["smol / tiny", "cheap fan-out"], { size: 11.5 });
  out += arrowDown(280, 230, 252);
  out += box(280, 254, 460, 50, ["Behind every role: a fallback chain", "a 429 or quota wall, and the next model takes the turn"]);
  return wfSvg(out, { h: 330, label: "one prompt, many roles, with fallback chains behind each" });
}

// ch6 — hashline editing.
function wfOmpHashline() {
  let out = "";
  out += box(280, 18, 440, 46, ["The agent reads the file and sees hash anchors"]);
  out += arrowDown(280, 64, 86);
  out += box(280, 88, 440, 46, ["The patch points at content hashes,", "not line numbers or retyped text"]);
  out += arrowDown(280, 134, 150);
  out += diamond(280, 150, 300, 66, ["Do the anchors", "still match?"]);
  out += tag(196, 206, "yes");
  out += tag(452, 186, "no");
  out += arrowDown(280, 216, 240);
  out += box(280, 242, 340, 50, ["Applies atomically — the LSP sees", "a clean, semantic change"]);
  out += elbow([[430, 183], [490, 183]]);
  out += box(490, 143, 130, 80, ["Stale file:", "patch rejected before", "it corrupts anything"], { size: 10.5 });
  return wfSvg(out, { h: 316, label: "edit by content hash: anchor, stale-check, apply" });
}

// ch9 — subagent fan-out.
function wfOmpCrew() {
  let out = "";
  out += box(280, 18, 440, 46, ["The parent session splits the job with the task tool"]);
  out += arrowDown(280, 64, 96);
  out += path("M90 96 H470", { c: P.sand, w: 2 });
  out += elbow([[90, 96], [90, 114]]);
  out += elbow([[280, 96], [280, 114]]);
  out += elbow([[470, 96], [470, 114]]);
  out += box(90, 116, 160, 64, ["Worker 1", "its own worktree,", "its own tools"], { size: 11.5 });
  out += box(280, 116, 160, 64, ["Worker 2", "its own worktree,", "its own tools"], { size: 11.5 });
  out += box(470, 116, 160, 64, ["Worker N", "isolated from", "its siblings"], { size: 11.5 });
  out += path("M90 210 H470", { c: P.sand, w: 2 });
  out += elbow([[90, 180], [90, 210]]);
  out += elbow([[280, 180], [280, 210]]);
  out += elbow([[470, 180], [470, 210]]);
  out += arrowDown(280, 210, 232);
  out += box(280, 234, 460, 50, ["Typed, schema-validated results —", "no prose to parse, no merge conflicts"]);
  out += arrowDown(280, 284, 306);
  out += box(280, 308, 420, 44, ["The parent reads them directly and moves on"]);
  return wfSvg(out, { h: 370, label: "fan out subagents into isolated worktrees, read typed results" });
}

// ---------------------------------------------------------------- registry

const WORKFLOWS = {
  "five-minute": { title: "The same request twice — hit vs miss", draw: wfFiveMinute },
  "two-phases": { title: "Prefill builds the KV cache, decode reuses it", draw: wfTwoPhases },
  "cache-hit": { title: "The path of a cache hit", draw: wfCacheHit },
  "autopilot": { title: "vLLM block reuse or compute", draw: wfAutopilot },
  "radix-life": { title: "A request's journey through the radix tree", draw: wfRadixLife },
  "memory-pressure": { title: "What KV growth does to memory", draw: wfMemoryPressure },
  "keep-alive": { title: "keep_alive keeps the model warm", draw: wfKeepAlive },
  "prompt-flow": { title: "Building a cache-friendly prompt", draw: wfPromptFlow },
  "scheduling": { title: "Cache-aware request routing", draw: wfScheduling },
  "thirty-days": { title: "A thirty-day prefix-cache plan", draw: wfThirtyDays },
  "gb10-flow": { title: "One prompt's trip through the GB10 superchip", draw: wfGB10Flow },
  "two-sparks": { title: "Scaling up from one Spark to a linked pair", draw: wfTwoSparks },
  "serve-model": { title: "From one command to your first local chat", draw: wfServeModel },
  "local-agent": { title: "An always-on local agent's private loop", draw: wfLocalAgent },
  "studio-pipeline": { title: "The whole fine-tune journey at a glance", draw: wfStudioPipeline },
  "studio-run": { title: "Lifecycle of one Studio training run", draw: wfStudioRun },
  "deploy-lora": { title: "From a trained adapter to your own model", draw: wfDeployLora },
  "vllm-prompt": { title: "The life of one prompt, token by token", draw: wfVllmPrompt },
  "vllm-batching": { title: "Continuous batching keeps every slot busy", draw: wfVllmBatching },
  "vllm-serve": { title: "Standing up vLLM with one command", draw: wfVllmServe },
  "vllm-prod": { title: "From toy server to production app", draw: wfVllmProd },
  "vllm-bench": { title: "Warm up, benchmark, then tune", draw: wfVllmBench },
  "agent-quadratic": { title: "Naive loops re-bill history; constrained loops stay narrow", draw: wfAgentQuadratic },
  "agent-context": { title: "Keep context lean and start fresh per task", draw: wfAgentContext },
  "agent-constrain": { title: "Five patterns that constrain an agent loop", draw: wfAgentConstrain },
  "agent-guard": { title: "Tests and checks reset the compounding error rate", draw: wfAgentGuard },
  "agent-meter": { title: "Measure, compare, tune: the monitoring loop", draw: wfAgentMeter },
  "hf-render": { title: "The four-step render pipeline from HTML to MP4", draw: wfHfRender },
  "hf-scene": { title: "A scene is a webpage: one DOM, many frames", draw: wfHfScene },
  "hf-motion": { title: "From plain-language brief to rendered clip", draw: wfHfMotion },
  "hf-pipeline": { title: "One prompt, whole video: the chained pipeline", draw: wfHfPipeline },
  "hf-review": { title: "Keep a human at the review gate", draw: wfHfReview },
  "dsh-setup": { title: "First run: from an empty terminal to the Web UI", draw: wfDshSetup },
  "dsh-plugin": { title: "Plugin swap: configuration over source code", draw: wfDshPlugin },
  "dsh-modes": { title: "Four runtime modes over one core", draw: wfDshModes },
  "dsh-trajectory": { title: "The append-only session log and its operations", draw: wfDshTrajectory },
  "dsh-ship": { title: "Approval gate, sandboxed runs, and the feedback loop", draw: wfDshShip },
  "omp-install": { title: "Five install doors into one native binary", draw: wfOmpInstall },
  "omp-first-session": { title: "One turn: prompt, tool cards, preview, accept", draw: wfOmpFirstSession },
  "omp-roles": { title: "One prompt, many roles, with fallback chains behind each", draw: wfOmpRoles },
  "omp-hashline": { title: "Edit by content hash: anchor, stale-check, apply", draw: wfOmpHashline },
  "omp-crew": { title: "Fan out subagents into isolated worktrees, read typed results", draw: wfOmpCrew },
};

function workflowFigure(name) {
  const entry = WORKFLOWS[name];
  if (!entry) return null;
  return `<figure class="workflow-fig">${entry.draw()}</figure>`;
}

function listWorkflows() {
  return Object.keys(WORKFLOWS).map((name) => ({ name, title: WORKFLOWS[name].title }));
}

module.exports = { workflowFigure, listWorkflows, WORKFLOWS, P };
