#!/usr/bin/env python3
"""Conta tag da articoli_testo_arricchito.jsonl"""

import json
from pathlib import Path

DATASETS_DIR = Path(__file__).parent.parent / "datasets"
INPUT_JSONL = DATASETS_DIR / "articoli" / "articoli_testo_arricchito.jsonl"

tag_unici = set()
totale_tag = 0
articoli_con_tag = 0

with INPUT_JSONL.open('r', encoding='utf-8') as f:
    for line in f:
        if not line.strip():
            continue
        art = json.loads(line)
        tags_slugs = art.get('tags_slugs', '')
        if tags_slugs:
            articoli_con_tag += 1
            tags = [t.strip() for t in tags_slugs.split(',') if t.strip()]
            totale_tag += len(tags)
            tag_unici.update(tags)

print(f"Articoli con tag: {articoli_con_tag}")
print(f"Tag unici: {len(tag_unici)}")
print(f"Tag totali: {totale_tag}")

# Salva in file
output_file = Path(__file__).parent.parent.parent / "tag_statistics.txt"
with output_file.open('w', encoding='utf-8') as f:
    f.write(f"Articoli con tag: {articoli_con_tag}\n")
    f.write(f"Tag unici: {len(tag_unici)}\n")
    f.write(f"Tag totali: {totale_tag}\n")

