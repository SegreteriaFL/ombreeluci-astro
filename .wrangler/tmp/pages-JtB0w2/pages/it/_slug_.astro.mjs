globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, m as maybeRenderHead, e as addAttribute, r as renderTemplate, b as renderComponent, F as Fragment, u as unescapeHTML, d as defineScriptVars } from '../../chunks/astro/server_BT9XwReg.mjs';
import { b as getArticoloCopertinaSrc, i as directusCredsFromAstroLocals, p as getArticoloBySlug, q as getArticoliBySlugList, r as getFallbackRelatedArticles, a as getAutoreImageUrl, C as COPERTINA_IMG_ONERROR } from '../../chunks/directus_BvF_bImd.mjs';
import { g as getPlaceholder, $ as $$ArticleCard } from '../../chunks/ArticleCard_BcaTyrt5.mjs';
import { $ as $$ArticlePageLayout, a as $$Commenti, b as $$EditorialFeedback, c as autoriStats, d as $$CTAArticolo } from '../../chunks/CTAArticolo_BKGMbCaw.mjs';
import { f as getThemeLabel, h as getCategorySlugForArticle, d as getCategoriaUrlSlug, a as getLabels, i as getFormaToRubricaSlug, g as getMegaclusterForArticle } from '../../chunks/taxonomy_BacsMRxg.mjs';
import { t, a as localizeFormalType } from '../../chunks/Footer_DN9MDnF9.mjs';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const $$Astro$1 = createAstro("https://ombreeluci.it");
const $$LeggiAnche = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$LeggiAnche;
  const { articolo } = Astro2.props;
  if (!articolo) return;
  const href = `/it/${articolo.slug}`;
  const image = getArticoloCopertinaSrc(articolo) ?? "/placeholder/ph-1.jpg";
  const _excerpt = articolo.sottotitolo?.trim() || articolo.seo_description?.trim() || null;
  const sottotitolo = _excerpt && _excerpt !== articolo.titolo?.trim() ? _excerpt : null;
  return renderTemplate`${maybeRenderHead()}<aside class="leggi-anche" data-astro-cid-3mqzycu7> <a${addAttribute(href, "href")} class="leggi-anche-link" data-astro-cid-3mqzycu7> <span class="leggi-anche-label" data-astro-cid-3mqzycu7>Leggi anche</span> <div class="leggi-anche-inner" data-astro-cid-3mqzycu7> ${image && renderTemplate`<div class="leggi-anche-img" data-astro-cid-3mqzycu7> <img${addAttribute(image, "src")}${addAttribute(articolo.titolo, "alt")} loading="lazy" data-astro-cid-3mqzycu7> </div>`} <div class="leggi-anche-text" data-astro-cid-3mqzycu7> <p class="leggi-anche-title" data-astro-cid-3mqzycu7>${articolo.titolo}</p> ${sottotitolo && renderTemplate`<p class="leggi-anche-excerpt" data-astro-cid-3mqzycu7>${sottotitolo}</p>`} </div> </div> </a> </aside> `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/LeggiAnche.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a, _b, _c;
const $$Astro = createAstro("https://ombreeluci.it");
const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const totalAutori = Array.isArray(autoriStats) ? autoriStats.length : 0;
  const creds = directusCredsFromAstroLocals(Astro2.locals);
  const rawSlug = Astro2.params.slug ?? "";
  const slug = rawSlug.replace(/\/$/, "");
  let articolo;
  try {
    articolo = await getArticoloBySlug(slug, creds);
  } catch (e) {
    console.error("[blog/[...slug].astro] fetch error:", e);
    articolo = null;
  }
  if (!articolo) {
    return new Response("Not found", { status: 404 });
  }
  if (articolo.lang === "en") {
    const enUrlSlug = slug.endsWith("-en") ? slug.slice(0, -3) : slug;
    return Astro2.redirect(`/en/${enUrlSlug}/`, 301);
  }
  Astro2.response.headers.set("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  const locale = articolo.lang === "en" ? "en" : "it";
  const issueLabel = locale === "en" ? "Issue" : "Numero";
  const badgeIssueAriaLabel = locale === "en" ? "Category and issue" : "Categoria e numero";
  const shareLabelFacebook = locale === "en" ? "Share on Facebook" : "Condividi su Facebook";
  const shareLabelX = locale === "en" ? "Share on X (Twitter)" : "Condividi su X (Twitter)";
  const shareLabelWhatsapp = locale === "en" ? "Share on WhatsApp" : "Condividi su WhatsApp";
  const shareLabelLinkedin = locale === "en" ? "Share on LinkedIn" : "Condividi su LinkedIn";
  const copyLinkLabel = locale === "en" ? "Copy link" : "Copia link";
  const copiedLinkLabel = locale === "en" ? "Link copied!" : "Link copiato!";
  let correlatiMap = {};
  try {
    const correlatiRes = await fetch(`${Astro2.url.origin}/correlati.json`);
    if (correlatiRes.ok) correlatiMap = await correlatiRes.json();
  } catch (e) {
    console.warn("[blog/[...slug].astro] correlati.json fetch failed:", e);
  }
  const correlatiSlugsRaw = correlatiMap[articolo.slug] ?? [];
  let correlatiArticoli = await getArticoliBySlugList(correlatiSlugsRaw.slice(0, 10), creds).catch(() => []);
  if (correlatiArticoli.length === 0) {
    const preferred = await getFallbackRelatedArticles(
      {
        excludeSlug: articolo.slug,
        lang: articolo.lang === "en" ? "en" : "it",
        categoriaMenu: articolo.categoria_menu ?? null,
        limit: 4
      },
      creds
    ).catch(() => []);
    correlatiArticoli = preferred;
    if (correlatiArticoli.length === 0) {
      correlatiArticoli = await getFallbackRelatedArticles(
        {
          excludeSlug: articolo.slug,
          lang: articolo.lang === "en" ? "en" : "it",
          limit: 4
        },
        creds
      ).catch(() => []);
    }
  }
  const correlatiSlugsEffective = correlatiSlugsRaw.length > 0 ? correlatiSlugsRaw : correlatiArticoli.map((a) => a.slug);
  function formatDateItalian(date, lang = "it") {
    return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
  }
  function generateAuthorSlug(name) {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function generateIssueSlug(issueNumber2) {
    return issueNumber2.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  }
  function calculateReadingTimeFromHtml(html) {
    if (!html) return 3;
    const textOnly = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const wordCount = textOnly.split(/\s+/).filter((w) => w.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }
  const articleTitle = articolo.titolo;
  const articleDate = articolo.data_pubblicazione ? new Date(articolo.data_pubblicazione) : /* @__PURE__ */ new Date();
  const autoreCompleto = articolo.autore;
  const autoreName = autoreCompleto?.nome_completo ?? t(locale, "author_unknown");
  const authorSlug = generateAuthorSlug(autoreName);
  const authorBioHtml = autoreCompleto?.bio_html?.trim() || null;
  const isJeanVanier = autoreCompleto?.slug === "jean-vanier" || autoreName.toLowerCase().includes("jean vanier");
  const authorFotoId = autoreCompleto?.foto?.id ?? null;
  const authorImagePath = authorFotoId ? getAutoreImageUrl(authorFotoId) : `/assets/authors/${authorSlug}.jpg`;
  const authorBio = authorBioHtml;
  const _bioStripped = authorBioHtml ? authorBioHtml.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : null;
  const authorBioTruncated = _bioStripped && _bioStripped.length > 200 ? _bioStripped.substring(0, 200).replace(/\s\S*$/, "") + "\u2026" : null;
  const readingTime = calculateReadingTimeFromHtml(articolo.corpo);
  const slugToArticolo = Object.fromEntries(correlatiArticoli.map((a) => [a.slug, a]));
  function splitCorpoAfterNthParagraph(html, n) {
    let count = 0;
    let idx = 0;
    while (count < n && idx < html.length) {
      const next = html.indexOf("</p>", idx);
      if (next === -1) break;
      idx = next + 4;
      count++;
    }
    if (count < n) return [html, ""];
    return [html.slice(0, idx), html.slice(idx)];
  }
  function extractYouTubeId(url) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }
  function processEmbeds(html) {
    let out = html;
    let hasInstagram2 = false;
    out = out.replace(
      /<p>\s*(https?:\/\/(?:youtu\.be\/|(?:www\.)?youtube\.com\/watch[^\s<"]*)[^\s<"]*)\s*<\/p>/gi,
      (_, url) => {
        const id = extractYouTubeId(url);
        if (!id) return `<p>${url}</p>`;
        return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${id}" title="Video YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
      }
    );
    if (/<blockquote[^>]+instagram/i.test(out)) {
      hasInstagram2 = true;
      out = out.replace(
        /(<blockquote\b(?![^>]*class)[^>]*)(data-instgrm-permalink)/gi,
        '$1class="instagram-media" $2'
      );
    }
    return { html: out, hasInstagram: hasInstagram2 };
  }
  const rawCorpo = articolo.corpo ?? "";
  const { html: processedCorpo, hasInstagram } = processEmbeds(rawCorpo);
  const leggiAncheSlug = articolo.lang !== "en" ? correlatiSlugsEffective.find((s) => {
    if (correlatiSlugsRaw.length === 0) return true;
    const bCorrelati = correlatiMap[s] ?? [];
    return bCorrelati[0] !== articolo.slug;
  }) ?? null : null;
  const leggiAncheArticolo = leggiAncheSlug ? slugToArticolo[leggiAncheSlug] ?? null : null;
  const [corpoPart1, corpoPart2] = leggiAncheArticolo && processedCorpo ? splitCorpoAfterNthParagraph(processedCorpo, 3) : [processedCorpo, ""];
  const issueNumber = articolo.numero_rivista?.id_numero ?? null;
  const issueSlug = issueNumber ? generateIssueSlug(issueNumber) : null;
  const issueLink = issueSlug ? `/archivio/${issueSlug}` : null;
  const articleImageRaw = getArticoloCopertinaSrc(articolo);
  const articleImage = articolo.immagine_copertina?.id ? articleImageRaw : getPlaceholder(articolo.slug ?? "").src;
  const explicitSubtitle = articolo.sottotitolo?.trim() || articolo.seo_description?.trim() || null;
  const heroCaption = articolo.didascalia_copertina?.trim() || null;
  const metaDescription = explicitSubtitle || articolo.seo_description ? (explicitSubtitle || articolo.seo_description).substring(0, 160).replace(/\s+/g, " ").trim() : `${articleTitle} - ${t(locale, "meta_article_default_suffix")}`;
  const categoryDisplay = getThemeLabel(articolo);
  const categorySlug = getCategorySlugForArticle(articolo);
  const categoryLink = categorySlug ? locale === "en" ? `/en/category/${getCategoriaUrlSlug(categorySlug, "en")}/` : `/categoria/${categorySlug}/` : null;
  const currentLabels = getLabels([], articolo);
  const formaDisplay = currentLabels.formal && currentLabels.formal !== "Articolo" ? localizeFormalType(currentLabels.formal, locale) : null;
  const rubricaSlug = getFormaToRubricaSlug(currentLabels.formal);
  const formaLink = rubricaSlug ? `/rubriche/${rubricaSlug}/` : null;
  const hasIssue = issueNumber != null && String(issueNumber).trim() !== "";
  const showPubblicatoOnline = !hasIssue;
  const { ruolo_editoriale } = getMegaclusterForArticle(articolo);
  let roleLabel = null;
  let roleClassName = "";
  if (ruolo_editoriale === "portante") {
    roleLabel = t(locale, "badge_role_portante");
    roleClassName = " article-badge-role--portante";
  } else if (ruolo_editoriale === "strutturale") {
    roleLabel = t(locale, "badge_role_strutturale");
    roleClassName = " article-badge-role--strutturale";
  } else if (ruolo_editoriale === "laterale") {
    roleLabel = t(locale, "badge_role_laterale");
    roleClassName = " article-badge-role--laterale";
  } else if (ruolo_editoriale === "trasversale") {
    roleLabel = t(locale, "badge_role_trasversale");
    roleClassName = " article-badge-role--trasversale";
  }
  const pdfUrl = articolo.numero_rivista?.pdf_archive_url ?? null;
  articolo.lang === "en";
  const isCurrentEn = articolo.lang === "en";
  const currentWpIdClean = String(articolo.wp_id ?? "");
  const currentSlug = articolo.slug;
  const alternateItem = articolo.articolo_traduzione ?? null;
  const alternateArticleUrl = alternateItem ? alternateItem.lang === "en" ? `${Astro2.url.origin}/en/${alternateItem.slug.endsWith("-en") ? alternateItem.slug.slice(0, -3) : alternateItem.slug}` : `${Astro2.url.origin}/it/${alternateItem.slug}` : null;
  const wpIdToSlugMap = {};
  for (const a of correlatiArticoli) {
    if (a.wp_id && a.slug) wpIdToSlugMap[a.wp_id] = a.slug;
  }
  const inContentRelatedMap = {};
  for (const a of correlatiArticoli) {
    const imgUrl = getArticoloCopertinaSrc(a);
    const lang = a.lang;
    const isItalian = lang !== "en";
    const category = getCategorySlugForArticle(a) ?? null;
    inContentRelatedMap[a.slug] = {
      title: a.titolo,
      image: imgUrl,
      excerpt: a.sottotitolo?.trim() || null,
      href: isItalian ? `/it/${a.slug}` : `/en/${a.slug.endsWith("-en") ? a.slug.slice(0, -3) : a.slug}`,
      category,
      lang,
      isItalian
    };
  }
  const correlatiSlugs = correlatiSlugsEffective;
  const relatedArticles = (() => {
    const umap = correlatiSlugs.filter((s) => s !== leggiAncheSlug).map((s) => slugToArticolo[s]).filter((a) => !!a && a.id !== articolo.id && (isCurrentEn ? a.lang === "en" : a.lang !== "en")).slice(0, 3);
    return umap.map((a) => {
      const labels = getLabels([], a);
      const { ruolo_editoriale: relRuolo } = getMegaclusterForArticle(a);
      return {
        title: a.titolo,
        author: a.autore?.nome_completo ?? t(locale, "author_unknown"),
        date: a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(),
        issue: a.numero_rivista?.id_numero ?? null,
        slug: a.slug,
        image: getArticoloCopertinaSrc(a),
        categoriaMenu: getThemeLabel(a) ?? null,
        forma: labels.formal,
        ruoloEditoriale: relRuolo
      };
    });
  })();
  return renderTemplate`${renderComponent($$result, "ArticlePageLayout", $$ArticlePageLayout, { "title": articleTitle, "description": metaDescription, "ogImage": articleImage, "ogType": "article", "lang": articolo.lang === "en" ? "en" : "it", "noindex": true, "alternateArticleUrl": alternateArticleUrl, "alternates": [
    { lang: articolo.lang === "en" ? "en" : "it", url: Astro2.url.href },
    ...alternateArticleUrl ? [{ lang: articolo.lang === "en" ? "it" : "en", url: alternateArticleUrl }] : []
  ] }, { "default": async ($$result2) => renderTemplate(_b || (_b = __template(["  ", '<main class="site-main">  <div class="reading-progress" id="reading-progress"></div> <div class="article-container">  <nav class="breadcrumbs"> <a', ">", "</a> ", ' </nav>  <header class="article-header-wrapper">  ', ' <h1 class="article-title">', "</h1>  ", '  <div class="article-meta"> <div class="article-meta-item"> <img', "", ` class="article-meta-author-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy"> <div class="article-meta-author-placeholder" style="display: none;"> `, " </div> <a", ' class="author-link">', '</a> </div> <div class="article-meta-item"> ', ' </div> <div class="article-meta-item"> ', " ", " </div> ", ' </div> </header>  <div class="article-hero-wrapper"> <div class="article-hero-image-wrapper"> <img', "", ' class="article-image" loading="eager" decoding="async" fetchpriority="high" data-copertina-fallback', "> ", " </div> </div>  ", '  <div class="social-sticky" id="social-sticky"> <div class="social-sticky-inner"> <a', ' target="_blank" rel="noopener noreferrer" class="social-link facebook"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link twitter"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link whatsapp"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link linkedin"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path> </svg> </a> <a', ' class="social-link email" aria-label="Invia via email"> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path> </svg> </a> <a href="#" class="social-link copy-link"', "", '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path> </svg> </a> </div> </div>  <div class="article-content-wrapper"> <div class="article-content" id="article-content"> ', " <div>", "</div> ", " ", " </div>  ", "  ", '  <div class="author-bio-section"> <div class="author-bio-wrapper"> <div class="author-bio-avatar"> <img', "", ` class="author-bio-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy"> <div class="author-bio-placeholder" style="display: none;"> `, ' </div> </div> <div class="author-bio-content"> <h3 class="author-bio-name"> <a', ' class="author-bio-link"> ', ' </a> </h3> <div class="author-bio-text"> ', ' </div> <p class="author-bio-total"> ', ' <a href="/autori">', " ", "</a> </p> </div> </div> </div> ", ' </div>  <div class="floating-widget" id="floating-widget"> <button class="close-btn" id="close-widget"', ">\xD7</button> <h4>", "</h4> ", " ", " <a", ' class="widget-link">', "</a> </div>  ", " ", '  <details class="debug-section" hidden> <summary style="cursor: pointer; color: var(--text-secondary); font-size: 0.85rem; margin-top: 2rem; padding: 0.5rem;">\n\u{1F50D} Debug: Dati articolo\n</summary> <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.75rem; margin-top: 0.5rem;">', '\n        </pre> <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.75rem; margin-top: 0.5rem;">ID: ', "\nSlug: ", '\n        </pre> </details> <section class="article-nav-section"', "> <a", ' class="back-link">\u2190 ', "</a> </section> </div> </main> ", "<script>(function(){", `
      window.__BLOG_PAGE_DATA__ = { wpIdToSlugMap, inContentRelatedMap, currentSlug, readAlsoLabel, alternateArticleUrl, currentWpIdClean, lang: articleLang };
    })();<\/script> <script>
      (function() {
        var data = window.__BLOG_PAGE_DATA__;
        if (!data) return;
        var wpIdToSlugMap = data.wpIdToSlugMap || {};
        var inContentRelatedMap = data.inContentRelatedMap || {};
        var currentSlug = data.currentSlug;
        var readAlsoLabel = data.readAlsoLabel || (data.lang === 'en' ? 'READ ALSO' : 'Leggi anche');
        function getContainer() {
          return document.querySelector('article') || document.querySelector('.prose') || document.body;
        }
        function getParagraphs(container) {
          if (!container) return [];
          return Array.from(container.children || []);
        }
        var readAlsoInserted = false;
        function getSlugFromHref(href) {
          if (!href) return null;
          var wpMatch = href.match(/[?&]p=(\\d+)/);
          if (wpMatch && wpIdToSlugMap) {
            var wpId = parseInt(wpMatch[1], 10);
            return wpIdToSlugMap[wpId] || null;
          }
          try {
            var url = new URL(href, window.location.origin);
            var segments = url.pathname.split('/').filter(Boolean);
            var blogIndex = segments.indexOf('blog');
            if (blogIndex !== -1 && segments.length > blogIndex + 1) return segments.slice(blogIndex + 1).join('/');
            if (segments.length > 0) return segments[segments.length - 1];
          } catch (e) {}
          return null;
        }
        function buildRelatedCard(slug, meta) {
          var hrefFinal = meta.href || '/' + slug;
          var safeTitle = (meta.title || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
          var safeExcerpt = (meta.excerpt || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
          var article = document.createElement('article');
          article.className = 'incontent-related-card';
          article.innerHTML = '<a href="' + hrefFinal + '" class="incontent-related-link"><span class="incontent-related-label">' + readAlsoLabel + '</span><div class="incontent-related-image-wrapper"><img src="' + meta.image + '" alt="' + safeTitle + '" loading="lazy" onerror="this.onerror=null;this.src=\\'/images/placeholder-copertina.svg\\'" /></div><div class="incontent-related-content"><h4 class="incontent-related-title">' + safeTitle + '</h4>' + (safeExcerpt ? '<p class="incontent-related-excerpt">' + safeExcerpt + '</p>' : '') + '</div></a>';
          return article;
        }
        function removeOldRelatedSections() {
          var root = getContainer();
          if (!root) return;
          var oldSectionTitles = ['Articoli', 'Editoriale', 'Rubriche', 'Libri'];
          var children = Array.from(root.children);
          var lastThree = children.slice(-3);
          root.querySelectorAll('h4').forEach(function(h4) {
            // Bug 2 fix: rimuovi solo se l'h4 \xE8 tra gli ultimi 3 figli diretti del container
            var isNearEnd = lastThree.includes(h4) || lastThree.some(function(el) { return el.contains(h4); });
            if (!isNearEnd) return;
            var text = (h4.textContent || '').trim();
            if (oldSectionTitles.some(function(t) { return text === t || text.indexOf(t) !== -1 || text.endsWith(t); })) {
              var next = h4.nextElementSibling;
              while (next) {
                var toRemove = next;
                next = next.nextElementSibling;
                toRemove.remove();
              }
              h4.remove();
            }
          });
        }
        function insertReadAlsoBox() {
          if (readAlsoInserted || !inContentRelatedMap) return;
          if (document.querySelector('.incontent-related-card')) return;
          var container = getContainer();
          if (!container) return;
          var currentMeta = currentSlug ? inContentRelatedMap[currentSlug] : null;
          var currentCategory = currentMeta && currentMeta.category ? currentMeta.category : null;
          var allEntries = Object.entries(inContentRelatedMap);
          var candidates = allEntries.filter(function(entry) {
            var slug = entry[0], meta = entry[1];
            if (slug === currentSlug) return false;
            if (!meta || meta.isItalian === false) return false;
            if (currentCategory && meta.category) return meta.category === currentCategory;
            return true;
          });
          if (currentCategory && candidates.length === 0) {
            candidates = allEntries.filter(function(entry) {
              if (entry[0] === currentSlug) return false;
              return !!entry[1] && entry[1].isItalian !== false;
            });
          }
          if (!candidates.length) return;
          var randomIndex = Math.floor(Math.random() * candidates.length);
          var chosenSlug = candidates[randomIndex][0];
          var box = document.createElement('div');
          box.className = 'read-also-box';
          box.dataset.slug = chosenSlug;
          // Bug 3 fix: inserisci dopo il 3\xB0 paragrafo <p> diretto, non il 2\xB0 figlio generico
          var paragraphs = Array.from(container.querySelectorAll(':scope > p'));
          if (!paragraphs.length) return;
          var insertAfter = paragraphs[2] || paragraphs[paragraphs.length - 1];
          insertAfter.insertAdjacentElement('afterend', box);
          readAlsoInserted = true;
        }
        function enhanceReadAlsoBoxes() {
          if (!inContentRelatedMap) return;
          var root = getContainer();
          if (!root) return;
          // Bug 1 fix: nascondi TUTTI i paragrafi che contengono "leggi anche" in qualsiasi posizione
          root.querySelectorAll('p').forEach(function(p) {
            if (/leggi\\s+anche/i.test(p.textContent || '')) {
              p.classList.add('legacy-read-also');
            }
          });
          // Trasforma solo i .read-also-box in card (mai i <p>)
          root.querySelectorAll('.read-also-box').forEach(function(box) {
            var slug = box.dataset.slug || null;
            if (!slug) {
              box.querySelectorAll('a[href]').forEach(function(a) {
                if (!slug) slug = getSlugFromHref(a.getAttribute('href'));
              });
            }
            // Bug 4 fix: se slug non risolvibile o non in mappa, nascondi il box senza mostrare broken card
            if (!slug) { box.style.display = 'none'; return; }
            var meta = inContentRelatedMap[slug];
            if (!meta || meta.isItalian === false) { box.style.display = 'none'; return; }
            var card = buildRelatedCard(slug, meta);
            box.innerHTML = '';
            box.classList.add('incontent-related-container');
            box.appendChild(card);
          });
        }
        function runLeggiAnche() {
          removeOldRelatedSections();
          insertReadAlsoBox();
          enhanceReadAlsoBoxes();
        }
        function scheduleLeggiAnche() {
          readAlsoInserted = false;
          runLeggiAnche();
        }
        function run() { scheduleLeggiAnche(); }
        window.addEventListener('load', run);
        document.addEventListener('astro:after-swap', run);
        if (document.readyState === 'complete') run();
        else setTimeout(run, 100);
      })();
    <\/script>  `], ["  ", '<main class="site-main">  <div class="reading-progress" id="reading-progress"></div> <div class="article-container">  <nav class="breadcrumbs"> <a', ">", "</a> ", ' </nav>  <header class="article-header-wrapper">  ', ' <h1 class="article-title">', "</h1>  ", '  <div class="article-meta"> <div class="article-meta-item"> <img', "", ` class="article-meta-author-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy"> <div class="article-meta-author-placeholder" style="display: none;"> `, " </div> <a", ' class="author-link">', '</a> </div> <div class="article-meta-item"> ', ' </div> <div class="article-meta-item"> ', " ", " </div> ", ' </div> </header>  <div class="article-hero-wrapper"> <div class="article-hero-image-wrapper"> <img', "", ' class="article-image" loading="eager" decoding="async" fetchpriority="high" data-copertina-fallback', "> ", " </div> </div>  ", '  <div class="social-sticky" id="social-sticky"> <div class="social-sticky-inner"> <a', ' target="_blank" rel="noopener noreferrer" class="social-link facebook"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link twitter"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link whatsapp"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link linkedin"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path> </svg> </a> <a', ' class="social-link email" aria-label="Invia via email"> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path> </svg> </a> <a href="#" class="social-link copy-link"', "", '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path> </svg> </a> </div> </div>  <div class="article-content-wrapper"> <div class="article-content" id="article-content"> ', " <div>", "</div> ", " ", " </div>  ", "  ", '  <div class="author-bio-section"> <div class="author-bio-wrapper"> <div class="author-bio-avatar"> <img', "", ` class="author-bio-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy"> <div class="author-bio-placeholder" style="display: none;"> `, ' </div> </div> <div class="author-bio-content"> <h3 class="author-bio-name"> <a', ' class="author-bio-link"> ', ' </a> </h3> <div class="author-bio-text"> ', ' </div> <p class="author-bio-total"> ', ' <a href="/autori">', " ", "</a> </p> </div> </div> </div> ", ' </div>  <div class="floating-widget" id="floating-widget"> <button class="close-btn" id="close-widget"', ">\xD7</button> <h4>", "</h4> ", " ", " <a", ' class="widget-link">', "</a> </div>  ", " ", '  <details class="debug-section" hidden> <summary style="cursor: pointer; color: var(--text-secondary); font-size: 0.85rem; margin-top: 2rem; padding: 0.5rem;">\n\u{1F50D} Debug: Dati articolo\n</summary> <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.75rem; margin-top: 0.5rem;">', '\n        </pre> <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.75rem; margin-top: 0.5rem;">ID: ', "\nSlug: ", '\n        </pre> </details> <section class="article-nav-section"', "> <a", ' class="back-link">\u2190 ', "</a> </section> </div> </main> ", "<script>(function(){", `
      window.__BLOG_PAGE_DATA__ = { wpIdToSlugMap, inContentRelatedMap, currentSlug, readAlsoLabel, alternateArticleUrl, currentWpIdClean, lang: articleLang };
    })();<\/script> <script>
      (function() {
        var data = window.__BLOG_PAGE_DATA__;
        if (!data) return;
        var wpIdToSlugMap = data.wpIdToSlugMap || {};
        var inContentRelatedMap = data.inContentRelatedMap || {};
        var currentSlug = data.currentSlug;
        var readAlsoLabel = data.readAlsoLabel || (data.lang === 'en' ? 'READ ALSO' : 'Leggi anche');
        function getContainer() {
          return document.querySelector('article') || document.querySelector('.prose') || document.body;
        }
        function getParagraphs(container) {
          if (!container) return [];
          return Array.from(container.children || []);
        }
        var readAlsoInserted = false;
        function getSlugFromHref(href) {
          if (!href) return null;
          var wpMatch = href.match(/[?&]p=(\\\\d+)/);
          if (wpMatch && wpIdToSlugMap) {
            var wpId = parseInt(wpMatch[1], 10);
            return wpIdToSlugMap[wpId] || null;
          }
          try {
            var url = new URL(href, window.location.origin);
            var segments = url.pathname.split('/').filter(Boolean);
            var blogIndex = segments.indexOf('blog');
            if (blogIndex !== -1 && segments.length > blogIndex + 1) return segments.slice(blogIndex + 1).join('/');
            if (segments.length > 0) return segments[segments.length - 1];
          } catch (e) {}
          return null;
        }
        function buildRelatedCard(slug, meta) {
          var hrefFinal = meta.href || '/' + slug;
          var safeTitle = (meta.title || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
          var safeExcerpt = (meta.excerpt || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
          var article = document.createElement('article');
          article.className = 'incontent-related-card';
          article.innerHTML = '<a href="' + hrefFinal + '" class="incontent-related-link"><span class="incontent-related-label">' + readAlsoLabel + '</span><div class="incontent-related-image-wrapper"><img src="' + meta.image + '" alt="' + safeTitle + '" loading="lazy" onerror="this.onerror=null;this.src=\\\\'/images/placeholder-copertina.svg\\\\'" /></div><div class="incontent-related-content"><h4 class="incontent-related-title">' + safeTitle + '</h4>' + (safeExcerpt ? '<p class="incontent-related-excerpt">' + safeExcerpt + '</p>' : '') + '</div></a>';
          return article;
        }
        function removeOldRelatedSections() {
          var root = getContainer();
          if (!root) return;
          var oldSectionTitles = ['Articoli', 'Editoriale', 'Rubriche', 'Libri'];
          var children = Array.from(root.children);
          var lastThree = children.slice(-3);
          root.querySelectorAll('h4').forEach(function(h4) {
            // Bug 2 fix: rimuovi solo se l'h4 \xE8 tra gli ultimi 3 figli diretti del container
            var isNearEnd = lastThree.includes(h4) || lastThree.some(function(el) { return el.contains(h4); });
            if (!isNearEnd) return;
            var text = (h4.textContent || '').trim();
            if (oldSectionTitles.some(function(t) { return text === t || text.indexOf(t) !== -1 || text.endsWith(t); })) {
              var next = h4.nextElementSibling;
              while (next) {
                var toRemove = next;
                next = next.nextElementSibling;
                toRemove.remove();
              }
              h4.remove();
            }
          });
        }
        function insertReadAlsoBox() {
          if (readAlsoInserted || !inContentRelatedMap) return;
          if (document.querySelector('.incontent-related-card')) return;
          var container = getContainer();
          if (!container) return;
          var currentMeta = currentSlug ? inContentRelatedMap[currentSlug] : null;
          var currentCategory = currentMeta && currentMeta.category ? currentMeta.category : null;
          var allEntries = Object.entries(inContentRelatedMap);
          var candidates = allEntries.filter(function(entry) {
            var slug = entry[0], meta = entry[1];
            if (slug === currentSlug) return false;
            if (!meta || meta.isItalian === false) return false;
            if (currentCategory && meta.category) return meta.category === currentCategory;
            return true;
          });
          if (currentCategory && candidates.length === 0) {
            candidates = allEntries.filter(function(entry) {
              if (entry[0] === currentSlug) return false;
              return !!entry[1] && entry[1].isItalian !== false;
            });
          }
          if (!candidates.length) return;
          var randomIndex = Math.floor(Math.random() * candidates.length);
          var chosenSlug = candidates[randomIndex][0];
          var box = document.createElement('div');
          box.className = 'read-also-box';
          box.dataset.slug = chosenSlug;
          // Bug 3 fix: inserisci dopo il 3\xB0 paragrafo <p> diretto, non il 2\xB0 figlio generico
          var paragraphs = Array.from(container.querySelectorAll(':scope > p'));
          if (!paragraphs.length) return;
          var insertAfter = paragraphs[2] || paragraphs[paragraphs.length - 1];
          insertAfter.insertAdjacentElement('afterend', box);
          readAlsoInserted = true;
        }
        function enhanceReadAlsoBoxes() {
          if (!inContentRelatedMap) return;
          var root = getContainer();
          if (!root) return;
          // Bug 1 fix: nascondi TUTTI i paragrafi che contengono "leggi anche" in qualsiasi posizione
          root.querySelectorAll('p').forEach(function(p) {
            if (/leggi\\\\s+anche/i.test(p.textContent || '')) {
              p.classList.add('legacy-read-also');
            }
          });
          // Trasforma solo i .read-also-box in card (mai i <p>)
          root.querySelectorAll('.read-also-box').forEach(function(box) {
            var slug = box.dataset.slug || null;
            if (!slug) {
              box.querySelectorAll('a[href]').forEach(function(a) {
                if (!slug) slug = getSlugFromHref(a.getAttribute('href'));
              });
            }
            // Bug 4 fix: se slug non risolvibile o non in mappa, nascondi il box senza mostrare broken card
            if (!slug) { box.style.display = 'none'; return; }
            var meta = inContentRelatedMap[slug];
            if (!meta || meta.isItalian === false) { box.style.display = 'none'; return; }
            var card = buildRelatedCard(slug, meta);
            box.innerHTML = '';
            box.classList.add('incontent-related-container');
            box.appendChild(card);
          });
        }
        function runLeggiAnche() {
          removeOldRelatedSections();
          insertReadAlsoBox();
          enhanceReadAlsoBoxes();
        }
        function scheduleLeggiAnche() {
          readAlsoInserted = false;
          runLeggiAnche();
        }
        function run() { scheduleLeggiAnche(); }
        window.addEventListener('load', run);
        document.addEventListener('astro:after-swap', run);
        if (document.readyState === 'complete') run();
        else setTimeout(run, 100);
      })();
    <\/script>  `])), maybeRenderHead(), addAttribute(locale === "en" ? "/en/" : "/it/archivio", "href"), t(locale, "nav_archive"), issueNumber && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${" > "}<a${addAttribute(issueLink, "href")}>${issueLabel} ${issueNumber}</a> ` })}`, !showPubblicatoOnline ? renderTemplate`<nav class="article-category-badge"${addAttribute(badgeIssueAriaLabel, "aria-label")}> ${issueLink && renderTemplate`<a${addAttribute(issueLink, "href")} class="article-badge-link">${issueLabel} ${issueNumber}</a>`} ${issueLink && (formaDisplay || categoryLink) && renderTemplate`<span class="article-badge-sep"> • </span>`} ${formaDisplay && (formaLink ? renderTemplate`<a${addAttribute(formaLink, "href")} class="article-badge-link">${formaDisplay}</a>` : renderTemplate`<span class="article-badge-text">${formaDisplay}</span>`)} ${formaDisplay && categoryDisplay && renderTemplate`<span class="article-badge-sep"> / </span>`} ${categoryLink ? renderTemplate`<a${addAttribute(categoryLink, "href")} class="article-badge-link">${categoryDisplay}</a>` : renderTemplate`<span class="article-badge-text">${categoryDisplay}</span>`} </nav>` : renderTemplate`<div class="article-category-badge article-category-badge--online"> ${categoryLink ? renderTemplate`<a${addAttribute(categoryLink, "href")} class="article-badge-link">${categoryDisplay}</a>` : t(locale, "published_online")} </div>`, articleTitle, explicitSubtitle && renderTemplate`<div class="article-subtitle"> ${explicitSubtitle} </div>`, addAttribute(authorImagePath, "src"), addAttribute(autoreName, "alt"), autoreName.charAt(0).toUpperCase(), addAttribute(`/it/autori/${authorSlug}`, "href"), autoreName, formatDateItalian(articleDate, locale), readingTime, t(locale, "min_read"), roleLabel && renderTemplate`<div class="article-meta-item"> <span${addAttribute(`article-badge-role${roleClassName}`, "class")}>${roleLabel}</span> </div>`, addAttribute(articleImage, "src"), addAttribute(articleTitle, "alt"), addAttribute(COPERTINA_IMG_ONERROR, "onerror"), heroCaption && renderTemplate`<div class="article-image-caption"> <img src="https://www.ombreeluci.it/wp-content/uploads/2023/10/icon-camera.png" alt="" class="caption-camera-icon" aria-hidden="true"> ${heroCaption} </div>`, articleDate.getFullYear() < 2e3 && renderTemplate`<div class="article-header-wrapper"> ${locale === "en" ? renderTemplate`<div class="archival-alert-en"> <strong>This archival content from ${articleDate.getFullYear()} reflects the language and sensitivities of its time.</strong> </div>` : renderTemplate`<div class="archival-alert"> <strong>Contenuto d'archivio:</strong> Questo articolo del ${articleDate.getFullYear()} riflette il linguaggio e le sensibilità del suo tempo.
</div>`} </div>`, addAttribute(`https://www.facebook.com/sharer/sharer.php?u=${Astro2.url.href}`, "href"), addAttribute(shareLabelFacebook, "aria-label"), addAttribute(`https://twitter.com/intent/tweet?url=${Astro2.url.href}&text=${encodeURIComponent(articleTitle)}`, "href"), addAttribute(shareLabelX, "aria-label"), addAttribute(`https://wa.me/?text=${encodeURIComponent(articleTitle + " " + Astro2.url.href)}`, "href"), addAttribute(shareLabelWhatsapp, "aria-label"), addAttribute(`https://www.linkedin.com/sharing/share-offsite/?url=${Astro2.url.href}`, "href"), addAttribute(shareLabelLinkedin, "aria-label"), addAttribute(`mailto:?subject=${encodeURIComponent(articleTitle)}&body=${encodeURIComponent(Astro2.url.href)}`, "href"), addAttribute(copyLinkLabel, "aria-label"), addAttribute(`event.preventDefault(); navigator.clipboard.writeText('${Astro2.url.href}'); this.setAttribute('aria-label', '${copiedLinkLabel}'); setTimeout(() => this.setAttribute('aria-label', '${copyLinkLabel}'), 2000); return false;`, "onclick"), isJeanVanier && renderTemplate`<aside class="vanier-alert" role="note"> ${locale === "en" ? renderTemplate`<div>Notice: investigations commissioned by L&apos;Arche International established serious responsibility of Fr. Thomas Philippe (first report in 2015) and Jean Vanier (2020) toward several women. <a href="https://www.ombreeluci.it/2020/larca-internazionale-annuncia-i-risultati-dellindagine-indipendente/">Read the latest statement</a>, which unequivocally condemns these actions as “in total contradiction with the values Vanier advocated” and with “the fundamental principles of our communities”.</div>` : renderTemplate`<div>Avviso: inchieste promosse dall&apos;Arca internazionale hanno accertato gravi responsabilità di padre Thomas Philippe (la prima nel 2015) e di Jean Vanier (2020) nei confronti di diverse donne. <a href="https://www.ombreeluci.it/2020/larca-internazionale-annuncia-i-risultati-dellindagine-indipendente/">Qui il comunicato più recente</a> che condanna senza riserve queste azioni «in totale contraddizione con i valori che Vanier sosteneva» e con «i principi fondamentali delle nostre comunità».</div>`} </aside>`, unescapeHTML(corpoPart1), leggiAncheArticolo && renderTemplate`${renderComponent($$result2, "LeggiAnche", $$LeggiAnche, { "articolo": leggiAncheArticolo })}`, corpoPart2 && renderTemplate`<div>${unescapeHTML(corpoPart2)}</div>`, articolo.tags?.filter((t2) => t2.tags_id).length > 0 && renderTemplate`<nav class="article-tags-list" aria-label="Tag"> ${articolo.tags.filter((t2) => t2.tags_id).map((t2) => renderTemplate`<a${addAttribute(`/tag/${t2.tags_id.slug}`, "href")} class="article-tag-link">${t2.tags_id.nome}</a>`)} </nav>`, renderComponent($$result2, "CTAArticolo", $$CTAArticolo, { "lang": "it", "pageContext": "articolo-it" }), addAttribute(authorImagePath, "src"), addAttribute(autoreName, "alt"), autoreName.charAt(0).toUpperCase(), addAttribute(`/it/autori/${authorSlug}`, "href"), autoreName, authorBioTruncated ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <p>${authorBioTruncated}</p> <a${addAttribute(`/it/autori/${authorSlug}`, "href")} class="author-bio-more"> ${locale === "en" ? "Read more \u2192" : "Leggi di pi\xF9 \u2192"} </a> ` })}` : authorBio ? renderTemplate`<div>${unescapeHTML(authorBio)}</div>` : t(locale, "author_bio_fallback"), t(locale, "author_total_prefix"), totalAutori, t(locale, "author_total"), renderComponent($$result2, "EditorialFeedback", $$EditorialFeedback, { "wpId": articolo.wp_id, "title": articleTitle, "currentRole": ruolo_editoriale, "url": Astro2.url.href, "articoloId": articolo.id, "lang": locale }), addAttribute(t(locale, "widget_close"), "aria-label"), t(locale, "widget_navigate"), pdfUrl ? renderTemplate`<a${addAttribute(pdfUrl, "href")} target="_blank" rel="noopener noreferrer" class="widget-link">${t(locale, "widget_download_pdf")}</a>` : null, issueLink ? renderTemplate`<a${addAttribute(issueLink, "href")} class="widget-link">${t(locale, "widget_go_to_issue")}</a>` : null, addAttribute(locale === "en" ? "/en/" : "/it/archivio", "href"), t(locale, "nav_archive"), relatedArticles.length > 0 && renderTemplate`<section class="related-footer-section"${addAttribute(locale === "en" ? "Related articles" : "Articoli correlati", "aria-label")}> <div class="related-footer-inner"> <h2 class="related-footer-title"> ${locale === "en" ? "Related articles" : "Articoli correlati"} </h2> <div class="related-footer-grid"> ${relatedArticles.map((rel) => renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": rel.title, "author": rel.author, "date": rel.date, "issue": rel.issue, "slug": rel.slug, "image": rel.image, "categoriaMenu": rel.categoriaMenu, "forma": rel.forma, "ruoloEditoriale": rel.ruoloEditoriale, "lang": locale })}`)} </div> </div> </section>`, renderComponent($$result2, "Commenti", $$Commenti, { "articoloId": articolo.id, "lang": locale }), JSON.stringify({ id: articolo.id, wp_id: articolo.wp_id, slug: articolo.slug, titolo: articolo.titolo, lang: articolo.lang, stato: articolo.stato, data_pubblicazione: articolo.data_pubblicazione }, null, 2), articolo.id, articolo.slug, addAttribute(t(locale, "aria_article_bottom_nav"), "aria-label"), addAttribute(locale === "en" ? "/en/" : "/", "href"), t(locale, "back_to_home"), hasInstagram && renderTemplate(_a || (_a = __template(['<script async src="https://www.instagram.com/embed.js"><\/script>']))), defineScriptVars({ wpIdToSlugMap, inContentRelatedMap, currentSlug, readAlsoLabel: t(locale, "read_also"), alternateArticleUrl, currentWpIdClean, articleLang: articolo.lang })), "head": async ($$result2) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "slot": "head" }, { "default": async ($$result3) => renderTemplate(_c || (_c = __template([' <meta name="pagefind:meta"', '> <script type="application/ld+json">', '<\/script> <script type="application/ld+json">', "<\/script> "])), addAttribute(`author:${autoreName}`, "content"), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": articleTitle,
    "description": metaDescription ?? void 0,
    "image": articleImage?.startsWith("http") ? articleImage : `https://ombreeluci.it${articleImage}`,
    "datePublished": articleDate.toISOString(),
    "dateModified": articleDate.toISOString(),
    "inLanguage": articolo.lang === "en" ? "en-US" : "it-IT",
    "author": {
      "@type": "Person",
      "name": autoreName,
      "url": `https://ombreeluci.it/it/autori/${authorSlug}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Ombre e Luci",
      "url": "https://ombreeluci.it",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ombreeluci.it/logo.svg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": Astro2.url.href
    },
    ...articolo.numero_rivista?.id_numero ? {
      "isPartOf": {
        "@type": "PublicationIssue",
        "@id": `https://ombreeluci.it/archivio/${articolo.numero_rivista.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`
      }
    } : {}
  })), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": (() => {
      const site = "https://ombreeluci.it";
      const archiveHref = locale === "en" ? `${site}/en` : `${site}/archivio`;
      const items = [
        {
          "@type": "ListItem",
          "position": 1,
          "name": t(locale, "nav_archive"),
          "item": archiveHref
        }
      ];
      if (categoryDisplay && categoryLink) {
        items.push({
          "@type": "ListItem",
          "position": 2,
          "name": categoryDisplay,
          "item": `${site}${categoryLink}`
        });
      }
      items.push({
        "@type": "ListItem",
        "position": items.length + 1,
        "name": articleTitle
      });
      return items;
    })()
  }))) })}` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/it/[slug].astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/it/[slug].astro";
const $$url = "/it/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
