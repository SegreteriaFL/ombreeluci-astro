/**
 * SYNC-DIDA — Traduce didascalia IT → EN (e future lingue) automaticamente.
 *
 * POST /api/sync-didascalia
 * Headers: Authorization: Bearer <SYNC_METADATA_SECRET>
 * Body: { id: number }  (ID del record didascalie_img appena salvato)
 *
 * Chiamato da Directus Flow quando una didascalia IT viene creata/aggiornata.
 * Traduce con Claude Haiku e crea/aggiorna il record EN per lo stesso file.
 */
export const prerender = false;

import type { APIRoute } from 'astro';

const TARGET_LANGS = ['en'] as const;

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
};

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any)?.runtime?.env ?? {};
  const syncSecret    = runtime.SYNC_METADATA_SECRET ?? import.meta.env.SYNC_METADATA_SECRET ?? '';
  const directusUrl   = runtime.DIRECTUS_URL         ?? import.meta.env.DIRECTUS_URL         ?? 'https://cms.ombreeluci.it';
  const directusToken = runtime.DIRECTUS_TOKEN       ?? import.meta.env.DIRECTUS_TOKEN       ?? '';
  const anthropicKey  = runtime.ANTHROPIC_API_KEY     ?? import.meta.env.ANTHROPIC_API_KEY    ?? '';

  const authHeader = request.headers.get('Authorization') ?? '';
  if (!syncSecret || authHeader.replace(/^Bearer\s+/i, '') !== syncSecret) {
    return json({ ok: false, error: 'unauthorized' }, 401);
  }

  if (!anthropicKey) {
    return json({ ok: false, error: 'anthropic_key_missing' }, 500);
  }

  let body: { id: number };
  try { body = await request.json(); }
  catch { return json({ ok: false, error: 'invalid_request' }, 400); }

  const { id } = body;
  if (!id) return json({ ok: false, error: 'missing_id' }, 400);

  try {
    const record = await directusFetch(
      `${directusUrl}/items/didascalie_img/${id}?fields=id,file,lang,didascalia`,
      directusToken
    );

    if (!record) return json({ ok: false, error: 'not_found' }, 404);
    if (record.lang !== 'it') return json({ ok: true, action: 'skip_non_it', lang: record.lang }, 200);
    if (!record.didascalia?.trim()) return json({ ok: true, action: 'skip_empty' }, 200);

    const results: string[] = [];

    for (const targetLang of TARGET_LANGS) {
      const translated = await translateCaption(record.didascalia, targetLang, anthropicKey);
      if (!translated) continue;

      const existing = await findDidascalia(directusUrl, directusToken, record.file, targetLang);

      if (existing) {
        await directusPatch(
          `${directusUrl}/items/didascalie_img/${existing.id}`,
          { didascalia: translated },
          directusToken
        );
        results.push(`${targetLang}:updated`);
      } else {
        await directusPost(
          `${directusUrl}/items/didascalie_img`,
          { file: record.file, lang: targetLang, didascalia: translated },
          directusToken
        );
        results.push(`${targetLang}:created`);
      }
    }

    console.log(`SYNC-DIDA: file=${record.file} — ${results.join(', ')}`);
    return json({ ok: true, action: 'translated', id, results }, 200);

  } catch (err: any) {
    console.error('SYNC-DIDA error:', err);
    return json({ ok: false, error: 'sync_error', detail: err?.message ?? String(err) }, 500);
  }
};

function json(data: object, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function translateCaption(text: string, targetLang: string, apiKey: string): Promise<string | null> {
  const langName = LANG_NAMES[targetLang] ?? targetLang;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Translate this Italian photo caption to ${langName}. Keep HTML tags (<a>, <em>, <strong>) intact. If it says "Foto di X su Unsplash" translate to "Photo by X on Unsplash". Return ONLY the translation, no quotes or explanation.\n\n${text}`,
      }],
    }),
  });

  if (!res.ok) {
    console.error(`Claude API error: ${res.status}`);
    return null;
  }

  const data = await res.json() as { content: Array<{ text: string }> };
  return data.content?.[0]?.text?.trim() ?? null;
}

async function directusFetch(url: string, token: string): Promise<any> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  return ((await res.json()) as { data: any }).data;
}

async function findDidascalia(baseUrl: string, token: string, fileId: string, lang: string): Promise<any> {
  const params = new URLSearchParams({
    'filter[file][_eq]': fileId,
    'filter[lang][_eq]': lang,
    fields: 'id',
    limit: '1',
  });
  const res = await fetch(`${baseUrl}/items/didascalie_img?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { data: any[] };
  return data.data?.[0] ?? null;
}

async function directusPatch(url: string, data: any, token: string): Promise<void> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
}

async function directusPost(url: string, data: any, token: string): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST failed: ${res.status}`);
}
