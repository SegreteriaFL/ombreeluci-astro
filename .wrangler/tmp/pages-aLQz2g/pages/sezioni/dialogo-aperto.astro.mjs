globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_iVPiOiwI.mjs';
import { $ as $$ArticoliRullo } from '../../chunks/ArticoliRullo_DaW5-kVn.mjs';
import { a as getAllArticoli, f as getCategoriaDescrizione } from '../../chunks/directus_BUvoij4J.mjs';
export { renderers } from '../../renderers.mjs';

const $$DialogoAperto = createComponent(async ($$result, $$props, $$slots) => {
  const [allArticles, catMeta] = await Promise.all([
    getAllArticoli(),
    getCategoriaDescrizione("dialogo-aperto")
  ]);
  const descrizione = catMeta?.descrizione ?? "Lo spazio del confronto aperto tra lettori, famiglie e persone con disabilit\xE0. Domande, risposte e riflessioni condivise sulle pagine di Ombre e Luci.";
  const articoli = allArticles.filter((a) => a.lang !== "en" && a.serie?.slug === "dialogo-aperto").sort((a, b) => {
    const tA = a.data_pubblicazione ? new Date(a.data_pubblicazione).getTime() : 0;
    const tB = b.data_pubblicazione ? new Date(b.data_pubblicazione).getTime() : 0;
    return tB - tA;
  });
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Dialogo aperto", "description": "La rubrica Dialogo aperto di Ombre e Luci: lettori, famiglie e persone con disabilit\xE0 a confronto aperto.", "noindex": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main"> <div class="container"> ${renderComponent($$result2, "ArticoliRullo", $$ArticoliRullo, { "title": "Dialogo aperto", "description": descrizione, "articoli": articoli })} </div> </main> ` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/sezioni/dialogo-aperto.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/sezioni/dialogo-aperto.astro";
const $$url = "/sezioni/dialogo-aperto";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$DialogoAperto,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
