globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAstro, a as createComponent, m as maybeRenderHead, e as addAttribute, u as unescapeHTML, r as renderTemplate, b as renderComponent } from './astro/server_BT9XwReg.mjs';
import { c as getThemesWithSlugs, k as getCategoriaLabel, d as getCategoriaUrlSlug } from './taxonomy_BacsMRxg.mjs';
import { r as rubricheData } from './rubriche_BEVwGLjw.mjs';
/* empty css                         */

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

const id_numero = "OEL-173";
const copertina_url = "https://cms.ombreeluci.it/assets/beec6332-66b2-4363-b247-db72b8de655c";
const titolo_numero = "Numero 173 – Quale futuro?";
const numero_progressivo = 173;
const anno_pubblicazione = 2026;
const periodo_label = "Gennaio – Febbraio – Marzo";
const ultimoNumeroData = {
	id_numero: id_numero,
	copertina_url: copertina_url,
	titolo_numero: titolo_numero,
	numero_progressivo: numero_progressivo,
	anno_pubblicazione: anno_pubblicazione,
	periodo_label: periodo_label
};

const translations = {
  it: {
    read_also: "LEGGI ANCHE",
    english_articles: "Articoli in inglese",
    back_to_home: "Torna al Magazine",
    nav_archive: "Naviga",
    nav_archive_full: "Archivio completo",
    nav_latest: "Ultimi articoli",
    nav_authors: "Autori",
    nav_focus: "Focus",
    nav_about: "Chi siamo",
    nav_newsletter: "Newsletter",
    nav_contribute: "Contribuisci",
    nav_menu: "Menù",
    nav_menu_open: "Apri menu",
    nav_menu_close: "Chiudi menu",
    nav_themes: "Temi",
    nav_sections: "Rubriche",
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
    footer_edited_by: "Edito da",
    author_by: "Di",
    author_unknown: "Autore sconosciuto",
    load_more: "Carica altri",
    load_more_remaining: "rimanenti",
    load_more_aria: "Carica altri articoli",
    badge_online: "Online",
    aria_lang_selector: "Selezione lingua",
    aria_header_utility: "Servizi e utilità",
    aria_mega_menu: "Menu di navigazione",
    editorial_box_title: "BOX REVISIONE EDITORIALE",
    editorial_aria: "Box revisione editoriale",
    editorial_proposed_role: "Ruolo proposto",
    editorial_notes: "Note per la redazione",
    editorial_submit: "Invia",
    editorial_role_none: "Nessun cambio",
    editorial_role_portante: "portante",
    editorial_role_strutturale: "strutturale",
    editorial_role_laterale: "laterale",
    editorial_role_trasversale: "trasversale",
    editorial_directus_edit: "Modifica in Directus",
    editorial_sending: "Invio in corso…",
    editorial_sent: "✓ Inviato!",
    editorial_network_error: "Errore di rete — riprova.",
    meta_article_default_suffix: "Articolo pubblicato su Ombre e Luci",
    aria_article_bottom_nav: "Navigazione in fondo articolo",
    badge_role_portante: "Portante",
    badge_role_strutturale: "Strutturale",
    badge_role_laterale: "Laterale",
    badge_role_trasversale: "Trasversale",
    /** Tipi formali (forma) — allineati a taxonomy FORMAL_TYPES + varianti DB */
    formal_articolo: "Articolo",
    formal_intervista: "Intervista",
    formal_recensione: "Recensione",
    formal_testimonianza: "Testimonianza",
    formal_editoriale: "Editoriale",
    formal_dialogo_aperto: "Dialogo Aperto",
    category_uncategorized: "Da categorizzare",
    // Categorie (categoria_menu slug → label display)
    cat_fede_e_luce: "Fede e Luce",
    cat_cultura: "Cultura",
    cat_famiglia: "Famiglia",
    cat_spiritualita: "Spiritualità",
    cat_progetti: "Progetti",
    cat_salute: "Salute",
    cat_catechesi: "Catechesi",
    cat_scuola: "Scuola",
    cat_educazione_e_formazione: "Educazione e Formazione",
    cat_tempo_libero: "Tempo libero",
    cat_personaggi_che_ispirano: "Personaggi che ispirano",
    cat_lavoro: "Lavoro",
    cat_sport: "Sport",
    // Homepage
    home_tagline: "Un nuovo sguardo attraverso la disabilità",
    home_section_recent: "Recenti",
    home_section_close_up: "Da vicino",
    home_section_close_up_sub: "I diari di chi vive questa realtà e le storie di chi, stando accanto, ha visto qualcosa cambiare.",
    home_section_all_stories: "Tutte le storie →",
    home_section_explore: "Esplora",
    home_section_explore_sub: "Quarant'anni di storie, riflessioni e incontri.",
    home_magazine_eyebrow: "La rivista · esce ogni tre mesi dal 1983",
    home_magazine_discover: "Scopri il numero →",
    home_magazine_archive: "Tutti i numeri",
    home_magazine_all_issues: "Tutti i numeri",
    home_magazine_archive_link: "Tutti i numeri →",
    home_section_join: "Unisciti",
    home_section_join_sub: "Ombre e Luci esiste grazie a chi ci crede. Ci sono molti modi per esserci.",
    home_join_support_title: "Sostieni la rivista",
    home_join_support_text: "Una donazione, anche piccola e ricorrente, permette a Ombre e Luci di continuare a pubblicare storie che contano.",
    home_join_support_btn: "Scopri come →",
    home_join_story_title: "Racconta la tua storia",
    home_join_story_text: "Hai vissuto qualcosa che vale la pena condividere? Le storie più vere arrivano da chi le ha vissute.",
    home_join_story_btn: "Scrivici →",
    home_join_help_title: "Dai una mano",
    home_join_help_text: "Vuoi collaborare, fare volontariato o contribuire in un altro modo? Siamo sempre aperti.",
    home_join_help_btn: "Contattaci →",
    home_newsletter_row: "Resta in contatto:",
    home_newsletter_link: "iscriviti alla newsletter",
    home_testi_cta_text: "Hai vissuto qualcosa che vale la pena raccontare?",
    home_testi_cta_link: "Scrivici →",
    // Cerca
    cerca_title: "Cerca",
    cerca_description: "Cerca tra oltre 3500 articoli della rivista Ombre e Luci dal 1983 ad oggi.",
    cerca_placeholder: "Cerca articoli, autori, temi…",
    // Newsletter
    nl_eyebrow: "Newsletter",
    nl_title: "Rimani in contatto",
    nl_subtitle: "Ogni numero: articoli scelti dalla redazione, storie di vita, riflessioni sulla disabilità e sulla fragilità. Nessuno spam, puoi cancellarti in ogni momento.",
    nl_email_placeholder: "La tua email",
    nl_subscribe: "Iscriviti",
    nl_privacy_prefix: 'Cliccando su "Iscriviti" accetti la nostra',
    nl_privacy_link: "Privacy Policy",
    nl_prev_title: "Newsletter precedenti",
    nl_explore_title: "Esplora i temi della rivista",
    nl_archive_link: "Tutti i numeri →",
    // Chi siamo / About
    about_title: "Chi Siamo",
    about_cta_read: "Leggi gli articoli",
    about_cta_support: "Sostienici",
    about_magazine_section: "La Rivista",
    about_timeline_section: "Album di Famiglia",
    about_team_section: "La Redazione",
    about_how_we_work_section: "Come lavoriamo",
    about_legacy_section: "La Redazione storica",
    about_legacy_archive_link: "La storica redazione",
    about_legacy_archive_arrow: "→",
    about_collaborators_section: "Collaboratori",
    about_collaborators_lead: "Giornalisti, traduttori e professionisti che contribuiscono alla rivista.",
    about_authors_section: "Hanno scritto per noi",
    about_contacts_section: "Info e contatti redazione",
    about_read_more: "Leggi di più",
    about_see_all_authors: "Vedi tutti gli autori",
    about_contact_email_label: "Email",
    about_contact_phone_label: "Telefono / WhatsApp",
    about_contact_address_label: "Dove siamo",
    about_hours_section: "Orari",
    // Sostienici / Support
    support_donate_now: "Dona ora",
    support_others_label: "Altri modi per sostenerci",
    support_wire_label: "Bonifico",
    support_wire_hint: "Puoi impostare un bonifico ricorrente dalla tua banca.",
    support_fivepermille_label: "5×1000",
    support_fivepermille_hint: "Ti costa zero. Firma nel riquadro «Sostegno del volontariato» e inserisci il codice fiscale.",
    support_subscription_label: "Abbonamento",
    support_subscription_discover: "Scopri abbonamento",
    support_impact_label: "Cosa rendi possibile",
    support_impact_close: "Ogni euro va dove serve.",
    support_faq_label: "Domande frequenti",
    // Archivio / Archive
    archive_title: "Magazine",
    archive_subtitle: "Sfoglia i numeri della rivista Ombre e Luci dal 1977 ad oggi.",
    archive_filter_year: "Anno",
    archive_filter_all: "Tutti",
    archive_filter_type: "Tipo rivista",
    archive_results_suffix: "numeri",
    archive_no_results_title: "Nessun numero trovato",
    archive_no_results_body: "Prova a cambiare i filtri.",
    archive_webonly_title: "Pubblicato online",
    archive_webonly_desc: "Articoli pubblicati solo sul sito, senza numero di rivista cartacea.",
    // Issue
    issue_browse_online: "Sfoglia online",
    issue_articles_heading: "Articoli di questo numero",
    issue_prev: "Numero precedente",
    issue_next: "Numero successivo",
    archive_tab_last: "Ultimo numero",
    archive_tab_all: "Tutti i numeri",
    archive_filters_label: "Filtri",
    archive_read_issue: "Leggi il numero →",
    issue_back_archive: "← Magazine",
    // Diari / Diaries
    diaries_title: "I Diari di Ombre e Luci",
    diaries_all_feed_title: "Tutti i diari",
    // Dialogo aperto / Open Dialogue
    dialogue_title: "Dialogo aperto",
    // Temi (tema_label → label display)
    tema_catechesi: "Catechesi",
    tema_cultura: "Cultura",
    tema_da_categorizzare: "Da categorizzare",
    tema_educazione_e_formazione: "Educazione e Formazione",
    tema_famiglia: "Famiglia",
    tema_fede_e_luce: "Fede e Luce",
    tema_lavoro: "Lavoro",
    tema_personaggi_che_ispirano: "Personaggi che ispirano",
    tema_progetti: "Progetti",
    tema_salute: "Salute",
    tema_scuola: "Scuola",
    tema_spiritualita: "Spiritualità",
    tema_sport: "Sport",
    tema_tempo_libero: "Tempo libero"
  },
  en: {
    read_also: "READ ALSO",
    english_articles: "English articles",
    back_to_home: "Back to Magazine",
    nav_archive: "Archive",
    nav_archive_full: "Full archive",
    nav_latest: "Latest articles",
    nav_authors: "Authors",
    nav_focus: "Focus",
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
    footer_edited_by: "Published by",
    author_by: "By",
    author_unknown: "Unknown author",
    load_more: "Load more",
    load_more_remaining: "remaining",
    load_more_aria: "Load more articles",
    badge_online: "Online",
    aria_lang_selector: "Language selection",
    aria_header_utility: "Services and utilities",
    aria_mega_menu: "Navigation menu",
    editorial_box_title: "EDITORIAL REVIEW BOX",
    editorial_aria: "Editorial review box",
    editorial_proposed_role: "Proposed role",
    editorial_notes: "Notes for the editorial team",
    editorial_submit: "Submit",
    editorial_role_none: "No change",
    editorial_role_portante: "core (portante)",
    editorial_role_strutturale: "structural",
    editorial_role_laterale: "lateral",
    editorial_role_trasversale: "transversal",
    editorial_directus_edit: "Edit in Directus",
    editorial_sending: "Sending…",
    editorial_sent: "✓ Sent!",
    editorial_network_error: "Network error — try again.",
    meta_article_default_suffix: "Article published in Ombre e Luci",
    aria_article_bottom_nav: "Article footer navigation",
    badge_role_portante: "Core",
    badge_role_strutturale: "Structural",
    badge_role_laterale: "Lateral",
    badge_role_trasversale: "Transversal",
    formal_articolo: "Article",
    formal_intervista: "Interview",
    formal_recensione: "Review",
    formal_testimonianza: "Testimonial",
    formal_editoriale: "Editorial",
    formal_dialogo_aperto: "Open Dialogue",
    category_uncategorized: "To be categorized",
    // Categories (categoria_menu slug → display label)
    cat_fede_e_luce: "Faith and Light",
    cat_cultura: "Culture",
    cat_famiglia: "Family",
    cat_spiritualita: "Spirituality",
    cat_progetti: "Projects",
    cat_salute: "Health",
    cat_catechesi: "Catechesis",
    cat_scuola: "Education",
    cat_educazione_e_formazione: "Education and Training",
    cat_tempo_libero: "Leisure",
    cat_personaggi_che_ispirano: "Inspiring Figures",
    cat_lavoro: "Work",
    cat_sport: "Sport",
    // Homepage
    home_tagline: "A new perspective through disability",
    home_section_recent: "Recent",
    home_section_close_up: "Close Up",
    home_section_close_up_sub: "Personal stories from those who live this reality every day.",
    home_section_all_stories: "All stories →",
    home_section_explore: "Explore",
    home_section_explore_sub: "Forty years of stories, reflections and encounters.",
    home_magazine_eyebrow: "The magazine · published quarterly since 1983",
    home_magazine_discover: "Discover the issue →",
    home_magazine_archive: "All issues",
    home_magazine_all_issues: "All issues",
    home_magazine_archive_link: "All issues →",
    home_section_join: "Get Involved",
    home_section_join_sub: "Ombre e Luci exists thanks to those who believe in it. There are many ways to be part of it.",
    home_join_support_title: "Support the magazine",
    home_join_support_text: "A donation, even a small recurring one, allows Ombre e Luci to continue publishing stories that matter.",
    home_join_support_btn: "Find out how →",
    home_join_story_title: "Share your story",
    home_join_story_text: "Have you experienced something worth sharing? The truest stories come from those who have lived them.",
    home_join_story_btn: "Write to us →",
    home_join_help_title: "Lend a hand",
    home_join_help_text: "Want to collaborate, volunteer or contribute in another way? We are always open.",
    home_join_help_btn: "Contact us →",
    home_newsletter_row: "Stay connected:",
    home_newsletter_link: "subscribe to our newsletter",
    home_testi_cta_text: "Have you experienced something worth sharing?",
    home_testi_cta_link: "Write to us →",
    // Search
    cerca_title: "Search",
    cerca_description: "Search over 3,500 articles in the Ombre e Luci archive since 1983.",
    cerca_placeholder: "Search articles, authors, themes…",
    // Newsletter
    nl_eyebrow: "Newsletter",
    nl_title: "Stay in touch",
    nl_subtitle: "Each issue: articles selected by the editorial team, life stories, reflections on disability and fragility. No spam, unsubscribe any time.",
    nl_email_placeholder: "Your email",
    nl_subscribe: "Subscribe",
    nl_privacy_prefix: 'By clicking "Subscribe" you accept our',
    nl_privacy_link: "Privacy Policy",
    nl_prev_title: "Previous newsletters",
    nl_explore_title: "Explore magazine themes",
    nl_archive_link: "All issues →",
    // About
    about_title: "About Us",
    about_cta_read: "Read the articles",
    about_cta_support: "Support us",
    about_magazine_section: "The Magazine",
    about_timeline_section: "Family Album",
    about_team_section: "Editorial Team",
    about_how_we_work_section: "How we work",
    about_legacy_section: "Historical Editorial Team",
    about_legacy_archive_link: "Historical team",
    about_legacy_archive_arrow: "→",
    about_collaborators_section: "Contributors",
    about_collaborators_lead: "Journalists, translators and professionals who contribute to the magazine.",
    about_authors_section: "Wrote for us",
    about_contacts_section: "Info and editorial contacts",
    about_read_more: "Read more",
    about_see_all_authors: "See all authors",
    about_contact_email_label: "Email",
    about_contact_phone_label: "Phone / WhatsApp",
    about_contact_address_label: "Where to find us",
    about_hours_section: "Opening hours",
    // Support
    support_donate_now: "Donate now",
    support_others_label: "Other ways to support us",
    support_wire_label: "Wire transfer",
    support_wire_hint: "You can set up a recurring transfer from your bank.",
    support_fivepermille_label: "5×1000 (Italy only)",
    support_fivepermille_hint: 'It costs you nothing. Sign in the "Sostegno del volontariato" box and enter the tax code.',
    support_subscription_label: "Subscription",
    support_subscription_discover: "Find out about subscription",
    support_impact_label: "What you make possible",
    support_impact_close: "Every euro goes where it counts.",
    support_faq_label: "Frequently asked questions",
    // Archive
    archive_title: "Magazine",
    archive_subtitle: "Browse the issues of Ombre e Luci magazine since 1977.",
    archive_filter_year: "Year",
    archive_filter_all: "All",
    archive_filter_type: "Magazine type",
    archive_results_suffix: "issues",
    archive_no_results_title: "No issues found",
    archive_no_results_body: "Try changing the filters.",
    archive_webonly_title: "Published online",
    archive_webonly_desc: "Articles published on the website only, without a print issue.",
    // Issue
    issue_browse_online: "Browse online",
    issue_articles_heading: "Articles in this issue",
    issue_prev: "Previous issue",
    issue_next: "Next issue",
    archive_tab_last: "Latest issue",
    archive_tab_all: "All issues",
    archive_filters_label: "Filters",
    archive_read_issue: "Read this issue →",
    issue_back_archive: "← Magazine",
    // Diaries
    diaries_title: "The Diaries of Ombre e Luci",
    diaries_all_feed_title: "All diaries",
    // Open Dialogue
    dialogue_title: "Open Dialogue",
    // Themes (tema_label → display label)
    tema_catechesi: "Catechesis",
    tema_cultura: "Culture",
    tema_da_categorizzare: "Uncategorized",
    tema_educazione_e_formazione: "Education and Training",
    tema_famiglia: "Family",
    tema_fede_e_luce: "Faith and Light",
    tema_lavoro: "Work",
    tema_personaggi_che_ispirano: "Inspiring Figures",
    tema_progetti: "Projects",
    tema_salute: "Health",
    tema_scuola: "Education",
    tema_spiritualita: "Spirituality",
    tema_sport: "Sport",
    tema_tempo_libero: "Leisure"
  }
};
const CAT_SLUG_TO_I18N_KEY = {
  "fede-e-luce": "cat_fede_e_luce",
  "Fede e Luce": "cat_fede_e_luce",
  cultura: "cat_cultura",
  "Cultura": "cat_cultura",
  famiglia: "cat_famiglia",
  "Famiglia": "cat_famiglia",
  spiritualita: "cat_spiritualita",
  progetti: "cat_progetti",
  salute: "cat_salute",
  catechesi: "cat_catechesi",
  scuola: "cat_scuola",
  "educazione-e-formazione": "cat_educazione_e_formazione",
  "tempo-libero": "cat_tempo_libero",
  "Tempo libero": "cat_tempo_libero",
  "personaggi-che-ispirano": "cat_personaggi_che_ispirano",
  lavoro: "cat_lavoro",
  sport: "cat_sport"
};
const TEMA_IT_TO_I18N_KEY = {
  Catechesi: "tema_catechesi",
  Cultura: "tema_cultura",
  "Da categorizzare": "tema_da_categorizzare",
  "Educazione e Formazione": "tema_educazione_e_formazione",
  Famiglia: "tema_famiglia",
  "Fede e Luce": "tema_fede_e_luce",
  Lavoro: "tema_lavoro",
  "Personaggi che ispirano": "tema_personaggi_che_ispirano",
  Progetti: "tema_progetti",
  Salute: "tema_salute",
  Scuola: "tema_scuola",
  "Spiritualità": "tema_spiritualita",
  Sport: "tema_sport",
  "Tempo libero": "tema_tempo_libero"
};
function localizeCategory(slug, locale) {
  if (slug == null || slug === "") return null;
  const key = CAT_SLUG_TO_I18N_KEY[slug];
  if (key) return t(locale, key);
  return slug;
}
function localizeTheme(label, locale) {
  if (label == null || label === "") return null;
  const key = TEMA_IT_TO_I18N_KEY[label];
  if (key) return t(locale, key);
  return label;
}
const FORMAL_IT_TO_I18N_KEY = {
  Articolo: "formal_articolo",
  Intervista: "formal_intervista",
  Recensione: "formal_recensione",
  Testimonianza: "formal_testimonianza",
  Editoriale: "formal_editoriale",
  "Dialogo Aperto": "formal_dialogo_aperto"
};
function localizeFormalType(formal, locale) {
  if (formal == null || formal === "") return null;
  const key = FORMAL_IT_TO_I18N_KEY[formal];
  if (key) return t(locale, key);
  return formal;
}
const IT_MONTH_TO_EN = [
  [/Gennaio/gi, "January"],
  [/Febbraio/gi, "February"],
  [/Marzo/gi, "March"],
  [/Aprile/gi, "April"],
  [/Maggio/gi, "May"],
  [/Giugno/gi, "June"],
  [/Luglio/gi, "July"],
  [/Agosto/gi, "August"],
  [/Settembre/gi, "September"],
  [/Ottobre/gi, "October"],
  [/Novembre/gi, "November"],
  [/Dicembre/gi, "December"]
];
function localizeIssuePeriodLabel(label, locale) {
  if (label == null || label === "") return null;
  if (locale !== "en") return label;
  let out = label;
  for (const [re, en] of IT_MONTH_TO_EN) {
    out = out.replace(re, en);
  }
  return out;
}
function getAuthorBasePath(lang) {
  if (lang === "it") return "/it/autori";
  return `/${lang}/authors`;
}
function getLangFromUrl(pathname) {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (p.startsWith("/en") || p.startsWith("/blog/en") || p.includes("/en/")) return "en";
  return "it";
}
function t(locale, key) {
  const dict = translations[locale];
  return dict[key] ?? translations.it[key] ?? key;
}

const iconTranslate = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-translate\" viewBox=\"0 0 16 16\">\n  <path d=\"M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z\"/>\n  <path d=\"M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492 2 2 0 0 1-.94.31\"/>\n</svg>";

const $$Astro$3 = createAstro("https://ombreeluci.it");
const $$LanguageSelector = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$LanguageSelector;
  const { pathname, alternateArticleUrl = null, lang: langProp } = Astro2.props;
  const lang = langProp ?? getLangFromUrl(pathname);
  const hrefIt = lang === "en" ? alternateArticleUrl ?? "/" : pathname ?? "/";
  const hrefEn = lang === "it" ? alternateArticleUrl ?? "/en" : pathname ?? "/en";
  const langs = [
    { code: "IT", href: hrefIt, active: lang === "it" },
    { code: "EN", href: hrefEn, active: lang === "en" }
  ];
  return renderTemplate`${maybeRenderHead()}<div class="ls-wrap"${addAttribute(t(lang, "aria_lang_selector"), "aria-label")} data-astro-cid-ltpqzwiw> <!-- Icona translate --> <button class="ls-icon-btn" id="ls-toggle" aria-expanded="false" aria-haspopup="true"${addAttribute(t(lang, "aria_lang_selector"), "aria-label")} data-astro-cid-ltpqzwiw> <span class="ls-btn-icon" aria-hidden="true" data-astro-cid-ltpqzwiw>${unescapeHTML(iconTranslate)}</span> <span class="ls-btn-lang" aria-hidden="true" data-astro-cid-ltpqzwiw>${lang.toUpperCase()}</span> </button> <!-- Pill desktop (sempre visibile su ≥768px): icona + codici lingua --> <div class="ls-pill" role="list" data-astro-cid-ltpqzwiw> <span class="ls-pill-icon" aria-hidden="true" data-astro-cid-ltpqzwiw>${unescapeHTML(iconTranslate)}</span> ${langs.map((l) => renderTemplate`<a${addAttribute(l.href, "href")}${addAttribute(["ls-code", l.active && "ls-code--active"], "class:list")}${addAttribute(l.active ? "true" : void 0, "aria-current")} role="listitem" data-astro-cid-ltpqzwiw>${l.code}</a>`)} </div> <!-- Dropdown mobile (visibile solo su <768px quando aperto) --> <div class="ls-dropdown" id="ls-dropdown" aria-hidden="true" role="list" data-astro-cid-ltpqzwiw> ${langs.map((l) => renderTemplate`<a${addAttribute(l.href, "href")}${addAttribute(["ls-code", l.active && "ls-code--active"], "class:list")}${addAttribute(l.active ? "true" : void 0, "aria-current")} role="listitem" tabindex="-1" data-astro-cid-ltpqzwiw>${l.code}</a>`)} </div> </div>  `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/LanguageSelector.astro", void 0);

const $$Astro$2 = createAstro("https://ombreeluci.it");
const $$AutocompleteWidget = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$AutocompleteWidget;
  const { lang, searchHref } = Astro2.props;
  const appId = "1BM5L8XRYW";
  const searchKey = "af13f70e8d751ead7da2b227c062d456";
  return renderTemplate`<!-- No-JS fallback: form originale visibile senza JS -->${maybeRenderHead()}<form class="search-form" id="aa-fallback-form"${addAttribute(searchHref, "action")} method="get"${addAttribute(lang === "en" ? "Search" : "Cerca", "aria-label")} data-astro-cid-uasdyt2x> <label for="aa-fallback-input" class="search-label" data-astro-cid-uasdyt2x> ${lang === "en" ? "Search" : "Cerca nel sito"} </label> <input id="aa-fallback-input" type="search" name="q"${addAttribute(lang === "en" ? "Search articles, authors…" : "Cerca articoli, autori…", "placeholder")} class="search-input" autocomplete="off" data-astro-cid-uasdyt2x> <button type="submit" class="search-button"${addAttribute(lang === "en" ? "Search" : "Cerca", "aria-label")} data-astro-cid-uasdyt2x> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-uasdyt2x> <circle cx="11" cy="11" r="8" data-astro-cid-uasdyt2x></circle> <path d="m21 21-4.35-4.35" data-astro-cid-uasdyt2x></path> </svg> </button> </form> <!-- Container autocomplete (popolato da JS, nascosto di default) --> <div id="aa-container" class="search-form" style="display:none"${addAttribute(lang, "data-lang")}${addAttribute(searchHref, "data-search-href")}${addAttribute(appId, "data-app-id")}${addAttribute(searchKey, "data-search-key")} data-astro-cid-uasdyt2x></div>   `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/AutocompleteWidget.astro", void 0);

const $$Astro$1 = createAstro("https://ombreeluci.it");
const $$Header = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Header;
  const { pathname = Astro2.url.pathname, alternateArticleUrl = null, lang: langProp, heroHeader } = Astro2.props;
  const lang = langProp ?? getLangFromUrl(pathname);
  const ultimoNumero = ultimoNumeroData;
  function isActive(href) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }
  const catBase = lang === "en" ? "/en/category" : "/it/categoria";
  const catSlug = (itSlug) => getCategoriaUrlSlug(itSlug, lang);
  const temi = getThemesWithSlugs().filter((t2) => t2.nomeCompleto !== "Personaggi che ispirano").map((t2) => ({ ...t2, nome: lang === "it" ? t2.nome : getCategoriaLabel(t2.slug, lang) ?? t2.nome, href: `${catBase}/${catSlug(t2.slug)}` }));
  const homeHref = lang === "en" ? "/en/" : "/";
  const aboutHref = lang === "en" ? "/en/about/" : "/it/chi-siamo";
  const nlHref = lang === "en" ? "/en/newsletter/" : "/it/newsletter/";
  const supportHref = lang === "en" ? "/en/support-us/" : "/it/sostienici";
  const archiveHref = lang === "en" ? "/en/archive/" : "/it/archivio";
  const authorsHref = lang === "en" ? "/en/authors/" : "/it/autori";
  const searchHref = lang === "en" ? "/en/search/" : "/it/cerca/";
  const issueSlug = ultimoNumero ? String(ultimoNumero.id_numero).toLowerCase().replace(/[^a-z0-9-]/g, "-") : "";
  const issueHref = lang === "en" ? `/en/archive/${issueSlug}` : `/it/archivio/${issueSlug}`;
  const sezioniForme = rubricheData.map((r) => ({
    nome: lang === "en" ? r.en : r.it,
    href: lang === "en" ? `/en/sections/${r.en_slug}/` : `/it/rubriche/${r.slug}/`
  }));
  const focusHref = lang === "en" ? "/en/focus/" : "/it/focus/";
  const archivioLinks = [
    { nome: t(lang, "nav_latest"), slug: homeHref },
    { nome: t(lang, "nav_focus"), slug: focusHref },
    { nome: t(lang, "nav_newsletter"), slug: nlHref },
    { nome: t(lang, "nav_authors"), slug: authorsHref },
    { nome: t(lang, "search_label"), slug: searchHref }
  ];
  return renderTemplate`${maybeRenderHead()}<header class="header" id="site-header" data-pagefind-ignore${addAttribute(heroHeader ? "true" : void 0, "data-hero")} data-astro-cid-3ef6ksr2> <div class="header-bar" data-astro-cid-3ef6ksr2> <div class="header-inner" data-astro-cid-3ef6ksr2> <a${addAttribute(homeHref, "href")} class="logo-link" aria-label="Ombre e Luci - Home" data-astro-cid-3ef6ksr2> <img${addAttribute(logo.src, "src")} alt="Ombre e Luci" class="logo" data-astro-cid-3ef6ksr2> </a> <div class="search-wrap" data-astro-cid-3ef6ksr2> ${renderComponent($$result, "AutocompleteWidget", $$AutocompleteWidget, { "lang": lang, "searchHref": searchHref, "data-astro-cid-3ef6ksr2": true })} </div> <div class="header-end" data-astro-cid-3ef6ksr2> ${renderComponent($$result, "LanguageSelector", $$LanguageSelector, { "lang": lang, "pathname": pathname, "alternateArticleUrl": alternateArticleUrl, "data-astro-cid-3ef6ksr2": true })} <nav class="header-nav"${addAttribute(t(lang, "aria_header_utility"), "aria-label")} data-astro-cid-3ef6ksr2> <a${addAttribute(aboutHref, "href")}${addAttribute(["header-link", { "header-link--active": isActive(aboutHref) }], "class:list")} data-astro-cid-3ef6ksr2>${t(lang, "nav_about")}</a> <a${addAttribute(archiveHref, "href")}${addAttribute(["header-link", { "header-link--active": isActive(archiveHref) }], "class:list")} data-astro-cid-3ef6ksr2>${t(lang, "archive_title")}</a> </nav> <button type="button" class="mobile-search-btn" id="mobile-search-btn"${addAttribute(t(lang, "search_label"), "aria-label")} aria-expanded="false" aria-controls="mobile-search-overlay" data-astro-cid-3ef6ksr2> <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-3ef6ksr2> <circle cx="11" cy="11" r="8" data-astro-cid-3ef6ksr2></circle> <path d="m21 21-4.35-4.35" data-astro-cid-3ef6ksr2></path> </svg> </button> <a${addAttribute(supportHref, "href")} class="header-cta" data-astro-cid-3ef6ksr2>${t(lang, "nav_contribute")}</a> <button type="button" class="menu-trigger" id="menu-trigger"${addAttribute(t(lang, "nav_menu_open"), "aria-label")} aria-expanded="false" aria-controls="mega-menu"${addAttribute(t(lang, "nav_menu_open"), "data-label-open")}${addAttribute(t(lang, "nav_menu_close"), "data-label-close")} data-astro-cid-3ef6ksr2> <span class="menu-trigger-icon" aria-hidden="true" data-astro-cid-3ef6ksr2> <span class="hamburger-line" data-astro-cid-3ef6ksr2></span> <span class="hamburger-line" data-astro-cid-3ef6ksr2></span> <span class="hamburger-line" data-astro-cid-3ef6ksr2></span> </span> <span class="menu-trigger-close" aria-hidden="true" data-astro-cid-3ef6ksr2> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" data-astro-cid-3ef6ksr2> <path d="M18 6 6 18M6 6l12 12" data-astro-cid-3ef6ksr2></path> </svg> </span> <span class="menu-trigger-label" data-astro-cid-3ef6ksr2>${t(lang, "nav_menu")}</span> </button> </div> </div> </div> <div class="mobile-search-overlay" id="mobile-search-overlay" aria-hidden="true" data-astro-cid-3ef6ksr2> <form class="mobile-search-form"${addAttribute(searchHref, "action")} method="get"${addAttribute(t(lang, "search_label"), "aria-label")} data-astro-cid-3ef6ksr2> <input id="mobile-search-input" type="search" name="q"${addAttribute(t(lang, "search_placeholder"), "placeholder")} class="mobile-search-input" autocomplete="off" data-astro-cid-3ef6ksr2> <button type="submit" class="mobile-search-submit"${addAttribute(t(lang, "search_label"), "aria-label")} data-astro-cid-3ef6ksr2> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-3ef6ksr2> <circle cx="11" cy="11" r="8" data-astro-cid-3ef6ksr2></circle> <path d="m21 21-4.35-4.35" data-astro-cid-3ef6ksr2></path> </svg> </button> </form> </div> <div class="mega-menu" id="mega-menu" role="dialog" aria-modal="true"${addAttribute(t(lang, "aria_mega_menu"), "aria-label")} aria-hidden="true" data-astro-cid-3ef6ksr2> <div class="mega-menu-inner" data-astro-cid-3ef6ksr2> <div class="mega-menu-container" data-astro-cid-3ef6ksr2> <div class="mega-menu-grid" data-astro-cid-3ef6ksr2> <div class="mega-menu-block" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_themes")}</h3> <ul class="mega-menu-list mega-menu-list--grid" data-astro-cid-3ef6ksr2> ${temi.map((cat) => renderTemplate`<li data-astro-cid-3ef6ksr2> <a${addAttribute(cat.href, "href")}${addAttribute(["mega-menu-link", { "mega-menu-link--active": isActive(cat.href) }], "class:list")} data-astro-cid-3ef6ksr2>${cat.nome}</a> </li>`)} </ul> </div> <div class="mega-menu-col-mid" data-astro-cid-3ef6ksr2> <div class="mega-menu-block" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_sections")}</h3> <ul class="mega-menu-list" data-astro-cid-3ef6ksr2> ${sezioniForme.map((cat) => renderTemplate`<li data-astro-cid-3ef6ksr2> <a${addAttribute(cat.href, "href")}${addAttribute(["mega-menu-link", { "mega-menu-link--active": isActive(cat.href) }], "class:list")} data-astro-cid-3ef6ksr2>${cat.nome}</a> </li>`)} </ul> </div> <div class="mega-menu-block" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_archive")}</h3> <ul class="mega-menu-list" data-astro-cid-3ef6ksr2> ${archivioLinks.map((item) => renderTemplate`<li data-astro-cid-3ef6ksr2> <a${addAttribute(item.slug, "href")}${addAttribute(["mega-menu-link", { "mega-menu-link--active": isActive(item.slug) }], "class:list")} data-astro-cid-3ef6ksr2>${item.nome}</a> </li>`)} </ul> <div class="mega-menu-social mega-menu-social--desktop" data-astro-cid-3ef6ksr2> <a href="https://www.facebook.com/OmbreeLuciRivista/" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="Facebook" data-astro-cid-3ef6ksr2> <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" data-astro-cid-3ef6ksr2></path></svg> </a> <a href="https://www.instagram.com/ombreeluci_magazine/" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="Instagram" data-astro-cid-3ef6ksr2> <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" data-astro-cid-3ef6ksr2></path></svg> </a> <a href="https://www.youtube.com/channel/UCypEHP-N_RaUiz1BcBsplVQ" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="YouTube" data-astro-cid-3ef6ksr2> <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" data-astro-cid-3ef6ksr2></path></svg> </a> <a href="https://x.com/Ombre_Luci" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="X" data-astro-cid-3ef6ksr2> <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" data-astro-cid-3ef6ksr2></path></svg> </a> </div> </div> </div> <div class="mega-menu-block mega-menu-last-issue" data-astro-cid-3ef6ksr2> <h3 class="mega-menu-title" data-astro-cid-3ef6ksr2>${t(lang, "nav_last_issue")}</h3> ${ultimoNumero ? renderTemplate`<div class="last-issue-inner" data-astro-cid-3ef6ksr2> <a${addAttribute(issueHref, "href")} class="last-issue-cover-wrap" data-astro-cid-3ef6ksr2> ${renderTemplate`<img${addAttribute(ultimoNumero.copertina_url, "src")}${addAttribute(ultimoNumero.titolo_numero, "alt")} class="last-issue-cover" loading="lazy" data-astro-cid-3ef6ksr2>`} </a> <div class="last-issue-meta" data-astro-cid-3ef6ksr2> <p class="last-issue-label" data-astro-cid-3ef6ksr2>${lang === "en" ? "Issue" : "Numero"} ${ultimoNumero.numero_progressivo} · ${ultimoNumero.anno_pubblicazione}</p> <h4 class="last-issue-title" data-astro-cid-3ef6ksr2>${ultimoNumero.titolo_numero}</h4> ${renderTemplate`<p class="last-issue-period" data-astro-cid-3ef6ksr2>${localizeIssuePeriodLabel(ultimoNumero.periodo_label, lang)}</p>`} <a${addAttribute(supportHref, "href")} class="mega-menu-cta" data-astro-cid-3ef6ksr2>${t(lang, "nav_support")}</a> </div> </div>` : renderTemplate`<a${addAttribute(supportHref, "href")} class="mega-menu-cta" data-astro-cid-3ef6ksr2>${t(lang, "nav_support")}</a>`} </div> <!-- Footer mobile megamenu: Chi siamo + social (nascosto su desktop) --> <div class="mega-menu-mobile-footer" data-astro-cid-3ef6ksr2> <a${addAttribute(aboutHref, "href")} class="mega-menu-link mega-menu-link--footer" data-astro-cid-3ef6ksr2>${t(lang, "nav_about")}</a> <div class="mega-menu-social" data-astro-cid-3ef6ksr2> <a href="https://www.facebook.com/OmbreeLuciRivista/" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="Facebook" data-astro-cid-3ef6ksr2> <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" data-astro-cid-3ef6ksr2></path></svg> </a> <a href="https://www.instagram.com/ombreeluci_magazine/" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="Instagram" data-astro-cid-3ef6ksr2> <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" data-astro-cid-3ef6ksr2></path></svg> </a> <a href="https://www.youtube.com/channel/UCypEHP-N_RaUiz1BcBsplVQ" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="YouTube" data-astro-cid-3ef6ksr2> <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" data-astro-cid-3ef6ksr2></path></svg> </a> <a href="https://x.com/Ombre_Luci" target="_blank" rel="noopener noreferrer" class="mega-menu-social-link" aria-label="X" data-astro-cid-3ef6ksr2> <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-3ef6ksr2><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" data-astro-cid-3ef6ksr2></path></svg> </a> </div> </div> </div> </div> </div> </div> </header>    `;
}, "C:/Users/berto/Documents/Ombreeluci/src/components/Header.astro", void 0);

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
const $$Astro = createAstro("https://ombreeluci.it");
const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Footer;
  const { pathname = "/", lang: langProp } = Astro2.props;
  const lang = langProp ?? getLangFromUrl(pathname);
  const catBase = lang === "en" ? "/en/category" : "/it/categoria";
  const catSlug = (itSlug) => getCategoriaUrlSlug(itSlug, lang);
  const temi = getThemesWithSlugs().map((t2) => ({
    ...t2,
    nome: getCategoriaLabel(t2.slug, lang) ?? t2.nome,
    href: `${catBase}/${catSlug(t2.slug)}`
  }));
  const meta = Math.ceil(temi.length / 2);
  const temiCol1 = temi.slice(0, meta);
  const temiCol2 = temi.slice(meta);
  const sezioniFormali = rubricheData.map((r) => ({
    nome: lang === "en" ? r.en : r.it,
    href: lang === "en" ? `/en/sections/${r.en_slug}/` : `/it/rubriche/${r.slug}/`
  }));
  const aboutLinks = [
    { nome: t(lang, "footer_about"), slug: lang === "en" ? "/en/about/" : "/it/chi-siamo" },
    { nome: t(lang, "footer_redaction"), slug: lang === "en" ? "/en/about/#la-redazione" : "/it/chi-siamo#la-redazione" },
    { nome: t(lang, "footer_redaction_history"), slug: lang === "en" ? "/en/about/#redazione-storica" : "/it/chi-siamo#redazione-storica" },
    { nome: t(lang, "footer_collaborators"), slug: lang === "en" ? "/en/about/#collaboratori" : "/it/chi-siamo#collaboratori" },
    { nome: t(lang, "footer_wrote_for_us"), slug: lang === "en" ? "/en/about/#hanno-scritto-per-noi" : "/it/chi-siamo#hanno-scritto-per-noi" },
    { nome: t(lang, "footer_diari"), slug: lang === "en" ? "/en/sections/diaries/" : "/it/rubriche/diari/" },
    { nome: t(lang, "footer_contacts"), slug: lang === "en" ? "/en/about/#contatti" : "/it/chi-siamo#contatti" },
    { nome: t(lang, "nav_newsletter"), slug: lang === "en" ? "/en/newsletter/" : "/it/newsletter" }
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
  const homeHref = lang === "en" ? "/en/" : "/";
  const footerLegalText = lang === "en" ? "Quarterly magazine. Registered publication at the Court of Rome, registration no. 1 of January 16, 2020. Editorial office and administration: Via dei Cessati Spiriti 3, 00185 Rome." : "Rivista trimestrale. Testata registrata presso il Tribunale di Roma, iscrizione n. 1 del 16 gennaio 2020. Direzione, redazione e amministrazione: Via dei Cessati Spiriti 3, 00185 Roma.";
  const footerCcText = lang === "en" ? "(c) 1974-2026 Unless otherwise indicated, the content of this site is licensed under" : "(c) 1974-2026 Eccetto dove diversamente indicato, il contenuto di questo sito \xE8 concesso in licenza";
  const ccLicenseLabel = lang === "en" ? "Creative Commons: Attribution - NonCommercial - ShareAlike 4.0 International (CC BY-NC-SA 4.0)" : "Creative Commons: Attribuzione - Non commerciale - Condividi allo stesso modo 4.0 Internazionale (CC BY-NC-SA 4.0)";
  return renderTemplate(_a || (_a = __template(["", '<div class="footer-reveal-wrap" data-astro-cid-sz7xmlte> <div class="reveal-spacer" aria-hidden="true" data-astro-cid-sz7xmlte></div> <footer class="site-footer" id="site-footer" role="contentinfo" data-pagefind-ignore data-astro-cid-sz7xmlte> <div class="footer-inner" data-astro-cid-sz7xmlte> <div class="footer-grid" data-astro-cid-sz7xmlte> <!-- Colonna 1: Identit\xE0 (logo, tagline, editore, legale, social in fondo) --> <div class="footer-col footer-col-identity" data-astro-cid-sz7xmlte> <a', ' class="footer-logo-link" data-astro-cid-sz7xmlte> <img', ' alt="Ombre e Luci" class="footer-logo" width="160" height="55" data-astro-cid-sz7xmlte> </a> <p class="footer-tagline" data-astro-cid-sz7xmlte>', '</p> <p class="footer-editor" data-astro-cid-sz7xmlte> ', ' <a href="https://www.fedeeluce.it" target="_blank" rel="noopener noreferrer" class="footer-link" data-astro-cid-sz7xmlte>Associazione Fede e Luce A.P.S.</a> </p> <p class="footer-legal" data-astro-cid-sz7xmlte>', '</p> <div class="footer-social"', " data-astro-cid-sz7xmlte> ", ' </div> </div> <!-- Colonna 2: Chi siamo --> <div class="footer-col" data-astro-cid-sz7xmlte> <h3 class="footer-title" data-astro-cid-sz7xmlte>', '</h3> <ul class="footer-list" data-astro-cid-sz7xmlte> ', ' </ul> </div> <!-- Colonna 3: Temi (due colonne, una sola intestazione) --> <div class="footer-col footer-col-temi" data-astro-cid-sz7xmlte> <h3 class="footer-title" data-astro-cid-sz7xmlte>', '</h3> <div class="footer-temi-grid" data-astro-cid-sz7xmlte> <ul class="footer-list" data-astro-cid-sz7xmlte> ', ' </ul> <ul class="footer-list" data-astro-cid-sz7xmlte> ', ' </ul> </div> </div> <!-- Colonna 4: Sezioni --> <div class="footer-col" data-astro-cid-sz7xmlte> <h3 class="footer-title" data-astro-cid-sz7xmlte>', '</h3> <ul class="footer-list" data-astro-cid-sz7xmlte> ', ' </ul> </div> <!-- Colonna 5: Info & Privacy --> <div class="footer-col" data-astro-cid-sz7xmlte> <h3 class="footer-title" data-astro-cid-sz7xmlte>', '</h3> <ul class="footer-list" data-astro-cid-sz7xmlte> ', ' </ul> </div> </div> <div class="footer-bottom" data-astro-cid-sz7xmlte> <p class="footer-copy-cc" data-astro-cid-sz7xmlte><span class="footer-copy-inline" data-astro-cid-sz7xmlte>', '</span> <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.it" target="_blank" rel="noopener noreferrer" class="footer-link" data-astro-cid-sz7xmlte>', '</a>.</p> <p class="footer-legal-bottom" data-astro-cid-sz7xmlte>', " - C.F. ", " | ", " ", "</p> </div> </div> </footer> <!-- Fallback copertine: R2 404 / img rotta \u2192 placeholder (anche con View Transitions) --> <script>\n    (function () {\n      var ph = '/images/placeholder-copertina.svg';\n      function bindImg(img) {\n        if (img.getAttribute('data-copertina-fallback') == null) return;\n        if (img.dataset.copertinaFallbackJs === '1') return;\n        img.dataset.copertinaFallbackJs = '1';\n        img.addEventListener(\n          'error',\n          function () {\n            try {\n              var u = String(img.getAttribute('src') || '');\n              if (u.indexOf(ph) === -1) {\n                img.removeAttribute('srcset');\n                img.src = ph;\n              }\n            } catch (e) {}\n          },\n          { capture: false }\n        );\n      }\n      function bindAll() {\n        document.querySelectorAll('img[data-copertina-fallback]').forEach(bindImg);\n      }\n      bindAll();\n      document.addEventListener('astro:page-load', bindAll);\n    })();\n  <\/script> </div> "])), maybeRenderHead(), addAttribute(homeHref, "href"), addAttribute(logo.src, "src"), t(lang, "footer_tagline"), t(lang, "footer_edited_by"), footerLegalText, addAttribute(lang === "en" ? "Follow us" : "Seguici", "aria-label"), socialLinks.map((s) => renderTemplate`<a${addAttribute(s.url, "href")} target="_blank" rel="noopener noreferrer" class="footer-social-link"${addAttribute(s.nome, "aria-label")} data-astro-cid-sz7xmlte> ${s.icon === "facebook" && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" data-astro-cid-sz7xmlte></path></svg>`} ${s.icon === "instagram" && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" data-astro-cid-sz7xmlte></path></svg>`} ${s.icon === "x" && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" data-astro-cid-sz7xmlte></path></svg>`} ${s.icon === "youtube" && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" data-astro-cid-sz7xmlte></path></svg>`} ${s.icon === "tiktok" && renderTemplate`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" data-astro-cid-sz7xmlte></path></svg>`} </a>`), t(lang, "footer_about"), aboutLinks.map((item) => renderTemplate`<li data-astro-cid-sz7xmlte> <a${addAttribute(item.slug, "href")} class="footer-link" data-astro-cid-sz7xmlte>${item.nome}</a> </li>`), t(lang, "nav_themes"), temiCol1.map((cat) => renderTemplate`<li data-astro-cid-sz7xmlte> <a${addAttribute(cat.href, "href")} class="footer-link" data-astro-cid-sz7xmlte>${cat.nome}</a> </li>`), temiCol2.map((cat) => renderTemplate`<li data-astro-cid-sz7xmlte> <a${addAttribute(cat.href, "href")} class="footer-link" data-astro-cid-sz7xmlte>${cat.nome}</a> </li>`), t(lang, "nav_sections"), sezioniFormali.map((cat) => renderTemplate`<li data-astro-cid-sz7xmlte> <a${addAttribute(cat.href, "href")} class="footer-link" data-astro-cid-sz7xmlte>${cat.nome}</a> </li>`), t(lang, "footer_info_privacy"), legalLinks.map((item) => renderTemplate`<li data-astro-cid-sz7xmlte> <a${addAttribute(item.url, "href")} target="_blank" rel="noopener noreferrer" class="footer-link" data-astro-cid-sz7xmlte>${item.nome}</a> </li>`), footerCcText, ccLicenseLabel, lang === "en" ? "Fede e Luce Association APS" : "Associazione Fede e Luce Aps", CODICE_FISCALE, lang === "en" ? "RUNTS registration no." : "Iscrizione al RUNTS n.", RUNTS);
}, "C:/Users/berto/Documents/Ombreeluci/src/components/Footer.astro", void 0);

export { $$Header as $, AMOUNT_CHIPS as A, CCP as C, EMAIL as E, INTESTATARIO as I, NUMERI_ANNO as N, PAYPAL_DONATE_URL as P, RUNTS as R, localizeFormalType as a, localizeIssuePeriodLabel as b, $$Footer as c, localizeTheme as d, ABBONAMENTO_ANNO as e, ABBONAMENTO_MESE as f, getAuthorBasePath as g, IBAN_RAW as h, IBAN_DISPLAY as i, CCP_DISPLAY as j, CF as k, localizeCategory as l, t, ultimoNumeroData as u };
