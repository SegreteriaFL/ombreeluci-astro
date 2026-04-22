globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ request, locals }) => {
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
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
