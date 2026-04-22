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
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e)
    n += e;
  else if ("object" == typeof e)
    if (Array.isArray(e)) {
      var o = e.length;
      for (t = 0; t < o; t++)
        e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
    } else
      for (f in e)
        e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++)
    (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
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
var ASTRO_VERSION, REROUTE_DIRECTIVE_HEADER, REWRITE_DIRECTIVE_HEADER_KEY, REWRITE_DIRECTIVE_HEADER_VALUE, NOOP_MIDDLEWARE_HEADER, ROUTE_TYPE_HEADER, DEFAULT_404_COMPONENT, REROUTABLE_STATUS_CODES, clientAddressSymbol, clientLocalsSymbol, originPathnameSymbol, responseSentSymbol, ClientAddressNotAvailable, PrerenderClientAddressNotAvailable, StaticClientAddressNotAvailable, NoMatchingStaticPathFound, OnlyResponseCanBeReturned, MissingMediaQueryDirective, NoMatchingRenderer, NoClientEntrypoint, NoClientOnlyHint, InvalidGetStaticPathsEntry, InvalidGetStaticPathsReturn, GetStaticPathsExpectedParams, GetStaticPathsInvalidRouteParam, GetStaticPathsRequired, ReservedSlotName, NoMatchingImport, PageNumberParamNotFound, PrerenderDynamicEndpointPathCollide, ResponseSentError, MiddlewareNoDataOrNextCalled, MiddlewareNotAResponse, EndpointDidNotReturnAResponse, LocalsNotAnObject, AstroResponseHeadersReassigned, i18nNoLocaleFoundInPath, RewriteWithBodyUsed, AstroError, FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM, isTTY, $, bold, dim, red, yellow, blue, replace, ca, esca, pe, escape, escapeHTML, HTMLBytes, HTMLString, markHTMLString, AstroJSX, RenderInstructionSymbol, PROP_TYPE, transitionDirectivesToCopyOnIsland, dictionary, binary, headAndContentSym, astro_island_prebuilt_default, ISLAND_STYLES, voidElementNames, htmlBooleanAttributes, htmlEnumAttributes, svgEnumAttributes, AMPERSAND_REGEX, DOUBLE_QUOTE_REGEX, STATIC_DIRECTIVES, toIdent, toAttributeString, kebab, toStyleString, noop, BufferedRenderer, isNode, isDeno, VALID_PROTOCOLS, uniqueElements, renderTemplateResultSym, RenderTemplateResult, slotString, SlotString, Fragment, Renderer, encoder$1, decoder$1, astroComponentInstanceSym, AstroComponentInstance, DOCTYPE_EXP, alphabetUpperCase, decodeMap, EncodingPadding$1, DecodingPadding$1, base64Alphabet, EncodingPadding, DecodingPadding, base64DecodeMap, ALGORITHM, encoder, decoder, IV_LENGTH, internalProps, needsHeadRenderingSymbol, rendererAliases, clientOnlyValues, ASTRO_SLOT_EXP, ASTRO_STATIC_SLOT_EXP, ClientOnlyPlaceholder, hasTriedRenderComponentSymbol;
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
import { renderers } from "./renderers.mjs";

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

// _worker.js/manifest_Bq4WfYAG.mjs
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
var manifest = deserializeManifest({ "hrefRoot": "file:///C:/Users/berto/Documents/Ombreeluci/", "adapterName": "@astrojs/cloudflare", "routes": [{ "file": "404.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/404", "isIndex": false, "type": "page", "pattern": "^\\/404\\/?$", "segments": [[{ "content": "404", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/404.astro", "pathname": "/404", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "archivio/web-only/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/archivio/web-only", "isIndex": false, "type": "page", "pattern": "^\\/archivio\\/web-only\\/?$", "segments": [[{ "content": "archivio", "dynamic": false, "spread": false }], [{ "content": "web-only", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/archivio/web-only.astro", "pathname": "/archivio/web-only", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "archivio/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/archivio", "isIndex": true, "type": "page", "pattern": "^\\/archivio\\/?$", "segments": [[{ "content": "archivio", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/archivio/index.astro", "pathname": "/archivio", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "autori/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/autori", "isIndex": true, "type": "page", "pattern": "^\\/autori\\/?$", "segments": [[{ "content": "autori", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/autori/index.astro", "pathname": "/autori", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "blog/en/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/blog/en", "isIndex": false, "type": "page", "pattern": "^\\/blog\\/en\\/?$", "segments": [[{ "content": "blog", "dynamic": false, "spread": false }], [{ "content": "en", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/blog/en.astro", "pathname": "/blog/en", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "cerca/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/cerca", "isIndex": false, "type": "page", "pattern": "^\\/cerca\\/?$", "segments": [[{ "content": "cerca", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/cerca.astro", "pathname": "/cerca", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/collaboratori/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/collaboratori", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/collaboratori\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "collaboratori", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/collaboratori.astro", "pathname": "/chi-siamo/collaboratori", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/contatti/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/contatti", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/contatti\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "contatti", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/contatti.astro", "pathname": "/chi-siamo/contatti", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/hanno-scritto-per-noi/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/hanno-scritto-per-noi", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/hanno-scritto-per-noi\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "hanno-scritto-per-noi", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/hanno-scritto-per-noi.astro", "pathname": "/chi-siamo/hanno-scritto-per-noi", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/la-redazione/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/la-redazione", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/la-redazione\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-redazione", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/la-redazione.astro", "pathname": "/chi-siamo/la-redazione", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/la-rivista/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/la-rivista", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/la-rivista\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-rivista", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/la-rivista.astro", "pathname": "/chi-siamo/la-rivista", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/redazione-storica/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/redazione-storica", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/redazione-storica\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "redazione-storica", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/redazione-storica.astro", "pathname": "/chi-siamo/redazione-storica", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo", "isIndex": true, "type": "page", "pattern": "^\\/chi-siamo\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/index.astro", "pathname": "/chi-siamo", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "debug/audit-editoriale/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/debug/audit-editoriale", "isIndex": false, "type": "page", "pattern": "^\\/debug\\/audit-editoriale\\/?$", "segments": [[{ "content": "debug", "dynamic": false, "spread": false }], [{ "content": "audit-editoriale", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/debug/audit-editoriale.astro", "pathname": "/debug/audit-editoriale", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "sezioni/dialogo-aperto/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/sezioni/dialogo-aperto", "isIndex": false, "type": "page", "pattern": "^\\/sezioni\\/dialogo-aperto\\/?$", "segments": [[{ "content": "sezioni", "dynamic": false, "spread": false }], [{ "content": "dialogo-aperto", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sezioni/dialogo-aperto.astro", "pathname": "/sezioni/dialogo-aperto", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "sezioni/diari/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/sezioni/diari", "isIndex": false, "type": "page", "pattern": "^\\/sezioni\\/diari\\/?$", "segments": [[{ "content": "sezioni", "dynamic": false, "spread": false }], [{ "content": "diari", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sezioni/diari.astro", "pathname": "/sezioni/diari", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "sostienici/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/sostienici", "isIndex": false, "type": "page", "pattern": "^\\/sostienici\\/?$", "segments": [[{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sostienici.astro", "pathname": "/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-lista/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-lista", "isIndex": false, "type": "page", "pattern": "^\\/test-lista\\/?$", "segments": [[{ "content": "test-lista", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-lista.astro", "pathname": "/test-lista", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-minimal/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-minimal", "isIndex": false, "type": "page", "pattern": "^\\/test-minimal\\/?$", "segments": [[{ "content": "test-minimal", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-minimal.astro", "pathname": "/test-minimal", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-no-articles/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-no-articles", "isIndex": false, "type": "page", "pattern": "^\\/test-no-articles\\/?$", "segments": [[{ "content": "test-no-articles", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-no-articles.astro", "pathname": "/test-no-articles", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-status/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-status", "isIndex": false, "type": "page", "pattern": "^\\/test-status\\/?$", "segments": [[{ "content": "test-status", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-status.astro", "pathname": "/test-status", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/", "isIndex": true, "type": "page", "pattern": "^\\/$", "segments": [], "params": [], "component": "src/pages/index.astro", "pathname": "/", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "endpoint", "isIndex": false, "route": "/_image", "pattern": "^\\/_image$", "segments": [[{ "content": "_image", "dynamic": false, "spread": false }]], "params": [], "component": "node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", "pathname": "/_image", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/revalidate", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/revalidate\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "revalidate", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/revalidate.ts", "pathname": "/api/revalidate", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [{ "type": "external", "value": "/_astro/hoisted.CIErU2gF.js" }], "styles": [{ "type": "external", "src": "/_astro/_slug_.Bvtt_j-y.css" }, { "type": "external", "src": "/_astro/_diario_.DVQXp8w2.css" }, { "type": "inline", "content": ".astro-route-announcer{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}\n.article-card[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;gap:4px}.article-card--horizontal[data-astro-cid-di2nlc57],.article-card--horizontal[data-astro-cid-di2nlc57] .article-link[data-astro-cid-di2nlc57]{flex-direction:row;gap:1rem;align-items:flex-start}.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:140px;min-width:140px;aspect-ratio:4/3;margin-bottom:0}.article-card--horizontal[data-astro-cid-di2nlc57] .article-title[data-astro-cid-di2nlc57]{font-size:1rem;-webkit-line-clamp:3}.article-card--horizontal[data-astro-cid-di2nlc57] .author-row[data-astro-cid-di2nlc57]{font-size:.8125rem;white-space:normal;flex-wrap:wrap}@media (max-width: 480px){.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:100px;min-width:100px}}.article-link[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;text-decoration:none;color:inherit;align-items:flex-start}.article-image-wrap[data-astro-cid-di2nlc57]{width:100%;aspect-ratio:16/9;flex-shrink:0;overflow:hidden;border-radius:8px;margin-bottom:1rem}.article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{width:100%;height:auto;min-height:120px;object-fit:cover;display:block;transition:transform .35s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{transform:scale(1.03)}@media (max-width: 480px){.author-row[data-astro-cid-di2nlc57]{white-space:normal;flex-wrap:wrap}}.article-meta[data-astro-cid-di2nlc57]{width:100%;margin:0}.article-badge[data-astro-cid-di2nlc57]{margin:0 0 4px;color:var(--accent-color);font-family:Raleway,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.03em}.article-badge-muted[data-astro-cid-di2nlc57]{color:var(--text-secondary);background:#0000000d;padding:.25rem .5rem;border-radius:6px;width:fit-content;text-transform:none}.article-badge-text[data-astro-cid-di2nlc57]{display:inline}.article-title[data-astro-cid-di2nlc57]{margin:4px 0;font-family:Raleway,sans-serif;font-weight:700;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--text-color);font-size:1.25rem;transition:color .2s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-title[data-astro-cid-di2nlc57]{color:var(--accent-color)}.author-row[data-astro-cid-di2nlc57]{display:flex;align-items:center;gap:4px;margin:0;font-size:.9rem;color:var(--text-secondary);white-space:nowrap}.author-link[data-astro-cid-di2nlc57]{color:var(--accent-color);text-decoration:none;font-weight:600;display:inline}.article-sottotitolo[data-astro-cid-di2nlc57]{font-size:.875rem;line-height:1.5;color:var(--text-secondary);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.author-row--inline[data-astro-cid-di2nlc57]{margin-top:.5rem;font-size:.8125rem;color:var(--text-secondary);white-space:normal;flex-wrap:wrap}.author-avatar[data-astro-cid-di2nlc57]{width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0}\n" }], "routeData": { "route": "/blog/[...slug]", "isIndex": false, "type": "page", "pattern": "^\\/blog(?:\\/(.*?))?\\/?$", "segments": [[{ "content": "blog", "dynamic": false, "spread": false }], [{ "content": "...slug", "dynamic": true, "spread": true }]], "params": ["...slug"], "component": "src/pages/blog/[...slug].astro", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/about", "pattern": "^\\/about\\/?$", "segments": [[{ "content": "about", "dynamic": false, "spread": false }]], "params": [], "component": "/about", "pathname": "/about", "prerender": false, "redirect": "/chi-siamo", "redirectRoute": { "route": "/chi-siamo", "isIndex": true, "type": "page", "pattern": "^\\/chi-siamo\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/index.astro", "pathname": "/chi-siamo", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/collaboratori", "pattern": "^\\/chi-siamo\\/collaboratori\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "collaboratori", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/collaboratori", "pathname": "/chi-siamo/collaboratori", "prerender": false, "redirect": "/chi-siamo#collaboratori", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/contatti", "pattern": "^\\/chi-siamo\\/contatti\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "contatti", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/contatti", "pathname": "/chi-siamo/contatti", "prerender": false, "redirect": "/chi-siamo#contatti", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/hanno-scritto-per-noi", "pattern": "^\\/chi-siamo\\/hanno-scritto-per-noi\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "hanno-scritto-per-noi", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/hanno-scritto-per-noi", "pathname": "/chi-siamo/hanno-scritto-per-noi", "prerender": false, "redirect": "/chi-siamo#hanno-scritto-per-noi", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/la-redazione", "pattern": "^\\/chi-siamo\\/la-redazione\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-redazione", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/la-redazione", "pathname": "/chi-siamo/la-redazione", "prerender": false, "redirect": "/chi-siamo#la-redazione", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/la-rivista", "pattern": "^\\/chi-siamo\\/la-rivista\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-rivista", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/la-rivista", "pathname": "/chi-siamo/la-rivista", "prerender": false, "redirect": "/chi-siamo#la-rivista", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/redazione-storica", "pattern": "^\\/chi-siamo\\/redazione-storica\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "redazione-storica", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/redazione-storica", "pathname": "/chi-siamo/redazione-storica", "prerender": false, "redirect": "/chi-siamo#redazione-storica", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/contribuisci", "pattern": "^\\/contribuisci\\/?$", "segments": [[{ "content": "contribuisci", "dynamic": false, "spread": false }]], "params": [], "component": "/contribuisci", "pathname": "/contribuisci", "prerender": false, "redirect": "/sostienici", "redirectRoute": { "route": "/sostienici", "isIndex": false, "type": "page", "pattern": "^\\/sostienici\\/?$", "segments": [[{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sostienici.astro", "pathname": "/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/dona", "pattern": "^\\/dona\\/?$", "segments": [[{ "content": "dona", "dynamic": false, "spread": false }]], "params": [], "component": "/dona", "pathname": "/dona", "prerender": false, "redirect": "/sostienici", "redirectRoute": { "route": "/sostienici", "isIndex": false, "type": "page", "pattern": "^\\/sostienici\\/?$", "segments": [[{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sostienici.astro", "pathname": "/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }], "base": "/", "trailingSlash": "ignore", "compressHTML": true, "componentMetadata": [["C:/Users/berto/Documents/Ombreeluci/src/pages/debug/audit-editoriale.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-lista.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-minimal.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-no-articles.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-status.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/[diario].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/404.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/[issue].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/web-only.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/autori/[slug].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/autori/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/blog/[...slug].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/blog/en.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/categoria/[categoria].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/cerca.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/collaboratori.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/contatti.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/hanno-scritto-per-noi.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/la-redazione.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/la-rivista.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/redazione-storica.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/sezioni/dialogo-aperto.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/sezioni/diari.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/sostienici.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/components/Header.astro", { "propagation": "in-tree", "containsHead": false }], ["C:/Users/berto/Documents/Ombreeluci/src/layouts/BaseLayout.astro", { "propagation": "in-tree", "containsHead": false }], ["C:/Users/berto/Documents/Ombreeluci/src/layouts/DiarioLayout.astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/[diario]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astrojs-ssr-virtual-entry", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/404@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/archivio/[issue]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/archivio/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/archivio/web-only@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/autori/[slug]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/autori/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/blog/[...slug]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/blog/en@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/categoria/[categoria]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/cerca@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/collaboratori@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/contatti@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/hanno-scritto-per-noi@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/la-redazione@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/la-rivista@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/redazione-storica@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/sezioni/dialogo-aperto@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/sezioni/diari@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/sostienici@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/debug/audit-editoriale@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/test-lista@_@astro", { "propagation": "in-tree", "containsHead": false }]], "renderers": [], "clientDirectives": [["idle", '(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value=="object"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};"requestIdleCallback"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event("astro:idle"));})();'], ["load", '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event("astro:load"));})();'], ["media", '(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener("change",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event("astro:media"));})();'], ["only", '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event("astro:only"));})();'], ["visible", '(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value=="object"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event("astro:visible"));})();']], "entryModules": { "\0@astro-renderers": "renderers.mjs", "\0@astrojs-ssr-virtual-entry": "index.js", "\0@astro-page:node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint@_@js": "pages/_image.astro.mjs", "\0@astro-page:src/pages/404@_@astro": "pages/404.astro.mjs", "\0@astro-page:src/pages/api/revalidate@_@ts": "pages/api/revalidate.astro.mjs", "\0@astro-page:src/pages/archivio/web-only@_@astro": "pages/archivio/web-only.astro.mjs", "\0@astro-page:src/pages/archivio/index@_@astro": "pages/archivio.astro.mjs", "\0@astro-page:src/pages/autori/[slug]@_@astro": "pages/autori/_slug_.astro.mjs", "\0@astro-page:src/pages/autori/index@_@astro": "pages/autori.astro.mjs", "\0@astro-page:src/pages/blog/en@_@astro": "pages/blog/en.astro.mjs", "\0@astro-page:src/pages/categoria/[categoria]@_@astro": "pages/categoria/_categoria_.astro.mjs", "\0@astro-page:src/pages/cerca@_@astro": "pages/cerca.astro.mjs", "\0@astro-page:src/pages/chi-siamo/collaboratori@_@astro": "pages/chi-siamo/collaboratori.astro.mjs", "\0@astro-page:src/pages/chi-siamo/contatti@_@astro": "pages/chi-siamo/contatti.astro.mjs", "\0@astro-page:src/pages/chi-siamo/hanno-scritto-per-noi@_@astro": "pages/chi-siamo/hanno-scritto-per-noi.astro.mjs", "\0@astro-page:src/pages/chi-siamo/la-redazione@_@astro": "pages/chi-siamo/la-redazione.astro.mjs", "\0@astro-page:src/pages/chi-siamo/la-rivista@_@astro": "pages/chi-siamo/la-rivista.astro.mjs", "\0@astro-page:src/pages/chi-siamo/redazione-storica@_@astro": "pages/chi-siamo/redazione-storica.astro.mjs", "\0@astro-page:src/pages/chi-siamo/index@_@astro": "pages/chi-siamo.astro.mjs", "\0@astro-page:src/pages/debug/audit-editoriale@_@astro": "pages/debug/audit-editoriale.astro.mjs", "\0@astro-page:src/pages/sezioni/dialogo-aperto@_@astro": "pages/sezioni/dialogo-aperto.astro.mjs", "\0@astro-page:src/pages/sezioni/diari@_@astro": "pages/sezioni/diari.astro.mjs", "\0@astro-page:src/pages/test-lista@_@astro": "pages/test-lista.astro.mjs", "\0@astro-page:src/pages/test-minimal@_@astro": "pages/test-minimal.astro.mjs", "\0@astro-page:src/pages/test-no-articles@_@astro": "pages/test-no-articles.astro.mjs", "\0@astro-page:src/pages/test-status@_@astro": "pages/test-status.astro.mjs", "\0@astro-page:src/pages/archivio/[issue]@_@astro": "pages/archivio/_issue_.astro.mjs", "\0@astro-page:src/pages/[diario]@_@astro": "pages/_diario_.astro.mjs", "\0@astro-page:src/pages/index@_@astro": "pages/index.astro.mjs", "\0astro-internal:middleware": "_astro-internal_middleware.mjs", "\0@astro-page:src/pages/blog/[...slug]@_@astro": "pages/blog/_---slug_.astro.mjs", "\0@astro-page:src/pages/sostienici@_@astro": "pages/sostienici.astro.mjs", "\0@astrojs-ssr-adapter": "_@astrojs-ssr-adapter.mjs", "\0@astrojs-manifest": "manifest_Bq4WfYAG.mjs", "/astro/hoisted.js?q=0": "_astro/hoisted.BK-QpP4l.js", "/astro/hoisted.js?q=1": "_astro/hoisted.Cdv6NXjL.js", "/astro/hoisted.js?q=5": "_astro/hoisted.D6fN33OZ.js", "/astro/hoisted.js?q=7": "_astro/hoisted.e4Grq_nB.js", "/astro/hoisted.js?q=8": "_astro/hoisted.BFiuLOoW.js", "/astro/hoisted.js?q=2": "_astro/hoisted.CIErU2gF.js", "/astro/hoisted.js?q=3": "_astro/hoisted.xg5iX3wE.js", "/astro/hoisted.js?q=4": "_astro/hoisted.BuAflv2B.js", "/astro/hoisted.js?q=6": "_astro/hoisted.D2uAbj8P.js", "/astro/hoisted.js?q=9": "_astro/hoisted.B5wi8Mb5.js", "astro:scripts/before-hydration.js": "" }, "inlinedScripts": [], "assets": ["/_astro/logo.Cb_mP9bA.svg", "/_astro/_diario_.DVQXp8w2.css", "/_astro/_issue_.Bkp5H6tf.css", "/_astro/_slug_.Bvtt_j-y.css", "/_astro/index.DvHZiE6C.css", "/_astro/sostienici.DZRfRPtH.css", "/_astro/index.Dnzyu-xS.css", "/correlati.json", "/favicon.ico", "/favicon.png", "/favicon.svg", "/robots.txt", "/_redirects", "/admin/config.yml", "/fonts/raleway-latin.woff2", "/images/avatar-default.png", "/images/avatar-default.svg", "/images/dona1.webp", "/images/dona2.webp", "/images/dona3.webp", "/images/dona4.webp", "/images/dona7.webp", "/images/placeholder-copertina.svg", "/placeholder/ph-1.jpg", "/placeholder/ph-2.jpg", "/placeholder/ph-3.jpg", "/placeholder/ph-4.jpg", "/_astro/hoisted.B5wi8Mb5.js", "/_astro/hoisted.BFiuLOoW.js", "/_astro/hoisted.BK-QpP4l.js", "/_astro/hoisted.BuAflv2B.js", "/_astro/hoisted.Cdv6NXjL.js", "/_astro/hoisted.CIErU2gF.js", "/_astro/hoisted.CXOjeUv_.css", "/_astro/hoisted.D2uAbj8P.js", "/_astro/hoisted.D6fN33OZ.js", "/_astro/hoisted.e4Grq_nB.js", "/_astro/hoisted.xg5iX3wE.js", "/_worker.js/index.js", "/_worker.js/renderers.mjs", "/_worker.js/_@astrojs-ssr-adapter.mjs", "/_worker.js/_astro-internal_middleware.mjs", "/images/redazione/alessandro-de-simone.jpg", "/images/redazione/benedetta-mattei.png", "/images/redazione/claudio-cinus.jpg", "/images/redazione/cristina-tersigni.webp", "/images/redazione/don-marco-bove.jpg", "/images/redazione/enrica-riera.png", "/images/redazione/franco-manuzio.jpg", "/images/redazione/giovanni-grossi.png", "/images/redazione/giulia-galeotti.webp", "/images/redazione/laura-coccia.jpg", "/images/redazione/maria-teresa-mazzarotto.jpg", "/images/redazione/mariangela-bertolini.png", "/images/redazione/matteo-cinti.png", "/images/redazione/natalia-livi.jpg", "/images/redazione/nicla-bettazzi.jpg", "/images/redazione/nicole-schulthes.jpg", "/images/redazione/rita-massi.png", "/images/redazione/serena-sillitto.png", "/images/redazione/sergio-sciascia.jpg", "/images/redazione/silvia-camisasca.jpg", "/images/redazione/silvia-gusmani.jpg", "/_worker.js/chunks/AboutSidebar_BMo6rhTT.mjs", "/_worker.js/chunks/ArticleCard_Bg_X0yvL.mjs", "/_worker.js/chunks/astro-designed-error-pages_DfD573yd.mjs", "/_worker.js/chunks/astro_JL7pVawF.mjs", "/_worker.js/chunks/BaseLayout_DIxcXjbq.mjs", "/_worker.js/chunks/diari_DNXJk5VJ.mjs", "/_worker.js/chunks/directus_CErDsJ21.mjs", "/_worker.js/chunks/Footer_D9bdzLvP.mjs", "/_worker.js/chunks/index_B-gW6nkE.mjs", "/_worker.js/chunks/IssueCard_Db5MfroW.mjs", "/_worker.js/chunks/noop-middleware_Chs5f3j2.mjs", "/_worker.js/chunks/ViewTransitions_Dvx2U5F3.mjs", "/_worker.js/pages/404.astro.mjs", "/_worker.js/pages/archivio.astro.mjs", "/_worker.js/pages/autori.astro.mjs", "/_worker.js/pages/cerca.astro.mjs", "/_worker.js/pages/chi-siamo.astro.mjs", "/_worker.js/pages/index.astro.mjs", "/_worker.js/pages/sostienici.astro.mjs", "/_worker.js/pages/test-lista.astro.mjs", "/_worker.js/pages/test-minimal.astro.mjs", "/_worker.js/pages/test-no-articles.astro.mjs", "/_worker.js/pages/test-status.astro.mjs", "/_worker.js/pages/_diario_.astro.mjs", "/_worker.js/pages/_image.astro.mjs", "/_worker.js/_astro/index.Dnzyu-xS.css", "/_worker.js/_astro/index.DvHZiE6C.css", "/_worker.js/_astro/logo.Cb_mP9bA.svg", "/_worker.js/_astro/sostienici.DZRfRPtH.css", "/_worker.js/_astro/_diario_.DVQXp8w2.css", "/_worker.js/_astro/_issue_.Bkp5H6tf.css", "/_worker.js/_astro/_slug_.Bvtt_j-y.css", "/_worker.js/chunks/astro/env-setup_nxDOIah1.mjs", "/_worker.js/chunks/astro/server_CgTYz_Tl.mjs", "/_worker.js/pages/api/revalidate.astro.mjs", "/_worker.js/pages/archivio/web-only.astro.mjs", "/_worker.js/pages/archivio/_issue_.astro.mjs", "/_worker.js/pages/blog/en.astro.mjs", "/_worker.js/pages/blog/_---slug_.astro.mjs", "/_worker.js/pages/categoria/_categoria_.astro.mjs", "/_worker.js/pages/chi-siamo/collaboratori.astro.mjs", "/_worker.js/pages/chi-siamo/contatti.astro.mjs", "/_worker.js/pages/chi-siamo/hanno-scritto-per-noi.astro.mjs", "/_worker.js/pages/chi-siamo/la-redazione.astro.mjs", "/_worker.js/pages/chi-siamo/la-rivista.astro.mjs", "/_worker.js/pages/chi-siamo/redazione-storica.astro.mjs", "/_worker.js/pages/debug/audit-editoriale.astro.mjs", "/_worker.js/pages/autori/_slug_.astro.mjs", "/_worker.js/pages/sezioni/dialogo-aperto.astro.mjs", "/_worker.js/pages/sezioni/diari.astro.mjs", "/404.html", "/archivio/web-only/index.html", "/archivio/index.html", "/autori/index.html", "/blog/en/index.html", "/cerca/index.html", "/chi-siamo/collaboratori/index.html", "/chi-siamo/contatti/index.html", "/chi-siamo/hanno-scritto-per-noi/index.html", "/chi-siamo/la-redazione/index.html", "/chi-siamo/la-rivista/index.html", "/chi-siamo/redazione-storica/index.html", "/chi-siamo/index.html", "/debug/audit-editoriale/index.html", "/sezioni/dialogo-aperto/index.html", "/sezioni/diari/index.html", "/sostienici/index.html", "/test-lista/index.html", "/test-minimal/index.html", "/test-no-articles/index.html", "/test-status/index.html", "/index.html"], "buildFormat": "directory", "checkOrigin": false, "serverIslandNameMap": [], "key": "Fm3XGGxb3ZHIZ9GALFUoZcFPwhE8ovzxSSCz99+qfvk=", "experimentalEnvGetSecretEnabled": false });

// _worker.js/index.js
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
var _manifest2 = Object.assign(manifest, {
  pageMap,
  serverIslandMap,
  renderers,
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
//# sourceMappingURL=bundledWorker-0.5329130614578534.mjs.map
