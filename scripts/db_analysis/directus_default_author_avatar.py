#!/usr/bin/env python3
"""
Carica public/images/avatar-default.svg in Directus e imposta autori.foto dove mancante.

Così l'admin Directus mostra l'avatar neutro come qualsiasi altro file (interfaccia file-image).

Uso:
  export DIRECTUS_URL=https://cms.example.com
  export DIRECTUS_TOKEN=...
  python scripts/db_analysis/directus_default_author_avatar.py
  python scripts/db_analysis/directus_default_author_avatar.py --dry-run
  python scripts/db_analysis/directus_default_author_avatar.py --set-field-default
  python scripts/db_analysis/directus_default_author_avatar.py --file-id f83696b3-bdcf-4212-bfe9-1d1da30096a4
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent.parent
SVG_PATH = ROOT / "public" / "images" / "avatar-default.svg"

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "").rstrip("/")
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "")


def _headers_json() -> dict:
    return {
        "Authorization": f"Bearer {DIRECTUS_TOKEN}",
        "Content-Type": "application/json",
    }


def _headers_bearer() -> dict:
    return {"Authorization": f"Bearer {DIRECTUS_TOKEN}"}


def verify_file_id(session: requests.Session, file_id: str) -> None:
    r = session.get(
        f"{DIRECTUS_URL}/files/{file_id}",
        headers=_headers_bearer(),
        timeout=60,
    )
    if r.status_code >= 400:
        raise RuntimeError(f"File id non valido o non accessibile: {file_id} ({r.status_code})")


def find_existing_file_id(session: requests.Session) -> str | None:
    r = session.get(
        f"{DIRECTUS_URL}/files",
        params={
            "filter[filename_download][_eq]": "avatar-default.svg",
            "limit": 1,
        },
        headers=_headers_bearer(),
        timeout=60,
    )
    r.raise_for_status()
    data = r.json().get("data") or []
    if not data:
        return None
    return data[0]["id"]


def upload_svg(session: requests.Session) -> str:
    if not SVG_PATH.is_file():
        raise FileNotFoundError(f"Manca {SVG_PATH}")
    content = SVG_PATH.read_bytes()
    files = {"file": ("avatar-default.svg", content, "image/svg+xml")}
    data = {"title": "Avatar default autori"}
    r = session.post(
        f"{DIRECTUS_URL}/files",
        headers=_headers_bearer(),
        files=files,
        data=data,
        timeout=120,
    )
    r.raise_for_status()
    return r.json()["data"]["id"]


def fetch_autori_senza_foto(session: requests.Session) -> list[dict]:
    r = session.get(
        f"{DIRECTUS_URL}/items/autori",
        params={
            "filter[foto][_null]": "true",
            "fields": "id,slug,nome_completo",
            "limit": -1,
        },
        headers=_headers_bearer(),
        timeout=120,
    )
    r.raise_for_status()
    return r.json().get("data") or []


def patch_autore_foto(session: requests.Session, autore_id: str, file_id: str) -> None:
    r = session.patch(
        f"{DIRECTUS_URL}/items/autori/{autore_id}",
        headers=_headers_json(),
        json={"foto": file_id},
        timeout=60,
    )
    r.raise_for_status()


def set_field_default(session: requests.Session, file_id: str) -> None:
    """Prova a impostare default su autori.foto per i nuovi record (se supportato dall'istanza)."""
    r = session.patch(
        f"{DIRECTUS_URL}/fields/autori/foto",
        headers=_headers_json(),
        json={"schema": {"default_value": file_id}},
        timeout=60,
    )
    if r.status_code >= 400:
        raise RuntimeError(f"PATCH fields/autori/foto fallita: {r.status_code} {r.text}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Avatar default autori in Directus")
    parser.add_argument("--dry-run", action="store_true", help="Solo log, nessuna scrittura")
    parser.add_argument(
        "--set-field-default",
        action="store_true",
        help="Imposta default_value sul campo autori.foto (opzionale, dipende da Directus/DB)",
    )
    parser.add_argument(
        "--file-id",
        metavar="UUID",
        help="UUID gia caricato in directus_files (salta upload e ricerca per nome file)",
    )
    args = parser.parse_args()

    if not DIRECTUS_URL or not DIRECTUS_TOKEN:
        print("Imposta DIRECTUS_URL e DIRECTUS_TOKEN.", file=sys.stderr)
        return 1

    session = requests.Session()

    if args.file_id:
        file_id = args.file_id.strip()
        if not args.dry_run:
            verify_file_id(session, file_id)
        print(f"Uso file Directus esplicito: {file_id}")
    else:
        existing = find_existing_file_id(session)
        if existing:
            file_id = existing
            print(f"File esistente avatar-default.svg -> id {file_id}")
        elif args.dry_run:
            print("[dry-run] Avrei caricato avatar-default.svg (nessun file trovato per filename)")
            file_id = ""
        else:
            file_id = upload_svg(session)
            print(f"Caricato avatar-default.svg -> id {file_id}")

    if args.set_field_default and not args.dry_run and file_id:
        try:
            set_field_default(session, file_id)
            print("Default campo autori.foto aggiornato.")
        except Exception as e:
            print(f"Avviso: impostazione default campo fallita ({e}). Backfill autori resta valido.", file=sys.stderr)

    rows = fetch_autori_senza_foto(session)
    print(f"Autori senza foto: {len(rows)}")

    if args.dry_run:
        if file_id:
            print(f"[dry-run] Avrei aggiornato {len(rows)} autori con foto={file_id}")
        return 0

    if not file_id:
        print("Nessun file_id disponibile (caricamento saltato).", file=sys.stderr)
        return 1

    for i, row in enumerate(rows):
        aid = row["id"]
        patch_autore_foto(session, aid, file_id)
        if (i + 1) % 50 == 0:
            time.sleep(0.05)
    print(f"Aggiornati {len(rows)} autori con foto = {file_id}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
