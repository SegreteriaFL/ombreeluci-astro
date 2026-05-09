/**
 * ALGOLIA-05 — Webhook endpoint per sync Directus→Algolia
 *
 * POST /api/algolia-sync
 * Headers: Authorization: Bearer <ALGOLIA_SYNC_SECRET>
 * Body: { id: string, action: 'update' | 'delete' }
 *
 * Chiamato da Directus Flow quando un articolo viene pubblicato/aggiornato/eliminato.
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { algoliasearch } from 'algoliasearch';

const INDEX_ARTICOLI = 'oel_articoli';

// ── Utilities (same as index-all.mjs) ────────────────────────────────────────

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
  articolo_traduzione?: string | null; // ID of linked EN article
}

function buildArticoloRecord(a: ArticoloData, directusUrl: string) {
  const corpoText = stripHtml(a.corpo ?? '').slice(0, 5000);
  const anno = a.data_pubblicazione
    ? new Date(a.data_pubblicazione).getFullYear()
    : null;

  return {
    objectID: `articolo-${a.id}`,
    tipo: 'articolo',
    slug: a.slug ?? '',
    lang: a.lang ?? 'it',
    url: articleUrl(a.slug ?? '', a.lang ?? 'it'),
    titolo: a.titolo ?? '',
    sottotitolo: a.sottotitolo ?? '',
    corpo: corpoText,
    autore_nome: a.autore?.nome_completo ?? '',
    autore_slug: a.autore?.slug ?? '',
    autore_foto_url: assetUrl(a.autore?.foto?.id ?? null, directusUrl, 'width=80&height=80&fit=cover'),
    categoria_menu: a.categoria_menu ?? '',
    forma: a.forma ?? '',
    tema_label: a.tema_label ?? '',
    data_pubblicazione: a.data_pubblicazione ?? '',
    anno,
    immagine_url: assetUrl(a.immagine_copertina?.id ?? null, directusUrl, 'width=400&height=280&fit=cover'),
    numero_id: a.numero_rivista?.id_numero ?? null,
    numero_title: a.numero_rivista?.display_title ?? null,
  };
}

// ── Fetch article from Directus ──────────────────────────────────────────────

async function fetchArticle(
  articleId: string,
  directusUrl: string,
  directusToken: string
): Promise<ArticoloData | null> {
  const fields = [
    'id', 'slug', 'lang', 'titolo', 'sottotitolo', 'stato',
    'data_pubblicazione', 'categoria_menu', 'forma', 'tema_label',
    'corpo', 'articolo_traduzione',
    'immagine_copertina.id',
    'autore.id', 'autore.slug', 'autore.nome_completo', 'autore.foto.id',
    'numero_rivista.id_numero', 'numero_rivista.display_title',
  ].join(',');

  try {
    const res = await fetch(`${directusUrl}/items/articoli/${articleId}?fields=${fields}`, {
      headers: { Authorization: `Bearer ${directusToken}` },
    });
    if (!res.ok) {
      console.error(`ALGOLIA-SYNC: Directus fetch error ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.data as ArticoloData;
  } catch (err) {
    console.error('ALGOLIA-SYNC: Directus fetch failed:', err);
    return null;
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────

interface SyncRequest {
  id: string;
  action: 'update' | 'delete';
}

export const POST: APIRoute = async ({ request, locals }) => {
  // Get secrets from runtime env (CF Workers) or import.meta.env
  const runtime = (locals as any)?.runtime?.env ?? {};
  const syncSecret = runtime.ALGOLIA_SYNC_SECRET ?? import.meta.env.ALGOLIA_SYNC_SECRET ?? '';
  const algoliaAppId = runtime.ALGOLIA_APPLICATION_ID ?? import.meta.env.ALGOLIA_APPLICATION_ID ?? '';
  const algoliaApiKey = runtime.ALGOLIA_WRITE_API ?? import.meta.env.ALGOLIA_WRITE_API ?? '';
  const directusUrl = runtime.DIRECTUS_URL ?? import.meta.env.DIRECTUS_URL ?? 'https://cms.ombreeluci.it';
  const directusToken = runtime.DIRECTUS_TOKEN ?? import.meta.env.DIRECTUS_TOKEN ?? '';

  // Validate authorization
  const authHeader = request.headers.get('Authorization') ?? '';
  const providedSecret = authHeader.replace(/^Bearer\s+/i, '');

  if (!syncSecret || providedSecret !== syncSecret) {
    console.error('ALGOLIA-SYNC: Invalid or missing secret');
    // Debug: indicate which check failed
    const debugInfo = !syncSecret ? 'secret_not_configured' : 'secret_mismatch';
    return new Response(
      JSON.stringify({ ok: false, error: 'unauthorized', debug: debugInfo }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validate Algolia credentials
  if (!algoliaAppId || !algoliaApiKey) {
    console.error('ALGOLIA-SYNC: Missing Algolia credentials');
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'server_config_error',
        debug: {
          hasAppId: !!algoliaAppId,
          hasApiKey: !!algoliaApiKey,
          hasDirectusToken: !!directusToken
        }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Parse request body
  let body: SyncRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: 'invalid_request' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { id, action } = body;

  if (!id || !['update', 'delete'].includes(action)) {
    return new Response(
      JSON.stringify({ ok: false, error: 'invalid_params' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const client = algoliasearch(algoliaAppId, algoliaApiKey);

  try {
    // Handle delete
    if (action === 'delete') {
      await client.deleteObjects({
        indexName: INDEX_ARTICOLI,
        objectIDs: [`articolo-${id}`]
      });
      console.log(`ALGOLIA-SYNC: Deleted article ${id}`);
      return new Response(
        JSON.stringify({ ok: true, action: 'deleted', id }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle update
    const article = await fetchArticle(id, directusUrl, directusToken);

    if (!article) {
      console.error(`ALGOLIA-SYNC: Could not fetch article ${id}`);
      return new Response(
        JSON.stringify({ ok: false, error: 'article_not_found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If not published, remove from index
    if (article.stato !== 'published') {
      await client.deleteObjects({
        indexName: INDEX_ARTICOLI,
        objectIDs: [`articolo-${id}`]
      });
      console.log(`ALGOLIA-SYNC: Removed unpublished article ${id}`);
      return new Response(
        JSON.stringify({ ok: true, action: 'removed_unpublished', id }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build and save record
    const record = buildArticoloRecord(article, directusUrl);
    await client.saveObjects({ indexName: INDEX_ARTICOLI, objects: [record] });
    console.log(`ALGOLIA-SYNC: Updated article ${id} (${article.slug})`);

    // If there's a linked EN article, update that too
    if (article.articolo_traduzione && article.lang === 'it') {
      const enArticle = await fetchArticle(article.articolo_traduzione, directusUrl, directusToken);
      if (enArticle && enArticle.stato === 'published') {
        const enRecord = buildArticoloRecord(enArticle, directusUrl);
        await client.saveObjects({ indexName: INDEX_ARTICOLI, objects: [enRecord] });
        console.log(`ALGOLIA-SYNC: Also updated linked EN article ${enArticle.id} (${enArticle.slug})`);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, action: 'updated', id, slug: article.slug }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('ALGOLIA-SYNC error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: 'algolia_error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
