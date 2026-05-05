globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, b as renderComponent, r as renderTemplate } from '../../../chunks/astro/server_BT9XwReg.mjs';
import { $ as $$BaseLayout } from '../../../chunks/BaseLayout_DOaiilqT.mjs';
import { $ as $$IssueContent } from '../../../chunks/IssueContent_BtamaNxI.mjs';
import { e as getAllNumeriRivista, f as getArticoliByNumeroId, g as getNumeroImageUrl } from '../../../chunks/directus_BvF_bImd.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://ombreeluci.it");
const prerender = false;
const $$issue = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$issue;
  const { issue } = Astro2.params;
  if (!issue) return Astro2.redirect("/en/archive/");
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
  const index = numeriOrdinati.findIndex(
    (n) => n.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-") === issue
  );
  if (index === -1) return Astro2.redirect("/en/archive/");
  const numero = numeriOrdinati[index];
  const prevNumero = index > 0 ? numeriOrdinati[index - 1] : null;
  const nextNumero = index < numeriOrdinati.length - 1 ? numeriOrdinati[index + 1] : null;
  const prevSlug = prevNumero ? prevNumero.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-") : null;
  const nextSlug = nextNumero ? nextNumero.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-") : null;
  const articoliAll = await getArticoliByNumeroId(numero.id);
  const articoliNumero = articoliAll.filter((a) => a.lang === "en");
  const copertinaNumeroUrl = getNumeroImageUrl(numero);
  const testata = numero.tipo === "ins" ? "Insieme" : "Ombre e Luci";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${numero.display_title} \u2013 Archive`, "description": `${testata} \u2013 ${numero.display_title}: browse articles and download the PDF.`, "noindex": true, "ogImage": copertinaNumeroUrl, "lang": "en", "alternateArticleUrl": `/it/archivio/${numero.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-")}` }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "IssueContent", $$IssueContent, { "lang": "en", "numero": numero, "prevSlug": prevSlug, "nextSlug": nextSlug, "articoliNumero": articoliNumero, "archiveBasePath": "/en/archive" })} ` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/en/archive/[issue].astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/en/archive/[issue].astro";
const $$url = "/en/archive/[issue]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$issue,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
