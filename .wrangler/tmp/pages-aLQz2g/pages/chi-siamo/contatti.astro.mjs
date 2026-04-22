globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_iVPiOiwI.mjs';
import { $ as $$AboutSidebar } from '../../chunks/AboutSidebar_CwgHmTdu.mjs';
/* empty css                                       */
export { renderers } from '../../renderers.mjs';

const $$Contatti = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Contatti", "noindex": true, "data-astro-cid-zoowxpvm": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main" data-astro-cid-zoowxpvm> <div class="about-layout container" data-astro-cid-zoowxpvm> ${renderComponent($$result2, "AboutSidebar", $$AboutSidebar, { "active": "contatti", "data-astro-cid-zoowxpvm": true })} <div class="about-page-content" data-astro-cid-zoowxpvm> <h1 data-astro-cid-zoowxpvm>Info e contatti</h1> <p data-astro-cid-zoowxpvm>Per informazioni, abbonamenti o collaborazioni puoi contattarci attraverso i canali ufficiali della rivista.</p> <p data-astro-cid-zoowxpvm><strong data-astro-cid-zoowxpvm>Direzione, redazione e amministrazione:</strong><br data-astro-cid-zoowxpvm>Via dei Cessati Spiriti 3, 00185 Roma.</p> <p data-astro-cid-zoowxpvm>Siamo sempre disponibili per rispondere alle tue domande e per accogliere nuove proposte e contributi.</p> </div> </div> </main>  ` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/contatti.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/contatti.astro";
const $$url = "/chi-siamo/contatti";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Contatti,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
