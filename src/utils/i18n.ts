/**
 * i18n: traduzioni it/en per UI.
 * Lingua ricavata dall'URL: pathname che inizia con /en/ → 'en', altrimenti 'it'.
 */

export type Locale = 'it' | 'en';

export const translations: Record<Locale, Record<string, string>> = {
  it: {
    read_also: 'LEGGI ANCHE',
    english_articles: 'Articoli in inglese',
    back_to_home: "Torna all'archivio",
    nav_archive: 'Archivio',
    nav_archive_full: 'Archivio completo',
    nav_latest: 'Ultimi articoli',
    nav_authors: 'Autori',
    nav_about: 'Chi siamo',
    nav_newsletter: 'Newsletter',
    nav_contribute: 'Contribuisci',
    nav_menu: 'Menù',
    nav_menu_open: 'Apri menu',
    nav_menu_close: 'Chiudi menu',
    nav_themes: 'Temi',
    nav_sections: 'Sezioni',
    nav_editorial_tools: 'Strumenti redazione',
    nav_audit_editorial: 'Audit gerarchia editoriale',
    nav_last_issue: 'Ultimo Numero',
    nav_support: 'Sostieni Ombre e Luci →',
    search_label: 'Cerca nel sito',
    search_placeholder: 'Cerca nel sito...',
    related_articles: 'Articoli Correlati',
    widget_navigate: 'Naviga',
    widget_download_pdf: 'Scarica PDF',
    widget_go_to_issue: 'Vai al numero',
    issue_number: 'Numero Rivista',
    download_pdf_issue: 'Scarica PDF del numero',
    min_read: 'min di lettura',
    published_online: 'Pubblicato online',
    footer_about: 'Chi siamo',
    footer_redaction: 'La Redazione',
    footer_redaction_history: 'La Redazione storica',
    footer_collaborators: 'Collaboratori',
    footer_wrote_for_us: 'Hanno scritto per noi',
    footer_diari: 'I Diari',
    footer_contacts: 'Info e contatti redazione',
    footer_info_privacy: 'Info & Privacy',
    footer_privacy: 'Privacy Policy',
    footer_cookies: 'Cookie Policy',
    footer_terms: 'Termini e Condizioni',
    footer_editorials: 'Editoriali',
    footer_reviews: 'Recensioni',
    footer_interviews: 'Interviste',
    footer_testimonials: 'Testimonianze',
    widget_close: 'Chiudi',
    author_bio_fallback: 'Autore di articoli pubblicati su Ombre e Luci.',
    author_total: 'autori hanno collaborato con Ombre e Luci.',
    author_total_prefix: 'In totale',
    footer_tagline: 'Dal 1974 al 2026',
    footer_edited_by: 'Edito da',
    author_by: 'Di',
    author_unknown: 'Autore sconosciuto',
    badge_online: 'Online',
    aria_lang_selector: 'Selezione lingua',
    aria_header_utility: 'Servizi e utilità',
    aria_mega_menu: 'Menu di navigazione',
    editorial_box_title: 'BOX REVISIONE EDITORIALE',
    editorial_aria: 'Box revisione editoriale',
    editorial_proposed_role: 'Ruolo proposto',
    editorial_notes: 'Note per la redazione',
    editorial_submit: 'Invia',
    editorial_role_none: 'Nessun cambio',
    editorial_role_portante: 'portante',
    editorial_role_strutturale: 'strutturale',
    editorial_role_laterale: 'laterale',
    editorial_role_trasversale: 'trasversale',
    editorial_directus_edit: 'Modifica in Directus',
    editorial_sending: 'Invio in corso…',
    editorial_sent: '✓ Inviato!',
    editorial_network_error: 'Errore di rete — riprova.',
    meta_article_default_suffix: 'Articolo pubblicato su Ombre e Luci',
    aria_article_bottom_nav: 'Navigazione in fondo articolo',
    badge_role_portante: 'Portante',
    badge_role_strutturale: 'Strutturale',
    badge_role_laterale: 'Laterale',
    badge_role_trasversale: 'Trasversale',
    /** Tipi formali (forma) — allineati a taxonomy FORMAL_TYPES + varianti DB */
    formal_articolo: 'Articolo',
    formal_intervista: 'Intervista',
    formal_recensione: 'Recensione',
    formal_testimonianza: 'Testimonianza',
    formal_editoriale: 'Editoriale',
    formal_dialogo_aperto: 'Dialogo Aperto',
    category_uncategorized: 'Da categorizzare',
    // Categorie (categoria_menu slug → label display)
    cat_fede_e_luce: 'Fede e Luce',
    cat_cultura: 'Cultura',
    cat_famiglia: 'Famiglia',
    cat_spiritualita: 'Spiritualità',
    cat_progetti: 'Progetti',
    cat_salute: 'Salute',
    cat_catechesi: 'Catechesi',
    cat_scuola: 'Scuola',
    cat_educazione_e_formazione: 'Educazione e Formazione',
    cat_tempo_libero: 'Tempo libero',
    cat_personaggi_che_ispirano: 'Personaggi che ispirano',
    cat_lavoro: 'Lavoro',
    cat_sport: 'Sport',
    // Temi (tema_label → label display)
    tema_catechesi: 'Catechesi',
    tema_cultura: 'Cultura',
    tema_da_categorizzare: 'Da categorizzare',
    tema_educazione_e_formazione: 'Educazione e Formazione',
    tema_famiglia: 'Famiglia',
    tema_fede_e_luce: 'Fede e Luce',
    tema_lavoro: 'Lavoro',
    tema_personaggi_che_ispirano: 'Personaggi che ispirano',
    tema_progetti: 'Progetti',
    tema_salute: 'Salute',
    tema_scuola: 'Scuola',
    tema_spiritualita: 'Spiritualità',
    tema_sport: 'Sport',
    tema_tempo_libero: 'Tempo libero',
  },
  en: {
    read_also: 'READ ALSO',
    english_articles: 'English articles',
    back_to_home: 'Back to archive',
    nav_archive: 'Archive',
    nav_archive_full: 'Full archive',
    nav_latest: 'Latest articles',
    nav_authors: 'Authors',
    nav_about: 'About us',
    nav_newsletter: 'Newsletter',
    nav_contribute: 'Contribute',
    nav_menu: 'Menu',
    nav_menu_open: 'Open menu',
    nav_menu_close: 'Close menu',
    nav_themes: 'Themes',
    nav_sections: 'Sections',
    nav_editorial_tools: 'Editorial tools',
    nav_audit_editorial: 'Editorial hierarchy audit',
    nav_last_issue: 'Latest Issue',
    nav_support: 'Support Ombre e Luci →',
    search_label: 'Search site',
    search_placeholder: 'Search site...',
    related_articles: 'Related Articles',
    widget_navigate: 'Navigate',
    widget_download_pdf: 'Download PDF',
    widget_go_to_issue: 'Go to issue',
    issue_number: 'Issue',
    download_pdf_issue: 'Download PDF of the issue',
    min_read: 'min read',
    published_online: 'Published online',
    footer_about: 'About us',
    footer_redaction: 'Editorial team',
    footer_redaction_history: 'Past editorial team',
    footer_collaborators: 'Collaborators',
    footer_wrote_for_us: 'Wrote for us',
    footer_diari: 'The Diaries',
    footer_contacts: 'Info and editorial contacts',
    footer_info_privacy: 'Info & Privacy',
    footer_privacy: 'Privacy Policy',
    footer_cookies: 'Cookie Policy',
    footer_terms: 'Terms and Conditions',
    footer_editorials: 'Editorials',
    footer_reviews: 'Reviews',
    footer_interviews: 'Interviews',
    footer_testimonials: 'Testimonials',
    widget_close: 'Close',
    author_bio_fallback: 'Author of articles published in Ombre e Luci.',
    author_total: 'authors have contributed to Ombre e Luci.',
    author_total_prefix: 'In total',
    footer_tagline: 'From 1974 to 2026',
    footer_edited_by: 'Published by',
    author_by: 'By',
    author_unknown: 'Unknown author',
    badge_online: 'Online',
    aria_lang_selector: 'Language selection',
    aria_header_utility: 'Services and utilities',
    aria_mega_menu: 'Navigation menu',
    editorial_box_title: 'EDITORIAL REVIEW BOX',
    editorial_aria: 'Editorial review box',
    editorial_proposed_role: 'Proposed role',
    editorial_notes: 'Notes for the editorial team',
    editorial_submit: 'Submit',
    editorial_role_none: 'No change',
    editorial_role_portante: 'core (portante)',
    editorial_role_strutturale: 'structural',
    editorial_role_laterale: 'lateral',
    editorial_role_trasversale: 'transversal',
    editorial_directus_edit: 'Edit in Directus',
    editorial_sending: 'Sending…',
    editorial_sent: '✓ Sent!',
    editorial_network_error: 'Network error — try again.',
    meta_article_default_suffix: 'Article published in Ombre e Luci',
    aria_article_bottom_nav: 'Article footer navigation',
    badge_role_portante: 'Core',
    badge_role_strutturale: 'Structural',
    badge_role_laterale: 'Lateral',
    badge_role_trasversale: 'Transversal',
    formal_articolo: 'Article',
    formal_intervista: 'Interview',
    formal_recensione: 'Review',
    formal_testimonianza: 'Testimonial',
    formal_editoriale: 'Editorial',
    formal_dialogo_aperto: 'Open Dialogue',
    category_uncategorized: 'To be categorized',
    // Categories (categoria_menu slug → display label)
    cat_fede_e_luce: 'Faith and Light',
    cat_cultura: 'Culture',
    cat_famiglia: 'Family',
    cat_spiritualita: 'Spirituality',
    cat_progetti: 'Projects',
    cat_salute: 'Health',
    cat_catechesi: 'Catechesis',
    cat_scuola: 'Education',
    cat_educazione_e_formazione: 'Education and Training',
    cat_tempo_libero: 'Leisure',
    cat_personaggi_che_ispirano: 'Inspiring Figures',
    cat_lavoro: 'Work',
    cat_sport: 'Sport',
    // Themes (tema_label → display label)
    tema_catechesi: 'Catechesis',
    tema_cultura: 'Culture',
    tema_da_categorizzare: 'Uncategorized',
    tema_educazione_e_formazione: 'Education and Training',
    tema_famiglia: 'Family',
    tema_fede_e_luce: 'Faith and Light',
    tema_lavoro: 'Work',
    tema_personaggi_che_ispirano: 'Inspiring Figures',
    tema_progetti: 'Projects',
    tema_salute: 'Health',
    tema_scuola: 'Education',
    tema_spiritualita: 'Spirituality',
    tema_sport: 'Sport',
    tema_tempo_libero: 'Leisure',
  },
};

/** Mappa slug IT (Directus) → slug EN (URL) per le pagine /en/category/ */
export const CAT_IT_TO_EN_SLUG: Record<string, string> = {
  'fede-e-luce':              'faith-and-light',
  cultura:                    'culture',
  famiglia:                   'family',
  spiritualita:               'spirituality',
  progetti:                   'projects',
  salute:                     'health',
  catechesi:                  'catechesis',
  scuola:                     'education',
  'educazione-e-formazione':  'education-and-training',
  'tempo-libero':             'leisure',
  'personaggi-che-ispirano':  'inspiring-figures',
  lavoro:                     'work',
  sport:                      'sport',
};

/** Inverso: slug EN (URL) → slug IT (Directus) */
export const CAT_EN_TO_IT_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(CAT_IT_TO_EN_SLUG).map(([it, en]) => [en, it])
);

/** categoria_menu slug da Directus → chiave dizionario */
const CAT_SLUG_TO_I18N_KEY: Record<string, keyof (typeof translations)['it']> = {
  'fede-e-luce': 'cat_fede_e_luce',
  'Fede e Luce': 'cat_fede_e_luce',
  cultura: 'cat_cultura',
  'Cultura': 'cat_cultura',
  famiglia: 'cat_famiglia',
  'Famiglia': 'cat_famiglia',
  spiritualita: 'cat_spiritualita',
  progetti: 'cat_progetti',
  salute: 'cat_salute',
  catechesi: 'cat_catechesi',
  scuola: 'cat_scuola',
  'educazione-e-formazione': 'cat_educazione_e_formazione',
  'tempo-libero': 'cat_tempo_libero',
  'Tempo libero': 'cat_tempo_libero',
  'personaggi-che-ispirano': 'cat_personaggi_che_ispirano',
  lavoro: 'cat_lavoro',
  sport: 'cat_sport',
};

/** tema_label da Directus → chiave dizionario */
const TEMA_IT_TO_I18N_KEY: Record<string, keyof (typeof translations)['it']> = {
  Catechesi: 'tema_catechesi',
  Cultura: 'tema_cultura',
  'Da categorizzare': 'tema_da_categorizzare',
  'Educazione e Formazione': 'tema_educazione_e_formazione',
  Famiglia: 'tema_famiglia',
  'Fede e Luce': 'tema_fede_e_luce',
  Lavoro: 'tema_lavoro',
  'Personaggi che ispirano': 'tema_personaggi_che_ispirano',
  Progetti: 'tema_progetti',
  Salute: 'tema_salute',
  Scuola: 'tema_scuola',
  'Spiritualità': 'tema_spiritualita',
  Sport: 'tema_sport',
  'Tempo libero': 'tema_tempo_libero',
};

export function localizeCategory(slug: string | null | undefined, locale: Locale): string | null {
  if (slug == null || slug === '') return null;
  const key = CAT_SLUG_TO_I18N_KEY[slug];
  if (key) return t(locale, key);
  return slug;
}

export function localizeTheme(label: string | null | undefined, locale: Locale): string | null {
  if (label == null || label === '') return null;
  const key = TEMA_IT_TO_I18N_KEY[label];
  if (key) return t(locale, key);
  return label;
}

/** Valori `forma` italiani da Directus → chiave dizionario */
const FORMAL_IT_TO_I18N_KEY: Record<string, keyof (typeof translations)['it']> = {
  Articolo: 'formal_articolo',
  Intervista: 'formal_intervista',
  Recensione: 'formal_recensione',
  Testimonianza: 'formal_testimonianza',
  Editoriale: 'formal_editoriale',
  'Dialogo Aperto': 'formal_dialogo_aperto',
};

/**
 * Label UI per il tipo formale (badge card, header articolo). DB resta in italiano.
 */
export function localizeFormalType(formal: string | null | undefined, locale: Locale): string | null {
  if (formal == null || formal === '') return null;
  const key = FORMAL_IT_TO_I18N_KEY[formal];
  if (key) return t(locale, key);
  return formal;
}

/** Mappa nomi mese IT → EN per etichette periodo (es. ultimo numero in mega menu). */
const IT_MONTH_TO_EN: [RegExp, string][] = [
  [/Gennaio/gi, 'January'],
  [/Febbraio/gi, 'February'],
  [/Marzo/gi, 'March'],
  [/Aprile/gi, 'April'],
  [/Maggio/gi, 'May'],
  [/Giugno/gi, 'June'],
  [/Luglio/gi, 'July'],
  [/Agosto/gi, 'August'],
  [/Settembre/gi, 'September'],
  [/Ottobre/gi, 'October'],
  [/Novembre/gi, 'November'],
  [/Dicembre/gi, 'December'],
];

/**
 * Localizza la stringa periodo del numero (es. da Directus/JSON) per la shell EN.
 */
export function localizeIssuePeriodLabel(
  label: string | null | undefined,
  locale: Locale
): string | null {
  if (label == null || label === '') return null;
  if (locale !== 'en') return label;
  let out = label;
  for (const [re, en] of IT_MONTH_TO_EN) {
    out = out.replace(re, en);
  }
  return out;
}

/**
 * Restituisce la lingua in base al pathname (es. /en/... → 'en').
 */
export function getLangFromUrl(pathname: string): Locale {
  const p = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (p.startsWith('/en') || p.startsWith('/blog/en') || p.includes('/en/')) return 'en';
  return 'it';
}

/**
 * Restituisce la stringa tradotta per la lingua data.
 */
export function t(locale: Locale, key: keyof (typeof translations)['it']): string {
  const dict = translations[locale];
  return dict[key] ?? translations.it[key] ?? key;
}
