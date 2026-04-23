// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: [
    "/_image",
    "/api/*",
    "/blog/*"
  ],
  exclude: [
    "/",
    "/_astro/*",
    "/2018/*",
    "/1989/*",
    "/1988/*",
    "/1996/*",
    "/1986/*",
    "/2014/*",
    "/1978/*",
    "/1991/*",
    "/2022/*",
    "/2020/*",
    "/2995/*",
    "/1995/*",
    "/2019/*",
    "/2021/*",
    "/2017/*",
    "/2023/*",
    "/2012/*",
    "/2013/*",
    "/2015/*",
    "/1979/*",
    "/1975/*",
    "/1976/*",
    "/1977/*",
    "/2016/*",
    "/1980/*",
    "/2011/*",
    "/1004/*",
    "/2006/*",
    "/admin/*",
    "/correlati.json",
    "/favicon.ico",
    "/favicon.png",
    "/favicon.svg",
    "/fonts/*",
    "/images/*",
    "/placeholder/*",
    "/robots.txt",
    "/about",
    "/chi-siamo/*",
    "/contribuisci",
    "/dona",
    "/404",
    "/archivio/*",
    "/autori/*",
    "/blog/en",
    "/categoria/*",
    "/cerca",
    "/debug/*",
    "/sezioni/*",
    "/test-lista",
    "/test-minimal",
    "/test-no-articles",
    "/test-status",
    "/diario-di-arianna",
    "/diario-di-benedetta",
    "/diario-di-giovanni",
    "/diario-di-efrem",
    "/diario-di-luciana",
    "/diario-di-antonietta",
    "/diario-di-davide",
    "/sostienici"
  ]
};

// node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "C:\\Users\\berto\\Documents\\Ombreeluci\\.wrangler\\tmp\\pages-nTHIJ4\\bundledWorker-0.9027419467996981.mjs";
import { isRoutingRuleMatch } from "C:\\Users\\berto\\Documents\\Ombreeluci\\node_modules\\wrangler\\templates\\pages-dev-util.ts";
export * from "C:\\Users\\berto\\Documents\\Ombreeluci\\.wrangler\\tmp\\pages-nTHIJ4\\bundledWorker-0.9027419467996981.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=ml23tcy206a.js.map
