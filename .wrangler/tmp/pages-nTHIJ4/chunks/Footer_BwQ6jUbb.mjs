globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro, d as renderComponent } from './astro/server_CgTYz_Tl.mjs';
/* empty css                            */

const logo = new Proxy({"src":"/_astro/logo.Cb_mP9bA.svg","width":300,"height":80,"format":"svg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/berto/Documents/Ombreeluci/src/assets/logo.svg";
							}
							
							return target[name];
						}
					});

const id_numero = "OEL-172";
const copertina_url = "https://www.ombreeluci.it/wp-content/uploads/2025/12/Copertina_OeL_172_2025.jpg";
const titolo_numero = "Paradigma Pompei";
const numero_progressivo = 172;
const anno_pubblicazione = 2025;
const periodo_label = "Ottobre – Novembre";
const ultimoNumeroData = {
	id_numero: id_numero,
	copertina_url: copertina_url,
	titolo_numero: titolo_numero,
	numero_progressivo: numero_progressivo,
	anno_pubblicazione: anno_pubblicazione,
	periodo_label: periodo_label
};

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

/**
 * Configurazione tassonomia: Megacluster (CSV post-iterazione 7.5) + Forma (tipo contenuto).
 * Ogni articolo è mappato per Forma (Intervista, Editoriale, ecc.) e per Tema del Megacluster.
 * Struttura navigazione (slug/temi): src/data/taxonomy_structure.json.
 * Campi per-articolo (tema_label, categoria_menu, ruolo_editoriale, forma): su Directus (migrati da _legacy_articoli_megacluster.json).
 */


const SLUG_TO_TEMA = taxonomyData.slugToTema;
const TEMA_TO_CATEGORIA = taxonomyData.temaToCategoria;
const MEGACLUSTER_TEMI = taxonomyData.megaclusterTemi;

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
 * Restituisce tutti gli slug di categoria: temi Megacluster (slug) + forme (interviste, recensioni, ...).
 * @returns {string[]}
 */
function getAllCategorySlugs() {
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
  if (SLUG_TO_FORMAL[s]) {
    return { type: 'formal', label: SLUG_TO_FORMAL[s] };
  }
  return null;
}

/**
 * Dato un articolo Directus, restituisce tema_label, categoria_menu e ruolo_editoriale.
 * Legge i campi direttamente dall'oggetto articolo (migrati da _legacy_articoli_megacluster.json).
 * @param {{ tema_label?: string|null, categoria_menu?: string|null, ruolo_editoriale?: string|null }|null} articolo
 * @returns {{ tema_label: string | null, categoria_menu: string | null, ruolo_editoriale: string | null }}
 */
function getMegaclusterForArticle(articolo) {
  return {
    tema_label: articolo?.tema_label ?? null,
    categoria_menu: articolo?.categoria_menu ?? articolo?.tema_label ?? null,
    ruolo_editoriale: articolo?.ruolo_editoriale ?? null,
  };
}

/**
 * Label da mostrare per tema/categoria: priorità a categoria_menu (alias).
 * @param {{ categoria_menu?: string|null, tema_label?: string|null }|null} articolo
 * @returns {string}
 */
function getThemeLabel(articolo) {
  if (!articolo) return THEMATIC_FALLBACK;
  return articolo.categoria_menu || articolo.tema_label || THEMATIC_FALLBACK;
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

function slugifyLabel(label) {
  return String(label)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const translations = {
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
    nav_menu: "Menù",
    nav_menu_open: "Apri menu",
    nav_menu_close: "Chiudi menu",
    nav_themes: "Temi",
    nav_sections: "Sezioni",
    nav_editorial_tools: "Strumenti redazione",
    nav_audit_editorial: "Audit gerarchia editoriale",
    nav_last_issue: "Ultimo Numero",
    nav_support: "Sostieni Ombre e Luci →",
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
    nav_support: "Support Ombre e Luci →",
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
function getLangFromUrl(pathname) {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (p.startsWith("/en") || p.startsWith("/blog/en") || p.includes("/en/")) return "en";
  return "it";
}
function t(locale, key) {
  const dict = translations[locale];
  return dict[key] ?? translations.it[key] ?? key;
}

const $$Astro$2 = createAstro();
const $$LanguageSelector = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$LanguageSelector;
  const { pathname, alternateArticleUrl = null } = Astro2.props;
  const lang = getLangFromUrl(pathname);
  const hrefIt = lang === "en" && alternateArticleUrl ? alternateArticleUrl : "/";
  const hrefEn = lang === "it" && alternateArticleUrl ? alternateArticleUrl : "/blog/en";
  return renderTemplate`${maybeRenderHead()}<div class="lang-selector" aria-label="Selezione lingua" data-astro-cid-ltpqzwiw> <a${addAttribute(hrefIt, "href")}${addAttribute(["lang-link", [lang === "it" && "is-active"]], "class:list")} data-astro-cid-ltpqzwiw>IT</a> <span class="lang-sep" aria-hidden="true" data-astro-cid-ltpqzwiw>|</span> <a${addAttribute(hrefEn, "href")}${addAttribute(["lang-link", [lang === "en" && "is-active"]], "class:list")} data-astro-cid-ltpqzwiw>EN</a> </div>  `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/LanguageSelector.astro", void 0);

const $$Astro$1 = createAstro();
const $$Header = createComponent(($$result, $$props, $$slots) => {
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
  return renderTemplate`${maybeRenderHead()}<header class="header" id="site-header" data-astro-transition-persist="site-header" data-pagefind-ignore data-astro-cid-3ef6ksr2> <div class="header-bar" data-astro-cid-3ef6ksr2> <div class="header-inner" data-astro-cid-3ef6ksr2> <a href="/" class="logo-link" aria-label="Ombre e Luci - Home" data-astro-cid-3ef6ksr2> <img${addAttribute(logo.src, "src")} alt="Ombre e Luci" class="logo" data-astro-cid-3ef6ksr2> </a> <form class="search-form" action="/cerca" method="get"${addAttribute(t(lang, "search_label"), "aria-label")} data-astro-cid-3ef6ksr2> <label for="header-search" class="search-label" data-astro-cid-3ef6ksr2>${t(lang, "search_label")}</label> <input id="header-search" type="search" name="q"${addAttribute(t(lang, "search_placeholder"), "placeholder")} class="search-input"${addAttribute(t(lang, "search_label"), "aria-label")} data-astro-cid-3ef6ksr2> <button type="submit" class="search-button"${addAttribute(t(lang, "search_label"), "aria-label")} data-astro-cid-3ef6ksr2> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-3ef6ksr2> <circle cx="11" cy="11" r="8" data-astro-cid-3ef6ksr2></circle> <path d="m21 21-4.35-4.35" data-astro-cid-3ef6ksr2></path> </svg> </button> </form> <div class="header-end" data-astro-cid-3ef6ksr2> ${renderComponent($$result, "LanguageSelector", $$LanguageSelector, { "pathname": pathname, "alternateArticleUrl": alternateArticleUrl, "data-astro-cid-3ef6ksr2": true })} <nav class="header-nav" aria-label="Servizi e utilità" data-astro-cid-3ef6ksr2> <a href="/chi-siamo" class="header-link" data-astro-cid-3ef6ksr2>${t(lang, "nav_about")}</a> <a href="/#newsletter" class="header-link" data-astro-cid-3ef6ksr2>${t(lang, "nav_newsletter")}</a> </nav> <button type="button" class="mobile-search-btn" id="mobile-search-btn" aria-label="Cerca" aria-expanded="false" aria-controls="mobile-search-overlay" data-astro-cid-3ef6ksr2> <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-3ef6ksr2> <circle cx="11" cy="11" r="8" data-astro-cid-3ef6ksr2></circle> <path d="m21 21-4.35-4.35" data-astro-cid-3ef6ksr2></path> </svg> </button> <a href="/sostienici" class="header-cta" data-astro-cid-3ef6ksr2>${t(lang, "nav_contribute")}</a> <button type="button" class="menu-trigger" id="menu-trigger"${addAttribute(t(lang, "nav_menu_open"), "aria-label")} aria-expanded="false" aria-controls="mega-menu"${addAttribute(t(lang, "nav_menu_open"), "data-label-open")}${addAttribute(t(lang, "nav_menu_close"), "data-label-close")} data-astro-cid-3ef6ksr2> <span class="menu-trigger-icon" aria-hidden="true" data-astro-cid-3ef6ksr2> <span class="hamburger-line" data-astro-cid-3ef6ksr2></span> <span class="hamburger-line" data-astro-cid-3ef6ksr2></span> <span class="hamburger-line" data-astro-cid-3ef6ksr2></span> </span> <span class="menu-trigger-close" aria-hidden="true" data-astro-cid-3ef6ksr2> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" data-astro-cid-3ef6ksr2> <path d="M18 6 6 18M6 6l12 12" data-astro-cid-3ef6ksr2></path> </svg> </span> <span class="menu-trigger-label" data-astro-cid-3ef6ksr2>${t(lang, "nav_menu")}</span> </button> </div> </div> </div> <div class="mobile-search-overlay" id="mobile-search-overlay" aria-hidden="true" data-astro-cid-3ef6ksr2> <form class="mobile-search-form" action="/cerca" method="get" aria-label="Cerca nel sito" data-astro-cid-3ef6ksr2> <input id="mobile-search-input" type="search" name="q" placeholder="Cerca nel sito…" class="mobile-search-input" autocomplete="off" data-astro-cid-3ef6ksr2> <button type="submit" class="mobile-search-submit" aria-label="Cerca" data-astro-cid-3ef6ksr2> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-3ef6ksr2> <circle cx="11" cy="11" r="8" data-astro-cid-3ef6ksr2></circle> <path d="m21 21-4.35-4.35" data-astro-cid-3ef6ksr2></path> </svg> </button> </form> </div> <div class="mega-menu" id="mega-menu" role="dialog" aria-modal="true" aria-label="Menu di navigazione" aria-hidden="true" data-astro-cid-3ef6ksr2> <div class="mega-menu-inner" data-astro-cid-3ef6ksr2> <div class="mega-menu-container" data-astro-cid-3ef6ksr2> <div class="mega-menu-grid" data-astro-cid-3ef6ksr2> <div class="mega-menu-block" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_themes")}</h3> <ul class="mega-menu-list mega-menu-list--grid" data-astro-cid-3ef6ksr2> ${temi.map((cat) => renderTemplate`<li data-astro-cid-3ef6ksr2> <a${addAttribute(`/categoria/${cat.slug}`, "href")} class="mega-menu-link" data-astro-cid-3ef6ksr2>${cat.nome}</a> </li>`)} </ul> </div> <div class="mega-menu-col-mid" data-astro-cid-3ef6ksr2> <div class="mega-menu-block" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_sections")}</h3> <ul class="mega-menu-list" data-astro-cid-3ef6ksr2> ${sezioniForme.map((cat) => renderTemplate`<li data-astro-cid-3ef6ksr2> <a${addAttribute(cat.href, "href")} class="mega-menu-link" data-astro-cid-3ef6ksr2>${cat.nome}</a> </li>`)} </ul> </div> <div class="mega-menu-block" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_archive")}</h3> <ul class="mega-menu-list" data-astro-cid-3ef6ksr2> ${archivioLinks.map((item) => renderTemplate`<li data-astro-cid-3ef6ksr2> <a${addAttribute(item.slug, "href")} class="mega-menu-link" data-astro-cid-3ef6ksr2>${item.nome}</a> </li>`)} </ul> </div> </div> <div class="mega-menu-block mega-menu-last-issue" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_last_issue")}</h3> ${ultimoNumero ? renderTemplate`<div class="last-issue-inner" data-astro-cid-3ef6ksr2> <a${addAttribute(`/archivio/${String(ultimoNumero.id_numero).toLowerCase().replace(/[^a-z0-9-]/g, "-")}`, "href")} class="last-issue-cover-wrap" data-astro-cid-3ef6ksr2> ${renderTemplate`<img${addAttribute(ultimoNumero.copertina_url, "src")}${addAttribute(ultimoNumero.titolo_numero, "alt")} class="last-issue-cover" loading="lazy" data-astro-cid-3ef6ksr2>`} </a> <div class="last-issue-meta" data-astro-cid-3ef6ksr2> <p class="last-issue-label" data-astro-cid-3ef6ksr2>Numero ${ultimoNumero.numero_progressivo} · ${ultimoNumero.anno_pubblicazione}</p> <h4 class="last-issue-title" data-astro-cid-3ef6ksr2>${ultimoNumero.titolo_numero}</h4> ${renderTemplate`<p class="last-issue-period" data-astro-cid-3ef6ksr2>${ultimoNumero.periodo_label}</p>`} <a href="/sostienici" class="mega-menu-cta" data-astro-cid-3ef6ksr2>${t(lang, "nav_support")}</a> </div> </div>` : renderTemplate`<a href="/sostienici" class="mega-menu-cta" data-astro-cid-3ef6ksr2>${t(lang, "nav_support")}</a>`} </div> </div> </div> </div> </div> </header>   `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/Header.astro", "self");

const PAYPAL_DONATE_URL = "https://www.paypal.com/donate/?hosted_button_id=ARYLM4RPUV788";
const CF = "96000680585";
const CODICE_FISCALE = CF;
const RUNTS = "15031";
const INTESTATARIO = "Associazione Fede e Luce APS";
const IBAN_RAW = "IT02S0760103200000055090005";
const IBAN_DISPLAY = "IT02 S076 0103 2000 0005 5090 005";
const CCP = "55090005";
const CCP_DISPLAY = "Conto Corrente Postale n. 55090005";
const EMAIL = "ombreeluci@fedeeluce.it";
const AMOUNT_CHIPS = [5, 10, 20];
const ABBONAMENTO_ANNO = 20;
const ABBONAMENTO_MESE = 2;
const NUMERI_ANNO = 4;

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
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

export { $$Header as $, AMOUNT_CHIPS as A, CCP as C, EMAIL as E, INTESTATARIO as I, NUMERI_ANNO as N, PAYPAL_DONATE_URL as P, RUNTS as R, getLabels as a, getRoleWeight as b, getAllCategorySlugs as c, getCategoryBySlug as d, $$Footer as e, getCategorySlugForArticle as f, getMegaclusterForArticle as g, getLangFromUrl as h, getThemeLabel as i, ABBONAMENTO_ANNO as j, ABBONAMENTO_MESE as k, IBAN_RAW as l, IBAN_DISPLAY as m, CCP_DISPLAY as n, CF as o, t };
