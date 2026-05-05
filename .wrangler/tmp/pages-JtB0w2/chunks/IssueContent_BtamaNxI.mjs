globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, m as maybeRenderHead, e as addAttribute, r as renderTemplate, u as unescapeHTML, b as renderComponent, F as Fragment } from './astro/server_BT9XwReg.mjs';
import { t, u as ultimoNumeroData } from './Footer_DN9MDnF9.mjs';
import { $ as $$ArticleCard } from './ArticleCard_BcaTyrt5.mjs';
/* empty css                           */
import { $ as $$CTAArchivio } from './CTAArchivio_BQP5Iqe3.mjs';
import { g as getMegaclusterForArticle, a as getLabels } from './taxonomy_BacsMRxg.mjs';
import { g as getNumeroImageUrl, b as getArticoloCopertinaSrc } from './directus_BvF_bImd.mjs';

const $$Astro$1 = createAstro("https://ombreeluci.it");
const $$IssueNavPill = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$IssueNavPill;
  const { prevSlug, nextSlug, archiveBasePath = "/it/archivio" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<nav class="issue-nav-pill" aria-label="Navigazione tra i numeri dell'archivio" data-astro-cid-oqbatd3p> <div class="issue-nav-pill__inner" data-astro-cid-oqbatd3p> <!-- Freccia sinistra: numero precedente --> ${prevSlug ? renderTemplate`<a${addAttribute(prevSlug, "href")} class="issue-nav-pill__btn issue-nav-pill__btn--prev" aria-label="Numero precedente" data-tooltip="Numero precedente" data-astro-cid-oqbatd3p> <span class="issue-nav-pill__icon issue-nav-pill__icon--left" aria-hidden="true" data-astro-cid-oqbatd3p> <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-oqbatd3p> <path d="M8 2 L4 6 L8 10" data-astro-cid-oqbatd3p></path> </svg> </span> </a>` : renderTemplate`<span class="issue-nav-pill__btn issue-nav-pill__btn--disabled" aria-hidden="true" data-astro-cid-oqbatd3p> <span class="issue-nav-pill__icon issue-nav-pill__icon--left" data-astro-cid-oqbatd3p> <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-oqbatd3p> <path d="M8 2 L4 6 L8 10" data-astro-cid-oqbatd3p></path> </svg> </span> </span>`} <!-- Centro: link Magazine --> <a${addAttribute(archiveBasePath, "href")} class="issue-nav-pill__center" data-tooltip="Tutti i numeri" data-astro-cid-oqbatd3p>
Magazine
</a> <!-- Freccia destra: numero successivo --> ${nextSlug ? renderTemplate`<a${addAttribute(nextSlug, "href")} class="issue-nav-pill__btn issue-nav-pill__btn--next" aria-label="Numero successivo" data-tooltip="Numero successivo" data-astro-cid-oqbatd3p> <span class="issue-nav-pill__icon issue-nav-pill__icon--right" aria-hidden="true" data-astro-cid-oqbatd3p> <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-oqbatd3p> <path d="M4 2 L8 6 L4 10" data-astro-cid-oqbatd3p></path> </svg> </span> </a>` : renderTemplate`<span class="issue-nav-pill__btn issue-nav-pill__btn--disabled" aria-hidden="true" data-astro-cid-oqbatd3p> <span class="issue-nav-pill__icon issue-nav-pill__icon--right" data-astro-cid-oqbatd3p> <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-oqbatd3p> <path d="M4 2 L8 6 L4 10" data-astro-cid-oqbatd3p></path> </svg> </span> </span>`} </div> </nav>  `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/IssueNavPill.astro", void 0);

const $$Astro = createAstro("https://ombreeluci.it");
const $$IssueContent = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$IssueContent;
  const { lang, numero, prevSlug, nextSlug, articoliNumero, archiveBasePath } = Astro2.props;
  const archiveViewUrl = numero.wp_url || null;
  const pdfUrl = numero.pdf_archive_url || null;
  const copertinaNumeroUrl = getNumeroImageUrl(numero);
  const testata = numero.tipo === "ins" ? "Insieme" : "Ombre e Luci";
  const descrizione = numero.descrizione || null;
  const articoliDisplay = lang === "en" ? articoliNumero.filter((a) => a.lang === "en") : articoliNumero.filter((a) => a.lang !== "en");
  const articoliEnExtra = lang === "it" ? articoliNumero.filter((a) => a.lang === "en") : [];
  const prevNavSlug = prevSlug ? `${archiveBasePath}/${prevSlug}` : null;
  const nextNavSlug = nextSlug ? `${archiveBasePath}/${nextSlug}` : null;
  const browseLabel = t(lang, "issue_browse_online");
  const browseNotAvail = lang === "en" ? "Browse online (not available)" : "Sfoglia Online (non disponibile)";
  const pdfLabel = t(lang, "widget_download_pdf");
  const pdfNotAvail = lang === "en" ? "Download PDF (not available)" : "Scarica PDF (non disponibile)";
  const issueLabel = t(lang, "issue_number");
  const yearLabel = lang === "en" ? "Year" : "Anno";
  const noArticlesMsg = lang === "en" ? "No articles found for this issue." : "Non sono stati trovati articoli associati a questo numero.";
  const noArticlesTitle = lang === "en" ? "No articles found" : "Nessun articolo trovato";
  const englishEditionLabel = "English Edition";
  const articleBasePath = lang === "en" ? "/en" : "/it";
  const ultimoSlug = String(ultimoNumeroData.id_numero).toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const ultimoIssueHref = `${archiveBasePath}/${ultimoSlug}`;
  const isUltimoNumero = numero.id_numero === ultimoNumeroData.id_numero;
  return renderTemplate`${maybeRenderHead()}<main class="issue-main" data-astro-cid-hpr7fibz> <div class="issue-container" data-astro-cid-hpr7fibz> <!-- Magazine switcher --> <div class="issue-mag-header" data-astro-cid-hpr7fibz> <p class="issue-mag-eyebrow" data-astro-cid-hpr7fibz>${t(lang, "archive_title")}</p> <div class="mag-switcher" role="tablist" data-astro-cid-hpr7fibz> ${isUltimoNumero ? renderTemplate`<span class="mag-switcher-btn mag-switcher-btn--active" role="tab" aria-selected="true" data-astro-cid-hpr7fibz> ${t(lang, "archive_tab_last")} </span>` : renderTemplate`<a${addAttribute(ultimoIssueHref, "href")} class="mag-switcher-btn" role="tab" data-astro-cid-hpr7fibz> ${t(lang, "archive_tab_last")} </a>`} <a${addAttribute(archiveBasePath, "href")} class="mag-switcher-btn" role="tab" data-astro-cid-hpr7fibz> ${t(lang, "archive_tab_all")} </a> </div> </div> <!-- Hero Section --> <section class="hero-section" data-astro-cid-hpr7fibz> <div class="hero-cover" data-astro-cid-hpr7fibz> ${copertinaNumeroUrl ? renderTemplate`<img${addAttribute(copertinaNumeroUrl, "src")}${addAttribute(`Copertina ${testata} ${numero.id_numero}`, "alt")}${addAttribute(380, "width")}${addAttribute(507, "height")} data-copertina-fallback data-astro-cid-hpr7fibz>` : renderTemplate`<div style="width: 100%; aspect-ratio: 3/4; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; padding: 2rem;" data-astro-cid-hpr7fibz> <span style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;" data-astro-cid-hpr7fibz>${testata}</span> <span style="font-size: 1rem;" data-astro-cid-hpr7fibz>${numero.id_numero}</span> </div>`} </div> <div class="hero-content" data-astro-cid-hpr7fibz> <span class="hero-badge" data-astro-cid-hpr7fibz>${testata}</span> <h1 class="hero-title" data-astro-cid-hpr7fibz> ${numero.display_title} </h1> <div class="hero-meta" data-astro-cid-hpr7fibz> <div class="hero-meta-item" data-astro-cid-hpr7fibz> <span class="hero-meta-label" data-astro-cid-hpr7fibz>${issueLabel}:</span> <span data-astro-cid-hpr7fibz>${numero.id_numero}</span> </div> <div class="hero-meta-item" data-astro-cid-hpr7fibz> <span class="hero-meta-label" data-astro-cid-hpr7fibz>${yearLabel}:</span> <span data-astro-cid-hpr7fibz>${numero.anno_pubblicazione}</span> </div> </div> ${descrizione && renderTemplate`<div class="hero-description" data-astro-cid-hpr7fibz>${unescapeHTML(descrizione)}</div>`} <div class="hero-actions" data-astro-cid-hpr7fibz> ${archiveViewUrl ? renderTemplate`<a${addAttribute(archiveViewUrl, "href")} target="_blank" rel="noopener noreferrer" class="hero-button" data-astro-cid-hpr7fibz> <span data-astro-cid-hpr7fibz>📖</span> <span data-astro-cid-hpr7fibz>${browseLabel}</span> </a>` : renderTemplate`<button class="hero-button" disabled data-astro-cid-hpr7fibz> <span data-astro-cid-hpr7fibz>📖</span> <span data-astro-cid-hpr7fibz>${browseNotAvail}</span> </button>`} ${pdfUrl ? renderTemplate`<a${addAttribute(pdfUrl, "href")} target="_blank" rel="noopener noreferrer" class="hero-button secondary" data-astro-cid-hpr7fibz> <span data-astro-cid-hpr7fibz>📥</span> <span data-astro-cid-hpr7fibz>${pdfLabel}</span> </a>` : renderTemplate`<button class="hero-button secondary" disabled data-astro-cid-hpr7fibz> <span data-astro-cid-hpr7fibz>📥</span> <span data-astro-cid-hpr7fibz>${pdfNotAvail}</span> </button>`} </div> </div> </section> <!-- Articoli --> <section class="articles-section" data-astro-cid-hpr7fibz> <div class="articles-header" data-astro-cid-hpr7fibz> <h2 class="articles-title" data-astro-cid-hpr7fibz>${t(lang, "issue_articles_heading")}</h2> <p class="articles-count" data-astro-cid-hpr7fibz> ${articoliDisplay.length} ${articoliDisplay.length === 1 ? lang === "en" ? "article" : "articolo" : lang === "en" ? "articles" : "articoli"} ${lang === "it" && articoliEnExtra.length > 0 && ` \xB7 ${articoliEnExtra.length} in English`} </p> </div> ${articoliDisplay.length > 0 || articoliEnExtra.length > 0 ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-hpr7fibz": true }, { "default": ($$result2) => renderTemplate` <div class="articles-grid" data-astro-cid-hpr7fibz> ${articoliDisplay.map((a) => {
    const articleDate = a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date();
    const { categoria_menu } = getMegaclusterForArticle(a);
    const { formal } = getLabels([], a);
    const articleImage = getArticoloCopertinaSrc(a);
    return renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "categoriaMenu": categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? (lang === "en" ? "Unknown author" : "Autore sconosciuto"), "date": articleDate, "image": articleImage, "basePath": articleBasePath, "lang": lang, "data-astro-cid-hpr7fibz": true })}`;
  })} </div> ${articoliEnExtra.length > 0 && renderTemplate`<div class="english-edition-section" data-astro-cid-hpr7fibz> <h2 data-astro-cid-hpr7fibz>${englishEditionLabel}</h2> <div class="articles-grid" data-astro-cid-hpr7fibz> ${articoliEnExtra.map((a) => {
    const articleDate = a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date();
    const { categoria_menu } = getMegaclusterForArticle(a);
    const { formal } = getLabels([], a);
    const articleImage = getArticoloCopertinaSrc(a);
    return renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "categoriaMenu": categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? "Unknown author", "date": articleDate, "image": articleImage, "basePath": "/en", "lang": "en", "data-astro-cid-hpr7fibz": true })}`;
  })} </div> </div>`}` })}` : renderTemplate`<div class="no-articles" data-astro-cid-hpr7fibz> <h3 class="no-articles-title" data-astro-cid-hpr7fibz>${noArticlesTitle}</h3> <p data-astro-cid-hpr7fibz>${noArticlesMsg}</p> </div>`} </section> ${renderComponent($$result, "CTAArchivio", $$CTAArchivio, { "lang": lang, "pageContext": "numero", "data-astro-cid-hpr7fibz": true })} </div> </main> ${renderComponent($$result, "IssueNavPill", $$IssueNavPill, { "prevSlug": prevNavSlug, "nextSlug": nextNavSlug, "archiveBasePath": archiveBasePath, "data-astro-cid-hpr7fibz": true })} `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/IssueContent.astro", void 0);

export { $$IssueContent as $ };
