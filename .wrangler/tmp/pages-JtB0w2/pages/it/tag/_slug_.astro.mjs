globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, b as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../../chunks/astro/server_BT9XwReg.mjs';
import { $ as $$BaseLayout } from '../../../chunks/BaseLayout_DOaiilqT.mjs';
import { $ as $$ArticoliRullo } from '../../../chunks/ArticoliRullo_BlaFCqIC.mjs';
import { i as directusCredsFromAstroLocals, n as getTagBySlug, o as getArticoliByTag } from '../../../chunks/directus_BvF_bImd.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://ombreeluci.it");
const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const creds = directusCredsFromAstroLocals(Astro2.locals);
  const tagSlug = (Astro2.params.slug ?? "").replace(/\/$/, "");
  const [tag, allArticoli] = await Promise.all([
    getTagBySlug(tagSlug, creds),
    getArticoliByTag(tagSlug, creds)
  ]);
  if (!tag) {
    return new Response("Not found", { status: 404 });
  }
  const articoli = allArticoli.filter((a) => a.lang === "it");
  Astro2.response.headers.set("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": tag.nome, "description": `Articoli con il tag "${tag.nome}" su Ombre e Luci.`, "noindex": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main"> <div class="container"> ${renderComponent($$result2, "ArticoliRullo", $$ArticoliRullo, { "title": tag.nome, "articoli": articoli, "pageSize": 24 })} </div> </main> ` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/it/tag/[slug].astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/it/tag/[slug].astro";
const $$url = "/it/tag/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
