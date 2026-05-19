/**
 * ALGOLIA-05 — Webhook endpoint per sync Directus→Algolia
 *
 * POST /api/algolia-sync
 * Headers: Authorization: Bearer <ALGOLIA_SYNC_SECRET>
 * Body: { id: string, action: 'update' | 'delete' }
 *
 * Chiamato da Directus Flow quando un articolo viene pubblicato/aggiornato/eliminato.
 *
 * Usa Algolia REST API direttamente (no SDK) per tenere il bundle sotto 1MB.
 */
export const prerender = false;

import type { APIRoute } from 'astro';

const INDEX_ARTICOLI = 'oel_articoli';

// ── Algolia REST helpers (sostituisce SDK — evita 380KB di bundle) ────────────

async function algoliaDelete(appId: string, apiKey: string, indexName: string, objectIDs: string[]): Promise<void> {
  const res = await fetch(`https://${appId}.algolia.net/1/indexes/${indexName}/batch`, {
    method: 'POST',
    headers: {
      'X-Algolia-Application-Id': appId,
      'X-Algolia-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: objectIDs.map(objectID => ({ action: 'deleteObject', body: { objectID } })),
    }),
  });
  if (!res.ok) throw new Error(`Algolia delete error ${res.status}: ${await res.text()}`);
}

async function algoliaSave(appId: string, apiKey: string, indexName: string, records: object[]): Promise<void> {
  const res = await fetch(`https://${appId}.algolia.net/1/indexes/${indexName}/batch`, {
    method: 'POST',
    headers: {
      'X-Algolia-Application-Id': appId,
      'X-Algolia-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: records.map(body => ({ action: 'updateObject', body })),
    }),
  });
  if (!res.ok) throw new Error(`Algolia save error ${res.status}: ${await res.text()}`);
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function stripHtml(html: string | null): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function assetUrl(fileId: string | null, directusUrl: string, params = 'width=400&height=280&fit=cover'): string | null {
  if (!fileId) return null;
  return `${directusUrl}/assets/${fileId}?${params}`;
}

function articleUrl(slug: string, lang: string): string {
  const urlSlug = lang === 'en' && slug.endsWith('-en') ? slug.slice(0, -3) : slug;
  return lang === 'en' ? `/en/${urlSlug}/` : `/it/${urlSlug}/`;
}

interface ArticoloData {
  id: string;
  slug?: string;
  lang?: string;
  titolo?: string;
  sottotitolo?: string;
  stato?: string;
  data_pubblicazione?: string;
  categoria_menu?: string;
  forma?: string;
  tema_label?: string;
  corpo?: string;
  immagine_copertina?: { id: string } | null;
  autore?: {
    id?: string;
    slug?: string;
    nome_completo?: string;
    foto?: { id: string } | null;
  } | null;
  numero_rivista?: {
    id_numero?: string;
    display_title?: string;
  } | null;
  articolo_traduzione?: string | null;
}

function buildArticoloRecord(a: ArticoloData, directusUrl: string) {
  return {
    objectID: `articolo-${a.id}`,
    tipo: 'articolo',
    slug: a.slug ?? '',
    lang: a.lang ?? 'it',
    url: articleUrl(a.slug ?? '', a.lang ?? 'it'),
    titolo: a.titolo ?? '',
    sottotitolo: a.sottotitolo ?? '',
    corpo: stripHtml(a.corpo ?? '').slice(0, 5000),
    autore_nome: a.autore?.nome_completo ?? '',
    autore_slug: a.autore?.slug ?? '',
    autore_foto_url: assetUrl(a.autore?.foto?.id ?? null, directusUrl, 'width=80&height=80&fit=cover'),
    categoria_menu: a.categoria_menu ?? '',
    forma: a.forma ?? '',
    tema_label: a.tema_label ?? '',
    data_pubblicazione: a.data_pubblicazione ?? '',
    anno: a.data_pubblicazione ? new Date(a.data_pubblicazione).getFullYear() : null,
    immagine_url: assetUrl(a.immagine_copertina?.id ?? null, directusUrl, 'width=400&height=280&fit=cover'),
    numero_id: a.numero_rivista?.id_numero ?? null,
    numero_title: a.numero_rivista?.display_title ?? null,
  };
}

async function fetchArticle(id: string, directusUrl: string, directusToken: string): Promise<ArticoloData | null> {
  const fields = [
    'id', 'slug', 'lang', 'titolo', 'sottotitolo', 'stato',
    'data_pubblicazione', 'categoria_menu', 'forma', 'tema_label',
    'corpo', 'articolo_traduzione',
    'immagine_copertina.id',
    'autore.id', 'autore.slug', 'autore.nome_completo', 'autore.foto.id',
    'numero_rivista.id_numero', 'numero_rivista.display_title',
  ].join(',');

  try {
    const res = await fetch(`${directusUrl}/items/articoli/${id}?fields=${fields}`, {
      headers: { Authorization: `Bearer ${directusToken}` },
    });
    if (!res.ok) { console.error(`ALGOLIA-SYNC: Directus error ${res.status}`); return null; }
    return ((await res.json()) as { data: ArticoloData }).data;
  } catch (err) {
    console.error('ALGOLIA-SYNC: Directus fetch failed:', err);
    return null;
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any)?.runtime?.env ?? {};
  const syncSecret    = runtime.ALGOLIA_SYNC_SECRET     ?? import.meta.env.ALGOLIA_SYNC_SECRET     ?? '';
  const algoliaAppId  = runtime.ALGOLIA_APPLICATION_ID  ?? import.meta.env.ALGOLIA_APPLICATION_ID  ?? '';
  const algoliaApiKey = runtime.ALGOLIA_WRITE_API       ?? import.meta.env.ALGOLIA_WRITE_API       ?? '';
  const directusUrl   = runtime.DIRECTUS_URL            ?? import.meta.env.DIRECTUS_URL            ?? 'https://cms.ombreeluci.it';
  const directusToken = runtime.DIRECTUS_TOKEN          ?? import.meta.env.DIRECTUS_TOKEN          ?? '';

  const authHeader = request.headers.get('Authorization') ?? '';
  if (!syncSecret || authHeader.replace(/^Bearer\s+/i, '') !== syncSecret) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  if (!algoliaAppId || !algoliaApiKey) {
    return new Response(JSON.stringify({ ok: false, error: 'server_config_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  let body: { id: string; action: 'update' | 'delete' };
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ ok: false, error: 'invalid_request' }), { status: 400, headers: { 'Content-Type': 'application/json' } }); }

  const { id, action } = body;
  if (!id || !['update', 'delete'].includes(action)) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_params' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    if (action === 'delete') {
      await algoliaDelete(algoliaAppId, algoliaApiKey, INDEX_ARTICOLI, [`articolo-${id}`]);
      console.log(`ALGOLIA-SYNC: Deleted ${id}`);
      return new Response(JSON.stringify({ ok: true, action: 'deleted', id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const article = await fetchArticle(id, directusUrl, directusToken);
    if (!article) {
      return new Response(JSON.stringify({ ok: false, error: 'article_not_found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    if (article.stato !== 'published') {
      await algoliaDelete(algoliaAppId, algoliaApiKey, INDEX_ARTICOLI, [`articolo-${id}`]);
      console.log(`ALGOLIA-SYNC: Removed unpublished ${id}`);
      return new Response(JSON.stringify({ ok: true, action: 'removed_unpublished', id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const record = buildArticoloRecord(article, directusUrl);
    await algoliaSave(algoliaAppId, algoliaApiKey, INDEX_ARTICOLI, [record]);
    console.log(`ALGOLIA-SYNC: Updated ${id} (${article.slug})`);

    if (article.articolo_traduzione && article.lang === 'it') {
      const enArticle = await fetchArticle(article.articolo_traduzione, directusUrl, directusToken);
      if (enArticle?.stato === 'published') {
        await algoliaSave(algoliaAppId, algoliaApiKey, INDEX_ARTICOLI, [buildArticoloRecord(enArticle, directusUrl)]);
        console.log(`ALGOLIA-SYNC: Also updated EN ${enArticle.id} (${enArticle.slug})`);
      }
    }

    return new Response(JSON.stringify({ ok: true, action: 'updated', id, slug: article.slug }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('ALGOLIA-SYNC error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'algolia_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
