globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, a as addAttribute } from '../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_iVPiOiwI.mjs';
import { d as getAllAutori, e as getAutoreImageUrl } from '../chunks/directus_BUvoij4J.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  function stripHtml(html) {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const allAutori = await getAllAutori();
  const autori = allAutori.map((autore) => {
    const foto = autore.foto?.id ? getAutoreImageUrl(autore.foto.id) : "";
    const bioText = autore.bio_html ? stripHtml(autore.bio_html) : "";
    const bio_breve = bioText ? bioText.slice(0, 120) + (bioText.length > 120 ? "\u2026" : "") : "";
    return {
      nome: autore.nome_completo,
      slug: autore.slug,
      foto,
      bio_breve,
      count_articoli: autore.articoli_count ?? 0
    };
  });
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Autori", "description": "Elenco degli autori della rivista Ombre e Luci", "noindex": true, "data-astro-cid-77eyneti": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main autori-page" data-astro-cid-77eyneti> <div class="autori-container" data-astro-cid-77eyneti> <h1 class="autori-title" data-astro-cid-77eyneti>Autori</h1> <p class="autori-intro" data-astro-cid-77eyneti>Esplora i collaboratori della rivista Ombre e Luci.</p> <div class="autori-toolbar" data-astro-cid-77eyneti> <div class="autori-search-wrap" data-astro-cid-77eyneti> <label for="autori-search" class="visually-hidden" data-astro-cid-77eyneti>Cerca autore</label> <input type="search" id="autori-search" class="autori-search" placeholder="Cerca per nome..." aria-label="Cerca autore" data-astro-cid-77eyneti> </div> <div class="autori-sort-wrap" data-astro-cid-77eyneti> <label for="autori-sort" class="autori-sort-label" data-astro-cid-77eyneti>Ordina per</label> <select id="autori-sort" class="autori-sort" aria-label="Ordina autori" data-astro-cid-77eyneti> <option value="count-desc" data-astro-cid-77eyneti>Più articoli</option> <option value="count-asc" data-astro-cid-77eyneti>Meno articoli</option> <option value="name-asc" data-astro-cid-77eyneti>Nome A–Z</option> <option value="name-desc" data-astro-cid-77eyneti>Nome Z–A</option> </select> </div> </div> <div id="autori-grid" class="autori-grid" data-astro-cid-77eyneti> ${autori.map((autore) => renderTemplate`<a${addAttribute(`/autori/${autore.slug}`, "href")} class="autori-card"${addAttribute(autore.nome.toLowerCase(), "data-nome")}${addAttribute(autore.count_articoli, "data-count")} data-astro-cid-77eyneti> <div class="autori-card-image" data-astro-cid-77eyneti> ${autore.foto && !autore.foto.includes("default.png") ? renderTemplate`<img${addAttribute(autore.foto, "src")} alt="" width="80" height="80" loading="lazy" onError="this.style.display='none'; this.nextElementSibling?.classList.add('visible')" data-astro-cid-77eyneti>` : null} <span${addAttribute(!autore.foto || autore.foto.includes("default.png") ? "autori-card-initial visible" : "autori-card-initial", "class")} aria-hidden="true" data-astro-cid-77eyneti>${autore.nome.charAt(0).toUpperCase()}</span> </div> <div class="autori-card-body" data-astro-cid-77eyneti> <h2 class="autori-card-name" data-astro-cid-77eyneti>${autore.nome}</h2> <p class="autori-card-count" data-astro-cid-77eyneti>${autore.count_articoli} ${autore.count_articoli === 1 ? "articolo" : "articoli"}</p> <p class="autori-card-bio" data-astro-cid-77eyneti>${autore.bio_breve}</p> </div> </a>`)} </div> <p id="autori-no-results" class="autori-no-results" style="display: none;" data-astro-cid-77eyneti>Nessun autore trovato.</p> </div> </main>   ` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/autori/index.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/autori/index.astro";
const $$url = "/autori";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
