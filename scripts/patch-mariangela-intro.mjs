import { loadEnv } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = loadEnv('development', path.resolve(__dirname, '..'), '');
const BASE = env.DIRECTUS_URL;
const TOKEN = env.DIRECTUS_TOKEN;

const intro = `<p>Mariangela Mazzarotto nasce a Treviso nel 1933, quarta di dieci fratelli. Arriva a Roma nel 1946 dove studia e poi insegna Lettere classiche in un liceo. Sposa Paolo Bertolini e hanno tre figli tra cui Maria Francesca, con una grave disabilità. Nel 1969 incontra a Lourdes Friquette Heyndrickx, anche lei mamma di una bambina con una disabilità molto grave, Sophie. Il loro incontro segna per Mariangela il punto di svolta per un nuovo sguardo sulla figlia e sulla consapevolezza della necessità per i genitori come lei di incontrarsi e condividere la propria esperienza.</p>
<p>Spinta dall'incontro con Jean Vanier e Marie Hélène Mathieu – che nel 1971 avevano fondato, proprio a Lourdes, il movimento di Foi et Lumière – Mariangela porta Fede e Luce in Italia. Nel 1974 dà vita al ciclostile <em>Insieme</em> per tenere informati ed uniti i membri delle comunità italiane sulle attività del movimento ed è il riferimento italiano per un'équipe che cura l'organizzazione del pellegrinaggio giubilare internazionale a Roma del 1975.</p>
<p>Lascia il suo lavoro da insegnante e riveste, per il movimento, il ruolo di coordinatore nazionale e poi di vice coordinatore internazionale, portando la sua testimonianza in Polonia e in Russia; nel 1983, ispirata dalla rivista francese <em>Ombres et Lumières</em>, fonda la rivista <em>Ombre e Luci</em>, con l'intento di raggiungere le famiglie di persone con disabilità e di creare una rete di condivisione e sostegno oltre le comunità. Nel 2002 le viene conferito il Premio Donna, istituito dall'A.N.R.P., «per l'impegno con il quale ha contribuito ad affermare i diritti delle persone che spesso vengono emarginate dalla società».</p>
<p>Nella sua storica parrocchia di Santa Silvia al Portuense di Roma partecipa alla vita della comunità di Fede e Luce, si occupa della Caritas ed è tra i promotori del Laboratorio Il Mosaico dedicato a persone con disagio psichiatrico. Viene a mancare nel maggio del 2014, all'età di 81 anni.</p>`;

const res = await fetch(`${BASE}/items/verticali/2`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TOKEN}`,
  },
  body: JSON.stringify({ intro }),
});
const json = await res.json();
if (!res.ok) {
  console.error('Errore:', json.errors?.[0]?.message);
  process.exit(1);
}
console.log('✅ Intro aggiornata con accenti corretti');
