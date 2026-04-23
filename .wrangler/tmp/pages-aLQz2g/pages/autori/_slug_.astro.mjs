globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, b as createAstro, m as maybeRenderHead, a as addAttribute, u as unescapeHTML, F as Fragment } from '../../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_iVPiOiwI.mjs';
import { $ as $$ArticleCard } from '../../chunks/ArticleCard_Bmok_ryk.mjs';
import { c as getRoleWeight, g as getMegaclusterForArticle, a as getLabels } from '../../chunks/taxonomy_CiRm90XT.mjs';
import { d as getAllAutori, g as getArticoloCopertinaSrc, e as getAutoreImageUrl } from '../../chunks/directus_BUvoij4J.mjs';
import { g as getAllArticoliBuild } from '../../chunks/articoli-build_y9CRUdcN.mjs';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
async function getStaticPaths() {
  function toUrlSlug(name) {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  const [allAutori, allArticoli] = await Promise.all([getAllAutori(), getAllArticoliBuild()]);
  return allAutori.map((autore) => {
    const urlSlug = toUrlSlug(autore.nome_completo);
    const articoli = allArticoli.filter((a) => (a.autore?.nome_completo || "") === autore.nome_completo).sort((a, b) => {
      const tA = a.data_pubblicazione ? new Date(a.data_pubblicazione).getTime() : 0;
      const tB = b.data_pubblicazione ? new Date(b.data_pubblicazione).getTime() : 0;
      if (tA !== tB) return tB - tA;
      const weightA = getRoleWeight(getMegaclusterForArticle(a).ruolo_editoriale);
      const weightB = getRoleWeight(getMegaclusterForArticle(b.wp_id).ruolo_editoriale);
      return weightB - weightA;
    });
    return {
      params: { slug: urlSlug },
      props: { autore, articoli }
    };
  });
}
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { autore, articoli } = Astro2.props;
  const nomeAutore = autore.nome_completo;
  const slug = Astro2.params.slug ?? "";
  const authorFotoId = autore.foto?.id ?? null;
  const authorImagePath = authorFotoId ? getAutoreImageUrl(authorFotoId) : `/assets/authors/${slug}.jpg`;
  const authorBioHtml = autore.bio_html?.trim() || null;
  const bioIsHtml = authorBioHtml && /<[a-z][^>]*>/i.test(authorBioHtml);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `Articoli di ${nomeAutore}`, "description": `Leggi tutti i contributi di ${nomeAutore} pubblicati su Ombre e Luci`, "noindex": true, "ogImage": authorImagePath, "data-astro-cid-s62bqzvl": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main" data-astro-cid-s62bqzvl> <div class="author-container" data-astro-cid-s62bqzvl> <div class="author-header" data-astro-cid-s62bqzvl> <div class="author-avatar-wrapper" data-astro-cid-s62bqzvl> <img${addAttribute(authorImagePath, "src")}${addAttribute(nomeAutore, "alt")} class="author-avatar-image" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy" data-astro-cid-s62bqzvl> <div class="author-avatar-fallback" style="display: none;" data-astro-cid-s62bqzvl> ${nomeAutore.charAt(0).toUpperCase()} </div> </div> <div class="author-info" data-astro-cid-s62bqzvl> <h1 class="author-name" data-astro-cid-s62bqzvl>${nomeAutore}</h1> <div class="author-bio" data-astro-cid-s62bqzvl> ${authorBioHtml ? renderTemplate`<div class="author-bio-content" data-astro-cid-s62bqzvl>${unescapeHTML(bioIsHtml ? authorBioHtml : `<p>${authorBioHtml.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)}</div>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-s62bqzvl": true }, { "default": async ($$result3) => renderTemplate`Autore di ${articoli.length}${articoli.length === 1 ? "articolo" : "articoli"} pubblicati su Ombre e Luci.` })}`} </div> <div class="author-stats" data-astro-cid-s62bqzvl> <div class="author-stats-item" data-astro-cid-s62bqzvl> <span class="author-stats-number" data-astro-cid-s62bqzvl>${articoli.length}</span> <span data-astro-cid-s62bqzvl>${articoli.length === 1 ? "articolo" : "articoli"}</span> </div> </div> </div> </div> <section class="articles-section" data-astro-cid-s62bqzvl> <div class="articles-header" data-astro-cid-s62bqzvl> <h2 class="articles-title" data-astro-cid-s62bqzvl>Articoli</h2> <p class="articles-count" data-astro-cid-s62bqzvl>
[${articoli.length}] articoli pubblicati
</p> </div> <div class="articles-grid" data-astro-cid-s62bqzvl> ${articoli.map((a) => {
    const { categoria_menu, ruolo_editoriale } = getMegaclusterForArticle(a);
    const { formal } = getLabels([], a);
    const articleImage = getArticoloCopertinaSrc(a);
    return renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "categoriaMenu": categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? nomeAutore, "date": a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": articleImage, "ruoloEditoriale": ruolo_editoriale ?? void 0, "data-astro-cid-s62bqzvl": true })}`;
  })} </div> </section> </div> </main> ` })} `;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/autori/[slug].astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/autori/[slug].astro";
const $$url = "/autori/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
