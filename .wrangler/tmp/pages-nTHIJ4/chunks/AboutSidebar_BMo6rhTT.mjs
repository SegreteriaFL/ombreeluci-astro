globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro } from './astro/server_CgTYz_Tl.mjs';
/* empty css                                 */

const $$Astro = createAstro();
const $$AboutSidebar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AboutSidebar;
  const { active = "", useAnchors = true } = Astro2.props;
  const links = [
    { label: "La Rivista", href: useAnchors ? "/chi-siamo#la-rivista" : "/chi-siamo/la-rivista", slug: "la-rivista" },
    { label: "La Redazione", href: useAnchors ? "/chi-siamo#la-redazione" : "/chi-siamo/la-redazione", slug: "la-redazione" },
    { label: "La Redazione storica", href: useAnchors ? "/chi-siamo#redazione-storica" : "/chi-siamo/redazione-storica", slug: "redazione-storica" },
    { label: "Collaboratori", href: useAnchors ? "/chi-siamo#collaboratori" : "/chi-siamo/collaboratori", slug: "collaboratori" },
    { label: "Hanno scritto per noi", href: useAnchors ? "/chi-siamo#hanno-scritto-per-noi" : "/chi-siamo/hanno-scritto-per-noi", slug: "hanno-scritto-per-noi" },
    { label: "Info e contatti redazione", href: useAnchors ? "/chi-siamo#contatti" : "/chi-siamo/contatti", slug: "contatti" }
  ];
  return renderTemplate`${maybeRenderHead()}<nav class="about-sidebar" id="chi-siamo-sidebar" aria-label="Sezioni Chi siamo" data-astro-cid-ksra57ok> <ul class="about-sidebar-list" data-astro-cid-ksra57ok> ${links.map((item) => renderTemplate`<li data-astro-cid-ksra57ok> <a${addAttribute(item.href, "href")}${addAttribute(`about-sidebar-link ${active === item.slug ? "about-sidebar-link--active" : ""}`, "class")}${addAttribute(item.slug, "data-section")} data-astro-cid-ksra57ok> ${item.label} </a> </li>`)} </ul> </nav>  `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/AboutSidebar.astro", void 0);

export { $$AboutSidebar as $ };
