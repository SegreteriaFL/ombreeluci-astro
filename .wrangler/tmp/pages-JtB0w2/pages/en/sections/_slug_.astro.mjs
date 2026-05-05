globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, b as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../../chunks/astro/server_BT9XwReg.mjs';
import { $ as $$BaseLayout } from '../../../chunks/BaseLayout_DOaiilqT.mjs';
import { $ as $$RubricaPageContent } from '../../../chunks/RubricaPageContent_Btsy_OLg.mjs';
import { r as rubricheData } from '../../../chunks/rubriche_BEVwGLjw.mjs';
import { i as directusCredsFromAstroLocals, m as getArticoliByForma } from '../../../chunks/directus_BvF_bImd.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://ombreeluci.it");
const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const rubrica = rubricheData.find((r) => r.en_slug === slug);
  if (!rubrica) {
    return Astro2.redirect("/en/", 302);
  }
  const creds = directusCredsFromAstroLocals(Astro2.locals);
  let articoli = [];
  if (rubrica.filtro === "forma") {
    articoli = await getArticoliByForma(rubrica.valore, "en", creds);
    if (articoli.length === 0) {
      return Astro2.redirect("/en/", 302);
    }
  } else {
    return Astro2.redirect("/en/sections/diaries/", 301);
  }
  const alternateItUrl = `/rubriche/${rubrica.slug}/`;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": rubrica.en, "description": `${rubrica.en}: section of Ombre e Luci`, "noindex": true, "lang": "en", "alternateArticleUrl": alternateItUrl }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main"> ${renderComponent($$result2, "RubricaPageContent", $$RubricaPageContent, { "lang": "en", "rubrica": rubrica, "articoli": articoli })} </main> ` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/en/sections/[slug].astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/en/sections/[slug].astro";
const $$url = "/en/sections/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
