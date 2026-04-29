/**
 * i18n: traduzioni it/en per UI.
 * Lingua ricavata dall'URL: pathname che inizia con /en/ → 'en', altrimenti 'it'.
 */

export type Locale = 'it' | 'en';

export const translations: Record<Locale, Record<string, string>> = {
  it: {
    read_also: 'LEGGI ANCHE',
    english_articles: 'Articoli in inglese',
    back_to_home: 'Torna al Magazine',
    nav_archive: 'Naviga',
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
    nav_sections: 'Rubriche',
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
    load_more: 'Carica altri',
    load_more_remaining: 'rimanenti',
    load_more_aria: 'Carica altri articoli',
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
    // Homepage
    home_tagline: 'Un nuovo sguardo attraverso la disabilità',
    home_section_recent: 'Recenti',
    home_section_close_up: 'Da vicino',
    home_section_close_up_sub: 'I diari di chi vive questa realtà e le storie di chi, stando accanto, ha visto qualcosa cambiare.',
    home_section_all_stories: 'Tutte le storie →',
    home_section_explore: 'Esplora',
    home_section_explore_sub: "Quarant'anni di storie, riflessioni e incontri.",
    home_magazine_eyebrow: 'La rivista · esce ogni tre mesi dal 1983',
    home_magazine_discover: 'Scopri il numero →',
    home_magazine_archive: 'Tutti i numeri',
    home_magazine_all_issues: 'Tutti i numeri',
    home_magazine_archive_link: 'Tutti i numeri →',
    home_section_join: 'Unisciti',
    home_section_join_sub: 'Ombre e Luci esiste grazie a chi ci crede. Ci sono molti modi per esserci.',
    home_join_support_title: 'Sostieni la rivista',
    home_join_support_text: 'Una donazione, anche piccola e ricorrente, permette a Ombre e Luci di continuare a pubblicare storie che contano.',
    home_join_support_btn: 'Scopri come →',
    home_join_story_title: 'Racconta la tua storia',
    home_join_story_text: "Hai vissuto qualcosa che vale la pena condividere? Le storie più vere arrivano da chi le ha vissute.",
    home_join_story_btn: 'Scrivici →',
    home_join_help_title: 'Dai una mano',
    home_join_help_text: 'Vuoi collaborare, fare volontariato o contribuire in un altro modo? Siamo sempre aperti.',
    home_join_help_btn: 'Contattaci →',
    home_newsletter_row: 'Resta in contatto:',
    home_newsletter_link: 'iscriviti alla newsletter',
    home_testi_cta_text: 'Hai vissuto qualcosa che vale la pena raccontare?',
    home_testi_cta_link: 'Scrivici →',
    // Cerca
    cerca_title: 'Cerca',
    cerca_description: 'Cerca tra oltre 3500 articoli della rivista Ombre e Luci dal 1983 ad oggi.',
    cerca_placeholder: 'Cerca articoli, autori, temi…',
    // Newsletter
    nl_eyebrow: 'Newsletter',
    nl_title: 'Rimani in contatto',
    nl_subtitle: 'Ogni numero: articoli scelti dalla redazione, storie di vita, riflessioni sulla disabilità e sulla fragilità. Nessuno spam, puoi cancellarti in ogni momento.',
    nl_email_placeholder: 'La tua email',
    nl_subscribe: 'Iscriviti',
    nl_privacy_prefix: 'Cliccando su "Iscriviti" accetti la nostra',
    nl_privacy_link: 'Privacy Policy',
    nl_prev_title: 'Newsletter precedenti',
    nl_explore_title: 'Esplora i temi della rivista',
    nl_archive_link: 'Tutti i numeri →',
    // Chi siamo / About
    about_title: 'Chi Siamo',
    about_cta_read: 'Leggi gli articoli',
    about_cta_support: 'Sostienici',
    about_magazine_section: 'La Rivista',
    about_timeline_section: 'Album di Famiglia',
    about_team_section: 'La Redazione',
    about_how_we_work_section: 'Come lavoriamo',
    about_legacy_section: 'La Redazione storica',
    about_legacy_archive_link: 'La storica redazione',
    about_legacy_archive_arrow: '→',
    about_collaborators_section: 'Collaboratori',
    about_collaborators_lead: 'Giornalisti, traduttori e professionisti che contribuiscono alla rivista.',
    about_authors_section: 'Hanno scritto per noi',
    about_contacts_section: 'Info e contatti redazione',
    about_read_more: 'Leggi di più',
    about_see_all_authors: 'Vedi tutti gli autori',
    about_contact_email_label: 'Email',
    about_contact_phone_label: 'Telefono / WhatsApp',
    about_contact_address_label: 'Dove siamo',
    about_hours_section: 'Orari',
    // Sostienici / Support
    support_donate_now: 'Dona ora',
    support_others_label: 'Altri modi per sostenerci',
    support_wire_label: 'Bonifico',
    support_wire_hint: 'Puoi impostare un bonifico ricorrente dalla tua banca.',
    support_fivepermille_label: '5×1000',
    support_fivepermille_hint: 'Ti costa zero. Firma nel riquadro «Sostegno del volontariato» e inserisci il codice fiscale.',
    support_subscription_label: 'Abbonamento',
    support_subscription_discover: 'Scopri abbonamento',
    support_impact_label: 'Cosa rendi possibile',
    support_impact_close: 'Ogni euro va dove serve.',
    support_faq_label: 'Domande frequenti',
    // Archivio / Archive
    archive_title: 'Magazine',
    archive_subtitle: 'Sfoglia i numeri della rivista Ombre e Luci dal 1977 ad oggi.',
    archive_filter_year: 'Anno',
    archive_filter_all: 'Tutti',
    archive_filter_type: 'Tipo rivista',
    archive_results_suffix: 'numeri',
    archive_no_results_title: 'Nessun numero trovato',
    archive_no_results_body: 'Prova a cambiare i filtri.',
    archive_webonly_title: 'Pubblicato online',
    archive_webonly_desc: 'Articoli pubblicati solo sul sito, senza numero di rivista cartacea.',
    // Issue
    issue_browse_online: 'Sfoglia online',
    issue_articles_heading: 'Articoli di questo numero',
    issue_prev: 'Numero precedente',
    issue_next: 'Numero successivo',
    archive_tab_last: 'Ultimo numero',
    archive_tab_all: 'Tutti i numeri',
    archive_filters_label: 'Filtri',
    archive_read_issue: 'Leggi il numero →',
    issue_back_archive: '← Magazine',
    // Diari / Diaries
    diaries_title: 'I Diari di Ombre e Luci',
    diaries_all_feed_title: 'Tutti i diari',
    // Dialogo aperto / Open Dialogue
    dialogue_title: 'Dialogo aperto',
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
    back_to_home: 'Back to Magazine',
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
    load_more: 'Load more',
    load_more_remaining: 'remaining',
    load_more_aria: 'Load more articles',
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
    // Homepage
    home_tagline: 'A new perspective through disability',
    home_section_recent: 'Recent',
    home_section_close_up: 'Close Up',
    home_section_close_up_sub: 'Personal stories from those who live this reality every day.',
    home_section_all_stories: 'All stories →',
    home_section_explore: 'Explore',
    home_section_explore_sub: 'Forty years of stories, reflections and encounters.',
    home_magazine_eyebrow: 'The magazine · published quarterly since 1983',
    home_magazine_discover: 'Discover the issue →',
    home_magazine_archive: 'All issues',
    home_magazine_all_issues: 'All issues',
    home_magazine_archive_link: 'All issues →',
    home_section_join: 'Get Involved',
    home_section_join_sub: 'Ombre e Luci exists thanks to those who believe in it. There are many ways to be part of it.',
    home_join_support_title: 'Support the magazine',
    home_join_support_text: 'A donation, even a small recurring one, allows Ombre e Luci to continue publishing stories that matter.',
    home_join_support_btn: 'Find out how →',
    home_join_story_title: 'Share your story',
    home_join_story_text: 'Have you experienced something worth sharing? The truest stories come from those who have lived them.',
    home_join_story_btn: 'Write to us →',
    home_join_help_title: 'Lend a hand',
    home_join_help_text: 'Want to collaborate, volunteer or contribute in another way? We are always open.',
    home_join_help_btn: 'Contact us →',
    home_newsletter_row: 'Stay connected:',
    home_newsletter_link: 'subscribe to our newsletter',
    home_testi_cta_text: 'Have you experienced something worth sharing?',
    home_testi_cta_link: 'Write to us →',
    // Search
    cerca_title: 'Search',
    cerca_description: 'Search over 3,500 articles in the Ombre e Luci archive since 1983.',
    cerca_placeholder: 'Search articles, authors, themes…',
    // Newsletter
    nl_eyebrow: 'Newsletter',
    nl_title: 'Stay in touch',
    nl_subtitle: 'Each issue: articles selected by the editorial team, life stories, reflections on disability and fragility. No spam, unsubscribe any time.',
    nl_email_placeholder: 'Your email',
    nl_subscribe: 'Subscribe',
    nl_privacy_prefix: 'By clicking "Subscribe" you accept our',
    nl_privacy_link: 'Privacy Policy',
    nl_prev_title: 'Previous newsletters',
    nl_explore_title: 'Explore magazine themes',
    nl_archive_link: 'All issues →',
    // About
    about_title: 'About Us',
    about_cta_read: 'Read the articles',
    about_cta_support: 'Support us',
    about_magazine_section: 'The Magazine',
    about_timeline_section: 'Family Album',
    about_team_section: 'Editorial Team',
    about_how_we_work_section: 'How we work',
    about_legacy_section: 'Historical Editorial Team',
    about_legacy_archive_link: 'Historical team',
    about_legacy_archive_arrow: '→',
    about_collaborators_section: 'Contributors',
    about_collaborators_lead: 'Journalists, translators and professionals who contribute to the magazine.',
    about_authors_section: 'Wrote for us',
    about_contacts_section: 'Info and editorial contacts',
    about_read_more: 'Read more',
    about_see_all_authors: 'See all authors',
    about_contact_email_label: 'Email',
    about_contact_phone_label: 'Phone / WhatsApp',
    about_contact_address_label: 'Where to find us',
    about_hours_section: 'Opening hours',
    // Support
    support_donate_now: 'Donate now',
    support_others_label: 'Other ways to support us',
    support_wire_label: 'Wire transfer',
    support_wire_hint: 'You can set up a recurring transfer from your bank.',
    support_fivepermille_label: '5×1000 (Italy only)',
    support_fivepermille_hint: 'It costs you nothing. Sign in the "Sostegno del volontariato" box and enter the tax code.',
    support_subscription_label: 'Subscription',
    support_subscription_discover: 'Find out about subscription',
    support_impact_label: 'What you make possible',
    support_impact_close: 'Every euro goes where it counts.',
    support_faq_label: 'Frequently asked questions',
    // Archive
    archive_title: 'Magazine',
    archive_subtitle: 'Browse the issues of Ombre e Luci magazine since 1977.',
    archive_filter_year: 'Year',
    archive_filter_all: 'All',
    archive_filter_type: 'Magazine type',
    archive_results_suffix: 'issues',
    archive_no_results_title: 'No issues found',
    archive_no_results_body: 'Try changing the filters.',
    archive_webonly_title: 'Published online',
    archive_webonly_desc: 'Articles published on the website only, without a print issue.',
    // Issue
    issue_browse_online: 'Browse online',
    issue_articles_heading: 'Articles in this issue',
    issue_prev: 'Previous issue',
    issue_next: 'Next issue',
    archive_tab_last: 'Latest issue',
    archive_tab_all: 'All issues',
    archive_filters_label: 'Filters',
    archive_read_issue: 'Read this issue →',
    issue_back_archive: '← Magazine',
    // Diaries
    diaries_title: 'The Diaries of Ombre e Luci',
    diaries_all_feed_title: 'All diaries',
    // Open Dialogue
    dialogue_title: 'Open Dialogue',
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
 * Restituisce il base path per le pagine autore nella lingua data.
 * IT usa /autori (path storico), le altre lingue usano /{lang}/authors.
 * Aggiungere ES/FR: basta estendere Locale — questa funzione non va toccata.
 */
export function getAuthorBasePath(lang: Locale): string {
  if (lang === 'it') return '/autori';
  return `/${lang}/authors`;
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
