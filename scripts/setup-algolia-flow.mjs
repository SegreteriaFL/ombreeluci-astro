#!/usr/bin/env node
/**
 * ALGOLIA-05 — Setup Directus Flow for Algolia sync
 */
import 'dotenv/config';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'https://cms.ombreeluci.it';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const ALGOLIA_SYNC_SECRET = 'f28d04c5fa6d05393f36fbb9e23ef89d40bb16cb216da0248ea57ec421e22f8f';
const WEBHOOK_URL = 'https://ombreeluci-staging.pages.dev/api/algolia-sync';

if (!DIRECTUS_TOKEN) {
  console.error('DIRECTUS_TOKEN required');
  process.exit(1);
}

async function main() {
  console.log('Creating Algolia sync Flow...\n');

  // Create the Flow
  const flowData = {
    name: 'Algolia sync su pubblicazione',
    icon: 'search',
    color: '#5468FF',
    description: 'ALGOLIA-05: sincronizza articolo su Algolia quando pubblicato',
    status: 'active',
    trigger: 'event',
    accountability: 'all',
    options: {
      type: 'action',
      scope: ['items.update', 'items.create'],
      collections: ['articoli']
    }
  };

  const flowRes = await fetch(`${DIRECTUS_URL}/flows`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(flowData)
  });
  const flow = await flowRes.json();

  if (!flow.data?.id) {
    console.error('Failed to create flow:', flow);
    process.exit(1);
  }
  console.log('Flow created:', flow.data.id);

  // Create condition operation
  const conditionOp = {
    name: 'Check if published',
    key: 'check_published',
    type: 'condition',
    position_x: 19,
    position_y: 1,
    flow: flow.data.id,
    options: {
      filter: {
        '_and': [
          { 'payload.stato': { '_eq': 'published' } }
        ]
      }
    }
  };

  const condRes = await fetch(`${DIRECTUS_URL}/operations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(conditionOp)
  });
  const condData = await condRes.json();

  if (!condData.data?.id) {
    console.error('Failed to create condition:', condData);
    process.exit(1);
  }
  console.log('Condition operation created:', condData.data.id);

  // Create HTTP request operation
  const httpOp = {
    name: 'Call Algolia sync API',
    key: 'call_algolia',
    type: 'request',
    position_x: 37,
    position_y: 1,
    flow: flow.data.id,
    options: {
      url: WEBHOOK_URL,
      method: 'POST',
      headers: [
        { header: 'Content-Type', value: 'application/json' },
        { header: 'Authorization', value: `Bearer ${ALGOLIA_SYNC_SECRET}` }
      ],
      body: JSON.stringify({ id: '{{$trigger.key}}', action: 'update' })
    }
  };

  const httpRes = await fetch(`${DIRECTUS_URL}/operations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(httpOp)
  });
  const httpData = await httpRes.json();

  if (!httpData.data?.id) {
    console.error('Failed to create HTTP operation:', httpData);
    process.exit(1);
  }
  console.log('HTTP operation created:', httpData.data.id);

  // Link condition to HTTP request (resolve path)
  await fetch(`${DIRECTUS_URL}/operations/${condData.data.id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ resolve: httpData.data.id })
  });
  console.log('Linked condition → HTTP request');

  // Link flow to first operation (condition)
  await fetch(`${DIRECTUS_URL}/flows/${flow.data.id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ operation: condData.data.id })
  });
  console.log('Linked flow → condition');

  console.log('\n✅ Flow created successfully!');
  console.log(`   Flow ID: ${flow.data.id}`);
  console.log(`   Webhook URL: ${WEBHOOK_URL}`);
  console.log('\n⚠️  Add these secrets to CF Pages:');
  console.log(`   ALGOLIA_SYNC_SECRET=${ALGOLIA_SYNC_SECRET}`);
  console.log('   (ALGOLIA_APPLICATION_ID and ALGOLIA_WRITE_API should already exist in .env)');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
