globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, a as addAttribute } from '../../chunks/astro/server_CgTYz_Tl.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_iVPiOiwI.mjs';
import { $ as $$ArticoliRullo } from '../../chunks/ArticoliRullo_DaW5-kVn.mjs';
import { g as getDiaristiWithMeta, N as NOMI_DIARISTI } from '../../chunks/diari_DNXJk5VJ.mjs';
import { d as getAllAutori, f as getCategoriaDescrizione, e as getAutoreImageUrl, a as getAllArticoli } from '../../chunks/directus_BUvoij4J.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Diari = createComponent(async ($$result, $$props, $$slots) => {
  const [allAutori, diariMeta] = await Promise.all([getAllAutori(), getCategoriaDescrizione("diari")]);
  const diariDescrizione = diariMeta?.descrizione ?? null;
  const autoriById = Object.fromEntries(
    allAutori.map((a) => [a.slug, { foto_url: a.foto?.id ? getAutoreImageUrl(a.foto.id) : void 0 }])
  );
  const diaristiConMeta = getDiaristiWithMeta(autoriById);
  const allArticles = await getAllArticoli();
  const articoliDiari = allArticles.filter((a) => a.lang !== "en" && NOMI_DIARISTI.has((a.autore?.nome_completo || "").trim())).sort((a, b) => {
    const tA = a.data_pubblicazione ? new Date(a.data_pubblicazione).getTime() : 0;
    const tB = b.data_pubblicazione ? new Date(b.data_pubblicazione).getTime() : 0;
    return tB - tA;
  });
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "I Diari", "description": "I Diari: storie in prima persona, racconti di vita e di fragilita sulle pagine di Ombre e Luci.", "noindex": true, "data-astro-cid-o5dpt7ja": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main diari-section-bg" data-astro-cid-o5dpt7ja> <div class="container diari-hub" data-astro-cid-o5dpt7ja> <header class="diari-intro" data-astro-cid-o5dpt7ja> <h1 class="diari-hub-title" data-astro-cid-o5dpt7ja>I Diari di Ombre e Luci</h1> <p class="diari-hub-lead" data-astro-cid-o5dpt7ja> ${diariDescrizione ?? "Storie in prima persona, racconti di vita e di fragilit\xE0: i Diari sono lo spazio dove autori e lettori condividono esperienze, riflessioni e incontri. Una finestra aperta sulla vita quotidiana, sulle comunit\xE0 e sul cammino di Fede e Luce."} </p> </header> <section class="diari-grid-section" aria-label="I sette Diari" data-astro-cid-o5dpt7ja> <h2 class="visually-hidden" data-astro-cid-o5dpt7ja>I sette Diari</h2> <div class="diari-cards diari-cards--polaroid" data-astro-cid-o5dpt7ja> ${diaristiConMeta.map((d) => renderTemplate`<article class="diari-card diari-card--polaroid" data-astro-cid-o5dpt7ja> <a${addAttribute(`/${d.diarioSlug}`, "href")} class="diari-card-link" data-astro-cid-o5dpt7ja> <div class="diari-polaroid-frame" data-astro-cid-o5dpt7ja> <div class="diari-polaroid-photo" data-astro-cid-o5dpt7ja> ${d.fotoUrl ? renderTemplate`<img${addAttribute(d.fotoUrl, "src")}${addAttribute(d.nome, "alt")} width="280" height="280" loading="lazy" data-astro-cid-o5dpt7ja>` : renderTemplate`<div class="diari-card-photo-placeholder" aria-hidden="true" data-astro-cid-o5dpt7ja></div>`} </div> <div class="diari-polaroid-caption" data-astro-cid-o5dpt7ja> <h3 class="diari-card-title" data-astro-cid-o5dpt7ja>${d.titoloDiario}</h3> <p class="diari-card-author" data-astro-cid-o5dpt7ja>di ${d.nome}</p> </div> </div> </a> </article>`)} </div> </section> <div class="diari-feed-section" data-astro-cid-o5dpt7ja> ${renderComponent($$result2, "ArticoliRullo", $$ArticoliRullo, { "title": "Tutti gli articoli dai Diari", "description": "Gli ultimi contributi dei sette autori dei Diari, dal pi\xF9 recente al pi\xF9 vecchio.", "articoli": articoliDiari, "headingLevel": 2, "data-astro-cid-o5dpt7ja": true })} </div> </div> </main>  ` })}`;
}, "C:/Users/berto/Documents/Ombreeluci/src/pages/sezioni/diari.astro", void 0);

const $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/sezioni/diari.astro";
const $$url = "/sezioni/diari";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Diari,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
