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

// _worker.js/chunks/astro/server_CgTYz_Tl.mjs
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
    site: void 0,
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
  const { renderers: renderers16, clientDirectives } = result;
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
  const validRenderers = renderers16.filter((r2) => r2.name !== "astro:jsx");
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
      renderer = renderers16.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error2;
      for (const r2 of renderers16) {
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
        renderer = renderers16.find(
          ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
        );
      }
    }
    if (!renderer && validRenderers.length === 1) {
      renderer = validRenderers[0];
    }
    if (!renderer) {
      const extname = metadata.componentUrl?.split(".").pop();
      renderer = renderers16.find(({ name }) => name === `@astrojs/${extname}` || name === extname);
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
var init_server_CgTYz_Tl = __esm({
  "_worker.js/chunks/astro/server_CgTYz_Tl.mjs"() {
    "use strict";
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

// _worker.js/chunks/astro-designed-error-pages_DfD573yd.mjs
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
    let json;
    try {
      json = JSON.parse(res.body);
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
      return { error: ActionError.fromJson(json), data: void 0 };
    } else {
      const error2 = ActionError.fromJson(json);
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
var init_astro_designed_error_pages_DfD573yd = __esm({
  "_worker.js/chunks/astro-designed-error-pages_DfD573yd.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
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
    __vite_import_meta_env__ = { "ASSETS_PREFIX": void 0, "BASE_URL": "/", "DEV": false, "DIRECTUS_TOKEN": "nBZ6kdd0YgVnhLm2TZEDoT9A-NJujwVU", "DIRECTUS_URL": "http://159.69.196.64:8055", "MEDIA_BASE_URL": "https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev", "MODE": "production", "PROD": true, "PUBLIC_KEYSTATIC_GITHUB_APP_SLUG": "keystatic-ombreeluci", "SITE": void 0, "SSR": true };
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

// _worker.js/chunks/index_B-gW6nkE.mjs
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
  routes,
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
  for (const route of routes) {
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
    const custom404 = routes.find((route) => route.route === "/404");
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
var init_index_B_gW6nkE = __esm({
  "_worker.js/chunks/index_B-gW6nkE.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    init_astro_designed_error_pages_DfD573yd();
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
        const { clientDirectives, inlinedScripts, compressHTML, manifest: manifest2, renderers: renderers16, resolve } = pipeline;
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
          renderers: renderers16,
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

// _worker.js/chunks/ViewTransitions_Dvx2U5F3.mjs
var $$Astro, $$ViewTransitions;
var init_ViewTransitions_Dvx2U5F3 = __esm({
  "_worker.js/chunks/ViewTransitions_Dvx2U5F3.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro = createAstro();
    $$ViewTransitions = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
      Astro2.self = $$ViewTransitions;
      const { fallback = "animate" } = Astro2.props;
      return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>`;
    }, "C:/Users/berto/Documents/Ombreeluci/node_modules/astro/components/ViewTransitions.astro", void 0);
  }
});

// _worker.js/chunks/Footer_D9bdzLvP.mjs
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
function getLabels(wp_tags, articolo) {
  const tags = Array.isArray(wp_tags) ? wp_tags : wp_tags != null && typeof wp_tags === "string" ? [wp_tags] : [];
  let formal = FORMAL_FALLBACK;
  if (articolo?.forma) {
    formal = articolo.forma;
  } else {
    for (const tag of tags) {
      const n = normalize(tag);
      if (n && TAG_TO_FORMAL[n]) {
        formal = TAG_TO_FORMAL[n];
        break;
      }
    }
  }
  const thematic = articolo?.categoria_menu || articolo?.tema_label || THEMATIC_FALLBACK;
  return { formal, thematic };
}
function getMegaclusterForArticle(articolo) {
  return {
    tema_label: articolo?.tema_label ?? null,
    categoria_menu: articolo?.categoria_menu ?? articolo?.tema_label ?? null,
    ruolo_editoriale: articolo?.ruolo_editoriale ?? null
  };
}
function getCategorySlugForArticle(articolo) {
  if (!articolo?.tema_label)
    return null;
  const slug = Object.keys(SLUG_TO_TEMA).find((s) => SLUG_TO_TEMA[s] === articolo.tema_label);
  return slug ?? slugifyLabel(articolo.tema_label);
}
function getThemesWithSlugs() {
  return MEGACLUSTER_TEMI.map((temaLabel) => {
    const slug = Object.keys(SLUG_TO_TEMA).find((s) => SLUG_TO_TEMA[s] === temaLabel) || slugifyLabel(temaLabel);
    const nome = TEMA_TO_CATEGORIA[temaLabel] ?? getThemeDisplayName(temaLabel) ?? temaLabel;
    return { nome, slug, nomeCompleto: temaLabel };
  });
}
function slugifyLabel(label) {
  return String(label).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
var logo, id_numero, copertina_url, titolo_numero, numero_progressivo, anno_pubblicazione, periodo_label, ultimoNumeroData, slugToTema, temaToCategoria, megaclusterTemi, taxonomyData, SLUG_TO_TEMA, TEMA_TO_CATEGORIA, MEGACLUSTER_TEMI, FORMAL_FALLBACK, THEMATIC_FALLBACK, EDITORIAL_WEIGHTS, THEME_ALIASES, TAG_TO_FORMAL, translations, $$Astro$2, $$LanguageSelector, $$Astro$1, $$Header, PAYPAL_DONATE_URL, CF, CODICE_FISCALE, RUNTS, INTESTATARIO, IBAN_RAW, IBAN_DISPLAY, CCP, CCP_DISPLAY, EMAIL, AMOUNT_CHIPS, ABBONAMENTO_ANNO, ABBONAMENTO_MESE, NUMERI_ANNO, __freeze, __defProp2, __template, _a, $$Astro2, $$Footer;
var init_Footer_D9bdzLvP = __esm({
  "_worker.js/chunks/Footer_D9bdzLvP.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
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
    id_numero = "OEL-172";
    copertina_url = "https://www.ombreeluci.it/wp-content/uploads/2025/12/Copertina_OeL_172_2025.jpg";
    titolo_numero = "Paradigma Pompei";
    numero_progressivo = 172;
    anno_pubblicazione = 2025;
    periodo_label = "Ottobre \u2013 Novembre";
    ultimoNumeroData = {
      id_numero,
      copertina_url,
      titolo_numero,
      numero_progressivo,
      anno_pubblicazione,
      periodo_label
    };
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
    SLUG_TO_TEMA = taxonomyData.slugToTema;
    TEMA_TO_CATEGORIA = taxonomyData.temaToCategoria;
    MEGACLUSTER_TEMI = taxonomyData.megaclusterTemi;
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
    __name(getMegaclusterForArticle, "getMegaclusterForArticle");
    __name(getCategorySlugForArticle, "getCategorySlugForArticle");
    __name(getThemesWithSlugs, "getThemesWithSlugs");
    __name(slugifyLabel, "slugifyLabel");
    translations = {
      it: {
        read_also: "LEGGI ANCHE",
        english_articles: "Articoli in inglese",
        back_to_home: "Torna all'archivio",
        nav_archive: "Archivio",
        nav_archive_full: "Archivio completo",
        nav_latest: "Ultimi articoli",
        nav_authors: "Autori",
        nav_about: "Chi siamo",
        nav_newsletter: "Newsletter",
        nav_contribute: "Contribuisci",
        nav_menu: "Men\xF9",
        nav_menu_open: "Apri menu",
        nav_menu_close: "Chiudi menu",
        nav_themes: "Temi",
        nav_sections: "Sezioni",
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
        footer_edited_by: "Edito da"
      },
      en: {
        read_also: "READ ALSO",
        english_articles: "English articles",
        back_to_home: "Back to archive",
        nav_archive: "Archive",
        nav_archive_full: "Full archive",
        nav_latest: "Latest articles",
        nav_authors: "Authors",
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
        footer_edited_by: "Published by"
      }
    };
    __name(getLangFromUrl, "getLangFromUrl");
    __name(t, "t");
    $$Astro$2 = createAstro();
    $$LanguageSelector = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
      Astro2.self = $$LanguageSelector;
      const { pathname, alternateArticleUrl = null } = Astro2.props;
      const lang = getLangFromUrl(pathname);
      const hrefIt = lang === "en" && alternateArticleUrl ? alternateArticleUrl : "/";
      const hrefEn = lang === "it" && alternateArticleUrl ? alternateArticleUrl : "/blog/en";
      return renderTemplate`${maybeRenderHead()}<div class="lang-selector" aria-label="Selezione lingua" data-astro-cid-ltpqzwiw> <a${addAttribute(hrefIt, "href")}${addAttribute(["lang-link", [lang === "it" && "is-active"]], "class:list")} data-astro-cid-ltpqzwiw>IT</a> <span class="lang-sep" aria-hidden="true" data-astro-cid-ltpqzwiw>|</span> <a${addAttribute(hrefEn, "href")}${addAttribute(["lang-link", [lang === "en" && "is-active"]], "class:list")} data-astro-cid-ltpqzwiw>EN</a> </div>  `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/LanguageSelector.astro", void 0);
    $$Astro$1 = createAstro();
    $$Header = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
      Astro2.self = $$Header;
      const { pathname = Astro2.url.pathname, alternateArticleUrl = null } = Astro2.props;
      const lang = getLangFromUrl(pathname);
      const ultimoNumero = ultimoNumeroData;
      const temi = getThemesWithSlugs().filter((t2) => t2.nomeCompleto !== "Personaggi che ispirano");
      const sezioniForme = [
        { nome: t(lang, "footer_editorials"), href: "/categoria/editoriali" },
        { nome: t(lang, "footer_testimonials"), href: "/categoria/testimonianze" },
        { nome: t(lang, "footer_interviews"), href: "/categoria/interviste" },
        { nome: t(lang, "footer_reviews"), href: "/categoria/recensioni" },
        { nome: t(lang, "footer_diari"), href: "/sezioni/diari" },
        { nome: "Dialogo aperto", href: "/sezioni/dialogo-aperto" }
      ];
      const archivioLinks = [
        { nome: t(lang, "nav_latest"), slug: "/" },
        { nome: t(lang, "nav_archive_full"), slug: "/archivio" },
        { nome: t(lang, "nav_authors"), slug: "/autori" },
        { nome: "Cerca", slug: "/cerca" }
      ];
      return renderTemplate`${maybeRenderHead()}<header class="header" id="site-header" data-astro-transition-persist="site-header" data-pagefind-ignore data-astro-cid-3ef6ksr2> <div class="header-bar" data-astro-cid-3ef6ksr2> <div class="header-inner" data-astro-cid-3ef6ksr2> <a href="/" class="logo-link" aria-label="Ombre e Luci - Home" data-astro-cid-3ef6ksr2> <img${addAttribute(logo.src, "src")} alt="Ombre e Luci" class="logo" data-astro-cid-3ef6ksr2> </a> <form class="search-form" action="/cerca" method="get"${addAttribute(t(lang, "search_label"), "aria-label")} data-astro-cid-3ef6ksr2> <label for="header-search" class="search-label" data-astro-cid-3ef6ksr2>${t(lang, "search_label")}</label> <input id="header-search" type="search" name="q"${addAttribute(t(lang, "search_placeholder"), "placeholder")} class="search-input"${addAttribute(t(lang, "search_label"), "aria-label")} data-astro-cid-3ef6ksr2> <button type="submit" class="search-button"${addAttribute(t(lang, "search_label"), "aria-label")} data-astro-cid-3ef6ksr2> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-3ef6ksr2> <circle cx="11" cy="11" r="8" data-astro-cid-3ef6ksr2></circle> <path d="m21 21-4.35-4.35" data-astro-cid-3ef6ksr2></path> </svg> </button> </form> <div class="header-end" data-astro-cid-3ef6ksr2> ${renderComponent($$result, "LanguageSelector", $$LanguageSelector, { "pathname": pathname, "alternateArticleUrl": alternateArticleUrl, "data-astro-cid-3ef6ksr2": true })} <nav class="header-nav" aria-label="Servizi e utilità" data-astro-cid-3ef6ksr2> <a href="/chi-siamo" class="header-link" data-astro-cid-3ef6ksr2>${t(lang, "nav_about")}</a> <a href="/#newsletter" class="header-link" data-astro-cid-3ef6ksr2>${t(lang, "nav_newsletter")}</a> </nav> <button type="button" class="mobile-search-btn" id="mobile-search-btn" aria-label="Cerca" aria-expanded="false" aria-controls="mobile-search-overlay" data-astro-cid-3ef6ksr2> <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-3ef6ksr2> <circle cx="11" cy="11" r="8" data-astro-cid-3ef6ksr2></circle> <path d="m21 21-4.35-4.35" data-astro-cid-3ef6ksr2></path> </svg> </button> <a href="/sostienici" class="header-cta" data-astro-cid-3ef6ksr2>${t(lang, "nav_contribute")}</a> <button type="button" class="menu-trigger" id="menu-trigger"${addAttribute(t(lang, "nav_menu_open"), "aria-label")} aria-expanded="false" aria-controls="mega-menu"${addAttribute(t(lang, "nav_menu_open"), "data-label-open")}${addAttribute(t(lang, "nav_menu_close"), "data-label-close")} data-astro-cid-3ef6ksr2> <span class="menu-trigger-icon" aria-hidden="true" data-astro-cid-3ef6ksr2> <span class="hamburger-line" data-astro-cid-3ef6ksr2></span> <span class="hamburger-line" data-astro-cid-3ef6ksr2></span> <span class="hamburger-line" data-astro-cid-3ef6ksr2></span> </span> <span class="menu-trigger-close" aria-hidden="true" data-astro-cid-3ef6ksr2> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" data-astro-cid-3ef6ksr2> <path d="M18 6 6 18M6 6l12 12" data-astro-cid-3ef6ksr2></path> </svg> </span> <span class="menu-trigger-label" data-astro-cid-3ef6ksr2>${t(lang, "nav_menu")}</span> </button> </div> </div> </div> <div class="mobile-search-overlay" id="mobile-search-overlay" aria-hidden="true" data-astro-cid-3ef6ksr2> <form class="mobile-search-form" action="/cerca" method="get" aria-label="Cerca nel sito" data-astro-cid-3ef6ksr2> <input id="mobile-search-input" type="search" name="q" placeholder="Cerca nel sito…" class="mobile-search-input" autocomplete="off" data-astro-cid-3ef6ksr2> <button type="submit" class="mobile-search-submit" aria-label="Cerca" data-astro-cid-3ef6ksr2> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-3ef6ksr2> <circle cx="11" cy="11" r="8" data-astro-cid-3ef6ksr2></circle> <path d="m21 21-4.35-4.35" data-astro-cid-3ef6ksr2></path> </svg> </button> </form> </div> <div class="mega-menu" id="mega-menu" role="dialog" aria-modal="true" aria-label="Menu di navigazione" aria-hidden="true" data-astro-cid-3ef6ksr2> <div class="mega-menu-inner" data-astro-cid-3ef6ksr2> <div class="mega-menu-container" data-astro-cid-3ef6ksr2> <div class="mega-menu-grid" data-astro-cid-3ef6ksr2> <div class="mega-menu-block" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_themes")}</h3> <ul class="mega-menu-list mega-menu-list--grid" data-astro-cid-3ef6ksr2> ${temi.map((cat) => renderTemplate`<li data-astro-cid-3ef6ksr2> <a${addAttribute(`/categoria/${cat.slug}`, "href")} class="mega-menu-link" data-astro-cid-3ef6ksr2>${cat.nome}</a> </li>`)} </ul> </div> <div class="mega-menu-block" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_sections")}</h3> <ul class="mega-menu-list" data-astro-cid-3ef6ksr2> ${sezioniForme.map((cat) => renderTemplate`<li data-astro-cid-3ef6ksr2> <a${addAttribute(cat.href, "href")} class="mega-menu-link" data-astro-cid-3ef6ksr2>${cat.nome}</a> </li>`)} </ul> </div> <div class="mega-menu-block" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_archive")}</h3> <ul class="mega-menu-list" data-astro-cid-3ef6ksr2> ${archivioLinks.map((item) => renderTemplate`<li data-astro-cid-3ef6ksr2> <a${addAttribute(item.slug, "href")} class="mega-menu-link" data-astro-cid-3ef6ksr2>${item.nome}</a> </li>`)} </ul> </div> <div class="mega-menu-block mega-menu-last-issue" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_last_issue")}</h3> ${ultimoNumero ? renderTemplate`<div class="last-issue-inner" data-astro-cid-3ef6ksr2> <a${addAttribute(`/archivio/${String(ultimoNumero.id_numero).toLowerCase().replace(/[^a-z0-9-]/g, "-")}`, "href")} class="last-issue-cover-wrap" data-astro-cid-3ef6ksr2> ${renderTemplate`<img${addAttribute(ultimoNumero.copertina_url, "src")}${addAttribute(ultimoNumero.titolo_numero, "alt")} class="last-issue-cover" loading="lazy" data-astro-cid-3ef6ksr2>`} </a> <div class="last-issue-meta" data-astro-cid-3ef6ksr2> <p class="last-issue-label" data-astro-cid-3ef6ksr2>Numero ${ultimoNumero.numero_progressivo} · ${ultimoNumero.anno_pubblicazione}</p> <h4 class="last-issue-title" data-astro-cid-3ef6ksr2>${ultimoNumero.titolo_numero}</h4> ${renderTemplate`<p class="last-issue-period" data-astro-cid-3ef6ksr2>${ultimoNumero.periodo_label}</p>`} <a href="/sostienici" class="mega-menu-cta" data-astro-cid-3ef6ksr2>${t(lang, "nav_support")}</a> </div> </div>` : renderTemplate`<a href="/sostienici" class="mega-menu-cta" data-astro-cid-3ef6ksr2>${t(lang, "nav_support")}</a>`} </div> </div> </div> </div> </div> </header>   `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/Header.astro", "self");
    PAYPAL_DONATE_URL = "https://www.paypal.com/donate/?hosted_button_id=ARYLM4RPUV788";
    CF = "96000680585";
    CODICE_FISCALE = CF;
    RUNTS = "15031";
    INTESTATARIO = "Associazione Fede e Luce APS";
    IBAN_RAW = "IT02S0760103200000055090005";
    IBAN_DISPLAY = "IT02 S076 0103 2000 0005 5090 005";
    CCP = "55090005";
    CCP_DISPLAY = "Conto Corrente Postale n. 55090005";
    EMAIL = "ombreeluci@fedeeluce.it";
    AMOUNT_CHIPS = [5, 10, 20];
    ABBONAMENTO_ANNO = 20;
    ABBONAMENTO_MESE = 2;
    NUMERI_ANNO = 4;
    __freeze = Object.freeze;
    __defProp2 = Object.defineProperty;
    __template = /* @__PURE__ */ __name((cooked, raw) => __freeze(__defProp2(cooked, "raw", { value: __freeze(cooked.slice()) })), "__template");
    $$Astro2 = createAstro();
    $$Footer = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro2, $$props, $$slots);
      Astro2.self = $$Footer;
      const { pathname = "/" } = Astro2.props;
      const lang = getLangFromUrl(pathname);
      const temi = getThemesWithSlugs();
      const meta = Math.ceil(temi.length / 2);
      const temiCol1 = temi.slice(0, meta);
      const temiCol2 = temi.slice(meta);
      const sezioniFormali = [
        { nome: t(lang, "footer_editorials"), slug: "editoriali" },
        { nome: t(lang, "footer_reviews"), slug: "recensioni" },
        { nome: t(lang, "footer_interviews"), slug: "interviste" },
        { nome: t(lang, "footer_testimonials"), slug: "testimonianze" }
      ];
      const aboutLinks = [
        { nome: t(lang, "footer_about"), slug: "/chi-siamo" },
        { nome: t(lang, "footer_redaction"), slug: "/chi-siamo#la-redazione" },
        { nome: t(lang, "footer_redaction_history"), slug: "/chi-siamo#redazione-storica" },
        { nome: t(lang, "footer_collaborators"), slug: "/chi-siamo#collaboratori" },
        { nome: t(lang, "footer_wrote_for_us"), slug: "/chi-siamo#hanno-scritto-per-noi" },
        { nome: t(lang, "footer_diari"), slug: "/sezioni/diari" },
        { nome: t(lang, "footer_contacts"), slug: "/chi-siamo#contatti" }
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
      return renderTemplate(_a || (_a = __template(["", '<div class="footer-reveal-wrap" data-astro-cid-sz7xmlte> <div class="reveal-spacer" aria-hidden="true" data-astro-cid-sz7xmlte></div> <footer class="site-footer" id="site-footer" role="contentinfo" data-pagefind-ignore data-astro-cid-sz7xmlte> <div class="footer-inner" data-astro-cid-sz7xmlte> <div class="footer-grid" data-astro-cid-sz7xmlte> <!-- Colonna 1: Identit\xE0 (logo, tagline, editore, legale, social in fondo) --> <div class="footer-col footer-col-identity" data-astro-cid-sz7xmlte> <a href="/" class="footer-logo-link" data-astro-cid-sz7xmlte> <img', ' alt="Ombre e Luci" class="footer-logo" width="160" height="55" data-astro-cid-sz7xmlte> </a> <p class="footer-tagline" data-astro-cid-sz7xmlte>', '</p> <p class="footer-editor" data-astro-cid-sz7xmlte> ', ' <a href="https://www.fedeeluce.it" target="_blank" rel="noopener noreferrer" class="footer-link" data-astro-cid-sz7xmlte>Associazione Fede e Luce A.P.S.</a> </p> <p class="footer-legal" data-astro-cid-sz7xmlte>Rivista trimestrale. Testata registrata presso il Tribunale di Roma, iscrizione n. 1 del 16 gennaio 2020. Direzione, redazione e amministrazione: Via dei Cessati Spiriti 3, 00185 Roma.</p> <div class="footer-social" aria-label="Seguici" data-astro-cid-sz7xmlte> ', ' </div> </div> <!-- Colonna 2: Chi siamo --> <div class="footer-col" data-astro-cid-sz7xmlte> <h3 class="footer-title" data-astro-cid-sz7xmlte>', '</h3> <ul class="footer-list" data-astro-cid-sz7xmlte> ', ' </ul> </div> <!-- Colonna 3: Temi (due colonne, una sola intestazione) --> <div class="footer-col footer-col-temi" data-astro-cid-sz7xmlte> <h3 class="footer-title" data-astro-cid-sz7xmlte>', '</h3> <div class="footer-temi-grid" data-astro-cid-sz7xmlte> <ul class="footer-list" data-astro-cid-sz7xmlte> ', ' </ul> <ul class="footer-list" data-astro-cid-sz7xmlte> ', ' </ul> </div> </div> <!-- Colonna 4: Sezioni --> <div class="footer-col" data-astro-cid-sz7xmlte> <h3 class="footer-title" data-astro-cid-sz7xmlte>', '</h3> <ul class="footer-list" data-astro-cid-sz7xmlte> ', ' </ul> </div> <!-- Colonna 5: Info & Privacy --> <div class="footer-col" data-astro-cid-sz7xmlte> <h3 class="footer-title" data-astro-cid-sz7xmlte>', '</h3> <ul class="footer-list" data-astro-cid-sz7xmlte> ', ' </ul> </div> </div> <div class="footer-bottom" data-astro-cid-sz7xmlte> <p class="footer-copy-cc" data-astro-cid-sz7xmlte><span class="footer-copy-inline" data-astro-cid-sz7xmlte>(c) 1974-2026 Eccetto</span> dove diversamente indicato, il contenuto di questo sito \xE8 concesso in licenza <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.it" target="_blank" rel="noopener noreferrer" class="footer-link" data-astro-cid-sz7xmlte>Creative Commons: Attribuzione \u2013 Non commerciale \u2013 Condividi allo stesso modo 4.0 Internazionale (CC BY-NC-SA 4.0)</a>.</p> <p class="footer-legal-bottom" data-astro-cid-sz7xmlte>Associazione Fede e Luce Aps \u2013 C.F. ', " | Iscrizione al RUNTS n. ", "</p> </div> </div> </footer> <!-- Fallback copertine: R2 404 / img rotta \u2192 placeholder (anche con View Transitions) --> <script>\n    (function () {\n      var ph = '/images/placeholder-copertina.svg';\n      function bindImg(img) {\n        if (img.getAttribute('data-copertina-fallback') == null) return;\n        if (img.dataset.copertinaFallbackJs === '1') return;\n        img.dataset.copertinaFallbackJs = '1';\n        img.addEventListener(\n          'error',\n          function () {\n            try {\n              var u = String(img.getAttribute('src') || '');\n              if (u.indexOf(ph) === -1) {\n                img.removeAttribute('srcset');\n                img.src = ph;\n              }\n            } catch (e) {}\n          },\n          { capture: false }\n        );\n      }\n      function bindAll() {\n        document.querySelectorAll('img[data-copertina-fallback]').forEach(bindImg);\n      }\n      bindAll();\n      document.addEventListener('astro:page-load', bindAll);\n    })();\n  <\/script> </div> "])), maybeRenderHead(), addAttribute(logo.src, "src"), t(lang, "footer_tagline"), t(lang, "footer_edited_by"), socialLinks.map((s) => renderTemplate`<a${addAttribute(s.url, "href")} target="_blank" rel="noopener noreferrer" class="footer-social-link"${addAttribute(s.nome, "aria-label")} data-astro-cid-sz7xmlte> ${s.icon === "facebook" && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" data-astro-cid-sz7xmlte></path></svg>`} ${s.icon === "instagram" && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" data-astro-cid-sz7xmlte></path></svg>`} ${s.icon === "x" && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" data-astro-cid-sz7xmlte></path></svg>`} ${s.icon === "youtube" && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" data-astro-cid-sz7xmlte></path></svg>`} ${s.icon === "tiktok" && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" data-astro-cid-sz7xmlte></path></svg>`} </a>`), t(lang, "footer_about"), aboutLinks.map((item) => renderTemplate`<li data-astro-cid-sz7xmlte> <a${addAttribute(item.slug, "href")} class="footer-link" data-astro-cid-sz7xmlte>${item.nome}</a> </li>`), t(lang, "nav_themes"), temiCol1.map((cat) => renderTemplate`<li data-astro-cid-sz7xmlte> <a${addAttribute(`/categoria/${cat.slug}`, "href")} class="footer-link" data-astro-cid-sz7xmlte>${cat.nome}</a> </li>`), temiCol2.map((cat) => renderTemplate`<li data-astro-cid-sz7xmlte> <a${addAttribute(`/categoria/${cat.slug}`, "href")} class="footer-link" data-astro-cid-sz7xmlte>${cat.nome}</a> </li>`), t(lang, "nav_sections"), sezioniFormali.map((cat) => renderTemplate`<li data-astro-cid-sz7xmlte> <a${addAttribute(`/categoria/${cat.slug}`, "href")} class="footer-link" data-astro-cid-sz7xmlte>${cat.nome}</a> </li>`), t(lang, "footer_info_privacy"), legalLinks.map((item) => renderTemplate`<li data-astro-cid-sz7xmlte> <a${addAttribute(item.url, "href")} target="_blank" rel="noopener noreferrer" class="footer-link" data-astro-cid-sz7xmlte>${item.nome}</a> </li>`), CODICE_FISCALE, RUNTS);
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/Footer.astro", void 0);
  }
});

// _worker.js/chunks/BaseLayout_DIxcXjbq.mjs
var $$Astro$12, $$BaseHead, $$Astro3, $$BaseLayout;
var init_BaseLayout_DIxcXjbq = __esm({
  "_worker.js/chunks/BaseLayout_DIxcXjbq.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    init_ViewTransitions_Dvx2U5F3();
    init_Footer_D9bdzLvP();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro$12 = createAstro();
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
      const canonicalUrl = canonical ?? Astro2.url.href;
      const ogImageUrl = ogImage ?? DEFAULT_OG_IMAGE;
      return renderTemplate`<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/png" href="/favicon.png"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="shortcut icon" href="/favicon.ico"><title>${pageTitle}</title><meta name="description"${addAttribute(description, "content")}>${noindex && renderTemplate`<meta name="robots" content="noindex, nofollow">`}<link rel="canonical"${addAttribute(canonicalUrl, "href")}><!-- Google Site Verification --><meta name="google-site-verification"${addAttribute(GOOGLE_SITE_VERIFICATION, "content")}><!-- Open Graph --><meta property="og:site_name"${addAttribute(SITE_NAME, "content")}><meta property="og:title"${addAttribute(pageTitle, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(ogImageUrl, "content")}><meta property="og:type"${addAttribute(ogType, "content")}><meta property="og:url"${addAttribute(canonicalUrl, "content")}><meta property="og:locale"${addAttribute(lang === "en" ? "en_US" : "it_IT", "content")}><!-- Twitter Card --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"${addAttribute(pageTitle, "content")}><meta name="twitter:description"${addAttribute(description, "content")}><meta name="twitter:image"${addAttribute(ogImageUrl, "content")}><!-- hreflang alternates -->${alternates.map(({ lang: l, url }) => renderTemplate`<link rel="alternate"${addAttribute(l, "hreflang")}${addAttribute(url, "href")}>`)}${alternates.length > 0 && renderTemplate`<link rel="alternate" hreflang="x-default"${addAttribute(alternates.find((a) => a.lang === "it")?.url ?? canonicalUrl, "href")}>`}<!-- Preconnect origini critiche --><link rel="preconnect" href="https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev"><!-- Slot per contenuto aggiuntivo (JSON-LD, meta custom) -->${renderSlot($$result, $$slots["default"])}${renderComponent($$result, "ViewTransitions", $$ViewTransitions, {})}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/BaseHead.astro", void 0);
    $$Astro3 = createAstro();
    $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro3, $$props, $$slots);
      Astro2.self = $$BaseLayout;
      const { bodyClass, alternateArticleUrl = null, ...headProps } = Astro2.props;
      const lang = headProps.lang ?? "it";
      return renderTemplate`<html${addAttribute(lang, "lang")}> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { ...headProps }, { "default": ($$result2) => renderTemplate`${renderSlot($$result2, $$slots["head"])}` })}${renderHead()}</head> <body${addAttribute([bodyClass], "class:list")}> ${renderComponent($$result, "Header", $$Header, { "alternateArticleUrl": alternateArticleUrl })} ${renderSlot($$result, $$slots["default"])} ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/layouts/BaseLayout.astro", void 0);
  }
});

// _worker.js/pages/404.astro.mjs
var astro_exports = {};
__export(astro_exports, {
  page: () => page,
  renderers: () => renderers
});
import { renderers } from "../renderers.mjs";
var $$404, $$file, $$url, _page, page;
var init_astro = __esm({
  "_worker.js/pages/404.astro.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    init_BaseLayout_DIxcXjbq();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$404 = createComponent(($$result, $$props, $$slots) => {
      return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "404 - Pagina non trovata", "noindex": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main"> <div class="container"> <h1>404</h1> <p>Pagina non trovata</p> <a href="/">Torna all'archivio</a> </div> </main> ` })}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/404.astro", void 0);
    $$file = "C:/Users/berto/Documents/Ombreeluci/src/pages/404.astro";
    $$url = "/404";
    _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$404,
      file: $$file,
      url: $$url
    }, Symbol.toStringTag, { value: "Module" }));
    page = /* @__PURE__ */ __name(() => _page, "page");
  }
});

// _worker.js/chunks/directus_B0n0XETK.mjs
function resolveCreds(creds) {
  const rawUrl = creds?.url?.trim() || DIRECTUS_URL || DEFAULT_DIRECTUS_PUBLIC;
  const url = rawUrl.replace(/\/$/, "");
  const token = creds?.token ?? DIRECTUS_TOKEN;
  return { url, token };
}
function directusCredsFromAstroLocals(locals) {
  const r2 = locals;
  const env = r2?.runtime?.env;
  if (!env)
    return void 0;
  const o = {};
  if (typeof env.DIRECTUS_URL === "string" && env.DIRECTUS_URL.trim())
    o.url = env.DIRECTUS_URL.trim();
  if (typeof env.DIRECTUS_TOKEN === "string" && env.DIRECTUS_TOKEN.trim())
    o.token = env.DIRECTUS_TOKEN.trim();
  return Object.keys(o).length ? o : void 0;
}
function getImageUrl(fileId) {
  return `https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev/copertine/${fileId}`;
}
function getAutoreImageUrl(fileId) {
  return `https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev/autori/${fileId}`;
}
function getNumeroImageUrl(numero) {
  const u = numero.copertina_url?.trim();
  return u || null;
}
function getArticoloCopertinaSrc(articolo) {
  const raw = articolo?.immagine_copertina?.id;
  const id = typeof raw === "string" ? raw.trim() : "";
  if (!id)
    return null;
  return getImageUrl(id);
}
async function directusFetch(path, creds) {
  const { url: base, token } = resolveCreds(creds);
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) {
      console.error(`[directus] ${res.status} ${res.statusText} \u2014 ${url}`);
      return null;
    }
    const json = await res.json();
    return json;
  } catch (err) {
    console.error(`[directus] Fetch error \u2014 ${url}:`, err);
    return null;
  }
}
async function getAllArticoli() {
  const params = new URLSearchParams({
    "filter[stato][_eq]": "published",
    fields: ARTICOLO_LIST_FIELDS,
    limit: "-1",
    sort: "data_pubblicazione"
  });
  const data = await directusFetch(
    `/items/articoli?${params}`
  );
  if (!data) {
    console.error("[directus] getAllArticoli: risposta nulla");
    return [];
  }
  return data.data ?? [];
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
async function getArticoliCountByAutoreId() {
  const params = new URLSearchParams({
    "filter[stato][_eq]": "published",
    "filter[autore][_nnull]": "true",
    "aggregate[count]": "id",
    limit: "-1"
  });
  params.append("groupBy[]", "autore");
  const data = await directusFetch(
    `/items/articoli?${params}`
  );
  const map = /* @__PURE__ */ new Map();
  if (!data?.data?.length)
    return map;
  for (const row of data.data) {
    const n = parseInt(String(row.count?.id ?? "0"), 10) || 0;
    map.set(row.autore, n);
  }
  return map;
}
async function getAllAutori() {
  const [countByAutore, authorsRes] = await Promise.all([
    getArticoliCountByAutoreId(),
    directusFetch(
      "/items/autori?fields=id,slug,nome_completo,bio_html,foto.id,foto.filename_download&limit=-1&sort=nome_completo"
    )
  ]);
  if (!authorsRes?.data)
    return [];
  return authorsRes.data.map((a) => ({
    ...a,
    articoli_count: countByAutore.get(a.id) ?? 0
  }));
}
async function getAllNumeriRivista() {
  const data = await directusFetch(
    "/items/numeri_rivista?fields=id,id_numero,display_title,anno_pubblicazione,tipo,descrizione,pdf_archive_url,wp_url,copertina_url&limit=-1&sort=anno_pubblicazione"
  );
  if (!data)
    return [];
  return data.data ?? [];
}
var DEFAULT_DIRECTUS_PUBLIC, DIRECTUS_URL, DIRECTUS_TOKEN, PLACEHOLDER_COPERTINA, COPERTINA_IMG_ONERROR, ARTICOLO_LIST_FIELDS;
var init_directus_B0n0XETK = __esm({
  "_worker.js/chunks/directus_B0n0XETK.mjs"() {
    "use strict";
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    DEFAULT_DIRECTUS_PUBLIC = "https://cms.ombreeluci.it";
    DIRECTUS_URL = process.env.DIRECTUS_URL?.trim() || DEFAULT_DIRECTUS_PUBLIC;
    DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN ?? "";
    __name(resolveCreds, "resolveCreds");
    __name(directusCredsFromAstroLocals, "directusCredsFromAstroLocals");
    __name(getImageUrl, "getImageUrl");
    __name(getAutoreImageUrl, "getAutoreImageUrl");
    __name(getNumeroImageUrl, "getNumeroImageUrl");
    PLACEHOLDER_COPERTINA = "/images/placeholder-copertina.svg";
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
    __name(getAllArticoli, "getAllArticoli");
    __name(getArticoloBySlug, "getArticoloBySlug");
    __name(getArticoliCountByAutoreId, "getArticoliCountByAutoreId");
    __name(getAllAutori, "getAllAutori");
    __name(getAllNumeriRivista, "getAllNumeriRivista");
  }
});

// _worker.js/pages/api/debug-blog.astro.mjs
var debug_blog_astro_exports = {};
__export(debug_blog_astro_exports, {
  page: () => page2,
  renderers: () => renderers2
});
import { renderers as renderers2 } from "../../renderers.mjs";
var prerender, GET, _page2, page2;
var init_debug_blog_astro = __esm({
  "_worker.js/pages/api/debug-blog.astro.mjs"() {
    "use strict";
    init_directus_B0n0XETK();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    prerender = false;
    GET = /* @__PURE__ */ __name(async ({ url, locals }) => {
      const slug = url.searchParams.get("slug") ?? "ombre-e-luci";
      const report = { slug };
      try {
        const creds = directusCredsFromAstroLocals(locals);
        report.creds_url = creds?.url ?? "(not in locals \u2014 usando fallback)";
        report.creds_token_present = typeof creds?.token === "string" && creds.token.length > 0;
        report.locals_keys = Object.keys(locals?.runtime?.env ?? {});
        const articolo = await getArticoloBySlug(slug, creds);
        report.articolo_found = articolo !== null;
        if (articolo) {
          report.articolo_id = articolo.id;
          report.articolo_titolo = articolo.titolo;
          report.articolo_corpo_len = articolo.corpo?.length ?? 0;
        }
        const origin = url.origin;
        report.origin = origin;
        try {
          const correlatiRes = await fetch(`${origin}/correlati.json`);
          report.correlati_status = correlatiRes.status;
          report.correlati_ok = correlatiRes.ok;
          if (correlatiRes.ok) {
            const correlatiMap = await correlatiRes.json();
            const slugs = correlatiMap[slug] ?? [];
            report.correlati_slugs_count = slugs.length;
            report.correlati_slugs_first3 = slugs.slice(0, 3);
          }
        } catch (e) {
          report.correlati_error = String(e);
        }
      } catch (e) {
        report.error = String(e);
        report.error_stack = e instanceof Error ? e.stack : void 0;
      }
      return new Response(JSON.stringify(report, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }, "GET");
    _page2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      GET,
      prerender
    }, Symbol.toStringTag, { value: "Module" }));
    page2 = /* @__PURE__ */ __name(() => _page2, "page");
  }
});

// _worker.js/pages/api/revalidate.astro.mjs
var revalidate_astro_exports = {};
__export(revalidate_astro_exports, {
  page: () => page3,
  renderers: () => renderers3
});
import { renderers as renderers3 } from "../../renderers.mjs";
var prerender2, POST, _page3, page3;
var init_revalidate_astro = __esm({
  "_worker.js/pages/api/revalidate.astro.mjs"() {
    "use strict";
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    prerender2 = false;
    POST = /* @__PURE__ */ __name(async ({ request, locals }) => {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response("Bad Request", { status: 400 });
      }
      const { slug, secret } = body ?? {};
      if (!slug || typeof slug !== "string") {
        return new Response("Missing slug", { status: 400 });
      }
      const runtime = locals.runtime;
      const env = runtime?.env ?? {};
      const REVALIDATE_SECRET = env.REVALIDATE_SECRET ?? "";
      const CF_ZONE_ID = env.CF_ZONE_ID ?? "";
      const CF_PURGE_TOKEN = env.CF_PURGE_TOKEN ?? "";
      if (!REVALIDATE_SECRET || secret !== REVALIDATE_SECRET) {
        return new Response("Unauthorized", { status: 401 });
      }
      if (!CF_ZONE_ID || !CF_PURGE_TOKEN) {
        return new Response("Server misconfiguration", { status: 500 });
      }
      const articleUrl = `https://ombreeluci.it/blog/${slug}/`;
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
    _page3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      POST,
      prerender: prerender2
    }, Symbol.toStringTag, { value: "Module" }));
    page3 = /* @__PURE__ */ __name(() => _page3, "page");
  }
});

// _worker.js/chunks/IssueCard_Db5MfroW.mjs
var $$Astro4, $$IssueCard;
var init_IssueCard_Db5MfroW = __esm({
  "_worker.js/chunks/IssueCard_Db5MfroW.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro4 = createAstro();
    $$IssueCard = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro4, $$props, $$slots);
      Astro2.self = $$IssueCard;
      const { cover_url, titolo_numero: titolo_numero2, numero, anno, mese, periodo_label: periodo_label2, tipo_rivista, id_numero: id_numero2 } = Astro2.props;
      const testata = tipo_rivista === "ins" || titolo_numero2.toLowerCase().includes("insieme") ? "Insieme" : "Ombre e Luci";
      const numeroSlug = id_numero2.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const linkUrl = `/archivio/${numeroSlug}`;
      const periodo = periodo_label2 || mese || "";
      return renderTemplate`${maybeRenderHead()}<a${addAttribute(linkUrl, "href")} class="issue-card" data-astro-cid-afktgyng> <div class="issue-card-image-wrapper" data-astro-cid-afktgyng> ${cover_url ? renderTemplate`<img${addAttribute(cover_url, "src")}${addAttribute(`Copertina ${testata} n. ${numero} - ${anno}`, "alt")} class="issue-card-image" loading="lazy" data-copertina-fallback data-astro-cid-afktgyng>` : renderTemplate`<div class="issue-card-placeholder" data-astro-cid-afktgyng> <span class="issue-card-placeholder-text" data-astro-cid-afktgyng>${testata}</span> <span class="issue-card-placeholder-number" data-astro-cid-afktgyng>n. ${numero}</span> </div>`} <div class="issue-card-badge" data-astro-cid-afktgyng> ${testata} </div> </div> <div class="issue-card-content" data-astro-cid-afktgyng> <h3 class="issue-card-title" data-astro-cid-afktgyng>${titolo_numero2}</h3> <div class="issue-card-meta" data-astro-cid-afktgyng> <span class="issue-card-year" data-astro-cid-afktgyng>N.${numero} · ${anno}</span> ${periodo && renderTemplate`<span class="issue-card-period" data-astro-cid-afktgyng>${periodo}</span>`} </div> </div> </a> `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/IssueCard.astro", void 0);
  }
});

// _worker.js/pages/archivio.astro.mjs
var archivio_astro_exports = {};
__export(archivio_astro_exports, {
  page: () => page4,
  renderers: () => renderers4
});
import { renderers as renderers4 } from "../renderers.mjs";
var $$Index, $$file2, $$url2, _page4, page4;
var init_archivio_astro = __esm({
  "_worker.js/pages/archivio.astro.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    init_BaseLayout_DIxcXjbq();
    init_IssueCard_Db5MfroW();
    init_directus_B0n0XETK();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Index = createComponent(async ($$result, $$props, $$slots) => {
      const rawNumeri = await getAllNumeriRivista();
      const numeriOrdinati = [...rawNumeri].sort(
        (a, b) => (b.anno_pubblicazione ?? 0) - (a.anno_pubblicazione ?? 0)
      );
      function numeroFromId(idNumero) {
        const m = idNumero.match(/(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      }
      __name(numeroFromId, "numeroFromId");
      const anni = Array.from(new Set(numeriOrdinati.map((n) => n.anno_pubblicazione ?? 0))).filter((y) => y > 0).sort((a, b) => b - a);
      return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Archivio", "description": "Sfoglia i numeri della rivista Ombre e Luci dal 1977 ad oggi.", "noindex": true, "data-astro-cid-aw366c5p": true }, { "default": async ($$result2) => renderTemplate`${maybeRenderHead()}<main class="site-main" data-astro-cid-aw366c5p><div class="archivio-container" data-astro-cid-aw366c5p><div class="archivio-header" data-astro-cid-aw366c5p><h1 class="archivio-title" data-astro-cid-aw366c5p>Archivio</h1><p class="archivio-subtitle" data-astro-cid-aw366c5p>
Esplora tutti i numeri di Ombre e Luci e Insieme
</p></div><div class="filters-container" data-astro-cid-aw366c5p><div class="filter-group" data-astro-cid-aw366c5p><label for="filter-anno" class="filter-label" data-astro-cid-aw366c5p>Anno</label><select id="filter-anno" class="filter-select" data-filter-year data-astro-cid-aw366c5p><option value="" data-astro-cid-aw366c5p>Tutti gli anni</option>${anni.map((anno) => renderTemplate`<option${addAttribute(anno, "value")} data-astro-cid-aw366c5p>${anno}</option>`)}</select></div><div class="filter-group" data-astro-cid-aw366c5p><label for="filter-testata" class="filter-label" data-astro-cid-aw366c5p>Testata</label><select id="filter-testata" class="filter-select" data-filter-type data-astro-cid-aw366c5p><option value="" data-astro-cid-aw366c5p>Tutte</option><option value="ombreeluci" data-astro-cid-aw366c5p>Ombre e Luci</option><option value="insieme" data-astro-cid-aw366c5p>Insieme</option></select></div><div class="filter-group" data-astro-cid-aw366c5p><label for="filter-ordine" class="filter-label" data-astro-cid-aw366c5p>Ordinamento</label><select id="filter-ordine" class="filter-select" data-astro-cid-aw366c5p><option value="desc" data-astro-cid-aw366c5p>Data ↓</option><option value="asc" data-astro-cid-aw366c5p>Data ↑</option></select></div><div class="results-count" id="results-count" data-astro-cid-aw366c5p>${numeriOrdinati.length} numeri
</div></div><div class="issues-grid" id="issues-grid" data-astro-cid-aw366c5p>${numeriOrdinati.map((n) => {
        const anno = n.anno_pubblicazione ?? 0;
        const numero = numeroFromId(n.id_numero);
        const tipoFilter = n.tipo === "ins" ? "insieme" : "ombreeluci";
        const tipoRivista = n.tipo === "insieme" ? "insieme" : "ombre_e_luci";
        return renderTemplate`<div class="issue-card-wrapper"${addAttribute(n.id_numero, "data-id")}${addAttribute(anno || "", "data-year")}${addAttribute(tipoFilter, "data-type")}${addAttribute(numero, "data-numero")} data-astro-cid-aw366c5p>${renderComponent($$result2, "IssueCard", $$IssueCard, { "cover_url": getNumeroImageUrl(n) ?? void 0, "titolo_numero": n.display_title ?? "", "numero": numero, "anno": anno, "tipo_rivista": tipoRivista, "id_numero": n.id_numero, "data-astro-cid-aw366c5p": true })}</div>`;
      })}</div><div class="no-results" id="no-results" style="display: none;" data-astro-cid-aw366c5p><h2 class="no-results-title" data-astro-cid-aw366c5p>Nessun risultato</h2><p class="no-results-text" data-astro-cid-aw366c5p>Prova a modificare i filtri per vedere più risultati.</p></div></div></main>` })}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/index.astro", void 0);
    $$file2 = "C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/index.astro";
    $$url2 = "/archivio";
    _page4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$Index,
      file: $$file2,
      url: $$url2
    }, Symbol.toStringTag, { value: "Module" }));
    page4 = /* @__PURE__ */ __name(() => _page4, "page");
  }
});

// _worker.js/pages/autori.astro.mjs
var autori_astro_exports = {};
__export(autori_astro_exports, {
  page: () => page5,
  renderers: () => renderers5
});
import { renderers as renderers5 } from "../renderers.mjs";
var $$Index2, $$file3, $$url3, _page5, page5;
var init_autori_astro = __esm({
  "_worker.js/pages/autori.astro.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    init_BaseLayout_DIxcXjbq();
    init_directus_B0n0XETK();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Index2 = createComponent(async ($$result, $$props, $$slots) => {
      function stripHtml(html) {
        return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      }
      __name(stripHtml, "stripHtml");
      const allAutori = await getAllAutori();
      const autori = allAutori.map((autore) => {
        const foto = autore.foto?.id ? getAutoreImageUrl(autore.foto.id) : "";
        const bioText = autore.bio_html ? stripHtml(autore.bio_html) : "";
        const bio_breve = bioText ? bioText.slice(0, 120) + (bioText.length > 120 ? "\u2026" : "") : "";
        return {
          nome: autore.nome_completo,
          slug: autore.slug,
          foto,
          bio_breve,
          count_articoli: autore.articoli_count ?? 0
        };
      });
      return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Autori", "description": "Elenco degli autori della rivista Ombre e Luci", "noindex": true, "data-astro-cid-77eyneti": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main autori-page" data-astro-cid-77eyneti> <div class="autori-container" data-astro-cid-77eyneti> <h1 class="autori-title" data-astro-cid-77eyneti>Autori</h1> <p class="autori-intro" data-astro-cid-77eyneti>Esplora i collaboratori della rivista Ombre e Luci.</p> <div class="autori-toolbar" data-astro-cid-77eyneti> <div class="autori-search-wrap" data-astro-cid-77eyneti> <label for="autori-search" class="visually-hidden" data-astro-cid-77eyneti>Cerca autore</label> <input type="search" id="autori-search" class="autori-search" placeholder="Cerca per nome..." aria-label="Cerca autore" data-astro-cid-77eyneti> </div> <div class="autori-sort-wrap" data-astro-cid-77eyneti> <label for="autori-sort" class="autori-sort-label" data-astro-cid-77eyneti>Ordina per</label> <select id="autori-sort" class="autori-sort" aria-label="Ordina autori" data-astro-cid-77eyneti> <option value="count-desc" data-astro-cid-77eyneti>Più articoli</option> <option value="count-asc" data-astro-cid-77eyneti>Meno articoli</option> <option value="name-asc" data-astro-cid-77eyneti>Nome A–Z</option> <option value="name-desc" data-astro-cid-77eyneti>Nome Z–A</option> </select> </div> </div> <div id="autori-grid" class="autori-grid" data-astro-cid-77eyneti> ${autori.map((autore) => renderTemplate`<a${addAttribute(`/autori/${autore.slug}`, "href")} class="autori-card"${addAttribute(autore.nome.toLowerCase(), "data-nome")}${addAttribute(autore.count_articoli, "data-count")} data-astro-cid-77eyneti> <div class="autori-card-image" data-astro-cid-77eyneti> ${autore.foto && !autore.foto.includes("default.png") ? renderTemplate`<img${addAttribute(autore.foto, "src")} alt="" width="80" height="80" loading="lazy" onError="this.style.display='none'; this.nextElementSibling?.classList.add('visible')" data-astro-cid-77eyneti>` : null} <span${addAttribute(!autore.foto || autore.foto.includes("default.png") ? "autori-card-initial visible" : "autori-card-initial", "class")} aria-hidden="true" data-astro-cid-77eyneti>${autore.nome.charAt(0).toUpperCase()}</span> </div> <div class="autori-card-body" data-astro-cid-77eyneti> <h2 class="autori-card-name" data-astro-cid-77eyneti>${autore.nome}</h2> <p class="autori-card-count" data-astro-cid-77eyneti>${autore.count_articoli} ${autore.count_articoli === 1 ? "articolo" : "articoli"}</p> <p class="autori-card-bio" data-astro-cid-77eyneti>${autore.bio_breve}</p> </div> </a>`)} </div> <p id="autori-no-results" class="autori-no-results" style="display: none;" data-astro-cid-77eyneti>Nessun autore trovato.</p> </div> </main>   ` })}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/autori/index.astro", void 0);
    $$file3 = "C:/Users/berto/Documents/Ombreeluci/src/pages/autori/index.astro";
    $$url3 = "/autori";
    _page5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$Index2,
      file: $$file3,
      url: $$url3
    }, Symbol.toStringTag, { value: "Module" }));
    page5 = /* @__PURE__ */ __name(() => _page5, "page");
  }
});

// _worker.js/pages/cerca.astro.mjs
var cerca_astro_exports = {};
__export(cerca_astro_exports, {
  page: () => page6,
  renderers: () => renderers6
});
import { renderers as renderers6 } from "../renderers.mjs";
var $$Cerca, $$file4, $$url4, _page6, page6;
var init_cerca_astro = __esm({
  "_worker.js/pages/cerca.astro.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    init_BaseLayout_DIxcXjbq();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Cerca = createComponent(($$result, $$props, $$slots) => {
      return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Cerca", "description": "Cerca articoli, autori e temi nella rivista Ombre e Luci", "noindex": true, "data-astro-cid-hl4accb2": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main" data-astro-cid-hl4accb2> <div class="container" style="padding-top: 2rem; padding-bottom: 4rem;" data-astro-cid-hl4accb2> <h1 data-astro-cid-hl4accb2>Cerca</h1> <p style="color: var(--text-secondary); margin-bottom: 2rem;" data-astro-cid-hl4accb2>Cerca tra oltre 3500 articoli della rivista Ombre e Luci dal 1983 ad oggi.</p> <div id="search" data-astro-cid-hl4accb2></div> </div> </main>  ` })} `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/cerca.astro", void 0);
    $$file4 = "C:/Users/berto/Documents/Ombreeluci/src/pages/cerca.astro";
    $$url4 = "/cerca";
    _page6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$Cerca,
      file: $$file4,
      url: $$url4
    }, Symbol.toStringTag, { value: "Module" }));
    page6 = /* @__PURE__ */ __name(() => _page6, "page");
  }
});

// _worker.js/chunks/AboutSidebar_BMo6rhTT.mjs
var $$Astro5, $$AboutSidebar;
var init_AboutSidebar_BMo6rhTT = __esm({
  "_worker.js/chunks/AboutSidebar_BMo6rhTT.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro5 = createAstro();
    $$AboutSidebar = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro5, $$props, $$slots);
      Astro2.self = $$AboutSidebar;
      const { active = "", useAnchors = true } = Astro2.props;
      const links = [
        { label: "La Rivista", href: useAnchors ? "/chi-siamo#la-rivista" : "/chi-siamo/la-rivista", slug: "la-rivista" },
        { label: "La Redazione", href: useAnchors ? "/chi-siamo#la-redazione" : "/chi-siamo/la-redazione", slug: "la-redazione" },
        { label: "La Redazione storica", href: useAnchors ? "/chi-siamo#redazione-storica" : "/chi-siamo/redazione-storica", slug: "redazione-storica" },
        { label: "Collaboratori", href: useAnchors ? "/chi-siamo#collaboratori" : "/chi-siamo/collaboratori", slug: "collaboratori" },
        { label: "Hanno scritto per noi", href: useAnchors ? "/chi-siamo#hanno-scritto-per-noi" : "/chi-siamo/hanno-scritto-per-noi", slug: "hanno-scritto-per-noi" },
        { label: "Info e contatti redazione", href: useAnchors ? "/chi-siamo#contatti" : "/chi-siamo/contatti", slug: "contatti" }
      ];
      return renderTemplate`${maybeRenderHead()}<nav class="about-sidebar" id="chi-siamo-sidebar" aria-label="Sezioni Chi siamo" data-astro-cid-ksra57ok> <ul class="about-sidebar-list" data-astro-cid-ksra57ok> ${links.map((item) => renderTemplate`<li data-astro-cid-ksra57ok> <a${addAttribute(item.href, "href")}${addAttribute(`about-sidebar-link ${active === item.slug ? "about-sidebar-link--active" : ""}`, "class")}${addAttribute(item.slug, "data-section")} data-astro-cid-ksra57ok> ${item.label} </a> </li>`)} </ul> </nav>  `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/AboutSidebar.astro", void 0);
  }
});

// _worker.js/pages/chi-siamo.astro.mjs
var chi_siamo_astro_exports = {};
__export(chi_siamo_astro_exports, {
  page: () => page7,
  renderers: () => renderers7
});
import { renderers as renderers7 } from "../renderers.mjs";
var $$Index3, $$file5, $$url5, _page7, page7;
var init_chi_siamo_astro = __esm({
  "_worker.js/pages/chi-siamo.astro.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    init_BaseLayout_DIxcXjbq();
    init_AboutSidebar_BMo6rhTT();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Index3 = createComponent(($$result, $$props, $$slots) => {
      const manifestoHero = `Ombre e Luci \xE8 una rivista che da oltre quarant'anni accompagna le persone con disabilit\xE0, le loro famiglie e le comunit\xE0 che li accolgono, offrendo riflessioni, testimonianze e strumenti per vivere insieme la diversit\xE0 come una ricchezza.`;
      const blocchiRivista = [
        { titolo: "Testimonianze", descrizione: "Voci e storie di chi vive la disabilit\xE0 e l'inclusione ogni giorno.", href: "/categoria/testimonianze" },
        { titolo: "Esperienze", descrizione: "Percorsi condivisi di comunit\xE0, associazioni e famiglie.", href: "/categoria/interviste" },
        { titolo: "Riflessioni", descrizione: "Approfondimenti su spiritualit\xE0, dignit\xE0 e cultura dell'accoglienza.", href: "/categoria/riflessioni" },
        { titolo: "Cultura", descrizione: "Recensioni, interviste e sguardi sul mondo che ci circonda.", href: "/categoria/recensioni" }
      ];
      const timeline = [
        { anno: "1977", titolo: "Nasce 'Insieme'", descrizione: "Il primo bollettino ciclostilato. Il desiderio di non restare soli.", linkTesto: "Primo numero Insieme", linkUrl: "/archivio/ins-1" },
        { anno: "1983", titolo: "Ombre e Luci", descrizione: "Esce il numero 1. Formato professionale, temi di vita, fede e inclusione.", linkTesto: "Numero 1 (PDF)", linkUrl: "https://archive.org/download/OmbreELuci_001/Ombre-e-Luci-n.1.pdf", linkPagina: "/archivio/oel-1" },
        { anno: "2010", titolo: "Web", descrizione: "La rivista approda online." },
        { anno: "2018", titolo: "Digitalizzazione", descrizione: "Inizia il recupero dell'archivio storico, un 'regalo' per i 40 anni della rivista.", linkTesto: "Leggi", linkUrl: "/blog/digitalizzando-ombre-e-luci-come-un-album-di-famiglia" },
        { anno: "2023", titolo: "In English!", descrizione: "Apertura internazionale con la versione inglese.", linkTesto: "Leggi", linkUrl: "/blog/ombre-e-luci-in-inglese" },
        { anno: "2025", titolo: "Progetto AiOeL", descrizione: "L'intelligenza artificiale al servizio della memoria e delle voci dell'archivio.", linkTesto: "Leggi", linkUrl: "/blog/intelligenza-artificiale-e-memoria-editoriale-il-mio-lavoro-con-ombre-e-luci" }
      ];
      const redazioneChiave = [
        { nome: "Giulia Galeotti", ruolo: "Direttore responsabile", slug: "giulia-galeotti", foto: "giulia-galeotti.webp", bioBreve: "Dirige la rivista con uno sguardo attento alla qualit\xE0 editoriale e ai temi dell'inclusione e della spiritualit\xE0." },
        { nome: "Cristina Tersigni", ruolo: "Responsabile editoriale", slug: "cristina-tersigni", foto: "cristina-tersigni.webp", bioBreve: "Coordina la redazione e i progetti editoriali di Ombre e Luci, curando il dialogo tra contenuti e comunit\xE0." },
        { nome: "Matteo Cinti", ruolo: "Grafica e design", slug: "matteo-cinti", foto: "matteo-cinti.png", bioBreve: "Cura l'identit\xE0 visiva e la grafica della rivista, in carta e in digitale." },
        { nome: "Franco Manuzio", ruolo: "Area digital", slug: "franco-manuzio", foto: "franco-manuzio.jpg", bioBreve: "Responsabile dell'area digital, informatizzazione dell'archivio cartaceo e progetti di intelligenza artificiale." }
      ];
      const comeLavoriamo = [
        "Ascolto del territorio: ascoltiamo le comunit\xE0, le famiglie e i lettori per cogliere i temi che bruciano.",
        "Scelta del tema: ogni numero prende forma attorno a un tema guida, declinato in testimonianze, riflessioni e cultura.",
        "Cura del linguaggio: parole accessibili e rispettose, senza rinunciare alla profondit\xE0.",
        "Apertura al dialogo: la rivista \xE8 un luogo di incontro tra voci diverse, in Italia e nel mondo."
      ];
      const linkStoricaRedazione = "/archivio";
      const storica = [
        { nome: "Mariangela Bertolini", ruolo: "Fondatrice", slug: "mariangela-bertolini", foto: "mariangela-bertolini.png" },
        { nome: "Nicole Schulthes", ruolo: "Caporedattore", slug: "nicole-schulthes", foto: "nicole-schulthes.jpg" },
        { nome: "Sergio Sciascia", ruolo: "Direttore responsabile", slug: "sergio-sciascia", foto: "sergio-sciascia.jpg" },
        { nome: "Natalia Livi", ruolo: "Redazione", slug: "natalia-livi", foto: "natalia-livi.jpg" },
        { nome: "Maria Teresa Mazzarotto", ruolo: "Redazione", slug: "maria-teresa-mazzarotto", foto: "maria-teresa-mazzarotto.jpg" }
      ];
      const collaboratori = [
        { nome: "Nicla Bettazzi", slug: "nicla-bettazzi", foto: "nicla-bettazzi.jpg" },
        { nome: "Don Marco Bove", slug: "don-marco-bove", foto: "don-marco-bove.jpg" },
        { nome: "Claudio Cinus", slug: "claudio-cinus", foto: "claudio-cinus.jpg" },
        { nome: "Benedetta Mattei", slug: "benedetta-mattei", foto: "benedetta-mattei.png" },
        { nome: "Rita Massi", slug: "rita-massi", foto: "rita-massi.png" },
        { nome: "Giovanni Grossi", slug: "giovanni-grossi", foto: "giovanni-grossi.png" },
        { nome: "Serena Sillitto", slug: "serena-sillitto", foto: "serena-sillitto.png" },
        { nome: "Silvia Camisasca", slug: "silvia-camisasca", foto: "silvia-camisasca.jpg" },
        { nome: "Silvia Gusmani", slug: "silvia-gusmani", foto: "silvia-gusmani.jpg" },
        { nome: "Alessandro De Simone", slug: "alessandro-de-simone", foto: "alessandro-de-simone.jpg" },
        { nome: "Laura Coccia", slug: "laura-coccia", foto: "laura-coccia.jpg" },
        { nome: "Enrica Riera", slug: "enrica-riera", foto: "enrica-riera.png" }
      ];
      function iniziali(nome) {
        return (nome || "").split(/\s+/).map((p) => p.charAt(0)).join("").slice(0, 2).toUpperCase();
      }
      __name(iniziali, "iniziali");
      return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Chi siamo", "description": "Ombre e Luci: chi siamo, la nostra storia, la redazione e la missione editoriale.", "noindex": true, "data-astro-cid-7fbizugy": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main chi-siamo-main" data-astro-cid-7fbizugy> <div class="chi-siamo-layout container" data-astro-cid-7fbizugy> ${renderComponent($$result2, "AboutSidebar", $$AboutSidebar, { "active": "", "useAnchors": true, "data-astro-cid-7fbizugy": true })} <div class="chi-siamo-content" data-astro-cid-7fbizugy> <!-- Hero --> <section class="chi-siamo-section chi-siamo-hero" id="hero" data-astro-cid-7fbizugy> <div class="chi-siamo-section-inner" data-astro-cid-7fbizugy> <h1 class="chi-siamo-title" data-astro-cid-7fbizugy>Chi Siamo</h1> <p class="chi-siamo-manifesto" data-astro-cid-7fbizugy>${manifestoHero}</p> <div class="chi-siamo-cta" data-astro-cid-7fbizugy> <a href="/" class="button" data-astro-cid-7fbizugy>Leggi gli articoli</a> <a href="/sostienici" class="button button-outline" data-astro-cid-7fbizugy>Sostienici</a> </div> </div> </section> <!-- La Rivista --> <section class="chi-siamo-section chi-siamo-section--cream" id="la-rivista" data-astro-cid-7fbizugy> <div class="chi-siamo-section-inner" data-astro-cid-7fbizugy> <h2 class="chi-siamo-h2" data-astro-cid-7fbizugy>La Rivista</h2> <p class="chi-siamo-lead" data-astro-cid-7fbizugy>Rivista trimestrale che mette al centro l'inclusione e la dignità di ogni persona, attraverso testimonianze, esperienze e riflessioni.</p> <div class="rivista-cards" data-astro-cid-7fbizugy> ${blocchiRivista.map((b) => renderTemplate`<a${addAttribute(b.href, "href")} class="rivista-card rivista-card-link" data-astro-cid-7fbizugy> <h3 class="rivista-card-title" data-astro-cid-7fbizugy>${b.titolo}</h3> <p class="rivista-card-desc" data-astro-cid-7fbizugy>${b.descrizione}</p> </a>`)} </div> <div class="timeline-wrap" data-astro-cid-7fbizugy> <h3 class="chi-siamo-h3" data-astro-cid-7fbizugy>Album di Famiglia</h3> <ol class="timeline" data-astro-cid-7fbizugy> ${timeline.map((t2) => renderTemplate`<li class="timeline-item" data-astro-cid-7fbizugy> <span class="timeline-anno" data-astro-cid-7fbizugy>${t2.anno}</span> <span class="timeline-titolo" data-astro-cid-7fbizugy>${t2.titolo}</span> <p class="timeline-desc" data-astro-cid-7fbizugy>${t2.descrizione}</p> ${t2.linkTesto && t2.linkUrl && renderTemplate`<p class="timeline-link" data-astro-cid-7fbizugy> <a${addAttribute(t2.linkUrl, "href")}${addAttribute(t2.linkUrl.startsWith("http") ? "_blank" : void 0, "target")}${addAttribute(t2.linkUrl.startsWith("http") ? "noopener noreferrer" : void 0, "rel")} data-astro-cid-7fbizugy>${t2.linkTesto}</a> ${t2.linkPagina && renderTemplate`<span data-astro-cid-7fbizugy> · </span>`} ${t2.linkPagina && renderTemplate`<a${addAttribute(t2.linkPagina, "href")} data-astro-cid-7fbizugy>Vai al numero</a>`} </p>`} </li>`)} </ol> </div> </div> </section> <!-- La Redazione --> <section class="chi-siamo-section" id="la-redazione" data-astro-cid-7fbizugy> <div class="chi-siamo-section-inner" data-astro-cid-7fbizugy> <h2 class="chi-siamo-h2" data-astro-cid-7fbizugy>La Redazione</h2> <div class="redazione-grid redazione-grid--4" data-astro-cid-7fbizugy> ${redazioneChiave.map((r2) => renderTemplate`<article class="redazione-card" data-astro-cid-7fbizugy> <div class="redazione-card-photo redazione-card-photo--circle" aria-hidden="true" data-astro-cid-7fbizugy> <img${addAttribute(`/images/redazione/${r2.foto || r2.slug + ".jpg"}`, "src")} alt="" width="200" height="200" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" data-astro-cid-7fbizugy> <span class="redazione-photo-fallback" data-astro-cid-7fbizugy>${iniziali(r2.nome)}</span> </div> <h3 class="redazione-card-nome" data-astro-cid-7fbizugy><a${addAttribute(`/autori/${r2.slug}`, "href")} data-astro-cid-7fbizugy>${r2.nome}</a></h3> <p class="redazione-card-ruolo" data-astro-cid-7fbizugy>${r2.ruolo}</p> <p class="redazione-card-bio" data-astro-cid-7fbizugy>${r2.bioBreve}</p> <a${addAttribute(`/autori/${r2.slug}`, "href")} class="redazione-leggi-piu" data-astro-cid-7fbizugy>Leggi di più</a> </article>`)} </div> <div class="come-lavoriamo" data-astro-cid-7fbizugy> <h3 class="chi-siamo-h3" data-astro-cid-7fbizugy>Come lavoriamo</h3> <ul class="come-lavoriamo-list" data-astro-cid-7fbizugy> ${comeLavoriamo.map((item) => renderTemplate`<li data-astro-cid-7fbizugy>${item}</li>`)} </ul> </div> </div> </section> <!-- La Redazione Storica --> <section class="chi-siamo-section chi-siamo-section--cream" id="redazione-storica" data-astro-cid-7fbizugy> <div class="chi-siamo-section-inner" data-astro-cid-7fbizugy> <h2 class="chi-siamo-h2" data-astro-cid-7fbizugy>La Redazione storica</h2> <p class="chi-siamo-lead" data-astro-cid-7fbizugy>I volti che hanno costruito Ombre e Luci dagli inizi fino a pochi anni fa. <a${addAttribute(linkStoricaRedazione, "href")} data-astro-cid-7fbizugy>La storica redazione</a> →</p> <div class="storica-grid storica-grid--5" data-astro-cid-7fbizugy> ${storica.map((s) => renderTemplate`<article class="storica-card storica-card--solo-foto" data-astro-cid-7fbizugy> <div class="storica-card-photo storica-card-photo--circle" aria-hidden="true" data-astro-cid-7fbizugy> <img${addAttribute(`/images/redazione/${s.foto || s.slug + ".jpg"}`, "src")} alt="" width="200" height="200" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" data-astro-cid-7fbizugy> <span class="redazione-photo-fallback" data-astro-cid-7fbizugy>${iniziali(s.nome)}</span> </div> <h3 class="storica-card-nome" data-astro-cid-7fbizugy><a${addAttribute(`/autori/${s.slug}`, "href")} data-astro-cid-7fbizugy>${s.nome}</a></h3> <p class="storica-card-ruolo" data-astro-cid-7fbizugy>${s.ruolo}</p> </article>`)} </div> </div> </section> <!-- Collaboratori --> <section class="chi-siamo-section" id="collaboratori" data-astro-cid-7fbizugy> <div class="chi-siamo-section-inner" data-astro-cid-7fbizugy> <h2 class="chi-siamo-h2" data-astro-cid-7fbizugy>Collaboratori</h2> <p class="chi-siamo-lead" data-astro-cid-7fbizugy>Giornalisti, traduttori e professionisti che contribuiscono alla rivista.</p> <div class="collaboratori-grid collaboratori-grid--2x6" data-astro-cid-7fbizugy> ${collaboratori.map((c) => renderTemplate`<a${addAttribute(`/autori/${c.slug}`, "href")} class="collaboratore-card collaboratore-card--solo-foto" data-astro-cid-7fbizugy> <div class="collaboratore-photo collaboratore-photo--circle" aria-hidden="true" data-astro-cid-7fbizugy> <img${addAttribute(`/images/redazione/${c.foto || c.slug + ".jpg"}`, "src")} alt="" width="80" height="80" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" data-astro-cid-7fbizugy> <span class="redazione-photo-fallback" data-astro-cid-7fbizugy>${iniziali(c.nome)}</span> </div> <span class="collaboratore-nome" data-astro-cid-7fbizugy>${c.nome}</span> </a>`)} </div> </div> </section> <!-- Hanno scritto per noi --> <section class="chi-siamo-section chi-siamo-section--cream" id="hanno-scritto-per-noi" data-astro-cid-7fbizugy> <div class="chi-siamo-section-inner" data-astro-cid-7fbizugy> <h2 class="chi-siamo-h2" data-astro-cid-7fbizugy>Hanno scritto per noi</h2> <p class="chi-siamo-lead hanno-scritto-testo" data-astro-cid-7fbizugy>Negli anni oltre 400 autori, testimoni e ospiti hanno contribuito a raccontare la fragilità sulle pagine di Ombre e Luci. <a href="/autori" data-astro-cid-7fbizugy>Vedi tutti gli autori</a>.</p> </div> </section> <!-- Contatti --> <section class="chi-siamo-section" id="contatti" data-astro-cid-7fbizugy> <div class="chi-siamo-section-inner" data-astro-cid-7fbizugy> <h2 class="chi-siamo-h2" data-astro-cid-7fbizugy>Info e contatti redazione</h2> <div class="contatti-grid" data-astro-cid-7fbizugy> <div class="contatti-card" data-astro-cid-7fbizugy> <h3 class="contatti-card-title" data-astro-cid-7fbizugy>Email</h3> <p data-astro-cid-7fbizugy><a href="mailto:redazione@ombreeluci.it" data-astro-cid-7fbizugy>redazione@ombreeluci.it</a></p> </div> <div class="contatti-card" data-astro-cid-7fbizugy> <h3 class="contatti-card-title" data-astro-cid-7fbizugy>Telefono / WhatsApp</h3> <p data-astro-cid-7fbizugy><a href="tel:+390612345678" data-astro-cid-7fbizugy>+39 06 12345678</a></p> </div> <div class="contatti-card contatti-card--mappa" data-astro-cid-7fbizugy> <h3 class="contatti-card-title" data-astro-cid-7fbizugy>Dove siamo</h3> <p data-astro-cid-7fbizugy>Viale di Valle Aurelia 92, Roma</p> <div class="mappa-placeholder" aria-hidden="true" data-astro-cid-7fbizugy> <span data-astro-cid-7fbizugy>Mappa (inserire embed o link Google Maps)</span> </div> </div> </div> <div class="contatti-orari" data-astro-cid-7fbizugy> <h3 class="chi-siamo-h3" data-astro-cid-7fbizugy>Orari</h3> <table class="orari-table" aria-label="Orari di apertura" data-astro-cid-7fbizugy> <tbody data-astro-cid-7fbizugy> <tr data-astro-cid-7fbizugy><th scope="row" data-astro-cid-7fbizugy>Lun – Ven</th><td data-astro-cid-7fbizugy>10:00 – 13:00</td></tr> <tr data-astro-cid-7fbizugy><th scope="row" data-astro-cid-7fbizugy>Mercoledì</th><td data-astro-cid-7fbizugy>10:00 – 16:00</td></tr> </tbody> </table> </div> </div> </section> </div> </div> </main>  ` })}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/index.astro", void 0);
    $$file5 = "C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/index.astro";
    $$url5 = "/chi-siamo";
    _page7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$Index3,
      file: $$file5,
      url: $$url5
    }, Symbol.toStringTag, { value: "Module" }));
    page7 = /* @__PURE__ */ __name(() => _page7, "page");
  }
});

// _worker.js/pages/sostienici.astro.mjs
var sostienici_astro_exports = {};
__export(sostienici_astro_exports, {
  page: () => page8,
  renderers: () => renderers8
});
import { renderers as renderers8 } from "../renderers.mjs";
var $$Astro$22, $$AmountChips, $$SupportBox, $$Astro$13, $$SupportHero, $$Astro6, $$CopyField, $$FaqAccordion, $$Sostienici, $$file6, $$url6, _page8, page8;
var init_sostienici_astro = __esm({
  "_worker.js/pages/sostienici.astro.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    init_BaseLayout_DIxcXjbq();
    init_Footer_D9bdzLvP();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro$22 = createAstro();
    $$AmountChips = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$22, $$props, $$slots);
      Astro2.self = $$AmountChips;
      const { frequency } = Astro2.props;
      const suffix = frequency === "monthly" ? "/ mese" : "";
      return renderTemplate`${maybeRenderHead()}<div class="amount-chips" role="group" aria-label="Scegli importo" data-astro-cid-tslgwnhr> ${AMOUNT_CHIPS.map((eur) => renderTemplate`<button type="button" class="amount-chip"${addAttribute(eur, "data-amount")} data-track="support_select_amount" data-astro-cid-tslgwnhr> ${eur}€${suffix} </button>`)} <button type="button" class="amount-chip amount-chip-other" data-amount="other" data-track="support_select_amount" data-astro-cid-tslgwnhr>
Altro
</button> </div> `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/support/AmountChips.astro", void 0);
    $$SupportBox = createComponent(($$result, $$props, $$slots) => {
      return renderTemplate`${maybeRenderHead()}<div class="support-box" id="support-box" data-astro-cid-kp6ng5qc> <p class="support-box-label" data-astro-cid-kp6ng5qc>Scelta importo rapida</p> ${renderComponent($$result, "AmountChips", $$AmountChips, { "frequency": "monthly", "data-astro-cid-kp6ng5qc": true })} <p class="support-box-modi-label" data-astro-cid-kp6ng5qc>Due modalità</p> <div class="support-box-toggle" role="group" aria-label="Modalità donazione" data-astro-cid-kp6ng5qc> <button type="button" class="support-toggle-btn active" data-frequency="monthly" data-track="support_toggle_frequency" data-astro-cid-kp6ng5qc>
Donazione mensile
</button> <button type="button" class="support-toggle-btn" data-frequency="once" data-track="support_toggle_frequency" data-astro-cid-kp6ng5qc>
Donazione singola
</button> </div> <a${addAttribute(PAYPAL_DONATE_URL, "href")} target="_blank" rel="noopener noreferrer" class="support-box-cta support-box-cta-primary" id="support-paypal-cta" data-track="support_click_paypal" data-cta-monthly="Dona" data-cta-once="Dona" data-astro-cid-kp6ng5qc>
Dona
</a> <a href="#bonifico" class="support-box-bonifico" id="support-bonifico-scroll" data-track="support_click_bonifico_scroll" data-astro-cid-kp6ng5qc>
Preferisci il bonifico (senza commissioni)
</a> </div>  `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/support/SupportBox.astro", void 0);
    $$Astro$13 = createAstro();
    $$SupportHero = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$13, $$props, $$slots);
      Astro2.self = $$SupportHero;
      const { imageSrcs, imageAlt = "Ombre e Luci" } = Astro2.props;
      const sources = imageSrcs.length >= 1 ? imageSrcs : [""];
      return renderTemplate`${maybeRenderHead()}<div class="support-page-layout" id="top" data-astro-cid-x3s7ovq3> <!-- Colonna sinistra: slider sticky (resta visibile finché la sezione è in view, poi esce con la sezione) --> <div class="support-hero-visual support-hero-visual--sticky" aria-hidden="true" data-astro-cid-x3s7ovq3> ${sources.map((src, i) => renderTemplate`<img${addAttribute(src, "src")} alt="" width="800" height="533"${addAttribute(`support-hero-img support-hero-img-${i} ${i === 0 ? "support-hero-img-visible" : ""}`, "class")}${addAttribute(i, "data-hero-index")} data-astro-cid-x3s7ovq3>`)} <div class="support-hero-overlay" aria-hidden="true" data-astro-cid-x3s7ovq3></div> </div> <!-- Colonna destra: tutto il contenuto scrollabile --> <div class="support-hero-right" data-astro-cid-x3s7ovq3> <main class="site-main" data-astro-cid-x3s7ovq3> <div class="support-hero-content" data-astro-cid-x3s7ovq3> <h1 class="support-hero-h1" data-astro-cid-x3s7ovq3>Sostieni Ombre e Luci</h1> <h2 class="support-hero-h2" data-astro-cid-x3s7ovq3>Aiutaci a tenere accesa la luce</h2> ${renderComponent($$result, "SupportBox", $$SupportBox, { "data-astro-cid-x3s7ovq3": true })} </div> ${renderSlot($$result, $$slots["default"])} </main> </div> </div>  `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/support/SupportHero.astro", void 0);
    $$Astro6 = createAstro();
    $$CopyField = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro6, $$props, $$slots);
      Astro2.self = $$CopyField;
      const { label, value, trackId, copyValue = value } = Astro2.props;
      return renderTemplate`${maybeRenderHead()}<div class="copy-field" data-astro-cid-ikwklcaw> <span class="copy-field-label" data-astro-cid-ikwklcaw>${label}</span> <div class="copy-field-row" data-astro-cid-ikwklcaw> <code class="copy-field-value"${addAttribute(copyValue, "data-copy-value")} data-astro-cid-ikwklcaw>${value}</code> <button type="button" class="copy-field-btn"${addAttribute(copyValue, "data-copy-value")}${addAttribute(trackId, "data-track-id")}${addAttribute(`Copia ${label}`, "aria-label")} data-astro-cid-ikwklcaw>
Copia
</button> </div> </div> `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/support/CopyField.astro", void 0);
    $$FaqAccordion = createComponent(($$result, $$props, $$slots) => {
      const items = [
        {
          q: "Ricevuta o detraibilit\xE0?",
          a: `Siamo un ETS. Se ti serve attestazione scrivici a ${EMAIL}.`
        },
        {
          q: "Donazione ricorrente senza PayPal?",
          a: "Puoi impostare un bonifico ricorrente dalla tua banca (mensile o altro)."
        },
        {
          q: "Dall'estero?",
          a: "Contattaci e ti indichiamo il modo pi\xF9 semplice."
        },
        {
          q: "Come disdire?",
          a: "Da PayPal (nel tuo account) o annullando il bonifico ricorrente in banca."
        }
      ];
      return renderTemplate`${maybeRenderHead()}<div class="faq-accordion" role="region" aria-label="Domande frequenti" data-astro-cid-lwykoj3g> ${items.map((item, i) => renderTemplate`<div class="faq-item"${addAttribute(i, "data-faq-index")} data-astro-cid-lwykoj3g> <button type="button" class="faq-question" aria-expanded="false"${addAttribute(`faq-answer-${i}`, "aria-controls")}${addAttribute(`faq-q-${i}`, "id")} data-astro-cid-lwykoj3g> ${item.q} </button> <div class="faq-answer"${addAttribute(`faq-answer-${i}`, "id")} role="region"${addAttribute(`faq-q-${i}`, "aria-labelledby")} hidden data-astro-cid-lwykoj3g> <p data-astro-cid-lwykoj3g>${item.a}</p> </div> </div>`)} </div>  `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/support/FaqAccordion.astro", void 0);
    $$Sostienici = createComponent(($$result, $$props, $$slots) => {
      const heroImages = ["/images/dona1.webp", "/images/dona2.webp", "/images/dona3.webp", "/images/dona4.webp", "/images/dona7.webp"];
      return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Sostieni Ombre e Luci", "description": "Sostieni Ombre e Luci con una donazione. Senza sponsor: la rivista vive grazie a chi la legge.", "bodyClass": "support-page", "data-astro-cid-xcf3rk25": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div id="support-toast" class="support-toast" role="status" aria-live="polite" aria-hidden="true" data-astro-cid-xcf3rk25> <span class="support-toast-icon" data-astro-cid-xcf3rk25>✓</span> <span class="support-toast-text" data-astro-cid-xcf3rk25>Copiato</span> </div> <a href="#support-box" class="support-sticky-cta" id="support-sticky-cta" aria-label="Vai a dona" data-astro-cid-xcf3rk25>Dona ora</a> ${renderComponent($$result2, "SupportHero", $$SupportHero, { "imageSrcs": heroImages, "imageAlt": "Ombre e Luci", "data-astro-cid-xcf3rk25": true }, { "default": ($$result3) => renderTemplate` <div class="container support-container" data-astro-cid-xcf3rk25> <section class="support-section support-altri-modi" id="altri-modi" aria-labelledby="altri-modi-label" data-astro-cid-xcf3rk25> <span id="altri-modi-label" class="support-section-label" data-astro-cid-xcf3rk25>Altri modi per sostenerci</span> <div class="support-cards" data-astro-cid-xcf3rk25> <div class="support-card" id="bonifico" data-astro-cid-xcf3rk25> <span class="support-card-label" data-astro-cid-xcf3rk25>Bonifico</span> <p class="support-card-intestatario" data-astro-cid-xcf3rk25>${INTESTATARIO}</p> ${renderComponent($$result3, "CopyField", $$CopyField, { "label": "IBAN", "value": IBAN_DISPLAY, "copyValue": IBAN_RAW, "trackId": "support_copy_iban", "data-astro-cid-xcf3rk25": true })} ${renderComponent($$result3, "CopyField", $$CopyField, { "label": "CCP", "value": CCP_DISPLAY, "copyValue": CCP, "trackId": "support_copy_ccp", "data-astro-cid-xcf3rk25": true })} <p class="support-card-hint" data-astro-cid-xcf3rk25>Puoi impostare un bonifico ricorrente dalla tua banca.</p> </div> <div class="support-card" id="cinquemille" data-astro-cid-xcf3rk25> <span class="support-card-label" data-astro-cid-xcf3rk25>5×1000</span> <p class="support-card-hint" data-astro-cid-xcf3rk25>Ti costa zero. Firma nel riquadro «Sostegno del volontariato» e inserisci il codice fiscale.</p> ${renderComponent($$result3, "CopyField", $$CopyField, { "label": "Codice Fiscale", "value": CF, "trackId": "support_copy_cf", "data-astro-cid-xcf3rk25": true })} <p class="support-card-runts" data-astro-cid-xcf3rk25>RUNTS ${RUNTS}</p> </div> <div class="support-card" id="abbonamento" data-astro-cid-xcf3rk25> <span class="support-card-label" data-astro-cid-xcf3rk25>Abbonamento</span> <p class="support-card-abbonamento" data-astro-cid-xcf3rk25>${NUMERI_ANNO} numeri l'anno · ${ABBONAMENTO_ANNO}€/anno oppure ${ABBONAMENTO_MESE}€/mese</p> <a${addAttribute(`mailto:${EMAIL}?subject=Abbonamento Ombre e Luci`, "href")} class="support-card-link" data-astro-cid-xcf3rk25>Scopri abbonamento</a> </div> </div> </section> <section class="support-section support-impatto" aria-labelledby="impatto-label" data-astro-cid-xcf3rk25> <span id="impatto-label" class="support-section-label" data-astro-cid-xcf3rk25>Cosa rendi possibile</span> <ul class="support-impatto-list" data-astro-cid-xcf3rk25> <li data-astro-cid-xcf3rk25>Pubblicazione e lavoro editoriale</li> <li data-astro-cid-xcf3rk25>Sito e archivio</li> <li data-astro-cid-xcf3rk25>Stampa e spedizione dei numeri</li> <li data-astro-cid-xcf3rk25>Progetti e attività collegati a Fede e Luce</li> </ul> <p class="support-impatto-chiudi" data-astro-cid-xcf3rk25>Ogni euro va dove serve.</p> </section> <section class="support-section support-faq" aria-labelledby="faq-label" data-astro-cid-xcf3rk25> <span id="faq-label" class="support-section-label" data-astro-cid-xcf3rk25>Domande frequenti</span> ${renderComponent($$result3, "FaqAccordion", $$FaqAccordion, { "data-astro-cid-xcf3rk25": true })} </section> </div> ` })}   ` })}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/sostienici.astro", void 0);
    $$file6 = "C:/Users/berto/Documents/Ombreeluci/src/pages/sostienici.astro";
    $$url6 = "/sostienici";
    _page8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$Sostienici,
      file: $$file6,
      url: $$url6
    }, Symbol.toStringTag, { value: "Module" }));
    page8 = /* @__PURE__ */ __name(() => _page8, "page");
  }
});

// _worker.js/pages/test-lista.astro.mjs
var test_lista_astro_exports = {};
__export(test_lista_astro_exports, {
  page: () => page9,
  renderers: () => renderers9
});
import { renderers as renderers9 } from "../renderers.mjs";
var $$TestLista, $$file7, $$url7, _page9, page9;
var init_test_lista_astro = __esm({
  "_worker.js/pages/test-lista.astro.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    init_ViewTransitions_Dvx2U5F3();
    init_Footer_D9bdzLvP();
    init_directus_B0n0XETK();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$TestLista = createComponent(async ($$result, $$props, $$slots) => {
      let allArticlesList = [];
      try {
        const allArticles = await getAllArticoli();
        allArticlesList = allArticles.filter((a) => a.data_pubblicazione != null).sort((a, b) => new Date(b.data_pubblicazione).getTime() - new Date(a.data_pubblicazione).getTime());
      } catch (error2) {
        console.error("Errore caricamento articoli:", error2);
      }
      return renderTemplate`<html lang="it" data-astro-cid-hs2xiw36> <head><meta name="robots" content="noindex, nofollow">${renderComponent($$result, "ViewTransitions", $$ViewTransitions, { "data-astro-cid-hs2xiw36": true })}<meta charset="utf-8"><link rel="icon" type="image/png" href="/favicon.png"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Lista Completa Articoli - Ombre e Luci</title>${renderHead()}</head> <body data-astro-cid-hs2xiw36> ${renderComponent($$result, "Header", $$Header, { "data-astro-cid-hs2xiw36": true })} <div class="test-lista-main" data-astro-cid-hs2xiw36> <h1 data-astro-cid-hs2xiw36>Lista Completa Articoli</h1> <div class="stats" data-astro-cid-hs2xiw36>
Totale articoli: ${allArticlesList.length} <br data-astro-cid-hs2xiw36> <a href="/" style="color: #0066cc; text-decoration: underline; margin-top: 0.5rem; display: inline-block;" data-astro-cid-hs2xiw36>← Torna all'archivio</a> </div> <ol class="article-list" data-astro-cid-hs2xiw36> ${allArticlesList.map((a) => renderTemplate`<li class="article-item" data-astro-cid-hs2xiw36> <a${addAttribute(`/blog/${a.slug}`, "href")} class="article-link" data-astro-cid-hs2xiw36> ${a.titolo || "Titolo mancante"} </a> <span class="article-meta" data-astro-cid-hs2xiw36>
(${a.data_pubblicazione ? new Date(a.data_pubblicazione).getFullYear() : "?"}) - ${a.autore?.nome_completo || "Autore sconosciuto"} - Cluster: ${a.cluster_id} </span> </li>`)} </ol> </div> ${renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-hs2xiw36": true })} </body></html>`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/test-lista.astro", void 0);
    $$file7 = "C:/Users/berto/Documents/Ombreeluci/src/pages/test-lista.astro";
    $$url7 = "/test-lista";
    _page9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$TestLista,
      file: $$file7,
      url: $$url7
    }, Symbol.toStringTag, { value: "Module" }));
    page9 = /* @__PURE__ */ __name(() => _page9, "page");
  }
});

// _worker.js/pages/test-minimal.astro.mjs
var test_minimal_astro_exports = {};
__export(test_minimal_astro_exports, {
  page: () => page10,
  renderers: () => renderers10
});
import { renderers as renderers10 } from "../renderers.mjs";
var $$Astro7, $$TestMinimal, $$file8, $$url8, _page10, page10;
var init_test_minimal_astro = __esm({
  "_worker.js/pages/test-minimal.astro.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro7 = createAstro();
    $$TestMinimal = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro7, $$props, $$slots);
      Astro2.self = $$TestMinimal;
      return renderTemplate`<html lang="it"> <head><meta name="robots" content="noindex, nofollow"><meta charset="utf-8"><link rel="icon" type="image/png" href="/favicon.png"><title>Test Minimale</title>${renderHead()}</head> <body> <h1>✅ Server Funzionante!</h1> <p>Se vedi questa pagina, Astro funziona correttamente.</p> <p><a href="/">Vai alla Home</a></p> </body></html>`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/test-minimal.astro", void 0);
    $$file8 = "C:/Users/berto/Documents/Ombreeluci/src/pages/test-minimal.astro";
    $$url8 = "/test-minimal";
    _page10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$TestMinimal,
      file: $$file8,
      url: $$url8
    }, Symbol.toStringTag, { value: "Module" }));
    page10 = /* @__PURE__ */ __name(() => _page10, "page");
  }
});

// _worker.js/pages/test-no-articles.astro.mjs
var test_no_articles_astro_exports = {};
__export(test_no_articles_astro_exports, {
  page: () => page11,
  renderers: () => renderers11
});
import { renderers as renderers11 } from "../renderers.mjs";
var $$Astro8, $$TestNoArticles, $$file9, $$url9, _page11, page11;
var init_test_no_articles_astro = __esm({
  "_worker.js/pages/test-no-articles.astro.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro8 = createAstro();
    $$TestNoArticles = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro8, $$props, $$slots);
      Astro2.self = $$TestNoArticles;
      return renderTemplate`<html lang="it" data-astro-cid-nuq3akgm> <head><meta name="robots" content="noindex, nofollow"><meta charset="utf-8"><link rel="icon" type="image/png" href="/favicon.png"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Test Senza Articoli</title>${renderHead()}</head> <body data-astro-cid-nuq3akgm> <div class="success" data-astro-cid-nuq3akgm> <h1 data-astro-cid-nuq3akgm>✅ Server Funzionante!</h1> <p data-astro-cid-nuq3akgm>Se vedi questa pagina, il server Astro funziona correttamente.</p> <p data-astro-cid-nuq3akgm>Questa pagina NON carica articoli, quindi se funziona significa che il problema è nel caricamento degli articoli.</p> </div> <h2 data-astro-cid-nuq3akgm>Test di Navigazione</h2> <ul data-astro-cid-nuq3akgm> <li data-astro-cid-nuq3akgm><a href="/test-minimal" data-astro-cid-nuq3akgm>Test Minimale</a> - Pagina senza articoli</li> <li data-astro-cid-nuq3akgm><a href="/test-status" data-astro-cid-nuq3akgm>Test Status</a> - Mostra stato server</li> <li data-astro-cid-nuq3akgm><a href="/" data-astro-cid-nuq3akgm>Homepage</a> - Carica tutti gli articoli (potrebbe bloccarsi)</li> <li data-astro-cid-nuq3akgm><a href="/test-lista" data-astro-cid-nuq3akgm>Lista Articoli</a> - Lista completa (potrebbe bloccarsi)</li> </ul> <h2 data-astro-cid-nuq3akgm>Diagnostica</h2> <p data-astro-cid-nuq3akgm>Se questa pagina si carica ma la homepage no, il problema è probabilmente:</p> <ul data-astro-cid-nuq3akgm> <li data-astro-cid-nuq3akgm>Validazione Zod fallisce su alcuni articoli</li> <li data-astro-cid-nuq3akgm>Articoli con dati non validi (date, URL, ecc.)</li> <li data-astro-cid-nuq3akgm>Problema di memoria durante il caricamento di troppi articoli</li> </ul> </body></html>`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/test-no-articles.astro", void 0);
    $$file9 = "C:/Users/berto/Documents/Ombreeluci/src/pages/test-no-articles.astro";
    $$url9 = "/test-no-articles";
    _page11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$TestNoArticles,
      file: $$file9,
      url: $$url9
    }, Symbol.toStringTag, { value: "Module" }));
    page11 = /* @__PURE__ */ __name(() => _page11, "page");
  }
});

// _worker.js/pages/test-status.astro.mjs
var test_status_astro_exports = {};
__export(test_status_astro_exports, {
  page: () => page12,
  renderers: () => renderers12
});
import { renderers as renderers12 } from "../renderers.mjs";
var $$Astro9, $$TestStatus, $$file10, $$url10, _page12, page12;
var init_test_status_astro = __esm({
  "_worker.js/pages/test-status.astro.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    init_directus_B0n0XETK();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro9 = createAstro();
    $$TestStatus = createComponent(async ($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro9, $$props, $$slots);
      Astro2.self = $$TestStatus;
      let articleCount = 0;
      let errorMessage = null;
      try {
        const articles = await getAllArticoli();
        articleCount = articles.length;
      } catch (error2) {
        errorMessage = error2.message;
      }
      return renderTemplate`<html lang="it" data-astro-cid-cr2jheuo> <head><meta name="robots" content="noindex, nofollow"><meta charset="utf-8"><link rel="icon" type="image/png" href="/favicon.png"><title>Test Status - Ombre e Luci</title>${renderHead()}</head> <body data-astro-cid-cr2jheuo> <h1 data-astro-cid-cr2jheuo>Test Status Server</h1> ${errorMessage ? renderTemplate`<div class="status error" data-astro-cid-cr2jheuo> <strong data-astro-cid-cr2jheuo>❌ Errore:</strong> ${errorMessage} </div>` : renderTemplate`<div class="status success" data-astro-cid-cr2jheuo> <strong data-astro-cid-cr2jheuo>✅ Server Funzionante!</strong> <p data-astro-cid-cr2jheuo>Articoli caricati: <strong data-astro-cid-cr2jheuo>${articleCount}</strong></p> </div>`} <div class="status info" data-astro-cid-cr2jheuo> <h3 data-astro-cid-cr2jheuo>Link di Test:</h3> <ul data-astro-cid-cr2jheuo> <li data-astro-cid-cr2jheuo><a href="/" data-astro-cid-cr2jheuo>Home (Archivio)</a></li> <li data-astro-cid-cr2jheuo><a href="/test-lista" data-astro-cid-cr2jheuo>Lista Completa Articoli</a></li> ${articleCount > 0 && renderTemplate`<li data-astro-cid-cr2jheuo><a href="/blog/ombre-e-luci" data-astro-cid-cr2jheuo>Test Articolo: "Ombre e luci?"</a></li>`} </ul> </div> <div class="status info" data-astro-cid-cr2jheuo> <h3 data-astro-cid-cr2jheuo>Info Sistema:</h3> <ul data-astro-cid-cr2jheuo> <li data-astro-cid-cr2jheuo>Server: Astro Dev</li> <li data-astro-cid-cr2jheuo>Porta: 4321</li> <li data-astro-cid-cr2jheuo>URL: <a href="http://localhost:4321" data-astro-cid-cr2jheuo>http://localhost:4321</a></li> </ul> </div> </body></html>`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/test-status.astro", void 0);
    $$file10 = "C:/Users/berto/Documents/Ombreeluci/src/pages/test-status.astro";
    $$url10 = "/test-status";
    _page12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$TestStatus,
      file: $$file10,
      url: $$url10
    }, Symbol.toStringTag, { value: "Module" }));
    page12 = /* @__PURE__ */ __name(() => _page12, "page");
  }
});

// _worker.js/chunks/ArticleCard_Bxiwkm9m.mjs
function getPlaceholder(slug) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++)
    hash = hash * 31 + slug.charCodeAt(i) >>> 0;
  return PLACEHOLDERS[hash % PLACEHOLDERS.length];
}
var PLACEHOLDERS, $$Astro10, $$ArticleCard;
var init_ArticleCard_Bxiwkm9m = __esm({
  "_worker.js/chunks/ArticleCard_Bxiwkm9m.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    init_directus_B0n0XETK();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    PLACEHOLDERS = [
      { src: "/placeholder/ph-1.jpg", caption: "Foto di Steve Johnson su Unsplash" },
      { src: "/placeholder/ph-2.jpg", caption: "Foto di Steve Johnson su Unsplash" },
      { src: "/placeholder/ph-3.jpg", caption: "Foto di Steve Johnson su Unsplash" },
      { src: "/placeholder/ph-4.jpg", caption: "Foto di vackground.com su Unsplash" }
    ];
    __name(getPlaceholder, "getPlaceholder");
    $$Astro10 = createAstro();
    $$ArticleCard = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro10, $$props, $$slots);
      Astro2.self = $$ArticleCard;
      const { title, author, date, issue, slug, image, categoriaMenu, forma, ruoloEditoriale, horizontal = false, sottotitolo = null, authorImage = null, hideImage = false } = Astro2.props;
      const hasIssue = issue != null && String(issue).trim() !== "";
      const imageSrc = !hideImage && image ? image : !hideImage ? getPlaceholder(slug ?? title ?? "").src : null;
      const formaPrefix = forma && forma !== "Articolo" ? `${forma} \xB7 ` : "";
      const badgeText = categoriaMenu ? `${formaPrefix}${categoriaMenu}` : hasIssue ? "" : "Online";
      function authorSlug(name) {
        return String(name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      }
      __name(authorSlug, "authorSlug");
      const formattedDate = new Intl.DateTimeFormat("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }).format(date instanceof Date ? date : new Date(date));
      const authorLinkSlug = authorSlug(author);
      return renderTemplate`${maybeRenderHead()}<div${addAttribute(`article-card${horizontal ? " article-card--horizontal" : ""}`, "class")} data-astro-cid-di2nlc57> <a${addAttribute(`/blog/${slug}`, "href")} class="article-link" data-astro-cid-di2nlc57> ${imageSrc && renderTemplate`<div class="article-image-wrap" data-astro-cid-di2nlc57> <img${addAttribute(imageSrc, "src")}${addAttribute(title, "alt")} loading="lazy" data-copertina-fallback${addAttribute(COPERTINA_IMG_ONERROR, "onerror")} data-astro-cid-di2nlc57> </div>`} <div class="article-meta" data-astro-cid-di2nlc57> ${badgeText && renderTemplate`<p class="article-badge" data-astro-cid-di2nlc57> <span class="article-badge-text" data-astro-cid-di2nlc57>${badgeText}</span> </p>`} <h3 class="article-title" data-astro-cid-di2nlc57>${title}</h3> ${horizontal && sottotitolo && renderTemplate`<p class="article-sottotitolo" data-astro-cid-di2nlc57>${sottotitolo}</p>`} </div> </a> <p class="author-row" data-astro-cid-di2nlc57> ${horizontal && authorImage && renderTemplate`<img${addAttribute(authorImage, "src")}${addAttribute(author, "alt")} class="author-avatar" loading="lazy" data-astro-cid-di2nlc57>`}
Di <a${addAttribute(`/autori/${authorLinkSlug}`, "href")} class="author-link" data-astro-cid-di2nlc57>${author}</a> • ${formattedDate} </p> </div> `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/components/ArticleCard.astro", void 0);
  }
});

// _worker.js/chunks/diari_DNXJk5VJ.mjs
function getDiaristaByDiarioSlug(diarioSlug) {
  return DIARISTI.find((d) => d.diarioSlug === diarioSlug);
}
var DIARISTI, NOMI_DIARISTI;
var init_diari_DNXJk5VJ = __esm({
  "_worker.js/chunks/diari_DNXJk5VJ.mjs"() {
    "use strict";
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    DIARISTI = [
      {
        nome: "Arianna Giuliano",
        authorSlug: "arianna-giuliano",
        diarioSlug: "diario-di-arianna",
        titoloDiario: "NasoMano",
        descrizioneDiario: "Mi chiamo Arianna, sono nata a Milano il 17 giugno 1992. Ho una disabilit\xE0 dalla nascita ma questo non mi ha mai fermata dal pormi continuamente obiettivi sempre pi\xF9 difficili da raggiungere. Ora il mio progetto \xE8 quello di realizzarmi lavorativamente."
      },
      {
        nome: "Benedetta Mattei",
        authorSlug: "benedetta-mattei",
        diarioSlug: "diario-di-benedetta",
        titoloDiario: "Benedetta ragazza!",
        descrizioneDiario: 'Nata a Roma il 1 gennaio 2004, frequenta il secondo anno all\u2019Istituto alberghiero "Gioberti" a Trastevere, con l\u2019obiettivo di lavorare come receptionist e cameriera sfruttando le sue conoscenze di ricette culinarie e ristoranti. Tra le sue passioni ci sono lo sport e il teatro.'
      },
      {
        nome: "Giovanni Grossi",
        authorSlug: "giovanni-grossi",
        diarioSlug: "diario-di-giovanni",
        titoloDiario: "Senza Filtro",
        descrizioneDiario: "Sono nato a Roma nel 1970, da Lorenzo Grossi e Paola Pisenti. Ho fatto l\u2019asilo a Milano ed a Pomigliano D\u2019Arco, le elementari e la prima media a Pomigliano D\u2019Arco e poi ho fatto le medie a Roma nella scuola Esopo quando ancora era in via Fogliano."
      },
      {
        nome: "Efrem Sardella",
        authorSlug: "efrem-sardella",
        diarioSlug: "diario-di-efrem",
        titoloDiario: "Articolo 1",
        descrizioneDiario: "Scrivo brevi memorie sui tanti tentativi di inserirmi nel mondo del lavoro sperando che il racconto dei miei successi e fallimenti possa essere di utilit\xE0 per qualcun altro."
      },
      {
        nome: "Luciana Spigolon",
        authorSlug: "luciana-spigolon",
        diarioSlug: "diario-di-luciana",
        titoloDiario: "Vite preziose",
        descrizioneDiario: "Padovana classe 1962, Luciana condivide riflessioni e quotidianit\xE0 della sua vita con due fratelli con disabilit\xE0 grave, Giorgio e Cristina."
      },
      {
        nome: "Antonietta Pantone",
        authorSlug: "antonietta-pantone",
        diarioSlug: "diario-di-antonietta",
        titoloDiario: "Il giardino che nessuno sa",
        descrizioneDiario: "Consigliera di bellezza. Sono nata a Roma il 28/03/1990 dove vivo con mia madre e mia sorella gemella. Dal 2006 al 2011 ho frequentato il liceo psico pedagogico di Potenza, poi dal 2013 al 2016 ho frequentato un anno di Alberghiero sempre a Potenza. Sto in prima linea per combattere l\u2019indifferenza contro la disabilit\xE0."
      },
      {
        nome: "Davide Passeri",
        authorSlug: "davide-passeri",
        diarioSlug: "diario-di-davide",
        titoloDiario: "Il mondo ascoltato da me",
        descrizioneDiario: "Vivo a Roma, mi piace l\u2019informatica, la telefonia e sono un audiofilo."
      }
    ];
    NOMI_DIARISTI = new Set(DIARISTI.map((d) => d.nome));
    __name(getDiaristaByDiarioSlug, "getDiaristaByDiarioSlug");
  }
});

// _worker.js/pages/_diario_.astro.mjs
var diario_astro_exports = {};
__export(diario_astro_exports, {
  page: () => page13,
  renderers: () => renderers13
});
import { renderers as renderers13 } from "../renderers.mjs";
async function getStaticPaths() {
  const allArticoli = await getAllArticoli();
  const allAutori = await getAllAutori();
  const paths = [];
  for (const d of DIARISTI) {
    const autore = allAutori.find((a) => a.slug === d.authorSlug);
    const fotoUrl = autore?.foto?.id ? getAutoreImageUrl(autore.foto.id) : "";
    const articoli = allArticoli.filter((a) => a.lang !== "en" && (a.autore?.nome_completo || "").trim() === d.nome).sort((a, b) => {
      const tA = a.data_pubblicazione ? new Date(a.data_pubblicazione).getTime() : 0;
      const tB = b.data_pubblicazione ? new Date(b.data_pubblicazione).getTime() : 0;
      return tB - tA;
    });
    paths.push({
      params: { diario: d.diarioSlug },
      props: {
        nomeAutore: d.nome,
        titoloDiario: d.titoloDiario,
        fotoUrl,
        descrizioneDiario: d.descrizioneDiario,
        articoli
      }
    });
  }
  return paths;
}
var $$Astro$14, $$DiarioLayout, $$Astro11, $$diario, $$file11, $$url11, _page13, page13;
var init_diario_astro = __esm({
  "_worker.js/pages/_diario_.astro.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    init_BaseLayout_DIxcXjbq();
    init_ArticleCard_Bxiwkm9m();
    init_Footer_D9bdzLvP();
    init_directus_B0n0XETK();
    init_diari_DNXJk5VJ();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    $$Astro$14 = createAstro();
    $$DiarioLayout = createComponent(($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro$14, $$props, $$slots);
      Astro2.self = $$DiarioLayout;
      const { nomeAutore, titoloDiario, fotoUrl, descrizioneDiario, articoli } = Astro2.props;
      return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": titoloDiario, "description": `Leggi le cronache e gli articoli di ${nomeAutore}, ${titoloDiario}, su Ombre e Luci.`, "noindex": true, "data-astro-cid-olebnxt6": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main diario-single-main" data-astro-cid-olebnxt6> <div class="container diario-page" data-astro-cid-olebnxt6> <a href="/sezioni/diari" class="diario-back-link" aria-label="Torna a tutti i Diari" data-astro-cid-olebnxt6> <span class="diario-back-arrow" aria-hidden="true" data-astro-cid-olebnxt6>←</span> Torna a tutti i Diari
</a> <header class="diario-section-header" data-astro-cid-olebnxt6> <div class="diario-header-photo" data-astro-cid-olebnxt6> ${fotoUrl ? renderTemplate`<img${addAttribute(fotoUrl, "src")}${addAttribute(nomeAutore, "alt")} width="200" height="200" data-astro-cid-olebnxt6>` : renderTemplate`<div class="diario-header-placeholder" aria-hidden="true" data-astro-cid-olebnxt6></div>`} </div> <div class="diario-header-text" data-astro-cid-olebnxt6> <h1 class="diario-page-title" data-astro-cid-olebnxt6>${titoloDiario}</h1> <p class="diario-author-name" data-astro-cid-olebnxt6>di ${nomeAutore}</p> <div class="diario-presentazione" data-astro-cid-olebnxt6> <p data-astro-cid-olebnxt6>${descrizioneDiario}</p> </div> </div> </header> <section class="diario-feed-section"${addAttribute(`Articoli di ${titoloDiario}`, "aria-label")} data-astro-cid-olebnxt6> <h2 class="visually-hidden" data-astro-cid-olebnxt6>Articoli di ${nomeAutore}</h2> ${articoli.length > 0 ? renderTemplate`<div class="diario-articles-grid" data-astro-cid-olebnxt6> ${articoli.map((a) => {
        const { categoria_menu, ruolo_editoriale } = getMegaclusterForArticle(a);
        const { formal } = getLabels([], a);
        const articleDate = a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date();
        const articleImage = getArticoloCopertinaSrc(a);
        return renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "title": a.titolo, "slug": a.slug, "categoriaMenu": categoria_menu ?? void 0, "issue": a.numero_rivista?.id_numero ?? null, "forma": formal, "author": a.autore?.nome_completo ?? nomeAutore, "date": articleDate, "image": articleImage, "ruoloEditoriale": ruolo_editoriale ?? void 0, "data-astro-cid-olebnxt6": true })}`;
      })} </div>` : renderTemplate`<p class="diario-empty" data-astro-cid-olebnxt6>Nessun articolo ancora pubblicato per questo diario.</p>`} </section> <p class="diario-back-bottom" data-astro-cid-olebnxt6> <a href="/sezioni/diari" class="diario-back-link" data-astro-cid-olebnxt6><span class="diario-back-arrow" aria-hidden="true" data-astro-cid-olebnxt6>←</span> Torna a tutti i Diari</a> </p> </div> </main> ` })} `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/layouts/DiarioLayout.astro", void 0);
    $$Astro11 = createAstro();
    __name(getStaticPaths, "getStaticPaths");
    $$diario = createComponent(async ($$result, $$props, $$slots) => {
      const Astro2 = $$result.createAstro($$Astro11, $$props, $$slots);
      Astro2.self = $$diario;
      const { diario } = Astro2.params;
      const diarista = diario ? getDiaristaByDiarioSlug(diario) : void 0;
      if (!diarista) {
        return Astro2.redirect("/404");
      }
      const { nomeAutore, titoloDiario, fotoUrl, descrizioneDiario, articoli } = Astro2.props;
      return renderTemplate`${renderComponent($$result, "DiarioLayout", $$DiarioLayout, { "nomeAutore": nomeAutore, "titoloDiario": titoloDiario, "fotoUrl": fotoUrl, "descrizioneDiario": descrizioneDiario, "articoli": articoli })}`;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/[diario].astro", void 0);
    $$file11 = "C:/Users/berto/Documents/Ombreeluci/src/pages/[diario].astro";
    $$url11 = "/[diario]";
    _page13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$diario,
      file: $$file11,
      getStaticPaths,
      url: $$url11
    }, Symbol.toStringTag, { value: "Module" }));
    page13 = /* @__PURE__ */ __name(() => _page13, "page");
  }
});

// _worker.js/pages/index.astro.mjs
var index_astro_exports = {};
__export(index_astro_exports, {
  page: () => page14,
  renderers: () => renderers14
});
import { renderers as renderers14 } from "../renderers.mjs";
var numeriData, $$Index4, $$file12, $$url12, _page14, page14;
var init_index_astro = __esm({
  "_worker.js/pages/index.astro.mjs"() {
    "use strict";
    init_server_CgTYz_Tl();
    init_BaseLayout_DIxcXjbq();
    init_IssueCard_Db5MfroW();
    init_Footer_D9bdzLvP();
    init_diari_DNXJk5VJ();
    init_directus_B0n0XETK();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    numeriData = [
      {
        id_numero: "INS-1",
        tipo_rivista: "insieme",
        numero_progressivo: 1,
        display_title: "Insieme n. 1 \u2013 Bollettino Fede e Luce",
        titolo_numero: "Bollettino Fede e Luce",
        seo_description: "Insieme n. 1 \u2013 Bollettino Fede e Luce",
        descrizione_originale: "Insieme n. 1 \u2013 Bollettino Fede e Luce 1974",
        descrizione_ai: null,
        anno_pubblicazione: 1974,
        anno_collezione: null,
        periodicita: null,
        periodo_label: null,
        copertina_url: null,
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-1-bollettino-fede-e-luce/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-1-bollettino-fede-e-luce/",
        archive_org_item_id: null,
        archive_view_url: null,
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [],
        issues: []
      },
      {
        id_numero: "INS-2",
        tipo_rivista: "insieme",
        numero_progressivo: 2,
        display_title: "Insieme n.2 \u2013 Bollettino Fede e Luce",
        titolo_numero: "Bollettino Fede e Luce",
        seo_description: "Insieme n.2 \u2013 Bollettino Fede e Luce",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n.2 \u2013 Bollettino Fede e Luce 1974",
        descrizione_ai: null,
        anno_pubblicazione: 1974,
        anno_collezione: null,
        periodicita: null,
        periodo_label: null,
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/1974/08/cover-Insieme-n.2-1974-Bollettino-Fede-e-Luce.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-2-bollettino-fede-e-luce/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-2-bollettino-fede-e-luce/",
        archive_org_item_id: "insieme-02",
        archive_view_url: "https://archive.org/details/insieme-02",
        archive_download_pdf_url: "https://archive.org/download/insieme-02/insieme-02.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1974/fede-e-luce/",
          "https://www.ombreeluci.it/1974/la-paura-degli-altri",
          "https://www.ombreeluci.it/1974/giovanissimi",
          "https://www.ombreeluci.it/1974/lettera-ai-giovani/",
          "https://www.ombreeluci.it/1974/ci-hanno-scritto/",
          "https://www.ombreeluci.it/1974/cecilia-una-esperienza/",
          "https://www.ombreeluci.it/1974/come-fai-a-credere-alla-madonna/",
          "https://www.ombreeluci.it/1974/giovanissimi/",
          "https://www.ombreeluci.it/1974/la-paura-degli-altri/"
        ],
        issues: []
      },
      {
        id_numero: "INS-3",
        tipo_rivista: "insieme",
        numero_progressivo: 3,
        display_title: "Insieme n. 3 \u2013 Bollettino di Fede e Luce",
        titolo_numero: "Bollettino di Fede e Luce",
        seo_description: "Insieme n. 3 \u2013 Bollettino di Fede e Luce",
        descrizione_originale: "Insieme n. 3 \u2013 Bollettino di Fede e Luce 1974",
        descrizione_ai: null,
        anno_pubblicazione: 1974,
        anno_collezione: null,
        periodicita: null,
        periodo_label: null,
        copertina_url: null,
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-3-bollettino-di-fede-e-luce/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-3-bollettino-di-fede-e-luce/",
        archive_org_item_id: null,
        archive_view_url: null,
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [],
        issues: []
      },
      {
        id_numero: "INS-4",
        tipo_rivista: "insieme",
        numero_progressivo: 4,
        display_title: "Insieme n.4 \u2013 Bollettino Fede e Luce",
        titolo_numero: "Bollettino Fede e Luce",
        seo_description: "Prima di Ombre e Luci c'era Insieme, il primo bollettino di Fede e Luce, nato nel 1974.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n.4 \u2013 Bollettino Fede e Luce Gennaio \u2013 Febbraio, 1975",
        descrizione_ai: null,
        anno_pubblicazione: 1975,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/1975/02/insieme4.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-4-bollettino-fede-e-luce/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-4-bollettino-fede-e-luce/",
        archive_org_item_id: "insieme-04",
        archive_view_url: "https://archive.org/details/insieme-04",
        archive_download_pdf_url: "https://archive.org/download/insieme-04/insieme-04.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1975/pellegrinaggio-a-roma-con-foi-et-lumiere/",
          "https://www.ombreeluci.it/1975/integrazione-nelle-scuole-pro-e-contro/",
          "https://www.ombreeluci.it/1975/poesie-visages-volti/",
          "https://www.ombreeluci.it/1974/il-momento-piu-bello/",
          "https://www.ombreeluci.it/1975/lincontro-a-villa-pacis/",
          "https://www.ombreeluci.it/1975/allamicizia-ci-credo/",
          "https://www.ombreeluci.it/1975/giovanissimi-io-e-mio-fratello/",
          "https://www.ombreeluci.it/1975/qua-e-la-per-litalia/",
          "https://www.ombreeluci.it/1975/sabato-1-febbraio-1975/",
          "https://www.ombreeluci.it/1975/una-mamma-di-bambini-normali/",
          "https://www.ombreeluci.it/1975/il-momento-piu-bello/"
        ],
        issues: []
      },
      {
        id_numero: "INS-5",
        tipo_rivista: "insieme",
        numero_progressivo: 5,
        display_title: "Insieme n.5 \u2013 Bollettino Fede e Luce",
        titolo_numero: "Bollettino Fede e Luce",
        seo_description: "Insieme n.5 \u2013 Bollettino Fede e Luce",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n.5 \u2013 Bollettino Fede e Luce Marzo \u2013 Aprile \u2013 Maggio 1975",
        descrizione_ai: null,
        anno_pubblicazione: 1975,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Marzo \u2013 Aprile",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/1975/05/insieme5.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-5-bollettino-fede-e-luce/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-5-bollettino-fede-e-luce/",
        archive_org_item_id: "insieme-05_202008",
        archive_view_url: "https://archive.org/details/insieme-05_202008",
        archive_download_pdf_url: "https://archive.org/download/insieme-05_202008/insieme-5.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1975/ombra-e-luce/",
          "https://www.ombreeluci.it/1975/gli-amici-dei-bimbi-reparto-gesu-bambino-istituto-santeusebio-vercelli/",
          "https://www.ombreeluci.it/1975/giovanissimi-insieme-n-5/",
          "https://www.ombreeluci.it/1975/quando-parliamo-di-loro/",
          "https://www.ombreeluci.it/1975/programma-del-pellegrinaggio-a-roma-del-1975/",
          "https://www.ombreeluci.it/1975/come-dire-di-si/"
        ],
        issues: []
      },
      {
        id_numero: "INS-6",
        tipo_rivista: "insieme",
        numero_progressivo: 6,
        display_title: "Insieme n. 6 \u2013 Speciale Pellegrinaggio Roma",
        titolo_numero: "Speciale Pellegrinaggio Roma",
        seo_description: "Insieme n. 6 \u2013 Speciale Pellegrinaggio Roma",
        descrizione_originale: "Insieme n. 6 \u2013 Speciale Pellegrinaggio Roma 1975",
        descrizione_ai: null,
        anno_pubblicazione: 1975,
        anno_collezione: null,
        periodicita: null,
        periodo_label: null,
        copertina_url: null,
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-6-speciale-pellegrinaggio-roma/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-6-speciale-pellegrinaggio-roma/",
        archive_org_item_id: null,
        archive_view_url: null,
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [],
        issues: []
      },
      {
        id_numero: "INS-7",
        tipo_rivista: "insieme",
        numero_progressivo: 7,
        display_title: "Insieme n. 7 - Bollettino Fede Luce 1975",
        titolo_numero: "Bollettino Fede Luce 1975",
        seo_description: "Insieme n. 7 \u2013 Bollettino Fede Luce 1975",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n.7 \u2013 Bollettino Fede e Luce Dicembre 1975",
        descrizione_ai: null,
        anno_pubblicazione: 1975,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Dicembre 1975",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2021/07/cover-insieme-n.7.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-7-1975-bollettino-fede-e-luce/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-7-1975-bollettino-fede-e-luce/",
        archive_org_item_id: "insieme-n.-7",
        archive_view_url: "https://archive.org/details/insieme-n.-7/mode/2up",
        archive_download_pdf_url: "https://archive.org/download/insieme-n.-7/insieme%20n.7.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1975/la-nostra-buona-novella/",
          "https://www.ombreeluci.it/1975/il-problema-dellacqua/",
          "https://www.ombreeluci.it/1975/dietro-le-quinte/",
          "https://www.ombreeluci.it/1975/tavola-rotonda/",
          "https://www.ombreeluci.it/1975/giovanissimi-n-7/",
          "https://www.ombreeluci.it/1975/ricordi-e-speranze-dai-questionari-sul-pellegrinaggio-a-roma-del-1975/",
          "https://www.ombreeluci.it/1975/leco-della-stampa/",
          "https://www.ombreeluci.it/1975/bilancio-fede-e-luce-1975/"
        ],
        issues: []
      },
      {
        id_numero: "INS-8",
        tipo_rivista: "insieme",
        numero_progressivo: 8,
        display_title: "Insieme n. 8 - Bollettino Fede e Luce",
        titolo_numero: "Bollettino Fede e Luce",
        seo_description: `"AMARE \xE8 accettare l'altro cos\xEC com'\xE8, lasciarsi investire`,
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n.8 \u2013 Bollettino Fede e Luce \u2013 1976 Gennaio \u2013 Febbraio 1976",
        descrizione_ai: null,
        anno_pubblicazione: 1976,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/cover-insieme-n.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-8-bollettino-fede-e-luce/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-8-bollettino-fede-e-luce/",
        archive_org_item_id: "insieme-8",
        archive_view_url: "https://archive.org/details/insieme-8/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-8/insieme%208%20gen%20feb%201976.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1976/i-piu-difficili/",
          "https://www.ombreeluci.it/1976/mi-sento-in-crisi/",
          "https://www.ombreeluci.it/1976/festa-della-luce-1976/",
          "https://www.ombreeluci.it/1976/pennellate-dai-centri-fede-e-luce/",
          "https://www.ombreeluci.it/1976/incontrarsi-il-venerdi/",
          "https://www.ombreeluci.it/1976/resoconto-della-riunione-internazionale-di-fede-e-luce/"
        ],
        issues: []
      },
      {
        id_numero: "INS-9",
        tipo_rivista: "insieme",
        numero_progressivo: 9,
        display_title: "Insieme n. 9 - Bollettino Fede e Luce",
        titolo_numero: "Bollettino Fede e Luce",
        seo_description: '"Il Regno dei cieli \xE8 simile a un granellino di senapa, esso \xE8 il pi\xF9 piccolo di tutti i semi, ma una volta cresciuto \xE8 pi\xF9 grande degli altri!" Matteo 13,31',
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 9 \u2013 Bollettino Fede e Luce \u2013 1976 Marzo \u2013 Aprile \u2013 Maggio 1976",
        descrizione_ai: null,
        anno_pubblicazione: 1976,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Marzo \u2013 Aprile",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/cover-insieme-n-1.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-9-bollettino-fede-e-luce/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-9-bollettino-fede-e-luce/",
        archive_org_item_id: "insieme-9",
        archive_view_url: "https://archive.org/details/insieme-9/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-9/Insieme%209%20mag%20giu%20lug%201976.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1976/vedremo-mai-la-luce/",
          "https://www.ombreeluci.it/1976/ci-hanno-scritto-2/",
          "https://www.ombreeluci.it/1976/dove-lo-prendo-tanto-amore/",
          "https://www.ombreeluci.it/1976/xavier-un-mio-un-nostro-nuovo-a-amico/",
          "https://www.ombreeluci.it/1976/esperienze-un-week-end-fuori-dallordinario/",
          "https://www.ombreeluci.it/1976/un-metodo-efficace-per-leducazione-dei-bambini-con-disabilita/",
          "https://www.ombreeluci.it/1976/guidare-alla-luce-catechesi-sensoriale-per-una-vita-spirituale-inclusiva/",
          "https://www.ombreeluci.it/1976/letture-consigliate-darti-la-vita-recensione/",
          "https://www.ombreeluci.it/1976/notiziario-fede-e-luce-il-resoconto-dellultima-festa-della-luce-e-altre-notizie-dal-movimento/"
        ],
        issues: []
      },
      {
        id_numero: "INS-10",
        tipo_rivista: "insieme",
        numero_progressivo: 10,
        display_title: "Insieme n. 10 \u2013 Bollettino Fede e Luce \u2013 1976",
        titolo_numero: "Bollettino Fede e Luce \u2013 1976",
        seo_description: `"Signore, Dammi soltanto un po' di bont\xE0, perch\xE9 io pensi alla felicit\xE0 degli altri, prima di pensare alla mia; alla gioia degli altri, prima della mia...\xBBDammi soltanto un po' di bont\xE0!"-`,
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 10 \u2013 Bollettino Fede e Luce \u2013 1976 Giugno \u2013 Settembre 1976",
        descrizione_ai: null,
        anno_pubblicazione: 1976,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Giugno \u2013 Settembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-10-set-1976.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-10-bollettino-fede-e-luce-1976/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-10-bollettino-fede-e-luce-1976/",
        archive_org_item_id: "insieme-n.-10",
        archive_view_url: "https://archive.org/details/insieme-n.-10/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-n.-10/insieme%2010%20giu%20set%201976%20corretto.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1976/alla-ricerca-delle-vere-vacanze-rompere-gli-schemi-e-scoprire-il-significato-profondo-del-riposo/",
          "https://www.ombreeluci.it/1976/la-vecchia-signora-brontolona/",
          "https://www.ombreeluci.it/1976/dedicato-ad-unamica/",
          "https://www.ombreeluci.it/1976/viaggio-a-parma-del-1976-unesperienza-di-gioia-condivisione-e-scoperta-con-fede-e-luce/",
          "https://www.ombreeluci.it/1976/questestate-faremo/",
          "https://www.ombreeluci.it/1976/un-angolino-di-arche-2/",
          "https://www.ombreeluci.it/1976/a-te-bambino-mio/",
          "https://www.ombreeluci.it/1976/un-angolino-di-arche/",
          "https://www.ombreeluci.it/1976/notiziario-di-fede-e-luce-n-10-1976/"
        ],
        issues: []
      },
      {
        id_numero: "INS-11",
        tipo_rivista: "insieme",
        numero_progressivo: 11,
        display_title: "Insieme n. 11 \u2013 Bollettino Fede e Luce \u2013 1976",
        titolo_numero: "Bollettino Fede e Luce \u2013 1976",
        seo_description: "Questo nuovo numero di Insieme esce rinnovato nella grafica e nei contenuti.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 11 \u2013 Bollettino Fede e Luce \u2013 1976 Ottobre \u2013 Novembre \u2013 Dicembre 1976",
        descrizione_ai: null,
        anno_pubblicazione: 1976,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/1976/09/insieme-11-ott-nov-dic-1976-def.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-11-bollettino-fede-e-luce-1976/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-11-bollettino-fede-e-luce-1976/",
        archive_org_item_id: "insieme-11",
        archive_view_url: "https://archive.org/details/insieme-11/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-11/insieme%2011%20ott%20nov%20dic%201976-def.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1976/editoriale-parliamo-di-insieme/",
          "https://www.ombreeluci.it/1976/lettera-aperta-a-padre-michel-charpantier/",
          "https://www.ombreeluci.it/1976/ci-hanno-scritto-n-11/",
          "https://www.ombreeluci.it/1976/per-la-nostra-riflessione-una-croce-di-carta-smerigliata/",
          "https://www.ombreeluci.it/1976/attivita-di-tempo-libero-e-vita-comunitaria/",
          "https://www.ombreeluci.it/1976/esperienze-estive-fra-arche-e-mary-mount/",
          "https://www.ombreeluci.it/1976/testimonianze-dai-campi-di-alfedena-1976/",
          "https://www.ombreeluci.it/1976/notiziario-fede-e-luce-dicembre-1976/",
          "https://www.ombreeluci.it/1976/alfedena-1976-esperienze-di-vita-comunitaria/",
          "https://www.ombreeluci.it/1976/a-tutti-i-gruppi-fede-e-luce/",
          "https://www.ombreeluci.it/1976/i-bambini-autistici-una-guida-per-genitori-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "INS-12",
        tipo_rivista: "insieme",
        numero_progressivo: 12,
        display_title: "Insieme n. 12 \u2013 Bollettino Fede e Luce \u2013 1977",
        titolo_numero: "Bollettino Fede e Luce \u2013 1977",
        seo_description: "Studiammo molte parole d'amore. Creammo molte parole d'amore. Partiti, infine, dal mondo, lasciamo, non dette, troppe parole d'amore. Gh\xE0lib Asadu'llah",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 12 \u2013 Bollettino Fede e Luce \u2013 1977 Gennaio \u2013 Febbraio \u2013 Marzo 1977",
        descrizione_ai: null,
        anno_pubblicazione: 1977,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/1976/12/Insieme-n-12.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-12-bollettino-fede-e-luce-1977/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-12-bollettino-fede-e-luce-1977/",
        archive_org_item_id: "insieme-12",
        archive_view_url: "https://archive.org/details/insieme-12/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-12/insieme%2012%20gen%20mar%201977-def.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1977/editoriale-lettera-aperta-agli-amici-di-fede-e-luce/",
          "https://www.ombreeluci.it/1977/ci-hanno-scritto-n-12/",
          "https://www.ombreeluci.it/1977/cose-un-sacramento-cose-leucaristia-cose-la-confessione/",
          "https://www.ombreeluci.it/1977/un-figlio-handicappato/",
          "https://www.ombreeluci.it/1977/visitiamo-con-maria-laura-il-c-b-i-m-c-centro-belga-per-infermi-motori-mentali/",
          "https://www.ombreeluci.it/1977/come-nata-la-prima-casetta-fede-e-luce-storie-di-pennelli-e-appendiciti/",
          "https://www.ombreeluci.it/1977/notiziario-fede-e-luce-n-12-marzo-1977/",
          "https://www.ombreeluci.it/1977/mio-figlio-emanuele-la-straordinaria-esperienza-di-una-madre-recensione/",
          "https://www.ombreeluci.it/1977/bilancio-fede-e-luce-1976/"
        ],
        issues: []
      },
      {
        id_numero: "INS-13",
        tipo_rivista: "insieme",
        numero_progressivo: 13,
        display_title: "Insieme n. 13 \u2013 Bollettino Fede e Luce \u2013 1977",
        titolo_numero: "Bollettino Fede e Luce \u2013 1977",
        seo_description: "Insieme n. 13 \u2013 Bollettino Fede e Luce \u2013 1977",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 13 \u2013 Bollettino Fede e Luce \u2013 1977 Aprile \u2013 Maggio \u2013 Giugno 1977",
        descrizione_ai: null,
        anno_pubblicazione: 1977,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-13.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-13-bollettino-fede-e-luce-1977/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-13-bollettino-fede-e-luce-1977/",
        archive_org_item_id: "insieme-13",
        archive_view_url: "https://archive.org/details/insieme-13/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-13/insieme%2013%20apr%20mag%20giu%201977-def.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1977/editoriale-auguri/",
          "https://www.ombreeluci.it/1977/ci-hanno-scritto-n-13/",
          "https://www.ombreeluci.it/1977/per-nostra-riflessione-la-comunione/",
          "https://www.ombreeluci.it/1977/techniche-di-recupero-per-i-disabili-gravi-la-socializzazione/",
          "https://www.ombreeluci.it/1977/esperienze-al-club-avance/",
          "https://www.ombreeluci.it/1977/fede-e-luce-incontri-internazionali-e-nazionali-1977/",
          "https://www.ombreeluci.it/1977/notiziario-fede-e-luce-n-13/",
          "https://www.ombreeluci.it/1977/gli-altri-un-figlio-subnormale-recensione-libro/",
          "https://www.ombreeluci.it/1977/tecniche-di-recupero-per-i-disabili-gravi-la-socializzazione/"
        ],
        issues: []
      },
      {
        id_numero: "INS-14",
        tipo_rivista: "insieme",
        numero_progressivo: 14,
        display_title: "Insieme n. 14 \u2013 Bollettino Fede e Luce \u2013 1977",
        titolo_numero: "Bollettino Fede e Luce \u2013 1977",
        seo_description: "Insieme n. 14 \u2013 Bollettino Fede e Luce \u2013 1977",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 14 \u2013 Bollettino Fede e Luce \u2013 1977 Luglio \u2013 Agosto \u2013 Settembre 1977",
        descrizione_ai: null,
        anno_pubblicazione: 1977,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-14.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-14-bollettino-fede-e-luce-1977/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-14-bollettino-fede-e-luce-1977/",
        archive_org_item_id: "insieme-14",
        archive_view_url: "https://archive.org/details/insieme-14/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-14/insieme%2014%20lug%20aho%20set%201977.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1977/editoriale-vacanze/",
          "https://www.ombreeluci.it/1977/ci-hanno-scritto-n-14/",
          "https://www.ombreeluci.it/1977/inno-alla-vita-di-una-handicappata/",
          "https://www.ombreeluci.it/1977/per-nostra-riflessione-milano-vederci-piu-chiaro/",
          "https://www.ombreeluci.it/1977/leducazione-delle-persone-disabili-imparare-a-vestirsi/",
          "https://www.ombreeluci.it/1977/cosa-si-fa-nelle-casette-di-fede-e-luce-le-risposte-di-chi-ce-stato/",
          "https://www.ombreeluci.it/1977/attivita-di-fine-stagione-del-gruppo-san-paolo-di-roma/",
          "https://www.ombreeluci.it/1977/notiziario-fede-e-luce-n-14/",
          "https://www.ombreeluci.it/1977/parliamo-di-ri-educazione/",
          "https://www.ombreeluci.it/1977/letture-consigliate-n-13/",
          "https://www.ombreeluci.it/1977/come-nata-la-prima-casetta-fede-e-luce-storie-di-pennelli-e-appendiciti/",
          "https://www.ombreeluci.it/1977/letture-consigliate-n-14/"
        ],
        issues: []
      },
      {
        id_numero: "INS-15",
        tipo_rivista: "insieme",
        numero_progressivo: 15,
        display_title: "Insieme n. 15 \u2013 Bollettino Fede e Luce \u2013 1977",
        titolo_numero: "Bollettino Fede e Luce \u2013 1977",
        seo_description: "Insieme n. 15 \u2013 Bollettino Fede e Luce \u2013 1977",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 15 \u2013 Bollettino Fede e Luce \u2013 1977 Ottobre \u2013 Novembre \u2013 Dicembre 1977",
        descrizione_ai: null,
        anno_pubblicazione: 1977,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-15.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-15-bollettino-fede-e-luce-1977/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-15-bollettino-fede-e-luce-1977/",
        archive_org_item_id: "insieme-15",
        archive_view_url: "https://archive.org/details/insieme-15/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-15/insieme%2015ot%20nov%20dic%201977.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1977/editoriale-amici-o-fratelli/",
          "https://www.ombreeluci.it/1977/ci-hanno-scritto-n-15/",
          "https://www.ombreeluci.it/1977/come-bere-un-bicchier-dacqua/",
          "https://www.ombreeluci.it/1977/scuola-e-disabilita-integrazione-ascoltiamo-le-testimonianze-di-due-mamme/",
          "https://www.ombreeluci.it/1977/esperienze-i-campi-dellestate-1977/",
          "https://www.ombreeluci.it/1977/notiziario-fede-e-luce-calendario-1978/",
          "https://www.ombreeluci.it/1977/bando-di-concorso-per-auto-adesivo-del-pellegrinaggio/",
          "https://www.ombreeluci.it/1977/per-amore-di-anna-storia-vera-di-una-ragazza-autistica-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "INS-16",
        tipo_rivista: "insieme",
        numero_progressivo: 16,
        display_title: "Insieme n. 16 \u2013 Bollettino Fede e Luce \u2013 1978",
        titolo_numero: "Bollettino Fede e Luce \u2013 1978",
        seo_description: "Insieme n. 16 \u2013 Bollettino Fede e Luce \u2013 1978",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 16 \u2013 Bollettino Fede e Luce \u2013 1978 Gennaio \u2013 Febbraio \u2013 Marzo 1978",
        descrizione_ai: null,
        anno_pubblicazione: 1978,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-16.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-16-bollettino-fede-e-luce-1978/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-16-bollettino-fede-e-luce-1978/",
        archive_org_item_id: "insieme-16",
        archive_view_url: "https://archive.org/details/insieme-16/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-16/insieme%2016%20gen%20feb%20mar%201978.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1978/editoriale-le-nostre-paure/",
          "https://www.ombreeluci.it/1978/ci-hanno-scritto-n-16/",
          "https://www.ombreeluci.it/1978/lettera-aperta-a-francesco-dassisi/",
          "https://www.ombreeluci.it/1978/pellegrinaggio-assisi-1978-luis-sankale/",
          "https://www.ombreeluci.it/1978/leducazione-delle-persone-disabili-imparare-a-mangiare-insieme-e-in-autonomia/",
          "https://www.ombreeluci.it/1978/la-comunita-di-capodarco/",
          "https://www.ombreeluci.it/1978/notiziario-fede-e-luce-n-16/",
          "https://www.ombreeluci.it/1978/assemblea-internazionale-di-fede-e-luce-a-bruxelles-gennaio-1978/",
          "https://www.ombreeluci.it/1978/vita-fede-e-luce-natale-1977-a/",
          "https://www.ombreeluci.it/1978/la-comunita-che-accoglie-i-rifiutati-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "INS-17",
        tipo_rivista: "insieme",
        numero_progressivo: 17,
        display_title: "Insieme n. 17 \u2013 Bollettino Fede e Luce \u2013 Assisi 1978",
        titolo_numero: "Bollettino Fede e Luce \u2013 Assisi 1978",
        seo_description: "Insieme n. 17 \u2013 Bollettino Fede e Luce \u2013 Assisi 1978",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 17 \u2013 Bollettino Fede e Luce \u2013 Andando verso Assisi, Pasqua 1978 Marzo 1978",
        descrizione_ai: null,
        anno_pubblicazione: 1978,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Marzo 1978",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-17.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-17-bollettino-fede-e-luce-assisi-1978/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-17-bollettino-fede-e-luce-assisi-1978/",
        archive_org_item_id: "insieme-17",
        archive_view_url: "https://archive.org/details/insieme-17/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-17/insieme%2017%20mar%201978.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1978/preparazione-al-pellegrinaggio-fede-e-luce-ad-assisi-1978/",
          "https://www.ombreeluci.it/1978/tre-giorni-ad-assisi/",
          "https://www.ombreeluci.it/1978/se-assisi-1978/",
          "https://www.ombreeluci.it/1978/qualche-informazione-prima-di-partire-per-il-pellegrinaggio-di-assisi/",
          "https://www.ombreeluci.it/1978/quel-giorno-pioveva/",
          "https://www.ombreeluci.it/1978/beati-i-poveri-suggerimenti-per-le-tra-giornate-ad-assisi-1978/",
          "https://www.ombreeluci.it/1978/meditazione-a-modo-mio/",
          "https://www.ombreeluci.it/1978/ciao-gianluca/",
          "https://www.ombreeluci.it/1978/jean-vanier-a-parma-1978/",
          "https://www.ombreeluci.it/1978/il-cantico-delle-creature/"
        ],
        issues: []
      },
      {
        id_numero: "INS-18",
        tipo_rivista: "insieme",
        numero_progressivo: 18,
        display_title: "Insieme n. 18 \u2013 Bollettino Fede e Luce \u2013 1978",
        titolo_numero: "Bollettino Fede e Luce \u2013 1978",
        seo_description: "Insieme n. 18 \u2013 Bollettino Fede e Luce \u2013 1978",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 18 \u2013 Bollettino Fede e Luce \u2013 1978 Luglio \u2013 Agosto \u2013 Settembre 1978",
        descrizione_ai: null,
        anno_pubblicazione: 1978,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-18.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-18-bollettino-fede-e-luce-1978/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-18-bollettino-fede-e-luce-1978/",
        archive_org_item_id: "insieme-18",
        archive_view_url: "https://archive.org/details/insieme-18/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-18/insieme%2018%20set%201978.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1978/quando-arrivano-le-vacanze/",
          "https://www.ombreeluci.it/1978/ci-hanno-scritto-n-18/",
          "https://www.ombreeluci.it/1978/un-po-di-provocazione/",
          "https://www.ombreeluci.it/1978/per-la-nostra-riflessione/",
          "https://www.ombreeluci.it/1978/per-la-loro-educazione-visita-allistituto-statale-romagnolo-per-non-vedenti/",
          "https://www.ombreeluci.it/1978/esperienze-al-gruppo-fede-e-luce-la-mamma-di-massimo/",
          "https://www.ombreeluci.it/1978/come-un-raggio-di-sole/",
          "https://www.ombreeluci.it/1978/notiziario-fede-e-luce-n-18/",
          "https://www.ombreeluci.it/1978/vita-dei-gruppi-fede-e-luce-1978/",
          "https://www.ombreeluci.it/1978/festa-della-primavera-a-villa-pacis-1978/",
          "https://www.ombreeluci.it/1978/la-casetta-cose-che-fini-ha-chi-la-frequenta/",
          "https://www.ombreeluci.it/1978/letture-consigliate-n-18/"
        ],
        issues: []
      },
      {
        id_numero: "INS-19",
        tipo_rivista: "insieme",
        numero_progressivo: 19,
        display_title: "Insieme n. 19 \u2013 Bollettino Fede e Luce \u2013 1978",
        titolo_numero: "Bollettino Fede e Luce \u2013 1978",
        seo_description: "Insieme n. 19 \u2013 Bollettino Fede e Luce \u2013 1978",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 19 \u2013 Bollettino Fede e Luce \u2013 1978 Ottobre \u2013 Novembre \u2013 Dicembre 1978",
        descrizione_ai: null,
        anno_pubblicazione: 1978,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-19.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-19-bollettino-fede-e-luce-1978/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-19-bollettino-fede-e-luce-1978/",
        archive_org_item_id: "insieme-19",
        archive_view_url: "https://archive.org/details/insieme-19/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-19/insieme%2019%20dic%201978.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2023/avete-mai-provato/",
          "https://www.ombreeluci.it/1978/ci-hanno-scritto-n-19/",
          "https://www.ombreeluci.it/1978/quattordici-anni-con-loro/",
          "https://www.ombreeluci.it/1978/per-la-loro-educazione-bilancio-di-unestate/",
          "https://www.ombreeluci.it/1978/alfedena-1978/",
          "https://www.ombreeluci.it/1978/vacanze-1978/",
          "https://www.ombreeluci.it/1978/una-lezione-damore-incontro-fede-e-luce-llalelli-galles-del-sud/",
          "https://www.ombreeluci.it/1978/soggiorno-allarche-1978/",
          "https://www.ombreeluci.it/1978/sono-andata-a-bruxelles-a-fare-volontariato/",
          "https://www.ombreeluci.it/1978/katimavik-una-parola-escquimese-che-vuol-dire-incontro/",
          "https://www.ombreeluci.it/1978/katimavik-una-parola-eschimese-che-vuol-dire-incontro/"
        ],
        issues: []
      },
      {
        id_numero: "INS-20",
        tipo_rivista: "insieme",
        numero_progressivo: 20,
        display_title: "Insieme n. 20 \u2013 Bollettino Fede e Luce \u2013 1979",
        titolo_numero: "Bollettino Fede e Luce \u2013 1979",
        seo_description: "Insieme n. 20 \u2013 Bollettino Fede e Luce \u2013 1979",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 20 \u2013 Bollettino Fede e Luce \u2013 1979 Gennaio \u2013 Febbraio \u2013 Marzo 1979",
        descrizione_ai: null,
        anno_pubblicazione: 1979,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-20-mar-1979.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-20-bollettino-fede-e-luce-1979/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-20-bollettino-fede-e-luce-1979/",
        archive_org_item_id: "insieme-20",
        archive_view_url: "https://archive.org/details/insieme-20/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-20/insieme%2020%20mar%201979.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1978/i-bambini-profondamente-handicappati/",
          "https://www.ombreeluci.it/1979/7-testimonianze-di-genitori-e-amici-di-bambini-profondamente-handicappati/",
          "https://www.ombreeluci.it/2014/momenti-misteriosi/",
          "https://www.ombreeluci.it/1979/la-forestiere-vita-comunitaria-con-i-piu-gravi-allarche/",
          "https://www.ombreeluci.it/1979/notiziario-fede-e-luce-n-20/",
          "https://www.ombreeluci.it/1979/che-cose-un-katimavic/",
          "https://www.ombreeluci.it/1979/letture-consigliate-lo-svantaggiato-quale-educazione/",
          "https://www.ombreeluci.it/1979/bilancio-fede-e-luce-1979/",
          "https://www.ombreeluci.it/1979/i-bambini-profondamente-handicappati/",
          "https://www.ombreeluci.it/1979/ci-hanno-scritto-n-20/",
          "https://www.ombreeluci.it/1974/cecilia-una-esperienza/",
          "https://www.ombreeluci.it/1974/giovanissimi/",
          "https://www.ombreeluci.it/1974/come-fai-a-credere-alla-madonna/",
          "https://www.ombreeluci.it/1974/lettera-ai-giovani/",
          "https://www.ombreeluci.it/1974/la-paura-degli-altri/",
          "https://www.ombreeluci.it/1974/fede-e-luce/"
        ],
        issues: []
      },
      {
        id_numero: "INS-21",
        tipo_rivista: "insieme",
        numero_progressivo: 21,
        display_title: "Insieme n. 21 \u2013 Bollettino Fede e Luce \u2013 1979",
        titolo_numero: "Bollettino Fede e Luce \u2013 1979",
        seo_description: "Insieme n. 21 \u2013 Bollettino Fede e Luce \u2013 1979",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 21 \u2013 Bollettino Fede e Luce \u2013 1979 Aprile \u2013 Maggio \u2013 Giugno 1979",
        descrizione_ai: null,
        anno_pubblicazione: 1979,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-21-giu-1979.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-21-bollettino-fede-e-luce-1979/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-21-bollettino-fede-e-luce-1979/",
        archive_org_item_id: "insieme-21",
        archive_view_url: "https://archive.org/details/insieme-21/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-21/insieme%2021%20giu%201979.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1979/lamore-non-basta/",
          "https://www.ombreeluci.it/1979/ci-hanno-scritto-una-critica-allultimo-numero-di-insieme/",
          "https://www.ombreeluci.it/1979/per-la-nostra-riflessione-prendete-e-mangiatene-tutti/",
          "https://www.ombreeluci.it/1979/leducazione-dei-bambini-cosiddetti-lievi-si-ma-quale/",
          "https://www.ombreeluci.it/1979/viviamo-una-vita-normale/",
          "https://www.ombreeluci.it/1979/non-e-cosi-facile-essere-madre-di-una-bambina-non-grave/",
          "https://www.ombreeluci.it/1979/si-e-allontanato-per-la-prima-volta/",
          "https://www.ombreeluci.it/1979/ora-ha-un-mondo-suo-oltre-la-sua-famiglia/",
          "https://www.ombreeluci.it/1979/in-vacanza-tutto-come-se-si-trattasse-di-un-gioco/",
          "https://www.ombreeluci.it/1979/adesso-fa-la-quarta-sta-ancora-con-noi/",
          "https://www.ombreeluci.it/1979/fu-in-tenda-che-mi-diede-il-benvenuto/",
          "https://www.ombreeluci.it/1979/come-mettere-in-quattro-righe-oltre-10-anni-di-vita/",
          "https://www.ombreeluci.it/1979/ci-hanno-scritto-n-21/",
          "https://www.ombreeluci.it/1979/apriamo-il-sipario-oggi-si-recita/",
          "https://www.ombreeluci.it/1979/il-ruolo-del-pediatra-nel-trattamento-del-bambino-handicappato/",
          "https://www.ombreeluci.it/1979/notiziario-fede-e-luce-n-21/",
          "https://www.ombreeluci.it/1979/letture-consigliate-il-piccolo-principe/"
        ],
        issues: []
      },
      {
        id_numero: "INS-22",
        tipo_rivista: "insieme",
        numero_progressivo: 22,
        display_title: "Insieme n. 22 \u2013 Bollettino Fede e Luce \u2013 1979",
        titolo_numero: "Bollettino Fede e Luce \u2013 1979",
        seo_description: `Questo numero di "Insieme" ci porta in un viaggio attraverso le esperienze di vita e fede condivise dalle famiglie di Fede e Luce. Attraverso lettere, racconti e resoconti di eventi, si scopre come l'incontro con la disabilit\xE0 trasformi la vita, aprendo a nuove prospettive di amore, accettazione e speranza. Dalle vacanze condivise alle gite in montagna, dalla festa della primavera al pellegrinaggio a Loreto, ogni pagina trasmette la gioia di una comunit\xE0 che celebra la vita in tutte le sue sfumature.`,
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 22 \u2013 Bollettino Fede e Luce \u2013 1979 Luglio \u2013 Agosto \u2013 Settembre 1979",
        descrizione_ai: null,
        anno_pubblicazione: 1979,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-22-set-1979.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-22-bollettino-fede-e-luce-1979/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-22-bollettino-fede-e-luce-1979/",
        archive_org_item_id: "insieme-22",
        archive_view_url: "https://archive.org/details/insieme-22/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-22/insieme%2022%20set%201979.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1979/aria-di-vacanze/",
          "https://www.ombreeluci.it/1979/ci-hanno-scritto-n-22/",
          "https://www.ombreeluci.it/1979/un-compleanno-al-capezzale-di-un-amico/",
          "https://www.ombreeluci.it/1979/mattone-su-mattone/",
          "https://www.ombreeluci.it/1979/focus-gli-adulti-profondamente-handicappati-alcune-testimonianze/",
          "https://www.ombreeluci.it/1979/non-avrei-mai-pensato/",
          "https://www.ombreeluci.it/1979/siamo-stati-dei-buoni-genitori/",
          "https://www.ombreeluci.it/1979/un-antidoto-alla-disperazione/",
          "https://www.ombreeluci.it/1979/mio-fratello-marco/",
          "https://www.ombreeluci.it/1979/sprovveduto-e-sorpreso-chi-non-lo-e/",
          "https://www.ombreeluci.it/1979/incontro-internazionale-a-cuneo-28-29-aprile-1979/",
          "https://www.ombreeluci.it/1979/pellegrinaggio-a-loreto-1979-olga-gammarelli/",
          "https://www.ombreeluci.it/1979/pellegrinaggio-a-loreto-18-20-maggio-1979-testimonianze-partecipanti/",
          "https://www.ombreeluci.it/1979/23-maggio-1979-festa-della-primavera/",
          "https://www.ombreeluci.it/1979/gita-ad-argegno-3-giugno-1979/",
          "https://www.ombreeluci.it/1979/vita-fede-e-luce-n-22-1979/",
          "https://www.ombreeluci.it/1979/letture-consigliate-n-22/"
        ],
        issues: []
      },
      {
        id_numero: "INS-23",
        tipo_rivista: "insieme",
        numero_progressivo: 23,
        display_title: "Insieme n. 23 \u2013 Bollettino Fede e Luce \u2013 1979",
        titolo_numero: "Bollettino Fede e Luce \u2013 1979",
        seo_description: `Questo numero di "Insieme" ci porta a riflettere sul valore della dignit\xE0 umana e sull'importanza dell'ascolto e della comprensione. Attraverso le testimonianze di persone con disabilit\xE0, genitori e amici, scopriamo la ricchezza che ognuno porta con s\xE9 e la forza dell'amicizia che ci unisce. Un invito ad aprirsi alla "luce" che risplende in ogni persona e a costruire insieme un mondo pi\xF9 inclusivo.`,
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 23 \u2013 Bollettino Fede e Luce \u2013 1979 Ottobre \u2013 Novembre \u2013 Dicembre 1979",
        descrizione_ai: null,
        anno_pubblicazione: 1979,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-23-dic-1979.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-23-bollettino-fede-e-luce-1979/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-23-bollettino-fede-e-luce-1979/",
        archive_org_item_id: "insieme-23",
        archive_view_url: "https://archive.org/details/insieme-23/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-23/insieme%2023%20dic%201979.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1979/perche-vi-chiamate-fede-e-luce/",
          "https://www.ombreeluci.it/1979/adulti-lievemente-handicappati/",
          "https://www.ombreeluci.it/1979/vuoi-essere-mio-amico/",
          "https://www.ombreeluci.it/1979/saluta-la-tua-insegnante/",
          "https://www.ombreeluci.it/1979/e-domani/",
          "https://www.ombreeluci.it/1979/dialoghi-scomodi-amicizie-vere/",
          "https://www.ombreeluci.it/1979/teresa-venti-anni-cambiamenti-disabilita/",
          "https://www.ombreeluci.it/1979/amicizie/",
          "https://www.ombreeluci.it/1979/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
          "https://www.ombreeluci.it/1979/marymount-unestate-di-musica-e-sorrisi/",
          "https://www.ombreeluci.it/1979/insieme-verso-la-pasqua-1981/",
          "https://www.ombreeluci.it/1979/tema-dellanno-1980-lincontro/",
          "https://www.ombreeluci.it/1979/letture-consigliate-n-23/",
          "https://www.ombreeluci.it/1979/ci-hanno-scritto-n-23/",
          "https://www.ombreeluci.it/1979/trovai-lavoro-in-una-casa-farmaceutica/",
          "https://www.ombreeluci.it/1979/lordinazione-di-robert-michit/"
        ],
        issues: []
      },
      {
        id_numero: "INS-24",
        tipo_rivista: "insieme",
        numero_progressivo: 24,
        display_title: "Insieme n. 24 \u2013 Bollettino Fede e Luce \u2013 1980",
        titolo_numero: "Bollettino Fede e Luce \u2013 1980",
        seo_description: "Insieme n. 24 \u2013 Bollettino Fede e Luce \u2013 1980",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 24 \u2013 Bollettino Fede e Luce \u2013 1980 Gennaio \u2013 Febbraio \u2013 Marzo 1980",
        descrizione_ai: null,
        anno_pubblicazione: 1980,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-24-mar-1980.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-24-bollettino-fede-e-luce-1980/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-24-bollettino-fede-e-luce-1980/",
        archive_org_item_id: "insieme-26",
        archive_view_url: "https://archive.org/details/insieme-26",
        archive_download_pdf_url: "https://archive.org/download/insieme-26/insieme%2024%20mar%201980.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1980/di-nuovo-in-cammino/",
          "https://www.ombreeluci.it/1980/1-introduzione-fede-e-luce-anatomia-di-una-comunita-di-incontro",
          "https://www.ombreeluci.it/1980/2-fede-e-luce-larte-dellincontro-per-superare-la-paura-della-diversita",
          "https://www.ombreeluci.it/1980/3-i-protagonisti-i-volti-di-fede-e-luce-persona-con-disabilita-genitori-amici-e-sacerdoti/",
          "https://www.ombreeluci.it/1980/4-vita-comunitaria-costruire-comunita-tre-pilastri-fede-luce/",
          "https://www.ombreeluci.it/1980/5-creascere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica",
          "https://www.ombreeluci.it/1980/ci-hanno-scritto-insieme-n-24/",
          "https://www.ombreeluci.it/1980/vita-fede-e-luce-n-24/",
          "https://www.ombreeluci.it/1980/andiamo-tutti-in-pizzeria/",
          "https://www.ombreeluci.it/1980/1-introduzione-fede-e-luce-anatomia-di-una-comunita-di-incontro/",
          "https://www.ombreeluci.it/1980/2-fede-e-luce-larte-dellincontro-per-superare-la-paura-della-diversita/",
          "https://www.ombreeluci.it/1980/5-creascere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/"
        ],
        issues: []
      },
      {
        id_numero: "INS-25",
        tipo_rivista: "insieme",
        numero_progressivo: 25,
        display_title: "Insieme n. 25 \u2013 Bollettino Fede e Luce \u2013 1980",
        titolo_numero: "Bollettino Fede e Luce \u2013 1980",
        seo_description: "Insieme n. 25 \u2013 Bollettino Fede e Luce \u2013 1980",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 25 \u2013 Bollettino Fede e Luce \u2013 1980 Aprile \u2013 Maggio \u2013 Giugno 1980",
        descrizione_ai: null,
        anno_pubblicazione: 1980,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-25-giu-1980.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-25-bollettino-fede-e-luce-1980/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-25-bollettino-fede-e-luce-1980/",
        archive_org_item_id: "insieme-25",
        archive_view_url: "https://archive.org/details/insieme-25/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-25/insieme%2025%20giu%201980.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1980/fratelli-e-sorelle-di-persone-con-disabilita-2/",
          "https://www.ombreeluci.it/1980/jean-vanier-libano/",
          "https://www.ombreeluci.it/1980/ci-hanno-scritto-insieme-n-23/",
          "https://www.ombreeluci.it/1980/25-numero-6-anno/",
          "https://www.ombreeluci.it/1980/io-mi-domando/",
          "https://www.ombreeluci.it/1980/gli-altri-vostri-figli-lhanno-accettato/",
          "https://www.ombreeluci.it/1980/perche-non-mi-capisci-2/",
          "https://www.ombreeluci.it/1980/una-realta-esigente/",
          "https://www.ombreeluci.it/1980/mia-sorella/",
          "https://www.ombreeluci.it/1980/non-e-facile-esprimere/",
          "https://www.ombreeluci.it/1980/una-lettera/",
          "https://www.ombreeluci.it/1980/la-mia-vita/",
          "https://www.ombreeluci.it/1980/vita-fede-e-luce/",
          "https://www.ombreeluci.it/1980/alessandro-bertolini/",
          "https://www.ombreeluci.it/1980/e-uscita-una-nuova-legge-sullassegno-di-accompagnamento-per-le-persone-totalmente-inabili/",
          "https://www.ombreeluci.it/1980/letture-consigliate-la-vita-puo-ricominciare-recensione/",
          "https://www.ombreeluci.it/1980/questionario-per-i-fratelli-e-sorrelle-di-persone-con-disabilita/"
        ],
        issues: []
      },
      {
        id_numero: "INS-26",
        tipo_rivista: "insieme",
        numero_progressivo: 26,
        display_title: "Insieme n. 26 \u2013 Bollettino Fede e Luce \u2013 1980",
        titolo_numero: "Bollettino Fede e Luce \u2013 1980",
        seo_description: "Rivista Insieme di Fede e Luce: esperienze comunitarie, riflessioni spirituali e testimonianze dal movimento per l'integrazione di persone con disabilit\xE0 e le loro famiglie.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 26 \u2013 Bollettino Fede e Luce \u2013 1980 Luglio \u2013 Agosto \u2013 Settembre 1980",
        descrizione_ai: null,
        anno_pubblicazione: 1980,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-26-set-1980.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-26-bollettino-fede-e-luce-1980/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-26-bollettino-fede-e-luce-1980/",
        archive_org_item_id: "insieme-26_202309",
        archive_view_url: "https://archive.org/details/insieme-26_202309/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-26_202309/insieme%2026%20set%201980.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1980/uno-due-tre-stella/",
          "https://www.ombreeluci.it/1980/ci-hanno-scritto-insieme-n-26/",
          "https://www.ombreeluci.it/1980/dalla-parte-di-lazzaro/",
          "https://www.ombreeluci.it/1980/5-anni-di-casetta/",
          "https://www.ombreeluci.it/1980/andiamo-alla-casetta/",
          "https://www.ombreeluci.it/1980/via-plinio-30/",
          "https://www.ombreeluci.it/1980/consumare-lo-stesso-pasto/",
          "https://www.ombreeluci.it/1980/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
          "https://www.ombreeluci.it/1980/vita-fede-e-luce-insieme-n-26/",
          "https://www.ombreeluci.it/1980/letture-consigliate-n-26/",
          "https://www.ombreeluci.it/1980/un-problema-che-non-so-risolvere/"
        ],
        issues: []
      },
      {
        id_numero: "INS-27",
        tipo_rivista: "insieme",
        numero_progressivo: 27,
        display_title: "Insieme n. 27 \u2013 Bollettino Fede e Luce \u2013 1980",
        titolo_numero: "Bollettino Fede e Luce \u2013 1980",
        seo_description: "Insieme n. 27 \u2013 Bollettino Fede e Luce \u2013 1980",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 27 \u2013 Bollettino Fede e Luce \u2013 1980 Ottobre \u2013 Novembre \u2013 Dicembre 1980",
        descrizione_ai: null,
        anno_pubblicazione: 1980,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-27-dic-1980.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-27-bollettino-fede-e-luce-1980/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-27-bollettino-fede-e-luce-1980/",
        archive_org_item_id: "insieme-27",
        archive_view_url: "https://archive.org/details/insieme-27/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-27/insieme%2027%20dic%201980%20.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1980/sia-fatta-la-tua-volonta/",
          "https://www.ombreeluci.it/1980/ci-hanno-scritto-insieme-n-27/",
          "https://www.ombreeluci.it/1980/ogni-volta-che-lascio-alfedena/",
          "https://www.ombreeluci.it/1980/quante-domande-davanti-a-loro/",
          "https://www.ombreeluci.it/1980/fratelli-e-sorelle-di-persone-con-disabilita-una-realta-da-riscoprire/",
          "https://www.ombreeluci.it/1980/lavventura-di-oletta-quando-il-cavallo-diventa-terapia/",
          "https://www.ombreeluci.it/1980/marina-di-camerota-venti-giorni-di-prime-volte/",
          "https://www.ombreeluci.it/1980/estate-fede-e-luce-1980-la-gioia-di-fare-vacanza-insieme/",
          "https://www.ombreeluci.it/1980/campeggio-fede-e-luce-unavventura-di-vita-e-comunita/",
          "https://www.ombreeluci.it/1980/un-aiuto-per-il-pellegrinaggio-di-lourdes-1981-chi-puo-darci-una-mano/",
          "https://www.ombreeluci.it/1980/incontro-internazionale-e-nazionale-un-ponte-di-solidarieta-tra-paesi-e-comunita/"
        ],
        issues: []
      },
      {
        id_numero: "INS-28",
        tipo_rivista: "insieme",
        numero_progressivo: 28,
        display_title: "Insieme n. 28 \u2013 Bollettino Fede e Luce \u2013 1981",
        titolo_numero: "Bollettino Fede e Luce \u2013 1981",
        seo_description: "Insieme n. 28 \u2013 Bollettino Fede e Luce \u2013 1981",
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 28 \u2013 Bollettino Fede e Luce \u2013 1981 Gennaio \u2013 Febbraio \u2013 Marzo 1981",
        descrizione_ai: null,
        anno_pubblicazione: 1981,
        anno_collezione: null,
        periodicita: "mensile",
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-28-mar-1981.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-28-bollettino-fede-e-luce-1981/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-28-bollettino-fede-e-luce-1981/",
        archive_org_item_id: "insieme-28",
        archive_view_url: "https://archive.org/details/insieme-28/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-28/insieme%2028%20mar%201981.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1981/la-dove-tu-ci-vuoi-ogni-giorno/",
          "https://www.ombreeluci.it/1981/ci-hanno-scritto-insieme-n-28/",
          "https://www.ombreeluci.it/1981/il-loro-credo/",
          "https://www.ombreeluci.it/1981/i-nostri-figli-con-disabilita-a-scuola/",
          "https://www.ombreeluci.it/1981/dal-sostegno-alla-partecipazione-esperienze-di-educazione-inclusiva-per-bambini-con-difficolta/",
          "https://www.ombreeluci.it/1981/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
          "https://www.ombreeluci.it/1981/vita-fede-e-luce-insieme-n-28/",
          "https://www.ombreeluci.it/1981/la-vendita-di-novembre-impegno-e-solidarieta/",
          "https://www.ombreeluci.it/1981/incontro-internazionale-preparativi-e-spiritualita/"
        ],
        issues: []
      },
      {
        id_numero: "INS-29",
        tipo_rivista: "insieme",
        numero_progressivo: 29,
        display_title: "Insieme n. 29 \u2013 Bollettino Fede e Luce \u2013 1981",
        titolo_numero: "Bollettino Fede e Luce \u2013 1981",
        seo_description: `Questo numero di "Insieme" \xE8 interamente dedicato al tema dell'animazione nelle comunit\xE0 di Fede e Luce. Dall'organizzazione delle celebrazioni liturgiche alla gestione delle feste, dall'uso della musica al teatro, gli articoli offrono esperienze concrete e suggerimenti pratici per rendere vivi e significativi i momenti comunitari. Particolare attenzione \xE8 dedicata al coinvolgimento delle persone con disabilit\xE0, valorizzando i talenti di ciascuno per creare autentici momenti di condivisione e gioia.Gli autori - tra cui Jean Vanier, fondatore delle comunit\xE0 dell'Arca - condividono riflessioni e metodologie sperimentate sul campo, fornendo strumenti utili per chi si occupa di animazione in contesti inclusivi. Il numero si completa con una rassegna di libri sul tema e la presentazione di due comunit\xE0 che possono essere fonte di ispirazione.`,
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 29 \u2013 Bollettino Fede e Luce \u2013 1981 Aprile \u2013 Maggio \u2013 Giugno 1980",
        descrizione_ai: null,
        anno_pubblicazione: 1981,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-29-giu-1981.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-29-bollettino-fede-e-luce-1981/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-29-bollettino-fede-e-luce-1981/",
        archive_org_item_id: "insieme-29",
        archive_view_url: "https://archive.org/details/insieme-29/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-29/insieme%2029%20giu%201981.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1981/perche-un-numero-dedicato-allanimazione/",
          "https://www.ombreeluci.it/1981/animare-una-messa-e-renderla-viva-facendo-lunita/",
          "https://www.ombreeluci.it/1981/principi-di-azione-per-una-equipe-di-animazione/",
          "https://www.ombreeluci.it/1981/dare-vita-movimento-calore-limportanza-dellanimazione-nelle-comunita-fede-e-luce/",
          "https://www.ombreeluci.it/1981/dopo-di-me-il-diluvio-commedia-musicale-del-gruppo-fede-e-luce-di-san-paolo/",
          "https://www.ombreeluci.it/1981/la-festa-uno-dei-momenti-essenziale-della-comunita-fede-e-luce/",
          "https://www.ombreeluci.it/1981/unora-di-musica-con-suor-maria/",
          "https://www.ombreeluci.it/1981/comunita-di-fede-e-luce/",
          "https://www.ombreeluci.it/1981/consigli-di-lettura-insieme-n-29/"
        ],
        issues: []
      },
      {
        id_numero: "INS-30",
        tipo_rivista: "insieme",
        numero_progressivo: 30,
        display_title: "Insieme n. 30 \u2013 Bollettino Fede e Luce \u2013 1981",
        titolo_numero: "Bollettino Fede e Luce \u2013 1981",
        seo_description: `Numero speciale della rivista "Insieme" di Fede e Luce dedicato al pellegrinaggio internazionale a Lourdes dell'aprile 1981. Il fascicolo raccoglie testimonianze, riflessioni e cronache dei quattro giorni vissuti`,
        descrizione_originale: "\u2190 Prec Succ \u2192 Insieme n. 30 \u2013 Bollettino Fede e Luce \u2013 1981 Luglio \u2013 Agosto \u2013 Settembre 1980",
        descrizione_ai: null,
        anno_pubblicazione: 1981,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/insieme-30-set-1981.webp",
        wp_url_numero: "https://www.ombreeluci.it/project/insieme-n-30-bollettino-fede-e-luce-1981/",
        canonical_url: "https://www.ombreeluci.it/project/insieme-n-30-bollettino-fede-e-luce-1981/",
        archive_org_item_id: "insieme-30",
        archive_view_url: "https://archive.org/details/insieme-30/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/insieme-30/insieme%2030%20set%201981.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1981/jean-vanier-ai-giovani/",
          "https://www.ombreeluci.it/1981/perche-a-lourdes/",
          "https://www.ombreeluci.it/1981/in-viaggio-verso-lourdes/",
          "https://www.ombreeluci.it/1981/lourdes-1981-giovedi-santo/",
          "https://www.ombreeluci.it/1981/lourdes-1981-venerdi-santo/",
          "https://www.ombreeluci.it/1981/lourdes-1981-sabato-santo/",
          "https://www.ombreeluci.it/1981/lourdes-1981-domenica-di-pasqua/",
          "https://www.ombreeluci.it/1981/va-verso-i-tuoi-fratelli-e-di-loro/",
          "https://www.ombreeluci.it/1981/una-nuova-speranza/",
          "https://www.ombreeluci.it/1981/buon-natale-1981-e-un-numero-speciale/",
          "https://www.ombreeluci.it/1981/storia-di-natale/",
          "https://www.ombreeluci.it/1981/il-futuro-di-insieme-una-catena-che-diventa-sempre-piu-grande/",
          "https://www.ombreeluci.it/1981/voci-dal-pellegrinaggio-lourdes-1981-frammenti-di-vita-e-di-fede/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-1",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 1,
        display_title: "Ombre e Luci n. 1 - 1983",
        titolo_numero: "Ombre e Luci n. 1 - 1983",
        seo_description: "In questo numero: Con Ombre e Luci ci rivolgiamo ai genitori, agli amici, agli educatori di persone con disabilit\xE0 (bambini, adolescenti, adulti). Tutti i giorni, chi ha un figlio con disabilit\xE0 sa per esperienza cosa \xE8 la solitudine. Attraverso le testimonianze e le riflessioni di chi \xE8 coinvolto in prima persona, cerchiamo insieme un nuovo sguardo e una vita piena per quanti vivono questa esperienza.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 1 \u2013 Ombre e luci? Anno 1, 1983 \u2013 Trimestrale: Gennaio, Febbraio, Marzo",
        descrizione_ai: null,
        anno_pubblicazione: 1983,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Gennaio, Febbraio, Marzo",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/1983/03/Archivio-Num.-1-1983-1.png",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-1-inverno-la-vita-affettiva-degli-handicappati-mentali/",
        canonical_url: "https://www.ombreeluci.it/project/numero-1-inverno-la-vita-affettiva-degli-handicappati-mentali/",
        archive_org_item_id: "OmbreELuci_001",
        archive_view_url: "https://archive.org/details/OmbreELuci_001",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuci_001/Ombre-e-Luci-n.1.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1983/ombre-e-luci-n-1-1983-sfogliabile/",
          "https://www.ombreeluci.it/1983/lesperienza-della-solitudine/",
          "https://www.ombreeluci.it/1983/difficolta-loro-o-nostra/",
          "https://www.ombreeluci.it/1983/a-proposito-della-vita-affettiva-dellhandicappato-mentale/",
          "https://www.ombreeluci.it/1983/il-chicco-una-casa-per-fabio-e-maria/",
          "http://www.ombreeluci.it/1983/dialogo-aperto-n-1/",
          "http://www.ombreeluci.it/1983/il-dolore-innocente-un-handicappato-nella-mia-famiglia/",
          "http://www.ombreeluci.it/1983/darti-la-vita/",
          "https://www.ombreeluci.it/1983/ombre-e-luci/",
          "https://www.ombreeluci.it/1983/editoriale-n-1/",
          "https://www.ombreeluci.it/1983/vita-fede-e-luce-n-1/",
          "https://www.ombreeluci.it/1983/il-dolore-innocente-un-handicappato-nella-mia-famiglia/",
          "https://www.ombreeluci.it/1983/darti-la-vita/",
          "https://www.ombreeluci.it/1983/dialogo-aperto-n-1/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-2",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 2,
        display_title: "La paralisi cerebrale infantile - Ombre e Luci n.2, 1983",
        titolo_numero: "La paralisi cerebrale infantile - Ombre e Luci n.2, 1983",
        seo_description: "Paralisi cerebrale. Cerchiamo di capire le difficolt\xE0 di chi ne \xE8 colpito dalla nascita. Non \xE8 facile restare aperti alla speranza, senza scoraggiarsi, senza paura di perder tempo, per periodi molto pi\xF9 lunghi del normale. E quel che potrebbe essere facile, e stimolante quando i figli sono piccoli, diventa gravoso e duro quando sono adulti.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 2 \u2013 La paralisi cerebrale infantile Anno 1, 1983 \u2013 Trimestrale: Aprile, Maggio, Giugno",
        descrizione_ai: null,
        anno_pubblicazione: 1983,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Aprile, Maggio, Giugno",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/2-1.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-2-la-paralisi-cerebrale-infantile/",
        canonical_url: "https://www.ombreeluci.it/project/numero-2-la-paralisi-cerebrale-infantile/",
        archive_org_item_id: "OmbreELuci_002",
        archive_view_url: "https://archive.org/details/OmbreELuci_002",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuci_002/Ombre-e-Luci-n.2.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1983/vicenza-centro-di-formazione-professionale-dell-opera-francescana-charitas/",
          "http://www.ombreeluci.it/1983/dialogo-aperto-n-2/",
          "http://www.ombreeluci.it/1983/vita-fede-e-luce-n-2/",
          "http://www.ombreeluci.it/1983/leducazione-religiosa-degli-handicappati-nelle-opere-di-henri-bossonier/",
          "http://www.ombreeluci.it/1983/lassistenza-educativa-al-bambino-con-paralisi-cerebrale-nella-prima-infanzia/",
          "http://www.ombreeluci.it/1983/non-temere/",
          "https://www.ombreeluci.it/1983/speranza-a-dura-prova/",
          "https://www.ombreeluci.it/1983/conoscere-lhandicap-lorenza/",
          "https://www.ombreeluci.it/1983/la-paralisi-cerebrale-infantile/",
          "https://www.ombreeluci.it/1983/intelligenze-prigioniere-intelligences-captives-jacqueline-baillod/",
          "https://www.ombreeluci.it/1983/fermatevi-per-ascoltarci/",
          "https://www.ombreeluci.it/1983/terapia-con-il-cavallo/",
          "https://www.ombreeluci.it/1983/egle-bottega-e-sono-rimasta-la-mia-vita-per-il-centro/",
          "https://www.ombreeluci.it/1983/vicenza-centro-di-formazione-professionale-dell-opera-francescana-charitas/",
          "https://www.ombreeluci.it/1983/dialogo-aperto-numero-2/",
          "https://www.ombreeluci.it/1983/vita-fede-e-luce-n-2/",
          "https://www.ombreeluci.it/1983/non-temere/",
          "https://www.ombreeluci.it/1983/lassistenza-educativa-al-bambino-con-paralisi-cerebrale-nella-prima-infanzia/",
          "https://www.ombreeluci.it/1983/leducazione-religiosa-degli-handicappati-nelle-opere-di-henri-bossonier/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-3",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 3,
        display_title: "Vacanze: tempo privilegiato per l\u2019integrazione - Ombre e Luci n.3, 1983",
        titolo_numero: "Vacanze: tempo privilegiato per l\u2019integrazione - Ombre e Luci n.3, 1983",
        seo_description: 'In questo numero: Vacanze con chi ha una disabilit\xE0 mentale, lontano dalla propria famiglia. Il momento migliore per l\u2019integrazione tra gli altri: pi\xF9 tempo, il contatto con la natura, i ritmi pi\xF9 lenti\u2026 per scoprire che \u201Centrando nel cuore di ognuno si pu\xF2 apprezzare il tesoro che \xE8 in lui e che spesso rimane nascosto"',
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 3 \u2013 Vacanze: tempo privilegiato per l\u2019integrazione Anno 1, 1983 \u2013 Trimestrale: Luglio \u2013 Agosto \u2013 Settembre Sfoglia numero online",
        descrizione_ai: null,
        anno_pubblicazione: 1983,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/3-707x1024.jpeg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-3-vacanze-tempo-privilegiato-per-lintegrazione/",
        canonical_url: "https://www.ombreeluci.it/project/numero-3-vacanze-tempo-privilegiato-per-lintegrazione/",
        archive_org_item_id: "OmbreELuci_003",
        archive_view_url: "https://archive.org/details/OmbreELuci_003",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuci_003/Ombre-e-Luci-n.3.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1983/ombre-e-luci-n-3-1983-sfogliabile/",
          "http://www.ombreeluci.it/1983/gli-altri/",
          "http://www.ombreeluci.it/1983/con-loro-sono-salito-sul-monte-meta/",
          "http://www.ombreeluci.it/1983/vita-fede-e-luce-n-3/",
          "http://www.ombreeluci.it/1983/quando-il-dolore-bussa-forte/",
          "http://www.ombreeluci.it/1983/un-caso-di-coscienza/",
          "http://www.ombreeluci.it/1983/storia-di-un-padre/",
          "http://www.ombreeluci.it/1983/e-non-disse-nemmeno-una-parola/",
          "https://www.ombreeluci.it/1983/gli-altri/",
          "https://www.ombreeluci.it/1983/vacanze-con-la-differenza-nel-cuore/",
          "https://www.ombreeluci.it/1983/con-loro-sono-salito-sul-monte-meta/",
          "https://www.ombreeluci.it/1983/nessuno-aveva-pensato-che-patrick-avrebbe-preso-parte-alla-gita/",
          "https://www.ombreeluci.it/1983/per-la-prima-volta-lontano-da-me/",
          "https://www.ombreeluci.it/1983/insieme-si-ma-come/",
          "https://www.ombreeluci.it/1983/ed-e-stata-una-vera-vacanza/",
          "https://www.ombreeluci.it/1983/unaltra-proposta-di-vacanze-con-persone-disabili-i-soggiorni-invernali/",
          "https://www.ombreeluci.it/1983/ogni-luglio-presto-una-casa/",
          "https://www.ombreeluci.it/1983/vita-fede-e-luce-n-3/",
          "https://www.ombreeluci.it/1983/dialogo-aperto-numero-3/",
          "https://www.ombreeluci.it/1983/e-non-disse-nemmeno-una-parola/",
          "https://www.ombreeluci.it/1983/storia-di-un-padre/",
          "https://www.ombreeluci.it/1983/un-caso-di-coscienza/",
          "https://www.ombreeluci.it/1983/quando-il-dolore-bussa-forte/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-4",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 4,
        display_title: "Trisomia 21, la sindrome di Down - Ombre e Luci n.4, 1983",
        titolo_numero: "Trisomia 21, la sindrome di Down - Ombre e Luci n.4, 1983",
        seo_description: "La Sindrome di Down. Cristiano, 30 anni \xE8 un uomo molto vero, sa quali sono i suoi veri amici, ha un grande senso della sofferenza degli altri, sa essere compassionevole, \xE8 molto bravo nel proteggere chi \xE8 fragile e... ha la sindrome di Down. Insieme a Jerome Lejeune, Jean Vanier e le testimonianze di chi vive con la trisomia 21, scopriamo che non sono solo nuvole nere!",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 4 \u2013 Trisomia 21, la sindrome di Down Anno 1, 1983 \u2013 Trimestrale: Ottobre, Novembre, Dicembre Sfoglia numero online",
        descrizione_ai: null,
        anno_pubblicazione: 1983,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Ottobre, Novembre, Dicembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/3-1.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-4-un-figlio-mongoloide/",
        canonical_url: "https://www.ombreeluci.it/project/numero-4-un-figlio-mongoloide/",
        archive_org_item_id: "OmbreELuciN004",
        archive_view_url: "https://archive.org/details/OmbreELuciN004",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN004/Ombre-e-Luci-n.4.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1983/ombre-e-luci-n-4-1983-sfogliabile/",
          "http://www.ombreeluci.it/1983/editoriale-4-la-sindrome-down/",
          "http://www.ombreeluci.it/1983/il-bambino-trisomico/",
          "http://www.ombreeluci.it/1983/saverio/",
          "http://www.ombreeluci.it/1983/quando-la-vita-e-cosi-difficile/",
          "http://www.ombreeluci.it/1983/andrea-a-scuola/",
          "http://www.ombreeluci.it/1983/quando-sono-adulti/",
          "http://www.ombreeluci.it/1983/il-lavoro-di-gianni/",
          "http://www.ombreeluci.it/1983/dialogo-aperto-n-4/",
          "http://www.ombreeluci.it/1983/vita-fede-e-luce-n-4/",
          "http://www.ombreeluci.it/1983/la-debilita-mentale/",
          "http://www.ombreeluci.it/1983/i-giullari-di-dio-morris-west/",
          "http://www.ombreeluci.it/1983/meb-pittore-gioioso-le-conquiste-di-un-mongoloide/",
          "https://www.ombreeluci.it/1983/editoriale-4-il-mio-bambino-con-la-sindrome-down/",
          "https://www.ombreeluci.it/1983/saverio/",
          "https://www.ombreeluci.it/1983/quando-la-vita-e-cosi-difficile/",
          "https://www.ombreeluci.it/1983/trisomia-21-la-sindrome-down/",
          "https://www.ombreeluci.it/1983/il-lavoro-di-gianni/",
          "https://www.ombreeluci.it/1983/vita-fede-e-luce-n-4/",
          "https://www.ombreeluci.it/1983/dialogo-aperto-n-4/",
          "https://www.ombreeluci.it/1983/andrea-a-scuola/",
          "https://www.ombreeluci.it/1983/la-debilita-mentale/",
          "https://www.ombreeluci.it/1983/i-giullari-di-dio-morris-west/",
          "https://www.ombreeluci.it/1983/meb-pittore-gioioso-le-conquiste-di-un-mongoloide/",
          "https://www.ombreeluci.it/1983/il-bambino-down-una-guida-per-genitori/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-5",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 5,
        display_title: "Chi accoglie voi accoglie me - Ombre e Luci n.5, 1984",
        titolo_numero: "Chi accoglie voi accoglie me - Ombre e Luci n.5, 1984",
        seo_description: "\u201CChi accoglie voi, accoglie me\u201D. La vita spirituale delle persone con disabilit\xE0 mentale. Esperienze negative e positive di accoglienza nella vita cristiana. \u201CTutti sono chiamati alla Buona Notizia di Ges\xF9, soprattutto dopo il dono del Battesimo\u2026. Occorre un cambiamento di mentalit\xE0: ci immaginiamo che i fratelli in difficolt\xE0 bussino per chiedere aiuto, un sorriso, un appoggio.. .poi ci accorgiamo che vengono ad offrire un dono\u201D( Card. Martini.)",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 5 \u2013 Chi accoglie voi, accoglie me Anno 2, 1984 \u2013 Trimestrale: Gennaio, Febbraio, Marzo Sfoglia numero online Opzioni Download Sommario \u201CChi accoglie voi, accoglie me\u201D. La vita spirituale delle persone con disabilit\xE0 mentale. Esperienze negative e positive di accoglienza nella vita cristiana. \u201C Tutti sono chiamati alla Buona Notizia di Ges\xF9 , soprattutto dopo il dono del Battesimo\u2026 Occorre un cambiamento di mentalit\xE0: ci immaginiamo che i fratelli in difficolt\xE0 bussino per chiedere aiuto, un sorriso, un appoggio\u2026 poi ci accorgiamo che vengono ad offrire un dono\u201D.( Card. Martini.) Editoriale Nessuno escluso di Carlo Maria Martini Perch\xE9 lontano da Dio di Mariangela Bertolini Articoli \u201CLei non entra\u201D di Olga Gammarelli Come le altre domeniche Anna di J.F Basta la porta aperta (domande in 6 parrocchie) di Sergio Sciascia Cosa dirvi di pi\xF9 di St\xE9phane Desmasi\xE8rez Chiediamo alle comunit\xE0 religiose di Henri Faivre Cottolengo e Don Guanella \u2013 pregiudizi e realt\xE0 di Nicole Schulthes Rubriche Dialogo aperto n. 5 Vita Fede e Luce n. 5 Libri Dare a ciascuno una voce , Carlo M. Martini",
        descrizione_ai: null,
        anno_pubblicazione: 1984,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Gennaio, Febbraio, Marzo",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/5-1.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-5-chi-accoglie-voi-accoglie-me/",
        canonical_url: "https://www.ombreeluci.it/project/numero-5-chi-accoglie-voi-accoglie-me/",
        archive_org_item_id: "OmbreELuci_005",
        archive_view_url: "https://archive.org/details/OmbreELuci_005",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuci_005/Ombre-e-Luci-n.5.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1984/ombre-e-luci-n-6-1984-sfogliabile/",
          "http://www.ombreeluci.it/1984/nessuno-escluso/",
          "http://www.ombreeluci.it/1984/perche-lontano-da-dio/",
          "http://www.ombreeluci.it/1984/lei-non-entra/",
          "http://www.ombreeluci.it/1984/come-le-altre-domeniche-anna/",
          "http://www.ombreeluci.it/1984/basta-la-porta-aperta-domande-in-6-parrocchie/",
          "http://www.ombreeluci.it/1984/cosa-dirvi-di-piu/",
          "http://www.ombreeluci.it/1984/chiediamo-alle-comunita-religiose/",
          "http://www.ombreeluci.it/1984/cottolengo-e-don-guanella-pregiudizi-e-realta/",
          "http://www.ombreeluci.it/1984/dialogo-aperto-n-5/",
          "http://www.ombreeluci.it/1984/vita-fede-e-luce-n-5/",
          "http://www.ombreeluci.it/1984/dare-a-ciascuno-una-voce/",
          "https://www.ombreeluci.it/1984/perche-lontano-da-dio/",
          "https://www.ombreeluci.it/1984/nessuno-escluso/",
          "https://www.ombreeluci.it/1984/lei-non-entra/",
          "https://www.ombreeluci.it/1984/come-le-altre-domeniche-anna/",
          "https://www.ombreeluci.it/1984/cottolengo-e-don-guanella-pregiudizi-e-realta/",
          "https://www.ombreeluci.it/1984/secondo-le-possibilita-e-secondo-il-vangelo-chiediamo-alle-comunita-religiose/",
          "https://www.ombreeluci.it/1984/basta-la-porta-aperta-domande-in-6-parrocchie/",
          "https://www.ombreeluci.it/1984/cosa-dirvi-di-piu/",
          "https://www.ombreeluci.it/1984/vita-fede-e-luce-n-5/",
          "https://www.ombreeluci.it/1984/dialogo-aperto-n-5/",
          "https://www.ombreeluci.it/1984/dare-a-ciascuno-una-voce/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-6",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 6,
        display_title: "Il mistero del bambino psicotico - Ombre e Luci n.6, 1984",
        titolo_numero: "Il mistero del bambino psicotico - Ombre e Luci n.6, 1984",
        seo_description: "Con il termine \u201Cpsicosi infantile\u201D si indicano molte problematiche e, 30 anni fa, includeva anche l\u2019autismo: venivano cos\xEC diagnosticati i bambini che prima dei sei anni di et\xE0 manifestavano, senza alcun legame con altre patologie evidenti, turbe del comportamento, mancato sviluppo dell\u2019autonomia e gravi disturbi della comunicazione. I termini si aggiornano e perfezionano; le difficolt\xE0 no. Proviamo a compiere un piccolo viaggio -anche nel tempo, ma ancora necessario \u2013 attraverso le gravi problematiche che questa condizione impone, con le testimonianze di chi ha vissuto e vive questa esperienza con il proprio figlio e i contributi professionali di medici ed educatori.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 6 \u2013 Il mistero del bambino psicotico Anno 2, 1984 \u2013 Trimestrale: Aprile, Maggio, Giugno",
        descrizione_ai: null,
        anno_pubblicazione: 1984,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Aprile, Maggio, Giugno",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/6-1.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-6-il-mistero-del-bambino-psicotico/",
        canonical_url: "https://www.ombreeluci.it/project/numero-6-il-mistero-del-bambino-psicotico/",
        archive_org_item_id: "OmbreELuci_006",
        archive_view_url: "https://archive.org/details/OmbreELuci_006",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuci_006/Ombre-e-Luci-n.6.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1984/ombre-e-luci-n-6-1984-sfogliabile/",
          "http://www.ombreeluci.it/1984/il-mistero-del-bambino-psicotico/",
          "http://www.ombreeluci.it/1984/figlio-mio-non-credo/",
          "http://www.ombreeluci.it/1984/e-sempre-stato-rifiutato/",
          "http://www.ombreeluci.it/1984/la-legge-sullintegrazione/",
          "http://www.ombreeluci.it/1984/la-riabilitazione-nella-scuole-ma-la-bambina-non-e-tenuta-in-classe/",
          "http://www.ombreeluci.it/1984/nessun-uomo-e-una-pietra/",
          "http://www.ombreeluci.it/1984/psicosi-precoci/",
          "http://www.ombreeluci.it/1984/un-centro-per-la-cura-della-psicosi/",
          "http://www.ombreeluci.it/1984/consigli-utili/",
          "http://www.ombreeluci.it/1984/vita-fede-e-luce-n-6/",
          "http://www.ombreeluci.it/1984/vivere-con-un-bambino-autistico/",
          "https://www.ombreeluci.it/1984/il-mistero-del-bambino-psicotico/",
          "https://www.ombreeluci.it/1984/e-sempre-stato-rifiutato/",
          "https://www.ombreeluci.it/1984/figlio-mio-non-credo/",
          "https://www.ombreeluci.it/1984/la-legge-sullintegrazione/",
          "https://www.ombreeluci.it/1984/la-riabilitazione-nella-scuole-ma-la-bambina-non-e-tenuta-in-classe/",
          "https://www.ombreeluci.it/1984/nessun-uomo-e-una-pietra/",
          "https://www.ombreeluci.it/1984/psicosi-precoci-che-cosa-sono/",
          "https://www.ombreeluci.it/1984/oltre-la-scienza-umanita-e-buon-senso-in-un-centro-per-la-cura-della-psicosi/",
          "https://www.ombreeluci.it/1984/psicosi-infantile-alcuni-consigli-utili/",
          "https://www.ombreeluci.it/1984/vita-fede-e-luce-n-6/",
          "https://www.ombreeluci.it/1984/vivere-con-un-bambino-autistico/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-7",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 7,
        display_title: "Scuola del fare - Ombre e Luci n.7 - 1984",
        titolo_numero: "Scuola del fare - Ombre e Luci n.7 - 1984",
        seo_description: "In questo numero: Alcune esperienze concrete e le domande sulle criticit\xE0 dell\u2019integrazione scolastica. Ma anche una riflessione di Jean Vanier per ciascuno di noi: cerchiamo di non aver paura di scoprire il povero che \xE8 in noi. Infine, due storie di vita insieme: una famiglia che adotta e una casa-famiglia.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 7 \u2013 Scuola del fare Anno 2, 1984 \u2013 Trimestrale: Luglio, Agosto, Settembre",
        descrizione_ai: null,
        anno_pubblicazione: 1984,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Luglio, Agosto, Settembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_7_1984.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-7-scuola-del-fare/",
        canonical_url: "https://www.ombreeluci.it/project/numero-7-scuola-del-fare/",
        archive_org_item_id: "OmbreELuciN007",
        archive_view_url: "https://archive.org/details/OmbreELuciN007",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN007/Ombre-e-Luci-n.7.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1984/ombre-e-luci-n-7-1984-sfogliabile/",
          "http://www.ombreeluci.it/1984/una-verita-difficile-a-dirsi/",
          "http://www.ombreeluci.it/1984/un-uovo-due-uova/",
          "http://www.ombreeluci.it/1984/classe-azzurro/",
          "http://www.ombreeluci.it/1984/quel-lupo-dentro-noi/",
          "http://www.ombreeluci.it/1984/il-volontariato/",
          "http://www.ombreeluci.it/1984/storia-di-unadozione/",
          "http://www.ombreeluci.it/1984/casa-jada/",
          "http://www.ombreeluci.it/1984/dialogo-aperto-n-7/",
          "http://www.ombreeluci.it/1984/vita-fede-e-luce-n-7-il-convegno-interazionale/",
          "http://www.ombreeluci.it/1984/li-fece-uomo-e-donna/",
          "https://www.ombreeluci.it/1984/quando-e-volontariato/",
          "https://www.ombreeluci.it/1984/integrazione-a-scuola-una-verita-difficile-a-dirsi/",
          "https://www.ombreeluci.it/1984/quel-lupo-dentro-noi/",
          "https://www.ombreeluci.it/1984/un-uovo-due-uova/",
          "https://www.ombreeluci.it/1984/li-fece-uomo-e-donna/",
          "https://www.ombreeluci.it/1984/casa-jada/",
          "https://www.ombreeluci.it/1984/il-nostro-cucciolo-di-due-metri-storia-di-un-adozione/",
          "https://www.ombreeluci.it/1984/vita-fede-e-luce-n-7-il-convegno-interazionale/",
          "https://www.ombreeluci.it/1984/dialogo-aperto-n-7/",
          "https://www.ombreeluci.it/1984/classe-azzurro/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-8",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 8,
        display_title: "Essere forti per loro - Ombre e Luci n. 8, 1984",
        titolo_numero: "Essere forti per loro - Ombre e Luci n. 8, 1984",
        seo_description: "In questo numero: Ritrovarsi genitori di un bambino con una disabilit\xE0: \u201C\u2026 all\u2019inizio non volevamo credere\u2026 La prima reazione \xE8 di non vedere questa realt\xE0\u2026 Presto per\xF2 bisogna affrontarla. E\u2019 una rimessa in causa di se stessi, di tutta la scala dei valori che ci eravamo fissati, di tutti i piani stabiliti\u2026 Il nostro sconforto non colpisce noi, n\xE9 voi, ma nostra figlia Caterina. Allora, bisogna reagire, bisogna essere forti per lei\u2026 Facciamo in modo che la nostra accettazione sia la vostra accettazione\u201D.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 8 \u2013 Essere forti per loro Anno 2, 1984 \u2013 Trimestrale: Ottobre, Novembre, Dicembre",
        descrizione_ai: null,
        anno_pubblicazione: 1984,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Ottobre, Novembre, Dicembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_8_1984.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-8-essere-forti-per-loro/",
        canonical_url: "https://www.ombreeluci.it/project/numero-8-essere-forti-per-loro/",
        archive_org_item_id: "OmbreELuci_008",
        archive_view_url: "https://archive.org/details/OmbreELuci_008",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuci_008/Ombre-e-Luci-n.8.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1984/ombre-e-luci-n-8-1984-sfogliabile/",
          "http://www.ombreeluci.it/1984/ritrovarsi-genitore-di-un-bambino-handicappato/",
          "http://www.ombreeluci.it/1984/essere-forti-per-lei/",
          "http://www.ombreeluci.it/1984/ed-era-la-nostra-consolazione/",
          "http://www.ombreeluci.it/1984/natale-del-mio-cuore/",
          "http://www.ombreeluci.it/1984/so-quel-che-non-bisogna-fare/",
          "http://www.ombreeluci.it/1984/e_gli_altri-_figli_consigli_per_-i_-genitori_di_bambino_disabile/",
          "http://www.ombreeluci.it/1984/prima-che-sia-tardi/",
          "http://www.ombreeluci.it/1984/dialogo-aperto-n-8/",
          "http://www.ombreeluci.it/1984/vita-fede-e-luce-n-8-che-cosa-e-fede-e-luce/",
          "https://www.ombreeluci.it/1984/quando-e-volontariato/",
          "https://www.ombreeluci.it/1984/integrazione-a-scuola-una-verita-difficile-a-dirsi/",
          "https://www.ombreeluci.it/1984/quel-lupo-dentro-noi/",
          "https://www.ombreeluci.it/1984/un-uovo-due-uova/",
          "https://www.ombreeluci.it/1984/li-fece-uomo-e-donna/",
          "https://www.ombreeluci.it/1984/casa-jada/",
          "https://www.ombreeluci.it/1984/il-nostro-cucciolo-di-due-metri-storia-di-un-adozione/",
          "https://www.ombreeluci.it/1984/vita-fede-e-luce-n-7-il-convegno-interazionale/",
          "https://www.ombreeluci.it/1984/dialogo-aperto-n-7/",
          "https://www.ombreeluci.it/1984/classe-azzurro/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-9",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 9,
        display_title: "Fratelli e sorelle - Ombre e Luci n. 9, 1985",
        titolo_numero: "Fratelli e sorelle - Ombre e Luci n. 9, 1985",
        seo_description: "In questo numero: Voci di fratelli e sorelle di una persona con disabilit\xE0 mentale. Si tace troppo spesso la loro sofferenza, spesso trascurati in questa loro pena segreta, temoni di parlarne con i loro genitori ma anche con gli \u201Caltri\u201D\u2026finiscono col tacere per timore di non essere capiti. Ma, per difficile che sia la situazione, val la pena di osare parlarne con qualcuno , non fosse altro che per non portare il peso",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 9 \u2013 Fratelli e sorelle Anno 3, 1985 \u2013 Trimestrale: Gennaio, Febbraio, Marzo",
        descrizione_ai: null,
        anno_pubblicazione: 1985,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Gennaio, Febbraio, Marzo",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_9_1985.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-9-fratelli-sorelle/",
        canonical_url: "https://www.ombreeluci.it/project/numero-9-fratelli-sorelle/",
        archive_org_item_id: "Httpsarchive.orgdetailsOmbreELuci_009",
        archive_view_url: "https://archive.org/details/Httpsarchive.orgdetailsOmbreELuci_009",
        archive_download_pdf_url: "https://archive.org/download/Httpsarchive.orgdetailsOmbreELuci_009/Ombre-e-Luci-n.9.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1985/ombre-e-luci-n-9-1985-sfogliabile/",
          "http://www.ombreeluci.it/1985/voci-di-sorelle-e-fratelli/",
          "http://www.ombreeluci.it/1985/care-sorelle-cari-fratelli-vi-scrivo/",
          "http://www.ombreeluci.it/1985/piano-piano-notai-che-sergio-era-differente/",
          "http://www.ombreeluci.it/1985/non-solo-tutto-lanno-ma-tutti-gli-anni/",
          "http://www.ombreeluci.it/1985/spesso-pero-mi-regala-il-suo-prezioso-sorriso/",
          "http://www.ombreeluci.it/1985/forse-per-questo-non-sono-andato-via/",
          "http://www.ombreeluci.it/1985/mio-fratello-era-handicappato/",
          "http://www.ombreeluci.it/1985/ho-scelto-mio-fratello/",
          "http://www.ombreeluci.it/1985/crescere-insieme/",
          "http://www.ombreeluci.it/1985/ma-dopo-rincontro-non-li-vedo-piu/",
          "http://www.ombreeluci.it/1985/dialogo-aperto-n-9/",
          "http://www.ombreeluci.it/1985/vita-fede-e-luce-n-9/",
          "http://www.ombreeluci.it/1985/labbe-pierre-una-mano-tesa-agli-emarginati/",
          "http://www.ombreeluci.it/1985/la-paura-di-amare-la-persona-handicappata-nella-societa/",
          "https://www.ombreeluci.it/1985/voci-di-sorelle-e-fratelli/",
          "https://www.ombreeluci.it/1985/care-sorelle-cari-fratelli-vi-scrivo/",
          "https://www.ombreeluci.it/1985/piano-piano-notai-che-sergio-era-differente/",
          "https://www.ombreeluci.it/1985/non-solo-tutto-lanno-ma-tutti-gli-anni/",
          "https://www.ombreeluci.it/1985/spesso-pero-mi-regala-il-suo-prezioso-sorriso/",
          "https://www.ombreeluci.it/1985/forse-per-questo-non-sono-andato-via/",
          "https://www.ombreeluci.it/1985/mio-fratello-era-handicappato/",
          "https://www.ombreeluci.it/1985/ho-scelto-mio-fratello/",
          "https://www.ombreeluci.it/1985/crescere-insieme/",
          "https://www.ombreeluci.it/1985/ma-dopo-l-incontro-non-li-vedo-piu/",
          "https://www.ombreeluci.it/1985/labbe-pierre-una-mano-tesa-agli-emarginati/",
          "https://www.ombreeluci.it/1985/la-paura-di-amare-la-persona-handicappata-nella-societa/",
          "https://www.ombreeluci.it/1985/vita-fede-e-luce-n-9/",
          "https://www.ombreeluci.it/1985/dialogo-aperto-n-9/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-10",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 10,
        display_title: "Epilessia, una montagna di pregiudizi - Ombre e luci n.10, 1985",
        titolo_numero: "Epilessia, una montagna di pregiudizi - Ombre e luci n.10, 1985",
        seo_description: "In questo numero: l'epilessia e la comunit\xE0 cooperativa Il Girasole, modello di integrazione tra pubblico e privato. Approfondimenti per ricordare alcuni degli scopi della nostra rivista: informare su cosa siano alcuni tipi di handicap per capire e accogliere meglio chi vive una condizione di disabilit\xE0 e favorire il loro inserimento nella societ\xE0 e nella Chiesa.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 10 \u2013 Epilessia, una montagna di pregiudizi Anno 3, 1985 \u2013 Trimestrale: Aprile, Maggio, Giugno",
        descrizione_ai: null,
        anno_pubblicazione: 1985,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Aprile, Maggio, Giugno",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_10_1985.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-10-epilessia-una-montagna-di-pregiudizi/",
        canonical_url: "https://www.ombreeluci.it/project/numero-10-epilessia-una-montagna-di-pregiudizi/",
        archive_org_item_id: "OmbreELuci_010",
        archive_view_url: "https://archive.org/details/OmbreELuci_010",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1985/vi-ricordiamo-perche-ombre-e-luci/",
          "http://www.ombreeluci.it/1985/epilessia-una-malattia-che-imprime-un-marchio/",
          "http://www.ombreeluci.it/1985/epilessia-una-malattia-neurologica-ancora-sconosciuta/",
          "http://www.ombreeluci.it/1985/epilessia-indicazioni-di-primo-intervento/",
          "http://www.ombreeluci.it/1985/esperienze-epilessia-in-famiglia-e-a-scuola/",
          "http://www.ombreeluci.it/1985/vacanza-problema-e-risposte/",
          "http://www.ombreeluci.it/1985/comunita-e-cooperativa-il-girasole/",
          "http://www.ombreeluci.it/1985/dialogo-aperto-n-10/",
          "http://www.ombreeluci.it/1985/amo-la-vita-malgrado-tutto/",
          "http://www.ombreeluci.it/1985/uomo-e-donna-li-fece-per-una-vita-damore-autentico/",
          "http://www.ombreeluci.it/1985/per-liberarci-dai-tabu-dellepilessia-plus-de-gym-pour-danny/",
          "https://www.ombreeluci.it/1985/vi-ricordiamo-perche-ombre-e-luci/",
          "https://www.ombreeluci.it/1985/epilessia-una-malattia-che-imprime-un-marchio/",
          "https://www.ombreeluci.it/1985/epilessia-una-malattia-neurologica-ancora-sconosciuta/",
          "https://www.ombreeluci.it/1985/epilessia-indicazioni-di-primo-intervento/",
          "https://www.ombreeluci.it/1985/vacanza-problema-e-risposte/",
          "https://www.ombreeluci.it/1985/esperienze-epilessia-in-famiglia-e-a-scuola/",
          "https://www.ombreeluci.it/1985/comunita-e-cooperativa-il-girasole/",
          "https://www.ombreeluci.it/1985/vita-fede-e-luce-n-10-ricordo-di-don-dario/",
          "https://www.ombreeluci.it/1985/dialogo-aperto-n-10/",
          "https://www.ombreeluci.it/1985/uomo-e-donna-li-fece-per-una-vita-damore-autentico/",
          "https://www.ombreeluci.it/1985/amo-la-vita-malgrado-tutto/",
          "https://www.ombreeluci.it/1985/per-liberarci-dai-tabu-dellepilessia-plus-de-gym-pour-danny/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-11",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 11,
        display_title: "Numero 11 - Casa famiglia. Sogno o realt\xE0?",
        titolo_numero: "Casa famiglia. Sogno o realt\xE0?",
        seo_description: "Casa famiglia, sogno o realt\xE0? Per ogni genitore di un figlio con disabilit\xE0, il pensiero di quando non saranno pi\xF9 in grado di seguire i loro figli \xE8 causa di angoscia e trepidazione. Alcuni genitori condividono con noi le loro speranze per il futuro. E scopriamo alcune esperienze gi\xE0 avviate (Cascina Nibai, Villa Olmo, Villa Pizzone, La casa di Gino) per immaginare una strada possibile per alcuni. Ricordando che non tutto \xE8 buono per tutti.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 11 \u2013 Casa famiglia. Sogno o realt\xE0? Anno 3 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 1985",
        descrizione_ai: null,
        anno_pubblicazione: 1985,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_11_1985.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-11-casa-famiglia-sogno-realta/",
        canonical_url: "https://www.ombreeluci.it/project/numero-11-casa-famiglia-sogno-realta/",
        archive_org_item_id: "OmbreELuci_011",
        archive_view_url: "https://archive.org/details/OmbreELuci_011",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuci_011/Ombre-e-Luci-n.11.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1986/ombre-luci-n-11-1986-sfogliabile/",
          "https://www.ombreeluci.it/1985/casa-famiglia-sogno-realta/",
          "https://www.ombreeluci.it/1985/come-sogni-il-futuro-dei-tuoi-figli-alcuni-genitori-rispondono/",
          "https://www.ombreeluci.it/1985/cascina-nibai-cooperativa-fraternita/",
          "https://www.ombreeluci.it/1985/villa-olmo-abitando-insieme-sette-ragazze-suora/",
          "https://www.ombreeluci.it/1985/villa-pizzone-cancello-aperto/",
          "https://www.ombreeluci.it/1985/la-casa-gino-interessante-colonia-agricola/",
          "https://www.ombreeluci.it/1985/la-sfida-dellarca/",
          "https://www.ombreeluci.it/1985/vita-fede-e-luce-n-11-un-campeggio-rocca-papa-ora-comincia-bello/",
          "https://www.ombreeluci.it/1985/la-sfida-dellarca-recensione/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-12",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 12,
        display_title: "Numero 12 - Perch\xE8 mi guardi?",
        titolo_numero: "Perch\xE8 mi guardi?",
        seo_description: "Lo sguardo, \u201Cquella finestra sul mondo attraverso la quale ci formiamo un\u2019immagine interiore\u201D dice Marie H\xE9l\xE8ne Mathieu. Il nostro sguardo \xE8 una forza potente, l\u2019inizio semplice ed evidente di una comunione al di l\xE0 di ogni parola, di ogni gesto. Ancora: l\u2019istituto Medaglia Miracolosa di Arezzo, un esempio di scuola integrata in un istituto religioso.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 12 \u2013 Perch\xE9 mi guardi Anno 3, 1985 \u2013 Trimestrale: Ottobre, Novembre, Dicembre",
        descrizione_ai: null,
        anno_pubblicazione: 1985,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Ottobre, Novembre, Dicembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_12_1985.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-12-perche-mi-guardi/",
        canonical_url: "https://www.ombreeluci.it/project/numero-12-perche-mi-guardi/",
        archive_org_item_id: "OmbreELuci_012",
        archive_view_url: "https://archive.org/details/OmbreELuci_012",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuci_012/Ombre-e-Luci-n.12.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1985/ombre-luci-n-12-1985-sfogliabile/",
          "http://www.ombreeluci.it/1985/natale-a-lubiana/",
          "http://www.ombreeluci.it/1985/bocca-ride-ma-occhi-non-buoni/",
          "http://www.ombreeluci.it/1985/il-peso-degli-sguardi/",
          "http://www.ombreeluci.it/1985/quella-fredda-domenica-dinverno/",
          "http://www.ombreeluci.it/1985/integrazione-non-parola/",
          "http://www.ombreeluci.it/1985/le-condizioni-per-una-scuola-cosi/",
          "http://www.ombreeluci.it/1985/il-bambino-difficile/",
          "http://www.ombreeluci.it/1985/dialogo-aperto-n-12/",
          "http://www.ombreeluci.it/1985/vita-fede-luci-n-12/",
          "http://www.ombreeluci.it/1985/incontro-gesu/",
          "https://www.ombreeluci.it/1985/natale-a-lubiana/",
          "https://www.ombreeluci.it/1985/bocca-ride-ma-occhi-non-buoni/",
          "https://www.ombreeluci.it/1985/integrazione-non-parola/",
          "https://www.ombreeluci.it/1985/il-peso-degli-sguardi/",
          "https://www.ombreeluci.it/1985/quella-fredda-domenica-dinverno/",
          "https://www.ombreeluci.it/1985/il-bambino-difficile/",
          "https://www.ombreeluci.it/1985/incontro-gesu/",
          "https://www.ombreeluci.it/1985/112-suggerimenti-un-corretto-rapporto-gli-handicappati/",
          "https://www.ombreeluci.it/1985/vita-fede-luci-n-12/",
          "https://www.ombreeluci.it/1985/dialogo-aperto-n-12/",
          "https://www.ombreeluci.it/1985/le-condizioni-per-una-scuola-cosi/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-13",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 13,
        display_title: "Numero 13 \u2013 Murati nell'oscurit\xE0 e nel silenzio",
        titolo_numero: "Murati nell'oscurit\xE0 e nel silenzio",
        seo_description: "Avere un figlio che non vede, non sente, non cammina, non comunica\u2026 una delle prove pi\xF9 traumatizzanti per una famiglia. Proviamo a descrivere la persona sordo cieca, ascoltiamo i suoi genitori e scopriamo quale grandi passi pu\xF2 fare con una educazione appropriata.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 13 \u2013 Murati nell\u2019oscurit\xE0 e nel silenzio Anno 3, 1986 \u2013 Trimestrale: Gennaio, Febbraio, Marzo",
        descrizione_ai: null,
        anno_pubblicazione: 1986,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Gennaio, Febbraio, Marzo",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/12/oel11-001-cover.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-13-murati-nelloscurita-e-nel-silenzio/",
        canonical_url: "https://www.ombreeluci.it/project/numero-13-murati-nelloscurita-e-nel-silenzio/",
        archive_org_item_id: "OmbreELuci_010_201712",
        archive_view_url: "https://archive.org/details/OmbreELuci_010_201712",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuci_010_201712/Ombre-e-Luci-n.11.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1986/ombre-luci-n-11-1986-sfogliabile/",
          "http://www.ombreeluci.it/1986/non-vede-non-sente-non-cammina-non-comunica/",
          "http://www.ombreeluci.it/1986/dalla-disperazione-alla-speranza/",
          "http://www.ombreeluci.it/1986/scheda-le-persone-pluri-handicappate/",
          "http://www.ombreeluci.it/1986/ora-sappiamo-un-senso/",
          "http://www.ombreeluci.it/1986/un-salsicciotto-tanta-acqua-un-po-coraggio/",
          "http://www.ombreeluci.it/1986/mio-dio-duro-vivere-nella-prova/",
          "http://www.ombreeluci.it/1986/verdetto-dei-medici/",
          "http://www.ombreeluci.it/1986/vede-sente-parla-le-mani/",
          "http://www.ombreeluci.it/1986/dialogo-aperto-n-11/",
          "http://www.ombreeluci.it/1986/emiliana-e-l-handicap/",
          "http://www.ombreeluci.it/1986/bambino-non-vedente-pluri-minorato/",
          "http://www.ombreeluci.it/1986/il-mio-bambino/",
          "http://www.ombreeluci.it/1986/disabilita-intervento-apprendimento-controllo-degli-sfinteri/",
          "https://www.ombreeluci.it/1986/non-vede-non-sente-non-cammina-non-comunica/",
          "https://www.ombreeluci.it/1986/dalla-disperazione-alla-speranza/",
          "https://www.ombreeluci.it/1986/scheda-le-persone-pluri-handicappate/",
          "https://www.ombreeluci.it/1986/ora-sappiamo-un-senso/",
          "https://www.ombreeluci.it/1986/un-salsicciotto-tanta-acqua-un-po-coraggio/",
          "https://www.ombreeluci.it/1986/mio-dio-duro-vivere-nella-prova/",
          "https://www.ombreeluci.it/1986/verdetto-dei-medici/",
          "https://www.ombreeluci.it/1986/vede-sente-parla-le-mani/",
          "https://www.ombreeluci.it/1986/dialogo-aperto-n-13/",
          "https://www.ombreeluci.it/1986/emiliana-e-l-handicap/",
          "https://www.ombreeluci.it/1986/disabilita-intervento-apprendimento-controllo-degli-sfinteri/",
          "https://www.ombreeluci.it/1986/il-mio-bambino/",
          "https://www.ombreeluci.it/1986/bambino-non-vedente-pluri-minorato/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-14",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 14,
        display_title: "Numero 14 - Speciale Assisi 1986: Lasciarsi scegliere",
        titolo_numero: "Speciale Assisi 1986: Lasciarsi scegliere",
        seo_description: "Numero 14 \u2013 Speciale Assisi 1986: Lasciarsi scegliere",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 14 \u2013 Speciale Assisi 1986: Lasciarsi scegliere Anno 3 \u2013 Numero 2 \u2013 Aprile \u2013 Maggio \u2013 Giugno 1986",
        descrizione_ai: null,
        anno_pubblicazione: 1986,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_14_1986.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-14-speciale-assisi-1986-lasciarsi-scegliere/",
        canonical_url: "https://www.ombreeluci.it/project/numero-14-speciale-assisi-1986-lasciarsi-scegliere/",
        archive_org_item_id: "OmbreELuci_014",
        archive_view_url: "https://archive.org/details/OmbreELuci_014",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuci_014/Ombre-e-Luci-n.14.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1986/ombre-luci-n-14-1986-sfogliabile/",
          "http://www.ombreeluci.it/1986/perche-uno-speciale/",
          "http://www.ombreeluci.it/1986/tenere-piu-stretta-la-mano-dei-piccoli/",
          "http://www.ombreeluci.it/1986/quei-tre-giorni-aprile/",
          "http://www.ombreeluci.it/1986/card-martini-alla-comunita-fede-luce/",
          "http://www.ombreeluci.it/1986/perche-si-manifestassero-le-opere-dio/",
          "http://www.ombreeluci.it/1986/i-genitori-commentano-le-parole-del-cardinal-martini/",
          "http://www.ombreeluci.it/1986/siamo-venuti-ad-assisi-per/",
          "http://www.ombreeluci.it/1986/visto-visto-tante-cose/",
          "http://www.ombreeluci.it/1986/assisi-1986-le-fotografie/",
          "http://www.ombreeluci.it/1986/alzati-ritrova-la-speranza/",
          "http://www.ombreeluci.it/1986/grazie-san-francesco-venuto-camminare-con-noi",
          "http://www.ombreeluci.it/1986/signore-fa-di-me-uno-strumento-della-tua-pace/",
          "http://www.ombreeluci.it/1986/e-una-offerta-unica/",
          "http://www.ombreeluci.it/1986/una-grande-profezia/",
          "http://www.ombreeluci.it/1986/punti-incontro-servire-giocare-lavorare-riflettere/",
          "http://www.ombreeluci.it/1986/scendere-le-scale/",
          "http://www.ombreeluci.it/1986/dopo-assisi/",
          "https://www.ombreeluci.it/1986/card-martini-alla-comunita-fede-luce/",
          "https://www.ombreeluci.it/1986/quei-tre-giorni-aprile/",
          "https://www.ombreeluci.it/1986/tenere-piu-stretta-la-mano-dei-piccoli/",
          "https://www.ombreeluci.it/1986/perche-si-manifestassero-le-opere-dio/",
          "https://www.ombreeluci.it/1986/siamo-venuti-ad-assisi-per/",
          "https://www.ombreeluci.it/1986/i-genitori-commentano-le-parole-del-cardinal-martini/",
          "https://www.ombreeluci.it/1986/dopo-assisi/",
          "https://www.ombreeluci.it/1986/assisi-1986-le-fotografie/",
          "https://www.ombreeluci.it/1986/visto-visto-tante-cose/",
          "https://www.ombreeluci.it/1986/punti-incontro-servire-giocare-lavorare-riflettere/",
          "https://www.ombreeluci.it/1986/e-una-offerta-unica/",
          "https://www.ombreeluci.it/1986/grazie-san-francesco-venuto-camminare-con-noi/",
          "https://www.ombreeluci.it/1986/scendere-le-scale/",
          "https://www.ombreeluci.it/1986/una-grande-profezia/",
          "https://www.ombreeluci.it/1986/signore-fa-di-me-uno-strumento-della-tua-pace/",
          "https://www.ombreeluci.it/1986/alzati-ritrova-la-speranza/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-15",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 15,
        display_title: "Numero 15 \u2013 Prima Comunione",
        titolo_numero: "Prima Comunione",
        seo_description: "Cosa si fa per l'iniziazione cristiana delle persone con gravi disabilit\xE0? Un importante contributo di Henri Bissonier, il precursore della catechesi per le persone con disabilit\xE0. Inoltre, la preoccupazione per il futuro dei figli con una disabilit\xE0: la casa Sacra Famiglia in Veneto si racconta. Vacanze estive in citt\xE0: storia di un Grest ante litteram.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 15 \u2013 Prima Comunione Anno 3 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 1986",
        descrizione_ai: null,
        anno_pubblicazione: 1986,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_15_1986.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-15-comunione/",
        canonical_url: "https://www.ombreeluci.it/project/numero-15-comunione/",
        archive_org_item_id: "OmbreELuciN.1",
        archive_view_url: "https://archive.org/details/OmbreELuciN.1",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1986/non-si-muovono/",
          "http://www.ombreeluci.it/1986/la-fortuna-di-avere-daniela-lettera-di-una-mamma/",
          "http://www.ombreeluci.it/1986/un-risveglio-religioso-dei-piu-handicappati/",
          "http://www.ombreeluci.it/1986/casa-sacra-famiglia/",
          "http://www.ombreeluci.it/1986/mary-mount-settimane-al-sole/",
          "http://www.ombreeluci.it/1986/dialogo-aperto-n-15/",
          "http://www.ombreeluci.it/1986/vita-fede-luce-n-15/",
          "https://www.ombreeluci.it/1986/non-si-muovono/",
          "https://www.ombreeluci.it/1986/la-fortuna-di-avere-daniela-lettera-di-una-mamma/",
          "https://www.ombreeluci.it/1986/casa-sacra-famiglia/",
          "https://www.ombreeluci.it/1986/un-risveglio-religioso-dei-piu-handicappati/",
          "https://www.ombreeluci.it/1986/mary-mount-settimane-al-sole/",
          "https://www.ombreeluci.it/1986/vita-fede-luce-n-15/",
          "https://www.ombreeluci.it/1986/dialogo-aperto-n-15/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-16",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 16,
        display_title: "Numero 16 - Teniamo aperta la porta",
        titolo_numero: "Teniamo aperta la porta",
        seo_description: "\u201CIl farsi prossimo esige che",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 16 \u2013 Teniamo aperta la porta Anno 4 \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 1986",
        descrizione_ai: null,
        anno_pubblicazione: 1986,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_16_1986.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-16-teniamo-aperta-la-porta/",
        canonical_url: "https://www.ombreeluci.it/project/numero-16-teniamo-aperta-la-porta/",
        archive_org_item_id: "OmbreELuci_016",
        archive_view_url: "https://archive.org/details/OmbreELuci_016/page/n1/mode/2up?view=theater",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1986/prepariamolo-vivere-con-gli-altri/",
          "http://www.ombreeluci.it/1986/tutto-quello-che-ha-fatto-per-noi/",
          "http://www.ombreeluci.it/1986/ora-che-sono-sola-non-sono-piu-sola/",
          "http://www.ombreeluci.it/1986/festa-in-casa-con-lui/",
          "http://www.ombreeluci.it/1986/perche-ho-dato-una-mano/",
          "http://www.ombreeluci.it/1986/convento-una-seconda-famiglia-per-giampiero/",
          "http://www.ombreeluci.it/1986/vederli-migliorare/",
          "http://www.ombreeluci.it/1986/dialogo-aperto-n-16/",
          "http://www.ombreeluci.it/1986/vita-fede-luce-n-16-corso-formazione-ilkley/",
          "http://www.ombreeluci.it/1986/quando-arrivano-fatti-coraggio/",
          "http://www.ombreeluci.it/1986/come-i-cerchi-nellacqua/",
          "http://www.ombreeluci.it/1986/vivere-lultimo-istante/",
          "https://www.ombreeluci.it/1986/tenere-la-porta-aperta/",
          "https://www.ombreeluci.it/1986/perche-ho-dato-una-mano/",
          "https://www.ombreeluci.it/1986/festa-in-casa-con-lui/",
          "https://www.ombreeluci.it/1986/tutto-quello-che-ha-fatto-per-noi/",
          "https://www.ombreeluci.it/1986/prepariamolo-vivere-con-gli-altri/",
          "https://www.ombreeluci.it/1986/lo-zio-jurgens/",
          "https://www.ombreeluci.it/1986/ora-che-sono-sola-non-sono-piu-sola/",
          "https://www.ombreeluci.it/1986/vederli-migliorare/",
          "https://www.ombreeluci.it/1986/convento-una-seconda-famiglia-per-giampiero/",
          "https://www.ombreeluci.it/1986/vivere-lultimo-istante/",
          "https://www.ombreeluci.it/1986/quando-arrivano-fatti-coraggio/",
          "https://www.ombreeluci.it/1986/come-i-cerchi-nellacqua/",
          "https://www.ombreeluci.it/1986/vita-fede-luce-n-16-corso-formazione-ilkley/",
          "https://www.ombreeluci.it/1986/dialogo-aperto-n-16/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-17",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 17,
        display_title: "Numero 17 \u2013 Quando sono adulti",
        titolo_numero: "Quando sono adulti",
        seo_description: "Tanto si \xE8 fatto - e si fa - in tema di prevenzione, diagnosi precoce, riabilitazione, inserimento scolastico per quanto riguarda i bambini con disabilit\xE0\u2026 ma quando non hanno pi\xF9 sedici anni? Quali prospettive ci sono per la vita adulta delle persone con una disabilit\xE0 mentale, per la possibilit\xE0 di una vita affettiva e lavorativa rispettosa della dignit\xE0 di ciascuno?",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 17 \u2013 Quando sono adulti Anno 5 \u2013 Numero 17 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 1987",
        descrizione_ai: null,
        anno_pubblicazione: 1987,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_17_1987.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-17-quando-sono-adulti/",
        canonical_url: "https://www.ombreeluci.it/project/numero-17-quando-sono-adulti/",
        archive_org_item_id: "OmbreELuci_017",
        archive_view_url: "https://archive.org/details/OmbreELuci_017/mode/2up?view=theater",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1987/cose-un-handicap-non-lo-so/",
          "http://www.ombreeluci.it/1987/non-ha-piu-sedici-anni/",
          "http://www.ombreeluci.it/1987/maschio-e-femmina-li-creo/",
          "http://www.ombreeluci.it/1987/teresa-una-storia-di-lavoro-integrato/",
          "http://www.ombreeluci.it/1987/questa-casa-famiglia-e-una-risposta/",
          "http://www.ombreeluci.it/1987/crescere-con-il-lavoro/",
          "http://www.ombreeluci.it/1987/dialogo-aperto-n-17/",
          "https://www.ombreeluci.it/1987/dialogo-aperto-n-17/",
          "https://www.ombreeluci.it/1987/cose-un-handicap-non-lo-so/",
          "https://www.ombreeluci.it/1987/non-ha-piu-sedici-anni/",
          "https://www.ombreeluci.it/1987/maschio-e-femmina-li-creo/",
          "https://www.ombreeluci.it/1987/teresa-una-storia-di-lavoro-integrato/",
          "https://www.ombreeluci.it/1987/questa-casa-famiglia-e-una-risposta/",
          "https://www.ombreeluci.it/1987/crescere-con-il-lavoro/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-18",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 18,
        display_title: "Numero 18 \u2013 Il comportamento, un messaggio",
        titolo_numero: "Il comportamento, un messaggio",
        seo_description: "Quando il comportamento esprime un disagio impossibile ad esprimersi con le parole; e quando il comportamento non verbale rende chiaro e vero quello verbale: lo scopriamo nelle testimonianze di una mamma e di un'insegnante. Inoltre, piccoli utili consigli di una pedagogista per far progredire i figli che hanno maggiori difficolt\xE0. Infine, storia e motivi di un\u2019accoglienza per chi ha fame di normalit\xE0.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 18 \u2013 Il comportamento, un messaggio Anno 5 \u2013 Numero 18 \u2013 Aprile \u2013 Maggio \u2013 Giugno \u2013 1987",
        descrizione_ai: null,
        anno_pubblicazione: 1987,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_18_1987.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-18-il-comportamento-un-messaggio/",
        canonical_url: "https://www.ombreeluci.it/project/numero-18-il-comportamento-un-messaggio/",
        archive_org_item_id: "OmbreELuci_018",
        archive_view_url: "https://archive.org/details/OmbreELuci_018/mode/2up?view=theater",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1987/non-so-come-ne-a-chi-dirlo/",
          "http://www.ombreeluci.it/1987/parla-senza-parole/",
          "http://www.ombreeluci.it/1987/vedendo-pensava-dentro/",
          "http://www.ombreeluci.it/1987/dal-diario-di-un-insegnante/",
          "http://www.ombreeluci.it/1987/posso-insegnargli-qualcosa/",
          "http://www.ombreeluci.it/1987/fame-di-normalita/",
          "http://www.ombreeluci.it/1987/dialogo-aperto-n-18/",
          "http://www.ombreeluci.it/1987/vita-fede-luce-n-18/",
          "http://www.ombreeluci.it/1987/bambino-giocava-la-luna/",
          "http://www.ombreeluci.it/1987/handicap-e-scautismo/",
          "http://www.ombreeluci.it/1987/rivista-hd-problemi-comportamentali-le-strategie-dintervento/",
          "http://www.ombreeluci.it/1987/un-prete-balordi/",
          "http://www.ombreeluci.it/1987/bibliografia-italiana-sui-disturbi-delludito-del-linguaggio/",
          "https://www.ombreeluci.it/1987/non-so-come-ne-a-chi-dirlo/",
          "https://www.ombreeluci.it/1987/parla-senza-parole/",
          "https://www.ombreeluci.it/1987/dal-diario-di-un-insegnante/",
          "https://www.ombreeluci.it/1987/vedendo-pensava-dentro/",
          "https://www.ombreeluci.it/1987/fame-di-normalita/",
          "https://www.ombreeluci.it/1987/posso-insegnargli-qualcosa/",
          "https://www.ombreeluci.it/1987/vita-fede-luce-n-18/",
          "https://www.ombreeluci.it/1987/un-prete-balordi/",
          "https://www.ombreeluci.it/1987/handicap-e-scautismo/",
          "https://www.ombreeluci.it/1987/rivista-hd-problemi-comportamentali-le-strategie-dintervento/",
          "https://www.ombreeluci.it/1987/bambino-giocava-la-luna/",
          "https://www.ombreeluci.it/1987/bibliografia-italiana-sui-disturbi-delludito-del-linguaggio/",
          "https://www.ombreeluci.it/1987/dialogo-aperto-n-18/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-19",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 19,
        display_title: "Numero 19 \u2013 Non vedo le meraviglie di Dio, ma le canto",
        titolo_numero: "Non vedo le meraviglie di Dio, ma le canto",
        seo_description: "Le persone con disabilit\xE0: segno di contraddizione e fonte di unit\xE0. Padre Mihelcic: \u201CNiente",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 19 \u2013 Non vedo le meraviglie di Dio, ma le canto Anno 5 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 1987",
        descrizione_ai: null,
        anno_pubblicazione: 1987,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_19_1987.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-19-non-vedo-le-meraviglie-dio-le-canto/",
        canonical_url: "https://www.ombreeluci.it/project/numero-19-non-vedo-le-meraviglie-dio-le-canto/",
        archive_org_item_id: "OmbreELuci_019",
        archive_view_url: "https://archive.org/details/OmbreELuci_019/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuci_019/Ombre-e-Luci-n.19.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1987/una-lettera-per-te/",
          "http://www.ombreeluci.it/1987/pietre-paragone/",
          "http://www.ombreeluci.it/1987/non-vedo-le-meraviglie-dio-le-canto/",
          "http://www.ombreeluci.it/1987/suonare-chitarra-ragazzi-down/",
          "http://www.ombreeluci.it/1987/forza-venite-gente/",
          "http://www.ombreeluci.it/1987/dialogo-aperto-n-19/",
          "http://www.ombreeluci.it/1987/vita-fede-luce-19/",
          "http://www.ombreeluci.it/1987/pedagogia-della-fede/",
          "http://www.ombreeluci.it/1987/animare-un-gruppo/",
          "http://www.ombreeluci.it/1987/tutte-le-sabine-del-mondo/",
          "http://www.ombreeluci.it/1987/danzero-per-te/",
          "http://www.ombreeluci.it/1987/un-figlio-cinque-giorni/",
          "https://www.ombreeluci.it/1987/una-lettera-per-te/",
          "https://www.ombreeluci.it/1987/la-persona-con-disabilita-come-fonte-di-unita-nella-chiesa/",
          "https://www.ombreeluci.it/1987/non-vedo-le-meraviglie-dio-le-canto/",
          "https://www.ombreeluci.it/1987/suonare-chitarra-ragazzi-down/",
          "https://www.ombreeluci.it/1987/forza-venite-gente/",
          "https://www.ombreeluci.it/1987/un-figlio-cinque-giorni/",
          "https://www.ombreeluci.it/1987/danzero-per-te/",
          "https://www.ombreeluci.it/1987/tutte-le-sabine-del-mondo/",
          "https://www.ombreeluci.it/1987/animare-un-gruppo/",
          "https://www.ombreeluci.it/1987/vita-fede-luce-19/",
          "https://www.ombreeluci.it/1987/pedagogia-della-fede/",
          "https://www.ombreeluci.it/1987/dialogo-aperto-n-19/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-20",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 20,
        display_title: "E il padre? - Ombre e Luci n.20, 1987",
        titolo_numero: "E il padre? - Ombre e Luci n.20, 1987",
        seo_description: "Si parla sempre della madre. Tutti capiscono, comprendono la mamma di un figlio handicappato. Pochi parlano del padre e pochi se ne preoccupano. Questo numero \xE8 dedicato ai pap\xE0.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 20 \u2013 E il padre? Anno 5 \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 1987",
        descrizione_ai: null,
        anno_pubblicazione: 1987,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_20_1987.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-20-e-il-padre/",
        canonical_url: "https://www.ombreeluci.it/project/numero-20-e-il-padre/",
        archive_org_item_id: "OmbreELuci_020",
        archive_view_url: "https://archive.org/details/OmbreELuci_020",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1987/basta-poco-non-farci-sentire-soli/",
          "http://www.ombreeluci.it/1987/sono-il-papa-di-francesca/",
          "http://www.ombreeluci.it/1987/il-padre-assente/",
          "http://www.ombreeluci.it/1987/con-suo-padre/",
          "http://www.ombreeluci.it/1987/umili-gesti-tutta-vita/",
          "http://www.ombreeluci.it/1987/quanti-sanno/",
          "http://www.ombreeluci.it/1987/atteso-braccia-aperte/",
          "http://www.ombreeluci.it/1987/chicco-casa-famiglia-dellarche/",
          "http://www.ombreeluci.it/1987/dialogo-aperto-n-20/",
          "http://www.ombreeluci.it/1987/vita-fede-luce-n-20/",
          "http://www.ombreeluci.it/1987/handicap-comunita-cristiana-un-esperienza-spunti-pastorale-gli-handicappati-psichici-gravi/",
          "http://www.ombreeluci.it/1987/nome-tutti-miei/",
          "https://www.ombreeluci.it/1987/basta-poco-non-farci-sentire-soli/",
          "https://www.ombreeluci.it/1987/quanti-sanno/",
          "https://www.ombreeluci.it/1987/il-padre-assente/",
          "https://www.ombreeluci.it/1987/sono-il-papa-di-francesca/",
          "https://www.ombreeluci.it/1987/atteso-braccia-aperte/",
          "https://www.ombreeluci.it/1987/umili-gesti-tutta-vita/",
          "https://www.ombreeluci.it/1987/con-suo-padre/",
          "https://www.ombreeluci.it/1987/che-cosa-e-larche/",
          "https://www.ombreeluci.it/1987/chicco-casa-famiglia-dellarche/",
          "https://www.ombreeluci.it/1987/vita-fede-luce-n-20/",
          "https://www.ombreeluci.it/1987/nome-tutti-miei/",
          "https://www.ombreeluci.it/1987/handicap-comunita-cristiana-un-esperienza-spunti-pastorale-gli-handicappati-psichici-gravi/",
          "https://www.ombreeluci.it/1987/dialogo-aperto-n-20/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-21",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 21,
        display_title: "Numero 21 \u2013 Rompere la solitudine del malato mentale",
        titolo_numero: "Rompere la solitudine del malato mentale",
        seo_description: "Incontrare un malato mentale \xE8 spesso difficile per diverse ragioni, sono tante le domande che pone questa condizione. Ma \xE8 importante che la persona e la sua famiglia non restino ai margini.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 21 \u2013 Rompere la solitudine del malato mentale Anno VI \u2013 Numero 21 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo \u2013 1988",
        descrizione_ai: null,
        anno_pubblicazione: 1988,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_21_1988.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-21-rompere-la-solitudine-del-malato-mentale/",
        canonical_url: "https://www.ombreeluci.it/project/numero-21-rompere-la-solitudine-del-malato-mentale/",
        archive_org_item_id: "OmbreELuci_021",
        archive_view_url: "https://archive.org/details/OmbreELuci_021",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1988/la-malattia-mentale/",
          "https://www.ombreeluci.it/1988/la-mamma-anche-unaltra-persona/",
          "https://www.ombreeluci.it/1988/comunita-terapeutica-primavalle/",
          "http://www.ombreeluci.it/1988/cosa-detto-papa-sullepilessia/",
          "http://www.ombreeluci.it/1988/saverio-nostro-fratello/",
          "http://www.ombreeluci.it/1988/la-malattia-mentale/",
          "http://www.ombreeluci.it/1988/boccati-nel-sogno/",
          "http://www.ombreeluci.it/1988/addomesticare-la-malattia-mentale/",
          "http://www.ombreeluci.it/1988/la-mamma-anche-unaltra-persona/",
          "http://www.ombreeluci.it/1988/dove-come-vivono-persone-colpite-malattia-mentale/",
          "http://www.ombreeluci.it/1988/villa-san-giovanni-di-dio/",
          "http://www.ombreeluci.it/1988/comunita-terapeutica-primavalle/",
          "http://www.ombreeluci.it/1988/risultato-dellinchiesta-aiutaci-migliorare-ombre-luci/",
          "http://www.ombreeluci.it/1988/dialogo-aperto-n-21/",
          "https://www.ombreeluci.it/1988/cosa-detto-papa-sullepilessia/",
          "https://www.ombreeluci.it/1988/saverio-nostro-fratello/",
          "https://www.ombreeluci.it/1988/bloccati-nel-sogno/",
          "https://www.ombreeluci.it/1988/addomesticare-la-malattia-mentale/",
          "https://www.ombreeluci.it/1988/dove-come-vivono-persone-colpite-malattia-mentale/",
          "https://www.ombreeluci.it/1988/villa-san-giovanni-di-dio/",
          "https://www.ombreeluci.it/1988/dialogo-aperto-n-21/",
          "https://www.ombreeluci.it/1988/risultato-dellinchiesta-aiutaci-migliorare-ombre-luci/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-22",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 22,
        display_title: "Numero 22 - Diritto alla festa",
        titolo_numero: "Diritto alla festa",
        seo_description: "Stare insieme \xE8 bello soprattutto per far festa. Non c\u2019\xE8 disabilit\xE0 che tenga! Ma nulla deve essere lasciato al caso... E diviene costruttivo quando si riflette, insieme, in un cerchio; quando si trova il modo di esprimere le emozioni anche con il proprio corpo, come ad esempio con il teatro o con la danza terapia; quando si ha l\u2019opportunit\xE0 di provare a lavorare cos\xEC come avviene per ogni adulto. Ogni occasione pu\xF2 cos\xEC divenire opportunit\xE0 di crescita.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 22 \u2013 Diritto alla festa Anno VI \u2013 Numero 22 \u2013 Aprile \u2013 Maggio \u2013 Giugno \u2013 1988",
        descrizione_ai: null,
        anno_pubblicazione: 1988,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_22_1988.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-22-diritto-alla-festa/",
        canonical_url: "https://www.ombreeluci.it/project/numero-22-diritto-alla-festa/",
        archive_org_item_id: "OmbreELuci_022",
        archive_view_url: "https://archive.org/details/OmbreELuci_022",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuci_022/Ombre-e-Luci-n.22.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1988/diritto-alla-festa/",
          "https://www.ombreeluci.it/1988/come-fare-festa/",
          "https://www.ombreeluci.it/1988/un-cerchio-simbolo-incontro-unita/",
          "https://www.ombreeluci.it/1988/poco-tanto-tutti-stanno-meglio-la-danza/",
          "https://www.ombreeluci.it/1988/lavorando-insieme-un-pomeriggio-chiamato-laboratorio/",
          "https://www.ombreeluci.it/1988/scuola-ricamo-imparare-divertendoci/",
          "http://www.ombreeluci.it/1988/diritto-alla-festa/",
          "http://www.ombreeluci.it/1988/un-cerchio-simbolo-incontro-unita/",
          "http://www.ombreeluci.it/1988/fare-teatro-persone-disabili/",
          "http://www.ombreeluci.it/1988/poco-tanto-tutti-stanno-meglio-la-danza/",
          "http://www.ombreeluci.it/1988/come-fare-festa/",
          "http://www.ombreeluci.it/1988/lavorando-insieme-un-pomeriggio-chiamato-laboratorio/",
          "http://www.ombreeluci.it/1988/scuola-ricamo-imparare-divertendoci/",
          "http://www.ombreeluci.it/1988/dialogo-aperto-n-22/",
          "http://www.ombreeluci.it/1988/libri-lavoretti-manuali/",
          "http://www.ombreeluci.it/1988/libri-per-giocare/",
          "http://www.ombreeluci.it/1988/madre-e-handicap/",
          "http://www.ombreeluci.it/1988/non-piu-sedici-anni-realta-bisogni-dellhandicappato-diventa-adulto/",
          "http://www.ombreeluci.it/1988/barriere-di-carta/",
          "https://www.ombreeluci.it/1988/fare-teatro-persone-disabili/",
          "https://www.ombreeluci.it/1988/libri-lavoretti-manuali/",
          "https://www.ombreeluci.it/1988/libri-per-giocare/",
          "https://www.ombreeluci.it/1988/non-piu-sedici-anni-realta-bisogni-dellhandicappato-diventa-adulto/",
          "https://www.ombreeluci.it/1988/dialogo-aperto-n-22/",
          "https://www.ombreeluci.it/1988/barriere-di-carta/",
          "https://www.ombreeluci.it/1988/madre-e-handicap/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-23",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 23,
        display_title: "Numero 23 \u2013 Pretendono un posto nella casa di Dio",
        titolo_numero: "Pretendono un posto nella casa di Dio",
        seo_description: 'Due sacerdoti, una mamma, una suora francescana. Sono loro le voci che chiedono un posto nella Chiesa per ciascun figlio di Dio, anche con disabilit\xE0, e che operano con fede per "non tradire le attese di Dio e le speranze di chi varca la soglia" della Chiesa: la Buona Novella \xE8 per tutti!',
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 23 \u2013 Pretendono un posto nella casa di Dio Anno VI \u2013 Numero 3 \u2013 Luglio Agosto Settembre 1988",
        descrizione_ai: null,
        anno_pubblicazione: 1988,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Settembre 1988",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_23_1988.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-23-pretendono-un-posto-nella-casa-dio/",
        canonical_url: "https://www.ombreeluci.it/project/numero-23-pretendono-un-posto-nella-casa-dio/",
        archive_org_item_id: "OmbreELuciN.23",
        archive_view_url: "https://archive.org/details/OmbreELuciN.23",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1988/posto-mia-figlia-nella-chiesa/",
          "http://www.ombreeluci.it/1988/cosa-puo-la-comunita-parrocchiale-le-persone-disabilita/",
          "http://www.ombreeluci.it/1988/aspetto-ci-accorgessimo/",
          "http://www.ombreeluci.it/1988/leducazione-religiosa-alla-fede-dei-nostri-figli-handicap-mentale/",
          "http://www.ombreeluci.it/1988/come-fare-leducazione-religiosa/",
          "http://www.ombreeluci.it/1988/farci-servizi-perche-alla-cresima-la-cugina-accattava-giovanni/",
          "http://www.ombreeluci.it/1988/a-braccia-aperte/",
          "http://www.ombreeluci.it/1988/diaologo-aperto-n-23/",
          "http://www.ombreeluci.it/1988/vita-fede-luce-n-23/",
          "http://www.ombreeluci.it/1988/leducazione-religiosa-degli-handicappati-mentali/",
          "https://www.ombreeluci.it/1988/aspetto-ci-accorgessimo-2/",
          "https://www.ombreeluci.it/1988/posto-mia-figlia-nella-chiesa/",
          "https://www.ombreeluci.it/1988/farci-servizi-perche-alla-cresima-la-cugina-accattava-giovanni/",
          "https://www.ombreeluci.it/1988/aspetto-ci-accorgessimo/",
          "https://www.ombreeluci.it/1988/come-fare-leducazione-religiosa/",
          "https://www.ombreeluci.it/1988/leducazione-religiosa-degli-handicappati-mentali/",
          "https://www.ombreeluci.it/1988/a-braccia-aperte/",
          "https://www.ombreeluci.it/1988/vita-fede-luce-n-23/",
          "https://www.ombreeluci.it/1988/cosa-puo-la-comunita-parrocchiale-le-persone-disabilita/",
          "https://www.ombreeluci.it/1988/leducazione-religiosa-alla-fede-dei-nostri-figli-handicap-mentale/",
          "https://www.ombreeluci.it/1988/diaologo-aperto-n-23/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-24",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 24,
        display_title: "Numero 24 \u2013 Fin dai primi passi",
        titolo_numero: "Fin dai primi passi",
        seo_description: "Se non mancano le ombre della fatica e della rabbia di fronte alla disabilit\xE0 di un figlio, come leggiamo nelle lettere del Dialogo Aperto, cerchiamo di non far mancare luci di speranza: dei genitori che ci sono passati, dell\u2019esperienza amorevole di un\u2019insegnante che indica quanto sia necessaria, oltre l\u2019apprendimento, una serena vita di gruppo; di un\u2019associazione -La Casa del Sole- che",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 24 \u2013 Fin dai primi passi Anno 4 \u2013 Numero 6 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 1988",
        descrizione_ai: null,
        anno_pubblicazione: 1988,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_24_1988.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-24-fin-dai-primi-passi/",
        canonical_url: "https://www.ombreeluci.it/project/numero-24-fin-dai-primi-passi/",
        archive_org_item_id: "OmbreELuciN.24_678",
        archive_view_url: "https://archive.org/details/OmbreELuciN.24_678",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1988/dialogo-aperto-n-24/",
          "https://www.ombreeluci.it/1988/paolo-e-chiara/",
          "https://www.ombreeluci.it/1988/dalla-scuola-amore/",
          "https://www.ombreeluci.it/1988/casa-del-sole-casa-della-serenita/",
          "https://www.ombreeluci.it/1988/comportarvi-incontrate-persona-portatrice-handicap/",
          "http://www.ombreeluci.it/1988/non-solo-leggere/",
          "http://www.ombreeluci.it/1988/paolo-e-chiara/",
          "http://www.ombreeluci.it/1988/dalla-scuola-amore/",
          "http://www.ombreeluci.it/1988/buone-abitudini-sara-piu-accettato/",
          "http://www.ombreeluci.it/1988/casa-del-sole-casa-della-serenita/",
          "http://www.ombreeluci.it/1988/comportarvi-incontrate-persona-portatrice-handicap/",
          "http://www.ombreeluci.it/1988/dialogo-aperto-n-24/",
          "http://www.ombreeluci.it/1988/un-cammino-insieme/",
          "http://www.ombreeluci.it/1988/perche-cambiata-la-mia-vita/",
          "https://www.ombreeluci.it/1988/non-solo-leggere/",
          "https://www.ombreeluci.it/1988/buone-abitudini-sara-piu-accettato/",
          "https://www.ombreeluci.it/1988/un-cammino-insieme/",
          "https://www.ombreeluci.it/1988/perche-cambiata-la-mia-vita/",
          "https://www.ombreeluci.it/1980/di-nuovo-in-cammino/",
          "https://www.ombreeluci.it/1980/ci-hanno-scritto-insieme-n-24/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-25",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 25,
        display_title: "Numero 25 \u2013 La bellezza di campo insieme",
        titolo_numero: "La bellezza di campo insieme",
        seo_description: "L\u2019esperienza di una vacanza in piena libert\xE0, per chi ha una disabilit\xE0 soprattutto mentale, non \xE8 affatto scontata. A Fede e Luce, una delle prime attivit\xE0 ad essere organizzate per dar respiro alle famiglie e per coinvolgere ragazzi o adulti con disabilit\xE0 mentale sono stati i campi estivi. Fin dal 1978, un periodo insieme, una settimana diversa, per uno stacco indispensabile dal quotidiano, ritrovando le energie per affrontarlo e conoscere un po\u2019 di pi\xF9 se stessi. Nel numero leggerete, tra gli altri e insieme a storiche istantanee, la testimonianza di Rita Ozzimo, mamma di Pablo che, proprio al suo primo campo -quando aveva 8 anni \u2013 ha cominciato a far sentire la sua voce; quella di Nanni -fratello di Chicca, una bambina con una grave disabilit\xE0 \u2013 che a quei campi sentiva di essere in vacanza ma come \u201Ca casa\u201D e dove, con amici al fianco, lo sguardo degli altri si faceva pi\xF9 leggero",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 25 \u2013 La bellezza di campo insieme Anno 7 \u2013 Numero 25 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 1989",
        descrizione_ai: null,
        anno_pubblicazione: 1989,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_25_1989.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-25-la-bellezza-del-campo-fede-e-luce/",
        canonical_url: "https://www.ombreeluci.it/project/numero-25-la-bellezza-del-campo-fede-e-luce/",
        archive_org_item_id: "OmbreELuci_025",
        archive_view_url: "https://archive.org/details/OmbreELuci_025/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuci_025/Ombre-e-Luci-n.25.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1989/allora-si-parte/",
          "http://www.ombreeluci.it/1989/guardavano-guardavano/",
          "http://www.ombreeluci.it/1989/voglio-mostrarvi-strada/",
          "http://www.ombreeluci.it/1989/e-pagano-pure/",
          "http://www.ombreeluci.it/1989/tante-bellissime-cose/",
          "http://www.ombreeluci.it/1989/al-tepore-un-amore-semplice/",
          "http://www.ombreeluci.it/1989/si-organizza-un-campeggio-fede-luce/",
          "http://www.ombreeluci.it/1989/dialogo-aperto/",
          "http://www.ombreeluci.it/1989/vita-fede-luce-n-25/",
          "http://www.ombreeluci.it/1989/persone-handicap-nella-parrocchia-le-risposte-dei-parroci/",
          "http://www.ombreeluci.it/1989/attivita-creative/",
          "http://www.ombreeluci.it/1989/aiutami-a-giocare/",
          "http://www.ombreeluci.it/1989/la-sindrome-down-un-aiuto-gli-educatori-genitori/",
          "https://www.ombreeluci.it/1989/e-pagano-pure/",
          "https://www.ombreeluci.it/1989/al-tepore-un-amore-semplice/",
          "https://www.ombreeluci.it/1989/allora-si-parte/",
          "https://www.ombreeluci.it/1989/tante-bellissime-cose/",
          "https://www.ombreeluci.it/1989/voglio-mostrarvi-strada/",
          "https://www.ombreeluci.it/1989/si-organizza-un-campeggio-fede-luce/",
          "https://www.ombreeluci.it/1989/guardavano-guardavano/",
          "https://www.ombreeluci.it/1989/persone-handicap-nella-parrocchia-le-risposte-dei-parroci/",
          "https://www.ombreeluci.it/1989/vita-fede-luce-n-25/",
          "https://www.ombreeluci.it/1989/dialogo-aperto/",
          "https://www.ombreeluci.it/1989/attivita-creative/",
          "https://www.ombreeluci.it/1989/la-sindrome-down-un-aiuto-gli-educatori-genitori/",
          "https://www.ombreeluci.it/1989/aiutami-a-giocare/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-26",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 26,
        display_title: "Numero 26 \u2013 Con gli altri",
        titolo_numero: "Con gli altri",
        seo_description: "\xABOgni genitore che ha un figlio che pu\xF2 raggiungere una certa autonomia sa bene che non deve stringere con lui un rapporto di forte dipendenza\u201D e insegnargli quanto pi\xF9 possibile, chiedendosi \u201CCosa non gli ho mai insegnato a fare",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 26 \u2013 Con gli altri Anno 4 \u2013 Numero 2 \u2013 Aprile \u2013 Maggio \u2013 Giugno 1989",
        descrizione_ai: null,
        anno_pubblicazione: 1989,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_26_1989.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-26-gli-altri/",
        canonical_url: "https://www.ombreeluci.it/project/numero-26-gli-altri/",
        archive_org_item_id: "OmbreELuci_026",
        archive_view_url: "https://archive.org/details/OmbreELuci_026",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1989/da-dove-cominciare/",
          "https://www.ombreeluci.it/1989/non-sempre-facile-sorella/",
          "https://www.ombreeluci.it/1989/perceval-un-luogo-vivere-imparare-vivere/",
          "https://www.ombreeluci.it/1989/ho-visto-rainman/",
          "https://www.ombreeluci.it/1989/vita-fede-luce-n-26/",
          "https://www.ombreeluci.it/1989/schema-organizzazione-giochi-olimpici/",
          "http://www.ombreeluci.it/1989/da-dove-cominciare/",
          "http://www.ombreeluci.it/1989/ho-visto-rainman/",
          "http://www.ombreeluci.it/1989/conoscere-handicap-autismo/",
          "http://www.ombreeluci.it/1989/aiutarlo-diventare-un-uomo/",
          "http://www.ombreeluci.it/1989/non-sempre-facile-sorella/",
          "http://www.ombreeluci.it/1989/perceval-un-luogo-vivere-imparare-vivere/",
          "http://www.ombreeluci.it/1989/comportarsi-le-persone-cieche/",
          "http://www.ombreeluci.it/1989/parlano-senza-parole/",
          "http://www.ombreeluci.it/1989/schema-organizzazione-giochi-olimpici/",
          "http://www.ombreeluci.it/1989/dialogo-aperto-n-26/",
          "http://www.ombreeluci.it/1989/vita-fede-luce-n-26/",
          "http://www.ombreeluci.it/1989/sara-bellissima-festa/",
          "http://www.ombreeluci.it/1989/un-lungo-cammino/",
          "http://www.ombreeluci.it/1989/amici-nonostante-la-guerra/",
          "http://www.ombreeluci.it/1989/altri-consigli-lettura/",
          "https://www.ombreeluci.it/1989/dialogo-aperto-n-26/",
          "https://www.ombreeluci.it/1989/conoscere-handicap-autismo/",
          "https://www.ombreeluci.it/1989/aiutarlo-diventare-un-uomo/",
          "https://www.ombreeluci.it/1989/parlano-senza-parole/",
          "https://www.ombreeluci.it/1989/comportarsi-le-persone-cieche/",
          "https://www.ombreeluci.it/1989/amici-nonostante-la-guerra/",
          "https://www.ombreeluci.it/1989/un-lungo-cammino/",
          "https://www.ombreeluci.it/1989/sara-bellissima-festa/",
          "https://www.ombreeluci.it/1989/altri-consigli-lettura/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-27",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 27,
        display_title: "Numero 27 \u2013 I bambini sordi",
        titolo_numero: "I bambini sordi",
        seo_description: "Cosa significa non udire, vivere nel silenzio? E se udiamo, come ascoltiamo? Siamo sicuri di mettere a frutto questo sommo bene? Come sempre, ci aiutano a farci un\u2019idea le testimonianze delle persone che vivono questa condizione o di chi sta loro giorno dopo giorno (una mamma, una moglie, una sorella, un\u2019insegnante). Proviamo a mettere in pratica i piccoli suggerimenti per avvicinare e parlare con una persona sorda perch\xE9, se pure sono tanti i progressi fatti per venire incontro alle difficolt\xE0 dei sordi, tanto \xABdipende",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 27 \u2013 I bambini sordi Anno VII \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre, 1989",
        descrizione_ai: null,
        anno_pubblicazione: 1989,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_27_1989.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-27-i-bambini-sordi/",
        canonical_url: "https://www.ombreeluci.it/project/numero-27-i-bambini-sordi/",
        archive_org_item_id: "OmbreELuci_027",
        archive_view_url: "https://archive.org/details/OmbreELuci_027",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1989/come-ascoltare-veramente/",
          "http://www.ombreeluci.it/1989/anche-se-non-ho-voce-anche-se-non-sento/",
          "http://www.ombreeluci.it/1989/la-storia-di-angelica/",
          "http://www.ombreeluci.it/1989/a-tavola-con-una-persona-sorda/",
          "http://www.ombreeluci.it/1989/ho-fratello-e-sorella-sordi/",
          "http://www.ombreeluci.it/1989/dal-silenzio-alla-comunicazione/",
          "http://www.ombreeluci.it/1989/come-parlare-a-una-persona-sorda/",
          "http://www.ombreeluci.it/1989/cooperativa-spazio-aperto/",
          "http://www.ombreeluci.it/1989/come-riconoscere-la-sordita-infantile/",
          "http://www.ombreeluci.it/1989/dialogo-aperto-n-27/",
          "https://www.ombreeluci.it/1989/vita-fede-e-luce-n-27/",
          "http://www.ombreeluci.it/1989/laltra-gente-convivere-con-lhandicap/",
          "http://www.ombreeluci.it/1989/il-bambino-con-epilessia/",
          "https://www.ombreeluci.it/1989/anche-se-non-ho-voce-anche-se-non-sento/",
          "https://www.ombreeluci.it/1989/come-ascoltare-veramente/",
          "https://www.ombreeluci.it/1989/la-storia-di-angelica/",
          "https://www.ombreeluci.it/1989/dal-silenzio-alla-comunicazione/",
          "https://www.ombreeluci.it/1989/a-tavola-con-una-persona-sorda/",
          "https://www.ombreeluci.it/1989/come-parlare-a-una-persona-sorda/",
          "https://www.ombreeluci.it/1989/ho-fratello-e-sorella-sordi/",
          "https://www.ombreeluci.it/1989/cooperativa-spazio-aperto/",
          "https://www.ombreeluci.it/1989/laltra-gente-convivere-con-lhandicap/",
          "https://www.ombreeluci.it/1989/il-bambino-con-epilessia/",
          "https://www.ombreeluci.it/1989/dialogo-aperto-n-27/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-28",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 28,
        display_title: "Numero 28 \u2013 A tavola!",
        titolo_numero: "A tavola!",
        seo_description: "\xABSi mangia perch\xE9 \xE8 vitale, ma molto presto si mangia perch\xE9 si prova piacere... \xC8 importante per la condivisione, per imparare a vivere insieme, per accogliere, per far festa\xBB. Quante cose ruotano intorno ad una tavola? Lo scopriamo insieme, dalla tavola di casa alla mensa eucaristica, i luoghi nei quali ognuno pu\xF2 e dovrebbe trovare il suo posto. Poi una storia di adozione e il colloquio che Sergio Sciascia propone al direttore dell\u2019epoca delle Case della Carit\xE0, realt\xE0 profondamente evangeliche che possono \u201Cfar ritrovare il senso\u201D che sembra perdersi alle nostre comunit\xE0 parrocchiali. Lettere sempre importanti",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 28 \u2013 A tavola! Anno VII \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 1989",
        descrizione_ai: null,
        anno_pubblicazione: 1989,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_28_1989.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-28-a-tavola/",
        canonical_url: "https://www.ombreeluci.it/project/numero-28-a-tavola/",
        archive_org_item_id: "OmbreELuci_028",
        archive_view_url: "https://archive.org/details/OmbreELuci_028",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1989/mangiare-insieme/",
          "https://www.ombreeluci.it/1989/i-pasti-di-francesca-un-rito-e-una-avventura/",
          "https://www.ombreeluci.it/1989/dove-se-non-in-chiesa/",
          "https://www.ombreeluci.it/1989/un-grande-progetto-a-piccoli-passi/",
          "https://www.ombreeluci.it/1989/le-case-della-carita/",
          "http://www.ombreeluci.it/1989/dialogo-aperto-n-28/",
          "http://www.ombreeluci.it/1989/vita-fede-e-luce-n-28/",
          "http://www.ombreeluci.it/1989/buon-natale-anche-a-te/",
          "http://www.ombreeluci.it/1989/mangiare-insieme/",
          "http://www.ombreeluci.it/1989/il-bambino-che-non-vuol-mangiare/",
          "http://www.ombreeluci.it/1989/i-pasti-di-francesca-un-rito-e-una-avventura/",
          "http://www.ombreeluci.it/1989/dove-se-non-in-chiesa/",
          "http://www.ombreeluci.it/1989/un-grande-progetto-a-piccoli-passi/",
          "http://www.ombreeluci.it/1989/le-case-della-carita/",
          "http://www.ombreeluci.it/1989/per-insegnare-bisogna-saper-osservare/",
          "https://www.ombreeluci.it/1989/buon-natale-anche-a-te/",
          "https://www.ombreeluci.it/1989/il-bambino-che-non-vuol-mangiare/",
          "https://www.ombreeluci.it/1989/vita-fede-e-luce-n-28/",
          "https://www.ombreeluci.it/1989/per-insegnare-bisogna-saper-osservare/",
          "https://www.ombreeluci.it/1989/dialogo-aperto-n-28/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-29",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 29,
        display_title: "Numero 29 - Fratelli responsabili?",
        titolo_numero: "Fratelli responsabili?",
        seo_description: "Numero interamente dedicato ai fratelli e sorelle delle persone con disabilit\xE0",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 29 \u2013 Fratelli responsabili? Anno VIII \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 1990",
        descrizione_ai: null,
        anno_pubblicazione: 1990,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_29_1990.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-29-fratelli-responsabili/",
        canonical_url: "https://www.ombreeluci.it/project/numero-29-fratelli-responsabili/",
        archive_org_item_id: "OmbreELuci_29",
        archive_view_url: "https://archive.org/details/OmbreELuci_29",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1990/sentivo-crescere-la-mia-responsabilita/",
          "http://www.ombreeluci.it/1990/ma-non-carichiamoli-di-un-peso-eccessivo/",
          "https://www.ombreeluci.it/1990/radiografia-di-ombre-e-luci/",
          "http://www.ombreeluci.it/1990/case-famiglia-iniziative-e-centri-di-accoglienza-per-disabili-1983-al-1989/",
          "http://www.ombreeluci.it/1990/forse-e-per-mia-sorella-che-sono-cosi/",
          "http://www.ombreeluci.it/1990/radiografia-di-ombre-e-luci/",
          "http://www.ombreeluci.it/1990/bambini-autistici-scuola/",
          "http://www.ombreeluci.it/1990/dialogo-aperto-n-29/",
          "http://www.ombreeluci.it/1990/vita-fede-e-luce-n-29/",
          "http://www.ombreeluci.it/1990/jean-vanier-un-profeta-del-nostro-tempo/",
          "http://www.ombreeluci.it/1990/corso-per-corrispondenza-per-genitori-di-bambini-down/",
          "https://www.ombreeluci.it/1990/ma-non-carichiamoli-di-un-peso-eccessivo/",
          "https://www.ombreeluci.it/1990/forse-e-per-mia-sorella-che-sono-cosi/",
          "https://www.ombreeluci.it/1990/case-famiglia-iniziative-e-centri-di-accoglienza-per-disabili-1983-al-1989/",
          "https://www.ombreeluci.it/1990/sentivo-crescere-la-mia-responsabilita/",
          "https://www.ombreeluci.it/1990/bambini-autistici-scuola/",
          "https://www.ombreeluci.it/1990/dialogo-aperto-n-29/",
          "https://www.ombreeluci.it/1990/corso-per-corrispondenza-per-genitori-di-bambini-down/",
          "https://www.ombreeluci.it/1990/jean-vanier-un-profeta-del-nostro-tempo/",
          "https://www.ombreeluci.it/1989/come-riconoscere-la-sordita-infantile/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-31",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 31,
        display_title: "Numero 31 - Le comunit\xE0 Fede e Luce",
        titolo_numero: "Le comunit\xE0 Fede e Luce",
        seo_description: "Numero 31 \u2013 Le comunit\xE0 Fede e Luce",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 31 \u2013 Le comunit\xE0 di Fede e Luce Anno VIII \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 1990",
        descrizione_ai: null,
        anno_pubblicazione: 1990,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_31_1990.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-31-le-comunita-fede-e-luce/",
        canonical_url: "https://www.ombreeluci.it/project/numero-31-le-comunita-fede-e-luce/",
        archive_org_item_id: "OmbreELuci_31",
        archive_view_url: "https://archive.org/details/OmbreELuci_31",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1990/che-cosa-e-fede-e-luce/",
          "http://www.ombreeluci.it/1990/vocazione-di-fede-e-luce/",
          "http://www.ombreeluci.it/1990/cammino-damore/",
          "http://www.ombreeluci.it/1990/lamicizia-a-fede-e-luce-un-legame-anche-con-chi-e-piu-debole-e-solitamente-rifiutato/",
          "http://www.ombreeluci.it/1990/incontro-di-una-comunita-di-fede-e-luce/",
          "http://www.ombreeluci.it/1990/il-4-momento-tra-un-incontro-e-laltro/",
          "http://www.ombreeluci.it/1990/equipe-di-coordinamento-come-funziona/",
          "http://www.ombreeluci.it/1990/i-giorni-del-campo/",
          "http://www.ombreeluci.it/1990/fede-e-luce-giorno-e-notte/",
          "http://www.ombreeluci.it/1990/viaggio-insieme-per-crescere-tutti/",
          "http://www.ombreeluci.it/1990/un-nuovo-modo-di-vedere-la-vita/",
          "http://www.ombreeluci.it/1990/vita-e-amore-si-erano-spenti/",
          "http://www.ombreeluci.it/1990/sono-anche-figli-di-tutti/",
          "http://www.ombreeluci.it/1990/scendi-ancora-un-po/",
          "http://www.ombreeluci.it/1990/incontro-internazionale-edimburgo-agosto-1990/",
          "http://www.ombreeluci.it/1990/fuori-dalle-catacombe-fede-e-luce-in-europa-orientale/",
          "http://www.ombreeluci.it/1990/per-altri-valori-fede-e-luce-in-svizzera/",
          "http://www.ombreeluci.it/1990/nel-libano-in-guerra-fede-e-luce-per-sperare/",
          "http://www.ombreeluci.it/1990/mirella-pablo-silvia-claudia-patrizia/",
          "http://www.ombreeluci.it/1990/fede-e-luce-una-grande-famiglia-del-mondo/",
          "http://www.ombreeluci.it/1990/la-persona-fragile-via-verso-lunita/",
          "http://www.ombreeluci.it/1990/domande-e-risposte-su-fede-e-luce/",
          "https://www.ombreeluci.it/1990/che-cosa-e-fede-e-luce/",
          "https://www.ombreeluci.it/1990/vocazione-di-fede-e-luce/",
          "https://www.ombreeluci.it/1990/cammino-damore/",
          "https://www.ombreeluci.it/1990/incontro-di-una-comunita-di-fede-e-luce/",
          "https://www.ombreeluci.it/1990/il-4-momento-tra-un-incontro-e-laltro/",
          "https://www.ombreeluci.it/1990/equipe-di-coordinamento-come-funziona/",
          "https://www.ombreeluci.it/1990/i-giorni-del-campo/",
          "https://www.ombreeluci.it/1990/fede-e-luce-giorno-e-notte/",
          "https://www.ombreeluci.it/1990/viaggio-insieme-per-crescere-tutti/",
          "https://www.ombreeluci.it/1990/un-nuovo-modo-di-vedere-la-vita/",
          "https://www.ombreeluci.it/1990/un-matrimonio-diverso/",
          "https://www.ombreeluci.it/1990/lanimo-pieno-di-gratitudine/",
          "https://www.ombreeluci.it/1990/vita-e-amore-si-erano-spenti/",
          "https://www.ombreeluci.it/1990/sono-anche-figli-di-tutti/",
          "https://www.ombreeluci.it/1990/scendi-ancora-un-po/",
          "https://www.ombreeluci.it/1990/incontro-internazionale-edimburgo-agosto-1990/",
          "https://www.ombreeluci.it/1990/fuori-dalle-catacombe-fede-e-luce-in-europa-orientale/",
          "https://www.ombreeluci.it/1990/per-altri-valori-fede-e-luce-in-svizzera/",
          "https://www.ombreeluci.it/1990/nel-libano-in-guerra-fede-e-luce-per-sperare/",
          "https://www.ombreeluci.it/1990/mirella-pablo-silvia-claudia-patrizia/",
          "https://www.ombreeluci.it/1990/fede-e-luce-una-grande-famiglia-del-mondo/",
          "https://www.ombreeluci.it/1990/la-persona-fragile-via-verso-lunita/",
          "https://www.ombreeluci.it/1990/domande-e-risposte-su-fede-e-luce/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-32",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 32,
        display_title: "Numero 32 \u2013 Nasca la speranza nel nostro vecchio mondo",
        titolo_numero: "Nasca la speranza nel nostro vecchio mondo",
        seo_description: "Numero 32 \u2013 Nasca la speranza nel nostro vecchio mondo",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 32 \u2013 Nasca la speranza nel nostro vecchio mondo Anno VIII \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 1990",
        descrizione_ai: null,
        anno_pubblicazione: 1990,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_32_1990.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-32-nasca-la-speranza-nel-nostro-vecchio-mondo/",
        canonical_url: "https://www.ombreeluci.it/project/numero-32-nasca-la-speranza-nel-nostro-vecchio-mondo/",
        archive_org_item_id: "OmbreELuci_32",
        archive_view_url: "https://archive.org/details/OmbreELuci_32",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1986/prepariamolo-vivere-con-gli-altri/",
          "http://www.ombreeluci.it/1986/tutto-quello-che-ha-fatto-per-noi/",
          "http://www.ombreeluci.it/1986/ora-che-sono-sola-non-sono-piu-sola/",
          "http://www.ombreeluci.it/1986/festa-in-casa-con-lui/",
          "http://www.ombreeluci.it/1986/perche-ho-dato-una-mano/",
          "http://www.ombreeluci.it/1986/convento-una-seconda-famiglia-per-giampiero/",
          "http://www.ombreeluci.it/1986/vederli-migliorare/",
          "http://www.ombreeluci.it/1986/dialogo-aperto-n-16/",
          "http://www.ombreeluci.it/1986/vita-fede-luce-n-16-corso-formazione-ilkley/",
          "http://www.ombreeluci.it/1986/quando-arrivano-fatti-coraggio/",
          "http://www.ombreeluci.it/1986/come-i-cerchi-nellacqua/",
          "http://www.ombreeluci.it/1986/vivere-lultimo-istante/",
          "https://www.ombreeluci.it/1990/lezione-di-danza-insieme/",
          "https://www.ombreeluci.it/1990/abib-mohamed-e-naima/",
          "https://www.ombreeluci.it/1990/accogliere-un-bambino-autistico/",
          "https://www.ombreeluci.it/1990/io-sono-una-come-voi-una-mamma/",
          "https://www.ombreeluci.it/1990/preghiera-della-malattia/",
          "https://www.ombreeluci.it/1990/una-passeggiata-in-campagna/",
          "https://www.ombreeluci.it/1990/chi-ha-avuto-paura-fa-gratis-un-altro-giro-una-giornata-al-luneur-di-roma/",
          "https://www.ombreeluci.it/1990/ma-non-sono-sola/",
          "https://www.ombreeluci.it/1990/malattia-mentale-legge-180/",
          "https://www.ombreeluci.it/1990/una-soluzione-giusta-e-umana-maso-s-pietro/",
          "https://www.ombreeluci.it/1990/il-corpo-spezzato/",
          "https://www.ombreeluci.it/1990/il-tuo-nome-e-olga-lettere-a-mia-figlia-handicappata/",
          "https://www.ombreeluci.it/1990/dialogo-aperto-n-32/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-33",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 33,
        display_title: "Numero 33 - Collaborare per risolvere",
        titolo_numero: "Collaborare per risolvere",
        seo_description: "Anno IX \u2013 Numero \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 1991",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 33 \u2013 Collaborare per risolvere Anno IX \u2013 Numero \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 1991",
        descrizione_ai: null,
        anno_pubblicazione: 1991,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_33_1991.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-33-collaborare-per-risolvere/",
        canonical_url: "https://www.ombreeluci.it/project/numero-33-collaborare-per-risolvere/",
        archive_org_item_id: "OmbreELuci_33",
        archive_view_url: "https://archive.org/details/OmbreELuci_33",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1991/con-la-vostra-collaborazione/",
          "http://www.ombreeluci.it/1991/famiglie-diverse/",
          "http://www.ombreeluci.it/1991/educare-e-desiderare/",
          "http://www.ombreeluci.it/1991/la-stelletta/",
          "http://www.ombreeluci.it/1991/quello-che-manca-ai-notri-figli/",
          "http://www.ombreeluci.it/1991/dialogo-aperto-n-33/",
          "http://www.ombreeluci.it/1991/vita-riflessioni-sulla-cultura-dellhandicap/",
          "http://www.ombreeluci.it/1991/il-mio-piede-sinistro/",
          "https://www.ombreeluci.it/1991/con-la-vostra-collaborazione/",
          "https://www.ombreeluci.it/1991/famiglie-diverse/",
          "https://www.ombreeluci.it/1991/quello-che-manca-ai-notri-figli/",
          "https://www.ombreeluci.it/1991/educare-e-desiderare/",
          "https://www.ombreeluci.it/1991/la-stelletta/",
          "https://www.ombreeluci.it/1991/lomino-di-vetro-un-viaggio-nel-mondo-dellhandicap/",
          "https://www.ombreeluci.it/1991/vita-riflessioni-sulla-cultura-dellhandicap/",
          "https://www.ombreeluci.it/1991/dialogo-aperto-n-33/",
          "https://www.ombreeluci.it/1991/il-mio-piede-sinistro/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-34",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 34,
        display_title: "Numero 34 - Cos\xEC noi lavoriamo con gli altri",
        titolo_numero: "Cos\xEC noi lavoriamo con gli altri",
        seo_description: "Numero 34 \u2013 Cos\xEC noi lavoriamo con gli altri",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 34 \u2013 Cos\xEC noi lavoriamo con gli altri Anno IX \u2013 Numero 34 \u2013 Aprile \u2013 Maggio \u2013 Giugno 1991",
        descrizione_ai: null,
        anno_pubblicazione: 1991,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_34_1991.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-34-cosi-noi-lavoriamo-con-gli-altri/",
        canonical_url: "https://www.ombreeluci.it/project/numero-34-cosi-noi-lavoriamo-con-gli-altri/",
        archive_org_item_id: "OmbreELuciN.1",
        archive_view_url: "https://archive.org/details/OmbreELuciN.1",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1991/lavorare-con-gli-altri/",
          "http://www.ombreeluci.it/1991/in-fabbrica-e-una-bella-fatica/",
          "http://www.ombreeluci.it/1991/meglio-stanco-che-annoiato/",
          "http://www.ombreeluci.it/1991/il-piu-popolare-al-velodromo/",
          "http://www.ombreeluci.it/1991/sergio-e-un-buon-giardiniere/",
          "http://www.ombreeluci.it/1991/oggi-e-dei-nostri/",
          "http://www.ombreeluci.it/1991/e-sempre-disponibile/",
          "http://www.ombreeluci.it/1991/primavalle-un-territorio-molti-progetti/",
          "http://www.ombreeluci.it/1991/dialogo-aperto-n-34/",
          "http://www.ombreeluci.it/2018/vita-fede-e-luce-n-34-che-settimana/",
          "http://www.ombreeluci.it/1991/educare-al-servizio/",
          "http://www.ombreeluci.it/1991/storia-di-un-filo-derba/",
          "https://www.ombreeluci.it/1991/lavorare-con-gli-altri/",
          "https://www.ombreeluci.it/1991/in-fabbrica-e-una-bella-fatica/",
          "https://www.ombreeluci.it/1991/meglio-stanco-che-annoiato/",
          "https://www.ombreeluci.it/1991/il-piu-popolare-al-velodromo/",
          "https://www.ombreeluci.it/1991/sergio-e-un-buon-giardiniere/",
          "https://www.ombreeluci.it/1991/oggi-e-dei-nostri/",
          "https://www.ombreeluci.it/1991/e-sempre-disponibile/",
          "https://www.ombreeluci.it/1991/primavalle-un-territorio-molti-progetti/",
          "https://www.ombreeluci.it/1991/dialogo-aperto-n-34/",
          "https://www.ombreeluci.it/1991/educare-al-servizio/",
          "https://www.ombreeluci.it/1991/storia-di-un-filo-derba/",
          "https://www.ombreeluci.it/1991/vita-fede-e-luce-n-34-che-settimana/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-35",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 35,
        display_title: 'Numero 35 - Ascoltiamo i "genitori"',
        titolo_numero: 'Ascoltiamo i "genitori"',
        seo_description: "Numero 35 \u2013 Ascoltiamo i \u201Cgenitori\u201D",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 35 \u2013 Ascoltiamo i \u201Cgenitori\u201D Anno IX \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 1991",
        descrizione_ai: null,
        anno_pubblicazione: 1991,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_35_1991.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-35-ascoltiamo-i-genitori/",
        canonical_url: "https://www.ombreeluci.it/project/numero-35-ascoltiamo-i-genitori/",
        archive_org_item_id: "OmbreELuciN.35",
        archive_view_url: "https://archive.org/details/OmbreELuciN.35",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1991/il-momento-di-capire/",
          "http://www.ombreeluci.it/1991/che-vita-e-la-nostra-sei-mamme-si-raccontano/",
          "http://www.ombreeluci.it/1991/anche-noi-siamo-persone/",
          "http://www.ombreeluci.it/1991/al-primo-posto/",
          "http://www.ombreeluci.it/1991/la-voce-dei-genitori/",
          "http://www.ombreeluci.it/1991/dialogo-aperto-n-35/",
          "http://www.ombreeluci.it/1991/imparo-a-vestirmi-da-solo/",
          "http://www.ombreeluci.it/1991/strategie-educative-nellautismo/",
          "http://www.ombreeluci.it/1991/storie-vere-di-bambini-autistici/",
          "https://www.ombreeluci.it/1991/il-momento-di-capire/",
          "https://www.ombreeluci.it/1991/che-vita-e-la-nostra-sei-mamme-si-raccontano/",
          "https://www.ombreeluci.it/1991/al-primo-posto/",
          "https://www.ombreeluci.it/1991/anche-noi-siamo-persone/",
          "https://www.ombreeluci.it/1991/la-voce-dei-genitori/",
          "https://www.ombreeluci.it/1991/storie-vere-di-bambini-autistici/",
          "https://www.ombreeluci.it/1991/strategie-educative-nellautismo/",
          "https://www.ombreeluci.it/1991/dialogo-aperto-n-35/",
          "https://www.ombreeluci.it/1991/imparo-a-vestirmi-da-solo/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-36",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 36,
        display_title: "Numero 36 - Il desiderio di tanti: casa-famiglia",
        titolo_numero: "Il desiderio di tanti: casa-famiglia",
        seo_description: "Numero 36 \u2013 Il desiderio di tanti: casa-famiglia",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 36 \u2013 Il desiderio di tanti: casa-familgia Anno IX \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 1991",
        descrizione_ai: null,
        anno_pubblicazione: 1991,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_36_1991.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-36-il-desiderio-di-tanti-casa-famiglia/",
        canonical_url: "https://www.ombreeluci.it/project/numero-36-il-desiderio-di-tanti-casa-famiglia/",
        archive_org_item_id: "OmbreELuciN.36",
        archive_view_url: "https://archive.org/details/OmbreELuciN.36",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1991/il-dopo-di-noi/",
          "http://www.ombreeluci.it/1991/domande-e-risposte-sul-domani-dei-nostri-figli/",
          "http://www.ombreeluci.it/1991/possiamo-fare-qualcosa-noi-genitori/",
          "http://www.ombreeluci.it/1991/esempi-di-comunita-alloggio-5-comunita/",
          "http://www.ombreeluci.it/1991/casa-famiglia-ancora/",
          "http://www.ombreeluci.it/1991/dialogo-aperto-n-36/",
          "http://www.ombreeluci.it/1991/una-vita-possibile-handicap-mentale-e-famiglia/",
          "http://www.ombreeluci.it/1991/effata-apriti/",
          "http://www.ombreeluci.it/1991/la-comunita-luogo-del-perdono-e-della-festa/",
          "https://www.ombreeluci.it/1991/il-dopo-di-noi/",
          "https://www.ombreeluci.it/1991/domande-e-risposte-sul-domani-dei-nostri-figli/",
          "https://www.ombreeluci.it/1991/possiamo-fare-qualcosa-noi-genitori/",
          "https://www.ombreeluci.it/1991/esempi-di-comunita-alloggio-5-comunita/",
          "https://www.ombreeluci.it/1991/casa-famiglia-ancora/",
          "https://www.ombreeluci.it/1991/una-vita-possibile-handicap-mentale-e-famiglia/",
          "https://www.ombreeluci.it/1991/effata-apriti/",
          "https://www.ombreeluci.it/1991/la-comunita-luogo-del-perdono-e-della-festa/",
          "https://www.ombreeluci.it/1991/dialogo-aperto-n-36/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-37",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 37,
        display_title: 'Numero 37 - Pellegrinaggio a Lourdes 1991 - "Che siano una cosa sola"',
        titolo_numero: 'Pellegrinaggio a Lourdes 1991 - "Che siano una cosa sola"',
        seo_description: "Numero 37 \u2013 Pellegrinaggio a Lourdes 1991 \u2013 \u201CChe siano una cosa sola\u201D",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 37 \u2013 Pellegrinaggio a Lourdes 1991 \u2013 \u201CChe siano una cosa sola\u201D Anno X \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 1992",
        descrizione_ai: null,
        anno_pubblicazione: 1991,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_37_1992.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-37-pellegrinaggio-a-lourdes-1991-che-siano-una-cosa-sola/",
        canonical_url: "https://www.ombreeluci.it/project/numero-37-pellegrinaggio-a-lourdes-1991-che-siano-una-cosa-sola/",
        archive_org_item_id: "OmbreELuci_37",
        archive_view_url: "https://archive.org/details/OmbreELuci_37",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1992/per-capire-di-piu/",
          "http://www.ombreeluci.it/1992/ora-manuela/",
          "http://www.ombreeluci.it/1992/speciale-pellegrinaggio-a-lourdes-1991/",
          "http://www.ombreeluci.it/1992/maria-de-la-soledad/",
          "http://www.ombreeluci.it/1992/la-speranza-nella-vita-quotidiana-con-nostro-figlio-affetto-da-miopatia/",
          "http://www.ombreeluci.it/1992/lettera-a-un-medico-per-la-nascita-di-un-bambino-disabile/",
          "http://www.ombreeluci.it/1992/come-annunciare-un-bambino-down/",
          "http://www.ombreeluci.it/1992/dialogo-aperto-n-37/",
          "http://www.ombreeluci.it/1992/la-depressione/",
          "http://www.ombreeluci.it/1992/il-vizio-di-vivere-ventanni-nel-polmone-dacciaio/",
          "https://www.ombreeluci.it/1992/per-capire-di-piu/",
          "https://www.ombreeluci.it/1992/ora-manuela/",
          "https://www.ombreeluci.it/1992/speciale-pellegrinaggio-a-lourdes-1991/",
          "https://www.ombreeluci.it/1992/maria-de-la-soledad/",
          "https://www.ombreeluci.it/1992/la-speranza-nella-vita-quotidiana-con-nostro-figlio-affetto-da-miopatia/",
          "https://www.ombreeluci.it/1992/lettera-a-un-medico-per-la-nascita-di-un-bambino-disabile/",
          "https://www.ombreeluci.it/1992/dialogo-aperto-n-37/",
          "https://www.ombreeluci.it/1992/come-annunciare-un-bambino-down/",
          "https://www.ombreeluci.it/1992/la-depressione/",
          "https://www.ombreeluci.it/1992/il-vizio-di-vivere-ventanni-nel-polmone-dacciaio/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-38",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 38,
        display_title: "Numero 38 - Chi aiuta la famiglia? Terapisti, amici, educatori",
        titolo_numero: "Chi aiuta la famiglia? Terapisti, amici, educatori",
        seo_description: "I protagonisti di questo numero sono: Lelia, Giacomo, Roberta e Viviana. Le loro quattro brevi presentazioni dicono quanto pu\xF2 essere fatto per offrire un\u2019esistenza serena e fruttuosa a chi, come loro, parte svantaggiato",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 38 \u2013 Chi aiuta la famiglia? Terapisti, amici, educatori Anno X \u2013 Numero 2 \u2013 Aprile \u2013 Maggio \u2013 Giugno 1992",
        descrizione_ai: null,
        anno_pubblicazione: 1992,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_38_1992.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-38-chi-aiuta-la-famiglia-terapisti-amici-educatori/",
        canonical_url: "https://www.ombreeluci.it/project/numero-38-chi-aiuta-la-famiglia-terapisti-amici-educatori/",
        archive_org_item_id: "OmbreELuci_039",
        archive_view_url: "https://archive.org/details/OmbreELuci_039",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1992/oltre-la-famiglia-gli-specialisti-gli-amici/",
          "http://www.ombreeluci.it/1992/lelia/",
          "http://www.ombreeluci.it/1992/giacomo/",
          "http://www.ombreeluci.it/1992/roberta/",
          "http://www.ombreeluci.it/1992/viviana/",
          "http://www.ombreeluci.it/1992/come-essere-amici/",
          "http://www.ombreeluci.it/1992/chi-aiuta-la-famiglia-gli-specialisti/",
          "http://www.ombreeluci.it/1992/dialogo-aperto-n-39/",
          "http://www.ombreeluci.it/1992/la-pazzia-e-lamore-un-cammino-verso-lanima-del-malato-di-mente/",
          "http://www.ombreeluci.it/1992/ascolto-che-guarisce/",
          "http://www.ombreeluci.it/1992/giobbe-perche-dialogo-di-una-madre/",
          "http://www.ombreeluci.it/1992/quando-la-crisi-insegna-a-vivere-esperienza-positiva-del-dolore/",
          "https://www.ombreeluci.it/1992/oltre-la-famiglia-gli-specialisti-gli-amici/",
          "https://www.ombreeluci.it/1992/come-essere-amici/",
          "https://www.ombreeluci.it/1992/lelia/",
          "https://www.ombreeluci.it/1992/giacomo/",
          "https://www.ombreeluci.it/1992/roberta/",
          "https://www.ombreeluci.it/1992/vita-fede-e-luce-n-38/",
          "https://www.ombreeluci.it/1992/la-pazzia-e-lamore-un-cammino-verso-lanima-del-malato-di-mente/",
          "https://www.ombreeluci.it/1992/ascolto-che-guarisce/",
          "https://www.ombreeluci.it/1992/giobbe-perche-dialogo-di-una-madre/",
          "https://www.ombreeluci.it/1992/quando-la-crisi-insegna-a-vivere-esperienza-positiva-del-dolore/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-39",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 39,
        display_title: "Numero 39 - Catechesi: perch\xE9 nessuno sia dimenticato",
        titolo_numero: "Catechesi: perch\xE9 nessuno sia dimenticato",
        seo_description: "Numero 39 \u2013 Catechesi: perch\xE9 nessuno sia dimenticato",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 39 \u2013 Catechesi: perch\xE9 nessuno sia dimenticato Anno X \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 1992",
        descrizione_ai: null,
        anno_pubblicazione: 1992,
        anno_collezione: null,
        periodicita: "bimestrale",
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_39_1992.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-39-catechesi-perche-nessuno-sia-dimenticato/",
        canonical_url: "https://www.ombreeluci.it/project/numero-39-catechesi-perche-nessuno-sia-dimenticato/",
        archive_org_item_id: "OmbreELuci_039",
        archive_view_url: "https://archive.org/details/OmbreELuci_039",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1992/lasciateli-venire-a-me/",
          "http://www.ombreeluci.it/1992/perche-nessuno-sia-dimenticato/",
          "http://www.ombreeluci.it/1992/la-prima-comunione-di-flaminia-ci-ha-fatto-crescere/",
          "http://www.ombreeluci.it/1992/maria-la-mia-figlioccia/",
          "http://www.ombreeluci.it/1992/essere-padrino-ha-cambiato-la-sua-vita/",
          "http://www.ombreeluci.it/1992/temevo-non-accettata-catechista/",
          "http://www.ombreeluci.it/1992/rendere-viva-la-messa-unita/",
          "http://www.ombreeluci.it/1992/testi-e-sussidi-per-la-catechesi-alle-persone-portatrici-di-handicap/",
          "http://www.ombreeluci.it/1992/non-potevo-diventare-suora-perche-non-potevo-leggere/",
          "http://www.ombreeluci.it/1992/si-e-aperta-una-finestra-nella-nostra-vita/",
          "http://www.ombreeluci.it/1992/cresima-marco/",
          "http://www.ombreeluci.it/1992/dialogo-aperto-n-39/",
          "http://www.ombreeluci.it/1992/vita-di-fede-e-luce-n-40-i-campi-di-fede-e-luce-come-momento-formativo/",
          "http://www.ombreeluci.it/1992/la-vita-esplodera-itinerari-didattico-educativi-per-linsegnamento-della-religione-cattolica-nella-scuola-dellobbligo-anche-per-alunni-portatori-di-handicap/",
          "http://www.ombreeluci.it/1992/psicopatologia-e-vita-spirituale-sofferenza-e-maturita-umana/",
          "http://www.ombreeluci.it/1992/integralita-delleducazione-e-diritto-allo-spirituale/",
          "https://www.ombreeluci.it/1992/temevo-non-accettata-catechista/",
          "https://www.ombreeluci.it/1992/perche-nessuno-sia-dimenticato/",
          "https://www.ombreeluci.it/1992/lasciateli-venire-a-me/",
          "https://www.ombreeluci.it/1992/la-prima-comunione-di-flaminia-ci-ha-fatto-crescere/",
          "https://www.ombreeluci.it/1992/maria-la-mia-figlioccia/",
          "https://www.ombreeluci.it/1992/essere-padrino-ha-cambiato-la-sua-vita/",
          "https://www.ombreeluci.it/1992/testi-e-sussidi-per-la-catechesi-alle-persone-portatrici-di-handicap/",
          "https://www.ombreeluci.it/1992/non-potevo-diventare-suora-perche-non-potevo-leggere/",
          "https://www.ombreeluci.it/1992/si-e-aperta-una-finestra-nella-nostra-vita/",
          "https://www.ombreeluci.it/1992/vita-di-fede-e-luce-n-40-i-campi-di-fede-e-luce-come-momento-formativo/",
          "https://www.ombreeluci.it/1992/dialogo-aperto-n-39/",
          "https://www.ombreeluci.it/1992/la-vita-esplodera-itinerari-didattico-educativi-per-linsegnamento-della-religione-cattolica-nella-scuola-dellobbligo-anche-per-alunni-portatori-di-handicap/",
          "https://www.ombreeluci.it/1992/psicopatologia-e-vita-spirituale-sofferenza-e-maturita-umana/",
          "https://www.ombreeluci.it/1992/cresima-marco/",
          "https://www.ombreeluci.it/1992/rendere-viva-la-messa-unita/",
          "https://www.ombreeluci.it/1992/integralita-delleducazione-e-diritto-allo-spirituale/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-40",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 40,
        display_title: "Numero 40 - La vita sulla sedia a rotelle",
        titolo_numero: "La vita sulla sedia a rotelle",
        seo_description: "Fermati un momento. \xC8 utile ogni tanto. Questa volta per provare a capire le tante persone che, spesso, in un attimo, sono passati dalla vita normale a una vita diversa",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 40 \u2013 La vita sulla sedia a rotelle Anno X \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 1992",
        descrizione_ai: null,
        anno_pubblicazione: 1992,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_40_1992.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-40-la-vita-sulla-sedia-a-rotelle/",
        canonical_url: "https://www.ombreeluci.it/project/numero-40-la-vita-sulla-sedia-a-rotelle/",
        archive_org_item_id: "OmbreELuciN.1",
        archive_view_url: "https://archive.org/details/OmbreELuciN.1",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1992/fermati-un-momento-per-capire/",
          "http://www.ombreeluci.it/1992/di-fronte-alle-persone-che-soffrono-fuggire-o-andare-incontro/",
          "http://www.ombreeluci.it/1992/non-aver-paura-sono-io-che-ti-guido/",
          "http://www.ombreeluci.it/1992/loro-noi-che-stiamo-in-piedi/",
          "http://www.ombreeluci.it/1992/daniela/",
          "http://www.ombreeluci.it/1992/alessia/",
          "http://www.ombreeluci.it/1992/case-della-carita/",
          "http://www.ombreeluci.it/1992/dialogo-aperto-n-40/",
          "http://www.ombreeluci.it/1992/vita-fede-e-luce-n-40-incontro-alpi-danubio/",
          "http://www.ombreeluci.it/1992/guida-h-fondazione-laboratorio-per-le-politiche-sociali/",
          "http://www.ombreeluci.it/1992/una-sperimentazione-per-lautonomia-delle-persone-disabili/",
          "http://www.ombreeluci.it/1992/manuale-di-informazione-sullhandicap/",
          "https://www.ombreeluci.it/1993/possibilita-e-capacita-nascoste/",
          "https://www.ombreeluci.it/1993/grazie-per-avermelo-fatto-fare-da-sola/",
          "https://www.ombreeluci.it/1993/io-ho-pulito-il-tavolo/",
          "https://www.ombreeluci.it/1993/faccio-io/",
          "https://www.ombreeluci.it/1993/non-e-mai-troppo-tardi/",
          "https://www.ombreeluci.it/1993/faccio-il-viaggio-da-sola/",
          "https://www.ombreeluci.it/1993/membro-attivo-della-chiesa/",
          "https://www.ombreeluci.it/1993/nonostante-lhandicap/",
          "https://www.ombreeluci.it/1993/ricompense-o-punizioni/",
          "https://www.ombreeluci.it/1993/dovra-stare-in-un-ambiente-protetto/",
          "https://www.ombreeluci.it/1993/vivere-con-rifiutati/",
          "https://www.ombreeluci.it/1993/il-grande-cocomero/",
          "https://www.ombreeluci.it/1993/un-marinaio-in-treno/",
          "https://www.ombreeluci.it/1993/pagine-aperte-esperienze-di-solidarieta-a-parma-e-provincia-negli-anni-90/",
          "https://www.ombreeluci.it/1993/dialogo-aperto-n-42/",
          "https://www.ombreeluci.it/1993/vita-fede-e-luce-n-42/",
          "https://www.ombreeluci.it/1993/lalfabeto-della-mia-vita/",
          "https://www.ombreeluci.it/1993/le-eta-della-vita/",
          "https://www.ombreeluci.it/1993/il-bambino-che-non-sentiva-dolore/",
          "https://www.ombreeluci.it/1993/nessuno-in-nessun-luogo/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-41",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 41,
        display_title: "Numero 41 - 10 anni di Ombre e Luci: pi\xF9 che una rivista, una grande famiglia",
        titolo_numero: "10 anni di Ombre e Luci: pi\xF9 che una rivista, una grande famiglia",
        seo_description: "Numero 41 \u2013 10 anni di Ombre e Luci: pi\xF9 che una rivista, una grande famiglia",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 41 \u2013 10 anni di Ombre e Luci: pi\xF9 che una rivista, una grande famiglia Anno XI \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 1993",
        descrizione_ai: null,
        anno_pubblicazione: 1993,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_41_1993.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-41-10-anni-di-ombre-e-luci-piu-che-una-rivista-una-grande-famiglia/",
        canonical_url: "https://www.ombreeluci.it/project/numero-41-10-anni-di-ombre-e-luci-piu-che-una-rivista-una-grande-famiglia/",
        archive_org_item_id: "OmbreELuci_41",
        archive_view_url: "https://archive.org/details/OmbreELuci_41",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1993/eravamo-soli-e-siamo-rinati/",
          "http://www.ombreeluci.it/1993/un-mondo-che-cambia/",
          "http://www.ombreeluci.it/1993/proibito-amarlo/",
          "http://www.ombreeluci.it/1993/francesca-e-sabrina/",
          "http://www.ombreeluci.it/1993/e-ci-aiutiamo-a-camminare/",
          "http://www.ombreeluci.it/1993/mio-fratello-nel-suo-guscio/",
          "http://www.ombreeluci.it/1993/laboratori-storie-di-lavoro-e-di-amicizia/",
          "http://www.ombreeluci.it/1993/un-laboratorio-chiamato-lalveare/",
          "http://www.ombreeluci.it/2018/dialogo-aperto-n-41/",
          "http://www.ombreeluci.it/1993/vita-fede-e-luce-n-41/",
          "http://www.ombreeluci.it/1993/indice-articoli-per-argomenti/",
          "http://www.ombreeluci.it/1993/lhandicappato-mentale-adulto/",
          "http://www.ombreeluci.it/1993/il-bambino-magico/",
          "https://www.ombreeluci.it/2018/dialogo-aperto-n-41/",
          "https://www.ombreeluci.it/1993/10-anni-di-ombre-e-luci-piu-che-una-rivista-una-grande-famiglia/",
          "https://www.ombreeluci.it/1993/eravamo-soli-e-siamo-rinati/",
          "https://www.ombreeluci.it/1993/un-mondo-che-cambia/",
          "https://www.ombreeluci.it/1993/proibito-amarlo/",
          "https://www.ombreeluci.it/1993/francesca-e-sabrina/",
          "https://www.ombreeluci.it/1993/e-ci-aiutiamo-a-camminare/",
          "https://www.ombreeluci.it/1993/mio-fratello-nel-suo-guscio/",
          "https://www.ombreeluci.it/1993/laboratori-storie-di-lavoro-e-di-amicizia/",
          "https://www.ombreeluci.it/1993/un-laboratorio-chiamato-lalveare/",
          "https://www.ombreeluci.it/1993/il-bambino-magico/",
          "https://www.ombreeluci.it/1993/lhandicappato-mentale-adulto/",
          "https://www.ombreeluci.it/1993/vita-fede-e-luce-n-41/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-42",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 42,
        display_title: "Numero 42 - Posso anche io essere utile?",
        titolo_numero: "Posso anche io essere utile?",
        seo_description: "Deve esere molto duro tirar fuori qualcosa di buono",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 42 \u2013 Posso anche io essere utile? Anno XI \u2013 Numero 2 \u2013 Aprile \u2013 Maggio \u2013 Giugno 1993",
        descrizione_ai: null,
        anno_pubblicazione: 1993,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_42_1993.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-42-posso-anche-io-essere-utile/",
        canonical_url: "https://www.ombreeluci.it/project/numero-42-posso-anche-io-essere-utile/",
        archive_org_item_id: "OmbreELuciN_42",
        archive_view_url: "https://archive.org/details/OmbreELuciN_42",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1993/possibilita-e-capacita-nascoste/",
          "http://www.ombreeluci.it/1993/grazie-per-avermelo-fatto-fare-da-sola/",
          "http://www.ombreeluci.it/1993/faccio-io/",
          "http://www.ombreeluci.it/1993/non-e-mai-troppo-tardi/",
          "http://www.ombreeluci.it/1993/faccio-il-viaggio-da-sola/",
          "http://www.ombreeluci.it/1993/membro-attivo-della-chiesa/",
          "http://www.ombreeluci.it/1993/nonostante-lhandicap/",
          "http://www.ombreeluci.it/1993/ricompense-o-punizioni/",
          "http://www.ombreeluci.it/1993/dovra-stare-in-un-ambiente-protetto/",
          "http://www.ombreeluci.it/1993/vivere-con-rifiutati/",
          "http://www.ombreeluci.it/1993/il-grande-cocomero/",
          "http://www.ombreeluci.it/1993/un-marinaio-in-treno/",
          "http://www.ombreeluci.it/1993/dialogo-aperto-n-42/",
          "http://www.ombreeluci.it/1993/vita-fede-e-luce-n-42/",
          "http://www.ombreeluci.it/1993/pagine-aperte-esperienze-di-solidarieta-a-parma-e-provincia-negli-anni-90/",
          "http://www.ombreeluci.it/1993/lalfabeto-della-mia-vita/",
          "http://www.ombreeluci.it/1993/il-bambino-che-non-sentiva-dolore/",
          "http://www.ombreeluci.it/1993/nessuno-in-nessun-luogo/",
          "http://www.ombreeluci.it/1993/le-eta-della-vita/",
          "https://www.ombreeluci.it/1993/possibilita-e-capacita-nascoste/",
          "https://www.ombreeluci.it/1993/grazie-per-avermelo-fatto-fare-da-sola/",
          "https://www.ombreeluci.it/1993/io-ho-pulito-il-tavolo/",
          "https://www.ombreeluci.it/1993/faccio-io/",
          "https://www.ombreeluci.it/1993/non-e-mai-troppo-tardi/",
          "https://www.ombreeluci.it/1993/faccio-il-viaggio-da-sola/",
          "https://www.ombreeluci.it/1993/membro-attivo-della-chiesa/",
          "https://www.ombreeluci.it/1993/nonostante-lhandicap/",
          "https://www.ombreeluci.it/1993/ricompense-o-punizioni/",
          "https://www.ombreeluci.it/1993/dovra-stare-in-un-ambiente-protetto/",
          "https://www.ombreeluci.it/1993/vivere-con-rifiutati/",
          "https://www.ombreeluci.it/1993/il-grande-cocomero/",
          "https://www.ombreeluci.it/1993/un-marinaio-in-treno/",
          "https://www.ombreeluci.it/1993/pagine-aperte-esperienze-di-solidarieta-a-parma-e-provincia-negli-anni-90/",
          "https://www.ombreeluci.it/1993/dialogo-aperto-n-42/",
          "https://www.ombreeluci.it/1993/vita-fede-e-luce-n-42/",
          "https://www.ombreeluci.it/1993/lalfabeto-della-mia-vita/",
          "https://www.ombreeluci.it/1993/le-eta-della-vita/",
          "https://www.ombreeluci.it/1993/il-bambino-che-non-sentiva-dolore/",
          "https://www.ombreeluci.it/1993/nessuno-in-nessun-luogo/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-43",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 43,
        display_title: "Numero 43 - Quando scende la sera",
        titolo_numero: "Quando scende la sera",
        seo_description: "Coraggio, speranza, fiducia. Questi tre atteggiamenti dell\u2019animo, sono quelli",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 43 \u2013 Quando scende la sera Anno XI \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 1993",
        descrizione_ai: null,
        anno_pubblicazione: 1993,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_43_1993.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-43-quando-scende-la-sera/",
        canonical_url: "https://www.ombreeluci.it/project/numero-43-quando-scende-la-sera/",
        archive_org_item_id: "OmbreELuci_43",
        archive_view_url: "https://archive.org/details/OmbreELuci_43",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1993/si-fa-sera/",
          "http://www.ombreeluci.it/1993/prima-di-andare-a-letto/",
          "http://www.ombreeluci.it/1993/se-dorme-male/",
          "http://www.ombreeluci.it/1993/di-notte-bagna/",
          "http://www.ombreeluci.it/1993/io-grido-verso-te/",
          "http://www.ombreeluci.it/1993/imparando-a-vivere-bene-con-jimmy/",
          "http://www.ombreeluci.it/1993/viviamo-da-soli/",
          "http://www.ombreeluci.it/1993/quando-i-genitori-si-rimboccano-le-maniche/",
          "http://www.ombreeluci.it/1993/ce-labbiamo-fatta/",
          "http://www.ombreeluci.it/1993/dialogo-aperto-n-43/",
          "http://www.ombreeluci.it/1993/vita-fede-e-luce-n-43-seminario-sulla-catechesi-delle-persone-con-handicap/",
          "http://www.ombreeluci.it/1993/proviamo-unaltra-volta/",
          "http://www.ombreeluci.it/2018/cammino-di-preghiera/",
          "http://www.ombreeluci.it/1993/e-la-vita-eplodera-itinerari-didattico-educativi-per-linsegnamento-della-religione-cattolica/",
          "http://www.ombreeluci.it/2018/la-cinquataseiesima-colonna-uno-strumento-concreto-di-autoformazione-per-chi-si-trova-in-una-relazione-daiuto/",
          "http://www.ombreeluci.it/2018/la-forza-del-debole-vita-e-pensiero-di-dietrich-bonhoeffer/",
          "https://www.ombreeluci.it/2018/la-forza-del-debole-vita-e-pensiero-di-dietrich-bonhoeffer/",
          "https://www.ombreeluci.it/1993/proviamo-unaltra-volta/",
          "https://www.ombreeluci.it/1993/si-fa-sera/",
          "https://www.ombreeluci.it/1993/prima-di-andare-a-letto/",
          "https://www.ombreeluci.it/1993/se-dorme-male/",
          "https://www.ombreeluci.it/1993/di-notte-bagna/",
          "https://www.ombreeluci.it/1993/io-grido-verso-te/",
          "https://www.ombreeluci.it/1993/imparando-a-vivere-bene-con-jimmy/",
          "https://www.ombreeluci.it/1993/viviamo-da-soli/",
          "https://www.ombreeluci.it/1993/ce-labbiamo-fatta/",
          "https://www.ombreeluci.it/1993/quando-i-genitori-si-rimboccano-le-maniche/",
          "https://www.ombreeluci.it/1993/dialogo-aperto-n-43/",
          "https://www.ombreeluci.it/1993/cammino-di-preghiera/",
          "https://www.ombreeluci.it/1993/e-la-vita-eplodera-itinerari-didattico-educativi-per-linsegnamento-della-religione-cattolica/",
          "https://www.ombreeluci.it/1993/la-cinquataseiesima-colonna-uno-strumento-concreto-di-autoformazione-per-chi-si-trova-in-una-relazione-daiuto/",
          "https://www.ombreeluci.it/1993/vita-fede-e-luce-n-43-seminario-sulla-catechesi-delle-persone-con-handicap/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-44",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 44,
        display_title: "Numero 44 \u2013 Segni di speranza",
        titolo_numero: "Segni di speranza",
        seo_description: "Dall'archivio, un numero pieno di speranza per ricordarci che anche se apparentemente il cielo \xE8 molto nuvoloso, il sole c\u2019\xE8, e brilla con la luce di sempre.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 44 \u2013 Segni di speranza Anno XI \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 1993",
        descrizione_ai: null,
        anno_pubblicazione: 1993,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_44_1993.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-44-segni-di-speranza/",
        canonical_url: "https://www.ombreeluci.it/project/numero-44-segni-di-speranza/",
        archive_org_item_id: "OmbreELuci_44",
        archive_view_url: "https://archive.org/details/OmbreELuci_44",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1993/segni-di-speranza/",
          "http://www.ombreeluci.it/1993/florent-nella-scuola-italiana/",
          "http://www.ombreeluci.it/1993/costruire-la-capacita-di-sperare-in-un-ospedale-psichiatrico/",
          "http://www.ombreeluci.it/1993/due-piccole-isole-di-luce/",
          "http://www.ombreeluci.it/1993/la-fede-si-vive-cosi-si-impara/",
          "http://www.ombreeluci.it/2018/dare-loro-una-vita-normale/",
          "http://www.ombreeluci.it/1993/imparando-a-vivere-bene-con-jimmy-2-parte/",
          "http://www.ombreeluci.it/1993/dialogo-aperto-n-44/",
          "http://www.ombreeluci.it/1993/vita-di-fede-e-luce-n-44/",
          "http://www.ombreeluci.it/1993/proviamo-unaltra-volta-proviamo-unaltra-strada-sesso-e-affetto/",
          "http://www.ombreeluci.it/1993/e-nato-un-bambino-down-guida-per-i-genitori/",
          "http://www.ombreeluci.it/1993/appuntamento-con-maria-maddalena-dal-carcere-alla-vita-religiosa-la-testimonianza-delle-suore-di-betania/",
          "https://www.ombreeluci.it/1993/segni-di-speranza/",
          "https://www.ombreeluci.it/1993/florent-nella-scuola-italiana/",
          "https://www.ombreeluci.it/1993/costruire-la-capacita-di-sperare-in-un-ospedale-psichiatrico/",
          "https://www.ombreeluci.it/1993/due-piccole-isole-di-luce/",
          "https://www.ombreeluci.it/1993/la-fede-si-vive-cosi-si-impara/",
          "https://www.ombreeluci.it/1993/dare-loro-una-vita-normale/",
          "https://www.ombreeluci.it/1993/imparando-a-vivere-bene-con-jimmy-2-parte/",
          "https://www.ombreeluci.it/1993/proviamo-unaltra-volta-proviamo-unaltra-strada-sesso-e-affetto/",
          "https://www.ombreeluci.it/1993/dialogo-aperto-n-44/",
          "https://www.ombreeluci.it/1993/vita-di-fede-e-luce-n-44/",
          "https://www.ombreeluci.it/1993/e-nato-un-bambino-down-guida-per-i-genitori/",
          "https://www.ombreeluci.it/1993/appuntamento-con-maria-maddalena-dal-carcere-alla-vita-religiosa-la-testimonianza-delle-suore-di-betania/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-45",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 45,
        display_title: "Numero 45 \u2013 Dio cos\xEC lontano, cos\xEC vicino",
        titolo_numero: "Dio cos\xEC lontano, cos\xEC vicino",
        seo_description: "I genitori di un figlio disabile,",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 45 \u2013 Dio cos\xEC lontano, cos\xEC vicino Anno XII \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 1994",
        descrizione_ai: null,
        anno_pubblicazione: 1994,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_45_1994.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-45-dio-cosi-lontano-cosi-vicino/",
        canonical_url: "https://www.ombreeluci.it/project/numero-45-dio-cosi-lontano-cosi-vicino/",
        archive_org_item_id: "OmbreELuci_45",
        archive_view_url: "https://archive.org/details/OmbreELuci_45",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1994/perche-mi-hai-abbandonato/",
          "http://www.ombreeluci.it/1994/mi-sentii-tradita/",
          "http://www.ombreeluci.it/1994/ma-lui-dovera/",
          "http://www.ombreeluci.it/1994/a-scuola-con-chicco-in-braccio/",
          "http://www.ombreeluci.it/1994/la-fede-e-un-incontro/",
          "http://www.ombreeluci.it/1994/larmadio-dei-giocattoli/",
          "http://www.ombreeluci.it/1994/inaugurazione-casa-loic-scuola-laboratorio-artigianale-per-ragazzi-disabili/",
          "http://www.ombreeluci.it/1994/la-tenerezza-di-dio/",
          "http://www.ombreeluci.it/1994/educazione-alla-fede-per-tutti/",
          "http://www.ombreeluci.it/1994/dialogo-aperto-n-45/",
          "http://www.ombreeluci.it/1994/vita-fede-e-luci-n-45/",
          "http://www.ombreeluci.it/1994/proviamo-unaltra-volta-proviamo-unaltra-strada/",
          "http://www.ombreeluci.it/1994/psicologia-e-culto-di-se-la-psicologia-aiuta-a-credere/",
          "http://www.ombreeluci.it/1994/competere-col-dolore/",
          "http://www.ombreeluci.it/1994/il-mio-cielo-e-diverso-acrobazie-mentali-di-un-giovane-disabile/",
          "http://www.ombreeluci.it/1994/val-la-pena-di-vivere/",
          "https://www.ombreeluci.it/1994/perche-mi-hai-abbandonato/",
          "https://www.ombreeluci.it/1994/mi-sentii-tradita/",
          "https://www.ombreeluci.it/1994/ma-lui-dovera/",
          "https://www.ombreeluci.it/1994/a-scuola-con-chicco-in-braccio/",
          "https://www.ombreeluci.it/1994/la-fede-e-un-incontro/",
          "https://www.ombreeluci.it/1994/larmadio-dei-giocattoli/",
          "https://www.ombreeluci.it/1994/inaugurazione-casa-loic-scuola-laboratorio-artigianale-per-ragazzi-disabili/",
          "https://www.ombreeluci.it/1994/proviamo-unaltra-volta-proviamo-unaltra-strada/",
          "https://www.ombreeluci.it/1994/educazione-alla-fede-per-tutti/",
          "https://www.ombreeluci.it/1994/psicologia-e-culto-di-se-la-psicologia-aiuta-a-credere/",
          "https://www.ombreeluci.it/1994/competere-col-dolore/",
          "https://www.ombreeluci.it/1994/il-mio-cielo-e-diverso-acrobazie-mentali-di-un-giovane-disabile/",
          "https://www.ombreeluci.it/1994/val-la-pena-di-vivere/",
          "https://www.ombreeluci.it/1994/la-tenerezza-di-dio/",
          "https://www.ombreeluci.it/1994/vita-fede-e-luci-n-45/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-46",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 46,
        display_title: "Ombre e Luci n. 46",
        titolo_numero: "n. 46",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-48",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 48,
        display_title: "Numero 48 - Non vergognatevi di essere felici",
        titolo_numero: "Non vergognatevi di essere felici",
        seo_description: "Numero 48 \u2013 Non vergognatevi di essere felici",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 48 \u2013 Non vergognatevi di essere felici Anno XII \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 1994",
        descrizione_ai: null,
        anno_pubblicazione: 1994,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_48_1994.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-48-non-vergognatevi-di-essere-felici/",
        canonical_url: "https://www.ombreeluci.it/project/numero-48-non-vergognatevi-di-essere-felici/",
        archive_org_item_id: "OmbreELuci_48",
        archive_view_url: "https://archive.org/details/OmbreELuci_48",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1994/a-cena-in-famiglia/",
          "http://www.ombreeluci.it/1994/chiacchierata-in-famiglia-da-meditare/",
          "http://www.ombreeluci.it/1994/non-vergognatevi-di-essere-felici/",
          "http://www.ombreeluci.it/1994/avevo-tanta-paura/",
          "http://www.ombreeluci.it/1994/non-perdere-di-vista-enza/",
          "http://www.ombreeluci.it/1994/cercavo-di-far-cantare-il-mio-cuore/",
          "http://www.ombreeluci.it/1994/ma-noi-siamo-attori/",
          "http://www.ombreeluci.it/1994/cooperativa-il-trattore/",
          "http://www.ombreeluci.it/1994/associazione-il-cantiere/",
          "http://www.ombreeluci.it/1993/dialogo-aperto-n-48/",
          "http://www.ombreeluci.it/1994/vita-fede-e-luce-n-48/",
          "http://www.ombreeluci.it/1994/a-tu-per-tu-con-lautismo/",
          "http://www.ombreeluci.it/1994/mi-riguarda/",
          "http://www.ombreeluci.it/1994/volontariato-biblioteca-della-solidarieta/",
          "https://www.ombreeluci.it/1994/a-cena-in-famiglia/",
          "https://www.ombreeluci.it/1994/chiacchierata-in-famiglia-da-meditare/",
          "https://www.ombreeluci.it/1994/non-vergognatevi-di-essere-felici/",
          "https://www.ombreeluci.it/1994/avevo-tanta-paura/",
          "https://www.ombreeluci.it/1994/non-perdere-di-vista-enza/",
          "https://www.ombreeluci.it/1994/cercavo-di-far-cantare-il-mio-cuore/",
          "https://www.ombreeluci.it/1994/cooperativa-il-trattore/",
          "https://www.ombreeluci.it/1994/ma-noi-siamo-attori/",
          "https://www.ombreeluci.it/1994/associazione-il-cantiere/",
          "https://www.ombreeluci.it/1994/mi-riguarda/",
          "https://www.ombreeluci.it/1994/a-tu-per-tu-con-lautismo/",
          "https://www.ombreeluci.it/1994/volontariato-biblioteca-della-solidarieta/",
          "https://www.ombreeluci.it/1994/vita-fede-e-luce-n-48/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-49",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 49,
        display_title: "Numero 49 - Vita affettiva e sessuale: questo bisogno cos\xEC forte di amare e di essere amati",
        titolo_numero: "Vita affettiva e sessuale: questo bisogno cos\xEC forte di amare e di essere amati",
        seo_description: "Numero 49 \u2013 Vita affettiva e sessuale: questo bisogno cos\xEC forte di amare e di essere amati",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 49 \u2013 Vita affettiva e sessuale Anno XIII \u2013 Numero 48 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 1995",
        descrizione_ai: null,
        anno_pubblicazione: 1995,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_49_1995.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-49-vita-affettiva-e-sessuale-questo-bisogno-cosi-forte-di-amare-e-di-essere-amati/",
        canonical_url: "https://www.ombreeluci.it/project/numero-49-vita-affettiva-e-sessuale-questo-bisogno-cosi-forte-di-amare-e-di-essere-amati/",
        archive_org_item_id: "OmbreELuci_49",
        archive_view_url: "https://archive.org/details/OmbreELuci_49/",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1995/un-tema-difficile-e-delicato/",
          "http://www.ombreeluci.it/1995/domande-e-osservazioni-dei-genitori/",
          "http://www.ombreeluci.it/1995/leducazione-sessuale-delle-persone-handicappate/",
          "http://www.ombreeluci.it/1995/alleta-in-cui-si-cambia/",
          "http://www.ombreeluci.it/1995/come-dirti-come-spiegarti/",
          "http://www.ombreeluci.it/1995/dialogo-come-cura/",
          "http://www.ombreeluci.it/1995/voglio-sposarmi/",
          "http://www.ombreeluci.it/1995/un-seminario-speciale-il-coraggio-di-parlare-con-loro/",
          "http://www.ombreeluci.it/1995/centro-artigianale-di-bastia-umbra/",
          "http://www.ombreeluci.it/1993/dialogo-aperto-n-49/",
          "http://www.ombreeluci.it/1995/leducazione-sessuale-delle-persone-handicappate-un-libro-risponde/",
          "https://www.ombreeluci.it/1995/un-tema-difficile-e-delicato/",
          "https://www.ombreeluci.it/1995/domande-e-osservazioni-dei-genitori/",
          "https://www.ombreeluci.it/1995/leducazione-sessuale-delle-persone-handicappate/",
          "https://www.ombreeluci.it/1995/alleta-in-cui-si-cambia/",
          "https://www.ombreeluci.it/1995/come-dirti-come-spiegarti/",
          "https://www.ombreeluci.it/1995/dialogo-come-cura/",
          "https://www.ombreeluci.it/1995/leducazione-sessuale-delle-persone-handicappate-un-libro-risponde/",
          "https://www.ombreeluci.it/1995/voglio-sposarmi/",
          "https://www.ombreeluci.it/1995/un-seminario-speciale-il-coraggio-di-parlare-con-loro/",
          "https://www.ombreeluci.it/1995/centro-artigianale-di-bastia-umbra/",
          "https://www.ombreeluci.it/1995/dialogo-aperto-n-49/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-50",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 50,
        display_title: "Numero 50 \u2013 Fede e Luce 1975-1995",
        titolo_numero: "Fede e Luce 1975-1995",
        seo_description: "Numero 50 \u2013 Fede e Luce 1975-1995",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 50 \u2013 Fede e Luce 1975-1995 Anno XIII \u2013 Numero 2 \u2013 Aprile-Maggio-Giugno 1995",
        descrizione_ai: null,
        anno_pubblicazione: 1975,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile-Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_50_1995.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-50-fede-e-luce-1975-1995/",
        canonical_url: "https://www.ombreeluci.it/project/numero-50-fede-e-luce-1975-1995/",
        archive_org_item_id: "OmbreELuci_50",
        archive_view_url: "https://archive.org/details/OmbreELuci_50",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1995/per-dire-grazie/",
          "http://www.ombreeluci.it/1995/un-pellegrinaggio-di-ringraziamento/",
          "http://www.ombreeluci.it/1995/portate-fraternita-gioia-intelligenza-della-fede/",
          "http://www.ombreeluci.it/1995/dialogo-con-il-cardinale-martini/",
          "http://www.ombreeluci.it/1995/tu-ci-liberi-dal-male/",
          "http://www.ombreeluci.it/1995/dalla-tenebra-alla-luce/",
          "http://www.ombreeluci.it/1995/mi-ama-come-sono/",
          "http://www.ombreeluci.it/1995/io-ad-assisi/",
          "http://www.ombreeluci.it/2018/la-madre-di-davide/",
          "http://www.ombreeluci.it/1995/comunita-alloggio-la-torre/",
          "http://www.ombreeluci.it/1995/dialogo-aperto-n-50/",
          "http://www.ombreeluci.it/1995/carlo-gnocchi-gli-scritti-1934-1956/",
          "http://www.ombreeluci.it/1995/francesco-portatore-di-handicap-sorride-alla-vita/",
          "http://www.ombreeluci.it/1995/cera-una-volta-un-pescolino-rosso-e-paperottino/",
          "http://www.ombreeluci.it/1995/tra-il-cuore-e-la-mente/",
          "https://www.ombreeluci.it/1995/la-madre-di-davide/",
          "https://www.ombreeluci.it/1995/per-dire-grazie/",
          "https://www.ombreeluci.it/1995/un-pellegrinaggio-di-ringraziamento/",
          "https://www.ombreeluci.it/1995/portate-fraternita-gioia-intelligenza-della-fede/",
          "https://www.ombreeluci.it/1995/dialogo-con-il-cardinale-martini/",
          "https://www.ombreeluci.it/1995/il-cardinale-martini-risponde/",
          "https://www.ombreeluci.it/1995/tu-ci-liberi-dal-male/",
          "https://www.ombreeluci.it/1995/dalla-tenebra-alla-luce/",
          "https://www.ombreeluci.it/1995/mi-ama-come-sono/",
          "https://www.ombreeluci.it/1995/io-ad-assisi/",
          "https://www.ombreeluci.it/1995/dialogo-aperto-n-50/",
          "https://www.ombreeluci.it/1995/comunita-alloggio-la-torre/",
          "https://www.ombreeluci.it/1995/carlo-gnocchi-gli-scritti-1934-1956/",
          "https://www.ombreeluci.it/1995/francesco-portatore-di-handicap-sorride-alla-vita/",
          "https://www.ombreeluci.it/1995/tra-il-cuore-e-la-mente/",
          "https://www.ombreeluci.it/1995/cera-una-volta-un-pescolino-rosso-e-paperottino/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-51",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 51,
        display_title: "Numero 51 - Liberarsi dalla depressione",
        titolo_numero: "Liberarsi dalla depressione",
        seo_description: "Numero 51 \u2013 Liberarsi dalla depressione",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 51 \u2013 Liberarsi dalla depressione Anno XIII \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 1995",
        descrizione_ai: null,
        anno_pubblicazione: 1995,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_51_1995.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-51-liberarsi-dalla-depressione/",
        canonical_url: "https://www.ombreeluci.it/project/numero-51-liberarsi-dalla-depressione/",
        archive_org_item_id: "OmbreELuci_51",
        archive_view_url: "https://archive.org/details/OmbreELuci_51",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/1995/cinque-pani-e-due-pesci/",
          "http://www.ombreeluci.it/1995/depressione-chi-mi-libera/",
          "http://www.ombreeluci.it/1995/gioco-educativo-per-tutti-pensiamo-le-risposte/",
          "http://www.ombreeluci.it/1995/per-vivere-bene-con-le-persone-anziane/",
          "http://www.ombreeluci.it/1995/sport-e-musica-per-crescere/",
          "http://www.ombreeluci.it/1995/le-case-famiglia-gli-istituti-i-centri-esaminati-da-ombre-e-luci/",
          "http://www.ombreeluci.it/1995/dialogo-aperto-n-51/",
          "http://www.ombreeluci.it/1995/essere-adulti-essere-handicappati/",
          "http://www.ombreeluci.it/1995/diversi-da-chi-normali-vite-con-handicap/",
          "http://www.ombreeluci.it/1995/larte-di-costruire-giocattoli-creativi/",
          "https://www.ombreeluci.it/1986/tenere-la-porta-aperta/",
          "https://www.ombreeluci.it/1986/perche-ho-dato-una-mano/",
          "https://www.ombreeluci.it/1986/festa-in-casa-con-lui/",
          "https://www.ombreeluci.it/1986/tutto-quello-che-ha-fatto-per-noi/",
          "https://www.ombreeluci.it/1986/prepariamolo-vivere-con-gli-altri/",
          "https://www.ombreeluci.it/1986/lo-zio-jurgens/",
          "https://www.ombreeluci.it/1986/ora-che-sono-sola-non-sono-piu-sola/",
          "https://www.ombreeluci.it/1986/vederli-migliorare/",
          "https://www.ombreeluci.it/1986/convento-una-seconda-famiglia-per-giampiero/",
          "https://www.ombreeluci.it/1986/vivere-lultimo-istante/",
          "https://www.ombreeluci.it/1986/quando-arrivano-fatti-coraggio/",
          "https://www.ombreeluci.it/1986/come-i-cerchi-nellacqua/",
          "https://www.ombreeluci.it/1986/vita-fede-luce-n-16-corso-formazione-ilkley/",
          "https://www.ombreeluci.it/1986/dialogo-aperto-n-16/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-52",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 52,
        display_title: "Ombre e Luci n. 52",
        titolo_numero: "n. 52",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-53",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 53,
        display_title: "Ombre e Luci n. 53",
        titolo_numero: "n. 53",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-54",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 54,
        display_title: "Ombre e Luci n. 54",
        titolo_numero: "n. 54",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-55",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 55,
        display_title: "Ombre e Luci n. 55",
        titolo_numero: "n. 55",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-56",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 56,
        display_title: "Ombre e Luci n. 56",
        titolo_numero: "n. 56",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-57",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 57,
        display_title: "Ombre e Luci n. 57",
        titolo_numero: "n. 57",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-58",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 58,
        display_title: "Ombre e Luci n. 58",
        titolo_numero: "n. 58",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-59",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 59,
        display_title: "Ombre e Luci n. 59",
        titolo_numero: "n. 59",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-60",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 60,
        display_title: "Ombre e Luci n. 60",
        titolo_numero: "n. 60",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-61",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 61,
        display_title: "Ombre e Luci n. 61",
        titolo_numero: "n. 61",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-62",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 62,
        display_title: "Ombre e Luci n. 62",
        titolo_numero: "n. 62",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-63",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 63,
        display_title: "Ombre e Luci n. 63",
        titolo_numero: "n. 63",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-64",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 64,
        display_title: "Ombre e Luci n. 64",
        titolo_numero: "n. 64",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-65",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 65,
        display_title: "Ombre e Luci n. 65",
        titolo_numero: "n. 65",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-66",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 66,
        display_title: "Ombre e Luci n. 66",
        titolo_numero: "n. 66",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-67",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 67,
        display_title: "Ombre e Luci n. 67",
        titolo_numero: "n. 67",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-68",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 68,
        display_title: "Ombre e Luci n. 68",
        titolo_numero: "n. 68",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-69",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 69,
        display_title: "Numero 69 - La sua vita nelle mani dei genitori",
        titolo_numero: "La sua vita nelle mani dei genitori",
        seo_description: "Numero 69 \u2013 La sua vita nelle mani dei genitori",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 69 \u2013 La sua vita nelle mani dei genitori Anno XVIII \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2000",
        descrizione_ai: null,
        anno_pubblicazione: 2e3,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_69_2000.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-69-la-sua-vita-nelle-mani-dei-genitori/",
        canonical_url: "https://www.ombreeluci.it/project/numero-69-la-sua-vita-nelle-mani-dei-genitori/",
        archive_org_item_id: "OmbreELuciN_69",
        archive_view_url: "https://archive.org/details/OmbreELuciN_69",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2000/rosamaria/",
          "https://www.ombreeluci.it/2000/gli-siamo-grati-per-questo-la-testimonianza-dei-genitori-di-gianni/",
          "https://www.ombreeluci.it/2000/la-sete-e-lacqua-della-speranza/",
          "https://www.ombreeluci.it/2000/coraggio-immacolata/",
          "https://www.ombreeluci.it/2000/mettersi-in-gioco-la-solidarieta-secondo-silvia-tamberi/",
          "https://www.ombreeluci.it/2000/a-proposito-di-sentimenti-parliamo-del-film-di-daniele-segre-con-alcune-mamme-e-sorelle-di-ragazzi-down/",
          "https://www.ombreeluci.it/2000/villaggio-senza-barriere-un-luogo-di-accoglienza-insolito/",
          "https://www.ombreeluci.it/2000/liberi-di-vivere-come-tutti-prima-conferenza-nazionale-delle-politiche-sull-handicap/",
          "https://www.ombreeluci.it/2000/la-sofferenza/",
          "http://www.ombreeluci.it/1993/dialogo-aperto-n-69/",
          "http://www.ombreeluci.it/1993/vita-fede-e-luce-n-69/",
          "https://www.ombreeluci.it/2000/il-libro-di-johann-io-vi-ho-amati-tu-recensionetti/",
          "https://www.ombreeluci.it/2000/clara-va-al-mare-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-70",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 70,
        display_title: "Numero 70 - Quando la natura fa rivivere",
        titolo_numero: "Quando la natura fa rivivere",
        seo_description: 'Un numero "ecologico", tutto dedicato alla natura, alle piante, agli animali e al nostro pianeta terra: quante volte ci dimentichiamo di quanto \xE8 importante per noi e per la nostra salute fisica e mentale.',
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 70 \u2013 Quando la natura fa rivivere Anno XVIII \u2013 Numero 2 \u2013 Aprile \u2013 Maggio \u2013 Giugno 2000",
        descrizione_ai: null,
        anno_pubblicazione: 2e3,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_70_2000.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-70-quando-la-natura-fa-rivivere/",
        canonical_url: "https://www.ombreeluci.it/project/numero-70-quando-la-natura-fa-rivivere/",
        archive_org_item_id: "OmbreELuciN_70",
        archive_view_url: "https://archive.org/details/OmbreELuciN_70",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2000/quando-la-natura-da-rivivere/",
          "https://www.ombreeluci.it/2000/la-asl-va-in-montagna/",
          "https://www.ombreeluci.it/2000/pronto-soccorso-in-una-bottiglietta/",
          "https://www.ombreeluci.it/2000/cascina-rossago-un-bel-progetto-di-struttura-per-ragazzi-autistici/",
          "https://www.ombreeluci.it/2000/centro-di-riabilitazione-il-testardo-pet-therapy/",
          "https://www.ombreeluci.it/2000/dal-prato-alla-parete/",
          "https://www.ombreeluci.it/2000/il-profumo-della-menta/",
          "https://www.ombreeluci.it/2000/la-citta-di-leonia/",
          "https://www.ombreeluci.it/2000/la-nostra-parte/",
          "https://www.ombreeluci.it/2000/visto-con-il-cuore/",
          "https://www.ombreeluci.it/2000/dialogo-aperto-n-70/",
          "https://www.ombreeluci.it/2000/stramonio-recensione-libro/",
          "https://www.ombreeluci.it/2000/un-angelo-canta-blu-la-vera-storia-di-cecilia-recensione/",
          "https://www.ombreeluci.it/2000/pappagalli-verdi-cronache-di-un-chirurgo-di-guerra-recensione/",
          "https://www.ombreeluci.it/2000/itinerari-guida-annuario-accoglienza-cattolica-italia-2000-recensione/",
          "https://www.ombreeluci.it/2000/due-videocassette-utili-per-incontri-di-riflessione-e-di-preghiera/",
          "https://www.ombreeluci.it/2000/la-logica-dellutopia-quando-nacque-la-comunita-di-capodarco-recensione/",
          "https://www.ombreeluci.it/2000/cosicomesei-diario-di-bordo-di-un-neuropsichiatra-infantile-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-71",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 71,
        display_title: "Numero 71 - Accostarsi alla verit\xE0",
        titolo_numero: "Accostarsi alla verit\xE0",
        seo_description: "Un numero tosto dedicato a un tema enorme: la verit\xE0, di fronte alla quale non possiamo che rimanere umili e abbassare il capo come dice Mariangela nell'editoriale, e continuare a interrogarci col cuore e con la razionalit\xE0, come suggerisce Jean Vanier. Accostarsi alla verit\xE0 vuol dire fare i conti con se stessi, genitori e figli, ecco allora gli interventi sulla gestione della frustrazione nei confronti dei figli adolescenti e la paura per le scelte",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 71 \u2013 Accostarsi alla verit\xE0 Anno XVIII \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 2000",
        descrizione_ai: null,
        anno_pubblicazione: 2e3,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_71_2000.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-71-accostarsi-alla-verita/",
        canonical_url: "https://www.ombreeluci.it/project/numero-71-accostarsi-alla-verita/",
        archive_org_item_id: "OmbreELuciN_71",
        archive_view_url: "https://archive.org/details/OmbreELuciN_71",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2000/accostarsi-alla-verita/",
          "https://www.ombreeluci.it/2000/mio-figlio-mi-esaspera/",
          "https://www.ombreeluci.it/2000/dopo-la-scuola-dellobbligo-una-scelta-difficile/",
          "https://www.ombreeluci.it/2000/prova-a-capire-quel-che-non-dico/",
          "https://www.ombreeluci.it/2000/il-dono-di-un-volto/",
          "https://www.ombreeluci.it/2000/per-cercare-la-verita/",
          "https://www.ombreeluci.it/2000/le-a-della-vita-recensione-libro/",
          "https://www.ombreeluci.it/2000/un-giorno-dopo-laltro-recensione-libro/",
          "https://www.ombreeluci.it/2000/il-disabile-nella-societa-prospettive-di-integrazione-recensione-libro/",
          "https://www.ombreeluci.it/2000/dialogo-aperto-numero-71/",
          "https://www.ombreeluci.it/2000/la-rivincita-di-tommi/",
          "https://www.ombreeluci.it/2000/la-prima-notte-al-campeggio/",
          "https://www.ombreeluci.it/2000/gesu-basta-acqua/",
          "https://www.ombreeluci.it/2000/a-galla-sulla-camera-daria/",
          "https://www.ombreeluci.it/2000/si-chiude/",
          "https://www.ombreeluci.it/2000/hallo-welcome-hej-hallozik/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-72",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 72,
        display_title: "Numero 72 - Vi annuncio una grande gioia!",
        titolo_numero: "Vi annuncio una grande gioia!",
        seo_description: "Numero 72 \u2013 Vi annuncio una grande gioia!",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 72 \u2013 Vi annuncio una grande gioia! Anno XVIII \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 2000",
        descrizione_ai: null,
        anno_pubblicazione: 2e3,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_72_2000.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-72-vi-annuncio-una-grande-gioia/",
        canonical_url: "https://www.ombreeluci.it/project/numero-72-vi-annuncio-una-grande-gioia/",
        archive_org_item_id: "OmbreELuciN_72",
        archive_view_url: "https://archive.org/details/OmbreELuciN_72",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2000/un-natale-speciale/",
          "https://www.ombreeluci.it/2000/medici-o-stregoni/",
          "https://www.ombreeluci.it/2000/perche-non-ci-capiamo/",
          "https://www.ombreeluci.it/2000/nati-due-volte-estratto-libro-giuseppe-pontiggia/",
          "https://www.ombreeluci.it/2000/blessings-tutto-diventa-benedizione-estratto-dal-libro/",
          "https://www.ombreeluci.it/2000/nessuno-escluso-il-natale-del-laboratorio-lalveare/",
          "https://www.ombreeluci.it/2000/oggi-la-famiglia/",
          "https://www.ombreeluci.it/2000/casablu-un-condominio-speciale/",
          "https://www.ombreeluci.it/2000/nessuna-pieta-che-immagine-trasmettono-dellhandicap-i-mezzi-di-comunicazione-di-massa/",
          "https://www.ombreeluci.it/2000/la-tragedia-giovanni-chiara/",
          "https://www.ombreeluci.it/2000/tutto-e-possibile-lettera-di-chiara/",
          "https://www.ombreeluci.it/2000/dialogo-aperto-n-72/",
          "https://www.ombreeluci.it/2000/nostalgia-di-comunione-nuovi-movimenti-sette-cristiane-o-segni-dello-spirito/",
          "https://www.ombreeluci.it/2000/si-legge-tutto-dun-fiato-recensione-del-libro-blessings-di-mary-craig/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-73",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 73,
        display_title: "Numero 73 - Da un sentiero all'altro",
        titolo_numero: "Da un sentiero all'altro",
        seo_description: "Numero 73 \u2013",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 73 \u2013 Da un sentiero all\u2019altro Anno XIX \u2013 Numero I \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2001",
        descrizione_ai: null,
        anno_pubblicazione: 2001,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_73_2001.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-73-da-un-sentiero-allaltro/",
        canonical_url: "https://www.ombreeluci.it/project/numero-73-da-un-sentiero-allaltro/",
        archive_org_item_id: "OmbreELuciN_73",
        archive_view_url: "https://archive.org/details/OmbreELuciN_73",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2001/microgiustizia/",
          "https://www.ombreeluci.it/2001/come-separare-un-onda-dal-mare/",
          "https://www.ombreeluci.it/2001/larma-vincente-nella-mia-vita/",
          "https://www.ombreeluci.it/2001/quelle-ore-mi-hanno-segnata/",
          "https://www.ombreeluci.it/2001/mi-hanno-aperto-gli-occhi/",
          "https://www.ombreeluci.it/2001/quando-il-caso-non-e-un-caso/",
          "https://www.ombreeluci.it/2001/spesso-di-notte-in-silenzio/",
          "https://www.ombreeluci.it/2001/due-chiamate-speciali/",
          "https://www.ombreeluci.it/2001/domenica-pomeriggio/",
          "https://www.ombreeluci.it/2001/scout-a-lourdes/",
          "https://www.ombreeluci.it/2001/e-li-ci-hanno-accolto-con-gioia-la-storia-di-unadozione-particolare/",
          "https://www.ombreeluci.it/2001/dialogo-aperto-n-73/",
          "https://www.ombreeluci.it/2001/conoscere-lhadicap-la-sindrome-cri-du-chat/",
          "https://www.ombreeluci.it/2001/associazione-bambini-cri-du-chat/",
          "https://www.ombreeluci.it/2001/assistenza-disabili-in-179-stazioni-ferroviarie/",
          "https://www.ombreeluci.it/2001/poesie-per-francesca/",
          "https://www.ombreeluci.it/2001/catechesi-delle-persone-disabili/",
          "https://www.ombreeluci.it/2001/in-preparazione-del-pellegrinaggio-internazionale-a-lourdes-pasqua-12-16-aprile-2001/",
          "https://www.ombreeluci.it/2001/centro-del-libro-parlato/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-74",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 74,
        display_title: 'Numero 74 - "Invecchiando rivelo il mio carattere"',
        titolo_numero: '"Invecchiando rivelo il mio carattere"',
        seo_description: "Numero 74 \u2013 \u201CInvecchiando rivelo il mio carattere\u201D",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 74 \u2013 Invecchiando rivelo il mio carattere Anno XIX \u2013 Numero II \u2013 Aprile \u2013 Maggio \u2013 Giugno 2001",
        descrizione_ai: null,
        anno_pubblicazione: 2001,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_74_2001.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-74-invecchiando-rivelo-il-mio-carattere/",
        canonical_url: "https://www.ombreeluci.it/project/numero-74-invecchiando-rivelo-il-mio-carattere/",
        archive_org_item_id: "OmbreELuciN_74",
        archive_view_url: "https://archive.org/details/OmbreELuciN_74",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2001/la-presenza-dei-piu-piccoli/",
          "https://www.ombreeluci.it/2020/il-lavoro/",
          "https://www.ombreeluci.it/2001/cooperativa-sociale/",
          "https://www.ombreeluci.it/2001/una-cooperativa-sul-mare/",
          "https://www.ombreeluci.it/2001/spazio-aperto-una-cooperativa-di-servizi/",
          "https://www.ombreeluci.it/2001/il-mio-amico-carlo/",
          "https://www.ombreeluci.it/2001/quella-terza-preziosa-eta/",
          "https://www.ombreeluci.it/2001/zio-giorgio/",
          "https://www.ombreeluci.it/2001/mantenere-viva-la-giovinezza-nel-cuore/",
          "https://www.ombreeluci.it/2001/sto-invecchiando/",
          "https://www.ombreeluci.it/2001/progetto-calamaio/",
          "https://www.ombreeluci.it/2001/dialogo-aperto-n-74/",
          "https://www.ombreeluci.it/2001/non-ce-persona-piu-ricca-di-me-recensione-libro/",
          "https://www.ombreeluci.it/2001/il-piano-educativo-riabilitativo-individualizzato-per-il-disabile-mentale-adulto/",
          "https://www.ombreeluci.it/2001/la-forza-del-carattere-recensione-libro/",
          "https://www.ombreeluci.it/2001/il-lavoro/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-75",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 75,
        display_title: "Numero 75 - Vogliamo andare avanti?",
        titolo_numero: "Vogliamo andare avanti?",
        seo_description: "Numero 75 \u2013 Vogliamo andare avanti?",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 75 \u2013 Vogliamo andare avanti? Anno XIX \u2013 Numero III \u2013 Luglio \u2013 Agosto \u2013 Settembre 2001",
        descrizione_ai: null,
        anno_pubblicazione: 2001,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_75_2001.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-75-vogliamo-andare-avanti/",
        canonical_url: "https://www.ombreeluci.it/project/numero-75-vogliamo-andare-avanti/",
        archive_org_item_id: "OmbreELuciN_75",
        archive_view_url: "https://archive.org/details/OmbreELuciN_75",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2001/vogliamo-andare-avanti/",
          "https://www.ombreeluci.it/2001/autismo-e-comunicazione-facilitata-come-michele-e-uscito-dalla-sua-fortezza/",
          "https://www.ombreeluci.it/2001/parliamo-di-comunicazione-facilitata/",
          "https://www.ombreeluci.it/2001/fotoconcorso-i-piu-piccoli-a-lourdes/",
          "https://www.ombreeluci.it/2001/i-miei-piccoli-principi/",
          "https://www.ombreeluci.it/2001/i-condomini-solidali/",
          "https://www.ombreeluci.it/2001/paola-e-venuta-ad-abitare-con-noi-comunita-nicodemo/",
          "https://www.ombreeluci.it/2001/sottovento-un-film-da-vedere-recensione/",
          "https://www.ombreeluci.it/2001/grazie-ingrid-non-ti-dimenticheremo/",
          "https://www.ombreeluci.it/2001/dialogo-aperto-n-75/",
          "https://www.ombreeluci.it/2001/la-ragazza-porcospino-recensione-libro/",
          "https://www.ombreeluci.it/2001/parliamo-di-comunicazione-facilitata-intervista-francesca-benassi/",
          "https://www.ombreeluci.it/2001/handy-cup/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-76",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 76,
        display_title: "Numero 76 - Un natale difficile",
        titolo_numero: "Un natale difficile",
        seo_description: "Numero 76 \u2013 Un natale difficile",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 76 \u2013 Un natale difficile Anno XIX \u2013 Numero IV \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 2001",
        descrizione_ai: null,
        anno_pubblicazione: 2001,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_76_2001.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-76-un-natale-difficile/",
        canonical_url: "https://www.ombreeluci.it/project/numero-76-un-natale-difficile/",
        archive_org_item_id: "OmbreELuciN_76",
        archive_view_url: "https://archive.org/details/OmbreELuciN_76",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2001/e-si-accende-una-stella/",
          "https://www.ombreeluci.it/2001/la-lezione-di-un-clown-miloud-oukili",
          "https://www.ombreeluci.it/2001/la-locanda-dei-girasoli/",
          "https://www.ombreeluci.it/2001/per-un-natale-con-qualche-cosa-in-piu/",
          "https://www.ombreeluci.it/2001/comunita-il-roveto/",
          "https://www.ombreeluci.it/2001/un-dono-di-poesia-il-regalo-delle-quattro-amiche-della-comunita-il-roveto/",
          "https://www.ombreeluci.it/2001/noi-quattro-la-comunita-il-roveto/",
          "https://www.ombreeluci.it/2001/famiglie-una-riflessione-di-padre-roberti/",
          "https://www.ombreeluci.it/2001/stelle-doriente-qualche-immagine-dalle-comunita-fede-e-luce-del-medio-oriente/",
          "https://www.ombreeluci.it/2001/novita-per-lhandicap/",
          "https://www.ombreeluci.it/2001/lo-straniero/",
          "https://www.ombreeluci.it/2001/la-seconda-occasione-recensione-libro/",
          "https://www.ombreeluci.it/2001/la-bimba-delle-lumache-recensione-libro",
          "https://www.ombreeluci.it/2001/inno-alla-vita-recensione-libro/",
          "https://www.ombreeluci.it/2001/nessuno-bambino-nasce-cattivo-recensione-libro/",
          "https://www.ombreeluci.it/2001/la-lezione-di-un-clown-miloud-oukili/",
          "https://www.ombreeluci.it/2001/isolato-ma-immerso-nella-vita/",
          "https://www.ombreeluci.it/2001/centro-di-solidarieta-don-lorenzo-milani/",
          "https://www.ombreeluci.it/2001/la-bimba-delle-lumache-recensione-libro/",
          "https://www.ombreeluci.it/2001/dialogo-aperto-n-76/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-77",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 77,
        display_title: "Ombre e Luci n. 77",
        titolo_numero: "n. 77",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-78",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 78,
        display_title: "Ombre e Luci n. 78",
        titolo_numero: "n. 78",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-79",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 79,
        display_title: "Ombre e Luci n. 79",
        titolo_numero: "n. 79",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-80",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 80,
        display_title: "Ombre e Luci n. 80",
        titolo_numero: "n. 80",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-81",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 81,
        display_title: "Ombre e Luci n. 81",
        titolo_numero: "n. 81",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-82",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 82,
        display_title: "Ombre e Luci n. 82",
        titolo_numero: "n. 82",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-83",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 83,
        display_title: "Ombre e Luci n. 83",
        titolo_numero: "n. 83",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-84",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 84,
        display_title: "Ombre e Luci n. 84",
        titolo_numero: "n. 84",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-85",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 85,
        display_title: "Ombre e Luci n. 85",
        titolo_numero: "n. 85",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-86",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 86,
        display_title: "Ombre e Luci n. 86",
        titolo_numero: "n. 86",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-87",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 87,
        display_title: "Ombre e Luci n. 87",
        titolo_numero: "n. 87",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-88",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 88,
        display_title: "Ombre e Luci n. 88",
        titolo_numero: "n. 88",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-89",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 89,
        display_title: "Ombre e Luci n. 89",
        titolo_numero: "n. 89",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-90",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 90,
        display_title: "Ombre e Luci n. 90",
        titolo_numero: "n. 90",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-91",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 91,
        display_title: "Ombre e Luci n. 91",
        titolo_numero: "n. 91",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-92",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 92,
        display_title: "Ombre e Luci n. 92",
        titolo_numero: "n. 92",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-93",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 93,
        display_title: "Ombre e Luci n. 93",
        titolo_numero: "n. 93",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-94",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 94,
        display_title: "Ombre e Luci n. 94",
        titolo_numero: "n. 94",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-95",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 95,
        display_title: "Ombre e Luci n. 95",
        titolo_numero: "n. 95",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-96",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 96,
        display_title: "Ombre e Luci n. 96",
        titolo_numero: "n. 96",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-97",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 97,
        display_title: "Ombre e Luci n. 97",
        titolo_numero: "n. 97",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-98",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 98,
        display_title: "Ombre e Luci n. 98",
        titolo_numero: "n. 98",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-99",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 99,
        display_title: "Ombre e Luci n. 99",
        titolo_numero: "n. 99",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-100",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 100,
        display_title: "Ombre e Luci n. 100",
        titolo_numero: "n. 100",
        anno_pubblicazione: null,
        articoli_urls: [],
        articoli_ids: []
      },
      {
        id_numero: "OEL-101",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 101,
        display_title: "Numero 101 \u2013 Quando dall'incontro scaturisce la vita",
        titolo_numero: "Quando dall'incontro scaturisce la vita",
        seo_description: "Numero 101 \u2013 Quando dall\u2019incontro scaturisce la vita",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 101 \u2013 Quando dall\u2019incontro scaturisce la vita Anno 26 \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2008",
        descrizione_ai: null,
        anno_pubblicazione: 2008,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_101_2008.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-101-quando-dallincontro-scaturisce-la-vita/",
        canonical_url: "https://www.ombreeluci.it/project/numero-101-quando-dallincontro-scaturisce-la-vita/",
        archive_org_item_id: "OmbreELuciN_101",
        archive_view_url: "https://archive.org/details/OmbreELuciN_101",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2007/avvicinare-i-genitori-di-ragazzi-con-disabiltia/",
          "https://www.ombreeluci.it/2008/la-la-nostra-cresima/",
          "https://www.ombreeluci.it/2008/luomo-guarda-volto-dio-cuore/",
          "https://www.ombreeluci.it/2008/camminato-vicino-marco/",
          "https://www.ombreeluci.it/2008/tutti-bisogno-dei-sacramenti/",
          "https://www.ombreeluci.it/2007/ristorante-i-ragazzi-di-sipario-dove-niente-e-scontato/",
          "https://www.ombreeluci.it/2007/tra-il-dire-e-il-fare-non-ce-piu-il-mare/",
          "https://www.ombreeluci.it/2007/concorso-fotografico-legami/",
          "https://www.ombreeluci.it/2007/sbagliando-sinventa/",
          "https://www.ombreeluci.it/2007/invasioni-rumene-non-barbariche/",
          "https://www.ombreeluci.it/2007/immaginate/",
          "https://www.ombreeluci.it/2007/testimone-oculare/",
          "https://www.ombreeluci.it/2007/dialogo-aperto-n-101/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-102",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 102,
        display_title: "Numero 102 \u2013 Vite da riaccogliere",
        titolo_numero: "Vite da riaccogliere",
        seo_description: "Numero 102 \u2013 Vite",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 102 \u2013 Vite da riaccogliere Anno 26 \u2013 Numero 2 \u2013 Aprile \u2013 Maggio \u2013 Giugno 2008",
        descrizione_ai: null,
        anno_pubblicazione: 2008,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_102_2008.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-102-vite-da-riaccogliere/",
        canonical_url: "https://www.ombreeluci.it/project/numero-102-vite-da-riaccogliere/",
        archive_org_item_id: "OmbreELuciN_102",
        archive_view_url: "https://archive.org/details/OmbreELuciN_102",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2008/fin-dalla-nascita/",
          "https://www.ombreeluci.it/2008/adolescenti-allo-sbaraglio/",
          "https://www.ombreeluci.it/2008/la-citta-dei-ragazzi/",
          "https://www.ombreeluci.it/2023/casa-famiglia-il-tetto/",
          "https://www.ombreeluci.it/2008/una-scuolina-per-crescere/",
          "https://www.ombreeluci.it/2008/ii-focolare-comunita-educativo-terapeutica/",
          "https://www.ombreeluci.it/2008/vita-fede-e-luce-n-102-lincontro/",
          "https://www.ombreeluci.it/2008/chi-ha-visto-adriano/",
          "https://www.ombreeluci.it/2008/la-citta-dei-ragazzi-recensione/",
          "https://www.ombreeluci.it/2008/parlare-di-dio-ai-bambini-di-oggi-recensione/",
          "https://www.ombreeluci.it/2008/diario-di-scuola-recensione/",
          "https://www.ombreeluci.it/2008/lo-spazio-bianco-recensione/",
          "https://www.ombreeluci.it/2008/il-male-e-la-sofferenza-raccontati-ai-bambini-recensione/",
          "https://www.ombreeluci.it/2008/dialogo-aperto-n-102/",
          "https://www.ombreeluci.it/2008/casa-famiglia-il-tetto/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-103",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 103,
        display_title: "Numero 103 \u2013 Ci sono anch'io",
        titolo_numero: "Ci sono anch'io",
        seo_description: "Numero 103 \u2013 Ci sono anch\u2019io",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 103 \u2013 Ci sono anch\u2019io Anno 26 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 2008",
        descrizione_ai: null,
        anno_pubblicazione: 2008,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_103_2008.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-103-ci-sono-anchio/",
        canonical_url: "https://www.ombreeluci.it/project/numero-103-ci-sono-anchio/",
        archive_org_item_id: "OmbreELuciN_103",
        archive_view_url: "https://archive.org/details/OmbreELuciN_103",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2008/da-soli-non-si-puo/",
          "https://www.ombreeluci.it/2008/la-storia-di-giovanni/",
          "https://www.ombreeluci.it/2008/associazione-habitat-per-lautismo-onlus/",
          "https://www.ombreeluci.it/2008/jean-vanier-racconta-la-comunita-di-san-martino/",
          "https://www.ombreeluci.it/2008/sono-un-africano/",
          "https://www.ombreeluci.it/2008/la-casa-di-dario-comunita-alloggio/",
          "https://www.ombreeluci.it/2008/ecco-io-faccio-nuove-tutte-le-cose/",
          "https://www.ombreeluci.it/2008/perche-proprio-io/",
          "https://www.ombreeluci.it/2008/gli-anni-che-passano/",
          "https://www.ombreeluci.it/2008/la-solitudine-dei-numeri-primi-recensione/",
          "https://www.ombreeluci.it/2008/integrazione-del-disabile-radici-e-prospettive-educative-recensione/",
          "https://www.ombreeluci.it/2008/mio-figlio-un-angelo-che-ha-scelto-di-vivere-recensione/",
          "https://www.ombreeluci.it/2008/il-mondo-di-sergio-una-storia-vera-dei-nostri-giorni-recensione/",
          "https://www.ombreeluci.it/2008/le-anime-semplici-recensione/",
          "https://www.ombreeluci.it/2008/la-stanza-degli-ufficiali-recensione/",
          "https://www.ombreeluci.it/2008/dialogo-aperto-n-103/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-104",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 104,
        display_title: "Numero 104 \u2013 Chi accoglie uno dei miei piccoli...",
        titolo_numero: "Chi accoglie uno dei miei piccoli...",
        seo_description: "Numero 104 \u2013 Chi accoglie uno dei miei piccoli\u2026",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 104 \u2013 Chi accoglie uno dei miei piccoli\u2026 Anno 26 \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 2008",
        descrizione_ai: null,
        anno_pubblicazione: 2008,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_104_2008.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-104-chi-accoglie-uno-dei-miei-piccoli/",
        canonical_url: "https://www.ombreeluci.it/project/numero-104-chi-accoglie-uno-dei-miei-piccoli/",
        archive_org_item_id: "OmbreELuciN_104",
        archive_view_url: "https://archive.org/details/OmbreELuciN_104",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2023/philippine/",
          "https://www.ombreeluci.it/2008/presenza-reale/",
          "https://www.ombreeluci.it/2008/sono-un-pellegrino/",
          "https://www.ombreeluci.it/2008/quel-tesoro-nascosto/",
          "https://www.ombreeluci.it/2008/apadest-associazione-piemontese-amici-della-sindrome-di-turner-una-grande-sorpresa/",
          "https://www.ombreeluci.it/2008/un-luogo-dove-bello-vivere/",
          "https://www.ombreeluci.it/2023/carugate-a-catechismo-con-gli-amici-disabili/",
          "https://www.ombreeluci.it/2008/non-una-santa/",
          "https://www.ombreeluci.it/2008/tanti-volti-tante-lingue-un-solo-cuore/",
          "https://www.ombreeluci.it/2008/i-fraticelli/",
          "https://www.ombreeluci.it/2008/la-vita-e-una-sfida-recensione/",
          "https://www.ombreeluci.it/2008/sessualita-come-viverla-con-la-propria-disabilita/",
          "https://www.ombreeluci.it/2008/eros-e-disabili-riflessioni-e-testimonianze/",
          "https://www.ombreeluci.it/2023/gli-errori-di-mamma-e-papa-guida-pratica-per-non-sbagliare-piu/",
          "https://www.ombreeluci.it/2008/dialogo-aperto-n-104/",
          "https://www.ombreeluci.it/2021/philippine/",
          "https://www.ombreeluci.it/2008/il-paese-delle-meraviglie/",
          "https://www.ombreeluci.it/2008/carugate-a-catechismo-con-gli-amici-disabili/",
          "https://www.ombreeluci.it/2008/vegliate-con-me-hospice-unispirazione-per-la-cura-della-vita-recensione/",
          "https://www.ombreeluci.it/2008/gli-errori-di-mamma-e-papa-guida-pratica-per-non-sbagliare-piu/",
          "https://www.ombreeluci.it/2008/la-forza-di-una-vita-fragile-storia-di-una-bambina-che-non-doveva-nascere/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-105",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 105,
        display_title: "Numero 105 \u2013 Fratelli e sorelle",
        titolo_numero: "Fratelli e sorelle",
        seo_description: "Numero 105 \u2013 Fratelli e sorelle",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 105 \u2013 Fratelli e sorelle Anno 27 \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2009",
        descrizione_ai: null,
        anno_pubblicazione: 2009,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_105_2009.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-105-fratelli-e-sorelle/",
        canonical_url: "https://www.ombreeluci.it/project/numero-105-fratelli-e-sorelle/",
        archive_org_item_id: "OmbreELuciN_105",
        archive_view_url: "https://archive.org/details/OmbreELuciN_105",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2009/un-fratello-aiutato-da-un-fratello-e-come-una-citta-fortificata/",
          "https://www.ombreeluci.it/2009/sono-responsabile-di-mio-fratello-disabile/",
          "https://www.ombreeluci.it/2009/il-carro-una-casa-sempre-piena-di-gente/",
          "https://www.ombreeluci.it/2009/eredita-e-figli-disabili-il-notaio-risponde/",
          "https://www.ombreeluci.it/2009/si-puo-fare-da-vicino-nessuno-e-normale/",
          "https://www.ombreeluci.it/2009/baby-xitter/",
          "https://www.ombreeluci.it/2009/momenti-difficili/",
          "https://www.ombreeluci.it/2009/cristo-con-gli-alpini-recensione/",
          "https://www.ombreeluci.it/2009/oscura-luminosissima-notte-recensione/",
          "https://www.ombreeluci.it/2009/i-ciechi-non-sognano-il-buio-vivere-con-successo-la-cecita-recensione/",
          "https://www.ombreeluci.it/2009/ora-sto-diventare-mamma/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-106",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 106,
        display_title: "Numero 106 \u2013 Il coraggio di osare",
        titolo_numero: "Il coraggio di osare",
        seo_description: "Numero 106 \u2013 Il coraggio di osare",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 106 \u2013 Il coraggio di osare Anno 27 \u2013 Numero 2 \u2013 Aprile \u2013 Maggio \u2013 Giugno 2009",
        descrizione_ai: null,
        anno_pubblicazione: 2009,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_106_2009.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-106-il-coraggio-di-osare/",
        canonical_url: "https://www.ombreeluci.it/project/numero-106-il-coraggio-di-osare/",
        archive_org_item_id: "OmbreELuciN_106",
        archive_view_url: "https://archive.org/details/OmbreELuciN_106",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2009/il-coraggio-di-osare/",
          "https://www.ombreeluci.it/2009/piccoli-passi-in-sicurezza/",
          "https://www.ombreeluci.it/2009/giulia-in-arte-clown-cicciola/",
          "https://www.ombreeluci.it/2009/dimitri-il-teatro-fra-sogni-e-progettualita/",
          "https://www.ombreeluci.it/2009/vivere-i-miei-limiti-nella-verita/",
          "https://www.ombreeluci.it/2009/nomen-omen-la-storia-di-cristina-acquistapace/",
          "https://www.ombreeluci.it/2009/eppure-splende-il-sole/",
          "https://www.ombreeluci.it/2009/sotto-i-riflettori-sempre-senza-protesi/",
          "https://www.ombreeluci.it/2009/sotto-lombrellone/",
          "https://www.ombreeluci.it/2009/coralmente-le-voci-dellanima/",
          "https://www.ombreeluci.it/2009/ritardo-mentale-nelle-malattie-genetiche-la-ricerca-di-una-possibilie-cura/",
          "https://www.ombreeluci.it/2009/rosa/",
          "https://www.ombreeluci.it/2009/dialogo-aperto-n-106/",
          "https://www.ombreeluci.it/2009/il-resto-parziale-della-storia-recensione/",
          "https://www.ombreeluci.it/2009/amore-caro-a-filo-doppio-con-persone-fragili-recensione/",
          "https://www.ombreeluci.it/2009/quel-puntino-un-po-sfrangiato-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-107",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 107,
        display_title: "Numero 107 \u2013 Posso anch'io fare scout?",
        titolo_numero: "Posso anch'io fare scout?",
        seo_description: "Numero 107 \u2013 Posso anch\u2019io fare scout?",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 107 \u2013 Posso anch\u2019io fare scout? Anno 27 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 2009",
        descrizione_ai: null,
        anno_pubblicazione: 2009,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_107_2009.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-107-posso-anchio-fare-scout/",
        canonical_url: "https://www.ombreeluci.it/project/numero-107-posso-anchio-fare-scout/",
        archive_org_item_id: "OmbreELuciN_107",
        archive_view_url: "https://archive.org/details/OmbreELuciN_107",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2009/lettera-aperta-a-una-maestra/",
          "https://www.ombreeluci.it/2009/scout-e-disabilita-un-buon-modo-per-crescere/",
          "https://www.ombreeluci.it/2009/scout-e-disabilita-un-ambiente-educativo-anche-per-maria/",
          "https://www.ombreeluci.it/2009/per-me-lo-scoutismo/",
          "https://www.ombreeluci.it/2009/un-incontro-tra-capi-scout/",
          "https://www.ombreeluci.it/2009/lettera-ai-compagni-di-classe-di-matteo/",
          "https://www.ombreeluci.it/2009/disturbi-dellapprendimento-una-bambina-disprattica/",
          "https://www.ombreeluci.it/2009/disturbi-dellapprendimento-etichettato-idiota/",
          "https://www.ombreeluci.it/2009/disturbi-dellapprendimento-ho-scoperto-la-sofferenza-dei-miei-figli/",
          "https://www.ombreeluci.it/2009/disturbi-dellapprendimento-qual-e-il-vero-marco/",
          "https://www.ombreeluci.it/2009/la-difficile-storia-di-enrico/",
          "https://www.ombreeluci.it/2009/verso-sera/",
          "https://www.ombreeluci.it/2009/fede-e-luce-si-cambia/",
          "https://www.ombreeluci.it/2009/la-vita-come-e-per-noi-un-padre-una-famiglia-e-un-bambino-speciale-recensione/",
          "https://www.ombreeluci.it/2009/mamme-che-amano-troppo-per-non-crescere-piccoli-tiranni-e-figli-bamboccioni-recensioni/",
          "https://www.ombreeluci.it/2009/aragoste-e-frattali/",
          "https://www.ombreeluci.it/2009/un-sorriso-e-ancora-li-sulla-mia-faccia/",
          "https://www.ombreeluci.it/2009/dialogo-aperto-n-107/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-108",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 108,
        display_title: "Numero 108 \u2013 Saper accogliere",
        titolo_numero: "Saper accogliere",
        seo_description: "Numero 108 \u2013 Saper accogliere",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 108 \u2013 Saper accogliere Anno 27 \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 2009",
        descrizione_ai: null,
        anno_pubblicazione: 2009,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_108_2009.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-108-saper-accogliere/",
        canonical_url: "https://www.ombreeluci.it/project/numero-108-saper-accogliere/",
        archive_org_item_id: "OmbreELuciN.108",
        archive_view_url: "https://archive.org/details/OmbreELuciN.108",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2009/pensando-alla-nascita-di-gesu/",
          "https://www.ombreeluci.it/2009/riflessi-di-luce-nellombra/",
          "https://www.ombreeluci.it/2009/lintimita-del-corpo-maria-non-ha-il-senso-del-pudore/",
          "https://www.ombreeluci.it/2009/lintimita-del-corpo-condividere-lintimita-del-proprio-figlio/",
          "https://www.ombreeluci.it/2009/lintimita-del-corpo-di-fronte-alla-nudita-non-e-facile/",
          "https://www.ombreeluci.it/2009/vita-tra-fratelli/",
          "https://www.ombreeluci.it/2009/come-il-ferro-con-la-calamita/",
          "https://www.ombreeluci.it/2009/la-disabilita-dellinformazione/",
          "https://www.ombreeluci.it/2009/ricordo-di-alda-merini/",
          "https://www.ombreeluci.it/2009/dialogo-aperto-n-108/",
          "https://www.ombreeluci.it/2009/niente-giochi-nellacquario/",
          "https://www.ombreeluci.it/2009/in-cerca-del-padre-storia-delleta-paterna-in-eta-contemporanea-recensione/",
          "https://www.ombreeluci.it/2009/la-musica-segreta-della-terra-recensione/",
          "https://www.ombreeluci.it/2009/contro-leutanasia-recensione/",
          "https://www.ombreeluci.it/2009/ma-io-che-centro-il-bene-comune-in-tempi-di-crisi-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-109",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 109,
        display_title: "Numero 109 \u2013 Essere mamma",
        titolo_numero: "Essere mamma",
        seo_description: "Numero 109 \u2013 Essere mamma",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 109 \u2013 Essere mamma Anno 28 \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2010",
        descrizione_ai: null,
        anno_pubblicazione: 2010,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_109_2010.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-109-essere-mamma/",
        canonical_url: "https://www.ombreeluci.it/project/numero-109-essere-mamma/",
        archive_org_item_id: "OmbreELuciN_109",
        archive_view_url: "https://archive.org/details/OmbreELuciN_109",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2010/essere-mamma/",
          "https://www.ombreeluci.it/2010/essere-mamma-sono-in-un-furioso-stato-di-accusa/",
          "https://www.ombreeluci.it/2010/essere-mamma-che-senso-ha-la-vita-di-mio-figlio-paolo/",
          "https://www.ombreeluci.it/2010/un-crocifisso-silenzioso-immagine-della-rivoluzione-cristiana/",
          "https://www.ombreeluci.it/2010/deboli-e-forti-trovano-il-loro-posto/",
          "https://www.ombreeluci.it/2010/c-era-una-volta-la-citta-dei-matti/",
          "https://www.ombreeluci.it/2010/special-olympics-dove-tutto-e-diverso-da-tutto/",
          "https://www.ombreeluci.it/2010/tutti-tranne-uno-sono-saliti-a-cavallo-scuderia-le-forne/",
          "https://www.ombreeluci.it/2010/quali-mani-asciugheranno-le-mie-lacrime-recensione/",
          "https://www.ombreeluci.it/2010/con-cristo-sulle-strade-del-mondo-riflessioni-a-tema-missionario-recensione/",
          "https://www.ombreeluci.it/2010/tre-tazze-di-te-recensione/",
          "https://www.ombreeluci.it/2010/nuovo-dizionario-disabilita-handicap-riabilitazione-recensione/",
          "https://www.ombreeluci.it/2010/pulce-non-ce-recensione/",
          "https://www.ombreeluci.it/2009/dialogo-aperto-n-108/",
          "https://www.ombreeluci.it/2010/lo-sapevate-che/",
          "https://www.ombreeluci.it/2010/vita-fede-e-luce-n-109-eillaboun-a-casa-di-sammanher/",
          "https://www.ombreeluci.it/2010/senso-la-vita-paolo/",
          "https://www.ombreeluci.it/2010/dialogo-aperto-n-109/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-110",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 110,
        display_title: "Numero 110 \u2013 L'incanto della natura",
        titolo_numero: "L'incanto della natura",
        seo_description: "Numero 110 \u2013 L\u2019incanto della natura",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 110 \u2013 L\u2019incanto della natura Anno 28 \u2013 Numero 2 \u2013 Aprile \u2013 Maggio \u2013 Giugno 2010",
        descrizione_ai: null,
        anno_pubblicazione: 2010,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_110_2010.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-110-lincanto-della-natura/",
        canonical_url: "https://www.ombreeluci.it/project/numero-110-lincanto-della-natura/",
        archive_org_item_id: "OmbreELuciN_110",
        archive_view_url: "https://archive.org/details/OmbreELuciN_110",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2010/il-suo-primo-grido-fu-di-gioia/",
          "https://www.ombreeluci.it/2010/dossiermangiar-sano-dormire-bene-atura/",
          "https://www.ombreeluci.it/2010/cani-pony-leoni-marini/",
          "https://www.ombreeluci.it/2010/affettivita-sessualita-persone-disabili/",
          "https://www.ombreeluci.it/2010/e-legittima-l-assistenza-sessuale-alle-persone-handicappate/",
          "https://www.ombreeluci.it/2010/il-giradino-dei-desideri/",
          "https://www.ombreeluci.it/2010/mai-soli-dal-sogno-alla-promessa/",
          "https://www.ombreeluci.it/2010/lo-sapevate-che-2/",
          "https://www.ombreeluci.it/2010/silenzio/",
          "https://www.ombreeluci.it/2010/dialogo-aperto-n-110/",
          "https://www.ombreeluci.it/2010/inizio-dellanno-della-tigre/",
          "https://www.ombreeluci.it/2010/la-terza-nazione-del-mondo-recensione/",
          "https://www.ombreeluci.it/2010/cortocircuito-recensione/",
          "https://www.ombreeluci.it/2010/sembrava-impossibile-dove-osano-le-aquile-in-carrozzina-recensione/",
          "https://www.ombreeluci.it/2010/sotto-cieli-noncuranti-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-111",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 111,
        display_title: "Numero 111 \u2013 Cammina al mio fianco e sii mio amico",
        titolo_numero: "Cammina al mio fianco e sii mio amico",
        seo_description: "Numero 111 \u2013 Cammina al mio fianco e sii mio amico",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 111 \u2013 Cammina al mio fianco e sii mio amico Anno 29 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 2010",
        descrizione_ai: null,
        anno_pubblicazione: 2010,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_111_2010.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-111-cammina-al-mio-fianco-e-sii-mio-amico/",
        canonical_url: "https://www.ombreeluci.it/project/numero-111-cammina-al-mio-fianco-e-sii-mio-amico/",
        archive_org_item_id: "OmbreELuciN_111",
        archive_view_url: "https://archive.org/details/OmbreELuciN_111/",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2010/non-ne-sapevamo-niente/",
          "https://www.ombreeluci.it/2010/lettera-a-jean-annik/",
          "https://www.ombreeluci.it/2010/il-sacerdote-uomo-di-compassione/",
          "https://www.ombreeluci.it/2010/sei-lagnello-e-il-pastore/",
          "https://www.ombreeluci.it/2010/lui-la-guida-degli-uomini-e-rimasto-indietro-per-me/",
          "https://www.ombreeluci.it/2010/tutti-sulla-strada/",
          "https://www.ombreeluci.it/2010/20-anni-del-carro/",
          "https://www.ombreeluci.it/2010/due-vocazioni/",
          "https://www.ombreeluci.it/2010/come-una-poesia-che-ti-piace/",
          "https://www.ombreeluci.it/2010/aiutami-a-fare-da-me/",
          "https://www.ombreeluci.it/2010/se-volete-veder-le-stelle-spegnete-i-vostri-lumi/",
          "https://www.ombreeluci.it/2010/il-coraggio-della-piccola-vanessa/",
          "https://www.ombreeluci.it/2010/visto-da-vicino/",
          "https://www.ombreeluci.it/2010/vita-fede-e-luce-n-110/",
          "https://www.ombreeluci.it/2010/dialogo-aperto-n-111/",
          "https://www.ombreeluci.it/2010/quando-impari-ad-allacciarti-le-scarpe-recensione/",
          "https://www.ombreeluci.it/2010/e-la-luna-mi-guardo-recensione/",
          "https://www.ombreeluci.it/2010/costruirsi-un-totem-capire-e-sentire-il-proprio-valore-recensione/",
          "https://www.ombreeluci.it/2010/vite-parallele-viaggio-umano-nel-mondo-dellhandicap-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-112",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 112,
        display_title: "Numero 112 \u2013 Sul far della sera",
        titolo_numero: "Sul far della sera",
        seo_description: "Numero 112 \u2013 Sul far della sera",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 112 \u2013 Sul far della sera Anno 28 \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 2010",
        descrizione_ai: null,
        anno_pubblicazione: 2010,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_112_2010.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-112-sul-far-della-sera/",
        canonical_url: "https://www.ombreeluci.it/project/numero-112-sul-far-della-sera/",
        archive_org_item_id: "OmbreELuciN_112",
        archive_view_url: "https://archive.org/details/OmbreELuciN_112",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2010/un-augurio-speciale/",
          "https://www.ombreeluci.it/2010/coltivare-propri-desideri/",
          "https://www.ombreeluci.it/2010/corsa-in-taxi/",
          "https://www.ombreeluci.it/2010/per-una-vera-qualita-di-cura-delle-persone-anziane/",
          "https://www.ombreeluci.it/2010/per-rompere-la-solitudine-2/",
          "https://www.ombreeluci.it/2010/io-non-voglio-estranei-in-casa/",
          "https://www.ombreeluci.it/2010/parole-per-persone-grandi/",
          "https://www.ombreeluci.it/2010/la-mia-africa/",
          "https://www.ombreeluci.it/2010/mamma-che-campo/",
          "https://www.ombreeluci.it/2010/guardie-del-corpo/",
          "https://www.ombreeluci.it/2010/alla-morte-del-papa-charles-restava-nascosto-sotto-il-tavolo/",
          "https://www.ombreeluci.it/2010/lettere-a-jean-paul-gilbert/",
          "https://www.ombreeluci.it/2010/dialogo-aperto-n-112/",
          "https://www.ombreeluci.it/2010/perdersi-recensione/",
          "https://www.ombreeluci.it/2010/ricordi-di-mia-madre-recensione/",
          "https://www.ombreeluci.it/2010/tutta-la-vita-davanti-dedicato-a-chi-vive-la-terza-e-quarta-eta-recensione/",
          "https://www.ombreeluci.it/2010/paure-della-vecchiaia/",
          "https://www.ombreeluci.it/2010/charles-restava-nascosto-sotto-il-tavolo/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-113",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 113,
        display_title: "Numero 113 - Muoviti con chi non pu\xF2 muoversi",
        titolo_numero: "Muoviti con chi non pu\xF2 muoversi",
        seo_description: "Numero 113 \u2013 Muoviti con chi non pu\xF2 muoversi",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 113 \u2013 Muoviti con chi non pu\xF2 muoversi Anno 29 \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2011",
        descrizione_ai: null,
        anno_pubblicazione: 2011,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_113_2011.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-113-muoviti-con-chi-non-puo-muoversi/",
        canonical_url: "https://www.ombreeluci.it/project/numero-113-muoviti-con-chi-non-puo-muoversi/",
        archive_org_item_id: "OmbreELuciN_113",
        archive_view_url: "https://archive.org/details/OmbreELuciN_113",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2011/gaia-puccio-emanuela-e-molti-altri/",
          "https://www.ombreeluci.it/2011/vivere-con-la-distrofia-intervista-a-me/",
          "https://www.ombreeluci.it/2011/salve-sono-puccio/",
          "https://www.ombreeluci.it/2011/emanuela-e-alessia/",
          "https://www.ombreeluci.it/2011/vivere-con-la-distrofia-le-malattie-neuromuscolari/",
          "https://www.ombreeluci.it/2011/uildm-unione-italiana-lotta-alla-distrofia-muscolare/",
          "https://www.ombreeluci.it/2011/ladri-di-carrozzelle/",
          "https://www.ombreeluci.it/2011/dialogo-aperto-n-113/",
          "https://www.ombreeluci.it/2011/lettera-a-jean-natalia/",
          "https://www.ombreeluci.it/2011/pianeti-diversi/",
          "https://www.ombreeluci.it/2011/quando-ci-guardagno-gli-altri/",
          "https://www.ombreeluci.it/2011/vita-fede-e-luce-n-113/",
          "https://www.ombreeluci.it/2011/jean-vanier-risponde/",
          "https://www.ombreeluci.it/2011/la-pecora-nera-recensione-film/",
          "https://www.ombreeluci.it/2011/precious-recensione-film/",
          "https://www.ombreeluci.it/2011/una-sconfinata-giovinezza-recensione-film/",
          "https://www.ombreeluci.it/2011/uomini-di-dio-recensione-film/",
          "https://www.ombreeluci.it/2011/arturo-paoli-ne-valeva-la-pena-recensione/",
          "https://www.ombreeluci.it/2011/antonio-nicaso-mondadori/",
          "https://www.ombreeluci.it/2011/larte-di-dimenticare-recensione/",
          "https://www.ombreeluci.it/2011/disabilita-ed-eta-adulta-qualita-della-vita-e-progettualita-pedagogica-recensione/",
          "https://www.ombreeluci.it/2011/vita-fede-e-luce-la-festa-per-i-nostri-40-anni-1971-2011/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-114",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 114,
        display_title: "Numero 114 \u2013 Perch\xE9 non io?",
        titolo_numero: "Perch\xE9 non io?",
        seo_description: "Numero 114 \u2013 Perch\xE9 non io?",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 114 \u2013 Perch\xE9 non io? Anno 29 \u2013 Numero 2 \u2013 Aprile \u2013 Maggio Giugno 2011",
        descrizione_ai: null,
        anno_pubblicazione: 2011,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_114_2011.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-114-perche-non-io/",
        canonical_url: "https://www.ombreeluci.it/project/numero-114-perche-non-io/",
        archive_org_item_id: "OmbreELuciN_114",
        archive_view_url: "https://archive.org/details/OmbreELuciN_114/",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2011/perche-non-io/",
          "https://www.ombreeluci.it/2011/istantanea/",
          "https://www.ombreeluci.it/2011/tra-individualismo-e-impegno-i-giovani-hanno-bisogno-di-concretezza/",
          "https://www.ombreeluci.it/2011/lamicizia-asimmetrica/",
          "https://www.ombreeluci.it/2011/ndangwini-casa-dove-esiste-una-famiglia/",
          "https://www.ombreeluci.it/2011/un-sacco-di-felicita/",
          "https://www.ombreeluci.it/2011/oggi-sono-libero/",
          "https://www.ombreeluci.it/2011/volontariato-una-leva-per-la-vita/",
          "https://www.ombreeluci.it/2011/doposcuola-al-campo-rom/",
          "https://www.ombreeluci.it/2011/cose-da-fare-e-da-non-fare/",
          "https://www.ombreeluci.it/2011/10-buoni-motivi-per-fare-volontariato/",
          "https://www.ombreeluci.it/2011/1971-2011-fede-e-luce-festeggia-40-anni/",
          "https://www.ombreeluci.it/2011/storia-di-un-segreto-dio-mi-ha-parlato-tramite-i-miei-amici-speciali/",
          "https://www.ombreeluci.it/2011/fede-e-luce-e-subito-scatto-la-molla/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-115",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 115,
        display_title: "Numero 115 \u2013 Difendere la fragilit\xE0 di ognuno",
        titolo_numero: "Difendere la fragilit\xE0 di ognuno",
        seo_description: "Numero 115 \u2013 Difendere la fragilit\xE0 di ognuno",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 115 \u2013 Difendere la fragilit\xE0 di ognuno Anno 29 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 2011",
        descrizione_ai: null,
        anno_pubblicazione: 2011,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_115_2011.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-115-difendere-la-fragilita-di-ognuno/",
        canonical_url: "https://www.ombreeluci.it/project/numero-115-difendere-la-fragilita-di-ognuno/",
        archive_org_item_id: "OmbreELuciN_115",
        archive_view_url: "https://archive.org/details/OmbreELuciN_115/",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2011/quasi-non-li-riconoscevo/",
          "https://www.ombreeluci.it/2011/la-nostra-presenza-accanto-a-lei/",
          "https://www.ombreeluci.it/2011/tra-incontri-nel-riconoscimento-dellaltro-puoi-ritrovare-fiducia/",
          "https://www.ombreeluci.it/2011/per-il-rispetto-della-persona-sempre/",
          "https://www.ombreeluci.it/2011/le-bambine-africane-sono-una-festa-di-treccine/",
          "https://www.ombreeluci.it/2011/farsi-carico-degli-ultimi/",
          "https://www.ombreeluci.it/2011/posso-vivere-lssenziale-che-non-e-fare-per-ma-vivere-con-le-persone-piu-fragili/",
          "https://www.ombreeluci.it/2011/in-corsia/",
          "https://www.ombreeluci.it/2011/dialogo-aperto-n-115/",
          "https://www.ombreeluci.it/2011/vita-fede-e-luce-linizio-di-un-cammino/",
          "https://www.ombreeluci.it/2011/bioetica-come-storia-recensione/",
          "https://www.ombreeluci.it/2011/per-sempre-recensione/",
          "https://www.ombreeluci.it/2011/la-speranza-non-fa-rumore-recensione/",
          "https://www.ombreeluci.it/2011/il-linguaggio-segreto-dei-fiori-recensione/",
          "https://www.ombreeluci.it/2011/nessun-profitto-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-116",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 116,
        display_title: "Numero 116 \u2013 In cammino",
        titolo_numero: "In cammino",
        seo_description: "Numero 116 \u2013 In cammino",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 116 \u2013 In cammino\u2026 Anno 29 \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 2011",
        descrizione_ai: null,
        anno_pubblicazione: 2011,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_116_2011.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-116-in-cammino/",
        canonical_url: "https://www.ombreeluci.it/project/numero-116-in-cammino/",
        archive_org_item_id: "OmbreELuciN_116",
        archive_view_url: "https://archive.org/details/OmbreELuciN_116",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2011/giovani-eroi/",
          "https://www.ombreeluci.it/2011/lettere-a-jean-don-marco-bove-2/",
          "https://www.ombreeluci.it/2011/auguri-scomodi-per-il-nuovo-anno/",
          "https://www.ombreeluci.it/2011/la-grande-casa-di-peter-pan/",
          "https://www.ombreeluci.it/2011/julia-jean-e-la-tirannia-della-normalita/",
          "https://www.ombreeluci.it/2011/ci-chiedono-da-che-parte-stai/",
          "https://www.ombreeluci.it/2011/due-grandi-occhi-neri/",
          "https://www.ombreeluci.it/2011/nel-profondo-della-malattia-una-comunione-e-possibile/",
          "https://www.ombreeluci.it/2011/dialogo-aperto-n-116/",
          "https://www.ombreeluci.it/2011/messaggeri-di-gioia/",
          "https://www.ombreeluci.it/2011/tre-domande-ed-un-pellegrinaggio/",
          "https://www.ombreeluci.it/2011/con-lidea-di-non-andare/",
          "https://www.ombreeluci.it/2011/tempo-di-regali/",
          "https://www.ombreeluci.it/2011/avevano-spento-anche-la-luna-recensione/",
          "https://www.ombreeluci.it/2011/vizi-e-virtu-del-vivere-recensione/",
          "https://www.ombreeluci.it/2011/il-tempo-delle-donne-recensione/",
          "https://www.ombreeluci.it/2011/storia-di-un-uomo-ritratto-di-carlo-maria-martini-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-117",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 117,
        display_title: "Numero 117 \u2013 La presenza dei nonni",
        titolo_numero: "La presenza dei nonni",
        seo_description: "Numero 117 \u2013 La presenza dei nonni",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 117 \u2013 La presenza dei nonni Anno 30 \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2012",
        descrizione_ai: null,
        anno_pubblicazione: 2012,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_117_2012.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-117-la-presenza-dei-nonni/",
        canonical_url: "https://www.ombreeluci.it/project/numero-117-la-presenza-dei-nonni/",
        archive_org_item_id: "OmbreELuciN_117",
        archive_view_url: "https://archive.org/details/OmbreELuciN_117",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2012/i-nonni-una-tenerezza-in-piu/",
          "https://www.ombreeluci.it/2012/bella-di-nonna/",
          "https://www.ombreeluci.it/2012/emeric-una-tenerezza-che-non-sospettavo-di-avere/",
          "https://www.ombreeluci.it/2012/quando-vostro-nipote-vi-viene-affidato/",
          "https://www.ombreeluci.it/2012/due-nonne-blues-sisters-in-missione-per-conto-di-benedetta/",
          "https://www.ombreeluci.it/2012/dicono-di-loro/",
          "https://www.ombreeluci.it/2012/riscoprire-la-grazia-della-confessione/",
          "https://www.ombreeluci.it/2012/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
          "https://www.ombreeluci.it/2012/fede-e-luce-in-armenia-iran/",
          "https://www.ombreeluci.it/2012/fede-e-luce-in-iraq/",
          "https://www.ombreeluci.it/2012/un-ragazzo-ribelle/",
          "https://www.ombreeluci.it/2012/dialogo-aperto-n-117/",
          "https://www.ombreeluci.it/2012/voci-dal-silenzio-recensione/",
          "https://www.ombreeluci.it/2012/cosa-ti-manca-per-essere-felice-recensione/",
          "https://www.ombreeluci.it/2012/liguana-non-vuole-recensione/",
          "https://www.ombreeluci.it/2012/ziguli-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-118",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 118,
        display_title: "Numero 118 \u2013 Malattie rare",
        titolo_numero: "Malattie rare",
        seo_description: "Numero 118 \u2013 Malattie rare",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 118 \u2013 Malattie rare Anno 30 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 2012",
        descrizione_ai: null,
        anno_pubblicazione: 2012,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_118_2012.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-118-malattie-rare/",
        canonical_url: "https://www.ombreeluci.it/project/numero-118-malattie-rare/",
        archive_org_item_id: "OmbreELuciN_118",
        archive_view_url: "https://archive.org/details/OmbreELuciN_118",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2012/carissime-mamme/",
          "https://www.ombreeluci.it/2012/rarina-storia-di-un-fiore-raro/",
          "https://www.ombreeluci.it/2012/cosa-sono-le-malattie-rare/",
          "https://www.ombreeluci.it/2012/affrontare-lenorme-paura-intervista-a-pietro/",
          "https://www.ombreeluci.it/2012/sindrome-di-costello-la-storia-di-sandrino/",
          "https://www.ombreeluci.it/2012/larca-di-trosly/",
          "https://www.ombreeluci.it/2012/quasi-amici-recensione/",
          "https://www.ombreeluci.it/2012/pensioni-rubate/",
          "https://www.ombreeluci.it/2012/dialogo-aperto-n-118/",
          "https://www.ombreeluci.it/2012/segni-recensione/",
          "https://www.ombreeluci.it/2012/il-loro-sguardo-buca-le-nostre-ombre-recensione/",
          "https://www.ombreeluci.it/2012/famiglie-in-esilio-ferite-ritrovate-riconciliate-recensione/",
          "https://www.ombreeluci.it/2012/odoardo-focherini-un-giusto-fra-le-nazioni-recensione/",
          "https://www.ombreeluci.it/2012/franz-werfel-gallucci-editore-pp-722/",
          "https://www.ombreeluci.it/2012/il-vecchio-re-nel-suo-esilio-recensione/",
          "https://www.ombreeluci.it/2012/sara-e-le-sbiruline-di-emily-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-119",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 119,
        display_title: "Numero 119 \u2013 I volti della bellezza",
        titolo_numero: "I volti della bellezza",
        seo_description: "Numero 119 \u2013 I volti della bellezza",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 119 \u2013 I volti della bellezza Anno 30 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 2012",
        descrizione_ai: null,
        anno_pubblicazione: 2012,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_119_2012.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-119-i-volti-della-bellezza/",
        canonical_url: "https://www.ombreeluci.it/project/numero-119-i-volti-della-bellezza/",
        archive_org_item_id: "OmbreELuciN_119",
        archive_view_url: "https://archive.org/details/OmbreELuciN_119",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2012/bellezza-e-handicap/",
          "https://www.ombreeluci.it/2012/lettere-a-jean-matteo-mazzarotto/",
          "https://www.ombreeluci.it/2012/come-essere-vicini-allaltro/",
          "https://www.ombreeluci.it/2012/jean-vanier-dalla-palestina/",
          "https://www.ombreeluci.it/2012/cosa-rende-qualcuno-straordinario-intervista-a-nick-vujicic/",
          "https://www.ombreeluci.it/1995/quelli-piu-simili-a-lui/",
          "https://www.ombreeluci.it/2012/falsi-moralismi-sul-bello-di-essere-down/",
          "https://www.ombreeluci.it/2012/la-memoria-del-bello/",
          "https://www.ombreeluci.it/2012/mamma-sono-contento-di-essere-nato/",
          "https://www.ombreeluci.it/2012/fede-e-luce-una-fedelta-che-ridona-lentusiasmo/",
          "https://www.ombreeluci.it/2012/fede-e-luce-dalle-provincie/",
          "https://www.ombreeluci.it/2012/dialogo-aperto-n-119/",
          "https://www.ombreeluci.it/2012/se-ti-abbraccio-non-aver-paura-recensione/",
          "https://www.ombreeluci.it/2012/fai-bei-sogni-recensione/",
          "https://www.ombreeluci.it/2012/mani-calde-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-120",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 120,
        display_title: "Numero 120 \u2013 Aggiungi un posto... a casa",
        titolo_numero: "Aggiungi un posto... a casa",
        seo_description: "Numero 120 \u2013 Aggiungi un posto\u2026 a casa",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 120 \u2013 Aggiungi un posto\u2026 a casa Anno 30 \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 2012",
        descrizione_ai: null,
        anno_pubblicazione: 2012,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_120_2012.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-120-aggiungi-un-posto-a-casa/",
        canonical_url: "https://www.ombreeluci.it/project/numero-120-aggiungi-un-posto-a-casa/",
        archive_org_item_id: "OmbreELuciN_20",
        archive_view_url: "https://archive.org/details/OmbreELuciN_20",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_20/OeL-120.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2012/mai-piu-soli/",
          "https://www.ombreeluci.it/2012/un-vescovo-per-amico/",
          "https://www.ombreeluci.it/2012/superata-lultima-sala-daspetto/",
          "https://www.ombreeluci.it/2012/carissimo-cardinale/",
          "https://www.ombreeluci.it/2012/aggiungi-un-posto-a-casa-adozione-di-bambini-con-disabilita/",
          "https://www.ombreeluci.it/2012/la-nostra-scelta-di-cristina/",
          "https://www.ombreeluci.it/2012/posso-devo-voglio/",
          "https://www.ombreeluci.it/2012/si-chiama-sara/",
          "https://www.ombreeluci.it/2012/i-tuoi-figli/",
          "https://www.ombreeluci.it/2012/anoressia-fame-damore-e/",
          "https://www.ombreeluci.it/2012/la-parola-alle-mamme/",
          "https://www.ombreeluci.it/2012/speleologi-del-mistero-del-piccolo/",
          "https://www.ombreeluci.it/2012/dialogo-aperto-n-120/",
          "https://www.ombreeluci.it/2012/dalle-province/",
          "https://www.ombreeluci.it/2012/volevo-essere-una-farfalla-recensione/",
          "https://www.ombreeluci.it/2012/io-sono-qui-recensione/",
          "https://www.ombreeluci.it/2012/l-altra-famiglia-storie-e-percorsi-di-affido-al-villaggio-sos-recensione/",
          "https://www.ombreeluci.it/2012/la-figlia-dellaltra-recensione/",
          "https://www.ombreeluci.it/2012/il-vangelo-dei-vinti-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-121",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 121,
        display_title: "Numero 121 \u2013 Chiesa viva e vicina a tutti",
        titolo_numero: "Chiesa viva e vicina a tutti",
        seo_description: "Numero 121 \u2013 Chiesa viva e vicina a tutti",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 121 \u2013 Chiesa viva e vicina a tutti Anno 31 \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2013",
        descrizione_ai: null,
        anno_pubblicazione: 2013,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_121_2013.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-121-chiesa-viva-e-vicina-a-tutti/",
        canonical_url: "https://www.ombreeluci.it/project/numero-121-chiesa-viva-e-vicina-a-tutti/",
        archive_org_item_id: "OmbreELuciN_121",
        archive_view_url: "https://archive.org/details/OmbreELuciN_121",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_121/oel-121.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2013/cosi-e-sceso-dal-trono/",
          "https://www.ombreeluci.it/2013/prendetene-e-mangiatene-tutti/",
          "https://www.ombreeluci.it/2013/primavera-di-fede/",
          "https://www.ombreeluci.it/2013/una-comunita-e-essere-insieme/",
          "https://www.ombreeluci.it/2013/qualcuno-aspetta/",
          "https://www.ombreeluci.it/2013/bartimeo-uomo-solo-in-mezzo-alla-folla/",
          "https://www.ombreeluci.it/2013/jean-christophe-parisot-un-cercatore-di-dio/",
          "https://www.ombreeluci.it/2013/per-una-vita-di-comunione/",
          "https://www.ombreeluci.it/2013/intervista-a-jean-vanier/",
          "https://www.ombreeluci.it/2013/un-po-di-follia-per-fare-meraviglie/",
          "https://www.ombreeluci.it/2013/dialogo-aperto-n-121/",
          "https://www.ombreeluci.it/2013/fede-e-luce-dalle-province-n-121/",
          "https://www.ombreeluci.it/2013/mai-piu-soli-lavventura-di-fede-e-luce-recensione/",
          "https://www.ombreeluci.it/2013/da-citta-del-messico/",
          "https://www.ombreeluci.it/2013/viola-e-mimosa-da-citta-del-messico/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-122",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 122,
        display_title: "Numero 122 \u2013 Momenti difficili",
        titolo_numero: "Momenti difficili",
        seo_description: "Numero 122 \u2013 Momenti difficili",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 122 \u2013 Momenti difficili Anno 31 \u2013 Numero 2 \u2013 Aprile \u2013 Maggio \u2013 Giugno 2013",
        descrizione_ai: null,
        anno_pubblicazione: 2013,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_122_2013.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-122-momenti-difficili/",
        canonical_url: "https://www.ombreeluci.it/project/numero-122-momenti-difficili/",
        archive_org_item_id: "OmbreELuciN_122",
        archive_view_url: "https://archive.org/details/OmbreELuciN_122",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_122/oel-122.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2013/ora-basta/",
          "https://www.ombreeluci.it/2013/che-grinta/",
          "https://www.ombreeluci.it/2013/tra-paura-e-desiderio-di-sapere/",
          "https://www.ombreeluci.it/2013/nella-diagnosi-siamo-prudenti/",
          "https://www.ombreeluci.it/2013/il-tuo-bambino-ha-qualcosa-che-non-va/",
          "https://www.ombreeluci.it/2013/fratelli-e-sorelle-di-persone-con-disabilita/",
          "https://www.ombreeluci.it/2013/istituto-mio-dio/",
          "https://www.ombreeluci.it/2013/la-cura-invisibile-per-il-riconoscimento-dei-caregiver/",
          "https://www.ombreeluci.it/2013/anffas-ogni-persona-con-disabiltia-e-nostro-figlio/",
          "https://www.ombreeluci.it/2013/tu-sei-amato-da-dio-cosi-come-sei/",
          "https://www.ombreeluci.it/2013/dialogo-aperto-n-122/",
          "https://www.ombreeluci.it/2013/dalle-province-n-122/",
          "https://www.ombreeluci.it/2013/viola-e-mimosa-a-manila/",
          "https://www.ombreeluci.it/2013/chiamami-alex-recensione/",
          "https://www.ombreeluci.it/2013/chiudi-gli-occhi-e-guardami-vivere-la-disabilita-in-famiglia-recensione/",
          "https://www.ombreeluci.it/2013/una-notte-ho-sognato-che-parlavi-recensione/",
          "https://www.ombreeluci.it/2013/legoismo-e-finito-recensione/",
          "https://www.ombreeluci.it/2013/come-pinguini-nel-deserto-recensione/",
          "https://www.ombreeluci.it/2013/io-sono-nato-cosi-come-imparare-a-guardare-oltre-la-differenza-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-123",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 123,
        display_title: "Numero 123 \u2013 Non altro, non diversa, parte della vita",
        titolo_numero: "Non altro, non diversa, parte della vita",
        seo_description: "Numero 123 \u2013 Non altro, non diversa, parte della vita",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 123 \u2013 Non altro, non diversa, parte della vita Anno 31 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 2013",
        descrizione_ai: null,
        anno_pubblicazione: 2013,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_123_2013.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-123-non-altro-non-diversa-parte-della-vita/",
        canonical_url: "https://www.ombreeluci.it/project/numero-123-non-altro-non-diversa-parte-della-vita/",
        archive_org_item_id: "OmbreELuciN_123",
        archive_view_url: "https://archive.org/details/OmbreELuciN_123",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_123/OeL-123.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2013/si-ricomincia/",
          "https://www.ombreeluci.it/2013/dossier-scola-e-disabilita/",
          "https://www.ombreeluci.it/2013/la-mia-disavventura/",
          "https://www.ombreeluci.it/2013/ieri-oggi-domani/",
          "https://www.ombreeluci.it/2013/il-dilemma-della-valutazione/",
          "https://www.ombreeluci.it/2013/mia-madre/",
          "https://www.ombreeluci.it/2013/la-mia-vita-a-santa-palomba/",
          "https://www.ombreeluci.it/2013/7-idee-sulla-sindrome-di-down/",
          "https://www.ombreeluci.it/2013/un-coro-aperto-a-tutti/",
          "https://www.ombreeluci.it/2013/che-fanfara/",
          "https://www.ombreeluci.it/2013/fede-e-luce-tutti-a-leeds/",
          "https://www.ombreeluci.it/2013/dialogo-aperto-n-123/",
          "https://www.ombreeluci.it/2013/dalle-province-n-123/",
          "https://www.ombreeluci.it/2013/creatures-disconforts/",
          "https://www.ombreeluci.it/2013/cosa-fare-delle-nostre-ferite-recensione/",
          "https://www.ombreeluci.it/2013/un-dio-inutile-recensione/",
          "https://www.ombreeluci.it/2013/persone-prima-che-disabili-una-riflessione-sullhandicap-tra-giustizia-ed-etica-recensione/",
          "https://www.ombreeluci.it/2013/non-smettete-di-crederci-mai-recensione/",
          "https://www.ombreeluci.it/2013/dossier-scuola-e-disabilita/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-124",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 124,
        display_title: "Numero 124 \u2013 Con gioia, nel silenzio, vivere la pace",
        titolo_numero: "Con gioia, nel silenzio, vivere la pace",
        seo_description: "Numero 124 \u2013 Con gioia, nel silenzio, vivere la pace",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 124 \u2013 Con gioia, nel silenzio, vivere la pace Anno 31 \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 2013",
        descrizione_ai: null,
        anno_pubblicazione: 2013,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_124_2013.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-124-con-gioia-nel-silenzio-vivere-la-pace/",
        canonical_url: "https://www.ombreeluci.it/project/numero-124-con-gioia-nel-silenzio-vivere-la-pace/",
        archive_org_item_id: "OmbreELuciN_124",
        archive_view_url: "https://archive.org/details/OmbreELuciN_124/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_124/OeL-124.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2013/sempre-ci-commuove/",
          "https://www.ombreeluci.it/2013/lamicizia-incarnata/",
          "https://www.ombreeluci.it/2013/eccomi-lesempio-di-maria/",
          "https://www.ombreeluci.it/2013/speciale-natale-nel-mondo/",
          "https://www.ombreeluci.it/2013/merry-christmas/",
          "https://www.ombreeluci.it/2013/natale-brasile/",
          "https://www.ombreeluci.it/2013/natale-russia/",
          "https://www.ombreeluci.it/2013/joyeux-noel/",
          "https://www.ombreeluci.it/2013/natale-giappone/",
          "https://www.ombreeluci.it/2013/joyeux-noel-2/",
          "https://www.ombreeluci.it/2013/tutti-prescelti-lo-yoga-per-le-persone-disabili/",
          "https://www.ombreeluci.it/2013/respiro-dopo-respiro-lo-yoga-per-bambini-e-adolescenti-con-bisogni-speciali/",
          "https://www.ombreeluci.it/2013/una-storia-sacra/",
          "https://www.ombreeluci.it/2013/dialogo-aperto-n-124/",
          "https://www.ombreeluci.it/2013/dalle-province-124/",
          "https://www.ombreeluci.it/2013/le-mimose-di-yolanda/",
          "https://www.ombreeluci.it/2013/alto-come-un-vaso-di-gerani-recensione/",
          "https://www.ombreeluci.it/2013/wonder-recensione/",
          "https://www.ombreeluci.it/2013/un-castello-di-sabbia-storia-della-mia-vita-e-della-mia-schizofrenia-recensione/",
          "https://www.ombreeluci.it/2013/parole-in-liberta-diario-semiserio-della-madre-di-un-disabile-recensione/",
          "https://www.ombreeluci.it/2013/natale-slovenia/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-125",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 125,
        display_title: "Numero 125 \u2013 Rimbocchiamoci le maniche",
        titolo_numero: "Rimbocchiamoci le maniche",
        seo_description: "Numero 125 \u2013 Rimbocchiamoci le maniche",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 125 \u2013 Rimbocchiamoci le maniche Anno 32 \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2014",
        descrizione_ai: null,
        anno_pubblicazione: 2014,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_125_2014.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-125-rimbocchiamoci-le-maniche/",
        canonical_url: "https://www.ombreeluci.it/project/numero-125-rimbocchiamoci-le-maniche/",
        archive_org_item_id: "OmbreELuciN_125",
        archive_view_url: "https://archive.org/details/OmbreELuciN_125/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_125/oel-125.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2014/al-lavoro/",
          "https://www.ombreeluci.it/2014/artiste-nellorto/",
          "https://www.ombreeluci.it/2014/chopin-diversamente-impresa/",
          "https://www.ombreeluci.it/2014/germogli-diversi-arte-floreale-e-disabilita-la-bellezza-di-un-percorso-possibile/",
          "https://www.ombreeluci.it/2014/lemozione-non-voce/",
          "https://www.ombreeluci.it/2014/hotel-6-stelle/",
          "https://www.ombreeluci.it/2014/un-gioco-da-fare-quando-fuori-piove/",
          "https://www.ombreeluci.it/2014/viola-e-valeria/",
          "https://www.ombreeluci.it/2014/agli-antipodi-dellindividualismo/",
          "https://www.ombreeluci.it/2014/fede-e-luce-in-terra-santa/",
          "https://www.ombreeluci.it/2014/dialogo-aperto-n-125/",
          "https://www.ombreeluci.it/2014/dalle-province-n-125/",
          "https://www.ombreeluci.it/2014/la-caduta-i-ricordi-di-un-padre-in-424-passi-recensione/",
          "https://www.ombreeluci.it/2014/mamma-ti-posso-parlare/",
          "https://www.ombreeluci.it/2014/rico-oscar-e-il-ladro-ombra-recensione/",
          "https://www.ombreeluci.it/2014/chi-resta-deve-capire-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-126",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 126,
        display_title: "Numero 126 \u2013 Sulla sua strada...",
        titolo_numero: "Sulla sua strada...",
        seo_description: "Numero 126 \u2013 Sulla sua strada\u2026",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 126 \u2013 Sulla sua strada\u2026 Anno 32 \u2013 Numero 2 \u2013 Aprile \u2013 Maggio \u2013 Giugno 2014",
        descrizione_ai: null,
        anno_pubblicazione: 2014,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_126_2014.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-126-sulla-sua-strada/",
        canonical_url: "https://www.ombreeluci.it/project/numero-126-sulla-sua-strada/",
        archive_org_item_id: "OmbreELuciN_126",
        archive_view_url: "https://archive.org/details/OmbreELuciN_126/mode/1up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_126/oel-126.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2014/sulla-sua-strada/",
          "https://www.ombreeluci.it/2014/grazie-mariangela/",
          "https://www.ombreeluci.it/2014/argento-vivo/",
          "https://www.ombreeluci.it/2014/portatrice-di-un-messaggio/",
          "https://www.ombreeluci.it/2014/la-mia-lampada-frontale/",
          "https://www.ombreeluci.it/2014/volevo-che-qualcuno-rispondesse-alle-mie-domande/",
          "https://www.ombreeluci.it/2014/cristiani-del-sagrato/",
          "https://www.ombreeluci.it/2014/attivita-riabilitative-fiori-colori-e-profumi/",
          "https://www.ombreeluci.it/2014/un-capo-atipico-per-larca/",
          "https://www.ombreeluci.it/2014/viola-e-il-messico/",
          "https://www.ombreeluci.it/2014/lettera-di-jean-n-126/",
          "https://www.ombreeluci.it/2014/fede-e-luce-si-ci-siamo-anche-noi/",
          "https://www.ombreeluci.it/2014/dialogo-aperto-n-126/",
          "https://www.ombreeluci.it/2014/dalle-province-n-126/",
          "https://www.ombreeluci.it/2014/borderline-recensione/",
          "https://www.ombreeluci.it/2014/il-motivo-per-cui-salto-recensione/",
          "https://www.ombreeluci.it/2014/il-respiro-leggero-dellalba-recensione/",
          "https://www.ombreeluci.it/2014/sono-graditi-visi-sorridenti-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-127",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 127,
        display_title: "Numero 127 \u2013 Custodi della speranza",
        titolo_numero: "Custodi della speranza",
        seo_description: "Numero 127 \u2013 Custodi della speranza",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 127 \u2013 Custodi della speranza Anno 32 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 2014",
        descrizione_ai: null,
        anno_pubblicazione: 2014,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_127_2014.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-127-custodi-della-speranza/",
        canonical_url: "https://www.ombreeluci.it/project/numero-127-custodi-della-speranza/",
        archive_org_item_id: "OmbreELuciN_127",
        archive_view_url: "https://archive.org/details/OmbreELuciN_127/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_127/oel-127.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2014/custodi-della-speranza/",
          "https://www.ombreeluci.it/2014/il-lato-b-di-essere-papa-di-un-figlio-disabile/",
          "https://www.ombreeluci.it/2014/essere-padre-di-un-figlio-disabile/",
          "https://www.ombreeluci.it/2014/un-panorama-riscoprire/",
          "https://www.ombreeluci.it/2014/mio-figlio-luciano/",
          "https://www.ombreeluci.it/2014/ridere-e-una-cosa-seria/",
          "https://www.ombreeluci.it/2014/ridere-a-partire-dal-corpo/",
          "https://www.ombreeluci.it/2014/umorismo-e-handicap-un-terreno-minato/",
          "https://www.ombreeluci.it/2014/la-sedia-a-rotelle-e-i-chicchi-duva/",
          "https://www.ombreeluci.it/2014/non-si-puo-ridere-che-dellhandicap/",
          "https://www.ombreeluci.it/2014/unestate-di-campi-fede-e-luce/",
          "https://www.ombreeluci.it/2014/dialogo-aperto-n-127/",
          "https://www.ombreeluci.it/2014/dalle-province-n-127/",
          "https://www.ombreeluci.it/2014/un-dado-vegetale-da-sogno-e-fatto-in-casa/",
          "https://www.ombreeluci.it/2014/la-carrozzina-sulle-macerie/",
          "https://www.ombreeluci.it/2014/la-nostra-vita-insieme-recensione/",
          "https://www.ombreeluci.it/2014/di-padre-in-figlio-conversazioni-sul-rischio-di-educare-recensione/",
          "https://www.ombreeluci.it/2014/un-gettone-di-liberta-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-128",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 128,
        display_title: "Numero 128 - Magnificat!",
        titolo_numero: "Magnificat!",
        seo_description: "Un Numero speciale dedicato a Mariangela Bertolini, attraverso il quale vorremmo far memoria delle cose vissute insieme a lei, fare spazio per altre nei nostri cuori, farla conoscere almeno un poco a chi l\u2019ha solo sentita nominare o ne ha letto articoli sul nostro giornalino",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 128 \u2013 Magnificat! Anno 32, 2014 \u2013 Trimestrale: Ottobre, Novembre, Dicembre",
        descrizione_ai: null,
        anno_pubblicazione: 2014,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Ottobre, Novembre, Dicembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_128_2014.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-128-magnificat/",
        canonical_url: "https://www.ombreeluci.it/project/numero-128-magnificat/",
        archive_org_item_id: "OmbreELuciN_128",
        archive_view_url: "https://archive.org/details/OmbreELuciN_128",
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2014/un-cuore-alla-volta/",
          "https://www.ombreeluci.it/2014/perche-ho-avuto-fiducia/",
          "https://www.ombreeluci.it/2014/con-orgoglio-e-tenerezza/",
          "https://www.ombreeluci.it/2014/una-ragazza-speciale/",
          "https://www.ombreeluci.it/2014/lamicizia-un-dono-unico-ed-eterno/",
          "https://www.ombreeluci.it/2014/vuoi-bene-a-gesu/",
          "https://www.ombreeluci.it/2014/il-calore-dellamicizia/",
          "https://www.ombreeluci.it/2014/da-un-altro-punto-di-vista/",
          "https://www.ombreeluci.it/2014/il-sorriso-dei-tuoi-occhi/",
          "https://www.ombreeluci.it/2014/insegnante-di-lettere-canale-della-vita/",
          "https://www.ombreeluci.it/2014/lourdes-miracolo-di-un-incontro/",
          "https://www.ombreeluci.it/2014/allora-hai-deciso/",
          "https://www.ombreeluci.it/2014/ci-provero/",
          "https://www.ombreeluci.it/2014/sollecitare-la-speranza/",
          "https://www.ombreeluci.it/2014/effetto-alfedena/",
          "https://www.ombreeluci.it/2014/il-mio-primo-caffe-con-mariangela/",
          "https://www.ombreeluci.it/2014/momenti-misteriosi/",
          "https://www.ombreeluci.it/2014/mamme-coraggiose/",
          "https://www.ombreeluci.it/2014/un-patrimonio-profuso-a-piene-mani/",
          "https://www.ombreeluci.it/2014/sicurezza-nel-cammino/",
          "https://www.ombreeluci.it/2014/molto-lavoro-da-fare/",
          "https://www.ombreeluci.it/2014/quanta-forza/",
          "https://www.ombreeluci.it/2014/quel-gesto/",
          "https://www.ombreeluci.it/2014/chi-ha-seminato-nelle-lacrime-miete-nella-gioia/",
          "https://www.ombreeluci.it/2014/il-regalo-piu-bello/",
          "https://www.ombreeluci.it/2014/come-e-nato-ombre-e-luci/",
          "https://www.ombreeluci.it/2014/purche/",
          "https://www.ombreeluci.it/2014/small-talk-ma-extralarge/",
          "https://www.ombreeluci.it/2014/mirtilli/",
          "https://www.ombreeluci.it/2014/posso-salutare-la-mamma/",
          "https://www.ombreeluci.it/2014/partecipe-dei-miracoli/",
          "https://www.ombreeluci.it/2014/mariangela-linizio-a-santa-silvia/",
          "https://www.ombreeluci.it/2014/il-mosaico-tanti-sassolini-colorati/",
          "https://www.ombreeluci.it/2014/il-carro-una-casa-famiglia-per-tutti/",
          "https://www.ombreeluci.it/2014/relazioni-sincere/",
          "https://www.ombreeluci.it/2014/pregando-su-una-sedia-imponente-e-semplice/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-129",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 129,
        display_title: "Numero 129 \u2013 Quando non si \xE8 pi\xF9 soli, la vita risulta trasformata",
        titolo_numero: "Quando non si \xE8 pi\xF9 soli, la vita risulta trasformata",
        seo_description: "\xC8 il dono pi\xF9 difficile che la vita poteva darmi, ma senza chiedere mi d\xE0 tanto\u2026 Anche se ho avuto un altro destino di mamma, quello che conta \xE8 non sentirsi sole mai\u2026",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 129 \u2013 Quando non si \xE8 pi\xF9 soli, la vita risulta trasformata Anno 33 \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2015",
        descrizione_ai: null,
        anno_pubblicazione: 2015,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_129_2015.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-129-quando-non-si-e-piu-soli-la-vita-risulta-trasformata/",
        canonical_url: "https://www.ombreeluci.it/project/numero-129-quando-non-si-e-piu-soli-la-vita-risulta-trasformata/",
        archive_org_item_id: "OmbreELuciN_129",
        archive_view_url: "https://archive.org/details/OmbreELuciN_129/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_129/OeL-129.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2015/per-me-e-felicita-2/",
          "https://www.ombreeluci.it/1990/che-cosa-e-fede-e-luce/",
          "https://www.ombreeluci.it/1990/alza-lo-sguardo",
          "https://www.ombreeluci.it/2015/cosa-e-fede-e-luce/",
          "https://www.ombreeluci.it/2015/per-me-e-felicita/",
          "https://www.ombreeluci.it/2015/mai-piu-soli-tre-testimonianze/",
          "https://www.ombreeluci.it/2015/la-covazione-di-un-papa/",
          "https://www.ombreeluci.it/2015/come-e-stato-possibile-tutto-questo/",
          "https://www.ombreeluci.it/2015/un-affidamento-speciale/",
          "https://www.ombreeluci.it/2015/la-scossa-della-vunerabilita/",
          "https://www.ombreeluci.it/2015/con-loro-ci-sto-bene/",
          "https://www.ombreeluci.it/2015/fragile/",
          "https://www.ombreeluci.it/2015/voci-di-campo/",
          "https://www.ombreeluci.it/2015/tutti-insieme/",
          "https://www.ombreeluci.it/2015/occasioni-per-stare-al-passo/",
          "https://www.ombreeluci.it/2015/e-ci-si-sente-un-po-soli/",
          "https://www.ombreeluci.it/2015/tra-lacquario-e-loceano/",
          "https://www.ombreeluci.it/2015/una-profezia/",
          "https://www.ombreeluci.it/2015/aprirsi-ad-altre-famiglie/",
          "https://www.ombreeluci.it/2015/la-poverta-delle-beatitudini/",
          "https://www.ombreeluci.it/2015/testimoni-dellincontro/",
          "https://www.ombreeluci.it/2015/custodire-ogni-persona/",
          "https://www.ombreeluci.it/2015/ho-imparato/",
          "https://www.ombreeluci.it/2015/barriere-invisibili-al-cuore/",
          "https://www.ombreeluci.it/2015/il-dono-dellunita/",
          "https://www.ombreeluci.it/2015/fede-e-luce-diventare-piccolo-segno/",
          "https://www.ombreeluci.it/2015/un-tesoro-inestimabile/",
          "https://www.ombreeluci.it/2015/come-sei-cresciuto/",
          "https://www.ombreeluci.it/2015/proprio-io/",
          "https://www.ombreeluci.it/2015/fede-e-luce-essere-movimento/",
          "https://www.ombreeluci.it/2015/mi-saro-fatto-unidea/",
          "https://www.ombreeluci.it/2015/doni-preziosi/",
          "https://www.ombreeluci.it/2015/alza-lo-sguardo/",
          "https://www.ombreeluci.it/2015/un-affidamento-speciale-2/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-130",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 130,
        display_title: "Numero 130 - Luoghi della relazione",
        titolo_numero: "Luoghi della relazione",
        seo_description: "Oltre nel decidere di impegnare il proprio tempo o la propria vita perch\xE9 la persona disabile trovi un suo spazio e tempo di buona vita. Piccole realt\xE0, piccole esperienze forse \u2013 alcune di queste nate nello spirito di Fede e Luce \u2013, molto significative per chi vi prende parte, disabile o no... In misure e modi diversi: un laboratorio di arti manuali, di scrittura, una radio, una casa famiglia, uno spettacolo teatrale, un punto vendita, un\u2019associazione di comunit\xE0 di vita... , ognuna di esse racconta come dare nuova densit\xE0 al tempo vissuto, nel \u201Cluogo di una relazione che trasforma e diviene segno per il mondo\u201D.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 130 \u2013 Luoghi della relazione Anno 33, 2015 \u2013 Trimestrale: Aprile, Maggio, Giugno",
        descrizione_ai: null,
        anno_pubblicazione: 2015,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Aprile, Maggio, Giugno",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_130_2015.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-130-luoghi-della-relazione/",
        canonical_url: "https://www.ombreeluci.it/project/numero-130-luoghi-della-relazione/",
        archive_org_item_id: "OmbreELuci130",
        archive_view_url: "https://archive.org/details/OmbreELuci130/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuci130/OmbreELuci_2-15.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2015/luoghi-della-relazione/",
          "https://www.ombreeluci.it/2015/piu-scavo-piu-trovo/",
          "https://www.ombreeluci.it/2015/pinocchio-teatro-integrato-ma-non-solo/",
          "https://www.ombreeluci.it/2015/i-mille-volti/",
          "https://www.ombreeluci.it/2015/la-lampada-dei-desideri/",
          "https://www.ombreeluci.it/2015/scintille-di-amicizia/",
          "https://www.ombreeluci.it/2015/una-buona-scuola-damore/",
          "https://www.ombreeluci.it/2015/il-senso-della-festa/",
          "https://www.ombreeluci.it/2015/famiglia-per-chi-famiglia-per-cosa/",
          "https://www.ombreeluci.it/2015/la-ragnatela/",
          "https://www.ombreeluci.it/2015/dalle-provincia-n-130/",
          "https://www.ombreeluci.it/2015/di-corsa-verso-francesco/",
          "https://www.ombreeluci.it/2015/siblings-recensione/",
          "https://www.ombreeluci.it/2015/la-paura-di-amare-recensione/",
          "https://www.ombreeluci.it/2015/alla-fine-qualcosa-ci-inventeremo-che-ne-sara-di-mio-figlio-autistico-quando-non-saro-piu-al-suo-fianco-recensione/",
          "https://www.ombreeluci.it/2015/lo-zaino-di-emma-recensione/",
          "https://www.ombreeluci.it/2015/dialogo-aperto-n-130/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-131",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 131,
        display_title: "Numero 131 - Coraggio, sono io",
        titolo_numero: "Coraggio, sono io",
        seo_description: "Numero 131 \u2013 Coraggio, sono io",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 131 \u2013 Coraggio, sono io! Anno 33, 2015 \u2013 Trimestrale: Luglio, Agosto, Settembre",
        descrizione_ai: null,
        anno_pubblicazione: 2015,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Luglio, Agosto, Settembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_131_2015.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-131-coraggio/",
        canonical_url: "https://www.ombreeluci.it/project/numero-131-coraggio/",
        archive_org_item_id: "OmbreeLuci_131",
        archive_view_url: "https://archive.org/details/OmbreeLuci_131",
        archive_download_pdf_url: "https://archive.org/download/OmbreeLuci_131/OmbreeLuci-3_15.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/2015/cinque-azioni/",
          "http://www.ombreeluci.it/2015/tornare-ad-assisi-passando-da-roma/",
          "http://www.ombreeluci.it/2015/la-felicita-e-imperfetta/",
          "http://www.ombreeluci.it/2015/come-nasce-un-pellegrinaggio-in-fede-e-luce/",
          "http://www.ombreeluci.it/2015/con-tanta-voglia-di-fare/",
          "http://www.ombreeluci.it/2015/viaggiare-alla-pari/",
          "http://www.ombreeluci.it/2015/non-ci-sono-parole/",
          "http://www.ombreeluci.it/2015/il-nostro-scoop/",
          "http://www.ombreeluci.it/2015/accompagnata-e-accudita/",
          "http://www.ombreeluci.it/2015/un-attimo-decine-volti/",
          "http://www.ombreeluci.it/2015/pronta-a-riviverlo/",
          "http://www.ombreeluci.it/2015/la-forza-della-fragilita/",
          "http://www.ombreeluci.it/2015/miei-primi-quarantanni/",
          "http://www.ombreeluci.it/2017/semplicita-bella-ricca/",
          "http://www.ombreeluci.it/2015/la-relazione-la-famiglia/",
          "http://www.ombreeluci.it/2015/un-solo-nome/",
          "http://www.ombreeluci.it/2015/nonostante-alcune-delusioni/",
          "http://www.ombreeluci.it/2015/un-turbinio-eventi/",
          "http://www.ombreeluci.it/2015/ho-imparato-a-nuotare/",
          "http://www.ombreeluci.it/2015/castelporziano-in-festa/",
          "http://www.ombreeluci.it/2015/che-bella-estate/",
          "http://www.ombreeluci.it/2015/bicocas-got-talent/",
          "http://www.ombreeluci.it/2015/tempi-nuovi-campi/",
          "http://www.ombreeluci.it/2015/scampoli-di-paradiso/",
          "http://www.ombreeluci.it/2015/viola-la-nonna/",
          "https://www.ombreeluci.it/2015/accompagnata-e-accudita/",
          "https://www.ombreeluci.it/2015/il-nostro-scoop/",
          "https://www.ombreeluci.it/2015/non-ci-sono-parole/",
          "https://www.ombreeluci.it/2015/viaggiare-alla-pari/",
          "https://www.ombreeluci.it/2015/con-tanta-voglia-di-fare/",
          "https://www.ombreeluci.it/2015/come-nasce-un-pellegrinaggio-in-fede-e-luce/",
          "https://www.ombreeluci.it/2015/la-felicita-e-imperfetta/",
          "https://www.ombreeluci.it/2015/tornare-ad-assisi-passando-da-roma/",
          "https://www.ombreeluci.it/2015/scampoli-di-paradiso/",
          "https://www.ombreeluci.it/2015/cinque-azioni/",
          "https://www.ombreeluci.it/2015/viola-la-nonna/",
          "https://www.ombreeluci.it/2015/tempi-nuovi-campi/",
          "https://www.ombreeluci.it/2015/che-bella-estate/",
          "https://www.ombreeluci.it/2015/bicocas-got-talent/",
          "https://www.ombreeluci.it/2015/castelporziano-in-festa/",
          "https://www.ombreeluci.it/2015/ho-imparato-a-nuotare/",
          "https://www.ombreeluci.it/2015/un-turbinio-eventi/",
          "https://www.ombreeluci.it/2015/nonostante-alcune-delusioni/",
          "https://www.ombreeluci.it/2015/semplicita-bella-ricca/",
          "https://www.ombreeluci.it/2015/miei-primi-quarantanni/",
          "https://www.ombreeluci.it/2015/la-forza-della-fragilita/",
          "https://www.ombreeluci.it/2015/pronta-a-riviverlo/",
          "https://www.ombreeluci.it/2015/un-attimo-decine-volti/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-132",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 132,
        display_title: "Numero 132 - Nessuno resti solo",
        titolo_numero: "Nessuno resti solo",
        seo_description: "Numero 132 \u2013 Nessuno resti solo",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 132 \u2013 Nessuno resti solo Anno 33, 2015 \u2013 Trimestrale: Ottobre, Novembre, Dicembre",
        descrizione_ai: null,
        anno_pubblicazione: 2015,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Ottobre, Novembre, Dicembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_132_2015.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-132-nessuno-resti-solo/",
        canonical_url: "https://www.ombreeluci.it/project/numero-132-nessuno-resti-solo/",
        archive_org_item_id: "OmbreeLuci_132",
        archive_view_url: "https://archive.org/details/OmbreeLuci_132",
        archive_download_pdf_url: "https://archive.org/download/OmbreeLuci_132/OmbreLuci 415_SD.pdf",
        articoli_ids: [],
        articoli_urls: [
          "http://www.ombreeluci.it/2015/nessuno-resti-solo/",
          "http://www.ombreeluci.it/2015/figli-delle-stelle/",
          "http://www.ombreeluci.it/2015/te-lo-ricordi-frate/",
          "http://www.ombreeluci.it/2015/ehi-campione-come-va-da-lassu/",
          "http://www.ombreeluci.it/2015/con-gli-occhi-di-un-bambino/",
          "http://www.ombreeluci.it/2015/una-piccola-barca/",
          "http://www.ombreeluci.it/2015/cose-che-sapevi/",
          "http://www.ombreeluci.it/2015/fuori-dellacquario/",
          "http://www.ombreeluci.it/2015/un-altro-anno/",
          "http://www.ombreeluci.it/2015/la-lezione-del-femminismo/",
          "http://www.ombreeluci.it/2015/siamo-tutti-un-po-supereroi/",
          "http://www.ombreeluci.it/2015/amici-di-simone/",
          "http://www.ombreeluci.it/2015/viola-il-capitano-e-piccolo-mio/",
          "https://www.ombreeluci.it/2015/viola-il-capitano-e-piccolo-mio/",
          "https://www.ombreeluci.it/2015/amici-di-simone/",
          "https://www.ombreeluci.it/2015/siamo-tutti-un-po-supereroi/",
          "https://www.ombreeluci.it/2015/un-altro-anno/",
          "https://www.ombreeluci.it/2015/fuori-dellacquario/",
          "https://www.ombreeluci.it/2015/cose-che-sapevi/",
          "https://www.ombreeluci.it/2015/una-piccola-barca/",
          "https://www.ombreeluci.it/2015/con-gli-occhi-di-un-bambino/",
          "https://www.ombreeluci.it/2015/ehi-campione-come-va-da-lassu/",
          "https://www.ombreeluci.it/2015/te-lo-ricordi-frate/",
          "https://www.ombreeluci.it/2015/nessuno-resti-solo/",
          "https://www.ombreeluci.it/2015/figli-delle-stelle/",
          "https://www.ombreeluci.it/2015/la-lezione-del-femminismo/",
          "https://www.ombreeluci.it/2015/bacheca-facebook/",
          "https://www.ombreeluci.it/1992/chi-aiuta-la-famiglia-gli-specialisti/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-133",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 133,
        display_title: "Numero 133 - Chiamati al traguardo",
        titolo_numero: "Chiamati al traguardo",
        seo_description: "Numero 133 \u2013 Chiamati al traguardo",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 133 \u2013 Chiamati al traguardo Anno 34 \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2016",
        descrizione_ai: null,
        anno_pubblicazione: 2016,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_133_2016.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-133-chiamati-al-traguardo/",
        canonical_url: "https://www.ombreeluci.it/project/numero-133-chiamati-al-traguardo/",
        archive_org_item_id: "oel-133",
        archive_view_url: "https://archive.org/details/oel-133/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/oel-133/oel-133.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2016/chiamati-tutti-al-traguardo/",
          "https://www.ombreeluci.it/2016/il-senso-di-una-vita-e-di-una-scelta/",
          "https://www.ombreeluci.it/2016/il-roveto-di-santilario/",
          "https://www.ombreeluci.it/2016/non-possiamo-restare-dei-peter-pan-a-vita/",
          "https://www.ombreeluci.it/2016/spiritualmente-le-piccole-suore-non-sono-handicappate/",
          "https://www.ombreeluci.it/2016/la-disabilita-un-confine-da-superare/",
          "https://www.ombreeluci.it/2016/porta-sfortuna/",
          "https://www.ombreeluci.it/2016/un-ponte-in-un-guscio-di-noce/",
          "https://www.ombreeluci.it/2016/riscoprire-cio-che-unisce-i-cuori-di-tutti/",
          "https://www.ombreeluci.it/2016/riuniti-in-preghiera/",
          "https://www.ombreeluci.it/2016/qualche-raggio-di-sole-in-siria/",
          "https://www.ombreeluci.it/2016/dialogo-aperto-n-133/",
          "https://www.ombreeluci.it/2016/viola-e-il-bullismo/",
          "https://www.ombreeluci.it/2016/il-bambino-che-parlava-con-la-luce-recensione/",
          "https://www.ombreeluci.it/2016/zia-lo-sai-che-sei-un-po-strana-recensione/",
          "https://www.ombreeluci.it/2016/osservazioni-di-una-mamma-qualunque-recensione/",
          "https://www.ombreeluci.it/2016/il-libro-di-julian-a-wonder-story-recensione/",
          "https://www.ombreeluci.it/2016/il-libro-di-cristopher-a-wonder-story-recensione/",
          "https://www.ombreeluci.it/2016/cercare-la-bellezza-la-dove-e-nascosta/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-134",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 134,
        display_title: "Numero 134 - #TuttiABordo",
        titolo_numero: "#TuttiABordo",
        seo_description: "Numero 134 \u2013 #TuttiABordo",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 134 \u2013 #TuttiABordo Anno 34 \u2013 Numero 2 \u2013 Aprlie \u2013 Maggio \u2013 Giugno 2016",
        descrizione_ai: null,
        anno_pubblicazione: 2016,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Maggio \u2013 Giugno",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_134_2016.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-134-tuttiabordo/",
        canonical_url: "https://www.ombreeluci.it/project/numero-134-tuttiabordo/",
        archive_org_item_id: "OmbreELuciN_134",
        archive_view_url: "https://archive.org/details/OmbreELuciN_134/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_134/oel-134.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2016/la-sfida-di-chi-ama-di-piu/",
          "https://www.ombreeluci.it/2016/tutti-a-bordo/",
          "https://www.ombreeluci.it/2016/giubileo-2016-la-vera-gioia/",
          "https://www.ombreeluci.it/2016/giubileo-2016-per-cominciare-una-nuova-storia-di-amore/",
          "https://www.ombreeluci.it/2016/oltre-il-limite/",
          "https://www.ombreeluci.it/2016/il-vangelo-mimato-per-costruire-ponti/",
          "https://www.ombreeluci.it/2016/papa-francesco-al-chicco-qui-mi-avete-toccato-il-cuore/",
          "https://www.ombreeluci.it/2016/il-chicco-vivere-il-vangelo-in-azione/",
          "https://www.ombreeluci.it/2016/un-laboratorio-creativo-a-pantigliate/",
          "https://www.ombreeluci.it/2016/un-fiume-di-pace-un-mare-di-giubilei/",
          "https://www.ombreeluci.it/2016/dialogo-aperto-n-134/",
          "https://www.ombreeluci.it/2016/dalle-provincie-n-134/",
          "https://www.ombreeluci.it/2016/la-passione-della-pazienza/",
          "https://www.ombreeluci.it/2016/mio-fratello-rincorre-i-dinosauri-2/",
          "https://www.ombreeluci.it/2016/il-chicco-recensione/",
          "https://www.ombreeluci.it/2016/piero-e-il-bruco-farfalla-recensione/",
          "https://www.ombreeluci.it/2016/gioia-e-le-altre-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-135",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 135,
        display_title: "Numero 135 - Tu ci hai chiamato... eccoci!",
        titolo_numero: "Tu ci hai chiamato... eccoci!",
        seo_description: "Numero 135 \u2013 Tu ci hai chiamato\u2026 eccoci!",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 135 \u2013 Tu ci hai chiamato\u2026 eccoci! Anno 34 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 2016",
        descrizione_ai: null,
        anno_pubblicazione: 2016,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_135_2016.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-135-tu-ci-hai-chiamato-eccoci/",
        canonical_url: "https://www.ombreeluci.it/project/numero-135-tu-ci-hai-chiamato-eccoci/",
        archive_org_item_id: "OmbreELuciN_135",
        archive_view_url: "https://archive.org/details/OmbreELuciN_135",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_135/oel-135.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2016/tu-ci-hai-chiamati-eccoci/",
          "https://www.ombreeluci.it/2016/un-oro-al-giorno/",
          "https://www.ombreeluci.it/2016/la-misericordia/",
          "https://www.ombreeluci.it/2016/il-messaggio-del-giubileo-dialogo-con-mons-rino-fisichella/",
          "https://www.ombreeluci.it/2016/puo-un-gesto-essere-cosi-significativo/",
          "https://www.ombreeluci.it/2016/il-giubileo-di-fede-e-luce/",
          "https://www.ombreeluci.it/2016/accogliere-la-sorpresa/",
          "https://www.ombreeluci.it/2016/monsignor-von-galen-leroismo-di-una-coscienza/",
          "https://www.ombreeluci.it/2016/nuove-comunita-fede-e-luce-festa-in-umbria/",
          "https://www.ombreeluci.it/2016/cosa-ti-aspetti/",
          "https://www.ombreeluci.it/2016/il-valore-del-cammino-insieme/",
          "https://www.ombreeluci.it/2016/chi-scalda-il-cuore/",
          "https://www.ombreeluci.it/2016/chiamati-a-portare-frutto/",
          "https://www.ombreeluci.it/2016/dialogo-aperto-n-135/",
          "https://www.ombreeluci.it/2016/dalle-province-n-135/",
          "https://www.ombreeluci.it/2016/viola-e-occhiolino/",
          "https://www.ombreeluci.it/2016/se-arianna-recensione/",
          "https://www.ombreeluci.it/2016/mi-hanno-regalato-un-sogno/",
          "https://www.ombreeluci.it/2016/la-tempesta-di-sasa-recensione/",
          "https://www.ombreeluci.it/2016/alla-ricerca-di-dory-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-136",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 136,
        display_title: "Numero 136 - Valgo anch'io",
        titolo_numero: "Valgo anch'io",
        seo_description: "Numero 136 \u2013 Valgo anch\u2019io",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 136 \u2013 Valgo anch\u2019io Anno 34 \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 2016",
        descrizione_ai: null,
        anno_pubblicazione: 2016,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_136_2016.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-136-valgo-anchio/",
        canonical_url: "https://www.ombreeluci.it/project/numero-136-valgo-anchio/",
        archive_org_item_id: "OmbreELuciN_136",
        archive_view_url: "https://archive.org/details/OmbreELuciN_136",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_136/oel-136.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2016/qualcosa-e-cambiato/",
          "https://www.ombreeluci.it/2016/bisogna-accettare-che-un-bambino-abbia-delle-resistenze/",
          "https://www.ombreeluci.it/2016/leducazione-attraverso-lesempio/",
          "https://www.ombreeluci.it/2016/fede-e-luce-una-scuola-di-altruismo/",
          "https://www.ombreeluci.it/2016/io-e-simona/https://www.ombreeluci.it/2016/valgo-anchio/",
          "https://www.ombreeluci.it/2016/valgo-anchio/",
          "https://www.ombreeluci.it/2016/genitori-speciali-zzati-servizio-di-consulenza-pedagogica-di-trento/",
          "https://www.ombreeluci.it/2016/dallassistenza-allesistenza-sei-workshop-dellassociazione-vedere-oltre-onlus/",
          "https://www.ombreeluci.it/2016/quattro-giorni-mano-nella-mano/",
          "https://www.ombreeluci.it/2016/i-doni-di-dio/",
          "https://www.ombreeluci.it/2016/dialogo-aperto-n-136/",
          "https://www.ombreeluci.it/2016/dalle-province-n-136/",
          "https://www.ombreeluci.it/2016/io-sono-con-te-recensione/",
          "https://www.ombreeluci.it/2016/il-libro-di-charlotte-recensione/",
          "https://www.ombreeluci.it/2016/vedere-oltre-finestre-su-una-storia-recensione/",
          "https://www.ombreeluci.it/2016/pedagogia-del-dolore-innocente-recensione/",
          "https://www.ombreeluci.it/2016/genitori-recensione-film/",
          "https://www.ombreeluci.it/2017/don-gnocchi-una-vita-spesa-per-gli-altri-recensione/",
          "https://www.ombreeluci.it/2016/io-e-simona/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-137",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 137,
        display_title: "Numero 137 - Un posto tra gli altri",
        titolo_numero: "Un posto tra gli altri",
        seo_description: "il valore della persona con disabilit\xE0 all\u2019interno della comunit\xE0 cristiana e la necessaria solidariet\xE0 tra i componenti di una comunit\xE0",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 137 \u2013 Un posto tra gli altri Anno 35 \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2017",
        descrizione_ai: null,
        anno_pubblicazione: 2017,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_137_2017.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-137-un-posto-tra-gli-altri/",
        canonical_url: "https://www.ombreeluci.it/project/numero-137-un-posto-tra-gli-altri/",
        archive_org_item_id: "ombre-e-luci-n.137",
        archive_view_url: "https://archive.org/details/ombre-e-luci-n.137/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/ombre-e-luci-n.137/oel-137.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2017/inclusione-solidarieta-ordinaria/",
          "https://www.ombreeluci.it/2017/avere-un-posto-nella-societa/",
          "https://www.ombreeluci.it/2017/abitare-nellordinarieta/",
          "https://www.ombreeluci.it/2017/abbiamo-un-cuore-inclusivo/",
          "https://www.ombreeluci.it/2017/labilita-onlus-aprire-gli-occhi/",
          "https://www.ombreeluci.it/2017/i-geni-del-futuro-crispr-cas9/",
          "https://www.ombreeluci.it/2017/i-geni-del-passato-handiche/",
          "https://www.ombreeluci.it/2017/una-veglia-laboratorio-per-il-giovedi-santo/",
          "https://www.ombreeluci.it/2017/attesi-amati-trasformati/",
          "https://www.ombreeluci.it/2017/dialogo-aperto-n-137/",
          "https://www.ombreeluci.it/2017/dalle-province-n-137/",
          "https://www.ombreeluci.it/2017/viola-e-mimosa-n-137/",
          "https://www.ombreeluci.it/2017/seveso-1976-oltre-la-diossina/",
          "https://www.ombreeluci.it/2017/leutanasia-di-dio-recensione/",
          "https://www.ombreeluci.it/2017/ho-amici-in-paradiso-recensione/",
          "https://www.ombreeluci.it/2017/visto-al-cineforum-di-fede-e-luce/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-138",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 138,
        display_title: "Numero 138 - Costruire l'accoglienza",
        titolo_numero: "Costruire l'accoglienza",
        seo_description: "Numero 138 \u2013 Costruire l\u2019accoglienza",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 138 \u2013 Costruire l\u2019accoglienza Anno 35 \u2013 Numero 2 \u2013 Aprile \u2013 Maggio \u2013 Giugno 2017",
        descrizione_ai: null,
        anno_pubblicazione: 2017,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_138_2017.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-138-costruire-laccoglienza/",
        canonical_url: "https://www.ombreeluci.it/project/numero-138-costruire-laccoglienza/",
        archive_org_item_id: "oel-138",
        archive_view_url: "https://archive.org/details/oel-138/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/oel-138/oel-138.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2017/costruiamo-laccoglienza/",
          "https://www.ombreeluci.it/2017/dossier-rifugiati/",
          "https://www.ombreeluci.it/2017/corridoi-umanitari/",
          "https://www.ombreeluci.it/2017/insolito-ragionamento-sul-migrante/",
          "https://www.ombreeluci.it/2017/migrati-diverse-fragilita-si-incontrano/",
          "https://www.ombreeluci.it/2017/i-figli-sono-tutti-speciali/",
          "https://www.ombreeluci.it/2017/trasformare-i-nostri-cuori/",
          "https://www.ombreeluci.it/2017/sara-bello/",
          "https://www.ombreeluci.it/2017/la-nuova-legge-sul-dopo-di-noi-che-cosa-dice/",
          "https://www.ombreeluci.it/2017/la-nuova-legge-sul-dopo-di-noi-nodi-da-sciogliere/",
          "https://www.ombreeluci.it/2017/dialogo-aperto-n-138/",
          "https://www.ombreeluci.it/2017/dalle-province-n-138/",
          "https://www.ombreeluci.it/2017/guidati-da-gio/",
          "https://www.ombreeluci.it/2017/don-gnocchi-una-vita-spesa-per-gli-altri-recensione/",
          "https://www.ombreeluci.it/2017/lo-straordinario-viaggio-di-nujeen-recensione/",
          "https://www.ombreeluci.it/2017/gli-scartagonisti-recensione/",
          "https://www.ombreeluci.it/2017/dettagli-inutili-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-139",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 139,
        display_title: "Numero 139 - Connessi per davvero",
        titolo_numero: "Connessi per davvero",
        seo_description: 'Le cose pi\xF9 importanti della vita, quelle che le danno senso, hanno bisogno di tempo e dell\u2019"altro" in carne e ossa: l\u2019amore, la fiducia, la stabilit\xE0 delle relazioni, la gioia che non sia semplice e passeggero divertimento',
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 139 \u2013 Connessi per davvero Anno 35, 2017 \u2013 Trimestrale: Luglio, Agosto, Settembre",
        descrizione_ai: null,
        anno_pubblicazione: 2017,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Luglio, Agosto, Settembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2017/10/Copertina_OeL_139_2017.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-139-connessi-davvero/",
        canonical_url: "https://www.ombreeluci.it/project/numero-139-connessi-davvero/",
        archive_org_item_id: "OmbreELuciN_139",
        archive_view_url: "https://archive.org/details/OmbreELuciN_139/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_139/oel-139.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2017/connessi-per-davvero/",
          "https://www.ombreeluci.it/2017/la-nostra-casa-baskin/",
          "https://www.ombreeluci.it/2017/il-plusabile-due-sorelle-speciali/",
          "https://www.ombreeluci.it/2017/scoprirsi-unici-e-crescere-insieme/",
          "https://www.ombreeluci.it/2017/safesurfing-navigare-nella-rete-in-sicurezza/",
          "https://www.ombreeluci.it/2017/la-chiesa-accanto-a-mio-figlio/",
          "https://www.ombreeluci.it/2017/la-sua-prima-confessione/",
          "https://www.ombreeluci.it/2017/segni-efficaci/",
          "https://www.ombreeluci.it/2017/dialogo-aperto-n-139/",
          "https://www.ombreeluci.it/2017/come-and-see-meeting-dei-giovani-ad-alicante/",
          "https://www.ombreeluci.it/2017/dalle-province-n-139/",
          "https://www.ombreeluci.it/2017/viola-e-mimosa-n-139/",
          "https://www.ombreeluci.it/2017/dopo-di-noi-atti-del-convegno-anffas/",
          "https://www.ombreeluci.it/2017/il-signor-parroco-ha-dato-di-matto/",
          "https://www.ombreeluci.it/2017/hello-harry-hi-benny-recensione/",
          "https://www.ombreeluci.it/2017/nonostante-il-mio-handicap/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-140",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 140,
        display_title: "Numero 140 - Perch\xE9 tu sei prezioso ai miei occhi",
        titolo_numero: "Perch\xE9 tu sei prezioso ai miei occhi",
        seo_description: "festeggiamo i 35 anni della rivista e ci sembra che un buon modo per farlo sia quello di rendere accessibile online tutto il nostro archivio per vedere se e quanta strada abbiamo fatto con la speranza che tutto questo possa anche solo aggiungere qualche goccia di, presumiamo buona, acqua all\u2019oceano della vita e della storia di ciascuno",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 140 \u2013 Perch\xE9 tu sei prezioso ai miei occhi Anno 35, 2017 \u2013 Trimestrale: Ottobre, Novembre, Dicembre",
        descrizione_ai: null,
        anno_pubblicazione: 2017,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Ottobre, Novembre, Dicembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2018/01/Copertina_OeL_140_2017.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-140-perche-tu-prezioso-ai-miei-occhi/",
        canonical_url: "https://www.ombreeluci.it/project/numero-140-perche-tu-prezioso-ai-miei-occhi/",
        archive_org_item_id: "OmbreELuciN_140",
        archive_view_url: "https://archive.org/details/OmbreELuciN_140/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_140/oel-140.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2017/la-strada-percorsa-finora/",
          "https://www.ombreeluci.it/2017/dimmi-chi-ammiri/",
          "https://www.ombreeluci.it/2017/mamma-in-comunita/",
          "https://www.ombreeluci.it/2017/le-amiche-di-francesco/",
          "https://www.ombreeluci.it/2017/mi-chiamo-charlotte-fien-e-ho-la-sindrome-di-down/",
          "https://www.ombreeluci.it/2017/lonore-di-un-lord/",
          "https://www.ombreeluci.it/2017/gli-autistici-esistono-finche-vanno-a-scuola/",
          "https://www.ombreeluci.it/2017/fare-nuove-tutte-le-cose/",
          "https://www.ombreeluci.it/2017/epigenetica-e-malattie-psichiatriche/",
          "https://www.ombreeluci.it/2017/dopo-di-noi-i-diritti-che-ci-sono/",
          "https://www.ombreeluci.it/2017/caro-raffa-la-vita-e-adesso/",
          "https://www.ombreeluci.it/2017/legge-sul-dopo-di-noi-issiamo-le-vele/",
          "https://www.ombreeluci.it/2017/diaologo-aperto-n-140/",
          "https://www.ombreeluci.it/2017/dalle-province-n-140/",
          "https://www.ombreeluci.it/2017/viola-e-mimosa-n-140/",
          "https://www.ombreeluci.it/2018/anna-sorride-alla-pioggia/",
          "https://www.ombreeluci.it/2017/quello-che-non-ho-mai-detto-e-lisola-di-noi-recensione-di-due-libri-di-federico-de-rosa/",
          "https://www.ombreeluci.it/2017/raccontami-il-mare-che-hai-dentro-vivere-con-un-figlio-autistico-recensione/",
          "https://www.ombreeluci.it/2017/limportante-e-che-sia-sano/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-141",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 141,
        display_title: "Ombre e Luci n.141 | Impara a chiamarmi per nome",
        titolo_numero: "Ombre e Luci n.141 | Impara a chiamarmi per nome",
        seo_description: "Come pensiamo e discutiamo della disabilit\xE0? In questo numero un dossier riflette sulle barriere comportamentali verso la persona con disabilit\xE0 e rassegna alcune realt\xE0 sul territorio che cercano di abbattere questi muri.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 141 \u2013 Impara a chiamarmi per nome Anno 36, 2018 \u2013 Trimestrale: Gennaio, Febbraio, Marzo",
        descrizione_ai: null,
        anno_pubblicazione: 2018,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Gennaio, Febbraio, Marzo",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2018/04/copertina-articolo-fb.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-141-impara-a-chiamarmi-per-nome/",
        canonical_url: "https://www.ombreeluci.it/project/numero-141-impara-a-chiamarmi-per-nome/",
        archive_org_item_id: "oel-141",
        archive_view_url: "https://archive.org/details/oel-141/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/oel-141/oel-141.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2018/quanti-conosci-per-nome/",
          "https://www.ombreeluci.it/2018/come-dirlo/",
          "https://www.ombreeluci.it/2018/il-progetto-girotondo/",
          "https://www.ombreeluci.it/2018/da-fratello-e-da-padre/",
          "https://www.ombreeluci.it/2018/cervelli-ribelli-connettiamoci-neurodiversita/",
          "https://www.ombreeluci.it/2018/il-calcio-sociale-come-palestra-di-vita/",
          "https://www.ombreeluci.it/2018/cosa-so-dei-social-e-cosa-ne-penso/",
          "https://www.ombreeluci.it/2018/perche-tutti-comprendano/",
          "https://www.ombreeluci.it/2019/il-nostro-incontro-con-liliana-segre/",
          "https://www.ombreeluci.it/2018/tracciare-il-sentiero-in-albania/",
          "https://www.ombreeluci.it/2018/dialogo-aperto-n-141/",
          "https://www.ombreeluci.it/2018/dalle-province-n-141/",
          "https://www.ombreeluci.it/2018/il-racconto-di-natale-per-mio-figlio/",
          "https://www.ombreeluci.it/2018/come-se-io-fossi-te/",
          "https://www.ombreeluci.it/2018/da-piccola-ero-down/",
          "https://www.ombreeluci.it/2018/il-nostro-incontro-con-liliana-segre/",
          "https://www.ombreeluci.it/2018/non-e-te-che-aspettavo/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-142",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 142,
        display_title: "Numero 142 - Segni da scoprire",
        titolo_numero: "Segni da scoprire",
        seo_description: "L\u2019importanza di raccontare s\xE9 stessi, le proprie difficolt\xE0 e le proprie gioie \xE8 al centro dei rapporti umani: ne parliamo in questo numero.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 142 \u2013 Segni da scoprire Anno 36, 2018 \u2013 Trimestrale: Aprile, Maggio, Giugno",
        descrizione_ai: null,
        anno_pubblicazione: 2018,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Aprile, Maggio, Giugno",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2018/07/The-Silent-Child-chiara.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-142-segni-da-scoprire/",
        canonical_url: "https://www.ombreeluci.it/project/numero-142-segni-da-scoprire/",
        archive_org_item_id: "OmbreELuciN_142",
        archive_view_url: "https://archive.org/details/OmbreELuciN_142/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_142/oel-142.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2018/segni-di-meraviglia/",
          "https://www.ombreeluci.it/2018/ascoltare-i-segni-perche-in-lis/",
          "https://www.ombreeluci.it/2018/segni-dellamore-di-dio/",
          "https://www.ombreeluci.it/2018/voglia-di-comunicare/",
          "https://www.ombreeluci.it/2018/la-comunicazione-multimodale/",
          "https://www.ombreeluci.it/2018/fede-e-luce-una-grande-famiglia/",
          "https://www.ombreeluci.it/2018/percorsi-inclusivi-noi-ci-teniamo/",
          "https://www.ombreeluci.it/2018/dal-convegno-allimpegno/",
          "https://www.ombreeluci.it/2018/la-mia-forza-nella-mia-differenza/",
          "https://www.ombreeluci.it/2018/dialogo-aperto-n-142/",
          "https://www.ombreeluci.it/2018/dalle-province-n-142/",
          "https://www.ombreeluci.it/2018/dalle-mamme-di-palidoro-perche-curare-non-significa-solo-guarire/",
          "https://www.ombreeluci.it/2018/la-bambina-che-andava-a-pile/",
          "https://www.ombreeluci.it/2018/la-lingua-dei-segni-nelle-disabilita-comunicative/",
          "https://www.ombreeluci.it/2018/elogio-della-fragilita/",
          "https://www.ombreeluci.it/2018/io-figlio-di-mio-figlio/",
          "https://www.ombreeluci.it/2018/sofia-cavalletti-strumento-tra-i-bambini-e-dio/",
          "https://www.ombreeluci.it/2018/la-forma-della-voce/",
          "https://www.ombreeluci.it/2018/due-capitane/",
          "https://www.ombreeluci.it/2018/la-bambina-che-andava-a-pile-recensione/",
          "https://www.ombreeluci.it/2018/la-lingua-dei-segni-nelle-disabilita-comunicative-recensione/",
          "https://www.ombreeluci.it/2018/elogio-della-fragilita-recensione/",
          "https://www.ombreeluci.it/2018/io-figlio-di-mio-figlio-recensione/",
          "https://www.ombreeluci.it/2018/la-forma-della-voce-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-143",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 143,
        display_title: "Numero 143 - Corrispondenze",
        titolo_numero: "Corrispondenze",
        seo_description: "\xC8 uscito il nuovo numero di Ombre e Luci. All'interno: i 50 anni di Ombres et Lumi\xE9re, la cronaca dell'Incontro internazionale il Libano e le testimonianze dei giovani a Fano.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 143 \u2013 Corrispondenze Anno 36, 2018 \u2013 Trimestrale: Luglio, Agosto, Settembre",
        descrizione_ai: null,
        anno_pubblicazione: 2018,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Luglio, Agosto, Settembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2018/11/Copertina_OeL_142_2018.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-143-corrispondenze/",
        canonical_url: "https://www.ombreeluci.it/project/numero-143-corrispondenze/",
        archive_org_item_id: "OmbreELuciN_143",
        archive_view_url: "https://archive.org/details/OmbreELuciN_143/mode/2up?view=theater",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_143/oel-143.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2018/finestre-di-speranza/",
          "https://www.ombreeluci.it/2018/scarti-o-pietre-portanti/",
          "https://www.ombreeluci.it/2018/una-radice-e-delle-ali/",
          "https://www.ombreeluci.it/2018/oltre-la-cronaca-vicini-al-quotidiano/",
          "https://www.ombreeluci.it/2018/scegliamo-con-cura-le-parole/",
          "https://www.ombreeluci.it/2018/i-miei-occhi-e-il-mio-cuore-hanno-vissuto-la-meraviglia/",
          "https://www.ombreeluci.it/2018/con-il-tuo-passo-percorsi-agesci/",
          "https://www.ombreeluci.it/2018/fano2018/",
          "https://www.ombreeluci.it/2018/dialogo-aperto-n-143",
          "https://www.ombreeluci.it/2018/dalle-province-n-143/",
          "https://www.ombreeluci.it/2018/viola-e-mimosa-desaparecida/",
          "https://www.ombreeluci.it/2018/fano-2018-the-best-of-our-youth/",
          "https://www.ombreeluci.it/2018/90-anni-di-jean/",
          "https://www.ombreeluci.it/2018/dinamiche-fondamentali/",
          "https://www.ombreeluci.it/2018/dialogo-aperto-n-143/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-144",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 144,
        display_title: "Numero 144 - In movimento",
        titolo_numero: "In movimento",
        seo_description: "Numero 144 \u2013 In movimento",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 144 \u2013 In movimento Anno 36, 2018 \u2013 Trimestrale: Ottobre, Novembre, Dicembre",
        descrizione_ai: null,
        anno_pubblicazione: 2018,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Ottobre, Novembre, Dicembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2019/01/Copertina_OeL_144_2018.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-144-in-movimento/",
        canonical_url: "https://www.ombreeluci.it/project/numero-144-in-movimento/",
        archive_org_item_id: "OmbreELuciN_144",
        archive_view_url: "https://archive.org/details/OmbreELuciN_144",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_144/oel-144.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2019/in-movimento/",
          "https://www.ombreeluci.it/2018/angelo-un-compagno-di-viaggio/",
          "https://www.ombreeluci.it/2018/eh-io-sono-qui/",
          "https://www.ombreeluci.it/2018/storia-di-unamicizia/",
          "https://www.ombreeluci.it/2018/raggi-di-sole/",
          "https://www.ombreeluci.it/2018/il-mistero-di-tanto-bene/",
          "https://www.ombreeluci.it/2018/non-era-normale/",
          "https://www.ombreeluci.it/2018/liberta/",
          "https://www.ombreeluci.it/2018/mi-chiamo-lucia/",
          "https://www.ombreeluci.it/2018/tutti-possono-essere-santi/",
          "https://www.ombreeluci.it/2018/anffas-60-anni-di-futuro/",
          "https://www.ombreeluci.it/2018/meglio-di-come-ci-si-aspetta/",
          "https://www.ombreeluci.it/2018/dalle-province-n-144/",
          "https://www.ombreeluci.it/2018/vite-straordinarie/",
          "https://www.ombreeluci.it/2019/fino-a-quando-la-mia-stella-brillera/",
          "https://www.ombreeluci.it/2019/wonder-giusy/",
          "https://www.ombreeluci.it/2019/la-segregazione-delle-persone-con-disabilita/",
          "https://www.ombreeluci.it/2019/i-bambini-di-asperger/",
          "https://www.ombreeluci.it/2018/dialogo-aperto-n-144/",
          "https://www.ombreeluci.it/2018/i-bambini-di-asperger/",
          "https://www.ombreeluci.it/2018/la-segregazione-delle-persone-con-disabilita/",
          "https://www.ombreeluci.it/2018/wonder-giusy/",
          "https://www.ombreeluci.it/2018/fino-a-quando-la-mia-stella-brillera/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-145",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 145,
        display_title: "Numero 145 - Vecchi a chi?",
        titolo_numero: "Vecchi a chi?",
        seo_description: "Da questo numero Ombre e Luci ha una nuova veste grafica e una nuova struttura dei contenuti. Il focus \xE8 dedicato alla disabilit\xE0 nella vecchiaia. Inoltre l\u2019intervista a Sergio Sciascia, storico componente della redazione.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 145 \u2013 Vecchi a chi? Anno 37, 2019 \u2013 Trimestrale: Gennaio, Febbraio, Marzo",
        descrizione_ai: null,
        anno_pubblicazione: 2019,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Gennaio, Febbraio, Marzo",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2019/04/vacchiaia-down.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-145-vecchi-a-chi/",
        canonical_url: "https://www.ombreeluci.it/project/numero-145-vecchi-a-chi/",
        archive_org_item_id: "OmbreELuciN_145",
        archive_view_url: "https://archive.org/details/OmbreELuciN_145",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_145/oel-145.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2019/preziosi-punti-di-vista/",
          "https://www.ombreeluci.it/2019/storie-di-cui-fare-tesoro/",
          "https://www.ombreeluci.it/2019/longevita-nella-disabilita/",
          "https://www.ombreeluci.it/2019/la-casa-famiglia-e-leta-che-avanza/",
          "https://www.ombreeluci.it/2019/un-anticipo-di-vecchiaia/",
          "https://www.ombreeluci.it/2019/la-curiosita-di-raccontare-il-mondo/",
          "https://www.ombreeluci.it/2019/storia-di-una-promessa-mantenuta/",
          "https://www.ombreeluci.it/2019/una-piazzetta-per-chi-diventa-anziano/",
          "https://www.ombreeluci.it/2019/nuova-ricetta-a-masterchef-una-delicatezza-non-pietosa/",
          "https://www.ombreeluci.it/2019/dialogo-aperto-n-145/",
          "https://www.ombreeluci.it/2019/dalle-province-n-145/",
          "https://www.ombreeluci.it/2019/faccio-salti-altissimi/",
          "https://www.ombreeluci.it/2019/il-mare-non-serve-a-niente/",
          "https://www.ombreeluci.it/2019/isacco-il-figlio-imperfetto/",
          "https://www.ombreeluci.it/2019/a-good-and-perfect-gift/",
          "https://www.ombreeluci.it/2019/non-ho-paura-perche-sono-lamica-del-cuore-di-sara/",
          "https://www.ombreeluci.it/2019/io-vado-poco-a-teatro/",
          "https://www.ombreeluci.it/2019/il-pittore-che-aveva-capito-tutto/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-146",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 146,
        display_title: "Numero 146 - Jean Vanier",
        titolo_numero: "Jean Vanier",
        seo_description: "Numero 146 \u2013 Jean Vanier",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 146 \u2013 Jean Vanier Anno 37, 2019 \u2013 Trimestrale: Aprile, Maggio, Giugno",
        descrizione_ai: null,
        anno_pubblicazione: 2019,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Aprile, Maggio, Giugno",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2019/07/OL-146-Jean.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-146-jean-vanier/",
        canonical_url: "https://www.ombreeluci.it/project/numero-146-jean-vanier/",
        archive_org_item_id: "OmbreELuciN_146",
        archive_view_url: "https://archive.org/details/OmbreELuciN_146",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_146/oel-146.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2019/uomo-del-regno/",
          "https://www.ombreeluci.it/2019/jean-e-il-carro-di-genevieve/",
          "https://www.ombreeluci.it/2019/il-coraggio-di-cambiare/",
          "https://www.ombreeluci.it/2019/levatrice-di-cose-nuove/",
          "https://www.ombreeluci.it/2019/ci-ha-fatto-vedere-cio-che-non-avevamo-ancora-visto/",
          "https://www.ombreeluci.it/2019/il-tesoro-nascosto-nel-campo/",
          "https://www.ombreeluci.it/2019/lautista-piu-illustre/",
          "https://www.ombreeluci.it/2019/il-tuo-ultimo-soffio/",
          "https://www.ombreeluci.it/1992/di-fronte-alle-persone-che-soffrono-fuggire-o-andare-incontro/",
          "https://www.ombreeluci.it/2019/la-tenerezza-di-jean-in-un-film/",
          "https://www.ombreeluci.it/2019/le-grandi-domande-della-vita/",
          "https://www.ombreeluci.it/2019/ho-incontrato-gesu-mi-ha-detto-ti-voglio-bene/",
          "https://www.ombreeluci.it/2019/la-comunita-luogo-del-perdono-e-della-festa-2/",
          "https://www.ombreeluci.it/2019/larmes-de-silence/",
          "https://www.ombreeluci.it/2019/daje-benedetta-daje-tu-bello/",
          "https://www.ombreeluci.it/2019/come-avrei-voluto-vederti-piu-spesso/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-147",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 147,
        display_title: "Numero 147 \u2013 Girotondo d'anime",
        titolo_numero: "Girotondo d'anime",
        seo_description: "Numero 147 \u2013 Girotondo d\u2019anime",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 147 \u2013 Girotondo di anime Anno 37, 2019 \u2013 Trimestrale: Luglio, Agosto, Settembre",
        descrizione_ai: null,
        anno_pubblicazione: 2019,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Luglio, Agosto, Settembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2019/10/OL-147.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-147-girotondo-danime/",
        canonical_url: "https://www.ombreeluci.it/project/numero-147-girotondo-danime/",
        archive_org_item_id: "OmbreELuciN_147",
        archive_view_url: "https://archive.org/details/OmbreELuciN_147",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_147/oel-147.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2019/chi-cura-le-anime/",
          "https://www.ombreeluci.it/2019/chiesa-accoglie-davvero/",
          "https://www.ombreeluci.it/2019/uno-dei-tanti/",
          "https://www.ombreeluci.it/2019/stai-pensando-me/",
          "https://www.ombreeluci.it/2019/dedica-cambiata/",
          "https://www.ombreeluci.it/2019/lucrezia-e-il-marco-di-ieri-e-di-oggi/",
          "https://www.ombreeluci.it/2019/alfabeto-che-manca/",
          "https://www.ombreeluci.it/2019/catalogo-prelibatezze/",
          "https://www.ombreeluci.it/2019/cantiere-buone-notizie",
          "https://www.ombreeluci.it/1984/cosa-dirvi-di-piu/",
          "https://www.ombreeluci.it/2019/dialogo-aperto-n-147/",
          "https://www.ombreeluci.it/2019/vita-fede-e-luce-n-147/",
          "https://www.ombreeluci.it/2019/elezione-responsabile/",
          "https://www.ombreeluci.it/2019/la-tua-vita-e-la-mia/",
          "https://www.ombreeluci.it/2019/questa-e-bella-la-storia-di-rospella/",
          "https://www.ombreeluci.it/2019/per-tutti-persone/",
          "https://www.ombreeluci.it/2019/amore-caro/",
          "https://www.ombreeluci.it/2019/dobbiamo-svagarci/",
          "https://www.ombreeluci.it/2019/sempre/",
          "https://www.ombreeluci.it/2019/cantiere-buone-notizie/",
          "https://www.ombreeluci.it/2019/teologia-disabilitante/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-148",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 148,
        display_title: "Numero 148 \u2013 L'incontro con la disabilit\xE0",
        titolo_numero: "L'incontro con la disabilit\xE0",
        seo_description: "In questo numero abbiamo voluto dare voce ad alcuni dei possibili incontri con la disabilit\xE0: in comunit\xE0, con gli amici, a lavoro.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 148 \u2013 L\u2019incontro con la disabilit\xE0 Anno 37, 2019 \u2013 Trimestrale: Ottobre, Novembre, Dicembre",
        descrizione_ai: null,
        anno_pubblicazione: 2019,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Ottobre, Novembre, Dicembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2019/12/OL148.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-148-lincontro-con-la-disabilita/",
        canonical_url: "https://www.ombreeluci.it/project/numero-148-lincontro-con-la-disabilita/",
        archive_org_item_id: "OmbreELuciN_148",
        archive_view_url: "https://archive.org/details/OmbreELuciN_148",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_148/oel-148.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2019/sconvolti-e-trasformati/",
          "https://www.ombreeluci.it/2020/caduta-cavallo/",
          "https://www.ombreeluci.it/2020/boston-chicago-arca/",
          "https://www.ombreeluci.it/2020/tenera-magnetica/",
          "https://www.ombreeluci.it/2020/vittorio-zia-minni/",
          "https://www.ombreeluci.it/2020/breccia-muro/",
          "https://www.ombreeluci.it/2020/unica-nel-suo-genere/",
          "https://www.ombreeluci.it/2019/lo-sguardo-sulla-persona-con-disabilita/",
          "https://www.ombreeluci.it/2020/non-tutto-buio/",
          "https://www.ombreeluci.it/1983/per-la-prima-volta-lontano-da-me/",
          "https://www.ombreeluci.it/2020/chiamare-nome-paura/",
          "https://www.ombreeluci.it/2020/dialogo-aperto-n-148/",
          "https://www.ombreeluci.it/2020/vita-fede-e-luce-n-148/",
          "https://www.ombreeluci.it/2020/la-straniera/",
          "https://www.ombreeluci.it/2020/whos-my-neighbor/",
          "https://www.ombreeluci.it/2020/vite-straordinarie-2/",
          "https://www.ombreeluci.it/2020/con-occhi-padre/",
          "https://www.ombreeluci.it/2020/curva-sud/",
          "https://www.ombreeluci.it/2020/mio-cugino-paolo/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-149",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 149,
        display_title: "Numero 149 - Io, la moda",
        titolo_numero: "Io, la moda",
        seo_description: "Indagando la costruzione di paradigmi e pratiche che siano davvero inclusivi, siamo giunti a conclusioni molto interessanti sul rapporto tra moda e disabilit\xE0.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 149 \u2013 Io, la moda Anno 38, 2020 \u2013 Trimestrale: Gennaio, Febbraio, Marzo",
        descrizione_ai: null,
        anno_pubblicazione: 2020,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Gennaio, Febbraio, Marzo",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2020/02/OL149-Copertina-in-evidenza-1.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-149-io-la-moda/",
        canonical_url: "https://www.ombreeluci.it/project/numero-149-io-la-moda/",
        archive_org_item_id: "OmbreELuciN_149",
        archive_view_url: "https://archive.org/details/OmbreELuciN_149",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_149/oel-149.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2019/sconvolti-e-trasformati/",
          "https://www.ombreeluci.it/2020/caduta-cavallo/",
          "https://www.ombreeluci.it/2020/boston-chicago-arca/",
          "https://www.ombreeluci.it/2020/tenera-magnetica/",
          "https://www.ombreeluci.it/2020/vittorio-zia-minni/",
          "https://www.ombreeluci.it/2020/breccia-muro/",
          "https://www.ombreeluci.it/2020/unica-nel-suo-genere/",
          "https://www.ombreeluci.it/2019/lo-sguardo-sulla-persona-con-disabilita/",
          "https://www.ombreeluci.it/2020/non-tutto-buio/",
          "https://www.ombreeluci.it/1983/per-la-prima-volta-lontano-da-me/",
          "https://www.ombreeluci.it/2020/chiamare-nome-paura/",
          "https://www.ombreeluci.it/2020/dialogo-aperto-n-148/",
          "https://www.ombreeluci.it/2020/vita-fede-e-luce-n-148/",
          "https://www.ombreeluci.it/2020/la-straniera/",
          "https://www.ombreeluci.it/2020/whos-my-neighbor/",
          "https://www.ombreeluci.it/2020/vite-straordinarie-2/",
          "https://www.ombreeluci.it/2020/con-occhi-padre/",
          "https://www.ombreeluci.it/2020/curva-sud/",
          "https://www.ombreeluci.it/2020/mio-cugino-paolo/",
          "https://www.ombreeluci.it/2020/per-le-strade-di-roma/",
          "https://www.ombreeluci.it/2020/dialogo-aperto-n-149/",
          "https://www.ombreeluci.it/2020/la-bambina-morbida/",
          "https://www.ombreeluci.it/2020/imperfetta/",
          "https://www.ombreeluci.it/2020/che-cose-una-sindrome/",
          "https://www.ombreeluci.it/2020/negozi-e-pantaloni/",
          "https://www.ombreeluci.it/2020/la-nostra-casa-e-in-fiamme/",
          "https://www.ombreeluci.it/2020/vedersi-in-vetrina/",
          "https://www.ombreeluci.it/2020/jillian-la-divina/",
          "https://www.ombreeluci.it/2020/sfilate-da-sogno/",
          "https://www.ombreeluci.it/2020/quel-che-labito-fa/",
          "https://www.ombreeluci.it/2020/la-rivoluzione-copernicana-di-lucas/",
          "https://www.ombreeluci.it/2020/vita-delle-province-n-149/",
          "https://www.ombreeluci.it/2020/quaranta-occhi-puntati-dritti-su-di-te/",
          "https://www.ombreeluci.it/2020/tranquilla-e-soddisfatta-di-me-stessa/",
          "https://www.ombreeluci.it/2020/se-lo-diceva-coco-chanel/",
          "https://www.ombreeluci.it/2020/il-corpo-dellamore/",
          "https://www.ombreeluci.it/2020/chi-risponde-alle-domande/",
          "https://www.ombreeluci.it/1993/grazie-per-avermelo-fatto-fare-da-sola/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-150",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 150,
        display_title: "Numero 150 \u2013 Protagonisti",
        titolo_numero: "Protagonisti",
        seo_description: "Raccontiamo quando la disabilit\xE0 \xE8 protagonista dello schermo, grande o piccolo che sia.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 150 \u2013 Protagonisti Anno 38, 2020 \u2013 Trimestrale: Aprile, Maggio, Giugno",
        descrizione_ai: null,
        anno_pubblicazione: 2020,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Aprile, Maggio, Giugno",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2020/05/Copertina-in-evidenza-OL-150.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-150-protagonisti/",
        canonical_url: "https://www.ombreeluci.it/project/numero-150-protagonisti/",
        archive_org_item_id: "OmbreELuciN_150",
        archive_view_url: "https://archive.org/details/OmbreELuciN_150",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_150/oel-150.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2020/e-sono-150/",
          "https://www.ombreeluci.it/2020/la-varieta-in-cui-viviamo/",
          "https://www.ombreeluci.it/2020/interpreti-di-se-stessi/",
          "https://www.ombreeluci.it/2020/give-me-liberty/",
          "https://www.ombreeluci.it/2020/years-and-years/",
          "https://www.ombreeluci.it/2020/quando-ho-recitato-sottovento/",
          "https://www.ombreeluci.it/2020/due-fratelli-e-la-brigata-inglese/",
          "https://www.ombreeluci.it/2019/speciale-cinema-e-disabilita/",
          "https://www.ombreeluci.it/2020/corrispondenze-e-zoomate-dalla-russia/",
          "https://www.ombreeluci.it/2020/una-piccola-malga/",
          "https://www.ombreeluci.it/2020/risposte-concrete-per-bisogni-concreti/",
          "https://www.ombreeluci.it/2020/sensuability/",
          "https://www.ombreeluci.it/2002/abitare-la-speranza/",
          "https://www.ombreeluci.it/2020/dialogo-aperto-n-150/",
          "https://www.ombreeluci.it/2020/vita-delle-province-n-150/",
          "https://www.ombreeluci.it/2020/vicini-a-distanza/",
          "https://www.ombreeluci.it/2020/il-dono-oscuro/",
          "https://www.ombreeluci.it/2020/i-bambini-sono-speranza/",
          "https://www.ombreeluci.it/2020/diversi/",
          "https://www.ombreeluci.it/2020/tempo-di-imparare-valeria-parrella-recensione-libro/",
          "https://www.ombreeluci.it/2020/la-differenza-tra-shakespeare-e-insinna/",
          "https://www.ombreeluci.it/2020/come-sono-cambiato-in-questi-anni/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-151",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 151,
        display_title: "Numero 151 - Viaggio nell'arte",
        titolo_numero: "Viaggio nell'arte",
        seo_description: "\xC8 un lungo viaggio nell\u2019arte quello proposto dal nuovo numero di Ombre e Luci. L\u2019intervista di apertura \xE8 a Sante Bandirali, co-fondatore di Uovonero. E ancora, la testimonianza di Stefano Nasuti, futuro trustee in base alla legge sul dopo di noi.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 151 \u2013 Viaggio nell\u2019arte Anno 38, 2020 \u2013 Trimestrale: Luglio, Agosto, Settembre",
        descrizione_ai: null,
        anno_pubblicazione: 2020,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Luglio, Agosto, Settembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2020/07/OL-151-Copertina.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-151-viaggio-nellarte/",
        canonical_url: "https://www.ombreeluci.it/project/numero-151-viaggio-nellarte/",
        archive_org_item_id: "OmbreELuciN_151",
        archive_view_url: "https://archive.org/details/OmbreELuciN_151",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_151/oel-151.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2020/nutrire-talenti/",
          "https://www.ombreeluci.it/2020/il-linguaggio-dellarte/",
          "https://www.ombreeluci.it/2020/metti-da-parte-la-fretta/",
          "https://www.ombreeluci.it/2020/ferma-lo-sguardo/",
          "https://www.ombreeluci.it/2020/estemporanea-e-personale/",
          "https://www.ombreeluci.it/2020/buongustaio-dellarte/",
          "https://www.ombreeluci.it/2020/intervista-sante-bandirali-uovonero/",
          "https://www.ombreeluci.it/2020/forse-una-ragione-ce/",
          "https://www.ombreeluci.it/2020/museo-per-tutti/",
          "https://www.ombreeluci.it/2020/accarezzando-insieme-lerba/",
          "https://www.ombreeluci.it/1988/lavorando-insieme-un-pomeriggio-chiamato-laboratorio/",
          "https://www.ombreeluci.it/2020/dialogo-aperto-n-151/",
          "https://www.ombreeluci.it/2022/vita-delle-province-n-151/",
          "https://www.ombreeluci.it/2020/noi-non-io/",
          "https://www.ombreeluci.it/2020/il-cuore-e-una-selva-recensione/",
          "https://www.ombreeluci.it/2020/il-chiosco-recensione/",
          "https://www.ombreeluci.it/2020/malintesi/",
          "https://www.ombreeluci.it/2020/unesperienza-personale-recensione/",
          "https://www.ombreeluci.it/2020/caro-presidente-sergio-mattarella/",
          "https://www.ombreeluci.it/2020/natura-e-musica/",
          "https://www.ombreeluci.it/2020/luovo-nero-recensione/",
          "https://www.ombreeluci.it/2020/vita-delle-province-n-151/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-152",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 152,
        display_title: "Numero 152 - Adozioni",
        titolo_numero: "Adozioni",
        seo_description: "Questo ricchissimo numero \u2013 aperto dall\u2019intervista a Giampiero Griffo, presidente della rete italiana disabilit\xE0 e sviluppo \u2013 contiene, oltre al focus sulle adozioni, una gran bella sorpresa: la lettera del presidente Sergio Mattarella giunta in redazione.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 152 \u2013 Adozioni Anno 38, 2020 \u2013 Trimestrale: Ottobre, Novembre, Dicembre",
        descrizione_ai: null,
        anno_pubblicazione: 2020,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Ottobre, Novembre, Dicembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2020/11/Copertina_OeL_152_2020.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-152-adozioni/",
        canonical_url: "https://www.ombreeluci.it/project/numero-152-adozioni/",
        archive_org_item_id: "OmbreELuciN_152",
        archive_view_url: "https://archive.org/details/OmbreELuciN_152",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_152/oel-152.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2021/biglietti-e-disegni/",
          "https://www.ombreeluci.it/2021/gia-nostro-figlio/",
          "https://www.ombreeluci.it/2021/luca-adotta-alba/",
          "https://www.ombreeluci.it/2020/vangelo-immaginazione-e-intelligenza/",
          "https://www.ombreeluci.it/2021/il-diritto-di-chi/",
          "https://www.ombreeluci.it/2021/intervista-giampiero-griffo/",
          "https://www.ombreeluci.it/2021/cosa-si-potrebbe-imparare-dai-banchi-monoposto/",
          "https://www.ombreeluci.it/2021/cosa-ce-oltre-la-scuola/",
          "https://www.ombreeluci.it/2021/37-seconds-recensione/",
          "https://www.ombreeluci.it/1988/paolo-e-chiara/",
          "https://www.ombreeluci.it/2020/in-ricordo-di-aldo/",
          "https://www.ombreeluci.it/2020/vita-delle-province-n-152/",
          "https://www.ombreeluci.it/2021/guida-per-le-comunita/",
          "https://www.ombreeluci.it/2021/recensione-mia-sorella-mi-rompe-le-balle-tercon/",
          "https://www.ombreeluci.it/2021/recensione-i-disegni-segreti/",
          "https://www.ombreeluci.it/2021/viaggio-italia-recensione/",
          "https://www.ombreeluci.it/2021/grazie-papa-don-carlo-recensione/",
          "https://www.ombreeluci.it/2021/ho-votato/",
          "https://www.ombreeluci.it/2021/io-non-lo-so-cosa-mi-aspetto-dal-futuro/",
          "https://www.ombreeluci.it/2021/periodo-pesante-su-spalle-e-cuore/",
          "https://www.ombreeluci.it/2020/un-dialogo-aperto-molto-speciale/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-153",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 153,
        display_title: "Numero 153 \u2013 Nello spazio e nel tempo",
        titolo_numero: "Nello spazio e nel tempo",
        seo_description: "Numero 153 \u2013 Nello spazio e nel tempo",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 153 \u2013 Nello spazio e nel tempo Anno 39, 2021 \u2013 Trimestrale: Gennaio, Febbraio, Marzo",
        descrizione_ai: null,
        anno_pubblicazione: 2021,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Gennaio, Febbraio, Marzo",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2021/03/OL-153-sd.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-153-nello-spazio-e-nel-tempo/",
        canonical_url: "https://www.ombreeluci.it/project/numero-153-nello-spazio-e-nel-tempo/",
        archive_org_item_id: "OmbreELuciN_152",
        archive_view_url: "https://archive.org/details/OmbreELuciN_152",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_152/oel-152.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2021/tutta-unaltra-storia/",
          "https://www.ombreeluci.it/2021/per-una-storia-della-disabilita/",
          "https://www.ombreeluci.it/2021/il-crimine-di-eva/",
          "https://www.ombreeluci.it/2021/nella-casa-di-dario/",
          "https://www.ombreeluci.it/2021/the-crown-cugine-autismo/",
          "https://www.ombreeluci.it/1985/vita-fede-e-luce-n-10-ricordo-di-don-dario/",
          "https://www.ombreeluci.it/2021/una-piccola-matita-nelle-sue-mani/",
          "https://www.ombreeluci.it/2021/dialogo-aperto-n-153/",
          "https://www.ombreeluci.it/2021/imparare-a-cadere-recensione/",
          "https://www.ombreeluci.it/2021/dove-crescono-i-cocomeri-recensione/",
          "https://www.ombreeluci.it/2020/che-significa-essere-fedeli-alleredita-che-si-e-ricevuta/",
          "https://www.ombreeluci.it/2021/marie-la-strabica-recensione/",
          "https://www.ombreeluci.it/2021/bella-ma-inutile-cronache-da-trigoria/",
          "https://www.ombreeluci.it/2021/e-bello-avere-un-posto-dove-lavorare/",
          "https://www.ombreeluci.it/2021/la-risposta-di-gesu/",
          "https://www.ombreeluci.it/2021/marco-cavallo/",
          "https://www.ombreeluci.it/2021/eredita-dei-vivi-recensione/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-154",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 154,
        display_title: "Numero 154 \u2013 Guardami questa/questo sono io",
        titolo_numero: "Guardami questa/questo sono io",
        seo_description: "Numero 154 \u2013 Guardami questa/questo sono io",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 154 \u2013 Guardami, questa/questo sono io Anno 39, 2021 \u2013 Trimestrale: Aprile, Maggio, Giugno",
        descrizione_ai: null,
        anno_pubblicazione: 2021,
        anno_collezione: null,
        periodicita: "trimestrale",
        periodo_label: "Aprile, Maggio, Giugno",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2021/06/Copertina_OeL_154_2021.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-154-guardami-questa-questo-sono-io/",
        canonical_url: "https://www.ombreeluci.it/project/numero-154-guardami-questa-questo-sono-io/",
        archive_org_item_id: "OmbreELuciN_154",
        archive_view_url: "https://archive.org/details/OmbreELuciN_154",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_154/oel-154.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2021/maneggiare-con-cura-di-marco-bove-recensione/",
          "https://www.ombreeluci.it/2021/nove-punti/",
          "https://www.ombreeluci.it/2021/inneschiamo-la-valanga/",
          "https://www.ombreeluci.it/2021/cosa-ce-sotto-gli-aggettivi/",
          "https://www.ombreeluci.it/2021/con-gli-occhi-di-corrado/",
          "https://www.ombreeluci.it/2021/chi-mettere-al-centro-dellobiettivo/",
          "https://www.ombreeluci.it/2021/eliminarli-dalla-nostra-vista/",
          "https://www.ombreeluci.it/2021/far-vivere-il-luogo-e-le-persone-di-cui-si-e-custodi/",
          "https://www.ombreeluci.it/1985/bocca-ride-ma-occhi-non-buoni/",
          "https://www.ombreeluci.it/2021/mio-figlio-che-non-voleva-vedermi-piangere/",
          "https://www.ombreeluci.it/2021/quante-cose-possono-nascere-intorno-a-un-libro/",
          "https://www.ombreeluci.it/2021/piccole-cronache-dalla-lunigiana/",
          "https://www.ombreeluci.it/2021/incapace-di-reinventarsi/",
          "https://www.ombreeluci.it/2021/pablo-che-vede-il-mondo-a-modo-suo/",
          "https://www.ombreeluci.it/2021/dialogo-aperto-n-154/",
          "https://www.ombreeluci.it/2021/una-specie-di-scintilla-recensione/",
          "https://www.ombreeluci.it/2021/e-poi-saremo-salvi-recensione/",
          "https://www.ombreeluci.it/2021/quello-che-non-uccide-recensione/",
          "https://www.ombreeluci.it/2021/padel-una-parola-che-non-si-capisce/",
          "https://www.ombreeluci.it/2021/tornando-a-casa/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-155",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 155,
        display_title: "Numero 155 \u2013 Lavoro",
        titolo_numero: "Lavoro",
        seo_description: "Oggi, in Italia, per le persone con disabilit\xE0 il lavoro \xE8 un diritto, una realt\xE0 o una chimera? Armati di qualche dato, abbiamo intrapreso un viaggio",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 155 \u2013 Lavoro Anno 39 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 2021",
        descrizione_ai: null,
        anno_pubblicazione: 2021,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2021/09/Copertina_OeL_155_2021.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-155-lavoro/",
        canonical_url: "https://www.ombreeluci.it/project/numero-155-lavoro/",
        archive_org_item_id: "OmbreELuciN_155",
        archive_view_url: "https://archive.org/details/OmbreELuciN_155",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_155/oel-155.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2021/sogni-per-niente-speciali/",
          "https://www.ombreeluci.it/2021/mi-sento-grande/",
          "https://www.ombreeluci.it/2021/dietro-le-quinte-di-unassunzione/",
          "https://www.ombreeluci.it/2021/diario-di-efrem-lavoratore/",
          "https://www.ombreeluci.it/2021/quarantadue-chilometri-tra-bellizzi-e-new-york/",
          "https://www.ombreeluci.it/2021/quel-regalo-immenso-chiamato-vaccino/",
          "https://www.ombreeluci.it/2021/stasera-milonga/",
          "https://www.ombreeluci.it/2021/un-fiume-lungo-quanto-il-mediterraneo/",
          "https://www.ombreeluci.it/2021/sentire-la-fine-del-mondo/",
          "https://www.ombreeluci.it/2002/carlo-maria-martini-noi-il-lavoro-oggi/",
          "https://www.ombreeluci.it/2021/dialogo-aperto-n-155/",
          "https://www.ombreeluci.it/2021/e-questo-e-niente-recensione/",
          "https://www.ombreeluci.it/2021/ragazza-aspy-di-agnese-spotorno-recensione/",
          "https://www.ombreeluci.it/2021/i-ragazzi-della-via-pascoli-recensione/",
          "https://www.ombreeluci.it/2021/frammenti-di-solitudine-recensione/",
          "https://www.ombreeluci.it/2021/perche-il-mare-non-e-sempre-lo-stesso/",
          "https://www.ombreeluci.it/2021/visita-a-roccamonfina/"
        ],
        issues: []
      },
      {
        id_numero: "OEL-156",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 156,
        display_title: "Numero 156 - Alle radici di cinquant'anni di storia",
        titolo_numero: "Alle radici di cinquant'anni di storia",
        seo_description: "Numero 156 \u2013 Alle radici di cinquant\u2019anni di storia",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 156 \u2013 Alle radici di cinquant\u2019anni di storia Anno 39 \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 2021 Sommario Ai cinquant\u2019anni di Fede e Luce abbiamo dedicato il focus di OL 4/2021: il men\xF9 \xE8 ricchissimo! C\u2019\xE8 il racconto, con molti particolari inediti, della co-fondatrice Marie-H\xE9l\xE8ne Mathieu; ci sono i ritratti di tante persone a cui si deve il pellegrinaggio a Lourdes nel 1971 da cui tutto nacque \u2013 Lo\xEFc Proffit, che oggi ha 65 anni e vive all\u2019Arca di Trosly (Angela Grassi), la battagliera suor Ida Maria Ferri e il genetista Jerome Lejeune, proclamato proprio quest\u2019anno servo di Dio (Cristina Tersigni) \u2013 e ci sono le parole di uno dei partecipanti, Enzo Ferrazzoli (futuro co-firmatario della costituzione legale di FL Italia); chiude il focus Papa Francesco colto a \xABfar comunit\xE0\xBB, nella cronaca dell\u2019udienza dello scorso ottobre (Vito Giannulo). O&L si apre con l\u2019intervista di Cristina Tersigni a Emanuela Posa: con lei arriviamo fino alla Repubblica Democratica del Congo dove la giovane cooperante si occupa di diversi progetti per bambini e adulti con disabilit\xE0. Il numero prosegue con la testimonianza di monsignor Intini (referente di FL presso la Cei) che, rif\u2026",
        descrizione_ai: null,
        anno_pubblicazione: 2021,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2021/11/Copertina_OeL_156_2021.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-156-alle-radici-di-cinquantanni-di-storia/",
        canonical_url: "https://www.ombreeluci.it/project/numero-156-alle-radici-di-cinquantanni-di-storia/",
        archive_org_item_id: "OmbreELuciN_156",
        archive_view_url: "https://archive.org/details/OmbreELuciN_156",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_156/oel-156.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2022/stupiti-e-grati/",
          "https://www.ombreeluci.it/2022/come-non-perdere-cio-che-abbiamo-vissuto/",
          "https://www.ombreeluci.it/2022/jerome-lejeune/",
          "https://www.ombreeluci.it/2022/loic-che-oggi-continua-a-benedirci/",
          "https://www.ombreeluci.it/2022/le-caramelle-e-la-forza-di-suor-ida-maria-ferri/",
          "https://www.ombreeluci.it/1974/insieme-primo-articolo/",
          "https://www.ombreeluci.it/2022/e-nato-qualcosa-che-nessuno-aveva-previsto/",
          "https://www.ombreeluci.it/2022/poco-a-sud-dellequatore/",
          "https://www.ombreeluci.it/2022/le-donne-e-gli-uomini-della-seconda-fila/",
          "https://www.ombreeluci.it/2022/dai-tram-notturni-alle-luci-del-palco/",
          "https://www.ombreeluci.it/2021/quel-che-si-guarda-ma-non-si-vede/",
          "https://www.ombreeluci.it/2022/stavolta-ho-tifato-per-la-primavera-dellempoli/",
          "https://www.ombreeluci.it/2022/loro-che-sta-per-terra/",
          "https://www.ombreeluci.it/2022/dialogo-aperto-n-156/",
          "https://www.ombreeluci.it/2022/noi-due-siamo-uno-recensione/",
          "https://www.ombreeluci.it/2022/speranza-recensione/",
          "https://www.ombreeluci.it/2022/basaglia-il-dottore-dei-matti-recensione/",
          "https://www.ombreeluci.it/2022/il-mistero-del-london-eye-recensione/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-157",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 157,
        display_title: "Numero 157 - Mai per caso",
        titolo_numero: "Mai per caso",
        seo_description: "In questo numero: Mai per caso, focus dedicato agli animali; intervista a Angela Gattulli, presidente di Fede e Luce; rubriche, recensioni e testimonianze!",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 157 \u2013 Mai per caso Anno 40 \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2022 Sommario \xABQuando sono entrata nel movimento ho scoperto un mondo (\u2026). Alcune disabilit\xE0 non le avevo mai viste, non avevo avuto mai un compagno con handicap a scuola o al catechismo\xBB. Aveva vent\u2019anni Angela Gattulli quando ha conosciuto Fede e Luce e trent\u2019anni dopo, al secondo e \xABassolutamente\xBB ultimo mandato da rappresentante legale dell\u2019associazione, ripercorre con Giulia Galeotti le svolte importanti per la sua vita. E per il mandato di presidente in una realt\xE0 che, \xABaiutando tante famiglie a varcare la porta di casa\xBB, ha saputo darle la gioia di infangarsi come in una pozzanghera trovata per strada: un\u2019esperienza che, dice Angela, dovremmo mettere a disposizione di quei giovani che vediamo oggi aver tanta necessit\xE0 di esperienze belle e concrete. Il focus \xE8 invece dedicato agli animali: ne scrivono Nicla Bettazzi e Nadia Pastori, mamme di ragazzi con disabilit\xE0, sottolineando la possibile normalit\xE0 sperimentata dai loro figli vicino a un animale. Conosciamo quindi Rodano, Pato e Romeo con gli occhi dei loro umani Laura Coccia, Simona Greco ed Edoardo: \xABLegami unici e indissolubili\xBB che\u2026",
        descrizione_ai: null,
        anno_pubblicazione: 2022,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2022/03/Copertina_OeL_157_2022.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-157-mai-per-caso/",
        canonical_url: "https://www.ombreeluci.it/project/numero-157-mai-per-caso/",
        archive_org_item_id: "OmbreELuciN_157",
        archive_view_url: "https://archive.org/details/OmbreELuciN_157",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_157/oel-157.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2022/mirtilla-e-il-capitano/",
          "https://www.ombreeluci.it/2022/grido-di-pace/",
          "https://www.ombreeluci.it/2022/quel-riserbo-che-ha-conquistato-mio-figlio/",
          "https://www.ombreeluci.it/2022/il-mio-pato-che-si-fa-sempre-trovare/",
          "https://www.ombreeluci.it/2022/da-quellarmadio/",
          "https://www.ombreeluci.it/2022/larte-di-rialzarsi/",
          "https://www.ombreeluci.it/2022/chiediamo-a-zampetta-e-romeo/",
          "https://www.ombreeluci.it/2022/messe-le-basi-e-tempo-di-ricostruire/",
          "https://www.ombreeluci.it/2022/viale-di-valle-aurelia/",
          "https://www.ombreeluci.it/2022/fanny-che-vede-un-futuro-per-se-stessa/",
          "https://www.ombreeluci.it/2022/tutti-portano-tutti-ricevono/",
          "https://www.ombreeluci.it/2022/e-se-essere-sordi-fosse-un-superpotere/",
          "https://www.ombreeluci.it/2022/dialogo-aperto-n-157/",
          "https://www.ombreeluci.it/2022/la-cosa-piu-bellissima/",
          "https://www.ombreeluci.it/2022/parlo-di-quello-che-so/",
          "https://www.ombreeluci.it/1998/maria-e-i-delfini/",
          "https://www.ombreeluci.it/2022/lotta-per-linclusione-recensione/",
          "https://www.ombreeluci.it/2022/30-giorni-per-capire-lautismo-recensione/",
          "https://www.ombreeluci.it/2022/archeocasilina-recensione/",
          "https://www.ombreeluci.it/2022/la-cura-dellamore-recensione/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-158",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 158,
        display_title: "Numero 158 - Perch\xE9? Elaborare il lutto",
        titolo_numero: "Perch\xE9? Elaborare il lutto",
        seo_description: "Numero 2 del 2022, con intervista a Anna Cardinaletti e focus sull'elaborazione del lutto.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 158 \u2013 Perch\xE9? Anno 40 \u2013 Numero 1 \u2013 Aprile \u2013 Maggio \u2013 Giugno 2022 Sommario Se l\u2019elaborazione del lutto \xE8 impresa difficile per tutti, essa diventa ancora pi\xF9 impervia quando i protagonisti sono persone con disabilit\xE0 intellettiva: \xABIl dolore della morte non deve essere sottovalutato \u2013 scrive Cristina Tersigni nell\u2019editoriale \u2013 se le possibilit\xE0 cognitive di comprensione ed espressione sono compromesse\xBB. Con articoli di Anna Maria Canonico, Cristina Cangemi, Matteo Tobanelli, Ivana Perri, Tiziana D\u2019Ambrosio e Chiara Gatti, il focus di questo numero affronta dunque un tema complesso, ma imprescindibile. Apre O&L n. 158 l\u2019intervista di Silvia Camisasca ad Anna Cardinaletti, pioniera nel campo della sordit\xE0. Seguono le riflessioni di don Marco Bove sul senso della preghiera per la pace; l\u2019incontro con l\u2019associazione \u201CLupi a rotelle\u201D di Cosenza firmato da Enrica Riera; i suggerimenti cinematografici (di dolorosa attualit\xE0) di Claudio Cinus. Liliana Ghiringhelli presenta invece due catechiste con disabilit\xE0 di una parrocchia milanese: Nora Buccheri e Paola Colombo. Chiudono i nostri suggerimenti di lettura e le immancabili le rubriche di Benedetta Mattei e Giovanni Gr\u2026",
        descrizione_ai: null,
        anno_pubblicazione: 2022,
        anno_collezione: null,
        periodicita: "mensile",
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2022/05/Copertina_OeL_158_2022.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-158-perche-elaborare-il-lutto/",
        canonical_url: "https://www.ombreeluci.it/project/numero-158-perche-elaborare-il-lutto/",
        archive_org_item_id: "OmbreELuciN_158",
        archive_view_url: "https://archive.org/details/OmbreELuciN_158",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_158/oel-158.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2022/perche/",
          "https://www.ombreeluci.it/2022/papa-dove-sei/",
          "https://www.ombreeluci.it/2022/affrontare-la-perdita/",
          "https://www.ombreeluci.it/2022/come-abbiamo-comunicato-la-morte-di-una-persona-cara/",
          "https://www.ombreeluci.it/2022/cammino-di-trasformazione/",
          "https://www.ombreeluci.it/2022/riannodare-il-filo/",
          "https://www.ombreeluci.it/2022/se-le-universita-sono-state-le-prime-ad-ascoltare/",
          "https://www.ombreeluci.it/2022/serve-davvero-pregare-per-la-pace/",
          "https://www.ombreeluci.it/2022/tifosi-dellaccessibilita/",
          "https://www.ombreeluci.it/2022/fotografie-da-chernobyl-allafghanistan/",
          "https://www.ombreeluci.it/2022/qualche-volta-voglio-e-qualche-volta-no/",
          "https://www.ombreeluci.it/2022/mi-piace-andare-al-mare/",
          "https://www.ombreeluci.it/2022/specialita-catechista/",
          "https://www.ombreeluci.it/2022/dialogo-aperto-n-158/",
          "https://www.ombreeluci.it/2018/voglia-di-comunicare/",
          "https://www.ombreeluci.it/2022/siamo-una-rivoluzione-recensione/",
          "https://www.ombreeluci.it/2022/sono-vincent-e-non-ho-paura-recensione/",
          "https://www.ombreeluci.it/2022/per-sempre-altrove-recensione/",
          "https://www.ombreeluci.it/2022/modus-navigandi-recensione/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-159",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 159,
        display_title: "Numero 159 - A che gioco giochiamo?",
        titolo_numero: "A che gioco giochiamo?",
        seo_description: "L'ultimo numero di Ombre e Luci \xE8 tutto dedicato ai giochi! Liberate la fantasia, a che gioco giochiamo?",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 159 \u2013 A che gioco giochiamo? Anno 40 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 2022 Collaboratrice d\u2019antan della rivista, Tea Mazzarotto ci chiese di proporre giochi adatti a tanti nelle nostre pagine: l\u2019idea ci conquist\xF2 immediatamente! Cos\xEC \u2013 con il suo prezioso aiuto ed esperienza, e grazie alla fantasia e alle preziose mani di Arianna Floris e Matteo Cinti \u2013 abbiamo preparato un numero speciale e unico di Ombre e Luci: dalla copertina (che vi affidiamo\u2026 in senso letterale!) al focus (dieci pagine ricchissime di giochi!) la rivista \xE8, pi\xF9 che mai, pronta a partire in vacanza con voi. Scommettiamo che sar\xE0 un ottimo consiglio? Aspettiamo i vostri commenti! Un assaggio intanto potete gustarlo qui . Buone vacanze! Editoriale Pagine bianche di Cristina Tersigni Focus: A che gioco giochiamo Tempo di vacanze e divertimento di Emanuele Bertolini, Matteo Cinti, Arianna Floris, Tea Mazzarotto e Cristina Tersigni Articoli Produzioni fuori dal comune di Cristina Tersigni TikiTaka di Giovanni Vergani La rivoluzione del coltello di Cristina Tersigni Questa cosa non mi piace per niente di Benedetta Mattei Non perdo mai un incontro di Giovanni Grossi Dall\u2019archivio Andiamo a\u2026",
        descrizione_ai: null,
        anno_pubblicazione: 2022,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2022/08/Copertina_OeL_159_2022.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-159-a-che-gioco-giochiamo/",
        canonical_url: "https://www.ombreeluci.it/project/numero-159-a-che-gioco-giochiamo/",
        archive_org_item_id: "OmbreELuciN_159",
        archive_view_url: "https://archive.org/details/OmbreELuciN_159",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_159/oel-159.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2022/pagine-bianche/",
          "https://www.ombreeluci.it/2022/giochi-2022/",
          "https://www.ombreeluci.it/2022/produzioni-fuori-dal-comune/",
          "https://www.ombreeluci.it/2022/tikitaka/",
          "https://www.ombreeluci.it/2022/la-rivoluzione-del-coltello/",
          "https://www.ombreeluci.it/2022/questa-cosa-non-mi-piace-per-niente/",
          "https://www.ombreeluci.it/2022/non-perdo-mai-un-incontro/",
          "https://www.ombreeluci.it/1994/andiamo-a-giocare/",
          "https://www.ombreeluci.it/1994/cantare-giocare-comunicare/",
          "https://www.ombreeluci.it/2022/festa-al-quirinale/",
          "https://www.ombreeluci.it/2022/dialogo-aperto-n-159/",
          "https://www.ombreeluci.it/1998/ognuno-a-modo-suo/",
          "https://www.ombreeluci.it/2022/giuditta-e-lorecchio-del-diavolo-recensione/",
          "https://www.ombreeluci.it/2022/il-silenzio-del-mondo-recensione/",
          "https://www.ombreeluci.it/2022/perche-non-lo-portate-a-lourdes-recensione/",
          "https://www.ombreeluci.it/2022/ognuno-ride-a-modo-suo-recensione/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-160",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 160,
        display_title: "Numero 160 \u2013 Ruote nuove su occhi nuovi",
        titolo_numero: "Ruote nuove su occhi nuovi",
        seo_description: "Numero 160 \u2013 Ruote nuove su occhi nuovi",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 160 \u2013 Ruote nuove su occhi nuovi Anno 40 \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 2022 Editoriale Declinazioni di speranza di Cristina Tersigni Focus: Per pedalare tutti Otto giorni per vent\u2019anni di Cristina Tersigni Tandem in Trentino di Andrea Posa Invertire gli addendi di Cristina Tersigni Bari scintillante di Cristina Tersigni \xABCe l\u2019abbiamo fatta!\xBB di Giampaolo Mattei Articoli Alberta e la Rivoluzione di Giulia Galeotti Alla ricerca dell\u2019altro da me di Giulia Cirillo Il piacere del contatto di Enrica Riera Il mondo come lo vediamo noi di Matteo Cinti Fiera di me stessa di Benedetta Mattei E.T. alla Bicoca di Giovanni Grossi Dall\u2019archivio Avete mai provato\u2026 di Mariangela Bertolini Rubriche Campi di giochi Dialogo aperto Libri A sua immagine? a cura di A. Fontana e G. Merlo La pi\xF9 bella nuotata della mia vita , Anne Becker Abbassa il cielo e scendi , Giorgio Boatti Il grande cavallo blu di Ir\xE8ne Cohen-Janca e Maurizio A.C. Quarello",
        descrizione_ai: null,
        anno_pubblicazione: 2022,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2022/12/Copertina_OeL_160_2022.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-160-ruote-nuove-su-occhi-nuovi/",
        canonical_url: "https://www.ombreeluci.it/project/numero-160-ruote-nuove-su-occhi-nuovi/",
        archive_org_item_id: "OmbreELuciN_160",
        archive_view_url: "https://archive.org/details/OmbreELuciN_160",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_160/oel-160.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2022/declinazioni-di-speranza/",
          "https://www.ombreeluci.it/2023/arche-bologna-tandem/",
          "https://www.ombreeluci.it/2023/tandem-in-trentino/",
          "https://www.ombreeluci.it/2023/invertire-addendi-tandem/",
          "https://www.ombreeluci.it/2023/bari-scintillante/",
          "https://www.ombreeluci.it/2023/ciclisti-non-vedenti-vaticano/",
          "https://www.ombreeluci.it/2023/alberta-e-la-rivoluzione/",
          "https://www.ombreeluci.it/2023/testimonianza-giulia-cirillo/",
          "https://www.ombreeluci.it/2023/museo-tattile-omero-ancona/",
          "https://www.ombreeluci.it/2023/recensione-as-we-see-it/",
          "https://www.ombreeluci.it/2023/fiera-di-me-stessa/",
          "https://www.ombreeluci.it/2023/e-t-alla-bicoca/",
          "https://www.ombreeluci.it/2023/avete-mai-provato/",
          "https://www.ombreeluci.it/2023/campi-di-giochi/",
          "https://www.ombreeluci.it/2023/deja-vu-ventanni-dopo-dialogo-aperto-n-160/",
          "https://www.ombreeluci.it/2023/a-sua-immagine-recensione/",
          "https://www.ombreeluci.it/2023/recensione-la-piu-bella-nuotata-becker/",
          "https://www.ombreeluci.it/2023/abbassa-il-cielo-e-scendi-recensione/",
          "https://www.ombreeluci.it/2023/il-grande-cavallo-blu-recensione/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-161",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 161,
        display_title: "Numero 161 - Quarant'anni di OL",
        titolo_numero: "Quarant'anni di OL",
        seo_description: "Numero 161 \u2013 Quarant\u2019anni di OL",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 161 \u2013 Quarant\u2019anni di OL Anno 41 \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2023 Sommario Attraverso voci e disegni di chi c\u2019era e c\u2019\xE8, ripercorriamo tempi e spazi di questo progetto editoriale (nato in seno al movimento di Fede e Luce ) per raggiungere, nelle intenzioni di Mariangela Bertolini che l\u2019ha fondato, \xABamici sconosciuti, assetati di raccontare, ascoltare e condividere\xBB. A parlarci degli inizi sono Stefano Guarino, Maria Grazia Pennisi e Nanni Bertolini; poi un originale sguardo di Giulia Galeotti su \xABle cose e i luoghi\xBB intorno ai quali si \xE8 dipanato quel filo di storie che ora \xE8 divenuto materiale \u2013 come racconta Emanuele Bertolini \u2013 cui dare nuova visibilit\xE0 attraverso la rete. Auguri e congratulazione anche a Pino e Conny sposi: \xE8 Vito Giannulo a raccontarci il loro matrimonio, nato sempre in seno a Fede e Luce. Facciamo nostre le parole della sposa: \xABDa soli non ce l\u2019avremmo fatta!\xBB, e ringraziamo tutti per la vicinanza e l\u2019affetto in questi quarant\u2019anni. Editoriale Pretese fuori mercato di Cristina Tersigni Focus: 40 anni di OL Gli esordi \xABInsieme\xBB di Stefano Guarino Per rompere la solitudine di Nanni Bertolini Quella vera fattura da pagare di Mari\u2026",
        descrizione_ai: null,
        anno_pubblicazione: 2023,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/03/Copertina_OeL_161_2023.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-161-quarantanni-di-ol/",
        canonical_url: "https://www.ombreeluci.it/project/numero-161-quarantanni-di-ol/",
        archive_org_item_id: "OmbreELuciN_161",
        archive_view_url: "https://archive.org/details/OmbreELuciN_161",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_161/oel-161.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2023/pretese-fuori-mercato/",
          "https://www.ombreeluci.it/2023/gli-esordi-insieme-1974-1981/",
          "https://www.ombreeluci.it/2023/per-rompere-la-solitudine/",
          "https://www.ombreeluci.it/2023/quella-vera-fattura-da-pagare/",
          "https://www.ombreeluci.it/1993/10-anni-di-ombre-e-luci-piu-che-una-rivista-una-grande-famiglia/",
          "https://www.ombreeluci.it/2023/digitalizzando-ombre-e-luci-come-un-album-di-famiglia/",
          "https://www.ombreeluci.it/2023/progettare-un-nuovo-numero/",
          "https://www.ombreeluci.it/2023/quattro-punti-cardinali-i-luoghi-di-ombre-e-luci-tra-i-quartieri-di-roma/",
          "https://www.ombreeluci.it/2023/pino-e-conny-sposi/",
          "https://www.ombreeluci.it/2023/dialogo-aperto-n-161/",
          "https://www.ombreeluci.it/2023/pharmakon-la-storia-del-talidomide-recensione/",
          "https://www.ombreeluci.it/2023/nuvole-a-dondolo-recensione/",
          "https://www.ombreeluci.it/2023/felicemente-seduta-recensione/",
          "https://www.ombreeluci.it/2023/repubblica-sorda-recensione/",
          "https://www.ombreeluci.it/2023/cose-la-laurea/",
          "https://www.ombreeluci.it/2023/al-loyola-university-rome-center/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-162",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 162,
        display_title: "Numero 162 \u2013 Vita in comunit\xE0",
        titolo_numero: "Vita in comunit\xE0",
        seo_description: "Un ideale giro per l\u2019Europa, attraverso tre esperienze di vita comunitarie accomunate dalla presenza di persone con disabilit\xE0 intellettive, \xE8 il viaggio che vi invitiamo a compiere con i tre articoli che compongono il focus di questo numero:",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 162 \u2013 Vita in comunit\xE0 Anno 41 \u2013 Numero 2 \u2013 Aprile \u2013 Maggio \u2013 Giugno 2023 Sommario Un ideale giro per l\u2019Europa, attraverso tre esperienze di vita comunitarie accomunate dalla presenza di persone con disabilit\xE0 intellettive, \xE8 il viaggio che vi invitiamo a compiere con i tre articoli che compongono il focus di questo numero: da Cambridge a Lamezia Terme passando per Lviv. Conosciamo Lo Spiraglio film Festival della Salute Mentale, che raccontiamo anche attraverso due dei film proiettati nella sua ultima edizione, uno dei quali legato a quel disagio che, come per le capoverdiane di cui racconta Galeotti nell\u2019intervista ad Alicia Lopes Ara\xFAjo, \xE8 dovuto allo strappo dalla propria terra natale. In pi\xF9, un concerto inusuale e una formazione di vitale importanza per le comunit\xE0 di Fede e Luce. Editoriale Dove siamo noi? di Cristina Tersigni Focus: Vita in comunit\xE0 Dall\u2019incontro tra Zenia e Borys di Christine Angl\xE8s Gruppo di gruppi di Enrica Riera Quando ho bussato alla porta di Lyn\u2019s House di Carole Irwin Rubriche Ragazze fragili di Giulia Galeotti Ma la Giorgia tredicenne di oggi chi avrebbe incontrato? di Francesco Bertolini Con i tre fratelli di Matteo Cinti Da du\u2026",
        descrizione_ai: null,
        anno_pubblicazione: 2023,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/07/Ombre_e_Luci_162_2023.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-162-vita-in-comunita/",
        canonical_url: "https://www.ombreeluci.it/project/numero-162-vita-in-comunita/",
        archive_org_item_id: null,
        archive_view_url: null,
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2023/dove-siamo-noi/",
          "https://www.ombreeluci.it/2023/dallincontro-tra-zenia-e-borys/",
          "https://www.ombreeluci.it/2023/gruppo-di-gruppi/",
          "https://www.ombreeluci.it/2023/quando-ho-bussato-alla-porta-di-lyns-house/",
          "https://www.ombreeluci.it/2023/ragazze-fragili/",
          "https://www.ombreeluci.it/2023/ma-la-giorgia-tredicenne-di-oggi-chi-avrebbe-incontrato/",
          "https://www.ombreeluci.it/2023/con-i-tre-fratelli/",
          "https://www.ombreeluci.it/2023/da-due-persiane-socchiuse/",
          "https://www.ombreeluci.it/2023/far-luce-sulla-realta-delle-migrazioni/",
          "https://www.ombreeluci.it/2023/addio-irlandese/",
          "https://www.ombreeluci.it/2023/dialogo-aperto-n-162/",
          "https://www.ombreeluci.it/2023/la-luce-danza-irrequieta-recensione/",
          "https://www.ombreeluci.it/2023/fuori-fuoco-recensione/",
          "https://www.ombreeluci.it/2023/sorpresi-dal-risorto-recensione/",
          "https://www.ombreeluci.it/2023/i-fragili-recensione/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-163",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 163,
        display_title: "Numero 163 - Pazienti?",
        titolo_numero: "Pazienti?",
        seo_description: "Numero 163 \u2013 Pazienti?",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 163 \u2013 Pazienti? Anno 41 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 2023 Sommario \xABAl pari di ogni altro individuo, la persona con disabilit\xE0 ha il diritto di godere del migliore stato di salute possibile, senza alcuna discriminazione. In ambito sanitario, pertanto, per garantire alle persone con disabilit\xE0 di fruire di questi diritti, \xE8 necessario applicare i principi dell\u2019accomodamento ragionevole e della progettazione universale\xBB. Ne parliamo sul numero in arrivo nelle vostre case: i problemi non mancano ma le possibili ragionevoli risposte neanche. Editoriale Perch\xE9 la salute conti davvero di Cristina Tersigni Focus: Pazienti? Quando la persona con disabilit\xE0 incontra il medico Un diritto finora (spesso) eluso di Cristina Tersigni Basterebbe un po\u2019 di coerenza? di Laura Coccia Ricette e soluzioni vincenti di Gianluca Giardini In favore della cura di pazienti non collaboranti di Maria Grazia Romanini Rubriche Una specie di Erasmus con Fede e Luce di Cristina Tersigni Possibile che Gabriele non abbia un posto? di Michele Vulcan La musica del mondo di Vito Giannulo Se \xABio\xBB diventa \xABnoi\xBB di Enrica Riera Storie dall\u2019Estremo Oriente di Claudio Cinus Un cristiano non\u2026",
        descrizione_ai: null,
        anno_pubblicazione: 2023,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/09/Copertina_OeL_163_2023.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-163-pazienti/",
        canonical_url: "https://www.ombreeluci.it/project/numero-163-pazienti/",
        archive_org_item_id: "OmbreELuciN_163",
        archive_view_url: "https://archive.org/details/OmbreELuciN_163",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_163/oel-163.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2023/perche-la-salute-conti-davvero/",
          "https://www.ombreeluci.it/2023/un-diritto-finora-spesso-eluso/",
          "https://www.ombreeluci.it/2023/basterebbe-un-po-di-coerenza/",
          "https://www.ombreeluci.it/2023/ricette-e-soluzioni-vincenti/",
          "https://www.ombreeluci.it/2023/in-favore-della-cura-di-pazienti-non-collaboranti/",
          "https://www.ombreeluci.it/2023/una-specie-di-erasmus-con-fede-e-luce/",
          "https://www.ombreeluci.it/2023/possibile-che-gabriele-non-abbia-un-posto/",
          "https://www.ombreeluci.it/2023/la-musica-del-mondo/",
          "https://www.ombreeluci.it/2023/se-io-diventa-noi/",
          "https://www.ombreeluci.it/2023/storie-dallestremo-oriente/",
          "https://www.ombreeluci.it/1976/vedremo-mai-la-luce/",
          "https://www.ombreeluci.it/2023/il-circo-delle-meraviglie-recensione/",
          "https://www.ombreeluci.it/2023/almond-come-una-mandorla-recensione/",
          "https://www.ombreeluci.it/2023/mitezza-recensione/",
          "https://www.ombreeluci.it/2023/le-spalle-di-dio-recensione/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-164",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 164,
        display_title: "Numero 164 \u2013 (Ancora) pazienti?",
        titolo_numero: "(Ancora) pazienti?",
        seo_description: "In questo numero ben ricco, la seconda puntata dell'inchiesta su medici e disabilit\xE0; stralci dal diario di Lino dal Premio Pieve Saverio Tutino, recensioni e tutte le rubriche.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 164 \u2013 (Ancora) pazienti? Anno 41 \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 2023 Sommario Accompagnato dalla Nativity dell\u2019artista cinese He Qi, Giovanni Grossi riflette sulle contraddizioni del Natale, per arrivare a concludere: \xABIo vivo per conto mio aspettando la felicit\xE0 che non ho mai raggiunto nella mia vita\xBB. Che questa capacit\xE0 di non fermarsi a fronzoli e apparenze valga un po\u2019 per tutti noi, aiutandoci a non far imbolsire la nostra capacit\xE0 di amare ed esserci. Per il resto, proponiamo la seconda puntata dell\u2019inchiesta su medici e disabilit\xE0, tra testimonianze e il prezioso incontro con Antonio Piscitelli, pediatra a Napoli.",
        descrizione_ai: null,
        anno_pubblicazione: 2023,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2023/12/COpertina_OeL_164_2023.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-164-ancora-pazienti/",
        canonical_url: "https://www.ombreeluci.it/project/numero-164-ancora-pazienti/",
        archive_org_item_id: "OmbreELuciN_164",
        archive_view_url: "https://archive.org/details/OmbreELuciN_164",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_164/oel-164.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2024/cura-e-civilta/",
          "https://www.ombreeluci.it/2024/linterezza-questa-sconosciuta/",
          "https://www.ombreeluci.it/2024/e-allimprovviso-che-fare/",
          "https://www.ombreeluci.it/2024/quel-farabutto-del-cocomero/",
          "https://www.ombreeluci.it/2024/andare-dal-dentista/",
          "https://www.ombreeluci.it/2024/pagine-di-caduta-e-ripresa/",
          "https://www.ombreeluci.it/2023/partiamo-per-il-congo-caa/",
          "https://www.ombreeluci.it/2024/together-a-san-pietro/",
          "https://www.ombreeluci.it/2024/le-pappe-di-pippo/",
          "https://www.ombreeluci.it/2024/la-fragilita-alla-festa-del-cinema/",
          "https://www.ombreeluci.it/2024/soffro-dunque-siamo-recensione/",
          "https://www.ombreeluci.it/2024/dove-sei-piccolo-giulio-recensione/",
          "https://www.ombreeluci.it/2024/ennio-lalieno-recensione/",
          "https://www.ombreeluci.it/2024/jun-recensione/",
          "https://www.ombreeluci.it/2024/ho-tante-cose-nuove/",
          "https://www.ombreeluci.it/2023/quando-arriva-il-natale/",
          "https://www.ombreeluci.it/2024/mimo-a-san-pietro/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-165",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 165,
        display_title: "Numero 165 \u2013 Uscire la sera",
        titolo_numero: "Uscire la sera",
        seo_description: "Punti di vista e spunti di riflessione per interrogarci su possibilit\xE0 e libert\xE0 di vivere il tempo libero (sar\xE0 poi davvero cos\xEC libero?)",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 165 \u2013 Uscire la sera Anno 42 \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2024 Sommario \xABNel quotidiano, andare a mangiare fuori per una persona con disabilit\xE0 cos\u2019\xE8? Un diritto sacrosanto, un miraggio vicino ma inesistente, una fatica immane, una scelta complessa radicata nell\u2019idea di cittadinanza e di comunit\xE0? O \xE8 tutto questo allo stesso tempo?\xBB si domanda Giulia Galeotti nel suo pezzo di apertura del nuovo focus del numero di Ombre e Luci in arrivo nelle vostre case. Troverete punti di vista, spunti di riflessione per interrogarci su possibilit\xE0 e libert\xE0 di vivere quel tempo libero (sar\xE0 poi davvero cos\xEC libero?) che in tanti diamo pressoch\xE9 per scontate o forse superflue. Avremo poi modo di conoscere meglio proprio quella Luciana Spigolon di cui avete trovato un testo in capo a questa newsletter: la sorella di Giorgio e Cristina, entrambi con una grave disabilit\xE0, ci racconta di un quotidiano tra conquiste e fatiche dalla provincia di Padova. E poi tanto altro! Le rubriche, le nostre recensioni di libri e spettacoli, le associazioni come quella sportiva di una squadra di Baskin in Puglia, con la cronaca di due partite di campionato molto partecipate sia dai g\u2026",
        descrizione_ai: null,
        anno_pubblicazione: 2024,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2024/03/COpertina_OeL_165_2024.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-165-uscire-la-sera/",
        canonical_url: "https://www.ombreeluci.it/project/numero-165-uscire-la-sera/",
        archive_org_item_id: "OmbreELuciN_165",
        archive_view_url: "https://archive.org/details/OmbreELuciN_165",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_165/oel-165.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2024/il-tempo-libero-e-davvero-libero/",
          "https://www.ombreeluci.it/2024/strategie-urbane/",
          "https://www.ombreeluci.it/2024/meglio-di-una-bacchetta-magica/",
          "https://www.ombreeluci.it/2024/serate-impossibili-e-una-possibilissima/",
          "https://www.ombreeluci.it/2024/quel-portachiavi-uguale-al-mio/",
          "https://www.ombreeluci.it/2024/oltre-le-barriere-imposte/",
          "https://www.ombreeluci.it/2024/dialogo-aperto-n-165/",
          "https://www.ombreeluci.it/2024/tra-conquiste-e-fatiche/",
          "https://www.ombreeluci.it/2023/nella-mia-parrocchia-non-sono-piu-accolta/",
          "https://www.ombreeluci.it/2024/quel-dono-ricevuto-da-ricambiare/",
          "https://www.ombreeluci.it/2024/baskin-a-monopoli/",
          "https://www.ombreeluci.it/2024/la-vittoria-di-marie/",
          "https://www.ombreeluci.it/2006/pizza-suppli-e-bibita-a-7-euro/",
          "https://www.ombreeluci.it/2024/diciotto-recensione/",
          "https://www.ombreeluci.it/2024/slime-recensione/",
          "https://www.ombreeluci.it/2024/lestate-in-cui-mia-madre-ebbe-gli-occhi-verdi-recensione/",
          "https://www.ombreeluci.it/2024/la-matta-di-piazza-giudia-recensione/",
          "https://www.ombreeluci.it/2024/baglioni-e-il-canguro/",
          "https://www.ombreeluci.it/2024/un-bravo-lavoratore/",
          "https://www.ombreeluci.it/2024/la-poesia-del-firmamento/",
          "https://www.ombreeluci.it/2024/alla-scoperta-di-un-ristorante-inclusivo/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-166",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 166,
        display_title: "Numero 166 \u2013 Il Paese giusto",
        titolo_numero: "Il Paese giusto",
        seo_description: "Passato e presente dell'inclusione scolastica in Italia",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 166 \u2013 Il Paese giusto Anno 42 \u2013 Numero 2 \u2013 Aprile \u2013 Maggio \u2013 Giugno 2024 Sommario \xABNessun diritto purtroppo si acquisisce una volta per tutte e non si pu\xF2 mai abbassare la guardia\u2026 Per\xF2 quando una regola sentita come giusta, anche se inizialmente calata dall\u2019alto, diviene coscienza, \xE8 difficile tornare indietro. Fu un buon vento\xBB. Cos\xEC scrive Nicla Bettazzi aprendo il focus del nuovo numero di Ombre e Luci dedicato all\u2019inclusione scolastica in Italia: un articolo che, tra storia personale e storia pubblica della legge 517/1977 (quella, per intenderci, che ha abolito le classi differenziali per gli alunni con disabilit\xE0), ci aiuta a conoscere meglio quel giusto avvenuto nel nostro Paese affinch\xE9 il diritto all\u2019istruzione fosse davvero garantito a ogni cittadino. Nel focus esperienze passate e attuali raccontano il bene di una scelta che, come sottolinea Laura Coccia, seppur nella \xABfatica\xBB sa \xABnutrire i risultati migliori\xBB. Un Paese giusto si intravede anche in un supermercato che viene incontro a chi, nella condizione dello spettro autistico, vive con difficolt\xE0 la spesa: a raccontarcelo, intervistata da Cristina Tersigni, \xE8 Margaret Martino, presidente dell\u2019ass\u2026",
        descrizione_ai: null,
        anno_pubblicazione: 2024,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2024/07/Copertina_OeL_166_2024.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-166-il-paese-giusto/",
        canonical_url: "https://www.ombreeluci.it/project/numero-166-il-paese-giusto/",
        archive_org_item_id: "OmbreELuciN_166",
        archive_view_url: "https://archive.org/details/OmbreELuciN_166",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_166/oel-166.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2024/chi-ben-comincia/",
          "https://www.ombreeluci.it/2024/fu-un-buon-vento/",
          "https://www.ombreeluci.it/2024/se-la-scuola-dellinclusione-mi-ha-insegnato-il-pensiero-critico/",
          "https://www.ombreeluci.it/2024/alle-superiori-con-la-sindrome-di-rett/",
          "https://www.ombreeluci.it/2024/una-relazione-importante/",
          "https://www.ombreeluci.it/2024/e-se-rivoluzionassimo-la-spesa/",
          "https://www.ombreeluci.it/2024/fare-ed-esserci/",
          "https://www.ombreeluci.it/2024/se-un-pomeriggio-dura-quarantanni/",
          "https://www.ombreeluci.it/2024/porte-aperte/",
          "https://www.ombreeluci.it/2024/la-parola-prende-vita/",
          "https://www.ombreeluci.it/2024/il-paese-dei-pazzi-recensione/",
          "https://www.ombreeluci.it/2024/il-mondo-in-un-punto-fisso-recensione/",
          "https://www.ombreeluci.it/2024/quattro-pagine-in-voce-recensione/",
          "https://www.ombreeluci.it/2024/chi-come-me-recensione/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-167",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 167,
        display_title: "Numero 167 \u2013 Fare la Storia per ridare la vita",
        titolo_numero: "Fare la Storia per ridare la vita",
        seo_description: "Un numero dedicato al centenario di Franco Basaglia.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 167 \u2013 Fare la Storia per ridare la vita Anno 42 \u2013 Numero 3 \u2013 Luglio-Agosto-Settembre 2024 Sommario Perch\xE9 ricordare Franco Basaglia? Oltre l\u2019occasione del centenario, scrive Giulia Galeotti, \xABil medico italiano \xE8 riuscito in un\u2019impresa veramente storica: smettere di tenere \u201Ci matti\u201D \u2013 categoria eterogenea per definizione, per stereotipo e per ignoranza \u2013 separati e lontani dalla vista dei \u201Csani\u201D\xBB. Dedichiamo cos\xEC il focus del numero in arrivo a un centenario attuale, capace di trasformare pratiche e compiere svolte culturali che ci riguardano tutti. E poi: vacanze possibili senza mamma e pap\xE0? S\xEC, ci risponde Monica Leggeri raccontandoci un\u2019estate diversa per Caterina. Laura Coccia prova invece a scalare i muri creati dalle tante domande inespresse per e attorno alla crescita di una bambina-ragazza-donna con paralisi cerebrale. A chiudere tre film per guardare oltre dal Biografilm Festival di Bologna (scrive il nostro critico cinematografico Claudio Cinus), le voci dalla formazione giovani di Lignano e gli immancabili diari di Benedetta Mattei e Giovanni Grossi. Buona lettura! Editoriale Attualit\xE0 di un centenario di Cristina Tersigni Focus: Fare la Storia per\u2026",
        descrizione_ai: null,
        anno_pubblicazione: 2024,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio-Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2024/10/Copertina_OeL_167_2024.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-167-fare-la-storia-per-ridare-la-vita/",
        canonical_url: "https://www.ombreeluci.it/project/numero-167-fare-la-storia-per-ridare-la-vita/",
        archive_org_item_id: "OmbreELuciN_167",
        archive_view_url: "https://archive.org/details/OmbreELuciN_167",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_167/oel-167.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2024/attualita-di-un-centenario/",
          "https://www.ombreeluci.it/2024/trasformare-le-pratiche/",
          "https://www.ombreeluci.it/2024/il-grande-traghettatore-punto-per-punto/",
          "https://www.ombreeluci.it/2024/marco-cavallo-nel-mondo/",
          "https://www.ombreeluci.it/2024/un-percorso-irreversibile-avviato-dal-basso/",
          "https://www.ombreeluci.it/2024/molto-piu-di-un-aggettivo/",
          "https://www.ombreeluci.it/2024/benvenuti-al-sud/",
          "https://www.ombreeluci.it/2024/in-cammino-con-te/",
          "https://www.ombreeluci.it/2024/storie-di-guerra-confini-e-speranza/",
          "https://www.ombreeluci.it/2004/la-barca-bianca-di-joseph-larsen/",
          "https://www.ombreeluci.it/2024/abitare-le-differenze-recensione/",
          "https://www.ombreeluci.it/2024/zia-giuliana-il-carrellino-della-nonna-e-le-mie-domande/",
          "https://www.ombreeluci.it/2024/non-sono-abituato-a-fare-lo-zaino/",
          "https://www.ombreeluci.it/2024/insegnare-al-principe-di-danimarca-recensione/",
          "https://www.ombreeluci.it/2024/il-dono-e-la-citta-recensione/",
          "https://www.ombreeluci.it/2024/a-ruota-libera-recensione/",
          "https://www.ombreeluci.it/2024/e-tu-slegalo/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-168",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 168,
        display_title: "Numero 168 \u2013 Sorelle tutte",
        titolo_numero: "Sorelle tutte",
        seo_description: "Numero 168 \u2013 Sorelle tutte",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 168 \u2013 Sorelle tutte Anno 42 \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 2024 Sommario Camelia, Elena, Ilaria e Teresita: quattro voci di donne consacrate ci raccontano come abbiano intrecciato la loro vocazione alla disabilit\xE0. Quattro vesti, quattro et\xE0, quattro provenienze, quattro modalit\xE0 particolari e lontane, capaci di restituirci un cammino di sorellanza per ridurre distanze apparentemente incolmabili. Quale migliore argomento per avvicinarci al Natale che ha portato Dio tra noi? Apre il numero il colloquio tra Pietro Vetro e Angela Gattulli: presidente entrante e uscente di Fede e Luce si passano il testimone. Tutto il resto lo scoprite in un numero che, tra ombre e luci, fa sempre emergere un cammino di speranza. Buon anno giubilare a tutti! Editoriale Piccole ma decisive di Cristina Tersigni Focus: Sorelle tutte Come vitamina tra la gente di Cristina Tersigni \xABTi chiamano\xBB di suor Teresita Frachey Trascendere i limiti per abbracciare ogni limite di suor Maria Ilaria Di Bernardo Anelli di incontri di suor Elena Bernasconi Rubriche Per continuare a mettere in cerchio di Angela Gattulli Il racconto di Natale di mio figlio di Giulia Galeotti Verso una pace\u2026",
        descrizione_ai: null,
        anno_pubblicazione: 2024,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2024/12/Copertina_OeL_168_2024.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-168-sorelle-tutte/",
        canonical_url: "https://www.ombreeluci.it/project/numero-168-sorelle-tutte/",
        archive_org_item_id: "OmbreELuciN_168",
        archive_view_url: "https://archive.org/details/OmbreELuciN_168",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_168/oel-168.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2025/piccole-ma-decisive/",
          "https://www.ombreeluci.it/2025/come-vitamina-tra-la-gente/",
          "https://www.ombreeluci.it/2024/ti-chiamano/",
          "https://www.ombreeluci.it/2025/trascendere-i-limiti-per-abbracciare-ogni-limite/",
          "https://www.ombreeluci.it/2025/anelli-di-incontri/",
          "https://www.ombreeluci.it/2024/per-continuare-a-mettere-in-cerchio/",
          "https://www.ombreeluci.it/2018/il-racconto-di-natale-per-mio-figlio/",
          "https://www.ombreeluci.it/2025/verso-una-pace-duratura/",
          "https://www.ombreeluci.it/2025/quel-che-letichetta-racconta/",
          "https://www.ombreeluci.it/2025/per-una-giusta-rappresentazione/",
          "https://www.ombreeluci.it/2025/avanti-veloce-viaggio-nelladhd-recensione/",
          "https://www.ombreeluci.it/2025/essere-bea-recensione/",
          "https://www.ombreeluci.it/2025/storia-dellaborto-recensione/",
          "https://www.ombreeluci.it/2025/lora-di-greco-recensione/",
          "https://www.ombreeluci.it/2025/e-le-ferie/",
          "https://www.ombreeluci.it/2025/come-me-anche-la-sposa-era-vestita-di-bianco/",
          "https://www.ombreeluci.it/2025/dialogo-aperto-2/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-169",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 169,
        display_title: "Numero 169 \u2013 Noi pellegrini",
        titolo_numero: "Noi pellegrini",
        seo_description: "Numero 169 \u2013 Noi pellegrini",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 169 \u2013 Noi pellegrini Anno 43 \u2013 Numero 1 \u2013 Gennaio \u2013 Febbraio \u2013 Marzo 2025 Sommario Il 2025 \xE8 anno di pellegrinaggi, non solo per il Giubileo della Speranza aperto da papa Francesco, ma anche per i 50 anni di Fede e Luce in Italia. \xABAvventura umana profonda\xBB, \xABesperienza di conversione\xBB: un pellegrinaggio, racconta padre Paul Gilbert , pu\xF2 essere l\u2019opportunit\xE0 di tessere relazioni e fissare incontri che daranno vera vita, una volta a casa, alla preghiera personale e slancio a cambiare qualcosa nel proprio quotidiano. \xABUna proposta audace, forse fuori moda\xBB sottolineava Mariangela Bertolini nel 1978 quando invitava i giovani ad Assisi per seguire il cammino comunitario delle comunit\xE0 di Fede e Luce.",
        descrizione_ai: null,
        anno_pubblicazione: 2025,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Gennaio \u2013 Febbraio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2025/03/Copertina_OeL_169_2025.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-169-noi-pellegrini/",
        canonical_url: "https://www.ombreeluci.it/project/numero-169-noi-pellegrini/",
        archive_org_item_id: "OmbreELuciN_169",
        archive_view_url: "https://archive.org/details/OmbreELuciN_169",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_169/oel-169.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2025/storie-che-ci-vengono-affidate/",
          "https://www.ombreeluci.it/2025/la-scelta-di-geel/",
          "https://www.ombreeluci.it/2025/mastri-biscottai-in-31-casette/",
          "https://www.ombreeluci.it/2025/con-la-valigia-ma-senza-bagaglio/",
          "https://www.ombreeluci.it/2025/cinquantanni-di-pellegrinaggi/",
          "https://www.ombreeluci.it/2025/tra-gli-ultimi-regali-di-mio-padre/",
          "https://www.ombreeluci.it/2025/qui-e-ora/",
          "https://www.ombreeluci.it/2025/dialogo-aperto-n-169/",
          "https://www.ombreeluci.it/2025/vita-in-poverta/",
          "https://www.ombreeluci.it/2025/di-chiavi-e-di-porte/",
          "https://www.ombreeluci.it/2025/lemporio-del-cielo-e-della-terra-recensione/",
          "https://www.ombreeluci.it/2025/lorco-del-piano-di-sotto-recensione/",
          "https://www.ombreeluci.it/2025/limpossibile-diventa-possibile-recensione/",
          "https://www.ombreeluci.it/2025/testing-women-testing-the-fetus-recensione/",
          "https://www.ombreeluci.it/2025/i-pellegrinaggi-di-fede-e-luce/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-170",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 170,
        display_title: "Numero 170 \u2013 Camminiamo insieme",
        titolo_numero: "Camminiamo insieme",
        seo_description: "Numero 170 \u2013 Camminiamo insieme",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 170 \u2013 Camminiamo insieme Anno 43 \u2013 Numero 2 \u2013 Aprile \u2013 Maggio \u2013 Giugno 2025 \xABU n pontificato che ha camminato assieme alle persone con disabilit\xE0\xBB scrive Giulia Galeotti nel suo omaggio a papa Francesco: le voci del Dialogo Aperto lo testimoniano con vividezza. Il focus \xE8 dedicato ancora al tema del pellegrinaggio: da Lourdes a Santiago passando per le sale cinematografiche e per Pompei , che accoglier\xE0 le comunit\xE0 di Fede e Luce nel prossimo settembre. Francesca Pellegrini racconta la sua esperienza da giovane lettrice e volontaria di Nati per Leggere in Toscana. Ma i film che parlano di autismo raccontano davvero l\u2019autismo? Se lo chiede Niccol\xF2 Scarnato, attore autistico esordiente, nelle pagine dedicate agli Spettacoli. Poi, tutti pazzi per il padel ! Infine i nostri consigli di lettura e i diari di Benedetta e Giovanni . Tante cose che fanno la differenza! Editoriale Mio figlio ha degli amici di Cristina Tersigni Focus: Noi pellegrini \u2013 seconda puntata Quell\u2019universo nella voce del vocabolario di Serena Sillitto Verso Pompei di Equipe tematica Pompei Scene e storie a cui ognuno pu\xF2 dare significato di Claudio Cinus A Santiago per mio figlio di Lucio Cammaro\u2026",
        descrizione_ai: null,
        anno_pubblicazione: 2025,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Aprile \u2013 Maggio",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2025/05/Copertina_OeL_170_2025.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-170-camminiamo-insieme/",
        canonical_url: "https://www.ombreeluci.it/project/numero-170-camminiamo-insieme/",
        archive_org_item_id: "OmbreELuciN_170",
        archive_view_url: "https://archive.org/details/OmbreELuciN_170",
        archive_download_pdf_url: "https://archive.org/download/OmbreELuciN_170/oel-170.pdf",
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2025/con-noi/",
          "https://www.ombreeluci.it/2025/dialogo-aperto-per-papa-francesco/",
          "https://www.ombreeluci.it/2025/in-pellegrinaggio-con-unitalsi-e-fede-e-luce/",
          "https://www.ombreeluci.it/2025/a-santiago-per-mio-figlio/",
          "https://www.ombreeluci.it/2025/pellegrinaggi-al-cinema/",
          "https://www.ombreeluci.it/2025/verso-pompei-per-i-50-anni-di-fede-e-luce-in-italia/",
          "https://www.ombreeluci.it/2025/tuffarsi-nelle-storie-ma-mai-da-soli/",
          "https://www.ombreeluci.it/2025/linclusione-che-ancora-manca-nel-cinema-italiano/",
          "https://www.ombreeluci.it/2025/scintilla-bellissima/",
          "https://www.ombreeluci.it/2025/domande-di-una-campionessa/",
          "https://www.ombreeluci.it/2025/loyola-university/",
          "https://www.ombreeluci.it/2025/mio-figlio-ha-degli-amici/",
          "https://www.ombreeluci.it/2025/specchi-il-giubileo-del-mondo-del-volontariato-recensione/",
          "https://www.ombreeluci.it/2025/mal-di-nebbia-recensione/",
          "https://www.ombreeluci.it/2025/un-venerdi-di-aprile-recensioni/",
          "https://www.ombreeluci.it/2025/passo-lento-recensione/",
          "https://www.ombreeluci.it/2025/i-pellegrinaggi-di-fede-e-luce/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-171",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 171,
        display_title: "Numero 171 \u2013 Fratelli tutti",
        titolo_numero: "Fratelli tutti",
        seo_description: "In continuit\xE0 con il numero Sorelle Tutte dello scorso anno, l\u2019ultimo Ombre e Luci d\xE0 voce a tre sacerdoti che vivono l'accoglienza della disabilit\xE0.",
        descrizione_originale: "\u2190 Prec Succ \u2192 Numero 171 \u2013 Fratelli tutti Anno 43 \u2013 Numero 3 \u2013 Luglio \u2013 Agosto \u2013 Settembre 2025 Sommario In ideale continuit\xE0 con il numero Sorelle Tutte dello scorso anno, l\u2019ultimo Ombre e Luci d\xE0 voce a tre sacerdoti che vivono l\u2019accoglienza della disabilit\xE0, testimoniando una paternit\xE0 pastorale autentica e feconda. Da Roma, Milano e Viterbo , arrivano esperienze diverse per misure e carismi: ciascuna traccia una strada possibile per una Chiesa chiamata davvero ad aprire le porte ad ogni fratello e sorella. Apre il numero l\u2019intervista ad Antonio Piscitelli, dalla Campania, che racconta la rinnovata consapevolezza della bont\xE0 del percorso vissuto nelle comunit\xE0 di Fede e Luce. Un\u2019esperienza che, tra i vicoli di Napoli trentacinque anni fa, ha dato origine anche all\u2019associazione La Scintilla , di cui parla una delle fondatrici, Claudia Noviello: percorsi differenti con la convinzione di \xABritrovare spazi di umanit\xE0 autentica\xBB. Seguono la testimonianza di tre anni di scuola superiore di Giulia Alberico, le cronache (o le critiche) dal Giubileo delle persone con disabilit\xE0 dello scorso aprile e il racconto di Niccol\xF2 Scarnato, attore autistico, sul casting del film La Vita da Grandi\u2026",
        descrizione_ai: null,
        anno_pubblicazione: 2025,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Luglio \u2013 Agosto",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2025/08/Copertina_OeL_171_2025.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-171-fratelli-tutti/",
        canonical_url: "https://www.ombreeluci.it/project/numero-171-fratelli-tutti/",
        archive_org_item_id: null,
        archive_view_url: null,
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/2025/una-terza-via/",
          "https://www.ombreeluci.it/2025/dissodare-il-terreno/",
          "https://www.ombreeluci.it/2025/il-senso-di-quel-che-facciamo/",
          "https://www.ombreeluci.it/2025/tra-i-vicoli-di-napoli/",
          "https://www.ombreeluci.it/2020/io-e-francesca/",
          "https://www.ombreeluci.it/2025/di-provini-porte-ed-energia/",
          "https://www.ombreeluci.it/2025/nutrire_sogni/",
          "https://www.ombreeluci.it/2025/accoglienza-alle-porte-di-roma/",
          "https://www.ombreeluci.it/2025/dialogo-aperto-n-171/",
          "https://www.ombreeluci.it/2025/cronaca-di-due-giorni-accidentati/",
          "https://www.ombreeluci.it/2025/cartella-clinica-recensioni/",
          "https://www.ombreeluci.it/2025/semplicemente-maria-recensioni/",
          "https://www.ombreeluci.it/2025/la-disabilita-non-e-una-vocazione-recensione/",
          "https://www.ombreeluci.it/2025/difficile-senza-musica-recensione/",
          "https://www.ombreeluci.it/2025/lucio-che-non-ha-mai-fretta-e-lutilita-degli-sgabelli/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      },
      {
        id_numero: "OEL-172",
        tipo_rivista: "ombre_e_luci",
        numero_progressivo: 172,
        display_title: "Numero 172 \u2013 Paradigma Pompei",
        titolo_numero: "Paradigma Pompei",
        sommario_lancio: "Paradigma Pompei, l'ultimo numero del 2025 di Ombre e Luci, racconta di un viaggio: un insieme di voci, riflessioni e testimonianze nate dal pellegrinaggio che Fede e Luce ha compiuto a settembre per festeggiare i suoi 50 anni. Un puzzle che diventa specchio di un modo nuovo e universale con cui poter vivere e affrontare gioie, salite, dolori e legami legati alla fragilit\xE0 e alla disabilit\xE0. Ricordando sempre che la differenza non \xE8 mai un disvalore. E che solo insieme sar\xE0 possibile affrontare il futuro, con le sue luci e le sue ombre.",
        seo_description: "Un insieme di voci, riflessioni e testimonianze nate dal pellegrinaggio che Fede e Luce ha compiuto a settembre per festeggiare i suoi 50 anni",
        descrizione_originale: "\u2190 Prec Numero 172 \u2013 Paradigma Pompei Anno 43 \u2013 Numero 4 \u2013 Ottobre \u2013 Novembre \u2013 Dicembre 2025 Sommario Paradigma Pompei , l\u2019ultimo numero del 2025 di Ombre e Luci, \xE8 in viaggio verso le vostre case, ed \xE8 proprio un viaggio quello che racconta: un insieme di voci, riflessioni e testimonianze nate dal pellegrinaggio che Fede e Luce ha compiuto a settembre per festeggiare i suoi 50 anni. Un puzzle che diventa specchio di un modo nuovo e universale con cui poter vivere e affrontare gioie, salite, dolori e legami legati alla fragilit\xE0 e alla disabilit\xE0. Ricordando sempre che la differenza non \xE8 mai un disvalore. E che solo insieme sar\xE0 possibile affrontare il futuro, con le sue luci e le sue ombre. Editoriale \xABHo deciso\xBB di Cristina Tersigni Focus: Paradigma Pompei Il coraggio di cambiare di Veronica Amata Donatello Mille colori in un quadro di amici di Cristina Tersigni Decidemmo di restare di Raul Izquierdo Garcia L\u2019attesa nell\u2019attesa di Paolo Catapano Ho capito di non essere l\u2019unica di Alejandra del Mar Catapano La mia traversata di Patrizia di Blasi Quando la comunit\xE0 ti viene incontro di Lina Santoro In cosa ci sentiamo fragili oggi? di Beno\xEEt Malvaux Rubriche Dare spazio a chi non\u2026",
        descrizione_ai: null,
        anno_pubblicazione: 2025,
        anno_collezione: null,
        periodicita: null,
        periodo_label: "Ottobre \u2013 Novembre",
        copertina_url: "https://www.ombreeluci.it/wp-content/uploads/2025/12/Copertina_OeL_172_2025.jpg",
        wp_url_numero: "https://www.ombreeluci.it/project/numero-172-paradigma-pompei/",
        canonical_url: "https://www.ombreeluci.it/project/numero-172-paradigma-pompei/",
        archive_org_item_id: null,
        archive_view_url: null,
        archive_download_pdf_url: null,
        articoli_ids: [],
        articoli_urls: [
          "https://www.ombreeluci.it/1974/lettera-ai-giovani/",
          "https://www.ombreeluci.it/2025/suor-veronica-pompei/"
        ],
        issues: [
          "archive_org_item_id_mancante"
        ]
      }
    ];
    $$Index4 = createComponent(async ($$result, $$props, $$slots) => {
      const numeri = numeriData;
      const numeriOEL = [...numeri].filter((n) => n.tipo_rivista === "ombre_e_luci").sort((a, b) => {
        if (a.anno_pubblicazione !== b.anno_pubblicazione)
          return b.anno_pubblicazione - a.anno_pubblicazione;
        return (b.numero_progressivo ?? 0) - (a.numero_progressivo ?? 0);
      });
      const ultimoNumero = numeriOEL[0] ?? null;
      const issueSlug = ultimoNumero ? ultimoNumero.id_numero.toLowerCase().replace(/[^a-z0-9-]/g, "-") : "";
      const numeriPerCarousel = numeriOEL.slice(0, 20);
      const allAutori = await getAllAutori();
      const autoriById = Object.fromEntries(
        allAutori.map((a) => [
          a.slug,
          { foto_url: a.foto?.id ? getAutoreImageUrl(a.foto.id) : void 0 }
        ])
      );
      const allArticles = (await getAllArticoli()).filter((a) => a.lang !== "en");
      const sortedArticles = [...allArticles].sort((a, b) => {
        const tA = a.data_pubblicazione ? new Date(a.data_pubblicazione).getTime() : 0;
        const tB = b.data_pubblicazione ? new Date(b.data_pubblicazione).getTime() : 0;
        if (tA !== tB)
          return tB - tA;
        const wA = getRoleWeight(getMegaclusterForArticle(a).ruolo_editoriale);
        const wB = getRoleWeight(getMegaclusterForArticle(b).ruolo_editoriale);
        return wB - wA;
      });
      function getArticleMeta(a) {
        const { categoria_menu } = getMegaclusterForArticle(a);
        const image = getArticoloCopertinaSrc(a);
        const date = a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date();
        return {
          slug: a.slug,
          title: a.titolo || "Titolo mancante",
          author: a.autore?.nome_completo || "Autore sconosciuto",
          date,
          image,
          sommario: a.sottotitolo?.trim() || void 0,
          categoria_menu: categoria_menu ?? void 0,
          issue: a.numero_rivista?.id_numero ?? null
        };
      }
      __name(getArticleMeta, "getArticleMeta");
      function formatDateItalian(d) {
        return new Intl.DateTimeFormat("it-IT", { year: "numeric", month: "long", day: "numeric" }).format(d);
      }
      __name(formatDateItalian, "formatDateItalian");
      function formatDateRelative(d) {
        const days = Math.floor(((/* @__PURE__ */ new Date()).getTime() - d.getTime()) / 864e5);
        if (days < 1)
          return "oggi";
        if (days === 1)
          return "ieri";
        if (days < 7)
          return `${days} giorni fa`;
        if (days < 30) {
          const w = Math.floor(days / 7);
          return w === 1 ? "una settimana fa" : `${w} settimane fa`;
        }
        if (days < 365) {
          const m = Math.floor(days / 30);
          return m === 1 ? "un mese fa" : `${m} mesi fa`;
        }
        const y = Math.floor(days / 365);
        return y === 1 ? "un anno fa" : `${y} anni fa`;
      }
      __name(formatDateRelative, "formatDateRelative");
      const eighteenMonthsAgo = /* @__PURE__ */ new Date();
      eighteenMonthsAgo.setMonth(eighteenMonthsAgo.getMonth() - 18);
      const featuredPool = (() => {
        const portanti = sortedArticles.filter((a) => {
          const date = a.data_pubblicazione ? new Date(a.data_pubblicazione) : /* @__PURE__ */ new Date(0);
          const { ruolo_editoriale } = getMegaclusterForArticle(a);
          return (ruolo_editoriale === "portante" || ruolo_editoriale === "strutturale") && date >= eighteenMonthsAgo;
        });
        return (portanti.length >= 2 ? portanti : sortedArticles).slice(0, 7);
      })().map((a) => getArticleMeta(a));
      const poolSlugs = new Set(featuredPool.map((m) => m.slug));
      const latestArticles = sortedArticles.filter((a) => !poolSlugs.has(a.slug)).slice(0, 3).map((a) => getArticleMeta(a));
      const diaristiAttivi = DIARISTI.filter((d) => d.nome !== "Davide Passeri");
      const latestPerDiario = diaristiAttivi.map((diarista) => {
        const article = allArticles.filter((a) => (a.autore?.nome_completo || "").trim() === diarista.nome).sort((a, b) => {
          const tA = a.data_pubblicazione ? new Date(a.data_pubblicazione).getTime() : 0;
          const tB = b.data_pubblicazione ? new Date(b.data_pubblicazione).getTime() : 0;
          return tB - tA;
        })[0];
        return article ? { diarista, meta: getArticleMeta(article) } : null;
      }).filter((x) => x !== null).slice(0, 4);
      const testimonianze = sortedArticles.filter((a) => getLabels([], a).formal === "Testimonianza").slice(0, 2).map((a) => getArticleMeta(a));
      const EXPLORE_CATEGORIES = [
        "Fede e Luce",
        "Famiglia",
        "Spiritualit\xE0",
        "Cultura",
        "Scuola e educazione",
        "Salute",
        "Lavoro",
        "Personaggi che ispirano"
      ];
      const exploreItems = EXPLORE_CATEGORIES.map((catLabel) => {
        const article = sortedArticles.find((a) => getMegaclusterForArticle(a).categoria_menu === catLabel);
        if (!article)
          return null;
        const slug = getCategorySlugForArticle(article);
        if (!slug)
          return null;
        return { catLabel, slug, meta: getArticleMeta(article) };
      }).filter((x) => x !== null);
      return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Ombre e Luci \u2013 Un nuovo sguardo attraverso la disabilit\xE0", "description": "Ombre e Luci: storie, riflessioni e cultura sulla fragilit\xE0 e sulla dignit\xE0 della persona. Dal 1983.", "noindex": true, "bodyClass": "home-page" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="site-main home-page"> <!-- ══════════════════════════════════════════════════════════
           1. HERO
           ══════════════════════════════════════════════════════════ --> <section class="home-hero-section"> <div class="home-container"> <div class="home-hero-grid"> <!-- Colonna sinistra: tagline + featured rotante --> <div> <p class="home-tagline">Un nuovo sguardo<br>attraverso la disabilità.</p> <div id="hero-pool"> ${featuredPool.map((meta, i) => renderTemplate`<article data-hero-candidate${addAttribute(i > 0 ? "display:none" : "", "style")}> <a${addAttribute(`/blog/${meta.slug}`, "href")}> <figure class="home-featured-figure"> <img${addAttribute(meta.image || PLACEHOLDER_COPERTINA, "src")} alt="" loading="eager" width="800" height="450" data-copertina-fallback${addAttribute(COPERTINA_IMG_ONERROR, "onerror")}> </figure> <p class="home-cat">${meta.categoria_menu || "Online"}</p> <h2 class="home-featured-title">${meta.title}</h2> ${meta.sommario && renderTemplate`<p class="home-featured-deck">${meta.sommario}</p>`} <p class="home-byline">
Di <strong>${meta.author}</strong> · ${formatDateItalian(meta.date)} </p> </a> </article>`)} </div> </div> <!-- Colonna destra: recenti --> <aside class="home-recenti"> <h2 class="section-title">Recenti</h2> ${latestArticles.map((meta) => renderTemplate`<a${addAttribute(`/blog/${meta.slug}`, "href")} class="home-recenti-item"> <div class="home-recenti-thumb"> <img${addAttribute(meta.image || PLACEHOLDER_COPERTINA, "src")} alt="" loading="lazy" data-copertina-fallback${addAttribute(COPERTINA_IMG_ONERROR, "onerror")}> </div> <div> <p class="home-cat-small">${meta.categoria_menu || "Online"}</p> <h3 class="home-recenti-title">${meta.title}</h3> <p class="home-byline-small">Di ${meta.author}</p> </div> </a>`)} </aside> </div> </div> </section> <!-- ══════════════════════════════════════════════════════════
           2. DA VICINO
           ══════════════════════════════════════════════════════════ --> <section class="home-davicino-section" aria-label="Da vicino"> <div class="home-container"> <div class="home-section-intro"> <h2 class="home-section-heading">Da vicino</h2> <p class="home-section-sub">
I diari di chi vive questa realtà e le storie di chi,
              stando accanto, ha visto qualcosa cambiare.
</p> </div> <div class="home-davicino-grid"> <!-- Diari: griglia 2×2 card --> <div class="home-diari-col"> <div class="home-diari-grid"> ${latestPerDiario.map(({ diarista, meta }) => {
        const fotoUrl = autoriById[diarista.authorSlug]?.foto_url || "";
        return renderTemplate`<a${addAttribute(`/blog/${meta.slug}`, "href")} class="home-diario-card"> <div class="home-diario-avatar"> ${fotoUrl ? renderTemplate`<img${addAttribute(fotoUrl, "src")}${addAttribute(diarista.nome, "alt")} loading="lazy">` : renderTemplate`<div class="home-diario-avatar-placeholder">${diarista.nome.charAt(0)}</div>`} </div> <p class="home-diario-nome">${diarista.nome}</p> <h3 class="home-diario-titolo">${meta.title}</h3> <p class="home-diario-date">${formatDateRelative(meta.date)}</p> </a>`;
      })} </div> <a href="/sezioni/diari" class="home-link-more">Tutti i diari →</a> </div> <!-- Testimonianze + CTA --> <div class="home-testi-col"> ${testimonianze.map((meta) => renderTemplate`<a${addAttribute(`/blog/${meta.slug}`, "href")} class="home-testi-item"> ${meta.image && renderTemplate`<div class="home-testi-img"> <img${addAttribute(meta.image, "src")} alt="" loading="lazy" data-copertina-fallback${addAttribute(COPERTINA_IMG_ONERROR, "onerror")}> </div>`} <div class="home-testi-body"> <p class="home-cat">Testimonianza</p> <h3 class="home-testi-title">${meta.title}</h3> <p class="home-byline-small">Di ${meta.author} · ${formatDateItalian(meta.date)}</p> </div> </a>`)} <div class="home-testi-cta"> <p>Hai vissuto qualcosa che vale la pena raccontare?</p> <a href="mailto:ombreeluci@fedeeluce.it" class="home-testi-cta-link">Scrivici →</a> </div> </div> </div> </div> </section> <!-- ══════════════════════════════════════════════════════════
           3. ESPLORA
           ══════════════════════════════════════════════════════════ --> <section class="home-esplora-section" aria-label="Esplora i temi"> <div class="home-container"> <div class="home-section-intro"> <h2 class="home-section-heading">Esplora</h2> <p class="home-section-sub">Quarant'anni di storie, riflessioni e incontri.</p> </div> <div class="home-esplora-grid"> ${exploreItems.map(({ catLabel, slug, meta }) => renderTemplate`<a${addAttribute(`/categoria/${slug}`, "href")} class="home-esplora-card"> <div class="home-esplora-img"> <img${addAttribute(meta.image || PLACEHOLDER_COPERTINA, "src")} alt="" loading="lazy" data-copertina-fallback${addAttribute(COPERTINA_IMG_ONERROR, "onerror")}> </div> <div class="home-esplora-body"> <p class="home-esplora-cat">${catLabel}</p> <h3 class="home-esplora-title">${meta.title}</h3> </div> </a>`)} </div> </div> </section> <!-- ══════════════════════════════════════════════════════════
           4. LA RIVISTA
           ══════════════════════════════════════════════════════════ --> <section class="home-rivista-section" aria-label="La rivista"> <div class="home-container"> ${ultimoNumero && renderTemplate`<div class="home-ultimo-numero"> <div> <p class="home-rivista-eyebrow">La rivista · esce ogni tre mesi dal 1983</p> <div class="home-rivista-riga" aria-hidden="true"></div> <p class="home-rivista-meta"> ${ultimoNumero.periodo_label ?? ultimoNumero.anno_pubblicazione} · n.${ultimoNumero.numero_progressivo} </p> <h3 class="home-rivista-titolo"> ${ultimoNumero.titolo_numero ?? `Ombre e Luci n. ${ultimoNumero.numero_progressivo}`} </h3> ${(ultimoNumero.sommario_lancio ?? ultimoNumero.seo_description) && renderTemplate`<p class="home-rivista-sommario"> ${(ultimoNumero.sommario_lancio ?? ultimoNumero.seo_description ?? "").slice(0, 220)} ${(ultimoNumero.sommario_lancio ?? ultimoNumero.seo_description ?? "").length > 220 ? "\u2026" : ""} </p>`} <div class="home-rivista-actions"> <a${addAttribute(issueSlug ? `/archivio/${issueSlug}` : "/archivio", "href")} class="home-rivista-cta">
Scopri il numero →
</a> <a href="/archivio" class="home-rivista-link">Archivio completo</a> </div> </div> <div class="home-rivista-cover-col"> ${ultimoNumero.copertina_url ? renderTemplate`<a${addAttribute(issueSlug ? `/archivio/${issueSlug}` : "/archivio", "href")}> <img${addAttribute(ultimoNumero.copertina_url, "src")} alt="" loading="lazy" width="240" class="home-rivista-cover"> </a>` : null} </div> </div>`} </div> <!-- Carousel su striscia bianca separata --> ${numeriPerCarousel.length > 0 && renderTemplate`<div class="home-archivio-strip"> <div class="home-container"> <h3 class="section-title">Tutti i numeri</h3> <div class="home-carousel-wrap"> <button type="button" class="home-carousel-btn home-carousel-prev" aria-label="Precedenti"> <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"> <path d="M8 2 L4 6 L8 10"></path> </svg> </button> <div class="home-carousel-track-wrap"> <div class="home-carousel-track" id="home-carousel-track"> ${numeriPerCarousel.map((n) => renderTemplate`<div class="home-carousel-item"> ${renderComponent($$result2, "IssueCard", $$IssueCard, { "cover_url": n.copertina_url ?? void 0, "titolo_numero": n.titolo_numero ?? n.display_title ?? `Ombre e Luci n. ${n.numero_progressivo}`, "numero": n.numero_progressivo ?? 0, "anno": n.anno_pubblicazione ?? 0, "periodo_label": n.periodo_label ?? void 0, "tipo_rivista": n.tipo_rivista ?? "ombre_e_luci", "id_numero": n.id_numero ?? "" })} </div>`)} </div> </div> <button type="button" class="home-carousel-btn home-carousel-next" aria-label="Successivi"> <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"> <path d="M4 2 L8 6 L4 10"></path> </svg> </button> </div> <p style="margin-top: 0.75rem;"> <a href="/archivio" class="home-link-more">Tutti i numeri in archivio →</a> </p> </div> </div>`} </section> <!-- ══════════════════════════════════════════════════════════
           5. UNISCITI
           ══════════════════════════════════════════════════════════ --> <section class="home-unisciti-section" aria-label="Unisciti"> <div class="home-container"> <div class="home-section-intro"> <h2 class="home-section-heading">Unisciti</h2> <p class="home-section-sub">Ombre e Luci esiste grazie a chi ci crede. Ci sono molti modi per esserci.</p> </div> <div class="home-unisciti-grid"> <div class="home-unisciti-card"> <div class="home-unisciti-icon"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path> </svg> </div> <h3 class="home-unisciti-title">Sostieni la rivista</h3> <p class="home-unisciti-text">
Una donazione, anche piccola e ricorrente, permette a Ombre e Luci
                di continuare a pubblicare storie che contano.
</p> <a href="/sostienici" class="home-unisciti-btn">Scopri come →</a> </div> <div class="home-unisciti-card"> <div class="home-unisciti-icon"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path> </svg> </div> <h3 class="home-unisciti-title">Racconta la tua storia</h3> <p class="home-unisciti-text">
Hai vissuto qualcosa che vale la pena condividere?
                Le storie più vere arrivano da chi le ha vissute.
</p> <a href="mailto:ombreeluci@fedeeluce.it" class="home-unisciti-btn">Scrivici →</a> </div> <div class="home-unisciti-card"> <div class="home-unisciti-icon"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path> </svg> </div> <h3 class="home-unisciti-title">Dai una mano</h3> <p class="home-unisciti-text">
Vuoi collaborare, fare volontariato o contribuire
                in un altro modo? Siamo sempre aperti.
</p> <a href="/chi-siamo/contatti" class="home-unisciti-btn">Contattaci →</a> </div> </div> <p class="home-newsletter-row">
Resta in contatto:
<a href="https://ombreeluci.us17.list-manage.com/subscribe?u=00c5dad63480d9601563b5692&id=efd099264d" target="_blank" rel="noopener noreferrer">iscriviti alla newsletter</a> </p> </div> </section> </main>  ` })} `;
    }, "C:/Users/berto/Documents/Ombreeluci/src/pages/index.astro", void 0);
    $$file12 = "C:/Users/berto/Documents/Ombreeluci/src/pages/index.astro";
    $$url12 = "";
    _page14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: $$Index4,
      file: $$file12,
      url: $$url12
    }, Symbol.toStringTag, { value: "Module" }));
    page14 = /* @__PURE__ */ __name(() => _page14, "page");
  }
});

// _worker.js/_astro-internal_middleware.mjs
var astro_internal_middleware_exports = {};
__export(astro_internal_middleware_exports, {
  onRequest: () => onRequest
});
var redirectsLegacy, REDIRECTS, DATE_PATH_RE, onRequest$2, When, isBuildContext, whenAmI, middlewares, onRequest$1, onRequest;
var init_astro_internal_middleware = __esm({
  "_worker.js/_astro-internal_middleware.mjs"() {
    "use strict";
    init_index_B_gW6nkE();
    init_astro_designed_error_pages_DfD573yd();
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    redirectsLegacy = {
      "/ombre-e-luci-n-1-1983-sfogliabile/": "/blog/ombre-e-luci-n-3-1983-sfogliabile/",
      "/ombre-e-luci-n-1-1983/": "/blog/ombre-e-luci-n-3-1983-sfogliabile/",
      "/editoriale-4-la-sindrome-down/": "/blog/editoriale-4-il-mio-bambino-con-la-sindrome-down/",
      "/centro-di-formazione-professionale-dell-opera-francescana-charitas-di-vicenza/": "/blog/vicenza-centro-di-formazione-professionale-dell-opera-francescana-charitas/",
      "/dialogo-aperto-n-2/": "/blog/dialogo-aperto-numero-2/",
      "/nessun-uomo-e-una-pietr/": "/blog/nessun-uomo-e-una-pietra/",
      "/e-sempre-stato-rifiutato__trashed/": "/blog/e-sempre-stato-rifiutato/",
      "/il-bambino-trisomico/": "/blog/trisomia-21-la-sindrome-down/",
      "/chiediamo-alle-comunita-religiose/": "/blog/secondo-le-possibilita-e-secondo-il-vangelo-chiediamo-alle-comunita-religiose/",
      "/la-riabilitazione/": "/blog/la-riabilitazione-nella-scuole-ma-la-bambina-non-e-tenuta-in-classe/",
      "/psicosi-precoci/": "/blog/psicosi-precoci-che-cosa-sono/",
      "/un-centro-per-la-cura-della-psicosi/": "/blog/oltre-la-scienza-umanita-e-buon-senso-in-un-centro-per-la-cura-della-psicosi/",
      "/oltre-la-scienza-e-l-umanita-un-centro-per-la-cura-della-psicosi/": "/blog/oltre-la-scienza-umanita-e-buon-senso-in-un-centro-per-la-cura-della-psicosi/",
      "/consigli-utili/": "/blog/psicosi-infantile-alcuni-consigli-utili/",
      "/una-verita-difficile-a-dirsi/": "/blog/integrazione-a-scuola-una-verita-difficile-a-dirsi/",
      "/il-volontariato/": "/blog/quando-e-volontariato/",
      "/storia-di-unadozione/": "/blog/il-nostro-cucciolo-di-due-metri-storia-di-un-adozione/",
      "/dialogo-aperto/": "/blog/dialogo-aperto-n-9/",
      "/dialogo-aperto-n-10/": "/blog/dialogo-aperto-n-9/",
      "/e_gli_altri-_figli_consigli_per_-i_-genitori_di_bambino_disabile/": "/blog/altri_figli_consigli_per_genitori_bambino_disabile/",
      "/un-piccolo-vademecum-comportarsi-fratelli-le-sorelle/": "/blog/altri_figli_consigli_per_genitori_bambino_disabile/",
      "/ma-dopo-rincontro-non-li-vedo-piu/": "/blog/ma-dopo-l-incontro-non-li-vedo-piu/",
      "/mio-e-fra-tello-era-handicappato/": "/blog/mio-fratello-era-handicappato/",
      "/mi-saro-unidea/": "/blog/mi-saro-fatto-un-idea/",
      "/essere-vicini-fin-vita/": "/blog/essere-vicini-a-chi-e-in-fin-di-vita/",
      "/un-mondo-scoprire-camminando-fermandoci-2/": "/blog/un-mondo-scoprire-camminando-fermandoci/",
      "/prepariamolo-vivere-gli-altri/": "/blog/prepariamolo-vivere-con-gli-altri/",
      "/\u30E1\u30EA\u30FC\u30AF\u30EA\u30B9\u30DE\u30B9/": "/blog/natale-giappone/",
      "/feliz-natal/": "/blog/natale-brasile/",
      "/dialogo-aperto-n-11/": "/blog/dialogo-aperto-n-13/",
      "/c-po\u0436\u0434\u0435ctbom/": "/blog/natale-russia/",
      "/sretan-bozi/": "/blog/natale-slovenia/",
      "/la-sfida-dellarca-2/": "/blog/la-sfida-dellarca-recensione/",
      "/voi-che-avreste-fatto/": "/blog/il-peso-degli-sguardi/",
      "/le-parole-martini/": "/blog/i-genitori-commentano-le-parole-del-cardinal-martini/",
      "/perche-venuti-ad-assisi/": "/blog/siamo-venuti-ad-assisi-per/",
      "/grazie-san-francesco-venuto-camminare/": "/blog/grazie-san-francesco-venuto-camminare-con-noi/",
      "/signore-uno-strumento-della-tua-pace/": "/blog/signore-fa-di-me-uno-strumento-della-tua-pace/",
      "/lettera-di-una-mamma/": "/blog/la-fortuna-di-avere-daniela-lettera-di-una-mamma/",
      "/tutto-quello-che-ha-f/": "/blog/tutto-quello-che-ha-fatto-per-noi/",
      "/convento-seconda-famiglia-giampiero/": "/blog/convento-una-seconda-famiglia-per-giampiero/",
      "/arrivano-fatt-curagg/": "/blog/quando-arrivano-fatti-coraggio/",
      "/numero-17-adulti-sfogliabile/": "/blog/ombre-luci-n-17-1987-sfogliabile/",
      "/numero-17-1987-sfogliabile/": "/blog/ombre-luci-n-17-1987-sfogliabile/",
      "/ombre-e-luci-n-18-1987-sfogliabile/": "/blog/ombre-luci-n-18-1987-sfogliabile/",
      "/numero-18-1987-sfogliabile/": "/blog/ombre-luci-n-18-1987-sfogliabile/",
      "/numero-16-1986-sfogliabile/": "/blog/ombre-luci-n-16-1986-sfogliabile/",
      "/ombre-luci-n-14-1986-sfogliabile-2/": "/blog/ombre-luci-n-14-1986-sfogliabile/",
      "/ombre-luci-n-11-1986-sfogliabile/": "/blog/ombre-luci-n-11-1985-sfogliabile/",
      "/non-so-dirlo/": "/blog/non-so-come-ne-a-chi-dirlo/",
      "/dal-diario-uninsegnante/": "/blog/dal-diario-di-un-insegnante/",
      "/pietre-paragone/": "/blog/la-persona-con-disabilita-come-fonte-di-unita-nella-chiesa/",
      "/dove-vivono-come-vivono/": "/blog/villa-san-giovanni-di-dio/",
      "/vivono-vivono-le-persone-colpite-malattia-mentale/": "/blog/dove-come-vivono-persone-colpite-malattia-mentale/",
      "/boccati-nel-sogno/": "/blog/bloccati-nel-sogno/",
      "/scuola-ricamo-stare-insieme-divertendoci/": "/blog/scuola-ricamo-imparare-divertendoci/",
      "/fare-teatro/": "/blog/fare-teatro-persone-disabili/",
      "/dialogo-aperto-m-24/": "/blog/dialogo-aperto-n-24/",
      "/conoscere-lhandicap-autismo/": "/blog/conoscere-handicap-autismo/",
      "/sotto-rocchio-dellorologio/": "/blog/christopher-nolan-sotto-locchio-dellorologio/",
      "/ascolta-bone-joseph/": "/blog/ascolta-bene-joseph/",
      "/rimini-ex-mattatoio-riqualificato-a-centro-di-accoglienza-per-disabilita/": "/blog/riccione-ex-mattatoio-riqualificato-a-centro-di-accoglienza-per-disabilita/",
      "/una-grande-famiglia-del-mondo/": "/blog/fede-e-luce-una-grande-famiglia-del-mondo/",
      "/un-campeggio-rocca-papa-ora-comincia-bello/": "/blog/vita-fede-e-luce-n-11-un-campeggio-rocca-papa-ora-comincia-bello/",
      "/incontro-internazionale-edimburgo-1-9-agosto-1990/": "/blog/incontro-internazionale-edimburgo-agosto-1990/",
      "/malattia-mentale-e-legge/": "/blog/malattia-mentale-legge-180/",
      "/un-territorio-molti-progetti/": "/blog/primavalle-un-territorio-molti-progetti/",
      "/se/": "/blog/anche-noi-siamo-persone/",
      "/diaolog/": "/blog/dialogo-aperto-n-35/",
      "/treviso-in-your-shoes-il-concorso-studentesco-per-progetti-di-inclusione-sociale/": "/blog/in-your-shoes-concorso-studenti-inclusione/",
      "/piu-che-una-rivista-una-grande-famiglia/": "/blog/10-anni-di-ombre-e-luci-piu-che-una-rivista-una-grande-famiglia/",
      "/unestate-di-campi-fede-e-luce-2/": "/blog/ridere-a-partire-dal-corpo/",
      "/non-si-puo-ridere-che-dellhandicap-2/": "/blog/ridere-a-partire-dal-corpo/",
      "/la-sedia-a-rotelle-e-i-chicchi-duva-2/": "/blog/ridere-a-partire-dal-corpo/",
      "/dalle-province-n-127-2/": "/blog/ridere-a-partire-dal-corpo/",
      "/un-panorama-da-riscoprire/": "/blog/ridere-a-partire-dal-corpo/",
      "/un-gettone-di-liberta/": "/blog/ridere-a-partire-dal-corpo/",
      "/un-gettone-di-liberta-recensione-2/": "/blog/ridere-a-partire-dal-corpo/",
      "/ridere-a-partire-dal-corpo-2/": "/blog/un-dado-vegetale-da-sogno-e-fatto-in-casa/",
      "/un-gettone-di-liberta-2/": "/blog/mio-figlio-luciano/",
      "/la-nostra-vita-insieme-recensione-2/": "/blog/mio-figlio-luciano/",
      "/di-padre-in-figlio-conversazioni-sul-rischio-di-educare-recensione-2/": "/blog/mio-figlio-luciano/",
      "/dialogo-aperto-n-127-2/": "/blog/mio-figlio-luciano/",
      "/la-carrozzina-sulle-macerie-2/": "/blog/mio-figlio-luciano/",
      "/umorismo-e-handicap-un-terreno-minato-2/": "/blog/mio-figlio-luciano/",
      "/ridere-e-una-cosa-seria-2/": "/blog/mio-figlio-luciano/",
      "/diritti-delle-persone-disabili/": "/blog/diritti-delle-persone-disabili-secondo-onu/",
      "/viola-e-mimosa/": "/blog/liberta/",
      "/vite-straordinarie-3/": "/blog/liberta/",
      "/dalle-province-n-144-2/": "/blog/liberta/",
      "/dialogo-aperto-n-144-2/": "/blog/liberta/",
      "/meglio-di-come-ci-si-aspetta-2/": "/blog/liberta/",
      "/mi-chiamo-lucia-2/": "/blog/liberta/",
      "/anffas-60-anni-di-futuro-2/": "/blog/liberta/",
      "/tutti-possono-essere-santi-2/": "/blog/liberta/",
      "/casa-loic/": "/blog/inaugurazione-casa-loic-scuola-laboratorio-artigianale-per-ragazzi-disabili/",
      "/casa-loic-scuola-laboratorio-artigianale-per-ragazzi-disabili/": "/blog/inaugurazione-casa-loic-scuola-laboratorio-artigianale-per-ragazzi-disabili/",
      "/una-mappa-di-ricordi-virtuale-per-contrastare-lalzheimer/": "/blog/alzheimer-vita-ricordi/",
      "/diversi-da-chi-diversi-da-chi-normali-vite-con-handicap/": "/blog/diversi-da-chi-normali-vite-con-handicap/",
      "/la-nostra-meglio-gioventu-fano-2018/": "/blog/fano2018/",
      "/in-alto-in-basso/": "/blog/luca-mio-figlio-autistico/",
      "/esperienza-di-un-obiettore-in-una-comunita/": "/blog/ho-guadagnato-un-anno-al-carro/",
      "/vestita-di-nuvole2/": "/blog/vestita-di-nuvole/",
      "/bozza-automatica/": "/blog/catechesi-anche-per-le-persone-autistiche/",
      "/insieme-si-puo/": "/blog/soluzione-per-malati-mentali-insieme-si-puo/",
      "/la-nostra-casa/": "/blog/comunita-tau-la-nostra-casa/",
      "/comunita-taula-nostra-casa/": "/blog/comunita-tau-la-nostra-casa/",
      "/il-mio-piede-sinistro-2/": "/blog/il-mio-piede-sinistro-il-film/",
      "/rain-man/": "/blog/rain-man-la-recensione/",
      "/figli-di-un-dio-minore/": "/blog/figli-di-un-dio-minore-recensione/",
      "/come-dirlo-2/": "/blog/il-progetto-girotondo/",
      "/non-era-normale-2/": "/blog/il-mistero-di-tanto-bene/",
      "/laltra-famiglia-storie-e-percorsi-di-affido-al-villaggio-sos-recensione/": "/blog/viola-e-mimosa-a-manila/",
      "/io-sono-qui-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/mai-piu-soli-lavventura-di-fede-e-luce-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/fede-e-luce-dalle-province-n-121-2/": "/blog/viola-e-mimosa-a-manila/",
      "/da-citta-del-messico/": "/blog/viola-e-mimosa-a-manila/",
      "/viola-e-mimosa-da-citta-del-messico-2/": "/blog/viola-e-mimosa-a-manila/",
      "/dialogo-aperto-n-121-2/": "/blog/viola-e-mimosa-a-manila/",
      "/un-po-di-follia-per-fare-meraviglie-2/": "/blog/viola-e-mimosa-a-manila/",
      "/per-una-vita-di-comunione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/jean-christophe-parisot-un-cercatore-di-dio-2/": "/blog/viola-e-mimosa-a-manila/",
      "/bartimeo-uomo-solo-in-mezzo-alla-folla-2/": "/blog/viola-e-mimosa-a-manila/",
      "/qualcuno-aspetta-2/": "/blog/viola-e-mimosa-a-manila/",
      "/una-comunita-e-essere-insieme-2/": "/blog/viola-e-mimosa-a-manila/",
      "/primavera-di-fede-2/": "/blog/viola-e-mimosa-a-manila/",
      "/prendetene-e-mangiatene-tutti-2/": "/blog/viola-e-mimosa-a-manila/",
      "/intervista-a-jean-vanier-2/": "/blog/viola-e-mimosa-a-manila/",
      "/cosi-e-sceso-dal-trono-2/": "/blog/viola-e-mimosa-a-manila/",
      "/io-sono-nato-cosi-come-imparare-a-guardare-oltre-la-differenza-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/come-pinguini-nel-deserto-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/una-notte-ho-sognato-che-parlavi-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/carissimo-cardinale-2/": "/blog/viola-e-mimosa-a-manila/",
      "/la-figlia-dellaltra-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/il-vangelo-dei-vinti-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/annachiara-bortolotti-ed-curcu-genovese-pp-125/": "/blog/viola-e-mimosa-a-manila/",
      "/chiamami-alex-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/momenti-misteriosi-2/": "/blog/il-carro-una-casa-famiglia-per-tutti/",
      "/quando-a-raccontare-lolocausto-sono-gli-ex-naxisti/": "/blog/recensione-final-account/",
      "/disabilita-e-quei-bisogni-non-ascoltati/": "/blog/recensione-listen/",
      "/come-difficile-convivere-con-lepatite-b/": "/blog/recensione-the-best-is-yet-to-come/",
      "/perso-nella-traduzione/": "/blog/recensione-quo-vadis-aida/",
      "/oaza-ai-confini-della-finzione/": "/blog/recensione-oaza/",
      "/barriere-invisibili-al-cuore-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/mi-saro-fatto-unidea-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/fede-e-luce-essere-movimento-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/proprio-io-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/un-tesoro-inestimabile-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/il-dono-dellunita-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/custodire-ogni-persona-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/la-poverta-delle-beatitudini-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/una-profezia-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/e-ci-si-sente-un-po-soli-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/tutti-insieme-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/fragile-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/la-scossa-della-vunerabilita-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/programma-del-pellegrinaggio-a-roma-del-1975-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/perche-questo-pellegrinaggio-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/bilancio-fede-e-luce-1975-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/i-piu-difficili-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/mi-sento-in-crisi-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/festa-della-luce-1976-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/pennellate-dai-centri-fede-e-luce-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/incontrarsi-il-venerdi-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/resoconto-della-riunione-internazionale-di-fede-e-luce-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/vedremo-mai-la-luce-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-3/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/esperienze-un-week-end-fuori-dallordinario-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/dove-lo-prendo-tanto-amore-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/xavier-un-mio-un-nostro-nuovo-a-amico-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/un-metodo-efficace-per-leducazione-dei-bambini-con-disabilita-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/guidare-alla-luce-catechesi-sensoriale-per-una-vita-spirituale-inclusiva-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/letture-consigliate-darti-la-vita-recensione-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/notiziario-fede-e-luce-il-resoconto-dellultima-festa-della-luce-e-altre-notizie-dal-movimento-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/alla-ricerca-delle-vere-vacanze-rompere-gli-schemi-e-scoprire-il-significato-profondo-del-riposo-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/la-vecchia-signora-brontolona-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/i-bambini-autistici-una-guida-per-genitori-recensione-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/a-tutti-i-gruppi-fede-e-luce-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/notiziario-fede-e-luce-dicembre-1977/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/esperienze-estive-fra-arche-e-mary-mount-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/alfedena-1976-esperienze-di-vita-comunitaria-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/attivita-di-tempo-libero-e-vita-comunitaria-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/per-la-nostra-riflessione-una-croce-di-carta-smerigliata-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-11-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/lettera-aperta-a-padre-michel-charpantier-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/editoriale-parliamo-di-insieme-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/bilancio-fede-e-luce-1976-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/gli-altri-un-figlio-subnormale-recensione-libro-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/notiziario-fede-e-luce-n-13-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/fede-e-luce-incontri-internazionali-e-nazionali-1977-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/esperienze-al-club-avance-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/techniche-di-recupero-per-i-disabili-gravi-la-socializzazione-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/per-nostra-riflessione-la-comunione-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-13-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/editoriale-auguri-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/letture-consigliate-n-13-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/parliamo-di-ri-educazione-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/notiziario-fede-e-luce-n-14-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/attivita-di-fine-stagione-del-gruppo-san-paolo-di-roma-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/cosa-si-fa-nelle-casette-di-fede-e-luce-le-risposte-di-chi-ce-stato-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/leducazione-delle-persone-disabili-imparare-a-vestirsi-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/per-la-nostra-riflessione-milano-vederci-piu-chiaro/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/inno-alla-vita-di-una-handicappata-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-14-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/editoriale-vacanze-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/editoriale-amici-o-fratelli-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/editoriale-le-nostre-paure-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-16-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/la-comunita-che-accoglie-di-rifiutati-recensione-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/preparazione-al-pellegrinaggio-fede-e-luce-ad-assisi-1978-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/quando-arrivano-le-vacanze-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-18-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-19-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/quattordici-anni-con-loro-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/per-la-loro-educazione-bilancio-di-unestate-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/alfedena-1978-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/vacanze-1978-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/una-lezione-damore-incontro-fede-e-luce-llalelli-galles-del-sud-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/soggiorno-allarche-1978-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/sono-andata-a-bruxelles-a-fare-volontariato-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/katimavik-una-parole-escquimese-che-vuol-dire-incontro/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/katimavik-una-parola-escquimese-che-vuol-dire-incontro-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/i-bambini-profondamente-handicappati-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/lamore-non-basta-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/aria-di-vacanze-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-22-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/un-compleanno-al-capezzale-di-un-amico-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/mattone-su-mattone-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/focus-gli-adulti-profondamente-handicappati-alcune-testimonianze-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/mio-fratello-marco-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/siamo-stati-dei-buoni-genitori-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/non-avrei-mai-pensato-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/un-antidoto-alla-disperazione-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/sprovveduto-e-sorpreso-chi-non-lo-e-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/incontro-internazionale-a-cuneo-28-29-aprile-1979-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/pellegrinaggio-a-loreto-18-20-maggio-1979/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/pellegrinaggio-a-loreto-1979-raccontato-da-olga-gammarelli/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/perche-vi-chiamate-fede-e-luce-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-23-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/gli-adulti-lievemente-handicappati/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/trovai-lavoro-in-una-casa-farmaceutica-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/amicizie-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/vuoi-essere-mio-amico-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/saluta-la-tua-insegnante-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/e-domani-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/dialoghi-scomodi-amicizie-vere-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/teresa-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/teresa-ventanni-di-cambiamenti-nellapproccio-alla-disabilita/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/genitori-speciali-zzati-servizio-di-consulenza-pedagogica-di-trento-2/": "/blog/qualcosa-e-cambiato/",
      "/gioia-e-le-altre/": "/blog/qualcosa-e-cambiato/",
      "/gioia-e-le-altre-recensione-2/": "/blog/qualcosa-e-cambiato/",
      "/il-chicco-recensione-2/": "/blog/qualcosa-e-cambiato/",
      "/alla-ricerca-di-dory-recensione-2/": "/blog/qualcosa-e-cambiato/",
      "/la-tempesta-di-sasa-recensione-2/": "/blog/qualcosa-e-cambiato/",
      "/se-arianna-recensione-2/": "/blog/qualcosa-e-cambiato/",
      "/viola-e-occhiolino-2/": "/blog/qualcosa-e-cambiato/",
      "/il-valore-del-cammino-insieme-2/": "/blog/qualcosa-e-cambiato/",
      "/nuove-comunita-fede-e-luce-festa-in-umbria-2/": "/blog/qualcosa-e-cambiato/",
      "/accogliere-la-sorpresa-2/": "/blog/qualcosa-e-cambiato/",
      "/il-messaggio-del-giubileo-dialogo-con-mons-rino-fisichella-2/": "/blog/qualcosa-e-cambiato/",
      "/pedagogia-del-dolore-innocente-recensione-2/": "/blog/qualcosa-e-cambiato/",
      "/io-sono-con-te-recensione-2/": "/blog/qualcosa-e-cambiato/",
      "/dalle-province-n-136-2/": "/blog/qualcosa-e-cambiato/",
      "/i-doni-di-dio-2/": "/blog/qualcosa-e-cambiato/",
      "/leducazione-attraverso-lesempio-2/": "/blog/qualcosa-e-cambiato/",
      "/la-misericordia-2/": "/blog/qualcosa-e-cambiato/",
      "/tu-ci-hai-chiamati-eccoci-2/": "/blog/qualcosa-e-cambiato/",
      "/lamicizia-incarnata-2/": "/blog/eccomi-lesempio-di-maria/",
      "/joyeux-noel-3/": "/blog/eccomi-lesempio-di-maria/",
      "/sempre-di-nuovo-ci-commuove-2/": "/blog/eccomi-lesempio-di-maria/",
      "/dialogo-aperto-n-124-2/": "/blog/eccomi-lesempio-di-maria/",
      "/la-bambina-che-andava-a-pile/": "/blog/la-mia-forza-nella-mia-differenza/",
      "/la-bambina-che-andava-a-pile-recensione-2/": "/blog/la-mia-forza-nella-mia-differenza/",
      "/dalle-provice-n-142/": "/blog/la-mia-forza-nella-mia-differenza/",
      "/dalle-province-n-142-2/": "/blog/la-mia-forza-nella-mia-differenza/",
      "/dalle-mamme-di-palidoro-perche-curare-non-significa-solo-guarire-2/": "/blog/la-mia-forza-nella-mia-differenza/",
      "/limportante-e-che-sia-sano-2/": "/blog/dimmi-chi-ammiri/",
      "/raccontami-il-mare-che-hai-dentro-vivere-con-un-figlio-autistico-recensione-2/": "/blog/dimmi-chi-ammiri/",
      "/quello-che-non-ho-mai-detto-e-lisola-di-noi-recensione-di-due-libri-di-federico-de-rosa-2/": "/blog/dimmi-chi-ammiri/",
      "/diaologo-aperto-n-140-2/": "/blog/dimmi-chi-ammiri/",
      "/epigenetica-e-malattie-psichiatriche-2/": "/blog/dimmi-chi-ammiri/",
      "/mi-chiamo-charlotte-fien-e-ho-la-sindrome-di-down-2/": "/blog/dimmi-chi-ammiri/",
      "/non-smettete-di-crederci-mai-recensione-2/": "/blog/dalle-province-n-123/",
      "/persone-prima-che-disabili-una-riflessione-sullhandicap-tra-giustizia-ed-etica-recensione-2/": "/blog/dalle-province-n-123/",
      "/un-dio-inutile-recensione-2/": "/blog/dalle-province-n-123/",
      "/cosa-fare-delle-nostre-ferite-recensione-2/": "/blog/dalle-province-n-123/",
      "/creatures-disconforts-2/": "/blog/dalle-province-n-123/",
      "/sia-fatta-la-tua-volonta-2/": "/blog/ci-hanno-scritto-insieme-n-27/",
      "/di-nuovo-in-cammino-2/": "/blog/ci-hanno-scritto-insieme-n-27/",
      "/fratelli-e-sorelle-di-persone-con-disabilita-3/": "/blog/ci-hanno-scritto-insieme-n-27/",
      "/uno-due-tre-stella-2/": "/blog/ci-hanno-scritto-insieme-n-27/",
      "/quel-che-la-convenzione-dice-e-non-dice/": "/blog/intervista-giampiero-griffo/",
      "/una-storia-sacra-2/": "/blog/le-mimose-di-yolanda/",
      "/speciale-natale-nel-mondo-2/": "/blog/le-mimose-di-yolanda/",
      "/posso-devo-voglio-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/volevo-essere-una-farfalla-recensione-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/dalle-province-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/speleologi-del-mistero-del-piccolo-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/la-parola-alle-mamme-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/anoressia-fame-damore-e-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/i-tuoi-figli-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/si-chiama-sara-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/la-nostra-scelta/": "/blog/la-nostra-scelta-di-cristina/",
      "/mio-figlio-luciano-2/": "/blog/il-lato-b-di-essere-papa-di-un-figlio-disabile/",
      "/sara-e-le-sbiruline-di-emily-2/": "/blog/bellezza-e-handicap/",
      "/il-vecchio-re-nel-suo-esilio/": "/blog/bellezza-e-handicap/",
      "/dialogo-aperto-n-119-2/": "/blog/bellezza-e-handicap/",
      "/come-essere-vicini-allaltro-2/": "/blog/bellezza-e-handicap/",
      "/i-nonni-una-tenerezza-in-piu-2/": "/blog/bellezza-e-handicap/",
      "/il-loro-sguardo-buca-le-nostre-ombre-recensione-2/": "/blog/bellezza-e-handicap/",
      "/larca-di-trosly-2/": "/blog/bellezza-e-handicap/",
      "/sindrome-di-costello-la-storia-di-sandrino-2/": "/blog/bellezza-e-handicap/",
      "/affrontare-lenorme-paura-intervista-a-pietro-2/": "/blog/bellezza-e-handicap/",
      "/cosa-sono-le-malattie-rare-2/": "/blog/bellezza-e-handicap/",
      "/rarina-storia-di-un-fiore-raro-2/": "/blog/bellezza-e-handicap/",
      "/dialogo-aperto-n-118-2/": "/blog/bellezza-e-handicap/",
      "/carissime-mamme-2/": "/blog/bellezza-e-handicap/",
      "/mani-calde-recensione-2/": "/blog/bellezza-e-handicap/",
      "/fai-bei-sogni-recensione-2/": "/blog/bellezza-e-handicap/",
      "/fede-e-luce-dalle-provincie-2/": "/blog/bellezza-e-handicap/",
      "/fede-e-luce-una-fedelta-che-ridona-lentusiasmo-2/": "/blog/bellezza-e-handicap/",
      "/jean-vanier-dalla-palestina-2/": "/blog/bellezza-e-handicap/",
      "/mamma-sono-contento-di-essere-nato-2/": "/blog/bellezza-e-handicap/",
      "/la-memoria-del-bello-2/": "/blog/bellezza-e-handicap/",
      "/falsi-moralismi-sul-bello-di-essere-down-2/": "/blog/bellezza-e-handicap/",
      "/cosa-rende-qualcuno-straordinario-intervista-a-nick-vujicic-2/": "/blog/bellezza-e-handicap/",
      "/un-gatto-la-comunita-e-il-nostro-apartheid/": "/blog/luca-adotta-alba/",
      "/una-sera-a-roma-allo-stadio-dei-marmi-per-lapertura-delle-special-olympics/": "/blog/una-sera-a-roma-stadio-dei-marmi-special-olympics/",
      "/dialogo-aperto-n-116-2/": "/blog/giovani-eroi/",
      "/vita-fede-e-luce-n-113-2/": "/blog/giovani-eroi/",
      "/fede-e-luce-festeggia-i-suoi-40-anni-1971-2011/": "/blog/giovani-eroi/",
      "/vita-fede-e-luce-la-festa-per-i-nostri-40-anni-1971-2011-2/": "/blog/giovani-eroi/",
      "/fede-e-luce-e-subito-scatto-la-molla-2/": "/blog/giovani-eroi/",
      "/10-buoni-motivi-per-fare-volontariato-2/": "/blog/giovani-eroi/",
      "/doposcuola-al-campo-rom-2/": "/blog/giovani-eroi/",
      "/lamicizia-asimmetrica-2/": "/blog/giovani-eroi/",
      "/volontariato-una-leva-per-la-vita-2/": "/blog/giovani-eroi/",
      "/oggi-sono-libero-2/": "/blog/giovani-eroi/",
      "/un-sacco-di-felicita-2/": "/blog/giovani-eroi/",
      "/ndangwini-casa-dove-esiste-una-famiglia-2/": "/blog/giovani-eroi/",
      "/tra-individualismo-e-impegno-i-giovani-hanno-bisogno-di-concretezza-2/": "/blog/giovani-eroi/",
      "/istantanea-2/": "/blog/giovani-eroi/",
      "/nessun-profitto-recensione-2/": "/blog/giovani-eroi/",
      "/il-linguaggio-segreto-dei-fiori-recensione-2/": "/blog/giovani-eroi/",
      "/la-speranza-non-fa-rumore-recensione-2/": "/blog/giovani-eroi/",
      "/per-sempre-recensione-2/": "/blog/giovani-eroi/",
      "/in-corsia-2/": "/blog/giovani-eroi/",
      "/vita-fede-e-luce-linizio-di-un-cammino-2/": "/blog/giovani-eroi/",
      "/posso-vivere-lssenziale-che-non-e-fare-per-ma-vivere-con-le-persone-piu-fragili-2/": "/blog/giovani-eroi/",
      "/farsi-carico-degli-ultimi-2/": "/blog/giovani-eroi/",
      "/dialogo-aperto-n-115-2/": "/blog/giovani-eroi/",
      "/quasi-non-li-riconoscevo-2/": "/blog/giovani-eroi/",
      "/tempo-di-regali-2/": "/blog/giovani-eroi/",
      "/vizi-e-virtu-del-vivere-recensione-2/": "/blog/giovani-eroi/",
      "/storia-di-un-uomo-ritratto-di-carlo-maria-martini-recensione-2/": "/blog/giovani-eroi/",
      "/avevano-spento-anche-la-luna-recensione-2/": "/blog/giovani-eroi/",
      "/il-tempo-delle-donne-recensione-2/": "/blog/giovani-eroi/",
      "/con-lidea-di-non-andare-2/": "/blog/giovani-eroi/",
      "/tre-domande-ed-un-pellegrinaggio-2/": "/blog/giovani-eroi/",
      "/messaggeri-di-gioia-2/": "/blog/giovani-eroi/",
      "/nel-profondo-della-malattia-una-comunione-e-possibile-2/": "/blog/giovani-eroi/",
      "/ci-chiedono-da-che-parte-stai-2/": "/blog/giovani-eroi/",
      "/la-grande-casa-di-peter-pan-2/": "/blog/giovani-eroi/",
      "/allora-hai-deciso-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/il-carro-una-casa-famiglia-per-tutti-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/relazioni-sincere-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/posso-salutare-la-mamma-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/purche-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/come-e-nato-ombre-e-luci-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/chi-ha-seminato-nelle-lacrime-miete-nella-gioia-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/molto-lavoro-da-fare-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/sicurezza-nel-cammino-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/effetto-alfedena-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/una-scelta-difficile/": "/blog/dopo-la-scuola-dellobbligo-una-scelta-difficile/",
      "/circa-il-concetto-di-apertura-dei-centri-diurni-riabilitativi/": "/blog/centri-diurni-coronavirus/",
      "/ci-provero-2/": "/blog/vuoi-bene-a-gesu/",
      "/pregando-su-una-sedia-imponente-e-semplice-2/": "/blog/vuoi-bene-a-gesu/",
      "/il-mosaico-tanti-sassolini-colorati-2/": "/blog/vuoi-bene-a-gesu/",
      "/mariangela-linizio-a-santa-silvia-2/": "/blog/vuoi-bene-a-gesu/",
      "/partecipe-dei-miracoli-2/": "/blog/vuoi-bene-a-gesu/",
      "/mirtilli-2/": "/blog/vuoi-bene-a-gesu/",
      "/small-talk-ma-extralarge-2/": "/blog/vuoi-bene-a-gesu/",
      "/il-regalo-piu-bello-2/": "/blog/vuoi-bene-a-gesu/",
      "/quel-gesto-2/": "/blog/vuoi-bene-a-gesu/",
      "/quanta-forza-2/": "/blog/vuoi-bene-a-gesu/",
      "/un-patrimonio-profuso-a-piene-mani-2/": "/blog/vuoi-bene-a-gesu/",
      "/sollecitare-la-speranza-2/": "/blog/vuoi-bene-a-gesu/",
      "/piero-e-il-bruco-farfalla-recensione-2/": "/blog/giubileo-2016-la-vera-gioia/",
      "/dalle-provincie-n-134-2/": "/blog/giubileo-2016-la-vera-gioia/",
      "/la-passione-della-pazienza-2/": "/blog/giubileo-2016-la-vera-gioia/",
      "/un-laboratorio-creativo-a-pantigliate-2/": "/blog/giubileo-2016-la-vera-gioia/",
      "/il-chicco-vivere-il-vangelo-in-azione-2/": "/blog/giubileo-2016-la-vera-gioia/",
      "/papa-francesco-al-chicco-qui-mi-avete-toccato-il-cuore-2/": "/blog/giubileo-2016-la-vera-gioia/",
      "/oltre-il-limite-2/": "/blog/giubileo-2016-la-vera-gioia/",
      "/perche-di-katherine-e-nerissa-non-ci-sono-tracce/": "/blog/the-crown-cugine-autismo/",
      "/dalle-province-n-140-2/": "/blog/dopo-di-noi-i-diritti-che-ci-sono/",
      "/legge-sul-dopo-di-noi-issiamo-le-vele-2/": "/blog/dopo-di-noi-i-diritti-che-ci-sono/",
      "/come-e-stato-possibile-tutto-questo-2/": "/blog/doni-preziosi/",
      "/alza-lo-sguardo/": "/blog/doni-preziosi/",
      "/per-me-e-felicita-2/": "/blog/doni-preziosi/",
      "/mai-piu-soli-tre-testimonianze-2/": "/blog/la-covazione-di-un-papa/",
      "/mamma-ti-posso-parlare-recensione/": "/blog/rico-oscar-e-il-ladro-ombra-recensione/",
      "/chi-resta-deve-capire-recensione-2/": "/blog/rico-oscar-e-il-ladro-ombra-recensione/",
      "/dedicato-ad-unamica-2/": "/blog/a-te-bambino-mio/",
      "/questestate-faremo-2/": "/blog/a-te-bambino-mio/",
      "/dialogo-aperto-n-136-2/": "/blog/quattro-giorni-mano-nella-mano/",
      "/vedere-oltre-finestre-su-una-storia-recensione-2/": "/blog/quattro-giorni-mano-nella-mano/",
      "/il-libro-di-charlotte-recensione-2/": "/blog/quattro-giorni-mano-nella-mano/",
      "/genitori-recensione-film-2/": "/blog/quattro-giorni-mano-nella-mano/",
      "/sono-graditi-visi-sorridenti-recensione-2/": "/blog/borderline-recensione/",
      "/riscoprire-cio-che-unisce-i-cuori-di-tutti-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/un-affidamento-speciale-3/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/la-ragnatela-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/siblings-recensione-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/lo-zaino-di-emma-recensione-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/alla-fine-qualcosa-ci-inventeremo-che-ne-sara-di-mio-figlio-autistico-quando-non-saro-piu-al-suo-fianco-recensione-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/di-corsa-verso-francesco-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/famiglia-per-chi-famiglia-per-cosa-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/una-buona-scuola-damore-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/la-lampada-dei-desideri-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/pinocchio-teatro-integrato-ma-non-solo-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/luoghi-della-relazione-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/il-libro-di-cristopher-a-wonder-story-recensione-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/osservazioni-di-una-mamma-qualunque-recensione-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/viola-e-il-bullismo-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/fede-e-luce-in-armenia-e-in-iran/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/un-ragazzo-ribelle-2/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/ziguli-2/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/liguana-non-vuole/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/liguana-non-vuole-recensione-2/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/cosa-ti-manca-per-essere-felice-recensione-2/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/voci-dal-silenzio-recensione-2/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/fede-e-luce-in-iraq-2/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/un-coro-aperto-a-tutti-2/": "/blog/il-dilemma-della-valutazione/",
      "/dalle-province-n-123-2/": "/blog/il-dilemma-della-valutazione/",
      "/ho-imparato-2/": "/blog/aprirsi-ad-altre-famiglie/",
      "/testimoni-dellincontro-2/": "/blog/aprirsi-ad-altre-famiglie/",
      "/come-sei-cresciuto-2/": "/blog/aprirsi-ad-altre-famiglie/",
      "/tra-lacquario-e-loceano-2/": "/blog/voci-di-campo/",
      "/occasioni-per-stare-al-passo-2/": "/blog/voci-di-campo/",
      "/aprirsi-ad-altre-famiglie-2/": "/blog/voci-di-campo/",
      "/precious-recensione-film-2/": "/blog/dialogo-aperto-n-113/",
      "/uildm-unione-italiana-lotta-alla-distrofia-muscolare-2/": "/blog/dialogo-aperto-n-113/",
      "/vivere-con-la-distrofia-intervista-a-me-2/": "/blog/dialogo-aperto-n-113/",
      "/costruirsi-un-totem-capire-e-sentire-il-proprio-valore-recensione-2/": "/blog/e-la-luna-mi-guardo-recensione/",
      "/e-la-luna-mi-guardo-recensione-2/": "/blog/vita-fede-e-luce-n-110/",
      "/scegliamo-con-cura-le-parole-2/": "/blog/viola-e-mimosa-desaparecida/",
      "/il-mistero-di-tanto-bene-2/": "/blog/angelo-un-compagno-di-viaggio/",
      "/raggi-di-sole-2/": "/blog/angelo-un-compagno-di-viaggio/",
      "/eh-io-sono-qui-2/": "/blog/angelo-un-compagno-di-viaggio/",
      "/90-anni-di-jean-2/": "/blog/una-radice-e-delle-ali/",
      "/viola-e-mimosa-desaparecida-2/": "/blog/una-radice-e-delle-ali/",
      "/con-il-tuo-passo-percorsi-agesci-2/": "/blog/una-radice-e-delle-ali/",
      "/dalle-province-n-142-3/": "/blog/dinamiche-fondamentali/",
      "/dinamiche-fondamentali-2/": "/blog/i-miei-occhi-e-il-mio-cuore-hanno-vissuto-la-meraviglia/",
      "/quanta-carta-stampata/": "/blog/ombre-e-luci-oggi-ha-ancora-senso/",
      "/la-forma-della-voce/": "/blog/la-forma-della-voce-recensione/",
      "/io-figlio-di-mio-figlio/": "/blog/io-figlio-di-mio-figlio-recensione/",
      "/la-sete-e-lacqua-della-speranza-una-riflessione-di-don-marco-bove/": "/blog/la-sete-e-lacqua-della-speranza/",
      "/lettera-aperta-a-francesco-dassisi-2/": "/blog/pellegrinaggio-assisi-1978-luis-sankale/",
      "/assisi-1978/": "/blog/pellegrinaggio-assisi-1978-luis-sankale/",
      "/oltre-la-cronaca-vicini-al-quotidiano-2/": "/blog/scarti-o-pietre-portanti/",
      "/i-miei-occhi-e-il-mio-cuore-hanno-vissuto-la-meraviglia-2/": "/blog/scarti-o-pietre-portanti/",
      "/quanti-conosci-per-nome-2/": "/blog/cosa-so-dei-social-e-cosa-ne-penso/",
      "/la-comunita-che-accoglie-di-rifiutati-recensione/": "/blog/la-comunita-che-accoglie-i-rifiutati-recensione/",
      "/curare-lautismo-a-casa-unopera-damore/": "/blog/curare-lautismo-a-casa-un-opera-damore/",
      "/lo-straordinario-viaggio-di-nujeen-recensione-2/": "/blog/dialogo-aperto-n-138/",
      "/corridoi-umanitari-2/": "/blog/dialogo-aperto-n-138/",
      "/dettagli-inutili-recensione-2/": "/blog/dialogo-aperto-n-138/",
      "/dalle-province-n-125-2/": "/blog/agli-antipodi-dellindividualismo/",
      "/fede-e-luce-in-terra-santa-2/": "/blog/agli-antipodi-dellindividualismo/",
      "/disabili-e-trapianti/": "/blog/sempre-damigella-mai-sposa/",
      "/agli-antipodi-dellindividualismo-2/": "/blog/un-gioco-da-fare-quando-fuori-piove/",
      "/editoriale-italiana-2000-pp-670/": "/blog/itinerari-guida-annuario-accoglienza-cattolica-italia-2000-recensione/",
      "/ci-hanno-scritto-una-critica-allultimo-numero-di-insieme-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/per-la-nostra-riflessione-prendete-e-mangiatene-tutti-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/leducazione-dei-bambini-cosiddetti-lievi-si-ma-quale-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/viviamo-una-vita-normale-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/non-e-cosi-facile-essere-madre-di-una-bambina-non-grave-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/si-e-allontanato-per-la-prima-volta-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/ora-ha-un-mondo-suo-oltre-la-sua-famiglia-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/in-vacanza-tutto-come-se-si-trattasse-di-un-gioco-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/adesso-fa-la-quarta-sta-ancora-con-noi-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/fu-in-tenda-che-mi-diede-il-benvenuto-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/come-mettere-in-quattro-righe-oltre-10-anni-di-vita-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/ci-hanno-scritto-n-21-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/apriamo-il-sipario-oggi-si-recita-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/il-ruolo-del-pediatra-nel-trattamento-del-bambino-handicappato-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/notiziario-fede-e-luce-n-21-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/beati-i-poveri-suggerimenti-per-le-tra-giornate-ad-assisi-1978-2/": "/blog/il-cantico-delle-creature/",
      "/ciao-gianluca-2/": "/blog/il-cantico-delle-creature/",
      "/tre-giorni-ad-assisi-2/": "/blog/il-cantico-delle-creature/",
      "/qualche-informazione-prima-di-partire-per-il-pellegrinaggio-di-assisi-2/": "/blog/il-cantico-delle-creature/",
      "/pappagalli-verdi-cronache-di-un-chirurgo-di-guerra/": "/blog/pappagalli-verdi-cronache-di-un-chirurgo-di-guerra-recensione/",
      "/viola-e-mimosa-n-140-2/": "/blog/caro-raffa-la-vita-e-adesso/",
      "/anna-che-sorride-alla-pioggia-recensione-2/": "/blog/caro-raffa-la-vita-e-adesso/",
      "/niccolo-tra-coloro-che-hanno-fatto-la-storia/": "/blog/ol-incontra-jorit/",
      "/come-doro/": "/blog/come-loro/",
      "/biografilm/": "/blog/biografilm-festival-2020/",
      "/squizo/": "/blog/sqizo/",
      "/qualcosa-e-cambiato-2/": "/blog/i-geni-del-futuro-crispr-cas9/",
      "/visto-al-cineforum-di-fede-e-luce-2/": "/blog/i-geni-del-futuro-crispr-cas9/",
      "/ho-amici-in-paradiso-recensione-2/": "/blog/i-geni-del-futuro-crispr-cas9/",
      "/dialogo-aperto-n-137-2/": "/blog/i-geni-del-futuro-crispr-cas9/",
      "/dalle-province-n-137-2/": "/blog/i-geni-del-passato-handiche/",
      "/una-veglia-laboratorio-per-il-giovedi-santo-2/": "/blog/i-geni-del-passato-handiche/",
      "/viola-e-mimosa-n-137-2/": "/blog/labilita-onlus-aprire-gli-occhi/",
      "/seveso-1976-oltre-la-diossina-2/": "/blog/labilita-onlus-aprire-gli-occhi/",
      "/leutanasia-di-dio-recensione-2/": "/blog/attesi-amati-trasformati/",
      "/i-geni-del-futuro-crispr-cas9-2/": "/blog/abitare-nellordinarieta/",
      "/viaggio-a-parma-del-1976-unesperienza-di-gioia-condivisione-e-scoperta-con-fede-e-luce-2/": "/blog/notiziario-di-fede-e-luce-n-10-1976/",
      "/un-angolino-di-arche-2/": "/blog/notiziario-di-fede-e-luce-n-10-1976/",
      "/storia-dellaborto-i-molti-protagonisti-e-interessi-di-una-lunga-vicenda/": "/blog/storia-dellaborto-i-molti-protagonisti-e-interessi-di-una-lunga-vicenda-recensione/",
      "/per-voi-e-per-tutti-consigli-pratici-perche-ne/": "/blog/per-voi-e-per-tutti-consigli-pratici-perche-nessuno-venga-rifiutato/",
      "/il-male-ela-sofferenza-raccontati-ai-bambini/": "/blog/il-male-e-la-sofferenza-raccontati-ai-bambini-recensione/",
      "/tu-sei-amato-da-dio-cosi-come-sei-2/": "/blog/anffas-ogni-persona-con-disabiltia-e-nostro-figlio/",
      "/viola-e-mimosa-a-manila-2/": "/blog/anffas-ogni-persona-con-disabiltia-e-nostro-figlio/",
      "/alfedena-per-immagini/": "/blog/alfedena/",
      "/lettera-a-jean-matteo-mazzarotto/": "/blog/lettere-a-jean-matteo-mazzarotto/",
      "/coltivare-i-propri-pensieri/": "/blog/dialogo-aperto-n-112/",
      "/per-una-vera-qualita-di-cura/": "/blog/dialogo-aperto-n-112/",
      "/il-mio-curriculum/": "/blog/benedetta-il-mio-curriculum/",
      "/liberi-di-vivere-come-tutti/": "/blog/liberi-di-vivere-come-tutti-prima-conferenza-nazionale-delle-politiche-sull-handicap/",
      "/i-nostri-grandi-amici-maria-teresa/": "/blog/maria-teresa-di-calcutta-dedicato-ai-bambini/",
      "/viola-e-mimosa-n-138/": "/blog/guidati-da-gio/",
      "/dedicato-ai-bambini-francesco/": "/blog/dedicato-ai-bambini-francesco-gammarelli/",
      "/io-sono-una-donna/": "/blog/io-sono-una-donna-perche-mi-chiami-andicappata/",
      "/io-sono-una-donna-perche-mi-chiamai-andicappata/": "/blog/io-sono-una-donna-perche-mi-chiami-andicappata/",
      "/il-progetto-girotondo-2/": "/blog/cervelli-ribelli-connettiamoci-neurodiversita/",
      "/da-fratello-e-da-padre-2/": "/blog/cervelli-ribelli-connettiamoci-neurodiversita/",
      "/cervelli-ribelli/": "/blog/cervelli-ribelli-connettiamoci-neurodiversita/",
      "/pellegrinaggio-assisi-1978-secondo-luis-sankale/": "/blog/vita-fede-e-luce-natale-1977-a/",
      "/leducazione-delle-persone-disabili-imparare-a-mangiare-insieme-e-in-autonomia-2/": "/blog/vita-fede-e-luce-natale-1977-a/",
      "/la-comunita-di-capodarco-2/": "/blog/vita-fede-e-luce-natale-1977-a/",
      "/tempo-di-imparare/": "/blog/tempo-di-imparare-valeria-parrella-recensione-libro/",
      "/blog-di-benedetta/": "/blog/tanto-io-non-la-perdo/",
      "/il-dilemma-della-valutazione-2/": "/blog/la-mia-disavventura/",
      "/costretta-a-legarmi-i-capelli-e-la-regola/": "/blog/ho-imparato-da-sola-a-divertirmi/",
      "/messaggio-del-santo-padre-in-occasione-della-giornata-mondiale-delle-persone-con-disabilita/": "/blog/papa-francesco-disabilita-messaggio/",
      "/base-per-articolo-benedetta-19-dicembre-2019/": "/blog/non-mi-piace-cucinare/",
      "/unica-del-suo-genere/": "/blog/unica-nel-suo-genere/",
      "/i-ciechi-non-sognano-il-buio-vivere-con-successo-la-cecita/": "/blog/i-ciechi-non-sognano-il-buio-vivere-con-successo-la-cecita-recensione/",
      "/la-mia-disavventura-2/": "/blog/la-mia-vita-a-santa-palomba/",
      "/i-saggi-sulloperazione-t4/": "/blog/zavorre-prescelti/",
      "/dopo-di-me-il-diluvio/": "/blog/dopo-di-me-il-diluvio-commedia-musicale-gruppo-fede-luce-san-paolo/",
      "/un-libro-interessante-chi-sarei-se-potessi-essere/": "/blog/un-libro-interessante-adolescenza-ragazzi-disabili-chi-sarei-se-potessi-esserebozza-automatica/",
      "/un-libro-interessante-chi-sarei-se-potessi-esserebozza-automatica/": "/blog/un-libro-interessante-adolescenza-ragazzi-disabili-chi-sarei-se-potessi-esserebozza-automatica/",
      "/se-la-teologia-non-sa-parlare-di-dio-comprendendo-la-disabilita-e-la-teologia-a-essere-disabile/": "/blog/teologia-disabile/",
      "/newsletter-n-10/": "/blog/newsletter-n-10-sulla-regia-non-credente-di-lourdes/",
      "/papa-san-pietro/": "/blog/sulla-barca-in-piazza-san-pietro/",
      "/da-vicino-nessuno-e-disabile/": "/blog/festival-diritti-umani/",
      "/la-sfida-di-rileggere-le-scene-del-cinema/": "/blog/sensuability/",
      "/se-le-immagini-parlano-piu-delle-parole-newsletter-n-15/": "/blog/newsletter-15/",
      "/cervelli-ribelli-connettiamoci-alla-neurodiversita/": "/blog/dalle-province-n-141/",
      "/perche-tutti-comprendano-2/": "/blog/dalle-province-n-141/",
      "/tracciare-il-sentiero-in-albania-2/": "/blog/dalle-province-n-141/",
      "/spazio-aperto-una-coopera/": "/blog/spazio-aperto-una-cooperativa-di-servizi/",
      "/monaci-di-lanuvio/": "/blog/monaci-di-lanuvio-finanziamento-banca-etica/",
      "/parliamo-di-comunicazione-facilitata/": "/blog/parliamo-di-comunicazione-facilitata-intervista-francesca-benassi/",
      "/la-lezione-di-un-clown/": "/blog/la-lezione-di-un-clown-miloud-oukili/",
      "/tra-lame-che-affondano-e-ferite-medicate/": "/blog/eredita-dei-vivi-recensione/",
      "/insieme/": "/blog/insieme-primo-articolo/",
      "/lettera-di-daucourt-alle-comunita-dellarca/": "/blog/nonostante-jean-vanier-larca-rimane/",
      "/i-panzerotti-di-caterina/": "/blog/lo-scatto-della-pantera/",
      "/gli-amici-dei-bimbi/": "/blog/gli-amici-dei-bimbi-reparto-gesu-bambino-istituto-santeusebio-vercelli/",
      "/la-luce-simbolo-del-pellegrinaggio-di-roma-1975-2/": "/blog/per-te-ho-visitato-roma/",
      "/perche-proprio-a-roma-il-pellegrinaggio-del-1975-2/": "/blog/per-te-ho-visitato-roma/",
      "/la-bimba-delle-lumache/": "/blog/la-bimba-delle-lumache-recensione-libro/",
      "/nessuno-bambino-nasce-cattivo/": "/blog/nessuno-bambino-nasce-cattivo-recensione-libro/",
      "/noi-quattro/": "/blog/noi-quattro-la-comunita-il-roveto/",
      "/il-roveto/": "/blog/comunita-il-roveto/",
      "/dallassistenza-allesistenza-sei-workshop-dellassociazione-vedere-oltre-onlus-2/": "/blog/valgo-anchio/",
      "/fede-e-luce-una-scuola-di-altruismo-2/": "/blog/valgo-anchio/",
      "/a-43/": "/blog/a-4300-metri-di-altitudine-newsletter-n-31/",
      "/dove-crescono-i-cocomeri-di-cindy-baldwin-recensione/": "/blog/dove-crescono-i-cocomeri-recensione/",
      "/marie-la-strabica-di-georges-simenon-recensione/": "/blog/marie-la-strabica-recensione/",
      "/viaggio-italia-around-the-world/": "/blog/viaggio-italia-recensione/",
      "/grazi/": "/blog/grazie-papa-don-carlo-recensione/",
      "/dobbiamo-esser-prudenti-non-congelati/": "/blog/ol-incontra-luigi-derrico/",
      "/una-mattina-ti-ho-osservato-mentre-ti-svegliavi/": "/blog/ricordo-daniele-corrias/",
      "/la-piccola-artista-di-chartres/": "/blog/recensione-i-disegni-segreti/",
      "/dopo-di-noi-i-diritti-che-ci-sono-2/": "/blog/mamma-in-comunita/",
      "/lonore-di-un-lord-2/": "/blog/mamma-in-comunita/",
      "/la-nuova-legge-sul-dopo-di-noi-nodi-da-sciogliere-2/": "/blog/insolito-ragionamento-sul-migrante/",
      "/onora-il-padree-e-la-madre-pagine-di-tutti-i-tempi-per-capire-il-rapporto-tra-genitori-e-figli-recensione-libro/": "/blog/onora-il-padre-e-la-madre-pagine-di-tutti-i-tempi-per-capire-il-rapporto-tra-genitori-e-figli-recensione-libro/",
      "/la-necessita-di-un-contesto-per-capire/": "/blog/la-bellezza-nella-mente-recensione/",
      "/le-comunita-di-fede-e-luce-nellest-europeo/": "/blog/comunita-fede-e-luce-nel-mondo-tante-piccole-fiaccole-di-unita-e-di-amore/",
      "/lecumenismo-in-fede-e-luce/": "/blog/lecumenismo-in-fede-e-luce-un-dono/",
      "/perche-porto-i-miei-figli-a-fede-e-luce/": "/blog/quando-porto-i-miei-figli-a-fede-e-luce-resto-incantata/",
      "/mi-trovo-bene-con-tuttmi-trovo-bene-con-tuttii/": "/blog/mi-trovo-bene-con-tutti/",
      "/sessualita-e-disabilita-il-meglio-e-il-peggio-parlano-gli-educatori/": "/blog/sessualita-e-disabilita-il-meglio-e-il-peggio/",
      "/amore-e-disabilita-facile-preda-dei-genitori/": "/blog/amore-disabilita-facile-preda/",
      "/v-conferenza-internazionale-sullautismo-1983/": "/blog/5-conferenza-internazionale-sullautismo-1983/",
      "/marahba-kiffak-ciao-come-stai/": "/blog/marahba-kiffak-ciao-come-stai-fede-luce-beirut/",
      "/dallosservatorio-scolastico-deir-ai-as-di-milano/": "/blog/scuola-e-disabilita-dallosservatorio-scolastico-deir-ai-as-di-milano/",
      "/ieri-oggi-domani-2/": "/blog/dossier-scuola-e-disabilita/",
      "/dossier-scola-e-disabilita/": "/blog/dossier-scuola-e-disabilita/",
      "/fede-e-luce-tutti-a-leeds-2/": "/blog/dossier-scuola-e-disabilita/",
      "/che-fanfara-2/": "/blog/dossier-scuola-e-disabilita/",
      "/7-idee-sulla-sindrome-di-down-2/": "/blog/dossier-scuola-e-disabilita/",
      "/dalle-provice-n-141/": "/blog/dialogo-aperto-n-141/",
      "/migrati-diverse-fragilita-si-incontrano-2/": "/blog/i-figli-sono-tutti-speciali/",
      "/la-nuova-legge-sul-dopo-di-noi-che-cosa-dice-2/": "/blog/i-figli-sono-tutti-speciali/",
      "/insolito-ragionamento-sul-migrante-2/": "/blog/costruiamo-laccoglienza/",
      "/voglia-di-comunicare-2/": "/blog/dialogo-aperto-n-142/",
      "/la-mia-forza-nella-mia-differenza-2/": "/blog/percorsi-inclusivi-noi-ci-teniamo/",
      "/due-capitane-2/": "/blog/percorsi-inclusivi-noi-ci-teniamo/",
      "/dal-convegno-allimpegno-2/": "/blog/percorsi-inclusivi-noi-ci-teniamo/",
      "/dialogo-aperto-n-142-2/": "/blog/la-comunicazione-multimodale/",
      "/gioco-test/": "/blog/giochi-2022/",
      "/insieme-a-tutti-gli-altri-anche-mia-figlia-ha-ricevuto-la-cresima/": "/blog/mia-figlia-adea-cresima/",
      "/lotta-per-linclusione/": "/blog/lotta-per-linclusione-recensione/",
      "/la-nostra-scelta-di-cristina-2/": "/blog/mai-piu-soli/",
      "/superata-lultima-sala-daspetto-2/": "/blog/mai-piu-soli/",
      "/aggiungi-un-posto-a-casa-adozione-di-bambini-con-disabilita-2/": "/blog/mai-piu-soli/",
      "/un-vescovo-per-amico-2/": "/blog/mai-piu-soli/",
      "/dialogo-aperto-n-120-2/": "/blog/mai-piu-soli/",
      "/cinema-la-disabilita-al-torino-film-festival-e-al-babel-film-festival-di-cagliari/": "/blog/cinema-disabilita-torino-film-festival-babel-film-festival-di-cagliari/",
      "/sara-e-le-sbiruline-di-emily/": "/blog/sara-e-le-sbiruline-di-emily-recensione/",
      "/il-vecchio-re-nel-suo-esilio-recensione-2/": "/blog/franz-werfel-gallucci-editore-pp-722/",
      "/sara-e-le-sbiruline-di-emily-recensione-2/": "/blog/odoardo-focherini-un-giusto-fra-le-nazioni-recensione/",
      "/rico-oscar-e-il-ladro-ombra-recensione-2/": "/blog/la-caduta-i-ricordi-di-un-padre-in-424-passi-recensione/",
      "/io-mi-domando-2/": "/blog/gli-altri-vostri-figli-lhanno-accettato/",
      "/ci-hanno-scritto-insieme-n-23-2/": "/blog/gli-altri-vostri-figli-lhanno-accettato/",
      "/25-numero-6-anno-2/": "/blog/gli-altri-vostri-figli-lhanno-accettato/",
      "/mio-figlio-emanuele-la-straordinaria-esperienza-di-una-madre-recensione-2/": "/blog/un-figlio-handicappato/",
      "/notiziario-fede-e-luce-n-12-marzo-1977-2/": "/blog/un-figlio-handicappato/",
      "/come-nata-la-prima-casetta-fede-e-luce-storie-di-pennelli-e-appendiciti-2/": "/blog/un-figlio-handicappato/",
      "/visitiamo-con-maria-laura-il-centro-belga-per-infermi-motori-mentali-c-b-i-m-c/": "/blog/un-figlio-handicappato/",
      "/inlusione-solidarieta-ordinaria/": "/blog/inclusione-solidarieta-ordinaria/",
      "/abbiamo-un-cuore-inclusivo-2/": "/blog/inclusione-solidarieta-ordinaria/",
      "/i-geni-del-passato-handiche-2/": "/blog/inclusione-solidarieta-ordinaria/",
      "/per-il-rispetto-della-persona-sempre-2/": "/blog/tra-incontri-nel-riconoscimento-dellaltro-puoi-ritrovare-fiducia/",
      "/la-cura-dellamore/": "/blog/la-cura-dellamore-recensione/",
      "/legoismo-e-finito-recensione-2/": "/blog/chiudi-gli-occhi-e-guardami-vivere-la-disabilita-in-famiglia-recensione/",
      "/voci-di-campo-2/": "/blog/con-loro-ci-sto-bene/",
      "/bozza/": "/blog/cani-pony-leoni-marini/",
      "/giubileo-2016-per-cominciare-una-nuova-storia-di-amore-2/": "/blog/tutti-a-bordo/",
      "/il-vangelo-mimato-per-costruire-ponti-2/": "/blog/tutti-a-bordo/",
      "/invitati-alla-festa/": "/blog/associazione-invitati-alla-festa/",
      "/un-dado-vegetale-da-sogno-e-fatto-in-casa-2/": "/blog/essere-padre-di-un-figlio-disabile/",
      "/il-libro-di-julian-a-wonder-story-recensione-2/": "/blog/un-ponte-in-un-guscio-di-noce/",
      "/zia-lo-sai-che-sei-un-po-strana-recensione-2/": "/blog/un-ponte-in-un-guscio-di-noce/",
      "/il-bambino-che-parlava-con-la-luce-recensione-2/": "/blog/un-ponte-in-un-guscio-di-noce/",
      "/riuniti-in-preghiera-2/": "/blog/un-ponte-in-un-guscio-di-noce/",
      "/il-canto-di-bernadette-recensione/": "/blog/pensioni-rubate/",
      "/famiglie-in-esilio-ferite-ritrovate-riconciliate-recensione-2/": "/blog/pensioni-rubate/",
      "/due-grandi-occhi-neri-2/": "/blog/julia-jean-e-la-tirannia-della-normalita/",
      "/la-mia-vita-a-santa-palomba-2/": "/blog/si-ricomincia/",
      "/katimavik-una-parola-escquimese-che-vuol-dire-incontro/": "/blog/katimavik-una-parola-eschimese-che-vuol-dire-incontro/",
      "/ziguli/": "/blog/ziguli-recensione/",
      "/ci-hanno-scritto-insieme-n-27-2/": "/blog/marina-di-camerota-venti-giorni-di-prime-volte/",
      "/fratelli-e-sorelle-di-persone-con-disabilita-una-realta-da-riscoprire-2/": "/blog/marina-di-camerota-venti-giorni-di-prime-volte/",
      "/lavventura-di-oletta-quando-il-cavallo-diventa-terapia-2/": "/blog/marina-di-camerota-venti-giorni-di-prime-volte/",
      "/dossier-vite-da-ri-accogliere-adolescenti-allo-sbaraglio/": "/blog/adolescenti-allo-sbaraglio/",
      "/alto-come-un-vaso-di-gerani-recensione-2/": "/blog/respiro-dopo-respiro-lo-yoga-per-bambini-e-adolescenti-con-bisogni-speciali/",
      "/parole-in-liberta-diario-semiserio-della-madre-di-un-disabile-recensione-2/": "/blog/respiro-dopo-respiro-lo-yoga-per-bambini-e-adolescenti-con-bisogni-speciali/",
      "/un-castello-di-sabbia-storia-della-mia-vita-e-della-mia-schizofrenia-recensione-2/": "/blog/respiro-dopo-respiro-lo-yoga-per-bambini-e-adolescenti-con-bisogni-speciali/",
      "/dallo-stadio-al-palazzetto/": "/blog/anche-io-tiro-i-rigori/",
      "/dialogo-aperto-n-125-2/": "/blog/viola-e-valeria/",
      "/un-gioco-da-fare-quando-fuori-piove-2/": "/blog/viola-e-valeria/",
      "/hotel-6-stelle-2/": "/blog/viola-e-valeria/",
      "/germogli-diversi-arte-floreale-e-disabilita-la-bellezza-di-un-percorso-possibile-2/": "/blog/viola-e-valeria/",
      "/chopin-diversamente-impresa-2/": "/blog/viola-e-valeria/",
      "/artiste-nellorto-2/": "/blog/viola-e-valeria/",
      "/julia-jean-e-la-tirannia-della-normalita-2/": "/blog/lettere-a-jean-don-marco-bove-2/",
      "/auguri-scomodi-per-il-nuovo-anno-2/": "/blog/lettere-a-jean-don-marco-bove-2/",
      "/sotto-lo-stesso-tetto-casa-famiglia-il-tetto/": "/blog/casa-famiglia-il-tetto/",
      "/pulce-non-ce-recensione-2/": "/blog/quali-mani-asciugheranno-le-mie-lacrime-recensione/",
      "/elogio-della-fragilita/": "/blog/elogio-della-fragilita-recensione/",
      "/chiudi-gli-occhi-e-guardami-vivere-la-disabilita-in-famiglia-recensione-2/": "/blog/dalle-province-n-122/",
      "/casa-famiglia-iniziativa-amica-bambini-che-vanno-bambini-che-vengono/": "/blog/iniziativa-amica-una-casa-famiglia-dove-la-maternita-ritorna-gioia/",
      "/connessi-per-davvero-2/": "/blog/dialogo-aperto-n-139/",
      "/hello-harry-hi-benny-recensione-2/": "/blog/dialogo-aperto-n-139/",
      "/il-signor-parroco-ha-dato-di-matto-2/": "/blog/dialogo-aperto-n-139/",
      "/dopo-di-noi-atti-del-convegno-anffas-2/": "/blog/dialogo-aperto-n-139/",
      "/un-crocifisso-silenzioso-immagine-della-rivoluzione-cristiana/": "/blog/essere-mamma/",
      "/dialogo-aperto-n-84/": "/blog/dialogo-aperto-n-85/",
      "/oscura-luminosissima-notte/": "/blog/oscura-luminosissima-notte-recensione/",
      "/bisogna-accettare-che-un-bambino-abbia-delle-resistenze-2/": "/blog/io-e-simona/",
      "/quattro-giorni-mano-nella-mano-2/": "/blog/io-e-simona/",
      "/don-gnocchi-una-vita-spesa-per-gli-altri-recensione-2/": "/blog/dalle-province-n-138/",
      "/gli-scartagonisti-recensione-2/": "/blog/dalle-province-n-138/",
      "/lamniocentesi-di-stato-e-la-grande-colpa-di-madri-selvagge-recensione/": "/blog/lamniocentesi-di-stato-e-la-grande-colpa-di-noi-madri-selvagge-recensione/",
      "/ce-labbiamo-fatta-2/": "/blog/ciclisti-non-vedenti-vaticano/",
      "/da-bologna-a-roma-in-tandem-un-ciclo-viaggio-oltre-la-disabilita/": "/blog/da-bologna-a-roma-in-tandem/",
      "/da-bologna-a-roma-in-tandem-un-ciclo-viaggio/": "/blog/da-bologna-a-roma-in-tandem/",
      "/safesurfing-navigare-nella-rete-in-sicurezza-2/": "/blog/il-plusabile-due-sorelle-speciali/",
      "/dalle-province-n-139-2/": "/blog/il-plusabile-due-sorelle-speciali/",
      "/viola-e-mimosa-n-139-2/": "/blog/il-plusabile-due-sorelle-speciali/",
      "/segni-efficaci-2/": "/blog/il-plusabile-due-sorelle-speciali/",
      "/la-sua-prima-confessione-2/": "/blog/il-plusabile-due-sorelle-speciali/",
      "/benedetta-mi-convertito/": "/blog/benedetta-mi-ha-convertito/",
      "/noi-dei-piani-di-sopra/": "/blog/storia-redazione-via-bessarione-gammarelli/",
      "/coltivare-propri-pensieri/": "/blog/coltivare-propri-desideri/",
      "/per-una-vera-qualita-di-cura-delle-persone-anziane-2/": "/blog/coltivare-propri-desideri/",
      "/il-coraggio-della-piccola-vanessa-2/": "/blog/lui-la-guida-degli-uomini-e-rimasto-indietro-per-me/",
      "/perche-esista-e-dio-il-responsabile-del-mio-handicap/": "/blog/perche-esiste-la-disabilita-e-dio-il-responsabile-del-mio-handicap/",
      "/ci-hanno-scritto-n-15-2/": "/blog/come-bere-un-bicchier-dacqua/",
      "/pensioni-rubate-2/": "/blog/quasi-amici-recensione/",
      "/berlinale-74-leone-doro/": "/blog/berlinale-74-orso-doro/",
      "/lintimita-del-corpo-vita-tra-fratelli/": "/blog/vita-tra-fratelli/",
      "/riscoprire-la-grazia-della-confessione-2/": "/blog/dicono-di-loro/",
      "/lo-sapevate-che/": "/blog/lo-sapevate-che-2/",
      "/dossier-scola-e-disabilita-2/": "/blog/dialogo-aperto-n-123/",
      "/otto-giorni-per-ventanni/": "/blog/arche-bologna-tandem/",
      "/dossier-vite-da-ri-accogliere-la-citta-dei-ragazzi-cittadini-del-mondo/": "/blog/la-citta-dei-ragazzi/",
      "/dossier-vite-da-ri-accogliere-la-citta-dei-ragazzi/": "/blog/la-citta-dei-ragazzi/",
      "/vite-da-ri-accogliere-la-citta-dei-ragazzi/": "/blog/la-citta-dei-ragazzi/",
      "/essere-padre-di-un-figlio-disabile-2/": "/blog/custodi-della-speranza/",
      "/obiettivo-decrescita-recensione/": "/blog/ii-barattolo-di-maionese-e-caffe/",
      "/il-mo-cane-mi-ha-scelto/": "/blog/il-mio-cane-mi-ha-scelto/",
      "/caro-raffa-la-vita-e-adesso-2/": "/blog/fare-nuove-tutte-le-cose/",
      "/una-redazione-in-condominio/": "/blog/noi-dei-piani-di-sopra/",
      "/le-chiavi-di-casa-recensione/": "/blog/le-chiavi-di-casa-film/",
      "/dal-sostegno-alla-partecipazione-esperienze-di-educazione-inclusiva-per-bambini-con-difficolta-2/": "/blog/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
      "/la-dove-tu-ci-vuoi-ogni-giorno-2/": "/blog/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
      "/ci-hanno-scritto-insieme-n-28-2/": "/blog/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
      "/il-loro-credo-2/": "/blog/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
      "/i-nostri-figli-con-disabilita-a-scuola-2/": "/blog/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
      "/sotto-cieli-noncuranti-recensione-2/": "/blog/sembrava-impossibile-dove-osano-le-aquile-in-carrozzina-recensione/",
      "/la-scelta-di-ivana/": "/blog/la-scelta-di-ivana-la-mia-vita-al-carro/",
      "/ulamministratore-di-sostegno-per-le-persone-con-disabilita/": "/blog/una-nuova-legge-lamministratore-di-sostegno-per-le-persone-con-disabilita/",
      "/presentazione-festival/": "/blog/san-sebastian-il-piu-piccolo-dei-grandi-festival/",
      "/dialogo-aperto-n-138-2/": "/blog/sara-bello/",
      "/pretese-fuori-mercato-2/": "/blog/dialogo-aperto-n-161/",
      "/dalla-festa-del-cinema-di-roma/": "/blog/festa-del-cinema-roma-2023/",
      "/la-casa-di-dario/": "/blog/la-casa-di-dario-comunita-alloggio/",
      "/sara-bello-2/": "/blog/dossier-rifugiati/",
      "/il-mondo-come-lo-vediamo-noi/": "/blog/recensione-as-we-see-it/",
      "/fede-e-luce-larca-ombre-e-luci-tre-vocazioni-ununica-ispirazione/": "/blog/fede-e-luce-larca-ombre-e-luci/",
      "/a-a-a-una-mamma-chiede-una-mamma-risponde/": "/blog/sulleducazione-delle-giovani-generazioni-una-mamma-chiede-una-mamma-risponde/",
      "/fare-nuove-tutte-le-cose-2/": "/blog/le-amiche-di-francesco/",
      "/io-non-voglio-estranei-in-casa-2/": "/blog/per-rompere-la-solitudine-2/",
      "/presena-reale/": "/blog/presenza-reale/",
      "/storia-di-un-segreto-dio-mi-ha-parlato-tramite-i-miei-amici-speciali-2/": "/blog/1971-2011-fede-e-luce-festeggia-40-anni/",
      "/special-olimpics/": "/blog/special-olympics-nessuno-si-deve-sentire-escluso/",
      "/special-olimpics-nessuno-si-deve-sentire-escluso/": "/blog/special-olympics-nessuno-si-deve-sentire-escluso/",
      "/un-incontro-tra-capi/": "/blog/un-incontro-tra-capi-scout/",
      "/portatrice-di-un-messaggio-2/": "/blog/grazie-mariangela/",
      "/borderline-recensione-2/": "/blog/grazie-mariangela/",
      "/viola-e-il-messico-2/": "/blog/grazie-mariangela/",
      "/lettera-di-jean-n-126-2/": "/blog/grazie-mariangela/",
      "/attivita-riabilitative-fiori-colori-e-profumi-2/": "/blog/grazie-mariangela/",
      "/volevo-che-qualcuno-rispondesse-alle-mie-domande-2/": "/blog/grazie-mariangela/",
      "/smack-come-bacio-il-mio-tempo-con-mio-figlio-disabile/": "/blog/smack-come-bacio-il-tempo-con-mio-figlio-disabile/",
      "/noi-papa-di-fiun-modo-diverso-di-amare/": "/blog/noi-papa-di-figli-disabili-un-modo-diverso-di-amare/",
      "/gli-oggetti-raccontano-storie-straordinarie-di-oggetti-comuni/": "/blog/gli-oggetti-raccontano-storie-straordinarie-di-oggetti-comuni-recensione/",
      "/un-affidamento-speciale-2__trashed/": "/blog/un-affidamento-speciale-2/",
      "/insegnante-di-lettere-canale-della-vita-2/": "/blog/il-sorriso-dei-tuoi-occhi/",
      "/il-sorriso-dei-tuoi-occhi-2/": "/blog/da-un-altro-punto-di-vista/",
      "/tra-incontri-nel-riconoscimento-dellaltro-puoi-ritrovare-fiducia-2/": "/blog/la-nostra-presenza-accanto-a-lei/",
      "/con-la-forza-di-una-quercia/": "/blog/agli-amici-vici-siate-disponibili/",
      "/fratelli-e-sorelle-di-persone-con-disabilita-2/": "/blog/nella-diagnosi-siamo-prudenti/",
      "/la-cura-invisibile-per-il-riconoscimento-dei-caregiver-2/": "/blog/nella-diagnosi-siamo-prudenti/",
      "/alla-ricerca-dellaltro-da-me/": "/blog/testimonianza-giulia-cirillo/",
      "/se-avessi-ascoltato-la-mia-disperazione/": "/blog/dialogo-aperto-n-95/",
      "/dalle-province-n-138-2/": "/blog/trasformare-i-nostri-cuori/",
      "/ricordi-di-mia-madre-recensione-2/": "/blog/perdersi-recensione/",
      "/dialogo-aperto-n-143-2/": "/blog/dalle-province-n-143/",
      "/obiettivo-decrescita-ecensione/": "/blog/obiettivo-decrescita-recensione/",
      "/mamma-in-comunita-2/": "/blog/la-strada-percorsa-finora/",
      "/la-speranza-non-fa-rumore-recensione-3/": "/blog/bioetica-come-storia-recensione/",
      "/un-figlio-handicappato-2/": "/blog/editoriale-lettera-aperta-agli-amici-di-fede-e-luce/",
      "/cose-un-sacramento-cose-leucaristia-cose-la-confessione-2/": "/blog/editoriale-lettera-aperta-agli-amici-di-fede-e-luce/",
      "/ci-hanno-scritto-n-12-2/": "/blog/editoriale-lettera-aperta-agli-amici-di-fede-e-luce/",
      "/venerdi-poverta-assisi-1978/": "/blog/quel-giorno-pioveva/",
      "/se-assisi-1978-2/": "/blog/quel-giorno-pioveva/",
      "/corsa-in-taxi-2/": "/blog/un-augurio-speciale/",
      "/gli-altri-vostri-figli-lhanno-accettato-2/": "/blog/vita-fede-e-luce/",
      "/una-realta-esigente-2/": "/blog/vita-fede-e-luce/",
      "/perche-non-mi-capisci-3/": "/blog/vita-fede-e-luce/",
      "/mia-sorella-2/": "/blog/vita-fede-e-luce/",
      "/non-e-facile-esprimere-2/": "/blog/vita-fede-e-luce/",
      "/una-lettera-2/": "/blog/vita-fede-e-luce/",
      "/la-mia-vita-2/": "/blog/vita-fede-e-luce/",
      "/ciao-alessandro/": "/blog/vita-fede-e-luce/",
      "/dialogo-aperto-n-135-2/": "/blog/dalle-province-n-135/",
      "/mi-hanno-regalato-un-sogno-2/": "/blog/dalle-province-n-135/",
      "/mio-figlio-un-angelo-che-ha-scelto-di-vivere/": "/blog/mio-figlio-un-angelo-che-ha-scelto-di-vivere-recensione/",
      "/efrem-1/": "/blog/impegnarsi-e-impegnarmi/",
      "/disabilmentemamma/": "/blog/disabilmentemamme/",
      "/amore-caro-a-filo-doppio-con-persone-fragili/": "/blog/amore-caro-a-filo-doppio-con-persone-fragili-recensione/",
      "/gli-esordi-insieme-1974-1981-2/": "/blog/quattro-punti-cardinali-i-luoghi-di-ombre-e-luci-tra-i-quartieri-di-roma/",
      "/giubileo-2016-la-vera-gioia-2/": "/blog/la-sfida-di-chi-ama-di-piu/",
      "/dialogo-aperto-n-139-2/": "/blog/scoprirsi-unici-e-crescere-insieme/",
      "/come-and-see-meeting-dei-giovani-ad-alicante-2/": "/blog/scoprirsi-unici-e-crescere-insieme/",
      "/la-chiesa-accanto-a-mio-figlio-2/": "/blog/scoprirsi-unici-e-crescere-insieme/",
      "/ci-ha-lasciato-marie-odile-rhethore/": "/blog/ci-ha-lasciato-la-professoressa-marie-odile-rhethore/",
      "/il-respiro-leggero-dellalba-recensione-2/": "/blog/il-motivo-per-cui-salto-recensione/",
      "/tema-dellanno-1980-lincontro-2/": "/blog/letture-consigliate-n-23/",
      "/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi-2/": "/blog/letture-consigliate-n-23/",
      "/marymount-unestate-di-musica-e-sorrisi-2/": "/blog/letture-consigliate-n-23/",
      "/lordinazione-di-robert-michit-2/": "/blog/letture-consigliate-n-23/",
      "/insieme-verso-la-pasqua-1981-2/": "/blog/letture-consigliate-n-23/",
      "/qualche-raggio-di-sole-in-siria-2/": "/blog/cercare-la-bellezza-la-dove-e-nascosta/",
      "/un-ponte-in-un-guscio-di-noce-2/": "/blog/il-roveto-di-santilario/",
      "/spiritualmente-le-piccole-suore-non-sono-handicappate-2/": "/blog/il-roveto-di-santilario/",
      "/antonietta-campo-estivo/": "/blog/vivere-a-colori/",
      "/anffas-ogni-persona-con-disabilita-e-nostro-figlio/": "/blog/istituto-mio-dio/",
      "/istituto-mio-dio-2/": "/blog/il-tuo-bambino-ha-qualcosa-che-non-va/",
      "/nella-diagnosi-siamo-prudenti-2/": "/blog/tra-paura-e-desiderio-di-sapere/",
      "/il-tuo-bambino-ha-qualcosa-che-non-va-2/": "/blog/che-grinta/",
      "/tra-paura-e-desiderio-di-sapere-2/": "/blog/dialogo-aperto-n-122/",
      "/non-possiamo-restare-dei-peter-pan-a-vita-2/": "/blog/il-senso-di-una-vita-e-di-una-scelta/",
      "/cercare-la-bellezza-la-dove-e-nascosta-2/": "/blog/il-senso-di-una-vita-e-di-una-scelta/",
      "/che-grinta-2/": "/blog/ora-basta/",
      "/notiziario-fede-e-luce-dicembre-1976-2/": "/blog/testimonianze-dai-campi-di-alfedena-1976/",
      "/la-comunicazione-multimodale-2/": "/blog/segni-dellamore-di-dio/",
      "/segni-dellamore-di-dio-2/": "/blog/ascoltare-i-segni-perche-in-lis/",
      "/fede-e-luce-anatomia-di-una-comunita-di-incontro/": "/blog/1-introduzione-fede-e-luce-anatomia-di-una-comunita-di-incontro/",
      "/ci-hanno-scritto-insieme-n-24-2/": "/blog/1-introduzione-fede-e-luce-anatomia-di-una-comunita-di-incontro/",
      "/ascoltare-i-segni-perche-in-lis-2/": "/blog/fede-e-luce-una-grande-famiglia/",
      "/porta-sfortuna-2/": "/blog/dialogo-aperto-n-133/",
      "/il-roveto-di-santilario-2/": "/blog/dialogo-aperto-n-133/",
      "/la-disabilita-un-confine-da-superare-2/": "/blog/chiamati-tutti-al-traguardo/",
      "/il-senso-di-una-vita-e-di-una-scelta-2/": "/blog/chiamati-tutti-al-traguardo/",
      "/dalle-provincia-n-130-2/": "/blog/il-senso-della-festa/",
      "/la-paura-di-amare-recensione-2/": "/blog/il-senso-della-festa/",
      "/dialogo-aperto-n-130-2/": "/blog/il-senso-della-festa/",
      "/il-senso-della-festa-2/": "/blog/scintille-di-amicizia/",
      "/scintille-di-amicizia-2/": "/blog/i-mille-volti/",
      "/i-mille-volti-2/": "/blog/piu-scavo-piu-trovo/",
      "/il-motivo-per-cui-salto-recensione-2/": "/blog/dialogo-aperto-n-126/",
      "/dialogo-aperto-n-126-2/": "/blog/fede-e-luce-si-ci-siamo-anche-noi/",
      "/fede-e-luce-si-ci-siamo-anche-noi-2/": "/blog/un-capo-atipico-per-larca/",
      "/un-capo-atipico-per-larca-2/": "/blog/cristiani-del-sagrato/",
      "/cristiani-del-sagrato-2/": "/blog/la-mia-lampada-frontale/",
      "/la-mia-lampada-frontale-2/": "/blog/argento-vivo/",
      "/argento-vivo-2/": "/blog/sulla-sua-strada/",
      "/da-un-altro-punto-di-vista-2/": "/blog/con-orgoglio-e-tenerezza/",
      "/lamicizia-un-dono-unico-ed-eterno-2/": "/blog/con-orgoglio-e-tenerezza/",
      "/labilita-onlus-aprire-gli-occhi-2/": "/blog/avere-un-posto-nella-societa/",
      "/il-calore-dellamicizia-2/": "/blog/una-ragazza-speciale/",
      "/vuoi-bene-a-gesu-2/": "/blog/una-ragazza-speciale/",
      "/una-ragazza-speciale-2/": "/blog/perche-ho-avuto-fiducia/",
      "/puo-un-gesto-essere-cosi-significativo-2/": "/blog/un-oro-al-giorno/",
      "/chi-scalda-il-cuore-2/": "/blog/un-oro-al-giorno/",
      "/cosa-ti-aspetti-2/": "/blog/un-oro-al-giorno/",
      "/monsignor-von-galen-leroismo-di-una-coscienza-2/": "/blog/un-oro-al-giorno/",
      "/il-giubileo-di-fede-e-luce-2/": "/blog/un-oro-al-giorno/",
      "/dalle-province-n-135-2/": "/blog/un-oro-al-giorno/",
      "/chiamati-a-portare-frutto-2/": "/blog/un-oro-al-giorno/",
      "/la-lingua-dei-segni-nelle-disabilita-comunicative/": "/blog/la-lingua-dei-segni-nelle-disabilita-comunicative-recensione/",
      "/marina-di-camerota-venti-giorni-di-prime-volte-2/": "/blog/quante-domande-davanti-a-loro/",
      "/estate-fede-e-luce-1980-la-gioia-di-fare-vacanza-insieme-2/": "/blog/quante-domande-davanti-a-loro/",
      "/campeggio-fede-e-luce-unavventura-di-vita-e-comunita-2/": "/blog/quante-domande-davanti-a-loro/",
      "/un-aiuto-per-il-pellegrinaggio-di-lourdes-1981-chi-puo-darci-una-mano-2/": "/blog/quante-domande-davanti-a-loro/",
      "/incontro-internazionale-e-nazionale-un-ponte-di-solidarieta-tra-paesi-e-comunita-2/": "/blog/quante-domande-davanti-a-loro/",
      "/ogni-volta-che-lascio-alfedena-2/": "/blog/quante-domande-davanti-a-loro/",
      "/darti-la-vita-2/": "/blog/adulti-lievemente-handicappati/",
      "/vita-fede-e-luce-natale-1977-a-2/": "/blog/assemblea-internazionale-di-fede-e-luce-a-bruxelles-gennaio-1978/",
      "/notiziario-fede-e-luce-n-16-2/": "/blog/assemblea-internazionale-di-fede-e-luce-a-bruxelles-gennaio-1978/",
      "/esperienze-i-campi-dellestete-1977/": "/blog/esperienze-i-campi-dellestate-1977/",
      "/scuola-e-disabilita-integrazione-ascoltiamo-le-testimonianze-di-due-mamme-2/": "/blog/esperienze-i-campi-dellestate-1977/",
      "/come-bere-un-bicchier-dacqua-2/": "/blog/esperienze-i-campi-dellestate-1977/",
      "/giovanissimi-2/": "/blog/buon-natale-antico-corale-trascritto-da-un-bambino/",
      "/sono-tornato-stasera-2/": "/blog/buon-natale-antico-corale-trascritto-da-un-bambino/",
      "/noris-2/": "/blog/buon-natale-antico-corale-trascritto-da-un-bambino/",
      "/giovanissimi-n-3-2/": "/blog/buon-natale-antico-corale-trascritto-da-un-bambino/",
      "/buon-natale-antico-corale-trascritto-da-un-bambino-2/": "/blog/ci-ha-scritto-la-mamma-di-roberto/",
      "/per-la-nostra-riflessione-2/": "/blog/letture-consigliate-n-18/",
      "/per-la-loro-educazione-visita-allistituto-statale-romagnolo-per-non-vedenti-2/": "/blog/letture-consigliate-n-18/",
      "/esperienze-al-gruppo-fede-e-luce-la-mamma-di-massimo-2/": "/blog/letture-consigliate-n-18/",
      "/come-un-raggio-di-sole-2/": "/blog/letture-consigliate-n-18/",
      "/notiziario-fede-e-luce-n-18-2/": "/blog/letture-consigliate-n-18/",
      "/vita-dei-gruppi-fede-e-luce-1978-2/": "/blog/letture-consigliate-n-18/",
      "/festa-della-primavera-a-villa-pacis-1978-2/": "/blog/letture-consigliate-n-18/",
      "/la-casetta-di-fede-e-luce-cose-che-fini-ha-chi-la-frequenta/": "/blog/letture-consigliate-n-18/",
      "/fede-e-luce-anatomia-di-una-comunita-di-incontro-2/": "/blog/5-creascere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/",
      "/fede-e-luce-larte-dellincontro-per-superare-la-paura-della-diversita-2/": "/blog/5-creascere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/",
      "/costruire-comunita-i-tre-pilastri-di-fede-e-luce/": "/blog/5-creascere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/",
      "/guidare-una-comunita-fede-e-luce-principi-e-pratica/": "/blog/5-creascere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/",
      "/esperienze-i-campi-dellestate-1977-2/": "/blog/notiziario-fede-e-luce-calendario-1978/",
      "/notiziario-fede-e-luce-1978/": "/blog/notiziario-fede-e-luce-calendario-1978/",
      "/costruire-comunita-tre-pilastri-fede-luce/": "/blog/4-vita-comunitaria-costruire-comunita-tre-pilastri-fede-luce/",
      "/i-volti-di-fede-e-luce-persona-con-disabilita-genitori-amici-e-sacerdoti-2/": "/blog/4-vita-comunitaria-costruire-comunita-tre-pilastri-fede-luce/",
      "/ci-hanno-scritto-n-20-2/": "/blog/notiziario-fede-e-luce-n-20/",
      "/7-testimonianze-di-genitori-e-amici-di-bambini-profondamente-handicappati-2/": "/blog/notiziario-fede-e-luce-n-20/",
      "/la-forestiere-vita-comunitaria-con-i-piu-gravi-allarche-2/": "/blog/notiziario-fede-e-luce-n-20/",
      "/ci-ha-scritto-la-mamma-di-roberto-2/": "/blog/avevano-bisogno-di-noi/",
      "/di-serie-promettenti-e-film-non-riusciti-alla-festa-del-cinema-di-roma/": "/blog/recensione-te-lavevo-detto-la-storia/",
      "/notiziario-fede-e-luce-calendario-del-prossimo-anno/": "/blog/bando-di-concorso-per-auto-adesivo-del-pellegrinaggio/",
      "/un-giro-in-tandem/": "/blog/il-mio-primo-giro-in-bici/",
      "/meditazione-a-modo-mio-2/": "/blog/jean-vanier-a-parma-1978/",
      "/quel-giorno-pioveva-2/": "/blog/jean-vanier-a-parma-1978/",
      "/5-crescere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/": "/blog/andiamo-tutti-in-pizzeria/",
      "/lourdes-qui-e-oggi/": "/blog/andiamo-tutti-in-pizzeria/",
      "/vita-fede-e-luce-n-24-2/": "/blog/andiamo-tutti-in-pizzeria/",
      "/pellegrinaggio-a-loreto-18-20-maggio-1979-2/": "/blog/gita-ad-argegno-3-giugno-1979/",
      "/pellegrinaggio-a-loreto-1979-le-testimonianze-dei-partecipanti/": "/blog/gita-ad-argegno-3-giugno-1979/",
      "/23-maggio-1979-festa-della-primavera-2/": "/blog/gita-ad-argegno-3-giugno-1979/",
      "/gita-ad-argegno-3-giugno-1979-2/": "/blog/vita-fede-e-luce-n-22-1979/",
      "/vita-fede-e-luce-n-22-1979-2/": "/blog/letture-consigliate-n-22/",
      "/cosa-vedremo-a-roma-durante-il-pellegrinaggio-1975-2/": "/blog/i-canti-del-pellegrinaggio-di-roma-1975/",
      "/per-te-ho-visitato-roma-2/": "/blog/i-canti-del-pellegrinaggio-di-roma-1975/",
      "/testimonianze-dal-pellegrinaggio-di-lourdes-1971-2/": "/blog/i-canti-del-pellegrinaggio-di-roma-1975/",
      "/i-volti-di-fede-e-luce-persona-con-disabilita-genitori-amici-e-sacerdoti/": "/blog/3-i-protagonisti-i-volti-di-fede-e-luce-persona-con-disabilita-genitori-amici-e-sacerdoti/",
      "/il-mio-quinto-concerto-di-baglioni/": "/blog/benedetta-baglioni/",
      "/leco-della-stampa-2/": "/blog/ricordi-e-speranze-dai-questionari-sul-pellegrinaggio-a-roma-del-1975/",
      "/ricordi-e-speranze-dai-questionari-sul-pellegrinaggio-a-roma-del-1975-2/": "/blog/giovanissimi-n-7/",
      "/giovanissimi-n-7-2/": "/blog/tavola-rotonda/",
      "/tavola-rotonda-2/": "/blog/dietro-le-quinte/",
      "/dietro-le-quinte-2/": "/blog/il-problema-dellacqua/",
      "/il-problema-dellacqua-2/": "/blog/la-nostra-buona-novella/",
      "/avevano-bisogno-di-noi-2/": "/blog/resoconti-degli-incontri-fede-e-luce/",
      "/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita-2/": "/blog/vita-fede-e-luce-insieme-n-28/",
      "/techniche-di-recupero-per-i-disabili-gravi-la-socializzazione/": "/blog/tecniche-di-recupero-per-i-disabili-gravi-la-socializzazione/",
      "/fede-e-luce-larte-dellincontro-per-superare-la-paura-della-diversita/": "/blog/2-fede-e-luce-larte-dellincontro-per-superare-la-paura-della-diversita/",
      "/3-vincitori-e-non/": "/blog/san-sebastian-festival-tardes-de-soledad/",
      "/letture-consigliate-n-13/": "/blog/letture-consigliate-n-14/",
      "/vita-fede-e-luce-insieme-n-28-2/": "/blog/la-vendita-di-novembre-impegno-e-solidarieta/",
      "/together-a-san-pietro-2/": "/blog/mimo-a-san-pietro/",
      "/quando-arrivia-il-natale/": "/blog/quando-arriva-il-natale/",
      "/vita-fede-e-luce-insieme-n-25/": "/blog/e-uscita-una-nuova-legge-sullassegno-di-accompagnamento-per-le-persone-totalmente-inabili/",
      "/e-uscita-una-nuova-legge-sullassegno-di-accompagnamento-per-le-persone-totalmente-inabili-2/": "/blog/letture-consigliate-la-vita-puo-ricominciare-recensione/",
      "/partiamo-per-il-congo/": "/blog/partiamo-per-il-congo-caa/",
      "/letture-consigliate-la-vita-puo-ricominciare-recensione-2/": "/blog/questionario-per-i-fratelli-e-sorrelle-di-persone-con-disabilita/",
      "/notiziario-fede-e-luce-n-20-2/": "/blog/che-cose-un-katimavic/",
      "/che-cose-un-katimavic-2/": "/blog/letture-consigliate-lo-svantaggiato-quale-educazione/",
      "/la-vendita-di-novembre-impegno-e-solidarieta-2/": "/blog/incontro-internazionale-preparativi-e-spiritualita/",
      "/via-plinio-30-2/": "/blog/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
      "/ci-hanno-scritto-insieme-n-26-2/": "/blog/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
      "/dalla-parte-di-lazzaro-2/": "/blog/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
      "/5-anni-di-casetta-2/": "/blog/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
      "/andiamo-alla-casetta-2/": "/blog/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
      "/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti-2/": "/blog/un-problema-che-non-so-risolvere/",
      "/un-problema-che-non-so-risolvere-2/": "/blog/vita-fede-e-luce-insieme-n-26/",
      "/vita-fede-e-luce-insieme-n-26-2/": "/blog/letture-consigliate-n-26/",
      "/fede-e-luce-un-po-di-storia/": "/blog/la-festa-continua/",
      "/amici-delicati-e-fedeli-2/": "/blog/la-festa-continua/",
      "/gioia-di-essere-sacerdote-2/": "/blog/la-festa-continua/",
      "/la-lettera-del-papa-wojtyla-2/": "/blog/la-festa-continua/",
      "/avevo-paura-2/": "/blog/la-festa-continua/",
      "/come-avviare-una-comunita-2/": "/blog/la-festa-continua/",
      "/perche-un-numero-dedicato-allanimazione-2/": "/blog/la-festa-continua/",
      "/jean-vanier-ai-giovani-2/": "/blog/la-festa-continua/",
      "/perche-a-lourdes-2/": "/blog/la-festa-continua/",
      "/lettera-di-presentazione-del-cardinale-hume-2/": "/blog/la-festa-continua/",
      "/celebriamo-la-pasqua-1981-nella-comunita-fede-e-luce-2/": "/blog/la-festa-continua/",
      "/perche-questo-insieme-speciale-2/": "/blog/la-festa-continua/",
      "/1-insieme-in-cammino-siamo-tutti-pellegrini/": "/blog/la-festa-continua/",
      "/2-pellegrini-in-comunita-2/": "/blog/la-festa-continua/",
      "/3-in-comunita-accoglienti-2/": "/blog/la-festa-continua/",
      "/4-ognuno-ha-il-suo-posto-nella-comunita-2/": "/blog/la-festa-continua/",
      "/5-sono-loro-che-ci-uniscono-e-ci-guidano-2/": "/blog/la-festa-continua/",
      "/6-cristo-risorto-fa-di-noi-un-solo-popolo-2/": "/blog/la-festa-continua/",
      "/7-lo-spirito-santo-dono-di-gesu-risorto-2/": "/blog/la-festa-continua/",
      "/8-nutrirsi-di-gesu-attraverso-la-parola-2/": "/blog/la-festa-continua/",
      "/9-nella-preghiera-personale-2/": "/blog/la-festa-continua/",
      "/11-compiendo-la-volonta-del-padre-2/": "/blog/la-festa-continua/",
      "/10-nella-preghiera-comunitaria-2/": "/blog/la-festa-continua/",
      "/12-con-i-santi-2/": "/blog/la-festa-continua/",
      "/13-con-maria-2/": "/blog/la-festa-continua/",
      "/14-nelleucarestia-venite-a-me-2/": "/blog/la-festa-continua/",
      "/15-nelleucarestia-restate-in-me-2/": "/blog/la-festa-continua/",
      "/16-il-perdono-2/": "/blog/la-festa-continua/",
      "/fede-e-luce-domande-e-risposte-2/": "/blog/la-festa-continua/",
      "/ma-di-sicuro-torna-il-sereno-2/": "/blog/la-festa-continua/",
      "/fede-e-luce-pasquale-2/": "/blog/la-festa-continua/",
      "/cosa-e-fede-e-luce-tre-risposte-2/": "/blog/la-festa-continua/",
      "/ognuno-ha-il-suo-posto-nella-comunita-2/": "/blog/la-festa-continua/",
      "/scegliere-di-lasciarsi-scegliere-2/": "/blog/la-festa-continua/",
      "/il-posto-della-persona-handicappata-nelle-nostre-comunita-2/": "/blog/la-festa-continua/",
      "/genitori-di-persone-con-disabilita-nessuno-disturba-nessuno-2/": "/blog/la-festa-continua/",
      "/tre-tappe-nella-mia-vita-2/": "/blog/la-festa-continua/",
      "/incontro-fra-genitori-2/": "/blog/la-festa-continua/",
      "/lorganizazione-a-fede-e-luce/": "/blog/lorganizzazione-a-fede-e-luce/",
      "/la-festa-continua-2/": "/blog/lorganizzazione-a-fede-e-luce/",
      "/tu-sostieni-2/": "/blog/18-domande-su-fede-e-luce/",
      "/i-fratelli-e-le-sorelle-di-persone-con-disabilita-2/": "/blog/18-domande-su-fede-e-luce/",
      "/cosa-e-e-come-funziona-una-comunita-fede-e-luce-2/": "/blog/18-domande-su-fede-e-luce/",
      "/prendete-e-mangiatene-tutti-2/": "/blog/18-domande-su-fede-e-luce/",
      "/la-festa-a-fede-e-luce-2/": "/blog/18-domande-su-fede-e-luce/",
      "/il-pellegrinaggio-a-fede-e-luce-2/": "/blog/18-domande-su-fede-e-luce/",
      "/18-domande-su-fede-e-luce-2/": "/blog/primo-campeggio-fede-e-luce/",
      "/animare-una-messa-e-renderla-viva-facendo-lunita-2/": "/blog/principi-di-azione-per-una-equipe-di-animazione/",
      "/principi-di-azione-per-una-equipe-di-animazione-2/": "/blog/dare-vita-movimento-calore-limportanza-dellanimazione-nelle-comunita-fede-e-luce/",
      "/dare-vita-movimento-calore-limportanza-dellanimazione-nelle-comunita-fede-e-luce-2/": "/blog/dopo-di-me-il-diluvio-commedia-musicale-del-gruppo-fede-e-luce-di-san-paolo/",
      "/dopo-di-me-il-diluvio-commedia-musicale-del-gruppo-fede-e-luce-di-san-paolo-2/": "/blog/la-festa-uno-dei-momenti-essenziale-della-comunita-fede-e-luce/",
      "/la-festa-uno-dei-momenti-essenziali-della-comunita-fede-e-luce/": "/blog/unora-di-musica-con-suor-maria/",
      "/unora-di-musica-con-suor-maria-2/": "/blog/comunita-di-fede-e-luce/",
      "/comunita-di-fede-e-luce-2/": "/blog/consigli-di-lettura-insieme-n-29/",
      "/in-viaggio-verso-lourdes-2/": "/blog/lourdes-1981-giovedi-santo/",
      "/lourdes-1981-giovedi-santo-2/": "/blog/lourdes-1981-venerdi-santo/",
      "/lourdes-1981-venerdi-santo-2/": "/blog/lourdes-1981-sabato-santo/",
      "/lourdes-1981-domenica-di-pasqua-2/": "/blog/va-verso-i-tuoi-fratelli-e-di-loro/",
      "/va-verso-i-tuoi-fratelli-e-di-loro-2/": "/blog/voci-dal-pellegrinaggio-lourdes-1981-frammenti-di-vita-e-di-fede/",
      "/voci-dal-pellegrinaggio-lourdes-1981-frammenti-di-vita-e-di-fede-2/": "/blog/una-nuova-speranza/",
      "/una-nuova-speranza-2/": "/blog/buon-natale-1981-e-un-numero-speciale/",
      "/buon-natale-1981-e-un-numero-speciale-2/": "/blog/storia-di-natale/",
      "/storia-di-natale-2/": "/blog/il-futuro-di-insieme-una-catena-che-diventa-sempre-piu-grande/",
      "/risorse-per-una-catechesi-sensoriale-e-inclusiva/": "/blog/catechesi-inclusiva-materiali-tattili/",
      "/la-piccola-marcia/": "/blog/alla-piccola-marcia-di-assisi/",
      "/il-ruolo-di-cura-tre-film-alla-berlinale-che-ispirano-una-riflessione/": "/blog/il-ruolo-di-cura-quattro-film-berlinale/",
      "/il-cugino-che-sapeva-di-lavanda/": "/blog/claudio-lavanda/",
      "/il-coraggio-di-cambiare-2/": "/blog/suor-veronica-pompei/",
      "/se-sei-sola-invece-no/": "/blog/se-sei-sola-invece-non-e-bello/",
      "/lourdes-a-miracle-of-encounter/": "/blog/mother-teresa-of-calcutta-dedicated-to-children-and-to-all-of-us/",
      "/interactive-games-for-unforgettable-group-funmatica/": "/blog/interactive-games-unforgettable-group-fun/",
      "/la-festa-di-compleanno-di-veronica-felice/": "/blog/la-festa-di-compleanno-di-veronica/"
    };
    REDIRECTS = redirectsLegacy;
    DATE_PATH_RE = /^\/\d{4}\/\d{2}\/\d{2}\/(.+)$/;
    onRequest$2 = defineMiddleware(({ url, redirect }, next) => {
      const path = url.pathname;
      const target = REDIRECTS[path];
      if (target) {
        return redirect("https://ombreeluci.it" + target, 301);
      }
      const dateMatch = path.match(DATE_PATH_RE);
      if (dateMatch) {
        return redirect("https://ombreeluci.it/blog/" + dateMatch[1], 301);
      }
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

// _worker.js/index.js
import { renderers as renderers15 } from "./renderers.mjs";

// _worker.js/_@astrojs-ssr-adapter.mjs
init_index_B_gW6nkE();
init_server_CgTYz_Tl();

// _worker.js/chunks/noop-middleware_Chs5f3j2.mjs
init_server_CgTYz_Tl();
globalThis.process ??= {};
globalThis.process.env ??= {};
var NOOP_MIDDLEWARE_FN = /* @__PURE__ */ __name(async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
}, "NOOP_MIDDLEWARE_FN");

// _worker.js/_@astrojs-ssr-adapter.mjs
init_astro_designed_error_pages_DfD573yd();
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
  const page15 = /* @__PURE__ */ __name(async (result) => {
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
  page15.isAstroComponentFactory = true;
  const instance = {
    default: page15,
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
  constructor(logger, manifest2, mode, renderers16, resolve, serverLike, streaming, adapterName = manifest2.adapterName, clientDirectives = manifest2.clientDirectives, inlinedScripts = manifest2.inlinedScripts, compressHTML = manifest2.compressHTML, i18n = manifest2.i18n, middleware = manifest2.middleware, routeCache = new RouteCache(logger, mode), site = manifest2.site ? new URL(manifest2.site) : void 0, defaultRoutes = createDefaultRoutes(manifest2)) {
    this.logger = logger;
    this.manifest = manifest2;
    this.mode = mode;
    this.renderers = renderers16;
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
    renderers: renderers16,
    resolve,
    serverLike,
    streaming,
    defaultRoutes
  }) {
    const pipeline = new AppPipeline(
      logger,
      manifest2,
      mode,
      renderers16,
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

// _worker.js/manifest_BXd5hZ_V.mjs
init_server_CgTYz_Tl();
init_astro_designed_error_pages_DfD573yd();
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
      return { onRequest: NOOP_MIDDLEWARE_FN };
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
var _page1 = /* @__PURE__ */ __name(() => Promise.resolve().then(() => (init_astro(), astro_exports)), "_page1");
var _page22 = /* @__PURE__ */ __name(() => Promise.resolve().then(() => (init_debug_blog_astro(), debug_blog_astro_exports)), "_page2");
var _page32 = /* @__PURE__ */ __name(() => import("./pages/api/debug-ssr-minimal.astro.mjs"), "_page3");
var _page42 = /* @__PURE__ */ __name(() => Promise.resolve().then(() => (init_revalidate_astro(), revalidate_astro_exports)), "_page4");
var _page52 = /* @__PURE__ */ __name(() => import("./pages/archivio/web-only.astro.mjs"), "_page5");
var _page62 = /* @__PURE__ */ __name(() => import("./pages/archivio/_issue_.astro.mjs"), "_page6");
var _page72 = /* @__PURE__ */ __name(() => Promise.resolve().then(() => (init_archivio_astro(), archivio_astro_exports)), "_page7");
var _page82 = /* @__PURE__ */ __name(() => import("./pages/autori/_slug_.astro.mjs"), "_page8");
var _page92 = /* @__PURE__ */ __name(() => Promise.resolve().then(() => (init_autori_astro(), autori_astro_exports)), "_page9");
var _page102 = /* @__PURE__ */ __name(() => import("./pages/blog/en.astro.mjs"), "_page10");
var _page112 = /* @__PURE__ */ __name(() => import("./pages/blog/_---slug_.astro.mjs"), "_page11");
var _page122 = /* @__PURE__ */ __name(() => import("./pages/categoria/_categoria_.astro.mjs"), "_page12");
var _page132 = /* @__PURE__ */ __name(() => Promise.resolve().then(() => (init_cerca_astro(), cerca_astro_exports)), "_page13");
var _page142 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/collaboratori.astro.mjs"), "_page14");
var _page15 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/contatti.astro.mjs"), "_page15");
var _page16 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/hanno-scritto-per-noi.astro.mjs"), "_page16");
var _page17 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/la-redazione.astro.mjs"), "_page17");
var _page18 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/la-rivista.astro.mjs"), "_page18");
var _page19 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/redazione-storica.astro.mjs"), "_page19");
var _page20 = /* @__PURE__ */ __name(() => Promise.resolve().then(() => (init_chi_siamo_astro(), chi_siamo_astro_exports)), "_page20");
var _page21 = /* @__PURE__ */ __name(() => import("./pages/debug/audit-editoriale.astro.mjs"), "_page21");
var _page222 = /* @__PURE__ */ __name(() => import("./pages/sezioni/dialogo-aperto.astro.mjs"), "_page22");
var _page23 = /* @__PURE__ */ __name(() => import("./pages/sezioni/diari.astro.mjs"), "_page23");
var _page24 = /* @__PURE__ */ __name(() => Promise.resolve().then(() => (init_sostienici_astro(), sostienici_astro_exports)), "_page24");
var _page25 = /* @__PURE__ */ __name(() => Promise.resolve().then(() => (init_test_lista_astro(), test_lista_astro_exports)), "_page25");
var _page26 = /* @__PURE__ */ __name(() => Promise.resolve().then(() => (init_test_minimal_astro(), test_minimal_astro_exports)), "_page26");
var _page27 = /* @__PURE__ */ __name(() => Promise.resolve().then(() => (init_test_no_articles_astro(), test_no_articles_astro_exports)), "_page27");
var _page28 = /* @__PURE__ */ __name(() => Promise.resolve().then(() => (init_test_status_astro(), test_status_astro_exports)), "_page28");
var _page29 = /* @__PURE__ */ __name(() => Promise.resolve().then(() => (init_diario_astro(), diario_astro_exports)), "_page29");
var _page30 = /* @__PURE__ */ __name(() => Promise.resolve().then(() => (init_index_astro(), index_astro_exports)), "_page30");
var pageMap = /* @__PURE__ */ new Map([
  ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
  ["src/pages/404.astro", _page1],
  ["src/pages/api/debug-blog.ts", _page22],
  ["src/pages/api/debug-ssr-minimal.ts", _page32],
  ["src/pages/api/revalidate.ts", _page42],
  ["src/pages/archivio/web-only.astro", _page52],
  ["src/pages/archivio/[issue].astro", _page62],
  ["src/pages/archivio/index.astro", _page72],
  ["src/pages/autori/[slug].astro", _page82],
  ["src/pages/autori/index.astro", _page92],
  ["src/pages/blog/en.astro", _page102],
  ["src/pages/blog/[...slug].astro", _page112],
  ["src/pages/categoria/[categoria].astro", _page122],
  ["src/pages/cerca.astro", _page132],
  ["src/pages/chi-siamo/collaboratori.astro", _page142],
  ["src/pages/chi-siamo/contatti.astro", _page15],
  ["src/pages/chi-siamo/hanno-scritto-per-noi.astro", _page16],
  ["src/pages/chi-siamo/la-redazione.astro", _page17],
  ["src/pages/chi-siamo/la-rivista.astro", _page18],
  ["src/pages/chi-siamo/redazione-storica.astro", _page19],
  ["src/pages/chi-siamo/index.astro", _page20],
  ["src/pages/debug/audit-editoriale.astro", _page21],
  ["src/pages/sezioni/dialogo-aperto.astro", _page222],
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
  renderers: renderers15,
  middleware: () => Promise.resolve().then(() => (init_astro_internal_middleware(), astro_internal_middleware_exports))
});
var _exports = createExports(_manifest2);
var __astrojsSsrVirtualEntry = _exports.default;
export {
  __astrojsSsrVirtualEntry as default,
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
//# sourceMappingURL=bundledWorker-0.11759099078844071.mjs.map
