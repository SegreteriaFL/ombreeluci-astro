/**
 * fix-routes.mjs — postbuild script
 *
 * Problema: l'adapter Astro CF genera _routes.json con entry specifiche per ogni
 * pagina SSG (es. /categoria/famiglia) ma SENZA trailing slash. Le richieste reali
 * arrivano CON trailing slash (/categoria/famiglia/) e non matchano l'entry esatta
 * → CF Pages le manda al worker SSR → 404.
 *
 * I wildcard /categoria/* matcherebbero correttamente /categoria/famiglia/ ma CF Pages
 * validator li rifiuta se coesistono con entry specifiche (/categoria/famiglia) → build failure.
 *
 * Soluzione: rimuovere le entry specifiche conflittuali e sostituirle con wildcard.
 * Così _routes.json non ha overlap e i wildcard coprono le trailing-slash requests.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROUTES_PATH = join(process.cwd(), 'dist', '_routes.json');

// Path prefix → wildcard pattern da usare al posto delle entry specifiche
const WILDCARD_MAP = [
  { prefix: '/categoria/',    wildcard: '/categoria/*' },
  { prefix: '/tag/',          wildcard: '/tag/*' },
  { prefix: '/autori/',       wildcard: '/autori/*' },
  { prefix: '/diari/',        wildcard: '/diari/*' },
  { prefix: '/sezioni/',      wildcard: '/sezioni/*' },
  { prefix: '/archivio/oel-', wildcard: '/archivio/oel-*' },
  { prefix: '/archivio/ins-', wildcard: '/archivio/ins-*' },
];

const routes = JSON.parse(readFileSync(ROUTES_PATH, 'utf8'));
const before = routes.exclude.length;

// Rimuovi entry specifiche che sarebbero coperte dai wildcard
routes.exclude = routes.exclude.filter((entry) => {
  const p = typeof entry === 'string' ? entry : (entry.pattern ?? '');
  return !WILDCARD_MAP.some(({ prefix }) => p.startsWith(prefix) && p.length > prefix.length);
});

// Aggiungi i wildcard se non già presenti
for (const { wildcard } of WILDCARD_MAP) {
  const already = routes.exclude.some((e) =>
    (typeof e === 'string' ? e : e.pattern) === wildcard
  );
  if (!already) routes.exclude.push(wildcard);
}

writeFileSync(ROUTES_PATH, JSON.stringify(routes, null, 2));
console.log(`[fix-routes] ${before} → ${routes.exclude.length} exclude entries (rimossi specifici, aggiunti wildcard)`);
