#!/usr/bin/env python3
"""
Sincronizza su Directus i campi calcolati degli autori:
  articoli_count, articoli_it_count, articoli_en_count

Fonte: conteggio reale degli articoli in Directus (M2O autore + lang).

L'import iniziale (`import_to_directus.py`) non li popola: restano null finché non
esegui questo script (o un Flow). Ripeti dopo import massivi o cancellazioni.

  python scripts/db_analysis/sync_autori_articoli_counts.py
  python scripts/db_analysis/sync_autori_articoli_counts.py --dry-run

Variabili:
  DIRECTUS_URL (default: http://159.69.196.64:8055)
  DIRECTUS_TOKEN oppure DIRECTUS_EMAIL + DIRECTUS_PASSWORD (login; utile se il token statico è scaduto).
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from collections import defaultdict

import requests

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "http://159.69.196.64:8055").rstrip("/")


def login_token(url: str, email: str, password: str) -> str:
    r = requests.post(
        f"{url}/auth/login",
        json={"email": email, "password": password},
        timeout=120,
    )
    r.raise_for_status()
    return r.json()["data"]["access_token"]


def resolve_token(url: str) -> str:
    t = os.getenv("DIRECTUS_TOKEN", "").strip()
    email = os.getenv("DIRECTUS_EMAIL", "").strip()
    password = os.getenv("DIRECTUS_PASSWORD", "").strip()
    if t:
        return t
    if email and password:
        return login_token(url, email, password)
    print(
        "Imposta DIRECTUS_TOKEN oppure DIRECTUS_EMAIL + DIRECTUS_PASSWORD.",
        file=sys.stderr,
    )
    sys.exit(1)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not DIRECTUS_URL:
        print("Imposta DIRECTUS_URL.", file=sys.stderr)
        return 1

    token = resolve_token(DIRECTUS_URL)
    email = os.getenv("DIRECTUS_EMAIL", "").strip()
    password = os.getenv("DIRECTUS_PASSWORD", "").strip()

    def headers() -> dict[str, str]:
        return {"Authorization": f"Bearer {token}"}

    h = {**headers(), "Content-Type": "application/json"}

    r = requests.get(
        f"{DIRECTUS_URL}/items/articoli",
        params={"fields": "autore,lang", "limit": -1},
        headers=headers(),
        timeout=300,
    )
    if r.status_code == 401 and email and password:
        token = login_token(DIRECTUS_URL, email, password)
        h = {**headers(), "Content-Type": "application/json"}
        r = requests.get(
            f"{DIRECTUS_URL}/items/articoli",
            params={"fields": "autore,lang", "limit": -1},
            headers=headers(),
            timeout=300,
        )
    r.raise_for_status()
    articoli = r.json().get("data") or []

    # autore_id -> [total, it, en]
    acc: dict[str, list[int]] = defaultdict(lambda: [0, 0, 0])
    for row in articoli:
        aid = row.get("autore")
        if not aid:
            continue
        lang = (row.get("lang") or "it").lower()
        acc[aid][0] += 1
        if lang == "en":
            acc[aid][2] += 1
        else:
            acc[aid][1] += 1

    r2 = requests.get(
        f"{DIRECTUS_URL}/items/autori",
        params={"fields": "id,slug", "limit": -1},
        headers=headers(),
        timeout=120,
    )
    r2.raise_for_status()
    autori = r2.json().get("data") or []

    print(f"Articoli letti: {len(articoli)} | Autori: {len(autori)} | Autori con almeno 1 articolo: {len(acc)}")

    if args.dry_run:
        sample = list(acc.items())[:5]
        for aid, (t, it, en) in sample:
            print(f"  es. {aid[:8]}... total={t} it={it} en={en}")
        return 0

    n = 0
    for row in autori:
        aid = row["id"]
        t, it_c, en_c = acc.get(aid, (0, 0, 0))
        body = {
            "articoli_count": t,
            "articoli_it_count": it_c,
            "articoli_en_count": en_c,
        }
        pr = requests.patch(
            f"{DIRECTUS_URL}/items/autori/{aid}",
            headers=h,
            json=body,
            timeout=60,
        )
        if not pr.ok:
            print(f"PATCH autori/{aid} -> {pr.status_code}: {pr.text[:200]}", file=sys.stderr)
            pr.raise_for_status()
        n += 1
        if n % 50 == 0:
            time.sleep(0.05)

    print(f"Aggiornati {n} autori.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
