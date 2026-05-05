globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, b as renderComponent, r as renderTemplate, F as Fragment, u as unescapeHTML, e as addAttribute, d as defineScriptVars, m as maybeRenderHead } from '../../chunks/astro/server_BT9XwReg.mjs';
import { i as directusCredsFromAstroLocals, p as getArticoloBySlug, q as getArticoliBySlugList, r as getFallbackRelatedArticles, a as getAutoreImageUrl, b as getArticoloCopertinaSrc, C as COPERTINA_IMG_ONERROR } from '../../chunks/directus_BvF_bImd.mjs';
import { g as getPlaceholder, $ as $$ArticleCard } from '../../chunks/ArticleCard_BcaTyrt5.mjs';
import { $ as $$ArticlePageLayout, a as $$Commenti, b as $$EditorialFeedback, c as autoriStats, d as $$CTAArticolo } from '../../chunks/CTAArticolo_BKGMbCaw.mjs';
import { f as getThemeLabel, h as getCategorySlugForArticle, d as getCategoriaUrlSlug, a as getLabels, i as getFormaToRubricaSlug, j as getRubricaUrlSlug, g as getMegaclusterForArticle } from '../../chunks/taxonomy_BacsMRxg.mjs';
import { t, l as localizeCategory, d as localizeTheme, a as localizeFormalType } from '../../chunks/Footer_DN9MDnF9.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a, _b, _c;
const $$Astro = createAstro("https://ombreeluci.it");
const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const totalAutori = Array.isArray(autoriStats) ? autoriStats.length : 0;
  const creds = directusCredsFromAstroLocals(Astro2.locals);
  const urlSlug = (Astro2.params.slug ?? "").replace(/\/$/, "");
  let articolo;
  try {
    articolo = await getArticoloBySlug(urlSlug, creds);
    if (articolo && articolo.lang !== "en") articolo = null;
  } catch (e) {
    articolo = null;
  }
  if (!articolo) {
    const directusSlug = urlSlug.endsWith("-en") ? urlSlug : `${urlSlug}-en`;
    try {
      articolo = await getArticoloBySlug(directusSlug, creds);
      if (articolo && articolo.lang !== "en") articolo = null;
    } catch (e) {
      console.error("[en/[slug].astro] fetch error:", e);
      articolo = null;
    }
  }
  if (!articolo || articolo.lang !== "en") {
    return new Response("Not found", { status: 404 });
  }
  Astro2.response.headers.set("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  const locale = "en";
  const issueLabel = "Issue";
  const badgeIssueAriaLabel = "Category and issue";
  const shareLabelFacebook = "Share on Facebook";
  const shareLabelX = "Share on X (Twitter)";
  const shareLabelWhatsapp = "Share on WhatsApp";
  const shareLabelLinkedin = "Share on LinkedIn";
  const copyLinkLabel = "Copy link";
  const copiedLinkLabel = "Link copied!";
  let correlatiMap = {};
  try {
    const correlatiRes = await fetch(`${Astro2.url.origin}/correlati.json`);
    if (correlatiRes.ok) correlatiMap = await correlatiRes.json();
  } catch (e) {
    console.warn("[en/[slug].astro] correlati.json fetch failed:", e);
  }
  const correlatiSlugsRaw = correlatiMap[articolo.slug] ?? [];
  let correlatiArticoli = await getArticoliBySlugList(correlatiSlugsRaw.slice(0, 10), creds).catch(() => []);
  if (correlatiArticoli.length === 0) {
    const preferred = await getFallbackRelatedArticles(
      {
        excludeSlug: articolo.slug,
        lang: "en",
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
          lang: "en",
          limit: 4
        },
        creds
      ).catch(() => []);
    }
  }
  const correlatiSlugsEffective = correlatiSlugsRaw.length > 0 ? correlatiSlugsRaw : correlatiArticoli.map((a) => a.slug);
  function formatDateItalian(date, lang = "it") {
    return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "it-IT", {
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
  const authorBioHtml = autoreCompleto?.bio_en?.trim() || autoreCompleto?.bio_html?.trim() || null;
  const isJeanVanier = autoreCompleto?.slug === "jean-vanier" || autoreName.toLowerCase().includes("jean vanier");
  const authorFotoId = autoreCompleto?.foto?.id ?? null;
  const authorImagePath = authorFotoId ? getAutoreImageUrl(authorFotoId) : `/assets/authors/${authorSlug}.jpg`;
  const authorBio = authorBioHtml;
  const _bioStripped = authorBioHtml ? authorBioHtml.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : null;
  const authorBioTruncated = _bioStripped && _bioStripped.length > 200 ? _bioStripped.substring(0, 200).replace(/\s\S*$/, "") + "\u2026" : null;
  const readingTime = calculateReadingTimeFromHtml(articolo.corpo);
  const slugToArticolo = Object.fromEntries(correlatiArticoli.map((a) => [a.slug, a]));
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
  const [corpoPart1, corpoPart2] = [processedCorpo, ""];
  const issueNumber = articolo.numero_rivista?.id_numero ?? null;
  const issueSlug = issueNumber ? generateIssueSlug(issueNumber) : null;
  const issueLink = issueSlug ? `/archivio/${issueSlug}` : null;
  const articleImageRaw = getArticoloCopertinaSrc(articolo);
  const articleImage = articolo.immagine_copertina?.id ? articleImageRaw : getPlaceholder(articolo.slug ?? "").src;
  const explicitSubtitle = articolo.sottotitolo?.trim() || articolo.seo_description?.trim() || null;
  const heroCaption = articolo.didascalia_copertina?.trim() || null;
  const metaDescription = explicitSubtitle || articolo.seo_description ? (explicitSubtitle || articolo.seo_description).substring(0, 160).replace(/\s+/g, " ").trim() : `${articleTitle} - ${t(locale, "meta_article_default_suffix")}`;
  const categoryDisplayRaw = getThemeLabel(articolo);
  const categoryDisplay = localizeCategory(articolo.categoria_menu, "en") ?? localizeTheme(categoryDisplayRaw, "en") ?? categoryDisplayRaw;
  const categoryItSlug = articolo.categoria_menu ?? getCategorySlugForArticle(articolo);
  const categoryEnSlug = categoryItSlug ? getCategoriaUrlSlug(categoryItSlug, "en") : null;
  const categoryLink = categoryEnSlug ? `/en/category/${categoryEnSlug}/` : null;
  const currentLabels = getLabels([], articolo);
  const formaDisplay = currentLabels.formal && currentLabels.formal !== "Articolo" ? localizeFormalType(currentLabels.formal, locale) : null;
  const rubricaSlugIT = getFormaToRubricaSlug(currentLabels.formal);
  const formaLink = rubricaSlugIT ? `/en/sections/${getRubricaUrlSlug(rubricaSlugIT)}/` : null;
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
  const alternateItem = articolo.articolo_traduzione ?? null;
  const alternateArticleUrl = alternateItem && alternateItem.lang !== "en" ? `/it/${alternateItem.slug}` : null;
  const currentSlug = articolo.slug;
  const currentWpIdClean = String(articolo.wp_id ?? "");
  const wpIdToSlugMap = {};
  for (const a of correlatiArticoli) {
    if (a.wp_id && a.slug) wpIdToSlugMap[a.wp_id] = a.slug;
  }
  const inContentRelatedMap = {};
  for (const a of correlatiArticoli) {
    const imgUrl = getArticoloCopertinaSrc(a);
    const category = getCategorySlugForArticle(a) ?? null;
    inContentRelatedMap[a.slug] = {
      title: a.titolo,
      image: imgUrl,
      excerpt: a.sottotitolo?.trim() || null,
      href: `/en/${a.slug}`,
      category,
      lang: a.lang,
      isItalian: a.lang !== "en"
    };
  }
  const correlatiSlugs = correlatiSlugsEffective;
  const relatedArticles = (() => {
    const umap = correlatiSlugs.map((s) => slugToArticolo[s]).filter((a) => !!a && a.id !== articolo.id && a.lang === "en").slice(0, 3);
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
  const canonicalUrl = `${Astro2.url.origin}/en/${urlSlug}/`;
  const alternates = [
    { lang: "en", url: canonicalUrl },
    ...alternateArticleUrl ? [{ lang: "it", url: `${Astro2.url.origin}${alternateArticleUrl}` }] : []
  ];
  return renderTemplate`${renderComponent($$result, "ArticlePageLayout", $$ArticlePageLayout, { "title": articleTitle, "description": metaDescription, "ogImage": articleImage, "ogType": "article", "lang": "en", "canonical": canonicalUrl, "noindex": false, "alternateArticleUrl": alternateArticleUrl, "alternates": alternates, "pathname": `/en/${urlSlug}` }, { "default": async ($$result2) => renderTemplate(_b || (_b = __template(["  ", '<main class="site-main">  <div class="reading-progress" id="reading-progress"></div> <div class="article-container">  <nav class="breadcrumbs"> <a href="/en/">', "</a> ", ' </nav>  <header class="article-header-wrapper"> ', ' <h1 class="article-title">', "</h1> ", ' <div class="article-meta"> <div class="article-meta-item"> <img', "", ` class="article-meta-author-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy"> <div class="article-meta-author-placeholder" style="display: none;"> `, " </div> <a", ' class="author-link">', '</a> </div> <div class="article-meta-item"> ', ' </div> <div class="article-meta-item"> ', " ", " </div> ", ' </div> </header>  <div class="article-hero-wrapper"> <div class="article-hero-image-wrapper"> <img', "", ' class="article-image" loading="eager" decoding="async" fetchpriority="high" data-copertina-fallback', "> ", " </div> </div>  ", '  <div class="social-sticky" id="social-sticky"> <div class="social-sticky-inner"> <a', ' target="_blank" rel="noopener noreferrer" class="social-link facebook"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link twitter"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link whatsapp"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link linkedin"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 24 22.222 24h.003z"></path> </svg> </a> <a', ' class="social-link email" aria-label="Send by email"> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path> </svg> </a> <a href="#" class="social-link copy-link"', "", '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path> </svg> </a> </div> </div>  <div class="article-content-wrapper"> <div class="article-content" id="article-content"> ', " <div>", "</div> ", " </div>  ", "  ", '  <div class="author-bio-section"> <div class="author-bio-wrapper"> <div class="author-bio-avatar"> <img', "", ` class="author-bio-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy"> <div class="author-bio-placeholder" style="display: none;"> `, ' </div> </div> <div class="author-bio-content"> <h3 class="author-bio-name"> <a', ' class="author-bio-link"> ', ' </a> </h3> <div class="author-bio-text"> ', ' </div> <p class="author-bio-total"> ', ' <a href="/autori">', " ", "</a> </p> </div> </div> </div> ", ' </div>  <div class="floating-widget" id="floating-widget"> <button class="close-btn" id="close-widget"', ">\xD7</button> <h4>", "</h4> ", " ", ' <a href="/en/" class="widget-link">', "</a> </div>  ", " ", ' <details class="debug-section" hidden> <summary style="cursor: pointer; color: var(--text-secondary); font-size: 0.85rem; margin-top: 2rem; padding: 0.5rem;">\n\u{1F50D} Debug: Dati articolo\n</summary> <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.75rem; margin-top: 0.5rem;">', '\n        </pre> </details> <section class="article-nav-section"', '> <a href="/en/" class="back-link">\u2190 ', "</a> </section> </div> </main> ", "<script>(function(){", "\n      window.__BLOG_PAGE_DATA__ = { wpIdToSlugMap, inContentRelatedMap, currentSlug, readAlsoLabel: 'READ ALSO', alternateArticleUrl, currentWpIdClean, lang: articleLang };\n    })();<\/script>  "])), maybeRenderHead(), t("en", "nav_archive"), issueNumber && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${" > "}<a${addAttribute(issueLink, "href")}>${issueLabel} ${issueNumber}</a> ` })}`, !showPubblicatoOnline ? renderTemplate`<nav class="article-category-badge"${addAttribute(badgeIssueAriaLabel, "aria-label")}> ${issueLink && renderTemplate`<a${addAttribute(issueLink, "href")} class="article-badge-link">${issueLabel} ${issueNumber}</a>`} ${issueLink && (formaDisplay || categoryDisplay) && renderTemplate`<span class="article-badge-sep"> • </span>`} ${formaDisplay && (formaLink ? renderTemplate`<a${addAttribute(formaLink, "href")} class="article-badge-link">${formaDisplay}</a>` : renderTemplate`<span class="article-badge-text">${formaDisplay}</span>`)} ${formaDisplay && categoryDisplay && renderTemplate`<span class="article-badge-sep"> / </span>`} ${categoryDisplay && (categoryLink ? renderTemplate`<a${addAttribute(categoryLink, "href")} class="article-badge-link">${categoryDisplay}</a>` : renderTemplate`<span class="article-badge-text">${categoryDisplay}</span>`)} </nav>` : renderTemplate`<div class="article-category-badge article-category-badge--online"> ${categoryLink ? renderTemplate`<a${addAttribute(categoryLink, "href")} class="article-badge-link">${categoryDisplay}</a>` : t("en", "published_online")} </div>`, articleTitle, explicitSubtitle && renderTemplate`<div class="article-subtitle"> ${explicitSubtitle} </div>`, addAttribute(authorImagePath, "src"), addAttribute(autoreName, "alt"), autoreName.charAt(0).toUpperCase(), addAttribute(`/en/authors/${authorSlug}`, "href"), autoreName, formatDateItalian(articleDate, "en"), readingTime, t("en", "min_read"), roleLabel && renderTemplate`<div class="article-meta-item"> <span${addAttribute(`article-badge-role${roleClassName}`, "class")}>${roleLabel}</span> </div>`, addAttribute(articleImage, "src"), addAttribute(articleTitle, "alt"), addAttribute(COPERTINA_IMG_ONERROR, "onerror"), heroCaption && renderTemplate`<div class="article-image-caption"> <img src="https://www.ombreeluci.it/wp-content/uploads/2023/10/icon-camera.png" alt="" class="caption-camera-icon" aria-hidden="true"> ${heroCaption} </div>`, articleDate.getFullYear() < 2e3 && renderTemplate`<div class="article-header-wrapper"> <div class="archival-alert-en"> <strong>This archival content from ${articleDate.getFullYear()} reflects the language and sensitivities of its time.</strong> </div> </div>`, addAttribute(`https://www.facebook.com/sharer/sharer.php?u=${Astro2.url.href}`, "href"), addAttribute(shareLabelFacebook, "aria-label"), addAttribute(`https://twitter.com/intent/tweet?url=${Astro2.url.href}&text=${encodeURIComponent(articleTitle)}`, "href"), addAttribute(shareLabelX, "aria-label"), addAttribute(`https://wa.me/?text=${encodeURIComponent(articleTitle + " " + Astro2.url.href)}`, "href"), addAttribute(shareLabelWhatsapp, "aria-label"), addAttribute(`https://www.linkedin.com/sharing/share-offsite/?url=${Astro2.url.href}`, "href"), addAttribute(shareLabelLinkedin, "aria-label"), addAttribute(`mailto:?subject=${encodeURIComponent(articleTitle)}&body=${encodeURIComponent(Astro2.url.href)}`, "href"), addAttribute(copyLinkLabel, "aria-label"), addAttribute(`event.preventDefault(); navigator.clipboard.writeText('${Astro2.url.href}'); this.setAttribute('aria-label', '${copiedLinkLabel}'); setTimeout(() => this.setAttribute('aria-label', '${copyLinkLabel}'), 2000); return false;`, "onclick"), isJeanVanier && renderTemplate`<aside class="vanier-alert" role="note"> <div>Notice: investigations commissioned by L&apos;Arche International established serious responsibility of Fr. Thomas Philippe (first report in 2015) and Jean Vanier (2020) toward several women. <a href="https://www.ombreeluci.it/2020/larca-internazionale-annuncia-i-risultati-dellindagine-indipendente/">Read the latest statement</a>, which unequivocally condemns these actions as "in total contradiction with the values Vanier advocated" and with "the fundamental principles of our communities".</div> </aside>`, unescapeHTML(corpoPart1), corpoPart2 && renderTemplate`<div>${unescapeHTML(corpoPart2)}</div>`, articolo.tags?.filter((t2) => t2.tags_id).length > 0 && renderTemplate`<nav class="article-tags-list article-tags-list--hidden" aria-label="Tags"> ${articolo.tags.filter((t2) => t2.tags_id).map((t2) => renderTemplate`<a${addAttribute(`/en/tag/${t2.tags_id.slug}`, "href")} class="article-tag-link">${t2.tags_id.nome}</a>`)} </nav>`, renderComponent($$result2, "CTAArticolo", $$CTAArticolo, { "lang": "en", "pageContext": "articolo-en" }), addAttribute(authorImagePath, "src"), addAttribute(autoreName, "alt"), autoreName.charAt(0).toUpperCase(), addAttribute(`/en/authors/${authorSlug}`, "href"), autoreName, authorBioTruncated ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <p>${authorBioTruncated}</p> <a${addAttribute(`/en/authors/${authorSlug}`, "href")} class="author-bio-more">Read more →</a> ` })}` : authorBio ? renderTemplate`<div>${unescapeHTML(authorBio)}</div>` : t("en", "author_bio_fallback"), t("en", "author_total_prefix"), totalAutori, t("en", "author_total"), renderComponent($$result2, "EditorialFeedback", $$EditorialFeedback, { "wpId": articolo.wp_id, "title": articleTitle, "currentRole": ruolo_editoriale, "url": Astro2.url.href, "articoloId": articolo.id, "lang": locale }), addAttribute(t("en", "widget_close"), "aria-label"), t("en", "widget_navigate"), pdfUrl ? renderTemplate`<a${addAttribute(pdfUrl, "href")} target="_blank" rel="noopener noreferrer" class="widget-link">${t("en", "widget_download_pdf")}</a>` : null, issueLink ? renderTemplate`<a${addAttribute(issueLink, "href")} class="widget-link">${t("en", "widget_go_to_issue")}</a>` : null, t("en", "nav_archive"), relatedArticles.length > 0 && renderTemplate`<section class="related-footer-section" aria-label="Related articles"> <div class="related-footer-inner"> <h2 class="related-footer-title">Related articles</h2> <div class="related-footer-grid"> ${relatedArticles.map((rel) => renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": rel.title, "author": rel.author, "date": rel.date, "issue": rel.issue, "slug": rel.slug, "image": rel.image, "categoriaMenu": rel.categoriaMenu, "forma": rel.forma, "ruoloEditoriale": rel.ruoloEditoriale, "lang": "en", "basePath": "/en" })}`)} </div> </div> </section>`, renderComponent($$result2, "Commenti", $$Commenti, { "articoloId": articolo.id, "lang": "en" }), JSON.stringify({ id: articolo.id, wp_id: articolo.wp_id, slug: articolo.slug, titolo: articolo.titolo, lang: articolo.lang, stato: articolo.stato, data_pubblicazione: articolo.data_pubblicazione }, null, 2), addAttribute(t("en", "aria_article_bottom_nav"), "aria-label"), t("en", "back_to_home"), hasInstagram && renderTemplate(_a || (_a = __template(['<script async src="https://www.instagram.com/embed.js"><\/script>']))), defineScriptVars({ wpIdToSlugMap, inContentRelatedMap, currentSlug, currentWpIdClean, articleLang: "en", alternateArticleUrl })), "head": async ($$result2) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "slot": "head" }, { "default": async ($$result3) => renderTemplate(_c || (_c = __template([' <meta name="pagefind:meta"', '> <script type="application/ld+json">', '<\/script> <script type="application/ld+json">', "<\/script> "])), addAttribute(`author:${autoreName}`, "content"), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": articleTitle,
    "description": metaDescription ?? void 0,
    "image": articleImage?.startsWith("http") ? articleImage : `https://ombreeluci.it${articleImage}`,
    "datePublished": articleDate.toISOString(),
    "dateModified": articleDate.toISOString(),
    "inLanguage": "en-US",
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
      "@id": canonicalUrl
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
      const archiveHref = `${site}/en/`;
      const items = [
        {
          "@type": "ListItem",
          "position": 1,
          "name": t("en", "nav_archive"),
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
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/en/[slug].astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/en/[slug].astro";
const $$url = "/en/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
