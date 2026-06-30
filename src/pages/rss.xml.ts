/**
 * RSS feed IT — ultimi 50 articoli pubblicati, ordinati per data.
 * Dati: getAllArticoliBuild() via src/lib/rss-items.ts (stessa fonte delle sitemap).
 */
export const prerender = true;

import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getRssItems } from '../lib/rss-items';

export const GET: APIRoute = async (context) => {
  const items = await getRssItems('it');

  return rss({
    title: 'Ombre e Luci',
    description: 'Storie, riflessioni e cultura sulla fragilità e sulla dignità della persona. Dal 1983.',
    site: context.site ?? 'https://ombreeluci.it',
    items,
    customData: '<language>it-IT</language>',
  });
};
