/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const volumesDataPath = path.resolve(rootDir, 'src/data/volumes/volumesData.json');
if (!fs.existsSync(volumesDataPath)) {
  console.error('[REGRESSION] volumesData.json not found');
  process.exit(1);
}

const volumes = JSON.parse(fs.readFileSync(volumesDataPath, 'utf8'));

console.log(`[CONTENT REGRESSION] Auditing ${volumes.length} volumes for baseline storyPanels and tables integrity...`);

let hasError = false;

// Legacy chart tokens were never rendered in the client analysis view. Keep
// them out of both the generator input and the mirrored volume output.
const rawCategoriesPath = path.resolve(rootDir, 'data/raw_categories.json');
if (fs.existsSync(rawCategoriesPath)) {
  const rawCategories = JSON.parse(fs.readFileSync(rawCategoriesPath, 'utf8'));
  for (const category of rawCategories) {
    if (JSON.stringify(category).includes('[[CHART:')) {
      console.error(`[FAIL] Raw chart placeholder remains in generator source for ${category.title || category.id}.`);
      hasError = true;
    }
  }
}

// Minimum acceptable baselines
for (const v of volumes) {
  const panels = v.content?.storyPanels || [];
  const tables = v.content?.tables || [];
  
  if (v.number === 22) {
    if (panels.length < 8) {
      console.error(`[FAIL] Volume 22 has ${panels.length} panels (required at least 8).`);
      hasError = true;
    }
    if (tables.length < 7) {
      console.error(`[FAIL] Volume 22 has ${tables.length} tables (required at least 7).`);
      hasError = true;
    }
  }

  // No raw chart syntax may leak into any volume field.
  if (JSON.stringify(v).includes('[[CHART:')) {
    console.error(`[FAIL] Volume ${v.number} (${v.title}) still contains a raw chart placeholder.`);
    hasError = true;
  }

  // All volumes must have content
  if (!v.content?.analysis || v.content.analysis.length < 100) {
    console.error(`[FAIL] Volume ${v.number} (${v.title}) has missing or truncated analysis.`);
    hasError = true;
  }
}

if (hasError) {
  console.error('[CONTENT REGRESSION] Verification failed.');
  process.exit(1);
} else {
  console.log(`[CONTENT REGRESSION] Passed! All volumes verified. Vol 22 verified with 8 panels and 7 tables.`);
}
