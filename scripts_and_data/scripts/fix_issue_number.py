#!/usr/bin/env python3
"""
Script per aggiungere/correggere issue_number nel frontmatter degli articoli
Associa gli articoli ai numeri rivista usando numero_rivista + anno_rivista
Se mancante, usa la data del post per trovare il numero corrispondente
"""

import json
import re
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent.parent
CONTENT_DIR = BASE_DIR / "src" / "content" / "blog"
NUMERI_JSON = BASE_DIR / "scripts_and_data" / "datasets" / "numeri_rivista" / "numeri_wp_FINAL.json"


def load_numeri() -> Dict[str, Dict[str, Any]]:
    """Carica numeri rivista e crea mappa per lookup rapido"""
    print(f"Caricamento {NUMERI_JSON.name}...")
    with NUMERI_JSON.open('r', encoding='utf-8') as f:
        numeri = json.load(f)
    
    # Crea mappa: (numero_progressivo, anno) -> id_numero
    mappa = {}
    for numero in numeri:
        key = (numero['numero_progressivo'], numero['anno_pubblicazione'])
        mappa[key] = numero['id_numero']
    
    print(f"  [OK] Caricati {len(numeri)} numeri")
    return mappa, numeri


def extract_frontmatter(content: str) -> tuple[Optional[str], str]:
    """Estrae frontmatter e body da un file markdown"""
    if not content.startswith('---'):
        return None, content
    
    parts = content.split('---', 2)
    if len(parts) < 3:
        return None, content
    
    return parts[1], parts[2]


def parse_frontmatter(frontmatter: str) -> Dict[str, Any]:
    """Parse frontmatter YAML semplice"""
    data = {}
    for line in frontmatter.split('\n'):
        line = line.strip()
        if ':' in line and not line.startswith('#'):
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            
            # Converti numeri
            if value.isdigit():
                value = int(value)
            elif value.replace('.', '').isdigit():
                value = float(value)
            elif value.lower() in ('true', 'false'):
                value = value.lower() == 'true'
            
            data[key] = value
    return data


def find_issue_by_date(date_str: str, numeri: list) -> Optional[str]:
    """Trova il numero rivista più vicino alla data dell'articolo"""
    try:
        # Parse data articolo
        art_date = datetime.strptime(date_str[:10], '%Y-%m-%d')
        art_year = art_date.year
        art_month = art_date.month
    except:
        return None
    
    # Cerca numero con stesso anno
    candidates = [n for n in numeri if n['anno_pubblicazione'] == art_year]
    
    if not candidates:
        return None
    
    # Ordina per numero progressivo (più recente prima)
    candidates.sort(key=lambda x: x['numero_progressivo'], reverse=True)
    
    # Prendi il primo candidato (più probabile)
    return candidates[0]['id_numero']


def update_issue_number(md_file: Path, mappa: Dict, numeri: list) -> tuple[bool, str]:
    """Aggiorna issue_number nel frontmatter"""
    try:
        content = md_file.read_text(encoding='utf-8')
    except Exception as e:
        return False, f"Errore lettura: {e}"
    
    frontmatter, body = extract_frontmatter(content)
    if not frontmatter:
        return False, "Nessun frontmatter trovato"
    
    data = parse_frontmatter(frontmatter)
    
    # Estrai numero_rivista e anno_rivista
    numero_rivista = data.get('numero_rivista')
    anno_rivista = data.get('anno_rivista')
    date_str = data.get('date', '')
    
    issue_number = None
    
    # Metodo 1: Usa numero_rivista + anno_rivista
    if numero_rivista and anno_rivista:
        key = (int(numero_rivista), int(anno_rivista))
        issue_number = mappa.get(key)
    
    # Metodo 2: Se non trovato, usa la data
    if not issue_number and date_str:
        issue_number = find_issue_by_date(date_str, numeri)
    
    if not issue_number:
        return False, "Nessun numero trovato"
    
    # Verifica se issue_number è già presente e corretto
    current_issue = data.get('issue_number')
    if current_issue == issue_number:
        return False, "Già corretto"
    
    # Aggiungi o aggiorna issue_number
    if 'issue_number:' in frontmatter:
        # Sostituisci esistente
        frontmatter = re.sub(
            r'issue_number:\s*[^\n]+',
            f'issue_number: {issue_number}',
            frontmatter
        )
    else:
        # Aggiungi dopo numero_rivista o anno_rivista se presente
        if 'anno_rivista:' in frontmatter:
            frontmatter = re.sub(
                r'(anno_rivista:[^\n]+)',
                f'\\1\nissue_number: {issue_number}',
                frontmatter
            )
        elif 'numero_rivista:' in frontmatter:
            frontmatter = re.sub(
                r'(numero_rivista:[^\n]+)',
                f'\\1\nissue_number: {issue_number}',
                frontmatter
            )
        else:
            # Aggiungi alla fine del frontmatter
            frontmatter = frontmatter.rstrip() + f'\nissue_number: {issue_number}\n'
    
    # Ricostruisci file
    new_content = f"---{frontmatter}---{body}"
    
    try:
        md_file.write_text(new_content, encoding='utf-8')
        return True, issue_number
    except Exception as e:
        return False, f"Errore scrittura: {e}"


def main():
    print("=" * 60)
    print("FIX ISSUE_NUMBER NEGLI ARTICOLI")
    print("=" * 60)
    
    mappa, numeri = load_numeri()
    
    # Trova tutti i file markdown
    md_files = list(CONTENT_DIR.rglob('*.md'))
    print(f"\nTrovati {len(md_files)} file markdown")
    
    stats = {
        'total': len(md_files),
        'updated': 0,
        'already_correct': 0,
        'not_found': 0,
        'errors': 0,
    }
    
    print("\nAggiornamento issue_number...")
    for i, md_file in enumerate(md_files, 1):
        if i % 500 == 0:
            print(f"  Processati {i}/{len(md_files)} file...")
        
        updated, message = update_issue_number(md_file, mappa, numeri)
        
        if updated:
            stats['updated'] += 1
        elif message == "Già corretto":
            stats['already_correct'] += 1
        elif "Nessun numero trovato" in message:
            stats['not_found'] += 1
        else:
            stats['errors'] += 1
    
    # Report finale
    print("\n" + "=" * 60)
    print("REPORT FINALE")
    print("=" * 60)
    print(f"Totale file processati: {stats['total']}")
    print(f"File aggiornati: {stats['updated']}")
    print(f"Già corretti: {stats['already_correct']}")
    print(f"Numero non trovato: {stats['not_found']}")
    print(f"Errori: {stats['errors']}")
    print(f"\n[OK] Completato!")


if __name__ == '__main__':
    main()

