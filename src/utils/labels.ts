/**
 * Dizionario etichette i18n (re-export da i18n.ts).
 * LEGGI ANCHE -> READ ALSO, Articoli in inglese -> English articles, Cerca... -> Search..., Menu -> Menu.
 */

import type { Locale } from './i18n';
import { translations, t } from './i18n';

export { translations, t, getLangFromUrl } from './i18n';
export type { Locale } from './i18n';

/** Etichette usate in Header e card (alias per coerenza con richiesta) */
export const LABELS = {
  read_also: (locale: Locale) => t(locale, 'read_also'),       // LEGGI ANCHE / READ ALSO
  english_articles: (locale: Locale) => t(locale, 'english_articles'),
  search_placeholder: (locale: Locale) => t(locale, 'search_placeholder'), // Cerca... / Search...
  nav_menu: (locale: Locale) => t(locale, 'nav_menu'),         // Menù / Menu
} as const;
