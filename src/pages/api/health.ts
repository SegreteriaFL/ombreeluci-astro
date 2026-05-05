import type { APIRoute } from 'astro';

export const prerender = false;

const CMS = 'https://cms.ombreeluci.it';

async function checkDirectus(): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${CMS}/server/ping`, { signal: controller.signal });
    if (!res.ok) return 'down';
    const body = await res.text();
    return body.includes('pong') ? 'ok' : 'degraded';
  } catch {
    return 'down';
  } finally {
    clearTimeout(timer);
  }
}

async function checkArticoli(): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(
      `${CMS}/items/articoli?aggregate[count]=id&filter[stato][_eq]=published`,
      { signal: controller.signal }
    );
    if (!res.ok) return 'error';
    const json = (await res.json()) as { data: [{ count: { id: string } }] };
    const count = parseInt(json.data?.[0]?.count?.id ?? '0', 10);
    return count > 3000 ? 'ok' : `degraded:${count}`;
  } catch {
    return 'error';
  } finally {
    clearTimeout(timer);
  }
}

async function checkUltimoNumero(): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(
      `${CMS}/items/numeri_rivista?sort=-anno_pubblicazione&limit=1&fields=id_numero,tipo`,
      { signal: controller.signal }
    );
    if (!res.ok) return 'error';
    const json = (await res.json()) as { data: [{ id_numero: string | null }] };
    const idNumero = json.data?.[0]?.id_numero;
    return idNumero ? `ok:${idNumero}` : 'missing';
  } catch {
    return 'error';
  } finally {
    clearTimeout(timer);
  }
}

export const GET: APIRoute = async () => {
  const [r1, r2, r3] = await Promise.allSettled([
    checkDirectus(),
    checkArticoli(),
    checkUltimoNumero(),
  ]);

  const directus = r1.status === 'fulfilled' ? r1.value : 'down';
  const articoli = r2.status === 'fulfilled' ? r2.value : 'error';
  const ultimo_numero = r3.status === 'fulfilled' ? r3.value : 'error';

  const isDown = directus === 'down';
  const isDegraded =
    !isDown &&
    (directus === 'degraded' ||
      articoli.startsWith('degraded') ||
      articoli === 'error' ||
      ultimo_numero === 'missing' ||
      ultimo_numero === 'error');

  const status = isDown ? 'down' : isDegraded ? 'degraded' : 'ok';

  return new Response(
    JSON.stringify({
      status,
      checks: { directus, articoli, ultimo_numero },
      ts: new Date().toISOString(),
    }),
    {
      status: isDown ? 503 : 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
};
