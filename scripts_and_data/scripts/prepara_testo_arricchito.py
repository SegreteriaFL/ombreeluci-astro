#!/usr/bin/env python3
"""
Prepara testo arricchito per embedding migliorato
Crea JSONL con: [CATEGORIE] + [TAG] + [TITOLO] + [PRIMI 300 CARATTERI]
"""

import csv
import json
from pathlib import Path
from typing import Dict, Any

# Paths
CSV_INPUT = Path("2-1-25/articoli_semantici_FULL_2026_text.csv")
JSONL_OUTPUT = Path("datasets/articoli/articoli_testo_arricchito.jsonl")


def build_enriched_text(row: Dict[str, str]) -> str:
    """Costruisce testo arricchito per embedding"""
    parts = []
    
    # 1. Categorie
    categories = row.get('categories_slugs', '').strip()
    if categories:
        # Converti da "cat1,cat2" a "Categorie: cat1 cat2"
        cats_list = [c.strip() for c in categories.split(',') if c.strip()]
        if cats_list:
            parts.append(f"Categorie: {' '.join(cats_list)}")
    
    # 2. Tag
    tags = row.get('tags_slugs', '').strip()
    if tags:
        # Converti da "tag1,tag2" a "Tag: tag1 tag2"
        tags_list = [t.strip() for t in tags.split(',') if t.strip()]
        if tags_list:
            parts.append(f"Tag: {' '.join(tags_list)}")
    
    # 3. Titolo
    title = row.get('title', '').strip()
    if title:
        parts.append(f"Titolo: {title}")
    
    # 4. Primi 300 caratteri del testo
    text = row.get('text_plain', '').strip()
    if text:
        text_preview = text[:300]
        if len(text) > 300:
            text_preview += "..."
        parts.append(f"Testo: {text_preview}")
    
    return " | ".join(parts)


def main():
    """Genera JSONL con testo arricchito"""
    print("="*60)
    print("PREPARAZIONE TESTO ARRICCHITO PER EMBEDDING")
    print("="*60)
    
    if not CSV_INPUT.exists():
        print(f"ERRORE: File non trovato: {CSV_INPUT}")
        return
    
    articoli_processed = 0
    articoli_con_categorie = 0
    articoli_con_tag = 0
    
    with CSV_INPUT.open('r', encoding='utf-8') as f_in, \
         JSONL_OUTPUT.open('w', encoding='utf-8') as f_out:
        
        reader = csv.DictReader(f_in)
        
        for row in reader:
            articolo_id = int(row.get('id', 0))
            if not articolo_id:
                continue
            
            # Costruisci testo arricchito
            enriched_text = build_enriched_text(row)
            
            # Statistiche
            if row.get('categories_slugs', '').strip():
                articoli_con_categorie += 1
            if row.get('tags_slugs', '').strip():
                articoli_con_tag += 1
            
            # Crea record JSONL
            record = {
                "id": articolo_id,
                "title": row.get('title', ''),
                "date": row.get('date', ''),
                "author": row.get('author', ''),
                "categories_slugs": row.get('categories_slugs', ''),
                "tags_slugs": row.get('tags_slugs', ''),
                "text_enriched": enriched_text,
                "text_plain": row.get('text_plain', '')[:300]  # Preview
            }
            
            # Scrivi JSONL
            f_out.write(json.dumps(record, ensure_ascii=False) + '\n')
            articoli_processed += 1
            
            if articoli_processed % 500 == 0:
                print(f"Processati {articoli_processed} articoli...")
    
    print("\n" + "="*60)
    print("RIEPILOGO")
    print("="*60)
    print(f"[OK] Articoli processati: {articoli_processed}")
    print(f"[OK] Articoli con categorie: {articoli_con_categorie}")
    print(f"[OK] Articoli con tag: {articoli_con_tag}")
    print(f"[OK] File generato: {JSONL_OUTPUT}")
    
    # Mostra esempio
    print("\n[INFO] Esempio testo arricchito (primo articolo):")
    with JSONL_OUTPUT.open('r', encoding='utf-8') as f:
        first_line = f.readline()
        if first_line:
            example = json.loads(first_line)
            print(f"ID: {example['id']}")
            print(f"Titolo: {example['title']}")
            print(f"Testo arricchito:\n{example['text_enriched'][:200]}...")


if __name__ == "__main__":
    main()

