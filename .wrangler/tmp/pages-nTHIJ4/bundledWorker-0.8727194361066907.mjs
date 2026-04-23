var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// _worker.js/index.js
import { renderers } from "./renderers.mjs";
import { createExports } from "./_@astrojs-ssr-adapter.mjs";
import { manifest } from "./manifest_sg1jpAR7.mjs";
globalThis.process ??= {};
globalThis.process.env ??= {};
var _page0 = /* @__PURE__ */ __name(() => import("./pages/_image.astro.mjs"), "_page0");
var _page1 = /* @__PURE__ */ __name(() => import("./pages/404.astro.mjs"), "_page1");
var _page2 = /* @__PURE__ */ __name(() => import("./pages/api/revalidate.astro.mjs"), "_page2");
var _page3 = /* @__PURE__ */ __name(() => import("./pages/archivio/web-only.astro.mjs"), "_page3");
var _page4 = /* @__PURE__ */ __name(() => import("./pages/archivio/_issue_.astro.mjs"), "_page4");
var _page5 = /* @__PURE__ */ __name(() => import("./pages/archivio.astro.mjs"), "_page5");
var _page6 = /* @__PURE__ */ __name(() => import("./pages/autori/_slug_.astro.mjs"), "_page6");
var _page7 = /* @__PURE__ */ __name(() => import("./pages/autori.astro.mjs"), "_page7");
var _page8 = /* @__PURE__ */ __name(() => import("./pages/blog/en.astro.mjs"), "_page8");
var _page9 = /* @__PURE__ */ __name(() => import("./pages/blog/_---slug_.astro.mjs"), "_page9");
var _page10 = /* @__PURE__ */ __name(() => import("./pages/categoria/_categoria_.astro.mjs"), "_page10");
var _page11 = /* @__PURE__ */ __name(() => import("./pages/cerca.astro.mjs"), "_page11");
var _page12 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/collaboratori.astro.mjs"), "_page12");
var _page13 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/contatti.astro.mjs"), "_page13");
var _page14 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/hanno-scritto-per-noi.astro.mjs"), "_page14");
var _page15 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/la-redazione.astro.mjs"), "_page15");
var _page16 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/la-rivista.astro.mjs"), "_page16");
var _page17 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/redazione-storica.astro.mjs"), "_page17");
var _page18 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo.astro.mjs"), "_page18");
var _page19 = /* @__PURE__ */ __name(() => import("./pages/debug/audit-editoriale.astro.mjs"), "_page19");
var _page20 = /* @__PURE__ */ __name(() => import("./pages/sezioni/dialogo-aperto.astro.mjs"), "_page20");
var _page21 = /* @__PURE__ */ __name(() => import("./pages/sezioni/diari.astro.mjs"), "_page21");
var _page22 = /* @__PURE__ */ __name(() => import("./pages/sostienici.astro.mjs"), "_page22");
var _page23 = /* @__PURE__ */ __name(() => import("./pages/test-lista.astro.mjs"), "_page23");
var _page24 = /* @__PURE__ */ __name(() => import("./pages/test-minimal.astro.mjs"), "_page24");
var _page25 = /* @__PURE__ */ __name(() => import("./pages/test-no-articles.astro.mjs"), "_page25");
var _page26 = /* @__PURE__ */ __name(() => import("./pages/test-status.astro.mjs"), "_page26");
var _page27 = /* @__PURE__ */ __name(() => import("./pages/_diario_.astro.mjs"), "_page27");
var _page28 = /* @__PURE__ */ __name(() => import("./pages/index.astro.mjs"), "_page28");
var pageMap = /* @__PURE__ */ new Map([
  ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
  ["src/pages/404.astro", _page1],
  ["src/pages/api/revalidate.ts", _page2],
  ["src/pages/archivio/web-only.astro", _page3],
  ["src/pages/archivio/[issue].astro", _page4],
  ["src/pages/archivio/index.astro", _page5],
  ["src/pages/autori/[slug].astro", _page6],
  ["src/pages/autori/index.astro", _page7],
  ["src/pages/blog/en.astro", _page8],
  ["src/pages/blog/[...slug].astro", _page9],
  ["src/pages/categoria/[categoria].astro", _page10],
  ["src/pages/cerca.astro", _page11],
  ["src/pages/chi-siamo/collaboratori.astro", _page12],
  ["src/pages/chi-siamo/contatti.astro", _page13],
  ["src/pages/chi-siamo/hanno-scritto-per-noi.astro", _page14],
  ["src/pages/chi-siamo/la-redazione.astro", _page15],
  ["src/pages/chi-siamo/la-rivista.astro", _page16],
  ["src/pages/chi-siamo/redazione-storica.astro", _page17],
  ["src/pages/chi-siamo/index.astro", _page18],
  ["src/pages/debug/audit-editoriale.astro", _page19],
  ["src/pages/sezioni/dialogo-aperto.astro", _page20],
  ["src/pages/sezioni/diari.astro", _page21],
  ["src/pages/sostienici.astro", _page22],
  ["src/pages/test-lista.astro", _page23],
  ["src/pages/test-minimal.astro", _page24],
  ["src/pages/test-no-articles.astro", _page25],
  ["src/pages/test-status.astro", _page26],
  ["src/pages/[diario].astro", _page27],
  ["src/pages/index.astro", _page28]
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
//# sourceMappingURL=bundledWorker-0.8727194361066907.mjs.map
