#!/usr/bin/env python3
"""
populate_taxonomy_fields.py

Popola i campi taxonomy (categoria_menu, ruolo_editoriale, forma, tema_label)
su Directus /items/articoli a partire da _legacy_articoli_megacluster.json.

Utilizzo:
  python populate_taxonomy_fields.py [--dry-run] [--limit N] [--delay MS]

Opzioni:
  --dry-run    Mostra statistiche senza applicare nessun PATCH
  --limit N    Processa solo i primi N articoli trovati nel megacluster
  --delay MS   Pausa tra ogni PATCH in millisecondi (default: 50)
"""

import argparse
import json
import os
import sys
import time
import unicodedata
from collections import Counter
from pathlib import Path

import requests
from dotenv import load_dotenv

try:
    from tqdm import tqdm
    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False

# ── Config ─────────────────────────────────────────────────────────────────────

load_dotenv()

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "http://159.69.196.64:8055")
DIRECTUS_TOKEN = os.getenv(
    "DIRECTUS_TOKEN",
    "nBZ6kdd0YgVnhLm2TZEDoT9A-NJujwVU",
)

MEGACLUSTER_PATH = Path(__file__).parents[2] / "src" / "data" / "_legacy_articoli_megacluster.json"

TAXONOMY_FIELDS = ["categoria_menu", "ruolo_editoriale", "forma", "tema_label"]

# ── Helpers ────────────────────────────────────────────────────────────────────

session = requests.Session()
session.headers.update({
    "Authorization": f"Bearer {DIRECTUS_TOKEN}",
    "Content-Type": "application/json",
})


def load_megacluster() -> dict:
    with open(MEGACLUSTER_PATH, encoding="utf-8") as f:
        data = json.load(f)
    return data.get("byId", {})


def fetch_all_articoli_ids() -> dict[str, str]:
    """Ritorna mappa wp_id (str) → uuid Directus."""
    print("Carico wp_id -> uuid da Directus...")
    url = f"{DIRECTUS_URL}/items/articoli"
    params = {"fields": "id,wp_id", "limit": -1}
    r = session.get(url, params=params, timeout=60)
    r.raise_for_status()
    items = r.json().get("data", [])
    mapping = {}
    for item in items:
        if item.get("wp_id") is not None:
            mapping[str(item["wp_id"])] = item["id"]
    print(f"  -> {len(mapping)} articoli caricati da Directus")
    return mapping


def patch_articolo(uuid: str, payload: dict) -> bool:
    url = f"{DIRECTUS_URL}/items/articoli/{uuid}"
    r = session.patch(url, json=payload, timeout=30)
    if not r.ok:
        print(f"  ERRORE {r.status_code} per uuid={uuid}: {r.text[:200]}", file=sys.stderr)
        return False
    return True


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Popola campi taxonomy su Directus")
    parser.add_argument("--dry-run", action="store_true", help="Solo statistiche, nessun PATCH")
    parser.add_argument("--limit", type=int, default=0, help="Limita il numero di articoli processati")
    parser.add_argument("--delay", type=int, default=50, help="Pausa tra PATCH in millisecondi (default: 50)")
    args = parser.parse_args()

    # Carica megacluster
    by_id = load_megacluster()
    print(f"Megacluster: {len(by_id)} voci")

    # Statistiche distribuzione
    cat_counter = Counter()
    ruolo_counter = Counter()
    forma_counter = Counter()
    tema_counter = Counter()
    has_any = 0

    for wp_id, item in by_id.items():
        vals = {f: item.get(f) for f in TAXONOMY_FIELDS}
        if any(v for v in vals.values()):
            has_any += 1
        if vals["categoria_menu"]:
            cat_counter[vals["categoria_menu"]] += 1
        if vals["ruolo_editoriale"]:
            ruolo_counter[vals["ruolo_editoriale"]] += 1
        if vals["forma"]:
            forma_counter[vals["forma"]] += 1
        if vals["tema_label"]:
            tema_counter[vals["tema_label"]] += 1

    print(f"\nArticoli con almeno un campo taxonomy valorizzato: {has_any}/{len(by_id)}")
    print(f"\nDistribuzione categoria_menu (top 10):")
    for val, cnt in cat_counter.most_common(10):
        print(f"  {val!r:40s} {cnt:5d}")
    print(f"\nDistribuzione ruolo_editoriale:")
    for val, cnt in ruolo_counter.most_common():
        print(f"  {val!r:20s} {cnt:5d}")
    print(f"\nDistribuzione forma:")
    for val, cnt in forma_counter.most_common():
        print(f"  {val!r:30s} {cnt:5d}")
    print(f"\nDistribuzione tema_label ({len(tema_counter)} valori unici):")
    for val, cnt in tema_counter.most_common():
        print(f"  {val!r:60s} {cnt:5d}")

    if args.dry_run:
        print("\n[DRY-RUN] Nessun PATCH eseguito.")
        return

    # Carica mapping wp_id → uuid
    wp_to_uuid = fetch_all_articoli_ids()

    # Prepara lista da processare
    entries = list(by_id.items())
    if args.limit > 0:
        entries = entries[: args.limit]
        print(f"\nLimite attivo: processo solo {args.limit} articoli")

    print(f"\nInizio PATCH di {len(entries)} articoli…")

    ok = 0
    skipped_no_uuid = 0
    skipped_all_null = 0
    errors = 0
    delay_s = args.delay / 1000.0

    iterator = tqdm(entries) if HAS_TQDM else entries

    for wp_id, item in iterator:
        uuid = wp_to_uuid.get(str(wp_id))
        if not uuid:
            skipped_no_uuid += 1
            continue

        payload = {
            f: item.get(f) or None
            for f in TAXONOMY_FIELDS
        }
        if all(v is None for v in payload.values()):
            skipped_all_null += 1
            continue

        success = patch_articolo(uuid, payload)
        if success:
            ok += 1
        else:
            errors += 1

        if delay_s > 0:
            time.sleep(delay_s)

    print(f"\n{'─'*50}")
    print(f"PATCH completati con successo : {ok}")
    print(f"Saltati (wp_id non in Directus): {skipped_no_uuid}")
    print(f"Saltati (tutti null)            : {skipped_all_null}")
    print(f"Errori                          : {errors}")
    print(f"{'─'*50}")


if __name__ == "__main__":
    main()
