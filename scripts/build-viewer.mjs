#!/usr/bin/env node
/**
 * Regenerates library/viewer/index.html from library/entries/*.md
 *
 * Deterministic, zero dependencies, no network. Entry data is INLINED into the
 * HTML so the viewer opens with file:// — no server, no build step, no rot.
 *
 * Usage:  node scripts/build-viewer.mjs
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRIES = join(ROOT, 'library', 'entries');
const VIEWER = join(ROOT, 'library', 'viewer');

/* ---------- minimal YAML frontmatter parser -------------------------------
   Handles exactly what templates/entry.template.md uses: scalars, inline
   arrays [a, b], block sequences of scalars, and one level of nesting.
   Deliberately small — a YAML dependency for this would be absurd.          */

function stripComment(s) {
  // remove trailing "# comment" unless inside quotes
  let out = '', q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { out += c; if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; out += c; continue; }
    if (c === '#' && (i === 0 || /\s/.test(s[i - 1]))) break;
    out += c;
  }
  return out.trim();
}

const unquote = (v) =>
  (v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))
    ? v.slice(1, -1)
    : v;

function parseScalar(v) {
  v = unquote(stripComment(v));
  if (v.startsWith('[') && v.endsWith(']')) {
    return v.slice(1, -1).split(',').map((x) => unquote(x.trim())).filter(Boolean);
  }
  return v;
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { data: {}, body: text };
  const body = text.slice(m[0].length).trim();
  const lines = m[1].split(/\r?\n/);
  const data = {};
  let key = null, nestKey = null;

  for (const raw of lines) {
    if (!raw.trim() || /^\s*#/.test(raw)) continue;
    const indent = raw.match(/^\s*/)[0].length;
    const line = raw.trim();

    if (line.startsWith('- ')) {                       // block sequence item
      const val = parseScalar(line.slice(2));
      const target = nestKey ? data[key][nestKey] : data[key];
      if (Array.isArray(target)) target.push(val);
      continue;
    }
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    const [, k, rest] = kv;

    if (indent > 0 && key && typeof data[key] === 'object' && !Array.isArray(data[key])) {
      nestKey = k;
      data[key][k] = rest === '' ? [] : parseScalar(rest);
    } else {
      key = k; nestKey = null;
      data[k] = rest === '' ? [] : parseScalar(rest);
      if (rest === '') data[k] = [];             // may become object below
    }
  }
  // a key whose children were nested keys, not "- " items, becomes an object
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v) && v.length === 0) data[k] = [];
  }
  return { data, body };
}

/* ---------- collect ------------------------------------------------------ */

if (!existsSync(ENTRIES)) {
  console.error(`No entries directory at ${ENTRIES}`);
  process.exit(1);
}

const entries = readdirSync(ENTRIES)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const { data, body } = parseFrontmatter(readFileSync(join(ENTRIES, f), 'utf8'));
    const slug = data.slug || basename(f, '.md');
    const shot = data.shot || `${slug}.png`;
    const summary =
      (body.split(/\r?\n/).find((l) => l.trim() && !l.startsWith('#')) || '').trim();
    return {
      slug,
      shot: existsSync(join(ENTRIES, shot)) ? shot : null,
      source: data.source || '',
      captured: data.captured || '',
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
      palette: Array.isArray(data.palette) ? data.palette : [],
      density: data.density || '',
      summary,
    };
  })
  .sort((a, b) => String(b.captured).localeCompare(String(a.captured)) || a.slug.localeCompare(b.slug));

const allTags = [...new Set(entries.flatMap((e) => e.tags))].sort();

/* ---------- render ------------------------------------------------------- */

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Design library — ${entries.length} entries</title>
<style>
  :root{
    --bg:#12100E; --surface:#1B1815; --line:#2E2926;
    --ink:#F2EDE6; --muted:#9A918A; --accent:#E8734A;
    --r:10px;
  }
  *{box-sizing:border-box}
  body{
    margin:0; background:var(--bg); color:var(--ink);
    font:15px/1.6 ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif;
    -webkit-font-smoothing:antialiased;
  }
  header{
    padding:56px 40px 28px; border-bottom:1px solid var(--line);
    display:flex; align-items:baseline; gap:16px; flex-wrap:wrap;
  }
  h1{font-size:30px; line-height:1.1; margin:0; letter-spacing:-.02em; font-weight:600}
  .count{color:var(--muted); font-size:14px}
  .filters{padding:20px 40px; display:flex; gap:8px; flex-wrap:wrap;
           border-bottom:1px solid var(--line); position:sticky; top:0;
           background:var(--bg); z-index:5}
  .chip{
    border:1px solid var(--line); background:transparent; color:var(--muted);
    padding:5px 13px; border-radius:999px; font-size:13px; cursor:pointer;
    font-family:inherit; transition:color .15s,border-color .15s;
  }
  .chip:hover{color:var(--ink); border-color:var(--muted)}
  .chip[aria-pressed="true"]{background:var(--accent); border-color:var(--accent); color:#12100E}
  main{padding:32px 40px 80px; display:grid; gap:28px;
       grid-template-columns:repeat(auto-fill,minmax(330px,1fr))}
  .card{border:1px solid var(--line); border-radius:var(--r); overflow:hidden;
        background:var(--surface); cursor:pointer; transition:border-color .15s}
  .card:hover{border-color:var(--muted)}
  .card figure{margin:0; aspect-ratio:16/10; overflow:hidden; background:#0C0A09;
               border-bottom:1px solid var(--line)}
  .card img{width:100%; height:100%; object-fit:cover; object-position:top; display:block}
  .noshot{display:grid; place-items:center; height:100%; color:var(--muted); font-size:13px}
  .body{padding:16px 18px 18px}
  .slug{font-family:ui-monospace,"SF Mono",Menlo,monospace; font-size:13.5px;
        color:var(--accent); word-break:break-all}
  .summary{color:var(--muted); font-size:13.5px; margin:7px 0 0}
  .meta{display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-top:13px}
  .tag{font-size:11.5px; color:var(--muted); border:1px solid var(--line);
       padding:2px 8px; border-radius:999px}
  .sw{width:15px; height:15px; border-radius:4px; border:1px solid rgba(255,255,255,.14)}
  .swatches{display:flex; gap:5px; margin-top:11px}
  .empty{padding:80px 40px; color:var(--muted); max-width:560px}
  .empty code{color:var(--ink); background:var(--surface); padding:2px 6px; border-radius:4px}
  #toast{position:fixed; bottom:26px; left:50%; transform:translateX(-50%) translateY(80px);
         background:var(--accent); color:#12100E; padding:10px 20px; border-radius:999px;
         font-size:13.5px; font-weight:500; transition:transform .22s; pointer-events:none}
  #toast.on{transform:translateX(-50%) translateY(0)}
</style>
</head>
<body>
<header>
  <h1>Design library</h1>
  <span class="count">${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}</span>
</header>

${entries.length === 0 ? `<div class="empty">
  <p>Nothing here yet.</p>
  <p>Drop screenshots into <code>library/inbox/</code>, then run <code>/design ingest</code>.</p>
</div>` : `<div class="filters" id="filters">
  <button class="chip" aria-pressed="true" data-tag="*">all</button>
  ${allTags.map((t) => `<button class="chip" aria-pressed="false" data-tag="${t}">${t}</button>`).join('\n  ')}
</div>
<main id="grid"></main>`}

<div id="toast">slug copied</div>

<script>
const ENTRIES = ${JSON.stringify(entries, null, 2)};

const grid = document.getElementById('grid');
const toast = document.getElementById('toast');
let active = '*';

function card(e) {
  const shot = e.shot
    ? '<img src="../entries/' + e.shot + '" alt="' + e.slug + '" loading="lazy">'
    : '<div class="noshot">no screenshot</div>';
  const sw = e.palette.length
    ? '<div class="swatches">' + e.palette.map(c =>
        '<span class="sw" style="background:' + c + '" title="' + c + '"></span>').join('') + '</div>'
    : '';
  const tags = e.tags.map(t => '<span class="tag">' + t + '</span>').join('');
  return '<article class="card" data-slug="' + e.slug + '" data-tags="' + e.tags.join(' ') + '" ' +
         'title="Click to copy slug">' +
    '<figure>' + shot + '</figure>' +
    '<div class="body">' +
      '<div class="slug">' + e.slug + '</div>' +
      (e.summary ? '<p class="summary">' + e.summary + '</p>' : '') +
      sw +
      '<div class="meta">' + tags + (e.density ? '<span class="tag">' + e.density + '</span>' : '') + '</div>' +
    '</div></article>';
}

function render() {
  if (!grid) return;
  const list = active === '*' ? ENTRIES : ENTRIES.filter(e => e.tags.includes(active));
  grid.innerHTML = list.map(card).join('');
}

document.getElementById('filters')?.addEventListener('click', ev => {
  const btn = ev.target.closest('.chip');
  if (!btn) return;
  active = btn.dataset.tag;
  document.querySelectorAll('.chip').forEach(c =>
    c.setAttribute('aria-pressed', String(c === btn)));
  render();
});

grid?.addEventListener('click', ev => {
  const c = ev.target.closest('.card');
  if (!c) return;
  const slug = c.dataset.slug;
  navigator.clipboard?.writeText(slug);
  toast.textContent = slug + ' copied';
  toast.classList.add('on');
  setTimeout(() => toast.classList.remove('on'), 1400);
});

render();
</script>
</body>
</html>
`;

mkdirSync(VIEWER, { recursive: true });
writeFileSync(join(VIEWER, 'index.html'), html, 'utf8');
console.log(
  `Viewer rebuilt: ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}, ` +
  `${allTags.length} tag${allTags.length === 1 ? '' : 's'}\n` +
  `  → ${join(VIEWER, 'index.html')}`
);
