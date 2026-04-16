/**
 * Sitemap EN: /sitemap-en.xml
 *
 * Lista tutti gli articoli EN con URL canonici /en/[slug-senza-en]/
 * più la pagina indice /en/.
 *
 * Fase 2 i18n — generato a build-time da articoli_snapshot.
 */
import type { APIRoute } from 'astro';
import { getAllArticoliBuild } from '../lib/articoli-build';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = (site?.toString() ?? 'https://ombreeluci.it').replace(/\/$/, '');

  const allArticles = await getAllArticoliBuild();
  const enArticles = allArticles.filter((a) => a.lang === 'en');

  // Converti slug Directus (con -en) in URL slug (senza -en)
  function toEnUrlSlug(slug: string): string {
    return slug.endsWith('-en') ? slug.slice(0, -3) : slug;
  }

  const entries = enArticles.map((a) => {
    const urlSlug = toEnUrlSlug(a.slug);
    const lastmod = a.data_pubblicazione
      ? new Date(a.data_pubblicazione).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    return `  <url>\n    <loc>${siteUrl}/en/${urlSlug}/</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
  });

  // Aggiungi la pagina indice EN
  const indexEntry = `  <url>\n    <loc>${siteUrl}/en/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${indexEntry}
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=86400',
    },
  });
};
