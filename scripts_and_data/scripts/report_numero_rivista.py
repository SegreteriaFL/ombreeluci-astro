#!/usr/bin/env python3
"""Report finale su numero_rivista e anno_rivista"""

from pathlib import Path
import re

BASE_DIR = Path(__file__).parent.parent.parent
CONTENT_DIR = BASE_DIR / "src" / "content" / "blog"

def parse_frontmatter(frontmatter: str) -> dict:
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

def main():
    files = list(CONTENT_DIR.rglob('*.md'))
    total = len(files)
    
    with_num = 0
    with_anno = 0
    with_both = 0
    with_issue = 0
    with_wp_id = 0
    
    for f in files:
        try:
            content = f.read_text(encoding='utf-8')
            if not content.startswith('---'):
                continue
            
            parts = content.split('---', 2)
            if len(parts) < 3:
                continue
            
            frontmatter = parts[1]
            data = parse_frontmatter(frontmatter)
            
            if data.get('wp_id'):
                with_wp_id += 1
            
            if data.get('numero_rivista'):
                with_num += 1
            
            if data.get('anno_rivista'):
                with_anno += 1
            
            if data.get('numero_rivista') and data.get('anno_rivista'):
                with_both += 1
            
            if data.get('issue_number'):
                with_issue += 1
        except:
            pass
    
    print("=" * 60)
    print("REPORT FINALE ASSOCIAZIONE NUMERO RIVISTA")
    print("=" * 60)
    print(f"Totale articoli: {total}")
    print(f"Con wp_id: {with_wp_id} ({with_wp_id/total*100:.1f}%)")
    print(f"Con numero_rivista: {with_num} ({with_num/total*100:.1f}%)")
    print(f"Con anno_rivista: {with_anno} ({with_anno/total*100:.1f}%)")
    print(f"Con entrambi (numero + anno): {with_both} ({with_both/total*100:.1f}%)")
    print(f"Con issue_number: {with_issue} ({with_issue/total*100:.1f}%)")
    print(f"\nArticoli SENZA numero_rivista: {total - with_num} ({(total-with_num)/total*100:.1f}%)")
    print(f"Articoli SENZA anno_rivista: {total - with_anno} ({(total-with_anno)/total*100:.1f}%)")
    print(f"Articoli SENZA entrambi: {total - with_both} ({(total-with_both)/total*100:.1f}%)")

if __name__ == '__main__':
    main()

