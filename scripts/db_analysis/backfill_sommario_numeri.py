#!/usr/bin/env python3
"""
backfill_sommario_numeri.py

Estrae il testo "Sommario" dal post_content WordPress dei numeri rivista
e lo inserisce nel campo `descrizione` di Directus (numeri_rivista collection).

Il post_content contiene markup Divi con struttura:
  <h4>Sommario</h4>
  <p>testo del sommario...</p>
  <h4>Editoriale</h4>  ← fine sommario
  ...

Input:  scripts/db_analysis/output/numeri_rivista_wp.json
Output: PATCH Directus /items/numeri_rivista/{id}

Uso:
    python3 scripts/db_analysis/backfill_sommario_numeri.py --dry-run
    python3 scripts/db_analysis/backfill_sommario_numeri.py
"""

import argparse
import json
import re
import time
import urllib.request
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
INPUT_PATH = ROOT / "scripts/db_analysis/output/numeri_rivista_wp.json"
LOG_PATH = ROOT / "scripts/db_analysis/logs/backfill_sommario_numeri.json"

DIRECTUS_URL = "http://159.69.196.64:8055"
DIRECTUS_TOKEN = "nBZ6kdd0YgVnhLm2TZEDoT9A-NJujwVU"


# ── HTTP helpers ────────────────────────────────────────────────────────────────

def directus_get(path, params=None):
    url = f"{DIRECTUS_URL}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {DIRECTUS_TOKEN}"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def directus_patch(item_id, data):
    url = f"{DIRECTUS_URL}/items/numeri_rivista/{item_id}"
    body = json.dumps(data).encode()
    req = urllib.request.Request(
        url, data=body, method="PATCH",
        headers={
            "Authorization": f"Bearer {DIRECTUS_TOKEN}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


# ── Sommario extractor ──────────────────────────────────────────────────────────

# Sezioni che delimitano la fine del sommario
SECTION_HEADERS = re.compile(
    r'<h[1-6][^>]*>\s*(?:Editoriale|Articoli|Rubriche|Diari|In\s+questo\s+numero|'
    r'Leggi\s+anche|News|Recensioni|Testimonianze|Focus|Interviste?)\s*</h[1-6]>',
    re.IGNORECASE,
)


def fix_encoding(s):
    try:
        return s.encode('latin-1').decode('utf-8')
    except (UnicodeDecodeError, UnicodeEncodeError):
        return s


def clean_html(html):
    """
    Pulisce l'HTML del sommario:
    - Rimuove <span style="..."> wrappati intorno a testo (unwrap)
    - Converte link interni WordPress (ombreeluci.it/YYYY/slug/) → /blog/slug/
    - Rimuove attributi inutili da <a> (mantiene solo href)
    - Normalizza whitespace
    - Fix encoding mojibake
    """
    h = fix_encoding(html)

    # Rimuovi <span> con solo attributi style (unwrap il contenuto)
    h = re.sub(r'<span\s+style="[^"]*">(.*?)</span>', r'\1', h, flags=re.DOTALL)
    h = re.sub(r'<span>(.*?)</span>', r'\1', h, flags=re.DOTALL)

    # Converte link interni WP → slug locale
    def fix_href(m):
        href = m.group(1)
        # https://www.ombreeluci.it/YYYY/slug/ → /blog/slug/
        slug_m = re.search(r'ombreeluci\.it/\d{4}/([^/"]+)/?$', href)
        if slug_m:
            return f'href="/blog/{slug_m.group(1)}/"'
        # https://www.ombreeluci.it/slug/ → /blog/slug/
        slug_m2 = re.search(r'ombreeluci\.it/([^/"]+)/?$', href)
        if slug_m2 and '.' not in slug_m2.group(1):
            return f'href="/blog/{slug_m2.group(1)}/"'
        return m.group(0)

    h = re.sub(r'href="([^"]+)"', fix_href, h)

    # Rimuovi attributi da <a> eccetto href
    def clean_a(m):
        tag = m.group(0)
        href_m = re.search(r'href="([^"]*)"', tag)
        if href_m:
            return f'<a href="{href_m.group(1)}">'
        return '<a>'

    h = re.sub(r'<a\b[^>]+>', clean_a, h)

    # Rimuovi &nbsp; residui
    h = re.sub(r'&nbsp;', ' ', h)

    # Normalizza whitespace dentro i tag
    h = re.sub(r'\s+', ' ', h)
    h = re.sub(r'>\s+<', '><', h)
    h = re.sub(r'<p>\s*</p>', '', h)

    return h.strip()


def extract_sommario(post_content):
    """
    Estrae il testo del sommario dal post_content WordPress/Divi.
    Restituisce HTML pulito o None se non trovato.
    """
    if not post_content:
        return None

    pc = fix_encoding(post_content)

    # Cerca <h4>Sommario</h4> (o <h3>, <b>Sommario</b>, ecc.)
    sommario_start = None
    for pattern in [
        r'<h[1-6][^>]*>\s*Sommario\s*</h[1-6]>',
        r'<b>\s*Sommario\s*</b>',
        r'<strong>\s*Sommario\s*</strong>',
    ]:
        m = re.search(pattern, pc, re.IGNORECASE)
        if m:
            sommario_start = m.end()
            break

    if sommario_start is None:
        return None

    # Tutto ciò che segue fino alla prossima sezione
    after = pc[sommario_start:]

    # Trova la fine del sommario (prossima sezione intestazione)
    end_m = SECTION_HEADERS.search(after)
    if end_m:
        sommario_html = after[:end_m.start()]
    else:
        # Fallback: prendi fino al prossimo shortcode Divi [/et_pb_text]
        divi_end = after.find('[/et_pb_text]')
        if divi_end > 0:
            sommario_html = after[:divi_end]
        else:
            # Prendi fino a fine stringa ma max 2000 chars
            sommario_html = after[:2000]

    # Rimuovi shortcode Divi rimasti
    sommario_html = re.sub(r'\[/?[a-zA-Z_][^\]]*\]', '', sommario_html)

    # Pulisci
    sommario_html = clean_html(sommario_html)

    # Rimuovi tag vuoti
    sommario_html = re.sub(r'<p>\s*</p>', '', sommario_html)
    sommario_html = sommario_html.strip()

    if len(sommario_html) < 20:
        return None

    return sommario_html


# ── Main ────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Backfill sommario nei numeri rivista Directus')
    parser.add_argument('--dry-run', action='store_true', help='Non scrive su Directus')
    parser.add_argument('--limit', type=int, default=0, help='Limita a N numeri (0=tutti)')
    args = parser.parse_args()

    print("=== Backfill sommario numeri rivista ===")
    print(f"Dry-run: {args.dry_run}")

    # 1. Carica numeri_rivista_wp.json
    print(f"\n[1/3] Caricamento {INPUT_PATH.name} ...")
    with open(INPUT_PATH, encoding='utf-8') as f:
        wp_numeri = json.load(f)
    print(f"  {len(wp_numeri)} numeri dal dump WP")

    # Mappa wp_id → dati WP
    wp_by_id = {}
    for n in wp_numeri:
        wid = n.get('wp_id')
        if wid:
            wp_by_id[int(wid)] = n

    # 2. Carica numeri da Directus
    print("\n[2/3] Caricamento numeri da Directus ...")
    resp = directus_get("/items/numeri_rivista", {
        "fields": "id,id_numero,wp_url,descrizione",
        "limit": 300,
    })
    directus_numeri = resp.get("data", [])
    print(f"  {len(directus_numeri)} numeri in Directus")

    # Mappa: estrai wp_id dall'url WP (es. /2023/nome-numero/ → cerca in wp_numeri per slug)
    # Strategia: match per slug (id_numero → slug WP)
    def id_numero_to_slug(id_numero):
        """Converte OEL-42 o INS-21 in slug normalizzato."""
        return id_numero.lower().replace('/', '-').replace(' ', '-')

    # Costruisci mappa slug → directus_id
    slug_to_directus = {}
    for dn in directus_numeri:
        slug = id_numero_to_slug(dn['id_numero'])
        slug_to_directus[slug] = dn

    # Costruisci mappa slug WP → wp_data
    def wp_slug_normalize(slug):
        return re.sub(r'-+', '-', re.sub(r'[^a-z0-9-]', '-', slug.lower())).strip('-')

    # Match diretto per slug WP ↔ id_numero Directus
    # Strategia: prova diversi formati di match
    def find_directus_match(wp_item):
        wp_slug = wp_slug_normalize(wp_item.get('slug', ''))
        wp_title = wp_item.get('title', '')

        # Prova match diretto slug WP → slug id_numero
        for dn in directus_numeri:
            dn_slug = wp_slug_normalize(dn['id_numero'])
            if dn_slug in wp_slug or wp_slug in dn_slug:
                return dn
            # Prova con wp_url in Directus
            if dn.get('wp_url'):
                wp_url_slug = wp_slug_normalize(dn['wp_url'].rstrip('/').split('/')[-1])
                if wp_url_slug == wp_slug or wp_slug in wp_url_slug:
                    return dn

        # Prova match per numero progressivo nel titolo
        num_m = re.search(r'\b(\d+)\b', wp_title)
        if num_m:
            num = num_m.group(1)
            for dn in directus_numeri:
                if re.search(r'\b' + num + r'\b', dn['id_numero']):
                    return dn

        return None

    # 3. Processa
    print("\n[3/3] Elaborazione ...")
    log = []
    ok = 0
    skipped = 0
    no_match = 0
    no_sommario = 0

    items = wp_numeri
    if args.limit:
        items = items[:args.limit]

    for wp_item in items:
        pc = wp_item.get('post_content') or ''
        slug = wp_item.get('slug', '')

        if 'Sommario' not in pc:
            no_sommario += 1
            log.append({'slug': slug, 'status': 'no_sommario'})
            continue

        sommario_html = extract_sommario(pc)
        if not sommario_html:
            no_sommario += 1
            log.append({'slug': slug, 'status': 'parse_failed'})
            continue

        # Trova corrispondente in Directus
        directus_item = find_directus_match(wp_item)
        if not directus_item:
            no_match += 1
            log.append({'slug': slug, 'status': 'no_directus_match'})
            continue

        directus_id = directus_item['id']
        id_numero = directus_item['id_numero']

        # Già presente?
        if directus_item.get('descrizione'):
            skipped += 1
            log.append({'slug': slug, 'id_numero': id_numero, 'status': 'already_present'})
            continue

        entry = {
            'slug': slug,
            'id_numero': id_numero,
            'directus_id': directus_id,
            'sommario_preview': sommario_html[:120],
            'sommario_length': len(sommario_html),
            'status': 'dry_run' if args.dry_run else 'patched',
        }

        print(f"  {id_numero}: {len(sommario_html)} chars" + (' [DRY]' if args.dry_run else ''))

        if not args.dry_run:
            try:
                directus_patch(directus_id, {"descrizione": sommario_html})
                ok += 1
                time.sleep(0.05)
            except Exception as e:
                entry['status'] = 'error'
                entry['error'] = str(e)
                print(f"    ERROR: {e}")
        else:
            ok += 1

        log.append(entry)

    # Salva log
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(log, f, ensure_ascii=False, indent=2)

    print(f"\nCompletato:")
    print(f"  Patchati:        {ok}")
    print(f"  Già presenti:    {skipped}")
    print(f"  Senza sommario:  {no_sommario}")
    print(f"  Senza match:     {no_match}")
    print(f"  Log: {LOG_PATH}")


if __name__ == "__main__":
    main()
