#!/usr/bin/env python3
"""
Genera slug definitivi per tutti gli articoli
Se non esiste slug, lo genera dal titolo
"""

import json
import re
from pathlib import Path
from typing import Dict, Set, Optional
from urllib.parse import unquote
from collections import defaultdict

# Paths
ARTICOLI_JSON = Path("datasets/articoli/articoli_semantici_FULL_2026.json")
NUMERI_JSON = Path("datasets/numeri_rivista/numeri_wp_FINAL.json")
OUTPUT_FILE = Path("datasets/articoli/articoli_slugs_definitivi.json")


def slugify(text: str) -> str:
    """Genera slug pulito da testo"""
    if not text:
        return ""
    
    # Rimuovi HTML tags se presenti
    text = re.sub(r'<[^>]+>', '', text)
    
    # Decodifica entità HTML
    text = unquote(text)
    
    # Converti in lowercase
    text = text.lower()
    
    # Rimuovi caratteri speciali, mantieni solo lettere, numeri e spazi
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    
    # Sostituisci spazi multipli con uno solo
    text = re.sub(r'\s+', ' ', text)
    
    # Sostituisci spazi con trattini
    text = text.replace(' ', '-')
    
    # Rimuovi trattini multipli
    text = re.sub(r'-+', '-', text)
    
    # Rimuovi trattini iniziali/finali
    text = text.strip('-')
    
    # Limita lunghezza (max 100 caratteri)
    if len(text) > 100:
        text = text[:100].rstrip('-')
    
    return text


def extract_slugs_from_numeri() -> Dict[int, str]:
    """Estrae slug dagli URL nei numeri rivista"""
    slug_map = {}
    
    print("Estraendo slug da numeri rivista...")
    
    if not NUMERI_JSON.exists():
        print(f"[WARN] File non trovato: {NUMERI_JSON}")
        return slug_map
    
    try:
        with NUMERI_JSON.open('r', encoding='utf-8') as f:
            numeri = json.load(f)
        
        for numero in numeri:
            articoli_urls = numero.get('articoli_urls', [])
            for url in articoli_urls:
                # Parse URL: https://www.ombreeluci.it/1976/slug-articolo/
                parts = url.rstrip('/').split('/')
                if len(parts) >= 2:
                    slug = parts[-1]
                    # Prova a estrarre ID dall'URL se possibile
                    # Nota: non abbiamo ID diretto, quindi useremo solo slug
                    # e matcheremo per titolo/URL
                    pass  # Gestiremo matching dopo
    
    except Exception as e:
        print(f"[ERROR] Errore leggendo numeri: {e}")
    
    return slug_map


def extract_slug_from_url(url: str) -> Optional[str]:
    """Estrae slug da URL articolo"""
    if not url:
        return None
    
    # Pattern: /anno/slug/ o /slug/
    match = re.search(r'/(\d{4})/([^/]+)/?$', url)
    if match:
        return match.group(2)
    
    return None


def build_url_to_id_map() -> Dict[str, int]:
    """Crea mappa URL -> ID articolo"""
    url_to_id = {}
    
    if not ARTICOLI_JSON.exists():
        return url_to_id
    
    print("Costruendo mappa URL -> ID...")
    
    try:
        with ARTICOLI_JSON.open('r', encoding='utf-8') as f:
            articoli = json.load(f)
        
        for art in articoli:
            url = art.get('url', '')
            art_id = art.get('id')
            if url and art_id:
                url_to_id[url] = art_id
    
    except Exception as e:
        print(f"[ERROR] Errore: {e}")
    
    return url_to_id


def match_slugs_from_numeri() -> Dict[int, str]:
    """Matcha slug dai numeri rivista agli articoli"""
    slug_map = {}
    url_to_id = build_url_to_id_map()
    
    if not NUMERI_JSON.exists():
        return slug_map
    
    print("Matchando slug da numeri rivista...")
    
    try:
        with NUMERI_JSON.open('r', encoding='utf-8') as f:
            numeri = json.load(f)
        
        for numero in numeri:
            articoli_urls = numero.get('articoli_urls', [])
            for url in articoli_urls:
                # Estrai slug dall'URL
                slug = extract_slug_from_url(url)
                if slug:
                    # Trova ID articolo corrispondente
                    # Cerca URL completo o parziale
                    for art_url, art_id in url_to_id.items():
                        if url in art_url or art_url in url:
                            slug_map[art_id] = slug
                            break
    
    except Exception as e:
        print(f"[ERROR] Errore: {e}")
    
    return slug_map


def main():
    """Genera slug definitivi per tutti gli articoli"""
    print("="*60)
    print("GENERAZIONE SLUG DEFINITIVI")
    print("="*60)
    
    if not ARTICOLI_JSON.exists():
        print(f"[ERROR] File non trovato: {ARTICOLI_JSON}")
        return
    
    # Carica articoli
    print("\nCaricamento articoli...")
    with ARTICOLI_JSON.open('r', encoding='utf-8') as f:
        articoli = json.load(f)
    
    print(f"[OK] Articoli caricati: {len(articoli)}")
    
    # Matcha slug da numeri rivista
    slug_map = match_slugs_from_numeri()
    print(f"[OK] Slug estratti da numeri rivista: {len(slug_map)}")
    
    # Genera slug mancanti dal titolo
    slug_generati = 0
    slug_duplicati = {}
    slug_contatore = defaultdict(int)
    
    print("\nGenerazione slug mancanti...")
    
    for art in articoli:
        art_id = art.get('id')
        if not art_id:
            continue
        
        # Se già abbiamo slug, salta
        if art_id in slug_map:
            continue
        
        # Genera slug dal titolo
        title = art.get('meta', {}).get('title', '')
        if not title:
            continue
        
        slug = slugify(title)
        if not slug:
            continue
        
        # Verifica duplicati
        slug_contatore[slug] += 1
        if slug_contatore[slug] > 1:
            # Aggiungi suffisso numerico per duplicati
            slug_base = slug
            counter = slug_contatore[slug] - 1
            slug = f"{slug_base}-{counter}"
            slug_duplicati[art_id] = slug
        else:
            slug_duplicati[art_id] = None
        
        slug_map[art_id] = slug
        slug_generati += 1
        
        if slug_generati % 500 == 0:
            print(f"  Generati {slug_generati} slug...")
    
    # Gestisci duplicati finali
    print("\nGestione duplicati...")
    slug_finali = {}
    slug_used = set()
    
    for art in articoli:
        art_id = art.get('id')
        if art_id not in slug_map:
            continue
        
        slug = slug_map[art_id]
        
        # Se slug già usato, aggiungi ID
        if slug in slug_used:
            slug = f"{slug}-{art_id}"
        
        slug_used.add(slug)
        slug_finali[art_id] = slug
    
    # Riepilogo
    print("\n" + "="*60)
    print("RIEPILOGO")
    print("="*60)
    print(f"[OK] Totale articoli: {len(articoli)}")
    print(f"[OK] Slug da numeri rivista: {len(slug_map) - slug_generati}")
    print(f"[OK] Slug generati da titolo: {slug_generati}")
    print(f"[OK] Slug totali: {len(slug_finali)}")
    
    # Conta duplicati risolti
    duplicati_risolti = sum(1 for v in slug_duplicati.values() if v)
    if duplicati_risolti > 0:
        print(f"[WARN] Duplicati risolti: {duplicati_risolti}")
    
    # Salva risultato
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open('w', encoding='utf-8') as f:
        json.dump(slug_finali, f, ensure_ascii=False, indent=2)
    
    print(f"\n[OK] File salvato: {OUTPUT_FILE}")
    
    # Mostra esempi
    print("\n[INFO] Esempi slug generati:")
    for idx, (art_id, slug) in enumerate(list(slug_finali.items())[:5], 1):
        art = next((a for a in articoli if a.get('id') == art_id), None)
        title = art.get('meta', {}).get('title', 'N/A') if art else 'N/A'
        print(f"  {idx}. ID {art_id}: '{title[:50]}...' -> {slug}")


if __name__ == "__main__":
    from typing import Optional
    main()

