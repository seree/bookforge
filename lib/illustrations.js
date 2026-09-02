// BookForge — procedural SVG illustrations.
// Each chapter gets a small line-art "spot illustration" drawn with SVG
// primitives in the book's warm palette (cream paper, terracotta, warm ink).
// No external images, no licensing, fully self-contained in the ebook HTML.
//
// Themes: illustrations are organized per-topic so different books get art
// that actually matches their subject. The default theme is "garden"; a book
// can opt into a theme via manifest.options.illustrationTheme.
"use strict";

const P = {
  ink: "#191917", // warm near-black
  terra: "#B9593D", // terracotta, strong
  soft: "#D97757", // terracotta, soft
  muted: "#6E6C62",
  sand: "#E6E1D5", // hairline
  cream: "#FBF1EC", // accent-soft fill
  leaf: "#7E7434", // olive for foliage hints
};

// ---------------------------------------------------------------- primitives

function path(d, opts = {}) {
  const { c = P.ink, w = 2.5, fill = "none", dash = "" } = opts;
  return `<path d="${d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="${fill}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
}

function circle(cx, cy, r, opts = {}) {
  const { c = P.ink, w = 2.5, fill = "none", dash = "" } = opts;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${c}" stroke-width="${w}" fill="${fill}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
}

function rect(x, y, w, h, opts = {}) {
  const { c = P.ink, rad = 0, fill = "none", lw = 2.5 } = opts;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}" stroke="${c}" stroke-width="${lw}" fill="${fill}"/>`;
}

function svg(inner, opts = {}) {
  const w = opts.w || 320, h = opts.h || 170;
  return `<svg class="illo" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
}

// A pointed leaf, drawn at the origin pointing right, then rotated/placed.
function leaf(x, y, len, opts = {}) {
  const { c = P.ink, rot = 0, w = 2.2, vein = true } = opts;
  const rise = len * 0.3;
  const d = `M0 0 C${len * 0.2} ${-rise * 1.25} ${len * 0.8} ${-rise} ${len} 0 C${len * 0.8} ${rise} ${len * 0.2} ${rise * 1.25} 0 0 Z`;
  let out = path(d, { c, w });
  if (vein) out += path(`M${len * 0.22} 0 L${len * 0.8} 0`, { c, w: w * 0.55 });
  return `<g transform="translate(${x} ${y}) rotate(${rot})">${out}</g>`;
}

function drop(x, y, s, opts = {}) {
  const { c = P.terra, w = 2.4, filled = false } = opts;
  const d = `M${x} ${y - s} C${x + s * 0.72} ${y - s * 0.12} ${x + s * 0.55} ${y + s * 0.55} ${x} ${y + s * 0.72} C${x - s * 0.55} ${y + s * 0.55} ${x - s * 0.72} ${y - s * 0.12} ${x} ${y - s} Z`;
  return path(d, { c, w, fill: filled ? c : "none" });
}

function sun(x, y, r, opts = {}) {
  const { rays = 8, c = P.soft, w = 2.3, inner = false } = opts;
  let out = circle(x, y, r, { c, w });
  if (inner) out += circle(x, y, r * 0.45, { c: P.soft, w: w * 0.7 });
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    const x1 = x + Math.cos(a) * (r + 7), y1 = y + Math.sin(a) * (r + 7);
    const x2 = x + Math.cos(a) * (r + 15), y2 = y + Math.sin(a) * (r + 15);
    out += path(`M${x1} ${y1} L${x2} ${y2}`, { c, w: w * 0.8 });
  }
  return out;
}

function pot(cx, bottomY, opts = {}) {
  const { w = 60, h = 36, rim = 8, c = P.terra } = opts;
  const yTop = bottomY - h;
  const inset = w * 0.14;
  const body = `M${cx - w / 2} ${yTop} L${cx + w / 2} ${yTop} L${cx + w / 2 - inset} ${bottomY} L${cx - w / 2 + inset} ${bottomY} Z`;
  const rimLine = `M${cx - w / 2 - rim * 0.5} ${yTop} L${cx + w / 2 + rim * 0.5} ${yTop}`;
  return path(body, { c }) + path(rimLine, { c, w: 3 });
}

function sprout(x, soilY, opts = {}) {
  const { h = 30, c = P.ink, w = 2.6 } = opts;
  const top = soilY - h;
  let out = path(`M${x} ${soilY} C${x + 1} ${soilY - h * 0.5} ${x - 1} ${soilY - h * 0.72} ${x} ${top}`, { c, w });
  out += leaf(x, soilY - h * 0.72, h * 0.52, { c, rot: -55, w });
  out += leaf(x, soilY - h * 0.72, h * 0.52, { c, rot: -125, w });
  return out;
}

function plant(x, soilY, opts = {}) {
  const { h = 50, c = P.ink, w = 2.6 } = opts;
  const top = soilY - h;
  let out = path(`M${x} ${soilY} Q${x + 3} ${soilY - h * 0.6} ${x} ${top}`, { c, w });
  out += leaf(x, soilY - h * 0.38, h * 0.44, { c, rot: -32, w });
  out += leaf(x, soilY - h * 0.52, h * 0.4, { c, rot: -118, w });
  out += leaf(x, soilY - h * 0.7, h * 0.46, { c, rot: -42, w });
  out += leaf(x, soilY - h * 0.82, h * 0.36, { c, rot: -122, w });
  return out;
}

// ---------------------------------------------------------------- garden theme

// 1 · Wait, You Can Garden *Where?* — a windowsill is enough: sun, window, one pot.
function illoWindow() {
  return svg(`
  ${sun(64, 48, 15, { inner: true })}
  ${rect(88, 14, 144, 106, { lw: 3 })}
  ${path("M160 14 L160 120", { c: P.terra, w: 2 })}
  ${path("M88 67 L232 67", { c: P.terra, w: 2 })}
  ${rect(82, 120, 156, 9, { fill: P.cream })}
  ${pot(160, 165, { w: 56, h: 36 })}
  ${plant(160, 129, { h: 52, c: P.terra })}
  ${circle(112, 40, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(200, 86, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 2 · First, Meet Your Light — sunlight pouring through a window onto a seedling.
function illoLight() {
  return svg(`
  ${sun(76, 34, 18, { inner: true })}
  ${path("M56 74 L150 160", { c: P.soft, w: 1.6, dash: "3 8" })}
  ${path("M96 56 L214 160", { c: P.soft, w: 1.6, dash: "3 8" })}
  ${path("M140 48 L278 160", { c: P.soft, w: 1.6, dash: "3 8" })}
  ${rect(40, 16, 240, 128, { lw: 3 })}
  ${path("M160 16 L160 144", { c: P.terra, w: 2 })}
  ${path("M40 80 L280 80", { c: P.terra, w: 2 })}
  ${pot(238, 160, { w: 60, h: 28, c: P.ink })}
  ${sprout(238, 132, { h: 34, c: P.ink })}
  ${circle(96, 116, 4, { c: P.soft, w: 2, fill: P.soft })}
  ${circle(210, 40, 4, { c: P.soft, w: 2, fill: P.soft })}`);
}

// 3 · The Container Starter Kit — three pots, three sizes, three plants.
function illoPots() {
  return svg(`
  ${path("M40 150 L280 150", { c: P.sand, w: 1.6 })}
  ${pot(74, 150, { w: 52, h: 28, c: P.muted })}
  ${sprout(74, 122, { h: 24, c: P.muted })}
  ${pot(164, 150, { w: 68, h: 38 })}
  ${plant(164, 112, { h: 42 })}
  ${pot(254, 150, { w: 58, h: 30, c: P.terra })}
  ${plant(254, 120, { h: 60, c: P.terra })}
  ${circle(30, 34, 3, { c: P.soft, w: 2, fill: P.soft })}
  ${circle(290, 30, 3, { c: P.soft, w: 2, fill: P.soft })}`);
}

// 4 · Get the Dirt Down — a pot cross-section: pebbles, soil strata, mulch, roots.
function illoSoil() {
  return svg(
    `
  <g transform="translate(122 48)">
    ${rect(0, 0, 84, 132, { rad: 8, lw: 3 })}
    ${rect(6, 6, 72, 120, { rad: 6, c: P.cream, lw: 2.4 })}
    ${path("M8 126 L80 126", { c: P.sand, w: 2 })}
    ${circle(26, 120, 7, { c: P.muted, w: 2 })}
    ${circle(46, 123, 9, { c: P.muted, w: 2 })}
    ${circle(66, 118, 6, { c: P.muted, w: 2 })}
    ${path("M12 106 q8 -3 16 0 t16 0 t16 0 t8 0", { c: P.terra, w: 2 })}
    ${path("M12 90 q8 -3 16 0 t16 0 t16 0 t8 0", { c: P.terra, w: 1.8 })}
    ${path("M12 74 q8 -3 16 0 t16 0 t16 0 t8 0", { c: P.terra, w: 1.8 })}
    ${path("M30 126 L30 88 M52 126 L52 78 M68 126 L68 92", { c: P.soft, w: 1.8 })}
    ${path("M8 22 h72 M8 30 h72 M8 14 h40", { c: P.terra, w: 1.8, dash: "2 4" })}
    ${path("M22 64 L22 86 M48 60 L48 82 M62 66 L62 88", { c: P.leaf, w: 2 })}
  </g>
  ${plant(160, 54, { h: 54, c: P.terra })}
  ${circle(300, 34, 3.4, { c: P.soft, w: 2, fill: P.soft })}`,
    { h: 200 }
  );
}

// 5 · Watering Without Murder — gentle drops from a can onto a happy plant.
function illoWater() {
  return svg(`
  ${rect(56, 42, 96, 62, { rad: 16, lw: 3 })}
  ${path("M152 54 C 210 54 230 74 240 88", { c: P.terra, w: 3 })}
  ${path("M240 88 L246 84", { c: P.terra, w: 3 })}
  ${path("M56 66 A 34 34 0 0 1 56 94", { c: P.terra, w: 3 })}
  ${circle(104, 76, 10, { c: P.soft, w: 2 })}
  ${path("M104 88 L104 92 M104 60 L104 64", { c: P.soft, w: 2 })}
  ${drop(212, 116, 7, { w: 2.4 })}
  ${drop(222, 130, 6, { w: 2.4 })}
  ${drop(216, 143, 7, { w: 2.4 })}
  ${drop(232, 128, 5, { w: 2.4 })}
  ${pot(220, 162, { w: 52, h: 26, c: P.ink })}
  ${plant(220, 136, { h: 34, c: P.ink })}
  ${circle(290, 40, 4, { c: P.soft, w: 2, fill: P.soft })}`);
}

// 6 · Seeds, Starts & the Art of Beginning — a packet, a seed, an arrow, a sprout.
function illoSeeds() {
  return svg(`
  ${rect(52, 42, 78, 104, { rad: 6, lw: 3 })}
  ${rect(52, 42, 78, 24, { rad: 6, fill: P.cream, lw: 3 })}
  ${circle(104, 92, 26, { c: P.terra, w: 2, dash: "2 4" })}
  ${circle(104, 92, 5, { c: P.terra, w: 2, fill: P.terra })}
  ${circle(80, 96, 3, { c: P.terra, w: 1.6 })}
  ${circle(126, 88, 3, { c: P.terra, w: 1.6 })}
  ${path("M190 90 q24 8 44 -2", { c: P.sand, w: 3, dash: "5 6" })}
  ${path("M236 88 L244 82", { c: P.ink, w: 3 })}
  ${circle(256, 128, 24, { c: P.terra, w: 2.6 })}
  ${sprout(256, 106, { h: 34, c: P.terra })}
  ${circle(290, 36, 3.4, { c: P.soft, w: 2, fill: P.soft })}`);
}

// 7 · The Balcony Is a Farm, Actually — railing with climbers on a trellis.
function illoBalcony() {
  return svg(`
  ${sun(52, 44, 13, { inner: true })}
  ${rect(68, 24, 206, 8, { fill: P.cream })}
  ${path("M84 32 L84 108 M118 32 L118 108 M152 32 L152 108 M186 32 L186 108 M220 32 L220 108 M254 32 L254 108", { c: P.muted, w: 2, dash: "3 6" })}
  ${rect(68, 108, 206, 10, { fill: P.cream })}
  ${path("M44 156 L292 156", { c: P.sand, w: 2 })}
  ${path("M60 118 L60 156 M98 118 L98 156 M136 118 L136 156 M174 118 L174 156 M212 118 L212 156 M250 118 L250 156 M288 118 L288 156", { c: P.ink, w: 2.2 })}
  ${pot(84, 116, { w: 30, h: 22, c: P.terra })}
  ${plant(84, 116, { h: 38, c: P.terra })}
  ${pot(152, 116, { w: 30, h: 22, c: P.ink })}
  ${plant(152, 118, { h: 58, c: P.ink })}
  ${pot(220, 116, { w: 32, h: 22, c: P.terra })}
  ${plant(220, 116, { h: 46, c: P.terra })}
  ${circle(280, 60, 3, { c: P.soft, w: 2, fill: P.soft })}`);
}

// 8 · Herbs & the Case for Microgreens — a snip over the tray, and an herb sprig.
function illoHerbs() {
  return svg(`
  ${rect(52, 122, 116, 18, { rad: 6, lw: 2.6 })}
  ${sprout(68, 122, { h: 20, c: P.leaf })}
  ${sprout(84, 122, { h: 24, c: P.leaf })}
  ${sprout(100, 122, { h: 20, c: P.leaf })}
  ${sprout(116, 122, { h: 25, c: P.leaf })}
  ${sprout(132, 122, { h: 21, c: P.leaf })}
  ${sprout(148, 122, { h: 23, c: P.leaf })}
  ${path("M70 108 L130 108", { c: P.sand, w: 2.2, dash: "4 4" })}
  ${circle(100, 88, 3.2, { c: P.terra, w: 2, fill: P.terra })}
  ${path("M64 64 L136 100", { c: P.ink, w: 2.2 })}
  ${path("M136 64 L64 100", { c: P.ink, w: 2.2 })}
  ${circle(57, 60, 9, { c: P.ink, w: 2.2 })}
  ${circle(143, 60, 9, { c: P.ink, w: 2.2 })}
  ${pot(242, 136, { w: 34, h: 26, c: P.terra })}
  ${path("M242 110 L242 56", { c: P.terra, w: 2.6 })}
  ${leaf(242, 60, 14, { c: P.terra, rot: -38, w: 2.2 })}
  ${leaf(242, 72, 15, { c: P.terra, rot: -128, w: 2.2 })}
  ${leaf(242, 84, 14, { c: P.terra, rot: -32, w: 2.2 })}
  ${path("M238 84 C248 78 252 70 254 64", { c: P.terra, w: 2 })}
  ${leaf(254, 62, 13, { c: P.terra, rot: 14, w: 2.2 })}
  ${circle(292, 40, 3.4, { c: P.soft, w: 2, fill: P.soft })}`);
}

// 9 · Apartment Wildlife — one brave leaf, some aphids, and a gentle spritz.
function illoPests() {
  return svg(`
  ${leaf(120, 66, 62, { c: P.ink, rot: -8, w: 2.8 })}
  ${leaf(132, 28, 32, { c: P.ink, rot: -42, w: 2.2 })}
  ${leaf(150, 96, 40, { c: P.ink, rot: 20, w: 2.2 })}
  ${circle(146, 108, 5, { c: P.terra, w: 2, fill: P.terra })}
  ${path("M144 97 L141 92 M147 95 L150 91 M143 101 L138 99 M148 102 L153 100", { c: P.terra, w: 1.5 })}
  ${circle(200, 64, 4.4, { c: P.terra, w: 2, fill: P.terra })}
  ${path("M198 55 L196 50 M201 55 L203 51 M197 59 L192 58 M201 60 L205 58", { c: P.terra, w: 1.4 })}
  ${leaf(240, 138, 12, { c: P.leaf, rot: -18, w: 2 })}
  ${drop(252, 148, 9, { c: P.terra, w: 2.6 })}
  ${circle(76, 44, 12, { c: P.soft, w: 2.4 })}
  ${path("M68 42 L86 48 M70 57 L84 54", { c: P.soft, w: 2 })}
  ${circle(286, 28, 3, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 10 · Seasons, Zones & the Great Restart — a yearly ring with four seasons.
function illoSeasons() {
  return svg(`
  ${path("M166 24 A 58 58 0 0 1 208 56", { c: P.sand, w: 2.2, dash: "3 7" })}
  ${path("M208 52 l-7 -2 M208 52 l3 -8", { c: P.sand, w: 2.2 })}
  ${circle(160, 88, 54, { c: P.terra, w: 3 })}
  ${circle(160, 88, 4, { c: P.ink, w: 2, fill: P.ink })}
  ${sun(160, 26, 15, { inner: true })}
  ${sprout(160, 130, { h: 26, c: P.terra })}
  ${leaf(224, 82, 24, { c: P.leaf, rot: 30, w: 2.4 })}
  ${leaf(206, 118, 16, { c: P.leaf, rot: 100, w: 2.2 })}
  ${drop(100, 82, 11, { c: P.terra, w: 2.4 })}
  ${circle(160, 42, 3, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(180, 28, 2.6, { c: P.soft, w: 1.6, fill: P.soft })}`);
}

// ---------------------------------------------------------------- ollama theme
// Shared tech-style primitives, drawn with the same warm palette so the book
// still feels like one design system — just with the topic's own imagery.

// A speech bubble with a small tail, centered on (cx, cy).
function bubble(cx, cy, w, h, opts = {}) {
  const { c = P.ink, lw = 2.4, fill = "none" } = opts;
  const rad = Math.round(Math.min(18, h * 0.3));
  let out = rect(cx - w / 2, cy - h / 2, w, h, { rad, c, lw, fill });
  out += path(`M${cx - w / 2 + 10} ${cy + h / 2 - 1} l-8 12 l10 -6 Z`, { c, w: lw, fill });
  return out;
}

// A little terminal window with a title bar (three dots) and a hairline below.
function termWin(x, y, w, h, opts = {}) {
  const { c = P.ink, lw = 2.6 } = opts;
  let out = rect(x, y, w, h, { rad: 10, c, lw });
  out += path(`M${x} ${y + 22} L${x + w} ${y + 22}`, { c: P.sand, w: 1.8 });
  out += circle(x + 17, y + 11, 3, { c: P.terra, w: 1.8, fill: P.terra });
  out += circle(x + 31, y + 11, 3, { c: P.muted, w: 1.8 });
  out += circle(x + 45, y + 11, 3, { c: P.soft, w: 1.8 });
  return out;
}

// A ">" prompt chevron.
function promptMark(x, y, s = 6, opts = {}) {
  return path(`M${x - s} ${y - s} L${x + s * 0.6} ${y} L${x - s} ${y + s}`, { c: opts.c || P.terra, w: opts.w || 2.6 });
}

// Little "text" lines, like a snippet of monospace or prose.
function tlines(x, y, n, opts = {}) {
  const { w = 34, gap = 9, c = P.muted, lw = 2, widths } = opts;
  let out = "";
  for (let i = 0; i < n; i++) {
    const len = widths ? widths[i % widths.length] : w;
    out += path(`M${x} ${y + i * gap} h${len}`, { c, w: lw });
  }
  return out;
}

function check(x, y, s, opts = {}) {
  return path(`M${x - s} ${y} L${x - s * 0.2} ${y + s} L${x + s * 1.15} ${y - s * 0.8}`, {
    c: opts.c || P.terra,
    w: opts.w || 2.8,
  });
}

function downArrow(x, y, len, opts = {}) {
  let out = path(`M${x} ${y} L${x} ${y + len - 5}`, { c: opts.c || P.terra, w: 2.4 });
  out += path(`M${x - 7} ${y + len - 13} L${x} ${y + len - 7} L${x + 7} ${y + len - 13}`, { c: opts.c || P.terra, w: 2.4 });
  return out;
}

// A puffy cloud, drawn with smooth arcs.
function cloud(cx, cy, r, opts = {}) {
  const { c = P.muted, w = 2.2 } = opts;
  const d = `M${cx - r} ${cy} ` +
    `A${r * 0.7} ${r * 0.7} 0 0 1 ${cx - r * 0.42} ${cy - r * 0.8} ` +
    `A${r * 0.75} ${r * 0.75} 0 0 1 ${cx + r * 0.2} ${cy - r * 0.9} ` +
    `A${r * 0.7} ${r * 0.7} 0 0 1 ${cx + r * 0.78} ${cy - r * 0.35} ` +
    `A${r * 0.55} ${r * 0.55} 0 0 1 ${cx + r} ${cy} ` +
    `Q${cx + r * 0.5} ${cy + r * 0.55} ${cx} ${cy + r * 0.55} ` +
    `Q${cx - r * 0.5} ${cy + r * 0.55} ${cx - r} ${cy} Z`;
  return path(d, { c, w });
}

// A cloud crossed out: the "no cloud" promise of local AI.
function noCloud(cx, cy, r, opts = {}) {
  let out = cloud(cx, cy, r, opts);
  out += path(`M${cx - r * 0.75} ${cy + r * 1.05} L${cx + r * 0.75} ${cy - r * 0.95}`, { c: P.terra, w: 2.2 });
  return out;
}

// A four-point spark.
function spark(x, y, r, opts = {}) {
  const { c = P.soft, w = 2 } = opts;
  const d = `M${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} L${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} ` +
    `L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} Z`;
  return path(d, { c, w });
}

// 1 · The AI that lives in your laptop, rent-free — laptop, chat, no cloud.
function ollamaLaptop() {
  return svg(`
  ${rect(70, 34, 152, 94, { rad: 10, lw: 3 })}
  ${path("M64 132 Q149 145 234 132", { c: P.ink, w: 3 })}
  ${noCloud(92, 62, 13)}
  ${bubble(150, 78, 62, 44)}
  ${promptMark(126, 86)}
  ${tlines(134, 74, 3, { w: 28, gap: 8, c: P.soft })}
  ${spark(198, 52, 7)}
  ${circle(86, 52, 8, { c: P.terra, w: 2, fill: P.soft })}
  ${circle(104, 32, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(216, 88, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 2 · The five-minute install — download into a terminal, progress bar, tick.
function ollamaInstall() {
  return svg(`
  ${downArrow(140, 24, 14, { c: P.terra })}
  ${termWin(60, 40, 168, 96)}
  ${path("M78 62 h34", { c: P.terra, w: 2.6 })}
  ${promptMark(80, 88)}
  ${tlines(96, 80, 3, { w: 44, gap: 9, c: P.soft })}
  ${rect(80, 108, 128, 9, { rad: 5, c: P.terra, w: 2 })}
  ${rect(80, 108, 74, 9, { rad: 5, fill: P.terra, c: P.terra, lw: 0.01 })}
  ${check(216, 134, 9)}
  ${spark(172, 28, 5)}
  ${circle(238, 114, 4, { c: P.muted, w: 1.8, fill: P.muted })}`);
}

// 3 · Your first chat — a user bubble and an assistant bubble.
function ollamaChat() {
  return svg(`
  ${bubble(102, 96, 110, 56)}
  ${tlines(66, 82, 4, { w: 44, gap: 10, c: P.soft })}
  ${bubble(224, 132, 76, 38, { fill: P.cream })}
  ${promptMark(194, 138)}
  ${circle(118, 40, 4, { c: P.muted, w: 1.8, fill: P.muted })}
  ${circle(136, 34, 3, { c: P.muted, w: 1.6 })}
  ${circle(154, 40, 4, { c: P.muted, w: 1.8, fill: P.muted })}
  ${spark(266, 48, 6)}
  ${spark(40, 26, 4)}`);
}

// 4 · The command toolbelt — list, pull, run, rm, on one belt.
function ollamaToolbelt() {
  let out = "";
  const xs = [42, 102, 162, 222];
  for (const x of xs) out += rect(x, 52, 46, 78, { rad: 9, lw: 2.6 });
  out += tlines(54, 80, 3, { w: 20, gap: 11, c: P.soft }); // list
  out += downArrow(125, 72, 26, { c: P.terra }); // pull
  out += path("M113 102 h26", { c: P.soft, w: 2.2 }); // underline for pull
  out += path("M182 74 L202 88 L182 104 Z", { c: P.terra, w: 2.2 }); // run
  out += circle(245, 90, 15, { c: P.terra, w: 2.2 }); // rm
  out += path("M235 80 L255 100 M255 80 L235 100", { c: P.terra, w: 2 }); // rm x
  out += path("M28 152 L292 152", { c: P.sand, w: 4 }); // belt band
  out += circle(160, 152, 5, { c: P.terra, w: 2.2, fill: P.terra }); // buckle
  return svg(out);
}

// 5 · The model library, decoded — shelves of model boxes, a magnifier.
function ollamaModels() {
  return svg(`
  ${rect(56, 122, 216, 9, { fill: P.cream })} 
  ${rect(84, 96, 44, 26, { rad: 6, lw: 2.4 })}
  ${rect(152, 82, 48, 40, { rad: 6, c: P.terra, lw: 2.6 })}
  ${rect(224, 62, 48, 60, { rad: 6, lw: 2.4 })}
  ${circle(106, 90, 4, { c: P.muted, w: 1.8 })}
  ${circle(176, 76, 4, { c: P.terra, w: 1.8, fill: P.terra })}
  ${circle(248, 56, 4, { c: P.muted, w: 1.8 })}
  ${circle(140, 28, 12, { c: P.terra, w: 2.2 })}
  ${path("M150 38 L162 52", { c: P.terra, w: 2.2 })}
  ${circle(146, 33, 2.2, { c: P.soft, w: 1.6, fill: P.soft })}
  ${circle(66, 40, 3, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(286, 34, 3, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 6 · The tiny AI server hiding in your computer — a tower full of racks.
function ollamaServer() {
  return svg(`
  ${rect(126, 40, 88, 112, { rad: 10, lw: 3 })}
  ${circle(148, 55, 4.5, { c: P.terra, w: 2 })}
  ${rect(134, 74, 62, 11, { rad: 4, lw: 2 })}
  ${rect(134, 91, 62, 11, { rad: 4, lw: 2 })}
  ${rect(134, 108, 62, 11, { rad: 4, lw: 2 })}
  ${circle(142, 79.5, 2.4, { c: P.terra, w: 1.6, fill: P.terra })}
  ${circle(142, 96.5, 2.4, { c: P.terra, w: 1.6, fill: P.terra })}
  ${circle(142, 113.5, 2.4, { c: P.terra, w: 1.6, fill: P.terra })}
  ${path("M126 68 h88", { c: P.sand, w: 1.6 })}
  ${spark(228, 44, 7)}
  ${circle(60, 106, 12, { c: P.soft, w: 2.2 })}
  ${path("M52 104 L68 110 M54 119 L68 113", { c: P.soft, w: 1.8 })}
  ${circle(60, 114, 5, { c: P.soft, w: 1.8, fill: P.soft })}
  ${path("M214 124 q18 8 40 4", { c: P.muted, w: 2 })}
  ${circle(256, 130, 4.5, { c: P.muted, w: 1.8 })}
  ${circle(140, 146, 3, { c: P.muted, w: 1.6 })}
  ${circle(160, 146, 3, { c: P.muted, w: 1.6 })}
  ${circle(180, 146, 3, { c: P.muted, w: 1.6 })}
  ${circle(200, 146, 3, { c: P.muted, w: 1.6 })}`);
}

// 7 · A pretty face for your private AI — a chat app window with a lock.
function ollamaGUI() {
  return svg(`
  ${rect(50, 36, 220, 108, { rad: 10, lw: 3 })}
  ${path("M50 58 L270 58", { c: P.sand, w: 1.8 })}
  ${circle(64, 47, 3, { c: P.terra, w: 1.8, fill: P.terra })}
  ${circle(76, 47, 3, { c: P.muted, w: 1.8 })}
  ${circle(88, 47, 3, { c: P.soft, w: 1.8 })}
  ${rect(50, 58, 44, 86, { fill: P.cream })}
  ${tlines(58, 78, 5, { w: 26, gap: 10, c: P.soft })}
  ${bubble(126, 92, 92, 42)}
  ${tlines(92, 84, 4, { w: 52, gap: 10, c: P.soft })}
  ${bubble(212, 124, 60, 34, { fill: P.cream })}
  ${promptMark(190, 128)}
  ${rect(232, 42, 14, 10, { rad: 2, c: P.terra, lw: 2 })}
  ${path("M236 42 V37 a4 4 0 0 1 7 0 v5", { c: P.terra, w: 2 })}
  ${spark(258, 70, 6)}`);
}

// 8 · Make it weird on purpose — a "personality card" with tuning sliders.
function ollamaModelfile() {
  return svg(`
  ${rect(58, 38, 204, 120, { rad: 10, lw: 3 })}
  ${circle(80, 60, 10, { c: P.muted, w: 2 })}
  ${path("M76 58 q4 3 8 0", { c: P.muted, w: 1.6 })}
  ${tlines(98, 55, 2, { w: 56, gap: 8, c: P.soft })}
  ${spark(244, 48, 6)}
  ${path("M80 96 L244 96", { c: P.sand, w: 2 })}
  ${circle(152, 96, 4.5, { c: P.terra, w: 2, fill: P.terra })}
  ${path("M80 118 L244 118", { c: P.sand, w: 2 })}
  ${circle(128, 118, 4.5, { c: P.terra, w: 2, fill: P.terra })}
  ${path("M80 140 L244 140", { c: P.sand, w: 2 })}
  ${circle(198, 140, 4.5, { c: P.terra, w: 2, fill: P.terra })}
  ${circle(46, 34, 3, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(278, 132, 3, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 9 · Ollama gets a job — an editor window and a document, joined by two arrows.
function ollamaJobs() {
  return svg(`
  ${rect(48, 44, 118, 92, { rad: 8, lw: 2.6 })}
  ${path("M48 62 L166 62", { c: P.sand, w: 1.6 })}
  ${tlines(58, 78, 5, { w: 60, gap: 12, c: P.soft })}
  ${path("M58 60 h12 M58 53 h8", { c: P.terra, w: 2 })}
  ${rect(196, 34, 88, 104, { rad: 6, lw: 2.6 })}
  ${path("M284 34 L284 52 L266 52 Z", { fill: P.sand })}
  ${tlines(210, 64, 5, { w: 58, gap: 11, c: P.muted })}
  ${path("M168 90 h28", { c: P.terra, w: 2.6 })}
  ${path("M172 82 L164 90 L172 96", { c: P.terra, w: 2.4 })}
  ${path("M192 82 L200 90 L192 96", { c: P.terra, w: 2.4 })}
  ${circle(182, 90, 3.4, { c: P.terra, w: 2, fill: P.terra })}
  ${spark(274, 30, 5)}
  ${circle(46, 128, 3, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 10 · When it goes sideways — a warning triangle and a magnifier over fine print.
function ollamaFix() {
  return svg(`
  ${path("M70 130 L110 60 L150 130 Z", { c: P.terra, w: 2.8 })}
  ${path("M110 84 v14", { c: P.terra, w: 3 })}
  ${circle(110, 108, 2.6, { c: P.terra, w: 2, fill: P.terra })}
  ${rect(184, 126, 88, 16, { rad: 4, lw: 2 })}
  ${tlines(194, 130, 2, { w: 66, gap: 8, c: P.soft })}
  ${circle(252, 78, 17, { c: P.muted, w: 2.2 })}
  ${tlines(242, 72, 2, { w: 20, gap: 6, c: P.muted })}
  ${path("M266 92 L282 110", { c: P.muted, w: 2.4 })}
  ${spark(66, 42, 6)}
  ${circle(178, 92, 3, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// ---------------------------------------------------------------- copywriting theme
// Shared writing-desk primitives: pencils, papers, tags, hearts, block letters —
// the same warm palette, but the imagery is pens, pages, and persuasion.

// A pencil, tilted by `deg`; the tip is at the bottom (y = +58 in local space).
function pencil(x, y, deg = 10, opts = {}) {
  const { c = P.ink } = opts;
  return `<g transform="translate(${x} ${y}) rotate(${deg})">` +
    `${rect(-4, 0, 8, 38, { rad: 3, lw: 2.2, c })}` +
    `${path("M-4 38 L0 50 L4 38 Z", { c, w: 2 })}` +
    `${path("M-4 46 L4 46", { c: P.sand, w: 1.6 })}` +
    `${path("M-1.6 50 L0 58 L1.6 50 Z", { c, w: 1.4, fill: c })}` +
    `</g>`;
}

// A single capital letter drawn with strokes (only A, I, D — the AIDA formula).
function letter(x, y, ch, opts = {}) {
  const { c = P.ink, s = 1 } = opts;
  const W = 20 * s, H = 22 * s;
  if (ch === "A") {
    return path(`M${x + W * 0.5} ${y} L${x + W * 0.08} ${y + H} L${x + W * 0.92} ${y + H} Z`, { c, w: 2.4 * s }) +
      path(`M${x + W * 0.24} ${y + H * 0.6} L${x + W * 0.76} ${y + H * 0.6}`, { c, w: 2 * s });
  }
  if (ch === "I") {
    return path(`M${x + W * 0.4} ${y} L${x + W * 0.6} ${y} L${x + W * 0.5} ${y + H} L${x + W * 0.4} ${y + H} Z`, { c, w: 2.2 * s }) +
      path(`M${x + W * 0.14} ${y + H * 0.12} L${x + W * 0.86} ${y + H * 0.12} M${x + W * 0.14} ${y + H * 0.88} L${x + W * 0.86} ${y + H * 0.88}`, { c, w: 1.8 * s });
  }
  if (ch === "D") {
    return path(`M${x + W * 0.16} ${y} L${x + W * 0.32} ${y} L${x + W * 0.32} ${y + H} L${x + W * 0.16} ${y + H}`, { c, w: 2.2 * s }) +
      path(`M${x + W * 0.32} ${y} Q${x + W * 0.9} ${y + H * 0.14} ${x + W * 0.9} ${y + H * 0.5} Q${x + W * 0.9} ${y + H * 0.86} ${x + W * 0.32} ${y + H}`, { c, w: 2.2 * s });
  }
  return "";
}

// A small horizontal arrow (the down-arrow's sideways cousin).
function harrow(x, y, len, opts = {}) {
  const { c = P.terra, w = 2.2 } = opts;
  let out = path(`M${x} ${y} h${len}`, { c, w });
  out += path(`M${x + len - 9} ${y - 6} L${x + len} ${y} L${x + len - 9} ${y + 6}`, { c, w });
  return out;
}

// A small heart — tone, voice, the human bit.
function heart(x, y, s = 5, opts = {}) {
  const { c = P.terra, w = 2.2 } = opts;
  return path(
    `M${x} ${y + s * 3.5} ` +
    `C${x - s * 1.67} ${y + s * 2.2} ${x - s * 3.33} ${y + s * 1.5} ${x - s * 3.33} ${y + s * 0.17} ` +
    `a${s * 1.5} ${s * 1.5} 0 0 1 ${s * 3.17} ${s * 1.33} ` +
    `a${s * 1.5} ${s * 1.5} 0 0 1 ${s * 3.17} ${-s * 1.33} ` +
    `c0 ${s * 1.33} ${-s * 1.67} ${s * 2.2} ${-s * 3.17} ${s * 3.67} Z`,
    { c, w }
  );
}

// A price tag (a diamond with a hole).
function tag(x, y, s = 10, opts = {}) {
  const { c = P.ink, w = 2 } = opts;
  let out = path(`M${x} ${y} L${x + s * 0.85} ${y + s * 0.4} L${x} ${y + s * 0.8} L${x - s * 0.85} ${y + s * 0.4} Z`, { c, w });
  out += circle(x, y + s * 0.4, s * 0.22, { c, w: w * 0.7 });
  return out;
}

// 1 · Writing you can sell — a page where one line lights up with sparks.
function cwWhat() {
  return svg(`
  ${rect(52, 52, 176, 82, { rad: 8, fill: P.cream, lw: 2.6 })}
  ${path("M74 130 L74 136", { c: P.sand, w: 2 })}
  ${tlines(74, 72, 3, { w: 124, gap: 12, c: P.muted })}
  ${path("M74 108 h132", { c: P.terra, w: 3 })}
  ${spark(220, 94, 8)}
  ${spark(240, 82, 5)}
  ${tag(58, 36, 9, { c: P.terra })}
  ${pencil(250, 66, 10)}
  ${heart(282, 118, 2.6)}
  ${circle(46, 142, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 2 · The audience detective — one specific person under a magnifier.
function cwDetective() {
  return svg(`
  ${circle(96, 62, 11, { c: P.ink, w: 2.4 })}
  ${path("M96 73 L96 102", { c: P.ink, w: 2.4 })}
  ${path("M96 80 L82 94 M96 80 L112 94", { c: P.ink, w: 2.2 })}
  ${path("M96 102 L85 120 M96 102 L108 120", { c: P.ink, w: 2.2 })}
  ${circle(152, 84, 24, { c: P.terra, w: 2.8 })}
  ${tlines(142, 72, 3, { w: 20, gap: 8, c: P.muted })}
  ${path("M170 103 L196 129", { c: P.terra, w: 3 })}
  ${circle(199, 132, 5, { c: P.terra, w: 2.2 })}
  ${bubble(248, 58, 44, 34, { fill: P.cream })}
  ${tlines(236, 48, 2, { w: 20, gap: 8, c: P.soft })}
  ${circle(220, 50, 4, { c: P.soft, w: 1.8 })}
  ${circle(232, 74, 5, { c: P.soft, w: 2 })}
  ${spark(64, 40, 5)}
  ${circle(286, 100, 3, { c: P.muted, w: 1.8 })}`);
}

// 3 · Benefits, not features — a plain box becomes a warm afterglow sun.
function cwBenefits() {
  return svg(`
  ${rect(42, 76, 90, 62, { rad: 8, lw: 2.6 })}
  ${tlines(56, 94, 3, { w: 60, gap: 12, c: P.muted })}
  ${path("M56 120 h40", { c: P.muted, w: 2 })}
  ${harrow(140, 107, 44)}
  ${sun(228, 92, 22, { inner: true })}
  ${spark(262, 62, 6)}
  ${heart(202, 46, 3.2)}
  ${circle(54, 54, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(288, 122, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 4 · The headline is the bouncer — a bold line, a velvet rope, one doorman.
function cwHeadline() {
  return svg(`
  ${rect(42, 66, 126, 50, { rad: 8, fill: P.cream, lw: 2.6 })}
  ${path("M56 82 h96", { c: P.terra, w: 3.2 })}
  ${path("M56 100 h64 M56 108 h48", { c: P.muted, w: 2 })}
  ${circle(226, 72, 10, { c: P.ink, w: 2.4 })}
  ${rect(214, 84, 26, 40, { rad: 6, lw: 2.2 })}
  ${path("M218 94 L236 108 M236 94 L218 108", { c: P.ink, w: 2.2 })}
  ${path("M222 124 L218 142 M232 124 L236 142", { c: P.ink, w: 2.2 })}
  ${circle(258, 132, 3.4, { c: P.ink, w: 1.8, fill: P.ink })}
  ${circle(292, 132, 3.4, { c: P.ink, w: 1.8, fill: P.ink })}
  ${path("M258 132 L292 132", { c: P.terra, w: 3 })}
  ${spark(280, 54, 6)}
  ${circle(44, 44, 3, { c: P.muted, w: 1.8 })}`);
}

// 5 · AIDA, the blueprint — four boxes, arrows, and a plan grid.
function cwAIDA() {
  let out = "";
  out += rect(24, 34, 272, 102, { rad: 8, fill: P.cream, lw: 1.8 });
  out += path("M24 60 L296 60 M24 98 L296 98", { c: P.sand, w: 1.2 });
  const xs = [38, 102, 166, 230];
  for (const x of xs) out += rect(x, 70, 52, 44, { rad: 8, lw: 2.6 });
  out += letter(53, 80, "A", { s: 0.95 });
  out += letter(119, 80, "I", { s: 0.95 });
  out += letter(181, 80, "D", { s: 0.95 });
  out += letter(245, 80, "A", { s: 0.95 });
  out += harrow(92, 92, 10);
  out += harrow(156, 92, 10);
  out += harrow(220, 92, 4);
  out += spark(306, 60, 8);
  out += circle(38, 56, 3, { c: P.soft, w: 1.8, fill: P.soft });
  out += circle(286, 122, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 6 · Speak human — a megaphone, a reply bubble, a little heart.
function cwHuman() {
  return svg(`
  ${path("M42 96 L96 70 L102 92 L92 110 L42 108 Z", { c: P.terra, w: 2.4 })}
  ${path("M52 110 L48 126", { c: P.ink, w: 2.2 })}
  ${circle(48, 130, 3, { c: P.ink, w: 1.8, fill: P.ink })}
  ${circle(120, 80, 3, { c: P.muted, w: 1.8 })}
  ${circle(130, 94, 5, { c: P.muted, w: 2 })}
  ${circle(122, 110, 4, { c: P.muted, w: 2 })}
  ${circle(132, 122, 3, { c: P.muted, w: 1.8 })}
  ${bubble(206, 78, 110, 52)}
  ${tlines(166, 66, 4, { w: 56, gap: 11, c: P.soft })}
  ${bubble(224, 138, 60, 30, { fill: P.cream })}
  ${tlines(204, 132, 2, { w: 34, gap: 8, c: P.soft })}
  ${heart(274, 42, 3.4)}
  ${spark(42, 44, 5)}`);
}

// 7 · The call to action — a clear ask, a big button, a press.
function cwCTA() {
  return svg(`
  ${path("M160 44 L160 78", { c: P.terra, w: 3 })}
  ${path("M153 70 L160 78 L167 70", { c: P.terra, w: 3 })}
  ${rect(86, 84, 148, 50, { rad: 10, fill: P.cream, lw: 3 })}
  ${path("M112 110 h98", { c: P.terra, w: 3.2 })}
  ${spark(78, 62, 6)}
  ${spark(252, 62, 6)}
  ${path("M60 88 L60 102", { c: P.ink, w: 2.6 })}
  ${circle(60, 110, 2.2, { c: P.ink, w: 2, fill: P.ink })}
  ${circle(286, 140, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 8 · The unseen polish — glasses, a strikethrough, a tidy check.
function cwPolish() {
  return svg(`
  ${circle(106, 64, 19, { c: P.ink, w: 2.4 })}
  ${circle(150, 64, 19, { c: P.ink, w: 2.4 })}
  ${path("M125 66 L131 66", { c: P.ink, w: 2 })}
  ${path("M87 64 L75 58 M169 64 L181 58", { c: P.ink, w: 2 })}
  ${rect(84, 102, 148, 40, { rad: 6, fill: P.cream, lw: 2.2 })}
  ${tlines(98, 116, 3, { w: 118, gap: 10, c: P.muted })}
  ${path("M168 116 L200 124", { c: P.terra, w: 2.4 })}
  ${check(214, 88, 8)}
  ${pencil(282, 96, 10)}
  ${spark(62, 38, 6)}`);
}

// 9 · Practice on purpose — a swipe file and a pencil rewriting the line.
function cwPractice() {
  return svg(`
  ${rect(52, 90, 86, 44, { rad: 6, lw: 2.4 })}
  ${rect(60, 82, 86, 44, { rad: 6, fill: P.cream, lw: 2.4 })}
  ${tlines(72, 96, 3, { w: 58, gap: 10, c: P.muted })}
  ${path("M72 128 h40", { c: P.muted, w: 2 })}
  ${rect(170, 84, 104, 46, { rad: 6, lw: 2.2 })}
  ${path("M184 96 h76", { c: P.terra, w: 3 })}
  ${path("M184 110 h52", { c: P.muted, w: 2 })}
  ${path("M184 120 h38", { c: P.muted, w: 2 })}
  ${pencil(288, 76, 10)}
  ${spark(118, 54, 6)}
  ${circle(44, 150, 3, { c: P.muted, w: 1.8 })}`);
}

// 10 · From practice to paycheck — a first invoice, coins, and a check.
function cwPaycheck() {
  return svg(`
  ${rect(84, 104, 132, 58, { rad: 6, lw: 2.6 })}
  ${path("M84 104 L150 142 L216 104", { c: P.ink, w: 2.2 })}
  ${path("M84 124 L216 124", { c: P.sand, w: 1.8 })}
  ${circle(112, 76, 13, { c: P.terra, w: 2.4 })}
  ${circle(140, 66, 13, { c: P.terra, w: 2.4 })}
  ${circle(168, 76, 13, { c: P.terra, w: 2.4 })}
  ${circle(140, 66, 4.6, { c: P.terra, w: 1.8, fill: P.terra })}
  ${check(228, 106, 9)}
  ${tag(262, 128, 8, { c: P.terra })}
  ${spark(292, 52, 6)}
  ${circle(62, 136, 3.2, { c: P.muted, w: 1.8 })}`);
}

// Copywriting cover: a warm desk at work — notepad, pencil, coffee, afterglow.
function copywritingCoverArt() {
  return svg(
    `
  ${sun(628, 48, 18, { inner: true })}
  ${path("M320 66 L311 57 M320 66 L311 75", { c: P.muted, w: 2 })}
  ${path("M344 54 L332 50 M344 54 L333 60", { c: P.muted, w: 2 })}
  ${rect(118, 44, 88, 30, { rad: 6, lw: 2 })}
  ${path("M130 60 h64", { c: P.terra, w: 2.4 })}
  ${rect(222, 36, 70, 26, { rad: 6, fill: P.cream, lw: 2 })}
  ${path("M234 50 h44", { c: P.muted, w: 2 })}
  ${rect(68, 96, 210, 92, { rad: 10, fill: P.cream, lw: 3 })}
  ${path("M88 120 h132", { c: P.terra, w: 3.4 })}
  ${path("M88 142 h168 M88 160 h144 M88 178 h120", { c: P.muted, w: 2.4 })}
  ${spark(250, 106, 8)}
  ${pencil(326, 136, 8)}
  ${rect(470, 132, 52, 46, { rad: 8, lw: 2.8 })}
  ${path("M522 142 a18 20 0 0 1 0 26", { c: P.ink, w: 2.6 })}
  ${path("M486 124 q6 -9 0 -15 M504 126 q6 -9 0 -15", { c: P.muted, w: 2 })}
  ${tag(566, 116, 13, { c: P.terra })}
  ${circle(618, 108, 21, { c: P.terra, w: 2.6 })}
  ${path("M635 125 L658 150", { c: P.terra, w: 3 })}
  ${circle(661, 153, 4, { c: P.terra, w: 2 })}
  ${heart(690, 104, 3.4)}
  ${circle(66, 190, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(120, 202, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(380, 204, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(640, 186, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}
`,
    { w: 720, h: 250 }
  );
}

// ---------------------------------------------------------------- people theme
// The people-skill warm-up: little figures, chat bubbles, smiles, a listening
// ear and hearts — the 1936 Dale Carnegie book in gentle line art.

// A simple friendly figure — head, rounded shoulders, and a torso.
function fig(x, yTop, opts = {}) {
  const { head = 9, c = P.ink, w = 2.4 } = opts;
  let out = circle(x, yTop, head, { c, w });
  out += path(`M${x - head * 1.5} ${yTop + head * 1.15} Q${x} ${yTop + head * 2.3} ${x + head * 1.5} ${yTop + head * 1.15}`, { c, w });
  out += path(`M${x - head * 1.1} ${yTop + head * 0.9} L${x - head * 1.45} ${yTop + head * 4.2}`, { c, w: w * 0.85 });
  out += path(`M${x + head * 1.1} ${yTop + head * 0.9} L${x + head * 1.4} ${yTop + head * 4.2}`, { c, w: w * 0.85 });
  return out;
}

// 1 · Getting along is a skill — an open book, and the talk it started.
function plBook() {
  return svg(`
  ${path("M160 82 Q132 74 104 88 L100 148 Q132 136 160 142 Z", { c: P.ink, w: 2.6, fill: P.cream })}
  ${path("M160 82 Q188 74 216 88 L220 148 Q188 136 160 142 Z", { c: P.ink, w: 2.6, fill: P.cream })}
  ${path("M160 82 L160 142", { c: P.sand, w: 1.8 })}
  ${tlines(118, 98, 3, { w: 30, gap: 12, c: P.muted })}
  ${tlines(180, 98, 3, { w: 30, gap: 12, c: P.muted })}
  ${heart(112, 58, 5.5)}
  ${heart(210, 62, 5)}
  ${spark(256, 92, 6)}
  ${circle(58, 118, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(282, 66, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 2 · Never criticize, condemn, or complain — a crossed-out jab, a kinder swap.
function plNoCriticize() {
  return svg(`
  ${bubble(104, 92, 84, 50)}
  ${tlines(76, 84, 3, { w: 38, gap: 10, c: P.muted })}
  ${path("M72 70 L132 114 M132 70 L72 114", { c: P.terra, w: 2.4 })}
  ${harrow(150, 92, 24)}
  ${heart(212, 92, 9)}
  ${check(218, 104, 5)}
  ${spark(248, 66, 6)}
  ${circle(286, 128, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 3 · Appreciation is your superpower — a heart glowing with rays.
function plAppreciation() {
  return svg(`
  ${sun(152, 88, 26, { rays: 10 })}
  ${heart(152, 76, 7)}
  ${spark(152, 132, 6)}
  ${spark(96, 66, 5)}
  ${spark(214, 72, 5)}
  ${circle(284, 88, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(58, 96, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 4 · Talk about what they already want — a figure aiming at a heart within a target.
function plWant() {
  return svg(`
  ${circle(222, 94, 30, { c: P.ink, w: 2.2 })}
  ${circle(222, 94, 19, { c: P.terra, w: 2.2 })}
  ${heart(222, 84, 6.5)}
  ${fig(76, 84, { head: 10 })}
  ${path("M104 108 L168 100", { c: P.terra, w: 2.4 })}
  ${path("M160 104 L168 100 L161 94", { c: P.terra, w: 2.4 })}
  ${spark(52, 60, 5)}
  ${circle(284, 132, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 5 · Be likable on purpose — a smiley, a name tag, a friendly spark.
function plLikable() {
  return svg(`
  ${circle(92, 76, 24, { c: P.ink, w: 2.5 })}
  ${circle(84, 70, 2.8, { c: P.ink, w: 1.8, fill: P.ink })}
  ${circle(100, 70, 2.8, { c: P.ink, w: 1.8, fill: P.ink })}
  ${path("M80 82 Q92 96 104 82", { c: P.ink, w: 2.5 })}
  ${rect(140, 70, 72, 34, { rad: 9, fill: P.cream, lw: 2.4 })}
  ${path("M156 70 L149 54 M164 70 L158 54", { c: P.terra, w: 2 })}
  ${tlines(154, 82, 1, { w: 44, c: P.muted })}
  ${tlines(154, 94, 1, { w: 30, c: P.muted })}
  ${spark(248, 58, 6)}
  ${heart(252, 108, 4)}
  ${circle(54, 122, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 6 · The quiet superpowers — an ear, sound waves, and a heart.
function plListening() {
  return svg(`
  ${path("M134 46 a30 34 0 0 1 22 46 a30 34 0 0 1 -38 18 a30 34 0 0 1 -20 -30 a30 34 0 0 1 22 -34 Z", { c: P.ink, w: 2.4 })}
  ${path("M118 92 Q132 112 132 92", { c: P.ink, w: 1.8 })}
  ${path("M158 72 q14 8 6 20", { c: P.terra, w: 2.4 })}
  ${path("M172 60 q20 10 10 26", { c: P.terra, w: 2.4 })}
  ${path("M186 48 q26 12 14 32", { c: P.terra, w: 2.4 })}
  ${heart(236, 108, 8)}
  ${spark(248, 58, 6)}
  ${circle(52, 132, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 7 · Win people over without the argument — two bubbles, one heart instead of a fight.
function plWinOver() {
  return svg(`
  ${bubble(84, 84, 76, 48, { fill: P.cream })}
  ${tlines(56, 76, 3, { w: 40, gap: 10, c: P.muted })}
  ${bubble(236, 84, 76, 48, { fill: P.cream })}
  ${tlines(208, 92, 2, { w: 40, gap: 10, c: P.muted })}
  ${path("M122 84 L142 80 M122 96 L142 96 M198 80 L178 84 M198 96 L178 96", { c: P.terra, w: 2.2 })}
  ${heart(160, 86, 7)}
  ${spark(160, 56, 6)}
  ${circle(56, 130, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(288, 130, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 8 · See it from their chair — two seats, a swap arrow, a curious eye.
function plChair() {
  return svg(`
  ${path("M50 104 L90 104", { c: P.ink, w: 2.6 })}
  ${path("M50 104 L50 78", { c: P.ink, w: 2.6 })}
  ${path("M50 86 h40", { c: P.ink, w: 2.2 })}
  ${path("M56 104 L56 122 M84 104 L84 122", { c: P.ink, w: 2.2 })}
  ${path("M230 104 L270 104", { c: P.ink, w: 2.6 })}
  ${path("M270 104 L270 78", { c: P.ink, w: 2.6 })}
  ${path("M230 86 h40", { c: P.ink, w: 2.2 })}
  ${path("M236 104 L236 122 M264 104 L264 122", { c: P.ink, w: 2.2 })}
  ${path("M104 102 h112", { c: P.terra, w: 2.2 })}
  ${path("M104 102 L110 96 M104 102 L110 108 M216 102 L210 96 M216 102 L210 108", { c: P.terra, w: 1.8 })}
  ${circle(160, 60, 14, { c: P.ink, w: 2.6 })}
  ${circle(160, 60, 5, { c: P.terra, w: 2, fill: P.terra })}
  ${circle(160, 40, 3, { c: P.muted, w: 1.8 })}
  ${spark(52, 44, 6)}
  ${circle(288, 62, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 9 · Lead with a feather, not a sledgehammer — a soft quill tap.
function plFeather() {
  return svg(`
  ${path("M140 46 L212 152", { c: P.ink, w: 2.2 })}
  ${path("M146 56 L158 46 M156 68 L170 54 M166 80 L182 66 M178 92 L194 78 M190 104 L206 92", { c: P.ink, w: 1.7 })}
  ${path("M140 72 L154 60 M148 84 L164 72 M158 98 L174 86", { c: P.ink, w: 1.7 })}
  ${path("M212 152 q10 9 26 8 q14 -5 4 -16 q-12 2 -20 4 Z", { c: P.ink, w: 2 })}
  ${heart(96, 90, 9)}
  ${spark(246, 56, 6)}
  ${circle(60, 124, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 10 · Your 30-day people experiment — a little habit calendar with ticks.
function pl30Days() {
  let out = rect(64, 40, 132, 26, { rad: 7, lw: 2.6 });
  out += rect(64, 66, 132, 78, { lw: 2.2 });
  out += circle(82, 53, 4, { c: P.terra, w: 1.8, fill: P.terra });
  out += circle(104, 53, 4, { c: P.terra, w: 1.8 });
  out += circle(126, 53, 4, { c: P.terra, w: 1.8 });
  for (let r = 0; r < 3; r++) {
    for (let cI = 0; cI < 5; cI++) {
      const x = 76 + cI * 22, y = 76 + r * 22;
      out += rect(x, y, 14, 12, { rad: 2.5, lw: 1.8, c: P.muted });
      if (r < 1 || (r === 1 && cI < 2)) out += check(x + 7, y + 7, 4, { c: P.terra, w: 2 });
    }
  }
  out += fig(262, 92, { head: 10 });
  out += spark(232, 52, 6);
  out += heart(292, 124, 4);
  return svg(out);
}

// People cover: three friendly souls chatting — bubbles aloft, hearts between.
function peopleCoverArt() {
  return svg(
    `
  ${sun(600, 58, 24, { inner: true, rays: 10 })}
  ${bubble(150, 66, 116, 50, { fill: P.cream })}
  ${tlines(108, 58, 3, { w: 84, gap: 10, c: P.muted })}
  ${bubble(470, 66, 116, 50, { fill: P.cream })}
  ${tlines(428, 58, 3, { w: 84, gap: 10, c: P.muted })}
  ${fig(160, 148, { head: 12 })}
  ${fig(370, 134, { head: 14 })}
  ${fig(560, 148, { head: 12 })}
  ${heart(266, 130, 9)}
  ${spark(358, 104, 8)}
  ${heart(496, 132, 7)}
  ${circle(94, 116, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(626, 116, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(300, 208, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(438, 208, 3.2, { c: P.muted, w: 1.8 })}
`,
    { w: 720, h: 250 }
  );
}

// ---------------------------------------------------------------- cache theme
// The prefix-cache zoo: token strings, KV blocks, a cache shelf, eviction
// arrows, the radix tree, dials, gauges and habit calendars — same warm
// palette, geek-flavored imagery for a book about cache hits and memory.

// A rounded memory block — the unit of a KV cache.
function cblock(x, y, w, h, opts = {}) {
  const { c = P.ink, fill = "none", lw = 2.4, rad = 6 } = opts;
  return rect(x, y, w, h, { rad, c, lw, fill });
}

// A row of small "tokens" — the atoms of a prompt.
function tokens(x, y, n, opts = {}) {
  const { gap = 19, r = 3, c = P.muted, fill = "none" } = opts;
  let out = "";
  for (let i = 0; i < n; i++) out += circle(x + i * gap, y, r, { c, w: 1.8, fill });
  return out;
}

// A tiny hash tick for a cached block (circle + diagonal slash).
function hashTick(x, y, opts = {}) {
  const { c = P.terra, s = 5 } = opts;
  return circle(x, y, s * 0.3, { c, w: 1.6 }) + path(`M${x - s} ${y + s * 0.4} L${x + s} ${y - s * 0.4}`, { c, w: 1.5 });
}

// A semicircle hit-rate dial with a needle at `pct` (0..1).
function dial(x, y, r, pct, opts = {}) {
  const { c = P.ink, w = 4 } = opts;
  const a = Math.PI * (1 - Math.max(0, Math.min(1, pct)));
  const nx = x + Math.cos(a) * r * 0.82, ny = y - Math.sin(a) * r * 0.82;
  return path(`M${x - r} ${y} A${r} ${r} 0 0 1 ${x + r} ${y}`, { c, w }) +
    path(`M${x} ${y} L${nx} ${ny}`, { c: P.terra, w: 2.6 }) +
    circle(x, y, r * 0.05, { c: P.terra, w: 1.8, fill: P.terra });
}

// A little padlock — "keep this part of the prompt the same".
function lock(x, y, s = 8, opts = {}) {
  const { c = P.terra, w = 2 } = opts;
  return rect(x, y + s * 0.5, s * 1.2, s * 0.75, { rad: 2.5, c, lw: w }) +
    path(`M${x + s * 0.22} ${y + s * 0.6} L${x + s * 0.22} ${y + s * 0.18} a${s * 0.38} ${s * 0.38} 0 0 1 ${s * 0.76} 0 L${x + s * 0.98} ${y + s * 0.3}`, { c, w: w * 0.9 });
}

// 1 · The five-minute case — one prompt, two roads: a long recompute around
//    and a short hop through the cache shelf.
function pc1FiveMin() {
  return svg(`
  ${tokens(26, 40, 14, { gap: 19 })}
  ${path("M26 58 C70 30 200 30 248 56 C284 70 282 110 262 122", { c: P.soft, w: 2.2 })}
  ${circle(300, 78, 9, { c: P.muted, w: 2 })}
  ${path("M300 72 L300 78 M300 78 L306 81", { c: P.muted, w: 1.5 })}
  ${cblock(64, 92, 58, 34, { fill: P.cream })}
  ${tlines(74, 102, 2, { w: 38, gap: 9, c: P.terra })}
  ${check(140, 99, 6)}
  ${hashTick(158, 96)}
  ${bubble(252, 128, 62, 42, { fill: P.cream })}
  ${tlines(228, 124, 2, { w: 46, gap: 9, c: P.muted })}
  ${harrow(122, 128, 98, { c: P.terra })}
  ${spark(186, 56, 6)}
  ${spark(240, 120, 5)}
  ${circle(40, 148, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 2 · How your LLM thinks — prompt in, a full prefill pass, a token-by-token
//    decode, and the KV notebook that remembers it all.
function pc2Phases() {
  return svg(`
  ${cblock(32, 56, 62, 42, { fill: P.cream })}
  ${tlines(40, 68, 3, { w: 44, gap: 11, c: P.muted })}
  ${harrow(94, 77, 22)}
  ${cblock(116, 46, 58, 52, { fill: P.cream })}
  ${tokens(130, 60, 6, { gap: 10, r: 3.4 })}
  ${tokens(130, 78, 6, { gap: 10, r: 3.4 })}
  ${path("M116 66 h58", { c: P.sand, w: 1.6 })}
  ${harrow(174, 74, 22)}
  ${tokens(198, 62, 3, { gap: 13 })}
  ${tokens(216, 82, 2, { gap: 13 })}
  ${tokens(198, 98, 3, { gap: 13, r: 3.6, c: P.terra })}
  ${rect(96, 130, 20, 20, { fill: P.cream, c: P.ink, lw: 2.2 })}
  ${rect(122, 130, 20, 20, { fill: P.cream, c: P.ink, lw: 2.2 })}
  ${path("M106 130 L106 150 M132 130 L132 150", { c: P.soft, w: 1.5 })}
  ${path("M96 140 L116 140 M122 140 L142 140", { c: P.sand, w: 1.7 })}
  ${spark(156, 120, 5)}
  ${harrow(158, 140, 66, { c: P.muted })}
  ${check(232, 134, 7)}
  ${circle(286, 162, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 3 · What a cache hit does — the saved prefix matches, the big re-read is
//    skipped (crossed out), and only the new tail gets computed.
function pc3Hit() {
  return svg(`
  ${tokens(26, 40, 12, { gap: 18, c: P.terra, fill: P.terra })}
  ${tokens(26, 66, 10, { gap: 18, c: P.terra })}
  ${tokens(206, 66, 2, { gap: 18 })}
  ${path("M26 82 h162", { c: P.terra, w: 2 })}
  ${path("M26 79 v6 M188 79 v6", { c: P.terra, w: 1.6 })}
  ${check(168, 72, 6)}
  ${circle(66, 130, 17, { c: P.muted, w: 2.2, dash: "3 3" })}
  ${path("M55 118 L77 142 M77 118 L55 142", { c: P.muted, w: 1.8 })}
  ${bubble(228, 132, 70, 42, { fill: P.cream })}
  ${tlines(204, 128, 2, { w: 48, gap: 8, c: P.muted })}
  ${path("M222 74 L222 100 h46", { c: P.terra, w: 2.2 })}
  ${path("M268 100 L258 92 M268 100 L258 108", { c: P.terra, w: 2.2 })}
  ${spark(44, 108, 5)}
  ${circle(306, 164, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 4 · vLLM on autopilot — hashed blocks in a row, one evicted into the LRU
//    basket, a small engine purring beside.
function pc4Autopilot() {
  let out = "";
  for (let i = 0; i < 3; i++) {
    const x = 52 + i * 62;
    out += cblock(x, 60, 48, 40, { fill: i === 1 ? P.cream : "none" });
    out += hashTick(x + 59, 52);
    out += tlines(x + 10, 72, 2, { w: 28, gap: 9, c: P.muted });
  }
  out += downArrow(190, 104, 26, { c: P.terra });
  out += cblock(166, 132, 52, 22, { c: P.muted });
  out += tlines(176, 139, 2, { w: 28, gap: 8, c: P.muted });
  out += circle(250, 146, 12, { c: P.terra, w: 2.4 });
  out += path("M250 132 v4 M250 156 v4 M236 146 h3 M261 146 h3 M240 136 l3 3 M260 156 l3 3 M260 136 l-3 3 M240 156 l-3 3", { c: P.terra, w: 1.8 });
  out += circle(250, 146, 5, { c: P.soft, w: 1.8 });
  out += spark(58, 32, 6);
  out += spark(286, 158, 5);
  return svg(out);
}

// 5 · RadixAttention — one shared root branches into two conversations that
//    both reuse the same prefix.
function pc5Tree() {
  return svg(`
  ${circle(160, 38, 8, { c: P.terra, w: 2.4, fill: P.terra })}
  ${path("M160 46 L160 74", { c: P.ink, w: 2.4 })}
  ${path("M110 74 L210 74", { c: P.ink, w: 2.4 })}
  ${path("M126 74 L126 120", { c: P.ink, w: 2.2 })}
  ${path("M194 74 L194 120", { c: P.ink, w: 2.2 })}
  ${cblock(100, 120, 52, 30, { fill: P.cream })}
  ${tlines(110, 130, 2, { w: 32, gap: 7, c: P.muted })}
  ${cblock(170, 120, 50, 30, { fill: P.cream })}
  ${tlines(180, 130, 2, { w: 30, gap: 7, c: P.muted })}
  ${spark(88, 32, 5)}
  ${spark(232, 128, 5)}
  ${check(132, 30, 5)}
  ${circle(290, 92, 62, { c: P.sand, w: 2 })}`);
}

// 6 · The memory monster — a tower of KV blocks squeezing against a small GPU
//    card whose memory bars are nearly full.
function pc6Monster() {
  let out = "";
  out += cblock(48, 38, 46, 26);
  out += cblock(48, 68, 46, 26);
  out += cblock(48, 98, 46, 26);
  out += cblock(48, 128, 46, 26, { c: P.terra });
  out += path("M71 33 L71 152", { c: P.sand, w: 2 });
  out += path("M71 28 q-4 -7 -2 -11 M71 156 q-6 6 -4 12", { c: P.sand, w: 1.6 });
  out += cblock(118, 42, 56, 34, { fill: P.cream });
  out += tlines(130, 54, 2, { w: 32, gap: 8, c: P.terra });
  out += path("M118 34 q-6 -8 -16 -10 q-13  visible 2 -13 12 Z", { c: P.soft, w: 2 });
  out += rect(204, 34, 100, 112, { rad: 10, lw: 3 });
  out += circle(222, 52, 7, { c: P.terra, w: 2 });
  out += rect(214, 70, 80, 18, { rad: 3, c: P.muted, w: 2 });
  out += rect(214, 94, 80, 18, { rad: 3, c: P.muted, w: 2 });
  out += rect(214, 118, 80, 18, { rad: 3, c: P.soft, w: 2 });
  out += rect(218, 72, 78, 16, { fill: P.terra, lw: 0.01 });
  out += rect(218, 96, 62, 16, { fill: P.soft, lw: 0.01 });
  out += rect(218, 120, 38, 16, { fill: P.cream, lw: 0.01 });
  out += spark(140, 24, 6);
  out += spark(288, 28, 5);
  out += circle(278, 162, 3.4, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 7 · Your first tuning — keep_alive in a terminal, a stopwatch for "stay",
//    and two memory bars: f16 eats VRAM, q8 leaves room.
function pc7Ollama() {
  return svg(`
  ${termWin(34, 36, 138, 102)}
  ${path("M46 52 h20", { c: P.terra, w: 2.4 })}
  ${rect(46, 58, 108, 15, { rad: 3, c: P.terra, w: 1.8 })}
  ${path("M46 88 h16", { c: P.muted, w: 2 })}
  ${tlines(46, 102, 3, { w: 64, gap: 8, c: P.soft })}
  ${circle(210, 56, 13, { c: P.muted, w: 2.2 })}
  ${path("M210 48 L210 56 L216 60", { c: P.muted, w: 1.8 })}
  ${path("M204 76 L216 76 M210 69 L210 76", { c: P.muted, w: 1.8 })}
  ${check(238, 54, 6)}
  ${rect(184, 96, 76, 18, { rad: 4, fill: P.cream, lw: 2.2 })}
  ${rect(188, 100, 56, 12, { fill: P.terra, lw: 0.01 })}
  ${rect(184, 126, 76, 18, { rad: 4, fill: P.cream, lw: 2.2 })}
  ${rect(188, 130, 32, 12, { fill: P.terra, lw: 0.01 })}
  ${path("M184 120 h76 M184 150 h76", { c: P.sand, w: 1.5 })}
  ${spark(278, 154, 5)}
  ${spark(282, 44, 5)}`);
}

// 8 · The prompt hacker — a stable prefix box locked and checked, the dynamic
//    bit crossed out, and an append-only arrow with a plus at the end.
function pc8PromptHacker() {
  return svg(`
  ${rect(40, 34, 240, 106, { rad: 12, lw: 2.8 })}
  ${path("M40 52 L280 52", { c: P.sand, w: 1.6 })}
  ${rect(52, 42, 148, 42, { rad: 8, fill: P.cream, lw: 2.2 })}
  ${tlines(64, 56, 3, { w: 118, gap: 10, c: P.terra })}
  ${check(224, 52, 6)}
  ${lock(244, 48, 8)}
  ${path("M52 100 h188", { c: P.muted, w: 2 })}
  ${path("M52 118 h188", { c: P.muted, w: 2 })}
  ${path("M188 102 L212 108 M210 102 L186 108", { c: P.terra, w: 2.2 })}
  ${tlines(58, 110, 1, { w: 96, c: P.muted })}
  ${downArrow(250, 92, 36, { c: P.terra })}
  ${path("M244 116 h12 M250 110 v12", { c: P.terra, w: 2 })}
  ${spark(70, 30, 6)}
  ${spark(278, 168, 5)}`);
}

// 9 · When caching pays — a tall latency bar becomes a stub, a price tag, and
//    an 87% hit-rate dial.
function pc9Numbers() {
  return svg(`
  ${tag(56, 36, 9, { c: P.terra })}
  ${rect(52, 66, 44, 72, { lw: 2.4 })}
  ${tlines(60, 72, 2, { w: 28, gap: 8, c: P.soft })}
  ${rect(112, 108, 44, 30, { lw: 2.4 })}
  ${tlines(120, 114, 2, { w: 28, gap: 8, c: P.soft })}
  ${downArrow(134, 92, 22, { c: P.terra })}
  ${path("M56 156 L290 156", { c: P.sand, w: 2 })}
  ${harrow(172, 62, 40, { c: P.terra })}
  ${dial(238, 124, 30, 0.87)}
  ${check(210, 70, 6)}
  ${spark(282, 48, 6)}
  ${circle(300, 160, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 10 · The 30-day experiment — a habit calendar with ticks and a hit-rate
//     line climbing.
function pc10Thirty() {
  let out = rect(44, 40, 122, 98, { rad: 8, lw: 2.4 });
  out += rect(44, 58, 122, 9, { fill: P.cream });
  out += circle(57, 47, 3.2, { c: P.terra, w: 1.6, fill: P.terra });
  out += circle(73, 47, 3.2, { c: P.terra, w: 1.6 });
  out += circle(89, 47, 3.2, { c: P.terra, w: 1.6 });
  for (let r = 0; r < 3; r++) {
    for (let cI = 0; cI < 6; cI++) {
      const x = 54 + cI * 18, y = 74 + r * 20;
      out += rect(x, y, 13, 12, { rad: 2.5, lw: 1.6, c: P.muted });
      if (r === 0 || (r === 1 && cI < 2)) out += check(x + 6.5, y + 6.5, 4, { c: P.terra, w: 2 });
    }
  }
  out += circle(202, 112, 26, { c: P.sand, w: 2 });
  out += path("M190 136 L248 70", { c: P.terra, w: 2.6 });
  out += path("M240 64 L252 70 L242 78", { c: P.terra, w: 2.2 });
  out += spark(252, 48, 6);
  out += check(198, 108, 6);
  out += circle(288, 150, 3.4, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// Cache cover: tokens stream in, a shelf of cached blocks serves a fast
// answer, the old road is slow, and a hit-rate dial smiles at the corner.
function cacheCoverArt() {
  return svg(
    `
  ${sun(620, 54, 22, { inner: true, rays: 10 })}
  ${tokens(36, 46, 26, { gap: 17 })}
  ${path("M36 58 C36 88 92 96 88 118 C84 140 146 138 150 150", { c: P.soft, w: 2.6 })}
  ${circle(64, 122, 11, { c: P.muted, w: 2.2 })}
  ${path("M64 114 L64 122 M64 122 L71 125", { c: P.muted, w: 1.7 })}
  ${cblock(70, 92, 66, 42, { fill: P.cream })}
  ${tlines(80, 104, 2, { w: 46, gap: 9, c: P.terra })}
  ${hashTick(148, 94)}
  ${cblock(160, 108, 30, 26, { c: P.muted })}
  ${cblock(196, 92, 30, 44, { c: P.muted })}
  ${harrow(226, 128, 42, { c: P.terra })}
  ${bubble(328, 118, 152, 64, { fill: P.cream })}
  ${tlines(284, 110, 3, { w: 122, gap: 12, c: P.soft })}
  ${spark(296, 56, 7)}
  ${spark(370, 150, 7)}
  ${circle(440, 54, 18, { c: P.sand, w: 2.2 })}
  ${circle(440, 54, 9, { c: P.sand, w: 1.6 })}
  ${path("M470 44 L522 196", { c: P.muted, w: 2 })}
  ${path("M140 188 L140 214 L268 214 L268 186", { c: P.muted, w: 2 })}
  ${path("M140 214 L204 168 L268 214", { c: P.muted, w: 2 })}
  ${circle(204, 168, 4, { c: P.muted, w: 1.8, fill: P.muted })}
  ${dial(600, 182, 44, 0.82)}
  ${circle(40, 218, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(296, 218, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(680, 152, 3.2, { c: P.muted, w: 1.8 })}
`,
    { w: 720, h: 250 }
  );
}

// ---------------------------------------------------------------- spark theme
// The desk-sized AI supercomputer: a golden cube, its GB10 brain, shared
// memory, the petaFLOP burst, a network-linked pair, Docker one-liners, local
// agents, fine-tuning, a growing ecosystem and the $4,000 verdict — warm line
// art for the DGX Spark book.

// 1 · A supercomputer on your desk — the little cube, a desk line, sparks.
function sp1DeskSupercomputer() {
  return svg(`
  ${rect(92, 42, 136, 88, { rad: 14, lw: 3 })}
  ${rect(102, 52, 116, 46, { rad: 8, fill: P.cream, lw: 2.2 })}
  ${circle(160, 80, 13, { c: P.terra, w: 2.4 })}
  ${circle(160, 80, 6, { c: P.terra, w: 2 })}
  ${path("M160 60 L160 56 M160 96 L160 100 M141 80 L137 80 M179 80 L183 80", { c: P.terra, w: 1.6 })}
  ${rect(102, 104, 116, 26, { rad: 4, lw: 2 })}
  ${path("M112 112 h96 M112 122 h96", { c: P.sand, w: 1.8 })}
  ${path("M84 132 L236 132 L236 142", { c: P.ink, w: 2.6 })}
  ${spark(60, 42, 7)}
  ${spark(266, 62, 6)}
  ${spark(236, 126, 4.5)}
  ${circle(60, 124, 3.2, { c: P.muted, w: 1.8, fill: P.muted })}
  ${circle(284, 100, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 2 · Meet GB10 — one chip package, CPU on one side, GPU on the other,
//    joined by an NVLink node in the middle.
function sp2Superchip() {
  return svg(`
  ${rect(44, 30, 232, 112, { rad: 16, lw: 3 })}
  ${path("M160 30 L160 142", { c: P.sand, w: 1.8 })}
  ${rect(58, 44, 86, 78, { rad: 8, fill: P.cream, lw: 2.2 })}
  ${rect(176, 44, 86, 78, { rad: 8, fill: P.cream, lw: 2.2 })}
  ${tlines(68, 62, 3, { w: 64, gap: 15, c: P.muted })}
  ${tlines(186, 54, 4, { w: 60, gap: 12, c: P.terra })}
  ${circle(160, 92, 12, { c: P.terra, w: 2.6, fill: P.cream })}
  ${path("M152 82 L168 102 M168 82 L152 102", { c: P.terra, w: 2 })}
  ${path("M44 152 h38 M192 152 h38 M232 152 h38", { c: P.muted, w: 1.4 })}
  ${spark(288, 118, 5)}
  ${circle(30, 74, 3, { c: P.soft, w: 1.6, fill: P.soft })}
  ${circle(294, 74, 3, { c: P.soft, w: 1.6, fill: P.soft })}`);
}

// 3 · 128 GB unified memory — CPU and GPU both reach the same big pool.
function sp3UnifiedMemory() {
  return svg(`
  ${rect(26, 60, 54, 62, { rad: 8, lw: 2.6 })}
  ${rect(68, 74, 8, 8, { c: P.terra, w: 1.8, fill: P.terra })}
  ${rect(240, 60, 54, 62, { rad: 8, lw: 2.6 })}
  ${rect(272, 74, 8, 8, { c: P.terra, w: 1.8, fill: P.terra })}
  ${rect(112, 32, 96, 100, { rad: 10, fill: P.cream, lw: 3 })}
  ${tlines(124, 52, 5, { w: 68, gap: 15, c: P.muted })}
  ${path("M80 92 L112 92 M208 92 L240 92", { c: P.terra, w: 2.4 })}
  ${path("M104 84 L112 92 L104 100 M216 84 L208 92 L216 100", { c: P.terra, w: 2.4 })}
  ${path("M160 132 L160 144", { c: P.terra, w: 2.4 })}
  ${spark(160, 150, 6)}
  ${circle(288, 30, 3.4, { c: P.muted, w: 1.8 })}
  ${circle(30, 132, 3.4, { c: P.muted, w: 1.8 })}`);
}

// 4 · The petaFLOP pinch — a fast bolt, a narrowing funnel (memory bandwidth),
//    and a small memory chip that sets the real pace.
function sp4Petaflop() {
  return svg(`
  ${path("M64 36 L112 36 L82 88 L106 88 L58 152 L84 98 L46 98 Z", { c: P.terra, w: 2.4 })}
  ${spark(128, 46, 6)}
  ${path("M152 40 L210 90 C216 96 216 104 210 110 L152 158", { c: P.muted, w: 2.6 })}
  ${path("M152 40 L186 72 M162 118 L186 140", { c: P.sand, w: 2 })}
  ${rect(232, 116, 60, 40, { rad: 8, lw: 2.4 })}
  ${tlines(242, 128, 2, { w: 40, gap: 12, c: P.terra })}
  ${circle(292, 30, 13, { c: P.muted, w: 2.2 })}
  ${path("M285 25 L299 34 M299 25 L285 34", { c: P.muted, w: 1.7 })}
  ${circle(46, 160, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(284, 160, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 5 · Two Sparks beat one — a pair of cubes joined by a thick link, both
//    feeding a bigger shared model.
function sp5Cluster() {
  return svg(`
  ${rect(50, 56, 64, 70, { rad: 8, lw: 3 })}
  ${rect(206, 56, 64, 70, { rad: 8, lw: 3 })}
  ${rect(60, 66, 44, 26, { rad: 5, c: P.cream, lw: 2 })}
  ${rect(216, 66, 44, 26, { rad: 5, c: P.cream, lw: 2 })}
  ${circle(82, 108, 7, { c: P.terra, w: 2, fill: P.terra })}
  ${circle(238, 108, 7, { c: P.terra, w: 2, fill: P.terra })}
  ${path("M114 108 L142 108 M178 108 L206 108", { c: P.terra, w: 3 })}
  ${path("M138 100 L142 108 L138 116 M182 100 L178 108 L182 116", { c: P.terra, w: 2.4 })}
  ${circle(160, 108, 11, { c: P.terra, w: 2.6 })}
  ${path("M155 100 L165 116 M165 100 L155 116", { c: P.terra, w: 2 })}
  ${spark(160, 136, 6)}
  ${spark(284, 130, 5)}
  ${circle(28, 136, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 6 · Your first local model — a terminal runs the one-liner, and the model
//    chip is served to a chat bubble.
function sp6FirstModel() {
  return svg(`
  ${termWin(30, 30, 150, 102)}
  ${path("M42 46 h22", { c: P.terra, w: 2.6 })}
  ${rect(42, 52, 126, 13, { rad: 3, c: P.terra, w: 1.8 })}
  ${path("M42 92 h16", { c: P.muted, w: 2 })}
  ${tlines(42, 106, 2, { w: 60, gap: 9, c: P.soft })}
  ${path("M206 82 L212 66 L280 66 L286 82 Z", { c: P.muted, w: 1.8 })}
  ${rect(212, 82, 68, 44, { rad: 8, fill: P.cream, lw: 2.6 })}
  ${tlines(224, 94, 3, { w: 44, gap: 10, c: P.muted })}
  ${harrow(280, 102, 26)}
  ${bubble(262, 140, 54, 34, { fill: P.cream })}
  ${path("M220 146 h18", { c: P.soft, w: 2 })}
  ${spark(234, 138, 4)}
  ${circle(288, 36, 4, { c: P.muted, w: 1.8, fill: P.muted })}
  ${circle(40, 152, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 7 · An agent that never leaks — a little brain in a box, padlocked, with a
//    crossed-out cloud outside.
function sp7AgentLock() {
  return svg(`
  ${rect(60, 44, 176, 88, { rad: 10, lw: 2.8 })}
  ${circle(106, 70, 12, { c: P.ink, w: 2.2 })}
  ${circle(130, 70, 12, { c: P.ink, w: 2.2 })}
  ${path("M98 70 Q118 54 138 70", { c: P.ink, w: 2.2 })}
  ${circle(104, 68, 1.8, { c: P.ink, w: 1.4, fill: P.ink })}
  ${circle(121, 68, 1.8, { c: P.ink, w: 1.4, fill: P.ink })}
  ${rect(90, 76, 32, 24, { rad: 18, c: P.ink, w: 2 })}
  ${path("M106 100 L106 110", { c: P.ink, w: 1.8 })}
  ${lock(188, 70, 9)}
  ${noCloud(216, 52, 12)}
  ${spark(64, 32, 5)}
  ${circle(34, 104, 3, { c: P.muted, w: 1.8 })}
  ${circle(286, 96, 3, { c: P.muted, w: 1.8 })}`);
}

// 8 · Fine-tune big models locally — a tuning dial, a weights bar being
//    adjusted, and a happy check.
function sp8Finetune() {
  return svg(`
  ${circle(76, 62, 20, { c: P.terra, w: 2.6 })}
  ${circle(76, 62, 7, { c: P.terra, w: 1.8 })}
  ${path("M76 38 L76 48 M95 42 L90 50 M76 70 L76 80 M51 50 L57 45", { c: P.terra, w: 1.8 })}
  ${path("M76 62 L85 53", { c: P.terra, w: 2.2 })}
  ${rect(136, 82, 126, 56, { rad: 8, fill: P.cream, lw: 2.4 })}
  ${rect(146, 96, 106, 16, { rad: 3, c: P.muted, w: 1.8 })}
  ${rect(146, 96, 64, 16, { rad: 3, fill: P.terra, lw: 0.01 })}
  ${rect(146, 120, 106, 10, { rad: 3, c: P.muted, w: 1.6 })}
  ${harrow(104, 62, 22)}
  ${check(224, 120, 8)}
  ${spark(282, 140, 5)}
  ${circle(40, 132, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 9 · The ecosystem report — a shelf of docs and boxes growing, a dial up.
function sp9Ecosystem() {
  return svg(`
  ${rect(58, 100, 204, 8, { fill: P.cream, lw: 2 })}
  ${rect(72, 80, 42, 20, { rad: 4, lw: 2 })}
  ${rect(122, 72, 46, 28, { rad: 4, c: P.terra, lw: 2.2 })}
  ${rect(176, 62, 62, 38, { rad: 4, lw: 2 })}
  ${tlines(82, 86, 2, { w: 20, gap: 5, c: P.muted })}
  ${tlines(132, 80, 3, { w: 24, gap: 6, c: P.muted })}
  ${tlines(186, 72, 2, { w: 42, gap: 8, c: P.muted })}
  ${tlines(186, 90, 2, { w: 30, gap: 6, c: P.muted })}
  ${circle(160, 100, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(180, 100, 3.2, { c: P.muted, w: 1.8 })}
  ${path("M64 52 L108 52 L86 84 Z", { c: P.terra, w: 2.4 })}
  ${spark(70, 38, 5)}
  ${spark(96, 30, 4)}
  ${circle(276, 78, 14, { c: P.terra, w: 2.2 })}
  ${path("M276 78 L276 69", { c: P.terra, w: 2 })}
  ${circle(276, 128, 2.8, { c: P.soft, w: 1.6, fill: P.soft })}`);
}

// 10 · Should you swipe the card? — a credit card, an arrow, a Spark cube,
//     and a satisfied check.
function sp10Verdict() {
  return svg(`
  ${rect(48, 70, 92, 56, { rad: 9, lw: 2.8 })}
  ${path("M60 84 h68", { c: P.terra, w: 3 })}
  ${tlines(60, 100, 3, { w: 58, gap: 11, c: P.soft })}
  ${harrow(144, 100, 18)}
  ${rect(170, 68, 62, 56, { rad: 8, fill: P.cream, lw: 2.6 })}
  ${circle(212, 72, 5, { c: P.terra, w: 2, fill: P.terra })}
  ${path("M200 99 L224 90", { c: P.muted, w: 2 })}
  ${spark(224, 52, 7)}
  ${check(240, 136, 8)}
  ${circle(286, 56, 3.4, { c: P.muted, w: 1.8 })}
  ${circle(52, 146, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// Spark cover: a golden desktop supercomputer glowing on a desk, its little
// sibling beside it, sparks flying — the "AI lab in a box" at home.
function sparkCoverArt() {
  return svg(
    `
  ${sun(600, 46, 20, { inner: true, rays: 10 })}
  ${path("M70 158 L650 158", { c: P.sand, w: 3 })}
  ${rect(250, 52, 220, 80, { rad: 14, lw: 3 })}
  ${rect(268, 64, 184, 40, { rad: 8, fill: P.cream, lw: 2 })}
  ${circle(288, 66, 7, { c: P.terra, w: 2, fill: P.terra })}
  ${circle(434, 66, 7, { c: P.terra, w: 2 })}
  ${path("M288 66 L288 78 M434 66 L434 78", { c: P.terra, w: 1.8 })}
  ${path("M250 106 h220 M250 118 h220", { c: P.ink, w: 2.2 })}
  ${spark(360, 128, 12)}
  ${spark(300, 150, 7)}
  ${spark(430, 156, 6)}
  ${rect(96, 116, 52, 42, { rad: 8, lw: 2.4 })}
  ${rect(106, 126, 34, 22, { rad: 5, c: P.cream, lw: 1.8 })}
  ${path("M148 118 L148 136 M96 158 L148 158", { c: P.muted, w: 1.6 })}
  ${path("M150 116 L198 100", { c: P.terra, w: 2.2 })}
  ${path("M196 92 L198 100 L206 98", { c: P.terra, w: 2 })}
  ${circle(64, 130, 5, { c: P.muted, w: 1.8 })}
  ${circle(286, 190, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(430, 190, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(96, 190, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}
`,
    { w: 720, h: 250 }
  );
}

// ---------------------------------------------------------------- studio theme
// The no-code fine-tuning studio: a Spark cube plus a friendly GUI — model
// shelves, data cards, training runs, loss curves, meltdowns, serving and the
// bigger-next-level roadmap. Same warm palette, imagery shaped like Unsloth
// Studio: short glyph-free pictograms, so no words are needed.

// 1 · A training lab inside a desk cube — Spark box, a "TRAIN" banner, sparks.
function st1DeskLab() {
  return svg(`
  ${rect(82, 42, 136, 88, { rad: 13, lw: 3 })}
  ${rect(94, 52, 112, 40, { rad: 7, fill: P.cream, lw: 2.2 })}
  ${tlines(106, 66, 2, { w: 88, gap: 10, c: P.muted })}
  ${circle(178, 72, 11, { c: P.terra, w: 2.2 })}
  ${circle(178, 72, 4.6, { c: P.terra, w: 1.8 })}
  ${path("M178 56 L178 51 M178 88 L178 92 M162 72 L157 72 M194 72 L199 72", { c: P.terra, w: 1.6 })}
  ${rect(94, 96, 112, 24, { rad: 4, lw: 2 })}
  ${path("M106 106 h54", { c: P.terra, w: 3 })}
  ${path("M84 128 L216 128 L220 138", { c: P.ink, w: 2.4 })}
  ${rect(232, 58, 30, 22, { rad: 4, c: P.muted, w: 2 })}
  ${path("M250 58 L250 44 M246 48 L250 44 L254 48", { c: P.muted, w: 2 })}
  ${check(292, 116, 8)}
  ${spark(58, 44, 7)}
  ${spark(278, 42, 6)}
  ${circle(58, 130, 3.2, { c: P.muted, w: 1.8, fill: P.muted })}
  ${circle(286, 96, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 2 · Meet the Studio — one GUI window: model box, data box, Train button.
function st2StudioWindow() {
  return svg(`
  ${rect(36, 30, 248, 116, { rad: 12, lw: 3 })}
  ${path("M36 56 L284 56", { c: P.sand, w: 1.8 })}
  ${circle(52, 43, 3, { c: P.terra, w: 1.8, fill: P.terra })}
  ${circle(66, 43, 3, { c: P.muted, w: 1.8 })}
  ${circle(80, 43, 3, { c: P.soft, w: 1.8 })}
  ${rect(44, 70, 84, 36, { rad: 6, fill: P.cream, lw: 2.2 })}
  ${rect(54, 79, 64, 11, { rad: 3, c: P.terra, w: 1.8 })}
  ${tlines(54, 96, 2, { w: 50, gap: 6, c: P.muted })}
  ${rect(138, 70, 60, 22, { rad: 5, c: P.muted, w: 1.8 })}
  ${tlines(150, 82, 1, { w: 36, c: P.soft })}
  ${rect(138, 108, 98, 26, { rad: 4, fill: P.cream, lw: 1.8 })}
  ${tlines(150, 118, 2, { w: 72, gap: 9, c: P.muted })}
  ${rect(214, 102, 58, 30, { rad: 15, fill: P.terra, lw: 2 })}
  ${path("M230 117 h26", { c: P.cream, w: 2.6 })}
  ${spark(288, 32, 5)}
  ${spark(46, 112, 5)}`);
}

// 3 · Pick a model — a shelf of model boxes; the middle one is your 4-bit pick.
function st3ModelShelf() {
  return svg(`
  ${rect(40, 118, 240, 7, { fill: P.cream })}
  ${rect(52, 86, 46, 34, { rad: 5, lw: 2.2 })}
  ${rect(112, 72, 56, 46, { rad: 6, fill: P.cream, lw: 2.6 })}
  ${rect(184, 58, 62, 60, { rad: 6, lw: 2.2 })}
  ${tlines(62, 98, 2, { w: 26, gap: 8, c: P.muted })}
  ${tlines(124, 88, 3, { w: 32, gap: 9, c: P.soft })}
  ${tlines(196, 76, 4, { w: 38, gap: 9, c: P.muted })}
  ${tag(140, 62, 8, { c: P.terra })}
  ${circle(180, 108, 4, { c: P.terra, w: 1.8, fill: P.terra })}
  ${path("M184 108 L244 108", { c: P.sand, w: 1.6 })}
  ${spark(268, 40, 6)}
  ${circle(44, 70, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 4 · Your data, served warm — a document with instruction/output lines.
function st4DataWarm() {
  return svg(`
  ${rect(64, 30, 132, 108, { rad: 8, fill: P.cream, lw: 2.6 })}
  ${path("M64 58 L196 58", { c: P.terra, w: 2 })}
  ${tlines(78, 44, 1, { w: 104, c: P.terra })}
  ${path("M78 70 h116 M78 82 h92 M78 94 h108 M78 106 h84 M78 118 h98", { c: P.muted, w: 1.9 })}
  ${circle(80, 118, 3, { c: P.terra, w: 1.6, fill: P.terra })}
  ${circle(100, 106, 3, { c: P.terra, w: 1.6 })}
  ${pencil(222, 92, 12)}
  ${tag(250, 70, 9, { c: P.terra })}
  ${spark(244, 96, 6)}
  ${circle(58, 144, 3.4, { c: P.muted, w: 1.8 })}
  ${circle(184, 158, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 5 · The Flash Attention detour — terminal, a bolt, and a green check.
function st5FlashBolt() {
  return svg(`
  ${termWin(32, 34, 152, 102)}
  ${path("M44 52 h22", { c: P.terra, w: 2.6 })}
  ${rect(44, 56, 126, 14, { rad: 3, c: P.terra, w: 1.8 })}
  ${path("M44 90 h16", { c: P.muted, w: 2 })}
  ${tlines(44, 104, 3, { w: 64, gap: 8, c: P.soft })}
  ${path("M212 44 L224 84 L238 62 L250 84 L264 42", { c: P.terra, w: 3, fill: P.cream })}
  ${check(226, 132, 8)}
  ${spark(286, 50, 6)}
  ${circle(176, 150, 3, { c: P.muted, w: 1.8 })}
  ${circle(64, 28, 3, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 6 · Your first run — the Studio run card: model, data, progress, checkpoints.
function st6RunCard() {
  return svg(`
  ${rect(40, 34, 240, 112, { rad: 10, lw: 2.6 })}
  ${path("M40 58 L280 58", { c: P.sand, w: 1.6 })}
  ${circle(56, 46, 3, { c: P.terra, w: 1.8, fill: P.terra })}
  ${rect(52, 70, 58, 26, { rad: 4, fill: P.cream, lw: 2 })}
  ${tlines(62, 80, 3, { w: 38, gap: 4.5, c: P.muted })}
  ${rect(122, 70, 58, 26, { rad: 4, fill: P.cream, lw: 2 })}
  ${tlines(132, 80, 3, { w: 38, gap: 4.5, c: P.muted })}
  ${rect(192, 84, 76, 12, { rad: 4, c: P.muted, w: 1.6 })}
  ${rect(192, 84, 52, 12, { fill: P.terra, lw: 0.01 })}
  ${circle(210, 146, 2.6, { c: P.muted, w: 1.6 })}
  ${rect(52, 122, 128, 6, { rad: 3, c: P.muted, w: 1.4 })}
  ${circle(58, 125, 3, { c: P.terra, w: 1.4, fill: P.terra })}
  ${circle(92, 125, 3, { c: P.muted, w: 1.4 })}
  ${circle(126, 125, 3, { c: P.muted, w: 1.4 })}
  ${circle(160, 125, 3, { c: P.muted, w: 1.4 })}
  ${circle(252, 66, 12, { c: P.terra, w: 2 })}
  ${path("M252 57 L252 75 M244 66 L260 66", { c: P.terra, w: 1.6 })}
  ${spark(288, 140, 5)}`);
}

// 7 · Read the dashboard — a loss curve sloping down to a happy dial.
function st7LossCurve() {
  return svg(`
  ${rect(36, 72, 8, 72, { lw: 2.4 })}
  ${path("M44 74 L292 74", { c: P.sand, w: 2 })}
  ${path("M54 130 C92 122 132 116 170 100 C208 84 244 80 282 64", { c: P.terra, w: 2.8 })}
  ${circle(170, 100, 4.4, { c: P.terra, w: 2, fill: P.terra })}
  ${circle(282, 64, 8, { c: P.terra, w: 2, fill: P.cream })}
  ${check(286, 64, 5)}
  ${dial(266, 132, 24, 0.86)}
  ${spark(64, 38, 6)}
  ${circle(90, 158, 3, { c: P.muted, w: 1.8 })}`);
}

// 8 · When it melts down — a warning triangle, a crash burst, and a reload card.
function st8Meltdown() {
  return svg(`
  ${path("M82 142 L116 56 L150 142 Z", { c: P.terra, w: 2.8 })}
  ${path("M116 82 v16", { c: P.terra, w: 3 })}
  ${circle(116, 108, 2.6, { c: P.terra, w: 2, fill: P.terra })}
  ${path("M196 54 L210 68 L210 90 L196 108 L182 90 L182 68 Z", { c: P.muted, w: 2.4 })}
  ${downArrow(206, 42, 18, { c: P.muted })}
  ${downArrow(230, 44, 14, { c: P.muted })}
  ${circle(246, 78, 16, { c: P.sand, w: 2 })}
  ${rect(172, 118, 104, 26, { rad: 6, fill: P.cream, lw: 2.2 })}
  ${tlines(182, 127, 2, { w: 82, gap: 7, c: P.soft })}
  ${check(262, 136, 6)}
  ${circle(180, 60, 8, { c: P.terra, w: 2, fill: P.terra })}
  ${circle(296, 60, 3, { c: P.muted, w: 1.8 })}`);
}

// 9 · Serve your trained model — cube, adapter chip, and the two serve doors.
function st9ServeLora() {
  return svg(`
  ${rect(40, 64, 62, 66, { rad: 8, lw: 2.6 })}
  ${rect(49, 74, 44, 24, { rad: 5, c: P.cream, lw: 1.8 })}
  ${circle(71, 112, 6, { c: P.terra, w: 1.8, fill: P.terra })}
  ${harrow(102, 86, 22)}
  ${rect(124, 48, 46, 30, { rad: 5, fill: P.cream, lw: 2.2 })}
  ${tlines(134, 60, 2, { w: 26, gap: 6, c: P.terra })}
  ${tag(147, 40, 8, { c: P.terra })}
  ${path("M147 78 L147 100 h40", { c: P.muted, w: 2 })}
  ${path("M187 100 L176 95 M187 100 L176 105", { c: P.muted, w: 2 })}
  ${harrow(206, 92, 18)}
  ${rect(224, 72, 30, 22, { rad: 4, lw: 2 })}
  ${tlines(232, 84, 1, { w: 14, c: P.muted })}
  ${rect(224, 42, 44, 24, { rad: 5, lw: 2 })}
  ${tlines(234, 49, 2, { w: 24, gap: 5, c: P.muted })}
  ${bubble(272, 122, 40, 26, { fill: P.cream })}
  ${tlines(260, 116, 1, { w: 22, c: P.soft })}
  ${spark(288, 68, 5)}`);
}

// 10 · What's next — a small cube grows toward the bigger toys, arrows up.
function st10NextLevel() {
  return svg(`
  ${rect(54, 102, 58, 46, { rad: 8, lw: 2.6 })}
  ${rect(62, 110, 42, 20, { rad: 4, c: P.cream, lw: 1.8 })}
  ${circle(82, 138, 4, { c: P.terra, w: 1.6, fill: P.terra })}
  ${harrow(112, 114, 24)}
  ${rect(136, 78, 64, 42, { rad: 8, fill: P.cream, lw: 2.4 })}
  ${circle(168, 96, 12, { c: P.terra, w: 2.2 })}
  ${path("M162 90 L174 98 L162 106 L156 98 Z", { c: P.terra, w: 1.8, fill: P.terra })}
  ${path("M210 96 L210 34", { c: P.muted, w: 2.4 })}
  ${path("M203 44 L210 34 L217 44", { c: P.muted, w: 2.2 })}
  ${spark(222, 52, 7)}
  ${spark(244, 66, 5)}
  ${circle(96, 44, 14, { c: P.muted, w: 2 })}
  ${circle(96, 44, 5, { c: P.muted, w: 1.6 })}
  ${circle(290, 150, 3, { c: P.muted, w: 1.8 })}`);
}

// Studio cover: a friendly GUI window on a desk cube, saving a fine-tune.
function studioCoverArt() {
  return svg(
    `
  ${sun(600, 50, 22, { inner: true, rays: 10 })}
  ${path("M70 160 L650 160", { c: P.sand, w: 3 })}
  ${rect(272, 40, 196, 108, { rad: 14, lw: 3 })}
  ${path("M272 66 L468 66", { c: P.sand, w: 1.8 })}
  ${circle(290, 53, 3.4, { c: P.terra, w: 1.8, fill: P.terra })}
  ${circle(304, 53, 3.4, { c: P.muted, w: 1.8 })}
  ${circle(318, 53, 3.4, { c: P.soft, w: 1.8 })}
  ${rect(284, 78, 70, 18, { rad: 5, fill: P.cream, lw: 2 })}
  ${rect(364, 74, 88, 28, { rad: 5, fill: P.cream, lw: 2 })}
  ${path("M366 92 h84", { c: P.terra, w: 2.6 })}
  ${rect(284, 112, 168, 16, { rad: 4, c: P.muted, lw: 1.6 })}
  ${rect(284, 112, 100, 16, { rad: 4, fill: P.terra, lw: 0.01 })}
  ${rect(104, 104, 62, 54, { rad: 8, lw: 2.6 })}
  ${rect(115, 114, 40, 26, { rad: 4, c: P.cream, lw: 1.8 })}
  ${path("M150 94 L196 76", { c: P.terra, w: 2.2 })}
  ${path("M192 68 L196 76 L204 74", { c: P.terra, w: 2 })}
  ${circle(70, 128, 6, { c: P.muted, w: 1.8 })}
  ${circle(248, 126, 5, { c: P.muted, w: 1.8 })}
  ${spark(320, 138, 6)}
  ${spark(414, 140, 5)}
  ${spark(188, 60, 5)}
  ${circle(90, 46, 3, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(460, 40, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(360, 196, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}
`,
    { w: 720, h: 250 }
  );
}

// ---------------------------------------------------------------- vllm theme
// The vLLM server book: requests streaming in, token journeys, KV-cache
// pages, continuous batching, terminals, GPU cards, metrics dials and rising
// throughput curves — same warm palette, serving-geek imagery for a book
// about running your own production-grade model server.

// 1 · Your own AI server — a rack with a GPU card, requests in, reply out.
function vl1YourServer() {
  return svg(`
  ${rect(112, 44, 116, 92, { rad: 10, lw: 3 })}
  ${path("M112 64 L228 64", { c: P.sand, w: 1.6 })}
  ${circle(126, 54, 3, { c: P.terra, w: 1.8, fill: P.terra })}
  ${circle(140, 54, 3, { c: P.muted, w: 1.8 })}
  ${circle(154, 54, 3, { c: P.soft, w: 1.8 })}
  ${rect(124, 78, 56, 26, { rad: 5, fill: P.cream, lw: 2.2 })}
  ${tlines(134, 87, 2, { w: 36, gap: 10, c: P.muted })}
  ${rect(188, 64, 28, 18, { rad: 4, lw: 2 })}
  ${tlines(194, 70, 2, { w: 16, gap: 6, c: P.muted })}
  ${dial(208, 128, 26, 0.7)}
  ${downArrow(54, 26, 20, { c: P.terra })}
  ${downArrow(82, 42, 20, { c: P.terra })}
  ${rect(40, 86, 40, 16, { rad: 4, lw: 1.8, c: P.muted })}
  ${harrow(80, 94, 22)}
  ${bubble(262, 60, 52, 34, { fill: P.cream })}
  ${tlines(240, 54, 2, { w: 36, gap: 8, c: P.muted })}
  ${spark(288, 32, 6)}
  ${spark(292, 130, 5)}
  ${circle(150, 152, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 2 · The life of one prompt — tokens in, a prefill pass, then token-by-token
//    decode into an answer.
function vl2TokenJourney() {
  return svg(`
  ${tokens(28, 36, 5, { gap: 18 })}
  ${downArrow(88, 44, 18, { c: P.terra })}
  ${cblock(60, 68, 90, 56, { fill: P.cream })}
  ${path("M60 74 h90", { c: P.sand, w: 1.6 })}
  ${tokens(72, 84, 8, { gap: 10, r: 3 })}
  ${tokens(72, 102, 6, { gap: 12, r: 3, c: P.terra })}
  ${path("M88 94 h34", { c: P.soft, w: 2 })}
  ${harrow(150, 96, 24, { c: P.terra })}
  ${tokens(174, 84, 2, { gap: 16 })}
  ${tokens(174, 106, 2, { gap: 16, c: P.terra })}
  ${tokens(196, 130, 3, { gap: 16, r: 3.2 })}
  ${check(260, 86, 7)}
  ${bubble(252, 124, 58, 34, { fill: P.cream })}
  ${tlines(230, 118, 2, { w: 40, gap: 8, c: P.muted })}
  ${spark(286, 44, 6)}
  ${circle(40, 148, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 3 · The KV cache — hashed pages on the GPU, a page table, a patient model.
function vl3KVCache() {
  let out = "";
  for (let i = 0; i < 4; i++) {
    const x = 44 + i * 58;
    out += cblock(x, 54, 44, 38, { fill: i === 2 ? P.cream : "none" });
    out += hashTick(x + 46, 46);
    out += tlines(x + 9, 66, 2, { w: 26, gap: 10, c: P.muted });
  }
  out += downArrow(172, 98, 18, { c: P.terra });
  out += rect(52, 120, 204, 28, { rad: 6, fill: P.cream, lw: 2.2 });
  out += tlines(62, 128, 2, { w: 136, gap: 10, c: P.terra });
  out += path("M222 126 h18", { c: P.muted, w: 2 });
  out += circle(252, 134, 9, { c: P.terra, w: 2.2 });
  out += path("M252 126 v4 M252 142 v4 M244 134 h4 M260 134 h4", { c: P.terra, w: 1.5 });
  out += spark(286, 30, 6);
  out += spark(256, 92, 4);
  out += circle(286, 158, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 4 · Continuous batching — parallel requests merge into one batching box,
//    then responses stream out token by token.
function vl4Batching() {
  return svg(`
  ${promptMark(30, 34, 6)}
  ${tlines(38, 32, 2, { w: 30, gap: 9, c: P.soft })}
  ${path("M34 50 L92 80", { c: P.muted, w: 2 })}
  ${promptMark(54, 58, 6)}
  ${tlines(62, 56, 2, { w: 26, gap: 8, c: P.soft })}
  ${path("M58 74 L106 86", { c: P.muted, w: 2 })}
  ${promptMark(78, 34, 6)}
  ${tlines(86, 32, 2, { w: 26, gap: 9, c: P.soft })}
  ${path("M82 50 L118 76", { c: P.terra, w: 2.2 })}
  ${cblock(106, 72, 80, 48, { fill: P.cream })}
  ${tlines(118, 88, 2, { w: 56, gap: 12, c: P.muted })}
  ${path("M106 80 h80", { c: P.sand, w: 1.4 })}
  ${harrow(186, 96, 22, { c: P.terra })}
  ${tokens(210, 82, 4, { gap: 13 })}
  ${tokens(210, 100, 4, { gap: 13 })}
  ${tokens(210, 118, 2, { gap: 13, r: 3.4, c: P.terra })}
  ${bubble(268, 132, 44, 32, { fill: P.cream })}
  ${tlines(250, 126, 2, { w: 30, gap: 8, c: P.muted })}
  ${check(258, 62, 6)}
  ${spark(286, 44, 6)}
  ${circle(44, 148, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 5 · Standing up vLLM — a terminal runs vllm serve, a tiny server answers.
function vl5StandingUp() {
  return svg(`
  ${termWin(36, 30, 158, 108)}
  ${promptMark(48, 52, 5)}
  ${tlines(58, 48, 3, { w: 62, gap: 11, c: P.terra })}
  ${rect(48, 86, 122, 14, { rad: 4, c: P.terra, lw: 2 })}
  ${rect(48, 86, 74, 14, { rad: 4, fill: P.terra, lw: 0.01 })}
  ${rect(222, 42, 84, 72, { rad: 8, lw: 2.6 })}
  ${rect(230, 50, 20, 9, { rad: 3, c: P.terra, lw: 1.8, fill: P.terra })}
  ${rect(230, 68, 66, 10, { rad: 2, lw: 1.6, c: P.muted })}
  ${rect(230, 86, 58, 10, { rad: 2, lw: 1.6, c: P.muted })}
  ${bubble(290, 26, 42, 22, { fill: P.cream })}
  ${tlines(274, 21, 1, { w: 26, c: P.muted })}
  ${path("M254 132 h100", { c: P.sand, w: 2 })}
  ${check(270, 62, 7)}
  ${spark(282, 132, 6)}
  ${spark(306, 102, 5)}
  ${circle(292, 152, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 6 · Your first chatbot — a chat window, a user bubble, an assistant reply.
function vl6Chatbot() {
  return svg(`
  ${rect(40, 30, 240, 116, { rad: 10, lw: 3 })}
  ${path("M40 54 L280 54", { c: P.sand, w: 1.6 })}
  ${circle(56, 43, 3.2, { c: P.terra, w: 1.8, fill: P.terra })}
  ${circle(70, 43, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(84, 43, 3.2, { c: P.soft, w: 1.8 })}
  ${rect(48, 54, 44, 86, { fill: P.cream })}
  ${tlines(56, 74, 5, { w: 26, gap: 11, c: P.soft })}
  ${bubble(126, 88, 88, 44)}
  ${tlines(96, 80, 3, { w: 44, gap: 10, c: P.soft })}
  ${bubble(212, 132, 64, 34, { fill: P.cream })}
  ${promptMark(190, 138)}
  ${rect(238, 38, 60, 8, { rad: 2, c: P.terra, lw: 1.8 })}
  ${spark(276, 28, 6)}
  ${circle(286, 158, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 7 · Offline batch mode — a stack of jobs, one batching box, outputs checked.
function vl7Batch() {
  return svg(`
  ${rect(42, 64, 56, 66, { lw: 2.4 })}
  ${rect(52, 56, 56, 66, { lw: 2.4 })}
  ${rect(62, 48, 56, 66, { rad: 4, fill: P.cream, lw: 2.4 })}
  ${tlines(72, 70, 3, { w: 36, gap: 12, c: P.muted })}
  ${harrow(124, 84, 24, { c: P.terra })}
  ${cblock(148, 60, 66, 48, { fill: P.cream })}
  ${tlines(158, 74, 2, { w: 44, gap: 12, c: P.muted })}
  ${path("M148 80 h66", { c: P.sand, w: 1.4 })}
  ${harrow(214, 84, 22, { c: P.terra })}
  ${rect(238, 58, 54, 48, { rad: 6, lw: 2.4 })}
  ${tlines(248, 70, 3, { w: 34, gap: 10, c: P.terra })}
  ${check(266, 118, 7)}
  ${spark(92, 32, 6)}
  ${spark(260, 34, 5)}
  ${circle(286, 150, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 8 · Bigger model, more GPUs — one model split across three linked cards.
function vl8MoreGPUs() {
  let out = "";
  out += cblock(36, 58, 58, 52, { fill: P.cream });
  out += tlines(46, 72, 3, { w: 38, gap: 11, c: P.muted });
  out += path("M94 84 L140 74", { c: P.terra, w: 2.4 });
  out += path("M130 68 L140 74 L132 80", { c: P.terra, w: 2.2 });
  const ys = [38, 64, 90];
  for (let i = 0; i < 3; i++) {
    const x = 150, y = ys[i];
    out += rect(x, y, 46, 58, { rad: 7, lw: 2.4 });
    out += rect(x + 8, y + 40, 24, 9, { rad: 2, lw: 1.6, c: P.muted });
    out += circle(x + 196 - x, y + 14, 6, { c: P.terra, w: 1.8 });
    out += rect(x + 16, y + 12, 18, 6, { rad: 2, fill: P.cream, lw: 1.6 });
    out += circle(x + 23, y + 30, 7, { c: P.terra, w: 2 });
    out += path(`M${x + 23} ${y + 25} v4 M${x + 23} ${y + 35} v4 M${x + 18} ${y + 30} h4 M${x + 28} ${y + 30} h4`, { c: P.terra, w: 1.6 });
    out += harrow(x - 24, y + 26, 24, { c: P.terra });
  }
  out += spark(292, 32, 7);
  out += spark(250, 130, 5);
  out += circle(298, 154, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 9 · From toy to production — a locked server feeding a metrics panel.
function vl9Production() {
  return svg(`
  ${rect(48, 46, 92, 78, { rad: 10, lw: 3 })}
  ${rect(58, 56, 72, 14, { rad: 4, lw: 2, c: P.terra })}
  ${rect(58, 80, 72, 12, { rad: 3, lw: 1.8, c: P.muted })}
  ${rect(58, 99, 48, 12, { rad: 3, lw: 1.8, c: P.muted })}
  ${lock(60, 32, 8)}
  ${harrow(140, 82, 24, { c: P.terra })}
  ${rect(166, 40, 108, 104, { rad: 8, fill: P.cream, lw: 2.4 })}
  ${dial(216, 100, 26, 0.8)}
  ${rect(178, 54, 38, 12, { rad: 2, lw: 1.6, c: P.muted })}
  ${rect(178, 71, 26, 8, { rad: 2, lw: 1.4, c: P.muted })}
  ${spark(288, 34, 6)}
  ${spark(260, 130, 5)}
  ${check(148, 70, 6)}
  ${circle(286, 160, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 10 · Benchmarks and what's next — a warm-up sun, a dial, and a rising curve.
function vl10Benchmarks() {
  return svg(`
  ${sun(70, 44, 15, { inner: true, rays: 8 })}
  ${rect(96, 58, 96, 70, { rad: 8, fill: P.cream, lw: 2.4 })}
  ${tlines(108, 74, 2, { w: 70, gap: 12, c: P.muted })}
  ${dial(144, 104, 26, 0.55)}
  ${path("M202 128 L216 128 L216 100 L230 100 L230 80 L244 80 L244 60", { c: P.terra, w: 3 })}
  ${circle(244, 44, 7, { c: P.terra, w: 2.4 })}
  ${path("M244 30 L244 22", { c: P.terra, w: 2 })}
  ${path("M239 27 L244 21 L249 27", { c: P.terra, w: 2 })}
  ${rect(196, 58, 10, 44, { rad: 2, lw: 1.5, c: P.muted })}
  ${rect(258, 44, 10, 30, { rad: 2, lw: 1.5, c: P.muted })}
  ${rect(276, 60, 10, 30, { rad: 2, lw: 1.5, c: P.terra })}
  ${path("M30 140 L290 140", { c: P.sand, w: 2 })}
  ${spark(292, 32, 6)}
  ${circle(52, 150, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// vLLM cover: prompts stream in, a server answers, responses bubble out —
// tokens, pages, a batching core, and a throughput dial on the horizon.
function vllmCoverArt() {
  return svg(
    `
  ${sun(620, 52, 24, { inner: true, rays: 10 })}
  ${tokens(36, 50, 22, { gap: 18 })}
  ${path("M36 66 C50 96 96 96 100 118 C104 136 150 132 160 146", { c: P.soft, w: 2.6 })}
  ${circle(60, 132, 10, { c: P.muted, w: 2 })}
  ${path("M60 124 L60 132 M60 132 L66 135", { c: P.muted, w: 1.6 })}
  ${harrow(112, 128, 32, { c: P.terra })}
  ${rect(196, 52, 140, 112, { rad: 14, lw: 3.2 })}
  ${path("M196 76 L336 76", { c: P.sand, w: 2 })}
  ${circle(216, 64, 4, { c: P.terra, w: 2, fill: P.terra })}
  ${circle(232, 64, 4, { c: P.muted, w: 2 })}
  ${circle(248, 64, 4, { c: P.soft, w: 2 })}
  ${rect(210, 88, 96, 20, { rad: 5, fill: P.cream, lw: 2.2 })}
  ${tlines(222, 96, 2, { w: 72, gap: 10, c: P.muted })}
  ${rect(210, 122, 46, 28, { rad: 6, lw: 2.2 })}
  ${tlines(220, 131, 2, { w: 26, gap: 9, c: P.muted })}
  ${circle(216, 146, 7, { c: P.terra, w: 2 })}
  ${path("M216 139 v4 M216 153 v4 M209 146 h4 M223 146 h4", { c: P.terra, w: 1.5 })}
  ${dial(390, 92, 30, 0.85)}
  ${spark(350, 58, 8)}
  ${harrow(336, 144, 32, { c: P.terra })}
  ${bubble(452, 114, 162, 64, { fill: P.cream })}
  ${tlines(402, 106, 3, { w: 130, gap: 12, c: P.soft })}
  ${spark(504, 152, 7)}
  ${circle(446, 34, 13, { c: P.muted, w: 2.2 })}
  ${circle(446, 52, 9, { c: P.muted, w: 1.8 })}
  ${path("M498 44 L540 202", { c: P.muted, w: 2.2 })}
  ${spark(632, 96, 8)}
  ${circle(60, 220, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(320, 224, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(680, 80, 3.4, { c: P.muted, w: 1.8 })}
`,
    { w: 720, h: 250 }
  );
}

// ---------------------------------------------------------------- agent theme
// The AI coding agent book: token wallets, probability picks, the quadratic
// rebill trap, context-window real estate, config surfaces, precise prompts,
// model routing, loop constraint scissors, compounding guardrails and live
// meters — same warm palette, agent-economics imagery.

// 1 · The tokens in your wallet — coins in, a value dial, and change out.
function ag1Wallet() {
  return svg(`
  ${rect(36, 52, 64, 52, { rad: 8, lw: 2.8 })}
  ${path("M46 78 h44", { c: P.sand, w: 1.6 })}
  ${tokens(52, 68, 4, { gap: 12, r: 4, c: P.terra })}
  ${tokens(52, 84, 4, { gap: 12, r: 4 })}
  ${harrow(100, 78, 20, { c: P.terra })}
  ${tag(142, 74, 12)}
  ${dial(200, 104, 26, 0.82)}
  ${bubble(250, 68, 56, 38, { fill: P.cream })}
  ${tlines(230, 64, 2, { w: 38, gap: 9, c: P.muted })}
  ${spark(294, 44, 6)}
  ${spark(104, 40, 5)}
  ${circle(44, 152, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 2 · What a token actually is — tokens in, a probability pick, decode out.
function ag2Token() {
  return svg(`
  ${tokens(28, 36, 6, { gap: 17 })}
  ${downArrow(84, 46, 16, { c: P.terra })}
  ${cblock(56, 66, 90, 54, { fill: P.cream })}
  ${path("M56 72 h90", { c: P.sand, w: 1.6 })}
  ${tokens(68, 86, 8, { gap: 10, r: 3 })}
  ${tokens(68, 104, 5, { gap: 16, r: 3, c: P.terra })}
  ${harrow(146, 92, 20, { c: P.terra })}
  ${tokens(168, 82, 3, { gap: 16 })}
  ${circle(226, 82, 4.6, { c: P.terra, w: 2, fill: P.cream })}
  ${tokens(168, 106, 2, { gap: 16, c: P.terra })}
  ${check(252, 86, 7)}
  ${bubble(248, 126, 56, 34, { fill: P.cream })}
  ${tlines(226, 120, 2, { w: 40, gap: 8, c: P.muted })}
  ${spark(290, 44, 6)}
  ${circle(42, 152, 3.2, { c: P.muted, w: 1.8 })}`);
}

// 3 · The quadratic trap — history re-billed every step, cost climbing.
function ag3Quadratic() {
  let out = "";
  // Growing history stack: each step's context packs the previous ones.
  out += rect(54, 26, 84, 36, { lw: 2.4 });
  out += rect(64, 40, 84, 36, { lw: 2.4 });
  out += rect(74, 54, 84, 36, { rad: 5, fill: P.cream, lw: 2.4 });
  out += tlines(84, 64, 3, { w: 60, gap: 8, c: P.muted });
  out += downArrow(178, 42, 16, { c: P.terra });
  out += rect(164, 64, 56, 28, { rad: 5, lw: 2.4 });
  out += tlines(174, 72, 2, { w: 36, gap: 8, c: P.muted });
  out += downArrow(176, 92, 12, { c: P.terra });
  out += rect(162, 106, 62, 28, { rad: 5, fill: P.cream, lw: 2.4 });
  out += tlines(172, 114, 2, { w: 42, gap: 8, c: P.muted });
  out += tokens(238, 74, 24, { gap: 10, r: 3 });
  out += tokens(238, 96, 16, { gap: 10, r: 3, c: P.terra });
  out += tokens(238, 118, 8, { gap: 12, r: 3.4, c: P.terra });
  out += dial(280, 140, 22, 0.85);
  out += spark(262, 20, 6);
  out += spark(100, 18, 5);
  out += circle(40, 156, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 4 · Context windows — a bar with prime real estate at both ends, a fill line.
function ag4Context() {
  return svg(`
  ${rect(36, 30, 250, 44, { rad: 8, lw: 2.8 })}
  ${rect(36, 30, 178, 44, { rad: 8, fill: P.cream, lw: 0.01 })}
  ${path("M36 74 L286 74", { c: P.soft, w: 1.2 })}
  ${tlines(48, 44, 2, { w: 70, gap: 9, c: P.terra })}
  ${tlines(226, 44, 2, { w: 40, gap: 9, c: P.muted })}
  ${circle(140, 56, 5, { c: P.muted, w: 1.8 })}
  ${circle(140, 26, 3, { c: P.muted, w: 1.4, fill: P.cream })}
  ${path("M178 66 L178 84", { c: P.terra, w: 2.4 })}
  ${harrow(178, 76, 24, { c: P.terra })}
  ${bubble(258, 102, 52, 36, { fill: P.cream })}
  ${tlines(238, 96, 2, { w: 36, gap: 8, c: P.muted })}
  ${spark(244, 28, 6)}
  ${circle(38, 152, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 5 · The context engineering surface — config files into the harness.
function ag5Config() {
  let out = "";
  const files = [
    { x: 40, y: 34, w: 96, h: 34, cls: 0 },
    { x: 54, y: 52, w: 96, h: 34, cls: 1 },
    { x: 68, y: 70, w: 96, h: 34, cls: 2 },
  ];
  for (const f of files) {
    out += rect(f.x, f.y, f.w, f.h, { rad: 6, lw: 2.4 });
    out += path(`M${f.x + f.w - 12} ${f.y} L${f.x + f.w} ${f.y + 12}`, { c: P.sand, w: 1.8 });
    out += path(`M${f.x + f.w - 12} ${f.y} h3 v3 L${f.x + f.w} ${f.y + 9}`, { c: P.soft, w: 1.6 });
    out += tlines(f.x + 14, f.y + (f.cls === 2 ? 18 : 14), f.cls === 2 ? 2 : 2, { w: 54, gap: 9, c: P.muted });
    out += harrow(f.x + f.w, f.y + f.h / 2, 26, { c: P.terra });
  }
  out += cblock(170, 60, 76, 46, { fill: P.cream });
  out += path("M170 66 h76", { c: P.sand, w: 1.4 });
  out += tlines(182, 78, 2, { w: 52, gap: 10, c: P.muted });
  out += harrow(246, 82, 20, { c: P.terra });
  out += sun(298, 78, 14, { inner: true, rays: 7 });
  out += bubble(252, 124, 52, 36, { fill: P.cream });
  out += tlines(232, 118, 2, { w: 36, gap: 8, c: P.muted });
  out += spark(120, 28, 5);
  out += circle(276, 44, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 6 · Prompts that print money — precise arrow straight to a check; a wandering
//    path costs tokens.
function ag6Prompt() {
  return svg(`
  ${rect(40, 34, 110, 56, { rad: 8, fill: P.cream, lw: 2.6 })}
  ${path("M40 40 h110", { c: P.sand, w: 1.6 })}
  ${tlines(52, 52, 3, { w: 84, gap: 10, c: P.terra })}
  ${promptMark(54, 74)}
  ${tlines(66, 68, 2, { w: 64, gap: 8, c: P.muted })}
  ${harrow(150, 62, 26, { c: P.terra })}
  ${rect(176, 46, 56, 30, { rad: 6, lw: 2.4 })}
  ${tlines(186, 56, 2, { w: 36, gap: 8, c: P.muted })}
  ${check(236, 61, 7)}
  ${path("M54 88 C90 96 92 118 136 118 S180 112 214 116", { c: P.soft, w: 2.2 })}
  ${circle(224, 116, 22, { c: P.muted, w: 2 })}
  ${path("M216 114 L228 118 M218 124 L230 120", { c: P.muted, w: 2.2 })}
  ${tokens(156, 128, 3, { gap: 12, r: 3, c: P.terra })}
  ${spark(286, 44, 6)}
  ${circle(46, 154, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 7 · Match the model to the mission — three tiers, three dials, one arrow.
function ag7Model() {
  let out = "";
  out += rect(34, 48, 156, 14, { rad: 7, lw: 2.2 });
  out += promptMark(42, 44);
  out += tlines(50, 42, 1, { w: 96, c: P.terra });
  const tiers = [
    { x: 44, y: 96, w: 46, h: 30, pct: 0.25 },
    { x: 114, y: 80, w: 58, h: 46, pct: 0.6 },
    { x: 196, y: 64, w: 72, h: 62, pct: 0.95 },
  ];
  for (const t of tiers) {
    out += rect(t.x, t.y, t.w, t.h, { rad: 7, lw: 2.4 });
    out += tlines(t.x + 10, t.y + 12, 2, { w: t.w - 22, gap: 9, c: P.muted });
    out += dial(t.x + t.w / 2, t.y + t.h / 2, 12, t.pct, { w: 2 });
    out += harrow(t.x + t.w / 2 - 28, t.y - 14, 56, { c: P.terra, w: 1.6 });
  }
  out += check(232, 48, 7);
  out += spark(284, 34, 6);
  out += circle(34, 156, 3.2, { c: P.muted, w: 1.8 });
  out += circle(292, 148, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 8 · Five ways to constrain an agent loop — a loop trimmed right, split into
//    scoped specialists.
function ag8Constrain() {
  let out = "";
  out += circle(76, 82, 30, { lw: 2.6 });
  out += circle(76, 82, 13, { lw: 2.2 });
  out += path("M76 78 L76 88 L84 84", { c: P.terra, w: 2.4 });
  out += tlines(40, 48, 2, { w: 34, gap: 8, c: P.muted });
  out += tokens(152, 66, 5, { gap: 13 });
  out += tokens(152, 86, 5, { gap: 13 });
  out += tokens(152, 106, 3, { gap: 13, r: 3, c: P.terra });
  out += path("M136 82 L148 82", { c: P.terra, w: 2.6 });
  out += rect(200, 40, 74, 30, { rad: 12, lw: 2, c: P.terra });
  out += rect(200, 40, 52, 30, { rad: 12, fill: P.cream, lw: 2, c: P.terra });
  out += tlines(212, 74, 1, { w: 44, c: P.terra });
  out += rect(200, 8, 68, 26, { rad: 8, lw: 2 });
  out += tlines(212, 18, 2, { w: 44, gap: 9, c: P.muted });
  out += path("M178 112 L268 108 L268 126", { c: P.soft, w: 1.8 });
  out += rect(90, 148, 46, 18, { rad: 8, lw: 1.8, c: P.muted });
  out += rect(152, 148, 46, 18, { rad: 8, lw: 1.8, c: P.muted });
  out += rect(214, 148, 46, 18, { rad: 8, lw: 1.8, c: P.muted });
  out += spark(288, 120, 6);
  out += circle(44, 156, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 9 · Guardrails that compound — a shield, checks, and stacked tests resetting
//    the error rate.
function ag9Guard() {
  return svg(`
  ${path("M92 28 L144 44 L144 70 C144 106 118 128 92 138 C66 128 40 106 40 70 L40 44 Z", { lw: 3 })}
  ${check(88, 66, 8)}
  ${path("M118 62 L128 70 L134 54", { c: P.terra, w: 2.4 })}
  ${rect(40, 138, 92, 7, { rad: 3, lw: 1.6, c: P.muted })}
  ${rect(40, 148, 66, 7, { rad: 3, lw: 1.6, c: P.muted })}
  ${tokens(152, 60, 5, { gap: 13 })}
  ${tokens(152, 82, 4, { gap: 13 })}
  ${tokens(152, 104, 3, { gap: 13 })}
  ${check(196, 62, 6)}
  ${check(196, 84, 6)}
  ${check(196, 106, 6)}
  ${rect(170, 148, 92, 9, { rad: 4, lw: 1.8, c: P.muted })}
  ${rect(170, 148, 66, 9, { rad: 4, fill: P.cream, lw: 1.8, c: P.muted })}
  ${spark(286, 34, 6)}
  ${circle(286, 140, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 10 · Watch the meter — a status line showing context %, in/out and a dial.
function ag10Meter() {
  return svg(`
  ${rect(36, 34, 248, 60, { rad: 8, fill: P.cream, lw: 2.6 })}
  ${path("M36 46 h248", { c: P.sand, w: 1.6 })}
  ${circle(50, 40, 3.2, { c: P.terra, w: 1.8, fill: P.terra })}
  ${circle(64, 40, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(78, 40, 3.2, { c: P.soft, w: 1.8 })}
  ${rect(46, 52, 56, 8, { rad: 4, lw: 1.8, c: P.muted })}
  ${rect(46, 52, 40, 8, { rad: 4, fill: P.terra, lw: 0.01 })}
  ${rect(110, 54, 56, 6, { rad: 3, lw: 1.4, c: P.muted })}
  ${rect(110, 72, 46, 6, { rad: 3, lw: 1.4, c: P.muted })}
  ${rect(180, 50, 60, 24, { rad: 6, lw: 2 })}
  ${tokens(190, 56, 4, { gap: 11, r: 2.4, c: P.terra })}
  ${tokens(190, 66, 4, { gap: 11, r: 2.4 })}
  ${dial(268, 74, 22, 0.24, { w: 3 })}
  ${spark(132, 24, 6)}
  ${spark(268, 116, 5)}
  ${circle(44, 150, 3.2, { c: P.muted, w: 1.8 })}`);
}

// Cover: token coins in, a context bar, a scoped loop, a value dial on the
// horizon — the agent token-economy at a glance.
function agentCoverArt() {
  return svg(
    `
  ${sun(630, 56, 24, { inner: true, rays: 10 })}
  ${tokens(36, 52, 22, { gap: 18 })}
  ${tokens(36, 74, 18, { gap: 18, r: 3.4, c: P.terra })}
  ${path("M36 86 C60 108 120 110 140 128 C152 140 168 144 208 136", { c: P.soft, w: 2.6 })}
  ${harrow(120, 112, 64, { c: P.terra })}
  ${rect(196, 56, 150, 92, { rad: 12, lw: 3 })}
  ${path("M196 74 L346 74", { c: P.sand, w: 2 })}
  ${circle(216, 65, 3.6, { c: P.terra, w: 2, fill: P.terra })}
  ${circle(232, 65, 3.6, { c: P.muted, w: 2 })}
  ${circle(248, 65, 3.6, { c: P.soft, w: 2 })}
  ${rect(206, 84, 130, 12, { rad: 6, fill: P.cream, lw: 2 })}
  ${rect(206, 106, 130, 12, { rad: 6, lw: 1.8, c: P.muted })}
  ${rect(206, 128, 100, 10, { rad: 5, lw: 1.8, c: P.muted })}
  ${harrow(346, 128, 28, { c: P.terra })}
  ${dial(432, 92, 26, 0.8)}
  ${spark(388, 60, 8)}
  ${bubble(452, 122, 130, 56, { fill: P.cream })}
  ${tlines(402, 120, 3, { w: 108, gap: 10, c: P.soft })}
  ${spark(512, 164, 7)}
  ${circle(150, 216, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(368, 216, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(660, 88, 3.4, { c: P.muted, w: 1.8 })}
`,
    { w: 720, h: 250 }
  );
}

// ---------------------------------------------------------------- video theme
// Automated video editing with HyperFrames: the timeline replaced by code,
// HTML becoming film, a headless browser as the camera, FFmpeg as the cutter,
// and a human kept in the loop at the review gate.

// 1 · The bottleneck — a messy timeline of clips, then one command in a
//    terminal replaces all of it.
function vf1Bottleneck() {
  let out = "";
  out += path("M32 44 h256", { c: P.sand, w: 2 });
  for (let i = 0; i < 13; i++) out += path(`M${44 + i * 19.5} 44 v6`, { c: P.sand, w: 1.4 });
  const clips = [
    { x: 38, w: 30, f: P.cream },
    { x: 74, w: 18, f: "none" },
    { x: 98, w: 36, f: P.cream },
    { x: 140, w: 22, f: "none" },
    { x: 168, w: 42, f: P.cream },
    { x: 216, w: 20, f: "none" },
    { x: 242, w: 30, f: P.cream },
  ];
  for (const cl of clips) out += rect(cl.x, 26, cl.w, 16, { rad: 3, lw: 1.8, fill: cl.f });
  out += downArrow(160, 54, 20, { c: P.terra });
  out += termWin(96, 84, 128, 56);
  out += promptMark(112, 116);
  out += tlines(124, 112, 2, { w: 80, gap: 10, c: P.soft });
  out += check(208, 94, 5);
  out += spark(268, 106, 5);
  out += circle(48, 154, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 2 · HTML becomes video — a code window feeds a filmstrip.
function vf2HtmlVideo() {
  let out = "";
  out += termWin(24, 28, 108, 114);
  out += promptMark(40, 58);
  out += tlines(52, 52, 2, { w: 64, gap: 10, c: P.terra });
  out += tlines(52, 82, 3, { w: 74, gap: 10, c: P.muted });
  out += path("M58 118 L50 126 L58 134", { c: P.terra, w: 2.4 });
  out += path("M72 114 L64 138", { c: P.terra, w: 2.4 });
  out += path("M86 118 L94 126 L86 134", { c: P.terra, w: 2.4 });
  out += harrow(132, 84, 32, { c: P.terra });
  out += rect(172, 24, 124, 122, { rad: 8, lw: 2.8 });
  for (let y = 34; y <= 138; y += 13) {
    out += circle(181, y, 2.2, { c: P.muted, w: 1.4, fill: P.muted });
    out += circle(289, y, 2.2, { c: P.muted, w: 1.4, fill: P.muted });
  }
  out += rect(192, 42, 90, 24, { rad: 3, lw: 2 });
  out += tlines(200, 52, 1, { w: 62, c: P.muted });
  out += rect(192, 78, 90, 24, { rad: 3, lw: 2 });
  out += tlines(200, 88, 1, { w: 62, c: P.muted });
  out += rect(192, 114, 90, 24, { rad: 3, lw: 2 });
  out += path("M218 119 L218 133 L236 126 Z", { c: P.terra, w: 2, fill: P.cream });
  out += spark(292, 18, 5);
  out += circle(40, 156, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 3 · The toolchain — a plain-language brief, an HTML scene, the FFmpeg gear,
//    and the rendered file at the end.
function vf3Toolchain() {
  let out = "";
  out += rect(80, 12, 160, 32, { rad: 8, lw: 2.6 });
  out += promptMark(96, 28);
  out += tlines(110, 24, 1, { w: 116, c: P.terra });
  out += tlines(110, 34, 1, { w: 84, c: P.muted });
  out += downArrow(160, 44, 14, { c: P.terra });
  out += rect(80, 58, 160, 32, { rad: 8, fill: P.cream, lw: 2.6 });
  out += path("M92 68 L86 74 L92 80", { c: P.ink, w: 2.2 });
  out += path("M102 66 L96 82", { c: P.ink, w: 2.2 });
  out += path("M112 68 L118 74 L112 80", { c: P.ink, w: 2.2 });
  out += tlines(128, 74, 1, { w: 92, c: P.muted });
  out += downArrow(160, 90, 14, { c: P.terra });
  out += rect(80, 104, 160, 32, { rad: 8, lw: 2.6 });
  out += circle(102, 120, 9, { c: P.terra, w: 2.2 });
  out += circle(102, 120, 3.4, { c: P.terra, w: 1.8 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    out += path(
      `M${(102 + Math.cos(a) * 11).toFixed(1)} ${(120 + Math.sin(a) * 11).toFixed(1)} L${(102 + Math.cos(a) * 15).toFixed(1)} ${(120 + Math.sin(a) * 15).toFixed(1)}`,
      { c: P.terra, w: 1.8 }
    );
  }
  out += tlines(128, 122, 1, { w: 92, c: P.muted });
  out += downArrow(160, 136, 14, { c: P.terra });
  out += rect(128, 152, 64, 14, { rad: 7, lw: 2.2, c: P.terra });
  out += check(176, 158, 4);
  out += spark(262, 40, 6);
  out += circle(52, 150, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 4 · First render — a terminal running the setup, FFmpeg gears turning, and
//    a rendered clip waiting in a film frame.
function vf4Setup() {
  let out = "";
  out += termWin(28, 20, 136, 86);
  out += promptMark(42, 46);
  out += tlines(54, 42, 1, { w: 88, c: P.terra });
  out += promptMark(42, 66);
  out += tlines(54, 62, 1, { w: 72, c: P.soft });
  out += promptMark(42, 86);
  out += tlines(54, 82, 1, { w: 96, c: P.muted });
  out += check(146, 34, 6);
  out += circle(222, 52, 17, { c: P.ink, w: 2.4 });
  out += circle(222, 52, 6.5, { c: P.ink, w: 1.8 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    out += path(
      `M${(222 + Math.cos(a) * 20).toFixed(1)} ${(52 + Math.sin(a) * 20).toFixed(1)} L${(222 + Math.cos(a) * 24).toFixed(1)} ${(52 + Math.sin(a) * 24).toFixed(1)}`,
      { c: P.ink, w: 2 }
    );
  }
  out += circle(254, 86, 10, { c: P.muted, w: 2 });
  out += circle(254, 86, 3.6, { c: P.muted, w: 1.6 });
  out += path("M196 112 h96", { c: P.sand, w: 0 }); // anchor (no-op keeps layout readable)
  out += rect(196, 112, 96, 44, { rad: 6, lw: 2.6 });
  for (let y = 120; y <= 148; y += 7) out += circle(204, y, 1.8, { c: P.muted, w: 1.2, fill: P.muted });
  out += path("M226 122 L226 146 L250 134 Z", { c: P.terra, w: 2.2, fill: P.cream });
  out += tlines(260, 128, 2, { w: 24, gap: 9, c: P.muted });
  out += rect(28, 138, 76, 10, { rad: 5, lw: 2, c: P.muted });
  out += rect(28, 138, 52, 10, { rad: 5, fill: P.terra, lw: 0.01 });
  out += spark(284, 24, 5);
  out += circle(60, 158, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 5 · A scene is a webpage — layered DOM elements inside a viewport, an
//    overlay dropping in, and a timeline playhead below.
function vf5SceneDom() {
  let out = "";
  out += termWin(34, 22, 190, 94);
  out += rect(48, 66, 128, 42, { rad: 5, fill: P.cream, lw: 2 });
  out += rect(66, 58, 104, 42, { rad: 5, lw: 2.2 });
  out += rect(88, 64, 62, 30, { rad: 5, c: P.terra, lw: 2.2 });
  out += tlines(98, 74, 2, { w: 40, gap: 9, c: P.terra });
  out += rect(240, 26, 58, 24, { rad: 6, lw: 2.2 });
  out += tlines(250, 34, 1, { w: 38, c: P.muted });
  out += downArrow(269, 52, 12, { c: P.terra });
  out += path("M34 142 h258", { c: P.sand, w: 2 });
  for (const x of [60, 100, 140, 180, 220, 260]) out += path(`M${x} 138 v8`, { c: P.sand, w: 1.4 });
  out += path("M206 124 L222 124 L214 134 Z", { c: P.terra, w: 2, fill: P.cream });
  out += path("M214 134 L214 152", { c: P.terra, w: 2.6 });
  out += spark(292, 132, 5);
  out += circle(30, 156, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 6 · First motion graphic — a title card sliding in, its motion trail behind,
//    a play badge, and a timecode track.
function vf6Motion() {
  return svg(`
  ${rect(30, 40, 176, 92, { rad: 10, lw: 2.8 })}
  ${path("M44 68 h10", { c: P.soft, w: 2 })}
  ${path("M40 86 h8", { c: P.soft, w: 2 })}
  ${tlines(58, 68, 1, { w: 118, c: P.terra, lw: 3.4 })}
  ${tlines(58, 86, 1, { w: 118, c: P.ink, lw: 2.6 })}
  ${tlines(58, 104, 1, { w: 84, c: P.muted })}
  ${circle(252, 74, 24, { lw: 2.8 })}
  ${path("M245 62 L245 86 L267 74 Z", { c: P.terra, w: 2.4, fill: P.cream })}
  ${rect(30, 144, 246, 8, { rad: 4, lw: 2, c: P.muted })}
  ${rect(30, 144, 58, 8, { rad: 4, fill: P.terra, lw: 0.01 })}
  ${spark(252, 30, 6)}
  ${circle(288, 148, 3.2, { c: P.soft, w: 1.8, fill: P.soft })}`);
}

// 7 · Overlays and captions — a scene with a lower third riding over it, a
//    timecode tag, and a caption track sequenced below.
function vf7Captions() {
  return svg(`
  ${rect(36, 18, 170, 98, { rad: 8, lw: 2.8 })}
  ${circle(72, 46, 10, { c: P.muted, w: 2 })}
  ${path("M36 96 L80 60 L112 92 L140 70 L206 96", { c: P.muted, w: 2.2 })}
  ${rect(50, 78, 118, 22, { rad: 4, fill: P.cream, c: P.terra, lw: 2.2 })}
  ${tlines(60, 84, 1, { w: 66, c: P.ink })}
  ${tlines(60, 93, 1, { w: 44, c: P.muted })}
  ${tag(236, 34, 12)}
  ${tlines(226, 52, 2, { w: 48, gap: 9, c: P.muted })}
  ${rect(44, 132, 52, 20, { rad: 5, lw: 2 })}
  ${tlines(52, 140, 1, { w: 36, c: P.muted })}
  ${harrow(98, 142, 14, { c: P.terra })}
  ${rect(114, 132, 52, 20, { rad: 5, lw: 2 })}
  ${tlines(122, 140, 1, { w: 36, c: P.muted })}
  ${harrow(168, 142, 14, { c: P.terra })}
  ${rect(184, 132, 52, 20, { rad: 5, lw: 2 })}
  ${tlines(192, 140, 1, { w: 36, c: P.muted })}
  ${harrow(238, 142, 18, { c: P.terra })}
  ${check(266, 142, 5)}
  ${spark(290, 18, 5)}`);
}

// 8 · The full pipeline — three skills feed a composite frame, with the source
//    footage joined at the final composite.
function vf8Pipeline() {
  let out = "";
  out += rect(18, 28, 56, 36, { rad: 7, lw: 2.4 });
  out += path("M38 40 L38 56 L52 48 Z", { c: P.terra, w: 2, fill: P.cream });
  out += harrow(76, 46, 12, { c: P.terra });
  out += rect(92, 28, 56, 36, { rad: 7, lw: 2.4 });
  out += rect(108, 34, 24, 10, { rad: 3, c: P.terra, lw: 1.8 });
  out += tlines(100, 52, 1, { w: 40, c: P.muted });
  out += harrow(150, 46, 12, { c: P.terra });
  out += rect(166, 28, 56, 36, { rad: 7, lw: 2.4 });
  out += tlines(174, 42, 2, { w: 40, gap: 8, c: P.muted });
  out += harrow(224, 46, 20, { c: P.terra });
  out += rect(250, 22, 54, 48, { rad: 6, lw: 2.6 });
  out += rect(256, 30, 42, 24, { rad: 3, fill: P.cream, lw: 1.8 });
  out += tlines(262, 38, 2, { w: 30, gap: 7, c: P.muted });
  out += rect(18, 104, 96, 44, { rad: 7, lw: 2.4 });
  out += path("M44 116 L44 136 L60 126 Z", { c: P.terra, w: 2, fill: P.cream });
  out += tlines(66, 118, 2, { w: 36, gap: 8, c: P.muted });
  out += path("M114 126 L277 126 L277 78", { c: P.terra, w: 2.2 });
  out += path("M270 86 L277 78 L284 86", { c: P.terra, w: 2.2 });
  out += check(262, 96, 5);
  out += spark(292, 156, 5);
  out += circle(30, 160, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 9 · The review gate — a render lands in front of a human: approve and it
//    ships, revise and it loops back.
function vf9Review() {
  let out = "";
  out += rect(30, 34, 74, 48, { rad: 6, lw: 2.6 });
  out += path("M56 46 L56 66 L74 56 Z", { c: P.terra, w: 2, fill: P.cream });
  out += harrow(104, 58, 22, { c: P.terra });
  out += circle(148, 48, 9, { lw: 2.4 });
  out += path("M134 76 C134 60 162 60 162 76", { c: P.ink, w: 2.4 });
  out += path("M128 76 h40", { c: P.muted, w: 1.6 });
  out += harrow(164, 44, 32, { c: P.terra });
  out += rect(200, 26, 72, 28, { rad: 13, fill: P.cream, c: P.terra, lw: 2.2 });
  out += check(232, 40, 5);
  out += harrow(164, 58, 32, { c: P.muted });
  out += rect(200, 66, 72, 28, { rad: 13, lw: 2.2, c: P.muted });
  out += tlines(212, 80, 1, { w: 44, c: P.muted });
  out += path("M200 80 L118 80 L105 64", { c: P.muted, w: 2 });
  out += path("M112 67 L105 64 L106 72", { c: P.muted, w: 2 });
  out += downArrow(236, 54, 26, { c: P.terra });
  out += rect(212, 82, 48, 22, { rad: 5, lw: 2 });
  out += tlines(220, 90, 1, { w: 30, c: P.muted });
  out += spark(292, 30, 6);
  out += circle(34, 104, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 10 · Where it fits and where it doesn't — a panel of what HTML video does
//     well (charts, captions, social) beside a crossed-out photoreal face.
function vf10Limits() {
  let out = "";
  out += rect(28, 26, 126, 118, { rad: 10, lw: 2.6 });
  out += rect(44, 88, 18, 34, { rad: 3, fill: P.cream, lw: 2 });
  out += rect(70, 74, 18, 48, { rad: 3, lw: 2 });
  out += rect(96, 60, 18, 62, { rad: 3, fill: P.cream, lw: 2 });
  out += rect(122, 38, 24, 40, { rad: 5, lw: 2.2, c: P.muted });
  out += circle(134, 46, 1.8, { c: P.muted, w: 1.4, fill: P.muted });
  out += tlines(44, 132, 1, { w: 64, c: P.muted });
  out += check(122, 132, 6);
  out += rect(172, 26, 126, 118, { rad: 10, lw: 2.6, c: P.muted });
  out += circle(235, 76, 26, { c: P.muted, w: 2.4 });
  out += circle(226, 72, 2.6, { c: P.muted, w: 1.6, fill: P.muted });
  out += circle(244, 72, 2.6, { c: P.muted, w: 1.6, fill: P.muted });
  out += path("M226 88 Q235 94 244 88", { c: P.muted, w: 2 });
  out += path("M186 40 L286 132", { c: P.terra, w: 2.8 });
  out += path("M286 40 L186 132", { c: P.terra, w: 2.8 });
  out += spark(160, 80, 6);
  out += circle(300, 158, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// Cover: code streams into a headless browser window; the filmstrip rolls out
// of it to the right, the last frame holding the play button.
function videoCoverArt() {
  let sprockets = "";
  for (let i = 0; i < 13; i++) {
    const x = 366 + i * 24;
    sprockets += circle(x, 58, 2.4, { c: P.muted, w: 1.4, fill: P.muted });
    sprockets += circle(x, 148, 2.4, { c: P.muted, w: 1.4, fill: P.muted });
  }
  return svg(
    `
  ${sun(694, 40, 18, { inner: true, rays: 10 })}
  ${tokens(30, 54, 13, { gap: 17 })}
  ${tokens(30, 74, 9, { gap: 17, c: P.terra })}
  ${path("M30 88 C30 108 84 104 96 120", { c: P.soft, w: 2.4 })}
  ${termWin(104, 40, 216, 132)}
  ${tlines(122, 72, 5, { w: 170, gap: 13, c: P.soft })}
  ${path("M124 150 L116 158 L124 166", { c: P.terra, w: 2.4 })}
  ${path("M140 146 L132 170", { c: P.terra, w: 2.4 })}
  ${path("M156 150 L164 158 L156 166", { c: P.terra, w: 2.4 })}
  ${harrow(320, 106, 22, { c: P.terra })}
  ${rect(352, 44, 322, 118, { rad: 8, lw: 2.8 })}
  ${sprockets}
  ${rect(374, 66, 84, 54, { rad: 4, lw: 2 })}
  ${tlines(384, 84, 3, { w: 56, gap: 9, c: P.muted })}
  ${rect(474, 66, 84, 54, { rad: 4, lw: 2 })}
  ${path("M498 82 L498 104 L520 93 Z", { c: P.ink, w: 2 })}
  ${rect(574, 66, 84, 54, { rad: 4, fill: P.cream, lw: 2 })}
  ${path("M602 80 L602 106 L628 93 Z", { c: P.terra, w: 2.4, fill: P.cream })}
  ${spark(96, 30, 7)}
  ${spark(356, 196, 6)}
  ${spark(700, 190, 5)}
  ${circle(150, 222, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(380, 220, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(580, 224, 3.4, { c: P.muted, w: 1.8 })}
`,
    { w: 720, h: 250 }
  );
}

// ---------------------------------------------------------------- harness theme
// DeepSeek Harness for Newbies: the equation agent = model + harness, a plugboard
// of swappable capabilities, a first run, the Web UI, four runtime modes, the
// append-only thread, the tool bench, the trip-up path, dials you turn, and the
// road from hobby to production.

// 1 · Agent = Model + Harness — a spark-brain, plus a plug, equals a robot head.
function hs1Equation() {
  let out = "";
  out += circle(66, 60, 25, { lw: 2.6 });
  out += circle(58, 54, 2.6, { c: P.terra, w: 1.8, fill: P.terra });
  out += circle(74, 52, 2.6, { c: P.terra, w: 1.8, fill: P.terra });
  out += circle(62, 70, 2.6, { c: P.terra, w: 1.8, fill: P.terra });
  out += circle(76, 68, 2.6, { c: P.terra, w: 1.8, fill: P.terra });
  out += path("M58 54 L62 70 M74 52 L76 68 M58 54 L74 52 M62 70 L76 68", { c: P.terra, w: 1.2 });
  out += path("M112 60 h12 M118 54 v12", { c: P.ink, w: 2.4 });
  out += rect(138, 48, 26, 24, { rad: 5, lw: 2.4 });
  out += path("M164 54 h10 M164 66 h10", { c: P.ink, w: 2.4 });
  out += path("M138 60 C124 60 124 76 138 76", { c: P.sand, w: 2 });
  out += path("M192 54 h16 M192 66 h16", { c: P.ink, w: 2.4 });
  out += rect(224, 36, 64, 52, { rad: 12, lw: 2.8 });
  out += circle(244, 58, 5.4, { c: P.terra, w: 2.2, fill: P.terra });
  out += circle(268, 58, 5.4, { c: P.terra, w: 2.2, fill: P.terra });
  out += path("M236 78 h40", { c: P.sand, w: 2.2 });
  out += path("M256 36 v-10", { c: P.ink, w: 2.2 });
  out += circle(256, 23, 3.6, { c: P.terra, w: 1.8, fill: P.terra });
  out += rect(214, 52, 10, 20, { rad: 4, lw: 2 });
  out += rect(288, 52, 10, 20, { rad: 4, lw: 2 });
  out += tlines(46, 104, 1, { w: 40, c: P.muted });
  out += tlines(136, 104, 1, { w: 52, c: P.muted });
  out += tlines(240, 104, 1, { w: 32, c: P.muted });
  out += path("M40 132 h240", { c: P.sand, w: 2 });
  out += spark(292, 24, 5);
  out += circle(34, 150, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 2 · Everything is a plug-in — a socket panel, some slots filled, some open.
function hs2Plugboard() {
  let out = "";
  out += rect(40, 22, 240, 118, { rad: 12, lw: 2.8 });
  const slots = [
    { x: 64, y: 38, plug: true },
    { x: 138, y: 38, plug: false },
    { x: 212, y: 38, plug: true },
    { x: 64, y: 94, plug: false },
    { x: 138, y: 94, plug: true },
    { x: 212, y: 94, plug: false },
  ];
  for (const s of slots) {
    out += rect(s.x, s.y, 44, 40, { rad: 8, lw: 2, c: P.muted });
    if (s.plug) {
      out += rect(s.x + 6, s.y + 12, 24, 16, { rad: 4, fill: P.terra, lw: 0.01 });
      out += path(`M${s.x + 30} ${s.y + 16} h8 M${s.x + 30} ${s.y + 24} h8`, { c: P.terra, w: 2.2 });
      out += path(`M${s.x + 6} ${s.y + 20} h-4`, { c: P.sand, w: 2 });
    } else {
      out += circle(s.x + 22, s.y + 20, 5, { c: P.muted, w: 1.8 });
    }
  }
  out += tlines(96, 150, 1, { w: 128, c: P.muted });
  out += spark(296, 30, 6);
  out += circle(28, 150, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 3 · First run — a terminal hands off to the Web UI, and a clip shows up.
function hs3FirstRun() {
  let out = "";
  out += termWin(30, 22, 122, 80);
  out += promptMark(46, 48);
  out += tlines(58, 44, 1, { w: 76, c: P.terra });
  out += promptMark(46, 68);
  out += tlines(58, 64, 1, { w: 60, c: P.muted });
  out += promptMark(46, 88);
  out += tlines(58, 84, 1, { w: 84, c: P.soft });
  out += check(138, 34, 5);
  out += harrow(154, 60, 18, { c: P.terra });
  out += rect(176, 30, 112, 94, { rad: 8, lw: 2.6 });
  out += path("M176 46 L288 46", { c: P.sand, w: 1.8 });
  out += circle(186, 38, 2.2, { c: P.terra, w: 1.6, fill: P.terra });
  out += circle(194, 38, 2.2, { c: P.muted, w: 1.4, fill: P.muted });
  out += circle(202, 38, 2.2, { c: P.soft, w: 1.4, fill: P.soft });
  out += circle(212, 80, 13, { c: P.terra, w: 2.4 });
  out += circle(212, 80, 5, { c: P.terra, w: 2 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    out += path(
      `M${(212 + Math.cos(a) * 16).toFixed(1)} ${(80 + Math.sin(a) * 16).toFixed(1)} L${(212 + Math.cos(a) * 20).toFixed(1)} ${(80 + Math.sin(a) * 20).toFixed(1)}`,
      { c: P.terra, w: 1.8 }
    );
  }
  out += tlines(238, 74, 2, { w: 34, gap: 9, c: P.muted });
  out += downArrow(260, 128, 14, { c: P.terra });
  out += rect(238, 146, 44, 16, { rad: 8, c: P.terra, lw: 2.2 });
  out += tlines(246, 153, 1, { w: 28, c: P.muted });
  out += spark(36, 144, 5);
  out += circle(296, 132, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 4 · The Web UI — a browser with a session sidebar, a chat, and a stats panel.
function hs4WebUi() {
  let out = "";
  out += rect(26, 20, 200, 124, { rad: 8, lw: 2.6 });
  out += path("M26 36 L226 36", { c: P.sand, w: 1.8 });
  out += circle(36, 28, 2.2, { c: P.terra, w: 1.6, fill: P.terra });
  out += circle(44, 28, 2.2, { c: P.muted, w: 1.4, fill: P.muted });
  out += circle(52, 28, 2.2, { c: P.soft, w: 1.4, fill: P.soft });
  out += rect(34, 44, 52, 92, { rad: 6, fill: P.cream, lw: 2 });
  const rows = [54, 70, 86, 102, 118];
  for (let i = 0; i < rows.length; i++) {
    const y = rows[i];
    if (i === 1) out += rect(38, y - 9, 44, 18, { rad: 4, fill: P.terra, lw: 0.01 });
    out += circle(46, y, 2.4, { c: i === 1 ? P.cream : P.muted, w: 1.6, fill: i === 1 ? P.cream : "none" });
    out += tlines(53, y - 3, 1, { w: 26, c: i === 1 ? P.cream : P.muted, lw: 1.8 });
  }
  out += bubble(152, 60, 56, 20, { c: P.muted, lw: 2 });
  out += tlines(136, 56, 1, { w: 32, c: P.muted });
  out += bubble(152, 96, 64, 26, { fill: P.cream });
  out += tlines(132, 92, 2, { w: 44, gap: 9, c: P.terra });
  out += rect(238, 20, 58, 88, { rad: 8, lw: 2.2 });
  out += dial(267, 50, 16, 0.92);
  out += tlines(248, 80, 3, { w: 38, gap: 8, c: P.muted });
  out += path("M26 154 h198", { c: P.sand, w: 2 });
  out += spark(296, 30, 6);
  out += circle(298, 150, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 5 · Pick your mode — four tiles: standard, code, minimal, creator.
function hs5Modes() {
  let out = "";
  out += rect(38, 30, 92, 56, { rad: 9, fill: P.cream, lw: 2.6 });
  out += check(84, 52, 7, { c: P.terra });
  out += tlines(64, 68, 1, { w: 40, c: P.muted });
  out += rect(142, 30, 92, 56, { rad: 9, lw: 2.4 });
  out += path("M172 46 L166 54 L172 62", { c: P.ink, w: 2.4 });
  out += path("M182 44 L174 64", { c: P.ink, w: 2.4 });
  out += path("M196 46 L202 54 L196 62", { c: P.ink, w: 2.4 });
  out += tlines(168, 70, 1, { w: 40, c: P.muted });
  out += rect(38, 96, 92, 56, { rad: 9, lw: 2.4 });
  out += tlines(64, 116, 1, { w: 40, c: P.muted });
  out += tlines(64, 128, 1, { w: 24, c: P.muted });
  out += rect(142, 96, 92, 56, { rad: 9, fill: P.cream, lw: 2.6 });
  out += pencil(168, 106, 24, { c: P.ink });
  out += tlines(196, 118, 1, { w: 26, c: P.muted });
  out += spark(258, 40, 6);
  out += spark(256, 118, 5);
  out += path("M38 160 h196", { c: P.sand, w: 2 });
  out += downArrow(84, 134, 14, { c: P.terra });
  out += circle(292, 154, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 6 · The thread — an append-only log with a forked branch and replay boxes.
function hs6Thread() {
  let out = "";
  const nodes = [32, 66, 100, 134];
  for (let i = 0; i < nodes.length - 1; i++) {
    out += path(`M60 ${nodes[i] + 8} L60 ${nodes[i + 1] - 8}`, { c: P.sand, w: 2.2 });
  }
  for (let i = 0; i < nodes.length; i++) {
    const y = nodes[i];
    const filled = i === 0 || i === 3;
    out += circle(60, y, 8, { c: filled ? P.terra : P.ink, w: 2.2, fill: filled ? P.terra : "none" });
    out += tlines(76, y - 4, 1, { w: 50, c: P.muted });
  }
  out += path("M68 66 C120 66 140 57 180 57", { c: P.terra, w: 2.2 });
  out += rect(182, 44, 96, 28, { rad: 7, c: P.terra, lw: 2.2 });
  out += tlines(196, 57, 1, { w: 64, c: P.muted });
  out += path("M68 100 C120 100 140 131 180 131", { c: P.muted, w: 2.2 });
  out += rect(182, 118, 96, 28, { rad: 7, lw: 2.2, c: P.muted });
  out += tlines(196, 131, 1, { w: 64, c: P.muted });
  out += downArrow(60, 142, 16, { c: P.terra });
  out += spark(292, 44, 6);
  out += circle(30, 158, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  out += circle(296, 156, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 7 · The bench — a gear, a stack of skill cards, a model dial, a web-search cloud.
function hs7Bench() {
  let out = "";
  out += path("M32 128 h256", { c: P.sand, w: 2.4 });
  out += circle(72, 102, 16, { c: P.ink, w: 2.4 });
  out += circle(72, 102, 6, { c: P.ink, w: 2 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    out += path(
      `M${(72 + Math.cos(a) * 19).toFixed(1)} ${(102 + Math.sin(a) * 19).toFixed(1)} L${(72 + Math.cos(a) * 23).toFixed(1)} ${(102 + Math.sin(a) * 23).toFixed(1)}`,
      { c: P.ink, w: 1.8 }
    );
  }
  out += rect(102, 94, 34, 34, { rad: 4, fill: P.cream, lw: 1.8 });
  out += rect(108, 88, 34, 34, { rad: 4, lw: 2.2 });
  out += tlines(116, 98, 2, { w: 18, gap: 7, c: P.muted });
  out += circle(134, 114, 2.4, { c: P.terra, w: 1.6, fill: P.terra });
  out += dial(182, 104, 18, 0.7);
  out += cloud(244, 100, 15, { c: P.muted, w: 2 });
  out += circle(248, 98, 6, { c: P.terra, w: 2 });
  out += path("M252 103 L258 109", { c: P.terra, w: 2 });
  out += tlines(56, 70, 1, { w: 32, c: P.muted });
  out += tlines(112, 62, 1, { w: 32, c: P.muted });
  out += tlines(168, 62, 1, { w: 32, c: P.muted });
  out += tlines(228, 70, 1, { w: 32, c: P.muted });
  out += spark(296, 48, 5);
  out += circle(36, 148, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 8 · Where newbies trip — stepping stones with one cracked, and a warning.
function hs8Stones() {
  let out = "";
  out += rect(36, 128, 42, 18, { rad: 9, fill: P.cream, lw: 2.2 });
  out += rect(94, 104, 42, 18, { rad: 9, lw: 2.2 });
  out += rect(152, 80, 42, 18, { rad: 9, lw: 2.2, c: P.terra });
  out += path("M172 80 l-7 8 l9 5 l-7 5", { c: P.terra, w: 2 });
  out += rect(210, 56, 42, 18, { rad: 9, lw: 2.2 });
  out += path("M231 56 v-24", { c: P.ink, w: 2 });
  out += path("M231 32 l18 6 l-18 6 Z", { c: P.terra, w: 2, fill: P.cream });
  out += circle(252, 116, 13, { c: P.terra, w: 2.4 });
  out += path("M252 109 v8", { c: P.terra, w: 2.4 });
  out += circle(252, 122, 1.8, { c: P.terra, w: 1.4, fill: P.terra });
  out += path("M36 156 h248", { c: P.sand, w: 2 });
  out += spark(52, 60, 5);
  out += circle(300, 84, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 9 · Mold it to fit — a control panel with three faders, one moved.
function hs9Dials() {
  let out = "";
  out += bubble(44, 46, 46, 22, { c: P.muted, lw: 2 });
  out += tlines(30, 42, 1, { w: 28, c: P.muted });
  out += rect(66, 26, 200, 118, { rad: 12, lw: 2.8 });
  const faders = [
    { x: 104, y: 84, on: true },
    { x: 166, y: 64, on: false },
    { x: 228, y: 100, on: false },
  ];
  for (const f of faders) {
    out += path(`M${f.x} 46 v88`, { c: P.sand, w: 2 });
    out += rect(f.x - 11, f.y, 22, 10, { rad: 4, fill: f.on ? P.terra : P.cream, c: f.on ? P.terra : P.ink, lw: f.on ? 0.01 : 2 });
  }
  out += tlines(92, 140, 1, { w: 24, c: P.muted });
  out += tlines(154, 140, 1, { w: 24, c: P.muted });
  out += tlines(216, 140, 1, { w: 24, c: P.muted });
  out += spark(290, 34, 6);
  out += circle(28, 150, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 10 · From hobby to production — a ramp up to a server rack, guarded by a shield.
function hs10Ramp() {
  let out = "";
  out += path("M36 140 L244 54", { c: P.ink, w: 2.8 });
  for (let i = 0; i < 7; i++) {
    const t = (i + 1) / 8;
    const x = 36 + t * 208;
    const y = 140 - t * 86;
    out += path(`M${x.toFixed(1)} ${y.toFixed(1)} l-10 8`, { c: P.sand, w: 1.6 });
  }
  out += rect(36, 112, 52, 26, { rad: 6, fill: P.cream, lw: 2.2 });
  out += tlines(44, 123, 1, { w: 36, c: P.muted });
  out += rect(216, 28, 68, 66, { rad: 8, lw: 2.6 });
  out += path("M216 50 h68 M216 72 h68", { c: P.sand, w: 1.8 });
  out += circle(226, 40, 2.6, { c: P.terra, w: 1.8, fill: P.terra });
  out += tlines(236, 36, 1, { w: 34, c: P.muted });
  out += circle(226, 62, 2.6, { c: P.terra, w: 1.8, fill: P.terra });
  out += tlines(236, 58, 1, { w: 34, c: P.muted });
  out += circle(226, 84, 2.6, { c: P.terra, w: 1.8, fill: P.terra });
  out += tlines(236, 80, 1, { w: 34, c: P.muted });
  out += path("M150 100 C150 94 157 91 164 91 C171 91 178 94 178 100 L178 108 C178 118 169 124 164 126 C159 124 150 118 150 108 Z", { c: P.terra, w: 2.4 });
  out += check(164, 108, 6, { c: P.terra });
  out += path("M110 108 L146 92", { c: P.terra, w: 2.4 });
  out += path("M146 92 L137 95 M146 92 L143 100", { c: P.terra, w: 2.4 });
  out += spark(292, 140, 6);
  out += circle(36, 158, 3.2, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// Cover: a terminal's cable ends in a plug that lands in the harness socket;
// the robot head on the other side is the agent the pair adds up to.
function harnessCoverArt() {
  let out = "";
  out += termWin(40, 46, 190, 140);
  out += promptMark(60, 78);
  out += tlines(74, 74, 1, { w: 130, c: P.terra });
  out += promptMark(60, 102);
  out += tlines(74, 98, 1, { w: 100, c: P.soft });
  out += promptMark(60, 126);
  out += tlines(74, 122, 1, { w: 140, c: P.muted });
  out += promptMark(60, 150);
  out += tlines(74, 146, 1, { w: 84, c: P.soft });
  out += path("M230 118 C276 118 296 105 330 105", { c: P.ink, w: 2.6 });
  out += rect(330, 92, 34, 26, { rad: 5, fill: P.cream, lw: 2.4 });
  out += path("M364 98 h12 M364 110 h12", { c: P.ink, w: 2.4 });
  out += rect(380, 80, 56, 50, { rad: 8, lw: 2.8 });
  out += path("M398 92 v26 M418 92 v26", { c: P.muted, w: 2.2 });
  out += harrow(440, 105, 16, { c: P.terra });
  out += rect(462, 62, 86, 70, { rad: 14, lw: 2.8 });
  out += circle(490, 92, 7, { c: P.terra, w: 2.4, fill: P.terra });
  out += circle(522, 92, 7, { c: P.terra, w: 2.4, fill: P.terra });
  out += path("M490 116 h32", { c: P.sand, w: 2.4 });
  out += path("M505 62 v-16", { c: P.ink, w: 2.4 });
  out += circle(505, 42, 5, { c: P.terra, w: 2, fill: P.terra });
  out += rect(452, 84, 10, 24, { rad: 4, lw: 2 });
  out += rect(548, 84, 10, 24, { rad: 4, lw: 2 });
  out += tlines(120, 214, 2, { w: 200, gap: 10, c: P.muted });
  out += sun(668, 44, 16, { inner: true, rays: 10 });
  out += spark(300, 52, 7);
  out += spark(628, 196, 6);
  out += circle(150, 236, 3.4, { c: P.soft, w: 1.8, fill: P.soft });
  out += circle(420, 232, 3.4, { c: P.soft, w: 1.8, fill: P.soft });
  out += circle(640, 152, 3.4, { c: P.muted, w: 1.8 });
  return svg(out, { w: 720, h: 250 });
}

// ---------------------------------------------------------------- themes

const GARDEN = [illoWindow, illoLight, illoPots, illoSoil, illoWater, illoSeeds, illoBalcony, illoHerbs, illoPests, illoSeasons];
const OLLAMA = [ollamaLaptop, ollamaInstall, ollamaChat, ollamaToolbelt, ollamaModels, ollamaServer, ollamaGUI, ollamaModelfile, ollamaJobs, ollamaFix];
const COPYWRITING = [cwWhat, cwDetective, cwBenefits, cwHeadline, cwAIDA, cwHuman, cwCTA, cwPolish, cwPractice, cwPaycheck];
const PEOPLE = [plBook, plNoCriticize, plAppreciation, plWant, plLikable, plListening, plWinOver, plChair, plFeather, pl30Days];
const CACHE = [pc1FiveMin, pc2Phases, pc3Hit, pc4Autopilot, pc5Tree, pc6Monster, pc7Ollama, pc8PromptHacker, pc9Numbers, pc10Thirty];
const SPARK = [sp1DeskSupercomputer, sp2Superchip, sp3UnifiedMemory, sp4Petaflop, sp5Cluster, sp6FirstModel, sp7AgentLock, sp8Finetune, sp9Ecosystem, sp10Verdict];
const STUDIO = [st1DeskLab, st2StudioWindow, st3ModelShelf, st4DataWarm, st5FlashBolt, st6RunCard, st7LossCurve, st8Meltdown, st9ServeLora, st10NextLevel];
const VL = [vl1YourServer, vl2TokenJourney, vl3KVCache, vl4Batching, vl5StandingUp, vl6Chatbot, vl7Batch, vl8MoreGPUs, vl9Production, vl10Benchmarks];
const AG = [ag1Wallet, ag2Token, ag3Quadratic, ag4Context, ag5Config, ag6Prompt, ag7Model, ag8Constrain, ag9Guard, ag10Meter];
const VF = [vf1Bottleneck, vf2HtmlVideo, vf3Toolchain, vf4Setup, vf5SceneDom, vf6Motion, vf7Captions, vf8Pipeline, vf9Review, vf10Limits];

// ---------------------------------------------------------------- OMP (Oh My Pi) theme
// 1 · What OMP is: little pi, and the much bigger agent that grew around it.
function omp1Pi() {
  let out = "";
  out += termWin(24, 34, 96, 100);
  out += promptMark(44, 62, 5);
  out += tlines(56, 60, 3, { w: 44, gap: 12, c: P.muted });
  out += path("M64 96 h26 M72 96 v18 M84 96 v20", { c: P.ink, w: 2.6 });
  out += path("M128 84 h30", { c: P.terra, w: 2.4 });
  out += path("M150 78 l8 6 -8 6", { c: P.terra, w: 2.4 });
  out += termWin(176, 18, 124, 132);
  out += promptMark(198, 52, 6);
  out += tlines(212, 48, 2, { w: 70, gap: 11, c: P.soft });
  out += rect(192, 70, 92, 34, { rad: 6, fill: P.cream, lw: 2.2 });
  out += check(204, 87, 5);
  out += tlines(216, 82, 2, { w: 56, gap: 9, c: P.muted });
  out += promptMark(198, 124, 6);
  out += rect(210, 116, 26, 16, { rad: 3, fill: P.cream, lw: 2 });
  out += spark(296, 26, 7);
  out += circle(166, 144, 3, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 2 · The IDE, wired in: one window, language server and debugger on tap.
function omp2Ide() {
  let out = "";
  out += termWin(24, 24, 152, 120);
  out += tlines(42, 46, 6, { w: 112, gap: 13, c: P.muted });
  out += rect(42, 62, 62, 10, { rad: 2, fill: P.cream, lw: 1.8 });
  out += rect(112, 62, 26, 10, { rad: 2, c: P.terra, lw: 1.8 });
  out += path("M176 70 C214 70 224 58 250 58", { c: P.ink, w: 2.2 });
  out += rect(250, 34, 52, 52, { rad: 8, lw: 2.4 });
  out += circle(276, 60, 11, { c: P.ink, w: 2 });
  out += circle(276, 60, 4, { c: P.terra, w: 1.8, fill: P.terra });
  out += path("M276 44 v-6 M276 76 v6 M260 60 h-6 M292 60 h6", { c: P.ink, w: 2 });
  out += path("M176 108 C214 108 224 112 250 112", { c: P.sand, w: 2.2 });
  out += rect(250, 92, 52, 44, { rad: 8, lw: 2.2, c: P.muted });
  out += circle(268, 114, 4, { c: P.terra, w: 1.8, fill: P.terra });
  out += path("M280 106 h16 M280 122 h16", { c: P.muted, w: 2 });
  out += spark(200, 28, 6);
  return svg(out);
}

// 3 · Get it running: five doors, one native binary, a green check.
function omp3Install() {
  let out = "";
  out += termWin(24, 14, 150, 84);
  out += promptMark(44, 38, 5);
  out += tlines(56, 36, 1, { w: 92, c: P.soft });
  out += promptMark(44, 60, 5);
  out += tlines(56, 58, 1, { w: 74, c: P.muted });
  out += downArrow(100, 100, 26);
  out += rect(64, 130, 132, 28, { rad: 14, fill: P.cream, lw: 2.6 });
  out += circle(86, 144, 6, { c: P.terra, w: 2, fill: P.terra });
  out += tlines(102, 140, 2, { w: 70, gap: 8, c: P.ink });
  out += circle(268, 144, 22, { c: P.ink, w: 2.4 });
  out += check(268, 144, 10);
  out += spark(250, 36, 7);
  return svg(out);
}

// 4 · Your first session: tool cards, an edit preview, a cursor waiting.
function omp4Session() {
  let out = "";
  out += termWin(24, 14, 272, 142);
  out += promptMark(44, 40, 6);
  out += tlines(58, 36, 1, { w: 150, c: P.soft });
  out += rect(44, 56, 110, 24, { rad: 6, fill: P.cream, lw: 2 });
  out += check(58, 68, 5);
  out += tlines(70, 62, 2, { w: 66, gap: 7, c: P.muted });
  out += rect(164, 56, 110, 24, { rad: 6, fill: P.cream, lw: 2 });
  out += check(178, 68, 5);
  out += tlines(190, 62, 2, { w: 66, gap: 7, c: P.muted });
  out += rect(44, 90, 230, 34, { rad: 6, lw: 2.4, c: P.terra });
  out += tlines(60, 100, 1, { w: 120, c: P.terra });
  out += tlines(60, 112, 1, { w: 90, c: P.muted });
  out += check(254, 107, 7);
  out += rect(44, 138, 18, 12, { rad: 2, fill: P.cream, lw: 2 });
  return svg(out);
}

// 5 · Point it at any model: one prompt, roles of every size, fallbacks behind.
function omp5Roles() {
  let out = "";
  out += rect(104, 12, 112, 30, { rad: 15, fill: P.cream, lw: 2.4 });
  out += tlines(124, 27, 1, { w: 72, c: P.ink });
  out += path("M120 42 L84 74", { c: P.sand, w: 2 });
  out += path("M160 42 L160 74", { c: P.sand, w: 2 });
  out += path("M200 42 L244 74", { c: P.sand, w: 2 });
  out += circle(84, 92, 12, { c: P.ink, w: 2.2 });
  out += circle(160, 92, 17, { c: P.ink, w: 2.4 });
  out += circle(244, 92, 22, { c: P.terra, w: 2.6 });
  out += circle(160, 92, 5, { c: P.terra, w: 1.8, fill: P.terra });
  out += circle(84, 92, 3.5, { c: P.soft, w: 1.6, fill: P.soft });
  out += path("M160 109 L160 124", { c: P.sand, w: 2, dash: "4 4" });
  out += circle(160, 138, 9, { c: P.muted, w: 2, dash: "3 3" });
  out += spark(288, 40, 6);
  return svg(out);
}

// 6 · Edits that land: hash anchors, one clean patch, one rejected stale one.
function omp6Hashline() {
  let out = "";
  out += rect(24, 18, 130, 110, { rad: 8, lw: 2.4 });
  out += tlines(40, 40, 6, { w: 84, gap: 13, c: P.muted });
  out += rect(130, 32, 20, 16, { rad: 4, fill: P.cream, c: P.terra, lw: 2 });
  out += rect(130, 68, 20, 16, { rad: 4, fill: P.cream, c: P.terra, lw: 2 });
  out += path("M162 60 h34", { c: P.terra, w: 2.4 });
  out += path("M190 54 l8 6 -8 6", { c: P.terra, w: 2.4 });
  out += rect(206, 30, 96, 60, { rad: 8, fill: P.cream, lw: 2.4 });
  out += tlines(220, 48, 3, { w: 60, gap: 10, c: P.ink });
  out += check(284, 46, 7);
  out += rect(206, 104, 96, 44, { rad: 8, lw: 2.2, c: P.muted });
  out += tlines(220, 118, 2, { w: 54, gap: 9, c: P.muted });
  out += path("M272 112 l14 14 M286 112 l-14 14", { c: P.terra, w: 2.2 });
  return svg(out);
}

// 7 · Everything your IDE knows: a rename fans out, a debugger sits by.
function omp7Lsp() {
  let out = "";
  out += rect(24, 20, 100, 84, { rad: 8, lw: 2.4 });
  out += tlines(38, 38, 5, { w: 72, gap: 12, c: P.muted });
  out += rect(38, 62, 40, 10, { rad: 2, fill: P.cream, lw: 1.8 });
  out += path("M124 52 C160 40 168 34 196 34", { c: P.sand, w: 2 });
  out += path("M124 67 C164 67 172 67 196 67", { c: P.sand, w: 2 });
  out += path("M124 82 C160 92 168 98 196 98", { c: P.sand, w: 2 });
  out += rect(198, 24, 64, 20, { rad: 5, lw: 2 });
  out += rect(198, 57, 64, 20, { rad: 5, lw: 2 });
  out += rect(198, 88, 64, 20, { rad: 5, lw: 2 });
  out += rect(210, 30, 26, 8, { rad: 2, fill: P.cream, lw: 1.6 });
  out += rect(210, 63, 26, 8, { rad: 2, fill: P.cream, lw: 1.6 });
  out += rect(210, 94, 26, 8, { rad: 2, fill: P.cream, lw: 1.6 });
  out += rect(24, 122, 276, 30, { rad: 8, lw: 2.2, c: P.muted });
  out += circle(44, 137, 4, { c: P.terra, w: 1.8, fill: P.terra });
  out += path("M58 137 h200", { c: P.sand, w: 2 });
  out += path("M250 131 l8 6 -8 6", { c: P.terra, w: 2.2 });
  return svg(out);
}

// 8 · The toolbelt: search, shell, language server, and the web, in one tray.
function omp8Tools() {
  let out = "";
  out += path("M36 96 h248", { c: P.ink, w: 2.6 });
  out += path("M48 96 v24 M272 96 v24", { c: P.ink, w: 2.6 });
  out += path("M36 120 h248", { c: P.ink, w: 2.6 });
  out += circle(76, 62, 16, { c: P.ink, w: 2.4 });
  out += path("M88 74 l14 14", { c: P.ink, w: 3 });
  out += rect(128, 40, 52, 40, { rad: 6, lw: 2.4 });
  out += promptMark(142, 54, 5);
  out += tlines(154, 52, 2, { w: 18, gap: 8, c: P.muted });
  out += circle(224, 60, 14, { c: P.ink, w: 2.4 });
  out += circle(224, 60, 5, { c: P.terra, w: 1.8, fill: P.terra });
  out += path("M224 40 v-6 M224 86 v-6 M204 60 h-6 M244 60 h6", { c: P.ink, w: 2.2 });
  out += path("M282 42 l-10 22 h10 l-10 22", { c: P.terra, w: 2.6 });
  out += circle(120, 146, 3, { c: P.soft, w: 1.8, fill: P.soft });
  out += circle(160, 146, 3, { c: P.soft, w: 1.8, fill: P.soft });
  out += circle(200, 146, 3, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 9 · The crew: a parent fans out to isolated workers, one eye watching.
function omp9Crew() {
  let out = "";
  out += rect(24, 18, 110, 44, { rad: 8, fill: P.cream, lw: 2.6 });
  out += promptMark(42, 40, 5);
  out += tlines(54, 36, 2, { w: 62, gap: 9, c: P.ink });
  out += path("M134 34 C170 30 176 26 196 26", { c: P.sand, w: 2 });
  out += path("M134 48 C172 48 178 48 196 48", { c: P.sand, w: 2 });
  out += path("M134 60 C170 66 176 70 196 70", { c: P.sand, w: 2 });
  out += rect(196, 10, 96, 32, { rad: 6, lw: 2, dash: "5 4" });
  out += rect(196, 38, 96, 32, { rad: 6, lw: 2, dash: "5 4" });
  out += rect(196, 66, 96, 32, { rad: 6, lw: 2, dash: "5 4" });
  out += tlines(210, 22, 2, { w: 62, gap: 8, c: P.muted });
  out += tlines(210, 50, 2, { w: 62, gap: 8, c: P.muted });
  out += tlines(210, 78, 2, { w: 62, gap: 8, c: P.muted });
  out += path("M196 112 C160 112 150 112 122 112", { c: P.terra, w: 2.2 });
  out += path("M116 106 l-8 6 8 6", { c: P.terra, w: 2.2 });
  out += rect(24, 96, 94, 32, { rad: 6, lw: 2.4, c: P.terra });
  out += check(40, 112, 6);
  out += tlines(54, 106, 2, { w: 48, gap: 8, c: P.ink });
  out += path("M222 138 q18 -14 36 0 q-18 14 -36 0 Z", { c: P.ink, w: 2.2 });
  out += circle(240, 138, 5, { c: P.terra, w: 2, fill: P.terra });
  out += circle(160, 150, 3, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// 10 · From side project to workhorse: what a session learns comes back.
function omp10Memory() {
  let out = "";
  out += termWin(18, 16, 92, 62);
  out += promptMark(36, 38, 5);
  out += tlines(48, 36, 2, { w: 48, gap: 10, c: P.soft });
  out += path("M110 47 h36", { c: P.terra, w: 2.4 });
  out += path("M140 41 l8 6 -8 6", { c: P.terra, w: 2.4 });
  out += rect(150, 26, 104, 80, { rad: 10, lw: 2.8 });
  out += circle(202, 66, 17, { c: P.ink, w: 2.4 });
  out += circle(202, 66, 6, { c: P.terra, w: 2, fill: P.terra });
  out += path("M202 49 v-7 M202 83 v7 M185 66 h-7 M219 66 h7", { c: P.ink, w: 2.2 });
  out += path("M254 106 C290 122 292 128 264 132", { c: P.sand, w: 2.2 });
  out += termWin(196, 116, 104, 46);
  out += promptMark(214, 138, 5);
  out += tlines(226, 136, 1, { w: 56, c: P.muted });
  out += path("M180 20 C120 4 64 16 40 44", { c: P.soft, w: 2.2, dash: "5 4" });
  out += path("M40 36 l0 12 12 -6", { c: P.soft, w: 2.2 });
  out += spark(288, 38, 7);
  out += circle(148, 142, 3, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out);
}

// OMP cover: the omp terminal, the pi badge, and the tools in orbit.
function ompCoverArt() {
  let out = "";
  out += termWin(40, 52, 300, 150);
  out += promptMark(66, 92, 7);
  out += tlines(84, 88, 1, { w: 140, c: P.terra });
  out += rect(84, 112, 190, 34, { rad: 6, fill: P.cream, lw: 2.2 });
  out += check(100, 129, 7);
  out += tlines(116, 122, 2, { w: 120, gap: 10, c: P.muted });
  out += promptMark(66, 170, 7);
  out += rect(84, 160, 24, 18, { rad: 3, fill: P.cream, lw: 2 });
  out += circle(430, 96, 40, { c: P.ink, w: 2.8 });
  out += path("M410 88 h40 M420 88 v30 M440 88 v34", { c: P.terra, w: 3 });
  out += circle(520, 170, 15, { c: P.ink, w: 2.4 });
  out += path("M531 181 l13 13", { c: P.ink, w: 3 });
  out += circle(596, 96, 14, { c: P.ink, w: 2.4 });
  out += circle(596, 96, 4.5, { c: P.terra, w: 1.8, fill: P.terra });
  out += path("M596 78 v-5 M596 119 v-5 M578 96 h-5 M614 96 h5", { c: P.ink, w: 2 });
  out += path("M660 150 l-9 20 h9 l-9 20", { c: P.terra, w: 2.6 });
  out += spark(368, 52, 9);
  out += spark(640, 60, 7);
  out += spark(476, 208, 8);
  out += circle(340, 222, 3.4, { c: P.soft, w: 1.8, fill: P.soft });
  out += circle(560, 226, 3.4, { c: P.soft, w: 1.8, fill: P.soft });
  return svg(out, { w: 720, h: 250 });
}

const OMP = [omp1Pi, omp3Install, omp4Session, omp5Roles, omp6Hashline, omp7Lsp, omp8Tools, omp9Crew, omp10Memory, omp2Ide];

const HS = [hs1Equation, hs2Plugboard, hs3FirstRun, hs4WebUi, hs5Modes, hs6Thread, hs7Bench, hs8Stones, hs9Dials, hs10Ramp];

const THEMES = {
  garden: { chapters: GARDEN, cover: gardenCoverArt },
  ollama: { chapters: OLLAMA, cover: ollamaCoverArt },
  copywriting: { chapters: COPYWRITING, cover: copywritingCoverArt },
  people: { chapters: PEOPLE, cover: peopleCoverArt },
  cache: { chapters: CACHE, cover: cacheCoverArt },
  spark: { chapters: SPARK, cover: sparkCoverArt },
  studio: { chapters: STUDIO, cover: studioCoverArt },
  vllm: { chapters: VL, cover: vllmCoverArt },
  agent: { chapters: AG, cover: agentCoverArt },
  video: { chapters: VF, cover: videoCoverArt },
  harness: { chapters: HS, cover: harnessCoverArt },
  omp: { chapters: OMP, cover: ompCoverArt },
};

// Chapter illustrations are chosen by chapter number (1-based) within a theme;
// unknown themes or numbers get a neutral stand-in so any book is illustrated.
function chapterIllustration(num, theme = "garden") {
  const set = THEMES[theme];
  const list = (set && set.chapters) || GARDEN;
  const fn = list[Number(num) - 1];
  if (fn) return fn();
  if (theme && theme !== "garden") {
    const fallback = GARDEN[Number(num) - 1];
    if (fallback) return fallback();
  }
  return svg(`${pot(160, 140, { w: 64, h: 36 })}${plant(160, 104, { h: 48 })}`);
}

// ---------------------------------------------------------------- cover art

// Garden cover: a little city that grows — sun, birds, apartment blocks with balcony plants.
function gardenCoverArt() {
  return svg(
    `
  ${sun(580, 56, 30, { inner: true, rays: 10 })}
  ${path("M300 40 q10 -9 20 0", { c: P.muted, w: 2 })}
  ${path("M336 30 q10 -9 20 0", { c: P.muted, w: 2 })}
  ${rect(44, 96, 150, 88, { fill: P.cream, lw: 2.4 })}
  ${rect(230, 118, 170, 66, { fill: P.cream, lw: 2.4 })}
  ${rect(436, 76, 160, 108, { fill: P.cream, lw: 2.4 })}
  ${rect(632, 132, 90, 52, { fill: P.cream, lw: 2.4 })}
  <g stroke="${P.sand}" stroke-width="1.4" fill="${P.terra}">
    <circle cx="76" cy="112" r="4.4"/><circle cx="108" cy="112" r="4.4"/><circle cx="140" cy="112" r="4.4"/><circle cx="172" cy="112" r="4.4"/>
    <circle cx="76" cy="140" r="4.4"/><circle cx="108" cy="140" r="4.4"/><circle cx="172" cy="140" r="4.4"/>
    <circle cx="256" cy="142" r="4.4"/><circle cx="288" cy="142" r="4.4"/><circle cx="320" cy="142" r="4.4"/><circle cx="352" cy="142" r="4.4"/><circle cx="384" cy="142" r="4.4"/>
    <circle cx="462" cy="96" r="4.4"/><circle cx="494" cy="96" r="4.4"/><circle cx="526" cy="96" r="4.4"/><circle cx="558" cy="96" r="4.4"/>
    <circle cx="462" cy="124" r="4.4"/><circle cx="526" cy="124" r="4.4"/><circle cx="558" cy="124" r="4.4"/>
  </g>
  ${pot(250, 232, { w: 96, h: 52, c: P.terra })}
  ${plant(250, 188, { h: 120, c: P.terra })}
  ${pot(470, 220, { w: 56, h: 30, c: P.muted })}
  ${plant(470, 192, { h: 66, c: P.muted })}
  ${pot(660, 228, { w: 60, h: 34, c: P.ink })}
  ${plant(660, 196, { h: 86, c: P.ink })}
  ${circle(128, 182, 3, { c: P.soft, w: 2, fill: P.soft })}
  ${circle(184, 170, 3, { c: P.soft, w: 2, fill: P.soft })}
`,
    { w: 720, h: 250 }
  );
}

// Ollama cover: a big terminal workspace with chat, code, model boxes, and a no-cloud.
function ollamaCoverArt() {
  return svg(
    `
  ${termWin(40, 72, 640, 126)}
  ${rect(40, 94, 58, 104, { fill: P.cream })}
  ${tlines(50, 112, 6, { w: 32, gap: 12, c: P.soft })}
  ${bubble(176, 128, 146, 62)}
  ${promptMark(124, 138)}
  ${tlines(150, 126, 3, { w: 74, gap: 10, c: P.soft })}
  ${bubble(330, 176, 128, 52, { fill: P.cream })}
  ${promptMark(284, 182, 5, { c: P.ink })}
  ${rect(120, 104, 34, 20, { rad: 5, lw: 2.2 })}
  ${rect(160, 100, 38, 24, { rad: 5, c: P.terra, lw: 2.4 })}
  ${rect(204, 96, 42, 28, { rad: 5, lw: 2.2 })}
  ${tlines(398, 108, 7, { w: 88, gap: 10, c: P.soft })}
  ${spark(600, 52, 14)}
  ${noCloud(648, 50, 16)}
  ${circle(90, 66, 3.4, { c: P.soft, w: 1.8, fill: P.soft })}
  ${circle(250, 96, 26, { c: P.soft, w: 2.4 })}
  ${circle(250, 118, 22, { c: P.soft, w: 2 })}
  ${circle(250, 88, 15, { c: P.soft, w: 1.8 })}
  ${path("M296 166 h164", { c: P.sand, w: 2 })}
  ${circle(380, 212, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(420, 212, 3.2, { c: P.muted, w: 1.8 })}
  ${circle(460, 212, 3.2, { c: P.muted, w: 1.8 })}
`,
    { w: 720, h: 250 }
  );
}

function coverArt(theme = "garden") {
  const set = THEMES[theme];
  if (set && set.cover) return set.cover();
  return gardenCoverArt();
}

module.exports = { chapterIllustration, coverArt, THEMES, PALETTE: P };
