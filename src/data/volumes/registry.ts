/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Per-volume lazy loader.
 *
 * Why this exists: `index.ts` statically imported all 51 volume modules, which
 * bundled ~1.5 MB of article HTML into ONE 628 kB chunk (221 kB gzipped) that
 * every volume page had to download before it could render a single paragraph —
 * even though a visitor reads one volume at a time. That was the single biggest
 * cause of the "volumes feel slow / laggy" complaint.
 *
 * `import.meta.glob` (Vite) turns each `volume_NN.ts` into its own tiny chunk
 * (~4–60 kB). A volume page now downloads the lightweight catalogue index
 * (82 kB, shared and cached) plus only the dossier it is actually reading,
 * and the list pages (home, encyclopedia, sitemap) still ship just the index.
 *
 * Nothing is lost: the volume bodies are identical files, and returning
 * visitors get the article chunk from the immutable `/assets/*` cache.
 */

import type { Volume } from '../../../types';

type VolumeModule = Record<string, unknown>;

/** Every `volume_NN.ts` as a dynamic import (one chunk each). */
const modules = import.meta.glob('./volume_*.ts') as Record<string, () => Promise<VolumeModule>>;

const loaded = new Map<number, Volume>();
const inflight = new Map<number, Promise<Volume | undefined>>();

const pad = (n: number) => String(n).padStart(2, '0');
const fileFor = (n: number) => `./volume_${pad(n)}.ts`;
const exportFor = (n: number) => `volume_${pad(n)}`;

/** A volume that is already in memory (first paint after a warm navigation). */
export function peekVolume(num: number): Volume | undefined {
  return loaded.get(num);
}

/** Load one volume dossier. Repeat calls (and concurrent calls) reuse the cache. */
export function loadVolume(num: number): Promise<Volume | undefined> {
  const hit = loaded.get(num);
  if (hit) return Promise.resolve(hit);

  const running = inflight.get(num);
  if (running) return running;

  const importer = modules[fileFor(num)];
  if (!importer) return Promise.resolve(undefined);

  const job = importer()
    .then((mod) => {
      const raw = (mod[exportFor(num)] ?? mod.default) as Volume | undefined;
      if (raw) loaded.set(num, raw);
      return raw;
    })
    .catch((err) => {
      // A failed chunk fetch must degrade to "not found", never to a blank page.
      console.warn(`[volumes] could not load volume ${num}:`, err);
      return undefined;
    })
    .finally(() => {
      inflight.delete(num);
    });

  inflight.set(num, job);
  return job;
}
