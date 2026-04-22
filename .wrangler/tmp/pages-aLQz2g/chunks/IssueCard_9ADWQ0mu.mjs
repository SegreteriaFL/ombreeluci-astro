globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro } from './astro/server_CgTYz_Tl.mjs';
/* empty css                         */

const $$Astro = createAstro();
const $$IssueCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$IssueCard;
  const { cover_url, titolo_numero, numero, anno, periodo_label, tipo_rivista, id_numero } = Astro2.props;
  const isOEL = tipo_rivista !== "insieme" && !id_numero.toLowerCase().startsWith("ins");
  const numeroSlug = id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const linkUrl = `/archivio/${numeroSlug}`;
  const cardTitle = titolo_numero ? `n.${numero} \u2013 ${titolo_numero}` : `n.${numero}`;
  const annoRivista = isOEL ? anno - 1982 : anno - 1973;
  const ROMAN = ["I", "II", "III", "IV"];
  const numInAnno = (numero - 1) % 4 + 1;
  const numInAnnoRoman = ROMAN[numInAnno - 1] ?? String(numInAnno);
  const MESI_ABBR = {
    gennaio: "Gen",
    febbraio: "Feb",
    marzo: "Mar",
    aprile: "Apr",
    maggio: "Mag",
    giugno: "Giu",
    luglio: "Lug",
    agosto: "Ago",
    settembre: "Set",
    ottobre: "Ott",
    novembre: "Nov",
    dicembre: "Dic"
  };
  function abbreviaPeriodo(label) {
    return label.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]+/g, (w) => {
      const key = w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return MESI_ABBR[key] ?? w;
    }).replace(/\s*[–—-]\s*/g, "-").trim();
  }
  const periodoAbbr = periodo_label ? abbreviaPeriodo(periodo_label) : null;
  const metaParts = [];
  if (periodoAbbr) metaParts.push(`${periodoAbbr} ${anno}`);
  if (isOEL && annoRivista > 0) metaParts.push(`Anno ${annoRivista}`);
  if (isOEL) metaParts.push(numInAnnoRoman);
  const metaLine = metaParts.join(" \xB7 ");
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(linkUrl, "href")} class="issue-card" data-astro-cid-afktgyng> <div class="issue-card-image-wrapper" data-astro-cid-afktgyng> ${cover_url ? renderTemplate`<img${addAttribute(cover_url, "src")}${addAttribute(`Copertina ${cardTitle}`, "alt")} class="issue-card-image" loading="lazy" data-copertina-fallback data-astro-cid-afktgyng>` : renderTemplate`<div class="issue-card-placeholder" data-astro-cid-afktgyng> <span class="issue-card-placeholder-text" data-astro-cid-afktgyng>${isOEL ? "Ombre e Luci" : "Insieme"}</span> <span class="issue-card-placeholder-number" data-astro-cid-afktgyng>n. ${numero}</span> </div>`} </div> <div class="issue-card-content" data-astro-cid-afktgyng> <h3 class="issue-card-title" data-astro-cid-afktgyng>${cardTitle}</h3> ${metaLine && renderTemplate`<p class="issue-card-meta" data-astro-cid-afktgyng>${metaLine}</p>`} </div> </a> `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/IssueCard.astro", void 0);

export { $$IssueCard as $ };
