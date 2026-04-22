globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, F as Fragment, u as unescapeHTML, m as maybeRenderHead, a as addAttribute } from '../../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_iVPiOiwI.mjs';
import { $ as $$ArticleCard } from '../../chunks/ArticleCard_Bmok_ryk.mjs';
import { g as getMegaclusterForArticle, c as getRoleWeight, d as getAllCategorySlugs, e as getCategoryBySlug, a as getLabels } from '../../chunks/taxonomy_CiRm90XT.mjs';
import { f as getCategoriaDescrizione, h as getArticoliInEvidenza, g as getArticoloCopertinaSrc, e as getAutoreImageUrl } from '../../chunks/directus_BUvoij4J.mjs';
import { g as getAllArticoliBuild } from '../../chunks/articoli-build_y9CRUdcN.mjs';
/* empty css                                          */
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
async function getStaticPaths() {
  const allArticles = (await getAllArticoliBuild()).filter((a) => a.lang !== "en");
  const categorySlugs = getAllCategorySlugs();
  return Promise.all(categorySlugs.map(async (categoria) => {
    const cat = getCategoryBySlug(categoria);
    const label = cat ? cat.label : categoria;
    const displayLabel = cat?.displayLabel ?? cat?.label ?? categoria;
    const articoli = allArticles.filter((a) => {
      if (cat?.type === "thematic") {
        const { tema_label } = getMegaclusterForArticle(a);
        return tema_label === label;
      }
      if (cat?.type === "formal") {
        const { formal } = getLabels([], a);
        return formal === label;
      }
      return false;
    }).sort((a, b) => {
      const tA = a.data_pubblicazione ? new Date(a.data_pubblicazione).getTime() : 0;
      const tB = b.data_pubblicazione ? new Date(b.data_pubblicazione).getTime() : 0;
      if (tA !== tB) return tB - tA;
      const weightA = getRoleWeight(getMegaclusterForArticle(a).ruolo_editoriale);
      const weightB = getRoleWeight(getMegaclusterForArticle(b).ruolo_editoriale);
      return weightB - weightA;
    });
    const [catMeta, evidenza] = await Promise.all([
      getCategoriaDescrizione(categoria),
      getArticoliInEvidenza(categoria)
    ]);
    return {
      params: { categoria },
      props: {
        articoli,
        categoryLabel: displayLabel,
        descrizione: catMeta?.descrizione ?? null,
        evidenza
      }
    };
  }));
}
const $$categoria = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$categoria;
  const { articoli, categoryLabel, descrizione, evidenza } = Astro2.props;
  const hero = articoli[0] ?? null;
  const rest = articoli.slice(1);
  const evidenzaEffettiva = evidenza && evidenza.length > 0 ? evidenza : articoli.filter((a) => {
    const r = getMegaclusterForArticle(a).ruolo_editoriale;
    return r === "portante" || r === "strutturale";
  }).sort((a, b) => {
    const wA = getRoleWeight(getMegaclusterForArticle(a).ruolo_editoriale);
    const wB = getRoleWeight(getMegaclusterForArticle(b).ruolo_editoriale);
    return wB - wA;
  }).slice(0, 5);
  const hasEvidenza = evidenzaEffettiva.length > 0;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": categoryLabel, "description": descrizione ?? `Articoli nella categoria ${categoryLabel} su Ombre e Luci`, "noindex": true, "data-astro-cid-mxs6vqg6": true }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<main class="site-main" data-astro-cid-mxs6vqg6> <div class="categoria-container" data-astro-cid-mxs6vqg6> <header class="categoria-header" data-astro-cid-mxs6vqg6> <h1 class="categoria-title" data-astro-cid-mxs6vqg6>${categoryLabel}</h1> <p class="categoria-count" data-astro-cid-mxs6vqg6> ${articoli.length} ${articoli.length === 1 ? "articolo" : "articoli"} </p> ${descrizione && renderTemplate`<p class="categoria-descrizione" data-astro-cid-mxs6vqg6>${descrizione}</p>`} </header> <div${addAttribute(`categoria-body${hasEvidenza ? "" : " categoria-body--no-evidenza"}`, "class")} data-astro-cid-mxs6vqg6>  <div class="feed-col" data-astro-cid-mxs6vqg6> ${hero && (() => {
    const { categoria_menu, ruolo_editoriale } = getMegaclusterForArticle(hero);
    const { formal } = getLabels([], hero);
    return renderTemplate`<div class="hero-wrap" data-astro-cid-mxs6vqg6> ${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": hero.titolo, "slug": hero.slug, "categoriaMenu": categoria_menu ?? void 0, "issue": hero.numero_rivista?.id_numero ?? null, "forma": formal, "author": hero.autore?.nome_completo ?? "Autore sconosciuto", "date": hero.data_pubblicazione ? new Date(hero.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(hero), "ruoloEditoriale": ruolo_editoriale ?? void 0, "data-astro-cid-mxs6vqg6": true })} </div>`;
  })()} <div class="articles-list" data-astro-cid-mxs6vqg6> ${rest.map((a) => {
    const { categoria_menu, ruolo_editoriale } = getMegaclusterForArticle(a);
    const { formal } = getLabels([], a);
    const autFotoId = a.autore?.foto?.id;
    return renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "categoriaMenu": categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? "Autore sconosciuto", "date": a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(a), "ruoloEditoriale": ruolo_editoriale ?? void 0, "horizontal": true, "sottotitolo": a.sottotitolo ?? null, "authorImage": autFotoId ? getAutoreImageUrl(autFotoId) : null, "data-astro-cid-mxs6vqg6": true })}`;
  })} </div> </div>  ${hasEvidenza && renderTemplate`<aside class="evidenza-col" data-astro-cid-mxs6vqg6> <h2 class="evidenza-title" data-astro-cid-mxs6vqg6>In evidenza</h2> <div class="evidenza-list" data-astro-cid-mxs6vqg6> ${evidenzaEffettiva.map((a, idx) => {
    const { ruolo_editoriale } = getMegaclusterForArticle(a);
    const { formal } = getLabels([], a);
    return renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? "Autore sconosciuto", "date": a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(a), "hideImage": idx !== 0, "ruoloEditoriale": ruolo_editoriale ?? void 0, "data-astro-cid-mxs6vqg6": true })}`;
  })} </div> </aside>`} </div> </div> </main> `, "head": async ($$result2) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "slot": "head" }, { "default": async ($$result3) => renderTemplate(_a || (_a = __template([' <script type="application/ld+json">', "<\/script> "])), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ombreeluci.it" },
      { "@type": "ListItem", "position": 2, "name": categoryLabel, "item": Astro2.url.href }
    ]
  }))) })}` })} `;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/categoria/[categoria].astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/categoria/[categoria].astro";
const $$url = "/categoria/[categoria]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$categoria,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
