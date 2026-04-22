globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_iVPiOiwI.mjs';
import { $ as $$AboutSidebar } from '../../chunks/AboutSidebar_CwgHmTdu.mjs';
/* empty css                                                    */
export { renderers } from '../../renderers.mjs';

const $$HannoScrittoPerNoi = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Hanno scritto per noi", "noindex": true, "data-astro-cid-uh3e5lun": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main" data-astro-cid-uh3e5lun> <div class="about-layout container" data-astro-cid-uh3e5lun> ${renderComponent($$result2, "AboutSidebar", $$AboutSidebar, { "active": "hanno-scritto-per-noi", "data-astro-cid-uh3e5lun": true })} <div class="about-page-content" data-astro-cid-uh3e5lun> <h1 data-astro-cid-uh3e5lun>Hanno scritto per noi</h1> <p data-astro-cid-uh3e5lun>Autori, testimoni e ospiti che hanno contribuito con i loro scritti alle pagine di Ombre e Luci.</p> </div> </div> </main>  ` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/hanno-scritto-per-noi.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/hanno-scritto-per-noi.astro";
const $$url = "/chi-siamo/hanno-scritto-per-noi";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$HannoScrittoPerNoi,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
