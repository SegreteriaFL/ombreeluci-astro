/**
 * setup-static-rebuild-flow.mjs
 *
 * Crea un Directus Flow che triggera il rebuild di Cloudflare Pages ogni volta
 * che un record della collection contenuti_statici viene creato o aggiornato.
 *
 * Prerequisiti:
 *   DIRECTUS_URL  — URL del CMS (es. https://cms.ombreeluci.it)
 *   DIRECTUS_TOKEN — token admin Directus
 *   CF_DEPLOY_HOOK — URL del deploy hook di Cloudflare Pages
 *     (Dashboard → Pages → il progetto → Settings → Builds & Deployments → Deploy Hooks)
 *
 * Uso: node scripts/setup-static-rebuild-flow.mjs
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'https://cms.ombreeluci.it';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const CF_DEPLOY_HOOK = process.env.CF_DEPLOY_HOOK;

if (!DIRECTUS_TOKEN) {
  console.error('❌ DIRECTUS_TOKEN mancante');
  process.exit(1);
}
if (!CF_DEPLOY_HOOK) {
  console.error('❌ CF_DEPLOY_HOOK mancante. Trovalo in Cloudflare Pages → Settings → Builds & Deployments → Deploy Hooks');
  process.exit(1);
}

async function api(method, path, body) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

// Flow: trigger su items.create e items.update di contenuti_statici
// Operation: richiesta HTTP POST all'hook CF Pages
const flowPayload = {
  name: 'Rebuild sito su aggiornamento contenuti_statici',
  icon: 'refresh',
  color: '#4F46E5',
  status: 'active',
  trigger: 'event',
  options: {
    type: 'filter',
    scope: ['items.create', 'items.update'],
    collections: ['contenuti_statici'],
  },
};

console.log('Creazione Flow Directus...');
const flow = await api('POST', '/flows', flowPayload);
console.log(`✓ Flow creato: ${flow.data.id}`);

const operationPayload = {
  name: 'Trigger CF Pages rebuild',
  key: 'trigger_cf_rebuild',
  type: 'request',
  position_x: 19,
  position_y: 1,
  options: {
    url: CF_DEPLOY_HOOK,
    method: 'POST',
    body: '{}',
  },
  flow: flow.data.id,
  resolve: null,
  reject: null,
};

console.log('Creazione Operation...');
const op = await api('POST', '/operations', operationPayload);
console.log(`✓ Operation creata: ${op.data.id}`);

// Collegare l'operation come primo step del flow
await api('PATCH', `/flows/${flow.data.id}`, { operation: op.data.id });
console.log('✓ Operation collegata al flow');

console.log('\n✅ Flow pronto. Da ora ogni modifica a contenuti_statici triggera un rebuild automatico.');
console.log('   Verifica in Directus: Settings → Flows → "Rebuild sito su aggiornamento contenuti_statici"');
