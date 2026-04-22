globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_iVPiOiwI.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Cerca = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Cerca", "description": "Cerca articoli, autori e temi nella rivista Ombre e Luci", "noindex": true, "data-astro-cid-hl4accb2": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main" data-astro-cid-hl4accb2> <div class="container" style="padding-top: 2rem; padding-bottom: 4rem;" data-astro-cid-hl4accb2> <h1 data-astro-cid-hl4accb2>Cerca</h1> <p style="color: var(--text-secondary); margin-bottom: 2rem;" data-astro-cid-hl4accb2>Cerca tra oltre 3500 articoli della rivista Ombre e Luci dal 1983 ad oggi.</p> <div id="search" data-astro-cid-hl4accb2></div> </div> </main>  ` })} `;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/cerca.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/cerca.astro";
const $$url = "/cerca";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Cerca,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
