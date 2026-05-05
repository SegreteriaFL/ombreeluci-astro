var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// _worker.js/index.js
import { renderers } from "./renderers.mjs";
import { createExports } from "./_@astrojs-ssr-adapter.mjs";
import { manifest } from "./manifest_CCCchbwS.mjs";
globalThis.process ??= {};
globalThis.process.env ??= {};
var _page0 = /* @__PURE__ */ __name(() => import("./pages/_image.astro.mjs"), "_page0");
var _page1 = /* @__PURE__ */ __name(() => import("./pages/404.astro.mjs"), "_page1");
var _page2 = /* @__PURE__ */ __name(() => import("./pages/api/commento.astro.mjs"), "_page2");
var _page3 = /* @__PURE__ */ __name(() => import("./pages/api/health.astro.mjs"), "_page3");
var _page4 = /* @__PURE__ */ __name(() => import("./pages/api/revalidate.astro.mjs"), "_page4");
var _page5 = /* @__PURE__ */ __name(() => import("./pages/debug/audit-editoriale.astro.mjs"), "_page5");
var _page6 = /* @__PURE__ */ __name(() => import("./pages/en/about.astro.mjs"), "_page6");
var _page7 = /* @__PURE__ */ __name(() => import("./pages/en/archive/web-only.astro.mjs"), "_page7");
var _page8 = /* @__PURE__ */ __name(() => import("./pages/en/archive/_issue_.astro.mjs"), "_page8");
var _page9 = /* @__PURE__ */ __name(() => import("./pages/en/archive.astro.mjs"), "_page9");
var _page10 = /* @__PURE__ */ __name(() => import("./pages/en/authors/_slug_.astro.mjs"), "_page10");
var _page11 = /* @__PURE__ */ __name(() => import("./pages/en/authors.astro.mjs"), "_page11");
var _page12 = /* @__PURE__ */ __name(() => import("./pages/en/category/_slug_.astro.mjs"), "_page12");
var _page13 = /* @__PURE__ */ __name(() => import("./pages/en/diaries/_diario_.astro.mjs"), "_page13");
var _page14 = /* @__PURE__ */ __name(() => import("./pages/en/focus/_vertical_.astro.mjs"), "_page14");
var _page15 = /* @__PURE__ */ __name(() => import("./pages/en/focus.astro.mjs"), "_page15");
var _page16 = /* @__PURE__ */ __name(() => import("./pages/en/newsletter.astro.mjs"), "_page16");
var _page17 = /* @__PURE__ */ __name(() => import("./pages/en/search.astro.mjs"), "_page17");
var _page18 = /* @__PURE__ */ __name(() => import("./pages/en/sections/diaries.astro.mjs"), "_page18");
var _page19 = /* @__PURE__ */ __name(() => import("./pages/en/sections/_slug_.astro.mjs"), "_page19");
var _page20 = /* @__PURE__ */ __name(() => import("./pages/en/support-us.astro.mjs"), "_page20");
var _page21 = /* @__PURE__ */ __name(() => import("./pages/en/tag/_slug_.astro.mjs"), "_page21");
var _page22 = /* @__PURE__ */ __name(() => import("./pages/en/_slug_.astro.mjs"), "_page22");
var _page23 = /* @__PURE__ */ __name(() => import("./pages/en.astro.mjs"), "_page23");
var _page24 = /* @__PURE__ */ __name(() => import("./pages/it/archivio/web-only.astro.mjs"), "_page24");
var _page25 = /* @__PURE__ */ __name(() => import("./pages/it/archivio/_issue_.astro.mjs"), "_page25");
var _page26 = /* @__PURE__ */ __name(() => import("./pages/it/archivio.astro.mjs"), "_page26");
var _page27 = /* @__PURE__ */ __name(() => import("./pages/it/autori/_slug_.astro.mjs"), "_page27");
var _page28 = /* @__PURE__ */ __name(() => import("./pages/it/autori.astro.mjs"), "_page28");
var _page29 = /* @__PURE__ */ __name(() => import("./pages/it/categoria/_categoria_.astro.mjs"), "_page29");
var _page30 = /* @__PURE__ */ __name(() => import("./pages/it/cerca.astro.mjs"), "_page30");
var _page31 = /* @__PURE__ */ __name(() => import("./pages/it/chi-siamo/collaboratori.astro.mjs"), "_page31");
var _page32 = /* @__PURE__ */ __name(() => import("./pages/it/chi-siamo/contatti.astro.mjs"), "_page32");
var _page33 = /* @__PURE__ */ __name(() => import("./pages/it/chi-siamo/hanno-scritto-per-noi.astro.mjs"), "_page33");
var _page34 = /* @__PURE__ */ __name(() => import("./pages/it/chi-siamo/la-redazione.astro.mjs"), "_page34");
var _page35 = /* @__PURE__ */ __name(() => import("./pages/it/chi-siamo/la-rivista.astro.mjs"), "_page35");
var _page36 = /* @__PURE__ */ __name(() => import("./pages/it/chi-siamo/redazione-storica.astro.mjs"), "_page36");
var _page37 = /* @__PURE__ */ __name(() => import("./pages/it/chi-siamo.astro.mjs"), "_page37");
var _page38 = /* @__PURE__ */ __name(() => import("./pages/it/diari/_diario_.astro.mjs"), "_page38");
var _page39 = /* @__PURE__ */ __name(() => import("./pages/it/focus/_vertical_.astro.mjs"), "_page39");
var _page40 = /* @__PURE__ */ __name(() => import("./pages/it/focus.astro.mjs"), "_page40");
var _page41 = /* @__PURE__ */ __name(() => import("./pages/it/newsletter.astro.mjs"), "_page41");
var _page42 = /* @__PURE__ */ __name(() => import("./pages/it/rubriche/diari.astro.mjs"), "_page42");
var _page43 = /* @__PURE__ */ __name(() => import("./pages/it/rubriche/_rubrica_.astro.mjs"), "_page43");
var _page44 = /* @__PURE__ */ __name(() => import("./pages/it/sostienici.astro.mjs"), "_page44");
var _page45 = /* @__PURE__ */ __name(() => import("./pages/it/tag/_slug_.astro.mjs"), "_page45");
var _page46 = /* @__PURE__ */ __name(() => import("./pages/it/_slug_.astro.mjs"), "_page46");
var _page47 = /* @__PURE__ */ __name(() => import("./pages/sitemap-en.xml.astro.mjs"), "_page47");
var _page48 = /* @__PURE__ */ __name(() => import("./pages/sitemap.xml.astro.mjs"), "_page48");
var _page49 = /* @__PURE__ */ __name(() => import("./pages/index.astro.mjs"), "_page49");
var pageMap = /* @__PURE__ */ new Map([
  ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
  ["src/pages/404.astro", _page1],
  ["src/pages/api/commento.ts", _page2],
  ["src/pages/api/health.ts", _page3],
  ["src/pages/api/revalidate.ts", _page4],
  ["src/pages/debug/audit-editoriale.astro", _page5],
  ["src/pages/en/about/index.astro", _page6],
  ["src/pages/en/archive/web-only.astro", _page7],
  ["src/pages/en/archive/[issue].astro", _page8],
  ["src/pages/en/archive/index.astro", _page9],
  ["src/pages/en/authors/[slug].astro", _page10],
  ["src/pages/en/authors/index.astro", _page11],
  ["src/pages/en/category/[slug].astro", _page12],
  ["src/pages/en/diaries/[diario].astro", _page13],
  ["src/pages/en/focus/[vertical].astro", _page14],
  ["src/pages/en/focus/index.astro", _page15],
  ["src/pages/en/newsletter/index.astro", _page16],
  ["src/pages/en/search/index.astro", _page17],
  ["src/pages/en/sections/diaries.astro", _page18],
  ["src/pages/en/sections/[slug].astro", _page19],
  ["src/pages/en/support-us/index.astro", _page20],
  ["src/pages/en/tag/[slug].astro", _page21],
  ["src/pages/en/[slug].astro", _page22],
  ["src/pages/en/index.astro", _page23],
  ["src/pages/it/archivio/web-only.astro", _page24],
  ["src/pages/it/archivio/[issue].astro", _page25],
  ["src/pages/it/archivio/index.astro", _page26],
  ["src/pages/it/autori/[slug].astro", _page27],
  ["src/pages/it/autori/index.astro", _page28],
  ["src/pages/it/categoria/[categoria].astro", _page29],
  ["src/pages/it/cerca/index.astro", _page30],
  ["src/pages/it/chi-siamo/collaboratori.astro", _page31],
  ["src/pages/it/chi-siamo/contatti.astro", _page32],
  ["src/pages/it/chi-siamo/hanno-scritto-per-noi.astro", _page33],
  ["src/pages/it/chi-siamo/la-redazione.astro", _page34],
  ["src/pages/it/chi-siamo/la-rivista.astro", _page35],
  ["src/pages/it/chi-siamo/redazione-storica.astro", _page36],
  ["src/pages/it/chi-siamo/index.astro", _page37],
  ["src/pages/it/diari/[diario].astro", _page38],
  ["src/pages/it/focus/[vertical].astro", _page39],
  ["src/pages/it/focus/index.astro", _page40],
  ["src/pages/it/newsletter/index.astro", _page41],
  ["src/pages/it/rubriche/diari.astro", _page42],
  ["src/pages/it/rubriche/[rubrica].astro", _page43],
  ["src/pages/it/sostienici/index.astro", _page44],
  ["src/pages/it/tag/[slug].astro", _page45],
  ["src/pages/it/[slug].astro", _page46],
  ["src/pages/sitemap-en.xml.ts", _page47],
  ["src/pages/sitemap.xml.ts", _page48],
  ["src/pages/index.astro", _page49]
]);
var serverIslandMap = /* @__PURE__ */ new Map();
var _manifest = Object.assign(manifest, {
  pageMap,
  serverIslandMap,
  renderers,
  middleware: () => import("./_astro-internal_middleware.mjs")
});
var _exports = createExports(_manifest);
var __astrojsSsrVirtualEntry = _exports.default;
export {
  __astrojsSsrVirtualEntry as default,
  pageMap
};
//# sourceMappingURL=bundledWorker-0.2298977654712444.mjs.map
