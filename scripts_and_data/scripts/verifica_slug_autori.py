#!/usr/bin/env python3
"""
Verifica che ogni autore abbia slug unico e non ci siano collisioni
"""

import json
from pathlib import Path
from collections import Counter

AUTORI_FILE = Path("datasets/autori/database_autori.json")


def main():
    """Verifica slug autori"""
    print("="*60)
    print("VERIFICA SLUG AUTORI")
    print("="*60)
    
    if not AUTORI_FILE.exists():
        print(f"[ERROR] File non trovato: {AUTORI_FILE}")
        return
    
    with AUTORI_FILE.open('r', encoding='utf-8') as f:
        autori = json.load(f)
    
    print(f"[OK] Caricati {len(autori)} autori")
    
    # Verifica slug unici
    slug_counter = Counter()
    slug_to_autori = {}
    
    for autore in autori:
        slug = autore.get('slug', '')
        nome = autore.get('nome_completo', 'N/A')
        
        if not slug:
            print(f"[WARN] Autore senza slug: {nome}")
            continue
        
        slug_counter[slug] += 1
        
        if slug not in slug_to_autori:
            slug_to_autori[slug] = []
        slug_to_autori[slug].append(nome)
    
    # Trova collisioni
    collisioni = {slug: autori_list for slug, autori_list in slug_to_autori.items() if len(autori_list) > 1}
    
    print("\n" + "="*60)
    print("RIEPILOGO")
    print("="*60)
    print(f"[OK] Totale autori: {len(autori)}")
    print(f"[OK] Autori con slug: {len(slug_counter)}")
    
    if collisioni:
        print(f"\n[WARN] Trovate {len(collisioni)} collisioni di slug:")
        for slug, autori_list in list(collisioni.items())[:10]:
            print(f"  Slug '{slug}' usato da:")
            for nome in autori_list:
                print(f"    - {nome}")
    else:
        print("\n[OK] Nessuna collisione di slug trovata!")
        print("[OK] Tutti gli autori hanno slug unici")
    
    # Verifica formato slug
    print("\n[INFO] Verifica formato slug...")
    slug_invalidi = []
    for autore in autori:
        slug = autore.get('slug', '')
        if slug:
            # Verifica formato (solo lowercase, trattini, numeri)
            if not all(c.islower() or c.isdigit() or c == '-' for c in slug):
                slug_invalidi.append((autore.get('nome_completo', 'N/A'), slug))
    
    if slug_invalidi:
        print(f"[WARN] Trovati {len(slug_invalidi)} slug con formato non standard:")
        for nome, slug in slug_invalidi[:5]:
            print(f"  {nome}: '{slug}'")
    else:
        print("[OK] Tutti gli slug hanno formato corretto")


if __name__ == "__main__":
    main()

