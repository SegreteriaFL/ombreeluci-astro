#!/usr/bin/env python3
"""
Rigenerazione Totale Markdown con Frontmatter Definitivo
Genera tutti i file markdown in src/content/blog/ con struttura definitiva
"""

import json
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
import html

# Paths
BASE_DIR = Path(__file__).parent.parent.parent
DATASETS_DIR = BASE_DIR / "scripts_and_data" / "datasets"
CONTENT_DIR = BASE_DIR / "src" / "content" / "blog"

# File di input
INPUT_JSONL = DATASETS_DIR / "articoli" / "articoli_semantici_FULL_2026.jsonl"
INPUT_SLUGS = DATASETS_DIR / "articoli" / "articoli_slugs_definitivi.json"
INPUT_CLUSTER = DATASETS_DIR / "articoli" / "mappa_temi_definitiva.csv"
INPUT_NUMERI = DATASETS_DIR / "numeri_rivista" / "numeri_wp_FINAL.json"
INPUT_AUTORI = DATASETS_DIR / "autori" / "database_autori.json"
INPUT_UMAP = DATASETS_DIR / "articoli" / "umap_coordinates.npy"

# Pattern per pulizia contenuto
PATTERNS_TO_REMOVE = [
    r'<b>SOMMARIO</b>.*?</h4>',
    r'Questo articolo è tratto da.*?</a>',
    r'<a href="[^"]*project[^"]*"></a>',
    r'Leggi anche:.*?</a>',
]


def load_jsonl(filepath: Path) -> Dict[int, Dict[str, Any]]:
    """Carica articoli da JSONL"""
    print(f"Caricamento {filepath.name}...")
    articles = {}
    with filepath.open('r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                art = json.loads(line)
                articles[art['id']] = art
    print(f"  [OK] Caricati {len(articles)} articoli")
    return articles


def load_json(filepath: Path) -> Dict[str, Any]:
    """Carica JSON"""
    print(f"Caricamento {filepath.name}...")
    with filepath.open('r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"  [OK] Caricato")
    return data


def load_cluster_csv(filepath: Path) -> Dict[int, Dict[str, Any]]:
    """Carica cluster da CSV"""
    print(f"Caricamento {filepath.name}...")
    import csv
    clusters = {}
    with filepath.open('r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            art_id = int(row['id_articolo'])
            clusters[art_id] = {
                'cluster_id': int(row['nuovo_cluster_id']),
                'score_coerenza': float(row['score_coerenza'])
            }
    print(f"  [OK] Caricati {len(clusters)} cluster")
    return clusters


def load_umap_coordinates(filepath: Path) -> Optional[Dict[int, tuple]]:
    """Carica coordinate UMAP"""
    try:
        import numpy as np
        print(f"Caricamento {filepath.name}...")
        coords = np.load(str(filepath))
        # Assumiamo che le coordinate siano nell'ordine degli articoli nel JSONL
        print(f"  [OK] Caricate {len(coords)} coordinate")
        return coords
    except Exception as e:
        print(f"  ⚠ Coordinate UMAP non disponibili: {e}")
        return None


def find_numero_rivista(articolo: Dict[str, Any], numeri: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Trova il numero rivista associato all'articolo usando categoria numero-X-YYYY"""
    import re
    
    # Cerca categoria "numero-X-YYYY"
    categories = articolo.get('tax', {}).get('categories', [])
    numero_slug_categoria = None
    for cat in categories:
        slug = cat.get('slug', '')
        if slug.startswith('numero-'):
            numero_slug_categoria = slug
            break
    
    if not numero_slug_categoria:
        return None
    
    # Estrai numero e anno: "numero-1-1983" -> (1, 1983)
    match = re.match(r'numero-(\d+)-(\d{4})', numero_slug_categoria)
    if not match:
        return None
    
    num_prog = int(match.group(1))
    anno = int(match.group(2))
    
    # Cerca numero corrispondente (preferisci "ombre_e_luci")
    numero_match = None
    for numero in numeri:
        if (numero.get('numero_progressivo') == num_prog and 
            numero.get('anno_pubblicazione') == anno):
            # Preferisci "ombre_e_luci" se disponibile
            if numero.get('tipo_rivista') == 'ombre_e_luci':
                return numero
            elif not numero_match:  # Fallback su "insieme" se non trovato altro
                numero_match = numero
    
    return numero_match


def pulisci_html(html_content: str) -> str:
    """Pulisce HTML da residui come Sommario, Tratto da, etc."""
    if not html_content:
        return ""
    
    content = html_content
    
    # Rimuovi pattern specifici
    for pattern in PATTERNS_TO_REMOVE:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Rimuovi tag vuoti
    content = re.sub(r'<[^>]+>\s*</[^>]+>', '', content)
    content = re.sub(r'<([^>]+)>\s*</\1>', '', content)
    
    # Rimuovi spazi multipli
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r'\n\s*\n', '\n\n', content)
    
    return content.strip()


def format_date(date_str: str) -> str:
    """Formatta data per frontmatter"""
    try:
        # Prova formato "1983-09-30 19:24:40"
        dt = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
        return dt.strftime("%Y-%m-%d")
    except:
        try:
            # Prova formato "1983-09-30"
            dt = datetime.strptime(date_str, "%Y-%m-%d")
            return dt.strftime("%Y-%m-%d")
        except:
            return date_str.split()[0] if date_str else ""


def generate_frontmatter(articolo: Dict[str, Any], 
                        slug: str,
                        cluster_data: Dict[str, Any],
                        numero_rivista: Optional[Dict[str, Any]],
                        autore_data: Optional[Dict[str, Any]],
                        umap_coords: Optional[tuple]) -> str:
    """Genera frontmatter YAML con struttura definitiva"""
    meta = articolo.get('meta', {})
    tax = articolo.get('tax', {})
    
    # Campi base (richiesti)
    frontmatter = {
        'title': meta.get('title', ''),
        'date': format_date(meta.get('date', '')),
        'author': meta.get('author', ''),
        'slug': slug,
        'wp_id': articolo.get('id'),
        'original_url': articolo.get('url', ''),
        'cluster_id': cluster_data.get('cluster_id', 0),
        'has_comments': False,  # Default, da verificare se necessario
    }
    
    # Tags (array di slug) - solo se presenti
    tags = [tag.get('slug', '') for tag in tax.get('tags', []) if tag.get('slug')]
    if tags:
        frontmatter['tags'] = tags
    
    # Numero rivista (solo se trovato)
    if numero_rivista:
        pdf_url = numero_rivista.get('archive_download_pdf_url')
        if pdf_url:
            frontmatter['pdf_url'] = pdf_url
        
        archive_id = numero_rivista.get('archive_org_item_id')
        if archive_id:
            frontmatter['archive_id'] = archive_id
        
        copertina = numero_rivista.get('copertina_url')
        if copertina:
            frontmatter['copertina_url'] = copertina
        
        periodo = numero_rivista.get('periodo_label')
        if periodo:
            frontmatter['periodo_label'] = periodo
        
        num_prog = numero_rivista.get('numero_progressivo')
        if num_prog is not None:
            frontmatter['numero_rivista'] = num_prog
        
        anno = numero_rivista.get('anno_pubblicazione')
        if anno is not None:
            frontmatter['anno_rivista'] = anno
    
    # UMAP coordinates (solo se disponibili)
    if umap_coords is not None:
        try:
            if len(umap_coords) >= 2:
                frontmatter['umap_x'] = float(umap_coords[0])
                frontmatter['umap_y'] = float(umap_coords[1])
            if len(umap_coords) >= 3:
                frontmatter['umap_z'] = float(umap_coords[2])
        except (ValueError, TypeError, IndexError):
            pass  # Ignora errori di conversione
    
    # Genera YAML
    lines = ['---']
    for key, value in frontmatter.items():
        if value is not None and value != '':
            if isinstance(value, list):
                if value:  # Solo se lista non vuota
                    lines.append(f"{key}:")
                    for item in value:
                        lines.append(f"  - {item}")
            elif isinstance(value, str):
                # Escape caratteri speciali YAML
                if ':' in value or '"' in value or "'" in value:
                    value = value.replace('"', '\\"')
                    lines.append(f'{key}: "{value}"')
                else:
                    lines.append(f'{key}: {value}')
            elif isinstance(value, bool):
                lines.append(f'{key}: {str(value).lower()}')
            else:
                lines.append(f'{key}: {value}')
    lines.append('---')
    
    return '\n'.join(lines)


def main():
    print("=" * 60)
    print("RIGENERAZIONE MARKDOWN DEFINITIVO")
    print("=" * 60)
    
    # Carica dati
    articoli = load_jsonl(INPUT_JSONL)
    slugs = load_json(INPUT_SLUGS)
    clusters = load_cluster_csv(INPUT_CLUSTER)
    numeri = load_json(INPUT_NUMERI)
    autori = load_json(INPUT_AUTORI)
    umap_coords_array = load_umap_coordinates(INPUT_UMAP)
    
    # Crea mappa autori per ID articolo
    autori_map = {}
    for autore in autori:
        for art_id in autore.get('articoli_ids', []):
            autori_map[art_id] = autore
    
    # Crea mappa coordinate UMAP (assumendo stesso ordine del JSONL)
    umap_map = {}
    if umap_coords_array is not None:
        # Leggi gli ID nell'ordine del JSONL
        art_ids_ordered = []
        with INPUT_JSONL.open('r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    art = json.loads(line)
                    art_ids_ordered.append(art['id'])
        
        for idx, art_id in enumerate(art_ids_ordered):
            if idx < len(umap_coords_array):
                umap_map[art_id] = umap_coords_array[idx]
    
    # Statistiche
    stats = {
        'total': 0,
        'generated': 0,
        'no_slug': 0,
        'no_cluster': 0,
        'no_numero': 0,
        'errors': []
    }
    
    # Genera markdown
    print(f"\nGenerazione markdown in {CONTENT_DIR}...")
    
    # Crea directory cluster se necessario
    cluster_ids = set([c['cluster_id'] for c in clusters.values()])
    cluster_ids.add(0)  # Assicurati che cluster-0 esista
    for cluster_id in cluster_ids:
        cluster_dir = CONTENT_DIR / f"cluster-{cluster_id}"
        cluster_dir.mkdir(parents=True, exist_ok=True)
    
    # Genera file per ogni articolo
    for art_id, articolo in articoli.items():
        stats['total'] += 1
        
        try:
            # Slug
            slug = slugs.get(str(art_id))
            if not slug:
                stats['no_slug'] += 1
                print(f"  [WARN] Articolo {art_id}: slug mancante")
                continue
            
            # Cluster
            cluster_data = clusters.get(art_id, {'cluster_id': 0, 'score_coerenza': 0.0})
            cluster_id = cluster_data['cluster_id']
            
            # Numero rivista
            numero_rivista = find_numero_rivista(articolo, numeri)
            if not numero_rivista:
                stats['no_numero'] += 1
            
            # Autore
            autore_data = autori_map.get(art_id)
            
            # UMAP
            umap_coords = umap_map.get(art_id)
            
            # Genera frontmatter
            frontmatter = generate_frontmatter(
                articolo, slug, cluster_data, numero_rivista, autore_data, umap_coords
            )
            
            # Pulisci contenuto
            html_content = articolo.get('html_pulito', '')
            content = pulisci_html(html_content)
            
            # Scrivi file
            cluster_dir = CONTENT_DIR / f"cluster-{cluster_id}"
            cluster_dir.mkdir(parents=True, exist_ok=True)
            output_file = cluster_dir / f"{slug}.md"
            
            with output_file.open('w', encoding='utf-8') as f:
                f.write(frontmatter)
                f.write('\n\n')
                f.write(content)
            
            stats['generated'] += 1
            
            if stats['generated'] % 100 == 0:
                print(f"  [OK] Generati {stats['generated']} file...")
        
        except Exception as e:
            stats['errors'].append(f"Articolo {art_id}: {str(e)}")
            print(f"  [ERROR] Articolo {art_id}: {e}")
    
    # Report finale
    print("\n" + "=" * 60)
    print("REPORT FINALE")
    print("=" * 60)
    print(f"Totale articoli processati: {stats['total']}")
    print(f"File generati: {stats['generated']}")
    print(f"Articoli senza slug: {stats['no_slug']}")
    print(f"Articoli senza cluster: {stats['no_cluster']}")
    print(f"Articoli senza numero rivista: {stats['no_numero']}")
    print(f"Errori: {len(stats['errors'])}")
    
    if stats['errors']:
        print("\nErrori dettagliati:")
        for error in stats['errors'][:10]:  # Mostra primi 10
            print(f"  - {error}")
        if len(stats['errors']) > 10:
            print(f"  ... e altri {len(stats['errors']) - 10} errori")
    
    print("\n[OK] Rigenerazione completata!")


if __name__ == "__main__":
    main()

