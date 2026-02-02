#!/usr/bin/env python3
"""
Script di verifica base dati per migrazione Astro
Verifica coverage, incongruenze e metadati mancanti
"""

import json
import csv
from pathlib import Path
from collections import Counter, defaultdict
from typing import Dict, Set, List, Any

# Paths
ARTICOLI_JSON = Path("datasets/articoli/articoli_semantici_FULL_2026.json")
CATALOGAZIONE_CSV = Path("categorie v2/articoli_2026_enriched_temi_s8_FINAL_V3.csv")
THEMES_JSON = Path("categorie v2/themes_v1.json")
NUMERI_JSON = Path("datasets/numeri_rivista/numeri_wp_FINAL.json")


def load_articoli() -> List[Dict[str, Any]]:
    """Carica articoli da JSON"""
    print(f"Caricamento articoli da {ARTICOLI_JSON}...")
    with open(ARTICOLI_JSON, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_catalogazione() -> Dict[int, Dict[str, Any]]:
    """Carica catalogazione tematica da CSV"""
    print(f"Caricamento catalogazione da {CATALOGAZIONE_CSV}...")
    catalogazione = {}
    with open(CATALOGAZIONE_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            id_art = int(row['id_articolo'])
            catalogazione[id_art] = row
    return catalogazione


def load_themes() -> Dict[str, Dict[str, Any]]:
    """Carica temi da JSON"""
    print(f"Caricamento temi da {THEMES_JSON}...")
    with open(THEMES_JSON, 'r', encoding='utf-8') as f:
        themes = json.load(f)
    return {t['id_tema']: t for t in themes}


def load_numeri() -> List[Dict[str, Any]]:
    """Carica numeri rivista da JSON"""
    print(f"Caricamento numeri da {NUMERI_JSON}...")
    with open(NUMERI_JSON, 'r', encoding='utf-8') as f:
        return json.load(f)


def verifica_coverage(articoli: List[Dict], catalogazione: Dict[int, Dict]) -> None:
    """Verifica coverage tra JSON articoli e CSV catalogazione"""
    print("\n" + "="*60)
    print("VERIFICA COVERAGE ARTICOLI <-> CATALOGAZIONE")
    print("="*60)
    
    articoli_ids_json = {a['id'] for a in articoli}
    articoli_ids_csv = set(catalogazione.keys())
    
    mancanti_json = articoli_ids_csv - articoli_ids_json
    mancanti_csv = articoli_ids_json - articoli_ids_csv
    
    print(f"[OK] Articoli in JSON: {len(articoli_ids_json)}")
    print(f"[OK] Articoli in CSV: {len(articoli_ids_csv)}")
    print(f"[OK] Articoli in comune: {len(articoli_ids_json & articoli_ids_csv)}")
    
    if mancanti_json:
        print(f"[WARN] Articoli in CSV ma NON in JSON: {len(mancanti_json)}")
        print(f"   Primi 10: {list(mancanti_json)[:10]}")
    
    if mancanti_csv:
        print(f"[WARN] Articoli in JSON ma NON in CSV: {len(mancanti_csv)}")
        print(f"   Primi 10: {list(mancanti_csv)[:10]}")
        print(f"   Questi articoli NON hanno catalogazione tematica!")


def verifica_autori(articoli: List[Dict]) -> None:
    """Verifica autori unici e varianti"""
    print("\n" + "="*60)
    print("VERIFICA AUTORI")
    print("="*60)
    
    autori_counter = Counter()
    autori_per_articolo = []
    
    for a in articoli:
        author = a.get('meta', {}).get('author', '').strip()
        if author:
            autori_counter[author] += 1
            autori_per_articolo.append((a['id'], author))
        else:
            autori_per_articolo.append((a['id'], None))
    
    print(f"[OK] Totale autori unici: {len(autori_counter)}")
    print(f"[OK] Articoli con autore: {sum(1 for _, a in autori_per_articolo if a)}")
    print(f"[WARN] Articoli senza autore: {sum(1 for _, a in autori_per_articolo if not a)}")
    
    # Top 10 autori
    print(f"\n[INFO] Top 10 autori per numero articoli:")
    for author, count in autori_counter.most_common(10):
        print(f"   {author}: {count} articoli")
    
    # Cerca varianti (nomi simili)
    print(f"\n[INFO] Verifica varianti nomi (primi 20 autori):")
    autori_list = [a for a, _ in autori_counter.most_common(20)]
    for i, a1 in enumerate(autori_list):
        for a2 in autori_list[i+1:]:
            # Normalizza per confronto (lowercase, rimuovi spazi/punteggiatura)
            n1 = ''.join(c.lower() for c in a1 if c.isalnum())
            n2 = ''.join(c.lower() for c in a2 if c.isalnum())
            if n1 == n2 and a1 != a2:
                print(f"   [WARN] Possibile variante: '{a1}' <-> '{a2}'")


def verifica_slugs(articoli: List[Dict], numeri: List[Dict]) -> None:
    """Verifica disponibilità slug articoli"""
    print("\n" + "="*60)
    print("VERIFICA SLUG ARTICOLI")
    print("="*60)
    
    # Conta URL format
    url_formats = Counter()
    for a in articoli:
        url = a.get('url', '')
        if '?p=' in url:
            url_formats['query_string'] += 1
        elif url.startswith('https://www.ombreeluci.it/'):
            url_formats['permalink'] += 1
        else:
            url_formats['other'] += 1
    
    print(f"[OK] Articoli con URL query string (?p=ID): {url_formats['query_string']}")
    print(f"[OK] Articoli con URL permalink (/anno/slug/): {url_formats['permalink']}")
    print(f"[WARN] Articoli con URL altro formato: {url_formats['other']}")
    
    # Estrai slug da numeri rivista (articoli_urls)
    slug_from_numeri = set()
    for num in numeri:
        for url in num.get('articoli_urls', []):
            # Parse URL: https://www.ombreeluci.it/1976/slug-articolo/
            parts = url.rstrip('/').split('/')
            if len(parts) >= 2:
                slug = parts[-1]
                slug_from_numeri.add(slug)
    
    print(f"\n[OK] Slug estratti da numeri rivista: {len(slug_from_numeri)}")
    print(f"   Primi 5: {list(slug_from_numeri)[:5]}")
    
    # Verifica se possiamo matchare con articoli
    print(f"\n[WARN] PROBLEMA: Non abbiamo slug negli articoli JSON")
    print(f"   Soluzione: Estrarre slug da URL numeri o generare da titolo")


def verifica_temi(articoli: List[Dict], catalogazione: Dict[int, Dict], themes: Dict[str, Dict]) -> None:
    """Verifica distribuzione temi"""
    print("\n" + "="*60)
    print("VERIFICA DISTRIBUZIONE TEMI")
    print("="*60)
    
    temi_counter = Counter()
    cluster0_count = 0
    
    for id_art, cat in catalogazione.items():
        tema_code = cat.get('tema_code', '').strip()
        if tema_code:
            temi_counter[tema_code] += 1
        else:
            cluster0_count += 1
    
    print(f"[OK] Articoli catalogati per tema:")
    for tema_code in sorted(temi_counter.keys()):
        tema_info = themes.get(tema_code, {})
        label = tema_info.get('label', tema_code)
        count = temi_counter[tema_code]
        print(f"   {tema_code}: {label} - {count} articoli")
    
    print(f"\n[WARN] Articoli Cluster 0 (non catalogati): {cluster0_count}")


def verifica_numeri_rivista(numeri: List[Dict]) -> None:
    """Verifica numeri rivista e relazioni articoli"""
    print("\n" + "="*60)
    print("VERIFICA NUMERI RIVISTA")
    print("="*60)
    
    print(f"[OK] Totale numeri: {len(numeri)}")
    
    numeri_con_articoli = sum(1 for n in numeri if n.get('articoli_urls'))
    numeri_con_ids = sum(1 for n in numeri if n.get('articoli_ids'))
    
    print(f"[OK] Numeri con articoli_urls: {numeri_con_articoli}")
    print(f"[WARN] Numeri con articoli_ids: {numeri_con_ids} (sempre vuoto!)")
    
    # Conta articoli totali nei numeri
    total_articoli_urls = sum(len(n.get('articoli_urls', [])) for n in numeri)
    print(f"[OK] Totale articoli_urls nei numeri: {total_articoli_urls}")
    
    # Verifica Archive.org
    numeri_con_archive = sum(1 for n in numeri if n.get('archive_org_item_id'))
    print(f"[OK] Numeri con Archive.org: {numeri_con_archive}")


def verifica_immagini(articoli: List[Dict]) -> None:
    """Verifica presenza immagini negli articoli"""
    print("\n" + "="*60)
    print("VERIFICA IMMAGINI")
    print("="*60)
    
    articoli_con_img = 0
    total_img = 0
    
    for a in articoli:
        html = a.get('html_pulito', '')
        if '<img' in html:
            articoli_con_img += 1
            total_img += html.count('<img')
    
    print(f"[OK] Articoli con immagini: {articoli_con_img} / {len(articoli)}")
    print(f"[OK] Totale tag <img> trovati: {total_img}")
    print(f"[WARN] NON c'è campo featured_image dedicato")


def main():
    """Esegui tutte le verifiche"""
    print("="*60)
    print("VERIFICA BASE DATI - MIGRAZIONE ASTRO")
    print("="*60)
    
    # Carica dati
    articoli = load_articoli()
    catalogazione = load_catalogazione()
    themes = load_themes()
    numeri = load_numeri()
    
    # Esegui verifiche
    verifica_coverage(articoli, catalogazione)
    verifica_autori(articoli)
    verifica_slugs(articoli, numeri)
    verifica_temi(articoli, catalogazione, themes)
    verifica_numeri_rivista(numeri)
    verifica_immagini(articoli)
    
    # Riepilogo
    print("\n" + "="*60)
    print("RIEPILOGO FINALE")
    print("="*60)
    print(f"[OK] Articoli totali: {len(articoli)}")
    print(f"[OK] Articoli catalogati: {len(catalogazione)}")
    print(f"[OK] Temi disponibili: {len(themes)}")
    print(f"[OK] Numeri rivista: {len(numeri)}")
    print("\n[WARN] PROBLEMI CRITICI DA RISOLVERE:")
    print("   1. Mancanza slug articoli (necessario per URL Astro)")
    print("   2. Autori non normalizzati (varianti nomi)")
    print("   3. Numeri rivista: articoli_ids sempre vuoto")
    print("   4. Immagini: solo in HTML, non featured_image dedicato")


if __name__ == "__main__":
    main()

