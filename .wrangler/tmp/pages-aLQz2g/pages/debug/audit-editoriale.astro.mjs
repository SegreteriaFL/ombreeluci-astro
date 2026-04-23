globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, e as renderHead, d as renderComponent, a as addAttribute, r as renderTemplate } from '../../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$Header, a as $$Footer } from '../../chunks/Footer_pGzeraaC.mjs';
/* empty css                                       */
import { g as getMegaclusterForArticle, c as getRoleWeight } from '../../chunks/taxonomy_CiRm90XT.mjs';
import { a as getAllArticoli } from '../../chunks/directus_BUvoij4J.mjs';
/* empty css                                               */
export { renderers } from '../../renderers.mjs';

const $$AuditEditoriale = createComponent(async ($$result, $$props, $$slots) => {
  const allArticlesRaw = await getAllArticoli();
  const buckets = {
    portante: [],
    strutturale: [],
    laterale: [],
    trasversale: []
  };
  for (const article of allArticlesRaw) {
    const { ruolo_editoriale } = getMegaclusterForArticle(article);
    const role = (ruolo_editoriale || "").toLowerCase();
    if (role && buckets[role]) {
      buckets[role].push(article);
    }
  }
  function sortByDateThenWeight(list) {
    return [...list].sort((a, b) => {
      const timeA = a.data_pubblicazione ? new Date(a.data_pubblicazione).getTime() : 0;
      const timeB = b.data_pubblicazione ? new Date(b.data_pubblicazione).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      const weightA = getRoleWeight(getMegaclusterForArticle(a).ruolo_editoriale);
      const weightB = getRoleWeight(getMegaclusterForArticle(b.wp_id).ruolo_editoriale);
      return weightB - weightA;
    });
  }
  const portanti = sortByDateThenWeight(buckets.portante);
  const strutturali = sortByDateThenWeight(buckets.strutturale);
  const laterali = sortByDateThenWeight(buckets.laterale);
  const trasversali = sortByDateThenWeight(buckets.trasversale);
  return renderTemplate`<html lang="it" data-astro-cid-n7wnjby3> <head><meta name="robots" content="noindex, nofollow"><meta charset="utf-8"><link rel="icon" type="image/png" href="/favicon.png"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Audit gerarchia editoriale - Ombre e Luci</title><meta name="description" content="Debug interno per la gerarchia editoriale (Portanti, Strutturali, Laterali, Trasversali) basata sul Megacluster.">${renderHead()}</head> <body data-astro-cid-n7wnjby3> ${renderComponent($$result, "Header", $$Header, { "data-astro-cid-n7wnjby3": true })} <main class="site-main" data-astro-cid-n7wnjby3> <div class="audit-container" data-astro-cid-n7wnjby3> <h1 class="audit-title" data-astro-cid-n7wnjby3>Audit gerarchia editoriale</h1> <p class="audit-subtitle" data-astro-cid-n7wnjby3>
Vista di debug interna per verificare la distribuzione dei ruoli editoriali (Portanti, Strutturali, Laterali, Trasversali)
          secondo il Megacluster.
</p> <section class="audit-grid" aria-label="Colonne per ruolo editoriale" data-astro-cid-n7wnjby3> <article class="audit-column" data-astro-cid-n7wnjby3> <header class="audit-column-header" data-astro-cid-n7wnjby3> <h2 class="audit-column-title" data-astro-cid-n7wnjby3>Portanti</h2> <span class="audit-column-count" data-astro-cid-n7wnjby3>${portanti.length} articoli</span> </header> <p class="audit-column-description" data-astro-cid-n7wnjby3>
Articoli che definiscono un tema: rappresentativi, citabili, forti per contenuto e taglio. Vanno mostrati per primi.
</p> <ul class="audit-list" data-astro-cid-n7wnjby3> ${portanti.map((article) => renderTemplate`<li class="audit-item" data-astro-cid-n7wnjby3> <a${addAttribute(`/blog/${article.slug}`, "href")} data-astro-cid-n7wnjby3> ${article.titolo || article.slug} </a> <span class="audit-item-meta" data-astro-cid-n7wnjby3> ${article.numero_rivista?.id_numero ? `Numero ${article.numero_rivista.id_numero} \u2022 ` : ""}${" "} ${article.data_pubblicazione ? article.data_pubblicazione.slice(0, 10) : "?"} </span> </li>`)} </ul> </article> <article class="audit-column" data-astro-cid-n7wnjby3> <header class="audit-column-header" data-astro-cid-n7wnjby3> <h2 class="audit-column-title" data-astro-cid-n7wnjby3>Strutturali</h2> <span class="audit-column-count" data-astro-cid-n7wnjby3>${strutturali.length} articoli</span> </header> <p class="audit-column-description" data-astro-cid-n7wnjby3>
Articoli coerenti che rafforzano il tema nel tempo. Solidi e affidabili, ottimi per approfondire.
</p> <ul class="audit-list" data-astro-cid-n7wnjby3> ${strutturali.map((article) => renderTemplate`<li class="audit-item" data-astro-cid-n7wnjby3> <a${addAttribute(`/blog/${article.slug}`, "href")} data-astro-cid-n7wnjby3> ${article.titolo || article.slug} </a> <span class="audit-item-meta" data-astro-cid-n7wnjby3> ${article.numero_rivista?.id_numero ? `Numero ${article.numero_rivista.id_numero} \u2022 ` : ""}${" "} ${article.data_pubblicazione ? article.data_pubblicazione.slice(0, 10) : "?"} </span> </li>`)} </ul> </article> <article class="audit-column" data-astro-cid-n7wnjby3> <header class="audit-column-header" data-astro-cid-n7wnjby3> <h2 class="audit-column-title" data-astro-cid-n7wnjby3>Laterali</h2> <span class="audit-column-count" data-astro-cid-n7wnjby3>${laterali.length} articoli</span> </header> <p class="audit-column-description" data-astro-cid-n7wnjby3>
Articoli che toccano il tema in modo non pieno (per esempio un paragrafo pertinente in un pezzo su altro).
</p> <ul class="audit-list" data-astro-cid-n7wnjby3> ${laterali.map((article) => renderTemplate`<li class="audit-item" data-astro-cid-n7wnjby3> <a${addAttribute(`/blog/${article.slug}`, "href")} data-astro-cid-n7wnjby3> ${article.titolo || article.slug} </a> <span class="audit-item-meta" data-astro-cid-n7wnjby3> ${article.numero_rivista?.id_numero ? `Numero ${article.numero_rivista.id_numero} \u2022 ` : ""}${" "} ${article.data_pubblicazione ? article.data_pubblicazione.slice(0, 10) : "?"} </span> </li>`)} </ul> </article> <article class="audit-column" data-astro-cid-n7wnjby3> <header class="audit-column-header" data-astro-cid-n7wnjby3> <h2 class="audit-column-title" data-astro-cid-n7wnjby3>Trasversali</h2> <span class="audit-column-count" data-astro-cid-n7wnjby3>${trasversali.length} articoli</span> </header> <p class="audit-column-description" data-astro-cid-n7wnjby3>
Articoli multidisciplinari (editoriali, riflessioni ampie) che collegano più temi.
</p> <ul class="audit-list" data-astro-cid-n7wnjby3> ${trasversali.map((article) => renderTemplate`<li class="audit-item" data-astro-cid-n7wnjby3> <a${addAttribute(`/blog/${article.slug}`, "href")} data-astro-cid-n7wnjby3> ${article.titolo || article.slug} </a> <span class="audit-item-meta" data-astro-cid-n7wnjby3> ${article.numero_rivista?.id_numero ? `Numero ${article.numero_rivista.id_numero} \u2022 ` : ""}${" "} ${article.data_pubblicazione ? article.data_pubblicazione.slice(0, 10) : "?"} </span> </li>`)} </ul> </article> </section> </div> </main> ${renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-n7wnjby3": true })} </body></html>`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/debug/audit-editoriale.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/debug/audit-editoriale.astro";
const $$url = "/debug/audit-editoriale";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$AuditEditoriale,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
