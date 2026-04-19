#!/usr/bin/env python3
"""
investigate_en_articles.py — Analisi stato articoli EN in Directus.

Verifica scope dei bug noti:
  Bug 1: categoria_menu sbagliata (tutti "Attualità"?)
  Bug 2: slug EN identico allo slug IT counterpart
  Bug 3: data_pubblicazione null sugli EN
  Bug 7: tag assenti sugli EN

Uso:
    python investigate_en_articles.py
    python investigate_en_articles.py --sample 5
"""

import io, json, os, ssl, sys, urllib.parse, urllib.request
import argparse
from collections import Counter

if hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

DIRECTUS_URL = os.environ.get("DIRECTUS_URL", "https://cms.ombreeluci.it")
DIRECTUS_TOKEN = os.environ.get("DIRECTUS_TOKEN", "")

_SSL_CTX = ssl.create_default_context()
_SSL_CTX.check_hostname = False
_SSL_CTX.verify_mode = ssl.CERT_NONE

def _get(path):
    url = f"{DIRECTUS_URL}{path}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {DIRECTUS_TOKEN}",
        "User-Agent": "OEL-Investigate/1.0",
    })
    with urllib.request.urlopen(req, context=_SSL_CTX, timeout=30) as r:
        return json.loads(r.read())

def fetch_all_en(fields, page_size=500):
    """Fetcha tutti gli articoli EN paginando."""
    articles, page = [], 1
    while True:
        params = urllib.parse.urlencode({
            "filter[lang][_eq]": "en",
            "filter[stato][_eq]": "published",
            "fields": fields,
            "limit": page_size,
            "page": page,
        })
        batch = _get(f"/items/articoli?{params}").get("data", [])
        if not batch:
            break
        articles.extend(batch)
        print(f"  Caricati {len(articles)} articoli EN...", end="\r")
        if len(batch) < page_size:
            break
        page += 1
    print()
    return articles

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample", type=int, default=5,
                        help="Quanti articoli mostrare come sample per ogni anomalia")
    args = parser.parse_args()

    if not DIRECTUS_TOKEN:
        print("ERROR: DIRECTUS_TOKEN mancante"); sys.exit(1)

    print("=== FETCH articoli EN ===")
    fields = (
        "id,slug,lang,titolo,categoria_menu,forma,tema_label,"
        "data_pubblicazione,"
        "tags.tags_id.id,"
        "articolo_traduzione.id,articolo_traduzione.slug,articolo_traduzione.lang"
    )
    en_articles = fetch_all_en(fields)
    total = len(en_articles)
    print(f"Totale articoli EN: {total}\n")

    # ── Bug 1: distribuzione categoria_menu ──────────────────────────────────
    print("=== BUG 1: distribuzione categoria_menu ===")
    cat_counter = Counter(a.get("categoria_menu") or "(null)" for a in en_articles)
    for cat, count in cat_counter.most_common():
        pct = count / total * 100
        print(f"  {cat!r:40s} {count:5d} ({pct:.1f}%)")

    # ── Bug 3: data_pubblicazione null ────────────────────────────────────────
    print("\n=== BUG 3: data_pubblicazione ===")
    null_date = [a for a in en_articles if not a.get("data_pubblicazione")]
    print(f"  data_pubblicazione null/vuota: {len(null_date)} / {total} ({len(null_date)/total*100:.1f}%)")
    if null_date:
        print(f"  Sample (max {args.sample}):")
        for a in null_date[:args.sample]:
            it_slug = (a.get("articolo_traduzione") or {}).get("slug", "(no counterpart)")
            print(f"    EN slug={a['slug']} | IT slug={it_slug}")

    # ── Bug 7: tag assenti ────────────────────────────────────────────────────
    print("\n=== BUG 7: tag assenti ===")
    no_tags = [a for a in en_articles if not (a.get("tags") or [])]
    with_tags = total - len(no_tags)
    print(f"  Senza tag: {len(no_tags)} / {total} ({len(no_tags)/total*100:.1f}%)")
    print(f"  Con almeno 1 tag: {with_tags}")

    # ── Bug 2: slug EN identico a slug IT counterpart ─────────────────────────
    print("\n=== BUG 2: slug EN = slug IT ===")
    slug_it_match = []
    for a in en_articles:
        it_slug = (a.get("articolo_traduzione") or {}).get("slug")
        if it_slug and a["slug"] == it_slug:
            slug_it_match.append(a)
        # Anche: slug EN termina in -en (vecchio schema, ora non dovrebbe)
    print(f"  EN slug identico all'IT: {len(slug_it_match)} / {total}")
    if slug_it_match:
        print(f"  Sample (max {args.sample}):")
        for a in slug_it_match[:args.sample]:
            it_slug = (a.get("articolo_traduzione") or {}).get("slug", "?")
            print(f"    {a['slug']} (IT: {it_slug})")

    # ── Bug 2b: slug EN termina in -en (vecchio schema) ──────────────────────
    old_en_suffix = [a for a in en_articles if a["slug"].endswith("-en")]
    print(f"\n  EN slug termina in '-en' (vecchio schema): {len(old_en_suffix)}")

    # ── Summary ──────────────────────────────────────────────────────────────
    print("\n=== RIEPILOGO ===")
    print(f"  Totale articoli EN:          {total}")
    print(f"  Bug 1 (categoria Attualità): {cat_counter.get('Attualità', 0)} ({cat_counter.get('Attualità', 0)/total*100:.1f}%)")
    print(f"  Bug 3 (data null):           {len(null_date)} ({len(null_date)/total*100:.1f}%)")
    print(f"  Bug 7 (senza tag):           {len(no_tags)} ({len(no_tags)/total*100:.1f}%)")
    print(f"  Bug 2 (slug=IT):             {len(slug_it_match)}")
    print(f"  Bug 2b (slug -en):           {len(old_en_suffix)}")

if __name__ == "__main__":
    main()
