/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Pure helpers over a volume's lineage (`content.lineage`).
 *
 * The explorer on the volume page (src/components/volume/LineageExplorer.tsx)
 * and the server-rendered article (api/index.ts) both read the tree through
 * this file, so the Copy / CSV export and the no-JavaScript reading of a volume
 * are the same table out of the same data. No DOM, no React: safe to import
 * from the serverless function.
 */

import type { LineageNode, VolumeLineage } from '../types';

/** "c. 2242 BC" — the dossier's own idiom for an approximate year. */
export const yearLabel = (year: number | null | undefined): string | null => {
  if (year === null || year === undefined) return null;
  const abs = Math.abs(year);
  return `c. ${abs >= 10000 ? abs.toLocaleString('en-US') : abs} ${year < 0 ? 'BC' : 'AD'}`;
};

/** Each tradition's line of descent, oldest first. The root's line is empty. */
export function lineageAncestors(nodes: LineageNode[]): Map<string, LineageNode[]> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const ancestors = new Map<string, LineageNode[]>();
  for (const n of nodes) {
    const chain: LineageNode[] = [];
    let cursor = n.parent ? byId.get(n.parent) : undefined;
    /* The cap only guards against a cycle in hand-edited data. */
    while (cursor && chain.length < 32) {
      chain.unshift(cursor);
      cursor = cursor.parent ? byId.get(cursor.parent) : undefined;
    }
    ancestors.set(n.id, chain);
  }
  return ancestors;
}

export const LINEAGE_TABLE_HEADERS = [
  'Tradition', 'Roots', 'Biblical date', 'Scholarly date', 'Dating note', 'Founder or source',
  'Claim type', 'Spiritual claim', 'Books', 'Symbols and relics', 'Occult view', 'Check',
] as const;

/** The whole tree as one flat reference table, in the order the data lists it. */
export function lineageTable(lineage: Pick<VolumeLineage, 'nodes'>): { headers: string[]; rows: string[][] } {
  const ancestors = lineageAncestors(lineage.nodes);
  const rows = lineage.nodes.map((n) => [
    n.name,
    (ancestors.get(n.id) || []).map((a) => a.name).join(' › '),
    yearLabel(n.biblicalYear) || '',
    yearLabel(n.scholarlyYear) || '',
    n.dateNote || '',
    n.founder,
    n.claimType,
    n.claim || '',
    n.books,
    n.symbols,
    n.occultView || '',
    n.check || '',
  ]);
  return { headers: [...LINEAGE_TABLE_HEADERS], rows };
}
