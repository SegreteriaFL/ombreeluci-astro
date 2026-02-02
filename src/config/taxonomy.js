/**
 * Configurazione tassonomia: Megacluster (CSV post-iterazione 7.5) + Forma (tipo contenuto).
 * Ogni articolo è mappato per Forma (Intervista, Editoriale, ecc.) e per Tema del Megacluster.
 * Sorgente primaria temi: src/data/articoli_megacluster.json (generato da FINAL_V3 CSV).
 */

import megaclusterData from '../data/articoli_megacluster.json';

const {
  byId: MEGACLUSTER_BY_ID,
  temiUnici: MEGACLUSTER_TEMI,
  slugToTema: SLUG_TO_TEMA,
  temaToCategoria: TEMA_TO_CATEGORIA = {},
} = megaclusterData;

/** Macro-tipologie di contenuto (approccio formale) */
export const FORMAL_TYPES = [
  'Articolo',
  'Intervista',
  'Recensione',
  'Testimonianza',
  'Editoriale',
];

/** Fallback tipo formale */
export const FORMAL_FALLBACK = 'Articolo';

/** Fallback tema quando articolo non in CSV */
export const THEMATIC_FALLBACK = 'Attualità';

/**
 * Alias per label lunghe: nome breve da usare in menu e UI.
 * Chiave = tema_label completo, valore = label accorciata.
 */
export const THEME_ALIASES = {
  'Fede, Chiesa e spiritualità della fragilità': 'Spiritualità',
  'Memoria e storia di Fede e Luce (opzionale)': 'Storia Fede e Luce',
  'Dignità, valore della persona e sguardo sulla fragilità': 'Dignità e fragilità',
  'Pellegrinaggi, cammini e vita comunitaria in movimento': 'Pellegrinaggi e cammini',
  'Progetto di vita, autonomia e dopo di noi': 'Progetto di vita',
  'Linguaggio, cultura e rappresentazioni': 'Cultura e linguaggio',
  'Educare e crescere insieme': 'Educazione',
  'Giovani, futuro, speranza e cambiamento': 'Giovani e futuro',
  'Comunità, accoglienza e inclusione': 'Comunità',
  'Corpo, salute, cura e assistenza': 'Salute e cura',
  'Diritti, cittadinanza e società': 'Diritti e società',
  'Amicizia e relazioni autentiche': 'Relazioni',
  'Famiglie, genitori, fratelli': 'Famiglie',
  'Cinema e disabilità': 'Cinema',
  'Vivere la disabilità': 'Disabilità',
  'Riflessioni': 'Riflessioni',
  'Domande aperte': 'Riflessioni',
};

/**
 * Restituisce la label da mostrare in menu/UI: alias se definito, altrimenti label completa.
 * @param {string} temaLabel - tema_label dal Megacluster
 * @returns {string}
 */
export function getThemeDisplayName(temaLabel) {
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
 * Restituisce tipo formale e tema (Megacluster). Se wp_id è fornito e presente nel CSV (FINAL_V5),
 * formal viene da categoria_formale (forma) e thematic da categoria_menu/tema_label.
 * @param {string[]|string} wp_tags - Array di tag o stringa singola (fallback per formal se assente in CSV)
 * @param {number|string} [wp_id] - id_articolo WordPress per lookup tema e forma da Megacluster
 * @returns {{ formal: string, thematic: string }}
 */
export function getLabels(wp_tags, wp_id) {
  const tags = Array.isArray(wp_tags)
    ? wp_tags
    : wp_tags != null && typeof wp_tags === 'string'
      ? [wp_tags]
      : [];

  let formal = FORMAL_FALLBACK;
  const id = wp_id != null ? String(wp_id) : '';
  if (id && MEGACLUSTER_BY_ID[id]?.forma) {
    formal = MEGACLUSTER_BY_ID[id].forma;
  } else {
    for (const tag of tags) {
      const n = normalize(tag);
      if (n && TAG_TO_FORMAL[n]) {
        formal = TAG_TO_FORMAL[n];
        break;
      }
    }
  }

  let thematic = THEMATIC_FALLBACK;
  if (id && MEGACLUSTER_BY_ID[id]) {
    thematic = MEGACLUSTER_BY_ID[id].categoria_menu || MEGACLUSTER_BY_ID[id].tema_label || THEMATIC_FALLBACK;
  }

  return { formal, thematic };
}

/**
 * Restituisce la lista completa dei temi del Megacluster (per rotte /categoria/[slug]).
 * @returns {string[]}
 */
export function getAllThemes() {
  return [...MEGACLUSTER_TEMI];
}

/**
 * Restituisce tutti gli slug di categoria: temi Megacluster (slug) + forme (interviste, recensioni, ...).
 * @returns {string[]}
 */
export function getAllCategorySlugs() {
  const temaSlugs = Object.keys(SLUG_TO_TEMA);
  const formalSlugs = ['interviste', 'recensioni', 'testimonianze', 'editoriali'];
  return [...temaSlugs, ...formalSlugs];
}

const SLUG_TO_FORMAL = {
  interviste: 'Intervista',
  recensioni: 'Recensione',
  testimonianze: 'Testimonianza',
  editoriali: 'Editoriale',
};

/**
 * Dato lo slug dell'URL, restituisce { type, label, displayLabel } per filtrare e mostrare.
 * label = tema_label (per filtro articoli); displayLabel = categoria_menu (per titolo/menu).
 * @param {string} slug - slug dalla URL (lowercase)
 * @returns {{ type: 'thematic'|'formal', label: string, displayLabel?: string } | null}
 */
export function getCategoryBySlug(slug) {
  const s = (slug || '').toLowerCase().trim();
  if (SLUG_TO_TEMA[s]) {
    const temaLabel = SLUG_TO_TEMA[s];
    return {
      type: 'thematic',
      label: temaLabel,
      displayLabel: TEMA_TO_CATEGORIA[temaLabel] ?? temaLabel,
    };
  }
  if (SLUG_TO_FORMAL[s]) {
    return { type: 'formal', label: SLUG_TO_FORMAL[s] };
  }
  return null;
}

/**
 * Dato wp_id, restituisce tema_label, categoria_menu e ruolo_editoriale dal Megacluster (se presenti).
 * categoria_menu è la label da usare in UI (alias / short).
 * @param {number|string} wp_id
 * @returns {{ tema_label: string | null, categoria_menu: string | null, ruolo_editoriale: string | null }}
 */
export function getMegaclusterForArticle(wp_id) {
  const id = wp_id != null ? String(wp_id) : '';
  const row = id ? MEGACLUSTER_BY_ID[id] : null;
  return {
    tema_label: row?.tema_label ?? null,
    categoria_menu: row?.categoria_menu ?? row?.tema_label ?? null,
    ruolo_editoriale: row?.ruolo_editoriale ?? null,
  };
}

/**
 * Label da mostrare per tema/categoria: priorità a categoria_menu (alias).
 * @param {number|string} wp_id
 * @returns {string}
 */
export function getThemeLabel(wp_id) {
  const id = wp_id != null ? String(wp_id) : '';
  const row = id ? MEGACLUSTER_BY_ID[id] : null;
  if (!row) return THEMATIC_FALLBACK;
  return row.categoria_menu || row.tema_label || THEMATIC_FALLBACK;
}

/**
 * Slug della categoria/tema per link (/categoria/[slug]).
 * @param {number|string} wp_id
 * @returns {string | null}
 */
export function getCategorySlugForArticle(wp_id) {
  const id = wp_id != null ? String(wp_id) : '';
  const row = id ? MEGACLUSTER_BY_ID[id] : null;
  if (!row?.tema_label) return null;
  const slug = Object.keys(SLUG_TO_TEMA).find((s) => SLUG_TO_TEMA[s] === row.tema_label);
  return slug ?? slugifyLabel(row.tema_label);
}

/**
 * Restituisce i temi Megacluster con slug per menu e link (/categoria/[slug]).
 * nome = categoria_menu (alias già pronti da FINAL_V4).
 * @returns {{ nome: string, slug: string, nomeCompleto: string }[]}
 */
export function getThemesWithSlugs() {
  return MEGACLUSTER_TEMI.map((temaLabel) => {
    const slug = Object.keys(SLUG_TO_TEMA).find((s) => SLUG_TO_TEMA[s] === temaLabel) || slugifyLabel(temaLabel);
    const nome = TEMA_TO_CATEGORIA[temaLabel] ?? getThemeDisplayName(temaLabel) ?? temaLabel;
    return { nome, slug, nomeCompleto: temaLabel };
  });
}

function slugifyLabel(label) {
  return String(label)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
