#!/usr/bin/env python3
"""
scripts/db_analysis/extract_archive_links.py

Estrae i link archive.org (sfoglia + PDF) dall'HTML dei post `post_type=project`
nel dump SQL WordPress, e salva il mapping in:

  scripts/db_analysis/output/archive_links.json

Struttura output:
  {
    "<wp_id>": {
      "post_name": "numero-172-...",
      "details_url": "https://archive.org/details/OmbreELuciN_172",
      "download_url": "https://archive.org/download/OmbreELuciN_172"
    },
    ...
  }

Uso:
  python3 scripts/db_analysis/extract_archive_links.py

Input:
  dump_db_old/Sql980379_3.sql.gz

Output:
  scripts/db_analysis/output/archive_links.json
"""

from __future__ import annotations

import gzip
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
DUMP_PATH = ROOT / "dump_db_old/Sql980379_3.sql.gz"
OUT_PATH = ROOT / "scripts/db_analysis/output/archive_links.json"

# Regex per trovare INSERT INTO wp_posts — supporta sia prefisso wppp_ che wp_
# Cattura l'intera riga VALUES (...)
INSERT_RE = re.compile(
    rb"INSERT INTO `\w*posts`\s+VALUES\s*(.+?);\s*$",
    re.MULTILINE | re.DOTALL,
)

# Regex per un singolo record VALUES (col1, col2, ...)
# wp_posts ha questi campi in ordine:
# ID, post_author, post_date, post_date_gmt, post_content, post_title,
# post_excerpt, post_status, comment_status, ping_status, post_password,
# post_name, to_ping, pinged, post_modified, post_modified_gmt,
# post_content_filtered, post_parent, guid, menu_order, post_type,
# post_mime_type, comment_count

ARCHIVE_RE = re.compile(
    r"https?://archive\.org/(details|download)/([A-Za-z0-9._\-]+)",
    re.IGNORECASE,
)


def extract_string_value(raw: str) -> str:
    """Rimuove i delimitatori singolo-quote e unescapes SQL."""
    if raw.startswith("'") and raw.endswith("'"):
        raw = raw[1:-1]
    return raw.replace("\\'", "'").replace("\\\\", "\\").replace("\\n", "\n")


def parse_wp_posts_row(row: str) -> dict | None:
    """
    Parsing grezzo di un record wp_posts dal testo SQL.
    Ritorna dict con ID, post_name, post_content, post_type, post_status.
    """
    row = row.strip()
    if not row.startswith("(") or not row.endswith(")"):
        return None
    inner = row[1:-1]

    # Split manuale: rispetta le stringhe SQL tra apici singoli
    fields = []
    i = 0
    while i < len(inner):
        if inner[i] == "'":
            # Trova la chiusura, saltando i caratteri escaped \'
            j = i + 1
            while j < len(inner):
                if inner[j] == "\\" and j + 1 < len(inner):
                    j += 2
                    continue
                if inner[j] == "'":
                    break
                j += 1
            fields.append(inner[i : j + 1])
            i = j + 2  # skip ' and ,
        elif inner[i] == "N" and inner[i : i + 4] == "NULL":
            fields.append("NULL")
            i += 4
            if i < len(inner) and inner[i] == ",":
                i += 1
        else:
            j = i
            while j < len(inner) and inner[j] not in (",",):
                j += 1
            fields.append(inner[i:j])
            i = j + 1

    if len(fields) < 21:
        return None

    try:
        post_id = int(fields[0])
        post_content = extract_string_value(fields[4]) if fields[4] != "NULL" else ""
        post_name = extract_string_value(fields[11]) if fields[11] != "NULL" else ""
        post_status = extract_string_value(fields[7]) if fields[7] != "NULL" else ""
        post_type = extract_string_value(fields[20]) if fields[20] != "NULL" else ""
    except (ValueError, IndexError):
        return None

    return {
        "id": post_id,
        "post_name": post_name,
        "post_content": post_content,
        "post_type": post_type,
        "post_status": post_status,
    }


def main() -> int:
    if not DUMP_PATH.exists():
        print(f"Dump non trovato: {DUMP_PATH}", file=sys.stderr)
        return 1

    print(f"Leggo dump: {DUMP_PATH}")

    # Legge tutto il dump decompresso cercando INSERT INTO *posts
    # Usa un approccio line-by-line per gestire dump grandi
    results: dict[str, dict] = {}
    rows_examined = 0
    rows_project = 0

    buffer = b""
    chunk_size = 4 * 1024 * 1024

    with gzip.open(DUMP_PATH, "rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            buffer += chunk
            lines = buffer.split(b"\n")
            buffer = lines[-1]  # eventuale riga incompleta

            for line in lines[:-1]:
                line_s = line.strip()
                if not (b"INSERT INTO" in line_s and b"posts" in line_s and b"VALUES" in line_s):
                    continue

                # Decodifica la riga
                try:
                    text = line_s.decode("utf-8", errors="replace")
                except Exception:
                    continue

                # Estrai tutti i record VALUES dalla riga
                # Formato: INSERT INTO `wppp_posts` VALUES (r1),(r2),...;
                # oppure un record per INSERT
                values_start = text.find("VALUES")
                if values_start < 0:
                    continue
                values_text = text[values_start + 6:].strip().rstrip(";")

                # Split per record singoli: trova ogni ( ... )
                # Parsing semplificato: conta parentesi
                depth = 0
                record_start = None
                records = []
                for ci, ch in enumerate(values_text):
                    if ch == "(" and depth == 0:
                        depth = 1
                        record_start = ci
                    elif ch == "(" and depth > 0:
                        depth += 1
                    elif ch == ")" and depth > 1:
                        depth -= 1
                    elif ch == ")" and depth == 1:
                        depth = 0
                        records.append(values_text[record_start: ci + 1])
                        record_start = None

                for record in records:
                    rows_examined += 1
                    row_data = parse_wp_posts_row(record)
                    if not row_data:
                        continue
                    if row_data["post_type"] != "project":
                        continue
                    rows_project += 1

                    content = row_data["post_content"]
                    if "archive.org" not in content:
                        continue

                    details_url = None
                    download_url = None
                    for m in ARCHIVE_RE.finditer(content):
                        kind = m.group(1).lower()
                        full_url = m.group(0)
                        # Esclude link generici non numerati
                        identifier = m.group(2)
                        if not re.search(r"\d", identifier):
                            continue
                        if kind == "details" and details_url is None:
                            details_url = full_url
                        elif kind == "download" and download_url is None:
                            download_url = full_url

                    if details_url or download_url:
                        wp_id_str = str(row_data["id"])
                        results[wp_id_str] = {
                            "post_name": row_data["post_name"],
                            "details_url": details_url,
                            "download_url": download_url,
                        }
                        print(
                            f"  wp_id={wp_id_str:6s}  {row_data['post_name'][:40]:<40s}"
                            f"  sfoglia={details_url or '-'}"
                        )

        # Processa eventuale buffer residuo
        if buffer.strip():
            pass  # riga incompleta, ignora

    print(f"\nEsaminati: {rows_examined} record | project: {rows_project} | con archive.org: {len(results)}")

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"Salvato: {OUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
