#!/usr/bin/env python3
"""
Crea anagrafica autori completa
Per ogni autore: nome, slug, lista id_articoli
"""

import json
import re
from pathlib import Path
from collections import defaultdict
from typing import Dict, List

# Paths
ARTICOLI_JSON = Path("datasets/articoli/articoli_semantici_FULL_2026.json")
OUTPUT_FILE = Path("datasets/autori/database_autori.json")


def slugify_author(name: str) -> str:
    """Genera slug autore da nome"""
    if not name:
        return ""
    
    # Normalizza nome
    name = name.strip()
    
    # Converti in lowercase
    name = name.lower()
    
    # Rimuovi caratteri speciali, mantieni solo lettere, numeri e spazi
    name = re.sub(r'[^a-z0-9\s-]', '', name)
    
    # Sostituisci spazi multipli con uno solo
    name = re.sub(r'\s+', ' ', name)
    
    # Sostituisci spazi con trattini
    name = name.replace(' ', '-')
    
    # Rimuovi trattini multipli
    name = re.sub(r'-+', '-', name)
    
    # Rimuovi trattini iniziali/finali
    name = name.strip('-')
    
    return name


def normalize_author_name(name: str) -> str:
    """Normalizza nome autore (rimuove varianti)"""
    if not name:
        return ""
    
    # Rimuovi spazi multipli
    name = re.sub(r'\s+', ' ', name.strip())
    
    # Normalizza apostrofi e virgolette
    name = name.replace("'", "'").replace('"', '"')
    
    return name


def main():
    """Crea anagrafica autori"""
    print("="*60)
    print("CREAZIONE ANAGRAFICA AUTORI")
    print("="*60)
    
    if not ARTICOLI_JSON.exists():
        print(f"[ERROR] File non trovato: {ARTICOLI_JSON}")
        return
    
    # Carica articoli
    print("\nCaricamento articoli...")
    with ARTICOLI_JSON.open('r', encoding='utf-8') as f:
        articoli = json.load(f)
    
    print(f"[OK] Articoli caricati: {len(articoli)}")
    
    # Raggruppa articoli per autore
    autori_map = defaultdict(list)
    autori_nomi = {}
    
    print("\nRaggruppamento articoli per autore...")
    
    for art in articoli:
        art_id = art.get('id')
        if not art_id:
            continue
        
        author_raw = art.get('meta', {}).get('author', '').strip()
        if not author_raw:
            continue
        
        # Normalizza nome autore
        author_normalized = normalize_author_name(author_raw)
        
        # Salva nome originale (primo trovato)
        if author_normalized not in autori_nomi:
            autori_nomi[author_normalized] = author_raw
        
        # Aggiungi articolo all'autore
        autori_map[author_normalized].append(art_id)
    
    # Crea struttura finale
    database_autori = []
    
    print("\nCreazione database autori...")
    
    for author_normalized, articoli_ids in autori_map.items():
        author_name = autori_nomi[author_normalized]
        author_slug = slugify_author(author_normalized)
        
        # Ordina articoli per ID
        articoli_ids_sorted = sorted(articoli_ids)
        
        autore_record = {
            "id_autore": author_slug,
            "nome_completo": author_name,
            "nome_normalizzato": author_normalized,
            "slug": author_slug,
            "articoli_ids": articoli_ids_sorted,
            "totale_articoli": len(articoli_ids_sorted)
        }
        
        database_autori.append(autore_record)
    
    # Ordina per numero articoli (decrescente)
    database_autori.sort(key=lambda x: x['totale_articoli'], reverse=True)
    
    # Riepilogo
    print("\n" + "="*60)
    print("RIEPILOGO")
    print("="*60)
    print(f"[OK] Totale autori unici: {len(database_autori)}")
    print(f"[OK] Totale articoli assegnati: {sum(a['totale_articoli'] for a in database_autori)}")
    
    # Top 10 autori
    print("\n[INFO] Top 10 autori per numero articoli:")
    for idx, autore in enumerate(database_autori[:10], 1):
        print(f"  {idx}. {autore['nome_completo']}: {autore['totale_articoli']} articoli (slug: {autore['slug']})")
    
    # Verifica varianti
    print("\n[INFO] Verifica varianti nomi...")
    varianti_trovate = []
    autori_lower = {k.lower(): k for k in autori_map.keys()}
    
    for author_norm in autori_map.keys():
        author_lower = author_norm.lower()
        # Cerca altri autori con stesso nome lowercase
        matches = [k for k, v in autori_lower.items() if k == author_lower and v != author_norm]
        if matches:
            varianti_trovate.append((author_norm, matches))
    
    if varianti_trovate:
        print(f"[WARN] Trovate {len(varianti_trovate)} possibili varianti:")
        for orig, matches in varianti_trovate[:5]:
            print(f"  '{orig}' vs {matches}")
    else:
        print("[OK] Nessuna variante evidente trovata")
    
    # Salva risultato
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open('w', encoding='utf-8') as f:
        json.dump(database_autori, f, ensure_ascii=False, indent=2)
    
    print(f"\n[OK] File salvato: {OUTPUT_FILE}")
    
    # Statistiche aggiuntive
    autori_singolo = sum(1 for a in database_autori if a['totale_articoli'] == 1)
    autori_multi = len(database_autori) - autori_singolo
    
    print(f"\n[STATS] Autori con 1 solo articolo: {autori_singolo}")
    print(f"[STATS] Autori con più articoli: {autori_multi}")


if __name__ == "__main__":
    main()

