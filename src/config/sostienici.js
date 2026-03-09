/**
 * Configurazione pagina Sostienici / Donazioni / 5x1000.
 * Unica fonte per dati legali e link; RUNTS un solo valore usato ovunque.
 */

/** Iscrizione RUNTS (verificare: 15031 vs 150312; usare il valore ufficiale) */
export const RUNTS = '15031';

export const CODICE_FISCALE = '96000680585';

/** Intestatario per bonifici e CCP */
export const INTESTATARIO = 'Associazione Fede e Luce APS';

/** IBAN bonifico (anche continuativo) - senza spazi per copy */
export const IBAN_RAW = 'IT02S0760103200000055090005';
/** IBAN formattato per visualizzazione */
export const IBAN_DISPLAY = 'IT 02 S076 0103 2000 0005 5090 005';

/** Conto corrente postale */
export const CCP_NUMERO = '55090005';
export const CCP_DISPLAY = 'Conto Corrente Postale n. 55090005';

/** Email contatto rivista */
export const EMAIL_CONTATTO = 'ombreeluci@fedeeluce.it';

/** Abbonamento */
export const ABBONAMENTO_MENSILE_EUR = 2;
export const ABBONAMENTO_ANNUO_EUR = 20;
export const NUMERI_ANNO = 4;

/** Link PayPal/Stripe: abbonamento (configurabile, vuoto = nasconde CTA o usa mailto) */
export const PAYPAL_ABBONAMENTO_URL = '';
/** Link PayPal/Stripe: donazione */
export const PAYPAL_DONAZIONE_URL = '';

/** Causale suggerita bonifico abbonamento */
export const CAUSALE_ABBONAMENTO = 'Abbonamento Ombre e Luci';
/** Causale suggerita bonifico donazione */
export const CAUSALE_DONAZIONE = 'Donazione Ombre e Luci';

/** Link bilanci (trasparenza); vuoto = solo testo "Bilanci pubblici e consultabili" */
export const BILANCI_URL = '';

/** Testimonianza breve (una riga) – autore e città opzionali */
export const TESTIMONIAL = {
  text: 'Ombre e Luci ci ha aiutati a sentirci meno soli.',
  author: 'Lettrice',
  city: 'Roma',
};
