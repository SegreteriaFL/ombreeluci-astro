#!/usr/bin/env python3
"""
Ultimo tentativo di mapping issue_number
Cerca pattern 'numero-' nelle categorie o slug dei file sorgente
"""

import json
import re
from pathlib import Path
from typing import Dict, Any, Optional

BASE_DIR = Path(__file__).parent.parent.parent
CONTENT_DIR = BASE_DIR / "src" / "content" / "blog"
EXPORT_DIR = BASE_DIR / "_migration_archive" / "export pulito db 2026"
NUMERI_JSON = BASE_DIR / "scripts_and_data" / "datasets" / "numeri_rivista" / "numeri_wp_FINAL.json"


def load_export_files() -> Dict[int, Dict[str, Any]]:
    """Carica tutti i file export_1000_*.json"""
    print("Caricamento file export...")
    articles = {}
    
    for i in range(1, 5):
        export_file = EXPORT_DIR / f"export_1000_{i}.json"
        if not export_file.exists():
            continue
        
        try:
            with export_file.open('r', encoding='utf-8') as f:
                data = json.load(f)
                for art in data:
                    wp_id = art.get('id')
                    if wp_id:
                        articles[wp_id] = art
        except Exception as e:
            print(f"  [ERROR] Errore caricando {export_file.name}: {e}")
    
    print(f"  [OK] Totale articoli caricati: {len(articles)}")
    return articles


def load_numeri() -> Dict[Tuple[int, int], str]:
    """Carica numeri rivista e crea mappa (numero, anno) -> id_numero"""
    print(f"\nCaricamento {NUMERI_JSON.name}...")
    with NUMERI_JSON.open('r', encoding='utf-8') as f:
        numeri = json.load(f)
    
    mappa = {}
    for numero in numeri:
        key = (numero['numero_progressivo'], numero['anno_pubblicazione'])
        mappa[key] = numero['id_numero']
    
    print(f"  [OK] Caricati {len(numeri)} numeri")
    return mappa


def extract_numero_from_article(article: Dict[str, Any]) -> Optional[Tuple[int, int]]:
    """Estrae numero e anno da categorie o slug"""
    # Metodo 1: Cerca nelle categorie
    categories = article.get('tax', {}).get('categories', [])
    for cat in categories:
        slug = cat.get('slug', '')
        if 'numero-' in slug.lower():
            match = re.match(r'numero-(\d+)-(\d{4})', slug)
            if match:
                numero = int(match.group(1))
                anno = int(match.group(2))
                return (numero, anno)
    
    # Metodo 2: Cerca nello slug dell'URL
    url = article.get('url', '')
    if url:
        # Cerca pattern numero-X-YYYY nell'URL
        match = re.search(r'numero-(\d+)-(\d{4})', url)
        if match:
            numero = int(match.group(1))
            anno = int(match.group(2))
            return (numero, anno)
    
    return None


def extract_frontmatter(content: str) -> tuple[Optional[str], str]:
    """Estrae frontmatter e body"""
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
            data[key] = value
    return data


def update_article(md_file: Path, export_articles: Dict, numeri_map: Dict) -> tuple[bool, str]:
    """Aggiorna issue_number se trovato nei sorgenti"""
    try:
        content = md_file.read_text(encoding='utf-8')
    except Exception as e:
        return False, f"Errore lettura: {e}"
    
    frontmatter, body = extract_frontmatter(content)
    if not frontmatter:
        return False, "Nessun frontmatter"
    
    data = parse_frontmatter(frontmatter)
    wp_id = data.get('wp_id')
    
    if not wp_id:
        return False, "wp_id non trovato"
    
    # Cerca nei file export
    export_art = export_articles.get(int(wp_id))
    if not export_art:
        return False, "Articolo non trovato nei sorgenti"
    
    # Estrai numero
    result = extract_numero_from_article(export_art)
    if not result:
        return False, "Pattern numero- non trovato"
    
    numero_rivista, anno_rivista = result
    issue_number = numeri_map.get((numero_rivista, anno_rivista))
    
    if not issue_number:
        return False, f"Numero {numero_rivista} ({anno_rivista}) non trovato in numeri_wp_FINAL.json"
    
    # Verifica se issue_number è già presente e corretto
    current_issue = data.get('issue_number')
    if current_issue == issue_number:
        return False, "Già corretto"
    
    # Aggiorna o aggiungi issue_number
    if 'issue_number:' in frontmatter:
        frontmatter = re.sub(
            r'issue_number:\s*[^\n]+',
            f'issue_number: {issue_number}',
            frontmatter
        )
    else:
        # Aggiungi dopo anno_rivista se presente
        if 'anno_rivista:' in frontmatter:
            frontmatter = re.sub(
                r'(anno_rivista:[^\n]+)',
                f'\\1\nissue_number: {issue_number}',
                frontmatter
            )
        else:
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
    print("FIX ISSUE_NUMBER FINALE - Pattern numero-")
    print("=" * 60)
    
    # Carica dati
    export_articles = load_export_files()
    numeri_map = load_numeri()
    
    # Trova tutti i file markdown
    md_files = list(CONTENT_DIR.rglob('*.md'))
    print(f"\nTrovati {len(md_files)} file markdown")
    
    stats = {
        'total': len(md_files),
        'updated': 0,
        'already_correct': 0,
        'not_found': 0,
        'no_wp_id': 0,
        'errors': 0,
    }
    
    print("\nAggiornamento issue_number...")
    for i, md_file in enumerate(md_files, 1):
        if i % 500 == 0:
            print(f"  Processati {i}/{len(md_files)} file...")
        
        updated, message = update_article(md_file, export_articles, numeri_map)
        
        if updated:
            stats['updated'] += 1
        elif "Già corretto" in message:
            stats['already_correct'] += 1
        elif "wp_id non trovato" in message:
            stats['no_wp_id'] += 1
        elif "non trovato" in message:
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
    print(f"File senza wp_id: {stats['no_wp_id']}")
    print(f"Pattern non trovato: {stats['not_found']}")
    print(f"Errori: {stats['errors']}")
    print(f"\n[OK] Completato!")


if __name__ == '__main__':
    from typing import Tuple
    main()

