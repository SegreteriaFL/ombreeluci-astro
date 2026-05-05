globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, m as maybeRenderHead, r as renderTemplate, e as addAttribute, b as renderComponent } from './astro/server_BT9XwReg.mjs';
import { $ as $$ArticleCard } from './ArticleCard_BcaTyrt5.mjs';
import { g as getMegaclusterForArticle, b as getRoleWeight, a as getLabels } from './taxonomy_BacsMRxg.mjs';
import { b as getArticoloCopertinaSrc, a as getAutoreImageUrl } from './directus_BvF_bImd.mjs';
import { t } from './Footer_DN9MDnF9.mjs';
/* empty css                          */

const $$Astro = createAstro("https://ombreeluci.it");
const $$CategoriaPageContent = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$CategoriaPageContent;
  const {
    articoli,
    categoryLabel,
    descrizione = null,
    evidenza = null,
    lang = "it",
    basePath = ""
  } = Astro2.props;
  const sorted = articoli;
  const hero = sorted[0] ?? null;
  const rest = sorted.slice(1);
  const evidenzaEffettiva = evidenza && evidenza.length > 0 ? evidenza : sorted.filter((a) => {
    const r = getMegaclusterForArticle(a).ruolo_editoriale;
    return r === "portante" || r === "strutturale";
  }).sort(
    (a, b) => getRoleWeight(getMegaclusterForArticle(b).ruolo_editoriale) - getRoleWeight(getMegaclusterForArticle(a).ruolo_editoriale)
  ).slice(0, 5);
  const hasEvidenza = evidenzaEffettiva.length > 0;
  const evidenzaTitle = lang === "en" ? "Featured" : "In evidenza";
  const authorFallback = t(lang, "author_unknown");
  return renderTemplate`${maybeRenderHead()}<div class="categoria-container" data-astro-cid-rl4hl7k4> <header class="categoria-header" data-astro-cid-rl4hl7k4> <h1 class="categoria-title" data-astro-cid-rl4hl7k4>${categoryLabel}</h1> <p class="categoria-count" data-astro-cid-rl4hl7k4> ${articoli.length} ${lang === "en" ? articoli.length === 1 ? "article" : "articles" : articoli.length === 1 ? "articolo" : "articoli"} </p> ${descrizione && renderTemplate`<p class="categoria-descrizione" data-astro-cid-rl4hl7k4>${descrizione}</p>`} </header> <div${addAttribute(`categoria-body${hasEvidenza ? "" : " categoria-body--no-evidenza"}`, "class")} data-astro-cid-rl4hl7k4> <div class="feed-col" data-astro-cid-rl4hl7k4> ${hero && (() => {
    const { categoria_menu, ruolo_editoriale } = getMegaclusterForArticle(hero);
    const { formal } = getLabels([], hero);
    return renderTemplate`<div class="hero-wrap" data-astro-cid-rl4hl7k4> ${renderComponent($$result, "ArticleCard", $$ArticleCard, { "title": hero.titolo, "slug": hero.slug, "basePath": basePath, "categoriaMenu": categoria_menu ?? hero.categoria_menu ?? void 0, "issue": hero.numero_rivista?.id_numero ?? null, "forma": formal, "author": hero.autore?.nome_completo ?? authorFallback, "date": hero.data_pubblicazione ? new Date(hero.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(hero), "ruoloEditoriale": ruolo_editoriale ?? void 0, "lang": lang, "data-astro-cid-rl4hl7k4": true })} </div>`;
  })()} <div class="articles-list" data-astro-cid-rl4hl7k4> ${rest.map((a) => {
    const { categoria_menu, ruolo_editoriale } = getMegaclusterForArticle(a);
    const { formal } = getLabels([], a);
    const autFotoId = a.autore?.foto?.id;
    return renderTemplate`${renderComponent($$result, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "basePath": basePath, "categoriaMenu": categoria_menu ?? a.categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? authorFallback, "date": a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(a), "ruoloEditoriale": ruolo_editoriale ?? void 0, "horizontal": true, "sottotitolo": a.sottotitolo ?? null, "authorImage": autFotoId ? getAutoreImageUrl(autFotoId) : null, "lang": lang, "data-astro-cid-rl4hl7k4": true })}`;
  })} </div> </div> ${hasEvidenza && renderTemplate`<aside class="evidenza-col" data-astro-cid-rl4hl7k4> <h2 class="evidenza-title" data-astro-cid-rl4hl7k4>${evidenzaTitle}</h2> <div class="evidenza-list" data-astro-cid-rl4hl7k4> ${evidenzaEffettiva.map((a, idx) => {
    const { ruolo_editoriale } = getMegaclusterForArticle(a);
    const { formal } = getLabels([], a);
    return renderTemplate`${renderComponent($$result, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "basePath": basePath, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? authorFallback, "date": a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(a), "hideImage": idx !== 0, "ruoloEditoriale": ruolo_editoriale ?? void 0, "lang": lang, "data-astro-cid-rl4hl7k4": true })}`;
  })} </div> </aside>`} </div> </div> `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/CategoriaPageContent.astro", void 0);

export { $$CategoriaPageContent as $ };
