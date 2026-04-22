globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_iVPiOiwI.mjs';
import { $ as $$AboutSidebar } from '../../chunks/AboutSidebar_CwgHmTdu.mjs';
/* empty css                                                */
export { renderers } from '../../renderers.mjs';

const $$RedazioneStorica = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Redazione storica", "noindex": true, "data-astro-cid-sh4ro4zp": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main" data-astro-cid-sh4ro4zp> <div class="about-layout container" data-astro-cid-sh4ro4zp> ${renderComponent($$result2, "AboutSidebar", $$AboutSidebar, { "active": "redazione-storica", "data-astro-cid-sh4ro4zp": true })} <div class="about-page-content" data-astro-cid-sh4ro4zp> <h1 data-astro-cid-sh4ro4zp>La Redazione storica</h1> <p data-astro-cid-sh4ro4zp>La storia della redazione di Ombre e Luci e i volti che hanno contribuito alla rivista nel corso degli anni.</p> </div> </div> </main>  ` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/redazione-storica.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/redazione-storica.astro";
const $$url = "/chi-siamo/redazione-storica";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$RedazioneStorica,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
