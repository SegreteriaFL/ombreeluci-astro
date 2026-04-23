globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, a as addAttribute } from '../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_iVPiOiwI.mjs';
import { $ as $$IssueCard } from '../chunks/IssueCard_9ADWQ0mu.mjs';
import { b as getAllNumeriRivista, c as getNumeroImageUrl } from '../chunks/directus_BUvoij4J.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const rawNumeri = await getAllNumeriRivista();
  const numeriOrdinati = [...rawNumeri].sort(
    (a, b) => (b.anno_pubblicazione ?? 0) - (a.anno_pubblicazione ?? 0)
  );
  function numeroFromId(idNumero) {
    const m = idNumero.match(/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  }
  const anni = Array.from(new Set(numeriOrdinati.map((n) => n.anno_pubblicazione ?? 0))).filter((y) => y > 0).sort((a, b) => b - a);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Archivio", "description": "Sfoglia i numeri della rivista Ombre e Luci dal 1977 ad oggi.", "noindex": true, "data-astro-cid-aw366c5p": true }, { "default": async ($$result2) => renderTemplate`${maybeRenderHead()}<main class="site-main" data-astro-cid-aw366c5p><div class="archivio-container" data-astro-cid-aw366c5p><div class="archivio-header" data-astro-cid-aw366c5p><h1 class="archivio-title" data-astro-cid-aw366c5p>Archivio</h1><p class="archivio-subtitle" data-astro-cid-aw366c5p>
Esplora tutti i numeri di Ombre e Luci e Insieme
</p></div><div class="filters-container" data-astro-cid-aw366c5p><div class="filter-group" data-astro-cid-aw366c5p><label for="filter-anno" class="filter-label" data-astro-cid-aw366c5p>Anno</label><select id="filter-anno" class="filter-select" data-filter-year data-astro-cid-aw366c5p><option value="" data-astro-cid-aw366c5p>Tutti gli anni</option>${anni.map((anno) => renderTemplate`<option${addAttribute(anno, "value")} data-astro-cid-aw366c5p>${anno}</option>`)}</select></div><div class="filter-group" data-astro-cid-aw366c5p><label for="filter-testata" class="filter-label" data-astro-cid-aw366c5p>Testata</label><select id="filter-testata" class="filter-select" data-filter-type data-astro-cid-aw366c5p><option value="" data-astro-cid-aw366c5p>Tutte</option><option value="ombreeluci" data-astro-cid-aw366c5p>Ombre e Luci</option><option value="insieme" data-astro-cid-aw366c5p>Insieme</option></select></div><div class="filter-group" data-astro-cid-aw366c5p><label for="filter-ordine" class="filter-label" data-astro-cid-aw366c5p>Ordinamento</label><select id="filter-ordine" class="filter-select" data-astro-cid-aw366c5p><option value="desc" data-astro-cid-aw366c5p>Data ↓</option><option value="asc" data-astro-cid-aw366c5p>Data ↑</option></select></div><div class="results-count" id="results-count" data-astro-cid-aw366c5p>${numeriOrdinati.length} numeri
</div></div><div class="issues-grid" id="issues-grid" data-astro-cid-aw366c5p>${numeriOrdinati.map((n) => {
    const anno = n.anno_pubblicazione ?? 0;
    const numero = numeroFromId(n.id_numero);
    const tipoFilter = n.tipo === "ins" ? "insieme" : "ombreeluci";
    const tipoRivista = n.tipo === "insieme" ? "insieme" : "ombre_e_luci";
    return renderTemplate`<div class="issue-card-wrapper"${addAttribute(n.id_numero, "data-id")}${addAttribute(anno || "", "data-year")}${addAttribute(tipoFilter, "data-type")}${addAttribute(numero, "data-numero")} data-astro-cid-aw366c5p>${renderComponent($$result2, "IssueCard", $$IssueCard, { "cover_url": getNumeroImageUrl(n) ?? void 0, "titolo_numero": n.titolo_tema ?? n.display_title ?? "", "numero": numero, "anno": anno, "periodo_label": n.periodo_label ?? void 0, "tipo_rivista": tipoRivista, "id_numero": n.id_numero, "data-astro-cid-aw366c5p": true })}</div>`;
  })}</div><div class="no-results" id="no-results" style="display: none;" data-astro-cid-aw366c5p><h2 class="no-results-title" data-astro-cid-aw366c5p>Nessun risultato</h2><p class="no-results-text" data-astro-cid-aw366c5p>Prova a modificare i filtri per vedere più risultati.</p></div></div></main>` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/index.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/index.astro";
const $$url = "/archivio";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
