#!/usr/bin/env python3
"""
Script per trovare e rimuovere file duplicati in cluster--1
Mantiene solo le versioni aggiornate negli altri cluster
"""

import json
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).parent.parent.parent
CONTENT_DIR = BASE_DIR / "src" / "content" / "blog"

def find_duplicate_slugs():
    """Trova tutti gli slug duplicati"""
    slug_to_files = defaultdict(list)
    
    # Scansiona tutti i file markdown
    for md_file in CONTENT_DIR.rglob("*.md"):
        try:
            content = md_file.read_text(encoding='utf-8')
            # Estrai slug dal frontmatter
            if 'slug:' in content:
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if line.strip().startswith('slug:'):
                        slug = line.split('slug:')[1].strip().strip('"').strip("'")
                        slug_to_files[slug].append(md_file)
                        break
        except Exception as e:
            print(f"Errore leggendo {md_file}: {e}")
    
    # Trova duplicati
    duplicates = {slug: files for slug, files in slug_to_files.items() if len(files) > 1}
    
    return duplicates

def main():
    print("=" * 60)
    print("RICERCA SLUG DUPLICATI")
    print("=" * 60)
    
    duplicates = find_duplicate_slugs()
    
    if not duplicates:
        print("\n[OK] Nessuno slug duplicato trovato!")
        return
    
    print(f"\n[WARN] Trovati {len(duplicates)} slug duplicati:\n")
    
    files_to_delete = []
    
    for slug, files in duplicates.items():
        cluster_neg1_files = [f for f in files if 'cluster--1' in str(f)]
        other_files = [f for f in files if 'cluster--1' not in str(f)]
        
        # Se c'è un file in cluster--1 e altri file altrove, elimina quello in cluster--1
        if cluster_neg1_files and other_files:
            files_to_delete.extend(cluster_neg1_files)
        
        # Mostra solo i primi 10 per non intasare l'output
        if len(files_to_delete) <= 10:
            print(f"Slug: {slug}")
            for f in files:
                marker = "  [DA ELIMINARE]" if 'cluster--1' in str(f) else "  [MANTIENI]"
                print(f"  {marker} {f.name}")
            if cluster_neg1_files and other_files:
                print(f"  -> Eliminero {len(cluster_neg1_files)} file da cluster--1")
            print()
    
    if files_to_delete:
        print(f"\n{'='*60}")
        print(f"ELIMINAZIONE {len(files_to_delete)} FILE DUPLICATI")
        print(f"{'='*60}\n")
        
        for file_path in files_to_delete:
            try:
                file_path.unlink()
                print(f"  [OK] Eliminato: {file_path.name}")
            except Exception as e:
                print(f"  [ERROR] Errore eliminando {file_path.name}: {e}")
        
        print(f"\n[OK] Eliminati {len(files_to_delete)} file duplicati!")
    else:
        print("\n[WARN] Nessun file da eliminare (duplicati non in cluster--1)")

if __name__ == "__main__":
    main()

