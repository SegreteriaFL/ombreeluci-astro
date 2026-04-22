globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, e as renderHead, r as renderTemplate, b as createAstro } from '../chunks/astro/server_CgTYz_Tl.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$TestMinimal = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$TestMinimal;
  return renderTemplate`<html lang="it"> <head><meta name="robots" content="noindex, nofollow"><meta charset="utf-8"><link rel="icon" type="image/png" href="/favicon.png"><title>Test Minimale</title>${renderHead()}</head> <body> <h1>✅ Server Funzionante!</h1> <p>Se vedi questa pagina, Astro funziona correttamente.</p> <p><a href="/">Vai alla Home</a></p> </body></html>`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/test-minimal.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/test-minimal.astro";
const $$url = "/test-minimal";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TestMinimal,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
