/**
 * rss-items.ts — mappa ArticoloFull[] in item RSS, condiviso tra feed IT ed EN.
 * Riusa getAllArticoliBuild() (stessa fonte/fallback delle sitemap).
 */
import type { ArticoloFull } from './directus';
import { getDirectusAssetUrl } from './directus';
import { getAllArticoliBuild } from './articoli-build';

const SITE = 'https://ombreeluci.it';
const MAX_ITEMS = 50;
const IMAGE_WIDTH = 1200;

export interface RssItemData {
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  author?: string;
  categories?: string[];
  content?: string;
  enclosure?: { url: string; length: number; type: string };
}

function toArticleUrlSlugEn(slug: string): string {
  return slug.endsWith('-en') ? slug.slice(0, -3) : slug;
}

function escapeHtmlAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
      const description = a.seo_description ?? a.sottotitolo ?? '';
      const imageUrl = a.immagine_copertina?.id
        ? getDirectusAssetUrl(a.immagine_copertina.id, { width: IMAGE_WIDTH, fit: 'cover', format: 'jpg', quality: 82 })
        : null;
      const imageHtml = imageUrl ? `<img src="${escapeHtmlAttr(imageUrl)}" alt="${escapeHtmlAttr(a.titolo)}" />` : '';

      return {
        title: a.titolo,
        description,
        link: `${SITE}${basePath}`,
        pubDate: new Date(a.data_pubblicazione),
        author: a.autore?.nome_completo,
        categories: a.categoria_menu ? [a.categoria_menu] : undefined,
        content: `${imageHtml}<p>${description}</p>`,
        enclosure: imageUrl ? { url: imageUrl, length: 0, type: 'image/jpeg' } : undefined,
      };
    });
}
