#!/usr/bin/env node
/**
 * Setup Flow Directus per sync didascalie IT→EN.
 *
 * Crea un Flow che intercetta create/update su didascalie_img (lang=it)
 * e chiama /api/sync-didascalia per tradurre automaticamente.
 *
 * Uso:
 *   DIRECTUS_URL=https://cms.ombreeluci.it DIRECTUS_TOKEN=xxx node scripts/setup-sync-didascalia-flow.mjs
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://cms.ombreeluci.it';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const SITE_URL = process.env.SITE_URL || 'https://ombreeluci.it';
const SYNC_SECRET = process.env.SYNC_METADATA_SECRET || 'eVl5L7yXjFC_MioAFu8tYM4Nj8hEi8AcbR7M29NZG3w';

if (!DIRECTUS_TOKEN) {
  console.error('DIRECTUS_TOKEN required');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
  'Content-Type': 'application/json',
};

async function api(method, path, body) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path}: ${res.status} ${text}`);
  }
  return res.json();
}

async function main() {
  const FLOW_NAME = 'Sync didascalia IT→EN';

  const { data: flows } = await api('GET', `/flows?filter[name][_eq]=${encodeURIComponent(FLOW_NAME)}`);
  if (flows.length > 0) {
    console.log(`Flow already exists: ${flows[0].id} — delete first to recreate`);
    return;
  }

  const { data: flow } = await api('POST', '/flows', {
    name: FLOW_NAME,
    description: 'Quando una didascalia IT viene creata/aggiornata, la traduce in EN via /api/sync-didascalia',
    status: 'active',
    trigger: 'event',
    accountability: 'all',
    options: {
      type: 'action',
      scope: ['items.create', 'items.update'],
      collections: ['didascalie_img'],
    },
  });

  console.log(`Flow created: ${flow.id}`);

  const { data: webhookOp } = await api('POST', '/operations', {
    flow: flow.id,
    name: 'Call sync-didascalia endpoint',
    key: 'call_sync_dida',
    type: 'request',
    position_x: 20,
    position_y: 1,
    options: {
      method: 'POST',
      url: `${SITE_URL}/api/sync-didascalia`,
      headers: [
        { header: 'Authorization', value: `Bearer ${SYNC_SECRET}` },
        { header: 'Content-Type', value: 'application/json' },
      ],
      body: JSON.stringify({
        id: '{{$trigger.key}}',
      }),
    },
  });

  await api('PATCH', `/flows/${flow.id}`, {
    operation: webhookOp.id,
  });

  console.log(`Webhook operation: ${webhookOp.id}`);
  console.log('');
  console.log('Flow setup complete!');
  console.log('');
  console.log('Required CF Pages env var: ANTHROPIC_API_KEY');
}

main().catch(console.error);
