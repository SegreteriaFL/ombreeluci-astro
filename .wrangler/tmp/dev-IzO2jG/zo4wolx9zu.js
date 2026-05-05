var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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

// .wrangler/tmp/bundle-zhChnV/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init2) {
  const request = new Request(input, init2);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
var init_strip_cf_connecting_ip_header = __esm({
  ".wrangler/tmp/bundle-zhChnV/strip-cf-connecting-ip-header.js"() {
    "use strict";
    __name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        return Reflect.apply(target, thisArg, [
          stripCfConnectingIPHeader.apply(null, argArray)
        ]);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// .wrangler/tmp/pages-JtB0w2/renderers.mjs
var renderers;
var init_renderers = __esm({
  ".wrangler/tmp/pages-JtB0w2/renderers.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    renderers = [];
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/astro/server_BT9XwReg.mjs
function normalizeLF(code) {
  return code.replace(/\r\n|\r(?!\n)|\n/g, "\n");
}
function codeFrame(src, loc) {
  if (!loc || loc.line === void 0 || loc.column === void 0) {
    return "";
  }
  const lines = normalizeLF(src).split("\n").map((ln) => ln.replace(/\t/g, "  "));
  const visibleLines = [];
  for (let n = -2; n <= 2; n++) {
    if (lines[loc.line + n])
      visibleLines.push(loc.line + n);
  }
  let gutterWidth = 0;
  for (const lineNo of visibleLines) {
    let w = `> ${lineNo}`;
    if (w.length > gutterWidth)
      gutterWidth = w.length;
  }
  let output = "";
  for (const lineNo of visibleLines) {
    const isFocusedLine = lineNo === loc.line - 1;
    output += isFocusedLine ? "> " : "  ";
    output += `${lineNo + 1} | ${lines[lineNo]}
`;
    if (isFocusedLine)
      output += `${Array.from({ length: gutterWidth }).join(" ")}  | ${Array.from({
        length: loc.column
      }).join(" ")}^
`;
  }
  return output;
}
function init(x, y) {
  let rgx = new RegExp(`\\x1b\\[${y}m`, "g");
  let open = `\x1B[${x}m`, close = `\x1B[${y}m`;
  return function(txt) {
    if (!$.enabled || txt == null)
      return txt;
    return open + (!!~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
  };
}
async function renderEndpoint(mod, context, ssr, logger) {
  const { request, url } = context;
  const method = request.method.toUpperCase();
  const handler = mod[method] ?? mod["ALL"];
  if (!ssr && ssr === false && method !== "GET") {
    logger.warn(
      "router",
      `${url.pathname} ${bold(
        method
      )} requests are not available for a static site. Update your config to \`output: 'server'\` or \`output: 'hybrid'\` to enable.`
    );
  }
  if (handler === void 0) {
    logger.warn(
      "router",
      `No API Route handler exists for the method "${method}" for the route "${url.pathname}".
Found handlers: ${Object.keys(mod).map((exp) => JSON.stringify(exp)).join(", ")}
` + ("all" in mod ? `One of the exported handlers is "all" (lowercase), did you mean to export 'ALL'?
` : "")
    );
    return new Response(null, { status: 404 });
  }
  if (typeof handler !== "function") {
    logger.error(
      "router",
      `The route "${url.pathname}" exports a value for the method "${method}", but it is of the type ${typeof handler} instead of a function.`
    );
    return new Response(null, { status: 500 });
  }
  let response = await handler.call(mod, context);
  if (!response || response instanceof Response === false) {
    throw new AstroError(EndpointDidNotReturnAResponse);
  }
  if (REROUTABLE_STATUS_CODES.includes(response.status)) {
    try {
      response.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
    } catch (err) {
      if (err.message?.includes("immutable")) {
        response = new Response(response.body, response);
        response.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
      } else {
        throw err;
      }
    }
  }
  return response;
}
function validateArgs(args) {
  if (args.length !== 3)
    return false;
  if (!args[0] || typeof args[0] !== "object")
    return false;
  return true;
}
function baseCreateComponent(cb, moduleId, propagation) {
  const name = moduleId?.split("/").pop()?.replace(".astro", "") ?? "";
  const fn = /* @__PURE__ */ __name((...args) => {
    if (!validateArgs(args)) {
      throw new AstroError({
        ...InvalidComponentArgs,
        message: InvalidComponentArgs.message(name)
      });
    }
    return cb(...args);
  }, "fn");
  Object.defineProperty(fn, "name", { value: name, writable: false });
  fn.isAstroComponentFactory = true;
  fn.moduleId = moduleId;
  fn.propagation = propagation;
  return fn;
}
function createComponentWithOptions(opts) {
  const cb = baseCreateComponent(opts.factory, opts.moduleId, opts.propagation);
  return cb;
}
function createComponent(arg1, moduleId, propagation) {
  if (typeof arg1 === "function") {
    return baseCreateComponent(arg1, moduleId, propagation);
  } else {
    return createComponentWithOptions(arg1);
  }
}
function createAstroGlobFn() {
  const globHandler = /* @__PURE__ */ __name((importMetaGlobResult) => {
    if (typeof importMetaGlobResult === "string") {
      throw new AstroError({
        ...AstroGlobUsedOutside,
        message: AstroGlobUsedOutside.message(JSON.stringify(importMetaGlobResult))
      });
    }
    let allEntries = [...Object.values(importMetaGlobResult)];
    if (allEntries.length === 0) {
      throw new AstroError({
        ...AstroGlobNoMatch,
        message: AstroGlobNoMatch.message(JSON.stringify(importMetaGlobResult))
      });
    }
    return Promise.all(allEntries.map((fn) => fn()));
  }, "globHandler");
  return globHandler;
}
function createAstro(site) {
  return {
    // TODO: this is no longer necessary for `Astro.site`
    // but it somehow allows working around caching issues in content collections for some tests
    site: new URL(site),
    generator: `Astro v${ASTRO_VERSION}`,
    glob: createAstroGlobFn()
  };
}
function isPromise(value) {
  return !!value && typeof value === "object" && "then" in value && typeof value.then === "function";
}
async function* streamAsyncIterator(stream) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
function isHTMLString(value) {
  return Object.prototype.toString.call(value) === "[object HTMLString]";
}
function markHTMLBytes(bytes) {
  return new HTMLBytes(bytes);
}
function hasGetReader(obj) {
  return typeof obj.getReader === "function";
}
async function* unescapeChunksAsync(iterable) {
  if (hasGetReader(iterable)) {
    for await (const chunk of streamAsyncIterator(iterable)) {
      yield unescapeHTML(chunk);
    }
  } else {
    for await (const chunk of iterable) {
      yield unescapeHTML(chunk);
    }
  }
}
function* unescapeChunks(iterable) {
  for (const chunk of iterable) {
    yield unescapeHTML(chunk);
  }
}
function unescapeHTML(str) {
  if (!!str && typeof str === "object") {
    if (str instanceof Uint8Array) {
      return markHTMLBytes(str);
    } else if (str instanceof Response && str.body) {
      const body = str.body;
      return unescapeChunksAsync(body);
    } else if (typeof str.then === "function") {
      return Promise.resolve(str).then((value) => {
        return unescapeHTML(value);
      });
    } else if (str[Symbol.for("astro:slot-string")]) {
      return str;
    } else if (Symbol.iterator in str) {
      return unescapeChunks(str);
    } else if (Symbol.asyncIterator in str || hasGetReader(str)) {
      return unescapeChunksAsync(str);
    }
  }
  return markHTMLString(str);
}
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode[AstroJSX];
}
function createRenderInstruction(instruction) {
  return Object.defineProperty(instruction, RenderInstructionSymbol, {
    value: true
  });
}
function isRenderInstruction(chunk) {
  return chunk && typeof chunk === "object" && chunk[RenderInstructionSymbol];
}
function r(e) {
  var t2, f, n = "";
  if ("string" == typeof e || "number" == typeof e)
    n += e;
  else if ("object" == typeof e)
    if (Array.isArray(e)) {
      var o = e.length;
      for (t2 = 0; t2 < o; t2++)
        e[t2] && (f = r(e[t2])) && (n && (n += " "), n += f);
    } else
      for (f in e)
        e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t2, f = 0, n = "", o = arguments.length; f < o; f++)
    (e = arguments[f]) && (t2 = r(e)) && (n && (n += " "), n += t2);
  return n;
}
function serializeArray(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = value.map((v) => {
    return convertToSerializedForm(v, metadata, parents);
  });
  parents.delete(value);
  return serialized;
}
function serializeObject(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v, metadata, parents)];
    })
  );
  parents.delete(value);
  return serialized;
}
function convertToSerializedForm(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [PROP_TYPE.Map, serializeArray(Array.from(value), metadata, parents)];
    }
    case "[object Set]": {
      return [PROP_TYPE.Set, serializeArray(Array.from(value), metadata, parents)];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, serializeArray(value, metadata, parents)];
    }
    case "[object Uint8Array]": {
      return [PROP_TYPE.Uint8Array, Array.from(value)];
    }
    case "[object Uint16Array]": {
      return [PROP_TYPE.Uint16Array, Array.from(value)];
    }
    case "[object Uint32Array]": {
      return [PROP_TYPE.Uint32Array, Array.from(value)];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value, metadata, parents)];
      }
      if (value === Infinity) {
        return [PROP_TYPE.Infinity, 1];
      }
      if (value === -Infinity) {
        return [PROP_TYPE.Infinity, -1];
      }
      if (value === void 0) {
        return [PROP_TYPE.Value];
      }
      return [PROP_TYPE.Value, value];
    }
  }
}
function serializeProps(props, metadata) {
  const serialized = JSON.stringify(serializeObject(props, metadata));
  return serialized;
}
function extractDirectives(inputProps, clientDirectives) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {},
    propsWithoutTransitionAttributes: {}
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") {
        extracted.isPage = true;
      }
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" }
        };
      }
      switch (key) {
        case "client:component-path": {
          extracted.hydration.componentUrl = value;
          break;
        }
        case "client:component-export": {
          extracted.hydration.componentExport.value = value;
          break;
        }
        case "client:component-hydration": {
          break;
        }
        case "client:display-name": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!clientDirectives.has(extracted.hydration.directive)) {
            const hydrationMethods = Array.from(clientDirectives.keys()).map((d) => `client:${d}`).join(", ");
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${hydrationMethods}`
            );
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new AstroError(MissingMediaQueryDirective);
          }
          break;
        }
      }
    } else {
      extracted.props[key] = value;
      if (!transitionDirectivesToCopyOnIsland.includes(key)) {
        extracted.propsWithoutTransitionAttributes[key] = value;
      }
    }
  }
  for (const sym of Object.getOwnPropertySymbols(inputProps)) {
    extracted.props[sym] = inputProps[sym];
    extracted.propsWithoutTransitionAttributes[sym] = inputProps[sym];
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value) {
    throw new AstroError({
      ...NoMatchingImport,
      message: NoMatchingImport.message(metadata.displayName)
    });
  }
  const island = {
    children: "",
    props: {
      // This is for HMR, probably can avoid it in prod
      uid: astroId
    }
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = escapeHTML(value);
    }
  }
  island.props["component-url"] = await result.resolve(decodeURI(componentUrl));
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(decodeURI(renderer.clientEntrypoint));
    island.props["props"] = escapeHTML(serializeProps(props, metadata));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  let beforeHydrationUrl = await result.resolve("astro:scripts/before-hydration.js");
  if (beforeHydrationUrl.length) {
    island.props["before-hydration-url"] = beforeHydrationUrl;
  }
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  transitionDirectivesToCopyOnIsland.forEach((name) => {
    if (typeof props[name] !== "undefined") {
      island.props[name] = props[name];
    }
  });
  return island;
}
function bitwise(str) {
  let hash = 0;
  if (str.length === 0)
    return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}
function isAstroComponentFactory(obj) {
  return obj == null ? false : obj.isAstroComponentFactory === true;
}
function isAPropagatingComponent(result, factory) {
  let hint = factory.propagation || "none";
  if (factory.moduleId && result.componentMetadata.has(factory.moduleId) && hint === "none") {
    hint = result.componentMetadata.get(factory.moduleId).propagation;
  }
  return hint === "in-tree" || hint === "self";
}
function isHeadAndContent(obj) {
  return typeof obj === "object" && obj !== null && !!obj[headAndContentSym];
}
function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return result._metadata.hasHydrationScript = true;
}
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(result, directive) {
  const clientDirectives = result.clientDirectives;
  const clientDirective = clientDirectives.get(directive);
  if (!clientDirective) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  return clientDirective;
}
function getPrescripts(result, type, directive) {
  switch (type) {
    case "both":
      return `${ISLAND_STYLES}<script>${getDirectiveScriptText(result, directive)};${astro_island_prebuilt_default}<\/script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(result, directive)}<\/script>`;
  }
  return "";
}
function defineScriptVars(vars) {
  let output = "";
  for (const [key, value] of Object.entries(vars)) {
    output += `const ${toIdent(key)} = ${JSON.stringify(value)?.replace(
      /<\/script>/g,
      "\\x3C/script>"
    )};
`;
  }
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
function addAttribute(value, key, shouldEscape = true) {
  if (value == null) {
    return "";
  }
  if (value === false) {
    if (htmlEnumAttributes.test(key) || svgEnumAttributes.test(key)) {
      return markHTMLString(` ${key}="false"`);
    }
    return "";
  }
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return "";
  }
  if (key === "class:list") {
    const listValue = toAttributeString(clsx(value), shouldEscape);
    if (listValue === "") {
      return "";
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString)) {
    if (Array.isArray(value) && value.length === 2) {
      return markHTMLString(
        ` ${key}="${toAttributeString(`${toStyleString(value[0])};${value[1]}`, shouldEscape)}"`
      );
    }
    if (typeof value === "object") {
      return markHTMLString(` ${key}="${toAttributeString(toStyleString(value), shouldEscape)}"`);
    }
  }
  if (key === "className") {
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
  }
  if (typeof value === "string" && value.includes("&") && isHttpUrl(value)) {
    return markHTMLString(` ${key}="${toAttributeString(value, false)}"`);
  }
  if (value === true && (key.startsWith("data-") || htmlBooleanAttributes.test(key))) {
    return markHTMLString(` ${key}`);
  } else {
    return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
  }
}
function internalSpreadAttributes(values, shouldEscape = true) {
  let output = "";
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, shouldEscape);
  }
  return markHTMLString(output);
}
function renderElement$1(name, { props: _props, children = "" }, shouldEscape = true) {
  const { lang: _, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
      delete props["is:global"];
      delete props["is:scoped"];
    }
    if (name === "script") {
      delete props.hoist;
      children = defineScriptVars(defineVars) + "\n" + children;
    }
  }
  if ((children == null || children == "") && voidElementNames.test(name)) {
    return `<${name}${internalSpreadAttributes(props, shouldEscape)}>`;
  }
  return `<${name}${internalSpreadAttributes(props, shouldEscape)}>${children}</${name}>`;
}
function renderToBufferDestination(bufferRenderFunction) {
  const renderer = new BufferedRenderer(bufferRenderFunction);
  return renderer;
}
function promiseWithResolvers() {
  let resolve, reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return {
    promise,
    resolve,
    reject
  };
}
function isHttpUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return VALID_PROTOCOLS.includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}
function renderAllHeadContent(result) {
  result._metadata.hasRenderedHead = true;
  const styles = Array.from(result.styles).filter(uniqueElements).map(
    (style) => style.props.rel === "stylesheet" ? renderElement$1("link", style) : renderElement$1("style", style)
  );
  result.styles.clear();
  const scripts = Array.from(result.scripts).filter(uniqueElements).map((script) => {
    return renderElement$1("script", script, false);
  });
  const links = Array.from(result.links).filter(uniqueElements).map((link) => renderElement$1("link", link, false));
  let content = styles.join("\n") + links.join("\n") + scripts.join("\n");
  if (result._metadata.extraHead.length > 0) {
    for (const part of result._metadata.extraHead) {
      content += part;
    }
  }
  return markHTMLString(content);
}
function renderHead() {
  return createRenderInstruction({ type: "head" });
}
function maybeRenderHead() {
  return createRenderInstruction({ type: "maybe-head" });
}
function isRenderTemplateResult(obj) {
  return typeof obj === "object" && obj !== null && !!obj[renderTemplateResultSym];
}
function renderTemplate(htmlParts, ...expressions) {
  return new RenderTemplateResult(htmlParts, expressions);
}
function isSlotString(str) {
  return !!str[slotString];
}
function renderSlot(result, slotted, fallback) {
  if (!slotted && fallback) {
    return renderSlot(result, fallback);
  }
  return {
    async render(destination) {
      await renderChild(destination, typeof slotted === "function" ? slotted(result) : slotted);
    }
  };
}
async function renderSlotToString(result, slotted, fallback) {
  let content = "";
  let instructions = null;
  const temporaryDestination = {
    write(chunk) {
      if (chunk instanceof SlotString) {
        content += chunk;
        if (chunk.instructions) {
          instructions ??= [];
          instructions.push(...chunk.instructions);
        }
      } else if (chunk instanceof Response)
        return;
      else if (typeof chunk === "object" && "type" in chunk && typeof chunk.type === "string") {
        if (instructions === null) {
          instructions = [];
        }
        instructions.push(chunk);
      } else {
        content += chunkToString(result, chunk);
      }
    }
  };
  const renderInstance = renderSlot(result, slotted, fallback);
  await renderInstance.render(temporaryDestination);
  return markHTMLString(new SlotString(content, instructions));
}
async function renderSlots(result, slots = {}) {
  let slotInstructions = null;
  let children = {};
  if (slots) {
    await Promise.all(
      Object.entries(slots).map(
        ([key, value]) => renderSlotToString(result, value).then((output) => {
          if (output.instructions) {
            if (slotInstructions === null) {
              slotInstructions = [];
            }
            slotInstructions.push(...output.instructions);
          }
          children[key] = output;
        })
      )
    );
  }
  return { slotInstructions, children };
}
function createSlotValueFromString(content) {
  return function() {
    return renderTemplate`${unescapeHTML(content)}`;
  };
}
function stringifyChunk(result, chunk) {
  if (isRenderInstruction(chunk)) {
    const instruction = chunk;
    switch (instruction.type) {
      case "directive": {
        const { hydration } = instruction;
        let needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
        let needsDirectiveScript = hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
        let prescriptType = needsHydrationScript ? "both" : needsDirectiveScript ? "directive" : null;
        if (prescriptType) {
          let prescripts = getPrescripts(result, prescriptType, hydration.directive);
          return markHTMLString(prescripts);
        } else {
          return "";
        }
      }
      case "head": {
        if (result._metadata.hasRenderedHead || result.partial) {
          return "";
        }
        return renderAllHeadContent(result);
      }
      case "maybe-head": {
        if (result._metadata.hasRenderedHead || result._metadata.headInTree || result.partial) {
          return "";
        }
        return renderAllHeadContent(result);
      }
      case "renderer-hydration-script": {
        const { rendererSpecificHydrationScripts } = result._metadata;
        const { rendererName } = instruction;
        if (!rendererSpecificHydrationScripts.has(rendererName)) {
          rendererSpecificHydrationScripts.add(rendererName);
          return instruction.render();
        }
        return "";
      }
      default: {
        throw new Error(`Unknown chunk type: ${chunk.type}`);
      }
    }
  } else if (chunk instanceof Response) {
    return "";
  } else if (isSlotString(chunk)) {
    let out = "";
    const c = chunk;
    if (c.instructions) {
      for (const instr of c.instructions) {
        out += stringifyChunk(result, instr);
      }
    }
    out += chunk.toString();
    return out;
  }
  return chunk.toString();
}
function chunkToString(result, chunk) {
  if (ArrayBuffer.isView(chunk)) {
    return decoder$1.decode(chunk);
  } else {
    return stringifyChunk(result, chunk);
  }
}
function chunkToByteArray(result, chunk) {
  if (ArrayBuffer.isView(chunk)) {
    return chunk;
  } else {
    const stringified = stringifyChunk(result, chunk);
    return encoder$1.encode(stringified.toString());
  }
}
function isRenderInstance(obj) {
  return !!obj && typeof obj === "object" && "render" in obj && typeof obj.render === "function";
}
async function renderChild(destination, child) {
  if (isPromise(child)) {
    child = await child;
  }
  if (child instanceof SlotString) {
    destination.write(child);
  } else if (isHTMLString(child)) {
    destination.write(child);
  } else if (Array.isArray(child)) {
    const childRenders = child.map((c) => {
      return renderToBufferDestination((bufferDestination) => {
        return renderChild(bufferDestination, c);
      });
    });
    for (const childRender of childRenders) {
      if (!childRender)
        continue;
      await childRender.renderToFinalDestination(destination);
    }
  } else if (typeof child === "function") {
    await renderChild(destination, child());
  } else if (typeof child === "string") {
    destination.write(markHTMLString(escapeHTML(child)));
  } else if (!child && child !== 0)
    ;
  else if (isRenderInstance(child)) {
    await child.render(destination);
  } else if (isRenderTemplateResult(child)) {
    await child.render(destination);
  } else if (isAstroComponentInstance(child)) {
    await child.render(destination);
  } else if (ArrayBuffer.isView(child)) {
    destination.write(child);
  } else if (typeof child === "object" && (Symbol.asyncIterator in child || Symbol.iterator in child)) {
    for await (const value of child) {
      await renderChild(destination, value);
    }
  } else {
    destination.write(child);
  }
}
function validateComponentProps(props, displayName) {
  if (props != null) {
    for (const prop of Object.keys(props)) {
      if (prop.startsWith("client:")) {
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`
        );
      }
    }
  }
}
function createAstroComponentInstance(result, displayName, factory, props, slots = {}) {
  validateComponentProps(props, displayName);
  const instance = new AstroComponentInstance(result, props, slots, factory);
  if (isAPropagatingComponent(result, factory)) {
    result._metadata.propagators.add(instance);
  }
  return instance;
}
function isAstroComponentInstance(obj) {
  return typeof obj === "object" && obj !== null && !!obj[astroComponentInstanceSym];
}
async function renderToString(result, componentFactory, props, children, isPage = false, route) {
  const templateResult = await callComponentAsTemplateResultOrResponse(
    result,
    componentFactory,
    props,
    children,
    route
  );
  if (templateResult instanceof Response)
    return templateResult;
  let str = "";
  let renderedFirstPageChunk = false;
  if (isPage) {
    await bufferHeadContent(result);
  }
  const destination = {
    write(chunk) {
      if (isPage && !renderedFirstPageChunk) {
        renderedFirstPageChunk = true;
        if (!result.partial && !DOCTYPE_EXP.test(String(chunk))) {
          const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
          str += doctype;
        }
      }
      if (chunk instanceof Response)
        return;
      str += chunkToString(result, chunk);
    }
  };
  await templateResult.render(destination);
  return str;
}
async function renderToReadableStream(result, componentFactory, props, children, isPage = false, route) {
  const templateResult = await callComponentAsTemplateResultOrResponse(
    result,
    componentFactory,
    props,
    children,
    route
  );
  if (templateResult instanceof Response)
    return templateResult;
  let renderedFirstPageChunk = false;
  if (isPage) {
    await bufferHeadContent(result);
  }
  return new ReadableStream({
    start(controller) {
      const destination = {
        write(chunk) {
          if (isPage && !renderedFirstPageChunk) {
            renderedFirstPageChunk = true;
            if (!result.partial && !DOCTYPE_EXP.test(String(chunk))) {
              const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
              controller.enqueue(encoder$1.encode(doctype));
            }
          }
          if (chunk instanceof Response) {
            throw new AstroError({
              ...ResponseSentError
            });
          }
          const bytes = chunkToByteArray(result, chunk);
          controller.enqueue(bytes);
        }
      };
      (async () => {
        try {
          await templateResult.render(destination);
          controller.close();
        } catch (e) {
          if (AstroError.is(e) && !e.loc) {
            e.setLocation({
              file: route?.component
            });
          }
          setTimeout(() => controller.error(e), 0);
        }
      })();
    },
    cancel() {
      result.cancelled = true;
    }
  });
}
async function callComponentAsTemplateResultOrResponse(result, componentFactory, props, children, route) {
  const factoryResult = await componentFactory(result, props, children);
  if (factoryResult instanceof Response) {
    return factoryResult;
  } else if (isHeadAndContent(factoryResult)) {
    if (!isRenderTemplateResult(factoryResult.content)) {
      throw new AstroError({
        ...OnlyResponseCanBeReturned,
        message: OnlyResponseCanBeReturned.message(
          route?.route,
          typeof factoryResult
        ),
        location: {
          file: route?.component
        }
      });
    }
    return factoryResult.content;
  } else if (!isRenderTemplateResult(factoryResult)) {
    throw new AstroError({
      ...OnlyResponseCanBeReturned,
      message: OnlyResponseCanBeReturned.message(route?.route, typeof factoryResult),
      location: {
        file: route?.component
      }
    });
  }
  return factoryResult;
}
async function bufferHeadContent(result) {
  const iterator = result._metadata.propagators.values();
  while (true) {
    const { value, done } = iterator.next();
    if (done) {
      break;
    }
    const returnValue = await value.init(result);
    if (isHeadAndContent(returnValue)) {
      result._metadata.extraHead.push(returnValue.head);
    }
  }
}
async function renderToAsyncIterable(result, componentFactory, props, children, isPage = false, route) {
  const templateResult = await callComponentAsTemplateResultOrResponse(
    result,
    componentFactory,
    props,
    children,
    route
  );
  if (templateResult instanceof Response)
    return templateResult;
  let renderedFirstPageChunk = false;
  if (isPage) {
    await bufferHeadContent(result);
  }
  let error2 = null;
  let next = null;
  const buffer = [];
  let renderingComplete = false;
  const iterator = {
    async next() {
      if (result.cancelled)
        return { done: true, value: void 0 };
      if (next !== null) {
        await next.promise;
      } else if (!renderingComplete && !buffer.length) {
        next = promiseWithResolvers();
        await next.promise;
      }
      if (!renderingComplete) {
        next = promiseWithResolvers();
      }
      if (error2) {
        throw error2;
      }
      let length = 0;
      for (let i = 0, len = buffer.length; i < len; i++) {
        length += buffer[i].length;
      }
      let mergedArray = new Uint8Array(length);
      let offset = 0;
      for (let i = 0, len = buffer.length; i < len; i++) {
        const item = buffer[i];
        mergedArray.set(item, offset);
        offset += item.length;
      }
      buffer.length = 0;
      const returnValue = {
        // The iterator is done when rendering has finished
        // and there are no more chunks to return.
        done: length === 0 && renderingComplete,
        value: mergedArray
      };
      return returnValue;
    },
    async return() {
      result.cancelled = true;
      return { done: true, value: void 0 };
    }
  };
  const destination = {
    write(chunk) {
      if (isPage && !renderedFirstPageChunk) {
        renderedFirstPageChunk = true;
        if (!result.partial && !DOCTYPE_EXP.test(String(chunk))) {
          const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
          buffer.push(encoder$1.encode(doctype));
        }
      }
      if (chunk instanceof Response) {
        throw new AstroError(ResponseSentError);
      }
      const bytes = chunkToByteArray(result, chunk);
      if (bytes.length > 0) {
        buffer.push(bytes);
        next?.resolve();
      } else if (buffer.length > 0) {
        next?.resolve();
      }
    }
  };
  const renderPromise = templateResult.render(destination);
  renderPromise.then(() => {
    renderingComplete = true;
    next?.resolve();
  }).catch((err) => {
    error2 = err;
    renderingComplete = true;
    next?.resolve();
  });
  return {
    [Symbol.asyncIterator]() {
      return iterator;
    }
  };
}
function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlotToString(result, slots?.default)}</${name}>`
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName)
    return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}
function encodeHexUpperCase(data) {
  let result = "";
  for (let i = 0; i < data.length; i++) {
    result += alphabetUpperCase[data[i] >> 4];
    result += alphabetUpperCase[data[i] & 15];
  }
  return result;
}
function decodeHex(data) {
  if (data.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }
  const result = new Uint8Array(data.length / 2);
  for (let i = 0; i < data.length; i += 2) {
    if (!(data[i] in decodeMap)) {
      throw new Error("Invalid character");
    }
    if (!(data[i + 1] in decodeMap)) {
      throw new Error("Invalid character");
    }
    result[i / 2] |= decodeMap[data[i]] << 4;
    result[i / 2] |= decodeMap[data[i + 1]];
  }
  return result;
}
function encodeBase64(bytes) {
  return encodeBase64_internal(bytes, base64Alphabet, EncodingPadding.Include);
}
function encodeBase64_internal(bytes, alphabet, padding) {
  let result = "";
  for (let i = 0; i < bytes.byteLength; i += 3) {
    let buffer = 0;
    let bufferBitSize = 0;
    for (let j = 0; j < 3 && i + j < bytes.byteLength; j++) {
      buffer = buffer << 8 | bytes[i + j];
      bufferBitSize += 8;
    }
    for (let j = 0; j < 4; j++) {
      if (bufferBitSize >= 6) {
        result += alphabet[buffer >> bufferBitSize - 6 & 63];
        bufferBitSize -= 6;
      } else if (bufferBitSize > 0) {
        result += alphabet[buffer << 6 - bufferBitSize & 63];
        bufferBitSize = 0;
      } else if (padding === EncodingPadding.Include) {
        result += "=";
      }
    }
  }
  return result;
}
function decodeBase64(encoded) {
  return decodeBase64_internal(encoded, base64DecodeMap, DecodingPadding.Required);
}
function decodeBase64_internal(encoded, decodeMap2, padding) {
  const result = new Uint8Array(Math.ceil(encoded.length / 4) * 3);
  let totalBytes = 0;
  for (let i = 0; i < encoded.length; i += 4) {
    let chunk = 0;
    let bitsRead = 0;
    for (let j = 0; j < 4; j++) {
      if (padding === DecodingPadding.Required && encoded[i + j] === "=") {
        continue;
      }
      if (padding === DecodingPadding.Ignore && (i + j >= encoded.length || encoded[i + j] === "=")) {
        continue;
      }
      if (j > 0 && encoded[i + j - 1] === "=") {
        throw new Error("Invalid padding");
      }
      if (!(encoded[i + j] in decodeMap2)) {
        throw new Error("Invalid character");
      }
      chunk |= decodeMap2[encoded[i + j]] << (3 - j) * 6;
      bitsRead += 6;
    }
    if (bitsRead < 24) {
      let unused;
      if (bitsRead === 12) {
        unused = chunk & 65535;
      } else if (bitsRead === 18) {
        unused = chunk & 255;
      } else {
        throw new Error("Invalid padding");
      }
      if (unused !== 0) {
        throw new Error("Invalid padding");
      }
    }
    const byteLength = Math.floor(bitsRead / 8);
    for (let i2 = 0; i2 < byteLength; i2++) {
      result[totalBytes] = chunk >> 16 - i2 * 8 & 255;
      totalBytes++;
    }
  }
  return result.slice(0, totalBytes);
}
async function decodeKey(encoded) {
  const bytes = decodeBase64(encoded);
  return crypto.subtle.importKey("raw", bytes, ALGORITHM, true, ["encrypt", "decrypt"]);
}
async function encryptString(key, raw) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH / 2));
  const data = encoder.encode(raw);
  const buffer = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv
    },
    key,
    data
  );
  return encodeHexUpperCase(iv) + encodeBase64(new Uint8Array(buffer));
}
async function decryptString(key, encoded) {
  const iv = decodeHex(encoded.slice(0, IV_LENGTH));
  const dataArray = decodeBase64(encoded.slice(IV_LENGTH));
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv
    },
    key,
    dataArray
  );
  const decryptedString = decoder.decode(decryptedBuffer);
  return decryptedString;
}
function containsServerDirective(props) {
  return "server:component-directive" in props;
}
function safeJsonStringify(obj) {
  return JSON.stringify(obj).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029").replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/\//g, "\\u002f");
}
function renderServerIsland(result, _displayName, props, slots) {
  return {
    async render(destination) {
      const componentPath = props["server:component-path"];
      const componentExport = props["server:component-export"];
      const componentId = result.serverIslandNameMap.get(componentPath);
      if (!componentId) {
        throw new Error(`Could not find server component name`);
      }
      for (const key2 of Object.keys(props)) {
        if (internalProps.has(key2)) {
          delete props[key2];
        }
      }
      destination.write("<!--[if astro]>server-island-start<![endif]-->");
      const renderedSlots = {};
      for (const name in slots) {
        if (name !== "fallback") {
          const content = await renderSlotToString(result, slots[name]);
          renderedSlots[name] = content.toString();
        } else {
          await renderChild(destination, slots.fallback(result));
        }
      }
      const key = await result.key;
      const propsEncrypted = await encryptString(key, JSON.stringify(props));
      const hostId = crypto.randomUUID();
      const slash2 = result.base.endsWith("/") ? "" : "/";
      const serverIslandUrl = `${result.base}${slash2}_server-islands/${componentId}${result.trailingSlash === "always" ? "/" : ""}`;
      destination.write(`<script async type="module" data-island-id="${hostId}">
let componentId = ${safeJsonStringify(componentId)};
let componentExport = ${safeJsonStringify(componentExport)};
let script = document.querySelector('script[data-island-id="${hostId}"]');
let data = {
	componentExport,
	encryptedProps: ${safeJsonStringify(propsEncrypted)},
	slots: ${safeJsonStringify(renderedSlots)},
};

let response = await fetch('${serverIslandUrl}', {
	method: 'POST',
	body: JSON.stringify(data),
});
if (script) {
	if(response.status === 200 && response.headers.get('content-type') === 'text/html') {
	let html = await response.text();

	// Swap!
	while(script.previousSibling &&
		script.previousSibling.nodeType !== 8 &&
		script.previousSibling.data !== '[if astro]>server-island-start<![endif]') {
		script.previousSibling.remove();
	}
	script.previousSibling?.remove();

	let frag = document.createRange().createContextualFragment(html);
	script.before(frag);
}
script.remove();
}
<\/script>`);
    }
  };
}
function guessRenderers(componentUrl) {
  const extname = componentUrl?.split(".").pop();
  switch (extname) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/solid-js", "@astrojs/vue (jsx)"];
    case void 0:
    default:
      return [
        "@astrojs/react",
        "@astrojs/preact",
        "@astrojs/solid-js",
        "@astrojs/vue",
        "@astrojs/svelte",
        "@astrojs/lit"
      ];
  }
}
function isFragmentComponent(Component) {
  return Component === Fragment;
}
function isHTMLComponent(Component) {
  return Component && Component["astro:html"] === true;
}
function removeStaticAstroSlot(html, supportsAstroStaticSlot = true) {
  const exp = supportsAstroStaticSlot ? ASTRO_STATIC_SLOT_EXP : ASTRO_SLOT_EXP;
  return html.replace(exp, "");
}
async function renderFrameworkComponent(result, displayName, Component, _props, slots = {}) {
  if (!Component && "client:only" in _props === false) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  const { renderers: renderers2, clientDirectives } = result;
  const metadata = {
    astroStaticSlot: true,
    displayName
  };
  const { hydration, isPage, props, propsWithoutTransitionAttributes } = extractDirectives(
    _props,
    clientDirectives
  );
  let html = "";
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  const validRenderers = renderers2.filter((r2) => r2.name !== "astro:jsx");
  const { children, slotInstructions } = await renderSlots(result, slots);
  let renderer;
  if (metadata.hydrate !== "only") {
    let isTagged = false;
    try {
      isTagged = Component && Component[Renderer];
    } catch {
    }
    if (isTagged) {
      const rendererName = Component[Renderer];
      renderer = renderers2.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error2;
      for (const r2 of renderers2) {
        try {
          if (await r2.ssr.check.call({ result }, Component, props, children)) {
            renderer = r2;
            break;
          }
        } catch (e) {
          error2 ??= e;
        }
      }
      if (!renderer && error2) {
        throw error2;
      }
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = await renderHTMLElement(
        result,
        Component,
        _props,
        slots
      );
      return {
        render(destination) {
          destination.write(output);
        }
      };
    }
  } else {
    if (metadata.hydrateArgs) {
      const rendererName = rendererAliases.has(metadata.hydrateArgs) ? rendererAliases.get(metadata.hydrateArgs) : metadata.hydrateArgs;
      if (clientOnlyValues.has(rendererName)) {
        renderer = renderers2.find(
          ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
        );
      }
    }
    if (!renderer && validRenderers.length === 1) {
      renderer = validRenderers[0];
    }
    if (!renderer) {
      const extname = metadata.componentUrl?.split(".").pop();
      renderer = renderers2.find(({ name }) => name === `@astrojs/${extname}` || name === extname);
    }
  }
  if (!renderer) {
    if (metadata.hydrate === "only") {
      const rendererName = rendererAliases.has(metadata.hydrateArgs) ? rendererAliases.get(metadata.hydrateArgs) : metadata.hydrateArgs;
      if (clientOnlyValues.has(rendererName)) {
        const plural = validRenderers.length > 1;
        throw new AstroError({
          ...NoMatchingRenderer,
          message: NoMatchingRenderer.message(
            metadata.displayName,
            metadata?.componentUrl?.split(".").pop(),
            plural,
            validRenderers.length
          ),
          hint: NoMatchingRenderer.hint(
            formatList(probableRendererNames.map((r2) => "`" + r2 + "`"))
          )
        });
      } else {
        throw new AstroError({
          ...NoClientOnlyHint,
          message: NoClientOnlyHint.message(metadata.displayName),
          hint: NoClientOnlyHint.hint(
            probableRendererNames.map((r2) => r2.replace("@astrojs/", "")).join("|")
          )
        });
      }
    } else if (typeof Component !== "string") {
      const matchingRenderers = validRenderers.filter(
        (r2) => probableRendererNames.includes(r2.name)
      );
      const plural = validRenderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new AstroError({
          ...NoMatchingRenderer,
          message: NoMatchingRenderer.message(
            metadata.displayName,
            metadata?.componentUrl?.split(".").pop(),
            plural,
            validRenderers.length
          ),
          hint: NoMatchingRenderer.hint(
            formatList(probableRendererNames.map((r2) => "`" + r2 + "`"))
          )
        });
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          propsWithoutTransitionAttributes,
          children,
          metadata
        ));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === "only") {
      const rendererName = rendererAliases.has(metadata.hydrateArgs) ? rendererAliases.get(metadata.hydrateArgs) : metadata.hydrateArgs;
      if (!clientOnlyValues.has(rendererName)) {
        console.warn(
          `The client:only directive for ${metadata.displayName} is not recognized. The renderer ${renderer.name} will be used. If you intended to use a different renderer, please provide a valid client:only directive.`
        );
      }
      html = await renderSlotToString(result, slots?.fallback);
    } else {
      performance.now();
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        propsWithoutTransitionAttributes,
        children,
        metadata
      ));
    }
  }
  if (renderer && !renderer.clientEntrypoint && renderer.name !== "@astrojs/lit" && metadata.hydrate) {
    throw new AstroError({
      ...NoClientEntrypoint,
      message: NoClientEntrypoint.message(
        displayName,
        metadata.hydrate,
        renderer.name
      )
    });
  }
  if (!html && typeof Component === "string") {
    const Tag = sanitizeElementName(Component);
    const childSlots = Object.values(children).join("");
    const renderTemplateResult = renderTemplate`<${Tag}${internalSpreadAttributes(
      props
    )}${markHTMLString(
      childSlots === "" && voidElementNames.test(Tag) ? `/>` : `>${childSlots}</${Tag}>`
    )}`;
    html = "";
    const destination = {
      write(chunk) {
        if (chunk instanceof Response)
          return;
        html += chunkToString(result, chunk);
      }
    };
    await renderTemplateResult.render(destination);
  }
  if (!hydration) {
    return {
      render(destination) {
        if (slotInstructions) {
          for (const instruction of slotInstructions) {
            destination.write(instruction);
          }
        }
        if (isPage || renderer?.name === "astro:jsx") {
          destination.write(html);
        } else if (html && html.length > 0) {
          destination.write(
            markHTMLString(removeStaticAstroSlot(html, renderer?.ssr?.supportsAstroStaticSlot))
          );
        }
      }
    };
  }
  const astroId = shorthash(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props,
      metadata
    )}`
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata
  );
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0) {
      for (const key of Object.keys(children)) {
        let tagName = renderer?.ssr?.supportsAstroStaticSlot ? !!metadata.hydrate ? "astro-slot" : "astro-static-slot" : "astro-slot";
        let expectedHTML = key === "default" ? `<${tagName}>` : `<${tagName} name="${key}">`;
        if (!html.includes(expectedHTML)) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children);
  }
  const template2 = unrenderedSlots.length > 0 ? unrenderedSlots.map(
    (key) => `<template data-astro-template${key !== "default" ? `="${key}"` : ""}>${children[key]}</template>`
  ).join("") : "";
  island.children = `${html ?? ""}${template2}`;
  if (island.children) {
    island.props["await-children"] = "";
    island.children += `<!--astro:end-->`;
  }
  return {
    render(destination) {
      if (slotInstructions) {
        for (const instruction of slotInstructions) {
          destination.write(instruction);
        }
      }
      destination.write(createRenderInstruction({ type: "directive", hydration }));
      if (hydration.directive !== "only" && renderer?.ssr.renderHydrationScript) {
        destination.write(
          createRenderInstruction({
            type: "renderer-hydration-script",
            rendererName: renderer.name,
            render: renderer.ssr.renderHydrationScript
          })
        );
      }
      const renderedElement = renderElement$1("astro-island", island, false);
      destination.write(markHTMLString(renderedElement));
    }
  };
}
function sanitizeElementName(tag) {
  const unsafe = /[&<>'"\s]+/;
  if (!unsafe.test(tag))
    return tag;
  return tag.trim().split(unsafe)[0].trim();
}
async function renderFragmentComponent(result, slots = {}) {
  const children = await renderSlotToString(result, slots?.default);
  return {
    render(destination) {
      if (children == null)
        return;
      destination.write(children);
    }
  };
}
async function renderHTMLComponent(result, Component, _props, slots = {}) {
  const { slotInstructions, children } = await renderSlots(result, slots);
  const html = Component({ slots: children });
  const hydrationHtml = slotInstructions ? slotInstructions.map((instr) => chunkToString(result, instr)).join("") : "";
  return {
    render(destination) {
      destination.write(markHTMLString(hydrationHtml + html));
    }
  };
}
function renderAstroComponent(result, displayName, Component, props, slots = {}) {
  if (containsServerDirective(props)) {
    return renderServerIsland(result, displayName, props, slots);
  }
  const instance = createAstroComponentInstance(result, displayName, Component, props, slots);
  return {
    async render(destination) {
      await instance.render(destination);
    }
  };
}
async function renderComponent(result, displayName, Component, props, slots = {}) {
  if (isPromise(Component)) {
    Component = await Component.catch(handleCancellation);
  }
  if (isFragmentComponent(Component)) {
    return await renderFragmentComponent(result, slots).catch(handleCancellation);
  }
  props = normalizeProps(props);
  if (isHTMLComponent(Component)) {
    return await renderHTMLComponent(result, Component, props, slots).catch(handleCancellation);
  }
  if (isAstroComponentFactory(Component)) {
    return renderAstroComponent(result, displayName, Component, props, slots);
  }
  return await renderFrameworkComponent(result, displayName, Component, props, slots).catch(
    handleCancellation
  );
  function handleCancellation(e) {
    if (result.cancelled)
      return {
        render() {
        }
      };
    throw e;
  }
  __name(handleCancellation, "handleCancellation");
}
function normalizeProps(props) {
  if (props["class:list"] !== void 0) {
    const value = props["class:list"];
    delete props["class:list"];
    props["class"] = clsx(props["class"], value);
    if (props["class"] === "") {
      delete props["class"];
    }
  }
  return props;
}
async function renderComponentToString(result, displayName, Component, props, slots = {}, isPage = false, route) {
  let str = "";
  let renderedFirstPageChunk = false;
  let head = "";
  if (isPage && !result.partial && nonAstroPageNeedsHeadInjection(Component)) {
    head += chunkToString(result, maybeRenderHead());
  }
  try {
    const destination = {
      write(chunk) {
        if (isPage && !result.partial && !renderedFirstPageChunk) {
          renderedFirstPageChunk = true;
          if (!/<!doctype html/i.test(String(chunk))) {
            const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
            str += doctype + head;
          }
        }
        if (chunk instanceof Response)
          return;
        str += chunkToString(result, chunk);
      }
    };
    const renderInstance = await renderComponent(result, displayName, Component, props, slots);
    await renderInstance.render(destination);
  } catch (e) {
    if (AstroError.is(e) && !e.loc) {
      e.setLocation({
        file: route?.component
      });
    }
    throw e;
  }
  return str;
}
function nonAstroPageNeedsHeadInjection(pageComponent) {
  return !!pageComponent?.[needsHeadRenderingSymbol];
}
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") {
        return "";
      }
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case typeof vnode === "function":
      return vnode;
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode):
      return markHTMLString(
        (await Promise.all(vnode.map((v) => renderJSX(result, v)))).join("")
      );
  }
  return renderJSXVNode(result, vnode);
}
async function renderJSXVNode(result, vnode) {
  if (isVNode(vnode)) {
    switch (true) {
      case !vnode.type: {
        throw new Error(`Unable to render ${result.pathname} because it contains an undefined Component!
Did you forget to import the component or is it possible there is a typo?`);
      }
      case vnode.type === Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case vnode.type.isAstroComponentFactory: {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        const str = await renderToString(result, vnode.type, props, slots);
        if (str instanceof Response) {
          throw str;
        }
        const html = markHTMLString(str);
        return html;
      }
      case (!vnode.type && vnode.type !== 0):
        return "";
      case (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder):
        return markHTMLString(await renderElement(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      let extractSlots2 = /* @__PURE__ */ __name(function(child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ("slot" in child.props) {
          _slots[child.props.slot] = [..._slots[child.props.slot] ?? [], child];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      }, "extractSlots2");
      if (typeof vnode.type === "function" && vnode.props["server:root"]) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (typeof vnode.type === "function") {
        if (vnode.props[hasTriedRenderComponentSymbol]) {
          delete vnode.props[hasTriedRenderComponentSymbol];
          const output2 = await vnode.type(vnode.props ?? {});
          if (output2?.[AstroJSX] || !output2) {
            return await renderJSXVNode(result, output2);
          } else {
            return;
          }
        } else {
          vnode.props[hasTriedRenderComponentSymbol] = true;
        }
      }
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = {
        default: []
      };
      extractSlots2(children);
      for (const [key, value] of Object.entries(props)) {
        if (value?.["$$slot"]) {
          _slots[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0)
              return;
            slots[key] = () => output2;
          })
        );
      }
      await Promise.all(slotPromises);
      let output;
      if (vnode.type === ClientOnlyPlaceholder && vnode.props["client:only"]) {
        output = await renderComponentToString(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots
        );
      } else {
        output = await renderComponentToString(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots
        );
      }
      return markHTMLString(output);
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children == null || children == "") && voidElementNames.test(tag) ? `/>` : `>${children == null ? "" : await renderJSX(result, prerenderElementChildren(tag, children))}</${tag}>`
    )}`
  );
}
function prerenderElementChildren(tag, children) {
  if (typeof children === "string" && (tag === "style" || tag === "script")) {
    return markHTMLString(children);
  } else {
    return children;
  }
}
async function renderPage(result, componentFactory, props, children, streaming, route) {
  if (!isAstroComponentFactory(componentFactory)) {
    result._metadata.headInTree = result.componentMetadata.get(componentFactory.moduleId)?.containsHead ?? false;
    const pageProps = { ...props ?? {}, "server:root": true };
    const str = await renderComponentToString(
      result,
      componentFactory.name,
      componentFactory,
      pageProps,
      {},
      true,
      route
    );
    const bytes = encoder$1.encode(str);
    return new Response(bytes, {
      headers: new Headers([
        ["Content-Type", "text/html; charset=utf-8"],
        ["Content-Length", bytes.byteLength.toString()]
      ])
    });
  }
  result._metadata.headInTree = result.componentMetadata.get(componentFactory.moduleId)?.containsHead ?? false;
  let body;
  if (streaming) {
    if (isNode && !isDeno) {
      const nodeBody = await renderToAsyncIterable(
        result,
        componentFactory,
        props,
        children,
        true,
        route
      );
      body = nodeBody;
    } else {
      body = await renderToReadableStream(result, componentFactory, props, children, true, route);
    }
  } else {
    body = await renderToString(result, componentFactory, props, children, true, route);
  }
  if (body instanceof Response)
    return body;
  const init2 = result.response;
  const headers = new Headers(init2.headers);
  if (!streaming && typeof body === "string") {
    body = encoder$1.encode(body);
    headers.set("Content-Length", body.byteLength.toString());
  }
  if (route?.component.endsWith(".md")) {
    headers.set("Content-Type", "text/html; charset=utf-8");
  }
  let status = init2.status;
  if (route?.route === "/404") {
    status = 404;
  } else if (route?.route === "/500") {
    status = 500;
  }
  if (status) {
    return new Response(body, { ...init2, headers, status });
  } else {
    return new Response(body, { ...init2, headers });
  }
}
function spreadAttributes(values = {}, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true);
  }
  return markHTMLString(output);
}
var ASTRO_VERSION, REROUTE_DIRECTIVE_HEADER, REWRITE_DIRECTIVE_HEADER_KEY, REWRITE_DIRECTIVE_HEADER_VALUE, NOOP_MIDDLEWARE_HEADER, ROUTE_TYPE_HEADER, DEFAULT_404_COMPONENT, REROUTABLE_STATUS_CODES, clientAddressSymbol, clientLocalsSymbol, originPathnameSymbol, responseSentSymbol, ClientAddressNotAvailable, PrerenderClientAddressNotAvailable, StaticClientAddressNotAvailable, NoMatchingStaticPathFound, OnlyResponseCanBeReturned, MissingMediaQueryDirective, NoMatchingRenderer, NoClientEntrypoint, NoClientOnlyHint, InvalidGetStaticPathsEntry, InvalidGetStaticPathsReturn, GetStaticPathsExpectedParams, GetStaticPathsInvalidRouteParam, GetStaticPathsRequired, ReservedSlotName, NoMatchingImport, InvalidComponentArgs, PageNumberParamNotFound, PrerenderDynamicEndpointPathCollide, ResponseSentError, MiddlewareNoDataOrNextCalled, MiddlewareNotAResponse, EndpointDidNotReturnAResponse, LocalsNotAnObject, AstroResponseHeadersReassigned, AstroGlobUsedOutside, AstroGlobNoMatch, i18nNoLocaleFoundInPath, RewriteWithBodyUsed, AstroError, FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM, isTTY, $, bold, dim, red, yellow, blue, replace, ca, esca, pe, escape, escapeHTML, HTMLBytes, HTMLString, markHTMLString, AstroJSX, RenderInstructionSymbol, PROP_TYPE, transitionDirectivesToCopyOnIsland, dictionary, binary, headAndContentSym, astro_island_prebuilt_default, ISLAND_STYLES, voidElementNames, htmlBooleanAttributes, htmlEnumAttributes, svgEnumAttributes, AMPERSAND_REGEX, DOUBLE_QUOTE_REGEX, STATIC_DIRECTIVES, toIdent, toAttributeString, kebab, toStyleString, noop, BufferedRenderer, isNode, isDeno, VALID_PROTOCOLS, uniqueElements, renderTemplateResultSym, RenderTemplateResult, slotString, SlotString, Fragment, Renderer, encoder$1, decoder$1, astroComponentInstanceSym, AstroComponentInstance, DOCTYPE_EXP, alphabetUpperCase, decodeMap, EncodingPadding$1, DecodingPadding$1, base64Alphabet, EncodingPadding, DecodingPadding, base64DecodeMap, ALGORITHM, encoder, decoder, IV_LENGTH, internalProps, needsHeadRenderingSymbol, rendererAliases, clientOnlyValues, ASTRO_SLOT_EXP, ASTRO_STATIC_SLOT_EXP, ClientOnlyPlaceholder, hasTriedRenderComponentSymbol;
var init_server_BT9XwReg = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/astro/server_BT9XwReg.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    ASTRO_VERSION = "4.16.19";
    REROUTE_DIRECTIVE_HEADER = "X-Astro-Reroute";
    REWRITE_DIRECTIVE_HEADER_KEY = "X-Astro-Rewrite";
    REWRITE_DIRECTIVE_HEADER_VALUE = "yes";
    NOOP_MIDDLEWARE_HEADER = "X-Astro-Noop";
    ROUTE_TYPE_HEADER = "X-Astro-Route-Type";
    DEFAULT_404_COMPONENT = "astro-default-404.astro";
    REROUTABLE_STATUS_CODES = [404, 500];
    clientAddressSymbol = Symbol.for("astro.clientAddress");
    clientLocalsSymbol = Symbol.for("astro.locals");
    originPathnameSymbol = Symbol.for("astro.originPathname");
    responseSentSymbol = Symbol.for("astro.responseSent");
    ClientAddressNotAvailable = {
      name: "ClientAddressNotAvailable",
      title: "`Astro.clientAddress` is not available in current adapter.",
      message: (adapterName) => `\`Astro.clientAddress\` is not available in the \`${adapterName}\` adapter. File an issue with the adapter to add support.`
    };
    PrerenderClientAddressNotAvailable = {
      name: "PrerenderClientAddressNotAvailable",
      title: "`Astro.clientAddress` cannot be used inside prerendered routes.",
      message: `\`Astro.clientAddress\` cannot be used inside prerendered routes`
    };
    StaticClientAddressNotAvailable = {
      name: "StaticClientAddressNotAvailable",
      title: "`Astro.clientAddress` is not available in static mode.",
      message: "`Astro.clientAddress` is only available when using `output: 'server'` or `output: 'hybrid'`. Update your Astro config if you need SSR features.",
      hint: "See https://docs.astro.build/en/guides/server-side-rendering/ for more information on how to enable SSR."
    };
    NoMatchingStaticPathFound = {
      name: "NoMatchingStaticPathFound",
      title: "No static path found for requested path.",
      message: (pathName) => `A \`getStaticPaths()\` route pattern was matched, but no matching static path was found for requested path \`${pathName}\`.`,
      hint: (possibleRoutes) => `Possible dynamic routes being matched: ${possibleRoutes.join(", ")}.`
    };
    OnlyResponseCanBeReturned = {
      name: "OnlyResponseCanBeReturned",
      title: "Invalid type returned by Astro page.",
      message: (route, returnedValue) => `Route \`${route ? route : ""}\` returned a \`${returnedValue}\`. Only a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) can be returned from Astro files.`,
      hint: "See https://docs.astro.build/en/guides/server-side-rendering/#response for more information."
    };
    MissingMediaQueryDirective = {
      name: "MissingMediaQueryDirective",
      title: "Missing value for `client:media` directive.",
      message: 'Media query not provided for `client:media` directive. A media query similar to `client:media="(max-width: 600px)"` must be provided'
    };
    NoMatchingRenderer = {
      name: "NoMatchingRenderer",
      title: "No matching renderer found.",
      message: (componentName, componentExtension, plural, validRenderersCount) => `Unable to render \`${componentName}\`.

${validRenderersCount > 0 ? `There ${plural ? "are" : "is"} ${validRenderersCount} renderer${plural ? "s" : ""} configured in your \`astro.config.mjs\` file,
but ${plural ? "none were" : "it was not"} able to server-side render \`${componentName}\`.` : `No valid renderer was found ${componentExtension ? `for the \`.${componentExtension}\` file extension.` : `for this file extension.`}`}`,
      hint: (probableRenderers) => `Did you mean to enable the ${probableRenderers} integration?

See https://docs.astro.build/en/guides/framework-components/ for more information on how to install and configure integrations.`
    };
    NoClientEntrypoint = {
      name: "NoClientEntrypoint",
      title: "No client entrypoint specified in renderer.",
      message: (componentName, clientDirective, rendererName) => `\`${componentName}\` component has a \`client:${clientDirective}\` directive, but no client entrypoint was provided by \`${rendererName}\`.`,
      hint: "See https://docs.astro.build/en/reference/integrations-reference/#addrenderer-option for more information on how to configure your renderer."
    };
    NoClientOnlyHint = {
      name: "NoClientOnlyHint",
      title: "Missing hint on client:only directive.",
      message: (componentName) => `Unable to render \`${componentName}\`. When using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.`,
      hint: (probableRenderers) => `Did you mean to pass \`client:only="${probableRenderers}"\`? See https://docs.astro.build/en/reference/directives-reference/#clientonly for more information on client:only`
    };
    InvalidGetStaticPathsEntry = {
      name: "InvalidGetStaticPathsEntry",
      title: "Invalid entry inside getStaticPath's return value",
      message: (entryType) => `Invalid entry returned by getStaticPaths. Expected an object, got \`${entryType}\``,
      hint: "If you're using a `.map` call, you might be looking for `.flatMap()` instead. See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
    };
    InvalidGetStaticPathsReturn = {
      name: "InvalidGetStaticPathsReturn",
      title: "Invalid value returned by getStaticPaths.",
      message: (returnType) => `Invalid type returned by \`getStaticPaths\`. Expected an \`array\`, got \`${returnType}\``,
      hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
    };
    GetStaticPathsExpectedParams = {
      name: "GetStaticPathsExpectedParams",
      title: "Missing params property on `getStaticPaths` route.",
      message: "Missing or empty required `params` property on `getStaticPaths` route.",
      hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
    };
    GetStaticPathsInvalidRouteParam = {
      name: "GetStaticPathsInvalidRouteParam",
      title: "Invalid value for `getStaticPaths` route parameter.",
      message: (key, value, valueType) => `Invalid getStaticPaths route parameter for \`${key}\`. Expected undefined, a string or a number, received \`${valueType}\` (\`${value}\`)`,
      hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
    };
    GetStaticPathsRequired = {
      name: "GetStaticPathsRequired",
      title: "`getStaticPaths()` function required for dynamic routes.",
      message: "`getStaticPaths()` function is required for dynamic routes. Make sure that you `export` a `getStaticPaths` function from your dynamic route.",
      hint: `See https://docs.astro.build/en/guides/routing/#dynamic-routes for more information on dynamic routes.

Alternatively, set \`output: "server"\` or \`output: "hybrid"\` in your Astro config file to switch to a non-static server build. This error can also occur if using \`export const prerender = true;\`.
See https://docs.astro.build/en/guides/server-side-rendering/ for more information on non-static rendering.`
    };
    ReservedSlotName = {
      name: "ReservedSlotName",
      title: "Invalid slot name.",
      message: (slotName) => `Unable to create a slot named \`${slotName}\`. \`${slotName}\` is a reserved slot name. Please update the name of this slot.`
    };
    NoMatchingImport = {
      name: "NoMatchingImport",
      title: "No import found for component.",
      message: (componentName) => `Could not render \`${componentName}\`. No matching import has been found for \`${componentName}\`.`,
      hint: "Please make sure the component is properly imported."
    };
    InvalidComponentArgs = {
      name: "InvalidComponentArgs",
      title: "Invalid component arguments.",
      message: (name) => `Invalid arguments passed to${name ? ` <${name}>` : ""} component.`,
      hint: "Astro components cannot be rendered directly via function call, such as `Component()` or `{items.map(Component)}`."
    };
    PageNumberParamNotFound = {
      name: "PageNumberParamNotFound",
      title: "Page number param not found.",
      message: (paramName) => `[paginate()] page number param \`${paramName}\` not found in your filepath.`,
      hint: "Rename your file to `[page].astro` or `[...page].astro`."
    };
    PrerenderDynamicEndpointPathCollide = {
      name: "PrerenderDynamicEndpointPathCollide",
      title: "Prerendered dynamic endpoint has path collision.",
      message: (pathname) => `Could not render \`${pathname}\` with an \`undefined\` param as the generated path will collide during prerendering. Prevent passing \`undefined\` as \`params\` for the endpoint's \`getStaticPaths()\` function, or add an additional extension to the endpoint's filename.`,
      hint: (filename) => `Rename \`${filename}\` to \`${filename.replace(/\.(?:js|ts)/, (m) => `.json` + m)}\``
    };
    ResponseSentError = {
      name: "ResponseSentError",
      title: "Unable to set response.",
      message: "The response has already been sent to the browser and cannot be altered."
    };
    MiddlewareNoDataOrNextCalled = {
      name: "MiddlewareNoDataOrNextCalled",
      title: "The middleware didn't return a `Response`.",
      message: "Make sure your middleware returns a `Response` object, either directly or by returning the `Response` from calling the `next` function."
    };
    MiddlewareNotAResponse = {
      name: "MiddlewareNotAResponse",
      title: "The middleware returned something that is not a `Response` object.",
      message: "Any data returned from middleware must be a valid `Response` object."
    };
    EndpointDidNotReturnAResponse = {
      name: "EndpointDidNotReturnAResponse",
      title: "The endpoint did not return a `Response`.",
      message: "An endpoint must return either a `Response`, or a `Promise` that resolves with a `Response`."
    };
    LocalsNotAnObject = {
      name: "LocalsNotAnObject",
      title: "Value assigned to `locals` is not accepted.",
      message: "`locals` can only be assigned to an object. Other values like numbers, strings, etc. are not accepted.",
      hint: "If you tried to remove some information from the `locals` object, try to use `delete` or set the property to `undefined`."
    };
    AstroResponseHeadersReassigned = {
      name: "AstroResponseHeadersReassigned",
      title: "`Astro.response.headers` must not be reassigned.",
      message: "Individual headers can be added to and removed from `Astro.response.headers`, but it must not be replaced with another instance of `Headers` altogether.",
      hint: "Consider using `Astro.response.headers.add()`, and `Astro.response.headers.delete()`."
    };
    AstroGlobUsedOutside = {
      name: "AstroGlobUsedOutside",
      title: "Astro.glob() used outside of an Astro file.",
      message: (globStr) => `\`Astro.glob(${globStr})\` can only be used in \`.astro\` files. \`import.meta.glob(${globStr})\` can be used instead to achieve a similar result.`,
      hint: "See Vite's documentation on `import.meta.glob` for more information: https://vite.dev/guide/features.html#glob-import"
    };
    AstroGlobNoMatch = {
      name: "AstroGlobNoMatch",
      title: "Astro.glob() did not match any files.",
      message: (globStr) => `\`Astro.glob(${globStr})\` did not return any matching files.`,
      hint: "Check the pattern for typos."
    };
    i18nNoLocaleFoundInPath = {
      name: "i18nNoLocaleFoundInPath",
      title: "The path doesn't contain any locale",
      message: "You tried to use an i18n utility on a path that doesn't contain any locale. You can use `pathHasLocale` first to determine if the path has a locale."
    };
    RewriteWithBodyUsed = {
      name: "RewriteWithBodyUsed",
      title: "Cannot use Astro.rewrite after the request body has been read",
      message: "Astro.rewrite() cannot be used if the request body has already been read. If you need to read the body, first clone the request."
    };
    __name(normalizeLF, "normalizeLF");
    __name(codeFrame, "codeFrame");
    AstroError = class extends Error {
      loc;
      title;
      hint;
      frame;
      type = "AstroError";
      constructor(props, options) {
        const { name, title, message, stack, location, hint, frame } = props;
        super(message, options);
        this.title = title;
        this.name = name;
        if (message)
          this.message = message;
        this.stack = stack ? stack : this.stack;
        this.loc = location;
        this.hint = hint;
        this.frame = frame;
      }
      setLocation(location) {
        this.loc = location;
      }
      setName(name) {
        this.name = name;
      }
      setMessage(message) {
        this.message = message;
      }
      setHint(hint) {
        this.hint = hint;
      }
      setFrame(source, location) {
        this.frame = codeFrame(source, location);
      }
      static is(err) {
        return err.type === "AstroError";
      }
    };
    __name(AstroError, "AstroError");
    isTTY = true;
    if (typeof process !== "undefined") {
      ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
      isTTY = process.stdout && process.stdout.isTTY;
    }
    $ = {
      enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY)
    };
    __name(init, "init");
    bold = init(1, 22);
    dim = init(2, 22);
    red = init(31, 39);
    yellow = init(33, 39);
    blue = init(34, 39);
    __name(renderEndpoint, "renderEndpoint");
    __name(validateArgs, "validateArgs");
    __name(baseCreateComponent, "baseCreateComponent");
    __name(createComponentWithOptions, "createComponentWithOptions");
    __name(createComponent, "createComponent");
    __name(createAstroGlobFn, "createAstroGlobFn");
    __name(createAstro, "createAstro");
    ({ replace } = "");
    ca = /[&<>'"]/g;
    esca = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    };
    pe = /* @__PURE__ */ __name((m) => esca[m], "pe");
    escape = /* @__PURE__ */ __name((es) => replace.call(es, ca, pe), "escape");
    __name(isPromise, "isPromise");
    __name(streamAsyncIterator, "streamAsyncIterator");
    escapeHTML = escape;
    HTMLBytes = class extends Uint8Array {
    };
    __name(HTMLBytes, "HTMLBytes");
    Object.defineProperty(HTMLBytes.prototype, Symbol.toStringTag, {
      get() {
        return "HTMLBytes";
      }
    });
    HTMLString = class extends String {
      get [Symbol.toStringTag]() {
        return "HTMLString";
      }
    };
    __name(HTMLString, "HTMLString");
    markHTMLString = /* @__PURE__ */ __name((value) => {
      if (value instanceof HTMLString) {
        return value;
      }
      if (typeof value === "string") {
        return new HTMLString(value);
      }
      return value;
    }, "markHTMLString");
    __name(isHTMLString, "isHTMLString");
    __name(markHTMLBytes, "markHTMLBytes");
    __name(hasGetReader, "hasGetReader");
    __name(unescapeChunksAsync, "unescapeChunksAsync");
    __name(unescapeChunks, "unescapeChunks");
    __name(unescapeHTML, "unescapeHTML");
    AstroJSX = "astro:jsx";
    __name(isVNode, "isVNode");
    RenderInstructionSymbol = Symbol.for("astro:render");
    __name(createRenderInstruction, "createRenderInstruction");
    __name(isRenderInstruction, "isRenderInstruction");
    __name(r, "r");
    __name(clsx, "clsx");
    PROP_TYPE = {
      Value: 0,
      JSON: 1,
      // Actually means Array
      RegExp: 2,
      Date: 3,
      Map: 4,
      Set: 5,
      BigInt: 6,
      URL: 7,
      Uint8Array: 8,
      Uint16Array: 9,
      Uint32Array: 10,
      Infinity: 11
    };
    __name(serializeArray, "serializeArray");
    __name(serializeObject, "serializeObject");
    __name(convertToSerializedForm, "convertToSerializedForm");
    __name(serializeProps, "serializeProps");
    transitionDirectivesToCopyOnIsland = Object.freeze([
      "data-astro-transition-scope",
      "data-astro-transition-persist",
      "data-astro-transition-persist-props"
    ]);
    __name(extractDirectives, "extractDirectives");
    __name(generateHydrateScript, "generateHydrateScript");
    dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
    binary = dictionary.length;
    __name(bitwise, "bitwise");
    __name(shorthash, "shorthash");
    __name(isAstroComponentFactory, "isAstroComponentFactory");
    __name(isAPropagatingComponent, "isAPropagatingComponent");
    headAndContentSym = Symbol.for("astro.headAndContent");
    __name(isHeadAndContent, "isHeadAndContent");
    astro_island_prebuilt_default = `(()=>{var A=Object.defineProperty;var g=(i,o,a)=>o in i?A(i,o,{enumerable:!0,configurable:!0,writable:!0,value:a}):i[o]=a;var d=(i,o,a)=>g(i,typeof o!="symbol"?o+"":o,a);{let i={0:t=>m(t),1:t=>a(t),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(a(t)),5:t=>new Set(a(t)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(t),9:t=>new Uint16Array(t),10:t=>new Uint32Array(t),11:t=>1/0*t},o=t=>{let[l,e]=t;return l in i?i[l](e):void 0},a=t=>t.map(o),m=t=>typeof t!="object"||t===null?t:Object.fromEntries(Object.entries(t).map(([l,e])=>[l,o(e)]));class y extends HTMLElement{constructor(){super(...arguments);d(this,"Component");d(this,"hydrator");d(this,"hydrate",async()=>{var b;if(!this.hydrator||!this.isConnected)return;let e=(b=this.parentElement)==null?void 0:b.closest("astro-island[ssr]");if(e){e.addEventListener("astro:hydrate",this.hydrate,{once:!0});return}let c=this.querySelectorAll("astro-slot"),n={},h=this.querySelectorAll("template[data-astro-template]");for(let r of h){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n[r.getAttribute("data-astro-template")||"default"]=r.innerHTML,r.remove())}for(let r of c){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n[r.getAttribute("name")||"default"]=r.innerHTML)}let p;try{p=this.hasAttribute("props")?m(JSON.parse(this.getAttribute("props"))):{}}catch(r){let s=this.getAttribute("component-url")||"<unknown>",v=this.getAttribute("component-export");throw v&&(s+=\` (export \${v})\`),console.error(\`[hydrate] Error parsing props for component \${s}\`,this.getAttribute("props"),r),r}let u;await this.hydrator(this)(this.Component,p,n,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),this.dispatchEvent(new CustomEvent("astro:hydrate"))});d(this,"unmount",()=>{this.isConnected||this.dispatchEvent(new CustomEvent("astro:unmount"))})}disconnectedCallback(){document.removeEventListener("astro:after-swap",this.unmount),document.addEventListener("astro:after-swap",this.unmount,{once:!0})}connectedCallback(){if(!this.hasAttribute("await-children")||document.readyState==="interactive"||document.readyState==="complete")this.childrenConnectedCallback();else{let e=()=>{document.removeEventListener("DOMContentLoaded",e),c.disconnect(),this.childrenConnectedCallback()},c=new MutationObserver(()=>{var n;((n=this.lastChild)==null?void 0:n.nodeType)===Node.COMMENT_NODE&&this.lastChild.nodeValue==="astro:end"&&(this.lastChild.remove(),e())});c.observe(this,{childList:!0}),document.addEventListener("DOMContentLoaded",e)}}async childrenConnectedCallback(){let e=this.getAttribute("before-hydration-url");e&&await import(e),this.start()}async start(){let e=JSON.parse(this.getAttribute("opts")),c=this.getAttribute("client");if(Astro[c]===void 0){window.addEventListener(\`astro:\${c}\`,()=>this.start(),{once:!0});return}try{await Astro[c](async()=>{let n=this.getAttribute("renderer-url"),[h,{default:p}]=await Promise.all([import(this.getAttribute("component-url")),n?import(n):()=>()=>{}]),u=this.getAttribute("component-export")||"default";if(!u.includes("."))this.Component=h[u];else{this.Component=h;for(let f of u.split("."))this.Component=this.Component[f]}return this.hydrator=p,this.hydrate},e,this)}catch(n){console.error(\`[astro-island] Error hydrating \${this.getAttribute("component-url")}\`,n)}}attributeChangedCallback(){this.hydrate()}}d(y,"observedAttributes",["props"]),customElements.get("astro-island")||customElements.define("astro-island",y)}})();`;
    ISLAND_STYLES = `<style>astro-island,astro-slot,astro-static-slot{display:contents}</style>`;
    __name(determineIfNeedsHydrationScript, "determineIfNeedsHydrationScript");
    __name(determinesIfNeedsDirectiveScript, "determinesIfNeedsDirectiveScript");
    __name(getDirectiveScriptText, "getDirectiveScriptText");
    __name(getPrescripts, "getPrescripts");
    voidElementNames = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
    htmlBooleanAttributes = /^(?:allowfullscreen|async|autofocus|autoplay|checked|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|selected|itemscope)$/i;
    htmlEnumAttributes = /^(?:contenteditable|draggable|spellcheck|value)$/i;
    svgEnumAttributes = /^(?:autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i;
    AMPERSAND_REGEX = /&/g;
    DOUBLE_QUOTE_REGEX = /"/g;
    STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
    toIdent = /* @__PURE__ */ __name((k) => k.trim().replace(/(?!^)\b\w|\s+|\W+/g, (match, index) => {
      if (/\W/.test(match))
        return "";
      return index === 0 ? match : match.toUpperCase();
    }), "toIdent");
    toAttributeString = /* @__PURE__ */ __name((value, shouldEscape = true) => shouldEscape ? String(value).replace(AMPERSAND_REGEX, "&#38;").replace(DOUBLE_QUOTE_REGEX, "&#34;") : value, "toAttributeString");
    kebab = /* @__PURE__ */ __name((k) => k.toLowerCase() === k ? k : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`), "kebab");
    toStyleString = /* @__PURE__ */ __name((obj) => Object.entries(obj).filter(([_, v]) => typeof v === "string" && v.trim() || typeof v === "number").map(([k, v]) => {
      if (k[0] !== "-" && k[1] !== "-")
        return `${kebab(k)}:${v}`;
      return `${k}:${v}`;
    }).join(";"), "toStyleString");
    __name(defineScriptVars, "defineScriptVars");
    __name(formatList, "formatList");
    __name(addAttribute, "addAttribute");
    __name(internalSpreadAttributes, "internalSpreadAttributes");
    __name(renderElement$1, "renderElement$1");
    noop = /* @__PURE__ */ __name(() => {
    }, "noop");
    BufferedRenderer = class {
      chunks = [];
      renderPromise;
      destination;
      constructor(bufferRenderFunction) {
        this.renderPromise = bufferRenderFunction(this);
        Promise.resolve(this.renderPromise).catch(noop);
      }
      write(chunk) {
        if (this.destination) {
          this.destination.write(chunk);
        } else {
          this.chunks.push(chunk);
        }
      }
      async renderToFinalDestination(destination) {
        for (const chunk of this.chunks) {
          destination.write(chunk);
        }
        this.destination = destination;
        await this.renderPromise;
      }
    };
    __name(BufferedRenderer, "BufferedRenderer");
    __name(renderToBufferDestination, "renderToBufferDestination");
    isNode = typeof process !== "undefined" && Object.prototype.toString.call(process) === "[object process]";
    isDeno = typeof Deno !== "undefined";
    __name(promiseWithResolvers, "promiseWithResolvers");
    VALID_PROTOCOLS = ["http:", "https:"];
    __name(isHttpUrl, "isHttpUrl");
    uniqueElements = /* @__PURE__ */ __name((item, index, all) => {
      const props = JSON.stringify(item.props);
      const children = item.children;
      return index === all.findIndex((i) => JSON.stringify(i.props) === props && i.children == children);
    }, "uniqueElements");
    __name(renderAllHeadContent, "renderAllHeadContent");
    __name(renderHead, "renderHead");
    __name(maybeRenderHead, "maybeRenderHead");
    renderTemplateResultSym = Symbol.for("astro.renderTemplateResult");
    RenderTemplateResult = class {
      [renderTemplateResultSym] = true;
      htmlParts;
      expressions;
      error;
      constructor(htmlParts, expressions) {
        this.htmlParts = htmlParts;
        this.error = void 0;
        this.expressions = expressions.map((expression) => {
          if (isPromise(expression)) {
            return Promise.resolve(expression).catch((err) => {
              if (!this.error) {
                this.error = err;
                throw err;
              }
            });
          }
          return expression;
        });
      }
      async render(destination) {
        const expRenders = this.expressions.map((exp) => {
          return renderToBufferDestination((bufferDestination) => {
            if (exp || exp === 0) {
              return renderChild(bufferDestination, exp);
            }
          });
        });
        for (let i = 0; i < this.htmlParts.length; i++) {
          const html = this.htmlParts[i];
          const expRender = expRenders[i];
          destination.write(markHTMLString(html));
          if (expRender) {
            await expRender.renderToFinalDestination(destination);
          }
        }
      }
    };
    __name(RenderTemplateResult, "RenderTemplateResult");
    __name(isRenderTemplateResult, "isRenderTemplateResult");
    __name(renderTemplate, "renderTemplate");
    slotString = Symbol.for("astro:slot-string");
    SlotString = class extends HTMLString {
      instructions;
      [slotString];
      constructor(content, instructions) {
        super(content);
        this.instructions = instructions;
        this[slotString] = true;
      }
    };
    __name(SlotString, "SlotString");
    __name(isSlotString, "isSlotString");
    __name(renderSlot, "renderSlot");
    __name(renderSlotToString, "renderSlotToString");
    __name(renderSlots, "renderSlots");
    __name(createSlotValueFromString, "createSlotValueFromString");
    Fragment = Symbol.for("astro:fragment");
    Renderer = Symbol.for("astro:renderer");
    encoder$1 = new TextEncoder();
    decoder$1 = new TextDecoder();
    __name(stringifyChunk, "stringifyChunk");
    __name(chunkToString, "chunkToString");
    __name(chunkToByteArray, "chunkToByteArray");
    __name(isRenderInstance, "isRenderInstance");
    __name(renderChild, "renderChild");
    astroComponentInstanceSym = Symbol.for("astro.componentInstance");
    AstroComponentInstance = class {
      [astroComponentInstanceSym] = true;
      result;
      props;
      slotValues;
      factory;
      returnValue;
      constructor(result, props, slots, factory) {
        this.result = result;
        this.props = props;
        this.factory = factory;
        this.slotValues = {};
        for (const name in slots) {
          let didRender = false;
          let value = slots[name](result);
          this.slotValues[name] = () => {
            if (!didRender) {
              didRender = true;
              return value;
            }
            return slots[name](result);
          };
        }
      }
      async init(result) {
        if (this.returnValue !== void 0)
          return this.returnValue;
        this.returnValue = this.factory(result, this.props, this.slotValues);
        if (isPromise(this.returnValue)) {
          this.returnValue.then((resolved) => {
            this.returnValue = resolved;
          }).catch(() => {
          });
        }
        return this.returnValue;
      }
      async render(destination) {
        const returnValue = await this.init(this.result);
        if (isHeadAndContent(returnValue)) {
          await returnValue.content.render(destination);
        } else {
          await renderChild(destination, returnValue);
        }
      }
    };
    __name(AstroComponentInstance, "AstroComponentInstance");
    __name(validateComponentProps, "validateComponentProps");
    __name(createAstroComponentInstance, "createAstroComponentInstance");
    __name(isAstroComponentInstance, "isAstroComponentInstance");
    DOCTYPE_EXP = /<!doctype html/i;
    __name(renderToString, "renderToString");
    __name(renderToReadableStream, "renderToReadableStream");
    __name(callComponentAsTemplateResultOrResponse, "callComponentAsTemplateResultOrResponse");
    __name(bufferHeadContent, "bufferHeadContent");
    __name(renderToAsyncIterable, "renderToAsyncIterable");
    __name(componentIsHTMLElement, "componentIsHTMLElement");
    __name(renderHTMLElement, "renderHTMLElement");
    __name(getHTMLElementName, "getHTMLElementName");
    __name(encodeHexUpperCase, "encodeHexUpperCase");
    __name(decodeHex, "decodeHex");
    alphabetUpperCase = "0123456789ABCDEF";
    decodeMap = {
      "0": 0,
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6,
      "7": 7,
      "8": 8,
      "9": 9,
      a: 10,
      A: 10,
      b: 11,
      B: 11,
      c: 12,
      C: 12,
      d: 13,
      D: 13,
      e: 14,
      E: 14,
      f: 15,
      F: 15
    };
    (function(EncodingPadding2) {
      EncodingPadding2[EncodingPadding2["Include"] = 0] = "Include";
      EncodingPadding2[EncodingPadding2["None"] = 1] = "None";
    })(EncodingPadding$1 || (EncodingPadding$1 = {}));
    (function(DecodingPadding2) {
      DecodingPadding2[DecodingPadding2["Required"] = 0] = "Required";
      DecodingPadding2[DecodingPadding2["Ignore"] = 1] = "Ignore";
    })(DecodingPadding$1 || (DecodingPadding$1 = {}));
    __name(encodeBase64, "encodeBase64");
    __name(encodeBase64_internal, "encodeBase64_internal");
    base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    __name(decodeBase64, "decodeBase64");
    __name(decodeBase64_internal, "decodeBase64_internal");
    (function(EncodingPadding2) {
      EncodingPadding2[EncodingPadding2["Include"] = 0] = "Include";
      EncodingPadding2[EncodingPadding2["None"] = 1] = "None";
    })(EncodingPadding || (EncodingPadding = {}));
    (function(DecodingPadding2) {
      DecodingPadding2[DecodingPadding2["Required"] = 0] = "Required";
      DecodingPadding2[DecodingPadding2["Ignore"] = 1] = "Ignore";
    })(DecodingPadding || (DecodingPadding = {}));
    base64DecodeMap = {
      "0": 52,
      "1": 53,
      "2": 54,
      "3": 55,
      "4": 56,
      "5": 57,
      "6": 58,
      "7": 59,
      "8": 60,
      "9": 61,
      A: 0,
      B: 1,
      C: 2,
      D: 3,
      E: 4,
      F: 5,
      G: 6,
      H: 7,
      I: 8,
      J: 9,
      K: 10,
      L: 11,
      M: 12,
      N: 13,
      O: 14,
      P: 15,
      Q: 16,
      R: 17,
      S: 18,
      T: 19,
      U: 20,
      V: 21,
      W: 22,
      X: 23,
      Y: 24,
      Z: 25,
      a: 26,
      b: 27,
      c: 28,
      d: 29,
      e: 30,
      f: 31,
      g: 32,
      h: 33,
      i: 34,
      j: 35,
      k: 36,
      l: 37,
      m: 38,
      n: 39,
      o: 40,
      p: 41,
      q: 42,
      r: 43,
      s: 44,
      t: 45,
      u: 46,
      v: 47,
      w: 48,
      x: 49,
      y: 50,
      z: 51,
      "+": 62,
      "/": 63
    };
    ALGORITHM = "AES-GCM";
    __name(decodeKey, "decodeKey");
    encoder = new TextEncoder();
    decoder = new TextDecoder();
    IV_LENGTH = 24;
    __name(encryptString, "encryptString");
    __name(decryptString, "decryptString");
    internalProps = /* @__PURE__ */ new Set([
      "server:component-path",
      "server:component-export",
      "server:component-directive",
      "server:defer"
    ]);
    __name(containsServerDirective, "containsServerDirective");
    __name(safeJsonStringify, "safeJsonStringify");
    __name(renderServerIsland, "renderServerIsland");
    needsHeadRenderingSymbol = Symbol.for("astro.needsHeadRendering");
    rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
    clientOnlyValues = /* @__PURE__ */ new Set(["solid-js", "react", "preact", "vue", "svelte", "lit"]);
    __name(guessRenderers, "guessRenderers");
    __name(isFragmentComponent, "isFragmentComponent");
    __name(isHTMLComponent, "isHTMLComponent");
    ASTRO_SLOT_EXP = /<\/?astro-slot\b[^>]*>/g;
    ASTRO_STATIC_SLOT_EXP = /<\/?astro-static-slot\b[^>]*>/g;
    __name(removeStaticAstroSlot, "removeStaticAstroSlot");
    __name(renderFrameworkComponent, "renderFrameworkComponent");
    __name(sanitizeElementName, "sanitizeElementName");
    __name(renderFragmentComponent, "renderFragmentComponent");
    __name(renderHTMLComponent, "renderHTMLComponent");
    __name(renderAstroComponent, "renderAstroComponent");
    __name(renderComponent, "renderComponent");
    __name(normalizeProps, "normalizeProps");
    __name(renderComponentToString, "renderComponentToString");
    __name(nonAstroPageNeedsHeadInjection, "nonAstroPageNeedsHeadInjection");
    ClientOnlyPlaceholder = "astro-client-only";
    hasTriedRenderComponentSymbol = Symbol("hasTriedRenderComponent");
    __name(renderJSX, "renderJSX");
    __name(renderJSXVNode, "renderJSXVNode");
    __name(renderElement, "renderElement");
    __name(prerenderElementChildren, "prerenderElementChildren");
    __name(renderPage, "renderPage");
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_".split("").reduce((v, c) => (v[c.charCodeAt(0)] = c, v), []);
    "-0123456789_".split("").reduce((v, c) => (v[c.charCodeAt(0)] = c, v), []);
    __name(spreadAttributes, "spreadAttributes");
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/astro-designed-error-pages_CROwsZzW.mjs
function decode64(string) {
  const binaryString = asciiToBinary(string);
  const arraybuffer = new ArrayBuffer(binaryString.length);
  const dv = new DataView(arraybuffer);
  for (let i = 0; i < arraybuffer.byteLength; i++) {
    dv.setUint8(i, binaryString.charCodeAt(i));
  }
  return arraybuffer;
}
function asciiToBinary(data) {
  if (data.length % 4 === 0) {
    data = data.replace(/==?$/, "");
  }
  let output = "";
  let buffer = 0;
  let accumulatedBits = 0;
  for (let i = 0; i < data.length; i++) {
    buffer <<= 6;
    buffer |= KEY_STRING.indexOf(data[i]);
    accumulatedBits += 6;
    if (accumulatedBits === 24) {
      output += String.fromCharCode((buffer & 16711680) >> 16);
      output += String.fromCharCode((buffer & 65280) >> 8);
      output += String.fromCharCode(buffer & 255);
      buffer = accumulatedBits = 0;
    }
  }
  if (accumulatedBits === 12) {
    buffer >>= 4;
    output += String.fromCharCode(buffer);
  } else if (accumulatedBits === 18) {
    buffer >>= 2;
    output += String.fromCharCode((buffer & 65280) >> 8);
    output += String.fromCharCode(buffer & 255);
  }
  return output;
}
function parse(serialized, revivers) {
  return unflatten(JSON.parse(serialized), revivers);
}
function unflatten(parsed, revivers) {
  if (typeof parsed === "number")
    return hydrate(parsed, true);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Invalid input");
  }
  const values = (
    /** @type {any[]} */
    parsed
  );
  const hydrated = Array(values.length);
  let hydrating = null;
  function hydrate(index, standalone = false) {
    if (index === UNDEFINED)
      return void 0;
    if (index === NAN)
      return NaN;
    if (index === POSITIVE_INFINITY)
      return Infinity;
    if (index === NEGATIVE_INFINITY)
      return -Infinity;
    if (index === NEGATIVE_ZERO)
      return -0;
    if (standalone || typeof index !== "number") {
      throw new Error(`Invalid input`);
    }
    if (index in hydrated)
      return hydrated[index];
    const value = values[index];
    if (!value || typeof value !== "object") {
      hydrated[index] = value;
    } else if (Array.isArray(value)) {
      if (typeof value[0] === "string") {
        const type = value[0];
        const reviver = revivers && Object.hasOwn(revivers, type) ? revivers[type] : void 0;
        if (reviver) {
          let i = value[1];
          if (typeof i !== "number") {
            i = values.push(value[1]) - 1;
          }
          hydrating ??= /* @__PURE__ */ new Set();
          if (hydrating.has(i)) {
            throw new Error("Invalid circular reference");
          }
          hydrating.add(i);
          hydrated[index] = reviver(hydrate(i));
          hydrating.delete(i);
          return hydrated[index];
        }
        switch (type) {
          case "Date":
            hydrated[index] = new Date(value[1]);
            break;
          case "Set":
            const set = /* @__PURE__ */ new Set();
            hydrated[index] = set;
            for (let i = 1; i < value.length; i += 1) {
              set.add(hydrate(value[i]));
            }
            break;
          case "Map":
            const map = /* @__PURE__ */ new Map();
            hydrated[index] = map;
            for (let i = 1; i < value.length; i += 2) {
              map.set(hydrate(value[i]), hydrate(value[i + 1]));
            }
            break;
          case "RegExp":
            hydrated[index] = new RegExp(value[1], value[2]);
            break;
          case "Object":
            hydrated[index] = Object(value[1]);
            break;
          case "BigInt":
            hydrated[index] = BigInt(value[1]);
            break;
          case "null":
            const obj = /* @__PURE__ */ Object.create(null);
            hydrated[index] = obj;
            for (let i = 1; i < value.length; i += 2) {
              obj[value[i]] = hydrate(value[i + 1]);
            }
            break;
          case "Int8Array":
          case "Uint8Array":
          case "Uint8ClampedArray":
          case "Int16Array":
          case "Uint16Array":
          case "Int32Array":
          case "Uint32Array":
          case "Float32Array":
          case "Float64Array":
          case "BigInt64Array":
          case "BigUint64Array": {
            if (values[value[1]][0] !== "ArrayBuffer") {
              throw new Error("Invalid data");
            }
            const TypedArrayConstructor = globalThis[type];
            const buffer = hydrate(value[1]);
            const typedArray = new TypedArrayConstructor(buffer);
            hydrated[index] = value[2] !== void 0 ? typedArray.subarray(value[2], value[3]) : typedArray;
            break;
          }
          case "ArrayBuffer": {
            const base64 = value[1];
            if (typeof base64 !== "string") {
              throw new Error("Invalid ArrayBuffer encoding");
            }
            const arraybuffer = decode64(base64);
            hydrated[index] = arraybuffer;
            break;
          }
          case "Temporal.Duration":
          case "Temporal.Instant":
          case "Temporal.PlainDate":
          case "Temporal.PlainTime":
          case "Temporal.PlainDateTime":
          case "Temporal.PlainMonthDay":
          case "Temporal.PlainYearMonth":
          case "Temporal.ZonedDateTime": {
            const temporalName = type.slice(9);
            hydrated[index] = Temporal[temporalName].from(value[1]);
            break;
          }
          case "URL": {
            const url = new URL(value[1]);
            hydrated[index] = url;
            break;
          }
          case "URLSearchParams": {
            const url = new URLSearchParams(value[1]);
            hydrated[index] = url;
            break;
          }
          default:
            throw new Error(`Unknown type ${type}`);
        }
      } else {
        const array = new Array(value.length);
        hydrated[index] = array;
        for (let i = 0; i < value.length; i += 1) {
          const n = value[i];
          if (n === HOLE)
            continue;
          array[i] = hydrate(n);
        }
      }
    } else {
      const object = {};
      hydrated[index] = object;
      for (const key in value) {
        if (key === "__proto__") {
          throw new Error("Cannot parse an object with a `__proto__` property");
        }
        const n = value[key];
        object[key] = hydrate(n);
      }
    }
    return hydrated[index];
  }
  __name(hydrate, "hydrate");
  return hydrate(0);
}
function isActionError(error2) {
  return typeof error2 === "object" && error2 != null && "type" in error2 && error2.type === "AstroActionError";
}
function isInputError(error2) {
  return typeof error2 === "object" && error2 != null && "type" in error2 && error2.type === "AstroActionInputError" && "issues" in error2 && Array.isArray(error2.issues);
}
function getActionQueryString(name) {
  const searchParams = new URLSearchParams({ [ACTION_QUERY_PARAMS.actionName]: name });
  return `?${searchParams.toString()}`;
}
function deserializeActionResult(res) {
  if (res.type === "error") {
    let json2;
    try {
      json2 = JSON.parse(res.body);
    } catch {
      return {
        data: void 0,
        error: new ActionError({
          message: res.body,
          code: "INTERNAL_SERVER_ERROR"
        })
      };
    }
    if (Object.assign(__vite_import_meta_env__, { OS: process.env.OS, _: process.env._ })?.PROD) {
      return { error: ActionError.fromJson(json2), data: void 0 };
    } else {
      const error2 = ActionError.fromJson(json2);
      error2.stack = actionResultErrorStack.get();
      return {
        error: error2,
        data: void 0
      };
    }
  }
  if (res.type === "empty") {
    return { data: void 0, error: void 0 };
  }
  return {
    data: parse(res.body, {
      URL: (href) => new URL(href)
    }),
    error: void 0
  };
}
function template({
  title,
  pathname,
  statusCode = 404,
  tabTitle,
  body
}) {
  return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>${tabTitle}</title>
		<style>
			:root {
				--gray-10: hsl(258, 7%, 10%);
				--gray-20: hsl(258, 7%, 20%);
				--gray-30: hsl(258, 7%, 30%);
				--gray-40: hsl(258, 7%, 40%);
				--gray-50: hsl(258, 7%, 50%);
				--gray-60: hsl(258, 7%, 60%);
				--gray-70: hsl(258, 7%, 70%);
				--gray-80: hsl(258, 7%, 80%);
				--gray-90: hsl(258, 7%, 90%);
				--black: #13151A;
				--accent-light: #E0CCFA;
			}

			* {
				box-sizing: border-box;
			}

			html {
				background: var(--black);
				color-scheme: dark;
				accent-color: var(--accent-light);
			}

			body {
				background-color: var(--gray-10);
				color: var(--gray-80);
				font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace;
				line-height: 1.5;
				margin: 0;
			}

			a {
				color: var(--accent-light);
			}

			.center {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				height: 100vh;
				width: 100vw;
			}

			h1 {
				margin-bottom: 8px;
				color: white;
				font-family: system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
				font-weight: 700;
				margin-top: 1rem;
				margin-bottom: 0;
			}

			.statusCode {
				color: var(--accent-light);
			}

			.astro-icon {
				height: 124px;
				width: 124px;
			}

			pre, code {
				padding: 2px 8px;
				background: rgba(0,0,0, 0.25);
				border: 1px solid rgba(255,255,255, 0.25);
				border-radius: 4px;
				font-size: 1.2em;
				margin-top: 0;
				max-width: 60em;
			}
		</style>
	</head>
	<body>
		<main class="center">
			<svg class="astro-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="80" viewBox="0 0 64 80" fill="none"> <path d="M20.5253 67.6322C16.9291 64.3531 15.8793 57.4632 17.3776 52.4717C19.9755 55.6188 23.575 56.6157 27.3035 57.1784C33.0594 58.0468 38.7122 57.722 44.0592 55.0977C44.6709 54.7972 45.2362 54.3978 45.9045 53.9931C46.4062 55.4451 46.5368 56.9109 46.3616 58.4028C45.9355 62.0362 44.1228 64.8429 41.2397 66.9705C40.0868 67.8215 38.8669 68.5822 37.6762 69.3846C34.0181 71.8508 33.0285 74.7426 34.403 78.9491C34.4357 79.0516 34.4649 79.1541 34.5388 79.4042C32.6711 78.5705 31.3069 77.3565 30.2674 75.7604C29.1694 74.0757 28.6471 72.2121 28.6196 70.1957C28.6059 69.2144 28.6059 68.2244 28.4736 67.257C28.1506 64.8985 27.0406 63.8425 24.9496 63.7817C22.8036 63.7192 21.106 65.0426 20.6559 67.1268C20.6215 67.2865 20.5717 67.4446 20.5218 67.6304L20.5253 67.6322Z" fill="white"/> <path d="M20.5253 67.6322C16.9291 64.3531 15.8793 57.4632 17.3776 52.4717C19.9755 55.6188 23.575 56.6157 27.3035 57.1784C33.0594 58.0468 38.7122 57.722 44.0592 55.0977C44.6709 54.7972 45.2362 54.3978 45.9045 53.9931C46.4062 55.4451 46.5368 56.9109 46.3616 58.4028C45.9355 62.0362 44.1228 64.8429 41.2397 66.9705C40.0868 67.8215 38.8669 68.5822 37.6762 69.3846C34.0181 71.8508 33.0285 74.7426 34.403 78.9491C34.4357 79.0516 34.4649 79.1541 34.5388 79.4042C32.6711 78.5705 31.3069 77.3565 30.2674 75.7604C29.1694 74.0757 28.6471 72.2121 28.6196 70.1957C28.6059 69.2144 28.6059 68.2244 28.4736 67.257C28.1506 64.8985 27.0406 63.8425 24.9496 63.7817C22.8036 63.7192 21.106 65.0426 20.6559 67.1268C20.6215 67.2865 20.5717 67.4446 20.5218 67.6304L20.5253 67.6322Z" fill="url(#paint0_linear_738_686)"/> <path d="M0 51.6401C0 51.6401 10.6488 46.4654 21.3274 46.4654L29.3786 21.6102C29.6801 20.4082 30.5602 19.5913 31.5538 19.5913C32.5474 19.5913 33.4275 20.4082 33.7289 21.6102L41.7802 46.4654C54.4274 46.4654 63.1076 51.6401 63.1076 51.6401C63.1076 51.6401 45.0197 2.48776 44.9843 2.38914C44.4652 0.935933 43.5888 0 42.4073 0H20.7022C19.5206 0 18.6796 0.935933 18.1251 2.38914C18.086 2.4859 0 51.6401 0 51.6401Z" fill="white"/> <defs> <linearGradient id="paint0_linear_738_686" x1="31.554" y1="75.4423" x2="39.7462" y2="48.376" gradientUnits="userSpaceOnUse"> <stop stop-color="#D83333"/> <stop offset="1" stop-color="#F041FF"/> </linearGradient> </defs> </svg>
			<h1>${statusCode ? `<span class="statusCode">${statusCode}: </span> ` : ""}<span class="statusMessage">${title}</span></h1>
			${body || `
				<pre>Path: ${escape(pathname)}</pre>
			`}
			</main>
	</body>
</html>`;
}
function ensure404Route(manifest2) {
  if (!manifest2.routes.some((route) => route.route === "/404")) {
    manifest2.routes.push(DEFAULT_404_ROUTE);
  }
  return manifest2;
}
async function default404Page({ pathname }) {
  return new Response(
    template({
      statusCode: 404,
      title: "Not found",
      tabTitle: "404: Not Found",
      pathname
    }),
    { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
var ImportType, E, KEY_STRING, UNDEFINED, HOLE, NAN, POSITIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_ZERO, ACTION_QUERY_PARAMS, __vite_import_meta_env__, codeToStatusMap, statusToCodeMap, ActionError, ActionInputError, actionResultErrorStack, DEFAULT_404_ROUTE, default404Instance;
var init_astro_designed_error_pages_CROwsZzW = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/astro-designed-error-pages_CROwsZzW.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    !function(A) {
      A[A.Static = 1] = "Static", A[A.Dynamic = 2] = "Dynamic", A[A.ImportMeta = 3] = "ImportMeta", A[A.StaticSourcePhase = 4] = "StaticSourcePhase", A[A.DynamicSourcePhase = 5] = "DynamicSourcePhase", A[A.StaticDeferPhase = 6] = "StaticDeferPhase", A[A.DynamicDeferPhase = 7] = "DynamicDeferPhase";
    }(ImportType || (ImportType = {}));
    1 === new Uint8Array(new Uint16Array([1]).buffer)[0];
    E = /* @__PURE__ */ __name(() => {
      return A = "AGFzbQEAAAABKwhgAX8Bf2AEf39/fwBgAAF/YAAAYAF/AGADf39/AX9gAn9/AX9gA39/fwADMTAAAQECAgICAgICAgICAgICAgICAgIAAwMDBAQAAAUAAAAAAAMDAwAGAAAABwAGAgUEBQFwAQEBBQMBAAEGDwJ/AUHA8gALfwBBwPIACwd6FQZtZW1vcnkCAAJzYQAAAWUAAwJpcwAEAmllAAUCc3MABgJzZQAHAml0AAgCYWkACQJpZAAKAmlwAAsCZXMADAJlZQANA2VscwAOA2VsZQAPAnJpABACcmUAEQFmABICbXMAEwVwYXJzZQAUC19faGVhcF9iYXNlAwEKzkQwaAEBf0EAIAA2AoAKQQAoAtwJIgEgAEEBdGoiAEEAOwEAQQAgAEECaiIANgKECkEAIAA2AogKQQBBADYC4AlBAEEANgLwCUEAQQA2AugJQQBBADYC5AlBAEEANgL4CUEAQQA2AuwJIAEL0wEBA39BACgC8AkhBEEAQQAoAogKIgU2AvAJQQAgBDYC9AlBACAFQSRqNgKICiAEQSBqQeAJIAQbIAU2AgBBACgC1AkhBEEAKALQCSEGIAUgATYCACAFIAA2AgggBSACIAJBAmpBACAGIANGIgAbIAQgA0YiBBs2AgwgBSADNgIUIAVBADYCECAFIAI2AgQgBUEANgIgIAVBA0EBQQIgABsgBBs2AhwgBUEAKALQCSADRiICOgAYAkACQCACDQBBACgC1AkgA0cNAQtBAEEBOgCMCgsLXgEBf0EAKAL4CSIEQRBqQeQJIAQbQQAoAogKIgQ2AgBBACAENgL4CUEAIARBFGo2AogKQQBBAToAjAogBEEANgIQIAQgAzYCDCAEIAI2AgggBCABNgIEIAQgADYCAAsIAEEAKAKQCgsVAEEAKALoCSgCAEEAKALcCWtBAXULHgEBf0EAKALoCSgCBCIAQQAoAtwJa0EBdUF/IAAbCxUAQQAoAugJKAIIQQAoAtwJa0EBdQseAQF/QQAoAugJKAIMIgBBACgC3AlrQQF1QX8gABsLCwBBACgC6AkoAhwLHgEBf0EAKALoCSgCECIAQQAoAtwJa0EBdUF/IAAbCzsBAX8CQEEAKALoCSgCFCIAQQAoAtAJRw0AQX8PCwJAIABBACgC1AlHDQBBfg8LIABBACgC3AlrQQF1CwsAQQAoAugJLQAYCxUAQQAoAuwJKAIAQQAoAtwJa0EBdQsVAEEAKALsCSgCBEEAKALcCWtBAXULHgEBf0EAKALsCSgCCCIAQQAoAtwJa0EBdUF/IAAbCx4BAX9BACgC7AkoAgwiAEEAKALcCWtBAXVBfyAAGwslAQF/QQBBACgC6AkiAEEgakHgCSAAGygCACIANgLoCSAAQQBHCyUBAX9BAEEAKALsCSIAQRBqQeQJIAAbKAIAIgA2AuwJIABBAEcLCABBAC0AlAoLCABBAC0AjAoL3Q0BBX8jAEGA0ABrIgAkAEEAQQE6AJQKQQBBACgC2Ak2ApwKQQBBACgC3AlBfmoiATYCsApBACABQQAoAoAKQQF0aiICNgK0CkEAQQA6AIwKQQBBADsBlgpBAEEAOwGYCkEAQQA6AKAKQQBBADYCkApBAEEAOgD8CUEAIABBgBBqNgKkCkEAIAA2AqgKQQBBADoArAoCQAJAAkACQANAQQAgAUECaiIDNgKwCiABIAJPDQECQCADLwEAIgJBd2pBBUkNAAJAAkACQAJAAkAgAkGbf2oOBQEICAgCAAsgAkEgRg0EIAJBL0YNAyACQTtGDQIMBwtBAC8BmAoNASADEBVFDQEgAUEEakGCCEEKEC8NARAWQQAtAJQKDQFBAEEAKAKwCiIBNgKcCgwHCyADEBVFDQAgAUEEakGMCEEKEC8NABAXC0EAQQAoArAKNgKcCgwBCwJAIAEvAQQiA0EqRg0AIANBL0cNBBAYDAELQQEQGQtBACgCtAohAkEAKAKwCiEBDAALC0EAIQIgAyEBQQAtAPwJDQIMAQtBACABNgKwCkEAQQA6AJQKCwNAQQAgAUECaiIDNgKwCgJAAkACQAJAAkACQAJAIAFBACgCtApPDQAgAy8BACICQXdqQQVJDQYCQAJAAkACQAJAAkACQAJAAkACQCACQWBqDgoQDwYPDw8PBQECAAsCQAJAAkACQCACQaB/ag4KCxISAxIBEhISAgALIAJBhX9qDgMFEQYJC0EALwGYCg0QIAMQFUUNECABQQRqQYIIQQoQLw0QEBYMEAsgAxAVRQ0PIAFBBGpBjAhBChAvDQ8QFwwPCyADEBVFDQ4gASkABELsgISDsI7AOVINDiABLwEMIgNBd2oiAUEXSw0MQQEgAXRBn4CABHFFDQwMDQtBAEEALwGYCiIBQQFqOwGYCkEAKAKkCiABQQN0aiIBQQE2AgAgAUEAKAKcCjYCBAwNC0EALwGYCiIDRQ0JQQAgA0F/aiIDOwGYCkEALwGWCiICRQ0MQQAoAqQKIANB//8DcUEDdGooAgBBBUcNDAJAIAJBAnRBACgCqApqQXxqKAIAIgMoAgQNACADQQAoApwKQQJqNgIEC0EAIAJBf2o7AZYKIAMgAUEEajYCDAwMCwJAQQAoApwKIgEvAQBBKUcNAEEAKALwCSIDRQ0AIAMoAgQgAUcNAEEAQQAoAvQJIgM2AvAJAkAgA0UNACADQQA2AiAMAQtBAEEANgLgCQtBAEEALwGYCiIDQQFqOwGYCkEAKAKkCiADQQN0aiIDQQZBAkEALQCsChs2AgAgAyABNgIEQQBBADoArAoMCwtBAC8BmAoiAUUNB0EAIAFBf2oiATsBmApBACgCpAogAUH//wNxQQN0aigCAEEERg0EDAoLQScQGgwJC0EiEBoMCAsgAkEvRw0HAkACQCABLwEEIgFBKkYNACABQS9HDQEQGAwKC0EBEBkMCQsCQAJAAkACQEEAKAKcCiIBLwEAIgMQG0UNAAJAAkAgA0FVag4EAAkBAwkLIAFBfmovAQBBK0YNAwwICyABQX5qLwEAQS1GDQIMBwsgA0EpRw0BQQAoAqQKQQAvAZgKIgJBA3RqKAIEEBxFDQIMBgsgAUF+ai8BAEFQakH//wNxQQpPDQULQQAvAZgKIQILAkACQCACQf//A3EiAkUNACADQeYARw0AQQAoAqQKIAJBf2pBA3RqIgQoAgBBAUcNACABQX5qLwEAQe8ARw0BIAQoAgRBlghBAxAdRQ0BDAULIANB/QBHDQBBACgCpAogAkEDdGoiAigCBBAeDQQgAigCAEEGRg0ECyABEB8NAyADRQ0DIANBL0ZBAC0AoApBAEdxDQMCQEEAKAL4CSICRQ0AIAEgAigCAEkNACABIAIoAgRNDQQLIAFBfmohAUEAKALcCSECAkADQCABQQJqIgQgAk0NAUEAIAE2ApwKIAEvAQAhAyABQX5qIgQhASADECBFDQALIARBAmohBAsCQCADQf//A3EQIUUNACAEQX5qIQECQANAIAFBAmoiAyACTQ0BQQAgATYCnAogAS8BACEDIAFBfmoiBCEBIAMQIQ0ACyAEQQJqIQMLIAMQIg0EC0EAQQE6AKAKDAcLQQAoAqQKQQAvAZgKIgFBA3QiA2pBACgCnAo2AgRBACABQQFqOwGYCkEAKAKkCiADakEDNgIACxAjDAULQQAtAPwJQQAvAZYKQQAvAZgKcnJFIQIMBwsQJEEAQQA6AKAKDAMLECVBACECDAULIANBoAFHDQELQQBBAToArAoLQQBBACgCsAo2ApwKC0EAKAKwCiEBDAALCyAAQYDQAGokACACCxoAAkBBACgC3AkgAEcNAEEBDwsgAEF+ahAmC/4KAQZ/QQBBACgCsAoiAEEMaiIBNgKwCkEAKAL4CSECQQEQKSEDAkACQAJAAkACQAJAAkACQAJAQQAoArAKIgQgAUcNACADEChFDQELAkACQAJAAkACQAJAAkAgA0EqRg0AIANB+wBHDQFBACAEQQJqNgKwCkEBECkhA0EAKAKwCiEEA0ACQAJAIANB//8DcSIDQSJGDQAgA0EnRg0AIAMQLBpBACgCsAohAwwBCyADEBpBAEEAKAKwCkECaiIDNgKwCgtBARApGgJAIAQgAxAtIgNBLEcNAEEAQQAoArAKQQJqNgKwCkEBECkhAwsgA0H9AEYNA0EAKAKwCiIFIARGDQ8gBSEEIAVBACgCtApNDQAMDwsLQQAgBEECajYCsApBARApGkEAKAKwCiIDIAMQLRoMAgtBAEEAOgCUCgJAAkACQAJAAkACQCADQZ9/ag4MAgsEAQsDCwsLCwsFAAsgA0H2AEYNBAwKC0EAIARBDmoiAzYCsAoCQAJAAkBBARApQZ9/ag4GABICEhIBEgtBACgCsAoiBSkAAkLzgOSD4I3AMVINESAFLwEKECFFDRFBACAFQQpqNgKwCkEAECkaC0EAKAKwCiIFQQJqQbIIQQ4QLw0QIAUvARAiAkF3aiIBQRdLDQ1BASABdEGfgIAEcUUNDQwOC0EAKAKwCiIFKQACQuyAhIOwjsA5Ug0PIAUvAQoiAkF3aiIBQRdNDQYMCgtBACAEQQpqNgKwCkEAECkaQQAoArAKIQQLQQAgBEEQajYCsAoCQEEBECkiBEEqRw0AQQBBACgCsApBAmo2ArAKQQEQKSEEC0EAKAKwCiEDIAQQLBogA0EAKAKwCiIEIAMgBBACQQBBACgCsApBfmo2ArAKDwsCQCAEKQACQuyAhIOwjsA5Ug0AIAQvAQoQIEUNAEEAIARBCmo2ArAKQQEQKSEEQQAoArAKIQMgBBAsGiADQQAoArAKIgQgAyAEEAJBAEEAKAKwCkF+ajYCsAoPC0EAIARBBGoiBDYCsAoLQQAgBEEGajYCsApBAEEAOgCUCkEBECkhBEEAKAKwCiEDIAQQLCEEQQAoArAKIQIgBEHf/wNxIgFB2wBHDQNBACACQQJqNgKwCkEBECkhBUEAKAKwCiEDQQAhBAwEC0EAQQE6AIwKQQBBACgCsApBAmo2ArAKC0EBECkhBEEAKAKwCiEDAkAgBEHmAEcNACADQQJqQawIQQYQLw0AQQAgA0EIajYCsAogAEEBEClBABArIAJBEGpB5AkgAhshAwNAIAMoAgAiA0UNBSADQgA3AgggA0EQaiEDDAALC0EAIANBfmo2ArAKDAMLQQEgAXRBn4CABHFFDQMMBAtBASEECwNAAkACQCAEDgIAAQELIAVB//8DcRAsGkEBIQQMAQsCQAJAQQAoArAKIgQgA0YNACADIAQgAyAEEAJBARApIQQCQCABQdsARw0AIARBIHJB/QBGDQQLQQAoArAKIQMCQCAEQSxHDQBBACADQQJqNgKwCkEBECkhBUEAKAKwCiEDIAVBIHJB+wBHDQILQQAgA0F+ajYCsAoLIAFB2wBHDQJBACACQX5qNgKwCg8LQQAhBAwACwsPCyACQaABRg0AIAJB+wBHDQQLQQAgBUEKajYCsApBARApIgVB+wBGDQMMAgsCQCACQVhqDgMBAwEACyACQaABRw0CC0EAIAVBEGo2ArAKAkBBARApIgVBKkcNAEEAQQAoArAKQQJqNgKwCkEBECkhBQsgBUEoRg0BC0EAKAKwCiEBIAUQLBpBACgCsAoiBSABTQ0AIAQgAyABIAUQAkEAQQAoArAKQX5qNgKwCg8LIAQgA0EAQQAQAkEAIARBDGo2ArAKDwsQJQuFDAEKf0EAQQAoArAKIgBBDGoiATYCsApBARApIQJBACgCsAohAwJAAkACQAJAAkACQAJAAkAgAkEuRw0AQQAgA0ECajYCsAoCQEEBECkiAkHkAEYNAAJAIAJB8wBGDQAgAkHtAEcNB0EAKAKwCiICQQJqQZwIQQYQLw0HAkBBACgCnAoiAxAqDQAgAy8BAEEuRg0ICyAAIAAgAkEIakEAKALUCRABDwtBACgCsAoiAkECakGiCEEKEC8NBgJAQQAoApwKIgMQKg0AIAMvAQBBLkYNBwtBACEEQQAgAkEMajYCsApBASEFQQUhBkEBECkhAkEAIQdBASEIDAILQQAoArAKIgIpAAJC5YCYg9CMgDlSDQUCQEEAKAKcCiIDECoNACADLwEAQS5GDQYLQQAhBEEAIAJBCmo2ArAKQQIhCEEHIQZBASEHQQEQKSECQQEhBQwBCwJAAkACQAJAIAJB8wBHDQAgAyABTQ0AIANBAmpBoghBChAvDQACQCADLwEMIgRBd2oiB0EXSw0AQQEgB3RBn4CABHENAgsgBEGgAUYNAQtBACEHQQchBkEBIQQgAkHkAEYNAQwCC0EAIQRBACADQQxqIgI2ArAKQQEhBUEBECkhCQJAQQAoArAKIgYgAkYNAEHmACECAkAgCUHmAEYNAEEFIQZBACEHQQEhCCAJIQIMBAtBACEHQQEhCCAGQQJqQawIQQYQLw0EIAYvAQgQIEUNBAtBACEHQQAgAzYCsApBByEGQQEhBEEAIQVBACEIIAkhAgwCCyADIABBCmpNDQBBACEIQeQAIQICQCADKQACQuWAmIPQjIA5Ug0AAkACQCADLwEKIgRBd2oiB0EXSw0AQQEgB3RBn4CABHENAQtBACEIIARBoAFHDQELQQAhBUEAIANBCmo2ArAKQSohAkEBIQdBAiEIQQEQKSIJQSpGDQRBACADNgKwCkEBIQRBACEHQQAhCCAJIQIMAgsgAyEGQQAhBwwCC0EAIQVBACEICwJAIAJBKEcNAEEAKAKkCkEALwGYCiICQQN0aiIDQQAoArAKNgIEQQAgAkEBajsBmAogA0EFNgIAQQAoApwKLwEAQS5GDQRBAEEAKAKwCiIDQQJqNgKwCkEBECkhAiAAQQAoArAKQQAgAxABAkACQCAFDQBBACgC8AkhAQwBC0EAKALwCSIBIAY2AhwLQQBBAC8BlgoiA0EBajsBlgpBACgCqAogA0ECdGogATYCAAJAIAJBIkYNACACQSdGDQBBAEEAKAKwCkF+ajYCsAoPCyACEBpBAEEAKAKwCkECaiICNgKwCgJAAkACQEEBEClBV2oOBAECAgACC0EAQQAoArAKQQJqNgKwCkEBECkaQQAoAvAJIgMgAjYCBCADQQE6ABggA0EAKAKwCiICNgIQQQAgAkF+ajYCsAoPC0EAKALwCSIDIAI2AgQgA0EBOgAYQQBBAC8BmApBf2o7AZgKIANBACgCsApBAmo2AgxBAEEALwGWCkF/ajsBlgoPC0EAQQAoArAKQX5qNgKwCg8LAkAgBEEBcyACQfsAR3INAEEAKAKwCiECQQAvAZgKDQUDQAJAAkACQCACQQAoArQKTw0AQQEQKSICQSJGDQEgAkEnRg0BIAJB/QBHDQJBAEEAKAKwCkECajYCsAoLQQEQKSEDQQAoArAKIQICQCADQeYARw0AIAJBAmpBrAhBBhAvDQcLQQAgAkEIajYCsAoCQEEBECkiAkEiRg0AIAJBJ0cNBwsgACACQQAQKw8LIAIQGgtBAEEAKAKwCkECaiICNgKwCgwACwsCQAJAIAJBWWoOBAMBAQMACyACQSJGDQILQQAoArAKIQYLIAYgAUcNAEEAIABBCmo2ArAKDwsgAkEqRyAHcQ0DQQAvAZgKQf//A3ENA0EAKAKwCiECQQAoArQKIQEDQCACIAFPDQECQAJAIAIvAQAiA0EnRg0AIANBIkcNAQsgACADIAgQKw8LQQAgAkECaiICNgKwCgwACwsQJQsPC0EAIAJBfmo2ArAKDwtBAEEAKAKwCkF+ajYCsAoLRwEDf0EAKAKwCkECaiEAQQAoArQKIQECQANAIAAiAkF+aiABTw0BIAJBAmohACACLwEAQXZqDgQBAAABAAsLQQAgAjYCsAoLmAEBA39BAEEAKAKwCiIBQQJqNgKwCiABQQZqIQFBACgCtAohAgNAAkACQAJAIAFBfGogAk8NACABQX5qLwEAIQMCQAJAIAANACADQSpGDQEgA0F2ag4EAgQEAgQLIANBKkcNAwsgAS8BAEEvRw0CQQAgAUF+ajYCsAoMAQsgAUF+aiEBC0EAIAE2ArAKDwsgAUECaiEBDAALC4gBAQR/QQAoArAKIQFBACgCtAohAgJAAkADQCABIgNBAmohASADIAJPDQEgAS8BACIEIABGDQICQCAEQdwARg0AIARBdmoOBAIBAQIBCyADQQRqIQEgAy8BBEENRw0AIANBBmogASADLwEGQQpGGyEBDAALC0EAIAE2ArAKECUPC0EAIAE2ArAKC2wBAX8CQAJAIABBX2oiAUEFSw0AQQEgAXRBMXENAQsgAEFGakH//wNxQQZJDQAgAEEpRyAAQVhqQf//A3FBB0lxDQACQCAAQaV/ag4EAQAAAQALIABB/QBHIABBhX9qQf//A3FBBElxDwtBAQsuAQF/QQEhAQJAIABBpglBBRAdDQAgAEGWCEEDEB0NACAAQbAJQQIQHSEBCyABC0YBA39BACEDAkAgACACQQF0IgJrIgRBAmoiAEEAKALcCSIFSQ0AIAAgASACEC8NAAJAIAAgBUcNAEEBDwsgBBAmIQMLIAMLgwEBAn9BASEBAkACQAJAAkACQAJAIAAvAQAiAkFFag4EBQQEAQALAkAgAkGbf2oOBAMEBAIACyACQSlGDQQgAkH5AEcNAyAAQX5qQbwJQQYQHQ8LIABBfmovAQBBPUYPCyAAQX5qQbQJQQQQHQ8LIABBfmpByAlBAxAdDwtBACEBCyABC7QDAQJ/QQAhAQJAAkACQAJAAkACQAJAAkACQAJAIAAvAQBBnH9qDhQAAQIJCQkJAwkJBAUJCQYJBwkJCAkLAkACQCAAQX5qLwEAQZd/ag4EAAoKAQoLIABBfGpByghBAhAdDwsgAEF8akHOCEEDEB0PCwJAAkACQCAAQX5qLwEAQY1/ag4DAAECCgsCQCAAQXxqLwEAIgJB4QBGDQAgAkHsAEcNCiAAQXpqQeUAECcPCyAAQXpqQeMAECcPCyAAQXxqQdQIQQQQHQ8LIABBfGpB3AhBBhAdDwsgAEF+ai8BAEHvAEcNBiAAQXxqLwEAQeUARw0GAkAgAEF6ai8BACICQfAARg0AIAJB4wBHDQcgAEF4akHoCEEGEB0PCyAAQXhqQfQIQQIQHQ8LIABBfmpB+AhBBBAdDwtBASEBIABBfmoiAEHpABAnDQQgAEGACUEFEB0PCyAAQX5qQeQAECcPCyAAQX5qQYoJQQcQHQ8LIABBfmpBmAlBBBAdDwsCQCAAQX5qLwEAIgJB7wBGDQAgAkHlAEcNASAAQXxqQe4AECcPCyAAQXxqQaAJQQMQHSEBCyABCzQBAX9BASEBAkAgAEF3akH//wNxQQVJDQAgAEGAAXJBoAFGDQAgAEEuRyAAEChxIQELIAELMAEBfwJAAkAgAEF3aiIBQRdLDQBBASABdEGNgIAEcQ0BCyAAQaABRg0AQQAPC0EBC04BAn9BACEBAkACQCAALwEAIgJB5QBGDQAgAkHrAEcNASAAQX5qQfgIQQQQHQ8LIABBfmovAQBB9QBHDQAgAEF8akHcCEEGEB0hAQsgAQveAQEEf0EAKAKwCiEAQQAoArQKIQECQAJAAkADQCAAIgJBAmohACACIAFPDQECQAJAAkAgAC8BACIDQaR/ag4FAgMDAwEACyADQSRHDQIgAi8BBEH7AEcNAkEAIAJBBGoiADYCsApBAEEALwGYCiICQQFqOwGYCkEAKAKkCiACQQN0aiICQQQ2AgAgAiAANgIEDwtBACAANgKwCkEAQQAvAZgKQX9qIgA7AZgKQQAoAqQKIABB//8DcUEDdGooAgBBA0cNAwwECyACQQRqIQAMAAsLQQAgADYCsAoLECULC3ABAn8CQAJAA0BBAEEAKAKwCiIAQQJqIgE2ArAKIABBACgCtApPDQECQAJAAkAgAS8BACIBQaV/ag4CAQIACwJAIAFBdmoOBAQDAwQACyABQS9HDQIMBAsQLhoMAQtBACAAQQRqNgKwCgwACwsQJQsLNQEBf0EAQQE6APwJQQAoArAKIQBBAEEAKAK0CkECajYCsApBACAAQQAoAtwJa0EBdTYCkAoLQwECf0EBIQECQCAALwEAIgJBd2pB//8DcUEFSQ0AIAJBgAFyQaABRg0AQQAhASACEChFDQAgAkEuRyAAECpyDwsgAQs9AQJ/QQAhAgJAQQAoAtwJIgMgAEsNACAALwEAIAFHDQACQCADIABHDQBBAQ8LIABBfmovAQAQICECCyACC2gBAn9BASEBAkACQCAAQV9qIgJBBUsNAEEBIAJ0QTFxDQELIABB+P8DcUEoRg0AIABBRmpB//8DcUEGSQ0AAkAgAEGlf2oiAkEDSw0AIAJBAUcNAQsgAEGFf2pB//8DcUEESSEBCyABC5wBAQN/QQAoArAKIQECQANAAkACQCABLwEAIgJBL0cNAAJAIAEvAQIiAUEqRg0AIAFBL0cNBBAYDAILIAAQGQwBCwJAAkAgAEUNACACQXdqIgFBF0sNAUEBIAF0QZ+AgARxRQ0BDAILIAIQIUUNAwwBCyACQaABRw0CC0EAQQAoArAKIgNBAmoiATYCsAogA0EAKAK0CkkNAAsLIAILMQEBf0EAIQECQCAALwEAQS5HDQAgAEF+ai8BAEEuRw0AIABBfGovAQBBLkYhAQsgAQumBAEBfwJAIAFBIkYNACABQSdGDQAQJQ8LQQAoArAKIQMgARAaIAAgA0ECakEAKAKwCkEAKALQCRABAkAgAkEBSA0AQQAoAvAJQQRBBiACQQFGGzYCHAtBAEEAKAKwCkECajYCsAoCQAJAAkACQEEAECkiAUHhAEYNACABQfcARg0BQQAoArAKIQEMAgtBACgCsAoiAUECakHACEEKEC8NAUEGIQIMAgtBACgCsAoiAS8BAkHpAEcNACABLwEEQfQARw0AQQQhAiABLwEGQegARg0BC0EAIAFBfmo2ArAKDwtBACABIAJBAXRqNgKwCgJAQQEQKUH7AEYNAEEAIAE2ArAKDwtBACgCsAoiACECA0BBACACQQJqNgKwCgJAAkACQEEBECkiAkEiRg0AIAJBJ0cNAUEnEBpBAEEAKAKwCkECajYCsApBARApIQIMAgtBIhAaQQBBACgCsApBAmo2ArAKQQEQKSECDAELIAIQLCECCwJAIAJBOkYNAEEAIAE2ArAKDwtBAEEAKAKwCkECajYCsAoCQEEBECkiAkEiRg0AIAJBJ0YNAEEAIAE2ArAKDwsgAhAaQQBBACgCsApBAmo2ArAKAkACQEEBECkiAkEsRg0AIAJB/QBGDQFBACABNgKwCg8LQQBBACgCsApBAmo2ArAKQQEQKUH9AEYNAEEAKAKwCiECDAELC0EAKALwCSIBIAA2AhAgAUEAKAKwCkECajYCDAttAQJ/AkACQANAAkAgAEH//wNxIgFBd2oiAkEXSw0AQQEgAnRBn4CABHENAgsgAUGgAUYNASAAIQIgARAoDQJBACECQQBBACgCsAoiAEECajYCsAogAC8BAiIADQAMAgsLIAAhAgsgAkH//wNxC6sBAQR/AkACQEEAKAKwCiICLwEAIgNB4QBGDQAgASEEIAAhBQwBC0EAIAJBBGo2ArAKQQEQKSECQQAoArAKIQUCQAJAIAJBIkYNACACQSdGDQAgAhAsGkEAKAKwCiEEDAELIAIQGkEAQQAoArAKQQJqIgQ2ArAKC0EBECkhA0EAKAKwCiECCwJAIAIgBUYNACAFIARBACAAIAAgAUYiAhtBACABIAIbEAILIAMLcgEEf0EAKAKwCiEAQQAoArQKIQECQAJAA0AgAEECaiECIAAgAU8NAQJAAkAgAi8BACIDQaR/ag4CAQQACyACIQAgA0F2ag4EAgEBAgELIABBBGohAAwACwtBACACNgKwChAlQQAPC0EAIAI2ArAKQd0AC0kBA39BACEDAkAgAkUNAAJAA0AgAC0AACIEIAEtAAAiBUcNASABQQFqIQEgAEEBaiEAIAJBf2oiAg0ADAILCyAEIAVrIQMLIAMLC+wBAgBBgAgLzgEAAHgAcABvAHIAdABtAHAAbwByAHQAZgBvAHIAZQB0AGEAbwB1AHIAYwBlAHIAbwBtAHUAbgBjAHQAaQBvAG4AcwBzAGUAcgB0AHYAbwB5AGkAZQBkAGUAbABlAGMAbwBuAHQAaQBuAGkAbgBzAHQAYQBuAHQAeQBiAHIAZQBhAHIAZQB0AHUAcgBkAGUAYgB1AGcAZwBlAGEAdwBhAGkAdABoAHIAdwBoAGkAbABlAGkAZgBjAGEAdABjAGYAaQBuAGEAbABsAGUAbABzAABB0AkLEAEAAAACAAAAAAQAAEA5AAA=", "undefined" != typeof Buffer ? Buffer.from(A, "base64") : Uint8Array.from(atob(A), (A2) => A2.charCodeAt(0));
      var A;
    }, "E");
    WebAssembly.compile(E()).then(WebAssembly.instantiate).then(({ exports: A }) => {
    });
    __name(decode64, "decode64");
    KEY_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    __name(asciiToBinary, "asciiToBinary");
    UNDEFINED = -1;
    HOLE = -2;
    NAN = -3;
    POSITIVE_INFINITY = -4;
    NEGATIVE_INFINITY = -5;
    NEGATIVE_ZERO = -6;
    __name(parse, "parse");
    __name(unflatten, "unflatten");
    ACTION_QUERY_PARAMS = {
      actionName: "_astroAction"
    };
    __vite_import_meta_env__ = { "ASSETS_PREFIX": void 0, "BASE_URL": "/", "DEV": false, "DIRECTUS_TOKEN": "ebgg-l6cPyahbgUOloDgmUteOvOOw7NH", "DIRECTUS_URL": "https://cms.ombreeluci.it", "MEDIA_BASE_URL": "https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev", "MODE": "production", "PROD": true, "PUBLIC_ALGOLIA_APP_ID": "1BM5L8XRYW", "PUBLIC_ALGOLIA_SEARCH_KEY": "af13f70e8d751ead7da2b227c062d456", "PUBLIC_KEYSTATIC_GITHUB_APP_SLUG": "keystatic-ombreeluci", "SITE": "https://ombreeluci.it", "SSR": true };
    codeToStatusMap = {
      // Implemented from tRPC error code table
      // https://trpc.io/docs/server/error-handling#error-codes
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      TIMEOUT: 405,
      CONFLICT: 409,
      PRECONDITION_FAILED: 412,
      PAYLOAD_TOO_LARGE: 413,
      UNSUPPORTED_MEDIA_TYPE: 415,
      UNPROCESSABLE_CONTENT: 422,
      TOO_MANY_REQUESTS: 429,
      CLIENT_CLOSED_REQUEST: 499,
      INTERNAL_SERVER_ERROR: 500
    };
    statusToCodeMap = Object.entries(codeToStatusMap).reduce(
      // reverse the key-value pairs
      (acc, [key, value]) => ({ ...acc, [value]: key }),
      {}
    );
    ActionError = class extends Error {
      type = "AstroActionError";
      code = "INTERNAL_SERVER_ERROR";
      status = 500;
      constructor(params) {
        super(params.message);
        this.code = params.code;
        this.status = ActionError.codeToStatus(params.code);
        if (params.stack) {
          this.stack = params.stack;
        }
      }
      static codeToStatus(code) {
        return codeToStatusMap[code];
      }
      static statusToCode(status) {
        return statusToCodeMap[status] ?? "INTERNAL_SERVER_ERROR";
      }
      static fromJson(body) {
        if (isInputError(body)) {
          return new ActionInputError(body.issues);
        }
        if (isActionError(body)) {
          return new ActionError(body);
        }
        return new ActionError({
          code: "INTERNAL_SERVER_ERROR"
        });
      }
    };
    __name(ActionError, "ActionError");
    __name(isActionError, "isActionError");
    __name(isInputError, "isInputError");
    ActionInputError = class extends ActionError {
      type = "AstroActionInputError";
      // We don't expose all ZodError properties.
      // Not all properties will serialize from server to client,
      // and we don't want to import the full ZodError object into the client.
      issues;
      fields;
      constructor(issues) {
        super({
          message: `Failed to validate: ${JSON.stringify(issues, null, 2)}`,
          code: "BAD_REQUEST"
        });
        this.issues = issues;
        this.fields = {};
        for (const issue of issues) {
          if (issue.path.length > 0) {
            const key = issue.path[0].toString();
            this.fields[key] ??= [];
            this.fields[key]?.push(issue.message);
          }
        }
      }
    };
    __name(ActionInputError, "ActionInputError");
    __name(getActionQueryString, "getActionQueryString");
    __name(deserializeActionResult, "deserializeActionResult");
    actionResultErrorStack = /* @__PURE__ */ (/* @__PURE__ */ __name(function actionResultErrorStackFn() {
      let errorStack;
      return {
        set(stack) {
          errorStack = stack;
        },
        get() {
          return errorStack;
        }
      };
    }, "actionResultErrorStackFn"))();
    __name(template, "template");
    DEFAULT_404_ROUTE = {
      component: DEFAULT_404_COMPONENT,
      generate: () => "",
      params: [],
      pattern: /\/404/,
      prerender: false,
      pathname: "/404",
      segments: [[{ content: "404", dynamic: false, spread: false }]],
      type: "page",
      route: "/404",
      fallbackRoutes: [],
      isIndex: false
    };
    __name(ensure404Route, "ensure404Route");
    __name(default404Page, "default404Page");
    default404Page.isAstroComponentFactory = true;
    default404Instance = {
      default: default404Page
    };
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/index_CGzEFjN-.mjs
function hasActionPayload(locals) {
  return "_actionPayload" in locals;
}
function createGetActionResult(locals) {
  return (actionFn) => {
    if (!hasActionPayload(locals) || actionFn.toString() !== getActionQueryString(locals._actionPayload.actionName)) {
      return void 0;
    }
    return deserializeActionResult(locals._actionPayload.actionResult);
  };
}
function createCallAction(context) {
  return (baseAction, input) => {
    Reflect.set(context, ACTION_API_CONTEXT_SYMBOL, true);
    const action = baseAction.bind(context);
    return action(input);
  };
}
function appendForwardSlash(path) {
  return path.endsWith("/") ? path : path + "/";
}
function prependForwardSlash(path) {
  return path[0] === "/" ? path : "/" + path;
}
function removeTrailingForwardSlash(path) {
  return path.endsWith("/") ? path.slice(0, path.length - 1) : path;
}
function removeLeadingForwardSlash(path) {
  return path.startsWith("/") ? path.substring(1) : path;
}
function trimSlashes(path) {
  return path.replace(/^\/|\/$/g, "");
}
function isString(path) {
  return typeof path === "string" || path instanceof String;
}
function joinPaths(...paths) {
  return paths.filter(isString).map((path, i) => {
    if (i === 0) {
      return removeTrailingForwardSlash(path);
    } else if (i === paths.length - 1) {
      return removeLeadingForwardSlash(path);
    } else {
      return trimSlashes(path);
    }
  }).join("/");
}
function slash(path) {
  return path.replace(/\\/g, "/");
}
function fileExtension(path) {
  const ext = path.split(".").pop();
  return ext !== path ? `.${ext}` : "";
}
function shouldAppendForwardSlash(trailingSlash, buildFormat) {
  switch (trailingSlash) {
    case "always":
      return true;
    case "never":
      return false;
    case "ignore": {
      switch (buildFormat) {
        case "directory":
          return true;
        case "preserve":
        case "file":
          return false;
      }
    }
  }
}
function requestHasLocale(locales) {
  return function(context) {
    return pathHasLocale(context.url.pathname, locales);
  };
}
function requestIs404Or500(request, base = "") {
  const url = new URL(request.url);
  return url.pathname.startsWith(`${base}/404`) || url.pathname.startsWith(`${base}/500`);
}
function pathHasLocale(path, locales) {
  const segments = path.split("/");
  for (const segment of segments) {
    for (const locale of locales) {
      if (typeof locale === "string") {
        if (normalizeTheLocale(segment) === normalizeTheLocale(locale)) {
          return true;
        }
      } else if (segment === locale.path) {
        return true;
      }
    }
  }
  return false;
}
function getPathByLocale(locale, locales) {
  for (const loopLocale of locales) {
    if (typeof loopLocale === "string") {
      if (loopLocale === locale) {
        return loopLocale;
      }
    } else {
      for (const code of loopLocale.codes) {
        if (code === locale) {
          return loopLocale.path;
        }
      }
    }
  }
  throw new AstroError(i18nNoLocaleFoundInPath);
}
function normalizeTheLocale(locale) {
  return locale.replaceAll("_", "-").toLowerCase();
}
function toCodes(locales) {
  return locales.map((loopLocale) => {
    if (typeof loopLocale === "string") {
      return loopLocale;
    } else {
      return loopLocale.codes[0];
    }
  });
}
function redirectToDefaultLocale({
  trailingSlash,
  format,
  base,
  defaultLocale
}) {
  return function(context, statusCode) {
    if (shouldAppendForwardSlash(trailingSlash, format)) {
      return context.redirect(`${appendForwardSlash(joinPaths(base, defaultLocale))}`, statusCode);
    } else {
      return context.redirect(`${joinPaths(base, defaultLocale)}`, statusCode);
    }
  };
}
function notFound({ base, locales }) {
  return function(context, response) {
    if (response?.headers.get(REROUTE_DIRECTIVE_HEADER) === "no")
      return response;
    const url = context.url;
    const isRoot = url.pathname === base + "/" || url.pathname === base;
    if (!(isRoot || pathHasLocale(url.pathname, locales))) {
      if (response) {
        response.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
        return new Response(response.body, {
          status: 404,
          headers: response.headers
        });
      } else {
        return new Response(null, {
          status: 404,
          headers: {
            [REROUTE_DIRECTIVE_HEADER]: "no"
          }
        });
      }
    }
    return void 0;
  };
}
function redirectToFallback({
  fallback,
  locales,
  defaultLocale,
  strategy,
  base,
  fallbackType
}) {
  return async function(context, response) {
    if (response.status >= 300 && fallback) {
      const fallbackKeys = fallback ? Object.keys(fallback) : [];
      const segments = context.url.pathname.split("/");
      const urlLocale = segments.find((segment) => {
        for (const locale of locales) {
          if (typeof locale === "string") {
            if (locale === segment) {
              return true;
            }
          } else if (locale.path === segment) {
            return true;
          }
        }
        return false;
      });
      if (urlLocale && fallbackKeys.includes(urlLocale)) {
        const fallbackLocale = fallback[urlLocale];
        const pathFallbackLocale = getPathByLocale(fallbackLocale, locales);
        let newPathname;
        if (pathFallbackLocale === defaultLocale && strategy === "pathname-prefix-other-locales") {
          if (context.url.pathname.includes(`${base}`)) {
            newPathname = context.url.pathname.replace(`/${urlLocale}`, ``);
          } else {
            newPathname = context.url.pathname.replace(`/${urlLocale}`, `/`);
          }
        } else {
          newPathname = context.url.pathname.replace(`/${urlLocale}`, `/${pathFallbackLocale}`);
        }
        if (fallbackType === "rewrite") {
          return await context.rewrite(newPathname);
        } else {
          return context.redirect(newPathname);
        }
      }
    }
    return response;
  };
}
function parseLocale(header) {
  if (header === "*") {
    return [{ locale: header, qualityValue: void 0 }];
  }
  const result = [];
  const localeValues = header.split(",").map((str) => str.trim());
  for (const localeValue of localeValues) {
    const split = localeValue.split(";").map((str) => str.trim());
    const localeName = split[0];
    const qualityValue = split[1];
    if (!split) {
      continue;
    }
    if (qualityValue && qualityValue.startsWith("q=")) {
      const qualityValueAsFloat = Number.parseFloat(qualityValue.slice("q=".length));
      if (Number.isNaN(qualityValueAsFloat) || qualityValueAsFloat > 1) {
        result.push({
          locale: localeName,
          qualityValue: void 0
        });
      } else {
        result.push({
          locale: localeName,
          qualityValue: qualityValueAsFloat
        });
      }
    } else {
      result.push({
        locale: localeName,
        qualityValue: void 0
      });
    }
  }
  return result;
}
function sortAndFilterLocales(browserLocaleList, locales) {
  const normalizedLocales = toCodes(locales).map(normalizeTheLocale);
  return browserLocaleList.filter((browserLocale) => {
    if (browserLocale.locale !== "*") {
      return normalizedLocales.includes(normalizeTheLocale(browserLocale.locale));
    }
    return true;
  }).sort((a, b) => {
    if (a.qualityValue && b.qualityValue) {
      return Math.sign(b.qualityValue - a.qualityValue);
    }
    return 0;
  });
}
function computePreferredLocale(request, locales) {
  const acceptHeader = request.headers.get("Accept-Language");
  let result = void 0;
  if (acceptHeader) {
    const browserLocaleList = sortAndFilterLocales(parseLocale(acceptHeader), locales);
    const firstResult = browserLocaleList.at(0);
    if (firstResult && firstResult.locale !== "*") {
      for (const currentLocale of locales) {
        if (typeof currentLocale === "string") {
          if (normalizeTheLocale(currentLocale) === normalizeTheLocale(firstResult.locale)) {
            result = currentLocale;
          }
        } else {
          for (const currentCode of currentLocale.codes) {
            if (normalizeTheLocale(currentCode) === normalizeTheLocale(firstResult.locale)) {
              result = currentLocale.path;
            }
          }
        }
      }
    }
  }
  return result;
}
function computePreferredLocaleList(request, locales) {
  const acceptHeader = request.headers.get("Accept-Language");
  let result = [];
  if (acceptHeader) {
    const browserLocaleList = sortAndFilterLocales(parseLocale(acceptHeader), locales);
    if (browserLocaleList.length === 1 && browserLocaleList.at(0).locale === "*") {
      return locales.map((locale) => {
        if (typeof locale === "string") {
          return locale;
        } else {
          return locale.codes.at(0);
        }
      });
    } else if (browserLocaleList.length > 0) {
      for (const browserLocale of browserLocaleList) {
        for (const loopLocale of locales) {
          if (typeof loopLocale === "string") {
            if (normalizeTheLocale(loopLocale) === normalizeTheLocale(browserLocale.locale)) {
              result.push(loopLocale);
            }
          } else {
            for (const code of loopLocale.codes) {
              if (code === browserLocale.locale) {
                result.push(loopLocale.path);
              }
            }
          }
        }
      }
    }
  }
  return result;
}
function computeCurrentLocale(pathname, locales, defaultLocale) {
  for (const segment of pathname.split("/")) {
    for (const locale of locales) {
      if (typeof locale === "string") {
        if (!segment.includes(locale))
          continue;
        if (normalizeTheLocale(locale) === normalizeTheLocale(segment)) {
          return locale;
        }
      } else {
        if (locale.path === segment) {
          return locale.codes.at(0);
        } else {
          for (const code of locale.codes) {
            if (normalizeTheLocale(code) === normalizeTheLocale(segment)) {
              return code;
            }
          }
        }
      }
    }
  }
  for (const locale of locales) {
    if (typeof locale === "string") {
      if (locale === defaultLocale) {
        return locale;
      }
    } else {
      if (locale.path === defaultLocale) {
        return locale.codes.at(0);
      }
    }
  }
}
function parse2(str, opt) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  var obj = {};
  var len = str.length;
  if (len < 2)
    return obj;
  var dec = opt && opt.decode || decode;
  var index = 0;
  var eqIdx = 0;
  var endIdx = 0;
  do {
    eqIdx = str.indexOf("=", index);
    if (eqIdx === -1)
      break;
    endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = len;
    } else if (eqIdx > endIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    var keyStartIdx = startIndex(str, index, eqIdx);
    var keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
    var key = str.slice(keyStartIdx, keyEndIdx);
    if (!__hasOwnProperty.call(obj, key)) {
      var valStartIdx = startIndex(str, eqIdx + 1, endIdx);
      var valEndIdx = endIndex(str, endIdx, valStartIdx);
      if (str.charCodeAt(valStartIdx) === 34 && str.charCodeAt(valEndIdx - 1) === 34) {
        valStartIdx++;
        valEndIdx--;
      }
      var val = str.slice(valStartIdx, valEndIdx);
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  } while (index < len);
  return obj;
}
function startIndex(str, index, max) {
  do {
    var code = str.charCodeAt(index);
    if (code !== 32 && code !== 9)
      return index;
  } while (++index < max);
  return max;
}
function endIndex(str, index, min) {
  while (index > min) {
    var code = str.charCodeAt(--index);
    if (code !== 32 && code !== 9)
      return index + 1;
  }
  return min;
}
function serialize(name, val, opt) {
  var enc = opt && opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!cookieNameRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  var value = enc(val);
  if (!cookieValueRegExp.test(value)) {
    throw new TypeError("argument val is invalid");
  }
  var str = name + "=" + value;
  if (!opt)
    return str;
  if (null != opt.maxAge) {
    var maxAge = Math.floor(opt.maxAge);
    if (!isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + maxAge;
  }
  if (opt.domain) {
    if (!domainValueRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!pathValueRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    var expires = opt.expires;
    if (!isDate(expires) || isNaN(expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  if (opt.priority) {
    var priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low":
        str += "; Priority=Low";
        break;
      case "medium":
        str += "; Priority=Medium";
        break;
      case "high":
        str += "; Priority=High";
        break;
      default:
        throw new TypeError("option priority is invalid");
    }
  }
  if (opt.sameSite) {
    var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true:
        str += "; SameSite=Strict";
        break;
      case "lax":
        str += "; SameSite=Lax";
        break;
      case "strict":
        str += "; SameSite=Strict";
        break;
      case "none":
        str += "; SameSite=None";
        break;
      default:
        throw new TypeError("option sameSite is invalid");
    }
  }
  return str;
}
function decode(str) {
  return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
}
function isDate(val) {
  return __toString.call(val) === "[object Date]";
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch (e) {
    return str;
  }
}
function attachCookiesToResponse(response, cookies) {
  Reflect.set(response, astroCookiesSymbol, cookies);
}
function getCookiesFromResponse(response) {
  let cookies = Reflect.get(response, astroCookiesSymbol);
  if (cookies != null) {
    return cookies;
  } else {
    return void 0;
  }
}
function* getSetCookiesFromResponse(response) {
  const cookies = getCookiesFromResponse(response);
  if (!cookies) {
    return [];
  }
  for (const headerValue of AstroCookies.consume(cookies)) {
    yield headerValue;
  }
  return [];
}
async function callMiddleware(onRequest2, apiContext, responseFunction) {
  let nextCalled = false;
  let responseFunctionPromise = void 0;
  const next = /* @__PURE__ */ __name(async (payload) => {
    nextCalled = true;
    responseFunctionPromise = responseFunction(apiContext, payload);
    return responseFunctionPromise;
  }, "next");
  let middlewarePromise = onRequest2(apiContext, next);
  return await Promise.resolve(middlewarePromise).then(async (value) => {
    if (nextCalled) {
      if (typeof value !== "undefined") {
        if (value instanceof Response === false) {
          throw new AstroError(MiddlewareNotAResponse);
        }
        return value;
      } else {
        if (responseFunctionPromise) {
          return responseFunctionPromise;
        } else {
          throw new AstroError(MiddlewareNotAResponse);
        }
      }
    } else if (typeof value === "undefined") {
      throw new AstroError(MiddlewareNoDataOrNextCalled);
    } else if (value instanceof Response === false) {
      throw new AstroError(MiddlewareNotAResponse);
    } else {
      return value;
    }
  });
}
async function renderRedirect(renderContext) {
  const {
    request: { method },
    routeData
  } = renderContext;
  const { redirect, redirectRoute } = routeData;
  const status = redirectRoute && typeof redirect === "object" ? redirect.status : method === "GET" ? 301 : 308;
  const headers = { location: encodeURI(redirectRouteGenerate(renderContext)) };
  return new Response(null, { status, headers });
}
function redirectRouteGenerate(renderContext) {
  const {
    params,
    routeData: { redirect, redirectRoute }
  } = renderContext;
  if (typeof redirectRoute !== "undefined") {
    return redirectRoute?.generate(params) || redirectRoute?.pathname || "/";
  } else if (typeof redirect === "string") {
    let target = redirect;
    for (const param of Object.keys(params)) {
      const paramValue = params[param];
      target = target.replace(`[${param}]`, paramValue).replace(`[...${param}]`, paramValue);
    }
    return target;
  } else if (typeof redirect === "undefined") {
    return "/";
  }
  return redirect.destination;
}
function validateGetStaticPathsParameter([key, value], route) {
  if (!VALID_PARAM_TYPES.includes(typeof value)) {
    throw new AstroError({
      ...GetStaticPathsInvalidRouteParam,
      message: GetStaticPathsInvalidRouteParam.message(key, value, typeof value),
      location: {
        file: route
      }
    });
  }
}
function validateDynamicRouteModule(mod, {
  ssr,
  route
}) {
  if ((!ssr || route.prerender) && !mod.getStaticPaths) {
    throw new AstroError({
      ...GetStaticPathsRequired,
      location: { file: route.component }
    });
  }
}
function validateGetStaticPathsResult(result, logger, route) {
  if (!Array.isArray(result)) {
    throw new AstroError({
      ...InvalidGetStaticPathsReturn,
      message: InvalidGetStaticPathsReturn.message(typeof result),
      location: {
        file: route.component
      }
    });
  }
  result.forEach((pathObject) => {
    if (typeof pathObject === "object" && Array.isArray(pathObject) || pathObject === null) {
      throw new AstroError({
        ...InvalidGetStaticPathsEntry,
        message: InvalidGetStaticPathsEntry.message(
          Array.isArray(pathObject) ? "array" : typeof pathObject
        )
      });
    }
    if (pathObject.params === void 0 || pathObject.params === null || pathObject.params && Object.keys(pathObject.params).length === 0) {
      throw new AstroError({
        ...GetStaticPathsExpectedParams,
        location: {
          file: route.component
        }
      });
    }
    for (const [key, val] of Object.entries(pathObject.params)) {
      if (!(typeof val === "undefined" || typeof val === "string" || typeof val === "number")) {
        logger.warn(
          "router",
          `getStaticPaths() returned an invalid path param: "${key}". A string, number or undefined value was expected, but got \`${JSON.stringify(
            val
          )}\`.`
        );
      }
      if (typeof val === "string" && val === "") {
        logger.warn(
          "router",
          `getStaticPaths() returned an invalid path param: "${key}". \`undefined\` expected for an optional param, but got empty string.`
        );
      }
    }
  });
}
function stringifyParams(params, route) {
  const validatedParams = Object.entries(params).reduce((acc, next) => {
    validateGetStaticPathsParameter(next, route.component);
    const [key, value] = next;
    if (value !== void 0) {
      acc[key] = typeof value === "string" ? trimSlashes(value) : value.toString();
    }
    return acc;
  }, {});
  return route.generate(validatedParams);
}
function generatePaginateFunction(routeMatch) {
  return /* @__PURE__ */ __name(function paginateUtility(data, args = {}) {
    let { pageSize: _pageSize, params: _params, props: _props } = args;
    const pageSize = _pageSize || 10;
    const paramName = "page";
    const additionalParams = _params || {};
    const additionalProps = _props || {};
    let includesFirstPageNumber;
    if (routeMatch.params.includes(`...${paramName}`)) {
      includesFirstPageNumber = false;
    } else if (routeMatch.params.includes(`${paramName}`)) {
      includesFirstPageNumber = true;
    } else {
      throw new AstroError({
        ...PageNumberParamNotFound,
        message: PageNumberParamNotFound.message(paramName)
      });
    }
    const lastPage = Math.max(1, Math.ceil(data.length / pageSize));
    const result = [...Array(lastPage).keys()].map((num) => {
      const pageNum = num + 1;
      const start = pageSize === Infinity ? 0 : (pageNum - 1) * pageSize;
      const end = Math.min(start + pageSize, data.length);
      const params = {
        ...additionalParams,
        [paramName]: includesFirstPageNumber || pageNum > 1 ? String(pageNum) : void 0
      };
      const current = correctIndexRoute(routeMatch.generate({ ...params }));
      const next = pageNum === lastPage ? void 0 : correctIndexRoute(routeMatch.generate({ ...params, page: String(pageNum + 1) }));
      const prev = pageNum === 1 ? void 0 : correctIndexRoute(
        routeMatch.generate({
          ...params,
          page: !includesFirstPageNumber && pageNum - 1 === 1 ? void 0 : String(pageNum - 1)
        })
      );
      const first = pageNum === 1 ? void 0 : correctIndexRoute(
        routeMatch.generate({
          ...params,
          page: includesFirstPageNumber ? "1" : void 0
        })
      );
      const last = pageNum === lastPage ? void 0 : correctIndexRoute(routeMatch.generate({ ...params, page: String(lastPage) }));
      return {
        params,
        props: {
          ...additionalProps,
          page: {
            data: data.slice(start, end),
            start,
            end: end - 1,
            size: pageSize,
            total: data.length,
            currentPage: pageNum,
            lastPage,
            url: { current, next, prev, first, last }
          }
        }
      };
    });
    return result;
  }, "paginateUtility");
}
function correctIndexRoute(route) {
  if (route === "") {
    return "/";
  }
  return route;
}
async function callGetStaticPaths({
  mod,
  route,
  routeCache,
  logger,
  ssr
}) {
  const cached = routeCache.get(route);
  if (!mod) {
    throw new Error("This is an error caused by Astro and not your code. Please file an issue.");
  }
  if (cached?.staticPaths) {
    return cached.staticPaths;
  }
  validateDynamicRouteModule(mod, { ssr, route });
  if (ssr && !route.prerender) {
    const entry = Object.assign([], { keyed: /* @__PURE__ */ new Map() });
    routeCache.set(route, { ...cached, staticPaths: entry });
    return entry;
  }
  let staticPaths = [];
  if (!mod.getStaticPaths) {
    throw new Error("Unexpected Error.");
  }
  staticPaths = await mod.getStaticPaths({
    // Q: Why the cast?
    // A: So users downstream can have nicer typings, we have to make some sacrifice in our internal typings, which necessitate a cast here
    paginate: generatePaginateFunction(route)
  });
  validateGetStaticPathsResult(staticPaths, logger, route);
  const keyedStaticPaths = staticPaths;
  keyedStaticPaths.keyed = /* @__PURE__ */ new Map();
  for (const sp of keyedStaticPaths) {
    const paramsKey = stringifyParams(sp.params, route);
    keyedStaticPaths.keyed.set(paramsKey, sp);
  }
  routeCache.set(route, { ...cached, staticPaths: keyedStaticPaths });
  return keyedStaticPaths;
}
function findPathItemByKey(staticPaths, params, route, logger) {
  const paramsKey = stringifyParams(params, route);
  const matchedStaticPath = staticPaths.keyed.get(paramsKey);
  if (matchedStaticPath) {
    return matchedStaticPath;
  }
  logger.debug("router", `findPathItemByKey() - Unexpected cache miss looking for ${paramsKey}`);
}
function routeIsRedirect(route) {
  return route?.type === "redirect";
}
function routeIsFallback(route) {
  return route?.type === "fallback";
}
async function getProps(opts) {
  const { logger, mod, routeData: route, routeCache, pathname, serverLike } = opts;
  if (!route || route.pathname) {
    return {};
  }
  if (routeIsRedirect(route) || routeIsFallback(route) || route.component === DEFAULT_404_COMPONENT) {
    return {};
  }
  const staticPaths = await callGetStaticPaths({
    mod,
    route,
    routeCache,
    logger,
    ssr: serverLike
  });
  const params = getParams(route, pathname);
  const matchedStaticPath = findPathItemByKey(staticPaths, params, route, logger);
  if (!matchedStaticPath && (serverLike ? route.prerender : true)) {
    throw new AstroError({
      ...NoMatchingStaticPathFound,
      message: NoMatchingStaticPathFound.message(pathname),
      hint: NoMatchingStaticPathFound.hint([route.component])
    });
  }
  if (mod) {
    validatePrerenderEndpointCollision(route, mod, params);
  }
  const props = matchedStaticPath?.props ? { ...matchedStaticPath.props } : {};
  return props;
}
function getParams(route, pathname) {
  if (!route.params.length)
    return {};
  const paramsMatch = route.pattern.exec(decodeURIComponent(pathname));
  if (!paramsMatch)
    return {};
  const params = {};
  route.params.forEach((key, i) => {
    if (key.startsWith("...")) {
      params[key.slice(3)] = paramsMatch[i + 1] ? paramsMatch[i + 1] : void 0;
    } else {
      params[key] = paramsMatch[i + 1];
    }
  });
  return params;
}
function validatePrerenderEndpointCollision(route, mod, params) {
  if (route.type === "endpoint" && mod.getStaticPaths) {
    const lastSegment = route.segments[route.segments.length - 1];
    const paramValues = Object.values(params);
    const lastParam = paramValues[paramValues.length - 1];
    if (lastSegment.length === 1 && lastSegment[0].dynamic && lastParam === void 0) {
      throw new AstroError({
        ...PrerenderDynamicEndpointPathCollide,
        message: PrerenderDynamicEndpointPathCollide.message(route.route),
        hint: PrerenderDynamicEndpointPathCollide.hint(route.component),
        location: {
          file: route.component
        }
      });
    }
  }
}
function getFunctionExpression(slot) {
  if (!slot)
    return;
  const expressions = slot?.expressions?.filter((e) => isRenderInstruction(e) === false);
  if (expressions?.length !== 1)
    return;
  return expressions[0];
}
function matchRoute(pathname, manifest2) {
  const decodedPathname = decodeURI(pathname);
  return manifest2.routes.find((route) => {
    return route.pattern.test(decodedPathname) || route.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(decodedPathname));
  });
}
function isRoute404or500(route) {
  return route.pattern.test("/404") || route.pattern.test("/500");
}
function findRouteToRewrite({
  payload,
  routes: routes2,
  request,
  trailingSlash,
  buildFormat,
  base
}) {
  let newUrl = void 0;
  if (payload instanceof URL) {
    newUrl = payload;
  } else if (payload instanceof Request) {
    newUrl = new URL(payload.url);
  } else {
    newUrl = new URL(payload, new URL(request.url).origin);
  }
  let pathname = newUrl.pathname;
  if (base !== "/" && newUrl.pathname.startsWith(base)) {
    pathname = shouldAppendForwardSlash(trailingSlash, buildFormat) ? appendForwardSlash(newUrl.pathname) : removeTrailingForwardSlash(newUrl.pathname);
    pathname = pathname.slice(base.length);
  }
  let foundRoute;
  for (const route of routes2) {
    if (route.pattern.test(decodeURI(pathname))) {
      foundRoute = route;
      break;
    }
  }
  if (foundRoute) {
    return {
      routeData: foundRoute,
      newUrl,
      pathname
    };
  } else {
    const custom404 = routes2.find((route) => route.route === "/404");
    if (custom404) {
      return { routeData: custom404, newUrl, pathname };
    } else {
      return { routeData: DEFAULT_404_ROUTE, newUrl, pathname };
    }
  }
}
function copyRequest(newUrl, oldRequest) {
  if (oldRequest.bodyUsed) {
    throw new AstroError(RewriteWithBodyUsed);
  }
  return new Request(newUrl, {
    method: oldRequest.method,
    headers: oldRequest.headers,
    body: oldRequest.body,
    referrer: oldRequest.referrer,
    referrerPolicy: oldRequest.referrerPolicy,
    mode: oldRequest.mode,
    credentials: oldRequest.credentials,
    cache: oldRequest.cache,
    redirect: oldRequest.redirect,
    integrity: oldRequest.integrity,
    signal: oldRequest.signal,
    keepalive: oldRequest.keepalive,
    // https://fetch.spec.whatwg.org/#dom-request-duplex
    // @ts-expect-error It isn't part of the types, but undici accepts it and it allows to carry over the body to a new request
    duplex: "half"
  });
}
function setOriginPathname(request, pathname) {
  Reflect.set(request, originPathnameSymbol, encodeURIComponent(pathname));
}
function sequence(...handlers) {
  const filtered = handlers.filter((h) => !!h);
  const length = filtered.length;
  if (!length) {
    return defineMiddleware((_context, next) => {
      return next();
    });
  }
  return defineMiddleware((context, next) => {
    let carriedPayload = void 0;
    return applyHandle(0, context);
    function applyHandle(i, handleContext) {
      const handle = filtered[i];
      const result = handle(handleContext, async (payload) => {
        if (i < length - 1) {
          if (payload) {
            let newRequest;
            if (payload instanceof Request) {
              newRequest = payload;
            } else if (payload instanceof URL) {
              newRequest = new Request(payload, handleContext.request);
            } else {
              newRequest = new Request(
                new URL(payload, handleContext.url.origin),
                handleContext.request
              );
            }
            const pipeline = Reflect.get(handleContext, apiContextRoutesSymbol);
            const { routeData, pathname } = await pipeline.tryRewrite(
              payload,
              handleContext.request
            );
            carriedPayload = payload;
            handleContext.request = newRequest;
            handleContext.url = new URL(newRequest.url);
            handleContext.cookies = new AstroCookies(newRequest);
            handleContext.params = getParams(routeData, pathname);
          }
          return applyHandle(i + 1, handleContext);
        } else {
          return next(payload ?? carriedPayload);
        }
      });
      return result;
    }
    __name(applyHandle, "applyHandle");
  });
}
function defineMiddleware(fn) {
  return fn;
}
var ACTION_API_CONTEXT_SYMBOL, parse_1, serialize_1, __toString, __hasOwnProperty, cookieNameRegExp, cookieValueRegExp, domainValueRegExp, pathValueRegExp, DELETED_EXPIRATION, DELETED_VALUE, responseSentSymbol2, AstroCookie, AstroCookies, astroCookiesSymbol, VALID_PARAM_TYPES, RouteCache, Slots, apiContextRoutesSymbol, RenderContext;
var init_index_CGzEFjN = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/index_CGzEFjN-.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_astro_designed_error_pages_CROwsZzW();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    ACTION_API_CONTEXT_SYMBOL = Symbol.for("astro.actionAPIContext");
    __name(hasActionPayload, "hasActionPayload");
    __name(createGetActionResult, "createGetActionResult");
    __name(createCallAction, "createCallAction");
    __name(appendForwardSlash, "appendForwardSlash");
    __name(prependForwardSlash, "prependForwardSlash");
    __name(removeTrailingForwardSlash, "removeTrailingForwardSlash");
    __name(removeLeadingForwardSlash, "removeLeadingForwardSlash");
    __name(trimSlashes, "trimSlashes");
    __name(isString, "isString");
    __name(joinPaths, "joinPaths");
    __name(slash, "slash");
    __name(fileExtension, "fileExtension");
    __name(shouldAppendForwardSlash, "shouldAppendForwardSlash");
    __name(requestHasLocale, "requestHasLocale");
    __name(requestIs404Or500, "requestIs404Or500");
    __name(pathHasLocale, "pathHasLocale");
    __name(getPathByLocale, "getPathByLocale");
    __name(normalizeTheLocale, "normalizeTheLocale");
    __name(toCodes, "toCodes");
    __name(redirectToDefaultLocale, "redirectToDefaultLocale");
    __name(notFound, "notFound");
    __name(redirectToFallback, "redirectToFallback");
    __name(parseLocale, "parseLocale");
    __name(sortAndFilterLocales, "sortAndFilterLocales");
    __name(computePreferredLocale, "computePreferredLocale");
    __name(computePreferredLocaleList, "computePreferredLocaleList");
    __name(computeCurrentLocale, "computeCurrentLocale");
    parse_1 = parse2;
    serialize_1 = serialize;
    __toString = Object.prototype.toString;
    __hasOwnProperty = Object.prototype.hasOwnProperty;
    cookieNameRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
    cookieValueRegExp = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/;
    domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    __name(parse2, "parse");
    __name(startIndex, "startIndex");
    __name(endIndex, "endIndex");
    __name(serialize, "serialize");
    __name(decode, "decode");
    __name(isDate, "isDate");
    __name(tryDecode, "tryDecode");
    DELETED_EXPIRATION = /* @__PURE__ */ new Date(0);
    DELETED_VALUE = "deleted";
    responseSentSymbol2 = Symbol.for("astro.responseSent");
    AstroCookie = class {
      constructor(value) {
        this.value = value;
      }
      json() {
        if (this.value === void 0) {
          throw new Error(`Cannot convert undefined to an object.`);
        }
        return JSON.parse(this.value);
      }
      number() {
        return Number(this.value);
      }
      boolean() {
        if (this.value === "false")
          return false;
        if (this.value === "0")
          return false;
        return Boolean(this.value);
      }
    };
    __name(AstroCookie, "AstroCookie");
    AstroCookies = class {
      #request;
      #requestValues;
      #outgoing;
      #consumed;
      constructor(request) {
        this.#request = request;
        this.#requestValues = null;
        this.#outgoing = null;
        this.#consumed = false;
      }
      /**
       * Astro.cookies.delete(key) is used to delete a cookie. Using this method will result
       * in a Set-Cookie header added to the response.
       * @param key The cookie to delete
       * @param options Options related to this deletion, such as the path of the cookie.
       */
      delete(key, options) {
        const {
          // @ts-expect-error
          maxAge: _ignoredMaxAge,
          // @ts-expect-error
          expires: _ignoredExpires,
          ...sanitizedOptions
        } = options || {};
        const serializeOptions = {
          expires: DELETED_EXPIRATION,
          ...sanitizedOptions
        };
        this.#ensureOutgoingMap().set(key, [
          DELETED_VALUE,
          serialize_1(key, DELETED_VALUE, serializeOptions),
          false
        ]);
      }
      /**
       * Astro.cookies.get(key) is used to get a cookie value. The cookie value is read from the
       * request. If you have set a cookie via Astro.cookies.set(key, value), the value will be taken
       * from that set call, overriding any values already part of the request.
       * @param key The cookie to get.
       * @returns An object containing the cookie value as well as convenience methods for converting its value.
       */
      get(key, options = void 0) {
        if (this.#outgoing?.has(key)) {
          let [serializedValue, , isSetValue] = this.#outgoing.get(key);
          if (isSetValue) {
            return new AstroCookie(serializedValue);
          } else {
            return void 0;
          }
        }
        const values = this.#ensureParsed(options);
        if (key in values) {
          const value = values[key];
          return new AstroCookie(value);
        }
      }
      /**
       * Astro.cookies.has(key) returns a boolean indicating whether this cookie is either
       * part of the initial request or set via Astro.cookies.set(key)
       * @param key The cookie to check for.
       * @returns
       */
      has(key, options = void 0) {
        if (this.#outgoing?.has(key)) {
          let [, , isSetValue] = this.#outgoing.get(key);
          return isSetValue;
        }
        const values = this.#ensureParsed(options);
        return !!values[key];
      }
      /**
       * Astro.cookies.set(key, value) is used to set a cookie's value. If provided
       * an object it will be stringified via JSON.stringify(value). Additionally you
       * can provide options customizing how this cookie will be set, such as setting httpOnly
       * in order to prevent the cookie from being read in client-side JavaScript.
       * @param key The name of the cookie to set.
       * @param value A value, either a string or other primitive or an object.
       * @param options Options for the cookie, such as the path and security settings.
       */
      set(key, value, options) {
        if (this.#consumed) {
          const warning = new Error(
            "Astro.cookies.set() was called after the cookies had already been sent to the browser.\nThis may have happened if this method was called in an imported component.\nPlease make sure that Astro.cookies.set() is only called in the frontmatter of the main page."
          );
          warning.name = "Warning";
          console.warn(warning);
        }
        let serializedValue;
        if (typeof value === "string") {
          serializedValue = value;
        } else {
          let toStringValue = value.toString();
          if (toStringValue === Object.prototype.toString.call(value)) {
            serializedValue = JSON.stringify(value);
          } else {
            serializedValue = toStringValue;
          }
        }
        const serializeOptions = {};
        if (options) {
          Object.assign(serializeOptions, options);
        }
        this.#ensureOutgoingMap().set(key, [
          serializedValue,
          serialize_1(key, serializedValue, serializeOptions),
          true
        ]);
        if (this.#request[responseSentSymbol2]) {
          throw new AstroError({
            ...ResponseSentError
          });
        }
      }
      /**
       * Merges a new AstroCookies instance into the current instance. Any new cookies
       * will be added to the current instance, overwriting any existing cookies with the same name.
       */
      merge(cookies) {
        const outgoing = cookies.#outgoing;
        if (outgoing) {
          for (const [key, value] of outgoing) {
            this.#ensureOutgoingMap().set(key, value);
          }
        }
      }
      /**
       * Astro.cookies.header() returns an iterator for the cookies that have previously
       * been set by either Astro.cookies.set() or Astro.cookies.delete().
       * This method is primarily used by adapters to set the header on outgoing responses.
       * @returns
       */
      *headers() {
        if (this.#outgoing == null)
          return;
        for (const [, value] of this.#outgoing) {
          yield value[1];
        }
      }
      /**
       * Behaves the same as AstroCookies.prototype.headers(),
       * but allows a warning when cookies are set after the instance is consumed.
       */
      static consume(cookies) {
        cookies.#consumed = true;
        return cookies.headers();
      }
      #ensureParsed(options = void 0) {
        if (!this.#requestValues) {
          this.#parse(options);
        }
        if (!this.#requestValues) {
          this.#requestValues = {};
        }
        return this.#requestValues;
      }
      #ensureOutgoingMap() {
        if (!this.#outgoing) {
          this.#outgoing = /* @__PURE__ */ new Map();
        }
        return this.#outgoing;
      }
      #parse(options = void 0) {
        const raw = this.#request.headers.get("cookie");
        if (!raw) {
          return;
        }
        this.#requestValues = parse_1(raw, options);
      }
    };
    __name(AstroCookies, "AstroCookies");
    astroCookiesSymbol = Symbol.for("astro.cookies");
    __name(attachCookiesToResponse, "attachCookiesToResponse");
    __name(getCookiesFromResponse, "getCookiesFromResponse");
    __name(getSetCookiesFromResponse, "getSetCookiesFromResponse");
    __name(callMiddleware, "callMiddleware");
    __name(renderRedirect, "renderRedirect");
    __name(redirectRouteGenerate, "redirectRouteGenerate");
    VALID_PARAM_TYPES = ["string", "number", "undefined"];
    __name(validateGetStaticPathsParameter, "validateGetStaticPathsParameter");
    __name(validateDynamicRouteModule, "validateDynamicRouteModule");
    __name(validateGetStaticPathsResult, "validateGetStaticPathsResult");
    __name(stringifyParams, "stringifyParams");
    __name(generatePaginateFunction, "generatePaginateFunction");
    __name(correctIndexRoute, "correctIndexRoute");
    __name(callGetStaticPaths, "callGetStaticPaths");
    RouteCache = class {
      logger;
      cache = {};
      mode;
      constructor(logger, mode = "production") {
        this.logger = logger;
        this.mode = mode;
      }
      /** Clear the cache. */
      clearAll() {
        this.cache = {};
      }
      set(route, entry) {
        const key = this.key(route);
        if (this.mode === "production" && this.cache[key]?.staticPaths) {
          this.logger.warn(null, `Internal Warning: route cache overwritten. (${key})`);
        }
        this.cache[key] = entry;
      }
      get(route) {
        return this.cache[this.key(route)];
      }
      key(route) {
        return `${route.route}_${route.component}`;
      }
    };
    __name(RouteCache, "RouteCache");
    __name(findPathItemByKey, "findPathItemByKey");
    __name(routeIsRedirect, "routeIsRedirect");
    __name(routeIsFallback, "routeIsFallback");
    __name(getProps, "getProps");
    __name(getParams, "getParams");
    __name(validatePrerenderEndpointCollision, "validatePrerenderEndpointCollision");
    __name(getFunctionExpression, "getFunctionExpression");
    Slots = class {
      #result;
      #slots;
      #logger;
      constructor(result, slots, logger) {
        this.#result = result;
        this.#slots = slots;
        this.#logger = logger;
        if (slots) {
          for (const key of Object.keys(slots)) {
            if (this[key] !== void 0) {
              throw new AstroError({
                ...ReservedSlotName,
                message: ReservedSlotName.message(key)
              });
            }
            Object.defineProperty(this, key, {
              get() {
                return true;
              },
              enumerable: true
            });
          }
        }
      }
      has(name) {
        if (!this.#slots)
          return false;
        return Boolean(this.#slots[name]);
      }
      async render(name, args = []) {
        if (!this.#slots || !this.has(name))
          return;
        const result = this.#result;
        if (!Array.isArray(args)) {
          this.#logger.warn(
            null,
            `Expected second parameter to be an array, received a ${typeof args}. If you're trying to pass an array as a single argument and getting unexpected results, make sure you're passing your array as a item of an array. Ex: Astro.slots.render('default', [["Hello", "World"]])`
          );
        } else if (args.length > 0) {
          const slotValue = this.#slots[name];
          const component = typeof slotValue === "function" ? await slotValue(result) : await slotValue;
          const expression = getFunctionExpression(component);
          if (expression) {
            const slot = /* @__PURE__ */ __name(async () => typeof expression === "function" ? expression(...args) : expression, "slot");
            return await renderSlotToString(result, slot).then((res) => {
              return res;
            });
          }
          if (typeof component === "function") {
            return await renderJSX(result, component(...args)).then(
              (res) => res != null ? String(res) : res
            );
          }
        }
        const content = await renderSlotToString(result, this.#slots[name]);
        const outHTML = chunkToString(result, content);
        return outHTML;
      }
    };
    __name(Slots, "Slots");
    __name(matchRoute, "matchRoute");
    __name(isRoute404or500, "isRoute404or500");
    __name(findRouteToRewrite, "findRouteToRewrite");
    __name(copyRequest, "copyRequest");
    __name(setOriginPathname, "setOriginPathname");
    apiContextRoutesSymbol = Symbol.for("context.routes");
    RenderContext = class {
      constructor(pipeline, locals, middleware, pathname, request, routeData, status, cookies = new AstroCookies(request), params = getParams(routeData, pathname), url = new URL(request.url), props = {}, partial = void 0) {
        this.pipeline = pipeline;
        this.locals = locals;
        this.middleware = middleware;
        this.pathname = pathname;
        this.request = request;
        this.routeData = routeData;
        this.status = status;
        this.cookies = cookies;
        this.params = params;
        this.url = url;
        this.props = props;
        this.partial = partial;
      }
      /**
       * A flag that tells the render content if the rewriting was triggered
       */
      isRewriting = false;
      /**
       * A safety net in case of loops
       */
      counter = 0;
      static async create({
        locals = {},
        middleware,
        pathname,
        pipeline,
        request,
        routeData,
        status = 200,
        props,
        partial = void 0
      }) {
        const pipelineMiddleware = await pipeline.getMiddleware();
        setOriginPathname(request, pathname);
        return new RenderContext(
          pipeline,
          locals,
          sequence(...pipeline.internalMiddleware, middleware ?? pipelineMiddleware),
          pathname,
          request,
          routeData,
          status,
          void 0,
          void 0,
          void 0,
          props,
          partial
        );
      }
      /**
       * The main function of the RenderContext.
       *
       * Use this function to render any route known to Astro.
       * It attempts to render a route. A route can be a:
       *
       * - page
       * - redirect
       * - endpoint
       * - fallback
       */
      async render(componentInstance, slots = {}) {
        const { cookies, middleware, pipeline } = this;
        const { logger, serverLike, streaming } = pipeline;
        const isPrerendered = !serverLike || this.routeData.prerender;
        const props = Object.keys(this.props).length > 0 ? this.props : await getProps({
          mod: componentInstance,
          routeData: this.routeData,
          routeCache: this.pipeline.routeCache,
          pathname: this.pathname,
          logger,
          serverLike
        });
        const apiContext = this.createAPIContext(props, isPrerendered);
        this.counter++;
        if (this.counter === 4) {
          return new Response("Loop Detected", {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/508
            status: 508,
            statusText: "Astro detected a loop where you tried to call the rewriting logic more than four times."
          });
        }
        const lastNext = /* @__PURE__ */ __name(async (ctx, payload) => {
          if (payload) {
            pipeline.logger.debug("router", "Called rewriting to:", payload);
            const {
              routeData,
              componentInstance: newComponent,
              pathname,
              newUrl
            } = await pipeline.tryRewrite(payload, this.request);
            this.routeData = routeData;
            componentInstance = newComponent;
            if (payload instanceof Request) {
              this.request = payload;
            } else {
              this.request = copyRequest(newUrl, this.request);
            }
            this.isRewriting = true;
            this.url = new URL(this.request.url);
            this.cookies = new AstroCookies(this.request);
            this.params = getParams(routeData, pathname);
            this.pathname = pathname;
            this.status = 200;
          }
          let response2;
          switch (this.routeData.type) {
            case "endpoint": {
              response2 = await renderEndpoint(componentInstance, ctx, serverLike, logger);
              break;
            }
            case "redirect":
              return renderRedirect(this);
            case "page": {
              const result = await this.createResult(componentInstance);
              try {
                response2 = await renderPage(
                  result,
                  componentInstance?.default,
                  props,
                  slots,
                  streaming,
                  this.routeData
                );
              } catch (e) {
                result.cancelled = true;
                throw e;
              }
              response2.headers.set(ROUTE_TYPE_HEADER, "page");
              if (this.routeData.route === "/404" || this.routeData.route === "/500") {
                response2.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
              }
              if (this.isRewriting) {
                response2.headers.set(REWRITE_DIRECTIVE_HEADER_KEY, REWRITE_DIRECTIVE_HEADER_VALUE);
              }
              break;
            }
            case "fallback": {
              return new Response(null, { status: 500, headers: { [ROUTE_TYPE_HEADER]: "fallback" } });
            }
          }
          const responseCookies = getCookiesFromResponse(response2);
          if (responseCookies) {
            cookies.merge(responseCookies);
          }
          return response2;
        }, "lastNext");
        const response = await callMiddleware(middleware, apiContext, lastNext);
        if (response.headers.get(ROUTE_TYPE_HEADER)) {
          response.headers.delete(ROUTE_TYPE_HEADER);
        }
        attachCookiesToResponse(response, cookies);
        return response;
      }
      createAPIContext(props, isPrerendered) {
        const context = this.createActionAPIContext();
        const redirect = /* @__PURE__ */ __name((path, status = 302) => new Response(null, { status, headers: { Location: path } }), "redirect");
        Reflect.set(context, apiContextRoutesSymbol, this.pipeline);
        return Object.assign(context, {
          props,
          redirect,
          getActionResult: createGetActionResult(context.locals),
          callAction: createCallAction(context),
          // Used internally by Actions middleware.
          // TODO: discuss exposing this information from APIContext.
          // middleware runs on prerendered routes in the dev server,
          // so this is useful information to have.
          _isPrerendered: isPrerendered
        });
      }
      async #executeRewrite(reroutePayload) {
        this.pipeline.logger.debug("router", "Calling rewrite: ", reroutePayload);
        const { routeData, componentInstance, newUrl, pathname } = await this.pipeline.tryRewrite(
          reroutePayload,
          this.request
        );
        this.routeData = routeData;
        if (reroutePayload instanceof Request) {
          this.request = reroutePayload;
        } else {
          this.request = copyRequest(newUrl, this.request);
        }
        this.url = new URL(this.request.url);
        this.cookies = new AstroCookies(this.request);
        this.params = getParams(routeData, pathname);
        this.pathname = pathname;
        this.isRewriting = true;
        this.status = 200;
        return await this.render(componentInstance);
      }
      createActionAPIContext() {
        const renderContext = this;
        const { cookies, params, pipeline, url } = this;
        const generator = `Astro v${ASTRO_VERSION}`;
        const rewrite = /* @__PURE__ */ __name(async (reroutePayload) => {
          return await this.#executeRewrite(reroutePayload);
        }, "rewrite");
        return {
          cookies,
          get clientAddress() {
            return renderContext.clientAddress();
          },
          get currentLocale() {
            return renderContext.computeCurrentLocale();
          },
          generator,
          get locals() {
            return renderContext.locals;
          },
          // TODO(breaking): disallow replacing the locals object
          set locals(val) {
            if (typeof val !== "object") {
              throw new AstroError(LocalsNotAnObject);
            } else {
              renderContext.locals = val;
              Reflect.set(this.request, clientLocalsSymbol, val);
            }
          },
          params,
          get preferredLocale() {
            return renderContext.computePreferredLocale();
          },
          get preferredLocaleList() {
            return renderContext.computePreferredLocaleList();
          },
          rewrite,
          request: this.request,
          site: pipeline.site,
          url
        };
      }
      async createResult(mod) {
        const { cookies, pathname, pipeline, routeData, status } = this;
        const { clientDirectives, inlinedScripts, compressHTML, manifest: manifest2, renderers: renderers2, resolve } = pipeline;
        const { links, scripts, styles } = await pipeline.headElements(routeData);
        const componentMetadata = await pipeline.componentMetadata(routeData) ?? manifest2.componentMetadata;
        const headers = new Headers({ "Content-Type": "text/html" });
        const partial = typeof this.partial === "boolean" ? this.partial : Boolean(mod.partial);
        const response = {
          status,
          statusText: "OK",
          get headers() {
            return headers;
          },
          // Disallow `Astro.response.headers = new Headers`
          set headers(_) {
            throw new AstroError(AstroResponseHeadersReassigned);
          }
        };
        const actionResult = hasActionPayload(this.locals) ? deserializeActionResult(this.locals._actionPayload.actionResult) : void 0;
        const result = {
          base: manifest2.base,
          cancelled: false,
          clientDirectives,
          inlinedScripts,
          componentMetadata,
          compressHTML,
          cookies,
          /** This function returns the `Astro` faux-global */
          createAstro: (astroGlobal, props, slots) => this.createAstro(result, astroGlobal, props, slots),
          links,
          params: this.params,
          partial,
          pathname,
          renderers: renderers2,
          resolve,
          response,
          request: this.request,
          scripts,
          styles,
          actionResult,
          serverIslandNameMap: manifest2.serverIslandNameMap ?? /* @__PURE__ */ new Map(),
          key: manifest2.key,
          trailingSlash: manifest2.trailingSlash,
          _metadata: {
            hasHydrationScript: false,
            rendererSpecificHydrationScripts: /* @__PURE__ */ new Set(),
            hasRenderedHead: false,
            renderedScripts: /* @__PURE__ */ new Set(),
            hasDirectives: /* @__PURE__ */ new Set(),
            headInTree: false,
            extraHead: [],
            propagators: /* @__PURE__ */ new Set()
          }
        };
        return result;
      }
      #astroPagePartial;
      /**
       * The Astro global is sourced in 3 different phases:
       * - **Static**: `.generator` and `.glob` is printed by the compiler, instantiated once per process per astro file
       * - **Page-level**: `.request`, `.cookies`, `.locals` etc. These remain the same for the duration of the request.
       * - **Component-level**: `.props`, `.slots`, and `.self` are unique to each _use_ of each component.
       *
       * The page level partial is used as the prototype of the user-visible `Astro` global object, which is instantiated once per use of a component.
       */
      createAstro(result, astroStaticPartial, props, slotValues) {
        let astroPagePartial;
        if (this.isRewriting) {
          astroPagePartial = this.#astroPagePartial = this.createAstroPagePartial(
            result,
            astroStaticPartial
          );
        } else {
          astroPagePartial = this.#astroPagePartial ??= this.createAstroPagePartial(
            result,
            astroStaticPartial
          );
        }
        const astroComponentPartial = { props, self: null };
        const Astro = Object.assign(
          Object.create(astroPagePartial),
          astroComponentPartial
        );
        let _slots;
        Object.defineProperty(Astro, "slots", {
          get: () => {
            if (!_slots) {
              _slots = new Slots(
                result,
                slotValues,
                this.pipeline.logger
              );
            }
            return _slots;
          }
        });
        return Astro;
      }
      createAstroPagePartial(result, astroStaticPartial) {
        const renderContext = this;
        const { cookies, locals, params, pipeline, url } = this;
        const { response } = result;
        const redirect = /* @__PURE__ */ __name((path, status = 302) => {
          if (this.request[responseSentSymbol]) {
            throw new AstroError({
              ...ResponseSentError
            });
          }
          return new Response(null, { status, headers: { Location: path } });
        }, "redirect");
        const rewrite = /* @__PURE__ */ __name(async (reroutePayload) => {
          return await this.#executeRewrite(reroutePayload);
        }, "rewrite");
        return {
          generator: astroStaticPartial.generator,
          glob: astroStaticPartial.glob,
          cookies,
          get clientAddress() {
            return renderContext.clientAddress();
          },
          get currentLocale() {
            return renderContext.computeCurrentLocale();
          },
          params,
          get preferredLocale() {
            return renderContext.computePreferredLocale();
          },
          get preferredLocaleList() {
            return renderContext.computePreferredLocaleList();
          },
          locals,
          redirect,
          rewrite,
          request: this.request,
          response,
          site: pipeline.site,
          getActionResult: createGetActionResult(locals),
          get callAction() {
            return createCallAction(this);
          },
          url
        };
      }
      clientAddress() {
        const { pipeline, request } = this;
        if (clientAddressSymbol in request) {
          return Reflect.get(request, clientAddressSymbol);
        }
        if (pipeline.serverLike) {
          if (request.body === null) {
            throw new AstroError(PrerenderClientAddressNotAvailable);
          }
          if (pipeline.adapterName) {
            throw new AstroError({
              ...ClientAddressNotAvailable,
              message: ClientAddressNotAvailable.message(pipeline.adapterName)
            });
          }
        }
        throw new AstroError(StaticClientAddressNotAvailable);
      }
      /**
       * API Context may be created multiple times per request, i18n data needs to be computed only once.
       * So, it is computed and saved here on creation of the first APIContext and reused for later ones.
       */
      #currentLocale;
      computeCurrentLocale() {
        const {
          url,
          pipeline: { i18n },
          routeData
        } = this;
        if (!i18n)
          return;
        const { defaultLocale, locales, strategy } = i18n;
        const fallbackTo = strategy === "pathname-prefix-other-locales" || strategy === "domains-prefix-other-locales" ? defaultLocale : void 0;
        if (this.#currentLocale) {
          return this.#currentLocale;
        }
        let computedLocale;
        const pathname = routeData.pathname && !isRoute404or500(routeData) ? routeData.pathname : url.pathname;
        computedLocale = computeCurrentLocale(pathname, locales, defaultLocale);
        this.#currentLocale = computedLocale ?? fallbackTo;
        return this.#currentLocale;
      }
      #preferredLocale;
      computePreferredLocale() {
        const {
          pipeline: { i18n },
          request
        } = this;
        if (!i18n)
          return;
        return this.#preferredLocale ??= computePreferredLocale(request, i18n.locales);
      }
      #preferredLocaleList;
      computePreferredLocaleList() {
        const {
          pipeline: { i18n },
          request
        } = this;
        if (!i18n)
          return;
        return this.#preferredLocaleList ??= computePreferredLocaleList(request, i18n.locales);
      }
    };
    __name(RenderContext, "RenderContext");
    __name(sequence, "sequence");
    __name(defineMiddleware, "defineMiddleware");
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/_image.astro.mjs
var image_astro_exports = {};
__export(image_astro_exports, {
  page: () => page,
  renderers: () => renderers
});
var prerender, GET, _page, page;
var init_image_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/_image.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_renderers();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    prerender = false;
    GET = /* @__PURE__ */ __name((ctx) => {
      const href = ctx.url.searchParams.get("href");
      if (!href) {
        return new Response("Missing 'href' query parameter", {
          status: 400,
          statusText: "Missing 'href' query parameter"
        });
      }
      return fetch(new URL(href, ctx.url.origin));
    }, "GET");
    _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      GET,
      prerender
    }, Symbol.toStringTag, { value: "Module" }));
    page = /* @__PURE__ */ __name(() => _page, "page");
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/404.astro.mjs
var astro_exports = {};
var init_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/404.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/api/commento.astro.mjs
var commento_astro_exports = {};
__export(commento_astro_exports, {
  page: () => page2,
  renderers: () => renderers
});
function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
var prerender2, MAX_NOME, MAX_EMAIL, MAX_TESTO, POST, _page2, page2;
var init_commento_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/api/commento.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_renderers();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    prerender2 = false;
    MAX_NOME = 100;
    MAX_EMAIL = 200;
    MAX_TESTO = 5e3;
    __name(isValidEmail, "isValidEmail");
    __name(json, "json");
    POST = /* @__PURE__ */ __name(async ({ request, locals }) => {
      const env = locals.runtime?.env ?? {};
      const DIRECTUS_URL2 = (env.DIRECTUS_URL ?? "").replace(/\/$/, "");
      const DIRECTUS_TOKEN2 = env.DIRECTUS_TOKEN ?? "";
      if (!DIRECTUS_URL2 || !DIRECTUS_TOKEN2) {
        return json({ ok: false, error: "Server misconfiguration" }, 500);
      }
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ ok: false, error: "Richiesta non valida" }, 400);
      }
      const { articolo_id, autore_nome, autore_email, testo, hp } = body;
      if (hp) {
        return json({ ok: true }, 200);
      }
      if (!articolo_id || typeof articolo_id !== "string") {
        return json({ ok: false, error: "Articolo mancante" }, 400);
      }
      if (!autore_nome?.trim() || autore_nome.length > MAX_NOME) {
        return json({ ok: false, error: "Inserisci il tuo nome (max 100 caratteri)" }, 400);
      }
      if (!autore_email?.trim() || autore_email.length > MAX_EMAIL || !isValidEmail(autore_email)) {
        return json({ ok: false, error: "Inserisci un indirizzo email valido" }, 400);
      }
      if (!testo?.trim() || testo.trim().length < 10 || testo.length > MAX_TESTO) {
        return json({ ok: false, error: "Il commento deve essere tra 10 e 5000 caratteri" }, 400);
      }
      const res = await fetch(`${DIRECTUS_URL2}/items/commenti`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DIRECTUS_TOKEN2}`
        },
        body: JSON.stringify({
          articolo: articolo_id,
          autore_nome: autore_nome.trim(),
          autore_email: autore_email.trim().toLowerCase(),
          testo: testo.trim(),
          stato: "pending"
        })
      });
      if (!res.ok) {
        console.error("[api/commento] Directus error:", await res.text());
        return json({ ok: false, error: "Errore interno. Riprova pi\xF9 tardi." }, 500);
      }
      return json({ ok: true }, 201);
    }, "POST");
    _page2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      POST,
      prerender: prerender2
    }, Symbol.toStringTag, { value: "Module" }));
    page2 = /* @__PURE__ */ __name(() => _page2, "page");
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/api/health.astro.mjs
var health_astro_exports = {};
__export(health_astro_exports, {
  page: () => page3,
  renderers: () => renderers
});
async function checkDirectus() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5e3);
  try {
    const res = await fetch(`${CMS}/server/ping`, { signal: controller.signal });
    if (!res.ok)
      return "down";
    const body = await res.text();
    return body.includes("pong") ? "ok" : "degraded";
  } catch {
    return "down";
  } finally {
    clearTimeout(timer);
  }
}
async function checkArticoli() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8e3);
  try {
    const res = await fetch(
      `${CMS}/items/articoli?aggregate[count]=id&filter[stato][_eq]=published`,
      { signal: controller.signal }
    );
    if (!res.ok)
      return "error";
    const json2 = await res.json();
    const count = parseInt(json2.data?.[0]?.count?.id ?? "0", 10);
    return count > 3e3 ? "ok" : `degraded:${count}`;
  } catch {
    return "error";
  } finally {
    clearTimeout(timer);
  }
}
async function checkUltimoNumero() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8e3);
  try {
    const res = await fetch(
      `${CMS}/items/numeri_rivista?sort=-anno_pubblicazione&limit=1&fields=id_numero,tipo`,
      { signal: controller.signal }
    );
    if (!res.ok)
      return "error";
    const json2 = await res.json();
    const idNumero = json2.data?.[0]?.id_numero;
    return idNumero ? `ok:${idNumero}` : "missing";
  } catch {
    return "error";
  } finally {
    clearTimeout(timer);
  }
}
var prerender3, CMS, GET2, _page3, page3;
var init_health_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/api/health.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_renderers();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    prerender3 = false;
    CMS = "https://cms-unreachable-test.ombreeluci.it";
    __name(checkDirectus, "checkDirectus");
    __name(checkArticoli, "checkArticoli");
    __name(checkUltimoNumero, "checkUltimoNumero");
    GET2 = /* @__PURE__ */ __name(async () => {
      const [r1, r2, r3] = await Promise.allSettled([
        checkDirectus(),
        checkArticoli(),
        checkUltimoNumero()
      ]);
      const directus = r1.status === "fulfilled" ? r1.value : "down";
      const articoli = r2.status === "fulfilled" ? r2.value : "error";
      const ultimo_numero = r3.status === "fulfilled" ? r3.value : "error";
      const isDown = directus === "down";
      const isDegraded = !isDown && (directus === "degraded" || articoli.startsWith("degraded") || articoli === "error" || ultimo_numero === "missing" || ultimo_numero === "error");
      const status = isDown ? "down" : isDegraded ? "degraded" : "ok";
      return new Response(
        JSON.stringify({
          status,
          checks: { directus, articoli, ultimo_numero },
          ts: (/* @__PURE__ */ new Date()).toISOString()
        }),
        {
          status: isDown ? 503 : 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          }
        }
      );
    }, "GET");
    _page3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      GET: GET2,
      prerender: prerender3
    }, Symbol.toStringTag, { value: "Module" }));
    page3 = /* @__PURE__ */ __name(() => _page3, "page");
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/api/revalidate.astro.mjs
var revalidate_astro_exports = {};
__export(revalidate_astro_exports, {
  page: () => page4,
  renderers: () => renderers
});
var prerender4, UUID_RE, POST2, _page4, page4;
var init_revalidate_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/api/revalidate.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_renderers();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    prerender4 = false;
    UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    POST2 = /* @__PURE__ */ __name(async ({ request, locals }) => {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response("Bad Request", { status: 400 });
      }
      const { id, secret } = body ?? {};
      let { slug } = body ?? {};
      if (!slug && !id) {
        return new Response("Missing slug or id", { status: 400 });
      }
      const runtime = locals.runtime;
      const env = runtime?.env ?? {};
      const REVALIDATE_SECRET = env.REVALIDATE_SECRET ?? "";
      const CF_ZONE_ID = env.CF_ZONE_ID ?? "";
      const CF_PURGE_TOKEN = env.CF_PURGE_TOKEN ?? "";
      const DIRECTUS_URL2 = env.DIRECTUS_URL ?? "";
      const DIRECTUS_TOKEN2 = env.DIRECTUS_TOKEN ?? "";
      if (!REVALIDATE_SECRET || secret !== REVALIDATE_SECRET) {
        return new Response("Unauthorized", { status: 401 });
      }
      if (!slug && id && UUID_RE.test(id) && DIRECTUS_URL2 && DIRECTUS_TOKEN2) {
        try {
          const res = await fetch(
            `${DIRECTUS_URL2}/items/articoli/${id}?fields[]=slug`,
            { headers: { Authorization: `Bearer ${DIRECTUS_TOKEN2}` } }
          );
          if (res.ok) {
            const data = await res.json();
            slug = data.data?.slug;
          }
        } catch {
        }
      }
      if (!slug || typeof slug !== "string") {
        return new Response("Missing slug", { status: 400 });
      }
      if (!CF_ZONE_ID || !CF_PURGE_TOKEN) {
        return new Response("Server misconfiguration", { status: 500 });
      }
      const articleUrl = `https://ombreeluci.it/it/${slug}/`;
      const purgeRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CF_PURGE_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ files: [articleUrl] })
        }
      );
      const purgeData = await purgeRes.json();
      if (!purgeData.success) {
        return new Response(JSON.stringify({ ok: false, errors: purgeData.errors }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      fetch(articleUrl, { headers: { "User-Agent": "OEL-Prewarm/1.0" } }).catch(() => {
      });
      return new Response(JSON.stringify({ ok: true, purged: articleUrl }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }, "POST");
    _page4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      POST: POST2,
      prerender: prerender4
    }, Symbol.toStringTag, { value: "Module" }));
    page4 = /* @__PURE__ */ __name(() => _page4, "page");
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/debug/audit-editoriale.astro.mjs
var audit_editoriale_astro_exports = {};
var init_audit_editoriale_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/debug/audit-editoriale.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/about.astro.mjs
var about_astro_exports = {};
var init_about_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/about.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/archive/web-only.astro.mjs
var web_only_astro_exports = {};
var init_web_only_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/archive/web-only.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/rubriche_BEVwGLjw.mjs
var rubricheData;
var init_rubriche_BEVwGLjw = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/rubriche_BEVwGLjw.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    rubricheData = [
      {
        slug: "editoriali",
        en_slug: "editorials",
        it: "Editoriali",
        en: "Editorials",
        filtro: "forma",
        valore: "Editoriale"
      },
      {
        slug: "interviste",
        en_slug: "interviews",
        it: "Interviste",
        en: "Interviews",
        filtro: "forma",
        valore: "Intervista"
      },
      {
        slug: "testimonianze",
        en_slug: "testimonies",
        it: "Testimonianze",
        en: "Testimonies",
        filtro: "forma",
        valore: "Testimonianza"
      },
      {
        slug: "recensioni",
        en_slug: "reviews",
        it: "Recensioni",
        en: "Reviews",
        filtro: "forma",
        valore: "Recensione"
      },
      {
        slug: "dialogo-aperto",
        en_slug: "open-dialogue",
        it: "Dialogo Aperto",
        en: "Open Dialogue",
        filtro: "forma",
        valore: "Dialogo Aperto"
      },
      {
        slug: "diari",
        en_slug: "diaries",
        it: "I Diari",
        en: "The Diaries",
        filtro: "autori",
        valore: "diaristi"
      }
    ];
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/taxonomy_BacsMRxg.mjs
function normalizeCategoriaKey(value) {
  if (!value)
    return "";
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function getCategoriaLabel(slugOrRaw, lang) {
  if (!slugOrRaw)
    return null;
  const direct = String(slugOrRaw).trim();
  const normalized = normalizeCategoriaKey(direct);
  const canonicalSlug = SLUG_TO_LABELS[direct] ? direct : NORMALIZED_LABEL_TO_SLUG[normalized];
  const entry = canonicalSlug ? SLUG_TO_LABELS[canonicalSlug] : null;
  if (!entry)
    return slugOrRaw;
  return entry[lang] ?? entry.it ?? slugOrRaw;
}
function getRoleWeight(role) {
  if (!role)
    return 0;
  const key = String(role).toLowerCase();
  return EDITORIAL_WEIGHTS[key] ?? 0;
}
function getThemeDisplayName(temaLabel) {
  if (!temaLabel || typeof temaLabel !== "string")
    return "";
  return THEME_ALIASES[temaLabel] ?? temaLabel;
}
function normalize(s) {
  if (typeof s !== "string")
    return "";
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
function getLabels(wp_tags, articolo2) {
  const tags = Array.isArray(wp_tags) ? wp_tags : wp_tags != null && typeof wp_tags === "string" ? [wp_tags] : [];
  let formal = FORMAL_FALLBACK;
  if (articolo2?.forma) {
    formal = articolo2.forma;
  } else {
    for (const tag of tags) {
      const n = normalize(tag);
      if (n && TAG_TO_FORMAL[n]) {
        formal = TAG_TO_FORMAL[n];
        break;
      }
    }
  }
  const thematic = articolo2?.categoria_menu || articolo2?.tema_label || THEMATIC_FALLBACK;
  return { formal, thematic };
}
function getFormaToRubricaSlug(forma) {
  if (!forma)
    return null;
  const r2 = rubricheData.find((r3) => r3.filtro === "forma" && r3.valore === forma);
  return r2?.slug ?? null;
}
function getRubricaUrlSlug(slugIT, lang) {
  const r2 = rubricheData.find((r3) => r3.slug === slugIT);
  if (!r2)
    return slugIT;
  return r2.en_slug;
}
function getMegaclusterForArticle(articolo2) {
  const lang = articolo2?.lang === "en" ? "en" : "it";
  const rawCategoria = articolo2?.categoria_menu ?? articolo2?.tema_label ?? null;
  const categoriaLabel = rawCategoria ? getCategoriaLabel(rawCategoria, lang) : null;
  return {
    tema_label: articolo2?.tema_label ?? null,
    categoria_menu: categoriaLabel,
    ruolo_editoriale: articolo2?.ruolo_editoriale ?? null
  };
}
function getThemeLabel(articolo2) {
  if (!articolo2)
    return THEMATIC_FALLBACK;
  const mc = getMegaclusterForArticle(articolo2);
  if (mc.categoria_menu)
    return mc.categoria_menu;
  return articolo2.tema_label || THEMATIC_FALLBACK;
}
function getCategorySlugForArticle(articolo2) {
  if (!articolo2?.tema_label)
    return null;
  const slug = Object.keys(SLUG_TO_TEMA).find((s) => SLUG_TO_TEMA[s] === articolo2.tema_label);
  return slug ?? slugifyLabel(articolo2.tema_label);
}
function getThemesWithSlugs() {
  return MEGACLUSTER_TEMI.map((temaLabel) => {
    const slug = Object.keys(SLUG_TO_TEMA).find((s) => SLUG_TO_TEMA[s] === temaLabel) || slugifyLabel(temaLabel);
    const nome = TEMA_TO_CATEGORIA[temaLabel] ?? getThemeDisplayName(temaLabel) ?? temaLabel;
    return { nome, slug, nomeCompleto: temaLabel };
  });
}
function getCategoriaUrlSlug(slugIT, lang) {
  const cat = categorieData.categorie.find((c) => c.slug === slugIT);
  if (!cat)
    return slugIT;
  if (lang === "en")
    return cat.en_slug ?? slugIT;
  return slugIT;
}
function getCategoriaSlugIT(slugLang, lang) {
  {
    const cat = categorieData.categorie.find((c) => c.en_slug === slugLang);
    return cat?.slug ?? slugLang;
  }
}
function slugifyLabel(label) {
  return String(label).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
var slugToTema, temaToCategoria, megaclusterTemi, taxonomyData, categorie, categorieData, SLUG_TO_TEMA, TEMA_TO_CATEGORIA, MEGACLUSTER_TEMI, SLUG_TO_LABELS, NORMALIZED_LABEL_TO_SLUG, FORMAL_FALLBACK, THEMATIC_FALLBACK, EDITORIAL_WEIGHTS, THEME_ALIASES, TAG_TO_FORMAL;
var init_taxonomy_BacsMRxg = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/taxonomy_BacsMRxg.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_rubriche_BEVwGLjw();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    slugToTema = {
      famiglia: "Famiglia",
      spiritualita: "Spiritualit\xE0",
      catechesi: "Catechesi",
      cultura: "Cultura",
      "fede-e-luce": "Fede e Luce",
      progetti: "Progetti",
      salute: "Salute",
      lavoro: "Lavoro",
      scuola: "Scuola",
      "educazione-e-formazione": "Educazione e Formazione",
      sport: "Sport",
      "tempo-libero": "Tempo libero",
      "personaggi-che-ispirano": "Personaggi che ispirano"
    };
    temaToCategoria = {
      Famiglia: "Famiglia",
      "Spiritualit\xE0": "Spiritualit\xE0",
      Catechesi: "Catechesi",
      Cultura: "Cultura",
      "Fede e Luce": "Fede e Luce",
      Progetti: "Progetti",
      Salute: "Salute",
      Lavoro: "Lavoro",
      Scuola: "Scuola",
      "Educazione e Formazione": "Educazione",
      Sport: "Sport",
      "Tempo libero": "Tempo libero",
      "Personaggi che ispirano": "Testimoni"
    };
    megaclusterTemi = [
      "Famiglia",
      "Spiritualit\xE0",
      "Catechesi",
      "Cultura",
      "Fede e Luce",
      "Progetti",
      "Salute",
      "Lavoro",
      "Scuola",
      "Educazione e Formazione",
      "Sport",
      "Tempo libero",
      "Personaggi che ispirano"
    ];
    taxonomyData = {
      slugToTema,
      temaToCategoria,
      megaclusterTemi
    };
    categorie = [
      {
        slug: "catechesi",
        it: "Catechesi",
        en: "Catechesis",
        en_slug: "catechesis"
      },
      {
        slug: "cultura",
        it: "Cultura",
        en: "Culture",
        en_slug: "culture"
      },
      {
        slug: "educazione-e-formazione",
        it: "Educazione e Formazione",
        en: "Education",
        en_slug: "education-and-training"
      },
      {
        slug: "famiglia",
        it: "Famiglia",
        en: "Family",
        en_slug: "family"
      },
      {
        slug: "fede-e-luce",
        it: "Fede e Luce",
        en: "Faith and Light",
        en_slug: "faith-and-light"
      },
      {
        slug: "lavoro",
        it: "Lavoro",
        en: "Work",
        en_slug: "work"
      },
      {
        slug: "ombre-e-luci",
        it: "Ombre e Luci",
        en: "Ombre e Luci",
        en_slug: "ombre-e-luci"
      },
      {
        slug: "personaggi-che-ispirano",
        it: "Personaggi che ispirano",
        en: "Inspiring People",
        en_slug: "inspiring-figures"
      },
      {
        slug: "progetti",
        it: "Progetti",
        en: "Projects",
        en_slug: "projects"
      },
      {
        slug: "salute",
        it: "Salute",
        en: "Health",
        en_slug: "health"
      },
      {
        slug: "scuola",
        it: "Scuola",
        en: "School",
        en_slug: "education"
      },
      {
        slug: "spiritualita",
        it: "Spiritualit\xE0",
        en: "Spirituality",
        en_slug: "spirituality"
      },
      {
        slug: "sport",
        it: "Sport",
        en: "Sport",
        en_slug: "sport"
      },
      {
        slug: "tempo-libero",
        it: "Tempo libero",
        en: "Leisure",
        en_slug: "leisure"
      },
      {
        slug: "da-categorizzare",
        it: "Da categorizzare",
        en: "To be categorized",
        en_slug: "da-categorizzare"
      }
    ];
    categorieData = {
      categorie
    };
    SLUG_TO_TEMA = taxonomyData.slugToTema;
    TEMA_TO_CATEGORIA = taxonomyData.temaToCategoria;
    MEGACLUSTER_TEMI = taxonomyData.megaclusterTemi;
    SLUG_TO_LABELS = Object.fromEntries(
      categorieData.categorie.map((c) => [c.slug, { it: c.it, en: c.en }])
    );
    NORMALIZED_LABEL_TO_SLUG = Object.fromEntries(
      categorieData.categorie.flatMap((c) => [
        [normalizeCategoriaKey(c.slug), c.slug],
        [normalizeCategoriaKey(c.it), c.slug],
        [normalizeCategoriaKey(c.en), c.slug]
      ])
    );
    __name(normalizeCategoriaKey, "normalizeCategoriaKey");
    __name(getCategoriaLabel, "getCategoriaLabel");
    FORMAL_FALLBACK = "Articolo";
    THEMATIC_FALLBACK = "Attualit\xE0";
    EDITORIAL_WEIGHTS = {
      portante: 4,
      strutturale: 3,
      laterale: 2,
      trasversale: 1
    };
    __name(getRoleWeight, "getRoleWeight");
    THEME_ALIASES = {
      "Famiglia": "Famiglia",
      "Spiritualit\xE0": "Spiritualit\xE0",
      "Catechesi": "Catechesi",
      "Cultura": "Cultura",
      "Fede e Luce": "Fede e Luce",
      "Progetti": "Progetti",
      "Salute": "Salute",
      "Lavoro": "Lavoro",
      "Scuola": "Scuola",
      "Educazione e Formazione": "Educazione",
      "Sport": "Sport",
      "Tempo libero": "Tempo libero",
      "Personaggi che ispirano": "Personaggi"
    };
    __name(getThemeDisplayName, "getThemeDisplayName");
    __name(normalize, "normalize");
    TAG_TO_FORMAL = {
      intervista: "Intervista",
      interview: "Intervista",
      recensione: "Recensione",
      review: "Recensione",
      testimonianza: "Testimonianza",
      testimony: "Testimonianza",
      editoriale: "Editoriale",
      editorial: "Editoriale",
      editoriali: "Editoriale",
      articolo: "Articolo",
      article: "Articolo"
    };
    __name(getLabels, "getLabels");
    __name(getFormaToRubricaSlug, "getFormaToRubricaSlug");
    __name(getRubricaUrlSlug, "getRubricaUrlSlug");
    __name(getMegaclusterForArticle, "getMegaclusterForArticle");
    __name(getThemeLabel, "getThemeLabel");
    __name(getCategorySlugForArticle, "getCategorySlugForArticle");
    __name(getThemesWithSlugs, "getThemesWithSlugs");
    __name(getCategoriaUrlSlug, "getCategoriaUrlSlug");
    __name(getCategoriaSlugIT, "getCategoriaSlugIT");
    __name(slugifyLabel, "slugifyLabel");
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/Footer_DN9MDnF9.mjs
function localizeCategory(slug, locale) {
  if (slug == null || slug === "")
    return null;
  const key = CAT_SLUG_TO_I18N_KEY[slug];
  if (key)
    return t(locale, key);
  return slug;
}
function localizeTheme(label, locale) {
  if (label == null || label === "")
    return null;
  const key = TEMA_IT_TO_I18N_KEY[label];
  if (key)
    return t(locale, key);
  return label;
}
function localizeFormalType(formal, locale) {
  if (formal == null || formal === "")
    return null;
  const key = FORMAL_IT_TO_I18N_KEY[formal];
  if (key)
    return t(locale, key);
  return formal;
}
function localizeIssuePeriodLabel(label, locale) {
  if (label == null || label === "")
    return null;
  if (locale !== "en")
    return label;
  let out = label;
  for (const [re, en] of IT_MONTH_TO_EN) {
    out = out.replace(re, en);
  }
  return out;
}
function getAuthorBasePath(lang) {
  if (lang === "it")
    return "/it/autori";
  return `/${lang}/authors`;
}
function getLangFromUrl(pathname) {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (p.startsWith("/en") || p.startsWith("/blog/en") || p.includes("/en/"))
    return "en";
  return "it";
}
function t(locale, key) {
  const dict = translations[locale];
  return dict[key] ?? translations.it[key] ?? key;
}
var logo, id_numero, copertina_url, titolo_numero, numero_progressivo, anno_pubblicazione, periodo_label, ultimoNumeroData, translations, CAT_SLUG_TO_I18N_KEY, TEMA_IT_TO_I18N_KEY, FORMAL_IT_TO_I18N_KEY, IT_MONTH_TO_EN, iconTranslate, $$Astro$3, $$LanguageSelector, $$Astro$2, $$AutocompleteWidget, $$Astro$1, $$Header, CF, CODICE_FISCALE, RUNTS, __freeze, __defProp2, __template, _a, $$Astro, $$Footer;
var init_Footer_DN9MDnF9 = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/Footer_DN9MDnF9.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_taxonomy_BacsMRxg();
    init_rubriche_BEVwGLjw();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    logo = new Proxy({ "src": "/_astro/logo.Cb_mP9bA.svg", "width": 300, "height": 80, "format": "svg" }, {
      get(target, name, receiver) {
        if (name === "clone") {
          return structuredClone(target);
        }
        if (name === "fsPath") {
          return "C:/Users/berto/Documents/Ombreeluci/src/assets/logo.svg";
        }
        return target[name];
      }
    });
    id_numero = "OEL-173";
    copertina_url = "https://cms.ombreeluci.it/assets/beec6332-66b2-4363-b247-db72b8de655c";
    titolo_numero = "Numero 173 \u2013 Quale futuro?";
    numero_progressivo = 173;
    anno_pubblicazione = 2026;
    periodo_label = "Gennaio \u2013 Febbraio \u2013 Marzo";
    ultimoNumeroData = {
      id_numero,
      copertina_url,
      titolo_numero,
      numero_progressivo,
      anno_pubblicazione,
      periodo_label
    };
    translations = {
      it: {
        read_also: "LEGGI ANCHE",
        english_articles: "Articoli in inglese",
        back_to_home: "Torna al Magazine",
        nav_archive: "Naviga",
        nav_archive_full: "Archivio completo",
        nav_latest: "Ultimi articoli",
        nav_authors: "Autori",
        nav_focus: "Focus",
        nav_about: "Chi siamo",
        nav_newsletter: "Newsletter",
        nav_contribute: "Contribuisci",
        nav_menu: "Men\xF9",
        nav_menu_open: "Apri menu",
        nav_menu_close: "Chiudi menu",
        nav_themes: "Temi",
        nav_sections: "Rubriche",
        nav_editorial_tools: "Strumenti redazione",
        nav_audit_editorial: "Audit gerarchia editoriale",
        nav_last_issue: "Ultimo Numero",
        nav_support: "Sostieni Ombre e Luci \u2192",
        search_label: "Cerca nel sito",
        search_placeholder: "Cerca nel sito...",
        related_articles: "Articoli Correlati",
        widget_navigate: "Naviga",
        widget_download_pdf: "Scarica PDF",
        widget_go_to_issue: "Vai al numero",
        issue_number: "Numero Rivista",
        download_pdf_issue: "Scarica PDF del numero",
        min_read: "min di lettura",
        published_online: "Pubblicato online",
        footer_about: "Chi siamo",
        footer_redaction: "La Redazione",
        footer_redaction_history: "La Redazione storica",
        footer_collaborators: "Collaboratori",
        footer_wrote_for_us: "Hanno scritto per noi",
        footer_diari: "I Diari",
        footer_contacts: "Info e contatti redazione",
        footer_info_privacy: "Info & Privacy",
        footer_privacy: "Privacy Policy",
        footer_cookies: "Cookie Policy",
        footer_terms: "Termini e Condizioni",
        footer_editorials: "Editoriali",
        footer_reviews: "Recensioni",
        footer_interviews: "Interviste",
        footer_testimonials: "Testimonianze",
        widget_close: "Chiudi",
        author_bio_fallback: "Autore di articoli pubblicati su Ombre e Luci.",
        author_total: "autori hanno collaborato con Ombre e Luci.",
        author_total_prefix: "In totale",
        footer_tagline: "Dal 1974 al 2026",
        footer_edited_by: "Edito da",
        author_by: "Di",
        author_unknown: "Autore sconosciuto",
        load_more: "Carica altri",
        load_more_remaining: "rimanenti",
        load_more_aria: "Carica altri articoli",
        badge_online: "Online",
        aria_lang_selector: "Selezione lingua",
        aria_header_utility: "Servizi e utilit\xE0",
        aria_mega_menu: "Menu di navigazione",
        editorial_box_title: "BOX REVISIONE EDITORIALE",
        editorial_aria: "Box revisione editoriale",
        editorial_proposed_role: "Ruolo proposto",
        editorial_notes: "Note per la redazione",
        editorial_submit: "Invia",
        editorial_role_none: "Nessun cambio",
        editorial_role_portante: "portante",
        editorial_role_strutturale: "strutturale",
        editorial_role_laterale: "laterale",
        editorial_role_trasversale: "trasversale",
        editorial_directus_edit: "Modifica in Directus",
        editorial_sending: "Invio in corso\u2026",
        editorial_sent: "\u2713 Inviato!",
        editorial_network_error: "Errore di rete \u2014 riprova.",
        meta_article_default_suffix: "Articolo pubblicato su Ombre e Luci",
        aria_article_bottom_nav: "Navigazione in fondo articolo",
        badge_role_portante: "Portante",
        badge_role_strutturale: "Strutturale",
        badge_role_laterale: "Laterale",
        badge_role_trasversale: "Trasversale",
        /** Tipi formali (forma) — allineati a taxonomy FORMAL_TYPES + varianti DB */
        formal_articolo: "Articolo",
        formal_intervista: "Intervista",
        formal_recensione: "Recensione",
        formal_testimonianza: "Testimonianza",
        formal_editoriale: "Editoriale",
        formal_dialogo_aperto: "Dialogo Aperto",
        category_uncategorized: "Da categorizzare",
        // Categorie (categoria_menu slug → label display)
        cat_fede_e_luce: "Fede e Luce",
        cat_cultura: "Cultura",
        cat_famiglia: "Famiglia",
        cat_spiritualita: "Spiritualit\xE0",
        cat_progetti: "Progetti",
        cat_salute: "Salute",
        cat_catechesi: "Catechesi",
        cat_scuola: "Scuola",
        cat_educazione_e_formazione: "Educazione e Formazione",
        cat_tempo_libero: "Tempo libero",
        cat_personaggi_che_ispirano: "Personaggi che ispirano",
        cat_lavoro: "Lavoro",
        cat_sport: "Sport",
        // Homepage
        home_tagline: "Un nuovo sguardo attraverso la disabilit\xE0",
        home_section_recent: "Recenti",
        home_section_close_up: "Da vicino",
        home_section_close_up_sub: "I diari di chi vive questa realt\xE0 e le storie di chi, stando accanto, ha visto qualcosa cambiare.",
        home_section_all_stories: "Tutte le storie \u2192",
        home_section_explore: "Esplora",
        home_section_explore_sub: "Quarant'anni di storie, riflessioni e incontri.",
        home_magazine_eyebrow: "La rivista \xB7 esce ogni tre mesi dal 1983",
        home_magazine_discover: "Scopri il numero \u2192",
        home_magazine_archive: "Tutti i numeri",
        home_magazine_all_issues: "Tutti i numeri",
        home_magazine_archive_link: "Tutti i numeri \u2192",
        home_section_join: "Unisciti",
        home_section_join_sub: "Ombre e Luci esiste grazie a chi ci crede. Ci sono molti modi per esserci.",
        home_join_support_title: "Sostieni la rivista",
        home_join_support_text: "Una donazione, anche piccola e ricorrente, permette a Ombre e Luci di continuare a pubblicare storie che contano.",
        home_join_support_btn: "Scopri come \u2192",
        home_join_story_title: "Racconta la tua storia",
        home_join_story_text: "Hai vissuto qualcosa che vale la pena condividere? Le storie pi\xF9 vere arrivano da chi le ha vissute.",
        home_join_story_btn: "Scrivici \u2192",
        home_join_help_title: "Dai una mano",
        home_join_help_text: "Vuoi collaborare, fare volontariato o contribuire in un altro modo? Siamo sempre aperti.",
        home_join_help_btn: "Contattaci \u2192",
        home_newsletter_row: "Resta in contatto:",
        home_newsletter_link: "iscriviti alla newsletter",
        home_testi_cta_text: "Hai vissuto qualcosa che vale la pena raccontare?",
        home_testi_cta_link: "Scrivici \u2192",
        // Cerca
        cerca_title: "Cerca",
        cerca_description: "Cerca tra oltre 3500 articoli della rivista Ombre e Luci dal 1983 ad oggi.",
        cerca_placeholder: "Cerca articoli, autori, temi\u2026",
        // Newsletter
        nl_eyebrow: "Newsletter",
        nl_title: "Rimani in contatto",
        nl_subtitle: "Ogni numero: articoli scelti dalla redazione, storie di vita, riflessioni sulla disabilit\xE0 e sulla fragilit\xE0. Nessuno spam, puoi cancellarti in ogni momento.",
        nl_email_placeholder: "La tua email",
        nl_subscribe: "Iscriviti",
        nl_privacy_prefix: 'Cliccando su "Iscriviti" accetti la nostra',
        nl_privacy_link: "Privacy Policy",
        nl_prev_title: "Newsletter precedenti",
        nl_explore_title: "Esplora i temi della rivista",
        nl_archive_link: "Tutti i numeri \u2192",
        // Chi siamo / About
        about_title: "Chi Siamo",
        about_cta_read: "Leggi gli articoli",
        about_cta_support: "Sostienici",
        about_magazine_section: "La Rivista",
        about_timeline_section: "Album di Famiglia",
        about_team_section: "La Redazione",
        about_how_we_work_section: "Come lavoriamo",
        about_legacy_section: "La Redazione storica",
        about_legacy_archive_link: "La storica redazione",
        about_legacy_archive_arrow: "\u2192",
        about_collaborators_section: "Collaboratori",
        about_collaborators_lead: "Giornalisti, traduttori e professionisti che contribuiscono alla rivista.",
        about_authors_section: "Hanno scritto per noi",
        about_contacts_section: "Info e contatti redazione",
        about_read_more: "Leggi di pi\xF9",
        about_see_all_authors: "Vedi tutti gli autori",
        about_contact_email_label: "Email",
        about_contact_phone_label: "Telefono / WhatsApp",
        about_contact_address_label: "Dove siamo",
        about_hours_section: "Orari",
        // Sostienici / Support
        support_donate_now: "Dona ora",
        support_others_label: "Altri modi per sostenerci",
        support_wire_label: "Bonifico",
        support_wire_hint: "Puoi impostare un bonifico ricorrente dalla tua banca.",
        support_fivepermille_label: "5\xD71000",
        support_fivepermille_hint: "Ti costa zero. Firma nel riquadro \xABSostegno del volontariato\xBB e inserisci il codice fiscale.",
        support_subscription_label: "Abbonamento",
        support_subscription_discover: "Scopri abbonamento",
        support_impact_label: "Cosa rendi possibile",
        support_impact_close: "Ogni euro va dove serve.",
        support_faq_label: "Domande frequenti",
        // Archivio / Archive
        archive_title: "Magazine",
        archive_subtitle: "Sfoglia i numeri della rivista Ombre e Luci dal 1977 ad oggi.",
        archive_filter_year: "Anno",
        archive_filter_all: "Tutti",
        archive_filter_type: "Tipo rivista",
        archive_results_suffix: "numeri",
        archive_no_results_title: "Nessun numero trovato",
        archive_no_results_body: "Prova a cambiare i filtri.",
        archive_webonly_title: "Pubblicato online",
        archive_webonly_desc: "Articoli pubblicati solo sul sito, senza numero di rivista cartacea.",
        // Issue
        issue_browse_online: "Sfoglia online",
        issue_articles_heading: "Articoli di questo numero",
        issue_prev: "Numero precedente",
        issue_next: "Numero successivo",
        archive_tab_last: "Ultimo numero",
        archive_tab_all: "Tutti i numeri",
        archive_filters_label: "Filtri",
        archive_read_issue: "Leggi il numero \u2192",
        issue_back_archive: "\u2190 Magazine",
        // Diari / Diaries
        diaries_title: "I Diari di Ombre e Luci",
        diaries_all_feed_title: "Tutti i diari",
        // Dialogo aperto / Open Dialogue
        dialogue_title: "Dialogo aperto",
        // Temi (tema_label → label display)
        tema_catechesi: "Catechesi",
        tema_cultura: "Cultura",
        tema_da_categorizzare: "Da categorizzare",
        tema_educazione_e_formazione: "Educazione e Formazione",
        tema_famiglia: "Famiglia",
        tema_fede_e_luce: "Fede e Luce",
        tema_lavoro: "Lavoro",
        tema_personaggi_che_ispirano: "Personaggi che ispirano",
        tema_progetti: "Progetti",
        tema_salute: "Salute",
        tema_scuola: "Scuola",
        tema_spiritualita: "Spiritualit\xE0",
        tema_sport: "Sport",
        tema_tempo_libero: "Tempo libero"
      },
      en: {
        read_also: "READ ALSO",
        english_articles: "English articles",
        back_to_home: "Back to Magazine",
        nav_archive: "Archive",
        nav_archive_full: "Full archive",
        nav_latest: "Latest articles",
        nav_authors: "Authors",
        nav_focus: "Focus",
        nav_about: "About us",
        nav_newsletter: "Newsletter",
        nav_contribute: "Contribute",
        nav_menu: "Menu",
        nav_menu_open: "Open menu",
        nav_menu_close: "Close menu",
        nav_themes: "Themes",
        nav_sections: "Sections",
        nav_editorial_tools: "Editorial tools",
        nav_audit_editorial: "Editorial hierarchy audit",
        nav_last_issue: "Latest Issue",
        nav_support: "Support Ombre e Luci \u2192",
        search_label: "Search site",
        search_placeholder: "Search site...",
        related_articles: "Related Articles",
        widget_navigate: "Navigate",
        widget_download_pdf: "Download PDF",
        widget_go_to_issue: "Go to issue",
        issue_number: "Issue",
        download_pdf_issue: "Download PDF of the issue",
        min_read: "min read",
        published_online: "Published online",
        footer_about: "About us",
        footer_redaction: "Editorial team",
        footer_redaction_history: "Past editorial team",
        footer_collaborators: "Collaborators",
        footer_wrote_for_us: "Wrote for us",
        footer_diari: "The Diaries",
        footer_contacts: "Info and editorial contacts",
        footer_info_privacy: "Info & Privacy",
        footer_privacy: "Privacy Policy",
        footer_cookies: "Cookie Policy",
        footer_terms: "Terms and Conditions",
        footer_editorials: "Editorials",
        footer_reviews: "Reviews",
        footer_interviews: "Interviews",
        footer_testimonials: "Testimonials",
        widget_close: "Close",
        author_bio_fallback: "Author of articles published in Ombre e Luci.",
        author_total: "authors have contributed to Ombre e Luci.",
        author_total_prefix: "In total",
        footer_tagline: "From 1974 to 2026",
        footer_edited_by: "Published by",
        author_by: "By",
        author_unknown: "Unknown author",
        load_more: "Load more",
        load_more_remaining: "remaining",
        load_more_aria: "Load more articles",
        badge_online: "Online",
        aria_lang_selector: "Language selection",
        aria_header_utility: "Services and utilities",
        aria_mega_menu: "Navigation menu",
        editorial_box_title: "EDITORIAL REVIEW BOX",
        editorial_aria: "Editorial review box",
        editorial_proposed_role: "Proposed role",
        editorial_notes: "Notes for the editorial team",
        editorial_submit: "Submit",
        editorial_role_none: "No change",
        editorial_role_portante: "core (portante)",
        editorial_role_strutturale: "structural",
        editorial_role_laterale: "lateral",
        editorial_role_trasversale: "transversal",
        editorial_directus_edit: "Edit in Directus",
        editorial_sending: "Sending\u2026",
        editorial_sent: "\u2713 Sent!",
        editorial_network_error: "Network error \u2014 try again.",
        meta_article_default_suffix: "Article published in Ombre e Luci",
        aria_article_bottom_nav: "Article footer navigation",
        badge_role_portante: "Core",
        badge_role_strutturale: "Structural",
        badge_role_laterale: "Lateral",
        badge_role_trasversale: "Transversal",
        formal_articolo: "Article",
        formal_intervista: "Interview",
        formal_recensione: "Review",
        formal_testimonianza: "Testimonial",
        formal_editoriale: "Editorial",
        formal_dialogo_aperto: "Open Dialogue",
        category_uncategorized: "To be categorized",
        // Categories (categoria_menu slug → display label)
        cat_fede_e_luce: "Faith and Light",
        cat_cultura: "Culture",
        cat_famiglia: "Family",
        cat_spiritualita: "Spirituality",
        cat_progetti: "Projects",
        cat_salute: "Health",
        cat_catechesi: "Catechesis",
        cat_scuola: "Education",
        cat_educazione_e_formazione: "Education and Training",
        cat_tempo_libero: "Leisure",
        cat_personaggi_che_ispirano: "Inspiring Figures",
        cat_lavoro: "Work",
        cat_sport: "Sport",
        // Homepage
        home_tagline: "A new perspective through disability",
        home_section_recent: "Recent",
        home_section_close_up: "Close Up",
        home_section_close_up_sub: "Personal stories from those who live this reality every day.",
        home_section_all_stories: "All stories \u2192",
        home_section_explore: "Explore",
        home_section_explore_sub: "Forty years of stories, reflections and encounters.",
        home_magazine_eyebrow: "The magazine \xB7 published quarterly since 1983",
        home_magazine_discover: "Discover the issue \u2192",
        home_magazine_archive: "All issues",
        home_magazine_all_issues: "All issues",
        home_magazine_archive_link: "All issues \u2192",
        home_section_join: "Get Involved",
        home_section_join_sub: "Ombre e Luci exists thanks to those who believe in it. There are many ways to be part of it.",
        home_join_support_title: "Support the magazine",
        home_join_support_text: "A donation, even a small recurring one, allows Ombre e Luci to continue publishing stories that matter.",
        home_join_support_btn: "Find out how \u2192",
        home_join_story_title: "Share your story",
        home_join_story_text: "Have you experienced something worth sharing? The truest stories come from those who have lived them.",
        home_join_story_btn: "Write to us \u2192",
        home_join_help_title: "Lend a hand",
        home_join_help_text: "Want to collaborate, volunteer or contribute in another way? We are always open.",
        home_join_help_btn: "Contact us \u2192",
        home_newsletter_row: "Stay connected:",
        home_newsletter_link: "subscribe to our newsletter",
        home_testi_cta_text: "Have you experienced something worth sharing?",
        home_testi_cta_link: "Write to us \u2192",
        // Search
        cerca_title: "Search",
        cerca_description: "Search over 3,500 articles in the Ombre e Luci archive since 1983.",
        cerca_placeholder: "Search articles, authors, themes\u2026",
        // Newsletter
        nl_eyebrow: "Newsletter",
        nl_title: "Stay in touch",
        nl_subtitle: "Each issue: articles selected by the editorial team, life stories, reflections on disability and fragility. No spam, unsubscribe any time.",
        nl_email_placeholder: "Your email",
        nl_subscribe: "Subscribe",
        nl_privacy_prefix: 'By clicking "Subscribe" you accept our',
        nl_privacy_link: "Privacy Policy",
        nl_prev_title: "Previous newsletters",
        nl_explore_title: "Explore magazine themes",
        nl_archive_link: "All issues \u2192",
        // About
        about_title: "About Us",
        about_cta_read: "Read the articles",
        about_cta_support: "Support us",
        about_magazine_section: "The Magazine",
        about_timeline_section: "Family Album",
        about_team_section: "Editorial Team",
        about_how_we_work_section: "How we work",
        about_legacy_section: "Historical Editorial Team",
        about_legacy_archive_link: "Historical team",
        about_legacy_archive_arrow: "\u2192",
        about_collaborators_section: "Contributors",
        about_collaborators_lead: "Journalists, translators and professionals who contribute to the magazine.",
        about_authors_section: "Wrote for us",
        about_contacts_section: "Info and editorial contacts",
        about_read_more: "Read more",
        about_see_all_authors: "See all authors",
        about_contact_email_label: "Email",
        about_contact_phone_label: "Phone / WhatsApp",
        about_contact_address_label: "Where to find us",
        about_hours_section: "Opening hours",
        // Support
        support_donate_now: "Donate now",
        support_others_label: "Other ways to support us",
        support_wire_label: "Wire transfer",
        support_wire_hint: "You can set up a recurring transfer from your bank.",
        support_fivepermille_label: "5\xD71000 (Italy only)",
        support_fivepermille_hint: 'It costs you nothing. Sign in the "Sostegno del volontariato" box and enter the tax code.',
        support_subscription_label: "Subscription",
        support_subscription_discover: "Find out about subscription",
        support_impact_label: "What you make possible",
        support_impact_close: "Every euro goes where it counts.",
        support_faq_label: "Frequently asked questions",
        // Archive
        archive_title: "Magazine",
        archive_subtitle: "Browse the issues of Ombre e Luci magazine since 1977.",
        archive_filter_year: "Year",
        archive_filter_all: "All",
        archive_filter_type: "Magazine type",
        archive_results_suffix: "issues",
        archive_no_results_title: "No issues found",
        archive_no_results_body: "Try changing the filters.",
        archive_webonly_title: "Published online",
        archive_webonly_desc: "Articles published on the website only, without a print issue.",
        // Issue
        issue_browse_online: "Browse online",
        issue_articles_heading: "Articles in this issue",
        issue_prev: "Previous issue",
        issue_next: "Next issue",
        archive_tab_last: "Latest issue",
        archive_tab_all: "All issues",
        archive_filters_label: "Filters",
        archive_read_issue: "Read this issue \u2192",
        issue_back_archive: "\u2190 Magazine",
        // Diaries
        diaries_title: "The Diaries of Ombre e Luci",
        diaries_all_feed_title: "All diaries",
        // Open Dialogue
        dialogue_title: "Open Dialogue",
        // Themes (tema_label → display label)
        tema_catechesi: "Catechesis",
        tema_cultura: "Culture",
        tema_da_categorizzare: "Uncategorized",
        tema_educazione_e_formazione: "Education and Training",
        tema_famiglia: "Family",
        tema_fede_e_luce: "Faith and Light",
        tema_lavoro: "Work",
        tema_personaggi_che_ispirano: "Inspiring Figures",
        tema_progetti: "Projects",
        tema_salute: "Health",
        tema_scuola: "Education",
        tema_spiritualita: "Spirituality",
        tema_sport: "Sport",
        tema_tempo_libero: "Leisure"
      }
    };
    CAT_SLUG_TO_I18N_KEY = {
      "fede-e-luce": "cat_fede_e_luce",
      "Fede e Luce": "cat_fede_e_luce",
      cultura: "cat_cultura",
      "Cultura": "cat_cultura",
      famiglia: "cat_famiglia",
      "Famiglia": "cat_famiglia",
      spiritualita: "cat_spiritualita",
      progetti: "cat_progetti",
      salute: "cat_salute",
      catechesi: "cat_catechesi",
      scuola: "cat_scuola",
      "educazione-e-formazione": "cat_educazione_e_formazione",
      "tempo-libero": "cat_tempo_libero",
      "Tempo libero": "cat_tempo_libero",
      "personaggi-che-ispirano": "cat_personaggi_che_ispirano",
      lavoro: "cat_lavoro",
      sport: "cat_sport"
    };
    TEMA_IT_TO_I18N_KEY = {
      Catechesi: "tema_catechesi",
      Cultura: "tema_cultura",
      "Da categorizzare": "tema_da_categorizzare",
      "Educazione e Formazione": "tema_educazione_e_formazione",
      Famiglia: "tema_famiglia",
      "Fede e Luce": "tema_fede_e_luce",
      Lavoro: "tema_lavoro",
      "Personaggi che ispirano": "tema_personaggi_che_ispirano",
      Progetti: "tema_progetti",
      Salute: "tema_salute",
      Scuola: "tema_scuola",
      "Spiritualit\xE0": "tema_spiritualita",
      Sport: "tema_sport",
      "Tempo libero": "tema_tempo_libero"
    };
    __name(localizeCategory, "localizeCategory");
    __name(localizeTheme, "localizeTheme");
    FORMAL_IT_TO_I18N_KEY = {
      Articolo: "formal_articolo",
      Intervista: "formal_intervista",
      Recensione: "formal_recensione",
      Testimonianza: "formal_testimonianza",
      Editoriale: "formal_editoriale",
      "Dialogo Aperto": "formal_dialogo_aperto"
    };
    __name(localizeFormalType, "localizeFormalType");
    IT_MONTH_TO_EN = [
      [/Gennaio/gi, "January"],
      [/Febbraio/gi, "February"],
      [/Marzo/gi, "March"],
      [/Aprile/gi, "April"],
      [/Maggio/gi, "May"],
      [/Giugno/gi, "June"],
      [/Luglio/gi, "July"],
      [/Agosto/gi, "August"],
      [/Settembre/gi, "September"],
      [/Ottobre/gi, "October"],
      [/Novembre/gi, "November"],
      [/Dicembre/gi, "December"]
    ];
    __name(localizeIssuePeriodLabel, "localizeIssuePeriodLabel");
    __name(getAuthorBasePath, "getAuthorBasePath");
    __name(getLangFromUrl, "getLangFromUrl");
    __name(t, "t");
    iconTranslate = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-translate" viewBox="0 0 16 16">\n  <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z"/>\n  <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492 2 2 0 0 1-.94.31"/>\n</svg>';
    $$Astro$3 = createAstro("https://ombreeluci.it");
    $$LanguageSelector = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
      Astro2.self = $$LanguageSelector;
      const { pathname, alternateArticleUrl = null, lang: langProp } = Astro2.props;
      const lang = langProp ?? getLangFromUrl(pathname);
      const hrefIt = lang === "en" ? alternateArticleUrl ?? "/" : pathname ?? "/";
      const hrefEn = lang === "it" ? alternateArticleUrl ?? "/en" : pathname ?? "/en";
      const langs = [
        { code: "IT", href: hrefIt, active: lang === "it" },
        { code: "EN", href: hrefEn, active: lang === "en" }
      ];
      return renderTemplate`${maybeRenderHead()}<div class="ls-wrap"${addAttribute(t(lang, "aria_lang_selector"), "aria-label")} data-astro-cid-ltpqzwiw> <!-- Icona translate --> <button class="ls-icon-btn" id="ls-toggle" aria-expanded="false" aria-haspopup="true"${addAttribute(t(lang, "aria_lang_selector"), "aria-label")} data-astro-cid-ltpqzwiw> <span class="ls-btn-icon" aria-hidden="true" data-astro-cid-ltpqzwiw>${unescapeHTML(iconTranslate)}</span> <span class="ls-btn-lang" aria-hidden="true" data-astro-cid-ltpqzwiw>${lang.toUpperCase()}</span> </button> <!-- Pill desktop (sempre visibile su ≥768px): icona + codici lingua --> <div class="ls-pill" role="list" data-astro-cid-ltpqzwiw> <span class="ls-pill-icon" aria-hidden="true" data-astro-cid-ltpqzwiw>${unescapeHTML(iconTranslate)}</span> ${langs.map((l) => renderTemplate`<a${addAttribute(l.href, "href")}${addAttribute(["ls-code", l.active && "ls-code--active"], "class:list")}${addAttribute(l.active ? "true" : void 0, "aria-current")} role="listitem" data-astro-cid-ltpqzwiw>${l.code}</a>`)} </div> <!-- Dropdown mobile (visibile solo su <768px quando aperto) --> <div class="ls-dropdown" id="ls-dropdown" aria-hidden="true" role="list" data-astro-cid-ltpqzwiw> ${langs.map((l) => renderTemplate`<a${addAttribute(l.href, "href")}${addAttribute(["ls-code", l.active && "ls-code--active"], "class:list")}${addAttribute(l.active ? "true" : void 0, "aria-current")} role="listitem" tabindex="-1" data-astro-cid-ltpqzwiw>${l.code}</a>`)} </div> </div>  `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/LanguageSelector.astro", void 0);
    $$Astro$2 = createAstro("https://ombreeluci.it");
    $$AutocompleteWidget = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
      Astro2.self = $$AutocompleteWidget;
      const { lang, searchHref } = Astro2.props;
      const appId = "1BM5L8XRYW";
      const searchKey = "af13f70e8d751ead7da2b227c062d456";
      return renderTemplate`<!-- No-JS fallback: form originale visibile senza JS -->${maybeRenderHead()}<form class="search-form" id="aa-fallback-form"${addAttribute(searchHref, "action")} method="get"${addAttribute(lang === "en" ? "Search" : "Cerca", "aria-label")} data-astro-cid-uasdyt2x> <label for="aa-fallback-input" class="search-label" data-astro-cid-uasdyt2x> ${lang === "en" ? "Search" : "Cerca nel sito"} </label> <input id="aa-fallback-input" type="search" name="q"${addAttribute(lang === "en" ? "Search articles, authors\u2026" : "Cerca articoli, autori\u2026", "placeholder")} class="search-input" autocomplete="off" data-astro-cid-uasdyt2x> <button type="submit" class="search-button"${addAttribute(lang === "en" ? "Search" : "Cerca", "aria-label")} data-astro-cid-uasdyt2x> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-uasdyt2x> <circle cx="11" cy="11" r="8" data-astro-cid-uasdyt2x></circle> <path d="m21 21-4.35-4.35" data-astro-cid-uasdyt2x></path> </svg> </button> </form> <!-- Container autocomplete (popolato da JS, nascosto di default) --> <div id="aa-container" class="search-form" style="display:none"${addAttribute(lang, "data-lang")}${addAttribute(searchHref, "data-search-href")}${addAttribute(appId, "data-app-id")}${addAttribute(searchKey, "data-search-key")} data-astro-cid-uasdyt2x></div>   `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/AutocompleteWidget.astro", void 0);
    $$Astro$1 = createAstro("https://ombreeluci.it");
    $$Header = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
      Astro2.self = $$Header;
      const { pathname = Astro2.url.pathname, alternateArticleUrl = null, lang: langProp, heroHeader } = Astro2.props;
      const lang = langProp ?? getLangFromUrl(pathname);
      const ultimoNumero = ultimoNumeroData;
      function isActive(href) {
        if (href === "/")
          return pathname === "/";
        return pathname === href || pathname.startsWith(href + "/");
      }
      __name(isActive, "isActive");
      const catBase = lang === "en" ? "/en/category" : "/it/categoria";
      const catSlug = /* @__PURE__ */ __name((itSlug) => getCategoriaUrlSlug(itSlug, lang), "catSlug");
      const temi = getThemesWithSlugs().filter((t2) => t2.nomeCompleto !== "Personaggi che ispirano").map((t2) => ({ ...t2, nome: lang === "it" ? t2.nome : getCategoriaLabel(t2.slug, lang) ?? t2.nome, href: `${catBase}/${catSlug(t2.slug)}` }));
      const homeHref = lang === "en" ? "/en/" : "/";
      const aboutHref = lang === "en" ? "/en/about/" : "/it/chi-siamo";
      const nlHref = lang === "en" ? "/en/newsletter/" : "/it/newsletter/";
      const supportHref = lang === "en" ? "/en/support-us/" : "/it/sostienici";
      const archiveHref = lang === "en" ? "/en/archive/" : "/it/archivio";
      const authorsHref = lang === "en" ? "/en/authors/" : "/it/autori";
      const searchHref = lang === "en" ? "/en/search/" : "/it/cerca/";
      const issueSlug = ultimoNumero ? String(ultimoNumero.id_numero).toLowerCase().replace(/[^a-z0-9-]/g, "-") : "";
      const issueHref = lang === "en" ? `/en/archive/${issueSlug}` : `/it/archivio/${issueSlug}`;
      const sezioniForme = rubricheData.map((r2) => ({
        nome: lang === "en" ? r2.en : r2.it,
        href: lang === "en" ? `/en/sections/${r2.en_slug}/` : `/it/rubriche/${r2.slug}/`
      }));
      const focusHref = lang === "en" ? "/en/focus/" : "/it/focus/";
      const archivioLinks = [
        { nome: t(lang, "nav_latest"), slug: homeHref },
        { nome: t(lang, "nav_focus"), slug: focusHref },
        { nome: t(lang, "nav_newsletter"), slug: nlHref },
        { nome: t(lang, "nav_authors"), slug: authorsHref },
        { nome: t(lang, "search_label"), slug: searchHref }
      ];
      return renderTemplate`${maybeRenderHead()}<header class="header" id="site-header" data-pagefind-ignore${addAttribute(heroHeader ? "true" : void 0, "data-hero")} data-astro-cid-3ef6ksr2> <div class="header-bar" data-astro-cid-3ef6ksr2> <div class="header-inner" data-astro-cid-3ef6ksr2> <a${addAttribute(homeHref, "href")} class="logo-link" aria-label="Ombre e Luci - Home" data-astro-cid-3ef6ksr2> <img${addAttribute(logo.src, "src")} alt="Ombre e Luci" class="logo" data-astro-cid-3ef6ksr2> </a> <div class="search-wrap" data-astro-cid-3ef6ksr2> ${renderComponent($$result, "AutocompleteWidget", $$AutocompleteWidget, { "lang": lang, "searchHref": searchHref, "data-astro-cid-3ef6ksr2": true })} </div> <div class="header-end" data-astro-cid-3ef6ksr2> ${renderComponent($$result, "LanguageSelector", $$LanguageSelector, { "lang": lang, "pathname": pathname, "alternateArticleUrl": alternateArticleUrl, "data-astro-cid-3ef6ksr2": true })} <nav class="header-nav"${addAttribute(t(lang, "aria_header_utility"), "aria-label")} data-astro-cid-3ef6ksr2> <a${addAttribute(aboutHref, "href")}${addAttribute(["header-link", { "header-link--active": isActive(aboutHref) }], "class:list")} data-astro-cid-3ef6ksr2>${t(lang, "nav_about")}</a> <a${addAttribute(archiveHref, "href")}${addAttribute(["header-link", { "header-link--active": isActive(archiveHref) }], "class:list")} data-astro-cid-3ef6ksr2>${t(lang, "archive_title")}</a> </nav> <button type="button" class="mobile-search-btn" id="mobile-search-btn"${addAttribute(t(lang, "search_label"), "aria-label")} aria-expanded="false" aria-controls="mobile-search-overlay" data-astro-cid-3ef6ksr2> <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-3ef6ksr2> <circle cx="11" cy="11" r="8" data-astro-cid-3ef6ksr2></circle> <path d="m21 21-4.35-4.35" data-astro-cid-3ef6ksr2></path> </svg> </button> <a${addAttribute(supportHref, "href")} class="header-cta" data-astro-cid-3ef6ksr2>${t(lang, "nav_contribute")}</a> <button type="button" class="menu-trigger" id="menu-trigger"${addAttribute(t(lang, "nav_menu_open"), "aria-label")} aria-expanded="false" aria-controls="mega-menu"${addAttribute(t(lang, "nav_menu_open"), "data-label-open")}${addAttribute(t(lang, "nav_menu_close"), "data-label-close")} data-astro-cid-3ef6ksr2> <span class="menu-trigger-icon" aria-hidden="true" data-astro-cid-3ef6ksr2> <span class="hamburger-line" data-astro-cid-3ef6ksr2></span> <span class="hamburger-line" data-astro-cid-3ef6ksr2></span> <span class="hamburger-line" data-astro-cid-3ef6ksr2></span> </span> <span class="menu-trigger-close" aria-hidden="true" data-astro-cid-3ef6ksr2> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" data-astro-cid-3ef6ksr2> <path d="M18 6 6 18M6 6l12 12" data-astro-cid-3ef6ksr2></path> </svg> </span> <span class="menu-trigger-label" data-astro-cid-3ef6ksr2>${t(lang, "nav_menu")}</span> </button> </div> </div> </div> <div class="mobile-search-overlay" id="mobile-search-overlay" aria-hidden="true" data-astro-cid-3ef6ksr2> <form class="mobile-search-form"${addAttribute(searchHref, "action")} method="get"${addAttribute(t(lang, "search_label"), "aria-label")} data-astro-cid-3ef6ksr2> <input id="mobile-search-input" type="search" name="q"${addAttribute(t(lang, "search_placeholder"), "placeholder")} class="mobile-search-input" autocomplete="off" data-astro-cid-3ef6ksr2> <button type="submit" class="mobile-search-submit"${addAttribute(t(lang, "search_label"), "aria-label")} data-astro-cid-3ef6ksr2> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-3ef6ksr2> <circle cx="11" cy="11" r="8" data-astro-cid-3ef6ksr2></circle> <path d="m21 21-4.35-4.35" data-astro-cid-3ef6ksr2></path> </svg> </button> </form> </div> <div class="mega-menu" id="mega-menu" role="dialog" aria-modal="true"${addAttribute(t(lang, "aria_mega_menu"), "aria-label")} aria-hidden="true" data-astro-cid-3ef6ksr2> <div class="mega-menu-inner" data-astro-cid-3ef6ksr2> <div class="mega-menu-container" data-astro-cid-3ef6ksr2> <div class="mega-menu-grid" data-astro-cid-3ef6ksr2> <div class="mega-menu-block" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_themes")}</h3> <ul class="mega-menu-list mega-menu-list--grid" data-astro-cid-3ef6ksr2> ${temi.map((cat) => renderTemplate`<li data-astro-cid-3ef6ksr2> <a${addAttribute(cat.href, "href")}${addAttribute(["mega-menu-link", { "mega-menu-link--active": isActive(cat.href) }], "class:list")} data-astro-cid-3ef6ksr2>${cat.nome}</a> </li>`)} </ul> </div> <div class="mega-menu-col-mid" data-astro-cid-3ef6ksr2> <div class="mega-menu-block" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_sections")}</h3> <ul class="mega-menu-list" data-astro-cid-3ef6ksr2> ${sezioniForme.map((cat) => renderTemplate`<li data-astro-cid-3ef6ksr2> <a${addAttribute(cat.href, "href")}${addAttribute(["mega-menu-link", { "mega-menu-link--active": isActive(cat.href) }], "class:list")} data-astro-cid-3ef6ksr2>${cat.nome}</a> </li>`)} </ul> </div> <div class="mega-menu-block" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_archive")}</h3> <ul class="mega-menu-list" data-astro-cid-3ef6ksr2> ${archivioLinks.map((item) => renderTemplate`<li data-astro-cid-3ef6ksr2> <a${addAttribute(item.slug, "href")}${addAttribute(["mega-menu-link", { "mega-menu-link--active": isActive(item.slug) }], "class:list")} data-astro-cid-3ef6ksr2>${item.nome}</a> </li>`)} </ul> <div class="mega-menu-social mega-menu-social--desktop" data-astro-cid-3ef6ksr2> <a href="https://www.facebook.com/OmbreeLuciRivista/" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="Facebook" data-astro-cid-3ef6ksr2> <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" data-astro-cid-3ef6ksr2></path></svg> </a> <a href="https://www.instagram.com/ombreeluci_magazine/" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="Instagram" data-astro-cid-3ef6ksr2> <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" data-astro-cid-3ef6ksr2></path></svg> </a> <a href="https://www.youtube.com/channel/UCypEHP-N_RaUiz1BcBsplVQ" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="YouTube" data-astro-cid-3ef6ksr2> <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" data-astro-cid-3ef6ksr2></path></svg> </a> <a href="https://x.com/Ombre_Luci" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="X" data-astro-cid-3ef6ksr2> <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" data-astro-cid-3ef6ksr2></path></svg> </a> </div> </div> </div> <div class="mega-menu-block mega-menu-last-issue" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_last_issue")}</h3> ${ultimoNumero ? renderTemplate`<div class="last-issue-inner" data-astro-cid-3ef6ksr2> <a${addAttribute(issueHref, "href")} class="last-issue-cover-wrap" data-astro-cid-3ef6ksr2> ${renderTemplate`<img${addAttribute(ultimoNumero.copertina_url, "src")}${addAttribute(ultimoNumero.titolo_numero, "alt")} class="last-issue-cover" loading="lazy" data-astro-cid-3ef6ksr2>`} </a> <div class="last-issue-meta" data-astro-cid-3ef6ksr2> <p class="last-issue-label" data-astro-cid-3ef6ksr2>${lang === "en" ? "Issue" : "Numero"} ${ultimoNumero.numero_progressivo} · ${ultimoNumero.anno_pubblicazione}</p> <h4 class="last-issue-title" data-astro-cid-3ef6ksr2>${ultimoNumero.titolo_numero}</h4> ${renderTemplate`<p class="last-issue-period" data-astro-cid-3ef6ksr2>${localizeIssuePeriodLabel(ultimoNumero.periodo_label, lang)}</p>`} <a${addAttribute(supportHref, "href")} class="mega-menu-cta" data-astro-cid-3ef6ksr2>${t(lang, "nav_support")}</a> </div> </div>` : renderTemplate`<a${addAttribute(supportHref, "href")} class="mega-menu-cta" data-astro-cid-3ef6ksr2>${t(lang, "nav_support")}</a>`} </div> <!-- Footer mobile megamenu: Chi siamo + social (nascosto su desktop) --> <div class="mega-menu-mobile-footer" data-astro-cid-3ef6ksr2> <a${addAttribute(aboutHref, "href")} class="mega-menu-link mega-menu-link--footer" data-astro-cid-3ef6ksr2>${t(lang, "nav_about")}</a> <div class="mega-menu-social" data-astro-cid-3ef6ksr2> <a href="https://www.facebook.com/OmbreeLuciRivista/" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="Facebook" data-astro-cid-3ef6ksr2> <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" data-astro-cid-3ef6ksr2></path></svg> </a> <a href="https://www.instagram.com/ombreeluci_magazine/" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="Instagram" data-astro-cid-3ef6ksr2> <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" data-astro-cid-3ef6ksr2></path></svg> </a> <a href="https://www.youtube.com/channel/UCypEHP-N_RaUiz1BcBsplVQ" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="YouTube" data-astro-cid-3ef6ksr2> <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" data-astro-cid-3ef6ksr2></path></svg> </a> <a href="https://x.com/Ombre_Luci" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="X" data-astro-cid-3ef6ksr2> <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" data-astro-cid-3ef6ksr2></path></svg> </a> </div> </div> </div> </div> </div> </div> </header>    `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/Header.astro", void 0);
    CF = "96000680585";
    CODICE_FISCALE = CF;
    RUNTS = "15031";
    __freeze = Object.freeze;
    __defProp2 = Object.defineProperty;
    __template = /* @__PURE__ */ __name((cooked, raw) => __freeze(__defProp2(cooked, "raw", { value: __freeze(cooked.slice()) })), "__template");
    $$Astro = createAstro("https://ombreeluci.it");
    $$Footer = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
      Astro2.self = $$Footer;
      const { pathname = "/", lang: langProp } = Astro2.props;
      const lang = langProp ?? getLangFromUrl(pathname);
      const catBase = lang === "en" ? "/en/category" : "/it/categoria";
      const catSlug = /* @__PURE__ */ __name((itSlug) => getCategoriaUrlSlug(itSlug, lang), "catSlug");
      const temi = getThemesWithSlugs().map((t2) => ({
        ...t2,
        nome: getCategoriaLabel(t2.slug, lang) ?? t2.nome,
        href: `${catBase}/${catSlug(t2.slug)}`
      }));
      const meta = Math.ceil(temi.length / 2);
      const temiCol1 = temi.slice(0, meta);
      const temiCol2 = temi.slice(meta);
      const sezioniFormali = rubricheData.map((r2) => ({
        nome: lang === "en" ? r2.en : r2.it,
        href: lang === "en" ? `/en/sections/${r2.en_slug}/` : `/it/rubriche/${r2.slug}/`
      }));
      const aboutLinks = [
        { nome: t(lang, "footer_about"), slug: lang === "en" ? "/en/about/" : "/it/chi-siamo" },
        { nome: t(lang, "footer_redaction"), slug: lang === "en" ? "/en/about/#la-redazione" : "/it/chi-siamo#la-redazione" },
        { nome: t(lang, "footer_redaction_history"), slug: lang === "en" ? "/en/about/#redazione-storica" : "/it/chi-siamo#redazione-storica" },
        { nome: t(lang, "footer_collaborators"), slug: lang === "en" ? "/en/about/#collaboratori" : "/it/chi-siamo#collaboratori" },
        { nome: t(lang, "footer_wrote_for_us"), slug: lang === "en" ? "/en/about/#hanno-scritto-per-noi" : "/it/chi-siamo#hanno-scritto-per-noi" },
        { nome: t(lang, "footer_diari"), slug: lang === "en" ? "/en/sections/diaries/" : "/it/rubriche/diari/" },
        { nome: t(lang, "footer_contacts"), slug: lang === "en" ? "/en/about/#contatti" : "/it/chi-siamo#contatti" },
        { nome: t(lang, "nav_newsletter"), slug: lang === "en" ? "/en/newsletter/" : "/it/newsletter" }
      ];
      const legalLinks = [
        { nome: t(lang, "footer_privacy"), url: "https://www.iubenda.com/privacy-policy/66379072" },
        { nome: t(lang, "footer_cookies"), url: "https://www.iubenda.com/privacy-policy/66379072/cookie-policy" },
        { nome: t(lang, "footer_terms"), url: "https://www.iubenda.com/termini-e-condizioni/66379072" }
      ];
      const socialLinks = [
        { nome: "Facebook", url: "https://www.facebook.com/OmbreeLuciRivista/", icon: "facebook" },
        { nome: "Instagram", url: "https://www.instagram.com/ombreeluci_magazine/", icon: "instagram" },
        { nome: "X", url: "https://x.com/Ombre_Luci", icon: "x" },
        { nome: "YouTube", url: "https://www.youtube.com/channel/UCypEHP-N_RaUiz1BcBsplVQ", icon: "youtube" },
        { nome: "TikTok", url: "#", icon: "tiktok" }
      ];
      const homeHref = lang === "en" ? "/en/" : "/";
      const footerLegalText = lang === "en" ? "Quarterly magazine. Registered publication at the Court of Rome, registration no. 1 of January 16, 2020. Editorial office and administration: Via dei Cessati Spiriti 3, 00185 Rome." : "Rivista trimestrale. Testata registrata presso il Tribunale di Roma, iscrizione n. 1 del 16 gennaio 2020. Direzione, redazione e amministrazione: Via dei Cessati Spiriti 3, 00185 Roma.";
      const footerCcText = lang === "en" ? "(c) 1974-2026 Unless otherwise indicated, the content of this site is licensed under" : "(c) 1974-2026 Eccetto dove diversamente indicato, il contenuto di questo sito \xE8 concesso in licenza";
      const ccLicenseLabel = lang === "en" ? "Creative Commons: Attribution - NonCommercial - ShareAlike 4.0 International (CC BY-NC-SA 4.0)" : "Creative Commons: Attribuzione - Non commerciale - Condividi allo stesso modo 4.0 Internazionale (CC BY-NC-SA 4.0)";
      return renderTemplate(_a || (_a = __template(["", '<div class="footer-reveal-wrap" data-astro-cid-sz7xmlte> <div class="reveal-spacer" aria-hidden="true" data-astro-cid-sz7xmlte></div> <footer class="site-footer" id="site-footer" role="contentinfo" data-pagefind-ignore data-astro-cid-sz7xmlte> <div class="footer-inner" data-astro-cid-sz7xmlte> <div class="footer-grid" data-astro-cid-sz7xmlte> <!-- Colonna 1: Identit\xE0 (logo, tagline, editore, legale, social in fondo) --> <div class="footer-col footer-col-identity" data-astro-cid-sz7xmlte> <a', ' class="footer-logo-link" data-astro-cid-sz7xmlte> <img', ' alt="Ombre e Luci" class="footer-logo" width="160" height="55" data-astro-cid-sz7xmlte> </a> <p class="footer-tagline" data-astro-cid-sz7xmlte>', '</p> <p class="footer-editor" data-astro-cid-sz7xmlte> ', ' <a href="https://www.fedeeluce.it" target="_blank" rel="noopener noreferrer" class="footer-link" data-astro-cid-sz7xmlte>Associazione Fede e Luce A.P.S.</a> </p> <p class="footer-legal" data-astro-cid-sz7xmlte>', '</p> <div class="footer-social"', " data-astro-cid-sz7xmlte> ", ' </div> </div> <!-- Colonna 2: Chi siamo --> <div class="footer-col" data-astro-cid-sz7xmlte> <h3 class="footer-title" data-astro-cid-sz7xmlte>', '</h3> <ul class="footer-list" data-astro-cid-sz7xmlte> ', ' </ul> </div> <!-- Colonna 3: Temi (due colonne, una sola intestazione) --> <div class="footer-col footer-col-temi" data-astro-cid-sz7xmlte> <h3 class="footer-title" data-astro-cid-sz7xmlte>', '</h3> <div class="footer-temi-grid" data-astro-cid-sz7xmlte> <ul class="footer-list" data-astro-cid-sz7xmlte> ', ' </ul> <ul class="footer-list" data-astro-cid-sz7xmlte> ', ' </ul> </div> </div> <!-- Colonna 4: Sezioni --> <div class="footer-col" data-astro-cid-sz7xmlte> <h3 class="footer-title" data-astro-cid-sz7xmlte>', '</h3> <ul class="footer-list" data-astro-cid-sz7xmlte> ', ' </ul> </div> <!-- Colonna 5: Info & Privacy --> <div class="footer-col" data-astro-cid-sz7xmlte> <h3 class="footer-title" data-astro-cid-sz7xmlte>', '</h3> <ul class="footer-list" data-astro-cid-sz7xmlte> ', ' </ul> </div> </div> <div class="footer-bottom" data-astro-cid-sz7xmlte> <p class="footer-copy-cc" data-astro-cid-sz7xmlte><span class="footer-copy-inline" data-astro-cid-sz7xmlte>', '</span> <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.it" target="_blank" rel="noopener noreferrer" class="footer-link" data-astro-cid-sz7xmlte>', '</a>.</p> <p class="footer-legal-bottom" data-astro-cid-sz7xmlte>', " - C.F. ", " | ", " ", "</p> </div> </div> </footer> <!-- Fallback copertine: R2 404 / img rotta \u2192 placeholder (anche con View Transitions) --> <script>\n    (function () {\n      var ph = '/images/placeholder-copertina.svg';\n      function bindImg(img) {\n        if (img.getAttribute('data-copertina-fallback') == null) return;\n        if (img.dataset.copertinaFallbackJs === '1') return;\n        img.dataset.copertinaFallbackJs = '1';\n        img.addEventListener(\n          'error',\n          function () {\n            try {\n              var u = String(img.getAttribute('src') || '');\n              if (u.indexOf(ph) === -1) {\n                img.removeAttribute('srcset');\n                img.src = ph;\n              }\n            } catch (e) {}\n          },\n          { capture: false }\n        );\n      }\n      function bindAll() {\n        document.querySelectorAll('img[data-copertina-fallback]').forEach(bindImg);\n      }\n      bindAll();\n      document.addEventListener('astro:page-load', bindAll);\n    })();\n  <\/script> </div> "])), maybeRenderHead(), addAttribute(homeHref, "href"), addAttribute(logo.src, "src"), t(lang, "footer_tagline"), t(lang, "footer_edited_by"), footerLegalText, addAttribute(lang === "en" ? "Follow us" : "Seguici", "aria-label"), socialLinks.map((s) => renderTemplate`<a${addAttribute(s.url, "href")} target="_blank" rel="noopener noreferrer" class="footer-social-link"${addAttribute(s.nome, "aria-label")} data-astro-cid-sz7xmlte> ${s.icon === "facebook" && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" data-astro-cid-sz7xmlte></path></svg>`} ${s.icon === "instagram" && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" data-astro-cid-sz7xmlte></path></svg>`} ${s.icon === "x" && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" data-astro-cid-sz7xmlte></path></svg>`} ${s.icon === "youtube" && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" data-astro-cid-sz7xmlte></path></svg>`} ${s.icon === "tiktok" && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" data-astro-cid-sz7xmlte></path></svg>`} </a>`), t(lang, "footer_about"), aboutLinks.map((item) => renderTemplate`<li data-astro-cid-sz7xmlte> <a${addAttribute(item.slug, "href")} class="footer-link" data-astro-cid-sz7xmlte>${item.nome}</a> </li>`), t(lang, "nav_themes"), temiCol1.map((cat) => renderTemplate`<li data-astro-cid-sz7xmlte> <a${addAttribute(cat.href, "href")} class="footer-link" data-astro-cid-sz7xmlte>${cat.nome}</a> </li>`), temiCol2.map((cat) => renderTemplate`<li data-astro-cid-sz7xmlte> <a${addAttribute(cat.href, "href")} class="footer-link" data-astro-cid-sz7xmlte>${cat.nome}</a> </li>`), t(lang, "nav_sections"), sezioniFormali.map((cat) => renderTemplate`<li data-astro-cid-sz7xmlte> <a${addAttribute(cat.href, "href")} class="footer-link" data-astro-cid-sz7xmlte>${cat.nome}</a> </li>`), t(lang, "footer_info_privacy"), legalLinks.map((item) => renderTemplate`<li data-astro-cid-sz7xmlte> <a${addAttribute(item.url, "href")} target="_blank" rel="noopener noreferrer" class="footer-link" data-astro-cid-sz7xmlte>${item.nome}</a> </li>`), footerCcText, ccLicenseLabel, lang === "en" ? "Fede e Luce Association APS" : "Associazione Fede e Luce Aps", CODICE_FISCALE, lang === "en" ? "RUNTS registration no." : "Iscrizione al RUNTS n.", RUNTS);
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/Footer.astro", void 0);
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/BaseLayout_DOaiilqT.mjs
var $$Astro$22, $$ViewTransitions, $$Astro$12, $$BaseHead, $$Astro2, $$BaseLayout;
var init_BaseLayout_DOaiilqT = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/BaseLayout_DOaiilqT.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_Footer_DN9MDnF9();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro$22 = createAstro("https://ombreeluci.it");
    $$ViewTransitions = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$22, $$props, $$slots);
      Astro2.self = $$ViewTransitions;
      const { fallback = "animate" } = Astro2.props;
      return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>`;
    }, "C:/Users/berto/Documents/Ombreeluci/node_modules/astro/components/ViewTransitions.astro", void 0);
    $$Astro$12 = createAstro("https://ombreeluci.it");
    $$BaseHead = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$12, $$props, $$slots);
      Astro2.self = $$BaseHead;
      const {
        title,
        description = "Ombre e Luci: storie, riflessioni e cultura sulla fragilit\xE0 e sulla dignit\xE0 della persona. Dal 1983.",
        ogImage,
        ogType = "website",
        canonical,
        noindex = false,
        lang = "it",
        alternates = []
      } = Astro2.props;
      const SITE_NAME = "Ombre e Luci";
      const DEFAULT_OG_IMAGE = "https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev/copertine/og-default.jpg";
      const GOOGLE_SITE_VERIFICATION = "CHp0QtH-sw0M_ZYVjj6LRqHxV-4Z72IoYR_aiX9c6ZE";
      const pageTitle = title.includes(SITE_NAME) ? title : `${title} \u2013 ${SITE_NAME}`;
      const canonicalUrl = canonical ?? (Astro2.site ? new URL(Astro2.url.pathname, Astro2.site).href : Astro2.url.href);
      const ogImageUrl = ogImage ?? DEFAULT_OG_IMAGE;
      return renderTemplate`<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/png" href="/favicon.png"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="shortcut icon" href="/favicon.ico"><title>${pageTitle}</title><meta name="description"${addAttribute(description, "content")}>${noindex && renderTemplate`<meta name="robots" content="noindex, nofollow">`}<link rel="canonical"${addAttribute(canonicalUrl, "href")}><!-- Google Site Verification --><meta name="google-site-verification"${addAttribute(GOOGLE_SITE_VERIFICATION, "content")}><!-- Open Graph --><meta property="og:site_name"${addAttribute(SITE_NAME, "content")}><meta property="og:title"${addAttribute(pageTitle, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(ogImageUrl, "content")}><meta property="og:type"${addAttribute(ogType, "content")}><meta property="og:url"${addAttribute(canonicalUrl, "content")}><meta property="og:locale"${addAttribute(lang === "en" ? "en_US" : "it_IT", "content")}><!-- Twitter Card --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"${addAttribute(pageTitle, "content")}><meta name="twitter:description"${addAttribute(description, "content")}><meta name="twitter:image"${addAttribute(ogImageUrl, "content")}><!-- hreflang alternates -->${alternates.map(({ lang: l, url }) => renderTemplate`<link rel="alternate"${addAttribute(l, "hreflang")}${addAttribute(url, "href")}>`)}${alternates.length > 0 && renderTemplate`<link rel="alternate" hreflang="x-default"${addAttribute(alternates.find((a) => a.lang === "it")?.url ?? canonicalUrl, "href")}>`}<!-- Preconnect origini critiche --><link rel="preconnect" href="https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev"><!-- Slot per contenuto aggiuntivo (JSON-LD, meta custom) -->${renderSlot($$result, $$slots["default"])}${renderComponent($$result, "ViewTransitions", $$ViewTransitions, {})}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/BaseHead.astro", void 0);
    $$Astro2 = createAstro("https://ombreeluci.it");
    $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro2, $$props, $$slots);
      Astro2.self = $$BaseLayout;
      const { bodyClass, alternateArticleUrl = null, pathname: pathnameProp, heroHeader, ...headProps } = Astro2.props;
      const pathname = pathnameProp ?? Astro2.url.pathname;
      const lang = headProps.lang ?? "it";
      return renderTemplate`<html${addAttribute(lang, "lang")}> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { ...headProps }, { "default": ($$result2) => renderTemplate`${renderSlot($$result2, $$slots["head"])}` })}${renderHead()}</head> <body${addAttribute([bodyClass], "class:list")}> ${renderComponent($$result, "Header", $$Header, { "lang": lang, "pathname": pathname, "alternateArticleUrl": alternateArticleUrl, "heroHeader": heroHeader })} ${renderSlot($$result, $$slots["default"])} ${renderComponent($$result, "Footer", $$Footer, { "lang": lang, "pathname": pathname })} </body></html>`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/layouts/BaseLayout.astro", void 0);
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/directus_BvF_bImd.mjs
function readEnvString(key) {
  const fromImportMeta = Object.assign(__vite_import_meta_env__2, { DIRECTUS_URL: process.env.DIRECTUS_URL, DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN, PUBLIC: process.env.PUBLIC, _: process.env._ })?.[key]?.trim();
  if (fromImportMeta)
    return fromImportMeta;
  const fromProcess = define_globalThis_process_env_default?.[key]?.trim();
  if (fromProcess)
    return fromProcess;
  return "";
}
function resolveCreds(creds) {
  const rawUrl = creds?.url?.trim() || DIRECTUS_URL || DEFAULT_DIRECTUS_PUBLIC;
  const url = rawUrl.replace(/\/$/, "");
  const token = creds?.token?.trim() || DIRECTUS_TOKEN;
  return { url, token };
}
function directusCredsFromAstroLocals(locals) {
  const r2 = locals;
  const env = r2?.runtime?.env ?? r2?.locals?.runtime?.env ?? r2?.env;
  if (!env)
    return void 0;
  const o = {};
  if (typeof env.DIRECTUS_URL === "string" && env.DIRECTUS_URL.trim())
    o.url = env.DIRECTUS_URL.trim();
  if (typeof env.DIRECTUS_TOKEN === "string" && env.DIRECTUS_TOKEN.trim())
    o.token = env.DIRECTUS_TOKEN.trim();
  return Object.keys(o).length ? o : void 0;
}
function getDirectusAssetUrl(fileId) {
  const id = String(fileId || "").trim();
  const base = DIRECTUS_URL.replace(/\/$/, "");
  return `${base}/assets/${encodeURIComponent(id)}`;
}
function getImageUrl(fileId) {
  return getDirectusAssetUrl(fileId);
}
function getAutoreImageUrl(fileId) {
  return getDirectusAssetUrl(fileId);
}
function getNumeroImageUrl(numero) {
  if (numero.copertina)
    return `${DIRECTUS_URL}/assets/${numero.copertina}`;
  const u = numero.copertina_url?.trim();
  return u || null;
}
function getArticoloCopertinaSrc(articolo2) {
  const raw = articolo2?.immagine_copertina?.id;
  const id = typeof raw === "string" ? raw.trim() : "";
  if (!id)
    return null;
  return getImageUrl(id);
}
async function directusFetch(path, creds) {
  const { url: base, token } = resolveCreds(creds);
  const url = `${base}${path}`;
  try {
    const headers = {
      "Content-Type": "application/json"
    };
    if (token)
      headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, {
      headers
    });
    if (!res.ok) {
      console.error(`[directus] ${res.status} ${res.statusText} \u2014 ${url}`);
      return null;
    }
    const json2 = await res.json();
    return json2;
  } catch (err) {
    console.error(`[directus] Fetch error \u2014 ${url}:`, err);
    return null;
  }
}
async function getArticoloBySlug(slug, creds) {
  const slugClean = String(slug || "").replace(/\/$/, "");
  const params = new URLSearchParams({
    "filter[slug][_eq]": slugClean,
    "filter[stato][_eq]": "published",
    fields: [
      "*",
      "autore.id",
      "autore.slug",
      "autore.nome_completo",
      "autore.bio_html",
      "autore.foto.id",
      "autore.foto.filename_download",
      "numero_rivista.id",
      "numero_rivista.id_numero",
      "numero_rivista.display_title",
      "numero_rivista.anno_pubblicazione",
      "numero_rivista.copertina_url",
      "serie.id",
      "serie.slug",
      "serie.nome",
      "immagine_copertina.id",
      "immagine_copertina.filename_download",
      "temi.temi_id.id",
      "temi.temi_id.slug",
      "temi.temi_id.nome",
      "tags.tags_id.id",
      "tags.tags_id.slug",
      "tags.tags_id.nome",
      "articolo_traduzione.id",
      "articolo_traduzione.slug",
      "articolo_traduzione.lang"
    ].join(","),
    limit: "1"
  });
  const data = await directusFetch(
    `/items/articoli?${params}`,
    creds
  );
  if (!data || !data.data?.length)
    return null;
  return data.data[0];
}
async function getArticoliBySlugList(slugs, creds) {
  if (!slugs.length)
    return [];
  const params = new URLSearchParams({
    "filter[slug][_in]": slugs.join(","),
    "filter[stato][_eq]": "published",
    fields: [
      "id",
      "wp_id",
      "slug",
      "lang",
      "titolo",
      "sottotitolo",
      "stato",
      "data_pubblicazione",
      "categoria_menu",
      "ruolo_editoriale",
      "forma",
      "tema_label",
      "seo_description",
      "autore.id",
      "autore.slug",
      "autore.nome_completo",
      "numero_rivista.id",
      "numero_rivista.id_numero",
      "numero_rivista.display_title",
      "immagine_copertina.id",
      "immagine_copertina.filename_download"
    ].join(","),
    limit: String(slugs.length)
  });
  const data = await directusFetch(
    `/items/articoli?${params}`,
    creds
  );
  return data?.data ?? [];
}
async function getFallbackRelatedArticles({
  excludeSlug,
  lang,
  categoriaMenu,
  limit = 4
}, creds) {
  const params = new URLSearchParams({
    "filter[stato][_eq]": "published",
    "filter[slug][_neq]": excludeSlug,
    "filter[lang][_eq]": lang,
    fields: ARTICOLO_LIST_FIELDS,
    limit: String(limit),
    sort: "-data_pubblicazione"
  });
  if (categoriaMenu) {
    params.set("filter[categoria_menu][_eq]", categoriaMenu);
  }
  const data = await directusFetch(
    `/items/articoli?${params}`,
    creds
  );
  return data?.data ?? [];
}
async function getAllNumeriRivista() {
  const data = await directusFetch(
    `/items/numeri_rivista?fields=${NUMERO_FIELDS}&limit=-1&sort=anno_pubblicazione`
  );
  if (!data)
    return [];
  return data.data ?? [];
}
async function getArticoliByNumeroId(numeroId) {
  const params = new URLSearchParams({
    "filter[numero_rivista][_eq]": numeroId,
    "filter[stato][_eq]": "published",
    fields: ARTICOLO_LIST_FIELDS,
    limit: "-1",
    sort: "data_pubblicazione"
  });
  const data = await directusFetch(
    `/items/articoli?${params}`
  );
  return data?.data ?? [];
}
async function getCommentiForArticolo(articoloId, creds) {
  const params = new URLSearchParams({
    "filter[articolo][_eq]": articoloId,
    "filter[stato][_eq]": "approved",
    "sort": "data_creazione",
    "fields": "id,autore_nome,testo,data_creazione",
    "limit": "200"
  });
  const data = await directusFetch(
    `/items/commenti?${params}`,
    creds
  );
  return data?.data ?? [];
}
async function getTagBySlug(tagSlug, creds) {
  const params = new URLSearchParams({
    "filter[slug][_eq]": tagSlug,
    fields: "id,slug,nome",
    limit: "1"
  });
  const data = await directusFetch(`/items/tags?${params}`, creds);
  if (!data?.data?.length)
    return null;
  return data.data[0];
}
async function getArticoliByCategoria(categoriaSlug, lang, creds) {
  const params = new URLSearchParams({
    "filter[stato][_eq]": "published",
    "filter[categoria_menu][_eq]": categoriaSlug,
    fields: ARTICOLO_LIST_FIELDS,
    limit: "-1",
    sort: "-data_pubblicazione"
  });
  params.set("filter[lang][_eq]", lang);
  const data = await directusFetch(
    `/items/articoli?${params}`,
    creds
  );
  return data?.data ?? [];
}
async function getArticoliByForma(forma, lang, creds) {
  const params = new URLSearchParams({
    "filter[stato][_eq]": "published",
    "filter[forma][_eq]": forma,
    "filter[lang][_eq]": lang,
    fields: ARTICOLO_LIST_FIELDS,
    limit: "-1",
    sort: "-data_pubblicazione"
  });
  const data = await directusFetch(
    `/items/articoli?${params}`,
    creds
  );
  return data?.data ?? [];
}
async function getArticoliByTag(tagSlug, creds) {
  const params = new URLSearchParams({
    "filter[stato][_eq]": "published",
    "filter[tags][tags_id][slug][_eq]": tagSlug,
    fields: ARTICOLO_LIST_FIELDS,
    limit: "-1",
    sort: "-data_pubblicazione"
  });
  const data = await directusFetch(
    `/items/articoli?${params}`,
    creds
  );
  return data?.data ?? [];
}
var __vite_import_meta_env__2, define_globalThis_process_env_default, DEFAULT_DIRECTUS_PUBLIC, DIRECTUS_URL, DIRECTUS_TOKEN, COPERTINA_IMG_ONERROR, ARTICOLO_LIST_FIELDS, NUMERO_FIELDS, VERTICALE_FIELDS;
var init_directus_BvF_bImd = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/directus_BvF_bImd.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    __vite_import_meta_env__2 = { "ASSETS_PREFIX": void 0, "BASE_URL": "/", "DEV": false, "DIRECTUS_TOKEN": "ebgg-l6cPyahbgUOloDgmUteOvOOw7NH", "DIRECTUS_URL": "https://cms.ombreeluci.it", "MEDIA_BASE_URL": "https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev", "MODE": "production", "PROD": true, "PUBLIC_ALGOLIA_APP_ID": "1BM5L8XRYW", "PUBLIC_ALGOLIA_SEARCH_KEY": "af13f70e8d751ead7da2b227c062d456", "PUBLIC_KEYSTATIC_GITHUB_APP_SLUG": "keystatic-ombreeluci", "SITE": "https://ombreeluci.it", "SSR": true };
    define_globalThis_process_env_default = {};
    DEFAULT_DIRECTUS_PUBLIC = "https://cms.ombreeluci.it";
    __name(readEnvString, "readEnvString");
    DIRECTUS_URL = readEnvString("DIRECTUS_URL") || DEFAULT_DIRECTUS_PUBLIC;
    DIRECTUS_TOKEN = readEnvString("DIRECTUS_TOKEN");
    __name(resolveCreds, "resolveCreds");
    __name(directusCredsFromAstroLocals, "directusCredsFromAstroLocals");
    __name(getDirectusAssetUrl, "getDirectusAssetUrl");
    __name(getImageUrl, "getImageUrl");
    __name(getAutoreImageUrl, "getAutoreImageUrl");
    __name(getNumeroImageUrl, "getNumeroImageUrl");
    __name(getArticoloCopertinaSrc, "getArticoloCopertinaSrc");
    COPERTINA_IMG_ONERROR = "this.onerror=null;this.src='/images/placeholder-copertina.svg'";
    __name(directusFetch, "directusFetch");
    ARTICOLO_LIST_FIELDS = [
      "id",
      "wp_id",
      "slug",
      "lang",
      "titolo",
      "sottotitolo",
      "stato",
      "data_pubblicazione",
      "cluster_id",
      "umap_x",
      "umap_y",
      "umap_z",
      "seo_title",
      "seo_description",
      "categoria_menu",
      "ruolo_editoriale",
      "in_evidenza",
      "forma",
      "tema_label",
      "corpo",
      "has_comments",
      "original_url",
      "autore.id",
      "autore.slug",
      "autore.nome_completo",
      "autore.bio_html",
      "autore.foto.id",
      "autore.foto.filename_download",
      "numero_rivista.id",
      "numero_rivista.id_numero",
      "numero_rivista.display_title",
      "numero_rivista.anno_pubblicazione",
      "numero_rivista.pdf_archive_url",
      "numero_rivista.copertina_url",
      "immagine_copertina.id",
      "immagine_copertina.filename_download",
      "didascalia_copertina",
      "temi.temi_id.id",
      "temi.temi_id.slug",
      "temi.temi_id.nome",
      "tags.tags_id.id",
      "tags.tags_id.slug",
      "tags.tags_id.nome",
      "serie.id",
      "serie.slug",
      "serie.nome",
      "articolo_traduzione.id",
      "articolo_traduzione.slug",
      "articolo_traduzione.lang"
    ].join(",");
    __name(getArticoloBySlug, "getArticoloBySlug");
    __name(getArticoliBySlugList, "getArticoliBySlugList");
    __name(getFallbackRelatedArticles, "getFallbackRelatedArticles");
    NUMERO_FIELDS = "id,id_numero,display_title,titolo_tema,numero_progressivo,anno_pubblicazione,tipo,descrizione,pdf_archive_url,wp_url,copertina,copertina_url,periodo_label";
    __name(getAllNumeriRivista, "getAllNumeriRivista");
    __name(getArticoliByNumeroId, "getArticoliByNumeroId");
    __name(getCommentiForArticolo, "getCommentiForArticolo");
    __name(getTagBySlug, "getTagBySlug");
    __name(getArticoliByCategoria, "getArticoliByCategoria");
    __name(getArticoliByForma, "getArticoliByForma");
    __name(getArticoliByTag, "getArticoliByTag");
    VERTICALE_FIELDS = [
      "id",
      "slug",
      "slug_en",
      "titolo",
      "titolo_en",
      "seo_description",
      "seo_description_en",
      "tema_visivo",
      "hero_immagine",
      "hero_video_url",
      "intro",
      "intro_en",
      "testo_coda",
      "testo_coda_en",
      "pubblicato",
      "sezioni.id",
      "sezioni.tipo",
      "sezioni.ordine",
      "sezioni.titolo_sezione",
      "sezioni.titolo_sezione_en",
      "sezioni.testo",
      "sezioni.testo_en",
      "sezioni.immagine.id",
      "sezioni.layout_immagine",
      "sezioni.articoli.articolo_id.id",
      "sezioni.articoli.articolo_id.slug",
      "sezioni.articoli.articolo_id.titolo",
      "sezioni.articoli.articolo_id.sottotitolo",
      "sezioni.articoli.articolo_id.data_pubblicazione",
      "sezioni.articoli.articolo_id.immagine_copertina.id",
      "sezioni.articoli.articolo_id.autore.nome_completo",
      "sezioni.articoli.articolo_id.autore.slug",
      "sezioni.articoli.articolo_id.categoria_menu",
      "sezioni.articoli.articolo_id.forma"
    ].join(",");
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/ArticleCard_BcaTyrt5.mjs
function getPlaceholder(slug) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++)
    hash = hash * 31 + slug.charCodeAt(i) >>> 0;
  return PLACEHOLDERS[hash % PLACEHOLDERS.length];
}
var PLACEHOLDERS, $$Astro3, $$ArticleCard;
var init_ArticleCard_BcaTyrt5 = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/ArticleCard_BcaTyrt5.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_directus_BvF_bImd();
    init_Footer_DN9MDnF9();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    PLACEHOLDERS = [
      { src: "/placeholder/ph-1.jpg", caption: "Foto di Steve Johnson su Unsplash" },
      { src: "/placeholder/ph-2.jpg", caption: "Foto di Steve Johnson su Unsplash" },
      { src: "/placeholder/ph-3.jpg", caption: "Foto di Steve Johnson su Unsplash" },
      { src: "/placeholder/ph-4.jpg", caption: "Foto di vackground.com su Unsplash" }
    ];
    __name(getPlaceholder, "getPlaceholder");
    $$Astro3 = createAstro("https://ombreeluci.it");
    $$ArticleCard = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro3, $$props, $$slots);
      Astro2.self = $$ArticleCard;
      const {
        title,
        author,
        date,
        issue,
        slug,
        image,
        categoriaMenu,
        forma,
        ruoloEditoriale,
        lang = "it",
        horizontal = false,
        sottotitolo = null,
        authorImage = null,
        hideImage = false,
        basePath = "/it"
      } = Astro2.props;
      const hasIssue = issue != null && String(issue).trim() !== "";
      const imageSrc = !hideImage && image ? image : !hideImage ? getPlaceholder(slug ?? title ?? "").src : null;
      const localizedForma = forma ? localizeFormalType(forma, lang) : null;
      const genericFormalLabel = t(lang, "formal_articolo");
      const localizedCategoriaMenu = localizeCategory(categoriaMenu ?? null, lang) ?? categoriaMenu;
      const formaPrefix = localizedForma && localizedForma !== genericFormalLabel ? `${localizedForma} \xB7 ` : "";
      const badgeText = categoriaMenu ? `${formaPrefix}${localizedCategoriaMenu}` : hasIssue ? "" : t(lang, "badge_online");
      function authorSlug(name) {
        return String(name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      }
      __name(authorSlug, "authorSlug");
      const dateLocale = lang === "en" ? "en-US" : "it-IT";
      const formattedDate = new Intl.DateTimeFormat(dateLocale, {
        year: "numeric",
        month: "long",
        day: "numeric"
      }).format(date instanceof Date ? date : new Date(date));
      const authorLinkSlug = authorSlug(author);
      const authorBasePath = getAuthorBasePath(lang);
      return renderTemplate`${maybeRenderHead()}<div${addAttribute(`article-card${horizontal ? " article-card--horizontal" : ""}`, "class")} data-astro-cid-di2nlc57> <a${addAttribute(`${basePath}/${slug}`, "href")} class="article-link" data-astro-cid-di2nlc57> ${imageSrc && renderTemplate`<div class="article-image-wrap" data-astro-cid-di2nlc57> <img${addAttribute(imageSrc, "src")}${addAttribute(title, "alt")} loading="lazy" data-copertina-fallback${addAttribute(COPERTINA_IMG_ONERROR, "onerror")} data-astro-cid-di2nlc57> </div>`} <div class="article-meta" data-astro-cid-di2nlc57> ${badgeText && renderTemplate`<p class="article-badge" data-astro-cid-di2nlc57> <span class="article-badge-text" data-astro-cid-di2nlc57>${badgeText}</span> </p>`} <h3 class="article-title" data-astro-cid-di2nlc57>${title}</h3> ${horizontal && sottotitolo && renderTemplate`<p class="article-sottotitolo" data-astro-cid-di2nlc57>${sottotitolo}</p>`} </div> </a> <p class="author-row" data-astro-cid-di2nlc57> ${horizontal && authorImage && renderTemplate`<img${addAttribute(authorImage, "src")}${addAttribute(author, "alt")} class="author-avatar" loading="lazy" data-astro-cid-di2nlc57>`} ${t(lang, "author_by")} <a${addAttribute(`${authorBasePath}/${authorLinkSlug}`, "href")} class="author-link" data-astro-cid-di2nlc57>${author}</a> • ${formattedDate} </p> </div> `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/ArticleCard.astro", void 0);
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/cta_BwIVYshf.mjs
var articolo, archivio, ctaData;
var init_cta_BwIVYshf = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/cta_BwIVYshf.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    articolo = [
      {
        id: "cta-art-01",
        name: "Cosa fa Ombre e Luci",
        colore: "sage",
        it: {
          titolo: "Cosa fa Ombre e Luci?",
          testo: "Da oltre 40 anni raccogliamo storie di fragilit\xE0, disabilit\xE0 e inclusione. Non nascondiamo le ombre \u2014 le fatiche, i dolori, le barriere \u2014 ma cerchiamo sempre la luce che emerge: nelle relazioni, nelle conquiste, nella bellezza di chi impara ad accogliere la diversit\xE0 come ricchezza. Possiamo continuare a farlo grazie a chi sceglie di sostenerci.",
          cta: "Abbonati"
        },
        en: {
          titolo: "What is Ombre e Luci?",
          testo: "For over 40 years we have gathered stories of fragility, disability and inclusion. We don't hide the shadows \u2014 the struggles, the pain, the barriers \u2014 but we always seek the light that emerges: in relationships, in small victories, in the beauty of a society that learns to welcome diversity. We can keep doing this thanks to those who choose to support us.",
          cta: "Subscribe"
        }
      },
      {
        id: "cta-art-02",
        name: "Regalo abbonamento",
        colore: "peach",
        it: {
          titolo: "Vuoi fare un regalo diverso?",
          testo: "Regala un anno di Ombre e Luci. Storie che non evitano le ombre della vita, ma sanno trovarne la luce. Riflessioni e testimonianze che aiutano a vedere la fragilit\xE0 non come un limite, ma come occasione di incontro e di crescita. Scegli il tipo di abbonamento, ottieni il codice regalo e donalo a chi vuoi far scoprire un modo diverso di guardare il mondo.",
          cta: "Regala l'abbonamento"
        },
        en: {
          titolo: "Looking for a meaningful gift?",
          testo: "Give a year of Ombre e Luci. Stories that don't avoid life's shadows, but know how to find the light within them. Reflections and testimonies that help see fragility not as a limitation, but as an occasion for encounter and growth. Choose a subscription, get the gift code, and share it with someone you'd like to introduce to a different way of seeing the world.",
          cta: "Give a subscription"
        }
      },
      {
        id: "cta-art-03",
        name: "Gratuita come valore",
        colore: "amber",
        it: {
          titolo: "Hai letto fino in fondo, senza barriere.",
          testo: "Gli articoli di Ombre e Luci sono e saranno sempre gratuiti, perch\xE9 crediamo che siano un bene per tutti. Non vogliamo alzare muri: vogliamo che la luce circoli. Ma possiamo continuare solo grazie a chi sceglie di sostenerci con un abbonamento. \xC8 un gesto di giustizia e di cura.",
          cta: "Sostienici"
        },
        en: {
          titolo: "You read to the end. No paywall.",
          testo: "Articles on Ombre e Luci are and will always be free, because we believe they are a common good. We don't want to build walls: we want the light to spread. But we can only keep going thanks to those who choose to support us with a subscription. It's an act of care \u2014 and it makes a real difference.",
          cta: "Support us"
        }
      }
    ];
    archivio = {
      id: "cta-arch-01",
      name: "Banner archivio e numeri",
      it: {
        titolo: "Sostieni Ombre e Luci",
        sottotitolo: "Quarant'anni di storie, riflessioni e incontri sulla fragilit\xE0 e sulla dignit\xE0 della persona.",
        cta: "Contribuisci"
      },
      en: {
        titolo: "Support Ombre e Luci",
        sottotitolo: "Forty years of stories, reflections and encounters on fragility and human dignity.",
        cta: "Contribute"
      }
    };
    ctaData = {
      articolo,
      archivio
    };
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/CTAArchivio_BQP5Iqe3.mjs
var $$Astro4, $$CTAArchivio;
var init_CTAArchivio_BQP5Iqe3 = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/CTAArchivio_BQP5Iqe3.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_cta_BwIVYshf();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro4 = createAstro("https://ombreeluci.it");
    $$CTAArchivio = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro4, $$props, $$slots);
      Astro2.self = $$CTAArchivio;
      const { lang = "it", pageContext = "archivio" } = Astro2.props;
      const cta = ctaData.archivio;
      const ui = lang === "en" ? cta.en : cta.it;
      const utmLink = `/sostienici?utm_source=${pageContext}&utm_medium=cta-banner&utm_campaign=${cta.id}&utm_content=${lang}`;
      return renderTemplate`${maybeRenderHead()}<aside class="cta-archivio"${addAttribute(cta.id, "data-cta-id")}${addAttribute(cta.name, "data-cta-name")}${addAttribute(lang === "en" ? "Support us" : "Sostienici", "aria-label")} data-astro-cid-nsozbvjm> <div class="cta-archivio__body" data-astro-cid-nsozbvjm> <div class="cta-archivio__text" data-astro-cid-nsozbvjm> <p class="cta-archivio__titolo" data-astro-cid-nsozbvjm>${ui.titolo}</p> <p class="cta-archivio__sottotitolo" data-astro-cid-nsozbvjm>${ui.sottotitolo}</p> <a${addAttribute(utmLink, "href")} class="cta-archivio__btn"${addAttribute(cta.id, "data-cta-id")}${addAttribute(pageContext, "data-cta-context")} data-astro-cid-nsozbvjm>${ui.cta}</a> </div> <div class="cta-archivio__image" aria-hidden="true" data-astro-cid-nsozbvjm> <img src="/cta-numero.webp" alt="" width="350" height="250" loading="lazy" decoding="async" data-astro-cid-nsozbvjm> </div> </div> </aside> `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/CTAArchivio.astro", void 0);
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/IssueContent_BtamaNxI.mjs
var $$Astro$13, $$IssueNavPill, $$Astro5, $$IssueContent;
var init_IssueContent_BtamaNxI = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/IssueContent_BtamaNxI.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_Footer_DN9MDnF9();
    init_ArticleCard_BcaTyrt5();
    init_CTAArchivio_BQP5Iqe3();
    init_taxonomy_BacsMRxg();
    init_directus_BvF_bImd();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro$13 = createAstro("https://ombreeluci.it");
    $$IssueNavPill = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$13, $$props, $$slots);
      Astro2.self = $$IssueNavPill;
      const { prevSlug, nextSlug, archiveBasePath = "/it/archivio" } = Astro2.props;
      return renderTemplate`${maybeRenderHead()}<nav class="issue-nav-pill" aria-label="Navigazione tra i numeri dell'archivio" data-astro-cid-oqbatd3p> <div class="issue-nav-pill__inner" data-astro-cid-oqbatd3p> <!-- Freccia sinistra: numero precedente --> ${prevSlug ? renderTemplate`<a${addAttribute(prevSlug, "href")} class="issue-nav-pill__btn issue-nav-pill__btn--prev" aria-label="Numero precedente" data-tooltip="Numero precedente" data-astro-cid-oqbatd3p> <span class="issue-nav-pill__icon issue-nav-pill__icon--left" aria-hidden="true" data-astro-cid-oqbatd3p> <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-oqbatd3p> <path d="M8 2 L4 6 L8 10" data-astro-cid-oqbatd3p></path> </svg> </span> </a>` : renderTemplate`<span class="issue-nav-pill__btn issue-nav-pill__btn--disabled" aria-hidden="true" data-astro-cid-oqbatd3p> <span class="issue-nav-pill__icon issue-nav-pill__icon--left" data-astro-cid-oqbatd3p> <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-oqbatd3p> <path d="M8 2 L4 6 L8 10" data-astro-cid-oqbatd3p></path> </svg> </span> </span>`} <!-- Centro: link Magazine --> <a${addAttribute(archiveBasePath, "href")} class="issue-nav-pill__center" data-tooltip="Tutti i numeri" data-astro-cid-oqbatd3p>
Magazine
</a> <!-- Freccia destra: numero successivo --> ${nextSlug ? renderTemplate`<a${addAttribute(nextSlug, "href")} class="issue-nav-pill__btn issue-nav-pill__btn--next" aria-label="Numero successivo" data-tooltip="Numero successivo" data-astro-cid-oqbatd3p> <span class="issue-nav-pill__icon issue-nav-pill__icon--right" aria-hidden="true" data-astro-cid-oqbatd3p> <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-oqbatd3p> <path d="M4 2 L8 6 L4 10" data-astro-cid-oqbatd3p></path> </svg> </span> </a>` : renderTemplate`<span class="issue-nav-pill__btn issue-nav-pill__btn--disabled" aria-hidden="true" data-astro-cid-oqbatd3p> <span class="issue-nav-pill__icon issue-nav-pill__icon--right" data-astro-cid-oqbatd3p> <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-oqbatd3p> <path d="M4 2 L8 6 L4 10" data-astro-cid-oqbatd3p></path> </svg> </span> </span>`} </div> </nav>  `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/IssueNavPill.astro", void 0);
    $$Astro5 = createAstro("https://ombreeluci.it");
    $$IssueContent = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro5, $$props, $$slots);
      Astro2.self = $$IssueContent;
      const { lang, numero, prevSlug, nextSlug, articoliNumero, archiveBasePath } = Astro2.props;
      const archiveViewUrl = numero.wp_url || null;
      const pdfUrl = numero.pdf_archive_url || null;
      const copertinaNumeroUrl = getNumeroImageUrl(numero);
      const testata = numero.tipo === "ins" ? "Insieme" : "Ombre e Luci";
      const descrizione = numero.descrizione || null;
      const articoliDisplay = lang === "en" ? articoliNumero.filter((a) => a.lang === "en") : articoliNumero.filter((a) => a.lang !== "en");
      const articoliEnExtra = lang === "it" ? articoliNumero.filter((a) => a.lang === "en") : [];
      const prevNavSlug = prevSlug ? `${archiveBasePath}/${prevSlug}` : null;
      const nextNavSlug = nextSlug ? `${archiveBasePath}/${nextSlug}` : null;
      const browseLabel = t(lang, "issue_browse_online");
      const browseNotAvail = lang === "en" ? "Browse online (not available)" : "Sfoglia Online (non disponibile)";
      const pdfLabel = t(lang, "widget_download_pdf");
      const pdfNotAvail = lang === "en" ? "Download PDF (not available)" : "Scarica PDF (non disponibile)";
      const issueLabel = t(lang, "issue_number");
      const yearLabel = lang === "en" ? "Year" : "Anno";
      const noArticlesMsg = lang === "en" ? "No articles found for this issue." : "Non sono stati trovati articoli associati a questo numero.";
      const noArticlesTitle = lang === "en" ? "No articles found" : "Nessun articolo trovato";
      const englishEditionLabel = "English Edition";
      const articleBasePath = lang === "en" ? "/en" : "/it";
      const ultimoSlug = String(ultimoNumeroData.id_numero).toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const ultimoIssueHref = `${archiveBasePath}/${ultimoSlug}`;
      const isUltimoNumero = numero.id_numero === ultimoNumeroData.id_numero;
      return renderTemplate`${maybeRenderHead()}<main class="issue-main" data-astro-cid-hpr7fibz> <div class="issue-container" data-astro-cid-hpr7fibz> <!-- Magazine switcher --> <div class="issue-mag-header" data-astro-cid-hpr7fibz> <p class="issue-mag-eyebrow" data-astro-cid-hpr7fibz>${t(lang, "archive_title")}</p> <div class="mag-switcher" role="tablist" data-astro-cid-hpr7fibz> ${isUltimoNumero ? renderTemplate`<span class="mag-switcher-btn mag-switcher-btn--active" role="tab" aria-selected="true" data-astro-cid-hpr7fibz> ${t(lang, "archive_tab_last")} </span>` : renderTemplate`<a${addAttribute(ultimoIssueHref, "href")} class="mag-switcher-btn" role="tab" data-astro-cid-hpr7fibz> ${t(lang, "archive_tab_last")} </a>`} <a${addAttribute(archiveBasePath, "href")} class="mag-switcher-btn" role="tab" data-astro-cid-hpr7fibz> ${t(lang, "archive_tab_all")} </a> </div> </div> <!-- Hero Section --> <section class="hero-section" data-astro-cid-hpr7fibz> <div class="hero-cover" data-astro-cid-hpr7fibz> ${copertinaNumeroUrl ? renderTemplate`<img${addAttribute(copertinaNumeroUrl, "src")}${addAttribute(`Copertina ${testata} ${numero.id_numero}`, "alt")}${addAttribute(380, "width")}${addAttribute(507, "height")} data-copertina-fallback data-astro-cid-hpr7fibz>` : renderTemplate`<div style="width: 100%; aspect-ratio: 3/4; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; padding: 2rem;" data-astro-cid-hpr7fibz> <span style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;" data-astro-cid-hpr7fibz>${testata}</span> <span style="font-size: 1rem;" data-astro-cid-hpr7fibz>${numero.id_numero}</span> </div>`} </div> <div class="hero-content" data-astro-cid-hpr7fibz> <span class="hero-badge" data-astro-cid-hpr7fibz>${testata}</span> <h1 class="hero-title" data-astro-cid-hpr7fibz> ${numero.display_title} </h1> <div class="hero-meta" data-astro-cid-hpr7fibz> <div class="hero-meta-item" data-astro-cid-hpr7fibz> <span class="hero-meta-label" data-astro-cid-hpr7fibz>${issueLabel}:</span> <span data-astro-cid-hpr7fibz>${numero.id_numero}</span> </div> <div class="hero-meta-item" data-astro-cid-hpr7fibz> <span class="hero-meta-label" data-astro-cid-hpr7fibz>${yearLabel}:</span> <span data-astro-cid-hpr7fibz>${numero.anno_pubblicazione}</span> </div> </div> ${descrizione && renderTemplate`<div class="hero-description" data-astro-cid-hpr7fibz>${unescapeHTML(descrizione)}</div>`} <div class="hero-actions" data-astro-cid-hpr7fibz> ${archiveViewUrl ? renderTemplate`<a${addAttribute(archiveViewUrl, "href")} target="_blank" rel="noopener noreferrer" class="hero-button" data-astro-cid-hpr7fibz> <span data-astro-cid-hpr7fibz>📖</span> <span data-astro-cid-hpr7fibz>${browseLabel}</span> </a>` : renderTemplate`<button class="hero-button" disabled data-astro-cid-hpr7fibz> <span data-astro-cid-hpr7fibz>📖</span> <span data-astro-cid-hpr7fibz>${browseNotAvail}</span> </button>`} ${pdfUrl ? renderTemplate`<a${addAttribute(pdfUrl, "href")} target="_blank" rel="noopener noreferrer" class="hero-button secondary" data-astro-cid-hpr7fibz> <span data-astro-cid-hpr7fibz>📥</span> <span data-astro-cid-hpr7fibz>${pdfLabel}</span> </a>` : renderTemplate`<button class="hero-button secondary" disabled data-astro-cid-hpr7fibz> <span data-astro-cid-hpr7fibz>📥</span> <span data-astro-cid-hpr7fibz>${pdfNotAvail}</span> </button>`} </div> </div> </section> <!-- Articoli --> <section class="articles-section" data-astro-cid-hpr7fibz> <div class="articles-header" data-astro-cid-hpr7fibz> <h2 class="articles-title" data-astro-cid-hpr7fibz>${t(lang, "issue_articles_heading")}</h2> <p class="articles-count" data-astro-cid-hpr7fibz> ${articoliDisplay.length} ${articoliDisplay.length === 1 ? lang === "en" ? "article" : "articolo" : lang === "en" ? "articles" : "articoli"} ${lang === "it" && articoliEnExtra.length > 0 && ` \xB7 ${articoliEnExtra.length} in English`} </p> </div> ${articoliDisplay.length > 0 || articoliEnExtra.length > 0 ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-hpr7fibz": true }, { "default": ($$result2) => renderTemplate` <div class="articles-grid" data-astro-cid-hpr7fibz> ${articoliDisplay.map((a) => {
        const articleDate = a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date();
        const { categoria_menu } = getMegaclusterForArticle(a);
        const { formal } = getLabels([], a);
        const articleImage = getArticoloCopertinaSrc(a);
        return renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "categoriaMenu": categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? (lang === "en" ? "Unknown author" : "Autore sconosciuto"), "date": articleDate, "image": articleImage, "basePath": articleBasePath, "lang": lang, "data-astro-cid-hpr7fibz": true })}`;
      })} </div> ${articoliEnExtra.length > 0 && renderTemplate`<div class="english-edition-section" data-astro-cid-hpr7fibz> <h2 data-astro-cid-hpr7fibz>${englishEditionLabel}</h2> <div class="articles-grid" data-astro-cid-hpr7fibz> ${articoliEnExtra.map((a) => {
        const articleDate = a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date();
        const { categoria_menu } = getMegaclusterForArticle(a);
        const { formal } = getLabels([], a);
        const articleImage = getArticoloCopertinaSrc(a);
        return renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "categoriaMenu": categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? "Unknown author", "date": articleDate, "image": articleImage, "basePath": "/en", "lang": "en", "data-astro-cid-hpr7fibz": true })}`;
      })} </div> </div>`}` })}` : renderTemplate`<div class="no-articles" data-astro-cid-hpr7fibz> <h3 class="no-articles-title" data-astro-cid-hpr7fibz>${noArticlesTitle}</h3> <p data-astro-cid-hpr7fibz>${noArticlesMsg}</p> </div>`} </section> ${renderComponent($$result, "CTAArchivio", $$CTAArchivio, { "lang": lang, "pageContext": "numero", "data-astro-cid-hpr7fibz": true })} </div> </main> ${renderComponent($$result, "IssueNavPill", $$IssueNavPill, { "prevSlug": prevNavSlug, "nextSlug": nextNavSlug, "archiveBasePath": archiveBasePath, "data-astro-cid-hpr7fibz": true })} `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/IssueContent.astro", void 0);
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/archive/_issue_.astro.mjs
var issue_astro_exports = {};
__export(issue_astro_exports, {
  page: () => page5,
  renderers: () => renderers
});
var $$Astro6, prerender5, $$issue, $$file, $$url, _page5, page5;
var init_issue_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/archive/_issue_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_BaseLayout_DOaiilqT();
    init_IssueContent_BtamaNxI();
    init_directus_BvF_bImd();
    init_renderers();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro6 = createAstro("https://ombreeluci.it");
    prerender5 = false;
    $$issue = createComponent(async ($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro6, $$props, $$slots);
      Astro2.self = $$issue;
      const { issue } = Astro2.params;
      if (!issue)
        return Astro2.redirect("/en/archive/");
      const rawNumeri = await getAllNumeriRivista();
      function numProgressivo(idNumero) {
        const m = idNumero.match(/(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      }
      __name(numProgressivo, "numProgressivo");
      const numeriOrdinati = [...rawNumeri].sort((a, b) => {
        const annoA = a.anno_pubblicazione ?? 0;
        const annoB = b.anno_pubblicazione ?? 0;
        if (annoA !== annoB)
          return annoA - annoB;
        return numProgressivo(a.id_numero) - numProgressivo(b.id_numero);
      });
      const index = numeriOrdinati.findIndex(
        (n) => n.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-") === issue
      );
      if (index === -1)
        return Astro2.redirect("/en/archive/");
      const numero = numeriOrdinati[index];
      const prevNumero = index > 0 ? numeriOrdinati[index - 1] : null;
      const nextNumero = index < numeriOrdinati.length - 1 ? numeriOrdinati[index + 1] : null;
      const prevSlug = prevNumero ? prevNumero.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-") : null;
      const nextSlug = nextNumero ? nextNumero.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-") : null;
      const articoliAll = await getArticoliByNumeroId(numero.id);
      const articoliNumero = articoliAll.filter((a) => a.lang === "en");
      const copertinaNumeroUrl = getNumeroImageUrl(numero);
      const testata = numero.tipo === "ins" ? "Insieme" : "Ombre e Luci";
      return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${numero.display_title} \u2013 Archive`, "description": `${testata} \u2013 ${numero.display_title}: browse articles and download the PDF.`, "noindex": true, "ogImage": copertinaNumeroUrl, "lang": "en", "alternateArticleUrl": `/it/archivio/${numero.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-")}` }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "IssueContent", $$IssueContent, { "lang": "en", "numero": numero, "prevSlug": prevSlug, "nextSlug": nextSlug, "articoliNumero": articoliNumero, "archiveBasePath": "/en/archive" })} ` })}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/en/archive/[issue].astro", void 0);
    $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/en/archive/[issue].astro";
    $$url = "/en/archive/[issue]";
    _page5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$issue,
      file: $$file,
      prerender: prerender5,
      url: $$url
    }, Symbol.toStringTag, { value: "Module" }));
    page5 = /* @__PURE__ */ __name(() => _page5, "page");
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/archive.astro.mjs
var archive_astro_exports = {};
var init_archive_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/archive.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/authors/_slug_.astro.mjs
var slug_astro_exports = {};
var init_slug_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/authors/_slug_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/authors.astro.mjs
var authors_astro_exports = {};
var init_authors_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/authors.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/CategoriaPageContent_BuRN22sl.mjs
var $$Astro7, $$CategoriaPageContent;
var init_CategoriaPageContent_BuRN22sl = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/CategoriaPageContent_BuRN22sl.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_ArticleCard_BcaTyrt5();
    init_taxonomy_BacsMRxg();
    init_directus_BvF_bImd();
    init_Footer_DN9MDnF9();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro7 = createAstro("https://ombreeluci.it");
    $$CategoriaPageContent = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro7, $$props, $$slots);
      Astro2.self = $$CategoriaPageContent;
      const {
        articoli,
        categoryLabel,
        descrizione = null,
        evidenza = null,
        lang = "it",
        basePath = ""
      } = Astro2.props;
      const sorted = articoli;
      const hero = sorted[0] ?? null;
      const rest = sorted.slice(1);
      const evidenzaEffettiva = evidenza && evidenza.length > 0 ? evidenza : sorted.filter((a) => {
        const r2 = getMegaclusterForArticle(a).ruolo_editoriale;
        return r2 === "portante" || r2 === "strutturale";
      }).sort(
        (a, b) => getRoleWeight(getMegaclusterForArticle(b).ruolo_editoriale) - getRoleWeight(getMegaclusterForArticle(a).ruolo_editoriale)
      ).slice(0, 5);
      const hasEvidenza = evidenzaEffettiva.length > 0;
      const evidenzaTitle = lang === "en" ? "Featured" : "In evidenza";
      const authorFallback = t(lang, "author_unknown");
      return renderTemplate`${maybeRenderHead()}<div class="categoria-container" data-astro-cid-rl4hl7k4> <header class="categoria-header" data-astro-cid-rl4hl7k4> <h1 class="categoria-title" data-astro-cid-rl4hl7k4>${categoryLabel}</h1> <p class="categoria-count" data-astro-cid-rl4hl7k4> ${articoli.length} ${lang === "en" ? articoli.length === 1 ? "article" : "articles" : articoli.length === 1 ? "articolo" : "articoli"} </p> ${descrizione && renderTemplate`<p class="categoria-descrizione" data-astro-cid-rl4hl7k4>${descrizione}</p>`} </header> <div${addAttribute(`categoria-body${hasEvidenza ? "" : " categoria-body--no-evidenza"}`, "class")} data-astro-cid-rl4hl7k4> <div class="feed-col" data-astro-cid-rl4hl7k4> ${hero && (() => {
        const { categoria_menu, ruolo_editoriale } = getMegaclusterForArticle(hero);
        const { formal } = getLabels([], hero);
        return renderTemplate`<div class="hero-wrap" data-astro-cid-rl4hl7k4> ${renderComponent($$result, "ArticleCard", $$ArticleCard, { "title": hero.titolo, "slug": hero.slug, "basePath": basePath, "categoriaMenu": categoria_menu ?? hero.categoria_menu ?? void 0, "issue": hero.numero_rivista?.id_numero ?? null, "forma": formal, "author": hero.autore?.nome_completo ?? authorFallback, "date": hero.data_pubblicazione ? new Date(hero.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(hero), "ruoloEditoriale": ruolo_editoriale ?? void 0, "lang": lang, "data-astro-cid-rl4hl7k4": true })} </div>`;
      })()} <div class="articles-list" data-astro-cid-rl4hl7k4> ${rest.map((a) => {
        const { categoria_menu, ruolo_editoriale } = getMegaclusterForArticle(a);
        const { formal } = getLabels([], a);
        const autFotoId = a.autore?.foto?.id;
        return renderTemplate`${renderComponent($$result, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "basePath": basePath, "categoriaMenu": categoria_menu ?? a.categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? authorFallback, "date": a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(a), "ruoloEditoriale": ruolo_editoriale ?? void 0, "horizontal": true, "sottotitolo": a.sottotitolo ?? null, "authorImage": autFotoId ? getAutoreImageUrl(autFotoId) : null, "lang": lang, "data-astro-cid-rl4hl7k4": true })}`;
      })} </div> </div> ${hasEvidenza && renderTemplate`<aside class="evidenza-col" data-astro-cid-rl4hl7k4> <h2 class="evidenza-title" data-astro-cid-rl4hl7k4>${evidenzaTitle}</h2> <div class="evidenza-list" data-astro-cid-rl4hl7k4> ${evidenzaEffettiva.map((a, idx) => {
        const { ruolo_editoriale } = getMegaclusterForArticle(a);
        const { formal } = getLabels([], a);
        return renderTemplate`${renderComponent($$result, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "basePath": basePath, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? authorFallback, "date": a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(a), "hideImage": idx !== 0, "ruoloEditoriale": ruolo_editoriale ?? void 0, "lang": lang, "data-astro-cid-rl4hl7k4": true })}`;
      })} </div> </aside>`} </div> </div> `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/CategoriaPageContent.astro", void 0);
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/category/_slug_.astro.mjs
var slug_astro_exports2 = {};
__export(slug_astro_exports2, {
  page: () => page6,
  renderers: () => renderers
});
var __freeze2, __defProp3, __template2, _a2, $$Astro8, prerender6, $$slug, $$file2, $$url2, _page6, page6;
var init_slug_astro2 = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/category/_slug_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_BaseLayout_DOaiilqT();
    init_CategoriaPageContent_BuRN22sl();
    init_directus_BvF_bImd();
    init_Footer_DN9MDnF9();
    init_taxonomy_BacsMRxg();
    init_renderers();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    __freeze2 = Object.freeze;
    __defProp3 = Object.defineProperty;
    __template2 = /* @__PURE__ */ __name((cooked, raw) => __freeze2(__defProp3(cooked, "raw", { value: __freeze2(cooked.slice()) })), "__template");
    $$Astro8 = createAstro("https://ombreeluci.it");
    prerender6 = false;
    $$slug = createComponent(async ($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro8, $$props, $$slots);
      Astro2.self = $$slug;
      const { redirect } = Astro2;
      const creds = directusCredsFromAstroLocals(Astro2.locals);
      const enSlug = (Astro2.params.slug ?? "").replace(/\/$/, "");
      const itSlug = getCategoriaSlugIT(enSlug);
      const articoli = await getArticoliByCategoria(itSlug, "en", creds);
      if (!articoli.length) {
        return redirect("/en/", 302);
      }
      const categoryLabel = localizeCategory(itSlug, "en") ?? enSlug;
      const sorted = [...articoli].sort((a, b) => {
        const tA = a.data_pubblicazione ? new Date(a.data_pubblicazione).getTime() : 0;
        const tB = b.data_pubblicazione ? new Date(b.data_pubblicazione).getTime() : 0;
        if (tA !== tB)
          return tB - tA;
        const wA = getRoleWeight(getMegaclusterForArticle(a).ruolo_editoriale);
        const wB = getRoleWeight(getMegaclusterForArticle(b).ruolo_editoriale);
        return wB - wA;
      });
      Astro2.response.headers.set("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
      return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": categoryLabel, "description": `English articles in category "${categoryLabel}" on Ombre e Luci.`, "noindex": true, "lang": "en", "alternateArticleUrl": `/categoria/${itSlug}` }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<main class="site-main"> ${renderComponent($$result2, "CategoriaPageContent", $$CategoriaPageContent, { "articoli": sorted, "categoryLabel": categoryLabel, "lang": "en", "basePath": "/en" })} </main> `, "head": async ($$result2) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "slot": "head" }, { "default": async ($$result3) => renderTemplate(_a2 || (_a2 = __template2([' <script type="application/ld+json">', "<\/script> "])), unescapeHTML(JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ombreeluci.it/en/" },
          { "@type": "ListItem", "position": 2, "name": categoryLabel, "item": Astro2.url.href }
        ]
      }))) })}` })}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/en/category/[slug].astro", void 0);
    $$file2 = "C:/Users/berto/Documents/Ombreeluci/src/pages/en/category/[slug].astro";
    $$url2 = "/en/category/[slug]";
    _page6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$slug,
      file: $$file2,
      prerender: prerender6,
      url: $$url2
    }, Symbol.toStringTag, { value: "Module" }));
    page6 = /* @__PURE__ */ __name(() => _page6, "page");
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/diaries/_diario_.astro.mjs
var diario_astro_exports = {};
var init_diario_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/diaries/_diario_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/focus/_vertical_.astro.mjs
var vertical_astro_exports = {};
var init_vertical_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/focus/_vertical_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/focus.astro.mjs
var focus_astro_exports = {};
var init_focus_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/focus.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/newsletter.astro.mjs
var newsletter_astro_exports = {};
var init_newsletter_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/newsletter.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/search.astro.mjs
var search_astro_exports = {};
var init_search_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/search.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/sections/diaries.astro.mjs
var diaries_astro_exports = {};
var init_diaries_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/sections/diaries.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/RubricaPageContent_Btsy_OLg.mjs
var $$Astro9, $$RubricaPageContent;
var init_RubricaPageContent_Btsy_OLg = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/RubricaPageContent_Btsy_OLg.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_ArticleCard_BcaTyrt5();
    init_taxonomy_BacsMRxg();
    init_directus_BvF_bImd();
    init_Footer_DN9MDnF9();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro9 = createAstro("https://ombreeluci.it");
    $$RubricaPageContent = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro9, $$props, $$slots);
      Astro2.self = $$RubricaPageContent;
      const { lang, rubrica, articoli } = Astro2.props;
      const basePath = lang === "en" ? "/en" : "/it";
      const rubricaLabel = lang === "en" ? rubrica.en : rubrica.it;
      `/rubriche/${rubrica.slug}/`;
      `/en/sections/${rubrica.en_slug}/`;
      const sorted = articoli;
      const hero = sorted[0] ?? null;
      const rest = sorted.slice(1);
      const evidenzaEffettiva = sorted.filter((a) => {
        const r2 = getMegaclusterForArticle(a).ruolo_editoriale;
        return r2 === "portante" || r2 === "strutturale";
      }).sort(
        (a, b) => getRoleWeight(getMegaclusterForArticle(b).ruolo_editoriale) - getRoleWeight(getMegaclusterForArticle(a).ruolo_editoriale)
      ).slice(0, 5);
      const hasEvidenza = evidenzaEffettiva.length > 0;
      const evidenzaTitle = lang === "en" ? "Featured" : "In evidenza";
      const authorFallback = t(lang, "author_unknown");
      return renderTemplate`${maybeRenderHead()}<div class="categoria-container" data-astro-cid-tmle3k6d> <header class="categoria-header" data-astro-cid-tmle3k6d> <h1 class="categoria-title" data-astro-cid-tmle3k6d>${rubricaLabel}</h1> <p class="categoria-count" data-astro-cid-tmle3k6d> ${articoli.length} ${lang === "en" ? articoli.length === 1 ? "article" : "articles" : articoli.length === 1 ? "articolo" : "articoli"} </p> </header> <div${addAttribute(`categoria-body${hasEvidenza ? "" : " categoria-body--no-evidenza"}`, "class")} data-astro-cid-tmle3k6d> <div class="feed-col" data-astro-cid-tmle3k6d> ${hero && (() => {
        const { categoria_menu, ruolo_editoriale } = getMegaclusterForArticle(hero);
        const { formal } = getLabels([], hero);
        return renderTemplate`<div class="hero-wrap" data-astro-cid-tmle3k6d> ${renderComponent($$result, "ArticleCard", $$ArticleCard, { "title": hero.titolo, "slug": hero.slug, "basePath": basePath, "categoriaMenu": categoria_menu ?? hero.categoria_menu ?? void 0, "issue": hero.numero_rivista?.id_numero ?? null, "forma": formal, "author": hero.autore?.nome_completo ?? authorFallback, "date": hero.data_pubblicazione ? new Date(hero.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(hero), "ruoloEditoriale": ruolo_editoriale ?? void 0, "lang": lang, "data-astro-cid-tmle3k6d": true })} </div>`;
      })()} <div class="articles-list" data-astro-cid-tmle3k6d> ${rest.map((a) => {
        const { categoria_menu, ruolo_editoriale } = getMegaclusterForArticle(a);
        const { formal } = getLabels([], a);
        const autFotoId = a.autore?.foto?.id;
        return renderTemplate`${renderComponent($$result, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "basePath": basePath, "categoriaMenu": categoria_menu ?? a.categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? authorFallback, "date": a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(a), "ruoloEditoriale": ruolo_editoriale ?? void 0, "horizontal": true, "sottotitolo": a.sottotitolo ?? null, "authorImage": autFotoId ? getAutoreImageUrl(autFotoId) : null, "lang": lang, "data-astro-cid-tmle3k6d": true })}`;
      })} </div> </div> ${hasEvidenza && renderTemplate`<aside class="evidenza-col" data-astro-cid-tmle3k6d> <h2 class="evidenza-title" data-astro-cid-tmle3k6d>${evidenzaTitle}</h2> <div class="evidenza-list" data-astro-cid-tmle3k6d> ${evidenzaEffettiva.map((a, idx) => {
        const { ruolo_editoriale } = getMegaclusterForArticle(a);
        const { formal } = getLabels([], a);
        return renderTemplate`${renderComponent($$result, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "basePath": basePath, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? authorFallback, "date": a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(a), "hideImage": idx !== 0, "ruoloEditoriale": ruolo_editoriale ?? void 0, "lang": lang, "data-astro-cid-tmle3k6d": true })}`;
      })} </div> </aside>`} </div> </div> `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/RubricaPageContent.astro", void 0);
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/sections/_slug_.astro.mjs
var slug_astro_exports3 = {};
__export(slug_astro_exports3, {
  page: () => page7,
  renderers: () => renderers
});
var $$Astro10, prerender7, $$slug2, $$file3, $$url3, _page7, page7;
var init_slug_astro3 = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/sections/_slug_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_BaseLayout_DOaiilqT();
    init_RubricaPageContent_Btsy_OLg();
    init_rubriche_BEVwGLjw();
    init_directus_BvF_bImd();
    init_renderers();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro10 = createAstro("https://ombreeluci.it");
    prerender7 = false;
    $$slug2 = createComponent(async ($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro10, $$props, $$slots);
      Astro2.self = $$slug2;
      const { slug } = Astro2.params;
      const rubrica = rubricheData.find((r2) => r2.en_slug === slug);
      if (!rubrica) {
        return Astro2.redirect("/en/", 302);
      }
      const creds = directusCredsFromAstroLocals(Astro2.locals);
      let articoli = [];
      if (rubrica.filtro === "forma") {
        articoli = await getArticoliByForma(rubrica.valore, "en", creds);
        if (articoli.length === 0) {
          return Astro2.redirect("/en/", 302);
        }
      } else {
        return Astro2.redirect("/en/sections/diaries/", 301);
      }
      const alternateItUrl = `/rubriche/${rubrica.slug}/`;
      return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": rubrica.en, "description": `${rubrica.en}: section of Ombre e Luci`, "noindex": true, "lang": "en", "alternateArticleUrl": alternateItUrl }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main"> ${renderComponent($$result2, "RubricaPageContent", $$RubricaPageContent, { "lang": "en", "rubrica": rubrica, "articoli": articoli })} </main> ` })}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/en/sections/[slug].astro", void 0);
    $$file3 = "C:/Users/berto/Documents/Ombreeluci/src/pages/en/sections/[slug].astro";
    $$url3 = "/en/sections/[slug]";
    _page7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$slug2,
      file: $$file3,
      prerender: prerender7,
      url: $$url3
    }, Symbol.toStringTag, { value: "Module" }));
    page7 = /* @__PURE__ */ __name(() => _page7, "page");
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/support-us.astro.mjs
var support_us_astro_exports = {};
var init_support_us_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/support-us.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/ArticoliRullo_BlaFCqIC.mjs
var __freeze3, __defProp4, __template3, _a3, $$Astro11, $$ArticoliRullo;
var init_ArticoliRullo_BlaFCqIC = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/ArticoliRullo_BlaFCqIC.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_ArticleCard_BcaTyrt5();
    init_taxonomy_BacsMRxg();
    init_directus_BvF_bImd();
    init_Footer_DN9MDnF9();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    __freeze3 = Object.freeze;
    __defProp4 = Object.defineProperty;
    __template3 = /* @__PURE__ */ __name((cooked, raw) => __freeze3(__defProp4(cooked, "raw", { value: __freeze3(cooked.slice()) })), "__template");
    $$Astro11 = createAstro("https://ombreeluci.it");
    $$ArticoliRullo = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro11, $$props, $$slots);
      Astro2.self = $$ArticoliRullo;
      const { title, articoli, description = null, headingLevel = 1, pageSize, basePath = "/it", locale = "it" } = Astro2.props;
      const usePageSize = pageSize != null && pageSize > 0;
      const firstPage = usePageSize ? articoli.slice(0, pageSize) : articoli;
      const rest = usePageSize ? articoli.slice(pageSize) : [];
      const hasMore = rest.length > 0;
      function authorSlug(name) {
        return String(name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      }
      __name(authorSlug, "authorSlug");
      const restData = rest.map((a) => {
        const { categoria_menu } = getMegaclusterForArticle(a);
        const { formal } = getLabels([], a);
        const hasIssue = a.numero_rivista?.id_numero != null;
        const catLabel = localizeCategory(categoria_menu ?? null, locale) ?? categoria_menu;
        const formaLabel = formal && formal !== "Articolo" ? localizeFormalType(formal, locale) : null;
        const formaPrefix = formaLabel ? `${formaLabel} \xB7 ` : "";
        const badge = catLabel ? `${formaPrefix}${catLabel}` : hasIssue ? "" : locale === "en" ? "Online" : "Online";
        return {
          titolo: a.titolo,
          slug: a.slug,
          autore: a.autore?.nome_completo ?? "Autore sconosciuto",
          autoreSlug: authorSlug(a.autore?.nome_completo ?? ""),
          data: a.data_pubblicazione ?? null,
          immagine: getArticoloCopertinaSrc(a),
          badge
        };
      });
      return renderTemplate`${maybeRenderHead()}<section class="rullo-section" data-astro-cid-f6xzovoa> <header class="rullo-header" data-astro-cid-f6xzovoa> <div class="rullo-header-top" data-astro-cid-f6xzovoa> ${headingLevel === 2 ? renderTemplate`<h2 class="rullo-title" data-astro-cid-f6xzovoa>${title}</h2>` : renderTemplate`<h1 class="rullo-title" data-astro-cid-f6xzovoa>${title}</h1>`} <span class="rullo-count" id="rullo-count" data-astro-cid-f6xzovoa> ${articoli.length} ${locale === "en" ? articoli.length === 1 ? "article" : "articles" : articoli.length === 1 ? "articolo" : "articoli"} </span> </div> ${description && renderTemplate`<p class="rullo-description" data-astro-cid-f6xzovoa>${description}</p>`} </header> ${articoli.length > 0 ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-f6xzovoa": true }, { "default": ($$result2) => renderTemplate` <div class="rullo-grid" id="rullo-grid" data-astro-cid-f6xzovoa> ${firstPage.map((a) => {
        const { categoria_menu, ruolo_editoriale } = getMegaclusterForArticle(a);
        const { formal } = getLabels([], a);
        return renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "basePath": basePath, "categoriaMenu": categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? "Autore sconosciuto", "date": a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(), "image": getArticoloCopertinaSrc(a), "ruoloEditoriale": ruolo_editoriale ?? void 0, "lang": locale, "data-astro-cid-f6xzovoa": true })}`;
      })} </div> ${hasMore && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-f6xzovoa": true }, { "default": ($$result3) => renderTemplate(_a3 || (_a3 = __template3([' <div class="rullo-loadmore-wrap" id="rullo-loadmore-wrap" data-astro-cid-f6xzovoa> <button class="rullo-loadmore" id="rullo-loadmore"', "", "", "", "", "", "", " data-astro-cid-f6xzovoa> ", ' <span class="rullo-remaining" id="rullo-remaining" data-astro-cid-f6xzovoa>\n(', " ", ')\n</span> </button> </div> <script id="rullo-data" type="application/json">', "<\/script> "])), addAttribute(firstPage.length, "data-loaded"), addAttribute(articoli.length, "data-total"), addAttribute(basePath, "data-base-path"), addAttribute(locale, "data-locale"), addAttribute(t(locale, "author_by"), "data-author-by"), addAttribute(t(locale, "load_more_remaining"), "data-remaining-label"), addAttribute(`${t(locale, "load_more_aria")} (${rest.length} ${t(locale, "load_more_remaining")})`, "aria-label"), t(locale, "load_more"), rest.length, t(locale, "load_more_remaining"), unescapeHTML(JSON.stringify(restData))) })}`}` })}` : renderTemplate`<div class="rullo-empty" data-astro-cid-f6xzovoa> <p data-astro-cid-f6xzovoa>${locale === "en" ? "No articles available." : "Nessun articolo disponibile."}</p> </div>`} </section>  <!-- Stili globali solo per le card generate dal load-more JS (no Astro scoping) -->  `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/ArticoliRullo.astro", void 0);
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/tag/_slug_.astro.mjs
var slug_astro_exports4 = {};
__export(slug_astro_exports4, {
  page: () => page8,
  renderers: () => renderers
});
var $$Astro12, prerender8, $$slug3, $$file4, $$url4, _page8, page8;
var init_slug_astro4 = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/tag/_slug_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_BaseLayout_DOaiilqT();
    init_ArticoliRullo_BlaFCqIC();
    init_directus_BvF_bImd();
    init_renderers();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro12 = createAstro("https://ombreeluci.it");
    prerender8 = false;
    $$slug3 = createComponent(async ($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro12, $$props, $$slots);
      Astro2.self = $$slug3;
      const creds = directusCredsFromAstroLocals(Astro2.locals);
      const tagSlug = (Astro2.params.slug ?? "").replace(/\/$/, "");
      const [tag, allArticoli] = await Promise.all([
        getTagBySlug(tagSlug, creds),
        getArticoliByTag(tagSlug, creds)
      ]);
      if (!tag) {
        return new Response("Not found", { status: 404 });
      }
      const articoli = allArticoli.filter((a) => a.lang === "en");
      Astro2.response.headers.set("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
      return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": tag.nome, "description": `English articles tagged "${tag.nome}" on Ombre e Luci.`, "noindex": true, "lang": "en", "alternateArticleUrl": `/tag/${tagSlug}` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main"> <div class="container"> ${renderComponent($$result2, "ArticoliRullo", $$ArticoliRullo, { "title": tag.nome, "articoli": articoli, "pageSize": 24, "basePath": "/en", "locale": "en" })} </div> </main> ` })}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/en/tag/[slug].astro", void 0);
    $$file4 = "C:/Users/berto/Documents/Ombreeluci/src/pages/en/tag/[slug].astro";
    $$url4 = "/en/tag/[slug]";
    _page8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$slug3,
      file: $$file4,
      prerender: prerender8,
      url: $$url4
    }, Symbol.toStringTag, { value: "Module" }));
    page8 = /* @__PURE__ */ __name(() => _page8, "page");
  }
});

// .wrangler/tmp/pages-JtB0w2/chunks/CTAArticolo_BKGMbCaw.mjs
var $$Astro$32, $$ArticlePageLayout, $$Astro$23, $$EditorialFeedback, autoriStats, __freeze4, __defProp5, __template4, _a4, $$Astro$14, $$Commenti, $$Astro13, $$CTAArticolo;
var init_CTAArticolo_BKGMbCaw = __esm({
  ".wrangler/tmp/pages-JtB0w2/chunks/CTAArticolo_BKGMbCaw.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_BaseLayout_DOaiilqT();
    init_Footer_DN9MDnF9();
    init_directus_BvF_bImd();
    init_cta_BwIVYshf();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro$32 = createAstro("https://ombreeluci.it");
    $$ArticlePageLayout = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$32, $$props, $$slots);
      Astro2.self = $$ArticlePageLayout;
      return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { ...Astro2.props }, { "default": ($$result2) => renderTemplate`  ${renderSlot($$result2, $$slots["default"])} `, "head": ($$result2) => renderTemplate`${renderSlot($$result2, $$slots["head"])}` })} `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/layouts/ArticlePageLayout.astro", void 0);
    $$Astro$23 = createAstro("https://ombreeluci.it");
    $$EditorialFeedback = createComponent(async ($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$23, $$props, $$slots);
      Astro2.self = $$EditorialFeedback;
      const { wpId, title, currentRole, url, articoloId, lang: langProp } = Astro2.props;
      const lang = langProp ?? "it";
      const directusEditUrl = articoloId ? `https://cms.ombreeluci.it/admin/content/articoli/${articoloId}` : "https://cms.ombreeluci.it/admin/content/articoli";
      return renderTemplate`<!-- Bottone modifica Directus (sempre nel DOM, mostrato via JS) -->${maybeRenderHead()}<a id="directus-edit-btn"${addAttribute(directusEditUrl, "href")} target="_blank" rel="noopener noreferrer" class="directus-edit-btn" hidden data-astro-cid-7umwo7jf>
✏ ${t(lang, "editorial_directus_edit")} </a> <aside class="editorial-feedback"${addAttribute(t(lang, "editorial_aria"), "aria-label")} id="editorial-feedback-box" hidden data-astro-cid-7umwo7jf> <div class="editorial-feedback-header" data-astro-cid-7umwo7jf> <span class="editorial-feedback-title" data-astro-cid-7umwo7jf>${t(lang, "editorial_box_title")}</span> </div> <form id="editorial-feedback-form" class="editorial-feedback-form"${addAttribute(t(lang, "editorial_sending"), "data-msg-sending")}${addAttribute(t(lang, "editorial_sent"), "data-msg-sent")}${addAttribute(t(lang, "editorial_network_error"), "data-msg-error")} data-astro-cid-7umwo7jf> <div class="editorial-feedback-row" data-astro-cid-7umwo7jf> <label for="proposed_role" class="editorial-feedback-label" data-astro-cid-7umwo7jf>${t(lang, "editorial_proposed_role")}</label> <select id="proposed_role" name="proposed_role" class="editorial-feedback-select" data-astro-cid-7umwo7jf> <option value="" data-astro-cid-7umwo7jf>${t(lang, "editorial_role_none")}</option> <option value="portante" data-astro-cid-7umwo7jf>${t(lang, "editorial_role_portante")}</option> <option value="strutturale" data-astro-cid-7umwo7jf>${t(lang, "editorial_role_strutturale")}</option> <option value="laterale" data-astro-cid-7umwo7jf>${t(lang, "editorial_role_laterale")}</option> <option value="trasversale" data-astro-cid-7umwo7jf>${t(lang, "editorial_role_trasversale")}</option> </select> </div> <div class="editorial-feedback-row" data-astro-cid-7umwo7jf> <label for="notes" class="editorial-feedback-label" data-astro-cid-7umwo7jf>${t(lang, "editorial_notes")}</label> <textarea id="notes" name="notes" class="editorial-feedback-textarea"${addAttribute(3, "rows")} data-astro-cid-7umwo7jf></textarea> </div> <input type="hidden" name="wp_id"${addAttribute(wpId ?? "", "value")} data-astro-cid-7umwo7jf> <input type="hidden" name="title"${addAttribute(title, "value")} data-astro-cid-7umwo7jf> <input type="hidden" name="current_role"${addAttribute(currentRole ?? "", "value")} data-astro-cid-7umwo7jf> <input type="hidden" name="url"${addAttribute(url, "value")} data-astro-cid-7umwo7jf> <div class="editorial-feedback-row editorial-feedback-actions" data-astro-cid-7umwo7jf> <button type="submit" class="editorial-feedback-submit" data-astro-cid-7umwo7jf>${t(lang, "editorial_submit")}</button> <p id="feedback-status" class="editorial-feedback-status" hidden data-astro-cid-7umwo7jf></p> </div> </form> </aside>  `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/EditorialFeedback.astro", void 0);
    autoriStats = [
      {
        nome: "Redazione",
        slug: "redazione",
        count_articoli: 1802,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Cristina Tersigni",
        slug: "cristina-tersigni",
        count_articoli: 278,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Mariangela Bertolini",
        slug: "mariangela-bertolini",
        count_articoli: 205,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giulia Galeotti",
        slug: "giulia-galeotti",
        count_articoli: 164,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Benedetta Mattei",
        slug: "benedetta-mattei",
        count_articoli: 104,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Claudio Cinus",
        slug: "claudio-cinus",
        count_articoli: 103,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Nicole Schulthes",
        slug: "nicole-schulthes",
        count_articoli: 82,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Natalia Livi",
        slug: "natalia-livi",
        count_articoli: 63,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Maria Teresa Mazzarotto",
        slug: "maria-teresa-mazzarotto",
        count_articoli: 60,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Jean Vanier",
        slug: "jean-vanier",
        count_articoli: 60,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Antonietta Pantone",
        slug: "antonietta-pantone",
        count_articoli: 46,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Matteo Cinti",
        slug: "matteo-cinti",
        count_articoli: 46,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giovanni Grossi",
        slug: "giovanni-grossi",
        count_articoli: 41,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Sergio Sciascia",
        slug: "sergio-sciascia",
        count_articoli: 40,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Rita Massi",
        slug: "rita-massi",
        count_articoli: 40,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Laura Nardini",
        slug: "laura-nardini",
        count_articoli: 34,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Enrica Riera",
        slug: "enrica-riera",
        count_articoli: 31,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Huberta Pott",
        slug: "huberta-pott",
        count_articoli: 25,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Marie H\xE9l\xE8ne Mathieu",
        slug: "marie-helene-mathieu",
        count_articoli: 24,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Nicla Bettazzi",
        slug: "nicla-bettazzi",
        count_articoli: 23,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Henri Bissonier",
        slug: "henri-bissonier",
        count_articoli: 22,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Luis Sankal\xE9",
        slug: "luis-sankale",
        count_articoli: 22,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Pennabl\xF9",
        slug: "pennablu",
        count_articoli: 22,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Lucia Bertolini",
        slug: "lucia-bertolini",
        count_articoli: 22,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Laura Coccia",
        slug: "laura-coccia",
        count_articoli: 20,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Vito Giannulo",
        slug: "vito-giannulo",
        count_articoli: 20,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Luciana Spigolon",
        slug: "luciana-spigolon",
        count_articoli: 17,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Serena Sillitto",
        slug: "serena-sillitto",
        count_articoli: 14,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Silvia Gusmano",
        slug: "silvia-gusmano",
        count_articoli: 14,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Monica Leggeri",
        slug: "monica-leggeri",
        count_articoli: 13,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Angela Grassi",
        slug: "angela-grassi",
        count_articoli: 12,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Olga Gammarelli",
        slug: "olga-gammarelli",
        count_articoli: 12,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Anna Cece",
        slug: "anna-cece",
        count_articoli: 11,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Manuela Bartesaghi",
        slug: "manuela-bartesaghi",
        count_articoli: 11,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Arianna Giuliano",
        slug: "arianna-giuliano",
        count_articoli: 11,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Marco Bove",
        slug: "marco-bove",
        count_articoli: 11,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Carlo Maria Martini",
        slug: "carlo-maria-martini",
        count_articoli: 10,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Rita Ozzimo",
        slug: "rita-ozzimo",
        count_articoli: 10,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Efrem Sardella",
        slug: "efrem-sardella",
        count_articoli: 9,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Marie-Odile R\xE9thor\xE9",
        slug: "marie-odile-rethore",
        count_articoli: 9,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Paul Gilbert",
        slug: "paul-gilbert",
        count_articoli: 8,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Silvia Camisasca",
        slug: "silvia-camisasca",
        count_articoli: 7,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Antonio Mazzarotto",
        slug: "antonio-mazzarotto",
        count_articoli: 7,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Stefano Di Franco",
        slug: "stefano-di-franco",
        count_articoli: 7,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Davide Passeri",
        slug: "davide-passeri",
        count_articoli: 7,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Maria Grazia Pennisi",
        slug: "maria-grazia-pennisi",
        count_articoli: 7,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Sophie Cluzel",
        slug: "sophie-cluzel",
        count_articoli: 6,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Flora Atlante",
        slug: "flora-atlante",
        count_articoli: 6,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Alessandro De Simone",
        slug: "alessandro-de-simone",
        count_articoli: 6,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Pietro Vetro",
        slug: "pietro-vetro",
        count_articoli: 6,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Elisabetta De Rino",
        slug: "elisabetta-de-rino",
        count_articoli: 6,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Valeria Levi della Vida",
        slug: "valeria-levi-della-vida",
        count_articoli: 6,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Don Stefano Buttinoni",
        slug: "don-stefano-buttinoni",
        count_articoli: 6,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Stefano Guarino",
        slug: "stefano-guarino",
        count_articoli: 6,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Annik Donelli",
        slug: "annik-donelli",
        count_articoli: 6,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Filippo Ascenzi",
        slug: "filippo-ascenzi",
        count_articoli: 6,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Sergio De Rino",
        slug: "sergio-de-rino",
        count_articoli: 6,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Michel Charpentier",
        slug: "michel-charpentier",
        count_articoli: 5,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Nanni Bertolini",
        slug: "nanni-bertolini",
        count_articoli: 5,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Lucia Pennisi",
        slug: "lucia-pennisi",
        count_articoli: 5,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Lucia Casella",
        slug: "lucia-casella",
        count_articoli: 5,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Andr\xE9 Roberti",
        slug: "andre-roberti",
        count_articoli: 5,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Francesco Bertolini",
        slug: "francesco-bertolini",
        count_articoli: 5,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Maria Grazia Romanini",
        slug: "maria-grazia-romanini",
        count_articoli: 4,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Lars Porsenna",
        slug: "lars-porsenna",
        count_articoli: 4,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Anna Maria de Rino",
        slug: "anna-maria-de-rino",
        count_articoli: 4,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Enrico Cattaneo",
        slug: "enrico-cattaneo",
        count_articoli: 4,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Guenda Malvezzi",
        slug: "guenda-malvezzi",
        count_articoli: 4,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Francesca Poleggi",
        slug: "francesca-poleggi",
        count_articoli: 4,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Liliana Ghiringhelli",
        slug: "liliana-ghiringhelli",
        count_articoli: 4,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Pierre Deberg\xE9",
        slug: "pierre-deberge",
        count_articoli: 4,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Melanie Castellani",
        slug: "melanie-castellani",
        count_articoli: 4,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Sophie Lutz",
        slug: "sophie-lutz",
        count_articoli: 4,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Delia Mitolo",
        slug: "delia-mitolo",
        count_articoli: 4,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Vito Palmisano",
        slug: "vito-palmisano",
        count_articoli: 4,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Niccol\xF2 Scarnato",
        slug: "niccolo-scarnato",
        count_articoli: 4,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Laura Cattaneo",
        slug: "laura-cattaneo",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Marta De Rino",
        slug: "marta-de-rino",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Andrea Lonardo",
        slug: "andrea-lonardo",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Patrick Thonon",
        slug: "patrick-thonon",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Lucina Spaccia",
        slug: "lucina-spaccia",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Silvia Tamberi",
        slug: "silvia-tamberi",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Florence Chatel",
        slug: "florence-chatel",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Emanuele Mendola",
        slug: "emanuele-mendola",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Larysa Grygoryeva",
        slug: "larysa-grygoryeva",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Angela Cusimano",
        slug: "angela-cusimano",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Maria Novella Pulieri",
        slug: "maria-novella-pulieri",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Paolo Tantaro",
        slug: "paolo-tantaro",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Isabella Gimmi",
        slug: "isabella-gimmi",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Luca Badetti",
        slug: "luca-badetti",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Antonella Bulgheroni",
        slug: "antonella-bulgheroni",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Ivana Perri",
        slug: "ivana-perri",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Cyrill Donille",
        slug: "cyrill-donille",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Rita Di Nale",
        slug: "rita-di-nale",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Stefano Pescosolido",
        slug: "stefano-pescosolido",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Stefano Artero",
        slug: "stefano-artero",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "P\xE8re Christian Mah\xE9as",
        slug: "pere-christian-maheas",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Grazia Felici",
        slug: "grazia-felici",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Tommaso Bertolini",
        slug: "tommaso-bertolini",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Antonio Piscitelli",
        slug: "antonio-piscitelli",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Matteo Mazzarotto",
        slug: "matteo-mazzarotto",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Stefano Marchetti",
        slug: "stefano-marchetti",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Cristina Ventura",
        slug: "cristina-ventura",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Francesco Gammarelli",
        slug: "francesco-gammarelli",
        count_articoli: 3,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Manrica Baldini",
        slug: "manrica-baldini",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giovanni Mazzarotto",
        slug: "giovanni-mazzarotto",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giampaolo Mattei",
        slug: "giampaolo-mattei",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Cristina Campanini",
        slug: "cristina-campanini",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Loredana Moretti",
        slug: "loredana-moretti",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Federica Aliano",
        slug: "federica-aliano",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Adriano Ercolani",
        slug: "adriano-ercolani",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Andrea Guglielmino",
        slug: "andrea-guglielmino",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Armando D'Amato",
        slug: "armando-d-amato",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Boris Sollazzo",
        slug: "boris-sollazzo",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Emanuele Rauco",
        slug: "emanuele-rauco",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Gabriele Niola",
        slug: "gabriele-niola",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Mario Collino",
        slug: "mario-collino",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Jacques Labrousse",
        slug: "jacques-labrousse",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "P. Noel Simard",
        slug: "p-noel-simard",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Patrizia Stacconi",
        slug: "patrizia-stacconi",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Salvatore Boccaccio",
        slug: "salvatore-boccaccio",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Alessandra Conicchioli",
        slug: "alessandra-conicchioli",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Alessandra Del Duca",
        slug: "alessandra-del-duca",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Agn\xE9s Auschitzky",
        slug: "agnes-auschitzky",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Ilaria Pennacchini",
        slug: "ilaria-pennacchini",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Marie-Sylvie Richard",
        slug: "marie-sylvie-richard",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Stefano Nasuti",
        slug: "stefano-nasuti",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Paolo Catapano",
        slug: "paolo-catapano",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Nunzia Giancola",
        slug: "nunzia-giancola",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Alessandra Moraca",
        slug: "alessandra-moraca",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Padre Isaac Martinez",
        slug: "padre-isaac-martinez",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Lorenzo Cerutti",
        slug: "lorenzo-cerutti",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giusy Nocca",
        slug: "giusy-nocca",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Paolo Nardini",
        slug: "paolo-nardini",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Elisa De Felice",
        slug: "elisa-de-felice",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Marco Bersani",
        slug: "marco-bersani",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giovanni Adomi Braccesi",
        slug: "giovanni-adomi-braccesi",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Padre Joseph Mihelcic s.j.",
        slug: "padre-joseph-mihelcic-s-j",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Gianfranco Ravasi",
        slug: "gianfranco-ravasi",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Valeria Adorni Braccesi",
        slug: "valeria-adorni-braccesi",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Filippo Fantozzi",
        slug: "filippo-fantozzi",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Ghislain du Ch\xE9n\xE9",
        slug: "ghislain-du-chene",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Marie Claude Fabre",
        slug: "marie-claude-fabre",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Carlo Gazzano",
        slug: "carlo-gazzano",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Luisa Spada",
        slug: "luisa-spada",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Beatrice Ghislandi",
        slug: "beatrice-ghislandi",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Anna Maria Canonico",
        slug: "anna-maria-canonico",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Benoit Malveaux",
        slug: "benoit-malveaux",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Adriana Duci",
        slug: "adriana-duci",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Anna Testa",
        slug: "anna-testa",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Alessandra Zezza",
        slug: "alessandra-zezza",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Don Paolo",
        slug: "don-paolo",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Paolo Bertolini",
        slug: "paolo-bertolini",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Benedetta Bertolini",
        slug: "benedetta-bertolini",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giada Di Vecchio",
        slug: "giada-di-vecchio",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Andrea Posa",
        slug: "andrea-posa",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giulia Alberico",
        slug: "giulia-alberico",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Padre Joseph Larsen",
        slug: "padre-joseph-larsen",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Fausta Guglielmi",
        slug: "fausta-guglielmi",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giovanni Maria Flick",
        slug: "giovanni-maria-flick",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Salvatore Anastasi",
        slug: "salvatore-anastasi",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Mara Martelli",
        slug: "mara-martelli",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Davide Del Duca",
        slug: "davide-del-duca",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Nadia Pastori",
        slug: "nadia-pastori",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Cyrill Douillet",
        slug: "cyrill-douillet",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Lorraine McCrary",
        slug: "lorraine-mccrary",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Vittore Mariani",
        slug: "vittore-mariani",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Suor Ida Maria",
        slug: "suor-ida-maria",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Gaia Valmarin",
        slug: "gaia-valmarin",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Carla Gaviraghi",
        slug: "carla-gaviraghi",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Daniele Cogliandro",
        slug: "daniele-cogliandro",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Carlo Maria Fornari",
        slug: "carlo-maria-fornari",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Elisabetta Aglian\xF2",
        slug: "elisabetta-agliano",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Francesca Mancini",
        slug: "francesca-mancini",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giovanni Vergani",
        slug: "giovanni-vergani",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Lucio Cammarota",
        slug: "lucio-cammarota",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giorgia Fontani",
        slug: "giorgia-fontani",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Antonella B.",
        slug: "antonella-b",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Benny",
        slug: "benny",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Ola Gurevitch",
        slug: "ola-gurevitch",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Vanna Rossani",
        slug: "vanna-rossani",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Suor Veronica Amata Donatello",
        slug: "suor-veronica-amata-donatello",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "G\xE9rard Daucourt",
        slug: "gerard-daucourt",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Daniela Guglietta",
        slug: "daniela-guglietta",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Maria Teresa Rendina",
        slug: "maria-teresa-rendina",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Angela Gattulli",
        slug: "angela-gattulli",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Valentina Camomilla",
        slug: "valentina-camomilla",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Valentina Calabresi",
        slug: "valentina-calabresi",
        count_articoli: 2,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Don Tonino Bello",
        slug: "don-tonino-bello",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Vivi Licciuli",
        slug: "vivi-licciuli",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Anna Aluffi Pentini",
        slug: "anna-aluffi-pentini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giovanni Iann\xF2",
        slug: "giovanni-ianno",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Flaminia Cabras",
        slug: "flaminia-cabras",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Marta Tersigni",
        slug: "marta-tersigni",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Valeria Antonucci",
        slug: "valeria-antonucci",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Luci0 Colombaro",
        slug: "luci0-colombaro",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giuliana Siclari",
        slug: "giuliana-siclari",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giovanni Zaninello",
        slug: "giovanni-zaninello",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Claudio Moriggia",
        slug: "claudio-moriggia",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giovanni Intini",
        slug: "giovanni-intini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Rosita Daddato",
        slug: "rosita-daddato",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Gianni Verni",
        slug: "gianni-verni",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Silvia Freschi",
        slug: "silvia-freschi",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Camille Proffit",
        slug: "camille-proffit",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Marta Pensi",
        slug: "marta-pensi",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "A.A.",
        slug: "a-a",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Emanuele Attanasio",
        slug: "emanuele-attanasio",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Mascia Lenzi",
        slug: "mascia-lenzi",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Paola Gini",
        slug: "paola-gini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giulia Cirillo",
        slug: "giulia-cirillo",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Elzbieta Steczkiewicz",
        slug: "elzbieta-steczkiewicz",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Laura Broccoli",
        slug: "laura-broccoli",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Vincenzo e Irene Ruisi",
        slug: "vincenzo-e-irene-ruisi",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Michel Lemay",
        slug: "michel-lemay",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Nora Buccheri",
        slug: "nora-buccheri",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Ruggero Leonardi",
        slug: "ruggero-leonardi",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Nicolle Carr\xE9",
        slug: "nicolle-carre",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Cordula Neuhaus",
        slug: "cordula-neuhaus",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Jane Gross",
        slug: "jane-gross",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Arnaud Franc",
        slug: "arnaud-franc",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Solange Fanc",
        slug: "solange-fanc",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Mariano S. Pergola",
        slug: "mariano-s-pergola",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Don Virginio Colmegna",
        slug: "don-virginio-colmegna",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Marta De Rino e Eleonora Secchi",
        slug: "marta-de-rino-e-eleonora-secchi",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Simona Greco",
        slug: "simona-greco",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giovanni Solaro",
        slug: "giovanni-solaro",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Gianna Maria",
        slug: "gianna-maria",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Claudio Roncoroni",
        slug: "claudio-roncoroni",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Cecilia Cattaneo Barbieri",
        slug: "cecilia-cattaneo-barbieri",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Cristina Lo Jacono",
        slug: "cristina-lo-jacono",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Elvira Zaccagnino",
        slug: "elvira-zaccagnino",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Andrea Zamperoni",
        slug: "andrea-zamperoni",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Gianluca Giardini",
        slug: "gianluca-giardini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Sara Mc Allister",
        slug: "sara-mc-allister",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Maurizio Pilone",
        slug: "maurizio-pilone",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Vittorio Scelzo",
        slug: "vittorio-scelzo",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Antonello Damiani",
        slug: "antonello-damiani",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Maria Valeria Spinola",
        slug: "maria-valeria-spinola",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Pierina Formiconi",
        slug: "pierina-formiconi",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Fabio Bronzini",
        slug: "fabio-bronzini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Gruppo Cesano Boscone",
        slug: "gruppo-cesano-boscone",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Fabienne Clinquart",
        slug: "fabienne-clinquart",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Marie-Fran\xE7oise (Friquette) Heyndrickx",
        slug: "marie-francoise-friquette-heyndrickx",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Davide",
        slug: "davide",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Padre Mario Marazzi",
        slug: "padre-mario-marazzi",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Mauro Santoro",
        slug: "mauro-santoro",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Associazione Amici di Simone",
        slug: "associazione-amici-di-simone",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Dario Piersanti",
        slug: "dario-piersanti",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Vittoria Episcopello",
        slug: "vittoria-episcopello",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Betty Collino",
        slug: "betty-collino",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Rosalba Di Marco",
        slug: "rosalba-di-marco",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Cristobal Clavijo Z\xE0rate",
        slug: "cristobal-clavijo-zarate",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Carole Irwin",
        slug: "carole-irwin",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Valentina Mari",
        slug: "valentina-mari",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Vittorio Paoli",
        slug: "vittorio-paoli",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Claudia Noviello",
        slug: "claudia-noviello",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Andrea Cesarini",
        slug: "andrea-cesarini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Emanuele Sapore",
        slug: "emanuele-sapore",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Lorenzo Portento",
        slug: "lorenzo-portento",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Cristina Marchese",
        slug: "cristina-marchese",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Sergio Zini",
        slug: "sergio-zini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Cristina Cangemi Matteo Tobanelli",
        slug: "cristina-cangemi-matteo-tobanelli",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Tiziana D'Ambrosio",
        slug: "tiziana-d-ambrosio",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Daniele Cabras",
        slug: "daniele-cabras",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Edda e Maria Teresa",
        slug: "edda-e-maria-teresa",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Cristiana Vigli",
        slug: "cristiana-vigli",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Bernard Provoust",
        slug: "bernard-provoust",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Maria Amelia",
        slug: "maria-amelia",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Jean Marie Petitclerc",
        slug: "jean-marie-petitclerc",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Roger Salbreux",
        slug: "roger-salbreux",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Jacqueline e Henri Faivre",
        slug: "jacqueline-e-henri-faivre",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Marina Vigliar",
        slug: "marina-vigliar",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Carla Fonzi Klieman",
        slug: "carla-fonzi-klieman",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Charlotte Lernount",
        slug: "charlotte-lernount",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Elisa Sturlese",
        slug: "elisa-sturlese",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Isabella Corsini",
        slug: "isabella-corsini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Immacolata Casullo",
        slug: "immacolata-casullo",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Chiara Gatti",
        slug: "chiara-gatti",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Annamaria Manfucci",
        slug: "annamaria-manfucci",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Dott.ssa Maria Teresa Puerto",
        slug: "dott-ssa-maria-teresa-puerto",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Tina Turrini",
        slug: "tina-turrini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Dorota Swat",
        slug: "dorota-swat",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Donatella Marazzini",
        slug: "donatella-marazzini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Francesca De Rino",
        slug: "francesca-de-rino",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Gabriella Boyer",
        slug: "gabriella-boyer",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giuseppe Bertolini",
        slug: "giuseppe-bertolini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giorgiana Tinazzo",
        slug: "giorgiana-tinazzo",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Paolo Salvini",
        slug: "paolo-salvini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Angelo Colacino",
        slug: "angelo-colacino",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Monica Boyer",
        slug: "monica-boyer",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Bianca De Pascalis",
        slug: "bianca-de-pascalis",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Betrice Pezzoli",
        slug: "betrice-pezzoli",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Vittoria Lombardo",
        slug: "vittoria-lombardo",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Franca Forti Bulferi",
        slug: "franca-forti-bulferi",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Elmira Gani",
        slug: "elmira-gani",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Caterina Bordon",
        slug: "caterina-bordon",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Padre Nicolas Buttet",
        slug: "padre-nicolas-buttet",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Ezia Schiavone",
        slug: "ezia-schiavone",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Stefano Atzeni",
        slug: "stefano-atzeni",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Enrica Cofano",
        slug: "enrica-cofano",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Gianluigi Visentini",
        slug: "gianluigi-visentini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Maria Teresa Mosconi Straulino",
        slug: "maria-teresa-mosconi-straulino",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Italia Valle",
        slug: "italia-valle",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Roberto Bertin",
        slug: "roberto-bertin",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Francesco Iellamo",
        slug: "francesco-iellamo",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Francesca Cabrini",
        slug: "francesca-cabrini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Adriana Lunghi",
        slug: "adriana-lunghi",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Domenico e Filippo Pescosolido",
        slug: "domenico-e-filippo-pescosolido",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Paola Angeloro",
        slug: "paola-angeloro",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Madre Pantanella",
        slug: "madre-pantanella",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Padre Luciano Larivera",
        slug: "padre-luciano-larivera",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Stefano Desmazieres",
        slug: "stefano-desmazieres",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Corrado Dastoli",
        slug: "corrado-dastoli",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Tana Pelagallo",
        slug: "tana-pelagallo",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Giancarla Ferrari",
        slug: "giancarla-ferrari",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Roberta Tarantino",
        slug: "roberta-tarantino",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Maria Varoli",
        slug: "maria-varoli",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Elena Bernasconi",
        slug: "elena-bernasconi",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Valentina Gallo",
        slug: "valentina-gallo",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Don Giuseppe Alcamo",
        slug: "don-giuseppe-alcamo",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Michele Vulcan",
        slug: "michele-vulcan",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Daniela Vinazza",
        slug: "daniela-vinazza",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Pere Bernard-Marie Geffroy",
        slug: "pere-bernard-marie-geffroy",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "AiOel Intelligenza Artificiale",
        slug: "aioel-intelligenza-artificiale",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Christine Angl\xE8s",
        slug: "christine-angles",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Gianni Carparelli",
        slug: "gianni-carparelli",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Carla Waked",
        slug: "carla-waked",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Myrna Hayek",
        slug: "myrna-hayek",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "G.",
        slug: "g",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Federica R. Poleggi",
        slug: "federica-r-poleggi",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Francesca Giannulo",
        slug: "francesca-giannulo",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Lena Botta",
        slug: "lena-botta",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Renata De Pascale",
        slug: "renata-de-pascale",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Anna Rita Cedroni",
        slug: "anna-rita-cedroni",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Yvette Bonvin",
        slug: "yvette-bonvin",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Mons. Alberto G. Bochatey",
        slug: "mons-alberto-g-bochatey",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Mons. Nunzio Galantino",
        slug: "mons-nunzio-galantino",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Pier Giorgio Trancossi",
        slug: "pier-giorgio-trancossi",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Teresita Frachey",
        slug: "teresita-frachey",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Maria Ilaria Di Bernardo",
        slug: "maria-ilaria-di-bernardo",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Monica Mazzucco",
        slug: "monica-mazzucco",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Roberto Brandinelli",
        slug: "roberto-brandinelli",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Don Antonino",
        slug: "don-antonino",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Valeria Spinola",
        slug: "valeria-spinola",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Alexandre Jollien",
        slug: "alexandre-jollien",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Cristina Pesci",
        slug: "cristina-pesci",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Gianni Marmorini",
        slug: "gianni-marmorini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Raul Izquierdo",
        slug: "raul-izquierdo",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      },
      {
        nome: "Rosa Maria Sonzini",
        slug: "rosa-maria-sonzini",
        count_articoli: 1,
        bio_breve: "Autore di Ombre e Luci",
        foto: "/images/authors/default.png"
      }
    ];
    __freeze4 = Object.freeze;
    __defProp5 = Object.defineProperty;
    __template4 = /* @__PURE__ */ __name((cooked, raw) => __freeze4(__defProp5(cooked, "raw", { value: __freeze4(raw || cooked.slice()) })), "__template");
    $$Astro$14 = createAstro("https://ombreeluci.it");
    $$Commenti = createComponent(async ($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$14, $$props, $$slots);
      Astro2.self = $$Commenti;
      const { articoloId, lang = "it" } = Astro2.props;
      const creds = directusCredsFromAstroLocals(Astro2.locals);
      const commenti = await getCommentiForArticolo(articoloId, creds);
      function formatData(iso) {
        return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }).format(new Date(iso));
      }
      __name(formatData, "formatData");
      const ui = lang === "en" ? {
        showComments: commenti.length === 1 ? "1 comment" : `${commenti.length} comments`,
        formTitle: "Leave a comment",
        formNote: "Your comment will be published after editorial approval. Your email will not be published.",
        labelName: "Name",
        labelComment: "Comment",
        submitBtn: "Submit comment"
      } : {
        showComments: commenti.length === 1 ? "1 commento" : `${commenti.length} commenti`,
        formTitle: "Lascia un commento",
        formNote: "Il tuo commento sar\xE0 pubblicato dopo approvazione della redazione. L'email non verr\xE0 pubblicata.",
        labelName: "Nome",
        labelComment: "Commento",
        submitBtn: "Invia commento"
      };
      return renderTemplate(_a4 || (_a4 = __template4(["", '<section class="commenti-section" data-astro-cid-n2y5q5hq> ', ' <details class="commenti-accordion" data-astro-cid-n2y5q5hq> <summary class="commenti-accordion-summary" data-astro-cid-n2y5q5hq> <span class="commenti-accordion-label" data-astro-cid-n2y5q5hq>', '</span> <span class="commenti-accordion-icon" aria-hidden="true" data-astro-cid-n2y5q5hq></span> </summary> <div class="commento-form-wrap" data-astro-cid-n2y5q5hq> <p class="commento-form-nota" data-astro-cid-n2y5q5hq>', '</p> <form class="commento-form"', ' novalidate data-astro-cid-n2y5q5hq>  <input type="text" name="hp" autocomplete="off" aria-hidden="true" tabindex="-1" style="position:absolute;left:-9999px;opacity:0;pointer-events:none;" data-astro-cid-n2y5q5hq> <div class="commento-form-row commento-form-row--half" data-astro-cid-n2y5q5hq> <label class="commento-label" for="commento-nome" data-astro-cid-n2y5q5hq> ', ' <span aria-hidden="true" data-astro-cid-n2y5q5hq>*</span> </label> <input class="commento-input" type="text" id="commento-nome" name="autore_nome" autocomplete="name" required maxlength="100" data-astro-cid-n2y5q5hq> </div> <div class="commento-form-row commento-form-row--half" data-astro-cid-n2y5q5hq> <label class="commento-label" for="commento-email" data-astro-cid-n2y5q5hq>\nEmail <span aria-hidden="true" data-astro-cid-n2y5q5hq>*</span> </label> <input class="commento-input" type="email" id="commento-email" name="autore_email" autocomplete="email" required maxlength="200" data-astro-cid-n2y5q5hq> </div> <div class="commento-form-row" data-astro-cid-n2y5q5hq> <label class="commento-label" for="commento-testo" data-astro-cid-n2y5q5hq> ', ' <span aria-hidden="true" data-astro-cid-n2y5q5hq>*</span> </label> <textarea class="commento-input commento-textarea" id="commento-testo" name="testo" required minlength="10" maxlength="5000" rows="5" data-astro-cid-n2y5q5hq></textarea> </div> <div class="commento-form-row commento-form-actions" data-astro-cid-n2y5q5hq> <button type="submit" class="button commento-submit" data-astro-cid-n2y5q5hq> ', ' </button> <span class="commento-contatore" aria-live="polite" data-astro-cid-n2y5q5hq></span> </div> <div class="commento-feedback" role="alert" aria-live="assertive" hidden data-astro-cid-n2y5q5hq></div> </form> </div> </details> </section> <script>(function(){', "\n  const _isEn = commentoLang === 'en';\n  const _str = {\n    submitting: _isEn ? 'Submitting\u2026' : 'Invio in corso\u2026',\n    charsLeft: (n: number) => _isEn ? `${n} characters remaining` : `${n} caratteri rimanenti`,\n    success: _isEn\n      ? 'Thank you! Your comment has been submitted and will be published after editorial approval.'\n      : 'Grazie! Il tuo commento \xE8 stato inviato e sar\xE0 pubblicato dopo approvazione della redazione.',\n    errGeneric: _isEn ? 'An error occurred. Please try again.' : 'Si \xE8 verificato un errore. Riprova.',\n    errNetwork: _isEn\n      ? 'Could not send the comment. Please check your connection and try again.'\n      : 'Impossibile inviare il commento. Controlla la connessione e riprova.',\n  };\n\n  document.querySelectorAll<HTMLFormElement>('.commento-form').forEach((form) => {\n    const articoloId = form.dataset.articoloId ?? '';\n    const feedback = form.querySelector<HTMLElement>('.commento-feedback')!;\n    const submitBtn = form.querySelector<HTMLButtonElement>('.commento-submit')!;\n    const textarea = form.querySelector<HTMLTextAreaElement>('#commento-testo')!;\n    const contatore = form.querySelector<HTMLElement>('.commento-contatore')!;\n\n    // Contatore caratteri textarea\n    textarea?.addEventListener('input', () => {\n      const left = 5000 - textarea.value.length;\n      contatore.textContent = left < 500 ? _str.charsLeft(left) : '';\n    });\n\n    form.addEventListener('submit', async (e) => {\n      e.preventDefault();\n      feedback.hidden = true;\n      submitBtn.disabled = true;\n      submitBtn.textContent = _str.submitting;\n\n      const data = Object.fromEntries(new FormData(form));\n\n      try {\n        const res = await fetch('/api/commento', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ ...data, articolo_id: articoloId }),\n        });\n        const body = await res.json() as { ok: boolean; error?: string };\n\n        if (body.ok) {\n          form.reset();\n          showFeedback('success', _str.success);\n          contatore.textContent = '';\n        } else {\n          showFeedback('error', body.error ?? _str.errGeneric);\n        }\n      } catch {\n        showFeedback('error', _str.errNetwork);\n      } finally {\n        submitBtn.disabled = false;\n        submitBtn.textContent = commentoSubmitBtn;\n      }\n    });\n\n    function showFeedback(type: 'success' | 'error', msg: string) {\n      feedback.textContent = msg;\n      feedback.className = `commento-feedback commento-feedback--${type}`;\n      feedback.hidden = false;\n      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });\n    }\n  });\n})();<\/script> "], ["", '<section class="commenti-section" data-astro-cid-n2y5q5hq> ', ' <details class="commenti-accordion" data-astro-cid-n2y5q5hq> <summary class="commenti-accordion-summary" data-astro-cid-n2y5q5hq> <span class="commenti-accordion-label" data-astro-cid-n2y5q5hq>', '</span> <span class="commenti-accordion-icon" aria-hidden="true" data-astro-cid-n2y5q5hq></span> </summary> <div class="commento-form-wrap" data-astro-cid-n2y5q5hq> <p class="commento-form-nota" data-astro-cid-n2y5q5hq>', '</p> <form class="commento-form"', ' novalidate data-astro-cid-n2y5q5hq>  <input type="text" name="hp" autocomplete="off" aria-hidden="true" tabindex="-1" style="position:absolute;left:-9999px;opacity:0;pointer-events:none;" data-astro-cid-n2y5q5hq> <div class="commento-form-row commento-form-row--half" data-astro-cid-n2y5q5hq> <label class="commento-label" for="commento-nome" data-astro-cid-n2y5q5hq> ', ' <span aria-hidden="true" data-astro-cid-n2y5q5hq>*</span> </label> <input class="commento-input" type="text" id="commento-nome" name="autore_nome" autocomplete="name" required maxlength="100" data-astro-cid-n2y5q5hq> </div> <div class="commento-form-row commento-form-row--half" data-astro-cid-n2y5q5hq> <label class="commento-label" for="commento-email" data-astro-cid-n2y5q5hq>\nEmail <span aria-hidden="true" data-astro-cid-n2y5q5hq>*</span> </label> <input class="commento-input" type="email" id="commento-email" name="autore_email" autocomplete="email" required maxlength="200" data-astro-cid-n2y5q5hq> </div> <div class="commento-form-row" data-astro-cid-n2y5q5hq> <label class="commento-label" for="commento-testo" data-astro-cid-n2y5q5hq> ', ' <span aria-hidden="true" data-astro-cid-n2y5q5hq>*</span> </label> <textarea class="commento-input commento-textarea" id="commento-testo" name="testo" required minlength="10" maxlength="5000" rows="5" data-astro-cid-n2y5q5hq></textarea> </div> <div class="commento-form-row commento-form-actions" data-astro-cid-n2y5q5hq> <button type="submit" class="button commento-submit" data-astro-cid-n2y5q5hq> ', ' </button> <span class="commento-contatore" aria-live="polite" data-astro-cid-n2y5q5hq></span> </div> <div class="commento-feedback" role="alert" aria-live="assertive" hidden data-astro-cid-n2y5q5hq></div> </form> </div> </details> </section> <script>(function(){', "\n  const _isEn = commentoLang === 'en';\n  const _str = {\n    submitting: _isEn ? 'Submitting\u2026' : 'Invio in corso\u2026',\n    charsLeft: (n: number) => _isEn ? \\`\\${n} characters remaining\\` : \\`\\${n} caratteri rimanenti\\`,\n    success: _isEn\n      ? 'Thank you! Your comment has been submitted and will be published after editorial approval.'\n      : 'Grazie! Il tuo commento \xE8 stato inviato e sar\xE0 pubblicato dopo approvazione della redazione.',\n    errGeneric: _isEn ? 'An error occurred. Please try again.' : 'Si \xE8 verificato un errore. Riprova.',\n    errNetwork: _isEn\n      ? 'Could not send the comment. Please check your connection and try again.'\n      : 'Impossibile inviare il commento. Controlla la connessione e riprova.',\n  };\n\n  document.querySelectorAll<HTMLFormElement>('.commento-form').forEach((form) => {\n    const articoloId = form.dataset.articoloId ?? '';\n    const feedback = form.querySelector<HTMLElement>('.commento-feedback')!;\n    const submitBtn = form.querySelector<HTMLButtonElement>('.commento-submit')!;\n    const textarea = form.querySelector<HTMLTextAreaElement>('#commento-testo')!;\n    const contatore = form.querySelector<HTMLElement>('.commento-contatore')!;\n\n    // Contatore caratteri textarea\n    textarea?.addEventListener('input', () => {\n      const left = 5000 - textarea.value.length;\n      contatore.textContent = left < 500 ? _str.charsLeft(left) : '';\n    });\n\n    form.addEventListener('submit', async (e) => {\n      e.preventDefault();\n      feedback.hidden = true;\n      submitBtn.disabled = true;\n      submitBtn.textContent = _str.submitting;\n\n      const data = Object.fromEntries(new FormData(form));\n\n      try {\n        const res = await fetch('/api/commento', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ ...data, articolo_id: articoloId }),\n        });\n        const body = await res.json() as { ok: boolean; error?: string };\n\n        if (body.ok) {\n          form.reset();\n          showFeedback('success', _str.success);\n          contatore.textContent = '';\n        } else {\n          showFeedback('error', body.error ?? _str.errGeneric);\n        }\n      } catch {\n        showFeedback('error', _str.errNetwork);\n      } finally {\n        submitBtn.disabled = false;\n        submitBtn.textContent = commentoSubmitBtn;\n      }\n    });\n\n    function showFeedback(type: 'success' | 'error', msg: string) {\n      feedback.textContent = msg;\n      feedback.className = \\`commento-feedback commento-feedback--\\${type}\\`;\n      feedback.hidden = false;\n      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });\n    }\n  });\n})();<\/script> "])), maybeRenderHead(), commenti.length > 0 && renderTemplate`<details class="commenti-accordion" data-astro-cid-n2y5q5hq> <summary class="commenti-accordion-summary" data-astro-cid-n2y5q5hq> <span class="commenti-accordion-label" data-astro-cid-n2y5q5hq>${ui.showComments}</span> <span class="commenti-accordion-icon" aria-hidden="true" data-astro-cid-n2y5q5hq></span> </summary> <ol class="commenti-lista" aria-label="Commenti approvati" data-astro-cid-n2y5q5hq> ${commenti.map((c) => renderTemplate`<li class="commento" data-astro-cid-n2y5q5hq> <div class="commento-header" data-astro-cid-n2y5q5hq> <span class="commento-autore" data-astro-cid-n2y5q5hq>${c.autore_nome}</span> <time class="commento-data"${addAttribute(c.data_creazione, "datetime")} data-astro-cid-n2y5q5hq> ${formatData(c.data_creazione)} </time> </div> <p class="commento-testo" data-astro-cid-n2y5q5hq>${c.testo}</p> </li>`)} </ol> </details>`, ui.formTitle, ui.formNote, addAttribute(articoloId, "data-articolo-id"), ui.labelName, ui.labelComment, ui.submitBtn, defineScriptVars({ commentoLang: lang, commentoSubmitBtn: ui.submitBtn }));
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/Commenti.astro", void 0);
    $$Astro13 = createAstro("https://ombreeluci.it");
    $$CTAArticolo = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro13, $$props, $$slots);
      Astro2.self = $$CTAArticolo;
      const { lang = "it", pageContext = "articolo" } = Astro2.props;
      const ctas = ctaData.articolo;
      const cta = ctas[Math.floor(Math.random() * ctas.length)];
      const ui = lang === "en" ? cta.en : cta.it;
      const utmLink = `/sostienici?utm_source=${pageContext}&utm_medium=cta-inline&utm_campaign=${cta.id}&utm_content=${lang}`;
      return renderTemplate`${maybeRenderHead()}<aside${addAttribute(`cta-articolo cta-articolo--${cta.colore}`, "class")}${addAttribute(cta.id, "data-cta-id")}${addAttribute(cta.name, "data-cta-name")}${addAttribute(lang === "en" ? "Support us" : "Sostienici", "aria-label")} data-astro-cid-aeru4wkm> <p class="cta-articolo__titolo" data-astro-cid-aeru4wkm>${ui.titolo}</p> <p class="cta-articolo__testo" data-astro-cid-aeru4wkm>${ui.testo}</p> <a${addAttribute(utmLink, "href")} class="cta-articolo__link"${addAttribute(cta.id, "data-cta-id")}${addAttribute(pageContext, "data-cta-context")} data-astro-cid-aeru4wkm>${ui.cta} →</a> </aside> `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/CTAArticolo.astro", void 0);
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en/_slug_.astro.mjs
var slug_astro_exports5 = {};
__export(slug_astro_exports5, {
  page: () => page9,
  renderers: () => renderers
});
var __freeze5, __defProp6, __template5, _a5, _b, _c, $$Astro14, prerender9, $$slug4, $$file5, $$url5, _page9, page9;
var init_slug_astro5 = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en/_slug_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_directus_BvF_bImd();
    init_ArticleCard_BcaTyrt5();
    init_CTAArticolo_BKGMbCaw();
    init_taxonomy_BacsMRxg();
    init_Footer_DN9MDnF9();
    init_renderers();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    __freeze5 = Object.freeze;
    __defProp6 = Object.defineProperty;
    __template5 = /* @__PURE__ */ __name((cooked, raw) => __freeze5(__defProp6(cooked, "raw", { value: __freeze5(cooked.slice()) })), "__template");
    $$Astro14 = createAstro("https://ombreeluci.it");
    prerender9 = false;
    $$slug4 = createComponent(async ($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro14, $$props, $$slots);
      Astro2.self = $$slug4;
      const totalAutori = Array.isArray(autoriStats) ? autoriStats.length : 0;
      const creds = directusCredsFromAstroLocals(Astro2.locals);
      const urlSlug = (Astro2.params.slug ?? "").replace(/\/$/, "");
      let articolo2;
      try {
        articolo2 = await getArticoloBySlug(urlSlug, creds);
        if (articolo2 && articolo2.lang !== "en")
          articolo2 = null;
      } catch (e) {
        articolo2 = null;
      }
      if (!articolo2) {
        const directusSlug = urlSlug.endsWith("-en") ? urlSlug : `${urlSlug}-en`;
        try {
          articolo2 = await getArticoloBySlug(directusSlug, creds);
          if (articolo2 && articolo2.lang !== "en")
            articolo2 = null;
        } catch (e) {
          console.error("[en/[slug].astro] fetch error:", e);
          articolo2 = null;
        }
      }
      if (!articolo2 || articolo2.lang !== "en") {
        return new Response("Not found", { status: 404 });
      }
      Astro2.response.headers.set("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
      const locale = "en";
      const issueLabel = "Issue";
      const badgeIssueAriaLabel = "Category and issue";
      const shareLabelFacebook = "Share on Facebook";
      const shareLabelX = "Share on X (Twitter)";
      const shareLabelWhatsapp = "Share on WhatsApp";
      const shareLabelLinkedin = "Share on LinkedIn";
      const copyLinkLabel = "Copy link";
      const copiedLinkLabel = "Link copied!";
      let correlatiMap = {};
      try {
        const correlatiRes = await fetch(`${Astro2.url.origin}/correlati.json`);
        if (correlatiRes.ok)
          correlatiMap = await correlatiRes.json();
      } catch (e) {
        console.warn("[en/[slug].astro] correlati.json fetch failed:", e);
      }
      const correlatiSlugsRaw = correlatiMap[articolo2.slug] ?? [];
      let correlatiArticoli = await getArticoliBySlugList(correlatiSlugsRaw.slice(0, 10), creds).catch(() => []);
      if (correlatiArticoli.length === 0) {
        const preferred = await getFallbackRelatedArticles(
          {
            excludeSlug: articolo2.slug,
            lang: "en",
            categoriaMenu: articolo2.categoria_menu ?? null,
            limit: 4
          },
          creds
        ).catch(() => []);
        correlatiArticoli = preferred;
        if (correlatiArticoli.length === 0) {
          correlatiArticoli = await getFallbackRelatedArticles(
            {
              excludeSlug: articolo2.slug,
              lang: "en",
              limit: 4
            },
            creds
          ).catch(() => []);
        }
      }
      const correlatiSlugsEffective = correlatiSlugsRaw.length > 0 ? correlatiSlugsRaw : correlatiArticoli.map((a) => a.slug);
      function formatDateItalian(date, lang = "it") {
        return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "it-IT", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }).format(date);
      }
      __name(formatDateItalian, "formatDateItalian");
      function generateAuthorSlug(name) {
        return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      }
      __name(generateAuthorSlug, "generateAuthorSlug");
      function generateIssueSlug(issueNumber2) {
        return issueNumber2.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      }
      __name(generateIssueSlug, "generateIssueSlug");
      function calculateReadingTimeFromHtml(html) {
        if (!html)
          return 3;
        const textOnly = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        const wordCount = textOnly.split(/\s+/).filter((w) => w.length > 0).length;
        return Math.max(1, Math.ceil(wordCount / 200));
      }
      __name(calculateReadingTimeFromHtml, "calculateReadingTimeFromHtml");
      const articleTitle = articolo2.titolo;
      const articleDate = articolo2.data_pubblicazione ? new Date(articolo2.data_pubblicazione) : /* @__PURE__ */ new Date();
      const autoreCompleto = articolo2.autore;
      const autoreName = autoreCompleto?.nome_completo ?? t(locale, "author_unknown");
      const authorSlug = generateAuthorSlug(autoreName);
      const authorBioHtml = autoreCompleto?.bio_en?.trim() || autoreCompleto?.bio_html?.trim() || null;
      const isJeanVanier = autoreCompleto?.slug === "jean-vanier" || autoreName.toLowerCase().includes("jean vanier");
      const authorFotoId = autoreCompleto?.foto?.id ?? null;
      const authorImagePath = authorFotoId ? getAutoreImageUrl(authorFotoId) : `/assets/authors/${authorSlug}.jpg`;
      const authorBio = authorBioHtml;
      const _bioStripped = authorBioHtml ? authorBioHtml.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : null;
      const authorBioTruncated = _bioStripped && _bioStripped.length > 200 ? _bioStripped.substring(0, 200).replace(/\s\S*$/, "") + "\u2026" : null;
      const readingTime = calculateReadingTimeFromHtml(articolo2.corpo);
      const slugToArticolo = Object.fromEntries(correlatiArticoli.map((a) => [a.slug, a]));
      function extractYouTubeId(url) {
        const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([A-Za-z0-9_-]{11})/);
        return m ? m[1] : null;
      }
      __name(extractYouTubeId, "extractYouTubeId");
      function processEmbeds(html) {
        let out = html;
        let hasInstagram2 = false;
        out = out.replace(
          /<p>\s*(https?:\/\/(?:youtu\.be\/|(?:www\.)?youtube\.com\/watch[^\s<"]*)[^\s<"]*)\s*<\/p>/gi,
          (_, url) => {
            const id = extractYouTubeId(url);
            if (!id)
              return `<p>${url}</p>`;
            return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${id}" title="Video YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
          }
        );
        if (/<blockquote[^>]+instagram/i.test(out)) {
          hasInstagram2 = true;
          out = out.replace(
            /(<blockquote\b(?![^>]*class)[^>]*)(data-instgrm-permalink)/gi,
            '$1class="instagram-media" $2'
          );
        }
        return { html: out, hasInstagram: hasInstagram2 };
      }
      __name(processEmbeds, "processEmbeds");
      const rawCorpo = articolo2.corpo ?? "";
      const { html: processedCorpo, hasInstagram } = processEmbeds(rawCorpo);
      const [corpoPart1, corpoPart2] = [processedCorpo, ""];
      const issueNumber = articolo2.numero_rivista?.id_numero ?? null;
      const issueSlug = issueNumber ? generateIssueSlug(issueNumber) : null;
      const issueLink = issueSlug ? `/archivio/${issueSlug}` : null;
      const articleImageRaw = getArticoloCopertinaSrc(articolo2);
      const articleImage = articolo2.immagine_copertina?.id ? articleImageRaw : getPlaceholder(articolo2.slug ?? "").src;
      const explicitSubtitle = articolo2.sottotitolo?.trim() || articolo2.seo_description?.trim() || null;
      const heroCaption = articolo2.didascalia_copertina?.trim() || null;
      const metaDescription = explicitSubtitle || articolo2.seo_description ? (explicitSubtitle || articolo2.seo_description).substring(0, 160).replace(/\s+/g, " ").trim() : `${articleTitle} - ${t(locale, "meta_article_default_suffix")}`;
      const categoryDisplayRaw = getThemeLabel(articolo2);
      const categoryDisplay = localizeCategory(articolo2.categoria_menu, "en") ?? localizeTheme(categoryDisplayRaw, "en") ?? categoryDisplayRaw;
      const categoryItSlug = articolo2.categoria_menu ?? getCategorySlugForArticle(articolo2);
      const categoryEnSlug = categoryItSlug ? getCategoriaUrlSlug(categoryItSlug, "en") : null;
      const categoryLink = categoryEnSlug ? `/en/category/${categoryEnSlug}/` : null;
      const currentLabels = getLabels([], articolo2);
      const formaDisplay = currentLabels.formal && currentLabels.formal !== "Articolo" ? localizeFormalType(currentLabels.formal, locale) : null;
      const rubricaSlugIT = getFormaToRubricaSlug(currentLabels.formal);
      const formaLink = rubricaSlugIT ? `/en/sections/${getRubricaUrlSlug(rubricaSlugIT)}/` : null;
      const hasIssue = issueNumber != null && String(issueNumber).trim() !== "";
      const showPubblicatoOnline = !hasIssue;
      const { ruolo_editoriale } = getMegaclusterForArticle(articolo2);
      let roleLabel = null;
      let roleClassName = "";
      if (ruolo_editoriale === "portante") {
        roleLabel = t(locale, "badge_role_portante");
        roleClassName = " article-badge-role--portante";
      } else if (ruolo_editoriale === "strutturale") {
        roleLabel = t(locale, "badge_role_strutturale");
        roleClassName = " article-badge-role--strutturale";
      } else if (ruolo_editoriale === "laterale") {
        roleLabel = t(locale, "badge_role_laterale");
        roleClassName = " article-badge-role--laterale";
      } else if (ruolo_editoriale === "trasversale") {
        roleLabel = t(locale, "badge_role_trasversale");
        roleClassName = " article-badge-role--trasversale";
      }
      const pdfUrl = articolo2.numero_rivista?.pdf_archive_url ?? null;
      const alternateItem = articolo2.articolo_traduzione ?? null;
      const alternateArticleUrl = alternateItem && alternateItem.lang !== "en" ? `/it/${alternateItem.slug}` : null;
      const currentSlug = articolo2.slug;
      const currentWpIdClean = String(articolo2.wp_id ?? "");
      const wpIdToSlugMap = {};
      for (const a of correlatiArticoli) {
        if (a.wp_id && a.slug)
          wpIdToSlugMap[a.wp_id] = a.slug;
      }
      const inContentRelatedMap = {};
      for (const a of correlatiArticoli) {
        const imgUrl = getArticoloCopertinaSrc(a);
        const category = getCategorySlugForArticle(a) ?? null;
        inContentRelatedMap[a.slug] = {
          title: a.titolo,
          image: imgUrl,
          excerpt: a.sottotitolo?.trim() || null,
          href: `/en/${a.slug}`,
          category,
          lang: a.lang,
          isItalian: a.lang !== "en"
        };
      }
      const correlatiSlugs = correlatiSlugsEffective;
      const relatedArticles = (() => {
        const umap = correlatiSlugs.map((s) => slugToArticolo[s]).filter((a) => !!a && a.id !== articolo2.id && a.lang === "en").slice(0, 3);
        return umap.map((a) => {
          const labels = getLabels([], a);
          const { ruolo_editoriale: relRuolo } = getMegaclusterForArticle(a);
          return {
            title: a.titolo,
            author: a.autore?.nome_completo ?? t(locale, "author_unknown"),
            date: a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(),
            issue: a.numero_rivista?.id_numero ?? null,
            slug: a.slug,
            image: getArticoloCopertinaSrc(a),
            categoriaMenu: getThemeLabel(a) ?? null,
            forma: labels.formal,
            ruoloEditoriale: relRuolo
          };
        });
      })();
      const canonicalUrl = `${Astro2.url.origin}/en/${urlSlug}/`;
      const alternates = [
        { lang: "en", url: canonicalUrl },
        ...alternateArticleUrl ? [{ lang: "it", url: `${Astro2.url.origin}${alternateArticleUrl}` }] : []
      ];
      return renderTemplate`${renderComponent($$result, "ArticlePageLayout", $$ArticlePageLayout, { "title": articleTitle, "description": metaDescription, "ogImage": articleImage, "ogType": "article", "lang": "en", "canonical": canonicalUrl, "noindex": false, "alternateArticleUrl": alternateArticleUrl, "alternates": alternates, "pathname": `/en/${urlSlug}` }, { "default": async ($$result2) => renderTemplate(_b || (_b = __template5(["  ", '<main class="site-main">  <div class="reading-progress" id="reading-progress"></div> <div class="article-container">  <nav class="breadcrumbs"> <a href="/en/">', "</a> ", ' </nav>  <header class="article-header-wrapper"> ', ' <h1 class="article-title">', "</h1> ", ' <div class="article-meta"> <div class="article-meta-item"> <img', "", ` class="article-meta-author-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy"> <div class="article-meta-author-placeholder" style="display: none;"> `, " </div> <a", ' class="author-link">', '</a> </div> <div class="article-meta-item"> ', ' </div> <div class="article-meta-item"> ', " ", " </div> ", ' </div> </header>  <div class="article-hero-wrapper"> <div class="article-hero-image-wrapper"> <img', "", ' class="article-image" loading="eager" decoding="async" fetchpriority="high" data-copertina-fallback', "> ", " </div> </div>  ", '  <div class="social-sticky" id="social-sticky"> <div class="social-sticky-inner"> <a', ' target="_blank" rel="noopener noreferrer" class="social-link facebook"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link twitter"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link whatsapp"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link linkedin"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 24 22.222 24h.003z"></path> </svg> </a> <a', ' class="social-link email" aria-label="Send by email"> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path> </svg> </a> <a href="#" class="social-link copy-link"', "", '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path> </svg> </a> </div> </div>  <div class="article-content-wrapper"> <div class="article-content" id="article-content"> ', " <div>", "</div> ", " </div>  ", "  ", '  <div class="author-bio-section"> <div class="author-bio-wrapper"> <div class="author-bio-avatar"> <img', "", ` class="author-bio-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy"> <div class="author-bio-placeholder" style="display: none;"> `, ' </div> </div> <div class="author-bio-content"> <h3 class="author-bio-name"> <a', ' class="author-bio-link"> ', ' </a> </h3> <div class="author-bio-text"> ', ' </div> <p class="author-bio-total"> ', ' <a href="/autori">', " ", "</a> </p> </div> </div> </div> ", ' </div>  <div class="floating-widget" id="floating-widget"> <button class="close-btn" id="close-widget"', ">\xD7</button> <h4>", "</h4> ", " ", ' <a href="/en/" class="widget-link">', "</a> </div>  ", " ", ' <details class="debug-section" hidden> <summary style="cursor: pointer; color: var(--text-secondary); font-size: 0.85rem; margin-top: 2rem; padding: 0.5rem;">\n\u{1F50D} Debug: Dati articolo\n</summary> <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.75rem; margin-top: 0.5rem;">', '\n        </pre> </details> <section class="article-nav-section"', '> <a href="/en/" class="back-link">\u2190 ', "</a> </section> </div> </main> ", "<script>(function(){", "\n      window.__BLOG_PAGE_DATA__ = { wpIdToSlugMap, inContentRelatedMap, currentSlug, readAlsoLabel: 'READ ALSO', alternateArticleUrl, currentWpIdClean, lang: articleLang };\n    })();<\/script>  "])), maybeRenderHead(), t("en", "nav_archive"), issueNumber && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${" > "}<a${addAttribute(issueLink, "href")}>${issueLabel} ${issueNumber}</a> ` })}`, !showPubblicatoOnline ? renderTemplate`<nav class="article-category-badge"${addAttribute(badgeIssueAriaLabel, "aria-label")}> ${issueLink && renderTemplate`<a${addAttribute(issueLink, "href")} class="article-badge-link">${issueLabel} ${issueNumber}</a>`} ${issueLink && (formaDisplay || categoryDisplay) && renderTemplate`<span class="article-badge-sep"> • </span>`} ${formaDisplay && (formaLink ? renderTemplate`<a${addAttribute(formaLink, "href")} class="article-badge-link">${formaDisplay}</a>` : renderTemplate`<span class="article-badge-text">${formaDisplay}</span>`)} ${formaDisplay && categoryDisplay && renderTemplate`<span class="article-badge-sep"> / </span>`} ${categoryDisplay && (categoryLink ? renderTemplate`<a${addAttribute(categoryLink, "href")} class="article-badge-link">${categoryDisplay}</a>` : renderTemplate`<span class="article-badge-text">${categoryDisplay}</span>`)} </nav>` : renderTemplate`<div class="article-category-badge article-category-badge--online"> ${categoryLink ? renderTemplate`<a${addAttribute(categoryLink, "href")} class="article-badge-link">${categoryDisplay}</a>` : t("en", "published_online")} </div>`, articleTitle, explicitSubtitle && renderTemplate`<div class="article-subtitle"> ${explicitSubtitle} </div>`, addAttribute(authorImagePath, "src"), addAttribute(autoreName, "alt"), autoreName.charAt(0).toUpperCase(), addAttribute(`/en/authors/${authorSlug}`, "href"), autoreName, formatDateItalian(articleDate, "en"), readingTime, t("en", "min_read"), roleLabel && renderTemplate`<div class="article-meta-item"> <span${addAttribute(`article-badge-role${roleClassName}`, "class")}>${roleLabel}</span> </div>`, addAttribute(articleImage, "src"), addAttribute(articleTitle, "alt"), addAttribute(COPERTINA_IMG_ONERROR, "onerror"), heroCaption && renderTemplate`<div class="article-image-caption"> <img src="https://www.ombreeluci.it/wp-content/uploads/2023/10/icon-camera.png" alt="" class="caption-camera-icon" aria-hidden="true"> ${heroCaption} </div>`, articleDate.getFullYear() < 2e3 && renderTemplate`<div class="article-header-wrapper"> <div class="archival-alert-en"> <strong>This archival content from ${articleDate.getFullYear()} reflects the language and sensitivities of its time.</strong> </div> </div>`, addAttribute(`https://www.facebook.com/sharer/sharer.php?u=${Astro2.url.href}`, "href"), addAttribute(shareLabelFacebook, "aria-label"), addAttribute(`https://twitter.com/intent/tweet?url=${Astro2.url.href}&text=${encodeURIComponent(articleTitle)}`, "href"), addAttribute(shareLabelX, "aria-label"), addAttribute(`https://wa.me/?text=${encodeURIComponent(articleTitle + " " + Astro2.url.href)}`, "href"), addAttribute(shareLabelWhatsapp, "aria-label"), addAttribute(`https://www.linkedin.com/sharing/share-offsite/?url=${Astro2.url.href}`, "href"), addAttribute(shareLabelLinkedin, "aria-label"), addAttribute(`mailto:?subject=${encodeURIComponent(articleTitle)}&body=${encodeURIComponent(Astro2.url.href)}`, "href"), addAttribute(copyLinkLabel, "aria-label"), addAttribute(`event.preventDefault(); navigator.clipboard.writeText('${Astro2.url.href}'); this.setAttribute('aria-label', '${copiedLinkLabel}'); setTimeout(() => this.setAttribute('aria-label', '${copyLinkLabel}'), 2000); return false;`, "onclick"), isJeanVanier && renderTemplate`<aside class="vanier-alert" role="note"> <div>Notice: investigations commissioned by L&apos;Arche International established serious responsibility of Fr. Thomas Philippe (first report in 2015) and Jean Vanier (2020) toward several women. <a href="https://www.ombreeluci.it/2020/larca-internazionale-annuncia-i-risultati-dellindagine-indipendente/">Read the latest statement</a>, which unequivocally condemns these actions as "in total contradiction with the values Vanier advocated" and with "the fundamental principles of our communities".</div> </aside>`, unescapeHTML(corpoPart1), corpoPart2 && renderTemplate`<div>${unescapeHTML(corpoPart2)}</div>`, articolo2.tags?.filter((t2) => t2.tags_id).length > 0 && renderTemplate`<nav class="article-tags-list article-tags-list--hidden" aria-label="Tags"> ${articolo2.tags.filter((t2) => t2.tags_id).map((t2) => renderTemplate`<a${addAttribute(`/en/tag/${t2.tags_id.slug}`, "href")} class="article-tag-link">${t2.tags_id.nome}</a>`)} </nav>`, renderComponent($$result2, "CTAArticolo", $$CTAArticolo, { "lang": "en", "pageContext": "articolo-en" }), addAttribute(authorImagePath, "src"), addAttribute(autoreName, "alt"), autoreName.charAt(0).toUpperCase(), addAttribute(`/en/authors/${authorSlug}`, "href"), autoreName, authorBioTruncated ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <p>${authorBioTruncated}</p> <a${addAttribute(`/en/authors/${authorSlug}`, "href")} class="author-bio-more">Read more →</a> ` })}` : authorBio ? renderTemplate`<div>${unescapeHTML(authorBio)}</div>` : t("en", "author_bio_fallback"), t("en", "author_total_prefix"), totalAutori, t("en", "author_total"), renderComponent($$result2, "EditorialFeedback", $$EditorialFeedback, { "wpId": articolo2.wp_id, "title": articleTitle, "currentRole": ruolo_editoriale, "url": Astro2.url.href, "articoloId": articolo2.id, "lang": locale }), addAttribute(t("en", "widget_close"), "aria-label"), t("en", "widget_navigate"), pdfUrl ? renderTemplate`<a${addAttribute(pdfUrl, "href")} target="_blank" rel="noopener noreferrer" class="widget-link">${t("en", "widget_download_pdf")}</a>` : null, issueLink ? renderTemplate`<a${addAttribute(issueLink, "href")} class="widget-link">${t("en", "widget_go_to_issue")}</a>` : null, t("en", "nav_archive"), relatedArticles.length > 0 && renderTemplate`<section class="related-footer-section" aria-label="Related articles"> <div class="related-footer-inner"> <h2 class="related-footer-title">Related articles</h2> <div class="related-footer-grid"> ${relatedArticles.map((rel) => renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": rel.title, "author": rel.author, "date": rel.date, "issue": rel.issue, "slug": rel.slug, "image": rel.image, "categoriaMenu": rel.categoriaMenu, "forma": rel.forma, "ruoloEditoriale": rel.ruoloEditoriale, "lang": "en", "basePath": "/en" })}`)} </div> </div> </section>`, renderComponent($$result2, "Commenti", $$Commenti, { "articoloId": articolo2.id, "lang": "en" }), JSON.stringify({ id: articolo2.id, wp_id: articolo2.wp_id, slug: articolo2.slug, titolo: articolo2.titolo, lang: articolo2.lang, stato: articolo2.stato, data_pubblicazione: articolo2.data_pubblicazione }, null, 2), addAttribute(t("en", "aria_article_bottom_nav"), "aria-label"), t("en", "back_to_home"), hasInstagram && renderTemplate(_a5 || (_a5 = __template5(['<script async src="https://www.instagram.com/embed.js"><\/script>']))), defineScriptVars({ wpIdToSlugMap, inContentRelatedMap, currentSlug, currentWpIdClean, articleLang: "en", alternateArticleUrl })), "head": async ($$result2) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "slot": "head" }, { "default": async ($$result3) => renderTemplate(_c || (_c = __template5([' <meta name="pagefind:meta"', '> <script type="application/ld+json">', '<\/script> <script type="application/ld+json">', "<\/script> "])), addAttribute(`author:${autoreName}`, "content"), unescapeHTML(JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": articleTitle,
        "description": metaDescription ?? void 0,
        "image": articleImage?.startsWith("http") ? articleImage : `https://ombreeluci.it${articleImage}`,
        "datePublished": articleDate.toISOString(),
        "dateModified": articleDate.toISOString(),
        "inLanguage": "en-US",
        "author": {
          "@type": "Person",
          "name": autoreName,
          "url": `https://ombreeluci.it/it/autori/${authorSlug}`
        },
        "publisher": {
          "@type": "Organization",
          "name": "Ombre e Luci",
          "url": "https://ombreeluci.it",
          "logo": {
            "@type": "ImageObject",
            "url": "https://ombreeluci.it/logo.svg"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl
        },
        ...articolo2.numero_rivista?.id_numero ? {
          "isPartOf": {
            "@type": "PublicationIssue",
            "@id": `https://ombreeluci.it/archivio/${articolo2.numero_rivista.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`
          }
        } : {}
      })), unescapeHTML(JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": (() => {
          const site = "https://ombreeluci.it";
          const archiveHref = `${site}/en/`;
          const items = [
            {
              "@type": "ListItem",
              "position": 1,
              "name": t("en", "nav_archive"),
              "item": archiveHref
            }
          ];
          if (categoryDisplay && categoryLink) {
            items.push({
              "@type": "ListItem",
              "position": 2,
              "name": categoryDisplay,
              "item": `${site}${categoryLink}`
            });
          }
          items.push({
            "@type": "ListItem",
            "position": items.length + 1,
            "name": articleTitle
          });
          return items;
        })()
      }))) })}` })}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/en/[slug].astro", void 0);
    $$file5 = "C:/Users/berto/Documents/Ombreeluci/src/pages/en/[slug].astro";
    $$url5 = "/en/[slug]";
    _page9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$slug4,
      file: $$file5,
      prerender: prerender9,
      url: $$url5
    }, Symbol.toStringTag, { value: "Module" }));
    page9 = /* @__PURE__ */ __name(() => _page9, "page");
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/en.astro.mjs
var en_astro_exports = {};
var init_en_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/en.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/archivio/web-only.astro.mjs
var web_only_astro_exports2 = {};
var init_web_only_astro2 = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/archivio/web-only.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/archivio/_issue_.astro.mjs
var issue_astro_exports2 = {};
__export(issue_astro_exports2, {
  page: () => page10,
  renderers: () => renderers
});
var $$Astro15, prerender10, $$issue2, $$file6, $$url6, _page10, page10;
var init_issue_astro2 = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/archivio/_issue_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_BaseLayout_DOaiilqT();
    init_IssueContent_BtamaNxI();
    init_directus_BvF_bImd();
    init_renderers();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro15 = createAstro("https://ombreeluci.it");
    prerender10 = false;
    $$issue2 = createComponent(async ($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro15, $$props, $$slots);
      Astro2.self = $$issue2;
      const { issue } = Astro2.params;
      if (!issue)
        return Astro2.redirect("/it/archivio/");
      const rawNumeri = await getAllNumeriRivista();
      function numProgressivo(idNumero) {
        const m = idNumero.match(/(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      }
      __name(numProgressivo, "numProgressivo");
      const numeriOrdinati = [...rawNumeri].sort((a, b) => {
        const annoA = a.anno_pubblicazione ?? 0;
        const annoB = b.anno_pubblicazione ?? 0;
        if (annoA !== annoB)
          return annoA - annoB;
        return numProgressivo(a.id_numero) - numProgressivo(b.id_numero);
      });
      const index = numeriOrdinati.findIndex(
        (n) => n.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-") === issue
      );
      if (index === -1)
        return Astro2.redirect("/it/archivio/");
      const numero = numeriOrdinati[index];
      const prevNumero = index > 0 ? numeriOrdinati[index - 1] : null;
      const nextNumero = index < numeriOrdinati.length - 1 ? numeriOrdinati[index + 1] : null;
      const prevSlug = prevNumero ? prevNumero.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-") : null;
      const nextSlug = nextNumero ? nextNumero.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-") : null;
      const articoliNumero = await getArticoliByNumeroId(numero.id);
      const copertinaNumeroUrl = getNumeroImageUrl(numero);
      const testata = numero.tipo === "ins" ? "Insieme" : "Ombre e Luci";
      return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${numero.display_title} \u2013 Archivio`, "description": numero.descrizione ?? `${testata} \u2013 ${numero.display_title}: sfoglia gli articoli e scarica il PDF.`, "noindex": true, "ogImage": copertinaNumeroUrl, "lang": "it", "alternateArticleUrl": `/en/archive/${numero.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-")}` }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "IssueContent", $$IssueContent, { "lang": "it", "numero": numero, "prevSlug": prevSlug, "nextSlug": nextSlug, "articoliNumero": articoliNumero, "archiveBasePath": "/it/archivio" })} ` })}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/it/archivio/[issue].astro", void 0);
    $$file6 = "C:/Users/berto/Documents/Ombreeluci/src/pages/it/archivio/[issue].astro";
    $$url6 = "/it/archivio/[issue]";
    _page10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$issue2,
      file: $$file6,
      prerender: prerender10,
      url: $$url6
    }, Symbol.toStringTag, { value: "Module" }));
    page10 = /* @__PURE__ */ __name(() => _page10, "page");
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/archivio.astro.mjs
var archivio_astro_exports = {};
var init_archivio_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/archivio.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/autori/_slug_.astro.mjs
var slug_astro_exports6 = {};
var init_slug_astro6 = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/autori/_slug_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/autori.astro.mjs
var autori_astro_exports = {};
var init_autori_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/autori.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/categoria/_categoria_.astro.mjs
var categoria_astro_exports = {};
var init_categoria_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/categoria/_categoria_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/cerca.astro.mjs
var cerca_astro_exports = {};
var init_cerca_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/cerca.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/chi-siamo/collaboratori.astro.mjs
var collaboratori_astro_exports = {};
var init_collaboratori_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/chi-siamo/collaboratori.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/chi-siamo/contatti.astro.mjs
var contatti_astro_exports = {};
var init_contatti_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/chi-siamo/contatti.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/chi-siamo/hanno-scritto-per-noi.astro.mjs
var hanno_scritto_per_noi_astro_exports = {};
var init_hanno_scritto_per_noi_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/chi-siamo/hanno-scritto-per-noi.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/chi-siamo/la-redazione.astro.mjs
var la_redazione_astro_exports = {};
var init_la_redazione_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/chi-siamo/la-redazione.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/chi-siamo/la-rivista.astro.mjs
var la_rivista_astro_exports = {};
var init_la_rivista_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/chi-siamo/la-rivista.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/chi-siamo/redazione-storica.astro.mjs
var redazione_storica_astro_exports = {};
var init_redazione_storica_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/chi-siamo/redazione-storica.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/chi-siamo.astro.mjs
var chi_siamo_astro_exports = {};
var init_chi_siamo_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/chi-siamo.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/diari/_diario_.astro.mjs
var diario_astro_exports2 = {};
var init_diario_astro2 = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/diari/_diario_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/focus/_vertical_.astro.mjs
var vertical_astro_exports2 = {};
var init_vertical_astro2 = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/focus/_vertical_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/focus.astro.mjs
var focus_astro_exports2 = {};
var init_focus_astro2 = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/focus.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/newsletter.astro.mjs
var newsletter_astro_exports2 = {};
var init_newsletter_astro2 = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/newsletter.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/rubriche/diari.astro.mjs
var diari_astro_exports = {};
var init_diari_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/rubriche/diari.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/rubriche/_rubrica_.astro.mjs
var rubrica_astro_exports = {};
var init_rubrica_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/rubriche/_rubrica_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/sostienici.astro.mjs
var sostienici_astro_exports = {};
var init_sostienici_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/sostienici.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/tag/_slug_.astro.mjs
var slug_astro_exports7 = {};
__export(slug_astro_exports7, {
  page: () => page11,
  renderers: () => renderers
});
var $$Astro16, prerender11, $$slug5, $$file7, $$url7, _page11, page11;
var init_slug_astro7 = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/tag/_slug_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_BaseLayout_DOaiilqT();
    init_ArticoliRullo_BlaFCqIC();
    init_directus_BvF_bImd();
    init_renderers();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro16 = createAstro("https://ombreeluci.it");
    prerender11 = false;
    $$slug5 = createComponent(async ($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro16, $$props, $$slots);
      Astro2.self = $$slug5;
      const creds = directusCredsFromAstroLocals(Astro2.locals);
      const tagSlug = (Astro2.params.slug ?? "").replace(/\/$/, "");
      const [tag, allArticoli] = await Promise.all([
        getTagBySlug(tagSlug, creds),
        getArticoliByTag(tagSlug, creds)
      ]);
      if (!tag) {
        return new Response("Not found", { status: 404 });
      }
      const articoli = allArticoli.filter((a) => a.lang === "it");
      Astro2.response.headers.set("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
      return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": tag.nome, "description": `Articoli con il tag "${tag.nome}" su Ombre e Luci.`, "noindex": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main"> <div class="container"> ${renderComponent($$result2, "ArticoliRullo", $$ArticoliRullo, { "title": tag.nome, "articoli": articoli, "pageSize": 24 })} </div> </main> ` })}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/it/tag/[slug].astro", void 0);
    $$file7 = "C:/Users/berto/Documents/Ombreeluci/src/pages/it/tag/[slug].astro";
    $$url7 = "/it/tag/[slug]";
    _page11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$slug5,
      file: $$file7,
      prerender: prerender11,
      url: $$url7
    }, Symbol.toStringTag, { value: "Module" }));
    page11 = /* @__PURE__ */ __name(() => _page11, "page");
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/it/_slug_.astro.mjs
var slug_astro_exports8 = {};
__export(slug_astro_exports8, {
  page: () => page12,
  renderers: () => renderers
});
var $$Astro$15, $$LeggiAnche, __freeze6, __defProp7, __template6, _a6, _b2, _c2, $$Astro17, prerender12, $$slug6, $$file8, $$url8, _page12, page12;
var init_slug_astro8 = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/it/_slug_.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_server_BT9XwReg();
    init_directus_BvF_bImd();
    init_ArticleCard_BcaTyrt5();
    init_CTAArticolo_BKGMbCaw();
    init_taxonomy_BacsMRxg();
    init_Footer_DN9MDnF9();
    init_renderers();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro$15 = createAstro("https://ombreeluci.it");
    $$LeggiAnche = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$15, $$props, $$slots);
      Astro2.self = $$LeggiAnche;
      const { articolo: articolo2 } = Astro2.props;
      if (!articolo2)
        return;
      const href = `/it/${articolo2.slug}`;
      const image = getArticoloCopertinaSrc(articolo2) ?? "/placeholder/ph-1.jpg";
      const _excerpt = articolo2.sottotitolo?.trim() || articolo2.seo_description?.trim() || null;
      const sottotitolo = _excerpt && _excerpt !== articolo2.titolo?.trim() ? _excerpt : null;
      return renderTemplate`${maybeRenderHead()}<aside class="leggi-anche" data-astro-cid-3mqzycu7> <a${addAttribute(href, "href")} class="leggi-anche-link" data-astro-cid-3mqzycu7> <span class="leggi-anche-label" data-astro-cid-3mqzycu7>Leggi anche</span> <div class="leggi-anche-inner" data-astro-cid-3mqzycu7> ${image && renderTemplate`<div class="leggi-anche-img" data-astro-cid-3mqzycu7> <img${addAttribute(image, "src")}${addAttribute(articolo2.titolo, "alt")} loading="lazy" data-astro-cid-3mqzycu7> </div>`} <div class="leggi-anche-text" data-astro-cid-3mqzycu7> <p class="leggi-anche-title" data-astro-cid-3mqzycu7>${articolo2.titolo}</p> ${sottotitolo && renderTemplate`<p class="leggi-anche-excerpt" data-astro-cid-3mqzycu7>${sottotitolo}</p>`} </div> </div> </a> </aside> `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/LeggiAnche.astro", void 0);
    __freeze6 = Object.freeze;
    __defProp7 = Object.defineProperty;
    __template6 = /* @__PURE__ */ __name((cooked, raw) => __freeze6(__defProp7(cooked, "raw", { value: __freeze6(raw || cooked.slice()) })), "__template");
    $$Astro17 = createAstro("https://ombreeluci.it");
    prerender12 = false;
    $$slug6 = createComponent(async ($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro17, $$props, $$slots);
      Astro2.self = $$slug6;
      const totalAutori = Array.isArray(autoriStats) ? autoriStats.length : 0;
      const creds = directusCredsFromAstroLocals(Astro2.locals);
      const rawSlug = Astro2.params.slug ?? "";
      const slug = rawSlug.replace(/\/$/, "");
      let articolo2;
      try {
        articolo2 = await getArticoloBySlug(slug, creds);
      } catch (e) {
        console.error("[blog/[...slug].astro] fetch error:", e);
        articolo2 = null;
      }
      if (!articolo2) {
        return new Response("Not found", { status: 404 });
      }
      if (articolo2.lang === "en") {
        const enUrlSlug = slug.endsWith("-en") ? slug.slice(0, -3) : slug;
        return Astro2.redirect(`/en/${enUrlSlug}/`, 301);
      }
      Astro2.response.headers.set("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
      const locale = articolo2.lang === "en" ? "en" : "it";
      const issueLabel = locale === "en" ? "Issue" : "Numero";
      const badgeIssueAriaLabel = locale === "en" ? "Category and issue" : "Categoria e numero";
      const shareLabelFacebook = locale === "en" ? "Share on Facebook" : "Condividi su Facebook";
      const shareLabelX = locale === "en" ? "Share on X (Twitter)" : "Condividi su X (Twitter)";
      const shareLabelWhatsapp = locale === "en" ? "Share on WhatsApp" : "Condividi su WhatsApp";
      const shareLabelLinkedin = locale === "en" ? "Share on LinkedIn" : "Condividi su LinkedIn";
      const copyLinkLabel = locale === "en" ? "Copy link" : "Copia link";
      const copiedLinkLabel = locale === "en" ? "Link copied!" : "Link copiato!";
      let correlatiMap = {};
      try {
        const correlatiRes = await fetch(`${Astro2.url.origin}/correlati.json`);
        if (correlatiRes.ok)
          correlatiMap = await correlatiRes.json();
      } catch (e) {
        console.warn("[blog/[...slug].astro] correlati.json fetch failed:", e);
      }
      const correlatiSlugsRaw = correlatiMap[articolo2.slug] ?? [];
      let correlatiArticoli = await getArticoliBySlugList(correlatiSlugsRaw.slice(0, 10), creds).catch(() => []);
      if (correlatiArticoli.length === 0) {
        const preferred = await getFallbackRelatedArticles(
          {
            excludeSlug: articolo2.slug,
            lang: articolo2.lang === "en" ? "en" : "it",
            categoriaMenu: articolo2.categoria_menu ?? null,
            limit: 4
          },
          creds
        ).catch(() => []);
        correlatiArticoli = preferred;
        if (correlatiArticoli.length === 0) {
          correlatiArticoli = await getFallbackRelatedArticles(
            {
              excludeSlug: articolo2.slug,
              lang: articolo2.lang === "en" ? "en" : "it",
              limit: 4
            },
            creds
          ).catch(() => []);
        }
      }
      const correlatiSlugsEffective = correlatiSlugsRaw.length > 0 ? correlatiSlugsRaw : correlatiArticoli.map((a) => a.slug);
      function formatDateItalian(date, lang = "it") {
        return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }).format(date);
      }
      __name(formatDateItalian, "formatDateItalian");
      function generateAuthorSlug(name) {
        return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      }
      __name(generateAuthorSlug, "generateAuthorSlug");
      function generateIssueSlug(issueNumber2) {
        return issueNumber2.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      }
      __name(generateIssueSlug, "generateIssueSlug");
      function calculateReadingTimeFromHtml(html) {
        if (!html)
          return 3;
        const textOnly = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        const wordCount = textOnly.split(/\s+/).filter((w) => w.length > 0).length;
        return Math.max(1, Math.ceil(wordCount / 200));
      }
      __name(calculateReadingTimeFromHtml, "calculateReadingTimeFromHtml");
      const articleTitle = articolo2.titolo;
      const articleDate = articolo2.data_pubblicazione ? new Date(articolo2.data_pubblicazione) : /* @__PURE__ */ new Date();
      const autoreCompleto = articolo2.autore;
      const autoreName = autoreCompleto?.nome_completo ?? t(locale, "author_unknown");
      const authorSlug = generateAuthorSlug(autoreName);
      const authorBioHtml = autoreCompleto?.bio_html?.trim() || null;
      const isJeanVanier = autoreCompleto?.slug === "jean-vanier" || autoreName.toLowerCase().includes("jean vanier");
      const authorFotoId = autoreCompleto?.foto?.id ?? null;
      const authorImagePath = authorFotoId ? getAutoreImageUrl(authorFotoId) : `/assets/authors/${authorSlug}.jpg`;
      const authorBio = authorBioHtml;
      const _bioStripped = authorBioHtml ? authorBioHtml.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : null;
      const authorBioTruncated = _bioStripped && _bioStripped.length > 200 ? _bioStripped.substring(0, 200).replace(/\s\S*$/, "") + "\u2026" : null;
      const readingTime = calculateReadingTimeFromHtml(articolo2.corpo);
      const slugToArticolo = Object.fromEntries(correlatiArticoli.map((a) => [a.slug, a]));
      function splitCorpoAfterNthParagraph(html, n) {
        let count = 0;
        let idx = 0;
        while (count < n && idx < html.length) {
          const next = html.indexOf("</p>", idx);
          if (next === -1)
            break;
          idx = next + 4;
          count++;
        }
        if (count < n)
          return [html, ""];
        return [html.slice(0, idx), html.slice(idx)];
      }
      __name(splitCorpoAfterNthParagraph, "splitCorpoAfterNthParagraph");
      function extractYouTubeId(url) {
        const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([A-Za-z0-9_-]{11})/);
        return m ? m[1] : null;
      }
      __name(extractYouTubeId, "extractYouTubeId");
      function processEmbeds(html) {
        let out = html;
        let hasInstagram2 = false;
        out = out.replace(
          /<p>\s*(https?:\/\/(?:youtu\.be\/|(?:www\.)?youtube\.com\/watch[^\s<"]*)[^\s<"]*)\s*<\/p>/gi,
          (_, url) => {
            const id = extractYouTubeId(url);
            if (!id)
              return `<p>${url}</p>`;
            return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${id}" title="Video YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
          }
        );
        if (/<blockquote[^>]+instagram/i.test(out)) {
          hasInstagram2 = true;
          out = out.replace(
            /(<blockquote\b(?![^>]*class)[^>]*)(data-instgrm-permalink)/gi,
            '$1class="instagram-media" $2'
          );
        }
        return { html: out, hasInstagram: hasInstagram2 };
      }
      __name(processEmbeds, "processEmbeds");
      const rawCorpo = articolo2.corpo ?? "";
      const { html: processedCorpo, hasInstagram } = processEmbeds(rawCorpo);
      const leggiAncheSlug = articolo2.lang !== "en" ? correlatiSlugsEffective.find((s) => {
        if (correlatiSlugsRaw.length === 0)
          return true;
        const bCorrelati = correlatiMap[s] ?? [];
        return bCorrelati[0] !== articolo2.slug;
      }) ?? null : null;
      const leggiAncheArticolo = leggiAncheSlug ? slugToArticolo[leggiAncheSlug] ?? null : null;
      const [corpoPart1, corpoPart2] = leggiAncheArticolo && processedCorpo ? splitCorpoAfterNthParagraph(processedCorpo, 3) : [processedCorpo, ""];
      const issueNumber = articolo2.numero_rivista?.id_numero ?? null;
      const issueSlug = issueNumber ? generateIssueSlug(issueNumber) : null;
      const issueLink = issueSlug ? `/archivio/${issueSlug}` : null;
      const articleImageRaw = getArticoloCopertinaSrc(articolo2);
      const articleImage = articolo2.immagine_copertina?.id ? articleImageRaw : getPlaceholder(articolo2.slug ?? "").src;
      const explicitSubtitle = articolo2.sottotitolo?.trim() || articolo2.seo_description?.trim() || null;
      const heroCaption = articolo2.didascalia_copertina?.trim() || null;
      const metaDescription = explicitSubtitle || articolo2.seo_description ? (explicitSubtitle || articolo2.seo_description).substring(0, 160).replace(/\s+/g, " ").trim() : `${articleTitle} - ${t(locale, "meta_article_default_suffix")}`;
      const categoryDisplay = getThemeLabel(articolo2);
      const categorySlug = getCategorySlugForArticle(articolo2);
      const categoryLink = categorySlug ? locale === "en" ? `/en/category/${getCategoriaUrlSlug(categorySlug, "en")}/` : `/categoria/${categorySlug}/` : null;
      const currentLabels = getLabels([], articolo2);
      const formaDisplay = currentLabels.formal && currentLabels.formal !== "Articolo" ? localizeFormalType(currentLabels.formal, locale) : null;
      const rubricaSlug = getFormaToRubricaSlug(currentLabels.formal);
      const formaLink = rubricaSlug ? `/rubriche/${rubricaSlug}/` : null;
      const hasIssue = issueNumber != null && String(issueNumber).trim() !== "";
      const showPubblicatoOnline = !hasIssue;
      const { ruolo_editoriale } = getMegaclusterForArticle(articolo2);
      let roleLabel = null;
      let roleClassName = "";
      if (ruolo_editoriale === "portante") {
        roleLabel = t(locale, "badge_role_portante");
        roleClassName = " article-badge-role--portante";
      } else if (ruolo_editoriale === "strutturale") {
        roleLabel = t(locale, "badge_role_strutturale");
        roleClassName = " article-badge-role--strutturale";
      } else if (ruolo_editoriale === "laterale") {
        roleLabel = t(locale, "badge_role_laterale");
        roleClassName = " article-badge-role--laterale";
      } else if (ruolo_editoriale === "trasversale") {
        roleLabel = t(locale, "badge_role_trasversale");
        roleClassName = " article-badge-role--trasversale";
      }
      const pdfUrl = articolo2.numero_rivista?.pdf_archive_url ?? null;
      articolo2.lang === "en";
      const isCurrentEn = articolo2.lang === "en";
      const currentWpIdClean = String(articolo2.wp_id ?? "");
      const currentSlug = articolo2.slug;
      const alternateItem = articolo2.articolo_traduzione ?? null;
      const alternateArticleUrl = alternateItem ? alternateItem.lang === "en" ? `${Astro2.url.origin}/en/${alternateItem.slug.endsWith("-en") ? alternateItem.slug.slice(0, -3) : alternateItem.slug}` : `${Astro2.url.origin}/it/${alternateItem.slug}` : null;
      const wpIdToSlugMap = {};
      for (const a of correlatiArticoli) {
        if (a.wp_id && a.slug)
          wpIdToSlugMap[a.wp_id] = a.slug;
      }
      const inContentRelatedMap = {};
      for (const a of correlatiArticoli) {
        const imgUrl = getArticoloCopertinaSrc(a);
        const lang = a.lang;
        const isItalian = lang !== "en";
        const category = getCategorySlugForArticle(a) ?? null;
        inContentRelatedMap[a.slug] = {
          title: a.titolo,
          image: imgUrl,
          excerpt: a.sottotitolo?.trim() || null,
          href: isItalian ? `/it/${a.slug}` : `/en/${a.slug.endsWith("-en") ? a.slug.slice(0, -3) : a.slug}`,
          category,
          lang,
          isItalian
        };
      }
      const correlatiSlugs = correlatiSlugsEffective;
      const relatedArticles = (() => {
        const umap = correlatiSlugs.filter((s) => s !== leggiAncheSlug).map((s) => slugToArticolo[s]).filter((a) => !!a && a.id !== articolo2.id && (isCurrentEn ? a.lang === "en" : a.lang !== "en")).slice(0, 3);
        return umap.map((a) => {
          const labels = getLabels([], a);
          const { ruolo_editoriale: relRuolo } = getMegaclusterForArticle(a);
          return {
            title: a.titolo,
            author: a.autore?.nome_completo ?? t(locale, "author_unknown"),
            date: a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(),
            issue: a.numero_rivista?.id_numero ?? null,
            slug: a.slug,
            image: getArticoloCopertinaSrc(a),
            categoriaMenu: getThemeLabel(a) ?? null,
            forma: labels.formal,
            ruoloEditoriale: relRuolo
          };
        });
      })();
      return renderTemplate`${renderComponent($$result, "ArticlePageLayout", $$ArticlePageLayout, { "title": articleTitle, "description": metaDescription, "ogImage": articleImage, "ogType": "article", "lang": articolo2.lang === "en" ? "en" : "it", "noindex": true, "alternateArticleUrl": alternateArticleUrl, "alternates": [
        { lang: articolo2.lang === "en" ? "en" : "it", url: Astro2.url.href },
        ...alternateArticleUrl ? [{ lang: articolo2.lang === "en" ? "it" : "en", url: alternateArticleUrl }] : []
      ] }, { "default": async ($$result2) => renderTemplate(_b2 || (_b2 = __template6(["  ", '<main class="site-main">  <div class="reading-progress" id="reading-progress"></div> <div class="article-container">  <nav class="breadcrumbs"> <a', ">", "</a> ", ' </nav>  <header class="article-header-wrapper">  ', ' <h1 class="article-title">', "</h1>  ", '  <div class="article-meta"> <div class="article-meta-item"> <img', "", ` class="article-meta-author-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy"> <div class="article-meta-author-placeholder" style="display: none;"> `, " </div> <a", ' class="author-link">', '</a> </div> <div class="article-meta-item"> ', ' </div> <div class="article-meta-item"> ', " ", " </div> ", ' </div> </header>  <div class="article-hero-wrapper"> <div class="article-hero-image-wrapper"> <img', "", ' class="article-image" loading="eager" decoding="async" fetchpriority="high" data-copertina-fallback', "> ", " </div> </div>  ", '  <div class="social-sticky" id="social-sticky"> <div class="social-sticky-inner"> <a', ' target="_blank" rel="noopener noreferrer" class="social-link facebook"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link twitter"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link whatsapp"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link linkedin"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path> </svg> </a> <a', ' class="social-link email" aria-label="Invia via email"> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path> </svg> </a> <a href="#" class="social-link copy-link"', "", '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path> </svg> </a> </div> </div>  <div class="article-content-wrapper"> <div class="article-content" id="article-content"> ', " <div>", "</div> ", " ", " </div>  ", "  ", '  <div class="author-bio-section"> <div class="author-bio-wrapper"> <div class="author-bio-avatar"> <img', "", ` class="author-bio-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy"> <div class="author-bio-placeholder" style="display: none;"> `, ' </div> </div> <div class="author-bio-content"> <h3 class="author-bio-name"> <a', ' class="author-bio-link"> ', ' </a> </h3> <div class="author-bio-text"> ', ' </div> <p class="author-bio-total"> ', ' <a href="/autori">', " ", "</a> </p> </div> </div> </div> ", ' </div>  <div class="floating-widget" id="floating-widget"> <button class="close-btn" id="close-widget"', ">\xD7</button> <h4>", "</h4> ", " ", " <a", ' class="widget-link">', "</a> </div>  ", " ", '  <details class="debug-section" hidden> <summary style="cursor: pointer; color: var(--text-secondary); font-size: 0.85rem; margin-top: 2rem; padding: 0.5rem;">\n\u{1F50D} Debug: Dati articolo\n</summary> <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.75rem; margin-top: 0.5rem;">', '\n        </pre> <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.75rem; margin-top: 0.5rem;">ID: ', "\nSlug: ", '\n        </pre> </details> <section class="article-nav-section"', "> <a", ' class="back-link">\u2190 ', "</a> </section> </div> </main> ", "<script>(function(){", `
      window.__BLOG_PAGE_DATA__ = { wpIdToSlugMap, inContentRelatedMap, currentSlug, readAlsoLabel, alternateArticleUrl, currentWpIdClean, lang: articleLang };
    })();<\/script> <script>
      (function() {
        var data = window.__BLOG_PAGE_DATA__;
        if (!data) return;
        var wpIdToSlugMap = data.wpIdToSlugMap || {};
        var inContentRelatedMap = data.inContentRelatedMap || {};
        var currentSlug = data.currentSlug;
        var readAlsoLabel = data.readAlsoLabel || (data.lang === 'en' ? 'READ ALSO' : 'Leggi anche');
        function getContainer() {
          return document.querySelector('article') || document.querySelector('.prose') || document.body;
        }
        function getParagraphs(container) {
          if (!container) return [];
          return Array.from(container.children || []);
        }
        var readAlsoInserted = false;
        function getSlugFromHref(href) {
          if (!href) return null;
          var wpMatch = href.match(/[?&]p=(\\d+)/);
          if (wpMatch && wpIdToSlugMap) {
            var wpId = parseInt(wpMatch[1], 10);
            return wpIdToSlugMap[wpId] || null;
          }
          try {
            var url = new URL(href, window.location.origin);
            var segments = url.pathname.split('/').filter(Boolean);
            var blogIndex = segments.indexOf('blog');
            if (blogIndex !== -1 && segments.length > blogIndex + 1) return segments.slice(blogIndex + 1).join('/');
            if (segments.length > 0) return segments[segments.length - 1];
          } catch (e) {}
          return null;
        }
        function buildRelatedCard(slug, meta) {
          var hrefFinal = meta.href || '/' + slug;
          var safeTitle = (meta.title || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
          var safeExcerpt = (meta.excerpt || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
          var article = document.createElement('article');
          article.className = 'incontent-related-card';
          article.innerHTML = '<a href="' + hrefFinal + '" class="incontent-related-link"><span class="incontent-related-label">' + readAlsoLabel + '</span><div class="incontent-related-image-wrapper"><img src="' + meta.image + '" alt="' + safeTitle + '" loading="lazy" onerror="this.onerror=null;this.src=\\'/images/placeholder-copertina.svg\\'" /></div><div class="incontent-related-content"><h4 class="incontent-related-title">' + safeTitle + '</h4>' + (safeExcerpt ? '<p class="incontent-related-excerpt">' + safeExcerpt + '</p>' : '') + '</div></a>';
          return article;
        }
        function removeOldRelatedSections() {
          var root = getContainer();
          if (!root) return;
          var oldSectionTitles = ['Articoli', 'Editoriale', 'Rubriche', 'Libri'];
          var children = Array.from(root.children);
          var lastThree = children.slice(-3);
          root.querySelectorAll('h4').forEach(function(h4) {
            // Bug 2 fix: rimuovi solo se l'h4 \xE8 tra gli ultimi 3 figli diretti del container
            var isNearEnd = lastThree.includes(h4) || lastThree.some(function(el) { return el.contains(h4); });
            if (!isNearEnd) return;
            var text = (h4.textContent || '').trim();
            if (oldSectionTitles.some(function(t) { return text === t || text.indexOf(t) !== -1 || text.endsWith(t); })) {
              var next = h4.nextElementSibling;
              while (next) {
                var toRemove = next;
                next = next.nextElementSibling;
                toRemove.remove();
              }
              h4.remove();
            }
          });
        }
        function insertReadAlsoBox() {
          if (readAlsoInserted || !inContentRelatedMap) return;
          if (document.querySelector('.incontent-related-card')) return;
          var container = getContainer();
          if (!container) return;
          var currentMeta = currentSlug ? inContentRelatedMap[currentSlug] : null;
          var currentCategory = currentMeta && currentMeta.category ? currentMeta.category : null;
          var allEntries = Object.entries(inContentRelatedMap);
          var candidates = allEntries.filter(function(entry) {
            var slug = entry[0], meta = entry[1];
            if (slug === currentSlug) return false;
            if (!meta || meta.isItalian === false) return false;
            if (currentCategory && meta.category) return meta.category === currentCategory;
            return true;
          });
          if (currentCategory && candidates.length === 0) {
            candidates = allEntries.filter(function(entry) {
              if (entry[0] === currentSlug) return false;
              return !!entry[1] && entry[1].isItalian !== false;
            });
          }
          if (!candidates.length) return;
          var randomIndex = Math.floor(Math.random() * candidates.length);
          var chosenSlug = candidates[randomIndex][0];
          var box = document.createElement('div');
          box.className = 'read-also-box';
          box.dataset.slug = chosenSlug;
          // Bug 3 fix: inserisci dopo il 3\xB0 paragrafo <p> diretto, non il 2\xB0 figlio generico
          var paragraphs = Array.from(container.querySelectorAll(':scope > p'));
          if (!paragraphs.length) return;
          var insertAfter = paragraphs[2] || paragraphs[paragraphs.length - 1];
          insertAfter.insertAdjacentElement('afterend', box);
          readAlsoInserted = true;
        }
        function enhanceReadAlsoBoxes() {
          if (!inContentRelatedMap) return;
          var root = getContainer();
          if (!root) return;
          // Bug 1 fix: nascondi TUTTI i paragrafi che contengono "leggi anche" in qualsiasi posizione
          root.querySelectorAll('p').forEach(function(p) {
            if (/leggi\\s+anche/i.test(p.textContent || '')) {
              p.classList.add('legacy-read-also');
            }
          });
          // Trasforma solo i .read-also-box in card (mai i <p>)
          root.querySelectorAll('.read-also-box').forEach(function(box) {
            var slug = box.dataset.slug || null;
            if (!slug) {
              box.querySelectorAll('a[href]').forEach(function(a) {
                if (!slug) slug = getSlugFromHref(a.getAttribute('href'));
              });
            }
            // Bug 4 fix: se slug non risolvibile o non in mappa, nascondi il box senza mostrare broken card
            if (!slug) { box.style.display = 'none'; return; }
            var meta = inContentRelatedMap[slug];
            if (!meta || meta.isItalian === false) { box.style.display = 'none'; return; }
            var card = buildRelatedCard(slug, meta);
            box.innerHTML = '';
            box.classList.add('incontent-related-container');
            box.appendChild(card);
          });
        }
        function runLeggiAnche() {
          removeOldRelatedSections();
          insertReadAlsoBox();
          enhanceReadAlsoBoxes();
        }
        function scheduleLeggiAnche() {
          readAlsoInserted = false;
          runLeggiAnche();
        }
        function run() { scheduleLeggiAnche(); }
        window.addEventListener('load', run);
        document.addEventListener('astro:after-swap', run);
        if (document.readyState === 'complete') run();
        else setTimeout(run, 100);
      })();
    <\/script>  `], ["  ", '<main class="site-main">  <div class="reading-progress" id="reading-progress"></div> <div class="article-container">  <nav class="breadcrumbs"> <a', ">", "</a> ", ' </nav>  <header class="article-header-wrapper">  ', ' <h1 class="article-title">', "</h1>  ", '  <div class="article-meta"> <div class="article-meta-item"> <img', "", ` class="article-meta-author-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy"> <div class="article-meta-author-placeholder" style="display: none;"> `, " </div> <a", ' class="author-link">', '</a> </div> <div class="article-meta-item"> ', ' </div> <div class="article-meta-item"> ', " ", " </div> ", ' </div> </header>  <div class="article-hero-wrapper"> <div class="article-hero-image-wrapper"> <img', "", ' class="article-image" loading="eager" decoding="async" fetchpriority="high" data-copertina-fallback', "> ", " </div> </div>  ", '  <div class="social-sticky" id="social-sticky"> <div class="social-sticky-inner"> <a', ' target="_blank" rel="noopener noreferrer" class="social-link facebook"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link twitter"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link whatsapp"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path> </svg> </a> <a', ' target="_blank" rel="noopener noreferrer" class="social-link linkedin"', '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path> </svg> </a> <a', ' class="social-link email" aria-label="Invia via email"> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path> </svg> </a> <a href="#" class="social-link copy-link"', "", '> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"> <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path> </svg> </a> </div> </div>  <div class="article-content-wrapper"> <div class="article-content" id="article-content"> ', " <div>", "</div> ", " ", " </div>  ", "  ", '  <div class="author-bio-section"> <div class="author-bio-wrapper"> <div class="author-bio-avatar"> <img', "", ` class="author-bio-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy"> <div class="author-bio-placeholder" style="display: none;"> `, ' </div> </div> <div class="author-bio-content"> <h3 class="author-bio-name"> <a', ' class="author-bio-link"> ', ' </a> </h3> <div class="author-bio-text"> ', ' </div> <p class="author-bio-total"> ', ' <a href="/autori">', " ", "</a> </p> </div> </div> </div> ", ' </div>  <div class="floating-widget" id="floating-widget"> <button class="close-btn" id="close-widget"', ">\xD7</button> <h4>", "</h4> ", " ", " <a", ' class="widget-link">', "</a> </div>  ", " ", '  <details class="debug-section" hidden> <summary style="cursor: pointer; color: var(--text-secondary); font-size: 0.85rem; margin-top: 2rem; padding: 0.5rem;">\n\u{1F50D} Debug: Dati articolo\n</summary> <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.75rem; margin-top: 0.5rem;">', '\n        </pre> <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.75rem; margin-top: 0.5rem;">ID: ', "\nSlug: ", '\n        </pre> </details> <section class="article-nav-section"', "> <a", ' class="back-link">\u2190 ', "</a> </section> </div> </main> ", "<script>(function(){", `
      window.__BLOG_PAGE_DATA__ = { wpIdToSlugMap, inContentRelatedMap, currentSlug, readAlsoLabel, alternateArticleUrl, currentWpIdClean, lang: articleLang };
    })();<\/script> <script>
      (function() {
        var data = window.__BLOG_PAGE_DATA__;
        if (!data) return;
        var wpIdToSlugMap = data.wpIdToSlugMap || {};
        var inContentRelatedMap = data.inContentRelatedMap || {};
        var currentSlug = data.currentSlug;
        var readAlsoLabel = data.readAlsoLabel || (data.lang === 'en' ? 'READ ALSO' : 'Leggi anche');
        function getContainer() {
          return document.querySelector('article') || document.querySelector('.prose') || document.body;
        }
        function getParagraphs(container) {
          if (!container) return [];
          return Array.from(container.children || []);
        }
        var readAlsoInserted = false;
        function getSlugFromHref(href) {
          if (!href) return null;
          var wpMatch = href.match(/[?&]p=(\\\\d+)/);
          if (wpMatch && wpIdToSlugMap) {
            var wpId = parseInt(wpMatch[1], 10);
            return wpIdToSlugMap[wpId] || null;
          }
          try {
            var url = new URL(href, window.location.origin);
            var segments = url.pathname.split('/').filter(Boolean);
            var blogIndex = segments.indexOf('blog');
            if (blogIndex !== -1 && segments.length > blogIndex + 1) return segments.slice(blogIndex + 1).join('/');
            if (segments.length > 0) return segments[segments.length - 1];
          } catch (e) {}
          return null;
        }
        function buildRelatedCard(slug, meta) {
          var hrefFinal = meta.href || '/' + slug;
          var safeTitle = (meta.title || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
          var safeExcerpt = (meta.excerpt || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
          var article = document.createElement('article');
          article.className = 'incontent-related-card';
          article.innerHTML = '<a href="' + hrefFinal + '" class="incontent-related-link"><span class="incontent-related-label">' + readAlsoLabel + '</span><div class="incontent-related-image-wrapper"><img src="' + meta.image + '" alt="' + safeTitle + '" loading="lazy" onerror="this.onerror=null;this.src=\\\\'/images/placeholder-copertina.svg\\\\'" /></div><div class="incontent-related-content"><h4 class="incontent-related-title">' + safeTitle + '</h4>' + (safeExcerpt ? '<p class="incontent-related-excerpt">' + safeExcerpt + '</p>' : '') + '</div></a>';
          return article;
        }
        function removeOldRelatedSections() {
          var root = getContainer();
          if (!root) return;
          var oldSectionTitles = ['Articoli', 'Editoriale', 'Rubriche', 'Libri'];
          var children = Array.from(root.children);
          var lastThree = children.slice(-3);
          root.querySelectorAll('h4').forEach(function(h4) {
            // Bug 2 fix: rimuovi solo se l'h4 \xE8 tra gli ultimi 3 figli diretti del container
            var isNearEnd = lastThree.includes(h4) || lastThree.some(function(el) { return el.contains(h4); });
            if (!isNearEnd) return;
            var text = (h4.textContent || '').trim();
            if (oldSectionTitles.some(function(t) { return text === t || text.indexOf(t) !== -1 || text.endsWith(t); })) {
              var next = h4.nextElementSibling;
              while (next) {
                var toRemove = next;
                next = next.nextElementSibling;
                toRemove.remove();
              }
              h4.remove();
            }
          });
        }
        function insertReadAlsoBox() {
          if (readAlsoInserted || !inContentRelatedMap) return;
          if (document.querySelector('.incontent-related-card')) return;
          var container = getContainer();
          if (!container) return;
          var currentMeta = currentSlug ? inContentRelatedMap[currentSlug] : null;
          var currentCategory = currentMeta && currentMeta.category ? currentMeta.category : null;
          var allEntries = Object.entries(inContentRelatedMap);
          var candidates = allEntries.filter(function(entry) {
            var slug = entry[0], meta = entry[1];
            if (slug === currentSlug) return false;
            if (!meta || meta.isItalian === false) return false;
            if (currentCategory && meta.category) return meta.category === currentCategory;
            return true;
          });
          if (currentCategory && candidates.length === 0) {
            candidates = allEntries.filter(function(entry) {
              if (entry[0] === currentSlug) return false;
              return !!entry[1] && entry[1].isItalian !== false;
            });
          }
          if (!candidates.length) return;
          var randomIndex = Math.floor(Math.random() * candidates.length);
          var chosenSlug = candidates[randomIndex][0];
          var box = document.createElement('div');
          box.className = 'read-also-box';
          box.dataset.slug = chosenSlug;
          // Bug 3 fix: inserisci dopo il 3\xB0 paragrafo <p> diretto, non il 2\xB0 figlio generico
          var paragraphs = Array.from(container.querySelectorAll(':scope > p'));
          if (!paragraphs.length) return;
          var insertAfter = paragraphs[2] || paragraphs[paragraphs.length - 1];
          insertAfter.insertAdjacentElement('afterend', box);
          readAlsoInserted = true;
        }
        function enhanceReadAlsoBoxes() {
          if (!inContentRelatedMap) return;
          var root = getContainer();
          if (!root) return;
          // Bug 1 fix: nascondi TUTTI i paragrafi che contengono "leggi anche" in qualsiasi posizione
          root.querySelectorAll('p').forEach(function(p) {
            if (/leggi\\\\s+anche/i.test(p.textContent || '')) {
              p.classList.add('legacy-read-also');
            }
          });
          // Trasforma solo i .read-also-box in card (mai i <p>)
          root.querySelectorAll('.read-also-box').forEach(function(box) {
            var slug = box.dataset.slug || null;
            if (!slug) {
              box.querySelectorAll('a[href]').forEach(function(a) {
                if (!slug) slug = getSlugFromHref(a.getAttribute('href'));
              });
            }
            // Bug 4 fix: se slug non risolvibile o non in mappa, nascondi il box senza mostrare broken card
            if (!slug) { box.style.display = 'none'; return; }
            var meta = inContentRelatedMap[slug];
            if (!meta || meta.isItalian === false) { box.style.display = 'none'; return; }
            var card = buildRelatedCard(slug, meta);
            box.innerHTML = '';
            box.classList.add('incontent-related-container');
            box.appendChild(card);
          });
        }
        function runLeggiAnche() {
          removeOldRelatedSections();
          insertReadAlsoBox();
          enhanceReadAlsoBoxes();
        }
        function scheduleLeggiAnche() {
          readAlsoInserted = false;
          runLeggiAnche();
        }
        function run() { scheduleLeggiAnche(); }
        window.addEventListener('load', run);
        document.addEventListener('astro:after-swap', run);
        if (document.readyState === 'complete') run();
        else setTimeout(run, 100);
      })();
    <\/script>  `])), maybeRenderHead(), addAttribute(locale === "en" ? "/en/" : "/it/archivio", "href"), t(locale, "nav_archive"), issueNumber && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${" > "}<a${addAttribute(issueLink, "href")}>${issueLabel} ${issueNumber}</a> ` })}`, !showPubblicatoOnline ? renderTemplate`<nav class="article-category-badge"${addAttribute(badgeIssueAriaLabel, "aria-label")}> ${issueLink && renderTemplate`<a${addAttribute(issueLink, "href")} class="article-badge-link">${issueLabel} ${issueNumber}</a>`} ${issueLink && (formaDisplay || categoryLink) && renderTemplate`<span class="article-badge-sep"> • </span>`} ${formaDisplay && (formaLink ? renderTemplate`<a${addAttribute(formaLink, "href")} class="article-badge-link">${formaDisplay}</a>` : renderTemplate`<span class="article-badge-text">${formaDisplay}</span>`)} ${formaDisplay && categoryDisplay && renderTemplate`<span class="article-badge-sep"> / </span>`} ${categoryLink ? renderTemplate`<a${addAttribute(categoryLink, "href")} class="article-badge-link">${categoryDisplay}</a>` : renderTemplate`<span class="article-badge-text">${categoryDisplay}</span>`} </nav>` : renderTemplate`<div class="article-category-badge article-category-badge--online"> ${categoryLink ? renderTemplate`<a${addAttribute(categoryLink, "href")} class="article-badge-link">${categoryDisplay}</a>` : t(locale, "published_online")} </div>`, articleTitle, explicitSubtitle && renderTemplate`<div class="article-subtitle"> ${explicitSubtitle} </div>`, addAttribute(authorImagePath, "src"), addAttribute(autoreName, "alt"), autoreName.charAt(0).toUpperCase(), addAttribute(`/it/autori/${authorSlug}`, "href"), autoreName, formatDateItalian(articleDate, locale), readingTime, t(locale, "min_read"), roleLabel && renderTemplate`<div class="article-meta-item"> <span${addAttribute(`article-badge-role${roleClassName}`, "class")}>${roleLabel}</span> </div>`, addAttribute(articleImage, "src"), addAttribute(articleTitle, "alt"), addAttribute(COPERTINA_IMG_ONERROR, "onerror"), heroCaption && renderTemplate`<div class="article-image-caption"> <img src="https://www.ombreeluci.it/wp-content/uploads/2023/10/icon-camera.png" alt="" class="caption-camera-icon" aria-hidden="true"> ${heroCaption} </div>`, articleDate.getFullYear() < 2e3 && renderTemplate`<div class="article-header-wrapper"> ${locale === "en" ? renderTemplate`<div class="archival-alert-en"> <strong>This archival content from ${articleDate.getFullYear()} reflects the language and sensitivities of its time.</strong> </div>` : renderTemplate`<div class="archival-alert"> <strong>Contenuto d'archivio:</strong> Questo articolo del ${articleDate.getFullYear()} riflette il linguaggio e le sensibilità del suo tempo.
</div>`} </div>`, addAttribute(`https://www.facebook.com/sharer/sharer.php?u=${Astro2.url.href}`, "href"), addAttribute(shareLabelFacebook, "aria-label"), addAttribute(`https://twitter.com/intent/tweet?url=${Astro2.url.href}&text=${encodeURIComponent(articleTitle)}`, "href"), addAttribute(shareLabelX, "aria-label"), addAttribute(`https://wa.me/?text=${encodeURIComponent(articleTitle + " " + Astro2.url.href)}`, "href"), addAttribute(shareLabelWhatsapp, "aria-label"), addAttribute(`https://www.linkedin.com/sharing/share-offsite/?url=${Astro2.url.href}`, "href"), addAttribute(shareLabelLinkedin, "aria-label"), addAttribute(`mailto:?subject=${encodeURIComponent(articleTitle)}&body=${encodeURIComponent(Astro2.url.href)}`, "href"), addAttribute(copyLinkLabel, "aria-label"), addAttribute(`event.preventDefault(); navigator.clipboard.writeText('${Astro2.url.href}'); this.setAttribute('aria-label', '${copiedLinkLabel}'); setTimeout(() => this.setAttribute('aria-label', '${copyLinkLabel}'), 2000); return false;`, "onclick"), isJeanVanier && renderTemplate`<aside class="vanier-alert" role="note"> ${locale === "en" ? renderTemplate`<div>Notice: investigations commissioned by L&apos;Arche International established serious responsibility of Fr. Thomas Philippe (first report in 2015) and Jean Vanier (2020) toward several women. <a href="https://www.ombreeluci.it/2020/larca-internazionale-annuncia-i-risultati-dellindagine-indipendente/">Read the latest statement</a>, which unequivocally condemns these actions as “in total contradiction with the values Vanier advocated” and with “the fundamental principles of our communities”.</div>` : renderTemplate`<div>Avviso: inchieste promosse dall&apos;Arca internazionale hanno accertato gravi responsabilità di padre Thomas Philippe (la prima nel 2015) e di Jean Vanier (2020) nei confronti di diverse donne. <a href="https://www.ombreeluci.it/2020/larca-internazionale-annuncia-i-risultati-dellindagine-indipendente/">Qui il comunicato più recente</a> che condanna senza riserve queste azioni «in totale contraddizione con i valori che Vanier sosteneva» e con «i principi fondamentali delle nostre comunità».</div>`} </aside>`, unescapeHTML(corpoPart1), leggiAncheArticolo && renderTemplate`${renderComponent($$result2, "LeggiAnche", $$LeggiAnche, { "articolo": leggiAncheArticolo })}`, corpoPart2 && renderTemplate`<div>${unescapeHTML(corpoPart2)}</div>`, articolo2.tags?.filter((t2) => t2.tags_id).length > 0 && renderTemplate`<nav class="article-tags-list" aria-label="Tag"> ${articolo2.tags.filter((t2) => t2.tags_id).map((t2) => renderTemplate`<a${addAttribute(`/tag/${t2.tags_id.slug}`, "href")} class="article-tag-link">${t2.tags_id.nome}</a>`)} </nav>`, renderComponent($$result2, "CTAArticolo", $$CTAArticolo, { "lang": "it", "pageContext": "articolo-it" }), addAttribute(authorImagePath, "src"), addAttribute(autoreName, "alt"), autoreName.charAt(0).toUpperCase(), addAttribute(`/it/autori/${authorSlug}`, "href"), autoreName, authorBioTruncated ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <p>${authorBioTruncated}</p> <a${addAttribute(`/it/autori/${authorSlug}`, "href")} class="author-bio-more"> ${locale === "en" ? "Read more \u2192" : "Leggi di pi\xF9 \u2192"} </a> ` })}` : authorBio ? renderTemplate`<div>${unescapeHTML(authorBio)}</div>` : t(locale, "author_bio_fallback"), t(locale, "author_total_prefix"), totalAutori, t(locale, "author_total"), renderComponent($$result2, "EditorialFeedback", $$EditorialFeedback, { "wpId": articolo2.wp_id, "title": articleTitle, "currentRole": ruolo_editoriale, "url": Astro2.url.href, "articoloId": articolo2.id, "lang": locale }), addAttribute(t(locale, "widget_close"), "aria-label"), t(locale, "widget_navigate"), pdfUrl ? renderTemplate`<a${addAttribute(pdfUrl, "href")} target="_blank" rel="noopener noreferrer" class="widget-link">${t(locale, "widget_download_pdf")}</a>` : null, issueLink ? renderTemplate`<a${addAttribute(issueLink, "href")} class="widget-link">${t(locale, "widget_go_to_issue")}</a>` : null, addAttribute(locale === "en" ? "/en/" : "/it/archivio", "href"), t(locale, "nav_archive"), relatedArticles.length > 0 && renderTemplate`<section class="related-footer-section"${addAttribute(locale === "en" ? "Related articles" : "Articoli correlati", "aria-label")}> <div class="related-footer-inner"> <h2 class="related-footer-title"> ${locale === "en" ? "Related articles" : "Articoli correlati"} </h2> <div class="related-footer-grid"> ${relatedArticles.map((rel) => renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": rel.title, "author": rel.author, "date": rel.date, "issue": rel.issue, "slug": rel.slug, "image": rel.image, "categoriaMenu": rel.categoriaMenu, "forma": rel.forma, "ruoloEditoriale": rel.ruoloEditoriale, "lang": locale })}`)} </div> </div> </section>`, renderComponent($$result2, "Commenti", $$Commenti, { "articoloId": articolo2.id, "lang": locale }), JSON.stringify({ id: articolo2.id, wp_id: articolo2.wp_id, slug: articolo2.slug, titolo: articolo2.titolo, lang: articolo2.lang, stato: articolo2.stato, data_pubblicazione: articolo2.data_pubblicazione }, null, 2), articolo2.id, articolo2.slug, addAttribute(t(locale, "aria_article_bottom_nav"), "aria-label"), addAttribute(locale === "en" ? "/en/" : "/", "href"), t(locale, "back_to_home"), hasInstagram && renderTemplate(_a6 || (_a6 = __template6(['<script async src="https://www.instagram.com/embed.js"><\/script>']))), defineScriptVars({ wpIdToSlugMap, inContentRelatedMap, currentSlug, readAlsoLabel: t(locale, "read_also"), alternateArticleUrl, currentWpIdClean, articleLang: articolo2.lang })), "head": async ($$result2) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "slot": "head" }, { "default": async ($$result3) => renderTemplate(_c2 || (_c2 = __template6([' <meta name="pagefind:meta"', '> <script type="application/ld+json">', '<\/script> <script type="application/ld+json">', "<\/script> "])), addAttribute(`author:${autoreName}`, "content"), unescapeHTML(JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": articleTitle,
        "description": metaDescription ?? void 0,
        "image": articleImage?.startsWith("http") ? articleImage : `https://ombreeluci.it${articleImage}`,
        "datePublished": articleDate.toISOString(),
        "dateModified": articleDate.toISOString(),
        "inLanguage": articolo2.lang === "en" ? "en-US" : "it-IT",
        "author": {
          "@type": "Person",
          "name": autoreName,
          "url": `https://ombreeluci.it/it/autori/${authorSlug}`
        },
        "publisher": {
          "@type": "Organization",
          "name": "Ombre e Luci",
          "url": "https://ombreeluci.it",
          "logo": {
            "@type": "ImageObject",
            "url": "https://ombreeluci.it/logo.svg"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": Astro2.url.href
        },
        ...articolo2.numero_rivista?.id_numero ? {
          "isPartOf": {
            "@type": "PublicationIssue",
            "@id": `https://ombreeluci.it/archivio/${articolo2.numero_rivista.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`
          }
        } : {}
      })), unescapeHTML(JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": (() => {
          const site = "https://ombreeluci.it";
          const archiveHref = locale === "en" ? `${site}/en` : `${site}/archivio`;
          const items = [
            {
              "@type": "ListItem",
              "position": 1,
              "name": t(locale, "nav_archive"),
              "item": archiveHref
            }
          ];
          if (categoryDisplay && categoryLink) {
            items.push({
              "@type": "ListItem",
              "position": 2,
              "name": categoryDisplay,
              "item": `${site}${categoryLink}`
            });
          }
          items.push({
            "@type": "ListItem",
            "position": items.length + 1,
            "name": articleTitle
          });
          return items;
        })()
      }))) })}` })}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/it/[slug].astro", void 0);
    $$file8 = "C:/Users/berto/Documents/Ombreeluci/src/pages/it/[slug].astro";
    $$url8 = "/it/[slug]";
    _page12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$slug6,
      file: $$file8,
      prerender: prerender12,
      url: $$url8
    }, Symbol.toStringTag, { value: "Module" }));
    page12 = /* @__PURE__ */ __name(() => _page12, "page");
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/sitemap-en.xml.astro.mjs
var sitemap_en_xml_astro_exports = {};
var init_sitemap_en_xml_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/sitemap-en.xml.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/sitemap.xml.astro.mjs
var sitemap_xml_astro_exports = {};
var init_sitemap_xml_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/sitemap.xml.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/pages/index.astro.mjs
var index_astro_exports = {};
var init_index_astro = __esm({
  ".wrangler/tmp/pages-JtB0w2/pages/index.astro.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/pages-JtB0w2/_astro-internal_middleware.mjs
var astro_internal_middleware_exports = {};
__export(astro_internal_middleware_exports, {
  onRequest: () => onRequest
});
var redirectsLegacy, REDIRECTS, DATE_PATH_RE, YEAR_MONTH_SLUG_RE, BLOG_EN_SLUG_RE, DIARIO_RE, BLOG_IT_SLUG_RE, onRequest$2, When, isBuildContext, whenAmI, middlewares, onRequest$1, onRequest;
var init_astro_internal_middleware = __esm({
  ".wrangler/tmp/pages-JtB0w2/_astro-internal_middleware.mjs"() {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_index_CGzEFjN();
    init_astro_designed_error_pages_CROwsZzW();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    redirectsLegacy = {
      "/ombre-e-luci-n-1-1983-sfogliabile/": "/it/ombre-e-luci-n-3-1983-sfogliabile/",
      "/ombre-e-luci-n-1-1983/": "/it/ombre-e-luci-n-3-1983-sfogliabile/",
      "/editoriale-4-la-sindrome-down/": "/it/editoriale-4-il-mio-bambino-con-la-sindrome-down/",
      "/centro-di-formazione-professionale-dell-opera-francescana-charitas-di-vicenza/": "/it/vicenza-centro-di-formazione-professionale-dell-opera-francescana-charitas/",
      "/dialogo-aperto-n-2/": "/it/dialogo-aperto-numero-2/",
      "/nessun-uomo-e-una-pietr/": "/it/nessun-uomo-e-una-pietra/",
      "/e-sempre-stato-rifiutato__trashed/": "/it/e-sempre-stato-rifiutato/",
      "/il-bambino-trisomico/": "/it/trisomia-21-la-sindrome-down/",
      "/chiediamo-alle-comunita-religiose/": "/it/secondo-le-possibilita-e-secondo-il-vangelo-chiediamo-alle-comunita-religiose/",
      "/la-riabilitazione/": "/it/la-riabilitazione-nella-scuole-ma-la-bambina-non-e-tenuta-in-classe/",
      "/psicosi-precoci/": "/it/psicosi-precoci-che-cosa-sono/",
      "/un-centro-per-la-cura-della-psicosi/": "/it/oltre-la-scienza-umanita-e-buon-senso-in-un-centro-per-la-cura-della-psicosi/",
      "/oltre-la-scienza-e-l-umanita-un-centro-per-la-cura-della-psicosi/": "/it/oltre-la-scienza-umanita-e-buon-senso-in-un-centro-per-la-cura-della-psicosi/",
      "/consigli-utili/": "/it/psicosi-infantile-alcuni-consigli-utili/",
      "/una-verita-difficile-a-dirsi/": "/it/integrazione-a-scuola-una-verita-difficile-a-dirsi/",
      "/il-volontariato/": "/it/quando-e-volontariato/",
      "/storia-di-unadozione/": "/it/il-nostro-cucciolo-di-due-metri-storia-di-un-adozione/",
      "/dialogo-aperto/": "/it/dialogo-aperto-n-9/",
      "/dialogo-aperto-n-10/": "/it/dialogo-aperto-n-9/",
      "/e_gli_altri-_figli_consigli_per_-i_-genitori_di_bambino_disabile/": "/it/altri_figli_consigli_per_genitori_bambino_disabile/",
      "/un-piccolo-vademecum-comportarsi-fratelli-le-sorelle/": "/it/altri_figli_consigli_per_genitori_bambino_disabile/",
      "/ma-dopo-rincontro-non-li-vedo-piu/": "/it/ma-dopo-l-incontro-non-li-vedo-piu/",
      "/mio-e-fra-tello-era-handicappato/": "/it/mio-fratello-era-handicappato/",
      "/mi-saro-unidea/": "/it/mi-saro-fatto-un-idea/",
      "/essere-vicini-fin-vita/": "/it/essere-vicini-a-chi-e-in-fin-di-vita/",
      "/un-mondo-scoprire-camminando-fermandoci-2/": "/it/un-mondo-scoprire-camminando-fermandoci/",
      "/prepariamolo-vivere-gli-altri/": "/it/prepariamolo-vivere-con-gli-altri/",
      "/\u30E1\u30EA\u30FC\u30AF\u30EA\u30B9\u30DE\u30B9/": "/it/natale-giappone/",
      "/feliz-natal/": "/it/natale-brasile/",
      "/dialogo-aperto-n-11/": "/it/dialogo-aperto-n-13/",
      "/c-po\u0436\u0434\u0435ctbom/": "/it/natale-russia/",
      "/sretan-bozi/": "/it/natale-slovenia/",
      "/la-sfida-dellarca-2/": "/it/la-sfida-dellarca-recensione/",
      "/voi-che-avreste-fatto/": "/it/il-peso-degli-sguardi/",
      "/le-parole-martini/": "/it/i-genitori-commentano-le-parole-del-cardinal-martini/",
      "/perche-venuti-ad-assisi/": "/it/siamo-venuti-ad-assisi-per/",
      "/grazie-san-francesco-venuto-camminare/": "/it/grazie-san-francesco-venuto-camminare-con-noi/",
      "/signore-uno-strumento-della-tua-pace/": "/it/signore-fa-di-me-uno-strumento-della-tua-pace/",
      "/lettera-di-una-mamma/": "/it/la-fortuna-di-avere-daniela-lettera-di-una-mamma/",
      "/tutto-quello-che-ha-f/": "/it/tutto-quello-che-ha-fatto-per-noi/",
      "/convento-seconda-famiglia-giampiero/": "/it/convento-una-seconda-famiglia-per-giampiero/",
      "/arrivano-fatt-curagg/": "/it/quando-arrivano-fatti-coraggio/",
      "/numero-17-adulti-sfogliabile/": "/it/ombre-luci-n-17-1987-sfogliabile/",
      "/numero-17-1987-sfogliabile/": "/it/ombre-luci-n-17-1987-sfogliabile/",
      "/ombre-e-luci-n-18-1987-sfogliabile/": "/it/ombre-luci-n-18-1987-sfogliabile/",
      "/numero-18-1987-sfogliabile/": "/it/ombre-luci-n-18-1987-sfogliabile/",
      "/numero-16-1986-sfogliabile/": "/it/ombre-luci-n-16-1986-sfogliabile/",
      "/ombre-luci-n-14-1986-sfogliabile-2/": "/it/ombre-luci-n-14-1986-sfogliabile/",
      "/ombre-luci-n-11-1986-sfogliabile/": "/it/ombre-luci-n-11-1985-sfogliabile/",
      "/non-so-dirlo/": "/it/non-so-come-ne-a-chi-dirlo/",
      "/dal-diario-uninsegnante/": "/it/dal-diario-di-un-insegnante/",
      "/pietre-paragone/": "/it/la-persona-con-disabilita-come-fonte-di-unita-nella-chiesa/",
      "/dove-vivono-come-vivono/": "/it/villa-san-giovanni-di-dio/",
      "/vivono-vivono-le-persone-colpite-malattia-mentale/": "/it/dove-come-vivono-persone-colpite-malattia-mentale/",
      "/boccati-nel-sogno/": "/it/bloccati-nel-sogno/",
      "/scuola-ricamo-stare-insieme-divertendoci/": "/it/scuola-ricamo-imparare-divertendoci/",
      "/fare-teatro/": "/it/fare-teatro-persone-disabili/",
      "/dialogo-aperto-m-24/": "/it/dialogo-aperto-n-24/",
      "/conoscere-lhandicap-autismo/": "/it/conoscere-handicap-autismo/",
      "/sotto-rocchio-dellorologio/": "/it/christopher-nolan-sotto-locchio-dellorologio/",
      "/ascolta-bone-joseph/": "/it/ascolta-bene-joseph/",
      "/rimini-ex-mattatoio-riqualificato-a-centro-di-accoglienza-per-disabilita/": "/it/riccione-ex-mattatoio-riqualificato-a-centro-di-accoglienza-per-disabilita/",
      "/una-grande-famiglia-del-mondo/": "/it/fede-e-luce-una-grande-famiglia-del-mondo/",
      "/un-campeggio-rocca-papa-ora-comincia-bello/": "/it/vita-fede-e-luce-n-11-un-campeggio-rocca-papa-ora-comincia-bello/",
      "/incontro-internazionale-edimburgo-1-9-agosto-1990/": "/it/incontro-internazionale-edimburgo-agosto-1990/",
      "/malattia-mentale-e-legge/": "/it/malattia-mentale-legge-180/",
      "/un-territorio-molti-progetti/": "/it/primavalle-un-territorio-molti-progetti/",
      "/se/": "/it/anche-noi-siamo-persone/",
      "/diaolog/": "/it/dialogo-aperto-n-35/",
      "/treviso-in-your-shoes-il-concorso-studentesco-per-progetti-di-inclusione-sociale/": "/it/in-your-shoes-concorso-studenti-inclusione/",
      "/piu-che-una-rivista-una-grande-famiglia/": "/it/10-anni-di-ombre-e-luci-piu-che-una-rivista-una-grande-famiglia/",
      "/unestate-di-campi-fede-e-luce-2/": "/it/ridere-a-partire-dal-corpo/",
      "/non-si-puo-ridere-che-dellhandicap-2/": "/it/ridere-a-partire-dal-corpo/",
      "/la-sedia-a-rotelle-e-i-chicchi-duva-2/": "/it/ridere-a-partire-dal-corpo/",
      "/dalle-province-n-127-2/": "/it/ridere-a-partire-dal-corpo/",
      "/un-panorama-da-riscoprire/": "/it/ridere-a-partire-dal-corpo/",
      "/un-gettone-di-liberta/": "/it/ridere-a-partire-dal-corpo/",
      "/un-gettone-di-liberta-recensione-2/": "/it/ridere-a-partire-dal-corpo/",
      "/ridere-a-partire-dal-corpo-2/": "/it/un-dado-vegetale-da-sogno-e-fatto-in-casa/",
      "/un-gettone-di-liberta-2/": "/it/mio-figlio-luciano/",
      "/la-nostra-vita-insieme-recensione-2/": "/it/mio-figlio-luciano/",
      "/di-padre-in-figlio-conversazioni-sul-rischio-di-educare-recensione-2/": "/it/mio-figlio-luciano/",
      "/dialogo-aperto-n-127-2/": "/it/mio-figlio-luciano/",
      "/la-carrozzina-sulle-macerie-2/": "/it/mio-figlio-luciano/",
      "/umorismo-e-handicap-un-terreno-minato-2/": "/it/mio-figlio-luciano/",
      "/ridere-e-una-cosa-seria-2/": "/it/mio-figlio-luciano/",
      "/diritti-delle-persone-disabili/": "/it/diritti-delle-persone-disabili-secondo-onu/",
      "/viola-e-mimosa/": "/it/liberta/",
      "/vite-straordinarie-3/": "/it/liberta/",
      "/dalle-province-n-144-2/": "/it/liberta/",
      "/dialogo-aperto-n-144-2/": "/it/liberta/",
      "/meglio-di-come-ci-si-aspetta-2/": "/it/liberta/",
      "/mi-chiamo-lucia-2/": "/it/liberta/",
      "/anffas-60-anni-di-futuro-2/": "/it/liberta/",
      "/tutti-possono-essere-santi-2/": "/it/liberta/",
      "/casa-loic/": "/it/inaugurazione-casa-loic-scuola-laboratorio-artigianale-per-ragazzi-disabili/",
      "/casa-loic-scuola-laboratorio-artigianale-per-ragazzi-disabili/": "/it/inaugurazione-casa-loic-scuola-laboratorio-artigianale-per-ragazzi-disabili/",
      "/una-mappa-di-ricordi-virtuale-per-contrastare-lalzheimer/": "/it/alzheimer-vita-ricordi/",
      "/diversi-da-chi-diversi-da-chi-normali-vite-con-handicap/": "/it/diversi-da-chi-normali-vite-con-handicap/",
      "/la-nostra-meglio-gioventu-fano-2018/": "/it/fano2018/",
      "/in-alto-in-basso/": "/it/luca-mio-figlio-autistico/",
      "/esperienza-di-un-obiettore-in-una-comunita/": "/it/ho-guadagnato-un-anno-al-carro/",
      "/vestita-di-nuvole2/": "/it/vestita-di-nuvole/",
      "/bozza-automatica/": "/it/catechesi-anche-per-le-persone-autistiche/",
      "/insieme-si-puo/": "/it/soluzione-per-malati-mentali-insieme-si-puo/",
      "/la-nostra-casa/": "/it/comunita-tau-la-nostra-casa/",
      "/comunita-taula-nostra-casa/": "/it/comunita-tau-la-nostra-casa/",
      "/il-mio-piede-sinistro-2/": "/it/il-mio-piede-sinistro-il-film/",
      "/rain-man/": "/it/rain-man-la-recensione/",
      "/figli-di-un-dio-minore/": "/it/figli-di-un-dio-minore-recensione/",
      "/come-dirlo-2/": "/it/il-progetto-girotondo/",
      "/non-era-normale-2/": "/it/il-mistero-di-tanto-bene/",
      "/laltra-famiglia-storie-e-percorsi-di-affido-al-villaggio-sos-recensione/": "/it/viola-e-mimosa-a-manila/",
      "/io-sono-qui-recensione-2/": "/it/viola-e-mimosa-a-manila/",
      "/mai-piu-soli-lavventura-di-fede-e-luce-recensione-2/": "/it/viola-e-mimosa-a-manila/",
      "/fede-e-luce-dalle-province-n-121-2/": "/it/viola-e-mimosa-a-manila/",
      "/da-citta-del-messico/": "/it/viola-e-mimosa-a-manila/",
      "/viola-e-mimosa-da-citta-del-messico-2/": "/it/viola-e-mimosa-a-manila/",
      "/dialogo-aperto-n-121-2/": "/it/viola-e-mimosa-a-manila/",
      "/un-po-di-follia-per-fare-meraviglie-2/": "/it/viola-e-mimosa-a-manila/",
      "/per-una-vita-di-comunione-2/": "/it/viola-e-mimosa-a-manila/",
      "/jean-christophe-parisot-un-cercatore-di-dio-2/": "/it/viola-e-mimosa-a-manila/",
      "/bartimeo-uomo-solo-in-mezzo-alla-folla-2/": "/it/viola-e-mimosa-a-manila/",
      "/qualcuno-aspetta-2/": "/it/viola-e-mimosa-a-manila/",
      "/una-comunita-e-essere-insieme-2/": "/it/viola-e-mimosa-a-manila/",
      "/primavera-di-fede-2/": "/it/viola-e-mimosa-a-manila/",
      "/prendetene-e-mangiatene-tutti-2/": "/it/viola-e-mimosa-a-manila/",
      "/intervista-a-jean-vanier-2/": "/it/viola-e-mimosa-a-manila/",
      "/cosi-e-sceso-dal-trono-2/": "/it/viola-e-mimosa-a-manila/",
      "/io-sono-nato-cosi-come-imparare-a-guardare-oltre-la-differenza-recensione-2/": "/it/viola-e-mimosa-a-manila/",
      "/come-pinguini-nel-deserto-recensione-2/": "/it/viola-e-mimosa-a-manila/",
      "/una-notte-ho-sognato-che-parlavi-recensione-2/": "/it/viola-e-mimosa-a-manila/",
      "/carissimo-cardinale-2/": "/it/viola-e-mimosa-a-manila/",
      "/la-figlia-dellaltra-recensione-2/": "/it/viola-e-mimosa-a-manila/",
      "/il-vangelo-dei-vinti-recensione-2/": "/it/viola-e-mimosa-a-manila/",
      "/annachiara-bortolotti-ed-curcu-genovese-pp-125/": "/it/viola-e-mimosa-a-manila/",
      "/chiamami-alex-recensione-2/": "/it/viola-e-mimosa-a-manila/",
      "/momenti-misteriosi-2/": "/it/il-carro-una-casa-famiglia-per-tutti/",
      "/quando-a-raccontare-lolocausto-sono-gli-ex-naxisti/": "/it/recensione-final-account/",
      "/disabilita-e-quei-bisogni-non-ascoltati/": "/it/recensione-listen/",
      "/come-difficile-convivere-con-lepatite-b/": "/it/recensione-the-best-is-yet-to-come/",
      "/perso-nella-traduzione/": "/it/recensione-quo-vadis-aida/",
      "/oaza-ai-confini-della-finzione/": "/it/recensione-oaza/",
      "/barriere-invisibili-al-cuore-2/": "/it/mai-piu-soli-tre-testimonianze/",
      "/mi-saro-fatto-unidea-2/": "/it/mai-piu-soli-tre-testimonianze/",
      "/fede-e-luce-essere-movimento-2/": "/it/mai-piu-soli-tre-testimonianze/",
      "/proprio-io-2/": "/it/mai-piu-soli-tre-testimonianze/",
      "/un-tesoro-inestimabile-2/": "/it/mai-piu-soli-tre-testimonianze/",
      "/il-dono-dellunita-2/": "/it/mai-piu-soli-tre-testimonianze/",
      "/custodire-ogni-persona-2/": "/it/mai-piu-soli-tre-testimonianze/",
      "/la-poverta-delle-beatitudini-2/": "/it/mai-piu-soli-tre-testimonianze/",
      "/una-profezia-2/": "/it/mai-piu-soli-tre-testimonianze/",
      "/e-ci-si-sente-un-po-soli-2/": "/it/mai-piu-soli-tre-testimonianze/",
      "/tutti-insieme-2/": "/it/mai-piu-soli-tre-testimonianze/",
      "/fragile-2/": "/it/mai-piu-soli-tre-testimonianze/",
      "/la-scossa-della-vunerabilita-2/": "/it/mai-piu-soli-tre-testimonianze/",
      "/programma-del-pellegrinaggio-a-roma-del-1975-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/perche-questo-pellegrinaggio-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/bilancio-fede-e-luce-1975-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/i-piu-difficili-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/mi-sento-in-crisi-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/festa-della-luce-1976-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/pennellate-dai-centri-fede-e-luce-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/incontrarsi-il-venerdi-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/resoconto-della-riunione-internazionale-di-fede-e-luce-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/vedremo-mai-la-luce-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-3/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/esperienze-un-week-end-fuori-dallordinario-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/dove-lo-prendo-tanto-amore-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/xavier-un-mio-un-nostro-nuovo-a-amico-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/un-metodo-efficace-per-leducazione-dei-bambini-con-disabilita-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/guidare-alla-luce-catechesi-sensoriale-per-una-vita-spirituale-inclusiva-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/letture-consigliate-darti-la-vita-recensione-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/notiziario-fede-e-luce-il-resoconto-dellultima-festa-della-luce-e-altre-notizie-dal-movimento-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/alla-ricerca-delle-vere-vacanze-rompere-gli-schemi-e-scoprire-il-significato-profondo-del-riposo-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/la-vecchia-signora-brontolona-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/i-bambini-autistici-una-guida-per-genitori-recensione-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/a-tutti-i-gruppi-fede-e-luce-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/notiziario-fede-e-luce-dicembre-1977/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/esperienze-estive-fra-arche-e-mary-mount-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/alfedena-1976-esperienze-di-vita-comunitaria-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/attivita-di-tempo-libero-e-vita-comunitaria-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/per-la-nostra-riflessione-una-croce-di-carta-smerigliata-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-11-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/lettera-aperta-a-padre-michel-charpantier-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/editoriale-parliamo-di-insieme-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/bilancio-fede-e-luce-1976-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/gli-altri-un-figlio-subnormale-recensione-libro-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/notiziario-fede-e-luce-n-13-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/fede-e-luce-incontri-internazionali-e-nazionali-1977-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/esperienze-al-club-avance-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/techniche-di-recupero-per-i-disabili-gravi-la-socializzazione-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/per-nostra-riflessione-la-comunione-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-13-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/editoriale-auguri-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/letture-consigliate-n-13-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/parliamo-di-ri-educazione-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/notiziario-fede-e-luce-n-14-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/attivita-di-fine-stagione-del-gruppo-san-paolo-di-roma-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/cosa-si-fa-nelle-casette-di-fede-e-luce-le-risposte-di-chi-ce-stato-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/leducazione-delle-persone-disabili-imparare-a-vestirsi-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/per-la-nostra-riflessione-milano-vederci-piu-chiaro/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/inno-alla-vita-di-una-handicappata-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-14-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/editoriale-vacanze-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/editoriale-amici-o-fratelli-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/editoriale-le-nostre-paure-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-16-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/la-comunita-che-accoglie-di-rifiutati-recensione-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/preparazione-al-pellegrinaggio-fede-e-luce-ad-assisi-1978-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/quando-arrivano-le-vacanze-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-18-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-19-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/quattordici-anni-con-loro-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/per-la-loro-educazione-bilancio-di-unestate-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/alfedena-1978-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/vacanze-1978-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/una-lezione-damore-incontro-fede-e-luce-llalelli-galles-del-sud-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/soggiorno-allarche-1978-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/sono-andata-a-bruxelles-a-fare-volontariato-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/katimavik-una-parole-escquimese-che-vuol-dire-incontro/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/katimavik-una-parola-escquimese-che-vuol-dire-incontro-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/i-bambini-profondamente-handicappati-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/lamore-non-basta-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/aria-di-vacanze-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-22-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/un-compleanno-al-capezzale-di-un-amico-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/mattone-su-mattone-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/focus-gli-adulti-profondamente-handicappati-alcune-testimonianze-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/mio-fratello-marco-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/siamo-stati-dei-buoni-genitori-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/non-avrei-mai-pensato-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/un-antidoto-alla-disperazione-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/sprovveduto-e-sorpreso-chi-non-lo-e-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/incontro-internazionale-a-cuneo-28-29-aprile-1979-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/pellegrinaggio-a-loreto-18-20-maggio-1979/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/pellegrinaggio-a-loreto-1979-raccontato-da-olga-gammarelli/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/perche-vi-chiamate-fede-e-luce-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-23-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/gli-adulti-lievemente-handicappati/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/trovai-lavoro-in-una-casa-farmaceutica-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/amicizie-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/vuoi-essere-mio-amico-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/saluta-la-tua-insegnante-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/e-domani-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/dialoghi-scomodi-amicizie-vere-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/teresa-2/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/teresa-ventanni-di-cambiamenti-nellapproccio-alla-disabilita/": "/it/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/genitori-speciali-zzati-servizio-di-consulenza-pedagogica-di-trento-2/": "/it/qualcosa-e-cambiato/",
      "/gioia-e-le-altre/": "/it/qualcosa-e-cambiato/",
      "/gioia-e-le-altre-recensione-2/": "/it/qualcosa-e-cambiato/",
      "/il-chicco-recensione-2/": "/it/qualcosa-e-cambiato/",
      "/alla-ricerca-di-dory-recensione-2/": "/it/qualcosa-e-cambiato/",
      "/la-tempesta-di-sasa-recensione-2/": "/it/qualcosa-e-cambiato/",
      "/se-arianna-recensione-2/": "/it/qualcosa-e-cambiato/",
      "/viola-e-occhiolino-2/": "/it/qualcosa-e-cambiato/",
      "/il-valore-del-cammino-insieme-2/": "/it/qualcosa-e-cambiato/",
      "/nuove-comunita-fede-e-luce-festa-in-umbria-2/": "/it/qualcosa-e-cambiato/",
      "/accogliere-la-sorpresa-2/": "/it/qualcosa-e-cambiato/",
      "/il-messaggio-del-giubileo-dialogo-con-mons-rino-fisichella-2/": "/it/qualcosa-e-cambiato/",
      "/pedagogia-del-dolore-innocente-recensione-2/": "/it/qualcosa-e-cambiato/",
      "/io-sono-con-te-recensione-2/": "/it/qualcosa-e-cambiato/",
      "/dalle-province-n-136-2/": "/it/qualcosa-e-cambiato/",
      "/i-doni-di-dio-2/": "/it/qualcosa-e-cambiato/",
      "/leducazione-attraverso-lesempio-2/": "/it/qualcosa-e-cambiato/",
      "/la-misericordia-2/": "/it/qualcosa-e-cambiato/",
      "/tu-ci-hai-chiamati-eccoci-2/": "/it/qualcosa-e-cambiato/",
      "/lamicizia-incarnata-2/": "/it/eccomi-lesempio-di-maria/",
      "/joyeux-noel-3/": "/it/eccomi-lesempio-di-maria/",
      "/sempre-di-nuovo-ci-commuove-2/": "/it/eccomi-lesempio-di-maria/",
      "/dialogo-aperto-n-124-2/": "/it/eccomi-lesempio-di-maria/",
      "/la-bambina-che-andava-a-pile/": "/it/la-mia-forza-nella-mia-differenza/",
      "/la-bambina-che-andava-a-pile-recensione-2/": "/it/la-mia-forza-nella-mia-differenza/",
      "/dalle-provice-n-142/": "/it/la-mia-forza-nella-mia-differenza/",
      "/dalle-province-n-142-2/": "/it/la-mia-forza-nella-mia-differenza/",
      "/dalle-mamme-di-palidoro-perche-curare-non-significa-solo-guarire-2/": "/it/la-mia-forza-nella-mia-differenza/",
      "/limportante-e-che-sia-sano-2/": "/it/dimmi-chi-ammiri/",
      "/raccontami-il-mare-che-hai-dentro-vivere-con-un-figlio-autistico-recensione-2/": "/it/dimmi-chi-ammiri/",
      "/quello-che-non-ho-mai-detto-e-lisola-di-noi-recensione-di-due-libri-di-federico-de-rosa-2/": "/it/dimmi-chi-ammiri/",
      "/diaologo-aperto-n-140-2/": "/it/dimmi-chi-ammiri/",
      "/epigenetica-e-malattie-psichiatriche-2/": "/it/dimmi-chi-ammiri/",
      "/mi-chiamo-charlotte-fien-e-ho-la-sindrome-di-down-2/": "/it/dimmi-chi-ammiri/",
      "/non-smettete-di-crederci-mai-recensione-2/": "/it/dalle-province-n-123/",
      "/persone-prima-che-disabili-una-riflessione-sullhandicap-tra-giustizia-ed-etica-recensione-2/": "/it/dalle-province-n-123/",
      "/un-dio-inutile-recensione-2/": "/it/dalle-province-n-123/",
      "/cosa-fare-delle-nostre-ferite-recensione-2/": "/it/dalle-province-n-123/",
      "/creatures-disconforts-2/": "/it/dalle-province-n-123/",
      "/sia-fatta-la-tua-volonta-2/": "/it/ci-hanno-scritto-insieme-n-27/",
      "/di-nuovo-in-cammino-2/": "/it/ci-hanno-scritto-insieme-n-27/",
      "/fratelli-e-sorelle-di-persone-con-disabilita-3/": "/it/ci-hanno-scritto-insieme-n-27/",
      "/uno-due-tre-stella-2/": "/it/ci-hanno-scritto-insieme-n-27/",
      "/quel-che-la-convenzione-dice-e-non-dice/": "/it/intervista-giampiero-griffo/",
      "/una-storia-sacra-2/": "/it/le-mimose-di-yolanda/",
      "/speciale-natale-nel-mondo-2/": "/it/le-mimose-di-yolanda/",
      "/posso-devo-voglio-2/": "/it/la-nostra-scelta-di-cristina/",
      "/volevo-essere-una-farfalla-recensione-2/": "/it/la-nostra-scelta-di-cristina/",
      "/dalle-province-2/": "/it/la-nostra-scelta-di-cristina/",
      "/speleologi-del-mistero-del-piccolo-2/": "/it/la-nostra-scelta-di-cristina/",
      "/la-parola-alle-mamme-2/": "/it/la-nostra-scelta-di-cristina/",
      "/anoressia-fame-damore-e-2/": "/it/la-nostra-scelta-di-cristina/",
      "/i-tuoi-figli-2/": "/it/la-nostra-scelta-di-cristina/",
      "/si-chiama-sara-2/": "/it/la-nostra-scelta-di-cristina/",
      "/la-nostra-scelta/": "/it/la-nostra-scelta-di-cristina/",
      "/mio-figlio-luciano-2/": "/it/il-lato-b-di-essere-papa-di-un-figlio-disabile/",
      "/sara-e-le-sbiruline-di-emily-2/": "/it/bellezza-e-handicap/",
      "/il-vecchio-re-nel-suo-esilio/": "/it/bellezza-e-handicap/",
      "/dialogo-aperto-n-119-2/": "/it/bellezza-e-handicap/",
      "/come-essere-vicini-allaltro-2/": "/it/bellezza-e-handicap/",
      "/i-nonni-una-tenerezza-in-piu-2/": "/it/bellezza-e-handicap/",
      "/il-loro-sguardo-buca-le-nostre-ombre-recensione-2/": "/it/bellezza-e-handicap/",
      "/larca-di-trosly-2/": "/it/bellezza-e-handicap/",
      "/sindrome-di-costello-la-storia-di-sandrino-2/": "/it/bellezza-e-handicap/",
      "/affrontare-lenorme-paura-intervista-a-pietro-2/": "/it/bellezza-e-handicap/",
      "/cosa-sono-le-malattie-rare-2/": "/it/bellezza-e-handicap/",
      "/rarina-storia-di-un-fiore-raro-2/": "/it/bellezza-e-handicap/",
      "/dialogo-aperto-n-118-2/": "/it/bellezza-e-handicap/",
      "/carissime-mamme-2/": "/it/bellezza-e-handicap/",
      "/mani-calde-recensione-2/": "/it/bellezza-e-handicap/",
      "/fai-bei-sogni-recensione-2/": "/it/bellezza-e-handicap/",
      "/fede-e-luce-dalle-provincie-2/": "/it/bellezza-e-handicap/",
      "/fede-e-luce-una-fedelta-che-ridona-lentusiasmo-2/": "/it/bellezza-e-handicap/",
      "/jean-vanier-dalla-palestina-2/": "/it/bellezza-e-handicap/",
      "/mamma-sono-contento-di-essere-nato-2/": "/it/bellezza-e-handicap/",
      "/la-memoria-del-bello-2/": "/it/bellezza-e-handicap/",
      "/falsi-moralismi-sul-bello-di-essere-down-2/": "/it/bellezza-e-handicap/",
      "/cosa-rende-qualcuno-straordinario-intervista-a-nick-vujicic-2/": "/it/bellezza-e-handicap/",
      "/un-gatto-la-comunita-e-il-nostro-apartheid/": "/it/luca-adotta-alba/",
      "/una-sera-a-roma-allo-stadio-dei-marmi-per-lapertura-delle-special-olympics/": "/it/una-sera-a-roma-stadio-dei-marmi-special-olympics/",
      "/dialogo-aperto-n-116-2/": "/it/giovani-eroi/",
      "/vita-fede-e-luce-n-113-2/": "/it/giovani-eroi/",
      "/fede-e-luce-festeggia-i-suoi-40-anni-1971-2011/": "/it/giovani-eroi/",
      "/vita-fede-e-luce-la-festa-per-i-nostri-40-anni-1971-2011-2/": "/it/giovani-eroi/",
      "/fede-e-luce-e-subito-scatto-la-molla-2/": "/it/giovani-eroi/",
      "/10-buoni-motivi-per-fare-volontariato-2/": "/it/giovani-eroi/",
      "/doposcuola-al-campo-rom-2/": "/it/giovani-eroi/",
      "/lamicizia-asimmetrica-2/": "/it/giovani-eroi/",
      "/volontariato-una-leva-per-la-vita-2/": "/it/giovani-eroi/",
      "/oggi-sono-libero-2/": "/it/giovani-eroi/",
      "/un-sacco-di-felicita-2/": "/it/giovani-eroi/",
      "/ndangwini-casa-dove-esiste-una-famiglia-2/": "/it/giovani-eroi/",
      "/tra-individualismo-e-impegno-i-giovani-hanno-bisogno-di-concretezza-2/": "/it/giovani-eroi/",
      "/istantanea-2/": "/it/giovani-eroi/",
      "/nessun-profitto-recensione-2/": "/it/giovani-eroi/",
      "/il-linguaggio-segreto-dei-fiori-recensione-2/": "/it/giovani-eroi/",
      "/la-speranza-non-fa-rumore-recensione-2/": "/it/giovani-eroi/",
      "/per-sempre-recensione-2/": "/it/giovani-eroi/",
      "/in-corsia-2/": "/it/giovani-eroi/",
      "/vita-fede-e-luce-linizio-di-un-cammino-2/": "/it/giovani-eroi/",
      "/posso-vivere-lssenziale-che-non-e-fare-per-ma-vivere-con-le-persone-piu-fragili-2/": "/it/giovani-eroi/",
      "/farsi-carico-degli-ultimi-2/": "/it/giovani-eroi/",
      "/dialogo-aperto-n-115-2/": "/it/giovani-eroi/",
      "/quasi-non-li-riconoscevo-2/": "/it/giovani-eroi/",
      "/tempo-di-regali-2/": "/it/giovani-eroi/",
      "/vizi-e-virtu-del-vivere-recensione-2/": "/it/giovani-eroi/",
      "/storia-di-un-uomo-ritratto-di-carlo-maria-martini-recensione-2/": "/it/giovani-eroi/",
      "/avevano-spento-anche-la-luna-recensione-2/": "/it/giovani-eroi/",
      "/il-tempo-delle-donne-recensione-2/": "/it/giovani-eroi/",
      "/con-lidea-di-non-andare-2/": "/it/giovani-eroi/",
      "/tre-domande-ed-un-pellegrinaggio-2/": "/it/giovani-eroi/",
      "/messaggeri-di-gioia-2/": "/it/giovani-eroi/",
      "/nel-profondo-della-malattia-una-comunione-e-possibile-2/": "/it/giovani-eroi/",
      "/ci-chiedono-da-che-parte-stai-2/": "/it/giovani-eroi/",
      "/la-grande-casa-di-peter-pan-2/": "/it/giovani-eroi/",
      "/allora-hai-deciso-2/": "/it/insegnante-di-lettere-canale-della-vita/",
      "/il-carro-una-casa-famiglia-per-tutti-2/": "/it/insegnante-di-lettere-canale-della-vita/",
      "/relazioni-sincere-2/": "/it/insegnante-di-lettere-canale-della-vita/",
      "/posso-salutare-la-mamma-2/": "/it/insegnante-di-lettere-canale-della-vita/",
      "/purche-2/": "/it/insegnante-di-lettere-canale-della-vita/",
      "/come-e-nato-ombre-e-luci-2/": "/it/insegnante-di-lettere-canale-della-vita/",
      "/chi-ha-seminato-nelle-lacrime-miete-nella-gioia-2/": "/it/insegnante-di-lettere-canale-della-vita/",
      "/molto-lavoro-da-fare-2/": "/it/insegnante-di-lettere-canale-della-vita/",
      "/sicurezza-nel-cammino-2/": "/it/insegnante-di-lettere-canale-della-vita/",
      "/effetto-alfedena-2/": "/it/insegnante-di-lettere-canale-della-vita/",
      "/una-scelta-difficile/": "/it/dopo-la-scuola-dellobbligo-una-scelta-difficile/",
      "/circa-il-concetto-di-apertura-dei-centri-diurni-riabilitativi/": "/it/centri-diurni-coronavirus/",
      "/ci-provero-2/": "/it/vuoi-bene-a-gesu/",
      "/pregando-su-una-sedia-imponente-e-semplice-2/": "/it/vuoi-bene-a-gesu/",
      "/il-mosaico-tanti-sassolini-colorati-2/": "/it/vuoi-bene-a-gesu/",
      "/mariangela-linizio-a-santa-silvia-2/": "/it/vuoi-bene-a-gesu/",
      "/partecipe-dei-miracoli-2/": "/it/vuoi-bene-a-gesu/",
      "/mirtilli-2/": "/it/vuoi-bene-a-gesu/",
      "/small-talk-ma-extralarge-2/": "/it/vuoi-bene-a-gesu/",
      "/il-regalo-piu-bello-2/": "/it/vuoi-bene-a-gesu/",
      "/quel-gesto-2/": "/it/vuoi-bene-a-gesu/",
      "/quanta-forza-2/": "/it/vuoi-bene-a-gesu/",
      "/un-patrimonio-profuso-a-piene-mani-2/": "/it/vuoi-bene-a-gesu/",
      "/sollecitare-la-speranza-2/": "/it/vuoi-bene-a-gesu/",
      "/piero-e-il-bruco-farfalla-recensione-2/": "/it/giubileo-2016-la-vera-gioia/",
      "/dalle-provincie-n-134-2/": "/it/giubileo-2016-la-vera-gioia/",
      "/la-passione-della-pazienza-2/": "/it/giubileo-2016-la-vera-gioia/",
      "/un-laboratorio-creativo-a-pantigliate-2/": "/it/giubileo-2016-la-vera-gioia/",
      "/il-chicco-vivere-il-vangelo-in-azione-2/": "/it/giubileo-2016-la-vera-gioia/",
      "/papa-francesco-al-chicco-qui-mi-avete-toccato-il-cuore-2/": "/it/giubileo-2016-la-vera-gioia/",
      "/oltre-il-limite-2/": "/it/giubileo-2016-la-vera-gioia/",
      "/perche-di-katherine-e-nerissa-non-ci-sono-tracce/": "/it/the-crown-cugine-autismo/",
      "/dalle-province-n-140-2/": "/it/dopo-di-noi-i-diritti-che-ci-sono/",
      "/legge-sul-dopo-di-noi-issiamo-le-vele-2/": "/it/dopo-di-noi-i-diritti-che-ci-sono/",
      "/come-e-stato-possibile-tutto-questo-2/": "/it/doni-preziosi/",
      "/alza-lo-sguardo/": "/it/doni-preziosi/",
      "/per-me-e-felicita-2/": "/it/doni-preziosi/",
      "/mai-piu-soli-tre-testimonianze-2/": "/it/la-covazione-di-un-papa/",
      "/mamma-ti-posso-parlare-recensione/": "/it/rico-oscar-e-il-ladro-ombra-recensione/",
      "/chi-resta-deve-capire-recensione-2/": "/it/rico-oscar-e-il-ladro-ombra-recensione/",
      "/dedicato-ad-unamica-2/": "/it/a-te-bambino-mio/",
      "/questestate-faremo-2/": "/it/a-te-bambino-mio/",
      "/dialogo-aperto-n-136-2/": "/it/quattro-giorni-mano-nella-mano/",
      "/vedere-oltre-finestre-su-una-storia-recensione-2/": "/it/quattro-giorni-mano-nella-mano/",
      "/il-libro-di-charlotte-recensione-2/": "/it/quattro-giorni-mano-nella-mano/",
      "/genitori-recensione-film-2/": "/it/quattro-giorni-mano-nella-mano/",
      "/sono-graditi-visi-sorridenti-recensione-2/": "/it/borderline-recensione/",
      "/riscoprire-cio-che-unisce-i-cuori-di-tutti-2/": "/it/qualche-raggio-di-sole-in-siria/",
      "/un-affidamento-speciale-3/": "/it/qualche-raggio-di-sole-in-siria/",
      "/la-ragnatela-2/": "/it/qualche-raggio-di-sole-in-siria/",
      "/siblings-recensione-2/": "/it/qualche-raggio-di-sole-in-siria/",
      "/lo-zaino-di-emma-recensione-2/": "/it/qualche-raggio-di-sole-in-siria/",
      "/alla-fine-qualcosa-ci-inventeremo-che-ne-sara-di-mio-figlio-autistico-quando-non-saro-piu-al-suo-fianco-recensione-2/": "/it/qualche-raggio-di-sole-in-siria/",
      "/di-corsa-verso-francesco-2/": "/it/qualche-raggio-di-sole-in-siria/",
      "/famiglia-per-chi-famiglia-per-cosa-2/": "/it/qualche-raggio-di-sole-in-siria/",
      "/una-buona-scuola-damore-2/": "/it/qualche-raggio-di-sole-in-siria/",
      "/la-lampada-dei-desideri-2/": "/it/qualche-raggio-di-sole-in-siria/",
      "/pinocchio-teatro-integrato-ma-non-solo-2/": "/it/qualche-raggio-di-sole-in-siria/",
      "/luoghi-della-relazione-2/": "/it/qualche-raggio-di-sole-in-siria/",
      "/il-libro-di-cristopher-a-wonder-story-recensione-2/": "/it/qualche-raggio-di-sole-in-siria/",
      "/osservazioni-di-una-mamma-qualunque-recensione-2/": "/it/qualche-raggio-di-sole-in-siria/",
      "/viola-e-il-bullismo-2/": "/it/qualche-raggio-di-sole-in-siria/",
      "/fede-e-luce-in-armenia-e-in-iran/": "/it/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/un-ragazzo-ribelle-2/": "/it/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/ziguli-2/": "/it/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/liguana-non-vuole/": "/it/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/liguana-non-vuole-recensione-2/": "/it/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/cosa-ti-manca-per-essere-felice-recensione-2/": "/it/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/voci-dal-silenzio-recensione-2/": "/it/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/fede-e-luce-in-iraq-2/": "/it/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/un-coro-aperto-a-tutti-2/": "/it/il-dilemma-della-valutazione/",
      "/dalle-province-n-123-2/": "/it/il-dilemma-della-valutazione/",
      "/ho-imparato-2/": "/it/aprirsi-ad-altre-famiglie/",
      "/testimoni-dellincontro-2/": "/it/aprirsi-ad-altre-famiglie/",
      "/come-sei-cresciuto-2/": "/it/aprirsi-ad-altre-famiglie/",
      "/tra-lacquario-e-loceano-2/": "/it/voci-di-campo/",
      "/occasioni-per-stare-al-passo-2/": "/it/voci-di-campo/",
      "/aprirsi-ad-altre-famiglie-2/": "/it/voci-di-campo/",
      "/precious-recensione-film-2/": "/it/dialogo-aperto-n-113/",
      "/uildm-unione-italiana-lotta-alla-distrofia-muscolare-2/": "/it/dialogo-aperto-n-113/",
      "/vivere-con-la-distrofia-intervista-a-me-2/": "/it/dialogo-aperto-n-113/",
      "/costruirsi-un-totem-capire-e-sentire-il-proprio-valore-recensione-2/": "/it/e-la-luna-mi-guardo-recensione/",
      "/e-la-luna-mi-guardo-recensione-2/": "/it/vita-fede-e-luce-n-110/",
      "/scegliamo-con-cura-le-parole-2/": "/it/viola-e-mimosa-desaparecida/",
      "/il-mistero-di-tanto-bene-2/": "/it/angelo-un-compagno-di-viaggio/",
      "/raggi-di-sole-2/": "/it/angelo-un-compagno-di-viaggio/",
      "/eh-io-sono-qui-2/": "/it/angelo-un-compagno-di-viaggio/",
      "/90-anni-di-jean-2/": "/it/una-radice-e-delle-ali/",
      "/viola-e-mimosa-desaparecida-2/": "/it/una-radice-e-delle-ali/",
      "/con-il-tuo-passo-percorsi-agesci-2/": "/it/una-radice-e-delle-ali/",
      "/dalle-province-n-142-3/": "/it/dinamiche-fondamentali/",
      "/dinamiche-fondamentali-2/": "/it/i-miei-occhi-e-il-mio-cuore-hanno-vissuto-la-meraviglia/",
      "/quanta-carta-stampata/": "/it/ombre-e-luci-oggi-ha-ancora-senso/",
      "/la-forma-della-voce/": "/it/la-forma-della-voce-recensione/",
      "/io-figlio-di-mio-figlio/": "/it/io-figlio-di-mio-figlio-recensione/",
      "/la-sete-e-lacqua-della-speranza-una-riflessione-di-don-marco-bove/": "/it/la-sete-e-lacqua-della-speranza/",
      "/lettera-aperta-a-francesco-dassisi-2/": "/it/pellegrinaggio-assisi-1978-luis-sankale/",
      "/assisi-1978/": "/it/pellegrinaggio-assisi-1978-luis-sankale/",
      "/oltre-la-cronaca-vicini-al-quotidiano-2/": "/it/scarti-o-pietre-portanti/",
      "/i-miei-occhi-e-il-mio-cuore-hanno-vissuto-la-meraviglia-2/": "/it/scarti-o-pietre-portanti/",
      "/quanti-conosci-per-nome-2/": "/it/cosa-so-dei-social-e-cosa-ne-penso/",
      "/la-comunita-che-accoglie-di-rifiutati-recensione/": "/it/la-comunita-che-accoglie-i-rifiutati-recensione/",
      "/curare-lautismo-a-casa-unopera-damore/": "/it/curare-lautismo-a-casa-un-opera-damore/",
      "/lo-straordinario-viaggio-di-nujeen-recensione-2/": "/it/dialogo-aperto-n-138/",
      "/corridoi-umanitari-2/": "/it/dialogo-aperto-n-138/",
      "/dettagli-inutili-recensione-2/": "/it/dialogo-aperto-n-138/",
      "/dalle-province-n-125-2/": "/it/agli-antipodi-dellindividualismo/",
      "/fede-e-luce-in-terra-santa-2/": "/it/agli-antipodi-dellindividualismo/",
      "/disabili-e-trapianti/": "/it/sempre-damigella-mai-sposa/",
      "/agli-antipodi-dellindividualismo-2/": "/it/un-gioco-da-fare-quando-fuori-piove/",
      "/editoriale-italiana-2000-pp-670/": "/it/itinerari-guida-annuario-accoglienza-cattolica-italia-2000-recensione/",
      "/ci-hanno-scritto-una-critica-allultimo-numero-di-insieme-2/": "/it/letture-consigliate-il-piccolo-principe/",
      "/per-la-nostra-riflessione-prendete-e-mangiatene-tutti-2/": "/it/letture-consigliate-il-piccolo-principe/",
      "/leducazione-dei-bambini-cosiddetti-lievi-si-ma-quale-2/": "/it/letture-consigliate-il-piccolo-principe/",
      "/viviamo-una-vita-normale-2/": "/it/letture-consigliate-il-piccolo-principe/",
      "/non-e-cosi-facile-essere-madre-di-una-bambina-non-grave-2/": "/it/letture-consigliate-il-piccolo-principe/",
      "/si-e-allontanato-per-la-prima-volta-2/": "/it/letture-consigliate-il-piccolo-principe/",
      "/ora-ha-un-mondo-suo-oltre-la-sua-famiglia-2/": "/it/letture-consigliate-il-piccolo-principe/",
      "/in-vacanza-tutto-come-se-si-trattasse-di-un-gioco-2/": "/it/letture-consigliate-il-piccolo-principe/",
      "/adesso-fa-la-quarta-sta-ancora-con-noi-2/": "/it/letture-consigliate-il-piccolo-principe/",
      "/fu-in-tenda-che-mi-diede-il-benvenuto-2/": "/it/letture-consigliate-il-piccolo-principe/",
      "/come-mettere-in-quattro-righe-oltre-10-anni-di-vita-2/": "/it/letture-consigliate-il-piccolo-principe/",
      "/ci-hanno-scritto-n-21-2/": "/it/letture-consigliate-il-piccolo-principe/",
      "/apriamo-il-sipario-oggi-si-recita-2/": "/it/letture-consigliate-il-piccolo-principe/",
      "/il-ruolo-del-pediatra-nel-trattamento-del-bambino-handicappato-2/": "/it/letture-consigliate-il-piccolo-principe/",
      "/notiziario-fede-e-luce-n-21-2/": "/it/letture-consigliate-il-piccolo-principe/",
      "/beati-i-poveri-suggerimenti-per-le-tra-giornate-ad-assisi-1978-2/": "/it/il-cantico-delle-creature/",
      "/ciao-gianluca-2/": "/it/il-cantico-delle-creature/",
      "/tre-giorni-ad-assisi-2/": "/it/il-cantico-delle-creature/",
      "/qualche-informazione-prima-di-partire-per-il-pellegrinaggio-di-assisi-2/": "/it/il-cantico-delle-creature/",
      "/pappagalli-verdi-cronache-di-un-chirurgo-di-guerra/": "/it/pappagalli-verdi-cronache-di-un-chirurgo-di-guerra-recensione/",
      "/viola-e-mimosa-n-140-2/": "/it/caro-raffa-la-vita-e-adesso/",
      "/anna-che-sorride-alla-pioggia-recensione-2/": "/it/caro-raffa-la-vita-e-adesso/",
      "/niccolo-tra-coloro-che-hanno-fatto-la-storia/": "/it/ol-incontra-jorit/",
      "/come-doro/": "/it/come-loro/",
      "/biografilm/": "/it/biografilm-festival-2020/",
      "/squizo/": "/it/sqizo/",
      "/qualcosa-e-cambiato-2/": "/it/i-geni-del-futuro-crispr-cas9/",
      "/visto-al-cineforum-di-fede-e-luce-2/": "/it/i-geni-del-futuro-crispr-cas9/",
      "/ho-amici-in-paradiso-recensione-2/": "/it/i-geni-del-futuro-crispr-cas9/",
      "/dialogo-aperto-n-137-2/": "/it/i-geni-del-futuro-crispr-cas9/",
      "/dalle-province-n-137-2/": "/it/i-geni-del-passato-handiche/",
      "/una-veglia-laboratorio-per-il-giovedi-santo-2/": "/it/i-geni-del-passato-handiche/",
      "/viola-e-mimosa-n-137-2/": "/it/labilita-onlus-aprire-gli-occhi/",
      "/seveso-1976-oltre-la-diossina-2/": "/it/labilita-onlus-aprire-gli-occhi/",
      "/leutanasia-di-dio-recensione-2/": "/it/attesi-amati-trasformati/",
      "/i-geni-del-futuro-crispr-cas9-2/": "/it/abitare-nellordinarieta/",
      "/viaggio-a-parma-del-1976-unesperienza-di-gioia-condivisione-e-scoperta-con-fede-e-luce-2/": "/it/notiziario-di-fede-e-luce-n-10-1976/",
      "/un-angolino-di-arche-2/": "/it/notiziario-di-fede-e-luce-n-10-1976/",
      "/storia-dellaborto-i-molti-protagonisti-e-interessi-di-una-lunga-vicenda/": "/it/storia-dellaborto-i-molti-protagonisti-e-interessi-di-una-lunga-vicenda-recensione/",
      "/per-voi-e-per-tutti-consigli-pratici-perche-ne/": "/it/per-voi-e-per-tutti-consigli-pratici-perche-nessuno-venga-rifiutato/",
      "/il-male-ela-sofferenza-raccontati-ai-bambini/": "/it/il-male-e-la-sofferenza-raccontati-ai-bambini-recensione/",
      "/tu-sei-amato-da-dio-cosi-come-sei-2/": "/it/anffas-ogni-persona-con-disabiltia-e-nostro-figlio/",
      "/viola-e-mimosa-a-manila-2/": "/it/anffas-ogni-persona-con-disabiltia-e-nostro-figlio/",
      "/alfedena-per-immagini/": "/it/alfedena/",
      "/lettera-a-jean-matteo-mazzarotto/": "/it/lettere-a-jean-matteo-mazzarotto/",
      "/coltivare-i-propri-pensieri/": "/it/dialogo-aperto-n-112/",
      "/per-una-vera-qualita-di-cura/": "/it/dialogo-aperto-n-112/",
      "/il-mio-curriculum/": "/it/benedetta-il-mio-curriculum/",
      "/liberi-di-vivere-come-tutti/": "/it/liberi-di-vivere-come-tutti-prima-conferenza-nazionale-delle-politiche-sull-handicap/",
      "/i-nostri-grandi-amici-maria-teresa/": "/it/maria-teresa-di-calcutta-dedicato-ai-bambini/",
      "/viola-e-mimosa-n-138/": "/it/guidati-da-gio/",
      "/dedicato-ai-bambini-francesco/": "/it/dedicato-ai-bambini-francesco-gammarelli/",
      "/io-sono-una-donna/": "/it/io-sono-una-donna-perche-mi-chiami-andicappata/",
      "/io-sono-una-donna-perche-mi-chiamai-andicappata/": "/it/io-sono-una-donna-perche-mi-chiami-andicappata/",
      "/il-progetto-girotondo-2/": "/it/cervelli-ribelli-connettiamoci-neurodiversita/",
      "/da-fratello-e-da-padre-2/": "/it/cervelli-ribelli-connettiamoci-neurodiversita/",
      "/cervelli-ribelli/": "/it/cervelli-ribelli-connettiamoci-neurodiversita/",
      "/pellegrinaggio-assisi-1978-secondo-luis-sankale/": "/it/vita-fede-e-luce-natale-1977-a/",
      "/leducazione-delle-persone-disabili-imparare-a-mangiare-insieme-e-in-autonomia-2/": "/it/vita-fede-e-luce-natale-1977-a/",
      "/la-comunita-di-capodarco-2/": "/it/vita-fede-e-luce-natale-1977-a/",
      "/tempo-di-imparare/": "/it/tempo-di-imparare-valeria-parrella-recensione-libro/",
      "/blog-di-benedetta/": "/it/tanto-io-non-la-perdo/",
      "/il-dilemma-della-valutazione-2/": "/it/la-mia-disavventura/",
      "/costretta-a-legarmi-i-capelli-e-la-regola/": "/it/ho-imparato-da-sola-a-divertirmi/",
      "/messaggio-del-santo-padre-in-occasione-della-giornata-mondiale-delle-persone-con-disabilita/": "/it/papa-francesco-disabilita-messaggio/",
      "/base-per-articolo-benedetta-19-dicembre-2019/": "/it/non-mi-piace-cucinare/",
      "/unica-del-suo-genere/": "/it/unica-nel-suo-genere/",
      "/i-ciechi-non-sognano-il-buio-vivere-con-successo-la-cecita/": "/it/i-ciechi-non-sognano-il-buio-vivere-con-successo-la-cecita-recensione/",
      "/la-mia-disavventura-2/": "/it/la-mia-vita-a-santa-palomba/",
      "/i-saggi-sulloperazione-t4/": "/it/zavorre-prescelti/",
      "/dopo-di-me-il-diluvio/": "/it/dopo-di-me-il-diluvio-commedia-musicale-gruppo-fede-luce-san-paolo/",
      "/un-libro-interessante-chi-sarei-se-potessi-essere/": "/it/un-libro-interessante-adolescenza-ragazzi-disabili-chi-sarei-se-potessi-esserebozza-automatica/",
      "/un-libro-interessante-chi-sarei-se-potessi-esserebozza-automatica/": "/it/un-libro-interessante-adolescenza-ragazzi-disabili-chi-sarei-se-potessi-esserebozza-automatica/",
      "/se-la-teologia-non-sa-parlare-di-dio-comprendendo-la-disabilita-e-la-teologia-a-essere-disabile/": "/it/teologia-disabile/",
      "/newsletter-n-10/": "/it/newsletter-n-10-sulla-regia-non-credente-di-lourdes/",
      "/papa-san-pietro/": "/it/sulla-barca-in-piazza-san-pietro/",
      "/da-vicino-nessuno-e-disabile/": "/it/festival-diritti-umani/",
      "/la-sfida-di-rileggere-le-scene-del-cinema/": "/it/sensuability/",
      "/se-le-immagini-parlano-piu-delle-parole-newsletter-n-15/": "/it/newsletter-15/",
      "/cervelli-ribelli-connettiamoci-alla-neurodiversita/": "/it/dalle-province-n-141/",
      "/perche-tutti-comprendano-2/": "/it/dalle-province-n-141/",
      "/tracciare-il-sentiero-in-albania-2/": "/it/dalle-province-n-141/",
      "/spazio-aperto-una-coopera/": "/it/spazio-aperto-una-cooperativa-di-servizi/",
      "/monaci-di-lanuvio/": "/it/monaci-di-lanuvio-finanziamento-banca-etica/",
      "/parliamo-di-comunicazione-facilitata/": "/it/parliamo-di-comunicazione-facilitata-intervista-francesca-benassi/",
      "/la-lezione-di-un-clown/": "/it/la-lezione-di-un-clown-miloud-oukili/",
      "/tra-lame-che-affondano-e-ferite-medicate/": "/it/eredita-dei-vivi-recensione/",
      "/insieme/": "/it/insieme-primo-articolo/",
      "/lettera-di-daucourt-alle-comunita-dellarca/": "/it/nonostante-jean-vanier-larca-rimane/",
      "/i-panzerotti-di-caterina/": "/it/lo-scatto-della-pantera/",
      "/gli-amici-dei-bimbi/": "/it/gli-amici-dei-bimbi-reparto-gesu-bambino-istituto-santeusebio-vercelli/",
      "/la-luce-simbolo-del-pellegrinaggio-di-roma-1975-2/": "/it/per-te-ho-visitato-roma/",
      "/perche-proprio-a-roma-il-pellegrinaggio-del-1975-2/": "/it/per-te-ho-visitato-roma/",
      "/la-bimba-delle-lumache/": "/it/la-bimba-delle-lumache-recensione-libro/",
      "/nessuno-bambino-nasce-cattivo/": "/it/nessuno-bambino-nasce-cattivo-recensione-libro/",
      "/noi-quattro/": "/it/noi-quattro-la-comunita-il-roveto/",
      "/il-roveto/": "/it/comunita-il-roveto/",
      "/dallassistenza-allesistenza-sei-workshop-dellassociazione-vedere-oltre-onlus-2/": "/it/valgo-anchio/",
      "/fede-e-luce-una-scuola-di-altruismo-2/": "/it/valgo-anchio/",
      "/a-43/": "/it/a-4300-metri-di-altitudine-newsletter-n-31/",
      "/dove-crescono-i-cocomeri-di-cindy-baldwin-recensione/": "/it/dove-crescono-i-cocomeri-recensione/",
      "/marie-la-strabica-di-georges-simenon-recensione/": "/it/marie-la-strabica-recensione/",
      "/viaggio-italia-around-the-world/": "/it/viaggio-italia-recensione/",
      "/grazi/": "/it/grazie-papa-don-carlo-recensione/",
      "/dobbiamo-esser-prudenti-non-congelati/": "/it/ol-incontra-luigi-derrico/",
      "/una-mattina-ti-ho-osservato-mentre-ti-svegliavi/": "/it/ricordo-daniele-corrias/",
      "/la-piccola-artista-di-chartres/": "/it/recensione-i-disegni-segreti/",
      "/dopo-di-noi-i-diritti-che-ci-sono-2/": "/it/mamma-in-comunita/",
      "/lonore-di-un-lord-2/": "/it/mamma-in-comunita/",
      "/la-nuova-legge-sul-dopo-di-noi-nodi-da-sciogliere-2/": "/it/insolito-ragionamento-sul-migrante/",
      "/onora-il-padree-e-la-madre-pagine-di-tutti-i-tempi-per-capire-il-rapporto-tra-genitori-e-figli-recensione-libro/": "/it/onora-il-padre-e-la-madre-pagine-di-tutti-i-tempi-per-capire-il-rapporto-tra-genitori-e-figli-recensione-libro/",
      "/la-necessita-di-un-contesto-per-capire/": "/it/la-bellezza-nella-mente-recensione/",
      "/le-comunita-di-fede-e-luce-nellest-europeo/": "/it/comunita-fede-e-luce-nel-mondo-tante-piccole-fiaccole-di-unita-e-di-amore/",
      "/lecumenismo-in-fede-e-luce/": "/it/lecumenismo-in-fede-e-luce-un-dono/",
      "/perche-porto-i-miei-figli-a-fede-e-luce/": "/it/quando-porto-i-miei-figli-a-fede-e-luce-resto-incantata/",
      "/mi-trovo-bene-con-tuttmi-trovo-bene-con-tuttii/": "/it/mi-trovo-bene-con-tutti/",
      "/sessualita-e-disabilita-il-meglio-e-il-peggio-parlano-gli-educatori/": "/it/sessualita-e-disabilita-il-meglio-e-il-peggio/",
      "/amore-e-disabilita-facile-preda-dei-genitori/": "/it/amore-disabilita-facile-preda/",
      "/v-conferenza-internazionale-sullautismo-1983/": "/it/5-conferenza-internazionale-sullautismo-1983/",
      "/marahba-kiffak-ciao-come-stai/": "/it/marahba-kiffak-ciao-come-stai-fede-luce-beirut/",
      "/dallosservatorio-scolastico-deir-ai-as-di-milano/": "/it/scuola-e-disabilita-dallosservatorio-scolastico-deir-ai-as-di-milano/",
      "/ieri-oggi-domani-2/": "/it/dossier-scuola-e-disabilita/",
      "/dossier-scola-e-disabilita/": "/it/dossier-scuola-e-disabilita/",
      "/fede-e-luce-tutti-a-leeds-2/": "/it/dossier-scuola-e-disabilita/",
      "/che-fanfara-2/": "/it/dossier-scuola-e-disabilita/",
      "/7-idee-sulla-sindrome-di-down-2/": "/it/dossier-scuola-e-disabilita/",
      "/dalle-provice-n-141/": "/it/dialogo-aperto-n-141/",
      "/migrati-diverse-fragilita-si-incontrano-2/": "/it/i-figli-sono-tutti-speciali/",
      "/la-nuova-legge-sul-dopo-di-noi-che-cosa-dice-2/": "/it/i-figli-sono-tutti-speciali/",
      "/insolito-ragionamento-sul-migrante-2/": "/it/costruiamo-laccoglienza/",
      "/voglia-di-comunicare-2/": "/it/dialogo-aperto-n-142/",
      "/la-mia-forza-nella-mia-differenza-2/": "/it/percorsi-inclusivi-noi-ci-teniamo/",
      "/due-capitane-2/": "/it/percorsi-inclusivi-noi-ci-teniamo/",
      "/dal-convegno-allimpegno-2/": "/it/percorsi-inclusivi-noi-ci-teniamo/",
      "/dialogo-aperto-n-142-2/": "/it/la-comunicazione-multimodale/",
      "/gioco-test/": "/it/giochi-2022/",
      "/insieme-a-tutti-gli-altri-anche-mia-figlia-ha-ricevuto-la-cresima/": "/it/mia-figlia-adea-cresima/",
      "/lotta-per-linclusione/": "/it/lotta-per-linclusione-recensione/",
      "/la-nostra-scelta-di-cristina-2/": "/it/mai-piu-soli/",
      "/superata-lultima-sala-daspetto-2/": "/it/mai-piu-soli/",
      "/aggiungi-un-posto-a-casa-adozione-di-bambini-con-disabilita-2/": "/it/mai-piu-soli/",
      "/un-vescovo-per-amico-2/": "/it/mai-piu-soli/",
      "/dialogo-aperto-n-120-2/": "/it/mai-piu-soli/",
      "/cinema-la-disabilita-al-torino-film-festival-e-al-babel-film-festival-di-cagliari/": "/it/cinema-disabilita-torino-film-festival-babel-film-festival-di-cagliari/",
      "/sara-e-le-sbiruline-di-emily/": "/it/sara-e-le-sbiruline-di-emily-recensione/",
      "/il-vecchio-re-nel-suo-esilio-recensione-2/": "/it/franz-werfel-gallucci-editore-pp-722/",
      "/sara-e-le-sbiruline-di-emily-recensione-2/": "/it/odoardo-focherini-un-giusto-fra-le-nazioni-recensione/",
      "/rico-oscar-e-il-ladro-ombra-recensione-2/": "/it/la-caduta-i-ricordi-di-un-padre-in-424-passi-recensione/",
      "/io-mi-domando-2/": "/it/gli-altri-vostri-figli-lhanno-accettato/",
      "/ci-hanno-scritto-insieme-n-23-2/": "/it/gli-altri-vostri-figli-lhanno-accettato/",
      "/25-numero-6-anno-2/": "/it/gli-altri-vostri-figli-lhanno-accettato/",
      "/mio-figlio-emanuele-la-straordinaria-esperienza-di-una-madre-recensione-2/": "/it/un-figlio-handicappato/",
      "/notiziario-fede-e-luce-n-12-marzo-1977-2/": "/it/un-figlio-handicappato/",
      "/come-nata-la-prima-casetta-fede-e-luce-storie-di-pennelli-e-appendiciti-2/": "/it/un-figlio-handicappato/",
      "/visitiamo-con-maria-laura-il-centro-belga-per-infermi-motori-mentali-c-b-i-m-c/": "/it/un-figlio-handicappato/",
      "/inlusione-solidarieta-ordinaria/": "/it/inclusione-solidarieta-ordinaria/",
      "/abbiamo-un-cuore-inclusivo-2/": "/it/inclusione-solidarieta-ordinaria/",
      "/i-geni-del-passato-handiche-2/": "/it/inclusione-solidarieta-ordinaria/",
      "/per-il-rispetto-della-persona-sempre-2/": "/it/tra-incontri-nel-riconoscimento-dellaltro-puoi-ritrovare-fiducia/",
      "/la-cura-dellamore/": "/it/la-cura-dellamore-recensione/",
      "/legoismo-e-finito-recensione-2/": "/it/chiudi-gli-occhi-e-guardami-vivere-la-disabilita-in-famiglia-recensione/",
      "/voci-di-campo-2/": "/it/con-loro-ci-sto-bene/",
      "/bozza/": "/it/cani-pony-leoni-marini/",
      "/giubileo-2016-per-cominciare-una-nuova-storia-di-amore-2/": "/it/tutti-a-bordo/",
      "/il-vangelo-mimato-per-costruire-ponti-2/": "/it/tutti-a-bordo/",
      "/invitati-alla-festa/": "/it/associazione-invitati-alla-festa/",
      "/un-dado-vegetale-da-sogno-e-fatto-in-casa-2/": "/it/essere-padre-di-un-figlio-disabile/",
      "/il-libro-di-julian-a-wonder-story-recensione-2/": "/it/un-ponte-in-un-guscio-di-noce/",
      "/zia-lo-sai-che-sei-un-po-strana-recensione-2/": "/it/un-ponte-in-un-guscio-di-noce/",
      "/il-bambino-che-parlava-con-la-luce-recensione-2/": "/it/un-ponte-in-un-guscio-di-noce/",
      "/riuniti-in-preghiera-2/": "/it/un-ponte-in-un-guscio-di-noce/",
      "/il-canto-di-bernadette-recensione/": "/it/pensioni-rubate/",
      "/famiglie-in-esilio-ferite-ritrovate-riconciliate-recensione-2/": "/it/pensioni-rubate/",
      "/due-grandi-occhi-neri-2/": "/it/julia-jean-e-la-tirannia-della-normalita/",
      "/la-mia-vita-a-santa-palomba-2/": "/it/si-ricomincia/",
      "/katimavik-una-parola-escquimese-che-vuol-dire-incontro/": "/it/katimavik-una-parola-eschimese-che-vuol-dire-incontro/",
      "/ziguli/": "/it/ziguli-recensione/",
      "/ci-hanno-scritto-insieme-n-27-2/": "/it/marina-di-camerota-venti-giorni-di-prime-volte/",
      "/fratelli-e-sorelle-di-persone-con-disabilita-una-realta-da-riscoprire-2/": "/it/marina-di-camerota-venti-giorni-di-prime-volte/",
      "/lavventura-di-oletta-quando-il-cavallo-diventa-terapia-2/": "/it/marina-di-camerota-venti-giorni-di-prime-volte/",
      "/dossier-vite-da-ri-accogliere-adolescenti-allo-sbaraglio/": "/it/adolescenti-allo-sbaraglio/",
      "/alto-come-un-vaso-di-gerani-recensione-2/": "/it/respiro-dopo-respiro-lo-yoga-per-bambini-e-adolescenti-con-bisogni-speciali/",
      "/parole-in-liberta-diario-semiserio-della-madre-di-un-disabile-recensione-2/": "/it/respiro-dopo-respiro-lo-yoga-per-bambini-e-adolescenti-con-bisogni-speciali/",
      "/un-castello-di-sabbia-storia-della-mia-vita-e-della-mia-schizofrenia-recensione-2/": "/it/respiro-dopo-respiro-lo-yoga-per-bambini-e-adolescenti-con-bisogni-speciali/",
      "/dallo-stadio-al-palazzetto/": "/it/anche-io-tiro-i-rigori/",
      "/dialogo-aperto-n-125-2/": "/it/viola-e-valeria/",
      "/un-gioco-da-fare-quando-fuori-piove-2/": "/it/viola-e-valeria/",
      "/hotel-6-stelle-2/": "/it/viola-e-valeria/",
      "/germogli-diversi-arte-floreale-e-disabilita-la-bellezza-di-un-percorso-possibile-2/": "/it/viola-e-valeria/",
      "/chopin-diversamente-impresa-2/": "/it/viola-e-valeria/",
      "/artiste-nellorto-2/": "/it/viola-e-valeria/",
      "/julia-jean-e-la-tirannia-della-normalita-2/": "/it/lettere-a-jean-don-marco-bove-2/",
      "/auguri-scomodi-per-il-nuovo-anno-2/": "/it/lettere-a-jean-don-marco-bove-2/",
      "/sotto-lo-stesso-tetto-casa-famiglia-il-tetto/": "/it/casa-famiglia-il-tetto/",
      "/pulce-non-ce-recensione-2/": "/it/quali-mani-asciugheranno-le-mie-lacrime-recensione/",
      "/elogio-della-fragilita/": "/it/elogio-della-fragilita-recensione/",
      "/chiudi-gli-occhi-e-guardami-vivere-la-disabilita-in-famiglia-recensione-2/": "/it/dalle-province-n-122/",
      "/casa-famiglia-iniziativa-amica-bambini-che-vanno-bambini-che-vengono/": "/it/iniziativa-amica-una-casa-famiglia-dove-la-maternita-ritorna-gioia/",
      "/connessi-per-davvero-2/": "/it/dialogo-aperto-n-139/",
      "/hello-harry-hi-benny-recensione-2/": "/it/dialogo-aperto-n-139/",
      "/il-signor-parroco-ha-dato-di-matto-2/": "/it/dialogo-aperto-n-139/",
      "/dopo-di-noi-atti-del-convegno-anffas-2/": "/it/dialogo-aperto-n-139/",
      "/un-crocifisso-silenzioso-immagine-della-rivoluzione-cristiana/": "/it/essere-mamma/",
      "/dialogo-aperto-n-84/": "/it/dialogo-aperto-n-85/",
      "/oscura-luminosissima-notte/": "/it/oscura-luminosissima-notte-recensione/",
      "/bisogna-accettare-che-un-bambino-abbia-delle-resistenze-2/": "/it/io-e-simona/",
      "/quattro-giorni-mano-nella-mano-2/": "/it/io-e-simona/",
      "/don-gnocchi-una-vita-spesa-per-gli-altri-recensione-2/": "/it/dalle-province-n-138/",
      "/gli-scartagonisti-recensione-2/": "/it/dalle-province-n-138/",
      "/lamniocentesi-di-stato-e-la-grande-colpa-di-madri-selvagge-recensione/": "/it/lamniocentesi-di-stato-e-la-grande-colpa-di-noi-madri-selvagge-recensione/",
      "/ce-labbiamo-fatta-2/": "/it/ciclisti-non-vedenti-vaticano/",
      "/da-bologna-a-roma-in-tandem-un-ciclo-viaggio-oltre-la-disabilita/": "/it/da-bologna-a-roma-in-tandem/",
      "/da-bologna-a-roma-in-tandem-un-ciclo-viaggio/": "/it/da-bologna-a-roma-in-tandem/",
      "/safesurfing-navigare-nella-rete-in-sicurezza-2/": "/it/il-plusabile-due-sorelle-speciali/",
      "/dalle-province-n-139-2/": "/it/il-plusabile-due-sorelle-speciali/",
      "/viola-e-mimosa-n-139-2/": "/it/il-plusabile-due-sorelle-speciali/",
      "/segni-efficaci-2/": "/it/il-plusabile-due-sorelle-speciali/",
      "/la-sua-prima-confessione-2/": "/it/il-plusabile-due-sorelle-speciali/",
      "/benedetta-mi-convertito/": "/it/benedetta-mi-ha-convertito/",
      "/noi-dei-piani-di-sopra/": "/it/storia-redazione-via-bessarione-gammarelli/",
      "/coltivare-propri-pensieri/": "/it/coltivare-propri-desideri/",
      "/per-una-vera-qualita-di-cura-delle-persone-anziane-2/": "/it/coltivare-propri-desideri/",
      "/il-coraggio-della-piccola-vanessa-2/": "/it/lui-la-guida-degli-uomini-e-rimasto-indietro-per-me/",
      "/perche-esista-e-dio-il-responsabile-del-mio-handicap/": "/it/perche-esiste-la-disabilita-e-dio-il-responsabile-del-mio-handicap/",
      "/ci-hanno-scritto-n-15-2/": "/it/come-bere-un-bicchier-dacqua/",
      "/pensioni-rubate-2/": "/it/quasi-amici-recensione/",
      "/berlinale-74-leone-doro/": "/it/berlinale-74-orso-doro/",
      "/lintimita-del-corpo-vita-tra-fratelli/": "/it/vita-tra-fratelli/",
      "/riscoprire-la-grazia-della-confessione-2/": "/it/dicono-di-loro/",
      "/lo-sapevate-che/": "/it/lo-sapevate-che-2/",
      "/dossier-scola-e-disabilita-2/": "/it/dialogo-aperto-n-123/",
      "/otto-giorni-per-ventanni/": "/it/arche-bologna-tandem/",
      "/dossier-vite-da-ri-accogliere-la-citta-dei-ragazzi-cittadini-del-mondo/": "/it/la-citta-dei-ragazzi/",
      "/dossier-vite-da-ri-accogliere-la-citta-dei-ragazzi/": "/it/la-citta-dei-ragazzi/",
      "/vite-da-ri-accogliere-la-citta-dei-ragazzi/": "/it/la-citta-dei-ragazzi/",
      "/essere-padre-di-un-figlio-disabile-2/": "/it/custodi-della-speranza/",
      "/obiettivo-decrescita-recensione/": "/it/ii-barattolo-di-maionese-e-caffe/",
      "/il-mo-cane-mi-ha-scelto/": "/it/il-mio-cane-mi-ha-scelto/",
      "/caro-raffa-la-vita-e-adesso-2/": "/it/fare-nuove-tutte-le-cose/",
      "/una-redazione-in-condominio/": "/it/noi-dei-piani-di-sopra/",
      "/le-chiavi-di-casa-recensione/": "/it/le-chiavi-di-casa-film/",
      "/dal-sostegno-alla-partecipazione-esperienze-di-educazione-inclusiva-per-bambini-con-difficolta-2/": "/it/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
      "/la-dove-tu-ci-vuoi-ogni-giorno-2/": "/it/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
      "/ci-hanno-scritto-insieme-n-28-2/": "/it/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
      "/il-loro-credo-2/": "/it/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
      "/i-nostri-figli-con-disabilita-a-scuola-2/": "/it/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
      "/sotto-cieli-noncuranti-recensione-2/": "/it/sembrava-impossibile-dove-osano-le-aquile-in-carrozzina-recensione/",
      "/la-scelta-di-ivana/": "/it/la-scelta-di-ivana-la-mia-vita-al-carro/",
      "/ulamministratore-di-sostegno-per-le-persone-con-disabilita/": "/it/una-nuova-legge-lamministratore-di-sostegno-per-le-persone-con-disabilita/",
      "/presentazione-festival/": "/it/san-sebastian-il-piu-piccolo-dei-grandi-festival/",
      "/dialogo-aperto-n-138-2/": "/it/sara-bello/",
      "/pretese-fuori-mercato-2/": "/it/dialogo-aperto-n-161/",
      "/dalla-festa-del-cinema-di-roma/": "/it/festa-del-cinema-roma-2023/",
      "/la-casa-di-dario/": "/it/la-casa-di-dario-comunita-alloggio/",
      "/sara-bello-2/": "/it/dossier-rifugiati/",
      "/il-mondo-come-lo-vediamo-noi/": "/it/recensione-as-we-see-it/",
      "/fede-e-luce-larca-ombre-e-luci-tre-vocazioni-ununica-ispirazione/": "/it/fede-e-luce-larca-ombre-e-luci/",
      "/a-a-a-una-mamma-chiede-una-mamma-risponde/": "/it/sulleducazione-delle-giovani-generazioni-una-mamma-chiede-una-mamma-risponde/",
      "/fare-nuove-tutte-le-cose-2/": "/it/le-amiche-di-francesco/",
      "/io-non-voglio-estranei-in-casa-2/": "/it/per-rompere-la-solitudine-2/",
      "/presena-reale/": "/it/presenza-reale/",
      "/storia-di-un-segreto-dio-mi-ha-parlato-tramite-i-miei-amici-speciali-2/": "/it/1971-2011-fede-e-luce-festeggia-40-anni/",
      "/special-olimpics/": "/it/special-olympics-nessuno-si-deve-sentire-escluso/",
      "/special-olimpics-nessuno-si-deve-sentire-escluso/": "/it/special-olympics-nessuno-si-deve-sentire-escluso/",
      "/un-incontro-tra-capi/": "/it/un-incontro-tra-capi-scout/",
      "/portatrice-di-un-messaggio-2/": "/it/grazie-mariangela/",
      "/borderline-recensione-2/": "/it/grazie-mariangela/",
      "/viola-e-il-messico-2/": "/it/grazie-mariangela/",
      "/lettera-di-jean-n-126-2/": "/it/grazie-mariangela/",
      "/attivita-riabilitative-fiori-colori-e-profumi-2/": "/it/grazie-mariangela/",
      "/volevo-che-qualcuno-rispondesse-alle-mie-domande-2/": "/it/grazie-mariangela/",
      "/smack-come-bacio-il-mio-tempo-con-mio-figlio-disabile/": "/it/smack-come-bacio-il-tempo-con-mio-figlio-disabile/",
      "/noi-papa-di-fiun-modo-diverso-di-amare/": "/it/noi-papa-di-figli-disabili-un-modo-diverso-di-amare/",
      "/gli-oggetti-raccontano-storie-straordinarie-di-oggetti-comuni/": "/it/gli-oggetti-raccontano-storie-straordinarie-di-oggetti-comuni-recensione/",
      "/un-affidamento-speciale-2__trashed/": "/it/un-affidamento-speciale-2/",
      "/insegnante-di-lettere-canale-della-vita-2/": "/it/il-sorriso-dei-tuoi-occhi/",
      "/il-sorriso-dei-tuoi-occhi-2/": "/it/da-un-altro-punto-di-vista/",
      "/tra-incontri-nel-riconoscimento-dellaltro-puoi-ritrovare-fiducia-2/": "/it/la-nostra-presenza-accanto-a-lei/",
      "/con-la-forza-di-una-quercia/": "/it/agli-amici-vici-siate-disponibili/",
      "/fratelli-e-sorelle-di-persone-con-disabilita-2/": "/it/nella-diagnosi-siamo-prudenti/",
      "/la-cura-invisibile-per-il-riconoscimento-dei-caregiver-2/": "/it/nella-diagnosi-siamo-prudenti/",
      "/alla-ricerca-dellaltro-da-me/": "/it/testimonianza-giulia-cirillo/",
      "/se-avessi-ascoltato-la-mia-disperazione/": "/it/dialogo-aperto-n-95/",
      "/dalle-province-n-138-2/": "/it/trasformare-i-nostri-cuori/",
      "/ricordi-di-mia-madre-recensione-2/": "/it/perdersi-recensione/",
      "/dialogo-aperto-n-143-2/": "/it/dalle-province-n-143/",
      "/obiettivo-decrescita-ecensione/": "/it/obiettivo-decrescita-recensione/",
      "/mamma-in-comunita-2/": "/it/la-strada-percorsa-finora/",
      "/la-speranza-non-fa-rumore-recensione-3/": "/it/bioetica-come-storia-recensione/",
      "/un-figlio-handicappato-2/": "/it/editoriale-lettera-aperta-agli-amici-di-fede-e-luce/",
      "/cose-un-sacramento-cose-leucaristia-cose-la-confessione-2/": "/it/editoriale-lettera-aperta-agli-amici-di-fede-e-luce/",
      "/ci-hanno-scritto-n-12-2/": "/it/editoriale-lettera-aperta-agli-amici-di-fede-e-luce/",
      "/venerdi-poverta-assisi-1978/": "/it/quel-giorno-pioveva/",
      "/se-assisi-1978-2/": "/it/quel-giorno-pioveva/",
      "/corsa-in-taxi-2/": "/it/un-augurio-speciale/",
      "/gli-altri-vostri-figli-lhanno-accettato-2/": "/it/vita-fede-e-luce/",
      "/una-realta-esigente-2/": "/it/vita-fede-e-luce/",
      "/perche-non-mi-capisci-3/": "/it/vita-fede-e-luce/",
      "/mia-sorella-2/": "/it/vita-fede-e-luce/",
      "/non-e-facile-esprimere-2/": "/it/vita-fede-e-luce/",
      "/una-lettera-2/": "/it/vita-fede-e-luce/",
      "/la-mia-vita-2/": "/it/vita-fede-e-luce/",
      "/ciao-alessandro/": "/it/vita-fede-e-luce/",
      "/dialogo-aperto-n-135-2/": "/it/dalle-province-n-135/",
      "/mi-hanno-regalato-un-sogno-2/": "/it/dalle-province-n-135/",
      "/mio-figlio-un-angelo-che-ha-scelto-di-vivere/": "/it/mio-figlio-un-angelo-che-ha-scelto-di-vivere-recensione/",
      "/efrem-1/": "/it/impegnarsi-e-impegnarmi/",
      "/disabilmentemamma/": "/it/disabilmentemamme/",
      "/amore-caro-a-filo-doppio-con-persone-fragili/": "/it/amore-caro-a-filo-doppio-con-persone-fragili-recensione/",
      "/gli-esordi-insieme-1974-1981-2/": "/it/quattro-punti-cardinali-i-luoghi-di-ombre-e-luci-tra-i-quartieri-di-roma/",
      "/giubileo-2016-la-vera-gioia-2/": "/it/la-sfida-di-chi-ama-di-piu/",
      "/dialogo-aperto-n-139-2/": "/it/scoprirsi-unici-e-crescere-insieme/",
      "/come-and-see-meeting-dei-giovani-ad-alicante-2/": "/it/scoprirsi-unici-e-crescere-insieme/",
      "/la-chiesa-accanto-a-mio-figlio-2/": "/it/scoprirsi-unici-e-crescere-insieme/",
      "/ci-ha-lasciato-marie-odile-rhethore/": "/it/ci-ha-lasciato-la-professoressa-marie-odile-rhethore/",
      "/il-respiro-leggero-dellalba-recensione-2/": "/it/il-motivo-per-cui-salto-recensione/",
      "/tema-dellanno-1980-lincontro-2/": "/it/letture-consigliate-n-23/",
      "/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi-2/": "/it/letture-consigliate-n-23/",
      "/marymount-unestate-di-musica-e-sorrisi-2/": "/it/letture-consigliate-n-23/",
      "/lordinazione-di-robert-michit-2/": "/it/letture-consigliate-n-23/",
      "/insieme-verso-la-pasqua-1981-2/": "/it/letture-consigliate-n-23/",
      "/qualche-raggio-di-sole-in-siria-2/": "/cercare-la-bellezza-la-dove-e-nascosta/",
      "/un-ponte-in-un-guscio-di-noce-2/": "/it/il-roveto-di-santilario/",
      "/spiritualmente-le-piccole-suore-non-sono-handicappate-2/": "/it/il-roveto-di-santilario/",
      "/antonietta-campo-estivo/": "/it/vivere-a-colori/",
      "/anffas-ogni-persona-con-disabilita-e-nostro-figlio/": "/it/istituto-mio-dio/",
      "/istituto-mio-dio-2/": "/it/il-tuo-bambino-ha-qualcosa-che-non-va/",
      "/nella-diagnosi-siamo-prudenti-2/": "/it/tra-paura-e-desiderio-di-sapere/",
      "/il-tuo-bambino-ha-qualcosa-che-non-va-2/": "/it/che-grinta/",
      "/tra-paura-e-desiderio-di-sapere-2/": "/it/dialogo-aperto-n-122/",
      "/non-possiamo-restare-dei-peter-pan-a-vita-2/": "/it/il-senso-di-una-vita-e-di-una-scelta/",
      "/cercare-la-bellezza-la-dove-e-nascosta-2/": "/it/il-senso-di-una-vita-e-di-una-scelta/",
      "/che-grinta-2/": "/it/ora-basta/",
      "/notiziario-fede-e-luce-dicembre-1976-2/": "/it/testimonianze-dai-campi-di-alfedena-1976/",
      "/la-comunicazione-multimodale-2/": "/it/segni-dellamore-di-dio/",
      "/segni-dellamore-di-dio-2/": "/it/ascoltare-i-segni-perche-in-lis/",
      "/fede-e-luce-anatomia-di-una-comunita-di-incontro/": "/it/1-introduzione-fede-e-luce-anatomia-di-una-comunita-di-incontro/",
      "/ci-hanno-scritto-insieme-n-24-2/": "/it/1-introduzione-fede-e-luce-anatomia-di-una-comunita-di-incontro/",
      "/ascoltare-i-segni-perche-in-lis-2/": "/it/fede-e-luce-una-grande-famiglia/",
      "/porta-sfortuna-2/": "/it/dialogo-aperto-n-133/",
      "/il-roveto-di-santilario-2/": "/it/dialogo-aperto-n-133/",
      "/la-disabilita-un-confine-da-superare-2/": "/it/chiamati-tutti-al-traguardo/",
      "/il-senso-di-una-vita-e-di-una-scelta-2/": "/it/chiamati-tutti-al-traguardo/",
      "/dalle-provincia-n-130-2/": "/it/il-senso-della-festa/",
      "/la-paura-di-amare-recensione-2/": "/it/il-senso-della-festa/",
      "/dialogo-aperto-n-130-2/": "/it/il-senso-della-festa/",
      "/il-senso-della-festa-2/": "/it/scintille-di-amicizia/",
      "/scintille-di-amicizia-2/": "/it/i-mille-volti/",
      "/i-mille-volti-2/": "/it/piu-scavo-piu-trovo/",
      "/il-motivo-per-cui-salto-recensione-2/": "/it/dialogo-aperto-n-126/",
      "/dialogo-aperto-n-126-2/": "/it/fede-e-luce-si-ci-siamo-anche-noi/",
      "/fede-e-luce-si-ci-siamo-anche-noi-2/": "/it/un-capo-atipico-per-larca/",
      "/un-capo-atipico-per-larca-2/": "/it/cristiani-del-sagrato/",
      "/cristiani-del-sagrato-2/": "/it/la-mia-lampada-frontale/",
      "/la-mia-lampada-frontale-2/": "/it/argento-vivo/",
      "/argento-vivo-2/": "/it/sulla-sua-strada/",
      "/da-un-altro-punto-di-vista-2/": "/it/con-orgoglio-e-tenerezza/",
      "/lamicizia-un-dono-unico-ed-eterno-2/": "/it/con-orgoglio-e-tenerezza/",
      "/labilita-onlus-aprire-gli-occhi-2/": "/it/avere-un-posto-nella-societa/",
      "/il-calore-dellamicizia-2/": "/it/una-ragazza-speciale/",
      "/vuoi-bene-a-gesu-2/": "/it/una-ragazza-speciale/",
      "/una-ragazza-speciale-2/": "/it/perche-ho-avuto-fiducia/",
      "/puo-un-gesto-essere-cosi-significativo-2/": "/it/un-oro-al-giorno/",
      "/chi-scalda-il-cuore-2/": "/it/un-oro-al-giorno/",
      "/cosa-ti-aspetti-2/": "/it/un-oro-al-giorno/",
      "/monsignor-von-galen-leroismo-di-una-coscienza-2/": "/it/un-oro-al-giorno/",
      "/il-giubileo-di-fede-e-luce-2/": "/it/un-oro-al-giorno/",
      "/dalle-province-n-135-2/": "/it/un-oro-al-giorno/",
      "/chiamati-a-portare-frutto-2/": "/it/un-oro-al-giorno/",
      "/la-lingua-dei-segni-nelle-disabilita-comunicative/": "/it/la-lingua-dei-segni-nelle-disabilita-comunicative-recensione/",
      "/marina-di-camerota-venti-giorni-di-prime-volte-2/": "/it/quante-domande-davanti-a-loro/",
      "/estate-fede-e-luce-1980-la-gioia-di-fare-vacanza-insieme-2/": "/it/quante-domande-davanti-a-loro/",
      "/campeggio-fede-e-luce-unavventura-di-vita-e-comunita-2/": "/it/quante-domande-davanti-a-loro/",
      "/un-aiuto-per-il-pellegrinaggio-di-lourdes-1981-chi-puo-darci-una-mano-2/": "/it/quante-domande-davanti-a-loro/",
      "/incontro-internazionale-e-nazionale-un-ponte-di-solidarieta-tra-paesi-e-comunita-2/": "/it/quante-domande-davanti-a-loro/",
      "/ogni-volta-che-lascio-alfedena-2/": "/it/quante-domande-davanti-a-loro/",
      "/darti-la-vita-2/": "/it/adulti-lievemente-handicappati/",
      "/vita-fede-e-luce-natale-1977-a-2/": "/it/assemblea-internazionale-di-fede-e-luce-a-bruxelles-gennaio-1978/",
      "/notiziario-fede-e-luce-n-16-2/": "/it/assemblea-internazionale-di-fede-e-luce-a-bruxelles-gennaio-1978/",
      "/esperienze-i-campi-dellestete-1977/": "/it/esperienze-i-campi-dellestate-1977/",
      "/scuola-e-disabilita-integrazione-ascoltiamo-le-testimonianze-di-due-mamme-2/": "/it/esperienze-i-campi-dellestate-1977/",
      "/come-bere-un-bicchier-dacqua-2/": "/it/esperienze-i-campi-dellestate-1977/",
      "/giovanissimi-2/": "/it/buon-natale-antico-corale-trascritto-da-un-bambino/",
      "/sono-tornato-stasera-2/": "/it/buon-natale-antico-corale-trascritto-da-un-bambino/",
      "/noris-2/": "/it/buon-natale-antico-corale-trascritto-da-un-bambino/",
      "/giovanissimi-n-3-2/": "/it/buon-natale-antico-corale-trascritto-da-un-bambino/",
      "/buon-natale-antico-corale-trascritto-da-un-bambino-2/": "/it/ci-ha-scritto-la-mamma-di-roberto/",
      "/per-la-nostra-riflessione-2/": "/it/letture-consigliate-n-18/",
      "/per-la-loro-educazione-visita-allistituto-statale-romagnolo-per-non-vedenti-2/": "/it/letture-consigliate-n-18/",
      "/esperienze-al-gruppo-fede-e-luce-la-mamma-di-massimo-2/": "/it/letture-consigliate-n-18/",
      "/come-un-raggio-di-sole-2/": "/it/letture-consigliate-n-18/",
      "/notiziario-fede-e-luce-n-18-2/": "/it/letture-consigliate-n-18/",
      "/vita-dei-gruppi-fede-e-luce-1978-2/": "/it/letture-consigliate-n-18/",
      "/festa-della-primavera-a-villa-pacis-1978-2/": "/it/letture-consigliate-n-18/",
      "/la-casetta-di-fede-e-luce-cose-che-fini-ha-chi-la-frequenta/": "/it/letture-consigliate-n-18/",
      "/fede-e-luce-anatomia-di-una-comunita-di-incontro-2/": "/it/5-creascere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/",
      "/fede-e-luce-larte-dellincontro-per-superare-la-paura-della-diversita-2/": "/it/5-creascere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/",
      "/costruire-comunita-i-tre-pilastri-di-fede-e-luce/": "/it/5-creascere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/",
      "/guidare-una-comunita-fede-e-luce-principi-e-pratica/": "/it/5-creascere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/",
      "/esperienze-i-campi-dellestate-1977-2/": "/it/notiziario-fede-e-luce-calendario-1978/",
      "/notiziario-fede-e-luce-1978/": "/it/notiziario-fede-e-luce-calendario-1978/",
      "/costruire-comunita-tre-pilastri-fede-luce/": "/it/4-vita-comunitaria-costruire-comunita-tre-pilastri-fede-luce/",
      "/i-volti-di-fede-e-luce-persona-con-disabilita-genitori-amici-e-sacerdoti-2/": "/it/4-vita-comunitaria-costruire-comunita-tre-pilastri-fede-luce/",
      "/ci-hanno-scritto-n-20-2/": "/it/notiziario-fede-e-luce-n-20/",
      "/7-testimonianze-di-genitori-e-amici-di-bambini-profondamente-handicappati-2/": "/it/notiziario-fede-e-luce-n-20/",
      "/la-forestiere-vita-comunitaria-con-i-piu-gravi-allarche-2/": "/it/notiziario-fede-e-luce-n-20/",
      "/ci-ha-scritto-la-mamma-di-roberto-2/": "/it/avevano-bisogno-di-noi/",
      "/di-serie-promettenti-e-film-non-riusciti-alla-festa-del-cinema-di-roma/": "/it/recensione-te-lavevo-detto-la-storia/",
      "/notiziario-fede-e-luce-calendario-del-prossimo-anno/": "/it/bando-di-concorso-per-auto-adesivo-del-pellegrinaggio/",
      "/un-giro-in-tandem/": "/it/il-mio-primo-giro-in-bici/",
      "/meditazione-a-modo-mio-2/": "/it/jean-vanier-a-parma-1978/",
      "/quel-giorno-pioveva-2/": "/it/jean-vanier-a-parma-1978/",
      "/5-crescere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/": "/it/andiamo-tutti-in-pizzeria/",
      "/lourdes-qui-e-oggi/": "/it/andiamo-tutti-in-pizzeria/",
      "/vita-fede-e-luce-n-24-2/": "/it/andiamo-tutti-in-pizzeria/",
      "/pellegrinaggio-a-loreto-18-20-maggio-1979-2/": "/it/gita-ad-argegno-3-giugno-1979/",
      "/pellegrinaggio-a-loreto-1979-le-testimonianze-dei-partecipanti/": "/it/gita-ad-argegno-3-giugno-1979/",
      "/23-maggio-1979-festa-della-primavera-2/": "/it/gita-ad-argegno-3-giugno-1979/",
      "/gita-ad-argegno-3-giugno-1979-2/": "/it/vita-fede-e-luce-n-22-1979/",
      "/vita-fede-e-luce-n-22-1979-2/": "/it/letture-consigliate-n-22/",
      "/cosa-vedremo-a-roma-durante-il-pellegrinaggio-1975-2/": "/it/i-canti-del-pellegrinaggio-di-roma-1975/",
      "/per-te-ho-visitato-roma-2/": "/it/i-canti-del-pellegrinaggio-di-roma-1975/",
      "/testimonianze-dal-pellegrinaggio-di-lourdes-1971-2/": "/it/i-canti-del-pellegrinaggio-di-roma-1975/",
      "/i-volti-di-fede-e-luce-persona-con-disabilita-genitori-amici-e-sacerdoti/": "/it/3-i-protagonisti-i-volti-di-fede-e-luce-persona-con-disabilita-genitori-amici-e-sacerdoti/",
      "/il-mio-quinto-concerto-di-baglioni/": "/it/benedetta-baglioni/",
      "/leco-della-stampa-2/": "/it/ricordi-e-speranze-dai-questionari-sul-pellegrinaggio-a-roma-del-1975/",
      "/ricordi-e-speranze-dai-questionari-sul-pellegrinaggio-a-roma-del-1975-2/": "/it/giovanissimi-n-7/",
      "/giovanissimi-n-7-2/": "/it/tavola-rotonda/",
      "/tavola-rotonda-2/": "/it/dietro-le-quinte/",
      "/dietro-le-quinte-2/": "/it/il-problema-dellacqua/",
      "/il-problema-dellacqua-2/": "/it/la-nostra-buona-novella/",
      "/avevano-bisogno-di-noi-2/": "/it/resoconti-degli-incontri-fede-e-luce/",
      "/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita-2/": "/it/vita-fede-e-luce-insieme-n-28/",
      "/techniche-di-recupero-per-i-disabili-gravi-la-socializzazione/": "/it/tecniche-di-recupero-per-i-disabili-gravi-la-socializzazione/",
      "/fede-e-luce-larte-dellincontro-per-superare-la-paura-della-diversita/": "/it/2-fede-e-luce-larte-dellincontro-per-superare-la-paura-della-diversita/",
      "/3-vincitori-e-non/": "/it/san-sebastian-festival-tardes-de-soledad/",
      "/letture-consigliate-n-13/": "/it/letture-consigliate-n-14/",
      "/vita-fede-e-luce-insieme-n-28-2/": "/it/la-vendita-di-novembre-impegno-e-solidarieta/",
      "/together-a-san-pietro-2/": "/it/mimo-a-san-pietro/",
      "/quando-arrivia-il-natale/": "/it/quando-arriva-il-natale/",
      "/vita-fede-e-luce-insieme-n-25/": "/it/e-uscita-una-nuova-legge-sullassegno-di-accompagnamento-per-le-persone-totalmente-inabili/",
      "/e-uscita-una-nuova-legge-sullassegno-di-accompagnamento-per-le-persone-totalmente-inabili-2/": "/it/letture-consigliate-la-vita-puo-ricominciare-recensione/",
      "/partiamo-per-il-congo/": "/it/partiamo-per-il-congo-caa/",
      "/letture-consigliate-la-vita-puo-ricominciare-recensione-2/": "/it/questionario-per-i-fratelli-e-sorrelle-di-persone-con-disabilita/",
      "/notiziario-fede-e-luce-n-20-2/": "/it/che-cose-un-katimavic/",
      "/che-cose-un-katimavic-2/": "/it/letture-consigliate-lo-svantaggiato-quale-educazione/",
      "/la-vendita-di-novembre-impegno-e-solidarieta-2/": "/it/incontro-internazionale-preparativi-e-spiritualita/",
      "/via-plinio-30-2/": "/it/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
      "/ci-hanno-scritto-insieme-n-26-2/": "/it/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
      "/dalla-parte-di-lazzaro-2/": "/it/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
      "/5-anni-di-casetta-2/": "/it/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
      "/andiamo-alla-casetta-2/": "/it/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
      "/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti-2/": "/it/un-problema-che-non-so-risolvere/",
      "/un-problema-che-non-so-risolvere-2/": "/it/vita-fede-e-luce-insieme-n-26/",
      "/vita-fede-e-luce-insieme-n-26-2/": "/it/letture-consigliate-n-26/",
      "/fede-e-luce-un-po-di-storia/": "/it/la-festa-continua/",
      "/amici-delicati-e-fedeli-2/": "/it/la-festa-continua/",
      "/gioia-di-essere-sacerdote-2/": "/it/la-festa-continua/",
      "/la-lettera-del-papa-wojtyla-2/": "/it/la-festa-continua/",
      "/avevo-paura-2/": "/it/la-festa-continua/",
      "/come-avviare-una-comunita-2/": "/it/la-festa-continua/",
      "/perche-un-numero-dedicato-allanimazione-2/": "/it/la-festa-continua/",
      "/jean-vanier-ai-giovani-2/": "/it/la-festa-continua/",
      "/perche-a-lourdes-2/": "/it/la-festa-continua/",
      "/lettera-di-presentazione-del-cardinale-hume-2/": "/it/la-festa-continua/",
      "/celebriamo-la-pasqua-1981-nella-comunita-fede-e-luce-2/": "/it/la-festa-continua/",
      "/perche-questo-insieme-speciale-2/": "/it/la-festa-continua/",
      "/1-insieme-in-cammino-siamo-tutti-pellegrini/": "/it/la-festa-continua/",
      "/2-pellegrini-in-comunita-2/": "/it/la-festa-continua/",
      "/3-in-comunita-accoglienti-2/": "/it/la-festa-continua/",
      "/4-ognuno-ha-il-suo-posto-nella-comunita-2/": "/it/la-festa-continua/",
      "/5-sono-loro-che-ci-uniscono-e-ci-guidano-2/": "/it/la-festa-continua/",
      "/6-cristo-risorto-fa-di-noi-un-solo-popolo-2/": "/it/la-festa-continua/",
      "/7-lo-spirito-santo-dono-di-gesu-risorto-2/": "/it/la-festa-continua/",
      "/8-nutrirsi-di-gesu-attraverso-la-parola-2/": "/it/la-festa-continua/",
      "/9-nella-preghiera-personale-2/": "/it/la-festa-continua/",
      "/11-compiendo-la-volonta-del-padre-2/": "/it/la-festa-continua/",
      "/10-nella-preghiera-comunitaria-2/": "/it/la-festa-continua/",
      "/12-con-i-santi-2/": "/it/la-festa-continua/",
      "/13-con-maria-2/": "/it/la-festa-continua/",
      "/14-nelleucarestia-venite-a-me-2/": "/it/la-festa-continua/",
      "/15-nelleucarestia-restate-in-me-2/": "/it/la-festa-continua/",
      "/16-il-perdono-2/": "/it/la-festa-continua/",
      "/fede-e-luce-domande-e-risposte-2/": "/it/la-festa-continua/",
      "/ma-di-sicuro-torna-il-sereno-2/": "/it/la-festa-continua/",
      "/fede-e-luce-pasquale-2/": "/it/la-festa-continua/",
      "/cosa-e-fede-e-luce-tre-risposte-2/": "/it/la-festa-continua/",
      "/ognuno-ha-il-suo-posto-nella-comunita-2/": "/it/la-festa-continua/",
      "/scegliere-di-lasciarsi-scegliere-2/": "/it/la-festa-continua/",
      "/il-posto-della-persona-handicappata-nelle-nostre-comunita-2/": "/it/la-festa-continua/",
      "/genitori-di-persone-con-disabilita-nessuno-disturba-nessuno-2/": "/it/la-festa-continua/",
      "/tre-tappe-nella-mia-vita-2/": "/it/la-festa-continua/",
      "/incontro-fra-genitori-2/": "/it/la-festa-continua/",
      "/lorganizazione-a-fede-e-luce/": "/it/lorganizzazione-a-fede-e-luce/",
      "/la-festa-continua-2/": "/it/lorganizzazione-a-fede-e-luce/",
      "/tu-sostieni-2/": "/it/18-domande-su-fede-e-luce/",
      "/i-fratelli-e-le-sorelle-di-persone-con-disabilita-2/": "/it/18-domande-su-fede-e-luce/",
      "/cosa-e-e-come-funziona-una-comunita-fede-e-luce-2/": "/it/18-domande-su-fede-e-luce/",
      "/prendete-e-mangiatene-tutti-2/": "/it/18-domande-su-fede-e-luce/",
      "/la-festa-a-fede-e-luce-2/": "/it/18-domande-su-fede-e-luce/",
      "/il-pellegrinaggio-a-fede-e-luce-2/": "/it/18-domande-su-fede-e-luce/",
      "/18-domande-su-fede-e-luce-2/": "/it/primo-campeggio-fede-e-luce/",
      "/animare-una-messa-e-renderla-viva-facendo-lunita-2/": "/it/principi-di-azione-per-una-equipe-di-animazione/",
      "/principi-di-azione-per-una-equipe-di-animazione-2/": "/it/dare-vita-movimento-calore-limportanza-dellanimazione-nelle-comunita-fede-e-luce/",
      "/dare-vita-movimento-calore-limportanza-dellanimazione-nelle-comunita-fede-e-luce-2/": "/it/dopo-di-me-il-diluvio-commedia-musicale-del-gruppo-fede-e-luce-di-san-paolo/",
      "/dopo-di-me-il-diluvio-commedia-musicale-del-gruppo-fede-e-luce-di-san-paolo-2/": "/it/la-festa-uno-dei-momenti-essenziale-della-comunita-fede-e-luce/",
      "/la-festa-uno-dei-momenti-essenziali-della-comunita-fede-e-luce/": "/it/unora-di-musica-con-suor-maria/",
      "/unora-di-musica-con-suor-maria-2/": "/it/comunita-di-fede-e-luce/",
      "/comunita-di-fede-e-luce-2/": "/it/consigli-di-lettura-insieme-n-29/",
      "/in-viaggio-verso-lourdes-2/": "/it/lourdes-1981-giovedi-santo/",
      "/lourdes-1981-giovedi-santo-2/": "/it/lourdes-1981-venerdi-santo/",
      "/lourdes-1981-venerdi-santo-2/": "/it/lourdes-1981-sabato-santo/",
      "/lourdes-1981-domenica-di-pasqua-2/": "/it/va-verso-i-tuoi-fratelli-e-di-loro/",
      "/va-verso-i-tuoi-fratelli-e-di-loro-2/": "/it/voci-dal-pellegrinaggio-lourdes-1981-frammenti-di-vita-e-di-fede/",
      "/voci-dal-pellegrinaggio-lourdes-1981-frammenti-di-vita-e-di-fede-2/": "/it/una-nuova-speranza/",
      "/una-nuova-speranza-2/": "/it/buon-natale-1981-e-un-numero-speciale/",
      "/buon-natale-1981-e-un-numero-speciale-2/": "/it/storia-di-natale/",
      "/storia-di-natale-2/": "/it/il-futuro-di-insieme-una-catena-che-diventa-sempre-piu-grande/",
      "/risorse-per-una-catechesi-sensoriale-e-inclusiva/": "/it/catechesi-inclusiva-materiali-tattili/",
      "/la-piccola-marcia/": "/it/alla-piccola-marcia-di-assisi/",
      "/il-ruolo-di-cura-tre-film-alla-berlinale-che-ispirano-una-riflessione/": "/it/il-ruolo-di-cura-quattro-film-berlinale/",
      "/il-cugino-che-sapeva-di-lavanda/": "/it/claudio-lavanda/",
      "/il-coraggio-di-cambiare-2/": "/it/suor-veronica-pompei/",
      "/se-sei-sola-invece-no/": "/it/se-sei-sola-invece-non-e-bello/",
      "/lourdes-a-miracle-of-encounter/": "/it/mother-teresa-of-calcutta-dedicated-to-children-and-to-all-of-us/",
      "/interactive-games-for-unforgettable-group-funmatica/": "/it/interactive-games-unforgettable-group-fun/",
      "/la-festa-di-compleanno-di-veronica-felice/": "/it/la-festa-di-compleanno-di-veronica/"
    };
    REDIRECTS = redirectsLegacy;
    DATE_PATH_RE = /^\/\d{4}\/\d{2}\/\d{2}\/(.+)$/;
    YEAR_MONTH_SLUG_RE = /^\/\d{4}\/\d{2}\/([^/]+?)\/?$/;
    BLOG_EN_SLUG_RE = /^\/blog\/([^/]+)-en\/?$/;
    DIARIO_RE = /^(\/diario-di-[^/]+)\/?$/;
    BLOG_IT_SLUG_RE = /^\/blog\/([^/]+?)\/?$/;
    onRequest$2 = defineMiddleware(({ url, redirect }, next) => {
      const path = url.pathname;
      const enMatch = path.match(BLOG_EN_SLUG_RE);
      if (enMatch)
        return redirect("/en/" + enMatch[1] + "/", 301);
      const diarioMatch = path.match(DIARIO_RE);
      if (diarioMatch)
        return redirect("/it/diari" + diarioMatch[1] + "/", 301);
      const blogItMatch = path.match(BLOG_IT_SLUG_RE);
      if (blogItMatch && blogItMatch[1] !== "en") {
        return redirect("/it/" + blogItMatch[1] + "/", 301);
      }
      const target = REDIRECTS[path];
      if (target)
        return redirect("https://ombreeluci.it" + target, 301);
      const dateMatch = path.match(DATE_PATH_RE);
      if (dateMatch)
        return redirect("https://ombreeluci.it/it/" + dateMatch[1], 301);
      const ymMatch = path.match(YEAR_MONTH_SLUG_RE);
      if (ymMatch)
        return redirect("https://ombreeluci.it/it/" + ymMatch[1], 301);
      return next();
    });
    When = {
      Client: "client",
      Server: "server",
      Prerender: "prerender",
      StaticBuild: "staticBuild",
      DevServer: "devServer"
    };
    isBuildContext = Symbol.for("astro:when/buildContext");
    whenAmI = globalThis[isBuildContext] ? When.Prerender : When.Server;
    middlewares = {
      [When.Client]: () => {
        throw new Error("Client should not run a middleware!");
      },
      [When.DevServer]: (_, next) => next(),
      [When.Server]: (_, next) => next(),
      [When.Prerender]: (ctx, next) => {
        if (ctx.locals.runtime === void 0) {
          ctx.locals.runtime = {
            env: process.env
          };
        }
        return next();
      },
      [When.StaticBuild]: (_, next) => next()
    };
    onRequest$1 = middlewares[whenAmI];
    onRequest = sequence(
      onRequest$1,
      onRequest$2
    );
  }
});

// .wrangler/tmp/bundle-zhChnV/middleware-loader.entry.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// .wrangler/tmp/bundle-zhChnV/middleware-insertion-facade.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// .wrangler/tmp/pages-JtB0w2/zo4wolx9zu.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// .wrangler/tmp/pages-JtB0w2/bundledWorker-0.2298977654712444.mjs
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_renderers();

// .wrangler/tmp/pages-JtB0w2/_@astrojs-ssr-adapter.mjs
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_index_CGzEFjN();
init_server_BT9XwReg();

// .wrangler/tmp/pages-JtB0w2/chunks/noop-middleware_DR80vEV7.mjs
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_server_BT9XwReg();
globalThis.process ??= {};
globalThis.process.env ??= {};
var NOOP_MIDDLEWARE_FN = /* @__PURE__ */ __name(async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
}, "NOOP_MIDDLEWARE_FN");

// .wrangler/tmp/pages-JtB0w2/_@astrojs-ssr-adapter.mjs
init_astro_designed_error_pages_CROwsZzW();
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
  const page13 = /* @__PURE__ */ __name(async (result) => {
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
  page13.isAstroComponentFactory = true;
  const instance = {
    default: page13,
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
      const onRequest2 = middlewareInstance.onRequest ?? NOOP_MIDDLEWARE_FN;
      if (this.manifest.checkOrigin) {
        this.resolvedMiddleware = sequence(createOriginCheckMiddleware(), onRequest2);
      } else {
        this.resolvedMiddleware = onRequest2;
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
      routes: this.manifest?.routes.map((r2) => r2.routeData),
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

// .wrangler/tmp/pages-JtB0w2/manifest_CCCchbwS.mjs
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_server_BT9XwReg();
init_astro_designed_error_pages_CROwsZzW();
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
  const routes2 = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes2.push({
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
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes: routes2,
    serverIslandNameMap,
    key
  };
}
__name(deserializeManifest, "deserializeManifest");
var manifest = deserializeManifest({ "hrefRoot": "file:///C:/Users/berto/Documents/Ombreeluci/", "adapterName": "@astrojs/cloudflare", "routes": [{ "file": "404.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/404", "isIndex": false, "type": "page", "pattern": "^\\/404\\/?$", "segments": [[{ "content": "404", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/404.astro", "pathname": "/404", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "debug/audit-editoriale/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/debug/audit-editoriale", "isIndex": false, "type": "page", "pattern": "^\\/debug\\/audit-editoriale\\/?$", "segments": [[{ "content": "debug", "dynamic": false, "spread": false }], [{ "content": "audit-editoriale", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/debug/audit-editoriale.astro", "pathname": "/debug/audit-editoriale", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "en/about/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/en/about", "isIndex": true, "type": "page", "pattern": "^\\/en\\/about\\/?$", "segments": [[{ "content": "en", "dynamic": false, "spread": false }], [{ "content": "about", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/en/about/index.astro", "pathname": "/en/about", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "en/archive/web-only/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/en/archive/web-only", "isIndex": false, "type": "page", "pattern": "^\\/en\\/archive\\/web-only\\/?$", "segments": [[{ "content": "en", "dynamic": false, "spread": false }], [{ "content": "archive", "dynamic": false, "spread": false }], [{ "content": "web-only", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/en/archive/web-only.astro", "pathname": "/en/archive/web-only", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "en/archive/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/en/archive", "isIndex": true, "type": "page", "pattern": "^\\/en\\/archive\\/?$", "segments": [[{ "content": "en", "dynamic": false, "spread": false }], [{ "content": "archive", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/en/archive/index.astro", "pathname": "/en/archive", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "en/authors/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/en/authors", "isIndex": true, "type": "page", "pattern": "^\\/en\\/authors\\/?$", "segments": [[{ "content": "en", "dynamic": false, "spread": false }], [{ "content": "authors", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/en/authors/index.astro", "pathname": "/en/authors", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "en/focus/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/en/focus", "isIndex": true, "type": "page", "pattern": "^\\/en\\/focus\\/?$", "segments": [[{ "content": "en", "dynamic": false, "spread": false }], [{ "content": "focus", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/en/focus/index.astro", "pathname": "/en/focus", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "en/newsletter/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/en/newsletter", "isIndex": true, "type": "page", "pattern": "^\\/en\\/newsletter\\/?$", "segments": [[{ "content": "en", "dynamic": false, "spread": false }], [{ "content": "newsletter", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/en/newsletter/index.astro", "pathname": "/en/newsletter", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "en/search/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/en/search", "isIndex": true, "type": "page", "pattern": "^\\/en\\/search\\/?$", "segments": [[{ "content": "en", "dynamic": false, "spread": false }], [{ "content": "search", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/en/search/index.astro", "pathname": "/en/search", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "en/sections/diaries/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/en/sections/diaries", "isIndex": false, "type": "page", "pattern": "^\\/en\\/sections\\/diaries\\/?$", "segments": [[{ "content": "en", "dynamic": false, "spread": false }], [{ "content": "sections", "dynamic": false, "spread": false }], [{ "content": "diaries", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/en/sections/diaries.astro", "pathname": "/en/sections/diaries", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "en/support-us/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/en/support-us", "isIndex": true, "type": "page", "pattern": "^\\/en\\/support-us\\/?$", "segments": [[{ "content": "en", "dynamic": false, "spread": false }], [{ "content": "support-us", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/en/support-us/index.astro", "pathname": "/en/support-us", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "en/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/en", "isIndex": true, "type": "page", "pattern": "^\\/en\\/?$", "segments": [[{ "content": "en", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/en/index.astro", "pathname": "/en", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "it/archivio/web-only/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/it/archivio/web-only", "isIndex": false, "type": "page", "pattern": "^\\/it\\/archivio\\/web-only\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "archivio", "dynamic": false, "spread": false }], [{ "content": "web-only", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/archivio/web-only.astro", "pathname": "/it/archivio/web-only", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "it/archivio/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/it/archivio", "isIndex": true, "type": "page", "pattern": "^\\/it\\/archivio\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "archivio", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/archivio/index.astro", "pathname": "/it/archivio", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "it/autori/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/it/autori", "isIndex": true, "type": "page", "pattern": "^\\/it\\/autori\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "autori", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/autori/index.astro", "pathname": "/it/autori", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "it/cerca/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/it/cerca", "isIndex": true, "type": "page", "pattern": "^\\/it\\/cerca\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "cerca", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/cerca/index.astro", "pathname": "/it/cerca", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "it/chi-siamo/collaboratori/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/it/chi-siamo/collaboratori", "isIndex": false, "type": "page", "pattern": "^\\/it\\/chi-siamo\\/collaboratori\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "collaboratori", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/chi-siamo/collaboratori.astro", "pathname": "/it/chi-siamo/collaboratori", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "it/chi-siamo/contatti/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/it/chi-siamo/contatti", "isIndex": false, "type": "page", "pattern": "^\\/it\\/chi-siamo\\/contatti\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "contatti", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/chi-siamo/contatti.astro", "pathname": "/it/chi-siamo/contatti", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "it/chi-siamo/hanno-scritto-per-noi/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/it/chi-siamo/hanno-scritto-per-noi", "isIndex": false, "type": "page", "pattern": "^\\/it\\/chi-siamo\\/hanno-scritto-per-noi\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "hanno-scritto-per-noi", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/chi-siamo/hanno-scritto-per-noi.astro", "pathname": "/it/chi-siamo/hanno-scritto-per-noi", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "it/chi-siamo/la-redazione/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/it/chi-siamo/la-redazione", "isIndex": false, "type": "page", "pattern": "^\\/it\\/chi-siamo\\/la-redazione\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-redazione", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/chi-siamo/la-redazione.astro", "pathname": "/it/chi-siamo/la-redazione", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "it/chi-siamo/la-rivista/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/it/chi-siamo/la-rivista", "isIndex": false, "type": "page", "pattern": "^\\/it\\/chi-siamo\\/la-rivista\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-rivista", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/chi-siamo/la-rivista.astro", "pathname": "/it/chi-siamo/la-rivista", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "it/chi-siamo/redazione-storica/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/it/chi-siamo/redazione-storica", "isIndex": false, "type": "page", "pattern": "^\\/it\\/chi-siamo\\/redazione-storica\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "redazione-storica", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/chi-siamo/redazione-storica.astro", "pathname": "/it/chi-siamo/redazione-storica", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "it/chi-siamo/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/it/chi-siamo", "isIndex": true, "type": "page", "pattern": "^\\/it\\/chi-siamo\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "chi-siamo", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/chi-siamo/index.astro", "pathname": "/it/chi-siamo", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "it/focus/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/it/focus", "isIndex": true, "type": "page", "pattern": "^\\/it\\/focus\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "focus", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/focus/index.astro", "pathname": "/it/focus", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "it/newsletter/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/it/newsletter", "isIndex": true, "type": "page", "pattern": "^\\/it\\/newsletter\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "newsletter", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/newsletter/index.astro", "pathname": "/it/newsletter", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "it/rubriche/diari/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/it/rubriche/diari", "isIndex": false, "type": "page", "pattern": "^\\/it\\/rubriche\\/diari\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "rubriche", "dynamic": false, "spread": false }], [{ "content": "diari", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/rubriche/diari.astro", "pathname": "/it/rubriche/diari", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "it/sostienici/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/it/sostienici", "isIndex": true, "type": "page", "pattern": "^\\/it\\/sostienici\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/sostienici/index.astro", "pathname": "/it/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "sitemap-en.xml", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/sitemap-en.xml", "isIndex": false, "type": "endpoint", "pattern": "^\\/sitemap-en\\.xml\\/?$", "segments": [[{ "content": "sitemap-en.xml", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sitemap-en.xml.ts", "pathname": "/sitemap-en.xml", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "sitemap.xml", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/sitemap.xml", "isIndex": false, "type": "endpoint", "pattern": "^\\/sitemap\\.xml\\/?$", "segments": [[{ "content": "sitemap.xml", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sitemap.xml.ts", "pathname": "/sitemap.xml", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/", "isIndex": true, "type": "page", "pattern": "^\\/$", "segments": [], "params": [], "component": "src/pages/index.astro", "pathname": "/", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "endpoint", "isIndex": false, "route": "/_image", "pattern": "^\\/_image$", "segments": [[{ "content": "_image", "dynamic": false, "spread": false }]], "params": [], "component": "node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", "pathname": "/_image", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/commento", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/commento\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "commento", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/commento.ts", "pathname": "/api/commento", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/health", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/health\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "health", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/health.ts", "pathname": "/api/health", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/revalidate", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/revalidate\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "revalidate", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/revalidate.ts", "pathname": "/api/revalidate", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [{ "type": "external", "value": "/_astro/hoisted.jUkLh9Q4.js" }], "styles": [{ "type": "external", "src": "/_astro/index.D7zdi2fC.css" }, { "type": "inline", "content": ".astro-route-announcer{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}\n" }, { "type": "external", "src": "/_astro/_issue_.Cvzu07BQ.css" }, { "type": "inline", "content": ".article-card[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;gap:4px}.article-card--horizontal[data-astro-cid-di2nlc57],.article-card--horizontal[data-astro-cid-di2nlc57] .article-link[data-astro-cid-di2nlc57]{flex-direction:row;gap:1rem;align-items:flex-start}.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:140px;min-width:140px;aspect-ratio:4/3;margin-bottom:0}.article-card--horizontal[data-astro-cid-di2nlc57] .article-title[data-astro-cid-di2nlc57]{font-size:1rem;-webkit-line-clamp:3}.article-card--horizontal[data-astro-cid-di2nlc57] .author-row[data-astro-cid-di2nlc57]{font-size:.8125rem;white-space:normal;flex-wrap:wrap}@media (max-width: 480px){.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:100px;min-width:100px}}.article-link[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;text-decoration:none;color:inherit;align-items:flex-start}.article-image-wrap[data-astro-cid-di2nlc57]{width:100%;aspect-ratio:16/9;flex-shrink:0;overflow:hidden;border-radius:8px;margin-bottom:1rem}.article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{width:100%;height:auto;min-height:120px;object-fit:cover;display:block;transition:transform .35s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{transform:scale(1.03)}.article-meta[data-astro-cid-di2nlc57]{width:100%;margin:0;display:block;padding-bottom:0;border-bottom:none;text-align:left}.article-badge[data-astro-cid-di2nlc57]{margin:0 0 4px;color:var(--accent-color);font-family:Raleway,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.03em}.article-badge-muted[data-astro-cid-di2nlc57]{color:var(--text-secondary);background:#0000000d;padding:.25rem .5rem;border-radius:6px;width:fit-content;text-transform:none}.article-badge-text[data-astro-cid-di2nlc57]{display:inline}.article-title[data-astro-cid-di2nlc57]{margin:4px 0;font-family:Raleway,sans-serif;font-weight:700;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--text-color);font-size:1.25rem;transition:color .2s ease;text-align:left;letter-spacing:normal}.article-link[data-astro-cid-di2nlc57]:hover .article-title[data-astro-cid-di2nlc57]{color:var(--accent-color)}.author-row[data-astro-cid-di2nlc57]{display:flex;align-items:center;gap:4px;margin:0;font-size:.9rem;color:var(--text-secondary);flex-wrap:wrap}.author-link[data-astro-cid-di2nlc57]{color:var(--accent-color);text-decoration:none;font-weight:600;display:inline}.article-sottotitolo[data-astro-cid-di2nlc57]{font-size:.875rem;line-height:1.5;color:var(--text-secondary);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.author-row--inline[data-astro-cid-di2nlc57]{margin-top:.5rem;font-size:.8125rem;color:var(--text-secondary);white-space:normal;flex-wrap:wrap}.author-avatar[data-astro-cid-di2nlc57]{width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0}\n.cta-archivio[data-astro-cid-nsozbvjm]{background:#e6f1f8;border-radius:12px;overflow:hidden;margin:3rem 0 1rem}.cta-archivio__body[data-astro-cid-nsozbvjm]{display:flex;align-items:center;justify-content:space-between;gap:2rem;padding:2.5rem 3rem}.cta-archivio__text[data-astro-cid-nsozbvjm]{flex:1;min-width:0}.cta-archivio__titolo[data-astro-cid-nsozbvjm]{font-family:Raleway,system-ui,sans-serif;font-size:1.75rem;font-weight:700;color:var(--text-color);margin:0 0 .75rem;line-height:1.2;letter-spacing:-.02em}.cta-archivio__sottotitolo[data-astro-cid-nsozbvjm]{font-size:1rem;color:var(--text-secondary);margin:0 0 1.75rem;line-height:1.6;max-width:480px}.cta-archivio__btn[data-astro-cid-nsozbvjm]{display:inline-block;padding:.75rem 2rem;background:#2d8b6a;color:#fff;text-decoration:none;border-radius:6px;font-family:Raleway,system-ui,sans-serif;font-size:1rem;font-weight:700;transition:background .2s}.cta-archivio__btn[data-astro-cid-nsozbvjm]:hover{background:#1a6b52}.cta-archivio__image[data-astro-cid-nsozbvjm]{flex-shrink:0;width:300px}.cta-archivio__image[data-astro-cid-nsozbvjm] img[data-astro-cid-nsozbvjm]{width:100%;height:auto;display:block}@media (max-width: 900px){.cta-archivio__image[data-astro-cid-nsozbvjm]{width:220px}.cta-archivio__titolo[data-astro-cid-nsozbvjm]{font-size:1.5rem}}@media (max-width: 640px){.cta-archivio__body[data-astro-cid-nsozbvjm]{flex-direction:column;padding:2rem 1.5rem;gap:1.5rem}.cta-archivio__image[data-astro-cid-nsozbvjm]{width:100%;max-width:300px;margin:0 auto}.cta-archivio__btn[data-astro-cid-nsozbvjm]{display:block;text-align:center}}\n" }], "routeData": { "route": "/en/archive/[issue]", "isIndex": false, "type": "page", "pattern": "^\\/en\\/archive\\/([^/]+?)\\/?$", "segments": [[{ "content": "en", "dynamic": false, "spread": false }], [{ "content": "archive", "dynamic": false, "spread": false }], [{ "content": "issue", "dynamic": true, "spread": false }]], "params": ["issue"], "component": "src/pages/en/archive/[issue].astro", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [{ "type": "external", "value": "/_astro/hoisted.CsiVuUHd.js" }], "styles": [{ "type": "external", "src": "/_astro/index.D7zdi2fC.css" }, { "type": "inline", "content": ".astro-route-announcer{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}\n.article-card[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;gap:4px}.article-card--horizontal[data-astro-cid-di2nlc57],.article-card--horizontal[data-astro-cid-di2nlc57] .article-link[data-astro-cid-di2nlc57]{flex-direction:row;gap:1rem;align-items:flex-start}.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:140px;min-width:140px;aspect-ratio:4/3;margin-bottom:0}.article-card--horizontal[data-astro-cid-di2nlc57] .article-title[data-astro-cid-di2nlc57]{font-size:1rem;-webkit-line-clamp:3}.article-card--horizontal[data-astro-cid-di2nlc57] .author-row[data-astro-cid-di2nlc57]{font-size:.8125rem;white-space:normal;flex-wrap:wrap}@media (max-width: 480px){.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:100px;min-width:100px}}.article-link[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;text-decoration:none;color:inherit;align-items:flex-start}.article-image-wrap[data-astro-cid-di2nlc57]{width:100%;aspect-ratio:16/9;flex-shrink:0;overflow:hidden;border-radius:8px;margin-bottom:1rem}.article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{width:100%;height:auto;min-height:120px;object-fit:cover;display:block;transition:transform .35s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{transform:scale(1.03)}.article-meta[data-astro-cid-di2nlc57]{width:100%;margin:0;display:block;padding-bottom:0;border-bottom:none;text-align:left}.article-badge[data-astro-cid-di2nlc57]{margin:0 0 4px;color:var(--accent-color);font-family:Raleway,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.03em}.article-badge-muted[data-astro-cid-di2nlc57]{color:var(--text-secondary);background:#0000000d;padding:.25rem .5rem;border-radius:6px;width:fit-content;text-transform:none}.article-badge-text[data-astro-cid-di2nlc57]{display:inline}.article-title[data-astro-cid-di2nlc57]{margin:4px 0;font-family:Raleway,sans-serif;font-weight:700;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--text-color);font-size:1.25rem;transition:color .2s ease;text-align:left;letter-spacing:normal}.article-link[data-astro-cid-di2nlc57]:hover .article-title[data-astro-cid-di2nlc57]{color:var(--accent-color)}.author-row[data-astro-cid-di2nlc57]{display:flex;align-items:center;gap:4px;margin:0;font-size:.9rem;color:var(--text-secondary);flex-wrap:wrap}.author-link[data-astro-cid-di2nlc57]{color:var(--accent-color);text-decoration:none;font-weight:600;display:inline}.article-sottotitolo[data-astro-cid-di2nlc57]{font-size:.875rem;line-height:1.5;color:var(--text-secondary);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.author-row--inline[data-astro-cid-di2nlc57]{margin-top:.5rem;font-size:.8125rem;color:var(--text-secondary);white-space:normal;flex-wrap:wrap}.author-avatar[data-astro-cid-di2nlc57]{width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0}\n.categoria-container[data-astro-cid-rl4hl7k4]{max-width:1400px;margin:0 auto;padding:2rem 1.5rem}.categoria-header[data-astro-cid-rl4hl7k4]{margin-bottom:2rem}.categoria-title[data-astro-cid-rl4hl7k4]{font-family:Raleway,system-ui,sans-serif;font-size:2.5rem;font-weight:700;color:var(--text-color);margin-bottom:.5rem}.categoria-count[data-astro-cid-rl4hl7k4]{font-size:1rem;color:var(--text-secondary)}.categoria-descrizione[data-astro-cid-rl4hl7k4]{margin-top:.75rem;font-size:1.0625rem;line-height:1.7;color:var(--text-secondary);max-width:720px}.categoria-body[data-astro-cid-rl4hl7k4]{display:grid;grid-template-columns:1fr 320px;gap:3rem;align-items:start}.categoria-body--no-evidenza[data-astro-cid-rl4hl7k4]{grid-template-columns:1fr}.feed-col[data-astro-cid-rl4hl7k4] .hero-wrap[data-astro-cid-rl4hl7k4]{margin-bottom:2rem}.articles-list[data-astro-cid-rl4hl7k4]{display:flex;flex-direction:column;gap:0;padding-top:.5rem;border-top:1px solid var(--border-color, #e8e6e3)}.articles-list[data-astro-cid-rl4hl7k4] .article-card{padding:1.25rem 0;border-bottom:1px solid var(--border-color, #e8e6e3)}.articles-list[data-astro-cid-rl4hl7k4] .article-card--horizontal .article-image-wrap{width:200px;min-width:200px;aspect-ratio:4/3}.evidenza-col[data-astro-cid-rl4hl7k4]{position:sticky;top:calc(var(--header-height, 72px) + 1.5rem)}.evidenza-title[data-astro-cid-rl4hl7k4]{font-family:Raleway,system-ui,sans-serif;font-size:.75rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--text-secondary);margin-bottom:1rem;padding-bottom:.5rem;border-bottom:2px solid var(--accent-color)}.evidenza-list[data-astro-cid-rl4hl7k4]{display:flex;flex-direction:column;gap:0}.evidenza-list[data-astro-cid-rl4hl7k4] .article-card{padding:1rem 0;border-bottom:1px solid var(--border-color, #e8e6e3)}.evidenza-list[data-astro-cid-rl4hl7k4] .article-card:first-child{padding-top:0}.evidenza-list[data-astro-cid-rl4hl7k4] .article-title{font-size:.9375rem;-webkit-line-clamp:2}.evidenza-list[data-astro-cid-rl4hl7k4] .author-row{font-size:.75rem}.evidenza-list[data-astro-cid-rl4hl7k4] .article-badge{font-size:11px}@media (max-width: 1024px){.categoria-body[data-astro-cid-rl4hl7k4]{grid-template-columns:1fr}.evidenza-col[data-astro-cid-rl4hl7k4]{position:static;border-top:1px solid var(--border-color, #e8e6e3);padding-top:2rem}.evidenza-list[data-astro-cid-rl4hl7k4]{display:grid;grid-template-columns:repeat(2,1fr);gap:1.5rem}}@media (max-width: 768px){.categoria-container[data-astro-cid-rl4hl7k4]{padding:1.5rem 1.25rem}.categoria-title[data-astro-cid-rl4hl7k4]{font-size:1.75rem}.articles-list[data-astro-cid-rl4hl7k4] .article-card--horizontal .article-image-wrap{width:120px;min-width:120px}}@media (max-width: 480px){.categoria-container[data-astro-cid-rl4hl7k4]{padding:1.25rem 1rem}.categoria-title[data-astro-cid-rl4hl7k4]{font-size:1.5rem}.evidenza-list[data-astro-cid-rl4hl7k4]{grid-template-columns:1fr;gap:0}.articles-list[data-astro-cid-rl4hl7k4] .article-card--horizontal .article-image-wrap{width:90px;min-width:90px}}\n" }], "routeData": { "route": "/en/category/[slug]", "isIndex": false, "type": "page", "pattern": "^\\/en\\/category\\/([^/]+?)\\/?$", "segments": [[{ "content": "en", "dynamic": false, "spread": false }], [{ "content": "category", "dynamic": false, "spread": false }], [{ "content": "slug", "dynamic": true, "spread": false }]], "params": ["slug"], "component": "src/pages/en/category/[slug].astro", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [{ "type": "external", "value": "/_astro/hoisted.CsiVuUHd.js" }], "styles": [{ "type": "external", "src": "/_astro/index.D7zdi2fC.css" }, { "type": "inline", "content": ".astro-route-announcer{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}\n.article-card[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;gap:4px}.article-card--horizontal[data-astro-cid-di2nlc57],.article-card--horizontal[data-astro-cid-di2nlc57] .article-link[data-astro-cid-di2nlc57]{flex-direction:row;gap:1rem;align-items:flex-start}.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:140px;min-width:140px;aspect-ratio:4/3;margin-bottom:0}.article-card--horizontal[data-astro-cid-di2nlc57] .article-title[data-astro-cid-di2nlc57]{font-size:1rem;-webkit-line-clamp:3}.article-card--horizontal[data-astro-cid-di2nlc57] .author-row[data-astro-cid-di2nlc57]{font-size:.8125rem;white-space:normal;flex-wrap:wrap}@media (max-width: 480px){.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:100px;min-width:100px}}.article-link[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;text-decoration:none;color:inherit;align-items:flex-start}.article-image-wrap[data-astro-cid-di2nlc57]{width:100%;aspect-ratio:16/9;flex-shrink:0;overflow:hidden;border-radius:8px;margin-bottom:1rem}.article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{width:100%;height:auto;min-height:120px;object-fit:cover;display:block;transition:transform .35s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{transform:scale(1.03)}.article-meta[data-astro-cid-di2nlc57]{width:100%;margin:0;display:block;padding-bottom:0;border-bottom:none;text-align:left}.article-badge[data-astro-cid-di2nlc57]{margin:0 0 4px;color:var(--accent-color);font-family:Raleway,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.03em}.article-badge-muted[data-astro-cid-di2nlc57]{color:var(--text-secondary);background:#0000000d;padding:.25rem .5rem;border-radius:6px;width:fit-content;text-transform:none}.article-badge-text[data-astro-cid-di2nlc57]{display:inline}.article-title[data-astro-cid-di2nlc57]{margin:4px 0;font-family:Raleway,sans-serif;font-weight:700;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--text-color);font-size:1.25rem;transition:color .2s ease;text-align:left;letter-spacing:normal}.article-link[data-astro-cid-di2nlc57]:hover .article-title[data-astro-cid-di2nlc57]{color:var(--accent-color)}.author-row[data-astro-cid-di2nlc57]{display:flex;align-items:center;gap:4px;margin:0;font-size:.9rem;color:var(--text-secondary);flex-wrap:wrap}.author-link[data-astro-cid-di2nlc57]{color:var(--accent-color);text-decoration:none;font-weight:600;display:inline}.article-sottotitolo[data-astro-cid-di2nlc57]{font-size:.875rem;line-height:1.5;color:var(--text-secondary);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.author-row--inline[data-astro-cid-di2nlc57]{margin-top:.5rem;font-size:.8125rem;color:var(--text-secondary);white-space:normal;flex-wrap:wrap}.author-avatar[data-astro-cid-di2nlc57]{width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0}\n.categoria-container[data-astro-cid-tmle3k6d]{max-width:1400px;margin:0 auto;padding:2rem 1.5rem}.categoria-header[data-astro-cid-tmle3k6d]{margin-bottom:2rem}.categoria-title[data-astro-cid-tmle3k6d]{font-family:Raleway,system-ui,sans-serif;font-size:2.5rem;font-weight:700;color:var(--text-color);margin-bottom:.5rem}.categoria-count[data-astro-cid-tmle3k6d]{font-size:1rem;color:var(--text-secondary)}.categoria-body[data-astro-cid-tmle3k6d]{display:grid;grid-template-columns:1fr 320px;gap:3rem;align-items:start}.categoria-body--no-evidenza[data-astro-cid-tmle3k6d]{grid-template-columns:1fr}.feed-col[data-astro-cid-tmle3k6d] .hero-wrap[data-astro-cid-tmle3k6d]{margin-bottom:2rem}.articles-list[data-astro-cid-tmle3k6d]{display:flex;flex-direction:column;gap:0;padding-top:.5rem;border-top:1px solid var(--border-color, #e8e6e3)}.articles-list[data-astro-cid-tmle3k6d] .article-card{padding:1.25rem 0;border-bottom:1px solid var(--border-color, #e8e6e3)}.articles-list[data-astro-cid-tmle3k6d] .article-card--horizontal .article-image-wrap{width:200px;min-width:200px;aspect-ratio:4/3}.evidenza-col[data-astro-cid-tmle3k6d]{position:sticky;top:calc(var(--header-height, 72px) + 1.5rem)}.evidenza-title[data-astro-cid-tmle3k6d]{font-family:Raleway,system-ui,sans-serif;font-size:.75rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--text-secondary);margin-bottom:1rem;padding-bottom:.5rem;border-bottom:2px solid var(--accent-color)}.evidenza-list[data-astro-cid-tmle3k6d]{display:flex;flex-direction:column;gap:0}.evidenza-list[data-astro-cid-tmle3k6d] .article-card{padding:1rem 0;border-bottom:1px solid var(--border-color, #e8e6e3)}.evidenza-list[data-astro-cid-tmle3k6d] .article-card:first-child{padding-top:0}.evidenza-list[data-astro-cid-tmle3k6d] .article-title{font-size:.9375rem;-webkit-line-clamp:2}.evidenza-list[data-astro-cid-tmle3k6d] .author-row{font-size:.75rem}.evidenza-list[data-astro-cid-tmle3k6d] .article-badge{font-size:11px}@media (max-width: 1024px){.categoria-body[data-astro-cid-tmle3k6d]{grid-template-columns:1fr}.evidenza-col[data-astro-cid-tmle3k6d]{position:static;border-top:1px solid var(--border-color, #e8e6e3);padding-top:2rem}.evidenza-list[data-astro-cid-tmle3k6d]{display:grid;grid-template-columns:repeat(2,1fr);gap:1.5rem}}@media (max-width: 768px){.categoria-container[data-astro-cid-tmle3k6d]{padding:1.5rem 1.25rem}.categoria-title[data-astro-cid-tmle3k6d]{font-size:1.75rem}.articles-list[data-astro-cid-tmle3k6d] .article-card--horizontal .article-image-wrap{width:120px;min-width:120px}}@media (max-width: 480px){.categoria-container[data-astro-cid-tmle3k6d]{padding:1.25rem 1rem}.categoria-title[data-astro-cid-tmle3k6d]{font-size:1.5rem}.evidenza-list[data-astro-cid-tmle3k6d]{grid-template-columns:1fr;gap:0}.articles-list[data-astro-cid-tmle3k6d] .article-card--horizontal .article-image-wrap{width:90px;min-width:90px}}\n" }], "routeData": { "route": "/en/sections/[slug]", "isIndex": false, "type": "page", "pattern": "^\\/en\\/sections\\/([^/]+?)\\/?$", "segments": [[{ "content": "en", "dynamic": false, "spread": false }], [{ "content": "sections", "dynamic": false, "spread": false }], [{ "content": "slug", "dynamic": true, "spread": false }]], "params": ["slug"], "component": "src/pages/en/sections/[slug].astro", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [{ "type": "external", "value": "/_astro/hoisted.Cn5elTKZ.js" }], "styles": [{ "type": "external", "src": "/_astro/index.D7zdi2fC.css" }, { "type": "inline", "content": ".astro-route-announcer{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}\n.article-card[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;gap:4px}.article-card--horizontal[data-astro-cid-di2nlc57],.article-card--horizontal[data-astro-cid-di2nlc57] .article-link[data-astro-cid-di2nlc57]{flex-direction:row;gap:1rem;align-items:flex-start}.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:140px;min-width:140px;aspect-ratio:4/3;margin-bottom:0}.article-card--horizontal[data-astro-cid-di2nlc57] .article-title[data-astro-cid-di2nlc57]{font-size:1rem;-webkit-line-clamp:3}.article-card--horizontal[data-astro-cid-di2nlc57] .author-row[data-astro-cid-di2nlc57]{font-size:.8125rem;white-space:normal;flex-wrap:wrap}@media (max-width: 480px){.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:100px;min-width:100px}}.article-link[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;text-decoration:none;color:inherit;align-items:flex-start}.article-image-wrap[data-astro-cid-di2nlc57]{width:100%;aspect-ratio:16/9;flex-shrink:0;overflow:hidden;border-radius:8px;margin-bottom:1rem}.article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{width:100%;height:auto;min-height:120px;object-fit:cover;display:block;transition:transform .35s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{transform:scale(1.03)}.article-meta[data-astro-cid-di2nlc57]{width:100%;margin:0;display:block;padding-bottom:0;border-bottom:none;text-align:left}.article-badge[data-astro-cid-di2nlc57]{margin:0 0 4px;color:var(--accent-color);font-family:Raleway,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.03em}.article-badge-muted[data-astro-cid-di2nlc57]{color:var(--text-secondary);background:#0000000d;padding:.25rem .5rem;border-radius:6px;width:fit-content;text-transform:none}.article-badge-text[data-astro-cid-di2nlc57]{display:inline}.article-title[data-astro-cid-di2nlc57]{margin:4px 0;font-family:Raleway,sans-serif;font-weight:700;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--text-color);font-size:1.25rem;transition:color .2s ease;text-align:left;letter-spacing:normal}.article-link[data-astro-cid-di2nlc57]:hover .article-title[data-astro-cid-di2nlc57]{color:var(--accent-color)}.author-row[data-astro-cid-di2nlc57]{display:flex;align-items:center;gap:4px;margin:0;font-size:.9rem;color:var(--text-secondary);flex-wrap:wrap}.author-link[data-astro-cid-di2nlc57]{color:var(--accent-color);text-decoration:none;font-weight:600;display:inline}.article-sottotitolo[data-astro-cid-di2nlc57]{font-size:.875rem;line-height:1.5;color:var(--text-secondary);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.author-row--inline[data-astro-cid-di2nlc57]{margin-top:.5rem;font-size:.8125rem;color:var(--text-secondary);white-space:normal;flex-wrap:wrap}.author-avatar[data-astro-cid-di2nlc57]{width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0}\n.rullo-section[data-astro-cid-f6xzovoa]{padding-top:2rem;padding-bottom:3.5rem}.rullo-header[data-astro-cid-f6xzovoa]{margin-bottom:2rem;max-width:720px}.rullo-header-top[data-astro-cid-f6xzovoa]{display:flex;align-items:baseline;gap:1rem;flex-wrap:wrap;margin-bottom:.5rem}.rullo-title[data-astro-cid-f6xzovoa]{font-family:Georgia,Times New Roman,serif;font-size:clamp(1.5rem,3.5vw,2.25rem);font-weight:600;letter-spacing:-.02em;color:var(--text-color);margin:0}.rullo-count[data-astro-cid-f6xzovoa]{font-size:.85rem;font-weight:500;color:var(--text-secondary);white-space:nowrap}.rullo-description[data-astro-cid-f6xzovoa]{font-size:1rem;line-height:1.65;color:var(--text-secondary);margin:0}.rullo-grid[data-astro-cid-f6xzovoa]{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}.rullo-empty[data-astro-cid-f6xzovoa]{padding:3rem 0;color:var(--text-secondary);font-size:.95rem}.rullo-loadmore-wrap[data-astro-cid-f6xzovoa]{display:flex;justify-content:center;margin-top:2.5rem}.rullo-loadmore[data-astro-cid-f6xzovoa]{font-family:inherit;font-size:.9rem;font-weight:600;color:var(--accent-color);background:transparent;border:1.5px solid var(--accent-color);border-radius:999px;padding:.6rem 1.6rem;cursor:pointer;transition:background .15s,color .15s;display:flex;align-items:center;gap:.5rem}.rullo-loadmore[data-astro-cid-f6xzovoa]:hover{background:var(--accent-color);color:#fff}.rullo-remaining[data-astro-cid-f6xzovoa]{font-weight:400;opacity:.75}@media (max-width: 480px){.rullo-section[data-astro-cid-f6xzovoa]{padding-top:1.5rem}.rullo-grid[data-astro-cid-f6xzovoa]{grid-template-columns:1fr;gap:1.25rem}}.article-card{display:flex;flex-direction:column;width:100%;gap:4px}.article-card .article-link{display:flex;flex-direction:column;width:100%;text-decoration:none;color:inherit;align-items:flex-start}.article-card .article-image-wrap{width:100%;aspect-ratio:16/9;flex-shrink:0;overflow:hidden;border-radius:8px;margin-bottom:1rem}.article-card .article-image-wrap img{width:100%;height:auto;min-height:120px;object-fit:cover;display:block;transition:transform .35s ease}.article-card .article-link:hover .article-image-wrap img{transform:scale(1.03)}.article-card .article-meta{width:100%;margin:0}.article-card .article-badge{margin:0 0 4px;color:var(--accent-color);font-family:Raleway,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.03em}.article-card .article-badge-text{display:inline}.article-card .article-title{margin:4px 0;font-family:Raleway,sans-serif;font-weight:700;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--text-color);font-size:1.25rem;transition:color .2s ease}.article-card .article-link:hover .article-title{color:var(--accent-color)}.article-card .author-row{display:flex;align-items:center;gap:4px;margin:0;font-size:.9rem;color:var(--text-secondary);flex-wrap:wrap}.article-card .author-link{color:var(--accent-color);text-decoration:none;font-weight:600;display:inline}\n" }], "routeData": { "route": "/en/tag/[slug]", "isIndex": false, "type": "page", "pattern": "^\\/en\\/tag\\/([^/]+?)\\/?$", "segments": [[{ "content": "en", "dynamic": false, "spread": false }], [{ "content": "tag", "dynamic": false, "spread": false }], [{ "content": "slug", "dynamic": true, "spread": false }]], "params": ["slug"], "component": "src/pages/en/tag/[slug].astro", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [{ "type": "external", "value": "/_astro/hoisted.qY93NfUQ.js" }], "styles": [{ "type": "external", "src": "/_astro/_slug_.DxSNQG-0.css" }, { "type": "external", "src": "/_astro/index.D7zdi2fC.css" }, { "type": "inline", "content": ".astro-route-announcer{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}\n.article-card[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;gap:4px}.article-card--horizontal[data-astro-cid-di2nlc57],.article-card--horizontal[data-astro-cid-di2nlc57] .article-link[data-astro-cid-di2nlc57]{flex-direction:row;gap:1rem;align-items:flex-start}.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:140px;min-width:140px;aspect-ratio:4/3;margin-bottom:0}.article-card--horizontal[data-astro-cid-di2nlc57] .article-title[data-astro-cid-di2nlc57]{font-size:1rem;-webkit-line-clamp:3}.article-card--horizontal[data-astro-cid-di2nlc57] .author-row[data-astro-cid-di2nlc57]{font-size:.8125rem;white-space:normal;flex-wrap:wrap}@media (max-width: 480px){.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:100px;min-width:100px}}.article-link[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;text-decoration:none;color:inherit;align-items:flex-start}.article-image-wrap[data-astro-cid-di2nlc57]{width:100%;aspect-ratio:16/9;flex-shrink:0;overflow:hidden;border-radius:8px;margin-bottom:1rem}.article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{width:100%;height:auto;min-height:120px;object-fit:cover;display:block;transition:transform .35s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{transform:scale(1.03)}.article-meta[data-astro-cid-di2nlc57]{width:100%;margin:0;display:block;padding-bottom:0;border-bottom:none;text-align:left}.article-badge[data-astro-cid-di2nlc57]{margin:0 0 4px;color:var(--accent-color);font-family:Raleway,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.03em}.article-badge-muted[data-astro-cid-di2nlc57]{color:var(--text-secondary);background:#0000000d;padding:.25rem .5rem;border-radius:6px;width:fit-content;text-transform:none}.article-badge-text[data-astro-cid-di2nlc57]{display:inline}.article-title[data-astro-cid-di2nlc57]{margin:4px 0;font-family:Raleway,sans-serif;font-weight:700;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--text-color);font-size:1.25rem;transition:color .2s ease;text-align:left;letter-spacing:normal}.article-link[data-astro-cid-di2nlc57]:hover .article-title[data-astro-cid-di2nlc57]{color:var(--accent-color)}.author-row[data-astro-cid-di2nlc57]{display:flex;align-items:center;gap:4px;margin:0;font-size:.9rem;color:var(--text-secondary);flex-wrap:wrap}.author-link[data-astro-cid-di2nlc57]{color:var(--accent-color);text-decoration:none;font-weight:600;display:inline}.article-sottotitolo[data-astro-cid-di2nlc57]{font-size:.875rem;line-height:1.5;color:var(--text-secondary);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.author-row--inline[data-astro-cid-di2nlc57]{margin-top:.5rem;font-size:.8125rem;color:var(--text-secondary);white-space:normal;flex-wrap:wrap}.author-avatar[data-astro-cid-di2nlc57]{width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0}\n" }], "routeData": { "route": "/en/[slug]", "isIndex": false, "type": "page", "pattern": "^\\/en\\/([^/]+?)\\/?$", "segments": [[{ "content": "en", "dynamic": false, "spread": false }], [{ "content": "slug", "dynamic": true, "spread": false }]], "params": ["slug"], "component": "src/pages/en/[slug].astro", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [{ "type": "external", "value": "/_astro/hoisted.jUkLh9Q4.js" }], "styles": [{ "type": "external", "src": "/_astro/index.D7zdi2fC.css" }, { "type": "inline", "content": ".astro-route-announcer{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}\n" }, { "type": "external", "src": "/_astro/_issue_.Cvzu07BQ.css" }, { "type": "inline", "content": ".article-card[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;gap:4px}.article-card--horizontal[data-astro-cid-di2nlc57],.article-card--horizontal[data-astro-cid-di2nlc57] .article-link[data-astro-cid-di2nlc57]{flex-direction:row;gap:1rem;align-items:flex-start}.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:140px;min-width:140px;aspect-ratio:4/3;margin-bottom:0}.article-card--horizontal[data-astro-cid-di2nlc57] .article-title[data-astro-cid-di2nlc57]{font-size:1rem;-webkit-line-clamp:3}.article-card--horizontal[data-astro-cid-di2nlc57] .author-row[data-astro-cid-di2nlc57]{font-size:.8125rem;white-space:normal;flex-wrap:wrap}@media (max-width: 480px){.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:100px;min-width:100px}}.article-link[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;text-decoration:none;color:inherit;align-items:flex-start}.article-image-wrap[data-astro-cid-di2nlc57]{width:100%;aspect-ratio:16/9;flex-shrink:0;overflow:hidden;border-radius:8px;margin-bottom:1rem}.article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{width:100%;height:auto;min-height:120px;object-fit:cover;display:block;transition:transform .35s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{transform:scale(1.03)}.article-meta[data-astro-cid-di2nlc57]{width:100%;margin:0;display:block;padding-bottom:0;border-bottom:none;text-align:left}.article-badge[data-astro-cid-di2nlc57]{margin:0 0 4px;color:var(--accent-color);font-family:Raleway,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.03em}.article-badge-muted[data-astro-cid-di2nlc57]{color:var(--text-secondary);background:#0000000d;padding:.25rem .5rem;border-radius:6px;width:fit-content;text-transform:none}.article-badge-text[data-astro-cid-di2nlc57]{display:inline}.article-title[data-astro-cid-di2nlc57]{margin:4px 0;font-family:Raleway,sans-serif;font-weight:700;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--text-color);font-size:1.25rem;transition:color .2s ease;text-align:left;letter-spacing:normal}.article-link[data-astro-cid-di2nlc57]:hover .article-title[data-astro-cid-di2nlc57]{color:var(--accent-color)}.author-row[data-astro-cid-di2nlc57]{display:flex;align-items:center;gap:4px;margin:0;font-size:.9rem;color:var(--text-secondary);flex-wrap:wrap}.author-link[data-astro-cid-di2nlc57]{color:var(--accent-color);text-decoration:none;font-weight:600;display:inline}.article-sottotitolo[data-astro-cid-di2nlc57]{font-size:.875rem;line-height:1.5;color:var(--text-secondary);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.author-row--inline[data-astro-cid-di2nlc57]{margin-top:.5rem;font-size:.8125rem;color:var(--text-secondary);white-space:normal;flex-wrap:wrap}.author-avatar[data-astro-cid-di2nlc57]{width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0}\n.cta-archivio[data-astro-cid-nsozbvjm]{background:#e6f1f8;border-radius:12px;overflow:hidden;margin:3rem 0 1rem}.cta-archivio__body[data-astro-cid-nsozbvjm]{display:flex;align-items:center;justify-content:space-between;gap:2rem;padding:2.5rem 3rem}.cta-archivio__text[data-astro-cid-nsozbvjm]{flex:1;min-width:0}.cta-archivio__titolo[data-astro-cid-nsozbvjm]{font-family:Raleway,system-ui,sans-serif;font-size:1.75rem;font-weight:700;color:var(--text-color);margin:0 0 .75rem;line-height:1.2;letter-spacing:-.02em}.cta-archivio__sottotitolo[data-astro-cid-nsozbvjm]{font-size:1rem;color:var(--text-secondary);margin:0 0 1.75rem;line-height:1.6;max-width:480px}.cta-archivio__btn[data-astro-cid-nsozbvjm]{display:inline-block;padding:.75rem 2rem;background:#2d8b6a;color:#fff;text-decoration:none;border-radius:6px;font-family:Raleway,system-ui,sans-serif;font-size:1rem;font-weight:700;transition:background .2s}.cta-archivio__btn[data-astro-cid-nsozbvjm]:hover{background:#1a6b52}.cta-archivio__image[data-astro-cid-nsozbvjm]{flex-shrink:0;width:300px}.cta-archivio__image[data-astro-cid-nsozbvjm] img[data-astro-cid-nsozbvjm]{width:100%;height:auto;display:block}@media (max-width: 900px){.cta-archivio__image[data-astro-cid-nsozbvjm]{width:220px}.cta-archivio__titolo[data-astro-cid-nsozbvjm]{font-size:1.5rem}}@media (max-width: 640px){.cta-archivio__body[data-astro-cid-nsozbvjm]{flex-direction:column;padding:2rem 1.5rem;gap:1.5rem}.cta-archivio__image[data-astro-cid-nsozbvjm]{width:100%;max-width:300px;margin:0 auto}.cta-archivio__btn[data-astro-cid-nsozbvjm]{display:block;text-align:center}}\n" }], "routeData": { "route": "/it/archivio/[issue]", "isIndex": false, "type": "page", "pattern": "^\\/it\\/archivio\\/([^/]+?)\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "archivio", "dynamic": false, "spread": false }], [{ "content": "issue", "dynamic": true, "spread": false }]], "params": ["issue"], "component": "src/pages/it/archivio/[issue].astro", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [{ "type": "external", "value": "/_astro/hoisted.Cn5elTKZ.js" }], "styles": [{ "type": "external", "src": "/_astro/index.D7zdi2fC.css" }, { "type": "inline", "content": ".astro-route-announcer{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}\n.article-card[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;gap:4px}.article-card--horizontal[data-astro-cid-di2nlc57],.article-card--horizontal[data-astro-cid-di2nlc57] .article-link[data-astro-cid-di2nlc57]{flex-direction:row;gap:1rem;align-items:flex-start}.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:140px;min-width:140px;aspect-ratio:4/3;margin-bottom:0}.article-card--horizontal[data-astro-cid-di2nlc57] .article-title[data-astro-cid-di2nlc57]{font-size:1rem;-webkit-line-clamp:3}.article-card--horizontal[data-astro-cid-di2nlc57] .author-row[data-astro-cid-di2nlc57]{font-size:.8125rem;white-space:normal;flex-wrap:wrap}@media (max-width: 480px){.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:100px;min-width:100px}}.article-link[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;text-decoration:none;color:inherit;align-items:flex-start}.article-image-wrap[data-astro-cid-di2nlc57]{width:100%;aspect-ratio:16/9;flex-shrink:0;overflow:hidden;border-radius:8px;margin-bottom:1rem}.article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{width:100%;height:auto;min-height:120px;object-fit:cover;display:block;transition:transform .35s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{transform:scale(1.03)}.article-meta[data-astro-cid-di2nlc57]{width:100%;margin:0;display:block;padding-bottom:0;border-bottom:none;text-align:left}.article-badge[data-astro-cid-di2nlc57]{margin:0 0 4px;color:var(--accent-color);font-family:Raleway,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.03em}.article-badge-muted[data-astro-cid-di2nlc57]{color:var(--text-secondary);background:#0000000d;padding:.25rem .5rem;border-radius:6px;width:fit-content;text-transform:none}.article-badge-text[data-astro-cid-di2nlc57]{display:inline}.article-title[data-astro-cid-di2nlc57]{margin:4px 0;font-family:Raleway,sans-serif;font-weight:700;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--text-color);font-size:1.25rem;transition:color .2s ease;text-align:left;letter-spacing:normal}.article-link[data-astro-cid-di2nlc57]:hover .article-title[data-astro-cid-di2nlc57]{color:var(--accent-color)}.author-row[data-astro-cid-di2nlc57]{display:flex;align-items:center;gap:4px;margin:0;font-size:.9rem;color:var(--text-secondary);flex-wrap:wrap}.author-link[data-astro-cid-di2nlc57]{color:var(--accent-color);text-decoration:none;font-weight:600;display:inline}.article-sottotitolo[data-astro-cid-di2nlc57]{font-size:.875rem;line-height:1.5;color:var(--text-secondary);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.author-row--inline[data-astro-cid-di2nlc57]{margin-top:.5rem;font-size:.8125rem;color:var(--text-secondary);white-space:normal;flex-wrap:wrap}.author-avatar[data-astro-cid-di2nlc57]{width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0}\n.rullo-section[data-astro-cid-f6xzovoa]{padding-top:2rem;padding-bottom:3.5rem}.rullo-header[data-astro-cid-f6xzovoa]{margin-bottom:2rem;max-width:720px}.rullo-header-top[data-astro-cid-f6xzovoa]{display:flex;align-items:baseline;gap:1rem;flex-wrap:wrap;margin-bottom:.5rem}.rullo-title[data-astro-cid-f6xzovoa]{font-family:Georgia,Times New Roman,serif;font-size:clamp(1.5rem,3.5vw,2.25rem);font-weight:600;letter-spacing:-.02em;color:var(--text-color);margin:0}.rullo-count[data-astro-cid-f6xzovoa]{font-size:.85rem;font-weight:500;color:var(--text-secondary);white-space:nowrap}.rullo-description[data-astro-cid-f6xzovoa]{font-size:1rem;line-height:1.65;color:var(--text-secondary);margin:0}.rullo-grid[data-astro-cid-f6xzovoa]{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}.rullo-empty[data-astro-cid-f6xzovoa]{padding:3rem 0;color:var(--text-secondary);font-size:.95rem}.rullo-loadmore-wrap[data-astro-cid-f6xzovoa]{display:flex;justify-content:center;margin-top:2.5rem}.rullo-loadmore[data-astro-cid-f6xzovoa]{font-family:inherit;font-size:.9rem;font-weight:600;color:var(--accent-color);background:transparent;border:1.5px solid var(--accent-color);border-radius:999px;padding:.6rem 1.6rem;cursor:pointer;transition:background .15s,color .15s;display:flex;align-items:center;gap:.5rem}.rullo-loadmore[data-astro-cid-f6xzovoa]:hover{background:var(--accent-color);color:#fff}.rullo-remaining[data-astro-cid-f6xzovoa]{font-weight:400;opacity:.75}@media (max-width: 480px){.rullo-section[data-astro-cid-f6xzovoa]{padding-top:1.5rem}.rullo-grid[data-astro-cid-f6xzovoa]{grid-template-columns:1fr;gap:1.25rem}}.article-card{display:flex;flex-direction:column;width:100%;gap:4px}.article-card .article-link{display:flex;flex-direction:column;width:100%;text-decoration:none;color:inherit;align-items:flex-start}.article-card .article-image-wrap{width:100%;aspect-ratio:16/9;flex-shrink:0;overflow:hidden;border-radius:8px;margin-bottom:1rem}.article-card .article-image-wrap img{width:100%;height:auto;min-height:120px;object-fit:cover;display:block;transition:transform .35s ease}.article-card .article-link:hover .article-image-wrap img{transform:scale(1.03)}.article-card .article-meta{width:100%;margin:0}.article-card .article-badge{margin:0 0 4px;color:var(--accent-color);font-family:Raleway,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.03em}.article-card .article-badge-text{display:inline}.article-card .article-title{margin:4px 0;font-family:Raleway,sans-serif;font-weight:700;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--text-color);font-size:1.25rem;transition:color .2s ease}.article-card .article-link:hover .article-title{color:var(--accent-color)}.article-card .author-row{display:flex;align-items:center;gap:4px;margin:0;font-size:.9rem;color:var(--text-secondary);flex-wrap:wrap}.article-card .author-link{color:var(--accent-color);text-decoration:none;font-weight:600;display:inline}\n" }], "routeData": { "route": "/it/tag/[slug]", "isIndex": false, "type": "page", "pattern": "^\\/it\\/tag\\/([^/]+?)\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "tag", "dynamic": false, "spread": false }], [{ "content": "slug", "dynamic": true, "spread": false }]], "params": ["slug"], "component": "src/pages/it/tag/[slug].astro", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [{ "type": "external", "value": "/_astro/hoisted.BL1IAVw8.js" }], "styles": [{ "type": "external", "src": "/_astro/_slug_.DxSNQG-0.css" }, { "type": "external", "src": "/_astro/index.D7zdi2fC.css" }, { "type": "inline", "content": ".astro-route-announcer{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}\n.article-card[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;gap:4px}.article-card--horizontal[data-astro-cid-di2nlc57],.article-card--horizontal[data-astro-cid-di2nlc57] .article-link[data-astro-cid-di2nlc57]{flex-direction:row;gap:1rem;align-items:flex-start}.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:140px;min-width:140px;aspect-ratio:4/3;margin-bottom:0}.article-card--horizontal[data-astro-cid-di2nlc57] .article-title[data-astro-cid-di2nlc57]{font-size:1rem;-webkit-line-clamp:3}.article-card--horizontal[data-astro-cid-di2nlc57] .author-row[data-astro-cid-di2nlc57]{font-size:.8125rem;white-space:normal;flex-wrap:wrap}@media (max-width: 480px){.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:100px;min-width:100px}}.article-link[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;text-decoration:none;color:inherit;align-items:flex-start}.article-image-wrap[data-astro-cid-di2nlc57]{width:100%;aspect-ratio:16/9;flex-shrink:0;overflow:hidden;border-radius:8px;margin-bottom:1rem}.article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{width:100%;height:auto;min-height:120px;object-fit:cover;display:block;transition:transform .35s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{transform:scale(1.03)}.article-meta[data-astro-cid-di2nlc57]{width:100%;margin:0;display:block;padding-bottom:0;border-bottom:none;text-align:left}.article-badge[data-astro-cid-di2nlc57]{margin:0 0 4px;color:var(--accent-color);font-family:Raleway,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.03em}.article-badge-muted[data-astro-cid-di2nlc57]{color:var(--text-secondary);background:#0000000d;padding:.25rem .5rem;border-radius:6px;width:fit-content;text-transform:none}.article-badge-text[data-astro-cid-di2nlc57]{display:inline}.article-title[data-astro-cid-di2nlc57]{margin:4px 0;font-family:Raleway,sans-serif;font-weight:700;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--text-color);font-size:1.25rem;transition:color .2s ease;text-align:left;letter-spacing:normal}.article-link[data-astro-cid-di2nlc57]:hover .article-title[data-astro-cid-di2nlc57]{color:var(--accent-color)}.author-row[data-astro-cid-di2nlc57]{display:flex;align-items:center;gap:4px;margin:0;font-size:.9rem;color:var(--text-secondary);flex-wrap:wrap}.author-link[data-astro-cid-di2nlc57]{color:var(--accent-color);text-decoration:none;font-weight:600;display:inline}.article-sottotitolo[data-astro-cid-di2nlc57]{font-size:.875rem;line-height:1.5;color:var(--text-secondary);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.author-row--inline[data-astro-cid-di2nlc57]{margin-top:.5rem;font-size:.8125rem;color:var(--text-secondary);white-space:normal;flex-wrap:wrap}.author-avatar[data-astro-cid-di2nlc57]{width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0}\n.leggi-anche[data-astro-cid-3mqzycu7]{margin:2rem 0;border-left:3px solid var(--accent-color);background:var(--bg-light, #f8f6f3);border-radius:0 8px 8px 0;overflow:hidden}.leggi-anche-link[data-astro-cid-3mqzycu7]{display:block;text-decoration:none;color:inherit;padding:1rem 1.25rem;transition:background .15s ease}.leggi-anche-link[data-astro-cid-3mqzycu7]:hover{background:#00000008}.leggi-anche-link[data-astro-cid-3mqzycu7],.leggi-anche-link[data-astro-cid-3mqzycu7] [data-astro-cid-3mqzycu7],.leggi-anche-link[data-astro-cid-3mqzycu7]:visited,.leggi-anche-link[data-astro-cid-3mqzycu7]:hover,.leggi-anche-link[data-astro-cid-3mqzycu7]:focus{text-decoration:none!important}.leggi-anche-label[data-astro-cid-3mqzycu7]{display:block;font-family:Raleway,sans-serif;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--accent-color);margin-bottom:.6rem}.leggi-anche-inner[data-astro-cid-3mqzycu7]{display:flex;gap:1rem;align-items:flex-start}.leggi-anche-img[data-astro-cid-3mqzycu7]{flex-shrink:0;width:90px;aspect-ratio:4/3;overflow:hidden;border-radius:4px}.leggi-anche-img[data-astro-cid-3mqzycu7] img[data-astro-cid-3mqzycu7]{width:100%;height:100%;object-fit:cover;display:block}.leggi-anche-text[data-astro-cid-3mqzycu7]{flex:1;min-width:0}.leggi-anche-title[data-astro-cid-3mqzycu7]{font-family:Raleway,sans-serif;font-size:.95rem;font-weight:700;line-height:1.3;color:var(--text-color);margin:0 0 .3rem;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.leggi-anche-excerpt[data-astro-cid-3mqzycu7]{font-size:.8rem;line-height:1.5;color:var(--text-secondary);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}@media (max-width: 480px){.leggi-anche-img[data-astro-cid-3mqzycu7]{width:72px}.leggi-anche-title[data-astro-cid-3mqzycu7]{font-size:.875rem}}\n" }], "routeData": { "route": "/it/[slug]", "isIndex": false, "type": "page", "pattern": "^\\/it\\/([^/]+?)\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "slug", "dynamic": true, "spread": false }]], "params": ["slug"], "component": "src/pages/it/[slug].astro", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/about", "pattern": "^\\/about\\/?$", "segments": [[{ "content": "about", "dynamic": false, "spread": false }]], "params": [], "component": "/about", "pathname": "/about", "prerender": false, "redirect": "/it/chi-siamo", "redirectRoute": { "route": "/it/chi-siamo", "isIndex": true, "type": "page", "pattern": "^\\/it\\/chi-siamo\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "chi-siamo", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/chi-siamo/index.astro", "pathname": "/it/chi-siamo", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/archivio", "pattern": "^\\/archivio\\/?$", "segments": [[{ "content": "archivio", "dynamic": false, "spread": false }]], "params": [], "component": "/archivio", "pathname": "/archivio", "prerender": false, "redirect": "/it/archivio", "redirectRoute": { "route": "/it/archivio", "isIndex": true, "type": "page", "pattern": "^\\/it\\/archivio\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "archivio", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/archivio/index.astro", "pathname": "/it/archivio", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/autori", "pattern": "^\\/autori\\/?$", "segments": [[{ "content": "autori", "dynamic": false, "spread": false }]], "params": [], "component": "/autori", "pathname": "/autori", "prerender": false, "redirect": "/it/autori", "redirectRoute": { "route": "/it/autori", "isIndex": true, "type": "page", "pattern": "^\\/it\\/autori\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "autori", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/autori/index.astro", "pathname": "/it/autori", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/blog/en", "pattern": "^\\/blog\\/en\\/?$", "segments": [[{ "content": "blog", "dynamic": false, "spread": false }], [{ "content": "en", "dynamic": false, "spread": false }]], "params": [], "component": "/blog/en", "pathname": "/blog/en", "prerender": false, "redirect": "/en/", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/categoria", "pattern": "^\\/categoria\\/?$", "segments": [[{ "content": "categoria", "dynamic": false, "spread": false }]], "params": [], "component": "/categoria", "pathname": "/categoria", "prerender": false, "redirect": "/it/categoria", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/cerca", "pattern": "^\\/cerca\\/?$", "segments": [[{ "content": "cerca", "dynamic": false, "spread": false }]], "params": [], "component": "/cerca", "pathname": "/cerca", "prerender": false, "redirect": "/it/cerca", "redirectRoute": { "route": "/it/cerca", "isIndex": true, "type": "page", "pattern": "^\\/it\\/cerca\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "cerca", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/cerca/index.astro", "pathname": "/it/cerca", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/collaboratori", "pattern": "^\\/chi-siamo\\/collaboratori\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "collaboratori", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/collaboratori", "pathname": "/chi-siamo/collaboratori", "prerender": false, "redirect": "/it/chi-siamo#collaboratori", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/contatti", "pattern": "^\\/chi-siamo\\/contatti\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "contatti", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/contatti", "pathname": "/chi-siamo/contatti", "prerender": false, "redirect": "/it/chi-siamo#contatti", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/hanno-scritto-per-noi", "pattern": "^\\/chi-siamo\\/hanno-scritto-per-noi\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "hanno-scritto-per-noi", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/hanno-scritto-per-noi", "pathname": "/chi-siamo/hanno-scritto-per-noi", "prerender": false, "redirect": "/it/chi-siamo#hanno-scritto-per-noi", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/la-redazione", "pattern": "^\\/chi-siamo\\/la-redazione\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-redazione", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/la-redazione", "pathname": "/chi-siamo/la-redazione", "prerender": false, "redirect": "/it/chi-siamo#la-redazione", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/la-rivista", "pattern": "^\\/chi-siamo\\/la-rivista\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-rivista", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/la-rivista", "pathname": "/chi-siamo/la-rivista", "prerender": false, "redirect": "/it/chi-siamo#la-rivista", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/redazione-storica", "pattern": "^\\/chi-siamo\\/redazione-storica\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "redazione-storica", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/redazione-storica", "pathname": "/chi-siamo/redazione-storica", "prerender": false, "redirect": "/it/chi-siamo#redazione-storica", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo", "pattern": "^\\/chi-siamo\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo", "pathname": "/chi-siamo", "prerender": false, "redirect": "/it/chi-siamo", "redirectRoute": { "route": "/it/chi-siamo", "isIndex": true, "type": "page", "pattern": "^\\/it\\/chi-siamo\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "chi-siamo", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/chi-siamo/index.astro", "pathname": "/it/chi-siamo", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/contribuisci", "pattern": "^\\/contribuisci\\/?$", "segments": [[{ "content": "contribuisci", "dynamic": false, "spread": false }]], "params": [], "component": "/contribuisci", "pathname": "/contribuisci", "prerender": false, "redirect": "/it/sostienici", "redirectRoute": { "route": "/it/sostienici", "isIndex": true, "type": "page", "pattern": "^\\/it\\/sostienici\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/sostienici/index.astro", "pathname": "/it/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/diari", "pattern": "^\\/diari\\/?$", "segments": [[{ "content": "diari", "dynamic": false, "spread": false }]], "params": [], "component": "/diari", "pathname": "/diari", "prerender": false, "redirect": "/it/diari", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/dona", "pattern": "^\\/dona\\/?$", "segments": [[{ "content": "dona", "dynamic": false, "spread": false }]], "params": [], "component": "/dona", "pathname": "/dona", "prerender": false, "redirect": "/it/sostienici", "redirectRoute": { "route": "/it/sostienici", "isIndex": true, "type": "page", "pattern": "^\\/it\\/sostienici\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/sostienici/index.astro", "pathname": "/it/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/newsletter", "pattern": "^\\/newsletter\\/?$", "segments": [[{ "content": "newsletter", "dynamic": false, "spread": false }]], "params": [], "component": "/newsletter", "pathname": "/newsletter", "prerender": false, "redirect": "/it/newsletter", "redirectRoute": { "route": "/it/newsletter", "isIndex": true, "type": "page", "pattern": "^\\/it\\/newsletter\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "newsletter", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/newsletter/index.astro", "pathname": "/it/newsletter", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/rubriche", "pattern": "^\\/rubriche\\/?$", "segments": [[{ "content": "rubriche", "dynamic": false, "spread": false }]], "params": [], "component": "/rubriche", "pathname": "/rubriche", "prerender": false, "redirect": "/it/rubriche", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/sostienici", "pattern": "^\\/sostienici\\/?$", "segments": [[{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "/sostienici", "pathname": "/sostienici", "prerender": false, "redirect": "/it/sostienici", "redirectRoute": { "route": "/it/sostienici", "isIndex": true, "type": "page", "pattern": "^\\/it\\/sostienici\\/?$", "segments": [[{ "content": "it", "dynamic": false, "spread": false }], [{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/it/sostienici/index.astro", "pathname": "/it/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/tag", "pattern": "^\\/tag\\/?$", "segments": [[{ "content": "tag", "dynamic": false, "spread": false }]], "params": [], "component": "/tag", "pathname": "/tag", "prerender": false, "redirect": "/it/tag", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }], "site": "https://ombreeluci.it", "base": "/", "trailingSlash": "ignore", "compressHTML": true, "componentMetadata": [["C:/Users/berto/Documents/Ombreeluci/src/pages/debug/audit-editoriale.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/focus/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/focus/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/focus/[vertical].astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/focus/[vertical].astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/[slug].astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/[slug].astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/404.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/about/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/archive/[issue].astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/archive/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/archive/web-only.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/authors/[slug].astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/authors/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/category/[slug].astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/diaries/[diario].astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/newsletter/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/search/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/sections/[slug].astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/sections/diaries.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/support-us/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/en/tag/[slug].astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/archivio/[issue].astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/archivio/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/archivio/web-only.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/autori/[slug].astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/autori/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/categoria/[categoria].astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/cerca/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/chi-siamo/collaboratori.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/chi-siamo/contatti.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/chi-siamo/hanno-scritto-per-noi.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/chi-siamo/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/chi-siamo/la-redazione.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/chi-siamo/la-rivista.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/chi-siamo/redazione-storica.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/diari/[diario].astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/newsletter/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/rubriche/[rubrica].astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/rubriche/diari.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/sostienici/index.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/it/tag/[slug].astro", { "propagation": "none", "containsHead": true }]], "renderers": [], "clientDirectives": [["idle", '(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value=="object"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};"requestIdleCallback"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event("astro:idle"));})();'], ["load", '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event("astro:load"));})();'], ["media", '(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener("change",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event("astro:media"));})();'], ["only", '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event("astro:only"));})();'], ["visible", '(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value=="object"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event("astro:visible"));})();']], "entryModules": { "\0@astro-renderers": "renderers.mjs", "\0@astrojs-ssr-virtual-entry": "index.js", "\0@astro-page:node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint@_@js": "pages/_image.astro.mjs", "\0@astro-page:src/pages/404@_@astro": "pages/404.astro.mjs", "\0@astro-page:src/pages/api/commento@_@ts": "pages/api/commento.astro.mjs", "\0@astro-page:src/pages/api/health@_@ts": "pages/api/health.astro.mjs", "\0@astro-page:src/pages/api/revalidate@_@ts": "pages/api/revalidate.astro.mjs", "\0@astro-page:src/pages/debug/audit-editoriale@_@astro": "pages/debug/audit-editoriale.astro.mjs", "\0@astro-page:src/pages/en/about/index@_@astro": "pages/en/about.astro.mjs", "\0@astro-page:src/pages/en/archive/web-only@_@astro": "pages/en/archive/web-only.astro.mjs", "\0@astro-page:src/pages/en/archive/[issue]@_@astro": "pages/en/archive/_issue_.astro.mjs", "\0@astro-page:src/pages/en/archive/index@_@astro": "pages/en/archive.astro.mjs", "\0@astro-page:src/pages/en/authors/[slug]@_@astro": "pages/en/authors/_slug_.astro.mjs", "\0@astro-page:src/pages/en/authors/index@_@astro": "pages/en/authors.astro.mjs", "\0@astro-page:src/pages/en/category/[slug]@_@astro": "pages/en/category/_slug_.astro.mjs", "\0@astro-page:src/pages/en/diaries/[diario]@_@astro": "pages/en/diaries/_diario_.astro.mjs", "\0@astro-page:src/pages/en/focus/[vertical]@_@astro": "pages/en/focus/_vertical_.astro.mjs", "\0@astro-page:src/pages/en/focus/index@_@astro": "pages/en/focus.astro.mjs", "\0@astro-page:src/pages/en/newsletter/index@_@astro": "pages/en/newsletter.astro.mjs", "\0@astro-page:src/pages/en/search/index@_@astro": "pages/en/search.astro.mjs", "\0@astro-page:src/pages/en/sections/diaries@_@astro": "pages/en/sections/diaries.astro.mjs", "\0@astro-page:src/pages/en/sections/[slug]@_@astro": "pages/en/sections/_slug_.astro.mjs", "\0@astro-page:src/pages/en/support-us/index@_@astro": "pages/en/support-us.astro.mjs", "\0@astro-page:src/pages/en/tag/[slug]@_@astro": "pages/en/tag/_slug_.astro.mjs", "\0@astro-page:src/pages/en/[slug]@_@astro": "pages/en/_slug_.astro.mjs", "\0@astro-page:src/pages/en/index@_@astro": "pages/en.astro.mjs", "\0@astro-page:src/pages/it/archivio/web-only@_@astro": "pages/it/archivio/web-only.astro.mjs", "\0@astro-page:src/pages/it/archivio/[issue]@_@astro": "pages/it/archivio/_issue_.astro.mjs", "\0@astro-page:src/pages/it/archivio/index@_@astro": "pages/it/archivio.astro.mjs", "\0@astro-page:src/pages/it/autori/[slug]@_@astro": "pages/it/autori/_slug_.astro.mjs", "\0@astro-page:src/pages/it/autori/index@_@astro": "pages/it/autori.astro.mjs", "\0@astro-page:src/pages/it/categoria/[categoria]@_@astro": "pages/it/categoria/_categoria_.astro.mjs", "\0@astro-page:src/pages/it/cerca/index@_@astro": "pages/it/cerca.astro.mjs", "\0@astro-page:src/pages/it/chi-siamo/collaboratori@_@astro": "pages/it/chi-siamo/collaboratori.astro.mjs", "\0@astro-page:src/pages/it/chi-siamo/contatti@_@astro": "pages/it/chi-siamo/contatti.astro.mjs", "\0@astro-page:src/pages/it/chi-siamo/hanno-scritto-per-noi@_@astro": "pages/it/chi-siamo/hanno-scritto-per-noi.astro.mjs", "\0@astro-page:src/pages/it/chi-siamo/la-redazione@_@astro": "pages/it/chi-siamo/la-redazione.astro.mjs", "\0@astro-page:src/pages/it/chi-siamo/la-rivista@_@astro": "pages/it/chi-siamo/la-rivista.astro.mjs", "\0@astro-page:src/pages/it/chi-siamo/redazione-storica@_@astro": "pages/it/chi-siamo/redazione-storica.astro.mjs", "\0@astro-page:src/pages/it/chi-siamo/index@_@astro": "pages/it/chi-siamo.astro.mjs", "\0@astro-page:src/pages/it/diari/[diario]@_@astro": "pages/it/diari/_diario_.astro.mjs", "\0@astro-page:src/pages/it/focus/[vertical]@_@astro": "pages/it/focus/_vertical_.astro.mjs", "\0@astro-page:src/pages/it/focus/index@_@astro": "pages/it/focus.astro.mjs", "\0@astro-page:src/pages/it/newsletter/index@_@astro": "pages/it/newsletter.astro.mjs", "\0@astro-page:src/pages/it/rubriche/diari@_@astro": "pages/it/rubriche/diari.astro.mjs", "\0@astro-page:src/pages/it/rubriche/[rubrica]@_@astro": "pages/it/rubriche/_rubrica_.astro.mjs", "\0@astro-page:src/pages/it/sostienici/index@_@astro": "pages/it/sostienici.astro.mjs", "\0@astro-page:src/pages/it/tag/[slug]@_@astro": "pages/it/tag/_slug_.astro.mjs", "\0@astro-page:src/pages/sitemap-en.xml@_@ts": "pages/sitemap-en.xml.astro.mjs", "\0@astro-page:src/pages/sitemap.xml@_@ts": "pages/sitemap.xml.astro.mjs", "\0@astro-page:src/pages/index@_@astro": "pages/index.astro.mjs", "\0@astro-page:src/pages/it/[slug]@_@astro": "pages/it/_slug_.astro.mjs", "\0astro-internal:middleware": "_astro-internal_middleware.mjs", "\0@astrojs-ssr-adapter": "_@astrojs-ssr-adapter.mjs", "\0@astrojs-manifest": "manifest_CCCchbwS.mjs", "/astro/hoisted.js?q=0": "_astro/hoisted.Bzxfz9W0.js", "/astro/hoisted.js?q=1": "_astro/hoisted.qY93NfUQ.js", "/astro/hoisted.js?q=2": "_astro/hoisted.BzlxTpOc.js", "/astro/hoisted.js?q=3": "_astro/hoisted.BL1IAVw8.js", "/astro/hoisted.js?q=4": "_astro/hoisted.DuObhAQi.js", "/astro/hoisted.js?q=6": "_astro/hoisted.Cn5elTKZ.js", "/astro/hoisted.js?q=8": "_astro/hoisted.CZJdWQZo.js", "/astro/hoisted.js?q=9": "_astro/hoisted.jUkLh9Q4.js", "/astro/hoisted.js?q=10": "_astro/hoisted.D5DgLiAL.js", "/astro/hoisted.js?q=5": "_astro/hoisted.CYzbElsG.js", "/astro/hoisted.js?q=7": "_astro/hoisted.CsiVuUHd.js", "/astro/hoisted.js?q=11": "_astro/hoisted.DS1k1ekx.js", "astro:scripts/before-hydration.js": "" }, "inlinedScripts": [], "assets": ["/_astro/logo.Cb_mP9bA.svg", "/_astro/index.D7zdi2fC.css", "/_astro/index.uAf6b_-F.css", "/_astro/_issue_.Cvzu07BQ.css", "/_astro/_vertical_.DZVcoGUu.css", "/_astro/index.DfAQefRW.css", "/_astro/index.DAXjW4si.css", "/_astro/_slug_.DxSNQG-0.css", "/_astro/index.BukyBK5y.css", "/correlati.json", "/cta-numero.png", "/cta-numero.webp", "/favicon.ico", "/favicon.png", "/favicon.svg", "/logo-bianco.svg", "/robots.txt", "/_headers", "/admin/config.yml", "/fonts/raleway-900-latin.woff2", "/fonts/raleway-latin.woff2", "/images/avatar-default.png", "/images/avatar-default.svg", "/images/dona1.webp", "/images/dona2.webp", "/images/dona3.webp", "/images/dona4.webp", "/images/dona7.webp", "/images/focus-cover-aktiont4.jpg", "/images/focus-cover-autismo.jpg", "/images/focus-cover-cinema-e-disabilita-Ombre-e-Luci.jpg", "/images/focus-cover-noi-papa.jpg", "/images/icon-translate.svg", "/images/icon-translate2.svg", "/images/mariangela-cover.jpg", "/images/placeholder-copertina.svg", "/placeholder/ph-1.jpg", "/placeholder/ph-2.jpg", "/placeholder/ph-3.jpg", "/placeholder/ph-4.jpg", "/_astro/EditorialFeedback.astro_astro_type_script_index_0_lang.D6qUwD0l.js", "/_astro/hoisted.BL1IAVw8.js", "/_astro/hoisted.BzlxTpOc.js", "/_astro/hoisted.Bzxfz9W0.js", "/_astro/hoisted.Cn5elTKZ.js", "/_astro/hoisted.CsiVuUHd.js", "/_astro/hoisted.CYzbElsG.js", "/_astro/hoisted.CZJdWQZo.js", "/_astro/hoisted.D5DgLiAL.js", "/_astro/hoisted.DS1k1ekx.js", "/_astro/hoisted.DuObhAQi.js", "/_astro/hoisted.jUkLh9Q4.js", "/_astro/hoisted.qY93NfUQ.js", "/_worker.js/index.js", "/_worker.js/renderers.mjs", "/_worker.js/_@astrojs-ssr-adapter.mjs", "/_worker.js/_astro-internal_middleware.mjs", "/images/redazione/alessandro-de-simone.jpg", "/images/redazione/benedetta-mattei.png", "/images/redazione/claudio-cinus.jpg", "/images/redazione/cristina-tersigni.webp", "/images/redazione/don-marco-bove.jpg", "/images/redazione/enrica-riera.png", "/images/redazione/franco-manuzio.jpg", "/images/redazione/giovanni-grossi.png", "/images/redazione/giulia-galeotti.webp", "/images/redazione/laura-coccia.jpg", "/images/redazione/maria-teresa-mazzarotto.jpg", "/images/redazione/mariangela-bertolini.png", "/images/redazione/matteo-cinti.png", "/images/redazione/natalia-livi.jpg", "/images/redazione/nicla-bettazzi.jpg", "/images/redazione/nicole-schulthes.jpg", "/images/redazione/rita-massi.png", "/images/redazione/serena-sillitto.png", "/images/redazione/sergio-sciascia.jpg", "/images/redazione/silvia-camisasca.jpg", "/images/redazione/silvia-gusmani.jpg", "/_worker.js/chunks/AboutSidebar_B_tU1dYE.mjs", "/_worker.js/chunks/ArchivioContent_Bk6fbGon.mjs", "/_worker.js/chunks/ArticleCard_BcaTyrt5.mjs", "/_worker.js/chunks/articoli-build_COE8sDqu.mjs", "/_worker.js/chunks/ArticoliRullo_BlaFCqIC.mjs", "/_worker.js/chunks/astro-designed-error-pages_CROwsZzW.mjs", "/_worker.js/chunks/astro_CfK_qaqS.mjs", "/_worker.js/chunks/AuthorPageContent_CMzGbiRI.mjs", "/_worker.js/chunks/BaseLayout_DOaiilqT.mjs", "/_worker.js/chunks/CategoriaPageContent_BuRN22sl.mjs", "/_worker.js/chunks/CercaContent_Bg3rjdjI.mjs", "/_worker.js/chunks/ChiSiamoContent_DOR1yAku.mjs", "/_worker.js/chunks/CTAArchivio_BQP5Iqe3.mjs", "/_worker.js/chunks/CTAArticolo_BKGMbCaw.mjs", "/_worker.js/chunks/cta_BwIVYshf.mjs", "/_worker.js/chunks/DiariContent_DAW6wMK_.mjs", "/_worker.js/chunks/DiarioContent_C1rxamjx.mjs", "/_worker.js/chunks/diari_Dj7YOE7n.mjs", "/_worker.js/chunks/directus_BvF_bImd.mjs", "/_worker.js/chunks/FocusListingContent_a_RLfekd.mjs", "/_worker.js/chunks/Footer_DN9MDnF9.mjs", "/_worker.js/chunks/HomePageContent_DfL8WbzG.mjs", "/_worker.js/chunks/index_CGzEFjN-.mjs", "/_worker.js/chunks/IssueCard_5eFNVZLY.mjs", "/_worker.js/chunks/IssueContent_BtamaNxI.mjs", "/_worker.js/chunks/NewsletterContent_DnVhTG9B.mjs", "/_worker.js/chunks/noop-middleware_DR80vEV7.mjs", "/_worker.js/chunks/RubricaPageContent_Btsy_OLg.mjs", "/_worker.js/chunks/rubriche_BEVwGLjw.mjs", "/_worker.js/chunks/SostienicContent_51d0BrZM.mjs", "/_worker.js/chunks/taxonomy_BacsMRxg.mjs", "/_worker.js/chunks/VerticaleContent_BfppTksE.mjs", "/_worker.js/pages/404.astro.mjs", "/_worker.js/pages/en.astro.mjs", "/_worker.js/pages/index.astro.mjs", "/_worker.js/pages/sitemap-en.xml.astro.mjs", "/_worker.js/pages/sitemap.xml.astro.mjs", "/_worker.js/pages/_image.astro.mjs", "/_worker.js/_astro/index.BukyBK5y.css", "/_worker.js/_astro/index.D7zdi2fC.css", "/_worker.js/_astro/index.DAXjW4si.css", "/_worker.js/_astro/index.DfAQefRW.css", "/_worker.js/_astro/index.uAf6b_-F.css", "/_worker.js/_astro/logo.Cb_mP9bA.svg", "/_worker.js/_astro/_issue_.Cvzu07BQ.css", "/_worker.js/_astro/_slug_.DxSNQG-0.css", "/_worker.js/_astro/_vertical_.DZVcoGUu.css", "/_worker.js/chunks/astro/env-setup_nxDOIah1.mjs", "/_worker.js/chunks/astro/server_BT9XwReg.mjs", "/_worker.js/pages/api/commento.astro.mjs", "/_worker.js/pages/api/health.astro.mjs", "/_worker.js/pages/api/revalidate.astro.mjs", "/_worker.js/pages/debug/audit-editoriale.astro.mjs", "/_worker.js/pages/en/about.astro.mjs", "/_worker.js/pages/en/archive.astro.mjs", "/_worker.js/pages/en/authors.astro.mjs", "/_worker.js/pages/en/focus.astro.mjs", "/_worker.js/pages/en/newsletter.astro.mjs", "/_worker.js/pages/en/search.astro.mjs", "/_worker.js/pages/en/support-us.astro.mjs", "/_worker.js/pages/en/_slug_.astro.mjs", "/_worker.js/pages/it/archivio.astro.mjs", "/_worker.js/pages/it/autori.astro.mjs", "/_worker.js/pages/it/cerca.astro.mjs", "/_worker.js/pages/it/chi-siamo.astro.mjs", "/_worker.js/pages/it/focus.astro.mjs", "/_worker.js/pages/it/newsletter.astro.mjs", "/_worker.js/pages/it/sostienici.astro.mjs", "/_worker.js/pages/it/_slug_.astro.mjs", "/_worker.js/pages/en/archive/web-only.astro.mjs", "/_worker.js/pages/en/archive/_issue_.astro.mjs", "/_worker.js/pages/en/authors/_slug_.astro.mjs", "/_worker.js/pages/en/category/_slug_.astro.mjs", "/_worker.js/pages/en/diaries/_diario_.astro.mjs", "/_worker.js/pages/en/focus/_vertical_.astro.mjs", "/_worker.js/pages/en/sections/diaries.astro.mjs", "/_worker.js/pages/en/sections/_slug_.astro.mjs", "/_worker.js/pages/en/tag/_slug_.astro.mjs", "/_worker.js/pages/it/archivio/web-only.astro.mjs", "/_worker.js/pages/it/archivio/_issue_.astro.mjs", "/_worker.js/pages/it/autori/_slug_.astro.mjs", "/_worker.js/pages/it/categoria/_categoria_.astro.mjs", "/_worker.js/pages/it/chi-siamo/collaboratori.astro.mjs", "/_worker.js/pages/it/chi-siamo/contatti.astro.mjs", "/_worker.js/pages/it/chi-siamo/hanno-scritto-per-noi.astro.mjs", "/_worker.js/pages/it/chi-siamo/la-redazione.astro.mjs", "/_worker.js/pages/it/chi-siamo/la-rivista.astro.mjs", "/_worker.js/pages/it/chi-siamo/redazione-storica.astro.mjs", "/_worker.js/pages/it/diari/_diario_.astro.mjs", "/_worker.js/pages/it/focus/_vertical_.astro.mjs", "/_worker.js/pages/it/rubriche/diari.astro.mjs", "/_worker.js/pages/it/rubriche/_rubrica_.astro.mjs", "/_worker.js/pages/it/tag/_slug_.astro.mjs", "/404.html", "/debug/audit-editoriale/index.html", "/en/about/index.html", "/en/archive/web-only/index.html", "/en/archive/index.html", "/en/authors/index.html", "/en/focus/index.html", "/en/newsletter/index.html", "/en/search/index.html", "/en/sections/diaries/index.html", "/en/support-us/index.html", "/en/index.html", "/it/archivio/web-only/index.html", "/it/archivio/index.html", "/it/autori/index.html", "/it/cerca/index.html", "/it/chi-siamo/collaboratori/index.html", "/it/chi-siamo/contatti/index.html", "/it/chi-siamo/hanno-scritto-per-noi/index.html", "/it/chi-siamo/la-redazione/index.html", "/it/chi-siamo/la-rivista/index.html", "/it/chi-siamo/redazione-storica/index.html", "/it/chi-siamo/index.html", "/it/focus/index.html", "/it/newsletter/index.html", "/it/rubriche/diari/index.html", "/it/sostienici/index.html", "/sitemap-en.xml", "/sitemap.xml", "/index.html"], "buildFormat": "directory", "checkOrigin": false, "serverIslandNameMap": [], "key": "T4IhWwQElE3cMus9cqMz0UFNjZutI+K4ZEbSVCd8g4g=", "experimentalEnvGetSecretEnabled": false });

// .wrangler/tmp/pages-JtB0w2/bundledWorker-0.2298977654712444.mjs
var __defProp8 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp8(target, "name", { value, configurable: true }), "__name");
globalThis.process ??= {};
globalThis.process.env ??= {};
var _page0 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_image_astro(), image_astro_exports)), "_page0");
var _page1 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_astro(), astro_exports)), "_page1");
var _page22 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_commento_astro(), commento_astro_exports)), "_page2");
var _page32 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_health_astro(), health_astro_exports)), "_page3");
var _page42 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_revalidate_astro(), revalidate_astro_exports)), "_page4");
var _page52 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_audit_editoriale_astro(), audit_editoriale_astro_exports)), "_page5");
var _page62 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_about_astro(), about_astro_exports)), "_page6");
var _page72 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_web_only_astro(), web_only_astro_exports)), "_page7");
var _page82 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_issue_astro(), issue_astro_exports)), "_page8");
var _page92 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_archive_astro(), archive_astro_exports)), "_page9");
var _page102 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_slug_astro(), slug_astro_exports)), "_page10");
var _page112 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_authors_astro(), authors_astro_exports)), "_page11");
var _page122 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_slug_astro2(), slug_astro_exports2)), "_page12");
var _page13 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_diario_astro(), diario_astro_exports)), "_page13");
var _page14 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_vertical_astro(), vertical_astro_exports)), "_page14");
var _page15 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_focus_astro(), focus_astro_exports)), "_page15");
var _page16 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_newsletter_astro(), newsletter_astro_exports)), "_page16");
var _page17 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_search_astro(), search_astro_exports)), "_page17");
var _page18 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_diaries_astro(), diaries_astro_exports)), "_page18");
var _page19 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_slug_astro3(), slug_astro_exports3)), "_page19");
var _page20 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_support_us_astro(), support_us_astro_exports)), "_page20");
var _page21 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_slug_astro4(), slug_astro_exports4)), "_page21");
var _page222 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_slug_astro5(), slug_astro_exports5)), "_page22");
var _page23 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_en_astro(), en_astro_exports)), "_page23");
var _page24 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_web_only_astro2(), web_only_astro_exports2)), "_page24");
var _page25 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_issue_astro2(), issue_astro_exports2)), "_page25");
var _page26 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_archivio_astro(), archivio_astro_exports)), "_page26");
var _page27 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_slug_astro6(), slug_astro_exports6)), "_page27");
var _page28 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_autori_astro(), autori_astro_exports)), "_page28");
var _page29 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_categoria_astro(), categoria_astro_exports)), "_page29");
var _page30 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_cerca_astro(), cerca_astro_exports)), "_page30");
var _page31 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_collaboratori_astro(), collaboratori_astro_exports)), "_page31");
var _page322 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_contatti_astro(), contatti_astro_exports)), "_page32");
var _page33 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_hanno_scritto_per_noi_astro(), hanno_scritto_per_noi_astro_exports)), "_page33");
var _page34 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_la_redazione_astro(), la_redazione_astro_exports)), "_page34");
var _page35 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_la_rivista_astro(), la_rivista_astro_exports)), "_page35");
var _page36 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_redazione_storica_astro(), redazione_storica_astro_exports)), "_page36");
var _page37 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_chi_siamo_astro(), chi_siamo_astro_exports)), "_page37");
var _page38 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_diario_astro2(), diario_astro_exports2)), "_page38");
var _page39 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_vertical_astro2(), vertical_astro_exports2)), "_page39");
var _page40 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_focus_astro2(), focus_astro_exports2)), "_page40");
var _page41 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_newsletter_astro2(), newsletter_astro_exports2)), "_page41");
var _page422 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_diari_astro(), diari_astro_exports)), "_page42");
var _page43 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_rubrica_astro(), rubrica_astro_exports)), "_page43");
var _page44 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_sostienici_astro(), sostienici_astro_exports)), "_page44");
var _page45 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_slug_astro7(), slug_astro_exports7)), "_page45");
var _page46 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_slug_astro8(), slug_astro_exports8)), "_page46");
var _page47 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_sitemap_en_xml_astro(), sitemap_en_xml_astro_exports)), "_page47");
var _page48 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_sitemap_xml_astro(), sitemap_xml_astro_exports)), "_page48");
var _page49 = /* @__PURE__ */ __name2(() => Promise.resolve().then(() => (init_index_astro(), index_astro_exports)), "_page49");
var pageMap = /* @__PURE__ */ new Map([
  ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
  ["src/pages/404.astro", _page1],
  ["src/pages/api/commento.ts", _page22],
  ["src/pages/api/health.ts", _page32],
  ["src/pages/api/revalidate.ts", _page42],
  ["src/pages/debug/audit-editoriale.astro", _page52],
  ["src/pages/en/about/index.astro", _page62],
  ["src/pages/en/archive/web-only.astro", _page72],
  ["src/pages/en/archive/[issue].astro", _page82],
  ["src/pages/en/archive/index.astro", _page92],
  ["src/pages/en/authors/[slug].astro", _page102],
  ["src/pages/en/authors/index.astro", _page112],
  ["src/pages/en/category/[slug].astro", _page122],
  ["src/pages/en/diaries/[diario].astro", _page13],
  ["src/pages/en/focus/[vertical].astro", _page14],
  ["src/pages/en/focus/index.astro", _page15],
  ["src/pages/en/newsletter/index.astro", _page16],
  ["src/pages/en/search/index.astro", _page17],
  ["src/pages/en/sections/diaries.astro", _page18],
  ["src/pages/en/sections/[slug].astro", _page19],
  ["src/pages/en/support-us/index.astro", _page20],
  ["src/pages/en/tag/[slug].astro", _page21],
  ["src/pages/en/[slug].astro", _page222],
  ["src/pages/en/index.astro", _page23],
  ["src/pages/it/archivio/web-only.astro", _page24],
  ["src/pages/it/archivio/[issue].astro", _page25],
  ["src/pages/it/archivio/index.astro", _page26],
  ["src/pages/it/autori/[slug].astro", _page27],
  ["src/pages/it/autori/index.astro", _page28],
  ["src/pages/it/categoria/[categoria].astro", _page29],
  ["src/pages/it/cerca/index.astro", _page30],
  ["src/pages/it/chi-siamo/collaboratori.astro", _page31],
  ["src/pages/it/chi-siamo/contatti.astro", _page322],
  ["src/pages/it/chi-siamo/hanno-scritto-per-noi.astro", _page33],
  ["src/pages/it/chi-siamo/la-redazione.astro", _page34],
  ["src/pages/it/chi-siamo/la-rivista.astro", _page35],
  ["src/pages/it/chi-siamo/redazione-storica.astro", _page36],
  ["src/pages/it/chi-siamo/index.astro", _page37],
  ["src/pages/it/diari/[diario].astro", _page38],
  ["src/pages/it/focus/[vertical].astro", _page39],
  ["src/pages/it/focus/index.astro", _page40],
  ["src/pages/it/newsletter/index.astro", _page41],
  ["src/pages/it/rubriche/diari.astro", _page422],
  ["src/pages/it/rubriche/[rubrica].astro", _page43],
  ["src/pages/it/sostienici/index.astro", _page44],
  ["src/pages/it/tag/[slug].astro", _page45],
  ["src/pages/it/[slug].astro", _page46],
  ["src/pages/sitemap-en.xml.ts", _page47],
  ["src/pages/sitemap.xml.ts", _page48],
  ["src/pages/index.astro", _page49]
]);
var serverIslandMap = /* @__PURE__ */ new Map();
var _manifest2 = Object.assign(manifest, {
  pageMap,
  serverIslandMap,
  renderers,
  middleware: () => Promise.resolve().then(() => (init_astro_internal_middleware(), astro_internal_middleware_exports))
});
var _exports = createExports(_manifest2);
var __astrojsSsrVirtualEntry = _exports.default;

// node_modules/wrangler/templates/pages-dev-util.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
function isRoutingRuleMatch(pathname, routingRule) {
  if (!pathname) {
    throw new Error("Pathname is undefined.");
  }
  if (!routingRule) {
    throw new Error("Routing rule is undefined.");
  }
  const ruleRegExp = transformRoutingRuleToRegExp(routingRule);
  return pathname.match(ruleRegExp) !== null;
}
__name(isRoutingRuleMatch, "isRoutingRuleMatch");
function transformRoutingRuleToRegExp(rule) {
  let transformedRule;
  if (rule === "/" || rule === "/*") {
    transformedRule = rule;
  } else if (rule.endsWith("/*")) {
    transformedRule = `${rule.substring(0, rule.length - 2)}(/*)?`;
  } else if (rule.endsWith("/")) {
    transformedRule = `${rule.substring(0, rule.length - 1)}(/)?`;
  } else if (rule.endsWith("*")) {
    transformedRule = rule;
  } else {
    transformedRule = `${rule}(/)?`;
  }
  transformedRule = `^${transformedRule.replaceAll(/\./g, "\\.").replaceAll(/\*/g, ".*")}$`;
  return new RegExp(transformedRule);
}
__name(transformRoutingRuleToRegExp, "transformRoutingRuleToRegExp");

// .wrangler/tmp/pages-JtB0w2/zo4wolx9zu.js
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
        const workerAsHandler = __astrojsSsrVirtualEntry;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error2 = reduceError(e);
    return Response.json(error2, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-zhChnV/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_dev_pipeline_default;

// node_modules/wrangler/templates/middleware/common.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-zhChnV/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init2) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init2.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init2) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init2.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default,
  pageMap
};
/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
//# sourceMappingURL=zo4wolx9zu.js.map
