#!/usr/bin/env python3
"""Calcola statistiche migrazione"""

import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent
DATASETS_DIR = BASE_DIR / "scripts_and_data" / "datasets"
OUTPUT_REPORT = BASE_DIR / "migration_report.json"

INPUT_JSONL = DATASETS_DIR / "articoli" / "articoli_semantici_FULL_2026.jsonl"
INPUT_NUMERI = DATASETS_DIR / "numeri_rivista" / "numeri_wp_FINAL.json"

# Carica numeri rivista
with INPUT_NUMERI.open('r', encoding='utf-8') as f:
    numeri = json.load(f)

# Crea mappa numero rivista
numero_map = {}
for numero in numeri:
    num_prog = numero.get('numero_progressivo')
    anno = numero.get('anno_pubblicazione')
    if num_prog and anno:
        key = f"numero-{num_prog}-{anno}"
        numero_map[key] = numero

# Statistiche
stats = {
    'articoli_processati': 0,
    'articoli_con_pdf': 0,
    'articoli_con_tag': 0,
    'articoli_con_numero_rivista': 0,
    'tag_unici': set(),
    'totale_tag': 0,
}

# Processa articoli
with INPUT_JSONL.open('r', encoding='utf-8') as f:
    for line in f:
        if not line.strip():
            continue
        
        art = json.loads(line)
        stats['articoli_processati'] += 1
        
        # Tag
        tags = art.get('tax', {}).get('tags', [])
        if tags:
            stats['articoli_con_tag'] += 1
            stats['totale_tag'] += len(tags)
            for tag in tags:
                slug = tag.get('slug', '')
                if slug:
                    stats['tag_unici'].add(slug)
        
        # Numero rivista
        categories = art.get('tax', {}).get('categories', [])
        for cat in categories:
            slug = cat.get('slug', '')
            if slug.startswith('numero-'):
                stats['articoli_con_numero_rivista'] += 1
                # Verifica PDF
                if slug in numero_map:
                    numero = numero_map[slug]
                    if numero.get('archive_download_pdf_url'):
                        stats['articoli_con_pdf'] += 1
                break

# Report
report = {
    'migration_date': '2026-01-30',
    'statistics': {
        'articoli_processati': stats['articoli_processati'],
        'articoli_con_pdf': stats['articoli_con_pdf'],
        'articoli_con_tag': stats['articoli_con_tag'],
        'articoli_con_numero_rivista': stats['articoli_con_numero_rivista'],
        'totale_tag': stats['totale_tag'],
        'tag_unici': len(stats['tag_unici']),
    },
    'coverage': {
        'pdf_coverage': f"{stats['articoli_con_pdf']/stats['articoli_processati']*100:.1f}%" if stats['articoli_processati'] > 0 else "0%",
        'tag_coverage': f"{stats['articoli_con_tag']/stats['articoli_processati']*100:.1f}%" if stats['articoli_processati'] > 0 else "0%",
        'numero_rivista_coverage': f"{stats['articoli_con_numero_rivista']/stats['articoli_processati']*100:.1f}%" if stats['articoli_processati'] > 0 else "0%",
    }
}

# Salva
with OUTPUT_REPORT.open('w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print("Report generato:", OUTPUT_REPORT)
print(f"Articoli processati: {stats['articoli_processati']}")
print(f"Articoli con PDF: {stats['articoli_con_pdf']}")
print(f"Articoli con Tag: {stats['articoli_con_tag']}")

