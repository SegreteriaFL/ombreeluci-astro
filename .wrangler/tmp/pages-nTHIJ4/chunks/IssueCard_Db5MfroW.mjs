globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro } from './astro/server_CgTYz_Tl.mjs';
/* empty css                         */

const $$Astro = createAstro();
const $$IssueCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$IssueCard;
  const { cover_url, titolo_numero, numero, anno, mese, periodo_label, tipo_rivista, id_numero } = Astro2.props;
  const testata = tipo_rivista === "ins" || titolo_numero.toLowerCase().includes("insieme") ? "Insieme" : "Ombre e Luci";
  const numeroSlug = id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const linkUrl = `/archivio/${numeroSlug}`;
  const periodo = periodo_label || mese || "";
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(linkUrl, "href")} class="issue-card" data-astro-cid-afktgyng> <div class="issue-card-image-wrapper" data-astro-cid-afktgyng> ${cover_url ? renderTemplate`<img${addAttribute(cover_url, "src")}${addAttribute(`Copertina ${testata} n. ${numero} - ${anno}`, "alt")} class="issue-card-image" loading="lazy" data-copertina-fallback data-astro-cid-afktgyng>` : renderTemplate`<div class="issue-card-placeholder" data-astro-cid-afktgyng> <span class="issue-card-placeholder-text" data-astro-cid-afktgyng>${testata}</span> <span class="issue-card-placeholder-number" data-astro-cid-afktgyng>n. ${numero}</span> </div>`} <div class="issue-card-badge" data-astro-cid-afktgyng> ${testata} </div> </div> <div class="issue-card-content" data-astro-cid-afktgyng> <h3 class="issue-card-title" data-astro-cid-afktgyng>${titolo_numero}</h3> <div class="issue-card-meta" data-astro-cid-afktgyng> <span class="issue-card-year" data-astro-cid-afktgyng>N.${numero} · ${anno}</span> ${periodo && renderTemplate`<span class="issue-card-period" data-astro-cid-afktgyng>${periodo}</span>`} </div> </div> </a> `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/IssueCard.astro", void 0);

export { $$IssueCard as $ };
