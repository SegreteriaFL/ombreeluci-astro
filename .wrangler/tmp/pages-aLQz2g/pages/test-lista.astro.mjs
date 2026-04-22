globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, e as renderHead, a as addAttribute, r as renderTemplate } from '../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$ViewTransitions } from '../chunks/ViewTransitions_OueHrIci.mjs';
import { $ as $$Header, a as $$Footer } from '../chunks/Footer_pGzeraaC.mjs';
/* empty css                                    */
import { a as getAllArticoli } from '../chunks/directus_BUvoij4J.mjs';
/* empty css                                      */
export { renderers } from '../renderers.mjs';

const $$TestLista = createComponent(async ($$result, $$props, $$slots) => {
  let allArticlesList = [];
  try {
    const allArticles = await getAllArticoli();
    allArticlesList = allArticles.filter((a) => a.data_pubblicazione != null).sort((a, b) => new Date(b.data_pubblicazione).getTime() - new Date(a.data_pubblicazione).getTime());
  } catch (error) {
    console.error("Errore caricamento articoli:", error);
  }
  return renderTemplate`<html lang="it" data-astro-cid-hs2xiw36> <head><meta name="robots" content="noindex, nofollow">${renderComponent($$result, "ViewTransitions", $$ViewTransitions, { "data-astro-cid-hs2xiw36": true })}<meta charset="utf-8"><link rel="icon" type="image/png" href="/favicon.png"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Lista Completa Articoli - Ombre e Luci</title>${renderHead()}</head> <body data-astro-cid-hs2xiw36> ${renderComponent($$result, "Header", $$Header, { "data-astro-cid-hs2xiw36": true })} <div class="test-lista-main" data-astro-cid-hs2xiw36> <h1 data-astro-cid-hs2xiw36>Lista Completa Articoli</h1> <div class="stats" data-astro-cid-hs2xiw36>
Totale articoli: ${allArticlesList.length} <br data-astro-cid-hs2xiw36> <a href="/" style="color: #0066cc; text-decoration: underline; margin-top: 0.5rem; display: inline-block;" data-astro-cid-hs2xiw36>← Torna all'archivio</a> </div> <ol class="article-list" data-astro-cid-hs2xiw36> ${allArticlesList.map((a) => renderTemplate`<li class="article-item" data-astro-cid-hs2xiw36> <a${addAttribute(`/blog/${a.slug}`, "href")} class="article-link" data-astro-cid-hs2xiw36> ${a.titolo || "Titolo mancante"} </a> <span class="article-meta" data-astro-cid-hs2xiw36>
(${a.data_pubblicazione ? new Date(a.data_pubblicazione).getFullYear() : "?"}) - ${a.autore?.nome_completo || "Autore sconosciuto"} - Cluster: ${a.cluster_id} </span> </li>`)} </ol> </div> ${renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-hs2xiw36": true })} </body></html>`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/test-lista.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/test-lista.astro";
const $$url = "/test-lista";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TestLista,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
