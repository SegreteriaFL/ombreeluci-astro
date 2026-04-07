#!/usr/bin/env python3
"""
qa_check.py — QA automatica post-traduzione.

Verifica che ogni articolo EN del batch rispetti i criteri minimi di qualità.

Uso:
    python qa_check.py --job-id batch-2026-04
    python qa_check.py --job-id batch-2026-04 --fail-fast
"""

import argparse
import csv
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

DIRECTUS_URL = os.environ.get("DIRECTUS_URL", "https://cms.ombreeluci.it")
DIRECTUS_TOKEN = os.environ.get("DIRECTUS_TOKEN", "")
LOGS_DIR = Path(__file__).parent / "logs"

# Parole italiane comuni — se troppo presenti nel testo EN, la traduzione è sospetta
IT_WORDS = {"della", "dello", "degli", "delle", "nella", "nelle", "negli",
            "questo", "questa", "questi", "queste", "anche", "come", "perché",
            "però", "quindi", "oppure", "mentre", "quando", "dove", "essere",
            "avere", "fare", "dire", "andare", "molto", "tutto", "tutti"}

def _headers():
    return {"Authorization": f"Bearer {DIRECTUS_TOKEN}"}

def directus_get(path):
    req = urllib.request.Request(f"{DIRECTUS_URL}{path}", headers=_headers())
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

def strip_html(text):
    return re.sub(r"<[^>]+>", " ", text or "").strip()

def count_html_tags(text):
    return len(re.findall(r"<[a-z][^>]*>", text or "", re.IGNORECASE))

def check_article(it_row: dict, en_row: dict) -> list[str]:
    """Restituisce lista di problemi trovati (vuota = OK)."""
    issues = []

    corpo_it = it_row.get("corpo") or ""
    corpo_en = en_row.get("corpo") or ""

    # 1. Lunghezza minima EN >= 30% IT
    len_it = len(strip_html(corpo_it))
    len_en = len(strip_html(corpo_en))
    if len_it > 100 and len_en < len_it * 0.30:
        issues.append(f"corpo EN troppo corto: {len_en} chars vs IT {len_it} chars")

    # 2. HTML strutturalmente simile (tag count entro 20%)
    tags_it = count_html_tags(corpo_it)
    tags_en = count_html_tags(corpo_en)
    if tags_it > 5 and abs(tags_it - tags_en) > tags_it * 0.20:
        issues.append(f"struttura HTML divergente: {tags_it} tag IT vs {tags_en} EN")

    # 3. Link <a href> invariati
    hrefs_it = set(re.findall(r'href="([^"]+)"', corpo_it))
    hrefs_en = set(re.findall(r'href="([^"]+)"', corpo_en))
    missing = hrefs_it - hrefs_en
    if missing:
        issues.append(f"link persi: {list(missing)[:3]}")

    # 4. Parole italiane residue nel testo EN
    words_en = set(re.findall(r"\b[a-zàèéìòù]{4,}\b", strip_html(corpo_en).lower()))
    it_residue = words_en & IT_WORDS
    if len(it_residue) > 5:
        issues.append(f"possibile italiano residuo: {list(it_residue)[:5]}")

    # 5. Collegamento bidirezionale
    en_link = (en_row.get("articolo_traduzione") or {})
    en_link_id = en_link.get("id") if isinstance(en_link, dict) else en_link
    if str(en_link_id) != str(it_row["id"]):
        issues.append(f"link bidirezionale mancante: EN.articolo_traduzione != IT.id")

    return issues

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--job-id", required=True)
    parser.add_argument("--fail-fast", action="store_true")
    args = parser.parse_args()

    if not DIRECTUS_TOKEN:
        print("ERROR: DIRECTUS_TOKEN mancante"); sys.exit(1)

    log_path = LOGS_DIR / f"{args.job_id}.csv"
    if not log_path.exists():
        print(f"Log non trovato: {log_path}"); sys.exit(1)

    with open(log_path, newline="", encoding="utf-8") as f:
        rows = [r for r in csv.DictReader(f) if r.get("status") == "ok"]

    print(f"Articoli da verificare: {len(rows)}")
    fields = "id,slug,titolo,corpo,articolo_traduzione.id"
    qa_log = []
    fail_count = 0

    for i, row in enumerate(rows, 1):
        it_id = row["it_id"]
        en_id = row["en_id"]

        it_data = directus_get(f"/items/articoli/{it_id}?fields={fields}")["data"]
        en_data = directus_get(f"/items/articoli/{en_id}?fields={fields}")["data"]

        issues = check_article(it_data, en_data)
        status = "FAIL" if issues else "OK"
        if issues:
            fail_count += 1

        qa_log.append({
            "it_id": it_id, "it_slug": row["it_slug"],
            "en_id": en_id, "en_slug": row["en_slug"],
            "status": status,
            "issues": " | ".join(issues),
        })

        if issues:
            print(f"  [FAIL] {row['en_slug']}: {'; '.join(issues)}")
            if args.fail_fast:
                break
        elif i % 20 == 0:
            print(f"  [{i}/{len(rows)}] ...", end="\r")

    # Salva qa log
    qa_path = LOGS_DIR / f"qa-{args.job_id}.csv"
    with open(qa_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["it_id","it_slug","en_id","en_slug","status","issues"])
        w.writeheader()
        w.writerows(qa_log)

    print()
    print(f"QA completata: {len(rows) - fail_count} OK, {fail_count} FAIL")
    print(f"Report: {qa_path}")

    if fail_count > len(rows) * 0.01:
        print(f"⚠ Errori > 1% — verificare prima di pubblicare")
        sys.exit(1)

if __name__ == "__main__":
    main()
