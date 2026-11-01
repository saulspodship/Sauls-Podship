/**
 * Complete the curated sitemap from the indexable, self-canonical static pages
 * emitted by the production build. This prevents new prerendered routes from
 * silently becoming orphaned from XML sitemaps and excludes redirect targets.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const sitemapPath = path.join(dist, 'sitemap.xml');
const sitemapFiles = [sitemapPath, path.join(dist, 'sitemap-theological-archive.xml')];
const site = 'https://www.saulspodship.com';
const today = new Date().toISOString().slice(0, 10);
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const redirects = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8')).redirects || [];
const redirectedPaths = new Set(redirects.map((item) => item.source).filter((p) => p && !p.includes(':') && !p.includes('(')));
const normalizePath = (value) => value === '/' ? '/' : value.replace(/\/+$/, '');
const normalizeUrl = (value) => {
  const url = new URL(value);
  return `${url.origin}${normalizePath(url.pathname) || '/'}`;
};
const listed = new Set();
for (const file of sitemapFiles) {
  if (!fs.existsSync(file)) continue;
  const xml = fs.readFileSync(file, 'utf8');
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) listed.add(normalizeUrl(match[1]));
}
const toCanonical = (html) => html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] || '';
const toRobots = (html) => html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1] || '';
const additions = new Set();

function visit(directory, relative = '') {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'assets' || entry.name === 'images' || entry.name === 'icons') continue;
    const full = path.join(directory, entry.name);
    const rel = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) {
      visit(full, rel);
      continue;
    }
    if (entry.name !== 'index.html') continue;

    const html = fs.readFileSync(full, 'utf8');
    if (/\bnoindex\b/i.test(toRobots(html))) continue;
    const canonical = toCanonical(html);
    if (!canonical.startsWith(`${site}/`) && canonical !== site) continue;
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(canonical).pathname);
    } catch {
      continue;
    }
    if (normalizePath(pathname) !== normalizePath(`/${relative}`)) continue;
    if (redirectedPaths.has(pathname) || redirectedPaths.has(normalizePath(pathname))) continue;
    const loc = canonical;
    if (!listed.has(normalizeUrl(loc))) additions.add(loc);
  }
}

visit(dist);
if (additions.size) {
  const rows = [...additions].sort().map((loc) =>
    `  <url>\n    <loc>${loc.replace(/&/g, '&amp;')}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`,
  ).join('\n');
  const updated = sitemap.replace('</urlset>', `${rows}\n</urlset>`);
  if (updated === sitemap) throw new Error('Sitemap has no closing </urlset> tag');
  fs.writeFileSync(sitemapPath, updated, 'utf8');
}

const allUrls = new Set();
let total = 0;
for (const file of sitemapFiles) {
  if (!fs.existsSync(file)) continue;
  const xml = fs.readFileSync(file, 'utf8');
  if (!/^\s*<\?xml/.test(xml) || !xml.includes('<urlset') || !xml.includes('</urlset>')) {
    throw new Error(`Sitemap is not a valid XML urlset document: ${path.basename(file)}`);
  }
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (/<loc>\s*<\/loc>|<url>\s*<\/url>/i.test(xml)) throw new Error(`Empty URL record found in ${path.basename(file)}`);
  for (const url of urls) {
    const normalized = normalizeUrl(url);
    if (allUrls.has(normalized)) throw new Error(`URL appears in multiple sitemaps: ${url}`);
    allUrls.add(normalized);
    total++;
    if (!url.startsWith(`${site}/`) && url !== site) throw new Error(`Non-canonical host in sitemap: ${url}`);
    const pathname = decodeURIComponent(new URL(url).pathname);
    if (redirectedPaths.has(pathname) || redirectedPaths.has(normalizePath(pathname))) {
      throw new Error(`Redirecting URL in sitemap: ${url}`);
    }
    const candidates = pathname === '/'
      ? [path.join(dist, 'index.html')]
      : [
          path.join(dist, pathname, 'index.html'),
          path.join(dist, `${pathname}.html`),
          path.join(dist, pathname),
        ];
    const htmlFile = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (!htmlFile) throw new Error(`Sitemap URL has no built static page: ${url}`);
    const html = fs.readFileSync(htmlFile, 'utf8');
    if (/\bnoindex\b/i.test(toRobots(html))) throw new Error(`Noindex page found in sitemap: ${url}`);
    const canonical = toCanonical(html);
    if (canonical && normalizeUrl(canonical) !== normalized) {
      throw new Error(`Non-canonical URL in sitemap: ${url} (canonical: ${canonical})`);
    }
  }
}
console.log(`[SITEMAP] ${total} canonical URLs across ${sitemapFiles.filter(fs.existsSync).length} sitemaps (${additions.size} added).`);
