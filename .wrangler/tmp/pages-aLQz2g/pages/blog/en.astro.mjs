globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_iVPiOiwI.mjs';
import { $ as $$ArticleCard } from '../../chunks/ArticleCard_Bmok_ryk.mjs';
import { g as getMegaclusterForArticle, a as getLabels } from '../../chunks/taxonomy_CiRm90XT.mjs';
import { t } from '../../chunks/Footer_pGzeraaC.mjs';
import { a as getAllArticoli, g as getArticoloCopertinaSrc } from '../../chunks/directus_BUvoij4J.mjs';
/* empty css                                 */
export { renderers } from '../../renderers.mjs';

const $$En = createComponent(async ($$result, $$props, $$slots) => {
  const allArticles = await getAllArticoli();
  const englishArticles = allArticles.filter((a) => a.lang === "en").sort((a, b) => {
    const tA = a.data_pubblicazione ? new Date(a.data_pubblicazione).getTime() : 0;
    const tB = b.data_pubblicazione ? new Date(b.data_pubblicazione).getTime() : 0;
    return tB - tA;
  });
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${t("en", "english_articles")}`, "description": "Articles in English from Ombre e Luci.", "lang": "en", "data-astro-cid-hkhshl3n": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main" data-astro-cid-hkhshl3n> <div class="container" style="padding-top: 2.5rem; padding-bottom: 3rem;" data-astro-cid-hkhshl3n> <h1 style="margin-bottom: 0.5rem;" data-astro-cid-hkhshl3n>${t("en", "english_articles")}</h1> <p style="color: var(--text-secondary); margin-bottom: 2rem;" data-astro-cid-hkhshl3n>Articles from Ombre e Luci available in English.</p> <div class="en-grid" data-astro-cid-hkhshl3n> ${englishArticles.map((a) => {
    const image = getArticoloCopertinaSrc(a);
    const { categoria_menu } = getMegaclusterForArticle(a);
    const { formal } = getLabels([], a);
    return renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "categoriaMenu": categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? "Autore sconosciuto", "date": a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": image, "data-astro-cid-hkhshl3n": true })}`;
  })} </div> </div> </main>  ` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/blog/en.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/blog/en.astro";
const $$url = "/blog/en";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$En,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
