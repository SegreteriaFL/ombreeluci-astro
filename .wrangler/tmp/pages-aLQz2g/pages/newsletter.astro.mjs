globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, a as addAttribute } from '../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_iVPiOiwI.mjs';
import { b as getThemesWithSlugs } from '../chunks/taxonomy_CiRm90XT.mjs';
import { a as getAllArticoli } from '../chunks/directus_BUvoij4J.mjs';
/* empty css                                      */
export { renderers } from '../renderers.mjs';

const $$Newsletter = createComponent(async ($$result, $$props, $$slots) => {
  const temi = getThemesWithSlugs().filter((t) => t.nomeCompleto !== "Personaggi che ispirano").slice(0, 8);
  const tuttiArticoli = await getAllArticoli();
  const newsletters = tuttiArticoli.filter((a) => a.slug.toLowerCase().includes("newsletter")).sort((a, b) => {
    const tA = a.data_pubblicazione ? new Date(a.data_pubblicazione).getTime() : 0;
    const tB = b.data_pubblicazione ? new Date(b.data_pubblicazione).getTime() : 0;
    return tB - tA;
  });
  function formatDate(d) {
    if (!d) return "";
    return new Intl.DateTimeFormat("it-IT", { year: "numeric", month: "long" }).format(new Date(d));
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Newsletter \u2014 Ombre e Luci", "description": "Iscriviti alla newsletter di Ombre e Luci: storie, riflessioni e novit\xE0 sulla disabilit\xE0 e sulla fragilit\xE0 umana direttamente nella tua casella di posta.", "data-astro-cid-og54zrcn": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main" data-astro-cid-og54zrcn> <div class="nl-container" data-astro-cid-og54zrcn> <header class="nl-header" data-astro-cid-og54zrcn> <p class="nl-eyebrow" data-astro-cid-og54zrcn>Newsletter</p> <h1 class="nl-title" data-astro-cid-og54zrcn>Rimani in contatto</h1> <p class="nl-subtitle" data-astro-cid-og54zrcn>
Ogni numero: articoli scelti dalla redazione, storie di vita, riflessioni
          sulla disabilità e sulla fragilità. Nessuno spam, puoi cancellarti in ogni momento.
</p> </header> <div class="nl-body" data-astro-cid-og54zrcn> <!-- Form iscrizione --> <section class="nl-form-section" data-astro-cid-og54zrcn>  <form class="nl-form" action="#" method="POST" target="_blank" rel="noopener noreferrer" data-astro-cid-og54zrcn> <div class="nl-form-row" data-astro-cid-og54zrcn> <input type="email" name="EMAIL" required placeholder="La tua email" class="nl-input" aria-label="Indirizzo email" data-astro-cid-og54zrcn> <button type="submit" class="nl-submit" data-astro-cid-og54zrcn>Iscriviti</button> </div> <p class="nl-privacy" data-astro-cid-og54zrcn>
Cliccando su "Iscriviti" accetti la nostra
<a href="https://www.iubenda.com/privacy-policy/66379072" target="_blank" rel="noopener noreferrer" data-astro-cid-og54zrcn>Privacy Policy</a>.
              Associazione Fede e Luce A.P.S.
</p> </form> </section> <!-- Newsletter precedenti --> ${newsletters.length > 0 && renderTemplate`<section class="nl-archive" data-astro-cid-og54zrcn> <h2 class="nl-section-title" data-astro-cid-og54zrcn>Newsletter precedenti</h2> <ul class="nl-archive-list" data-astro-cid-og54zrcn> ${newsletters.map((n) => renderTemplate`<li class="nl-archive-item" data-astro-cid-og54zrcn> <a${addAttribute(`/blog/${n.slug}`, "href")} class="nl-archive-link" data-astro-cid-og54zrcn> <span class="nl-archive-title" data-astro-cid-og54zrcn>${n.titolo}</span> <span class="nl-archive-date" data-astro-cid-og54zrcn>${formatDate(n.data_pubblicazione)}</span> </a> </li>`)} </ul> </section>`} <!-- Esplora i temi --> <section class="nl-explore" data-astro-cid-og54zrcn> <h2 class="nl-section-title" data-astro-cid-og54zrcn>Esplora i temi della rivista</h2> <ul class="nl-temi" data-astro-cid-og54zrcn> ${temi.map((t) => renderTemplate`<li data-astro-cid-og54zrcn> <a${addAttribute(`/categoria/${t.slug}`, "href")} class="nl-tema-link" data-astro-cid-og54zrcn>${t.nome}</a> </li>`)} <li data-astro-cid-og54zrcn> <a href="/archivio" class="nl-tema-link nl-tema-all" data-astro-cid-og54zrcn>Tutto l'archivio →</a> </li> </ul> </section> </div> </div> </main> ` })} `;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/newsletter.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/newsletter.astro";
const $$url = "/newsletter";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Newsletter,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
