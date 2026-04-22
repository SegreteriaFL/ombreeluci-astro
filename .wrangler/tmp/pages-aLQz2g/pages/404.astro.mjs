globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, a as addAttribute } from '../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_iVPiOiwI.mjs';
import { b as getThemesWithSlugs } from '../chunks/taxonomy_CiRm90XT.mjs';
/* empty css                               */
export { renderers } from '../renderers.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  const temi = getThemesWithSlugs().filter((t) => t.nomeCompleto !== "Personaggi che ispirano");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Pagina non trovata \u2014 Ombre e Luci", "noindex": true, "data-astro-cid-zetdm5md": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main" data-astro-cid-zetdm5md> <div class="nf-container" data-astro-cid-zetdm5md> <div class="nf-hero" data-astro-cid-zetdm5md> <p class="nf-code" data-astro-cid-zetdm5md>404</p> <h1 class="nf-title" data-astro-cid-zetdm5md>Pagina non trovata</h1> <p class="nf-sub" data-astro-cid-zetdm5md>
La pagina che cerchi potrebbe essere stata spostata o rimossa.<br data-astro-cid-zetdm5md>
Se venivi da un vecchio link WordPress, prova a cercare l'articolo nell'archivio.
</p> <div class="nf-actions" data-astro-cid-zetdm5md> <a href="/" class="nf-btn nf-btn--primary" data-astro-cid-zetdm5md>Torna all'homepage</a> <a href="/archivio" class="nf-btn nf-btn--ghost" data-astro-cid-zetdm5md>Sfoglia l'archivio</a> <a href="/cerca" class="nf-btn nf-btn--ghost" data-astro-cid-zetdm5md>Cerca →</a> </div> </div> <section class="nf-temi" data-astro-cid-zetdm5md> <h2 class="nf-temi-title" data-astro-cid-zetdm5md>Oppure esplora per tema</h2> <ul class="nf-temi-list" data-astro-cid-zetdm5md> ${temi.map((t) => renderTemplate`<li data-astro-cid-zetdm5md> <a${addAttribute(`/categoria/${t.slug}`, "href")} class="nf-tema-link" data-astro-cid-zetdm5md>${t.nome}</a> </li>`)} </ul> </section> </div> </main> ` })} `;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/404.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
