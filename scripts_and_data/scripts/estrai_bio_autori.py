#!/usr/bin/env python3
"""
Estrae le bio degli autori dai file export JSON
Cerca nel campo description degli utenti o in altri campi disponibili
"""

import json
import re
from pathlib import Path
from typing import Dict, Any, Optional
from collections import defaultdict

BASE_DIR = Path(__file__).parent.parent.parent
EXPORT_DIR = BASE_DIR / "_migration_archive" / "export pulito db 2026"
OUTPUT_FILE = BASE_DIR / "scripts_and_data" / "datasets" / "autori" / "autori_bio.json"


def normalize_author_name(name: str) -> str:
    """Normalizza nome autore per slug"""
    import unicodedata
    slug = name.lower()
    slug = unicodedata.normalize('NFD', slug)
    slug = re.sub(r'[\u0300-\u036f]', '', slug)
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = re.sub(r'^-|-$', '', slug)
    return slug


def extract_author_bio_from_html(raw_html: str, author_name: str) -> Optional[str]:
    """Cerca bio autore nell'HTML (spesso in testimonial o sidebar)"""
    if not raw_html:
        return None
    
    # Pattern comune: testimonial con nome autore
    patterns = [
        rf'<p[^>]*>{re.escape(author_name)}[^<]*</p>',
        rf'<div[^>]*class="[^"]*testimonial[^"]*"[^>]*>.*?{re.escape(author_name)}.*?</div>',
        rf'<p[^>]*>{re.escape(author_name)}.*?</p>',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, raw_html, re.IGNORECASE | re.DOTALL)
        if match:
            # Estrai testo pulito
            bio_html = match.group(0)
            # Rimuovi tag HTML
            bio = re.sub(r'<[^>]+>', ' ', bio_html)
            bio = re.sub(r'\s+', ' ', bio).strip()
            if len(bio) > 50:  # Solo se abbastanza lungo
                return bio
    
    return None


def load_export_files() -> Dict[str, Dict[str, Any]]:
    """Carica tutti i file export e estrae info autori"""
    print("Caricamento file export...")
    autori_map = defaultdict(lambda: {
        'nome': '',
        'bio': None,
        'articoli_count': 0,
    })
    
    for i in range(1, 5):
        export_file = EXPORT_DIR / f"export_1000_{i}.json"
        if not export_file.exists():
            continue
        
        try:
            with export_file.open('r', encoding='utf-8') as f:
                data = json.load(f)
                for art in data:
                    author = art.get('meta', {}).get('author', '').strip()
                    if not author or author == 'Redazione':
                        continue
                    
                    if not autori_map[author]['nome']:
                        autori_map[author]['nome'] = author
                    
                    autori_map[author]['articoli_count'] += 1
                    
                    # Cerca bio nell'HTML se non ancora trovata
                    if not autori_map[author]['bio']:
                        raw_html = art.get('raw_html', '')
                        bio = extract_author_bio_from_html(raw_html, author)
                        if bio:
                            autori_map[author]['bio'] = bio
        except Exception as e:
            print(f"  [ERROR] Errore caricando {export_file.name}: {e}")
    
    print(f"  [OK] Trovati {len(autori_map)} autori")
    return autori_map


def main():
    print("=" * 60)
    print("ESTRAZIONE BIO AUTORI")
    print("=" * 60)
    
    autori_map = load_export_files()
    
    # Converti in lista per JSON
    autori_list = []
    autori_con_bio = 0
    
    for nome, data in sorted(autori_map.items()):
        slug = normalize_author_name(nome)
        
        autore = {
            'slug': slug,
            'nome_completo': nome,
            'bio': data['bio'],
            'articoli_count': data['articoli_count'],
        }
        
        if data['bio']:
            autori_con_bio += 1
        
        autori_list.append(autore)
    
    # Salva JSON
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open('w', encoding='utf-8') as f:
        json.dump(autori_list, f, ensure_ascii=False, indent=2)
    
    print(f"\n[OK] Bio estratte: {autori_con_bio}/{len(autori_list)}")
    print(f"[OK] File salvato: {OUTPUT_FILE}")


if __name__ == '__main__':
    main()

