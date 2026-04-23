globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_iVPiOiwI.mjs';
import { $ as $$AboutSidebar } from '../../chunks/AboutSidebar_CwgHmTdu.mjs';
/* empty css                                         */
export { renderers } from '../../renderers.mjs';

const $$LaRivista = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "La Rivista", "noindex": true, "data-astro-cid-puphgc7w": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main" data-astro-cid-puphgc7w> <div class="about-layout container" data-astro-cid-puphgc7w> ${renderComponent($$result2, "AboutSidebar", $$AboutSidebar, { "active": "la-rivista", "data-astro-cid-puphgc7w": true })} <div class="about-page-content" data-astro-cid-puphgc7w> <h1 data-astro-cid-puphgc7w>La Rivista</h1> <p data-astro-cid-puphgc7w>Ombre e Luci è una rivista che da oltre quarant'anni accompagna le persone con disabilità, le loro famiglie e le comunità che li accolgono, offrendo riflessioni, testimonianze e strumenti per vivere insieme la diversità come una ricchezza.</p> <p data-astro-cid-puphgc7w>Attraverso articoli, interviste, recensioni e approfondimenti, la rivista esplora temi legati alla disabilità, all'inclusione, alla spiritualità e alla vita comunitaria.</p> </div> </div> </main>  ` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/la-rivista.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/la-rivista.astro";
const $$url = "/chi-siamo/la-rivista";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$LaRivista,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
