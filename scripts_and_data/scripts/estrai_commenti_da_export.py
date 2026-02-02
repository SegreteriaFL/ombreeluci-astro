#!/usr/bin/env python3
"""
Estrae commenti dagli export batch se presenti
Oppure cerca in tutti i file JSON per commenti
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any
from collections import defaultdict

# Paths
EXPORT_BATCHES = [
    Path("2-1-25/export_1000_1.json"),
    Path("2-1-25/export_1000_2.json"),
    Path("2-1-25/export_1000_3.json"),
    Path("2-1-25/export_1000_4.json"),
]

OUTPUT_FILE = Path("datasets/commenti/commenti_storici.json")


def search_comments_in_export() -> Dict[int, List[Dict[str, str]]]:
    """Cerca commenti negli export batch"""
    commenti_per_articolo = defaultdict(list)
    articoli_con_commenti = 0
    totale_commenti = 0
    
    print("="*60)
    print("ESTRAZIONE COMMENTI DA EXPORT BATCH")
    print("="*60)
    
    for batch_file in EXPORT_BATCHES:
        if not batch_file.exists():
            print(f"[WARN] File non trovato: {batch_file}")
            continue
        
        print(f"\nProcessando: {batch_file.name}")
        
        try:
            with batch_file.open('r', encoding='utf-8') as f:
                batch_data = json.load(f)
            
            for record in batch_data:
                articolo_id = record.get('id')
                if not articolo_id:
                    continue
                
                # Cerca campo "comments" o "commenti"
                comments = record.get('comments') or record.get('commenti')
                if comments:
                    if isinstance(comments, list):
                        for comment in comments:
                            if isinstance(comment, dict):
                                commento = {
                                    'autore': comment.get('autore') or comment.get('author') or comment.get('comment_author', ''),
                                    'data': comment.get('data') or comment.get('date') or comment.get('comment_date', ''),
                                    'testo': comment.get('testo') or comment.get('text') or comment.get('comment_content', '')
                                }
                                if commento['testo']:  # Solo se ha testo
                                    commenti_per_articolo[articolo_id].append(commento)
                                    totale_commenti += 1
                        if comments:
                            articoli_con_commenti += 1
                
                # Cerca anche in raw_html per commenti embedded
                raw_html = record.get('raw_html', '')
                if raw_html and 'comment' in raw_html.lower():
                    # Potrebbe essere un commento embedded nell'HTML
                    # Pattern per commenti WordPress standard
                    comment_patterns = [
                        r'<div[^>]*class="[^"]*comment[^"]*"[^>]*>.*?</div>',
                        r'<li[^>]*class="[^"]*comment[^"]*"[^>]*>.*?</li>',
                    ]
                    # Nota: questo è complesso, meglio lasciare al database
        
        except Exception as e:
            print(f"[ERROR] Errore processando {batch_file}: {e}")
            continue
    
    print("\n" + "="*60)
    print("RIEPILOGO RICERCA IN EXPORT")
    print("="*60)
    print(f"[OK] Articoli con commenti trovati: {articoli_con_commenti}")
    print(f"[OK] Totale commenti trovati: {totale_commenti}")
    
    return dict(commenti_per_articolo)


def load_comments_from_file() -> Dict[int, List[Dict[str, str]]]:
    """Carica commenti da file se già esportati"""
    # Cerca file commenti esistenti
    possible_files = [
        Path("datasets/commenti/commenti_storici.json"),
        Path("commenti_storici.json"),
        Path("2-1-25/commenti.json"),
        Path("export pulito db 2026/commenti.json"),
    ]
    
    for file_path in possible_files:
        if file_path.exists():
            print(f"Trovato file commenti: {file_path}")
            try:
                with file_path.open('r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        # Converti chiavi stringa in int
                        result = {}
                        for k, v in data.items():
                            try:
                                result[int(k)] = v
                            except (ValueError, TypeError):
                                result[k] = v
                        return result
            except Exception as e:
                print(f"[ERROR] Errore leggendo {file_path}: {e}")
    
    return {}


def main():
    """Estrae commenti dagli export o dal database"""
    print("="*60)
    print("ESTRAZIONE COMMENTI STORICI")
    print("="*60)
    
    # Prima cerca negli export
    commenti = search_comments_in_export()
    
    # Se non trovati, cerca file esistenti
    if not commenti:
        print("\n[INFO] Nessun commento trovato negli export, cerco file esistenti...")
        commenti = load_comments_from_file()
    
    # Se ancora non trovati, suggerisci estrazione da database
    if not commenti:
        print("\n[WARN] Nessun commento trovato negli export o file esistenti!")
        print("[INFO] Per estrarre commenti dal database WordPress:")
        print("  1. Carica lo script scripts/estrai_commenti.php sul server")
        print("  2. Chiama: https://www.ombreeluci.it/scripts/estrai_commenti.php?key=CHIAVE")
        print("  3. Salva l'output in datasets/commenti/commenti_storici.json")
        print("\n[INFO] Oppure esegui direttamente se hai accesso al database.")
        return
    
    # Salva risultato
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    # Converti chiavi int in stringhe per JSON (se necessario)
    # Ma manteniamo int per compatibilità
    with OUTPUT_FILE.open('w', encoding='utf-8') as f:
        json.dump(commenti, f, ensure_ascii=False, indent=2)
    
    # Statistiche
    totale_articoli = len(commenti)
    totale_commenti = sum(len(c) for c in commenti.values())
    
    print("\n" + "="*60)
    print("RIEPILOGO FINALE")
    print("="*60)
    print(f"[OK] Articoli con commenti: {totale_articoli}")
    print(f"[OK] Totale commenti: {totale_commenti}")
    print(f"[OK] File salvato: {OUTPUT_FILE}")
    
    # Mostra esempi
    if commenti:
        print("\n[INFO] Esempi commenti trovati:")
        for idx, (art_id, commenti_list) in enumerate(list(commenti.items())[:3], 1):
            print(f"\n  Articolo {art_id} ({len(commenti_list)} commenti):")
            for comm in commenti_list[:2]:  # Primi 2 commenti
                autore = comm.get('autore', 'N/A')
                data = comm.get('data', 'N/A')
                testo = comm.get('testo', '')[:100]
                print(f"    - {autore} ({data}): {testo}...")


if __name__ == "__main__":
    main()

