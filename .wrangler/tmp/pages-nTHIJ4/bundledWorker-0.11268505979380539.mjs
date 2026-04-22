var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// _worker.js/index.js
import { renderers } from "./renderers.mjs";
import { createExports } from "./_@astrojs-ssr-adapter.mjs";

// _worker.js/chunks/astro/server_CgTYz_Tl.mjs
globalThis.process ??= {};
globalThis.process.env ??= {};
var NOOP_MIDDLEWARE_HEADER = "X-Astro-Noop";
var clientAddressSymbol = Symbol.for("astro.clientAddress");
var clientLocalsSymbol = Symbol.for("astro.locals");
var originPathnameSymbol = Symbol.for("astro.originPathname");
var responseSentSymbol = Symbol.for("astro.responseSent");
var FORCE_COLOR;
var NODE_DISABLE_COLORS;
var NO_COLOR;
var TERM;
var isTTY = true;
if (typeof process !== "undefined") {
  ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
  isTTY = process.stdout && process.stdout.isTTY;
}
var $ = {
  enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY)
};
function init(x, y) {
  let rgx = new RegExp(`\\x1b\\[${y}m`, "g");
  let open = `\x1B[${x}m`, close = `\x1B[${y}m`;
  return function(txt) {
    if (!$.enabled || txt == null)
      return txt;
    return open + (!!~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
  };
}
__name(init, "init");
var bold = init(1, 22);
var dim = init(2, 22);
var red = init(31, 39);
var yellow = init(33, 39);
var blue = init(34, 39);
var { replace } = "";
var ca = /[&<>'"]/g;
var esca = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;"
};
var pe = /* @__PURE__ */ __name((m) => esca[m], "pe");
var escape = /* @__PURE__ */ __name((es) => replace.call(es, ca, pe), "escape");
function isPromise(value) {
  return !!value && typeof value === "object" && "then" in value && typeof value.then === "function";
}
__name(isPromise, "isPromise");
var escapeHTML = escape;
var HTMLBytes = class extends Uint8Array {
};
__name(HTMLBytes, "HTMLBytes");
Object.defineProperty(HTMLBytes.prototype, Symbol.toStringTag, {
  get() {
    return "HTMLBytes";
  }
});
var HTMLString = class extends String {
  get [Symbol.toStringTag]() {
    return "HTMLString";
  }
};
__name(HTMLString, "HTMLString");
var markHTMLString = /* @__PURE__ */ __name((value) => {
  if (value instanceof HTMLString) {
    return value;
  }
  if (typeof value === "string") {
    return new HTMLString(value);
  }
  return value;
}, "markHTMLString");
function isHTMLString(value) {
  return Object.prototype.toString.call(value) === "[object HTMLString]";
}
__name(isHTMLString, "isHTMLString");
var RenderInstructionSymbol = Symbol.for("astro:render");
var transitionDirectivesToCopyOnIsland = Object.freeze([
  "data-astro-transition-scope",
  "data-astro-transition-persist",
  "data-astro-transition-persist-props"
]);
var dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
var binary = dictionary.length;
var headAndContentSym = Symbol.for("astro.headAndContent");
function isHeadAndContent(obj) {
  return typeof obj === "object" && obj !== null && !!obj[headAndContentSym];
}
__name(isHeadAndContent, "isHeadAndContent");
var noop = /* @__PURE__ */ __name(() => {
}, "noop");
var BufferedRenderer = class {
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
function renderToBufferDestination(bufferRenderFunction) {
  const renderer = new BufferedRenderer(bufferRenderFunction);
  return renderer;
}
__name(renderToBufferDestination, "renderToBufferDestination");
var isNode = typeof process !== "undefined" && Object.prototype.toString.call(process) === "[object process]";
var renderTemplateResultSym = Symbol.for("astro.renderTemplateResult");
var RenderTemplateResult = class {
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
function isRenderTemplateResult(obj) {
  return typeof obj === "object" && obj !== null && !!obj[renderTemplateResultSym];
}
__name(isRenderTemplateResult, "isRenderTemplateResult");
var slotString = Symbol.for("astro:slot-string");
var SlotString = class extends HTMLString {
  instructions;
  [slotString];
  constructor(content, instructions) {
    super(content);
    this.instructions = instructions;
    this[slotString] = true;
  }
};
__name(SlotString, "SlotString");
var Fragment = Symbol.for("astro:fragment");
var Renderer = Symbol.for("astro:renderer");
var encoder$1 = new TextEncoder();
var decoder$1 = new TextDecoder();
function isRenderInstance(obj) {
  return !!obj && typeof obj === "object" && "render" in obj && typeof obj.render === "function";
}
__name(isRenderInstance, "isRenderInstance");
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
__name(renderChild, "renderChild");
var astroComponentInstanceSym = Symbol.for("astro.componentInstance");
var AstroComponentInstance = class {
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
function isAstroComponentInstance(obj) {
  return typeof obj === "object" && obj !== null && !!obj[astroComponentInstanceSym];
}
__name(isAstroComponentInstance, "isAstroComponentInstance");
var EncodingPadding$1;
(function(EncodingPadding2) {
  EncodingPadding2[EncodingPadding2["Include"] = 0] = "Include";
  EncodingPadding2[EncodingPadding2["None"] = 1] = "None";
})(EncodingPadding$1 || (EncodingPadding$1 = {}));
var DecodingPadding$1;
(function(DecodingPadding2) {
  DecodingPadding2[DecodingPadding2["Required"] = 0] = "Required";
  DecodingPadding2[DecodingPadding2["Ignore"] = 1] = "Ignore";
})(DecodingPadding$1 || (DecodingPadding$1 = {}));
function decodeBase64(encoded) {
  return decodeBase64_internal(encoded, base64DecodeMap, DecodingPadding.Required);
}
__name(decodeBase64, "decodeBase64");
function decodeBase64_internal(encoded, decodeMap, padding) {
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
      if (!(encoded[i + j] in decodeMap)) {
        throw new Error("Invalid character");
      }
      chunk |= decodeMap[encoded[i + j]] << (3 - j) * 6;
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
__name(decodeBase64_internal, "decodeBase64_internal");
var EncodingPadding;
(function(EncodingPadding2) {
  EncodingPadding2[EncodingPadding2["Include"] = 0] = "Include";
  EncodingPadding2[EncodingPadding2["None"] = 1] = "None";
})(EncodingPadding || (EncodingPadding = {}));
var DecodingPadding;
(function(DecodingPadding2) {
  DecodingPadding2[DecodingPadding2["Required"] = 0] = "Required";
  DecodingPadding2[DecodingPadding2["Ignore"] = 1] = "Ignore";
})(DecodingPadding || (DecodingPadding = {}));
var base64DecodeMap = {
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
var ALGORITHM = "AES-GCM";
async function decodeKey(encoded) {
  const bytes = decodeBase64(encoded);
  return crypto.subtle.importKey("raw", bytes, ALGORITHM, true, ["encrypt", "decrypt"]);
}
__name(decodeKey, "decodeKey");
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var needsHeadRenderingSymbol = Symbol.for("astro.needsHeadRendering");
var hasTriedRenderComponentSymbol = Symbol("hasTriedRenderComponent");
"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_".split("").reduce((v, c) => (v[c.charCodeAt(0)] = c, v), []);
"-0123456789_".split("").reduce((v, c) => (v[c.charCodeAt(0)] = c, v), []);

// _worker.js/chunks/astro-designed-error-pages_DfD573yd.mjs
globalThis.process ??= {};
globalThis.process.env ??= {};
var ImportType;
!function(A) {
  A[A.Static = 1] = "Static", A[A.Dynamic = 2] = "Dynamic", A[A.ImportMeta = 3] = "ImportMeta", A[A.StaticSourcePhase = 4] = "StaticSourcePhase", A[A.DynamicSourcePhase = 5] = "DynamicSourcePhase", A[A.StaticDeferPhase = 6] = "StaticDeferPhase", A[A.DynamicDeferPhase = 7] = "DynamicDeferPhase";
}(ImportType || (ImportType = {}));
1 === new Uint8Array(new Uint16Array([1]).buffer)[0];
var E = /* @__PURE__ */ __name(() => {
  return A = "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GzYCHAtBAEEAKAKwCkECajYCsAoCQAJAAkACQEEAECkiAUHhAEYNACABQfcARg0BQQAoArAKIQEMAgtBACgCsAoiAUECakHACEEKEC8NAUEGIQIMAgtBACgCsAoiAS8BAkHpAEcNACABLwEEQfQARw0AQQQhAiABLwEGQegARg0BC0EAIAFBfmo2ArAKDwtBACABIAJBAXRqNgKwCgJAQQEQKUH7AEYNAEEAIAE2ArAKDwtBACgCsAoiACECA0BBACACQQJqNgKwCgJAAkACQEEBECkiAkEiRg0AIAJBJ0cNAUEnEBpBAEEAKAKwCkECajYCsApBARApIQIMAgtBIhAaQQBBACgCsApBAmo2ArAKQQEQKSECDAELIAIQLCECCwJAIAJBOkYNAEEAIAE2ArAKDwtBAEEAKAKwCkECajYCsAoCQEEBECkiAkEiRg0AIAJBJ0YNAEEAIAE2ArAKDwsgAhAaQQBBACgCsApBAmo2ArAKAkACQEEBECkiAkEsRg0AIAJB/QBGDQFBACABNgKwCg8LQQBBACgCsApBAmo2ArAKQQEQKUH9AEYNAEEAKAKwCiECDAELC0EAKALwCSIBIAA2AhAgAUEAKAKwCkECajYCDAttAQJ/AkACQANAAkAgAEH//wNxIgFBd2oiAkEXSw0AQQEgAnRBn4CABHENAgsgAUGgAUYNASAAIQIgARAoDQJBACECQQBBACgCsAoiAEECajYCsAogAC8BAiIADQAMAgsLIAAhAgsgAkH//wNxC6sBAQR/AkACQEEAKAKwCiICLwEAIgNB4QBGDQAgASEEIAAhBQwBC0EAIAJBBGo2ArAKQQEQKSECQQAoArAKIQUCQAJAIAJBIkYNACACQSdGDQAgAhAsGkEAKAKwCiEEDAELIAIQGkEAQQAoArAKQQJqIgQ2ArAKC0EBECkhA0EAKAKwCiECCwJAIAIgBUYNACAFIARBACAAIAAgAUYiAhtBACABIAIbEAILIAMLcgEEf0EAKAKwCiEAQQAoArQKIQECQAJAA0AgAEECaiECIAAgAU8NAQJAAkAgAi8BACIDQaR/ag4CAQQACyACIQAgA0F2ag4EAgEBAgELIABBBGohAAwACwtBACACNgKwChAlQQAPC0EAIAI2ArAKQd0AC0kBA39BACEDAkAgAkUNAAJAA0AgAC0AACIEIAEtAAAiBUcNASABQQFqIQEgAEEBaiEAIAJBf2oiAg0ADAILCyAEIAVrIQMLIAMLC+wBAgBBgAgLzgEAAHgAcABvAHIAdABtAHAAbwByAHQAZgBvAHIAZQB0AGEAbwB1AHIAYwBlAHIAbwBtAHUAbgBjAHQAaQBvAG4AcwBzAGUAcgB0AHYAbwB5AGkAZQBkAGUAbABlAGMAbwBuAHQAaQBuAGkAbgBzAHQAYQBuAHQAeQBiAHIAZQBhAHIAZQB0AHUAcgBkAGUAYgB1AGcAZwBlAGEAdwBhAGkAdABoAHIAdwBoAGkAbABlAGkAZgBjAGEAdABjAGYAaQBuAGEAbABsAGUAbABzAABB0AkLEAEAAAACAAAAAAQAAEA5AAA=", "undefined" != typeof Buffer ? Buffer.from(A, "base64") : Uint8Array.from(atob(A), (A2) => A2.charCodeAt(0));
  var A;
}, "E");
WebAssembly.compile(E()).then(WebAssembly.instantiate).then(({ exports: A }) => {
});
var codeToStatusMap = {
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
var statusToCodeMap = Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);
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
__name(template, "template");
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
__name(default404Page, "default404Page");
default404Page.isAstroComponentFactory = true;

// _worker.js/chunks/noop-middleware_Chs5f3j2.mjs
globalThis.process ??= {};
globalThis.process.env ??= {};
var NOOP_MIDDLEWARE_FN = /* @__PURE__ */ __name(async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
}, "NOOP_MIDDLEWARE_FN");

// _worker.js/manifest_BCSYgJ1R.mjs
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
var manifest = deserializeManifest({ "hrefRoot": "file:///C:/Users/berto/Documents/Ombreeluci/", "adapterName": "@astrojs/cloudflare", "routes": [{ "file": "404.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/404", "isIndex": false, "type": "page", "pattern": "^\\/404\\/?$", "segments": [[{ "content": "404", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/404.astro", "pathname": "/404", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "archivio/web-only/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/archivio/web-only", "isIndex": false, "type": "page", "pattern": "^\\/archivio\\/web-only\\/?$", "segments": [[{ "content": "archivio", "dynamic": false, "spread": false }], [{ "content": "web-only", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/archivio/web-only.astro", "pathname": "/archivio/web-only", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "archivio/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/archivio", "isIndex": true, "type": "page", "pattern": "^\\/archivio\\/?$", "segments": [[{ "content": "archivio", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/archivio/index.astro", "pathname": "/archivio", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "autori/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/autori", "isIndex": true, "type": "page", "pattern": "^\\/autori\\/?$", "segments": [[{ "content": "autori", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/autori/index.astro", "pathname": "/autori", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "blog/en/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/blog/en", "isIndex": false, "type": "page", "pattern": "^\\/blog\\/en\\/?$", "segments": [[{ "content": "blog", "dynamic": false, "spread": false }], [{ "content": "en", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/blog/en.astro", "pathname": "/blog/en", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "cerca/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/cerca", "isIndex": false, "type": "page", "pattern": "^\\/cerca\\/?$", "segments": [[{ "content": "cerca", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/cerca.astro", "pathname": "/cerca", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/collaboratori/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/collaboratori", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/collaboratori\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "collaboratori", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/collaboratori.astro", "pathname": "/chi-siamo/collaboratori", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/contatti/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/contatti", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/contatti\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "contatti", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/contatti.astro", "pathname": "/chi-siamo/contatti", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/hanno-scritto-per-noi/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/hanno-scritto-per-noi", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/hanno-scritto-per-noi\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "hanno-scritto-per-noi", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/hanno-scritto-per-noi.astro", "pathname": "/chi-siamo/hanno-scritto-per-noi", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/la-redazione/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/la-redazione", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/la-redazione\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-redazione", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/la-redazione.astro", "pathname": "/chi-siamo/la-redazione", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/la-rivista/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/la-rivista", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/la-rivista\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-rivista", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/la-rivista.astro", "pathname": "/chi-siamo/la-rivista", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/redazione-storica/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/redazione-storica", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/redazione-storica\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "redazione-storica", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/redazione-storica.astro", "pathname": "/chi-siamo/redazione-storica", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo", "isIndex": true, "type": "page", "pattern": "^\\/chi-siamo\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/index.astro", "pathname": "/chi-siamo", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "debug/audit-editoriale/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/debug/audit-editoriale", "isIndex": false, "type": "page", "pattern": "^\\/debug\\/audit-editoriale\\/?$", "segments": [[{ "content": "debug", "dynamic": false, "spread": false }], [{ "content": "audit-editoriale", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/debug/audit-editoriale.astro", "pathname": "/debug/audit-editoriale", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "sezioni/dialogo-aperto/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/sezioni/dialogo-aperto", "isIndex": false, "type": "page", "pattern": "^\\/sezioni\\/dialogo-aperto\\/?$", "segments": [[{ "content": "sezioni", "dynamic": false, "spread": false }], [{ "content": "dialogo-aperto", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sezioni/dialogo-aperto.astro", "pathname": "/sezioni/dialogo-aperto", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "sezioni/diari/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/sezioni/diari", "isIndex": false, "type": "page", "pattern": "^\\/sezioni\\/diari\\/?$", "segments": [[{ "content": "sezioni", "dynamic": false, "spread": false }], [{ "content": "diari", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sezioni/diari.astro", "pathname": "/sezioni/diari", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "sostienici/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/sostienici", "isIndex": false, "type": "page", "pattern": "^\\/sostienici\\/?$", "segments": [[{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sostienici.astro", "pathname": "/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-lista/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-lista", "isIndex": false, "type": "page", "pattern": "^\\/test-lista\\/?$", "segments": [[{ "content": "test-lista", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-lista.astro", "pathname": "/test-lista", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-minimal/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-minimal", "isIndex": false, "type": "page", "pattern": "^\\/test-minimal\\/?$", "segments": [[{ "content": "test-minimal", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-minimal.astro", "pathname": "/test-minimal", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-no-articles/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-no-articles", "isIndex": false, "type": "page", "pattern": "^\\/test-no-articles\\/?$", "segments": [[{ "content": "test-no-articles", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-no-articles.astro", "pathname": "/test-no-articles", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-status/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-status", "isIndex": false, "type": "page", "pattern": "^\\/test-status\\/?$", "segments": [[{ "content": "test-status", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-status.astro", "pathname": "/test-status", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/", "isIndex": true, "type": "page", "pattern": "^\\/$", "segments": [], "params": [], "component": "src/pages/index.astro", "pathname": "/", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "endpoint", "isIndex": false, "route": "/_image", "pattern": "^\\/_image$", "segments": [[{ "content": "_image", "dynamic": false, "spread": false }]], "params": [], "component": "node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", "pathname": "/_image", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/revalidate", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/revalidate\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "revalidate", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/revalidate.ts", "pathname": "/api/revalidate", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [{ "type": "external", "value": "/_astro/hoisted.CIErU2gF.js" }], "styles": [{ "type": "external", "src": "/_astro/_slug_.hddEW2pG.css" }, { "type": "external", "src": "/_astro/_diario_.1WEBGJSg.css" }, { "type": "inline", "content": ".astro-route-announcer{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}\n.article-card[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;gap:4px}.article-card--horizontal[data-astro-cid-di2nlc57],.article-card--horizontal[data-astro-cid-di2nlc57] .article-link[data-astro-cid-di2nlc57]{flex-direction:row;gap:1rem;align-items:flex-start}.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:140px;min-width:140px;aspect-ratio:4/3;margin-bottom:0}.article-card--horizontal[data-astro-cid-di2nlc57] .article-title[data-astro-cid-di2nlc57]{font-size:1rem;-webkit-line-clamp:3}.article-card--horizontal[data-astro-cid-di2nlc57] .author-row[data-astro-cid-di2nlc57]{font-size:.8125rem;white-space:normal;flex-wrap:wrap}@media (max-width: 480px){.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:100px;min-width:100px}}.article-link[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;text-decoration:none;color:inherit;align-items:flex-start}.article-image-wrap[data-astro-cid-di2nlc57]{width:100%;aspect-ratio:16/9;flex-shrink:0;overflow:hidden;border-radius:8px;margin-bottom:1rem}.article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{width:100%;height:auto;min-height:120px;object-fit:cover;display:block;transition:transform .35s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{transform:scale(1.03)}@media (max-width: 480px){.author-row[data-astro-cid-di2nlc57]{white-space:normal;flex-wrap:wrap}}.article-meta[data-astro-cid-di2nlc57]{width:100%;margin:0}.article-badge[data-astro-cid-di2nlc57]{margin:0 0 4px;color:var(--accent-color);font-family:Raleway,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.03em}.article-badge-muted[data-astro-cid-di2nlc57]{color:var(--text-secondary);background:#0000000d;padding:.25rem .5rem;border-radius:6px;width:fit-content;text-transform:none}.article-badge-text[data-astro-cid-di2nlc57]{display:inline}.article-title[data-astro-cid-di2nlc57]{margin:4px 0;font-family:Raleway,sans-serif;font-weight:700;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--text-color);font-size:1.25rem;transition:color .2s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-title[data-astro-cid-di2nlc57]{color:var(--accent-color)}.author-row[data-astro-cid-di2nlc57]{display:flex;align-items:center;gap:4px;margin:0;font-size:.9rem;color:var(--text-secondary);white-space:nowrap}.author-link[data-astro-cid-di2nlc57]{color:var(--accent-color);text-decoration:none;font-weight:600;display:inline}.article-sottotitolo[data-astro-cid-di2nlc57]{font-size:.875rem;line-height:1.5;color:var(--text-secondary);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.author-row--inline[data-astro-cid-di2nlc57]{margin-top:.5rem;font-size:.8125rem;color:var(--text-secondary);white-space:normal;flex-wrap:wrap}.author-avatar[data-astro-cid-di2nlc57]{width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0}\n" }], "routeData": { "route": "/blog/[...slug]", "isIndex": false, "type": "page", "pattern": "^\\/blog(?:\\/(.*?))?\\/?$", "segments": [[{ "content": "blog", "dynamic": false, "spread": false }], [{ "content": "...slug", "dynamic": true, "spread": true }]], "params": ["...slug"], "component": "src/pages/blog/[...slug].astro", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/about", "pattern": "^\\/about\\/?$", "segments": [[{ "content": "about", "dynamic": false, "spread": false }]], "params": [], "component": "/about", "pathname": "/about", "prerender": false, "redirect": "/chi-siamo", "redirectRoute": { "route": "/chi-siamo", "isIndex": true, "type": "page", "pattern": "^\\/chi-siamo\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/index.astro", "pathname": "/chi-siamo", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/collaboratori", "pattern": "^\\/chi-siamo\\/collaboratori\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "collaboratori", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/collaboratori", "pathname": "/chi-siamo/collaboratori", "prerender": false, "redirect": "/chi-siamo#collaboratori", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/contatti", "pattern": "^\\/chi-siamo\\/contatti\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "contatti", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/contatti", "pathname": "/chi-siamo/contatti", "prerender": false, "redirect": "/chi-siamo#contatti", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/hanno-scritto-per-noi", "pattern": "^\\/chi-siamo\\/hanno-scritto-per-noi\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "hanno-scritto-per-noi", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/hanno-scritto-per-noi", "pathname": "/chi-siamo/hanno-scritto-per-noi", "prerender": false, "redirect": "/chi-siamo#hanno-scritto-per-noi", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/la-redazione", "pattern": "^\\/chi-siamo\\/la-redazione\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-redazione", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/la-redazione", "pathname": "/chi-siamo/la-redazione", "prerender": false, "redirect": "/chi-siamo#la-redazione", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/la-rivista", "pattern": "^\\/chi-siamo\\/la-rivista\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-rivista", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/la-rivista", "pathname": "/chi-siamo/la-rivista", "prerender": false, "redirect": "/chi-siamo#la-rivista", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/redazione-storica", "pattern": "^\\/chi-siamo\\/redazione-storica\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "redazione-storica", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/redazione-storica", "pathname": "/chi-siamo/redazione-storica", "prerender": false, "redirect": "/chi-siamo#redazione-storica", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/contribuisci", "pattern": "^\\/contribuisci\\/?$", "segments": [[{ "content": "contribuisci", "dynamic": false, "spread": false }]], "params": [], "component": "/contribuisci", "pathname": "/contribuisci", "prerender": false, "redirect": "/sostienici", "redirectRoute": { "route": "/sostienici", "isIndex": false, "type": "page", "pattern": "^\\/sostienici\\/?$", "segments": [[{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sostienici.astro", "pathname": "/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/dona", "pattern": "^\\/dona\\/?$", "segments": [[{ "content": "dona", "dynamic": false, "spread": false }]], "params": [], "component": "/dona", "pathname": "/dona", "prerender": false, "redirect": "/sostienici", "redirectRoute": { "route": "/sostienici", "isIndex": false, "type": "page", "pattern": "^\\/sostienici\\/?$", "segments": [[{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sostienici.astro", "pathname": "/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }], "base": "/", "trailingSlash": "ignore", "compressHTML": true, "componentMetadata": [["C:/Users/berto/Documents/Ombreeluci/src/pages/debug/audit-editoriale.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-lista.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-minimal.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-no-articles.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-status.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/[diario].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/404.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/[issue].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/web-only.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/autori/[slug].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/autori/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/blog/[...slug].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/blog/en.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/categoria/[categoria].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/cerca.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/collaboratori.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/contatti.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/hanno-scritto-per-noi.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/la-redazione.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/la-rivista.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/redazione-storica.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/sezioni/dialogo-aperto.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/sezioni/diari.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/sostienici.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/components/Header.astro", { "propagation": "in-tree", "containsHead": false }], ["C:/Users/berto/Documents/Ombreeluci/src/layouts/BaseLayout.astro", { "propagation": "in-tree", "containsHead": false }], ["C:/Users/berto/Documents/Ombreeluci/src/layouts/DiarioLayout.astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/[diario]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astrojs-ssr-virtual-entry", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/404@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/archivio/[issue]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/archivio/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/archivio/web-only@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/autori/[slug]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/autori/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/blog/[...slug]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/blog/en@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/categoria/[categoria]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/cerca@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/collaboratori@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/contatti@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/hanno-scritto-per-noi@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/la-redazione@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/la-rivista@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/redazione-storica@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/sezioni/dialogo-aperto@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/sezioni/diari@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/sostienici@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/debug/audit-editoriale@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/test-lista@_@astro", { "propagation": "in-tree", "containsHead": false }]], "renderers": [], "clientDirectives": [["idle", '(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value=="object"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};"requestIdleCallback"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event("astro:idle"));})();'], ["load", '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event("astro:load"));})();'], ["media", '(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener("change",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event("astro:media"));})();'], ["only", '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event("astro:only"));})();'], ["visible", '(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value=="object"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event("astro:visible"));})();']], "entryModules": { "\0@astro-renderers": "renderers.mjs", "\0@astrojs-ssr-virtual-entry": "index.js", "\0@astro-page:node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint@_@js": "pages/_image.astro.mjs", "\0@astro-page:src/pages/404@_@astro": "pages/404.astro.mjs", "\0@astro-page:src/pages/api/revalidate@_@ts": "pages/api/revalidate.astro.mjs", "\0@astro-page:src/pages/archivio/web-only@_@astro": "pages/archivio/web-only.astro.mjs", "\0@astro-page:src/pages/archivio/index@_@astro": "pages/archivio.astro.mjs", "\0@astro-page:src/pages/autori/[slug]@_@astro": "pages/autori/_slug_.astro.mjs", "\0@astro-page:src/pages/autori/index@_@astro": "pages/autori.astro.mjs", "\0@astro-page:src/pages/blog/en@_@astro": "pages/blog/en.astro.mjs", "\0@astro-page:src/pages/categoria/[categoria]@_@astro": "pages/categoria/_categoria_.astro.mjs", "\0@astro-page:src/pages/cerca@_@astro": "pages/cerca.astro.mjs", "\0@astro-page:src/pages/chi-siamo/collaboratori@_@astro": "pages/chi-siamo/collaboratori.astro.mjs", "\0@astro-page:src/pages/chi-siamo/contatti@_@astro": "pages/chi-siamo/contatti.astro.mjs", "\0@astro-page:src/pages/chi-siamo/hanno-scritto-per-noi@_@astro": "pages/chi-siamo/hanno-scritto-per-noi.astro.mjs", "\0@astro-page:src/pages/chi-siamo/la-redazione@_@astro": "pages/chi-siamo/la-redazione.astro.mjs", "\0@astro-page:src/pages/chi-siamo/la-rivista@_@astro": "pages/chi-siamo/la-rivista.astro.mjs", "\0@astro-page:src/pages/chi-siamo/redazione-storica@_@astro": "pages/chi-siamo/redazione-storica.astro.mjs", "\0@astro-page:src/pages/chi-siamo/index@_@astro": "pages/chi-siamo.astro.mjs", "\0@astro-page:src/pages/debug/audit-editoriale@_@astro": "pages/debug/audit-editoriale.astro.mjs", "\0@astro-page:src/pages/sezioni/dialogo-aperto@_@astro": "pages/sezioni/dialogo-aperto.astro.mjs", "\0@astro-page:src/pages/sezioni/diari@_@astro": "pages/sezioni/diari.astro.mjs", "\0@astro-page:src/pages/test-lista@_@astro": "pages/test-lista.astro.mjs", "\0@astro-page:src/pages/test-minimal@_@astro": "pages/test-minimal.astro.mjs", "\0@astro-page:src/pages/test-no-articles@_@astro": "pages/test-no-articles.astro.mjs", "\0@astro-page:src/pages/test-status@_@astro": "pages/test-status.astro.mjs", "\0@astro-page:src/pages/archivio/[issue]@_@astro": "pages/archivio/_issue_.astro.mjs", "\0@astro-page:src/pages/[diario]@_@astro": "pages/_diario_.astro.mjs", "\0@astro-page:src/pages/index@_@astro": "pages/index.astro.mjs", "\0astro-internal:middleware": "_astro-internal_middleware.mjs", "\0@astro-page:src/pages/blog/[...slug]@_@astro": "pages/blog/_---slug_.astro.mjs", "\0@astro-page:src/pages/sostienici@_@astro": "pages/sostienici.astro.mjs", "\0@astrojs-ssr-adapter": "_@astrojs-ssr-adapter.mjs", "\0@astrojs-manifest": "manifest_BCSYgJ1R.mjs", "/astro/hoisted.js?q=0": "_astro/hoisted.BK-QpP4l.js", "/astro/hoisted.js?q=1": "_astro/hoisted.Cdv6NXjL.js", "/astro/hoisted.js?q=5": "_astro/hoisted.D6fN33OZ.js", "/astro/hoisted.js?q=7": "_astro/hoisted.e4Grq_nB.js", "/astro/hoisted.js?q=8": "_astro/hoisted.BFiuLOoW.js", "/astro/hoisted.js?q=2": "_astro/hoisted.CIErU2gF.js", "/astro/hoisted.js?q=3": "_astro/hoisted.xg5iX3wE.js", "/astro/hoisted.js?q=4": "_astro/hoisted.BuAflv2B.js", "/astro/hoisted.js?q=6": "_astro/hoisted.D2uAbj8P.js", "/astro/hoisted.js?q=9": "_astro/hoisted.B5wi8Mb5.js", "astro:scripts/before-hydration.js": "" }, "inlinedScripts": [], "assets": ["/_astro/logo.Cb_mP9bA.svg", "/_astro/_diario_.1WEBGJSg.css", "/_astro/_issue_.Bkp5H6tf.css", "/_astro/_slug_.hddEW2pG.css", "/_astro/index.DvHZiE6C.css", "/_astro/sostienici.DZRfRPtH.css", "/_astro/index.DZeOmJJS.css", "/correlati.json", "/favicon.ico", "/favicon.png", "/favicon.svg", "/robots.txt", "/_redirects", "/admin/config.yml", "/fonts/raleway-latin.woff2", "/images/avatar-default.png", "/images/avatar-default.svg", "/images/dona1.webp", "/images/dona2.webp", "/images/dona3.webp", "/images/dona4.webp", "/images/dona7.webp", "/images/placeholder-copertina.svg", "/placeholder/ph-1.jpg", "/placeholder/ph-2.jpg", "/placeholder/ph-3.jpg", "/placeholder/ph-4.jpg", "/_astro/hoisted.B5wi8Mb5.js", "/_astro/hoisted.BFiuLOoW.js", "/_astro/hoisted.BK-QpP4l.js", "/_astro/hoisted.BuAflv2B.js", "/_astro/hoisted.Cdv6NXjL.js", "/_astro/hoisted.CIErU2gF.js", "/_astro/hoisted.CXOjeUv_.css", "/_astro/hoisted.D2uAbj8P.js", "/_astro/hoisted.D6fN33OZ.js", "/_astro/hoisted.e4Grq_nB.js", "/_astro/hoisted.xg5iX3wE.js", "/_worker.js/index.js", "/_worker.js/renderers.mjs", "/_worker.js/_@astrojs-ssr-adapter.mjs", "/_worker.js/_astro-internal_middleware.mjs", "/images/redazione/alessandro-de-simone.jpg", "/images/redazione/benedetta-mattei.png", "/images/redazione/claudio-cinus.jpg", "/images/redazione/cristina-tersigni.webp", "/images/redazione/don-marco-bove.jpg", "/images/redazione/enrica-riera.png", "/images/redazione/franco-manuzio.jpg", "/images/redazione/giovanni-grossi.png", "/images/redazione/giulia-galeotti.webp", "/images/redazione/laura-coccia.jpg", "/images/redazione/maria-teresa-mazzarotto.jpg", "/images/redazione/mariangela-bertolini.png", "/images/redazione/matteo-cinti.png", "/images/redazione/natalia-livi.jpg", "/images/redazione/nicla-bettazzi.jpg", "/images/redazione/nicole-schulthes.jpg", "/images/redazione/rita-massi.png", "/images/redazione/serena-sillitto.png", "/images/redazione/sergio-sciascia.jpg", "/images/redazione/silvia-camisasca.jpg", "/images/redazione/silvia-gusmani.jpg", "/_worker.js/chunks/AboutSidebar_BMo6rhTT.mjs", "/_worker.js/chunks/ArticleCard_Bg_X0yvL.mjs", "/_worker.js/chunks/astro-designed-error-pages_DfD573yd.mjs", "/_worker.js/chunks/astro_JL7pVawF.mjs", "/_worker.js/chunks/BaseLayout_koGK04oB.mjs", "/_worker.js/chunks/diari_DNXJk5VJ.mjs", "/_worker.js/chunks/directus_CErDsJ21.mjs", "/_worker.js/chunks/Footer_BwQ6jUbb.mjs", "/_worker.js/chunks/index_B-gW6nkE.mjs", "/_worker.js/chunks/IssueCard_Db5MfroW.mjs", "/_worker.js/chunks/noop-middleware_Chs5f3j2.mjs", "/_worker.js/chunks/ViewTransitions_Dvx2U5F3.mjs", "/_worker.js/pages/404.astro.mjs", "/_worker.js/pages/archivio.astro.mjs", "/_worker.js/pages/autori.astro.mjs", "/_worker.js/pages/cerca.astro.mjs", "/_worker.js/pages/chi-siamo.astro.mjs", "/_worker.js/pages/index.astro.mjs", "/_worker.js/pages/sostienici.astro.mjs", "/_worker.js/pages/test-lista.astro.mjs", "/_worker.js/pages/test-minimal.astro.mjs", "/_worker.js/pages/test-no-articles.astro.mjs", "/_worker.js/pages/test-status.astro.mjs", "/_worker.js/pages/_diario_.astro.mjs", "/_worker.js/pages/_image.astro.mjs", "/_worker.js/_astro/index.DvHZiE6C.css", "/_worker.js/_astro/index.DZeOmJJS.css", "/_worker.js/_astro/logo.Cb_mP9bA.svg", "/_worker.js/_astro/sostienici.DZRfRPtH.css", "/_worker.js/_astro/_diario_.1WEBGJSg.css", "/_worker.js/_astro/_issue_.Bkp5H6tf.css", "/_worker.js/_astro/_slug_.hddEW2pG.css", "/_worker.js/chunks/astro/env-setup_nxDOIah1.mjs", "/_worker.js/chunks/astro/server_CgTYz_Tl.mjs", "/_worker.js/pages/api/revalidate.astro.mjs", "/_worker.js/pages/archivio/web-only.astro.mjs", "/_worker.js/pages/archivio/_issue_.astro.mjs", "/_worker.js/pages/autori/_slug_.astro.mjs", "/_worker.js/pages/blog/en.astro.mjs", "/_worker.js/pages/blog/_---slug_.astro.mjs", "/_worker.js/pages/categoria/_categoria_.astro.mjs", "/_worker.js/pages/chi-siamo/collaboratori.astro.mjs", "/_worker.js/pages/chi-siamo/contatti.astro.mjs", "/_worker.js/pages/chi-siamo/hanno-scritto-per-noi.astro.mjs", "/_worker.js/pages/chi-siamo/la-redazione.astro.mjs", "/_worker.js/pages/chi-siamo/la-rivista.astro.mjs", "/_worker.js/pages/chi-siamo/redazione-storica.astro.mjs", "/_worker.js/pages/debug/audit-editoriale.astro.mjs", "/_worker.js/pages/sezioni/dialogo-aperto.astro.mjs", "/_worker.js/pages/sezioni/diari.astro.mjs", "/404.html", "/archivio/web-only/index.html", "/archivio/index.html", "/autori/index.html", "/blog/en/index.html", "/cerca/index.html", "/chi-siamo/collaboratori/index.html", "/chi-siamo/contatti/index.html", "/chi-siamo/hanno-scritto-per-noi/index.html", "/chi-siamo/la-redazione/index.html", "/chi-siamo/la-rivista/index.html", "/chi-siamo/redazione-storica/index.html", "/chi-siamo/index.html", "/debug/audit-editoriale/index.html", "/sezioni/dialogo-aperto/index.html", "/sezioni/diari/index.html", "/sostienici/index.html", "/test-lista/index.html", "/test-minimal/index.html", "/test-no-articles/index.html", "/test-status/index.html", "/index.html"], "buildFormat": "directory", "checkOrigin": false, "serverIslandNameMap": [], "key": "6VAUGogeXiStM9ez2KML3agU0CciABvPwma1yOSr1oE=", "experimentalEnvGetSecretEnabled": false });

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
//# sourceMappingURL=bundledWorker-0.11268505979380539.mjs.map
