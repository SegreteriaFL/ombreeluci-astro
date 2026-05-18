/**
 * Sitemap EN: /sitemap-en.xml
 *
 * Copre: homepage EN + rubriche EN + categorie EN + articoli EN
 *        + autori EN + numeri archivio EN + diari EN + focus EN.
 */
import type { APIRoute } from 'astro';
import { getAllArticoliBuild } from '../lib/articoli-build';
import { getAllAutori, getAllNumeriRivista, getAllSerieDiari, getVerticali } from '../lib/directus';
import rubricheData from '../data/rubriche.json';
import categorieData from '../data/categorie.json';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = (site?.toString() ?? 'https://ombreeluci.it').replace(/\/$/, '');
  const today = new Date().toISOString().split('T')[0];

  function urlEntry(loc: string, opts?: { lastmod?: string; changefreq?: string; priority?: string }): string {
    const lastmod = opts?.lastmod ? `\n    <lastmod>${opts.lastmod}</lastmod>` : '';
    const freq = opts?.changefreq ? `\n    <changefreq>${opts.changefreq}</changefreq>` : '';
    const prio = opts?.priority ? `\n    <priority>${opts.priority}</priority>` : '';
    return `  <url>\n    <loc>${siteUrl}${loc}</loc>${lastmod}${freq}${prio}\n  </url>`;
  }

  // Indice EN
  const indexEntry = urlEntry('/en/', { changefreq: 'weekly', priority: '0.8' });

  // Rubriche / Sections EN
  const sectionsEntries = rubricheData.map((r) =>
    urlEntry(`/en/sections/${r.en_slug}/`, { changefreq: 'weekly', priority: '0.7' })
  );

  // Categorie EN (escludi da-categorizzare — categoria interna di workflow)
  const categoryEntries = (categorieData.categorie as { slug: string; en_slug: string }[])
    .filter((c) => c.slug !== 'da-categorizzare')
    .map((c) => urlEntry(`/en/category/${c.en_slug}/`, { changefreq: 'weekly', priority: '0.7' }));

  // Articoli EN
  let articleEntries: string[] = [];
  try {
    const allArticles = await getAllArticoliBuild();
    articleEntries = allArticles
      .filter((a) => a.lang === 'en')
      .map((a) => {
        const urlSlug = a.slug.endsWith('-en') ? a.slug.slice(0, -3) : a.slug;
        const lastmod = a.data_pubblicazione
          ? new Date(a.data_pubblicazione).toISOString().split('T')[0]
          : today;
        return urlEntry(`/en/${urlSlug}/`, { lastmod, changefreq: 'monthly', priority: '0.7' });
      });
  } catch (e) {
    console.warn('[sitemap-en] articoli fetch failed:', e);
  }

  // Autori EN (stesso slug IT)
  let autoriEntries: string[] = [];
  try {
    const autori = await getAllAutori();
    autoriEntries = autori
      .filter((a) => a.slug)
      .map((a) => urlEntry(`/en/authors/${a.slug}/`, { changefreq: 'monthly', priority: '0.5' }));
  } catch (e) {
    console.warn('[sitemap-en] autori fetch failed:', e);
  }

  // Numeri rivista EN
  let archivioEntries: string[] = [];
  try {
    const numeri = await getAllNumeriRivista();
    archivioEntries = numeri
      .filter((n) => n.id_numero)
      .map((n) => urlEntry(`/en/archive/${n.id_numero}/`, { changefreq: 'monthly', priority: '0.5' }));
  } catch (e) {
    console.warn('[sitemap-en] numeri fetch failed:', e);
  }

  // Diari EN (stesso slug IT)
  let diariEntries: string[] = [];
  try {
    const diari = await getAllSerieDiari();
    diariEntries = diari
      .filter((d) => d.slug)
      .map((d) => urlEntry(`/en/diaries/${d.slug}/`, { changefreq: 'monthly', priority: '0.6' }));
  } catch (e) {
    console.warn('[sitemap-en] diari fetch failed:', e);
  }

  // Focus EN (slug_en da verticali)
  let focusEntries: string[] = [];
  try {
    const verticali = await getVerticali();
    focusEntries = verticali
      .filter((v) => v.slug_en)
      .map((v) => urlEntry(`/en/focus/${v.slug_en}/`, { changefreq: 'monthly', priority: '0.6' }));
  } catch (e) {
    console.warn('[sitemap-en] verticali fetch failed:', e);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${indexEntry}
${sectionsEntries.join('\n')}
${categoryEntries.join('\n')}
${autoriEntries.join('\n')}
${archivioEntries.join('\n')}
${diariEntries.join('\n')}
${focusEntries.join('\n')}
${articleEntries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=86400',
    },
  });
};
