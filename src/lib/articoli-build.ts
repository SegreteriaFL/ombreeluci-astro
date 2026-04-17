/**
 * articoli-build.ts — wrapper BUILD-TIME ONLY per getAllArticoli con fallback snapshot.
 *
 * Usare solo in pagine **prerenderizzate** (default hybrid: tutto tranne `prerender = false`).
 * Non importare in route SSR runtime (es. `blog/[...slug]`) — il JSON snapshot è grande.
 *
 * Se Directus non risponde o la build non ha token (es. CF Pages senza variabili in **Build**),
 * usa `src/data/articoli_snapshot.json` (senza `corpo`, aggiornato da GH Actions).
 */

import { getAllArticoli } from './directus';
import type { ArticoloFull } from './directus';
import snapshotData from '../data/articoli_snapshot.json';

let _cache: ArticoloFull[] | null = null;

export async function getAllArticoliBuild(): Promise<ArticoloFull[]> {
  if (_cache) return _cache;

  const live = await getAllArticoli();
  if (live.length > 0) {
    _cache = live;
    return live;
  }

  // Directus non raggiungibile — usa snapshot
  const snapshot = (snapshotData as { data: ArticoloFull[] }).data ?? [];
  console.warn(`[build] getAllArticoliBuild: Directus non raggiungibile — snapshot fallback (${snapshot.length} articoli, corpo=null)`);
  _cache = snapshot;
  return snapshot;
}
