globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, m as maybeRenderHead, e as addAttribute, r as renderTemplate } from './astro/server_BT9XwReg.mjs';
import { c as ctaData } from './cta_BwIVYshf.mjs';
/* empty css                         */

const $$Astro = createAstro("https://ombreeluci.it");
const $$CTAArchivio = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$CTAArchivio;
  const { lang = "it", pageContext = "archivio" } = Astro2.props;
  const cta = ctaData.archivio;
  const ui = lang === "en" ? cta.en : cta.it;
  const utmLink = `/sostienici?utm_source=${pageContext}&utm_medium=cta-banner&utm_campaign=${cta.id}&utm_content=${lang}`;
  return renderTemplate`${maybeRenderHead()}<aside class="cta-archivio"${addAttribute(cta.id, "data-cta-id")}${addAttribute(cta.name, "data-cta-name")}${addAttribute(lang === "en" ? "Support us" : "Sostienici", "aria-label")} data-astro-cid-nsozbvjm> <div class="cta-archivio__body" data-astro-cid-nsozbvjm> <div class="cta-archivio__text" data-astro-cid-nsozbvjm> <p class="cta-archivio__titolo" data-astro-cid-nsozbvjm>${ui.titolo}</p> <p class="cta-archivio__sottotitolo" data-astro-cid-nsozbvjm>${ui.sottotitolo}</p> <a${addAttribute(utmLink, "href")} class="cta-archivio__btn"${addAttribute(cta.id, "data-cta-id")}${addAttribute(pageContext, "data-cta-context")} data-astro-cid-nsozbvjm>${ui.cta}</a> </div> <div class="cta-archivio__image" aria-hidden="true" data-astro-cid-nsozbvjm> <img src="/cta-numero.webp" alt="" width="350" height="250" loading="lazy" decoding="async" data-astro-cid-nsozbvjm> </div> </div> </aside> `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/CTAArchivio.astro", void 0);

export { $$CTAArchivio as $ };
