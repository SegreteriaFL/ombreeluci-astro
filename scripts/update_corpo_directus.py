#!/usr/bin/env python3
"""
scripts/update_corpo_directus.py

Aggiorna il campo `corpo` degli articoli in Directus con l'HTML pulito
estratto da articoli_wp_puliti.json.

Match: articolo Directus.wp_id == articolo JSON.wp_id

Input:  scripts/db_analysis/output/articoli_wp_puliti.json
Output: PATCH /items/articoli/{id} per ogni articolo

Variabili d'ambiente (.env):
  DIRECTUS_URL    default: http://159.69.196.64:8055
  DIRECTUS_TOKEN  richiesto

Uso:
  pip install requests python-dotenv tqdm
  python3 scripts/update_corpo_directus.py --dry-run
  python3 scripts/update_corpo_directus.py
  python3 scripts/update_corpo_directus.py --limit 20
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("Installa requests: pip install requests")

try:
    from tqdm import tqdm
except ImportError:
    sys.exit("Installa tqdm: pip install tqdm")

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = ROOT / "scripts" / "db_analysis" / "output" / "articoli_wp_puliti.json"

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "http://159.69.196.64:8055")
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "")
MIN_BODY_LEN = 50


def directus_headers():
    return {
        "Authorization": f"Bearer {DIRECTUS_TOKEN}",
        "Content-Type": "application/json",
    }


def get_all_directus_wp_ids() -> dict[int, str]:
    """Restituisce {wp_id: directus_uuid} per tutti gli articoli."""
    print("Recupero lista articoli da Directus...")
    url = f"{DIRECTUS_URL}/items/articoli"
    params = {"fields": "id,wp_id", "limit": -1}
    r = requests.get(url, headers=directus_headers(), params=params, timeout=60)
    r.raise_for_status()
    items = r.json().get("data", [])
    result = {}
    for item in items:
        wp_id = item.get("wp_id")
        uuid = item.get("id")
        if wp_id and uuid:
            result[int(wp_id)] = uuid
    print(f"  -> {len(result)} articoli trovati su Directus")
    return result


def patch_corpo(directus_id: str, corpo: str, dry_run: bool) -> bool:
    if dry_run:
        return True
    url = f"{DIRECTUS_URL}/items/articoli/{directus_id}"
    r = requests.patch(
        url,
        headers=directus_headers(),
        json={"corpo": corpo},
        timeout=30,
    )
    return r.ok


def main():
    parser = argparse.ArgumentParser(description="Aggiorna corpo articoli Directus da JSON")
    parser.add_argument("--dry-run", action="store_true", help="Simula senza PATCH")
    parser.add_argument("--limit", type=int, default=0, help="Limita a N articoli")
    parser.add_argument("--delay", type=int, default=50, help="Delay tra richieste in ms")
    args = parser.parse_args()

    if not DIRECTUS_TOKEN:
        sys.exit("DIRECTUS_TOKEN mancante")

    # Carica JSON
    print(f"Carico {JSON_PATH}...")
    with open(JSON_PATH, encoding="utf-8") as f:
        articles_json = json.load(f)
    print(f"  -> {len(articles_json)} articoli nel JSON")

    # Indice per wp_id
    by_wp_id = {}
    for a in articles_json:
        wp_id = a.get("wp_id")
        html = (a.get("html_body") or "").strip()
        if wp_id and len(html) >= MIN_BODY_LEN:
            by_wp_id[int(wp_id)] = html
    print(f"  -> {len(by_wp_id)} articoli con html_body >= {MIN_BODY_LEN} char")

    # Mappa Directus wp_id -> uuid
    directus_map = get_all_directus_wp_ids()

    # Costruisce lista da aggiornare
    to_update = []
    for wp_id, html in by_wp_id.items():
        uuid = directus_map.get(wp_id)
        if uuid:
            to_update.append((uuid, wp_id, html))

    print(f"\nArticoli da aggiornare: {len(to_update)}")
    missing = len(by_wp_id) - len(to_update)
    if missing:
        print(f"  (wp_id non trovati su Directus: {missing})")

    if args.limit > 0:
        to_update = to_update[:args.limit]
        print(f"  Limitato a {args.limit} (--limit)")

    if args.dry_run:
        print("\n[DRY-RUN] Nessun PATCH inviato.")
        print(f"Verrebbero aggiornati: {len(to_update)} articoli")
        if to_update:
            uuid, wp_id, html = to_update[0]
            print(f"\nEsempio primo articolo (wp_id={wp_id}, uuid={uuid}):")
            print(f"  html_body[:200]: {html[:200]}")
        return

    delay_s = args.delay / 1000.0
    ok = err = 0

    for uuid, wp_id, html in tqdm(to_update, desc="PATCH articoli", unit="art"):
        success = patch_corpo(uuid, html, dry_run=False)
        if success:
            ok += 1
        else:
            err += 1
            print(f"\n  ERRORE PATCH wp_id={wp_id} uuid={uuid}")
        if delay_s > 0:
            time.sleep(delay_s)

    print(f"\n{'='*50}")
    print(f"RIEPILOGO")
    print(f"{'='*50}")
    print(f"  Aggiornati OK : {ok}")
    print(f"  Errori        : {err}")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
