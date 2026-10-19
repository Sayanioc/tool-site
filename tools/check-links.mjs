// Quick local link checker: every relative href/src in every .html file must resolve to a
// file in the repo; every sitemap <loc> must map to a page; every page's canonical must
// match its location; each page must have exactly one <h1>. Zero dependencies.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
const BASE = (sitemap.match(/<loc>([^<]+)<\/loc>/) || [])[1];
const errors = [];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

function resolveTarget(fromFile, url, baseHref) {
  let clean = url.split('#')[0].split('?')[0];
  if (clean === '') return null; // pure fragment
  let base = dirname(fromFile);
  if (baseHref) {
    // <base href="/tool_site/"> -> repo root
    base = ROOT;
  }
  let target = clean.startsWith('/') ? join(ROOT, clean) : join(base, clean);
  if (clean.endsWith('/') || (existsSync(target) && statSync(target).isDirectory())) target = join(target, 'index.html');
  return target;
}

const pages = walk(ROOT);
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(ROOT, file);
  const baseHref = (html.match(/<base href="([^"]+)"/) || [])[1];
  for (const m of html.replace(/<base [^>]*>/, '').matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(url) || url.startsWith('#')) continue;
    const t = resolveTarget(file, url, baseHref);
    if (t && !existsSync(t)) errors.push(`${rel}: broken link "${url}"`);
  }
  // module imports inside inline scripts
  for (const m of html.matchAll(/import\s[^'"]*['"](\.{1,2}\/[^'"]+)['"]/g)) {
    const t = join(dirname(file), m[1]);
    if (!existsSync(t)) errors.push(`${rel}: broken import "${m[1]}"`);
  }
  if (rel === '404.html') continue;
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${rel}: expected exactly one <h1>, found ${h1}`);
  const canon = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  const expected = BASE + rel.replace(/index\.html$/, '');
  if (canon !== expected) errors.push(`${rel}: canonical "${canon}" != "${expected}"`);
  if (!sitemap.includes(`<loc>${expected}</loc>`)) errors.push(`${rel}: missing from sitemap.xml`);
  if (!/<title>[^<]{10,}<\/title>/.test(html)) errors.push(`${rel}: missing/short <title>`);
  if (!/<meta name="description" content="[^"]{50,}"/.test(html)) errors.push(`${rel}: missing/short meta description`);
}
for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const path = m[1].slice(BASE.length);
  if (!existsSync(join(ROOT, path, path.endsWith('.html') ? '' : 'index.html'))) errors.push(`sitemap: no page for ${m[1]}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(`OK: ${pages.length} pages checked, no broken links.`);
