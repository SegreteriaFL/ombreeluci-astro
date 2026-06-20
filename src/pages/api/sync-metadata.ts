/**
 * SYNC-META — Sync metadati IT → tutte le lingue collegate
 *
 * POST /api/sync-metadata
 * Headers: Authorization: Bearer <SYNC_METADATA_SECRET>
 * Body: { id: string, keys?: string[] }
 *
 * Chiamato da Directus Flow quando un articolo IT viene aggiornato.
 * Copia i campi invarianti (categoria, autore, data, ecc.) sull'EN collegato.
 *
 * Principio IT-first: la redazione modifica solo l'IT, il resto è cascata.
 */
export const prerender = false;

import type { APIRoute } from 'astro';

const SYNC_FIELDS = [
  'autore',
  'numero_rivista',
  'categoria_menu',
  'categoria_menu_2',
  'data_pubblicazione',
  'forma',
  'ruolo_editoriale',
  'immagine_copertina',
  'in_evidenza',
  'serie',
  'has_comments',
];

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any)?.runtime?.env ?? {};
  const syncSecret    = runtime.SYNC_METADATA_SECRET ?? import.meta.env.SYNC_METADATA_SECRET ?? '';
  const directusUrl   = runtime.DIRECTUS_URL         ?? import.meta.env.DIRECTUS_URL         ?? 'https://cms.ombreeluci.it';
  const directusToken = runtime.DIRECTUS_TOKEN       ?? import.meta.env.DIRECTUS_TOKEN       ?? '';

  const authHeader = request.headers.get('Authorization') ?? '';
  if (!syncSecret || authHeader.replace(/^Bearer\s+/i, '') !== syncSecret) {
    return json({ ok: false, error: 'unauthorized' }, 401);
  }

  let body: { id: string; keys?: string[] };
  try { body = await request.json(); }
  catch { return json({ ok: false, error: 'invalid_request' }, 400); }

  const { id } = body;
  if (!id) return json({ ok: false, error: 'missing_id' }, 400);

  try {
    const itArticle = await fetchArticle(id, directusUrl, directusToken);
    if (!itArticle) return json({ ok: false, error: 'article_not_found' }, 404);

    if (itArticle.lang !== 'it') {
      return json({ ok: false, error: 'not_italian', lang: itArticle.lang }, 400);
    }

    if (!itArticle.articolo_traduzione) {
      return json({ ok: true, action: 'no_translation_linked', id }, 200);
    }

    const patch: Record<string, any> = {};
    const M2O_FIELDS = ['autore', 'numero_rivista', 'immagine_copertina', 'serie'];
    for (const field of SYNC_FIELDS) {
      const value = (itArticle as any)[field];
      if (M2O_FIELDS.includes(field)) {
        patch[field] = value?.id ?? value?.id_numero ?? value ?? null;
      } else {
        patch[field] = value ?? null;
      }
    }

    const translationId = typeof itArticle.articolo_traduzione === 'object'
      ? (itArticle.articolo_traduzione as any).id
      : itArticle.articolo_traduzione;

    await patchArticle(translationId, patch, directusUrl, directusToken);

    // Sync tags M2M: copy IT tags to EN
    const synced: string[] = [...Object.keys(patch)];
    try {
      const itTags = await fetchM2M(`${directusUrl}/items/articoli_tags?filter[articoli_id][_eq]=${id}&fields=tags_id`, directusToken);
      if (itTags.length > 0) {
        // Delete existing EN tags
        const enTags = await fetchM2M(`${directusUrl}/items/articoli_tags?filter[articoli_id][_eq]=${translationId}&fields=id`, directusToken);
        for (const t of enTags) {
          await fetch(`${directusUrl}/items/articoli_tags/${t.id}`, {
            method: 'DELETE', headers: { Authorization: `Bearer ${directusToken}` },
          });
        }
        // Create EN tags from IT
        for (const t of itTags) {
          await fetch(`${directusUrl}/items/articoli_tags`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${directusToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ articoli_id: translationId, tags_id: t.tags_id }),
          });
        }
        synced.push(`tags(${itTags.length})`);
      }
    } catch (tagErr) {
      console.error('SYNC-META tags error:', tagErr);
    }

    console.log(`SYNC-META: ${itArticle.slug} -> ${translationId} (${synced.join(', ')})`);
    return json({ ok: true, action: 'synced', id, translation: translationId, fields: synced }, 200);

  } catch (err) {
    console.error('SYNC-META error:', err);
    return json({ ok: false, error: 'sync_error' }, 500);
  }
};

function json(data: object, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

interface ArticoloData {
  id: string;
  slug?: string;
  lang?: string;
  articolo_traduzione?: any;
  [key: string]: any;
}

async function fetchArticle(id: string, directusUrl: string, token: string): Promise<ArticoloData | null> {
  const fields = [
    'id', 'slug', 'lang', 'articolo_traduzione',
    ...SYNC_FIELDS.map(f => {
      if (f === 'autore') return 'autore.id';
      if (f === 'numero_rivista') return 'numero_rivista.id_numero';
      if (f === 'immagine_copertina') return 'immagine_copertina.id';
      if (f === 'serie') return 'serie.id';
      return f;
    }),
  ].join(',');

  const res = await fetch(`${directusUrl}/items/articoli/${id}?fields=${fields}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return ((await res.json()) as { data: ArticoloData }).data;
}

async function fetchM2M(url: string, token: string): Promise<any[]> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  return ((await res.json()) as { data: any[] }).data;
}

async function patchArticle(id: string, data: Record<string, any>, directusUrl: string, token: string): Promise<void> {
  const res = await fetch(`${directusUrl}/items/articoli/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH ${id} failed (${res.status}): ${text}`);
  }
}
