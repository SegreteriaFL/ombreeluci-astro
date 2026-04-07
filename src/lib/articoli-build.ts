/**
 * articoli-build.ts — wrapper BUILD-TIME ONLY per getAllArticoli con fallback snapshot.
 *
 * Questo modulo viene importato ESCLUSIVAMENTE in getStaticPaths() di pagine prerenderate.
 * NON importarlo in pagine SSR o componenti — verrà incluso nel worker bundle e causerà errori.
 *
 * Se Directus non è raggiungibile durante la build, usa src/data/articoli_snapshot.json
 * (snapshot senza campo 'corpo', aggiornato ogni lunedì da GH Actions).
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
