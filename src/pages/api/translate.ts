/**
 * TRANSLATE — Fase 3 roadmap (docs/ROADMAP-AUTOMAZIONE.md). Traduce un articolo IT → EN
 * automaticamente e crea l'articolo EN, senza intervento umano.
 *
 * POST /api/translate
 * Headers: Authorization: Bearer <SYNC_METADATA_SECRET>
 * Body: { id: string }  (id articolo IT)
 *
 * Chiamato da Directus Flow quando un articolo IT viene pubblicato per la prima volta.
 * Usa Claude Sonnet 5 con output strutturato (JSON Schema) — non testo libero da parsare:
 * elimina la classe di bug "JSON malformato incollato a mano" vista il 2026-08-04.
 *
 * Principio di sicurezza: se l'EN esiste già, non tocca nulla. Non sovrascrive mai
 * una traduzione esistente — evita di cancellare correzioni manuali della redazione.
 * Per ri-tradurre un articolo dopo modifiche IT, va chiamato un altro meccanismo
 * (non ancora costruito — vedi nota in ROADMAP-AUTOMAZIONE.md).
 */
export const prerender = false;

import type { APIRoute } from 'astro';

const COPY_INVARIANT_FIELDS = [
  'categoria_menu',
  'categoria_menu_2',
  'forma',
  'ruolo_editoriale',
  'immagine_copertina',
  'autore',
  'numero_rivista',
  'data_pubblicazione',
  'in_evidenza',
  'serie',
];

const TRANSLATION_SYSTEM_PROMPT = `Translate the fields from Italian into English.

TRANSLATION RULES:
1. Write natural, idiomatic English — as a native editor would publish it, not word-for-word.
2. Titles must read as original English headlines.
3. Break long Italian sentences into shorter English sentences — English prose favors clarity.
4. Preserve ALL HTML tags exactly as they appear in corpo. Do not add, remove, or modify any tag or attribute.
5. Photo credits "Foto di X su Unsplash" → "Photo by X on Unsplash".
6. Do not translate: "Fede e Luce", "Ombre e Luci", Italian city names, honorifics "don/padre/suor/fr.".
7. Use inclusive English disability terminology: "person with Down syndrome", "intellectual disability", "autism".
8. If seo_title or seo_description are empty/null in the input, return null for them — do not invent SEO copy.`;

const TRANSLATION_SCHEMA = {
  type: 'object',
  properties: {
    titolo: { type: 'string' },
    sottotitolo: { type: 'string' },
    seo_title: { type: ['string', 'null'] },
    seo_description: { type: ['string', 'null'] },
    didascalia_copertina: { type: 'string' },
    corpo: { type: 'string' },
  },
  required: ['titolo', 'sottotitolo', 'seo_title', 'seo_description', 'didascalia_copertina', 'corpo'],
  additionalProperties: false,
};

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any)?.runtime?.env ?? {};
  const syncSecret     = runtime.SYNC_METADATA_SECRET ?? import.meta.env.SYNC_METADATA_SECRET ?? '';
  const directusUrl    = runtime.DIRECTUS_URL         ?? import.meta.env.DIRECTUS_URL         ?? 'https://cms.ombreeluci.it';
  const directusToken  = runtime.DIRECTUS_TOKEN       ?? import.meta.env.DIRECTUS_TOKEN       ?? '';
  const anthropicKey   = runtime.ANTHROPIC_API_KEY    ?? import.meta.env.ANTHROPIC_API_KEY    ?? '';

  const authHeader = request.headers.get('Authorization') ?? '';
  if (!syncSecret || authHeader.replace(/^Bearer\s+/i, '') !== syncSecret) {
    return json({ ok: false, error: 'unauthorized' }, 401);
  }
  if (!anthropicKey) {
    return json({ ok: false, error: 'anthropic_key_missing' }, 500);
  }

  let body: { id: string };
  try { body = await request.json(); }
  catch { return json({ ok: false, error: 'invalid_request' }, 400); }

  const { id } = body;
  if (!id) return json({ ok: false, error: 'missing_id' }, 400);

  try {
    const itArticle = await fetchArticle(id, directusUrl, directusToken);
    if (!itArticle) return json({ ok: false, error: 'article_not_found' }, 404);

    if (itArticle.lang !== 'it') {
      return json({ ok: true, action: 'skip_non_it', lang: itArticle.lang }, 200);
    }

    if (itArticle.articolo_traduzione) {
      return json({ ok: true, action: 'skip_existing_translation', id }, 200);
    }

    if (itArticle.stato !== 'published') {
      return json({ ok: true, action: 'skip_not_published' }, 200);
    }

    const translated = await translateArticle(itArticle, anthropicKey);
    if (!translated) {
      return json({ ok: false, error: 'translation_failed' }, 502);
    }

    const enSlug = await uniqueSlug(slugify(translated.titolo), directusUrl, directusToken);

    const copyInvariant: Record<string, any> = {};
    for (const field of COPY_INVARIANT_FIELDS) {
      const value = (itArticle as any)[field];
      copyInvariant[field] = value == null ? null : (typeof value === 'object' && value.id ? value.id : value);
    }

    const enId = await createArticle(directusUrl, directusToken, {
      slug: enSlug,
      lang: 'en',
      stato: 'published',
      titolo: translated.titolo,
      sottotitolo: translated.sottotitolo,
      seo_title: translated.seo_title,
      seo_description: translated.seo_description,
      didascalia_copertina: translated.didascalia_copertina,
      corpo: translated.corpo,
      articolo_traduzione: id,
      ...copyInvariant,
    });

    await patchArticle(id, { articolo_traduzione: enId }, directusUrl, directusToken);

    // Copy tags M2M IT -> EN (best-effort, non-blocking on failure)
    let tagsCount = 0;
    try {
      const itTags = await fetchM2M(`${directusUrl}/items/articoli_tags?filter[articoli_id][_eq]=${id}&fields=tags_id`, directusToken);
      for (const t of itTags) {
        await fetch(`${directusUrl}/items/articoli_tags`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${directusToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ articoli_id: enId, tags_id: t.tags_id }),
        });
      }
      tagsCount = itTags.length;
    } catch (tagErr) {
      console.error('TRANSLATE tags error:', tagErr);
    }

    console.log(`TRANSLATE: ${itArticle.slug} -> EN ${enId} (${enSlug}), tags=${tagsCount}`);
    return json({ ok: true, action: 'created', id, translation: enId, slug: enSlug }, 200);

  } catch (err: any) {
    console.error('TRANSLATE error:', err);
    return json({ ok: false, error: 'translate_error', detail: err?.message ?? String(err) }, 500);
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
  stato?: string;
  titolo?: string;
  sottotitolo?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  corpo?: string;
  didascalia_copertina?: string | null;
  articolo_traduzione?: any;
  [key: string]: any;
}

async function fetchArticle(id: string, directusUrl: string, token: string): Promise<ArticoloData | null> {
  const fields = [
    'id', 'slug', 'lang', 'stato', 'titolo', 'sottotitolo', 'seo_title', 'seo_description',
    'corpo', 'didascalia_copertina', 'articolo_traduzione',
    ...COPY_INVARIANT_FIELDS.map(f => (['autore', 'numero_rivista', 'immagine_copertina', 'serie'].includes(f) ? `${f}.id` : f)),
  ].join(',');

  const res = await fetch(`${directusUrl}/items/articoli/${id}?fields=${fields}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return ((await res.json()) as { data: ArticoloData }).data;
}

async function translateArticle(article: ArticoloData, apiKey: string): Promise<{
  titolo: string; sottotitolo: string; seo_title: string | null; seo_description: string | null;
  didascalia_copertina: string; corpo: string;
} | null> {
  const input = {
    titolo: article.titolo ?? '',
    sottotitolo: article.sottotitolo ?? '',
    seo_title: article.seo_title ?? null,
    seo_description: article.seo_description ?? null,
    didascalia_copertina: article.didascalia_copertina ?? '',
    corpo: article.corpo ?? '',
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 8192,
      system: TRANSLATION_SYSTEM_PROMPT,
      output_config: { format: { type: 'json_schema', schema: TRANSLATION_SCHEMA } },
      messages: [{ role: 'user', content: JSON.stringify(input) }],
    }),
  });

  if (!res.ok) {
    console.error(`TRANSLATE: Claude API error ${res.status}: ${await res.text()}`);
    return null;
  }

  const data = await res.json() as { content: Array<{ type: string; text?: string }> };
  const textBlock = data.content?.find(b => b.type === 'text');
  if (!textBlock?.text) return null;

  try {
    return JSON.parse(textBlock.text);
  } catch (err) {
    console.error('TRANSLATE: failed to parse structured output (should not happen):', err);
    return null;
  }
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90)
    .replace(/-+$/, '');
}

async function uniqueSlug(base: string, directusUrl: string, token: string): Promise<string> {
  let candidate = base;
  let n = 2;
  while (await slugExists(candidate, directusUrl, token)) {
    candidate = `${base}-${n}`;
    n++;
  }
  return candidate;
}

async function slugExists(slug: string, directusUrl: string, token: string): Promise<boolean> {
  const res = await fetch(`${directusUrl}/items/articoli?filter[slug][_eq]=${encodeURIComponent(slug)}&fields=id&limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { data: any[] };
  return data.data.length > 0;
}

async function fetchM2M(url: string, token: string): Promise<any[]> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  return ((await res.json()) as { data: any[] }).data;
}

async function createArticle(directusUrl: string, token: string, data: Record<string, any>): Promise<string> {
  const res = await fetch(`${directusUrl}/items/articoli`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CREATE article failed (${res.status}): ${text}`);
  }
  const result = (await res.json()) as { data: { id: string } };
  return result.data.id;
}

async function patchArticle(id: string, data: Record<string, any>, directusUrl: string, token: string): Promise<void> {
  const res = await fetch(`${directusUrl}/items/articoli/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH ${id} failed (${res.status}): ${text}`);
  }
}
