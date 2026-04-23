globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro, d as renderComponent, f as renderSlot } from '../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_iVPiOiwI.mjs';
import { A as AMOUNT_CHIPS, P as PAYPAL_DONATE_URL, E as EMAIL, I as INTESTATARIO, R as RUNTS, N as NUMERI_ANNO, b as ABBONAMENTO_ANNO, c as ABBONAMENTO_MESE, d as IBAN_RAW, e as IBAN_DISPLAY, C as CCP, f as CCP_DISPLAY, g as CF } from '../chunks/Footer_pGzeraaC.mjs';
/* empty css                                      */
export { renderers } from '../renderers.mjs';

const $$Astro$2 = createAstro();
const $$AmountChips = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$AmountChips;
  const { frequency } = Astro2.props;
  const suffix = frequency === "monthly" ? "/ mese" : "";
  return renderTemplate`${maybeRenderHead()}<div class="amount-chips" role="group" aria-label="Scegli importo" data-astro-cid-tslgwnhr> ${AMOUNT_CHIPS.map((eur) => renderTemplate`<button type="button" class="amount-chip"${addAttribute(eur, "data-amount")} data-track="support_select_amount" data-astro-cid-tslgwnhr> ${eur}€${suffix} </button>`)} <button type="button" class="amount-chip amount-chip-other" data-amount="other" data-track="support_select_amount" data-astro-cid-tslgwnhr>
Altro
</button> </div> `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/support/AmountChips.astro", void 0);

const $$SupportBox = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="support-box" id="support-box" data-astro-cid-kp6ng5qc> <p class="support-box-label" data-astro-cid-kp6ng5qc>Scelta importo rapida</p> ${renderComponent($$result, "AmountChips", $$AmountChips, { "frequency": "monthly", "data-astro-cid-kp6ng5qc": true })} <p class="support-box-modi-label" data-astro-cid-kp6ng5qc>Due modalità</p> <div class="support-box-toggle" role="group" aria-label="Modalità donazione" data-astro-cid-kp6ng5qc> <button type="button" class="support-toggle-btn active" data-frequency="monthly" data-track="support_toggle_frequency" data-astro-cid-kp6ng5qc>
Donazione mensile
</button> <button type="button" class="support-toggle-btn" data-frequency="once" data-track="support_toggle_frequency" data-astro-cid-kp6ng5qc>
Donazione singola
</button> </div> <a${addAttribute(PAYPAL_DONATE_URL, "href")} target="_blank" rel="noopener noreferrer" class="support-box-cta support-box-cta-primary" id="support-paypal-cta" data-track="support_click_paypal" data-cta-monthly="Dona" data-cta-once="Dona" data-astro-cid-kp6ng5qc>
Dona
</a> <a href="#bonifico" class="support-box-bonifico" id="support-bonifico-scroll" data-track="support_click_bonifico_scroll" data-astro-cid-kp6ng5qc>
Preferisci il bonifico (senza commissioni)
</a> </div>  `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/support/SupportBox.astro", void 0);

const $$Astro$1 = createAstro();
const $$SupportHero = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$SupportHero;
  const { imageSrcs, imageAlt = "Ombre e Luci" } = Astro2.props;
  const sources = imageSrcs.length >= 1 ? imageSrcs : [""];
  return renderTemplate`${maybeRenderHead()}<div class="support-page-layout" id="top" data-astro-cid-x3s7ovq3> <!-- Colonna sinistra: slider sticky (resta visibile finché la sezione è in view, poi esce con la sezione) --> <div class="support-hero-visual support-hero-visual--sticky" aria-hidden="true" data-astro-cid-x3s7ovq3> ${sources.map((src, i) => renderTemplate`<img${addAttribute(src, "src")} alt="" width="800" height="533"${addAttribute(`support-hero-img support-hero-img-${i} ${i === 0 ? "support-hero-img-visible" : ""}`, "class")}${addAttribute(i, "data-hero-index")} data-astro-cid-x3s7ovq3>`)} <div class="support-hero-overlay" aria-hidden="true" data-astro-cid-x3s7ovq3></div> </div> <!-- Colonna destra: tutto il contenuto scrollabile --> <div class="support-hero-right" data-astro-cid-x3s7ovq3> <main class="site-main" data-astro-cid-x3s7ovq3> <div class="support-hero-content" data-astro-cid-x3s7ovq3> <h1 class="support-hero-h1" data-astro-cid-x3s7ovq3>Sostieni Ombre e Luci</h1> <h2 class="support-hero-h2" data-astro-cid-x3s7ovq3>Aiutaci a tenere accesa la luce</h2> ${renderComponent($$result, "SupportBox", $$SupportBox, { "data-astro-cid-x3s7ovq3": true })} </div> ${renderSlot($$result, $$slots["default"])} </main> </div> </div>  `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/support/SupportHero.astro", void 0);

const $$Astro = createAstro();
const $$CopyField = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$CopyField;
  const { label, value, trackId, copyValue = value } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="copy-field" data-astro-cid-ikwklcaw> <span class="copy-field-label" data-astro-cid-ikwklcaw>${label}</span> <div class="copy-field-row" data-astro-cid-ikwklcaw> <code class="copy-field-value"${addAttribute(copyValue, "data-copy-value")} data-astro-cid-ikwklcaw>${value}</code> <button type="button" class="copy-field-btn"${addAttribute(copyValue, "data-copy-value")}${addAttribute(trackId, "data-track-id")}${addAttribute(`Copia ${label}`, "aria-label")} data-astro-cid-ikwklcaw>
Copia
</button> </div> </div> `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/support/CopyField.astro", void 0);

const $$FaqAccordion = createComponent(($$result, $$props, $$slots) => {
  const items = [
    {
      q: "Ricevuta o detraibilit\xE0?",
      a: `Siamo un ETS. Se ti serve attestazione scrivici a ${EMAIL}.`
    },
    {
      q: "Donazione ricorrente senza PayPal?",
      a: "Puoi impostare un bonifico ricorrente dalla tua banca (mensile o altro)."
    },
    {
      q: "Dall'estero?",
      a: "Contattaci e ti indichiamo il modo pi\xF9 semplice."
    },
    {
      q: "Come disdire?",
      a: "Da PayPal (nel tuo account) o annullando il bonifico ricorrente in banca."
    }
  ];
  return renderTemplate`${maybeRenderHead()}<div class="faq-accordion" role="region" aria-label="Domande frequenti" data-astro-cid-lwykoj3g> ${items.map((item, i) => renderTemplate`<div class="faq-item"${addAttribute(i, "data-faq-index")} data-astro-cid-lwykoj3g> <button type="button" class="faq-question" aria-expanded="false"${addAttribute(`faq-answer-${i}`, "aria-controls")}${addAttribute(`faq-q-${i}`, "id")} data-astro-cid-lwykoj3g> ${item.q} </button> <div class="faq-answer"${addAttribute(`faq-answer-${i}`, "id")} role="region"${addAttribute(`faq-q-${i}`, "aria-labelledby")} hidden data-astro-cid-lwykoj3g> <p data-astro-cid-lwykoj3g>${item.a}</p> </div> </div>`)} </div>  `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/support/FaqAccordion.astro", void 0);

const $$Sostienici = createComponent(($$result, $$props, $$slots) => {
  const heroImages = ["/images/dona1.webp", "/images/dona2.webp", "/images/dona3.webp", "/images/dona4.webp", "/images/dona7.webp"];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Sostieni Ombre e Luci", "description": "Sostieni Ombre e Luci con una donazione. Senza sponsor: la rivista vive grazie a chi la legge.", "bodyClass": "support-page", "data-astro-cid-xcf3rk25": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div id="support-toast" class="support-toast" role="status" aria-live="polite" aria-hidden="true" data-astro-cid-xcf3rk25> <span class="support-toast-icon" data-astro-cid-xcf3rk25>✓</span> <span class="support-toast-text" data-astro-cid-xcf3rk25>Copiato</span> </div> <a href="#support-box" class="support-sticky-cta" id="support-sticky-cta" aria-label="Vai a dona" data-astro-cid-xcf3rk25>Dona ora</a> ${renderComponent($$result2, "SupportHero", $$SupportHero, { "imageSrcs": heroImages, "imageAlt": "Ombre e Luci", "data-astro-cid-xcf3rk25": true }, { "default": ($$result3) => renderTemplate` <div class="container support-container" data-astro-cid-xcf3rk25> <section class="support-section support-altri-modi" id="altri-modi" aria-labelledby="altri-modi-label" data-astro-cid-xcf3rk25> <span id="altri-modi-label" class="support-section-label" data-astro-cid-xcf3rk25>Altri modi per sostenerci</span> <div class="support-cards" data-astro-cid-xcf3rk25> <div class="support-card" id="bonifico" data-astro-cid-xcf3rk25> <span class="support-card-label" data-astro-cid-xcf3rk25>Bonifico</span> <p class="support-card-intestatario" data-astro-cid-xcf3rk25>${INTESTATARIO}</p> ${renderComponent($$result3, "CopyField", $$CopyField, { "label": "IBAN", "value": IBAN_DISPLAY, "copyValue": IBAN_RAW, "trackId": "support_copy_iban", "data-astro-cid-xcf3rk25": true })} ${renderComponent($$result3, "CopyField", $$CopyField, { "label": "CCP", "value": CCP_DISPLAY, "copyValue": CCP, "trackId": "support_copy_ccp", "data-astro-cid-xcf3rk25": true })} <p class="support-card-hint" data-astro-cid-xcf3rk25>Puoi impostare un bonifico ricorrente dalla tua banca.</p> </div> <div class="support-card" id="cinquemille" data-astro-cid-xcf3rk25> <span class="support-card-label" data-astro-cid-xcf3rk25>5×1000</span> <p class="support-card-hint" data-astro-cid-xcf3rk25>Ti costa zero. Firma nel riquadro «Sostegno del volontariato» e inserisci il codice fiscale.</p> ${renderComponent($$result3, "CopyField", $$CopyField, { "label": "Codice Fiscale", "value": CF, "trackId": "support_copy_cf", "data-astro-cid-xcf3rk25": true })} <p class="support-card-runts" data-astro-cid-xcf3rk25>RUNTS ${RUNTS}</p> </div> <div class="support-card" id="abbonamento" data-astro-cid-xcf3rk25> <span class="support-card-label" data-astro-cid-xcf3rk25>Abbonamento</span> <p class="support-card-abbonamento" data-astro-cid-xcf3rk25>${NUMERI_ANNO} numeri l'anno · ${ABBONAMENTO_ANNO}€/anno oppure ${ABBONAMENTO_MESE}€/mese</p> <a${addAttribute(`mailto:${EMAIL}?subject=Abbonamento Ombre e Luci`, "href")} class="support-card-link" data-astro-cid-xcf3rk25>Scopri abbonamento</a> </div> </div> </section> <section class="support-section support-impatto" aria-labelledby="impatto-label" data-astro-cid-xcf3rk25> <span id="impatto-label" class="support-section-label" data-astro-cid-xcf3rk25>Cosa rendi possibile</span> <ul class="support-impatto-list" data-astro-cid-xcf3rk25> <li data-astro-cid-xcf3rk25>Pubblicazione e lavoro editoriale</li> <li data-astro-cid-xcf3rk25>Sito e archivio</li> <li data-astro-cid-xcf3rk25>Stampa e spedizione dei numeri</li> <li data-astro-cid-xcf3rk25>Progetti e attività collegati a Fede e Luce</li> </ul> <p class="support-impatto-chiudi" data-astro-cid-xcf3rk25>Ogni euro va dove serve.</p> </section> <section class="support-section support-faq" aria-labelledby="faq-label" data-astro-cid-xcf3rk25> <span id="faq-label" class="support-section-label" data-astro-cid-xcf3rk25>Domande frequenti</span> ${renderComponent($$result3, "FaqAccordion", $$FaqAccordion, { "data-astro-cid-xcf3rk25": true })} </section> </div> ` })}   ` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/sostienici.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/sostienici.astro";
const $$url = "/sostienici";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Sostienici,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
