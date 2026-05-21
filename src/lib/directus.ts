/**
 * src/lib/directus.ts
 *
 * Layer di accesso dati per Directus.
 * Tutte le pagine importano da qui — nessuna chiamata fetch diretta nelle pagine.
 */

/** URL raggiungibile da Cloudflare edge (evitare IP privato/non instradato). */
const DEFAULT_DIRECTUS_PUBLIC = 'https://cms.ombreeluci.it';

function readEnvString(key: 'DIRECTUS_URL' | 'DIRECTUS_TOKEN'): string {
  const fromImportMeta = (import.meta.env?.[key] as string | undefined)?.trim();
  if (fromImportMeta) return fromImportMeta;
  const fromProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    ?.process?.env?.[key]?.trim();
  if (fromProcess) return fromProcess;
  return '';
}

const DIRECTUS_URL: string = readEnvString('DIRECTUS_URL') || DEFAULT_DIRECTUS_PUBLIC;
const DIRECTUS_TOKEN: string = readEnvString('DIRECTUS_TOKEN');

/** Override per SSR su CF Pages: token/URL da `locals.runtime.env`, non solo vite define (build). */
export type DirectusRuntimeCreds = { url?: string; token?: string };

function resolveCreds(creds?: DirectusRuntimeCreds): { url: string; token: string } {
  const rawUrl = creds?.url?.trim() || DIRECTUS_URL || DEFAULT_DIRECTUS_PUBLIC;
  const url = rawUrl.replace(/\/$/, '');
  const token = creds?.token?.trim() || DIRECTUS_TOKEN;
  return { url, token };
}

/** CF Pages / Workers: leggi env runtime (non baked da Vite al build). */
export function directusCredsFromAstroLocals(locals: unknown): DirectusRuntimeCreds | undefined {
  const r = locals as
    | {
        runtime?: { env?: Record<string, string | undefined> };
        locals?: { runtime?: { env?: Record<string, string | undefined> } };
        env?: Record<string, string | undefined>;
      }
    | null;
  const env = r?.runtime?.env ?? r?.locals?.runtime?.env ?? r?.env;
  if (!env) return undefined;
  const o: DirectusRuntimeCreds = {};
  if (typeof env.DIRECTUS_URL === 'string' && env.DIRECTUS_URL.trim()) o.url = env.DIRECTUS_URL.trim();
  if (typeof env.DIRECTUS_TOKEN === 'string' && env.DIRECTUS_TOKEN.trim()) o.token = env.DIRECTUS_TOKEN.trim();
  return Object.keys(o).length ? o : undefined;
}

/**
 * URL pubblico file Directus (`directus_files.id`).
 * Accetta parametri opzionali di trasformazione immagine Directus:
 * width, height, fit (cover|contain|fill|inside|outside), format (webp|jpg|png), quality (0-100).
 */
export function getDirectusAssetUrl(
  fileId: string,
  transforms?: { width?: number; height?: number; fit?: string; format?: string; quality?: number }
): string {
  const id = String(fileId || '').trim();
  const base = DIRECTUS_URL.replace(/\/$/, '');
  const url = `${base}/assets/${encodeURIComponent(id)}`;
  if (!transforms) return url;
  const params = new URLSearchParams();
  if (transforms.width)   params.set('width',   String(transforms.width));
  if (transforms.height)  params.set('height',  String(transforms.height));
  if (transforms.fit)     params.set('fit',     transforms.fit);
  if (transforms.format)  params.set('format',  transforms.format);
  if (transforms.quality) params.set('quality', String(transforms.quality));
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/** @deprecated Preferisci getDirectusAssetUrl; mantenuto come alias per compatibilità. */
export function getImageUrl(fileId: string): string {
  return getDirectusAssetUrl(fileId);
}

/** Foto autore: ottimizzata WebP 200x200 per thumbnail/avatar. */
export function getAutoreImageUrl(fileId: string): string {
  return getDirectusAssetUrl(fileId, { width: 200, height: 200, fit: 'cover', format: 'webp', quality: 80 });
}

/** Foto autore in fascia diario (molto piccola, 96x96 @2x): ulteriore ottimizzazione. */
export function getAutoreFotoFasciaUrl(fileId: string): string {
  return getDirectusAssetUrl(fileId, { width: 96, height: 96, fit: 'cover', format: 'webp', quality: 80 });
}

/**
 * URL copertina del numero rivista.
 * Priorità: campo M2O `copertina` (Directus files) → `copertina_url` stringa legacy.
 * I nuovi numeri usano il campo file; i 172 numeri esistenti restano sul legacy URL.
 */
export function getNumeroImageUrl(numero: { copertina?: string | null; copertina_url?: string | null }): string | null {
  if (numero.copertina) return `${DIRECTUS_URL}/assets/${numero.copertina}`;
  const u = numero.copertina_url?.trim();
  return u || null;
}

/** Copertina articolo assente o non caricabile: asset statico in `public/`. */
export const PLACEHOLDER_COPERTINA = '/images/placeholder-copertina.svg';

/**
 * Copertina articolo ottimizzata WebP.
 * width default 800 (card); passare 1200 per hero/header, 400 per thumbnail piccoli.
 */
export function getArticoloCopertinaSrc(
  articolo: { immagine_copertina?: { id: string } | null },
  width = 800
): string | null {
  const raw = articolo?.immagine_copertina?.id;
  const id = typeof raw === 'string' ? raw.trim() : '';
  if (!id) return null;
  return getDirectusAssetUrl(id, { width, fit: 'cover', format: 'webp', quality: 82 });
}

/** Handler `onerror` per `<img>` copertina: fallback se l’URL R2 non risponde. */
export const COPERTINA_IMG_ONERROR =
  "this.onerror=null;this.src='/images/placeholder-copertina.svg'";

// ── Tipi ──────────────────────────────────────────────────────────────────────

export interface AutoreRef {
  id: string;
  slug: string;
  nome_completo: string;
  bio_en?: string | null;
  bio_html?: string | null;
}

export interface NumeroRivistaRef {
  id: string;
  id_numero: string;
  display_title: string;
  anno_pubblicazione: number | null;
  pdf_archive_url: string | null;
  copertina_url?: string | null;
}

export interface SerieRef {
  id: string;
  slug: string;
  nome: string;
  descrizione: string | null;
  descrizione_en: string | null;
}

export interface FileRef {
  id: string;
  filename_download: string;
}

export interface TemaRef {
  id: string;
  slug: string;
  nome: string;
}

export interface TagRef {
  id: string;
  slug: string;
  nome: string;
}

export interface ArticoloListItem {
  id: string;
  wp_id: number;
  slug: string;
  lang: 'it' | 'en';
  titolo: string;
  sottotitolo: string | null;
  stato: 'draft' | 'published';
  data_pubblicazione: string | null;
  autore: AutoreRef | null;
  numero_rivista: NumeroRivistaRef | null;
  immagine_copertina: FileRef | null;
  cluster_id: number | null;
  umap_x: number | null;
  umap_y: number | null;
  umap_z: number | null;
  seo_title: string | null;
  seo_description: string | null;
  didascalia_copertina: string | null;
  didascalia_en: string | null;
  categoria_menu: string | null;
  categoria_menu_2: string | null;
  ruolo_editoriale: string | null;
  in_evidenza: boolean | null;
  forma: string | null;
  temi: Array<{ temi_id: TemaRef }>;
  tags: Array<{ tags_id: TagRef }>;
}

export interface ArticoloFull extends ArticoloListItem {
  corpo: string | null;
  original_url: string | null;
  has_comments: boolean;
  serie: SerieRef | null;
  articolo_traduzione: { id: string; slug: string; lang: string } | null;
}

export interface Autore {
  id: string;
  slug: string;
  nome_completo: string;
  bio_html: string | null;
  bio_en: string | null;
  foto: FileRef | null;
  /** Articoli pubblicati con questo autore (da aggregazione Directus). */
  articoli_count?: number;
}

export interface NumeroRivista {
  id: string;
  id_numero: string;
  display_title: string;
  anno_pubblicazione: number | null;
  /** 'oel' per Ombre e Luci, 'ins' per Insieme. */
  tipo: string | null;
  descrizione: string | null;
  pdf_archive_url: string | null;
  wp_url: string | null;
  /** UUID del file copertina (M2O → directus_files). Campo preferito per nuovi numeri. */
  copertina: string | null;
  /** URL stringa legacy (R2 o WP). Fallback per i numeri precedenti all'M2O. */
  copertina_url: string | null;
  /** Es. "Ottobre – Dicembre". */
  periodo_label: string | null;
  /** Titolo tematico del numero (es. "Paradigma Pompei"). */
  titolo_tema: string | null;
  /** Numero progressivo della rivista (es. 173). */
  numero_progressivo: number | null;
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function directusFetch<T>(path: string, creds?: DirectusRuntimeCreds): Promise<T | null> {
  const { url: base, token } = resolveCreds(creds);
  const url = `${base}${path}`;
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    // Do not send an empty bearer token: Directus treats it as invalid credentials (401).
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, {
      headers,
    });
    if (!res.ok) {
      console.error(`[directus] ${res.status} ${res.statusText} — ${url}`);
      return null;
    }
    const json = await res.json();
    return json as T;
  } catch (err) {
    console.error(`[directus] Fetch error — ${url}:`, err);
    return null;
  }
}

// ── Campi list (completi, incluso corpo — per getStaticPaths senza chiamate per-articolo) ──

const ARTICOLO_LIST_FIELDS = [
  'id', 'wp_id', 'slug', 'lang', 'titolo', 'sottotitolo', 'stato',
  'data_pubblicazione', 'cluster_id', 'umap_x', 'umap_y', 'umap_z',
  'seo_title', 'seo_description',
  'categoria_menu', 'categoria_menu_2', 'ruolo_editoriale', 'in_evidenza', 'forma',
  'corpo', 'has_comments', 'original_url',
  'autore.id', 'autore.slug', 'autore.nome_completo',
  'autore.bio_html', 'autore.foto.id', 'autore.foto.filename_download',
  'numero_rivista.id', 'numero_rivista.id_numero', 'numero_rivista.display_title',
  'numero_rivista.anno_pubblicazione', 'numero_rivista.pdf_archive_url', 'numero_rivista.copertina_url',
  'immagine_copertina.id', 'immagine_copertina.filename_download',
  'didascalia_copertina',
  'temi.temi_id.id', 'temi.temi_id.slug', 'temi.temi_id.nome',
  'tags.tags_id.id', 'tags.tags_id.slug', 'tags.tags_id.nome',
  'serie.id', 'serie.slug', 'serie.nome', 'serie.descrizione', 'serie.descrizione_en',
  'articolo_traduzione.id', 'articolo_traduzione.slug', 'articolo_traduzione.lang',
].join(',');

// ── Funzioni pubbliche ────────────────────────────────────────────────────────

/**
 * Tutti gli articoli pubblicati, campi completi incluso corpo (per getStaticPaths senza chiamate per-articolo).
 */
export async function getAllArticoli(): Promise<ArticoloFull[]> {
  const params = new URLSearchParams({
    'filter[stato][_eq]': 'published',
    fields: ARTICOLO_LIST_FIELDS,
    limit: '-1',
    sort: 'data_pubblicazione',
  });
  const data = await directusFetch<{ data: ArticoloFull[] }>(
    `/items/articoli?${params}`
  );
  if (!data) {
    console.error('[directus] getAllArticoli: risposta nulla');
    return [];
  }
  return data.data ?? [];
}

/**
 * Articolo singolo completo per slug.
 */
export async function getArticoloBySlug(
  slug: string,
  creds?: DirectusRuntimeCreds
): Promise<ArticoloFull | null> {
  const slugClean = String(slug || '').replace(/\/$/, '');
  const params = new URLSearchParams({
    'filter[slug][_eq]': slugClean,
    'filter[stato][_eq]': 'published',
    fields: [
      '*',
      'autore.id', 'autore.slug', 'autore.nome_completo',
      'autore.bio_html', 'autore.bio_en', 'autore.foto.id', 'autore.foto.filename_download',
      'numero_rivista.id', 'numero_rivista.id_numero', 'numero_rivista.display_title',
      'numero_rivista.anno_pubblicazione', 'numero_rivista.copertina_url',
      'serie.id', 'serie.slug', 'serie.nome', 'serie.descrizione', 'serie.descrizione_en',
      'immagine_copertina.id', 'immagine_copertina.filename_download',
      'temi.temi_id.id', 'temi.temi_id.slug', 'temi.temi_id.nome',
      'tags.tags_id.id', 'tags.tags_id.slug', 'tags.tags_id.nome',
      'articolo_traduzione.id', 'articolo_traduzione.slug', 'articolo_traduzione.lang',
    ].join(','),
    limit: '1',
  });
  const data = await directusFetch<{ data: ArticoloFull[] }>(
    `/items/articoli?${params}`,
    creds
  );
  if (!data || !data.data?.length) return null;
  return data.data[0];
}

/**
 * Recupera più articoli per slug (per correlati in SSR).
 * Ritorna solo i campi necessari per ArticleCard + LeggiAnche.
 */
export async function getArticoliBySlugList(slugs: string[], creds?: DirectusRuntimeCreds): Promise<ArticoloListItem[]> {
  if (!slugs.length) return [];
  const params = new URLSearchParams({
    'filter[slug][_in]': slugs.join(','),
    'filter[stato][_eq]': 'published',
    fields: [
      'id', 'wp_id', 'slug', 'lang', 'titolo', 'sottotitolo', 'stato',
      'data_pubblicazione', 'categoria_menu', 'ruolo_editoriale', 'forma',
      'seo_description',
      'autore.id', 'autore.slug', 'autore.nome_completo',
      'numero_rivista.id', 'numero_rivista.id_numero', 'numero_rivista.display_title',
      'immagine_copertina.id', 'immagine_copertina.filename_download',
    ].join(','),
    limit: String(slugs.length),
  });
  const data = await directusFetch<{ data: ArticoloListItem[] }>(
    `/items/articoli?${params}`,
    creds
  );
  return data?.data ?? [];
}

/**
 * Dato un elenco di slug IT (da correlati.json), restituisce gli articoli EN
 * che sono traduzione di quegli articoli IT. Usato come fallback per correlati
 * su pagine EN quando correlati.json è indicizzato per slug IT.
 */
export async function getArticoliEnByItSlugs(itSlugs: string[], creds?: DirectusRuntimeCreds): Promise<ArticoloListItem[]> {
  if (!itSlugs.length) return [];
  const params = new URLSearchParams({
    'filter[articolo_traduzione][slug][_in]': itSlugs.join(','),
    'filter[lang][_eq]': 'en',
    'filter[stato][_eq]': 'published',
    fields: [
      'id', 'wp_id', 'slug', 'lang', 'titolo', 'sottotitolo', 'stato',
      'data_pubblicazione', 'categoria_menu', 'ruolo_editoriale', 'forma',
      'seo_description',
      'autore.id', 'autore.slug', 'autore.nome_completo',
      'numero_rivista.id', 'numero_rivista.id_numero', 'numero_rivista.display_title',
      'immagine_copertina.id', 'immagine_copertina.filename_download',
    ].join(','),
    limit: String(itSlugs.length),
  });
  const data = await directusFetch<{ data: ArticoloListItem[] }>(`/items/articoli?${params}`, creds);
  return data?.data ?? [];
}

/**
 * Fallback correlati: articoli recenti stessa lingua (opz. stessa categoria_menu).
 * Usato quando manca la mappa in correlati.json per uno slug.
 */
export async function getFallbackRelatedArticles(
  {
    excludeSlug,
    lang,
    categoriaMenu,
    limit = 4,
  }: {
    excludeSlug: string;
    lang: 'it' | 'en';
    categoriaMenu?: string | null;
    limit?: number;
  },
  creds?: DirectusRuntimeCreds
): Promise<ArticoloListItem[]> {
  const params = new URLSearchParams({
    'filter[stato][_eq]': 'published',
    'filter[slug][_neq]': excludeSlug,
    'filter[lang][_eq]': lang,
    fields: ARTICOLO_LIST_FIELDS,
    limit: String(limit),
    sort: '-data_pubblicazione',
  });
  if (categoriaMenu) {
    params.set('filter[categoria_menu][_eq]', categoriaMenu);
  }
  const data = await directusFetch<{ data: ArticoloListItem[] }>(
    `/items/articoli?${params}`,
    creds
  );
  return data?.data ?? [];
}

/**
 * Articolo singolo per wp_id (utile per redirect legacy).
 */
export async function getArticoloByWpId(wpId: number): Promise<ArticoloListItem | null> {
  const params = new URLSearchParams({
    'filter[wp_id][_eq]': String(wpId),
    'filter[stato][_eq]': 'published',
    fields: ARTICOLO_LIST_FIELDS,
    limit: '1',
  });
  const data = await directusFetch<{ data: ArticoloListItem[] }>(
    `/items/articoli?${params}`
  );
  if (!data || !data.data?.length) return null;
  return data.data[0];
}

/** Righe aggregate: count articoli pubblicati per UUID autore. */
interface AutoreArticoliAggregateRow {
  autore: string;
  count: { id: string };
}

async function getArticoliCountByAutoreId(): Promise<Map<string, number>> {
  const params = new URLSearchParams({
    'filter[stato][_eq]': 'published',
    'filter[autore][_nnull]': 'true',
    'filter[lang][_eq]': 'it',
    'aggregate[count]': 'id',
    limit: '-1',
  });
  params.append('groupBy[]', 'autore');
  const data = await directusFetch<{ data: AutoreArticoliAggregateRow[] }>(
    `/items/articoli?${params}`
  );
  const map = new Map<string, number>();
  if (!data?.data?.length) return map;
  for (const row of data.data) {
    const n = parseInt(String(row.count?.id ?? '0'), 10) || 0;
    map.set(row.autore, n);
  }
  return map;
}

/**
 * Tutti gli autori, con `articoli_count` (articoli pubblicati) da aggregazione Directus.
 */
export async function getAllAutori(): Promise<Autore[]> {
  try {
    const [countByAutore, authorsRes] = await Promise.all([
      getArticoliCountByAutoreId(),
      directusFetch<{ data: Autore[] }>(
        '/items/autori?fields=id,slug,nome_completo,bio_html,bio_en,foto.id,foto.filename_download&limit=-1&sort=nome_completo'
      ),
    ]);
    if (!authorsRes?.data) return [];
    return authorsRes.data.map((a) => ({
      ...a,
      articoli_count: countByAutore.get(a.id) ?? 0,
    }));
  } catch (e) {
    console.warn('[directus] getAllAutori fallback: []', e);
    return [];
  }
}

/**
 * Autore singolo per slug.
 */
export async function getAutoreBySlug(slug: string): Promise<Autore | null> {
  const params = new URLSearchParams({
    'filter[slug][_eq]': slug,
    fields: 'id,slug,nome_completo,bio_html,bio_en,foto.id,foto.filename_download',
    limit: '1',
  });
  const data = await directusFetch<{ data: Autore[] }>(`/items/autori?${params}`);
  if (!data || !data.data?.length) return null;
  return data.data[0];
}

/**
 * Articoli pubblicati di un autore (per slug autore), ordinati per data desc.
 * Usare in pagine SSR per evitare stale data da snapshot.
 */
export async function getArticoliByAutoreSlug(autoreSlug: string, lang: 'it' | 'en'): Promise<ArticoloFull[]> {
  const params = new URLSearchParams({
    'filter[stato][_eq]': 'published',
    'filter[autore][slug][_eq]': autoreSlug,
    'filter[lang][_eq]': lang,
    fields: ARTICOLO_LIST_FIELDS,
    limit: '-1',
    'sort[]': '-data_pubblicazione',
  });
  const data = await directusFetch<{ data: ArticoloFull[] }>(`/items/articoli?${params}`);
  return data?.data ?? [];
}

/**
 * Tutti i numeri rivista.
 */
const NUMERO_FIELDS = 'id,id_numero,display_title,titolo_tema,numero_progressivo,anno_pubblicazione,tipo,descrizione,pdf_archive_url,wp_url,copertina,copertina_url,periodo_label';

export async function getAllNumeriRivista(): Promise<NumeroRivista[]> {
  try {
    const data = await directusFetch<{ data: NumeroRivista[] }>(
      `/items/numeri_rivista?fields=${NUMERO_FIELDS}&limit=-1&sort=anno_pubblicazione`
    );
    if (!data) return [];
    return data.data ?? [];
  } catch (e) {
    console.warn('[directus] getAllNumeriRivista fallback: []', e);
    return [];
  }
}

export async function getUltimoNumeroRivista(): Promise<NumeroRivista | null> {
  const data = await directusFetch<{ data: NumeroRivista[] }>(
    `/items/numeri_rivista?fields=${NUMERO_FIELDS}&filter[tipo][_eq]=oel&sort[]=-anno_pubblicazione&sort[]=-numero_progressivo&limit=1`
  );
  return data?.data?.[0] ?? null;
}

/**
 * Numero rivista singolo per id_numero (es. "OEL-172").
 */
export async function getNumeroRivistaById(idNumero: string): Promise<NumeroRivista | null> {
  const params = new URLSearchParams({
    'filter[id_numero][_eq]': idNumero,
    fields: NUMERO_FIELDS,
    limit: '1',
  });
  const data = await directusFetch<{ data: NumeroRivista[] }>(
    `/items/numeri_rivista?${params}`
  );
  if (!data || !data.data?.length) return null;
  return data.data[0];
}

/**
 * Articoli per numero rivista tramite UUID interno del record.
 * Usare questo nelle pagine SSR: non richiede permessi su campi relazionali.
 */
export async function getArticoliByNumeroId(numeroId: string): Promise<ArticoloListItem[]> {
  const params = new URLSearchParams({
    'filter[numero_rivista][_eq]': numeroId,
    'filter[stato][_eq]': 'published',
    fields: ARTICOLO_LIST_FIELDS,
    limit: '-1',
    sort: '-data_pubblicazione',
  });
  const data = await directusFetch<{ data: ArticoloListItem[] }>(
    `/items/articoli?${params}`
  );
  return data?.data ?? [];
}

/**
 * Articoli per numero rivista (id_numero).
 * @deprecated Preferire getArticoliByNumeroId() nelle pagine SSR.
 */
export async function getArticoliByNumero(idNumero: string): Promise<ArticoloListItem[]> {
  const params = new URLSearchParams({
    'filter[numero_rivista.id_numero][_eq]': idNumero,
    'filter[stato][_eq]': 'published',
    fields: ARTICOLO_LIST_FIELDS,
    limit: '-1',
    sort: 'data_pubblicazione',
  });
  const data = await directusFetch<{ data: ArticoloListItem[] }>(
    `/items/articoli?${params}`
  );
  if (!data) return [];
  return data.data ?? [];
}

/**
 * Articoli per autore (slug).
 */
export async function getArticoliByAutore(autoreSlug: string): Promise<ArticoloListItem[]> {
  const params = new URLSearchParams({
    'filter[autore.slug][_eq]': autoreSlug,
    'filter[stato][_eq]': 'published',
    fields: ARTICOLO_LIST_FIELDS,
    limit: '-1',
    sort: '-data_pubblicazione',
  });
  const data = await directusFetch<{ data: ArticoloListItem[] }>(
    `/items/articoli?${params}`
  );
  if (!data) return [];
  return data.data ?? [];
}

/**
 * Descrizione editoriale di una categoria/sezione/forma per slug.
 * La redazione edita queste descrizioni direttamente da Directus → Categorie.
 */
export async function getSerieBySlug(slug: string): Promise<SerieRef | null> {
  const data = await directusFetch<{ data: SerieRef[] }>(
    `/items/serie?filter[slug][_eq]=${encodeURIComponent(slug)}&fields=id,slug,nome,descrizione,descrizione_en&limit=1`
  );
  return (data as any)?.data?.[0] ?? null;
}

export async function getAllSerieDiari(): Promise<SerieRef[]> {
  try {
    const data = await directusFetch<{ data: SerieRef[] }>(
      `/items/serie?filter[slug][_starts_with]=diario-di&fields=id,slug,nome,descrizione,descrizione_en&limit=50`
    );
    return (data as any)?.data ?? [];
  } catch (e) {
    console.warn('[directus] getAllSerieDiari fallback: []', e);
    return [];
  }
}

export async function getCategoriaDescrizione(slug: string): Promise<{ nome: string; descrizione: string | null } | null> {
  const data = await directusFetch<{ data: { slug: string; nome: string; descrizione: string | null } }>(
    `/items/categorie/${encodeURIComponent(slug)}?fields=slug,nome,descrizione`
  );
  if (!data) return null;
  return (data as any).data ?? null;
}

/**
 * Articoli in evidenza per una categoria.
 * EVIDENZA-RECENTI: seleziona automaticamente i 4 più recenti tra quelli
 * con in_evidenza = true e categoria_menu (o categoria_menu_2) = slug.
 * Ordinati per data_pubblicazione decrescente.
 */
export async function getArticoliInEvidenza(categoriaSlug: string): Promise<ArticoloListItem[]> {
  const fields = [
    'id', 'titolo', 'slug', 'sottotitolo', 'data_pubblicazione', 'forma',
    'categoria_menu', 'categoria_menu_2', 'ruolo_editoriale', 'in_evidenza',
    'immagine_copertina.id', 'immagine_copertina.filename_download',
    'numero_rivista.id_numero',
    'autore.nome_completo', 'autore.slug'
  ].join(',');

  // Filter: in_evidenza = true AND (categoria_menu OR categoria_menu_2 = slug)
  const params = new URLSearchParams({
    'filter[stato][_eq]': 'published',
    'filter[in_evidenza][_eq]': 'true',
    'filter[_or][0][categoria_menu][_eq]': categoriaSlug,
    'filter[_or][1][categoria_menu_2][_eq]': categoriaSlug,
    fields,
    sort: '-data_pubblicazione',
    limit: '4'
  });

  const data = await directusFetch<{ data: ArticoloListItem[] }>(
    `/items/articoli?${params}`
  );
  return data?.data ?? [];
}

// ── Commenti ──────────────────────────────────────────────────────────────────

export interface Commento {
  id: string;
  autore_nome: string;
  testo: string;
  data_creazione: string;
}

export async function getCommentiForArticolo(
  articoloId: string,
  creds?: DirectusRuntimeCreds
): Promise<Commento[]> {
  const params = new URLSearchParams({
    'filter[articolo][_eq]': articoloId,
    'filter[stato][_eq]': 'approved',
    'sort': 'data_creazione',
    'fields': 'id,autore_nome,testo,data_creazione',
    'limit': '200',
  });
  const data = await directusFetch<{ data: Commento[] }>(
    `/items/commenti?${params}`,
    creds
  );
  return data?.data ?? [];
}

/**
 * Tag per slug.
 */
export async function getTagBySlug(
  tagSlug: string,
  creds?: DirectusRuntimeCreds
): Promise<TagRef | null> {
  const params = new URLSearchParams({
    'filter[slug][_eq]': tagSlug,
    fields: 'id,slug,nome',
    limit: '1',
  });
  const data = await directusFetch<{ data: TagRef[] }>(`/items/tags?${params}`, creds);
  if (!data?.data?.length) return null;
  return data.data[0];
}

/**
 * Articoli pubblicati con un determinato tag (per slug).
 * Ritorna ArticoloFull[] ordinati per data_pubblicazione decrescente.
 */
/**
 * Articoli pubblicati per categoria_menu slug, opzionalmente filtrati per lingua.
 */
export async function getArticoliByCategoria(
  categoriaSlug: string,
  lang?: 'it' | 'en',
  creds?: DirectusRuntimeCreds
): Promise<ArticoloFull[]> {
  const params = new URLSearchParams({
    'filter[stato][_eq]': 'published',
    'filter[_or][0][categoria_menu][_eq]': categoriaSlug,
    'filter[_or][1][categoria_menu_2][_eq]': categoriaSlug,
    fields: ARTICOLO_LIST_FIELDS,
    limit: '-1',
    sort: '-data_pubblicazione',
  });
  if (lang) params.set('filter[lang][_eq]', lang);
  const data = await directusFetch<{ data: ArticoloFull[] }>(
    `/items/articoli?${params}`,
    creds
  );
  return data?.data ?? [];
}

/**
 * Articoli pubblicati per valore del campo `forma` (es. "Editoriale", "Dialogo Aperto").
 * URLSearchParams encode automaticamente lo spazio in "Dialogo Aperto" → "Dialogo%20Aperto".
 */
export async function getArticoliByForma(
  forma: string,
  lang: 'it' | 'en',
  creds?: DirectusRuntimeCreds
): Promise<ArticoloFull[]> {
  const params = new URLSearchParams({
    'filter[stato][_eq]': 'published',
    'filter[forma][_eq]': forma,
    'filter[lang][_eq]': lang,
    fields: ARTICOLO_LIST_FIELDS,
    limit: '-1',
    sort: '-data_pubblicazione',
  });
  const data = await directusFetch<{ data: ArticoloFull[] }>(
    `/items/articoli?${params}`,
    creds
  );
  return data?.data ?? [];
}

export async function getArticoliByTag(
  tagSlug: string,
  creds?: DirectusRuntimeCreds
): Promise<ArticoloFull[]> {
  const params = new URLSearchParams({
    'filter[stato][_eq]': 'published',
    'filter[tags][tags_id][slug][_eq]': tagSlug,
    fields: ARTICOLO_LIST_FIELDS,
    limit: '-1',
    sort: '-data_pubblicazione',
  });
  const data = await directusFetch<{ data: ArticoloFull[] }>(
    `/items/articoli?${params}`,
    creds
  );
  return data?.data ?? [];
}

export async function getArticoliEN(
  creds?: DirectusRuntimeCreds,
  limit = 500
): Promise<ArticoloFull[]> {
  const params = new URLSearchParams({
    'filter[stato][_eq]': 'published',
    'filter[lang][_eq]': 'en',
    fields: ARTICOLO_LIST_FIELDS,
    limit: String(limit),
    sort: '-data_pubblicazione',
  });
  const data = await directusFetch<{ data: ArticoloFull[] }>(
    `/items/articoli?${params}`,
    creds
  );
  return data?.data ?? [];
}

// ── Verticali ─────────────────────────────────────────────────────────────────

export interface VerticaleBloccoArticolo {
  id: string;
  slug: string;
  titolo: string;
  sottotitolo?: string | null;
  data_pubblicazione: string;
  immagine_copertina?: { id: string } | null;
  autore?: { nome_completo: string; slug: string } | null;
  categoria_menu?: string | null;
  categoria_menu_2?: string | null;
  forma?: string | null;
}

export interface VerticaleBlocco {
  id: number;
  tipo: 'testo' | 'articoli';
  ordine: number;
  titolo_sezione?: string | null;
  titolo_sezione_en?: string | null;
  testo?: string | null;
  testo_en?: string | null;
  immagine?: { id: string } | null;
  layout_immagine?: 'nessuna' | 'sfondo' | 'laterale-dx' | 'laterale-sx' | null;
  articoli?: { articolo_id: VerticaleBloccoArticolo }[];
}

export interface Verticale {
  id: number;
  slug: string;
  slug_en: string;
  titolo: string;
  titolo_en?: string | null;
  seo_description?: string | null;
  seo_description_en?: string | null;
  tema_visivo: 'chiaro' | 'scuro' | 'caldo' | 'magazine';
  hero_immagine?: string | null;
  hero_video_url?: string | null;
  intro?: string | null;
  intro_en?: string | null;
  testo_coda?: string | null;
  testo_coda_en?: string | null;
  pubblicato: boolean;
  sezioni?: VerticaleBlocco[];
}

const VERTICALE_FIELDS = [
  'id', 'slug', 'slug_en', 'titolo', 'titolo_en',
  'seo_description', 'seo_description_en',
  'tema_visivo', 'hero_immagine', 'hero_video_url',
  'intro', 'intro_en', 'testo_coda', 'testo_coda_en', 'pubblicato',
  'sezioni.id', 'sezioni.tipo', 'sezioni.ordine',
  'sezioni.titolo_sezione', 'sezioni.titolo_sezione_en',
  'sezioni.testo', 'sezioni.testo_en',
  'sezioni.immagine.id', 'sezioni.layout_immagine',
  'sezioni.articoli.articolo_id.id',
  'sezioni.articoli.articolo_id.slug',
  'sezioni.articoli.articolo_id.titolo',
  'sezioni.articoli.articolo_id.sottotitolo',
  'sezioni.articoli.articolo_id.data_pubblicazione',
  'sezioni.articoli.articolo_id.immagine_copertina.id',
  'sezioni.articoli.articolo_id.autore.nome_completo',
  'sezioni.articoli.articolo_id.autore.slug',
  'sezioni.articoli.articolo_id.categoria_menu',
  'sezioni.articoli.articolo_id.forma',
].join(',');

/** Lista di tutte le verticali pubblicate (per getStaticPaths). */
export async function getVerticali(creds?: DirectusRuntimeCreds): Promise<Verticale[]> {
  const params = new URLSearchParams({
    'filter[pubblicato][_eq]': 'true',
    fields: VERTICALE_FIELDS,
    'sort': 'slug',
    limit: '50',
  });
  const data = await directusFetch<{ data: Verticale[] }>(
    `/items/verticali?${params}`,
    creds
  );
  const rows = data?.data ?? [];
  return rows.map(normalizeVerticale);
}

/** Singola verticale per slug IT. */
export async function getVerticaleBySlug(
  slug: string,
  creds?: DirectusRuntimeCreds
): Promise<Verticale | null> {
  const params = new URLSearchParams({
    'filter[slug][_eq]': slug,
    'filter[pubblicato][_eq]': 'true',
    fields: VERTICALE_FIELDS,
    limit: '1',
  });
  const data = await directusFetch<{ data: Verticale[] }>(
    `/items/verticali?${params}`,
    creds
  );
  const v = data?.data?.[0];
  return v ? normalizeVerticale(v) : null;
}

/** Singola verticale per slug EN. */
export async function getVerticaleBySlugEN(
  slugEn: string,
  creds?: DirectusRuntimeCreds
): Promise<Verticale | null> {
  const params = new URLSearchParams({
    'filter[slug_en][_eq]': slugEn,
    'filter[pubblicato][_eq]': 'true',
    fields: VERTICALE_FIELDS,
    limit: '1',
  });
  const data = await directusFetch<{ data: Verticale[] }>(
    `/items/verticali?${params}`,
    creds
  );
  const v = data?.data?.[0];
  return v ? normalizeVerticale(v) : null;
}

function normalizeVerticale(v: Verticale): Verticale {
  return {
    ...v,
    sezioni: (v.sezioni ?? [])
      .sort((a, b) => (a.ordine ?? 0) - (b.ordine ?? 0)),
  };
}

// ── Contenuti Statici ─────────────────────────────────────────────────────────

export interface ContenutoStatico {
  chiave: string;
  valore_it: string | null;
  valore_en: string | null;
  tipo: 'testo' | 'paragrafo' | 'html';
  gruppo: string;
  ordine: number | null;
}

/**
 * Recupera tutti i contenuti statici, opzionalmente filtrati per gruppo.
 * Ritorna un dizionario chiave → record per accesso O(1).
 */
export async function getContenutiStatici(
  gruppo?: string,
  creds?: DirectusRuntimeCreds
): Promise<Record<string, ContenutoStatico>> {
  try {
    const params = new URLSearchParams({
      'fields[]': 'chiave,valore_it,valore_en,tipo,gruppo,ordine',
      'limit': '-1',
    });
    if (gruppo) {
      params.set('filter[gruppo][_eq]', gruppo);
    }
    const data = await directusFetch<{ data: ContenutoStatico[] }>(
      `/items/contenuti_statici?${params}`,
      creds
    );
    return Object.fromEntries(
      (data?.data ?? []).map((c: ContenutoStatico) => [c.chiave, c])
    );
  } catch (e) {
    console.warn('[directus] getContenutiStatici fallback: {}', e);
    return {};
  }
}

/**
 * Helper per leggere un contenuto statico con fallback.
 * @param contenuti - dizionario da getContenutiStatici()
 * @param chiave - chiave del contenuto
 * @param lang - lingua ('it' o 'en')
 * @param fallback - valore di fallback se il contenuto non esiste
 */
export function getCS(
  contenuti: Record<string, ContenutoStatico>,
  chiave: string,
  lang: 'it' | 'en',
  fallback = ''
): string {
  const c = contenuti[chiave];
  if (!c) return fallback;
  return (lang === 'en' ? c.valore_en : c.valore_it) ?? c.valore_it ?? fallback;
}
