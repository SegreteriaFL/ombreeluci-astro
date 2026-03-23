#!/usr/bin/env python3
"""
scripts/db_analysis/import_m2m_relationships.py

Importa le relazioni M2M articoli↔temi e articoli↔tags in Directus.

Input:
  scripts/db_analysis/output/term_relationships_wp.json

Uso:
  python3 scripts/db_analysis/import_m2m_relationships.py
  python3 scripts/db_analysis/import_m2m_relationships.py --dry-run
  python3 scripts/db_analysis/import_m2m_relationships.py --limit 100 --delay 50

Variabili d'ambiente:
  DIRECTUS_URL    (default: http://159.69.196.64:8055)
  DIRECTUS_TOKEN  (obbligatorio)
"""

import argparse
import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import requests
try:
    from tqdm import tqdm
except ImportError:
    sys.exit("Installa tqdm: pip install tqdm")

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv opzionale

# ── Paths ──────────────────────────────────────────────────────────────────────
ROOT        = Path(__file__).resolve().parent.parent.parent
INPUT_FILE  = ROOT / "scripts" / "db_analysis" / "output" / "term_relationships_wp.json"
LOGS_DIR    = ROOT / "scripts" / "db_analysis" / "logs"

DIRECTUS_URL   = os.getenv("DIRECTUS_URL",   "http://159.69.196.64:8055")
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "nBZ6kdd0YgVnhLm2TZEDoT9A-NJujwVU")

MAX_RETRIES    = 3
RETRY_DELAYS   = [1, 2, 4]   # secondi


# ── Logging ───────────────────────────────────────────────────────────────────

def setup_logging(dry_run=False):
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    ts      = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix  = "_dryrun" if dry_run else ""
    logfile = LOGS_DIR / f"import_m2m_{ts}{suffix}.log"

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)-8s %(message)s',
        handlers=[
            logging.FileHandler(logfile, encoding='utf-8'),
            logging.StreamHandler(sys.stdout),
        ]
    )
    logging.info(f"Log: {logfile}")
    return logfile


# ── Directus API ──────────────────────────────────────────────────────────────

def headers():
    return {
        "Authorization": f"Bearer {DIRECTUS_TOKEN}",
        "Content-Type":  "application/json",
    }


def api_get(path, params=None):
    url = f"{DIRECTUS_URL}{path}"
    for attempt in range(MAX_RETRIES):
        try:
            r = requests.get(url, headers=headers(), params=params, timeout=30)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                delay = RETRY_DELAYS[attempt]
                logging.warning(f"GET {path} fallito (tentativo {attempt+1}), retry in {delay}s: {e}")
                time.sleep(delay)
            else:
                raise


def api_post(path, payload, dry_run=False):
    if dry_run:
        return {"data": {"id": "dry-run"}}
    url = f"{DIRECTUS_URL}{path}"
    for attempt in range(MAX_RETRIES):
        try:
            r = requests.post(url, headers=headers(), json=payload, timeout=30)
            r.raise_for_status()
            return r.json()
        except requests.exceptions.HTTPError as e:
            if r.status_code == 400:
                # Conflitto duplicato — non ritentare
                raise
            if attempt < MAX_RETRIES - 1:
                delay = RETRY_DELAYS[attempt]
                logging.warning(f"POST {path} fallito (tentativo {attempt+1}), retry in {delay}s: {e}")
                time.sleep(delay)
            else:
                raise
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                delay = RETRY_DELAYS[attempt]
                logging.warning(f"POST {path} errore (tentativo {attempt+1}), retry in {delay}s: {e}")
                time.sleep(delay)
            else:
                raise


# ── Prerequisiti ──────────────────────────────────────────────────────────────

def check_prerequisites():
    checks = [
        ("/items/articoli?limit=1", "articoli"),
        ("/items/temi?limit=1",     "temi"),
        ("/items/tags?limit=1",     "tags"),
    ]
    for path, name in checks:
        try:
            d = api_get(path)
            if 'data' not in d:
                sys.exit(f"ERRORE prerequisito: {name} non risponde correttamente")
            logging.info(f"  ✓ {name} raggiungibile")
        except Exception as e:
            sys.exit(f"ERRORE prerequisito: impossibile raggiungere {name}: {e}")


# ── Lookup maps ───────────────────────────────────────────────────────────────

def build_articoli_map():
    """wp_id (int) → directus_uuid"""
    logging.info("Carico mappa articoli (wp_id → uuid) ...")
    d = api_get("/items/articoli", {"fields": "id,wp_id", "limit": -1})
    m = {}
    for item in d.get('data', []):
        wp_id = item.get('wp_id')
        if wp_id is not None:
            m[int(wp_id)] = item['id']
    logging.info(f"  → {len(m)} articoli mappati")
    return m


def build_slug_map(collection):
    """slug (str) → directus_uuid"""
    logging.info(f"Carico mappa {collection} (slug → uuid) ...")
    d = api_get(f"/items/{collection}", {"fields": "id,slug", "limit": -1})
    m = {item['slug']: item['id'] for item in d.get('data', []) if item.get('slug')}
    logging.info(f"  → {len(m)} {collection} mappati")
    return m


def load_existing_junction(collection, field_a, field_b):
    """Carica coppie esistenti come set di tuple (uuid_a, uuid_b)."""
    logging.info(f"Carico coppie esistenti in {collection} ...")
    d = api_get(f"/items/{collection}", {"fields": f"{field_a},{field_b}", "limit": -1})
    s = set()
    for item in d.get('data', []):
        a = item.get(field_a)
        b = item.get(field_b)
        if a and b:
            s.add((a, b))
    logging.info(f"  → {len(s)} coppie già presenti")
    return s


# ── Import ────────────────────────────────────────────────────────────────────

def import_junction(records, junction_col, field_a, field_b,
                    map_a, map_b, existing_set,
                    key_a, key_b,
                    dry_run, delay_ms):
    """
    Importa un batch di relazioni in una junction table.

    records      : lista di dict con keys key_a (wp_id int) e key_b (slug str)
    junction_col : es. "articoli_temi"
    field_a/b    : nomi campi nella junction (es. "articoli_id", "temi_id")
    map_a/b      : dizionari di lookup
    existing_set : set di (uuid_a, uuid_b) già presenti
    key_a/b      : chiave di lookup in ogni record
    """
    created = skipped_dup = skipped_miss = errors = 0
    delay_s = delay_ms / 1000.0

    for rec in tqdm(records, desc=junction_col, unit="rel"):
        uuid_a = map_a.get(rec[key_a])
        uuid_b = map_b.get(rec[key_b])

        if uuid_a is None:
            logging.debug(f"  SKIP: {key_a}={rec[key_a]} non in mappa articoli")
            skipped_miss += 1
            continue
        if uuid_b is None:
            logging.debug(f"  SKIP: {key_b}={rec[key_b]} ({rec.get('name')}) non in mappa {junction_col}")
            skipped_miss += 1
            continue

        pair = (uuid_a, uuid_b)
        if pair in existing_set:
            skipped_dup += 1
            continue

        try:
            api_post(
                f"/items/{junction_col}",
                {field_a: uuid_a, field_b: uuid_b},
                dry_run=dry_run,
            )
            existing_set.add(pair)
            created += 1
        except Exception as e:
            logging.warning(f"  ERRORE POST {junction_col} ({uuid_a}, {uuid_b}): {e}")
            errors += 1

        if delay_s > 0:
            time.sleep(delay_s)

    return created, skipped_dup, skipped_miss, errors


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Importa relazioni M2M in Directus")
    parser.add_argument('--input',   default=str(INPUT_FILE))
    parser.add_argument('--dry-run', action='store_true', help='Simula senza scrivere')
    parser.add_argument('--limit',   type=int, default=0,  help='Limita N relazioni (0=tutto)')
    parser.add_argument('--delay',   type=int, default=30, help='Delay tra POST in ms (default 30)')
    args = parser.parse_args()

    logfile = setup_logging(args.dry_run)
    logging.info(f"{'[DRY-RUN] ' if args.dry_run else ''}Import M2M → Directus {DIRECTUS_URL}")

    # 1. Carica input
    input_path = Path(args.input)
    if not input_path.exists():
        sys.exit(f"ERRORE: file non trovato: {input_path}")
    with open(input_path, 'r', encoding='utf-8') as f:
        all_records = json.load(f)
    logging.info(f"Caricati {len(all_records)} record da {input_path}")

    if args.limit > 0:
        all_records = all_records[:args.limit]
        logging.info(f"Limitato a {len(all_records)} record (--limit {args.limit})")

    # 2. Prerequisiti
    logging.info("Verifica prerequisiti ...")
    check_prerequisites()

    # 3. Lookup maps
    articoli_map = build_articoli_map()
    temi_map     = build_slug_map("temi")
    tags_map     = build_slug_map("tags")

    # 4. Coppie esistenti nelle junction tables
    existing_temi = load_existing_junction("articoli_temi", "articoli_id", "temi_id")
    existing_tags = load_existing_junction("articoli_tags", "articoli_id", "tags_id")

    # 5. Separa categories e tags
    cat_records = [r for r in all_records if r['taxonomy'] == 'category']
    tag_records = [r for r in all_records if r['taxonomy'] == 'post_tag']
    logging.info(f"Relazioni da importare: {len(cat_records)} category, {len(tag_records)} post_tag")

    # 6. Import articoli↔temi
    logging.info(f"\n--- Import articoli_temi ---")
    c_cr, c_sd, c_sm, c_er = import_junction(
        records      = cat_records,
        junction_col = "articoli_temi",
        field_a      = "articoli_id",
        field_b      = "temi_id",
        map_a        = articoli_map,
        map_b        = temi_map,
        existing_set = existing_temi,
        key_a        = "object_id",
        key_b        = "slug",
        dry_run      = args.dry_run,
        delay_ms     = args.delay,
    )

    # 7. Import articoli↔tags
    logging.info(f"\n--- Import articoli_tags ---")
    t_cr, t_sd, t_sm, t_er = import_junction(
        records      = tag_records,
        junction_col = "articoli_tags",
        field_a      = "articoli_id",
        field_b      = "tags_id",
        map_a        = articoli_map,
        map_b        = tags_map,
        existing_set = existing_tags,
        key_a        = "object_id",
        key_b        = "slug",
        dry_run      = args.dry_run,
        delay_ms     = args.delay,
    )

    # 8. Riepilogo finale
    prefix = "[DRY-RUN] " if args.dry_run else ""
    logging.info(f"\n{'='*60}")
    logging.info(f"{prefix}RIEPILOGO IMPORT")
    logging.info(f"{'='*60}")
    logging.info(f"  articoli_temi  → Creati: {c_cr:>5} | Duplicati: {c_sd:>5} | Non trovati: {c_sm:>5} | Errori: {c_er:>5}")
    logging.info(f"  articoli_tags  → Creati: {t_cr:>5} | Duplicati: {t_sd:>5} | Non trovati: {t_sm:>5} | Errori: {t_er:>5}")
    logging.info(f"  TOTALE         → Creati: {c_cr+t_cr:>5} | Saltati: {c_sd+t_sd+c_sm+t_sm:>5} | Errori: {c_er+t_er:>5}")
    logging.info(f"{'='*60}")
    logging.info(f"Log completo: {logfile}")


if __name__ == '__main__':
    main()
