#!/usr/bin/env python3
"""
Ricerca disperata di commenti in tutti i file del progetto
Cerca pattern che potrebbero essere commenti
"""

import json
import csv
import re
from pathlib import Path
from typing import Dict, List, Any
from collections import defaultdict

# Paths da cercare
SEARCH_PATHS = [
    Path("."),
    Path("2-1-25"),
    Path("export pulito db 2026"),
    Path("datasets"),
    Path("export numeri oel"),
]


def search_in_json(file_path: Path) -> List[Dict[str, Any]]:
    """Cerca commenti in file JSON"""
    results = []
    try:
        with file_path.open('r', encoding='utf-8') as f:
            data = json.load(f)
        
        def search_recursive(obj, path="", article_id=None):
            if isinstance(obj, dict):
                # Cerca campo "comments" o "commenti"
                if 'comments' in obj or 'commenti' in obj:
                    comments = obj.get('comments') or obj.get('commenti')
                    if comments:
                        # Estrai article_id dal contesto
                        art_id = obj.get('id') or article_id
                        if art_id:
                            results.append({
                                'file': str(file_path),
                                'article_id': art_id,
                                'comments': comments,
                                'path': path
                            })
                
                # Cerca anche id articolo per contesto
                current_id = obj.get('id')
                for key, value in obj.items():
                    current_path = f"{path}.{key}" if path else key
                    search_recursive(value, current_path, current_id or article_id)
            
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    search_recursive(item, f"{path}[{i}]", article_id)
        
        search_recursive(data)
    except Exception as e:
        pass
    
    return results


def search_in_csv(file_path: Path) -> List[Dict[str, Any]]:
    """Cerca commenti in file CSV"""
    results = []
    try:
        with file_path.open('r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row_num, row in enumerate(reader, 2):
                # Cerca colonne con "comment" nel nome
                for col_name, value in row.items():
                    if 'comment' in col_name.lower() and value:
                        results.append({
                            'file': str(file_path),
                            'row': row_num,
                            'column': col_name,
                            'value': value[:200]
                        })
    except Exception as e:
        pass
    
    return results


def main():
    """Cerca commenti ovunque"""
    print("="*60)
    print("RICERCA COMMENTI IN TUTTI I FILE")
    print("="*60)
    
    all_results = []
    
    for search_path in SEARCH_PATHS:
        if not search_path.exists():
            continue
        
        print(f"\nCercando in: {search_path}")
        
        # Cerca file JSON
        for json_file in search_path.rglob("*.json"):
            results = search_in_json(json_file)
            if results:
                print(f"  [JSON] {json_file.name}: {len(results)} riferimenti")
                all_results.extend(results)
        
        # Cerca file CSV
        for csv_file in search_path.rglob("*.csv"):
            results = search_in_csv(csv_file)
            if results:
                print(f"  [CSV] {csv_file.name}: {len(results)} riferimenti")
                all_results.extend(results)
    
    # Processa risultati
    if all_results:
        print("\n" + "="*60)
        print("COMMENTI TROVATI")
        print("="*60)
        
        # Raggruppa per articolo
        commenti_per_articolo = defaultdict(list)
        
        for result in all_results:
            if 'comments' in result:
                art_id = result['article_id']
                comments = result['comments']
                
                if isinstance(comments, list):
                    for comment in comments:
                        if isinstance(comment, dict):
                            commento = {
                                'autore': comment.get('autore') or comment.get('author') or comment.get('comment_author', ''),
                                'data': comment.get('data') or comment.get('date') or comment.get('comment_date', ''),
                                'testo': comment.get('testo') or comment.get('text') or comment.get('comment_content', '')
                            }
                            if commento['testo']:
                                commenti_per_articolo[art_id].append(commento)
        
        # Converti in formato finale
        commenti_finali = {}
        for art_id, commenti_list in commenti_per_articolo.items():
            commenti_finali[int(art_id)] = commenti_list
        
        # Salva
        output_file = Path("datasets/commenti/commenti_storici.json")
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with output_file.open('w', encoding='utf-8') as f:
            json.dump(commenti_finali, f, ensure_ascii=False, indent=2)
        
        totale_articoli = len(commenti_finali)
        totale_commenti = sum(len(c) for c in commenti_finali.values())
        
        print(f"[OK] Articoli con commenti: {totale_articoli}")
        print(f"[OK] Totale commenti: {totale_commenti}")
        print(f"[OK] File salvato: {output_file}")
        
        # Mostra esempi
        if commenti_finali:
            print("\n[INFO] Esempi commenti:")
            for idx, (art_id, commenti_list) in enumerate(list(commenti_finali.items())[:3], 1):
                print(f"\n  Articolo {art_id} ({len(commenti_list)} commenti):")
                for comm in commenti_list[:2]:
                    autore = comm.get('autore', 'N/A')
                    data = comm.get('data', 'N/A')
                    testo = comm.get('testo', '')[:80]
                    print(f"    - {autore} ({data}): {testo}...")
    else:
        print("\n[WARN] Nessun commento trovato nei file!")
        print("\n[INFO] I commenti devono essere estratti dal database WordPress.")
        print("\n[INFO] Opzioni:")
        print("  1. Usa lo script PHP: scripts/estrai_commenti.php")
        print("     - Caricalo sul server WordPress")
        print("     - Chiama: https://www.ombreeluci.it/scripts/estrai_commenti.php?key=CHIAVE")
        print("     - Salva output in datasets/commenti/commenti_storici.json")
        print("\n  2. Se hai accesso SSH al server:")
        print("     - Esegui lo script PHP direttamente")
        print("     - Oppure usa mysql da command line")


if __name__ == "__main__":
    main()

