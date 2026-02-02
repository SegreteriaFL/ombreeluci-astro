#!/usr/bin/env python3
"""
Estrae immagini dal campo raw_html degli export batch
Cerca il primo URL di immagine (solitamente foto di testata Divi)
"""

import json
import re
from pathlib import Path
from typing import Dict, Optional
from collections import defaultdict

# Paths
EXPORT_BATCHES = [
    Path("2-1-25/export_1000_1.json"),
    Path("2-1-25/export_1000_2.json"),
    Path("2-1-25/export_1000_3.json"),
    Path("2-1-25/export_1000_4.json"),
]

OUTPUT_FILE = Path("datasets/articoli/mappa_immagini_v1.json")


def extract_first_image_url(raw_html: str) -> Optional[str]:
    """Estrae il primo URL di immagine dal raw_html"""
    if not raw_html:
        return None
    
    # Pattern per cercare URL immagini
    patterns = [
        # Tag <img> con src
        r'<img[^>]+src=["\']([^"\']*wp-content/uploads[^"\']+\.(jpg|jpeg|png|gif|webp))["\']',
        # Divi testimonial portrait_url
        r'portrait_url=["\']([^"\']*wp-content/uploads[^"\']+\.(jpg|jpeg|png|gif|webp))["\']',
        # Background image
        r'background_image_url=["\']([^"\']*wp-content/uploads[^"\']+\.(jpg|jpeg|png|gif|webp))["\']',
        # Link a immagini
        r'href=["\']([^"\']*wp-content/uploads[^"\']+\.(jpg|jpeg|png|gif|webp))["\']',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, raw_html, re.IGNORECASE)
        if matches:
            # Prendi il primo match (il primo elemento della tupla è l'URL)
            url = matches[0][0] if isinstance(matches[0], tuple) else matches[0]
            # Normalizza URL (rimuovi escape)
            url = url.replace('\\/', '/')
            # Assicurati che sia URL completo
            if url.startswith('http'):
                return url
            elif url.startswith('/'):
                return f"https://www.ombreeluci.it{url}"
            elif url.startswith('wp-content'):
                return f"https://www.ombreeluci.it/{url}"
    
    return None


def process_batch_files() -> Dict[int, str]:
    """Processa tutti i file batch e estrae immagini"""
    mappa_immagini = {}
    articoli_processati = 0
    articoli_con_immagine = 0
    
    print("="*60)
    print("ESTRAZIONE IMMAGINI DA RAW_HTML")
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
                
                raw_html = record.get('raw_html', '')
                if not raw_html:
                    continue
                
                # Estrai prima immagine
                image_url = extract_first_image_url(raw_html)
                
                if image_url:
                    # Se già esiste, mantieni la prima trovata
                    if articolo_id not in mappa_immagini:
                        mappa_immagini[articolo_id] = image_url
                        articoli_con_immagine += 1
                
                articoli_processati += 1
                
                if articoli_processati % 500 == 0:
                    print(f"  Processati {articoli_processati} articoli, {articoli_con_immagine} con immagini...")
        
        except Exception as e:
            print(f"[ERROR] Errore processando {batch_file}: {e}")
            continue
    
    print("\n" + "="*60)
    print("RIEPILOGO")
    print("="*60)
    print(f"[OK] Articoli processati: {articoli_processati}")
    print(f"[OK] Articoli con immagini trovate: {articoli_con_immagine}")
    print(f"[OK] Percentuale: {articoli_con_immagine/articoli_processati*100:.1f}%")
    
    return mappa_immagini


def main():
    """Esegue estrazione e salva risultato"""
    mappa_immagini = process_batch_files()
    
    # Salva risultato
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open('w', encoding='utf-8') as f:
        json.dump(mappa_immagini, f, ensure_ascii=False, indent=2)
    
    print(f"\n[OK] File salvato: {OUTPUT_FILE}")
    print(f"[OK] Totale immagini mappate: {len(mappa_immagini)}")
    
    # Mostra alcuni esempi
    if mappa_immagini:
        print("\n[INFO] Prime 5 immagini trovate:")
        for idx, (art_id, url) in enumerate(list(mappa_immagini.items())[:5], 1):
            print(f"  {idx}. Articolo {art_id}: {url[:80]}...")


if __name__ == "__main__":
    main()

