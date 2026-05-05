// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: [
    "/*"
  ],
  exclude: [
    "/",
    "/_astro/*",
    "/admin/*",
    "/correlati.json",
    "/cta-numero.png",
    "/cta-numero.webp",
    "/favicon.ico",
    "/favicon.png",
    "/favicon.svg",
    "/fonts/*",
    "/images/*",
    "/logo-bianco.svg",
    "/placeholder/*",
    "/robots.txt",
    "/sitemap-en.xml",
    "/sitemap.xml",
    "/about",
    "/archivio",
    "/autori",
    "/blog/*",
    "/categoria",
    "/cerca",
    "/chi-siamo/*",
    "/contribuisci",
    "/diari",
    "/dona",
    "/newsletter",
    "/rubriche",
    "/sostienici",
    "/tag",
    "/404",
    "/debug/*",
    "/en",
    "/en/about",
    "/en/archive",
    "/en/archive/web-only",
    "/en/authors",
    "/en/authors/a-a",
    "/en/authors/adriana-duci",
    "/en/authors/adriana-lunghi",
    "/en/authors/adriano-ercolani",
    "/en/authors/agnes-auschitzky",
    "/en/authors/aioel-intelligenza-artificiale",
    "/en/authors/alejandra-del-mar-catapano",
    "/en/authors/alessandra-conicchioli",
    "/en/authors/alessandra-del-duca",
    "/en/authors/alessandra-moraca",
    "/en/authors/alessandra-zezza",
    "/en/authors/alessandro-de-simone",
    "/en/authors/alexandre-jollien",
    "/en/authors/andrea-cesarini",
    "/en/authors/andrea-guglielmino",
    "/en/authors/andrea-lonardo",
    "/en/authors/andrea-posa",
    "/en/authors/andrea-zamperoni",
    "/en/authors/andre-roberti",
    "/en/authors/angela-cusimano",
    "/en/authors/angela-gattulli",
    "/en/authors/angela-grassi",
    "/en/authors/angelo-colacino",
    "/en/authors/anna-aluffi-pentini",
    "/en/authors/anna-cece",
    "/en/authors/anna-maria-canonico",
    "/en/authors/anna-maria-de-rino",
    "/en/authors/annamaria-manfucci",
    "/en/authors/anna-rita-cedroni",
    "/en/authors/anna-testa",
    "/en/authors/annik-donelli",
    "/en/authors/antonella-b",
    "/en/authors/antonella-bulgheroni",
    "/en/authors/antonello-damiani",
    "/en/authors/antonietta-pantone",
    "/en/authors/antonio-mazzarotto",
    "/en/authors/antonio-piscitelli",
    "/en/authors/arianna-giuliano",
    "/en/authors/armando-d-amato",
    "/en/authors/arnaud-franc",
    "/en/authors/associazione-amici-di-simone",
    "/en/authors/beatrice-ghislandi",
    "/en/authors/benedetta-bertolini",
    "/en/authors/benedetta-mattei",
    "/en/authors/benny",
    "/en/authors/benoit-malveaux",
    "/en/authors/bernard-provoust",
    "/en/authors/betrice-pezzoli",
    "/en/authors/betty-collino",
    "/en/authors/bianca-de-pascalis",
    "/en/authors/boris-sollazzo",
    "/en/authors/camille-proffit",
    "/en/authors/carla-fonzi-klieman",
    "/en/authors/carla-gaviraghi",
    "/en/authors/carla-waked",
    "/en/authors/carlo-gazzano",
    "/en/authors/carlo-maria-fornari",
    "/en/authors/carlo-maria-martini",
    "/en/authors/carole-irwin",
    "/en/authors/caterina-bordon",
    "/en/authors/cecilia-cattaneo-barbieri",
    "/en/authors/charlotte-lernount"
  ]
};

// node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "C:\\Users\\berto\\Documents\\Ombreeluci\\.wrangler\\tmp\\pages-JtB0w2\\bundledWorker-0.2298977654712444.mjs";
import { isRoutingRuleMatch } from "C:\\Users\\berto\\Documents\\Ombreeluci\\node_modules\\wrangler\\templates\\pages-dev-util.ts";
export * from "C:\\Users\\berto\\Documents\\Ombreeluci\\.wrangler\\tmp\\pages-JtB0w2\\bundledWorker-0.2298977654712444.mjs";
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
//# sourceMappingURL=zo4wolx9zu.js.map
