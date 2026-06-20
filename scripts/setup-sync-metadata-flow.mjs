#!/usr/bin/env node
/**
 * Setup del Flow Directus per sync metadati IT→EN.
 *
 * Crea (o aggiorna) un Flow che intercetta items.update su articoli IT
 * e chiama /api/sync-metadata sull'endpoint CF Pages.
 *
 * Prerequisiti:
 *   - DIRECTUS_TOKEN con permessi admin
 *   - SYNC_METADATA_SECRET impostato in CF Pages env
 *
 * Uso:
 *   DIRECTUS_URL=https://cms.ombreeluci.it DIRECTUS_TOKEN=xxx node scripts/setup-sync-metadata-flow.mjs
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
  // Check if flow already exists
  const { data: flows } = await api('GET', '/flows?filter[name][_eq]=Sync metadati IT→EN');

  if (flows.length > 0) {
    console.log(`Flow already exists: ${flows[0].id}`);
    console.log('Delete it first if you want to recreate.');
    return;
  }

  // Create Flow
  const { data: flow } = await api('POST', '/flows', {
    name: 'Sync metadati IT→EN',
    description: 'Quando un articolo IT viene aggiornato, sincronizza metadati sull\'EN collegato via /api/sync-metadata',
    status: 'active',
    trigger: 'event',
    accountability: 'all',
    options: {
      type: 'action',
      scope: ['items.update'],
      collections: ['articoli'],
    },
  });

  console.log(`Flow created: ${flow.id}`);

  // Create condition operation: check if article is IT
  const { data: conditionOp } = await api('POST', '/operations', {
    flow: flow.id,
    name: 'Check if IT article',
    key: 'check_it',
    type: 'condition',
    position_x: 20,
    position_y: 1,
    options: {
      filter: {
        _and: [
          { '$trigger.payload.lang': { _null: true } },
        ],
      },
    },
  });

  // Create webhook operation (runs on condition success)
  const { data: webhookOp } = await api('POST', '/operations', {
    flow: flow.id,
    name: 'Call sync-metadata endpoint',
    key: 'call_sync',
    type: 'request',
    position_x: 40,
    position_y: 1,
    options: {
      method: 'POST',
      url: `${SITE_URL}/api/sync-metadata`,
      headers: [
        { header: 'Authorization', value: `Bearer ${SYNC_SECRET}` },
        { header: 'Content-Type', value: 'application/json' },
      ],
      body: JSON.stringify({
        id: '{{$trigger.keys[0]}}',
      }),
    },
  });

  // Link: flow trigger → condition
  await api('PATCH', `/flows/${flow.id}`, {
    operation: conditionOp.id,
  });

  // Link: condition success → webhook
  await api('PATCH', `/operations/${conditionOp.id}`, {
    resolve: webhookOp.id,
  });

  console.log(`Condition operation: ${conditionOp.id}`);
  console.log(`Webhook operation: ${webhookOp.id}`);
  console.log('');
  console.log('Flow setup complete!');
  console.log('');
  console.log('Next steps:');
  console.log(`1. Add SYNC_METADATA_SECRET=${SYNC_SECRET} to CF Pages environment variables`);
  console.log(`2. Test: update an IT article in Directus and check if EN updates`);
}

main().catch(console.error);
