#!/usr/bin/env python3
"""
Ricerca disperata di file con informazioni sulle immagini
Cerca file XML, CSV, JSON con 'attachment' o 'wp-content/uploads'
"""

import json
import csv
from pathlib import Path
from typing import List, Dict, Any
import re

# Paths da cercare
SEARCH_PATHS = [
    Path("."),
    Path("export pulito db 2026"),
    Path("2-1-25"),
    Path("datasets"),
    Path("categorie v2"),
]


def search_in_json(file_path: Path) -> List[Dict[str, Any]]:
    """Cerca riferimenti immagini in file JSON"""
    results = []
    try:
        with file_path.open('r', encoding='utf-8') as f:
            data = json.load(f)
            
            # Cerca ricorsivamente
            def search_recursive(obj, path=""):
                if isinstance(obj, dict):
                    for key, value in obj.items():
                        current_path = f"{path}.{key}" if path else key
                        if isinstance(value, str):
                            if 'wp-content/uploads' in value or 'attachment' in value.lower():
                                results.append({
                                    'file': str(file_path),
                                    'path': current_path,
                                    'value': value[:200]
                                })
                        else:
                            search_recursive(value, current_path)
                elif isinstance(obj, list):
                    for i, item in enumerate(obj):
                        search_recursive(item, f"{path}[{i}]")
            
            search_recursive(data)
    except Exception as e:
        pass
    
    return results


def search_in_csv(file_path: Path) -> List[Dict[str, Any]]:
    """Cerca riferimenti immagini in file CSV"""
    results = []
    try:
        with file_path.open('r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row_num, row in enumerate(reader, 2):  # Start from 2 (header is 1)
                for col_name, value in row.items():
                    if isinstance(value, str) and ('wp-content/uploads' in value or 'attachment' in value.lower()):
                        results.append({
                            'file': str(file_path),
                            'row': row_num,
                            'column': col_name,
                            'value': value[:200]
                        })
    except Exception as e:
        pass
    
    return results


def search_in_text(file_path: Path) -> List[Dict[str, Any]]:
    """Cerca riferimenti immagini in file di testo"""
    results = []
    try:
        with file_path.open('r', encoding='utf-8', errors='ignore') as f:
            for line_num, line in enumerate(f, 1):
                if 'wp-content/uploads' in line or 'attachment' in line.lower():
                    # Estrai URL se presente
                    url_match = re.search(r'https?://[^\s<>"\']+wp-content/uploads[^\s<>"\']+', line)
                    if url_match:
                        results.append({
                            'file': str(file_path),
                            'line': line_num,
                            'url': url_match.group(0)
                        })
    except Exception as e:
        pass
    
    return results


def search_in_html_content() -> List[Dict[str, Any]]:
    """Cerca immagini nel contenuto HTML degli articoli"""
    results = []
    json_file = Path("datasets/articoli/articoli_semantici_FULL_2026.json")
    
    if not json_file.exists():
        return results
    
    print(f"Cercando immagini nel contenuto HTML degli articoli...")
    
    try:
        with json_file.open('r', encoding='utf-8') as f:
            articoli = json.load(f)
            
            for art in articoli:
                html = art.get('html_pulito', '')
                if not html:
                    continue
                
                # Cerca tag <img>
                img_matches = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html, re.IGNORECASE)
                for img_url in img_matches:
                    if 'wp-content/uploads' in img_url:
                        results.append({
                            'file': 'articoli JSON (html_pulito)',
                            'article_id': art.get('id'),
                            'title': art.get('meta', {}).get('title', ''),
                            'image_url': img_url
                        })
                
                # Cerca anche link a immagini
                link_matches = re.findall(r'href=["\']([^"\']*wp-content/uploads[^"\']+)["\']', html, re.IGNORECASE)
                for link_url in link_matches:
                    if any(ext in link_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']):
                        results.append({
                            'file': 'articoli JSON (html_pulito)',
                            'article_id': art.get('id'),
                            'title': art.get('meta', {}).get('title', ''),
                            'image_url': link_url
                        })
    except Exception as e:
        print(f"Errore durante ricerca in HTML: {e}")
    
    return results


def main():
    """Cerca file con informazioni immagini"""
    print("="*60)
    print("RICERCA IMMAGINI - ATTACHMENT E WP-CONTENT/UPLOADS")
    print("="*60)
    
    all_results = []
    
    # Cerca in tutti i path
    for search_path in SEARCH_PATHS:
        if not search_path.exists():
            continue
        
        print(f"\nCercando in: {search_path}")
        
        # Cerca file JSON
        for json_file in search_path.rglob("*.json"):
            results = search_in_json(json_file)
            if results:
                print(f"  [JSON] {json_file.name}: {len(results)} riferimenti")
                all_results.extend(results)
        
        # Cerca file CSV
        for csv_file in search_path.rglob("*.csv"):
            results = search_in_csv(csv_file)
            if results:
                print(f"  [CSV] {csv_file.name}: {len(results)} riferimenti")
                all_results.extend(results)
        
        # Cerca file XML
        for xml_file in search_path.rglob("*.xml"):
            results = search_in_text(xml_file)
            if results:
                print(f"  [XML] {xml_file.name}: {len(results)} riferimenti")
                all_results.extend(results)
    
    # Cerca nel contenuto HTML degli articoli
    html_results = search_in_html_content()
    if html_results:
        print(f"\n[HTML] Immagini trovate nel contenuto: {len(html_results)}")
        all_results.extend(html_results)
    
    # Riepilogo
    print("\n" + "="*60)
    print("RIEPILOGO")
    print("="*60)
    print(f"[OK] Totale riferimenti immagini trovati: {len(all_results)}")
    
    if all_results:
        print("\n[INFO] Primi 10 risultati:")
        for idx, result in enumerate(all_results[:10], 1):
            print(f"\n{idx}. File: {result.get('file', 'N/A')}")
            if 'article_id' in result:
                print(f"   Articolo ID: {result['article_id']}")
                print(f"   Titolo: {result.get('title', 'N/A')}")
            if 'image_url' in result:
                print(f"   URL: {result['image_url']}")
            elif 'url' in result:
                print(f"   URL: {result['url']}")
            elif 'value' in result:
                print(f"   Valore: {result['value']}")
        
        # Salva risultati
        output_file = Path("reports/immagini_trovate.json")
        output_file.parent.mkdir(exist_ok=True)
        with output_file.open('w', encoding='utf-8') as f:
            json.dump(all_results, f, ensure_ascii=False, indent=2)
        print(f"\n[OK] Risultati salvati in: {output_file}")
        
        # Statistiche
        unique_files = len(set(r.get('file', '') for r in all_results))
        articles_with_images = len(set(r.get('article_id', 0) for r in all_results if 'article_id' in r))
        print(f"\n[STATS] File unici con riferimenti: {unique_files}")
        print(f"[STATS] Articoli con immagini: {articles_with_images}")
    else:
        print("\n[WARN] Nessun riferimento a immagini trovato!")
        print("Possibili cause:")
        print("  - Immagini non sono state esportate")
        print("  - Immagini sono in database WordPress non esportato")
        print("  - Immagini sono referenziate ma non incluse negli export")


if __name__ == "__main__":
    main()

