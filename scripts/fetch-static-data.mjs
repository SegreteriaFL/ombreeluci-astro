/**
 * fetch-static-data.mjs
 *
 * Prebuild script: aggiorna src/data/ultimo-numero.json con i dati freschi
 * da Directus prima che Astro esegua il build.
 *
 * Logica di fallback: se Directus è irraggiungibile o la fetch fallisce,
 * mantiene il JSON esistente e lascia proseguire il build con dati leggermente
 * stantii. Non lancia eccezioni, non abortisce il build.
 *
 * Eseguito da package.json come "prebuild".
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH  = path.join(__dirname, '..', 'src', 'data', 'ultimo-numero.json');

const DIRECTUS_URL   = process.env.DIRECTUS_URL   || 'https://cms.ombreeluci.it';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

const FIELDS = [
  'id_numero',
  'titolo_tema',
  'display_title',
  'numero_progressivo',
  'anno_pubblicazione',
  'periodo_label',
  'copertina_url',
  'tipo',
].join(',');

async function fetchUltimo() {
  const params = new URLSearchParams({
    fields:                          FIELDS,
    'filter[tipo][_eq]':             'oel',
    'sort[]':                        '-anno_pubblicazione',
    'sort[1]':                       '-numero_progressivo',
    limit:                           '1',
  });

  const headers = { 'Content-Type': 'application/json' };
  if (DIRECTUS_TOKEN) headers['Authorization'] = `Bearer ${DIRECTUS_TOKEN}`;

  const res = await fetch(`${DIRECTUS_URL}/items/numeri_rivista?${params}`, {
    headers,
    signal: AbortSignal.timeout(10_000), // 10 s max
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  const json = await res.json();
  const raw  = json?.data?.[0];
  if (!raw) throw new Error('Nessun numero restituito da Directus');

  // Mappa i nomi Directus → nomi attesi da Header/IssueContent/HomePageContent
  return {
    id_numero:           raw.id_numero,
    copertina_url:       raw.copertina_url   ?? null,
    titolo_numero:       raw.titolo_tema      ?? raw.display_title ?? null,
    numero_progressivo:  raw.numero_progressivo ?? null,
    anno_pubblicazione:  raw.anno_pubblicazione ?? null,
    periodo_label:       raw.periodo_label    ?? null,
  };
}

async function main() {
  try {
    const numero = await fetchUltimo();
    fs.writeFileSync(OUT_PATH, JSON.stringify(numero, null, 2) + '\n', 'utf8');
    console.log(`[fetch-static-data] ✓ ultimo-numero aggiornato: ${numero.id_numero}`);
  } catch (err) {
    // FALLBACK: mantieni il JSON esistente, non abortire il build
    console.warn(`[fetch-static-data] ⚠ Fetch fallita (${err.message}). Mantenuto ultimo-numero.json esistente.`);
    // Non rilanciare: process.exit(0) implicito
  }
}

main();
