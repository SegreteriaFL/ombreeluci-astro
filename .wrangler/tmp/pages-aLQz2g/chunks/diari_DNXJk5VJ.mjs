globalThis.process ??= {}; globalThis.process.env ??= {};
const DIARISTI = [
  {
    nome: "Arianna Giuliano",
    authorSlug: "arianna-giuliano",
    diarioSlug: "diario-di-arianna",
    titoloDiario: "NasoMano",
    descrizioneDiario: "Mi chiamo Arianna, sono nata a Milano il 17 giugno 1992. Ho una disabilità dalla nascita ma questo non mi ha mai fermata dal pormi continuamente obiettivi sempre più difficili da raggiungere. Ora il mio progetto è quello di realizzarmi lavorativamente."
  },
  {
    nome: "Benedetta Mattei",
    authorSlug: "benedetta-mattei",
    diarioSlug: "diario-di-benedetta",
    titoloDiario: "Benedetta ragazza!",
    descrizioneDiario: 'Nata a Roma il 1 gennaio 2004, frequenta il secondo anno all’Istituto alberghiero "Gioberti" a Trastevere, con l’obiettivo di lavorare come receptionist e cameriera sfruttando le sue conoscenze di ricette culinarie e ristoranti. Tra le sue passioni ci sono lo sport e il teatro.'
  },
  {
    nome: "Giovanni Grossi",
    authorSlug: "giovanni-grossi",
    diarioSlug: "diario-di-giovanni",
    titoloDiario: "Senza Filtro",
    descrizioneDiario: "Sono nato a Roma nel 1970, da Lorenzo Grossi e Paola Pisenti. Ho fatto l’asilo a Milano ed a Pomigliano D’Arco, le elementari e la prima media a Pomigliano D’Arco e poi ho fatto le medie a Roma nella scuola Esopo quando ancora era in via Fogliano."
  },
  {
    nome: "Efrem Sardella",
    authorSlug: "efrem-sardella",
    diarioSlug: "diario-di-efrem",
    titoloDiario: "Articolo 1",
    descrizioneDiario: "Scrivo brevi memorie sui tanti tentativi di inserirmi nel mondo del lavoro sperando che il racconto dei miei successi e fallimenti possa essere di utilità per qualcun altro."
  },
  {
    nome: "Luciana Spigolon",
    authorSlug: "luciana-spigolon",
    diarioSlug: "diario-di-luciana",
    titoloDiario: "Vite preziose",
    descrizioneDiario: "Padovana classe 1962, Luciana condivide riflessioni e quotidianità della sua vita con due fratelli con disabilità grave, Giorgio e Cristina."
  },
  {
    nome: "Antonietta Pantone",
    authorSlug: "antonietta-pantone",
    diarioSlug: "diario-di-antonietta",
    titoloDiario: "Il giardino che nessuno sa",
    descrizioneDiario: "Consigliera di bellezza. Sono nata a Roma il 28/03/1990 dove vivo con mia madre e mia sorella gemella. Dal 2006 al 2011 ho frequentato il liceo psico pedagogico di Potenza, poi dal 2013 al 2016 ho frequentato un anno di Alberghiero sempre a Potenza. Sto in prima linea per combattere l’indifferenza contro la disabilità."
  },
  {
    nome: "Davide Passeri",
    authorSlug: "davide-passeri",
    diarioSlug: "diario-di-davide",
    titoloDiario: "Il mondo ascoltato da me",
    descrizioneDiario: "Vivo a Roma, mi piace l’informatica, la telefonia e sono un audiofilo."
  }
];
const NOMI_DIARISTI = new Set(DIARISTI.map((d) => d.nome));
function getDiaristaByDiarioSlug(diarioSlug) {
  return DIARISTI.find((d) => d.diarioSlug === diarioSlug);
}
function getDiaristiWithMeta(autoriById) {
  return DIARISTI.map((d) => ({
    ...d,
    fotoUrl: autoriById[d.authorSlug]?.foto_url || ""
  }));
}

export { DIARISTI as D, NOMI_DIARISTI as N, getDiaristaByDiarioSlug as a, getDiaristiWithMeta as g };
