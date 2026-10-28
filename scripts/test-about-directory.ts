import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ABOUT_META, PODSHIP_APPS, aboutPageSchema } from '../src/data/about';
import { FAQ_DATA, FAQ_PAGE_ITEMS, FAQ_PAGE_META, faqSchema } from '../src/data/faq';

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const readJsonLd = (html: string, id: string) => {
  const match = html.match(new RegExp(`<script id="${id}" type="application/ld\\+json">([\\s\\S]*?)</script>`));
  assert.ok(match, `Missing JSON-LD: ${id}`);
  return JSON.parse(match[1]);
};

const expectedHosts = [
  'biblicallanguages.saulspodship.com',
  'saulssundayschool.saulspodship.com',
  'evangelism.saulspodship.com',
  'biblicalcosmos3d.saulspodship.com',
].sort();
assert.deepEqual(PODSHIP_APPS.map((app) => new URL(app.url).hostname).sort(), expectedHosts);
assert.equal(new Set(PODSHIP_APPS.map((app) => app.id)).size, PODSHIP_APPS.length);
for (const app of PODSHIP_APPS) {
  assert.equal(new URL(app.url).protocol, 'https:');
  if (app.logo.startsWith('/')) {
    assert.ok(fs.existsSync(path.join(root, 'public', app.logo.slice(1))), `Missing logo for ${app.name}`);
  } else {
    assert.equal(new URL(app.logo).hostname, new URL(app.url).hostname, `Logo must come from ${app.name}'s own site`);
  }
}

const aboutFaq = FAQ_DATA['/about'].items;
const directoryAnswer = aboutFaq.find((item) => item.question === "Which websites are part of Saul's Podship?");
assert.ok(directoryAnswer);
for (const app of PODSHIP_APPS) {
  assert.ok(directoryAnswer.answer.includes(app.name));
  assert.ok(directoryAnswer.answer.includes(new URL(app.url).hostname));
}
for (const item of aboutFaq) {
  assert.ok(FAQ_PAGE_ITEMS.some((entry) => entry.question === item.question && entry.answer === item.answer));
}

const aboutHtml = read('dist/about/index.html');
const faqHtml = read('dist/faq/index.html');
assert.equal(read('dist/about.html'), aboutHtml);
assert.equal(read('dist/faq.html'), faqHtml);
const vercel = JSON.parse(read('vercel.json'));
for (const route of ['about', 'faq']) {
  for (const source of [`/${route}`, `/${route}/`]) {
    const index = vercel.rewrites.findIndex((rewrite: { source: string }) => rewrite.source === source);
    const fallback = vercel.rewrites.findIndex((rewrite: { destination: string }) => rewrite.destination === '/index.html');
    assert.ok(index >= 0 && index < fallback, `Missing clean URL rewrite for ${source}`);
    assert.equal(vercel.rewrites[index].destination, `/${route}.html`);
  }
}
assert.ok(aboutHtml.includes(`<title>${esc(ABOUT_META.title)}</title>`));
assert.ok(aboutHtml.includes(`<link rel="canonical" href="${ABOUT_META.canonical}"`));
assert.ok(aboutHtml.includes(`content="${esc(ABOUT_META.description)}"`));
assert.ok(aboutHtml.includes(`property="og:url" content="${ABOUT_META.canonical}"`));
assert.ok(aboutHtml.includes('Explore the Podship family'));
for (const app of PODSHIP_APPS) {
  assert.ok(aboutHtml.includes(`href="${esc(app.url)}"`), `No crawlable link to ${app.name}`);
  assert.ok(aboutHtml.includes(`src="${esc(app.logo)}"`), `No original logo for ${app.name}`);
  assert.ok(aboutHtml.includes(esc(app.description)), `Missing description for ${app.name}`);
}
assert.deepEqual(readJsonLd(aboutHtml, 'sp-about-apps-jsonld'), aboutPageSchema());
assert.deepEqual(readJsonLd(aboutHtml, 'sp-route-faq-jsonld'), faqSchema(aboutFaq));
for (const item of aboutFaq) {
  assert.ok(aboutHtml.includes(esc(item.question)) && aboutHtml.includes(esc(item.answer)));
}

assert.ok(faqHtml.includes(`<title>${esc(FAQ_PAGE_META.title)}</title>`));
assert.ok(faqHtml.includes(`<link rel="canonical" href="${FAQ_PAGE_META.canonical}"`));
assert.deepEqual(readJsonLd(faqHtml, 'sp-faq-page-jsonld'), faqSchema(FAQ_PAGE_ITEMS));
for (const item of FAQ_PAGE_ITEMS) {
  assert.ok(faqHtml.includes(esc(item.question)) && faqHtml.includes(esc(item.answer)));
}

const llms = read('dist/llms.txt');
assert.ok(llms.includes(ABOUT_META.canonical));
for (const app of PODSHIP_APPS) assert.ok(llms.includes(`[${app.name}](${app.url})`));
assert.equal(llms, read('dist/llms-full.txt'));
const sitemap = read('dist/sitemap.xml');
assert.ok(sitemap.includes(`<loc>${ABOUT_META.canonical}</loc>`));
assert.ok(sitemap.includes(`<loc>${FAQ_PAGE_META.canonical}</loc>`));

console.log(`[PASS] ${PODSHIP_APPS.length} app links, original logos, About/FAQ structured data, metadata, sitemap and llms.txt agree.`);
