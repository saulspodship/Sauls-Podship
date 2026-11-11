/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TheologyCategory } from '../types';
import { VOLUMES } from '../src/data/volumes/index';
// Explicit .js: this folder is an ES-module package scope (api/package.json), like ./data.js in index.ts.
import { lineageTable } from '../src/lib/lineage.js';

export const CATEGORIES: TheologyCategory[] = VOLUMES.map(v => ({
  ...v,
  isPlaceholder: false
}));

/* The article route lists a volume's lineage through the same helper the
   volume page exports it with, so both read one table out of one dataset. */
export { lineageTable };

export default CATEGORIES;
