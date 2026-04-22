globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, a as addAttribute, r as renderTemplate, f as renderSlot, d as renderComponent, b as createAstro, e as renderHead } from './astro/server_CgTYz_Tl.mjs';
import { $ as $$ViewTransitions } from './ViewTransitions_Dvx2U5F3.mjs';
/* empty css                            */
import { $ as $$Header, e as $$Footer } from './Footer_BWYLI6x4.mjs';

const $$Astro$1 = createAstro();
const $$BaseHead = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$BaseHead;
  const {
    title,
    description = "Ombre e Luci: storie, riflessioni e cultura sulla fragilit\xE0 e sulla dignit\xE0 della persona. Dal 1983.",
    ogImage,
    ogType = "website",
    canonical,
    noindex = false,
    lang = "it",
    alternates = []
  } = Astro2.props;
  const SITE_NAME = "Ombre e Luci";
  const DEFAULT_OG_IMAGE = "https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev/copertine/og-default.jpg";
  const GOOGLE_SITE_VERIFICATION = "CHp0QtH-sw0M_ZYVjj6LRqHxV-4Z72IoYR_aiX9c6ZE";
  const pageTitle = title.includes(SITE_NAME) ? title : `${title} \u2013 ${SITE_NAME}`;
  const canonicalUrl = canonical ?? Astro2.url.href;
  const ogImageUrl = ogImage ?? DEFAULT_OG_IMAGE;
  return renderTemplate`<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/png" href="/favicon.png"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="shortcut icon" href="/favicon.ico"><title>${pageTitle}</title><meta name="description"${addAttribute(description, "content")}>${noindex && renderTemplate`<meta name="robots" content="noindex, nofollow">`}<link rel="canonical"${addAttribute(canonicalUrl, "href")}><!-- Google Site Verification --><meta name="google-site-verification"${addAttribute(GOOGLE_SITE_VERIFICATION, "content")}><!-- Open Graph --><meta property="og:site_name"${addAttribute(SITE_NAME, "content")}><meta property="og:title"${addAttribute(pageTitle, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(ogImageUrl, "content")}><meta property="og:type"${addAttribute(ogType, "content")}><meta property="og:url"${addAttribute(canonicalUrl, "content")}><meta property="og:locale"${addAttribute(lang === "en" ? "en_US" : "it_IT", "content")}><!-- Twitter Card --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"${addAttribute(pageTitle, "content")}><meta name="twitter:description"${addAttribute(description, "content")}><meta name="twitter:image"${addAttribute(ogImageUrl, "content")}><!-- hreflang alternates -->${alternates.map(({ lang: l, url }) => renderTemplate`<link rel="alternate"${addAttribute(l, "hreflang")}${addAttribute(url, "href")}>`)}${alternates.length > 0 && renderTemplate`<link rel="alternate" hreflang="x-default"${addAttribute(alternates.find((a) => a.lang === "it")?.url ?? canonicalUrl, "href")}>`}<!-- Preconnect origini critiche --><link rel="preconnect" href="https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev"><!-- Slot per contenuto aggiuntivo (JSON-LD, meta custom) -->${renderSlot($$result, $$slots["default"])}${renderComponent($$result, "ViewTransitions", $$ViewTransitions, {})}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/BaseHead.astro", void 0);

const $$Astro = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { bodyClass, alternateArticleUrl = null, ...headProps } = Astro2.props;
  const lang = headProps.lang ?? "it";
  return renderTemplate`<html${addAttribute(lang, "lang")}> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { ...headProps }, { "default": ($$result2) => renderTemplate`${renderSlot($$result2, $$slots["head"])}` })}${renderHead()}</head> <body${addAttribute([bodyClass], "class:list")}> ${renderComponent($$result, "Header", $$Header, { "alternateArticleUrl": alternateArticleUrl })} ${renderSlot($$result, $$slots["default"])} ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "C:/Users/berto/Documents/Ombreeluci/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
