globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../renderers.mjs';

const prerender = false;
const CMS = "https://cms-unreachable-test.ombreeluci.it";
async function checkDirectus() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5e3);
  try {
    const res = await fetch(`${CMS}/server/ping`, { signal: controller.signal });
    if (!res.ok) return "down";
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
    if (!res.ok) return "error";
    const json = await res.json();
    const count = parseInt(json.data?.[0]?.count?.id ?? "0", 10);
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
    if (!res.ok) return "error";
    const json = await res.json();
    const idNumero = json.data?.[0]?.id_numero;
    return idNumero ? `ok:${idNumero}` : "missing";
  } catch {
    return "error";
  } finally {
    clearTimeout(timer);
  }
}
const GET = async () => {
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
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
