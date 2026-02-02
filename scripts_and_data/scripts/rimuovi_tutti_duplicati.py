#!/usr/bin/env python3
"""
Script per trovare e rimuovere TUTTI i file con slug duplicati
Mantiene la versione con più metadati (wp_id, original_url, umap, etc.)
"""

from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).parent.parent.parent
CONTENT_DIR = BASE_DIR / "src" / "content" / "blog"

def count_metadata_fields(file_path):
    """Conta quanti campi metadati ha un file (più = migliore)"""
    try:
        content = file_path.read_text(encoding='utf-8')
        fields = ['wp_id', 'original_url', 'umap_x', 'umap_y', 'umap_z', 
                  'pdf_url', 'archive_id', 'numero_rivista', 'tags']
        count = sum(1 for field in fields if f'{field}:' in content)
        return count
    except:
        return 0

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
                for line in lines:
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
    print("RICERCA E ELIMINAZIONE TUTTI GLI SLUG DUPLICATI")
    print("=" * 60)
    
    duplicates = find_duplicate_slugs()
    
    if not duplicates:
        print("\n[OK] Nessuno slug duplicato trovato!")
        return
    
    print(f"\n[WARN] Trovati {len(duplicates)} slug duplicati\n")
    
    files_to_delete = []
    
    for idx, (slug, files) in enumerate(duplicates.items()):
        # Ordina per numero di metadati (più metadati = migliore)
        files_with_metadata = [(f, count_metadata_fields(f)) for f in files]
        files_with_metadata.sort(key=lambda x: x[1], reverse=True)
        
        # Mantieni il primo (migliore), elimina gli altri
        best_file = files_with_metadata[0][0]
        duplicates_to_delete = [f for f, _ in files_with_metadata[1:]]
        
        if duplicates_to_delete:
            files_to_delete.extend(duplicates_to_delete)
            # Mostra solo i primi 20 per non intasare l'output
            if idx < 20:
                print(f"Slug: {slug}")
                print(f"  [MANTIENI] {best_file.name} (metadati: {files_with_metadata[0][1]})")
                for dup_file, meta_count in files_with_metadata[1:]:
                    print(f"  [ELIMINA] {dup_file.name} (metadati: {meta_count})")
                print()
    
    if len(duplicates) > 20:
        print(f"... e altri {len(duplicates) - 20} slug duplicati\n")
    
    if files_to_delete:
        print(f"\n{'='*60}")
        print(f"ELIMINAZIONE {len(files_to_delete)} FILE DUPLICATI")
        print(f"{'='*60}\n")
        
        deleted = 0
        errors = 0
        
        for file_path in files_to_delete:
            try:
                file_path.unlink()
                deleted += 1
                if deleted % 100 == 0:  # Mostra ogni 100 file
                    print(f"  [OK] Eliminati {deleted} file...")
            except Exception as e:
                errors += 1
                if errors <= 10:  # Mostra solo i primi 10 errori
                    print(f"  [ERROR] Errore eliminando {file_path.name}: {e}")
        
        print(f"\n[OK] Eliminati {deleted} file duplicati!")
        if errors > 0:
            print(f"[WARN] {errors} errori durante l'eliminazione")
    else:
        print("\n[WARN] Nessun file da eliminare")

if __name__ == "__main__":
    main()

