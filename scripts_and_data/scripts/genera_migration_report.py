#!/usr/bin/env python3
"""
Genera Migration Report (Manifesto di Migrazione)
Statistiche complete sulla migrazione degli articoli
"""

import json
import re
from pathlib import Path
from typing import Dict, Any

# Paths
BASE_DIR = Path(__file__).parent.parent.parent
CONTENT_DIR = BASE_DIR / "src" / "content" / "blog"
OUTPUT_REPORT = BASE_DIR / "migration_report.json"


def parse_frontmatter(filepath: Path) -> Dict[str, Any]:
    """Estrae frontmatter da file markdown"""
    try:
        with filepath.open('r', encoding='utf-8') as f:
            content = f.read()
        
        # Estrai frontmatter tra ---
        match = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
        if not match:
            return {}
        
        frontmatter_text = match.group(1)
        frontmatter = {}
        
        # Parse semplice YAML (non completo, ma sufficiente per i nostri campi)
        current_key = None
        current_value = None
        in_list = False
        list_items = []
        
        for line in frontmatter_text.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            # Lista
            if line.startswith('- '):
                if not in_list:
                    in_list = True
                    list_items = []
                list_items.append(line[2:].strip().strip('"').strip("'"))
                continue
            elif in_list:
                frontmatter[current_key] = list_items
                in_list = False
                list_items = []
            
            # Chiave: valore
            if ':' in line:
                parts = line.split(':', 1)
                key = parts[0].strip()
                value = parts[1].strip().strip('"').strip("'")
                
                # Valori booleani
                if value.lower() == 'true':
                    value = True
                elif value.lower() == 'false':
                    value = False
                # Valori numerici
                elif value.isdigit():
                    value = int(value)
                elif re.match(r'^\d+\.\d+$', value):
                    value = float(value)
                
                frontmatter[key] = value
                current_key = key
                current_value = value
        
        # Chiudi lista se ancora aperta
        if in_list and current_key:
            frontmatter[current_key] = list_items
        
        return frontmatter
    except Exception as e:
        print(f"  [ERROR] Errore parsing {filepath}: {e}")
        return {}


def main():
    print("=" * 60)
    print("GENERAZIONE MIGRATION REPORT")
    print("=" * 60)
    
    # Statistiche
    stats = {
        'articoli_processati': 0,
        'articoli_con_pdf': 0,
        'articoli_con_tag': 0,
        'articoli_con_numero_rivista': 0,
        'articoli_con_umap': 0,
        'articoli_con_archive_id': 0,
        'articoli_con_copertina': 0,
        'articoli_con_periodo_label': 0,
        'cluster_distribuzione': {},
        'totale_tag': 0,
        'tag_unici': set(),
    }
    
    # Scansiona tutti i file markdown
    print(f"\nScansione file in {CONTENT_DIR}...")
    markdown_files = list(CONTENT_DIR.rglob('*.md'))
    print(f"  [OK] Trovati {len(markdown_files)} file markdown")
    
    for filepath in markdown_files:
        stats['articoli_processati'] += 1
        
        frontmatter = parse_frontmatter(filepath)
        
        if not frontmatter:
            continue
        
        # PDF
        if frontmatter.get('pdf_url'):
            stats['articoli_con_pdf'] += 1
        
        # Tag
        tags = frontmatter.get('tags', [])
        if tags and len(tags) > 0:
            stats['articoli_con_tag'] += 1
            stats['totale_tag'] += len(tags)
            stats['tag_unici'].update(tags)
        
        # Numero rivista
        if frontmatter.get('numero_rivista'):
            stats['articoli_con_numero_rivista'] += 1
        
        # UMAP
        if frontmatter.get('umap_x') is not None or frontmatter.get('umap_y') is not None:
            stats['articoli_con_umap'] += 1
        
        # Archive ID
        if frontmatter.get('archive_id'):
            stats['articoli_con_archive_id'] += 1
        
        # Copertina
        if frontmatter.get('copertina_url'):
            stats['articoli_con_copertina'] += 1
        
        # Periodo label
        if frontmatter.get('periodo_label'):
            stats['articoli_con_periodo_label'] += 1
        
        # Cluster distribuzione
        cluster_id = frontmatter.get('cluster_id', 0)
        stats['cluster_distribuzione'][cluster_id] = stats['cluster_distribuzione'].get(cluster_id, 0) + 1
        
        if stats['articoli_processati'] % 500 == 0:
            print(f"  [OK] Processati {stats['articoli_processati']} articoli...")
    
    # Prepara report finale
    report = {
        'migration_date': str(Path(__file__).stat().st_mtime),  # Timestamp script
        'statistics': {
            'articoli_processati': stats['articoli_processati'],
            'articoli_con_pdf': stats['articoli_con_pdf'],
            'articoli_con_tag': stats['articoli_con_tag'],
            'articoli_con_numero_rivista': stats['articoli_con_numero_rivista'],
            'articoli_con_umap': stats['articoli_con_umap'],
            'articoli_con_archive_id': stats['articoli_con_archive_id'],
            'articoli_con_copertina': stats['articoli_con_copertina'],
            'articoli_con_periodo_label': stats['articoli_con_periodo_label'],
            'totale_tag': stats['totale_tag'],
            'tag_unici': len(stats['tag_unici']),
            'cluster_distribuzione': dict(sorted(stats['cluster_distribuzione'].items())),
        },
        'coverage': {
            'pdf_coverage': f"{stats['articoli_con_pdf']/stats['articoli_processati']*100:.1f}%" if stats['articoli_processati'] > 0 else "0%",
            'tag_coverage': f"{stats['articoli_con_tag']/stats['articoli_processati']*100:.1f}%" if stats['articoli_processati'] > 0 else "0%",
            'numero_rivista_coverage': f"{stats['articoli_con_numero_rivista']/stats['articoli_processati']*100:.1f}%" if stats['articoli_processati'] > 0 else "0%",
        }
    }
    
    # Salva report
    with OUTPUT_REPORT.open('w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    # Stampa report
    print("\n" + "=" * 60)
    print("MIGRATION REPORT")
    print("=" * 60)
    print(f"Articoli processati: {stats['articoli_processati']}")
    print(f"Articoli con PDF trovato: {stats['articoli_con_pdf']}")
    print(f"Articoli con Tag trovati: {stats['articoli_con_tag']}")
    print(f"Articoli con Numero Rivista: {stats['articoli_con_numero_rivista']}")
    print(f"Articoli con UMAP coordinates: {stats['articoli_con_umap']}")
    print(f"Articoli con Archive ID: {stats['articoli_con_archive_id']}")
    print(f"\nCoverage:")
    print(f"  PDF: {report['coverage']['pdf_coverage']}")
    print(f"  Tag: {report['coverage']['tag_coverage']}")
    print(f"  Numero Rivista: {report['coverage']['numero_rivista_coverage']}")
    print(f"\nTag:")
    print(f"  Totale tag: {stats['totale_tag']}")
    print(f"  Tag unici: {len(stats['tag_unici'])}")
    print(f"\nCluster distribuzione (top 10):")
    sorted_clusters = sorted(stats['cluster_distribuzione'].items(), key=lambda x: x[1], reverse=True)
    for cluster_id, count in sorted_clusters[:10]:
        print(f"  Cluster {cluster_id}: {count} articoli")
    
    print(f"\n[OK] Report salvato in: {OUTPUT_REPORT}")


if __name__ == "__main__":
    main()

