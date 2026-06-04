// One-time fix: href="www.angsaonlus.org" → href="https://www.angsaonlus.org"
// EN: 8fe6e954-e0bc-412d-9af6-1adb1f47b607 (open-dialogue-no-90)
// IT: 8a428949-6ba1-4a4e-a2e9-26e609c2bed8 (collegato via articolo_traduzione)

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://cms.ombreeluci.it';
const TOKEN = process.env.DIRECTUS_TOKEN;
if (!TOKEN) { console.error('DIRECTUS_TOKEN mancante'); process.exit(1); }

const ARTICLES = [
  { id: '8fe6e954-e0bc-412d-9af6-1adb1f47b607', lang: 'en' },
  { id: '8a428949-6ba1-4a4e-a2e9-26e609c2bed8', lang: 'it' },
];

const BAD = 'href="www.angsaonlus.org"';
const GOOD = 'href="https://www.angsaonlus.org"';

for (const art of ARTICLES) {
  const res = await fetch(`${DIRECTUS_URL}/items/articoli/${art.id}?fields=id,slug,corpo`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const { data } = await res.json();

  if (!data.corpo.includes(BAD)) {
    console.log(`[${art.lang}] ${data.slug}: pattern non trovato, nessuna modifica`);
    continue;
  }

  const corpoFixed = data.corpo.replaceAll(BAD, GOOD);
  const patch = await fetch(`${DIRECTUS_URL}/items/articoli/${art.id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ corpo: corpoFixed }),
  });
  const result = await patch.json();
  if (result.data?.id) {
    console.log(`[${art.lang}] ${data.slug}: PATCH OK — href corretto`);
  } else {
    console.error(`[${art.lang}] ${data.slug}: PATCH fallito`, JSON.stringify(result));
  }
}
