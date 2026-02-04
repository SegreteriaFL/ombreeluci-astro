/**
 * Config pagina Sostieni / Support (conversione donazione mensile PayPal).
 * Fonte unica per dati e varianti hero.
 */

export const PAYPAL_DONATE_URL = 'https://www.paypal.com/donate/?hosted_button_id=ARYLM4RPUV788';

export const CF = '96000680585';
/** Alias per Footer e altri usi legali */
export const CODICE_FISCALE = CF;
export const RUNTS = '15031';

export const INTESTATARIO = 'Associazione Fede e Luce APS';
export const IBAN_RAW = 'IT02S0760103200000055090005';
export const IBAN_DISPLAY = 'IT02 S076 0103 2000 0005 5090 005';
export const CCP = '55090005';
export const CCP_DISPLAY = 'Conto Corrente Postale n. 55090005';
export const EMAIL = 'ombreeluci@fedeeluce.it';

/** Variante hero: "A" = Luce, "B" = Classica. Cambiare qui o via query ?v=luce | ?v=classica */
export type HeroVariant = 'A' | 'B';
export const DEFAULT_HERO_VARIANT: HeroVariant = 'A';

export const HERO_VARIANTS = {
  A: {
    eyebrow: 'Meglio accendere una luce…',
    headline: 'che maledire l\'oscurità.',
    sub: 'Ombre e Luci prova ad accenderla ogni giorno con storie, cultura e uno sguardo libero sulla disabilità. La luce però non è gratis: se puoi, sostienici con una piccola donazione mensile.',
    cta: 'Accendo una luce ogni mese',
  },
  B: {
    eyebrow: 'Sostieni Ombre e Luci',
    headline: 'Con una donazione mensile ci aiuti a esserci, tutto l\'anno.',
    sub: 'Senza sponsor. Solo lettori e persone che credono in un racconto rispettoso e libero della disabilità.',
    cta: 'Sostengo ogni mese',
  },
} as const;

/** Importi suggeriti (€/mese o una tantum) */
export const AMOUNT_CHIPS = [5, 10, 20, 50] as const;
export const AMOUNT_OTHER = 'other';

/** Abbonamento */
export const ABBONAMENTO_ANNO = 20;
export const ABBONAMENTO_MESE = 2;
export const NUMERI_ANNO = 4;
