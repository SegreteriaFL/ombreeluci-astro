/**
 * og-image.ts
 *
 * Normalizza l'URL di `og:image` / `twitter:image`.
 *
 * Gli scraper social (Facebook/Meta, LinkedIn, WhatsApp) NON elaborano WebP,
 * AVIF o SVG: il debugger di Facebook risponde "Immagine danneggiata — non è
 * stato possibile elaborare come un'immagine l'URL og:image fornito".
 * Il sito serve invece tutte le immagini in WebP, che per il browser è corretto.
 * Qui si traduce quell'URL nella variante accettata dagli scraper, senza
 * toccare l'immagine mostrata in pagina.
 *
 * Regole:
 *  - asset Directus (`/assets/<file-id>`) → stessa immagine in JPEG 1200x630
 *    (dimensione raccomandata per la card social);
 *  - file statico già JPEG/PNG/GIF → URL assoluto, invariato;
 *  - qualsiasi altro caso (WebP/SVG/AVIF statico, URL relativo non risolvibile,
 *    valore vuoto) → immagine OG di default del sito.
 *
 * Deve restare l'unico punto in cui si costruisce un og:image: i componenti
 * passano l'URL dell'immagine "normale" e BaseHead lo converte.
 */

const SITE_ORIGIN = 'https://ombreeluci.it';

/** Card social di default (1200x630 JPEG) usata quando non c'è un'immagine valida. */
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/images/og-default.jpg`;

/** Formati che gli scraper social sanno elaborare. */
const OG_SAFE_EXT = /\.(jpe?g|png|gif)$/i;

/** Un solo segmento dopo `/assets/`: è l'id file Directus, trasformabile via query. */
const DIRECTUS_ASSET_PATH = /^\/assets\/[^/]+$/;

export function toOgImageUrl(src: string | null | undefined, site?: URL | string): string {
  const raw = typeof src === 'string' ? src.trim() : '';
  if (!raw) return DEFAULT_OG_IMAGE;

  let origin = SITE_ORIGIN;
  try {
    if (site) origin = new URL(String(site)).origin;
  } catch {
    /* site malformato: si resta su SITE_ORIGIN */
  }

  let url: URL;
  try {
    url = new URL(raw, `${origin}/`);
  } catch {
    return DEFAULT_OG_IMAGE;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return DEFAULT_OG_IMAGE;

  // Asset Directus: si richiede la trasformazione in JPEG invece del WebP.
  if (url.origin !== origin && DIRECTUS_ASSET_PATH.test(url.pathname)) {
    url.search = '';
    url.searchParams.set('width', '1200');
    url.searchParams.set('height', '630');
    url.searchParams.set('fit', 'cover');
    url.searchParams.set('format', 'jpg');
    url.searchParams.set('quality', '82');
    return url.href;
  }

  // File statico: nessuna trasformazione possibile, si accetta solo se già compatibile.
  return OG_SAFE_EXT.test(url.pathname) ? url.href : DEFAULT_OG_IMAGE;
}
