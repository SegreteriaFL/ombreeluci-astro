/**
 * sitemap-en.xml — URL canoniche EN (/en/*).
 */
export const prerender = true;

import type { APIRoute } from 'astro';
import { getAllArticoliBuild } from '../lib/articoli-build';

const SITE = 'https://ombreeluci.it';

function url(path: string, lastmod?: string): string {
  const loc = `<loc>${SITE}${path}</loc>`;
  const mod = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
  return `<url>${loc}${mod}</url>`;
}

export const GET: APIRoute = async () => {
  const staticPages = [{ path: '/en' }];
  let articleUrls: string[] = [];
  try {
    const articoli = await getAllArticoliBuild();
    const today = new Date().toISOString().slice(0, 10);
    articleUrls = articoli
      .filter((a) => a.lang === 'en')
      .map((a) =>
        url(`/en/${a.slug}`, a.data_pubblicazione ? new Date(a.data_pubblicazione).toISOString().slice(0, 10) : today)
      );
  } catch (e) {
    console.warn('[sitemap-en] Directus fetch failed, articles omitted:', e);
  }

  const staticUrls = staticPages.map((p) => url(p.path));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join('\n')}
${articleUrls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
