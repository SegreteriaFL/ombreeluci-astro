globalThis.process ??= {}; globalThis.process.env ??= {};
import { d as directusCredsFromAstroLocals, g as getArticoloBySlug } from '../../chunks/directus_B0n0XETK.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async ({ url, locals }) => {
  const slug = url.searchParams.get("slug") ?? "ombre-e-luci";
  const report = { slug };
  try {
    const creds = directusCredsFromAstroLocals(locals);
    report.creds_url = creds?.url ?? "(not in locals — usando fallback)";
    report.creds_token_present = typeof creds?.token === "string" && creds.token.length > 0;
    report.locals_keys = Object.keys(locals?.runtime?.env ?? {});
    const articolo = await getArticoloBySlug(slug, creds);
    report.articolo_found = articolo !== null;
    if (articolo) {
      report.articolo_id = articolo.id;
      report.articolo_titolo = articolo.titolo;
      report.articolo_corpo_len = articolo.corpo?.length ?? 0;
    }
    const origin = url.origin;
    report.origin = origin;
    try {
      const correlatiRes = await fetch(`${origin}/correlati.json`);
      report.correlati_status = correlatiRes.status;
      report.correlati_ok = correlatiRes.ok;
      if (correlatiRes.ok) {
        const correlatiMap = await correlatiRes.json();
        const slugs = correlatiMap[slug] ?? [];
        report.correlati_slugs_count = slugs.length;
        report.correlati_slugs_first3 = slugs.slice(0, 3);
      }
    } catch (e) {
      report.correlati_error = String(e);
    }
  } catch (e) {
    report.error = String(e);
    report.error_stack = e instanceof Error ? e.stack : void 0;
  }
  return new Response(JSON.stringify(report, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
