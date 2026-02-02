#!/usr/bin/env python3
"""Debug matching numeri"""

import json
import re
from pathlib import Path

project_root = Path(__file__).parent.parent.parent
articoli_json = project_root / "scripts_and_data" / "datasets" / "articoli" / "articoli_semantici_FULL_2026.json"
numeri_json = project_root / "scripts_and_data" / "datasets" / "numeri_rivista" / "numeri_wp_FINAL.json"

# Carica articoli
with open(articoli_json, 'r', encoding='utf-8') as f:
    articoli = json.load(f)

# Carica numeri
with open(numeri_json, 'r', encoding='utf-8') as f:
    numeri = json.load(f)

# Conta articoli con categoria numero-*
count_con_numero = 0
articoli_con_numero = []

for art in articoli:
    categories = art.get('tax', {}).get('categories', [])
    for cat in categories:
        slug = cat.get('slug', '')
        if slug.startswith('numero-'):
            count_con_numero += 1
            match = re.match(r'numero-(\d+)-(\d{4})', slug)
            if match:
                num_prog = int(match.group(1))
                anno = int(match.group(2))
                articoli_con_numero.append({
                    'id': art['id'],
                    'slug_categoria': slug,
                    'num_prog': num_prog,
                    'anno': anno
                })
            break

print(f"Articoli con categoria numero-*: {count_con_numero}")
print(f"Articoli parsati correttamente: {len(articoli_con_numero)}")

# Verifica match con numeri
matched = 0
non_matched = []

for art_info in articoli_con_numero:
    trovato = False
    for numero in numeri:
        if (numero.get('numero_progressivo') == art_info['num_prog'] and 
            numero.get('anno_pubblicazione') == art_info['anno']):
            matched += 1
            trovato = True
            break
    
    if not trovato:
        non_matched.append(art_info)

print(f"\nMatch trovati: {matched} / {len(articoli_con_numero)}")
print(f"Non matchati: {len(non_matched)}")

if non_matched:
    print("\nPrimi 10 non matchati:")
    for art in non_matched[:10]:
        print(f"  ID {art['id']}: {art['slug_categoria']} -> cerca num={art['num_prog']}, anno={art['anno']}")
        
        # Cerca numeri simili
        simili = []
        for num in numeri:
            if num.get('numero_progressivo') == art['num_prog']:
                simili.append(f"  - {num.get('id_numero')}: tipo={num.get('tipo_rivista')}, anno={num.get('anno_pubblicazione')}")
            elif num.get('anno_pubblicazione') == art['anno']:
                simili.append(f"  - {num.get('id_numero')}: tipo={num.get('tipo_rivista')}, num={num.get('numero_progressivo')}")
        
        if simili:
            print("  Numeri simili trovati:")
            for s in simili[:5]:
                print(s)
        print()

