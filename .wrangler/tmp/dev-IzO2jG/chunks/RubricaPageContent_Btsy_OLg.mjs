globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, m as maybeRenderHead, e as addAttribute, b as renderComponent, r as renderTemplate } from './astro/server_BT9XwReg.mjs';
import { $ as $$ArticleCard } from './ArticleCard_BcaTyrt5.mjs';
import { g as getMegaclusterForArticle, b as getRoleWeight, a as getLabels } from './taxonomy_BacsMRxg.mjs';
import { b as getArticoloCopertinaSrc, a as getAutoreImageUrl } from './directus_BvF_bImd.mjs';
import { t } from './Footer_DN9MDnF9.mjs';
/* empty css                          */

const $$Astro = createAstro("https://ombreeluci.it");
const $$RubricaPageContent = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$RubricaPageContent;
  const { lang, rubrica, articoli } = Astro2.props;
  const basePath = lang === "en" ? "/en" : "/it";
  const rubricaLabel = lang === "en" ? rubrica.en : rubrica.it;
  `/rubriche/${rubrica.slug}/`;
  `/en/sections/${rubrica.en_slug}/`;
  const sorted = articoli;
  const hero = sorted[0] ?? null;
  const rest = sorted.slice(1);
  const evidenzaEffettiva = sorted.filter((a) => {
    const r = getMegaclusterForArticle(a).ruolo_editoriale;
    return r === "portante" || r === "strutturale";
  }).sort(
    (a, b) => getRoleWeight(getMegaclusterForArticle(b).ruolo_editoriale) - getRoleWeight(getMegaclusterForArticle(a).ruolo_editoriale)
  ).slice(0, 5);
  const hasEvidenza = evidenzaEffettiva.length > 0;
  const evidenzaTitle = lang === "en" ? "Featured" : "In evidenza";
  const authorFallback = t(lang, "author_unknown");
  return renderTemplate`${maybeRenderHead()}<div class="categoria-container" data-astro-cid-tmle3k6d> <header class="categoria-header" data-astro-cid-tmle3k6d> <h1 class="categoria-title" data-astro-cid-tmle3k6d>${rubricaLabel}</h1> <p class="categoria-count" data-astro-cid-tmle3k6d> ${articoli.length} ${lang === "en" ? articoli.length === 1 ? "article" : "articles" : articoli.length === 1 ? "articolo" : "articoli"} </p> </header> <div${addAttribute(`categoria-body${hasEvidenza ? "" : " categoria-body--no-evidenza"}`, "class")} data-astro-cid-tmle3k6d> <div class="feed-col" data-astro-cid-tmle3k6d> ${hero && (() => {
    const { categoria_menu, ruolo_editoriale } = getMegaclusterForArticle(hero);
    const { formal } = getLabels([], hero);
    return renderTemplate`<div class="hero-wrap" data-astro-cid-tmle3k6d> ${renderComponent($$result, "ArticleCard", $$ArticleCard, { "title": hero.titolo, "slug": hero.slug, "basePath": basePath, "categoriaMenu": categoria_menu ?? hero.categoria_menu ?? void 0, "issue": hero.numero_rivista?.id_numero ?? null, "forma": formal, "author": hero.autore?.nome_completo ?? authorFallback, "date": hero.data_pubblicazione ? new Date(hero.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(hero), "ruoloEditoriale": ruolo_editoriale ?? void 0, "lang": lang, "data-astro-cid-tmle3k6d": true })} </div>`;
  })()} <div class="articles-list" data-astro-cid-tmle3k6d> ${rest.map((a) => {
    const { categoria_menu, ruolo_editoriale } = getMegaclusterForArticle(a);
    const { formal } = getLabels([], a);
    const autFotoId = a.autore?.foto?.id;
    return renderTemplate`${renderComponent($$result, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "basePath": basePath, "categoriaMenu": categoria_menu ?? a.categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? authorFallback, "date": a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(a), "ruoloEditoriale": ruolo_editoriale ?? void 0, "horizontal": true, "sottotitolo": a.sottotitolo ?? null, "authorImage": autFotoId ? getAutoreImageUrl(autFotoId) : null, "lang": lang, "data-astro-cid-tmle3k6d": true })}`;
  })} </div> </div> ${hasEvidenza && renderTemplate`<aside class="evidenza-col" data-astro-cid-tmle3k6d> <h2 class="evidenza-title" data-astro-cid-tmle3k6d>${evidenzaTitle}</h2> <div class="evidenza-list" data-astro-cid-tmle3k6d> ${evidenzaEffettiva.map((a, idx) => {
    const { ruolo_editoriale } = getMegaclusterForArticle(a);
    const { formal } = getLabels([], a);
    return renderTemplate`${renderComponent($$result, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "basePath": basePath, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? authorFallback, "date": a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(a), "hideImage": idx !== 0, "ruoloEditoriale": ruolo_editoriale ?? void 0, "lang": lang, "data-astro-cid-tmle3k6d": true })}`;
  })} </div> </aside>`} </div> </div> `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/RubricaPageContent.astro", void 0);

export { $$RubricaPageContent as $ };
