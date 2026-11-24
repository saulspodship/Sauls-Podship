/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Behavioural test for the hash-route boot script in index.html.
 *
 * The app is a createHashRouter SPA served at clean, prerendered URLs. Google's
 * "Page with redirect" report (78 URLs, 16 Nov 2026) came from that boot script
 * calling location.replace('/#' + path): a real navigation, so every sitemap URL
 * looked like a redirect and none of the prerendered pages could be indexed.
 *
 * The fix seeds the same route with history.replaceState instead. This test runs
 * the *built* script inside a fake window and asserts the properties that matter:
 *
 *   1. no navigation happens (location.replace is never called),
 *   2. the clean path survives (so the address still matches the canonical),
 *   3. the fragment carries the route the hash router will read,
 *   4. /, /index.html and already-hashed URLs are left alone.
 *
 * Usage: node scripts/test-boot-route.mjs   (runs in `npm test`)
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://www.saulspodship.com';
const indexHtml = path.join(root, 'dist', 'index.html');

if (!fs.existsSync(indexHtml)) {
  console.error('[BOOT-ROUTE] dist/index.html missing — run `npm run build` first');
  process.exit(1);
}

const html = fs.readFileSync(indexHtml, 'utf8');
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .find((body) => body.includes('replaceState') && body.includes('location.pathname'));

if (!script) {
  console.error('[BOOT-ROUTE] could not find the hash-route boot script in dist/index.html');
  process.exit(1);
}
if (/location\s*\.\s*replace\s*\(\s*['"]\/#/.test(script)) {
  console.error('[BOOT-ROUTE] boot script still navigates to the /#/ form (GSC "Page with redirect")');
  process.exit(1);
}

/** Run the shipped script against a fake window and report what it did. */
function boot(pathname, search = '', hash = '') {
  const start = `${ORIGIN}${pathname}${search}${hash}`;
  const location = { pathname, search, hash, href: start };
  let navigatedTo = null;
  location.replace = (url) => {
    navigatedTo = new URL(url, start).href;
  };
  const history = {
    replaceState(_state, _title, url) {
      const next = new URL(url, `${ORIGIN}${location.pathname}${location.search}${location.hash}`);
      location.pathname = next.pathname;
      location.search = next.search;
      location.hash = next.hash;
      location.href = next.href;
    },
  };
  vm.runInNewContext(script, { location, history, URL, Error });
  return { ...location, navigatedTo };
}

const failures = [];
const check = (label, actual, expected) => {
  if (actual !== expected) failures.push(`${label}: expected ${expected}, got ${actual}`);
};

/* A clean sitemap URL keeps its path, gains a fragment route, never navigates. */
for (const route of [
  '/terms',
  '/encyclopedia',
  '/encyclopedia/not-biblical-quotes-sayings',
  '/podcast/bible-aur-ghulami-ki-asal-haqeeqat',
  '/music/punjabi-zaboor',
  '/comparative-apologetics',
]) {
  const result = boot(route);
  check(`${route} navigation`, result.navigatedTo, null);
  check(`${route} pathname`, result.pathname, route);
  check(`${route} hash`, result.hash, `#${route}`);
  check(`${route} href`, result.href, `${ORIGIN}${route}#${route}`);
}

/* Queries survive inside the fragment, where the router reads them. */
const withQuery = boot('/theological-archive/question/does-god-exist', '?q=trinity');
check('query navigation', withQuery.navigatedTo, null);
check('query pathname', withQuery.pathname, '/theological-archive/question/does-god-exist');
check('query hash', withQuery.hash, '#/theological-archive/question/does-god-exist?q=trinity');

/* Trailing slashes normalise to the canonical route. */
const trailing = boot('/terms/');
check('trailing slash hash', trailing.hash, '#/terms');

/* Home, /index.html and existing deep links must be left exactly as they are. */
for (const [pathname, hash] of [['/', ''], ['/index.html', ''], ['/', '#/encyclopedia']]) {
  const result = boot(pathname, '', hash);
  check(`${pathname}${hash} navigation`, result.navigatedTo, null);
  check(`${pathname}${hash} pathname`, result.pathname, pathname);
  check(`${pathname}${hash} hash`, result.hash, hash);
}

if (failures.length) {
  console.error(`[BOOT-ROUTE] ${failures.length} problem(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log('[BOOT-ROUTE] clean URLs seed the hash route without navigating (no GSC redirect).');
