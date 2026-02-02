#!/usr/bin/env python3
"""
Script per analizzare i dataset e creare un report
"""

import json
import csv
from pathlib import Path
from collections import defaultdict

# Paths
project_root = Path(__file__).parent.parent.parent
articoli_json = project_root / "scripts_and_data" / "datasets" / "articoli" / "articoli_semantici_FULL_2026.json"
enriched_csv = project_root / "_migration_archive" / "categorie v2" / "articoli_2026_enriched_temi_s8_FINAL_V3.csv"
numeri_json = project_root / "scripts_and_data" / "datasets" / "numeri_rivista" / "numeri_wp_FINAL.json"

print("="*80)
print("ANALISI DATASET - REPORT BREVE")
print("="*80)

# 1. ANALISI articoli_semantici_FULL_2026.json
print("\n1. ARTICOLI_SEMANTICI_FULL_2026.JSON")
print("-" * 80)
if articoli_json.exists():
    with open(articoli_json, 'r', encoding='utf-8') as f:
        articoli = json.load(f)
    
    print(f"[OK] Totale articoli: {len(articoli)}")
    
    # Analizza struttura
    first = articoli[0]
    print(f"\nStruttura record:")
    print(f"  - id: {first.get('id')}")
    print(f"  - url: {first.get('url')}")
    print(f"  - meta: {list(first.get('meta', {}).keys())}")
    print(f"  - tax: {list(first.get('tax', {}).keys())}")
    print(f"  - html_pulito: {'[OK] Presente' if first.get('html_pulito') else '[MISS] Mancante'}")
    
    # Verifica categorie numero
    articoli_con_numero = 0
    numeri_trovati = set()
    for art in articoli:
        categories = art.get('tax', {}).get('categories', [])
        for cat in categories:
            slug = cat.get('slug', '')
            if slug.startswith('numero-'):
                articoli_con_numero += 1
                numeri_trovati.add(slug)
                break
    
    print(f"\nCollegamento a numeri rivista:")
    print(f"  - Articoli con categoria 'numero-*': {articoli_con_numero} ({articoli_con_numero/len(articoli)*100:.1f}%)")
    print(f"  - Numeri unici trovati: {len(numeri_trovati)}")
else:
    print("[ERROR] File non trovato")

# 2. ANALISI articoli_2026_enriched_temi_s8_FINAL_V3.csv
print("\n2. ARTICOLI_2026_ENRICHED_TEMI_S8_FINAL_V3.CSV")
print("-" * 80)
if enriched_csv.exists():
    with open(enriched_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    print(f"[OK] Totale righe: {len(rows)}")
    print(f"\nColonne disponibili:")
    if rows:
        for col in rows[0].keys():
            print(f"  - {col}")
    
    # Verifica coverage
    ids_csv = {int(row['id_articolo']) for row in rows if row.get('id_articolo')}
    ids_json = {art['id'] for art in articoli}
    
    print(f"\nCoverage:")
    print(f"  - ID in CSV: {len(ids_csv)}")
    print(f"  - ID in JSON: {len(ids_json)}")
    print(f"  - In comune: {len(ids_csv & ids_json)}")
    print(f"  - Solo CSV: {len(ids_csv - ids_json)}")
    print(f"  - Solo JSON: {len(ids_json - ids_csv)}")
    
    # Verifica temi
    temi = defaultdict(int)
    for row in rows:
        tema = row.get('tema_label', '')
        if tema:
            temi[tema] += 1
    
    print(f"\nTemi catalogati: {len(temi)}")
    print(f"  Top 5 temi:")
    for tema, count in sorted(temi.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"    - {tema}: {count} articoli")
else:
    print("[ERROR] File non trovato")

# 3. ANALISI numeri_wp_FINAL.json
print("\n3. NUMERI_WP_FINAL.JSON")
print("-" * 80)
if numeri_json.exists():
    with open(numeri_json, 'r', encoding='utf-8') as f:
        numeri = json.load(f)
    
    print(f"[OK] Totale numeri: {len(numeri)}")
    
    # Analizza struttura
    first = numeri[0]
    print(f"\nStruttura record:")
    for key in first.keys():
        value = first[key]
        if isinstance(value, list):
            print(f"  - {key}: array con {len(value)} elementi")
        elif isinstance(value, str) and value:
            print(f"  - {key}: [OK] Presente")
        else:
            print(f"  - {key}: {'[OK] Presente' if value else '[EMPTY] Vuoto/None'}")
    
    # Verifica PDF e copertine
    con_pdf = sum(1 for n in numeri if n.get('archive_download_pdf_url'))
    con_copertina = sum(1 for n in numeri if n.get('copertina_url'))
    con_articoli_urls = sum(1 for n in numeri if n.get('articoli_urls'))
    
    print(f"\nContenuti:")
    print(f"  - Con PDF: {con_pdf} ({con_pdf/len(numeri)*100:.1f}%)")
    print(f"  - Con copertina: {con_copertina} ({con_copertina/len(numeri)*100:.1f}%)")
    print(f"  - Con articoli_urls: {con_articoli_urls} ({con_articoli_urls/len(numeri)*100:.1f}%)")
    
    # Verifica collegamento articoli
    totale_urls = sum(len(n.get('articoli_urls', [])) for n in numeri)
    print(f"  - Totale URL articoli nei numeri: {totale_urls}")
    
    # Verifica articoli_ids
    con_ids = sum(1 for n in numeri if n.get('articoli_ids'))
    print(f"  - Con articoli_ids popolato: {con_ids} ({con_ids/len(numeri)*100:.1f}%)")
    
    # Tipi rivista
    tipi = defaultdict(int)
    for n in numeri:
        tipo = n.get('tipo_rivista', 'unknown')
        tipi[tipo] += 1
    print(f"\nTipi rivista:")
    for tipo, count in tipi.items():
        print(f"  - {tipo}: {count}")
else:
    print("[ERROR] File non trovato")

# 4. VERIFICA COLLEGAMENTO ARTICOLI ↔ NUMERI
print("\n4. COLLEGAMENTO ARTICOLI <-> NUMERI")
print("-" * 80)

if articoli_json.exists() and numeri_json.exists():
    # Estrai slug numeri dagli articoli
    articolo_to_numero_slug = {}
    for art in articoli:
        art_id = art['id']
        categories = art.get('tax', {}).get('categories', [])
        for cat in categories:
            slug = cat.get('slug', '')
            if slug.startswith('numero-'):
                articolo_to_numero_slug[art_id] = slug
                break
    
    # Estrai slug numeri dai numeri (da wp_url_numero o id_numero)
    numero_slug_to_id = {}
    for num in numeri:
        id_num = num.get('id_numero', '')
        wp_url = num.get('wp_url_numero', '')
        # Prova a estrarre slug da URL
        if 'numero-' in wp_url:
            # Es: https://www.ombreeluci.it/project/numero-1-inverno-la-vita-affettiva-degli-handicappati-mentali/
            parts = wp_url.split('/')
            for part in parts:
                if part.startswith('numero-'):
                    numero_slug_to_id[part] = id_num
                    break
    
    print(f"Articoli con slug numero: {len(articolo_to_numero_slug)}")
    print(f"Numeri con slug identificabile: {len(numero_slug_to_id)}")
    
    # Match
    matched = 0
    for art_id, slug in articolo_to_numero_slug.items():
        if slug in numero_slug_to_id:
            matched += 1
    
    print(f"Match trovati: {matched} ({matched/len(articolo_to_numero_slug)*100:.1f}% degli articoli con numero)")

print("\n" + "="*80)
print("FINE REPORT")
print("="*80)

