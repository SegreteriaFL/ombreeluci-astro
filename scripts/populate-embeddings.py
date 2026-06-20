#!/usr/bin/env python3
"""
scripts/populate-embeddings.py

Popola la colonna embedding in PostgreSQL (via Directus API) dagli embeddings
precomputati in embeddings_arricchiti.npy.

Mappa posizione->wp_id da articoli_semantici_FULL_2026.json,
poi wp_id->uuid da Directus API. PATCH ogni articolo con il vettore 3072-dim.

Uso:
    DIRECTUS_URL=https://cms.ombreeluci.it DIRECTUS_TOKEN=xxx python scripts/populate-embeddings.py
    python scripts/populate-embeddings.py --dry-run   # solo verifica, nessun PATCH
"""

import argparse
import json
import os
import ssl
import sys
import time
import urllib.request
import urllib.parse
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "scripts_and_data" / "datasets" / "articoli"

DIRECTUS_URL   = os.environ.get("DIRECTUS_URL", "https://cms.ombreeluci.it")
DIRECTUS_TOKEN = os.environ.get("DIRECTUS_TOKEN", "")
CTX = ssl.create_default_context()
HEADERS = {}


def api_get(path: str) -> dict:
    req = urllib.request.Request(
        f"{DIRECTUS_URL}{path}",
        headers=HEADERS,
    )
    with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
        return json.loads(r.read())


def api_patch(path: str, data: dict) -> dict:
    body = json.dumps(data).encode()
    req = urllib.request.Request(
        f"{DIRECTUS_URL}{path}",
        data=body,
        headers={**HEADERS, "Content-Type": "application/json"},
        method="PATCH",
    )
    with urllib.request.urlopen(req, timeout=60, context=CTX) as r:
        return json.loads(r.read())


def fetch_wpid_to_uuid() -> dict[int, str]:
    """Fetch wp_id -> Directus UUID per articoli IT."""
    results = []
    offset = 0
    while True:
        params = urllib.parse.urlencode({
            "fields": "id,wp_id",
            "filter[lang][_eq]": "it",
            "filter[wp_id][_nnull]": "true",
            "limit": 500,
            "offset": offset,
        })
        data = api_get(f"/items/articoli?{params}")
        batch = data["data"]
        results.extend(batch)
        print(f"  Fetched {len(results)} articoli...", end="\r")
        if len(batch) < 500:
            break
        offset += 500
    print(f"  Fetched {len(results)} articoli IT con wp_id")
    return {a["wp_id"]: a["id"] for a in results if a.get("wp_id")}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--batch-size", type=int, default=20)
    args = parser.parse_args()

    if not DIRECTUS_TOKEN:
        print("[ERROR] DIRECTUS_TOKEN non impostato")
        sys.exit(1)

    global HEADERS
    HEADERS = {
        "Authorization": f"Bearer {DIRECTUS_TOKEN}",
        "User-Agent": "oel-populate-embeddings/1.0",
    }

    # 1. Carica embeddings
    emb = np.load(DATA / "embeddings_arricchiti.npy")
    print(f"Embeddings: {emb.shape}")

    # 2. Carica mappa posizione -> wp_id
    with open(DATA / "articoli_semantici_FULL_2026.json", encoding="utf-8") as f:
        sem = json.load(f)
    assert len(sem) == emb.shape[0], f"Mismatch: sem={len(sem)}, emb={emb.shape[0]}"

    wp_ids = [art["id"] for art in sem]
    print(f"Articoli nel dataset: {len(wp_ids)}")

    # 3. Fetch wp_id -> UUID da Directus
    print("Fetch wp_id -> UUID da Directus...")
    wpid_to_uuid = fetch_wpid_to_uuid()
    print(f"Mappati: {len(wpid_to_uuid)}")

    # 4. Costruisci lista di (uuid, embedding)
    to_update = []
    skipped = 0
    for i, wp_id in enumerate(wp_ids):
        uuid = wpid_to_uuid.get(wp_id)
        if not uuid:
            skipped += 1
            continue
        to_update.append((uuid, emb[i]))

    print(f"Da aggiornare: {len(to_update)} | Senza UUID: {skipped}")

    if args.dry_run:
        print("[DRY RUN] Nessun PATCH eseguito.")
        return

    # 5. PATCH in batch
    updated = 0
    errors = 0
    start = time.time()

    for i in range(0, len(to_update), args.batch_size):
        batch = to_update[i:i + args.batch_size]

        for uuid, vec in batch:
            vec_str = "[" + ",".join(f"{v:.8f}" for v in vec) + "]"
            try:
                api_patch(
                    f"/items/articoli/{uuid}?fields=id",
                    {"embedding": vec_str}
                )
                updated += 1
            except Exception as e:
                errors += 1
                if errors <= 3:
                    print(f"  [ERROR] {uuid}: {e}")

        elapsed = time.time() - start
        rate = updated / elapsed if elapsed > 0 else 0
        eta = (len(to_update) - updated - errors) / rate if rate > 0 else 0
        print(f"  {updated + errors}/{len(to_update)} | OK: {updated} | ERR: {errors} | {rate:.1f}/s | ETA: {eta/60:.0f}min", end="\r")

        time.sleep(0.5)

    print(f"\n\nDone: {updated} updated, {errors} errors, {time.time()-start:.0f}s")


if __name__ == "__main__":
    main()
