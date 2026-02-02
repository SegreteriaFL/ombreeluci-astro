#!/usr/bin/env python3
"""Conta tag e salva in JSON"""

import json
from pathlib import Path

DATASETS_DIR = Path(__file__).parent.parent / "datasets"
INPUT_JSONL = DATASETS_DIR / "articoli" / "articoli_testo_arricchito.jsonl"
OUTPUT_JSON = Path(__file__).parent.parent.parent / "tag_statistics.json"

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

result = {
    'articoli_con_tag': articoli_con_tag,
    'tag_unici': len(tag_unici),
    'totale_tag': totale_tag
}

with OUTPUT_JSON.open('w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

