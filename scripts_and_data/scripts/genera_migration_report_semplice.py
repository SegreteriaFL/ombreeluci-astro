#!/usr/bin/env python3
"""
Genera Migration Report (Manifesto di Migrazione) - Versione Semplice
Legge direttamente dai file JSON invece dei markdown
"""

import json
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent.parent
DATASETS_DIR = BASE_DIR / "scripts_and_data" / "datasets"
OUTPUT_REPORT = BASE_DIR / "migration_report.json"

# File di input
INPUT_JSONL = DATASETS_DIR / "articoli" / "articoli_semantici_FULL_2026.jsonl"
INPUT_NUMERI = DATASETS_DIR / "numeri_rivista" / "numeri_wp_FINAL.json"
INPUT_SLUGS = DATASETS_DIR / "articoli" / "articoli_slugs_definitivi.json"

def main():
    print("=" * 60)
    print("GENERAZIONE MIGRATION REPORT")
    print("=" * 60)
    
    # Carica dati
    print("\nCaricamento dati...")
    
    # Articoli
    articoli = {}
    with INPUT_JSONL.open('r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                art = json.loads(line)
                articoli[art['id']] = art
    
    print(f"  [OK] Caricati {len(articoli)} articoli")
    
    # Numeri rivista
    with INPUT_NUMERI.open('r', encoding='utf-8') as f:
        numeri = json.load(f)
    
    print(f"  [OK] Caricati {len(numeri)} numeri rivista")
    
    # Slugs
    with INPUT_SLUGS.open('r', encoding='utf-8') as f:
        slugs = json.load(f)
    
    print(f"  [OK] Caricati {len(slugs)} slugs")
    
    # Crea mappa numero rivista per categoria
    numero_map = {}
    for numero in numeri:
        num_prog = numero.get('numero_progressivo')
        anno = numero.get('anno_pubblicazione')
        if num_prog and anno:
            key = f"numero-{num_prog}-{anno}"
            numero_map[key] = numero
    
    # Statistiche
    stats = {
        'articoli_processati': len(articoli),
        'articoli_con_pdf': 0,
        'articoli_con_tag': 0,
        'articoli_con_numero_rivista': 0,
        'tag_unici': set(),
        'totale_tag': 0,
    }
    
    print("\nCalcolo statistiche...")
    
    for art_id, articolo in articoli.items():
        # Tag
        tags = articolo.get('tax', {}).get('tags', [])
        if tags:
            stats['articoli_con_tag'] += 1
            stats['totale_tag'] += len(tags)
            for tag in tags:
                slug = tag.get('slug', '')
                if slug:
                    stats['tag_unici'].add(slug)
        
        # Numero rivista (cerca categoria numero-X-YYYY)
        categories = articolo.get('tax', {}).get('categories', [])
        for cat in categories:
            slug = cat.get('slug', '')
            if slug.startswith('numero-'):
                stats['articoli_con_numero_rivista'] += 1
                # Verifica se ha PDF
                if slug in numero_map:
                    numero = numero_map[slug]
                    if numero.get('archive_download_pdf_url'):
                        stats['articoli_con_pdf'] += 1
                break
        
        if art_id % 500 == 0:
            print(f"  [OK] Processati {art_id} articoli...")
    
    # Prepara report
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
    
    # Salva report
    with OUTPUT_REPORT.open('w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    # Stampa report
    print("\n" + "=" * 60)
    print("MIGRATION REPORT")
    print("=" * 60)
    print(f"Articoli processati: {stats['articoli_processati']}")
    print(f"Articoli con PDF trovato: {stats['articoli_con_pdf']}")
    print(f"Articoli con Tag trovati: {stats['articoli_con_tag']}")
    print(f"Articoli con Numero Rivista: {stats['articoli_con_numero_rivista']}")
    print(f"\nCoverage:")
    print(f"  PDF: {report['coverage']['pdf_coverage']}")
    print(f"  Tag: {report['coverage']['tag_coverage']}")
    print(f"  Numero Rivista: {report['coverage']['numero_rivista_coverage']}")
    print(f"\nTag:")
    print(f"  Totale tag: {stats['totale_tag']}")
    print(f"  Tag unici: {len(stats['tag_unici'])}")
    
    print(f"\n[OK] Report salvato in: {OUTPUT_REPORT}")


if __name__ == "__main__":
    main()

