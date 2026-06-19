/**
 * Seed contenuti_statici — popola le chiavi per le pagine statiche del sito.
 * Idempotente: salta le chiavi già presenti in Directus.
 *
 * Uso:
 *   DIRECTUS_TOKEN=xxx node scripts/seed-contenuti-statici.mjs
 *   DIRECTUS_TOKEN=xxx node scripts/seed-contenuti-statici.mjs --dry-run
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://cms.ombreeluci.it';
const TOKEN = process.env.DIRECTUS_TOKEN;
if (!TOKEN) { console.error('DIRECTUS_TOKEN mancante'); process.exit(1); }

const DRY_RUN = process.argv.includes('--dry-run');

const RECORDS = [
  // ── Homepage ──────────────────────────────────────────────
  { chiave: 'home_tagline', gruppo: 'homepage', tipo: 'testo', ordine: 1,
    valore_it: 'Un nuovo sguardo attraverso la disabilità',
    valore_en: 'A new perspective through disability' },
  { chiave: 'home_section_close_up', gruppo: 'homepage', tipo: 'testo', ordine: 10,
    valore_it: 'Da vicino',
    valore_en: 'Close Up' },
  { chiave: 'home_section_close_up_sub', gruppo: 'homepage', tipo: 'testo', ordine: 11,
    valore_it: 'I diari di chi vive questa realtà e le storie di chi, stando accanto, ha visto qualcosa cambiare.',
    valore_en: 'Personal stories from those who live this reality every day.' },
  { chiave: 'home_testi_cta_text', gruppo: 'homepage', tipo: 'testo', ordine: 12,
    valore_it: 'Hai vissuto qualcosa che vale la pena raccontare?',
    valore_en: 'Have you experienced something worth sharing?' },
  { chiave: 'home_testi_cta_link', gruppo: 'homepage', tipo: 'testo', ordine: 13,
    valore_it: 'Scrivici →',
    valore_en: 'Write to us →' },
  { chiave: 'home_section_explore', gruppo: 'homepage', tipo: 'testo', ordine: 20,
    valore_it: 'Esplora',
    valore_en: 'Explore' },
  { chiave: 'home_section_explore_sub', gruppo: 'homepage', tipo: 'testo', ordine: 21,
    valore_it: "Quarant'anni di storie, riflessioni e incontri.",
    valore_en: 'Forty years of stories, reflections and encounters.' },
  { chiave: 'home_magazine_eyebrow', gruppo: 'homepage', tipo: 'testo', ordine: 30,
    valore_it: 'La rivista · esce ogni tre mesi dal 1983',
    valore_en: 'The magazine · published quarterly since 1983' },
  { chiave: 'home_magazine_discover', gruppo: 'homepage', tipo: 'testo', ordine: 31,
    valore_it: 'Scopri il numero →',
    valore_en: 'Discover the issue →' },
  { chiave: 'home_magazine_archive', gruppo: 'homepage', tipo: 'testo', ordine: 32,
    valore_it: 'Tutti i numeri',
    valore_en: 'All issues' },
  { chiave: 'home_magazine_all_issues', gruppo: 'homepage', tipo: 'testo', ordine: 33,
    valore_it: 'Tutti i numeri',
    valore_en: 'All issues' },
  { chiave: 'home_magazine_archive_link', gruppo: 'homepage', tipo: 'testo', ordine: 34,
    valore_it: 'Tutti i numeri →',
    valore_en: 'All issues →' },
  { chiave: 'home_section_join', gruppo: 'homepage', tipo: 'testo', ordine: 40,
    valore_it: 'Unisciti',
    valore_en: 'Get Involved' },
  { chiave: 'home_section_join_sub', gruppo: 'homepage', tipo: 'testo', ordine: 41,
    valore_it: 'Ombre e Luci esiste grazie a chi ci crede. Ci sono molti modi per esserci.',
    valore_en: 'Ombre e Luci exists thanks to those who believe in it. There are many ways to be part of it.' },
  { chiave: 'home_join_support_title', gruppo: 'homepage', tipo: 'testo', ordine: 42,
    valore_it: 'Sostieni la rivista',
    valore_en: 'Support the magazine' },
  { chiave: 'home_join_support_text', gruppo: 'homepage', tipo: 'testo', ordine: 43,
    valore_it: 'Una donazione, anche piccola e ricorrente, permette a Ombre e Luci di continuare a pubblicare storie che contano.',
    valore_en: 'A donation, even a small recurring one, allows Ombre e Luci to continue publishing stories that matter.' },
  { chiave: 'home_join_support_btn', gruppo: 'homepage', tipo: 'testo', ordine: 44,
    valore_it: 'Scopri come →',
    valore_en: 'Find out how →' },
  { chiave: 'home_join_story_title', gruppo: 'homepage', tipo: 'testo', ordine: 45,
    valore_it: 'Racconta la tua storia',
    valore_en: 'Share your story' },
  { chiave: 'home_join_story_text', gruppo: 'homepage', tipo: 'testo', ordine: 46,
    valore_it: 'Hai vissuto qualcosa che vale la pena condividere? Le storie più vere arrivano da chi le ha vissute.',
    valore_en: 'Have you experienced something worth sharing? The truest stories come from those who have lived them.' },
  { chiave: 'home_join_story_btn', gruppo: 'homepage', tipo: 'testo', ordine: 47,
    valore_it: 'Scrivici →',
    valore_en: 'Write to us →' },
  { chiave: 'home_join_help_title', gruppo: 'homepage', tipo: 'testo', ordine: 48,
    valore_it: 'Dai una mano',
    valore_en: 'Lend a hand' },
  { chiave: 'home_join_help_text', gruppo: 'homepage', tipo: 'testo', ordine: 49,
    valore_it: 'Vuoi collaborare, fare volontariato o contribuire in un altro modo? Siamo sempre aperti.',
    valore_en: 'Want to collaborate, volunteer or contribute in another way? We are always open.' },
  { chiave: 'home_join_help_btn', gruppo: 'homepage', tipo: 'testo', ordine: 50,
    valore_it: 'Contattaci →',
    valore_en: 'Contact us →' },
  { chiave: 'home_newsletter_row', gruppo: 'homepage', tipo: 'testo', ordine: 51,
    valore_it: 'Resta in contatto:',
    valore_en: 'Stay connected:' },
  { chiave: 'home_newsletter_link', gruppo: 'homepage', tipo: 'testo', ordine: 52,
    valore_it: 'iscriviti alla newsletter',
    valore_en: 'subscribe to our newsletter' },

  // ── Newsletter ────────────────────────────────────────────
  { chiave: 'nl_eyebrow', gruppo: 'newsletter', tipo: 'testo', ordine: 1,
    valore_it: 'Newsletter',
    valore_en: 'Newsletter' },
  { chiave: 'nl_title', gruppo: 'newsletter', tipo: 'testo', ordine: 2,
    valore_it: 'Rimani in contatto',
    valore_en: 'Stay in touch' },
  { chiave: 'nl_subtitle', gruppo: 'newsletter', tipo: 'paragrafo', ordine: 3,
    valore_it: 'Ogni numero: articoli scelti dalla redazione, storie di vita, riflessioni sulla disabilità e sulla fragilità. Nessuno spam, puoi cancellarti in ogni momento.',
    valore_en: 'Each issue: articles selected by the editorial team, life stories, reflections on disability and fragility. No spam, unsubscribe any time.' },
  { chiave: 'nl_prev_title', gruppo: 'newsletter', tipo: 'testo', ordine: 10,
    valore_it: 'Newsletter precedenti',
    valore_en: 'Previous newsletters' },
  { chiave: 'nl_explore_title', gruppo: 'newsletter', tipo: 'testo', ordine: 11,
    valore_it: 'Esplora i temi della rivista',
    valore_en: 'Explore magazine themes' },
  { chiave: 'nl_archive_link', gruppo: 'newsletter', tipo: 'testo', ordine: 12,
    valore_it: 'Tutti i numeri →',
    valore_en: 'All issues →' },

  // ── Archivio ──────────────────────────────────────────────
  { chiave: 'archive_eyebrow', gruppo: 'archivio', tipo: 'testo', ordine: 1,
    valore_it: 'La rivista · trimestrale dal 1983',
    valore_en: 'The magazine · quarterly since 1983' },
  { chiave: 'archive_title', gruppo: 'archivio', tipo: 'testo', ordine: 2,
    valore_it: 'Magazine',
    valore_en: 'Magazine' },
  { chiave: 'archive_subtitle', gruppo: 'archivio', tipo: 'testo', ordine: 3,
    valore_it: 'Sfoglia i numeri della rivista Ombre e Luci dal 1977 ad oggi.',
    valore_en: 'Browse the issues of Ombre e Luci magazine since 1977.' },
  { chiave: 'archive_no_results_title', gruppo: 'archivio', tipo: 'testo', ordine: 10,
    valore_it: 'Nessun numero trovato',
    valore_en: 'No issues found' },
  { chiave: 'archive_no_results_body', gruppo: 'archivio', tipo: 'testo', ordine: 11,
    valore_it: 'Prova a cambiare i filtri.',
    valore_en: 'Try changing the filters.' },
  { chiave: 'issue_articles_heading', gruppo: 'archivio', tipo: 'testo', ordine: 20,
    valore_it: 'Articoli di questo numero',
    valore_en: 'Articles in this issue' },

  // ── Diari ─────────────────────────────────────────────────
  { chiave: 'diari_title', gruppo: 'diari', tipo: 'testo', ordine: 1,
    valore_it: 'I Diari di Ombre e Luci',
    valore_en: 'The Diaries of Ombre e Luci' },
  { chiave: 'diari_description', gruppo: 'diari', tipo: 'paragrafo', ordine: 2,
    valore_it: 'I Diari di Ombre e Luci sono uno spazio narrativo dove autori fissi raccontano la propria vita con la disabilità — in famiglia, in comunità, nella fede — settimana dopo settimana.',
    valore_en: 'The Diaries of Ombre e Luci are a narrative space where regular authors share their lives with disability — in the family, in the community, in faith — week after week.' },
  { chiave: 'diari_feed_title', gruppo: 'diari', tipo: 'testo', ordine: 3,
    valore_it: 'Tutti gli articoli dai Diari',
    valore_en: 'All Diaries articles' },
  { chiave: 'diari_feed_desc', gruppo: 'diari', tipo: 'testo', ordine: 4,
    valore_it: 'Gli ultimi contributi dagli autori dei Diari, dal più recente al più vecchio.',
    valore_en: 'The latest contributions from the Diaries authors, most recent first.' },
];

async function main() {
  // Fetch existing keys to skip duplicates
  const existing = await fetch(
    `${DIRECTUS_URL}/items/contenuti_statici?fields[]=chiave&limit=-1`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  ).then(r => r.json());

  const existingKeys = new Set((existing.data ?? []).map(r => r.chiave));

  const toCreate = RECORDS.filter(r => !existingKeys.has(r.chiave));

  if (toCreate.length === 0) {
    console.log('Tutte le chiavi esistono già — nessuna modifica.');
    return;
  }

  console.log(`${toCreate.length} chiavi da creare (${existingKeys.size} già presenti):`);
  for (const r of toCreate) {
    console.log(`  [${r.gruppo}] ${r.chiave}`);
  }

  if (DRY_RUN) {
    console.log('\n--dry-run: nessuna scrittura.');
    return;
  }

  let created = 0;
  let errors = 0;

  for (const record of toCreate) {
    const res = await fetch(`${DIRECTUS_URL}/items/contenuti_statici`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });

    if (res.ok) {
      created++;
      console.log(`  ✓ ${record.chiave}`);
    } else {
      errors++;
      const body = await res.text();
      console.error(`  ✗ ${record.chiave}: ${res.status} ${body}`);
    }
  }

  console.log(`\nDone: ${created} create, ${errors} errori.`);
}

main().catch(e => { console.error(e); process.exit(1); });
