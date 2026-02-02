#!/usr/bin/env python3
"""Verifica unified_data.json"""
import json
from pathlib import Path

f = open('datasets/articoli/unified_data.json', 'r', encoding='utf-8')
data = json.load(f)
f.close()

with_comments = [a for a in data.values() if a.get('commenti') and len(a['commenti']) > 0]
total_comments = sum(len(a['commenti']) for a in with_comments)

print("="*60)
print("REPORT FINALE UNIFICAZIONE DATI")
print("="*60)
print(f"\nArticoli totali nel JSON unificato: {len(data)}")
print(f"Articoli con almeno un commento: {len(with_comments)}")
print(f"Totale commenti: {total_comments}")
print(f"Articoli con immagine associata: {sum(1 for a in data.values() if a.get('immagine'))}")
print(f"Articoli con slug: {sum(1 for a in data.values() if a.get('slug'))}")
print(f"Articoli con dati autore completi: {sum(1 for a in data.values() if a.get('autore', {}).get('nome_completo'))}")

if with_comments:
    sample = with_comments[0]
    print(f"\nEsempio articolo con commenti:")
    print(f"  ID: {sample['id']}")
    print(f"  Title: {sample['title'][:60]}...")
    print(f"  Commenti: {len(sample['commenti'])}")
    print(f"  Primo commento:")
    if sample['commenti']:
        comm = sample['commenti'][0]
        print(f"    Autore: {comm.get('autore', 'N/A')}")
        print(f"    Data: {comm.get('data', 'N/A')}")
        print(f"    Testo: {comm.get('testo', 'N/A')[:80]}...")

print("\n" + "="*60)

