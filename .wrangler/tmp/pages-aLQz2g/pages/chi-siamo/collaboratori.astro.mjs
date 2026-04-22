globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_iVPiOiwI.mjs';
import { $ as $$AboutSidebar } from '../../chunks/AboutSidebar_CwgHmTdu.mjs';
/* empty css                                            */
export { renderers } from '../../renderers.mjs';

const $$Collaboratori = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Collaboratori", "noindex": true, "data-astro-cid-u3yobafi": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main" data-astro-cid-u3yobafi> <div class="about-layout container" data-astro-cid-u3yobafi> ${renderComponent($$result2, "AboutSidebar", $$AboutSidebar, { "active": "collaboratori", "data-astro-cid-u3yobafi": true })} <div class="about-page-content" data-astro-cid-u3yobafi> <h1 data-astro-cid-u3yobafi>Collaboratori</h1> <p data-astro-cid-u3yobafi>Giornalisti, esperti e collaboratori che contribuiscono con i loro articoli e la loro competenza alla rivista Ombre e Luci.</p> </div> </div> </main>  ` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/collaboratori.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/collaboratori.astro";
const $$url = "/chi-siamo/collaboratori";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Collaboratori,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
