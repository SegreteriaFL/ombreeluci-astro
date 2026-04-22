var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// _worker.js/index.js
import { renderers } from "./renderers.mjs";

// _worker.js/_@astrojs-ssr-adapter.mjs
import { r as requestIs404Or500, n as notFound, a as normalizeTheLocale, b as redirectToFallback, c as redirectToDefaultLocale, e as requestHasLocale, d as defineMiddleware, R as RouteCache, s as sequence, f as fileExtension, j as joinPaths, g as slash, p as prependForwardSlash, h as findRouteToRewrite, i as removeTrailingForwardSlash, m as matchRoute, k as appendForwardSlash, l as RenderContext, o as getSetCookiesFromResponse } from "./chunks/index_B-gW6nkE.mjs";
import { C as ROUTE_TYPE_HEADER, R as REROUTE_DIRECTIVE_HEADER, Y as decryptString, Z as createSlotValueFromString, d as renderComponent, r as renderTemplate, D as DEFAULT_404_COMPONENT, _ as bold, $ as red, a0 as yellow, a1 as dim, a2 as blue, A as AstroError, L as LocalsNotAnObject, H as clientLocalsSymbol, J as clientAddressSymbol, a3 as REROUTABLE_STATUS_CODES, T as responseSentSymbol } from "./chunks/astro/server_CgTYz_Tl.mjs";
import { N as NOOP_MIDDLEWARE_FN } from "./chunks/noop-middleware_Chs5f3j2.mjs";
import { e as ensure404Route, D as DEFAULT_404_ROUTE, a as default404Instance } from "./chunks/astro-designed-error-pages_DfD573yd.mjs";
globalThis.process ??= {};
globalThis.process.env ??= {};
function createI18nMiddleware(i18n, base, trailingSlash, format) {
  if (!i18n)
    return (_, next) => next();
  const payload = {
    ...i18n,
    trailingSlash,
    base,
    format
  };
  const _redirectToDefaultLocale = redirectToDefaultLocale(payload);
  const _noFoundForNonLocaleRoute = notFound(payload);
  const _requestHasLocale = requestHasLocale(payload.locales);
  const _redirectToFallback = redirectToFallback(payload);
  const prefixAlways = /* @__PURE__ */ __name((context) => {
    const url = context.url;
    if (url.pathname === base + "/" || url.pathname === base) {
      return _redirectToDefaultLocale(context);
    } else if (!_requestHasLocale(context)) {
      return _noFoundForNonLocaleRoute(context);
    }
    return void 0;
  }, "prefixAlways");
  const prefixOtherLocales = /* @__PURE__ */ __name((context, response) => {
    let pathnameContainsDefaultLocale = false;
    const url = context.url;
    for (const segment of url.pathname.split("/")) {
      if (normalizeTheLocale(segment) === normalizeTheLocale(i18n.defaultLocale)) {
        pathnameContainsDefaultLocale = true;
        break;
      }
    }
    if (pathnameContainsDefaultLocale) {
      const newLocation = url.pathname.replace(`/${i18n.defaultLocale}`, "");
      response.headers.set("Location", newLocation);
      return _noFoundForNonLocaleRoute(context);
    }
    return void 0;
  }, "prefixOtherLocales");
  return async (context, next) => {
    const response = await next();
    const type = response.headers.get(ROUTE_TYPE_HEADER);
    const isReroute = response.headers.get(REROUTE_DIRECTIVE_HEADER);
    if (isReroute === "no" && typeof i18n.fallback === "undefined") {
      return response;
    }
    if (type !== "page" && type !== "fallback") {
      return response;
    }
    if (requestIs404Or500(context.request, base)) {
      return response;
    }
    const { currentLocale } = context;
    switch (i18n.strategy) {
      case "manual": {
        return response;
      }
      case "domains-prefix-other-locales": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = prefixOtherLocales(context, response);
          if (result) {
            return result;
          }
        }
        break;
      }
      case "pathname-prefix-other-locales": {
        const result = prefixOtherLocales(context, response);
        if (result) {
          return result;
        }
        break;
      }
      case "domains-prefix-always-no-redirect": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = _noFoundForNonLocaleRoute(context, response);
          if (result) {
            return result;
          }
        }
        break;
      }
      case "pathname-prefix-always-no-redirect": {
        const result = _noFoundForNonLocaleRoute(context, response);
        if (result) {
          return result;
        }
        break;
      }
      case "pathname-prefix-always": {
        const result = prefixAlways(context);
        if (result) {
          return result;
        }
        break;
      }
      case "domains-prefix-always": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = prefixAlways(context);
          if (result) {
            return result;
          }
        }
        break;
      }
    }
    return _redirectToFallback(context, response);
  };
}
__name(createI18nMiddleware, "createI18nMiddleware");
function localeHasntDomain(i18n, currentLocale) {
  for (const domainLocale of Object.values(i18n.domainLookupTable)) {
    if (domainLocale === currentLocale) {
      return false;
    }
  }
  return true;
}
__name(localeHasntDomain, "localeHasntDomain");
var FORM_CONTENT_TYPES = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain"
];
function createOriginCheckMiddleware() {
  return defineMiddleware((context, next) => {
    const { request, url } = context;
    if (request.method === "GET") {
      return next();
    }
    const sameOrigin = (request.method === "POST" || request.method === "PUT" || request.method === "PATCH" || request.method === "DELETE") && request.headers.get("origin") === url.origin;
    const hasContentType = request.headers.has("content-type");
    if (hasContentType) {
      const formLikeHeader = hasFormLikeHeader(request.headers.get("content-type"));
      if (formLikeHeader && !sameOrigin) {
        return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
          status: 403
        });
      }
    } else {
      if (!sameOrigin) {
        return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
          status: 403
        });
      }
    }
    return next();
  });
}
__name(createOriginCheckMiddleware, "createOriginCheckMiddleware");
function hasFormLikeHeader(contentType) {
  if (contentType) {
    for (const FORM_CONTENT_TYPE of FORM_CONTENT_TYPES) {
      if (contentType.toLowerCase().includes(FORM_CONTENT_TYPE)) {
        return true;
      }
    }
  }
  return false;
}
__name(hasFormLikeHeader, "hasFormLikeHeader");
function getPattern(segments, base, addTrailingSlash) {
  const pathname = segments.map((segment) => {
    if (segment.length === 1 && segment[0].spread) {
      return "(?:\\/(.*?))?";
    } else {
      return "\\/" + segment.map((part) => {
        if (part.spread) {
          return "(.*?)";
        } else if (part.dynamic) {
          return "([^/]+?)";
        } else {
          return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }
      }).join("");
    }
  }).join("");
  const trailing = addTrailingSlash && segments.length ? getTrailingSlashPattern(addTrailingSlash) : "$";
  let initial = "\\/";
  if (addTrailingSlash === "never" && base !== "/") {
    initial = "";
  }
  return new RegExp(`^${pathname || initial}${trailing}`);
}
__name(getPattern, "getPattern");
function getTrailingSlashPattern(addTrailingSlash) {
  if (addTrailingSlash === "always") {
    return "\\/$";
  }
  if (addTrailingSlash === "never") {
    return "$";
  }
  return "\\/?$";
}
__name(getTrailingSlashPattern, "getTrailingSlashPattern");
var SERVER_ISLAND_ROUTE = "/_server-islands/[name]";
var SERVER_ISLAND_COMPONENT = "_server-islands.astro";
function getServerIslandRouteData(config) {
  const segments = [
    [{ content: "_server-islands", dynamic: false, spread: false }],
    [{ content: "name", dynamic: true, spread: false }]
  ];
  const route = {
    type: "page",
    component: SERVER_ISLAND_COMPONENT,
    generate: () => "",
    params: ["name"],
    segments,
    pattern: getPattern(segments, config.base, config.trailingSlash),
    prerender: false,
    isIndex: false,
    fallbackRoutes: [],
    route: SERVER_ISLAND_ROUTE
  };
  return route;
}
__name(getServerIslandRouteData, "getServerIslandRouteData");
function ensureServerIslandRoute(config, routeManifest) {
  if (routeManifest.routes.some((route) => route.route === "/_server-islands/[name]")) {
    return;
  }
  routeManifest.routes.unshift(getServerIslandRouteData(config));
}
__name(ensureServerIslandRoute, "ensureServerIslandRoute");
function createEndpoint(manifest2) {
  const page = /* @__PURE__ */ __name(async (result) => {
    const params = result.params;
    const request = result.request;
    const raw = await request.text();
    const data = JSON.parse(raw);
    if (!params.name) {
      return new Response(null, {
        status: 400,
        statusText: "Bad request"
      });
    }
    const componentId = params.name;
    const imp = manifest2.serverIslandMap?.get(componentId);
    if (!imp) {
      return new Response(null, {
        status: 404,
        statusText: "Not found"
      });
    }
    const key = await manifest2.key;
    const encryptedProps = data.encryptedProps;
    const propString = await decryptString(key, encryptedProps);
    const props = JSON.parse(propString);
    const componentModule = await imp();
    const Component = componentModule[data.componentExport];
    const slots = {};
    for (const prop in data.slots) {
      slots[prop] = createSlotValueFromString(data.slots[prop]);
    }
    return renderTemplate`${renderComponent(result, "Component", Component, props, slots)}`;
  }, "page");
  page.isAstroComponentFactory = true;
  const instance = {
    default: page,
    partial: true
  };
  return instance;
}
__name(createEndpoint, "createEndpoint");
function injectDefaultRoutes(ssrManifest, routeManifest) {
  ensure404Route(routeManifest);
  ensureServerIslandRoute(ssrManifest, routeManifest);
  return routeManifest;
}
__name(injectDefaultRoutes, "injectDefaultRoutes");
function createDefaultRoutes(manifest2) {
  const root = new URL(manifest2.hrefRoot);
  return [
    {
      instance: default404Instance,
      matchesComponent: (filePath) => filePath.href === new URL(DEFAULT_404_COMPONENT, root).href,
      route: DEFAULT_404_ROUTE.route,
      component: DEFAULT_404_COMPONENT
    },
    {
      instance: createEndpoint(manifest2),
      matchesComponent: (filePath) => filePath.href === new URL(SERVER_ISLAND_COMPONENT, root).href,
      route: SERVER_ISLAND_ROUTE,
      component: SERVER_ISLAND_COMPONENT
    }
  ];
}
__name(createDefaultRoutes, "createDefaultRoutes");
var Pipeline = class {
  constructor(logger, manifest2, mode, renderers2, resolve, serverLike, streaming, adapterName = manifest2.adapterName, clientDirectives = manifest2.clientDirectives, inlinedScripts = manifest2.inlinedScripts, compressHTML = manifest2.compressHTML, i18n = manifest2.i18n, middleware = manifest2.middleware, routeCache = new RouteCache(logger, mode), site = manifest2.site ? new URL(manifest2.site) : void 0, defaultRoutes = createDefaultRoutes(manifest2)) {
    this.logger = logger;
    this.manifest = manifest2;
    this.mode = mode;
    this.renderers = renderers2;
    this.resolve = resolve;
    this.serverLike = serverLike;
    this.streaming = streaming;
    this.adapterName = adapterName;
    this.clientDirectives = clientDirectives;
    this.inlinedScripts = inlinedScripts;
    this.compressHTML = compressHTML;
    this.i18n = i18n;
    this.middleware = middleware;
    this.routeCache = routeCache;
    this.site = site;
    this.defaultRoutes = defaultRoutes;
    this.internalMiddleware = [];
    if (i18n?.strategy !== "manual") {
      this.internalMiddleware.push(
        createI18nMiddleware(i18n, manifest2.base, manifest2.trailingSlash, manifest2.buildFormat)
      );
    }
  }
  internalMiddleware;
  resolvedMiddleware = void 0;
  /**
   * Resolves the middleware from the manifest, and returns the `onRequest` function. If `onRequest` isn't there,
   * it returns a no-op function
   */
  async getMiddleware() {
    if (this.resolvedMiddleware) {
      return this.resolvedMiddleware;
    } else if (this.middleware) {
      const middlewareInstance = await this.middleware();
      const onRequest = middlewareInstance.onRequest ?? NOOP_MIDDLEWARE_FN;
      if (this.manifest.checkOrigin) {
        this.resolvedMiddleware = sequence(createOriginCheckMiddleware(), onRequest);
      } else {
        this.resolvedMiddleware = onRequest;
      }
      return this.resolvedMiddleware;
    } else {
      this.resolvedMiddleware = NOOP_MIDDLEWARE_FN;
      return this.resolvedMiddleware;
    }
  }
};
__name(Pipeline, "Pipeline");
var RedirectComponentInstance = {
  default() {
    return new Response(null, {
      status: 301
    });
  }
};
var RedirectSinglePageBuiltModule = {
  page: () => Promise.resolve(RedirectComponentInstance),
  onRequest: (_, next) => next(),
  renderers: []
};
var dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
var levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
__name(log, "log");
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
__name(isLogLevelEnabled, "isLogLevelEnabled");
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
__name(info, "info");
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
__name(warn, "warn");
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
__name(error, "error");
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
__name(debug, "debug");
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return red(prefix.join(" "));
  }
  if (level === "warn") {
    return yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return dim(prefix[0]);
  }
  return dim(prefix[0]) + " " + blue(prefix.splice(1).join(" "));
}
__name(getEventPrefix, "getEventPrefix");
var Logger = class {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
};
__name(Logger, "Logger");
var AstroIntegrationLogger = class {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
};
__name(AstroIntegrationLogger, "AstroIntegrationLogger");
var consoleLogDestination = {
  write(event) {
    let dest = console.error;
    if (levels[event.level] < levels["error"]) {
      dest = console.log;
    }
    if (event.label === "SKIP_FORMAT") {
      dest(event.message);
    } else {
      dest(getEventPrefix(event) + " " + event.message);
    }
    return true;
  }
};
function getAssetsPrefix(fileExtension2, assetsPrefix) {
  if (!assetsPrefix)
    return "";
  if (typeof assetsPrefix === "string")
    return assetsPrefix;
  const dotLessFileExtension = fileExtension2.slice(1);
  if (assetsPrefix[dotLessFileExtension]) {
    return assetsPrefix[dotLessFileExtension];
  }
  return assetsPrefix.fallback;
}
__name(getAssetsPrefix, "getAssetsPrefix");
function createAssetLink(href, base, assetsPrefix) {
  if (assetsPrefix) {
    const pf = getAssetsPrefix(fileExtension(href), assetsPrefix);
    return joinPaths(pf, slash(href));
  } else if (base) {
    return prependForwardSlash(joinPaths(base, slash(href)));
  } else {
    return href;
  }
}
__name(createAssetLink, "createAssetLink");
function createStylesheetElement(stylesheet, base, assetsPrefix) {
  if (stylesheet.type === "inline") {
    return {
      props: {},
      children: stylesheet.content
    };
  } else {
    return {
      props: {
        rel: "stylesheet",
        href: createAssetLink(stylesheet.src, base, assetsPrefix)
      },
      children: ""
    };
  }
}
__name(createStylesheetElement, "createStylesheetElement");
function createStylesheetElementSet(stylesheets, base, assetsPrefix) {
  return new Set(stylesheets.map((s) => createStylesheetElement(s, base, assetsPrefix)));
}
__name(createStylesheetElementSet, "createStylesheetElementSet");
function createModuleScriptElement(script, base, assetsPrefix) {
  if (script.type === "external") {
    return createModuleScriptElementWithSrc(script.value, base, assetsPrefix);
  } else {
    return {
      props: {
        type: "module"
      },
      children: script.value
    };
  }
}
__name(createModuleScriptElement, "createModuleScriptElement");
function createModuleScriptElementWithSrc(src, base, assetsPrefix) {
  return {
    props: {
      type: "module",
      src: createAssetLink(src, base, assetsPrefix)
    },
    children: ""
  };
}
__name(createModuleScriptElementWithSrc, "createModuleScriptElementWithSrc");
var AppPipeline = class extends Pipeline {
  #manifestData;
  static create(manifestData, {
    logger,
    manifest: manifest2,
    mode,
    renderers: renderers2,
    resolve,
    serverLike,
    streaming,
    defaultRoutes
  }) {
    const pipeline = new AppPipeline(
      logger,
      manifest2,
      mode,
      renderers2,
      resolve,
      serverLike,
      streaming,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      defaultRoutes
    );
    pipeline.#manifestData = manifestData;
    return pipeline;
  }
  headElements(routeData) {
    const routeInfo = this.manifest.routes.find((route) => route.routeData === routeData);
    const links = /* @__PURE__ */ new Set();
    const scripts = /* @__PURE__ */ new Set();
    const styles = createStylesheetElementSet(routeInfo?.styles ?? []);
    for (const script of routeInfo?.scripts ?? []) {
      if ("stage" in script) {
        if (script.stage === "head-inline") {
          scripts.add({
            props: {},
            children: script.children
          });
        }
      } else {
        scripts.add(createModuleScriptElement(script));
      }
    }
    return { links, styles, scripts };
  }
  componentMetadata() {
  }
  async getComponentByRoute(routeData) {
    const module = await this.getModuleForRoute(routeData);
    return module.page();
  }
  async tryRewrite(payload, request) {
    const { newUrl, pathname, routeData } = findRouteToRewrite({
      payload,
      request,
      routes: this.manifest?.routes.map((r) => r.routeData),
      trailingSlash: this.manifest.trailingSlash,
      buildFormat: this.manifest.buildFormat,
      base: this.manifest.base
    });
    const componentInstance = await this.getComponentByRoute(routeData);
    return { newUrl, pathname, componentInstance, routeData };
  }
  async getModuleForRoute(route) {
    for (const defaultRoute of this.defaultRoutes) {
      if (route.component === defaultRoute.component) {
        return {
          page: () => Promise.resolve(defaultRoute.instance),
          renderers: []
        };
      }
    }
    if (route.type === "redirect") {
      return RedirectSinglePageBuiltModule;
    } else {
      if (this.manifest.pageMap) {
        const importComponentInstance = this.manifest.pageMap.get(route.component);
        if (!importComponentInstance) {
          throw new Error(
            `Unexpectedly unable to find a component instance for route ${route.route}`
          );
        }
        return await importComponentInstance();
      } else if (this.manifest.pageModule) {
        return this.manifest.pageModule;
      }
      throw new Error(
        "Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error, please file an issue."
      );
    }
  }
};
__name(AppPipeline, "AppPipeline");
var _manifest, _manifestData, _logger, _baseWithoutTrailingSlash, _pipeline, _adapterLogger, _renderOptionsDeprecationWarningShown, _createPipeline, createPipeline_fn, _getPathnameFromRequest, getPathnameFromRequest_fn, _computePathnameFromDomain, computePathnameFromDomain_fn, _logRenderOptionsDeprecationWarning, logRenderOptionsDeprecationWarning_fn, _renderError, renderError_fn, _mergeResponses, mergeResponses_fn, _getDefaultStatusCode, getDefaultStatusCode_fn;
var _App = class {
  constructor(manifest2, streaming = true) {
    /**
     * Creates a pipeline by reading the stored manifest
     *
     * @param manifestData
     * @param streaming
     * @private
     */
    __privateAdd(this, _createPipeline);
    __privateAdd(this, _getPathnameFromRequest);
    __privateAdd(this, _computePathnameFromDomain);
    __privateAdd(this, _logRenderOptionsDeprecationWarning);
    /**
     * If it is a known error code, try sending the according page (e.g. 404.astro / 500.astro).
     * This also handles pre-rendered /404 or /500 routes
     */
    __privateAdd(this, _renderError);
    __privateAdd(this, _mergeResponses);
    __privateAdd(this, _getDefaultStatusCode);
    __privateAdd(this, _manifest, void 0);
    __privateAdd(this, _manifestData, void 0);
    __privateAdd(this, _logger, new Logger({
      dest: consoleLogDestination,
      level: "info"
    }));
    __privateAdd(this, _baseWithoutTrailingSlash, void 0);
    __privateAdd(this, _pipeline, void 0);
    __privateAdd(this, _adapterLogger, void 0);
    __privateAdd(this, _renderOptionsDeprecationWarningShown, false);
    __privateSet(this, _manifest, manifest2);
    __privateSet(this, _manifestData, injectDefaultRoutes(manifest2, {
      routes: manifest2.routes.map((route) => route.routeData)
    }));
    __privateSet(this, _baseWithoutTrailingSlash, removeTrailingForwardSlash(__privateGet(this, _manifest).base));
    __privateSet(this, _pipeline, __privateMethod(this, _createPipeline, createPipeline_fn).call(this, __privateGet(this, _manifestData), streaming));
    __privateSet(this, _adapterLogger, new AstroIntegrationLogger(
      __privateGet(this, _logger).options,
      __privateGet(this, _manifest).adapterName
    ));
  }
  getAdapterLogger() {
    return __privateGet(this, _adapterLogger);
  }
  set setManifestData(newManifestData) {
    __privateSet(this, _manifestData, newManifestData);
  }
  removeBase(pathname) {
    if (pathname.startsWith(__privateGet(this, _manifest).base)) {
      return pathname.slice(__privateGet(this, _baseWithoutTrailingSlash).length + 1);
    }
    return pathname;
  }
  match(request) {
    const url = new URL(request.url);
    if (__privateGet(this, _manifest).assets.has(url.pathname))
      return void 0;
    let pathname = __privateMethod(this, _computePathnameFromDomain, computePathnameFromDomain_fn).call(this, request);
    if (!pathname) {
      pathname = prependForwardSlash(this.removeBase(url.pathname));
    }
    let routeData = matchRoute(pathname, __privateGet(this, _manifestData));
    if (!routeData || routeData.prerender)
      return void 0;
    return routeData;
  }
  async render(request, routeDataOrOptions, maybeLocals) {
    let routeData;
    let locals;
    let clientAddress;
    let addCookieHeader;
    if (routeDataOrOptions && ("addCookieHeader" in routeDataOrOptions || "clientAddress" in routeDataOrOptions || "locals" in routeDataOrOptions || "routeData" in routeDataOrOptions)) {
      if ("addCookieHeader" in routeDataOrOptions) {
        addCookieHeader = routeDataOrOptions.addCookieHeader;
      }
      if ("clientAddress" in routeDataOrOptions) {
        clientAddress = routeDataOrOptions.clientAddress;
      }
      if ("routeData" in routeDataOrOptions) {
        routeData = routeDataOrOptions.routeData;
      }
      if ("locals" in routeDataOrOptions) {
        locals = routeDataOrOptions.locals;
      }
    } else {
      routeData = routeDataOrOptions;
      locals = maybeLocals;
      if (routeDataOrOptions || locals) {
        __privateMethod(this, _logRenderOptionsDeprecationWarning, logRenderOptionsDeprecationWarning_fn).call(this);
      }
    }
    if (routeData) {
      __privateGet(this, _logger).debug(
        "router",
        "The adapter " + __privateGet(this, _manifest).adapterName + " provided a custom RouteData for ",
        request.url
      );
      __privateGet(this, _logger).debug("router", "RouteData:\n" + routeData);
    }
    if (locals) {
      if (typeof locals !== "object") {
        const error2 = new AstroError(LocalsNotAnObject);
        __privateGet(this, _logger).error(null, error2.stack);
        return __privateMethod(this, _renderError, renderError_fn).call(this, request, { status: 500, error: error2 });
      }
      Reflect.set(request, clientLocalsSymbol, locals);
    }
    if (clientAddress) {
      Reflect.set(request, clientAddressSymbol, clientAddress);
    }
    if (!routeData) {
      routeData = this.match(request);
      __privateGet(this, _logger).debug("router", "Astro matched the following route for " + request.url);
      __privateGet(this, _logger).debug("router", "RouteData:\n" + routeData);
    }
    if (!routeData) {
      __privateGet(this, _logger).debug("router", "Astro hasn't found routes that match " + request.url);
      __privateGet(this, _logger).debug("router", "Here's the available routes:\n", __privateGet(this, _manifestData));
      return __privateMethod(this, _renderError, renderError_fn).call(this, request, { locals, status: 404 });
    }
    const pathname = __privateMethod(this, _getPathnameFromRequest, getPathnameFromRequest_fn).call(this, request);
    const defaultStatus = __privateMethod(this, _getDefaultStatusCode, getDefaultStatusCode_fn).call(this, routeData, pathname);
    let response;
    try {
      const mod = await __privateGet(this, _pipeline).getModuleForRoute(routeData);
      const renderContext = await RenderContext.create({
        pipeline: __privateGet(this, _pipeline),
        locals,
        pathname,
        request,
        routeData,
        status: defaultStatus
      });
      response = await renderContext.render(await mod.page());
    } catch (err) {
      __privateGet(this, _logger).error(null, err.stack || err.message || String(err));
      return __privateMethod(this, _renderError, renderError_fn).call(this, request, { locals, status: 500, error: err });
    }
    if (REROUTABLE_STATUS_CODES.includes(response.status) && response.headers.get(REROUTE_DIRECTIVE_HEADER) !== "no") {
      return __privateMethod(this, _renderError, renderError_fn).call(this, request, {
        locals,
        response,
        status: response.status,
        // We don't have an error to report here. Passing null means we pass nothing intentionally
        // while undefined means there's no error
        error: response.status === 500 ? null : void 0
      });
    }
    if (response.headers.has(REROUTE_DIRECTIVE_HEADER)) {
      response.headers.delete(REROUTE_DIRECTIVE_HEADER);
    }
    if (addCookieHeader) {
      for (const setCookieHeaderValue of _App.getSetCookieFromResponse(response)) {
        response.headers.append("set-cookie", setCookieHeaderValue);
      }
    }
    Reflect.set(response, responseSentSymbol, true);
    return response;
  }
  setCookieHeaders(response) {
    return getSetCookiesFromResponse(response);
  }
};
var App = _App;
__name(App, "App");
_manifest = new WeakMap();
_manifestData = new WeakMap();
_logger = new WeakMap();
_baseWithoutTrailingSlash = new WeakMap();
_pipeline = new WeakMap();
_adapterLogger = new WeakMap();
_renderOptionsDeprecationWarningShown = new WeakMap();
_createPipeline = new WeakSet();
createPipeline_fn = /* @__PURE__ */ __name(function(manifestData, streaming = false) {
  return AppPipeline.create(manifestData, {
    logger: __privateGet(this, _logger),
    manifest: __privateGet(this, _manifest),
    mode: "production",
    renderers: __privateGet(this, _manifest).renderers,
    defaultRoutes: createDefaultRoutes(__privateGet(this, _manifest)),
    resolve: async (specifier) => {
      if (!(specifier in __privateGet(this, _manifest).entryModules)) {
        throw new Error(`Unable to resolve [${specifier}]`);
      }
      const bundlePath = __privateGet(this, _manifest).entryModules[specifier];
      if (bundlePath.startsWith("data:") || bundlePath.length === 0) {
        return bundlePath;
      } else {
        return createAssetLink(bundlePath, __privateGet(this, _manifest).base, __privateGet(this, _manifest).assetsPrefix);
      }
    },
    serverLike: true,
    streaming
  });
}, "#createPipeline");
_getPathnameFromRequest = new WeakSet();
getPathnameFromRequest_fn = /* @__PURE__ */ __name(function(request) {
  const url = new URL(request.url);
  const pathname = prependForwardSlash(this.removeBase(url.pathname));
  return pathname;
}, "#getPathnameFromRequest");
_computePathnameFromDomain = new WeakSet();
computePathnameFromDomain_fn = /* @__PURE__ */ __name(function(request) {
  let pathname = void 0;
  const url = new URL(request.url);
  if (__privateGet(this, _manifest).i18n && (__privateGet(this, _manifest).i18n.strategy === "domains-prefix-always" || __privateGet(this, _manifest).i18n.strategy === "domains-prefix-other-locales" || __privateGet(this, _manifest).i18n.strategy === "domains-prefix-always-no-redirect")) {
    let host = request.headers.get("X-Forwarded-Host");
    let protocol = request.headers.get("X-Forwarded-Proto");
    if (protocol) {
      protocol = protocol + ":";
    } else {
      protocol = url.protocol;
    }
    if (!host) {
      host = request.headers.get("Host");
    }
    if (host && protocol) {
      host = host.split(":")[0];
      try {
        let locale;
        const hostAsUrl = new URL(`${protocol}//${host}`);
        for (const [domainKey, localeValue] of Object.entries(
          __privateGet(this, _manifest).i18n.domainLookupTable
        )) {
          const domainKeyAsUrl = new URL(domainKey);
          if (hostAsUrl.host === domainKeyAsUrl.host && hostAsUrl.protocol === domainKeyAsUrl.protocol) {
            locale = localeValue;
            break;
          }
        }
        if (locale) {
          pathname = prependForwardSlash(
            joinPaths(normalizeTheLocale(locale), this.removeBase(url.pathname))
          );
          if (url.pathname.endsWith("/")) {
            pathname = appendForwardSlash(pathname);
          }
        }
      } catch (e) {
        __privateGet(this, _logger).error(
          "router",
          `Astro tried to parse ${protocol}//${host} as an URL, but it threw a parsing error. Check the X-Forwarded-Host and X-Forwarded-Proto headers.`
        );
        __privateGet(this, _logger).error("router", `Error: ${e}`);
      }
    }
  }
  return pathname;
}, "#computePathnameFromDomain");
_logRenderOptionsDeprecationWarning = new WeakSet();
logRenderOptionsDeprecationWarning_fn = /* @__PURE__ */ __name(function() {
  if (__privateGet(this, _renderOptionsDeprecationWarningShown))
    return;
  __privateGet(this, _logger).warn(
    "deprecated",
    `The adapter ${__privateGet(this, _manifest).adapterName} is using a deprecated signature of the 'app.render()' method. From Astro 4.0, locals and routeData are provided as properties on an optional object to this method. Using the old signature will cause an error in Astro 5.0. See https://github.com/withastro/astro/pull/9199 for more information.`
  );
  __privateSet(this, _renderOptionsDeprecationWarningShown, true);
}, "#logRenderOptionsDeprecationWarning");
_renderError = new WeakSet();
renderError_fn = /* @__PURE__ */ __name(async function(request, {
  locals,
  status,
  response: originalResponse,
  skipMiddleware = false,
  error: error2
}) {
  const errorRoutePath = `/${status}${__privateGet(this, _manifest).trailingSlash === "always" ? "/" : ""}`;
  const errorRouteData = matchRoute(errorRoutePath, __privateGet(this, _manifestData));
  const url = new URL(request.url);
  if (errorRouteData) {
    if (errorRouteData.prerender) {
      const maybeDotHtml = errorRouteData.route.endsWith(`/${status}`) ? ".html" : "";
      const statusURL = new URL(
        `${__privateGet(this, _baseWithoutTrailingSlash)}/${status}${maybeDotHtml}`,
        url
      );
      if (statusURL.toString() !== request.url) {
        const response2 = await fetch(statusURL.toString());
        const override = { status };
        return __privateMethod(this, _mergeResponses, mergeResponses_fn).call(this, response2, originalResponse, override);
      }
    }
    const mod = await __privateGet(this, _pipeline).getModuleForRoute(errorRouteData);
    try {
      const renderContext = await RenderContext.create({
        locals,
        pipeline: __privateGet(this, _pipeline),
        middleware: skipMiddleware ? NOOP_MIDDLEWARE_FN : void 0,
        pathname: __privateMethod(this, _getPathnameFromRequest, getPathnameFromRequest_fn).call(this, request),
        request,
        routeData: errorRouteData,
        status,
        props: { error: error2 }
      });
      const response2 = await renderContext.render(await mod.page());
      return __privateMethod(this, _mergeResponses, mergeResponses_fn).call(this, response2, originalResponse);
    } catch {
      if (skipMiddleware === false) {
        return __privateMethod(this, _renderError, renderError_fn).call(this, request, {
          locals,
          status,
          response: originalResponse,
          skipMiddleware: true
        });
      }
    }
  }
  const response = __privateMethod(this, _mergeResponses, mergeResponses_fn).call(this, new Response(null, { status }), originalResponse);
  Reflect.set(response, responseSentSymbol, true);
  return response;
}, "#renderError");
_mergeResponses = new WeakSet();
mergeResponses_fn = /* @__PURE__ */ __name(function(newResponse, originalResponse, override) {
  if (!originalResponse) {
    if (override !== void 0) {
      return new Response(newResponse.body, {
        status: override.status,
        statusText: newResponse.statusText,
        headers: newResponse.headers
      });
    }
    return newResponse;
  }
  const status = override?.status ? override.status : originalResponse.status === 200 ? newResponse.status : originalResponse.status;
  try {
    originalResponse.headers.delete("Content-type");
  } catch {
  }
  return new Response(newResponse.body, {
    status,
    statusText: status === 200 ? newResponse.statusText : originalResponse.statusText,
    // If you're looking at here for possible bugs, it means that it's not a bug.
    // With the middleware, users can meddle with headers, and we should pass to the 404/500.
    // If users see something weird, it's because they are setting some headers they should not.
    //
    // Although, we don't want it to replace the content-type, because the error page must return `text/html`
    headers: new Headers([
      ...Array.from(newResponse.headers),
      ...Array.from(originalResponse.headers)
    ])
  });
}, "#mergeResponses");
_getDefaultStatusCode = new WeakSet();
getDefaultStatusCode_fn = /* @__PURE__ */ __name(function(routeData, pathname) {
  if (!routeData.pattern.test(pathname)) {
    for (const fallbackRoute of routeData.fallbackRoutes) {
      if (fallbackRoute.pattern.test(pathname)) {
        return 302;
      }
    }
  }
  const route = removeTrailingForwardSlash(routeData.route);
  if (route.endsWith("/404"))
    return 404;
  if (route.endsWith("/500"))
    return 500;
  return 200;
}, "#getDefaultStatusCode");
/**
 * Reads all the cookies written by `Astro.cookie.set()` onto the passed response.
 * For example,
 * ```ts
 * for (const cookie_ of App.getSetCookieFromResponse(response)) {
 *     const cookie: string = cookie_
 * }
 * ```
 * @param response The response to read cookies from.
 * @returns An iterator that yields key-value pairs as equal-sign-separated strings.
 */
__publicField(App, "getSetCookieFromResponse", getSetCookiesFromResponse);
function createExports(manifest2) {
  const app = new App(manifest2);
  const fetch2 = /* @__PURE__ */ __name(async (request, env, context) => {
    const { pathname } = new URL(request.url);
    if (manifest2.assets.has(pathname)) {
      return env.ASSETS.fetch(request.url.replace(/\.html$/, ""));
    }
    const routeData = app.match(request);
    if (!routeData) {
      const asset = await env.ASSETS.fetch(request.url.replace(/index.html$/, "").replace(/\.html$/, ""));
      if (asset.status !== 404) {
        return asset;
      }
    }
    Reflect.set(request, Symbol.for("astro.clientAddress"), request.headers.get("cf-connecting-ip"));
    process.env.ASTRO_STUDIO_APP_TOKEN ??= (() => {
      if (typeof env.ASTRO_STUDIO_APP_TOKEN === "string") {
        return env.ASTRO_STUDIO_APP_TOKEN;
      }
    })();
    const locals = {
      runtime: {
        env,
        cf: request.cf,
        caches,
        ctx: {
          waitUntil: (promise) => context.waitUntil(promise),
          // Currently not available: https://developers.cloudflare.com/pages/platform/known-issues/#pages-functions
          passThroughOnException: () => {
            throw new Error("`passThroughOnException` is currently not available in Cloudflare Pages. See https://developers.cloudflare.com/pages/platform/known-issues/#pages-functions.");
          }
        }
      }
    };
    const response = await app.render(request, { routeData, locals });
    if (app.setCookieHeaders) {
      for (const setCookieHeader of app.setCookieHeaders(response)) {
        response.headers.append("Set-Cookie", setCookieHeader);
      }
    }
    return response;
  }, "fetch");
  return { default: { fetch: fetch2 } };
}
__name(createExports, "createExports");

// _worker.js/manifest_BXd5hZ_V.mjs
import { g as decodeKey } from "./chunks/astro/server_CgTYz_Tl.mjs";
import "./chunks/astro-designed-error-pages_DfD573yd.mjs";
import { N as NOOP_MIDDLEWARE_FN2 } from "./chunks/noop-middleware_Chs5f3j2.mjs";
globalThis.process ??= {};
globalThis.process.env ??= {};
function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
__name(sanitizeParams, "sanitizeParams");
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
__name(getParameter, "getParameter");
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
__name(getSegment, "getSegment");
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}
__name(getRouteGenerator, "getRouteGenerator");
function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}
__name(deserializeRouteData, "deserializeRouteData");
function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN2 };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}
__name(deserializeManifest, "deserializeManifest");
var manifest = deserializeManifest({ "hrefRoot": "file:///C:/Users/berto/Documents/Ombreeluci/", "adapterName": "@astrojs/cloudflare", "routes": [{ "file": "404.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/404", "isIndex": false, "type": "page", "pattern": "^\\/404\\/?$", "segments": [[{ "content": "404", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/404.astro", "pathname": "/404", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "archivio/web-only/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/archivio/web-only", "isIndex": false, "type": "page", "pattern": "^\\/archivio\\/web-only\\/?$", "segments": [[{ "content": "archivio", "dynamic": false, "spread": false }], [{ "content": "web-only", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/archivio/web-only.astro", "pathname": "/archivio/web-only", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "archivio/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/archivio", "isIndex": true, "type": "page", "pattern": "^\\/archivio\\/?$", "segments": [[{ "content": "archivio", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/archivio/index.astro", "pathname": "/archivio", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "autori/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/autori", "isIndex": true, "type": "page", "pattern": "^\\/autori\\/?$", "segments": [[{ "content": "autori", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/autori/index.astro", "pathname": "/autori", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "blog/en/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/blog/en", "isIndex": false, "type": "page", "pattern": "^\\/blog\\/en\\/?$", "segments": [[{ "content": "blog", "dynamic": false, "spread": false }], [{ "content": "en", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/blog/en.astro", "pathname": "/blog/en", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "cerca/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/cerca", "isIndex": false, "type": "page", "pattern": "^\\/cerca\\/?$", "segments": [[{ "content": "cerca", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/cerca.astro", "pathname": "/cerca", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/collaboratori/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/collaboratori", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/collaboratori\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "collaboratori", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/collaboratori.astro", "pathname": "/chi-siamo/collaboratori", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/contatti/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/contatti", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/contatti\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "contatti", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/contatti.astro", "pathname": "/chi-siamo/contatti", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/hanno-scritto-per-noi/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/hanno-scritto-per-noi", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/hanno-scritto-per-noi\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "hanno-scritto-per-noi", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/hanno-scritto-per-noi.astro", "pathname": "/chi-siamo/hanno-scritto-per-noi", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/la-redazione/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/la-redazione", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/la-redazione\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-redazione", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/la-redazione.astro", "pathname": "/chi-siamo/la-redazione", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/la-rivista/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/la-rivista", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/la-rivista\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-rivista", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/la-rivista.astro", "pathname": "/chi-siamo/la-rivista", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/redazione-storica/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/redazione-storica", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/redazione-storica\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "redazione-storica", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/redazione-storica.astro", "pathname": "/chi-siamo/redazione-storica", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo", "isIndex": true, "type": "page", "pattern": "^\\/chi-siamo\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/index.astro", "pathname": "/chi-siamo", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "debug/audit-editoriale/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/debug/audit-editoriale", "isIndex": false, "type": "page", "pattern": "^\\/debug\\/audit-editoriale\\/?$", "segments": [[{ "content": "debug", "dynamic": false, "spread": false }], [{ "content": "audit-editoriale", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/debug/audit-editoriale.astro", "pathname": "/debug/audit-editoriale", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "sezioni/dialogo-aperto/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/sezioni/dialogo-aperto", "isIndex": false, "type": "page", "pattern": "^\\/sezioni\\/dialogo-aperto\\/?$", "segments": [[{ "content": "sezioni", "dynamic": false, "spread": false }], [{ "content": "dialogo-aperto", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sezioni/dialogo-aperto.astro", "pathname": "/sezioni/dialogo-aperto", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "sezioni/diari/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/sezioni/diari", "isIndex": false, "type": "page", "pattern": "^\\/sezioni\\/diari\\/?$", "segments": [[{ "content": "sezioni", "dynamic": false, "spread": false }], [{ "content": "diari", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sezioni/diari.astro", "pathname": "/sezioni/diari", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "sostienici/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/sostienici", "isIndex": false, "type": "page", "pattern": "^\\/sostienici\\/?$", "segments": [[{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sostienici.astro", "pathname": "/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-lista/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-lista", "isIndex": false, "type": "page", "pattern": "^\\/test-lista\\/?$", "segments": [[{ "content": "test-lista", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-lista.astro", "pathname": "/test-lista", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-minimal/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-minimal", "isIndex": false, "type": "page", "pattern": "^\\/test-minimal\\/?$", "segments": [[{ "content": "test-minimal", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-minimal.astro", "pathname": "/test-minimal", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-no-articles/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-no-articles", "isIndex": false, "type": "page", "pattern": "^\\/test-no-articles\\/?$", "segments": [[{ "content": "test-no-articles", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-no-articles.astro", "pathname": "/test-no-articles", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-status/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-status", "isIndex": false, "type": "page", "pattern": "^\\/test-status\\/?$", "segments": [[{ "content": "test-status", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-status.astro", "pathname": "/test-status", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/", "isIndex": true, "type": "page", "pattern": "^\\/$", "segments": [], "params": [], "component": "src/pages/index.astro", "pathname": "/", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "endpoint", "isIndex": false, "route": "/_image", "pattern": "^\\/_image$", "segments": [[{ "content": "_image", "dynamic": false, "spread": false }]], "params": [], "component": "node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", "pathname": "/_image", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/debug-blog", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/debug-blog\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "debug-blog", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/debug-blog.ts", "pathname": "/api/debug-blog", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/debug-ssr-minimal", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/debug-ssr-minimal\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "debug-ssr-minimal", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/debug-ssr-minimal.ts", "pathname": "/api/debug-ssr-minimal", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/revalidate", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/revalidate\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "revalidate", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/revalidate.ts", "pathname": "/api/revalidate", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [{ "type": "external", "value": "/_astro/hoisted.CIErU2gF.js" }], "styles": [{ "type": "external", "src": "/_astro/_slug_.Bvtt_j-y.css" }, { "type": "external", "src": "/_astro/_diario_.DVQXp8w2.css" }, { "type": "inline", "content": ".astro-route-announcer{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}\n.article-card[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;gap:4px}.article-card--horizontal[data-astro-cid-di2nlc57],.article-card--horizontal[data-astro-cid-di2nlc57] .article-link[data-astro-cid-di2nlc57]{flex-direction:row;gap:1rem;align-items:flex-start}.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:140px;min-width:140px;aspect-ratio:4/3;margin-bottom:0}.article-card--horizontal[data-astro-cid-di2nlc57] .article-title[data-astro-cid-di2nlc57]{font-size:1rem;-webkit-line-clamp:3}.article-card--horizontal[data-astro-cid-di2nlc57] .author-row[data-astro-cid-di2nlc57]{font-size:.8125rem;white-space:normal;flex-wrap:wrap}@media (max-width: 480px){.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:100px;min-width:100px}}.article-link[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;text-decoration:none;color:inherit;align-items:flex-start}.article-image-wrap[data-astro-cid-di2nlc57]{width:100%;aspect-ratio:16/9;flex-shrink:0;overflow:hidden;border-radius:8px;margin-bottom:1rem}.article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{width:100%;height:auto;min-height:120px;object-fit:cover;display:block;transition:transform .35s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{transform:scale(1.03)}@media (max-width: 480px){.author-row[data-astro-cid-di2nlc57]{white-space:normal;flex-wrap:wrap}}.article-meta[data-astro-cid-di2nlc57]{width:100%;margin:0}.article-badge[data-astro-cid-di2nlc57]{margin:0 0 4px;color:var(--accent-color);font-family:Raleway,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.03em}.article-badge-muted[data-astro-cid-di2nlc57]{color:var(--text-secondary);background:#0000000d;padding:.25rem .5rem;border-radius:6px;width:fit-content;text-transform:none}.article-badge-text[data-astro-cid-di2nlc57]{display:inline}.article-title[data-astro-cid-di2nlc57]{margin:4px 0;font-family:Raleway,sans-serif;font-weight:700;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--text-color);font-size:1.25rem;transition:color .2s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-title[data-astro-cid-di2nlc57]{color:var(--accent-color)}.author-row[data-astro-cid-di2nlc57]{display:flex;align-items:center;gap:4px;margin:0;font-size:.9rem;color:var(--text-secondary);white-space:nowrap}.author-link[data-astro-cid-di2nlc57]{color:var(--accent-color);text-decoration:none;font-weight:600;display:inline}.article-sottotitolo[data-astro-cid-di2nlc57]{font-size:.875rem;line-height:1.5;color:var(--text-secondary);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.author-row--inline[data-astro-cid-di2nlc57]{margin-top:.5rem;font-size:.8125rem;color:var(--text-secondary);white-space:normal;flex-wrap:wrap}.author-avatar[data-astro-cid-di2nlc57]{width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0}\n" }], "routeData": { "route": "/blog/[...slug]", "isIndex": false, "type": "page", "pattern": "^\\/blog(?:\\/(.*?))?\\/?$", "segments": [[{ "content": "blog", "dynamic": false, "spread": false }], [{ "content": "...slug", "dynamic": true, "spread": true }]], "params": ["...slug"], "component": "src/pages/blog/[...slug].astro", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/about", "pattern": "^\\/about\\/?$", "segments": [[{ "content": "about", "dynamic": false, "spread": false }]], "params": [], "component": "/about", "pathname": "/about", "prerender": false, "redirect": "/chi-siamo", "redirectRoute": { "route": "/chi-siamo", "isIndex": true, "type": "page", "pattern": "^\\/chi-siamo\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/index.astro", "pathname": "/chi-siamo", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/collaboratori", "pattern": "^\\/chi-siamo\\/collaboratori\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "collaboratori", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/collaboratori", "pathname": "/chi-siamo/collaboratori", "prerender": false, "redirect": "/chi-siamo#collaboratori", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/contatti", "pattern": "^\\/chi-siamo\\/contatti\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "contatti", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/contatti", "pathname": "/chi-siamo/contatti", "prerender": false, "redirect": "/chi-siamo#contatti", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/hanno-scritto-per-noi", "pattern": "^\\/chi-siamo\\/hanno-scritto-per-noi\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "hanno-scritto-per-noi", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/hanno-scritto-per-noi", "pathname": "/chi-siamo/hanno-scritto-per-noi", "prerender": false, "redirect": "/chi-siamo#hanno-scritto-per-noi", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/la-redazione", "pattern": "^\\/chi-siamo\\/la-redazione\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-redazione", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/la-redazione", "pathname": "/chi-siamo/la-redazione", "prerender": false, "redirect": "/chi-siamo#la-redazione", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/la-rivista", "pattern": "^\\/chi-siamo\\/la-rivista\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-rivista", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/la-rivista", "pathname": "/chi-siamo/la-rivista", "prerender": false, "redirect": "/chi-siamo#la-rivista", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/redazione-storica", "pattern": "^\\/chi-siamo\\/redazione-storica\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "redazione-storica", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/redazione-storica", "pathname": "/chi-siamo/redazione-storica", "prerender": false, "redirect": "/chi-siamo#redazione-storica", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/contribuisci", "pattern": "^\\/contribuisci\\/?$", "segments": [[{ "content": "contribuisci", "dynamic": false, "spread": false }]], "params": [], "component": "/contribuisci", "pathname": "/contribuisci", "prerender": false, "redirect": "/sostienici", "redirectRoute": { "route": "/sostienici", "isIndex": false, "type": "page", "pattern": "^\\/sostienici\\/?$", "segments": [[{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sostienici.astro", "pathname": "/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/dona", "pattern": "^\\/dona\\/?$", "segments": [[{ "content": "dona", "dynamic": false, "spread": false }]], "params": [], "component": "/dona", "pathname": "/dona", "prerender": false, "redirect": "/sostienici", "redirectRoute": { "route": "/sostienici", "isIndex": false, "type": "page", "pattern": "^\\/sostienici\\/?$", "segments": [[{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sostienici.astro", "pathname": "/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }], "base": "/", "trailingSlash": "ignore", "compressHTML": true, "componentMetadata": [["C:/Users/berto/Documents/Ombreeluci/src/pages/debug/audit-editoriale.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-lista.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-minimal.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-no-articles.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-status.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/[diario].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/404.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/[issue].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/web-only.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/autori/[slug].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/autori/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/blog/[...slug].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/blog/en.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/categoria/[categoria].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/cerca.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/collaboratori.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/contatti.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/hanno-scritto-per-noi.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/la-redazione.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/la-rivista.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/redazione-storica.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/sezioni/dialogo-aperto.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/sezioni/diari.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/sostienici.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/components/Header.astro", { "propagation": "in-tree", "containsHead": false }], ["C:/Users/berto/Documents/Ombreeluci/src/layouts/BaseLayout.astro", { "propagation": "in-tree", "containsHead": false }], ["C:/Users/berto/Documents/Ombreeluci/src/layouts/DiarioLayout.astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/[diario]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astrojs-ssr-virtual-entry", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/404@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/archivio/[issue]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/archivio/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/archivio/web-only@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/autori/[slug]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/autori/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/blog/[...slug]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/blog/en@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/categoria/[categoria]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/cerca@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/collaboratori@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/contatti@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/hanno-scritto-per-noi@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/la-redazione@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/la-rivista@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/redazione-storica@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/sezioni/dialogo-aperto@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/sezioni/diari@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/sostienici@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/debug/audit-editoriale@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/test-lista@_@astro", { "propagation": "in-tree", "containsHead": false }]], "renderers": [], "clientDirectives": [["idle", '(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value=="object"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};"requestIdleCallback"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event("astro:idle"));})();'], ["load", '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event("astro:load"));})();'], ["media", '(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener("change",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event("astro:media"));})();'], ["only", '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event("astro:only"));})();'], ["visible", '(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value=="object"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event("astro:visible"));})();']], "entryModules": { "\0@astro-renderers": "renderers.mjs", "\0@astrojs-ssr-virtual-entry": "index.js", "\0@astro-page:node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint@_@js": "pages/_image.astro.mjs", "\0@astro-page:src/pages/404@_@astro": "pages/404.astro.mjs", "\0@astro-page:src/pages/api/debug-blog@_@ts": "pages/api/debug-blog.astro.mjs", "\0@astro-page:src/pages/api/debug-ssr-minimal@_@ts": "pages/api/debug-ssr-minimal.astro.mjs", "\0@astro-page:src/pages/api/revalidate@_@ts": "pages/api/revalidate.astro.mjs", "\0@astro-page:src/pages/archivio/web-only@_@astro": "pages/archivio/web-only.astro.mjs", "\0@astro-page:src/pages/archivio/index@_@astro": "pages/archivio.astro.mjs", "\0@astro-page:src/pages/autori/[slug]@_@astro": "pages/autori/_slug_.astro.mjs", "\0@astro-page:src/pages/autori/index@_@astro": "pages/autori.astro.mjs", "\0@astro-page:src/pages/blog/en@_@astro": "pages/blog/en.astro.mjs", "\0@astro-page:src/pages/categoria/[categoria]@_@astro": "pages/categoria/_categoria_.astro.mjs", "\0@astro-page:src/pages/cerca@_@astro": "pages/cerca.astro.mjs", "\0@astro-page:src/pages/chi-siamo/collaboratori@_@astro": "pages/chi-siamo/collaboratori.astro.mjs", "\0@astro-page:src/pages/chi-siamo/contatti@_@astro": "pages/chi-siamo/contatti.astro.mjs", "\0@astro-page:src/pages/chi-siamo/hanno-scritto-per-noi@_@astro": "pages/chi-siamo/hanno-scritto-per-noi.astro.mjs", "\0@astro-page:src/pages/chi-siamo/la-redazione@_@astro": "pages/chi-siamo/la-redazione.astro.mjs", "\0@astro-page:src/pages/chi-siamo/la-rivista@_@astro": "pages/chi-siamo/la-rivista.astro.mjs", "\0@astro-page:src/pages/chi-siamo/redazione-storica@_@astro": "pages/chi-siamo/redazione-storica.astro.mjs", "\0@astro-page:src/pages/chi-siamo/index@_@astro": "pages/chi-siamo.astro.mjs", "\0@astro-page:src/pages/debug/audit-editoriale@_@astro": "pages/debug/audit-editoriale.astro.mjs", "\0@astro-page:src/pages/sezioni/dialogo-aperto@_@astro": "pages/sezioni/dialogo-aperto.astro.mjs", "\0@astro-page:src/pages/sezioni/diari@_@astro": "pages/sezioni/diari.astro.mjs", "\0@astro-page:src/pages/test-lista@_@astro": "pages/test-lista.astro.mjs", "\0@astro-page:src/pages/test-minimal@_@astro": "pages/test-minimal.astro.mjs", "\0@astro-page:src/pages/test-no-articles@_@astro": "pages/test-no-articles.astro.mjs", "\0@astro-page:src/pages/test-status@_@astro": "pages/test-status.astro.mjs", "\0@astro-page:src/pages/archivio/[issue]@_@astro": "pages/archivio/_issue_.astro.mjs", "\0@astro-page:src/pages/[diario]@_@astro": "pages/_diario_.astro.mjs", "\0@astro-page:src/pages/index@_@astro": "pages/index.astro.mjs", "\0astro-internal:middleware": "_astro-internal_middleware.mjs", "\0@astro-page:src/pages/blog/[...slug]@_@astro": "pages/blog/_---slug_.astro.mjs", "\0@astro-page:src/pages/sostienici@_@astro": "pages/sostienici.astro.mjs", "\0@astrojs-ssr-adapter": "_@astrojs-ssr-adapter.mjs", "\0@astrojs-manifest": "manifest_BXd5hZ_V.mjs", "/astro/hoisted.js?q=0": "_astro/hoisted.BK-QpP4l.js", "/astro/hoisted.js?q=1": "_astro/hoisted.Cdv6NXjL.js", "/astro/hoisted.js?q=5": "_astro/hoisted.D6fN33OZ.js", "/astro/hoisted.js?q=6": "_astro/hoisted.e4Grq_nB.js", "/astro/hoisted.js?q=8": "_astro/hoisted.BFiuLOoW.js", "/astro/hoisted.js?q=2": "_astro/hoisted.CIErU2gF.js", "/astro/hoisted.js?q=3": "_astro/hoisted.xg5iX3wE.js", "/astro/hoisted.js?q=4": "_astro/hoisted.BuAflv2B.js", "/astro/hoisted.js?q=7": "_astro/hoisted.D2uAbj8P.js", "/astro/hoisted.js?q=9": "_astro/hoisted.B5wi8Mb5.js", "astro:scripts/before-hydration.js": "" }, "inlinedScripts": [], "assets": ["/_astro/logo.Cb_mP9bA.svg", "/_astro/_diario_.DVQXp8w2.css", "/_astro/_issue_.Bkp5H6tf.css", "/_astro/_slug_.Bvtt_j-y.css", "/_astro/index.DvHZiE6C.css", "/_astro/sostienici.DZRfRPtH.css", "/_astro/index.Dnzyu-xS.css", "/correlati.json", "/favicon.ico", "/favicon.png", "/favicon.svg", "/robots.txt", "/_redirects", "/admin/config.yml", "/fonts/raleway-latin.woff2", "/images/avatar-default.png", "/images/avatar-default.svg", "/images/dona1.webp", "/images/dona2.webp", "/images/dona3.webp", "/images/dona4.webp", "/images/dona7.webp", "/images/placeholder-copertina.svg", "/placeholder/ph-1.jpg", "/placeholder/ph-2.jpg", "/placeholder/ph-3.jpg", "/placeholder/ph-4.jpg", "/_astro/hoisted.B5wi8Mb5.js", "/_astro/hoisted.BFiuLOoW.js", "/_astro/hoisted.BK-QpP4l.js", "/_astro/hoisted.BuAflv2B.js", "/_astro/hoisted.Cdv6NXjL.js", "/_astro/hoisted.CIErU2gF.js", "/_astro/hoisted.CXOjeUv_.css", "/_astro/hoisted.D2uAbj8P.js", "/_astro/hoisted.D6fN33OZ.js", "/_astro/hoisted.e4Grq_nB.js", "/_astro/hoisted.xg5iX3wE.js", "/_worker.js/index.js", "/_worker.js/renderers.mjs", "/_worker.js/_@astrojs-ssr-adapter.mjs", "/_worker.js/_astro-internal_middleware.mjs", "/images/redazione/alessandro-de-simone.jpg", "/images/redazione/benedetta-mattei.png", "/images/redazione/claudio-cinus.jpg", "/images/redazione/cristina-tersigni.webp", "/images/redazione/don-marco-bove.jpg", "/images/redazione/enrica-riera.png", "/images/redazione/franco-manuzio.jpg", "/images/redazione/giovanni-grossi.png", "/images/redazione/giulia-galeotti.webp", "/images/redazione/laura-coccia.jpg", "/images/redazione/maria-teresa-mazzarotto.jpg", "/images/redazione/mariangela-bertolini.png", "/images/redazione/matteo-cinti.png", "/images/redazione/natalia-livi.jpg", "/images/redazione/nicla-bettazzi.jpg", "/images/redazione/nicole-schulthes.jpg", "/images/redazione/rita-massi.png", "/images/redazione/serena-sillitto.png", "/images/redazione/sergio-sciascia.jpg", "/images/redazione/silvia-camisasca.jpg", "/images/redazione/silvia-gusmani.jpg", "/_worker.js/chunks/AboutSidebar_BMo6rhTT.mjs", "/_worker.js/chunks/ArticleCard_Bxiwkm9m.mjs", "/_worker.js/chunks/astro-designed-error-pages_DfD573yd.mjs", "/_worker.js/chunks/astro_JL7pVawF.mjs", "/_worker.js/chunks/BaseLayout_DIxcXjbq.mjs", "/_worker.js/chunks/diari_DNXJk5VJ.mjs", "/_worker.js/chunks/directus_B0n0XETK.mjs", "/_worker.js/chunks/Footer_D9bdzLvP.mjs", "/_worker.js/chunks/index_B-gW6nkE.mjs", "/_worker.js/chunks/IssueCard_Db5MfroW.mjs", "/_worker.js/chunks/noop-middleware_Chs5f3j2.mjs", "/_worker.js/chunks/ViewTransitions_Dvx2U5F3.mjs", "/_worker.js/pages/404.astro.mjs", "/_worker.js/pages/archivio.astro.mjs", "/_worker.js/pages/autori.astro.mjs", "/_worker.js/pages/cerca.astro.mjs", "/_worker.js/pages/chi-siamo.astro.mjs", "/_worker.js/pages/index.astro.mjs", "/_worker.js/pages/sostienici.astro.mjs", "/_worker.js/pages/test-lista.astro.mjs", "/_worker.js/pages/test-minimal.astro.mjs", "/_worker.js/pages/test-no-articles.astro.mjs", "/_worker.js/pages/test-status.astro.mjs", "/_worker.js/pages/_diario_.astro.mjs", "/_worker.js/pages/_image.astro.mjs", "/_worker.js/_astro/index.Dnzyu-xS.css", "/_worker.js/_astro/index.DvHZiE6C.css", "/_worker.js/_astro/logo.Cb_mP9bA.svg", "/_worker.js/_astro/sostienici.DZRfRPtH.css", "/_worker.js/_astro/_diario_.DVQXp8w2.css", "/_worker.js/_astro/_issue_.Bkp5H6tf.css", "/_worker.js/_astro/_slug_.Bvtt_j-y.css", "/_worker.js/chunks/astro/env-setup_nxDOIah1.mjs", "/_worker.js/chunks/astro/server_CgTYz_Tl.mjs", "/_worker.js/pages/api/debug-blog.astro.mjs", "/_worker.js/pages/api/debug-ssr-minimal.astro.mjs", "/_worker.js/pages/api/revalidate.astro.mjs", "/_worker.js/pages/archivio/web-only.astro.mjs", "/_worker.js/pages/archivio/_issue_.astro.mjs", "/_worker.js/pages/autori/_slug_.astro.mjs", "/_worker.js/pages/blog/en.astro.mjs", "/_worker.js/pages/blog/_---slug_.astro.mjs", "/_worker.js/pages/categoria/_categoria_.astro.mjs", "/_worker.js/pages/debug/audit-editoriale.astro.mjs", "/_worker.js/pages/chi-siamo/collaboratori.astro.mjs", "/_worker.js/pages/chi-siamo/contatti.astro.mjs", "/_worker.js/pages/chi-siamo/hanno-scritto-per-noi.astro.mjs", "/_worker.js/pages/chi-siamo/la-redazione.astro.mjs", "/_worker.js/pages/chi-siamo/la-rivista.astro.mjs", "/_worker.js/pages/chi-siamo/redazione-storica.astro.mjs", "/_worker.js/pages/sezioni/dialogo-aperto.astro.mjs", "/_worker.js/pages/sezioni/diari.astro.mjs", "/404.html", "/archivio/web-only/index.html", "/archivio/index.html", "/autori/index.html", "/blog/en/index.html", "/cerca/index.html", "/chi-siamo/collaboratori/index.html", "/chi-siamo/contatti/index.html", "/chi-siamo/hanno-scritto-per-noi/index.html", "/chi-siamo/la-redazione/index.html", "/chi-siamo/la-rivista/index.html", "/chi-siamo/redazione-storica/index.html", "/chi-siamo/index.html", "/debug/audit-editoriale/index.html", "/sezioni/dialogo-aperto/index.html", "/sezioni/diari/index.html", "/sostienici/index.html", "/test-lista/index.html", "/test-minimal/index.html", "/test-no-articles/index.html", "/test-status/index.html", "/index.html"], "buildFormat": "directory", "checkOrigin": false, "serverIslandNameMap": [], "key": "EZXCZK495NihxiYQ0LhK706JXRuaWjkoHIUY6+9CNy0=", "experimentalEnvGetSecretEnabled": false });

// _worker.js/index.js
globalThis.process ??= {};
globalThis.process.env ??= {};
var _page0 = /* @__PURE__ */ __name(() => import("./pages/_image.astro.mjs"), "_page0");
var _page1 = /* @__PURE__ */ __name(() => import("./pages/404.astro.mjs"), "_page1");
var _page2 = /* @__PURE__ */ __name(() => import("./pages/api/debug-blog.astro.mjs"), "_page2");
var _page3 = /* @__PURE__ */ __name(() => import("./pages/api/debug-ssr-minimal.astro.mjs"), "_page3");
var _page4 = /* @__PURE__ */ __name(() => import("./pages/api/revalidate.astro.mjs"), "_page4");
var _page5 = /* @__PURE__ */ __name(() => import("./pages/archivio/web-only.astro.mjs"), "_page5");
var _page6 = /* @__PURE__ */ __name(() => import("./pages/archivio/_issue_.astro.mjs"), "_page6");
var _page7 = /* @__PURE__ */ __name(() => import("./pages/archivio.astro.mjs"), "_page7");
var _page8 = /* @__PURE__ */ __name(() => import("./pages/autori/_slug_.astro.mjs"), "_page8");
var _page9 = /* @__PURE__ */ __name(() => import("./pages/autori.astro.mjs"), "_page9");
var _page10 = /* @__PURE__ */ __name(() => import("./pages/blog/en.astro.mjs"), "_page10");
var _page11 = /* @__PURE__ */ __name(() => import("./pages/blog/_---slug_.astro.mjs"), "_page11");
var _page12 = /* @__PURE__ */ __name(() => import("./pages/categoria/_categoria_.astro.mjs"), "_page12");
var _page13 = /* @__PURE__ */ __name(() => import("./pages/cerca.astro.mjs"), "_page13");
var _page14 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/collaboratori.astro.mjs"), "_page14");
var _page15 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/contatti.astro.mjs"), "_page15");
var _page16 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/hanno-scritto-per-noi.astro.mjs"), "_page16");
var _page17 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/la-redazione.astro.mjs"), "_page17");
var _page18 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/la-rivista.astro.mjs"), "_page18");
var _page19 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/redazione-storica.astro.mjs"), "_page19");
var _page20 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo.astro.mjs"), "_page20");
var _page21 = /* @__PURE__ */ __name(() => import("./pages/debug/audit-editoriale.astro.mjs"), "_page21");
var _page22 = /* @__PURE__ */ __name(() => import("./pages/sezioni/dialogo-aperto.astro.mjs"), "_page22");
var _page23 = /* @__PURE__ */ __name(() => import("./pages/sezioni/diari.astro.mjs"), "_page23");
var _page24 = /* @__PURE__ */ __name(() => import("./pages/sostienici.astro.mjs"), "_page24");
var _page25 = /* @__PURE__ */ __name(() => import("./pages/test-lista.astro.mjs"), "_page25");
var _page26 = /* @__PURE__ */ __name(() => import("./pages/test-minimal.astro.mjs"), "_page26");
var _page27 = /* @__PURE__ */ __name(() => import("./pages/test-no-articles.astro.mjs"), "_page27");
var _page28 = /* @__PURE__ */ __name(() => import("./pages/test-status.astro.mjs"), "_page28");
var _page29 = /* @__PURE__ */ __name(() => import("./pages/_diario_.astro.mjs"), "_page29");
var _page30 = /* @__PURE__ */ __name(() => import("./pages/index.astro.mjs"), "_page30");
var pageMap = /* @__PURE__ */ new Map([
  ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
  ["src/pages/404.astro", _page1],
  ["src/pages/api/debug-blog.ts", _page2],
  ["src/pages/api/debug-ssr-minimal.ts", _page3],
  ["src/pages/api/revalidate.ts", _page4],
  ["src/pages/archivio/web-only.astro", _page5],
  ["src/pages/archivio/[issue].astro", _page6],
  ["src/pages/archivio/index.astro", _page7],
  ["src/pages/autori/[slug].astro", _page8],
  ["src/pages/autori/index.astro", _page9],
  ["src/pages/blog/en.astro", _page10],
  ["src/pages/blog/[...slug].astro", _page11],
  ["src/pages/categoria/[categoria].astro", _page12],
  ["src/pages/cerca.astro", _page13],
  ["src/pages/chi-siamo/collaboratori.astro", _page14],
  ["src/pages/chi-siamo/contatti.astro", _page15],
  ["src/pages/chi-siamo/hanno-scritto-per-noi.astro", _page16],
  ["src/pages/chi-siamo/la-redazione.astro", _page17],
  ["src/pages/chi-siamo/la-rivista.astro", _page18],
  ["src/pages/chi-siamo/redazione-storica.astro", _page19],
  ["src/pages/chi-siamo/index.astro", _page20],
  ["src/pages/debug/audit-editoriale.astro", _page21],
  ["src/pages/sezioni/dialogo-aperto.astro", _page22],
  ["src/pages/sezioni/diari.astro", _page23],
  ["src/pages/sostienici.astro", _page24],
  ["src/pages/test-lista.astro", _page25],
  ["src/pages/test-minimal.astro", _page26],
  ["src/pages/test-no-articles.astro", _page27],
  ["src/pages/test-status.astro", _page28],
  ["src/pages/[diario].astro", _page29],
  ["src/pages/index.astro", _page30]
]);
var serverIslandMap = /* @__PURE__ */ new Map();
var _manifest2 = Object.assign(manifest, {
  pageMap,
  serverIslandMap,
  renderers,
  middleware: () => import("./_astro-internal_middleware.mjs")
});
var _exports = createExports(_manifest2);
var __astrojsSsrVirtualEntry = _exports.default;
export {
  __astrojsSsrVirtualEntry as default,
  pageMap
};
//# sourceMappingURL=bundledWorker-0.8671367957763885.mjs.map
