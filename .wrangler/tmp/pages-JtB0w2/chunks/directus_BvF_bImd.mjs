globalThis.process ??= {}; globalThis.process.env ??= {};
const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "DIRECTUS_TOKEN": "ebgg-l6cPyahbgUOloDgmUteOvOOw7NH", "DIRECTUS_URL": "https://cms.ombreeluci.it", "MEDIA_BASE_URL": "https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev", "MODE": "production", "PROD": true, "PUBLIC_ALGOLIA_APP_ID": "1BM5L8XRYW", "PUBLIC_ALGOLIA_SEARCH_KEY": "af13f70e8d751ead7da2b227c062d456", "PUBLIC_KEYSTATIC_GITHUB_APP_SLUG": "keystatic-ombreeluci", "SITE": "https://ombreeluci.it", "SSR": true};
var define_globalThis_process_env_default = {};
const DEFAULT_DIRECTUS_PUBLIC = "https://cms.ombreeluci.it";
function readEnvString(key) {
  const fromImportMeta = Object.assign(__vite_import_meta_env__, { DIRECTUS_URL: process.env.DIRECTUS_URL, DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN, PUBLIC: process.env.PUBLIC, _: process.env._ })?.[key]?.trim();
  if (fromImportMeta) return fromImportMeta;
  const fromProcess = define_globalThis_process_env_default?.[key]?.trim();
  if (fromProcess) return fromProcess;
  return "";
}
const DIRECTUS_URL = readEnvString("DIRECTUS_URL") || DEFAULT_DIRECTUS_PUBLIC;
const DIRECTUS_TOKEN = readEnvString("DIRECTUS_TOKEN");
function resolveCreds(creds) {
  const rawUrl = creds?.url?.trim() || DIRECTUS_URL || DEFAULT_DIRECTUS_PUBLIC;
  const url = rawUrl.replace(/\/$/, "");
  const token = creds?.token?.trim() || DIRECTUS_TOKEN;
  return { url, token };
}
function directusCredsFromAstroLocals(locals) {
  const r = locals;
  const env = r?.runtime?.env ?? r?.locals?.runtime?.env ?? r?.env;
  if (!env) return void 0;
  const o = {};
  if (typeof env.DIRECTUS_URL === "string" && env.DIRECTUS_URL.trim()) o.url = env.DIRECTUS_URL.trim();
  if (typeof env.DIRECTUS_TOKEN === "string" && env.DIRECTUS_TOKEN.trim()) o.token = env.DIRECTUS_TOKEN.trim();
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
  if (numero.copertina) return `${DIRECTUS_URL}/assets/${numero.copertina}`;
  const u = numero.copertina_url?.trim();
  return u || null;
}
const PLACEHOLDER_COPERTINA = "/images/placeholder-copertina.svg";
function getArticoloCopertinaSrc(articolo) {
  const raw = articolo?.immagine_copertina?.id;
  const id = typeof raw === "string" ? raw.trim() : "";
  if (!id) return null;
  return getImageUrl(id);
}
const COPERTINA_IMG_ONERROR = "this.onerror=null;this.src='/images/placeholder-copertina.svg'";
async function directusFetch(path, creds) {
  const { url: base, token } = resolveCreds(creds);
  const url = `${base}${path}`;
  try {
    const headers = {
      "Content-Type": "application/json"
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, {
      headers
    });
    if (!res.ok) {
      console.error(`[directus] ${res.status} ${res.statusText} — ${url}`);
      return null;
    }
    const json = await res.json();
    return json;
  } catch (err) {
    console.error(`[directus] Fetch error — ${url}:`, err);
    return null;
  }
}
const ARTICOLO_LIST_FIELDS = [
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
  if (!data || !data.data?.length) return null;
  return data.data[0];
}
async function getArticoliBySlugList(slugs, creds) {
  if (!slugs.length) return [];
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
  if (!data?.data?.length) return map;
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
      "/items/autori?fields=id,slug,nome_completo,bio_html,bio_en,foto.id,foto.filename_download&limit=-1&sort=nome_completo"
    )
  ]);
  if (!authorsRes?.data) return [];
  return authorsRes.data.map((a) => ({
    ...a,
    articoli_count: countByAutore.get(a.id) ?? 0
  }));
}
const NUMERO_FIELDS = "id,id_numero,display_title,titolo_tema,numero_progressivo,anno_pubblicazione,tipo,descrizione,pdf_archive_url,wp_url,copertina,copertina_url,periodo_label";
async function getAllNumeriRivista() {
  const data = await directusFetch(
    `/items/numeri_rivista?fields=${NUMERO_FIELDS}&limit=-1&sort=anno_pubblicazione`
  );
  if (!data) return [];
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
async function getCategoriaDescrizione(slug) {
  const data = await directusFetch(
    `/items/categorie/${encodeURIComponent(slug)}?fields=slug,nome,descrizione`
  );
  if (!data) return null;
  return data.data ?? null;
}
async function getArticoliInEvidenza(categoriaSlug) {
  const fields = [
    "articoli_id.id",
    "articoli_id.titolo",
    "articoli_id.slug",
    "articoli_id.sottotitolo",
    "articoli_id.data_pubblicazione",
    "articoli_id.forma",
    "articoli_id.tema_label",
    "articoli_id.categoria_menu",
    "articoli_id.ruolo_editoriale",
    "articoli_id.immagine_copertina",
    "articoli_id.numero_rivista.id_numero",
    "articoli_id.autore.nome_completo",
    "sort"
  ].join(",");
  const params = new URLSearchParams({
    "filter[categorie_slug][_eq]": categoriaSlug,
    fields,
    sort: "sort",
    limit: "5"
  });
  const data = await directusFetch(
    `/items/categorie_articoli?${params}`
  );
  if (!data) return [];
  return (data.data ?? []).map((r) => r.articoli_id).filter(Boolean);
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
  if (!data?.data?.length) return null;
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
const VERTICALE_FIELDS = [
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
async function getVerticali(creds) {
  const params = new URLSearchParams({
    "filter[pubblicato][_eq]": "true",
    fields: VERTICALE_FIELDS,
    "sort": "slug",
    limit: "50"
  });
  const data = await directusFetch(
    `/items/verticali?${params}`,
    creds
  );
  const rows = data?.data ?? [];
  return rows.map(normalizeVerticale);
}
function normalizeVerticale(v) {
  return {
    ...v,
    sezioni: (v.sezioni ?? []).sort((a, b) => (a.ordine ?? 0) - (b.ordine ?? 0))
  };
}

export { COPERTINA_IMG_ONERROR as C, PLACEHOLDER_COPERTINA as P, getAutoreImageUrl as a, getArticoloCopertinaSrc as b, getDirectusAssetUrl as c, getAllArticoli as d, getAllNumeriRivista as e, getArticoliByNumeroId as f, getNumeroImageUrl as g, getAllAutori as h, directusCredsFromAstroLocals as i, getArticoliByCategoria as j, getVerticali as k, getCategoriaDescrizione as l, getArticoliByForma as m, getTagBySlug as n, getArticoliByTag as o, getArticoloBySlug as p, getArticoliBySlugList as q, getFallbackRelatedArticles as r, getArticoliInEvidenza as s, getCommentiForArticolo as t };
