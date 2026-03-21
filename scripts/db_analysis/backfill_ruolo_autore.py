#!/usr/bin/env python3
"""
Imposta autori.ruolo_autore in Directus in base al numero di articoli (dump WP).

Regole:
  - >= 10 articoli con quell'author_id -> collaboratore
  - altrimenti -> contributore

Mapping Directus slug -> wp_id: slug in import coincide con login WordPress (`import_to_directus.py`);
fallback: confronto normalizzato (spazi -> trattino, lower).

Richiede: DIRECTUS_URL, DIRECTUS_TOKEN
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent.parent
DATA = ROOT / "scripts/db_analysis/output"

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "").rstrip("/")
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "")


def main() -> int:
    if not DIRECTUS_URL or not DIRECTUS_TOKEN:
        print("Imposta DIRECTUS_URL e DIRECTUS_TOKEN.", file=sys.stderr)
        return 1

    headers = {
        "Authorization": f"Bearer {DIRECTUS_TOKEN}",
        "Content-Type": "application/json",
    }

    with open(DATA / "autori_wp.json", encoding="utf-8") as f:
        autori_wp_list = json.load(f)
    login_to_wp = {a["login"]: a["wp_id"] for a in autori_wp_list}

    with open(DATA / "articoli_wp_puliti.json", encoding="utf-8") as f:
        articoli = json.load(f)

    count_per_autore: dict[int, int] = {}
    for art in articoli:
        aid = art.get("author_id")
        if aid is not None:
            aid = int(aid)
            count_per_autore[aid] = count_per_autore.get(aid, 0) + 1

    res = requests.get(
        f"{DIRECTUS_URL}/items/autori",
        params={"fields": "id,slug", "limit": -1},
        headers={"Authorization": f"Bearer {DIRECTUS_TOKEN}"},
        timeout=120,
    )
    res.raise_for_status()
    autori_directus = res.json()["data"]

    unmatched: list[str] = []
    aggiornati = collab = contr = 0

    for autore in autori_directus:
        slug = autore["slug"]
        wp_id = login_to_wp.get(slug)
        if wp_id is None:
            slug2 = slug.replace(" ", "-").lower()
            for a in autori_wp_list:
                if a["login"].replace(" ", "-").lower() == slug2:
                    wp_id = a["wp_id"]
                    break
        if wp_id is None:
            unmatched.append(slug)
            continue

        count = count_per_autore.get(wp_id, 0)
        ruolo = "collaboratore" if count >= 10 else "contributore"
        r = requests.patch(
            f"{DIRECTUS_URL}/items/autori/{autore['id']}",
            headers=headers,
            json={"ruolo_autore": ruolo},
            timeout=60,
        )
        r.raise_for_status()
        aggiornati += 1
        if ruolo == "collaboratore":
            collab += 1
        else:
            contr += 1

    print(
        f"Aggiornati: {aggiornati} (collaboratore={collab}, contributore={contr}); "
        f"senza mapping: {len(unmatched)}"
    )
    if unmatched:
        print("Slug senza match login WP (es.):", ", ".join(unmatched[:12]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
