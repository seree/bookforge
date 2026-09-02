// BookForge — "Anthropic-inspired" design system.
// A faithful-but-original take on the warm, editorial look of anthropic.com:
// cream paper background, near-black warm ink, terracotta accent, serif display
// headlines, clean sans body, hairline rules, pill badges, and soft callouts.
// v2 — book-length support: a real cover panel with line-art, and procedural
// SVG spot illustrations for every chapter.
"use strict";

const { esc } = require("./render");
const { chapterIllustration, coverArt } = require("./illustrations");

// ---------------------------------------------------------------- tokens / css

const CSS = `
:root{
  --bg:#FAF9F5;          /* warm cream paper */
  --paper:#FFFFFF;
  --ink:#191917;         /* near-black warm ink */
  --soft-ink:#403F3C;
  --muted:#6E6C62;
  --faint:#A5A193;
  --accent:#D97757;      /* terracotta */
  --accent-strong:#B9593D;
  --accent-soft:#FBF1EC;
  --accent-line:#EAD9C8;
  --rule:#E6E1D5;        /* hairline */
  --card:#F5F2E9;
  --code-bg:#F1EEE4;
  --radius:10px;
  --serif:Georgia,"Iowan Old Style","Palatino Linotype",Palatino,"Times New Roman",serif;
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --mono:"SFMono-Regular",Menlo,Consolas,"Liberation Mono",monospace;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;color:var(--ink);background:var(--bg);font-family:var(--sans);line-height:1.65;font-size:16.5px;-webkit-font-smoothing:antialiased}
.wrap{max-width:52em;margin:0 auto;padding:2rem 1.4rem 5rem}
h1,h2,h3,h4{font-family:var(--serif);line-height:1.18;font-weight:600;letter-spacing:.005em}
a{color:var(--accent-strong);text-decoration:none}
a:hover{text-decoration:underline}
::selection{background:var(--accent);color:#fff}

/* -------- top bar -------- */
.topbar{display:flex;justify-content:space-between;align-items:center;gap:1rem;border-bottom:1px solid var(--rule);padding:.8rem 0;margin-bottom:2.5rem}
.topbar .brand{display:flex;align-items:center;gap:.55rem;font-weight:600;font-size:.9rem;letter-spacing:.02em}
.topbar .brand-mark{width:9px;height:9px;border-radius:50%;background:var(--accent);display:inline-block}
.topbar .brand small{color:var(--muted);font-weight:400}
.topbar .chip{font-size:.72rem;color:var(--muted);border:1px solid var(--rule);border-radius:999px;padding:.2em .7em;background:var(--paper)}

/* -------- cover (a real book cover) -------- */
.cover{position:relative;text-align:center;padding:2.8rem 2.2rem 2.4rem;border:1px solid var(--rule);border-radius:14px;background:var(--paper);margin-bottom:3rem;box-shadow:0 1px 0 rgba(25,25,23,.03)}
.cover::before{content:"";position:absolute;inset:9px;border:1px solid var(--rule);border-radius:9px;pointer-events:none}
.cover-art{margin:0 auto 2rem;max-width:560px}
.cover-art svg{display:block;width:100%;height:auto}
.cover .kicker{display:inline-flex;align-items:center;gap:.45rem;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:1.4rem}
.cover .kicker::before,.cover .kicker::after{content:"";width:1.7rem;height:1px;background:var(--rule);display:inline-block}
.cover h1{font-size:clamp(2.2rem,6vw,3.4rem);margin:0 0 .6rem;color:var(--ink)}
.cover .subtitle{font-size:1.12rem;color:var(--muted);font-style:italic;max-width:32em;margin:0 auto 1.2rem;line-height:1.5}
.cover .meta{font-size:.82rem;color:var(--faint);letter-spacing:.03em}
.cover .badges{margin-top:1.6rem}
.cover .badge{display:inline-block;margin:.2rem .25rem;padding:.34em .85em;border:1px solid var(--rule);border-radius:999px;font-size:.75rem;color:var(--muted);background:var(--paper)}
.cover .badge--accent{background:var(--accent);border-color:var(--accent);color:#fff}

/* -------- toc -------- */
.toc{margin:0 0 4rem}
.toc h2{font-size:1.5rem;margin:0 0 .3rem}
.toc .toc-sub{color:var(--muted);font-size:.88rem;margin:0 0 1.4rem}
.toc-list{list-style:none;margin:0;padding:0;border-top:1px solid var(--rule)}
.toc-list li{border-bottom:1px solid var(--rule)}
.toc-list a{display:flex;gap:1.1rem;align-items:baseline;padding:.95rem .2rem;color:var(--ink)}
.toc-list a:hover{background:var(--card);text-decoration:none}
.toc-num{font-family:var(--serif);color:var(--accent);font-weight:600;min-width:2.2em;font-size:.92rem}
.toc-txt strong{font-weight:600;font-family:var(--serif);font-size:1.08rem}
.toc-txt span{display:block;font-size:.84rem;color:var(--muted);margin-top:.15rem}

/* -------- chapters -------- */
.chapter{margin:0 0 4.5rem;scroll-margin-top:2rem}
.chapter-head{border-top:2.5px solid var(--accent);padding-top:1.2rem;margin-bottom:1.4rem}
.chapter-head .chapter-kicker{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:600;margin:0 0 .45rem}
.chapter-head h2{font-size:clamp(1.7rem,4vw,2.2rem);margin:0 0 .4rem}
.chapter-head .chapter-lead{font-size:1.05rem;color:var(--soft-ink);margin:0}
.chapter .chapter-illo{margin:1.5rem 0 1.4rem;background:var(--paper);border:1px solid var(--rule);border-radius:var(--radius);padding:.55rem}
.chapter .chapter-illo svg{display:block;width:100%;height:auto;border-radius:6px}
.chapter .workflow-fig{margin:1.6rem 0 1.5rem;background:var(--paper);border:1px solid var(--rule);border-radius:var(--radius);padding:.55rem}
.chapter .workflow-fig svg{display:block;width:100%;height:auto;border-radius:6px}
.chapter .workflow-fig text{font-family:var(--sans)}
.chapter .workflow-fig text tspan{text-anchor:middle}
.chapter p{margin:0 0 1.05rem}
.chapter h3{margin:2.1rem 0 .55rem;font-size:1.18rem}
.chapter h4{font-size:1.02rem;margin:1.6rem 0 .4rem;color:var(--soft-ink)}
.chapter ul,.chapter ol{margin:0 0 1.2rem;padding-left:1.35em}
.chapter li{margin:.35rem 0}
.chapter strong{font-weight:600}
.chapter code{font-family:var(--mono);font-size:.86em;background:var(--code-bg);border:1px solid var(--rule);border-radius:5px;padding:.1em .35em}
.chapter pre{background:var(--code-bg);border:1px solid var(--rule);border-radius:var(--radius);padding:1rem 1.2rem;overflow-x:auto;margin:0 0 1.2rem}
.chapter pre code{background:none;border:none;padding:0;font-size:.85rem}
.chapter blockquote{margin:1.5rem 0;padding:.9rem 1.2rem;border-left:3px solid var(--accent-line);background:var(--card);border-radius:0 var(--radius) var(--radius) 0;color:var(--soft-ink)}
.chapter hr{border:none;border-top:1px solid var(--rule);margin:2.4rem 0}
.chapter a{text-decoration:underline;text-underline-offset:2px}
.chapter a:hover{color:var(--accent)}

/* callouts */
.callout{border-radius:var(--radius);padding:1.05rem 1.25rem 1.05rem;margin:1.6rem 0;border:1px solid}
.callout p{margin:0}
.callout .callout-label{font-weight:600;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;margin:0 0 .5rem}
.callout.try{background:var(--accent-soft);border-color:var(--accent-line)}
.callout.try .callout-label{color:var(--accent-strong)}
.callout.fact{background:#F5F4E8;border-color:#E3E0C4}
.callout.fact .callout-label{color:#8A7D2B}
.callout.rule{background:#F2F0EA;border-color:#DDD8CC}
.callout.rule .callout-label{color:#57544A}
.callout.note{background:var(--card);border-color:var(--rule)}
.callout.note .callout-label{color:var(--muted)}

/* chapters nav */
.chapter-nav{display:flex;justify-content:space-between;gap:1rem;border-top:1px dashed var(--rule);padding-top:1.1rem;font-size:.88rem}
.chapter-nav .nav-link{color:var(--accent-strong);font-weight:500}
.chapter-nav .nav-disabled{color:var(--faint)}

/* back matter */
.sources-title{font-size:1.5rem;margin:0 0 .5rem}
.sources-note{font-size:.85rem;color:var(--muted);margin:0 0 1.4rem}
.source-list{list-style:none;margin:0;padding:0;border-top:1px solid var(--rule)}
.source-list li{border-bottom:1px solid var(--rule);padding:.7rem .2rem;font-size:.9rem}
.source-list .src-num{color:var(--accent);font-weight:600;margin-right:.6em}
.source-list .src-title{font-weight:500}
.source-list .src-url{color:var(--muted);font-size:.82rem;word-break:break-all}

/* footer */
footer.site-foot{margin-top:5rem;text-align:center;color:var(--muted);font-size:.8rem;border-top:1px solid var(--rule);padding-top:1.4rem}

/* print */
@media print{
  body{background:#fff;font-size:11.5pt}
  .topbar{display:none}
  .cover{padding:1.5rem;box-shadow:none}
  .cover::before{inset:5px}
  .cover-art{max-width:420px}
  .chapter-nav{display:none}
  .chapter{page-break-before:always}
  .chapter-head{border-top:none}
  .chapter .chapter-illo{border:none;padding:0}
  .chapter .workflow-fig{border:none;padding:0}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:none;padding:0}
  .callout{border:1px solid #ccc}
}
@media (max-width:560px){
  .toc-list a{flex-direction:column;gap:.2rem}
}
`;

// ---------------------------------------------------------------- chrome

function coverHtml(manifest, opts = {}) {
  const kicker = opts.kicker || "a casual field guide";
  const badges = [
    `<span class="badge badge--accent">BookForge</span>`,
    `<span class="badge">${esc(manifest.tone)}</span>`,
    `<span class="badge">${manifest.target.chapters} chapters</span>`,
  ];
  return `<header class="cover" id="cover">
  <div class="cover-art">${coverArt(opts.theme || "garden")}</div>
  <div class="kicker">${esc(kicker)}</div>
  <h1>${esc(manifest.title)}</h1>
  ${manifest.subtitle ? `<p class="subtitle">${esc(manifest.subtitle)}</p>` : ""}
  <p class="meta">${esc(manifest.author)} &middot; ${esc(manifest.date)} &middot; ${esc(manifest.genre)}</p>
  <div class="badges">${badges.join("")}</div>
</header>`;
}

function tocHtml(manifest) {
  const items = manifest.outline
    .map(
      (c, i) => `<li><a href="#ch-${String(i + 1).padStart(2, "0")}">
  <span class="toc-num">${String(i + 1).padStart(2, "0")}</span>
  <span class="toc-txt"><strong>${esc(c.title)}</strong>${c.summary ? `<span>${esc(c.summary)}</span>` : ""}</span>
</a></li>`
    )
    .join("\n");
  return `<nav id="toc" class="toc" aria-label="Table of contents">
  <h2>Contents</h2>
  <p class="toc-sub">${esc(manifest.subtitle || manifest.title)} — click a chapter to jump in.</p>
  <ol class="toc-list">${items}</ol>
</nav>`;
}

function chapterHtml({ index, total, head, rest, illo, title }) {
  const prev = index > 0 ? `<a class="nav-link" href="#ch-${String(index).padStart(2, "0")}">&larr; Previous</a>` : `<span class="nav-disabled">&#8592; Previous</span>`;
  const next = index < total - 1 ? `<a class="nav-link" href="#ch-${String(index + 2).padStart(2, "0")}">Next &rarr;</a>` : `<span class="nav-disabled">Next &#8594;</span>`;
  const figure = illo ? `<figure class="chapter-illo">${illo}</figure>` : "";
  return `<article id="ch-${String(index + 1).padStart(2, "0")}" class="chapter">
${head}
${figure}
${rest}
<div class="chapter-nav">${prev}<a class="nav-link" href="#cover">Top</a>${next}</div>
</article>`;
}

function sourcesHtml(sources) {
  const note = `All facts and figures in this book are grounded in the sources below, gathered via TinyFish web research (Monid). BookForge's honesty rule: no statistics, quotes, or citations are invented.`;
  const items = sources
    .map(
      (s, i) => `<li><span class="src-num">${String(i + 1).padStart(2, "0")}</span><span class="src-title">${esc(s.title)}</span><br><a class="src-url" href="${esc(s.url)}">${esc(s.url)}</a></li>`
    )
    .join("\n");
  return `<section id="sources" class="sources">
  <h2 class="sources-title">Sources</h2>
  <p class="sources-note">${note}</p>
  <ol class="source-list">${items}</ol>
</section>`;
}

module.exports = { CSS, coverHtml, tocHtml, chapterHtml, sourcesHtml };
