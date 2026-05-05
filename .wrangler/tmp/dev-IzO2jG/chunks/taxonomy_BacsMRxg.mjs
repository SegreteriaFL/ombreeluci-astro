globalThis.process ??= {}; globalThis.process.env ??= {};
import { r as rubricheData } from './rubriche_BEVwGLjw.mjs';

const slugToTema = {
	famiglia: "Famiglia",
	spiritualita: "Spiritualità",
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
const temaToCategoria = {
	Famiglia: "Famiglia",
	"Spiritualità": "Spiritualità",
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
const megaclusterTemi = [
	"Famiglia",
	"Spiritualità",
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
const taxonomyData = {
	slugToTema: slugToTema,
	temaToCategoria: temaToCategoria,
	megaclusterTemi: megaclusterTemi
};

const categorie = [
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
		it: "Spiritualità",
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
const categorieData = {
	categorie: categorie
};

/**
 * Configurazione tassonomia: Megacluster (CSV post-iterazione 7.5) + Forma (tipo contenuto).
 * Ogni articolo è mappato per Forma (Intervista, Editoriale, ecc.) e per Tema del Megacluster.
 * Struttura navigazione (slug/temi): src/data/taxonomy_structure.json.
 * Campi per-articolo (tema_label, categoria_menu, ruolo_editoriale, forma): su Directus (migrati da _legacy_articoli_megacluster.json).
 *
 * Fase 0 i18n: categoria_menu in Directus è ora uno slug canonico (es. "spiritualita").
 * Usare getCategoriaLabel(slug, lang) per ottenere la label localizzata da src/data/categorie.json.
 * getMegaclusterForArticle() restituisce già la label tradotta in base a articolo.lang.
 */


const SLUG_TO_TEMA = taxonomyData.slugToTema;
const TEMA_TO_CATEGORIA = taxonomyData.temaToCategoria;
const MEGACLUSTER_TEMI = taxonomyData.megaclusterTemi;

// ── Lookup categorie i18n ─────────────────────────────────────────────────────
// Indice slug → { it, en } costruito da src/data/categorie.json.
// Lookup O(1) a build-time.
const SLUG_TO_LABELS = Object.fromEntries(
  categorieData.categorie.map((c) => [c.slug, { it: c.it, en: c.en }])
);
const NORMALIZED_LABEL_TO_SLUG = Object.fromEntries(
  categorieData.categorie.flatMap((c) => [
    [normalizeCategoriaKey(c.slug), c.slug],
    [normalizeCategoriaKey(c.it), c.slug],
    [normalizeCategoriaKey(c.en), c.slug],
  ])
);

function normalizeCategoriaKey(value) {
  if (!value) return '';
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Restituisce la label localizzata per uno slug di categoria.
 * Se lo slug non è riconosciuto (es. tema_label fallback), ritorna rawValue invariato.
 * @param {string|null|undefined} slugOrRaw  - slug canonico (es. "spiritualita") o valore raw legacy
 * @param {'it'|'en'} lang
 * @returns {string|null}
 */
function getCategoriaLabel(slugOrRaw, lang) {
  if (!slugOrRaw) return null;
  const direct = String(slugOrRaw).trim();
  const normalized = normalizeCategoriaKey(direct);
  const canonicalSlug = SLUG_TO_LABELS[direct]
    ? direct
    : NORMALIZED_LABEL_TO_SLUG[normalized];
  const entry = canonicalSlug ? SLUG_TO_LABELS[canonicalSlug] : null;
  if (!entry) return slugOrRaw;  // valore non riconosciuto → raw (backward compat)
  return entry[lang] ?? entry.it ?? slugOrRaw;
}

/** Fallback tipo formale */
const FORMAL_FALLBACK = 'Articolo';

/** Fallback tema quando articolo non in CSV */
const THEMATIC_FALLBACK = 'Attualità';

/**
 * Pesi gerarchia editoriale:
 * - portante: 4
 * - strutturale: 3
 * - laterale: 2
 * - trasversale: 1
 */
const EDITORIAL_WEIGHTS = {
  portante: 4,
  strutturale: 3,
  laterale: 2,
  trasversale: 1,
};

/**
 * Restituisce il peso numerico associato a un ruolo editoriale.
 * Ruoli sconosciuti o assenti restituiscono 0.
 * @param {string|null|undefined} role
 * @returns {number}
 */
function getRoleWeight(role) {
  if (!role) return 0;
  const key = String(role).toLowerCase();
  return EDITORIAL_WEIGHTS[key] ?? 0;
}

/**
 * Alias per label: le nuove 13 categorie hanno già nomi brevi, mappa 1:1.
 * Chiave = tema_label, valore = label da mostrare in menu e UI.
 */
const THEME_ALIASES = {
  'Famiglia': 'Famiglia',
  'Spiritualità': 'Spiritualità',
  'Catechesi': 'Catechesi',
  'Cultura': 'Cultura',
  'Fede e Luce': 'Fede e Luce',
  'Progetti': 'Progetti',
  'Salute': 'Salute',
  'Lavoro': 'Lavoro',
  'Scuola': 'Scuola',
  'Educazione e Formazione': 'Educazione',
  'Sport': 'Sport',
  'Tempo libero': 'Tempo libero',
  'Personaggi che ispirano': 'Personaggi',
};

/**
 * Restituisce la label da mostrare in menu/UI: alias se definito, altrimenti label completa.
 * @param {string} temaLabel - tema_label dal Megacluster
 * @returns {string}
 */
function getThemeDisplayName(temaLabel) {
  if (!temaLabel || typeof temaLabel !== 'string') return '';
  return THEME_ALIASES[temaLabel] ?? temaLabel;
}

// Normalizza stringa per confronto (lowercase, no accenti, no spazi extra)
function normalize(s) {
  if (typeof s !== 'string') return '';
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const TAG_TO_FORMAL = {
  intervista: 'Intervista',
  interview: 'Intervista',
  recensione: 'Recensione',
  review: 'Recensione',
  testimonianza: 'Testimonianza',
  testimony: 'Testimonianza',
  editoriale: 'Editoriale',
  editorial: 'Editoriale',
  editoriali: 'Editoriale',
  articolo: 'Articolo',
  article: 'Articolo',
};

/**
 * Restituisce tipo formale e tema. Legge forma e tema_label direttamente dall'oggetto articolo
 * (campi migrati da _legacy_articoli_megacluster.json a Directus).
 * @param {string[]|string} wp_tags - Array di tag o stringa singola (fallback per formal se forma assente)
 * @param {{ forma?: string|null, tema_label?: string|null, categoria_menu?: string|null }|null} articolo
 * @returns {{ formal: string, thematic: string }}
 */
function getLabels(wp_tags, articolo) {
  const tags = Array.isArray(wp_tags)
    ? wp_tags
    : wp_tags != null && typeof wp_tags === 'string'
      ? [wp_tags]
      : [];

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

/**
 * Restituisce tutti gli slug di categoria tematici (campo tema_label/categoria_menu).
 * Le rubriche (editoriali, interviste, testimonianze, recensioni, dialogo-aperto, diari)
 * sono ora in src/data/rubriche.json e non più in categorie.json.
 * @returns {string[]}
 */
function getAllCategorySlugs() {
  return Object.keys(SLUG_TO_TEMA);
}

/**
 * Dato lo slug dell'URL, restituisce { type, label, displayLabel } per filtrare e mostrare.
 * label = tema_label (per filtro articoli); displayLabel = categoria_menu (per titolo/menu).
 * @param {string} slug - slug dalla URL (lowercase)
 * @returns {{ type: 'thematic', label: string, displayLabel?: string } | null}
 */
function getCategoryBySlug(slug) {
  const s = (slug || '').toLowerCase().trim();
  if (SLUG_TO_TEMA[s]) {
    const temaLabel = SLUG_TO_TEMA[s];
    return {
      type: 'thematic',
      label: temaLabel,
      displayLabel: TEMA_TO_CATEGORIA[temaLabel] ?? temaLabel,
    };
  }
  return null;
}

/**
 * Dato il valore del campo `forma` (es. "Editoriale"), restituisce lo slug IT della rubrica.
 * Utile per costruire il link badge in pagina articolo.
 * @param {string|null|undefined} forma
 * @returns {string | null}
 */
function getFormaToRubricaSlug(forma) {
  if (!forma) return null;
  const r = rubricheData.find((r) => r.filtro === 'forma' && r.valore === forma);
  return r?.slug ?? null;
}

/**
 * Slug IT rubrica → slug nella lingua target.
 * @param {string} slugIT
 * @param {'it'|'en'} lang
 * @returns {string}
 */
function getRubricaUrlSlug(slugIT, lang) {
  const r = rubricheData.find((r) => r.slug === slugIT);
  if (!r) return slugIT;
  return r.en_slug;
}

/**
 * Restituisce tema_label, categoria_menu (label localizzata) e ruolo_editoriale.
 *
 * Fase 0 i18n: categoria_menu in Directus è uno slug canonico (es. "spiritualita").
 * Questa funzione lo traduce in label localizzata (es. "Spiritualità" IT / "Spirituality" EN)
 * tramite getCategoriaLabel(). Valori non riconosciuti come slug sono restituiti invariati
 * per backward compat (es. tema_label usato come fallback, valori legacy).
 *
 * @param {{ lang?: string|null, tema_label?: string|null, categoria_menu?: string|null, ruolo_editoriale?: string|null }|null} articolo
 * @returns {{ tema_label: string | null, categoria_menu: string | null, ruolo_editoriale: string | null }}
 */
function getMegaclusterForArticle(articolo) {
  const lang = articolo?.lang === 'en' ? 'en' : 'it';
  const rawCategoria = articolo?.categoria_menu ?? articolo?.tema_label ?? null;
  const categoriaLabel = rawCategoria ? getCategoriaLabel(rawCategoria, lang) : null;
  return {
    tema_label: articolo?.tema_label ?? null,
    categoria_menu: categoriaLabel,
    ruolo_editoriale: articolo?.ruolo_editoriale ?? null,
  };
}

/**
 * Label da mostrare per tema/categoria in UI, localizzata se articolo.lang === 'en'
 * (usa getMegaclusterForArticle → getCategoriaLabel).
 * @param {{ categoria_menu?: string|null, tema_label?: string|null, lang?: string|null }|null} articolo
 * @returns {string}
 */
function getThemeLabel(articolo) {
  if (!articolo) return THEMATIC_FALLBACK;
  const mc = getMegaclusterForArticle(articolo);
  if (mc.categoria_menu) return mc.categoria_menu;
  return articolo.tema_label || THEMATIC_FALLBACK;
}

/**
 * Slug della categoria/tema per link (/categoria/[slug]).
 * @param {{ tema_label?: string|null }|null} articolo
 * @returns {string | null}
 */
function getCategorySlugForArticle(articolo) {
  if (!articolo?.tema_label) return null;
  const slug = Object.keys(SLUG_TO_TEMA).find((s) => SLUG_TO_TEMA[s] === articolo.tema_label);
  return slug ?? slugifyLabel(articolo.tema_label);
}

/**
 * Restituisce i temi Megacluster con slug per menu e link (/categoria/[slug]).
 * nome = categoria_menu (alias già pronti da FINAL_V4).
 * @returns {{ nome: string, slug: string, nomeCompleto: string }[]}
 */
function getThemesWithSlugs() {
  return MEGACLUSTER_TEMI.map((temaLabel) => {
    const slug = Object.keys(SLUG_TO_TEMA).find((s) => SLUG_TO_TEMA[s] === temaLabel) || slugifyLabel(temaLabel);
    const nome = TEMA_TO_CATEGORIA[temaLabel] ?? getThemeDisplayName(temaLabel) ?? temaLabel;
    return { nome, slug, nomeCompleto: temaLabel };
  });
}

/**
 * IT slug (Directus) → URL slug per la lingua target.
 * Es: getCategoriaUrlSlug('famiglia', 'en') → 'family'
 * @param {string} slugIT - slug canonico IT (es. "famiglia")
 * @param {'it'|'en'} lang
 * @returns {string}
 */
function getCategoriaUrlSlug(slugIT, lang) {
  const cat = categorieData.categorie.find((c) => c.slug === slugIT);
  if (!cat) return slugIT;
  if (lang === 'en') return cat.en_slug ?? slugIT;
  return slugIT;
}

/**
 * URL slug per lingua → slug IT canonico (Directus).
 * Es: getCategoriaSlugIT('family', 'en') → 'famiglia'
 * @param {string} slugLang - slug come appare nell'URL
 * @param {'it'|'en'} lang
 * @returns {string}
 */
function getCategoriaSlugIT(slugLang, lang) {
  {
    const cat = categorieData.categorie.find((c) => c.en_slug === slugLang);
    return cat?.slug ?? slugLang;
  }
}

function slugifyLabel(label) {
  return String(label)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export { getLabels as a, getRoleWeight as b, getThemesWithSlugs as c, getCategoriaUrlSlug as d, getCategoriaSlugIT as e, getThemeLabel as f, getMegaclusterForArticle as g, getCategorySlugForArticle as h, getFormaToRubricaSlug as i, getRubricaUrlSlug as j, getCategoriaLabel as k, getCategoryBySlug as l, getAllCategorySlugs as m };
