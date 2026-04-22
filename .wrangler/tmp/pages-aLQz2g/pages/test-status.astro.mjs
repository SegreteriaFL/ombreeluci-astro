globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, e as renderHead, r as renderTemplate, b as createAstro } from '../chunks/astro/server_CgTYz_Tl.mjs';
import { a as getAllArticoli } from '../chunks/directus_BUvoij4J.mjs';
/* empty css                                       */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$TestStatus = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$TestStatus;
  let articleCount = 0;
  let errorMessage = null;
  try {
    const articles = await getAllArticoli();
    articleCount = articles.length;
  } catch (error) {
    errorMessage = error.message;
  }
  return renderTemplate`<html lang="it" data-astro-cid-cr2jheuo> <head><meta name="robots" content="noindex, nofollow"><meta charset="utf-8"><link rel="icon" type="image/png" href="/favicon.png"><title>Test Status - Ombre e Luci</title>${renderHead()}</head> <body data-astro-cid-cr2jheuo> <h1 data-astro-cid-cr2jheuo>Test Status Server</h1> ${errorMessage ? renderTemplate`<div class="status error" data-astro-cid-cr2jheuo> <strong data-astro-cid-cr2jheuo>❌ Errore:</strong> ${errorMessage} </div>` : renderTemplate`<div class="status success" data-astro-cid-cr2jheuo> <strong data-astro-cid-cr2jheuo>✅ Server Funzionante!</strong> <p data-astro-cid-cr2jheuo>Articoli caricati: <strong data-astro-cid-cr2jheuo>${articleCount}</strong></p> </div>`} <div class="status info" data-astro-cid-cr2jheuo> <h3 data-astro-cid-cr2jheuo>Link di Test:</h3> <ul data-astro-cid-cr2jheuo> <li data-astro-cid-cr2jheuo><a href="/" data-astro-cid-cr2jheuo>Home (Archivio)</a></li> <li data-astro-cid-cr2jheuo><a href="/test-lista" data-astro-cid-cr2jheuo>Lista Completa Articoli</a></li> ${articleCount > 0 && renderTemplate`<li data-astro-cid-cr2jheuo><a href="/blog/ombre-e-luci" data-astro-cid-cr2jheuo>Test Articolo: "Ombre e luci?"</a></li>`} </ul> </div> <div class="status info" data-astro-cid-cr2jheuo> <h3 data-astro-cid-cr2jheuo>Info Sistema:</h3> <ul data-astro-cid-cr2jheuo> <li data-astro-cid-cr2jheuo>Server: Astro Dev</li> <li data-astro-cid-cr2jheuo>Porta: 4321</li> <li data-astro-cid-cr2jheuo>URL: <a href="http://localhost:4321" data-astro-cid-cr2jheuo>http://localhost:4321</a></li> </ul> </div> </body></html>`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/test-status.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/test-status.astro";
const $$url = "/test-status";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TestStatus,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
