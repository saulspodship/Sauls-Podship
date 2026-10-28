/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The site dictionary — one source of truth for every language the site ships.
 *
 * `scripts/build-i18n.mjs` compiles this into `public/i18n/{ur,hi,ar}.json`
 * (one file per language, fetched only when that language is active) and into
 * the standalone shim `public/assets/sp-i18n.js` used by the static module
 * documents. The React app, the retrofit scripts and the static pages therefore
 * all translate from the SAME table — the duplication that let the codex page
 * drift from the main site is gone.
 *
 * Adding coverage = adding a line here (or a pattern rule in patterns.ts).
 * Nothing else in the codebase needs to change.
 */

import type { Lang, PatternRule, Tr } from '../../lib/i18n/types';
import { DICT_CHROME } from './dict-chrome';
import { DICT_PAGES } from './dict-pages';
import { DICT_VOLUMES, DICT_VOLUME_CATEGORIES } from './dict-volumes';
import { DICT_MODULES } from './dict-modules';
import { DICT_TIME, DICT_WORDS, PATTERNS } from './patterns';

export type DictSource = Record<string, Tr>;

/** Later files win on a duplicate key, so page-specific copy can refine chrome copy. */
export const MASTER: DictSource = {
  ...DICT_TIME,
  ...DICT_WORDS,
  ...DICT_CHROME,
  ...DICT_MODULES,
  ...DICT_VOLUME_CATEGORIES,
  ...DICT_VOLUMES,
  ...DICT_PAGES,
};

export const MASTER_PATTERNS: PatternRule[] = PATTERNS;

export const TUPLE_INDEX: Record<Exclude<Lang, 'en'>, 0 | 1 | 2> = { ur: 0, hi: 1, ar: 2 };

export const DICT_LANGS: Exclude<Lang, 'en'>[] = ['ur', 'hi', 'ar'];

export const dictSize = (): number => Object.keys(MASTER).length;
export const patternSize = (): number => MASTER_PATTERNS.length;
