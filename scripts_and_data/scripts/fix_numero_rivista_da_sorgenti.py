#!/usr/bin/env python3
"""
Script per aggiornare numero_rivista e anno_rivista dai file sorgente
Scansiona export_1000_*.json e CSV per estrarre i numeri rivista corretti
"""

import json
import csv
import re
from pathlib import Path
from typing import Dict, Any, Optional, Tuple

BASE_DIR = Path(__file__).parent.parent.parent
CONTENT_DIR = BASE_DIR / "src" / "content" / "blog"
EXPORT_DIR = BASE_DIR / "_migration_archive" / "export pulito db 2026"
CSV_FILE = BASE_DIR / "_migration_archive" / "export pulito db 2026" / "out" / "articoli_2026_enriched_temi_s8_FINAL_EXTENDED.csv"
NUMERI_JSON = BASE_DIR / "scripts_and_data" / "datasets" / "numeri_rivista" / "numeri_wp_FINAL.json"


def load_export_files() -> Dict[int, Dict[str, Any]]:
    """Carica tutti i file export_1000_*.json"""
    print("Caricamento file export...")
    articles = {}
    
    for i in range(1, 5):
        export_file = EXPORT_DIR / f"export_1000_{i}.json"
        if not export_file.exists():
            print(f"  [WARN] File non trovato: {export_file.name}")
            continue
        
        try:
            with export_file.open('r', encoding='utf-8') as f:
                data = json.load(f)
                for art in data:
                    wp_id = art.get('id')
                    if wp_id:
                        articles[wp_id] = art
            print(f"  [OK] Caricato {export_file.name}: {len(data)} articoli")
        except Exception as e:
            print(f"  [ERROR] Errore caricando {export_file.name}: {e}")
    
    print(f"  [OK] Totale articoli caricati: {len(articles)}")
    return articles


def load_csv() -> Dict[int, Dict[str, Any]]:
    """Carica CSV con dati aggiuntivi"""
    print(f"\nCaricamento {CSV_FILE.name}...")
    articles = {}
    
    if not CSV_FILE.exists():
        print(f"  [WARN] File CSV non trovato")
        return articles
    
    try:
        with CSV_FILE.open('r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                wp_id_str = row.get('id_articolo', '').strip()
                if wp_id_str and wp_id_str.isdigit():
                    wp_id = int(wp_id_str)
                    articles[wp_id] = row
        print(f"  [OK] Caricati {len(articles)} record dal CSV")
    except Exception as e:
        print(f"  [ERROR] Errore caricando CSV: {e}")
    
    return articles


def extract_numero_from_categories(categories: list) -> Optional[Tuple[int, int]]:
    """Estrae numero e anno dalla categoria con slug 'numero-X-YYYY'"""
    for cat in categories:
        slug = cat.get('slug', '')
        if slug.startswith('numero-'):
            # Esempio: "numero-1-1983" -> (1, 1983)
            match = re.match(r'numero-(\d+)-(\d{4})', slug)
            if match:
                numero = int(match.group(1))
                anno = int(match.group(2))
                return (numero, anno)
    return None


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


def extract_frontmatter(content: str) -> Tuple[Optional[str], str]:
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
            
            # Converti numeri
            if value.isdigit():
                value = int(value)
            elif value.replace('.', '').replace('-', '').isdigit():
                try:
                    value = float(value)
                except:
                    pass
            
            data[key] = value
    return data


def update_article(md_file: Path, export_articles: Dict, csv_articles: Dict, numeri_map: Dict) -> Tuple[bool, str]:
    """Aggiorna numero_rivista e anno_rivista dal sorgente"""
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
    numero_rivista = None
    anno_rivista = None
    issue_number = None
    
    if export_art:
        # Estrai dalle categorie
        categories = export_art.get('tax', {}).get('categories', [])
        result = extract_numero_from_categories(categories)
        if result:
            numero_rivista, anno_rivista = result
            # Trova issue_number corrispondente
            issue_number = numeri_map.get((numero_rivista, anno_rivista))
    
    # Se non trovato, prova nel CSV
    if not numero_rivista and wp_id in csv_articles:
        csv_art = csv_articles[wp_id]
        # Il CSV potrebbe avere campi diversi, verifica
        # Per ora saltiamo, i dati principali sono negli export
    
    if not numero_rivista:
        return False, "Numero non trovato nei sorgenti"
    
    # Verifica se i valori attuali corrispondono
    current_numero = data.get('numero_rivista')
    current_anno = data.get('anno_rivista')
    
    # Se i valori sono già corretti, salta (ma aggiorna issue_number se mancante)
    if current_numero == numero_rivista and current_anno == anno_rivista:
        if issue_number and not data.get('issue_number'):
            # Aggiorna solo issue_number
            if 'issue_number:' in frontmatter:
                frontmatter = re.sub(
                    r'issue_number:\s*[^\n]+',
                    f'issue_number: {issue_number}',
                    frontmatter
                )
            else:
                if 'anno_rivista:' in frontmatter:
                    frontmatter = re.sub(
                        r'(anno_rivista:[^\n]+)',
                        f'\\1\nissue_number: {issue_number}',
                        frontmatter
                    )
                else:
                    frontmatter = frontmatter.rstrip() + f'\nissue_number: {issue_number}\n'
            
            new_content = f"---{frontmatter}---{body}"
            md_file.write_text(new_content, encoding='utf-8')
            return True, f"issue_number aggiunto (n.{numero_rivista})"
        return False, "Già corretto"
    
    # Aggiorna frontmatter
    updated = False
    
    # Aggiorna numero_rivista (sempre, anche se presente)
    if 'numero_rivista:' in frontmatter:
        frontmatter = re.sub(
            r'numero_rivista:\s*[^\n]+',
            f'numero_rivista: {numero_rivista}',
            frontmatter
        )
        updated = True
    else:
        # Aggiungi dopo wp_id se presente
        if 'wp_id:' in frontmatter:
            frontmatter = re.sub(
                r'(wp_id:[^\n]+)',
                f'\\1\nnumero_rivista: {numero_rivista}',
                frontmatter
            )
        else:
            frontmatter = frontmatter.rstrip() + f'\nnumero_rivista: {numero_rivista}\n'
        updated = True
    
    # Aggiorna anno_rivista
    if 'anno_rivista:' in frontmatter:
        frontmatter = re.sub(
            r'anno_rivista:\s*[^\n]+',
            f'anno_rivista: {anno_rivista}',
            frontmatter
        )
        updated = True
    else:
        # Aggiungi dopo numero_rivista
        if 'numero_rivista:' in frontmatter:
            frontmatter = re.sub(
                r'(numero_rivista:[^\n]+)',
                f'\\1\nanno_rivista: {anno_rivista}',
                frontmatter
            )
        else:
            frontmatter = frontmatter.rstrip() + f'\nanno_rivista: {anno_rivista}\n'
        updated = True
    
    # Aggiorna issue_number se trovato
    if issue_number:
        if 'issue_number:' in frontmatter:
            frontmatter = re.sub(
                r'issue_number:\s*[^\n]+',
                f'issue_number: {issue_number}',
                frontmatter
            )
        else:
            # Aggiungi dopo anno_rivista
            if 'anno_rivista:' in frontmatter:
                frontmatter = re.sub(
                    r'(anno_rivista:[^\n]+)',
                    f'\\1\nissue_number: {issue_number}',
                    frontmatter
                )
            else:
                frontmatter = frontmatter.rstrip() + f'\nissue_number: {issue_number}\n'
        updated = True
    
    if not updated:
        return False, "Nessun aggiornamento necessario"
    
    # Ricostruisci file
    new_content = f"---{frontmatter}---{body}"
    
    try:
        md_file.write_text(new_content, encoding='utf-8')
        return True, f"n.{numero_rivista} ({anno_rivista})"
    except Exception as e:
        return False, f"Errore scrittura: {e}"


def main():
    print("=" * 60)
    print("FIX NUMERO RIVISTA DA SORGENTI")
    print("=" * 60)
    
    # Carica dati
    export_articles = load_export_files()
    csv_articles = load_csv()
    numeri_map = load_numeri()
    
    # Trova tutti i file markdown
    md_files = list(CONTENT_DIR.rglob('*.md'))
    print(f"\nTrovati {len(md_files)} file markdown")
    
    stats = {
        'total': len(md_files),
        'updated': 0,
        'not_found': 0,
        'no_wp_id': 0,
        'errors': 0,
    }
    
    print("\nAggiornamento numero_rivista e anno_rivista...")
    for i, md_file in enumerate(md_files, 1):
        if i % 500 == 0:
            print(f"  Processati {i}/{len(md_files)} file...")
        
        updated, message = update_article(md_file, export_articles, csv_articles, numeri_map)
        
        if updated:
            stats['updated'] += 1
        elif "wp_id non trovato" in message:
            stats['no_wp_id'] += 1
        elif "Numero non trovato" in message:
            stats['not_found'] += 1
        else:
            stats['errors'] += 1
    
    # Report finale
    print("\n" + "=" * 60)
    print("REPORT FINALE")
    print("=" * 60)
    print(f"Totale file processati: {stats['total']}")
    print(f"File aggiornati: {stats['updated']}")
    print(f"File senza wp_id: {stats['no_wp_id']}")
    print(f"Numero non trovato nei sorgenti: {stats['not_found']}")
    print(f"Errori: {stats['errors']}")
    print(f"\n[OK] Completato!")


if __name__ == '__main__':
    main()

