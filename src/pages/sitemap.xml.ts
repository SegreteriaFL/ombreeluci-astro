/**
 * sitemap.xml — generato a build-time da Directus.
 * Copre: pagine statiche + categorie + articoli IT pubblicati.
 * ⚠ robots.txt blocca Googlebot finché noindex è attivo — questo file
 *   è pronto per il cutover DNS/lancio quando robots.txt verrà aperto.
 */
export const prerender = true;

import type { APIRoute } from 'astro';
import { getAllArticoliBuild } from '../lib/articoli-build';
import { getAllCategorySlugs } from '../config/taxonomy.js';
import rubricheData from '../data/rubriche.json';

const SITE = 'https://ombreeluci.it';

function url(path: string, lastmod?: string): string {
  const loc = `<loc>${SITE}${path}</loc>`;
  const mod = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
  return `<url>${loc}${mod}</url>`;
}

export const GET: APIRoute = async () => {
  // 1. Pagine statiche
  const staticPages = [
    { path: '/' },
    { path: '/it/archivio' },
    { path: '/it/autori' },
    { path: '/it/chi-siamo' },
    { path: '/it/sostienici' },
    { path: '/it/newsletter' },
  ];

  // Rubriche IT
  const rubrichePages = rubricheData.map((r) => ({ path: `/it/rubriche/${r.slug}/` }));

  // 2. Categorie
  const categorySlugs: string[] = getAllCategorySlugs();
  const categoryPages = categorySlugs.map((s: string) => ({ path: `/it/categoria/${s}` }));

  // 3. Articoli IT pubblicati
  let articleUrls: string[] = [];
  try {
    const articoli = await getAllArticoliBuild();
    const today = new Date().toISOString().slice(0, 10);
    articleUrls = articoli
      .filter(a => a.lang !== 'en')
      .map(a => url(
        `/it/${a.slug}`,
        a.data_pubblicazione ? new Date(a.data_pubblicazione).toISOString().slice(0, 10) : today
      ));
  } catch (e) {
    console.warn('[sitemap] Directus fetch failed, articles omitted:', e);
  }

  const staticUrls = [...staticPages, ...categoryPages, ...rubrichePages].map(p => url(p.path));

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
