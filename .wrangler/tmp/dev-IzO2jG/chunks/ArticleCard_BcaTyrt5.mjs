globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, m as maybeRenderHead, e as addAttribute, r as renderTemplate } from './astro/server_BT9XwReg.mjs';
import { C as COPERTINA_IMG_ONERROR } from './directus_BvF_bImd.mjs';
import { a as localizeFormalType, t, l as localizeCategory, g as getAuthorBasePath } from './Footer_DN9MDnF9.mjs';
/* empty css                           */

const PLACEHOLDERS = [
  { src: "/placeholder/ph-1.jpg", caption: "Foto di Steve Johnson su Unsplash" },
  { src: "/placeholder/ph-2.jpg", caption: "Foto di Steve Johnson su Unsplash" },
  { src: "/placeholder/ph-3.jpg", caption: "Foto di Steve Johnson su Unsplash" },
  { src: "/placeholder/ph-4.jpg", caption: "Foto di vackground.com su Unsplash" }
];
function getPlaceholder(slug) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = hash * 31 + slug.charCodeAt(i) >>> 0;
  return PLACEHOLDERS[hash % PLACEHOLDERS.length];
}

const $$Astro = createAstro("https://ombreeluci.it");
const $$ArticleCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ArticleCard;
  const {
    title,
    author,
    date,
    issue,
    slug,
    image,
    categoriaMenu,
    forma,
    ruoloEditoriale,
    lang = "it",
    horizontal = false,
    sottotitolo = null,
    authorImage = null,
    hideImage = false,
    basePath = "/it"
  } = Astro2.props;
  const hasIssue = issue != null && String(issue).trim() !== "";
  const imageSrc = !hideImage && image ? image : !hideImage ? getPlaceholder(slug ?? title ?? "").src : null;
  const localizedForma = forma ? localizeFormalType(forma, lang) : null;
  const genericFormalLabel = t(lang, "formal_articolo");
  const localizedCategoriaMenu = localizeCategory(categoriaMenu ?? null, lang) ?? categoriaMenu;
  const formaPrefix = localizedForma && localizedForma !== genericFormalLabel ? `${localizedForma} \xB7 ` : "";
  const badgeText = categoriaMenu ? `${formaPrefix}${localizedCategoriaMenu}` : hasIssue ? "" : t(lang, "badge_online");
  function authorSlug(name) {
    return String(name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  const dateLocale = lang === "en" ? "en-US" : "it-IT";
  const formattedDate = new Intl.DateTimeFormat(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date instanceof Date ? date : new Date(date));
  const authorLinkSlug = authorSlug(author);
  const authorBasePath = getAuthorBasePath(lang);
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`article-card${horizontal ? " article-card--horizontal" : ""}`, "class")} data-astro-cid-di2nlc57> <a${addAttribute(`${basePath}/${slug}`, "href")} class="article-link" data-astro-cid-di2nlc57> ${imageSrc && renderTemplate`<div class="article-image-wrap" data-astro-cid-di2nlc57> <img${addAttribute(imageSrc, "src")}${addAttribute(title, "alt")} loading="lazy" data-copertina-fallback${addAttribute(COPERTINA_IMG_ONERROR, "onerror")} data-astro-cid-di2nlc57> </div>`} <div class="article-meta" data-astro-cid-di2nlc57> ${badgeText && renderTemplate`<p class="article-badge" data-astro-cid-di2nlc57> <span class="article-badge-text" data-astro-cid-di2nlc57>${badgeText}</span> </p>`} <h3 class="article-title" data-astro-cid-di2nlc57>${title}</h3> ${horizontal && sottotitolo && renderTemplate`<p class="article-sottotitolo" data-astro-cid-di2nlc57>${sottotitolo}</p>`} </div> </a> <p class="author-row" data-astro-cid-di2nlc57> ${horizontal && authorImage && renderTemplate`<img${addAttribute(authorImage, "src")}${addAttribute(author, "alt")} class="author-avatar" loading="lazy" data-astro-cid-di2nlc57>`} ${t(lang, "author_by")} <a${addAttribute(`${authorBasePath}/${authorLinkSlug}`, "href")} class="author-link" data-astro-cid-di2nlc57>${author}</a> • ${formattedDate} </p> </div> `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/ArticleCard.astro", void 0);

export { $$ArticleCard as $, getPlaceholder as g };
