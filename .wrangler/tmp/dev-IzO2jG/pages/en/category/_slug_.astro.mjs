globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, b as renderComponent, r as renderTemplate, F as Fragment, u as unescapeHTML, m as maybeRenderHead } from '../../../chunks/astro/server_BT9XwReg.mjs';
import { $ as $$BaseLayout } from '../../../chunks/BaseLayout_DOaiilqT.mjs';
import { $ as $$CategoriaPageContent } from '../../../chunks/CategoriaPageContent_BuRN22sl.mjs';
import { i as directusCredsFromAstroLocals, j as getArticoliByCategoria } from '../../../chunks/directus_BvF_bImd.mjs';
import { l as localizeCategory } from '../../../chunks/Footer_DN9MDnF9.mjs';
import { e as getCategoriaSlugIT, b as getRoleWeight, g as getMegaclusterForArticle } from '../../../chunks/taxonomy_BacsMRxg.mjs';
export { renderers } from '../../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://ombreeluci.it");
const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { redirect } = Astro2;
  const creds = directusCredsFromAstroLocals(Astro2.locals);
  const enSlug = (Astro2.params.slug ?? "").replace(/\/$/, "");
  const itSlug = getCategoriaSlugIT(enSlug);
  const articoli = await getArticoliByCategoria(itSlug, "en", creds);
  if (!articoli.length) {
    return redirect("/en/", 302);
  }
  const categoryLabel = localizeCategory(itSlug, "en") ?? enSlug;
  const sorted = [...articoli].sort((a, b) => {
    const tA = a.data_pubblicazione ? new Date(a.data_pubblicazione).getTime() : 0;
    const tB = b.data_pubblicazione ? new Date(b.data_pubblicazione).getTime() : 0;
    if (tA !== tB) return tB - tA;
    const wA = getRoleWeight(getMegaclusterForArticle(a).ruolo_editoriale);
    const wB = getRoleWeight(getMegaclusterForArticle(b).ruolo_editoriale);
    return wB - wA;
  });
  Astro2.response.headers.set("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": categoryLabel, "description": `English articles in category "${categoryLabel}" on Ombre e Luci.`, "noindex": true, "lang": "en", "alternateArticleUrl": `/categoria/${itSlug}` }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<main class="site-main"> ${renderComponent($$result2, "CategoriaPageContent", $$CategoriaPageContent, { "articoli": sorted, "categoryLabel": categoryLabel, "lang": "en", "basePath": "/en" })} </main> `, "head": async ($$result2) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "slot": "head" }, { "default": async ($$result3) => renderTemplate(_a || (_a = __template([' <script type="application/ld+json">', "<\/script> "])), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ombreeluci.it/en/" },
      { "@type": "ListItem", "position": 2, "name": categoryLabel, "item": Astro2.url.href }
    ]
  }))) })}` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/en/category/[slug].astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/en/category/[slug].astro";
const $$url = "/en/category/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
