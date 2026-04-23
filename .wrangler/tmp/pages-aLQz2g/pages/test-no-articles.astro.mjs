globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, e as renderHead, r as renderTemplate, b as createAstro } from '../chunks/astro/server_CgTYz_Tl.mjs';
/* empty css                                            */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$TestNoArticles = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$TestNoArticles;
  return renderTemplate`<html lang="it" data-astro-cid-nuq3akgm> <head><meta name="robots" content="noindex, nofollow"><meta charset="utf-8"><link rel="icon" type="image/png" href="/favicon.png"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Test Senza Articoli</title>${renderHead()}</head> <body data-astro-cid-nuq3akgm> <div class="success" data-astro-cid-nuq3akgm> <h1 data-astro-cid-nuq3akgm>✅ Server Funzionante!</h1> <p data-astro-cid-nuq3akgm>Se vedi questa pagina, il server Astro funziona correttamente.</p> <p data-astro-cid-nuq3akgm>Questa pagina NON carica articoli, quindi se funziona significa che il problema è nel caricamento degli articoli.</p> </div> <h2 data-astro-cid-nuq3akgm>Test di Navigazione</h2> <ul data-astro-cid-nuq3akgm> <li data-astro-cid-nuq3akgm><a href="/test-minimal" data-astro-cid-nuq3akgm>Test Minimale</a> - Pagina senza articoli</li> <li data-astro-cid-nuq3akgm><a href="/test-status" data-astro-cid-nuq3akgm>Test Status</a> - Mostra stato server</li> <li data-astro-cid-nuq3akgm><a href="/" data-astro-cid-nuq3akgm>Homepage</a> - Carica tutti gli articoli (potrebbe bloccarsi)</li> <li data-astro-cid-nuq3akgm><a href="/test-lista" data-astro-cid-nuq3akgm>Lista Articoli</a> - Lista completa (potrebbe bloccarsi)</li> </ul> <h2 data-astro-cid-nuq3akgm>Diagnostica</h2> <p data-astro-cid-nuq3akgm>Se questa pagina si carica ma la homepage no, il problema è probabilmente:</p> <ul data-astro-cid-nuq3akgm> <li data-astro-cid-nuq3akgm>Validazione Zod fallisce su alcuni articoli</li> <li data-astro-cid-nuq3akgm>Articoli con dati non validi (date, URL, ecc.)</li> <li data-astro-cid-nuq3akgm>Problema di memoria durante il caricamento di troppi articoli</li> </ul> </body></html>`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/test-no-articles.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/test-no-articles.astro";
const $$url = "/test-no-articles";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TestNoArticles,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
