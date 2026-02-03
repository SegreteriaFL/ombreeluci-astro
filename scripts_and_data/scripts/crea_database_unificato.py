#!/usr/bin/env python3
"""
Script per creare il database unificato combinando:
- articoli_semantici_FULL_2026.json (contenuto HTML)
- articoli_2026_enriched_temi_s8_FINAL_V3.csv (metadati tematici)
- numeri_wp_FINAL.json (numeri rivista con PDF)
- database_autori.json (autori)
"""

import json
import csv
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse

# Paths
project_root = Path(__file__).parent.parent.parent
articoli_json = project_root / "scripts_and_data" / "datasets" / "articoli" / "articoli_semantici_FULL_2026.json"
enriched_csv = project_root / "_migration_archive" / "categorie v2" / "articoli_2026_enriched_temi_s8_FINAL_V3.csv"
numeri_json = project_root / "scripts_and_data" / "datasets" / "numeri_rivista" / "numeri_wp_FINAL.json"
slugs_json = project_root / "scripts_and_data" / "datasets" / "articoli" / "articoli_slugs_definitivi.json"
autori_json = project_root / "scripts_and_data" / "datasets" / "autori" / "database_autori.json"
output_file = project_root / "scripts_and_data" / "datasets" / "articoli" / "database_unificato.json"


def normalize_url(url: str) -> str:
    """Normalizza URL per confronto: lowercase, https, senza trailing slash."""
    if not url:
        return ""
    u = url.strip().lower()
    if u.startswith("http://"):
        u = "https://" + u[7:]
    return u.rstrip("/")

print("="*80)
print("CREAZIONE DATABASE UNIFICATO")
print("="*80)

# 1. Carica articoli
print("\n[1/4] Caricamento articoli...")
if not articoli_json.exists():
    print(f"[ERROR] File non trovato: {articoli_json}")
    exit(1)

with open(articoli_json, 'r', encoding='utf-8') as f:
    articoli = json.load(f)

articoli_map = {art['id']: art for art in articoli}
print(f"[OK] Caricati {len(articoli_map)} articoli")

# 2. Carica CSV enriched
print("\n[2/4] Caricamento CSV enriched...")
if not enriched_csv.exists():
    print(f"[ERROR] File non trovato: {enriched_csv}")
    exit(1)

enriched_map = {}
with open(enriched_csv, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        art_id = int(row['id_articolo'])
        enriched_map[art_id] = row

print(f"[OK] Caricati {len(enriched_map)} record enriched")

# 3. Carica numeri rivista
print("\n[3/4] Caricamento numeri rivista...")
if not numeri_json.exists():
    print(f"[ERROR] File non trovato: {numeri_json}")
    exit(1)

with open(numeri_json, 'r', encoding='utf-8') as f:
    numeri = json.load(f)

# Mappa URL normalizzato -> numero (usata per Fonte A: match articoli_urls)
url_to_numero = {}
# Mappa slug categoria "n-XXX" -> numero (per Fonte B: categorie tipo n-100)
n_slug_to_numero = {}
for numero in numeri:
    for url in numero.get('articoli_urls', []):
        key = normalize_url(url)
        if key:
            url_to_numero[key] = numero
    if numero.get('canonical_url'):
        url_to_numero[normalize_url(numero['canonical_url'])] = numero
    if numero.get('wp_url_numero'):
        url_to_numero[normalize_url(numero['wp_url_numero'])] = numero
    # Categoria "n-100" -> OEL-100 / INS-10 ecc.
    np = numero.get('numero_progressivo')
    if np is not None:
        n_slug_to_numero[f"n-{np}"] = numero

print(f"[OK] Caricati {len(numeri)} numeri rivista")
print(f"[OK] Mappati {len(url_to_numero)} URL a numeri, {len(n_slug_to_numero)} slug n-* a numeri")

# 3b. Carica slug articoli (per costruire URL da anno+slug e fare match Fonte A)
slugs_by_id = {}
if slugs_json.exists():
    with open(slugs_json, 'r', encoding='utf-8') as f:
        slugs_data = json.load(f)
    slugs_by_id = {str(k): v for k, v in slugs_data.items()}
    print(f"[OK] Caricati {len(slugs_by_id)} slug articoli")
else:
    print(f"[WARN] File slug non trovato: {slugs_json}")

# 4. Carica autori
print("\n[4/4] Caricamento autori...")
if not autori_json.exists():
    print(f"[WARN] File autori non trovato: {autori_json}")
    autori_map = {}
else:
    with open(autori_json, 'r', encoding='utf-8') as f:
        autori_list = json.load(f)
    
    # Crea mappa id_articolo -> autore
    autori_map = {}
    for autore in autori_list:
        id_autore = autore.get('id_autore')
        slug_autore = autore.get('slug')
        nome_completo = autore.get('nome_completo')
        for art_id in autore.get('articoli_ids', []):
            autori_map[art_id] = {
                'id_autore': id_autore,
                'slug': slug_autore,
                'nome_completo': nome_completo
            }
    
    print(f"[OK] Caricati {len(autori_list)} autori")
    print(f"[OK] Mappati {len(autori_map)} articoli ad autori")

# 5. Funzione per pulire HTML (rimuove "Questo articolo è tratto da...")
def pulisci_html(html_content: str) -> str:
    """Rimuove tutto dopo 'Questo articolo è tratto da...'"""
    if not html_content:
        return ""
    
    # Cerca pattern "Questo articolo è tratto da" (case insensitive)
    patterns = [
        r'Questo articolo è tratto da.*',
        r'Questo articolo e tratto da.*',
        r'Questo articolo è tratto da:.*',
        r'<p>Questo articolo è tratto da.*',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, html_content, re.IGNORECASE | re.DOTALL)
        if match:
            html_content = html_content[:match.start()].strip()
            break
    
    return html_content

# 6. Funzione per estrarre slug da URL
def estrai_slug_da_url(url: str) -> Optional[str]:
    """Estrae slug da URL WordPress"""
    if not url:
        return None
    
    # Es: https://www.ombreeluci.it/1983/ombre-e-luci/
    # Es: https://www.ombreeluci.it/?p=43
    if '?p=' in url:
        return None  # URL con query string, non ha slug
    
    parsed = urlparse(url)
    path = parsed.path.strip('/')
    if path:
        # Prendi ultima parte del path
        parts = path.split('/')
        if parts:
            return parts[-1]
    
    return None

# 7. Unifica dati
print("\n[INFO] Unificazione dati...")
database_unificato = []
matched_numeri = 0
matched_autori = 0
puliti_html = 0

for art_id, articolo in articoli_map.items():
    # Base articolo
    record = {
        'id': art_id,
        'url': articolo.get('url', ''),
        'title': articolo.get('meta', {}).get('title', ''),
        'date': articolo.get('meta', {}).get('date', ''),
        'author': articolo.get('meta', {}).get('author', ''),
    }
    
    # Estrai slug se possibile
    slug = estrai_slug_da_url(articolo.get('url', ''))
    if slug:
        record['slug'] = slug
    
    # Aggiungi metadati enriched
    if art_id in enriched_map:
        enriched = enriched_map[art_id]
        record['cluster_id'] = int(enriched.get('cluster_id', 0))
        record['tema_code'] = enriched.get('tema_code', '')
        record['tema_label'] = enriched.get('tema_label', '')
        record['categoria_menu'] = enriched.get('categoria_menu', '')
        record['confidenza_tema'] = float(enriched.get('confidenza_tema', 0)) if enriched.get('confidenza_tema') else 0.0
    else:
        record['cluster_id'] = 0
        record['tema_code'] = ''
        record['tema_label'] = ''
        record['categoria_menu'] = ''
        record['confidenza_tema'] = 0.0
    
    # Match numero rivista: Fonte B (categorie) poi Fonte A (URL da articoli_urls)
    numero_match = None
    
    # Fonte B1: slug categoria "numero-X-YYYY" (es. numero-1-1983)
    categories = articolo.get('tax', {}).get('categories', [])
    numero_slug_categoria = None
    n_slug_categoria = None
    for cat in categories:
        slug = cat.get('slug', '')
        if slug.startswith('numero-'):
            numero_slug_categoria = slug
            break
    if not numero_slug_categoria:
        for cat in categories:
            slug = cat.get('slug', '')
            if re.match(r'^n-\d+$', slug):  # es. n-100
                n_slug_categoria = slug
                break
    
    if numero_slug_categoria:
        match = re.match(r'numero-(\d+)-(\d{4})', numero_slug_categoria)
        if match:
            num_prog = int(match.group(1))
            anno = int(match.group(2))
            for numero in numeri:
                if (numero.get('numero_progressivo') == num_prog and
                    numero.get('anno_pubblicazione') == anno):
                    if numero.get('tipo_rivista') == 'ombre_e_luci':
                        numero_match = numero
                        break
                    elif not numero_match:
                        numero_match = numero
    
    # Fonte B2: slug categoria "n-XXX" (es. n-100)
    if not numero_match and n_slug_categoria and n_slug_categoria in n_slug_to_numero:
        numero_match = n_slug_to_numero[n_slug_categoria]
    
    # Fonte A: match URL (anno + slug) con articoli_urls dei numeri
    if not numero_match and art_id in slugs_by_id:
        slug_art = slugs_by_id.get(str(art_id))
        date_str = articolo.get('meta', {}).get('date', '')
        year_match = re.match(r'(\d{4})', date_str) if date_str else None
        anno_art = int(year_match.group(1)) if year_match else None
        if slug_art and anno_art is not None:
            for year in [anno_art] + [y for y in range(1976, 2027) if y != anno_art]:
                url_candidate = normalize_url(f"https://www.ombreeluci.it/{year}/{slug_art}/")
                if url_candidate in url_to_numero:
                    numero_match = url_to_numero[url_candidate]
                    break
    
    if numero_match:
        matched_numeri += 1
        record['numero_id'] = numero_match.get('id_numero', '')
        record['numero_tipo'] = numero_match.get('tipo_rivista', '')
        record['numero_rivista'] = numero_match.get('numero_progressivo')
        record['anno_rivista'] = numero_match.get('anno_pubblicazione')
        record['numero_title'] = numero_match.get('display_title', '')
        record['pdf_url'] = numero_match.get('archive_download_pdf_url', '')
        record['copertina_url'] = numero_match.get('copertina_url', '')
        record['archive_view_url'] = numero_match.get('archive_view_url', '')
    else:
        record['numero_id'] = None
        record['numero_tipo'] = None
        record['numero_rivista'] = None
        record['anno_rivista'] = None
        record['numero_title'] = None
        record['pdf_url'] = None
        record['copertina_url'] = None
        record['archive_view_url'] = None
    
    # Match autore
    if art_id in autori_map:
        matched_autori += 1
        autore = autori_map[art_id]
        record['autore_id'] = autore.get('id_autore', '')
        record['autore_slug'] = autore.get('slug', '')
        # Mantieni anche nome originale per compatibilità
        if not record['author']:
            record['author'] = autore.get('nome_completo', '')
    else:
        record['autore_id'] = None
        record['autore_slug'] = None
    
    # Pulisci HTML
    html_originale = articolo.get('html_pulito', '')
    html_pulito = pulisci_html(html_originale)
    if html_pulito != html_originale:
        puliti_html += 1
    
    record['html_pulito'] = html_pulito
    
    # Aggiungi tags e categories
    record['categories'] = articolo.get('tax', {}).get('categories', [])
    record['tags'] = articolo.get('tax', {}).get('tags', [])
    
    database_unificato.append(record)

# Ordina per ID
database_unificato.sort(key=lambda x: x['id'])

# 8. Salva
print(f"\n[INFO] Salvataggio database unificato...")
output_file.parent.mkdir(parents=True, exist_ok=True)
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(database_unificato, f, ensure_ascii=False, indent=2)

print(f"\n[OK] Database unificato creato: {output_file}")
print(f"  - Totale record: {len(database_unificato)}")
print(f"  - Match numeri: {matched_numeri} ({matched_numeri/len(database_unificato)*100:.1f}%)")
print(f"  - Match autori: {matched_autori} ({matched_autori/len(database_unificato)*100:.1f}%)")
print(f"  - HTML puliti: {puliti_html} ({puliti_html/len(database_unificato)*100:.1f}%)")

# Mostra esempio articolo cluster-14
print(f"\n[INFO] Esempio articolo cluster-14:")
cluster14_articles = [a for a in database_unificato if a.get('cluster_id') == 14]
if cluster14_articles:
    esempio = cluster14_articles[0]
    print(f"  ID: {esempio['id']}")
    print(f"  Titolo: {esempio['title']}")
    print(f"  Cluster: {esempio['cluster_id']}")
    print(f"  PDF URL: {esempio.get('pdf_url', 'None')}")
    print(f"  Copertina: {esempio.get('copertina_url', 'None')}")
    print(f"  Autore ID: {esempio.get('autore_id', 'None')}")
    print(f"  HTML pulito (primi 200 char): {esempio['html_pulito'][:200]}...")

print("\n" + "="*80)
print("COMPLETATO")
print("="*80)

