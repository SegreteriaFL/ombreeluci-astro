// Verifica canonical, hreflang, meta description su campione di pagine IT e EN
// Eseguire dopo ogni deploy su staging: SMOKE_BASE_URL=https://ombreeluci-staging.pages.dev node scripts/test-seo.mjs

const BASE = process.env.SMOKE_BASE_URL || 'https://ombreeluci-staging.pages.dev';

const PAGES_TO_TEST = [
  { url: '/it/la-nostra-buona-novella/', lang: 'it', expectCanonical: true, expectHreflang: true },
  { url: '/en/if-theres-news-im-happy/', lang: 'en', expectCanonical: true, expectHreflang: true },
  { url: '/categoria/famiglia/', lang: 'it', expectCanonical: true },
  { url: '/en/category/family/', lang: 'en', expectCanonical: true },
  { url: '/autori/jean-vanier/', lang: 'it', expectCanonical: true },
  { url: '/en/authors/jean-vanier/', lang: 'en', expectCanonical: true },
  { url: '/', lang: 'it', expectCanonical: true },
  { url: '/en/', lang: 'en', expectCanonical: true },
];

let passed = 0, failed = 0;

for (const page of PAGES_TO_TEST) {
  const res = await fetch(BASE + page.url);
  const html = await res.text();
  const issues = [];

  if (res.status !== 200) issues.push(`HTTP ${res.status}`);
  if (page.expectCanonical && !html.includes('rel="canonical"')) issues.push('missing canonical');
  if (page.expectHreflang && !html.includes('hreflang')) issues.push('missing hreflang');
  if (!html.includes('<meta name="description"')) issues.push('missing meta description');
  if (!html.includes(`lang="${page.lang}"`)) issues.push(`missing lang="${page.lang}"`);

  if (issues.length === 0) {
    console.log(`✅ ${page.url}`);
    passed++;
  } else {
    console.log(`❌ ${page.url} — ${issues.join(', ')}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
