/**
 * rss-items.ts — mappa ArticoloFull[] in item RSS, condiviso tra feed IT ed EN.
 * Riusa getAllArticoliBuild() (stessa fonte/fallback delle sitemap).
 */
import type { ArticoloFull } from './directus';
import { getAllArticoliBuild } from './articoli-build';

const SITE = 'https://ombreeluci.it';
const MAX_ITEMS = 50;

export interface RssItemData {
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  author?: string;
  categories?: string[];
}

function toArticleUrlSlugEn(slug: string): string {
  return slug.endsWith('-en') ? slug.slice(0, -3) : slug;
}

export async function getRssItems(lang: 'it' | 'en'): Promise<RssItemData[]> {
  const articoli = await getAllArticoliBuild();

  return articoli
    .filter((a): a is ArticoloFull & { data_pubblicazione: string } =>
      a.lang === lang && a.stato === 'published' && !!a.data_pubblicazione
    )
    .sort((a, b) => new Date(b.data_pubblicazione).getTime() - new Date(a.data_pubblicazione).getTime())
    .slice(0, MAX_ITEMS)
    .map((a) => {
      const urlSlug = lang === 'en' ? toArticleUrlSlugEn(a.slug) : a.slug;
      const basePath = lang === 'en' ? `/en/${urlSlug}/` : `/it/${urlSlug}/`;
      return {
        title: a.titolo,
        description: a.seo_description ?? a.sottotitolo ?? '',
        link: `${SITE}${basePath}`,
        pubDate: new Date(a.data_pubblicazione),
        author: a.autore?.nome_completo,
        categories: a.categoria_menu ? [a.categoria_menu] : undefined,
      };
    });
}
