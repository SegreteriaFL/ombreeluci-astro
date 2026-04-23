globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_iVPiOiwI.mjs';
import { $ as $$ArticoliRullo } from '../../chunks/ArticoliRullo_DaW5-kVn.mjs';
import { a as getAllArticoli } from '../../chunks/directus_BUvoij4J.mjs';
export { renderers } from '../../renderers.mjs';

const $$WebOnly = createComponent(async ($$result, $$props, $$slots) => {
  const allArticles = await getAllArticoli();
  const articoli = allArticles.filter((a) => a.lang !== "en" && a.numero_rivista == null).sort((a, b) => {
    const tA = a.data_pubblicazione ? new Date(a.data_pubblicazione).getTime() : 0;
    const tB = b.data_pubblicazione ? new Date(b.data_pubblicazione).getTime() : 0;
    return tB - tA;
  });
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Articoli solo online", "description": "Articoli pubblicati solo online su Ombre e Luci.", "noindex": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main"> <div class="container"> ${renderComponent($$result2, "ArticoliRullo", $$ArticoliRullo, { "title": "Pubblicato online", "description": "Articoli pubblicati solo sul sito, senza numero di rivista cartacea.", "articoli": articoli, "pageSize": 24 })} </div> </main> ` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/web-only.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/web-only.astro";
const $$url = "/archivio/web-only";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$WebOnly,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
