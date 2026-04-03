export const prerender = false;

import type { APIRoute } from 'astro';
import { getArticoloBySlug, directusCredsFromAstroLocals } from '../../lib/directus';

/**
 * Endpoint diagnostico temporaneo — DA RIMUOVERE dopo la diagnosi.
 * Uso: /api/debug-blog?slug=ombre-e-luci
 * Ritorna JSON con il risultato o l'errore esatto di ogni step.
 */
export const GET: APIRoute = async ({ url, locals }) => {
  const slug = url.searchParams.get('slug') ?? 'ombre-e-luci';
  const report: Record<string, unknown> = { slug };

  // Step 1: creds da locals
  try {
    const creds = directusCredsFromAstroLocals(locals);
    report.creds_url = creds?.url ?? '(not in locals — usando fallback)';
    report.creds_token_present = typeof creds?.token === 'string' && creds.token.length > 0;
    report.locals_keys = Object.keys((locals as any)?.runtime?.env ?? {});

    // Step 2: fetch articolo
    const articolo = await getArticoloBySlug(slug, creds);
    report.articolo_found = articolo !== null;
    if (articolo) {
      report.articolo_id = articolo.id;
      report.articolo_titolo = articolo.titolo;
      report.articolo_corpo_len = articolo.corpo?.length ?? 0;
    }

    // Step 3: fetch correlati.json
    const origin = url.origin;
    report.origin = origin;
    try {
      const correlatiRes = await fetch(`${origin}/correlati.json`);
      report.correlati_status = correlatiRes.status;
      report.correlati_ok = correlatiRes.ok;
      if (correlatiRes.ok) {
        const correlatiMap = await correlatiRes.json() as Record<string, string[]>;
        const slugs = correlatiMap[slug] ?? [];
        report.correlati_slugs_count = slugs.length;
        report.correlati_slugs_first3 = slugs.slice(0, 3);
      }
    } catch (e) {
      report.correlati_error = String(e);
    }

  } catch (e) {
    report.error = String(e);
    report.error_stack = e instanceof Error ? e.stack : undefined;
  }

  return new Response(JSON.stringify(report, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
