globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, m as maybeRenderHead, r as renderTemplate, b as renderComponent, F as Fragment, u as unescapeHTML, e as addAttribute } from './astro/server_BT9XwReg.mjs';
import { $ as $$ArticleCard } from './ArticleCard_BcaTyrt5.mjs';
import { g as getMegaclusterForArticle, a as getLabels } from './taxonomy_BacsMRxg.mjs';
import { b as getArticoloCopertinaSrc } from './directus_BvF_bImd.mjs';
import { l as localizeCategory, a as localizeFormalType, t } from './Footer_DN9MDnF9.mjs';
/* empty css                           */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://ombreeluci.it");
const $$ArticoliRullo = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ArticoliRullo;
  const { title, articoli, description = null, headingLevel = 1, pageSize, basePath = "/it", locale = "it" } = Astro2.props;
  const usePageSize = pageSize != null && pageSize > 0;
  const firstPage = usePageSize ? articoli.slice(0, pageSize) : articoli;
  const rest = usePageSize ? articoli.slice(pageSize) : [];
  const hasMore = rest.length > 0;
  function authorSlug(name) {
    return String(name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  const restData = rest.map((a) => {
    const { categoria_menu } = getMegaclusterForArticle(a);
    const { formal } = getLabels([], a);
    const hasIssue = a.numero_rivista?.id_numero != null;
    const catLabel = localizeCategory(categoria_menu ?? null, locale) ?? categoria_menu;
    const formaLabel = formal && formal !== "Articolo" ? localizeFormalType(formal, locale) : null;
    const formaPrefix = formaLabel ? `${formaLabel} \xB7 ` : "";
    const badge = catLabel ? `${formaPrefix}${catLabel}` : hasIssue ? "" : locale === "en" ? "Online" : "Online";
    return {
      titolo: a.titolo,
      slug: a.slug,
      autore: a.autore?.nome_completo ?? "Autore sconosciuto",
      autoreSlug: authorSlug(a.autore?.nome_completo ?? ""),
      data: a.data_pubblicazione ?? null,
      immagine: getArticoloCopertinaSrc(a),
      badge
    };
  });
  return renderTemplate`${maybeRenderHead()}<section class="rullo-section" data-astro-cid-f6xzovoa> <header class="rullo-header" data-astro-cid-f6xzovoa> <div class="rullo-header-top" data-astro-cid-f6xzovoa> ${headingLevel === 2 ? renderTemplate`<h2 class="rullo-title" data-astro-cid-f6xzovoa>${title}</h2>` : renderTemplate`<h1 class="rullo-title" data-astro-cid-f6xzovoa>${title}</h1>`} <span class="rullo-count" id="rullo-count" data-astro-cid-f6xzovoa> ${articoli.length} ${locale === "en" ? articoli.length === 1 ? "article" : "articles" : articoli.length === 1 ? "articolo" : "articoli"} </span> </div> ${description && renderTemplate`<p class="rullo-description" data-astro-cid-f6xzovoa>${description}</p>`} </header> ${articoli.length > 0 ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-f6xzovoa": true }, { "default": ($$result2) => renderTemplate` <div class="rullo-grid" id="rullo-grid" data-astro-cid-f6xzovoa> ${firstPage.map((a) => {
    const { categoria_menu, ruolo_editoriale } = getMegaclusterForArticle(a);
    const { formal } = getLabels([], a);
    return renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "basePath": basePath, "categoriaMenu": categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? "Autore sconosciuto", "date": a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(a), "ruoloEditoriale": ruolo_editoriale ?? void 0, "lang": locale, "data-astro-cid-f6xzovoa": true })}`;
  })} </div> ${hasMore && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-f6xzovoa": true }, { "default": ($$result3) => renderTemplate(_a || (_a = __template([' <div class="rullo-loadmore-wrap" id="rullo-loadmore-wrap" data-astro-cid-f6xzovoa> <button class="rullo-loadmore" id="rullo-loadmore"', "", "", "", "", "", "", " data-astro-cid-f6xzovoa> ", ' <span class="rullo-remaining" id="rullo-remaining" data-astro-cid-f6xzovoa>\n(', " ", ')\n</span> </button> </div> <script id="rullo-data" type="application/json">', "<\/script> "])), addAttribute(firstPage.length, "data-loaded"), addAttribute(articoli.length, "data-total"), addAttribute(basePath, "data-base-path"), addAttribute(locale, "data-locale"), addAttribute(t(locale, "author_by"), "data-author-by"), addAttribute(t(locale, "load_more_remaining"), "data-remaining-label"), addAttribute(`${t(locale, "load_more_aria")} (${rest.length} ${t(locale, "load_more_remaining")})`, "aria-label"), t(locale, "load_more"), rest.length, t(locale, "load_more_remaining"), unescapeHTML(JSON.stringify(restData))) })}`}` })}` : renderTemplate`<div class="rullo-empty" data-astro-cid-f6xzovoa> <p data-astro-cid-f6xzovoa>${locale === "en" ? "No articles available." : "Nessun articolo disponibile."}</p> </div>`} </section>  <!-- Stili globali solo per le card generate dal load-more JS (no Astro scoping) -->  `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/ArticoliRullo.astro", void 0);

export { $$ArticoliRullo as $ };
