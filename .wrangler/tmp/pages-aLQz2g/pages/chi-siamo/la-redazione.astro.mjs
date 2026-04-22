globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_iVPiOiwI.mjs';
import { $ as $$AboutSidebar } from '../../chunks/AboutSidebar_CwgHmTdu.mjs';
/* empty css                                           */
export { renderers } from '../../renderers.mjs';

const $$LaRedazione = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "La Redazione", "noindex": true, "data-astro-cid-dapx3gbk": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main" data-astro-cid-dapx3gbk> <div class="about-layout container" data-astro-cid-dapx3gbk> ${renderComponent($$result2, "AboutSidebar", $$AboutSidebar, { "active": "la-redazione", "data-astro-cid-dapx3gbk": true })} <div class="about-page-content" data-astro-cid-dapx3gbk> <h1 data-astro-cid-dapx3gbk>La Redazione</h1> <p data-astro-cid-dapx3gbk>La redazione di Ombre e Luci è composta da un team di professionisti, volontari e collaboratori che condividono la passione per il giornalismo di qualità e l'impegno per i temi dell'inclusione e della disabilità.</p> <p data-astro-cid-dapx3gbk>Collaborano con la rivista autori, giornalisti, esperti e testimoni che portano la loro esperienza e competenza per offrire ai lettori contenuti sempre attuali e di valore.</p> </div> </div> </main>  ` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/la-redazione.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/la-redazione.astro";
const $$url = "/chi-siamo/la-redazione";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$LaRedazione,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
