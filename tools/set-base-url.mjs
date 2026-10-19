// Usage: node tools/set-base-url.mjs https://www.example.com/
// Rewrites the site base URL (canonical, og:url, JSON-LD, sitemap, robots) and the
// 404.html <base href> path in every file. Run the link checker afterwards.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
let next = process.argv[2];
if (!next || !/^https?:\/\//.test(next)) {
  console.error('Usage: node tools/set-base-url.mjs https://example.com/path/');
  process.exit(1);
}
if (!next.endsWith('/')) next += '/';
const current = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8').match(/<loc>([^<]+)<\/loc>/)[1];
const curPath = new URL(current).pathname;
const nextPath = new URL(next).pathname;
let changed = 0;
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!/\.(html|xml|txt)$/.test(name)) continue;
    if (/^google[0-9a-f]+\.html$/.test(name)) continue; // Search Console verification: never touch
    const src = readFileSync(p, 'utf8');
    let out = src.split(current).join(next);
    out = out.split(`<base href="${curPath}">`).join(`<base href="${nextPath}">`);
    if (out !== src) { writeFileSync(p, out); changed++; }
  }
})(ROOT);
console.log(`Base URL ${current} -> ${next} (${changed} files updated)`);
