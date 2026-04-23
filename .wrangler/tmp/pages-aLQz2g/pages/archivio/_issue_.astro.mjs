globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro, d as renderComponent, u as unescapeHTML, F as Fragment } from '../../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_iVPiOiwI.mjs';
import { $ as $$ArticleCard } from '../../chunks/ArticleCard_Bmok_ryk.mjs';
/* empty css                                      */
import { g as getMegaclusterForArticle, a as getLabels } from '../../chunks/taxonomy_CiRm90XT.mjs';
import { c as getNumeroImageUrl, b as getAllNumeriRivista, g as getArticoloCopertinaSrc } from '../../chunks/directus_BUvoij4J.mjs';
import { g as getAllArticoliBuild } from '../../chunks/articoli-build_y9CRUdcN.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro$1 = createAstro();
const $$IssueNavPill = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$IssueNavPill;
  const { prevSlug, nextSlug } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<nav class="issue-nav-pill" aria-label="Navigazione tra i numeri dell'archivio" data-astro-cid-oqbatd3p> <div class="issue-nav-pill__inner" data-astro-cid-oqbatd3p> <!-- Freccia sinistra: numero precedente --> ${prevSlug ? renderTemplate`<a${addAttribute(`/archivio/${prevSlug}`, "href")} class="issue-nav-pill__btn issue-nav-pill__btn--prev" aria-label="Numero precedente" data-tooltip="Numero precedente" data-astro-cid-oqbatd3p> <span class="issue-nav-pill__icon issue-nav-pill__icon--left" aria-hidden="true" data-astro-cid-oqbatd3p> <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-oqbatd3p> <path d="M8 2 L4 6 L8 10" data-astro-cid-oqbatd3p></path> </svg> </span> </a>` : renderTemplate`<span class="issue-nav-pill__btn issue-nav-pill__btn--disabled" aria-hidden="true" data-astro-cid-oqbatd3p> <span class="issue-nav-pill__icon issue-nav-pill__icon--left" data-astro-cid-oqbatd3p> <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-oqbatd3p> <path d="M8 2 L4 6 L8 10" data-astro-cid-oqbatd3p></path> </svg> </span> </span>`} <!-- Centro: link Archivio --> <a href="/archivio" class="issue-nav-pill__center" data-tooltip="Torna all'archivio" data-astro-cid-oqbatd3p>
Archivio
</a> <!-- Freccia destra: numero successivo --> ${nextSlug ? renderTemplate`<a${addAttribute(`/archivio/${nextSlug}`, "href")} class="issue-nav-pill__btn issue-nav-pill__btn--next" aria-label="Numero successivo" data-tooltip="Numero successivo" data-astro-cid-oqbatd3p> <span class="issue-nav-pill__icon issue-nav-pill__icon--right" aria-hidden="true" data-astro-cid-oqbatd3p> <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-oqbatd3p> <path d="M4 2 L8 6 L4 10" data-astro-cid-oqbatd3p></path> </svg> </span> </a>` : renderTemplate`<span class="issue-nav-pill__btn issue-nav-pill__btn--disabled" aria-hidden="true" data-astro-cid-oqbatd3p> <span class="issue-nav-pill__icon issue-nav-pill__icon--right" data-astro-cid-oqbatd3p> <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-oqbatd3p> <path d="M4 2 L8 6 L4 10" data-astro-cid-oqbatd3p></path> </svg> </span> </span>`} </div> </nav>  `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/IssueNavPill.astro", void 0);

const $$Astro = createAstro();
async function getStaticPaths() {
  const rawNumeri = await getAllNumeriRivista();
  function numProgressivo(idNumero) {
    const m = idNumero.match(/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  }
  const numeriOrdinati = [...rawNumeri].sort((a, b) => {
    const annoA = a.anno_pubblicazione ?? 0;
    const annoB = b.anno_pubblicazione ?? 0;
    if (annoA !== annoB) return annoA - annoB;
    return numProgressivo(a.id_numero) - numProgressivo(b.id_numero);
  });
  const allArticoli = await getAllArticoliBuild();
  return numeriOrdinati.map((numero, index) => {
    const issueSlug = numero.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const prevNumero = index > 0 ? numeriOrdinati[index - 1] : null;
    const nextNumero = index < numeriOrdinati.length - 1 ? numeriOrdinati[index + 1] : null;
    const prevSlug = prevNumero ? prevNumero.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-") : null;
    const nextSlug = nextNumero ? nextNumero.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-") : null;
    const articoliNumero = allArticoli.filter(
      (a) => a.numero_rivista?.id === numero.id && a.stato === "published"
    );
    return {
      params: { issue: issueSlug },
      props: { numero, prevSlug, nextSlug, articoliNumero }
    };
  });
}
const $$issue = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$issue;
  const { numero, prevSlug, nextSlug, articoliNumero: rawArticoliNumero } = Astro2.props;
  const articoliNumero = [...rawArticoliNumero].sort((a, b) => {
    const tA = a.data_pubblicazione ? new Date(a.data_pubblicazione).getTime() : 0;
    const tB = b.data_pubblicazione ? new Date(b.data_pubblicazione).getTime() : 0;
    return tA - tB;
  });
  const archiveViewUrl = numero.wp_url || null;
  const pdfUrl = numero.pdf_archive_url || null;
  const copertinaNumeroUrl = getNumeroImageUrl(numero);
  const testata = numero.tipo === "ins" ? "Insieme" : "Ombre e Luci";
  const descrizione = numero.descrizione || null;
  const articoliIt = articoliNumero.filter((a) => a.lang !== "en");
  const articoliEn = articoliNumero.filter((a) => a.lang === "en");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${numero.display_title} \u2013 Archivio`, "description": numero.descrizione ?? `${testata} \u2013 ${numero.display_title}: sfoglia gli articoli e scarica il PDF.`, "noindex": true, "ogImage": copertinaNumeroUrl, "data-astro-cid-76y6f2ef": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="issue-main" data-astro-cid-76y6f2ef> <div class="issue-container" data-astro-cid-76y6f2ef>  <section class="hero-section" data-astro-cid-76y6f2ef> <div class="hero-cover" data-astro-cid-76y6f2ef> ${copertinaNumeroUrl ? renderTemplate`<img${addAttribute(copertinaNumeroUrl, "src")}${addAttribute(`Copertina ${testata} ${numero.id_numero}`, "alt")}${addAttribute(380, "width")}${addAttribute(507, "height")} data-copertina-fallback data-astro-cid-76y6f2ef>` : renderTemplate`<div style="width: 100%; aspect-ratio: 3/4; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; padding: 2rem;" data-astro-cid-76y6f2ef> <span style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;" data-astro-cid-76y6f2ef>${testata}</span> <span style="font-size: 1rem;" data-astro-cid-76y6f2ef>${numero.id_numero}</span> </div>`} </div> <div class="hero-content" data-astro-cid-76y6f2ef> <span class="hero-badge" data-astro-cid-76y6f2ef>${testata}</span> <h1 class="hero-title" data-astro-cid-76y6f2ef> ${numero.display_title} </h1> <div class="hero-meta" data-astro-cid-76y6f2ef> <div class="hero-meta-item" data-astro-cid-76y6f2ef> <span class="hero-meta-label" data-astro-cid-76y6f2ef>Numero:</span> <span data-astro-cid-76y6f2ef>${numero.id_numero}</span> </div> <div class="hero-meta-item" data-astro-cid-76y6f2ef> <span class="hero-meta-label" data-astro-cid-76y6f2ef>Anno:</span> <span data-astro-cid-76y6f2ef>${numero.anno_pubblicazione}</span> </div> </div> ${descrizione && renderTemplate`<div class="hero-description" data-astro-cid-76y6f2ef>${unescapeHTML(descrizione)}</div>`} <div class="hero-actions" data-astro-cid-76y6f2ef> ${archiveViewUrl ? renderTemplate`<a${addAttribute(archiveViewUrl, "href")} target="_blank" rel="noopener noreferrer" class="hero-button" data-astro-cid-76y6f2ef> <span data-astro-cid-76y6f2ef>📖</span> <span data-astro-cid-76y6f2ef>Sfoglia Online</span> </a>` : renderTemplate`<button class="hero-button" disabled data-astro-cid-76y6f2ef> <span data-astro-cid-76y6f2ef>📖</span> <span data-astro-cid-76y6f2ef>Sfoglia Online (non disponibile)</span> </button>`} ${pdfUrl ? renderTemplate`<a${addAttribute(pdfUrl, "href")} target="_blank" rel="noopener noreferrer" class="hero-button secondary" data-astro-cid-76y6f2ef> <span data-astro-cid-76y6f2ef>📥</span> <span data-astro-cid-76y6f2ef>Scarica PDF</span> </a>` : renderTemplate`<button class="hero-button secondary" disabled data-astro-cid-76y6f2ef> <span data-astro-cid-76y6f2ef>📥</span> <span data-astro-cid-76y6f2ef>Scarica PDF (non disponibile)</span> </button>`} </div> </div> </section>  <section class="articles-section" data-astro-cid-76y6f2ef> <div class="articles-header" data-astro-cid-76y6f2ef> <h2 class="articles-title" data-astro-cid-76y6f2ef>Articoli in questo numero</h2> <p class="articles-count" data-astro-cid-76y6f2ef> ${articoliIt.length} ${articoliIt.length === 1 ? "articolo" : "articoli"} ${articoliEn.length > 0 && ` \xB7 ${articoliEn.length} in English`} </p> </div> ${articoliNumero.length > 0 ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-76y6f2ef": true }, { "default": async ($$result3) => renderTemplate` <div class="articles-grid" data-astro-cid-76y6f2ef> ${articoliIt.map((a) => {
    const articleDate = a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date();
    const { categoria_menu } = getMegaclusterForArticle(a);
    const { formal } = getLabels([], a);
    const articleImage = getArticoloCopertinaSrc(a);
    return renderTemplate`${renderComponent($$result3, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "categoriaMenu": categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? "Autore sconosciuto", "date": articleDate, "image": articleImage, "data-astro-cid-76y6f2ef": true })}`;
  })} </div> ${articoliEn.length > 0 && renderTemplate`<div class="english-edition-section" data-astro-cid-76y6f2ef> <h2 data-astro-cid-76y6f2ef>English Edition</h2> <div class="articles-grid" data-astro-cid-76y6f2ef> ${articoliEn.map((a) => {
    const articleDate = a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date();
    const { categoria_menu } = getMegaclusterForArticle(a);
    const { formal } = getLabels([], a);
    const articleImage = getArticoloCopertinaSrc(a);
    return renderTemplate`${renderComponent($$result3, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "categoriaMenu": categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? "Autore sconosciuto", "date": articleDate, "image": articleImage, "data-astro-cid-76y6f2ef": true })}`;
  })} </div> </div>`}` })}` : renderTemplate`<div class="no-articles" data-astro-cid-76y6f2ef> <h3 class="no-articles-title" data-astro-cid-76y6f2ef>Nessun articolo trovato</h3> <p data-astro-cid-76y6f2ef>Non sono stati trovati articoli associati a questo numero.</p> </div>`} </section> </div> </main> ${renderComponent($$result2, "IssueNavPill", $$IssueNavPill, { "prevSlug": prevSlug, "nextSlug": nextSlug, "data-astro-cid-76y6f2ef": true })} ` })} `;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/[issue].astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/[issue].astro";
const $$url = "/archivio/[issue]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$issue,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
