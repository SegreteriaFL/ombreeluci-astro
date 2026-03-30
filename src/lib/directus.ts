/**
 * src/lib/directus.ts
 *
 * Layer di accesso dati per Directus.
 * Tutte le pagine importano da qui — nessuna chiamata fetch diretta nelle pagine.
 */

const DIRECTUS_URL: string = import.meta.env.DIRECTUS_URL ?? 'http://159.69.196.64:8055';
const DIRECTUS_TOKEN: string = import.meta.env.DIRECTUS_TOKEN ?? '';

export function getImageUrl(fileId: string): string {
  return `https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev/copertine/${fileId}`;
}

export function getAutoreImageUrl(fileId: string): string {
  return `https://pub-2251dc2142e3492a961f629f2af543d0.r2.dev/autori/${fileId}`;
}

/**
 * URL copertina del numero rivista: campo Directus `copertina_url` (immagine su R2).
 * Ritorna null se non impostato (es. prima del backfill).
 */
export function getNumeroImageUrl(numero: { copertina_url?: string | null }): string | null {
  const u = numero.copertina_url?.trim();
  return u || null;
}

/** Copertina articolo assente o non caricabile: asset statico in `public/`. */
export const PLACEHOLDER_COPERTINA = '/images/placeholder-copertina.svg';

export function getArticoloCopertinaSrc(articolo: {
  immagine_copertina?: { id: string } | null;
}): string | null {
  const raw = articolo?.immagine_copertina?.id;
  const id = typeof raw === 'string' ? raw.trim() : '';
  if (!id) return null;
  return getImageUrl(id);
}

/** Handler `onerror` per `<img>` copertina: fallback se l’URL R2 non risponde. */
export const COPERTINA_IMG_ONERROR =
  "this.onerror=null;this.src='/images/placeholder-copertina.svg'";

// ── Tipi ──────────────────────────────────────────────────────────────────────

export interface AutoreRef {
  id: string;
  slug: string;
  nome_completo: string;
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
  categoria_menu: string | null;
  ruolo_editoriale: string | null;
  forma: string | null;
  tema_label: string | null;
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
  foto: FileRef | null;
  /** Articoli pubblicati con questo autore (da aggregazione Directus). */
  articoli_count?: number;
}

export interface NumeroRivista {
  id: string;
  id_numero: string;
  display_title: string;
  anno_pubblicazione: number | null;
  tipo: string | null;
  descrizione: string | null;
  pdf_archive_url: string | null;
  wp_url: string | null;
  /** URL assoluto copertina (R2 `numeri/{wp_id}.jpg`), non la M2O `copertina`. */
  copertina_url: string | null;
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function directusFetch<T>(path: string): Promise<T | null> {
  const url = `${DIRECTUS_URL}${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`,
        'Content-Type': 'application/json',
      },
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
  'categoria_menu', 'ruolo_editoriale', 'forma', 'tema_label',
  'corpo', 'has_comments', 'original_url',
  'autore.id', 'autore.slug', 'autore.nome_completo',
  'autore.bio_html', 'autore.foto.id', 'autore.foto.filename_download',
  'numero_rivista.id', 'numero_rivista.id_numero', 'numero_rivista.display_title',
  'numero_rivista.anno_pubblicazione', 'numero_rivista.pdf_archive_url', 'numero_rivista.copertina_url',
  'immagine_copertina.id', 'immagine_copertina.filename_download',
  'temi.temi_id.id', 'temi.temi_id.slug', 'temi.temi_id.nome',
  'tags.tags_id.id', 'tags.tags_id.slug', 'tags.tags_id.nome',
  'serie.id', 'serie.slug', 'serie.nome',
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
export async function getArticoloBySlug(slug: string): Promise<ArticoloFull | null> {
  const params = new URLSearchParams({
    'filter[slug][_eq]': slug,
    'filter[stato][_eq]': 'published',
    fields: [
      '*',
      'autore.id', 'autore.slug', 'autore.nome_completo',
      'autore.bio_html', 'autore.foto.id', 'autore.foto.filename_download',
      'numero_rivista.id', 'numero_rivista.id_numero', 'numero_rivista.display_title',
      'numero_rivista.anno_pubblicazione', 'numero_rivista.copertina_url',
      'serie.id', 'serie.slug', 'serie.nome',
      'immagine_copertina.id', 'immagine_copertina.filename_download',
      'temi.temi_id.id', 'temi.temi_id.slug', 'temi.temi_id.nome',
      'tags.tags_id.id', 'tags.tags_id.slug', 'tags.tags_id.nome',
      'articolo_traduzione.id', 'articolo_traduzione.slug', 'articolo_traduzione.lang',
    ].join(','),
    limit: '1',
  });
  const data = await directusFetch<{ data: ArticoloFull[] }>(
    `/items/articoli?${params}`
  );
  if (!data || !data.data?.length) return null;
  return data.data[0];
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
  const [countByAutore, authorsRes] = await Promise.all([
    getArticoliCountByAutoreId(),
    directusFetch<{ data: Autore[] }>(
      '/items/autori?fields=id,slug,nome_completo,bio_html,foto.id,foto.filename_download&limit=-1&sort=nome_completo'
    ),
  ]);
  if (!authorsRes?.data) return [];
  return authorsRes.data.map((a) => ({
    ...a,
    articoli_count: countByAutore.get(a.id) ?? 0,
  }));
}

/**
 * Autore singolo per slug.
 */
export async function getAutoreBySlug(slug: string): Promise<Autore | null> {
  const params = new URLSearchParams({
    'filter[slug][_eq]': slug,
    fields: 'id,slug,nome_completo,bio_html,foto.id,foto.filename_download',
    limit: '1',
  });
  const data = await directusFetch<{ data: Autore[] }>(`/items/autori?${params}`);
  if (!data || !data.data?.length) return null;
  return data.data[0];
}

/**
 * Tutti i numeri rivista.
 */
export async function getAllNumeriRivista(): Promise<NumeroRivista[]> {
  const data = await directusFetch<{ data: NumeroRivista[] }>(
    '/items/numeri_rivista?fields=id,id_numero,display_title,anno_pubblicazione,tipo,descrizione,pdf_archive_url,wp_url,copertina_url&limit=-1&sort=anno_pubblicazione'
  );
  if (!data) return [];
  return data.data ?? [];
}

/**
 * Numero rivista singolo per id_numero (es. "OEL-172").
 */
export async function getNumeroRivistaById(idNumero: string): Promise<NumeroRivista | null> {
  const params = new URLSearchParams({
    'filter[id_numero][_eq]': idNumero,
    fields: 'id,id_numero,display_title,anno_pubblicazione,tipo,descrizione,pdf_archive_url,wp_url,copertina_url',
    limit: '1',
  });
  const data = await directusFetch<{ data: NumeroRivista[] }>(
    `/items/numeri_rivista?${params}`
  );
  if (!data || !data.data?.length) return null;
  return data.data[0];
}

/**
 * Articoli per numero rivista (id_numero).
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
export async function getCategoriaDescrizione(slug: string): Promise<{ nome: string; descrizione: string | null } | null> {
  const data = await directusFetch<{ data: { slug: string; nome: string; descrizione: string | null } }>(
    `/items/categorie/${encodeURIComponent(slug)}?fields=slug,nome,descrizione`
  );
  if (!data) return null;
  return (data as any).data ?? null;
}
