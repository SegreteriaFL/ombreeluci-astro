var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// _worker.js/_astro-internal_middleware.mjs
var astro_internal_middleware_exports = {};
__export(astro_internal_middleware_exports, {
  onRequest: () => onRequest
});
import { d as defineMiddleware2, s as sequence2 } from "./chunks/index_B-gW6nkE.mjs";
import "./chunks/astro-designed-error-pages_DfD573yd.mjs";
var redirectsLegacy, REDIRECTS, DATE_PATH_RE, onRequest$2, When, isBuildContext, whenAmI, middlewares, onRequest$1, onRequest;
var init_astro_internal_middleware = __esm({
  "_worker.js/_astro-internal_middleware.mjs"() {
    "use strict";
    globalThis.process ??= {};
    globalThis.process.env ??= {};
    redirectsLegacy = {
      "/ombre-e-luci-n-1-1983-sfogliabile/": "/blog/ombre-e-luci-n-3-1983-sfogliabile/",
      "/ombre-e-luci-n-1-1983/": "/blog/ombre-e-luci-n-3-1983-sfogliabile/",
      "/editoriale-4-la-sindrome-down/": "/blog/editoriale-4-il-mio-bambino-con-la-sindrome-down/",
      "/centro-di-formazione-professionale-dell-opera-francescana-charitas-di-vicenza/": "/blog/vicenza-centro-di-formazione-professionale-dell-opera-francescana-charitas/",
      "/dialogo-aperto-n-2/": "/blog/dialogo-aperto-numero-2/",
      "/nessun-uomo-e-una-pietr/": "/blog/nessun-uomo-e-una-pietra/",
      "/e-sempre-stato-rifiutato__trashed/": "/blog/e-sempre-stato-rifiutato/",
      "/il-bambino-trisomico/": "/blog/trisomia-21-la-sindrome-down/",
      "/chiediamo-alle-comunita-religiose/": "/blog/secondo-le-possibilita-e-secondo-il-vangelo-chiediamo-alle-comunita-religiose/",
      "/la-riabilitazione/": "/blog/la-riabilitazione-nella-scuole-ma-la-bambina-non-e-tenuta-in-classe/",
      "/psicosi-precoci/": "/blog/psicosi-precoci-che-cosa-sono/",
      "/un-centro-per-la-cura-della-psicosi/": "/blog/oltre-la-scienza-umanita-e-buon-senso-in-un-centro-per-la-cura-della-psicosi/",
      "/oltre-la-scienza-e-l-umanita-un-centro-per-la-cura-della-psicosi/": "/blog/oltre-la-scienza-umanita-e-buon-senso-in-un-centro-per-la-cura-della-psicosi/",
      "/consigli-utili/": "/blog/psicosi-infantile-alcuni-consigli-utili/",
      "/una-verita-difficile-a-dirsi/": "/blog/integrazione-a-scuola-una-verita-difficile-a-dirsi/",
      "/il-volontariato/": "/blog/quando-e-volontariato/",
      "/storia-di-unadozione/": "/blog/il-nostro-cucciolo-di-due-metri-storia-di-un-adozione/",
      "/dialogo-aperto/": "/blog/dialogo-aperto-n-9/",
      "/dialogo-aperto-n-10/": "/blog/dialogo-aperto-n-9/",
      "/e_gli_altri-_figli_consigli_per_-i_-genitori_di_bambino_disabile/": "/blog/altri_figli_consigli_per_genitori_bambino_disabile/",
      "/un-piccolo-vademecum-comportarsi-fratelli-le-sorelle/": "/blog/altri_figli_consigli_per_genitori_bambino_disabile/",
      "/ma-dopo-rincontro-non-li-vedo-piu/": "/blog/ma-dopo-l-incontro-non-li-vedo-piu/",
      "/mio-e-fra-tello-era-handicappato/": "/blog/mio-fratello-era-handicappato/",
      "/mi-saro-unidea/": "/blog/mi-saro-fatto-un-idea/",
      "/essere-vicini-fin-vita/": "/blog/essere-vicini-a-chi-e-in-fin-di-vita/",
      "/un-mondo-scoprire-camminando-fermandoci-2/": "/blog/un-mondo-scoprire-camminando-fermandoci/",
      "/prepariamolo-vivere-gli-altri/": "/blog/prepariamolo-vivere-con-gli-altri/",
      "/\u30E1\u30EA\u30FC\u30AF\u30EA\u30B9\u30DE\u30B9/": "/blog/natale-giappone/",
      "/feliz-natal/": "/blog/natale-brasile/",
      "/dialogo-aperto-n-11/": "/blog/dialogo-aperto-n-13/",
      "/c-po\u0436\u0434\u0435ctbom/": "/blog/natale-russia/",
      "/sretan-bozi/": "/blog/natale-slovenia/",
      "/la-sfida-dellarca-2/": "/blog/la-sfida-dellarca-recensione/",
      "/voi-che-avreste-fatto/": "/blog/il-peso-degli-sguardi/",
      "/le-parole-martini/": "/blog/i-genitori-commentano-le-parole-del-cardinal-martini/",
      "/perche-venuti-ad-assisi/": "/blog/siamo-venuti-ad-assisi-per/",
      "/grazie-san-francesco-venuto-camminare/": "/blog/grazie-san-francesco-venuto-camminare-con-noi/",
      "/signore-uno-strumento-della-tua-pace/": "/blog/signore-fa-di-me-uno-strumento-della-tua-pace/",
      "/lettera-di-una-mamma/": "/blog/la-fortuna-di-avere-daniela-lettera-di-una-mamma/",
      "/tutto-quello-che-ha-f/": "/blog/tutto-quello-che-ha-fatto-per-noi/",
      "/convento-seconda-famiglia-giampiero/": "/blog/convento-una-seconda-famiglia-per-giampiero/",
      "/arrivano-fatt-curagg/": "/blog/quando-arrivano-fatti-coraggio/",
      "/numero-17-adulti-sfogliabile/": "/blog/ombre-luci-n-17-1987-sfogliabile/",
      "/numero-17-1987-sfogliabile/": "/blog/ombre-luci-n-17-1987-sfogliabile/",
      "/ombre-e-luci-n-18-1987-sfogliabile/": "/blog/ombre-luci-n-18-1987-sfogliabile/",
      "/numero-18-1987-sfogliabile/": "/blog/ombre-luci-n-18-1987-sfogliabile/",
      "/numero-16-1986-sfogliabile/": "/blog/ombre-luci-n-16-1986-sfogliabile/",
      "/ombre-luci-n-14-1986-sfogliabile-2/": "/blog/ombre-luci-n-14-1986-sfogliabile/",
      "/ombre-luci-n-11-1986-sfogliabile/": "/blog/ombre-luci-n-11-1985-sfogliabile/",
      "/non-so-dirlo/": "/blog/non-so-come-ne-a-chi-dirlo/",
      "/dal-diario-uninsegnante/": "/blog/dal-diario-di-un-insegnante/",
      "/pietre-paragone/": "/blog/la-persona-con-disabilita-come-fonte-di-unita-nella-chiesa/",
      "/dove-vivono-come-vivono/": "/blog/villa-san-giovanni-di-dio/",
      "/vivono-vivono-le-persone-colpite-malattia-mentale/": "/blog/dove-come-vivono-persone-colpite-malattia-mentale/",
      "/boccati-nel-sogno/": "/blog/bloccati-nel-sogno/",
      "/scuola-ricamo-stare-insieme-divertendoci/": "/blog/scuola-ricamo-imparare-divertendoci/",
      "/fare-teatro/": "/blog/fare-teatro-persone-disabili/",
      "/dialogo-aperto-m-24/": "/blog/dialogo-aperto-n-24/",
      "/conoscere-lhandicap-autismo/": "/blog/conoscere-handicap-autismo/",
      "/sotto-rocchio-dellorologio/": "/blog/christopher-nolan-sotto-locchio-dellorologio/",
      "/ascolta-bone-joseph/": "/blog/ascolta-bene-joseph/",
      "/rimini-ex-mattatoio-riqualificato-a-centro-di-accoglienza-per-disabilita/": "/blog/riccione-ex-mattatoio-riqualificato-a-centro-di-accoglienza-per-disabilita/",
      "/una-grande-famiglia-del-mondo/": "/blog/fede-e-luce-una-grande-famiglia-del-mondo/",
      "/un-campeggio-rocca-papa-ora-comincia-bello/": "/blog/vita-fede-e-luce-n-11-un-campeggio-rocca-papa-ora-comincia-bello/",
      "/incontro-internazionale-edimburgo-1-9-agosto-1990/": "/blog/incontro-internazionale-edimburgo-agosto-1990/",
      "/malattia-mentale-e-legge/": "/blog/malattia-mentale-legge-180/",
      "/un-territorio-molti-progetti/": "/blog/primavalle-un-territorio-molti-progetti/",
      "/se/": "/blog/anche-noi-siamo-persone/",
      "/diaolog/": "/blog/dialogo-aperto-n-35/",
      "/treviso-in-your-shoes-il-concorso-studentesco-per-progetti-di-inclusione-sociale/": "/blog/in-your-shoes-concorso-studenti-inclusione/",
      "/piu-che-una-rivista-una-grande-famiglia/": "/blog/10-anni-di-ombre-e-luci-piu-che-una-rivista-una-grande-famiglia/",
      "/unestate-di-campi-fede-e-luce-2/": "/blog/ridere-a-partire-dal-corpo/",
      "/non-si-puo-ridere-che-dellhandicap-2/": "/blog/ridere-a-partire-dal-corpo/",
      "/la-sedia-a-rotelle-e-i-chicchi-duva-2/": "/blog/ridere-a-partire-dal-corpo/",
      "/dalle-province-n-127-2/": "/blog/ridere-a-partire-dal-corpo/",
      "/un-panorama-da-riscoprire/": "/blog/ridere-a-partire-dal-corpo/",
      "/un-gettone-di-liberta/": "/blog/ridere-a-partire-dal-corpo/",
      "/un-gettone-di-liberta-recensione-2/": "/blog/ridere-a-partire-dal-corpo/",
      "/ridere-a-partire-dal-corpo-2/": "/blog/un-dado-vegetale-da-sogno-e-fatto-in-casa/",
      "/un-gettone-di-liberta-2/": "/blog/mio-figlio-luciano/",
      "/la-nostra-vita-insieme-recensione-2/": "/blog/mio-figlio-luciano/",
      "/di-padre-in-figlio-conversazioni-sul-rischio-di-educare-recensione-2/": "/blog/mio-figlio-luciano/",
      "/dialogo-aperto-n-127-2/": "/blog/mio-figlio-luciano/",
      "/la-carrozzina-sulle-macerie-2/": "/blog/mio-figlio-luciano/",
      "/umorismo-e-handicap-un-terreno-minato-2/": "/blog/mio-figlio-luciano/",
      "/ridere-e-una-cosa-seria-2/": "/blog/mio-figlio-luciano/",
      "/diritti-delle-persone-disabili/": "/blog/diritti-delle-persone-disabili-secondo-onu/",
      "/viola-e-mimosa/": "/blog/liberta/",
      "/vite-straordinarie-3/": "/blog/liberta/",
      "/dalle-province-n-144-2/": "/blog/liberta/",
      "/dialogo-aperto-n-144-2/": "/blog/liberta/",
      "/meglio-di-come-ci-si-aspetta-2/": "/blog/liberta/",
      "/mi-chiamo-lucia-2/": "/blog/liberta/",
      "/anffas-60-anni-di-futuro-2/": "/blog/liberta/",
      "/tutti-possono-essere-santi-2/": "/blog/liberta/",
      "/casa-loic/": "/blog/inaugurazione-casa-loic-scuola-laboratorio-artigianale-per-ragazzi-disabili/",
      "/casa-loic-scuola-laboratorio-artigianale-per-ragazzi-disabili/": "/blog/inaugurazione-casa-loic-scuola-laboratorio-artigianale-per-ragazzi-disabili/",
      "/una-mappa-di-ricordi-virtuale-per-contrastare-lalzheimer/": "/blog/alzheimer-vita-ricordi/",
      "/diversi-da-chi-diversi-da-chi-normali-vite-con-handicap/": "/blog/diversi-da-chi-normali-vite-con-handicap/",
      "/la-nostra-meglio-gioventu-fano-2018/": "/blog/fano2018/",
      "/in-alto-in-basso/": "/blog/luca-mio-figlio-autistico/",
      "/esperienza-di-un-obiettore-in-una-comunita/": "/blog/ho-guadagnato-un-anno-al-carro/",
      "/vestita-di-nuvole2/": "/blog/vestita-di-nuvole/",
      "/bozza-automatica/": "/blog/catechesi-anche-per-le-persone-autistiche/",
      "/insieme-si-puo/": "/blog/soluzione-per-malati-mentali-insieme-si-puo/",
      "/la-nostra-casa/": "/blog/comunita-tau-la-nostra-casa/",
      "/comunita-taula-nostra-casa/": "/blog/comunita-tau-la-nostra-casa/",
      "/il-mio-piede-sinistro-2/": "/blog/il-mio-piede-sinistro-il-film/",
      "/rain-man/": "/blog/rain-man-la-recensione/",
      "/figli-di-un-dio-minore/": "/blog/figli-di-un-dio-minore-recensione/",
      "/come-dirlo-2/": "/blog/il-progetto-girotondo/",
      "/non-era-normale-2/": "/blog/il-mistero-di-tanto-bene/",
      "/laltra-famiglia-storie-e-percorsi-di-affido-al-villaggio-sos-recensione/": "/blog/viola-e-mimosa-a-manila/",
      "/io-sono-qui-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/mai-piu-soli-lavventura-di-fede-e-luce-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/fede-e-luce-dalle-province-n-121-2/": "/blog/viola-e-mimosa-a-manila/",
      "/da-citta-del-messico/": "/blog/viola-e-mimosa-a-manila/",
      "/viola-e-mimosa-da-citta-del-messico-2/": "/blog/viola-e-mimosa-a-manila/",
      "/dialogo-aperto-n-121-2/": "/blog/viola-e-mimosa-a-manila/",
      "/un-po-di-follia-per-fare-meraviglie-2/": "/blog/viola-e-mimosa-a-manila/",
      "/per-una-vita-di-comunione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/jean-christophe-parisot-un-cercatore-di-dio-2/": "/blog/viola-e-mimosa-a-manila/",
      "/bartimeo-uomo-solo-in-mezzo-alla-folla-2/": "/blog/viola-e-mimosa-a-manila/",
      "/qualcuno-aspetta-2/": "/blog/viola-e-mimosa-a-manila/",
      "/una-comunita-e-essere-insieme-2/": "/blog/viola-e-mimosa-a-manila/",
      "/primavera-di-fede-2/": "/blog/viola-e-mimosa-a-manila/",
      "/prendetene-e-mangiatene-tutti-2/": "/blog/viola-e-mimosa-a-manila/",
      "/intervista-a-jean-vanier-2/": "/blog/viola-e-mimosa-a-manila/",
      "/cosi-e-sceso-dal-trono-2/": "/blog/viola-e-mimosa-a-manila/",
      "/io-sono-nato-cosi-come-imparare-a-guardare-oltre-la-differenza-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/come-pinguini-nel-deserto-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/una-notte-ho-sognato-che-parlavi-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/carissimo-cardinale-2/": "/blog/viola-e-mimosa-a-manila/",
      "/la-figlia-dellaltra-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/il-vangelo-dei-vinti-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/annachiara-bortolotti-ed-curcu-genovese-pp-125/": "/blog/viola-e-mimosa-a-manila/",
      "/chiamami-alex-recensione-2/": "/blog/viola-e-mimosa-a-manila/",
      "/momenti-misteriosi-2/": "/blog/il-carro-una-casa-famiglia-per-tutti/",
      "/quando-a-raccontare-lolocausto-sono-gli-ex-naxisti/": "/blog/recensione-final-account/",
      "/disabilita-e-quei-bisogni-non-ascoltati/": "/blog/recensione-listen/",
      "/come-difficile-convivere-con-lepatite-b/": "/blog/recensione-the-best-is-yet-to-come/",
      "/perso-nella-traduzione/": "/blog/recensione-quo-vadis-aida/",
      "/oaza-ai-confini-della-finzione/": "/blog/recensione-oaza/",
      "/barriere-invisibili-al-cuore-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/mi-saro-fatto-unidea-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/fede-e-luce-essere-movimento-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/proprio-io-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/un-tesoro-inestimabile-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/il-dono-dellunita-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/custodire-ogni-persona-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/la-poverta-delle-beatitudini-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/una-profezia-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/e-ci-si-sente-un-po-soli-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/tutti-insieme-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/fragile-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/la-scossa-della-vunerabilita-2/": "/blog/mai-piu-soli-tre-testimonianze/",
      "/programma-del-pellegrinaggio-a-roma-del-1975-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/perche-questo-pellegrinaggio-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/bilancio-fede-e-luce-1975-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/i-piu-difficili-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/mi-sento-in-crisi-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/festa-della-luce-1976-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/pennellate-dai-centri-fede-e-luce-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/incontrarsi-il-venerdi-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/resoconto-della-riunione-internazionale-di-fede-e-luce-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/vedremo-mai-la-luce-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-3/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/esperienze-un-week-end-fuori-dallordinario-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/dove-lo-prendo-tanto-amore-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/xavier-un-mio-un-nostro-nuovo-a-amico-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/un-metodo-efficace-per-leducazione-dei-bambini-con-disabilita-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/guidare-alla-luce-catechesi-sensoriale-per-una-vita-spirituale-inclusiva-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/letture-consigliate-darti-la-vita-recensione-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/notiziario-fede-e-luce-il-resoconto-dellultima-festa-della-luce-e-altre-notizie-dal-movimento-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/alla-ricerca-delle-vere-vacanze-rompere-gli-schemi-e-scoprire-il-significato-profondo-del-riposo-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/la-vecchia-signora-brontolona-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/i-bambini-autistici-una-guida-per-genitori-recensione-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/a-tutti-i-gruppi-fede-e-luce-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/notiziario-fede-e-luce-dicembre-1977/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/esperienze-estive-fra-arche-e-mary-mount-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/alfedena-1976-esperienze-di-vita-comunitaria-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/attivita-di-tempo-libero-e-vita-comunitaria-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/per-la-nostra-riflessione-una-croce-di-carta-smerigliata-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-11-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/lettera-aperta-a-padre-michel-charpantier-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/editoriale-parliamo-di-insieme-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/bilancio-fede-e-luce-1976-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/gli-altri-un-figlio-subnormale-recensione-libro-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/notiziario-fede-e-luce-n-13-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/fede-e-luce-incontri-internazionali-e-nazionali-1977-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/esperienze-al-club-avance-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/techniche-di-recupero-per-i-disabili-gravi-la-socializzazione-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/per-nostra-riflessione-la-comunione-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-13-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/editoriale-auguri-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/letture-consigliate-n-13-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/parliamo-di-ri-educazione-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/notiziario-fede-e-luce-n-14-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/attivita-di-fine-stagione-del-gruppo-san-paolo-di-roma-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/cosa-si-fa-nelle-casette-di-fede-e-luce-le-risposte-di-chi-ce-stato-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/leducazione-delle-persone-disabili-imparare-a-vestirsi-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/per-la-nostra-riflessione-milano-vederci-piu-chiaro/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/inno-alla-vita-di-una-handicappata-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-14-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/editoriale-vacanze-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/editoriale-amici-o-fratelli-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/editoriale-le-nostre-paure-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-16-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/la-comunita-che-accoglie-di-rifiutati-recensione-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/preparazione-al-pellegrinaggio-fede-e-luce-ad-assisi-1978-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/quando-arrivano-le-vacanze-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-18-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-19-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/quattordici-anni-con-loro-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/per-la-loro-educazione-bilancio-di-unestate-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/alfedena-1978-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/vacanze-1978-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/una-lezione-damore-incontro-fede-e-luce-llalelli-galles-del-sud-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/soggiorno-allarche-1978-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/sono-andata-a-bruxelles-a-fare-volontariato-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/katimavik-una-parole-escquimese-che-vuol-dire-incontro/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/katimavik-una-parola-escquimese-che-vuol-dire-incontro-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/i-bambini-profondamente-handicappati-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/lamore-non-basta-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/aria-di-vacanze-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-22-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/un-compleanno-al-capezzale-di-un-amico-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/mattone-su-mattone-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/focus-gli-adulti-profondamente-handicappati-alcune-testimonianze-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/mio-fratello-marco-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/siamo-stati-dei-buoni-genitori-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/non-avrei-mai-pensato-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/un-antidoto-alla-disperazione-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/sprovveduto-e-sorpreso-chi-non-lo-e-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/incontro-internazionale-a-cuneo-28-29-aprile-1979-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/pellegrinaggio-a-loreto-18-20-maggio-1979/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/pellegrinaggio-a-loreto-1979-raccontato-da-olga-gammarelli/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/perche-vi-chiamate-fede-e-luce-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/ci-hanno-scritto-n-23-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/gli-adulti-lievemente-handicappati/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/trovai-lavoro-in-una-casa-farmaceutica-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/amicizie-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/vuoi-essere-mio-amico-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/saluta-la-tua-insegnante-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/e-domani-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/dialoghi-scomodi-amicizie-vere-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/teresa-2/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/teresa-ventanni-di-cambiamenti-nellapproccio-alla-disabilita/": "/blog/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi/",
      "/genitori-speciali-zzati-servizio-di-consulenza-pedagogica-di-trento-2/": "/blog/qualcosa-e-cambiato/",
      "/gioia-e-le-altre/": "/blog/qualcosa-e-cambiato/",
      "/gioia-e-le-altre-recensione-2/": "/blog/qualcosa-e-cambiato/",
      "/il-chicco-recensione-2/": "/blog/qualcosa-e-cambiato/",
      "/alla-ricerca-di-dory-recensione-2/": "/blog/qualcosa-e-cambiato/",
      "/la-tempesta-di-sasa-recensione-2/": "/blog/qualcosa-e-cambiato/",
      "/se-arianna-recensione-2/": "/blog/qualcosa-e-cambiato/",
      "/viola-e-occhiolino-2/": "/blog/qualcosa-e-cambiato/",
      "/il-valore-del-cammino-insieme-2/": "/blog/qualcosa-e-cambiato/",
      "/nuove-comunita-fede-e-luce-festa-in-umbria-2/": "/blog/qualcosa-e-cambiato/",
      "/accogliere-la-sorpresa-2/": "/blog/qualcosa-e-cambiato/",
      "/il-messaggio-del-giubileo-dialogo-con-mons-rino-fisichella-2/": "/blog/qualcosa-e-cambiato/",
      "/pedagogia-del-dolore-innocente-recensione-2/": "/blog/qualcosa-e-cambiato/",
      "/io-sono-con-te-recensione-2/": "/blog/qualcosa-e-cambiato/",
      "/dalle-province-n-136-2/": "/blog/qualcosa-e-cambiato/",
      "/i-doni-di-dio-2/": "/blog/qualcosa-e-cambiato/",
      "/leducazione-attraverso-lesempio-2/": "/blog/qualcosa-e-cambiato/",
      "/la-misericordia-2/": "/blog/qualcosa-e-cambiato/",
      "/tu-ci-hai-chiamati-eccoci-2/": "/blog/qualcosa-e-cambiato/",
      "/lamicizia-incarnata-2/": "/blog/eccomi-lesempio-di-maria/",
      "/joyeux-noel-3/": "/blog/eccomi-lesempio-di-maria/",
      "/sempre-di-nuovo-ci-commuove-2/": "/blog/eccomi-lesempio-di-maria/",
      "/dialogo-aperto-n-124-2/": "/blog/eccomi-lesempio-di-maria/",
      "/la-bambina-che-andava-a-pile/": "/blog/la-mia-forza-nella-mia-differenza/",
      "/la-bambina-che-andava-a-pile-recensione-2/": "/blog/la-mia-forza-nella-mia-differenza/",
      "/dalle-provice-n-142/": "/blog/la-mia-forza-nella-mia-differenza/",
      "/dalle-province-n-142-2/": "/blog/la-mia-forza-nella-mia-differenza/",
      "/dalle-mamme-di-palidoro-perche-curare-non-significa-solo-guarire-2/": "/blog/la-mia-forza-nella-mia-differenza/",
      "/limportante-e-che-sia-sano-2/": "/blog/dimmi-chi-ammiri/",
      "/raccontami-il-mare-che-hai-dentro-vivere-con-un-figlio-autistico-recensione-2/": "/blog/dimmi-chi-ammiri/",
      "/quello-che-non-ho-mai-detto-e-lisola-di-noi-recensione-di-due-libri-di-federico-de-rosa-2/": "/blog/dimmi-chi-ammiri/",
      "/diaologo-aperto-n-140-2/": "/blog/dimmi-chi-ammiri/",
      "/epigenetica-e-malattie-psichiatriche-2/": "/blog/dimmi-chi-ammiri/",
      "/mi-chiamo-charlotte-fien-e-ho-la-sindrome-di-down-2/": "/blog/dimmi-chi-ammiri/",
      "/non-smettete-di-crederci-mai-recensione-2/": "/blog/dalle-province-n-123/",
      "/persone-prima-che-disabili-una-riflessione-sullhandicap-tra-giustizia-ed-etica-recensione-2/": "/blog/dalle-province-n-123/",
      "/un-dio-inutile-recensione-2/": "/blog/dalle-province-n-123/",
      "/cosa-fare-delle-nostre-ferite-recensione-2/": "/blog/dalle-province-n-123/",
      "/creatures-disconforts-2/": "/blog/dalle-province-n-123/",
      "/sia-fatta-la-tua-volonta-2/": "/blog/ci-hanno-scritto-insieme-n-27/",
      "/di-nuovo-in-cammino-2/": "/blog/ci-hanno-scritto-insieme-n-27/",
      "/fratelli-e-sorelle-di-persone-con-disabilita-3/": "/blog/ci-hanno-scritto-insieme-n-27/",
      "/uno-due-tre-stella-2/": "/blog/ci-hanno-scritto-insieme-n-27/",
      "/quel-che-la-convenzione-dice-e-non-dice/": "/blog/intervista-giampiero-griffo/",
      "/una-storia-sacra-2/": "/blog/le-mimose-di-yolanda/",
      "/speciale-natale-nel-mondo-2/": "/blog/le-mimose-di-yolanda/",
      "/posso-devo-voglio-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/volevo-essere-una-farfalla-recensione-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/dalle-province-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/speleologi-del-mistero-del-piccolo-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/la-parola-alle-mamme-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/anoressia-fame-damore-e-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/i-tuoi-figli-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/si-chiama-sara-2/": "/blog/la-nostra-scelta-di-cristina/",
      "/la-nostra-scelta/": "/blog/la-nostra-scelta-di-cristina/",
      "/mio-figlio-luciano-2/": "/blog/il-lato-b-di-essere-papa-di-un-figlio-disabile/",
      "/sara-e-le-sbiruline-di-emily-2/": "/blog/bellezza-e-handicap/",
      "/il-vecchio-re-nel-suo-esilio/": "/blog/bellezza-e-handicap/",
      "/dialogo-aperto-n-119-2/": "/blog/bellezza-e-handicap/",
      "/come-essere-vicini-allaltro-2/": "/blog/bellezza-e-handicap/",
      "/i-nonni-una-tenerezza-in-piu-2/": "/blog/bellezza-e-handicap/",
      "/il-loro-sguardo-buca-le-nostre-ombre-recensione-2/": "/blog/bellezza-e-handicap/",
      "/larca-di-trosly-2/": "/blog/bellezza-e-handicap/",
      "/sindrome-di-costello-la-storia-di-sandrino-2/": "/blog/bellezza-e-handicap/",
      "/affrontare-lenorme-paura-intervista-a-pietro-2/": "/blog/bellezza-e-handicap/",
      "/cosa-sono-le-malattie-rare-2/": "/blog/bellezza-e-handicap/",
      "/rarina-storia-di-un-fiore-raro-2/": "/blog/bellezza-e-handicap/",
      "/dialogo-aperto-n-118-2/": "/blog/bellezza-e-handicap/",
      "/carissime-mamme-2/": "/blog/bellezza-e-handicap/",
      "/mani-calde-recensione-2/": "/blog/bellezza-e-handicap/",
      "/fai-bei-sogni-recensione-2/": "/blog/bellezza-e-handicap/",
      "/fede-e-luce-dalle-provincie-2/": "/blog/bellezza-e-handicap/",
      "/fede-e-luce-una-fedelta-che-ridona-lentusiasmo-2/": "/blog/bellezza-e-handicap/",
      "/jean-vanier-dalla-palestina-2/": "/blog/bellezza-e-handicap/",
      "/mamma-sono-contento-di-essere-nato-2/": "/blog/bellezza-e-handicap/",
      "/la-memoria-del-bello-2/": "/blog/bellezza-e-handicap/",
      "/falsi-moralismi-sul-bello-di-essere-down-2/": "/blog/bellezza-e-handicap/",
      "/cosa-rende-qualcuno-straordinario-intervista-a-nick-vujicic-2/": "/blog/bellezza-e-handicap/",
      "/un-gatto-la-comunita-e-il-nostro-apartheid/": "/blog/luca-adotta-alba/",
      "/una-sera-a-roma-allo-stadio-dei-marmi-per-lapertura-delle-special-olympics/": "/blog/una-sera-a-roma-stadio-dei-marmi-special-olympics/",
      "/dialogo-aperto-n-116-2/": "/blog/giovani-eroi/",
      "/vita-fede-e-luce-n-113-2/": "/blog/giovani-eroi/",
      "/fede-e-luce-festeggia-i-suoi-40-anni-1971-2011/": "/blog/giovani-eroi/",
      "/vita-fede-e-luce-la-festa-per-i-nostri-40-anni-1971-2011-2/": "/blog/giovani-eroi/",
      "/fede-e-luce-e-subito-scatto-la-molla-2/": "/blog/giovani-eroi/",
      "/10-buoni-motivi-per-fare-volontariato-2/": "/blog/giovani-eroi/",
      "/doposcuola-al-campo-rom-2/": "/blog/giovani-eroi/",
      "/lamicizia-asimmetrica-2/": "/blog/giovani-eroi/",
      "/volontariato-una-leva-per-la-vita-2/": "/blog/giovani-eroi/",
      "/oggi-sono-libero-2/": "/blog/giovani-eroi/",
      "/un-sacco-di-felicita-2/": "/blog/giovani-eroi/",
      "/ndangwini-casa-dove-esiste-una-famiglia-2/": "/blog/giovani-eroi/",
      "/tra-individualismo-e-impegno-i-giovani-hanno-bisogno-di-concretezza-2/": "/blog/giovani-eroi/",
      "/istantanea-2/": "/blog/giovani-eroi/",
      "/nessun-profitto-recensione-2/": "/blog/giovani-eroi/",
      "/il-linguaggio-segreto-dei-fiori-recensione-2/": "/blog/giovani-eroi/",
      "/la-speranza-non-fa-rumore-recensione-2/": "/blog/giovani-eroi/",
      "/per-sempre-recensione-2/": "/blog/giovani-eroi/",
      "/in-corsia-2/": "/blog/giovani-eroi/",
      "/vita-fede-e-luce-linizio-di-un-cammino-2/": "/blog/giovani-eroi/",
      "/posso-vivere-lssenziale-che-non-e-fare-per-ma-vivere-con-le-persone-piu-fragili-2/": "/blog/giovani-eroi/",
      "/farsi-carico-degli-ultimi-2/": "/blog/giovani-eroi/",
      "/dialogo-aperto-n-115-2/": "/blog/giovani-eroi/",
      "/quasi-non-li-riconoscevo-2/": "/blog/giovani-eroi/",
      "/tempo-di-regali-2/": "/blog/giovani-eroi/",
      "/vizi-e-virtu-del-vivere-recensione-2/": "/blog/giovani-eroi/",
      "/storia-di-un-uomo-ritratto-di-carlo-maria-martini-recensione-2/": "/blog/giovani-eroi/",
      "/avevano-spento-anche-la-luna-recensione-2/": "/blog/giovani-eroi/",
      "/il-tempo-delle-donne-recensione-2/": "/blog/giovani-eroi/",
      "/con-lidea-di-non-andare-2/": "/blog/giovani-eroi/",
      "/tre-domande-ed-un-pellegrinaggio-2/": "/blog/giovani-eroi/",
      "/messaggeri-di-gioia-2/": "/blog/giovani-eroi/",
      "/nel-profondo-della-malattia-una-comunione-e-possibile-2/": "/blog/giovani-eroi/",
      "/ci-chiedono-da-che-parte-stai-2/": "/blog/giovani-eroi/",
      "/la-grande-casa-di-peter-pan-2/": "/blog/giovani-eroi/",
      "/allora-hai-deciso-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/il-carro-una-casa-famiglia-per-tutti-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/relazioni-sincere-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/posso-salutare-la-mamma-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/purche-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/come-e-nato-ombre-e-luci-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/chi-ha-seminato-nelle-lacrime-miete-nella-gioia-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/molto-lavoro-da-fare-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/sicurezza-nel-cammino-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/effetto-alfedena-2/": "/blog/insegnante-di-lettere-canale-della-vita/",
      "/una-scelta-difficile/": "/blog/dopo-la-scuola-dellobbligo-una-scelta-difficile/",
      "/circa-il-concetto-di-apertura-dei-centri-diurni-riabilitativi/": "/blog/centri-diurni-coronavirus/",
      "/ci-provero-2/": "/blog/vuoi-bene-a-gesu/",
      "/pregando-su-una-sedia-imponente-e-semplice-2/": "/blog/vuoi-bene-a-gesu/",
      "/il-mosaico-tanti-sassolini-colorati-2/": "/blog/vuoi-bene-a-gesu/",
      "/mariangela-linizio-a-santa-silvia-2/": "/blog/vuoi-bene-a-gesu/",
      "/partecipe-dei-miracoli-2/": "/blog/vuoi-bene-a-gesu/",
      "/mirtilli-2/": "/blog/vuoi-bene-a-gesu/",
      "/small-talk-ma-extralarge-2/": "/blog/vuoi-bene-a-gesu/",
      "/il-regalo-piu-bello-2/": "/blog/vuoi-bene-a-gesu/",
      "/quel-gesto-2/": "/blog/vuoi-bene-a-gesu/",
      "/quanta-forza-2/": "/blog/vuoi-bene-a-gesu/",
      "/un-patrimonio-profuso-a-piene-mani-2/": "/blog/vuoi-bene-a-gesu/",
      "/sollecitare-la-speranza-2/": "/blog/vuoi-bene-a-gesu/",
      "/piero-e-il-bruco-farfalla-recensione-2/": "/blog/giubileo-2016-la-vera-gioia/",
      "/dalle-provincie-n-134-2/": "/blog/giubileo-2016-la-vera-gioia/",
      "/la-passione-della-pazienza-2/": "/blog/giubileo-2016-la-vera-gioia/",
      "/un-laboratorio-creativo-a-pantigliate-2/": "/blog/giubileo-2016-la-vera-gioia/",
      "/il-chicco-vivere-il-vangelo-in-azione-2/": "/blog/giubileo-2016-la-vera-gioia/",
      "/papa-francesco-al-chicco-qui-mi-avete-toccato-il-cuore-2/": "/blog/giubileo-2016-la-vera-gioia/",
      "/oltre-il-limite-2/": "/blog/giubileo-2016-la-vera-gioia/",
      "/perche-di-katherine-e-nerissa-non-ci-sono-tracce/": "/blog/the-crown-cugine-autismo/",
      "/dalle-province-n-140-2/": "/blog/dopo-di-noi-i-diritti-che-ci-sono/",
      "/legge-sul-dopo-di-noi-issiamo-le-vele-2/": "/blog/dopo-di-noi-i-diritti-che-ci-sono/",
      "/come-e-stato-possibile-tutto-questo-2/": "/blog/doni-preziosi/",
      "/alza-lo-sguardo/": "/blog/doni-preziosi/",
      "/per-me-e-felicita-2/": "/blog/doni-preziosi/",
      "/mai-piu-soli-tre-testimonianze-2/": "/blog/la-covazione-di-un-papa/",
      "/mamma-ti-posso-parlare-recensione/": "/blog/rico-oscar-e-il-ladro-ombra-recensione/",
      "/chi-resta-deve-capire-recensione-2/": "/blog/rico-oscar-e-il-ladro-ombra-recensione/",
      "/dedicato-ad-unamica-2/": "/blog/a-te-bambino-mio/",
      "/questestate-faremo-2/": "/blog/a-te-bambino-mio/",
      "/dialogo-aperto-n-136-2/": "/blog/quattro-giorni-mano-nella-mano/",
      "/vedere-oltre-finestre-su-una-storia-recensione-2/": "/blog/quattro-giorni-mano-nella-mano/",
      "/il-libro-di-charlotte-recensione-2/": "/blog/quattro-giorni-mano-nella-mano/",
      "/genitori-recensione-film-2/": "/blog/quattro-giorni-mano-nella-mano/",
      "/sono-graditi-visi-sorridenti-recensione-2/": "/blog/borderline-recensione/",
      "/riscoprire-cio-che-unisce-i-cuori-di-tutti-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/un-affidamento-speciale-3/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/la-ragnatela-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/siblings-recensione-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/lo-zaino-di-emma-recensione-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/alla-fine-qualcosa-ci-inventeremo-che-ne-sara-di-mio-figlio-autistico-quando-non-saro-piu-al-suo-fianco-recensione-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/di-corsa-verso-francesco-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/famiglia-per-chi-famiglia-per-cosa-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/una-buona-scuola-damore-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/la-lampada-dei-desideri-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/pinocchio-teatro-integrato-ma-non-solo-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/luoghi-della-relazione-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/il-libro-di-cristopher-a-wonder-story-recensione-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/osservazioni-di-una-mamma-qualunque-recensione-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/viola-e-il-bullismo-2/": "/blog/qualche-raggio-di-sole-in-siria/",
      "/fede-e-luce-in-armenia-e-in-iran/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/un-ragazzo-ribelle-2/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/ziguli-2/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/liguana-non-vuole/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/liguana-non-vuole-recensione-2/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/cosa-ti-manca-per-essere-felice-recensione-2/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/voci-dal-silenzio-recensione-2/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/fede-e-luce-in-iraq-2/": "/blog/30-anni-chicco-dandoci-la-risposta-che-il-cuore-chiedeva/",
      "/un-coro-aperto-a-tutti-2/": "/blog/il-dilemma-della-valutazione/",
      "/dalle-province-n-123-2/": "/blog/il-dilemma-della-valutazione/",
      "/ho-imparato-2/": "/blog/aprirsi-ad-altre-famiglie/",
      "/testimoni-dellincontro-2/": "/blog/aprirsi-ad-altre-famiglie/",
      "/come-sei-cresciuto-2/": "/blog/aprirsi-ad-altre-famiglie/",
      "/tra-lacquario-e-loceano-2/": "/blog/voci-di-campo/",
      "/occasioni-per-stare-al-passo-2/": "/blog/voci-di-campo/",
      "/aprirsi-ad-altre-famiglie-2/": "/blog/voci-di-campo/",
      "/precious-recensione-film-2/": "/blog/dialogo-aperto-n-113/",
      "/uildm-unione-italiana-lotta-alla-distrofia-muscolare-2/": "/blog/dialogo-aperto-n-113/",
      "/vivere-con-la-distrofia-intervista-a-me-2/": "/blog/dialogo-aperto-n-113/",
      "/costruirsi-un-totem-capire-e-sentire-il-proprio-valore-recensione-2/": "/blog/e-la-luna-mi-guardo-recensione/",
      "/e-la-luna-mi-guardo-recensione-2/": "/blog/vita-fede-e-luce-n-110/",
      "/scegliamo-con-cura-le-parole-2/": "/blog/viola-e-mimosa-desaparecida/",
      "/il-mistero-di-tanto-bene-2/": "/blog/angelo-un-compagno-di-viaggio/",
      "/raggi-di-sole-2/": "/blog/angelo-un-compagno-di-viaggio/",
      "/eh-io-sono-qui-2/": "/blog/angelo-un-compagno-di-viaggio/",
      "/90-anni-di-jean-2/": "/blog/una-radice-e-delle-ali/",
      "/viola-e-mimosa-desaparecida-2/": "/blog/una-radice-e-delle-ali/",
      "/con-il-tuo-passo-percorsi-agesci-2/": "/blog/una-radice-e-delle-ali/",
      "/dalle-province-n-142-3/": "/blog/dinamiche-fondamentali/",
      "/dinamiche-fondamentali-2/": "/blog/i-miei-occhi-e-il-mio-cuore-hanno-vissuto-la-meraviglia/",
      "/quanta-carta-stampata/": "/blog/ombre-e-luci-oggi-ha-ancora-senso/",
      "/la-forma-della-voce/": "/blog/la-forma-della-voce-recensione/",
      "/io-figlio-di-mio-figlio/": "/blog/io-figlio-di-mio-figlio-recensione/",
      "/la-sete-e-lacqua-della-speranza-una-riflessione-di-don-marco-bove/": "/blog/la-sete-e-lacqua-della-speranza/",
      "/lettera-aperta-a-francesco-dassisi-2/": "/blog/pellegrinaggio-assisi-1978-luis-sankale/",
      "/assisi-1978/": "/blog/pellegrinaggio-assisi-1978-luis-sankale/",
      "/oltre-la-cronaca-vicini-al-quotidiano-2/": "/blog/scarti-o-pietre-portanti/",
      "/i-miei-occhi-e-il-mio-cuore-hanno-vissuto-la-meraviglia-2/": "/blog/scarti-o-pietre-portanti/",
      "/quanti-conosci-per-nome-2/": "/blog/cosa-so-dei-social-e-cosa-ne-penso/",
      "/la-comunita-che-accoglie-di-rifiutati-recensione/": "/blog/la-comunita-che-accoglie-i-rifiutati-recensione/",
      "/curare-lautismo-a-casa-unopera-damore/": "/blog/curare-lautismo-a-casa-un-opera-damore/",
      "/lo-straordinario-viaggio-di-nujeen-recensione-2/": "/blog/dialogo-aperto-n-138/",
      "/corridoi-umanitari-2/": "/blog/dialogo-aperto-n-138/",
      "/dettagli-inutili-recensione-2/": "/blog/dialogo-aperto-n-138/",
      "/dalle-province-n-125-2/": "/blog/agli-antipodi-dellindividualismo/",
      "/fede-e-luce-in-terra-santa-2/": "/blog/agli-antipodi-dellindividualismo/",
      "/disabili-e-trapianti/": "/blog/sempre-damigella-mai-sposa/",
      "/agli-antipodi-dellindividualismo-2/": "/blog/un-gioco-da-fare-quando-fuori-piove/",
      "/editoriale-italiana-2000-pp-670/": "/blog/itinerari-guida-annuario-accoglienza-cattolica-italia-2000-recensione/",
      "/ci-hanno-scritto-una-critica-allultimo-numero-di-insieme-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/per-la-nostra-riflessione-prendete-e-mangiatene-tutti-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/leducazione-dei-bambini-cosiddetti-lievi-si-ma-quale-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/viviamo-una-vita-normale-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/non-e-cosi-facile-essere-madre-di-una-bambina-non-grave-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/si-e-allontanato-per-la-prima-volta-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/ora-ha-un-mondo-suo-oltre-la-sua-famiglia-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/in-vacanza-tutto-come-se-si-trattasse-di-un-gioco-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/adesso-fa-la-quarta-sta-ancora-con-noi-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/fu-in-tenda-che-mi-diede-il-benvenuto-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/come-mettere-in-quattro-righe-oltre-10-anni-di-vita-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/ci-hanno-scritto-n-21-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/apriamo-il-sipario-oggi-si-recita-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/il-ruolo-del-pediatra-nel-trattamento-del-bambino-handicappato-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/notiziario-fede-e-luce-n-21-2/": "/blog/letture-consigliate-il-piccolo-principe/",
      "/beati-i-poveri-suggerimenti-per-le-tra-giornate-ad-assisi-1978-2/": "/blog/il-cantico-delle-creature/",
      "/ciao-gianluca-2/": "/blog/il-cantico-delle-creature/",
      "/tre-giorni-ad-assisi-2/": "/blog/il-cantico-delle-creature/",
      "/qualche-informazione-prima-di-partire-per-il-pellegrinaggio-di-assisi-2/": "/blog/il-cantico-delle-creature/",
      "/pappagalli-verdi-cronache-di-un-chirurgo-di-guerra/": "/blog/pappagalli-verdi-cronache-di-un-chirurgo-di-guerra-recensione/",
      "/viola-e-mimosa-n-140-2/": "/blog/caro-raffa-la-vita-e-adesso/",
      "/anna-che-sorride-alla-pioggia-recensione-2/": "/blog/caro-raffa-la-vita-e-adesso/",
      "/niccolo-tra-coloro-che-hanno-fatto-la-storia/": "/blog/ol-incontra-jorit/",
      "/come-doro/": "/blog/come-loro/",
      "/biografilm/": "/blog/biografilm-festival-2020/",
      "/squizo/": "/blog/sqizo/",
      "/qualcosa-e-cambiato-2/": "/blog/i-geni-del-futuro-crispr-cas9/",
      "/visto-al-cineforum-di-fede-e-luce-2/": "/blog/i-geni-del-futuro-crispr-cas9/",
      "/ho-amici-in-paradiso-recensione-2/": "/blog/i-geni-del-futuro-crispr-cas9/",
      "/dialogo-aperto-n-137-2/": "/blog/i-geni-del-futuro-crispr-cas9/",
      "/dalle-province-n-137-2/": "/blog/i-geni-del-passato-handiche/",
      "/una-veglia-laboratorio-per-il-giovedi-santo-2/": "/blog/i-geni-del-passato-handiche/",
      "/viola-e-mimosa-n-137-2/": "/blog/labilita-onlus-aprire-gli-occhi/",
      "/seveso-1976-oltre-la-diossina-2/": "/blog/labilita-onlus-aprire-gli-occhi/",
      "/leutanasia-di-dio-recensione-2/": "/blog/attesi-amati-trasformati/",
      "/i-geni-del-futuro-crispr-cas9-2/": "/blog/abitare-nellordinarieta/",
      "/viaggio-a-parma-del-1976-unesperienza-di-gioia-condivisione-e-scoperta-con-fede-e-luce-2/": "/blog/notiziario-di-fede-e-luce-n-10-1976/",
      "/un-angolino-di-arche-2/": "/blog/notiziario-di-fede-e-luce-n-10-1976/",
      "/storia-dellaborto-i-molti-protagonisti-e-interessi-di-una-lunga-vicenda/": "/blog/storia-dellaborto-i-molti-protagonisti-e-interessi-di-una-lunga-vicenda-recensione/",
      "/per-voi-e-per-tutti-consigli-pratici-perche-ne/": "/blog/per-voi-e-per-tutti-consigli-pratici-perche-nessuno-venga-rifiutato/",
      "/il-male-ela-sofferenza-raccontati-ai-bambini/": "/blog/il-male-e-la-sofferenza-raccontati-ai-bambini-recensione/",
      "/tu-sei-amato-da-dio-cosi-come-sei-2/": "/blog/anffas-ogni-persona-con-disabiltia-e-nostro-figlio/",
      "/viola-e-mimosa-a-manila-2/": "/blog/anffas-ogni-persona-con-disabiltia-e-nostro-figlio/",
      "/alfedena-per-immagini/": "/blog/alfedena/",
      "/lettera-a-jean-matteo-mazzarotto/": "/blog/lettere-a-jean-matteo-mazzarotto/",
      "/coltivare-i-propri-pensieri/": "/blog/dialogo-aperto-n-112/",
      "/per-una-vera-qualita-di-cura/": "/blog/dialogo-aperto-n-112/",
      "/il-mio-curriculum/": "/blog/benedetta-il-mio-curriculum/",
      "/liberi-di-vivere-come-tutti/": "/blog/liberi-di-vivere-come-tutti-prima-conferenza-nazionale-delle-politiche-sull-handicap/",
      "/i-nostri-grandi-amici-maria-teresa/": "/blog/maria-teresa-di-calcutta-dedicato-ai-bambini/",
      "/viola-e-mimosa-n-138/": "/blog/guidati-da-gio/",
      "/dedicato-ai-bambini-francesco/": "/blog/dedicato-ai-bambini-francesco-gammarelli/",
      "/io-sono-una-donna/": "/blog/io-sono-una-donna-perche-mi-chiami-andicappata/",
      "/io-sono-una-donna-perche-mi-chiamai-andicappata/": "/blog/io-sono-una-donna-perche-mi-chiami-andicappata/",
      "/il-progetto-girotondo-2/": "/blog/cervelli-ribelli-connettiamoci-neurodiversita/",
      "/da-fratello-e-da-padre-2/": "/blog/cervelli-ribelli-connettiamoci-neurodiversita/",
      "/cervelli-ribelli/": "/blog/cervelli-ribelli-connettiamoci-neurodiversita/",
      "/pellegrinaggio-assisi-1978-secondo-luis-sankale/": "/blog/vita-fede-e-luce-natale-1977-a/",
      "/leducazione-delle-persone-disabili-imparare-a-mangiare-insieme-e-in-autonomia-2/": "/blog/vita-fede-e-luce-natale-1977-a/",
      "/la-comunita-di-capodarco-2/": "/blog/vita-fede-e-luce-natale-1977-a/",
      "/tempo-di-imparare/": "/blog/tempo-di-imparare-valeria-parrella-recensione-libro/",
      "/blog-di-benedetta/": "/blog/tanto-io-non-la-perdo/",
      "/il-dilemma-della-valutazione-2/": "/blog/la-mia-disavventura/",
      "/costretta-a-legarmi-i-capelli-e-la-regola/": "/blog/ho-imparato-da-sola-a-divertirmi/",
      "/messaggio-del-santo-padre-in-occasione-della-giornata-mondiale-delle-persone-con-disabilita/": "/blog/papa-francesco-disabilita-messaggio/",
      "/base-per-articolo-benedetta-19-dicembre-2019/": "/blog/non-mi-piace-cucinare/",
      "/unica-del-suo-genere/": "/blog/unica-nel-suo-genere/",
      "/i-ciechi-non-sognano-il-buio-vivere-con-successo-la-cecita/": "/blog/i-ciechi-non-sognano-il-buio-vivere-con-successo-la-cecita-recensione/",
      "/la-mia-disavventura-2/": "/blog/la-mia-vita-a-santa-palomba/",
      "/i-saggi-sulloperazione-t4/": "/blog/zavorre-prescelti/",
      "/dopo-di-me-il-diluvio/": "/blog/dopo-di-me-il-diluvio-commedia-musicale-gruppo-fede-luce-san-paolo/",
      "/un-libro-interessante-chi-sarei-se-potessi-essere/": "/blog/un-libro-interessante-adolescenza-ragazzi-disabili-chi-sarei-se-potessi-esserebozza-automatica/",
      "/un-libro-interessante-chi-sarei-se-potessi-esserebozza-automatica/": "/blog/un-libro-interessante-adolescenza-ragazzi-disabili-chi-sarei-se-potessi-esserebozza-automatica/",
      "/se-la-teologia-non-sa-parlare-di-dio-comprendendo-la-disabilita-e-la-teologia-a-essere-disabile/": "/blog/teologia-disabile/",
      "/newsletter-n-10/": "/blog/newsletter-n-10-sulla-regia-non-credente-di-lourdes/",
      "/papa-san-pietro/": "/blog/sulla-barca-in-piazza-san-pietro/",
      "/da-vicino-nessuno-e-disabile/": "/blog/festival-diritti-umani/",
      "/la-sfida-di-rileggere-le-scene-del-cinema/": "/blog/sensuability/",
      "/se-le-immagini-parlano-piu-delle-parole-newsletter-n-15/": "/blog/newsletter-15/",
      "/cervelli-ribelli-connettiamoci-alla-neurodiversita/": "/blog/dalle-province-n-141/",
      "/perche-tutti-comprendano-2/": "/blog/dalle-province-n-141/",
      "/tracciare-il-sentiero-in-albania-2/": "/blog/dalle-province-n-141/",
      "/spazio-aperto-una-coopera/": "/blog/spazio-aperto-una-cooperativa-di-servizi/",
      "/monaci-di-lanuvio/": "/blog/monaci-di-lanuvio-finanziamento-banca-etica/",
      "/parliamo-di-comunicazione-facilitata/": "/blog/parliamo-di-comunicazione-facilitata-intervista-francesca-benassi/",
      "/la-lezione-di-un-clown/": "/blog/la-lezione-di-un-clown-miloud-oukili/",
      "/tra-lame-che-affondano-e-ferite-medicate/": "/blog/eredita-dei-vivi-recensione/",
      "/insieme/": "/blog/insieme-primo-articolo/",
      "/lettera-di-daucourt-alle-comunita-dellarca/": "/blog/nonostante-jean-vanier-larca-rimane/",
      "/i-panzerotti-di-caterina/": "/blog/lo-scatto-della-pantera/",
      "/gli-amici-dei-bimbi/": "/blog/gli-amici-dei-bimbi-reparto-gesu-bambino-istituto-santeusebio-vercelli/",
      "/la-luce-simbolo-del-pellegrinaggio-di-roma-1975-2/": "/blog/per-te-ho-visitato-roma/",
      "/perche-proprio-a-roma-il-pellegrinaggio-del-1975-2/": "/blog/per-te-ho-visitato-roma/",
      "/la-bimba-delle-lumache/": "/blog/la-bimba-delle-lumache-recensione-libro/",
      "/nessuno-bambino-nasce-cattivo/": "/blog/nessuno-bambino-nasce-cattivo-recensione-libro/",
      "/noi-quattro/": "/blog/noi-quattro-la-comunita-il-roveto/",
      "/il-roveto/": "/blog/comunita-il-roveto/",
      "/dallassistenza-allesistenza-sei-workshop-dellassociazione-vedere-oltre-onlus-2/": "/blog/valgo-anchio/",
      "/fede-e-luce-una-scuola-di-altruismo-2/": "/blog/valgo-anchio/",
      "/a-43/": "/blog/a-4300-metri-di-altitudine-newsletter-n-31/",
      "/dove-crescono-i-cocomeri-di-cindy-baldwin-recensione/": "/blog/dove-crescono-i-cocomeri-recensione/",
      "/marie-la-strabica-di-georges-simenon-recensione/": "/blog/marie-la-strabica-recensione/",
      "/viaggio-italia-around-the-world/": "/blog/viaggio-italia-recensione/",
      "/grazi/": "/blog/grazie-papa-don-carlo-recensione/",
      "/dobbiamo-esser-prudenti-non-congelati/": "/blog/ol-incontra-luigi-derrico/",
      "/una-mattina-ti-ho-osservato-mentre-ti-svegliavi/": "/blog/ricordo-daniele-corrias/",
      "/la-piccola-artista-di-chartres/": "/blog/recensione-i-disegni-segreti/",
      "/dopo-di-noi-i-diritti-che-ci-sono-2/": "/blog/mamma-in-comunita/",
      "/lonore-di-un-lord-2/": "/blog/mamma-in-comunita/",
      "/la-nuova-legge-sul-dopo-di-noi-nodi-da-sciogliere-2/": "/blog/insolito-ragionamento-sul-migrante/",
      "/onora-il-padree-e-la-madre-pagine-di-tutti-i-tempi-per-capire-il-rapporto-tra-genitori-e-figli-recensione-libro/": "/blog/onora-il-padre-e-la-madre-pagine-di-tutti-i-tempi-per-capire-il-rapporto-tra-genitori-e-figli-recensione-libro/",
      "/la-necessita-di-un-contesto-per-capire/": "/blog/la-bellezza-nella-mente-recensione/",
      "/le-comunita-di-fede-e-luce-nellest-europeo/": "/blog/comunita-fede-e-luce-nel-mondo-tante-piccole-fiaccole-di-unita-e-di-amore/",
      "/lecumenismo-in-fede-e-luce/": "/blog/lecumenismo-in-fede-e-luce-un-dono/",
      "/perche-porto-i-miei-figli-a-fede-e-luce/": "/blog/quando-porto-i-miei-figli-a-fede-e-luce-resto-incantata/",
      "/mi-trovo-bene-con-tuttmi-trovo-bene-con-tuttii/": "/blog/mi-trovo-bene-con-tutti/",
      "/sessualita-e-disabilita-il-meglio-e-il-peggio-parlano-gli-educatori/": "/blog/sessualita-e-disabilita-il-meglio-e-il-peggio/",
      "/amore-e-disabilita-facile-preda-dei-genitori/": "/blog/amore-disabilita-facile-preda/",
      "/v-conferenza-internazionale-sullautismo-1983/": "/blog/5-conferenza-internazionale-sullautismo-1983/",
      "/marahba-kiffak-ciao-come-stai/": "/blog/marahba-kiffak-ciao-come-stai-fede-luce-beirut/",
      "/dallosservatorio-scolastico-deir-ai-as-di-milano/": "/blog/scuola-e-disabilita-dallosservatorio-scolastico-deir-ai-as-di-milano/",
      "/ieri-oggi-domani-2/": "/blog/dossier-scuola-e-disabilita/",
      "/dossier-scola-e-disabilita/": "/blog/dossier-scuola-e-disabilita/",
      "/fede-e-luce-tutti-a-leeds-2/": "/blog/dossier-scuola-e-disabilita/",
      "/che-fanfara-2/": "/blog/dossier-scuola-e-disabilita/",
      "/7-idee-sulla-sindrome-di-down-2/": "/blog/dossier-scuola-e-disabilita/",
      "/dalle-provice-n-141/": "/blog/dialogo-aperto-n-141/",
      "/migrati-diverse-fragilita-si-incontrano-2/": "/blog/i-figli-sono-tutti-speciali/",
      "/la-nuova-legge-sul-dopo-di-noi-che-cosa-dice-2/": "/blog/i-figli-sono-tutti-speciali/",
      "/insolito-ragionamento-sul-migrante-2/": "/blog/costruiamo-laccoglienza/",
      "/voglia-di-comunicare-2/": "/blog/dialogo-aperto-n-142/",
      "/la-mia-forza-nella-mia-differenza-2/": "/blog/percorsi-inclusivi-noi-ci-teniamo/",
      "/due-capitane-2/": "/blog/percorsi-inclusivi-noi-ci-teniamo/",
      "/dal-convegno-allimpegno-2/": "/blog/percorsi-inclusivi-noi-ci-teniamo/",
      "/dialogo-aperto-n-142-2/": "/blog/la-comunicazione-multimodale/",
      "/gioco-test/": "/blog/giochi-2022/",
      "/insieme-a-tutti-gli-altri-anche-mia-figlia-ha-ricevuto-la-cresima/": "/blog/mia-figlia-adea-cresima/",
      "/lotta-per-linclusione/": "/blog/lotta-per-linclusione-recensione/",
      "/la-nostra-scelta-di-cristina-2/": "/blog/mai-piu-soli/",
      "/superata-lultima-sala-daspetto-2/": "/blog/mai-piu-soli/",
      "/aggiungi-un-posto-a-casa-adozione-di-bambini-con-disabilita-2/": "/blog/mai-piu-soli/",
      "/un-vescovo-per-amico-2/": "/blog/mai-piu-soli/",
      "/dialogo-aperto-n-120-2/": "/blog/mai-piu-soli/",
      "/cinema-la-disabilita-al-torino-film-festival-e-al-babel-film-festival-di-cagliari/": "/blog/cinema-disabilita-torino-film-festival-babel-film-festival-di-cagliari/",
      "/sara-e-le-sbiruline-di-emily/": "/blog/sara-e-le-sbiruline-di-emily-recensione/",
      "/il-vecchio-re-nel-suo-esilio-recensione-2/": "/blog/franz-werfel-gallucci-editore-pp-722/",
      "/sara-e-le-sbiruline-di-emily-recensione-2/": "/blog/odoardo-focherini-un-giusto-fra-le-nazioni-recensione/",
      "/rico-oscar-e-il-ladro-ombra-recensione-2/": "/blog/la-caduta-i-ricordi-di-un-padre-in-424-passi-recensione/",
      "/io-mi-domando-2/": "/blog/gli-altri-vostri-figli-lhanno-accettato/",
      "/ci-hanno-scritto-insieme-n-23-2/": "/blog/gli-altri-vostri-figli-lhanno-accettato/",
      "/25-numero-6-anno-2/": "/blog/gli-altri-vostri-figli-lhanno-accettato/",
      "/mio-figlio-emanuele-la-straordinaria-esperienza-di-una-madre-recensione-2/": "/blog/un-figlio-handicappato/",
      "/notiziario-fede-e-luce-n-12-marzo-1977-2/": "/blog/un-figlio-handicappato/",
      "/come-nata-la-prima-casetta-fede-e-luce-storie-di-pennelli-e-appendiciti-2/": "/blog/un-figlio-handicappato/",
      "/visitiamo-con-maria-laura-il-centro-belga-per-infermi-motori-mentali-c-b-i-m-c/": "/blog/un-figlio-handicappato/",
      "/inlusione-solidarieta-ordinaria/": "/blog/inclusione-solidarieta-ordinaria/",
      "/abbiamo-un-cuore-inclusivo-2/": "/blog/inclusione-solidarieta-ordinaria/",
      "/i-geni-del-passato-handiche-2/": "/blog/inclusione-solidarieta-ordinaria/",
      "/per-il-rispetto-della-persona-sempre-2/": "/blog/tra-incontri-nel-riconoscimento-dellaltro-puoi-ritrovare-fiducia/",
      "/la-cura-dellamore/": "/blog/la-cura-dellamore-recensione/",
      "/legoismo-e-finito-recensione-2/": "/blog/chiudi-gli-occhi-e-guardami-vivere-la-disabilita-in-famiglia-recensione/",
      "/voci-di-campo-2/": "/blog/con-loro-ci-sto-bene/",
      "/bozza/": "/blog/cani-pony-leoni-marini/",
      "/giubileo-2016-per-cominciare-una-nuova-storia-di-amore-2/": "/blog/tutti-a-bordo/",
      "/il-vangelo-mimato-per-costruire-ponti-2/": "/blog/tutti-a-bordo/",
      "/invitati-alla-festa/": "/blog/associazione-invitati-alla-festa/",
      "/un-dado-vegetale-da-sogno-e-fatto-in-casa-2/": "/blog/essere-padre-di-un-figlio-disabile/",
      "/il-libro-di-julian-a-wonder-story-recensione-2/": "/blog/un-ponte-in-un-guscio-di-noce/",
      "/zia-lo-sai-che-sei-un-po-strana-recensione-2/": "/blog/un-ponte-in-un-guscio-di-noce/",
      "/il-bambino-che-parlava-con-la-luce-recensione-2/": "/blog/un-ponte-in-un-guscio-di-noce/",
      "/riuniti-in-preghiera-2/": "/blog/un-ponte-in-un-guscio-di-noce/",
      "/il-canto-di-bernadette-recensione/": "/blog/pensioni-rubate/",
      "/famiglie-in-esilio-ferite-ritrovate-riconciliate-recensione-2/": "/blog/pensioni-rubate/",
      "/due-grandi-occhi-neri-2/": "/blog/julia-jean-e-la-tirannia-della-normalita/",
      "/la-mia-vita-a-santa-palomba-2/": "/blog/si-ricomincia/",
      "/katimavik-una-parola-escquimese-che-vuol-dire-incontro/": "/blog/katimavik-una-parola-eschimese-che-vuol-dire-incontro/",
      "/ziguli/": "/blog/ziguli-recensione/",
      "/ci-hanno-scritto-insieme-n-27-2/": "/blog/marina-di-camerota-venti-giorni-di-prime-volte/",
      "/fratelli-e-sorelle-di-persone-con-disabilita-una-realta-da-riscoprire-2/": "/blog/marina-di-camerota-venti-giorni-di-prime-volte/",
      "/lavventura-di-oletta-quando-il-cavallo-diventa-terapia-2/": "/blog/marina-di-camerota-venti-giorni-di-prime-volte/",
      "/dossier-vite-da-ri-accogliere-adolescenti-allo-sbaraglio/": "/blog/adolescenti-allo-sbaraglio/",
      "/alto-come-un-vaso-di-gerani-recensione-2/": "/blog/respiro-dopo-respiro-lo-yoga-per-bambini-e-adolescenti-con-bisogni-speciali/",
      "/parole-in-liberta-diario-semiserio-della-madre-di-un-disabile-recensione-2/": "/blog/respiro-dopo-respiro-lo-yoga-per-bambini-e-adolescenti-con-bisogni-speciali/",
      "/un-castello-di-sabbia-storia-della-mia-vita-e-della-mia-schizofrenia-recensione-2/": "/blog/respiro-dopo-respiro-lo-yoga-per-bambini-e-adolescenti-con-bisogni-speciali/",
      "/dallo-stadio-al-palazzetto/": "/blog/anche-io-tiro-i-rigori/",
      "/dialogo-aperto-n-125-2/": "/blog/viola-e-valeria/",
      "/un-gioco-da-fare-quando-fuori-piove-2/": "/blog/viola-e-valeria/",
      "/hotel-6-stelle-2/": "/blog/viola-e-valeria/",
      "/germogli-diversi-arte-floreale-e-disabilita-la-bellezza-di-un-percorso-possibile-2/": "/blog/viola-e-valeria/",
      "/chopin-diversamente-impresa-2/": "/blog/viola-e-valeria/",
      "/artiste-nellorto-2/": "/blog/viola-e-valeria/",
      "/julia-jean-e-la-tirannia-della-normalita-2/": "/blog/lettere-a-jean-don-marco-bove-2/",
      "/auguri-scomodi-per-il-nuovo-anno-2/": "/blog/lettere-a-jean-don-marco-bove-2/",
      "/sotto-lo-stesso-tetto-casa-famiglia-il-tetto/": "/blog/casa-famiglia-il-tetto/",
      "/pulce-non-ce-recensione-2/": "/blog/quali-mani-asciugheranno-le-mie-lacrime-recensione/",
      "/elogio-della-fragilita/": "/blog/elogio-della-fragilita-recensione/",
      "/chiudi-gli-occhi-e-guardami-vivere-la-disabilita-in-famiglia-recensione-2/": "/blog/dalle-province-n-122/",
      "/casa-famiglia-iniziativa-amica-bambini-che-vanno-bambini-che-vengono/": "/blog/iniziativa-amica-una-casa-famiglia-dove-la-maternita-ritorna-gioia/",
      "/connessi-per-davvero-2/": "/blog/dialogo-aperto-n-139/",
      "/hello-harry-hi-benny-recensione-2/": "/blog/dialogo-aperto-n-139/",
      "/il-signor-parroco-ha-dato-di-matto-2/": "/blog/dialogo-aperto-n-139/",
      "/dopo-di-noi-atti-del-convegno-anffas-2/": "/blog/dialogo-aperto-n-139/",
      "/un-crocifisso-silenzioso-immagine-della-rivoluzione-cristiana/": "/blog/essere-mamma/",
      "/dialogo-aperto-n-84/": "/blog/dialogo-aperto-n-85/",
      "/oscura-luminosissima-notte/": "/blog/oscura-luminosissima-notte-recensione/",
      "/bisogna-accettare-che-un-bambino-abbia-delle-resistenze-2/": "/blog/io-e-simona/",
      "/quattro-giorni-mano-nella-mano-2/": "/blog/io-e-simona/",
      "/don-gnocchi-una-vita-spesa-per-gli-altri-recensione-2/": "/blog/dalle-province-n-138/",
      "/gli-scartagonisti-recensione-2/": "/blog/dalle-province-n-138/",
      "/lamniocentesi-di-stato-e-la-grande-colpa-di-madri-selvagge-recensione/": "/blog/lamniocentesi-di-stato-e-la-grande-colpa-di-noi-madri-selvagge-recensione/",
      "/ce-labbiamo-fatta-2/": "/blog/ciclisti-non-vedenti-vaticano/",
      "/da-bologna-a-roma-in-tandem-un-ciclo-viaggio-oltre-la-disabilita/": "/blog/da-bologna-a-roma-in-tandem/",
      "/da-bologna-a-roma-in-tandem-un-ciclo-viaggio/": "/blog/da-bologna-a-roma-in-tandem/",
      "/safesurfing-navigare-nella-rete-in-sicurezza-2/": "/blog/il-plusabile-due-sorelle-speciali/",
      "/dalle-province-n-139-2/": "/blog/il-plusabile-due-sorelle-speciali/",
      "/viola-e-mimosa-n-139-2/": "/blog/il-plusabile-due-sorelle-speciali/",
      "/segni-efficaci-2/": "/blog/il-plusabile-due-sorelle-speciali/",
      "/la-sua-prima-confessione-2/": "/blog/il-plusabile-due-sorelle-speciali/",
      "/benedetta-mi-convertito/": "/blog/benedetta-mi-ha-convertito/",
      "/noi-dei-piani-di-sopra/": "/blog/storia-redazione-via-bessarione-gammarelli/",
      "/coltivare-propri-pensieri/": "/blog/coltivare-propri-desideri/",
      "/per-una-vera-qualita-di-cura-delle-persone-anziane-2/": "/blog/coltivare-propri-desideri/",
      "/il-coraggio-della-piccola-vanessa-2/": "/blog/lui-la-guida-degli-uomini-e-rimasto-indietro-per-me/",
      "/perche-esista-e-dio-il-responsabile-del-mio-handicap/": "/blog/perche-esiste-la-disabilita-e-dio-il-responsabile-del-mio-handicap/",
      "/ci-hanno-scritto-n-15-2/": "/blog/come-bere-un-bicchier-dacqua/",
      "/pensioni-rubate-2/": "/blog/quasi-amici-recensione/",
      "/berlinale-74-leone-doro/": "/blog/berlinale-74-orso-doro/",
      "/lintimita-del-corpo-vita-tra-fratelli/": "/blog/vita-tra-fratelli/",
      "/riscoprire-la-grazia-della-confessione-2/": "/blog/dicono-di-loro/",
      "/lo-sapevate-che/": "/blog/lo-sapevate-che-2/",
      "/dossier-scola-e-disabilita-2/": "/blog/dialogo-aperto-n-123/",
      "/otto-giorni-per-ventanni/": "/blog/arche-bologna-tandem/",
      "/dossier-vite-da-ri-accogliere-la-citta-dei-ragazzi-cittadini-del-mondo/": "/blog/la-citta-dei-ragazzi/",
      "/dossier-vite-da-ri-accogliere-la-citta-dei-ragazzi/": "/blog/la-citta-dei-ragazzi/",
      "/vite-da-ri-accogliere-la-citta-dei-ragazzi/": "/blog/la-citta-dei-ragazzi/",
      "/essere-padre-di-un-figlio-disabile-2/": "/blog/custodi-della-speranza/",
      "/obiettivo-decrescita-recensione/": "/blog/ii-barattolo-di-maionese-e-caffe/",
      "/il-mo-cane-mi-ha-scelto/": "/blog/il-mio-cane-mi-ha-scelto/",
      "/caro-raffa-la-vita-e-adesso-2/": "/blog/fare-nuove-tutte-le-cose/",
      "/una-redazione-in-condominio/": "/blog/noi-dei-piani-di-sopra/",
      "/le-chiavi-di-casa-recensione/": "/blog/le-chiavi-di-casa-film/",
      "/dal-sostegno-alla-partecipazione-esperienze-di-educazione-inclusiva-per-bambini-con-difficolta-2/": "/blog/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
      "/la-dove-tu-ci-vuoi-ogni-giorno-2/": "/blog/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
      "/ci-hanno-scritto-insieme-n-28-2/": "/blog/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
      "/il-loro-credo-2/": "/blog/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
      "/i-nostri-figli-con-disabilita-a-scuola-2/": "/blog/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita/",
      "/sotto-cieli-noncuranti-recensione-2/": "/blog/sembrava-impossibile-dove-osano-le-aquile-in-carrozzina-recensione/",
      "/la-scelta-di-ivana/": "/blog/la-scelta-di-ivana-la-mia-vita-al-carro/",
      "/ulamministratore-di-sostegno-per-le-persone-con-disabilita/": "/blog/una-nuova-legge-lamministratore-di-sostegno-per-le-persone-con-disabilita/",
      "/presentazione-festival/": "/blog/san-sebastian-il-piu-piccolo-dei-grandi-festival/",
      "/dialogo-aperto-n-138-2/": "/blog/sara-bello/",
      "/pretese-fuori-mercato-2/": "/blog/dialogo-aperto-n-161/",
      "/dalla-festa-del-cinema-di-roma/": "/blog/festa-del-cinema-roma-2023/",
      "/la-casa-di-dario/": "/blog/la-casa-di-dario-comunita-alloggio/",
      "/sara-bello-2/": "/blog/dossier-rifugiati/",
      "/il-mondo-come-lo-vediamo-noi/": "/blog/recensione-as-we-see-it/",
      "/fede-e-luce-larca-ombre-e-luci-tre-vocazioni-ununica-ispirazione/": "/blog/fede-e-luce-larca-ombre-e-luci/",
      "/a-a-a-una-mamma-chiede-una-mamma-risponde/": "/blog/sulleducazione-delle-giovani-generazioni-una-mamma-chiede-una-mamma-risponde/",
      "/fare-nuove-tutte-le-cose-2/": "/blog/le-amiche-di-francesco/",
      "/io-non-voglio-estranei-in-casa-2/": "/blog/per-rompere-la-solitudine-2/",
      "/presena-reale/": "/blog/presenza-reale/",
      "/storia-di-un-segreto-dio-mi-ha-parlato-tramite-i-miei-amici-speciali-2/": "/blog/1971-2011-fede-e-luce-festeggia-40-anni/",
      "/special-olimpics/": "/blog/special-olympics-nessuno-si-deve-sentire-escluso/",
      "/special-olimpics-nessuno-si-deve-sentire-escluso/": "/blog/special-olympics-nessuno-si-deve-sentire-escluso/",
      "/un-incontro-tra-capi/": "/blog/un-incontro-tra-capi-scout/",
      "/portatrice-di-un-messaggio-2/": "/blog/grazie-mariangela/",
      "/borderline-recensione-2/": "/blog/grazie-mariangela/",
      "/viola-e-il-messico-2/": "/blog/grazie-mariangela/",
      "/lettera-di-jean-n-126-2/": "/blog/grazie-mariangela/",
      "/attivita-riabilitative-fiori-colori-e-profumi-2/": "/blog/grazie-mariangela/",
      "/volevo-che-qualcuno-rispondesse-alle-mie-domande-2/": "/blog/grazie-mariangela/",
      "/smack-come-bacio-il-mio-tempo-con-mio-figlio-disabile/": "/blog/smack-come-bacio-il-tempo-con-mio-figlio-disabile/",
      "/noi-papa-di-fiun-modo-diverso-di-amare/": "/blog/noi-papa-di-figli-disabili-un-modo-diverso-di-amare/",
      "/gli-oggetti-raccontano-storie-straordinarie-di-oggetti-comuni/": "/blog/gli-oggetti-raccontano-storie-straordinarie-di-oggetti-comuni-recensione/",
      "/un-affidamento-speciale-2__trashed/": "/blog/un-affidamento-speciale-2/",
      "/insegnante-di-lettere-canale-della-vita-2/": "/blog/il-sorriso-dei-tuoi-occhi/",
      "/il-sorriso-dei-tuoi-occhi-2/": "/blog/da-un-altro-punto-di-vista/",
      "/tra-incontri-nel-riconoscimento-dellaltro-puoi-ritrovare-fiducia-2/": "/blog/la-nostra-presenza-accanto-a-lei/",
      "/con-la-forza-di-una-quercia/": "/blog/agli-amici-vici-siate-disponibili/",
      "/fratelli-e-sorelle-di-persone-con-disabilita-2/": "/blog/nella-diagnosi-siamo-prudenti/",
      "/la-cura-invisibile-per-il-riconoscimento-dei-caregiver-2/": "/blog/nella-diagnosi-siamo-prudenti/",
      "/alla-ricerca-dellaltro-da-me/": "/blog/testimonianza-giulia-cirillo/",
      "/se-avessi-ascoltato-la-mia-disperazione/": "/blog/dialogo-aperto-n-95/",
      "/dalle-province-n-138-2/": "/blog/trasformare-i-nostri-cuori/",
      "/ricordi-di-mia-madre-recensione-2/": "/blog/perdersi-recensione/",
      "/dialogo-aperto-n-143-2/": "/blog/dalle-province-n-143/",
      "/obiettivo-decrescita-ecensione/": "/blog/obiettivo-decrescita-recensione/",
      "/mamma-in-comunita-2/": "/blog/la-strada-percorsa-finora/",
      "/la-speranza-non-fa-rumore-recensione-3/": "/blog/bioetica-come-storia-recensione/",
      "/un-figlio-handicappato-2/": "/blog/editoriale-lettera-aperta-agli-amici-di-fede-e-luce/",
      "/cose-un-sacramento-cose-leucaristia-cose-la-confessione-2/": "/blog/editoriale-lettera-aperta-agli-amici-di-fede-e-luce/",
      "/ci-hanno-scritto-n-12-2/": "/blog/editoriale-lettera-aperta-agli-amici-di-fede-e-luce/",
      "/venerdi-poverta-assisi-1978/": "/blog/quel-giorno-pioveva/",
      "/se-assisi-1978-2/": "/blog/quel-giorno-pioveva/",
      "/corsa-in-taxi-2/": "/blog/un-augurio-speciale/",
      "/gli-altri-vostri-figli-lhanno-accettato-2/": "/blog/vita-fede-e-luce/",
      "/una-realta-esigente-2/": "/blog/vita-fede-e-luce/",
      "/perche-non-mi-capisci-3/": "/blog/vita-fede-e-luce/",
      "/mia-sorella-2/": "/blog/vita-fede-e-luce/",
      "/non-e-facile-esprimere-2/": "/blog/vita-fede-e-luce/",
      "/una-lettera-2/": "/blog/vita-fede-e-luce/",
      "/la-mia-vita-2/": "/blog/vita-fede-e-luce/",
      "/ciao-alessandro/": "/blog/vita-fede-e-luce/",
      "/dialogo-aperto-n-135-2/": "/blog/dalle-province-n-135/",
      "/mi-hanno-regalato-un-sogno-2/": "/blog/dalle-province-n-135/",
      "/mio-figlio-un-angelo-che-ha-scelto-di-vivere/": "/blog/mio-figlio-un-angelo-che-ha-scelto-di-vivere-recensione/",
      "/efrem-1/": "/blog/impegnarsi-e-impegnarmi/",
      "/disabilmentemamma/": "/blog/disabilmentemamme/",
      "/amore-caro-a-filo-doppio-con-persone-fragili/": "/blog/amore-caro-a-filo-doppio-con-persone-fragili-recensione/",
      "/gli-esordi-insieme-1974-1981-2/": "/blog/quattro-punti-cardinali-i-luoghi-di-ombre-e-luci-tra-i-quartieri-di-roma/",
      "/giubileo-2016-la-vera-gioia-2/": "/blog/la-sfida-di-chi-ama-di-piu/",
      "/dialogo-aperto-n-139-2/": "/blog/scoprirsi-unici-e-crescere-insieme/",
      "/come-and-see-meeting-dei-giovani-ad-alicante-2/": "/blog/scoprirsi-unici-e-crescere-insieme/",
      "/la-chiesa-accanto-a-mio-figlio-2/": "/blog/scoprirsi-unici-e-crescere-insieme/",
      "/ci-ha-lasciato-marie-odile-rhethore/": "/blog/ci-ha-lasciato-la-professoressa-marie-odile-rhethore/",
      "/il-respiro-leggero-dellalba-recensione-2/": "/blog/il-motivo-per-cui-salto-recensione/",
      "/tema-dellanno-1980-lincontro-2/": "/blog/letture-consigliate-n-23/",
      "/al-rientro-dalle-vacanze-campeggi-campeggi-ancora-campeggi-2/": "/blog/letture-consigliate-n-23/",
      "/marymount-unestate-di-musica-e-sorrisi-2/": "/blog/letture-consigliate-n-23/",
      "/lordinazione-di-robert-michit-2/": "/blog/letture-consigliate-n-23/",
      "/insieme-verso-la-pasqua-1981-2/": "/blog/letture-consigliate-n-23/",
      "/qualche-raggio-di-sole-in-siria-2/": "/blog/cercare-la-bellezza-la-dove-e-nascosta/",
      "/un-ponte-in-un-guscio-di-noce-2/": "/blog/il-roveto-di-santilario/",
      "/spiritualmente-le-piccole-suore-non-sono-handicappate-2/": "/blog/il-roveto-di-santilario/",
      "/antonietta-campo-estivo/": "/blog/vivere-a-colori/",
      "/anffas-ogni-persona-con-disabilita-e-nostro-figlio/": "/blog/istituto-mio-dio/",
      "/istituto-mio-dio-2/": "/blog/il-tuo-bambino-ha-qualcosa-che-non-va/",
      "/nella-diagnosi-siamo-prudenti-2/": "/blog/tra-paura-e-desiderio-di-sapere/",
      "/il-tuo-bambino-ha-qualcosa-che-non-va-2/": "/blog/che-grinta/",
      "/tra-paura-e-desiderio-di-sapere-2/": "/blog/dialogo-aperto-n-122/",
      "/non-possiamo-restare-dei-peter-pan-a-vita-2/": "/blog/il-senso-di-una-vita-e-di-una-scelta/",
      "/cercare-la-bellezza-la-dove-e-nascosta-2/": "/blog/il-senso-di-una-vita-e-di-una-scelta/",
      "/che-grinta-2/": "/blog/ora-basta/",
      "/notiziario-fede-e-luce-dicembre-1976-2/": "/blog/testimonianze-dai-campi-di-alfedena-1976/",
      "/la-comunicazione-multimodale-2/": "/blog/segni-dellamore-di-dio/",
      "/segni-dellamore-di-dio-2/": "/blog/ascoltare-i-segni-perche-in-lis/",
      "/fede-e-luce-anatomia-di-una-comunita-di-incontro/": "/blog/1-introduzione-fede-e-luce-anatomia-di-una-comunita-di-incontro/",
      "/ci-hanno-scritto-insieme-n-24-2/": "/blog/1-introduzione-fede-e-luce-anatomia-di-una-comunita-di-incontro/",
      "/ascoltare-i-segni-perche-in-lis-2/": "/blog/fede-e-luce-una-grande-famiglia/",
      "/porta-sfortuna-2/": "/blog/dialogo-aperto-n-133/",
      "/il-roveto-di-santilario-2/": "/blog/dialogo-aperto-n-133/",
      "/la-disabilita-un-confine-da-superare-2/": "/blog/chiamati-tutti-al-traguardo/",
      "/il-senso-di-una-vita-e-di-una-scelta-2/": "/blog/chiamati-tutti-al-traguardo/",
      "/dalle-provincia-n-130-2/": "/blog/il-senso-della-festa/",
      "/la-paura-di-amare-recensione-2/": "/blog/il-senso-della-festa/",
      "/dialogo-aperto-n-130-2/": "/blog/il-senso-della-festa/",
      "/il-senso-della-festa-2/": "/blog/scintille-di-amicizia/",
      "/scintille-di-amicizia-2/": "/blog/i-mille-volti/",
      "/i-mille-volti-2/": "/blog/piu-scavo-piu-trovo/",
      "/il-motivo-per-cui-salto-recensione-2/": "/blog/dialogo-aperto-n-126/",
      "/dialogo-aperto-n-126-2/": "/blog/fede-e-luce-si-ci-siamo-anche-noi/",
      "/fede-e-luce-si-ci-siamo-anche-noi-2/": "/blog/un-capo-atipico-per-larca/",
      "/un-capo-atipico-per-larca-2/": "/blog/cristiani-del-sagrato/",
      "/cristiani-del-sagrato-2/": "/blog/la-mia-lampada-frontale/",
      "/la-mia-lampada-frontale-2/": "/blog/argento-vivo/",
      "/argento-vivo-2/": "/blog/sulla-sua-strada/",
      "/da-un-altro-punto-di-vista-2/": "/blog/con-orgoglio-e-tenerezza/",
      "/lamicizia-un-dono-unico-ed-eterno-2/": "/blog/con-orgoglio-e-tenerezza/",
      "/labilita-onlus-aprire-gli-occhi-2/": "/blog/avere-un-posto-nella-societa/",
      "/il-calore-dellamicizia-2/": "/blog/una-ragazza-speciale/",
      "/vuoi-bene-a-gesu-2/": "/blog/una-ragazza-speciale/",
      "/una-ragazza-speciale-2/": "/blog/perche-ho-avuto-fiducia/",
      "/puo-un-gesto-essere-cosi-significativo-2/": "/blog/un-oro-al-giorno/",
      "/chi-scalda-il-cuore-2/": "/blog/un-oro-al-giorno/",
      "/cosa-ti-aspetti-2/": "/blog/un-oro-al-giorno/",
      "/monsignor-von-galen-leroismo-di-una-coscienza-2/": "/blog/un-oro-al-giorno/",
      "/il-giubileo-di-fede-e-luce-2/": "/blog/un-oro-al-giorno/",
      "/dalle-province-n-135-2/": "/blog/un-oro-al-giorno/",
      "/chiamati-a-portare-frutto-2/": "/blog/un-oro-al-giorno/",
      "/la-lingua-dei-segni-nelle-disabilita-comunicative/": "/blog/la-lingua-dei-segni-nelle-disabilita-comunicative-recensione/",
      "/marina-di-camerota-venti-giorni-di-prime-volte-2/": "/blog/quante-domande-davanti-a-loro/",
      "/estate-fede-e-luce-1980-la-gioia-di-fare-vacanza-insieme-2/": "/blog/quante-domande-davanti-a-loro/",
      "/campeggio-fede-e-luce-unavventura-di-vita-e-comunita-2/": "/blog/quante-domande-davanti-a-loro/",
      "/un-aiuto-per-il-pellegrinaggio-di-lourdes-1981-chi-puo-darci-una-mano-2/": "/blog/quante-domande-davanti-a-loro/",
      "/incontro-internazionale-e-nazionale-un-ponte-di-solidarieta-tra-paesi-e-comunita-2/": "/blog/quante-domande-davanti-a-loro/",
      "/ogni-volta-che-lascio-alfedena-2/": "/blog/quante-domande-davanti-a-loro/",
      "/darti-la-vita-2/": "/blog/adulti-lievemente-handicappati/",
      "/vita-fede-e-luce-natale-1977-a-2/": "/blog/assemblea-internazionale-di-fede-e-luce-a-bruxelles-gennaio-1978/",
      "/notiziario-fede-e-luce-n-16-2/": "/blog/assemblea-internazionale-di-fede-e-luce-a-bruxelles-gennaio-1978/",
      "/esperienze-i-campi-dellestete-1977/": "/blog/esperienze-i-campi-dellestate-1977/",
      "/scuola-e-disabilita-integrazione-ascoltiamo-le-testimonianze-di-due-mamme-2/": "/blog/esperienze-i-campi-dellestate-1977/",
      "/come-bere-un-bicchier-dacqua-2/": "/blog/esperienze-i-campi-dellestate-1977/",
      "/giovanissimi-2/": "/blog/buon-natale-antico-corale-trascritto-da-un-bambino/",
      "/sono-tornato-stasera-2/": "/blog/buon-natale-antico-corale-trascritto-da-un-bambino/",
      "/noris-2/": "/blog/buon-natale-antico-corale-trascritto-da-un-bambino/",
      "/giovanissimi-n-3-2/": "/blog/buon-natale-antico-corale-trascritto-da-un-bambino/",
      "/buon-natale-antico-corale-trascritto-da-un-bambino-2/": "/blog/ci-ha-scritto-la-mamma-di-roberto/",
      "/per-la-nostra-riflessione-2/": "/blog/letture-consigliate-n-18/",
      "/per-la-loro-educazione-visita-allistituto-statale-romagnolo-per-non-vedenti-2/": "/blog/letture-consigliate-n-18/",
      "/esperienze-al-gruppo-fede-e-luce-la-mamma-di-massimo-2/": "/blog/letture-consigliate-n-18/",
      "/come-un-raggio-di-sole-2/": "/blog/letture-consigliate-n-18/",
      "/notiziario-fede-e-luce-n-18-2/": "/blog/letture-consigliate-n-18/",
      "/vita-dei-gruppi-fede-e-luce-1978-2/": "/blog/letture-consigliate-n-18/",
      "/festa-della-primavera-a-villa-pacis-1978-2/": "/blog/letture-consigliate-n-18/",
      "/la-casetta-di-fede-e-luce-cose-che-fini-ha-chi-la-frequenta/": "/blog/letture-consigliate-n-18/",
      "/fede-e-luce-anatomia-di-una-comunita-di-incontro-2/": "/blog/5-creascere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/",
      "/fede-e-luce-larte-dellincontro-per-superare-la-paura-della-diversita-2/": "/blog/5-creascere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/",
      "/costruire-comunita-i-tre-pilastri-di-fede-e-luce/": "/blog/5-creascere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/",
      "/guidare-una-comunita-fede-e-luce-principi-e-pratica/": "/blog/5-creascere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/",
      "/esperienze-i-campi-dellestate-1977-2/": "/blog/notiziario-fede-e-luce-calendario-1978/",
      "/notiziario-fede-e-luce-1978/": "/blog/notiziario-fede-e-luce-calendario-1978/",
      "/costruire-comunita-tre-pilastri-fede-luce/": "/blog/4-vita-comunitaria-costruire-comunita-tre-pilastri-fede-luce/",
      "/i-volti-di-fede-e-luce-persona-con-disabilita-genitori-amici-e-sacerdoti-2/": "/blog/4-vita-comunitaria-costruire-comunita-tre-pilastri-fede-luce/",
      "/ci-hanno-scritto-n-20-2/": "/blog/notiziario-fede-e-luce-n-20/",
      "/7-testimonianze-di-genitori-e-amici-di-bambini-profondamente-handicappati-2/": "/blog/notiziario-fede-e-luce-n-20/",
      "/la-forestiere-vita-comunitaria-con-i-piu-gravi-allarche-2/": "/blog/notiziario-fede-e-luce-n-20/",
      "/ci-ha-scritto-la-mamma-di-roberto-2/": "/blog/avevano-bisogno-di-noi/",
      "/di-serie-promettenti-e-film-non-riusciti-alla-festa-del-cinema-di-roma/": "/blog/recensione-te-lavevo-detto-la-storia/",
      "/notiziario-fede-e-luce-calendario-del-prossimo-anno/": "/blog/bando-di-concorso-per-auto-adesivo-del-pellegrinaggio/",
      "/un-giro-in-tandem/": "/blog/il-mio-primo-giro-in-bici/",
      "/meditazione-a-modo-mio-2/": "/blog/jean-vanier-a-parma-1978/",
      "/quel-giorno-pioveva-2/": "/blog/jean-vanier-a-parma-1978/",
      "/5-crescere-insieme-guidare-una-comunita-fede-e-luce-principi-e-pratica/": "/blog/andiamo-tutti-in-pizzeria/",
      "/lourdes-qui-e-oggi/": "/blog/andiamo-tutti-in-pizzeria/",
      "/vita-fede-e-luce-n-24-2/": "/blog/andiamo-tutti-in-pizzeria/",
      "/pellegrinaggio-a-loreto-18-20-maggio-1979-2/": "/blog/gita-ad-argegno-3-giugno-1979/",
      "/pellegrinaggio-a-loreto-1979-le-testimonianze-dei-partecipanti/": "/blog/gita-ad-argegno-3-giugno-1979/",
      "/23-maggio-1979-festa-della-primavera-2/": "/blog/gita-ad-argegno-3-giugno-1979/",
      "/gita-ad-argegno-3-giugno-1979-2/": "/blog/vita-fede-e-luce-n-22-1979/",
      "/vita-fede-e-luce-n-22-1979-2/": "/blog/letture-consigliate-n-22/",
      "/cosa-vedremo-a-roma-durante-il-pellegrinaggio-1975-2/": "/blog/i-canti-del-pellegrinaggio-di-roma-1975/",
      "/per-te-ho-visitato-roma-2/": "/blog/i-canti-del-pellegrinaggio-di-roma-1975/",
      "/testimonianze-dal-pellegrinaggio-di-lourdes-1971-2/": "/blog/i-canti-del-pellegrinaggio-di-roma-1975/",
      "/i-volti-di-fede-e-luce-persona-con-disabilita-genitori-amici-e-sacerdoti/": "/blog/3-i-protagonisti-i-volti-di-fede-e-luce-persona-con-disabilita-genitori-amici-e-sacerdoti/",
      "/il-mio-quinto-concerto-di-baglioni/": "/blog/benedetta-baglioni/",
      "/leco-della-stampa-2/": "/blog/ricordi-e-speranze-dai-questionari-sul-pellegrinaggio-a-roma-del-1975/",
      "/ricordi-e-speranze-dai-questionari-sul-pellegrinaggio-a-roma-del-1975-2/": "/blog/giovanissimi-n-7/",
      "/giovanissimi-n-7-2/": "/blog/tavola-rotonda/",
      "/tavola-rotonda-2/": "/blog/dietro-le-quinte/",
      "/dietro-le-quinte-2/": "/blog/il-problema-dellacqua/",
      "/il-problema-dellacqua-2/": "/blog/la-nostra-buona-novella/",
      "/avevano-bisogno-di-noi-2/": "/blog/resoconti-degli-incontri-fede-e-luce/",
      "/scuola-viva-un-modello-di-inclusione-attiva-per-bambini-con-disabilita-2/": "/blog/vita-fede-e-luce-insieme-n-28/",
      "/techniche-di-recupero-per-i-disabili-gravi-la-socializzazione/": "/blog/tecniche-di-recupero-per-i-disabili-gravi-la-socializzazione/",
      "/fede-e-luce-larte-dellincontro-per-superare-la-paura-della-diversita/": "/blog/2-fede-e-luce-larte-dellincontro-per-superare-la-paura-della-diversita/",
      "/3-vincitori-e-non/": "/blog/san-sebastian-festival-tardes-de-soledad/",
      "/letture-consigliate-n-13/": "/blog/letture-consigliate-n-14/",
      "/vita-fede-e-luce-insieme-n-28-2/": "/blog/la-vendita-di-novembre-impegno-e-solidarieta/",
      "/together-a-san-pietro-2/": "/blog/mimo-a-san-pietro/",
      "/quando-arrivia-il-natale/": "/blog/quando-arriva-il-natale/",
      "/vita-fede-e-luce-insieme-n-25/": "/blog/e-uscita-una-nuova-legge-sullassegno-di-accompagnamento-per-le-persone-totalmente-inabili/",
      "/e-uscita-una-nuova-legge-sullassegno-di-accompagnamento-per-le-persone-totalmente-inabili-2/": "/blog/letture-consigliate-la-vita-puo-ricominciare-recensione/",
      "/partiamo-per-il-congo/": "/blog/partiamo-per-il-congo-caa/",
      "/letture-consigliate-la-vita-puo-ricominciare-recensione-2/": "/blog/questionario-per-i-fratelli-e-sorrelle-di-persone-con-disabilita/",
      "/notiziario-fede-e-luce-n-20-2/": "/blog/che-cose-un-katimavic/",
      "/che-cose-un-katimavic-2/": "/blog/letture-consigliate-lo-svantaggiato-quale-educazione/",
      "/la-vendita-di-novembre-impegno-e-solidarieta-2/": "/blog/incontro-internazionale-preparativi-e-spiritualita/",
      "/via-plinio-30-2/": "/blog/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
      "/ci-hanno-scritto-insieme-n-26-2/": "/blog/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
      "/dalla-parte-di-lazzaro-2/": "/blog/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
      "/5-anni-di-casetta-2/": "/blog/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
      "/andiamo-alla-casetta-2/": "/blog/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti/",
      "/telegramma-educarsi-insieme-crescere-con-gli-altri-per-il-bene-di-tutti-2/": "/blog/un-problema-che-non-so-risolvere/",
      "/un-problema-che-non-so-risolvere-2/": "/blog/vita-fede-e-luce-insieme-n-26/",
      "/vita-fede-e-luce-insieme-n-26-2/": "/blog/letture-consigliate-n-26/",
      "/fede-e-luce-un-po-di-storia/": "/blog/la-festa-continua/",
      "/amici-delicati-e-fedeli-2/": "/blog/la-festa-continua/",
      "/gioia-di-essere-sacerdote-2/": "/blog/la-festa-continua/",
      "/la-lettera-del-papa-wojtyla-2/": "/blog/la-festa-continua/",
      "/avevo-paura-2/": "/blog/la-festa-continua/",
      "/come-avviare-una-comunita-2/": "/blog/la-festa-continua/",
      "/perche-un-numero-dedicato-allanimazione-2/": "/blog/la-festa-continua/",
      "/jean-vanier-ai-giovani-2/": "/blog/la-festa-continua/",
      "/perche-a-lourdes-2/": "/blog/la-festa-continua/",
      "/lettera-di-presentazione-del-cardinale-hume-2/": "/blog/la-festa-continua/",
      "/celebriamo-la-pasqua-1981-nella-comunita-fede-e-luce-2/": "/blog/la-festa-continua/",
      "/perche-questo-insieme-speciale-2/": "/blog/la-festa-continua/",
      "/1-insieme-in-cammino-siamo-tutti-pellegrini/": "/blog/la-festa-continua/",
      "/2-pellegrini-in-comunita-2/": "/blog/la-festa-continua/",
      "/3-in-comunita-accoglienti-2/": "/blog/la-festa-continua/",
      "/4-ognuno-ha-il-suo-posto-nella-comunita-2/": "/blog/la-festa-continua/",
      "/5-sono-loro-che-ci-uniscono-e-ci-guidano-2/": "/blog/la-festa-continua/",
      "/6-cristo-risorto-fa-di-noi-un-solo-popolo-2/": "/blog/la-festa-continua/",
      "/7-lo-spirito-santo-dono-di-gesu-risorto-2/": "/blog/la-festa-continua/",
      "/8-nutrirsi-di-gesu-attraverso-la-parola-2/": "/blog/la-festa-continua/",
      "/9-nella-preghiera-personale-2/": "/blog/la-festa-continua/",
      "/11-compiendo-la-volonta-del-padre-2/": "/blog/la-festa-continua/",
      "/10-nella-preghiera-comunitaria-2/": "/blog/la-festa-continua/",
      "/12-con-i-santi-2/": "/blog/la-festa-continua/",
      "/13-con-maria-2/": "/blog/la-festa-continua/",
      "/14-nelleucarestia-venite-a-me-2/": "/blog/la-festa-continua/",
      "/15-nelleucarestia-restate-in-me-2/": "/blog/la-festa-continua/",
      "/16-il-perdono-2/": "/blog/la-festa-continua/",
      "/fede-e-luce-domande-e-risposte-2/": "/blog/la-festa-continua/",
      "/ma-di-sicuro-torna-il-sereno-2/": "/blog/la-festa-continua/",
      "/fede-e-luce-pasquale-2/": "/blog/la-festa-continua/",
      "/cosa-e-fede-e-luce-tre-risposte-2/": "/blog/la-festa-continua/",
      "/ognuno-ha-il-suo-posto-nella-comunita-2/": "/blog/la-festa-continua/",
      "/scegliere-di-lasciarsi-scegliere-2/": "/blog/la-festa-continua/",
      "/il-posto-della-persona-handicappata-nelle-nostre-comunita-2/": "/blog/la-festa-continua/",
      "/genitori-di-persone-con-disabilita-nessuno-disturba-nessuno-2/": "/blog/la-festa-continua/",
      "/tre-tappe-nella-mia-vita-2/": "/blog/la-festa-continua/",
      "/incontro-fra-genitori-2/": "/blog/la-festa-continua/",
      "/lorganizazione-a-fede-e-luce/": "/blog/lorganizzazione-a-fede-e-luce/",
      "/la-festa-continua-2/": "/blog/lorganizzazione-a-fede-e-luce/",
      "/tu-sostieni-2/": "/blog/18-domande-su-fede-e-luce/",
      "/i-fratelli-e-le-sorelle-di-persone-con-disabilita-2/": "/blog/18-domande-su-fede-e-luce/",
      "/cosa-e-e-come-funziona-una-comunita-fede-e-luce-2/": "/blog/18-domande-su-fede-e-luce/",
      "/prendete-e-mangiatene-tutti-2/": "/blog/18-domande-su-fede-e-luce/",
      "/la-festa-a-fede-e-luce-2/": "/blog/18-domande-su-fede-e-luce/",
      "/il-pellegrinaggio-a-fede-e-luce-2/": "/blog/18-domande-su-fede-e-luce/",
      "/18-domande-su-fede-e-luce-2/": "/blog/primo-campeggio-fede-e-luce/",
      "/animare-una-messa-e-renderla-viva-facendo-lunita-2/": "/blog/principi-di-azione-per-una-equipe-di-animazione/",
      "/principi-di-azione-per-una-equipe-di-animazione-2/": "/blog/dare-vita-movimento-calore-limportanza-dellanimazione-nelle-comunita-fede-e-luce/",
      "/dare-vita-movimento-calore-limportanza-dellanimazione-nelle-comunita-fede-e-luce-2/": "/blog/dopo-di-me-il-diluvio-commedia-musicale-del-gruppo-fede-e-luce-di-san-paolo/",
      "/dopo-di-me-il-diluvio-commedia-musicale-del-gruppo-fede-e-luce-di-san-paolo-2/": "/blog/la-festa-uno-dei-momenti-essenziale-della-comunita-fede-e-luce/",
      "/la-festa-uno-dei-momenti-essenziali-della-comunita-fede-e-luce/": "/blog/unora-di-musica-con-suor-maria/",
      "/unora-di-musica-con-suor-maria-2/": "/blog/comunita-di-fede-e-luce/",
      "/comunita-di-fede-e-luce-2/": "/blog/consigli-di-lettura-insieme-n-29/",
      "/in-viaggio-verso-lourdes-2/": "/blog/lourdes-1981-giovedi-santo/",
      "/lourdes-1981-giovedi-santo-2/": "/blog/lourdes-1981-venerdi-santo/",
      "/lourdes-1981-venerdi-santo-2/": "/blog/lourdes-1981-sabato-santo/",
      "/lourdes-1981-domenica-di-pasqua-2/": "/blog/va-verso-i-tuoi-fratelli-e-di-loro/",
      "/va-verso-i-tuoi-fratelli-e-di-loro-2/": "/blog/voci-dal-pellegrinaggio-lourdes-1981-frammenti-di-vita-e-di-fede/",
      "/voci-dal-pellegrinaggio-lourdes-1981-frammenti-di-vita-e-di-fede-2/": "/blog/una-nuova-speranza/",
      "/una-nuova-speranza-2/": "/blog/buon-natale-1981-e-un-numero-speciale/",
      "/buon-natale-1981-e-un-numero-speciale-2/": "/blog/storia-di-natale/",
      "/storia-di-natale-2/": "/blog/il-futuro-di-insieme-una-catena-che-diventa-sempre-piu-grande/",
      "/risorse-per-una-catechesi-sensoriale-e-inclusiva/": "/blog/catechesi-inclusiva-materiali-tattili/",
      "/la-piccola-marcia/": "/blog/alla-piccola-marcia-di-assisi/",
      "/il-ruolo-di-cura-tre-film-alla-berlinale-che-ispirano-una-riflessione/": "/blog/il-ruolo-di-cura-quattro-film-berlinale/",
      "/il-cugino-che-sapeva-di-lavanda/": "/blog/claudio-lavanda/",
      "/il-coraggio-di-cambiare-2/": "/blog/suor-veronica-pompei/",
      "/se-sei-sola-invece-no/": "/blog/se-sei-sola-invece-non-e-bello/",
      "/lourdes-a-miracle-of-encounter/": "/blog/mother-teresa-of-calcutta-dedicated-to-children-and-to-all-of-us/",
      "/interactive-games-for-unforgettable-group-funmatica/": "/blog/interactive-games-unforgettable-group-fun/",
      "/la-festa-di-compleanno-di-veronica-felice/": "/blog/la-festa-di-compleanno-di-veronica/"
    };
    REDIRECTS = redirectsLegacy;
    DATE_PATH_RE = /^\/\d{4}\/\d{2}\/\d{2}\/(.+)$/;
    onRequest$2 = defineMiddleware2(({ url, redirect }, next) => {
      const path = url.pathname;
      const target = REDIRECTS[path];
      if (target) {
        return redirect("https://ombreeluci.it" + target, 301);
      }
      const dateMatch = path.match(DATE_PATH_RE);
      if (dateMatch) {
        return redirect("https://ombreeluci.it/blog/" + dateMatch[1], 301);
      }
      return next();
    });
    When = {
      Client: "client",
      Server: "server",
      Prerender: "prerender",
      StaticBuild: "staticBuild",
      DevServer: "devServer"
    };
    isBuildContext = Symbol.for("astro:when/buildContext");
    whenAmI = globalThis[isBuildContext] ? When.Prerender : When.Server;
    middlewares = {
      [When.Client]: () => {
        throw new Error("Client should not run a middleware!");
      },
      [When.DevServer]: (_, next) => next(),
      [When.Server]: (_, next) => next(),
      [When.Prerender]: (ctx, next) => {
        if (ctx.locals.runtime === void 0) {
          ctx.locals.runtime = {
            env: process.env
          };
        }
        return next();
      },
      [When.StaticBuild]: (_, next) => next()
    };
    onRequest$1 = middlewares[whenAmI];
    onRequest = sequence2(
      onRequest$1,
      onRequest$2
    );
  }
});

// _worker.js/index.js
import { renderers } from "./renderers.mjs";

// _worker.js/_@astrojs-ssr-adapter.mjs
import { r as requestIs404Or500, n as notFound, a as normalizeTheLocale, b as redirectToFallback, c as redirectToDefaultLocale, e as requestHasLocale, d as defineMiddleware, R as RouteCache, s as sequence, f as fileExtension, j as joinPaths, g as slash, p as prependForwardSlash, h as findRouteToRewrite, i as removeTrailingForwardSlash, m as matchRoute, k as appendForwardSlash, l as RenderContext, o as getSetCookiesFromResponse } from "./chunks/index_B-gW6nkE.mjs";
import { C as ROUTE_TYPE_HEADER, R as REROUTE_DIRECTIVE_HEADER, Y as decryptString, Z as createSlotValueFromString, d as renderComponent, r as renderTemplate, D as DEFAULT_404_COMPONENT, _ as bold, $ as red, a0 as yellow, a1 as dim, a2 as blue, A as AstroError, L as LocalsNotAnObject, H as clientLocalsSymbol, J as clientAddressSymbol, a3 as REROUTABLE_STATUS_CODES, T as responseSentSymbol } from "./chunks/astro/server_CgTYz_Tl.mjs";
import { N as NOOP_MIDDLEWARE_FN } from "./chunks/noop-middleware_Chs5f3j2.mjs";
import { e as ensure404Route, D as DEFAULT_404_ROUTE, a as default404Instance } from "./chunks/astro-designed-error-pages_DfD573yd.mjs";
globalThis.process ??= {};
globalThis.process.env ??= {};
function createI18nMiddleware(i18n, base, trailingSlash, format) {
  if (!i18n)
    return (_, next) => next();
  const payload = {
    ...i18n,
    trailingSlash,
    base,
    format
  };
  const _redirectToDefaultLocale = redirectToDefaultLocale(payload);
  const _noFoundForNonLocaleRoute = notFound(payload);
  const _requestHasLocale = requestHasLocale(payload.locales);
  const _redirectToFallback = redirectToFallback(payload);
  const prefixAlways = /* @__PURE__ */ __name((context) => {
    const url = context.url;
    if (url.pathname === base + "/" || url.pathname === base) {
      return _redirectToDefaultLocale(context);
    } else if (!_requestHasLocale(context)) {
      return _noFoundForNonLocaleRoute(context);
    }
    return void 0;
  }, "prefixAlways");
  const prefixOtherLocales = /* @__PURE__ */ __name((context, response) => {
    let pathnameContainsDefaultLocale = false;
    const url = context.url;
    for (const segment of url.pathname.split("/")) {
      if (normalizeTheLocale(segment) === normalizeTheLocale(i18n.defaultLocale)) {
        pathnameContainsDefaultLocale = true;
        break;
      }
    }
    if (pathnameContainsDefaultLocale) {
      const newLocation = url.pathname.replace(`/${i18n.defaultLocale}`, "");
      response.headers.set("Location", newLocation);
      return _noFoundForNonLocaleRoute(context);
    }
    return void 0;
  }, "prefixOtherLocales");
  return async (context, next) => {
    const response = await next();
    const type = response.headers.get(ROUTE_TYPE_HEADER);
    const isReroute = response.headers.get(REROUTE_DIRECTIVE_HEADER);
    if (isReroute === "no" && typeof i18n.fallback === "undefined") {
      return response;
    }
    if (type !== "page" && type !== "fallback") {
      return response;
    }
    if (requestIs404Or500(context.request, base)) {
      return response;
    }
    const { currentLocale } = context;
    switch (i18n.strategy) {
      case "manual": {
        return response;
      }
      case "domains-prefix-other-locales": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = prefixOtherLocales(context, response);
          if (result) {
            return result;
          }
        }
        break;
      }
      case "pathname-prefix-other-locales": {
        const result = prefixOtherLocales(context, response);
        if (result) {
          return result;
        }
        break;
      }
      case "domains-prefix-always-no-redirect": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = _noFoundForNonLocaleRoute(context, response);
          if (result) {
            return result;
          }
        }
        break;
      }
      case "pathname-prefix-always-no-redirect": {
        const result = _noFoundForNonLocaleRoute(context, response);
        if (result) {
          return result;
        }
        break;
      }
      case "pathname-prefix-always": {
        const result = prefixAlways(context);
        if (result) {
          return result;
        }
        break;
      }
      case "domains-prefix-always": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = prefixAlways(context);
          if (result) {
            return result;
          }
        }
        break;
      }
    }
    return _redirectToFallback(context, response);
  };
}
__name(createI18nMiddleware, "createI18nMiddleware");
function localeHasntDomain(i18n, currentLocale) {
  for (const domainLocale of Object.values(i18n.domainLookupTable)) {
    if (domainLocale === currentLocale) {
      return false;
    }
  }
  return true;
}
__name(localeHasntDomain, "localeHasntDomain");
var FORM_CONTENT_TYPES = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain"
];
function createOriginCheckMiddleware() {
  return defineMiddleware((context, next) => {
    const { request, url } = context;
    if (request.method === "GET") {
      return next();
    }
    const sameOrigin = (request.method === "POST" || request.method === "PUT" || request.method === "PATCH" || request.method === "DELETE") && request.headers.get("origin") === url.origin;
    const hasContentType = request.headers.has("content-type");
    if (hasContentType) {
      const formLikeHeader = hasFormLikeHeader(request.headers.get("content-type"));
      if (formLikeHeader && !sameOrigin) {
        return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
          status: 403
        });
      }
    } else {
      if (!sameOrigin) {
        return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
          status: 403
        });
      }
    }
    return next();
  });
}
__name(createOriginCheckMiddleware, "createOriginCheckMiddleware");
function hasFormLikeHeader(contentType) {
  if (contentType) {
    for (const FORM_CONTENT_TYPE of FORM_CONTENT_TYPES) {
      if (contentType.toLowerCase().includes(FORM_CONTENT_TYPE)) {
        return true;
      }
    }
  }
  return false;
}
__name(hasFormLikeHeader, "hasFormLikeHeader");
function getPattern(segments, base, addTrailingSlash) {
  const pathname = segments.map((segment) => {
    if (segment.length === 1 && segment[0].spread) {
      return "(?:\\/(.*?))?";
    } else {
      return "\\/" + segment.map((part) => {
        if (part.spread) {
          return "(.*?)";
        } else if (part.dynamic) {
          return "([^/]+?)";
        } else {
          return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }
      }).join("");
    }
  }).join("");
  const trailing = addTrailingSlash && segments.length ? getTrailingSlashPattern(addTrailingSlash) : "$";
  let initial = "\\/";
  if (addTrailingSlash === "never" && base !== "/") {
    initial = "";
  }
  return new RegExp(`^${pathname || initial}${trailing}`);
}
__name(getPattern, "getPattern");
function getTrailingSlashPattern(addTrailingSlash) {
  if (addTrailingSlash === "always") {
    return "\\/$";
  }
  if (addTrailingSlash === "never") {
    return "$";
  }
  return "\\/?$";
}
__name(getTrailingSlashPattern, "getTrailingSlashPattern");
var SERVER_ISLAND_ROUTE = "/_server-islands/[name]";
var SERVER_ISLAND_COMPONENT = "_server-islands.astro";
function getServerIslandRouteData(config) {
  const segments = [
    [{ content: "_server-islands", dynamic: false, spread: false }],
    [{ content: "name", dynamic: true, spread: false }]
  ];
  const route = {
    type: "page",
    component: SERVER_ISLAND_COMPONENT,
    generate: () => "",
    params: ["name"],
    segments,
    pattern: getPattern(segments, config.base, config.trailingSlash),
    prerender: false,
    isIndex: false,
    fallbackRoutes: [],
    route: SERVER_ISLAND_ROUTE
  };
  return route;
}
__name(getServerIslandRouteData, "getServerIslandRouteData");
function ensureServerIslandRoute(config, routeManifest) {
  if (routeManifest.routes.some((route) => route.route === "/_server-islands/[name]")) {
    return;
  }
  routeManifest.routes.unshift(getServerIslandRouteData(config));
}
__name(ensureServerIslandRoute, "ensureServerIslandRoute");
function createEndpoint(manifest2) {
  const page = /* @__PURE__ */ __name(async (result) => {
    const params = result.params;
    const request = result.request;
    const raw = await request.text();
    const data = JSON.parse(raw);
    if (!params.name) {
      return new Response(null, {
        status: 400,
        statusText: "Bad request"
      });
    }
    const componentId = params.name;
    const imp = manifest2.serverIslandMap?.get(componentId);
    if (!imp) {
      return new Response(null, {
        status: 404,
        statusText: "Not found"
      });
    }
    const key = await manifest2.key;
    const encryptedProps = data.encryptedProps;
    const propString = await decryptString(key, encryptedProps);
    const props = JSON.parse(propString);
    const componentModule = await imp();
    const Component = componentModule[data.componentExport];
    const slots = {};
    for (const prop in data.slots) {
      slots[prop] = createSlotValueFromString(data.slots[prop]);
    }
    return renderTemplate`${renderComponent(result, "Component", Component, props, slots)}`;
  }, "page");
  page.isAstroComponentFactory = true;
  const instance = {
    default: page,
    partial: true
  };
  return instance;
}
__name(createEndpoint, "createEndpoint");
function injectDefaultRoutes(ssrManifest, routeManifest) {
  ensure404Route(routeManifest);
  ensureServerIslandRoute(ssrManifest, routeManifest);
  return routeManifest;
}
__name(injectDefaultRoutes, "injectDefaultRoutes");
function createDefaultRoutes(manifest2) {
  const root = new URL(manifest2.hrefRoot);
  return [
    {
      instance: default404Instance,
      matchesComponent: (filePath) => filePath.href === new URL(DEFAULT_404_COMPONENT, root).href,
      route: DEFAULT_404_ROUTE.route,
      component: DEFAULT_404_COMPONENT
    },
    {
      instance: createEndpoint(manifest2),
      matchesComponent: (filePath) => filePath.href === new URL(SERVER_ISLAND_COMPONENT, root).href,
      route: SERVER_ISLAND_ROUTE,
      component: SERVER_ISLAND_COMPONENT
    }
  ];
}
__name(createDefaultRoutes, "createDefaultRoutes");
var Pipeline = class {
  constructor(logger, manifest2, mode, renderers2, resolve, serverLike, streaming, adapterName = manifest2.adapterName, clientDirectives = manifest2.clientDirectives, inlinedScripts = manifest2.inlinedScripts, compressHTML = manifest2.compressHTML, i18n = manifest2.i18n, middleware = manifest2.middleware, routeCache = new RouteCache(logger, mode), site = manifest2.site ? new URL(manifest2.site) : void 0, defaultRoutes = createDefaultRoutes(manifest2)) {
    this.logger = logger;
    this.manifest = manifest2;
    this.mode = mode;
    this.renderers = renderers2;
    this.resolve = resolve;
    this.serverLike = serverLike;
    this.streaming = streaming;
    this.adapterName = adapterName;
    this.clientDirectives = clientDirectives;
    this.inlinedScripts = inlinedScripts;
    this.compressHTML = compressHTML;
    this.i18n = i18n;
    this.middleware = middleware;
    this.routeCache = routeCache;
    this.site = site;
    this.defaultRoutes = defaultRoutes;
    this.internalMiddleware = [];
    if (i18n?.strategy !== "manual") {
      this.internalMiddleware.push(
        createI18nMiddleware(i18n, manifest2.base, manifest2.trailingSlash, manifest2.buildFormat)
      );
    }
  }
  internalMiddleware;
  resolvedMiddleware = void 0;
  /**
   * Resolves the middleware from the manifest, and returns the `onRequest` function. If `onRequest` isn't there,
   * it returns a no-op function
   */
  async getMiddleware() {
    if (this.resolvedMiddleware) {
      return this.resolvedMiddleware;
    } else if (this.middleware) {
      const middlewareInstance = await this.middleware();
      const onRequest2 = middlewareInstance.onRequest ?? NOOP_MIDDLEWARE_FN;
      if (this.manifest.checkOrigin) {
        this.resolvedMiddleware = sequence(createOriginCheckMiddleware(), onRequest2);
      } else {
        this.resolvedMiddleware = onRequest2;
      }
      return this.resolvedMiddleware;
    } else {
      this.resolvedMiddleware = NOOP_MIDDLEWARE_FN;
      return this.resolvedMiddleware;
    }
  }
};
__name(Pipeline, "Pipeline");
var RedirectComponentInstance = {
  default() {
    return new Response(null, {
      status: 301
    });
  }
};
var RedirectSinglePageBuiltModule = {
  page: () => Promise.resolve(RedirectComponentInstance),
  onRequest: (_, next) => next(),
  renderers: []
};
var dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
var levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
__name(log, "log");
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
__name(isLogLevelEnabled, "isLogLevelEnabled");
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
__name(info, "info");
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
__name(warn, "warn");
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
__name(error, "error");
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
__name(debug, "debug");
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return red(prefix.join(" "));
  }
  if (level === "warn") {
    return yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return dim(prefix[0]);
  }
  return dim(prefix[0]) + " " + blue(prefix.splice(1).join(" "));
}
__name(getEventPrefix, "getEventPrefix");
var Logger = class {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
};
__name(Logger, "Logger");
var AstroIntegrationLogger = class {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
};
__name(AstroIntegrationLogger, "AstroIntegrationLogger");
var consoleLogDestination = {
  write(event) {
    let dest = console.error;
    if (levels[event.level] < levels["error"]) {
      dest = console.log;
    }
    if (event.label === "SKIP_FORMAT") {
      dest(event.message);
    } else {
      dest(getEventPrefix(event) + " " + event.message);
    }
    return true;
  }
};
function getAssetsPrefix(fileExtension2, assetsPrefix) {
  if (!assetsPrefix)
    return "";
  if (typeof assetsPrefix === "string")
    return assetsPrefix;
  const dotLessFileExtension = fileExtension2.slice(1);
  if (assetsPrefix[dotLessFileExtension]) {
    return assetsPrefix[dotLessFileExtension];
  }
  return assetsPrefix.fallback;
}
__name(getAssetsPrefix, "getAssetsPrefix");
function createAssetLink(href, base, assetsPrefix) {
  if (assetsPrefix) {
    const pf = getAssetsPrefix(fileExtension(href), assetsPrefix);
    return joinPaths(pf, slash(href));
  } else if (base) {
    return prependForwardSlash(joinPaths(base, slash(href)));
  } else {
    return href;
  }
}
__name(createAssetLink, "createAssetLink");
function createStylesheetElement(stylesheet, base, assetsPrefix) {
  if (stylesheet.type === "inline") {
    return {
      props: {},
      children: stylesheet.content
    };
  } else {
    return {
      props: {
        rel: "stylesheet",
        href: createAssetLink(stylesheet.src, base, assetsPrefix)
      },
      children: ""
    };
  }
}
__name(createStylesheetElement, "createStylesheetElement");
function createStylesheetElementSet(stylesheets, base, assetsPrefix) {
  return new Set(stylesheets.map((s) => createStylesheetElement(s, base, assetsPrefix)));
}
__name(createStylesheetElementSet, "createStylesheetElementSet");
function createModuleScriptElement(script, base, assetsPrefix) {
  if (script.type === "external") {
    return createModuleScriptElementWithSrc(script.value, base, assetsPrefix);
  } else {
    return {
      props: {
        type: "module"
      },
      children: script.value
    };
  }
}
__name(createModuleScriptElement, "createModuleScriptElement");
function createModuleScriptElementWithSrc(src, base, assetsPrefix) {
  return {
    props: {
      type: "module",
      src: createAssetLink(src, base, assetsPrefix)
    },
    children: ""
  };
}
__name(createModuleScriptElementWithSrc, "createModuleScriptElementWithSrc");
var AppPipeline = class extends Pipeline {
  #manifestData;
  static create(manifestData, {
    logger,
    manifest: manifest2,
    mode,
    renderers: renderers2,
    resolve,
    serverLike,
    streaming,
    defaultRoutes
  }) {
    const pipeline = new AppPipeline(
      logger,
      manifest2,
      mode,
      renderers2,
      resolve,
      serverLike,
      streaming,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      defaultRoutes
    );
    pipeline.#manifestData = manifestData;
    return pipeline;
  }
  headElements(routeData) {
    const routeInfo = this.manifest.routes.find((route) => route.routeData === routeData);
    const links = /* @__PURE__ */ new Set();
    const scripts = /* @__PURE__ */ new Set();
    const styles = createStylesheetElementSet(routeInfo?.styles ?? []);
    for (const script of routeInfo?.scripts ?? []) {
      if ("stage" in script) {
        if (script.stage === "head-inline") {
          scripts.add({
            props: {},
            children: script.children
          });
        }
      } else {
        scripts.add(createModuleScriptElement(script));
      }
    }
    return { links, styles, scripts };
  }
  componentMetadata() {
  }
  async getComponentByRoute(routeData) {
    const module = await this.getModuleForRoute(routeData);
    return module.page();
  }
  async tryRewrite(payload, request) {
    const { newUrl, pathname, routeData } = findRouteToRewrite({
      payload,
      request,
      routes: this.manifest?.routes.map((r) => r.routeData),
      trailingSlash: this.manifest.trailingSlash,
      buildFormat: this.manifest.buildFormat,
      base: this.manifest.base
    });
    const componentInstance = await this.getComponentByRoute(routeData);
    return { newUrl, pathname, componentInstance, routeData };
  }
  async getModuleForRoute(route) {
    for (const defaultRoute of this.defaultRoutes) {
      if (route.component === defaultRoute.component) {
        return {
          page: () => Promise.resolve(defaultRoute.instance),
          renderers: []
        };
      }
    }
    if (route.type === "redirect") {
      return RedirectSinglePageBuiltModule;
    } else {
      if (this.manifest.pageMap) {
        const importComponentInstance = this.manifest.pageMap.get(route.component);
        if (!importComponentInstance) {
          throw new Error(
            `Unexpectedly unable to find a component instance for route ${route.route}`
          );
        }
        return await importComponentInstance();
      } else if (this.manifest.pageModule) {
        return this.manifest.pageModule;
      }
      throw new Error(
        "Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error, please file an issue."
      );
    }
  }
};
__name(AppPipeline, "AppPipeline");
var _manifest, _manifestData, _logger, _baseWithoutTrailingSlash, _pipeline, _adapterLogger, _renderOptionsDeprecationWarningShown, _createPipeline, createPipeline_fn, _getPathnameFromRequest, getPathnameFromRequest_fn, _computePathnameFromDomain, computePathnameFromDomain_fn, _logRenderOptionsDeprecationWarning, logRenderOptionsDeprecationWarning_fn, _renderError, renderError_fn, _mergeResponses, mergeResponses_fn, _getDefaultStatusCode, getDefaultStatusCode_fn;
var _App = class {
  constructor(manifest2, streaming = true) {
    /**
     * Creates a pipeline by reading the stored manifest
     *
     * @param manifestData
     * @param streaming
     * @private
     */
    __privateAdd(this, _createPipeline);
    __privateAdd(this, _getPathnameFromRequest);
    __privateAdd(this, _computePathnameFromDomain);
    __privateAdd(this, _logRenderOptionsDeprecationWarning);
    /**
     * If it is a known error code, try sending the according page (e.g. 404.astro / 500.astro).
     * This also handles pre-rendered /404 or /500 routes
     */
    __privateAdd(this, _renderError);
    __privateAdd(this, _mergeResponses);
    __privateAdd(this, _getDefaultStatusCode);
    __privateAdd(this, _manifest, void 0);
    __privateAdd(this, _manifestData, void 0);
    __privateAdd(this, _logger, new Logger({
      dest: consoleLogDestination,
      level: "info"
    }));
    __privateAdd(this, _baseWithoutTrailingSlash, void 0);
    __privateAdd(this, _pipeline, void 0);
    __privateAdd(this, _adapterLogger, void 0);
    __privateAdd(this, _renderOptionsDeprecationWarningShown, false);
    __privateSet(this, _manifest, manifest2);
    __privateSet(this, _manifestData, injectDefaultRoutes(manifest2, {
      routes: manifest2.routes.map((route) => route.routeData)
    }));
    __privateSet(this, _baseWithoutTrailingSlash, removeTrailingForwardSlash(__privateGet(this, _manifest).base));
    __privateSet(this, _pipeline, __privateMethod(this, _createPipeline, createPipeline_fn).call(this, __privateGet(this, _manifestData), streaming));
    __privateSet(this, _adapterLogger, new AstroIntegrationLogger(
      __privateGet(this, _logger).options,
      __privateGet(this, _manifest).adapterName
    ));
  }
  getAdapterLogger() {
    return __privateGet(this, _adapterLogger);
  }
  set setManifestData(newManifestData) {
    __privateSet(this, _manifestData, newManifestData);
  }
  removeBase(pathname) {
    if (pathname.startsWith(__privateGet(this, _manifest).base)) {
      return pathname.slice(__privateGet(this, _baseWithoutTrailingSlash).length + 1);
    }
    return pathname;
  }
  match(request) {
    const url = new URL(request.url);
    if (__privateGet(this, _manifest).assets.has(url.pathname))
      return void 0;
    let pathname = __privateMethod(this, _computePathnameFromDomain, computePathnameFromDomain_fn).call(this, request);
    if (!pathname) {
      pathname = prependForwardSlash(this.removeBase(url.pathname));
    }
    let routeData = matchRoute(pathname, __privateGet(this, _manifestData));
    if (!routeData || routeData.prerender)
      return void 0;
    return routeData;
  }
  async render(request, routeDataOrOptions, maybeLocals) {
    let routeData;
    let locals;
    let clientAddress;
    let addCookieHeader;
    if (routeDataOrOptions && ("addCookieHeader" in routeDataOrOptions || "clientAddress" in routeDataOrOptions || "locals" in routeDataOrOptions || "routeData" in routeDataOrOptions)) {
      if ("addCookieHeader" in routeDataOrOptions) {
        addCookieHeader = routeDataOrOptions.addCookieHeader;
      }
      if ("clientAddress" in routeDataOrOptions) {
        clientAddress = routeDataOrOptions.clientAddress;
      }
      if ("routeData" in routeDataOrOptions) {
        routeData = routeDataOrOptions.routeData;
      }
      if ("locals" in routeDataOrOptions) {
        locals = routeDataOrOptions.locals;
      }
    } else {
      routeData = routeDataOrOptions;
      locals = maybeLocals;
      if (routeDataOrOptions || locals) {
        __privateMethod(this, _logRenderOptionsDeprecationWarning, logRenderOptionsDeprecationWarning_fn).call(this);
      }
    }
    if (routeData) {
      __privateGet(this, _logger).debug(
        "router",
        "The adapter " + __privateGet(this, _manifest).adapterName + " provided a custom RouteData for ",
        request.url
      );
      __privateGet(this, _logger).debug("router", "RouteData:\n" + routeData);
    }
    if (locals) {
      if (typeof locals !== "object") {
        const error2 = new AstroError(LocalsNotAnObject);
        __privateGet(this, _logger).error(null, error2.stack);
        return __privateMethod(this, _renderError, renderError_fn).call(this, request, { status: 500, error: error2 });
      }
      Reflect.set(request, clientLocalsSymbol, locals);
    }
    if (clientAddress) {
      Reflect.set(request, clientAddressSymbol, clientAddress);
    }
    if (!routeData) {
      routeData = this.match(request);
      __privateGet(this, _logger).debug("router", "Astro matched the following route for " + request.url);
      __privateGet(this, _logger).debug("router", "RouteData:\n" + routeData);
    }
    if (!routeData) {
      __privateGet(this, _logger).debug("router", "Astro hasn't found routes that match " + request.url);
      __privateGet(this, _logger).debug("router", "Here's the available routes:\n", __privateGet(this, _manifestData));
      return __privateMethod(this, _renderError, renderError_fn).call(this, request, { locals, status: 404 });
    }
    const pathname = __privateMethod(this, _getPathnameFromRequest, getPathnameFromRequest_fn).call(this, request);
    const defaultStatus = __privateMethod(this, _getDefaultStatusCode, getDefaultStatusCode_fn).call(this, routeData, pathname);
    let response;
    try {
      const mod = await __privateGet(this, _pipeline).getModuleForRoute(routeData);
      const renderContext = await RenderContext.create({
        pipeline: __privateGet(this, _pipeline),
        locals,
        pathname,
        request,
        routeData,
        status: defaultStatus
      });
      response = await renderContext.render(await mod.page());
    } catch (err) {
      __privateGet(this, _logger).error(null, err.stack || err.message || String(err));
      return __privateMethod(this, _renderError, renderError_fn).call(this, request, { locals, status: 500, error: err });
    }
    if (REROUTABLE_STATUS_CODES.includes(response.status) && response.headers.get(REROUTE_DIRECTIVE_HEADER) !== "no") {
      return __privateMethod(this, _renderError, renderError_fn).call(this, request, {
        locals,
        response,
        status: response.status,
        // We don't have an error to report here. Passing null means we pass nothing intentionally
        // while undefined means there's no error
        error: response.status === 500 ? null : void 0
      });
    }
    if (response.headers.has(REROUTE_DIRECTIVE_HEADER)) {
      response.headers.delete(REROUTE_DIRECTIVE_HEADER);
    }
    if (addCookieHeader) {
      for (const setCookieHeaderValue of _App.getSetCookieFromResponse(response)) {
        response.headers.append("set-cookie", setCookieHeaderValue);
      }
    }
    Reflect.set(response, responseSentSymbol, true);
    return response;
  }
  setCookieHeaders(response) {
    return getSetCookiesFromResponse(response);
  }
};
var App = _App;
__name(App, "App");
_manifest = new WeakMap();
_manifestData = new WeakMap();
_logger = new WeakMap();
_baseWithoutTrailingSlash = new WeakMap();
_pipeline = new WeakMap();
_adapterLogger = new WeakMap();
_renderOptionsDeprecationWarningShown = new WeakMap();
_createPipeline = new WeakSet();
createPipeline_fn = /* @__PURE__ */ __name(function(manifestData, streaming = false) {
  return AppPipeline.create(manifestData, {
    logger: __privateGet(this, _logger),
    manifest: __privateGet(this, _manifest),
    mode: "production",
    renderers: __privateGet(this, _manifest).renderers,
    defaultRoutes: createDefaultRoutes(__privateGet(this, _manifest)),
    resolve: async (specifier) => {
      if (!(specifier in __privateGet(this, _manifest).entryModules)) {
        throw new Error(`Unable to resolve [${specifier}]`);
      }
      const bundlePath = __privateGet(this, _manifest).entryModules[specifier];
      if (bundlePath.startsWith("data:") || bundlePath.length === 0) {
        return bundlePath;
      } else {
        return createAssetLink(bundlePath, __privateGet(this, _manifest).base, __privateGet(this, _manifest).assetsPrefix);
      }
    },
    serverLike: true,
    streaming
  });
}, "#createPipeline");
_getPathnameFromRequest = new WeakSet();
getPathnameFromRequest_fn = /* @__PURE__ */ __name(function(request) {
  const url = new URL(request.url);
  const pathname = prependForwardSlash(this.removeBase(url.pathname));
  return pathname;
}, "#getPathnameFromRequest");
_computePathnameFromDomain = new WeakSet();
computePathnameFromDomain_fn = /* @__PURE__ */ __name(function(request) {
  let pathname = void 0;
  const url = new URL(request.url);
  if (__privateGet(this, _manifest).i18n && (__privateGet(this, _manifest).i18n.strategy === "domains-prefix-always" || __privateGet(this, _manifest).i18n.strategy === "domains-prefix-other-locales" || __privateGet(this, _manifest).i18n.strategy === "domains-prefix-always-no-redirect")) {
    let host = request.headers.get("X-Forwarded-Host");
    let protocol = request.headers.get("X-Forwarded-Proto");
    if (protocol) {
      protocol = protocol + ":";
    } else {
      protocol = url.protocol;
    }
    if (!host) {
      host = request.headers.get("Host");
    }
    if (host && protocol) {
      host = host.split(":")[0];
      try {
        let locale;
        const hostAsUrl = new URL(`${protocol}//${host}`);
        for (const [domainKey, localeValue] of Object.entries(
          __privateGet(this, _manifest).i18n.domainLookupTable
        )) {
          const domainKeyAsUrl = new URL(domainKey);
          if (hostAsUrl.host === domainKeyAsUrl.host && hostAsUrl.protocol === domainKeyAsUrl.protocol) {
            locale = localeValue;
            break;
          }
        }
        if (locale) {
          pathname = prependForwardSlash(
            joinPaths(normalizeTheLocale(locale), this.removeBase(url.pathname))
          );
          if (url.pathname.endsWith("/")) {
            pathname = appendForwardSlash(pathname);
          }
        }
      } catch (e) {
        __privateGet(this, _logger).error(
          "router",
          `Astro tried to parse ${protocol}//${host} as an URL, but it threw a parsing error. Check the X-Forwarded-Host and X-Forwarded-Proto headers.`
        );
        __privateGet(this, _logger).error("router", `Error: ${e}`);
      }
    }
  }
  return pathname;
}, "#computePathnameFromDomain");
_logRenderOptionsDeprecationWarning = new WeakSet();
logRenderOptionsDeprecationWarning_fn = /* @__PURE__ */ __name(function() {
  if (__privateGet(this, _renderOptionsDeprecationWarningShown))
    return;
  __privateGet(this, _logger).warn(
    "deprecated",
    `The adapter ${__privateGet(this, _manifest).adapterName} is using a deprecated signature of the 'app.render()' method. From Astro 4.0, locals and routeData are provided as properties on an optional object to this method. Using the old signature will cause an error in Astro 5.0. See https://github.com/withastro/astro/pull/9199 for more information.`
  );
  __privateSet(this, _renderOptionsDeprecationWarningShown, true);
}, "#logRenderOptionsDeprecationWarning");
_renderError = new WeakSet();
renderError_fn = /* @__PURE__ */ __name(async function(request, {
  locals,
  status,
  response: originalResponse,
  skipMiddleware = false,
  error: error2
}) {
  const errorRoutePath = `/${status}${__privateGet(this, _manifest).trailingSlash === "always" ? "/" : ""}`;
  const errorRouteData = matchRoute(errorRoutePath, __privateGet(this, _manifestData));
  const url = new URL(request.url);
  if (errorRouteData) {
    if (errorRouteData.prerender) {
      const maybeDotHtml = errorRouteData.route.endsWith(`/${status}`) ? ".html" : "";
      const statusURL = new URL(
        `${__privateGet(this, _baseWithoutTrailingSlash)}/${status}${maybeDotHtml}`,
        url
      );
      if (statusURL.toString() !== request.url) {
        const response2 = await fetch(statusURL.toString());
        const override = { status };
        return __privateMethod(this, _mergeResponses, mergeResponses_fn).call(this, response2, originalResponse, override);
      }
    }
    const mod = await __privateGet(this, _pipeline).getModuleForRoute(errorRouteData);
    try {
      const renderContext = await RenderContext.create({
        locals,
        pipeline: __privateGet(this, _pipeline),
        middleware: skipMiddleware ? NOOP_MIDDLEWARE_FN : void 0,
        pathname: __privateMethod(this, _getPathnameFromRequest, getPathnameFromRequest_fn).call(this, request),
        request,
        routeData: errorRouteData,
        status,
        props: { error: error2 }
      });
      const response2 = await renderContext.render(await mod.page());
      return __privateMethod(this, _mergeResponses, mergeResponses_fn).call(this, response2, originalResponse);
    } catch {
      if (skipMiddleware === false) {
        return __privateMethod(this, _renderError, renderError_fn).call(this, request, {
          locals,
          status,
          response: originalResponse,
          skipMiddleware: true
        });
      }
    }
  }
  const response = __privateMethod(this, _mergeResponses, mergeResponses_fn).call(this, new Response(null, { status }), originalResponse);
  Reflect.set(response, responseSentSymbol, true);
  return response;
}, "#renderError");
_mergeResponses = new WeakSet();
mergeResponses_fn = /* @__PURE__ */ __name(function(newResponse, originalResponse, override) {
  if (!originalResponse) {
    if (override !== void 0) {
      return new Response(newResponse.body, {
        status: override.status,
        statusText: newResponse.statusText,
        headers: newResponse.headers
      });
    }
    return newResponse;
  }
  const status = override?.status ? override.status : originalResponse.status === 200 ? newResponse.status : originalResponse.status;
  try {
    originalResponse.headers.delete("Content-type");
  } catch {
  }
  return new Response(newResponse.body, {
    status,
    statusText: status === 200 ? newResponse.statusText : originalResponse.statusText,
    // If you're looking at here for possible bugs, it means that it's not a bug.
    // With the middleware, users can meddle with headers, and we should pass to the 404/500.
    // If users see something weird, it's because they are setting some headers they should not.
    //
    // Although, we don't want it to replace the content-type, because the error page must return `text/html`
    headers: new Headers([
      ...Array.from(newResponse.headers),
      ...Array.from(originalResponse.headers)
    ])
  });
}, "#mergeResponses");
_getDefaultStatusCode = new WeakSet();
getDefaultStatusCode_fn = /* @__PURE__ */ __name(function(routeData, pathname) {
  if (!routeData.pattern.test(pathname)) {
    for (const fallbackRoute of routeData.fallbackRoutes) {
      if (fallbackRoute.pattern.test(pathname)) {
        return 302;
      }
    }
  }
  const route = removeTrailingForwardSlash(routeData.route);
  if (route.endsWith("/404"))
    return 404;
  if (route.endsWith("/500"))
    return 500;
  return 200;
}, "#getDefaultStatusCode");
/**
 * Reads all the cookies written by `Astro.cookie.set()` onto the passed response.
 * For example,
 * ```ts
 * for (const cookie_ of App.getSetCookieFromResponse(response)) {
 *     const cookie: string = cookie_
 * }
 * ```
 * @param response The response to read cookies from.
 * @returns An iterator that yields key-value pairs as equal-sign-separated strings.
 */
__publicField(App, "getSetCookieFromResponse", getSetCookiesFromResponse);
function createExports(manifest2) {
  const app = new App(manifest2);
  const fetch2 = /* @__PURE__ */ __name(async (request, env, context) => {
    const { pathname } = new URL(request.url);
    if (manifest2.assets.has(pathname)) {
      return env.ASSETS.fetch(request.url.replace(/\.html$/, ""));
    }
    const routeData = app.match(request);
    if (!routeData) {
      const asset = await env.ASSETS.fetch(request.url.replace(/index.html$/, "").replace(/\.html$/, ""));
      if (asset.status !== 404) {
        return asset;
      }
    }
    Reflect.set(request, Symbol.for("astro.clientAddress"), request.headers.get("cf-connecting-ip"));
    process.env.ASTRO_STUDIO_APP_TOKEN ??= (() => {
      if (typeof env.ASTRO_STUDIO_APP_TOKEN === "string") {
        return env.ASTRO_STUDIO_APP_TOKEN;
      }
    })();
    const locals = {
      runtime: {
        env,
        cf: request.cf,
        caches,
        ctx: {
          waitUntil: (promise) => context.waitUntil(promise),
          // Currently not available: https://developers.cloudflare.com/pages/platform/known-issues/#pages-functions
          passThroughOnException: () => {
            throw new Error("`passThroughOnException` is currently not available in Cloudflare Pages. See https://developers.cloudflare.com/pages/platform/known-issues/#pages-functions.");
          }
        }
      }
    };
    const response = await app.render(request, { routeData, locals });
    if (app.setCookieHeaders) {
      for (const setCookieHeader of app.setCookieHeaders(response)) {
        response.headers.append("Set-Cookie", setCookieHeader);
      }
    }
    return response;
  }, "fetch");
  return { default: { fetch: fetch2 } };
}
__name(createExports, "createExports");

// _worker.js/manifest_BXd5hZ_V.mjs
import { g as decodeKey } from "./chunks/astro/server_CgTYz_Tl.mjs";
import "./chunks/astro-designed-error-pages_DfD573yd.mjs";
import { N as NOOP_MIDDLEWARE_FN2 } from "./chunks/noop-middleware_Chs5f3j2.mjs";
globalThis.process ??= {};
globalThis.process.env ??= {};
function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
__name(sanitizeParams, "sanitizeParams");
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
__name(getParameter, "getParameter");
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
__name(getSegment, "getSegment");
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}
__name(getRouteGenerator, "getRouteGenerator");
function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}
__name(deserializeRouteData, "deserializeRouteData");
function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN2 };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}
__name(deserializeManifest, "deserializeManifest");
var manifest = deserializeManifest({ "hrefRoot": "file:///C:/Users/berto/Documents/Ombreeluci/", "adapterName": "@astrojs/cloudflare", "routes": [{ "file": "404.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/404", "isIndex": false, "type": "page", "pattern": "^\\/404\\/?$", "segments": [[{ "content": "404", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/404.astro", "pathname": "/404", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "archivio/web-only/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/archivio/web-only", "isIndex": false, "type": "page", "pattern": "^\\/archivio\\/web-only\\/?$", "segments": [[{ "content": "archivio", "dynamic": false, "spread": false }], [{ "content": "web-only", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/archivio/web-only.astro", "pathname": "/archivio/web-only", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "archivio/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/archivio", "isIndex": true, "type": "page", "pattern": "^\\/archivio\\/?$", "segments": [[{ "content": "archivio", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/archivio/index.astro", "pathname": "/archivio", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "autori/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/autori", "isIndex": true, "type": "page", "pattern": "^\\/autori\\/?$", "segments": [[{ "content": "autori", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/autori/index.astro", "pathname": "/autori", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "blog/en/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/blog/en", "isIndex": false, "type": "page", "pattern": "^\\/blog\\/en\\/?$", "segments": [[{ "content": "blog", "dynamic": false, "spread": false }], [{ "content": "en", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/blog/en.astro", "pathname": "/blog/en", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "cerca/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/cerca", "isIndex": false, "type": "page", "pattern": "^\\/cerca\\/?$", "segments": [[{ "content": "cerca", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/cerca.astro", "pathname": "/cerca", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/collaboratori/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/collaboratori", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/collaboratori\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "collaboratori", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/collaboratori.astro", "pathname": "/chi-siamo/collaboratori", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/contatti/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/contatti", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/contatti\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "contatti", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/contatti.astro", "pathname": "/chi-siamo/contatti", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/hanno-scritto-per-noi/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/hanno-scritto-per-noi", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/hanno-scritto-per-noi\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "hanno-scritto-per-noi", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/hanno-scritto-per-noi.astro", "pathname": "/chi-siamo/hanno-scritto-per-noi", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/la-redazione/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/la-redazione", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/la-redazione\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-redazione", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/la-redazione.astro", "pathname": "/chi-siamo/la-redazione", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/la-rivista/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/la-rivista", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/la-rivista\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-rivista", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/la-rivista.astro", "pathname": "/chi-siamo/la-rivista", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/redazione-storica/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo/redazione-storica", "isIndex": false, "type": "page", "pattern": "^\\/chi-siamo\\/redazione-storica\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "redazione-storica", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/redazione-storica.astro", "pathname": "/chi-siamo/redazione-storica", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "chi-siamo/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chi-siamo", "isIndex": true, "type": "page", "pattern": "^\\/chi-siamo\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/index.astro", "pathname": "/chi-siamo", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "debug/audit-editoriale/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/debug/audit-editoriale", "isIndex": false, "type": "page", "pattern": "^\\/debug\\/audit-editoriale\\/?$", "segments": [[{ "content": "debug", "dynamic": false, "spread": false }], [{ "content": "audit-editoriale", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/debug/audit-editoriale.astro", "pathname": "/debug/audit-editoriale", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "sezioni/dialogo-aperto/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/sezioni/dialogo-aperto", "isIndex": false, "type": "page", "pattern": "^\\/sezioni\\/dialogo-aperto\\/?$", "segments": [[{ "content": "sezioni", "dynamic": false, "spread": false }], [{ "content": "dialogo-aperto", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sezioni/dialogo-aperto.astro", "pathname": "/sezioni/dialogo-aperto", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "sezioni/diari/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/sezioni/diari", "isIndex": false, "type": "page", "pattern": "^\\/sezioni\\/diari\\/?$", "segments": [[{ "content": "sezioni", "dynamic": false, "spread": false }], [{ "content": "diari", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sezioni/diari.astro", "pathname": "/sezioni/diari", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "sostienici/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/sostienici", "isIndex": false, "type": "page", "pattern": "^\\/sostienici\\/?$", "segments": [[{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sostienici.astro", "pathname": "/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-lista/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-lista", "isIndex": false, "type": "page", "pattern": "^\\/test-lista\\/?$", "segments": [[{ "content": "test-lista", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-lista.astro", "pathname": "/test-lista", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-minimal/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-minimal", "isIndex": false, "type": "page", "pattern": "^\\/test-minimal\\/?$", "segments": [[{ "content": "test-minimal", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-minimal.astro", "pathname": "/test-minimal", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-no-articles/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-no-articles", "isIndex": false, "type": "page", "pattern": "^\\/test-no-articles\\/?$", "segments": [[{ "content": "test-no-articles", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-no-articles.astro", "pathname": "/test-no-articles", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "test-status/index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/test-status", "isIndex": false, "type": "page", "pattern": "^\\/test-status\\/?$", "segments": [[{ "content": "test-status", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/test-status.astro", "pathname": "/test-status", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "index.html", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/", "isIndex": true, "type": "page", "pattern": "^\\/$", "segments": [], "params": [], "component": "src/pages/index.astro", "pathname": "/", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "endpoint", "isIndex": false, "route": "/_image", "pattern": "^\\/_image$", "segments": [[{ "content": "_image", "dynamic": false, "spread": false }]], "params": [], "component": "node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", "pathname": "/_image", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/debug-blog", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/debug-blog\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "debug-blog", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/debug-blog.ts", "pathname": "/api/debug-blog", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/debug-ssr-minimal", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/debug-ssr-minimal\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "debug-ssr-minimal", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/debug-ssr-minimal.ts", "pathname": "/api/debug-ssr-minimal", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/revalidate", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/revalidate\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "revalidate", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/revalidate.ts", "pathname": "/api/revalidate", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [{ "type": "external", "value": "/_astro/hoisted.CIErU2gF.js" }], "styles": [{ "type": "external", "src": "/_astro/_slug_.Bvtt_j-y.css" }, { "type": "external", "src": "/_astro/_diario_.DVQXp8w2.css" }, { "type": "inline", "content": ".astro-route-announcer{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}\n.article-card[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;gap:4px}.article-card--horizontal[data-astro-cid-di2nlc57],.article-card--horizontal[data-astro-cid-di2nlc57] .article-link[data-astro-cid-di2nlc57]{flex-direction:row;gap:1rem;align-items:flex-start}.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:140px;min-width:140px;aspect-ratio:4/3;margin-bottom:0}.article-card--horizontal[data-astro-cid-di2nlc57] .article-title[data-astro-cid-di2nlc57]{font-size:1rem;-webkit-line-clamp:3}.article-card--horizontal[data-astro-cid-di2nlc57] .author-row[data-astro-cid-di2nlc57]{font-size:.8125rem;white-space:normal;flex-wrap:wrap}@media (max-width: 480px){.article-card--horizontal[data-astro-cid-di2nlc57] .article-image-wrap[data-astro-cid-di2nlc57]{width:100px;min-width:100px}}.article-link[data-astro-cid-di2nlc57]{display:flex;flex-direction:column;width:100%;text-decoration:none;color:inherit;align-items:flex-start}.article-image-wrap[data-astro-cid-di2nlc57]{width:100%;aspect-ratio:16/9;flex-shrink:0;overflow:hidden;border-radius:8px;margin-bottom:1rem}.article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{width:100%;height:auto;min-height:120px;object-fit:cover;display:block;transition:transform .35s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-image-wrap[data-astro-cid-di2nlc57] img[data-astro-cid-di2nlc57]{transform:scale(1.03)}@media (max-width: 480px){.author-row[data-astro-cid-di2nlc57]{white-space:normal;flex-wrap:wrap}}.article-meta[data-astro-cid-di2nlc57]{width:100%;margin:0}.article-badge[data-astro-cid-di2nlc57]{margin:0 0 4px;color:var(--accent-color);font-family:Raleway,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.03em}.article-badge-muted[data-astro-cid-di2nlc57]{color:var(--text-secondary);background:#0000000d;padding:.25rem .5rem;border-radius:6px;width:fit-content;text-transform:none}.article-badge-text[data-astro-cid-di2nlc57]{display:inline}.article-title[data-astro-cid-di2nlc57]{margin:4px 0;font-family:Raleway,sans-serif;font-weight:700;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--text-color);font-size:1.25rem;transition:color .2s ease}.article-link[data-astro-cid-di2nlc57]:hover .article-title[data-astro-cid-di2nlc57]{color:var(--accent-color)}.author-row[data-astro-cid-di2nlc57]{display:flex;align-items:center;gap:4px;margin:0;font-size:.9rem;color:var(--text-secondary);white-space:nowrap}.author-link[data-astro-cid-di2nlc57]{color:var(--accent-color);text-decoration:none;font-weight:600;display:inline}.article-sottotitolo[data-astro-cid-di2nlc57]{font-size:.875rem;line-height:1.5;color:var(--text-secondary);margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.author-row--inline[data-astro-cid-di2nlc57]{margin-top:.5rem;font-size:.8125rem;color:var(--text-secondary);white-space:normal;flex-wrap:wrap}.author-avatar[data-astro-cid-di2nlc57]{width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0}\n" }], "routeData": { "route": "/blog/[...slug]", "isIndex": false, "type": "page", "pattern": "^\\/blog(?:\\/(.*?))?\\/?$", "segments": [[{ "content": "blog", "dynamic": false, "spread": false }], [{ "content": "...slug", "dynamic": true, "spread": true }]], "params": ["...slug"], "component": "src/pages/blog/[...slug].astro", "prerender": false, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/about", "pattern": "^\\/about\\/?$", "segments": [[{ "content": "about", "dynamic": false, "spread": false }]], "params": [], "component": "/about", "pathname": "/about", "prerender": false, "redirect": "/chi-siamo", "redirectRoute": { "route": "/chi-siamo", "isIndex": true, "type": "page", "pattern": "^\\/chi-siamo\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chi-siamo/index.astro", "pathname": "/chi-siamo", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/collaboratori", "pattern": "^\\/chi-siamo\\/collaboratori\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "collaboratori", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/collaboratori", "pathname": "/chi-siamo/collaboratori", "prerender": false, "redirect": "/chi-siamo#collaboratori", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/contatti", "pattern": "^\\/chi-siamo\\/contatti\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "contatti", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/contatti", "pathname": "/chi-siamo/contatti", "prerender": false, "redirect": "/chi-siamo#contatti", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/hanno-scritto-per-noi", "pattern": "^\\/chi-siamo\\/hanno-scritto-per-noi\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "hanno-scritto-per-noi", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/hanno-scritto-per-noi", "pathname": "/chi-siamo/hanno-scritto-per-noi", "prerender": false, "redirect": "/chi-siamo#hanno-scritto-per-noi", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/la-redazione", "pattern": "^\\/chi-siamo\\/la-redazione\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-redazione", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/la-redazione", "pathname": "/chi-siamo/la-redazione", "prerender": false, "redirect": "/chi-siamo#la-redazione", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/la-rivista", "pattern": "^\\/chi-siamo\\/la-rivista\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "la-rivista", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/la-rivista", "pathname": "/chi-siamo/la-rivista", "prerender": false, "redirect": "/chi-siamo#la-rivista", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/chi-siamo/redazione-storica", "pattern": "^\\/chi-siamo\\/redazione-storica\\/?$", "segments": [[{ "content": "chi-siamo", "dynamic": false, "spread": false }], [{ "content": "redazione-storica", "dynamic": false, "spread": false }]], "params": [], "component": "/chi-siamo/redazione-storica", "pathname": "/chi-siamo/redazione-storica", "prerender": false, "redirect": "/chi-siamo#redazione-storica", "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/contribuisci", "pattern": "^\\/contribuisci\\/?$", "segments": [[{ "content": "contribuisci", "dynamic": false, "spread": false }]], "params": [], "component": "/contribuisci", "pathname": "/contribuisci", "prerender": false, "redirect": "/sostienici", "redirectRoute": { "route": "/sostienici", "isIndex": false, "type": "page", "pattern": "^\\/sostienici\\/?$", "segments": [[{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sostienici.astro", "pathname": "/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "redirect", "isIndex": false, "route": "/dona", "pattern": "^\\/dona\\/?$", "segments": [[{ "content": "dona", "dynamic": false, "spread": false }]], "params": [], "component": "/dona", "pathname": "/dona", "prerender": false, "redirect": "/sostienici", "redirectRoute": { "route": "/sostienici", "isIndex": false, "type": "page", "pattern": "^\\/sostienici\\/?$", "segments": [[{ "content": "sostienici", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sostienici.astro", "pathname": "/sostienici", "prerender": true, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } }, "fallbackRoutes": [], "_meta": { "trailingSlash": "ignore" } } }], "base": "/", "trailingSlash": "ignore", "compressHTML": true, "componentMetadata": [["C:/Users/berto/Documents/Ombreeluci/src/pages/debug/audit-editoriale.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-lista.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-minimal.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-no-articles.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/test-status.astro", { "propagation": "none", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/[diario].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/404.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/[issue].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/archivio/web-only.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/autori/[slug].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/autori/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/blog/[...slug].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/blog/en.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/categoria/[categoria].astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/cerca.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/collaboratori.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/contatti.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/hanno-scritto-per-noi.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/la-redazione.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/la-rivista.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/chi-siamo/redazione-storica.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/index.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/sezioni/dialogo-aperto.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/sezioni/diari.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/pages/sostienici.astro", { "propagation": "in-tree", "containsHead": true }], ["C:/Users/berto/Documents/Ombreeluci/src/components/Header.astro", { "propagation": "in-tree", "containsHead": false }], ["C:/Users/berto/Documents/Ombreeluci/src/layouts/BaseLayout.astro", { "propagation": "in-tree", "containsHead": false }], ["C:/Users/berto/Documents/Ombreeluci/src/layouts/DiarioLayout.astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/[diario]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astrojs-ssr-virtual-entry", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/404@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/archivio/[issue]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/archivio/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/archivio/web-only@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/autori/[slug]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/autori/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/blog/[...slug]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/blog/en@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/categoria/[categoria]@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/cerca@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/collaboratori@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/contatti@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/hanno-scritto-per-noi@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/la-redazione@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/la-rivista@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/chi-siamo/redazione-storica@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/index@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/sezioni/dialogo-aperto@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/sezioni/diari@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/sostienici@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/debug/audit-editoriale@_@astro", { "propagation": "in-tree", "containsHead": false }], ["\0@astro-page:src/pages/test-lista@_@astro", { "propagation": "in-tree", "containsHead": false }]], "renderers": [], "clientDirectives": [["idle", '(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value=="object"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};"requestIdleCallback"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event("astro:idle"));})();'], ["load", '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event("astro:load"));})();'], ["media", '(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener("change",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event("astro:media"));})();'], ["only", '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event("astro:only"));})();'], ["visible", '(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value=="object"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event("astro:visible"));})();']], "entryModules": { "\0@astro-renderers": "renderers.mjs", "\0@astrojs-ssr-virtual-entry": "index.js", "\0@astro-page:node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint@_@js": "pages/_image.astro.mjs", "\0@astro-page:src/pages/404@_@astro": "pages/404.astro.mjs", "\0@astro-page:src/pages/api/debug-blog@_@ts": "pages/api/debug-blog.astro.mjs", "\0@astro-page:src/pages/api/debug-ssr-minimal@_@ts": "pages/api/debug-ssr-minimal.astro.mjs", "\0@astro-page:src/pages/api/revalidate@_@ts": "pages/api/revalidate.astro.mjs", "\0@astro-page:src/pages/archivio/web-only@_@astro": "pages/archivio/web-only.astro.mjs", "\0@astro-page:src/pages/archivio/index@_@astro": "pages/archivio.astro.mjs", "\0@astro-page:src/pages/autori/[slug]@_@astro": "pages/autori/_slug_.astro.mjs", "\0@astro-page:src/pages/autori/index@_@astro": "pages/autori.astro.mjs", "\0@astro-page:src/pages/blog/en@_@astro": "pages/blog/en.astro.mjs", "\0@astro-page:src/pages/categoria/[categoria]@_@astro": "pages/categoria/_categoria_.astro.mjs", "\0@astro-page:src/pages/cerca@_@astro": "pages/cerca.astro.mjs", "\0@astro-page:src/pages/chi-siamo/collaboratori@_@astro": "pages/chi-siamo/collaboratori.astro.mjs", "\0@astro-page:src/pages/chi-siamo/contatti@_@astro": "pages/chi-siamo/contatti.astro.mjs", "\0@astro-page:src/pages/chi-siamo/hanno-scritto-per-noi@_@astro": "pages/chi-siamo/hanno-scritto-per-noi.astro.mjs", "\0@astro-page:src/pages/chi-siamo/la-redazione@_@astro": "pages/chi-siamo/la-redazione.astro.mjs", "\0@astro-page:src/pages/chi-siamo/la-rivista@_@astro": "pages/chi-siamo/la-rivista.astro.mjs", "\0@astro-page:src/pages/chi-siamo/redazione-storica@_@astro": "pages/chi-siamo/redazione-storica.astro.mjs", "\0@astro-page:src/pages/chi-siamo/index@_@astro": "pages/chi-siamo.astro.mjs", "\0@astro-page:src/pages/debug/audit-editoriale@_@astro": "pages/debug/audit-editoriale.astro.mjs", "\0@astro-page:src/pages/sezioni/dialogo-aperto@_@astro": "pages/sezioni/dialogo-aperto.astro.mjs", "\0@astro-page:src/pages/sezioni/diari@_@astro": "pages/sezioni/diari.astro.mjs", "\0@astro-page:src/pages/test-lista@_@astro": "pages/test-lista.astro.mjs", "\0@astro-page:src/pages/test-minimal@_@astro": "pages/test-minimal.astro.mjs", "\0@astro-page:src/pages/test-no-articles@_@astro": "pages/test-no-articles.astro.mjs", "\0@astro-page:src/pages/test-status@_@astro": "pages/test-status.astro.mjs", "\0@astro-page:src/pages/archivio/[issue]@_@astro": "pages/archivio/_issue_.astro.mjs", "\0@astro-page:src/pages/[diario]@_@astro": "pages/_diario_.astro.mjs", "\0@astro-page:src/pages/index@_@astro": "pages/index.astro.mjs", "\0astro-internal:middleware": "_astro-internal_middleware.mjs", "\0@astro-page:src/pages/blog/[...slug]@_@astro": "pages/blog/_---slug_.astro.mjs", "\0@astro-page:src/pages/sostienici@_@astro": "pages/sostienici.astro.mjs", "\0@astrojs-ssr-adapter": "_@astrojs-ssr-adapter.mjs", "\0@astrojs-manifest": "manifest_BXd5hZ_V.mjs", "/astro/hoisted.js?q=0": "_astro/hoisted.BK-QpP4l.js", "/astro/hoisted.js?q=1": "_astro/hoisted.Cdv6NXjL.js", "/astro/hoisted.js?q=5": "_astro/hoisted.D6fN33OZ.js", "/astro/hoisted.js?q=6": "_astro/hoisted.e4Grq_nB.js", "/astro/hoisted.js?q=8": "_astro/hoisted.BFiuLOoW.js", "/astro/hoisted.js?q=2": "_astro/hoisted.CIErU2gF.js", "/astro/hoisted.js?q=3": "_astro/hoisted.xg5iX3wE.js", "/astro/hoisted.js?q=4": "_astro/hoisted.BuAflv2B.js", "/astro/hoisted.js?q=7": "_astro/hoisted.D2uAbj8P.js", "/astro/hoisted.js?q=9": "_astro/hoisted.B5wi8Mb5.js", "astro:scripts/before-hydration.js": "" }, "inlinedScripts": [], "assets": ["/_astro/logo.Cb_mP9bA.svg", "/_astro/_diario_.DVQXp8w2.css", "/_astro/_issue_.Bkp5H6tf.css", "/_astro/_slug_.Bvtt_j-y.css", "/_astro/index.DvHZiE6C.css", "/_astro/sostienici.DZRfRPtH.css", "/_astro/index.Dnzyu-xS.css", "/correlati.json", "/favicon.ico", "/favicon.png", "/favicon.svg", "/robots.txt", "/_redirects", "/admin/config.yml", "/fonts/raleway-latin.woff2", "/images/avatar-default.png", "/images/avatar-default.svg", "/images/dona1.webp", "/images/dona2.webp", "/images/dona3.webp", "/images/dona4.webp", "/images/dona7.webp", "/images/placeholder-copertina.svg", "/placeholder/ph-1.jpg", "/placeholder/ph-2.jpg", "/placeholder/ph-3.jpg", "/placeholder/ph-4.jpg", "/_astro/hoisted.B5wi8Mb5.js", "/_astro/hoisted.BFiuLOoW.js", "/_astro/hoisted.BK-QpP4l.js", "/_astro/hoisted.BuAflv2B.js", "/_astro/hoisted.Cdv6NXjL.js", "/_astro/hoisted.CIErU2gF.js", "/_astro/hoisted.CXOjeUv_.css", "/_astro/hoisted.D2uAbj8P.js", "/_astro/hoisted.D6fN33OZ.js", "/_astro/hoisted.e4Grq_nB.js", "/_astro/hoisted.xg5iX3wE.js", "/_worker.js/index.js", "/_worker.js/renderers.mjs", "/_worker.js/_@astrojs-ssr-adapter.mjs", "/_worker.js/_astro-internal_middleware.mjs", "/images/redazione/alessandro-de-simone.jpg", "/images/redazione/benedetta-mattei.png", "/images/redazione/claudio-cinus.jpg", "/images/redazione/cristina-tersigni.webp", "/images/redazione/don-marco-bove.jpg", "/images/redazione/enrica-riera.png", "/images/redazione/franco-manuzio.jpg", "/images/redazione/giovanni-grossi.png", "/images/redazione/giulia-galeotti.webp", "/images/redazione/laura-coccia.jpg", "/images/redazione/maria-teresa-mazzarotto.jpg", "/images/redazione/mariangela-bertolini.png", "/images/redazione/matteo-cinti.png", "/images/redazione/natalia-livi.jpg", "/images/redazione/nicla-bettazzi.jpg", "/images/redazione/nicole-schulthes.jpg", "/images/redazione/rita-massi.png", "/images/redazione/serena-sillitto.png", "/images/redazione/sergio-sciascia.jpg", "/images/redazione/silvia-camisasca.jpg", "/images/redazione/silvia-gusmani.jpg", "/_worker.js/chunks/AboutSidebar_BMo6rhTT.mjs", "/_worker.js/chunks/ArticleCard_Bxiwkm9m.mjs", "/_worker.js/chunks/astro-designed-error-pages_DfD573yd.mjs", "/_worker.js/chunks/astro_JL7pVawF.mjs", "/_worker.js/chunks/BaseLayout_DIxcXjbq.mjs", "/_worker.js/chunks/diari_DNXJk5VJ.mjs", "/_worker.js/chunks/directus_B0n0XETK.mjs", "/_worker.js/chunks/Footer_D9bdzLvP.mjs", "/_worker.js/chunks/index_B-gW6nkE.mjs", "/_worker.js/chunks/IssueCard_Db5MfroW.mjs", "/_worker.js/chunks/noop-middleware_Chs5f3j2.mjs", "/_worker.js/chunks/ViewTransitions_Dvx2U5F3.mjs", "/_worker.js/pages/404.astro.mjs", "/_worker.js/pages/archivio.astro.mjs", "/_worker.js/pages/autori.astro.mjs", "/_worker.js/pages/cerca.astro.mjs", "/_worker.js/pages/chi-siamo.astro.mjs", "/_worker.js/pages/index.astro.mjs", "/_worker.js/pages/sostienici.astro.mjs", "/_worker.js/pages/test-lista.astro.mjs", "/_worker.js/pages/test-minimal.astro.mjs", "/_worker.js/pages/test-no-articles.astro.mjs", "/_worker.js/pages/test-status.astro.mjs", "/_worker.js/pages/_diario_.astro.mjs", "/_worker.js/pages/_image.astro.mjs", "/_worker.js/_astro/index.Dnzyu-xS.css", "/_worker.js/_astro/index.DvHZiE6C.css", "/_worker.js/_astro/logo.Cb_mP9bA.svg", "/_worker.js/_astro/sostienici.DZRfRPtH.css", "/_worker.js/_astro/_diario_.DVQXp8w2.css", "/_worker.js/_astro/_issue_.Bkp5H6tf.css", "/_worker.js/_astro/_slug_.Bvtt_j-y.css", "/_worker.js/chunks/astro/env-setup_nxDOIah1.mjs", "/_worker.js/chunks/astro/server_CgTYz_Tl.mjs", "/_worker.js/pages/api/debug-blog.astro.mjs", "/_worker.js/pages/api/debug-ssr-minimal.astro.mjs", "/_worker.js/pages/api/revalidate.astro.mjs", "/_worker.js/pages/archivio/web-only.astro.mjs", "/_worker.js/pages/archivio/_issue_.astro.mjs", "/_worker.js/pages/autori/_slug_.astro.mjs", "/_worker.js/pages/blog/en.astro.mjs", "/_worker.js/pages/blog/_---slug_.astro.mjs", "/_worker.js/pages/categoria/_categoria_.astro.mjs", "/_worker.js/pages/debug/audit-editoriale.astro.mjs", "/_worker.js/pages/chi-siamo/collaboratori.astro.mjs", "/_worker.js/pages/chi-siamo/contatti.astro.mjs", "/_worker.js/pages/chi-siamo/hanno-scritto-per-noi.astro.mjs", "/_worker.js/pages/chi-siamo/la-redazione.astro.mjs", "/_worker.js/pages/chi-siamo/la-rivista.astro.mjs", "/_worker.js/pages/chi-siamo/redazione-storica.astro.mjs", "/_worker.js/pages/sezioni/dialogo-aperto.astro.mjs", "/_worker.js/pages/sezioni/diari.astro.mjs", "/404.html", "/archivio/web-only/index.html", "/archivio/index.html", "/autori/index.html", "/blog/en/index.html", "/cerca/index.html", "/chi-siamo/collaboratori/index.html", "/chi-siamo/contatti/index.html", "/chi-siamo/hanno-scritto-per-noi/index.html", "/chi-siamo/la-redazione/index.html", "/chi-siamo/la-rivista/index.html", "/chi-siamo/redazione-storica/index.html", "/chi-siamo/index.html", "/debug/audit-editoriale/index.html", "/sezioni/dialogo-aperto/index.html", "/sezioni/diari/index.html", "/sostienici/index.html", "/test-lista/index.html", "/test-minimal/index.html", "/test-no-articles/index.html", "/test-status/index.html", "/index.html"], "buildFormat": "directory", "checkOrigin": false, "serverIslandNameMap": [], "key": "EZXCZK495NihxiYQ0LhK706JXRuaWjkoHIUY6+9CNy0=", "experimentalEnvGetSecretEnabled": false });

// _worker.js/index.js
globalThis.process ??= {};
globalThis.process.env ??= {};
var _page0 = /* @__PURE__ */ __name(() => import("./pages/_image.astro.mjs"), "_page0");
var _page1 = /* @__PURE__ */ __name(() => import("./pages/404.astro.mjs"), "_page1");
var _page2 = /* @__PURE__ */ __name(() => import("./pages/api/debug-blog.astro.mjs"), "_page2");
var _page3 = /* @__PURE__ */ __name(() => import("./pages/api/debug-ssr-minimal.astro.mjs"), "_page3");
var _page4 = /* @__PURE__ */ __name(() => import("./pages/api/revalidate.astro.mjs"), "_page4");
var _page5 = /* @__PURE__ */ __name(() => import("./pages/archivio/web-only.astro.mjs"), "_page5");
var _page6 = /* @__PURE__ */ __name(() => import("./pages/archivio/_issue_.astro.mjs"), "_page6");
var _page7 = /* @__PURE__ */ __name(() => import("./pages/archivio.astro.mjs"), "_page7");
var _page8 = /* @__PURE__ */ __name(() => import("./pages/autori/_slug_.astro.mjs"), "_page8");
var _page9 = /* @__PURE__ */ __name(() => import("./pages/autori.astro.mjs"), "_page9");
var _page10 = /* @__PURE__ */ __name(() => import("./pages/blog/en.astro.mjs"), "_page10");
var _page11 = /* @__PURE__ */ __name(() => import("./pages/blog/_---slug_.astro.mjs"), "_page11");
var _page12 = /* @__PURE__ */ __name(() => import("./pages/categoria/_categoria_.astro.mjs"), "_page12");
var _page13 = /* @__PURE__ */ __name(() => import("./pages/cerca.astro.mjs"), "_page13");
var _page14 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/collaboratori.astro.mjs"), "_page14");
var _page15 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/contatti.astro.mjs"), "_page15");
var _page16 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/hanno-scritto-per-noi.astro.mjs"), "_page16");
var _page17 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/la-redazione.astro.mjs"), "_page17");
var _page18 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/la-rivista.astro.mjs"), "_page18");
var _page19 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo/redazione-storica.astro.mjs"), "_page19");
var _page20 = /* @__PURE__ */ __name(() => import("./pages/chi-siamo.astro.mjs"), "_page20");
var _page21 = /* @__PURE__ */ __name(() => import("./pages/debug/audit-editoriale.astro.mjs"), "_page21");
var _page22 = /* @__PURE__ */ __name(() => import("./pages/sezioni/dialogo-aperto.astro.mjs"), "_page22");
var _page23 = /* @__PURE__ */ __name(() => import("./pages/sezioni/diari.astro.mjs"), "_page23");
var _page24 = /* @__PURE__ */ __name(() => import("./pages/sostienici.astro.mjs"), "_page24");
var _page25 = /* @__PURE__ */ __name(() => import("./pages/test-lista.astro.mjs"), "_page25");
var _page26 = /* @__PURE__ */ __name(() => import("./pages/test-minimal.astro.mjs"), "_page26");
var _page27 = /* @__PURE__ */ __name(() => import("./pages/test-no-articles.astro.mjs"), "_page27");
var _page28 = /* @__PURE__ */ __name(() => import("./pages/test-status.astro.mjs"), "_page28");
var _page29 = /* @__PURE__ */ __name(() => import("./pages/_diario_.astro.mjs"), "_page29");
var _page30 = /* @__PURE__ */ __name(() => import("./pages/index.astro.mjs"), "_page30");
var pageMap = /* @__PURE__ */ new Map([
  ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
  ["src/pages/404.astro", _page1],
  ["src/pages/api/debug-blog.ts", _page2],
  ["src/pages/api/debug-ssr-minimal.ts", _page3],
  ["src/pages/api/revalidate.ts", _page4],
  ["src/pages/archivio/web-only.astro", _page5],
  ["src/pages/archivio/[issue].astro", _page6],
  ["src/pages/archivio/index.astro", _page7],
  ["src/pages/autori/[slug].astro", _page8],
  ["src/pages/autori/index.astro", _page9],
  ["src/pages/blog/en.astro", _page10],
  ["src/pages/blog/[...slug].astro", _page11],
  ["src/pages/categoria/[categoria].astro", _page12],
  ["src/pages/cerca.astro", _page13],
  ["src/pages/chi-siamo/collaboratori.astro", _page14],
  ["src/pages/chi-siamo/contatti.astro", _page15],
  ["src/pages/chi-siamo/hanno-scritto-per-noi.astro", _page16],
  ["src/pages/chi-siamo/la-redazione.astro", _page17],
  ["src/pages/chi-siamo/la-rivista.astro", _page18],
  ["src/pages/chi-siamo/redazione-storica.astro", _page19],
  ["src/pages/chi-siamo/index.astro", _page20],
  ["src/pages/debug/audit-editoriale.astro", _page21],
  ["src/pages/sezioni/dialogo-aperto.astro", _page22],
  ["src/pages/sezioni/diari.astro", _page23],
  ["src/pages/sostienici.astro", _page24],
  ["src/pages/test-lista.astro", _page25],
  ["src/pages/test-minimal.astro", _page26],
  ["src/pages/test-no-articles.astro", _page27],
  ["src/pages/test-status.astro", _page28],
  ["src/pages/[diario].astro", _page29],
  ["src/pages/index.astro", _page30]
]);
var serverIslandMap = /* @__PURE__ */ new Map();
var _manifest2 = Object.assign(manifest, {
  pageMap,
  serverIslandMap,
  renderers,
  middleware: () => Promise.resolve().then(() => (init_astro_internal_middleware(), astro_internal_middleware_exports))
});
var _exports = createExports(_manifest2);
var __astrojsSsrVirtualEntry = _exports.default;
export {
  __astrojsSsrVirtualEntry as default,
  pageMap
};
//# sourceMappingURL=bundledWorker-0.4795864832321046.mjs.map
