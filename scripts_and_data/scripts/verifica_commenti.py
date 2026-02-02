#!/usr/bin/env python3
"""
Verifica struttura e contenuto file commenti_storici.json
"""

import json
from pathlib import Path

COMMENTI_FILE = Path("datasets/commenti/commenti_storici.json")


def main():
    """Verifica file commenti"""
    print("="*60)
    print("VERIFICA COMMENTI STORICI")
    print("="*60)
    
    if not COMMENTI_FILE.exists():
        print(f"[ERROR] File non trovato: {COMMENTI_FILE}")
        print("[INFO] Vedi ISTRUZIONI_ESTRAZIONE_COMMENTI.md per estrarre i commenti")
        return
    
    try:
        with COMMENTI_FILE.open('r', encoding='utf-8') as f:
            commenti = json.load(f)
    except Exception as e:
        print(f"[ERROR] Errore leggendo file: {e}")
        return
    
    # Verifica struttura
    print("\n[INFO] Verifica struttura...")
    
    if not isinstance(commenti, dict):
        print("[ERROR] File deve essere un oggetto JSON (dict)")
        return
    
    # Statistiche
    totale_articoli = len(commenti)
    totale_commenti = 0
    articoli_con_errori = []
    
    for art_id, commenti_list in commenti.items():
        if not isinstance(commenti_list, list):
            articoli_con_errori.append(f"Articolo {art_id}: commenti non è una lista")
            continue
        
        totale_commenti += len(commenti_list)
        
        for idx, commento in enumerate(commenti_list):
            if not isinstance(commento, dict):
                articoli_con_errori.append(f"Articolo {art_id}, commento {idx}: non è un oggetto")
                continue
            
            # Verifica campi obbligatori
            if 'autore' not in commento:
                articoli_con_errori.append(f"Articolo {art_id}, commento {idx}: manca campo 'autore'")
            if 'data' not in commento:
                articoli_con_errori.append(f"Articolo {art_id}, commento {idx}: manca campo 'data'")
            if 'testo' not in commento:
                articoli_con_errori.append(f"Articolo {art_id}, commento {idx}: manca campo 'testo'")
    
    # Riepilogo
    print("\n" + "="*60)
    print("RIEPILOGO")
    print("="*60)
    print(f"[OK] Articoli con commenti: {totale_articoli}")
    print(f"[OK] Totale commenti: {totale_commenti}")
    
    if articoli_con_errori:
        print(f"\n[WARN] Errori trovati: {len(articoli_con_errori)}")
        for err in articoli_con_errori[:5]:
            print(f"  - {err}")
    else:
        print("\n[OK] Struttura corretta!")
    
    # Mostra esempi
    if commenti:
        print("\n[INFO] Esempi commenti:")
        for idx, (art_id, commenti_list) in enumerate(list(commenti.items())[:3], 1):
            print(f"\n  Articolo {art_id} ({len(commenti_list)} commenti):")
            for comm in commenti_list[:2]:
                autore = comm.get('autore', 'N/A')
                data = comm.get('data', 'N/A')
                testo = comm.get('testo', '')[:80]
                print(f"    - {autore} ({data}): {testo}...")


if __name__ == "__main__":
    main()

