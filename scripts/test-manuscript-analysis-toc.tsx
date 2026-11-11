/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { VOLUMES } from '../src/data/volumes';
import ManuscriptAnalysis, { normalizeAnalysis } from '../src/components/ManuscriptAnalysis';

let errors = 0;
let volumeCount = 0;
let tocCount = 0;
let chipCount = 0;

const report = (message: string) => {
  console.error(`[FAIL] ${message}`);
  errors += 1;
};

const normalizedSample = normalizeAnalysis(
  'Overview text.\n\n[[CHART: Grace (God\'s Effort)|100|#1D2D50]]\n\n## Closing note',
);
if (normalizedSample.includes('[[CHART:')) {
  report('normalizeAnalysis leaves a raw chart placeholder in its output.');
}

for (const volume of VOLUMES) {
  const analysis = volume.content?.analysis || '';
  const html = renderToStaticMarkup(
    <ManuscriptAnalysis content={analysis} volumeTitle={volume.title} />,
  );
  volumeCount += 1;

  if (JSON.stringify(volume).includes('[[CHART:')) {
    report(`Volume ${volume.number} (${volume.slug}) still contains a raw chart placeholder.`);
  }
  if (html.includes('[[CHART:')) {
    report(`Volume ${volume.number} (${volume.slug}) renders a raw chart placeholder.`);
  }

  const nav = html.match(/<nav aria-label="Table of Contents"[\s\S]*?<\/nav>/)?.[0] || '';
  const targets = [...nav.matchAll(/<button\b[^>]*\baria-controls="([^"]+)"/g)].map((match) => match[1]);
  const headingIds = [...html.matchAll(/<h[23]\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1]);

  if (nav) {
    tocCount += 1;
    if (/<a\b/.test(nav)) {
      report(`Volume ${volume.number} still uses route-changing anchor links in its TOC.`);
    }
    if (targets.length !== headingIds.length) {
      report(`Volume ${volume.number} has ${targets.length} TOC chips for ${headingIds.length} rendered h2/h3 headings.`);
    }
  } else if (headingIds.length > 1) {
    report(`Volume ${volume.number} has multiple rendered h2/h3 headings but no TOC.`);
  }

  const idCounts = new Map<string, number>();
  for (const id of headingIds) idCounts.set(id, (idCounts.get(id) || 0) + 1);
  for (const [id, count] of idCounts) {
    if (count > 1) report(`Volume ${volume.number} renders duplicate heading id "${id}".`);
  }

  for (const [index, target] of targets.entries()) {
    chipCount += 1;
    const matches = idCounts.get(target) || 0;
    if (matches !== 1) {
      report(`Volume ${volume.number} TOC target "${target}" matches ${matches} headings.`);
    }
    if (target !== headingIds[index]) {
      report(`Volume ${volume.number} TOC target "${target}" is not mapped to heading ${index + 1} ("${headingIds[index] || 'missing'}").`);
    }
  }
}

if (errors) {
  console.error(`[MANUSCRIPT TOC] Failed with ${errors} issue(s) across ${volumeCount} volumes.`);
  process.exit(1);
}

console.log(`[MANUSCRIPT TOC] Passed: ${volumeCount} volumes, ${tocCount} tables of contents, ${chipCount} chips all target one matching heading.`);
