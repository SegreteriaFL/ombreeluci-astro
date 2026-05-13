/**
 * I Diari di Ombre e Luci - autori e metadati statici (slug, titolo).
 * Le descrizioni vivono in Directus: collection serie, slug = diarioSlug.
 */

export interface Diarista {
  nome: string;
  authorSlug: string;
  diarioSlug: string;
  titoloDiario: string;
}

export const DIARISTI: Diarista[] = [
  { nome: "Arianna Giuliano",   authorSlug: "arianna-giuliano",   diarioSlug: "diario-di-arianna",   titoloDiario: "NasoMano"                  },
  { nome: "Benedetta Mattei",   authorSlug: "benedetta-mattei",   diarioSlug: "diario-di-benedetta", titoloDiario: "Benedetta ragazza!"         },
  { nome: "Giovanni Grossi",    authorSlug: "giovanni-grossi",    diarioSlug: "diario-di-giovanni",  titoloDiario: "Senza Filtro"              },
  { nome: "Efrem Sardella",     authorSlug: "efrem-sardella",     diarioSlug: "diario-di-efrem",     titoloDiario: "Articolo 1"                },
  { nome: "Luciana Spigolon",   authorSlug: "luciana-spigolon",   diarioSlug: "diario-di-luciana",   titoloDiario: "Vite preziose"             },
  { nome: "Antonietta Pantone", authorSlug: "antonietta-pantone", diarioSlug: "diario-di-antonietta",titoloDiario: "Il giardino che nessuno sa" },
  { nome: "Davide Passeri",     authorSlug: "davide-passeri",     diarioSlug: "diario-di-davide",    titoloDiario: "Il mondo ascoltato da me"  },
  { nome: "Valeria Antonucci",  authorSlug: "valeria-antonucci",  diarioSlug: "diario-di-valeria",   titoloDiario: "Scorribande"               },
];

export const NOMI_DIARISTI = new Set(DIARISTI.map((d) => d.nome));

export function isDiarista(authorName: string): boolean {
  return NOMI_DIARISTI.has(authorName);
}

export function getDiaristaByDiarioSlug(diarioSlug: string): Diarista | undefined {
  return DIARISTI.find((d) => d.diarioSlug === diarioSlug);
}

export function getDiaristaByAuthorName(nome: string): Diarista | undefined {
  return DIARISTI.find((d) => d.nome === nome);
}

export interface DiaristaConMeta extends Diarista {
  fotoUrl: string;
}

export function getDiaristiWithMeta(autoriById: Record<string, { foto_url?: string }>): DiaristaConMeta[] {
  return DIARISTI.map((d) => ({
    ...d,
    fotoUrl: autoriById[d.authorSlug]?.foto_url || "",
  }));
}