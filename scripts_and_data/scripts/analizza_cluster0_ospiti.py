#!/usr/bin/env python3
"""
Analizza Cluster 0 per trovare 'ospiti inattesi'
Articoli con tag molto diversi finiti insieme
"""

import csv
import json
from pathlib import Path
from collections import Counter, defaultdict
from typing import Dict, List, Set, Tuple

# Paths
CSV_CATALOGAZIONE = Path("categorie v2/articoli_2026_enriched_temi_s8_FINAL_V3.csv")
CSV_TEXT = Path("2-1-25/articoli_semantici_FULL_2026_text.csv")
JSON_ARTICOLI = Path("datasets/articoli/articoli_semantici_FULL_2026.json")


def load_cluster0_articles() -> Dict[int, Dict]:
    """Carica articoli nel Cluster 0"""
    cluster0 = {}
    
    with CSV_CATALOGAZIONE.open('r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cluster_id = row.get('cluster_id', '').strip()
            if cluster_id == '0' or cluster_id == '0.0':
                id_art = int(row['id_articolo'])
                cluster0[id_art] = {
                    'id': id_art,
                    'titolo': row.get('titolo', ''),
                    'tema_code': row.get('tema_code', ''),
                    'tema_label': row.get('tema_label', ''),
                }
    
    return cluster0


def load_tags_per_article() -> Dict[int, Set[str]]:
    """Carica tag per ogni articolo dal CSV text"""
    tags_map = {}
    
    with CSV_TEXT.open('r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            id_art = int(row.get('id', 0))
            if not id_art:
                continue
            
            tags_str = row.get('tags_slugs', '').strip()
            if tags_str:
                tags = {t.strip() for t in tags_str.split(',') if t.strip()}
            else:
                tags = set()
            
            tags_map[id_art] = tags
    
    return tags_map


def calculate_tag_diversity(tags1: Set[str], tags2: Set[str]) -> float:
    """Calcola diversità tra due set di tag (Jaccard distance)"""
    if not tags1 and not tags2:
        return 0.0
    if not tags1 or not tags2:
        return 1.0
    
    intersection = len(tags1 & tags2)
    union = len(tags1 | tags2)
    
    if union == 0:
        return 0.0
    
    # Jaccard distance = 1 - Jaccard similarity
    jaccard_sim = intersection / union
    return 1.0 - jaccard_sim


def find_diverse_pairs(cluster0: Dict[int, Dict], tags_map: Dict[int, Set[str]], top_n: int = 10) -> List[Tuple[int, int, float, Set[str], Set[str]]]:
    """Trova coppie di articoli con tag molto diversi"""
    articles = list(cluster0.keys())
    diverse_pairs = []
    
    print(f"Analizzando {len(articles)} articoli nel Cluster 0...")
    
    # Calcola diversità per tutte le coppie
    for i, id1 in enumerate(articles):
        tags1 = tags_map.get(id1, set())
        if not tags1:
            continue
        
        for id2 in articles[i+1:]:
            tags2 = tags_map.get(id2, set())
            if not tags2:
                continue
            
            diversity = calculate_tag_diversity(tags1, tags2)
            
            # Se diversità alta (>0.8), sono molto diversi
            if diversity > 0.8:
                diverse_pairs.append((id1, id2, diversity, tags1, tags2))
    
    # Ordina per diversità decrescente
    diverse_pairs.sort(key=lambda x: x[2], reverse=True)
    
    return diverse_pairs[:top_n]


def load_article_details(article_ids: Set[int]) -> Dict[int, Dict]:
    """Carica dettagli articoli dal JSON"""
    details = {}
    
    print(f"Caricamento dettagli per {len(article_ids)} articoli...")
    
    with JSON_ARTICOLI.open('r', encoding='utf-8') as f:
        articoli = json.load(f)
        for art in articoli:
            if art['id'] in article_ids:
                details[art['id']] = {
                    'title': art.get('meta', {}).get('title', ''),
                    'author': art.get('meta', {}).get('author', ''),
                    'date': art.get('meta', {}).get('date', ''),
                    'categories': [c.get('name', '') for c in art.get('tax', {}).get('categories', [])],
                    'tags': [t.get('name', '') for t in art.get('tax', {}).get('tags', [])]
                }
    
    return details


def main():
    """Analizza Cluster 0 e trova ospiti inattesi"""
    print("="*60)
    print("ANALISI CLUSTER 0 - OSPITI INATTESI")
    print("="*60)
    
    # Carica dati
    cluster0 = load_cluster0_articles()
    print(f"[OK] Articoli nel Cluster 0: {len(cluster0)}")
    
    if len(cluster0) == 0:
        print("[WARN] Nessun articolo nel Cluster 0!")
        return
    
    tags_map = load_tags_per_article()
    print(f"[OK] Articoli con tag: {sum(1 for t in tags_map.values() if t)}")
    
    # Trova coppie diverse
    diverse_pairs = find_diverse_pairs(cluster0, tags_map, top_n=10)
    print(f"\n[OK] Trovate {len(diverse_pairs)} coppie con diversità > 0.8")
    
    if not diverse_pairs:
        print("[WARN] Nessuna coppia molto diversa trovata. Provo con soglia più bassa...")
        # Riprova con soglia più bassa
        articles = list(cluster0.keys())
        diverse_pairs_low = []
        for i, id1 in enumerate(articles[:100]):  # Limita per performance
            tags1 = tags_map.get(id1, set())
            if not tags1:
                continue
            for id2 in articles[i+1:100]:
                tags2 = tags_map.get(id2, set())
                if not tags2:
                    continue
                diversity = calculate_tag_diversity(tags1, tags2)
                if diversity > 0.5:
                    diverse_pairs_low.append((id1, id2, diversity, tags1, tags2))
        
        diverse_pairs_low.sort(key=lambda x: x[2], reverse=True)
        diverse_pairs = diverse_pairs_low[:10]
    
    # Carica dettagli articoli
    article_ids = set()
    for id1, id2, _, _, _ in diverse_pairs:
        article_ids.add(id1)
        article_ids.add(id2)
    
    details = load_article_details(article_ids)
    
    # Mostra risultati
    print("\n" + "="*60)
    print("TOP 10 OSPITI INATTESI (coppie con tag molto diversi)")
    print("="*60)
    
    for idx, (id1, id2, diversity, tags1, tags2) in enumerate(diverse_pairs, 1):
        print(f"\n--- COPPIA {idx} (Diversità: {diversity:.2f}) ---")
        
        # Articolo 1
        print(f"\n[ARTICOLO 1] ID: {id1}")
        det1 = details.get(id1, {})
        print(f"  Titolo: {det1.get('title', cluster0.get(id1, {}).get('titolo', 'N/A'))}")
        print(f"  Autore: {det1.get('author', 'N/A')}")
        print(f"  Tag: {', '.join(sorted(tags1)) if tags1 else 'NESSUN TAG'}")
        print(f"  Categorie: {', '.join(det1.get('categories', []))}")
        
        # Articolo 2
        print(f"\n[ARTICOLO 2] ID: {id2}")
        det2 = details.get(id2, {})
        print(f"  Titolo: {det2.get('title', cluster0.get(id2, {}).get('titolo', 'N/A'))}")
        print(f"  Autore: {det2.get('author', 'N/A')}")
        print(f"  Tag: {', '.join(sorted(tags2)) if tags2 else 'NESSUN TAG'}")
        print(f"  Categorie: {', '.join(det2.get('categories', []))}")
        
        # Perché sono insieme?
        print(f"\n[ANALISI] Perché sono finiti insieme nel Cluster 0?")
        common_tags = tags1 & tags2
        if common_tags:
            print(f"  - Tag in comune: {', '.join(common_tags)}")
        else:
            print(f"  - NESSUN TAG IN COMUNE!")
        
        # Possibili motivi
        reasons = []
        if not tags1 or not tags2:
            reasons.append("Uno o entrambi non hanno tag")
        if det1.get('author') == det2.get('author'):
            reasons.append(f"Stesso autore: {det1.get('author')}")
        if any(c1 == c2 for c1 in det1.get('categories', []) for c2 in det2.get('categories', [])):
            common_cats = set(det1.get('categories', [])) & set(det2.get('categories', []))
            reasons.append(f"Categorie in comune: {', '.join(common_cats)}")
        
        if reasons:
            print(f"  - Possibili motivi: {'; '.join(reasons)}")
        else:
            print(f"  - Motivo sconosciuto: potrebbero essere stati raggruppati per stile di scrittura o contenuto generico")


if __name__ == "__main__":
    main()

