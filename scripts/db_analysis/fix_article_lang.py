"""
fix_article_lang.py
Rileva la lingua corretta di ogni articolo (title+slug) e corregge il campo
`lang` in Directus. Genera CSV di revisione per i casi ambigui.

Logica:
- Se il titolo contiene parole inequivocabilmente italiane  → lang=it
- Se il titolo contiene parole inequivocabilmente inglesi  → lang=en
- Se ambiguo: usa il testo del corpo (primi 200 char) come tie-breaker
- Record con score identico → segnalati in CSV come 'review_needed'

Dry-run:  python fix_article_lang.py --dry-run
Run real: python fix_article_lang.py
"""

import os, sys, re, csv, time, argparse, unicodedata, requests

DIRECTUS_URL   = os.environ.get("DIRECTUS_URL",   "http://159.69.196.64:8055")
DIRECTUS_TOKEN = os.environ.get("DIRECTUS_TOKEN", "nBZ6kdd0YgVnhLm2TZEDoT9A-NJujwVU")
HEADERS = {"Authorization": f"Bearer {DIRECTUS_TOKEN}"}

# ── Euristica lingua ──────────────────────────────────────────────────────────

IT_STRONG = re.compile(
    r'\b(il|la|lo|gli|le|un|una|uno'
    r'|del|della|dello|dei|degli|delle'
    r'|al|alla|agli|alle|allo'
    r'|nel|nella|negli|nelle|nello'
    r'|sul|sulla|sugli|sulle|sullo'
    r'|per il|per la|per i|per le|per lo'
    r'|con il|con la|con i|con le|con lo'
    r'|dal|dalla|dagli|dalle|dallo)\b',
    re.I,
)
IT_MEDIUM = re.compile(
    r'\b(di|da|in|con|su|tra|fra|per|che|chi|come|quando|dove|dopo|prima'
    r'|questo|questa|questi|queste|quello|quella'
    r'|sono|siamo|hanno|essere|fare|dire|vedere|vita|mondo'
    r'|film|rivista|recensione|disabilit|handicap|fede|chiesa|preghier'
    r'|zione|ismo)\b',
    re.I,
)
EN_STRONG = re.compile(
    r'\b(the|of|and|with|for|from|into|through|between|among'
    r'|my|our|your|their|his|her|its'
    r'|this|that|these|those|when|where|how|who|what|which'
    r'|journey|faith|hope|story|stories|life|light|world|way|place'
    r'|breaking|navigating|celebrating|transforming|diving|working)\b',
    re.I,
)
EN_MEDIUM = re.compile(
    r'\b(a|an|is|are|was|were|been|have|has|will|can|may|should|would'
    r'|film|review|interview|festival)\b',
    re.I,
)

def norm(text: str) -> str:
    """Normalizza unicode per confronti."""
    return unicodedata.normalize('NFC', text or '').lower()

def score_lang(titolo: str, slug: str, corpo_snippet: str = '') -> tuple[str, int]:
    """
    Restituisce (lang_detected, confidence) dove confidence è 1=certo, 0=ambiguo.
    """
    text = norm(f"{titolo} {slug} {corpo_snippet}")

    it_score = len(IT_STRONG.findall(text)) * 3 + len(IT_MEDIUM.findall(text))
    en_score = len(EN_STRONG.findall(text)) * 3 + len(EN_MEDIUM.findall(text))

    if it_score == 0 and en_score == 0:
        return 'it', 0  # default italiano
    if it_score > en_score * 1.5:
        confidence = 1 if it_score >= 3 else 0
        return 'it', confidence
    if en_score > it_score * 1.3:
        confidence = 1 if en_score >= 3 else 0
        return 'en', confidence
    return 'ambig', 0

# ── Fetch Directus ────────────────────────────────────────────────────────────

def get_all_articles():
    """Recupera id, slug, titolo, lang, corpo (snippet) per tutti gli articoli."""
    all_items = []
    limit = 200
    offset = 0
    while True:
        r = requests.get(
            f"{DIRECTUS_URL}/items/articoli",
            headers=HEADERS,
            params={
                'fields': 'id,slug,titolo,lang,corpo',
                'limit': limit,
                'offset': offset,
            },
            timeout=30,
        )
        r.raise_for_status()
        batch = r.json().get('data', [])
        if not batch:
            break
        all_items.extend(batch)
        offset += limit
        if len(batch) < limit:
            break
    return all_items

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    dry = args.dry_run

    mode = 'DRY-RUN' if dry else 'LIVE'
    print(f"[fix_article_lang] Modalità: {mode}")
    print(f"[fix_article_lang] Recupero articoli da Directus...")

    articles = get_all_articles()
    print(f"[fix_article_lang] Totale articoli: {len(articles)}")

    log_rows = []
    patch_it = []
    patch_en = []
    review  = []

    for a in articles:
        uid   = a['id']
        slug  = a.get('slug') or ''
        title = a.get('titolo') or ''
        lang_current = a.get('lang') or 'it'
        # Usa i primi 300 char del corpo come hint aggiuntivo
        corpo_raw = re.sub(r'<[^>]+>', ' ', a.get('corpo') or '')
        corpo_snippet = corpo_raw[:300]

        detected, confidence = score_lang(title, slug, corpo_snippet)

        if detected == 'ambig':
            review.append(a)
            log_rows.append({
                'id': uid, 'slug': slug[:60], 'titolo': title[:70],
                'lang_current': lang_current, 'lang_detected': 'AMBIG',
                'action': 'review_needed',
            })
            continue

        if detected == lang_current:
            # Nessuna modifica necessaria
            log_rows.append({
                'id': uid, 'slug': slug[:60], 'titolo': title[:70],
                'lang_current': lang_current, 'lang_detected': detected,
                'action': 'ok_no_change',
            })
            continue

        # Mismatch: serve correzione
        action = f"PATCH_{detected.upper()}"
        log_rows.append({
            'id': uid, 'slug': slug[:60], 'titolo': title[:70],
            'lang_current': lang_current, 'lang_detected': detected,
            'action': action,
        })
        if detected == 'it':
            patch_it.append(uid)
        else:
            patch_en.append(uid)

    print(f"\n[fix_article_lang] Riepilogo:")
    print(f"  Nessuna modifica (lang ok):   {sum(1 for r in log_rows if r['action']=='ok_no_change')}")
    print(f"  Patch IT (correggi EN->IT):   {len(patch_it)}")
    print(f"  Patch EN (correggi IT->EN):   {len(patch_en)}")
    print(f"  Da rivedere manualmente:      {len(review)}")

    if patch_it:
        print(f"\n  Esempi PATCH IT->:")
        for uid in patch_it[:5]:
            a = next(x for x in articles if x['id'] == uid)
            print(f"    [{a.get('lang')}->it] {(a.get('titolo') or '')[:70]}")

    if patch_en:
        print(f"\n  Esempi PATCH EN->:")
        for uid in patch_en[:5]:
            a = next(x for x in articles if x['id'] == uid)
            print(f"    [{a.get('lang')}->en] {(a.get('titolo') or '')[:70]}")

    # Salva CSV log
    log_path = 'scripts/db_analysis/logs/fix_article_lang.csv'
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    with open(log_path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=['id','slug','titolo','lang_current','lang_detected','action'])
        w.writeheader()
        w.writerows(log_rows)
    print(f"\n  Log CSV: {log_path}")

    if dry:
        print("\n[DRY-RUN] Nessuna modifica applicata.")
        return

    # Applica PATCH
    errors = 0

    for uid in patch_it:
        r = requests.patch(
            f"{DIRECTUS_URL}/items/articoli/{uid}",
            headers=HEADERS,
            json={'lang': 'it'},
            timeout=15,
        )
        if r.status_code not in (200, 204):
            print(f"  ERRORE {r.status_code} PATCH it {uid}")
            errors += 1
        time.sleep(0.05)

    for uid in patch_en:
        r = requests.patch(
            f"{DIRECTUS_URL}/items/articoli/{uid}",
            headers=HEADERS,
            json={'lang': 'en'},
            timeout=15,
        )
        if r.status_code not in (200, 204):
            print(f"  ERRORE {r.status_code} PATCH en {uid}")
            errors += 1
        time.sleep(0.05)

    print(f"\n[fix_article_lang] Completato. PATCH IT: {len(patch_it)}  PATCH EN: {len(patch_en)}  Errori: {errors}")

if __name__ == '__main__':
    main()
