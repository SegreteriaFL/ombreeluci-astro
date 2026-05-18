/**
 * sitemap.xml — generato a build-time da Directus.
 * Copre: pagine statiche + categorie + rubriche + articoli IT pubblicati
 *        + autori + numeri rivista + diari + focus (verticali).
 * ⚠ robots.txt blocca Googlebot finché noindex è attivo — questo file
 *   è pronto per il cutover DNS/lancio quando robots.txt verrà aperto.
 */
export const prerender = true;

import type { APIRoute } from 'astro';
import { getAllArticoliBuild } from '../lib/articoli-build';
import { getAllAutori, getAllNumeriRivista, getAllSerieDiari, getVerticali } from '../lib/directus';
import { getAllCategorySlugs } from '../config/taxonomy.js';
import rubricheData from '../data/rubriche.json';

const SITE = 'https://ombreeluci.it';

function url(path: string, lastmod?: string): string {
  const loc = `<loc>${SITE}${path}</loc>`;
  const mod = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
  return `<url>${loc}${mod}</url>`;
}

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().slice(0, 10);

  // 1. Pagine statiche
  const staticPages = [
    { path: '/' },
    { path: '/it/archivio/' },
    { path: '/it/autori/' },
    { path: '/it/chi-siamo/' },
    { path: '/it/sostienici/' },
    { path: '/it/newsletter/' },
  ];

  // Rubriche IT
  const rubrichePages = rubricheData.map((r) => ({ path: `/it/rubriche/${r.slug}/` }));

  // 2. Categorie
  const categorySlugs: string[] = getAllCategorySlugs();
  const categoryPages = categorySlugs.map((s: string) => ({ path: `/it/categoria/${s}/` }));

  // 3. Articoli IT pubblicati
  let articleUrls: string[] = [];
  try {
    const articoli = await getAllArticoliBuild();
    articleUrls = articoli
      .filter((a) => a.lang !== 'en')
      .map((a) =>
        url(
          `/it/${a.slug}/`,
          a.data_pubblicazione ? new Date(a.data_pubblicazione).toISOString().slice(0, 10) : today
        )
      );
  } catch (e) {
    console.warn('[sitemap] articoli fetch failed:', e);
  }

  // 4. Pagine autore IT
  let autoriUrls: string[] = [];
  try {
    const autori = await getAllAutori();
    autoriUrls = autori
      .filter((a) => a.slug)
      .map((a) => url(`/it/autori/${a.slug}/`, today));
  } catch (e) {
    console.warn('[sitemap] autori fetch failed:', e);
  }

  // 5. Numeri rivista IT
  let numeriUrls: string[] = [];
  try {
    const numeri = await getAllNumeriRivista();
    numeriUrls = numeri
      .filter((n) => n.id_numero)
      .map((n) => url(`/it/archivio/${n.id_numero}/`, today));
  } catch (e) {
    console.warn('[sitemap] numeri fetch failed:', e);
  }

  // 6. Diari IT
  let diariUrls: string[] = [];
  try {
    const diari = await getAllSerieDiari();
    diariUrls = diari
      .filter((d) => d.slug)
      .map((d) => url(`/it/diari/${d.slug}/`, today));
  } catch (e) {
    console.warn('[sitemap] diari fetch failed:', e);
  }

  // 7. Focus / Verticali IT
  let focusUrls: string[] = [];
  try {
    const verticali = await getVerticali();
    focusUrls = verticali
      .filter((v) => v.slug)
      .map((v) => url(`/it/focus/${v.slug}/`, today));
  } catch (e) {
    console.warn('[sitemap] verticali fetch failed:', e);
  }

  const staticUrls = [...staticPages, ...categoryPages, ...rubrichePages].map((p) => url(p.path));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join('\n')}
${autoriUrls.join('\n')}
${numeriUrls.join('\n')}
${diariUrls.join('\n')}
${focusUrls.join('\n')}
${articleUrls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
