import { defineMiddleware } from 'astro:middleware';
import redirectsLegacy from './data/redirects-legacy.json';

const REDIRECTS: Record<string, string> = redirectsLegacy;

// Regex per redirect WordPress date-based: /YYYY/MM/DD/slug/ → /blog/slug/
// Copre 15.582 URL WordPress, gestita qui invece che nel CF Worker esterno.
const DATE_PATH_RE = /^\/\d{4}\/\d{2}\/\d{2}\/(.+)$/;

export const onRequest = defineMiddleware(({ url, redirect }, next) => {
  const path = url.pathname;

  // Rule C+D: mappature arbitrarie slug legacy (1.001 voci)
  const target = REDIRECTS[path];
  if (target) {
    return redirect('https://ombreeluci.it' + target, 301);
  }

  // Rule B: /YYYY/MM/DD/slug/ → /blog/slug/
  const dateMatch = path.match(DATE_PATH_RE);
  if (dateMatch) {
    return redirect('https://ombreeluci.it/blog/' + dateMatch[1], 301);
  }

  return next();
});
