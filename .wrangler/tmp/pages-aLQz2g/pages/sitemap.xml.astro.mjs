globalThis.process ??= {}; globalThis.process.env ??= {};
import { a as getAllArticoli } from '../chunks/directus_BUvoij4J.mjs';
import { d as getAllCategorySlugs } from '../chunks/taxonomy_CiRm90XT.mjs';
export { renderers } from '../renderers.mjs';

const prerender = true;
const SITE = "https://ombreeluci.it";
function url(path, lastmod) {
  const loc = `<loc>${SITE}${path}</loc>`;
  const mod = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
  return `<url>${loc}${mod}</url>`;
}
const GET = async () => {
  const staticPages = [
    { path: "/" },
    { path: "/archivio" },
    { path: "/autori" },
    { path: "/chi-siamo" },
    { path: "/sostienici" },
    { path: "/newsletter" },
    { path: "/sezioni/diari" },
    { path: "/sezioni/dialogo-aperto" }
  ];
  const categorySlugs = getAllCategorySlugs();
  const categoryPages = categorySlugs.map((s) => ({ path: `/categoria/${s}` }));
  let articleUrls = [];
  try {
    const articoli = await getAllArticoli();
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    articleUrls = articoli.filter((a) => a.lang !== "en").map((a) => url(
      `/blog/${a.slug}`,
      a.data_pubblicazione ? new Date(a.data_pubblicazione).toISOString().slice(0, 10) : today
    ));
  } catch (e) {
    console.warn("[sitemap] Directus fetch failed, articles omitted:", e);
  }
  const staticUrls = [...staticPages, ...categoryPages].map((p) => url(p.path));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join("\n")}
${articleUrls.join("\n")}
</urlset>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
