#!/usr/bin/env python3
"""Analizza cluster per proporre naming specifico"""
import json
import csv
from collections import Counter
from pathlib import Path

INPUT_JSONL = Path("datasets/articoli/articoli_testo_arricchito.jsonl")
INPUT_CSV = Path("datasets/articoli/mappa_temi_definitiva.csv")

# Carica articoli
articoli = {}
with INPUT_JSONL.open('r', encoding='utf-8') as f:
    for line in f:
        if line.strip():
            art = json.loads(line)
            articoli[art['id']] = art

# Carica cluster
cluster_articoli = {}
with INPUT_CSV.open('r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        cluster_id = int(row['nuovo_cluster_id'])
        art_id = int(row['id_articolo'])
        if cluster_id not in cluster_articoli:
            cluster_articoli[cluster_id] = []
        if art_id in articoli:
            cluster_articoli[cluster_id].append(articoli[art_id])

# Analizza ogni cluster
print("="*60)
print("ANALISI CLUSTER PER NAMING")
print("="*60)

for cluster_id in sorted(cluster_articoli.keys()):
    arts = cluster_articoli[cluster_id]
    print(f"\n{'='*60}")
    print(f"CLUSTER {cluster_id} - {len(arts)} articoli")
    print(f"{'='*60}")
    
    # Tag più comuni
    all_tags = []
    all_categories = []
    titles_sample = []
    
    for art in arts[:10]:  # Primi 10 per esempio
        tags = art.get('tags_slugs', '').split(',') if art.get('tags_slugs') else []
        categories = art.get('categories_slugs', '').split(',') if art.get('categories_slugs') else []
        all_tags.extend([t.strip() for t in tags if t.strip()])
        all_categories.extend([c.strip() for c in categories if c.strip()])
        titles_sample.append(art.get('title', '')[:80])
    
    # Filtra categorie "numero-X"
    all_categories = [c for c in all_categories if not c.startswith('numero-')]
    
    tag_counter = Counter(all_tags)
    cat_counter = Counter(all_categories)
    
    print(f"\nTop 10 Tag:")
    for tag, count in tag_counter.most_common(10):
        print(f"  {tag}: {count}")
    
    print(f"\nTop 10 Categorie:")
    for cat, count in cat_counter.most_common(10):
        print(f"  {cat}: {count}")
    
    print(f"\nEsempi titoli:")
    for title in titles_sample[:5]:
        print(f"  - {title}")

