#!/usr/bin/env python3
"""Conta tag totali e unici"""

import json
from pathlib import Path

DATASETS_DIR = Path(__file__).parent.parent / "datasets"
INPUT_JSONL = DATASETS_DIR / "articoli" / "articoli_semantici_FULL_2026.jsonl"

tag_unici = set()
totale_tag = 0

with INPUT_JSONL.open('r', encoding='utf-8') as f:
    for line in f:
        if not line.strip():
            continue
        art = json.loads(line)
        tags = art.get('tax', {}).get('tags', [])
        for tag in tags:
            slug = tag.get('slug', '')
            if slug:
                tag_unici.add(slug)
                totale_tag += 1

print(f"Tag unici: {len(tag_unici)}")
print(f"Tag totali: {totale_tag}")

