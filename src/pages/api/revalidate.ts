import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body: { slug?: string; secret?: string };
  try {
    body = await request.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const { slug, secret } = body ?? {};
  if (!slug || typeof slug !== 'string') {
    return new Response('Missing slug', { status: 400 });
  }

  // Secrets letti dal runtime CF (CF Pages → Settings → Environment Variables)
  // Non sono baked nel bundle: accessibili solo a runtime via locals.runtime.env
  const runtime = (locals as any).runtime;
  const env = runtime?.env ?? {};
  const REVALIDATE_SECRET: string = env.REVALIDATE_SECRET ?? '';
  const CF_ZONE_ID: string = env.CF_ZONE_ID ?? '';
  const CF_PURGE_TOKEN: string = env.CF_PURGE_TOKEN ?? '';

  if (!REVALIDATE_SECRET || secret !== REVALIDATE_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!CF_ZONE_ID || !CF_PURGE_TOKEN) {
    return new Response('Server misconfiguration', { status: 500 });
  }

  const articleUrl = `https://ombreeluci.it/blog/${slug}/`;

  const purgeRes = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CF_PURGE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: [articleUrl] }),
    }
  );

  const purgeData = (await purgeRes.json()) as { success: boolean; errors: unknown[] };
  if (!purgeData.success) {
    return new Response(JSON.stringify({ ok: false, errors: purgeData.errors }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Prewarm fire-and-forget
  fetch(articleUrl, { headers: { 'User-Agent': 'OEL-Prewarm/1.0' } }).catch(() => {});

  return new Response(JSON.stringify({ ok: true, purged: articleUrl }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
